---
id: sd-034
service: stellar-docs
status: reported-upstream
discovered: 2026-07-11
evidence:
  - current developers.stellar.org smart-wallet guide routes builders to Passkey Kit without presenting the separate Smart Account Kit authorization model
  - current stellar/passkey-kit README presents Passkey Kit as maintained and warns readers to review its contract, SDK, and caveats before holding meaningful value
  - current stellar/smart-account-kit and OpenZeppelin Stellar account documentation establish a sibling, non-drop-in context-rule/auth-digest/policy model rather than a universal successor
  - Solo scratchpad 575 GT-56 sealed blind process 3398, independently reconciled with primary process 3394 only after its 12-row seal
  - 2026-08-05 freshness recheck: stellar/passkey-kit and stellar/smart-account-kit are maintained, non-drop-in siblings; former kalepail repositories are archived move pointers
  - upstream issue remains open and needs its stale filed premise corrected while retaining this model-selection gap: https://github.com/stellar/stellar-docs/issues/2700
  - 2026-08-05 premise correction posted and read back: https://github.com/stellar/stellar-docs/issues/2700#issuecomment-5196210824
  - original combined review context: https://github.com/stellar/stellar-docs/pull/2367#issuecomment-4971409358
  - issue-tracker follow-up context: https://github.com/stellar/stellar-docs/pull/2367#issuecomment-5091971087
recurrences:
  - date: 2026-08-11
    evidence: live smart-wallet and Guestbook source recheck still links archived kalepail/passkey-kit and omits Smart Account Kit, while Guestbook still requires LaunchTube. Issue #2700 remains open; its only recorded comment is Raven's 2026-08-05 premise correction, so no maintainer response exists.
  - date: 2026-08-04
    evidence: eval/qa/results/2026-08-04T22-41-34-variantA.json q-soroban-add-signer-smart-wallet-howto repeated stale filed framing while current canonical READMEs describe sibling authorization models
  - date: 2026-08-06
    evidence: the live smart-wallet guide still links the archived https://github.com/kalepail/passkey-kit move pointer instead of the canonical https://github.com/stellar/passkey-kit repository
---

## Finding

The current Stellar smart-wallet guide routes a greenfield reader to Passkey
Kit without presenting the separate Smart Account Kit authorization model.
Both kits are currently maintained sibling projects, not a legacy/successor
pair and not drop-in compatible: Passkey Kit uses its flat `Signatures` model,
while Smart Account Kit builds on OpenZeppelin context rules, auth digests,
signers, and policies.

The original filing premise expired after the README rewrite and repository
transfer. The remaining documentation gap is model selection and
component-specific review scope. This remains distinct from
`sd-027`, which concerns the discontinued LaunchTube submitter and indexing
role.

The still-open upstream issue predates that correction. It therefore remains
the upstream tracker, but its premise must be amended rather than copied into
a fix.

## Evidence

The 2026-08-04 recheck compared the current guide, both canonical repositories,
and OpenZeppelin account documentation. The direct reproduction URLs are:

- https://developers.stellar.org/docs/build/guides/contract-accounts/smart-wallets
- https://github.com/stellar/passkey-kit
- https://github.com/stellar/smart-account-kit
- https://docs.openzeppelin.com/stellar-contracts/accounts/smart-account

## Recommendation

Present Passkey Kit and Smart Account Kit as current, separate choices and give
the shortest model-selection boundary: flat multi-signer `Signatures` versus
OpenZeppelin context-rule/auth-digest/policy authorization. Link both canonical
repositories, carry their current review/caveat language, and state audit scope
per exact artifact/release rather than implying the SDK, relayer, indexer,
frontend, policies, and deployment inherit one contract review.
