/**
 * Sandbox-surface tests — the providers `execute` wires into the Dynamic
 * Worker, exercised directly (pure Node; the isolate itself is covered by
 * the live integration script test/live/run-live-execute.mjs).
 */
import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadManifest, type Catalog } from "../src/catalog/search.ts";
import { buildSandbox, hasServiceData, type OpLedgerCall } from "../src/executor/providers.ts";
import type { FetchLike } from "../src/adapters/types.ts";
import { MemoryR2Bucket } from "./helpers/memory-r2.ts";
import { lazyPinnedSkillSource as skillSource } from "./helpers/skill-source.ts";
import type { SkillSource } from "../src/skills/source.ts";
import {
  put as putArtifact,
  type ArtifactPutInput
} from "../src/artifacts/store.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalog: Catalog = loadManifest(
  JSON.parse(readFileSync(join(ROOT, "catalog", "manifest.json"), "utf8"))
);
// Skill bodies come from the pinned upstream commit, not a vendored copy — the
// providers only ever see a SkillSource (test/helpers/skill-source.ts).

const env = {
  LUMENLOOP_API_KEY: "test-key-not-real-1234",
  ALGOLIA_APPLICATION_ID_DOCS: "TESTAPPID",
  ALGOLIA_API_KEY_DOCS: "test-algolia-key-1234"
};

function artifactInput(overrides: Partial<ArtifactPutInput> = {}): ArtifactPutInput {
  return {
    body: JSON.stringify({ rows: [{ id: 1, value: "full" }] }),
    mime: "application/json",
    capTokens: 6000,
    originalChars: 34,
    opLedger: [{ op: "scout.getProject", status: "ok", ms: 12 }],
    catalogGeneratedAt: catalog.generatedAt,
    now: new Date(),
    ...overrides
  };
}

type Sandbox = ReturnType<typeof buildSandbox>;
function fnsOf(providers: Sandbox, name: string) {
  const p = providers.find((x) => x.name === name);
  if (!p) throw new Error(`missing provider ${name}`);
  return p.fns;
}

describe("host structural service evidence", () => {
  it.each([
    ["positive rows", { projects: [{ slug: "soroswap" }], meta: { total: 1 } }, true],
    ["detail data with an empty auxiliary collection", { name: "Reflector", tags: [] }, true],
    ["empty array", [], false],
    ["metadata with empty row containers", { projects: [], repos: [], meta: { total: 0 } }, false],
    [
      "metadata with populated arrays",
      { projects: [], meta: { facets: ["defi"] }, pagination: { pages: [1, 2] } },
      false
    ],
    ["mixed row containers", { projects: [], repos: [{ fullName: "example/repo" }] }, true]
  ])("classifies %s without changing the service payload", (_label, payload, expected) => {
    expect(hasServiceData(payload)).toBe(expected);
  });

  it("keeps error and soft-empty envelopes out of successful payload evidence", async () => {
    const calls: OpLedgerCall[] = [];
    const fetchImpl: FetchLike = async (_url, init) => {
      const { query } = JSON.parse(String(init?.body)) as { query: string };
      return query === "error"
        ? new Response(JSON.stringify({ success: false, error: "upstream failure" }), {
            status: 500,
            headers: { "content-type": "application/json" }
          })
        : new Response(
            JSON.stringify({ success: true, data: { text: "unknown project" }, meta: { format: "text" } }),
            { status: 200, headers: { "content-type": "application/json" } }
          );
    };
    const providers = buildSandbox(catalog, skillSource, env, {
      fetchImpl,
      onOpCall: (call) => calls.push(call)
    });
    await fnsOf(providers, "lumenloop").search_directory!({ query: "error" });
    await fnsOf(providers, "lumenloop").search_directory!({ query: "soft-empty" });
    expect(calls).toMatchObject([
      { outcome: "error", hasServiceData: undefined },
      { outcome: "soft-empty", hasServiceData: undefined }
    ]);
  });

  it("captures only the named source-metadata locations", async () => {
    const calls: OpLedgerCall[] = [];
    const fetchImpl: FetchLike = async () =>
      Response.json({
        rfps: [],
        meta: {
          generatedAt: "2026-08-26T12:00:00Z",
          counts: { returned: 0, total: 14 },
          scfRound: {
            asOf: "2026-08-26",
            currentRound: 40,
            currentPhase: "submission",
            submissionWindow: { closes: "2026-09-01T00:00:00Z", secret: "excluded" }
          },
          arbitrary: { generatedAt: "excluded" }
        },
        rows: [{ asOf: "excluded" }]
      });
    const providers = buildSandbox(catalog, skillSource, env, {
      fetchImpl,
      onOpCall: (call) => calls.push(call)
    });

    await fnsOf(providers, "scout").getRfps!({});

    expect(calls).toHaveLength(1);
    expect(calls[0]?.sourceMetadata).toEqual([
      { path: "data.meta.generatedAt", value: "2026-08-26T12:00:00Z" },
      { path: "data.meta.counts.total", value: 14 },
      { path: "data.meta.scfRound.asOf", value: "2026-08-26" },
      { path: "data.meta.scfRound.currentRound", value: 40 },
      { path: "data.meta.scfRound.currentPhase", value: "submission" },
      {
        path: "data.meta.scfRound.submissionWindow.closes",
        value: "2026-09-01T00:00:00Z"
      }
    ]);
    expect(JSON.stringify(calls[0]?.sourceMetadata)).not.toContain("excluded");
  });
});

describe("sandbox surface shape", () => {
  const providers = buildSandbox(catalog, skillSource, env);

  it("exposes exactly the three service namespaces plus codemode", () => {
    expect(providers.map((p) => p.name).sort()).toEqual([
      "codemode",
      "lumenloop",
      "scout",
      "stellarDocs"
    ]);
  });

  it("exposes one fn per operation entry, named by the id's terminal segment", () => {
    const ops = catalog.entries.filter((e) => e.kind === "operation");
    let counted = 0;
    for (const e of ops) {
      const name = e.id.split(".").pop()!;
      expect(fnsOf(providers, e.service)[name], `missing ${e.id}`).toBeTypeOf("function");
      counted += 1;
    }
    expect(counted).toBe(ops.length); // 21 + 24 + 12
    // skills are NOT callable operations
    expect(providers.find((p) => p.name === "skills")).toBeUndefined();
  });

  it("codemode has spec, search, catalog, describe, skills/artifacts + the nested preludes", () => {
    const codemode = providers.find((p) => p.name === "codemode")!;
    expect(Object.keys(codemode.fns).sort()).toEqual([
      "artifact_info",
      "artifact_read",
      "catalog",
      "describe",
      "search",
      "skill_read",
      "skill_run",
      "spec"
    ]);
    expect(codemode.prelude).toContain("codemode.skill =");
    expect(codemode.prelude).toContain("codemode.artifact =");
  });

  it("can disable codemode discovery helpers for the public demo while leaving skills wired", () => {
    const demoProviders = buildSandbox(catalog, skillSource, env, { codemodeDiscovery: false });
    const codemode = demoProviders.find((p) => p.name === "codemode")!;
    expect(Object.keys(codemode.fns).sort()).toEqual(["artifact_info", "artifact_read", "skill_read", "skill_run"]);
    expect(codemode.prelude).toContain("codemode.skill =");
    expect(codemode.prelude).toContain("codemode.artifact =");
  });

  it("keeps broad codemode discovery enabled by default", () => {
    const defaultProviders = buildSandbox(catalog, skillSource, env);
    const codemode = defaultProviders.find((p) => p.name === "codemode")!;
    expect(codemode.fns.search).toBeTypeOf("function");
    expect(codemode.fns.catalog).toBeTypeOf("function");
    expect(codemode.fns.spec).toBeTypeOf("function");
    expect(codemode.fns.describe).toBeTypeOf("function");
  });

  it("the skill prelude carries the run wrapper: flat skill_run dispatch + the shared envelope guard", () => {
    const codemode = providers.find((p) => p.name === "codemode")!;
    // run is read's sibling over the flat dispatch (design §6) …
    expect(codemode.prelude).toContain("run: async (name, input)");
    expect(codemode.prelude).toContain("codemode.skill_run(name, input)");
    // … and RETURNS the service envelope through the SAME guard operations
    // get (no .data-trap inversion — that is skill.read's shape, not run's).
    expect(codemode.prelude).toContain('__guardEnvelope(raw, "codemode.skill.run")');
  });
});

