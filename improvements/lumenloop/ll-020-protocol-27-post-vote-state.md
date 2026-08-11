---
id: ll-020
service: lumenloop
status: reported-upstream
discovered: 2026-07-11
evidence:
  - P4 N2 live-candidate review found the indexed Zipper Protocol 27 item remains a pre-vote guide saying "mainnet vote July 8" and cannot itself establish activation; solo://proj/49/scratchpad/super-corpus-rebuild--585
  - the existing ll-015 finding independently records the linked primary source and Horizon boundary as July 8 activation, showing why schedule text must not stand in for current state
  - public guide rechecked 2026-07-13: its canonical/metadata and rendered text still describe the July 8 vote and say to prepare "before mainnet vote"; Horizon ledger 63386819 records protocol_version 27 at 2026-07-08T17:00:10Z
  - reported upstream 2026-07-13: https://github.com/lumenloop/lumenloop-backend/issues/32
  - 2026-08-11 review: issue #32 is open. It has no linked PR, checks, or reviews. Its only comment and latest timeline activity are kalepail's Raven tracking comment at 2026-07-13T22:54:35Z. `lumenloop.search_documents({collection: "articles", query: "Zipper"})` returned only article 8084, and `get_document({collection: "articles", id: 8084})` still gives the July 8 vote schedule and "before mainnet vote" guidance without activation or supersession data.
recurrences:
  - date: 2026-08-11
    evidence: Article 8084 still represents Protocol 27 as a pre-vote guide. The exact Zipper lookup returns no post-vote status record.
---

## Finding

Lumenloop's Protocol 27 editorial retrieval leaves a pre-vote scheduling item as
the available event record without a superseding activation/status record. A
consumer can recover the July 8 vote schedule but cannot determine from that
record whether the vote passed or when Mainnet activated.

## Evidence

The P4 N2 candidate probe on 2026-07-11 found the indexed Zipper item framed
as a pre-vote guide. A fresh public-page recheck on 2026-07-13 retained the
same pre-vote framing, while Horizon ledger 63386819 establishes activation on
July 8 at 17:00:10 UTC. The externally observable coverage/supersession gap is
confirmed; its ingestion, enrichment, indexing, or ranking cause remains
unknown.

## Recommendation

Publish or index a post-vote record with separate `scheduledAt`, `voteResult`,
and `activatedAt` fields, and mark the pre-vote guide as superseded for current
status queries. Do not make a schedule alone answer a passage/activation query.
