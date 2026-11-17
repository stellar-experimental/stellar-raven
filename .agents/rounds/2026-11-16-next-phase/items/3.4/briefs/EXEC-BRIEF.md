# Brief: Claude Sonnet 5.5 execution of the item 3.4 plan

You execute round item 3.4 on agentpc in the worktree `/home/tyler/code/raven-wt/np-3.4` (branch
`np/3.4-execute-boundary-read`, `npm ci` already done). Your lead is Claude Opus 5.5 at `t1sp`.

## Read first

- `AGENTS.md`.
- The plan, which binds you: `.agents/rounds/2026-11-16-next-phase/items/3.4/PLAN.md`, and the
  review it reconciles, `REVIEW.md` next to it (the reviewer's scratch scripts are under
  `tmp/review/`; you may reuse their logic, but the committed scripts are yours).
- The orchestrator note: `/home/tyler/code/raven-wt/orch/3.4-NOTE.md`.

## Do

Steps 1 to 10 and 12 of the plan, in order. Step 11 only if step 9's rule sets 4,000, and then
stop before the Codex review: write EXEC.md, commit, and report; the lead starts the Codex review
and sends you its findings to reconcile.

## Rules

- **Held-out rows.** Only the step 1 selector opens files under
  `/home/tyler/code/raven-wt/gca-eval`. It selects rows by id against `sets.tuning` before reading
  any other field. Never print, list, count by set name, or name the set of a non-tuning row.
  Never write in `gca-eval` or run git there. If the tuning sample is under the plan's floor, say
  so and stop.
- **Stop rule.** Apply step 9 exactly as written, after the counts. Do not change a threshold,
  class or candidate rule after you have seen a count. If something in the plan cannot be done as
  written, write the problem in EXEC.md and report to the lead instead of improvising.
- **Spend.** No model-calling eval, no paid call, no network, no local server, no subagents.
- Generated files only from their scripts. Gates bare, never piped.

## Output

- `items/3.4/select-tuning.mjs`, `items/3.4/read-boundary.mjs`, `items/3.4/RESULT.md`, the TODO
  edit (step 12; the lead writes the round ledger row).
- `items/3.4/EXEC.md`: what you did, a short summary of each gate's output, every deviation.
- Commit on the branch with the normal hooks (never `--no-verify`), message ending
  `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Do not push.
- Report as your task line says, then wait: the lead may send follow-up work.
