# Independent pre-implementation review — clause-fit brief

Date: 2026-08-31
Reviewer: Grok 4.6 high
Author: Claude Fable 5 high (`implementation-brief-fable.md`)
Orchestrator: Claude Fable 5 high
Reviewed file: `.agents/rounds/2026-08-31-eval-routing-next/implementation-brief-fable.md`
Status: complete. No model build ran. No code, brief, or shared ledger changed.

## Verdict

**BLOCK**

Do not implement this brief as written. Do not build the clause artifact yet.

The candidate union cannot reach two frozen blind positives. The swap rule contradicts the tie rule. The policy does not preserve `TIER_INTERLEAVE_MARGIN`. The holdout gate is weaker than `eval/gates.json`.

The measurement-only boundary is sound. The frozen contracts stay the right acceptance test. Repair the blocking issues, then run a bounded delta review.

## Evidence this review checked

All checks were free and read-only. The model build did not run.

| Check | Result |
| --- | --- |
| `HEAD` | `1bfb9838491fa571166a2a631789a3b0e814980c` |
| Searchable manifest entries | 79: 18 Lumenloop, 30 Scout operations, 12 Docs, 19 skills |
| Existing vector artifact cards | 72. Live adds 8 ids. Artifact still has `scout.partnerOnboard`. |
| Pinned runtime | `@huggingface/transformers@4.2.0` in `package.json` and the artifact |
| `MAX_SEARCH_LIMIT` | 50 in `src/catalog/search.ts` |
| `TIER_INTERLEAVE_MARGIN` | 1.6, multiplicative, backfill versus gated only |
| Backfill rule | runs only when the diversified gated page is shorter than `limit` |
| Matched Scout `x-routing` | 26 searchable ops; 103 `useWhen`, 73 examples, 75 `notFor` |
| Description sentences | 373 raw splits; 343 after the `Returns:` drop |
| Frozen question leak into `x-routing` | 0 exact or substring matches |
| `~/.cache/huggingface` | directory exists; pinned Qwen revision is absent |
| Transformers package cache | absent in both checkouts |

`searchCatalog` on the 32 frozen questions, limit 5 and limit 50:

| Slice | `scout.searchResearch` in P5 | in U50 |
| --- | ---: | ---: |
| Original positives (8) | 4 | 8 |
| Blind positives (11) | 3 | 9 |
| Original controls (4) | 1 | 4 |
| Blind controls (9) | 6 | 9 |

U50 misses `phb-archival-defect-network-upgrade` and `phb-network-upgrades-reasons`. Both are required for 11/11. `total` is 79 and `truncated` is true. `searchCatalog` cannot return more than 50 hits.

## Candidate-union completeness

Section 5 builds `B = P5 ++ (U50 without P5 ids)`.

That is the production page at limit 50. It is not the Sol union of gated hits plus a bounded ungated set before the page slice.

`searchCatalogPage` backfills only when gated membership is short of `limit`. At limit 50, many queries still fill 50 slots and drop later ungated ids. Diversity then drops more.

The two missing blind positives never enter `B`. Hysteresis cannot rank an id that is absent.

Identity at `m = Infinity` still returns P5. Calibration can pass while the experiment cannot reach 11/11.

`scoreEntryWeighted` and `scoreEntryWeightedUngated` are already exported from `src/catalog/scoring.ts`. The complete union does not need a `src/` change. Iterate every searchable entry. Keep P5 as the first five. Append every remaining id in a documented ungated order.

Add a test: every frozen positive has `scout.searchResearch` in `B`.

## `TIER_INTERLEAVE_MARGIN` and score combination

Production interleave is not the brief's swap pass.

Production rule:

- Only a `backfill` hit moves.
- It swaps only across adjacent `gated` hits.
- It moves when `backfill.score >= 1.6 * gated.score`.
- Same-tier order stays fixed.

Brief rule:

- Any later candidate may bubble left.
- The score is semantic `fit`, not lexical `score`.
- The margin is additive `m` on cosine.
- Tier labels travel but do not constrain movement.

Section 6 says the pass "mirrors `interleaveSelectedPage`". That claim is false.

Lexical 1.6× cannot recover Protocol 24. Sol recorded ungated 186 against gated 207. `186 < 1.6 × 207`. A measurement that keeps lexical 1.6× cannot fix the defect.

