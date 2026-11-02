---
id: ll-038
service: lumenloop
status: verified
discovered: 2026-11-02
upstreamTitle: The xbull directory record lists Android and iOS apps that are no longer available
evidence:
  - "2026-11-02T18:33:49Z authenticated POST https://api.lumenloop.com/v1/tools/get_project with {\"slug\":\"xbull\"}: description \"... It supports multiple platforms, including web browsers, Android, and iOS devices, enabling users to send, receive, and swap assets seamlessly.\""
  - "2026-11-02T18:34:09Z committed record https://github.com/lumenloop/stellar-ecosystem-db/blob/main/projects/xbull.yaml (blob 0e8729b720, last commit 461a4a40df on 2026-06-29) carries the same sentence on line 4"
  - "2026-11-02T18:34:09Z https://apps.apple.com/us/app/xbull-wallet/id6705122563 returned HTTP 404, and https://itunes.apple.com/lookup?id=6705122563 returned resultCount 0. https://play.google.com/store/apps/details?id=app.xbull.wallet and id=app.xbull.mobile each returned HTTP 404"
  - "2026-11-02 operator site https://xbull.app/ (HTTP 200) offers the web wallet and the Chrome extension. It says \"Passkeys and a new interface are coming with xBull Wallet v2\" and has no App Store or Google Play link"
  - "2026-11-02T18:34:09Z GET https://stellarlight.xyz/api/projects/search?q=xbull (class C aggregator, not independent proof): \"Its formerly listed iOS and Android store apps are no longer available on either app store (store listings checked 2026-07-13).\""
  - "Affected golden case: eval/qa/corpus/battery/retail-consumer/q-eco-xbull-wallet.json (truth.verified 2026-11-02). Its notes say that the Lumenloop Android and iOS platform claim is stale"
---

## Finding

The Lumenloop directory record `xbull` says that xBull Wallet supports "web
browsers, Android, and iOS devices". The Android and iOS apps are no longer
available.

The App Store listing returns HTTP 404. The iTunes lookup for the same app ID
returns no result. Both Google Play package pages return HTTP 404. The operator
site offers only the web wallet and the Chrome extension.

An agent that reads the record can tell a user to install xBull from a phone
app store. That instruction fails.

## Evidence

The live call ran on 2026-11-02 with a read-only request.
`POST /v1/tools/get_project` with `{"slug":"xbull"}` returned this text:

```text
It supports multiple platforms, including web browsers, Android, and iOS
devices, enabling users to send, receive, and swap assets seamlessly.
```

The committed source is `projects/xbull.yaml` in
`lumenloop/stellar-ecosystem-db`. It carries the same sentence.

| Store URL | Result on 2026-11-02 |
|---|---|
| `https://apps.apple.com/us/app/xbull-wallet/id6705122563` | HTTP 404 |
| `https://itunes.apple.com/lookup?id=6705122563` | `resultCount` 0 |
| `https://play.google.com/store/apps/details?id=app.xbull.wallet` | HTTP 404 |
| `https://play.google.com/store/apps/details?id=app.xbull.mobile` | HTTP 404 |

## Recommendation

Change the description in `projects/xbull.yaml`. Name the web wallet and the
browser extension as the current platforms. Remove Android and iOS.

Add the store apps back when a live store listing exists again.
