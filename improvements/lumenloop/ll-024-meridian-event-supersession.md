---
id: ll-024
service: lumenloop
status: reported-upstream
discovered: 2026-07-11
evidence:
  - P4 N2 candidate contrasts older Meridian 2026 Abu Dhabi/Yas Marina Oct 21-22 records with the current Lisbon/Convento do Beato Oct 28-29 schedule announced as a change on 2026-04-01; solo://proj/49/scratchpad/super-corpus-rebuild--585
  - https://github.com/lumenloop/lumenloop-backend/issues/33
  - 2026-08-11 review: issue #33 is open. It has no linked PR, checks, or reviews. Its only comment and latest timeline activity are kalepail's Raven tracking comment at 2026-07-13T22:54:35Z. `get_document({collection: "events", id: 1457})` returns the Lisbon schedule. Exact event lookup for "Yas Marina" is empty, and "Abu Dhabi" returns unrelated event 1212. This does not prove a deployed supersession fix or reproduce a stale Meridian row.
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
