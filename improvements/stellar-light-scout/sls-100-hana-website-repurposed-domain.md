---
id: sls-100
service: stellar-light-scout
status: verified
discovered: 2026-11-02
upstreamTitle: "Hana wallet website link now redirects to an unrelated remittance service"
probe:
  type: http-text
  url: https://stellarlight.xyz/api/projects/search?q=hana&limit=3
  expect:
    status: 200
    contains:
      - "\"website\":\"https://hana.money/\""
evidence:
  - "2026-11-02T17:18Z live GET https://stellarlight.xyz/api/projects/search?q=hana&limit=3 returned row slug hana, name Hana, status Live, statusBasis human-verified, statusAsOf 2026-08-28, statusSourceUrl 'https://www.hana.money/', links.website 'https://hana.money/', twitter 'https://x.com/hanawallet'. lifecycle.note: 'live wallet app; hanawallet.io 308s to hana.money (WEBSITE_FIXES moves the row)'."
  - "2026-11-02T17:19Z curl -sSI https://hana.money/ and https://www.hana.money/ both returned HTTP/2 307 with location https://www.wendmoney.com.au/. The destination title is 'Wend | Send money to GCash or Maya in minutes'."
  - "2026-11-02T17:19Z curl -sSI https://hanawallet.io/ returned HTTP 308 to https://www.hanawallet.io/, which returned HTTP 200 with title 'Hana | Non-Custodial Multi-Chain Crypto Wallet'. The redirect direction recorded in lifecycle.note has reversed."
  - "The same row's shortDescription says dApps connect 'via Stellar Wallets Kit and the Freighter API'; the Freighter rename is tracked separately in sls-095."
  - "Dedupe 2026-11-02: resolved sls-028 (2026-07-14, Stellar-Light/stellarlight#515) fixed stale or repurposed project links for IRL, SNNAC, Blue Marble, and Octoplace. This is a new instance of that class on a different row, so it takes a new id and cites the resolved ledger entry. GitHub search repo:Stellar-Light/stellarlight hana.money returned 0 results."
  - "Golden consumer: eval/qa/corpus/battery case q-eco-hana-wallet-scf records the redirects as class F evidence."
---

## Finding

The Hana project row links to `https://hana.money/` for both the website and the status source.
That domain now returns HTTP 307 to `https://www.wendmoney.com.au/`, a remittance service named Wend.
The Hana wallet now lives at `https://www.hanawallet.io/`.
The row's `lifecycle.note` says the opposite redirect: "hanawallet.io 308s to hana.money".
A reader who follows the link lands on an unrelated product.

## Evidence

Read-only reproduction:

```sh
curl -sS 'https://stellarlight.xyz/api/projects/search?q=hana&limit=3'
curl -sSI https://hana.money/ | grep -i '^location'
curl -sSIL https://hanawallet.io/ | grep -i '^\(HTTP\|location\)'
```

On 2026-11-02 `hana.money` returned `location: https://www.wendmoney.com.au/`.
The destination title was "Wend | Send money to GCash or Maya in minutes".
`hanawallet.io` returned 308 to `www.hanawallet.io`, titled "Hana | Non-Custodial Multi-Chain Crypto Wallet".

## Recommendation

Set `links.website` and `statusSourceUrl` to `https://www.hanawallet.io/`.
Update the `lifecycle.note` to the current redirect direction.
Re-verify the Live status against the new domain.
Apply the site-liveness check from the earlier repurposed-link fix to detect cross-domain redirects to a different product.
