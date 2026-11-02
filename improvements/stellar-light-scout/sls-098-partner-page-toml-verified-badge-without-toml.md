---
id: sls-098
service: stellar-light-scout
status: reported-upstream
discovered: 2026-11-02
upstreamTitle: "Partner pages falsely verify unfetched stellar.toml data; detail responses turn unknown SEPs into empty lists"
probe:
  type: http-text
  url: https://stellarlight.xyz/partners/anchor-bitso
  expect:
    status: 200
    contains:
      - "stellar.toml verified"
evidence:
  - "2026-11-02T17:19Z live GET https://stellarlight.xyz/partners/anchor-bitso returned HTTP 200. The rendered text shows the badge 'stellar.toml verified' beside 'Anchor Aging', and the Capabilities section heading 'Verified from this partner's stellar.toml (SEP-1)' above Ramps 'On-ramp (fiat → Stellar) Off-ramp (Stellar → fiat)' and 'Assets issued / supported USDC'."
  - "2026-11-02T17:18Z live GET https://stellarlight.xyz/api/partners/anchor-bitso returned tomlSourceUrl null, tomlFetchedAt null, seps [], assets ['USDC'], rampTypes ['on-ramp','off-ramp'], verified.lastAutoVerifyAt null, freshness {status 'aging', isCurrent false}."
  - "OpenAPI 1.9.116 Partner.tomlSourceUrl: 'The stellar.toml URL the anchor-capability fields (assets/seps/rampTypes/jurisdiction) were last system-enriched from; re-verify there. Null = never toml-enriched (curated/self-reported only).'"
  - "2026-11-02T17:18Z curl https://bitso.com/.well-known/stellar.toml returned HTTP 404."
  - "Control: https://stellarlight.xyz/partners/anchor-coins-ph (also tomlSourceUrl null) shows no stellar.toml badge and no 'Verified from this partner's stellar.toml' heading. The badge is therefore row-specific, not a page-template constant."
  - "Prevalence 2026-11-02T17:3xZ: GET https://stellarlight.xyz/api/partners?limit=200 returned 43 partners, 12 with non-null tomlSourceUrl and 31 with null. Fetching each partner page found the 'stellar.toml verified' text on all 12 toml-sourced pages and on 2 pages with null tomlSourceUrl: anchor-bitso and anchor-honey-coin. One page fetch failed. Honey Coin (websiteUrl https://honeycoin.app/) has tomlFetchedAt null, and https://honeycoin.app/.well-known/stellar.toml returned HTTP 404."
  - "Golden consumers: eval/qa/corpus/battery cases q-comp-cross-bitso-sep31 and q-gap-match-partners-degrade cite the null tomlSourceUrl."
  - "2026-11-02T21:29:28Z (HackMeridian item R36, partner SEP lists) GET https://stellarlight.xyz/api/partners/<slug> returned seps [] for anchor-bitso, anchor-honey-coin, anchor-coins-ph, and anchor-yellow-card, all with tomlFetchedAt null. GET https://stellarlight.xyz/api/partners?all=true returned seps null for the same four. OpenAPI 1.9.116 Partner.seps: 'NULL = we have not fetched their SEP-1 file ... [] = we DID fetch it and it implements none, so [] with non-empty rampTypes is the checkable claim that the ramp is a proprietary API rather than SEP-based.' The detail endpoint therefore asserts 'proprietary API, not SEP-based' for Bitso and Honey Coin (rampTypes on-ramp, off-ramp) without a fetch."
  - "2026-11-02T21:28:55Z the SDF Anchor Directory https://anchors.stellar.org/ (page data) lists Bitso with supported_standards [SEP-31: Cross-Border Payments] and toml_file null. No public source found lists SEP-24 for Bitso, so the HackMeridian 'Bitso SEP-24' wording is not supported; the defect is the [] coercion, which contradicts the directory's SEP-31."
  - "Control: anchor-anclap has tomlSourceUrl https://anclap.com/.well-known/stellar.toml and seps ['sep-6','sep-24']; the toml has TRANSFER_SERVER and TRANSFER_SERVER_SEP0024 and a commented-out DIRECT_PAYMENT_SERVER, so Scout's toml-derived list is correct there."
  - "2026-11-02T22:37Z recheck: curl -sS https://stellarlight.xyz/api/partners/anchor-bitso and the anchor-honey-coin equivalent returned HTTP 200. Both records have tomlSourceUrl null, tomlFetchedAt null, seps [], and curated asset codes. curl -sS https://stellarlight.xyz/partners/anchor-bitso and the Honey Coin equivalent returned HTTP 200 with both verification labels. The anchor-coins-ph page returned HTTP 200 with neither label."
  - "2026-11-02T22:37Z repeated-value check: curl -sS 'https://stellarlight.xyz/api/partners?all=true' returned HTTP 200 with 47 partners. Bitso, Honey Coin, Coins PH, and Yellow Card have seps null and assets null in the list. Their four detail endpoints returned HTTP 200 with seps []; each has tomlFetchedAt null. Coins PH and Yellow Card also return assets []. The default list returned 43 partners."
  - "2026-11-02 calibration: rg -n 'hasCapabilities|stellar.toml verified|Verified from|seps:|assets:' over the partner page, detail handler, and list handler at upstream 1388bdd79b3151208d2be3ce0117316c0bc9694b found both page labels under hasCapabilities. Detail uses p.seps ?? []; list gates seps and assets on tomlFetchedAt. The source confirms the same provenance mismatch in adjacent fields. No introducing release or broken dependency snippet is claimed."
  - "2026-11-02 dedupe: gh search issues toml and gh search prs toml, each with --repo Stellar-Light/stellarlight and --state open/closed, found no duplicate. Additional issue/PR searches for the exact badge and for 'tomlFetchedAt seps' found no matching correction. Merged #831 added source fields; #331 added trust labels. Existing #324 concerns anchor corridor coverage. rg -n -i 'stellar.toml verified|tomlSourceUrl|never.*toml|seps.*(null|empty)' improvements/ distinguishes resolved sls-049's curated capability fill from this provenance defect."
  - "2026-11-02 owner check: improvements/intake.json resolves this API finding to Stellar-Light/stellarlight. gh api repos/Stellar-Light/stellarlight confirms archived false and has_issues true. No override is needed."
  - upstream issue filed 2026-11-02: https://github.com/Stellar-Light/stellarlight/issues/1909
