---
id: ll-023
service: lumenloop
status: reported-upstream
discovered: 2026-07-11
evidence:
  - "2026-11-09 sweep at 2026-11-09T20:30:54.279242+00:00: inconclusive. Article8877 explicitly says Testnet live now, title says Developer Preview, and long summary says audits underway before mainnet. Adjacent article8916/research139 and expanded preview retrieval preserve qualifications. Missing structured maturity fields reproduce, but no retained original response proves boundary-dropping. Correct current prose therefore cannot prove a historical silent fix. Read-only exact requests and response hashes: research/audits/2026-11-09-improvements-sweep/lane-lumenloop.md; upstream issue state/comments freshly read; no maintainer comments or claimed fix."
  - "2026-11-06 scope/progress reconciliation: .agents/rounds/2026-11-06-remaining-sweep/other.md, row ll-023; replay arguments and response hashes in research/audits/2026-11-06-remaining-sweep/other-receipt.json."
  - P4 N2 candidate identifies the 2026-06-29 Confidential Tokens item as a Testnet developer preview with audits underway, not Mainnet approval; solo://proj/49/scratchpad/super-corpus-rebuild--585
  - https://github.com/lumenloop/lumenloop-backend/issues/39
  - 2026-08-11 review: issue #39 is open. It has no linked PR, checks, or reviews. Its only comment and latest timeline activity are kalepail's Raven tracking comment at 2026-07-13T22:54:35Z. `get_document({collection: "articles", id: 8877})` still puts Testnet, developer-preview, and audit-underway facts only in summary prose.
recurrences:
  - date: 2026-11-06
    evidence: "2026-11-06 inconclusive: LL get_document articles8877 — Short summary explicitly Testnet live now; long summary says developer preview and audits underway before mainnet. Missing structured maturity fields remain, but original alleged boundary-dropping is not reproduced. Evidence/owner state: .agents/rounds/2026-11-05-truth-maintenance/other.md, row ll-023."
  - date: 2026-08-11
    evidence: Article 8877 has no structured network, maturity, audit-status, or source-observation fields.
---

## Finding

This is a request for optional structured network, maturity, and audit-state
metadata on product-news records, not a reproduced false Mainnet claim.
On 2026-11-06 article 8877's short summary explicitly says Testnet; its title
and long summary preserve developer-preview status and audits before Mainnet.
Expanded retrieval also preserves those boundaries. Later release news is a
distinct event and does not make the June preview summary incorrect.

## Evidence

The 2026-07-11 P4 N2 candidate supplied primary preview/audit qualifications but
did not retain a live Lumenloop summary that dropped them. Fresh article 8877,
adjacent article 8916, and research 139 preserve the qualifications. Therefore
current correct prose is not proof that a previously captured defect was fixed:
the original alleged false-content trigger remains unsubstantiated. The fresh
calls and receipt hashes are in the 2026-11-06 remaining-sweep report.

## Recommendation

Consider source-backed `network`, `maturity`, `auditStatus`, and `asOf` metadata
where the announcement supports those fields. Preserve the existing Testnet,
preview, and audit qualifications in generated prose; leave unknown fields
unknown. Treat schema enrichment separately from any future concrete summary
that incorrectly promotes preview status into Mainnet production capability.

## Current verification — 2026-11-06

Short summary explicitly Testnet live now; long summary says developer preview and audits underway before mainnet. Missing structured maturity fields remain, but original alleged boundary-dropping is not reproduced.

Keep uncertainty; correct existing prose is not proof a previously captured defect was fixed. Avoid treating optional typed fields as demonstrated false content.
Next check: Inspect owner change or a concrete summary that drops preview/network boundary.
