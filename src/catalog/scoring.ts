/**
 * Routing-aware scoring layer on top of the vendored lexical scorer
 * (src/catalog/vendor/search-scoring.ts — untouched upstream math).
 *
 * This module adds structural adjustments to the vendored scorer.
 * Every lever below is query-independent and applies uniformly to the whole
 * catalog. No per-question special cases, no query→service maps.
 *
 * Seven levers (numbered 1–7 below; lever 6 is query-side alias
 * canonicalization, documented at QUERY_TOKEN_ALIASES), each fixing a
 * measured, structural imbalance (eval/README.md baseline: 203
 * skill-sections lexically crowding 57 operations; 40/338 questions gated
 * to zero hits; single services flooding all top-5 slots):
 *
 *  1. Stopword GATE-RESCUE — when an entry fails the vendor scorer's
 *     token-coverage gate on the full query, it is rescored with general
 *     English stopwords (a standard Snowball-style closed-class set, NOT
 *     derived from any eval question) removed from the query. Coverage
 *     becomes a statement about content words; entries that already passed
 *     keep their exact vendor score. (Filtering stopwords for ALL scoring
 *     was tried and measurably regressed routing — matched closed-class
 *     words in prose descriptions carry real signal in the vendor math.)
 *
 *  2. Kind weighting — skill-section entries (fragments of a SKILL.md whose
 *     whole-skill entry also ranks) are scaled by 0.75. The search tool
 *     exists to route a model to something it can CALL or open whole; 203
 *     near-duplicate fragments should not blanket-outrank 57 operations on
 *     shared topical vocabulary. (Since the 2026-07-13 skills-form A/B all
 *     section entries also carry searchable:false and never enter search in
 *     the shipped catalog — this weight only applies in experiment arms that
 *     re-enable them.) Whole-skill entries keep full weight.
 *
 *  3. Service-diversity selection — the top-`limit` SET is chosen with a
 *     per-service quota (score order otherwise preserved). A routing search
 *     that shows one service five times tells the caller strictly less than
 *     one that shows the two runner-up services too. The quota only changes
 *     set membership below the flood point: the top-scoring entry is never
 *     displaced, and a service's FIRST in-page hit always survives (quotas
 *     only trim a service's third-and-later appearances).
 *
 *  4. Low-weight keyword field — skill-section entries
 *     carry build-time `keywords` distilled from the section BODY
 *     (src/catalog/extract-keywords.ts); descriptions are heading + first
 *     paragraph truncated to 200 chars, so mid-section content (error codes,
 *     flags, function names) was lexically invisible. The vendor file stays
 *     byte-identical: the entry is scored twice — once as-is, once with the
 *     keywords appended to the description — and the keyword-attributable
 *     DELTA is blended in at KEYWORD_BLEND (0.4 × description weight ≈ the
 *     vendor's own low-weight `kind` field). The rescue path re-admits
 *     gate-failed entries at KEYWORD_BLEND damping with NO structural cap:
 *     a rescued section CAN outrank a weak genuine name/description match
 *     (measured pair: rescued 35 vs genuine 17). The routing eval (legacy
 *     gates + skills lane, eval/run-routing.mjs) is the guard against that
 *     trade going bad; changing the blend requires re-running it.
 *
 *  5. Ungated scoring path for tiered gate-rescue backfill — the
 *     vendor coverage gate (search-scoring.ts:130, <60% token coverage and
 *     no exact phrase → null) is structurally unreachable for long
 *     multi-clause questions: at 20+ query tokens NO single entry covers 60%
 *     of the vocabulary, so the whole catalog gates to zero. The stopword
 *     rescue (lever 1) does not help — the surplus tokens are content words.
 *     `scoreEntryWeightedUngated` is the same pipeline (keyword blend,
 *     stopword rescue, kind weight) over a gate-free replica of the vendor
 *     math, kept beside it the same way lever 4 double-scores rather than
 *     editing the vendor file. searchCatalogPage() (searchCatalog's engine)
 *     uses it ONLY to backfill a result page the gated tier left short. A
 *     backfill hit ranks above a gated hit only when its ungated score is >=
 *     TIER_INTERLEAVE_MARGIN times the gated hit's score. The drift guard in
 *     test/scoring.test.ts proves the two scorers share a scale wherever the
 *     gate passes (see search.ts).
 *
 *  7. Routing-keyword field (Scout 1.7.16 x-routing) —
 *     operation entries may carry `routingKeywords`: vocabulary the upstream
 *     service curates specifically for routing and publishes separately from
 *     its prose description (Scout's `x-routing` extension: purpose, useWhen,
 *     exampleQuestions, keywords). Same double-scoring shape as lever 4 but
 *     blended at ROUTING_KEYWORD_BLEND — hotter than schema-shrapnel
 *     keywords, cooler than the description itself — per upstream's own
 *     consumer convention ("score as separately-weighted fields rather than
 *     concatenating into the description"). Chosen by A/B sweep at the
 *     1.7.16 absorb; the routing eval guards changes. (Lever 6, query-side
 *     alias canonicalization, is documented at QUERY_TOKEN_ALIASES below.)
 */
import {
  normalizeSearchText,
  scoreEntry,
  tokenize,
  type ScorableEntry
} from "./vendor/search-scoring.ts";

export type { ScorableEntry } from "./vendor/search-scoring.ts";

/**
 * ScorableEntry plus the optional build-time keyword fields: `keywords`
 * (lever 4) and `routingKeywords` (lever 7).
 */
