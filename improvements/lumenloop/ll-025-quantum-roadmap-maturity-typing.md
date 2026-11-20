---
id: ll-025
service: lumenloop
status: reported-upstream
discovered: 2026-07-11
evidence:
  - "2026-11-06 scope/progress reconciliation: .agents/rounds/2026-11-06-remaining-sweep/other.md, row ll-025; replay arguments and response hashes in research/audits/2026-11-06-remaining-sweep/other-receipt.json."
  - P4 N2 candidate reads the 2026-06-09 quantum-post-quantum roadmap as stating ML-DSA host functions and native signer support were still missing and staged for 2026/2027; solo://proj/49/scratchpad/super-corpus-rebuild--585
  - Live comparison on 2026-07-13: https://lumenloop.com/news/introducing-quantum-preparedness-plan summarizes the roadmap in present-tense/immediate language, while https://stellar.org/blog/foundation-news/introducing-the-quantum-preparedness-plan retains the missing-today and future/expected qualifiers.
  - https://github.com/lumenloop/lumenloop-backend/issues/37
  - 2026-08-11 review: issue #37 is open. It has no linked PR, checks, or reviews. Its only comment and latest timeline activity are kalepail's Raven tracking comment at 2026-07-13T22:54:35Z. `get_document({collection: "articles", id: 8228})` still says Stage 1 (2026) adds host functions and enterprise wallets can shift immediately, without a structured maturity, deployment state, or target-horizon field.
recurrences:
  - date: 2026-11-09
    evidence: "2026-11-09 sweep at 2026-11-09T20:30:55.932291+00:00: still-repro. Article8228 and public Lumenloop markdown still say enterprise wallets can shift to quantum-safe contract accounts immediately; dated linked source still says required signer/primitives missing today and uses staged roadmap language. Current CAP0087 is Implemented/protocol30, while current Mainnet Horizon remains29. This check concerns source-date maturity wording, not a claim host functions are unimplemented everywhere or that native classic signers shipped. Read-only exact requests and response hashes: research/audits/2026-11-09-improvements-sweep/lane-lumenloop.md; upstream issue state/comments freshly read; no maintainer comments or claimed fix."
  - date: 2026-11-06
    evidence: "2026-11-06 still-repro: LL get_document articles8228 plus linked primary quantum-plan page and CAP0087 — Lumenloop still says enterprise wallets can shift immediately; primary retains missing-today/expected qualifiers; roadmap lacks structured deployment state. No new protocol-deployment claim made. Evidence/owner state: .agents/rounds/2026-11-05-truth-maintenance/other.md, row ll-025."
  - date: 2026-08-11
    evidence: Article 8228 still combines a staged roadmap with present-tense capability language in an untyped projection.
  - date: 2026-10-09
    evidence: "The public QPP summary still says enterprise wallets can shift immediately. Its linked primary source says the quantum-safe signer and required primitives are missing today. Stage 1 and Stage 2 remain roadmap stages. Mainnet reports protocol 29; current CAP-0087 says Accepted with Protocol version TBD. This check makes no target-protocol or first-bad-version claim."
---

## Finding

Lumenloop roadmap summaries do not reliably distinguish planned capabilities
from shipped ones. The June 9 post describes ML-DSA host functions and native
signer support as absent and staged, but untyped summarization can restate the
roadmap as current network functionality.

## Evidence

- `get_document({collection: "articles", id: 8228})` and the [Lumenloop summary](https://lumenloop.com/news/introducing-quantum-preparedness-plan) still state that Stage 1 "adds" host functions and enterprise wallets can shift "immediately" without structured maturity or deployment-state fields (confirmed 2026-11-09 and 2026-11-20).
- The [linked primary source](https://stellar.org/blog/foundation-news/introducing-the-quantum-preparedness-plan) states the quantum-safe signer and required primitives are missing as of its publication date and frames Stage 1 and Stage 2 as staged roadmap work.
- Later protocol progress ([CAP-0087](https://github.com/stellar/stellar-protocol/blob/master/core/cap-0087.md) Implemented for Protocol 30; Testnet on Protocol 30 while Mainnet runs Protocol 29 as of 2026-11-09) does not rewrite the dated June 9 roadmap or ship native classic-account signers.
- Upstream issue: https://github.com/lumenloop/lumenloop-backend/issues/37.

## Recommendation

Expose capability state (`shipped`, `testnet`, `planned`, `research`) and
target horizon separately from publication date. Generated summaries must retain
the source's future tense and avoid inferring deployment from a roadmap mention.
