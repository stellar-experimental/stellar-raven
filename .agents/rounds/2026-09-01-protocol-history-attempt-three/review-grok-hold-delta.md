# Bounded delta review — repaired `brief-fable.md`

Date: 2026-09-01
Reviewer: Grok 4.6 high
Source review: `review-grok-hold.md` (verdict `BLOCK`)
Reconciliation: `brief-reconciliation-fable.md`
Repaired file: `brief-fable.md`
Scope: B1–B3 and R1–R4, plus the new measurement contract.
The new contract is the decision, the evidence claims, the mechanism, the cache proof, the tests, the stop states, the triggers, and the ASD repair.
Status: complete. No model was fetched. No model ran. No paid call ran. No network call ran.
The retained score cache was not read. This reviewer wrote only this file.

This delta does not authorize implementation, a cache open, or a referee.

## Verdict

**BLOCK**

B1 through B3 and R1 through R4 are repaired in substance.
The selected mechanism is Terra family 3 with one pinned aggregate.
The noisy-OR math, the `m = 0` sort, the union, and the cache pins match the frozen helpers.

Test 12 does not.
It walks every relative specifier under `eval/` from the referee module.
That graph includes `run-rerank-fit.mjs`.
That file contains `import("./rerank-scorer.mjs")` and `require("onnxruntime-node/package.json")` inside `main()`.
A faithful walk then contains a forbidden module.
The cache-only proof in section 10 already limits the check to top-level static imports.
Test 12 must say the same thing, or it cannot pass.

Repair that sentence. Then run one bounded delta of that repair only if the author also changes any other contract line.

## Evidence this review checked

All checks were free, offline, and read-only. No dependency was installed. The cache was not opened.

| Check | Result |
| --- | --- |
| `HEAD` | `7c2c2857df1ed3696ec863eef3d2da80332c609c` (equal to `main`) |
| Dirty paths | untracked round ledger and round directory only |
| `git diff --stat 1bfb983 HEAD` over protected paths | empty |
| Gated input hashes | equal `eval/gates.json` |
| Clause artifact SHA-256 | `e5f86644af89158c3ac4d61ee7f651e2a062c9d292f194cb94872c7eee4e71f4` |
| `clause-config.mjs` / `run-rerank-fit.mjs` / `rerank-config.mjs` | equal the section 2 pins |
| `rerank-retrieval.mjs` SHA-256 | `26aa40f9d98f52684cc96c6f4bf28295c9d22a48a82d4e8ea285801522160116` (not in section 2) |
| `loadClauseSource()` | 683 clauses; 608 positive; 75 negative; 79 entries |
| Target clause counts | 25 positive (1 purpose, 9 `useWhen`, 6 `exampleQuestion`, 7 description, 2 workflow); 2 `notFor` |
| Positive-count spread | min 2; median 6; mean 7.70; max 25; 25 entries have a negative clause |
| Next entries by positive count | `scout.searchProjects` 21; `scout.analyzeEcosystem` 19; `scout.getBuilders` 19; `lumenloop.search_content_semantic` 18; `scout.searchRepos` 18 |
| QA inventory | 76 battery files with `scout.searchResearch` in `surface`; compact `JSON.stringify` SHA-256 `c88940063e3306f6afa279e9f004a0824fd9de5c674895aa98c09a657008e17a`; extra file `q-hist-yieldblox-v2-2026-exploit` |
| Appendix A SHA-256 | `7a30222b9f7ad215de8e06286d18865d4006803d0400419020018ae93edea0b7`; header names the strict rule |
| `applyRerankHysteresis` at `m = 0` | insertion sort by descending fit; equal fits do not swap |
| Noisy-OR checks | `[0.5]→0.5`; `[0.5,0.5]→0.75`; `[]→0`; any `1→1` |
| `m = 0` versus a stable descending sort | 50 synthetic trials, 0 mismatches |
| `run-rerank-fit.mjs` scorer load | `await import("./rerank-scorer.mjs")` inside `main()` only |
| `main()` guard | `process.argv[1]` equals this module URL; import does not run `main()` |
| Retained cache | not read |
| Network / npm / model | none |

## Original issue status

