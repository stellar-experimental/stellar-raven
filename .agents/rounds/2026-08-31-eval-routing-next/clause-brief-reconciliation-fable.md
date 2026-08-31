# Clause-brief reconciliation — Grok review of `implementation-brief-fable.md`

Date: 2026-08-31
Author: Claude Fable 5 high
Review: `.agents/rounds/2026-08-31-eval-routing-next/review-grok-clause-brief.md` (verdict BLOCK)
Repaired file: `.agents/rounds/2026-08-31-eval-routing-next/implementation-brief-fable.md`
Status: H1–H4, M1–M6, L1–L2 are reconciled in place. No model build ran. No paid call ran. No
shared ledger or production file changed.

| Issue | Severity | Disposition | Brief section |
| --- | --- | --- | --- |
| H1 | bug | Repaired. The base union is now `B = P5 ++ R`, where `R` is every remaining searchable entry with non-null `scoreEntryWeightedUngated`, ordered by ungated score descending then id ascending, using the exported scorers and a documented fixed projection. The union can hold every searchable entry, so the two limit-50-missing blind positives are reachable. The limit-50 incompleteness is recorded as evidence. | 2, 5 |
| H2 | bug | Repaired. The swap predicate is `fit(candidate) >= fit(preceding) + m` AND `fit(candidate) !== fit(preceding)`. Equal `fit` never swaps at any `m`, including `m = 0`. Exact-margin swaps stay valid for `m > 0` (test 14). | 6, 9.14–9.15, 9.18 |
| H3 | bug | Repaired. The "mirrors `interleaveSelectedPage`" sentence is deleted. The brief states that semantic hysteresis replaces the lexical 1.6× `TIER_INTERLEAVE_MARGIN` rule inside this experiment only, cites the `186 < 1.6 × 207` evidence, does not claim the inherited product condition is met, and leaves the production margin policy to the later product brief. | 1, 5, 6, 14 |
| H4 | bug | Repaired. Holdout acceptance is restored to top-1 ≥ 10, top-3 ≥ 22, top-5 ≥ 25, with at most 11 forbidden captures. The legacy band is stated as the integer ±3 hits. | 11 |
| M1 | suggestion | Repaired. Test 9.8 requires `scout.searchResearch` in `B` for all 19 frozen positives; test 9.9 checks no duplicates and backfill marking. Both must pass before the first artifact build (section 12 and the command order in section 10). | 9, 10, 12 |
| M2 | suggestion | Repaired. Counts are pinned as 373 raw splits and 343 after the `Returns:` drop; the clause estimate is about 680. | 2, 4 |
| M3 | suggestion | Repaired. The cache sentence now says `~/.cache/huggingface` exists and the pinned Qwen revision is absent from it and from both checkouts' transformers caches. | 2 |
| M4 | suggestion | Repaired. The six inspection ids are listed in the acceptance section. | 11 |
| M5 | suggestion | Repaired. `PARTIAL` is a ledger label only; the referee exits `1` unless a grid value passes the full table, and it prints exact positive misses per reading. | 10, 11 |
| M6 | suggestion | Repaired. The join is recorded as 26 matched searchable Scout operations; the four without `x-routing` (`scout.getChangelog`, `scout.getChanges`, `scout.getPartner`, `scout.matchPartners`) get description clauses only, are pinned in the artifact as `unmatchedScoutOps`, and get test 9.6. | 2, 3, 7, 9 |
| L1 | nit | Repaired. Section 13 names both review records: pre-implementation `review-grok-clause-brief.md` (reconciled) and post-implementation `review-grok-clause-fit.md`. | 13 |
| L2 | nit | Repaired. The brief records that clause scoring reuses the pinned card-level `QUERY_TASK` wording unchanged, and the artifact notes the reuse. | 4, 7 |

Preserved decisions, per the review's residual notes and the user's instruction:

- One fixed artifact build and one fixed referee run over the five pre-registered readings.
- The keyword exclusion stays and is not reversed after the first build.
- The frozen contracts stay acceptance data, never training data; no miss-driven clause edits.
- No hostile `searchCatalog` unit tests in this measurement; they move to the product-wiring brief.
- No production model call, no `src/` change, no paid QA arm, no cross-encoder in this attempt.

Next action: the bounded Grok delta review of sections 5, 6, 9, and 11. The model fetch and the
artifact build stay blocked until that delta review is PASS.

## Delta-review residuals — 2026-08-31

`review-grok-clause-brief-delta.md` returned PASS and left two record nits. R1 is repaired in
`implementation-brief-fable.md`. R2 needs no repair. No other file changed. No model fetch,
artifact build, or paid call ran.

| Issue | Severity | Disposition | Brief section |
| --- | --- | --- | --- |
| R1 | record nit | Repaired. Section 5 now says `B` holds `P5` plus every remaining searchable entry with a non-null ungated score. An entry with a null ungated score stays out of `B`. The delta review measured 19 of 19 frozen positives in `B`, with `|B|` at 79 or 78. | 5 |
| R2 | record nit | No repair required. The `name: entry.id` projection stays frozen and documented as not production-identical. Identity still returns the `P5` prefix, so calibration is safe. | 5 |

The delta review PASS closes the clause-brief BLOCK. It allows the offline membership tests, one
model fetch, and one artifact build under the brief's one-build stop. It allows no second clause
set, no second `m` grid, no `src/` change, no product commit, and no paid QA arm.
