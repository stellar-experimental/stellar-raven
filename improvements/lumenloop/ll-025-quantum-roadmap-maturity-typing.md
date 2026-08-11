---
id: ll-025
service: lumenloop
status: reported-upstream
discovered: 2026-07-11
evidence:
  - P4 N2 candidate reads the 2026-06-09 quantum-post-quantum roadmap as stating ML-DSA host functions and native signer support were still missing and staged for 2026/2027; solo://proj/49/scratchpad/super-corpus-rebuild--585
  - Live comparison on 2026-07-13: https://lumenloop.com/news/introducing-quantum-preparedness-plan summarizes the roadmap in present-tense/immediate language, while https://stellar.org/blog/foundation-news/introducing-the-quantum-preparedness-plan retains the missing-today and future/expected qualifiers.
  - https://github.com/lumenloop/lumenloop-backend/issues/37
  - 2026-08-11 review: issue #37 is open. It has no linked PR, checks, or reviews. Its only comment and latest timeline activity are kalepail's Raven tracking comment at 2026-07-13T22:54:35Z. `get_document({collection: "articles", id: 8228})` still says Stage 1 (2026) adds host functions and enterprise wallets can shift immediately, without a structured maturity, deployment state, or target-horizon field.
recurrences:
  - date: 2026-08-11
    evidence: Article 8228 still combines a staged roadmap with present-tense capability language in an untyped projection.
---

## Finding

Lumenloop roadmap summaries do not reliably distinguish planned capabilities
from shipped ones. The June 9 post describes ML-DSA host functions and native
signer support as absent and staged, but untyped summarization can restate the
roadmap as current network functionality.

## Evidence

P4 N2 captured the future-tense and staged timeline in its 2026-07-11 candidate
review. On 2026-07-13, the public Lumenloop page was compared with its linked
Stellar source: the summary says Stage 1 “adds” host functions and enterprise
wallets can shift “immediately,” while the source says the signer/primitives are
missing today and frames the 2026/2027 capabilities as expected or future work.
This confirms a maturity-typing risk on that page, not the broader prevalence,
the internal generation path, or whether newer implementation evidence exists.
The owner-facing report is https://github.com/lumenloop/lumenloop-backend/issues/37.

## Recommendation

Expose capability state (`shipped`, `testnet`, `planned`, `research`) and
target horizon separately from publication date. Generated summaries must retain
the source's future tense and avoid inferring deployment from a roadmap mention.
