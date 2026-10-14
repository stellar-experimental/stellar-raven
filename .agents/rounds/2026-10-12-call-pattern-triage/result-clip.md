# Playground clip marker — measurement result

Plan: [`plan-clip-marker.md`](plan-clip-marker.md), with launch amendment 1 and deviation 1 in the
[triage ledger](../2026-10-12-call-pattern-triage.md) ("Measurement results").
Collector: lane T (Claude Opus 5.5, high). Collection date: 2026-10-14 UTC (2026-10-13 local).
Post-run review: [`review-post-run-astra.md`](review-post-run-astra.md) (Codex `gpt-6-astra`,
high, on `26ee296a`). Lane T2 reconciled it in this file and in the ledger.

## Final verdict on `f7b1b775`: PASS (post-run review)

The collector proposed FAIL. The non-author post-run review does not confirm that FAIL. The
orchestrator accepts the review verdict. **The clip marker passes this historical screen on
`main` `f7b1b775`.** It does not cover the later `main` `0a60d98a` (#271), which changes
`src/demo/` evidence labels. So the clip gets one more measurement on the new `main` before merge
([result-clip-v2.md](result-clip-v2.md)).

- The marker works on its target. M1 on the two target rows fell from 3 (BASE) to 0 (CANDIDATE).
  Both target rows saw the marker `required input: query` on the target card in all four
  CANDIDATE row-runs.
- Routing does not regress. The protocol controls pass in both CANDIDATE runs. No tool-loop
  defect occurs.
- One control row, `q-scf-build-award-cap`, has CANDIDATE grades `partial`, `partial` against
  BASE grades `correct`, `correct`. The rule 6 re-judge reproduced the B1 and C1 pair (B1
  `correct`, C1 `partial`).
- The reviewer's independent trace (the written non-author trace rule; rule 3 imports the
  ai-upgrade answer rules, which say "A judge verdict alone does not establish a regression"):

  | Cell | Answer content | Judge reason | Independent trace |
  | --- | --- | --- | --- |
  | B1 | $150,000, XLM, four installments, date, source | Accepts four installments as the tranche fact | Baseline standard |
  | B2 | $150,000, XLM, four installments, date, source | Accepts four installments as the tranche fact | Same baseline standard |
  | C1 | $150,000, XLM, date, source; no installments | Missing the tranche fact | Real answer omission |
  | C2 | $150,000, XLM, four installments, date, source | Requires an explicit link to milestones | Inconsistent standard against B1 and B2 |

