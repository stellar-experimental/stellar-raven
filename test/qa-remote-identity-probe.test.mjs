import { createHash } from "node:crypto";
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  REMOTE_IDENTITY_MAX_NETWORK_BUDGET_MS,
  REMOTE_IDENTITY_MAX_RETRY_AFTER_MS,
  REMOTE_IDENTITY_PROBE_PROCESS_TIMEOUT_MS,
  REMOTE_IDENTITY_VECTOR_SCHEMA,
  captureRemoteIdentity,
  remoteIdentityProbeIdentity
} from "../eval/qa/remote-identity-guard.mjs";
import {
  buildRemoteIdentityVector,
  canonicalRemoteSourceSha256,
  captureStablePreArmIdentity,
  fetchJsonWithRetry,
  normalizeLumenloopInventory,
  normalizeStellarDocsTitles,
  parseRetryAfterMs,
  probeRemoteIdentities
} from "../eval/qa/probe-remote-identities.mjs";

function vector() {
  return {
    schema: REMOTE_IDENTITY_VECTOR_SCHEMA,
    services: {
      scout: {
        openapiVersion: "1.9.30",
        canonicalOpenapiSha256: "1".repeat(64)
      },
      lumenloop: {
        advertisedContractIdentity: "openapi-1.0.0",
        canonicalInventorySha256: "2".repeat(64)
      },
      stellarDocs: {
        indexSettingsSha256: "3".repeat(64),
        canonicalTitleSetSha256: "4".repeat(64)
      }
    }
  };
}

function writeProbe(root, body) {
  const command = path.join(root, "probe");
  writeFileSync(command, body);
  chmodSync(command, 0o755);
  const digest = createHash("sha256").update(readFileSync(command)).digest("hex");
  return { command, digest };
}

function identityFor(root, body) {
  const { command, digest } = writeProbe(root, body);
  return remoteIdentityProbeIdentity(command, digest);
}

describe("production remote identity canonicalization", () => {
  it("sorts object keys and preserves array order", () => {
    expect(canonicalRemoteSourceSha256({ b: 2, a: [{ z: 1, y: 2 }] })).toBe(
      canonicalRemoteSourceSha256({ a: [{ y: 2, z: 1 }], b: 2 })
    );
    expect(canonicalRemoteSourceSha256({ values: [1, 2] })).not.toBe(
      canonicalRemoteSourceSha256({ values: [2, 1] })
    );
  });

  it("sorts the advertised Lumenloop tools and workflows", () => {
    const openapi = { info: { version: "1.0.0" }, paths: { "/b": {}, "/a": {} } };
    const tools = {
      success: true,
      data: {
        count: 2,
        hint: "public",
        scope: "guest",
        tools: [{ name: "z" }, { name: "a" }],
        workflows: [{ name: "z" }, { name: "a" }]
      }
    };
    const reversed = structuredClone(tools);
    reversed.data.tools.reverse();
    reversed.data.workflows.reverse();
    const skills = {
      success: true,
      data: {
        count: 2,
        archives: {},
        note: "public skills",
        versions: {},
        skills: [{ name: "z" }, { name: "a" }]
      }
    };
    const reversedSkills = structuredClone(skills);
    reversedSkills.data.skills.reverse();

    expect(normalizeLumenloopInventory(openapi, tools, skills)).toEqual(
      normalizeLumenloopInventory(openapi, reversed, reversedSkills)
    );
  });

  it("normalizes, deduplicates, and sorts the complete Stellar Docs title set", () => {
    const response = {
      nbHits: 3,
      hits: [
        { hierarchy: { lvl1: "B" }, url_without_anchor: "https://developers.stellar.org/b" },
        { hierarchy: { lvl1: "A" }, url_without_anchor: "https://developers.stellar.org/a" },
        { hierarchy: { lvl1: "A" }, url_without_anchor: "https://developers.stellar.org/a" }
      ]
    };
    expect(normalizeStellarDocsTitles(response)).toEqual([
      { path: "/a", title: "A" },
      { path: "/b", title: "B" }
    ]);
    expect(() => normalizeStellarDocsTitles({ ...response, nbHits: 4 })).toThrow(/truncated/);
  });

  it("builds the exact three-service vector without volatile fields", () => {
    const built = buildRemoteIdentityVector({
      scoutOpenapi: { info: { version: "1.9.30" }, paths: {} },
      lumenloopOpenapi: { info: { version: "1.0.0" }, paths: {} },
      lumenloopTools: {
        success: true,
        data: { count: 1, hint: "public", scope: "guest", tools: [{ name: "a" }], workflows: [] }
      },
      lumenloopSkills: {
        success: true,
        data: {
          count: 1,
          archives: {},
          note: "public skills",
          versions: {},
          skills: [{ name: "skill-a" }]
        }
      },
      stellarDocsSettings: { searchableAttributes: ["title"] },
      stellarDocsTitles: {
        nbHits: 1,
        hits: [{ hierarchy: { lvl1: "A" }, url_without_anchor: "https://developers.stellar.org/a" }]
      }
    });
    expect(Object.keys(built.services)).toEqual(["scout", "lumenloop", "stellarDocs"]);
    expect(JSON.stringify(built)).not.toMatch(/captured|timestamp|generatedAt/);
  });
});

