---
id: sls-095
service: stellar-light-scout
status: verified
discovered: 2026-11-02
upstreamTitle: "Scout cannot resolve Varial because the freighter project still uses its former name"
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
  - "Golden consumers: eval/qa/corpus/battery cases q-eco-stellar-wallets-list, q-eco-freighter-wallet, q-tool-freighter-wallet, q-ti-find-export-secret-key, and q-tool-leaderboard-open-issues record the Scout lag in truth.verified evidence and treat Freighter and Varial as one product."
  - "2026-11-02T22:37Z recheck: curl -sS 'https://stellarlight.xyz/api/projects/resolve?q=varial' returned HTTP 200. Values: found false, matchedOn null, current null, searched 1139. curl -sS 'https://stellarlight.xyz/api/projects/search?q=freighter&limit=100' returned HTTP 200. The freighter row has name Freighter, identity null, and links.website https://freighter.app/."
  - "2026-11-02T22:37Z source check: curl -sS -D - -o /dev/null https://freighter.app/ returned HTTP 301 to https://varialwallet.com/. The current stellar/freighter README returned HTTP 200 and says Varial (formerly Freighter). gh api repos/stellar/freighter/releases/tags/5.50.0 confirms publication at 2026-10-29T20:32:42Z and identifies the first renamed release."
  - "2026-11-02 dedupe correction: gh search issues varial and gh search prs varial, each with --repo Stellar-Light/stellarlight and --state open/closed, found merged PR #1889. gh api repos/Stellar-Light/stellarlight/pulls/1889 confirms the same defect and pending owner data actions. Hold a duplicate filing. rg -n -i 'Varial|varial|Freighter' improvements/ found no other active Scout record for this rename. ll-032 and sk-030 concern different owners; resolved sls-050 and sls-094 concern other identity behavior."
  - "2026-11-02 calibration: upstream tree 1388bdd79b3151208d2be3ce0117316c0bc9694b includes REBRANDS.freighter in scripts/data/curation-maps.ts and IDENTITY_FIX.freighter in scripts/data/curate-projects.ts. The correction already exists in source. Six live descriptions still name Freighter. No dependency-bound broken snippet is alleged."
  - "2026-11-02 owner check: improvements/intake.json resolves this API finding to Stellar-Light/stellarlight. gh api repos/Stellar-Light/stellarlight confirms archived false and has_issues true. No override is needed."
---

## Finding

Scout cannot resolve Varial because the `freighter` project record still uses the former name, Freighter.
`GET /api/projects/resolve?q=varial` returns `found: false`.
The search record has `identity: null` and links to `https://freighter.app/`.
That website redirects to `https://varialwallet.com/`.
A user who searches for the current name cannot find the wallet.

## Evidence

Read-only reproduction:

```sh
curl -sS 'https://stellarlight.xyz/api/projects/resolve?q=varial'
curl -sS 'https://stellarlight.xyz/api/projects/search?q=freighter&limit=100'
curl -sS -D - -o /dev/null https://freighter.app/
gh api repos/Stellar-Light/stellarlight/pulls/1889 --jq '{merged_at,merge_commit_sha,body}'
```

The live check at 2026-11-02T22:37Z returned HTTP 200 with `found: false` and `current: null`.
The search record retained `name: "Freighter"`, `identity: null`, and `links.website: "https://freighter.app/"`.
The website returned HTTP 301 with `location: https://varialwallet.com/`.

SDF announced the rename on 2026-10-29.
The `stellar/freighter` release `5.50.0` describes itself as the first release under the new name.
It was published at 2026-10-29T20:32:42Z.
The current repository README says "Varial (formerly Freighter)".
The README update date, 2026-10-30, does not establish the rename date.

Stellar-Light/stellarlight#1889 already covers this correction.
It merged at 2026-10-31T14:20:47Z as `f46a530eabdd545cec0beb2ad54ef9c833902069`.
Its body requires owner-run project curation, partner curation, and a new project embedding.
The live record still lacks the project correction.

Five adjacent descriptions also name Freighter: `hana`, `latch`, `the-aha-company`, `lumenswap`, and `stellar-wallets-kit`.
These descriptions concern integrations or comparisons.
They do not establish five more identity defects.

## Recommendation

Apply the existing project curation from merged Stellar-Light/stellarlight#1889.
Recheck `resolve?q=varial` after the owner data update.
Keep the `freighter` slug and the Freighter alias while the current name becomes Varial.
Use `https://varialwallet.com/` as the website.
Use the existing upstream correction for this work; hold a duplicate issue.
