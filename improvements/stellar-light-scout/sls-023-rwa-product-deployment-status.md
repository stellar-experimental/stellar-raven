---
id: sls-023
service: stellar-light-scout
status: fixed-upstream
discovered: 2026-07-10
evidence:
  - live searchProjects query for real world asset returned 51 rows
  - only 4 rows in that response were marked Verified (Community)
  - DTCC entity status is Live while its own description says Stellar availability is expected in H1 2027
  - Solo scratchpad 575 GT-11 primary process 3231
  - GT-17 recurrence: live WisdomTree GOLD/EQTY, Figure YLDS, and Etherfuse assets were absent from a three-product overview derived from broad discovery
  - GT-18 recurrence: CRDT required issuer-primary legal class, transfer-agent record priority, eligibility/controls, exact issuer/SAC, and multichain launch scope not represented by a project-level row
  - https://github.com/Stellar-Light/stellarlight/issues/494; live re-check 2026-07-13 returns DTCC as Development with dated operator-announcement provenance, so the false-live regression no longer reproduces
  - partial-fix verification posted and read back 2026-07-15: https://github.com/Stellar-Light/stellarlight/issues/494#issuecomment-4982290048
  - owner correction after an independent audit, including the deployed product model and its explicit remaining limits: https://github.com/Stellar-Light/stellarlight/issues/494#issuecomment-5547988441
  - owner deployment of classic-asset authorization, revocation, and clawback controls: https://github.com/Stellar-Light/stellarlight/issues/494#issuecomment-5548777030
  - resolving changes merged in Stellar-Light/stellarlight PRs #1298, #1299, #1301, #1302, #1305, and #1306 between 2026-09-04T20:43:29Z and 2026-09-05T02:34:46Z
  - 2026-09-08 Production API 1.9.48 independently stopped both original failure modes. DTCC is Development with one announced H1 2027 product. Every broad-search row joined to the RWA registry has products and a known network. The registry returns 97 verified assets from 52 issuers with exact identities, states, evidence URLs, verification levels, asset classes, and classic-asset controls. Broad-search response SHA-256 fe2a0ffa3ab2e219a04e2c0460016ca4f445d02eef03acc4ab4ebb0657eda2ae; registry response SHA-256 3b36e92e1d8382c740466ae487c22bf46a5ab9fcd83ccaf6e115ab605d6a5f3f. A smaller Etherfuse completeness defect is split to sls-083.
  - independent terminal review: .agents/rounds/2026-09-08-improvements-followups/sls023-review-fable.md
recurrences:
  - date: 2026-07-14
    evidence: DTCC now correctly serves Development with dated operator-announcement provenance, but the row still exposes no product/asset/deployment keys; the product-level deployment model remains unresolved under #494
  - date: 2026-07-15
    evidence: Scout 1.7.26 keeps DTCC at Development with dated provenance, but products, deployments, assets, and productKind remain null and supportedNetworks remains empty
  - date: 2026-08-11
    evidence: Production API 1.8.41 returns DTCC as Development with operator-announcement provenance, but products, deployments, assets, and productKind remain null and supportedNetworks is empty; the product-level deployment gap still reproduces
  - date: 2026-08-28
    evidence: Production API 1.9.1 returns DTCC as Development with a dated announced mainnet product record and H1 2027 note, but `GET /api/projects/search?q=real%20world%20asset&limit=100` returns 61 rows with only 1 nonempty products value and zero deployments or assets values. Issue #494 closed as completed without a full product-model fix, so the finding still reproduces.
  - date: 2026-09-03
    evidence: the round ledger `.agents/rounds/2026-09-03-truth-maintenance/improvements-terra.md` records 61 RWA rows. DTCC has one product, but its generic deployment remains unknown and assets remain absent. The partial model still reproduces the finding.
  - date: 2026-09-04
    evidence: `GET /api/projects/search?q=real%20world%20asset&limit=100` returned 61 rows at 2026-09-04T06:54:40.644Z, Scout API 1.9.30, response SHA-256 f6c976a7b9c82f61e4f2ab5c5cbfd0b9cb907ff09b89289fa45fd47905d32e0d. Deployment exists on 61 rows, but 47 have network unknown, basis null, and sourceUrl null. Only one row has products, no row has productKind, and assets are absent from all rows. DTCC remains Development with one announced mainnet product and an H1 2027 note. Fourteen rows gained onchain-activity deployment data, but the exact partial product and deployment model defect remains.
---

## Finding

Scout's broad RWA discovery does not separate entity/project status from the
deployment status of a particular product on Stellar. A live "real world
asset" search returned 51 rows spanning issued products, stablecoins, tooling,
RWA-adjacent projects, planned integrations, and unverified records. Only four
rows were marked Verified (Community) in that response.

DTCC is the clearest failure mode: its entity/project row is Live, while its
description says the DTC tokenization connection to Stellar is planned for H1
2027. A consumer can therefore turn a live organization into a false claim of
a currently live Stellar-issued RWA.

## Evidence

The read-only search was run on 2026-07-10:

    scout.searchProjects({ q: "real world asset" })

Named primary/operator checks independently confirmed several currently live
products, including BENJI/FOBXX, WisdomTree funds, USDY, YLDS, Etherfuse
Stablebonds, and Spiko/Amundi funds. The same checks confirmed DTCC as planned,
not live on Stellar.

GT-17 independently demonstrated the inverse failure mode: a broad project
record does not expose enough product-level detail to recover current
WisdomTree GOLD/EQTY, Figure YLDS, and six Etherfuse Stablebond assets. Provider
metadata and read-only Horizon checks confirmed those assets on 2026-07-10.
The missing product model can therefore cause both false-live claims and
material under-enumeration.

GT-18 reproduced the semantic gap for WisdomTree CRDT. A project-level entry
did not carry the fund/share legal class, transfer-agent record priority,
whitelisting and clawback controls, Ethereum-plus-Stellar launch scope, or the
exact Stellar issuer/SAC. Those fields are necessary to distinguish a live
regulated mutual-fund share from a stablecoin or generic RWA project.

Directory presence, entity status, and broad category membership are discovery
signals only. They do not prove that a named product is issued, transferable,
or available on Stellar today.

## Recommendation

Add product-level deployment records or fields distinct from entity status:

- product name and issuer;
- network;
- announced, planned, testnet, or live state;
- launch/target date and asOf;
- primary evidence URL;
- verification level.
- exact code+issuer/SAC identity where a public asset can be verified;
- product class distinct from the organization's broad category.
- legal/record hierarchy and transfer restrictions for regulated products.

Answer-oriented summaries should expose the product state and verification
level. Add a regression query for "real world asset": DTCC must be labeled
planned H1 2027, while verified live products should be distinguishable from
tooling, stablecoins, and unverified candidates.
