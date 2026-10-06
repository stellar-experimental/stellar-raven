/**
 * Adapter unit tests — recorded live fixtures (test/fixtures/, captured
 * 2026-07-02 from one real call each, free ops only), replayed through an
 * injected FetchLike. Per service: one success, one soft-empty, one error —
 * the three-way outcome contract in ARCHITECTURE.md: soft-empty ≠ error ≠ data.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadManifest, type Catalog, type CatalogEntry } from "../src/catalog/search.ts";
import { callLumenloop } from "../src/adapters/lumenloop.ts";
import { callScout } from "../src/adapters/scout.ts";
import { callStellarDocs } from "../src/adapters/stellar-docs.ts";
import type { FetchLike } from "../src/adapters/types.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalog: Catalog = loadManifest(
  JSON.parse(readFileSync(join(ROOT, "catalog", "manifest.json"), "utf8"))
);

function entry(id: string): CatalogEntry {
  const e = catalog.entries.find((x) => x.id === id);
  if (!e) throw new Error(`missing catalog entry ${id}`);
  return e;
}

function fixture(name: string): string {
  return readFileSync(join(ROOT, "test", "fixtures", name), "utf8");
}

/** Fixture-backed fetch that also records the request for assertions. */
function stubFetch(
  body: string,
  status: number,
  contentType = "application/json"
): { fetchImpl: FetchLike; calls: { url: string; init?: RequestInit }[] } {
  const calls: { url: string; init?: RequestInit }[] = [];
  const fetchImpl: FetchLike = async (url, init) => {
    calls.push({ url, init });
    return new Response(body, { status, headers: { "content-type": contentType } });
  };
  return { fetchImpl, calls };
}

const env = { LUMENLOOP_API_KEY: "test-key-not-real-1234" };
const docsEnv = { ALGOLIA_APPLICATION_ID_DOCS: "TESTAPPID", ALGOLIA_API_KEY_DOCS: "test-algolia-key-1234" };

describe("lumenloop adapter", () => {
  it("maps success envelope (format json) to ok/data", async () => {
    const { fetchImpl, calls } = stubFetch(fixture("lumenloop-success.json"), 200);
    const r = await callLumenloop(
      entry("lumenloop.search_directory"),
      { query: "soroban defi", limit: 3 },
      env,
      fetchImpl
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect((r.data as { count: number }).count).toBe(2);
    // the envelope is exactly { ok, data } — upstream meta is not forwarded
    expect(Object.keys(r).sort()).toEqual(["data", "ok"]);
    // transport truth: POST to the entry's path with bearer auth
    expect(calls[0]?.url).toBe("https://api.lumenloop.com/v1/tools/search_directory");
    expect(calls[0]?.init?.method).toBe("POST");
    expect((calls[0]?.init?.headers as Record<string, string>).Authorization).toBe(
      "Bearer test-key-not-real-1234"
    );
    expect(calls[0]?.init?.body).toBe(JSON.stringify({ query: "soroban defi", limit: 3 }));
  });

  it("normalizes semantic collections into the documented ranked item contract", async () => {
    const body = JSON.stringify({
      success: true,
      data: {
        articles: [{ id: "article", similarity: 0.2 }],
        events: [{ id: "event", similarity: 0.8 }],
        av: [],
        query: "Stellar smart contracts"
      },
      meta: { format: "json", tool: "search_content_semantic" }
    });
    const { fetchImpl } = stubFetch(body, 200);
    const r = await callLumenloop(
      entry("lumenloop.search_content_semantic"),
      { query: "Stellar smart contracts", limit: 5 },
      env,
      fetchImpl
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data).toEqual({
      items: [
        { id: "event", similarity: 0.8, collection: "events" },
        { id: "article", similarity: 0.2, collection: "articles" }
      ],
      counts: { articles: 1, events: 1, av: 0 },
      meta: { query: "Stellar smart contracts" }
    });
  });

  it("maps format:text under success:true to soft-empty (guidance, not evidence)", async () => {
    const { fetchImpl } = stubFetch(fixture("lumenloop-soft-empty.json"), 200);
    const r = await callLumenloop(
      entry("lumenloop.find_content_about_project"),
      { slug: "definitely-not-a-real-slug-xyz" },
      env,
      fetchImpl
    );
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.kind).toBe("soft-empty");
    expect(r.error.message).toContain("search_directory");
    expect(r.error.hint).toContain("search_content_semantic");
    expect(r.error.hint).toContain("exact identity");
  });

  it("maps 400 invalid_arguments to a typed error with code + hint + details", async () => {
    const { fetchImpl } = stubFetch(fixture("lumenloop-error.json"), 400);
    const r = await callLumenloop(entry("lumenloop.search_directory"), {}, env, fetchImpl);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.kind).toBe("error");
    expect(r.error.status).toBe(400);
    expect(r.error.code).toBe("invalid_arguments");
    expect(r.error.hint).toContain("argument schema");
    expect(Array.isArray(r.error.details)).toBe(true);
  });

  it("fails as data (not throw) when the key is missing", async () => {
    const r = await callLumenloop(entry("lumenloop.search_directory"), { query: "x" }, {});
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.message).toContain("LUMENLOOP_API_KEY");
  });
});

