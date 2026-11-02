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
  - 2026-11-02T17:19:51Z Raven stellarDocs.search_docs "Goldsky Mirrors support Stellar" returned the indexers record with the same sentence
  - golden case q-infra-which-indexer (golden audit pass 2, 2026-11-02)
---

## Finding

The Indexers page says "Goldsky Mirrors already support Stellar". Goldsky's own documentation
says that Stellar datasets are no longer available through Mirror. Goldsky now serves Stellar data
through Turbo pipelines.

A reader can plan a Mirror pipeline for Stellar data that Goldsky no longer offers.

This is a `docs-content` finding. The owner of the fact is Goldsky; the defect is the stale
copy on the Stellar Docs page.

## Evidence

The live Indexers page describes Goldsky's second product as "Mirror, also called Pipelines". It
says "Goldsky Mirrors already support Stellar".

Goldsky's Supported networks page says: "Stellar datasets are no longer available through
Mirror. Use Turbo pipelines for Stellar data." Goldsky's Stellar page documents only Turbo
pipelines for Mainnet and Testnet, and links a Mirror-to-Turbo migration guide.

## Recommendation

Change the Goldsky item to name Turbo pipelines as the Stellar product, with a link to
`https://docs.goldsky.com/chains/stellar`. Remove "Goldsky Mirrors already support Stellar".

Optional: add an as-of date to provider product claims on this page.
