---
id: ll-016
service: lumenloop
status: reported-upstream
discovered: 2026-07-10
evidence:
  - "2026-11-06 scope/progress reconciliation: .agents/rounds/2026-11-06-remaining-sweep/other.md, row ll-016; replay arguments and response hashes in research/audits/2026-11-06-remaining-sweep/other-receipt.json."
  - SDF attributes the 2014 Stellar fork to weaknesses in the inherited consensus design
  - Ripple's contemporaneous response disputes that causal interpretation
  - Solo scratchpad 575 GT-27 primary 3270 and blind 3272
  - https://github.com/lumenloop/lumenloop-backend/issues/31
recurrences:
  - date: 2026-11-06
    evidence: "2026-11-06 still-repro: LL search_content_semantic Stellar 2014 fork Ripple consensus 2015 SCP,types articles/research — Historical article candidates returned (4640,1912,78,4644,3899,3908,5374); no typed claimant/target-event/dispute/corroboration relation. This proves metadata gap, not a newly proven false causal sentence. Evidence/owner state: .agents/rounds/2026-11-05-truth-maintenance/other.md, row ll-016."
  - date: 2026-08-11
    evidence: "Live semantic rows still lack claimant, target event, dispute, and corroboration fields; issue #31 remains open."
---

## Finding

Historical retrieval lacks structured claimant and dispute links for the
2014 fork and 2015 SCP rewrite. SDF and Ripple published different causal
interpretations, so unattributed synthesis could erase a material disagreement.
The 2026-11-06 retrieval still lacks those structured links, but it does not
establish a newly reproduced false causal sentence. This is a provenance
request; missing optional metadata alone does not prove that current prose
misrepresents either primary account.

## Recommendation

Where a record makes a contested historical claim, attach its claimant,
publication date, target event, and primary source, with dispute/corroboration
links when supported. Generated summaries should attribute conflicting accounts
rather than synthesize one unqualified causal conclusion. Preserve unknown
metadata as unknown; do not invent a dispute or claim to fill a schema.
