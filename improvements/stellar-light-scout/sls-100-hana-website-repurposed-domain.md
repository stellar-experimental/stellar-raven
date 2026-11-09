---
id: sls-100
service: stellar-light-scout
status: fixed-upstream
discovered: 2026-11-02
upstreamTitle: "Hana wallet links point to a domain that redirects to the Wend remittance product"
probe:
  type: http-text
  url: https://stellarlight.xyz/api/projects/search?q=hana&limit=3
  expect:
    status: 200
    contains:
      - "\"website\":\"https://hana.money/\""
evidence:
  - "2026-11-09T20:31:56Z deployed fix verified: Hana project website hanawallet.io, status source www.hanawallet.io and corrected lifecycle note; adjacent partner hana-wallet website www.hanawallet.io. Curl-followed wallet domain returns the Hana wallet title, while both old hana.money domains still redirect to Wend. Current source STATUS_FIX.hana, WEBSITE_FIXES.hana and partner URL_CORRECTIONS all use hanawallet.io. theboycoder reports both project/partner executes on 2026-11-07 at https://github.com/Stellar-Light/stellarlight/issues/1911#issuecomment-6701317262. Author-side fixed candidate. Receipts: tmp/lane-scout.md, tmp/scout-live-curl.json, tmp/scout-extra.json."
  - "2026-11-02T17:18Z live GET https://stellarlight.xyz/api/projects/search?q=hana&limit=3 returned row slug hana, name Hana, status Live, statusBasis human-verified, statusAsOf 2026-08-28, statusSourceUrl 'https://www.hana.money/', links.website 'https://hana.money/', twitter 'https://x.com/hanawallet'. lifecycle.note: 'live wallet app; hanawallet.io 308s to hana.money (WEBSITE_FIXES moves the row)'."
  - "2026-11-02T17:19Z curl -sSI https://hana.money/ and https://www.hana.money/ both returned HTTP/2 307 with location https://www.wendmoney.com.au/. The destination title is 'Wend | Send money to GCash or Maya in minutes'."
  - "2026-11-02T17:19Z curl -sSI https://hanawallet.io/ returned HTTP 308 to https://www.hanawallet.io/, which returned HTTP 200 with title 'Hana | Non-Custodial Multi-Chain Crypto Wallet'. The redirect direction recorded in lifecycle.note has reversed."
  - "The same row's shortDescription says dApps connect 'via Stellar Wallets Kit and the Freighter API'; the Freighter rename is tracked separately in sls-095."
  - "Golden consumer: eval/qa/corpus/battery case q-eco-hana-wallet-scf records the redirects as class F evidence."
  - "2026-11-02T22:37Z recheck: curl -sS 'https://stellarlight.xyz/api/projects/search?q=hana&limit=100' returned HTTP 200. Hana retains links.website https://hana.money/, statusSourceUrl https://www.hana.money/, and lifecycle.note 'live wallet app; hanawallet.io 308s to hana.money (WEBSITE_FIXES moves the row)'. The 2026-11-02T22:41Z command curl -sS https://stellarlight.xyz/api/partners/hana-wallet returned HTTP 200 with websiteUrl https://hana.money."
  - "2026-11-02T22:37Z redirect check: curl -sS -D - -o /dev/null https://hana.money/ and the www equivalent returned HTTP 307 to https://www.wendmoney.com.au/. The destination returned HTTP 200, title 'Wend | Send money to GCash or Maya in minutes'. curl -sS -D - -o /dev/null https://hanawallet.io/ returned HTTP 308 to https://www.hanawallet.io/. That destination returned HTTP 200, title 'Hana | Non-Custodial Multi-Chain Crypto Wallet'. The first changed-redirect date is unknown."
  - "2026-11-02 adjacent check: rg -n 'hana.money|hanawallet' over upstream scripts/data/curation-maps.ts and scripts/data/curate-partners.ts at 1388bdd79b3151208d2be3ce0117316c0bc9694b found the old domain in STATUS_FIX.hana, WEBSITE_FIXES.hana, and URL_CORRECTIONS[hana-wallet]. The finding now requests correction of all three repeated source values and both live records. No dependency-bound broken snippet is alleged."
  - "2026-11-02 dedupe: gh search issues Hana and gh search prs Hana, each with --repo Stellar-Light/stellarlight and --state open/closed, found no correction for the current Wend redirect. Merged #1117 and #1317 retain older Hana source facts; #619 documents the former allowed dual-domain redirect. rg -n -i 'hana.money|hanawallet|Hana.*website' improvements/ found no other active Scout record for this defect. Resolved sls-028 covers different project rows; this is a new affected row."
  - "2026-11-02 owner check: improvements/intake.json resolves this API finding to Stellar-Light/stellarlight. gh api repos/Stellar-Light/stellarlight confirms archived false and has_issues true. No override is needed."
  - upstream issue filed 2026-11-02: https://github.com/Stellar-Light/stellarlight/issues/1911
