/**
 * Stellar Docs adapter — hand-rolled Algolia REST client
 * (research/services/stellar-docs-algolia.md: ~50-line fetch core, 4 hosts,
 * escalating timeout, retry on network/5xx ONLY — never 4xx, never 429).
 *
 * Each stellarDocs catalog entry carries its execute mapping in
 * `transport.algolia` (authored in specs/stellar-docs.json):
 *  - paramMap           — model arg → Algolia param (exact names).
 *  - fixedParams        — op-pinned params (facetFilters, overfetch, …).
 *  - conditionalParams  — "arg=value" → param overrides (null deletes);
 *    may also disable the clientFilter (category=meetings).
 *  - clientFilter       — hierarchy.lvl0 is NOT facetable, so category ops
 *    overfetch (hitsPerPage 100) and keep hits whose url_without_anchor
 *    matches a URL prefix (placeholders {category}/{path} filled from args).
 *  - derivedQuery       — get_doc_page_sections has no query arg: the query
 *    is derived from the path's last segment (hyphens split), with a
 *    two-segment fallback when the page yields no records.
 *
 * `analytics:false` rides in baseParams on every entry (polite-tenant rule).
 * Zero hits after filtering → kind "soft-empty" ("not in the docs corpus" is
 * a meaningful signal on this index, per the research doc).
 */
import type { CatalogEntry } from "../catalog/types.ts";
import {
  errResult,
  okResult,
  caughtResult,
  type AdapterEnv,
  type AdapterResult,
  type FetchLike
} from "./types.ts";

const SERVICE = "stellarDocs";

type AlgoliaHit = {
  url?: string;
  url_without_anchor?: string;
  anchor?: string;
  type?: string;
  hierarchy?: Record<string, string | null>;
  content?: string;
  weight?: { position?: number };
  _snippetResult?: { content?: { value?: string } };
  [k: string]: unknown;
};

type AlgoliaResponse = {
  hits: AlgoliaHit[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
  exhaustive?: { nbHits?: boolean };
  exhaustiveNbHits?: boolean;
  processingTimeMS?: number;
  message?: string;
  status?: number;
};

type ClientFilter = {
  field: string;
  prefixesAnyOf?: string[];
  equals?: string;
};

type AlgoliaMapping = {
  paramMap?: Record<string, string>;
  fixedParams?: Record<string, unknown>;
  conditionalParams?: Record<string, Record<string, unknown>>;
  clientFilter?: ClientFilter | null;
  derivedQuery?: string;
  fallback?: string;
};

type DocsTransport = {
  index?: string;
  hosts?: string[];
  applicationIdEnv?: string;
  apiKeyEnv?: string;
  baseParams?: Record<string, unknown>;
  algolia?: AlgoliaMapping;
};

type AlgoliaAttempt =
  | { kind: "success"; data: unknown }
  | { kind: "retryable"; cause: string }
  | { kind: "terminal"; status: number; bodyText: string };

const MAX_ERROR_BODY_CHARS = 1024;

/** Fill `{name}` placeholders from args (category prefixes, page path). */
function fillPlaceholders(template: string, args: Record<string, unknown>): string {
  return template.replace(/\{([^}]+)\}/g, (_m, name: string) => String(args[name] ?? ""));
}

function errorMessageFromBody(bodyText: string, status: number): string {
  try {
    const body = JSON.parse(bodyText) as { message?: unknown };
    if (typeof body.message === "string" && body.message.length > 0) {
      return body.message.slice(0, MAX_ERROR_BODY_CHARS);
    }
  } catch {
    // Use the bounded response text below.
  }
  return bodyText.trim() || `algolia HTTP ${status}`;
}

