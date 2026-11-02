---
id: sd-071
service: stellar-docs
status: reported-upstream
discovered: 2026-11-02
upstreamTitle: ZK page lists only the Protocol 25 BN254 host functions; add the Protocol 26 CAP-80 set
evidence:
  - 2026-11-02T17:17:27Z GET https://developers.stellar.org/docs/build/apps/zk returned HTTP 200; the section "BN254 host functions" lists only g1_add, g1_mul, and pairing_check
  - stellar/stellar-docs main 7cb5e8a492706d2ae95bbb14be737fbf96100058 docs/build/apps/zk.mdx lines 16-20; the page has no msm, fr_, CAP-80, or Protocol 26 text
  - stellar/rs-soroban-env main 0c99950e96128beba3319aa96b116646ce974e69 soroban-env-common/env.json crypto module - bn254_g1_add, bn254_g1_mul, and bn254_multi_pairing_check at min_supported_protocol 25; bn254_g1_msm, bn254_fr_add, bn254_fr_sub, bn254_fr_mul, bn254_fr_pow, bn254_fr_inv, and bn254_g1_is_on_curve at min_supported_protocol 26
  - stellar/rs-soroban-sdk v29.0.1 soroban-sdk/src/crypto/bn254.rs Bn254 methods g1_add, g1_mul, pairing_check (the names the page uses) and the Protocol 26 methods g1_msm, g1_is_on_curve, fr_add, fr_sub, fr_mul, fr_pow, fr_inv (lines 443-489)
  - open draft stellar/stellar-docs#2673 (opened 2026-07-22, updated 2026-07-28) adds a CAP-0080 bullet to docs/build/apps/privacy.mdx only; it does not change docs/build/apps/zk.mdx
  - stellar/stellar-protocol master core/cap-0080.md "Host functions for efficient ZK BN254 use cases", Status Final, Protocol version 26
  - the same docs commit docs/networks/software-versions.mdx lines 257 and 297 list "Host Functions for Efficient ZK BN254 Use Cases - CAP-80" for Protocol 26
  - golden cases q-zk-host-functions-status and q-pc-protocol-26-yardstick (golden audit pass 2, 2026-11-02)
  - upstream issue filed 2026-11-02: https://github.com/stellar/stellar-docs/issues/3006
---

## Finding

The ZK page section "BN254 host functions" lists three functions from Protocol 25. It omits the
seven BN254 host functions that Protocol 26 added through CAP-80.

The omitted functions are multi-scalar multiplication, scalar-field arithmetic, inversion, and a
curve-membership check. They lower the cost of proof verification. The Software Versions page on
the same site already lists CAP-80 for Protocol 26.

A reader can conclude that a verifier contract must build MSM and field arithmetic from the
three Protocol 25 functions.

The open draft pull request stellar/stellar-docs#2673 adds CAP-80 to the Privacy page. It does not
change the ZK page.

## Evidence

The live page lists `g1_add`, `g1_mul`, and `pairing_check`. It says that Protocol 25 introduced
the BN254 primitives.

The current `env.json` lists these BN254 functions with `min_supported_protocol` 26:
`bn254_g1_msm`, `bn254_fr_add`, `bn254_fr_sub`, `bn254_fr_mul`, `bn254_fr_pow`, `bn254_fr_inv`,
and `bn254_g1_is_on_curve`. CAP-0080 is Final for Protocol 26.

In soroban-sdk 29.0.1, the `Bn254` type exposes them as `g1_msm`, `g1_is_on_curve`, `fr_add`,
`fr_sub`, `fr_mul`, `fr_pow`, and `fr_inv`. The page uses the same SDK names for the Protocol 25
functions.

## Recommendation

Add a Protocol 26 list under "BN254 host functions" with the SDK methods `g1_msm`,
`g1_is_on_curve`, `fr_add`, `fr_sub`, `fr_mul`, `fr_pow`, and `fr_inv`, and a link to CAP-0080.
Give each method a one-line purpose, as for the existing three.

Optional: link the soroban-sdk `Bn254` API page,
https://docs.rs/soroban-sdk/latest/soroban_sdk/crypto/bn254/struct.Bn254.html (HTTP 200 on
2026-11-02).
