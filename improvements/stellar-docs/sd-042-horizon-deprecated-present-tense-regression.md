---
id: sd-042
service: stellar-docs
status: verified
discovered: 2026-08-14
upstreamTitle: The EVM migration guide calls Horizon deprecated while canonical pages say deprecation is future
evidence:
  - 2026-08-14 live read of https://developers.stellar.org/docs/learn/migrate/evm/smart-contract-deployment returned "the deprecated Horizon API" in the Soroban Client section
  - 2026-08-14 live stellarDocs.search_docs for "Horizon nearing end-of-life deprecated" returned four canonical pages carrying "Horizon is nearing end-of-life and will eventually be deprecated in favor of Stellar RPC and Portfolio APIs"
  - the four pages are /docs/tools/lab/api-explorer/horizon-endpoint, /docs/tools/lab/api-explorer, /docs/learn/fundamentals/stellar-stack#horizon, and /docs/data/apis#horizon
  - resolved ledger entry sd-017 in improvements/resolved.json recorded this defect class as cleared on 2026-07-27; this is a new occurrence on a page that recheck did not cover
  - Solo scratchpad 809, todo 1541 finding F4
---

## Finding

Stellar Docs publish two incompatible lifecycle labels for Horizon.

Four canonical pages use one hedged, future-tense sentence: "Horizon is nearing
end-of-life and will eventually be deprecated in favor of Stellar RPC and
Portfolio APIs."

The EVM migration guide uses the present tense. Its Soroban Client section says:
"This library supplies a comprehensive networking layer API for Stellar RPC
methods as well as the deprecated Horizon API, simplifying the process of
building and signing transactions."

A reader who lands on the migration guide concludes that Horizon is already
deprecated. That conclusion contradicts the four canonical pages. The two
labels drive different decisions about starting new Horizon work.

This defect class was recorded before as `sd-017` and retired on 2026-07-27
after the last present-tense residual was cleared. The 2026-07-27 recheck
covered `/docs/data/apis`, `/docs/data/apis/horizon`, the Lab Horizon endpoint
page, and the Horizon-to-RPC migration guide. It did not cover the EVM
migration guide. This record is a successor, not a reopened `sd-017`.

## Evidence

The live page read and the live docs search both ran on 2026-08-14.

The search returned the identical hedged sentence on four separate canonical
pages. The migration-guide read returned the present-tense phrase verbatim.

## Recommendation

Change "the deprecated Horizon API" on
`/docs/learn/migrate/evm/smart-contract-deployment` to the canonical wording.
Use the same sentence the four other pages already use.

Add the Horizon lifecycle sentence to a shared partial or snippet. A single
source keeps every page consistent when the status changes.