describe("scout adapter", () => {
  it("passes the body through unchanged on success (rows stay resource-keyed)", async () => {
    const { fetchImpl, calls } = stubFetch(fixture("scout-success.json"), 200);
    const r = await callScout(entry("scout.getStatus"), {}, {}, fetchImpl);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const data = r.data as { sources: unknown[]; apiVersion: string };
    expect(data.apiVersion).toBe("1.2.1");
    expect(Array.isArray(data.sources)).toBe(true); // no reshaping into rows[]
    expect(calls[0]?.url).toBe("https://stellarlight.xyz/api/status");
  });

  it("builds GET query strings and fills path templates", async () => {
    const { fetchImpl, calls } = stubFetch(fixture("scout-success.json"), 200);
    await callScout(
      entry("scout.searchResearch"),
      { q: "passkey smart wallet", limit: 2 },
      {},
      fetchImpl
    );
    expect(calls[0]?.url).toBe(
      "https://stellarlight.xyz/api/research?q=passkey+smart+wallet&limit=2"
    );
    await callScout(entry("scout.getSkill"), { name: "stellar-scout" }, {}, fetchImpl);
    expect(calls[1]?.url).toBe("https://stellarlight.xyz/api/skills/stellar-scout");
  });

  it("serializes project type and lifecycle filters from the refreshed contract", async () => {
    const { fetchImpl, calls } = stubFetch(fixture("scout-success.json"), 200);
    await callScout(
      entry("scout.searchProjects"),
      { type: "Wallet", status: "Live", limit: 5 },
      {},
      fetchImpl
    );
    expect(calls[0]?.url).toBe(
      "https://stellarlight.xyz/api/projects/search?type=Wallet&status=Live&limit=5"
    );
  });

  it.each([
    { projects: [], counts: { returned: 0, total: 0 } },
    { projects: [{ name: "Wallet" }], counts: { returned: 1, total: 1 } }
  ])("maps a failed backend read to error regardless of returned rows: %j", async (payload) => {
    const warning = "backend read failed: operation timed out";
    const warnings = [
      "Unknown parameter(s) ignored: unreadProbe. Results are NOT filtered by them.",
      warning,
      "backend read failed: secondary lookup timed out"
    ];
    const { fetchImpl } = stubFetch(
      JSON.stringify({
        projects: payload.projects,
        meta: { counts: payload.counts, warnings }
      }),
      200
    );
    const r = await callScout(entry("scout.searchProjects"), { q: "wallet" }, {}, fetchImpl);
    expect(r).toEqual({
      ok: false,
      error: {
        service: "scout",
        kind: "error",
        status: 200,
        message: warning,
        hint: "The Scout backend read failed transiently. Retry once. If the read still fails, report the result as inconclusive.",
        details: { warnings }
      }
    });
  });

  it.each([
    { projects: [], counts: { returned: 0, total: 0 } },
    { projects: [{ name: "Wallet" }], counts: { returned: 1, total: 303 } }
  ])("maps meta.partial to error regardless of returned rows: %j", async (payload) => {
    const failedReads = [
      { read: "projects search", cause: "timeout after 4000ms" },
      { read: "repos search", cause: "MongoServerSelectionError" }
    ];
    const { fetchImpl } = stubFetch(
      JSON.stringify({
        projects: payload.projects,
        meta: { counts: payload.counts, partial: true, failedReads }
      }),
      200
    );
    const r = await callScout(entry("scout.searchProjects"), { q: "wallet" }, {}, fetchImpl);
    expect(r).toEqual({
      ok: false,
      error: {
        service: "scout",
        kind: "error",
        status: 200,
        message:
          "backend read failed: projects search (timeout after 4000ms); repos search (MongoServerSelectionError)",
        hint: "The Scout backend read failed transiently. Retry once. If the read still fails, report the result as inconclusive.",
        details: { failedReads }
      }
    });
  });

  it("names a partial page without failedReads and keeps its warnings", async () => {
    const warnings = ["Keyword fallback used after vector search failed."];
    const { fetchImpl } = stubFetch(
      JSON.stringify({ projects: [{ name: "Wallet" }], meta: { partial: true, warnings } }),
      200
    );
    const r = await callScout(entry("scout.searchProjects"), { q: "wallet" }, {}, fetchImpl);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toMatchObject({
      kind: "error",
      status: 200,
      message: "backend read failed: Scout marked the page partial",
      details: { warnings }
    });
  });

  it("keeps a complete page with meta.partial false successful", async () => {
    const body = {
      projects: [{ name: "Wallet" }],
      meta: { counts: { returned: 1, total: 1 }, partial: false, failedReads: [] }
    };
    const { fetchImpl } = stubFetch(JSON.stringify(body), 200);
    const r = await callScout(entry("scout.searchProjects"), { q: "wallet" }, {}, fetchImpl);
    expect(r).toEqual({ ok: true, data: body });
  });

  it("keeps unread-parameter warnings visible in successful data", async () => {
    const body = {
      projects: [{ name: "Wallet" }],
      meta: {
        counts: { returned: 1, total: 1 },
        warnings: [
          "Unknown parameter(s) ignored: unreadProbe. Results are NOT filtered by them. Supported: q, category, type, status, scfAwarded, limit, offset."
        ]
      }
    };
    const { fetchImpl } = stubFetch(JSON.stringify(body), 200);
    const r = await callScout(entry("scout.searchProjects"), { q: "wallet" }, {}, fetchImpl);
    expect(r).toEqual({ ok: true, data: body });
  });

  it.each(["backend read failed", "backend read failed (timeout)"])(
    "recognizes the failed-read warning family: %s",
    async (warning) => {
      const { fetchImpl } = stubFetch(
        JSON.stringify({ projects: [], meta: { warnings: [warning] } }),
        200
      );
      const r = await callScout(entry("scout.searchProjects"), { q: "wallet" }, {}, fetchImpl);
      expect(r.ok).toBe(false);
      if (r.ok) return;
      expect(r.error).toMatchObject({ kind: "error", status: 200, message: warning });
    }
  );

  it.each([
    ["Keyword fallback used after vector search failed."],
    ["Unknown parameter(s) ignored: backend read failed. Results are NOT filtered by them."],
    ["backend read failedness is not the failure prefix"],
    [null, { message: "backend read failed: timeout" }]
  ])("does not mistake other warnings for a failed backend read: %j", async (...warnings) => {
    const body = { projects: [{ name: "Wallet" }], meta: { warnings } };
    const { fetchImpl } = stubFetch(JSON.stringify(body), 200);
    const r = await callScout(entry("scout.searchProjects"), { q: "wallet" }, {}, fetchImpl);
    expect(r).toEqual({ ok: true, data: body });
  });

  it("keeps a genuine empty search successful", async () => {
    const body = { projects: [], meta: { counts: { returned: 0, total: 0 } } };
    const { fetchImpl } = stubFetch(JSON.stringify(body), 200);
    const r = await callScout(entry("scout.searchProjects"), { q: "missing" }, {}, fetchImpl);
    expect(r).toEqual({ ok: true, data: body });
  });

  it("keeps meta.error as soft-empty with the advisory", async () => {
    const advisory = { summary: "Supply a query or filter.", suggestions: ["Use q."] };
    const { fetchImpl } = stubFetch(
      JSON.stringify({ projects: [], meta: { error: "no_query" }, advisory }),
      200
    );
    const r = await callScout(entry("scout.searchProjects"), {}, {}, fetchImpl);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toMatchObject({
      kind: "soft-empty",
      status: 200,
      code: "no_query",
      message: advisory.summary,
      details: advisory
    });
    expect(r.error.hint).toContain("Scope this miss to the requested Scout record.");
  });

  it("gives a failed backend read priority over meta.error", async () => {
    const warning = "backend read failed: operation timed out";
    const { fetchImpl } = stubFetch(
      JSON.stringify({ projects: [], meta: { error: "no_query", warnings: [warning] } }),
      200
    );
    const r = await callScout(entry("scout.searchProjects"), {}, {}, fetchImpl);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toMatchObject({ kind: "error", status: 200, message: warning });
  });

  it("passes non-JSON (CSV) through as { text, contentType } in the data payload", async () => {
    const { fetchImpl } = stubFetch("rank,slug\n1,soroswap\n", 200, "text/csv");
    const r = await callScout(entry("scout.getLeaderboard"), { format: "csv" }, {}, fetchImpl);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const data = r.data as { text: string; contentType: string };
    expect(data.text).toContain("soroswap");
    expect(data.contentType).toBe("text/csv");
  });

  it("maps 404 unknown slug to soft-empty with the upstream hint", async () => {
    const { fetchImpl } = stubFetch(fixture("scout-soft-empty.json"), 404);
    const r = await callScout(entry("scout.getSkill"), { name: "nope-xyz" }, {}, fetchImpl);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.kind).toBe("soft-empty");
    expect(r.error.status).toBe(404);
    expect(r.error.hint).toContain("/api/skills");
    expect(r.error.hint).toContain("scout.searchResearch");
  });

  it("maps a NON-JSON 404 to soft-empty too (same contract as the JSON 404 branch)", async () => {
    const { fetchImpl } = stubFetch("<html>not found</html>", 404, "text/html");
    const r = await callScout(entry("scout.getSkill"), { name: "nope-xyz" }, {}, fetchImpl);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.kind).toBe("soft-empty");
    expect(r.error.status).toBe(404);
    expect(r.error.hint).toContain("open-world identity");
  });

  it("keeps a non-JSON non-404 upstream failure as kind error", async () => {
    const { fetchImpl } = stubFetch("upstream boom", 500, "text/plain");
    const r = await callScout(entry("scout.getSkill"), { name: "x" }, {}, fetchImpl);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.kind).toBe("error");
    expect(r.error.status).toBe(500);
  });

  it("maps 400 bad-enum to error carrying the valid* lists", async () => {
    const { fetchImpl } = stubFetch(fixture("scout-error.json"), 400);
    const r = await callScout(
      entry("scout.searchResearch"),
      { q: "x", source: "bogus" },
      {},
      fetchImpl
    );
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.kind).toBe("error");
    expect(r.error.status).toBe(400);
    const details = r.error.details as { validSources: string[] };
    expect(details.validSources).toContain("sep");
  });

  it("maps 503 unavailable AI endpoints to a non-retryable error with fallback hint", async () => {
    const { fetchImpl } = stubFetch(JSON.stringify({ error: "ai unavailable", unavailable: true }), 503);
    const r = await callScout(entry("scout.matchPartners"), { need: "an anchor" }, {}, fetchImpl);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.status).toBe(503);
    expect(r.error.hint).toContain("getPartners");
  });
});

