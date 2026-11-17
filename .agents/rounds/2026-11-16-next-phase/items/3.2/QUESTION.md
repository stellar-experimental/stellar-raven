# Item 3.2 question for the orchestrator: removing `scout.matchPartners` trips the holdout ceiling

Lead: Claude Opus 5.5, agentpc `t1s9`. 2026-11-17.

## What happened

The removal was built as planned: one `EXCLUDED_SCOUT_OPERATIONS` entry, the normal rebuild, both
ADR-0003 guards green. Then the routing comparison against `main`'s manifest:

| Lane | Accepted totals | Graded rows changed |
|---|---|---|
| Legacy (338) | identical | 0 (2 top-five changes, 9 score-only) |
| Extended (122) | identical | 0 |
| Skills (23) | identical | 0 |
| Protocol history (12) | identical | 0 |
| Holdout (49) | top1/3/5 and cardHit5 identical; **forbidden captures 10 to 11 (ceiling 10); passed 25 to 24** | 1 row gains a forbidden capture |

The cause is lexical corpus statistics: one fewer operation shifts scores on unrelated rows. The
same shift drops `scout.searchRepos` from the top five of a pinned query in `test/search.test.ts:631`.
The holdout lane already sat exactly at its ceiling on `main` (10 of 10), so any catalog change that
adds one forbidden capture trips it. Holdout rows are frozen and blind, so they were read as counts
only.

The plan's stop rule (and AGENTS.md: never re-baseline to make a red gate green) stopped the
executor. Nothing was re-baselined.

## What the lead did

The pull request ships the rest of 3.2: per-source attempts and final status, the Mintlify status
fix, the 24 s Lumenloop and Scout timeouts, and `errorName`. The removal is saved, unpushed, on
the local branch `np/3.2-e-matchpartners` in the agentpc worktree, and the TODO bullet records the
measurement and the hold.

## Question

Which one?

1. **Keep `scout.matchPartners` exposed (lead's recommendation).** While it is exposed, a call
   returns a clean `kind: "error"`, HTTP 503, with the hint "fall back to GET /api/partners
   filters (scout.getPartners); do not retry". The cost is a wasted call; the item's other work no
   longer hides it as a coverage gap (`finalStatus` 503 per source). Revisit when the upstream
   answers again or when a catalog change has holdout headroom.
2. **Remove it and accept the holdout move.** Raise `maxForbiddenCaptures` to 11 in
   `eval/gates.json` with a dated note that the move comes from removing a non-working operation,
   not from tuning; update the pinned search test. This re-baselines the frozen holdout gate, so it
   needs the owner's or your explicit authorization. The lead would add step E to this pull
   request (or a follow-up) on that answer.
3. **Remove it after a routing change that restores holdout headroom.** Out of this item's scope;
   the general routing repair stays held.

## Orchestrator's answer (2026-11-17)

Option 1: keep `scout.matchPartners` exposed. Do not touch the holdout gate or the pinned test.
The TODO bullet records the measurement (holdout forbidden captures 10 to 11, ceiling 10, from the
lexical corpus shift), the hold, and the exact one-line `EXCLUDED_SCOUT_OPERATIONS` change so it
can be recreated. The local branch `np/3.2-e-matchpartners` can then be deleted when the worktree
is cleaned up.