const DOCS_PAGE_SIZE = 100;
const DOCS_PAGE_BOUND = 10;

function upstreamSource(url) {
  if (url.endsWith("/api/openapi.json")) return { info: { version: "1.9.30" }, paths: {} };
  if (url.endsWith("/v1/openapi.json")) return { info: { version: "1.0.0" }, paths: {} };
  if (url.endsWith("/v1/tools")) {
    return {
      success: true,
      data: { count: 1, hint: "public", scope: "guest", tools: [{ name: "a" }], workflows: [] }
    };
  }
  if (url.endsWith("/v1/skills")) {
    return {
      success: true,
      data: { count: 1, archives: {}, note: "public skills", versions: {}, skills: [{ name: "skill-a" }] }
    };
  }
  if (url.endsWith("/settings")) return { searchableAttributes: ["title"] };
  return null;
}

function docsTitleHits(nbHits) {
  return Array.from({ length: nbHits }, (_, index) => ({
    hierarchy: { lvl1: `Title ${index % 3 === 0 ? index - 1 : index}` },
    url_without_anchor: `https://developers.stellar.org/docs/page-${(nbHits - index) % 97}`
  }));
}

// Serves each title query by its own page, as Algolia does with a 100-hit key cap.
function docsTitlePage(page, { nbHits, hits = docsTitleHits(nbHits) }) {
  const nbPages = Math.min(DOCS_PAGE_BOUND, Math.ceil(nbHits / DOCS_PAGE_SIZE));
  return {
    page,
    nbPages,
    nbHits,
    hitsPerPage: DOCS_PAGE_SIZE,
    hits: hits.slice(page * DOCS_PAGE_SIZE, (page + 1) * DOCS_PAGE_SIZE)
  };
}

function upstream(state, { mutateResults = (results) => results } = {}) {
  const requests = [];
  const titleBatches = [];
  const fetchImpl = async (url, init = {}) => {
    requests.push(url);
    const response = (value) => ({ ok: true, status: 200, text: async () => JSON.stringify(value) });
    const source = upstreamSource(url);
    if (source) return response(source);
    const pages = JSON.parse(init.body).requests.map((request) => {
      const params = new URLSearchParams(request.params);
      expect(params.get("hitsPerPage")).toBe("1000");
      expect(params.get("filters")).toBe("type:lvl1");
      return Number(params.get("page"));
    });
    titleBatches.push(pages);
    return response({ results: mutateResults(pages.map((page) => docsTitlePage(page, state))) });
  };
  return { fetchImpl, requests, titleBatches };
}

