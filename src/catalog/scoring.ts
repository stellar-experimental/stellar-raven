/**
 * Structural scoring adjustments over the vendored lexical scorer.
 * See src/catalog/README.md for admission, selection, and recovery.
 *
 * Stopword rescue retries a failed score without closed-class English words.
 * A score that already passes keeps its original vendor value.
 * Section weighting uses 0.75; default section entries remain unsearchable.
 * Section keywords blend at 0.4 when an experiment emits them.
 * Routing keywords blend at 1.0 with routing-coherence and schema checks.
 * Query aliases provide general canonical forms through QUERY_TOKEN_ALIASES.
 * Acronym rescue contracts content-word spans when source text supplies the acronym.
 * The ungated replica keeps the scoring scale while removing the coverage gate.
 *
 * searchCatalogPage uses ungated scores for short-page filling and targeted
 * full-page replacement. Service diversity and replacement belong to search.ts.
 * Final ordering applies tier interleaving and a separate freshness rule.
 * These adjustments use catalog-wide rules, not per-question service maps.
 * The routing gates check changes to the scoring contract.
 */
import {
  normalizeSearchText,
  scoreEntry,
  tokenize,
  type ScorableEntry
} from "./vendor/search-scoring.ts";
import type { RoutingPhrase } from "./types.ts";

export type { ScorableEntry } from "./vendor/search-scoring.ts";

/**
 * ScorableEntry plus the optional build-time keyword fields: `keywords`
 * and `routingKeywords`.
 */
export type WeightedScorableEntry = ScorableEntry & {
  keywords?: readonly string[];
  routingKeywords?: readonly string[];
  routingPhrases?: readonly RoutingPhrase[];
};

export type PreparedQueryForm = {
  query: string;
  tokens: readonly string[];
  contentTokens: readonly string[];
};

type ScoringQueryForm = PreparedQueryForm & { effective: PreparedQueryForm };

type AcronymForm = {
  acronym: string;
  contextTokens: readonly string[];
  form: ScoringQueryForm;
};

export type PreparedScoringQuery = {
  original: ScoringQueryForm;
  canonical: ScoringQueryForm | null;
  acronyms: readonly AcronymForm[];
};

/**
 * General English stopwords (standard closed-class set — articles, copulas,
 * auxiliaries, prepositions, pronouns, wh-words). Domain terms never appear
 * here; the list was not derived from reading eval questions.
 */
export const STOPWORDS: ReadonlySet<string> = new Set([
  "a", "about", "an", "and", "any", "are", "as", "at", "be", "been", "but",
  "by", "can", "could", "did", "do", "does", "doing", "for", "from", "get",
  "had", "has", "have", "how", "i", "if", "in", "into", "is", "it", "its",
  "just", "me", "my", "no", "not", "of", "on", "or", "our", "s", "should",
  "so", "some", "such", "t", "than", "that", "the", "their", "them", "then",
  "there", "these", "they", "this", "those", "to", "up", "was", "we", "were",
  "what", "when", "where", "which", "who", "whose", "why", "will", "with",
  "would", "you", "your"
]);

/**
 * Drop general stopwords from the query; if everything was a stopword, keep
 * the original query (never search on an empty string).
 */
export function effectiveQuery(query: string): string {
  const kept = tokenize(query).filter((t) => !STOPWORDS.has(t));
  return kept.length > 0 ? kept.join(" ") : query;
}

function prepareQueryForm(query: string): ScoringQueryForm {
  const tokens = tokenize(query);
  const kept = tokens.filter((token) => !STOPWORDS.has(token));
  const effectiveQuery = kept.length > 0 ? kept.join(" ") : query;
  const contentTokens = [...new Set(
    tokens.filter((token) => token.length >= 2 && !STOPWORDS.has(token))
  )];
  if (effectiveQuery === query) {
    const prepared = { query, tokens, contentTokens };
    return Object.assign(prepared, { effective: prepared });
  }
  return {
    query,
    tokens,
    contentTokens,
    effective: {
      query: effectiveQuery,
      tokens: kept,
      contentTokens: [...new Set(kept.filter((token) => token.length >= 2))]
    }
  };
}

