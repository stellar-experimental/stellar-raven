---
id: sd-101
service: stellar-docs
status: reported-upstream
discovered: 2026-11-09
upstreamTitle: Complete the missing definitions and dependencies in the WebAuthn contract example
evidence:
  - "2026-11-09 live GET https://developers.stellar.org/docs/build/guides/auth/check-auth-tutorials.md, Tutorial 2 Complete code: the unchanged Rust fence fails native cargo check with soroban-sdk 29.0.1 and rustc 1.93.0."
  - "Served page SHA256: 5a55dbfd9a912c4bddfbcb5a9426aeb3bb270012f3b9383a3af347aa165158c5. Extracted complete-contract fence SHA256, including a final newline: 428107820e7f4eff0e69d4f4408f3e70a720c04fd1924b6f43d2b129c8fa5557."
  - "Source: https://github.com/stellar/stellar-docs/blob/f83baf27c91fdbc54c04872aba603b73d9cd9469/docs/build/guides/auth/check-auth-tutorials.mdx. The complete example references ADMIN_SIGNER_COUNT, WEEK_OF_LEDGERS and ClientDataJson without defining them, and does not provide serde_json_core/base64_url dependency or module wiring."
  - "The event migration's PR3067 body acknowledges the pre-existing complete-example gap. Its exact acknowledgement and URL are recorded in Evidence below; that PR fixes sd-098, not this successor."
  - "Dedupe 2026-11-09: searched active findings and improvements/resolved.json for ADMIN_SIGNER_COUNT, ClientDataJson, base64_url, complete WebAuthn and WebAuthn complete. No separate finding owns these omissions."
  - "Successor of sd-098, whose event-migration resolution is recorded in improvements/resolved.json. Independent author and reviewer compilations reproduced 14 E0425/E0433 diagnostics on 2026-11-09."
  - upstream issue filed 2026-11-09: https://github.com/stellar/stellar-docs/issues/3079
---

## Finding

The WebAuthn tutorial's “Complete code” contract omits definitions needed for compilation.
It references `ADMIN_SIGNER_COUNT`, `WEEK_OF_LEDGERS` and `ClientDataJson` without defining them.
It also calls `serde_json_core` and `base64_url` without providing the dependency or module setup.
The fence defines a bare `encode` function but calls `base64_url::encode`.
A reader cannot compile the complete contract from the supplied example alone.

The five deprecated event calls were migrated successfully under sd-098.
These omissions predate that migration and require a separate correction.
The event-publishing correction is recorded under sd-098 in [Raven's resolution ledger](https://github.com/stellar-experimental/stellar-raven/blob/main/improvements/resolved.json).

## Evidence

On 2026-11-09, native `cargo check --offline` produced 14 E0425/E0433 diagnostics from the served complete contract.
The check used Rust 1.93.0 and stable `soroban-sdk = "=29.0.1"`.
The missing constants and type fail independently of any missing external dependency declaration.
This does not establish that `serde_json_core` or `base64_url` themselves are broken packages.

To reproduce, extract the Tutorial 2 “Complete code” Rust fence into `src/lib.rs` without repairs.
Use this minimal `Cargo.toml`, then run `cargo check`:

```toml
[package]
name = "webauthn-doc-example"
version = "0.1.0"
edition = "2021"

[dependencies]
soroban-sdk = "=29.0.1"

[lib]
crate-type = ["rlib"]
```

The [event-migration PR body](https://github.com/stellar/stellar-docs/pull/3067) explicitly acknowledges this pre-existing gap.
It identifies the missing constants, `ClientDataJson` and `base64_url`, and says complete compilation was not verified there.
The migrated event definitions compile separately and preserve their expected topics and data.
That result does not establish complete-contract compilation or authorization correctness.

## Recommendation

Define the missing constants and client-data type in the complete example.
Provide the required dependency versions and a consistent base64 module or function call.
Keep the walkthrough and complete code consistent.
Compile the full supplied contract with the documented SDK before calling the example complete.
