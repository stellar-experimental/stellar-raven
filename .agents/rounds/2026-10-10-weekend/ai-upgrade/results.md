# `ai` upgrade with explicit tool strictness: measurement results

Plan: [`measurement-plan.md`](measurement-plan.md), with amendment 1 (new `main` base).
Collector: lane S (Claude Opus 5.5). Collection date: 2026-10-10.

## Verdict

**No regression found. The non-author result review accepts the result: MERGE-OK-WITH-FIXES.**
The review is [`review-result-fable.md`](review-result-fable.md). This document applies its findings 1 to 4.

- All four method runs are complete. Both receipt probes pass. No replacement ran.
- No case shows a routing regression. Two readers agree on all 24 routing classes.
- No case shows a verified answer regression under the plan's rule.
- The CANDIDATE protocol controls pass in both repetitions.
- No CANDIDATE row has a tool-loop defect. No arm has a tool error.
- The source probe value did not change during collection.

The two review items are closed by [`review-result-fable.md`](review-result-fable.md) (Claude Fable 5.1, not the author):

1. The reviewer re-derived every number, traced each grade difference, and reviewed every answer against its golden.
   The reviewer confirms that no difference is SDK-caused (see "Verified-answer rule").
2. The strictness diagnostics show strong evidence that BASE decoded `search` in strict mode.
   The CANDIDATE sends `strict: false`, so the decoding of `search` changes.
   The reviewer finds the inference sound and the CANDIDATE behavior acceptable, and slightly better (see "Strictness diagnostics").

Only the merge-time check of the owner's paired collection window stays open.

The claim stays narrow. This is a primary-model, six-case Playground screen.
It does not cover the fallback model, clipped clients, failure paths, or the MCP headline.
It does not prove that SDK behavior is unchanged.

## Arms and identities

| Item | BASE | CANDIDATE |
| --- | --- | --- |
| Commit | `0dc353b992b8c0688c051909b5b07b8e14956134` | `32d22a7128c909720d8d1e9cba131edc1bd3d313` |
| Run generation | `9a441ba64eeab9f56c0d6d851e9309fe04b790fb5242e5a51689218541cb4d4b` | `aa104042ef3e7e2328dcf93692586cd22cd5bb461167f55c41a6011ea5d9d5a8` |
| SDK receipt (`ai`, `@ai-sdk/openai`) | `7.0.79 4.0.47` at each start | `7.0.137 4.0.91` at the start |
| Server revision line | `0dc353b9…` in `base-a` and `base-b` | `32d22a71…` in `candidate` |

- Answer model: `openai/gpt-5.6-terra`, Responses mode, reasoning effort `none`, no fallback.
- Every turn in the server logs has `attemptedModels` equal to `["openai/gpt-5.6-terra"]`.
- Judge: `claude-sonnet-5`, rubric `v2.11`, pack `p6`.
- Judge executable: Claude Code `2.1.296`, SHA-256 `c9b5341637becbd423ddffc5b254afb645682a3868cb708bbc6cc0e7bb419937`.
  The pin check passed before each judged run. All four results record this identity.
- Cases SHA-256 (`meta.inputSnapshot.casesSha256`): `207ca631c052341b73a3b0ed173104e8848c6f3f824e97bdd977a6ba6127f16d` in all four runs.

## Timeline (UTC)

| Time | Step |
| --- | --- |
| 15:49 | Checkpoints pass again. `base-a` starts. |
| 15:50:08 | BASE receipt probe |
| 15:50:56 | Source probe, pin check, then baseline 1 (15:51:00–15:53:51) |
| 15:54:26 | `base-a` stops. `candidate` starts. |
| 15:54:46 | CANDIDATE receipt probe |
| 15:55:17 | Source probe, pin check, then candidate 1 (15:55:25–15:58:56) |
| 15:59:13 | Source probe, pin check, then candidate 2 (15:59:14–16:02:43) |
| 16:02:50 | `candidate` stops. `base-b` starts. |
| 16:03:11 | Source probe, pin check, then baseline 2 (16:03:11–16:06:02) |
| 16:06:03 | Final source probe. `base-b` stops at 16:06:10. |

- The last server stopped at 16:06:10Z. The deadline was 23:00Z.
- The round made 26 answer turns in about 16 minutes. That is below the limit of 30 turns in a rolling hour.
- Nobody sent a manual, browser, or `--preflight` turn to an eval server.

## Deviations and incident

1. **Server log capture.** `tee` made Wrangler non-interactive, and the first `base-a` start failed before any request.
   Each server instead ran under `script -q "$B/server/<slot>.log"`, which keeps a TTY and saves the same log.
