---
id: sls-098
service: stellar-light-scout
status: verified
discovered: 2026-11-02
upstreamTitle: "Bitso and Honey Coin partner pages and detail API present never-fetched stellar.toml capabilities as verified"
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
  - "Dedupe 2026-11-02: resolved sls-049 fixed Bitso's empty anchorProfile arrays; it did not cover the provenance label. No active finding covers partner-page verification badges. GitHub search repo:Stellar-Light/stellarlight 'stellar.toml verified' returned 0 results."
  - "Golden consumers: eval/qa/corpus/battery cases q-comp-cross-bitso-sep31 and q-gap-match-partners-degrade cite the null tomlSourceUrl."
  - "2026-11-02T21:29:28Z (HackMeridian item R36, partner SEP lists) GET https://stellarlight.xyz/api/partners/<slug> returned seps [] for anchor-bitso, anchor-honey-coin, anchor-coins-ph, and anchor-yellow-card, all with tomlFetchedAt null. GET https://stellarlight.xyz/api/partners?all=true returned seps null for the same four. OpenAPI 1.9.116 Partner.seps: 'NULL = we have not fetched their SEP-1 file ... [] = we DID fetch it and it implements none, so [] with non-empty rampTypes is the checkable claim that the ramp is a proprietary API rather than SEP-based.' The detail endpoint therefore asserts 'proprietary API, not SEP-based' for Bitso and Honey Coin (rampTypes on-ramp, off-ramp) without a fetch."
  - "2026-11-02T21:28:55Z the SDF Anchor Directory https://anchors.stellar.org/ (page data) lists Bitso with supported_standards [SEP-31: Cross-Border Payments] and toml_file null. No public source found lists SEP-24 for Bitso, so the HackMeridian 'Bitso SEP-24' wording is not supported; the defect is the [] coercion, which contradicts the directory's SEP-31."
  - "Control: anchor-anclap has tomlSourceUrl https://anclap.com/.well-known/stellar.toml and seps ['sep-6','sep-24']; the toml has TRANSFER_SERVER and TRANSFER_SERVER_SEP0024 and a commented-out DIRECT_PAYMENT_SERVER, so Scout's toml-derived list is correct there."
---

## Finding

The Bitso partner page says its capabilities are verified from stellar.toml.
It shows the badge "stellar.toml verified" and the heading "Verified from this partner's stellar.toml (SEP-1)".
The API record for the same partner has `tomlSourceUrl: null` and `tomlFetchedAt: null`.
The schema defines null as "never toml-enriched (curated/self-reported only)".
`https://bitso.com/.well-known/stellar.toml` returns HTTP 404.
A reader can trust curated ramp and asset claims as SEP-1 facts.

The partner detail endpoint has the same defect in data.
For every partner without a toml fetch, it returns `seps: []` and the list endpoint returns `seps: null`.
The schema defines `[]` as "fetched, implements none", which with ramp types means "proprietary API, not SEP-based".
For Bitso this contradicts the SDF Anchor Directory, which lists SEP-31.

## Evidence

Read-only reproduction:

```sh
curl -sS https://stellarlight.xyz/api/partners/anchor-bitso
curl -sS https://stellarlight.xyz/partners/anchor-bitso | grep -o 'stellar.toml verified'
curl -sS -o /dev/null -w '%{http_code}\n' https://bitso.com/.well-known/stellar.toml
```

On 2026-11-02 the page showed both labels.
The API returned `tomlSourceUrl: null`, `seps: []`, and `verified.lastAutoVerifyAt: null`.
The Bitso stellar.toml URL returned 404.
The Coins PH page, also with `tomlSourceUrl: null`, shows neither label.

A scan of all 43 partner pages found the badge on 14 pages.
Twelve have a non-null `tomlSourceUrl`.
Two have a null `tomlSourceUrl`: `anchor-bitso` and `anchor-honey-coin`.
`https://honeycoin.app/.well-known/stellar.toml` also returns HTTP 404.

## Recommendation

Show the stellar.toml badge and heading only when `tomlSourceUrl` is non-null.
Label curated capability fields as curated or self-reported when no toml source exists.
Fix the same mismatch on `anchor-honey-coin`.
Return `seps: null` from `GET /api/partners/{slug}` when `tomlFetchedAt` is null, as the list endpoint does.
Optionally, record the toml URL that each partner publishes, if one exists at another domain.