function expectedVector(state) {
  const hits = state.hits ?? docsTitleHits(state.nbHits);
  return buildRemoteIdentityVector({
    scoutOpenapi: upstreamSource("/api/openapi.json"),
    lumenloopOpenapi: upstreamSource("/v1/openapi.json"),
    lumenloopTools: upstreamSource("/v1/tools"),
    lumenloopSkills: upstreamSource("/v1/skills"),
    stellarDocsSettings: upstreamSource("/settings"),
    stellarDocsTitles: { nbHits: state.nbHits, hits }
  });
}

describe("production remote identity Stellar Docs title capture", () => {
  it("makes two Algolia calls and reads every bounded title page in one request", async () => {
    const { fetchImpl, requests, titleBatches } = upstream({ nbHits: 650 });
    await probeRemoteIdentities({ fetchImpl, retryDelaysMs: [] });

    expect(requests).toHaveLength(6);
    expect(requests.filter((url) => url.includes(".algolia.net/"))).toHaveLength(2);
    expect(titleBatches).toEqual([[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]]);
  });

  it.each([
    ["one page", 1],
    ["one full page", 100],
    ["seven pages", 650],
    ["the ten-page bound", 1_000]
  ])("builds the vector from the complete title set for %s", async (_label, nbHits) => {
    const { fetchImpl } = upstream({ nbHits });
    const vector = await probeRemoteIdentities({ fetchImpl, retryDelaysMs: [] });
    // The previous probe passed exactly these hits, in page order, to the same builder.
    expect(JSON.stringify(vector)).toBe(JSON.stringify(expectedVector({ nbHits })));
  });

  it("changes the title hash when one title changes", async () => {
    const hits = docsTitleHits(650);
    const changed = structuredClone(hits);
    changed[640].hierarchy.lvl1 = "Changed title";
    const original = await probeRemoteIdentities({ fetchImpl: upstream({ nbHits: 650, hits }).fetchImpl, retryDelaysMs: [] });
    const updated = await probeRemoteIdentities({
      fetchImpl: upstream({ nbHits: 650, hits: changed }).fetchImpl,
      retryDelaysMs: []
    });
    expect(updated.services.stellarDocs.canonicalTitleSetSha256)
      .not.toBe(original.services.stellarDocs.canonicalTitleSetSha256);
  });

  it.each([
    ["a missing page result", (results) => results.slice(1), /title pages are incomplete/],
    ["an extra page result", (results) => [...results, results[0]], /title pages are incomplete/],
    ["a zero page count", (results) => results.map((result) => ({ ...result, nbPages: 0 })), /page count is invalid/],
    [
      "a page count over the bound",
      (results) => results.map((result) => ({ ...result, nbPages: 11 })),
      /page count is invalid/
    ],
    [
      "a wrong page number",
      (results) => results.map((result, index) => index === 3 ? { ...result, page: 4 } : result),
      /pagination changed/
    ],
    [
      "a different page count on one page",
      (results) => results.map((result, index) => index === 2 ? { ...result, nbPages: 6 } : result),
      /pagination changed/
    ],
    [
      "a different hit count on an unused page",
      (results) => results.map((result, index) => index === 9 ? { ...result, nbHits: 651 } : result),
      /pagination changed/
    ],
    [
      "hits on a page past the reported page count",
      (results) => results.map((result, index) => index === 7 ? { ...result, hits: results[0].hits } : result),
      /pagination changed/
    ],
    [
      "a missing hit list",
      (results) => results.map((result, index) => index === 1 ? { ...result, hits: undefined } : result),
      /pagination changed/
    ],
    [
      "a short used page",
      (results) => results.map((result, index) => index === 4 ? { ...result, hits: result.hits.slice(1) } : result),
      /title response is truncated/
    ]
  ])("rejects %s", async (_label, mutateResults, message) => {
    const { fetchImpl } = upstream({ nbHits: 650 }, { mutateResults });
    await expect(probeRemoteIdentities({ fetchImpl, retryDelaysMs: [] })).rejects.toThrow(message);
  });

  it("rejects a title set that the pagination bound truncates", async () => {
    const { fetchImpl } = upstream({ nbHits: 1_001 });
    await expect(probeRemoteIdentities({ fetchImpl, retryDelaysMs: [] })).rejects.toThrow(/truncated/);
  });
});

