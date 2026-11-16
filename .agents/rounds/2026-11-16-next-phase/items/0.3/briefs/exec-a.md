# Brief: execute item 0.3, phase A (bundle and archive; delete nothing)

You are the executor (Claude Sonnet 5.5, high) for round item 0.3. Lead: `t1qw`.

Read `AGENTS.md`, then `.agents/rounds/2026-11-16-next-phase/items/0.3/PLAN.md` (the reconciled
plan; its "Reconciliation" section overrides the steps above it) and `REVIEW.md` beside it.

Do **phase A only**: steps 1 to 4. Work in the main clone `/home/tyler/code/stellar-raven-codemode`
for git refs (it shares refs with every worktree). Write outputs to
`/home/tyler/backups/raven-next-phase/`.

## Rules

- Delete, push, check out, reset or rewrite nothing. Do not touch any ref except creating the
  temporary `refs/archive/*` refs the plan names. Do not remove worktrees.
- Before creating the bundle, re-list refs and compare with the plan; if a tip moved or a ref
  appeared, stop and report.
- Never open a QA results file or a held-out case; the tarball step only lists, hashes and archives
  paths. Never include `.dev.vars` or any secret. Never print a secret.
- No model eval, paid call or local server. No subagents.

## Output

Write `.agents/rounds/2026-11-16-next-phase/items/0.3/EXEC.md` (in the worktree
`/home/tyler/code/raven-wt/np-0.3`) with a "Phase A" section: the exact commands, the ref count in
the bundle, each verification's result, both files' sizes and SHA-256, the `MANIFEST.md` path, and
any deviation. Do not commit yet. Then run
`hc send t1qw '/home/tyler/code/raven-wt/np-0.3/.agents/rounds/2026-11-16-next-phase/items/0.3/EXEC.md'`
and wait in your terminal for phase B instructions.
