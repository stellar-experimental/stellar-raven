# Brief: Fable review of the item 0.3 plan

You are the independent plan reviewer (Claude Fable 5.2, high) for round item 0.3: bundle every
non-`main` branch of this repository, then delete them. The owner's rule (decision 8 in
`.agents/rounds/2026-11-16-next-phase/DECISIONS.md`): "keep things clean, just be careful never to
delete work that hasn't been considered or wrapped into the main project. Losing work without
careful consideration is a big no-no."

Worktree: `/home/tyler/code/raven-wt/np-0.3` (branch `np/0.3-branch-bundle`). All refs are
visible from it (`git branch -a`, worktrees under `/home/tyler/code/raven-wt/`). The Mac's branch
is fetched as `refs/np03-mac/audit/golden-coverage` in the shared repository.

## Read

- `AGENTS.md`; `.agents/rounds/2026-11-16-next-phase/PLAN.md` item 0.3 and `DECISIONS.md`.
- The plan: `.agents/rounds/2026-11-16-next-phase/items/0.3/PLAN.md`.
- The raw inventory in `tmp/0.3-inventory/` (described in the plan's "Method").

## Do

1. Check the plan's facts against the repository: ref lists, tips, counts, pull-request numbers
   (`gh pr list --state all`), and each disposition's stated reason (cite the ledger or record).
2. **The main job: find work with no real disposition.** For every ref the table marks "Archived",
   and for any "On `main`" claim you doubt, read what the branch adds relative to its merge base
   in `.agents/TODO.md`, round ledgers, `research/`, skills and docs. Flag any open item, decision,
   finding or follow-up that `main` does not carry in some form (absorbed, superseded, or
   explicitly dropped). Code that a recorded decision did not ship is fine to archive; say if a
   reason is wrong.
3. Check the steps: will the bundle hold every ref and every object needed; is the verification
   strong enough; are the deletion commands right and in a safe order; is anything outward-facing
   missing from the stop rule.
4. Give a view on the open `gca-eval` question.

## Rules

- Read-only on refs and worktrees. Delete, push, check out or commit nothing. Run no model eval,
  paid call or local server.
- Never open a QA results file (`eval/qa/results/`), a held-out or reserve QA case, or anything
  under `~/backups/*heldout*`; never name which set a case is in.
- Never print a secret; `.dev.vars` files exist in the worktrees.
- Do not spawn subagents.

## Output

Write `.agents/rounds/2026-11-16-next-phase/items/0.3/REVIEW.md`: a short verdict, then numbered
findings, each with severity (blocker, should-fix, note), evidence (path, SHA or command), and the
fix. Then run `hc send t1qw '/home/tyler/code/raven-wt/np-0.3/.agents/rounds/2026-11-16-next-phase/items/0.3/REVIEW.md'`
and stop.