describe("production remote identity retries", () => {
  it("aligns the process timeout with one complete retry phase", () => {
    expect(REMOTE_IDENTITY_MAX_NETWORK_BUDGET_MS).toBe(70_000);
    expect(REMOTE_IDENTITY_PROBE_PROCESS_TIMEOUT_MS).toBe(75_000);
  });

  it.each([
    ["capped delta", "120", 0, REMOTE_IDENTITY_MAX_RETRY_AFTER_MS],
    ["HTTP date", new Date(4_000).toUTCString(), 1_000, 3_000],
    ["past HTTP date", new Date(1_000).toUTCString(), 4_000, 0],
    ["negative value", "-1", 0, null],
    ["invalid value", "not-a-delay", 0, null]
  ])("parses a %s Retry-After value safely", (_label, value, nowMs, expected) => {
    expect(parseRetryAfterMs(value, { nowMs })).toBe(expected);
  });

  it("uses a capped Retry-After delay without exposing the header", async () => {
    const delays = [];
    const retries = [];
    let attempt = 0;
    await fetchJsonWithRetry(
      { label: "test source", url: "https://example.invalid" },
      {
        fetchImpl: async () => {
          attempt += 1;
          return attempt === 1
            ? {
                ok: false,
                status: 429,
                headers: { get: () => "120" },
                text: async () => ""
              }
            : { ok: true, status: 200, text: async () => "{\"ok\":true}" };
        },
        retryDelaysMs: [250],
        sleepImpl: async (delay) => delays.push(delay),
        onRetry: (entry) => retries.push(entry)
      }
    );
    expect(delays).toEqual([REMOTE_IDENTITY_MAX_RETRY_AFTER_MS]);
    expect(retries).toEqual([
      expect.objectContaining({ reason: "HTTP 429", delayMs: REMOTE_IDENTITY_MAX_RETRY_AFTER_MS })
    ]);
    expect(JSON.stringify(retries)).not.toContain("120");
  });

  it("uses bounded deterministic retries for transient failures", async () => {
    const statuses = [503, 429, 200];
    const delays = [];
    const retries = [];
    const value = await fetchJsonWithRetry(
      { label: "test source", url: "https://example.invalid" },
      {
        fetchImpl: async () => {
          const status = statuses.shift();
          return { ok: status === 200, status, text: async () => "{\"ok\":true}" };
        },
        retryDelaysMs: [7, 11],
        sleepImpl: async (delay) => delays.push(delay),
        onRetry: (entry) => retries.push(entry)
      }
    );
    expect(value).toEqual({ ok: true });
    expect(delays).toEqual([7, 11]);
    expect(retries.map((entry) => entry.reason)).toEqual(["HTTP 503", "HTTP 429"]);
  });

  it("stops after the configured retry bound", async () => {
    let attempts = 0;
    await expect(fetchJsonWithRetry(
      { label: "test source", url: "https://example.invalid" },
      {
        fetchImpl: async () => {
          attempts += 1;
          throw new Error("private network detail");
        },
        retryDelaysMs: [0, 0],
        sleepImpl: async () => {}
      }
    )).rejects.toThrow(/network error/);
    expect(attempts).toBe(3);
  });

  it("requires three matching pre-arm captures", async () => {
    const captures = [vector(), vector(), vector()];
    const delays = [];
    const hash = await captureStablePreArmIdentity({
      probe: async () => captures.shift(),
      sleepImpl: async (delay) => delays.push(delay)
    });
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(delays).toEqual([300_000, 300_000]);

    const changed = vector();
    changed.services.scout.openapiVersion = "1.9.31";
    const changedCaptures = [vector(), changed];
    await expect(captureStablePreArmIdentity({
      probe: async () => changedCaptures.shift(),
      captureCount: 2,
      intervalMs: 0,
      sleepImpl: async () => {}
    })).rejects.toThrow(/changed during pre-arm/);
  });
});

