---
id: sk-039
service: skills
status: reported-upstream
discovered: 2026-11-06
upstreamTitle: Update the assets skill's SEP-41 transfer and symbol type summaries
evidence:
  - "2026-11-06T18:57:30Z canonical published assets and merged PR181 source match SHA-256 c88cc42460803e48f2b316311ae33bdd7f130a23b9710cd356d02fd2599f1146. transfer takes MuxedAddress, symbol returns String, transfer_from retains Address, and the valid client example remains. Fix: https://github.com/stellar/stellar-dev-skill/pull/181; handoff: https://github.com/stellar-experimental/stellar-raven/issues/388."
  - "2026-11-06T18:58:35Z ordinary GET https://developers.stellar.org/.well-known/agent-skills/assets/skill.md returned HTTP 200, SHA-256 ff836f85491d74fcd2f2d0d1331bff502f45c8ad53b6bf351dc39a1114976b55, but still lists transfer destination Address and symbol() return Symbol. Keep reported-upstream for this deployed Docs copy; canonical content is corrected."
  - "2026-11-06T17:56:09Z GET https://skills.stellar.org/skills/assets/SKILL.md returned HTTP 200, SHA-256 ead389a330f0dc57da419fa31d40fa7177f498e60c50f1433b10a1604373c5a8. Lines 380 and 385 list an Address-only transfer destination and a Symbol return type for symbol()."
  - "Canonical source: https://raw.githubusercontent.com/stellar/stellar-dev-skill/248c4caeeb8d8c149ed0a8ae05e5725aa0cd9d29/skills/assets/SKILL.md, Git blob 1658bebe308055e105cfedf7fcd9f6f1ba478a7b. The same blob is in Raven's frozen skill inventory."
  - "https://raw.githubusercontent.com/stellar/stellar-protocol/ced008c3727005ca4a775f430fe6fe346c30f58f/ecosystem/sep-0041.md declares transfer destination MuxedAddress and symbol() return String. Its destination documentation explicitly permits MuxedAddress or Address."
  - "https://docs.rs/soroban-sdk/27.0.6/src/soroban_sdk/token.rs.html declares the same interface types. The generated TokenClient accepts an Into<MuxedAddress> destination."
  - "The skill's existing token.transfer(&from, &to, &amount) example passed cargo check --offline against soroban-sdk =27.0.6. The client example is valid and is not part of this defect."
  - "Dedupe checked all 46 repository issues and 130 PRs on 2026-11-06. The earlier MuxedAddress guidance change affected smart-contracts/development.md, not this assets interface list. No duplicate active or resolved Raven skill finding was found."
  - upstream issue filed 2026-11-06: https://github.com/stellar/stellar-dev-skill/issues/180
---

## Finding

The assets skill's “SAC vs Custom Token Interface” list gives two incorrect types.
`transfer` gives its destination as `Address`; SEP-41 now declares `MuxedAddress`.
`symbol()` gives its return type as `Symbol`; SEP-41 declares `String`.
These declarations mislead readers implementing the interface or decoding token metadata.

## Evidence

The ordinary published skill URL and its canonical source contain both entries.
The current SEP-41 specification and Soroban SDK 27.0.6 agree on the replacement
types. `transfer_from` still uses an `Address` destination.

The neighboring Rust client example is valid: the generated client accepts
conversion into `MuxedAddress`, including an `&Address`. An isolated compile of
that exact call passed. This finding does not request an explicit conversion in
the example or claim that existing Address callers fail.

## Recommendation

Update the two interface-list entries to match SEP-41. Briefly distinguish the
interface parameter from the generated client's accepted conversions. Keep the
working `&to` client example and the separate `transfer_from` destination type.

## Remaining delivery defect, 2026-11-06

PR181 fixes the canonical skill and skills.stellar.org publishes that corrected copy.
The ordinary Docs skill URL still lists both incorrect interface types. Keep the
finding open until the generated and normally published Docs copy has the fix.
No further canonical type correction is requested. The earlier evidence above
records the original defect; the client example was always valid.
