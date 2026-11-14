/**
 * stellar.org adapter — the Stellar Development Foundation website
 * (research/services/stellar-org-site.md describes the contract).
 *
 * Two keyless requests against one fixed origin:
 *  - search: GET /api/search?q=<query>&locale=en, the site's own search. It
 *    returns at most 10 rows of kind "page" or "partner". Rows under /blog,
 *    /press and /events, and external rows, are dropped here: other sources
 *    own that content.
 *  - page: GET <path>, server-rendered HTML. The adapter keeps the `<main>`
 *    text with headings and list items, follows same-origin redirects only,
 *    and caps the bytes it reads.
 *
 * The catalog entry's `transport.endpoint` selects the request. The origin is
 * a constant here, never read from the manifest.
 */
import type { CatalogEntry } from "../catalog/types.ts";
import { errResult, okResult, caughtResult, type AdapterResult, type FetchLike } from "./types.ts";

const SERVICE = "stellarOrg";
export const STELLAR_ORG_ORIGIN = "https://stellar.org";
const SEARCH_PATH = "/api/search";
export const USER_AGENT = "RavenMCP/1.0";
const REQUEST_TIMEOUT_MS = 12_000;
const MAX_ERROR_BODY_CHARS = 512;
/** Rendered pages measured 410-500 KB (2026-11-14); a larger body is refused, not truncated. */
export const MAX_PAGE_BYTES = 2_000_000;
export const MAX_CONTENT_CHARS = 40_000;
const MAX_REDIRECTS = 3;
const MAX_SEARCH_LIMIT = 10;
/** Path prefixes another source owns: Scout and Lumenloop hold blog and press, Scout holds events. */
export const EXCLUDED_PREFIXES = ["/blog", "/press", "/events"] as const;
/** Partner rows link to a query string on the ecosystem directory, which renders no partner detail. */
const PARTNER_DIRECTORY_PATH = "/ecosystem";
const PATH_RE = /^\/[A-Za-z0-9._~%\-/]*$/;
const MAX_PATH_CHARS = 512;

type SiteRow = {
  kind?: unknown;
  title?: unknown;
  description?: unknown;
  tags?: unknown;
  url?: unknown;
  isExternal?: unknown;
};

export type SiteHit = { title: string; description: string | null; path: string; kind: string; tags: string[] };

function underPrefix(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(`${prefix}/`);
}

/**
 * A site-relative page path, or null when the input is not one. Accepts only
 * a leading-slash path of URL-safe characters; strips one trailing slash.
 */
export function normalizeSitePath(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const path = raw.trim();
  if (path.length === 0 || path.length > MAX_PATH_CHARS || !PATH_RE.test(path)) return null;
  if (path.includes("//") || path.split("/").some((segment) => segment === "." || segment === "..")) return null;
  const trimmed = path.length > 1 ? path.replace(/\/$/, "") : path;
  if (underPrefix(trimmed, "/api")) return null;
  return trimmed;
}

/**
 * Keep same-origin page and partner rows outside the excluded prefixes. The
 * site returns one partner row per directory category; rows that share kind,
 * path, and title merge into one row with the union of their tags.
 */
export function siteHits(results: SiteRow[]): SiteHit[] {
  const hits: SiteHit[] = [];
  const byKey = new Map<string, SiteHit>();
  for (const row of results) {
    if (!row || row.isExternal === true || typeof row.url !== "string" || typeof row.title !== "string") continue;
    const kind = typeof row.kind === "string" ? row.kind : "page";
    let path: string | null;
    if (kind === "partner" && row.url.startsWith("?")) {
      path = PARTNER_DIRECTORY_PATH;
    } else {
      let url: URL;
      try {
        url = new URL(row.url, STELLAR_ORG_ORIGIN);
      } catch {
        continue;
      }
      if (url.origin !== STELLAR_ORG_ORIGIN) continue;
      path = normalizeSitePath(url.pathname);
    }
    if (!path || EXCLUDED_PREFIXES.some((prefix) => underPrefix(path, prefix))) continue;
    const description = typeof row.description === "string" && row.description.trim() ? row.description.trim() : null;
    const tags = Array.isArray(row.tags) ? row.tags.filter((tag): tag is string => typeof tag === "string") : [];
    const title = row.title.trim();
    const key = `${kind}\n${path}\n${title}`;
    const seen = byKey.get(key);
    if (seen) {
      for (const tag of tags) if (!seen.tags.includes(tag)) seen.tags.push(tag);
      seen.description ??= description;
      continue;
    }
    const hit = { title, description, path, kind, tags };
    byKey.set(key, hit);
    hits.push(hit);
  }
  return hits;
}

const ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  lsquo: "\u2018", rsquo: "\u2019", ldquo: "\u201c", rdquo: "\u201d", ndash: "\u2013", mdash: "\u2014",
  hellip: "\u2026", bull: "\u2022", middot: "\u00b7", copy: "\u00a9", reg: "\u00ae", trade: "\u2122"
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+\d*);/gi, (match, name: string) => {
    const lower = name.toLowerCase();
    if (Object.hasOwn(ENTITIES, lower)) return ENTITIES[lower]!;
    const code = lower.startsWith("#x") ? Number.parseInt(lower.slice(2), 16) : lower.startsWith("#") ? Number(lower.slice(1)) : NaN;
    return Number.isInteger(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
  });
}

/** Elements whose content is never page text. */
const SKIPPED = new Set(["script", "style", "noscript", "svg", "template", "iframe", "head"]);
const BLOCKS = new Set([
  "p", "div", "section", "article", "header", "footer", "aside", "nav", "ul", "ol", "table", "tr",
  "blockquote", "figure", "figcaption", "dl", "dt", "dd", "br", "hr", "form", "details", "summary"
]);
const TAG_RE = /<!--[\s\S]*?-->|<(\/?)([A-Za-z][A-Za-z0-9-]*)\b[^>]*>/g;

/**
 * Readable text of an HTML fragment: headings become `#` lines, list items
 * become `- ` lines, block elements break lines, everything else is text.
 * One linear pass over the tags; skipped elements drop their content.
 */
