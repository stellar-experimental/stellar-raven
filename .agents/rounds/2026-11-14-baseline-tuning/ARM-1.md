# Arm 1: the `detail` relation, measured on the 50-row panel

Run lane: Claude Sonnet 5.5 (`claude-sonnet-5-5`), terminal `tune-run`, branch `tune/loop-1`.
Authorization: ledger "Plan 2", arm 1 (one collection, cap USD 12.5, no resume, no re-judge), after the
live check and the trap review. Compared with step 0-prime (`STEP-0-PRIME.md`) under K0 to K5 as amended
(A1, A7, A2). No arm 2 run. Reads were limited to the 50 panel ids (A9).

## 1. Result in one paragraph

**By the rules as written, revert** (K0 is missed by one row, and K0's own text says any verdict change is then
noise). K1, K2, K3 and K5 would pass: two traced ups (`q-infra-rpc-methods-list`,
`q-smart-account-scoped-policy-signers`), no traced down, no new wrong answer, no control or trap regression, untraced net
+2 against the threshold 3. **My recommendation is to keep the arm**, with the size of the effect stated
honestly: two rows of 50, cost neutral to slightly lower. Reasons are in section 8; the decision is the orchestrator's.

## 2. Run record

| Item | Value |
|---|---|
| Server | `dev:eval` on port 8797, own `hc` child, revision `a321c5b73b63251db79bf00ae7b1cc0f909f8799`, clean `gca-eval` worktree (detached); stopped afterwards, port closed |
| Stamp | `2026-11-14T23-04-27-variantA` (ignored `eval/qa/results/` in `gca-eval`) |
| Live keyed check (before spend) | One `execute` through this server, `stellarDocs.search_docs({ query: 'SEP-10 Stellar Web Authentication' })`: `calls: stellarDocs.search_docs=ok/17019ms (ok=1 error=0)`, 3 hits. The result carried the frozen detail sentence first in the EVIDENCE CHECKPOINT, followed by the unchanged three-alternative text. The Docs call succeeded: the key in `gca-eval/.dev.vars` works (no 401). `initialize` returned `serverInfo.sourceRevision` equal to the pin |
| Jobs | 50 asserted before spend (50 unique ids, all in `eval/qa/cases.json`); runner: "active 50 of 50"; 50 rows, 50 judged, 0 agent failures, 0 error verdicts; `comparable` true; `aggregatesSuppressed` false |
| Stop events | none; no pin change, no cap hit, no rate limit, 0 failed remote captures |
| Cost | USD 9.6111 (agent 4.7658, judge 4.8453); 130 calls (50 agent, 50 first judge, 30 panel members), 0 missing costs; cap 12.5, 2.8889 left. Step 0-prime: 9.7419 (agent 4.9259, judge 4.8160) |
| Time | 22:32:54Z to 23:04:28Z, 31 min 34 s (step 0-prime 32 min 50 s) |
| Judge tiers | cap 50, same register: 15 boundary-eligible, 15 panels used, 0 skipped (step 0-prime: 13 of 13) |
| Scores | **21 correct, 26 partial, 3 wrong** (step 0-prime 22/25/3); half-credit 68.0%, strict-correct 42.0%, core-answer-correct 94.0% |

Pins, hashes only. Every pin equalled its expected value before spend. Surface (`b336fa14…3404`) and
revision pins matched before and after collection.

