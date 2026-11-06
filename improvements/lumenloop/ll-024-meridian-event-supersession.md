---
id: ll-024
service: lumenloop
status: reported-upstream
discovered: 2026-07-11
evidence:
  - P4 N2 candidate contrasts older Meridian 2026 Abu Dhabi/Yas Marina Oct 21-22 records with the current Lisbon/Convento do Beato Oct 28-29 schedule announced as a change on 2026-04-01; solo://proj/49/scratchpad/super-corpus-rebuild--585
  - https://github.com/lumenloop/lumenloop-backend/issues/33
  - 2026-08-11 review: issue #33 is open. It has no linked PR, checks, or reviews. Its only comment and latest timeline activity are kalepail's Raven tracking comment at 2026-07-13T22:54:35Z. `get_document({collection: "events", id: 1457})` returns the Lisbon schedule. Exact event lookup for "Yas Marina" is empty, and "Abu Dhabi" returns unrelated event 1212. This does not prove a deployed supersession fix or reproduce a stale Meridian row.
recurrences:
  - date: 2026-11-06
    evidence: "2026-11-06 inconclusive: LL get_document events1457; search_documents events Yas Marina/Abu Dhabi/Meridian; broad Meridian query; read current1819 — 1457 now unavailable. Yas Marina empty; Abu Dhabi unrelated1212. Current1819 correctly Lisbon Convento do Beato Oct28-29. No stale Meridian venue row reproduced, and original file never retained one. Evidence/owner state: .agents/rounds/2026-11-05-truth-maintenance/other.md, row ll-024."
---

## Finding

Lumenloop event retrieval can retain stale Meridian venue/date records without
a visible supersession relation. Older Abu Dhabi/Yas Marina October 21-22 facts
conflict with the changed Lisbon/Convento do Beato October 28-29 schedule.

## Evidence

The P4 N2 candidate documents the old and current schedules plus the April 1
change announcement. It is proposed pending a direct response that shows the
stale record returned as current.

## Recommendation

Add event revision and superseded-by metadata. Search results should privilege
the latest official schedule and label historical venue/date records as
superseded rather than returning them as interchangeable facts.

## Current verification — 2026-11-06

1457 now unavailable. Yas Marina empty; Abu Dhabi unrelated1212. Current1819 correctly Lisbon Convento do Beato Oct28-29. No stale Meridian venue row reproduced, and original file never retained one.

Keep explicit inconclusive original scope; do not equate missing old id with deployed supersession fix.
Next check: Owner identifies removed stale record or concrete retained supersession mechanism; otherwise review evidentiary basis.
