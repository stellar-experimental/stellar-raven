---
id: sd-095
service: stellar-docs
status: reported-upstream
discovered: 2026-11-03
upstreamTitle: "Distinguish device-bound and synchronized passkeys in the SDP guide"
evidence:
  - "Fresh published/source evidence for OC-PASSKEY-STORAGE remains in research/audits/2026-11-03-qa-followup/additional-source-findings.json. The Docs source belongs to stellar/stellar-docs at85d2d1b8e7a4451b7a6af0931f587ce73109b816."
  - "Source-scope follow-up: research/audits/2026-11-03-qa-followup/passkey-source-supplement.json. The maintained SDP backend source at commit 4aff0437810d12e020571c1dc075597d032a0bb7 uses platform/resident preferences and delegates credential registration. It reconstructs backup flags as true for authentication."
  - "The independent Google source describes encrypted provider synchronization. Exact public source URLs, observation times and hashes are retained in the supplement."
  - "Dedupe covers active and resolved records. sd-027,sd-034 and sk-017 have different mechanisms; the original concern had no finding ID while application scope was unverified."
  - upstream issue filed 2026-11-03: https://github.com/stellar/stellar-docs/issues/3042
recurrences:
  - date: 2026-11-06
    evidence: "Live SDP guide still says private key never leaves device. PR3057 green/BLOCKED/review-required, Nov5 removes hardware-key example, adds one-passkey/no-recovery note; explicitly awaiting Platform-team signoff. Exact URLs and upstream state: .agents/rounds/2026-11-05-truth-maintenance/docs.md, row sd-095"
---

## Finding

The SDP Embedded Wallets guide says the private key never leaves the receiver's device.
Some passkey providers synchronize credentials with end-to-end encryption.
The guide needs to distinguish device-bound credentials from provider-managed synchronization.
This distinction does not mean that the website receives a private key.

## Evidence

The [published guide](https://developers.stellar.org/docs/platforms/stellar-disbursement-platform/admin-guide/embedded-wallets.md) retains the absolute storage statement.
The [canonical source](https://raw.githubusercontent.com/stellar/stellar-docs/85d2d1b8e7a4451b7a6af0931f587ce73109b816/docs/platforms/stellar-disbursement-platform/admin-guide/embedded-wallets.mdx) contains the same statement.
Its observed Git blob is `8a19af6652948dd9778f41cf39fc57934cab1ab9`.

The maintained [SDP registration source](https://github.com/stellar/stellar-disbursement-platform-backend/blob/4aff0437810d12e020571c1dc075597d032a0bb7/internal/wallet/webauthn_service.go) uses platform and resident-key preferences.
Those preferences do not require a device-bound-only credential.
Registration delegates credential validation, and the authentication source reconstructs both backup flags as true.
That code does not establish actual synchronization for any receiver.

The [Google passkey guide](https://developers.google.com/identity/passkeys/supported-environments) describes encrypted provider synchronization.
The observed branch is develop; this finding asserts no deployment-specific behavior.
No credential ceremony, account access, transaction, or network simulation occurs.
The evidence establishes no application vulnerability or private-key exposure.

## Recommendation

Say that the authenticator or passkey provider manages the private key and does not expose it to the website.
Explain that credentials can be device-bound or synchronized with end-to-end encryption.
Keep backup and availability behavior specific to the provider.
Do not promise that every receiver can restore a credential or use it on another device.
