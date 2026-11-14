/**
 * stellar.org adapter: both operations against recorded fixtures, the path
 * guard, the partner and blog/press/events filter, redirects, size and time
 * caps, and the envelope the sandbox sees. No live calls.
 */
import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadManifest, type Catalog, type CatalogEntry } from "../src/catalog/search.ts";
import { callService } from "../src/adapters/index.ts";
import {
  EXCLUDED_PREFIXES,
  MAX_CONTENT_CHARS,
  MAX_PAGE_BYTES,
  STELLAR_ORG_ORIGIN,
  USER_AGENT,
  callStellarOrg,
  htmlToText,
  mainHtml,
  normalizeSitePath,
  siteHits
} from "../src/adapters/stellar-org.ts";
import type { FetchLike } from "../src/adapters/types.ts";
import { buildSandbox, type OpLedgerCall } from "../src/executor/providers.ts";
import { lazyPinnedSkillSource as skillSource } from "./helpers/skill-source.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalog: Catalog = loadManifest(JSON.parse(readFileSync(join(ROOT, "catalog", "manifest.json"), "utf8")));
const fixture = (name: string) => readFileSync(join(ROOT, "test", "fixtures", name), "utf8");

function entry(id: string): CatalogEntry {
  const found = catalog.entries.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`missing catalog entry ${id}`);
  return found;
}

const SEARCH = entry("stellarOrg.search_site");
const PAGE = entry("stellarOrg.get_page");

type Call = { url: string; init?: RequestInit };

/** Answers each request from `respond`, recording every call. */
function recorder(respond: (url: string, index: number) => Response): { fetchImpl: FetchLike; calls: Call[] } {
  const calls: Call[] = [];
  const fetchImpl: FetchLike = async (url, init) => {
    calls.push({ url, init });
    return respond(url, calls.length - 1);
  };
  return { fetchImpl, calls };
}

const html = (body: string, headers: Record<string, string> = {}) =>
  new Response(body, { status: 200, headers: { "content-type": "text/html; charset=utf-8", ...headers } });

describe("stellarOrg catalog entries", () => {
  it("name the fixed origin and the endpoint the adapter reads", () => {
    expect(SEARCH.transport).toMatchObject({ type: "http", base: STELLAR_ORG_ORIGIN, path: "/api/search", endpoint: "search" });
    expect(PAGE.transport).toMatchObject({ type: "http", base: STELLAR_ORG_ORIGIN, endpoint: "page" });
  });
});

