# Result verification — `clause-support-fit-v1`

Date: 2026-09-01
Verifier: Codex GPT-5.6 Terra
Scope: The completed attempt-three result at the frozen implementation commit.

## Verdict

**PASS**

The result artifact is authentic and internally consistent.
The independent cache calculation matches every saved comparison ranking.
The measurement outcome is **FAIL**.
That candidate outcome is not a verification discrepancy.

## Reviewed record

I read the round ledger, the final brief, both reconciliation sections, the implementation report,
and all four Grok review records.

The review sequence is complete:

| Record | Verdict or state |
| --- | --- |
| `review-grok-hold.md` | `BLOCK`; B1–B3 and R1–R4 required repair |
| `review-grok-hold-delta.md` | `BLOCK`; D1 required repair; D2–D6 were residual |
| `review-grok-hold-delta-2.md` | `PASS` |
| `review-grok-implementation.md` | `PASS` |
| `implementation-sol.md` | complete; cache-free implementation gate passed |

The frozen implementation commit is `24de12200c459ac0ce9ae91e7a4f39988429bf20`.
`git rev-parse HEAD` returned the same full hash.

`git diff-tree --no-commit-id --name-status -r 24de12200c459ac0ce9ae91e7a4f39988429bf20`
showed the approved brief, reviews, implementation report, referee, test, and `package.json` change.
It showed no protected routing or contract change.

`git diff --check 24de12200c459ac0ce9ae91e7a4f39988429bf20` returned no output.
The pre-existing modified ledger remained untouched.

## Methods

I did not run `eval:vectorize:support:run`.
I did not load a model.
I did not score a pair.
I did not use the network.

I created an independent scratch program at
`/private/tmp/verify-support-independent.mjs`.
It read the pinned cache and frozen local inputs.
It reconstructed the lexical candidate union.
It independently decoded the Float32 matrix.
It independently computed max-clause and noisy-OR fits.
It used a stable descending fit sort with base-order ties.
It then graded all three readings.

The program checked all 563 derived pair-index rows against the cache.
It checked all 383,273 decoded scores.
It compared all 495 saved comparison rankings for each reading.
It wrote only scratch output under `/private/tmp`.

Commands included:

```text
shasum -a 256 <result> <source-cache> <retained-copy>
find eval/vectorize/results -maxdepth 1 -type f -name '*clause-support-fit-v1*' -print | sort
node /private/tmp/verify-support-independent.mjs
git rev-parse HEAD
git diff-tree --no-commit-id --name-status -r 24de12200c459ac0ce9ae91e7a4f39988429bf20
git diff --check 24de12200c459ac0ce9ae91e7a4f39988429bf20
```

## Result identity and retention

| Item | SHA-256 | Result |
| --- | --- | --- |
| Local result | `a522bfa28ef4b06146c5f247ba64c08bfd6edaa4a81a0642c4010da2d6de479c` | matches the required hash |
| Pinned source matrix | `fa1252fc8bfbf62b6f69bb8ca431cf603d2b512e4d0299b2ca0de0d7c2cec0bc` | matches the cache pin |
| Retained result copy | `a522bfa28ef4b06146c5f247ba64c08bfd6edaa4a81a0642c4010da2d6de479c` | equals the local result |

The retained copy is:

```text
/Users/kalepail/.cache/stellar-raven/eval-results/clause-support-fit-v1-2026-09-01/2026-09-01T14-22-28-993Z-clause-support-fit-v1.json
```

The result stamp is `2026-09-01T14-22-28-993Z-clause-support-fit-v1`.
Its `experiment` is `clause-support-fit-v1`.
Its `implementationCommit` is the frozen 40-character commit.

Exactly one matching result file exists under `eval/vectorize/results/`:

```text
eval/vectorize/results/2026-09-01T14-22-28-993Z-clause-support-fit-v1.json
```

## Source pins

The source matrix checks passed.

| Check | Value |
| --- | --- |
| Source experiment | `cross-encoder-fit-v1` |
| Cache file SHA-256 | `fa1252fc8bfbf62b6f69bb8ca431cf603d2b512e4d0299b2ca0de0d7c2cec0bc` |
| Decoded score-payload SHA-256 | `44c274680cd324d00aa16d240e21d3260005766d507a430e93c423e9c16fcd55` |
| Cache-record SHA-256 | `ecea4c6981eb22a59d59b4b9434cad57732309e28504574e7ed483a01512fca1` |
| Queries | 563 |
| Scores | 383,273 |
| Clause artifact SHA-256 | `e5f86644af89158c3ac4d61ee7f651e2a062c9d292f194cb94872c7eee4e71f4` |
| Clause set | `cc5df2e4d89522c580626cfc21727b927494f5f528f42acfa035187a211d89e5` |
| Clauses | 683: 608 positive and 75 negative |

