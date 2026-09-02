# IDs selector guards — 2026-09-02

Status: complete and reviewed

## Route

The work follows the `.agents/NEXT.md` block named `Harden optional selector flags in both paid runners`.
The implementation uses the `run-evals` workflow.
The documentation uses the `writing-for-agents` workflow.

## Scope

The change covers `eval/qa/run-qa.mjs` and `eval/discovery/run-agent-discovery.mjs`.
Each runner accepts only one spaced `--ids a,b,c` form.
Each runner rejects `--ids=a,b,c` before any paid call.
Each runner rejects duplicate `--ids` flags before any paid call.
The QA runner rejects `--ids` with `--judge-stored` before judging.

This block stays scoped to `--ids`.
No provider call or external service write occurred.

## Zero-call evidence

Each CLI test puts a fake Claude executable first on `PATH`.
The fake executable appends each paid invocation to a temporary call log.
All rejection tests assert that the applicable call log stays empty.

The discovery tests also call `withPaidRunPreconditions` in-process.
They prove that invalid selectors do not start the paid continuation.
The valid control proves that `ids` reaches the parsed preconditions and the continuation.

The QA CLI selector fixture stops later on a missing required pin without the new guard.
Therefore, its `stderr` match is the load-bearing CLI assertion.
The direct parser tests prove that the equals and duplicate guards throw.
The stored-judging test supplies valid pins and proves zero judge calls.

## Exact tests

Command:

```sh
npm test -- --run test/discovery-paid-run-guards.test.mjs test/qa-harness-preconditions.test.mjs
```

The focused cases are:

- Discovery rejects `--ids=discovery-001` before the paid continuation.
- Discovery rejects two spaced `--ids` flags before the paid continuation.
- Discovery forwards `ids: "discovery-001,discovery-002"` through the continuation.
- QA rejects `--ids=q-example` in the direct parser and CLI.
- QA rejects two spaced `--ids` flags in the direct parser and CLI.
- QA rejects `--ids` with `--judge-stored` before the fake judge call.
- Both parsers preserve one spaced comma-separated value.

Result: 2 files passed and 105 tests passed.

## Release baseline

| Gate | Command | Result |
| --- | --- | --- |
| Focused | `npm test -- --run test/discovery-paid-run-guards.test.mjs test/qa-harness-preconditions.test.mjs` | PASS; 2 files and 105 tests |
| Typecheck | `npm run typecheck` | PASS |
| Full tests | `npm test` | PASS; 100 files and 1639 tests |
| Build | `npm run build` | PASS; dry-run upload 7038.90 KiB, gzip 1408.86 KiB |
| Secret scan | `npm run secrets:scan -- --tree` | PASS; no leaks |
| Diff check | `git diff --check` | PASS |

## Residual optional flags

The same loose optional parser remains outside this block.
The equals forms below remain silently ignored.

| Runner | Residual flag | Current effect |
| --- | --- | --- |
| `run-qa.mjs` | `--sample=30` | Runs the full battery. |
| `run-qa.mjs` | `--model=<name>` | Uses the default answering model. |
| `run-qa.mjs` | `--judge-model=<name>` | Uses the default judge model. |
| `run-qa.mjs` | `--cases=<path>` | Uses the default battery. |
| `run-qa.mjs` | `--variant=B` | Runs variant A. |
| `run-agent-discovery.mjs` | `--repeat=3` | Runs one repeat. |
| `run-agent-discovery.mjs` | `--model=<name>` | Uses the default model. |
| `run-agent-discovery.mjs` | `--effort=<value>` | Uses the default effort. |
| `run-agent-discovery.mjs` | `--cases=<path>` | Uses the default cases. |

## Accepted duplication

The two runners keep bounded copies of `parseOptionalIdsFlag`.
This code duplication avoids a wider parser refactor in this block.

The skill and both READMEs repeat the selector contract.
This documentation duplication is accepted because each file is a paid-run entry point.

## Review status

Claude Code ran the independent review with Opus 5 at high effort.
Opus was selected because Sol authored the implementation.
Opus is the precision-review fallback.
The report is `.agents/rounds/2026-09-02-ids-selector-guards/review-opus.md`.
The review returned `NOT PASS` with findings F1 through F11.
The current worktree reconciles every actionable finding.
The Opus 5 high closure report returned `NOT PASS` with R1 only.
R1 now has a durable `.agents/TODO.md` item.
The final closure report is `.agents/rounds/2026-09-02-ids-selector-guards/review-opus-closure.md`.
Its final verdict is `PASS` with no actionable finding.