| Issue | Status | Evidence |
| --- | --- | --- |
| B1 | repaired | Section 3.2 measures token reachability only. It names pair scores, embeddings, and rank as unmeasured. The "cannot rank" sentence is gone. `archival` and `clawback` are a lexical ranking conflict. Section 4 does not dispose of family 3 by overlap. |
| B2 | repaired | Section 3.1 calls the readings "pure max-clause". It says they bound two models under one fit rule. The word "ceiling" is gone. The best blind top-five is 4/11 at attempt-one `m = 0.03` and `m = 0.06`. Identity and the grids missed eight ids. Pure max-clause rescued `phb-auditor-auth-recursion-follow-up` and missed `phb-auth-recursion-auditors`. The intersection is the seven listed ids. Appendix B labels the rescued case. |
| B3 | repaired | Section 4 marks family 3 distinct, general, free, and selected. Section 5 registers one aggregate with no grid and no hysteresis. Section 1.2 keeps the clause-count prediction as risk P2, not as a hold. T3 no longer spends attempt three on family 3. |
| R1 | repaired | Section 2 pins the 76-file `surface` rule, the compact-JSON sorted-id hash, the extra file, and the 500-file battery. Section 6 restates 495 = 338 + 122 + 23 + 8 + 4, then holdout 49 and blind 20. T3 names endpoints, request count, and byte budget. It needs an owner decision for a new box. |
| R2 | repaired | Section 1.1: this brief spends no attempt. The one referee spends attempt three. Until then the slot stays unused and reserved. Section 14: `BLOCKED-*` does not spend the slot. `PASS`, `PARTIAL`, and `FAIL` do. The ledger outcome repeats this. |
| R3 | repaired in substance | The brief was rewritten. Remaining over-length lines are lists, formulas, and path catalogs, not the hold claims from the source review. |
| R4 | repaired | Appendix A header names the strict rule. The new hash matches the fence. Section 17 points at 3.2, the appendices, and `review-grok-hold.md`. It does not claim the raw console output lives in the ledger. |

## What holds in the new mechanism

These parts match the frozen helpers and do not need repair.

- Decision. `clause-support-fit-v1` is cache-only. It loads no model. It scores no pair. It spends attempt three only on the one referee.
- Score. `pos = 1 - Π (1 - s)` over positive clauses. `neg` uses the same product, or 0 when `N(e)` is empty. `fit = pos - max(0, neg - pos)` is the attempt-two combination. Log-space `1 - exp(Σ log1p(-s))` is the right numeric form. Any exact `1` saturates to `1`. One clause returns that clause. Empty returns `0`. No positive clause returns `Number.NEGATIVE_INFINITY`.
- Negative rule. The combination is unchanged. Both aggregates move from max to noisy-OR. That isolates aggregation. Section 3.5 and P2 disclose the clause-count flood before the run. No clause-count normalization is registered.
- Ordering. `applyRerankHysteresis(B, fits, 0)` is a stable descending insertion sort. Ties keep base order. Test 8 locks equality with `stableSortByFit`. Tier and lexical `score` stay on the same objects.
- Union. Section 5.5 restates `buildCandidateUnion` in `rerank-retrieval.mjs`: `P5` at limit 5, then ungated remainder by ungated score descending and `id` ascending, with the frozen projection. `pairIndexForBase` is strictly increasing in artifact order. `validateScoreCache(..., { questions, pairIndex })` aborts on mismatch.
- Cache identity. File hash `fa1252fc…`, `scoresSha256` `44c27468…`, record hash `ecea4c69…`, 563 queries, 383,273 scores, experiment `cross-encoder-fit-v1`, and `batchSize` 16 match the attempt-two ledger and `validateScoreCache`.
- Calibrations. Identity must match `gates.json` and the frozen 4/8, 1/4, 3/11, 6/9 baselines. Max-clause must match the attempt-two pure reading, including the eight blind misses, the four blind captures, and 495 changed rankings. Both abort before the candidate reading.
- Labels. `PASS` needs the full section 8 table. `PARTIAL` needs zero control captures and intact routing gates. `PARTIAL` and `FAIL` exit `1` and spend the attempt. There is one candidate reading. There is no grid selection.
- Schema. Three named readings, source cache hashes, miss and capture lists, 495-row diffs, six inspection ids, and a calibration block.
- One referee. One cache path. One result file. No second aggregate, margin, or rerun for a miss. `BLOCKED-ASSETS` and `BLOCKED-CALIBRATION` do not spend the attempt.
- Triggers. T3 is now a later non-card box. It pins the 76-case derivation and the 495-row set.