describe("stellarOrg.search_site", () => {
  it("calls the keyless site search with a generic User-Agent and no redirect following", async () => {
    const { fetchImpl, calls } = recorder(() => new Response(fixture("stellar-org-search.json")));
    await callStellarOrg(SEARCH, { query: "moneygram ramps" }, fetchImpl);
    expect(calls).toHaveLength(1);
    const url = new URL(calls[0]!.url);
    expect(url.origin + url.pathname).toBe(`${STELLAR_ORG_ORIGIN}/api/search`);
    expect(Object.fromEntries(url.searchParams)).toEqual({ q: "moneygram ramps", locale: "en" });
    const init = calls[0]!.init!;
    expect(init.method).toBe("GET");
    expect(init.redirect).toBe("manual");
    expect(init.headers).toMatchObject({ "User-Agent": USER_AGENT });
    expect(JSON.stringify(init.headers)).not.toMatch(/authorization|cookie/i);
  });

  it("drops partner, blog, press, events and external rows", async () => {
    const { fetchImpl } = recorder(() => new Response(fixture("stellar-org-search.json")));
    const result = await callStellarOrg(SEARCH, { query: "moneygram", limit: 10 }, fetchImpl);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const data = result.data as { hits: { path: string; kind: string; title: string; tags: string[] }[]; meta: { candidates: number } };
    expect(data.meta).toEqual({ candidates: 12 });
    expect(data.hits.map((hit) => [hit.kind, hit.path])).toEqual([
      ["page", "/products-and-tools/moneygram"],
      ["page", "/case-studies/moneygram-international"]
    ]);
    for (const hit of data.hits) {
      expect(Object.keys(hit).sort()).toEqual(["description", "kind", "path", "tags", "title"]);
      for (const prefix of EXCLUDED_PREFIXES) expect(hit.path.startsWith(`${prefix}/`)).toBe(false);
    }
  });

  it("applies the prefix filter on whole path segments", () => {
    const rows = ["/blog", "/blog/x", "/BLOG/x", "/press/x", "/events/x", "/blogger", "/pressroom/x", "/eventsuite"].map((url) => ({
      kind: "page",
      title: url,
      url
    }));
    expect(siteHits(rows).map((hit) => hit.path)).toEqual(["/blogger", "/pressroom/x", "/eventsuite"]);
  });

  it("clips a long description", () => {
    const [hit] = siteHits([{ kind: "page", title: "t", url: "/t", description: "d".repeat(100_000) }]);
    expect(hit!.description).toHaveLength(500);
  });

  it("drops rows that leave the origin even when isExternal is false", () => {
    const rows = [
      { kind: "page", title: "elsewhere", url: "https://developers.stellar.org/docs", isExternal: false },
      { kind: "page", title: "absolute same-origin", url: "https://stellar.org/foundation/roadmap/", isExternal: false }
    ];
    expect(siteHits(rows).map((hit) => hit.path)).toEqual(["/foundation/roadmap"]);
  });

  it("honors limit and defaults to five hits", async () => {
    const results = Array.from({ length: 10 }, (_, i) => ({ kind: "page", title: `p${i}`, url: `/p${i}`, isExternal: false }));
    const { fetchImpl } = recorder(() => Response.json({ query: "x", locale: "en", results }));
    const byDefault = await callStellarOrg(SEARCH, { query: "x" }, fetchImpl);
    const limited = await callStellarOrg(SEARCH, { query: "x", limit: 2 }, fetchImpl);
    expect(byDefault.ok && (byDefault.data as { hits: unknown[] }).hits).toHaveLength(5);
    expect(limited.ok && (limited.data as { hits: unknown[] }).hits).toHaveLength(2);
  });

  it("returns ok with no rows when every candidate is filtered, so the host marks it no-rows", async () => {
    const results = [
      { kind: "page", title: "post", url: "/blog/x", isExternal: false },
      { kind: "page", title: "release", url: "/press/y", isExternal: false }
    ];
    const fetchImpl: FetchLike = async () => Response.json({ query: "x", locale: "en", results });
    const calls: OpLedgerCall[] = [];
    const sandbox = buildSandbox(catalog, skillSource, {}, { fetchImpl, onOpCall: (call) => calls.push(call) });
    const fns = sandbox.find((provider) => provider.name === "stellarOrg")!.fns;
    const result = (await fns.search_site!({ query: "x" })) as Record<string, unknown>;
    expect(result).toMatchObject({ ok: true, data: { hits: [], meta: { candidates: 2 } }, caveat: "no-rows", asOfBasis: "observed" });
    expect(typeof result.asOf).toBe("string");
    expect(calls[0]).toMatchObject({ op: "stellarOrg.search_site", outcome: "ok", caveat: "no-rows" });
  });

  it("returns rows with no caveat through the sandbox envelope", async () => {
    const fetchImpl: FetchLike = async () => new Response(fixture("stellar-org-search.json"));
    const sandbox = buildSandbox(catalog, skillSource, {}, { fetchImpl });
    const fns = sandbox.find((provider) => provider.name === "stellarOrg")!.fns;
    const result = (await fns.search_site!({ query: "moneygram" })) as Record<string, unknown>;
    expect(result).toMatchObject({ ok: true, asOfBasis: "observed" });
    expect(result).not.toHaveProperty("caveat");
  });

  it("reports upstream failures as errors, never soft-empty", async () => {
    const cases: [Response, RegExp][] = [
      [Response.json({ error: "invalid_query" }, { status: 400 }), /HTTP 400: \{"error":"invalid_query"\}/],
      [new Response("upstream down", { status: 503 }), /HTTP 503/],
      [new Response("<html>not json</html>", { status: 200 }), /malformed JSON/],
      [Response.json({ query: "x" }), /no results array/],
      [new Response(null, { status: 308, headers: { location: "https://example.com/" } }), /HTTP 308/]
    ];
    for (const [response, message] of cases) {
      const result = await callStellarOrg(SEARCH, { query: "x" }, async () => response);
      expect(result.ok).toBe(false);
      if (result.ok) continue;
      expect(result.error.kind).toBe("error");
      expect(result.error.message).toMatch(message);
    }
  });

  it("refuses an empty query without a request", async () => {
    const { fetchImpl, calls } = recorder(() => new Response("{}"));
    const result = await callStellarOrg(SEARCH, { query: "   " }, fetchImpl);
    expect(result).toMatchObject({ ok: false, error: { kind: "error", service: "stellarOrg" } });
    expect(calls).toHaveLength(0);
  });

  it("turns a network failure into an error envelope", async () => {
    const result = await callStellarOrg(SEARCH, { query: "x" }, async () => {
      throw new TypeError("network down");
    });
    expect(result).toMatchObject({ ok: false, error: { kind: "error", message: "network down" } });
  });
});

