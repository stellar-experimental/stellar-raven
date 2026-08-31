# Independent review: repository recovery v2 follow-up

- Reviewer: Grok 4.6, high effort. Independent of the Terra author, the Sol collector and diagnosis, the Fable planner, and the `claude-sonnet-5` answering model.
- Date: 2026-08-30
- Mode: audit only. No repository file changed. No paid eval, deploy, push, or merge ran.
- Fixed point: commit `d5f17212778dd9f5e058d4676ddda417208ca157` versus parent `d451ca499f700f7ad689c5707496e0ae50fe6656`.
- HEAD matches that commit. The worktree is clean.
- Prior review: `/tmp/repo-recovery-v2-review-grok.md` (final form, 308 lines, ends CHANGES-REQUESTED).

This follow-up repairs the v2 review findings. It is not a product change. It is not a ranking change. It is not a golden change.

## Blocking findings

### B1. The ledger misstates the Grok verdict as PASS

- File: `.agents/rounds/2026-08-30-repository-tooling-recovery.md:1192`
- Observed: “Grok 4.6 reviewed commit `d451ca4` at high effort and reported PASS.”
- The preserved report at `.agents/rounds/2026-08-30-repository-tooling-recovery/review-v2-grok.md` has a verdict section that says CHANGES-REQUESTED (line 29) and blocking finding B1 for the false 15-grounded aggregate.
- The same preserved file ends with PASS (line 279). It is an intermediate copy from `20:30:08`. The final review at `/tmp/repo-recovery-v2-review-grok.md` is 308 lines, adds the annotation aggregate, and ends CHANGES-REQUESTED.
- Consequence: the reconciliation record inverts the independent verdict. The commit does reconcile the grounded count. It then claims the reviewer already passed.
- Repair: record CHANGES-REQUESTED for `d451ca4`. State that this follow-up reconciled B1. Store one consistent copy of the final report. Do not keep a footer PASS on a report whose verdict is CHANGES-REQUESTED.

The measurement repairs in this commit are not the defect. The review-attribution sentence is.

## Verdict

CHANGES-REQUESTED

The functional follow-up matches the requested repairs:

- controlling grounded count is 17 of 20
- identity-invalid grade CLI fails closed and omits pass aggregates
- a focused CLI test covers that boundary
- collector fixtures use v2 and omit expected outcomes
- the `other` test uses `operationSequence: null`
- ADR-0010 status is `accepted (2026-08-30)`
- product, ranking, goldens, thresholds, and reviewer guidance are unchanged

Correct the ledger’s Grok verdict before treating the independent review as closed.

## Checklist

| Question | Result |
| --- | --- |
| Corrected 17/20 grounded count | Yes, in the controlling ledger. Direct annotation recount is 15 correct and 17 grounded. The Fable plan still has 15/20 grounded and is labeled a preserved transcription error. |
| Identity-invalid CLI fail-closed output | Yes |
| Focused CLI test | Yes |
| v2 collector fixtures | Yes |
| Null other-outcome test | Yes |
| Accepted ADR status | Yes |
| Preserved review report | Mixed: a copy exists, but it is an intermediate draft that contradicts itself |
| Ledger reconciliation | Mixed: grounded rows and CLI repair are recorded; the Grok verdict is false |
| Unchanged product, ranking, goldens, thresholds, reviewer guidance | Yes |

## Scope

Seven paths changed. No `src/`, catalog, `scripts/`, `cases.json`, `contract.mjs`, `artifact.mjs`, lint, measure, or README file changed.

Changed paths:

- `eval/repo-recovery/grade-results.mjs`
- `test/repo-recovery-grade.test.mjs`
- `test/repo-recovery.test.mjs`
- `test/repo-recovery-collector.test.mjs`
- `research/decisions/0010-repository-recovery-contract-v2.md`
- `.agents/rounds/2026-08-30-repository-tooling-recovery.md`
- `.agents/rounds/2026-08-30-repository-tooling-recovery/review-v2-grok.md`

## Grounded count

I counted `answerReview` on the fourth annotations file again. The file did not change in this commit.

- 20 rows
- 15 `correct: true`
- 17 `grounded: true`

The ledger now says 15 of 20 correct and 17 of 20 grounded. It names the two incorrect-but-grounded rows and the three ungrounded rows. It names the fourth annotations as the controlling record.

The Fable plan still says `15/20 grounded`. The ledger states that this is the earlier transcription error and that the plan is preserved. That is the right treatment of a dated assessment note. Do not rewrite Fable’s file.

## Identity-invalid CLI

`grade-results.mjs` now returns before printing the full grade when `identityPass` is false. The payload has identity, review, projection-error, and `pass: false`. It has no `positivePasses` and no `positives`. Exit status is 1 even without `--gate`.

I ran the renamed fourth reviewed artifact:

```
identityPass: false
identityReason: "stored artifact identity does not match current suite"
reviewPass: true
pass: false
exit: 1
```

The JSON has no positive-pass fields. That closes the prior comparability hazard.

`test/repo-recovery-grade.test.mjs` spawns the CLI on a v1-named invalid artifact and asserts the same fail-closed shape.

## Collector fixtures

`test/repo-recovery-collector.test.mjs` now uses `repository-tooling-recovery-v2`. The Docs-readiness fixture no longer carries `initialEvidence.outcome`. A search of that file finds no v1 contract name and no `outcome` key.

## Null other-outcome test

The positive `other` case now clears operations, sets `operationSequence: null` and `outcome: "other"`, and still expects `sequencePass: false`. It also asserts `reviewPass: true`, so integrity accepts the missing-op shape.

## ADR status

ADR-0010 status is `accepted (2026-08-30)`. That matches ADR-0009.

## Unchanged surfaces

`REQUIRED_POSITIVE_PASSES` is 10. `MAX_PREMATURE_DETOURS` is 0. `CONTRACT` remains `repository-tooling-recovery-v2`.

`eval/repo-recovery/artifact.mjs` is untouched, so reviewer guidance is unchanged. `cases.json` is untouched, so goldens, questions, repositories, and order are unchanged. No ranking or product file moved.

## Tests run in this review

| Command | Result |
| --- | --- |
| `npx vitest run test/repo-recovery.test.mjs test/repo-recovery-artifact.test.mjs test/repo-recovery-collector.test.mjs test/repo-recovery-cost.test.mjs test/repo-recovery-grade.test.mjs` | PASS, 36 tests |
| `npm run eval:repo-recovery:grade -- <fourth reviewed.json>` | FAIL as required: identity closed, no positive-pass fields, exit 1 |
| `git diff --check d451ca4 d5f1721` | PASS |

I did not run paid evals. I did not re-run `npm test`, typecheck, build, or routing.

## Non-blocking notes

1. Packet instructions still mention a frozen expected label. That residual stays. This commit correctly leaves `artifact.mjs` alone.
2. Three operation-selection misses remain monitor-only. That is unchanged and still not a defect in this measurement block.

## Exclusions

- No paid collection, no deploy, no push, no merge, no upstream filing.
- No GitHub re-read of `stellar/stellar-horizon`.

CHANGES-REQUESTED