recurrences:
  - date: 2026-11-06
    evidence: "Hana project search; `/api/partners/hana-wallet`; hana.money/www.hana.money/hanawallet.io/www.hanawallet.io — Still-repro. Project website hana.money, statusSource www.hana.money, old redirect note; partner website hana.money. Both old domains end at Wend; www.hanawallet.io returns200 Hana wallet. Bare hanawallet.io receipt is308, not mistaken for wallet content. Next: Keep. Next after project and partner jobs: verify all website/status/note values and destination title; no single-record partial retirement. Ledger: .agents/rounds/2026-11-05-truth-maintenance/scout.md."
---

## Finding

The Hana project website and status source point to a domain that redirects to the Wend remittance product.
`https://hana.money/` and `https://www.hana.money/` return HTTP 307 to `https://www.wendmoney.com.au/`.
The Hana wallet website responds at `https://www.hanawallet.io/`.
The project note records the old redirect direction.
The `hana-wallet` partner record also links to `https://hana.money`.
Readers who follow these links reach a different product.

## Evidence

Read-only reproduction:

```sh
curl -sS 'https://stellarlight.xyz/api/projects/search?q=hana&limit=100'
curl -sS https://stellarlight.xyz/api/partners/hana-wallet
curl -sS -D - -o /dev/null https://hana.money/
curl -sS -D - -o /dev/null https://www.hana.money/
curl -sS -D - -o /dev/null https://hanawallet.io/
curl -sS https://www.hanawallet.io/
curl -sS https://www.wendmoney.com.au/
```

The live check at 2026-11-02T22:37Z returned HTTP 200 for the project search.
The Hana row retained `links.website: "https://hana.money/"` and `statusSourceUrl: "https://www.hana.money/"`.
Its `lifecycle.note` retained "hanawallet.io 308s to hana.money".
The partner detail check returned HTTP 200 with `websiteUrl: "https://hana.money"`.

Both `hana.money` URLs returned HTTP 307 to `https://www.wendmoney.com.au/`.
The destination returned HTTP 200 with the title "Wend | Send money to GCash or Maya in minutes".
`https://hanawallet.io/` returned HTTP 308 to `https://www.hanawallet.io/`.
That destination returned HTTP 200 with the title "Hana | Non-Custodial Multi-Chain Crypto Wallet".
These results distinguish the products; they do not establish a corporate ownership change.
The date when the redirect changed remains unknown.

The source repeats the old domain in `STATUS_FIX.hana`, `WEBSITE_FIXES.hana`, and `URL_CORRECTIONS["hana-wallet"]`.
A data correction must also update those source values.
Otherwise, a later curation run can restore the wrong domain.

## Recommendation

Set `links.website` and `statusSourceUrl` to `https://www.hanawallet.io/`.
Set the `hana-wallet` partner `websiteUrl` to that domain.
Update `STATUS_FIX.hana`, `WEBSITE_FIXES.hana`, and `URL_CORRECTIONS["hana-wallet"]` before applying the data correction.
Replace the old redirect note with the current checked route.
Recheck the Live status against the wallet website.
Optionally, extend the existing domain checks to flag redirects to a different product.
