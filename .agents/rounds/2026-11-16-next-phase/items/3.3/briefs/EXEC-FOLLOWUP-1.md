# Follow-up 1: reconcile the per-case review

Read `.agents/rounds/2026-11-16-next-phase/items/3.3/CASE-REVIEW.md` (Claude Fable, per-case
review). Every finding is a fix to the records; no code, no re-measurement. Adopt all eight:

1. TODO slot-keeping bullet: add that it raises non-SDF `stellarOrg` displacement at limits 5 and 7
   (0 to 2 and 1 to 3 of 25). MEASURE.md rule 5 row for slot keeping: "pass at limit 10 only", with
   the limit-5 and limit-7 rises named.
2. TODO cause-1 bullet: replace "Neither mechanism touches it" with the reviewer's wording (neither
   removes any of the three; the prefix floor adds two at limit 10; slot keeping adds two at limits 5
   and 7).
3. EXEC.md prefix-floor test classification: the two telemetry tests are losses (same order change
   as `keeps wider candidates identical`): 20 losses, 3 re-pins, plus the gate-run test.
4. Slot keeping rule 6 is a pass (three re-pins). Fix MEASURE.md's rule 6 row and EXEC.md step 3
   ("Rules 1 and 4 failed").
5. MEASURE.md: add the 14 named legacy cardHit5 hit-to-miss ids for the prefix floor.
6. and 7. MEASURE.md: one short paragraph per mechanism under "Per-case reading", citing
   CASE-REVIEW.md findings 6 and 7 for the detail. Do not copy the lists.
8. MEASURE.md prefix-floor rule 1 row: holdout rows also go hit-to-miss (counts 1, 3, 2, 2, 1). TODO:
   link `rounds/2026-10-02-routing-adapter-repairs/lane-c-report.md` at the floor-3 sentence, and cut
   the prefix-floor bullet to two sentences.

Also, in `.agents/TODO.md` at the top priority list item 3 ("Mechanisms with a measured cause"):
round items 3.2 and 3.3 are done (3.2 merged as #462; 3.3 measured both mechanisms and dropped
them). Rewrite that item in one or two sentences so it no longer names them as pending work. Keep
"The general routing repair stays held" as it is.

Commit `CASE-REVIEW.md`, `briefs/CASE-REVIEW-BRIEF.md`, this file and your edits in one commit (normal
hooks, your Co-Authored-By line). Run `npm test` and `npm run secrets:scan -- --tree` bare after the
commit, add a "Follow-up 1" section to EXEC.md (amend nothing; a second commit is fine), and report
as before.