export function htmlToText(html: string): string {
  const out: string[] = [];
  let skipping: string | null = null;
  let depth = 0;
  let last = 0;
  for (const match of html.matchAll(TAG_RE)) {
    const index = match.index;
    const closing = match[1] === "/";
    const name = (match[2] ?? "").toLowerCase();
    if (skipping) {
      if (name === skipping && !match[0].endsWith("/>")) depth += closing ? -1 : 1;
      if (depth === 0) {
        skipping = null;
        last = index + match[0].length;
      }
      continue;
    }
    out.push(html.slice(last, index));
    last = index + match[0].length;
    if (!name) continue;
    if (SKIPPED.has(name) && !closing) {
      if (!match[0].endsWith("/>")) {
        skipping = name;
        depth = 1;
      }
      continue;
    }
    const heading = /^h([1-6])$/.exec(name);
    if (heading) out.push(closing ? "\n\n" : `\n\n${"#".repeat(Number(heading[1]))} `);
    else if (name === "li") out.push(closing ? "\n" : "\n- ");
    else if (BLOCKS.has(name)) out.push("\n");
    else if (name === "td" || name === "th") out.push(" ");
  }
  if (!skipping) out.push(html.slice(last));
  const lines = decodeEntities(out.join(""))
    .split("\n")
    .map((line) => line.replace(/[ \t\r\f\v ]+/g, " ").trim());
  const kept: string[] = [];
  for (const line of lines) {
    // Empty heading and bullet markers carry nothing; a repeated line is a responsive-layout duplicate.
    if (!line || /^(#{1,6}|-)$/.test(line) || line === kept.at(-1)) continue;
    kept.push(line);
  }
  // Blank lines set off headings only, so list items and short lines stay together.
  return kept.map((line, i) => (i > 0 && (line.startsWith("#") || kept[i - 1]!.startsWith("#")) ? `\n${line}` : line)).join("\n");
}

/**
 * The first `<main>` element's inner HTML, else the `<body>`'s, else the whole
 * document. Tags inside skipped elements (a `<main>` string in a script) never count.
 */
export function mainHtml(html: string): string {
  let skipping: string | null = null;
  let depth = 0;
  let mainStart = -1;
  let mainDepth = 0;
  let bodyStart = -1;
  for (const match of html.matchAll(TAG_RE)) {
    const name = (match[2] ?? "").toLowerCase();
    if (!name) continue;
    const closing = match[1] === "/";
    const selfClosing = match[0].endsWith("/>");
    if (skipping) {
      if (name === skipping && !selfClosing) depth += closing ? -1 : 1;
      if (depth === 0) skipping = null;
      continue;
    }
    if (SKIPPED.has(name) && !closing && !selfClosing) {
      skipping = name;
      depth = 1;
      continue;
    }
    const end = match.index + match[0].length;
    if (name === "body" && !closing && bodyStart < 0) bodyStart = end;
    if (name !== "main") continue;
    if (!closing) {
      if (mainStart < 0) mainStart = end;
      if (mainDepth >= 0) mainDepth += 1;
    } else if (mainDepth > 0) {
      mainDepth -= 1;
      if (mainDepth === 0) return html.slice(mainStart, match.index);
    }
  }
  if (mainStart >= 0) return html.slice(mainStart);
  return bodyStart >= 0 ? html.slice(bodyStart) : html;
}

function documentTitle(html: string): string | undefined {
  const match = /<title\b[^>]*>([^<]*)<\/title>/i.exec(html);
  const title = match ? decodeEntities(match[1]!).replace(/\s+/g, " ").trim() : "";
  return title || undefined;
}

async function readCapped(res: Response, maxBytes: number): Promise<string | null> {
  const declared = Number(res.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) {
    await res.body?.cancel();
    return null;
  }
  if (!res.body) return "";
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

function get(url: string, accept: string, fetchImpl: FetchLike): Promise<Response> {
  return fetchImpl(url, {
    method: "GET",
    headers: { Accept: accept, "User-Agent": USER_AGENT },
    redirect: "manual",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  });
}

async function search(args: Record<string, unknown>, fetchImpl: FetchLike): Promise<AdapterResult> {
  const query = typeof args.query === "string" ? args.query.trim() : "";
  if (!query) return errResult({ service: SERVICE, kind: "error", message: "query must be a non-empty string" });
  const limit =
    typeof args.limit === "number" && Number.isInteger(args.limit) ? Math.min(Math.max(args.limit, 1), MAX_SEARCH_LIMIT) : 5;
  const url = `${STELLAR_ORG_ORIGIN}${SEARCH_PATH}?${new URLSearchParams({ q: query, locale: "en" })}`;
  const res = await get(url, "application/json", fetchImpl);
  const bodyText = await res.text();
  if (!res.ok) {
    return errResult({
      service: SERVICE,
      kind: "error",
      status: res.status,
      message: `stellar.org search HTTP ${res.status}: ${bodyText.trim().slice(0, MAX_ERROR_BODY_CHARS)}`
    });
  }
  let body: { results?: unknown };
  try {
    body = JSON.parse(bodyText) as { results?: unknown };
  } catch {
    return errResult({ service: SERVICE, kind: "error", message: "stellar.org search returned malformed JSON" });
  }
  if (!body || !Array.isArray(body.results)) {
    return errResult({ service: SERVICE, kind: "error", message: "stellar.org search response has no results array" });
  }
  const hits = siteHits(body.results as SiteRow[]);
  // The site-search row count rides under `meta`, so an all-filtered result still reads as no rows.
  return okResult({ hits: hits.slice(0, limit), meta: { candidates: body.results.length } });
}

async function page(args: Record<string, unknown>, fetchImpl: FetchLike): Promise<AdapterResult> {
  const requested = normalizeSitePath(args.path);
  if (!requested) {
    return errResult({
      service: SERVICE,
      kind: "error",
      message: "path must be a site-relative stellar.org page path such as /foundation/roadmap",
      hint: "Use `path` from a stellarOrg.search_site hit. Full URLs, query strings, and /api paths are refused."
    });
  }
  let path = requested;
  for (let hop = 0; ; hop += 1) {
    const res = await get(`${STELLAR_ORG_ORIGIN}${path}`, "text/html", fetchImpl);
    if (res.status >= 300 && res.status < 400) {
      await res.body?.cancel();
      const location = res.headers.get("location");
      const target = location ? new URL(location, `${STELLAR_ORG_ORIGIN}${path}`) : null;
      const next = target && target.origin === STELLAR_ORG_ORIGIN && !target.search ? normalizeSitePath(target.pathname) : null;
      if (!next) {
        return errResult({
          service: SERVICE,
          kind: "error",
          status: res.status,
          message: `${path} redirects off stellar.org${target ? ` to ${target.origin}${target.pathname}` : ""}; it is not a stellar.org page`,
          hint: "Read the target with the source that owns that site."
        });
      }
      if (hop >= MAX_REDIRECTS || next === path) {
        return errResult({ service: SERVICE, kind: "error", status: res.status, message: `${requested} redirects more than ${MAX_REDIRECTS} times` });
      }
      path = next;
      continue;
    }
    if (res.status === 404 || res.status === 410) {
      await res.body?.cancel();
      return errResult({
        service: SERVICE,
        kind: "soft-empty",
        status: res.status,
        message: `No stellar.org page exists at ${path}.`,
        hint: "Find the page path with stellarOrg.search_site. A missing path does not mean SDF has no page on the topic."
      });
    }
    if (!res.ok) {
      const text = await readCapped(res, MAX_ERROR_BODY_CHARS * 4);
      return errResult({
        service: SERVICE,
        kind: "error",
        status: res.status,
        message: `stellar.org HTTP ${res.status}${text ? `: ${text.trim().slice(0, MAX_ERROR_BODY_CHARS)}` : ""}`
      });
    }
    const contentType = res.headers.get("content-type") ?? "";
    if (!/^text\/html\b/i.test(contentType)) {
      await res.body?.cancel();
      return errResult({ service: SERVICE, kind: "error", message: `${path} is not an HTML page (${contentType || "no content type"})` });
    }
    const html = await readCapped(res, MAX_PAGE_BYTES);
    if (html === null) {
      return errResult({ service: SERVICE, kind: "error", message: `${path} exceeds the ${MAX_PAGE_BYTES}-byte page limit` });
    }
    const text = htmlToText(mainHtml(html));
    const truncated = text.length > MAX_CONTENT_CHARS;
    const title = documentTitle(html) ?? path;
    return okResult({
      url: `${STELLAR_ORG_ORIGIN}${path}`,
      path,
      title,
      content: truncated ? text.slice(0, MAX_CONTENT_CHARS) : text,
      ...(truncated ? { truncated: true } : {})
    });
  }
}

export async function callStellarOrg(
  entry: CatalogEntry,
  args: Record<string, unknown>,
  fetchImpl: FetchLike = fetch
): Promise<AdapterResult> {
  const endpoint = (entry.transport as { endpoint?: unknown } | undefined)?.endpoint;
  try {
    if (endpoint === "search") return await search(args, fetchImpl);
    if (endpoint === "page") return await page(args, fetchImpl);
    return errResult({ service: SERVICE, kind: "error", message: `catalog entry ${entry.id} has no stellar.org endpoint mapping — cannot call it` });
  } catch (e) {
    return caughtResult(SERVICE, e);
  }
}
