/**
 * Stellar Docs adapter — Mintlify discovery API client
 * (docs/stellar-docs.md describes the contract).
 *
 * Each stellarDocs catalog entry carries its request mapping in
 * `transport.mintlify` (authored in specs/stellar-docs.json):
 *  - endpoint    — "search" (POST /discovery/v1/search/<domain>) or
 *                  "page" (POST /discovery/v1/page/<domain>).
 *  - include     — site-relative path prefixes a hit must start with
 *                  ({category} placeholders filled from args).
 *  - exclude     — path prefixes a hit must not start with.
 *  - conditional — "arg=value" → include/exclude overrides (null clears).
 *  - groupBy     — "page": one row per page, ranked by query words in the
 *                  page title and path (search_doc_titles).
 *
 * The search service has no facets, scores, or counts, and it always returns
 * its nearest sections. Path scoping therefore happens here over a fixed
 * candidate window, and a result whose kept sections contain no query term is
 * soft-empty. A soft-empty result never establishes corpus absence.
 */
import type { CatalogEntry } from "../catalog/types.ts";
import anchorIndex from "./stellar-docs-anchors.json";
import {
  errResult,
  okResult,
  caughtResult,
  type AdapterEnv,
  type AdapterResult,
  type FetchLike
} from "./types.ts";

const SERVICE = "stellarDocs";
const MAX_ERROR_BODY_CHARS = 1024;
const SNIPPET_CHARS = 300;
/** Wall-clock bound for one operation, across retries, the `/index` retry, and the site redirect probe. */
const OPERATION_BUDGET_MS = 24_000;
/** An attempt with less time left than this is not started. */
const MIN_ATTEMPT_MS = 500;
/**
 * The 404 bodies that mean "nothing here" (live, 2026-11-02). Any other 404 body — for example
 * `{"error":"No deployment related to <domain> exists"}` — is a configuration failure, not absence.
 */
const ABSENT_MESSAGES = new Set(["No results found", "Page not found"]);

type PathScope = { include?: string[] | null; exclude?: string[] | null };

type MintlifyMapping = PathScope & {
  endpoint: "search" | "page";
  conditional?: Record<string, PathScope>;
  groupBy?: "page";
};

type DocsTransport = {
  type?: string;
  apiKeyEnv?: string;
  apiBase?: string;
  searchPath?: string;
  pagePath?: string;
  siteOrigin?: string;
  candidateWindow?: number;
  attemptTimeoutsMs?: number[];
  mintlify?: MintlifyMapping;
};

type SearchChunk = { path?: unknown; content?: unknown; metadata?: { title?: unknown } | null };

type Section = { path: string; title: string; content: string; rank: number; isIndex: boolean };

type Attempt =
  | { kind: "success"; data: unknown }
  | { kind: "retryable"; cause: string }
  | { kind: "terminal"; status: number; message: string; absent: boolean };

type MintlifyResponse = { ok: true; body: unknown } | { ok: false; message: string; status?: number; absent?: boolean };

/** Small stopword set: words that carry no topic in a docs query. */
const STOPWORDS = new Set([
  "the", "and", "for", "with", "how", "what", "why", "when", "which", "who", "does", "doc", "docs",
  "are", "was", "were", "from", "that", "this", "these", "those", "into", "use", "using", "about",
  "can", "you", "your", "there", "their", "its", "not", "but", "has", "have", "any", "all", "out",
  "via", "between", "difference", "guide", "page", "example", "examples", "documentation"
]);

function errorMessageFromBody(bodyText: string, status: number): string {
  try {
    const body = JSON.parse(bodyText) as { message?: unknown; error?: unknown };
    for (const value of [body.message, body.error]) {
      if (typeof value === "string" && value.length > 0) return value.slice(0, MAX_ERROR_BODY_CHARS);
    }
  } catch {
    // Use the bounded response text below.
  }
  return bodyText.trim().slice(0, MAX_ERROR_BODY_CHARS) || `mintlify HTTP ${status}`;
}

