---
id: sk-033
service: skills
status: verified
discovered: 2026-11-02
upstreamTitle: "development.md swaps the try_ result nesting: soroban-sdk returns the contract error as Err(Ok(e)), not Ok(Err(e))"
evidence:
  - "2026-11-02T21:23Z stellar/stellar-dev-skill main 313832e98b7606feba2cb0b03c4f9542b2d0c4c3 skills/smart-contracts/development.md line 287: 'generated clients expose both `foo()` (panics on error) and `try_foo()` returning `Result<Result<T, E>, InvokeError>` — `Ok(Err(e))` is your typed error, outer `Err` is a host-level failure (budget, bad auth, type mismatch).' The Raven pin cac64041d0c759a3b10ce6fba4fa3e0672bcbe0f has the same line."
  - "rs-soroban-sdk v29.0.1 soroban-sdk-macros/src/syn_ext.rs lines 234-248, fn try_output: the generated return type is 'Result<Result<T, <T as TryFromVal<Env, Val>>::Error>, Result<E, InvokeError>>'."
  - "rs-soroban-sdk v29.0.1 soroban-sdk/src/env.rs line 492-497: 'pub fn try_invoke_contract<T, E>(...) -> Result<Result<T, T::Error>, Result<E, InvokeError>>'."
  - "Consequence: Ok(Err(_)) is a return-value conversion error, Err(Ok(e)) is the contract's typed error, and Err(Err(_)) is an InvokeError. A test that matches Ok(Err(e)) for a contract error never matches."
  - "Dedupe 2026-11-02: no stellar/stellar-dev-skill issue or PR (all states) mentions try_ nesting; no active or resolved Raven finding covers it."
  - ".agents/TODO.md 'File the HackMeridian upstream findings' item R04. Golden follow-up is the separate TODO item 'Add golden cases for the confirmed HackMeridian gaps' (R04)."
---

## Finding

`skills/smart-contracts/development.md` line 287 gives the wrong shape for generated `try_` client methods.
It says the return type is `Result<Result<T, E>, InvokeError>` and that `Ok(Err(e))` is the typed contract error.

In `soroban-sdk` the return type is `Result<Result<T, ConversionError>, Result<E, InvokeError>>`.
The contract's typed error is `Err(Ok(e))`.
`Ok(Err(_))` is a failure to convert the return value.
`Err(Err(_))` is a host-level `InvokeError`.

Code or tests written from the skill match the wrong arm, so contract errors go unhandled.

## Evidence

The generated type comes from `fn try_output` in `soroban-sdk-macros/src/syn_ext.rs` at `v29.0.1`.
`Env::try_invoke_contract` in `soroban-sdk/src/env.rs` has the same signature.

## Recommendation

Replace the sentence with the real nesting.
For example: "`try_foo()` returns `Result<Result<T, _>, Result<E, InvokeError>>`.
`Err(Ok(e))` is your typed error, `Err(Err(_))` is a host-level failure, and `Ok(Err(_))` is a return-value conversion failure."
Optionally, add a short `match` example, such as `assert_eq!(client.try_foo(), Err(Ok(MyError::X)))`.