2. **Wrangler credential.** Wrangler's own OAuth login had expired.
   The orchestrator approved a different procedure. Before each start, `cf auth whoami` refreshed the `cf` token.
   Then a wrapper exported `CLOUDFLARE_API_TOKEN` from the `cf` configuration, without printing it.
   No remote AI call failed with an authentication error.
3. **Log flush delay.** `script` writes the log with a short delay.
   Two helper reads that ran at once after a run saw the last turn as unfinished.
   A second read after the flush passed. Later runs waited for the expected `demo-chat` count before the read.
4. **Credential exposure incident.** At the first checkpoint-2 attempt, a different Wrangler server was running.
   That server was the orchestrator's credential test server, and the launch stopped for it.
   The plan's command `pgrep -fl wrangler` printed that process's full environment into the collector's session transcript.
   That environment held the values of three credential variables.
   The values were not copied to a file, a commit, or a message. The owner was told to rotate the three credentials.
   After this, checkpoint 2 used a count only: `pgrep -f 'wrangler|workerd' | wc -l`.
   **Fix for later plans:** never use `pgrep -fl` or `ps` with arguments as a server-slot check. Use a count.

## Checkpoints and receipts

| Checkpoint | Result |
| --- | --- |
| Paired window | The paired-launch directory was absent at about 14:30Z, at 15:48Z, and before each server start (15:49Z, 15:54Z, 16:02Z). The orchestrator relayed the owner's spend approval and the window: stop all servers before 23:00Z, because the owner's paired collection starts after 00:00Z. **The ledger has no line for this checkpoint.** These facts come from the collector's session record only. |
| Server slot | The count was 0 before each start (after the orchestrator stopped its test server). |
| Gateway headroom | Read privately once, at 14:31:36Z. That is 78 minutes before the first paid call (15:50:08Z). It was not read again. The headroom covered $27 plus public traffic. The round spent $3.41. |
| Freeze | Both worktrees were clean. Generations were recorded. Both arms passed `npm run test:smoke`. |
| Dry runs | Both dry runs selected the expected IDs. |
| Judge pin | Passed before each judged run. |
| SDK receipts | Matched at each of the three server starts. |

Receipt probes (`q-soroban-storage-types`, no judge):

| Probe | Exit | Status | Cost (USD) | Provider calls | Input / output / total tokens | Steps = turn | Finish |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BASE | 0 | complete | 0.0849925 | 3 of 3 reported | 30202 / 791 / 30993 | yes | stop |
| CANDIDATE | 0 | complete | 0.0848785 | 3 of 3 reported | 30526 / 714 / 31240 | yes | stop |

Each probe had one `eval-cost` frame with `error: null`, a non-empty answer, and `demo-steps.mjs --strict-usage` exit 0.
Both probes pass the receipt gate.
Each probe costs about 30 times the stored probe cost of $0.0028798. Each probe stays far below the $0.30 stop line.

## Costs

| Invocation | Cap (USD) | Answer (USD) | Judge (USD) | Total (USD) | Answer turns | Judge calls | Provider calls | Highest single call (USD) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Receipt BASE | 1 | 0.0849925 | 0 | 0.0849925 | 1 | 0 | 3 | 0.0849925 |
| Baseline 1 | 5 | 0.3509812 | 0.4525498 | 0.8035310 | 6 | 6 | 18 | 0.0953058 (judge) |
| Receipt CANDIDATE | 1 | 0.0848785 | 0 | 0.0848785 | 1 | 0 | 3 | 0.0848785 |
| Candidate 1 | 5 | 0.3776007 | 0.4717124 | 0.8493131 | 6 | 6 | 18 | 0.0935484 (judge) |
| Candidate 2 | 5 | 0.3599647 | 0.4742696 | 0.8342343 | 6 | 6 | 18 | 0.1073384 (judge) |
| Baseline 2 | 5 | 0.3233162 | 0.4324464 | 0.7557626 | 6 | 6 | 18 | 0.0924004 (judge) |
| **Round** | **27** | **1.5817338** | **1.8309782** | **3.4127120** | **26** | **24** | **78** | — |

- The round total is **$3.4127120** against the $27 ceiling.
- No answer turn and no judge call cost more than $0.30.
- Every started call has a cost. The missing-cost count is 0 in every result.
- The replacement reserve was not used. No paid re-judge ran.
- Cap files set the consumed counts from actual counts: 0/0, 6/6, 12/12, and 18/18 for answer and judge calls.

