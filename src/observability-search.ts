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
export type SearchEventFieldsInput = {
  query: string;
  requestedLimit: number | null;
  /** Null when validation/refusal prevented searchCatalogPage from running. */
  page: SearchPage | null;
};

export function searchEventFields(input: SearchEventFieldsInput): Record<string, unknown> {
  const { page } = input;
  const hits = page?.hits ?? [];
  return {
    queryChars: input.query.length,
    requestedLimit: input.requestedLimit,
    effectiveLimit: page?.effectiveLimit ?? null,
    omittedCount: page ? Math.max(0, page.total - page.hits.length) : 0,
    gatedHits: hits.filter((hit) => hit.tier === "gated").length,
    backfillHits: hits.filter((hit) => hit.tier === "backfill").length
  };
}