describe("stellarOrg.get_page path guard", () => {
  it.each([
    ["/foundation/strategy", "/foundation/strategy"],
    ["/foundation/roadmap/", "/foundation/roadmap"],
    ["/", "/"],
    ["/audit-bank/projects", "/audit-bank/projects"]
  ])("accepts %s", (raw, expected) => {
    expect(normalizeSitePath(raw)).toBe(expected);
  });

  it.each([
    "foundation/strategy",
    "https://stellar.org/foundation/strategy",
    "//evil.example/path",
    "/foundation//strategy",
    "/foundation/../api/search",
    "/./foundation",
    "/ecosystem?partner=moneygram",
    "/foundation#team",
    "/api",
    "/api/search",
    "/foundation strategy",
    "/%2e%2e/api/search",
    "/foo/%2e%2e/api/x",
    "/.%2e/api/search",
    "/%2E/api",
    "/%61pi/search",
    "/foundation%2fstrategy",
    "/foundation%5cstrategy",
    "/foundation/strategy%00",
    "/" + "a".repeat(600),
    "",
    42
  ])("refuses %s without a request", async (raw) => {
    expect(normalizeSitePath(raw)).toBeNull();
    const { fetchImpl, calls } = recorder(() => html(""));
    const result = await callStellarOrg(PAGE, { path: raw }, fetchImpl);
    expect(result).toMatchObject({ ok: false, error: { kind: "error" } });
    expect(calls).toHaveLength(0);
  });
});

