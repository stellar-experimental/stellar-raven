# Post-result review — clause-fit measurement

Date: 2026-08-31
Reviewer: Grok 4.6 high
Author: Codex GPT-5.6 Sol high (`finish-result-sol.md` and the local result files)
Orchestrator: Claude Fable 5 high
Brief: `.agents/rounds/2026-08-31-eval-routing-next/implementation-brief-fable.md` §11–§12
Plan attempt box: `plan-fable.md` §4.4
Status: complete. No model fetch ran. No model load ran. The referee was not rerun. This reviewer wrote only this file.

This review does not authorize a production change. It does not authorize a second referee. It does not authorize attempt two of the block 3 box inside this round.

## Verdict

**PASS the measured `FAIL`. Keep the harness. Keep the artifact. Support no production change.**

`FAIL` is the correct label. No grid reading meets the full acceptance table. No grid reading qualifies for `PARTIAL`. Identity calibration matches `gates.json` and the frozen 4/8 and 3/11 baselines. The result is a completed negative, not a harness block.

## Keep-or-remove decision

Keep both.

| Object | Role after this FAIL | Decision |
| --- | --- | --- |
| Harness (`clause-config.mjs`, `clause-retrieval.mjs`, `build-clause-artifact.mjs`, `run-clause-fit.mjs`, loader, preflight, tests, package scripts) | frozen instrument that produced the five readings | keep |
| Artifact `eval/vectorize/artifacts/qwen3-embedding-0.6b-q8-c25a394-clauses.json` | 3,917,367 bytes; SHA-256 `e5f86644af89158c3ac4d61ee7f651e2a062c9d292f194cb94872c7eee4e71f4`; the only allowed build | keep |
| Local result JSON, query cache, and `/tmp` dumps | 30-day evidence of the negative | keep |

Reasons:

- `FAIL` is a scored outcome. Deleting the artifact would erase the input pin for that outcome.
- A second artifact build for a score reason is still forbidden.
- Tests 19 and 20 pin the artifact. The 2026-07 Vectorize no-ship artifact stayed for the same reason.
- The harness is attempt-one evidence. It is not unused speculative code.

Do not treat KEEP as a production-wiring brief. Do not treat KEEP as attempt two.

## Evidence this review checked

All checks were free. The embedder did not run. The referee was not rerun.

| Check | Result |
| --- | --- |
| Result stamp | `2026-08-31T16-58-42-389Z-clause-fit-hysteresis-v1` |
| Result SHA-256 | `17e75f0d1b13848aa2e0841624e8496c558624493d156c3cb2115301a6a9cda0` |
| Query-cache SHA-256 | `65ca5052c5258aeb1f5a30e93a1b9c1fde61aace80c8b3fdd4d044346385b8c2` |
| Query-vector payload SHA-256 | `55f11af02a90940b784719b819e52ac9da84a7fe028af8c258d9218f18e281b9` |
| Unique questions | 563 |
| Dump files | five files; 495 rankings each; byte-match `readings[].rankings` |
| `src/` and `eval/gates.json` | no diff vs `HEAD` |
| Outcome / selected | `FAIL` / `null` |

## Label check

Brief §11:

- `PASS` needs one grid that meets the full table, including 8/8 with 0/4 and 11/11 with 0/9.
- `PARTIAL` needs a grid with zero control captures and all routing gates, while positives still miss.
- `FAIL` applies when no grid reaches zero captures with the gates intact.

Recomputed from the result JSON:

| Reading | Role | Original | Blind | Routing gate | Full table | PARTIAL |
| --- | --- | --- | --- | --- | --- | --- |
| identity | identity | 4/8, 1/4 | 3/11, 6/9 | PASS | no | no (not a grid) |
| pure-fit | diagnostic | 0/8, 2/4 | 2/11, 1/9 | FAIL | no | no (not a grid) |
| grid `0.03` | grid | 4/8, 1/4 | 4/11, 2/9 | FAIL | no | no |
| grid `0.06` | grid | 4/8, 1/4 | 4/11, 6/9 | FAIL | no | no |
| grid `0.10` | grid | 4/8, 1/4 | 3/11, 6/9 | FAIL | no | no |

