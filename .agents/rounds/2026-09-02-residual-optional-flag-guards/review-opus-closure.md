# Fail-closed CLI parser — independent closure review

Date: 2026-09-02
Reviewer CLI: Claude Code
Model: Opus 5
Effort: high
Branch: `codex/optional-ids-guards`
Baseline: HEAD commit `9ba1f1b` (`eval: guard optional ids selectors`)
Prior report: `.agents/rounds/2026-09-02-residual-optional-flag-guards/review-opus.md`
Ledger: `.agents/rounds/2026-09-02-residual-optional-flag-guards.md`
Reviewer edits: none to implementation files. This report is the only file the reviewer wrote.

## Verdict

**PASS — CLOSED.**

All seven findings are closed. No actionable finding remains.

The reconciliation replaced the deny-list with a real fail-closed parser. Both runners now declare
their complete flag set and reject every equals form, every unknown flag, and every stray argument
before any paid call. Every supported spaced value and the one boolean form still work. The
declarations match actual runner usage exactly. Every ledger number reproduces.

## Finding reconciliation

| Finding | Severity | State | Closure evidence |
| --- | --- | --- | --- |
| F1 deny-list instead of exact parsing or unknown-flag rejection | MEDIUM | closed | `eval/lib/harness-guards.mjs:27` implements `assertFailClosedCliSyntax`. It throws `unknown flag` at line 61 and `unexpected positional argument` at line 64. All ten equals forms the review listed as residual are now rejected; the reviewer re-probed each one. |
| F2 ledger did not record the residual set | MEDIUM | closed | `.agents/rounds/2026-09-02-residual-optional-flag-guards.md:24-44` carries a ten-row `Closed residual set` table with the old silent effect and the current result. |
| F3 documentation stated a partial rule | LOW | closed | `eval/qa/README.md:203-206`, `eval/discovery/README.md:40-42`, and `.agents/skills/run-evals/SKILL.md:134-139` state the complete rule. The duplicated `Other flags include` list is gone. |
| F4 module header claimed two failure modes | LOW | closed | `eval/lib/harness-guards.mjs:5` now reads "Three failure modes ... all observed", and line 14 cites the dated 2026-09-02 review. |
| F5 no direct test for the shared helper | LOW | closed | `test/qa-harness-preconditions.test.mjs:607-635` tests the helper directly, including the empty equals form, an equals form after another flag, an unknown flag, a stray argument, and exact-name matching at line 631. |
| F6 a fake object impersonated a CLI fixture | LOW | closed | `test/discovery-paid-run-guards.test.mjs:211-218` builds the argument array inline. No call to `requiredArgs` with a synthetic object remains. |
| F7 import order broke the alphabetical list | NIT | closed | `assertFailClosedCliSyntax` precedes `assertNeutralAgentCwd` in both lists, and `Fa` sorts before `Ne`. |

## Declaration audit against actual runner usage

The reviewer enumerated every flag each runner reads and compared it to the declaration. Both
declarations are exact: no missing flag and no surplus flag.

**`run-qa.mjs`** — declared at `eval/qa/run-qa.mjs:195-215` as 18 value flags plus the single
boolean `--no-judge`. The runner reads exactly 19 flags:

| Read at | Flags |
| --- | --- |
| `parseRequiredFlagValue` / pin parsers (`:1461`, `:1466`, `:1531`, `:1532`) | `--expect-agent-binary-sha256`, `--expect-agent-environment-sha256`, `--server-revision`, `--expect-sha256` |
| `parseRequiredBudgetFlag` (`:296`) | `--max-budget-usd` |
| `parseOptionalIdsFlag` (`:1454`) | `--ids` |
| `argVal` (`:1474`–`:1546`) | `--max-panel-cases`, `--stability-register`, `--judge-stored`, `--judge-model`, `--judge-panel`, `--variant`, `--search-tool`, `--surface`, `--port`, `--model`, `--cases`, `--sample` |
| `args.includes` (`:1529`) | `--no-judge` |

The other `--` literals in the file — `--output-format`, `--verbose`, `--mcp-config`,
`--strict-mcp-config`, `--max-turns` at `:710`–`:720`, `--verify` at `:570`, `--upstream` at
`:1592` — are arguments the runner passes to a subprocess, not its own CLI. Excluding them is
correct.