describe("stellarOrg.get_page", () => {
  it("returns the main text with headings and list items, and drops scripts, styles and chrome", async () => {
    const { fetchImpl, calls } = recorder(() => html(fixture("stellar-org-page.html")));
    const result = await callStellarOrg(PAGE, { path: "/foundation/strategy" }, fetchImpl);
    expect(calls.map((call) => call.url)).toEqual([`${STELLAR_ORG_ORIGIN}/foundation/strategy`]);
    expect(calls[0]!.init).toMatchObject({ method: "GET", redirect: "manual", headers: { "User-Agent": USER_AGENT } });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const data = result.data as { url: string; path: string; title: string; content: string };
    expect(data.url).toBe("https://stellar.org/foundation/strategy");
    expect(data.path).toBe("/foundation/strategy");
    expect(data.title).toBe("SDF's Strategy | Stellar");
    expect(data.content).toBe(
      [
        "2026",
        "",
        "# Accelerating growth",
        "",
        "SDF’s 2026 objectives are designed to accelerate growth & scale what works.",
        "",
        "## Asset adoption and utilization",
        "",
        "We’re targeting $1 billion in growth for network asset value on Stellar.",
        "$605M BENJI",
        "",
        "### Business development",
        "",
        "- Bringing new institutions onchain.",
        "- Ecosystem expansion",
        "Target 15 enterprises"
      ].join("\n")
    );
    expect(data).not.toHaveProperty("truncated");
  });

  it("follows a same-origin redirect and reports the served path", async () => {
    const { fetchImpl, calls } = recorder((_url, index) =>
      index === 0
        ? new Response(null, { status: 308, headers: { location: "/foundation/roadmap" } })
        : html("<main><h1>2025 Product Roadmap</h1></main>")
    );
    const result = await callStellarOrg(PAGE, { path: "/foundation/old-roadmap" }, fetchImpl);
    expect(calls.map((call) => call.url)).toEqual([
      `${STELLAR_ORG_ORIGIN}/foundation/old-roadmap`,
      `${STELLAR_ORG_ORIGIN}/foundation/roadmap`
    ]);
    expect(result).toMatchObject({ ok: true, data: { path: "/foundation/roadmap", content: "# 2025 Product Roadmap" } });
  });

  it.each([
    ["another host", "https://developers.stellar.org/"],
    ["a scheme change", "http://stellar.org/foundation"],
    ["a protocol-relative host", "//evil.example/x"],
    ["an /api path", "/api/search?q=x"],
    ["a query string", "/ecosystem?partner=x"],
    ["an encoded /api path", "/%2e%2e/api/x"]
  ])("refuses a redirect to %s without following it", async (_label, location) => {
    const { fetchImpl, calls } = recorder(() => new Response(null, { status: 307, headers: { location } }));
    const result = await callStellarOrg(PAGE, { path: "/developers" }, fetchImpl);
    expect(calls).toHaveLength(1);
    expect(result).toMatchObject({ ok: false, error: { kind: "error", status: 307 } });
  });

  it("names an on-site refusal differently from an off-site redirect", async () => {
    const respond = (location: string) => async () => new Response(null, { status: 302, headers: { location } });
    const offSite = await callStellarOrg(PAGE, { path: "/a" }, respond("https://evil.example/b"));
    const onSite = await callStellarOrg(PAGE, { path: "/a" }, respond("/b?x=1"));
    expect(offSite).toMatchObject({ ok: false, error: { message: expect.stringMatching(/redirects off stellar\.org/) } });
    expect(onSite).toMatchObject({ ok: false, error: { message: expect.stringMatching(/stellar\.org URL this tool does not read/) } });
    expect(onSite.ok ? "" : onSite.error.message).not.toMatch(/off stellar\.org/);
  });

  it("stops following redirects when the operation budget runs out", async () => {
    let now = 1_000_000;
    const clock = vi.spyOn(Date, "now").mockImplementation(() => now);
    try {
      const { fetchImpl, calls } = recorder((_url, index) => {
        now += 13_000;
        return new Response(null, { status: 301, headers: { location: `/hop${index + 1}` } });
      });
      const result = await callStellarOrg(PAGE, { path: "/hop0" }, fetchImpl);
      expect(calls).toHaveLength(2);
      expect(result).toMatchObject({ ok: false, error: { kind: "error", message: expect.stringMatching(/did not load within 24 s/) } });
    } finally {
      clock.mockRestore();
    }
  });

  it("stops a redirect loop", async () => {
    const { fetchImpl, calls } = recorder((_url, index) =>
      new Response(null, { status: 301, headers: { location: index % 2 === 0 ? "/b" : "/a" } })
    );
    const result = await callStellarOrg(PAGE, { path: "/a" }, fetchImpl);
    expect(result).toMatchObject({ ok: false, error: { kind: "error" } });
    expect(calls.length).toBeLessThanOrEqual(4);
  });

  it("reports a missing page as soft-empty, distinct from an error", async () => {
    const missing = await callStellarOrg(PAGE, { path: "/no-such-page" }, async () => new Response("not found", { status: 404 }));
    expect(missing).toMatchObject({ ok: false, error: { kind: "soft-empty", status: 404 } });
    const failed = await callStellarOrg(PAGE, { path: "/foundation" }, async () => new Response("boom", { status: 500 }));
    expect(failed).toMatchObject({ ok: false, error: { kind: "error", status: 500 } });
  });

  it("reports a page with no server-side main text as soft-empty", async () => {
    for (const body of ["<html><body><nav>menu</nav></body></html>", "<html><body></body></html>", "<main> <div></div> </main>"]) {
      const result = await callStellarOrg(PAGE, { path: "/shell" }, async () => html(body));
      expect(result).toMatchObject({ ok: false, error: { kind: "soft-empty", message: expect.stringMatching(/no server-side text/) } });
    }
  });

  it("refuses a non-HTML response", async () => {
    const result = await callStellarOrg(PAGE, { path: "/file.pdf" }, async () =>
      new Response("%PDF", { status: 200, headers: { "content-type": "application/pdf" } })
    );
    expect(result).toMatchObject({ ok: false, error: { kind: "error" } });
  });

  it("refuses a body over the byte cap, by declared length and while streaming", async () => {
    const declared = await callStellarOrg(PAGE, { path: "/big" }, async () =>
      html("<main>x</main>", { "content-length": String(MAX_PAGE_BYTES + 1) })
    );
    expect(declared).toMatchObject({ ok: false, error: { kind: "error", message: expect.stringMatching(/byte page limit/) } });
    const chunk = new Uint8Array(512 * 1024).fill(0x61);
    const streamed = await callStellarOrg(PAGE, { path: "/big" }, async () => {
      let sent = 0;
      const body = new ReadableStream<Uint8Array>({
        pull(controller) {
          sent += chunk.byteLength;
          controller.enqueue(chunk);
          if (sent > MAX_PAGE_BYTES * 2) controller.close();
        }
      });
      return new Response(body, { status: 200, headers: { "content-type": "text/html" } });
    });
    expect(streamed).toMatchObject({ ok: false, error: { kind: "error", message: expect.stringMatching(/byte page limit/) } });
  });

  it("cuts long content and marks it truncated", async () => {
    const paragraphs = Array.from({ length: 10 }, (_, i) => `<p>${`word${i} `.repeat(1000)}</p>`).join("");
    const result = await callStellarOrg(PAGE, { path: "/long" }, async () => html(`<main>${paragraphs}</main>`));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const data = result.data as { content: string; truncated?: boolean };
    expect(data.content.length).toBe(MAX_CONTENT_CHARS);
    expect(data.truncated).toBe(true);
  });

  it("is reachable through the service dispatcher", async () => {
    const result = await callService(PAGE, { path: "/foundation" }, {}, async () => html("<main><p>About</p></main>"));
    expect(result).toMatchObject({ ok: true, data: { content: "About" } });
  });
});

