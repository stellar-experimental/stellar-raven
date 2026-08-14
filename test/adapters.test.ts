/**
 * Adapter unit tests — recorded live fixtures (test/fixtures/, captured
 * 2026-07-02 from one real call each, free ops only), replayed through an
 * injected FetchLike. Per service: one success, one soft-empty, one error —
 * the three-way outcome discipline (PLAN §4: soft-empty ≠ error ≠ data).
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

  it("maps zero hits to soft-empty (reliable negative on this index)", async () => {
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
    expect(r.error.message).toContain("not in the docs corpus");
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
});
