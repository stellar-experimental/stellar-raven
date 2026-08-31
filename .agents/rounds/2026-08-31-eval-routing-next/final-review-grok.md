# Final independent review — complete branch vs `1bfb983`

Date: 2026-08-31
Reviewer: Grok 4.6 high
Base: `1bfb9838491fa571166a2a631789a3b0e814980c`
Head: same commit; all work is uncommitted tracked and untracked files
Orchestrator: Claude Fable 5 high
Validation evidence: `final-validation-terra.md` (BLOCK on an incorrect protected-file read) and `final-validation-delta-terra.md` (PASS)
Status: complete. No model fetch ran. No model load ran. The referee was not rerun. This reviewer wrote only this file.

This review does not authorize a production change. It does not authorize a second referee. It does not authorize attempt two of the block 3 box.

## Verdict

**PASS**

The branch is a completed measurement closeout. The scored outcome is `FAIL`. No grid meets the full acceptance table. No grid qualifies for `PARTIAL`. Production search is unchanged. The harness and clause artifact remain as the frozen instrument.

Terra's reconciled validation commands passed. Live hashes match the pinned result, artifact, contracts, and loader records. Closeout documents match the reviewed result wording. Prior blocking findings have a later PASS delta or an explicit repair.

## Scope

`HEAD` is still `1bfb9838491fa571166a2a631789a3b0e814980c`. Tracked diff vs that commit:

| Path | Role |
| --- | --- |
| `.agents/NEXT.md` | intended closeout |
| `.agents/TODO.md` | intended closeout |
| `eval/README.md` | intended closeout |
| `eval/qa/README.md` | intended closeout |
| `eval/vectorize/README.md` | intended closeout |
| `eval/vectorize/embedder.mjs` | env-gated local-only loader |
| `package.json` | three clause scripts |

Untracked branch files:

- Round ledger `.agents/rounds/2026-08-31-eval-routing-next.md`
- Round directory reports under `.agents/rounds/2026-08-31-eval-routing-next/`
- Clause harness: `clause-config.mjs`, `clause-retrieval.mjs`, `build-clause-artifact.mjs`, `run-clause-fit.mjs`, `preflight-clause-model.mjs`
- Clause artifact `eval/vectorize/artifacts/qwen3-embedding-0.6b-q8-c25a394-clauses.json`
- Tests `test/eval-vectorize-clause-fit.test.mjs`

No tracked or untracked diff exists in `src/`, `catalog/`, `inventory/`, workflow archetypes, `eval/gates.json`, frozen protocol or holdout contracts, or `improvements/`.

The first Terra validation report treated TODO, NEXT, and README edits as protected. The delta report corrects that. Those five documents are the closeout write set in `closeout-guidance-fable.md` section 2.

## Present-state truth

Canonical current docs match the measured `FAIL` and the closeout sequence.

| Document | Required present state | Result |
| --- | --- | --- |
| `.agents/TODO.md` | Judge-stability item deleted. Protocol-history item kept, with the reviewed `FAIL`, stamp, artifact hash, and held cross-encoder attempt. Other items untouched. | PASS |
| `.agents/NEXT.md` | Stable-at-57 refresh. Block 2 still open for Raven and Friendbot. Block 3 held after attempt one `FAIL`. Sequence is Playground, then small fixes. | PASS |
| `eval/vectorize/README.md` | Completed local-only referee, pins, five readings, blind 3-to-4 note, `FAIL` / `selected: null`, no production change, frozen instrument. | PASS |
| `eval/README.md` | Completed `FAIL` pointer. No remaining "stopped before scoring" claim. | PASS |
| `eval/qa/README.md` | `$0.244` / `$0.0617` calibration and distinct 23.3% re-judge noise floor. | PASS |
| Round ledger Outcome | Measured `FAIL`, pins, no production change, judge-stability TODO closed, nothing new for `improvements/`, retained evidence, next block is Playground. | PASS |

The TODO protocol-history done condition is unchanged. The count 57 remains in NEXT as a fact. The closed item is the degrading-trend TODO, not the 57 count.

`eval/qa/README.md` says the rounded product `approximates` `$16.5629124`. That is more precise than "reproduces". `57 × 0.244 + 43 × 0.0617 = 16.5611`.

Historical round reports still contain earlier BLOCK verdicts. Those files are dated evidence. Later delta and reconciliation files supersede them. Canonical docs do not repeat those blocked claims as current truth.