## Method completeness

| Run | Exit | `budget.status` | `nonPromotable` | IDs | Finish `stop` and answer | HTTP, SSE, client errors | Unfinished tool calls | `eval-cost` frames | `demo-steps.mjs` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Baseline 1 | 0 | complete | no | 6 frozen | 6 of 6 | 0 | 0 | 1 per row, valid | exit 0 (turns 2–7) |
| Candidate 1 | 0 | complete | no | 6 frozen | 6 of 6 | 0 | 0 | 1 per row, valid | exit 0 (turns 2–7) |
| Candidate 2 | 0 | complete | no | 6 frozen | 6 of 6 | 0 | 0 | 1 per row, valid | exit 0 (turns 8–13) |
| Baseline 2 | 0 | complete | no | 6 frozen | 6 of 6 | 0 | 0 | 1 per row, valid | exit 0 (turns 1–6) |

All four runs are complete. Each fills its own analysis slot.

Log mapping: in each run, each turn's `searchCalls` and `executeCalls` equal the row's transcript counts.
The order of the turns matches corpus order. No mapping needed reconciliation.

`npm run eval:plan` regrade, without model calls: all four runs have 6/6 required covered.
The mean on-plan ratio is 1.00 in three runs and 0.92 in candidate 1.
Candidate 1 has one off-plan `stellarDocs` touch, the SCF row described below.

## Per-case results

Each cell shows the saved judge grade and the routing class.

| Case | Group | Baseline 1 | Baseline 2 | Candidate 1 | Candidate 2 |
| --- | --- | --- | --- | --- | --- |
| `q-anchor-list-builders-discovery` | Ecosystem | correct / T | correct / T | correct / T | correct / T |
| `q-asset-stablecoin-issuers-discovery` | Ecosystem | partial / T | partial / T | partial / T | partial / T |
| `q-scf-build-award-cap` | Ecosystem | correct / E | wrong / E | partial / T | wrong / E |
| `q-protocol-base-reserve-min-balance` | Protocol control | wrong / E | partial / E | partial / E | partial / E |
| `q-sep-45-contract-auth` | Protocol control | partial / E | partial / E | partial / E | partial / E |
| `q-soroban-storage-types` | Protocol control | partial / E | partial / E | partial / E | partial / E |

Totals: baseline 1 has 2 correct, 3 partial, 1 wrong. Baseline 2 has 1 correct, 4 partial, 1 wrong.
Candidate 1 has 1 correct, 5 partial, 0 wrong. Candidate 2 has 1 correct, 4 partial, 1 wrong.

## Routing rule, row by row

The rule uses the first successful `mcp__playground__execute` entry and the families in its `code`.

| Case | Expected | Baseline 1 | Baseline 2 | Candidate 1 | Candidate 2 | Regression? |
| --- | --- | --- | --- | --- | --- | --- |
| anchor | Scout or Lumenloop | T: lumenloop, scout, stellarDocs | T: lumenloop, scout, stellarDocs | T: scout, stellarDocs | T: lumenloop, scout, stellarDocs | No. All four pass. |
| stablecoin | Scout or Lumenloop | T: scout, stellarDocs | T: lumenloop, scout, stellarDocs | T: lumenloop, scout, stellarDocs | T: lumenloop, scout, stellarDocs | No. All four pass. |
| SCF award | Scout or Lumenloop | E: scout | E: scout | T: scout, stellarDocs | E: lumenloop, scout | No. All four pass. |
| reserve | Stellar Docs | E | E | E | E | No. Control passes twice. |
| SEP-45 | Stellar Docs | E | E | E | E | No. Control passes twice. |
| storage | Stellar Docs | E | E | E | E | No. Control passes twice. |

- Class counts: BASE has E 8, T 4, O 0, N 0. CANDIDATE has E 7, T 5, O 0, N 0.
- The one E-to-T difference is candidate 1's SCF row. It adds a real `stellarDocs.search_docs` call. It still passes.
- The first `search` service filter is the same in all four runs for each case.
- Reader 1 (the collector) classified the rows with a script. Reader 2 was a blind agent that read only the four result files.
  The two readers agree on all 24 rows. Reader 2 found no family name only in a comment or a string, and no aliased call.
- The regex does not count `codemode.skill.read`. This changes no class, because no case expects skills.

## Verified-answer rule, row by row

A verified answer regression needs a worse grade in both CANDIDATE repetitions than in both BASE repetitions.

