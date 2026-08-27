import { STOPWORDS } from "./scoring.ts";
import { tokenize } from "./vendor/search-scoring.ts";

const GENERIC_TRIGGER_WORDS = new Set([
  ...STOPWORDS,
  "account",
  "asset",
  "card",
  "contract",
  "credit",
  "data",
  "digital",
  "directory",
  "fund",
  "income",
  "network",
  "payment",
  "payments",
  "private",
  "project",
  "protocol",
  "research",
  "search",
  "service",
  "services",
  "token",
  "tokens",
  "transaction",
  "transactions"
]);

export function normalizeAliasSequence(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function prepareAliasQuery(query: string): string[] {
  return tokenize(query).map(normalizeAliasSequence).filter(Boolean);
}

export function queryContainsAliasTrigger(
  queryTokens: readonly string[],
  trigger: string
): boolean {
  const normalizedTrigger = normalizeAliasSequence(trigger);
  if (!normalizedTrigger) return false;

  for (let start = 0; start < queryTokens.length; start++) {
    let candidate = "";
    for (let end = start; end < queryTokens.length; end++) {
      candidate += queryTokens[end];
      if (candidate === normalizedTrigger) return true;
      if (candidate.length >= normalizedTrigger.length) break;
    }
  }
  return false;
}

export function isGenericAliasTrigger(trigger: string): boolean {
  const words = tokenize(trigger);
  if (words.length > 1 && words.every((word) => GENERIC_TRIGGER_WORDS.has(word))) return true;

  const normalized = normalizeAliasSequence(trigger);
  const memo = new Map<string, boolean>();
  const canSegment = (remaining: string, parts: number): boolean => {
    if (!remaining) return parts >= 2;
    const key = `${remaining}:${parts}`;
    const cached = memo.get(key);
    if (cached !== undefined) return cached;
    const matched = [...GENERIC_TRIGGER_WORDS].some(
      (word) => remaining.startsWith(word) && canSegment(remaining.slice(word.length), parts + 1)
    );
    memo.set(key, matched);
    return matched;
  };
  return canSegment(normalized, 0);
}
