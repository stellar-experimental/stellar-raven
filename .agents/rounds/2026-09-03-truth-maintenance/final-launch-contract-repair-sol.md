# Final launch-contract finding repair

Date: 2026-09-04.

Mode: repair.

Reviewed snapshot: `52e34c6cab71dc74cd4968f0b9e8e78a88d18147`.

Source review: the supplied final Opus review dated 2026-09-04.

## Verdict

The repair resolves L1, C1, C2, C3, R1, R2, and R3.
The repair changes no historical verdict.
An independent confirmation review remains open.

No paid call, live collection, external write, filing, or deployment occurred.
Every owner decision and paid action remains blocked.

## Repairs

| Finding | Repair |
| --- | --- |
| L1 | `run-evals` now gives the v2 plan hash and launch commands. It points to the full paired contract. |
| C1 | `launch-contract-repair-sol.md` now gives the exact tree difference. It states that all code files match. |
| C2 | The 1,961-test result now identifies the restricted sandbox. |
| C3 | Revision 3 now says the branch contains the work through `dc0761d`. |
| R1 | Re-judge checkpoints now record postflight evidence and explicit terminal outcomes. The original judging error stays primary. |
| R2 | Flip-command mismatches now report the first differing index. Expected and actual values are JSON-quoted and bounded. |
| R3 | The capacity report now separates the `env -i` wrapper from the frozen command array. |

The re-judge outcome status is one of these values:

- `running`
- `successful`
- `budget-stopped`
- `judging-failed`
- `identity-drifted`
- `attestation-failed`

The judging and postflight states remain separate.
An identity drift records the after identity and the failed guard.
An attestation failure records `attestationCompleted: false` and keeps the after identity null.

## Tests

The focused tests cover every code repair.
They cover all re-judge terminal outcomes and combined judging and attestation failures.
They cover every frozen flip-command mutation from the review.
They also cover bounded mismatch values.

| Command | Result |
| --- | --- |
| `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=commit.gpgsign GIT_CONFIG_VALUE_0=false ./node_modules/.bin/vitest run test/re-judge.test.ts test/qa-paired-collection-supervisor.test.mjs` | Pass, 2 files and 118 tests |
| `npm run eval:qa:paired:validate` | Pass |
| `npm run typegen` | Pass; generated ignored `env.d.ts` from placeholder names |
| `npm run typecheck` | Pass |
| `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=commit.gpgsign GIT_CONFIG_VALUE_0=false npm test` | Pass outside the restricted sandbox, 108 files and 1,974 tests |
| `npm run build` | Pass; dry run stopped before upload |
| `git diff --check` | Pass |
| `npm run secrets:scan -- --tree` | Pass |

The first full test run stayed inside the restricted sandbox.
It failed on blocked localhost listeners and unavailable pinned-source fetches.
The same suite passed after the test process received those required permissions.

## Review

The final line-by-line diff review found no unrelated change.
The current documents point to one paired contract owner in `eval/qa/README.md`.
The code keeps failed artifacts honest and preserves the first judging failure.

## Blockers

The implementation has no known blocker.
The independent confirmation review remains a round closeout gate.
All owner decisions remain open.
No repair grants paid, filing, golden, merge, or deployment authority.
