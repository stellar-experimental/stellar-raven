---
id: sd-099
service: stellar-docs
status: reported-upstream
discovered: 2026-11-06
upstreamTitle: Fix the manual invocation example in the cross-contract guide
evidence:
  - "2026-11-06 approximately 18:06 UTC: GET https://developers.stellar.org/docs/build/guides/conventions/cross-contract.md serves the manual ContractB example with symbol_short!(\"add\") passed by value and two u32.to_val() calls. Page SHA-256 79c2edc6b031dfc5725f8e92efc954ae72149caad490684e9349f787286ae028."
  - "2026-11-06 source: https://github.com/stellar/stellar-docs/blob/22103ac670068f38fa0b77724bfe04ec1e447524/docs/build/guides/conventions/cross-contract.mdx has the same snippet. Repository head timestamp 2026-11-06T17:19:07Z; file SHA-256 e73adbc3a93e547623c533b98af227328bf5d207f94be301ed8ba1a3fe904669."
  - "2026-11-06 native cargo check --offline with rustc 1.93.0 and exact soroban-sdk pins 28.0.0 and 29.0.1: the complete manual snippet, with only no_std and SDK imports added, fails on both versions with E0308 (expected &Symbol, found Symbol) and two E0599 diagnostics (no u32.to_val method). Both corrected fixtures pass with exit 0."
  - "2026-11-06 GET https://developers.stellar.org/docs/build/smart-contracts/getting-started/hello-world.md states soroban-sdk = \"28\"; SHA-256 ad4c3372090e3f479b367065d946927253c87ddd501f271b6442a8e98c236494. The cross-contract page itself names no SDK version. SDK 29.0.1 was checked additionally against the current exposed smart-contract skill's major version."
  - "https://github.com/stellar/rs-soroban-sdk/blob/v29.0.1/soroban-sdk/src/env.rs defines invoke_contract with func: &Symbol; source SHA-256 144363e670fbc31add3a0aaa6953554072e45acbf7f1d4c44c89c43da2c5e5b8. The same file declares pub trait IntoVal and fn into_val(&self, e: &E) at lines 88-89."
  - "2026-11-06 fresh stellarDocs.search_soroban_contract_docs returns the same manual snippet. The retained packet, live page, and immutable source snippet match; extracted snippet SHA-256 896c42d6e3f1966fab547fb94d54025e3c9a35bd174bbfb7d368922f2278d515."
  - "Dedupe 2026-11-06: active and resolved findings plus stellar/stellar-docs issue and PR searches for invoke_contract, symbol_short, to_val, and cross-contract. sd-098 owns event publishing on other pages. The completed broad guide update and related CLI/error-handling changes do not cover this compile failure."
  - "Local reproduction artifacts: tmp/playground-final/aborted-review/upstream-evidence/compile-receipt.json, cross-compile/, and cross-compile-28/. Verification report: tmp/playground-final/aborted-review/upstream-verification.md."
  - "2026-11-06T18:14:06.265915Z independent verification freshly fetched the ordinary page and repeated all four native compile checks. Both exact snippets fail with E0308/E0599; both corrected snippets pass. Page and snippet hashes match this finding. Evidence: tmp/playground-final/aborted-review/root-cross-check/result.json."
  - upstream issue filed 2026-11-06: https://github.com/stellar/stellar-docs/issues/3070
---

## Finding

The manual invocation example in **Making cross-contract calls** does not compile with soroban-sdk 28.0.0 or 29.0.1.
It passes a `Symbol` where `Env::invoke_contract` requires `&Symbol`.
It also calls `to_val()` on both `u32` arguments, but that method does not exist.
A reader who copies this example cannot compile `ContractB`.

The preceding paragraph names the external function `add_with`, while both examples call `add`.
`add_with` is the wrapper function on `ContractB`.

## Evidence

The [deployed guide](https://developers.stellar.org/docs/build/guides/conventions/cross-contract#making-a-cross-contract-call) and immutable source contain:

```rust
#[contract]
pub struct ContractB;

#[contractimpl]
impl ContractB {
    pub fn add_with(env: Env, contract: Address, x: u32, y: u32) -> u32 {
        env.invoke_contract(&contract, symbol_short!("add"), vec![&env, x.to_val(), y.to_val()])
    }
}
```

Place this complete snippet in a library crate, preceded by these imports:

```rust
#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, vec, Address, Env, IntoVal};
```

Set `soroban-sdk = "=28.0.0"` in `Cargo.toml`, then run native `cargo check`.
Repeat with `soroban-sdk = "=29.0.1"`.
Both checks fail with E0308 and two E0599 diagnostics.
The checks used Rust 1.93.0 and cached dependencies through `cargo check --offline`.

The cross-contract guide names no dependency version.
The getting-started guide specifies SDK major 28, and the current smart-contract skill specifies major 29.
Both versions were checked to avoid attributing the failure only to a newer SDK.

An initial plain Wasm-target check stopped at the SDK's Stellar-CLI build guard.
That attempt did not reach this snippet and supplies no evidence about its correctness.
The native checks establish compilation results, not deployment or runtime behavior.

## Recommendation

Borrow the function symbol and convert each argument with `into_val(&env)`.
Show the required `IntoVal` import.
The complete corrected example passes native `cargo check` with both exact SDK pins:

```rust
#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, vec, Address, Env, IntoVal};

#[contract]
pub struct ContractB;

#[contractimpl]
impl ContractB {
    pub fn add_with(env: Env, contract: Address, x: u32, y: u32) -> u32 {
        env.invoke_contract(
            &contract,
            &symbol_short!("add"),
            vec![&env, x.into_val(&env), y.into_val(&env)],
        )
    }
}
```

Change the preceding paragraph to name the external function `add`.
The adjacent generated-client example already calls `client.add(&x, &y)`.
After deployment, verify the ordinary page and search result both serve the corrected snippet.
