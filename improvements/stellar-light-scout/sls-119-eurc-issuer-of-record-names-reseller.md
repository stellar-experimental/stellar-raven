---
id: sls-119
service: stellar-light-scout
status: reported-upstream
discovered: 2026-11-14
upstreamTitle: "EURC stablecoin row names Circle's US reseller as issuer of record instead of Circle Internet Financial Europe SAS"
evidence:
  - "2026-11-14T16:54:25Z GET https://stellarlight.xyz/api/stablecoins?peg=EUR&limit=50 (Scout OpenAPI 1.9.150, meta.dataAsOf 2026-11-14T06:45:10.678Z) returned 6 rows. The EURC row with issuer GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP2 has company 'Circle', issuerOfRecord 'Circle Internet Financial, LLC', issuerOfRecordCheck 'named', issuerOfRecordSourceUrl 'https://circle.com/.well-known/stellar.toml', issuerOfRecordNote null."
  - "2026-11-14 https://www.circle.com/.well-known/stellar.toml: ORG_NAME=\"Circle Internet Financial, LLC\"; the [[CURRENCIES]] entries for USDC and EURC carry no issuing-entity field. Scout copied the toml organization."
  - "2026-11-14 https://www.circle.com/legal/eurc-terms, section 1: 'EURC is a digital token issued by Circle Internet Financial Europe SAS, (“Circle Europe”)' and 'Circle Internet Financial, LLC (“Circle”) is an affiliate of Circle Europe and acts as a reseller of EURC to those having a Circle Mint account.' Section 13: 'EURC is issued and redeemed by Circle Europe'."
  - "2026-11-14 https://www.circle.com/eurc (page dated 2026-11-12): 'EURC is issued by Circle Internet Financial Europe SAS, an electronic money institution authorized by the ACPR in France, and qualifies as an e-money token under MiCA.'"
  - "2026-11-14T16:53Z Raven execute scout.getStablecoins({peg: 'EUR'}) returned the same EURC issuerOfRecord. Prevalence: only the EURC row was checked against the issuer's legal disclosure; the USDC row carries the same toml-derived value and was not assessed."
  - "Dedupe 2026-11-14: sls-107 (fixed-upstream, Stellar-Light/stellarlight#1900, PR 1944) added issuerOfRecord from the toml ORG_NAME. This finding is its residual: ORG_NAME names the toml publisher, which for EURC is not the legal issuer. No open issue on Stellar-Light/stellarlight mentions EURC issuer of record."
  - "Affected golden case: eval/qa/corpus/battery/retail-consumer/q-asset-usdc-eurc-issuer.json (the EU legal-issuer key fact moved to grading notes on 2026-11-14; .agents/rounds/2026-11-14-golden-coverage-audit/decisions/APPLY.md)."
  - upstream issue filed 2026-11-14: https://github.com/Stellar-Light/stellarlight/issues/1971
recurrences:
  - date: 2026-11-17
    evidence: "Still reproduces. Reproduction command from the evidence, run 2026-11-17 (00:19Z): GET https://stellarlight.xyz/api/stablecoins?peg=EUR&limit=50 (meta.dataAsOf 2026-11-16T22:20:13.659Z) returns 6 rows. The EURC row with issuer GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP2 still has issuerOfRecord \"Circle Internet Financial, LLC\", issuerOfRecordCheck \"named\" and issuerOfRecordSourceUrl https://circle.com/.well-known/stellar.toml. https://github.com/Stellar-Light/stellarlight/issues/1971 is open with 0 comments."
---

## Finding

`GET /api/stablecoins` gives Circle's EURC on Stellar an `issuerOfRecord` of "Circle Internet
Financial, LLC". Circle's own EURC terms name a different entity as the issuer: Circle Internet
Financial Europe SAS. The LLC is an affiliate that resells EURC.

The value comes from the `ORG_NAME` in `circle.com/.well-known/stellar.toml`. That field names the
organization that publishes the toml, not the legal issuer of each currency it lists. For EURC the
two differ.

An agent that answers "who is the legal issuer of EURC" from this field names the wrong entity.

## Evidence

Read-only reproduction:

```sh
curl -sS 'https://stellarlight.xyz/api/stablecoins?peg=EUR&limit=50'
curl -sS https://www.circle.com/.well-known/stellar.toml
```

The first response has `"issuerOfRecord": "Circle Internet Financial, LLC"` on the EURC row for
issuer `GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP2`. The toml has
`ORG_NAME="Circle Internet Financial, LLC"` and no issuing-entity field on the EURC entry.

Circle's EURC terms (`https://www.circle.com/legal/eurc-terms`, section 1) say: "EURC is a digital
token issued by Circle Internet Financial Europe SAS" and "Circle Internet Financial, LLC
(“Circle”) is an affiliate of Circle Europe and acts as a reseller of EURC". The EURC product page
(`https://www.circle.com/eurc`) says the same.

## Recommendation

Set the EURC row's `issuerOfRecord` to "Circle Internet Financial Europe SAS", with the EURC terms
URL as its source, or keep the toml value and add an `issuerOfRecordNote` that names the legal
issuer. Document `issuerOfRecord` as the toml organization unless an issuer disclosure overrides
it, so callers know when the two can differ.
