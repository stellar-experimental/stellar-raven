# Independent pre-referee implementation review — `clause-support-fit-v1`

Date: 2026-09-01
Reviewer: Grok 4.6 high
Author: Codex GPT-5.6 Sol high (`implementation-sol.md`)
Orchestrator: the root agent that opened this worktree
Brief: `brief-fable.md` after `review-grok-hold-delta-2.md` (`PASS`)
Status: complete. Started from the final brief, then the two new files and `package.json`.
The retained score cache was not opened. No model was fetched. No model ran. The referee
did not run. This reviewer wrote only this file.

This review does not authorize the referee. It does not authorize a cache open.

## Verdict

**PASS**

The implementation matches sections 5 through 14. The noisy-OR fit, the negative rule, the
stable sort, the frozen union, and the cache identity checks are in the new referee. The
file hash runs on raw bytes before `JSON.parse`. The result `experiment` field is the
literal `clause-support-fit-v1`. The local `shouldFail` inspects the support-fit reading.
The top-level static import graph has no model loader. One `main()` writes one result.

The focused suite passed 18 of 18. No forbidden path changed.

Record the implementation commit in the ledger. Then the referee may run with that hash in
`RAVEN_SUPPORT_IMPLEMENTATION_COMMIT`.

## Evidence this review checked

All checks were free and offline. The cache was not opened.

| Check | Result |
| --- | --- |
| `HEAD` | `7c2c2857df1ed3696ec863eef3d2da80332c609c` (equal to `main`) |
| Tracked write set | `package.json` adds one script: `eval:vectorize:support:run` |
| New files | `eval/vectorize/run-support-fit.mjs`; `test/eval-vectorize-support-fit.test.mjs` |
| File SHA-256 | `fbc059e455f5685b2a3866e766462ef35a80aecc63ad346eceba663c1b3004b5`; `c2ee273d4c4682280ad6aff3c34c43d414e94459416687116a4437ab79af84b7`; `package.json` `01b850a3f15d32c452ee113c72f590769c33132ad6e6ced76046a6a41201d8d1` |
| Forbidden paths | no diff (`src/`, manifest, gates, frozen contracts, overlay, runners, attempt-one and attempt-two harness files, inventory) |
| `rerank-retrieval.mjs` | `26aa40f9d98f52684cc96c6f4bf28295c9d22a48a82d4e8ea285801522160116` |
| `run-rerank-fit.mjs` | `788a6df923c1ac844fc83b428bfe52a531cf1e134274a0d9e894adc34066487f` |
| Focused tests | 18 passed in 1.33s |
| Retained cache | not read |
| Referee / model / network | none |

## Section map

| Brief | Implementation |
| --- | --- |
| 5.3 formula | `noisyOr` then `supportFit`. `pos - max(0, neg - pos)`. Empty negative is `noisyOr([]) = 0`. No positive clause returns `Number.NEGATIVE_INFINITY`. |
| 5.3 numerics | Log-space sum of `log1p(-s)`. Exact `1` returns `1`. One input returns that input. Empty returns `0`. The return uses `-expm1(sum)`, which equals `1 - exp(sum)`. |
| 5.4 | No clause-count normalization. |
| 5.5 union | `buildCandidateUnion` and `pairIndexForBase` from `rerank-retrieval.mjs`. Tests 10 and 11 cover all 19 positives and all 32 frozen questions. |
| 5.6 order | `stableSortByFit` keeps base index on equal fits. Test 8 matches `applyRerankHysteresis(..., 0)` on 100 trials. Test 9 keeps `tier` and lexical `score`. |
| 5.7 readings | `identity` uses `base.slice(0, 5)`. `max-clause` uses `entryFitsFromPairScores`. `support-fit` uses `entrySupportFits`. No grid. |
| 6 cache identity | Byte SHA-256 before parse. Then `validateScoreCache({ questions, pairIndex })`, `scoresSha256`, record hash, and count 383,273. Pins match the attempt-two ledger. |
| 6 commit guard | `RAVEN_SUPPORT_IMPLEMENTATION_COMMIT` must be a 40-character `HEAD`. Checked before the cache path. |
| 7 calibrations | Identity then max-clause, both before the candidate reading. Throws the drifted field. No result file on throw. |
| 8 labels | `acceptance` is the full table. `outcomeFor` returns `PARTIAL` when gates pass and both control captures are 0. `shouldFail` is true unless the support-fit table passes. |
| 9 schema | Literal `experiment: "clause-support-fit-v1"`. Source experiment stays `cross-encoder-fit-v1`. Three readings. Calibration block. |
| 10 import proof | Static imports are config, retrieval, `run-rerank-fit.mjs` helpers, grade, labels, discovery, and Node built-ins. No `shouldFail` import from attempt two. `src/catalog/search.ts` loads only inside `main()`. `main()` is guarded by `process.argv[1]`. |
| 11 write set | Two new files and one package script. Forbidden files unchanged. |
| 12 tests | Eighteen numbered tests. This review re-ran them. All passed. |
| 13 command | `eval:vectorize:support:run` is `node eval/vectorize/run-support-fit.mjs`. `--dump-dir` is parsed. |
| 14 stop states | Cache or pin mismatch throws before `writeResult`. Calibration throw is the same. `PASS`/`PARTIAL`/`FAIL` write one result. `PARTIAL` and `FAIL` set `process.exitCode = 1`. |

