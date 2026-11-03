---
id: sd-085
service: stellar-docs
status: verified
discovered: 2026-11-02
upstreamTitle: Use set_authorized consistently in SAC authorization prose
evidence:
  - "The live SAC page's Balance Authorization Required paragraph names set_auth at line 87. The same page's interface and later prose name set_authorized. Body SHA-256: 618f012fcde31061c4168d1e91f04b729f68526ce291301e06158d7cca8725ef. URL: https://developers.stellar.org/docs/tokens/stellar-asset-contract.md."
  - "The current built-in SAC contract defines set_authorized and no set_auth function. Body SHA-256: 5fe6f53f7da37861501ae6e6205907f3473679a8cabe1eca61759d50210e997a. URL: https://raw.githubusercontent.com/stellar/rs-soroban-env/main/soroban-env-host/src/builtin_contracts/stellar_asset_contract/contract.rs."
  - "2026-11-03T01:34:06Z a focused MCP page read returned both spellings. Request/result hashes and public HTTP receipts: research/audits/2026-11-02-golden-overnight/authorization-source-receipts.json."
  - "The new q-comp-auth-flags-overview answer repeats set_auth. Its original correct grade remains unchanged; the independent review records the extra naming error."
---

## Finding

The SAC page gives two names for its balance authorization function.
The Balance Authorization Required paragraph uses `set_auth`.
The documented interface and the built-in contract use `set_authorized`.
Readers can copy the incorrect function name into contract calls.

## Evidence

The [SAC page](https://developers.stellar.org/docs/tokens/stellar-asset-contract.md) contains the incorrect name at line `87`.
Its interface declares `fn set_authorized(env: Env, id: Address, authorize: bool)`.
The [built-in implementation](https://raw.githubusercontent.com/stellar/rs-soroban-env/main/soroban-env-host/src/builtin_contracts/stellar_asset_contract/contract.rs) also defines `set_authorized`.
The focused MCP read returns both names, so the inconsistency reaches documentation consumers.

This finding makes no claim about when the naming mismatch began.
The check submitted no contract transaction.

## Recommendation

Use `set_authorized` in the Balance Authorization Required paragraph.
Check nearby authorization prose for the same name.
Keep the correct interface declaration and its authorization conditions.

Recheck the served page against the built-in function name.
The relevant prose and interface must use the same name.
