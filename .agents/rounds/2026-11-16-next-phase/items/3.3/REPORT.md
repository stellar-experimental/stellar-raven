# Item 3.3 report

Lead: Claude Opus 5.5, agentpc `t1sj`. Date: 2026-11-17.

## Pull request and result

Pull request: https://github.com/stellar-experimental/stellar-raven/pull/463 (branch
`np/3.3-ranker-mechanisms`).

Result: both mechanisms were measured once each, alone. Both fail the fixed pass rule and are
dropped. Nothing ships.

Under option (b) of [QUESTION.md](QUESTION.md), as the orchestrator answered it, each mechanism met
its own effect target but failed the no-loss rule:

- **Prefix floor.** It fails rules 1, 2, 5 and 6: legacy and holdout rows go hit-to-miss, one
  holdout row is newly captured, the extended top-3 total falls from 112 to 104, and non-SDF
  displacement at limit 10 rises from 3 to 5. The 2026-10-02 floor of 3 failed the same gate.
- **Gate-failed slot keeping.** It fails rules 1 and 4: 9 legacy top-5 rows go hit-to-miss, one
  holdout row loses top-3, and FAM development reach at limit 10 falls from 63 to 61.

The combination was not measured, because neither mechanism passed alone. Each mechanism's code is
kept as a patch in this folder. The details are in [MEASURE.md](MEASURE.md), and the per-case
reading is in [CASE-REVIEW.md](CASE-REVIEW.md).

The diff touches only `.agents/`: the TODO, the round ledger row and this folder. Gates on the head,
each run bare, all exit 0: `npm run typecheck`, `npm test`, `npm run build`,
`npm run secrets:scan -- --tree`, and `npm run eval:routing -- --gate` (PASS, unchanged).

Spend was USD 0: no model call, no network, no local server.

## Deploy

Not needed. No Worker bytes change.

## For the orchestrator on the Mac

- Merge #463. No deploy, and no production check.
- Two local measurement branches remain on agentpc: `np/3.3-prefix-floor` and
  `np/3.3-slot-keeping`. They were never pushed, and their diffs are committed as patches. Delete
  both with the worktree when you clean up; I have not deleted them.
- The executor wrote a CI-stub `.dev.vars` (placeholder values only) and a generated `env.d.ts` in
  the worktree. Both files are untracked and ignored.

## Open questions for the owner

1. **The stellar.org displacement now has a single known cause: the `search_site` description**
   (cause 1). Both general ranker levers are measured and closed. A description edit is the remaining
   lever, but tuning loop 2 found that a reword moved cost between categories of audit questions.
   Should the TODO item stay open waiting for a description change that passes the
   ADR-0009 bar, or should the owner close it as accepted? `stellarOrg` is little used (item 3.1).
2. **Moving the FAM development rows into `eval/discovery/`.** The TODO says this move is owed when
   the stellar.org reach item is worked. It changes the routing set and needs its own gate run, so I
   kept it out of this item. Should it become its own small item, or wait until the item is next
   worked?

For item 3.5: `src/catalog/README.md` says the public `search` default is 5, but the code says 7
(`src/mcp/tools.ts:55`).