/**
 * Section-keyword blend factor. Keyword matches ride the description slot
 * (vendor weight 5) in the augmented pass; damping their delta by 0.4 puts
 * them at effective weight 2 — the same tier as the vendor's own low-weight
 * `kind` field.
 */
const KEYWORD_BLEND = 0.4;

/**
 * Routing-keyword blend factor. Source-authored routing vocabulary receives
 * more weight than section keywords. The routing gates check changes.
 */
const ROUTING_KEYWORD_BLEND = 1.0;

/**
 * Joined-keywords cache for the augmented scoring pass. Keyed on the
 * `keywords` ARRAY, not the scorable wrapper: searchCatalog() builds a fresh
 * wrapper object per entry per query, but passes `entry.keywords` by
 * reference from the parsed module-singleton manifest — the array's identity
 * is stable across queries, so the join is computed once per entry ever.
 * WeakMap so a reloaded manifest never pins the old arrays.
 */
const joinedKeywordsCache = new WeakMap<readonly string[], string>();

function joinedKeywords(keywords: readonly string[]): string {
  let joined = joinedKeywordsCache.get(keywords);
  if (joined === undefined) {
    joined = keywords.join(" ");
    joinedKeywordsCache.set(keywords, joined);
  }
  return joined;
}

export function canonicalRoutingToken(token: string): string {
  if (token === "people") return "person";
  if (token.endsWith("ies") && token.length > 4) return `${token.slice(0, -3)}y`;
  if (token.endsWith("xes") && token.length > 4) return token.slice(0, -2);
  if (token.endsWith("s") && token.length > 3) return token.slice(0, -1);
  return token;
}

export function tokensOverlap(left: string, right: string): boolean {
  const canonicalLeft = canonicalRoutingToken(left);
  const canonicalRight = canonicalRoutingToken(right);
  if (canonicalLeft === canonicalRight) return true;
  const shorter = Math.min(canonicalLeft.length, canonicalRight.length);
  const longer = Math.max(canonicalLeft.length, canonicalRight.length);
  if (shorter < 4 || shorter / longer < 0.75) return false;
  return canonicalLeft.startsWith(canonicalRight) || canonicalRight.startsWith(canonicalLeft);
}

function matchingTokens(tokens: readonly string[], queryTokens: readonly string[]): string[] {
  return tokens.filter((token) => queryTokens.some((queryToken) =>
    tokensOverlap(token, queryToken)
  ));
}

function hasCoherentRoutingWitness(
  phrases: readonly RoutingPhrase[] | undefined,
  queryTokens: readonly string[]
): boolean {
  if (!phrases || phrases.length === 0) return false;
  if (queryTokens.length < 3) return false;
  return phrases.some((phrase) => queryTokens.filter((queryToken) =>
    phrase.tokens.some((token) => tokensOverlap(token, queryToken))
  ).length >= 2);
}

/** The base lexical scorer a pipeline pass runs on: vendor (gated) or the ungated replica. */
type EntryScorer = (entry: ScorableEntry, query: PreparedQueryForm) => number | null;

const gatedEntryScorer: EntryScorer = (entry, query) => scoreEntry(entry, query.query);
const ungatedEntryScorer: EntryScorer = (entry, query) => scoreEntryUngatedPrepared(entry, query);

/**
 * Base score with the build-time keyword fields blended in.
 * A keyword field needs a whole-token witness. Routing-only admission also
 * needs two query tokens from one source phrase. Once admitted, each field
 * contributes one deduplicated delta. Repeated phrases cannot add weight.
 */
