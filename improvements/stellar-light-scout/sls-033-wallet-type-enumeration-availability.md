---
id: sls-033
service: stellar-light-scout
status: reported-upstream
discovered: 2026-07-10
evidence:
  - paginated q=wallet returned 164 keyword rows but independent exact raw-type projections returned 60 and then 59 Wallet-typed records within one hour
  - later snapshot contained 54 Live, 1 Development, and 4 Inactive rows with duplicate-name Stellar Passport records under different slugs
  - StellarTerm exact project response was typed DEX, not Wallet
  - Solo scratchpad 575 GT-20 primary process 3256 and independent blind process 3257
  - GT-56 recurrence: current wallet comparison required separate end-user wallet, hardware-wallet, connectivity-protocol, Wallet SDK, Wallets Kit, and smart-account-tooling types; directory/module presence did not establish custody, recovery, or capability
  - upstream issue filed 2026-07-13: https://github.com/Stellar-Light/stellarlight/issues/519
recurrences:
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
---

## Finding

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

Add exact structured filters and enumeration metadata:

- `type=Wallet` with server-side exact matching;
- canonical record ID plus duplicate/alias links and default deduplication;
- total/count and complete pagination metadata tied to `generatedAt`;
- separate project lifecycle from per-platform app availability;
- per-platform store URL, last-checked time, and reachable/unavailable state;
- an explicit product kind covering end-user wallet, hardware wallet,
  connectivity protocol, wallet-building SDK, integration kit, and smart-account
  tooling, without collapsing one into another;
- product-specific custody, recovery, platform, and signing-capability source
  fields rather than inferring them from type or module membership;
- explicit warnings when keyword/semantic results are not exact type matches.

Add regression fixtures for StellarTerm (DEX, not Wallet), duplicate Stellar
Passport records, and xBull's directory/store disagreement.
