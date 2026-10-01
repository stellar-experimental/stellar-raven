# Source authority: Phase 1 and measurement plan

Date: 2026-10-01. Status: code review accepted; amended plan awaits the bounded delta review. Measurement remains unlaunched.
Base revision: `c7e8c0f2a5ffa6ee552fb78dac90fe62794b9654`.

## Decision and scope

The execute description contradicted the existing source-family rule.
The coordinator selected Option A: delete the contradictory clause and add no replacement sentence.
The existing `AUTHORITY_RULES` remains the source-family instruction.
Never restore the contradictory clause in the candidate or release.
It adds no operation lists, entity examples, or routing fields.

The original clause and correction occur after character 2,048 of `EXECUTE_DESCRIPTION`.
Clients that receive full descriptions see the correction.
The Playground passes the complete description to its model.
A client that clips descriptions at 2,048 characters does not see this correction.
Such a client cannot measure this intervention.

The MCP registration and Playground tool wrapper share `EXECUTE_DESCRIPTION`.
`SERVER_INSTRUCTIONS` and the Playground prompt include the generated micro-map.
`AUTHORITY_RULES` already supplies the correct distinction to that micro-map.
The public `/docs` page already says ecosystem facts start with Lumenloop or Scout.
The build regenerates the micro-map and checks emitted text.
Historical audit records retain the original wording as evidence.

Evidence: [September 17 audit, section 8](../../../research/audits/2026-09-17-routing-audit/direction-review.md).
Grok 4.7 at high accepted the accounting code without findings.
Claude Fable 5.1 at high requires the plan fixes recorded below.
Fable must complete a bounded delta review before any spend.
The coordinator reconciles that review and controls the freeze.
Phase 1 spends nothing and starts no evaluation server.
The coordinator owns Git, server scheduling, paid launch, and release.

## Instrument and cases

Use the existing `npm run eval:playground` runner and its complete descriptions.
This is a Playground diagnostic, separate from the MCP headline and owner decision A.
Do not invoke the deferred paired-QA collection commands.
Use the same six cases in all four runs.

| Group | Case ID | Expected initial evidence family |
|---|---|---|
| Ecosystem | `q-anchor-list-builders-discovery` | Scout or Lumenloop |
| Ecosystem | `q-asset-stablecoin-issuers-discovery` | Scout or Lumenloop |
| Ecosystem | `q-scf-build-award-cap` | Scout or Lumenloop |
| Protocol control | `q-protocol-base-reserve-min-balance` | Stellar Docs |
| Protocol control | `q-sep-45-contract-auth` | Stellar Docs |
| Protocol control | `q-soroban-storage-types` | Stellar Docs |

The runner uses corpus order, regardless of the order in `--ids`.
The frozen order is anchor, stablecoin, reserve, award, SEP-45, then storage.
The selected-case JSON hash is `207ca631c052341b73a3b0ed173104e8848c6f3f824e97bdd977a6ba6127f16d`.
This hash uses SHA-256 over `JSON.stringify(selectedCases)` after filtering the compiled corpus in its existing order.

### Optional Aquarius case skipped

The requested `q-defi-aquarius-scf` does not exist in this revision's compiled corpus.
`eval/qa/corpus/migration-ledger.json` records its removal under ABSORB-TRIAGE and names `q-defi-aquarius-what-is` as the destination.
The coordinator authorized skipping optional finding 11 when its requested case is absent or unsuitable.
Skip the optional case and retain the original six-case comparison.
Do not substitute the destination case, restore the retired case, or change the corpus.

## Arms, model, and source pins

The coordinator commits two revisions: BASE and CANDIDATE.
BASE contains the reviewed accounting change and original clause, without the candidate wording tests.
CANDIDATE is BASE plus the clause deletion and its tests.
Keep this plan, other documentation, and accounting tests common to both revisions.
The original clause remains only in the measurement baseline and historical records.

Before launch, run these read-only comparisons:

