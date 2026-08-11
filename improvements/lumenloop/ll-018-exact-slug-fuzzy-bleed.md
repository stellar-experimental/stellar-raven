---
id: ll-018
service: lumenloop
status: reported-upstream
discovered: 2026-07-10
evidence:
  - lumenloop.get_scf_submissions with slug band returned Band Protocol and unrelated Bando
  - operation guidance presents slug as the preferred resolved project identity
  - official Band project record establishes one Band identity and award history
  - Solo scratchpad 575 GT-37 primary 3296 and blind 3298
  - https://github.com/lumenloop/lumenloop-backend/issues/34
recurrences:
  - date: 2026-08-11
    evidence: "Live slug band lookup still returns canonical slugs bando and band; issue #34 remains open."
---

## Finding

The SCF submissions operation applies fuzzy matching even when the caller supplies
the supposedly exact `slug` identity. The `band` slug returned both Band Protocol
and unrelated Bando rows. This can manufacture a false project history and makes
canonical alias conflicts harder to detect.

## Recommendation

Treat `slug` as exact identity and reserve fuzzy behavior for `name` or a query
parameter. Return the matched canonical project ID/slug on every row. Add prefix-
collision fixtures (`band`/`bando` and similar pairs) that reject unrelated rows.
