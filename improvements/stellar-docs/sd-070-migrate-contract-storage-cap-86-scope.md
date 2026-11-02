---
id: sd-070
service: stellar-docs
status: verified
discovered: 2026-11-02
upstreamTitle: Storage migration guide says an added Option field always traps; soroban-sdk 28 reads it as None
evidence:
  - 2026-11-02T17:17:27Z GET https://developers.stellar.org/docs/build/guides/storage/migrate-contract-storage returned HTTP 200 with "This traps with Error(Object, UnexpectedSize). The Soroban host validates the field count of the XDR-encoded value against the type definition before returning anything to the contract."; the page has no "v28", "CAP-86", or "CAP-0086" text
  - stellar/stellar-docs main 7cb5e8a492706d2ae95bbb14be737fbf96100058 docs/build/guides/storage/migrate-contract-storage.mdx lines 328-331
  - stellar/rs-soroban-sdk release v28.0.0 notes "A contracttype struct can be read from stored data with extra or missing fields (CAP-86). A field missing from the map reads as None if it is an Option, and errors otherwise ... An Option field can now be added or removed without migrating everything already stored." (rs-soroban-sdk PR 2006)
  - stellar/stellar-protocol master core/cap-0086.md "Host functions for sparse Symbol-keyed map creation and unpacking", Status Final, Protocol version 28
  - 2026-11-02 crates.io soroban-sdk max stable version 29.0.1
  - golden cases q-soroban-storage-migration and q-soroban-upgradeable-storage-compat (golden audit pass 2, 2026-11-02)
---

## Finding

The storage migration guide says that reading a stored `DataV1` as a `DataV2` with an added
`Option` field traps with `Error(Object, UnexpectedSize)`. The guide gives no version scope.

Since Protocol 28 (CAP-86) and soroban-sdk 28, a `contracttype` struct can read stored data with
missing or extra fields. A missing `Option` field reads as `None`. A missing non-`Option` field
still gives an error.

A reader can build a full versioned migration for a change that the current SDK handles directly.

This is a `docs-content` finding. The old behavior is still true for contracts built with
soroban-sdk before 28.

## Evidence

The live guide shows a `DataV2` that adds `c: Option<u32>`. It says that the read "traps" and
that "the host rejects the entry before the SDK can handle it". The page does not mention
soroban-sdk 28 or CAP-86.

The soroban-sdk v28.0.0 release notes say: "A field missing from the map reads as `None` if it is
an `Option`, and errors otherwise, and a map key that is not a field of the struct is ignored and
dropped, where both used to panic." CAP-0086 is Final for Protocol 28.

## Recommendation

Scope the trap example to soroban-sdk versions before 28. Add a section for soroban-sdk 28 and
later: an added or removed `Option` field needs no migration, and an added required field still
needs a versioned key or an explicit migration.

Optional: link the soroban-sdk migration note `_migrating::v28_contracttype_unpacking`.
