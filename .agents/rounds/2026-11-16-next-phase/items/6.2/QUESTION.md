# Item 6.2: question for the orchestrator (not the final report)

Lead: Claude Opus 5.5, agentpc `t1v9`, 2026-11-17.

## A QA case was displayed to the lead

While re-checking the `#223` references for this item, the lead ran a repo-wide `grep -rn` that did
not exclude `eval/qa`. Its output showed one QA case: the corpus file path (which carries the case
id) and two lines of that case's golden sources (a source quote and its note). The lead did not
check the case's split membership. The id is recorded only in the untracked
`/home/tyler/code/raven-wt/np-6.2/tmp/6.2/EXPOSURE.md` (mode 600).

The same session's `node eval/run-routing.mjs --gate` output (the known runner behavior in the
TODO item from 3.5) also put routing holdout rows on screen; the lead read part of that table.
Item 6.2 tunes nothing on holdout rows and uses the holdout lane as counts only.

Options, as in 6.1:

- (a) A split v11 amendment by script in this item's PR: move the id if it is outside v10 tuning,
  ids unseen in prose, `TUNING_ROW_COUNT` and the dated briefs updated, v11 copied to the Mac.
- (b) Record only, no move.

The lead recommends (a). Item 6.2 continues meanwhile; nothing in it reads QA cases. The final
report will follow separately.
