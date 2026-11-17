# Brief: Claude Sonnet 5.5 execution of item 3.3

You execute round item 3.3 in the worktree `/home/tyler/code/raven-wt/np-3.3` on branch
`np/3.3-ranker-mechanisms`. The lead is agentpc `t1sj`. The plan, instruments and briefs are uncommitted in the worktree; commit them as the base commit (step 1).

## Read

- The orchestrator chose option (b) in `QUESTION.md`; the plan already carries it.

- `AGENTS.md`.
- The reconciled plan: `.agents/rounds/2026-11-16-next-phase/items/3.3/PLAN.md` (it binds), and
  `REVIEW.md` beside it for the evidence behind each change.
- `/home/tyler/code/raven-wt/orch/3.3-NOTE.md` (scope and the fixed pass rule).

## Do

Carry out the plan's steps in order. Commit with the normal hooks, never `--no-verify`, and end each
commit message with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Do not push; the
lead does. Measurement branches stay local.

Measure each mechanism exactly once, as the plan's "Measurement" section says, and read the result
against the pass rule. Write `.agents/rounds/2026-11-16-next-phase/items/3.3/MEASURE.md` and
`EXEC.md` (what you did per step, a short summary of each gate's output, every deviation with its
reason) and commit them on the item branch with the TODO edits.

## Rules

- **Stop rule.** The first measurement of each mechanism decides. Never tweak a mechanism after
  reading its numbers, never try a second constant or placement, never re-baseline to turn a gate
  green. If an implementation bug is found before the numbers are read, fix it once and say so.
- **Holdout and QA.** `npm run eval:routing` prints holdout rows to stdout: always redirect it to a
  file and read only the line starting `GATE` (`grep '^GATE' <file>`). Never open
  `eval/holdout-cases.json` row content, never print a holdout row, and record holdout results as
  counts only. Never open any file under `eval/qa/corpus/`, any row of `eval/qa/cases.json`, or any
  split file. Never write which set a case is in.
- The FAM development file at `~/backups/fd-2026-11-14/split/fam.development.discovery.json` is read
  only by `measure.mts`; check its SHA-256 first; keep the per-row output in a scratch directory
  outside the repository; write only counts into the records. Never read the FAM confirmation files.
- If a step cannot be done as planned, choose the smallest change that keeps the plan's intent and
  record it as a deviation. If that would change scope or a decision, stop and report instead.
- Generated files only from their scripts. Never print a secret. No local server, no model-calling
  eval, no paid call, no upstream posting.
- No subagents; no `hc` children. Control no terminal but your own.
- The lead may send a follow-up (the per-case review findings to reconcile). Handle it the same way:
  fix within the stop rule, re-run the affected gates, update EXEC.md, commit, report again.