```sh
git diff --stat "$BASE" "$CANDIDATE"
git diff "$BASE" "$CANDIDATE" -- src/
```

The first comparison must list only `src/mcp/tools.ts` and candidate test files.
The second comparison must show only the clause deletion and its sentence-ending punctuation.
Record each arm's `EXECUTE_DESCRIPTION` SHA-256 and the shared `DEMO_SYSTEM_PROMPT` SHA-256.
The coordinator records both full commit IDs and both generations in the round ledger.
Those commits pin the runner, accounting code, prompt, model configuration, and dependencies.
The accepted independent accounting review is a prerequisite for committing BASE.
Do not compare an unbudgeted historical runner against the candidate.
Do not include another backlog change in the comparison interval.

Use `openai/gpt-5.6-terra` as the only answer model in both arms.
Set `DEMO_MODEL_OVERRIDE=openai/gpt-5.6-terra` in the server and runner environments.
Set `DEMO_OPENAI_API_MODE=responses` and `DEMO_REASONING_EFFORT_OVERRIDE=none` in both environments.
Keep `DEMO_TEMPERATURE=0.1` from the pinned source.
Use `claude-sonnet-5` as the judge, rubric `v2.10`, and evidence pack `p6`.
The judge temperature remains the provider default and is unpinned.
The answer model receives full tool descriptions and the same system prompt in both arms.

| Input | SHA-256 |
|---|---|
| `catalog/manifest.json` | `8e19480c0005dad0fb505bfd209e771e9457a8198c586ff7aaf9e89c0a1948a8` |
| `specs/super-spec.json` | `5b119b94b0e1eddf482604c09b2d8364dc7f7c107304eb5e22ea06d399d417a8` |
| `eval/qa/cases.json` | `ae221407fad556081391ff0ff01a49a4391c4734fb39f1c9dd4474201369190e` |
| `eval/qa/judge.mjs` | `2d14376ac4b1c1f0b9c50b0067fc4287ba200eee46c6d5d4dd6425c5c8a07637` |
| `eval/qa/evidence-pack.mjs` | `74a1bd47b1e2f824d672f0e399e2a679dd1195fd0a1366066bfa68e631f8b0d5` |
| `package-lock.json` | `fbb4a896c19830f1e54ca05ab67c30ada5c413a16b3a380d34d13c73c445ec8f` |

The coordinator freezes both revisions and all input hashes after review reconciliation.
A changed selected case or source pin requires a plan amendment before launch.
Record the judge executable's resolved path, real path, version, and SHA-256 before each run.
The runner stores these values in `meta.judge.executable`.
Record the Node executable, version, and dependency lock hash in the round record.

## Server and launch checkpoints

The sd-adapter measurement lane currently holds the only Wrangler evaluation server slot.
Start only after the coordinator gives the release signal and that lane closes its servers.
Do not run while another lane's paid measurement is active.
The owner's paired run is scheduled for 2026-10-03 or 2026-10-04 UTC.
Finish this round and stop all its servers before `2026-10-02T23:00:00Z`.
Do not launch a run or replacement that cannot finish before that deadline.

Do not run any plan command from creation of the paired capacity artifact until paired collection ends.
Do not merge or deploy between the paired plan's signature and the end of collection.
The only exception requires that paired plan to pin both revisions by commit ID.
Before launch, read the daily spend limit of the `stellar-raven-demo` Gateway.
Confirm that the round ceiling leaves room for public Playground traffic.
Record this check privately; do not commit production usage counts.

The coordinator prepares a detached baseline worktree at BASE.
The coordinator runs `npm ci`, supplies an opaque `.dev.vars` copy, and runs `npm run typegen` there.
Do not print or inspect the credential file.
The candidate runs from the `authority` worktree at CANDIDATE.
Both worktrees must be clean before server launch and each evaluation command.
Only one Wrangler process may exist at a time.
The lane that holds the server must stop it before another starts.

Start each arm in the pane that the coordinator assigns, from that arm's worktree:

