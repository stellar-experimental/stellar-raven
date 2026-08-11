---
id: ll-006
service: lumenloop
status: reported-upstream
discovered: 2026-07-03
evidence:
  - eval/qa/results/2026-07-03T16-06-45-variantA.json (q-eco-stellar-rwa-stablecoin-volume)
  - live replay of the agent's exact search_content_semantic query (2026-07-03 evening, production)
  - Solo project 49, todo 807, scratchpad 521
  - live re-verified 2026-07-06 (eval round todo 846): exact query still surfaces Q2 2021 / Q4 2020 / Q2 2024 reviews at ranks 7/9/10 with article 5945 absent from the top 10, and the sim-order inversion (rank 6 sim 0.597 above ranks 1-5 at 0.544-0.531) still reproduces
  - GT-23 recurrence 2026-07-10: a date-bounded July 6-10 query returned July 10/8/9/6 and undated rows in semantic rather than chronological order
  - Solo scratchpad 575 GT-23 primary 3264 and blind 3267
  - https://github.com/lumenloop/lumenloop-backend/issues/18 (filed 2026-07-13; production/configuration regression report against the public `lumenloop-mcp` owner)
recurrences:
  - date: 2026-08-11
    evidence: the original query still omitted article 5945 while returning Q2 2021 and Q4 2020 reviews at ranks 4 and 6; `get_document({collection:"articles",id:5945})` still succeeds, while the focused `Q1 2026 quarterly report` query ranks it fourth. Upstream #18 remains open, with only the 2026-07-13 `kalepail` tracking comment and no maintainer activity.
---

## Finding

`search_content_semantic` over articles has no freshness weighting, so
"recent report"-shaped queries surface years-stale editions of recurring
SDF publications above the current one. For the query "tokenized RWA
stablecoin on-chain activity Stellar SDF report size volume"
(types research+articles), the top 10 include SDF quarterly reviews from
**Q2 2021, Q4 2020, and Q2 2024** (ranks 7/9/10) while the May 2026
"Q1 2026: Execution at network scale" report (article id 5945, whose summary
carries the current headline figures — $5.5B payment volume, 86% YoY
developer growth) never appears. A targeted "Q1 2026 quarterly report"
query retrieves it at rank 1, so the content is indexed and reachable —
only the ranking fails the recency-implying query.

Secondary anomaly in the same replay: result order does not follow the
returned similarity scores (rank 6 sim 0.597 listed below rank 1 sim
0.544), suggesting two retrieval blocks concatenated without a re-sort.

This cost a QA verdict this round: the agent answered from older sources
and missed both flagship figures the question asked for.

## Evidence

Live replay 2026-07-03 (production, free ops): exact agent query →
`hasQ1Report: false` in top 10, stale quarterlies present as above;
targeted query → article 5945 rank 1 (similarity 0.64/0.51 depending on
phrasing). Round record: Solo scratchpad 521 (batch-1 review report).

## Recommendation

Blend a recency component into article ranking (e.g. exponential decay on
`published_at`, or a boost when the query contains recency markers —
"latest", "recent", a year, a quarter). Recurring-series articles
(quarterly reviews, monthly updates) are the sharpest case: the newest
edition should dominate its older siblings for any series-shaped query.
Separately, re-sort the merged candidate set by final score before
returning — the observed sim-order inversion suggests block concatenation.
Consumer-side workaround here would be query rewriting (appending the
current year/quarter), which we have deliberately not shipped — it would
be per-question tuning; the fix belongs in the ranker.

The GT-23 recurrence adds a stricter contract need: bounded results should
expose or guarantee the selected publication/event date field, support explicit
date-desc ordering, and exclude or separately bucket undated rows. Semantic
rank must never be represented as publication chronology.