export type WeightedScorableEntry = ScorableEntry & {
  keywords?: readonly string[];
  routingKeywords?: readonly string[];
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

/**
 * Keyword blend factor (lever 4). Keyword matches ride the description slot
 * (vendor weight 5) in the augmented pass; damping their delta by 0.4 puts
 * them at effective weight 2 — the same tier as the vendor's own low-weight
 * `kind` field.
 */
const KEYWORD_BLEND = 0.4;

/**
 * Routing-keyword blend factor (lever 7, Scout 1.7.16 x-routing absorb).
 * `routingKeywords` carry vocabulary the upstream service curated FOR
 * routing (synonym chains, region/product terms, question exemplars —
 * upstream's own convention: "score as separately-weighted fields"), so
 * they blend in hotter than lever 4's schema-shrapnel keywords. Chosen by
 * A/B sweep on the routing eval at the 1.7.16 absorb (0.4/0.6/0.8/1.0
 * measured; eval/README.md); the routing gate is the guard on changing it.
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

/** The base lexical scorer a pipeline pass runs on: vendor (gated) or the lever-5 replica. */
type EntryScorer = (entry: ScorableEntry, query: string) => number | null;

/**
 * Base score with the build-time keyword fields blended in (levers 4 + 7).
 * Entries without either field take the base scorer untouched. Each field
 * is scored as its own augmented pass against the SAME base, so the two
 * deltas are independent and additive; on the rescue path (base gated to
 * null) the entry re-enters at the best single field's damped score —
 * additive rescue would let two weak fields fake one strong match.
 * Build-time dedup (scripts/build-catalog.mjs) keeps `keywords` disjoint
 * from `routingKeywords`, so a token never rides both blends.
 */
function scoreWithKeywords(
  entry: WeightedScorableEntry,
  query: string,
  score: EntryScorer
): number | null {
  const base = score(entry, query);
  const fields: { tokens: readonly string[]; blend: number }[] = [];
  if (entry.keywords && entry.keywords.length > 0) {
    fields.push({ tokens: entry.keywords, blend: KEYWORD_BLEND });
  }
  if (entry.routingKeywords && entry.routingKeywords.length > 0) {
    fields.push({ tokens: entry.routingKeywords, blend: ROUTING_KEYWORD_BLEND });
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
  query: string,
  score: EntryScorer
): number | null {
  const kindWeight = entry.kind === "skill-section" ? 0.75 : 1;
  const base = scoreWithKeywords(entry, query, score);
  if (base !== null) return Math.round(base * kindWeight);
  const filtered = effectiveQuery(query);
  if (filtered === query) return null;
  const rescued = scoreWithKeywords(entry, filtered, score);
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

/**
 * Max of the full pipeline over the original and the alias-canonicalized
 * query (lever 6). The max is taken ABOVE weightedScore so both variants
 * share the whole pipeline (keyword blend → stopword rescue → kind weight)
 * under the same base scorer; kind weight is a constant per-entry multiplier
 * so it commutes with the max, and each variant runs its own stopword rescue
 * (substitution changes which tokens gate). Original-query scores are never
 * reduced — queries without alias tokens are byte-identical to pre-lever
 * behavior by construction.
 */
function aliasMaxScore(
  entry: WeightedScorableEntry,
  query: string,
  score: EntryScorer
): number | null {
  const base = weightedScore(entry, query, score);
  const canonical = canonicalizeQuery(query);
  if (canonical === null) return base;
  const alt = weightedScore(entry, canonical, score);
  if (alt === null) return base;
  return base === null ? alt : Math.max(base, alt);
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
 * and take the max (lever 6 above).
 */
export function scoreEntryWeighted(entry: WeightedScorableEntry, query: string): number | null {
  return aliasMaxScore(entry, query, scoreEntry);
}

/**
 * Lever 5: the same pipeline over the gate-free vendor replica. ONLY for
 * backfilling a short result page (search.ts tier 2). Its score may compete
 * across the seam only when it is >= TIER_INTERLEAVE_MARGIN times a gated
 * hit's score; the drift guard proves the scores share a common scale where
 * the gate passes.
 */
export function scoreEntryWeightedUngated(
  entry: WeightedScorableEntry,
  query: string
): number | null {
  return aliasMaxScore(entry, query, scoreEntryUngated);
}

/**
 * Gate-free replica of the vendored scorer (lever 5). Mirrors
 * vendor/search-scoring.ts `scoreField`/`scoreEntry` line for line EXCEPT
 * the coverage gate (vendor line 130) is dropped — entries still need at
 * least one matched token. Kept here so the vendor file stays byte-identical
 * (same reasoning as lever 4's double-scoring); if the vendor scorer is ever
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
 *     renderSignature and the 5d compaction wrapper.
 *  6. Any native docs/snippet/section weighting upstream grows — may
 *     supersede our kind-weight lever 2.
 */
const UNGATED_FIELD_WEIGHTS = { id: 12, name: 10, service: 8, description: 5, kind: 2 } as const;

type UngatedFieldScore = { score: number; matchedTokens: Set<string>; exactPhrase: boolean };

function scoreFieldUngated(
  query: string,
  queryTokens: string[],
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
// code must go through scoreEntryWeightedUngated, which layers the levers.
export function scoreEntryUngated(entry: ScorableEntry, query: string): number | null {
  const normalizedQuery = normalizeSearchText(query);
  const queryTokens = tokenize(query);
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