## Reviewability

Mode: audit only. Fixed point: `1bfb983`.

Dated experiment history lives in `.agents/rounds/`. Current contracts live in TODO, NEXT, and the eval READMEs. That split matches `.agents/README.md`.

No false current contract was found in the closeout documents. The clause-fit README section is a dated measurement record, not a session narrative in production code. The loader change is local to `extractor()` and is env-gated.

The generated clause artifact is not hand-edited. Tests 19 and 20 pin count, dimensions, model, runtime, and catalog-match drift. `build-clause-artifact.mjs` is the owning builder.

## Generated-artifact provenance

Live hashes match the result, implementation, finish, and validation records.

| Object | SHA-256 | Bytes | Result |
| --- | --- | --- | --- |
| Clause artifact | `e5f86644af89158c3ac4d61ee7f651e2a062c9d292f194cb94872c7eee4e71f4` | 3,917,367 | Match |
| Artifact vector payload | `1dd9eb2ebcaede223fc39e4f07b943375b5025a7922a1578545a09229c09856d` | — | Recomputed match |
| Query-cache file | `65ca5052c5258aeb1f5a30e93a1b9c1fde61aace80c8b3fdd4d044346385b8c2` | 3,208,233 | Match |
| Query-vector payload | `55f11af02a90940b784719b819e52ac9da84a7fe028af8c258d9218f18e281b9` | — | Recomputed match |
| Result JSON | `17e75f0d1b13848aa2e0841624e8496c558624493d156c3cb2115301a6a9cda0` | 1,754,024 | Match |
| Clause builder | `4c776e0cfa1c42ef3b7f52e56f11569085dec96e0aa2ac1862eede1e5f9db5bd` | 2,054 | Match |
| Clause config | `39e0b2c42d845913541231dce90b8ecd0e949adc11c50eefea015b7cb291932e` | 6,554 | Match |
| Clause retrieval | `a99e32319d27fe66c92887299971da257a1938073dececc095e7201c29c27cd9` | 5,927 | Match |
| Referee | `dac5457d6f967cda8e50c8596347ab50afaebe3c6225f743bf731ca5c7fced61` | 16,962 | Match |
| Preflight | `c2c6b7f8f450755c8a592c895581b50c637f87994803ba5431793030c92f0c5a` | 2,724 | Match |
| Embedder | `0976e8bbf5c7083dc954be4d9a21d4606fcfff53087b7dfeb9ee146fbb675e5f` | 1,867 | Match |
| Clause tests | `c11a7f6b47e12a05dea3615a57ac7c800ad60f11baca6cbd422a036877567143` | 10,066 | Match |
| `package.json` | `2ac7f8402d0fcb24c812c71d487f37b0fc8aef60cf4c70302ed3fa1cd134844a` | 4,204 | Match |

Artifact metadata: schema 1, experiment `clause-fit-hysteresis-v1`, 683 clauses, model `onnx-community/Qwen3-Embedding-0.6B-ONNX` @ `c25a394dd583836952667c12f008335071b3f43d`, runtime `@huggingface/transformers@4.2.0`, exclusions are the three keyword fields, unmatched Scout ops are the four expected ids.

Live catalog inputs still match the artifact:

| Input | SHA-256 |
| --- | --- |
| `catalog/manifest.json` | `4945c3117d464d7155fe6bc2bd2f2f42638ef83159435ae48a90bab046dc6789` |
| `inventory/stellar-light.json` | `1a261c4a2e2172683e91a52ddc33b02ff41e74760c861dfacb29c60a8d8671b0` |
| `scripts/catalog-data/workflow-archetypes.mjs` | `beeea9b5ff48680e2f13a030dfd68f21f2d5c50ed4220733d8f1e6095a1b5c14` |

Frozen contracts are unchanged vs base:

| File | SHA-256 |
| --- | --- |
| `eval/protocol-history-cases.json` | `df8218e1b3a5a1526859c4c33d9b565cfd23f38b9c835d22fd93322c8e5c8857` |
| `eval/protocol-history-blind-cases.json` | `843aaa70c20eebe29d222a9f7e585a8ab6e722b88396b01c75079008d56446b3` |
| `eval/holdout-cases.json` | `cb34d83be86f63a0a4ba06977659afa91d0fbaecbeab0e86b82bef9d73c4bbf5` |
| `eval/gates.json` | `95a4f7c1afb9ee3d7de517549994da1986d50411719cecfbb03226ab1bbbb371` |