```sh
npm run dev:eval -- --var DEMO_MODEL_OVERRIDE:openai/gpt-5.6-terra \
  --var DEMO_OPENAI_API_MODE:responses --var DEMO_REASONING_EFFORT_OVERRIDE:none
```

The server-load receipt contains this command and the startup line `eval server revision <sha>`.
Check that `<sha>` equals the intended BASE or CANDIDATE commit.
Record the pane owner and bound loopback URL from its output.
Set `AUTHORITY_URL` to that origin.
Stop the server before the other arm starts.
Do not change a running server's checkout or rely on hot reload for an arm change.

Run each evaluator command from the worktree of its loaded arm.
Print its generation with `npm run eval:playground -- --print-generation`.
Set `BASE_GENERATION` or `CANDIDATE_GENERATION` from that worktree's output.
Verify the same generation before both repetitions of each arm.
Keep results and cap files outside tracked paths.
The runner's generation assertion proves local source consistency, not the bytes loaded by an existing Worker.
The startup receipt supplies the separate loaded-revision check.
Missing or mismatched receipts block launch.

The order is receipt probe, baseline 1, candidate 1, candidate 2, then baseline 2.
This order requires three normal server starts.
A candidate replacement after baseline 2 requires one additional start after stopping the baseline server.
A baseline replacement can reuse the final baseline server.
Stop the last server when collection ends.

## Receipt and visibility probe

Before baseline 1, run one answer turn on BASE with no judge and a $2 cap.
Use `$B/authority-receipt-case.json`, outside the repository.
The case ID is `q-authority-receipt-probe`.
Its question asks the model to quote the execute-tool sentence containing "single-step how-tos".
Do not include the expected sentence in the question.
The case is a transport diagnostic and has no factual golden.
It is excluded from the six-case denominator.

Use the separate `$B/authority-caps/receipt-probe.json` context.
Its experiment ID is `2026-10-01-source-authority-receipt-probe`.
Its planned and absolute answer caps are 1.
Its answer consumption starts at 0; all judge and reserve values are 0.

Receipt gate: require one `eval-cost` frame with `error: null`, `reportedCalls === calls`, and `costUsd > 0`.
Also require a finite cost within the $2 authorization and no missing cost.
Record `inputTokens`, `outputTokens`, and `totalTokens` from the corresponding server `demo-chat` event beside the cost.
Use the isolated probe's timestamp to correlate that event; record no user content or credential.
Missing usage evidence, zero cost, unknown cost, or an accounting error stops the round.
Do not use the replacement authorization to repeat a failed receipt probe.

The quoted sentence is a visibility diagnostic.
Record whether it includes the original clause or omits it.
A refusal to quote does not stop the round.
The smoke test proves the SDK receives the full description; it does not prove provider delivery to the model.

## Budget and exact commands

Use a $10 cap for each of the four planned method runs.
Pre-authorize one complete replacement run with a $10 cap.
The receipt probe has a separate $2 cap.
The default round ceiling is $52: $2 + four times $10 + $10.
If the receipt probe costs more than $0.50, the four planned run caps may each increase to $20.
Only that observed threshold permits the increase.
The replacement cap remains $10, and the conditional ceiling becomes $92.
Both ceilings stay below $100.
Record the selected ceiling before baseline 1 and confirm Gateway headroom against that ceiling.
The conditional amount grants no additional model calls.

The reviewer found seven historical judge calls costing $1.00 in `reopened-generality-scored/2026-07-14T13-02-12-639Z-…`.
That July observation is a judge-cost reference, not a current total-cost estimate.
Historical Playground artifacts omit answer costs.
Do not treat the reviewer's answer-cost estimate as measured evidence.
The caps are authorization limits, not forecasts.

Count every provider call within an answer turn, including failed attempts and fallback attempts.
Count every paid judge call.
Gateway log reads report answer USD costs; they do not estimate costs from token counts.
The route stops the next provider call when reported cost exhausts its authorization.
The runner sends each judge only the remaining method amount.
One provider call can exceed its remaining authorization; this invalidates the method and stops later calls.
Missing cost also invalidates the method and stops later calls.
Never use zero for an unknown cost or switch to an unbudgeted runner.

