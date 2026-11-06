---
id: ll-024
service: lumenloop
status: reported-upstream
discovered: 2026-07-11
evidence:
  - "2026-11-06 scope/progress reconciliation: .agents/rounds/2026-11-06-remaining-sweep/other.md, row ll-024; replay arguments and response hashes in research/audits/2026-11-06-remaining-sweep/other-receipt.json."
  - P4 N2 candidate contrasts older Meridian 2026 Abu Dhabi/Yas Marina Oct 21-22 records with the current Lisbon/Convento do Beato Oct 28-29 schedule announced as a change on 2026-04-01; solo://proj/49/scratchpad/super-corpus-rebuild--585
  - https://github.com/lumenloop/lumenloop-backend/issues/33
  - 2026-08-11 review: issue #33 is open. It has no linked PR, checks, or reviews. Its only comment and latest timeline activity are kalepail's Raven tracking comment at 2026-07-13T22:54:35Z. `get_document({collection: "events", id: 1457})` returns the Lisbon schedule. Exact event lookup for "Yas Marina" is empty, and "Abu Dhabi" returns unrelated event 1212. This does not prove a deployed supersession fix or reproduce a stale Meridian row.
recurrences:
  - date: 2026-11-06
    evidence: "2026-11-06 inconclusive: LL get_document events1457; search_documents events Yas Marina/Abu Dhabi/Meridian; broad Meridian query; read current1819 — 1457 now unavailable. Yas Marina empty; Abu Dhabi unrelated1212. Current1819 correctly Lisbon Convento do Beato Oct28-29. No stale Meridian venue row reproduced, and original file never retained one. Evidence/owner state: .agents/rounds/2026-11-05-truth-maintenance/other.md, row ll-024."
---

## Finding

This is an event-revision/supersession metadata request. The candidate history
contrasts Abu Dhabi/Yas Marina October 21–22 with the later Lisbon/Convento do
Beato October 28–29 schedule, but no retained original API response proves the
old schedule was returned as current.

On 2026-11-06 old ID 1457 is unavailable, Yas Marina returns no match, and the
Abu Dhabi result 1212 is unrelated. Current event 1819 correctly reports Lisbon,
Convento do Beato, October 28–29. A stale Meridian venue/date claim is not
reproduced, and an unavailable ID alone does not prove a deployed supersession
mechanism or establish why the record disappeared.

## Evidence

The 2026-07-11 P4 N2 candidate recorded the schedule comparison and April 1
change announcement, while explicitly awaiting a direct stale-as-current
response. The 2026-11-06 exact ID, venue, and expanded semantic checks above do
not supply that missing evidence. See the remaining-sweep receipt for their
arguments and response hashes; retain the original scope as inconclusive.

## Recommendation

When the service retains multiple revisions of an event, expose source-backed
revision/superseded-by links and prefer the latest official schedule for current
queries. Label historical schedules with their dates and revision context.
Do not recreate an unavailable old row solely to fill this metadata or treat
optional revision fields as proof that current venue prose is false.

## Current verification — 2026-11-06

1457 now unavailable. Yas Marina empty; Abu Dhabi unrelated1212. Current1819 correctly Lisbon Convento do Beato Oct28-29. No stale Meridian venue row reproduced, and original file never retained one.

Keep explicit inconclusive original scope; do not equate missing old id with deployed supersession fix.
Next check: Owner identifies removed stale record or concrete retained supersession mechanism; otherwise review evidentiary basis.
