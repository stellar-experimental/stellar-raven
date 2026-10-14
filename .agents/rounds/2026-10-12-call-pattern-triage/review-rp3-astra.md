LAUNCH-OK

Reviewed `git diff 4a5d17a1 619f5ffb` and the files at `619f5ffbba6cc85880178feb1a7d95e3bc54fcfa`.
The four RP2 findings are fixed. I found no blocking defect in this change.
One minor instruction needs correction below.
This verdict passes the review gate. It does not authorize paid calls.

I used the [run-evals skill](../../skills/run-evals/SKILL.md) launch rules.
I made no paid call, started no server, changed no plan, and pushed nothing.

## Finding

### P3 — The dry run does not report skipped rows

Evidence: `.agents/rounds/2026-10-12-call-pattern-triage/plan-section-guard.md:516`.
The new instruction tells the operator to check the dry-run output for a `skipped` entry.
However, `eval/qa/re-judge.mjs:938` reports selected IDs and identity checks only.
It does not call `isUngradeableSavedRow` or report skipped rows.

I ran the dry run with an `agent-limit` fixture and matching case and judge identities.
It returned exit 0, selected `limit`, and reported `wouldRefuse: false`.
It reported no `skipped` entry.
Calling `rejudgeRows` with that row produced `skipped.reason: "unsuccessful-answer"` and made zero judge calls.

Fix: check each selected source row with `isUngradeableSavedRow` before the paid command.
Keep the dry run for its actual selection and identity checks.
Alternatively, extend the dry run to report rows that it would skip.

This finding does not block launch because the plan separately excludes `agent-limit` cells before command selection.
The corrected zero-grade and confirmation rules also prevent a skip from clearing a regression.
Evidence: `tmp/rp3-evidence/dry-run-output.json` and `tmp/rp3-evidence/grade-check.json`.

## RP2 reconciliation

| RP2 finding | Verified result |
| --- | --- |
| Prefix parsing drops calls | Fixed. `prefix-docs-only` reports two docs calls and one omission. It reports zero unparsed scripts. |
| Aliased reads disappear | Fixed. `alias-bracket` and `mixed-alias` each report one unknown skill-read script. The resolved whole-skill read does not suppress inspection. |
| Confirmation depends on its verdict | Fixed. K1/K2 and their retries complete before text selection determines K3/K4. |
| Agent-limit confirmation is undefined | Fixed. The limit cell keeps zero. Two candidate limit cells against two positive baseline grades form a confirmed system-failure regression. |

I reran all seven RP2 fixtures individually and together.
The built-in self-check passed all 23 fixtures.
Six additional checks passed for bracket access, computed access, destructuring, optional calls, and mixed resolved/unknown reads.

I reran the RP2 agent-limit case through `rowOutcomeClass` and `rejudgeRows`.
The class remains `agent-limit`; the re-judge skips it without calling the judge.
Under the new rules, this case produces text FAIL.
For the guard, it counts toward the declared regression limits and blocks when the guard fired on that row.
No answering retry or live check applies to the system-failure case.

## Confirmation sequence and verdicts

The nine-step sequence works for both guard selections:

| Text outcome | Text confirmation | Guard confirmation |
| --- | --- | --- |
| PASS | K1 uses A1; K2 uses T1 | K3 uses T1; K4 uses TG1 |
| FAIL or INDETERMINATE | K1 uses A1; K2 uses T1, where gradeable | K3 uses A1; K4 uses G1 |

The guard list exists only after the text verdict.
K3 reuses valid confirmation grades from the same source artifact and selects only the remaining IDs.
Empty selections skip their commands.
Each confirmation command permits one failed-judge retry from the original collection artifact.
The sequence authorizes at most four confirmation commands and four confirmation retries.
A budget stop ends the command; further work requires another authorization.

The revised rules retain explicit outcomes for missing grades, failed confirmation retries, and agent-limit cells.
Missing grades give INDETERMINATE.
Failed confirmation retries preserve the stated regression limits; improvements count as no change.
A successful confirmation compares the re-judged grades, with zero retained for each agent-limit cell.
The explicit system-failure rule handles two limit cells without requiring a judge result.

## Budget and command checks

The shared cap adds correctly:

`8 × $12 + 4 × $3 + 4 × $2 + 4 × $2 + $12 = $136`.

The single-change fallback remains $74. The Playground cap remains $22.
All nine paid command templates contain exactly one `--max-budget-usd`.
The confirmation commands use $3; confirmation and initial-judge retries use $2.
Evidence: `tmp/rp3-evidence/budget-commands.json`.

## Stored counts

I reran the current counter against all eight stored MCP artifacts and all four Playground artifacts.
Every reported total matches RP2.

- MCP: 1,887 parsed docs calls, zero omissions, and seven unresolved docs references.
- MCP: 199 section-read scripts and zero unknown skill-read scripts.
- MCP: one unparsed script contains four additional docs calls, giving 1,891 after inspection.
- Playground: 28 docs calls, six omissions, six invalid-argument entries, and six section-read scripts.

I inspected the unparsed script again. Its four docs calls contain their required fields.
The prior classification of the seven unresolved references remains unchanged.

Evidence files are under `tmp/rp3-evidence/`.
The tracked worktree remains clean.
