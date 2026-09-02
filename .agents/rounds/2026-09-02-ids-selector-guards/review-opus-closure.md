# Optional IDs selector guards — independent closure review

Date: 2026-09-02
Reviewer CLI: Claude Code
Model: Opus 5
Effort: high
Branch: `codex/optional-ids-guards`
Baseline: `main`
Prior report: `.agents/rounds/2026-09-02-ids-selector-guards/review-opus.md`
Reviewer edits: none to implementation files. This report is the only file the reviewer wrote.

## Verdict

**PASS — CLOSED.**

All eleven findings from the original review are closed. R1, the one item this report opened, is
closed too. No actionable finding remains.

This file holds two passes. The first closure pass returned `NOT PASS` with R1 only. The final
closure re-review at the end of this file returns `PASS`. Read the sections in order.

## What the reviewer inspected

`git diff main...HEAD` is still empty. All work is uncommitted.
The reviewer read the whole current diff across the same seven files, plus the updated ledger.
The diff grew from 99 insertions to 145 insertions. No new file entered the scope.

## Finding reconciliation

| Finding | Severity | State | Closure evidence |
| --- | --- | --- | --- |
| F1 new `ids` precondition field has no test | MEDIUM | closed | `test/discovery-paid-run-guards.test.mjs:239` now passes `--ids discovery-001,discovery-002` and asserts `ids` in both the returned object and the forwarded continuation. |
| F2 zero-call assertion is non-discriminating | MEDIUM | closed | Discovery gained the continuation control at `test/discovery-paid-run-guards.test.mjs:125`. QA gained direct parser cases at `test/qa-harness-preconditions.test.mjs:559`, and the ledger states at line 32 that `stderr` is the load-bearing CLI assertion. |
| F3 same defect class on higher-spend flags | MEDIUM | closed | The ledger records all nine residual flags at lines 68 to 84. `.agents/TODO.md:176` now carries the named follow-up. Closed by R1 in the final pass. |
| F4 ledger declares a gate unsatisfiable | MEDIUM | closed | The ledger `## Review status` section now names Claude Code, Opus 5, high effort, the report path, and the `NOT PASS` result. |
| F5 ledger omits the release baseline | MEDIUM | closed | The ledger `## Release baseline` table records six gates. The reviewer re-measured every number. |
| F6 `--ids` stays silent under `--judge-stored` | MEDIUM | closed | `eval/qa/run-qa.mjs:1464` throws before judging. `test/qa-harness-preconditions.test.mjs:584` proves zero judge calls. `eval/qa/README.md:206` states the rule. |
| F7 guard duplicated across two runners | LOW | closed | The ledger `## Accepted duplication` section records the bounded copies and the reason. |
| F8 QA tests under an unrelated describe block | LOW | closed | `test/qa-harness-preconditions.test.mjs:555` opens `describe("run-qa optional IDs selector guards")`. |
| F9 guard carries no rationale comment | LOW | closed | Both copies carry `/** Reject ambiguous selectors before they can expand a paid run. */` at `eval/qa/run-qa.mjs:248` and `eval/discovery/run-agent-discovery.mjs:115`. |
| F10 discovery README dropped `--ids` from the A/B list | LOW | closed | `eval/discovery/README.md:51` restores `--ids` to the list. |
| F11 one flag contract in three files | NIT | closed | The ledger accepts the documentation duplication and gives the reason. |

## First-pass finding (now closed)

### R1 — LOW — The residual optional-flag follow-up is not in the work queue

File: `.agents/rounds/2026-09-02-ids-selector-guards.md:85`, `.agents/TODO.md`

The ledger records the nine residual flags correctly. Line 85 then says "The integrator will add
the follow-up item to `.agents/TODO.md`." That sentence is a promise, not a record.

`.agents/TODO.md` contains no residual-flag item today. A grep for `residual` and for `--sample=`
returns nothing. The one related item is the current block, whose `Done when` clause this change
satisfies.

