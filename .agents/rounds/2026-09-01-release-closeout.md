# Release closeout

Date: 2026-09-01
Status: release validation
Branch: `maintenance/free-improvements-followup`
Author and orchestrator: Codex GPT-5.6 Sol

## Scope

This round closes pull requests #112, #113, and #114.
It reviews comments, validates the stack, merges it, deploys `main`, and cleans related Git state.

The paid lane tests one changed golden with the new environment pin.
The lane is diagnostic only.
It does not define a headline score or a product comparison.

## Authorization

The owner authorized paid work, live reads, merging, deployment, and cleanup.
This first authorization limits the first method to one run and `$1.50` total cost.
The cap includes one answering call and up to three judge calls.
The first authorization permits no rerun.
The separate second authorization appears below.

## Change attribution

| Change | Deterministic QA effect |
| --- | --- |
| PR #112 documentation | none |
| PR #113 environment pin | all QA modes must match and stamp the inherited environment |
| PR #114 golden correction | only `q-protocol-bn254-poseidon-xray` changes judge-facing truth |
| PR #114 Algolia canary | no QA answer effect |

The selected denominator is one active case.
The selected ID is `q-protocol-bn254-poseidon-xray`.
No case replacement is permitted.

## Instruments

Free checks run before paid work:

- `npm run eval:selftest`
- `npm run eval:compile`
- `npm run eval:qa:compile`
- `npm run eval:qa:register`
- `npm run eval:qa:lint -- --since main --stale`
- `npm run eval:routing -- --gate`
- `npm run eval:algolia-raven`

The paid method uses `eval/qa/run-qa.mjs` with variant A.
The answering model remains `claude-sonnet-5`.
The judge model remains `claude-sonnet-5`.
The judge rubric is `v2.10`.
The evidence pack is `p5`.

The paid run occurs before merge on the committed branch head.
The brief and its review must enter that commit before the server starts.
A prelaunch receipt will record the exact commit before spend.
The paid command and the server must use that exact commit.
The later production deployment will use the merged `main` commit.

The command will pin these inputs before any paid call:

- the clean server revision;
- the reported MCP surface SHA-256;
- the Claude executable SHA-256;
- the inherited Claude environment SHA-256;
- a total method budget of `$1.50`.

Claude Code reports version `2.1.257`.
The current executable SHA-256 is `64590d7d9d9c189d33fb3dfa58c5408eaf2a10fe556bd84155d95efaab46b60e`.
The current environment SHA-256 is `7a1b4ae24b6c2a8da7b1082553f1a601a4e904dbb3a6d30cdd05e43205f7564e`.
The final command will recompute both values in the paid shell.
The paid shell must not run inside a nested Claude Code session.
The closeout will record environment variable names, but never their values.

One historical Sonnet-5 row cost `$0.6542763` under rubric `v2.4` and pack `p3`.
That row is cost context only.
It is not a comparable result.

## Reading rules

The run must collect and judge exactly one row.
The artifact must be complete and comparable.
It must report `aggregatesSuppressed: false` and complete costs.
The server, binary, and environment identity pairs must match.
`meta.agentEnvironment.isolation.safeMode` must be `false`.
`meta.agentBinary.matches` must be `true`.
`meta.agentEnvironment.inherited.matches` must be `true`.
The answering agent must report the `raven` MCP server as connected.

The review will report all five tracks when `qa-five-track-v1` is present.
It will inspect every judge vote if the judge panel escalates.

The orchestrator will review the answer, transcript, golden, verdict, and cost.
A `wrong` or `partial` verdict requires live claim verification before any conclusion.
Any discovered upstream gap enters `improvements/` through its required workflow.
Any own-repo defect enters `.agents/TODO.md`.

The single row cannot measure variance or a noise floor.
The round will not compare its verdict with an older tuple.

## Stop rules

Stop before spend after any identity, surface, revision, or clean-tree mismatch.
Stop after any incomplete row, missing cost, provider safeguard, or harness failure.
Stop after the first authorized run.
Do not launch a repair rerun under the first authorization.
The separate second authorization appears below.
Do not edit a repository file between server launch and paid-command completion.

## Review gates

