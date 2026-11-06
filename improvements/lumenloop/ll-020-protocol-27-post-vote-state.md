---
id: ll-020
service: lumenloop
status: reported-upstream
discovered: 2026-07-11
evidence:
  - "2026-11-06 scope/progress reconciliation: .agents/rounds/2026-11-06-remaining-sweep/other.md, row ll-020; replay arguments and response hashes in research/audits/2026-11-06-remaining-sweep/other-receipt.json."
  - P4 N2 live-candidate review found the indexed Zipper Protocol 27 item remains a pre-vote guide saying "mainnet vote July 8" and cannot itself establish activation; solo://proj/49/scratchpad/super-corpus-rebuild--585
  - the existing ll-015 finding independently records the linked primary source and Horizon boundary as July 8 activation, showing why schedule text must not stand in for current state
  - public guide rechecked 2026-07-13: its canonical/metadata and rendered text still describe the July 8 vote and say to prepare "before mainnet vote"; Horizon ledger 63386819 records protocol_version 27 at 2026-07-08T17:00:10Z
  - reported upstream 2026-07-13: https://github.com/lumenloop/lumenloop-backend/issues/32
  - 2026-08-11 review: issue #32 is open. It has no linked PR, checks, or reviews. Its only comment and latest timeline activity are kalepail's Raven tracking comment at 2026-07-13T22:54:35Z. `lumenloop.search_documents({collection: "articles", query: "Zipper"})` returned only article 8084, and `get_document({collection: "articles", id: 8084})` still gives the July 8 vote schedule and "before mainnet vote" guidance without activation or supersession data.
recurrences:
  - date: 2026-11-06
    evidence: "2026-11-06 partial: LL search_documents articles query Zipper; get_document articles8084; broad activation semantic control — Exact Zipper title search only8084, still pre-vote guidance with no typed activation/supersession. Broad search now finds post-vote research including141 (wrong July9 activation, ll-015). Available corpus no longer contains only schedule information. Evidence/owner state: .agents/rounds/2026-11-05-truth-maintenance/other.md, row ll-020."
  - date: 2026-08-11
    evidence: Article 8084 still represents Protocol 27 as a pre-vote guide. The exact Zipper lookup returns no post-vote status record.
---

## Finding

The exact Zipper guide retrieval still returns pre-vote article 8084 without
an explicit link to the correct post-vote activation state. The guide alone
cannot establish whether the July 8 vote passed or when Mainnet activated.

The corpus is no longer limited to scheduling information: on 2026-11-06 a broad
search finds post-vote research 141. Its July 9 activation date is separately
tracked as incorrect by ll-015. The remaining request here is a source-backed
relation from the historical guide to the current state, not a claim that no
post-vote record exists anywhere in Lumenloop.

## Evidence

The P4 N2 candidate probe on 2026-07-11 found the indexed Zipper item framed
as a pre-vote guide. A fresh public-page recheck on 2026-07-13 retained the
same pre-vote framing, while Horizon ledger 63386819 establishes activation on
July 8 at 17:00:10 UTC. The externally observable coverage/supersession gap is
confirmed; its ingestion, enrichment, indexing, or ranking cause remains
unknown.

## Recommendation

Link the historical guide to a post-vote record backed by the correct July 8
activation evidence. Distinguish `scheduledAt`, `voteResult`, and `activatedAt`
where supported, and direct current-status queries to the later state without
deleting or rewriting the historical guide. Correct research 141's wrong date
under ll-015; merely linking an incorrect post-vote record is insufficient.

## Current verification — 2026-11-06

Exact Zipper title search only8084, still pre-vote guidance with no typed activation/supersession. Broad search now finds post-vote research including141 (wrong July9 activation, ll-015). Available corpus no longer contains only schedule information.

Record partial coverage progress; retain missing explicit supersession and incorrect activation evidence under ll-015.
Next check: After owner change inspect exact guide relation to correct July8 activation source; do not demand deletion of historical guide.