The four `eval/gates.json` input pins also matched:

| Path | SHA-256 |
| --- | --- |
| `catalog/manifest.json` | `4945c3117d464d7155fe6bc2bd2f2f42638ef83159435ae48a90bab046dc6789` |
| `eval/routing-cases.json` | `9e863cedc1f1754f67b3955bfe744254da6ae0d069502aefc7964530493fafd3` |
| `eval/skills-cases.json` | `3ec4d90444489550f9ac9745384a4371cdbd0077dfc77a84597652d02f61ba1f` |
| `eval/holdout-cases.json` | `cb34d83be86f63a0a4ba06977659afa91d0fbaecbeab0e86b82bef9d73c4bbf5` |

The frozen contract hashes also matched:

| Path | SHA-256 |
| --- | --- |
| `eval/protocol-history-cases.json` | `df8218e1b3a5a1526859c4c33d9b565cfd23f38b9c835d22fd93322c8e5c8857` |
| `eval/protocol-history-blind-cases.json` | `843aaa70c20eebe29d222a9f7e585a8ab6e722b88396b01c75079008d56446b3` |

The frozen support referee hash is
`fbc059e455f5685b2a3866e766462ef35a80aecc63ad346eceba663c1b3004b5`.
The support test hash is
`c2ee273d4c4682280ad6aff3c34c43d414e94459416687116a4437ab79af84b7`.
`package.json` is
`01b850a3f15d32c452ee113c72f590769c33132ad6e6ced76046a6a41201d8d1`.

## Independent readings

Each computed reading matched the saved metrics and every saved comparison ranking.

| Reading | Original positives / controls | Blind positives / controls | Changed rankings | Routing gate |
| --- | --- | --- | ---: | --- |
| identity | 3/4/4 of 8; 1/4 | 3/3/3 of 11; 6/9 | 0 | pass |
| max-clause | 3/4/5 of 8; 2/4 | 2/2/3 of 11; 4/9 | 495 | fail |
| support-fit | 4/6/7 of 8; 2/4 | 5/6/10 of 11; 7/9 | 495 | fail |

The identity calibration exactly reproduced the frozen gate totals:

| Lane | Result |
| --- | --- |
| Legacy | 208 / 279 / 311; card@5 95 of 182 |
| Skills | 16 / 23 / 23; card@5 23 of 23 |
| Holdout | 10 / 22 / 25; card@5 25; 11 forbidden; 21 passed |
| Extended strict | 90 / 109 / 117 |
| Extended accept-either | 103 / 118 / 122 |
| Protocol-version top-1 | `stellarDocs.search_protocol_concepts_docs` |

The max-clause calibration exactly reproduced the registered attempt-two pure reading.
It had 495 changed rankings and a failed routing gate.

The independent support-fit reading was:

| Lane | Result |
| --- | --- |
| Legacy | 220 / 266 / 276; card@5 111 of 182 |
| Skills | 18 / 20 / 20; card@5 20 of 23 |
| Holdout | 22 / 35 / 41; card@5 41; 19 forbidden; 27 passed |
| Extended strict | 55 / 89 / 96 |
| Extended accept-either | 85 / 116 / 118 |
| Protocol-version top-1 | `scout.searchResearch` |

Support-fit missed `ph-protocol-upgrade-chronology` from the original contract.
It missed `phb-auth-recursion-auditors` from the blind contract.
It captured two original controls and seven blind controls.

The support-fit routing gate failed on legacy drift, 19 holdout forbidden captures,
all three extended strict floors, the extended accept-either floor, and the protocol-version top-1.
The support acceptance test therefore failed.
The independently derived outcome is `FAIL`.

## Discrepancies

None.

The result hash, retained-copy hash, implementation identity, source pins, pair-index derivation,
calibrations, all 495 ranking comparisons, routing gates, contract results, and final outcome match.

## Final state

The one pre-registered candidate reading failed its acceptance table.
The result verification passed.
Attempt three is spent by this measured `FAIL` result.