Claude Fable 5 at high reviews this brief before spend.
Claude Opus 5 at high reviews the completed round before merge.
Each reviewer differs from the author and orchestrator.
The final reviewer must reconcile every finding.
The final reviewer writes findings to Markdown and returns only the path.

Sol cannot review because Sol is the author and orchestrator.
Fable already reviewed the brief and prior PR #114 content.
Opus provides an eligible precision review with fresh context.

The Fable pre-spend review found three blocking issues and five smaller issues.
This revision reconciles all eight findings.
The bounded delta review covers only these changes.

### Pre-spend route card

Lane: review the bounded paid QA plan.
Worker CLI: Claude.
Model: Fable 5.1 through the `fable` alias.
Effort: high.
Reason: the lane needs product and measurement judgment.
Verified: Herdr started `release_eval_fable` in pane `w16:p14` with explicit controls.
Fallback: Opus 5 at high.
Reviewer: Opus 5 at high for the final completed-round gate.
Report contract: findings, evidence, verdict, risks, and blockers in Markdown.

## Production evidence before merge

Wrangler reported Version `6282fe2a-54d8-471e-9f0a-0a2565110af1` at 100 percent traffic.
Deployment `fbd8c942-d1b8-48f4-83b9-94a728b21fa0` started at `2026-08-28T20:42:14.263989Z`.
The earlier Version `2dc2afcb-2449-4553-8b65-a6c082950a0d` also exists.
The version conflict in the prior local plan is now resolved.

`GET /playground` returned `200` with Ray ID `a347348adce1bd63`.
Its CSP used `sha256-J5utxnf3Yyxow6cDGr6zPQ9lyVj1Y4JUbUBOYCGDJus=`.
That fingerprint confirms that PR #99 is not deployed.

`GET /health/skills` returned `200` with Ray ID `a347348add2a53b1`.
It reported `ok: true`, `checked: 41`, and no error.

The queries used Wrangler deployment and version views plus public HTTP reads.
No private request fields were needed.
The record omits account identifiers and author details.

## First paid method

The method used server revision `003ae4ea83c4322b8c89f9598929295dccfe295c`.
The result file is `2026-09-01T21-27-42-variantA.json`.
The selected denominator was one active case of one selected case.

The answering process reached its 600-second wall-clock limit.
It made one successful Raven search and produced no answer.
The judge made no call.
The killed CLI process reported no cost, so cost completeness failed.
Unrecorded provider spend occurred across three assistant turns.
The artifact records 27,713 cache-creation tokens and 80,092 cache-read tokens.
It also records six output tokens.
That unknown amount does not enter the first `$1.50` ledger total.

T5 records one answering-side timeout.
The harness cannot distinguish a provider stream stall from a Claude CLI stall.
This is the first timeout class across 2,207 stored answering rows.
T1 has no answered row or valid grade.
T4 records complete row collection but incomplete cost reporting.
The harness correctly suppressed all aggregates.

The artifact confirms these successful guards:

- the Claude executable matched;
- the inherited environment matched;
- `safeMode` was `false`;
- the isolated working directory was outside the repository;
- the `raven` MCP server was connected;
- the selected ID and lifecycle state matched.

The run produced no evidence about answer or golden quality.
It also produced no actionable Raven defect.
One answering-side timeout remains diagnostic and monitor-only.

The server log shows no Raven call in flight after the completed search.
The stall occurred after the model received that result.

## Second paid method authorization

The owner wrote “all spend is fine” on 2026-09-01.
The current release request also asks for appropriate eval work.
This section creates a separate bounded method authorization.
It does not reuse the first method authorization.

The second method repeats the same single selected ID.
It uses a fresh `run-qa.mjs` collection.
It never changes the first artifact through stored judging or re-judging.
It keeps variant A, Sonnet-5 answering, Sonnet-5 judging, `v2.10`, and `p5`.
It permits one answering call and up to three judge calls.
Its independent total cap is `$1.50`.
It permits no third method run.

The two method caps total `$3.00`.
The true lane spend also includes the unknown first-method provider amount.

The second method remains diagnostic only.
It cannot repair or replace the first artifact.
The two artifacts will remain separate.
No combined aggregate or variance claim is permitted.

The brief, both reviews, and this authorization must enter one clean commit.
A new external prelaunch receipt must pin that exact commit and surface.
Every first-method identity and artifact check applies again.

