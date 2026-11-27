---
id: sd-118
service: stellar-docs
status: proposed
discovered: 2026-11-27
upstreamTitle: "Docs never use `Crypto::keccak256`, which 331 Soroban repos call"
probe:
  type: http-text
  url: https://developers.stellar.org/llms-full.txt
  expect:
    status: 200
    excludes:
      - "keccak256("
evidence:
  - "2026-11-27 Usage: 331 non-fork Soroban repos call `keccak256` in parsed Rust (32 of them also define a function with that name). Counts come from https://raw.githubusercontent.com/devodii/state-of-soroban/main/docs/data/raven-feed-soroban-sdk.json (soroban-sdk 30.0.0, 8,973 repos scanned, generated 2026-11-27T20:54:45.289788Z)."
  - "2026-11-27 SDK: soroban-sdk 30.0.0 src/crypto.rs, `Crypto::keccak256`: Returns the Keccak-256 hash of the data."
  - "2026-11-27 Docs: https://developers.stellar.org/llms-full.txt (983 pages) contains no call to `keccak256(`."
  - "2026-11-27 Skills: no pinned skill under ecosystem-skills/.cache mentions `keccak256`."
  - "Example callers: https://github.com/daccred/attestprotocol, https://github.com/StellarHyperion/stellarhyperion-contracts, https://github.com/OpenZeppelin/stellar-contracts."
---

## Finding

`Crypto::keccak256` exists in soroban-sdk 30.0.0 and 331 non-fork Soroban repos call it, but the docs contain no call to it.

## Evidence

2026-11-27 Usage: 331 non-fork Soroban repos call `keccak256` in parsed Rust (32 of them also define a function with that name). Counts come from https://raw.githubusercontent.com/devodii/state-of-soroban/main/docs/data/raven-feed-soroban-sdk.json (soroban-sdk 30.0.0, 8,973 repos scanned, generated 2026-11-27T20:54:45.289788Z).

2026-11-27 SDK: soroban-sdk 30.0.0 src/crypto.rs, `Crypto::keccak256`: Returns the Keccak-256 hash of the data.

2026-11-27 Docs: https://developers.stellar.org/llms-full.txt (983 pages) contains no call to `keccak256(`.

2026-11-27 Skills: no pinned skill under ecosystem-skills/.cache mentions `keccak256`.

Example callers: https://github.com/daccred/attestprotocol, https://github.com/StellarHyperion/stellarhyperion-contracts, https://github.com/OpenZeppelin/stellar-contracts.

## Recommendation

Document `Crypto::keccak256` where the sibling APIs are explained. The SDK summary is: Returns the Keccak-256 hash of the data.
