/**
 * stellar.org adapter — the Stellar Development Foundation website
 * (research/services/stellar-org-site.md describes the contract).
 *
 * Two keyless requests against one fixed origin:
 *  - search: GET /api/search?q=<query>&locale=en, the site's own search. It
 *    returns at most 10 rows of kind "page", "audit", "tutorial" or "partner".
 *    Rows under /blog, /press and /events are dropped here (Scout and
 *    Lumenloop return those posts for the same questions), as are external
 *    rows other than audits, whose report link is the record.
 *  - page: GET <path>, server-rendered HTML. The adapter keeps the `<main>`
 *    text with headings and list items, follows same-origin redirects only,
 *    and caps the bytes it reads and the time one read takes.
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
/** One get_page call, redirects included, as the Docs adapter bounds one operation. */
const OPERATION_BUDGET_MS = 24_000;
const MAX_SEARCH_BYTES = 256_000;
const MAX_DESCRIPTION_CHARS = 500;
const MAX_ERROR_BODY_CHARS = 512;
/** Rendered pages measured 410-500 KB (2026-11-14); a larger body is refused, not truncated. */
export const MAX_PAGE_BYTES = 2_000_000;
export const MAX_CONTENT_CHARS = 40_000;
const MAX_REDIRECTS = 3;
const MAX_SEARCH_LIMIT = 10;
/** Path prefixes another source owns: Scout and Lumenloop return these posts for the same questions (2026-11-14). */
export const EXCLUDED_PREFIXES = ["/blog", "/press", "/events"] as const;
/** No `%`: fetch would decode `%2e` segments and the server `%61`, so encoded forms could reach /api. */
const PATH_RE = /^\/[A-Za-z0-9._~\-/]*$/;
const MAX_PATH_CHARS = 512;

type SiteRow = {
  kind?: unknown;
  title?: unknown;
  description?: unknown;
  tags?: unknown;
  url?: unknown;
  isExternal?: unknown;
};

/** A page to read with get_page. */
export type PageHit = { kind: "page"; title: string; description: string | null; path: string; tags: string[] };
/** A video tutorial; its `url` opens a client-side player, so there is no page text to read. */
export type TutorialHit = { kind: "tutorial"; title: string; description: string | null; url: string; tags: string[] };
/** An ecosystem directory listing; `tags` holds the directory categories. */
export type PartnerHit = { kind: "partner"; title: string; description: string | null; url: string; tags: string[] };
/** An audit-register record: `reportUrl` is the auditor's report, cited, never fetched. */
export type AuditHit = { kind: "audit"; title: string; project: string | null; firm: string | null; reportUrl: string };
export type SiteHit = PageHit | TutorialHit | PartnerHit | AuditHit;

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,199}$/i;
const MAX_REPORT_URL_CHARS = 2048;

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

function text(value: unknown, max: number): string | null {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}

function stringTags(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((tag): tag is string => typeof tag === "string") : [];
}

/** "Project - Firm"; the site writes "Unnamed record" when the register has no project. */
function auditHit(title: string, rawUrl: unknown): AuditHit | null {
  if (typeof rawUrl !== "string" || rawUrl.length > MAX_REPORT_URL_CHARS) return null;
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const cut = title.lastIndexOf(" -");
  const project = cut >= 0 ? title.slice(0, cut).trim() : title;
  const firm = cut >= 0 ? title.slice(cut + 2).trim() : "";
  return {
    kind: "audit",
    title,
    project: project && project !== "Unnamed record" ? project : null,
    firm: firm || null,
    reportUrl: url.href
  };
}

/** The `?name=` slug of a site-relative directory or tutorial link on `pathname`, or null. */
function siteSlug(rawUrl: unknown, pathname: string, name: string): string | null {
  if (typeof rawUrl !== "string") return null;
  let url: URL;
  try {
    url = new URL(rawUrl, `${STELLAR_ORG_ORIGIN}${pathname}`);
  } catch {
    return null;
  }
  const slug = url.searchParams.get(name);
  return url.origin === STELLAR_ORG_ORIGIN && url.pathname === pathname && slug && SLUG_RE.test(slug) ? slug : null;
}

/**
 * Site-search rows in site order, by kind: same-origin pages outside the
 * excluded prefixes, audit records with their report link, tutorials, and
 * partner listings (one hit per partner; the site returns one row per
 * directory category, merged here into `tags`). Unknown kinds are dropped.
 */
