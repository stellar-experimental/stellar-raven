---
id: sd-032
service: stellar-docs
status: reported-upstream
discovered: 2026-07-11
upstreamTitle: Avoid stale incompatible Flutter wallet SDK version pins
evidence:
  - stellar/stellar-docs main commit 45770fa8 pins stellar_wallet_flutter_sdk ^1.0.6 and stellar_flutter_sdk ^2.1.3 in the English and Spanish wallet tutorial snippets
  - pub.dev API reported stellar_wallet_flutter_sdk 1.1.3 published 2026-06-24 with stellar_flutter_sdk ^3.2.0 as its dependency
  - pub.dev API reported stellar_flutter_sdk 3.2.1 published 2026-06-28
  - rechecked 2026-07-14: both current tutorial translations still pin ^1.0.6 with ^2.1.3; pub.dev reports wallet SDK 1.1.3 with stellar_flutter_sdk ^3.2.0 and standalone stellar_flutter_sdk 3.3.0
  - Solo scratchpad 575 GT-55 pre-read-sealed blind process 3393 and author repro process 3397
  - upstream issue filed 2026-07-14: https://github.com/stellar/stellar-docs/issues/2606
  - scope correction 2026-07-27 accepting maintainer triage https://github.com/stellar/stellar-docs/issues/2606#issuecomment-5035734827: pub backtracks to wallet SDK 1.0.7 and resolves, so this is silent staleness rather than a hard dependency conflict, and the Spanish half is moot because i18n was removed in https://github.com/stellar/stellar-docs/pull/2410
recurrences:
  - date: 2026-08-11
    evidence: live main source still pins stellar_wallet_flutter_sdk ^1.0.6 with stellar_flutter_sdk ^2.1.3. Issue #2606 remains open; the latest maintainer comment is ElliotFriend's 2026-07-21 silent-staleness classification and update-sdk-examples routing.
---

## Finding

The current Flutter Wallet SDK tutorial pins this pair:

```yaml
stellar_wallet_flutter_sdk: ^1.0.6
stellar_flutter_sdk: ^2.1.3
```

As of 2026-07-14, pub.dev reports wallet SDK 1.1.3 and general SDK 3.3.0, so
the pins are roughly a year stale. Wallet SDK 1.1.3 declares
`stellar_flutter_sdk: ^3.2.0`, which cannot satisfy the tutorial's explicit
`^2.1.3` constraint — but pub resolves the block anyway by backtracking to
wallet SDK 1.0.7. The reader therefore silently gets a year-old wallet SDK
rather than a hard failure. This is silent staleness, not a broken snippet.

## Evidence

The current docs source, live pub.dev package metadata, and Soneso repositories
independently reproduce the mismatch. The tutorial's “get the latest version”
link does not make the pasted two-line dependency block coherent.

The Spanish translation originally cited here is moot: i18n was removed
upstream in #2410. No existing Stellar Docs finding covers dependency drift in
tutorial snippets.
`sd-006` covered crawler code-block visibility, not whether the indexed/source
snippet is installable.

## Recommendation

Handle this in the existing `update-sdk-examples` refresh flow rather than as a
one-off edit: document the wallet SDK version explicitly and let the general SDK
arrive transitively, so a stale explicit pin cannot silently backtrack the
wallet SDK to a year-old release.
