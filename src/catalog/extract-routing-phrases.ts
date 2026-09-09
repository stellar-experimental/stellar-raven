import { STOPWORDS } from "./scoring.ts";
import { ROUTING_FIELDS, type RoutingPhrase } from "./types.ts";
import { tokenize } from "./vendor/search-scoring.ts";

export type RoutingSource = Partial<Record<(typeof ROUTING_FIELDS)[number], readonly string[]>>;

/** Match the existing routing-keyword budget without flattening phrase boundaries. */
export const ROUTING_PHRASE_TOKEN_CAP = 256;

/**
 * Preserve positive upstream x-routing strings within one bounded token budget.
 * Each purpose, useWhen, exampleQuestions, or keywords string stays separate.
 * A multiword keywords item is one source phrase. Separate items never join.
 * Source order stays stable. The cap keeps only a prefix of complete phrases.
 */
export function extractRoutingPhrases(
  source: RoutingSource,
  cap = ROUTING_PHRASE_TOKEN_CAP
): RoutingPhrase[] {
  if (!Number.isFinite(cap) || cap <= 0) return [];
  let remaining = Math.floor(cap);
  const seen = new Set<string>();
  const phrases: RoutingPhrase[] = [];

  for (const field of ROUTING_FIELDS) {
    for (const text of source[field] ?? []) {
      const tokens = [...new Set(
        tokenize(text).filter((token) => token.length >= 2 && !STOPWORDS.has(token))
      )];
      // A one-token phrase cannot meet the selector's coherent-phrase rule.
      if (tokens.length < 2) continue;
      const key = tokens.join("\u0000");
      if (seen.has(key)) continue;
      seen.add(key);

      // Never turn a source phrase into a different claim at the cap.
      if (tokens.length > remaining) return phrases;
      phrases.push({ field, tokens });
      remaining -= tokens.length;
      if (remaining === 0) return phrases;
    }
  }

  return phrases;
}
