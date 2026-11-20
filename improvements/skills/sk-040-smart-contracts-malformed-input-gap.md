---
id: sk-040
service: skills
status: verified
discovered: 2026-08-07
upstreamTitle: "smart-contracts security.md omits malformed and short-input guards before decoding or slicing"
evidence:
  - "2026-11-20 recurrence probe on stellar/stellar-dev-skill pin 421ca30a671cd32d7d6466e8b903f10d79dc1590 (2026-11-12) and main 79340b69bf1d5976ac8b0f7042de5bf9d63c9595 (2026-11-19). All four skills/smart-contracts/ files match byte-for-byte between the pin and main. Published https://skills.stellar.org/skills/smart-contracts/security.md serves the same blob aa56fe9ff663922f13331c337217c8ac7a5b1fb0 (11280 bytes)."
  - "2026-11-20 pinned four-file scan: SKILL.md (13855 B), development.md (32648 B), security.md (11280 B), and testing.md (11380 B). All four files have zero matches for malformed, short input, length, slice, copy_into_slice, from_xdr, or try_from_xdr. Two bounds matches cover oracle freshness (development.md:384) and swap slippage (security.md:105). One decode match covers storage upgrades (development.md:346)."
  - "2026-11-20 structure check on skills/smart-contracts/security.md: Vulnerability classes lists 11 numbered entries (#1 through #11). Class 5 (line 97) covers numeric sign and range checks only. Class 7 (line 103) covers check-then-act races. The Contract checklist (line 168) repeats only sign and range validation."
  - "2026-11-20 timeline calibration: commit 5907afc60100650305355e74632cb5254e1b90bb (2026-06-29) introduced security.md without malformed-input guidance. Raven first observed the gap on 2026-08-07 at commit 52baea1d8cb1aa9441004ce44b723f55cbc90901. Only one SEP-55 checklist line changed security.md between 2026-08-07 and 2026-11-20. Commit 452b954d2b59cf41294401186461c583a8350c38 added that line, and commit a5921875c3c7c63886f5a6204b5dd55b0ebf9b90 revised it."
  - "2026-11-20 SDK verification on stellar/rs-soroban-sdk main 27ae4ffd9fce7cb93dcd704582f7540cc88f0701. Bytes::slice panics on out-of-bounds ranges (soroban-sdk/src/bytes.rs:738-762, tested at lines 1926-1927). Bytes::copy_into_slice panics on length mismatch (soroban-sdk/src/bytes.rs:726-733). FromXdr::from_xdr panics on invalid ScVal XDR (soroban-sdk/src/xdr.rs:91-94, 114-117). Generated contract wrappers unwrap BytesN<N> arguments (soroban-sdk-macros/src/derive_fn.rs:137-147). BytesN::<N>::try_from returns Result<BytesN<N>, ConversionError> (soroban-sdk/src/bytes.rs:1088-1116)."
  - "2026-11-20 dedupe: scanned all 189 issues and pull requests (state=all) in stellar/stellar-dev-skill. Also scanned all active and resolved local findings in improvements/. Zero duplicates cover malformed or short-input guards in skills/smart-contracts/."
  - "2026-11-20 posting hold: not posted upstream yet. Upstream posting waits for repository-owner approval."
---

## Finding

`skills/smart-contracts/security.md` lists 11 numbered vulnerability classes and omits malformed or short-input handling.
No file in `skills/smart-contracts/` mentions length or bounds guards before slicing, copying, or decoding caller-supplied bytes.

The closest guidance covers numeric sign and range checks only (`security.md` line 97 and line 168).
Class 7 covers check-then-act races, not input parsing (`security.md` line 103).

Contract authors who rely on this skill can omit length checks before `Bytes::slice` or `Bytes::copy_into_slice`.
Unchecked short or malformed inputs trap with opaque host errors instead of returning a typed contract error.

## Evidence

