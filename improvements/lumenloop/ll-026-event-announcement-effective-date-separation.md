---
id: ll-026
service: lumenloop
status: reported-upstream
discovered: 2026-07-11
evidence:
  - "2026-11-06 scope/progress reconciliation: .agents/rounds/2026-11-06-remaining-sweep/other.md, row ll-026; replay arguments and response hashes in research/audits/2026-11-06-remaining-sweep/other-receipt.json."
  - P4 N2 candidate records the CME Stellar-product announcement on 2026-01-15 and start of trading on 2026-02-09 as distinct facts; solo://proj/49/scratchpad/super-corpus-rebuild--585
  - "live verification 2026-07-13: authorized POST /v1/tools/search_documents {collection: articles, query: CME, limit: 100}, followed by get_document {collection: articles, id: 5416}, returned a publication-dated announcement summary with the February 9 planned launch only in prose; the response exposes no typed scheduled/effective or first-trade fields"
  - https://www.cmegroup.com/media-room/press-releases/2026/1/15/cme_group_to_expandcryptoderivativessuitewithlaunchofcardanochai.html
  - https://www.cmegroup.com/content/dam/cmegroup/notices/ser/2026/01/ser-9663.pdf
  - https://www.cmegroup.com/media-room/press-releases/2026/2/11/cme_group_announcesfirsttradesfornewcardanochainlinkandstellarcr.html
  - https://github.com/lumenloop/lumenloop-backend/issues/40
  - 2026-08-11 review: issue #40 is open. It has no linked PR, checks, or reviews. Its only comment and latest timeline activity are kalepail's Raven tracking comment at 2026-07-13T22:54:35Z. `get_document({collection: "articles", id: 5416})` still gives the January 15 publication date and February 9 target only in prose. Article 4809 remains a separate retrospective record with no typed lifecycle relation.
recurrences:
  - date: 2026-11-09
    evidence: "2026-11-09 sweep at 2026-11-09T20:30:56.473991+00:00: still-repro. Article5416 correctly retains a January15 publication date and February9 planned launch pending regulatory review in prose. Retrospective4809 says launched in February. Neither exposes typed announcement/effective/trade/first-trade relations. This reproduces the metadata request without a wrong-date claim; these two summaries alone cannot establish the first-trade day. Read-only exact requests and response hashes: tmp/lane-lumenloop.md; upstream issue state/comments freshly read; no maintainer comments or claimed fix."
  - date: 2026-11-06
    evidence: "2026-11-06 still-repro: LL get_document articles5416,4809 — Announcement5416 keeps Feb9 planned launch in prose;4809 retrospective remains separate; no typed announcement/effective/trade relation. Evidence/owner state: .agents/rounds/2026-11-05-truth-maintenance/other.md, row ll-026."
  - date: 2026-08-11
    evidence: CME articles 5416 and 4809 remain separate, publication-dated summaries without typed announcement, effective, trade, or first-trade fields.
---

## Finding

The CME topic cluster lacks separate structured announcement, effective,
launch, and first-trade timestamps. On 2026-11-06, article 5416 retains the
January 15 announcement and a planned February 9 launch pending regulatory
review; article 4809 says trading launched in February without specifying a day.
The check does not reproduce a wrong date in that prose. These two records do
not independently confirm the exact first-trade day.
This is a metadata request to disambiguate distinct milestones, not evidence
that a single publication timestamp is itself incorrect or that current
summaries systematically conflate the events.

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

Consider separate source-backed announcement, effective, launch, and first-trade
fields for records that cover multiple milestones. Keep publication date distinct
and preserve the correct milestone labels already present in prose. Do not infer
an effective date or confirmed first trade from an announcement alone, or require
unsupported values merely to populate the proposed fields.
