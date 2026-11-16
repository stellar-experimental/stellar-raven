# Brief: execute the item 0.4 plan

You are the executor for round item 0.4. Lead: Claude Opus 5.5, agentpc `t1qz`. Worktree
`/home/tyler/code/raven-wt/np-0.4`, branch `np/0.4-todo-ledgers` (already checked out; `npm ci`
done). Work only in this worktree.

## Read

- `AGENTS.md`.
- `.agents/rounds/2026-11-16-next-phase/items/0.4/PLAN.md`, all of it. Its "Review
  reconciliation" table governs where it differs from the steps above it; each row points at a
  finding in `REVIEW.md` next to it, whose exact fix text you use.
- The files the plan edits and the records it cites.

## Do

1. Make every edit in the plan, steps 1 to 4 as reconciled. Docs only. The write set is the one at
   the end of the plan. Do not add the round ledger's 0.4 row; the lead does that. Do set the 0.2
   Deployed cell as step 4 says, and cite the #223 comment of 2026-11-16 as its stamp.
2. Verify each fact before you write it (the plan names the source for each). If a fact does not
   hold, write the true one and record the deviation.
3. Keep the TODO's own style (its header): what is wrong, current state, next step, done-when;
   short sentences; history goes to links.
4. Gates, each run bare, in the worktree: `npm run typecheck`, `npm test`, `npm run build`,
   `npm run secrets:scan -- --tree`. Plus: a link check over `.agents/TODO.md`, the round ledger,
   and every `*.md` in both loop round folders and their ledgers (write the script under `tmp/`,
   which is ignored); `git diff --stat` against `origin/main` shows only the write set.
5. Write `.agents/rounds/2026-11-16-next-phase/items/0.4/EXEC.md`: what you changed per plan step
   (one line each), a short summary of each gate's output, and every deviation.
6. Commit everything (the edits, EXEC.md, and the item folder: PLAN.md, REVIEW.md, briefs) in one
   commit with the normal hooks, never `--no-verify`. Message: a short imperative subject ending
   "(round item 0.4)", a body of a few lines, then a blank line and
   `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Do not push.

## Limits

- No model-calling eval, no paid call, no deploy, no push, no GitHub writes.
- Never open a held-out or reserve QA case; never name which set a case is in. Do not read the
  `~/backups/gca-*` split files.
- No golden, skill, code or generated-file edit.
- No subagents.

## Report

Run `hc send t1qz '/home/tyler/code/raven-wt/np-0.4/.agents/rounds/2026-11-16-next-phase/items/0.4/EXEC.md'`.