### One replacement authorization

Use the replacement only for an incomplete run caused by an HTTP, SSE, or provider error without an answer defect.
The original artifact must retain complete cost accounting.
Missing-cost, excess-cost, generation-quarantine, source-pin, and answer-quality failures do not qualify.
The coordinator records the qualifying transport evidence before using the reserve.
Repeat the complete six-case run on the same arm, with unchanged pins and settings.
Keep the failed artifact and replacement separately; never combine their rows.
A second failed run stops the round.
No paid saved-answer rejudge is authorized.

Schedule the replacement after the four planned invocations, while the window remains open.
This preserves the existing contract's cumulative planned-call checks without changing the reviewed runner.
The successful replacement fills only the failed repetition's analysis slot.
The other three analysis slots remain the original complete runs.

The four planned runs permit 24 answer turns and 24 judge calls.
The replacement reserve permits six additional answer turns and six additional judge calls.
The two main absolute caps are therefore 30.
The contract counts replacement calls against both absolute caps.
Its `infraRetryReserve` counts answer calls, so set that reserve to 6.
The separate receipt probe permits one further answer turn and no judge.
Normal collection totals 25 answer turns; collection with a replacement permits at most 31.
Each invocation remains below the per-subject 30-turn limit.
Also keep this round at or below 30 answer turns in any rolling hour.
Delay a replacement when needed; never rotate subjects to bypass that guard.
If the delay conflicts with the stop deadline, stop without a replacement.

### Cap files and validation

The four planned cap files share this contract:

```json
{
  "contract": "playground-semantic-round-cap/v1",
  "experimentId": "2026-10-01-source-authority",
  "kind": "reviewed-round",
  "runAllocation": "planned",
  "plannedAnswerCalls": 24,
  "absoluteAnswerCallCap": 30,
  "answerCallsConsumedBeforeRun": 0,
  "plannedJudgeCalls": 24,
  "absoluteJudgeCallCap": 30,
  "judgeCallsConsumedBeforeRun": 0,
  "infraRetryReserve": 6,
  "infraRetryConsumedBeforeRun": 0,
  "savedAnswerRejudgeReserve": 0,
  "savedAnswerRejudgesConsumedBeforeRun": 0
}
```

The initial successful-run projections are 0, 6, 12, and 18 consumed calls.
Reconcile actual answer and judge starts after every invocation, including failed runs.
Update later cap files from those actual counts before launch.
A failed early run can use fewer than six calls; do not substitute its planned count for observed starts.

The fifth main cap file is `$B/authority-caps/replacement.json`.
It uses `runAllocation: "infra-retry"`, the same 24 planned calls, both 30 absolute caps, and the 6-call reserve.
Set both consumed counts from the four preceding artifacts, including the failed artifact.
The initial template uses the conservative maximum of 24 consumed calls.
Its retry consumption is 0 before use and 6 after the complete replacement starts all six answers.
No second use is authorized, even if the first replacement stops early.

Run the existing `--dry-run` for selection validation, including the replacement context argument.
The runner returns before it reads cap contexts in dry-run mode.
Therefore also validate every cap file with the exported `buildPlaygroundArtifactMeta` contract in an offline fixture.
`$B/validate-authority-caps.mjs` performs that check without HTTP, model calls, credentials, or artifact writes.
It tests all possible failed repetition slots and confirms that an exhausted reserve is rejected.
These checks validate the caps without changing the reviewed budget code.

### Commands

The coordinator sets `BASE`, `CANDIDATE`, both worktree paths, both generations, and `AUTHORITY_URL` from recorded receipts.
Run each command from its loaded arm's worktree.
The server receives model settings through `--var` in the launch command above.
These exports make the runner record the same settings; they do not configure an existing Worker.