describe("stellarDocs adapter", () => {
  it("shapes hits (breadcrumb + snippet) and sends op-pinned Algolia params", async () => {
    const { fetchImpl, calls } = stubFetch(fixture("stellar-docs-success.json"), 200);
    const r = await callStellarDocs(
      entry("stellarDocs.search_docs"),
      { query: "soroban storage", hitsPerPage: 3 },
      docsEnv,
      fetchImpl
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const data = r.data as { hits: { url: string; breadcrumb: string; snippet?: string }[]; nbHits: number };
    expect(data.nbHits).toBeGreaterThan(0);
    expect(data.hits[0]?.url).toContain("developers.stellar.org");
    expect(data.hits[0]?.breadcrumb.length).toBeGreaterThan(0);
    // host + index + params truth
    expect(calls[0]?.url).toBe(
      "https://TESTAPPID-dsn.algolia.net/1/indexes/crawler_Stellar%20Docs%20-%20Docusaurus/query"
    );
    const params = JSON.parse(String(calls[0]?.init?.body));
    expect(params.analytics).toBe(false);
    expect(params.query).toBe("soroban storage");
    expect(params.hitsPerPage).toBe(3);
    expect(params.facetFilters).toEqual([["docusaurus_tag:docs-default-current"]]);
    const headers = calls[0]?.init?.headers as Record<string, string>;
    expect(headers["X-Algolia-Application-Id"]).toBe("TESTAPPID");
  });

  for (const id of ["search_docs", "search_doc_titles", "search_meeting_notes"]) {
    it(`${id} sends the documented default and preserves explicit hit limits`, async () => {
      for (const limit of [undefined, 1, 20]) {
        const { fetchImpl, calls } = stubFetch(fixture("stellar-docs-success.json"), 200);
        await callStellarDocs(entry(`stellarDocs.${id}`), {
          query: "storage", ...(limit === undefined ? {} : { hitsPerPage: limit })
        }, docsEnv, fetchImpl);
        expect(JSON.parse(String(calls[0]?.init?.body)).hitsPerPage).toBe(limit ?? 5);
      }
    });
  }

  it("scopes page-section misses to the candidate windows and preserves recovery hints", async () => {
    const { fetchImpl, calls } = stubFetch(fixture("stellar-docs-soft-empty.json"), 200);
    const result = await callStellarDocs(entry("stellarDocs.get_doc_page_sections"), {
      path: "/docs/build/unknown-page"
    }, docsEnv, fetchImpl);
    expect(calls).toHaveLength(2);
    expect(result).toMatchObject({ ok: false, error: {
      kind: "soft-empty",
      message: "The page-section queries returned no matching records for /docs/build/unknown-page within their candidate windows. Check url_without_anchor from a search hit.",
      hint: expect.stringContaining("broad Lumenloop or Scout")
    } });
  });

  it("resolves credentials from whatever env pair the transport names (_SITE, not just _DOCS)", async () => {
    // The adapter is spec-driven: transport.applicationIdEnv/apiKeyEnv name
    // the pair (3ef9131 generalization). Prove it with a synthetic entry on
    // the OTHER prod pair, and that a missing named pair errs by name.
    const docsEntry = entry("stellarDocs.search_docs");
    const siteEntry: CatalogEntry = {
      ...docsEntry,
      id: "stellarOrg.search_site",
      transport: {
        ...docsEntry.transport!,
        applicationIdEnv: "ALGOLIA_APPLICATION_ID_SITE",
        apiKeyEnv: "ALGOLIA_API_KEY_SITE",
        hosts: ["{ALGOLIA_APPLICATION_ID_SITE}-dsn.algolia.net"]
      }
    };
    const siteEnv = { ALGOLIA_APPLICATION_ID_SITE: "SITEAPPID", ALGOLIA_API_KEY_SITE: "test-algolia-key-5678" };
    const { fetchImpl, calls } = stubFetch(fixture("stellar-docs-success.json"), 200);
    const r = await callStellarDocs(siteEntry, { query: "enterprise fund" }, siteEnv, fetchImpl);
    expect(r.ok).toBe(true);
    expect(calls[0]?.url).toContain("https://SITEAPPID-dsn.algolia.net/");
    const headers = calls[0]?.init?.headers as Record<string, string>;
    expect(headers["X-Algolia-Application-Id"]).toBe("SITEAPPID");
    expect(headers["X-Algolia-API-Key"]).toBe("test-algolia-key-5678");

    // The _DOCS pair must NOT satisfy a _SITE-declaring transport.
    const wrongPair = await callStellarDocs(siteEntry, { query: "x" }, docsEnv, fetchImpl);
    expect(wrongPair.ok).toBe(false);
    if (wrongPair.ok) return;
    expect(wrongPair.error.message).toContain("ALGOLIA_APPLICATION_ID_SITE");
  });

  it("applies the URL-prefix client filter with overfetch for category ops", async () => {
    const { fetchImpl, calls } = stubFetch(fixture("stellar-docs-success.json"), 200);
    const r = await callStellarDocs(
      entry("stellarDocs.search_soroban_contract_docs"),
      { query: "storage ttl", hitsPerPage: 2 },
      docsEnv,
      fetchImpl
    );
    const params = JSON.parse(String(calls[0]?.init?.body));
    expect(params.hitsPerPage).toBe(100); // overfetch pinned by the mapping
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const data = r.data as { hits: { url_without_anchor: string }[]; clientFiltered?: boolean };
    expect(data.clientFiltered).toBe(true);
    expect(data.hits.length).toBeLessThanOrEqual(2); // truncated to requested size
    for (const hit of data.hits) {
      expect(
        ["/docs/build/smart-contracts", "/docs/build/guides/", "/docs/learn/fundamentals/contract-development/", "/docs/tools/cli/"].some(
          (p) => hit.url_without_anchor.includes(p)
        )
      ).toBe(true);
    }
  });

  it("maps zero hits to a query-scoped soft-empty", async () => {
    const { fetchImpl } = stubFetch(fixture("stellar-docs-soft-empty.json"), 200);
    const r = await callStellarDocs(
      entry("stellarDocs.search_docs"),
      { query: "qqqzzzxxx wwwvvvuuu tttsssrrr" },
      docsEnv,
      fetchImpl
    );
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.kind).toBe("soft-empty");
    expect(r.error.message).toBe("This query returned no hits in the docs index with the operation filters.");
    expect(r.error.hint).toContain("docs index");
    expect(r.error.hint).toContain("open-world ecosystem identity");
  });

  it("returns 4xx as error without host retry", async () => {
    const { fetchImpl, calls } = stubFetch(fixture("stellar-docs-error.json"), 400);
    const r = await callStellarDocs(
      entry("stellarDocs.search_docs"),
      { query: "soroban" },
      docsEnv,
      fetchImpl
    );
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.kind).toBe("error");
    expect(r.error.status).toBe(400);
    expect(calls.length).toBe(1); // no retry ladder on request errors
  });

  it("returns non-JSON 4xx without retry and bounds the response fallback", async () => {
    const body = `bad request: ${"x".repeat(2048)}:unbounded-tail`;
    const { fetchImpl, calls } = stubFetch(body, 400, "text/plain");
    const r = await callStellarDocs(
      entry("stellarDocs.search_docs"),
      { query: "soroban" },
      docsEnv,
      fetchImpl
    );
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.status).toBe(400);
    expect(r.error.message).toContain("bad request");
    expect(r.error.message).not.toContain("unbounded-tail");
    expect(calls).toHaveLength(1);
  });

  it("returns malformed 2xx JSON without retry", async () => {
    const { fetchImpl, calls } = stubFetch("not JSON", 200, "text/plain");
    const r = await callStellarDocs(
      entry("stellarDocs.search_docs"),
      { query: "soroban" },
      docsEnv,
      fetchImpl
    );
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.status).toBe(200);
    expect(r.error.message).toContain("returned malformed JSON");
    expect(calls).toHaveLength(1);
  });

  it("retries the host ladder on 5xx and succeeds on a later host", async () => {
    let call = 0;
    const urls: string[] = [];
    const fetchImpl: FetchLike = async (url) => {
      urls.push(url);
      call += 1;
      if (call === 1) {
        return new Response(JSON.stringify({ message: "upstream boom" }), { status: 502 });
      }
      return new Response(fixture("stellar-docs-success.json"), { status: 200 });
    };
    const r = await callStellarDocs(
      entry("stellarDocs.search_docs"),
      { query: "soroban storage" },
      docsEnv,
      fetchImpl
    );
    expect(r.ok).toBe(true);
    expect(urls[0]).toContain("-dsn.algolia.net");
    expect(urls[1]).toContain("-1.algolianet.com");
    expect(urls).toHaveLength(2);
  });

  it("retries every host on malformed 5xx JSON", async () => {
    const { fetchImpl, calls } = stubFetch("not JSON", 502, "text/plain");
    const r = await callStellarDocs(
      entry("stellarDocs.search_docs"),
      { query: "soroban" },
      docsEnv,
      fetchImpl
    );
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.message).toContain("all algolia hosts failed");
    expect(calls).toHaveLength(4);
  });

  it("retries network failures and succeeds on a later host", async () => {
    let requestCount = 0;
    const fetchImpl: FetchLike = async () => {
      requestCount += 1;
      if (requestCount === 1) throw new TypeError("network unavailable");
      return new Response(fixture("stellar-docs-success.json"), { status: 200 });
    };
    const r = await callStellarDocs(
      entry("stellarDocs.search_docs"),
      { query: "soroban storage" },
      docsEnv,
      fetchImpl
    );
    expect(r.ok).toBe(true);
    expect(requestCount).toBe(2);
  });

  it("derives the query and filters to the exact page for get_doc_page_sections", async () => {
    // Synthetic records for one page + noise from another page.
    const page = "https://developers.stellar.org/docs/build/smart-contracts/getting-started/storing-data";
    const record = (anchor: string, position: number, url = page) => ({
      url: `${url}#${anchor}`,
      url_without_anchor: url,
      anchor,
      type: "content",
      hierarchy: { lvl0: "Documentation", lvl1: "3. Storing Data" },
      content: `section ${anchor}`,
      weight: { position }
    });
    const body = JSON.stringify({
      hits: [record("b", 2), record("a", 1), record("x", 0, "https://developers.stellar.org/docs/other")],
      nbHits: 3,
      page: 0,
      nbPages: 1,
      hitsPerPage: 100
    });
    const { fetchImpl, calls } = stubFetch(body, 200);
    const r = await callStellarDocs(
      entry("stellarDocs.get_doc_page_sections"),
      { path: "/docs/build/smart-contracts/getting-started/storing-data" },
      docsEnv,
      fetchImpl
    );
    const params = JSON.parse(String(calls[0]?.init?.body));
    expect(params.query).toBe("storing data"); // hyphens split, last segment
    expect(params.distinct).toBe(0);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const data = r.data as { sections: { anchor: string }[]; nbSections: number };
    expect(data.nbSections).toBe(2); // the other page's record was dropped
    expect(data.sections.map((s) => s.anchor)).toEqual(["a", "b"]); // weight.position order
  });

  it("retrieves every page section when the derived slug query matches only the page heading", async () => {
    const page = "https://developers.stellar.org/docs/tokens/control-asset-access";
    const record = (anchor: string, position: number, url = page) => ({
      url: `${url}#${anchor}`,
      url_without_anchor: url,
      anchor,
      type: "content",
      hierarchy: {
        lvl0: "Assets",
        lvl1: "Controlling Access to an Asset with Flags"
      },
      content: `section ${anchor}`,
      weight: { position }
    });
    const responses = [
      {
        hits: [record("controlling-access-to-an-asset-with-flags", 0)],
        nbHits: 1,
        page: 0,
        nbPages: 1,
        hitsPerPage: 100
      },
      {
        hits: [
          record("authorization-revocable-0x2", 2),
          record("authorization-required-0x1", 1),
          record("controlling-access-to-an-asset-with-flags", 0),
          record("noise", 0, "https://developers.stellar.org/docs/other")
        ],
        nbHits: 8,
        page: 0,
        nbPages: 2,
        hitsPerPage: 100
      },
      {
        hits: [
          record("authorization-immutable-0x4", 3),
          record("clawback-enabled-0x8", 4),
          record("set-trustline-flag-operation", 5),
          record("example-flow", 6)
        ],
        nbHits: 8,
        page: 1,
        nbPages: 2,
        hitsPerPage: 100
      }
    ];
    const calls: { url: string; init?: RequestInit }[] = [];
    const fetchImpl: FetchLike = async (url, init) => {
      calls.push({ url, init });
      const response = responses[calls.length - 1];
      if (!response) throw new Error("unexpected extra Algolia query");
      return new Response(JSON.stringify(response), { status: 200 });
    };

    const r = await callStellarDocs(
      entry("stellarDocs.get_doc_page_sections"),
      { path: "/docs/tokens/control-asset-access" },
      docsEnv,
      fetchImpl
    );

    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const data = r.data as {
      sections: { anchor: string }[];
      nbSections: number;
      complete: boolean;
      truncated: boolean;
    };
    expect(data.nbSections).toBe(7);
    expect(data.sections.map((section) => section.anchor)).toEqual([
      "controlling-access-to-an-asset-with-flags",
      "authorization-required-0x1",
      "authorization-revocable-0x2",
      "authorization-immutable-0x4",
      "clawback-enabled-0x8",
      "set-trustline-flag-operation",
      "example-flow"
    ]);
    expect(data.complete).toBe(true);
    expect(data.truncated).toBe(false);
    const titleParams = JSON.parse(String(calls[1]?.init?.body));
    expect(titleParams.query).toBe('"Controlling Access to an Asset with Flags"');
    expect(titleParams.restrictSearchableAttributes).toEqual(["hierarchy.lvl1"]);
    expect(titleParams.removeWordsIfNoResults).toBe("none");
    expect(titleParams.typoTolerance).toBe(false);
    expect(JSON.parse(String(calls[2]?.init?.body)).page).toBe(1);
  });

  it("keeps one section per URL and prefers the content-bearing record", async () => {
    const page = "https://developers.stellar.org/docs/learn/fundamentals/lumens";
    const shared = {
      url: `${page}#base-reserves`,
      url_without_anchor: page,
      anchor: "base-reserves",
      hierarchy: { lvl0: "Learn", lvl1: "Lumens" },
      weight: { position: 2 }
    };
    const body = JSON.stringify({
      hits: [
        { ...shared, type: "lvl2" },
        { ...shared, type: "content", content: "The base reserve contributes to minimum balance." }
      ],
      nbHits: 2,
      page: 0,
      nbPages: 1,
      hitsPerPage: 100
    });
    const { fetchImpl } = stubFetch(body, 200);

    const r = await callStellarDocs(
      entry("stellarDocs.get_doc_page_sections"),
      { path: "/docs/learn/fundamentals/lumens", includeContent: true },
      docsEnv,
      fetchImpl
    );

    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const data = r.data as {
      sections: { url: string; type: string; content?: string }[];
      nbSections: number;
    };
    expect(data.nbSections).toBe(1);
    expect(data.sections).toEqual([
      {
        url: `${page}#base-reserves`,
        url_without_anchor: page,
        anchor: "base-reserves",
        type: "content",
        breadcrumb: "Learn > Lumens",
        content: "The base reserve contributes to minimum balance."
      }
    ]);
  });

  it("omits page-section content when includeContent is false", async () => {
    const page = "https://developers.stellar.org/docs/learn/fundamentals/lumens";
    const body = JSON.stringify({
      hits: [
        {
          url: `${page}#base-reserves`,
          url_without_anchor: page,
          anchor: "base-reserves",
          type: "lvl2",
          hierarchy: { lvl0: "Learn", lvl1: "Lumens" },
          weight: { position: 2 }
        }
      ],
      nbHits: 1,
      page: 0,
      nbPages: 1,
      hitsPerPage: 100
    });
    const { fetchImpl, calls } = stubFetch(body, 200);

    const r = await callStellarDocs(
      entry("stellarDocs.get_doc_page_sections"),
      { path: "/docs/learn/fundamentals/lumens", includeContent: false },
      docsEnv,
      fetchImpl
    );

    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const data = r.data as { sections: { content?: string }[] };
    expect(data.sections).toHaveLength(1);
    expect(data.sections[0]).not.toHaveProperty("content");
    for (const call of calls) {
      const params = JSON.parse(String(call.init?.body));
      expect(params.attributesToRetrieve).not.toContain("content");
    }
  });

  // Every search op that advertises `includeContent` must honor it: the argument
  // must reach Algolia's attributesToRetrieve, and `content` must come back only then.
  // Algolia returns only the attributes a request names, so this stub does too. A stub
  // that always returned `content` would pass with the mapping removed.
  type SearchRequest = { attributesToRetrieve?: string[]; hitsPerPage?: number };
  type ObjectRequest = { indexName: string; objectID: string; attributesToRetrieve: string[] };
  function algoliaStub(body: string): { fetchImpl: FetchLike; requests: SearchRequest[]; objectRequests: ObjectRequest[][] } {
    const requests: SearchRequest[] = [];
    const objectRequests: ObjectRequest[][] = [];
    const fetchImpl: FetchLike = async (url, init) => {
      const parsed = JSON.parse(body) as { hits: Record<string, unknown>[] };
      parsed.hits.forEach((hit, i) => { hit.objectID ??= String(i); });
      if (url.endsWith("/objects")) {
        const params = JSON.parse(String(init?.body)) as { requests: ObjectRequest[] };
        objectRequests.push(params.requests);
        const results = params.requests.map((request) => {
          const hit = parsed.hits.find((hit) => hit.objectID === request.objectID);
          return hit ? { objectID: hit.objectID, content: hit.content } : null;
        });
        return Response.json({ results });
      }
      const params = JSON.parse(String(init?.body)) as SearchRequest;
      requests.push(params);
      if (!params.attributesToRetrieve?.includes("content")) for (const hit of parsed.hits) delete hit.content;
      return Response.json(parsed);
    };
    return { fetchImpl, requests, objectRequests };
  }

  const contentOps = catalog.entries.filter(
    (e) =>
      e.service === "stellarDocs" &&
      "includeContent" in ((e.inputSchema as { properties?: object } | undefined)?.properties ?? {}) &&
      e.id !== "stellarDocs.get_doc_page_sections"
  );

  it("finds every content-capable search op in the manifest", () => {
    expect(contentOps.map((e) => e.id).sort()).toEqual([
      "stellarDocs.search_anchor_sep_docs",
      "stellarDocs.search_asset_token_docs",
      "stellarDocs.search_docs",
      "stellarDocs.search_docs_in_category",
      "stellarDocs.search_meeting_notes",
      "stellarDocs.search_protocol_concepts_docs",
      "stellarDocs.search_rpc_horizon_data_docs",
      "stellarDocs.search_sdk_cli_tools_docs",
      "stellarDocs.search_soroban_contract_docs",
      "stellarDocs.search_wallet_dapp_docs"
    ]);
  });

  it("search_docs_in_category honors hitsPerPage on the meetings path, where the client filter is off", async () => {
    const hits = Array.from({ length: 30 }, (_, i) => ({
      url: `https://developers.stellar.org/meetings/2026/01/${i}#notes`,
      url_without_anchor: `https://developers.stellar.org/meetings/2026/01/${i}`,
      anchor: "notes",
      type: "content",
      hierarchy: { lvl0: "Meetings", lvl1: `Meeting ${i}` },
      content: "Meeting notes section text.",
      _snippetResult: { content: { value: "Meeting **notes**" } }
    }));
    const { fetchImpl, requests, objectRequests } = algoliaStub(JSON.stringify({ hits, nbHits: 30, page: 0, nbPages: 1, hitsPerPage: 100 }));
    const op = entry("stellarDocs.search_docs_in_category");

    const plain = await callStellarDocs(op, { query: "notes", category: "meetings", hitsPerPage: 3 }, docsEnv, fetchImpl);
    expect(requests[0]?.attributesToRetrieve).not.toContain("content");
    expect(plain.ok).toBe(true);
    if (!plain.ok) return;
    const plainHits = (plain.data as { hits: { content?: string }[] }).hits;
    expect(plainHits).toHaveLength(3);
    expect(plainHits.some((h) => "content" in h)).toBe(false);

    const full = await callStellarDocs(op, { query: "notes", category: "meetings", hitsPerPage: 3, includeContent: true }, docsEnv, fetchImpl);
    expect(requests[1]?.hitsPerPage).toBe(100);
    expect(requests[1]?.attributesToRetrieve).not.toContain("content");
    expect(full.ok).toBe(true);
    if (!full.ok) return;
    const meetingHits = (full.data as { hits: { content?: string }[] }).hits;
    expect(meetingHits).toHaveLength(3);
    expect(objectRequests).toHaveLength(1);
    expect(objectRequests[0]?.map((request) => request.objectID)).toEqual(["0", "1", "2"]);
    expect(meetingHits.every((h) => h.content === "Meeting notes section text.")).toBe(true);
  });

  for (const op of contentOps) {
    it(`${op.id} retrieves and returns section content only when includeContent is true`, async () => {
      const mapping = (op.transport as { algolia?: { clientFilter?: { prefixesAnyOf?: string[] } } }).algolia;
      const prefix = (mapping?.clientFilter?.prefixesAnyOf?.[0] ?? "https://developers.stellar.org/docs/build").replace(
        "{category}",
        "build"
      );
      const page = `${prefix.replace(/\/$/, "")}/example-page`;
      const body = JSON.stringify({
        hits: [
          {
            url: `${page}#section`,
            url_without_anchor: page,
            anchor: "section",
            type: "content",
            hierarchy: { lvl0: "Docs", lvl1: "Example page" },
            content: "Full section text that a 20-word snippet cannot carry.",
            _snippetResult: { content: { value: "Full **section** text" } }
          }
        ],
        nbHits: 1,
        page: 0,
        nbPages: 1,
        hitsPerPage: 100
      });
      const args = op.id === "stellarDocs.search_docs_in_category" ? { query: "section", category: "build" } : { query: "section" };

      const { fetchImpl, requests } = algoliaStub(body);

      const plain = await callStellarDocs(op, args, docsEnv, fetchImpl);
      expect(requests[0]?.attributesToRetrieve).not.toContain("content");
      expect(plain.ok).toBe(true);
      if (!plain.ok) return;
      const plainHits = (plain.data as { hits: { snippet?: string; content?: string }[] }).hits;
      expect(plainHits).toHaveLength(1);
      expect(plainHits[0]?.snippet).toBe("Full **section** text");
      expect(plainHits[0]).not.toHaveProperty("content");

      const full = await callStellarDocs(op, { ...args, includeContent: true }, docsEnv, fetchImpl);
      if (mapping?.clientFilter) expect(requests[1]?.attributesToRetrieve).not.toContain("content");
      else expect(requests[1]?.attributesToRetrieve).toContain("content");
      expect(full.ok).toBe(true);
      if (!full.ok) return;
      const hits = (full.data as { hits: { snippet?: string; content?: string }[] }).hits;
      expect(hits).toHaveLength(1);
      expect(hits[0]?.snippet).toBe("Full **section** text");
      expect(hits[0]?.content).toBe("Full section text that a 20-word snippet cannot carry.");
    });
  }

  const retainedPage = "https://developers.stellar.org/docs/build/smart-contracts/example";
  const candidateHits = Array.from({ length: 100 }, (_, i) => ({
    objectID: `record-${i}`,
    url: `${i % 2 === 0 ? retainedPage : "https://developers.stellar.org/docs/other"}#${i}`,
    url_without_anchor: i % 2 === 0 ? retainedPage : "https://developers.stellar.org/docs/other",
    hierarchy: { lvl1: "Original title" },
    content: `Full content ${i}`,
    _snippetResult: { content: { value: `Query snippet ${i}` } }
  }));
  const candidateBody = JSON.stringify({ hits: candidateHits, nbHits: 450, nbPages: 5, page: 0, hitsPerPage: 100 });

  for (const limit of [undefined, 1, 20]) {
    it(`retrieves content only after filtering and limiting (${limit ?? "default"})`, async () => {
      const { fetchImpl, requests, objectRequests } = algoliaStub(candidateBody);
      const result = await callStellarDocs(entry("stellarDocs.search_soroban_contract_docs"), {
        query: "storage", includeContent: true, ...(limit === undefined ? {} : { hitsPerPage: limit })
      }, docsEnv, fetchImpl);
      expect(requests).toHaveLength(1);
      expect(requests[0]?.hitsPerPage).toBe(100);
      expect(requests[0]?.attributesToRetrieve).not.toContain("content");
      expect(objectRequests).toHaveLength(1);
      expect(objectRequests[0]).toEqual(candidateHits.filter((_, i) => i % 2 === 0).slice(0, limit ?? 5).map((hit) => ({
        indexName: "crawler_Stellar Docs - Docusaurus", objectID: hit.objectID,
        attributesToRetrieve: ["objectID", "content"]
      })));
      expect(result).toMatchObject({ ok: true, data: { nbHits: 450, nbPages: 5, page: 0, clientFiltered: true } });
      if (!result.ok) return;
      const hits = (result.data as { hits: { content: string; snippet: string; breadcrumb: string }[] }).hits;
      expect(hits).toHaveLength(limit ?? 5);
      hits.forEach((hit, i) => {
        expect(hit).toMatchObject({ content: `Full content ${i * 2}`, snippet: `Query snippet ${i * 2}`, breadcrumb: "Original title" });
        expect(hit).not.toHaveProperty("objectID");
      });
    });
  }

  it("keeps the search order when content records arrive in another order", async () => {
    const { fetchImpl } = algoliaStub(candidateBody);
    const reordered: FetchLike = async (url, init) => {
      if (!url.endsWith("/objects")) return fetchImpl(url, init);
      return Response.json({ results: [
        { objectID: "record-2", content: "second", url: "https://unrelated.example" },
        { objectID: "record-0", content: "first" }
      ] });
    };
    const result = await callStellarDocs(entry("stellarDocs.search_soroban_contract_docs"), {
      query: "storage", hitsPerPage: 2, includeContent: true
    }, docsEnv, reordered);
    expect(result).toMatchObject({ ok: true, data: { hits: [
      { content: "first", url: `${retainedPage}#0` }, { content: "second", url: `${retainedPage}#2` }
    ] } });
  });

  it("does not retrieve content for a filtered miss", async () => {
    const { fetchImpl, objectRequests } = algoliaStub(JSON.stringify({
      hits: [candidateHits[1]], nbHits: 450, nbPages: 5, page: 0, hitsPerPage: 100
    }));
    const result = await callStellarDocs(entry("stellarDocs.search_soroban_contract_docs"), {
      query: "storage", includeContent: true
    }, docsEnv, fetchImpl);
    expect(objectRequests).toEqual([]);
    expect(result).toMatchObject({ ok: false, error: {
      kind: "soft-empty", status: 200,
      message: "The returned candidate window contains no hits for this operation. Try stellarDocs.search_docs for a broader search.",
      hint: expect.stringContaining("Broaden once with stellarDocs.search_docs")
    } });
  });

  it("rejects retained hits without record IDs before content retrieval", async () => {
    const { fetchImpl, calls } = stubFetch(candidateBody.replaceAll(/"objectID":"record-\d+",/g, ""), 200);
    const result = await callStellarDocs(entry("stellarDocs.search_soroban_contract_docs"), {
      query: "storage", includeContent: true
    }, docsEnv, fetchImpl);
    expect(calls).toHaveLength(1);
    expect(result).toMatchObject({ ok: false, error: {
      kind: "error", message: "Algolia search hits lack record IDs for content retrieval"
    } });
  });

  for (const failure of ["403", "429", "503", "network", "body", "json", "missing", "wrong-id", "invalid"]) {
    it(`preserves error classification for content retrieval failure: ${failure}`, async () => {
      const { fetchImpl } = algoliaStub(candidateBody);
      const contentHosts: string[] = [];
      const failing: FetchLike = async (url, init) => {
        if (!url.endsWith("/objects")) return fetchImpl(url, init);
        contentHosts.push(new URL(url).hostname);
        if (failure === "network") throw new Error("offline");
        if (failure === "body") {
          const response = new Response("{}");
          response.text = async () => { throw new Error("body failed"); };
          return response;
        }
        if (failure === "json") return new Response("{");
        if (failure === "missing") return Response.json({ results: [null] });
        if (failure === "wrong-id") return Response.json({ results: [{ objectID: "unrequested", content: "wrong" }] });
        if (failure === "invalid") return Response.json({ results: "invalid" });
        return Response.json({ message: "upstream failure" }, { status: Number(failure) });
      };
      const result = await callStellarDocs(entry("stellarDocs.search_soroban_contract_docs"), {
        query: "storage", hitsPerPage: 1, includeContent: true
      }, docsEnv, failing);
      expect(result).toMatchObject({ ok: false, error: { kind: "error" } });
      const retry = ["503", "network", "body"].includes(failure);
      expect(contentHosts).toEqual([
        "testappid-dsn.algolia.net",
        ...(retry ? ["testappid-1.algolianet.com", "testappid-2.algolianet.com", "testappid-3.algolianet.com"] : [])
      ]);
      if (["403", "429"].includes(failure)) expect(result).toMatchObject({ error: { status: Number(failure) } });
    });
  }

  // The documented result shape must be the shape the adapter returns. The search ops used to say
  // "Returns: Array of hits" with no outputSchema, so callers wrote `r.data.map(...)` and the script
  // failed with "r.data.map is not a function".
  type Shape = { type?: string; format?: string; minimum?: number; required?: string[]; properties?: Record<string, Shape>; items?: Shape; additionalProperties?: boolean };
  function shapeErrors(value: unknown, schema: Shape, path = "data"): string[] {
    if (schema.type === "array") {
      if (!Array.isArray(value)) return [`${path} is not an array`];
      return value.flatMap((v, i) => shapeErrors(v, schema.items ?? {}, `${path}[${i}]`));
    }
    if (schema.type === "object") {
      if (value === null || typeof value !== "object" || Array.isArray(value)) return [`${path} is not an object`];
      const obj = value as Record<string, unknown>;
      const errors = (schema.required ?? []).filter((k) => !(k in obj)).map((k) => `${path}.${k} is missing`);
      for (const [k, v] of Object.entries(obj)) {
        const child = schema.properties?.[k];
        if (!child) {
          if (schema.additionalProperties === false) errors.push(`${path}.${k} is not documented`);
        } else errors.push(...shapeErrors(v, child, `${path}.${k}`));
      }
      return errors;
    }
    if (schema.type === "integer") {
      if (!Number.isInteger(value)) return [`${path} is not an integer`];
      return schema.minimum !== undefined && (value as number) < schema.minimum ? [`${path} is below ${schema.minimum}`] : [];
    }
    if (schema.type === "string" && schema.format === "uri" && typeof value === "string" && !/^https?:\/\/\S+$/.test(value)) return [`${path} is not a uri`];
    if (schema.type === "string" || schema.type === "boolean") return typeof value === schema.type ? [] : [`${path} is not a ${schema.type}`];
    return [`${path} has a schema type this test cannot check: ${String(schema.type)}`];
  }

  const searchOps = catalog.entries.filter(
    (e) => e.service === "stellarDocs" && e.kind === "operation" && e.id !== "stellarDocs.get_doc_page_sections"
  );

  it("documents an object result, never a bare array, on every stellarDocs search op", () => {
    expect(searchOps).toHaveLength(11);
    for (const op of searchOps) {
      const schema = op.outputSchema as Shape | null;
      expect(schema, op.id).not.toBeNull();
      expect(schema?.type, op.id).toBe("object");
      expect(schema?.properties?.hits?.type, op.id).toBe("array");
      expect(op.description, op.id).not.toMatch(/Returns: Array of/);
      expect(op.description, op.id).toContain("Returns: { hits: Array of");
    }
  });

  it("search_docs_in_category on the meetings path still returns the documented shape, without clientFiltered", async () => {
    const op = entry("stellarDocs.search_docs_in_category");
    const hit = {
      url: "https://developers.stellar.org/meetings/2026/01/15#notes",
      url_without_anchor: "https://developers.stellar.org/meetings/2026/01/15",
      anchor: "notes",
      type: "content",
      hierarchy: { lvl0: "Meetings", lvl1: "Protocol meeting" },
      content: "Meeting notes section text.",
      _snippetResult: { content: { value: "Meeting **notes**" } }
    };
    const { fetchImpl } = algoliaStub(JSON.stringify({ hits: [hit], nbHits: 1, page: 0, nbPages: 1, hitsPerPage: 100 }));
    const r = await callStellarDocs(op, { query: "notes", category: "meetings", includeContent: true }, docsEnv, fetchImpl);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const wire = JSON.parse(JSON.stringify(r.data)) as Record<string, unknown>;
    expect(shapeErrors(wire, op.outputSchema as Shape)).toEqual([]);
    expect("clientFiltered" in wire).toBe(false);
  });

  for (const op of searchOps) {
    it(`${op.id} returns exactly the shape its outputSchema documents`, async () => {
      const mapping = (op.transport as { algolia?: { clientFilter?: { prefixesAnyOf?: string[] } } }).algolia;
      const prefix = (mapping?.clientFilter?.prefixesAnyOf?.[0] ?? "https://developers.stellar.org/docs/build").replace("{category}", "build");
      const page = `${prefix.replace(/\/$/, "")}/example-page`;
      const record = (type: string, extra: Record<string, unknown>) => ({
        url: `${page}#section`,
        url_without_anchor: page,
        anchor: "section",
        type,
        hierarchy: { lvl0: "Docs", lvl1: "Example page" },
        ...extra
      });
      const body = JSON.stringify({
        hits: [
          record("content", { content: "Section text.", _snippetResult: { content: { value: "Section **text**" } } }),
          record("lvl2", { content: null })
        ],
        nbHits: 2,
        page: 0,
        nbPages: 1,
        hitsPerPage: 100
      });
      const hasCategory = "category" in ((op.inputSchema as { properties?: object } | undefined)?.properties ?? {});
      const hasContentFlag = "includeContent" in ((op.inputSchema as { properties?: object } | undefined)?.properties ?? {});
      const args = { query: "section", ...(hasCategory ? { category: "build" } : {}), ...(hasContentFlag ? { includeContent: true } : {}) };
      const { fetchImpl } = algoliaStub(body);
      const r = await callStellarDocs(op, args, docsEnv, fetchImpl);
      expect(r.ok).toBe(true);
      if (!r.ok) return;
      // Validate what crosses the sandbox boundary: the serialized payload, where `undefined` keys vanish.
      const wire = JSON.parse(JSON.stringify(r.data)) as { hits: unknown[] };
      expect(Array.isArray(wire)).toBe(false);
      expect(shapeErrors(wire, op.outputSchema as Shape)).toEqual([]);
      expect(wire.hits).toHaveLength(2);
      // Optional in the schema because they come straight from the upstream response; the adapter still sets them.
      expect(wire).toMatchObject({ nbHits: 2, nbPages: 1, page: 0 });
      const filtersOnClient = Boolean(mapping?.clientFilter);
      expect("clientFiltered" in wire, op.id).toBe(filtersOnClient);
      expect("clientFiltered" in ((op.outputSchema as Shape).properties ?? {}), op.id).toBe(filtersOnClient);
    });
  }
});
