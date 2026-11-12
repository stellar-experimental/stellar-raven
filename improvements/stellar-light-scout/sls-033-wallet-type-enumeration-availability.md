---
id: sls-033
service: stellar-light-scout
status: reported-upstream
discovered: 2026-07-10
evidence:
  - "2026-11-12 partial fix (PR1945, Scout 1.9.135), distinct review by Codex frontier gpt-6-astra: type=Wallet returns 74 rows, all with productKind; 64 rows carry 123 platform facts and 10 carry a dated availabilityCheck; all 111 available facts have a store URL and date. Still open: 9 of 12 unavailable platform facts (xBull iOS/Android, Scopuly iOS, Lumexo iOS/Android, Empowch Android, OpenZeppelin privacy-wallet web, Interstellar iOS/Android) have storeUrl null and no other source URL. Result posted: https://github.com/Stellar-Light/stellarlight/issues/519#issuecomment-6827190900. Review: research/audits/2026-11-12-truth-maintenance/review-retire-astra.md."
  - "2026-11-09T20:31:58Z GET https://stellarlight.xyz/api/projects/search?type=Wallet&limit=100 returned 74 rows/total74 and 74 distinct normalized names; 11 null productKind, 41 empty availability. Null-kind Live rows: smart-treasury, chainless, amulets, piggy-wallet, ibis, zig3v2, rehive, privy; two Development rows and Inactive mxlet complete the set. Populated available platform facts retain storeUrl/checkedAt. Exact enumeration fixed; metadata coverage residual persists despite closed #519/#742. Unknown availability is not unavailable. Receipts: research/audits/2026-11-09-improvements-sweep/lane-scout.md."
  - "2026-11-06 scope/progress reconciliation: .agents/rounds/2026-11-06-remaining-sweep/other.md, row sls-033; replay arguments and response hashes in research/audits/2026-11-06-remaining-sweep/other-receipt.json."
  - paginated q=wallet returned 164 keyword rows but independent exact raw-type projections returned 60 and then 59 Wallet-typed records within one hour
  - later snapshot contained 54 Live, 1 Development, and 4 Inactive rows with duplicate-name Stellar Passport records under different slugs
  - StellarTerm exact project response was typed DEX, not Wallet
  - Solo scratchpad 575 GT-20 primary process 3256 and independent blind process 3257
  - GT-56 recurrence: current wallet comparison required separate end-user wallet, hardware-wallet, connectivity-protocol, Wallet SDK, Wallets Kit, and smart-account-tooling types; directory/module presence did not establish custody, recovery, or capability
  - upstream issue filed 2026-07-13: https://github.com/Stellar-Light/stellarlight/issues/519
recurrences:
  - date: 2026-11-06
    evidence: "`/api/projects/search?type=Wallet&limit=100`; exact count/dedupe and product-kind/availability projection — Partial. 72 rows, total72, 72 distinct normalized names. 10 null productKind, 39 empty availability. Null kinds include Live smart-treasury, chainless, amulets, piggy-wallet, ibis, rehive, privy; Development haven and openzeppelin-stellar-privacy-wallet; Inactive mxlet. Exact enumeration fixed; coverage remains incomplete. No inference that empty availability means unavailable. Next: Keep residual and update counts. Next: curation signal for the named live wallets; rerun exact type set and compare coverage. Preserve MXlet as unknown absent evidence. Ledger: .agents/rounds/2026-11-05-truth-maintenance/scout.md."
  - date: 2026-07-11
    evidence: GT-56 primary process 3394 and sealed blind process 3398 independently found that Ledger and Trezor must be typed as hardware wallet products while WalletConnect is a connectivity protocol/module, and that current custody/recovery claims require product-specific sources
  - date: 2026-07-14
    evidence: roster cleanup is live but productKind/platform availability remain absent; follow-up https://github.com/Stellar-Light/stellarlight/issues/519#issuecomment-4971408689
  - date: 2026-07-15
    evidence: exact type=Wallet now returns 65 deduplicated names, but 14 rows have null productKind and only 4 expose nonempty availability; residual posted and read back at https://github.com/Stellar-Light/stellarlight/issues/519#issuecomment-4982290425
  - date: 2026-07-30
    evidence: exact type=Wallet returned 62 deduplicated rows with returned=62 and total=62, but MXlet still had null productKind and only 13 rows exposed nonempty availability, leaving 49 without platform availability
  - ref health 2026-07-27: https://github.com/Stellar-Light/stellarlight/issues/519 closed completed 2026-07-14 and the residual verification was posted after closure, so issue 519 no longer tracks the remaining gap; a consolidated successor issue carries it
  - consolidated successor issue filed 2026-07-27 carrying this residual on an open thread: https://github.com/Stellar-Light/stellarlight/issues/742
  - date: 2026-08-11
    evidence: Production API 1.8.41 exact type=Wallet returns 63 of 63 rows, with 2 null productKind values and only 13 rows with nonempty availability; closed #519 remains a partial fix and open #742 still tracks the residual
  - date: 2026-08-28
    evidence: Production API 1.9.1 exact type=Wallet returns 63 rows with 1 null productKind, 33 nonempty availability values, and zero canonicalSlug values. MXlet remains unclassified and 30 wallet rows have no availability. Closed issue #519 and merged PR #540 delivered a partial fix; the residual still reproduces under open #742.
  - date: 2026-09-08
    evidence: Production API 1.9.48 exact type=Wallet returned 71 rows at 2026-09-08T14:33:50.155Z. Nine rows have null productKind, and 38 have empty availability. Response SHA-256 0bd102b62ba26fc9e5b91761bc8915ee72ecda1cd152644696c70696194380e0.
  - date: 2026-09-29
    evidence: The wallet query returned 72 rows. Ten rows lacked productKind and 39 lacked availability. The original metadata coverage gaps remain. Live response snapshot is .agents/rounds/2026-09-29-truth-maintenance/scout-rechecks.json.
