/**
 * Shared, pure field shaping for search-family Workers Logs events.
 *
 * Keep this separate from the model-facing search response: these fields are
 * operator telemetry only. In particular, `omittedCount` inherits `total`'s
 * consulted-tier floor semantics; it is the number of candidates not shown
 * from the pool this page actually ranked, not an exhaustive missed-result
 * count.
 */
import type { SearchPage } from "./catalog/search.ts";

type SearchEventId = { id: string };

export type SearchEventSummary = {
  hits: readonly SearchEventId[];
  total: number;
  truncated: boolean;
  recovery: readonly SearchEventId[];
  widerCandidates: readonly SearchEventId[];
};

export type SearchEventFieldsInput = {
  query: string;
  requestedLimit: number | null;
  /** Null when validation/refusal prevented searchCatalogPage from running. */
  page: SearchPage | null;
  /** Null for refusal events that do not report a search result shape. */
  summary: SearchEventSummary | null;
};

export type SearchEventFields = {
  queryChars: number;
  requestedLimit: number | null;
  effectiveLimit: number | null;
  omittedCount: number;
  gatedHits: number;
  backfillHits: number;
  hits?: number;
  total?: number;
  truncated?: boolean;
  top?: string[];
  recovery?: number;
  recoveryTop?: string[];
  widerCandidates?: number;
  widerCandidateTop?: string[];
};

const topIds = (items: readonly SearchEventId[]): string[] =>
  items.slice(0, 3).map((item) => item.id);

export function searchEventFields(input: SearchEventFieldsInput): SearchEventFields {
  const { page } = input;
  const hits = page?.hits ?? [];
  return {
    queryChars: input.query.length,
    requestedLimit: input.requestedLimit,
    effectiveLimit: page?.effectiveLimit ?? null,
    omittedCount: page ? Math.max(0, page.total - page.hits.length) : 0,
    gatedHits: hits.filter((hit) => hit.tier === "gated").length,
    backfillHits: hits.filter((hit) => hit.tier === "backfill").length,
    ...(input.summary
      ? {
          hits: input.summary.hits.length,
          total: input.summary.total,
          truncated: input.summary.truncated,
          top: topIds(input.summary.hits),
          recovery: input.summary.recovery.length,
          recoveryTop: topIds(input.summary.recovery),
          widerCandidates: input.summary.widerCandidates.length,
          widerCandidateTop: topIds(input.summary.widerCandidates)
        }
      : {})
  };
}