function scoreWithKeywords(
  entry: WeightedScorableEntry,
  query: PreparedQueryForm,
  score: EntryScorer
): number | null {
  const base = score(entry, query);
  const fields: { tokens: readonly string[]; blend: number }[] = [];
  const schemaMatches = entry.keywords ? matchingTokens(entry.keywords, query.tokens) : [];
  const hasSchemaEvidence = schemaMatches.length >= 2 ||
    (base !== null && schemaMatches.some((token) => canonicalRoutingToken(token).length >= 4));
  if (entry.keywords && hasSchemaEvidence) {
    fields.push({ tokens: [...new Set(entry.keywords)], blend: KEYWORD_BLEND });
  }
  if (
    entry.routingKeywords &&
    (base !== null || hasCoherentRoutingWitness(entry.routingPhrases, query.contentTokens))
  ) {
    fields.push({
      tokens: [...new Set(entry.routingKeywords)],
      blend: ROUTING_KEYWORD_BLEND
    });
  }
  if (fields.length === 0) return base;
  let blended = base ?? 0;
  let rescued: number | null = null;
  for (const field of fields) {
    const augmented = score(
      { ...entry, description: `${entry.description} ${joinedKeywords(field.tokens)}` },
      query
    );
    if (augmented === null) continue;
    if (base === null) {
      rescued = Math.max(rescued ?? 0, Math.round(augmented * field.blend));
    } else {
      blended += Math.max(0, Math.round((augmented - base) * field.blend));
    }
  }
  return base === null ? rescued : blended;
}

/**
 * Full weighting pipeline (keyword blend → stopword rescue → kind weight)
 * over a given base scorer: score the FULL query first, and only when the
 * base scorer returns null retry with the stopword-filtered query.
 */
function weightedScore(
  entry: WeightedScorableEntry,
  query: ScoringQueryForm,
  score: EntryScorer
): number | null {
  const kindWeight = entry.kind === "skill-section" ? 0.75 : 1;
  const base = scoreWithKeywords(entry, query, score);
  if (base !== null) return Math.round(base * kindWeight);
  if (query.effective === query) return null;
  const rescued = scoreWithKeywords(entry, query.effective, score);
  return rescued === null ? null : Math.round(rescued * kindWeight);
}

/**
 * Lever 6: domain alias canonicalization on the query side. Real users
 * abbreviate ("tx history", "acct balance"); the catalog spells vocabulary
 * out, and the vendor's prefix match cannot bridge "tx"→"transaction"
 * ("transaction" does not start with "tx"). The table maps abbreviation →
 * canonical token, single-token to single-token only, and is curated from
 * DOMAIN knowledge — never from eval questions (STOPWORDS legitimacy rule).
 * Each entry was vetted against catalog vocabulary: the alias must not be a
 * load-bearing catalog token of its own (amm/dex/defi/nft/xlm/repo/sep/kyc/
 * dapp/wasm/cli/sdk all ARE catalog vocabulary and are deliberately absent;
 * the catalog's own 21 tx/txs tokens all MEAN transaction, so no shadowing).
 *
 * The offline corpus stays byte-identical because few cases contain these
 * aliases. The real-user lane validates the change. See eval/README.md.
 */
export const QUERY_TOKEN_ALIASES: ReadonlyMap<string, string> = new Map([
  ["tx", "transaction"],
  ["txn", "transaction"],
  ["txs", "transactions"],
  ["acct", "account"],
  ["addr", "address"]
]);

/**
 * Replace alias tokens with their canonical forms; null when the query
 * contains no alias token (the common case — zero extra scoring work).
 * Memoized on the raw query string: searchCatalogPage scores every catalog
 * entry with the same query, so the canonicalization must not re-tokenize
 * once per catalog entry.
 */
const canonicalizeCache = new Map<string, string | null>();

export function canonicalizeQuery(query: string): string | null {
  let cached = canonicalizeCache.get(query);
  if (cached !== undefined) return cached;
  if (canonicalizeCache.size > 500) canonicalizeCache.clear(); // bound memory
  const tokens = tokenize(query);
  cached = tokens.some((t) => QUERY_TOKEN_ALIASES.has(t))
    ? tokens.map((t) => QUERY_TOKEN_ALIASES.get(t) ?? t).join(" ")
    : null;
  canonicalizeCache.set(query, cached);
  return cached;
}

// Uppercase emphasis is not evidence of an acronym. Exclude closed-class
// English plus common quantifiers, number words, and instruction emphasis.
const ACRONYM_WORDS = new Set([
  ...STOPWORDS,
  "all", "one", "two", "three", "four", "five", "six", "seven", "eight",
  "nine", "ten", "zero", "only", "none", "each", "every", "both", "other",
  "either", "neither", "must", "may", "might", "shall", "never", "always",
  "yes", "true", "false", "note", "use", "read", "write"
]);
const ACRONYM_FORM_LIMIT = 32;

