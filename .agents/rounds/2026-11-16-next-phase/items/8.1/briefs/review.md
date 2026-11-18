# Brief: Fable review of the item 8.1 plan (TODO audit)

You are an independent reviewer (Claude Fable, documentation tier). The worktree is
`/home/tyler/code/raven-wt/np-8.1` (branch `np/8.1-todo-audit`, from `origin/main` `bb171055`).

Read:
- `/home/tyler/code/raven-wt/np-8.1/.agents/rounds/2026-11-16-next-phase/items/8.1/PLAN.md` (the plan under review);
- `/home/tyler/code/raven-wt/orch/8.1-NOTE.md` (the orchestrator's note: required changes and audit rules);
- `/home/tyler/code/raven-wt/np-8.1/.agents/TODO.md` (the file to be rewritten);
- `/home/tyler/code/raven-wt/np-8.1/AGENTS.md`, and as needed the round ledger
  `.agents/rounds/2026-11-16-next-phase.md`, `DECISIONS.md`, and item records under
  `.agents/rounds/2026-11-16-next-phase/items/` (especially 7.1/REPORT.md, 7.3/*/REPORT.md, 1.4/dated/PRESTAGE.md).

Review the plan for:
1. Accuracy: is any fact in the plan or in a kept TODO item wrong against `main`, the issues
   (`gh issue list --state all --limit 60`, `gh issue view N`), or the records? Spot-check claims.
2. Completeness: does each TODO item get the right disposition? Is any item stale that the plan keeps,
   any duplicate missed, any open issue unmapped, any 7.x proposal missing? Do the note's four
   required changes land fully?
3. Safety: do the frozen anchors cover everything the timer-launched dated runs (1.4/dated) read from
   the TODO? Could any planned deletion lose a fact that exists nowhere else?
4. Taste: will the resulting TODO be well scoped, plain, and useful for picking the next task? Is the
   Priorities order right by owner value?

Rules:
- Read-only. Do not edit any file except your report.
- Search with `rg --hidden -g '!.git' <pattern> [path]`; never `grep -r`, `git grep`, `rg -u` or
  `--no-ignore`, an `rg -g` glob that matches a case file, or a shell glob over `eval/` or
  `.agents/rounds/`. Never open a QA case file (eval/qa/corpus/, cases.json, sample.json,
  tool-cases.json, eval/qa results/ or reviewed/), and never run the QA lint.
- No model-calling eval, no paid call, no production write. Do not post to GitHub.
- Do not start subagents.

Output: write findings to
`/home/tyler/code/raven-wt/np-8.1/.agents/rounds/2026-11-16-next-phase/items/8.1/REVIEW.md`, numbered,
each with severity (blocking / should-fix / nit), the plan row or TODO item it concerns, evidence
(file:line, issue, command output), and the change you propose. End with a one-line verdict.
