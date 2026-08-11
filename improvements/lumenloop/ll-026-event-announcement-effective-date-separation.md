---
id: ll-026
service: lumenloop
status: reported-upstream
discovered: 2026-07-11
evidence:
  - P4 N2 candidate records the CME Stellar-product announcement on 2026-01-15 and start of trading on 2026-02-09 as distinct facts; solo://proj/49/scratchpad/super-corpus-rebuild--585
  - "live verification 2026-07-13: authorized POST /v1/tools/search_documents {collection: articles, query: CME, limit: 100}, followed by get_document {collection: articles, id: 5416}, returned a publication-dated announcement summary with the February 9 planned launch only in prose; the response exposes no typed scheduled/effective or first-trade fields"
  - https://www.cmegroup.com/media-room/press-releases/2026/1/15/cme_group_to_expandcryptoderivativessuitewithlaunchofcardanochai.html
  - https://www.cmegroup.com/content/dam/cmegroup/notices/ser/2026/01/ser-9663.pdf
  - https://www.cmegroup.com/media-room/press-releases/2026/2/11/cme_group_announcesfirsttradesfornewcardanochainlinkandstellarcr.html
  - https://github.com/lumenloop/lumenloop-backend/issues/40
  - 2026-08-11 review: issue #40 is open. It has no linked PR, checks, or reviews. Its only comment and latest timeline activity are kalepail's Raven tracking comment at 2026-07-13T22:54:35Z. `get_document({collection: "articles", id: 5416})` still gives the January 15 publication date and February 9 target only in prose. Article 4809 remains a separate retrospective record with no typed lifecycle relation.
recurrences:
  - date: 2026-08-11
    evidence: CME articles 5416 and 4809 remain separate, publication-dated summaries without typed announcement, effective, trade, or first-trade fields.
---

## Finding

Lumenloop event summaries risk collapsing a product announcement, effective
date, and first-trade date into one event timestamp. For the CME item, January
15 is the announcement while February 9 is the reported start of trading; one
untyped date can produce a wrong answer to either question.

## Evidence

P4 N2 recorded the two dates in its 2026-07-11 candidate review. On 2026-07-13,
the normal authorized Lumenloop article search and document reads captured the
publication-dated announcement projection; it retains the planned February 9
launch only in prose, not as a typed scheduled/effective or first-trade field.
CME's January 15 announcement, Special Executive Report, and February 11
first-trades announcement separately establish the announcement, February 8
effective date, February 9 trade date, and February 9 confirmed first trade.
The live observation covers one CME topic cluster and does not establish corpus-wide
prevalence.

## Recommendation

Model announcement, effective, launch, and first-trade timestamps separately,
with a short event-type label in every generated summary. Preserve the source
publication date as another distinct field.
