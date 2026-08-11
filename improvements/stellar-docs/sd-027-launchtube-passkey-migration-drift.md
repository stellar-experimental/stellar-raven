---
id: sd-027
service: stellar-docs
status: reported-upstream
discovered: 2026-07-11
evidence:
  - official OpenZeppelin Relayer page says LaunchTube is discontinued and directs users to OpenZeppelin
  - official Guestbook passkeys prerequisites page still instructs users to obtain and configure a LaunchTube JWT
  - archived LaunchTube source and current Zephyr/Mercury sources confirm submission versus indexing are separate roles
  - Solo scratchpad 575 GT-53 primary process 3372 and independent blind process 3378
  - 2026-07-14 combined review request on the then-green successor PR: https://github.com/stellar/stellar-docs/pull/2367#issuecomment-4971409358
  - ref health 2026-07-27: PR 2367 is a third-party branch (author AshFrancis), is now mergeable=CONFLICTING, and has had no activity since 2026-07-14, so the 2026-07-14 "CI is green" observation no longer holds and that PR is not a reliable tracker for this finding
  - standalone upstream issue filed 2026-07-27 after PR 2367 stalled: https://github.com/stellar/stellar-docs/issues/2700; its LaunchTube migration scope remains current, while its former joint sd-034 legacy/successor premise now needs correction
  - PR-state follow-up posted and read back 2026-07-27: https://github.com/stellar/stellar-docs/pull/2367#issuecomment-5091971087
recurrences:
  - date: 2026-08-11
    evidence: live Guestbook source and indexed-page recheck still requires a LaunchTube JWT and links the archived kalepail/passkey-kit move pointer. Issue #2700 remains open; PR #2367 remains open, conflicting, and awaiting ElliotFriend review despite successful last-run checks. Both recorded PR comments are authored by Raven.
---

## Finding

Current Stellar developer documentation gives incompatible greenfield guidance
for the passkey smart-wallet stack. The OpenZeppelin Relayer page says
LaunchTube is discontinued and replaced for transaction submission, while the
still-published Guestbook prerequisites page requires a LaunchTube JWT without
a legacy or migration warning.

The pages also leave the replacement boundary implicit: OpenZeppelin replaces
LaunchTube's submission/sponsorship role, not Mercury/Zephyr's indexing and
reverse-lookup role. Consumers can therefore follow a legacy credential path
or incorrectly remove the indexer when migrating the submitter.

## Recommendation

Mark the Guestbook LaunchTube path as historical or update it to a maintained
submitter. Add one migration table that separates client-side passkey signing,
transaction submission/fee sponsorship, and indexing/reverse lookup; name the
current maintained option for each role and date any hosted-service status.
Cross-link that table from both the Guestbook and OpenZeppelin Relayer pages.
