# Item 3.4 report

Lead: Claude Opus 5.5, agentpc `t1sp`. PR: https://github.com/stellar-experimental/stellar-raven/pull/464
(branch `np/3.4-execute-boundary-read`, not merged).

## Result

- **The boundary stays 6,000 tokens, and M2's boundary question closes.** A free read of the
  stored tuning transcripts: 15 runs, 503 units on 87 rows, split v6, tuning rows selected by id
  first. When the values are re-truncated at 16,000 characters, 32 of the 44 exposed rows state a
  fact found only past the cut (R ≥ 3 is "many" under the stop rule fixed before the count). At
  18,000 the figure is 30 of 38.
- **4,500 was dropped before the count.** At 18,000 characters, 79 to 100 of 119 results would
  still exceed Grok's 20,000-byte clip.
- **Grok clip, informational for 4.1.** Today's head clip loses a cited fact on 23 of 38 exposed
  rows, and part of that loss is the host source block, which carries the as-of date. TODO M2 now
  holds only this open part.
- **Recount**, on the baseline and the shipped surface: `data.sections` misreads 0 of 26 and 0 of
  19, `.data` omissions 0, failed calls with an omitted reason 0 of 4 and 0 of 8.
- **Reviews.** The Fable plan review had 18 findings (4 blocking), all adopted. The executor was
  Sonnet 5.5. I read the diff, re-ran the read to reproduce R, and spot-checked three cited facts
  against the data. There was no Codex review, because the result is record-only per your note.
- **Gates.** `typecheck`, `npm test`, `build` and `secrets:scan --tree` all pass on the branch head.
  `test:smoke` was not run because `src/` did not change. USD 0.

## Deploy

Not needed: no Worker bytes change.

## For the orchestrator on the Mac

Nothing.

## Deviations to know

- **The executor read candidates only until each unit had a `cited` or `chained` fact.** R counts
  units and rows, so it does not depend on the unread candidates; RESULT.md says so.
- **The 12-unit control (plan step 7) did not run.** It exists only to refuse a zero, and R is 32.
- **The 4,000 branch would have changed `DEFAULT_MAX_TOKENS` together with the variable**, to keep
  one number (review finding 12). It did not fire.

## Open questions for the owner

None.
