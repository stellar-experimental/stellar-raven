/**
 * Offline smoke of src/executor/run.ts at the real worker boundary. It covers
 * the pieces that plain-Node tests cannot touch: `cloudflare:workers`
 * tracing, `@cloudflare/codemode`'s DynamicWorkerExecutor, and a genuine
 * Dynamic Worker isolate via the LOADER binding.
 *
 * Offline is ENFORCED, not assumed: the lane's miniflare `outboundService`
 * (test/smoke/vitest.config.ts) turns any un-stubbed host-side fetch into a
 * 503. Sandbox-side there is no network at all (globalOutbound: null —
 * asserted below). The single vi.stubGlobal'd fetch exists to produce a real
 * { ok: true } envelope so the guard's payload-read trap can be exercised at
 * the true boundary. The live counterpart (test/live/run-live-execute.mjs)
 * still owns real-traffic coverage.
 */
import { env } from "cloudflare:test";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  assertExecutorEvidenceOperationIds,
  createExecuteRunner,
  createSpecSearchRunner
} from "../../src/executor/run";
import { getCatalog } from "../../src/catalog/load";
import type { Catalog } from "../../src/catalog/types";
import {
  SOURCE_BASIS_MARKER,
  SOURCE_METADATA_MARKER
} from "../../src/policy/source-basis";
import fxSemantic from "../fixtures/skill-runners/lumenloop.search_content_semantic.ts";
import fxListDocs from "../fixtures/skill-runners/lumenloop.list_documents.ts";

// The cast bridges OAUTH_PROVIDER: workos.ts augments the global Env with
// it (injected at runtime by workers-oauth-provider), but the runners never
// touch it and the test env legitimately lacks it.
const run = createExecuteRunner(env as unknown as Env);
const runWithSmallBoundary = createExecuteRunner(env as unknown as Env, {
  modelBoundaryMaxTokens: 1000
});

function uniqueOwner(label: string): string {
  return `smoke-owner-${label}-${crypto.randomUUID()}`;
}

async function ownerPrefix(owner: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(owner));
  const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `art/${hex.slice(0, 16)}/`;
}

async function artifactKeysFor(owner: string): Promise<string[]> {
  const listed = await env.ARTIFACTS.list({ prefix: await ownerPrefix(owner) });
  return listed.objects.map((o) => o.key);
}

function artifactIdFrom(text: string): string {
  const match = /artifact: id=([0-9a-f-]{36}) /.exec(text);
  if (!match?.[1]) throw new Error(`artifact id missing from:\n${text.slice(-2000)}`);
  return match[1];
}

function parseResultJsonWithMetadata(text: string): unknown {
  const boundary = `\n${SOURCE_METADATA_MARKER}`;
  const boundaryIndex = text.lastIndexOf(boundary);
  if (boundaryIndex < 0) throw new Error("expected a host source-metadata block");
  if (text.indexOf(boundary) !== boundaryIndex) {
    throw new Error("expected exactly one host source-metadata block");
  }
  return JSON.parse(text.slice(0, boundaryIndex));
}

function occurrences(text: string, needle: string): number {
  return text.split(needle).length - 1;
}

const BIG_SECRET_RESULT_CODE = `async () => {
  const refused = await lumenloop.search_directory({ limit: 2 });
  return {
    sourceUrl: "https://user:pass@example.test/path?secret=1#frag",
    refused,
    rows: Array.from({ length: 2500 }, (_, i) => ({
      i,
      nested: { envSecret: "smoke-test-lumenloop-key" },
      pad: "x".repeat(40)
    }))
  };
}`;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("executor evidence operation catalog guard", () => {
  it("accepts every curated ID in the current exposed catalog", () => {
    expect(() => assertExecutorEvidenceOperationIds(getCatalog())).not.toThrow();
  });

  it("fails deterministically when a curated ID is missing", () => {
    const catalog = getCatalog();
    const withoutDirectory: Catalog = {
      ...catalog,
      entries: catalog.entries.filter((entry) => entry.id !== "lumenloop.search_directory")
    };

    expect(() => assertExecutorEvidenceOperationIds(withoutDirectory)).toThrow(
      'Executor candidate evidence operation "lumenloop.search_directory" is missing from the exposed catalog'
    );
  });

  it("fails deterministically when a curated ID resolves to the wrong kind", () => {
    const catalog = getCatalog();
    const skill = catalog.entries.find((entry) => entry.kind === "skill");
    if (!skill) throw new Error("current catalog has no skill entry for the wrong-kind fixture");
    const wrongKind: Catalog = {
      ...catalog,
      entries: catalog.entries.map((entry) =>
        entry.id === "lumenloop.search_directory"
          ? { ...skill, id: "lumenloop.search_directory" }
          : entry
      )
    };

    expect(() => assertExecutorEvidenceOperationIds(wrongKind)).toThrow(
      'Executor candidate evidence operation "lumenloop.search_directory" must resolve to an exposed operation, found kind "skill"'
    );
  });
});

