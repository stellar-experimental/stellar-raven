---
id: ll-015
service: lumenloop
status: reported-upstream
discovered: 2026-07-10
evidence:
  - July 10 weekly roundup says Protocol 27 activated on July 9
  - linked official Stellar post and Horizon boundary establish July 8 activation
  - Solo scratchpad 575 GT-23 primary 3264 and blind 3267
  - reported upstream: https://github.com/lumenloop/lumenloop-backend/issues/28
recurrences:
  - date: 2026-08-11
    evidence: "Research 141 still says July 9 while Horizon ledger 63386819 reports protocol 27 on July 8; issue #28 remains open."
---

## Finding

Lumenloop's `stellar-weekly-roundup-week-jul-3-2026` repeatedly dates Protocol
27 Mainnet activation as July 9. The roundup's own linked official Stellar post
and the first Protocol-27 Horizon ledger establish activation on July 8 at
17:00:10 UTC. This is a generated-content factual-date error, not a search-only
ranking issue.

## Recommendation

Correct the roundup and add a factual date-consistency check for generated
summaries: event dates should be compared with linked primary timestamps and
live network evidence when available. Store publication date, event date, and
ingestion date separately so one cannot silently substitute for another.