describe("remote identity probe process boundary", () => {
  it("uses the complete retry budget as its default outer timeout", () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "qa-remote-probe-"));
    try {
      const identity = identityFor(root, "#!/bin/sh\nexit 0\n");
      let spawnOptions;
      expect(captureRemoteIdentity(identity, {
        spawnSyncImpl: (_command, _args, options) => {
          spawnOptions = options;
          return { status: 0, signal: null, stdout: JSON.stringify(vector()), stderr: "" };
        }
      })).toEqual(vector());
      expect(spawnOptions.timeout).toBe(REMOTE_IDENTITY_PROBE_PROCESS_TIMEOUT_MS);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("captures a valid vector and passes only the minimal environment", () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "qa-remote-probe-"));
    const previous = process.env.QA_REMOTE_PROBE_PARENT_SECRET;
    process.env.QA_REMOTE_PROBE_PARENT_SECRET = "must-not-cross";
    try {
      const output = JSON.stringify(vector());
      const identity = identityFor(
        root,
        `#!/bin/sh\nif [ -n "$QA_REMOTE_PROBE_PARENT_SECRET" ]; then exit 9; fi\nprintf '%s\\n' '${output}'\n`
      );
      expect(captureRemoteIdentity(identity)).toEqual(vector());
    } finally {
      if (previous === undefined) delete process.env.QA_REMOTE_PROBE_PARENT_SECRET;
      else process.env.QA_REMOTE_PROBE_PARENT_SECRET = previous;
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects a probe that changes after its pin", () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "qa-remote-probe-"));
    try {
      const identity = identityFor(root, `#!/bin/sh\nprintf '%s\\n' '${JSON.stringify(vector())}'\n`);
      writeFileSync(identity.resolvedPath, "\n# changed\n", { flag: "a" });
      expect(() => captureRemoteIdentity(identity)).toThrow(/kind=hash-mismatch/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it.each([
    ["nonzero-exit", "#!/bin/sh\nprintf '%s\\n' 'secret stderr' >&2\nexit 3\n", {}, { status: 3, timedOut: false }],
    ["timeout", "#!/bin/sh\nsleep 1\n", { timeoutMs: 20 }, { status: null, timedOut: true }],
    ["output-overflow", "#!/usr/bin/env node\nprocess.stdout.write('x'.repeat(4096));\n", { maxBufferBytes: 128 }, { timedOut: false }]
  ])("reports safe diagnostics for %s", (kind, body, options, expected) => {
    const root = mkdtempSync(path.join(os.tmpdir(), "qa-remote-probe-"));
    try {
      const identity = identityFor(root, body);
      let caught;
      try {
        captureRemoteIdentity(identity, options);
      } catch (error) {
        caught = error;
      }
      expect(caught.diagnostics).toMatchObject({ kind, path: "probe", ...expected });
      expect(JSON.stringify(caught)).not.toContain("secret stderr");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects a missing probe and a directory", () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "qa-remote-probe-"));
    try {
      expect(() => remoteIdentityProbeIdentity(
        path.join(root, "missing"),
        "a".repeat(64)
      )).toThrow(/kind=missing/);
      const directory = path.join(root, "directory");
      mkdirSync(directory);
      expect(() => remoteIdentityProbeIdentity(directory, "a".repeat(64))).toThrow(/kind=not-file/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