describe("execute runner (real Dynamic Worker isolate)", () => {
  it("runs model code in a fresh isolate and returns its result", async () => {
    const outcome = await run("async (codemode) => 1 + 1");
    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.result).toBe("2");
      expect(outcome.operationSummary).toEqual({ total: 0, ok: 0, error: 0, softEmpty: 0 });
      expect(outcome.evidenceSummary).toEqual({
        kind: "none",
        skillRead: false,
        buildAuthoritySkillIds: [],
        buildAuthorityRoles: [],
        skillRuns: 0,
        artifactReads: 0
      });
    }
  });

  it("writes an artifact only for a truncated result and stores redacted bytes before slicing", async () => {
    const owner = uniqueOwner("write");
    const outcome = await run(BIG_SECRET_RESULT_CODE, {
      artifactOwner: owner,
      requestId: "smoke-request",
      rayId: "smoke-ray"
    });
    if (!outcome.ok) throw new Error(outcome.error);
    expect(outcome.ok).toBe(true);
    expect(outcome.truncated).toBe(true);
    expect(outcome.result).toContain("--- SOURCE BASIS ---");
    expect(outcome.result).not.toContain("--- TRUNCATED ---");
    expect(outcome.result).toContain("artifact: id=");
    expect(outcome.result).toContain("lumenloop.search_directory=error/");
    expect(outcome.result).toContain("https://example.test/path");
    expect(outcome.sourceBasis?.artifact?.state).toBe("available");
    expect(outcome.sourceBasis?.shape).toMatchObject({ kind: "object", totalKeys: 3 });
    expect(outcome.sourceBasis?.shape).not.toHaveProperty("totalItems");
    expect(outcome.sourceBasis?.shape).not.toHaveProperty("stringChars");
    expect(outcome.operationSummary).toEqual({ total: 1, ok: 0, error: 1, softEmpty: 0 });
    expect(outcome.evidenceSummary.kind).toBe("service-inconclusive");

    const id = artifactIdFrom(outcome.result);
    const keys = await artifactKeysFor(owner);
    expect(keys.some((key) => key.endsWith(`/${id}`))).toBe(true);
    const key = keys.find((k) => k.endsWith(`/${id}`));
    if (!key) throw new Error("missing stored artifact key");
    const stored = await env.ARTIFACTS.get(key);
    const storedText = (await stored?.text()) ?? "";
    expect(storedText).not.toContain("smoke-test-lumenloop-key");
    expect(storedText).toContain("[REDACTED]");
    const storedPayload = JSON.parse(storedText) as { rows?: unknown[] };
    expect(storedPayload.rows).toHaveLength(2500);
    expect(storedPayload).not.toHaveProperty("encoding");
    expect(storedPayload).not.toHaveProperty("mime");
  });

  it("collects canonical URLs through nested ordinary containers without treating prose as canonical", async () => {
    const outcome = await run(`async () => ({
      research: [{ url: "https://research.example.test/item?tracking=1#section" }],
      docs: [{ url: "https://docs.example.test/guide" }],
      summary: "https://prose.example.test/not-a-canonical-field",
      padding: "x".repeat(30000)
    })`);

    expect(outcome.ok).toBe(true);
    if (!outcome.ok) throw new Error(outcome.error);
    expect(outcome.truncated).toBe(true);
    expect(outcome.sourceBasis?.canonicalUrls).toEqual([
      "https://research.example.test/item",
      "https://docs.example.test/guide"
    ]);
  });

  it("does not let repeated raw URLs starve later distinct canonical fields", async () => {
    const outcome = await run(`async () => ({
      repeated: Array.from({ length: 20 }, () => ({ url: "https://repeat.example.test/item" })),
      sourceUrl: "https://source.example.test/report",
      docsUrl: "https://docs.example.test/guide",
      repoUrl: "https://github.com/stellar/stellar-core",
      websiteUrl: "https://website.example.test",
      padding: "x".repeat(30000)
    })`);

    expect(outcome.ok).toBe(true);
    if (!outcome.ok) throw new Error(outcome.error);
    expect(outcome.truncated).toBe(true);
    expect(outcome.sourceBasis?.canonicalUrls).toEqual([
      "https://repeat.example.test/item",
      "https://source.example.test/report",
      "https://docs.example.test/guide",
      "https://github.com/stellar/stellar-core",
      "https://website.example.test/"
    ]);
  });

  it("excludes decorative/store URLs before the five-URL manifest cap", async () => {
    const outcome = await run(`async () => ({
      projects: [
        { logoUrl: "https://cdn.example.test/logo-1.png", storeUrl: "https://store.example.test/1", url: "https://project-1.example.test" },
        { avatarUrl: "https://cdn.example.test/avatar-2.png", imageUrl: "https://cdn.example.test/image-2.png", url: "https://project-2.example.test" },
        { iconUrl: "https://cdn.example.test/icon-3.png", bannerUrl: "https://cdn.example.test/banner-3.png", url: "https://project-3.example.test" }
      ],
      repoUrl: "https://github.com/stellar/stellar-core",
      docsUrl: "https://docs.example.test/guide",
      sourceUrl: "https://source.example.test/report",
      websiteUrl: "https://website.example.test",
      padding: "x".repeat(30000)
    })`);

    expect(outcome.ok).toBe(true);
    if (!outcome.ok) throw new Error(outcome.error);
    expect(outcome.sourceBasis?.canonicalUrls).toEqual([
      "https://project-1.example.test/",
      "https://project-2.example.test/",
      "https://project-3.example.test/",
      "https://github.com/stellar/stellar-core",
      "https://docs.example.test/guide"
    ]);
  });

  it("upgrades shared references from non-URL to URL-bearing paths without dropping depth-cut aliases", async () => {
    const arrayAlias = await run(`async () => {
      const shared = ["https://canonical.example.test/a"];
      return { debug: shared, links: shared, padding: "x".repeat(30000) };
    }`);
    const depthAlias = await run(`async () => {
      const shared = { url: "https://deep.example.test/canonical" };
      return { a: { b: { c: { d: { e: shared } } } }, links: shared, padding: "x".repeat(30000) };
    }`);
    // First reached through a URL-keyed chain whose url leaf sits past the
    // depth cap; the shallow alias must still surface it (a urlLeaf=true visit
    // may not permanently mark the node as exhausted).
    const urlKeyedDepthAlias = await run(`async () => {
      const shared = { url: "https://deep-url-keyed.example.test/canonical" };
      return { a: { b: { c: { d: { links: shared } } } }, links: shared, padding: "x".repeat(30000) };
    }`);

    expect(arrayAlias.ok).toBe(true);
    expect(depthAlias.ok).toBe(true);
    expect(urlKeyedDepthAlias.ok).toBe(true);
    if (!arrayAlias.ok) throw new Error(arrayAlias.error);
    if (!depthAlias.ok) throw new Error(depthAlias.error);
    if (!urlKeyedDepthAlias.ok) throw new Error(urlKeyedDepthAlias.error);
    expect(arrayAlias.sourceBasis?.canonicalUrls).toEqual(["https://canonical.example.test/a"]);
    expect(depthAlias.sourceBasis?.canonicalUrls).toEqual(["https://deep.example.test/canonical"]);
    expect(urlKeyedDepthAlias.sourceBasis?.canonicalUrls).toEqual([
      "https://deep-url-keyed.example.test/canonical"
    ]);
  });

  it("keeps firestore, restore, and URI fields while excluding store and thumbnail links", async () => {
    const outcome = await run(`async () => ({
      firestoreUrl: "https://firestore.example.test/document",
      restoreUrl: "https://restore.example.test/backup",
      appStoreLink: "https://store.example.test/app",
      uri: "https://uri.example.test/resource",
      thumbnailUrl: "https://cdn.example.test/thumb.png",
      padding: "x".repeat(30000)
    })`);

    expect(outcome.ok).toBe(true);
    if (!outcome.ok) throw new Error(outcome.error);
    expect(outcome.sourceBasis?.canonicalUrls).toEqual([
      "https://firestore.example.test/document",
      "https://restore.example.test/backup",
      "https://uri.example.test/resource"
    ]);
  });

  it("preserves root string/array URL collection and the depth-five traversal cap", async () => {
    const rootArray = await runWithSmallBoundary(
      `async () => ["https://root-array.example.test/a", "x".repeat(5000)]`
    );
    const rootString = await runWithSmallBoundary(
      `async () => "https://root-string.example.test/" + "x".repeat(5000)`
    );
    const depthSix = await runWithSmallBoundary(`async () => ({
      a: { b: { c: { d: { e: { url: "https://too-deep.example.test/a" } } } } },
      padding: "x".repeat(5000)
    })`);

    expect(rootArray.ok).toBe(true);
    expect(rootString.ok).toBe(true);
    expect(depthSix.ok).toBe(true);
    if (!rootArray.ok) throw new Error(rootArray.error);
    if (!rootString.ok) throw new Error(rootString.error);
    if (!depthSix.ok) throw new Error(depthSix.error);
    expect(rootArray.sourceBasis?.canonicalUrls).toEqual(["https://root-array.example.test/a"]);
    expect(rootArray.sourceBasis?.shape).toMatchObject({ kind: "array", totalItems: 2 });
    expect(rootArray.sourceBasis?.shape).not.toHaveProperty("totalKeys");
    expect(rootArray.sourceBasis?.shape).not.toHaveProperty("stringChars");
    expect(rootString.sourceBasis?.canonicalUrls?.[0]).toBe(
      `https://root-string.example.test/${"x".repeat(5000)}`
    );
    expect(rootString.sourceBasis?.shape).toMatchObject({ kind: "string", stringChars: 5033 });
    expect(rootString.sourceBasis?.shape).not.toHaveProperty("totalKeys");
    expect(rootString.sourceBasis?.shape).not.toHaveProperty("totalItems");
    expect(depthSix.sourceBasis?.canonicalUrls).toEqual([]);
  });

  it("does not write artifacts for non-truncated results, log truncation, or thrown errors", async () => {
    const owner = uniqueOwner("no-write");
    const before = await artifactKeysFor(owner);

    const small = await run("async () => ({ ok: true })", { artifactOwner: owner });
    expect(small.ok).toBe(true);
    if (small.ok) expect(small.truncated).toBe(false);

    const logHeavy = await run(`async () => {
      console.log("x".repeat(200000));
      return "ok";
    }`, { artifactOwner: owner });
    expect(logHeavy.ok).toBe(true);

    const thrown = await run(`async () => {
      throw new Error("x".repeat(100000));
    }`, { artifactOwner: owner });
    expect(thrown.ok).toBe(false);

    expect(await artifactKeysFor(owner)).toEqual(before);
  });

  it("keeps concurrent executes isolated across owners and operation ledgers on the cached runner", async () => {
    vi.stubGlobal("fetch", async (input: RequestInfo | URL) => {
      const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
      if (url.pathname.endsWith("/search_directory")) {
        await new Promise((resolve) => setTimeout(resolve, 25));
        return Response.json({
          success: true,
          data: { count: 1, projects: [{ slug: "alpha" }] },
          error: null,
          meta: { tool: "search_directory", format: "json" }
        });
      }
      if (url.pathname.endsWith("/get_categories")) {
        await new Promise((resolve) => setTimeout(resolve, 5));
        return Response.json({
          success: true,
          data: { categories: ["payments"] },
          error: null,
          meta: { tool: "get_categories", format: "json" }
        });
      }
      return Response.json({ success: false, error: `unexpected ${url.pathname}` }, { status: 500 });
    });

    const ownerA = uniqueOwner("concurrent-a");
    const ownerB = uniqueOwner("concurrent-b");
    const [a, b] = await Promise.all([
      run(`async () => {
        const r = await lumenloop.search_directory({ query: "alpha" });
        return { label: "a", ok: r.ok, rows: Array.from({ length: 1800 }, (_, i) => ({ i, pad: "a".repeat(40) })) };
      }`, { artifactOwner: ownerA }),
      run(`async () => {
        const r = await lumenloop.get_categories({});
        return { label: "b", ok: r.ok, rows: Array.from({ length: 1800 }, (_, i) => ({ i, pad: "b".repeat(40) })) };
      }`, { artifactOwner: ownerB })
    ]);

    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);
    if (!a.ok) throw new Error(a.error);
    if (!b.ok) throw new Error(b.error);
    expect(a.sourceBasis?.calls.map((call) => call.op)).toEqual(["lumenloop.search_directory"]);
    expect(b.sourceBasis?.calls.map((call) => call.op)).toEqual(["lumenloop.get_categories"]);
    expect(a.operationSummary?.candidateEvidence).toBe(1);
    expect(b.operationSummary?.candidateEvidence).toBeUndefined();

    const idA = artifactIdFrom(a.result);
    const idB = artifactIdFrom(b.result);
    const keysA = await artifactKeysFor(ownerA);
    const keysB = await artifactKeysFor(ownerB);
    expect(keysA).toHaveLength(1);
    expect(keysB).toHaveLength(1);
    expect(keysA[0]).toContain(idA);
    expect(keysB[0]).toContain(idB);

    const metaA = (await env.ARTIFACTS.head(keysA[0]!))?.customMetadata;
    const metaB = (await env.ARTIFACTS.head(keysB[0]!))?.customMetadata;
    expect(metaA?.opLedger).toContain("lumenloop.search_directory");
    expect(metaA?.opLedger).not.toContain("lumenloop.get_categories");
    expect(metaB?.opLedger).toContain("lumenloop.get_categories");
    expect(metaB?.opLedger).not.toContain("lumenloop.search_directory");
  });

  it("classifies successful Scout repo searches as prior-art evidence", async () => {
    vi.stubGlobal("fetch", async (input: RequestInfo | URL) => {
      const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
      if (!url.pathname.endsWith("/api/repos/search")) {
        return Response.json({ error: `unexpected ${url.pathname}` }, { status: 500 });
      }
      return Response.json({
        repos: [{ fullName: "example/escrow", url: "https://github.com/example/escrow" }],
        meta: { counts: { returned: 1, total: 1 } }
      });
    });

    const outcome = await run(`async () => {
      const repos = await scout.searchRepos({ q: "escrow", limit: 1 });
      return { ok: repos.ok };
    }`);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) throw new Error(outcome.error);
    expect(outcome.operationSummary).toMatchObject({
      total: 1,
      ok: 1,
      error: 0,
      softEmpty: 0,
      priorArtCandidates: 1
    });
    expect(outcome.operationSummary.candidateEvidence).toBeUndefined();
  });

  it("preserves allowlisted source metadata after a compact sandbox projection", async () => {
    vi.stubGlobal("fetch", async (input: RequestInfo | URL) => {
      const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
      expect(url.pathname).toBe("/api/repos/search");
      return Response.json({
        repos: [{ fullName: "example/escrow", url: "https://github.com/example/escrow" }],
        meta: {
          generatedAt: "2026-08-26T12:00:00Z",
          counts: { returned: 1, total: 9 },
          matchMode: "strict",
          privateDetail: "must-not-propagate"
        }
      });
    });

    const outcome = await run(`async () => {
      const r = await scout.searchRepos({ q: "escrow", limit: 1 });
      return r.ok ? r.data.repos.map((repo) => repo.fullName) : [];
    }`);

    expect(outcome.ok).toBe(true);
    if (!outcome.ok) throw new Error(outcome.error);
    expect(outcome.truncated).toBe(false);
    expect(parseResultJsonWithMetadata(outcome.result)).toEqual(["example/escrow"]);
    expect(outcome.result).toContain(SOURCE_METADATA_MARKER);
    expect(outcome.result).not.toContain(SOURCE_BASIS_MARKER);
    expect(outcome.result).toContain(
      'scout.searchRepos data.meta.generatedAt="2026-08-26T12:00:00Z"'
    );
    expect(outcome.result).toContain("data.meta.counts.total=9");
    expect(outcome.result).toContain('data.meta.matchMode="strict"');
    expect(outcome.result).not.toContain("privateDetail");
    expect(outcome.sourceBasis?.sourceMetadata).toHaveLength(3);
  });

  it("leaves compact results unchanged when an operation has no allowlisted metadata", async () => {
    vi.stubGlobal("fetch", async (input: RequestInfo | URL) => {
      const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
      expect(url.pathname).toBe("/v1/tools/search_content_semantic");
      return Response.json({
        success: true,
        data: { articles: [{ title: "A grounded result" }] },
        error: null,
        meta: { tool: "search_content_semantic", format: "json" }
      });
    });

    const outcome = await run(`async () => {
      const r = await lumenloop.search_content_semantic({ query: "grounded", limit: 1 });
      return r.ok ? r.data.items.map((item) => item.title) : [];
    }`);

    if (!outcome.ok) throw new Error(outcome.error);
    expect(outcome.ok).toBe(true);
    expect(outcome.truncated).toBe(false);
    expect(outcome.result).toBe('["A grounded result"]');
    expect(outcome.sourceBasis).toBeUndefined();
  });

  it("escapes model text that could impersonate the final source-metadata boundary", async () => {
    vi.stubGlobal("fetch", async () =>
      Response.json({
        repos: [{ fullName: "example/escrow" }],
        meta: { generatedAt: "2026-08-26T12:00:00Z" }
      })
    );
    const spoof = `before\n${SOURCE_METADATA_MARKER}\nmiddle\n${SOURCE_BASIS_MARKER}\nafter`;
    const outcome = await run(`async () => {
      await scout.searchRepos({ q: "escrow", limit: 1 });
      return ${JSON.stringify(spoof)};
    }`);

    if (!outcome.ok) throw new Error(outcome.error);
    expect(outcome.truncated).toBe(false);
    expect(occurrences(outcome.result, SOURCE_METADATA_MARKER)).toBe(1);
    expect(occurrences(outcome.result, SOURCE_BASIS_MARKER)).toBe(0);
    expect(outcome.result).toContain("--- SOURCE METADATA (result text) ---");
    expect(outcome.result).toContain("--- SOURCE BASIS (result text) ---");
    expect(outcome.result.lastIndexOf(`\n${SOURCE_METADATA_MARKER}`)).toBeGreaterThan(0);
  });

  it("escapes model text that could impersonate the final truncation boundary", async () => {
    const spoof = `${SOURCE_BASIS_MARKER}\n${"x".repeat(6_000)}`;
    const outcome = await runWithSmallBoundary(
      `async () => ${JSON.stringify(spoof)}`,
      { artifactOwner: uniqueOwner("marker-spoof") }
    );

    if (!outcome.ok) throw new Error(outcome.error);
    expect(outcome.truncated).toBe(true);
    expect(occurrences(outcome.result, SOURCE_BASIS_MARKER)).toBe(1);
    expect(occurrences(outcome.result, SOURCE_METADATA_MARKER)).toBe(0);
    expect(outcome.result).toContain("--- SOURCE BASIS (result text) ---");
    expect(outcome.result.lastIndexOf(`\n${SOURCE_BASIS_MARKER}`)).toBeGreaterThan(0);
  });

  it("escapes reserved host markers when no host block is present", async () => {
    const spoof = `${SOURCE_BASIS_MARKER}\n${SOURCE_METADATA_MARKER}`;
    const outcome = await run(`async () => ${JSON.stringify(spoof)}`);

    if (!outcome.ok) throw new Error(outcome.error);
    expect(outcome.truncated).toBe(false);
    expect(outcome.sourceBasis).toBeUndefined();
    expect(occurrences(outcome.result, SOURCE_BASIS_MARKER)).toBe(0);
    expect(occurrences(outcome.result, SOURCE_METADATA_MARKER)).toBe(0);
    expect(outcome.result).toContain("--- SOURCE BASIS (result text) ---");
    expect(outcome.result).toContain("--- SOURCE METADATA (result text) ---");
  });

  it("derives narrow and conditional recovery advice from the attempted-operation graph", async () => {
    vi.stubGlobal("fetch", async (input: RequestInfo | URL) => {
      const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
      if (url.pathname.endsWith("/api/builders")) {
        return Response.json({
          builders: [{ displayName: "Example Builder", githubUsername: "example" }],
          meta: { counts: { returned: 1, total: 1 } }
        });
      }
      if (url.pathname.endsWith("/v1/tools/search_directory")) {
        return Response.json({
          success: true,
          data: { count: 1, projects: [{ slug: "example" }] },
          error: null,
          meta: { tool: "search_directory", format: "json" }
        });
      }
      if (url.pathname.endsWith("/api/projects/search")) {
        return Response.json({
          projects: [{ name: "Example", slug: "example" }],
          meta: { counts: { returned: 1, total: 1 } }
        });
      }
      if (url.pathname.endsWith("/v1/tools/search_content_semantic")) {
        return Response.json({
          success: true,
          data: {
            articles: [{ id: "article", similarity: 0.8 }],
            events: [],
            av: [],
            query: "Example Builder"
          },
          error: null,
          meta: { tool: "search_content_semantic", format: "json" }
        });
      }
      if (url.pathname.endsWith("/v1/tools/find_similar_projects_semantic")) {
        return Response.json({
          success: true,
          data: { results: [{ slug: "neighbor", title: "Neighbor", similarity: 0.8 }] },
          error: null,
          meta: { tool: "find_similar_projects_semantic", format: "json" }
        });
      }
      if (url.pathname.includes("/1/indexes/")) {
        return Response.json({
          hits: [
            {
              objectID: "doc-1",
              url: "https://developers.stellar.org/docs/example",
              hierarchy: { lvl0: "Docs", lvl1: "Example" },
              _snippetResult: { content: { value: "Exact official wording" } }
            }
          ],
          nbHits: 1,
          page: 0,
          nbPages: 1,
          hitsPerPage: 1
        });
      }
      return Response.json({ error: `unexpected ${url.pathname}` }, { status: 500 });
    });

    const narrow = await run(`async () => {
      const builders = await scout.getBuilders({ q: "Example Builder", limit: 1 });
      return { ok: builders.ok };
    }`);
    expect(narrow.ok).toBe(true);
    if (!narrow.ok) throw new Error(narrow.error);
    expect(narrow.recoveryHint?.mode).toBe("narrow-only");
    expect(narrow.recoveryHint?.sourceOperations).toEqual(["scout.getBuilders"]);
    expect(narrow.recoveryHint?.candidates.map((candidate) => candidate.id)).toEqual([
      "lumenloop.search_content_semantic",
      "scout.searchResearch",
      "lumenloop.find_av_passages"
    ]);

    const failedAlternative = await run(`async () => {
      const [builders, av] = await Promise.all([
        scout.getBuilders({ q: "Example Builder", limit: 1 }),
        lumenloop.find_av_passages({ query: "Example Builder", limit: 1 })
      ]);
      return { buildersOk: builders.ok, avOk: av.ok };
    }`);
    expect(failedAlternative.ok).toBe(true);
    if (!failedAlternative.ok) throw new Error(failedAlternative.error);
    expect(failedAlternative.operationSummary).toMatchObject({ ok: 1, error: 1 });
    expect(failedAlternative.recoveryHint?.mode).toBe("narrow-only");
    expect(failedAlternative.recoveryHint?.sourceOperations).toEqual(["scout.getBuilders"]);
    expect(failedAlternative.recoveryHint?.candidates.map((candidate) => candidate.id)).toEqual([
      "lumenloop.search_content_semantic",
      "scout.searchResearch"
    ]);

    const lumenloopDirectory = await run(`async () => {
      const directory = await lumenloop.search_directory({ query: "Example Builder", limit: 1 });
      return { directoryOk: directory.ok };
    }`);
    expect(lumenloopDirectory.ok).toBe(true);
    if (!lumenloopDirectory.ok) throw new Error(lumenloopDirectory.error);
    expect(lumenloopDirectory.operationSummary?.candidateEvidence).toBe(1);
    expect(lumenloopDirectory.recoveryHint?.mode).toBe("narrow-only");
    expect(lumenloopDirectory.recoveryHint?.sourceOperations).toEqual([
      "lumenloop.search_directory"
    ]);
    expect(lumenloopDirectory.recoveryHint?.candidates.map((candidate) => candidate.id)).toEqual([
      "lumenloop.search_content_semantic",
      "scout.searchProjects",
      "scout.searchResearch"
    ]);

    const scoutDirectory = await run(`async () => {
      const projects = await scout.searchProjects({ query: "Example Builder", limit: 1 });
      return { projectsOk: projects.ok };
    }`);
    expect(scoutDirectory.ok).toBe(true);
    if (!scoutDirectory.ok) throw new Error(scoutDirectory.error);
    expect(scoutDirectory.operationSummary?.candidateEvidence).toBe(1);
    expect(scoutDirectory.recoveryHint?.mode).toBe("narrow-only");
    expect(scoutDirectory.recoveryHint?.sourceOperations).toEqual(["scout.searchProjects"]);
    expect(scoutDirectory.recoveryHint?.candidates.map((candidate) => candidate.id)).toEqual([
      "lumenloop.search_content_semantic",
      "scout.searchResearch",
      "scout.searchRepos"
    ]);

    const broadened = await run(`async () => {
      const [builders, semantic] = await Promise.all([
        scout.getBuilders({ q: "Example Builder", limit: 1 }),
        lumenloop.search_content_semantic({ query: "Example Builder", limit: 1 })
      ]);
      return { buildersOk: builders.ok, semanticOk: semantic.ok };
    }`);
    expect(broadened.ok).toBe(true);
    if (!broadened.ok) throw new Error(broadened.error);
    expect(broadened.operationSummary?.candidateEvidence).toBe(1);
    expect(broadened.recoveryHint?.mode).toBe("conditional-alternatives");
    expect(broadened.recoveryHint?.sourceOperations).toEqual([
      "lumenloop.search_content_semantic"
    ]);
    expect(broadened.recoveryHint?.candidates.map((candidate) => candidate.id)).toEqual([
      "scout.searchResearch",
      "stellarDocs.search_docs",
      "lumenloop.find_av_passages"
    ]);

    const docsOnly = await run(`async () => {
      const docs = await stellarDocs.search_docs({ query: "exact official wording", hitsPerPage: 1 });
      return { docsOk: docs.ok };
    }`);
    expect(docsOnly.ok).toBe(true);
    if (!docsOnly.ok) throw new Error(docsOnly.error);
    expect(docsOnly.operationSummary?.candidateEvidence).toBeUndefined();
    expect(docsOnly.recoveryHint?.mode).toBe("conditional-alternatives");
    expect(docsOnly.recoveryHint?.sourceOperations).toEqual(["stellarDocs.search_docs"]);
    expect(docsOnly.recoveryHint?.candidates.map((candidate) => candidate.id)).toEqual([
      "scout.searchResearch",
      "lumenloop.search_content_semantic",
      "stellarDocs.search_meeting_notes"
    ]);

    const unprofiledSemantic = await run(`async () => {
      const [builders, similar] = await Promise.all([
        scout.getBuilders({ q: "Example Builder", limit: 1 }),
        lumenloop.find_similar_projects_semantic({ slug: "example", limit: 1 })
      ]);
      return { buildersOk: builders.ok, similarOk: similar.ok };
    }`);
    expect(unprofiledSemantic.ok).toBe(true);
    if (!unprofiledSemantic.ok) throw new Error(unprofiledSemantic.error);
    expect(unprofiledSemantic.operationSummary?.candidateEvidence).toBeUndefined();
    expect(unprofiledSemantic.recoveryHint).toBeUndefined();
  });

  it("ownerless truncated results get a generic unavailable artifact line with no auth-mode wording", async () => {
    const outcome = await run(BIG_SECRET_RESULT_CODE);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) throw new Error(outcome.error);
    expect(outcome.truncated).toBe(true);
    expect(outcome.result).toContain("artifact: absent (unavailable)");
    const artifactLine = outcome.result.split("\n").find((line) => line.startsWith("artifact:")) ?? "";
    expect(artifactLine).not.toMatch(/admin|dev|local|oauth/i);
  });

  it("reads artifacts inside the sandbox for the same owner, rejects other owners, and caps read loops", async () => {
    const owner = uniqueOwner("read");
    const written = await run(BIG_SECRET_RESULT_CODE, { artifactOwner: owner });
    expect(written.ok).toBe(true);
    if (!written.ok) throw new Error(written.error);
    const id = artifactIdFrom(written.result);

    const sameOwner = await run(`async () => {
      const r = await codemode.artifact.read("${id}");
      return {
        ok: r.ok,
        count: r.data.rows.length,
        firstSecret: r.data.rows[0].nested.envSecret
      };
    }`, { artifactOwner: owner });
    expect(sameOwner.ok).toBe(true);
    if (sameOwner.ok) {
      expect(JSON.parse(sameOwner.result)).toEqual({
        ok: true,
        count: 2500,
        firstSecret: "[REDACTED]"
      });
      expect(sameOwner.evidenceSummary.artifactReads).toBe(1);
      expect(sameOwner.artifactReadBytes).toBeGreaterThan(24_000);
    }

    const wrongOwner = await run(`async () => {
      const r = await codemode.artifact.read("${id}");
      return { ok: r.ok, kind: r.error.kind, message: r.error.message };
    }`, { artifactOwner: uniqueOwner("wrong") });
    expect(wrongOwner.ok).toBe(true);
    if (wrongOwner.ok) {
      expect(JSON.parse(wrongOwner.result)).toEqual({
        ok: false,
        kind: "error",
        message: "artifact not found"
      });
    }

    const capped = await run(`async () => {
      let last = null;
      for (let i = 0; i < 5; i++) last = await codemode.artifact.read("${id}");
      return { ok: last.ok, message: last.error.message };
    }`, { artifactOwner: owner });
    expect(capped.ok).toBe(true);
    if (capped.ok) {
      expect(JSON.parse(capped.result)).toEqual({
        ok: false,
        message: "artifact read cap exceeded: max 4 reads per execute"
      });
      expect(capped.evidenceSummary.artifactReads).toBe(5);
      expect(capped.artifactReadBytes).toBeGreaterThan(24_000 * 4);
    }
  });

  /**
   * The full artifact-continuation sequence at the real worker boundary. This
   * test proves that a lost tail remains recoverable from the artifact.
   *
   * The sentinel exists ONLY near the tail of the original result, so it is
   * absent from the truncated first result by construction — recovering it in
   * the answer proves continuation, not luck. Nothing here raises the result
   * cap and nothing reads the artifact automatically.
   */
  describe("artifact continuation recovers a lost tail through the artifact store", () => {
    const SENTINEL = "RAVEN-TAIL-SENTINEL-7f3a";
    // `tailNote` is serialized LAST, so the model boundary cuts it first.
    const TAIL_SENTINEL_CODE = `async () => ({
      rows: Array.from({ length: 900 }, (_, i) => ({ i, pad: "y".repeat(24) })),
      tailNote: "${SENTINEL}"
    })`;

    it("loses the tail at the boundary, then recovers it via info + read + a bounded projection", async () => {
      const owner = uniqueOwner("continuation");
      const first = await run(TAIL_SENTINEL_CODE, { artifactOwner: owner });
      expect(first.ok).toBe(true);
      if (!first.ok) throw new Error(first.error);

      // 1–2: an oversized result, one owner-bound handle, and a genuinely lost tail.
      expect(first.truncated).toBe(true);
      expect(first.result).toContain("--- SOURCE BASIS ---");
      expect(first.result).not.toContain(SENTINEL);
      const id = artifactIdFrom(first.result);
      expect(first.sourceBasis?.artifact?.state).toBe("available");

      // 3–7: ONE follow-up execute calls info, then read, branches on r.ok,
      // reads the full value from r.data, and returns a bounded projection.
      const continuation = await run(`async () => {
        const meta = await codemode.artifact.info("${id}");
        if (!meta.ok) return { stage: "info", ok: false, error: meta.error };
        const r = await codemode.artifact.read("${id}");
        if (!r.ok) return { stage: "read", ok: false, error: r.error };
        return {
          stage: "projection",
          ok: true,
          tail: r.data.tailNote,
          rowCount: r.data.rows.length,
          bytes: meta.data.bytes,
          originalChars: meta.data.originalChars
        };
      }`, { artifactOwner: owner });
      expect(continuation.ok).toBe(true);
      if (!continuation.ok) throw new Error(continuation.error);

      const projection = JSON.parse(continuation.result) as {
        stage: string;
        ok: boolean;
        tail: string;
        rowCount: number;
        bytes: number;
        originalChars: number;
      };
      expect(projection.stage).toBe("projection");
      // 1 (host-side proof): the original result really exceeded 24,000 chars.
      expect(projection.originalChars).toBeGreaterThan(24_000);
      expect(projection.bytes).toBeGreaterThan(24_000);
      expect(projection.rowCount).toBe(900);
      // 8–9: the sentinel survives and the projection itself does not truncate.
      expect(projection.tail).toBe(SENTINEL);
      expect(continuation.truncated).toBe(false);
      expect(continuation.result).not.toContain("--- SOURCE BASIS ---");
      expect(continuation.evidenceSummary.artifactReads).toBe(1);
      expect(continuation.artifactReadBytes).toBeGreaterThan(24_000);
      expect(continuation.evidenceSummary?.kind).toBe("artifact-data");

      // 10: the answer built from that projection carries the fact, not the handle.
      const finalAnswer = `The stored tail marker is ${projection.tail} across ${projection.rowCount} rows.`;
      expect(finalAnswer).toContain(SENTINEL);
      expect(finalAnswer).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/);
    });

    it("keeps every recovery failure fail-closed: missing, expired, oversized, and wrong-level reads", async () => {
      const owner = uniqueOwner("continuation-failures");

      // Missing: a well-formed id that was never written stays not-found.
      const missing = await run(`async () => {
        const r = await codemode.artifact.read("${crypto.randomUUID()}");
        return { ok: r.ok, kind: r.error.kind, message: r.error.message };
      }`, { artifactOwner: owner });
      expect(missing.ok).toBe(true);
      if (missing.ok) {
        expect(JSON.parse(missing.result)).toEqual({
          ok: false,
          kind: "error",
          message: "artifact not found"
        });
      }

      // Expired: an object whose stored expiresAt has passed reads as not-found,
      // through info AND read (TTL is enforced on metadata, not on listing).
      const expiredId = crypto.randomUUID();
      const body = '{"a":1}';
      await env.ARTIFACTS.put(`${await ownerPrefix(owner)}${expiredId}`, body, {
        customMetadata: {
          createdAt: "2020-01-01T00:00:00.000Z",
          expiresAt: "2020-01-08T00:00:00.000Z",
          bytes: "7",
          sha256: "0".repeat(64),
          mime: "application/json",
          requestId: "smoke-expired",
          rayId: "smoke-expired",
          capTokens: "6000",
          originalChars: "30000",
          opLedger: "{}",
          catalogGeneratedAt: "2020-01-01T00:00:00.000Z"
        }
      });
      const expired = await run(`async () => {
        const meta = await codemode.artifact.info("${expiredId}");
        const r = await codemode.artifact.read("${expiredId}");
        return { infoOk: meta.ok, infoMessage: meta.error.message, readOk: r.ok, readMessage: r.error.message };
      }`, { artifactOwner: owner });
      expect(expired.ok).toBe(true);
      if (expired.ok) {
        expect(JSON.parse(expired.result)).toEqual({
          infoOk: false,
          infoMessage: "artifact not found",
          readOk: false,
          readMessage: "artifact not found"
        });
      }

      // Oversized: past ARTIFACT_MAX_BYTES nothing is stored, and the source
      // basis says so instead of advertising an unreadable handle.
      const oversized = await run(
        'async () => ({ pad: "z".repeat(2_200_000) })',
        { artifactOwner: uniqueOwner("continuation-oversized") }
      );
      expect(oversized.ok).toBe(true);
      if (!oversized.ok) throw new Error(oversized.error);
      expect(oversized.truncated).toBe(true);
      expect(oversized.result).toContain("artifact: skipped (size-cap)");
      expect(oversized.result).not.toContain("artifact: id=");

      // Wrong-level read: the artifact read result goes through the same
      // fail-loud guard as every service call — no second successful shape.
      const written = await run(TAIL_SENTINEL_CODE, { artifactOwner: owner });
      expect(written.ok).toBe(true);
      if (!written.ok) throw new Error(written.error);
      const id = artifactIdFrom(written.result);
      const wrongLevel = await run(`async () => {
        const r = await codemode.artifact.read("${id}");
        let pointer = "";
        try {
          r.tailNote; // wrong level — must throw a pointer at r.data.tailNote
        } catch (e) {
          pointer = String(e && e.message);
        }
        return { ok: r.ok, viaData: r.data.tailNote, pointer };
      }`, { artifactOwner: owner });
      expect(wrongLevel.ok).toBe(true);
      if (wrongLevel.ok) {
        const parsed = JSON.parse(wrongLevel.result) as { ok: boolean; viaData: string; pointer: string };
        expect(parsed.ok).toBe(true);
        expect(parsed.viaData).toBe(SENTINEL);
        expect(parsed.pointer).toContain("r.data.tailNote");
      }
    });
  });

  it("sandbox has NO network: fetch() rejects (globalOutbound: null)", async () => {
    const outcome = await run(`async () => {
      try {
        await fetch("https://example.com");
        return { fetched: true };
      } catch (e) {
        return { fetched: false, message: String(e && e.message) };
      }
    }`);
    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      const parsed = JSON.parse(outcome.result) as { fetched: boolean; message: string };
      expect(parsed.fetched).toBe(false);
      expect(parsed.message.length).toBeGreaterThan(0);
    }
  });

  it("a build-excluded op has NO sandbox fn — calling it fails loudly (ADR-0003)", async () => {
    const outcome = await run(`async () => {
      try {
        await scout.submitPartnerListing({});
        return { threw: false };
      } catch (e) {
        return { threw: true, message: String(e && e.message) };
      }
    }`);
    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      const parsed = JSON.parse(outcome.result) as { threw: boolean; message: string };
      expect(parsed.threw).toBe(true); // unknown name — nothing uncallable exists
    }
  });

  it("guards a FAILED envelope: r.data warns undefined, writes go through", async () => {
    // An arg-validation refusal produces the { ok: false } envelope entirely offline.
    const outcome = await run(`async () => {
      const r = await lumenloop.search_directory({ limit: 2 }); // missing required query
      const dataIsUndefined = r.data === undefined; // logs the [envelope] warning
      r.note = "write-through ok"; // decorating the envelope stays legal
      return { dataIsUndefined, note: r.note };
    }`);
    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(JSON.parse(outcome.result)).toEqual({ dataIsUndefined: true, note: "write-through ok" });
      expect(outcome.logs.join("\n")).toContain("[envelope] lumenloop.search_directory");
    }
  });

  it("guards a SUCCESSFUL envelope: payload reads on the envelope throw a r.data.* pointer", async () => {
    // One stubbed upstream response → a real { ok: true, data } envelope
    // through the actual lumenloop adapter + guard prelude, no live traffic.
    // Host-side adapters run in this isolate, so the global stub reaches them.
    vi.stubGlobal("fetch", async (input: RequestInfo | URL) => {
      const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
      expect(url.href).toBe("https://api.lumenloop.com/v1/tools/search_directory");
      return Response.json({
        success: true,
        data: { count: 1, projects: [{ slug: "smoke-project" }] },
        meta: { tool: "search_directory", format: "json" }
      });
    });
    const outcome = await run(`async () => {
      const dir = await lumenloop.search_directory({ query: "smoke" });
      let payloadReadError = "";
      try {
        dir.projects; // wrong level — must throw a pointer at dir.data.projects
      } catch (e) {
        payloadReadError = String(e && e.message);
      }
      return { ok: dir.ok, viaData: dir.data.count, payloadReadError };
    }`);
    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.result).toContain(SOURCE_METADATA_MARKER);
      expect(outcome.result).not.toContain(SOURCE_BASIS_MARKER);
      const parsed = parseResultJsonWithMetadata(outcome.result) as {
        ok: boolean;
        viaData: number;
        payloadReadError: string;
      };
      expect(parsed.ok).toBe(true);
      expect(parsed.viaData).toBe(1);
      expect(parsed.payloadReadError).toContain("r.data.projects");
    }
  });

  it("guards a skill.read result: reading .data throws a pointer to top-level content", async () => {
    const outcome = await run(`async () => {
      const skill = await codemode.skill.read("skills.lumenloop.stellar-project-dossier");
      let dataReadError = "";
      try {
        skill.data; // wrong shape — skill content is top-level, not under .data
      } catch (e) {
        dataReadError = String(e && e.message);
      }
      return { ok: skill.ok, hasContent: typeof skill.content === "string", dataReadError };
    }`);
    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      const parsed = JSON.parse(outcome.result) as {
        ok: boolean;
        hasContent: boolean;
        dataReadError: string;
      };
      expect(parsed.ok).toBe(true);
      expect(parsed.hasContent).toBe(true);
      expect(parsed.dataReadError).toContain("top level");
      expect(outcome.evidenceSummary.kind).toBe("skill-content");
    }
  });

  it("appends the sandbox globals hint to an 'is not defined' error", async () => {
    const outcome = await run(`async () => { return nope.doThing(); }`);
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.error).toMatch(/is not defined/);
      expect(outcome.error).toContain("the only globals available in the sandbox are:");
      expect(outcome.error).toContain("lumenloop");
      expect(outcome.error).toContain("codemode");
    }
  });

  it("leaves a non-ReferenceError message unchanged (no globals hint)", async () => {
    const outcome = await run(`async () => { throw new Error("plain-boom"); }`);
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.error).toContain("plain-boom");
      expect(outcome.error).not.toContain("the only globals available");
    }
  });

  it("in-sandbox discovery works offline: codemode.search + catalog() + skill.read", async () => {
    const outcome = await run(`async () => {
      const found = await codemode.search("search directory");
      const catalog = await codemode.catalog();
      const skill = await codemode.skill.read("skills.lumenloop.stellar-project-dossier");
      return {
        topHit: found.ok ? found.hits[0]?.id ?? null : null,
        confidence: found.ok ? found.confidence : null,
        recoveryMetadata: found.ok ? found.recoveryMetadata : null,
        allCallable: catalog.entries.every((e) => !("policy" in e)), // ADR-0003: no policy layer
        skillOk: skill.ok === true && skill.availableSections.length > 0
      };
    }`);
    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      const parsed = JSON.parse(outcome.result) as {
        topHit: string | null;
        confidence: { hitCount: number; topScoreGap: number | null } | null;
        recoveryMetadata: { serviceFilterExcludedSkills: unknown[] } | null;
        allCallable: boolean;
        skillOk: boolean;
      };
      expect(parsed.topHit).toBe("lumenloop.search_directory");
      expect(parsed.confidence?.hitCount).toBeGreaterThan(0);
      const gap = parsed.confidence?.topScoreGap;
      expect(gap === null || gap === undefined || gap >= 0).toBe(true);
      expect(parsed.recoveryMetadata?.serviceFilterExcludedSkills).toEqual([]);
      expect(parsed.allCallable).toBe(true);
      expect(parsed.skillOk).toBe(true);
      expect(outcome.evidenceSummary.kind).toBe("skill-content");
    }
  });

  it("captures console output as shaped logs", async () => {
    const outcome = await run(`async () => {
      console.log("smoke line one");
      console.error("smoke line two");
      return "done";
    }`);
    expect(outcome.ok).toBe(true);
    const joined = outcome.logs.join("\n");
    expect(joined).toContain("smoke line one");
    expect(joined).toContain("smoke line two");
  });

  it("surfaces sandbox throws as { ok: false } with the error text", async () => {
    const outcome = await run(`async () => { throw new Error("smoke-kaboom"); }`);
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.error).toContain("smoke-kaboom");
      expect(outcome.operationSummary).toEqual({ total: 0, ok: 0, error: 0, softEmpty: 0 });
      expect(outcome.evidenceSummary).toEqual({
        kind: "none",
        skillRead: false,
        buildAuthoritySkillIds: [],
        buildAuthorityRoles: [],
        skillRuns: 0,
        artifactReads: 0
      });
    }
  });
});

