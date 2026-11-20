/**
 * Build-time keyword extraction for operation and skill-section catalog entries.
 * Mirrors the vendored `tokenize` and `STOPWORDS`, excludes already-scored tokens,
 * and orders deterministically by frequency descending then first occurrence.
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