## No production change

`src/` has no diff vs base. The embedder default path, with `RAVEN_VECTORIZE_MODEL_DIR` unset, still calls `pipeline({ revision, dtype })`. Local-only mode is env-gated: four-file presence check, `allowRemoteModels = false`, `allowLocalModels = true`, `localModelPath = modelDir`, `useFSCache = false`, then `pipeline()`.

The preflight refuses an unset directory, hashes the four pinned files, then dynamically imports retrieval and the embedder. `src/` does not import the harness.

`package.json` adds only:

- `eval:vectorize:clauses:build`
- `eval:vectorize:clauses:preflight`
- `eval:vectorize:clauses:run`

## Result retention

`.gitignore:37` ignores `eval/vectorize/results/`. Both local result files remain on disk and untracked.

The five `/tmp/stellar-raven-clause-fit-finish` dumps remain and match the recorded hashes:

| Dump | SHA-256 |
| --- | --- |
| `identity.json` | `c9689d268af832919ee9c4cde4c87e1f48f05b38f8fbf8d04906054df375941a` |
| `pure-fit.json` | `72dbe3f7666fdd8f367e3ccdf881db81386662873f8beab58b3ffa0b77b58fae` |
| `grid-0.03.json` | `68b91c71b097a30805de8c78d00a8eeb482be0c50e8ec4eb387053fb944af8e2` |
| `grid-0.06.json` | `6a7d7db9c8ff005a08f4b7842ec1a0c019a52ef46ce09aef79a19a09773e5efe` |
| `grid-0.10.json` | `ae690db24693643ca600f947aefc850d7de22dbf635f4559c59033013d66f124` |

The machine-local snapshot at `/Users/kalepail/.cache/stellar-raven/qwen3-embedding-0.6b-q8-c25a394` still has the four pinned files:

| File | SHA-256 |
| --- | --- |
| `config.json` | `66a10929782f3c9a3cd5dec90e2a95c60e05736134a63cd54479eeae80bed175` |
| `tokenizer_config.json` | `977648852447cb6587327ff3205b0a84cf2fc9f05621d6c8e88a497caafab2e1` |
| `tokenizer.json` | `def76fb086971c7867b829c23a26261e38d9d74e02139253b38aeb9df8b4b50a` |
| `onnx/model_quantized.onnx` | `87cd124e0ef1fd1f223ebc283efccbaeac386d0b08344701c46975d0657b591f` |

The ledger records preflight probe-vector SHA-256 `d32aabf37d5aaeda98bd2c817cc7d38c6b746f82c89d874f982d8016fbaf4b4b`. The result JSON still omits that field. That is the known schema limit. Grok L2 asked for the hash in the ledger, not a referee rerun.

## Exact FAIL claims

The stored result was read. The referee was not rerun. Unique questions: 563. Readings: 5. Outcome: `FAIL`. `selected`: `null`. Environment: Node `v24.13.0`, `onnxruntime-node` `1.24.3`, `darwin`.

Identity matches `gates.json` `evidence.acceptedTotals`:

- Legacy 208/279/311, `cardN` 182, `cardHit5` 95
- Skills 16/23/23, `cardN` 23, `cardHit5` 23
- Holdout 10/22/25, forbidden 11, `passed` 21, `cardN` 49, `cardHit5` 25
- Original 4/8 with 1/4 captures
- Blind 3/11 with 6/9 captures
- Changed rankings 0

Grid acceptance from the stored JSON:

| Reading | Role | Original top-5 / controls | Blind top-5 / controls | Routing gate | Full table | PARTIAL |
| --- | --- | --- | --- | --- | --- | --- |
| identity | identity | 4/8, 1/4 | 3/11, 6/9 | PASS | no | no (not a grid) |
| pure-fit | diagnostic | 0/8, 2/4 | 2/11, 1/9 | FAIL | no | no (not a grid) |
| `m = 0.03` | grid | 4/8, 1/4 | 4/11, 2/9 | FAIL (8) | no | no |
| `m = 0.06` | grid | 4/8, 1/4 | 4/11, 6/9 | FAIL (5) | no | no |
| `m = 0.10` | grid | 4/8, 1/4 | 3/11, 6/9 | FAIL (2) | no | no |

