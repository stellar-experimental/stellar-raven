---
id: sls-095
service: stellar-light-scout
status: verified
discovered: 2026-11-02
upstreamTitle: "Project freighter has no Varial name or alias after the rename, and its website link redirects"
probe:
  type: http-text
  url: https://stellarlight.xyz/api/projects/resolve?q=varial
  expect:
    status: 200
    contains:
      - "\"found\":false"
evidence:
  - "2026-11-02T17:17:35Z live GET https://stellarlight.xyz/api/projects/resolve?q=varial returned HTTP 200 with found false, matchedOn null, current null, searched 1139, and the note 'No project in this directory is named \"varial\". That means it is NOT TRACKED HERE'. Response sha256 ff4f7fd37de62eb3d4dc27844fd37a89e278d61497dfa032ccfdb40cf9a0cb6a."
  - "2026-11-02T17:17:36Z live GET https://stellarlight.xyz/api/projects/search?q=freighter&limit=3 returned row slug freighter, name 'Freighter', aliases null, currentName null, formerNames null, links.website 'https://freighter.app/', status Live, statusAsOf 2026-08-29. The shortDescription begins 'Freighter is the Stellar Development Foundation's official non-custodial Stellar wallet'. Response sha256 6566e0ea69c6a15087b9d2499320ed5627d5881da98edfde289fd4723ecbb7be."
  - "2026-11-02T17:17:37Z live GET https://stellarlight.xyz/api/projects/search?q=varial&limit=5 returned matchMode semantic with unrelated stablecoin rows ars, arst, kes, eurx, brl. No row is the wallet."
  - "2026-11-02T17:18Z curl -sSI https://freighter.app and https://www.freighter.app both returned HTTP/2 301 with location https://varialwallet.com/. The varialwallet.com title is 'Varial | Your Everyday Stellar Wallet'."
  - "Owner source: https://github.com/stellar/freighter/blob/81865843266844ddaec2f0a3b4de64aa64d1b6de/README.md (commit 'Update the README for the Varial rebrand (#3055)', 2026-10-30T17:05:43Z) opens 'Varial (formerly Freighter) is a non-custodial wallet extension' and names the SDK '@stellar/varial-sdk'."
  - "Prevalence: q=freighter returned 6 rows (freighter, hana, latch, the-aha-company, lumenswap, stellar-wallets-kit). All six shortDescriptions name Freighter and none contains Varial. Only the freighter row is an identity defect; the other five are prose references to a renamed product."
  - "Dedupe 2026-11-02: no active or resolved Raven finding covers the Varial rename. Resolved sls-050 (Vesseo/Vibrant) built the alias and currentName mechanism that this row does not use. Resolved sls-094 covers the frieghter typo match, not the rename. GitHub search repo:Stellar-Light/stellarlight varial returned 0 results."
  - "Golden consumers: eval/qa/corpus/battery cases q-eco-stellar-wallets-list, q-eco-freighter-wallet, q-tool-freighter-wallet, q-ti-find-export-secret-key, and q-tool-leaderboard-open-issues record the Scout lag in truth.verified evidence and treat Freighter and Varial as one product."
---

## Finding

The Scout project record for the SDF wallet still uses the old name.
Slug `freighter` has the name `Freighter`, no aliases, and no `currentName` or `formerNames`.
Its `links.website` is `https://freighter.app/`, which now returns HTTP 301 to `https://varialwallet.com/`.
The owner repository README says "Varial (formerly Freighter)".
`GET /api/projects/resolve?q=varial` returns `found: false`.
An agent that asks about Varial gets "not tracked here" for the SDF wallet.

## Evidence

Read-only reproduction:

```sh
curl -sS 'https://stellarlight.xyz/api/projects/resolve?q=varial'
curl -sS 'https://stellarlight.xyz/api/projects/search?q=freighter&limit=3'
curl -sSI https://freighter.app | grep -i '^location'
```

On 2026-11-02 the resolver returned `found: false`, `current: null`.
The search row kept `name: "Freighter"`, `aliases: null`, and `links.website: "https://freighter.app/"`.
The website returned `location: https://varialwallet.com/`.

The owner source is the `stellar/freighter` README at commit `81865843266844ddaec2f0a3b4de64aa64d1b6de`.
It opens with "Varial (formerly Freighter) is a non-custodial wallet extension".
It names the client SDK `@stellar/varial-sdk`.

Five other rows (`hana`, `latch`, `the-aha-company`, `lumenswap`, `stellar-wallets-kit`) name Freighter in prose.
These are lower priority because they describe integrations, not identity.

## Recommendation

Apply the existing rename-continuity fields to the `freighter` row.
Set the current name to Varial and keep Freighter as an alias or former name.
Set `links.website` to `https://varialwallet.com/`.
Make `resolve?q=varial` return the same canonical record with `matchedOn` set to the alias or name.
Keep the slug stable, or redirect it, so existing links still resolve.
Optionally update the shortDescription of the five integration rows to say "Varial (formerly Freighter)".
