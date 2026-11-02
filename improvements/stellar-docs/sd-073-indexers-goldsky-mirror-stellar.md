---
id: sd-073
service: stellar-docs
status: verified
discovered: 2026-11-02
upstreamTitle: Indexers page says Goldsky Mirror supports Stellar; Goldsky now serves Stellar only through Turbo
evidence:
  - 2026-11-02T17:17:27Z GET https://developers.stellar.org/docs/data/indexers returned HTTP 200 with "Mirror, also called Pipelines - a highly efficient tool to Extract, Transform, & Load (ETL) data into your own database. Goldsky Mirrors already support Stellar; see their documentation."
  - stellar/stellar-docs main 7cb5e8a492706d2ae95bbb14be737fbf96100058 docs/data/indexers/index.mdx lines 53-55
  - 2026-11-02T17:23:17Z GET https://docs.goldsky.com/chains/supported-networks.md returned HTTP 200; line 451 says "Stellar datasets are no longer available through Mirror. Use Turbo pipelines for Stellar data."
  - 2026-11-02T17:23:17Z GET https://docs.goldsky.com/chains/stellar.md returned HTTP 200; the page documents Turbo pipelines for stellar_mainnet and stellar_testnet and links "Migrate from Mirror to Turbo"
  - 2026-11-02T20:08:28Z GET https://docs.goldsky.com/subgraph-vs-mirror.md (the target of the Stellar Docs "two main products" link) returned HTTP 200 titled "Which product do I need?"; it says "Goldsky offers six products" and "Mirror is Goldsky's original pipeline product. It's now legacy, superseded by Turbo."; the supported-networks matrix row for Stellar is "| Stellar | — | M+T | — | — | — |" (Turbo only)
  - golden case q-infra-which-indexer (golden audit pass 2, 2026-11-02)
---

## Finding

The Indexers page says "Goldsky Mirrors already support Stellar". Goldsky's own documentation
says that Stellar datasets are no longer available through Mirror. Goldsky now serves Stellar data
through Turbo pipelines.

A reader can plan a Mirror pipeline for Stellar data that Goldsky no longer offers.

The owner of the fact is Goldsky; the defect is the stale copy on the Stellar Docs page.

## Evidence

The live Indexers page describes Goldsky's second product as "Mirror, also called Pipelines". It
says "Goldsky Mirrors already support Stellar".

Goldsky's Supported networks page says: "Stellar datasets are no longer available through
Mirror. Use Turbo pipelines for Stellar data." Goldsky's Stellar page documents only Turbo
pipelines for Mainnet and Testnet, and links a Mirror-to-Turbo migration guide.

The "two main products" link now opens a Goldsky page that lists six products. That page says
that Mirror is legacy and that Turbo supersedes it.

## Recommendation

Change the Goldsky item to name Turbo pipelines as the Stellar product, with a link to
`https://docs.goldsky.com/chains/stellar`. Remove "Goldsky Mirrors already support Stellar".
Also replace "two main products": the linked Goldsky page now lists six products and calls Mirror
legacy. The Subgraphs sentence can stay, because Goldsky lists no Subgraphs support for Stellar.

Optional: add an as-of date to provider product claims on this page.