```sh
export DEMO_MODEL_OVERRIDE=openai/gpt-5.6-terra
export DEMO_OPENAI_API_MODE=responses
export DEMO_REASONING_EFFORT_OVERRIDE=none
METHOD_CAP_USD=10
AUTHORITY_IDS=q-anchor-list-builders-discovery,q-asset-stablecoin-issuers-discovery,q-protocol-base-reserve-min-balance,q-scf-build-award-cap,q-sep-45-contract-auth,q-soroban-storage-types

# BASE: receipt and description visibility probe, before baseline 1.
npm run eval:playground -- --confirm-paid --max-budget-usd 2 --url "$AUTHORITY_URL" --server-generation "$BASE_GENERATION" --round-cap-context "$B/authority-caps/receipt-probe.json" --cases "$B/authority-receipt-case.json" --ids q-authority-receipt-probe --no-judge --out-dir "$B/authority-results/receipt-probe"

# Only when the valid receipt cost exceeds $0.50, record the increase before this assignment.
# METHOD_CAP_USD=20

# BASE: baseline 1, after the receipt gate passes.
npm run eval:playground -- --confirm-paid --max-budget-usd "$METHOD_CAP_USD" --url "$AUTHORITY_URL" --server-generation "$BASE_GENERATION" --round-cap-context "$B/authority-caps/baseline-1.json" --ids "$AUTHORITY_IDS" --judge-model claude-sonnet-5 --out-dir "$B/authority-results/baseline-1"

# CANDIDATE: candidate 1, after the baseline server stops and the candidate server starts.
npm run eval:playground -- --confirm-paid --max-budget-usd "$METHOD_CAP_USD" --url "$AUTHORITY_URL" --server-generation "$CANDIDATE_GENERATION" --round-cap-context "$B/authority-caps/candidate-1.json" --ids "$AUTHORITY_IDS" --judge-model claude-sonnet-5 --out-dir "$B/authority-results/candidate-1"

# CANDIDATE: candidate 2, after receipt reconciliation.
npm run eval:playground -- --confirm-paid --max-budget-usd "$METHOD_CAP_USD" --url "$AUTHORITY_URL" --server-generation "$CANDIDATE_GENERATION" --round-cap-context "$B/authority-caps/candidate-2.json" --ids "$AUTHORITY_IDS" --judge-model claude-sonnet-5 --out-dir "$B/authority-results/candidate-2"

# BASE: baseline 2, after the candidate server stops and the baseline server starts.
npm run eval:playground -- --confirm-paid --max-budget-usd "$METHOD_CAP_USD" --url "$AUTHORITY_URL" --server-generation "$BASE_GENERATION" --round-cap-context "$B/authority-caps/baseline-2.json" --ids "$AUTHORITY_IDS" --judge-model claude-sonnet-5 --out-dir "$B/authority-results/baseline-2"

# Conditional replacement only: load the failed arm and set REPLACEMENT_GENERATION to its recorded generation.
npm run eval:playground -- --confirm-paid --max-budget-usd 10 --url "$AUTHORITY_URL" --server-generation "$REPLACEMENT_GENERATION" --round-cap-context "$B/authority-caps/replacement.json" --ids "$AUTHORITY_IDS" --judge-model claude-sonnet-5 --out-dir "$B/authority-results/replacement"

# Free selection and cap checks before launch.
npm run eval:playground -- --dry-run --round-cap-context "$B/authority-caps/replacement.json" --ids "$AUTHORITY_IDS"
node "$B/validate-authority-caps.mjs"

# Regrade each complete, accepted result without model calls.
npm run eval:plan -- "$RESULT_FILE"
```

Do not execute the block as an unattended script.
Record every command, cap, actual cost, missing-cost count, CLI identity, and result stamp.
Retain failed artifacts, quarantines, and incomplete IDs; never shrink the denominator.

## Metrics, variance, and reading rules

For each row, take the first `mcp__playground__execute` transcript entry that is not an error.
Decode its JSON `input` and extract service families from its `code` with the plan grader's expression:

