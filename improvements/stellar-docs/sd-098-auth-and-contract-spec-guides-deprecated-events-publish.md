---
id: sd-098
service: stellar-docs
status: fixed-upstream
discovered: 2026-11-06
upstreamTitle: Migrate five raw event-publishing examples in the auth and contract-spec guides
evidence:
  - "2026-11-09: https://developers.stellar.org/docs/build/guides/auth/check-auth-tutorials.md and https://developers.stellar.org/docs/build/guides/dapps/working-with-contract-specs.md replace all five `env.events().publish` calls with `#[contractevent]` types. The served event definitions compile on soroban-sdk 29.0.1, and a local test showed each typed event emits the same topics and data XDR as the raw call it replaces. The complete WebAuthn contract on the auth page still fails `cargo check` on missing definitions and dependency wiring, a separate pre-existing gap; Raven tracks it as successor sd-101. Resolving PR: https://github.com/stellar/stellar-docs/pull/3067. Independent recheck: Codex frontier (gpt-6-astra, high)."
  - "2026-11-06 follow-up: https://github.com/stellar/stellar-docs/pull/3067 replaces five raw publishes with typed events and repairs adjacent address-example syntax; checks green, REVIEW_REQUIRED/BLOCKED, not deployed. Its bot self-review reports source inspection, not complete snippet compilation. Evidence: .agents/rounds/2026-11-06-remaining-sweep/docs.md."
  - "2026-11-06 curl -fsSL https://developers.stellar.org/docs/build/guides/auth/check-auth-tutorials.md returned four .events().publish calls: add/remove examples repeated for two account implementations. SHA256 0be2613ab7ccc9aa7f2d7a815b0ef8265965c25cfd9b74daf644cb599170378e."
  - "2026-11-06 curl -fsSL https://developers.stellar.org/docs/build/guides/dapps/working-with-contract-specs.md returned one .events().publish call for mint topics and count data. SHA256 fba013f8c48e5b554245ca55219683bfb270ace9d654344de45115cc8c87934f."
  - "https://raw.githubusercontent.com/stellar/rs-soroban-sdk/v29.0.1/soroban-sdk/src/events.rs marks raw Events::publish deprecated and directs authors to #[contractevent]. This is a deprecated API, not a removed method or a claimed compilation failure."
  - "Canonical stellar-docs main 310030b6078a37ed5a1959da4955e516266ac897: docs/build/guides/auth/check-auth-tutorials.mdx lines 718,751,1171,1204; docs/build/guides/dapps/working-with-contract-specs.mdx line1239."
  - "Dedupe: all active/resolved findings and GitHub searches for check-auth/events and working-with-contract-specs/publish. sd-069 owns the now-corrected EVM migration and fees pages; sd-090 owns enum encodings, not this event example."
  - upstream issue filed 2026-11-06: https://github.com/stellar/stellar-docs/issues/3065
---

## Finding

The custom-account authentication guide teaches four uses of the deprecated raw `Events::publish` method.
The contract-spec guide teaches one more use.
The current SDK directs callers to typed events declared with `#[contractevent]`.
These five examples remain after the EVM migration and fees examples were updated.

## Evidence

Read the live Markdown pages linked above and search for `.publish(`.
The auth guide has two repeated add/remove pairs with `EVENT_TAG` topics.
The contract-spec guide publishes `(mint, address_1, address_2)` topics with `count` data.
SDK 29.0.1 still provides the raw method but marks it deprecated.
No compilation failure is claimed.

## Recommendation

Use typed `#[contractevent]` declarations in these five examples, or explicitly label raw publishing as a legacy encoding example when that is the teaching purpose.
Preserve the event topics, data, and authorization behavior unless a separate change is intended.
Check both repeated auth implementations and the contract-spec explanation, then compile the updated examples with the documented SDK.

## Pending upstream patch — 2026-11-06

PR #3067 proposes typed-event replacements; all five ordinary deployed examples remain unchanged.
Before resolution, compile the complete corrected examples and compare their topics, data and authorization behavior.
Passing page checks and bot self-review do not establish those runtime properties.