The experiment may replace lexical 1.6× with semantic hysteresis. The brief must say that. A later product brief must say how production will treat the margin. Do not claim the inherited product gate is already met.

`fit = pos - max(0, neg - pos)` matches tests 7–9. That formula is clear.

The swap predicate is not. Section 6.2 swaps while `fit(candidate) >= fit(preceding) + m`. Section 6.3 and test 14 keep base order on equal `fit`. At `m = 0`, `>=` swaps equals. Repair: swap while `fit >= fit(prev) + m` and `fit !== fit(prev)`.

## Artifact reproducibility

The new artifact path, model pin, `q8` vectors, and `requireCatalogMatch` split match the existing harness. Keep them.

Known risk: the 2026-07 README records a prior rebuild with mean cosine about 0.90 and zero identical vectors. Record `node -v`, `onnxruntime-node`, and `process.platform` as planned. A second build is only for mechanical failure. That stop is correct.

Section 2 says the Hugging Face cache is absent. `~/.cache/huggingface` exists. The pinned Qwen revision is not in it. The first build still needs one network fetch. Say that exactly.

Section 2 counts 372 description sentences. The split rule yields 373 raw pieces and 343 after `Returns:` drops. The ~700 vector estimate used the raw count. After the drop, expect about 620 clauses plus workflow lines.

The loader must hash live `catalog/manifest.json` and `inventory/stellar-light.json`. Four searchable Scout ops have no inventory `x-routing`: `scout.getChangelog`, `scout.getChanges`, `scout.getPartner`, `scout.matchPartners`. They get description clauses only. Record that.

## Case leakage

The builder reads catalog ids, Scout `x-routing` prose, descriptions, and workflow shapes. It does not read frozen case files for scoring. That is the right boundary.

No frozen question equals or sits inside an `x-routing` string.

Test 6 is necessary. Keep it. Header text uses catalog entry ids, not `ph-*` ids.

`scout.searchResearch` `useWhen` names protocol history, incidents, and post-mortems. That is upstream routing data. It is not case copy.

Do not add frozen questions, classes, or goldens to any clause, test fixture name, or policy constant.

## Selection overfitting

The three `m` values are pre-registered. That is acceptable.

Do not add more `m` values after the first referee run. Section 12 already forbids that. Keep it.

Choosing the passing grid value with the fewest 495-case changes is a conservatism rule. It is not per-case tuning. Keep the larger-`m` tie break.

The frozen contracts remain acceptance data. They are not training data. Do not inspect a miss and then change clause sources.

## No-production boundary

Agree. Touch only `eval/vectorize/`, two `package.json` scripts, and the two README pointers.

Do not edit `src/`, the manifest builder, `eval/gates.json`, or the frozen JSON contracts.

`eval/vectorize/results/` is gitignored. Result JSON stays local. The clause artifact is committed, like the existing 72-card file.

This experiment is not a product commit. A PASS only banks a measurement. Production wiring needs a later brief.

## Build feasibility

The pinned embedder, model id, revision, and runtime exist. A first fetch of revision `c25a394dd583836952667c12f008335071b3f43d` is required.

Do not run that fetch until this BLOCK is repaired. The user forbade the model build for this review.

`npm ci`, placeholder `.dev.vars`, and `typegen` match `AGENTS.md`. Keep them.

Two fetch attempts is a fair stop. Record a fetch failure in the ledger and stop.

## Test completeness

Tests 1–5, 7–9, 10, 12, 13, and 15 match the harness style. Keep them offline with synthetic vectors.

Missing tests that would have caught H1 and H2:

- Every frozen positive has `scout.searchResearch` in `B`.
- Equal `fit` does not swap at `m = 0`.
- Coverage-failed hits keep `tier: "backfill"` after a successful swap.

Hostile `searchCatalog` tests belong in a later product-wiring brief. Sol placed them after a passing measurement. That deferral is acceptable here.

Test 17 only checks `shouldFail`. The referee must still print exact positive misses so a `PARTIAL` can be labeled.

## Exact acceptance

Required ship numbers stay 8/8, 0/4, 11/11, and 0/9. Agree.

Legacy must use the `gates.json` ±1% band. For `n = 338` that band is 3. State the integer band.

Skills top-1 floor 16 matches `gates.json`. Agree.

