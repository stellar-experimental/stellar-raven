---
id: sls-120
service: stellar-light-scout
status: reported-upstream
discovered: 2026-11-17
upstreamTitle: "BRLT stablecoin row leaves every issuer-of-record field null, though a toml Scout already reads lists the account"
evidence:
  - "2026-11-17T00:32:05Z GET https://stellarlight.xyz/api/stablecoins?limit=100 (Scout OpenAPI 1.9.150, meta.dataAsOf 2026-11-16T22:21:02.095Z) returned 37 rows. The BRLT row (assetId BRLT-GCHQ3F2B, issuer GCHQ3F2BF5P74DMDNOOGHT5DUCKC773AW5DTOFINC26W4KGYFPYDPRSO, company 'Settle Network', issuerDomain settlenetwork.com) has issuerOfRecord, issuerOfRecordCheck, issuerOfRecordSourceUrl, issuerOfRecordAsOf and issuerOfRecordNote all null. Its note and assetTypeNote say the home_domain sep.stablex.cloud did not resolve when checked on 2026-11-11."
  - "2026-11-17T00:32:15Z GET https://horizon.stellar.org/accounts/GCHQ3F2BF5P74DMDNOOGHT5DUCKC773AW5DTOFINC26W4KGYFPYDPRSO returned home_domain 'sep.stablex.cloud'. A, AAAA and CNAME queries for sep.stablex.cloud and for stablex.cloud returned NXDOMAIN (Status 3, no answers) at https://dns.google/resolve. An A query at https://cloudflare-dns.com/dns-query also returned Status 3. A direct fetch of https://sep.stablex.cloud/.well-known/stellar.toml failed to connect."
  - "2026-11-17T00:32Z GET https://pubnet-sep.latamex.com/.well-known/stellar.toml returned HTTP 200 (2472 bytes, SHA-256 d39046c15f5c04d8b0bc25d625271782553017ce4b25b1d4bf61de58de0694ca). It has ORG_NAME=\"Relay Tech Services Ltd\", lists GCHQ3F2BF5P74DMDNOOGHT5DUCKC773AW5DTOFINC26W4KGYFPYDPRSO in ACCOUNTS (line 25), and has a [[CURRENCIES]] entry with code=\"BRLT\" and that issuer (lines 53 and 54)."
  - "Same response as the first read: the other Settle Network row, issuer GCSAZVWXZKWS4XS223M5F54H2B6XPIIXZZGP7KEAIU6YSL5HDRGCI3DG, has issuerOfRecord 'Relay Tech Services Ltd', issuerOfRecordCheck 'named' and issuerOfRecordSourceUrl https://pubnet-sep.latamex.com/.well-known/stellar.toml (issuerOfRecordAsOf 2026-11-16T22:18:59.174Z)."
  - "Same response: the USDT0 row (issuer GATISXX6BZ6NC7IKQBY37CJD4SOZL3CYZJWXEDG6JVIY4WBS6KXJHN6Q) has issuerOfRecordCheck 'not-named', a dated issuerOfRecordAsOf and a note that names the toml's ORG_NAME and says the account sets no home_domain pointing to the toml. It records the same one-sided link that the BRLT row leaves empty."
  - "2026-11-17T00:33Z GET https://settlenetwork.com/.well-known/stellar.toml returned HTTP 404, so the issuerDomain on the BRLT row does not publish a toml either."
  - "Dedupe 2026-11-17: sls-107 (Stellar-Light/stellarlight#1900, closed; PR 1944) added the issuerOfRecord fields. Raven's 2026-11-14 comment on #1900 (comment 6870496953) asked for a dated could-not-read value for BRLT. No reply followed, and the closed thread no longer tracks the request. No open issue on Stellar-Light/stellarlight mentions BRLT issuer of record. sls-119 (#1971) is the separate EURC residual of sls-107."
  - upstream issue filed 2026-11-17: https://github.com/Stellar-Light/stellarlight/issues/1973
---

## Finding

`GET /api/stablecoins` returns the BRLT row of Settle Network with all five issuer-of-record
fields null. The fields are `issuerOfRecord`, `issuerOfRecordCheck`, `issuerOfRecordSourceUrl`,
`issuerOfRecordAsOf` and `issuerOfRecordNote`. It is the one row of 37 where a caller gets nothing
from these fields.

The issuer account sets `home_domain` to `sep.stablex.cloud`. That name does not resolve, so Scout
cannot read the toml that the account points to. The null check follows the rule that a read which
cannot be made changes nothing.

A different toml lists the account. `https://pubnet-sep.latamex.com/.well-known/stellar.toml`
names "Relay Tech Services Ltd", lists the BRLT issuer in `ACCOUNTS`, and has a BRLT currency
entry. Scout already reads this toml for the ARST row of the same brand.

The USDT0 row has the same one-sided link. It serves `issuerOfRecordCheck` "not-named", a date,
and a note that names the entity. The BRLT row records nothing. A caller cannot tell "tried and
unreadable" from "never tried". The only trace is free text in `note` and `assetTypeNote`, dated
2026-11-11.

The impact is low. It is one row, with about 2,760 BRLT in supply and about 500 USD at the
assumed peg.

## Evidence

Read-only reproduction:

```sh
curl -sS 'https://stellarlight.xyz/api/stablecoins?limit=100'
curl -sS https://horizon.stellar.org/accounts/GCHQ3F2BF5P74DMDNOOGHT5DUCKC773AW5DTOFINC26W4KGYFPYDPRSO
curl -sS 'https://dns.google/resolve?name=sep.stablex.cloud&type=A'
curl -sS https://pubnet-sep.latamex.com/.well-known/stellar.toml
```

1. In the first response, the row with `assetId` "BRLT-GCHQ3F2B" has the five fields null.
2. The Horizon account has `home_domain` "sep.stablex.cloud".
3. The DNS answer has `Status` 3 (NXDOMAIN) and no answer. The apex `stablex.cloud` also returns
   `Status` 3.
4. The toml answers HTTP 200 with `ORG_NAME="Relay Tech Services Ltd"`. It lists the BRLT issuer
   in `ACCOUNTS` and in a `[[CURRENCIES]]` entry with `code="BRLT"`.

The ARST row of the same brand serves `issuerOfRecord` "Relay Tech Services Ltd" with this toml as
its source. The BRLT account does not point to this toml, so the link is one-sided. The rule that
Scout applies to USDT0 fits this row.

## Recommendation

Give the BRLT row an `issuerOfRecordNote`. The note names the latamex toml and "Relay Tech
Services Ltd". It says the link is not confirmed from the account side, as the USDT0 note does.
Set `issuerOfRecordCheck` to "not-named" and `issuerOfRecordAsOf` to the read date.

Then serve a dated state for a read that was tried and could not be made. Null should mean only
"never tried". Keep `issuerOfRecord` null while the link is one-sided.
