---
id: sd-069
service: stellar-docs
status: verified
discovered: 2026-11-02
upstreamTitle: EVM migration guide teaches the deprecated events().publish and a stale token event shape
evidence:
  - 2026-11-02T17:17:27Z GET https://developers.stellar.org/docs/learn/migrate/evm/solidity-and-rust-advanced-concepts returned HTTP 200 with the snippet "let topics = (symbol_short!("mint"), admin, to); e.events().publish(topics, amount);" and the output line "Emit event with topics = ["mint", admin - Address, to - Address], data = amount - i128"
  - stellar/stellar-docs main 7cb5e8a492706d2ae95bbb14be737fbf96100058 docs/learn/migrate/evm/solidity-and-rust-advanced-concepts.mdx lines 174-188; the snippet says it comes from event.rs in the Token example and links https://github.com/stellar/soroban-examples/tree/main/events/src
  - stellar/rs-soroban-sdk v29.0.1 soroban-sdk/src/events.rs line 121 '#[deprecated(note = "use the #[contractevent] macro on a contract event type")]' on Events::publish; the attribute is present at v23.0.0 and absent at v22.0.0
  - stellar/soroban-examples main 03d42aa6b973dcf3a453a99d0c6a6e8d25a196e2 token/src has no event.rs; token/src/contract.rs defines events with #[contractevent] and publishes events::MintWithAmountOnly { to, amount }
  - adjacent repeated pattern docs/build/guides/fees/analyzing-smart-contract-cost.mdx lines 241 and 247 also call env.events().publish
  - golden cases q-sor-evm-to-soroban-porting and q-soroban-publish-events (golden audit pass 2, 2026-11-02)
---

## Finding

The EVM migration page "Solidity and Rust Advanced Concepts" teaches events with
`e.events().publish(topics, amount)`. soroban-sdk deprecated `Events::publish` in v23. The SDK
says to use the `#[contractevent]` macro.

The snippet also claims to come from the Token example's `event.rs`. That file no longer exists.
The current Token example uses `#[contractevent]`. Its mint event has the SEP-41 topics
`["mint", to]`, not `["mint", admin, to]`.

A Solidity developer who copies the snippet gets a deprecation warning and a mint event shape
that SEP-41 indexers do not expect.

This is a `docs-content` finding.

## Evidence

The live page shows:

```rust
pub(crate) fn mint(e: &Env, admin: Address, to: Address, amount: i128) {
    let topics = (symbol_short!("mint"), admin, to);
    e.events().publish(topics, amount);
}
```

soroban-sdk v29.0.1 marks `Events::publish` with
`#[deprecated(note = "use the #[contractevent] macro on a contract event type")]`. The attribute
first appears in v23.0.0.

The current Token example in stellar/soroban-examples has no `event.rs`. Its `contract.rs`
imports `contractevent` and publishes `events::MintWithAmountOnly { to, amount }`.

The fees guide `analyzing-smart-contract-cost.mdx` also calls `env.events().publish` twice.

## Recommendation

Replace the snippet with a `#[contractevent]` struct and its `.publish(&e)` call, copied from the
current Token example. Change the output line to the SEP-41 `["mint", to]` topics. Fix the link to
point at `token/src/contract.rs`.

Change the two calls in the fees guide in the same way.