- So C1's omission is real, but it does not repeat in C2. The C2 grade difference is judge
  variance. No content regression occurs in both CANDIDATE repetitions, so rule 4 ("a confirmed
  verified answer regression") does not hold. Rule 6 confirms the B1 and C1 pair only; it does
  not cancel the content trace. The review keeps every stored grade and adds no threshold, no
  exception, and no paid re-judge.
- Every PASS condition of rule 3 holds.

## Arms and identities

| Item | BASE | CANDIDATE |
| --- | --- | --- |
| Commit | `f7b1b77506acda9b674fb67610fbfd8b8e029e13` (`main`) | `fb84c1996108cd80a9d737d9f866dbaf7222a8ce` |
| Tree | `227ee549a1d91aa09b03eb9946df09b0047be740` | `ee10375356c64084bc328f7eedc2116f63aaadf0` |
| Generation | `3f90c8cf41ba3b9b53e620f006277ee1960db5f6c3d3a930e61d6812750cded7` | `c83bb07086209ef2b78e010d6f184224501d101078958ae35c55e3839e545f3b` |
| Server revision line | `f7b1b775…` (`base-a`, `base-b`) | `fb84c199…` (`candidate`) |
| SDK receipt | `7.0.137 4.0.91` at each start | `7.0.137 4.0.91` at the start |

- Answer model: `openai/gpt-5.6-terra`, Responses, reasoning `none`. Every server-log turn has
  `attemptedModels` equal to `["openai/gpt-5.6-terra"]`.
- Judge: `claude-sonnet-5`, rubric `v2.11`, pack **`p9`** (the `main` default after #272; recorded
  from `meta.judge` and from each row's verdict). These grades are not comparable with stored `p6`
  grades.
- Judge executable: Claude Code `2.1.296`, SHA-256
  `c9b5341637becbd423ddffc5b254afb645682a3868cb708bbc6cc0e7bb419937`. The pin check passed before
  each judged command and each re-judge.
- `AGENT_ENVIRONMENT_SHA256` `2a41a9e687b744638ab6c7dd6f65e835a05d9345ef3fcb1d317af01133726bec`.
  `ENV_CHECK` passed before each paid command.
- Cases SHA-256 `207ca631c052341b73a3b0ed173104e8848c6f3f824e97bdd977a6ba6127f16d` in all four runs.
- Counter SHA-256 `2a99d5146cf48b3438d774f583027764ca225c43cb0c64378c16fcddca88c36f`; self-check 23 of
  23 before each use.
- Source probe: `414667aa38583bc99d775e02c7efe3e5a8a731f33e756668141052e05fe1205e` before each run and
  after the last run. No verdict difference crosses a changed value.

## Timeline (UTC, 2026-10-14)

| Time | Step |
| --- | --- |
| 00:15:09 | Checkpoints. Server-slot count 5 (foreign server); deviation 1 decided by the orchestrator. |
| 00:18:50 | `base-a` starts on port 8799 (count 5, no listener on 8799). |
| 00:18:58 | BASE receipt probe |
| 00:19:33 | Source probe, pin, environment check, then B1 (00:19:34–00:22:23) |
| 00:22:48 | `base-a` stopped (count 5, no listener) |
| 00:23:09 | `candidate` started; C1 (00:23:09–00:26:18), then C2 (00:26:18–00:29:48) |
| 00:30:05 | `candidate` stopped; `base-b` started |
| 00:30:26 | B2 (00:30:26–00:33:35); final source probe 00:33:35 |
| 00:33:46 | `base-b` stopped |
| 00:34:47 | Rule 6 re-judges (B1, then C1) |

25 answer turns in 15 minutes (the receipt probe plus 24 method turns; step files 7 + 12 + 6;
corrected by the post-run review). Nobody sent a manual, browser, or `--preflight` turn.

## Receipt probe and completeness

BASE receipt probe (`q-soroban-storage-types`, no judge): exit status not captured (see
"Deviations"); `budget.status` `complete`; one `eval-cost` frame, `error: null`, 3 of 3 calls
reported; cost $0.0842625; finish `stop`; answer 2,089 characters; `attemptedModels`
`["openai/gpt-5.6-terra"]`; tokens 30,222 / 726 / 30,948; `demo-steps.mjs --strict-usage` exit 0.
The probe passes the receipt gate.

| Run | Exit | `budget.status` | Calls reported | Missing costs | IDs | Finish `stop` + answer | HTTP, SSE, client errors | Unfinished tool calls | `eval-cost` frames | `demo-steps.mjs` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| B1 | 0 | complete | 12 of 12 | 0 | 6 frozen | 6 of 6 | 0 | 0 | 1 per row | exit 0 (turns 2–7) |
| C1 | 0 | complete | 12 of 12 | 0 | 6 frozen | 6 of 6 | 0 | 0 | 1 per row | exit 0 (turns 1–6) |
| C2 | 0 | complete | 12 of 12 | 0 | 6 frozen | 6 of 6 | 0 | 0 | 1 per row | exit 0 (turns 7–12) |
| B2 | 0 | complete | 12 of 12 | 0 | 6 frozen | 6 of 6 | 0 | 0 | 1 per row | exit 0 (turns 1–6) |

- All four runs are complete. Grade coverage: 24 of 24 cells have a valid grade. No
  initial-judge retry and no replacement ran.
- Log mapping: each turn's `searchCalls` and `executeCalls` equal the row's transcript counts.
- Every turn has 3 steps and 1 `execute` call. `finalStepCoverage` is 0 in all three logs, so the
  final-step rule is unexercised. `usageMismatches` is empty.
- `npm run eval:plan`: 6 of 6 required covered in each run; mean on-plan ratio 1.00, 1.00, 1.00,
  and 0.92 (B2).

## Counts (M1 to M5)

Reader 1: the pinned counter plus a direct script read by the collector. Reader 2: a blind
subagent read of the four result files and the catalog (`/private/tmp/claude-501/w1013/clip-reader2.md`).
The two readers agree on every M1, M2, and routing cell.

| Run | M1 target rows | M1 controls | M2 (`invalid-args`) | M2 non-docs | M3 marked search results (counter) | M4 unknown, unresolved, unparsed | Docs calls |
| --- | ---: | ---: | ---: | ---: | ---: | --- | ---: |
| B1 | 1 | 0 | 1 | 0 | 0 | 0, 0, 0 | 7 |
| C1 | 0 | 0 | 0 | 0 | 12 | 0, 0, 0 | 6 |
| C2 | 0 | 0 | 0 | 0 | 10 | 0, 0, 0 | 6 |
| B2 | 2 | 0 | 2 | 0 | 0 | 0, 0, 0 | 6 |
| **BASE** | **3** | **0** | **3** | **0** | **0** | | 13 |
| **CANDIDATE** | **0** | **0** | **0** | **0** | **22** | | 12 |

M1 detail: B1 anchor `search_anchor_sep_docs({ hitsPerPage: 3 })`; B2 anchor
`search_anchor_sep_docs({ hitsPerPage: 3 })`; B2 stablecoin `search_asset_token_docs({ hitsPerPage: 5 })`.
Each has one matching `[invalid-args: query]` entry.

Target-card exposure: the target-operation card appeared in all eight target row-runs. In BASE it
was clipped with no marker. In each CANDIDATE target row-run it was clipped and its marker named
`query`. Every CANDIDATE row-run showed at least 3 markers on hit cards. Markers per row, hit
cards only: 11, 11, 6, 4, 10, 6 in C1; 12, 9, 6, 3, 6, 6 in C2. The advisory `widerCandidates`
cards hold more markers: C1 SCF 1 and SEP-45 1, C2 SCF 1. With them, C1 SCF has 5 and SEP-45 11,
and C2 SCF has 4 (post-run review correction; the label was missing). All six rows are exposed
in CANDIDATE. The scope does not change target exposure or the M1 counts.

M5, `search` result characters per row (B1, B2 / C1, C2): anchor 23,470, 23,470 / 22,162, 22,202;
stablecoin 22,327, 23,348 / 19,742, 18,638; reserve 15,049, 15,081 / 10,446, 10,446; SCF 15,886,
15,883 / 15,875, 17,277; SEP-45 15,446, 15,446 / 15,440, 12,535; storage 12,662, 12,670 / 12,646,
12,646. Each row made the same number of `search` calls in all four runs. The differences come
from different search queries and hits, not only from the marker. M5 shows no card-cost increase
in CANDIDATE.

## Reading rules

| Rule | Result |
| --- | --- |
| 1 Completeness and grade coverage | Met. Four complete runs; 24 of 24 grades. |
| 2 Arm integrity | Met. Every CANDIDATE target row-run that shows a target card shows a `query` marker. No BASE result shows a marker. |
| 3 BASE M1 on target rows ≥ 2 | Met (3). |
| 3 CANDIDATE M1 on target rows ≤ 1 | Met (0). |
| 3 Controls M1 not higher in CANDIDATE | Met (0 and 0). |
| 3 No routing regression | Met (table below). |
| 3 No verified answer regression | Met after the post-run review trace. The collector first read **not met** (`q-scf-build-award-cap`, B1 and C1 pair reproduced by the rule 6 re-judge). The non-author trace finds C1's omission real but not repeated; the C2 difference is judge variance. |
| 3 Protocol controls pass routing in both CANDIDATE runs | Met (E in all six cells). |
| 3 No tool-loop defect in a CANDIDATE row | Met. |
| 4 FAIL conditions | None holds after the non-author trace (the collector first read one: the SCF control). |
| 6 Confirmation re-judge | List written in the ledger before spend (commit `eb038312`). B1: `correct` → `correct`. C1: `partial` → `partial`. Reproduced. |
| 7 Failed confirmation re-judge | Not needed. Both re-judges returned a valid grade. |
| 8 Live check of CANDIDATE `wrong` | One cell: C2 `q-protocol-base-reserve-min-balance`. Live read of the official accounts page at 2026-10-14T00:35:56Z confirms "One base reserve is currently 0.5 XLM" and the per-subentry reserve. The `wrong` comes from must-avoid 1 (no sponsorship terms in the formula), the known `sd-046` area. Both BASE cells are also `wrong`, so it is not a regression. |

## Per-row grades and routing

| Row | Role | B1 | B2 | C1 | C2 | Change |
| --- | --- | --- | --- | --- | --- | --- |
| `q-anchor-list-builders-discovery` | Target | partial / T | correct / T | correct / T | correct / T | None (C not worse) |
| `q-asset-stablecoin-issuers-discovery` | Target | wrong / T | partial / T | partial / T | partial / T | None (C not worse) |
| `q-protocol-base-reserve-min-balance` | Control | wrong / E | wrong / E | partial / E | wrong / E | None |
| `q-scf-build-award-cap` | Control | correct / E | correct / E | partial / E | partial / E | Consistent by grade; B1/C1 pair reproduced; traced: C1 omission, C2 judge variance (no repeated content regression) |
| `q-sep-45-contract-auth` | Control | partial / E | partial / T | partial / E | partial / E | None |
| `q-soroban-storage-types` | Control | partial / E | partial / E | partial / E | partial / E | None |

- Class counts: BASE E 7, T 5, O 0, N 0. CANDIDATE E 8, T 4, O 0, N 0. No row fails routing in
  any run.
- Totals: B1 1 correct, 3 partial, 2 wrong. B2 2, 3, 1. C1 1, 5, 0. C2 1, 4, 1.
- The two target rows improved or held. This is an observation, not a rule input.

SCF trace (answer texts read in full):

- B1 `correct`: "up to US$150,000 … paid in four installments", dated, sourced.
- B2 `correct`: the same facts, "paid in four installments", dated, sourced.
- C1 `partial`: the cap, XLM payout, date, and source; no installments. The judge lists the
  missing tranche fact. The re-judge agrees. This is answer content.
- C2 `partial`: "typically in four installments", dated, sourced. The judge says "installments"
  does not name milestone triggers. B1 and B2 have the same wording and got `correct`. This looks
  like judge variance. C2 was not re-judged: the plan re-judges B1 and C1 only.
- The SCF row saw lumenloop and scout markers in CANDIDATE (3 to 4 per run on hit cards; 4 to 5
  with `widerCandidates`). Its routing class did not change (E in all four runs). B1, C1, and C2
  called `lumenloop` and `scout`; B2 called `scout` only (post-run review correction). No reader
  found a path from the marker to the omitted fact.

## Spend

| Command | Cap (USD) | Answer (USD) | Judge (USD) | Total (USD) | Highest call (USD) |
| --- | ---: | ---: | ---: | ---: | ---: |
| BASE receipt probe | 1 | 0.0842625 | 0 | 0.0842625 | 0.0842625 |
| B1 | 3 | 0.3723337 | 0.4259698 | 0.7983035 | 0.0964584 (judge) |
| C1 | 3 | 0.3248531 | 0.4532792 | 0.7781323 | 0.0929744 (judge) |
| C2 | 3 | 0.2903399 | 0.4702310 | 0.7605709 | 0.1152964 (judge) |
| B2 | 3 | 0.3306076 | 0.4395236 | 0.7701312 | 0.0898504 (judge) |
| Re-judge B1 (SCF) | 1 | 0 | 0.0790134 | 0.0790134 | 0.0790134 |
| Re-judge C1 (SCF) | 1 | 0 | 0.0597824 | 0.0597824 | 0.0597824 |
| **Total** | **22** | **1.4023968** | **1.9277994** | **3.3301962** | — |

No call exceeded $0.30. No cost is missing. Cap files set consumed counts 0/0, 6/6, 12/12, 18/18.
The replacement, the rule 7 retries, and the initial-judge retries were not used.

## Deviations

1. **Server slot** (ledger deviation 1): a foreign `wrangler dev` server (another project, port
   8787) ran throughout. The orchestrator approved the run with conditions: count 5 or 0 before
   each start, port 8799, no listener on it before each start. The count was 5 and no listener
   was on 8799 before each start and after each stop.
2. **Receipt probe exit code.** The collector piped the probe output to `tail`, so the shell did
   not keep the exit code. The artifact shows a complete, valid run and the receipt gate passed on
   the artifact and the log. No later paid command used a pipe.
3. **Gateway headroom.** The `stellar-raven-demo` spend rule was read privately. The current spend
   was not read (no CLI read exists; the dashboard was not opened). The Gateway part of this plan
   was about $1.40.
4. **Re-judge artifacts.** `re-judge.mjs` wrote to `eval/qa/results/` in the BASE worktree. The
   collector moved them to `$B/results/rejudge-b1.json` and `$B/results/rejudge-c1.json`.

## Artifacts

All under `/private/tmp/raven-clip-marker/` (outside the repository).

| Artifact | SHA-256 |
| --- | --- |
| `results/receipt-base/2026-10-14T00-18-59-012Z-d6b8ca84-…-playground-semantic.json` | `5b289c94878c231f7cc5c5dfc3e9657c703c950491f40f355225b1df7f21fd0a` |
| `results/b1/2026-10-14T00-19-34-292Z-bf49afae-…-playground-semantic.json` | `6c3bb271471391db2fa29c0372bb905c55cd8cf109af10fe014dc975ca7600cc` |
| `results/c1/2026-10-14T00-23-09-684Z-0057680e-…-playground-semantic.json` | `226f1e60b88f09af4e14080f0591b81be2b3d91480a8608e57d3a37c899f00b3` |
| `results/c2/2026-10-14T00-26-18-849Z-427dccd2-…-playground-semantic.json` | `2983b5fb1a13d9a3bb6cda77a2c3b0a43415f1dbc2c3a5912e9368ec9c9be8ca` |
| `results/b2/2026-10-14T00-30-26-876Z-ce0e5313-…-playground-semantic.json` | `0b99ddcdae8aad256c2a2f006fc9a62914d709cb8b4fda1f742e60c5d7fbdd7d` |
| `results/rejudge-b1.json` | `75641de84b0d303bb05a28a3f4b6e44ee3b8680357c3bae5c22f741eeade3fb2` |
| `results/rejudge-c1.json` | `8035f1363581e115bc6d0a6657ad760418651e946cf0c54f97f7a940c9ec045c` |

Server logs: `server/base-a.log`, `server/candidate.log`, `server/base-b.log`. Counter output:
`results/count.json`. Step reports: `results/b1-steps.json`, `results/cand-steps.json`,
`results/b2-steps.json`.

The claim stays narrow: a primary-model, six-case Playground screen. It does not cover the
fallback model or the MCP surface.
