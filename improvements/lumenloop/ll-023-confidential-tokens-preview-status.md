---
id: ll-023
service: lumenloop
status: reported-upstream
discovered: 2026-07-11
evidence:
  - P4 N2 candidate identifies the 2026-06-29 Confidential Tokens item as a Testnet developer preview with audits underway, not Mainnet approval; solo://proj/49/scratchpad/super-corpus-rebuild--585
  - https://github.com/lumenloop/lumenloop-backend/issues/39
  - 2026-08-11 review: issue #39 is open. It has no linked PR, checks, or reviews. Its only comment and latest timeline activity are kalepail's Raven tracking comment at 2026-07-13T22:54:35Z. `get_document({collection: "articles", id: 8877})` still puts Testnet, developer-preview, and audit-underway facts only in summary prose.
recurrences:
  - date: 2026-08-11
    evidence: Article 8877 has no structured network, maturity, audit-status, or source-observation fields.
---

## Finding

Lumenloop product-news summaries can drop the network and maturity boundary for
Confidential Tokens. Omitting that the June 29 item is a Testnet developer
preview with audits in progress permits an experimental feature to be presented
as Mainnet-approved production capability.

## Evidence

P4 N2 supplied the dated preview/audit qualification in its 2026-07-11
candidate evidence. This is proposed until the specific live Lumenloop summary
is retained alongside the primary announcement.

## Recommendation

Require product-news records to carry `network`, `maturity`, `auditStatus`, and
`asOf` fields. Generated text should lead with Testnet/preview status whenever
that is the source's current boundary.
