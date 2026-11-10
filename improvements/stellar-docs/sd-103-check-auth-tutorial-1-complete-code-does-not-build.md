---
id: sd-103
service: stellar-docs
status: reported-upstream
discovered: 2026-11-10
upstreamTitle: Fix the Tutorial 1 complete contract and test in the check-auth tutorials so they build and run
evidence:
  - "2026-11-10T22:51:08Z GET https://developers.stellar.org/docs/build/guides/auth/check-auth-tutorials.md (SHA-256 58bc90a34748ec864a582279d0a7a36b7ba67c07e7bd06c283a875541fc0aa11). Tutorial 1 complete contract fence SHA-256 ed0a018aabf40d428cfa826ce0c029988f38143605c8db9eaa98ab101b5730b2; following test fence SHA-256 4fa1a745d35ac3276ad23a5fa0b5deac9c327d44288e108e131d095a07a1c5f7."
  - "Source: https://github.com/stellar/stellar-docs/blob/d5df6416769d3645028b2062be26c4e598a271a1/docs/build/guides/auth/check-auth-tutorials.mdx. Tutorial 1 is byte-identical at PR3081's parent 0678e4dcd49cbbd813f996957cdd5197976a520e, so PR3081 did not introduce these defects."
  - "Independent reproductions on 2026-11-10 with soroban-sdk =29.0.1 and rustc 1.93.0: two independent reviewers each got error[E0432] unresolved import soroban_sdk::Hash from the verbatim complete contract. One reviewer's test build also failed with unresolved ed25519_dalek and rand imports and a missing Vec import in the test fence."
  - "The reviewer repaired a scratch copy only to find later failures: after the import and dependency fixes, the test fails at runtime with HostError Error(Context, InternalError) 'ledger protocol version too old for host', because the test sets protocol_version: 1 in both ledger updates. The compiler also warns that '... == AccError::TimeLimitExceeded;' discards its result instead of asserting. With these corrected, the test passes with no warnings."
  - "Found while verifying the sd-101 fix; this is a separate defect. Dedupe 2026-11-10: no active or resolved finding and no stellar/stellar-docs issue covers the Tutorial 1 build; stellar-docs#3079 covered Tutorial 2 only."
  - upstream issue filed 2026-11-10: https://github.com/stellar/stellar-docs/issues/3097
---

## Finding

The "Tutorial 1: time based restriction on token transfers" complete code does not compile with `soroban-sdk` 29.0.1.
The complete contract imports `Hash` from the crate root as `soroban_sdk::Hash`.
The walkthrough imports it correctly as `soroban_sdk::crypto::Hash`.
The test fence that follows also does not build or run as supplied.

A reader who copies the complete contract and its tests cannot build them without repairs.

## Evidence

Copy the Tutorial 1 "Complete code" Rust fence to `src/lib.rs`.
Copy the Rust fence after "These are the test cases" to `src/test.rs`.
Use `soroban-sdk = "=29.0.1"` with the `testutils` feature for tests, then run `cargo check` and `cargo test`.

```text
error[E0432]: unresolved import `soroban_sdk::Hash`
error[E0432]: unresolved import `ed25519_dalek`
error[E0432]: unresolved import `rand`
error[E0425]: cannot find type `Vec` in this scope
```

The page gives no dependency setup for `ed25519_dalek` or `rand`.
The test uses the older `Keypair` API, not the current `ed25519-dalek` 2.x `SigningKey` API.
After those repairs, the test fails at runtime: `ledger protocol version too old for host`.
The test sets `protocol_version: 1` in both `env.ledger().set(...)` calls.
The line `... == AccError::TimeLimitExceeded;` compares a value and discards the result, so it asserts nothing.

## Recommendation

Change the complete contract import to `soroban_sdk::crypto::Hash`, as in the walkthrough.
Add the test dependencies with versions that match the API the test uses, and import `Vec` in the test.
Keep the current ledger protocol version in the test, for example from `env.ledger().get().protocol_version`.
Change the time-limit check to `assert_eq!`.
Build and run the complete contract and its test with the current SDK before the tutorial is marked complete.