**`run-agent-discovery.mjs`** — declared at `eval/discovery/run-agent-discovery.mjs:70-84` as 12
value flags and no boolean. The runner reads exactly 12: the five required pins, `--ids`, and
`--url`, `--cases`, `--model`, `--effort`, `--repeat`, `--run-label` at `:387`–`:392`. Its
subprocess arguments (`--dangerously-skip-permissions`, `--json-schema`,
`--no-session-persistence`, and the rest) are correctly excluded. The empty boolean list is
correct: the runner has no `args.includes` call.

## Direct behavior verification

The reviewer called both exported syntax guards directly. No provider call and no network call
occurred.

| Probe | Runner | Result |
| --- | --- | --- |
| Spaced form for each of the 18 declared value flags | `run-qa` | all accepted |
| Equals form for each of the 18 declared value flags | `run-qa` | all rejected with `<flag>=<value> is not supported; use <flag> <value>` |
| Spaced form for each of the 12 declared value flags | `run-agent-discovery` | all accepted |
| Equals form for each of the 12 declared value flags | `run-agent-discovery` | all rejected with the matching message |
| `--no-judge` bare, and followed by another flag | `run-qa` | accepted |
| `--no-judge=true` | `run-qa` | rejected: `--no-judge=<value> is not supported; use --no-judge` |
| `--bogus`, `--bogus=1`, `--help`, `--cases-ref x` | `run-qa` | rejected as unknown flags |
| `--sample 1`, `--no-judge`, `--bogus` | `run-agent-discovery` | rejected as unknown flags |
| `stray`, `""`, `-h`, a positional after a valid pair | both | rejected as unexpected positional arguments |
| `--model`, `--model ""`, `--model --sample` | `run-qa` | rejected: `--model requires a value` |
| `--url`, `--url ""` | `run-agent-discovery` | rejected: `--url requires a value` |
| A full 2026-08-29-shaped 19-argument collection command | `run-qa` | accepted |

The parser's own contract is sound. The value-and-boolean overlap check at
`eval/lib/harness-guards.mjs:33-36` fails loudly on a malformed declaration. A value whose text starts
with `--` is refused, so a flag can never swallow the next flag. `--=x` falls through to the
unknown-flag branch. A missing `booleanFlags` argument would produce an empty set, which is the
safe default.

Ordering is correct in both runners. `eval/qa/run-qa.mjs:1453` calls the guard on the second
statement of `main()`, before the executable pin, the environment pin, the budget parse, and every
spawn. `eval/discovery/run-agent-discovery.mjs:159` calls it as the first statement of
`parsePaidRunPreconditions`, so `withPaidRunPreconditions` cannot start the paid continuation.

## Regression audit of recorded commands

A fail-closed parser breaks any recorded command that carries an undeclared flag. The reviewer
extracted every `run-qa.mjs` and `run-agent-discovery.mjs` invocation in the repository, following
backslash continuations, and compared each command's flags to the declarations.

Every recorded command uses only declared flags. Three grep hits are prose, not commands:
`research/qa-deep-dive-2026-08-25/fable-max.md:23` and `:183` quote the truncated
`--allowedTools`, and `.agents/rounds/2026-09-01-release-closeout/final-standards-opus-final-delta.md:64`
discusses a generic `--flag=value`. No runbook, script, or CI command regresses.

The pre-existing required-pin tests also still discriminate. The new parser reports the same
messages the old parsers reported for the equals and missing-value forms, and it does not intercept
the absent or duplicate cases, so those still reach `requiredPaidFlag` and
`parseRequiredFlagValue`. The full suite confirms this.

## Test discrimination

The 19 optional equals forms are exactly the optional set: 19 declared `run-qa` flags minus five
required pins minus `--ids` gives 13, and 12 declared discovery flags minus five pins minus `--ids`
gives 6. The tests cover 13 and 6. The `--ids` forms and the five pins are covered by the
pre-existing suites.

**QA** — `test/qa-harness-preconditions.test.mjs:653` and `:675` reuse the invocation from the
positive control at `test/qa-harness-preconditions.test.mjs:791`, which exits 0 and asserts
`paidCalls()` equals `["paid"]`. Each negative case adds one bad argument to that exact command, so
the zero-call assertion carries real information. Each also asserts the stored row's `verdict`
stays `null`.

