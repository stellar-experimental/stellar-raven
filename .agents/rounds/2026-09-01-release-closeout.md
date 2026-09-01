# Release closeout

Date: 2026-09-01
Status: pre-spend review
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
This brief limits the paid method to one run and `$1.50` total cost.
The cap includes one answering call and up to three judge calls.
This brief authorizes no rerun.

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
Stop after the single authorized run.
Do not launch a repair rerun under this authorization.
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

## Outcome

Pending.