Stop after another timeout, incomplete cost, provider safeguard, or harness failure.
Stop after any pin, clean-tree, revision, or surface mismatch.
Do not launch a third method under any current authorization.

## Outcome

### Second paid method

The method used server revision `11429719d28b71a328bf4c8f74ff98dbb1a5eb4e`.
The MCP surface SHA-256 was `21a7c649c340119ab2a0f04347c8afee8aa4fb7ae68fc00c1fc876581ef955af`.
The result stamp is `2026-09-01T21-36-44-variantA.json`.
Its SHA-256 is `d9b117298e9a3d4bb562b461ff91f5caa17a3ff9667c4ec74b2238a7f3737a55`.

The method completed in 44 seconds.
It made one answering call and one judge call.
The result was `correct`.

Total reported cost was `$0.3764636`.
Answering cost was `$0.2946388`.
Judge cost was `$0.0818248`.
Cost reporting was complete.

The five-track reading is:

- T1: one answered row and one valid `correct` grade;
- T2: no eligible retry;
- T3: no selected trap;
- T4: complete collection, one healthy judge call, and no contradiction;
- T5: no provider event.

Every preflight and postflight identity pair matched.
The listener process stayed stable.
The artifact stayed comparable with aggregates enabled.
The `raven` MCP server reported `connected`.

### Answer and verdict review

The answer names all three CAP-0074 BN254 functions.
It names both CAP-0075 permutation functions.
It does not call those permutations turnkey hash helpers.
It dates the Protocol 25 activation.
It does not claim default transaction privacy.

The extra Protocol 26 and CAP-0080 context is source-supported.
The answer triggered no avoid item.
The judge reported no missing fact or wrong claim.

The transcript contains two searches and four execute calls.
The first execute returned a serialization error.
The agent recovered through smaller serializable calls.
One recovered serialization error remains diagnostic and requires no action.

The offline plan regrade covered the required service for one of one rows.
Its artifact SHA-256 is `e1ad69bb32c5fd6d18220e96e8dd88ca663ef854a394fc886a5023b90987ea95`.

### Findings and golden decision

The first timeout remains monitor-only.
The successful second method shows no repeated provider or CLI pattern.
This round found no new upstream service gap.
It therefore creates no new `improvements/` finding.

The tested golden matches the reviewed answer and the verified source matrix.
No additional golden change is needed.
The existing `sd-048` finding remains active outside this grading contract.

### Free gates

- `npm run eval:selftest`: passed.
- `npm run eval:compile`: compiled 338 legacy and 122 extended cases.
- `npm run eval:qa:compile`: compiled 500 cases with SHA-256 `0393e7bef6b8bea9e519fbdf11d65fa4a7d32ea2ea803f469c0ac8bd78857ad7`.
- `npm run eval:qa:register`: up to date with zero reopened clusters.
- `npm run eval:qa:lint -- --since main --stale`: zero errors and 62 warnings.
- `npm run eval:routing -- --gate`: passed both gates.
- `npm run eval:algolia-raven`: passed its read-only live checks.
- `npm run eval:plan -- eval/qa/results/2026-09-01T21-36-44-variantA.json`: one of one required service covered.

Baseline tests and the final Opus review remain before merge.

### Release baseline

- `npm run typegen`: passed on the approved rerun.
- `npm run typecheck`: passed.
- `npm test`: 99 files and 1,588 tests passed.
- `npm run build`: passed.
- `npm run test:smoke`: 4 files and 82 tests passed.
- `npm run improvements:lint`: passed with 66 findings.
- `npm run improvements:probes`: six recurring, zero fixed-candidate, zero inconclusive, and zero errors.
- `npm run secrets:scan -- --tree`: passed.
- `git diff --check`: passed.

The first sandboxed type generation could not write its Wrangler log.
The approved rerun wrote the log and passed.

The first recurrence probe lacked the worktree's ignored Lumenloop credential.
It reported four recurring and two inconclusive results.
The authorized host-environment rerun resolved both results as recurring.

`npm audit --omit=dev` reports one existing high-severity `browserslist` advisory.
The dependency path is `agents` through Babel compilation dependencies.
`main` already pins the same `browserslist@4.28.4` package.
This stacked change does not change dependencies.
The advisory is outside this release diff and does not block this merge.

The final Opus review remains before merge.