No grid has `routingGate.pass`. No grid has 0/4 and 0/9 control captures. `0.10` is the nearest routing reading (legacy top-1 196 vs 205 band floor; holdout forbidden 12 vs 11). It still fails both protocol contracts. It is not a near-`PASS` on the full table.

Identity and pure-fit do not decide acceptance. That matches the brief.

## Identity calibration

The referee completed, so the abort path did not fire. The JSON still matches every `gates.json` `evidence.acceptedTotals` key, including `cardN`, `cardHit5`, and holdout `passed`:

- Legacy 208/279/311, `cardN` 182, `cardHit5` 95.
- Skills 16/23/23, `cardN` 23, `cardHit5` 23.
- Holdout 10/22/25, forbidden 11, `passed` 21, `cardN` 49, `cardHit5` 25.
- Original top-5 4/8 with 1/4 captures.
- Blind top-5 3/11 with 6/9 captures.
- Changed rankings 0. New `scout.searchResearch` captures 0.

Environment: Node `v24.13.0`, `onnxruntime-node` `1.24.3`, `darwin`. Same as the preflight record.

## Production change

No. The named archival positive `ph-protocol-24-archival-root-cause` never ranks `scout.searchResearch` in the top five on any reading. Inspection case `q-protocol-24-whisk-incident` also never surfaces `scout.searchResearch`. Closer grids trade precision for no protocol recovery. A `src/` change would need a passing candidate and a later product brief, including the production `TIER_INTERLEAVE_MARGIN` policy.

## Next routing experiment

Attempt one of the block 3 box is now a completed `FAIL`.

Brief §12: after `FAIL`, no follow-up experiment starts inside this round.

Brief §11 and §1.1: the next brief may select the pinned local cross-encoder. That is attempt two, not a continuation of this referee.

Do not start a cross-encoder pin, loader, or artifact in this round. Do not reopen clause sources, margins, or the keyword exclusion after inspecting these misses.

## Overclaims and caveats

The `FAIL` label, the no-`PARTIAL` claim, the identity calibration, and the no-production-change claim are true.

One wording error in `finish-result-sol.md` is false as written: "The closer grids preserved more routing quality but did not improve the protocol top-five counts." Grid `0.03` and grid `0.06` raise blind top-5 from 3 to 4. That is one extra blind hit. It is not a contract win. Original top-5 stays 4/8 on every grid. Grid `0.10` drops original top-1 from 3 to 2. Say that. Do not say the protocol counts did not move.

The result JSON omits the preflight probe-vector hash. The write-up records `d32aabf37d5aaeda98bd2c817cc7d38c6b746f82c89d874f982d8016fbaf4b4b`. That gap does not change the outcome.

JSON stores identity `margin` as `null` because `Infinity` does not serialize. The role is `identity`. Calibration still holds.

## Actionable findings

### L1 — Severity: nit — protocol top-five wording

`finish-result-sol.md` says closer grids did not improve protocol top-five counts. Blind top-5 moves 3 → 4 at `m=0.03` and `m=0.06`.

Repair at closeout: state the exact top-five counts. Do not treat that movement as `PARTIAL` or as a product signal.

### L2 — Severity: nit — probe hash lives only in the write-up

Plan §7 asked to record the probe-vector hash with every artifact. The result and query-cache JSON omit it.

Repair at closeout: copy the preflight hash into the round ledger with the other identity pins. Do not rerun the referee to add a field.

## What this PASS allows

- Bank `FAIL` in the round ledger and in `eval/vectorize/README.md`.
- Keep the harness, the clause artifact, the query cache, and the result JSON.
- Close attempt one of the block 3 box as a measured negative.

## What this PASS does not allow

- A production commit or a `TIER_INTERLEAVE_MARGIN` change.
- A second referee or a clause-artifact rebuild.
- Starting the cross-encoder, or any other attempt two, inside this round.
- Rewriting misses into new clause sources.
- Calling any grid a `PARTIAL` or a near-ship.