/**
 * Try initialisms of contiguous content words, only when an entry supplies
 * the uppercase acronym. No protocol-name dictionary or service mapping is
 * needed. Three to six words bounds ambiguity and preparation work; stopwords
 * and numeric tokens break a span rather than silently joining unrelated words.
 * Keep content outside the span as independent evidence; cap prepared forms.
 */
function prepareAcronymForms(
  query: string,
  ordinaryWords: ReadonlySet<string>
): PreparedScoringQuery["acronyms"] {
  const tokens = tokenize(query);
  const forms: AcronymForm[] = [];
  for (let start = 0; start < tokens.length; start++) {
    let acronym = "";
    for (let end = start; end < Math.min(tokens.length, start + 6); end++) {
      const token = tokens[end];
      if (!token || STOPWORDS.has(token) || !/^[a-z]{2,}$/.test(token)) break;
      acronym += token.charAt(0);
      if (end - start < 2) continue;
      if (ACRONYM_WORDS.has(acronym) || ordinaryWords.has(acronym)) continue;
      const outside = [...tokens.slice(0, start), ...tokens.slice(end + 1)];
      const contextTokens = outside.filter((t) => t.length >= 2 && !STOPWORDS.has(t));
      if (contextTokens.length === 0) continue;
      forms.push({
        acronym: acronym.toUpperCase(),
        contextTokens,
        form: prepareQueryForm([
          ...tokens.slice(0, start), acronym, ...tokens.slice(end + 1)
        ].join(" "))
      });
      if (forms.length === ACRONYM_FORM_LIMIT) return forms;
    }
  }
  return forms;
}

export function prepareScoringQuery(
  query: string,
  ordinaryWords: ReadonlySet<string> = ACRONYM_WORDS
): PreparedScoringQuery {
  const canonical = canonicalizeQuery(query);
  return {
    original: prepareQueryForm(query),
    canonical: canonical === null ? null : prepareQueryForm(canonical),
    acronyms: prepareAcronymForms(canonical ?? query, ordinaryWords)
  };
}

/**
 * Max of the full pipeline over the original and the alias-canonicalized
 * query. The max is taken ABOVE weightedScore so both variants
 * share the whole pipeline (keyword blend → stopword rescue → kind weight)
 * under the same base scorer; kind weight is a constant per-entry multiplier
 * so it commutes with the max, and each variant runs its own stopword rescue
 * (substitution changes which tokens gate). Original-query scores are never
 * reduced. Queries without alias tokens use the original pipeline only.
 */
function aliasMaxScore(
  entry: WeightedScorableEntry,
  query: PreparedScoringQuery,
  score: EntryScorer
): number | null {
  const base = weightedScore(entry, query.original, score);
  if (query.canonical === null) return base;
  const alt = weightedScore(entry, query.canonical, score);
  if (alt === null) return base;
  return base === null ? alt : Math.max(base, alt);
}

/**
 * Acronyms can admit a gate-failed entry only with independent context and
 * a score at least as high as its original ungated score. Existing gated
 * scores stay unchanged. The ungated path never uses acronym forms.
 */
function acronymRescueScore(
  entry: WeightedScorableEntry,
  query: PreparedScoringQuery,
): number | null {
  let best = aliasMaxScore(entry, query, gatedEntryScorer);
  if (best !== null || query.acronyms.length === 0) return best;
  const ungated = aliasMaxScore(entry, query, ungatedEntryScorer);
  // Only source description text can witness an acronym. Lowercase keyword
  // fields and accidental initials in ordinary words cannot admit a variant.
  const acronyms = new Set(entry.description.match(/\b[A-Z]{3,6}\b/g) ?? []);
  const entryTokens = new Set(
    tokenize(`${entry.id} ${entry.name} ${entry.description}`).map(canonicalRoutingToken)
  );
  for (const variant of query.acronyms) {
    if (!acronyms.has(variant.acronym)) continue;
    if (!variant.contextTokens.some((token) => entryTokens.has(canonicalRoutingToken(token)))) continue;
    const alt = weightedScore(entry, variant.form, gatedEntryScorer);
    if (alt !== null && (ungated === null || alt >= ungated)) {
      best = best === null ? alt : Math.max(best, alt);
    }
  }
  return best;
}

