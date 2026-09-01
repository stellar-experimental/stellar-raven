# `clause-support-fit-v1` implementation

Date: 2026-09-01
Author: Codex GPT-5.6 Sol high
Status: complete

## Outcome

The cache-free implementation is complete.
It implements the reviewed section 11 contract.
It adds all 18 section 12 tests.
The referee did not run.
The retained score cache did not open.
No model loaded or fetched.
No network or paid work ran.

## Files

- `eval/vectorize/run-support-fit.mjs` is new.
- `test/eval-vectorize-support-fit.test.mjs` is new.
- `package.json` adds `eval:vectorize:support:run`.
- `.agents/rounds/2026-09-01-protocol-history-attempt-three/implementation-sol.md` is this report.

The implementation changed no other tracked file.
The existing round files were present before this lane.

File SHA-256 values:

| Path | SHA-256 |
| --- | --- |
| `eval/vectorize/run-support-fit.mjs` | `fbc059e455f5685b2a3866e766462ef35a80aecc63ad346eceba663c1b3004b5` |
| `test/eval-vectorize-support-fit.test.mjs` | `c2ee273d4c4682280ad6aff3c34c43d414e94459416687116a4437ab79af84b7` |
| `package.json` | `01b850a3f15d32c452ee113c72f590769c33132ad6e6ced76046a6a41201d8d1` |

## Contract implementation

The implementation keeps the registered noisy-OR formula.
It computes the aggregate with `log1p` and `expm1`.
An exact score of `1` returns `1`.
An empty aggregate returns `0`.

The negative rule remains `pos - max(0, neg - pos)`.
An entry without a positive clause returns `Number.NEGATIVE_INFINITY`.
The support reading uses a stable descending sort.
Equal fits keep the base order.

The candidate union uses `buildCandidateUnion` without changes.
The pair index uses `pairIndexForBase` without changes.
The max-clause calibration uses `entryFitsFromPairScores`.

The cache file SHA-256 pin is `fa1252fc8bfbf62b6f69bb8ca431cf603d2b512e4d0299b2ca0de0d7c2cec0bc`.
The score SHA-256 pin is `44c274680cd324d00aa16d240e21d3260005766d507a430e93c423e9c16fcd55`.
The record SHA-256 pin is `ecea4c6981eb22a59d59b4b9434cad57732309e28504574e7ed483a01512fca1`.
The implementation also pins 563 queries and 383,273 scores.

The file hash check runs before JSON parsing.
The score cache validator pins the complete attempt-two cache shape.
The identity calibration runs before the max-clause calibration.
Both calibrations run before the support reading.

The result uses the literal `clause-support-fit-v1` experiment name.
It writes the three registered readings only.
It preserves the reviewed result schema.
The local `shouldFail` recomputes the full support acceptance table.
`PARTIAL` and `FAIL` return a failing process status.

The top-level static import graph contains no model loader.
The one catalog import remains dynamic inside `main()`.
Module import succeeds when `RAVEN_SUPPORT_CACHE_PATH` is unset.
The command requires the cache variable only during `main()`.

## Tests

`test/eval-vectorize-support-fit.test.mjs` contains exactly 18 tests.
The tests cover every numbered item in section 12.

The aggregate tests cover identity, order, monotonicity, saturation, negatives, and grouping.
The ordering tests cover ties, zero-margin equivalence, tiers, and lexical scores.
The union tests cover all 19 positives and all 32 frozen questions.

The cache guards walk top-level static imports only.
They test import safety and all three retained cache hashes.
They also test a planted synthetic score cache.

The calibration tests mutate every compared identity field.
They also mutate every registered max-clause field.
The outcome test checks the full acceptance table and local `shouldFail`.

## Validation results

| Command | Exit | Exact result |
| --- | ---: | --- |
| `./node_modules/.bin/vitest run test/eval-vectorize-support-fit.test.mjs` | 0 | 1 file passed; 18 tests passed; duration 1.34 seconds |
| `npm run typecheck` | 0 | `tsc --noEmit` passed |
| `npm test` | 0 | 99 files passed; 1,579 tests passed; duration 15.91 seconds |
| `npm run build` | 0 | The Wrangler dry run passed; total upload was 6,990.49 KiB |
| `npm run secrets:scan -- --tree` | 0 | 1 commit and 173,077 bytes scanned; no leaks found |
| `npm run eval:selftest` | 0 | All self-test checks passed |
| `npm run eval:compile` | 0 | 338 of 395 legacy cases compiled; 122 of 144 extended cases compiled |
| `npm run eval:routing -- --gate` | 0 | `GATE PASS` |
| `git diff --check` | 0 | No output |

The routing gate kept these exact totals:

| Lane | Top-1 | Top-3 | Top-5 | Extra |
| --- | ---: | ---: | ---: | --- |
| Legacy 338 | 208 | 279 | 311 | card@5 95 of 182 |
| Skills 23 | 16 | 23 | 23 | card@5 23 of 23 |
| Holdout 49 | 10 | 22 | 25 | 11 forbidden captures |
| Extended 122 | 90 | 109 | 117 | accept-either top-5 122 |

The routing command wrote this ignored local result:
`eval/results/routing-2026-09-01T14-09-50-670Z.json`.
The command changed no tracked routing artifact.

## Risks

The retained cache path has no implementation-stage runtime test.
This is required because this lane could not open the cache.
The one referee will test the full cache and calibration path.

The tree secret scan reads tracked files only.
The two new implementation files remain untracked.
A staged scan must cover them before a later commit.

The result writer did not run.
Its complete schema therefore has unit coverage but no retained-cache integration result.

## Blockers

There is no blocker for the implementation handoff.

The referee remains blocked by the reviewed sequence.
It needs an independent implementation review first.
It also needs a recorded 40-character implementation commit.

No commit was created.