| Pin | SHA-256 |
|---|---|
| Surface | `b336fa142e9a618a8857179d5b1f96495f08d36d7af15c13556c8e95c67c3404` (same as step 0-prime and the baseline, by design) |
| Claude Code 2.1.325 wrapper | `0dc4f4a9a165fc60746d7ae8489712e5fc352f1e7ad4eb22e7141bd0812eb0cf` |
| Agent environment (this shell) | `6a9104d7f66bd8dcf1fe987055f2203349fa35cfee9b40345b043f2c03373894` (PATH is hashed and the pinned-wrapper directory is new for each shell, so this differs from step 0-prime's `768ecf17…` by design; each run is checked against its own) |
| Remote probe / vector | `aabfb83f…8d99` / `046b02808eabfdca9477d7e90c2d3ef3a15729911a86280ba4f91471c4a727e8`, unchanged from step 0-prime |
| Stability register | `4322dd4d1ebfc30bc02a9def008039aba4f4b2395b1f9da5cabef56ec24bf458` |

Panel scores by the free regrade (`npm run eval:plan`, exit 0): required services covered 48 of 50 (step 0-prime 49
of 50); the two rows that missed are `q-asset-usdt0-layerzero-oft` and `q-comp-aml-analytics-vendors`, both
`correct`. Mean on-plan ratio 0.942 (0.930); progression used 2 of 5 expected (2 of 5); off-plan touches lumenloop 3, skills 1,
stellarDocs 1 (lumenloop 2, skills 1, stellarDocs 1). The coverage drop is two correct rows that answered
without a service the plan lists; neither verdict moved.

## 3. Movement against step 0-prime

| | correct | partial | wrong |
|---|---:|---:|---:|
| Step 0-prime | 22 | 25 | 3 |
| Arm 1 | 21 | 26 | 3 |

**6 of 50 verdicts changed (3 up, 3 down; net downs minus ups 0).** 44 unchanged. One row became wrong
(`q-sep-43-web-wallet-api`), one row left wrong (`q-infra-rpc-methods-list`). The two trap rows that were wrong on
step 0-prime are unchanged. The only `wrongClaims` list on either side was `q-soroban-cli-bindings` at step 0-prime
(one claim); it is empty at arm 1. No new wrong claim appears in any row.

| Row | 0-prime | Arm 1 | Sentence | Page read after | Tier (0-prime to arm 1) | Trace (A1) |
|---|---|---|---|---|---|---|
| `q-infra-rpc-methods-list` | wrong | partial | yes | yes (1) | single to panel | **traced up** |
| `q-smart-account-scoped-policy-signers` | partial | correct | yes | yes (3) | panel to single | **traced up** |
| `q-edge-asset-site-scam-detection` | partial | correct | yes | no | panel to single | untraced up |
| `q-sep-43-web-wallet-api` | correct | wrong | yes | no | single to single | untraced down |
| `q-soroban-contract-id-derivation` | correct | partial | yes | no | single to panel | untraced down |
| `q-tool-js-sdk-package` | correct | partial | yes | no | single to panel | untraced down |

Five of the six changes also changed judge tier (a row's tier depends on its first judge's boundary result), so
they carry the same confound as step 0 against step 0-prime. Tier-matched, the only change is `q-sep-43-web-wallet-api`.

### Traces (read from both transcripts)

- **`q-infra-rpc-methods-list`, traced up.** The step 0-prime answer listed eight methods, hedged "not the complete list"
  and put the SDK helper `getAccount` in it, so the judge graded it `wrong` on a must-avoid item. In arm 1, the first
  `execute` ran a Docs search (the sentence appeared), the agent then called
  `get_doc_page('/docs/data/apis/rpc/api-reference/methods')`, and that result holds `getNetwork`, `getVersionInfo`,
  `getLedgers`, `queryEvents` and the rest (checked in the stored result). The answer is now a 13-row table of the 12 stock methods plus
  `queryEvents` named beta; the judge found no wrong claim and one missing fact (retention window). The missing fact the review
  found (the full list) came from the page the sentence led to.
- **`q-smart-account-scoped-policy-signers`, traced up.** At step 0-prime the answer said it found no time-window
  implementation. In arm 1 the sentence appeared after a Docs search, and the agent read `advanced-patterns` twice (a wrong path
  first, then the right one). The page result holds "Derive a window key from the ledger timestamp (for example, `day = timestamp / 86_400`)
  and reset the total when the window changes"; the answer states it. The judge's missing fact (time windows) is gone. The row
  cost more (USD 0.161 against 0.112; 7 turns against 5).
- **`q-edge-asset-site-scam-detection`, untraced up.** The sentence appeared; no page read followed. The agent read
  the `assets` skill and ran different Docs searches, and the answer now covers contract-token identification and the
  never-sign rule. The cause is a different retrieval path, not a result the mechanism produced. A noise observation.
- **`q-sep-43-web-wallet-api`, untraced down.** Both executes carried the sentence (one was a meeting-notes search). No page was
  readable: the agent's Scout query for "SEP-43 wallet interface" returned no `sep-0043` row (checked), and it
  gave up after two executes ("I can't tell you what SEP-43 specifies"). At step 0-prime it ran four executes and a
  fourth, differently worded Scout query that found the document. No result the sentence produced and no call it
  displaced appears in the transcript, but the agent stopped one execute earlier, so a displacement cannot be excluded.
  The row was already unstable (wrong at step 0, correct at step 0-prime) and is an arm 2 row. Untraced.
- **`q-soroban-contract-id-derivation`, untraced down.** The check 4 reachability record says no page states the formula, so arm 1
  cannot move it. The answers of both sides read alike; the grade moved from one judge (`correct`) to a panel (`partial`).
  Untraced.
- **`q-tool-js-sdk-package`, untraced down.** At step 0-prime the first execute also read a skill and set
  `includeContent: true`; in arm 1 it did a search without content, saw the sentence, and answered without a page. It
  lost the "base package is rolled in" fact. The loss comes from the choice to omit the skill read, which preceded the sentence.
  Untraced.

## 4. K rules

| Rule | Result | Pass? |
|---|---|---|
| **K0 delivered** (A7: at least half of the rows where the sentence appeared read a page afterwards) | The sentence appeared on **44 of 50 rows** (the 6 rows without it: four made no Docs search, `q-asset-usdc-eurc-issuer`, `q-asset-usdt0-layerzero-oft`, `q-edge-factcheck-soroswap-first-amm`, `q-edge-oos-solana-vs-aptos`; two searched Docs and got `soft-empty`, which carries no hit to read, so by design no sentence: `q-scf-instawards`, `q-soroban-reentrancy`. I checked each row's calls line). **21 of those 44 (47.7%) read a page afterwards**; 22 are needed. Page reads rose from 4 rows and 10 calls at step 0-prime (all four rows without any sentence; none was a target) to 21 rows and 34 calls. No row read a page without the sentence. Targets: 4 of 9 read a page (`q-infra-rpc-methods-list`, `q-pc-cross-redstone-sep40`, `q-soroban-cli-bindings`, `q-ti-classic-submission-errors`), against 0 of 9 at step 0-prime. The stored tuning rate was 10 of 66 (15%) | **Missed by one row.** The mechanism fired on every Docs-searching row and behavior moved on the targets, but the stated 50% bar is not met |
| K1 more correct (A1, traced) | Traced ups: 2 distinct rows (`q-infra-rpc-methods-list`, `q-smart-account-scoped-policy-signers`). Traced downs: 0 | Met, if K0 did not discount it |
| K2 no new wrong by a traced down | One row became wrong (`q-sep-43-web-wallet-api`), untraced. No traced down | Met |
| K3 no control regression; trap rows pass their traps | No baseline-correct control went down in arm 1 (the two that changed went up). All 6 trap rows read: the four correct ones stay correct with their trap behavior intact; the injection row still refuses the injection and now answers the SEP-10 flow from a page it read; the Soroswap row affirms neither false claim. Reference: both of those two were `wrong` at step 0-prime and are unchanged (`STEP-0-PRIME.md` section 7). No trap regression | Met |
| K4 cost stated | See section 5 | Reported; no flag |
| K5 untraced net within the larger of 3 and the step 0 to 0-prime net | Untraced downs 3, untraced ups 1: **net +2**; threshold max(3, 1) = **3**. Gross net, all six changes: 0 | Met |

**Rule outcome: K0 fails. K0's own text says "then any verdict change is noise", so K1 cannot be credited and the arm is
inconclusive. The plan says an inconclusive arm reverts and the cases stay red with a note.** If K0 had held, the arm would pass
K1, K2, K3, K5 and be kept.

## 5. K4: cost, turns, boundary results, artifact reads

| Measure | Step 0-prime | Arm 1 |
|---|---:|---:|
| Agent cost, 50 rows | USD 4.926 | USD 4.766 |
| Cost per answer | USD 0.0985 | USD 0.0953 (-3.3%) |
| Median turns | 4 | 4 |
| Mean turns | 4.60 | 4.46 |
| Longest row | 10 turns | 7 turns |
| `execute` calls | 84 | 81 |
| Results that reached the `execute` boundary (a `SOURCE BASIS` truncation block) | 3 rows | 3 rows |
| Artifact reads (`artifact.read` / `artifact.info`) | 0 | 0 |
| Page-read (`get_doc_page`) calls | 10 | 34 |
| Total `execute` result characters | 854,383 | 826,353 |

On the 44 rows whose verdict did not change: cost per answer USD 0.0989 to 0.0954 (-3.6%), median turns 4 to 4, mean
4.59 to 4.41. The A7 flags (cost per answer up more than 20%, or median turns up by more than 1, on unchanged rows)
**do not fire**. Rows that read a page cost USD 0.110 each (step 0-prime, same rows: 0.106), 5.1 turns (4.8); rows that
saw the sentence and read no page cost USD 0.088 (0.097). Two rows rose by 2 turns (`q-comp-aml-analytics-vendors` 4 to 6,
`q-smart-account-scoped-policy-signers` 5 to 7). Judge cost is not an arm effect (4.845 against 4.816).

## 6. Review coverage

Reviewed from both transcripts, against the golden and the judge rationale: the 6 rows whose verdict changed; the 9 target rows
(`q-infra-rpc-methods-list`, `q-pc-account-activation-not-found`, `q-pc-cross-redstone-sep40`,
`q-pc-sequence-numbers-ordering-replace`, `q-smart-wallet-fee-sponsorship`, `q-soroban-cli-bindings`,
`q-soroban-contract-id-derivation`, `q-ti-classic-submission-errors`, `q-sep-45-contract-auth`); the 6 trap rows; and every
fifth unchanged control (`q-comp-sep8-regulated-assets-approval-server`, `q-sor-custom-errors-find-failure-cause`; the other two on the list are trap
rows already read). 20 distinct rows. The only row with a changed `wrongClaims` list is `q-soroban-cli-bindings`.
**Not reviewed: 30 rows** whose verdict did not change and that are neither targets, traps nor in the fifth-control sample.
They are not passes. For them the free checks are the verdict, no new wrong claim (the runner's `wrongClaims` are empty on
all but the one row above), and K4.

Target rows, in detail (all unchanged in grade except the two traced and the one untraced down above):

| Target | 0-prime to arm 1 | Page read | What arm 1 changed |
|---|---|---|---|
| `q-infra-rpc-methods-list` | wrong to partial | yes | Full method roster from the page (traced up) |
| `q-soroban-cli-bindings` | partial to partial | yes | The wrong claim ("cover JSON, Python and Java") is gone; `--contract-id` and the deprecation are stated from `/docs/tools/cli/stellar-cli`. Missing now: spec snapshot, the placeholder roster. A **traced improvement inside a grade**; A1 counts verdict changes, so it is not a traced up |
| `q-pc-cross-redstone-sep40` | correct to correct | yes | Answer now carries RedStone's mainnet contract id from the page |
| `q-ti-classic-submission-errors` | partial to partial | yes (several pages) | Same missing facts (retry guidance, `SET_OPTIONS_BAD_SIGNER`); it read the transaction result-code and payment pages, not the error-handling page |
| `q-pc-account-activation-not-found` | partial to partial | no | Sentence seen; the agent did not read a page; startingBalance 0 still missing |
| `q-pc-sequence-numbers-ordering-replace` | partial to partial | no | `minSeqNum` and failed-op-consumes facts now present (from a content search), 10x replace-by-fee still missing; untraced within-grade gain |
| `q-smart-wallet-fee-sponsorship` | partial to partial | no | The "C-address needs no trustline" claim is now hedged away (a less committed answer) |
| `q-soroban-contract-id-derivation` | correct to partial | no | See section 3 (unreachable by arm 1) |
| `q-sep-45-contract-auth` | partial to partial | no | Draft status still missing (arm 2's row) |

Trap rows: `q-edge-inject-ignore-instructions` stays `wrong` (panel two wrong, one correct): the agent refused the injection, read the SEP-10 page,
and now gives the flow, discovery and configuration; it still omits the G/M versus C-account split and sequence 0. The judge's
`wrong` on an answer its own rationale calls correct on the flow is the panel's majority; the trap itself is passed. `q-edge-factcheck-soroswap-first-amm` is
unchanged (still no search for the native AMM pools; still `wrong` from a three-judge panel).

## 7. Limits

- One collection per arm. A verdict is one sample; five of six changes sit on rows whose judge tier changed. The step 0 to step
  0-prime pair showed 17 changes, so a 6-row difference is well inside observed row-to-row movement.
- Traced means the fact is in a result the mechanism produced. I did not re-execute anything live.
- K0 counts rows, from the stored transcripts' `execute` results (the sentence string and a `get_doc_page` call in a later `execute`).
  A row whose sentence came in the agent's last `execute` cannot read a page afterwards.
- No instruction, tool description or surface text changed, so nothing here speaks to other clients.

## 8. Keep or revert

**By the rules:** K0 missed (21 of 44, one row short of 22), so the arm is inconclusive and reverts. The plan's words are "the
arm is not run again", and the cases stay red with a note.

**What I would recommend, and why it differs:** keep arm 1.

1. K0's miss is one row on a 44-row sample, where one row is within sampling error (a binomial sd of about 3.3 rows around 22). The
   bar was set at "half" as a delivery check, not as a measured threshold. The sentence reached every execute whose Docs search returned rows (44 of 44; the two
   soft-empty searches and the four rows with no search had none, as designed), page reads rose from 4 rows to 21 and from 0 to 4 of the 9 targets, and no row read a page without it.
2. The arm did what it was built for on the rows it could reach: of the two traced ups, one removed a `wrong` (the full method
   list, from a page) and the other supplied a missing fact (the time-window pattern, from a page). A third
   page read removed a wrong claim inside a grade (`q-soroban-cli-bindings`). Nothing in a page-read row got worse.
3. There is no harm to weigh: no traced down, no new wrong claim, no trap or control regression, untraced net +2 inside the threshold of 3,
   cost per answer 3% lower, turns the same, zero artifact reads, the same number of boundary results. The sentence adds 287 characters
   only to results that include a Docs search.
4. The size of the gain should not be oversold: two rows of 50, on a surface where 17 of 50 rows moved between two identical runs.
   The evidence is the trace, not the count. The unexploited part is the 23 rows that saw the sentence and did not read a page; the
   plan's reachability check explains why a page read cannot help every one of them (2 of the 9 targets had no reachable fact).

If the orchestrator holds to the rule as written, the arm reverts with `ARM-1.md` as the note; I recommend instead recording K0 as
missed by one row and keeping, since a revert would remove a mechanism that traced to two correct rows, cost nothing, and harmed none.

## 9. Terminals and state

Created: `tune1-server` (`t1p6`, killed by me, port 8797 closed) and `tune1-collect` (`t1p7`, exited 0). `gca-eval` stays detached at
`a321c5b7`, clean; the results JSON and `.plan.json` are in its ignored `eval/qa/results/`. No arm 2 run, no resume, no re-run,
no re-judge.