## Blocking finding

### D1 — Test 12 contradicts the cache-only import proof

Severity: blocking

Section 10 says the referee imports `run-rerank-fit.mjs` for `validateScoreCache`, `scoreCacheRecordSha256`, `decodeFloat32Scores`, `loadRefereeInputs`, and `buildRefereeDataset`.
That module does not import the scorer at top level.
`main()` is the only caller of `import("./rerank-scorer.mjs")`.
`main()` also calls `require("onnxruntime-node/package.json")`.
Import of the module does not run `main()`. That part is true.

Test 12 does not stay at top level.
It "follows every relative specifier under `eval/`".
`run-rerank-fit.mjs` is in that graph.
A walk of its specifiers includes `./rerank-scorer.mjs`.
The same walk can treat `onnxruntime-node` as a bare specifier.
The test then fails on a correct referee.

Section 10 already has the right rule: top-level static imports only; `main()` does not run on import.

Repair: state Test 12 as a walk of static `import` declarations only.
The walk must not follow `import()` or `require()` inside `main()`.
The forbidden set stays `rerank-scorer.mjs`, `embedder.mjs`, the two preflight files, the fetch file, `@huggingface`, and `onnxruntime`.

Do not change the score function, the union, the cache pins, or the acceptance table.

## Residual findings

### D2 — Name a new `shouldFail`; do not import the attempt-two export

Severity: residual

`run-rerank-fit.mjs` exports `shouldFail`.
That function looks for `readings[].role === "grid"`.
This experiment has no grid reading.
Importing that export would treat a true `PASS` as a failing process.

Test 18 already requires the support-fit behavior.
Section 11 does not list `shouldFail` among the new functions.

Repair in the same pass: add `shouldFail` to section 11.
It inspects the support-fit reading only.
`PARTIAL` still returns `true`.
Do not import `shouldFail` from `run-rerank-fit.mjs`.

### D3 — The import list omits `src/catalog/search.ts`

Severity: residual

`buildCandidateUnion` needs `searchCatalog` and `loadManifest`.
Attempt two loads them with a dynamic import of `src/catalog/search.ts`.
Section 10's import list does not name that file.
The file is lexical. It is not a model loader.
Test 12 stays under `eval/`, so it would not see this import.

Repair: name the dynamic import in section 10.
Keep it out of the forbidden graph.

### D4 — `rerank-retrieval.mjs` is unpinned in section 2

Severity: residual

The union, `clauseFit`, `pairIndexForBase`, and `applyRerankHysteresis` live in this file.
Section 11 forbids edits to it.
Section 2 hashes `rerank-config.mjs` and `run-rerank-fit.mjs` and does not hash this file.

Live SHA-256: `26aa40f9d98f52684cc96c6f4bf28295c9d22a48a82d4e8ea285801522160116`.

Repair: add that hash to section 2.

### D5 — Result `experiment` must not use the imported `EXPERIMENT` constant

Severity: residual

`rerank-config.mjs` exports `EXPERIMENT = "cross-encoder-fit-v1"`.
The cache must keep that value.
The result file must use `clause-support-fit-v1`.

Repair: say the result field is the literal string. Do not write `EXPERIMENT` into the result.

### D6 — The sigmoid is not a calibrated probability

Severity: residual

Section 5.3 calls noisy-OR "the probability that at least one clause is relevant".
The cached values are sigmoid logits from attempt two.
They are not calibrated probabilities.
The formula is still a valid monotone support aggregate.

Repair: call it a support-growing transform under an independence assumption.
Keep the formula.

## Required repair

The author must patch Test 12 as in D1.
Apply D2 through D5 in the same pass. They are one-line pins.

Do not change a protected path.
Do not fetch a model.
Do not open the retained cache.

Then request one bounded delta of the repaired test and import lines.

## What this review does not authorize

Implementation of `eval/vectorize/run-support-fit.mjs` does not start.
The referee does not start.
Closeout does not start.