describe("codemode.skill.run at the real worker boundary (design §12 smoke)", () => {
  /**
   * Route the host-side lumenloop adapter to the captured runner
   * fixtures (test/fixtures/skill-runners/, production 2026-07-06) by tool
   * name — the run crosses the true chain: sandbox prelude → provider RPC →
   * runSkill → recording sub-facade → adapter fetch. This lane is offline by
   * design (miniflare outboundService), so the wrangler-dev/live lane guards
   * against upstream payload drift. This smoke pins the full dispatch path
   * and envelope semantics at the workerd boundary.
   */
  const stubLumenloop = (routes: Record<string, unknown>) => {
    vi.stubGlobal("fetch", async (input: RequestInfo | URL) => {
      const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
      expect(url.pathname.startsWith("/v1/tools/")).toBe(true);
      const tool = url.pathname.slice("/v1/tools/".length);
      const data = routes[tool];
      if (data === undefined) {
        return Response.json(
          { success: false, error: `smoke stub: unstubbed lumenloop tool "${tool}"` },
          { status: 500 }
        );
      }
      return Response.json({ success: true, data, meta: { tool, format: "json" } });
    });
  };

  it("digest run (theme mode): envelope, sections non-null, host `calls` ledger all ok, guard traps live", async () => {
    stubLumenloop({
      search_content_semantic: fxSemantic.data,
      list_documents: fxListDocs.data
    });
    const outcome = await run(`async () => {
      const r = await codemode.skill.run("skills.lumenloop.stellar-ecosystem-digest", { subject: "RWA tokenization" });
      let envelopeTrap = "";
      try {
        r.items; // payload read on the envelope — must throw an r.data.* pointer
      } catch (e) {
        envelopeTrap = String(e && e.message);
      }
      return {
        ok: r.ok,
        window: r.data.window,
        softEmpty: r.data.softEmpty,
        sectionsNonNull: [r.data.items, r.data.upcomingEvents].every((s) => s !== null),
        itemCount: r.data.items === null ? null : r.data.items.length,
        upcomingCount: r.data.upcomingEvents === null ? null : r.data.upcomingEvents.length,
        calls: r.data.calls.map((c) => ({ op: c.op, ok: c.ok })),
        envelopeTrap
      };
    }`);
    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      const parsed = JSON.parse(outcome.result) as {
        ok: boolean;
        window: { dateStart: string; dateEnd: string };
        softEmpty: boolean;
        sectionsNonNull: boolean;
        itemCount: number | null;
        upcomingCount: number | null;
        calls: { op: string; ok: boolean }[];
        envelopeTrap: string;
      };
      expect(parsed.ok).toBe(true);
      expect(parsed.window.dateStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(parsed.window.dateEnd).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(parsed.softEmpty).toBe(false);
      expect(parsed.sectionsNonNull).toBe(true);
      expect(parsed.itemCount).toBeGreaterThan(0);
      expect(parsed.upcomingCount).toBeGreaterThan(0);
      expect(parsed.calls.map((c) => c.op).sort()).toEqual([
        "lumenloop.list_documents",
        "lumenloop.search_content_semantic"
      ]);
      expect(parsed.calls.every((c) => c.ok)).toBe(true);
      expect(parsed.envelopeTrap).toContain("r.data.items");
    }
  });

  it("unknown runnable name fails AS DATA naming the runnable set + nearest suggestion (no fetch needed)", async () => {
    const outcome = await run(`async () => {
      const r = await codemode.skill.run("skills.lumenloop.stellar-ecosystem-diges", { subject: "RWA" });
      const dataIsUndefined = r.data === undefined; // ok:false envelope — logs the [envelope] warning
      return { ok: r.ok, message: r.error.message, dataIsUndefined };
    }`);
    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      const parsed = JSON.parse(outcome.result) as { ok: boolean; message: string; dataIsUndefined: boolean };
      expect(parsed.ok).toBe(false);
      expect(parsed.message).toContain('unknown runnable skill "skills.lumenloop.stellar-ecosystem-diges"');
      expect(parsed.message).toContain("skills.lumenloop.stellar-ecosystem-digest");
      expect(parsed.message).toContain('Did you mean "skills.lumenloop.stellar-ecosystem-digest"?');
      // The retired dossier runner must not be advertised as runnable.
      expect(parsed.message).not.toContain("stellar-project-dossier");
      expect(parsed.dataIsUndefined).toBe(true);
    }
  });
});

describe("spec-search runner (kept for A/Bs, ADR-0001)", () => {
  it("evaluates codemode.spec() queries in a no-provider sandbox", async () => {
    const runSearch = createSpecSearchRunner(env as unknown as Env); // same OAUTH_PROVIDER bridge as above
    const outcome = await runSearch(`async () => {
      const spec = await codemode.spec();
      return { services: Object.keys(spec).length };
    }`);
    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      const parsed = JSON.parse(outcome.result) as { services: number };
      expect(parsed.services).toBeGreaterThan(0);
    }
  });
});
