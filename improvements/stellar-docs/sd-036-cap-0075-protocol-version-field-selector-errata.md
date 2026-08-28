---
id: sd-036
service: stellar-docs
status: fixed-upstream
discovered: 2026-07-11
upstreamTitle: Fix CAP-0075 protocol-version and field-selector contradictions
evidence:
  - CAP-0075 at stellar/stellar-protocol commit fbf05c9d3220b711e181577e7dca19844c765c3c
  - shipped host interface at stellar/rs-soroban-env commit 1d0a2c6a522b1e6bfafed23c047372832a7976a7
  - research/audits/2026-07-11-gt31-protocol-caps-reserves.md
  - Solo scratchpad 575 GT-31 primary process 3280, blind process 3282, and queued author process 3403
  - upstream issue filed 2026-07-14: https://github.com/stellar/stellar-protocol/issues/1980
  - 2026-08-28 live source recheck: merged PR https://github.com/stellar/stellar-protocol/pull/1996 (merge commit d186cf3187722ebcdbd647e782449e543f9d0ef3) changes both CAP-0075 interface blocks to `field: Symbol`, documents `BLS12_381` and `BN254`, and keeps `min_supported_protocol` at 25
recurrences:
  - date: 2026-08-11
    evidence: live source recheck shows the former Protocol-24 availability contradiction no longer appears, but CAP-0075 still specifies field as U32Val with 0/1 while current rs-soroban-env specifies Symbol with BLS12_381/BN254 at Protocol 25. Issue #1980 remains open; its only recorded comment is leighmcculloch's 2026-07-15 author notification.
  - date: 2026-08-28
    evidence: `gh api repos/stellar/stellar-protocol/contents/core/cap-0075.md -H 'Accept: application/vnd.github.raw+json' | rg -n -C 3 'Protocol 24|Protocol 25|U32Val|BLS12_381|BN254|"field"'` confirmed the deployed CAP source matches the shipped Symbol ABI. Issue #1980 closed as completed with PR #1996 on 2026-08-20.
---

## Finding

> **Fixed 2026-08-28.** The source recheck closed the CAP-0075 interface contradiction. Everything below describes the defect before the fix.

The current Final CAP-0075 source retains one reproducible interface
contradiction. The former Protocol-24 availability contradiction no longer
appears, but the interface blocks still type the `field` selector as `U32Val` with
numeric values 0 and 1, while the shipped P25+ `rs-soroban-env` interface types
it as `Symbol` and accepts `BLS12_381` or `BN254`.

This is distinct from `sd-021`, which owns Stellar Docs' wrong CAP link and its
permutation-versus-high-level-hash/API explanation. This finding owns the
normative CAP source errata and resolves through `stellar/stellar-protocol`, not
the Docs content repository.

## Evidence

At the pinned current heads on 2026-07-11, the interface contradiction reproduced with
read-only source checks:

- The same CAP's two JSON interface blocks declare `field: U32Val` and document
  0/1.
- `soroban-env-common/env.json` declares `field: Symbol` for
  `poseidon_permutation` and `poseidon2_permutation`, documents
  `BLS12_381`/`BN254`, and gates both at Protocol 25.

The current Mainnet activation and Core release history independently establish
that these functions shipped with Protocol 25. No guessed SDK helper name is
needed to reproduce either defect.

## Recommendation

Make its interface blocks match the shipped `Symbol` selector and accepted symbol
values. If the numeric form was a superseded design, label it explicitly as
such rather than leaving two apparent current ABIs. Keep the CAP description
precise that these exports are configurable permutation primitives from which
hash constructions can be built, not turnkey hash helpers.