On 2026-11-20, commit `421ca30a671cd32d7d6466e8b903f10d79dc1590` and `main` commit `79340b69bf1d5976ac8b0f7042de5bf9d63c9595` serve identical `skills/smart-contracts/` files.
The published page at `https://skills.stellar.org/skills/smart-contracts/security.md` serves the same git blob (`aa56fe9ff663922f13331c337217c8ac7a5b1fb0`, 11,280 bytes).

A scan across all four files (`SKILL.md`, `development.md`, `security.md`, `testing.md`) found zero matches for these terms:

- `malformed`, `short input`, `length`, `slice`, `copy_into_slice`, `from_xdr`, `try_from_xdr`

Two `bounds` matches cover oracle freshness (`development.md` line 384) and swap slippage (`security.md` line 105).
One `decode` match covers storage-schema upgrades (`development.md` line 346).

In `stellar/rs-soroban-sdk` (`27ae4ffd9fce7cb93dcd704582f7540cc88f0701`), unchecked byte operations panic on bad lengths or invalid XDR:

- `Bytes::slice` traps with `HostError: Error(Object, IndexBounds)` on out-of-bounds ranges (`soroban-sdk/src/bytes.rs` lines 738-762).
- `Bytes::copy_into_slice` panics when byte and slice lengths differ (`soroban-sdk/src/bytes.rs` lines 726-733).
- `FromXdr::from_xdr` panics when input bytes are not valid `ScVal` XDR (`soroban-sdk/src/xdr.rs` lines 91-94, 114-117).
- Generated `#[contractimpl]` wrappers unwrap `BytesN<N>` arguments (`soroban-sdk-macros/src/derive_fn.rs` lines 137-147).
- `BytesN::<N>::try_from` returns `Result<BytesN<N>, ConversionError>` instead of panicking (`soroban-sdk/src/bytes.rs` lines 1088-1116).

Commit `5907afc60100650305355e74632cb5254e1b90bb` introduced `security.md` on 2026-06-29 without malformed-input guidance.
Only one SEP-55 checklist item changed `security.md` between 2026-08-07 and 2026-11-20.

Pinned read-only reproduction (same output on `main` `79340b69bf1d5976ac8b0f7042de5bf9d63c9595`):

```sh
SHA=421ca30a671cd32d7d6466e8b903f10d79dc1590
for f in SKILL.md development.md security.md testing.md; do
  echo "=== $f ==="
  curl -sSfL "https://raw.githubusercontent.com/stellar/stellar-dev-skill/${SHA}/skills/smart-contracts/${f}" \
    | rg -in 'malformed|short input|length|bounds|slice|decode|copy_into_slice|from_xdr|try_from_xdr|^### [0-9]+\.' || echo "(0 matches)"
done
```

Observed output: zero matches in `SKILL.md` and `testing.md`.
`development.md` matches only lines 346 (`decode`) and 384 (`bounds`).
`security.md` matches only headings `### 1.` through `### 11.` and line 105 (`bounds`).

## Recommendation

Add a numbered vulnerability class in `skills/smart-contracts/security.md` for malformed and short inputs.
Include these concrete rules:

- Use `BytesN<N>` parameters when ABI-boundary rejection on wrong length is acceptable.
- Accept `Bytes` and convert with `BytesN::<N>::try_from` when the contract must return a typed `#[contracterror]`.
- Check `Bytes::len()` before calling `Bytes::slice` or `Bytes::copy_into_slice`, and fail with a typed error or `panic_with_error!`.
- Avoid `FromXdr::from_xdr` on untrusted caller bytes when typed error handling is required.
- Pass typed `#[contracttype]` arguments instead, because `FromXdr::from_xdr` traps on invalid `ScVal` XDR rather than returning `Err`.

Add a matching check to the Contract checklist in `skills/smart-contracts/security.md` (next to line 168).
Add malformed or truncated byte inputs to the edge-case checklist line in `skills/smart-contracts/testing.md` (line 264).