describe("codemode.artifact provider", () => {
  it("ownerless sessions get a generic unavailable envelope", async () => {
    const bucket = new MemoryR2Bucket() as unknown as R2Bucket;
    const codemode = fnsOf(buildSandbox(catalog, skillSource, env, { artifact: { bucket } }), "codemode");

    await expect(codemode.artifact_info!("not-an-id")).resolves.toMatchObject({
      ok: false,
      error: { kind: "error", message: "artifact is unavailable for this request" }
    });
    await expect(codemode.artifact_read!("not-an-id")).resolves.toMatchObject({
      ok: false,
      error: { kind: "error", message: "artifact is unavailable for this request" }
    });
  });

  it("maps missing, wrong-owner, expired, and invalid ids to one standard error envelope", async () => {
    const bucket = new MemoryR2Bucket() as unknown as R2Bucket;
    const fresh = await putArtifact(bucket, "owner-a", artifactInput());
    if (!fresh.ok) throw new Error("unexpected skip");
    const expired = await putArtifact(
      bucket,
      "owner-b",
      artifactInput({ now: new Date("2020-01-01T00:00:00.000Z") })
    );
    if (!expired.ok) throw new Error("unexpected skip");

    const codemode = fnsOf(
      buildSandbox(catalog, skillSource, env, { artifact: { bucket, owner: "owner-b" } }),
      "codemode"
    );
    const notFound = { ok: false, error: { service: "artifact", kind: "error", message: "artifact not found" } };

    await expect(codemode.artifact_read!(fresh.artifact.id)).resolves.toEqual(notFound);
    await expect(codemode.artifact_read!(crypto.randomUUID())).resolves.toEqual(notFound);
    await expect(codemode.artifact_read!(expired.artifact.id)).resolves.toEqual(notFound);
    await expect(codemode.artifact_read!("../bad")).resolves.toEqual(notFound);
  });

  it("reads full data into the sandbox and enforces the per-execute read cap", async () => {
    const bucket = new MemoryR2Bucket() as unknown as R2Bucket;
    const written = await putArtifact(bucket, "owner-a", artifactInput());
    if (!written.ok) throw new Error("unexpected skip");
    const stats: Array<{ count: number; bytes: number }> = [];
    const codemode = fnsOf(
      buildSandbox(catalog, skillSource, env, {
        artifact: {
          bucket,
          owner: "owner-a",
          onReadStats: (s) => stats.push(s)
        }
      }),
      "codemode"
    );

    for (let i = 0; i < 4; i++) {
      await expect(codemode.artifact_read!(written.artifact.id)).resolves.toEqual({
        ok: true,
        data: { rows: [{ id: 1, value: "full" }] }
      });
    }
    await expect(codemode.artifact_read!(written.artifact.id)).resolves.toMatchObject({
      ok: false,
      error: { kind: "error", message: "artifact read cap exceeded: max 4 reads per execute" }
    });
    expect(stats.at(-1)).toEqual({ count: 5, bytes: written.artifact.bytes * 4 });
  });

  it("caps artifact_info per execute and logs hit/miss telemetry with bytes zero", async () => {
    const bucket = new MemoryR2Bucket() as unknown as R2Bucket;
    const written = await putArtifact(bucket, "owner-a", artifactInput({ requestId: "req-info", rayId: "ray-info" }));
    if (!written.ok) throw new Error("unexpected skip");
    const codemode = fnsOf(
      buildSandbox(catalog, skillSource, env, {
        artifact: {
          bucket,
          owner: "owner-a"
        }
      }),
      "codemode"
    );
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      const infoResult = await codemode.artifact_info!(written.artifact.id);
      expect(infoResult).toMatchObject({
        ok: true,
        data: {
          id: written.artifact.id,
          requestId: "req-info",
          rayId: "ray-info"
        }
      });
      expect(infoResult).not.toHaveProperty("data.key");
      await expect(codemode.artifact_info!(crypto.randomUUID())).resolves.toMatchObject({
        ok: false,
        error: { kind: "error", message: "artifact not found" }
      });
      for (let i = 0; i < 6; i++) {
        await codemode.artifact_info!(written.artifact.id);
      }
      await expect(codemode.artifact_info!(written.artifact.id)).resolves.toMatchObject({
        ok: false,
        error: { kind: "error", message: "artifact info cap exceeded: max 8 info calls per execute" }
      });

      const infoEvents = logSpy.mock.calls
        .map((call) => {
          try {
            return JSON.parse(String(call[0])) as {
              evt?: string;
              kind?: string;
              hit?: boolean;
              bytes?: number;
              reason?: string | null;
            };
          } catch {
            return null;
          }
        })
        .filter((event): event is { evt: string; kind: string; hit: boolean; bytes: number; reason?: string | null } => event?.evt === "artifact_read" && event.kind === "info");

      expect(infoEvents[0]).toMatchObject({ hit: true, bytes: 0 });
      expect(infoEvents[1]).toMatchObject({ hit: false, bytes: 0, reason: "not-found" });
      expect(infoEvents.at(-1)).toMatchObject({ hit: false, bytes: 0, reason: "info-cap" });
    } finally {
      logSpy.mockRestore();
    }
  });

  it("logs a stable per-event read ordinal under concurrent successful reads", async () => {
    const bucket = new MemoryR2Bucket() as unknown as R2Bucket;
    const written = await putArtifact(bucket, "owner-a", artifactInput());
    if (!written.ok) throw new Error("unexpected skip");
    const stats: Array<{ count: number; bytes: number }> = [];
    const codemode = fnsOf(
      buildSandbox(catalog, skillSource, env, {
        artifact: {
          bucket,
          owner: "owner-a",
          onReadStats: (s) => stats.push(s)
        }
      }),
      "codemode"
    );
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      await Promise.all(Array.from({ length: 4 }, () => codemode.artifact_read!(written.artifact.id)));
      const readCounts = logSpy.mock.calls
        .map((call) => {
          try {
            return JSON.parse(String(call[0])) as { evt?: string; kind?: string; hit?: boolean; readCount?: number };
          } catch {
            return null;
          }
        })
        .filter((event): event is { evt: string; kind: string; hit: boolean; readCount: number } => event?.evt === "artifact_read" && event.kind === "read" && event.hit === true)
        .map((event) => event.readCount)
        .sort((a, b) => a - b);

      expect(readCounts).toEqual([1, 2, 3, 4]);
      expect(stats.at(-1)).toEqual({ count: 4, bytes: written.artifact.bytes * 4 });
    } finally {
      logSpy.mockRestore();
    }
  });
});