`AGENTS.md` states that durable working state lives in the repository, and that own-repo work goes
to `.agents/TODO.md`. A dated round ledger is a record of one round. It is not the queue. A hazard
that lives only in a dated ledger will not reach the next agent that reads the queue.

Failure scenario: the block merges and the ledger becomes history. A later operator passes
`--sample=30` to `run-qa.mjs`. The runner ignores the flag and runs the full 500-case battery under
the authorized budget. No queue item ever named that hazard.

Required action: add one `.agents/TODO.md` item under `## Eval instruments` that names the nine
residual flags and the `re-judge.mjs` unknown-flag pattern as the candidate fix. Then remove the
deferral sentence from the ledger.

**Closed.** The reconciliation did both halves. See `R1 reconciliation` in the final pass below.

## Gates the reviewer re-ran

| Gate | Command | Ledger claim | Reviewer result |
| --- | --- | --- | --- |
| Focused tests | `npx vitest run test/discovery-paid-run-guards.test.mjs test/qa-harness-preconditions.test.mjs` | 2 files, 105 tests | pass — 2 files, 105 tests |
| Typecheck | `npm run typecheck` | PASS | pass |
| Full test suite | `npm test` | 100 files, 1639 tests | pass — 100 files, 1639 tests |
| Build | `npm run build` | 7038.90 KiB, gzip 1408.86 KiB | pass — 7038.90 KiB, gzip 1408.86 KiB |
| Secret scan | `npm run secrets:scan -- --tree` | no leaks | pass — no leaks |
| Diff check | `git diff --check` | PASS | pass |
| Provider calls | none | 0 | 0 |

Every ledger number matches the reviewer's own measurement.

## Closure checks the reviewer added

The reviewer verified the strength of the new `--judge-stored` guard test, not only its result.

`test/qa-harness-preconditions.test.mjs:663` is a positive control in the same file. It calls
`fixture.run(path, ["--expect-agent-environment-sha256", <valid>])`, exits 0, and asserts
`paidCalls()` equals `["paid"]`. The new test at line 584 uses that same invocation plus
`--ids q-example`. Its zero-call assertion therefore discriminates against a proven paid path.
This is the first non-vacuous zero-call proof in the round.

The reviewer also confirmed these points:

- The new contradiction check at `eval/qa/run-qa.mjs:1464` runs before `prepareStabilityRegister`
  and before `judgeStoredResults`. Only the binary pin, the environment pin, and the budget parse
  precede it. None of those spends money.
- No committed command combines `--judge-stored` with `--ids`. A grep across `*.md`, `*.mjs`, and
  `*.json` finds only the new code, the new test, and the new documentation. The new rejection
  breaks no recorded workflow.
- `parseOptionalIdsFlag` still runs first in `main()` at `eval/qa/run-qa.mjs:1423`. An
  `--ids=x --judge-stored y` command reports the equals-form error rather than the contradiction
  error. Both paths fail before spend, so the order is safe.
- The F1 fix removes the no-`--ids` case from the shape test. Every other test in
  `test/discovery-paid-run-guards.test.mjs` still builds arguments without `--ids`, so the absent
  path stays exercised. No coverage was lost.
- Deleting the conditional spread at `eval/discovery/run-agent-discovery.mjs:142` now fails the
  shape test. The F1 failure scenario is closed.
- Scope is unchanged at seven modified files plus the ledger. No unrelated file entered the diff.
- The tree is identical before and after all six gates.

## Observations, not findings

- The `AGENTS.md` model-routing section also asks for the reason a matched reviewer lane was
  skipped. The ledger names the lane, the model, and the effort, which is what F4 required. It does
  not say why Sol or Grok was not used. The integrator may add one clause.
- `eval/discovery/README.md:49-51` now names `--ids` in two adjacent sentences. The review asked
  for the restored A/B list, so the small repetition is intended.
