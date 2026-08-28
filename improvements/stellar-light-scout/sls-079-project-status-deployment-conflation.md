---
id: sls-079
service: stellar-light-scout
status: proposed
discovered: 2026-08-28
upstreamTitle: Scout project status Live conflates directory listing with mainnet deployment
evidence:
  - eval/qa/results/2026-08-28T19-27-08-variantA.json: wrong verdicts on q-defi-perps-whitespace and q-eco-defi-market-map; 2 of 100 cases in one collection
  - live re-execution 2026-08-28 scout.searchProjects matchMode strict generatedAt 2026-08-28T19:29:47.704Z returns Stellars Finance Live, Zenex Pre-Release, Noether Pre-Release
  - the perps vertical holds 28 strict matches and at least one is mislabelled
  - operator bundle https://stellars.finance/assets/index-3HEaNhUX.js fetched 2026-08-28: testnet contract addresses populated, mainnet addresses empty (address "", startLedger 0)
---

## Finding

The `status` field returned by `scout.searchProjects` carries one label for two
different facts. `Live` can mean "listed and active in the directory". It can
also read as "deployed on mainnet". No sibling field separates the two.

`Stellars Finance` returns `status: Live` with `statusBasis: site-liveness`
(`statusAsOf 2026-08-17T03:02:29.060Z`). The operator's own site bundle
(`https://stellars.finance/assets/index-3HEaNhUX.js`, fetched 2026-08-28) defines
`{local, testnet, mainnet}` networks with populated testnet contract addresses and
empty mainnet addresses (`address: ""`, `startLedger: 0`). A reachable site is not a
mainnet deployment, and the response carries no field that separates the two.

This differs from the related findings. `sls-023` covers the missing
product-level deployment model in broad RWA discovery. `sls-024` covers
lifecycle qualifier fields that exist in the schema but stay null. This finding
concerns the project-level `status` label itself: one label carries two
meanings, and a fully populated provenance chain (`statusBasis`, `statusAsOf`)
still does not separate directory liveness from mainnet deployment. It is a
successor in spirit to the resolved `sls-076`, which covered strict-match
neighbour promotion; this is a different defect on the same strict-match
surface.

## Evidence

Results stamp `eval/qa/results/2026-08-28T19-27-08-variantA.json`. The
collection recorded wrong verdicts on two unrelated cases,
`q-defi-perps-whitespace` and `q-eco-defi-market-map`, from this one label.

Live re-execution on 2026-08-28 reproduced the shape. `scout.searchProjects`
with `matchMode: "strict"` and `generatedAt 2026-08-28T19:29:47.704Z` returned
`Stellars Finance` as `Live`, `Zenex` as `Pre-Release`, and `Noether` as
`Pre-Release`.

Prevalence: 2 of 100 cases in one collection. The perps vertical holds 28
strict matches, and at least one is mislabelled.

The operator bundle at `https://stellars.finance/assets/index-3HEaNhUX.js` (fetched
2026-08-28) defines `{local, testnet, mainnet}` with populated testnet contracts and empty mainnet addresses.

## Recommendation

Add a distinct deployment field beside the lifecycle `status`, for example
`deployment: mainnet | testnet | none`. Populate it from the project's own
stated deployment. The cheaper alternative is to keep one field and publish the
label's definition in the API reference, so consumers stop reading `Live` as
mainnet-deployed.

The consumer-side workaround in this repo now encodes the conflict per corpus
case. That does not scale; the durable fix belongs in the project record.
