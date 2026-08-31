# Clause-fit result verification

Date: 2026-08-31

## Verdict: BLOCK

The stored result is a complete measured `FAIL`.
The result hash, query-cache hash, artifact hash, and five dump hashes all match.
The stored vectors reproduce every reading without loading a model.

One interpretation requires correction.
The phrase "closest to the full acceptance table" is not supported.
The implementation defines no distance measure for that phrase.

Grid `0.10` has the fewest routing-gate failures.
It also has the fewest changed rankings among grid readings.
It is closest only under either of those limited measures.

Grid `0.03` has the lower protocol-contract deficit.
Its deficit is 14, compared with 19 for grid `0.10`.
Therefore, grid `0.10` is not demonstrably closest to the complete acceptance table.

The measured `FAIL` outcome remains correct.
The stored `selected: null` value remains correct.

## Evidence scope

I read `finish-result-sol.md`, both local result files, and all five dump files.
I also read the result harness and the local retention rules.
I did not run preflight, a model load, or the referee.

I recomputed the result from the stored 563 query vectors.
The calculation used the pinned clause artifact and current local input files.
It covered 564 case rows and 495 comparison rankings.
The query question hashes matched their rebuilt order.

## File inventory and integrity

Exactly one clause-fit query cache exists:

```text
eval/vectorize/results/2026-08-31T16-58-30-203Z-clause-fit-query-vectors.json
```

Exactly one clause-fit result exists:

```text
eval/vectorize/results/2026-08-31T16-58-42-389Z-clause-fit-hysteresis-v1.json
```

Exactly five dump files exist in `/tmp/stellar-raven-clause-fit-finish`.
Each dump exactly equals its result-reading `rankings` object.
No second cache, result, or referee dump exists in these locations.

| File or payload | SHA-256 | Verification |
| --- | --- | --- |
| Query cache | `65ca5052c5258aeb1f5a30e93a1b9c1fde61aace80c8b3fdd4d044346385b8c2` | Match |
| Query-vector payload | `55f11af02a90940b784719b819e52ac9da84a7fe028af8c258d9218f18e281b9` | Match |
| Result | `17e75f0d1b13848aa2e0841624e8496c558624493d156c3cb2115301a6a9cda0` | Match |
| Clause artifact | `e5f86644af89158c3ac4d61ee7f651e2a062c9d292f194cb94872c7eee4e71f4` | Match |
| Identity dump | `c9689d268af832919ee9c4cde4c87e1f48f05b38f8fbf8d04906054df375941a` | Match |
| Pure-fit dump | `72dbe3f7666fdd8f367e3ccdf881db81386662873f8beab58b3ffa0b77b58fae` | Match |
| Grid `0.03` dump | `68b91c71b097a30805de8c78d00a8eeb482be0c50e8ec4eb387053fb944af8e2` | Match |
| Grid `0.06` dump | `6a7d7db9c8ff005a08f4b7842ec1a0c019a52ef46ce09aef79a19a09773e5efe` | Match |
| Grid `0.10` dump | `ae690db24693643ca600f947aefc850d7de22dbf635f4559c59033013d66f124` | Match |

## Recomputed readings

Each triplet is top-1/top-3/top-5.
`OC` and `BC` are original and blind control captures.
`HF` is holdout forbidden captures.

| Reading | Original, OC | Blind, BC | Legacy | Skills | Holdout, HF | Extended strict | Extended accept | Changed | Gate failures | Acceptance |
| --- | --- | --- | --- | --- | --- | --- | --- | ---: | ---: | --- |
| identity | 3/4/4, 1 | 3/3/3, 6 | 208/279/311 | 16/23/23 | 10/22/25, 11 | 90/109/117 | 103/118/122 | 0 | 0 | FAIL |
| pure fit | 0/0/0, 2 | 0/1/2, 1 | 86/187/231 | 18/23/23 | 18/33/40, 28 | 20/59/81 | 30/79/103 | 495 | 9 | FAIL |
| grid `0.03` | 3/4/4, 1 | 2/4/4, 2 | 128/259/310 | 19/22/23 | 23/32/36, 21 | 50/100/113 | 67/114/118 | 477 | 8 | FAIL |
| grid `0.06` | 2/4/4, 1 | 2/4/4, 6 | 166/282/311 | 19/23/23 | 20/30/34, 12 | 82/109/114 | 98/119/121 | 346 | 5 | FAIL |
| grid `0.10` | 2/4/4, 1 | 3/3/3, 6 | 196/281/311 | 17/23/23 | 15/29/30, 12 | 91/109/117 | 104/118/122 | 163 | 2 | FAIL |

The stored changed-ranking counts match the independent recomputation.
The stored new-capture counts also match: 0, 42, 19, 5, and 2.

The identity routing gate passes.
The identity protocol contracts fail.
Each grid fails its routing gate and both protocol contracts.
No grid qualifies for `PASS` or `PARTIAL`.

The independent selection calculation returns `outcome: FAIL` and `selected: null`.
This matches the stored result.

## Closest-grid discrepancy

The result code selects only accepted grid readings.
It does not calculate a closest unsuccessful reading.

Grid `0.10` has two routing-gate failures.
The other grid readings have five, eight, and nine failures.
Grid `0.10` also changes 163 rankings.
The other grid readings change 346, 477, and 495 rankings.

The protocol-contract deficit counts unmet positive top-five requirements and control captures.
The counts are 20 for pure fit, 14 for grid `0.03`, 18 for grid `0.06`, and 19 for grid `0.10`.
The record can call grid `0.10` closest by routing-gate failures.
It cannot call grid `0.10` closest to the entire acceptance table without defining another measure.

## Protected files and retention

`eval/vectorize/results/` is gitignored as local-only evidence.
Neither result file is tracked by Git.
The local result retention therefore follows the eval policy.

`NEXT`, `TODO`, and the shared round ledger have no tracked diff.
The worktree has pre-existing tracked README additions.
They are four lines in `eval/README.md` and 19 lines in `eval/vectorize/README.md`.
They existed before this verification.
I did not edit them.

No other data discrepancy was found.
