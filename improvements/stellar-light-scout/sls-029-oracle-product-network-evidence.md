---
id: sls-029
service: stellar-light-scout
status: reported-upstream
discovered: 2026-07-10
evidence:
  - live Scout oracle search returns provider-level Live labels without product/network evidence tiers
  - official Band mapping plus live reads verify active mainnet relays while its published testnet contract is absent
  - RedStone public-contract mappings plus read-only simulations verify current mainnet feeds
  - published DIA testnet mapping is absent; no provider-primary mainnet mapping was verified
  - Lightecho mainnet contract exists but its observed price state was four months stale
  - Solo scratchpad 575 GT-16 primary process 3244 and blind process 3245
  - Solo scratchpad 575 GT-17 primary process 3247 and blind process 3248
  - upstream issue filed 2026-07-13: https://github.com/Stellar-Light/stellarlight/issues/514
recurrences:
  - date: 2026-07-14
    evidence: Band and Lightecho now carry onchain-activity provenance, but DIA and RedStone Finance still serve Live with null statusBasis and no per-product/per-network oracle deployment model; fold the residual into sls-024/#494 or a self-contained successor before resolution
  - date: 2026-07-15
    evidence: Scout 1.7.26 improves project-level basis/source values, but oracleDeployments, deployments, and products remain null across the named provider rows; residual posted and read back at https://github.com/Stellar-Light/stellarlight/issues/514#issuecomment-4982290253
  - ref health 2026-07-27: https://github.com/Stellar-Light/stellarlight/issues/514 closed completed 2026-07-14 and the residual verification was posted after closure, so issue 514 no longer tracks the remaining gap; a consolidated successor issue carries it
  - consolidated successor issue filed 2026-07-27 carrying this residual on an open thread: https://github.com/Stellar-Light/stellarlight/issues/742
  - date: 2026-08-11
    evidence: Production API 1.8.41 serves project-level status provenance for Band, DIA, RedStone, and Lightecho, but has no oracleDeployments, deployments, or products data; closed #514 remains unfixed and open #742 records the unmodelled product/network dimension
  - date: 2026-08-28
    evidence: Production API 1.9.1 gives Band, DIA, RedStone Finance, and Lightecho dated project-level provenance. All four still have null oracleDeployments and deployments. Lightecho alone has one product record without a contract ID. Closed issue #514 did not deliver the per-product/per-network evidence model; open #742 remains the residual tracker.
---

## Finding

Oracle discovery collapses provider identity, product family, network, and
evidence tier into a project-level status. This makes materially different
claims look equivalent:

- Band's published mainnet contract was actively relaying, while its published
  testnet mapping returned Contract not found;
- RedStone's public mainnet adapter/feed mappings existed and returned same-day
  timestamps for multiple feeds;
- DIA's published testnet mapping returned Contract not found and no
  provider-primary mainnet mapping was verified;
- Lightecho's mainnet contract existed but its observed price state was about
  four months stale;
- Chainlink Data Streams have official Stellar testnet support, while the
  audited official tutorial did not establish the independently observed
  mainnet address mapping and Data Feeds specifically remained unverified; and
- other directory candidates lack current provider-primary confirmation.

A single `Live` label cannot safely answer which product is usable on which
network or at what evidence level.

## Evidence

GT-16 ran live directory queries and independently walked current Stellar,
Chainlink, and RedStone primary sources on 2026-07-10. GT-17 then reproduced
the problem with direct provider mappings and read-only contract/feed probes.
Those probes upgraded RedStone from announcement-only to address-confirmed and
updating, while revealing that Band/DIA published testnet mappings were absent
and Lightecho's deployed state was stale. A project-level `Live` label cannot
represent these distinctions.

## Recommendation

Model oracle deployments per product and network:

- provider and product (`SEP-40`, Data Streams, Data Feeds, CCIP, etc.);
- testnet/mainnet;
- contract/verifier address where available;
- evidence tier (`official-address`, `provider-announced`, `directory-only`,
  `observed-updating`, `observed-stale`, or `published-address-absent`);
- supported feed list plus as-of/source URL;
- separate integration/listing relationships from verified consumption.

Add Band, DIA, Chainlink, RedStone, and Lightecho regression fixtures covering
the exact distinctions above. Search summaries must not promote a provider
brand into a different product's deployment claim or a deployed contract into
a currently updating feed.
