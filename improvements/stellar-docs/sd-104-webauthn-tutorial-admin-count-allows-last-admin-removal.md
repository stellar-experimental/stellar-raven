---
id: sd-104
service: stellar-docs
status: reported-upstream
discovered: 2026-11-10
upstreamTitle: WebAuthn wallet tutorial counts a re-added admin twice, so the last admin can be removed
evidence:
  - "2026-11-10T22:51:08Z GET https://developers.stellar.org/docs/build/guides/auth/check-auth-tutorials.md (SHA-256 58bc90a34748ec864a582279d0a7a36b7ba67c07e7bd06c283a875541fc0aa11). Tutorial 2 complete contract fence SHA-256 8699bc9cef036cb7d491a09b5181c2a76ee934d2075e9d8779057f8fd90f0055; the walkthrough has the same set_signer, remove and update_admin_signer_count logic."
  - "Source: https://github.com/stellar/stellar-docs/blob/d5df6416769d3645028b2062be26c4e598a271a1/docs/build/guides/auth/check-auth-tutorials.mdx. PR3081 moved the unconditional increment from add into set_signer; the parent 0678e4dcd49cbbd813f996957cdd5197976a520e already incremented unconditionally, so PR3081 did not introduce the defect."
  - "Reproduced 2026-11-10 by an independent reviewer as a native test against the unmodified served contract with soroban-sdk 29.0.1: constructor admin X, then add(X, same key, admin=true) under mock_all_auths (standing in for legitimate wallet-authorized management) leaves ADMIN_SIGNER_COUNT at 2 with one persistent signer; remove(X) succeeds; X is absent while the count reads 1. A second reviewer confirmed the control flow by reading set_signer and remove in the served fence."
  - "Scope: this is a lockout through authorized signer management, not an unauthorized takeover. The page marks the contract as an unaudited teaching example."
  - "Found while verifying the sd-101 fix; this is a separate defect. Dedupe 2026-11-10: no active or resolved finding and no stellar/stellar-docs issue covers the admin count."
  - upstream issue filed 2026-11-10: https://github.com/stellar/stellar-docs/issues/3098
---

## Finding

The WebAuthn smart wallet in "Tutorial 2: implementing a smart wallet (WebAuthn)" can lose its last admin.
`set_signer` increments `ADMIN_SIGNER_COUNT` for every admin write.
It increments even when the same ID is already a persistent admin.
`remove` uses that count to stop removal of the last admin.

If an authorized call re-adds an existing admin, the count becomes 2 while only one admin exists.
The wallet can then remove that admin.
The wallet has no admin signer, but the count still reads 1.

## Evidence

Use the Tutorial 2 complete contract with `soroban-sdk` 29.0.1.
In a native test, register the contract with one admin ID and key.
Call `add(id, pk, true)` with the same ID and key, with wallet authorization.
`ADMIN_SIGNER_COUNT` is now 2, but persistent storage has one admin.
Call `remove(id)`. It succeeds.
The admin ID is no longer stored, and `ADMIN_SIGNER_COUNT` is 1.

The same logic is in the walkthrough and in "Complete code".
This needs wallet authorization. It does not let an unauthorized caller take control.
Readers can copy this pattern into a wallet that they deploy.

## Recommendation

Increment `ADMIN_SIGNER_COUNT` only when an ID becomes a persistent admin for the first time.
This includes promotion of a session signer to admin.
Keep the count correct for replacements, demotions and removals.
Add a test that re-adds an existing admin and then fails to remove the only admin.
