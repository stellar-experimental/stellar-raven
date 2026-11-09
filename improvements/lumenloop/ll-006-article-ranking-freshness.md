---
id: ll-006
service: lumenloop
status: reported-upstream
discovered: 2026-07-03
evidence:
  - "2026-11-09 sweep at 2026-11-09T20:31:07.308386+00:00: partial. Original stale-Q2-2021/Q4-2020 top-ten failure remains absent: broad articles are current RWA-focused candidates; article 5945 is absent broad and first in the Q1-focused control. Raw article similarities start .580,.556,.677; that alone does not prove the final ranking implementation wrong. Bounded July results mix July 6/8/6/7 and undated article 9054; no effective date/order contract is returned. This is the previously documented partial progress, not a newly established ranking deployment. Read-only exact requests and response hashes: research/audits/2026-11-09-improvements-sweep/lane-lumenloop.md; upstream issue state/comments freshly read; no maintainer comments or claimed fix."
  - "2026-11-06 scope/progress reconciliation: .agents/rounds/2026-11-06-remaining-sweep/other.md, row ll-006; replay arguments and response hashes in research/audits/2026-11-06-remaining-sweep/other-receipt.json."
  - eval/qa/results/2026-07-03T16-06-45-variantA.json (q-eco-stellar-rwa-stablecoin-volume)
  - live replay of the agent's exact search_content_semantic query (2026-07-03 evening, production)
  - Solo project 49, todo 807, scratchpad 521
  - live re-verified 2026-07-06 (eval round todo 846): exact query still surfaces Q2 2021 / Q4 2020 / Q2 2024 reviews at ranks 7/9/10 with article 5945 absent from the top 10, and the sim-order inversion (rank 6 sim 0.597 above ranks 1-5 at 0.544-0.531) still reproduces
  - GT-23 recurrence 2026-07-10: a date-bounded July 6-10 query returned July 10/8/9/6 and undated rows in semantic rather than chronological order
  - Solo scratchpad 575 GT-23 primary 3264 and blind 3267
  - https://github.com/lumenloop/lumenloop-backend/issues/18 (filed 2026-07-13; production/configuration regression report against the public `lumenloop-mcp` owner)
recurrences:
  - date: 2026-11-06
    evidence: "2026-11-06 partial: LL search_content_semantic query=\"tokenized RWA stablecoin on-chain activity Stellar SDF report size volume\",types=[research,articles],limit10; Q1 2026 quarterly report control — Old Q2 2021/Q4 2020 top-ten failure no longer appears: current top-ten articles are RWA-focused recent editions. 5945 absent broad, first in focused control. Similarity ordering still non-monotonic (.580,.556,.677). Bounded July query remains semantic rather than chronological. Evidence/owner state: .agents/rounds/2026-11-05-truth-maintenance/other.md, row ll-006."
  - date: 2026-08-11
    evidence: the original query still omitted article 5945 while returning Q2 2021 and Q4 2020 reviews at ranks 4 and 6; `get_document({collection:"articles",id:5945})` still succeeds, while the focused `Q1 2026 quarterly report` query ranks it fourth. Upstream #18 remains open, with only the 2026-07-13 `kalepail` tracking comment and no maintainer activity.
---

## Finding

The 2026-07-03 replay of `search_content_semantic` ranked old recurring SDF
publications above the relevant Q1 2026 report. For the query "tokenized RWA
stablecoin on-chain activity Stellar SDF report size volume" (research+articles),
Q2 2021, Q4 2020, and Q2 2024 appeared at ranks 7/9/10; article 5945 was absent
but ranked first for the focused "Q1 2026 quarterly report" control.

That old-edition top-ten failure does not reproduce on 2026-11-06: the broad
query returns recent RWA-focused articles, while 5945 remains first in the
focused control. A broad query need not select that particular edition.
Returned raw similarities remain non-monotonic (.580, .556, .677), but the
response does not establish whether similarity is the final ranking score.
Neither this order nor the historical result proves an absence of freshness
weighting or concatenation without a final sort. The residual is an unclear
recency/ordering contract, especially for bounded chronological requests.

## Evidence

Live replay 2026-07-03 (production, free ops): exact agent query →
`hasQ1Report: false` in top 10, stale quarterlies present as above;
targeted query → article 5945 rank 1 (similarity 0.64/0.51 depending on
phrasing). Round record: Solo scratchpad 521 (batch-1 review report).

## Recommendation

Document how publication dates, relevance, and any freshness weighting determine
result order, including whether returned similarity differs from the final score.
Test recurring-series queries against current and older editions; investigate
ranking changes only where the intended relevance/recency contract fails.
Do not infer an implementation fix such as re-sorting from raw similarity alone.

The GT-23 recurrence adds a stricter contract need: bounded results should
expose or guarantee the selected publication/event date field, support explicit
date-desc ordering, and exclude or separately bucket undated rows. Semantic
rank must never be represented as publication chronology.

## Current verification — 2026-11-06

Old Q2 2021/Q4 2020 top-ten failure no longer appears: current top-ten articles are RWA-focused recent editions. 5945 absent broad, first in focused control. Similarity ordering still non-monotonic (.580,.556,.677). Bounded July query remains semantic rather than chronological.

Record partial progress; do not assert no freshness weighting from output alone. Retain ordering/recency-contract uncertainty.
Next check: Inspect owner ranking contract/change; compare current recurring-series editions and returned final-score/order semantics.
