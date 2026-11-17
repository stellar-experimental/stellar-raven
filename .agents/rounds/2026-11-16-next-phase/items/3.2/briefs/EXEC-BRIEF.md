# Brief: Claude Sonnet 5.5 execution of item 3.2

You execute round item 3.2 in the worktree `/home/tyler/code/raven-wt/np-3.2` on branch
`np/3.2-per-source-status`. The lead is agentpc `t1s9`.

## Read

- `AGENTS.md`.
- The reconciled plan: `.agents/rounds/2026-11-16-next-phase/items/3.2/PLAN.md` (it binds), and
  `REVIEW.md` beside it for the evidence behind each step.
- `/home/tyler/code/raven-wt/orch/3.2-NOTE.md` (scope).
- `.agents/rounds/2026-11-16-next-phase/items/0.2/PLAN.md` and `EXEC.md` for the routing
  fingerprint method step E7 copies.

## Do

Carry out steps A to F of the plan in order. Commit on the branch with the normal hooks, never
`--no-verify`: one commit for A to D, one for E (manifest, generated files and the `eval/gates.json`
re-stamp together), one for F. End each commit message with
`Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Do not push; the lead does.

Run every gate in the plan's "Gates" section, bare (no pipe), after the last commit.

Write `.agents/rounds/2026-11-16-next-phase/items/3.2/EXEC.md`: what you did per step, a short
summary of each gate's output, the routing comparison (grades, totals, any top-five list
changes), and every deviation from the plan with its reason. Commit EXEC.md with step F.

## Rules

- **QA cases.** Never open, cat, print or diff with context any file under `eval/qa/corpus/`, any
  row of `eval/qa/cases.json`, or any split file. Do the step E6 edit only by the scripts the plan
  describes, which print nothing from a case. Never write which set any case is in, anywhere.
- **Stop rule.** If the routing comparison moves any grade or accepted total, stop: do not
  re-baseline. Write what moved in EXEC.md and report.
- If a step cannot be done as planned, choose the smallest change that keeps the plan's intent,
  and record it as a deviation. If that would change scope or a decision, stop and report instead.
- Generated files only from their scripts. Never print a secret. No local server, no
  model-calling eval, no paid call, no upstream posting.
- No subagents; no `hc` children. Control no terminal but your own.
- The lead may send you a follow-up (the Codex review findings to reconcile). Handle it in the
  same way: fix, re-run the affected gates, update EXEC.md, commit, report again.
