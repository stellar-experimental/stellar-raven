---
id: ll-016
service: lumenloop
status: reported-upstream
discovered: 2026-07-10
evidence:
  - SDF attributes the 2014 Stellar fork to weaknesses in the inherited consensus design
  - Ripple's contemporaneous response disputes that causal interpretation
  - Solo scratchpad 575 GT-27 primary 3270 and blind 3272
  - https://github.com/lumenloop/lumenloop-backend/issues/31
recurrences:
  - date: 2026-08-11
    evidence: "Live semantic rows still lack claimant, target event, dispute, and corroboration fields; issue #31 remains open."
---

## Finding

Historical retrieval can collapse disputed causal narratives into one factual
summary. For Stellar's 2014 fork and 2015 SCP rewrite, SDF and Ripple published
materially different interpretations. A single unattributed explanation makes
the dispute disappear even though both primary records are available.

## Recommendation

Represent historical claims with claimant, publication date, target event, and
dispute/corroboration links. When primary organizations conflict, retrieval and
generated summaries should surface both accounts and avoid synthesizing one
unqualified causal conclusion.
