# Brief: execute item 0.1

You are the executor for item 0.1 of the round. Work only in the worktree
`/home/tyler/code/raven-wt/np-0.1` on branch `np/0.1-hono`. Read `AGENTS.md` first.

Carry out the reconciled plan exactly:
`/home/tyler/code/raven-wt/np-0.1/.agents/rounds/2026-11-16-next-phase/items/0.1/PLAN.md`
("Steps (executor)", steps 0 to 6). Respect its stop rule: if it fires, do not commit the lockfile;
write what happened to `EXEC.md` and stop.

Rules:
- Run every gate command bare (no pipe). Never print a secret; the stub `.dev.vars` holds only
  placeholder values and is never committed.
- No model-calling command, no local server, no push, no pull request.
- Commit with the normal hooks, never `--no-verify`. End the commit message with:
  `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`
- Do not touch the round ledger or write `REPORT.md`; the lead does that.

Write `/home/tyler/code/raven-wt/np-0.1/.agents/rounds/2026-11-16-next-phase/items/0.1/EXEC.md`
as plan step 5 describes. Keep it short.
