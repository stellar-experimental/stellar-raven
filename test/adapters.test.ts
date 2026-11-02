/**
 * Adapter unit tests — recorded live fixtures (test/fixtures/, captured
 * 2026-07-02 from one real call each, free ops only), replayed through an
 * injected FetchLike. The stellar-docs-* fixtures are synthetic bodies in the
 * Mintlify discovery API shape (research/services/stellar-docs-mintlify.md). Per service: one success, one soft-empty, one error —
 * the three-way outcome contract in ARCHITECTURE.md: soft-empty ≠ error ≠ data.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadManifest, type Catalog, type CatalogEntry } from "../src/catalog/search.ts";
import { callLumenloop } from "../src/adapters/lumenloop.ts";
import { callScout } from "../src/adapters/scout.ts";
import { callStellarDocs, cleanContent, queryTerms } from "../src/adapters/stellar-docs.ts";
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
const docsEnv = { MINTLIFY_ASSISTANT_API_KEY: "test-key-not-real-5678" };

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

  it.each(["true", 1, null, {}])(
    "does not treat a non-boolean meta.partial as a failure signal: %j",
    async (partial) => {
      const body = { projects: [{ name: "Wallet" }], meta: { partial } };
      const { fetchImpl } = stubFetch(JSON.stringify(body), 200);
      const r = await callScout(entry("scout.searchProjects"), { q: "wallet" }, {}, fetchImpl);
      expect(r).toEqual({ ok: true, data: body });
    }
  );

  it.each([
    [{ read: "projects search" }, "x"],
    ["projects search", null]
  ])("keeps a partial page with malformed failedReads an error: %j", async (...failedReads) => {
    const { fetchImpl } = stubFetch(
      JSON.stringify({ projects: [{ name: "Wallet" }], meta: { partial: true, failedReads } }),
      200
    );
    const r = await callScout(entry("scout.searchProjects"), { q: "wallet" }, {}, fetchImpl);
    expect(r).toEqual({
      ok: false,
      error: expect.objectContaining({
        kind: "error",
        message: "backend read failed: Scout marked the page partial",
        details: { failedReads }
      })
    });
  });

  it.each([
    { partial: true, failedReads: [{ read: "projects search", cause: "timeout after 4000ms" }] },
    { partial: false, warnings: ["backend read failed: timeout"] }
  ])("gives either failure signal priority over meta.error: %j", async (signal) => {
    const { fetchImpl } = stubFetch(
      JSON.stringify({ projects: [], meta: { error: "no_query", ...signal } }),
      200
    );
    const r = await callScout(entry("scout.searchProjects"), {}, {}, fetchImpl);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.kind).toBe("error");
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
  const SEARCH_URL = "https://api.mintlify.com/discovery/v1/search/stellardevelopmentfoundation";
  const PAGE_URL = "https://api.mintlify.com/discovery/v1/page/stellardevelopmentfoundation";
  const ORIGIN = "https://developers.stellar.org";

  type Chunk = { path: string; content: string; metadata?: { title?: string } };
  type Hit = { url: string; path: string; title: string; section?: string; snippet: string; content?: string };
  type SearchData = { hits: Hit[]; candidates: number; pathFiltered?: boolean };

  const chunk = (path: string, content: string, title = "Example page"): Chunk => ({ path, content, metadata: { title } });

  /** Records every request; answers each from `respond` (default: the same body every time). */
  function mintlifyStub(respond: (body: Record<string, unknown>, index: number) => Response | Promise<Response>) {
    const calls: { url: string; init?: RequestInit; body: Record<string, unknown> }[] = [];
    const fetchImpl: FetchLike = async (url, init) => {
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      calls.push({ url, init, body });
      return respond(body, calls.length - 1);
    };
    return { fetchImpl, calls };
  }
  const searchStub = (chunks: Chunk[]) => mintlifyStub(() => Response.json(chunks));

  function withTransport(base: CatalogEntry, patch: Record<string, unknown>): CatalogEntry {
    return { ...base, transport: { ...base.transport!, ...patch } } as CatalogEntry;
  }

  it("shapes hits and sends the Mintlify search request", async () => {
    const { fetchImpl, calls } = stubFetch(fixture("stellar-docs-success.json"), 200);
    const r = await callStellarDocs(
      entry("stellarDocs.search_docs"),
      { query: "soroban storage", hitsPerPage: 3 },
      docsEnv,
      fetchImpl
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const data = r.data as SearchData;
    expect(data.candidates).toBe(8);
    expect(data).not.toHaveProperty("pathFiltered");
    expect(data.hits).toHaveLength(3);
    expect(data.hits[0]).toEqual({
      url: `${ORIGIN}/docs/build/smart-contracts/getting-started/storing-data`,
      path: "/docs/build/smart-contracts/getting-started/storing-data",
      title: "3. Storing Data",
      section: "Storing data",
      snippet: expect.stringContaining("Soroban contracts keep state in contract storage.")
    });
    // The section without a leading heading has no `section`.
    expect(data.hits[2]).not.toHaveProperty("section");
    // One host, one POST; hitsPerPage never reaches the wire — the window is fixed.
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe(SEARCH_URL);
    expect(calls[0]?.init?.method).toBe("POST");
    expect(JSON.parse(String(calls[0]?.init?.body))).toEqual({ query: "soroban storage", pageSize: 50 });
    const headers = calls[0]?.init?.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer test-key-not-real-5678");
    expect(headers["Content-Type"]).toBe("application/json");
    expect(calls[0]?.init?.signal).toBeInstanceOf(AbortSignal);
  });

  // 25 docs pages + 25 meeting pages, every one carrying the query term.
  const windowChunks: Chunk[] = [
    ...Array.from({ length: 25 }, (_, i) => chunk(`docs/build/page-${i}`, `## Part ${i}\nStorage detail ${i}.`, `Page ${i}`)),
    ...Array.from({ length: 25 }, (_, i) => chunk(`meetings/2026/01/${i}`, `## Notes ${i}\nStorage discussion ${i}.`, `Meeting ${i}`))
  ];

  for (const id of ["search_docs", "search_doc_titles", "search_meeting_notes"]) {
    it(`${id} returns the documented default and preserves explicit hit limits`, async () => {
      for (const limit of [undefined, 1, 20]) {
        const { fetchImpl, calls } = searchStub(windowChunks);
        const r = await callStellarDocs(entry(`stellarDocs.${id}`), {
          query: "storage", ...(limit === undefined ? {} : { hitsPerPage: limit })
        }, docsEnv, fetchImpl);
        expect(calls[0]?.body).toEqual({ query: "storage", pageSize: 50 });
        expect(r.ok).toBe(true);
        if (!r.ok) return;
        const data = r.data as SearchData;
        expect(data.hits).toHaveLength(limit ?? 5);
        expect(data.candidates).toBe(50);
      }
    });
  }

  it("normalizes section paths: leading slash, no trailing /index, title falls back to the last segment", async () => {
    const { fetchImpl } = searchStub([
      { path: "docs/tokens/index", content: "Tokens overview." },
      { path: "/docs/learn/fundamentals/fees", content: "Fees overview.", metadata: { title: "Fees" } }
    ]);
    const r = await callStellarDocs(entry("stellarDocs.search_docs"), { query: "overview" }, docsEnv, fetchImpl);
    expect(r).toMatchObject({ ok: true, data: { hits: [
      { url: `${ORIGIN}/docs/tokens`, path: "/docs/tokens", title: "tokens" },
      { url: `${ORIGIN}/docs/learn/fundamentals/fees`, path: "/docs/learn/fundamentals/fees", title: "Fees" }
    ] } });
  });

  it("keeps the snippet near 300 characters and centered on the first query term", async () => {
    const filler = "Lorem ipsum dolor sit amet. ".repeat(25);
    const content = `## Long section\n${filler}The archival rules apply here. ${filler}`;
    const { fetchImpl } = searchStub([chunk("docs/learn/long", content)]);
    const r = await callStellarDocs(entry("stellarDocs.search_docs"), { query: "archival" }, docsEnv, fetchImpl);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const { snippet } = (r.data as SearchData).hits[0]!;
    expect(snippet.startsWith("…")).toBe(true);
    expect(snippet.endsWith("…")).toBe(true);
    expect(snippet.length).toBeLessThanOrEqual(302);
    expect(snippet).toContain("The archival rules apply here.");
    expect(snippet).not.toContain("Long section");

    // A short section is the whole body, without its heading or fence markers.
    const short = searchStub([chunk("docs/learn/short", "## Short\nRun this:\n```bash theme={null}\nstellar archival\n```")]);
    const s = await callStellarDocs(entry("stellarDocs.search_docs"), { query: "archival" }, docsEnv, short.fetchImpl);
    expect(s).toMatchObject({ ok: true, data: { hits: [{ section: "Short", snippet: "Run this: stellar archival" }] } });
  });

  it("strips code-fence theme metadata and makes relative links absolute", () => {
    const page = `${ORIGIN}/docs/build/smart-contracts/getting-started/storing-data`;
    const markdown = [
      "```rust theme={null}",
      "fn main() {}",
      "```",
      '```bash theme={"theme":{"light":"github-light","dark":"github-dark"}}',
      "stellar contract build",
      "```",
      "[sibling](deploy-to-testnet) [up](../../../learn/fundamentals/fees.mdx#base-fee)",
      "[root](/docs/learn/fundamentals/index.mdx) [external](https://example.com/x) [fragment](#local) [mail](mailto:a@b.c)"
    ].join("\n");
    expect(cleanContent(markdown, page, ORIGIN)).toBe([
      "```rust",
      "fn main() {}",
      "```",
      "```bash",
      "stellar contract build",
      "```",
      `[sibling](${ORIGIN}/docs/build/smart-contracts/getting-started/deploy-to-testnet) [up](${ORIGIN}/docs/learn/fundamentals/fees#base-fee)`,
      `[root](${ORIGIN}/docs/learn/fundamentals) [external](https://example.com/x) [fragment](#local) [mail](mailto:a@b.c)`
    ].join("\n"));
  });

  it("resolves an index section's relative links against its directory", async () => {
    const { fetchImpl } = searchStub(JSON.parse(fixture("stellar-docs-success.json")) as Chunk[]);
    const r = await callStellarDocs(
      entry("stellarDocs.search_docs_in_category"),
      { query: "soroban token", category: "tokens", includeContent: true },
      docsEnv,
      fetchImpl
    );
    expect(r).toMatchObject({ ok: true, data: { pathFiltered: true, hits: [{
      path: "/docs/tokens",
      content: `## Overview\nSoroban tokens keep balances in contract storage. See [how to issue an asset](${ORIGIN}/docs/tokens/how-to-issue-an-asset).`
    }] } });
    // The non-index page resolves the same kind of link against its parent.
    const page = await callStellarDocs(
      entry("stellarDocs.search_docs"),
      { query: "storing data", hitsPerPage: 1, includeContent: true },
      docsEnv,
      fetchImpl
    );
    expect(page).toMatchObject({ ok: true, data: { hits: [{
      content: expect.stringContaining(`(${ORIGIN}/docs/learn/fundamentals/contract-development/storage/persisting-data)`)
    }] } });
    expect(JSON.stringify(page)).not.toContain("theme={null}");
  });

  it("applies the path include list for category ops and filters before limiting", async () => {
    const { fetchImpl, calls } = stubFetch(fixture("stellar-docs-success.json"), 200);
    const op = entry("stellarDocs.search_soroban_contract_docs");
    const r = await callStellarDocs(op, { query: "storage ttl", hitsPerPage: 2 }, docsEnv, fetchImpl);
    expect(JSON.parse(String(calls[0]?.init?.body))).toEqual({ query: "storage ttl", pageSize: 50 });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const data = r.data as SearchData;
    expect(data.pathFiltered).toBe(true);
    expect(data.candidates).toBe(8);
    // Search order is kept; the out-of-scope meetings, tokens, and data sections are dropped.
    expect(data.hits.map((hit) => hit.path)).toEqual([
      "/docs/build/smart-contracts/getting-started/storing-data",
      "/docs/learn/fundamentals/contract-development/storage/persisting-data"
    ]);
    const include = (op.transport as { mintlify?: { include?: string[] } }).mintlify?.include ?? [];
    for (const hit of data.hits) expect(include.some((prefix) => hit.path.startsWith(prefix))).toBe(true);
  });

  const retainedPath = "docs/build/smart-contracts/example";
  const interleaved = Array.from({ length: 50 }, (_, i) =>
    chunk(i % 2 === 0 ? `${retainedPath}-${i}` : `docs/other/page-${i}`, `## Part ${i}\nStorage content ${i}`)
  );

  for (const limit of [undefined, 1, 20]) {
    it(`keeps search order and limits only after path filtering (${limit ?? "default"})`, async () => {
      const { fetchImpl, calls } = searchStub(interleaved);
      const result = await callStellarDocs(entry("stellarDocs.search_soroban_contract_docs"), {
        query: "storage", includeContent: true, ...(limit === undefined ? {} : { hitsPerPage: limit })
      }, docsEnv, fetchImpl);
      expect(calls).toHaveLength(1);
      expect(result).toMatchObject({ ok: true, data: { candidates: 50, pathFiltered: true } });
      if (!result.ok) return;
      const hits = (result.data as SearchData).hits;
      expect(hits).toHaveLength(limit ?? 5);
      hits.forEach((hit, i) => {
        expect(hit).toMatchObject({
          path: `/${retainedPath}-${i * 2}`,
          section: `Part ${i * 2}`,
          content: `## Part ${i * 2}\nStorage content ${i * 2}`
        });
      });
    });
  }

  it("excludes meetings from search_docs unless includeMeetings is true", async () => {
    const { fetchImpl } = stubFetch(fixture("stellar-docs-success.json"), 200);
    const op = entry("stellarDocs.search_docs");
    const paths = async (args: Record<string, unknown>) => {
      const r = await callStellarDocs(op, { query: "soroban storage", hitsPerPage: 20, ...args }, docsEnv, fetchImpl);
      return r.ok ? (r.data as SearchData).hits.map((hit) => hit.path) : [];
    };
    expect(await paths({})).not.toContain("/meetings/2025/03/06/protocol");
    expect(await paths({ includeMeetings: false })).not.toContain("/meetings/2025/03/06/protocol");
    expect(await paths({ includeMeetings: true })).toContain("/meetings/2025/03/06/protocol");
    // An exclude list alone is not a path filter.
    const r = await callStellarDocs(op, { query: "soroban storage" }, docsEnv, fetchImpl);
    expect(r.ok && "pathFiltered" in (r.data as object)).toBe(false);
  });

  it("search_docs_in_category fills {category} and switches to /meetings/ for category=meetings", async () => {
    const { fetchImpl } = stubFetch(fixture("stellar-docs-success.json"), 200);
    const op = entry("stellarDocs.search_docs_in_category");
    const paths = async (category: string) => {
      const r = await callStellarDocs(op, { query: "soroban storage", category, hitsPerPage: 20 }, docsEnv, fetchImpl);
      expect(r).toMatchObject({ ok: true, data: { pathFiltered: true } });
      return r.ok ? (r.data as SearchData).hits.map((hit) => hit.path) : [];
    };
    expect(await paths("build")).toEqual([
      "/docs/build/smart-contracts/getting-started/storing-data",
      "/docs/build/guides/storage/choosing-the-right-storage",
      "/docs/build/smart-contracts/getting-started/storing-data"
    ]);
    // "/docs/{category}" (no slash) keeps the category's own index page.
    expect(await paths("tokens")).toEqual(["/docs/tokens"]);
    expect(await paths("meetings")).toEqual(["/meetings/2025/03/06/protocol"]);
  });

  it("search_doc_titles returns one row per page ranked by title, then path, then search rank", async () => {
    const { fetchImpl } = searchStub([
      chunk("docs/build/unrelated", "## A\nState archival is mentioned here.", "Unrelated"),
      chunk("docs/learn/fundamentals/contract-development/storage/state-archival", "## Intro\nArchival intro.", "State Archival"),
      chunk("docs/build/guides/archival/restore", "## Restore\nRestore archived entries.", "Restore archived data"),
      chunk("docs/learn/fundamentals/contract-development/storage/state-archival", "## TTL\nSecond chunk.", "State Archival"),
      chunk("docs/x/archival-faq", "## FAQ\nArchival questions.", "Archival FAQ"),
      chunk("docs/y/other", "## B\nState archival again.", "Something")
    ]);
    const r = await callStellarDocs(
      entry("stellarDocs.search_doc_titles"),
      { query: "State Archival", hitsPerPage: 10, includeContent: true },
      docsEnv,
      fetchImpl
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const data = r.data as SearchData;
    expect(data.candidates).toBe(6);
    expect(data.hits.map((hit) => hit.path)).toEqual([
      "/docs/learn/fundamentals/contract-development/storage/state-archival", // title 4 + path 2
      "/docs/x/archival-faq", // title 2 + path 1
      "/docs/build/guides/archival/restore", // path 1
      "/docs/build/unrelated", // 0, search rank 0
      "/docs/y/other" // 0, search rank 5
    ]);
    // The page row keeps its first-ranked section; page rows never carry content.
    expect(data.hits[0]).toMatchObject({ section: "Intro", snippet: "Archival intro." });
    expect(data.hits.some((hit) => "content" in hit)).toBe(false);
  });

  it("maps nearest sections without any query term to a query-scoped soft-empty", async () => {
    const { fetchImpl } = stubFetch(fixture("stellar-docs-soft-empty.json"), 200);
    const r = await callStellarDocs(
      entry("stellarDocs.search_docs"),
      { query: "zzqxjvw flurbnog quixotic" },
      docsEnv,
      fetchImpl
    );
    expect(r).toMatchObject({ ok: false, error: {
      kind: "soft-empty",
      status: 200,
      message: "None of the 5 candidate sections the docs search returned contains a query term (zzqxjvw, flurbnog, quixotic).",
      hint: expect.stringContaining("broad Lumenloop or Scout family")
    } });
  });

  it("maps a window with no in-scope sections to a candidate-window soft-empty", async () => {
    const { fetchImpl, calls } = searchStub(interleaved.filter((_, i) => i % 2 === 1));
    const result = await callStellarDocs(entry("stellarDocs.search_soroban_contract_docs"), {
      query: "storage", includeContent: true
    }, docsEnv, fetchImpl);
    expect(calls).toHaveLength(1);
    expect(result).toMatchObject({ ok: false, error: {
      kind: "soft-empty",
      status: 200,
      message: "None of the 25 candidate sections the docs search returned is under this operation's paths.",
      hint: expect.stringContaining("Broaden once with stellarDocs.search_docs")
    } });
  });

  it("treats a search 404 and an empty array as no sections (soft-empty, no retry)", async () => {
    for (const [response, status] of [
      [() => Response.json({ message: "No results" }, { status: 404 }), 404],
      [() => Response.json([]), 200]
    ] as const) {
      const { fetchImpl, calls } = mintlifyStub(response);
      const r = await callStellarDocs(entry("stellarDocs.search_docs"), { query: "soroban" }, docsEnv, fetchImpl);
      expect(calls).toHaveLength(1);
      expect(r).toMatchObject({ ok: false, error: {
        kind: "soft-empty",
        status,
        message: "The docs search returned no sections for this query.",
        hint: expect.stringContaining("does not prove the docs lack the topic")
      } });
    }
  });

  it("scopes by whole path segments, not raw string prefixes", async () => {
    const { fetchImpl } = searchStub([
      chunk("docs/tokens-legacy/token", "Token notes."),
      chunk("docs/tokens", "Token overview."),
      chunk("docs/tokens/how-to-issue-an-asset", "Token issuing.")
    ]);
    const r = await callStellarDocs(entry("stellarDocs.search_asset_token_docs"), { query: "token" }, docsEnv, fetchImpl);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect((r.data as SearchData).hits.map((hit) => hit.path)).toEqual(["/docs/tokens", "/docs/tokens/how-to-issue-an-asset"]);

    const category = searchStub([chunk("docs/database/token", "Token table."), chunk("docs/data/apis", "Token API.")]);
    const c = await callStellarDocs(entry("stellarDocs.search_docs_in_category"), { query: "token", category: "data" }, docsEnv, category.fetchImpl);
    expect(c.ok).toBe(true);
    if (!c.ok) return;
    expect((c.data as SearchData).hits.map((hit) => hit.path)).toEqual(["/docs/data/apis"]);
  });

  it("shrinks MDX component tags in snippets to their attribute values but keeps them in content", async () => {
    const content = '<Tabs>\n<Tab title="Successful Transaction">\n<ParamField body="limit" type="number">\nThe limit can range from 1 to 200.\n</ParamField>\n</Tab>\n</Tabs>';
    const { fetchImpl } = searchStub([chunk("docs/data/apis/rpc/api-reference/methods/getTransactions", content)]);
    const r = await callStellarDocs(entry("stellarDocs.search_docs"), { query: "limit", includeContent: true }, docsEnv, fetchImpl);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const [hit] = (r.data as SearchData).hits;
    expect(hit?.snippet).toBe("Successful Transaction limit number The limit can range from 1 to 200.");
    expect(hit?.content).toBe(content);
  });

  it("keeps a trailing # that is part of the heading text and code comments in the snippet", async () => {
    const { fetchImpl } = searchStub([
      chunk("docs/tools/sdks/csharp", "## Using C#\nThe C# SDK."),
      chunk("docs/tools/cli/install", "Run:\n```bash\n# Install the CLI\ncargo install stellar-cli\n```"),
      chunk("docs/tools/cli/closed", "## Closed heading ##\nCLI text.")
    ]);
    const r = await callStellarDocs(entry("stellarDocs.search_docs"), { query: "cli sdk" }, docsEnv, fetchImpl);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const [csharp, install, closed] = (r.data as SearchData).hits;
    expect(csharp?.section).toBe("Using C#");
    expect(install).not.toHaveProperty("section");
    expect(install?.snippet).toContain("# Install the CLI");
    expect(closed?.section).toBe("Closed heading");
  });

  it("does not soft-empty a stopword-only query that has in-scope sections", async () => {
    expect(queryTerms("how does the")).toEqual([]);
    const { fetchImpl } = stubFetch(fixture("stellar-docs-soft-empty.json"), 200);
    const r = await callStellarDocs(entry("stellarDocs.search_docs"), { query: "how does the" }, docsEnv, fetchImpl);
    expect(r).toMatchObject({ ok: true, data: { candidates: 5 } });
  });

  it("derives topic terms: stopwords and short words drop, identifiers stay whole and split", () => {
    expect(queryTerms("How do I use the Stellar CLI?")).toEqual(["stellar", "cli"]);
    expect(queryTerms("SEP-10 auth")).toEqual(["sep 10", "sep", "10", "auth"]);
    expect(queryTerms("get_ledger_entries v2")).toEqual(["get ledger entries", "get", "ledger", "entries", "v2"]);
  });

  it("errs by name when the declared API key is missing, without a request", async () => {
    const { fetchImpl, calls } = stubFetch(fixture("stellar-docs-success.json"), 200);
    const r = await callStellarDocs(entry("stellarDocs.search_docs"), { query: "soroban" }, {}, fetchImpl);
    expect(r).toMatchObject({ ok: false, error: { kind: "error", message: expect.stringContaining("MINTLIFY_ASSISTANT_API_KEY") } });
    expect(calls).toHaveLength(0);
  });

  it("resolves the key from whatever env name the transport declares", async () => {
    const op = withTransport(entry("stellarDocs.search_docs"), { apiKeyEnv: "OTHER_DOCS_KEY" });
    const { fetchImpl, calls } = stubFetch(fixture("stellar-docs-success.json"), 200);
    const otherEnv = { OTHER_DOCS_KEY: "test-other-key-5678" } as unknown as typeof docsEnv;
    expect((await callStellarDocs(op, { query: "soroban storage" }, otherEnv, fetchImpl)).ok).toBe(true);
    expect((calls[0]?.init?.headers as Record<string, string>).Authorization).toBe("Bearer test-other-key-5678");
    // The default key name must NOT satisfy a transport that names another one.
    const wrong = await callStellarDocs(op, { query: "soroban" }, docsEnv, fetchImpl);
    expect(wrong).toMatchObject({ ok: false, error: { kind: "error", message: expect.stringContaining("OTHER_DOCS_KEY") } });
    expect(calls).toHaveLength(1);
  });

  it("errs on an entry without a mintlify transport", async () => {
    const { fetchImpl, calls } = stubFetch(fixture("stellar-docs-success.json"), 200);
    for (const op of [
      withTransport(entry("stellarDocs.search_docs"), { type: "http" }),
      withTransport(entry("stellarDocs.search_docs"), { mintlify: undefined })
    ]) {
      const r = await callStellarDocs(op, { query: "soroban" }, docsEnv, fetchImpl);
      expect(r).toMatchObject({ ok: false, error: { kind: "error", message: expect.stringContaining("no mintlify transport mapping") } });
    }
    expect(calls).toHaveLength(0);
  });

  it("returns 4xx as error without retry", async () => {
    const { fetchImpl, calls } = stubFetch(fixture("stellar-docs-error.json"), 401);
    const r = await callStellarDocs(entry("stellarDocs.search_docs"), { query: "soroban" }, docsEnv, fetchImpl);
    expect(r).toMatchObject({ ok: false, error: { kind: "error", status: 401, message: "Unauthorized" } });
    expect(calls).toHaveLength(1);
  });

  it("returns non-JSON 4xx without retry and bounds the response fallback", async () => {
    const body = `bad request: ${"x".repeat(2048)}:unbounded-tail`;
    const { fetchImpl, calls } = stubFetch(body, 400, "text/plain");
    const r = await callStellarDocs(entry("stellarDocs.search_docs"), { query: "soroban" }, docsEnv, fetchImpl);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.status).toBe(400);
    expect(r.error.message).toContain("bad request");
    expect(r.error.message).not.toContain("unbounded-tail");
    expect(calls).toHaveLength(1);
  });

  it("returns malformed 2xx JSON without retry", async () => {
    const { fetchImpl, calls } = stubFetch("not JSON", 200, "text/plain");
    const r = await callStellarDocs(entry("stellarDocs.search_docs"), { query: "soroban" }, docsEnv, fetchImpl);
    expect(r).toMatchObject({ ok: false, error: { kind: "error", status: 200, message: expect.stringContaining("returned malformed JSON") } });
    expect(calls).toHaveLength(1);
  });

  it("rejects a search body that is not an array of sections", async () => {
    for (const body of [{ results: [] }, [{ path: "docs/x" }], [null]]) {
      const { fetchImpl, calls } = mintlifyStub(() => Response.json(body));
      const r = await callStellarDocs(entry("stellarDocs.search_docs"), { query: "soroban" }, docsEnv, fetchImpl);
      expect(r).toMatchObject({ ok: false, error: { kind: "error", message: "Mintlify search response is not an array of sections" } });
      expect(calls).toHaveLength(1);
    }
  });

  it("retries once on 5xx and succeeds on the second attempt", async () => {
    const { fetchImpl, calls } = mintlifyStub((_, i) =>
      i === 0 ? Response.json({ message: "upstream boom" }, { status: 502 }) : new Response(fixture("stellar-docs-success.json"))
    );
    const r = await callStellarDocs(entry("stellarDocs.search_docs"), { query: "soroban storage" }, docsEnv, fetchImpl);
    expect(r.ok).toBe(true);
    expect(calls.map((call) => call.url)).toEqual([SEARCH_URL, SEARCH_URL]);
  });

  it("retries network failures and succeeds on the second attempt", async () => {
    let requestCount = 0;
    const fetchImpl: FetchLike = async () => {
      requestCount += 1;
      if (requestCount === 1) throw new TypeError("network unavailable");
      return new Response(fixture("stellar-docs-success.json"), { status: 200 });
    };
    const r = await callStellarDocs(entry("stellarDocs.search_docs"), { query: "soroban storage" }, docsEnv, fetchImpl);
    expect(r.ok).toBe(true);
    expect(requestCount).toBe(2);
  });

  it("applies each configured attempt timeout and errs after the last one", async () => {
    const op = withTransport(entry("stellarDocs.search_docs"), { attemptTimeoutsMs: [5, 10] });
    const started: number[] = [];
    const fetchImpl: FetchLike = (_url, init) => {
      started.push(Date.now());
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(init.signal!.reason));
      });
    };
    const r = await callStellarDocs(op, { query: "soroban" }, docsEnv, fetchImpl);
    expect(started).toHaveLength(2);
    expect(r).toMatchObject({ ok: false, error: { kind: "error", message: expect.stringContaining("mintlify request failed after 2 attempts") } });
    if (!r.ok) expect(r.error.status).toBeUndefined();
  });

  for (const failure of ["401", "403", "429", "500", "503", "network", "body", "json", "invalid"]) {
    it(`classifies a search failure without data: ${failure}`, async () => {
      const { fetchImpl, calls } = mintlifyStub(() => {
        if (failure === "network") throw new Error("offline");
        if (failure === "body") {
          const response = new Response("[]");
          response.text = async () => { throw new Error("body failed"); };
          return response;
        }
        if (failure === "json") return new Response("[");
        if (failure === "invalid") return Response.json({ hits: [] });
        return Response.json({ message: "upstream failure" }, { status: Number(failure) });
      });
      const result = await callStellarDocs(entry("stellarDocs.search_docs"), { query: "storage" }, docsEnv, fetchImpl);
      expect(result).toMatchObject({ ok: false, error: { kind: "error" } });
      const retried = ["500", "503", "network", "body"].includes(failure);
      expect(calls).toHaveLength(retried ? 2 : 1);
      if (retried) expect(result).toMatchObject({ error: { message: expect.stringContaining("after 2 attempts") } });
      if (["401", "403", "429"].includes(failure)) {
        expect(result).toMatchObject({ error: { status: Number(failure), message: "upstream failure" } });
      }
    });
  }

  const storingData = "docs/build/smart-contracts/getting-started/storing-data";
  const pageMarkdown = [
    "# Storing Data",
    "",
    "Add storage to the hello world contract.",
    "",
    "```rust theme={null}",
    "env.storage().instance().set(&COUNTER, &count);",
    "```",
    "",
    "| Type | TTL |",
    "| --- | --- |",
    "| Instance | Contract |",
    "",
    "Read [persisting data](../../../learn/fundamentals/contract-development/storage/persisting-data)."
  ].join("\n");

  it("get_doc_page POSTs the normalized path and returns the whole page", async () => {
    for (const input of [
      `/${storingData}`,
      `/${storingData}/`,
      `/${storingData}#instance-storage`,
      `/${storingData}.mdx`,
      `${ORIGIN}/${storingData}?tab=rust`
    ]) {
      const { fetchImpl, calls } = mintlifyStub(() => Response.json({ path: storingData, content: pageMarkdown }));
      const r = await callStellarDocs(entry("stellarDocs.get_doc_page"), { path: input }, docsEnv, fetchImpl);
      expect(calls.map((call) => [call.url, call.body]), input).toEqual([[PAGE_URL, { path: storingData }]]);
      expect((calls[0]?.init?.headers as Record<string, string>).Authorization).toBe("Bearer test-key-not-real-5678");
      expect(r, input).toEqual({ ok: true, data: {
        url: `${ORIGIN}/${storingData}`,
        path: `/${storingData}`,
        title: "Storing Data",
        content: pageMarkdown
          .replace("```rust theme={null}", "```rust")
          .replace(
            "(../../../learn/fundamentals/contract-development/storage/persisting-data)",
            `(${ORIGIN}/docs/learn/fundamentals/contract-development/storage/persisting-data)`
          )
      } });
    }
  });

  it("get_doc_page strips a trailing slash before a .md suffix", async () => {
    const { fetchImpl, calls } = mintlifyStub(() => Response.json({ path: "docs/x", content: "# X\nBody." }));
    await callStellarDocs(entry("stellarDocs.get_doc_page"), { path: "/docs/x.md/" }, docsEnv, fetchImpl);
    expect(calls[0]?.body).toEqual({ path: "docs/x" });
  });

  it("get_doc_page falls back to the last path segment when the page has no H1", async () => {
    const { fetchImpl } = mintlifyStub(() => Response.json({ path: "docs/learn/glossary", content: "## Terms\nShort definitions." }));
    const r = await callStellarDocs(entry("stellarDocs.get_doc_page"), { path: "/docs/learn/glossary" }, docsEnv, fetchImpl);
    expect(r).toMatchObject({ ok: true, data: { title: "glossary", path: "/docs/learn/glossary" } });
  });

  it("get_doc_page retries an index page as <path>/index and resolves its links against the directory", async () => {
    const { fetchImpl, calls } = mintlifyStub((body) =>
      body.path === "docs/tokens/index"
        ? Response.json({ path: "docs/tokens/index", content: "# Tokens\nSee [issuing](how-to-issue-an-asset)." })
        : Response.json({ message: "Page not found" }, { status: 404 })
    );
    const r = await callStellarDocs(entry("stellarDocs.get_doc_page"), { path: "/docs/tokens/" }, docsEnv, fetchImpl);
    expect(calls.map((call) => call.body)).toEqual([{ path: "docs/tokens" }, { path: "docs/tokens/index" }]);
    expect(r).toMatchObject({ ok: true, data: {
      url: `${ORIGIN}/docs/tokens`,
      path: "/docs/tokens",
      title: "Tokens",
      content: `# Tokens\nSee [issuing](${ORIGIN}/docs/tokens/how-to-issue-an-asset).`
    } });
  });

  /** Page-store stub plus a developers.stellar.org stub that answers `redirect: "manual"` lookups. */
  function pageAndSiteStub(pages: Record<string, string>, redirects: Record<string, string>) {
    const pageCalls: string[] = [];
    const siteCalls: { url: string; init?: RequestInit }[] = [];
    const fetchImpl: FetchLike = async (url, init) => {
      if (url.startsWith(ORIGIN)) {
        siteCalls.push({ url, init });
        const location = redirects[url.slice(ORIGIN.length)];
        return location ? new Response(null, { status: 308, headers: { location } }) : new Response("not found", { status: 404 });
      }
      const { path } = JSON.parse(String(init?.body)) as { path: string };
      pageCalls.push(path);
      const content = pages[path];
      return content ? Response.json({ path, content }) : Response.json({ message: "Page not found" }, { status: 404 });
    };
    return { fetchImpl, pageCalls, siteCalls };
  }

  it("get_doc_page follows one same-origin site redirect for a moved page", async () => {
    const stub = pageAndSiteStub(
      { "docs/learn/fundamentals/contract-development/storage/state-archival": "# State Archival\nBody." },
      { "/docs/learn/encyclopedia/storage/state-archival": "/docs/learn/fundamentals/contract-development/storage/state-archival" }
    );
    const r = await callStellarDocs(entry("stellarDocs.get_doc_page"), { path: "/docs/learn/encyclopedia/storage/state-archival" }, docsEnv, stub.fetchImpl);
    expect(r).toMatchObject({ ok: true, data: {
      path: "/docs/learn/fundamentals/contract-development/storage/state-archival",
      title: "State Archival"
    } });
    expect(stub.pageCalls).toEqual([
      "docs/learn/encyclopedia/storage/state-archival",
      "docs/learn/encyclopedia/storage/state-archival/index",
      "docs/learn/fundamentals/contract-development/storage/state-archival"
    ]);
    expect(stub.siteCalls).toHaveLength(1);
    expect(stub.siteCalls[0]?.url).toBe(`${ORIGIN}/docs/learn/encyclopedia/storage/state-archival`);
    expect(stub.siteCalls[0]?.init?.redirect).toBe("manual");
    expect(stub.siteCalls[0]?.init?.headers).toBeUndefined();
  });

  it("get_doc_page does not follow a redirect off the docs site or outside /docs and /meetings", async () => {
    const stub = pageAndSiteStub({}, {
      "/docs/build/apps/moneygram-access-integration-guide": "https://developer.moneygram.com/docs/integrate",
      "/docs/old-home": "/"
    });
    for (const path of ["/docs/build/apps/moneygram-access-integration-guide", "/docs/old-home"]) {
      const r = await callStellarDocs(entry("stellarDocs.get_doc_page"), { path }, docsEnv, stub.fetchImpl);
      expect(r).toMatchObject({ ok: false, error: { kind: "soft-empty", status: 404 } });
    }
    expect(stub.pageCalls).toHaveLength(4);
  });

  it("maps a missing page (after the /index retry) to soft-empty with status 404 and recovery hints", async () => {
    const stub = pageAndSiteStub({}, {});
    const result = await callStellarDocs(entry("stellarDocs.get_doc_page"), {
      path: "/docs/build/unknown-page"
    }, docsEnv, stub.fetchImpl);
    expect(stub.pageCalls).toEqual(["docs/build/unknown-page", "docs/build/unknown-page/index"]);
    expect(stub.siteCalls.map((call) => call.url)).toEqual([`${ORIGIN}/docs/build/unknown-page`]);
    expect(result).toMatchObject({ ok: false, error: {
      kind: "soft-empty",
      status: 404,
      message: "No docs page exists at /docs/build/unknown-page. Use `path` from a search hit.",
      hint: expect.stringContaining("stellarDocs.search_doc_titles")
    } });

    // A path that already names an index page is not retried.
    const index = pageAndSiteStub({}, {});
    await callStellarDocs(entry("stellarDocs.get_doc_page"), { path: "/docs/gone/index" }, docsEnv, index.fetchImpl);
    expect(index.pageCalls).toHaveLength(1);
  });

  it("get_doc_page keeps non-404 failures as errors", async () => {
    const unauthorized = mintlifyStub(() => Response.json({ error: "Unauthorized" }, { status: 401 }));
    const r401 = await callStellarDocs(entry("stellarDocs.get_doc_page"), { path: `/${storingData}` }, docsEnv, unauthorized.fetchImpl);
    expect(r401).toMatchObject({ ok: false, error: { kind: "error", status: 401, message: "Unauthorized" } });
    expect(unauthorized.calls).toHaveLength(1);

    const down = mintlifyStub(() => Response.json({ message: "boom" }, { status: 500 }));
    const r500 = await callStellarDocs(entry("stellarDocs.get_doc_page"), { path: `/${storingData}` }, docsEnv, down.fetchImpl);
    expect(r500).toMatchObject({ ok: false, error: { kind: "error", message: expect.stringContaining("after 2 attempts") } });
    expect(down.calls).toHaveLength(2);

    const empty = mintlifyStub(() => Response.json({ path: storingData }));
    const noContent = await callStellarDocs(entry("stellarDocs.get_doc_page"), { path: `/${storingData}` }, docsEnv, empty.fetchImpl);
    expect(noContent).toMatchObject({ ok: false, error: { kind: "error", message: "Mintlify page response has no content" } });
  });

  // Every search op that advertises `includeContent` must honor it: `content` comes back only then.
  // The wire request is the same either way — content is part of every search chunk.
  const contentOps = catalog.entries.filter(
    (e) =>
      e.service === "stellarDocs" &&
      "includeContent" in ((e.inputSchema as { properties?: object } | undefined)?.properties ?? {})
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

  /** A site-relative page path inside the op's first include prefix ({category} → build). */
  function inScopePath(op: CatalogEntry): string {
    const include = (op.transport as { mintlify?: { include?: string[] } }).mintlify?.include;
    const prefix = (include?.[0] ?? "/docs/build").replace("{category}", "build");
    return `${prefix.replace(/\/$/, "")}/example-page`.replace(/^\//, "");
  }

  it("search_docs_in_category honors hitsPerPage on the meetings path", async () => {
    const meetings = Array.from({ length: 30 }, (_, i) =>
      chunk(`meetings/2026/01/${i}`, "Meeting notes section text.", `Meeting ${i}`)
    );
    const { fetchImpl, calls } = searchStub(meetings);
    const op = entry("stellarDocs.search_docs_in_category");

    const plain = await callStellarDocs(op, { query: "notes", category: "meetings", hitsPerPage: 3 }, docsEnv, fetchImpl);
    expect(plain).toMatchObject({ ok: true, data: { candidates: 30, pathFiltered: true } });
    if (!plain.ok) return;
    const plainHits = (plain.data as SearchData).hits;
    expect(plainHits).toHaveLength(3);
    expect(plainHits.some((h) => "content" in h)).toBe(false);

    const full = await callStellarDocs(op, { query: "notes", category: "meetings", hitsPerPage: 3, includeContent: true }, docsEnv, fetchImpl);
    expect(calls[1]?.body).toEqual(calls[0]?.body);
    expect(full.ok).toBe(true);
    if (!full.ok) return;
    const meetingHits = (full.data as SearchData).hits;
    expect(meetingHits.map((h) => h.path)).toEqual(["/meetings/2026/01/0", "/meetings/2026/01/1", "/meetings/2026/01/2"]);
    expect(meetingHits.every((h) => h.content === "Meeting notes section text.")).toBe(true);
  });

  for (const op of contentOps) {
    it(`${op.id} returns section content only when includeContent is true`, async () => {
      const section = chunk(inScopePath(op), "## Section\nFull section text that a snippet cannot carry.");
      const args = op.id === "stellarDocs.search_docs_in_category" ? { query: "section", category: "build" } : { query: "section" };
      const { fetchImpl, calls } = searchStub([section]);

      const plain = await callStellarDocs(op, args, docsEnv, fetchImpl);
      expect(plain.ok).toBe(true);
      if (!plain.ok) return;
      const plainHits = (plain.data as SearchData).hits;
      expect(plainHits).toHaveLength(1);
      expect(plainHits[0]?.snippet).toBe("Full section text that a snippet cannot carry.");
      expect(plainHits[0]).not.toHaveProperty("content");

      const full = await callStellarDocs(op, { ...args, includeContent: true }, docsEnv, fetchImpl);
      expect(calls[1]?.body).toEqual({ query: "section", pageSize: 50 });
      expect(full.ok).toBe(true);
      if (!full.ok) return;
      const hits = (full.data as SearchData).hits;
      expect(hits).toHaveLength(1);
      expect(hits[0]?.snippet).toBe("Full section text that a snippet cannot carry.");
      expect(hits[0]?.content).toBe("## Section\nFull section text that a snippet cannot carry.");
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
    (e) => e.service === "stellarDocs" && e.kind === "operation" && e.id !== "stellarDocs.get_doc_page"
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

  it("get_doc_page returns exactly the shape its outputSchema documents", async () => {
    const op = entry("stellarDocs.get_doc_page");
    const { fetchImpl } = mintlifyStub(() => Response.json({ path: storingData, content: pageMarkdown }));
    const r = await callStellarDocs(op, { path: `/${storingData}` }, docsEnv, fetchImpl);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(shapeErrors(JSON.parse(JSON.stringify(r.data)), op.outputSchema as Shape)).toEqual([]);
  });

  it("search_docs_in_category on the meetings path still returns the documented shape", async () => {
    const op = entry("stellarDocs.search_docs_in_category");
    const { fetchImpl } = searchStub([chunk("meetings/2026/01/15", "## Notes\nMeeting notes section text.", "Protocol meeting")]);
    const r = await callStellarDocs(op, { query: "notes", category: "meetings", includeContent: true }, docsEnv, fetchImpl);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const wire = JSON.parse(JSON.stringify(r.data)) as Record<string, unknown>;
    expect(shapeErrors(wire, op.outputSchema as Shape)).toEqual([]);
    expect(wire.pathFiltered).toBe(true);
  });

  for (const op of searchOps) {
    it(`${op.id} returns exactly the shape its outputSchema documents`, async () => {
      const mapping = (op.transport as { mintlify?: { include?: string[]; groupBy?: string } }).mintlify;
      const path = inScopePath(op);
      const props = (op.inputSchema as { properties?: object } | undefined)?.properties ?? {};
      const args = { query: "section", ...("category" in props ? { category: "build" } : {}), ...("includeContent" in props ? { includeContent: true } : {}) };
      const { fetchImpl } = searchStub([
        chunk(path, "## Heading\nSection text."),
        chunk(path, "Section text without a heading.")
      ]);
      const r = await callStellarDocs(op, args, docsEnv, fetchImpl);
      expect(r.ok).toBe(true);
      if (!r.ok) return;
      // Validate what crosses the sandbox boundary: the serialized payload, where `undefined` keys vanish.
      const wire = JSON.parse(JSON.stringify(r.data)) as { hits: unknown[]; candidates: number };
      expect(Array.isArray(wire)).toBe(false);
      expect(shapeErrors(wire, op.outputSchema as Shape)).toEqual([]);
      expect(wire.hits).toHaveLength(mapping?.groupBy === "page" ? 1 : 2);
      expect(wire.candidates).toBe(2);
      const filtersByPath = Boolean(mapping?.include?.length);
      expect("pathFiltered" in wire, op.id).toBe(filtersByPath);
      expect("pathFiltered" in ((op.outputSchema as Shape).properties ?? {}), op.id).toBe(filtersByPath);
    });
  }
});
