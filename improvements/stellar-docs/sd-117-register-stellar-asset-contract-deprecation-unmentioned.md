---
id: sd-117
service: stellar-docs
status: proposed
discovered: 2026-11-27
upstreamTitle: "Docs never use deprecated `Env::register_stellar_asset_contract`, and 651 Soroban repos still call it"
probe:
  type: http-text
  url: https://developers.stellar.org/llms-full.txt
  expect:
    status: 200
    excludes:
      - "register_stellar_asset_contract("
evidence:
  - "2026-11-27 Usage: 651 non-fork Soroban repos call `register_stellar_asset_contract` in parsed Rust (0 of them also define a function with that name). Counts come from https://raw.githubusercontent.com/devodii/state-of-soroban/main/docs/data/raven-feed-soroban-sdk.json (soroban-sdk 30.0.0, 8,973 repos scanned, generated 2026-11-27T20:54:45.289788Z)."
  - "2026-11-27 SDK: soroban-sdk 30.0.0 src/env.rs, `Env::register_stellar_asset_contract`: Register the built-in Stellar Asset Contract with provided admin address. Deprecated: use [Env::register_stellar_asset_contract_v2]."
  - "2026-11-27 Docs: https://developers.stellar.org/llms-full.txt (983 pages) contains no call to `register_stellar_asset_contract(`."
  - "2026-11-27 Skills: no pinned skill under ecosystem-skills/.cache mentions `register_stellar_asset_contract`."
  - "Example callers: https://github.com/stellar/soroban-example-dapp, https://github.com/hyperledger-cacti/cacti, https://github.com/ritik4ever/stellar-portfolio-rebalancer."
---

## Finding

`Env::register_stellar_asset_contract` is deprecated in soroban-sdk 30.0.0 (use [Env::register_stellar_asset_contract_v2]) and the docs contain no call to it. 651 non-fork Soroban repos still call it, so a builder who meets the deprecation warning finds nothing in the docs that resolves it.

## Evidence

2026-11-27 Usage: 651 non-fork Soroban repos call `register_stellar_asset_contract` in parsed Rust (0 of them also define a function with that name). Counts come from https://raw.githubusercontent.com/devodii/state-of-soroban/main/docs/data/raven-feed-soroban-sdk.json (soroban-sdk 30.0.0, 8,973 repos scanned, generated 2026-11-27T20:54:45.289788Z).

2026-11-27 SDK: soroban-sdk 30.0.0 src/env.rs, `Env::register_stellar_asset_contract`: Register the built-in Stellar Asset Contract with provided admin address. Deprecated: use [Env::register_stellar_asset_contract_v2].

2026-11-27 Docs: https://developers.stellar.org/llms-full.txt (983 pages) contains no call to `register_stellar_asset_contract(`.

2026-11-27 Skills: no pinned skill under ecosystem-skills/.cache mentions `register_stellar_asset_contract`.

Example callers: https://github.com/stellar/soroban-example-dapp, https://github.com/hyperledger-cacti/cacti, https://github.com/ritik4ever/stellar-portfolio-rebalancer.

## Recommendation

Add the replacement the SDK names (use [Env::register_stellar_asset_contract_v2]) where the sibling APIs are explained, so the old name resolves to it.