describe("dispatch behavior (error-as-data, exposure, parallelism)", () => {
  it("build-excluded ops have NO sandbox fn at all (ADR-0003: nothing uncallable exists)", () => {
    const providers = buildSandbox(catalog, skillSource, env);
    const scout = fnsOf(providers, "scout");
    expect(scout.submitPartnerListing).toBeUndefined();
    expect(scout.submitFeedback).toBeUndefined();
    expect(scout.partnerAssistant).toBeUndefined();
    const lumenloop = fnsOf(providers, "lumenloop");
    expect(lumenloop.request_research).toBeUndefined();
  });

  it("invalid args are refused before any network call", async () => {
    let fetched = 0;
    const fetchImpl: FetchLike = async () => {
      fetched += 1;
      return new Response("{}", { status: 200 });
    };
    const providers = buildSandbox(catalog, skillSource, env, { fetchImpl });
    const r = (await fnsOf(providers, "lumenloop").search_directory!({ limit: 2 })) as {
      ok: boolean;
      error: { kind: string; message: string };
    };
    expect(r.ok).toBe(false);
    expect(r.error.message).toContain("no call was made");
    expect(fetched).toBe(0);
  });

  it("refuses an unknown Lumenloop document sort before any network call", async () => {
    let fetched = 0;
    const fetchImpl: FetchLike = async () => {
      fetched += 1;
      return new Response("{}", { status: 200 });
    };
    const providers = buildSandbox(catalog, skillSource, env, { fetchImpl });
    const r = (await fnsOf(providers, "lumenloop").list_documents!({
      collection: "jobs",
      sort: "definitely_not_a_real_sort_key"
    })) as { ok: boolean; error: { kind: string; message: string } };
    expect(r.ok).toBe(false);
    expect(r.error.kind).toBe("error");
    expect(r.error.message).toContain("no call was made");
    expect(fetched).toBe(0);
  });

  it("runs independent calls concurrently (Promise.all fan-out is safe)", async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    const fetchImpl: FetchLike = async (url) => {
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((r) => setTimeout(r, 20));
      inFlight -= 1;
      const body = url.includes("algolia")
        ? JSON.stringify({ hits: [{ url: "https://developers.stellar.org/docs/x", hierarchy: {} }], nbHits: 1, page: 0, nbPages: 1, hitsPerPage: 5 })
        : JSON.stringify({ success: true, data: { count: 0, projects: [] }, error: null, meta: { format: "json" } });
      return new Response(body, { status: 200, headers: { "content-type": "application/json" } });
    };
    const providers = buildSandbox(catalog, skillSource, env, { fetchImpl });
    const [a, b, c] = (await Promise.all([
      fnsOf(providers, "lumenloop").search_directory!({ query: "x" }),
      fnsOf(providers, "scout").getStatus!({}),
      fnsOf(providers, "stellarDocs").search_docs!({ query: "fees" })
    ])) as { ok: boolean }[];
    expect(a!.ok && b!.ok && c!.ok).toBe(true);
    expect(maxInFlight).toBeGreaterThanOrEqual(2); // truly overlapping, no shared-state serialization
  });

  it("redacts accidental secret echoes in adapter results", async () => {
    const fetchImpl: FetchLike = async () =>
      new Response(
        JSON.stringify({
          success: true,
          data: { note: "echo test-key-not-real-1234 end" },
          error: null,
          meta: { format: "json" }
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      );
    const providers = buildSandbox(catalog, skillSource, env, { fetchImpl });
    const r = await fnsOf(providers, "lumenloop").get_categories!({});
    expect(JSON.stringify(r)).not.toContain("test-key-not-real-1234");
    expect(JSON.stringify(r)).toContain("[REDACTED]");
  });
});

// Mimic codemode's generated evaluate() scope: one mutable namespace object
// per provider (own-property get/set — same observable behavior as the
// generated Proxy, whose get trap checks own properties first and whose
// default set trap lands on the target), then run the concatenated
// preludes over them exactly as the executor module does. Shared by the
// envelope-guard and skill.read-guard suites so the scope reconstruction
// cannot drift from itself.
function guardedNamespaces(
  fetchImpl?: FetchLike,
  beforePrelude?: (namespaces: Record<string, Record<string, unknown>>) => void
) {
  const providers = buildSandbox(catalog, skillSource, env, fetchImpl ? { fetchImpl } : undefined);
  const ns: Record<string, Record<string, unknown>> = {};
  for (const p of providers) ns[p.name] = { ...p.fns };
  beforePrelude?.(ns);
  const preludes = providers.map((p) => p.prelude ?? "").join("\n");
  new Function(...Object.keys(ns), preludes)(...Object.values(ns));
  return ns as Record<string, Record<string, (args?: unknown) => Promise<unknown>>>;
}

async function guardSyntheticPayload<T>(payload: T): Promise<{ ok: true; data: T }> {
  const ns = guardedNamespaces(undefined, (namespaces) => {
    namespaces.lumenloop!.search_directory = async () => ({ ok: true, data: payload });
  });
  return (await ns.lumenloop!.search_directory!({ query: "synthetic" })) as {
    ok: true;
    data: T;
  };
}

describe("envelope guard prelude (fail-loud wrong-level access)", () => {

  const directoryFetch: FetchLike = async () =>
    new Response(
      JSON.stringify({
        success: true,
        data: { count: 1, projects: [{ slug: "soroswap" }] },
        error: null,
        meta: { format: "json" }
      }),
      { status: 200, headers: { "content-type": "application/json" } }
    );

  it("ok envelope: payload-key access on the envelope throws a pointer to .data, correct access untouched", async () => {
    const ns = guardedNamespaces(directoryFetch);
    const r = (await ns.lumenloop!.search_directory!({ query: "soroswap" })) as {
      ok: boolean;
      data: { count: number; projects: { slug: string }[] };
    };
    expect(r.ok).toBe(true);
    expect(r.data.projects[0]!.slug).toBe("soroswap"); // correct path untouched
    expect(() => (r as Record<string, unknown>).projects).toThrow(/use r\.data\.projects/);
    expect(() => (r as Record<string, unknown>).count).toThrow(/use r\.data\.count/);
  });

  it("object payload: direct object and nested array access stay unchanged", async () => {
    const docsFetch: FetchLike = async () =>
      Response.json({
        hits: [
          {
            url: "https://developers.stellar.org/docs/learn/fundamentals/fees",
            hierarchy: { lvl0: "Learn", lvl1: "Fees" }
          }
        ],
        nbHits: 1,
        page: 0,
        nbPages: 1,
        hitsPerPage: 5
      });
    const ns = guardedNamespaces(docsFetch);
    const r = (await ns.stellarDocs!.search_docs!({ query: "fees" })) as {
      data: Record<string, unknown> & { hits: Array<{ url: string }> };
    };

    expect(r.data.hits.map((hit) => hit.url)).toEqual([
      "https://developers.stellar.org/docs/learn/fundamentals/fees"
    ]);
    expect(r.data.nbHits).toBe(1);
  });

  it("array payload: map, filter, length, and iteration stay unchanged", async () => {
    const arrayFetch: FetchLike = async () =>
      Response.json({ success: true, data: ["payments", "defi"], error: null });
    const ns = guardedNamespaces(arrayFetch);
    const r = (await ns.lumenloop!.get_categories!({})) as { data: string[] };

    expect(r.data.map((value) => value.toUpperCase())).toEqual(["PAYMENTS", "DEFI"]);
    expect(r.data.filter((value) => value.startsWith("d"))).toEqual(["defi"]);
    expect(r.data.length).toBe(2);
    expect([...r.data]).toEqual(["payments", "defi"]);
  });

  it("payload meta is trapped too: r.meta on a scout-shaped envelope points at r.data.meta", async () => {
    // scout payloads carry their own meta{} — it lives at r.data.meta now
    // that the envelope has no meta of its own.
    const scoutFetch: FetchLike = async () =>
      new Response(JSON.stringify({ projects: [], meta: { total: 0 } }), {
        status: 200,
        headers: { "content-type": "application/json" }
      });
    const ns = guardedNamespaces(scoutFetch);
    const r = (await ns.scout!.searchProjects!({ q: "soroswap" })) as Record<string, unknown>;
    expect(() => r.meta).toThrow(/use r\.data\.meta/);
  });

  it("error envelope: r.data is undefined (no throw) with ONE deduped [envelope] warning; .error stays readable", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const envelopeLines = () =>
      logSpy.mock.calls.map((c) => String(c[0])).filter((l) => l.startsWith("[envelope]"));
    try {
      const ns = guardedNamespaces();
      const r = (await ns.lumenloop!.search_directory!({ limit: 2 })) as {
        ok: boolean;
        data?: unknown;
        error: { kind: string };
      };
      expect(r.ok).toBe(false); // guard refusal: missing required query, no network
      expect(r.error.kind).toBe("error"); // legit failure introspection untouched
      expect(r.data).toBeUndefined(); // no throw
      expect(envelopeLines()).toHaveLength(1);
      expect(envelopeLines()[0]).toContain("lumenloop.search_directory");
      expect(envelopeLines()[0]).toContain('error.kind="error"');
      expect(envelopeLines()[0]).toContain("Branch on r.ok and read r.error.");
      // second read of the same op+kind: deduped, no new line
      expect(r.data).toBeUndefined();
      expect(envelopeLines()).toHaveLength(1);
      // a different op/kind warns once more
      const r2 = (await ns.stellarDocs!.search_docs!({})) as {
        ok: boolean;
        data?: unknown;
      };
      expect(r2.ok).toBe(false); // invalid args → guard refusal
      expect(r2.data).toBeUndefined();
      expect(envelopeLines()).toHaveLength(2);
      expect(envelopeLines()[1]).toContain("stellarDocs.search_docs");
    } finally {
      logSpy.mockRestore();
    }
  });

  it("traps are non-enumerable: keys/JSON/structured clone (Workers RPC serialization) stay clean", async () => {
    const ns = guardedNamespaces(directoryFetch);
    const r = (await ns.lumenloop!.search_directory!({ query: "soroswap" })) as {
      data: object;
    };
    expect(Object.keys(r).sort()).toEqual(["data", "ok"]);
    expect(r.data).toBeInstanceOf(Object);
    expect(JSON.stringify(r)).toContain('"count":1'); // stringify never hits a trap
    // A script returning the raw envelope must still serialize across RPC.
    expect(() => structuredClone(r)).not.toThrow();
    expect((structuredClone(r) as { data: { count: number } }).data.count).toBe(1);
  });

  it("keeps class prototypes and instanceof behavior", async () => {
    class Payload {
      hits = [{ id: 1 }];
      label = "class-payload";

      describe() {
        return this.label;
      }
    }

    const payload = new Payload();
    const r = await guardSyntheticPayload(payload);

    expect(r.data).toBe(payload);
    expect(r.data).toBeInstanceOf(Payload);
    expect(r.data).toBeInstanceOf(Object);
    expect(r.data.describe()).toBe("class-payload");
    expect(Object.getPrototypeOf(r.data)).toBe(Payload.prototype);
  });

  it("keeps a null-prototype payload outside the Object prototype chain", async () => {
    const payload = Object.assign(Object.create(null) as Record<string, unknown>, {
      hits: [{ id: 1 }]
    });
    const r = await guardSyntheticPayload(payload);

    expect(r.data).toBe(payload);
    expect(r.data instanceof Object).toBe(false);
    expect(r.data.toString).toBeUndefined();
    expect(Object.getPrototypeOf(r.data)).toBeNull();
  });

  it("keeps Map and Set internal-slot operations available", async () => {
    const map = new Map([["project", "soroswap"]]);
    const set = new Set(["payments"]);
    const mapResult = await guardSyntheticPayload(map);
    const setResult = await guardSyntheticPayload(set);

    expect(mapResult.data).toBeInstanceOf(Map);
    expect(mapResult.data.get("project")).toBe("soroswap");
    mapResult.data.set("network", "stellar");
    expect(mapResult.data.size).toBe(2);
    expect(setResult.data).toBeInstanceOf(Set);
    expect(setResult.data.has("payments")).toBe(true);
    setResult.data.add("defi");
    expect(setResult.data.size).toBe(2);
    expect(() => structuredClone(mapResult)).not.toThrow();
    expect(() => structuredClone(setResult)).not.toThrow();
  });

  it("passes through frozen payloads and keeps them structured-clone safe", async () => {
    const payload = Object.freeze({ hits: [{ id: 1 }] });
    const originalPrototype = Object.getPrototypeOf(payload);
    const r = await guardSyntheticPayload(payload);

    expect(r.data).toBe(payload);
    expect(Object.isFrozen(r.data)).toBe(true);
    expect(Object.getPrototypeOf(r.data)).toBe(originalPrototype);
    expect(r.data.hits).toEqual([{ id: 1 }]);
    expect((r.data as unknown as { map?: unknown }).map).toBeUndefined();
    expect(() => structuredClone(r)).not.toThrow();
  });

  it("codemode discovery fns are not guarded — their own shapes (hits at top level) stay accessible", async () => {
    const ns = guardedNamespaces();
    const r = (await ns.codemode!.search!("stellar docs search")) as {
      ok: boolean;
      hits: unknown[];
    };
    expect(r.ok).toBe(true);
    expect(r.hits.length).toBeGreaterThan(0); // no trap on top-level hits
  });

  describe("write-through (decorating the envelope is allowed)", () => {
    it("writing a trapped key self-replaces: reads back, enumerable, survives JSON/structuredClone; payload untouched", async () => {
      const ns = guardedNamespaces(directoryFetch);
      const r = (await ns.lumenloop!.search_directory!({ query: "soroswap" })) as Record<
        string,
        unknown
      > & { data: { count: number } };
      expect(() => r.count).toThrow(/use r\.data\.count/); // read-before-write still throws
      r.count = 99; // does not throw
      expect(r.count).toBe(99); // reads back
      expect(Object.keys(r).sort()).toEqual(["count", "data", "ok"]); // enumerable now
      expect(JSON.parse(JSON.stringify(r)).count).toBe(99);
      expect((structuredClone(r) as unknown as { count: number }).count).toBe(99);
      expect(r.data.count).toBe(1); // the payload is NOT written through to
      expect(() => r.projects).toThrow(/use r\.data\.projects/); // other traps intact
    });

    it("Object.assign onto the envelope works via the setters", async () => {
      const ns = guardedNamespaces(directoryFetch);
      const r = (await ns.lumenloop!.search_directory!({ query: "soroswap" })) as Record<
        string,
        unknown
      >;
      Object.assign(r, { count: 5, projects: ["x"] });
      expect(r.count).toBe(5);
      expect(r.projects).toEqual(["x"]);
    });

    it("delete on a trapped key succeeds, then reads plain undefined (no throw)", async () => {
      const ns = guardedNamespaces(directoryFetch);
      const r = (await ns.lumenloop!.search_directory!({ query: "soroswap" })) as Record<
        string,
        unknown
      >;
      expect(delete r.projects).toBe(true);
      expect(r.projects).toBeUndefined();
    });

    it("a frozen envelope throws loudly on write (no silent no-op)", async () => {
      const ns = guardedNamespaces(directoryFetch);
      const r = (await ns.lumenloop!.search_directory!({ query: "soroswap" })) as Record<
        string,
        unknown
      >;
      Object.freeze(r);
      expect(() => {
        r.count = 1;
      }).toThrow(TypeError);
    });

    it("ok:false envelope: r.data = null writes through with one warning; later reads are warn-free; r.error untouched", async () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const envelopeLines = () =>
        logSpy.mock.calls.map((c) => String(c[0])).filter((l) => l.startsWith("[envelope]"));
      try {
        const ns = guardedNamespaces();
        const r = (await ns.lumenloop!.search_directory!({ limit: 2 })) as Record<
          string,
          unknown
        > & { error: { kind: string } };
        r.data = null; // succeeds
        expect(envelopeLines()).toHaveLength(1); // the unchecked write warned once
        expect(envelopeLines()[0]).toContain("lumenloop.search_directory");
        expect(r.data).toBeNull(); // subsequent reads return the written value…
        expect(r.data).toBeNull();
        expect(envelopeLines()).toHaveLength(1); // …warn-free
        expect(r.error.kind).toBe("error"); // error untouched
      } finally {
        logSpy.mockRestore();
      }
    });

    it("untrapped-key writes are plain data properties (no setter involved)", async () => {
      const ns = guardedNamespaces(directoryFetch);
      const r = (await ns.lumenloop!.search_directory!({ query: "soroswap" })) as Record<
        string,
        unknown
      >;
      r.note = "x";
      expect(r.note).toBe("x");
      const desc = Object.getOwnPropertyDescriptor(r, "note");
      expect(desc?.writable).toBe(true);
      expect(desc?.enumerable).toBe(true);
    });
  });
});

