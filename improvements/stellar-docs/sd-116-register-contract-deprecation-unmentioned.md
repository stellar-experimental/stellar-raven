---
id: sd-116
service: stellar-docs
status: proposed
discovered: 2026-11-27
upstreamTitle: "Docs never use deprecated `Env::register_contract`, and 2,477 Soroban repos still call it"
probe:
  type: http-text
  url: https://developers.stellar.org/llms-full.txt
  expect:
    status: 200
    excludes:
      - "register_contract("
evidence:
  - "2026-11-27 Usage: 2,477 non-fork Soroban repos call `register_contract` in parsed Rust (102 of them also define a function with that name). Counts come from https://raw.githubusercontent.com/devodii/state-of-soroban/main/docs/data/raven-feed-soroban-sdk.json (soroban-sdk 30.0.0, 8,973 repos scanned, generated 2026-11-27T20:54:45.289788Z)."
  - "2026-11-27 SDK: soroban-sdk 30.0.0 src/env.rs, `Env::register_contract`: Register a contract with the [Env] for testing. Deprecated: use `register`."
  - "2026-11-27 Docs: https://developers.stellar.org/llms-full.txt (983 pages) contains no call to `register_contract(`."
  - "2026-11-27 Skills: no pinned skill under ecosystem-skills/.cache mentions `register_contract`."
  - "Example callers: https://github.com/stellar/soroban-example-dapp, https://github.com/hyperledger-cacti/cacti, https://github.com/Stellar-Pathfinder/stellar-pathfinder."
---

## Finding

`Env::register_contract` is deprecated in soroban-sdk 30.0.0 (use `register`) and the docs contain no call to it. 2,477 non-fork Soroban repos still call it, so a builder who meets the deprecation warning finds nothing in the docs that resolves it.

## Evidence

2026-11-27 Usage: 2,477 non-fork Soroban repos call `register_contract` in parsed Rust (102 of them also define a function with that name). Counts come from https://raw.githubusercontent.com/devodii/state-of-soroban/main/docs/data/raven-feed-soroban-sdk.json (soroban-sdk 30.0.0, 8,973 repos scanned, generated 2026-11-27T20:54:45.289788Z).

2026-11-27 SDK: soroban-sdk 30.0.0 src/env.rs, `Env::register_contract`: Register a contract with the [Env] for testing. Deprecated: use `register`.

2026-11-27 Docs: https://developers.stellar.org/llms-full.txt (983 pages) contains no call to `register_contract(`.

2026-11-27 Skills: no pinned skill under ecosystem-skills/.cache mentions `register_contract`.

Example callers: https://github.com/stellar/soroban-example-dapp, https://github.com/hyperledger-cacti/cacti, https://github.com/Stellar-Pathfinder/stellar-pathfinder.

## Recommendation

Add the replacement the SDK names (use `register`) where the sibling APIs are explained, so the old name resolves to it.