async function classifyAlgoliaAttempt(
  url: string,
  headers: Record<string, string>,
  params: Record<string, unknown>,
  timeoutMs: number,
  fetchImpl: FetchLike
): Promise<AlgoliaAttempt> {
  try {
    const res = await fetchImpl(url, {
      method: "POST",
      headers,
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(timeoutMs)
    });

    if (res.status >= 500) {
      const bodyText = (await res.text().catch(() => "")).slice(0, MAX_ERROR_BODY_CHARS);
      return { kind: "retryable", cause: errorMessageFromBody(bodyText, res.status) };
    }

    if (!res.ok) {
      const bodyText = (await res.text().catch(() => "")).slice(0, MAX_ERROR_BODY_CHARS);
      return { kind: "terminal", status: res.status, bodyText };
    }

    let bodyText: string;
    try {
      bodyText = await res.text();
    } catch (e) {
      return { kind: "retryable", cause: e instanceof Error ? e.message : String(e) };
    }

    try {
      return { kind: "success", data: JSON.parse(bodyText) };
    } catch {
      return {
        kind: "terminal",
        status: res.status,
        bodyText: bodyText.slice(0, MAX_ERROR_BODY_CHARS)
      };
    }
  } catch (e) {
    return { kind: "retryable", cause: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Raw Algolia query with the documented retry ladder: try each host in order,
 * timeout 2s x attempt-number, retry ONLY on network error / HTTP 5xx.
 * 4xx (and 429) surface immediately — they fail identically on every host.
 */
async function algoliaQuery(
  hosts: string[],
  index: string,
  headers: Record<string, string>,
  params: Record<string, unknown>,
  fetchImpl: FetchLike
): Promise<{ ok: true; body: AlgoliaResponse } | { ok: false; message: string; status?: number }> {
  const path = `/1/indexes/${encodeURIComponent(index)}/query`;
  let lastError = "no algolia hosts configured";
  for (let attempt = 0; attempt < hosts.length; attempt++) {
    const result = await classifyAlgoliaAttempt(
      `https://${hosts[attempt]}${path}`,
      headers,
      params,
      2000 * (attempt + 1),
      fetchImpl
    );
    if (result.kind === "success") {
      return { ok: true, body: result.data as AlgoliaResponse };
    }
    if (result.kind === "terminal") {
      const message =
        result.status >= 200 && result.status < 300
          ? `algolia HTTP ${result.status} returned malformed JSON${result.bodyText ? `: ${result.bodyText}` : ""}`
          : errorMessageFromBody(result.bodyText, result.status);
      return { ok: false, message, status: result.status };
    }
    lastError = result.cause;
  }
  return { ok: false, message: `all algolia hosts failed: ${lastError}` };
}

/** Flatten hierarchy lvl0..lvl6 into a " > " breadcrumb. */
function breadcrumb(hierarchy: Record<string, string | null> | undefined): string {
  if (!hierarchy) return "";
  const parts: string[] = [];
  for (let i = 0; i <= 6; i++) {
    const v = hierarchy[`lvl${i}`];
    if (typeof v === "string" && v.length > 0) parts.push(v);
  }
  return parts.join(" > ");
}

function shapeHit(hit: AlgoliaHit): Record<string, unknown> {
  const shaped: Record<string, unknown> = {
    url: hit.url,
    url_without_anchor: hit.url_without_anchor,
    anchor: hit.anchor,
    type: hit.type,
    breadcrumb: breadcrumb(hit.hierarchy)
  };
  const snippet = hit._snippetResult?.content?.value;
  if (snippet) shaped.snippet = snippet;
  if (typeof hit.content === "string") shaped.content = hit.content;
  return shaped;
}

function pageTitleOf(hit: AlgoliaHit): { attribute: string; title: string } | null {
  const hierarchy = hit.hierarchy;
  if (!hierarchy) return null;
  const levels = [1, 0, 2, 3, 4, 5, 6];
  for (const level of levels) {
    const title = hierarchy[`lvl${level}`];
    if (typeof title === "string" && title.length > 0) {
      return { attribute: `hierarchy.lvl${level}`, title };
    }
  }
  return null;
}

function sortAndDedupeSections(records: AlgoliaHit[]): AlgoliaHit[] {
  const byUrl = new Map<string, AlgoliaHit>();
  for (const record of records) {
    const key = typeof record.url === "string" ? record.url : String(record.anchor ?? "");
    if (!byUrl.has(key)) byUrl.set(key, record);
  }
  return [...byUrl.values()].sort(
    (a, b) => (a.weight?.position ?? 0) - (b.weight?.position ?? 0)
  );
}

/** Merge one conditionalParams override block; `null` deletes the param. */
function applyOverrides(
  params: Record<string, unknown>,
  overrides: Record<string, unknown>
): { clientFilterDisabled: boolean } {
  let clientFilterDisabled = false;
  for (const [k, v] of Object.entries(overrides)) {
    if (k === "clientFilter") {
      if (v === null) clientFilterDisabled = true;
      continue;
    }
    if (v === null) delete params[k];
    else params[k] = v;
  }
  return { clientFilterDisabled };
}

export async function callStellarDocs(
  entry: CatalogEntry,
  args: Record<string, unknown>,
  env: AdapterEnv,
  fetchImpl: FetchLike = fetch
): Promise<AdapterResult> {
  const transport = (entry.transport ?? {}) as DocsTransport;
  const mapping = transport.algolia;
  if (entry.transport?.type !== "algolia" || !mapping || !transport.index || !transport.hosts) {
    return errResult({
      service: SERVICE,
      kind: "error",
      message: `catalog entry ${entry.id} has no algolia transport mapping — cannot call it`
    });
  }

  // Env names come from the authored spec's transport (per-property pairs:
  // _DOCS for developers.stellar.org, _SITE for stellar.org). No generic
  // fallback — a transport that names no env vars is a build defect.
  const appIdEnvName = transport.applicationIdEnv as keyof AdapterEnv | undefined;
  const apiKeyEnvName = transport.apiKeyEnv as keyof AdapterEnv | undefined;
  const appId = appIdEnvName ? env[appIdEnvName] : undefined;
  const apiKey = apiKeyEnvName ? env[apiKeyEnvName] : undefined;
  if (!appId || !apiKey) {
    return errResult({
      service: SERVICE,
      kind: "error",
      message: `${transport.applicationIdEnv ?? "applicationIdEnv"} / ${transport.apiKeyEnv ?? "apiKeyEnv"} are not configured on the host — search is unavailable`
    });
  }

  const hosts = transport.hosts.map((h) => h.replace(`{${transport.applicationIdEnv}}`, appId));
  const headers = {
    "X-Algolia-Application-Id": appId,
    "X-Algolia-API-Key": apiKey,
    "Content-Type": "application/json"
  };

  // --- assemble params: baseParams → fixedParams → mapped args → conditionals
  const params: Record<string, unknown> = {
    ...(transport.baseParams ?? {}),
    ...(mapping.fixedParams ?? {})
  };
  for (const [argName, paramName] of Object.entries(mapping.paramMap ?? {})) {
    const v = args[argName];
    if (v !== undefined && v !== null) params[paramName] = v;
  }

  let clientFilter: ClientFilter | null = mapping.clientFilter ?? null;
  for (const [condition, overrides] of Object.entries(mapping.conditionalParams ?? {})) {
    const eq = condition.indexOf("=");
    if (eq < 0) continue;
    const argName = condition.slice(0, eq);
    const expected = condition.slice(eq + 1);
    if (String(args[argName]) !== expected) continue;
    const { clientFilterDisabled } = applyOverrides(params, overrides);
    if (clientFilterDisabled) clientFilter = null;
  }

  // --- get_doc_page_sections: derived query + exact-URL client filter
  const isPageSections = typeof mapping.derivedQuery === "string" && typeof args.path === "string";
  let derivedQueries: string[] = [];
  if (isPageSections) {
    const segments = String(args.path).split("/").filter(Boolean);
    const last = segments[segments.length - 1] ?? "";
    const lastTwo = segments.slice(-2).join(" ");
    const tokens = (s: string) => s.split(/[-_]/).filter(Boolean).join(" ");
    derivedQueries = [tokens(last)];
    const fb = tokens(lastTwo);
    if (fb !== derivedQueries[0]) derivedQueries.push(fb); // documented fallback
    // Sections are sorted by weight.position — make sure it's retrieved.
    const retrieve = params.attributesToRetrieve;
    if (Array.isArray(retrieve) && !retrieve.includes("weight")) {
      params.attributesToRetrieve = [...retrieve, "weight"];
    }
    if (args.includeContent === false && Array.isArray(params.attributesToRetrieve)) {
      params.attributesToRetrieve = (params.attributesToRetrieve as string[]).filter(
        (a) => a !== "content"
      );
    }
  }

  const requestedHits =
    typeof args.hitsPerPage === "number" ? args.hitsPerPage : 5; // schema default

  try {
    if (isPageSections) {
      const target = clientFilter?.equals
        ? fillPlaceholders(clientFilter.equals, args)
        : `https://developers.stellar.org${String(args.path)}`;
      const field = clientFilter?.field ?? "url_without_anchor";
      let usedFallback = false;
      for (let qi = 0; qi < derivedQueries.length; qi++) {
        const res = await algoliaQuery(
          hosts,
          transport.index,
          headers,
          { ...params, query: derivedQueries[qi] },
          fetchImpl
        );
        if (!res.ok) {
          return errResult({
            service: SERVICE,
            kind: "error",
            message: res.message,
            ...(res.status !== undefined ? { status: res.status } : {})
          });
        }
        const seedRecords = res.body.hits.filter((h) => h[field] === target);
        if (seedRecords.length > 0) {
          const pageTitle = pageTitleOf(seedRecords[0]!);
          if (!pageTitle) {
            const records = sortAndDedupeSections(seedRecords);
            return okResult({
              page: target,
              sections: records.map(shapeHit),
              nbSections: records.length,
              complete: false,
              truncated: true,
              truncationReason: "the index record has no hierarchy title for a complete page query",
              ...(usedFallback ? { usedFallbackQuery: derivedQueries[qi] } : {})
            });
          }

          const titleParams = {
            ...params,
            query: JSON.stringify(pageTitle.title),
            restrictSearchableAttributes: [pageTitle.attribute],
            removeWordsIfNoResults: "none",
            typoTolerance: false,
            queryType: "prefixNone",
            page: 0
          };
          const firstPage = await algoliaQuery(
            hosts,
            transport.index,
            headers,
            titleParams,
            fetchImpl
          );
          if (!firstPage.ok) {
            return errResult({
              service: SERVICE,
              kind: "error",
              message: firstPage.message,
              ...(firstPage.status !== undefined ? { status: firstPage.status } : {})
            });
          }

          const titleQueryRecords = [...firstPage.body.hits];
          const hitsPerPage = Math.max(1, firstPage.body.hitsPerPage);
          const maxPages = Math.ceil(1000 / hitsPerPage);
          const pagesToFetch = Math.min(firstPage.body.nbPages, maxPages);
          for (let page = 1; page < pagesToFetch; page++) {
            const nextPage = await algoliaQuery(
              hosts,
              transport.index,
              headers,
              { ...titleParams, page },
              fetchImpl
            );
            if (!nextPage.ok) {
              return errResult({
                service: SERVICE,
                kind: "error",
                message: nextPage.message,
                ...(nextPage.status !== undefined ? { status: nextPage.status } : {})
              });
            }
            titleQueryRecords.push(...nextPage.body.hits);
          }

          const exactRecords = titleQueryRecords.filter((hit) => hit[field] === target);
          const records = sortAndDedupeSections(exactRecords.length > 0 ? exactRecords : seedRecords);
          const truncated =
            firstPage.body.exhaustiveNbHits === false ||
            firstPage.body.exhaustive?.nbHits === false ||
            firstPage.body.nbPages > maxPages ||
            exactRecords.length === 0;
          return okResult({
            page: target,
            sections: records.map(shapeHit),
            nbSections: records.length,
            complete: !truncated,
            truncated,
            ...(truncated
              ? {
                  truncationReason:
                    exactRecords.length === 0
                      ? "the exact page-title query returned no target records"
                      : "the Algolia title query was not exhaustive within its pagination limit"
                }
              : {}),
            ...(usedFallback ? { usedFallbackQuery: derivedQueries[qi] } : {})
          });
        }
        usedFallback = true;
      }
      return errResult({
        service: SERVICE,
        kind: "soft-empty",
        message: `no indexed sections found for ${String(args.path)} — the path is not in the docs index (check url_without_anchor from a search hit; auto-generated API-reference pages are not indexed)`,
        hint:
          "This is a docs-index result only. For an open-world ecosystem identity or history question, corroborate with the broad Lumenloop or Scout families before drawing a wider negative conclusion."
      });
    }

    // --- ordinary search ops (with optional URL-prefix client filter)
    const res = await algoliaQuery(hosts, transport.index, headers, params, fetchImpl);
    if (!res.ok) {
      return errResult({
        service: SERVICE,
        kind: "error",
        message: res.message,
        ...(res.status !== undefined ? { status: res.status } : {})
      });
    }
    const body = res.body;

    let hits = body.hits;
    let clientFiltered = false;
    if (clientFilter?.prefixesAnyOf) {
      const prefixes = clientFilter.prefixesAnyOf.map((p) => fillPlaceholders(p, args));
      const field = clientFilter.field;
      hits = hits.filter((h) => {
        const v = h[field];
        return typeof v === "string" && prefixes.some((p) => v.startsWith(p));
      });
      clientFiltered = true;
    }
    if (clientFiltered) hits = hits.slice(0, requestedHits);

    if (hits.length === 0) {
      return errResult({
        service: SERVICE,
        kind: "soft-empty",
        message:
          body.nbHits === 0
            ? "zero hits — this topic is not in the docs corpus (zero is a reliable negative on this index)"
            : "the index matched pages, but none in this operation's docs category — try stellarDocs.search_docs for a corpus-wide search",
        status: 200,
        hint:
          body.nbHits === 0
            ? "Scope the negative to this docs index. For an open-world ecosystem identity or history question, corroborate with the broad Lumenloop or Scout families."
            : "Broaden once with stellarDocs.search_docs; if the question is about ecosystem identity or history rather than official technical wording, also consult a broad Lumenloop or Scout family."
      });
    }

    return okResult({
      hits: hits.map(shapeHit),
      nbHits: body.nbHits,
      nbPages: body.nbPages,
      page: body.page,
      ...(clientFiltered ? { clientFiltered: true } : {})
    });
  } catch (e) {
    return caughtResult(SERVICE, e);
  }
}