No grid has `routingGate.pass`. No grid has 0/4 and 0/9 control captures. `PARTIAL` therefore does not apply.

Grid `m = 0.10` has the fewest routing-gate failures (2) and the fewest changed rankings (163). Its gate failures are legacy top-1 196 and holdout forbidden 12. Active wording does not call it closest to the full table.

Blind top-five moves from 3 to 4 at `m = 0.03` and `m = 0.06` only. Original top-five stays 4 on every grid. Active docs state that movement and do not call it a contract win.

Inspection case `q-protocol-24-whisk-incident` and archival positive `ph-protocol-24-archival-root-cause` never rank `scout.searchResearch` in the top five on any reading.

Identity `margin` is JSON `null` because `Infinity` does not serialize. The role is `identity`. Calibration still holds.

## Intended next sequence

Closeout §5, NEXT suggested sequence, TODO remaining items, and the ledger Outcome agree:

1. Land this closeout. This review is that gate.
2. Hold block 3. Attempt two is a future reviewed local cross-encoder brief. Do not start it in this round.
3. Next free own-repo block is Playground 8,000-character message limit.
4. Then the two small own-repo fixes.
5. Standing items stay: owner product-loss margin, same-100 `v2.10` only for a merged product candidate, Raven only with a new mechanism, Friendbot monitor-only, repository recovery monitor-only until Horizon returns `28`.

No production routing change is supported.

## Prior reconciliations

Every earlier BLOCK has a later repair and PASS delta, or an explicit keep-as-historical record.

| Gate | First verdict | Repair | Closing verdict |
| --- | --- | --- | --- |
| Plan | `review-grok-plan.md` BLOCK | `plan-reconciliation-fable.md`; R1–R3 also repaired | `review-grok-plan-delta.md` PASS |
| Clause brief | `review-grok-clause-brief.md` BLOCK | `clause-brief-reconciliation-fable.md`; R1 repaired, R2 kept | `review-grok-clause-brief-delta.md` PASS |
| First referee | measurement `BLOCKED` | finish plan; zero-fetch loader | `review-grok-clause-fit.md` PASS keep/BLOCKED; `verification-terra.md` same |
| Finish plan | `review-grok-finish-plan.md` BLOCK | fetch path removed | `review-grok-finish-plan-delta.md` PASS |
| Loader/preflight | — | — | `review-grok-finish.md` PASS |
| Measured result | Terra BLOCK on "closest table"; Grok L1 wording | `result-reconciliation-sol.md` | `review-grok-result.md` PASS `FAIL`; `result-verification-delta-terra.md` PASS |
| Final validation | `final-validation-terra.md` BLOCK on TODO/NEXT/README | those files are intended closeout | `final-validation-delta-terra.md` PASS |

Terra command evidence from the reconciled validation, used as the free gate record:

| Command | Exit | Result |
| --- | ---: | --- |
| `npm run typecheck` | 0 | passed |
| `npm test` | 0 | 97 files, 1,536 tests |
| `npm run build` | 0 | Worker dry-run 7,038.90 KiB |
| `npm run secrets:scan -- --tree` | 0 | no leaks |
| `npm run eval:routing -- --gate` | 0 | GATE PASS |
| `npm run eval:qa:lint -- --since origin/main --stale` | 0 | 0 errors, 61 warnings |
| Focused vector tests | 0 | 31 tests |
| `git diff --check` | 0 | clean |

Those commands changed no tracked file. This review did not rerun them.

Loader and preflight hashes still match `review-grok-finish.md`. Referee, tests, and artifact hashes still match that protected-file table.

## Actionable findings

None.

No H, M, or L issue remains on the complete branch diff.

## What this PASS allows

- Bank the measured `FAIL` and land the closeout on `next/eval-routing-stability`.
- Keep the harness, clause artifact, local results, dumps, and snapshot as evidence.
- Close attempt one of the block 3 box as a measured negative.
- Close only the judge-stability TODO as stable at 57.

## What this PASS does not allow

- A production commit or a `TIER_INTERLEAVE_MARGIN` change.
- A second referee, a clause-artifact rebuild, or a model fetch.
- Starting the cross-encoder or any other attempt two in this round.
- Calling any grid `PASS`, `PARTIAL`, or a near-ship.
- Filing an `improvements/` finding from this result. The defect remains this repository's ranking.