export function siteHits(results: SiteRow[]): SiteHit[] {
  const hits: SiteHit[] = [];
  const partners = new Map<string, PartnerHit>();
  for (const row of results) {
    if (!row || typeof row.title !== "string" || !row.title.trim()) continue;
    const title = row.title.trim();
    const description = text(row.description, MAX_DESCRIPTION_CHARS);
    const kind = typeof row.kind === "string" ? row.kind : "page";
    if (kind === "audit") {
      const hit = auditHit(title, row.url);
      if (hit) hits.push(hit);
      continue;
    }
    if (row.isExternal === true) continue;
    if (kind === "tutorial") {
      const slug = siteSlug(row.url, "/learn", "tutorial");
      if (slug) hits.push({ kind, title, description, url: `${STELLAR_ORG_ORIGIN}/learn?tutorial=${slug}`, tags: stringTags(row.tags) });
      continue;
    }
    if (kind === "partner") {
      const slug = siteSlug(row.url, "/ecosystem", "partner");
      if (!slug) continue;
      const category = siteSlug(row.url, "/ecosystem", "category");
      const seen = partners.get(slug);
      if (seen) {
        if (category && !seen.tags.includes(category)) seen.tags.push(category);
        continue;
      }
      const hit: PartnerHit = { kind, title, description, url: `${STELLAR_ORG_ORIGIN}/ecosystem?partner=${slug}`, tags: category ? [category] : [] };
      partners.set(slug, hit);
      hits.push(hit);
      continue;
    }
    if (kind !== "page" || typeof row.url !== "string") continue;
    let url: URL;
    try {
      url = new URL(row.url, STELLAR_ORG_ORIGIN);
    } catch {
      continue;
    }
    if (url.origin !== STELLAR_ORG_ORIGIN) continue;
    const path = normalizeSitePath(url.pathname);
    if (!path || EXCLUDED_PREFIXES.some((prefix) => underPrefix(path.toLowerCase(), prefix))) continue;
    hits.push({ kind, title, description, path, tags: stringTags(row.tags) });
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
/**
 * An unterminated comment runs to the end, a tag body stops at the next `<`, and
 * the lookahead keeps the name from backtracking (`\b` rescanned `<a-a-a…` per hyphen),
 * so a scan stays linear.
 */
const TAG_RE = /<!--(?:[\s\S]*?-->|[\s\S]*$)|<(\/?)([A-Za-z][A-Za-z0-9-]*)(?![\w-])[^<>]*>/g;

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
 * The first `<main>` element's inner HTML, or "" when the page has none (body
 * chrome is not page text). Tags inside skipped elements (a `<main>` string in
 * a script) never count.
 */
export function mainHtml(html: string): string {
  let skipping: string | null = null;
  let depth = 0;
  let mainStart = -1;
  let mainDepth = 0;
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
    if (name !== "main") continue;
    if (!closing) {
      if (mainStart < 0) mainStart = match.index + match[0].length;
      if (mainDepth >= 0) mainDepth += 1;
    } else if (mainDepth > 0) {
      mainDepth -= 1;
      if (mainDepth === 0) return html.slice(mainStart, match.index);
    }
  }
  return mainStart >= 0 ? html.slice(mainStart) : "";
}

function documentTitle(html: string): string | undefined {
  const match = /<title\b[^<>]*>([^<]*)<\/title>/i.exec(html);
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

function get(url: string, accept: string, fetchImpl: FetchLike, timeoutMs = REQUEST_TIMEOUT_MS): Promise<Response> {
  return fetchImpl(url, {
    method: "GET",
    headers: { Accept: accept, "User-Agent": USER_AGENT },
    redirect: "manual",
    signal: AbortSignal.timeout(timeoutMs)
  });
}

async function search(args: Record<string, unknown>, fetchImpl: FetchLike): Promise<AdapterResult> {
  const query = typeof args.query === "string" ? args.query.trim() : "";
  if (!query) return errResult({ service: SERVICE, kind: "error", message: "query must be a non-empty string" });
  const limit =
    typeof args.limit === "number" && Number.isInteger(args.limit) ? Math.min(Math.max(args.limit, 1), MAX_SEARCH_LIMIT) : 5;
  const url = `${STELLAR_ORG_ORIGIN}${SEARCH_PATH}?${new URLSearchParams({ q: query, locale: "en" })}`;
  const res = await get(url, "application/json", fetchImpl);
  const bodyText = await readCapped(res, MAX_SEARCH_BYTES);
  if (bodyText === null) {
    return errResult({ service: SERVICE, kind: "error", message: `stellar.org search response exceeds ${MAX_SEARCH_BYTES} bytes` });
  }
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
      hint: "Use `path` from a stellarOrg.search_site hit. Full URLs, query strings, percent-encoded characters, and /api paths are refused."
    });
  }
  let path = requested;
  const deadline = Date.now() + OPERATION_BUDGET_MS;
  for (let hop = 0; ; hop += 1) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      return errResult({ service: SERVICE, kind: "error", message: `${requested} did not load within ${OPERATION_BUDGET_MS / 1000} s` });
    }
    const res = await get(`${STELLAR_ORG_ORIGIN}${path}`, "text/html", fetchImpl, Math.min(REQUEST_TIMEOUT_MS, remaining));
    if (res.status >= 300 && res.status < 400) {
      await res.body?.cancel();
      const location = res.headers.get("location");
      let target: URL | null = null;
      try {
        target = location ? new URL(location, `${STELLAR_ORG_ORIGIN}${path}`) : null;
      } catch {
        target = null;
      }
      if (!target) {
        return errResult({
          service: SERVICE,
          kind: "error",
          status: res.status,
          message: `${path} redirects with ${location ? "an unparsable" : "no"} Location header`
        });
      }
      if (target.origin !== STELLAR_ORG_ORIGIN) {
        return errResult({
          service: SERVICE,
          kind: "error",
          status: res.status,
          message: `${path} redirects off stellar.org to ${target.origin}${target.pathname}; it is not a stellar.org page`,
          hint: "Read the target with the source that owns that site."
        });
      }
      const next = target.search ? null : normalizeSitePath(target.pathname);
      if (!next) {
        return errResult({
          service: SERVICE,
          kind: "error",
          status: res.status,
          message: `${path} redirects to ${target.pathname}${target.search}, a stellar.org URL this tool does not read (query string, /api, or an unsafe path)`
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
    if (!text) {
      return errResult({
        service: SERVICE,
        kind: "soft-empty",
        message: `${path} rendered no server-side text.`,
        hint: "The page may load its content in the browser. This is not evidence the topic is absent."
      });
    }
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