describe("skill.read result-shape guard (.data points at top-level content)", () => {
  // Shared generated-scope reconstruction (module-level guardedNamespaces),
  // narrowed to the codemode namespace this suite drives.
  function guardedCodemode() {
    return guardedNamespaces().codemode as unknown as {
      skill: { read: (name: string, opts?: unknown) => Promise<Record<string, unknown>> };
    };
  }
  const SKILL_ID = "skills.lumenloop.stellar-project-dossier";

  it("ok whole-read: .data throws a pointer to content/sections; content/id/availableSections read fine", async () => {
    const codemode = guardedCodemode();
    const r = (await codemode.skill.read(SKILL_ID)) as {
      ok: boolean;
      content: string;
      availableSections: string[];
    };
    expect(r.ok).toBe(true);
    expect(r.content).toContain("#"); // top-level content untouched
    expect(Array.isArray(r.availableSections)).toBe(true);
    expect(() => (r as Record<string, unknown>).data).toThrow(/skill content sits at the top level/);
    expect(() => (r as Record<string, unknown>).data).toThrow(/use r\.content .* or r\.sections/);
  });

  it("ok section-read: .sections reads fine, .data still throws the corrective pointer", async () => {
    const codemode = guardedCodemode();
    const whole = (await codemode.skill.read(SKILL_ID)) as { availableSections: string[] };
    const key = whole.availableSections[0]!;
    const r = (await codemode.skill.read(SKILL_ID, { sections: [key] })) as {
      ok: boolean;
      sections: unknown[];
    };
    expect(r.ok).toBe(true);
    expect(Array.isArray(r.sections)).toBe(true);
    expect(() => (r as Record<string, unknown>).data).toThrow(/\.data/);
  });

  it("the .data trap is non-enumerable: keys/JSON stay clean (no phantom key)", async () => {
    const codemode = guardedCodemode();
    const r = (await codemode.skill.read(SKILL_ID)) as object;
    expect(Object.keys(r)).not.toContain("data");
    expect(JSON.stringify(r)).not.toContain('"data"');
  });

  it("write-through: assigning .data self-replaces and reads back (decorating the result is legal)", async () => {
    const codemode = guardedCodemode();
    const r = (await codemode.skill.read(SKILL_ID)) as Record<string, unknown>;
    expect(() => r.data).toThrow(/\.data/); // read-before-write still throws
    r.data = 123; // does not throw
    expect(r.data).toBe(123);
    expect(Object.keys(r)).toContain("data"); // enumerable now
  });

  it("failed read routes through the envelope guard: r.data undefined + one [envelope] warning naming the call", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      const codemode = guardedCodemode();
      const r = (await codemode.skill.read("skills.definitely.not-a-skill")) as {
        ok: boolean;
        data?: unknown;
        error: { kind: string };
      };
      expect(r.ok).toBe(false);
      expect(r.error.kind).toBe("error");
      expect(r.data).toBeUndefined(); // no bespoke .data trap on failed reads
      const lines = logSpy.mock.calls
        .map((c) => String(c[0]))
        .filter((l) => l.startsWith("[envelope]"));
      expect(lines).toHaveLength(1);
      expect(lines[0]).toContain("codemode.skill.read");
      expect(lines[0]).toContain("Branch on r.ok and read r.error.");
    } finally {
      logSpy.mockRestore();
    }
  });
});

