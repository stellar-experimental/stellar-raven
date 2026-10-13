---
id: sd-034
service: stellar-docs
status: fixed-upstream
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
  - "2026-10-13 upstream state: https://github.com/stellar/stellar-docs/pull/2837 merged at 2026-10-12T20:37:44Z by ElliotFriend (merge commit 2dd75fef3ea318d19cf8af8a261a2a37c4701982, head 0c20e720138eb126c37dab3336501b16751d1d2f; approvals xw-dd 2026-09-15 and kaankacar 2026-10-07; review decision APPROVED). Its final commit is titled docs: describe passkey-kit as a sibling of smart-account-kit and refs #2700. The PR body says Closes #2700. https://github.com/stellar/stellar-docs/issues/2700 closed as completed at 2026-10-12T20:37:45Z with no maintainer comment."
  - "2026-10-13 deployment: the Build and push stellar-docs run https://github.com/stellar/stellar-docs/actions/runs/38305457471 for 2dd75fef succeeded at 2026-10-12T20:42:52Z. stellar-docs main b3cb1c5a642e092f90e7bef242ebfe6885a58006 (2026-10-13T15:22:58Z) is two commits ahead of the merge commit; neither commit touches docs/build/guides/contract-accounts/smart-wallets.mdx. Its run https://github.com/stellar/stellar-docs/actions/runs/38421582672 succeeded at 2026-10-13T15:27:28Z."
  - "2026-10-13T16:13:13Z live recheck of https://developers.stellar.org/docs/build/guides/contract-accounts/smart-wallets (HTTP 200; last-modified Tue, 13 Oct 2026 15:26:16 GMT; response SHA-256 72dc8d81c99522f1d7e900e6d1fe0223d8d724758a7b38908e40d0d6eebbc0c9; 70186 bytes): kalepail/passkey-kit 0 (2 on 2026-10-06), github.com/stellar/passkey-kit 2, github.com/stellar/smart-account-kit 2, predecessor 0, successor 0, legacy 0. The Client SDKs section presents the two kits as siblings that are not drop-in compatible: Smart Account Kit drives OpenZeppelin Smart Account contracts through context rules, signers, and policies; Passkey Kit authorizes with a flat map of signatures. The Passkey Kit entry quotes its repository statement that the wallet contract and SDKs have not been independently audited. The page makes no other audit claim, so no stack-wide audit is implied. The original trigger no longer reproduces."
  - "2026-10-13 adjacent scan: https://developers.stellar.org/docs/build/apps/guestbook/overview (last-modified Tue, 13 Oct 2026 15:26:14 GMT; SHA-256 3af13231c4446ffbf0b94b7decb8fcf05d32e98e351c61ae2970cfbc52dd6416) names passkey-kit as a sibling SDK and links the smart-wallets Client SDKs section, with no archived link and no audit claim. The only remaining kalepail/passkey-kit link under docs/ in stellar/stellar-docs is the code-credit sentence at docs/build/guides/auth/check-auth-tutorials.mdx line 617 (live page SHA-256 4430d66101451349065762e37b290b33371069a7ba1c2df78adbe3794daa1c86), which is outside this finding's surface; meetings/2024-06-13.mdx and meetings/2024-07-18.mdx are dated notes. Recommendation 4 is met by the absence of any stack-wide audit claim, not by a per-release audit statement. No successor finding is filed."
  - "2026-10-13 inbound handoff: https://github.com/stellar-experimental/stellar-raven/issues/275 (author ElliotFriend, who also authored PR 2837; created 2026-10-12T20:47:13Z) claimed the fix. Every marker in its table reproduced in the 2026-10-13 live recheck. The handoff is a signal; the recheck above is the evidence."
  - "status moved to fixed-upstream on 2026-10-13 by the author lane. The distinct reviewer re-derivation, the #2700 resolution comment, the #275 acknowledgment, the golden case eval/qa/corpus/battery/tooling-infra/q-tool-smart-wallet-repos-discovery.json verified refresh, and the resolver run are tracked in .agents/rounds/2026-10-13-improvements-followup.md"
recurrences:
  - date: 2026-09-08
    evidence: Live smart-wallet guidance still names only Passkey Kit and links the archived kalepail/passkey-kit move pointer; response SHA-256 a31347abd00f32d9558c3ceeaa543acb81ab5a38996e3c4fc3deb9132ece111b. PR #2367 restarted at head bdc081d9c25d2e2db6f674b8b61421a4f2bf32cd with passing checks and canonical kit links on its branch, but the combined six-page tutorial remains at bot:needs-decision after its author selected the current ElliotFriend companion: https://github.com/stellar/stellar-docs/pull/2367#issuecomment-5587369224. Issue #2700 remains open.
  - date: 2026-08-14
    evidence: "Live recheck of https://developers.stellar.org/docs/build/guides/contract-accounts/smart-wallets. The page still omits Smart Account Kit and still links 'Code: github.com/kalepail/passkey-kit', which is archived and titled '[MOVED -> github.com/stellar/passkey-kit]'. The served skill defect was repaired and retired as sk-017 in improvements/resolved.json. The Docs defect remains independent."
  - date: 2026-08-11
    evidence: live smart-wallet and Guestbook source recheck still links archived kalepail/passkey-kit and omits Smart Account Kit, while Guestbook still requires LaunchTube. Issue #2700 remains open; its only recorded comment is Raven's 2026-08-05 premise correction, so no maintainer response exists.
  - date: 2026-08-04
    evidence: eval/qa/results/2026-08-04T22-41-34-variantA.json q-soroban-add-signer-smart-wallet-howto repeated stale filed framing while current canonical READMEs describe sibling authorization models
  - date: 2026-08-06
    evidence: the live smart-wallet guide still links the archived https://github.com/kalepail/passkey-kit move pointer instead of the canonical https://github.com/stellar/passkey-kit repository
  - date: 2026-10-06
    evidence: "Live https://developers.stellar.org/docs/build/guides/contract-accounts/smart-wallets returned HTTP 200. It contains five Passkey Kit matches, two kalepail/passkey-kit links, and no Smart Account Kit match. PR 2367 closed unmerged on 2026-09-09; ElliotFriend named PR 2837 as its replacement. PR 2837 is open at head 108ba24e0884f46e0c543996e4e94be754709840 with nine passing checks, one approval (xw-dd, 2026-09-15), and review decision REVIEW_REQUIRED. The finding status does not change."
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
