# Residual optional flag guards — 2026-09-02

Status: complete and reviewed

## Route

This work follows the `.agents/TODO.md` item named `Harden residual optional equals-form flags in paid runners`.
The implementation uses the `run-evals` workflow.
The skill changes use the `writing-for-agents` workflow.

## Scope

The QA runner declares 18 value flags and one boolean flag.
The discovery runner declares 12 value flags and no boolean flags.
Each value flag keeps its spaced `--flag value` form.
The `--no-judge` boolean keeps its bare form.
Each runner rejects every equals form, unknown flag, and stray argument before any paid call.

The implementation adds one shared fail-closed guard in `eval/lib/harness-guards.mjs`.
The QA runner calls the guard at the start of `main`.
The discovery precondition parser calls the guard before the paid continuation.
No provider call or external write occurred.

## Closed residual set

The initial implementation guarded nine equals forms from the TODO item.
The review found ten more equals forms in the same two runners.
The fail-closed parser now closes the full class.

| Runner | Old residual form | Old silent effect | Current result |
| --- | --- | --- | --- |
| `run-qa.mjs` | `--max-panel-cases=10` | Used the scaled default panel limit. | Rejected before paid calls. |
| `run-qa.mjs` | `--no-judge=true` | Enabled judging. | Rejected before paid calls. |
| `run-qa.mjs` | `--judge-panel=3` | Used one judge call. | Rejected before paid calls. |
| `run-qa.mjs` | `--stability-register=<path>` | Regenerated the stability register. | Rejected before paid calls. |
| `run-qa.mjs` | `--surface=per-operation` | Used the `search-execute` surface. | Rejected before paid calls. |
| `run-qa.mjs` | `--search-tool=<name>` | Used the default search tool. | Rejected before paid calls. |
| `run-qa.mjs` | `--port=8790` | Used port 8788. | Rejected before paid calls. |
| `run-qa.mjs` | `--judge-stored=<path>` | Entered collection mode. | Rejected before paid calls. |
| `run-agent-discovery.mjs` | `--run-label=arm-b` | Used the `agent` label. | Rejected before paid calls. |
| `run-agent-discovery.mjs` | `--url=<url>` | Used the default URL. | Rejected before paid calls. |

No new TODO item is necessary.
This implementation rejects unknown flags and closes future omissions.

## Zero-call evidence

Each CLI fixture puts a fake Claude executable first on `PATH`.
The executable records each simulated paid invocation in a temporary call log.
Every equals-form rejection test asserts that this log stays empty.

The QA tests supply all required pins and a valid stored result.
Without the new guard, each case reaches the fake judge control.
The positive spaced-form controls confirm that the fake judge runs once.

The discovery tests also call `withPaidRunPreconditions` in-process.
Every equals form stops before the paid continuation.
Each positive spaced form reaches that continuation.

## Exact tests

Focused command:

```sh
npm test -- --run test/discovery-paid-run-guards.test.mjs test/qa-harness-preconditions.test.mjs
```

The latest command passed 2 files and 145 tests.
The focused cases cover all 19 optional equals forms.
The focused cases cover unknown flags and stray arguments in both runners.
Direct tests cover the shared helper and its exact-match boundary.
Runner syntax tests cover every declared spaced value and bare boolean form.

## Verification

| Gate | Command | Result |
| --- | --- | --- |
| Focused tests | `npm test -- --run test/discovery-paid-run-guards.test.mjs test/qa-harness-preconditions.test.mjs` | PASS; 2 files and 145 tests |
| Typecheck | `npm run typecheck` | PASS |
| Full tests | `npm test` | PASS; 100 files and 1679 tests |
| Build | `npm run build` | PASS; 7038.90 KiB, gzip 1408.86 KiB |
| Secret scan | `npm run secrets:scan -- --tree` | PASS; no leaks |
| Diff check | `git diff --check` | PASS; no output |

## Free eval preflight

| Gate | Command | Result |
| --- | --- | --- |
| Self-test | `npm run eval:selftest` | PASS; all checks passed |
| Routing compile | `npm run eval:compile` | PASS; 338 legacy cases and 122 extended cases |
| QA compile | `npm run eval:qa:compile` | PASS; 500 cases and 30 sample cases |
| QA lint | `npm run eval:qa:lint -- --stale` | PASS; 0 errors and 62 warnings |

## Finding reconciliation

| Finding | Resolution |
| --- | --- |
| F1 | Replaced the deny-list with complete value and boolean allowlists. |
| F2 | Recorded the ten old residual forms and their closed state. |
| F3 | Documented the complete fail-closed rule and removed the duplicate flag list. |
| F4 | Added the dated third failure mode to the shared module header. |
| F5 | Added direct helper tests for empty equals forms, multiple flags, and exact names. |
| F6 | Replaced the fake fixture object with explicit required arguments. |
| F7 | Restored alphabetical import order in both runners. |

## Review status

Opus 5 completed the high-effort review.
The review report is `.agents/rounds/2026-09-02-residual-optional-flag-guards/review-opus.md`.
All findings are reconciled.
Opus 5 completed the high-effort closure review.
The closure report is `.agents/rounds/2026-09-02-residual-optional-flag-guards/review-opus-closure.md`.
The closure verdict is `PASS — CLOSED` with no actionable findings.
The completed TODO item is removed.
This block is complete and reviewed.