describe("codemode fns", () => {
  const providers = buildSandbox(catalog, skillSource, env);
  const codemode = fnsOf(providers, "codemode");

  it("search accepts a bare string or options; excluded ops cannot surface", async () => {
    const r = (await codemode.search!("stellar docs search")) as {
      ok: boolean;
      hits: { id: string }[];
    };
    expect(r.ok).toBe(true);
    expect(r.hits.length).toBeGreaterThan(0);
    const r2 = (await codemode.search!({ query: "partner listing", service: "scout", limit: 20 })) as {
      hits: { id: string }[];
    };
    expect(r2.hits.some((h) => h.id === "scout.submitPartnerListing")).toBe(false);
  });

  it("search returns honest total/truncated and tier-marked hits", async () => {
    const r = (await codemode.search!({ query: "stellar soroban contract", limit: 5 })) as {
      ok: boolean;
      hits: { tier: string }[];
      total: number;
      truncated: boolean;
      confidence: { hitCount: number; topScoreGap: number | null };
      recoveryMetadata: { serviceFilterExcludedSkills: unknown[] };
    };
    expect(r.ok).toBe(true);
    expect(r.hits).toHaveLength(5);
    expect(r.hits.every((h) => h.tier === "gated" || h.tier === "backfill")).toBe(true);
    // total counts matching entries BEFORE paging — a broad 3-token query
    // over the real manifest matches far more than one page.
    expect(r.total).toBeGreaterThan(r.hits.length);
    expect(r.truncated).toBe(true);
    expect(r.confidence.hitCount).toBe(r.hits.length);
    expect(r.confidence.topScoreGap).toBeGreaterThanOrEqual(0);
    expect(r.recoveryMetadata.serviceFilterExcludedSkills).toEqual([]);
  });

  it("search returns service-filter recovery metadata inside the sandbox", async () => {
    const r = (await codemode.search!({
      query: "agentic payments MPP",
      service: "lumenloop",
      limit: 5
    })) as {
      ok: boolean;
      recoveryMetadata: { serviceFilterExcludedSkills: Array<{ id: string }> };
    };
    expect(r.ok).toBe(true);
    expect(r.recoveryMetadata.serviceFilterExcludedSkills.map((entry) => entry.id)).toContain(
      "skills.stellar-dev.agentic-payments"
    );
  });

  it("search returns exact-ID recovery separately and leaves ranking unchanged", async () => {
    const baseline = (await codemode.search!({ query: "builder directory", limit: 5 })) as {
      hits: Array<{ id: string }>;
    };
    const recovered = (await codemode.search!({
      query: "builder directory",
      limit: 5,
      recoverFrom: ["scout.getBuilders"],
      reason: "empty"
    })) as {
      ok: boolean;
      hits: Array<{ id: string }>;
      recovery: Array<{ id: string }>;
    };
    expect(recovered.ok).toBe(true);
    expect(recovered.hits).toEqual(baseline.hits);
    expect(recovered.recovery.map((candidate) => candidate.id)).toEqual([
      "lumenloop.search_content_semantic",
      "scout.searchResearch"
    ]);
  });

  it("search carries structural wider candidates through the sandbox projection", async () => {
    const result = (await codemode.search!({
      query: "justin rice history",
      kind: "operation",
      limit: 10
    })) as {
      ok: boolean;
      hits: Array<{ id: string; tier: string }>;
      widerCandidates: Array<{ id: string; lane: string }>;
    };
    expect(result.ok).toBe(true);
    expect(result.hits[0]).toMatchObject({ id: "scout.getPeople", tier: "gated" });
    expect(result.widerCandidates).toEqual([]);
  });

  it("search requires explicit recoverFrom ids before returning recovery candidates", async () => {
    const baseline = (await codemode.search!({ query: "builder directory", limit: 5 })) as {
      hits: Array<{ id: string }>;
      recovery: unknown[];
    };
    const reasonOnly = (await codemode.search!({
      query: "builder directory",
      limit: 5,
      reason: "empty"
    })) as { ok: boolean; hits: Array<{ id: string }>; recovery: unknown[] };
    expect(reasonOnly.ok).toBe(true);
    expect(reasonOnly.hits).toEqual(baseline.hits);
    expect(baseline.recovery).toEqual([]);
    expect(reasonOnly.recovery).toEqual([]);
  });

  it("search rejects unknown recovery ids and reasons", async () => {
    const unknownId = (await codemode.search!({
      query: "builder directory",
      recoverFrom: ["scout.getBuilder"]
    })) as { ok: boolean; error: { message: string } };
    expect(unknownId.ok).toBe(false);
    expect(unknownId.error.message).toContain("scout.getBuilder");

    const unknownReason = (await codemode.search!({
      query: "builder directory",
      reason: "uncertain"
    })) as { ok: boolean; error: { message: string } };
    expect(unknownReason.ok).toBe(false);
    expect(unknownReason.error.message).toContain("valid reasons");
  });

  it("search logs the shared privacy-bounded page telemetry shape", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      const r = (await codemode.search!({
        query: "Tomer Weller",
        kind: "operation",
        service: "lumenloop",
        limit: 5,
        recoverFrom: ["scout.getBuilders"],
        reason: "empty"
      })) as {
        hits: unknown[];
      };
      const event = logSpy.mock.calls
        .map((call) => {
          try {
            return JSON.parse(String(call[0])) as Record<string, unknown>;
          } catch {
            return null;
          }
        })
        .find((candidate) => candidate?.evt === "search" && candidate.source === "codemode");

      expect(event).toMatchObject({
        queryChars: 12,
        requestedLimit: 5,
        effectiveLimit: 5,
        truncated: true,
        hits: r.hits.length,
        recovery: 2,
        recoveryTop: ["lumenloop.search_content_semantic", "scout.searchResearch"],
        widerCandidates: 2,
        widerCandidateTop: ["lumenloop.find_av_passages", "lumenloop.search_content_semantic"]
      });
      expect(event).not.toHaveProperty("query");
      expect(event).not.toHaveProperty("queryPreview");
      expect(event).not.toHaveProperty("queryHash");
      expect(JSON.stringify(event)).not.toContain("Tomer Weller");
      expect(Number(event?.gatedHits) + Number(event?.backfillHits)).toBe(r.hits.length);
    } finally {
      logSpy.mockRestore();
    }
  });

  it("search honors a VALID kind filter — every hit carries it", async () => {
    const r = (await codemode.search!({ query: "stellar project dossier", kind: "skill" })) as {
      ok: boolean;
      hits: { kind: string }[];
    };
    expect(r.ok).toBe(true);
    expect(r.hits.length).toBeGreaterThan(0);
    expect(r.hits.every((h) => h.kind === "skill")).toBe(true);
  });

  it("search treats explicit null kind/service as 'no filter', like limit", async () => {
    const r = (await codemode.search!({ query: "docs search", kind: null, service: null, limit: null })) as {
      ok: boolean;
      hits: { id: string }[];
    };
    expect(r.ok).toBe(true);
    expect(r.hits.length).toBeGreaterThan(0);
  });

  it("search rejects near-miss service filters with the valid set", async () => {
    for (const service of ["stellardocs", "stellar-docs", "scoutt"]) {
      const r = (await codemode.search!({ query: "docs search", service })) as {
        ok: boolean;
        error: { service: string; kind: string; message: string };
      };
      expect(r.ok, `service: ${service}`).toBe(false);
      expect(r.error.service).toBe("codemode");
      expect(r.error.kind).toBe("error");
      expect(r.error.message).toContain(`"${service}"`);
      // Lists the real, catalog-derived service names.
      for (const valid of ["lumenloop", "scout", "stellarDocs", "skills"]) {
        expect(r.error.message, `service: ${service}`).toContain(valid);
      }
    }
  });

  it("search rejects an unknown kind with the valid set", async () => {
    const r = (await codemode.search!({ query: "docs search", kind: "operations" })) as {
      ok: boolean;
      error: { kind: string; message: string };
    };
    expect(r.ok).toBe(false);
    expect(r.error.kind).toBe("error");
    expect(r.error.message).toContain('"operations"');
    expect(r.error.message).toContain("operation, skill");
    expect(r.error.message).not.toContain("operation, skill, skill-section");
    expect(r.error.message).toContain("availableSections");
  });

  it("catalog() returns the full manifest view — every entry callable, host detail stripped", async () => {
    const view = (await codemode.catalog!()) as {
      entries: { id: string; transport?: unknown; retrievalProfile?: unknown }[];
    };
    expect(view.entries.length).toBe(catalog.entries.length);
    // No policy layer exists (ADR-0003): nothing uncallable is in the view.
    expect(view.entries.every((e) => !("policy" in e) && !("cost" in e) && !("auth" in e))).toBe(
      true
    );
    expect(view.entries.every((e) => !("transport" in e) && !("provenance" in e))).toBe(true);
    expect(view.entries.find((e) => e.id === "scout.getBuilders")?.retrievalProfile).toBeDefined();
  });

  it("catalog() supports exact kind/service intersection filters and compact projection", async () => {
    const full = (await codemode.catalog!({
      kind: "operation",
      service: "stellarDocs"
    })) as {
      entries: Array<{
        id: string;
        kind: string;
        service: string;
        inputSchema?: unknown;
        outputSchema?: unknown;
      }>;
    };
    expect(full.entries.length).toBeGreaterThan(0);
    expect(full.entries.every((entry) => entry.kind === "operation")).toBe(true);
    expect(full.entries.every((entry) => entry.service === "stellarDocs")).toBe(true);
    expect(full.entries.every((entry) => "inputSchema" in entry && "outputSchema" in entry)).toBe(
      true
    );

    const compact = (await codemode.catalog!({ service: "skills", compact: true })) as {
      entries: Array<{
        id: string;
        service: string;
        kind: string;
        description: string;
        runnable?: boolean;
        inputSchema?: unknown;
        outputSchema?: unknown;
      }>;
    };
    expect(compact.entries.length).toBeGreaterThan(0);
    expect(compact.entries.every((entry) => entry.service === "skills")).toBe(true);
    expect(compact.entries.every((entry) => !("inputSchema" in entry) && !("outputSchema" in entry))).toBe(
      true
    );
    expect(compact.entries.some((entry) => entry.runnable === true)).toBe(true);
  });

  it("catalog() rejects invalid option shapes and exact filter near-misses", async () => {
    for (const [arg, needle] of [
      ["skills", "options object"],
      [{ kind: "operations" }, "operation, skill, skill-section"],
      [{ service: "stellardocs" }, "stellarDocs"],
      [{ compact: "yes" }, "compact must be a boolean"]
    ] as const) {
      const result = (await codemode.catalog!(arg)) as {
        ok: boolean;
        error: { service: string; kind: string; message: string };
      };
      expect(result.ok).toBe(false);
      expect(result.error.service).toBe("codemode");
      expect(result.error.kind).toBe("error");
      expect(result.error.message).toContain(needle);
    }
  });

  it("catalog() isolates cached views from model-authored mutations", async () => {
    const first = (await codemode.catalog!({ compact: true })) as {
      entries: Array<{ id: string }>;
    };
    const originalId = first.entries[0]?.id;
    expect(originalId).toBeTruthy();
    first.entries[0]!.id = "mutated";
    first.entries.splice(1);

    const second = (await codemode.catalog!({ compact: true })) as {
      entries: Array<{ id: string }>;
    };
    expect(second.entries[0]?.id).toBe(originalId);
    expect(second.entries.length).toBeGreaterThan(1);
  });

  it("describe is exact-match only", async () => {
    const hit = (await codemode.describe!("lumenloop.search_directory")) as {
      ok: boolean;
      signature?: string;
    };
    expect(hit.ok).toBe(true);
    expect(hit.signature).toContain("lumenloop.search_directory(");
    const miss = (await codemode.describe!("lumenloop.searchDirectory")) as {
      ok: boolean;
      error: { message: string };
    };
    expect(miss.ok).toBe(false);
    expect(miss.error.message).toContain("exact-match");
  });

  it("describe preserves the full output after the super spec compacts it", async () => {
    // scout.searchProjects is the motivating monster: its search hit stubs
    // the ~12.7KB output type; describe must carry the whole thing.
    const entry = catalog.entries.find((e) => e.id === "scout.searchProjects")!;
    const superSpec = JSON.parse(readFileSync(join(ROOT, "specs", "super-spec.json"), "utf8")) as {
      paths: Record<
        string,
        Record<
          string,
          { responses?: Record<string, { content?: Record<string, { schema?: Record<string, unknown> }> }> }
        >
      >;
    };
    const compactSchema = superSpec.paths["/scout/searchProjects"]!.get!.responses?.["200"]
      ?.content?.["application/json"]?.schema;
    expect(compactSchema?.["x-codemode-describe"]).toBe(
      'codemode.describe("scout.searchProjects")'
    );
    expect(compactSchema?.properties).toEqual({ codeReferences: {}, meta: {}, projects: {} });
    const r = (await codemode.describe!("scout.searchProjects")) as {
      ok: boolean;
      signature: string;
      inputSchema: unknown;
      outputSchema: unknown;
      usage: string;
    };
    expect(r.ok).toBe(true);
    // Full output type: real property declarations, no compaction stub.
    expect(r.signature).toContain("type SearchProjectsOutput = {");
    expect(r.signature).toContain("codeReferences?:");
    expect(r.signature).not.toMatch(/type SearchProjectsOutput = \{ \/\* \d+ top-level fields:/);
    expect(r.signature.length).toBeGreaterThan(10000);
    // Callable envelope line rides along, as in every rendered signature.
    expect(r.signature).toContain(
      "scout.searchProjects(input: SearchProjectsInput): Promise<{ ok: true, data: SearchProjectsOutput }"
    );
    // Raw schemas as plain data — the same projection codemode.catalog() uses.
    expect(r.inputSchema).toEqual(entry.inputSchema);
    expect(r.outputSchema).toEqual(entry.outputSchema);
    expect(JSON.stringify(r.outputSchema).length).toBeGreaterThan(
      JSON.stringify(compactSchema).length
    );
    // One-line envelope reminder.
    expect(r.usage).toContain("callable line");
    expect(r.usage).toContain("r.data");
  });

  it("describe is a strict superset of the search hit: the hit stubs, describe carries the full type", async () => {
    const s = (await codemode.search!({ query: "scout.searchProjects" })) as {
      hits: { id: string; signature?: string }[];
    };
    const hit = s.hits.find((h) => h.id === "scout.searchProjects")!;
    expect(hit.signature).toContain("top-level fields: codeReferences, meta, projects");
    expect(hit.signature).toContain('codemode.describe("scout.searchProjects")');
    expect(hit.signature).not.toContain("codeReferences?:");
    const d = (await codemode.describe!("scout.searchProjects")) as { signature: string };
    expect(d.signature).toContain("codeReferences?:");
  });

  it("describe on a prose skill: availableSections (same derivation as search hits) + skill.read usage", async () => {
    // A non-runnable skill. The dossier runner was retired, so
    // its entry is back to read-only and pins the reversion here.
    const skillId = "skills.lumenloop.stellar-project-dossier";
    expect(catalog.entries.find((e) => e.id === skillId)?.runnable).toBeUndefined();
    const r = (await codemode.describe!(skillId)) as {
      ok: boolean;
      kind: string;
      availableSections: string[];
      usage: string;
      signature?: string;
    };
    expect(r.ok).toBe(true);
    expect(r.kind).toBe("skill");
    // Exactly the skill's cataloged section keys — the set search hits carry.
    const sectionIds = catalog.entries
      .filter((e) => e.kind === "skill-section" && e.id.startsWith(`${skillId}#`))
      .map((e) => e.id.slice(skillId.length + 1));
    expect(sectionIds.length).toBeGreaterThan(0);
    expect(r.availableSections.length).toBe(sectionIds.length);
    expect([...r.availableSections].sort()).toEqual([...sectionIds].sort());
    expect(r.usage).toContain(`codemode.skill.read("${skillId}", { sections: [...] })`);
    // Prose skills stay read-only: no callable signature, no run usage.
    expect(r.signature).toBeUndefined();
    expect(r.usage).not.toContain("codemode.skill.run");
  });

  it("describe on a RUNNABLE skill: full skill.run signature + both schemas + dual usage naming both calls (design §5)", async () => {
    const skillId = "skills.lumenloop.stellar-ecosystem-digest";
    const entry = catalog.entries.find((e) => e.id === skillId)!;
    expect(entry.runnable).toBe(true); // manifest precondition
    const r = (await codemode.describe!(skillId)) as {
      ok: boolean;
      kind: string;
      signature: string;
      inputSchema: unknown;
      outputSchema: unknown;
      availableSections: string[];
      usage: string;
    };
    expect(r.ok).toBe(true);
    expect(r.kind).toBe("skill");
    // FULL rendered signature — the exact callable line + the envelope union.
    expect(r.signature).toContain(
      `codemode.skill.run("${skillId}", input: StellarEcosystemDigestInput)`
    );
    expect(r.signature).toContain("{ ok: true, data: StellarEcosystemDigestOutput }");
    // Both raw schemas as data — same projection codemode.catalog() serves.
    expect(r.inputSchema).toEqual(entry.inputSchema);
    expect(r.outputSchema).toEqual(entry.outputSchema);
    // One skill, one id, two affordances: sections survive alongside run.
    expect(r.availableSections.length).toBeGreaterThan(0);
    expect(r.usage).toContain(`codemode.skill.run("${skillId}"`);
    expect(r.usage).toContain(`codemode.skill.read("${skillId}"`);
  });

  it("catalog() view carries runnable on exactly the manifest's runnable entries", async () => {
    const view = (await codemode.catalog!()) as {
      entries: { id: string; runnable?: boolean }[];
    };
    const runnableIds = catalog.entries
      .filter((e) => e.runnable === true)
      .map((e) => e.id)
      .sort();
    expect(runnableIds.length).toBeGreaterThan(0);
    expect(
      view.entries
        .filter((e) => e.runnable === true)
        .map((e) => e.id)
        .sort()
    ).toEqual(runnableIds);
    // Non-runnable entries carry NO key at all — the view mirrors the
    // manifest's present-and-true-only shape (no third truth value to grep).
    const runnableSet = new Set(runnableIds);
    expect(view.entries.filter((e) => !runnableSet.has(e.id)).every((e) => !("runnable" in e))).toBe(
      true
    );
  });

  it("describe on a skill section: parent skill id + section key + exact skill.read call", async () => {
    const section = catalog.entries.find((e) => e.kind === "skill-section")!;
    const hash = section.id.indexOf("#");
    const parentId = section.id.slice(0, hash);
    const key = section.id.slice(hash + 1);
    const r = (await codemode.describe!(section.id)) as {
      ok: boolean;
      kind: string;
      skillId: string;
      section: string;
      usage: string;
    };
    expect(r.ok).toBe(true);
    expect(r.kind).toBe("skill-section");
    expect(r.skillId).toBe(parentId);
    expect(r.section).toBe(key);
    expect(r.usage).toContain(`codemode.skill.read("${parentId}", { sections: ["${key}"] })`);
  });

  it("spec() returns the super spec with $refs resolved inline (upstream REQUEST_TYPES mirror)", async () => {
    const superSpec = {
      openapi: "3.1.0",
      paths: {
        "/scout/getThing": {
          get: { operationId: "scout.getThing", parameters: [{ $ref: "#/components/parameters/q" }] }
        }
      },
      components: { parameters: { q: { name: "q", in: "query" } } }
    };
    const withSpec = buildSandbox(catalog, skillSource, env, { superSpec });
    const spec = (await fnsOf(withSpec, "codemode").spec!()) as typeof superSpec;
    expect(spec.paths["/scout/getThing"]!.get.parameters[0]).toEqual({ name: "q", in: "query" });
    // Lazily resolved once, then cached — same object back on the second call.
    expect(await fnsOf(withSpec, "codemode").spec!()).toBe(spec);
  });

  it("spec() without a wired super spec answers with the standard failure envelope", async () => {
    const r = (await codemode.spec!()) as {
      ok: boolean;
      error: { service: string; kind: string; message: string };
    };
    expect(r.ok).toBe(false);
    expect(r.error.kind).toBe("error");
    expect(r.error.service).toBe("codemode");
    expect(r.error.message).toMatch(/super spec is not wired/i);
  });

  it("skill_read serves bundled content", async () => {
    const r = (await codemode.skill_read!("skills.lumenloop.stellar-project-dossier", {})) as {
      ok: boolean;
      content?: string;
    };
    expect(r.ok).toBe(true);
    expect(r.content).toContain("#");
  });

  it("skill_read reports only exact catalog-declared build-authority roles", async () => {
    const reads: Array<{ id: string; roles: readonly string[] }> = [];
    const providers = buildSandbox(catalog, skillSource, env, {
      onSkillRead: (id, roles) => {
        reads.push({ id, roles });
      }
    });
    const fns = fnsOf(providers, "codemode");
    await fns.skill_read!("skills.definitely.not-a-skill", {});
    expect(reads).toEqual([]); // failed read: no signal
    await fns.search!("skill content");
    expect(reads).toEqual([]); // discovery is not a skill read
    await fns.skill_read!("skills.stellar-dev.smart-contracts", {});
    await fns.skill_read!("skills.lumenloop.stellar-project-dossier", {});
    expect(reads).toEqual([
      { id: "skills.stellar-dev.smart-contracts", roles: ["contract"] },
      { id: "skills.lumenloop.stellar-project-dossier", roles: [] }
    ]);
  });

  it("skill_run fires the onSkillRun hook on every dispatch (usage count, not success count)", async () => {
    let fired = 0;
    const providers = buildSandbox(catalog, skillSource, env, {
      onSkillRun: () => {
        fired += 1;
      }
    });
    const fns = fnsOf(providers, "codemode");
    await fns.skill_run!("skills.definitely.not-a-skill", {});
    expect(fired).toBe(1); // attempted run counts — the span attr measures usage
    await fns.skill_read!("skills.lumenloop.stellar-project-dossier", {});
    expect(fired).toBe(1); // reads are not runs
  });
});

