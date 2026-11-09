---
id: sd-100
service: stellar-docs
status: reported-upstream
discovered: 2026-11-09
upstreamTitle: Update the repeated ledger-close estimates on the USDT0 launch page
evidence:
  - "2026-11-09 sweep (still-repro): Light check: live USDT0 page still contains both 5–7 seconds and 5–7s estimates; linked Stellar Stack says about every5seconds. Issue3078 has new bot-authored PR3080, OPEN/BLOCKED/REVIEW_REQUIRED, eight successful head checks, no reviews. Recheck: https://developers.stellar.org/launch/usdt0.md; https://developers.stellar.org/docs/learn/fundamentals/stellar-stack.md Upstream candidate https://github.com/stellar/stellar-docs/pull/3080 (read directly)."
  - "2026-11-09 live GET https://developers.stellar.org/launch/usdt0.md contains 'Stellar finalises in 5–7 seconds' and a 'Stellar settlement' value of '5–7s'. Markdown SHA256: 750e9401e3b292bbe52af15bec9133f4938440929f7daa6b9bddbeb53b178e22. The live HTML contains both claims too."
  - "2026-11-09 live GET https://developers.stellar.org/docs/learn/fundamentals/stellar-stack.md says 'about every 5 seconds', with a configurable-target caveat. SHA256: eb896b368c86eff88e9b8bef31fe38f410432738ace4106405a1130136ef655e."
  - "2026-11-09 GET https://horizon.stellar.org/ledgers?order=desc&limit=200: Mainnet ledgers 65392850–65393049, Protocol 29, give 199 close-time deltas of 5 seconds; mean 5.000 seconds. This sample does not guarantee every interval."
  - "Source: https://github.com/stellar/stellar-docs/blob/f83baf27c91fdbc54c04872aba603b73d9cd9469/snippets/usdt0-launch.jsx lines 778 and 836."
  - "Successor of sd-054, whose resolution is recorded in improvements/resolved.json. Independent author and reviewer reads on 2026-11-09 confirmed both live repetitions."
  - upstream issue filed 2026-11-09: https://github.com/stellar/stellar-docs/issues/3078
probe:
  type: http-text
  url: https://developers.stellar.org/launch/usdt0.md
  expect:
    status: 200
    contains:
      - "Stellar finalises in 5–7 seconds"
      - "[5–7s]("
recurrences:
  - date: 2026-11-09
    evidence: "Light check: live USDT0 page still contains both 5–7 seconds and 5–7s estimates; linked Stellar Stack says about every5seconds. Issue3078 has new bot-authored PR3080, OPEN/BLOCKED/REVIEW_REQUIRED, eight successful head checks, no reviews."
---

## Finding

The USDT0 launch page repeats an older ledger-close estimate in two places.
Its FAQ says Stellar finalises in “5–7 seconds”.
Its settlement table says “5–7s” and links to the Stellar Stack page.
That linked page now says “about every 5 seconds” and explains the configurable target.

This is a precision update, not a mathematical contradiction.
Five seconds remains inside the older range.
Readers should receive the same current estimate from the launch page and its linked explanation.

## Evidence

The live Markdown and HTML both retain the two estimates on 2026-11-09.
The corresponding source is `snippets/usdt0-launch.jsx`, lines 778 and 836.
The Stellar Stack and Validators pages already contain the corrected estimate.
Those two pages were the original scope of sd-054.
The earlier two-page correction is recorded under sd-054 in [Raven's resolution ledger](https://github.com/stellar-experimental/stellar-raven/blob/main/improvements/resolved.json).

The fresh Horizon sample contains 199 five-second consensus-close intervals.
It supports an approximate estimate, not a permanent constant or an individual-ledger guarantee.

## Recommendation

Update both launch-page estimates to about five seconds.
Keep the settlement table linked to the Stellar Stack explanation.
Preserve the distinction between a configurable target and an individual ledger's actual close time.
