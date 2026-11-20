/**
 * stellar.org adapter against one fixed origin (never read from the manifest).
 * `search` queries `/api/search` (dropping `/blog`, `/press`, `/events` and non-audit externals);
 * `page` extracts `<main>` text from server-rendered HTML, following bounded same-origin redirects.
 */
import type { CatalogEntry } from "../catalog/types.ts";
import { errResult, okResult, caughtResult, OPERATION_BUDGET_MS, type AdapterResult, type FetchLike } from "./types.ts";

const SERVICE = "stellarOrg";
export const STELLAR_ORG_ORIGIN = "https://stellar.org";
const SEARCH_PATH = "/api/search";
export const USER_AGENT = "RavenMCP/1.0";
const REQUEST_TIMEOUT_MS = 12_000;
const MAX_SEARCH_BYTES = 256_000;
const MAX_DESCRIPTION_CHARS = 500;
const MAX_TITLE_CHARS = 300;
const MAX_TAGS = 10;
const MAX_TAG_CHARS = 200;
/** The part of an upstream header an error message shows. */
const MAX_ECHO_CHARS = 200;
const MAX_ERROR_BODY_CHARS = 512;
/** Oversized pages are refused rather than truncated. */
export const MAX_PAGE_BYTES = 2_000_000;
export const MAX_CONTENT_CHARS = 40_000;
const MAX_REDIRECTS = 3;
const MAX_SEARCH_LIMIT = 10;
/** Path prefixes owned by Scout and Lumenloop. */
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

/** `value` cut to at most `max` characters, ending with `…` when it was cut. */
function clip(value: string, max: number): string {
  if (value.length <= max) return value;
  const cut = value.slice(0, max - 1);
  return `${/[\ud800-\udbff]$/.test(cut) ? cut.slice(0, -1) : cut}…`;
}

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
  if (underPrefix(trimmed.toLowerCase(), "/api")) return null;
  return trimmed;
}

function text(value: unknown, max: number): string | null {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}

function stringTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const tags = value.filter((tag): tag is string => typeof tag === "string" && tag !== "");
  return tags.slice(0, MAX_TAGS).map((tag) => clip(tag, MAX_TAG_CHARS));
}