function isAbsentBody(bodyText: string): boolean {
  try {
    const message = (JSON.parse(bodyText) as { message?: unknown }).message;
    return typeof message === "string" && ABSENT_MESSAGES.has(message);
  } catch {
    return false;
  }
}

async function attempt(
  url: string,
  apiKey: string,
  body: Record<string, unknown>,
  timeoutMs: number,
  fetchImpl: FetchLike
): Promise<Attempt> {
  try {
    const res = await fetchImpl(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs)
    });
    const bodyText = await res.text();
    if (res.status >= 500) return { kind: "retryable", cause: errorMessageFromBody(bodyText, res.status) };
    if (!res.ok) {
      return {
        kind: "terminal",
        status: res.status,
        message: errorMessageFromBody(bodyText, res.status),
        absent: res.status === 404 && isAbsentBody(bodyText)
      };
    }
    try {
      return { kind: "success", data: JSON.parse(bodyText) };
    } catch {
      return {
        kind: "terminal",
        status: res.status,
        message: `mintlify HTTP ${res.status} returned malformed JSON: ${bodyText.slice(0, MAX_ERROR_BODY_CHARS)}`,
        absent: false
      };
    }
  } catch (e) {
    return { kind: "retryable", cause: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * One host: try each configured attempt timeout in order, each clipped to the operation deadline;
 * retry only network, timeout, and 5xx failures.
 */
async function mintlifyRequest(
  url: string,
  apiKey: string,
  body: Record<string, unknown>,
  timeouts: number[],
  deadline: number,
  fetchImpl: FetchLike
): Promise<MintlifyResponse> {
  let lastError = "no attempts configured";
  let attempts = 0;
  for (const timeoutMs of timeouts) {
    const remaining = deadline - Date.now();
    if (remaining < MIN_ATTEMPT_MS) {
      lastError = `operation deadline of ${OPERATION_BUDGET_MS} ms reached`;
      break;
    }
    attempts += 1;
    const result = await attempt(url, apiKey, body, Math.min(timeoutMs, remaining), fetchImpl);
    if (result.kind === "success") return { ok: true, body: result.data };
    if (result.kind === "terminal") return { ok: false, message: result.message, status: result.status, absent: result.absent };
    lastError = result.cause;
  }
  return {
    ok: false,
    message: attempts === 0 ? `mintlify request not started: ${lastError}` : `mintlify request failed after ${attempts} attempts: ${lastError}`
  };
}

/**
 * The live site redirects moved pages; the page store does not. Ask the site once, without
 * following, and return the same-origin docs or meetings path it redirects to.
 */
async function siteRedirectPath(siteOrigin: string, path: string, timeoutMs: number, fetchImpl: FetchLike): Promise<string | null> {
  if (timeoutMs < MIN_ATTEMPT_MS) return null;
  try {
    const res = await fetchImpl(`${siteOrigin}/${path}`, { method: "GET", redirect: "manual", signal: AbortSignal.timeout(timeoutMs) });
    await res.body?.cancel();
    if (res.status < 300 || res.status >= 400) return null;
    const location = res.headers.get("location");
    if (!location) return null;
    const target = new URL(location, `${siteOrigin}/${path}`);
    if (target.origin !== new URL(siteOrigin).origin || !/^\/(docs|meetings)\//.test(target.pathname)) return null;
    const next = normalizePagePath(target.pathname);
    return next && next !== path ? next : null;
  } catch {
    return null;
  }
}

/** Lowercase, punctuation-to-space form used for term matching. */
function normalizeText(text: string): string {
  return ` ${text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `;
}

/**
 * Topic terms of a query: words of 3+ characters (or any word with a digit),
 * minus stopwords. Hyphenated and snake_case identifiers stay whole as well as
 * split, so "SEP-10" matches "SEP-10" and "SEP 10".
 */
export function queryTerms(query: string): string[] {
  const terms = new Set<string>();
  for (const raw of query.split(/\s+/)) {
    const word = raw.replace(/^[^A-Za-z0-9_]+|[^A-Za-z0-9_]+$/g, "");
    if (!word) continue;
    const parts = normalizeText(word).trim().split(" ").filter(Boolean);
    const joined = parts.join(" ");
    const candidates = parts.length > 1 ? [joined, ...parts] : parts;
    for (const part of candidates) {
      if (STOPWORDS.has(part)) continue;
      if (part.length >= 3 || /\d/.test(part)) terms.add(part);
    }
  }
  return [...terms];
}

function containsTerm(haystack: string, term: string): boolean {
  return haystack.includes(` ${term}`);
}

function isIndexPath(path: string): boolean {
  return /(^|\/)index$/.test(path.replace(/\/+$/, ""));
}

/** Relative links in an index page resolve against its directory. */
function linkBase(url: string, isIndex: boolean): string {
  return isIndex ? `${url}/` : url;
}

/** Site-relative canonical path: leading slash, no trailing `/index` (the site serves both forms). */
function siteRelative(path: string): string {
  return `/${path.replace(/^\/+/, "")}`.replace(/\/index$/, "") || "/";
}

function fillPlaceholders(template: string, args: Record<string, unknown>): string {
  return template.replace(/\{([^}]+)\}/g, (_m, name: string) => String(args[name] ?? ""));
}

/** Drop Mintlify's code-fence theme metadata and make relative Markdown links absolute. */
export function cleanContent(content: string, pageUrl: string, siteOrigin: string): string {
  const unthemed = content.replace(/^([ \t]*```[^\s`]*)[ \t]+theme=\{.*\}[ \t]*$/gm, "$1");
  return unthemed.replace(/\]\(([^)\s]+)\)/g, (match, target: string) => {
    if (/^(?:[a-z][a-z0-9+.-]*:|#)/i.test(target)) return match;
    try {
      const base = target.startsWith("/") ? siteOrigin : pageUrl;
      const resolved = new URL(target, base);
      resolved.pathname = resolved.pathname.replace(/\.mdx?$/, "").replace(/\/index$/, "");
      return `](${resolved.toString()})`;
    } catch {
      return match;
    }
  });
}

/**
 * Text of an ATX heading line of at most `maxLevel`, or undefined. The pattern is anchored and
 * never spans a newline, and the closing sequence is stripped without a regex, so long whitespace
 * runs cost linear time. A closing sequence needs a space before it: `## Using C#` keeps its `#`.
 */
function atxHeading(line: string, maxLevel: number): string | undefined {
  const open = /^[ \t]*(#+)[ \t]/.exec(line);
  if (!open || open[1]!.length > maxLevel) return undefined;
  let text = line.slice(open[0].length).trim();
  let end = text.length;
  while (end > 0 && text[end - 1] === "#") end -= 1;
  if (end === 0 && text.length > 0) return undefined;
  if (end < text.length && /[ \t]/.test(text[end - 1]!)) text = text.slice(0, end).trimEnd();
  return text || undefined;
}

function firstLine(text: string): string {
  const trimmed = text.trimStart();
  const newline = trimmed.indexOf("\n");
  return newline < 0 ? trimmed : trimmed.slice(0, newline);
}

function firstHeading(content: string): string | undefined {
  return atxHeading(firstLine(content), 6);
}

/** A section alone cannot disambiguate repeated headings or predict custom IDs. */
export function sectionAnchor(path: string, heading: string): string | undefined {
  const pages = anchorIndex.pages as Record<string, Record<string, string[]>>;
  if (!Object.hasOwn(pages, path)) return undefined;
  const page = pages[path]!;
  const text = heading.replace(/`([^`]+)`/g, "$1").replace(/\u200b/g, "").trim();
  if (!Object.hasOwn(page, text)) return undefined;
  const ids = page[text]!;
  return ids.length === 1 ? ids[0] : undefined;
}

/** The first H1 anywhere in a page. */
function pageTitle(content: string): string | undefined {
  for (const line of content.split("\n")) {
    const title = atxHeading(line, 1);
    if (title) return title;
  }
  return undefined;
}

/** MDX component tags (`<Tab title="x">`, `</CodeGroup>`) shrink to their attribute values. */
const MDX_TAG = /<\/?[A-Z][A-Za-z0-9.]*((?:\s+[A-Za-z_:][\w:.-]*(?:=(?:"[^"]*"|'[^']*'|\{[^}]*\}))?)*)\s*\/?>/g;

/** Shrink MDX tags outside fenced code only, so `Vec<Val>` in a code block stays intact. */
function shrinkMdxTags(text: string): string {
  return text
    .split(/(```[\s\S]*?(?:```|$))/)
    .map((part, index) =>
      index % 2 === 1
        ? part
        : part.replace(MDX_TAG, (_tag, attrs: string) => {
            const values = [...attrs.matchAll(/=(?:"([^"]*)"|'([^']*)')/g)].map((m) => m[1] ?? m[2]).filter(Boolean);
            return values.length > 0 ? ` ${values.join(" ")} ` : " ";
          })
    )
    .join("");
}

/** A window of the section text centered on the first query term it contains. */
function snippetOf(content: string, terms: string[]): string {
  const trimmed = content.trimStart();
  const head = firstLine(trimmed);
  const body = shrinkMdxTags(atxHeading(head, 6) ? trimmed.slice(head.length) : trimmed)
    .replace(/```[^\n]*\n/g, "")
    .replace(/```/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (body.length <= SNIPPET_CHARS) return body;
  const lower = body.toLowerCase();
  let at = -1;
  for (const term of terms) {
    const index = lower.indexOf(term.split(" ")[0]!);
    if (index >= 0 && (at < 0 || index < at)) at = index;
  }
  const start = at < 0 ? 0 : Math.max(0, at - Math.floor(SNIPPET_CHARS / 3));
  const end = Math.min(body.length, start + SNIPPET_CHARS);
  return `${start > 0 ? "…" : ""}${body.slice(start, end).trim()}${end < body.length ? "…" : ""}`;
}

/** Prefix match on whole path segments: `/docs/tokens` keeps `/docs/tokens/x`, not `/docs/tokens-legacy`. */
function underPrefix(path: string, prefix: string): boolean {
  const base = prefix.replace(/\/+$/, "");
  return path === base || path.startsWith(`${base}/`);
}

function matchesScope(path: string, include: string[] | null, exclude: string[] | null): boolean {
  if (exclude?.some((prefix) => underPrefix(path, prefix))) return false;
  if (include && include.length > 0) return include.some((prefix) => underPrefix(path, prefix));
  return true;
}

function resolveScope(mapping: MintlifyMapping, args: Record<string, unknown>) {
  let include = mapping.include ?? null;
  let exclude = mapping.exclude ?? null;
  for (const [condition, overrides] of Object.entries(mapping.conditional ?? {})) {
    const eq = condition.indexOf("=");
    if (eq < 0 || String(args[condition.slice(0, eq)]) !== condition.slice(eq + 1)) continue;
    if ("include" in overrides) include = overrides.include ?? null;
    if ("exclude" in overrides) exclude = overrides.exclude ?? null;
  }
  return {
    include: include?.map((prefix) => fillPlaceholders(prefix, args)) ?? null,
    exclude: exclude?.map((prefix) => fillPlaceholders(prefix, args)) ?? null
  };
}

function sectionsOf(body: unknown): Section[] | null {
  if (!Array.isArray(body)) return null;
  const sections: Section[] = [];
  for (const [rank, chunk] of (body as SearchChunk[]).entries()) {
    if (!chunk || typeof chunk.path !== "string" || typeof chunk.content !== "string") return null;
    const title = typeof chunk.metadata?.title === "string" ? chunk.metadata.title : "";
    sections.push({ path: siteRelative(chunk.path), title, content: chunk.content, rank, isIndex: isIndexPath(chunk.path) });
  }
  return sections;
}

/** Rank distinct pages: query words in the title, then in the path, then search rank. */
function groupPages(sections: Section[], terms: string[]): Section[] {
  const byPath = new Map<string, Section>();
  for (const section of sections) if (!byPath.has(section.path)) byPath.set(section.path, section);
  const score = (section: Section) => {
    const title = normalizeText(section.title);
    const path = normalizeText(section.path);
    return terms.reduce(
      (total, term) => total + (containsTerm(title, term) ? 2 : 0) + (containsTerm(path, term) ? 1 : 0),
      0
    );
  };
  return [...byPath.values()]
    .map((section) => ({ section, score: score(section) }))
    .sort((a, b) => b.score - a.score || a.section.rank - b.section.rank)
    .map(({ section }) => section);
}

function normalizePagePath(raw: string): string {
  return raw
    .replace(/^https?:\/\/[^/]+/, "")
    .replace(/[#?].*$/, "")
    .replace(/\/+$/, "")
    .replace(/\.mdx?$/, "")
    .replace(/^\/+/, "");
}

export async function callStellarDocs(
  entry: CatalogEntry,
  args: Record<string, unknown>,
  env: AdapterEnv,
  fetchImpl: FetchLike = fetch
): Promise<AdapterResult> {
  const transport = (entry.transport ?? {}) as DocsTransport;
  const mapping = transport.mintlify;
  if (
    transport.type !== "mintlify" ||
    !mapping ||
    !transport.apiBase ||
    !transport.searchPath ||
    !transport.pagePath ||
    !transport.siteOrigin
  ) {
    return errResult({
      service: SERVICE,
      kind: "error",
      message: `catalog entry ${entry.id} has no mintlify transport mapping — cannot call it`
    });
  }

  const apiKeyEnvName = transport.apiKeyEnv as keyof AdapterEnv | undefined;
  const apiKey = apiKeyEnvName ? env[apiKeyEnvName] : undefined;
  if (!apiKey) {
    return errResult({
      service: SERVICE,
      kind: "error",
      message: `${transport.apiKeyEnv ?? "apiKeyEnv"} is not configured on the host — docs search is unavailable`
    });
  }
  const timeouts = transport.attemptTimeoutsMs?.length ? transport.attemptTimeoutsMs : [8000, 12000];
  const siteOrigin = transport.siteOrigin;
  const deadline = Date.now() + OPERATION_BUDGET_MS;

  try {
    if (mapping.endpoint === "page") {
      const path = normalizePagePath(String(args.path ?? ""));
      const pageUrl = `${transport.apiBase}${transport.pagePath}`;
      const fetchPage = async (pagePath: string) => {
        const first = await mintlifyRequest(pageUrl, apiKey, { path: pagePath }, timeouts, deadline, fetchImpl);
        // Index pages exist only as `<dir>/index` in the page store.
        if (!first.ok && first.absent && !pagePath.endsWith("/index")) {
          return mintlifyRequest(pageUrl, apiKey, { path: `${pagePath}/index` }, timeouts, deadline, fetchImpl);
        }
        return first;
      };
      let res = await fetchPage(path);
      if (!res.ok && res.absent) {
        const moved = await siteRedirectPath(siteOrigin, path, Math.min(timeouts[0]!, deadline - Date.now()), fetchImpl);
        if (moved) res = await fetchPage(moved);
      }
      if (!res.ok) {
        if (res.absent) {
          return errResult({
            service: SERVICE,
            kind: "soft-empty",
            message: `No docs page exists at /${path}. Use \`path\` from a search hit.`,
            status: 404,
            hint: "Search with stellarDocs.search_doc_titles or stellarDocs.search_docs to find the page path. A missing path does not mean the topic is undocumented."
          });
        }
        return errResult({ service: SERVICE, kind: "error", message: res.message, ...(res.status !== undefined ? { status: res.status } : {}) });
      }
      const page = res.body as { path?: unknown; content?: unknown } | null;
      if (!page || typeof page.content !== "string") {
        return errResult({ service: SERVICE, kind: "error", message: "Mintlify page response has no content" });
      }
      const rawPath = typeof page.path === "string" ? page.path : path;
      const relative = siteRelative(rawPath);
      const url = `${siteOrigin}${relative}`;
      const title = pageTitle(page.content) ?? relative.split("/").at(-1) ?? relative;
      return okResult({ url, path: relative, title, content: cleanContent(page.content, linkBase(url, isIndexPath(rawPath)), siteOrigin) });
    }

    const query = String(args.query ?? "");
    const requested = typeof args.hitsPerPage === "number" ? args.hitsPerPage : 5;
    const res = await mintlifyRequest(
      `${transport.apiBase}${transport.searchPath}`,
      apiKey,
      { query, pageSize: transport.candidateWindow ?? 50 },
      timeouts,
      deadline,
      fetchImpl
    );
    if (!res.ok && !res.absent) {
      return errResult({ service: SERVICE, kind: "error", message: res.message, ...(res.status !== undefined ? { status: res.status } : {}) });
    }
    const sections = res.ok ? sectionsOf(res.body) : [];
    if (!sections) {
      return errResult({ service: SERVICE, kind: "error", message: "Mintlify search response is not an array of sections" });
    }

    const { include, exclude } = resolveScope(mapping, args);
    const pathFiltered = Boolean(include && include.length > 0);
    const scoped = sections.filter((section) => matchesScope(section.path, include, exclude));
    const terms = queryTerms(query);
    const termMatched = (section: Section) =>
      terms.some((term) => containsTerm(normalizeText(`${section.title} ${section.path} ${section.content}`), term));

    if (sections.length === 0) {
      return errResult({
        service: SERVICE,
        kind: "soft-empty",
        message: "The docs search returned no sections for this query.",
        status: res.ok ? 200 : 404,
        hint: "Rephrase with the terms the docs would use. An empty search result does not prove the docs lack the topic."
      });
    }
    if (scoped.length === 0 || (terms.length > 0 && !scoped.some(termMatched))) {
      const windowOnly = scoped.length === 0;
      return errResult({
        service: SERVICE,
        kind: "soft-empty",
        message: windowOnly
          ? `None of the ${sections.length} candidate sections the docs search returned is under this operation's paths.`
          : `None of the ${scoped.length} candidate sections the docs search returned contains a query term (${terms.join(", ")}).`,
        status: 200,
        hint: windowOnly
          ? "Broaden once with stellarDocs.search_docs. This is a candidate-window result, not evidence that the docs lack the topic."
          : "The docs search returns nearest sections even for unmatched topics. Rephrase with the terms the docs would use, or corroborate an ecosystem identity or history question with a broad Lumenloop or Scout family."
      });
    }

    const ordered = mapping.groupBy === "page" ? groupPages(scoped, terms) : scoped;
    const hits = ordered.slice(0, requested).map((section) => {
      const url = `${siteOrigin}${section.path}`;
      const content = cleanContent(section.content, linkBase(url, section.isIndex), siteOrigin);
      const heading = firstHeading(content);
      const anchor = heading && !atxHeading(firstLine(content), 1) ? sectionAnchor(section.path, heading) : undefined;
      return {
        url: anchor ? `${url}#${encodeURIComponent(anchor)}` : url,
        path: section.path,
        title: section.title || section.path.split("/").at(-1) || section.path,
        ...(heading ? { section: heading } : {}),
        snippet: snippetOf(content, terms),
        ...(args.includeContent === true && mapping.groupBy !== "page" ? { content } : {})
      };
    });

    return okResult({
      hits,
      candidates: sections.length,
      ...(pathFiltered ? { pathFiltered: true } : {})
    });
  } catch (e) {
    return caughtResult(SERVICE, e);
  }
}
