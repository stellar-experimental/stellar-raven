/**
 * Whole-skill search admission after lexical scoring.
 *
 * Skill ids are upstream identities, not routing copy. Their terminal slugs
 * can contain generic fragments such as "work" or "dev". The vendor scorer
 * must still score those fields, but a whole skill enters search only when
 * the query also carries exact product or capability evidence.
 *
 * Operations keep the vendor semantics. Exact-id describe/read do not use
 * this helper.
 */
import { lastIdSegment } from "./id.ts";
import { prepareAliasQuery, queryContainsAliasTrigger } from "./known-aliases.ts";
import { STOPWORDS } from "./scoring.ts";
import { normalizeSearchText, tokenize } from "./vendor/search-scoring.ts";

export type WholeSkillAdmissionEntry = {
  id: string;
  description: string;
  knownAliases?: readonly string[];
  knownAliasTriggers?: readonly string[];
};

const MIN_SLUG_COMPONENT_LENGTH = 6;
const MIN_DESCRIPTION_TOKEN_LENGTH = 5;
const RAW_DESCRIPTION_TOKEN_RE = /\b[A-Za-z0-9]+\b/g;

function containsSequence(haystack: readonly string[], needle: readonly string[]): boolean {
  if (needle.length === 0 || needle.length > haystack.length) return false;
  return haystack.some((_, start) =>
    needle.every((token, offset) => haystack[start + offset] === token)
  );
}

function regularPluralBase(token: string): string | null {
  if (token.length < 5 || !token.endsWith("s") || token.endsWith("ss")) return null;
  return token.slice(0, -1);
}

function matchesCapabilityToken(queryToken: string, descriptionToken: string): boolean {
  if (queryToken === descriptionToken) return true;
  return (
    regularPluralBase(queryToken) === descriptionToken ||
    regularPluralBase(descriptionToken) === queryToken
  );
}

function descriptionDomainCodeSequences(description: string): string[][] {
  return [...description.matchAll(RAW_DESCRIPTION_TOKEN_RE)].flatMap(([token]) => {
    if (token.length < 2 || token.length > 5) return [];
    const uppercaseCount = [...token].filter((character) => /[A-Z]/.test(character)).length;
    if (uppercaseCount < 2 && !/\d/.test(token)) return [];

    const split = tokenize(token);
    const folded = [token.toLowerCase()];
    return split.length === 1 && split[0] === folded[0] ? [split] : [split, folded];
  });
}

/**
 * Admit a lexically scored whole skill only with exact identity, alias, slug,
 * description, or domain-code evidence. Length bounds apply only to ordinary
 * words. Short published terms such as ZK, SCF, RPC, MPP, SAC, and x402
 * remain valid discovery evidence. Domain codes also retain their case-folded
 * whole form, so DeFi and defi have the same admission behavior.
 */
export function admitsWholeSkill(
  entry: WholeSkillAdmissionEntry,
  query: string,
  preparedQueryTokens?: readonly string[],
  preparedAliasTokens?: readonly string[]
): boolean {
  const queryTokens = preparedQueryTokens ?? tokenize(query);
  if (queryTokens.length === 0) return false;

  const name = lastIdSegment(entry.id);
  const normalizedQuery = normalizeSearchText(query);
  if (
    normalizedQuery === normalizeSearchText(entry.id) ||
    normalizedQuery === normalizeSearchText(name)
  ) {
    return true;
  }

  const nameTokens = tokenize(name);
  if (containsSequence(queryTokens, nameTokens)) return true;

  const aliasQueryTokens = preparedAliasTokens ?? prepareAliasQuery(query);
  if (
    entry.knownAliases?.length &&
    entry.knownAliasTriggers?.some((trigger) =>
      queryContainsAliasTrigger(aliasQueryTokens, trigger)
    )
  ) {
    return true;
  }

  const queryTokenSet = new Set(queryTokens);
  if (nameTokens.length === 1 && queryTokenSet.has(nameTokens[0]!)) return true;
  if (
    nameTokens.some(
      (token) => token.length >= MIN_SLUG_COMPONENT_LENGTH && queryTokenSet.has(token)
    )
  ) {
    return true;
  }

  const domainCodeSequences = descriptionDomainCodeSequences(entry.description);
  if (domainCodeSequences.some((sequence) => containsSequence(queryTokens, sequence))) return true;
  const descriptionTokens = tokenize(entry.description);
  return queryTokens.some(
    (queryToken) =>
      queryToken.length >= MIN_DESCRIPTION_TOKEN_LENGTH &&
      !STOPWORDS.has(queryToken) &&
      descriptionTokens.some((descriptionToken) =>
        matchesCapabilityToken(queryToken, descriptionToken)
      )
  );
}