| Case | BASE grades | CANDIDATE grades | Regression? |
| --- | --- | --- | --- |
| anchor | correct, correct | correct, correct | No. Same grades. |
| stablecoin | partial, partial | partial, partial | No. Same grades. |
| SCF award | correct, wrong | partial, wrong | No. CANDIDATE is not worse than both BASE grades. |
| reserve | wrong, partial | partial, partial | No. CANDIDATE is not worse. |
| SEP-45 | partial, partial | partial, partial | No. Same grades. |
| storage | partial, partial | partial, partial | No. Same grades. |

Author's traces of the grade differences. The non-author review confirms them and adds evidence:

- **SCF award: judge reaction to the observation date, plus judge variance.**
  All four answers give "up to US$150,000, paid in XLM, in four installments". No answer has a wrong claim.
  Baseline 1 and candidate 1 give an observation date (2026-10-10) and a source. Baseline 2 and candidate 2 give no date.
  The two undated answers get `wrong` for the must-avoid item on undated measurements.
  Baseline 1 gets `correct`. Candidate 1 gets `partial` because "four installments" is not called milestone-based.
  Baseline 1 has the same "four installments" text and got `correct`. So the candidate 1 difference is judge variance.
  The 2026-10-01 authority round showed the same date pattern on this case.
- **Reserve: answer content in BASE.**
  Baseline 1 gives only the `(2 + subentries) × baseReserve` formula, with no sponsorship terms. The judge applies the must-avoid item and grades it `wrong`.
  Baseline 2 gives the sponsorship-aware formula. The two CANDIDATE answers scope the simple formula to non-sponsored accounts and get `partial`.
  All four answers omit the reserve shift when sponsorship ends and the Soroban rent model.
  This is the known `sd-046` area. Both arms show it, so it is not a regression.
- **Same-grade cases.** The stablecoin, SEP-45, and storage omissions are the same in all four runs.
  Stablecoin: Circle is not named as the dominant issuer. SEP-45: no as-of date and no Draft status.
  Storage: no XDR two-durability fact and no Protocol 23 auto-restore detail.
- **Anchor (historically disputed `correct`).** All four answers list the 15-project Scout "Anchor" category snapshot, dated 2026-10-10.
  The judge accepts the count difference from the golden's 27 as a different dated scope.
  Candidate 2 adds names that the judge calls unverified, not fabricated.
  The non-author review checked every project name in each answer against that run's own `execute` result.
  All names are in the model-visible evidence, in all four runs. This includes candidate 2's Alfred Pay, Blox Global,
  Trace Finance, FinClusive, CLPX, Zeam Money, and Etherfuse. So the judge's "unverified" remark is wrong; no name is fabricated.
  The reviewer accepts the four `correct` grades.

Source drift: the source probe printed `1a927dce05ba9a1b4e7481c85ebfc7c4d4110aa2cb681de0f0a11fc7d43c0c7b` before each run and after the last run.
So no verdict difference crosses a changed probe value. A matching value does not prove that every page stayed the same.

## Strictness diagnostics

`search` input fields set, by run:

| Run | `search` calls | `kind` | `service` | `limit` | `recoverFrom` | `reason` | `null` inputs | Tool errors | Invalid-input errors | `{"error":…}` outputs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Baseline 1 | 14 | 14 | 14 | 14 | 14 (`[]`) | 14 (`"partial"`) | 0 | 0 | 0 | 0 |
| Baseline 2 | 14 | 14 | 14 | 14 | 14 (`[]`) | 14 (`"partial"`) | 0 | 0 | 0 | 0 |
| Candidate 1 | 16 | 16 | 15 | 16 | 0 | 0 | 0 | 0 | 0 | 0 |
| Candidate 2 | 14 | 14 | 14 | 14 | 0 | 0 | 0 | 0 | 0 | 0 |

Reading:

- In BASE, every `search` call (28 of 28) sets all six properties. `recoverFrom` is always `[]`, and `reason` is always `"partial"`.
  In CANDIDATE, no `search` call (0 of 30) sets `recoverFrom` or `reason`. One call omits `service`.
- A model that is free to omit fields does not send an empty recovery list with a fixed reason 28 times.
  So this is strong evidence that the server normalized the BASE `search` schema to strict mode when `strict` was omitted.
  This answers the plan's open question about BASE strictness. The evidence is an inference from inputs; no request log shows the mode.
- The functional effect is small. The Worker treats `recoverFrom: []` as no recovery, so it ignores `reason`.
  The `kind`, `service`, and `limit` values are the same in both arms.
