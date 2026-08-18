/**
 * Build-time keyword extraction for skill-section catalog entries.
 *
 * Section entries' descriptions are heading + first paragraph truncated to
 * 200 chars, so mid-section content (error codes, CLI flags, function names)
 * is lexically invisible to the search scorer. This module distills a
 * section's BODY into a small `keywords: string[]` manifest field that
 * scoring.ts blends in at low weight.
 *
 * Semantics mirror the vendored scorer exactly — same `tokenize` (camelCase
 * split, punctuation → spaces, lowercase), so every extracted keyword is a
 * token the scorer can actually match. Filtering:
 *   - stopwords (scoring.ts STOPWORDS — same closed-class set the query
 *     rescue uses),
 *   - single-character tokens (splitter shrapnel),
 *   - tokens already present in the entry's other scored fields (id, name,
 *     description, …) — keywords must ADD vocabulary, not double-count it.
 *
 * Deterministic ordering: frequency descending, first occurrence in the body
 * as the tie-break. Capped (default 64/section) to bound manifest growth —
 * the manifest is bundled into the Worker.
 *
 * Lives in src/catalog/** (explicit .ts imports, plain-Node importable) so
 * scripts/build-catalog.mjs, vitest, and the eval CLI can all load it the
 * same way search.ts is loaded (native type stripping, Node >= 23.6).
 */
import { tokenize } from "./vendor/search-scoring.ts";
import { STOPWORDS } from "./scoring.ts";

export const DEFAULT_KEYWORD_CAP = 64;

export type ExtractKeywordsOptions = {
  /**
   * Texts whose tokens are already visible to the scorer for this entry
   * (id, name, description, service …). Their tokens are excluded.
   */
  exclude?: string[];
  /** Maximum keywords returned (default DEFAULT_KEYWORD_CAP). */
  cap?: number;
};

/**
 * Extract up to `cap` content keywords from a section body. Pure and
 * deterministic: same inputs → same output array (order included).
 */
export function extractKeywords(body: string, opts: ExtractKeywordsOptions = {}): string[] {
  const cap = opts.cap ?? DEFAULT_KEYWORD_CAP;
  if (cap <= 0) return [];
  const excluded = new Set<string>();
  for (const text of opts.exclude ?? []) {
    for (const token of tokenize(text)) excluded.add(token);
  }

  const freq = new Map<string, { count: number; first: number }>();
  const tokens = tokenize(body);
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]!;
    if (token.length < 2 || STOPWORDS.has(token) || excluded.has(token)) continue;
    const seen = freq.get(token);
    if (seen) seen.count += 1;
    else freq.set(token, { count: 1, first: i });
  }

  return [...freq.entries()]
    .sort((a, b) => b[1].count - a[1].count || a[1].first - b[1].first)
    .slice(0, cap)
    .map(([token]) => token);
}