Holdout in section 11 requires only top-5 and at most 11 forbidden captures. `eval/gates.json` and the 2026-08-30 product gate require 10/22/25 and at most 11 captures. Restore top-1 and top-3.

Extended floors 90/109/117 and accept-either 122/122 match Sol and the companion plan. Keep them.

`q-protocol-version-history-list` must stay strict top-1 `stellarDocs.search_protocol_concepts_docs`. Keep it.

Name the six inspection cases. They are:

- `q-protocol-24-whisk-incident`
- `q-protocol-version-history-list`
- `q-pc-protocol-upgrade-timing`
- `q-sor-p23-auto-restore-extendto`
- `q-sor-x-ray-bn254-sdk-gap`
- `q-ti-run-tune-own-horizon`

Identity must reproduce the current failing diagnostics: 4/8, 1/4, 3/11, 6/9, and the routing gate totals. The brief already requires that. Keep it as a hard abort.

`PARTIAL` is a ledger label. The referee still exits 1 unless a grid value meets the full table. Say that.

## Actionable issues

### H1 — Severity: bug — candidate union is incomplete

U50 misses two blind positives. `MAX_SEARCH_LIMIT` is 50. `searchCatalog` cannot form a complete union.

Repair: build `B` from P5 plus every remaining searchable id. Use exported ungated scoring. Add a membership test for all 19 frozen positives.

### H2 — Severity: bug — swap predicate fights the tie rule

`>= m` at `m = 0` swaps equal `fit`. Section 6.3 and test 14 forbid that.

Repair: swap only when `fit >= fit(prev) + m` and `fit !== fit(prev)`. Keep exact-margin swaps for `m > 0`.

### H3 — Severity: bug — the pass does not preserve `TIER_INTERLEAVE_MARGIN`

The additive cosine swap is not `interleaveSelectedPage`. Lexical 1.6× cannot recover the named defect.

Repair: delete the "mirrors" sentence. State that this measurement replaces lexical 1.6×. Leave production margin policy to a later brief.

### H4 — Severity: bug — holdout acceptance is weaker than the gate

Section 11 drops holdout top-1 and top-3.

Repair: require holdout 10/22/25 and at most 11 forbidden captures.

### M1 — Severity: suggestion — no union membership test

Without H1's test, a later edit can drop the two ids again.

Repair: add the membership test before the first build.

### M2 — Severity: suggestion — sentence-count pin is wrong

Section 2 uses 372. The section 4 drop yields 343.

Repair: pin the count after the drop, or call 372 an unfiltered estimate.

### M3 — Severity: suggestion — model-cache sentence is inexact

`~/.cache/huggingface` exists. The pinned revision does not.

Repair: say the revision is absent, not that the cache directory is absent.

### M4 — Severity: suggestion — six inspection cases are unnamed in acceptance

Section 10 mentions six cases and does not list them.

Repair: list the six ids in section 11.

### M5 — Severity: suggestion — `PARTIAL` versus process exit

The referee exits 1 unless a grid value fully passes. `PARTIAL` is only a ledger label.

Repair: print exact positive misses and state that exit 1 still applies.

### M6 — Severity: suggestion — four Scout ops lack `x-routing`

They still need description clauses. The join rule is `scout.<operationId>` in the searchable set.

Repair: record the four ids and the 26 matched ops.

### L1 — Severity: nit — post-implementation review path

Section 13 names `review-grok-clause-fit.md`. This pre-implementation file is `review-grok-clause-brief.md`. Keep both names.

### L2 — Severity: nit — `QUERY_TASK` still says "routing card"

Reusing the pin is valid. Record that clause scoring uses a card-level instruction.

## Residual non-blocking notes

Keyword exclusion is a pre-registered choice. Sol Stage A kept per-clause keywords. The brief drops them to avoid flat aggregation. Do not reverse that after the first build.

A later product brief still needs the nine hostile `searchCatalog` tests. Not this measurement.

No paid QA arm belongs here. Agree.

No Vectorize binding, Workers AI binding, or `src/` model call belongs here. Agree.

## Required repairs before implementation

Must fix: H1, H2, H3, H4, M1.

Should fix: M2, M3, M4, M5, M6.

After those repairs, a bounded delta review of sections 5, 6, 9, and 11 is enough. Do not start the model fetch until that delta review is PASS.