```js
/\b(lumenloop|scout|stellarDocs)\.(\w+)\s*\(/g
```

Class E: every family is an expected family.
Class T: an expected family and another family.
Class O: no expected family.
Class N: no successful execute entry with a service call.
A row passes when its class is E or T.
A row fails when its class is O or N.
Use N for an empty family set; it does not pass vacuously as E.
Also record the `service` filter of the first search call; it is diagnostic only.
Two readers classify each row independently from the saved transcript and reconcile differences.

This metric records service calls written in a successful script, not which returned facts support the answer.
Review returned results and citations separately for factual grounding.
`npm run eval:plan` does not compute this first-family metric.
Report E-to-T counts for each arm as a diagnostic.
Report the three ecosystem cases separately from the three protocol controls.

For every case, report both repetitions for each arm.
Record verdicts, missing facts, wrong claims, routing classes, first search filters, and final citation families.
Review every answer against its golden and executed evidence, including correct verdicts.
A judge verdict alone does not establish a regression.

Two repetitions reveal instability; they do not establish statistical significance.
A diagnostic routing gain requires both candidate repetitions to pass under the class rule and both baseline repetitions to fail.
A routing regression requires both candidate repetitions to fail and both baseline repetitions to pass under the class rule.
Mixed repetition outcomes require evidence review and remain unresolved until the readers reconcile their cause.
The protocol controls must pass under the class rule in both candidate repetitions.
No release requires a routing gain.

A verified answer regression has a worse verdict in both candidate repetitions than in both baseline repetitions.
A distinct reviewer must trace that difference to answer content.
Use the order Correct, Partial, Wrong; an error is an incomplete method, not an answer grade.
A difference is resolved when that reviewer assigns it to answer content, source drift, or judge variance on equivalent answers.
The reviewer records the evidence for that assignment.
There is no paid second-judge authorization.
Unresolved differences block release or require a reviewed plan amendment.

A missing sponsorship or pool-share reserve fact in `q-protocol-base-reserve-min-balance` is the known finding `sd-046`.
It is not an answer regression when both arms show it.
The historical disputed `correct` verdict for `q-anchor-list-builders-discovery` requires careful evidence review; it is not an automatic pass.

### Source identity checks

Run this free live-source probe before each of the four planned runs and after the last run:

```sh
node eval/qa/probe-remote-identities.mjs --sha256
```

Record each printed value and its timestamp.
The coordinator must confirm the single-capture runtime before launch.
Do not use `--stable-sha256` for this plan.
If a replacement is needed, also probe before and after that replacement.
A changed value marks every verdict difference across that boundary as possible source drift.
A failed identity probe blocks the next run; it does not authorize a paid retry.
A matching identity cannot rule out all content changes; reviewers must still inspect conflicting returned evidence.

Keep the release claim limited to removing contradictory guidance on the tested full-description surface.
Report any family shift as a diagnostic.
Do not merge this denominator with MCP QA or routing gates.
Do not claim a result for clipped clients.

## Release conditions and open work

Release requires accepted independent code review and the completed bounded delta review of this amended plan.
Release requires a valid receipt probe and four complete analysis slots with intact pins and complete costs.
Each analysis slot must contain the same six selected case IDs.
One complete replacement may fill one failed slot under the stated reserve.
Release requires no routing regression in any selected case and no verified answer regression.
Report the family shift as a diagnostic.
Protocol controls must pass under the class rule in both candidate repetitions.
Release requires reconciled source drift, judge differences, and upstream findings.
Never restore the original contradictory clause, even if the measurement finds no family shift.
The candidate deletes prose and does not accumulate replacement guidance.

No live Gateway receipt exists for this implementation during Phase 1.
No receipt probe, source-identity probe, evaluation server, or paid method runs during this revision.
Offline checks validate method structure, not provider billing or model visibility.
The coordinator must confirm the server slot, Gateway headroom, calendar window, frozen commits, and startup receipts before launch.
The TODO remains open until measurement satisfies these conditions.