---

## Finding

Exact wallet enumeration and name deduplication now work: on 2026-11-06,
`type=Wallet&limit=100` returns 72 rows, `total: 72`, and 72 distinct normalized
names. The residual is metadata coverage: 10 rows have null `productKind`,
and 39 have empty availability. Seven of the null-kind rows are labeled Live
(smart-treasury, chainless, amulets, piggy-wallet, ibis, rehive, privy); two are
Development and MXlet is Inactive. Missing availability means unknown, not
unavailable. Project lifecycle alone does not establish current app availability.

Issues #519 and #742 are closed. Their closure does not complete the remaining
product-kind and source-backed platform coverage. The historical enumeration
failure below is retained as evidence of the original scope, not a current defect.

### Historical discovery — 2026-07-10/11

Scout does not offer a first-class exact-type wallet enumeration with canonical
deduplication and availability semantics. A keyword wallet query returned 164
rows. Independent consumers paging and filtering each raw `types` array saw 60
and then 59 exact Wallet-typed rows within about an hour. The later result also
contained two Stellar Passport rows under different slugs/statuses.

The directory lifecycle label is not application availability. StellarTerm was
currently DEX-typed despite appearing in wallet-oriented semantic results, and
xBull's Live/Android metadata conflicted with a 404 Google Play listing.

GT-56 reproduced the downstream taxonomy failure. A useful current comparison
must distinguish end-user wallet products, Ledger/Trezor hardware wallet
products, WalletConnect as a connectivity protocol/module, wallet-building
SDKs, Creit-Tech Wallets Kit, and passkey/smart-account tooling. A directory or
module row alone does not establish custody, recovery, platform availability,
or support for a particular signing method.

## Evidence

GT-20's primary and blind lanes independently paged the live service on
2026-07-10, recorded their generatedAt times, projected exact Wallet membership,
and sampled operator/app-store evidence. The one-row count disagreement was not
silently resolved; it demonstrates why a frozen count or hand-built roster is
unsafe.

## Recommendation

Preserve the deployed exact `type=Wallet` filter, total/count metadata, and
current deduplication. Curate product-kind and platform-availability coverage
with product-specific sources and observation dates. Keep unknowns explicit,
including MXlet unless new evidence supports classification.

Distinguish end-user wallets, hardware wallets, connectivity protocols,
wallet-building SDKs, integration kits, and smart-account tooling. For known
platform availability, provide the store/operator URL, last-checked time, and
reachable/unavailable state. Custody, recovery, and signing capabilities require
product-specific evidence rather than inference from type or module membership.
Keep the historical duplicate and directory/store cases as dated regression
fixtures; do not reintroduce an already implemented exact-enumeration request.