- `.agents/TODO.md` still carries the open block, and `.agents/NEXT.md` still lists it as the one
  open agent-actionable block. Closing both is the integrator's merge step, not a defect now.

## First-pass summary

| Severity | Count | Findings |
| --- | --- | --- |
| HIGH | 0 | — |
| MEDIUM | 0 | — |
| LOW | 1 | R1 |
| NIT | 0 | — |

---

# Final closure re-review

Date: 2026-09-02
Reviewer CLI: Claude Code
Model: Opus 5
Effort: high
Scope: verify R1 only, plus a full regression check of the unchanged work.

## Final verdict

**PASS.** No actionable finding remains. The block meets its exit gate.

## R1 reconciliation

R1 is closed. The reconciliation did both halves of the required action.

`.agents/TODO.md:176` adds the item `Harden residual optional equals-form flags in paid runners`.
It names all five `run-qa.mjs` residual flags and all four `run-agent-discovery.mjs` residual
flags. The nine flags match the measured set in this report exactly. The item states the
`--sample=30` spend hazard, the model-tuple comparability hazard, and the `eval/qa/re-judge.mjs`
fail-closed parser as the candidate pattern. Its `Done when` clause requires exact parsing or
unknown-flag rejection, discriminating zero-call tests, and documentation of both forms.

The reviewer checked each claim in the new item against the code. Every claim is accurate.
`eval/qa/re-judge.mjs:175` throws `unknown flag ${arg}`. The battery holds 500 cases.

The ledger deferral sentence is gone. A grep for `integrator will` in
`.agents/rounds/2026-09-02-ids-selector-guards.md` returns zero matches. The ledger `## Review
status` section now records the first closure result and the durable `.agents/TODO.md` item.

## Change since the first closure pass

Only `.agents/TODO.md` changed, by 19 added lines and no deletion. The diff moved from 7 files and
145 insertions to 8 files and 164 insertions. The per-file insertion count of every other file is
unchanged.

The reviewer re-read the four discovery anchor lines and the three QA anchor lines. All seven are
byte-identical to the version this report closed on:
`eval/discovery/run-agent-discovery.mjs:115`, `:135`, `:142`, `:372`, and
`eval/qa/run-qa.mjs:248`, `:1423`, `:1464`.

## Final gates

| Gate | Command | Result |
| --- | --- | --- |
| Focused tests | `npx vitest run test/discovery-paid-run-guards.test.mjs test/qa-harness-preconditions.test.mjs` | pass — 2 files, 105 tests |
| Full test suite | `npm test` | pass — 100 files, 1639 tests |
| Secret scan | `npm run secrets:scan -- --tree` | pass — no leaks |
| Diff check | `git diff --check` | pass |
| Provider calls | none | 0 |

The earlier typecheck and build results stand, because no source file changed since that run.

## Final observations, not findings

- The ledger `## Review status` section ends with "An independent closure re-review remains
  pending." This report is that re-review. A ledger cannot record a review before it happens, so
  the integrator flips that line at merge. This is a merge step, not a defect.
- The `AGENTS.md` model-routing section also asks why a matched reviewer lane was skipped. The
  ledger names the lane, the model, and the effort. The skip rationale is still absent. This stayed
  an observation through both passes and does not block the gate.
- `.agents/TODO.md:164` still holds the completed block. Its `Done when` clause is now satisfied.
  The integrator removes it at merge, along with the `.agents/NEXT.md` block.

## Final summary

| Severity | Count | Findings |
| --- | --- | --- |
| HIGH | 0 | — |
| MEDIUM | 0 | — |
| LOW | 0 | — |
| NIT | 0 | — |

Both guards reject the equals form and the duplicate form before any paid call. One spaced
`--ids a,b,c` form still works in both runners. The QA runner rejects `--ids` with
`--judge-stored`, and that test discriminates against a proven paid path. The residual hazard is
recorded in the queue. Every gate passes and every ledger number is verified. The block is
complete.
