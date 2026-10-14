# Playground clip marker — measurement result v2 (`main` `0a60d98a`)

Plan: [`plan-clip-marker.md`](plan-clip-marker.md), with launch amendment 3, spend authorization 2,
and the predeclared slot conditions in the [triage ledger](../2026-10-12-call-pattern-triage.md)
("Re-measurement on the new `main`"). Collector: lane T2 (Claude Opus 5.5, high).
Collection: 2026-10-14, 04:26Z to 04:40Z. The orchestrator runs the post-run review.

The first measurement ([result-clip.md](result-clip.md)) is final PASS on `f7b1b775`. This run
repeats the plan once on `main` `0a60d98a` (#271), because #271 changed `src/demo/` evidence
labels.

## Proposed verdict: PASS

- The marker works on its target. M1 on the two target rows: BASE 3 (B1 1, B2 2), CANDIDATE 0.
  Every CANDIDATE target row-run showed the target card with `required input: query`.
- Controls: M1 0 in both arms. M2 equals M1 (3 `[invalid-args: query]` entries, all on the target
  rows, all BASE). M2 on non-docs operations: 0 in both arms.
- Routing: every row passes (E or T) in every run. The protocol controls pass in both CANDIDATE
  runs. No routing regression.
- Answers: no row has both CANDIDATE grades worse than both BASE grades. The rule 6 list is empty,
  so no re-judge ran.
- No tool-loop defect: no step-7 tool call, every turn ends with `stop` and an answer. One C1
  script error (a model bug, `dirRows.map is not a function`) was recovered in the next script.
- Every rule 3 PASS condition holds. No rule 4 FAIL condition holds.

## Arms and identities

| Item | BASE | CANDIDATE |
| --- | --- | --- |
| Commit | `0a60d98a48e3bc0c7076961e33991aee2c7375d8` (`main`) | `6e0d11000f6762e773189e66278fd8979fedd880` |
| Tree | `488e1aeb923435c8da13799c47d72a5a75097140` | `d4cc6e801d68631cd9936c91a4d61d24ce889745` |
| Generation | `9743c67c5a9a0568283274f80a4d20b2ed0b49d8e555fdfc111e7214aa258f87` | `6d65ccb545409be3831b6bbcbd5b36dd14c6d9d3bfc1416fdefd02da79950f85` |
| Server revision line | `0a60d98a…` (`base-a`, `base-b`) | `6e0d1100…` (`candidate`) |
| SDK receipt | `7.0.137 4.0.91` before each start | `7.0.137 4.0.91` before the start |

- The CANDIDATE diff shows the same changed lines as the reviewed commits (launch amendment 3).
- Answer model: `openai/gpt-5.6-terra`, Responses, reasoning `none`. Every server-log turn has
  `attemptedModels` equal to `["openai/gpt-5.6-terra"]`.
- Judge: `claude-sonnet-5`, rubric `v2.11`, pack `p9` (from `meta.judge` and from each row's
  verdict). Judge executable: Claude Code `2.1.299`, SHA-256
  `ba5ab7b8c195fa03ab8d5bf3915c76153b576a2c40e79a5c46e265e7ed9744b3`. The pin check passed before
  each judged command.
- `AGENT_ENVIRONMENT_SHA256` `44fab7741c89828747de93eb2a8f27dd7946493f907033d3c94427d339b91f12`.
  `ENV_CHECK` passed before each paid command (the probe and the four runs).
- Cases SHA-256 `207ca631c052341b73a3b0ed173104e8848c6f3f824e97bdd977a6ba6127f16d` in all four runs.
- Counter SHA-256 `2a99d5146cf48b3438d774f583027764ca225c43cb0c64378c16fcddca88c36f`; self-check 23 of
  23 before the count.
- Source probe (`--sha256`): `414667aa38583bc99d775e02c7efe3e5a8a731f33e756668141052e05fe1205e`
  before each run and after the last run (04:40:15Z). No verdict difference crosses a changed
  value.

## Timeline and slot checks (UTC, 2026-10-14)

| Time | Step | Gate (raven, listener, load1, total for information) |
| --- | --- | --- |
| 04:18–04:26 | Load wait: 64.30 at 04:18Z; the gate waited until 11.34 at 04:26:11Z (within 30 minutes) | — |
| 04:26:19 | `base-a` starts on port 8799 | 0, 0, 10.60, 18 |
| 04:26:34 | BASE receipt probe | — |
| 04:27:04–04:29:53 | B1 | — |
| 04:30:31 | `base-a` stopped; `candidate` starts | 0, 0, 9.09, 17 |
| 04:30:56–04:34:01 | C1 | — |
| 04:34:06–04:36:59 | C2 | — |
| 04:37:17 | `candidate` stopped; `base-b` starts | 0, 0, 4.72, 22 |
| 04:37:30–04:40:14 | B2; final source probe 04:40:15 | — |
| 04:40 | `base-b` stopped | raven 0 |

- 25 answer turns (the probe and 24 method turns). Nobody sent a manual, browser, or `--preflight`
  turn. One `GET / 200` line appeared in the `candidate` server output right after it started, before
  C1. It is not a chat turn: the log holds exactly 12 `demo-chat` turns for C1 and C2, and the
  turn-to-row mapping holds. Its source is not known.
- Contention check (slot condition 3): 0 rows with an `execute` or sandbox timeout or a host or
  server error in each run. Limit: max(B1, B2) + 1 = 1. Every run keeps its slot.

## Receipt probe and completeness

BASE receipt probe (`q-soroban-storage-types`, no judge): exit 0; `budget.status` `complete`; one
`eval-cost` frame, `error: null`, 3 of 3 calls reported; cost $0.0963855; finish `stop`; answer
2,135 characters; `attemptedModels` `["openai/gpt-5.6-terra"]`; tokens 34,620 / 820 / 35,440;
`demo-steps.mjs --strict-usage` exit 0. The probe passes the receipt gate.

| Run | Exit | `budget.status` | Calls reported | Missing costs | IDs | Finish `stop` + answer | HTTP, SSE, client errors | `eval-cost` frames | `demo-steps.mjs` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| B1 | 0 | complete | 12 of 12 | 0 | 6 frozen | 6 of 6 | 0 | 1 per row, `error: null` | exit 0 (turns 2–7) |
| C1 | 0 | complete | 12 of 12 | 0 | 6 frozen | 6 of 6 | 0 | 1 per row, `error: null` | exit 0 (turns 1–6) |
| C2 | 0 | complete | 12 of 12 | 0 | 6 frozen | 6 of 6 | 0 | 1 per row, `error: null` | exit 0 (turns 7–12) |
| B2 | 0 | complete | 12 of 12 | 0 | 6 frozen | 6 of 6 | 0 | 1 per row, `error: null` | exit 0 (turns 1–6) |

- Grade coverage: 24 of 24 cells have a valid grade. No initial-judge retry and no replacement.
- Log mapping: each turn's `searchCalls` and `executeCalls` equal the row's transcript counts.
- `finalStepCoverage` is 0 in all three logs, so the final-step rule is unexercised.
  `usageMismatches` is empty.
- Incident (no effect): the first `demo-steps.mjs` read of `candidate.log`, right after C2 and
  before the server stopped, reported "turn 12: no demo-chat event" (exit 1). The last event was
  not yet flushed to the `script` log. The read after the stop found 12 complete turns, exit 0.
- `npm run eval:plan`: 6 of 6 required covered in each run; mean on-plan ratio 1.00 (B1), 0.92
  (C1), 1.00 (C2), 0.92 (B2).

## Counts (M1 to M5)

Reader 1: the pinned counter plus a direct read by the collector. Reader 2: a separate subagent
(Claude Sonnet), from the result files and the catalog
(`/private/tmp/claude-501/w1013/clip-v2-reader2.md`). The readers agree on every M1, M2, marker,
and routing cell.

| Run | M1 target rows | M1 controls | M2 (`invalid-args`) | M2 non-docs | M3 marked search results (counter) | M4 unknown, unresolved, unparsed | Docs calls |
| --- | ---: | ---: | ---: | ---: | ---: | --- | ---: |
| B1 | 1 | 0 | 1 | 0 | 0 | 0, 0, 0 | 6 |
| C1 | 0 | 0 | 0 | 0 | 14 | 0, 0, 0 | 9 |
| C2 | 0 | 0 | 0 | 0 | 14 | 0, 0, 0 | 9 |
| B2 | 2 | 0 | 2 | 0 | 0 | 0, 0, 0 | 8 |
| **BASE** | **3** | **0** | **3** | **0** | **0** | | 14 |
| **CANDIDATE** | **0** | **0** | **0** | **0** | **28** | | 18 |

M1 detail: B1 anchor `search_anchor_sep_docs({ hitsPerPage: 3 })`; B2 anchor
`search_anchor_sep_docs({ hitsPerPage: 3 })`; B2 stablecoin `search_asset_token_docs({ hitsPerPage: 5 })`.
Each has one matching `[invalid-args: query]` entry. In CANDIDATE, every target-operation call
passed `query` (for example `search_anchor_sep_docs({ query: "what is an anchor", hitsPerPage: 3 })`).

Markers per row (hit cards / `widerCandidates` cards):

| Row | C1 | C2 |
| --- | --- | --- |
| anchor (target) | 13 / 0 | 13 / 0 |
| stablecoin (target) | 10 / 0 | 11 / 0 |
| reserve | 12 / 0 | 12 / 0 |
| SCF | 4 / 1 | 6 / 2 |
| SEP-45 | 10 / 1 | 12 / 0 |
| storage | 12 / 0 | 12 / 0 |

- Target-card exposure: the target-operation card appeared in all eight target row-runs. In BASE
  it was clipped with no marker. In each CANDIDATE target row-run its signature held
  `required input: query`. No BASE search result holds the text `required input:`.
- All six rows are exposed in CANDIDATE.

M5, `search` result characters per row (B1, B2 / C1, C2): anchor 24,073, 24,126 / 23,670, 22,688;
stablecoin 23,930, 20,355 / 23,970, 19,277; reserve 10,647, 15,451 / 15,450, 15,450; SCF 17,775,
26,516 / 16,277, 17,678; SEP-45 15,848, 15,848 / 15,842, 15,355; storage 13,049, 20,665 / 20,675,
20,675. The search counts per row differ between runs (2 or 3), so the totals vary with the
queries. M5 shows no consistent card-cost increase in CANDIDATE.

## Reading rules

| Rule | Result |
| --- | --- |
| 1 Completeness and grade coverage | Met. Four complete runs; 24 of 24 grades. |
| 2 Arm integrity | Met. Every CANDIDATE target row-run that shows a target card shows a `query` marker. No BASE result shows a marker. |
| 3 BASE M1 on target rows ≥ 2 | Met (3). |
| 3 CANDIDATE M1 on target rows ≤ 1 | Met (0). |
| 3 Controls M1 not higher in CANDIDATE | Met (0 and 0). |
| 3 No routing regression | Met (table below). |
| 3 No verified answer regression | Met. No row has both CANDIDATE grades worse than both BASE grades. |
| 3 Protocol controls pass routing in both CANDIDATE runs | Met (E or T in all six cells). |
| 3 No tool-loop defect in a CANDIDATE row | Met. |
| 4 FAIL conditions | None holds. M2 non-docs is 0 in all runs. |
| 6 Confirmation re-judge | List empty (ledger, commit `00c07eac`, before any re-judge). No re-judge ran. |
| 7 Failed confirmation re-judge | Not applicable. |
| 8 Live check of CANDIDATE `wrong` | Two cells, both checked at 2026-10-14T04:41Z (below). Neither is a factual error, and neither forms a regression. |

Live checks (rule 8):

- C1 `q-scf-build-award-cap` `wrong`: the answer says "up to US$150,000 … paid in XLM". The live SCF
  awards page (`communityfund.stellar.org/awards`) lists "$150K in XLM" as the maximum Build award,
  paid in tranches. The facts are correct. The `wrong` comes from must-avoid 3 (an undated
  changeable figure) and the missing tranche fact. B1, B2, and C2 have the same facts and got
  `partial`.
- C2 `q-protocol-base-reserve-min-balance` `wrong`: the answer says the base reserve is "currently
  0.5 XLM" and gives `(2 + subentries) × base reserve`. The live docs page
  (`developers.stellar.org/docs/learn/fundamentals/lumens`) says "One base reserve is currently
  0.5 XLM". The `wrong` comes from must-avoid 1 (no sponsorship terms), the known `sd-046` area. B1
  is also `wrong` for the same reason.

## Per-row grades and routing

| Row | Role | B1 | B2 | C1 | C2 | Change |
| --- | --- | --- | --- | --- | --- | --- |
| `q-anchor-list-builders-discovery` | Target | correct / T | partial / T | partial / T | partial / T | None (C equals B2) |
| `q-asset-stablecoin-issuers-discovery` | Target | partial / T | correct / T | partial / T | partial / T | None (C equals B1) |
| `q-protocol-base-reserve-min-balance` | Control | wrong / E | partial / E | partial / E | wrong / E | None |
| `q-scf-build-award-cap` | Control | partial / E | partial / T | wrong / E | partial / E | None (C2 equals B) |
| `q-sep-45-contract-auth` | Control | partial / E | partial / E | partial / T | partial / E | None |
| `q-soroban-storage-types` | Control | partial / E | partial / E | partial / E | partial / E | None |

- Class counts: BASE E 7, T 5, O 0, N 0. CANDIDATE E 8, T 4, O 0, N 0.
- Totals: B1 1 correct, 4 partial, 1 wrong. B2 1, 5, 0. C1 0, 5, 1. C2 0, 5, 1.
- Monitor only (not a rule input): CANDIDATE has no `correct` cell; BASE has two (one on each
  target row). Reader 2 traced every cell where a CANDIDATE grade is below some BASE grade:
  - anchor: B1 states the data date and got `correct`; B2, C1, and C2 give no date and got
    `partial` (answer content; the BASE arm itself splits);
  - stablecoin: the four answers are nearly the same; the B2 judge read a dominance statement that
    the B2 text does not hold (judge variance);
  - reserve: C2 and B1 retrieved text without sponsorship terms and both got `wrong`; B2 and C1
    retrieved `numSponsoring` and got `partial` (retrieval and answer variance inside each arm);
  - SCF: C1 names no source and adds a valuation sentence; its judge went to `wrong` where the
    same facts got `partial` elsewhere (answer content plus judge strictness).
  None of these is a shared CANDIDATE effect. No reader found a path from the marker to a lower
  grade.

## Spend

| Command | Cap (USD) | Answer (USD) | Judge (USD) | Total (USD) | Highest call (USD) |
| --- | ---: | ---: | ---: | ---: | ---: |
| BASE receipt probe | 1 | 0.0963855 | 0 | 0.0963855 | 0.0963855 (answer) |
| B1 | 3 | 0.3677998 | 0.4557164 | 0.8235162 | 0.0935744 (judge) |
| C1 | 3 | 0.4160236 | 0.4489484 | 0.8649720 | 0.1256729 (answer) |
| C2 | 3 | 0.3323356 | 0.4421224 | 0.7744580 | 0.0886864 (judge) |
| B2 | 3 | 0.3600800 | 0.4458356 | 0.8059156 | 0.0866624 (judge) |
| **Total** | **22** | **1.5726245** | **1.7926228** | **3.3652473** | — |

Decimal sums of `budget.calls[].costUsd`. No call exceeded $0.30. No cost is missing. Cap files set
consumed counts 0/0, 6/6, 12/12, 18/18 (the actual counts). The replacement, the re-judges, the
rule 7 retries, and the initial-judge retries were not used.

## Deviations

1. **Gateway headroom** was not read (no CLI read; the dashboard is not open to the lane), as in
   the first measurement. The Gateway part of this plan was about $1.57.
2. **Load wait.** The first gate read was 64.30 (1-minute) at 04:18Z. The lane waited under slot
   condition 2. The load reached 11.34 at 04:26:11Z, inside the 30-minute limit.
3. **`GET /` line** in the `candidate` output (see "Timeline"). No chat turn came from outside the
   runner.

## Artifacts

All under `/private/tmp/raven-clip-marker-v2/` (outside the repository).

| Artifact | SHA-256 |
| --- | --- |
| `results/receipt-base/2026-10-14T04-26-34-273Z-dcfc2f6d-…-playground-semantic.json` | `ba92c6116d5a883d4a0a40b7bf9ace9293ff65598c575c85ebdea2435ab6998e` |
| `results/b1/2026-10-14T04-27-04-345Z-d9a70838-…-playground-semantic.json` | `be60d4d2696f44f9a599438983ccd8d0e536c9b5eb06a9662586e78c89e66299` |
| `results/c1/2026-10-14T04-30-56-723Z-9ab9f5ef-…-playground-semantic.json` | `3954097508883c66117360444ef70fb414cb457611cf4db39e2dd394cd49dc9a` |
| `results/c2/2026-10-14T04-34-06-829Z-f7a21c08-…-playground-semantic.json` | `ec11f8f64b8124ea413761cb06efef610e5a092d527c52d870b89154d47aabdb` |
| `results/b2/2026-10-14T04-37-30-299Z-836f01aa-…-playground-semantic.json` | `ca7ee06978679c99c17038a56410d1119f61aab1f9d24d7b6d34bdb2f80a8d3a` |

Server logs: `server/base-a.log`, `server/candidate.log`, `server/base-b.log`. Gate receipts:
`server/start-{base-a,candidate,base-b}.txt`. Counter output: `results/count.json`. Step reports:
`results/{receipt,b1,cand,b2}-steps.json`. Run logs: `results/{receipt,b1,c1,c2,b2}.out`. Plan
regrades: `results/plan-{b1,c1,c2,b2}.out`. Reader 2: `/private/tmp/claude-501/w1013/clip-v2-reader2.md`.

The claim stays narrow: a primary-model, six-case Playground screen on `0a60d98a`. It does not cover
the fallback model or the MCP surface.
