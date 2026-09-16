# Independent runtime-code review (search/scoring optimization)

Reviewer: Grok high (Grok 4.6). Distinct from the runtime Sol author and the quality Sol author.
Clock: `2026-09-16T22:58:16Z`.
Mode: read-only. **No code or gate edits. Performance not accepted.**

Frozen: `/tmp/raven-execution-2026-09-16/scout-runtime-frozen`
Opt: `/tmp/raven-execution-2026-09-16/scout-runtime-opt`
Both `HEAD` `bb37bc502080c94c3f3b5223ffcdf584d4b0e29d` plus dirty catalog files.

This is **not** the merged quality candidate. It is **not** routing/release acceptance.

## Decision

**Behavior preservation for this optimization delta is supported** on the parent 544 full-page snapshot and by inspection of query prep, alias max, sort, filters, caches, and the full-page ungated skip.

**Do not accept performance.** Timing benchmarks are pending. Author JSON files exist under `/tmp/raven-execution-2026-09-16/scout-runtime-benchmark-*.json`. This review does not read them as evidence.

**Do not treat this as the upcoming quality merge.**

## Snapshot

| File | SHA-256 |
|---|---|
| `scout-runtime-frozen-544.json` | `4c87d391c8c7e69c3f5bcadf6e76302df9ef496ceb4bf34473ede5e45ebbc900` |
| `scout-runtime-optimized-544.json` | `4c87d391c8c7e69c3f5bcadf6e76302df9ef496ceb4bf34473ede5e45ebbc900` |

Byte-identical. 8,177,524 bytes. `{ count: 544, pages }` keyed by case id.

Each page is `{ lane, question, page: SearchPage }`. `SearchPage` includes `hits`, `total`, `truncated`, `effectiveLimit`, `widerCandidates`, `confidence`, and `recoveryMetadata`.

Snapshot script (`search-runtime-snapshot.mjs`) calls `searchCatalogPage(catalog, { query: row.question, limit: 5 })` only.

| Lane | n |
|---|---:|
| legacy | 338 |
| extended | 122 |
| holdout | 49 |
| skills | 23 |
| protocol-positive | 8 |
| protocol-control | 4 |

All 544 pages have `effectiveLimit: 5` and 5 hits. 123 pages carry `widerCandidates`.

Supporting hashes (not the acceptance oracle):

| File | SHA-256 |
|---|---|
| frozen-ranked.json | `5872b554c0ed0efbf2e756d44ad655914db732fbac0986d4316756d844fb33ed` |
| optimized-ranked.json | `5872b554c0ed0efbf2e756d44ad655914db732fbac0986d4316756d844fb33ed` |

Routing JSON files differ only in `ranAt` (`2026-09-16T22:38:43.109Z` vs `2026-09-16T22:52:00.467Z`). After time-key strip they are equal. Manifest SHA-256 `bc91f286b8c750a7c551253a84840d2c8e2634fb9e86db939f93b1eb13a5d361`. Overall 218/298/327, cardHit5 113 on both.

The 544 snapshot does **not** exercise `kind`, `service`, or limits other than 5. Those paths are code inspection only.

## Delta scope

User asked for `search.ts` / `scoring.ts` only. Catalog files that differ between the two trees:

| File | Frozen lines | Opt lines | Frozen SHA-256 | Opt SHA-256 |
|---|---:|---:|---|---|
| `src/catalog/search.ts` | 1333 | 1431 | `bc9e38781ad447cb…` | `d2c7ff3d730b316f…` |
| `src/catalog/scoring.ts` | 527 | 580 | `8e28959b6be4c173…` | `1a861e604c71f20e…` |
| `src/catalog/skill-search-admission.ts` | 114 | 119 | `12985cda6f70fd4a…` | `6c26fb77db5663db…` |

`types.ts` and `extract-routing-phrases.ts` are dirty vs `HEAD` in **both** trees and **identical** between trees. They are quality-lane files already in frozen. They are not part of this optimization delta.

Vendor `search-scoring.ts` SHA-256 `718924d10533ea49d472602f600ece0e4d7a0aae3e9e0ca5a95d9a8c6e611b14` on both trees.

`test/` has no file diff between trees.

The third file is a **passthrough adapter**: `admitsWholeSkill(entry, query, preparedQueryTokens?, preparedAliasTokens?)` uses `tokenize` / `prepareAliasQuery` when omitted. Search now passes `query.scoring.original.tokens` and `query.aliasTokens`. That is required so skill admission does not retokenize. It is not a new admission rule.

## Query prep and alias equivalence

`STOPWORDS` and `QUERY_TOKEN_ALIASES` are byte-equal between trees.

Frozen: each entry tokenizes `opts.query`, calls `prepareAliasQuery(opts.query)`, `rejectsRoutingIntent(entry, opts.query)` which re-tokenizes to unique content tokens (`length ≥ 2`, not stopwords), and `scoreEntryWeighted(entry, opts.query)` which may `canonicalizeQuery` + tokenize again.