## Formula and grouping

`entrySupportFits` buckets by `entryId` and `role` through `pairIndex`, the same way
`entryFitsFromPairScores` does. Only the fit function changes.

Test 6: two 0.5 positives and one 0.4 negative on `a` yield 0.75. An entry with only a
negative clause yields `Number.NEGATIVE_INFINITY`.

Test 5: `supportFit([0.5], [0.8])` is 0.2, which is `2 * pos - neg` when `neg > pos`.

Max-clause calibration uses the frozen helper, not a reimplementation of max.

## Cache-only safety

Test 12 walks `ImportDeclaration` nodes only. It starts at `run-support-fit.mjs`. It does
not follow `import()` or `require()`. The walked set has none of the five forbidden files.

Test 13 imports the referee in a child process with `RAVEN_RERANK_MODEL_DIR`,
`RAVEN_VECTORIZE_MODEL_DIR`, and `RAVEN_SUPPORT_CACHE_PATH` unset. The child exits 0.

`run-rerank-fit.mjs` still loads `rerank-scorer.mjs` only inside its own `main()`. That
`main()` does not run on import.

The referee never reads `RAVEN_RERANK_MODEL_DIR` or `RAVEN_VECTORIZE_MODEL_DIR`.

## One-referee accounting

One `main()` builds the three readings from one cache decode. There is no margin loop.
There is one `writeResult` to `eval/vectorize/results/`. The attempt-two cache directory is
not opened for write. `shouldFail` runs once on the support-fit reading.

No implementation commit exists yet. That is required by the sequence. This review does not
create it.

## Residual findings

None of these blocks the implementation handoff.

### R1 — Test 14 does not execute `main()` parse order

Severity: residual

The pre-parse byte hash lives in `main()`. Test 14 calls `assertRetainedCachePins` on
synthetic objects. The live parse order cannot run without the retained cache. The referee
will exercise it.

### R2 — Log-space return uses `-expm1`

Severity: residual

Section 5.3 writes `1 - exp(Σ log1p(-s))`. The code returns `-Math.expm1(logProduct)`.
The two forms are equal. `expm1` is the more stable form near zero. Tests 1 through 4 pass.

### R3 — `sourceEnvironment` copies the full cache environment

Severity: residual

Section 9 asks for `onnxruntimeNode` and `probeScoreSha256` under `sourceEnvironment`.
The result copies `cache.environment` as a whole. That object already holds those fields.

### R4 — The post-run cache-directory copy is not in `main()`

Severity: residual

Section 6 says the referee writes nothing under `~/.cache/stellar-raven/`. `main()` writes
only `eval/vectorize/results/`. The later copy into
`~/.cache/stellar-raven/eval-results/clause-support-fit-v1-<date>/` remains a closeout step.

## Next gate

Record the 40-character implementation commit in the round ledger.
Run the one referee with that commit and `RAVEN_SUPPORT_CACHE_PATH`.
Do not fetch a model. Do not score a pair. Do not write the attempt-two cache directory.
