# QA five-track and budget enforcement — 2026-08-29

## Route card

| Field | Value |
| --- | --- |
| Lane | `qa-five-track-v1` and QA budget enforcement only |
| Author | Codex, Sol lane |
| Base | `2a36842659a9f3d3e2ed46657ba5304da8372c73` (`origin/main`) |
| Trigger | `.agents/TODO.md` item: Add `qa-five-track-v1` outcome accounting |
| Skill | `.agents/skills/run-evals/SKILL.md` |
| Scope | Add ADR-0008 T1 through T5, retry records, and sequential total budget enforcement. |
| Write set | QA runner, judge, re-judge, two focused modules, focused tests, QA README, run-evals, and this ledger |
| Excluded | Golden lifecycle, corpus changes, judge rubric changes, panel policy changes, paid evals, external actions, commits, pushes, and pull requests |
| Paid authority | None |
| Report | `/tmp/qa-five-sol.md` |

## Contract

- Every main QA artifact stamps `meta.trackSchema: "qa-five-track-v1"`.
- The selected ID list is immutable. Budget stops preserve every unattempted ID.
- The top-level row remains the first answering and judge attempt.
- `attempts.agent[]` and `attempts.judge[]` preserve every completed retry.
- Every attempt records the input hash, answer hash, failure class, and reported cost.
- Only a first-pass transport failure can receive one byte-identical answering retry.
- Only a judge `cli` or `parse` failure can receive one total judge retry.
- Provider safeguards, timeouts, and deterministic consistency contradictions never retry.
- T3 uses grades, avoid matches, and explicit contradiction evidence. It never uses `judgeScore`.
- Invalid tests remain separate from harness failures and T3 safety outcomes.
- Each paid call receives only the remaining authorized amount.
- Reported cost reduces the total method ledger.
- Exhaustion stops the next paid call.
- A budgeted call with no reported cost invalidates the method.

## Implementation evidence

- `eval/qa/five-track.mjs` owns the T1 through T5 formulas and console report.
- `eval/qa/spend-budget.mjs` owns cap parsing, authorization, cost recording, and exhaustion.
- `eval/qa/run-qa.mjs` applies one answer retry, one judge retry, stored resumes, and the shared cap.
- `eval/qa/judge.mjs` emits closed judge failure classes and accepts `maxBudgetUsd`.
- `eval/qa/re-judge.mjs` enforces the same sequential cap and preserves unattempted IDs.
- `test/qa-five-track.test.mjs` covers all tracks, denominators, IDs, invalid tests, and console output.
- `test/qa-budget.test.mjs` covers cap parsing, remaining authorization, retries, hashes, costs,
  partial panels, stored ledgers, and exhaustion.
- `test/qa-judge-evidence.test.mjs` covers the judge CLI, timeout, parse, and safeguard classes.
- `test/qa-judge-stored.test.mjs` covers stored retry limits, total-cap resumes, cost rejection, and
  budget stops.
- `test/re-judge.test.ts` covers checkpointed re-judge rows and cost accounting.

## Independent review reconciliation

Grok high reviewed the first implementation in `/tmp/qa-five-review-grok.md`. The review found
H1-H3, M1-M6, and L1-L3. All findings were blocking for this reconciliation.

| Finding | Reconciliation evidence |
| --- | --- |
| H1 | `costCompleteness()` supplies one canonical field set. A stored-runner test asserts `answer costs 2/2`, `judge costs 1/1`, and `complete`. |
| H2 | `buildRunnerTracks()` passes trap IDs from selected cases. A missing trap stays in the T3 denominator and `notObserved`. |
| H3 | Re-judge artifacts use `meta.resultSchema: qa-rejudge-v1`. They use `attempts.judgeCalls[]` and do not claim T1-T5. |
| M1 | T5 documents and reports judge safeguards and timeouts. Judge CLI and parse failures remain in T4. |
| M2 | T4 and T5 inspect every panel call. Mixed parse, safeguard, and timeout votes remain visible by ID. |
| M3 | T4 prints named `judging.attempted` and `judging.unattempted` lists. Stored budget stops populate the second list. |
| M4 | Untyped legacy judge errors are terminal. The README and skill direct operators to re-judge. |
| M5 | Missing-cost and overspend failures checkpoint the current incomplete ID and all later unattempted IDs. |
| M6 | Raw summary output is labeled as judge-score diagnostics. The runner omits the contradictory raw trap table. |
| L1 | T4 consistency counts unique IDs. Repeated contradiction attempts retain one ID and all distinct violation details. |
| L2 | Paid runner, stored-judge, and re-judge CLIs require exactly one budget flag. Missing and duplicate flags fail. |
| L3 | A missing first or retry input hash is a mismatch. The runner console test checks the mismatch ID. |

The focused tests call production runner, stored-runner, and re-judge helpers. They also assert the
operator console text for repaired track fields.

## Verification

| Gate | Result |
| --- | --- |
| Focused contract tests | Pass: 6 files, 238 tests |
| `npm run eval:selftest` | Pass |
| `npm run eval:compile` | Pass: 338 legacy and 122 extended cases |
| `npm run eval:qa:compile` | Pass: 500 cases and sample 30 |
| `npm run eval:qa:lint -- --stale` | Pass: 0 errors and 60 warnings |
| `npm run eval:qa:register -- --check` | Pass: up to date |
| `npm run eval:routing -- --gate` | Pass |
| `npm run typecheck` | Pass after the documented `.dev.vars` stub and `npm run typegen` |
| `npm test` | Pass: 93 files and 1,449 tests |
| `npm run build` | Pass |
| `npm run secrets:scan -- --tree` | Pass: no leaks |
| `git diff --check` | Pass |

## Completion state

The implementation reconciliation passes every free gate. The TODO remains open.

The independent Grok high review completed. This ledger records the reconciliation for each
finding. No paid command is authorized. Therefore, no paid result stamps `qa-five-track-v1` and
proves the live method. The TODO stays open until a review and a stamped result prove completion.
