---
id: sd-088
service: stellar-docs
status: proposed
discovered: 2026-11-03
upstreamTitle: "Correct tagged and integer enum encodings in the contract-spec guide"
evidence:
  - "2026-11-03 public GET https://developers.stellar.org/docs/build/guides/dapps/working-with-contract-specs.md returned HTTP 200. Body SHA256 fba013f8c48e5b554245ca55219683bfb270ace9d654344de45115cc8c87934f. The unit/tuple sample combines Symbol A with a map for B; the integer section describes a vector."
  - "Canonical edit file: stellar/stellar-docs docs/build/guides/dapps/working-with-contract-specs.mdx at 85d2d1b8e7a4451b7a6af0931f587ce73109b816. Retained immutable-source SHA256 4a4a888536d6550be08733f3e8d18a271725e5482674f2cfaf672bbc0a732312."
  - "Independent implementation: stellar/js-stellar-sdk v17.4.0 src/contract/spec.ts, source SHA256 7890da87a28cb7c8ee90d69e0d1029441c55bf11fe77dae6dac3124b3ea88314. nativeToUnion selects one variant; nativeToEnum emits scvU32; enumToNative requires scvU32."
  - "The official SDK-author guide independently describes a symbol-led vector for a selected union variant. Retained published-body SHA256 938bbced8e584420cb1b83211964e12f446626ca5dd920fde6ce4b635560d4ad. This corroborates the implementation, rather than treating two Docs pages as independent implementations."
  - "Dedupe checked every improvements namespace, recurrences, resolved.json, and intake in MAIN and the method tree. No equivalent enum-encoding finding appeared. sd-055 concerns transaction assembly examples."
  - "research/audits/2026-11-02-golden-overnight/tail-source-receipts.json contains exact URLs, source dates, public body hashes, and bounded implementation excerpts. No contract invocation, simulation, or transaction ran."
---

## Finding

The contract-spec guide gives incorrect encodings for tagged enums and integer enums.
The declared tagged enum has variants `A` and `B(u32)`.
The Python, Java, and PHP examples combine Symbol A with a map containing B.
A tagged value must select one variant, rather than combine both variants.

The integer-enum section says its value is a vector and shows two integer elements.
Its Rust declaration instead defines `A = 1` and `B = 2` with `repr(u32)`.
The associated JSON incorrectly describes a struct with fields.
These examples do not represent either declared enum variant correctly.

## Evidence

The current [published guide](https://developers.stellar.org/docs/build/guides/dapps/working-with-contract-specs.md) retains all three repeated language examples.
The [immutable source](https://github.com/stellar/stellar-docs/blob/85d2d1b8e7a4451b7a6af0931f587ce73109b816/docs/build/guides/dapps/working-with-contract-specs.mdx) identifies the exact editing location.

The separate [SDK implementation](https://github.com/stellar/js-stellar-sdk/blob/v17.4.0/src/contract/spec.ts) emits one symbol-led vector for a selected union variant.
It emits a single `scvU32` for a declared integer-enum value and rejects a vector during conversion.
The SDK source uses a release tag; the receipt pins its observed bytes without inventing an immutable commit.
The Docs source and rendered page share one producer.
The SDK implementation provides the separate encoding evidence.

No live conversion or contract execution ran during preparation.

## Recommendation

Show tagged variants separately: `[Symbol(A)]` and `[Symbol(B), U32(value)]`.
Show integer variants as one declared u32 discriminant, such as `U32(1)` or `U32(2)`.
Correct the corresponding specification entry instead of describing that integer enum as a struct.
Apply the correction to every repeated Python, Java, and PHP example in both enum sections.
Keep the valid struct examples unchanged.

Validate each corrected example with its stated SDK version before publication.