/** "Project - Firm", split before any clipping; the site writes "Unnamed record" when the register has no project. */
function auditHit(title: string, rawUrl: unknown): AuditHit | null {
  if (typeof rawUrl !== "string") return null;
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  // Userinfo can disguise the host (`https://stellar.org@evil.com/`). The cap
  // applies after normalization, which percent-encodes and can grow the string.
  if (url.username || url.password || url.href.length > MAX_REPORT_URL_CHARS) return null;
  const cut = title.lastIndexOf(" -");
  const project = cut >= 0 ? title.slice(0, cut).trim() : title;
  const firm = cut >= 0 ? title.slice(cut + 2).trim() : "";
  return {
    kind: "audit",
    title: clip(title, MAX_TITLE_CHARS),
    project: project && project !== "Unnamed record" ? clip(project, MAX_TITLE_CHARS) : null,
    firm: firm ? clip(firm, MAX_TITLE_CHARS) : null,
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
    const fullTitle = row.title.trim();
    const description = text(row.description, MAX_DESCRIPTION_CHARS);
    const kind = typeof row.kind === "string" ? row.kind : "page";
    if (kind === "audit") {
      const hit = auditHit(fullTitle, row.url);
      if (hit) hits.push(hit);
      continue;
    }
    const title = clip(fullTitle, MAX_TITLE_CHARS);
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
        if (category && seen.tags.length < MAX_TAGS && !seen.tags.includes(category)) seen.tags.push(category);
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

/** Elements whose content is never page text; their start tag is a bounded region, not markup. */
const RAW_TEXT = new Set(["script", "style", "noscript", "iframe", "title"]);
/** Skipped elements that nest: only a tag of the same name changes the depth. */
const NESTED = new Set(["svg", "template", "head"]);
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
const END_TAG_RES = new Map(Array.from(RAW_TEXT, (name) => [name, new RegExp(`</${name}(?![\\w-])`, "gi")]));

/** A tag outside every skipped region, or one skipped element as a unit (`skipped`, `body` for raw text with an end tag). */
type Tag = { name: string; closing: boolean; index: number; end: number; skipped?: true; body?: string };

/**
 * The tags of an HTML string, one linear pass. A `script`, `style`, `noscript`,
 * `iframe` or `title` start tag (a trailing `/` ignored) skips to its end tag,
 * parsing nothing in between; with no end tag the rest is skipped and the scan
 * stops. Comments come back as unnamed tags. `svg`, `template` and (unless `intoHead`) `head` skip as nested units;
 * anywhere inside an `svg` (even one in a skipped `template`) raw text is not
 * special, while inside the others it is still skipped. The end tag is found in two steps, `</name` then the next `>`, and
 * a failed step ends the scan, so no candidate is searched for twice.
 */
function* scan(html: string, intoHead = false): Generator<Tag> {
  const re = new RegExp(TAG_RE.source, "g");
  let skipping: string | null = null;
  let depth = 0;
  let from = 0;
  let svgDepth = 0;
  for (let match = re.exec(html); match; match = re.exec(html)) {
    const name = (match[2] ?? "").toLowerCase();
    const closing = match[1] === "/";
    const selfClosing = match[0].endsWith("/>");
    const open = match.index + match[0].length;
    if (!name) {
      // A comment: yielded unnamed so htmlToText drops it.
      if (!skipping) yield { name, closing, index: match.index, end: open };
      continue;
    }
    // Inside any svg, `script`, `style` and `title` are ordinary tags and `/>` closes them.
    if (name === "svg" && !selfClosing) svgDepth = Math.max(0, svgDepth + (closing ? -1 : 1));
    if (RAW_TEXT.has(name) && !closing && svgDepth === 0) {
      const endTag = END_TAG_RES.get(name)!;
      endTag.lastIndex = open;
      const close = endTag.exec(html)?.index ?? -1;
      const gt = close < 0 ? -1 : html.indexOf(">", close);
      const end = gt < 0 ? html.length : gt + 1;
      if (!skipping) yield { name, closing, index: match.index, end, skipped: true, ...(gt < 0 ? {} : { body: html.slice(open, close) }) };
      if (gt < 0) break;
      re.lastIndex = end;
      continue;
    }
    if (skipping) {
      if (name === skipping && !selfClosing) depth += closing ? -1 : 1;
      if (depth === 0) {
        yield { name: skipping, closing: false, index: from, end: open, skipped: true };
        skipping = null;
      }
      continue;
    }
    if (NESTED.has(name) && !(intoHead && name === "head") && !closing && !selfClosing) {
      skipping = name;
      depth = 1;
      from = match.index;
      continue;
    }
    yield { name, closing, index: match.index, end: open };
  }
  if (skipping) yield { name: skipping, closing: false, index: from, end: html.length, skipped: true };
}

/**
 * Readable text of an HTML fragment: headings become `#` lines, list items
 * become `- ` lines, block elements break lines, everything else is text.
 * One linear pass over the tags; skipped elements drop their content.
 */
export function htmlToText(html: string): string {
  const out: string[] = [];
  let last = 0;
  for (const tag of scan(html)) {
    out.push(html.slice(last, tag.index));
    last = tag.end;
    if (tag.skipped) continue;
    const { name, closing } = tag;
    const heading = /^h([1-6])$/.exec(name);
    if (heading) out.push(closing ? "\n\n" : `\n\n${"#".repeat(Number(heading[1]))} `);
    else if (name === "li") out.push(closing ? "\n" : "\n- ");
    else if (BLOCKS.has(name)) out.push("\n");
    else if (name === "td" || name === "th") out.push(" ");
  }
  out.push(html.slice(last));
  const lines = decodeEntities(out.join(""))
    .split("\n")
    .map((line) => line.replace(/[ \t\r\f\v\u00a0]+/g, " ").trim());
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
  let mainStart = -1;
  let mainDepth = 0;
  for (const tag of scan(html)) {
    if (tag.skipped || tag.name !== "main") continue;
    if (!tag.closing) {
      if (mainStart < 0) mainStart = tag.end;
      if (mainDepth >= 0) mainDepth += 1;
    } else if (mainDepth > 0) {
      mainDepth -= 1;
      if (mainDepth === 0) return html.slice(mainStart, tag.index);
    }
  }
  return mainStart >= 0 ? html.slice(mainStart) : "";
}

/** The first terminated `<title>` outside comments, scripts, `svg` and `template`; `head` is entered. */
function documentTitle(html: string): string | undefined {
  for (const tag of scan(html, true)) {
    if (!tag.skipped || tag.name !== "title") continue;
    const title = tag.body === undefined ? "" : clip(decodeEntities(tag.body).replace(/\s+/g, " ").trim(), MAX_TITLE_CHARS);
    return title || undefined;
  }
  return undefined;
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
  if (body.results.length === 0) {
    // The site search sometimes returns no rows for a valid query, so an empty list is not a
    // closed-world "no rows": it is inconclusive.
    return errResult({
      service: SERVICE,
      kind: "soft-empty",
      message: "stellar.org site search returned no rows for this query.",
      hint: "The site search sometimes returns no rows for a valid query. Retry once or use another family; this is not evidence that SDF has no page on the topic."
    });
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
          message: `${path} redirects off stellar.org to ${clip(`${target.origin}${target.pathname}`, MAX_ECHO_CHARS)}; it is not a stellar.org page`,
          hint: "Read the target with the source that owns that site."
        });
      }
      const next = target.search ? null : normalizeSitePath(target.pathname);
      if (!next) {
        return errResult({
          service: SERVICE,
          kind: "error",
          status: res.status,
          message: `${path} redirects to ${clip(`${target.pathname}${target.search}`, MAX_ECHO_CHARS)}, a stellar.org URL this tool does not read (query string, /api, or an unsafe path)`
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
      return errResult({ service: SERVICE, kind: "error", message: `${path} is not an HTML page (${clip(contentType, MAX_ECHO_CHARS) || "no content type"})` });
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
