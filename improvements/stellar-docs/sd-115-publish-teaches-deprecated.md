---
id: sd-115
service: stellar-docs
status: proposed
discovered: 2026-11-27
upstreamTitle: "Docs pages still call deprecated `Events::publish`, which 5,491 Soroban repos use"
probe:
  type: http-text
  url: https://developers.stellar.org/docs/build/guides/auth/check-auth-tutorials.md
  expect:
    status: 200
    contains:
      - "publish("
evidence:
  - "2026-11-27 Usage: 5,491 non-fork Soroban repos call `publish` in parsed Rust (183 of them also define a function with that name). Counts come from https://raw.githubusercontent.com/devodii/state-of-soroban/main/docs/data/raven-feed-soroban-sdk.json (soroban-sdk 30.0.0, 8,973 repos scanned, generated 2026-11-27T20:54:45.289788Z)."
  - "2026-11-27 SDK: soroban-sdk 30.0.0 src/events.rs, `Events::publish`: Publish an event. Deprecated: use the #[contractevent] macro on a contract event type."
  - "2026-11-27 Docs: https://developers.stellar.org/llms-full.txt (983 pages) calls `publish(` on 7 page(s), first 5: https://developers.stellar.org/docs/build/guides/auth/check-auth-tutorials, https://developers.stellar.org/docs/build/guides/dapps/working-with-contract-specs, https://developers.stellar.org/docs/build/guides/events/publish, https://developers.stellar.org/docs/build/guides/fees/analyzing-smart-contract-cost, https://developers.stellar.org/docs/build/smart-contracts/example-contracts/events."
  - "2026-11-27 Skills: the pinned skills already mention `publish`, so the fix is in the docs."
  - "Example callers: https://github.com/stellar/soroban-example-dapp, https://github.com/kalepail/passkey-kit, https://github.com/PiNetwork/SmartContracts."
---

## Finding

Stellar Docs still show `publish(` in 7 page(s), but `Events::publish` is deprecated in soroban-sdk 30.0.0 (use the #[contractevent] macro on a contract event type). 5,491 non-fork Soroban repos call it, so an answer grounded in these pages teaches the deprecated call.

## Evidence

2026-11-27 Usage: 5,491 non-fork Soroban repos call `publish` in parsed Rust (183 of them also define a function with that name). Counts come from https://raw.githubusercontent.com/devodii/state-of-soroban/main/docs/data/raven-feed-soroban-sdk.json (soroban-sdk 30.0.0, 8,973 repos scanned, generated 2026-11-27T20:54:45.289788Z).

2026-11-27 SDK: soroban-sdk 30.0.0 src/events.rs, `Events::publish`: Publish an event. Deprecated: use the #[contractevent] macro on a contract event type.

2026-11-27 Docs: https://developers.stellar.org/llms-full.txt (983 pages) calls `publish(` on 7 page(s), first 5: https://developers.stellar.org/docs/build/guides/auth/check-auth-tutorials, https://developers.stellar.org/docs/build/guides/dapps/working-with-contract-specs, https://developers.stellar.org/docs/build/guides/events/publish, https://developers.stellar.org/docs/build/guides/fees/analyzing-smart-contract-cost, https://developers.stellar.org/docs/build/smart-contracts/example-contracts/events.

2026-11-27 Skills: the pinned skills already mention `publish`, so the fix is in the docs.

Example callers: https://github.com/stellar/soroban-example-dapp, https://github.com/kalepail/passkey-kit, https://github.com/PiNetwork/SmartContracts.

## Recommendation

Replace `publish(` in the listed pages with the replacement the SDK names.