**Discovery** — `test/discovery-paid-run-guards.test.mjs:150` and `:171` assert both that
`withPaidRunPreconditions` throws and that `continuations` stays empty, with all five pins valid.

**Positive controls** — `test/qa-harness-preconditions.test.mjs:694` asserts the full 19-flag
declared command including the bare `--no-judge` does not throw.
`test/discovery-paid-run-guards.test.mjs:189` does the same for all 12 discovery flags.
`test/qa-harness-preconditions.test.mjs:724` runs five spaced forms through the real CLI and
asserts exit 0 with `paidCalls()` equal to `["paid"]`. `test/discovery-paid-run-guards.test.mjs:211`
does the same in-process for four discovery flags.

## Gates the reviewer re-ran

| Gate | Command | Ledger claim | Reviewer result |
| --- | --- | --- | --- |
| Focused tests | `npx vitest run test/discovery-paid-run-guards.test.mjs test/qa-harness-preconditions.test.mjs` | 2 files, 145 tests | pass — 2 files, 145 tests |
| Typecheck | `npm run typecheck` | PASS | pass |
| Full test suite | `npm test` | 100 files, 1679 tests | pass — 100 files, 1679 tests |
| Build | `npm run build` | 7038.90 KiB, gzip 1408.86 KiB | pass — identical |
| Secret scan | `npm run secrets:scan -- --tree` | no leaks | pass — no leaks |
| Diff check | `git diff --check` | PASS | pass |
| Self-test | `npm run eval:selftest` | all checks passed | pass — all checks passed |
| Routing compile | `npm run eval:compile` | 338 legacy, 122 extended | pass — 338/395 legacy, 122/144 extended |
| QA compile | `npm run eval:qa:compile` | 500 cases, 30 sample | pass — 500 cases, 30 sample |
| QA lint | `npm run eval:qa:lint -- --stale` | 0 errors, 62 warnings | pass — 0 errors, 62 warnings |
| Provider calls | none | 0 | 0 |

Every ledger number matches. The ledger names the free `npm run eval:selftest` and never the paid
`npm run eval:qa:selftest`. The compile commands left the tree unchanged.

## Specification check

`.agents/TODO.md:190-193` sets four Done-when clauses. All four are met.

| Clause | State |
| --- | --- |
| Every listed equals form stops silent fallback before paid calls | met, and nineteen forms are covered rather than nine |
| Each runner must use exact parsing or unknown-flag rejection | met — unknown-flag rejection, plus positional rejection |
| Discriminating zero-call tests must prove each rejection | met — the QA paid positive control and the discovery continuation control back every case |
| Documentation must state the accepted and rejected forms | met in all three files |

The ledger's claim at line 43, "No new TODO item is necessary", is correct for this class. A flag
added later without a declaration entry now fails loudly on first use instead of falling back
silently, so the omission cannot hide.

## Observations, not findings

- Duplicate optional flags remain accepted. `--model x --model y`, `--sample 10 --sample 500`, and
  `--variant A --variant B` all pass the parser, and the runner keeps the first value. This is the
  duplicate class, not the equals class, and it was never in this item's scope. It does not block
  the gate, because no document overclaims: `.agents/skills/run-evals/SKILL.md:138-139` scopes
  duplicate rejection precisely to the required paid-run flags and `--ids`. If a future block wants
  the last silent path closed, the same loop is the place.
- Reverse declaration drift stays silent. A flag removed from a runner but left in its declaration
  would be accepted and ignored. The forward direction, which is the one that costs money, is now
  loud.
- `parseOptionalIdsFlag` still holds its own equals-form check in both runners, now redundant with
  the shared parser. Its duplicate-`--ids` check is still unique, so the function still earns its
  place.
- Neither runner has a `--help` path, so `--help` now reports `unknown flag --help`. That is
  correct fail-closed behavior for a paid runner.
- The ledger `## Review status` section ends with "Closure review is pending." This report is that
  review. The integrator flips that line, closes `.agents/TODO.md:176`, and commits.

## Summary

| Severity | Count | Findings |
| --- | --- | --- |
| HIGH | 0 | — |
| MEDIUM | 0 | — |
| LOW | 0 | — |
| NIT | 0 | — |

Both runners now fail closed on CLI syntax. The declarations match the code exactly, every
supported form still works, no recorded command regresses, the tests discriminate against a proven
paid path, and every gate the ledger claims reproduces. The block is complete.
