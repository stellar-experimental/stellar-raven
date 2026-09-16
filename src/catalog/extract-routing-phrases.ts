import { STOPWORDS } from "./scoring.ts";
import {
  ROUTING_FIELDS,
  type RoutingExclusion,
  type RoutingPhrase
} from "./types.ts";
import { tokenize } from "./vendor/search-scoring.ts";

export type RoutingSource = Partial<Record<(typeof ROUTING_FIELDS)[number], readonly string[]>>;

/** Match the existing routing-keyword budget without flattening phrase boundaries. */
export const ROUTING_PHRASE_TOKEN_CAP = 256;
export const ROUTING_EXCLUSION_TOKEN_CAP = 128;

/**
 * Preserve bounded negative-intent clauses without their routing targets.
 * Text after `->` names another operation or service. It is not evidence
 * about the rejected user intent.
 */
export function extractRoutingExclusions(
  source: readonly string[],
  cap = ROUTING_EXCLUSION_TOKEN_CAP
): RoutingExclusion[] {
  if (!Number.isFinite(cap) || cap <= 0) return [];
  let remaining = Math.floor(cap);
  const seen = new Set<string>();
  const exclusions: RoutingExclusion[] = [];
  for (const text of source) {
    const clause = text.split(/\s*->\s*/u, 1)[0] ?? "";
    const tokens = [...new Set(
      tokenize(clause).filter((token) => token.length >= 2 && !STOPWORDS.has(token))
    )];
    if (tokens.length < 2) continue;
    const key = tokens.join("\u0000");
    if (seen.has(key)) continue;
    seen.add(key);
    if (tokens.length > remaining) continue;
    exclusions.push({ tokens });
    remaining -= tokens.length;
    if (remaining === 0) break;
  }
  return exclusions;
}

/**
 * Preserve positive upstream x-routing strings within one bounded token budget.
 * Each purpose, useWhen, exampleQuestions, or keywords string stays separate.
 * A multiword keywords item is one source phrase. Separate items never join.
 * Without truncation, source and field order stay stable. At the cap, a
 * round-robin pass prevents one field from consuming the budget. Each field
 * alternates its first and last phrases before moving inward. This keeps
 * source-tail examples available without joining or truncating phrases.
 */
export function extractRoutingPhrases(
  source: RoutingSource,
  cap = ROUTING_PHRASE_TOKEN_CAP
): RoutingPhrase[] {
  if (!Number.isFinite(cap) || cap <= 0) return [];
  let remaining = Math.floor(cap);
  const seen = new Set<string>();
  const byField = new Map<RoutingPhrase["field"], RoutingPhrase[]>();

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

      const fieldPhrases = byField.get(field) ?? [];
      fieldPhrases.push({ field, tokens });
      byField.set(field, fieldPhrases);
    }
  }

  const allPhrases = ROUTING_FIELDS.flatMap((field) => byField.get(field) ?? []);
  if (allPhrases.reduce((total, phrase) => total + phrase.tokens.length, 0) <= remaining) {
    return allPhrases;
  }

  const fairIndexes = new Map<RoutingPhrase["field"], number[]>();
  for (const field of ROUTING_FIELDS) {
    const length = byField.get(field)?.length ?? 0;
    const indexes: number[] = [];
    for (let low = 0, high = length - 1; low <= high; low++, high--) {
      indexes.push(low);
      if (high !== low) indexes.push(high);
    }
    fairIndexes.set(field, indexes);
  }

  const phrases: RoutingPhrase[] = [];
  let round = 0;
  let considered = true;
  while (remaining > 0 && considered) {
    considered = false;
    for (const field of ROUTING_FIELDS) {
      const phraseIndex = fairIndexes.get(field)?.[round];
      const phrase = phraseIndex === undefined ? undefined : byField.get(field)?.[phraseIndex];
      if (!phrase) continue;
      considered = true;
      if (phrase.tokens.length > remaining) continue;
      phrases.push(phrase);
      remaining -= phrase.tokens.length;
      if (remaining === 0) return phrases;
    }
    round++;
  }

  return phrases;
}