- So the CANDIDATE changes `search` decoding from strict (inferred) to non-strict. This is the change the plan expected.
  In this screen, it caused no invalid input, no tool error, and no grade or routing loss.
- No arm has an invalid-input error, so the CANDIDATE `{"error": …}` wrapping was not exercised.
- Loop shapes: every turn in every run has 3 steps and 1 `execute` call. `search` counts are 14, 14, 16, and 14.

## Observation for triage: inner `execute` calls without `query`

This is an observation for the orchestrator to triage. It is not a merge item.

- Some service calls inside `execute` fail with the message "invalid arguments … no call was made".
- `stellarDocs.search_anchor_sep_docs` fails this way in every anchor row. `stellarDocs.search_asset_token_docs` fails in one stablecoin row per arm.
- The cause: the model omits the required `query` argument.
- The host reports these calls as failed evidence. They are not tool errors and not tool-loop defects.
- Both arms show the pattern, so the SDK upgrade does not cause it.
- The reviewer found no `improvements/` entry for this pattern. It is a candidate finding for the improvements pipeline.

## Final step and usage

- `finalStepCoverage` is 0 in all three server logs. No turn reached step 7. Every turn ended after 3 steps.
  So the final-step rule (no tool call on the tools-disabled step 7) is **unexercised** in this round.
- `usageMismatches` is empty in all logs. For every turn, the `demo-step` token sums equal the `demo-chat` totals.

Token totals for the six method turns, from the server logs:

| Run | Input | Output | Total |
| --- | --- | --- | --- |
| Baseline 1 | 190698 | 4176 | 194874 |
| Candidate 1 | 200333 | 4387 | 204720 |
| Candidate 2 | 193572 | 4346 | 197918 |
| Baseline 2 | 191193 | 4676 | 195869 |

## Release conditions

| Condition | State |
| --- | --- |
| Accepted independent review of the plan and the CANDIDATE diff | Met before collection (Fable review, then a delta review: LAUNCH-OK). |
| Unchanged judge pin and matching SDK receipts for every server start | Met. |
| Two passing receipt probes | Met. |
| Four complete analysis slots with intact pins and complete costs | Met. No replacement. |
| No routing regression and no verified answer regression | Met on the author's reading. Routing is confirmed by a blind second reader. |
| Protocol controls pass in both CANDIDATE repetitions | Met (6 of 6 class E). |
| No tool-loop defect in a CANDIDATE row | Met. No step-7 tool call, no tool-choice error, no failed tool. |
| Reconciled source drift, judge differences, and upstream findings | Met by [`review-result-fable.md`](review-result-fable.md). The missing-`query` pattern below is a candidate upstream finding for both arms. It does not block the merge. |
| Merge outside the owner's paired collection window | For the merger to check at merge time. |

## Artifacts

All artifacts stay outside the repository under `/private/tmp/raven-ai-upgrade`.
Result files are under `results/<run>/`. Server logs are `server/base-a.log`, `server/candidate.log`, and `server/base-b.log`.
The working ledger is `ledger.txt`.

| Result | SHA-256 |
| --- | --- |
| `receipt-base/2026-10-10T15-50-08-296Z-0b94051b-…-playground-semantic.json` | `e0ee0e34ef35f7f3ce104e802912fa3b70b81c2b87bfbd63ad09d6b05713bad0` |
| `baseline-1/2026-10-10T15-50-59-834Z-578f6d83-…-playground-semantic.json` | `bc605d1bd3b3d18d9ce9db8ee827236a61ceeadb071c29a78d134684a42b76f1` |
| `receipt-candidate/2026-10-10T15-54-46-515Z-6a3b4573-…-playground-semantic.json` | `47e4bbaf332abc257c42c4639ca810083310daf2c9d4168cb76420941a472ecc` |
| `candidate-1/2026-10-10T15-55-25-282Z-b5a17b45-…-playground-semantic.json` | `9227e14eea722814be6b609d3beed49e2a01535ea4a3e189ecd5acfbe24dd52f` |
| `candidate-2/2026-10-10T15-59-14-090Z-6ac11710-…-playground-semantic.json` | `85891fbc298e014ac1192112b01c95c4fc8bf3428c7e2fedc59e4a1b92a24cd3` |
| `baseline-2/2026-10-10T16-03-11-617Z-d2a23c3a-…-playground-semantic.json` | `33deb7e540743f2a3f58fc6e741936506f66bcec131f05613fe79cd0f9449f76` |

Cleanup: the server pane was closed. The CANDIDATE `.dev.vars` placeholder was restored.
The BASE worktree was removed with `git worktree remove`.
