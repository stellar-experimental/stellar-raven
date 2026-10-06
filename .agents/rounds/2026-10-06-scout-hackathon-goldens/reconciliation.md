# Reconciliation of the independent review — 2026-10-06

Reviewer: `rev-astra-goldens` (Codex frontier `gpt-6-astra`, high). First pass:
[`review-astra.md`](review-astra.md). The reviewer re-derived the facts without the author's
evidence. DoraHacks returned a human-verification page to the reviewer, so its first pass could not
read the primary event records.

How the author read DoraHacks: `curl -L` with a desktop-browser `User-Agent` header. Each response
was HTTP 200 and carried the server-rendered page data. No verification challenge appeared and none
was solved. A second route, a web reader service, returned the `/report` and `/buidl/<n>` pages
with the same text. Extracts with capture times and page hashes are in
[`dorahacks-captures.json`](dorahacks-captures.json).

| # | Case | Finding (severity) | Disposition |
| --- | --- | --- | --- |
| 1 | placed-share | Independent event verification incomplete (blocker) | Accepted. The winner lists are now cited from the `/report` pages, which a second retrieval route reproduces, and the xbid.ai team post is an independent witness for one of the ten KALE x Reflector places. Returned to the reviewer for a second pass. |
| 2 | placed-share | Different totals are coverage differences, not a dispute (should-fix) | Accepted. The `disputed` rows are replaced by a `corpus-only` row for Scout's totals and a `confirmed-as-of` row for DoraHacks' totals. The notes use the coverage wording. |
| 3 | placed-share | Remove payout claims (should-fix) | Accepted. "paid ten places" is now "lists ten placed submissions". The notes say placement records do not show completed payments. |
| 4 | placed-share | Make the time boundary explicit (should-fix) | Accepted. The notes accept a dated, source-supported numerator, denominator, and share outside the example ranges. |
| 5 | Wraith link | Placement and prize lack independent re-verification (blocker) | Accepted, by replacement. A further search found no source outside DoraHacks that names Wraith as first place. Scout's record derives from DoraHacks, so the bar "primary source plus one independent class" is not met. The case is replaced by `q-scout-hackathon-submission-link-comet-hoops` (BUIDL 27417), whose second place has three witnesses: the DoraHacks summary, the r/Stellar winner announcement, and Scout. No prize amount is asserted. |
| 6 | Wraith link | Narrow avoid item 2 (should-fix) | Accepted in the replacement. The avoid items are "did not place" and "took 1st place"; both are contradicted by two source classes. The notes allow a separately sourced statement about another event. |
| 7 | xbid outcome | Name the directory in the question and the avoid item (should-fix) | Accepted. The question asks whether "Scout's project directory" lists it now. Avoid item 2 names Scout's directory. The notes state what a Scout listing does not establish. |
| 8 | xbid outcome | Correct the source of the first-place result (should-fix) | Accepted. The first evidence row is the team's dated announcement; the DoraHacks summary and Scout follow. |
| 9 | xbid outcome | Remove or attribute the closing date (should-fix) | Accepted with evidence. The answer says "whose submission period ended on 2025-09-08". A new row cites the DoraHacks event record (`timelineEnd` 1757329200). The date is nice-to-have in the notes. |
| 10 | xbid outcome | Label self-tags, project link, status, and absent stack as corpus-only (should-fix) | Accepted for the project link, the status, and the absent stack. The self-tags are in the DoraHacks submission record, so that row stays `confirmed`. |
| 11 | libraries | "Shares ... are a floor" is mathematically false (blocker) | Accepted. The reviewer is correct: 19 placed submissions are unread, so the measured share is not a lower bound. The answer now states the denominator rule. The error is recorded in `truth.verified.evidence`. |
| 12 | libraries | Fixed ordering and lift conditions can reject a correct future answer (blocker) | Accepted in the notes and avoid item 1; partly declined for the key facts. The notes now accept newer dated counts, rankings, and lifts, including a changed ordering or conclusion. Avoid item 1 now depends on the counts the answer cites. The key facts stay as dated snapshot facts: the lane brief requires volatile counts as `scheduled` cases with an as-of date and a `reverifyBy` date, and the judge reads the notes and a current evidence pack for non-stable cases. Purely behavioral key facts would make this a `live` case and remove the pinned truth. |
| 13 | libraries | State the sampling unit and scope in the question (should-fix) | Partly accepted. The answer and key facts now say "submissions with manifest reads" and add the repository-read caveat. The question keeps its natural wording, because the lane brief requires real user questions; the answer and notes carry the Scout scope. |
| 14 | libraries | The notes cite an eight-repository sample the reviewer could not see (note) | Accepted. The notes cite both samples (eight by the author, five by the reviewer) and say they did not reproduce the aggregates. The reviewer's Top Kale read now backs avoid item 2 with class B evidence. |
| 15 | existing cases | `q-scf-kale-winner-live` and `q-gap-hackathon-winner-order` require the event-detail path although submission detail now also returns explicit placement (should-fix) | Deferred. Those are existing gospel outside this lane's four ids. Recorded in `.agents/TODO.md`. No factual contradiction exists. |

Rejected candidates, for the record: Cards402 (BUIDL 42819) and Wraith (BUIDL 46348). In both, the
placement had no witness independent of DoraHacks.

## Second pass

Second pass: [`review-astra-pass2.md`](review-astra-pass2.md). The reviewer marked rows 2 to 8 and
10 to 14 resolved, accepted the partial declines in rows 12 and 13, and accepted the deferral in
row 15. DoraHacks again refused the reviewer, so its DoraHacks rows rest on the author's captures.

| # | Case | Finding (severity) | Disposition |
| --- | --- | --- | --- |
| 16 | placed-share | Row 1 is only partly resolved: the complete winner totals have no witness independent of DoraHacks, and a second retrieval route is not a second source (blocker) | Accepted. The author applied this bar to Wraith and must apply it here. The two winner-count rows, the share row, and `truth.status` are now `unverifiable`. The case stays a proposal. It needs an organizer announcement outside DoraHacks for both winner lists, or a source-relative rewrite with its own review. |
| 17 | Comet x Hoops Finance | The note says Scout's store does not hold Blend Pool Creator; Scout holds BUIDL 27438 under another event with no placement (should-fix) | Accepted; the author's claim was wrong. The note keeps only "First place at Blend went to Blend Pool Creator; an answer need not name it." The ledger and the TODO item are corrected. |
| 18 | Comet x Hoops Finance | The optional closing date has one upstream witness (should-fix) | Accepted. The clause is removed from the answer. The timestamp remains as an attributed observation in an evidence note. |
| 19 | xbid outcome | Row 9 is partly resolved: the closing date has one upstream witness (should-fix) | Accepted. The clause and its corroboration row are removed. The timestamp remains as an attributed observation in an evidence note. |

Result: three cases have a review verdict that permits activation with the edits above applied.
One case is blocked. No case was activated in this round, because the coordinator held the Scout
`1.9.71` absorb.
