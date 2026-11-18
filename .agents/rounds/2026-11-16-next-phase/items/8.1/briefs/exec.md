# Brief: execute the item 8.1 plan (TODO audit, records only)

You are the executor (Claude Sonnet 5.5). Worktree `/home/tyler/code/raven-wt/np-8.1`, branch
`np/8.1-todo-audit`. Item folder: `/home/tyler/code/raven-wt/np-8.1/.agents/rounds/2026-11-16-next-phase/items/8.1/`.

Read in full first: that folder's `PLAN.md` (the table, the target texts, and the "Review reconciliation"
section, which overrides the table where they differ), `REVIEW.md`, `/home/tyler/code/raven-wt/orch/8.1-NOTE.md`,
`AGENTS.md`, and `.agents/TODO.md`.

## Do

1. Rewrite `.agents/TODO.md` per the reconciled plan. Every item: what is wrong, current state, next
   step or trigger, "Done when". No history (link the ledger or item record instead), absolute dates,
   plain short sentences. Cite items by heading, never by plan row number. Keep the frozen anchors
   byte-identical (PLAN.md, "Frozen anchors"). Name no new case id; never say which set a case is in.
   The WorkOS item names no person, email or WorkOS ID.
2. Add the "Follow-up answers (2026-11-18)" section to
   `.agents/rounds/2026-11-16-next-phase/DECISIONS.md` (PLAN.md "Other files" plus reconciliation 1),
   placed after the last "Follow-up answers" section and before "## Timing".
3. Add one row for 8.1 to `.agents/rounds/2026-11-16-next-phase.md` (lead: Claude Opus 5.5, agentpc
   `t1yg`; PR: "pending"; result summary; deployed: "Not needed: no Worker bytes change"), with the
   merge-timing sentence of reconciliation 14.
4. Write `AUDIT.md` in the item folder: one line per R, M, D and N disposition (every TODO item that
   changed, was merged, deleted or added) with a one-line reason and, for deleted facts, where the fact
   now lives. List K items too, compactly, so every item has a disposition.
5. Facts to re-measure yourself: build (`npm run build`) and count `picomatch` in `dist/server.js`
   for the Dependencies reach line; use only free, read-only checks.
6. Gates, each run bare (no pipe): `npm run typecheck`, `npm test`, `npm run build`,
   `npm run secrets:scan -- --tree`. Plus two small checks you write as scratch scripts under the
   worktree's `tmp/` (not committed):
   - frozen anchors: extract each frozen section/bullet from `git show origin/main:.agents/TODO.md`
     and from the new file and diff them (must be identical);
   - links and titles: every relative `](path)` link in the new TODO, DECISIONS.md section and
     AUDIT.md resolves to an existing file (ignore `#anchors` and http links); every quoted item
     title the TODO cites matches a `###` heading in it.
7. Write `EXEC.md` in the item folder: what you did, each gate's result in a line, any deviation from
   the plan and why.
8. Commit on the branch with the normal hooks (never `--no-verify`). Message ends with
   `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Do not push.

## Rules

- Records only: no change under `src/`, `test/`, `eval/`, `scripts/`, or any code file. If you find a
  code defect, add it as a TODO item.
- Search with `rg --hidden -g '!.git' <pattern> [path]`; never `grep -r`, `git grep`, `rg -u` or
  `--no-ignore`, an `rg -g` glob that matches a case file, or a shell glob over `eval/` or
  `.agents/rounds/`. Never open a QA case file (eval/qa/corpus/, cases.json, sample.json,
  tool-cases.json, eval/qa results/ or reviewed/), and never run the QA lint.
- No model-calling eval, paid call, production write or GitHub post. No subagents.
- If something in the plan is wrong or cannot be done, do the rest, record it in EXEC.md as a
  deviation, and say so in your report.
