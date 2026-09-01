---
id: sd-048
service: stellar-docs
status: reported-upstream
discovered: 2026-09-01
upstreamTitle: CAP-0075 lists unsupported Poseidon2 S-box degrees
evidence:
  - 2026-09-01 source check at stellar/stellar-protocol commit 65e2b6262c0825494caf2a94116eb512c8335f22 found that core/cap-0075.md line 78 lists Poseidon2 degree values 3, 5, 7, and 11; line 124 says only 5 is supported; line 157 says the host traps when d is not 5
  - 2026-09-01 ABI check at stellar/rs-soroban-env commit a7e15b439c4b49b17ba8f9e4527efee8d8119aba found that soroban-env-common/env.json line 2725 documents degree 5 for BLS12_381 and BN254
  - 2026-09-01 host check at stellar/rs-soroban-env commit a7e15b439c4b49b17ba8f9e4527efee8d8119aba found SUPPORTED_SBOX_DEGREES = [5] in soroban-env-host/src/crypto/poseidon/mod.rs and an unsupported-degree error in poseidon2_params.rs
  - independent residual review in .agents/rounds/2026-09-01-free-improvements-maintenance/opus-deletion-review.md
  - upstream issue filed 2026-09-01: https://github.com/stellar/stellar-protocol/issues/2010
---

## Finding

The CAP-0075 `poseidon2_permutation` interface lists `d` values 3, 5, 7, and 11.
The same CAP later says that only `d=5` is supported.
Its error conditions say that the host traps when `d` is not 5.

The shipped ABI also documents only degree 5 for `BLS12_381` and `BN254`.
The host constant `SUPPORTED_SBOX_DEGREES` contains only 5.
A contract author can follow the interface text and select an unsupported degree.

Pull request #1996 corrected the field selector and left this interface text unchanged.

## Evidence

These read-only commands reproduce the contradiction at the recorded commits:

```sh
gh api 'repos/stellar/stellar-protocol/contents/core/cap-0075.md?ref=65e2b6262c0825494caf2a94116eb512c8335f22' \
  -H 'Accept: application/vnd.github.raw+json' \
  | rg -n 'S-box degree|Only d=5|d` is not 5'

gh api 'repos/stellar/rs-soroban-env/contents/soroban-env-common/env.json?ref=a7e15b439c4b49b17ba8f9e4527efee8d8119aba' \
  -H 'Accept: application/vnd.github.raw+json' \
  | rg -n 'S-box degree \(5 for BLS12_381/BN254\)'

gh api 'repos/stellar/rs-soroban-env/contents/soroban-env-host/src/crypto/poseidon/mod.rs?ref=a7e15b439c4b49b17ba8f9e4527efee8d8119aba' \
  -H 'Accept: application/vnd.github.raw+json' \
  | rg -n 'SUPPORTED_SBOX_DEGREES'

gh api 'repos/stellar/rs-soroban-env/contents/soroban-env-host/src/crypto/poseidon/poseidon2_params.rs?ref=a7e15b439c4b49b17ba8f9e4527efee8d8119aba' \
  -H 'Accept: application/vnd.github.raw+json' \
  | rg -n -C 3 'SUPPORTED_SBOX_DEGREES|unsupported s-box degree'
```

The CAP interface lists four degrees.
The later CAP text, the ABI, and the host accept only degree 5.

## Recommendation

Change the Poseidon2 interface text to list only degree 5.
Use the ABI wording: `d: S-box degree (5 for BLS12_381/BN254)`.
Keep the interface block, the semantics, and the error conditions consistent.