---

## Finding

The Bitso and Honey Coin partner pages label curated capabilities as verified from stellar.toml without a recorded fetch.
Both pages display "stellar.toml verified" and "Verified from this partner's stellar.toml (SEP-1)".
Both API records have `tomlSourceUrl: null` and `tomlFetchedAt: null`.
Readers can mistake curated capabilities for verified SEP-1 facts.

The partner detail API also changes unknown SEP data to `seps: []`.
The list API returns `seps: null` for the same four checked partners.
The schema defines `null` as unknown and `[]` as a successful fetch with no implemented SEPs.
These values lead clients to different conclusions.

## Evidence

Read-only reproduction:

```sh
curl -sS https://stellarlight.xyz/api/partners/anchor-bitso
curl -sS https://stellarlight.xyz/api/partners/anchor-honey-coin
curl -sS 'https://stellarlight.xyz/api/partners?all=true'
curl -sS https://stellarlight.xyz/partners/anchor-bitso | grep -o 'stellar.toml verified'
curl -sS https://stellarlight.xyz/partners/anchor-honey-coin | grep -o 'stellar.toml verified'
curl -sS https://stellarlight.xyz/api/openapi.json
```

The live checks at 2026-11-02T22:37Z returned HTTP 200 for both records and both pages.
Both records had `tomlSourceUrl: null`, `tomlFetchedAt: null`, and `seps: []`.
Both pages displayed the badge and the verification heading.
The Coins PH page displayed neither label.

The detail records for `anchor-bitso`, `anchor-honey-coin`, `anchor-coins-ph`, and `anchor-yellow-card` all returned `seps: []`.
All four had `tomlFetchedAt: null`.
The list API returned `seps: null` and `assets: null` for those same partners.
The detail API returned `assets: []` for Coins PH and Yellow Card.
It returned curated asset codes for Bitso and Honey Coin.

OpenAPI `1.9.116` defines a null `tomlSourceUrl` as never enriched from stellar.toml.
It defines a null `seps` value as unknown.
The detail handler uses `p.seps ?? []` without the list handler's `tomlFetchedAt` check.
The page uses capability presence to display both verification labels.
Capability presence does not establish a successful stellar.toml fetch.

An earlier scan found badges on 14 partner pages, including the two without a recorded source.
One page fetch failed in that scan.
The current check confirms the two false labels and the Coins PH control.
The Bitso and Honey Coin root-domain stellar.toml URLs both returned HTTP 404.
Those URLs do not prove that no other stellar.toml URL exists.

## Recommendation

Require a recorded stellar.toml source and successful fetch before the page displays either verification label.
Label curated capabilities as curated or self-reported.
Apply the same rule to Bitso, Honey Coin, and other partner pages.
Preserve `seps: null` in partner detail responses when no fetch occurred.
Apply the same unknown-value rule to `assets`, consistent with the list response and schema.
Keep curated asset claims separate from facts verified through stellar.toml.
