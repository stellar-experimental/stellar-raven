---
id: ll-030
service: lumenloop
status: verified
discovered: 2026-08-28
upstreamTitle: Lumenloop project records count sub-products without naming them
evidence:
  - eval/qa/results/2026-08-28T19-27-08-variantA.json row q-defi-wisdomtree-crdt
  - live re-execution 2026-08-28 lumenloop.get_project({slug:"wisdomtree"}) returns a 624-character WisdomTree Prime record stating "13 digital funds and a Gold token" with no CRDT or CRDYX substring
  - live re-execution 2026-08-28 lumenloop.search_directory({query:"CRDT"}) degrades to match_mode semantic and returns DTCC, Stellar Router SDK, Decentrio, OrbitCDP, and DeFarm
  - live re-execution 2026-08-28 lumenloop.search_content_semantic over CRDT/CRDYX returns about thirty rows and none names either ticker
  - live re-execution 2026-09-04T07:00:31.027Z through production Raven used the host-side LumenLoop credential without exposing it; all three original calls returned ok and reproduced the record-content gap
recurrences:
  - date: 2026-09-04
    evidence: authenticated production Raven re-execution reproduced the exact defect. lumenloop.get_project({slug:"wisdomtree"}) returned the 13-digital-funds description with no CRDT or CRDYX substring. lumenloop.search_directory({query:"CRDT",limit:10}) returned match_mode semantic and ten adjacent rows, with no CRDT. lumenloop.search_content_semantic({query:"WisdomTree CRDT CRDYX private credit alternative income digital fund Stellar",limit:15}) returned 24 rows across six collections, with no CRDT or CRDYX substring.
---

## Finding

`lumenloop.get_project` returns a record for `wisdomtree` that counts the
issuer's tokenized funds without naming any of them. The record states "13
digital funds and a Gold token" and names no fund. No content row in the
semantic index names an individual fund ticker either.

A consumer asking about one named fund on Stellar cannot reach it from the
Lumenloop surface. The directory holds the issuer and states the fund count,
but the named products stay unreachable.

This is not a recurrence of `ll-012`. `ll-012` covers weak recall in broad RWA
discovery and its live/planned state mixing; its 2026-08-14 recurrence already
records the CRDT content-absence instance. This finding covers the naming depth
inside a successfully retrieved record. The count is present; the names are
not. That is a record-content gap, not a recall gap, so it takes its own id.

## Evidence

Results stamp `eval/qa/results/2026-08-28T19-27-08-variantA.json`, row
`q-defi-wisdomtree-crdt`.

Live re-execution on 2026-08-28:

- `lumenloop.get_project({slug:"wisdomtree"})` returned a 624-character record
  for WisdomTree Prime. It says "13 digital funds and a Gold token". The
  payload contains no `CRDT` or `CRDYX` substring.
- `lumenloop.search_directory({query:"CRDT"})` degraded to
  `match_mode: "semantic"` and returned five unrelated rows: DTCC, Stellar
  Router SDK, Decentrio, OrbitCDP, and DeFarm. "CRDT" is also a
  computer-science term.
- `lumenloop.search_content_semantic` over CRDT/CRDYX returned about thirty
  rows. None names either ticker. The closest row says "WisdomTree brings
  diversified tokenized portfolios to Stellar with 15 SEC-registered funds",
  with no per-fund ticker.

## Recommendation

Expose the named sub-products or token tickers already implied by the count, as
a `products[]` or `assets[]` array on the project record. The alternative is to
index one content row per named fund, so the semantic lane can reach it.

The exact issuer and SAC addresses that a fund question also needs are owned
elsewhere. This recommendation deliberately stops at naming the fund.