/**
 * Lexical score with a stopword-rescue fallback: score the FULL query first
 * (vendor semantics unchanged for every entry that passes the coverage
 * gate), and only when the gate fails retry with the stopword-filtered
 * query. Natural-language questions otherwise return ZERO hits whenever the
 * closed-class words ("how", "what", "the", …) push token coverage under
 * the vendor's 60% threshold — the rescue makes coverage a statement about
 * content words without disturbing rankings that already worked.
 * Alias-bearing queries additionally score under their canonicalized form
 * and take the maximum. If lexical coverage still fails, source-witnessed
 * acronym forms can rescue the entry without changing the vendor scorer.
 */
export function scoreEntryWeighted(
  entry: WeightedScorableEntry,
  query: string,
  prepared = prepareScoringQuery(query)
): number | null {
  return acronymRescueScore(entry, prepared);
}

/**
 * Apply the weighting pipeline over the gate-free vendor replica.
 * search.ts uses it for short-page filling and targeted full-page replacement.
 * Tier interleaving uses TIER_INTERLEAVE_MARGIN; freshness ordering is separate.
 */
export function scoreEntryWeightedUngated(
  entry: WeightedScorableEntry,
  query: string,
  prepared = prepareScoringQuery(query)
): number | null {
  return aliasMaxScore(entry, prepared, ungatedEntryScorer);
}

/**
 * Gate-free replica of the vendored scorer. Mirrors
 * vendor/search-scoring.ts `scoreField`/`scoreEntry` line for line EXCEPT
 * the coverage gate (vendor line 130) is dropped — entries still need at
 * least one matched token. Kept here so the vendor file stays byte-identical
 * (as with keyword double-scoring); if the vendor scorer is ever
 * re-vendored, update this replica to match.
 *
 * DRIFT GUARD: because the ONLY difference is the gate, the replica must
 * score identically to the vendor wherever the vendor passes —
 * test/scoring.test.ts sweeps the real manifest against a query battery and
 * asserts `scoreEntry(e,q) !== null ⇒ scoreEntryUngated(e,q) === scoreEntry(e,q)`.
 * A re-vendor that changes upstream math fails that suite loudly instead of
 * silently desyncing tier 2.
 *
 * Re-vendor checklist for an @cloudflare/codemode upgrade:
 *  1. Field weights + tokenization/normalization (vendor FIELD_WEIGHTS,
 *     normalizeSearchText, tokenize) — mirror any change into this replica,
 *     then make the drift suite green again.
 *  2. Coverage-gate semantics (thresholds, exactPhrase escape) — the gate is
 *     the one line deliberately absent here; if its meaning changes, re-check
 *     search.ts's tier-2 rationale, not just this file.
 *  3. Returned search shape upstream ({ results, total, truncated }) — ours
 *     mirrors it in searchCatalogPage; keep parity.
 *  4. Newly exported search helpers — prefer composing with upstream over
 *     maintaining this copy if searchConnectors becomes importable.
 *  5. Type-gen changes (vendor/json-schema-types.ts) affecting
 *     renderSignature and output compaction.
 *  6. Any native docs/snippet/section weighting upstream grows — may
 *     replace our kind weighting.
 */
const UNGATED_FIELD_WEIGHTS = { id: 12, name: 10, service: 8, description: 5, kind: 2 } as const;

type UngatedFieldScore = { score: number; matchedTokens: Set<string>; exactPhrase: boolean };

function scoreFieldUngated(
  query: string,
  queryTokens: readonly string[],
  value: string | undefined,
  weight: number
): UngatedFieldScore {
  const raw = normalizeSearchText(value ?? "");
  const fieldTokens = tokenize(value ?? "");
  if (raw.length === 0) {
    return { score: 0, matchedTokens: new Set(), exactPhrase: false };
  }
  let score = 0;
  const matchedTokens = new Set<string>();
  const exactPhrase = query.length > 0 && raw.includes(query);
  if (query.length > 0) {
    if (raw === query) score += weight * 14;
    else if (raw.startsWith(query)) score += weight * 9;
    else if (exactPhrase) score += weight * 6;
  }
  for (const token of queryTokens) {
    if (fieldTokens.includes(token)) {
      score += weight * 4;
      matchedTokens.add(token);
    } else if (fieldTokens.some((c) => c.startsWith(token) || token.startsWith(c))) {
      score += weight * 2;
      matchedTokens.add(token);
    } else if (raw.includes(token)) {
      score += weight;
      matchedTokens.add(token);
    }
  }
  return { score, matchedTokens, exactPhrase };
}

