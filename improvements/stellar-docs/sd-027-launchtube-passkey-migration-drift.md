---
id: sd-027
service: stellar-docs
status: fixed-upstream
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
  - "2026-10-13 upstream state: https://github.com/stellar/stellar-docs/pull/2837 merged at 2026-10-12T20:37:44Z by ElliotFriend (merge commit 2dd75fef3ea318d19cf8af8a261a2a37c4701982, head 0c20e720138eb126c37dab3336501b16751d1d2f; approvals xw-dd 2026-09-15 and kaankacar 2026-10-07; review decision APPROVED). The PR body says Closes #2700. https://github.com/stellar/stellar-docs/issues/2700 closed as completed at 2026-10-12T20:37:45Z. No maintainer comment exists on #2700; its only comment is Raven's 2026-08-05 premise correction."
  - "2026-10-13 deployment: the Build and push stellar-docs run https://github.com/stellar/stellar-docs/actions/runs/38305457471 for 2dd75fef succeeded at 2026-10-12T20:42:52Z. stellar-docs main b3cb1c5a642e092f90e7bef242ebfe6885a58006 (2026-10-13T15:22:58Z) is two commits ahead of the merge commit; neither commit touches the Guestbook, smart-wallets, or Relayer pages. Its run https://github.com/stellar/stellar-docs/actions/runs/38421582672 succeeded at 2026-10-13T15:27:28Z."
  - "2026-10-13T16:13:13Z live recheck of https://developers.stellar.org/docs/build/apps/guestbook/passkeys-prerequisites (HTTP 200; last-modified Tue, 13 Oct 2026 15:26:14 GMT; response SHA-256 c3ff53d1f9bf0acad20a321cfe53facfdf4fa1386572fc4d52cd2296fbcf7281; 67076 bytes; footer Last updated on Oct 12, 2026 by Elliot Voris): LaunchTube matches 0 (30 on 2026-10-06), kalepail/passkey-kit 0, Zephyr 0, Smart Account Kit 3, OpenZeppelin Relayer 6, channels.openzeppelin.com/testnet/gen 4. The only JWT match is the sentence no JWT to fetch, which describes the public indexer. The page requires one OpenZeppelin Relayer (Channels) Testnet API key. Its note states that the relayer handles submission and fee sponsorship and the indexer (Mercury hosted smart-account-indexer) handles the credential-to-address lookup. The page links /docs/build/guides/contract-accounts/smart-wallets and /docs/tools/openzeppelin-relayer. The original trigger no longer reproduces."
  - "2026-10-13T16:13:13Z live recheck of https://developers.stellar.org/docs/build/guides/contract-accounts/smart-wallets (last-modified Tue, 13 Oct 2026 15:26:16 GMT; SHA-256 72dc8d81c99522f1d7e900e6d1fe0223d8d724758a7b38908e40d0d6eebbc0c9): a Retired tooling section says the stellar/launchtube repository is archived and the hosted service is retired, and names OpenZeppelin Relayer as the replacement."
  - "2026-10-13 residual note, not a defect: recommendation 2 shipped as prose on the prerequisites page, not as a table. Recommendation 3 is partial. https://developers.stellar.org/docs/tools/openzeppelin-relayer (last-modified Tue, 13 Oct 2026 15:26:40 GMT; SHA-256 bfe350bc5d6aa191881f7be57c15995bdcffb21cab884a0cf68d87bcbcd88879) still says LaunchTube is discontinued, which now agrees with the Guestbook, but it does not link the role breakdown; docs/tools/openzeppelin-relayer.mdx was not in PR 2837. The remaining LaunchTube mentions in stellar/stellar-docs outside the two fixed pages are meetings/2024-06-13.mdx, meetings/2026-07-30.mdx, and the Relayer page sentence above. No successor finding is filed; the omission is editorial and no page contradicts another."
  - "2026-10-13 inbound handoff: https://github.com/stellar-experimental/stellar-raven/issues/276 (author ElliotFriend, who also authored PR 2837; created 2026-10-12T20:47:14Z) claimed the fix. Every marker in its table reproduced in the 2026-10-13 live recheck. The handoff is a signal; the recheck above is the evidence."
  - "status moved to fixed-upstream on 2026-10-13 by the author lane. The distinct reviewer re-derivation, the #2700 resolution comment, the #276 acknowledgment, and the resolver run are pending; see .agents/rounds/2026-10-13-improvements-followup.md"
recurrences:
  - date: 2026-09-08
    evidence: Live Guestbook prerequisites still require a LaunchTube JWT; response SHA-256 657c65c9ba51fbce9868a85af453daa3def3856192822dedc929278b15b35ee6. PR #2367 restarted at head bdc081d9c25d2e2db6f674b8b61421a4f2bf32cd with passing checks, but its current tutorial still targets Smart Account Kit 0.2.x behavior and Cloudflare Pages while the selected ElliotFriend companion uses 0.6.2 and Vercel. The author confirmed the companion choice, and the triage bot left the PR at bot:needs-decision: https://github.com/stellar/stellar-docs/pull/2367#issuecomment-5587369224. Issue #2700 remains open.
  - date: 2026-08-11
    evidence: live Guestbook source and indexed-page recheck still requires a LaunchTube JWT and links the archived kalepail/passkey-kit move pointer. Issue #2700 remains open; PR #2367 remains open, conflicting, and awaiting ElliotFriend review despite successful last-run checks. Both recorded PR comments are authored by Raven.
  - date: 2026-10-06
    evidence: "Live https://developers.stellar.org/docs/build/apps/guestbook/passkeys-prerequisites returned HTTP 200. It contains 30 LaunchTube matches, two kalepail/passkey-kit links, and no Smart Account Kit match. PR 2367 closed unmerged on 2026-09-09; ElliotFriend named PR 2837 as its replacement. PR 2837 is open at head 108ba24e0884f46e0c543996e4e94be754709840 with nine passing checks, one approval (xw-dd, 2026-09-15), and review decision REVIEW_REQUIRED. The finding status does not change."
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