/**
 * codemode.skill.run end-to-end through the provider path (design §11 row 6,
 * §12): the REAL manifest + RUNNERS registry, the generated-scope prelude
 * reconstruction (guardedNamespaces), and stub ADAPTERS via fetchImpl — the
 * same stubbing seam every dispatch test above uses, so the whole chain
 * prelude wrapper → flat skill_run dispatch → runSkill → declared-ops
 * sub-facade → guard → adapter → redact runs for real; only HTTP is fake.
 */
describe("codemode.skill.run through the provider path (end-to-end, stub adapters)", () => {
  const DIGEST_ID = "skills.lumenloop.stellar-ecosystem-digest";

  // Per-op payloads in the lumenloop wire shape ({ success, data, error,
  // meta }) — the adapter unwraps `data`, the runner projects it.
  const payloadByPath: Record<string, unknown> = {
    "/v1/tools/search_content_semantic": {
      articles: [
        { title: "Soroswap ships v2", url: "https://x.example/a", publishing_date: "2026-06-01", summary: "release" }
      ],
      research: [{ id: 7, title: "AMM depth study", summary: "liquidity", created_at: "2026-06-10" }]
    },
    "/v1/tools/list_documents": {
      items: [{ title: "Meridian 2026", url: "https://x.example/meridian", start_at: "2026-09-01" }]
    }
  };
  const digestFetch: FetchLike = async (url) => {
    const path = new URL(url).pathname;
    if (!(path in payloadByPath)) throw new Error(`unexpected adapter fetch: ${url}`);
    return new Response(
      JSON.stringify({ success: true, data: payloadByPath[path], error: null, meta: { format: "json" } }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  };

  function skillNs(fetchImpl?: FetchLike) {
    return guardedNamespaces(fetchImpl).codemode as unknown as {
      skill: {
        run: (name?: unknown, input?: unknown) => Promise<Record<string, unknown>>;
      };
    };
  }

  it("runs the digest: envelope shape, host-recorded calls, guard traps on the result", async () => {
    const codemode = skillNs(digestFetch);
    const r = (await codemode.skill.run(DIGEST_ID, { subject: "AMM liquidity" })) as {
      ok: boolean;
      data: {
        subject: string;
        subjectType: string;
        softEmpty: boolean;
        items: { type: string; title: string }[] | null;
        upcomingEvents: { title: string }[] | null;
        calls: { op: string; ok: boolean; ms: number }[];
      };
    };
    expect(r.ok).toBe(true);
    expect(r.data.subject).toBe("AMM liquidity");
    expect(r.data.subjectType).toBe("theme"); // runner-applied default
    expect(r.data.softEmpty).toBe(false);
    expect(r.data.items?.map((i) => i.type).sort()).toEqual(["articles", "research"]);
    expect(r.data.upcomingEvents?.[0]?.title).toBe("Meridian 2026");
    // Host-owned ledger: theme mode = primary semantic search + the parallel
    // upcoming-events list, nothing else.
    expect(r.data.calls.map((c) => c.op).sort()).toEqual([
      "lumenloop.list_documents",
      "lumenloop.search_content_semantic"
    ]);
    expect(r.data.calls.every((c) => c.ok)).toBe(true);
    // The run result rides __guardEnvelope like every operation call:
    // wrong-level payload reads throw the corrective pointer.
    expect(() => (r as unknown as Record<string, unknown>).items).toThrow(/use r\.data\.items/);
    expect(() => (r as unknown as Record<string, unknown>).calls).toThrow(/use r\.data\.calls/);
  });

  it("unknown name fails as data naming the runnable ids + a nearest suggestion (exact-match discipline)", async () => {
    const codemode = skillNs();
    const r = (await codemode.skill.run("skills.lumenloop.stellar-ecosystem-diges", {})) as {
      ok: boolean;
      error: { kind: string; message: string };
    };
    expect(r.ok).toBe(false);
    expect(r.error.kind).toBe("error");
    expect(r.error.message).toContain("skills.lumenloop.stellar-ecosystem-digest");
    expect(r.error.message).toContain("Did you mean");
    // The retired dossier runner is not advertised as runnable.
    expect(r.error.message).not.toContain("stellar-project-dossier");
  });

  it("invalid input is refused by the manifest schema before any adapter call (unknown keys rejected)", async () => {
    let fetched = 0;
    const countingFetch: FetchLike = async (url) => {
      fetched += 1;
      return digestFetch(url);
    };
    const codemode = skillNs(countingFetch);
    const r = (await codemode.skill.run(DIGEST_ID, { subject: "AMM liquidity", bogus: true })) as {
      ok: boolean;
      error: { kind: string };
    };
    expect(r.ok).toBe(false);
    expect(r.error.kind).toBe("error");
    expect(fetched).toBe(0); // guard/validateArgs — model code never owns the contract
  });
});

describe("skill_read telemetry (ideas/skill-discovery-without-bundling.md)", () => {
  /** Capture the JSON lines logEvent writes to console.log. */
  async function captureSkillReadEvents(run: (fns: Record<string, Function>) => Promise<unknown>) {
    const events: Record<string, unknown>[] = [];
    const spy = vi.spyOn(console, "log").mockImplementation((line: unknown) => {
      try {
        const parsed = JSON.parse(String(line));
        if (parsed?.evt === "skill_read") events.push(parsed);
      } catch {
        // not a telemetry line
      }
    });
    try {
      await run(fnsOf(buildSandbox(catalog, skillSource, env), "codemode") as Record<string, Function>);
    } finally {
      spy.mockRestore();
    }
    return events;
  }

  it("records a WHOLE read: shape, one retrieval, and a duration", async () => {
    const events = await captureSkillReadEvents((fns) =>
      fns.skill_read!("skills.lumenloop.stellar-project-dossier", {})
    );
    expect(events).toHaveLength(1);
    const e = events[0]!;
    expect(e.id).toBe("skills.lumenloop.stellar-project-dossier");
    expect(e.shape).toBe("whole");
    expect(e.requested).toBe(0);
    expect(e.retrievals).toBe(1);
    expect(e.outcome).toBe("ok");
    expect(typeof e.ms).toBe("number");
    expect(["memo", "cache", "upstream"]).toContain(e.from);
  });

  it("distinguishes SECTION reads from whole reads — the question this exists to answer", async () => {
    const skillId = "skills.stellar-dev.smart-contracts";
    const events = await captureSkillReadEvents((fns) =>
      fns.skill_read!(skillId, { sections: ["project-setup", "contract-anatomy"] })
    );
    expect(events).toHaveLength(1);
    expect(events[0]!.shape).toBe("sections");
    expect(events[0]!.requested).toBe(2);
    // `##` sections come out of the SKILL.md body — one retrieval, not two.
    expect(events[0]!.retrievals).toBe(1);
  });

  it("counts one retrieval per companion FILE, which is what the concurrency fix bought", async () => {
    const events = await captureSkillReadEvents((fns) =>
      fns.skill_read!("skills.stellar-dev.smart-contracts", {
        sections: ["file:development.md", "file:testing.md"]
      })
    );
    expect(events[0]!.shape).toBe("files");
    expect(events[0]!.requested).toBe(2);
    expect(events[0]!.retrievals).toBe(3); // SKILL.md + the two companions
  });

  it("records failures without logging the untrusted id or error text", async () => {
    const invalidId = "skills.no.such-skill-sensitive";
    const events = await captureSkillReadEvents((fns) => fns.skill_read!(invalidId, {}));
    expect(events[0]!.outcome).toBe("error");
    expect(events[0]!.from).toBe("none");
    expect(events[0]!.id).toBeNull();
    expect(events[0]).not.toHaveProperty("error");
    expect(JSON.stringify(events[0])).not.toContain(invalidId);
  });

  it("records a TRANSPORT failure — the availability signal the posture depends on", async () => {
    // The test above fails at id resolution and never reaches the network, so
    // it cannot prove the case that actually matters: a real, cataloged pin
    // whose upstream fetch fails. `ARCHITECTURE.md` §6 accepts the availability
    // risk on the grounds that it is OBSERVABLE — and `skill_read outcome:error` is
    // the entire observation. If a transport failure escaped as a throw, or
    // logged nothing, the accepted risk would be an unmonitored one and the
    // only way to notice would be a user complaint.
    const events: Record<string, unknown>[] = [];
    const spy = vi.spyOn(console, "log").mockImplementation((line: unknown) => {
      try {
        const parsed = JSON.parse(String(line));
        if (parsed?.evt === "skill_read") events.push(parsed);
      } catch {
        // not a telemetry line
      }
    });
    try {
      // A source that resolves nothing: every pin fetch fails the way upstream
      // loss or a blocked colo egress would.
      const dead: SkillSource = async (pin) => {
        throw new Error(`could not fetch ${pin.url}: fetch failed`);
      };
      const fns = fnsOf(buildSandbox(catalog, dead, env), "codemode") as Record<string, Function>;
      const r = (await fns.skill_read!("skills.lumenloop.stellar-project-dossier", {})) as {
        ok: boolean;
      };
      expect(r.ok).toBe(false); // an ordinary envelope, never a throw
    } finally {
      spy.mockRestore();
    }
    expect(events).toHaveLength(1);
    const e = events[0]!;
    expect(e.outcome).toBe("error");
    expect(e.id).toBe("skills.lumenloop.stellar-project-dossier");
    expect(e).not.toHaveProperty("error");
    expect(JSON.stringify(e)).not.toContain("could not fetch");
    expect(typeof e.ms).toBe("number");
  });
});