describe("htmlToText and mainHtml", () => {
  it("ignores a main tag inside a script and takes the first real main element", () => {
    const page = '<head><script>var s = "<main>fake</main>";</script></head><body><main><main>inner</main> outer</main><main>second</main></body>';
    expect(htmlToText(mainHtml(page))).toBe("inner outer");
  });

  it("returns no text when the page has no main element", () => {
    expect(mainHtml("<html><head><title>t</title></head><body><p>Body chrome</p></body></html>")).toBe("");
  });

  it("scans unterminated comments and tags in linear time", () => {
    for (const tail of ["<!--".repeat(500_000), "<a ".repeat(500_000)]) {
      const started = performance.now();
      htmlToText(mainHtml(`<main>${tail}`));
      expect(performance.now() - started).toBeLessThan(1_000);
    }
  });

  it("decodes numeric and named entities and leaves unknown ones", () => {
    expect(htmlToText("<p>&#x27;a&#39; &lt;b&gt; &quot;c&quot; &unknown; &#0;</p>")).toBe("'a' <b> \"c\" &unknown; &#0;");
  });

  it("skips nested skipped elements as a unit and keeps text after them", () => {
    expect(htmlToText("<svg><svg><text>icon</text></svg><text>more</text></svg><p>after</p>")).toBe("after");
    expect(htmlToText("<p>before</p><script>if (a < b) {}</script><p>after</p>")).toBe("before\nafter");
    expect(htmlToText("<li>same</li><li></li><li>same</li><h2>Next</h2><p>x</p>")).toBe("- same\n\n## Next\n\nx");
  });
});