// Exported for the drift-guard suite (test/scoring.test.ts) ONLY — product
// code must go through scoreEntryWeightedUngated, which applies the structural adjustments.
export function scoreEntryUngated(entry: ScorableEntry, query: string): number | null {
  return scoreEntryUngatedPrepared(entry, prepareQueryForm(query));
}

function scoreEntryUngatedPrepared(
  entry: ScorableEntry,
  prepared: PreparedQueryForm
): number | null {
  const normalizedQuery = normalizeSearchText(prepared.query);
  const queryTokens = prepared.tokens;
  if (normalizedQuery.length === 0 || queryTokens.length === 0) return null;

  const fields: UngatedFieldScore[] = [
    scoreFieldUngated(normalizedQuery, queryTokens, entry.id, UNGATED_FIELD_WEIGHTS.id),
    scoreFieldUngated(normalizedQuery, queryTokens, entry.name, UNGATED_FIELD_WEIGHTS.name),
    scoreFieldUngated(normalizedQuery, queryTokens, entry.service, UNGATED_FIELD_WEIGHTS.service),
    scoreFieldUngated(
      normalizedQuery,
      queryTokens,
      entry.description,
      UNGATED_FIELD_WEIGHTS.description
    ),
    scoreFieldUngated(normalizedQuery, queryTokens, entry.kind, UNGATED_FIELD_WEIGHTS.kind)
  ];

  const matchedTokens = new Set<string>();
  let score = 0;
  for (const field of fields) {
    score += field.score;
    for (const t of field.matchedTokens) matchedTokens.add(t);
  }
  if (matchedTokens.size === 0) return null;

  // Vendor coverage GATE deliberately absent here; the coverage BONUS stays.
  const coverage = matchedTokens.size / queryTokens.length;
  if (coverage === 1) score += 25;
  else score += Math.round(coverage * 10);

  const idTokens = tokenize(entry.id);
  const nameTokens = tokenize(entry.name);
  if (idTokens[0] === queryTokens[0] || nameTokens[0] === queryTokens[0]) score += 8;
  // Boost exact id / name match (upstream: exact path/method match).
  if (
    normalizeSearchText(entry.id) === normalizedQuery ||
    normalizeSearchText(entry.name) === normalizedQuery
  ) {
    score += 20;
  }
  return score;
}

/**
 * Per-service quota for a result page of `limit` slots: 40% of the page,
 * floor 2 (a service may always show a runner-up), so 5 → 2, 10 → 4, 50 → 20.
 */
export function serviceQuota(limit: number): number {
  return Math.max(2, Math.ceil(limit * 0.4));
}

/**
 * Select `limit` items from score-sorted `candidates` with a per-service
 * quota, backfilling from the overflow when fewer than `limit` distinct-
 * service candidates exist. Returns items in the original (score-desc) order.
 */
export function diversifyByService<T>(
  candidates: T[],
  limit: number,
  serviceOf: (item: T) => string
): T[] {
  if (candidates.length <= limit) return candidates.slice(0, limit);
  const quota = serviceQuota(limit);
  const perService = new Map<string, number>();
  const picked: T[] = [];
  const overflow: T[] = [];
  for (const item of candidates) {
    if (picked.length >= limit) break;
    const service = serviceOf(item);
    const used = perService.get(service) ?? 0;
    if (used < quota) {
      picked.push(item);
      perService.set(service, used + 1);
    } else {
      overflow.push(item);
    }
  }
  // Backfill (highest-score overflow first) when quotas left slots empty.
  for (const item of overflow) {
    if (picked.length >= limit) break;
    picked.push(item);
  }
  // Preserve score order for presentation: picked came from a sorted stream,
  // but backfilled overflow items may out-score later quota picks.
  const rank = new Map<T, number>(candidates.map((c, i) => [c, i]));
  return picked.sort((a, b) => (rank.get(a) ?? 0) - (rank.get(b) ?? 0));
}