Opt: `prepareSearchQuery` once per `searchCatalogPage`:

- `prepareScoringQuery(query)` → `{ original, canonical }`
- `aliasTokens = prepareAliasQuery(query)`
- `contentTokens = scoring.original.contentTokens`

`prepareQueryForm` content tokens are unique `tokenize`, `length ≥ 2`, not `STOPWORDS` — the same set frozen `rejectsRoutingIntent` built from the raw string.

`rejectsRoutingIntent` now takes those prepared tokens. The rest of the rule is unchanged: published exclusions, negativeCoverage vs positiveCoverage, enum witnesses, dense vocabulary witness, identity overlap.

`scoreEntryWeighted(entry, query, prepared)` defaults to `prepareScoringQuery(query)` so other callers stay equivalent. Page scoring passes the prepared object.

Alias path still `max(original, canonical)` above `weightedScore`. Queries with no alias token keep `canonical: null` and the original pipeline only.

Vendor `scoreEntry` still receives the raw query string (`gatedEntryScorer` → `scoreEntry(entry, query.query)`). Ungated uses `prepared.tokens`, which equals `tokenize(prepared.query)`.

`effectiveQuery` remains exported. Rescue still runs on the stopword-stripped form when that form differs.

## Sort, service, kind, limit

`scoreCandidates` still:

- skip `searchable === false`
- filter `opts.kind` / `opts.service`
- sort `score desc`, then `id asc`

`searchCatalogPage` still clamps `limit` with `Number.isFinite` to `[1, MAX_SEARCH_LIMIT]`, default `DEFAULT_SEARCH_LIMIT` (10) on non-finite. `MAX_SEARCH_LIMIT` remains 50.

`serviceQuota` remains `Math.max(2, Math.ceil(limit * 0.4))`. `diversifyByService` is unchanged.

Kind `skill` still skips wider candidates. Nested service-filter skill advisories still recurse with `{ kind: "skill", service: "skills", limit: 3 }`.

Opt `mergeCandidates` is a two-list merge of already sorted gated + backfill arrays. It matches frozen `[...gated, ...backfill].sort(score desc, id asc)` when those lists have no shared ids. Shared ids are dropped from backfill in both trees.

## Full-page ungated skip

This is the only non-hoist control-flow change.

Frozen always scores the full ungated catalog, then drops gated ids.

Opt, when the diversified gated page is already full, scores only entries that `fullPageUngatedAdmission` keeps:

1. not already gated
2. `preservesCompleteStructuredIntent` or `preservesVocabularyIntent` (the `preserveIntentWithinServiceQuota` replacements)
3. or service count on the selected page is below quota **and** `intentCoverage` beats at least one overflow victim (`index > 0` and service count `> quota`) — the `preserveStrongBackfill` replacements

Short pages still score the complete ungated pool, because that pool defines membership and `total`.

`total` on a full gated page remains `gated.length` in both trees. The 544 snapshot includes `total` and `truncated`, and the files match.

`preserves*` does not read `candidate.score`. The `{ entry, score: 0 }` dummy in admission cannot change those predicates.

A later third replacement rule that does not update this filter could drop a live swap. That is a maintenance risk, not a current page bug.

## Caches and cross-request state

| Cache | Key | Bound | Reload |
|---|---|---|---|
| `joinedKeywordsCache` | `WeakMap` on `entry.keywords` **array identity** from the parsed manifest | GC | New manifest → new arrays → miss |
| `servicesCache` | `WeakMap<Catalog, …>` | GC | Reloaded catalog object misses |
| `canonicalizeCache` | `Map<string, string \| null>` raw query | size > 500 → **clear all** | Query-only; not catalog-keyed |

There is **no** `preparedQueryCache`. `prepareScoringQuery` runs once per `searchCatalogPage` via `prepareSearchQuery`. Other callers recompute. `canonicalizeQuery` remains the only query-string `Map`.

No cache stores catalog entries or scores. A 500-query clear cannot mix answers: each page holds its `prepared` local. JS is single-threaded per isolate. Isolate-global canonicalize values are a pure function of the query string. Stale **cross-request** catalog state is not present.

Module-level `Map`s grow with unique query strings until 500, then drop everything. That can add GC churn, not wrong ranks.

## Behavior vs quality lane

This delta hoists repeated tokenize/canonicalize/join work and skips ungated scores that cannot enter a full page. It does not change `notFor`, dense vocabulary witness, or exclusion policy. The 544 snapshot equality is the behavior proof for unfiltered `limit: 5` pages, including `widerCandidates`.

Kind / service / other limits rest on the same filters and clamp, plus the admission skip’s closed form of the two replacement rules.

## Not accepted

- Runtime timing / CPU / Worker CPU
- Quality residuals (stablecoins exclusion-overlap, Soroswap split-phrase, Blend source-capability)
- Gate / fingerprint / RWA exposure / #141 close
- Merging this snapshot into the quality candidate without a later integration review
