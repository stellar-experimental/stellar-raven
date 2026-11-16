# Brief: Fable review of the item 0.4 plan

You are the plan reviewer for round item 0.4 (reconcile `.agents/TODO.md` and the two tuning-loop
ledgers). Lead: Claude Opus 5.5, agentpc `t1qz`. Worktree: `/home/tyler/code/raven-wt/np-0.4`
(branch `np/0.4-todo-ledgers`, at `origin/main` `000a30de`).

## Read

- `AGENTS.md`.
- The plan: `.agents/rounds/2026-11-16-next-phase/items/0.4/PLAN.md`.
- `.agents/rounds/2026-11-16-next-phase/DECISIONS.md` (binding) and `PLAN.md` (its "TODO
  reconciliation" section and the item list).
- `.agents/rounds/2026-11-16-next-phase/items/0.2/REPORT.md` and `items/0.3/REPORT.md`.
- `.agents/TODO.md`, `.agents/rounds/2026-11-14-baseline-tuning.md`,
  `.agents/rounds/2026-11-15-tuning-loop-2.md`, `.agents/README.md`, `.agents/rounds/README.md`.

## Review for

1. **Each deletion and merge.** Is the work really done or really superseded? Check the stated
   reason against the repository (files, `gh pr view`, `gh issue view`, `git log`). Flag any
   deletion that loses an open next step or a fact a later item needs.
2. **Each rewrite.** Is every fact in it true on `000a30de`? Re-derive counts the plan asserts
   (for example the gap-ledger "not re-run" rows, the instruction length and headroom, the split
   SHA). Does any rewrite carry out an owner decision that belongs to another item instead of
   recording it?
3. **Missed reconciliation.** Any other stale TODO text or ledger defect the plan does not cover:
   items already done on `main`, wrong counts, dead links, references to deleted branches.
4. **Rules.** AGENTS.md hard rules: no `solo://`, no retired sibling repo as a live path, skills
   untouched, no held-out or reserve QA case named as such. TODO style per its own header.
5. **Scope and retention.** Is the ledger retention step right under `.agents/README.md`?

## Limits

- Read-only on tracked files except your output. No commits, pushes or GitHub writes.
- Free reads only: no model-calling eval, no paid call. Never open a held-out or reserve QA case;
  do not read `~/backups/gca-*` split files beyond what the plan already states.
- No subagents.

## Output

Write `.agents/rounds/2026-11-16-next-phase/items/0.4/REVIEW.md`: a verdict line, then numbered
findings, each with severity (blocker, should-fix, note), evidence (file and line, or command and
output), and the exact fix. Keep it short. Then run
`hc send t1qz '/home/tyler/code/raven-wt/np-0.4/.agents/rounds/2026-11-16-next-phase/items/0.4/REVIEW.md'`.
