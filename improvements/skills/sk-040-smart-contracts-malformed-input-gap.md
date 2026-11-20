---
id: sk-040
service: skills
status: verified
discovered: 2026-08-07
upstreamTitle: "smart-contracts security.md omits malformed and short-input guards before decoding or slicing"
evidence:
  - "2026-11-20 recurrence probe on pinned commit 421ca30a671cd32d7d6466e8b903f10d79dc1590 (2026-11-12) and live main 79340b69bf1d5976ac8b0f7042de5bf9d63c9595 (2026-11-19) of stellar/stellar-dev-skill: all four skills/smart-contracts/ files are byte-identical between the pin and main. skills/smart-contracts/security.md (blob aa56fe9ff663922f13331c337217c8ac7a5b1fb0, 11280 bytes, SHA-256 9b5230d99912ffe343aff3d0e46a910610f83ed5bffae9e2e6aa2154c263b92b) is also byte-identical to https://skills.stellar.org/skills/smart-contracts/security.md."
  - "2026-11-20 full-skill text scan across pinned SKILL.md (13855 B, blob b98c4816cf95825fc59fa4a023282c711773d461), development.md (32648 B, blob 6c2a1e7245eb35a527c974736a0d6af2f58a4002), security.md (11280 B, blob aa56fe9ff663922f13331c337217c8ac7a5b1fb0), and testing.md (11380 B, blob db28070f9d835f75b3794cce7bb84cbab444a6d5): 0 matches for malformed, short input, length, slice, copy_into_slice, from_xdr, or try_from_xdr. The 2 matches for bounds cover oracle freshness (development.md:384) and swap slippage (security.md:105). The 1 match for decode covers storage-schema upgrades (development.md:346)."
  - "2026-11-20 structure check on skills/smart-contracts/security.md: Vulnerability classes lists 11 numbered entries (#1 through #11). Class 5 (line 97) covers integer sign and range validation only; class 7 (line 103) covers check-then-act races; the Contract checklist (line 168) repeats only sign and range validation. No class or checklist item covers malformed, truncated, or wrong-length byte inputs."
  - "2026-11-20 timeline calibration: skills/smart-contracts/security.md was introduced in commit 5907afc60100650305355e74632cb5254e1b90bb (2026-06-29) with 11 vulnerability classes and no malformed-input class. Raven first observed the gap on 2026-08-07 at pin 52baea1d8cb1aa9441004ce44b723f55cbc90901 (research/audits/2026-08-07-codegen-partner-report.md). Between 2026-08-07 and 2026-11-20, only one SEP-55 checklist line changed in security.md (added in 452b954d2b59cf41294401186461c583a8350c38 on 2026-08-13 and refined in a5921875c3c7c63886f5a6204b5dd55b0ebf9b90 on 2026-08-14)."
  - "2026-11-20 SDK verification against stellar/rs-soroban-sdk main 27ae4ffd9fce7cb93dcd704582f7540cc88f0701: Bytes::slice panics with HostError Error(Object, IndexBounds) on out-of-bounds ranges (soroban-sdk/src/bytes.rs:738-762, tested at lines 1926-1927); Bytes::copy_into_slice panics on length mismatch (soroban-sdk/src/bytes.rs:726-733); FromXdr::from_xdr panics on invalid ScVal XDR (soroban-sdk/src/xdr.rs:91-94); BytesN<N>::try_from returns Result<BytesN<N>, ConversionError> (soroban-sdk/src/bytes.rs:1088-1116)."
  - "2026-11-20 dedupe: scanned all 189 issues and pull requests (state=all) in stellar/stellar-dev-skill and all active and resolved local findings in improvements/. Zero duplicates cover malformed or short-input guards in skills/smart-contracts/."
  - "2026-11-20 verification status: verified locally in Raven; ready for upstream filing."
probe:
  type: http-text
  url: https://raw.githubusercontent.com/stellar/stellar-dev-skill/main/skills/smart-contracts/security.md
  expect:
    status: 200
    contains:
      - "### 11. Custom account (`__check_auth`) pitfalls"
    excludes:
      - "### 12."
      - "malformed"
      - "Malformed"
      - "copy_into_slice"
      - "from_xdr"
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
- `FromXdr::from_xdr` panics when input bytes are not valid `ScVal` XDR (`soroban-sdk/src/xdr.rs` lines 91-94).
- `BytesN::<N>::try_from` returns `Result<BytesN<N>, ConversionError>` instead of panicking (`soroban-sdk/src/bytes.rs` lines 1088-1116).

Commit `5907afc60100650305355e74632cb5254e1b90bb` introduced `security.md` on 2026-06-29 without malformed-input guidance.
Only one SEP-55 checklist item changed `security.md` between 2026-08-07 and 2026-11-20.

Read-only reproduction:

```sh
curl -sSfL https://raw.githubusercontent.com/stellar/stellar-dev-skill/main/skills/smart-contracts/security.md \
  | rg -in 'malformed|short input|length|slice|copy_into_slice|from_xdr|^### '
```

## Recommendation

Add a numbered vulnerability class in `skills/smart-contracts/security.md` for malformed and short inputs.
Include these concrete rules:

- Prefer fixed-length types (`BytesN<N>`) in public entry points instead of variable-length `Bytes`.
- Check `Bytes::len()` before calling `Bytes::slice` or `Bytes::copy_into_slice`.
- Use fallible conversions (`BytesN::<N>::try_from`) and return a typed `#[contracterror]` or `panic_with_error!`.
- Note that `FromXdr::from_xdr` traps on invalid `ScVal` XDR rather than returning `Err`.

Add a matching check to the Contract checklist in `skills/smart-contracts/security.md` (next to line 168).
Add malformed or truncated byte inputs to the edge-case checklist line in `skills/smart-contracts/testing.md` (line 264).
