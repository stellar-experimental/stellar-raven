---
id: sls-107
service: stellar-light-scout
status: reported-upstream
discovered: 2026-11-02
upstreamTitle: "Stablecoin rows give a brand as company instead of the stellar.toml issuer, and yield products cannot be filtered out"
evidence:
  - "2026-11-02T21:25:22Z live GET https://stellarlight.xyz/api/stablecoins?limit=200 (API 1.9.116, meta.dataAsOf 2026-11-02T16:22:16.011Z) returned 41 rows. MGUSD (issuer GAIUGZZZSL47BKH27SUDZESZELFJDPE2UM52RACOSFJ7BIVBGKUEJSUZ) has company 'MoneyGram'; AUDD (GDC7X2MXTYSAKUUGAIQ7J7RPEIM7GXSAIWFYWWH4GLNFECQVJJLB2EEU) has company 'Novatti Group'; C1USD (GDCDFF6ZZP3HVODSVJYAN6IRNGWGPLVFKH23RY2OFHFGGVCGBXSDPKTU) has company 'Currency One'."
  - "2026-11-02T21:25:38Z Horizon home_domain for the three issuers: mgusd.moneygram.com, audd.digital, currency.one."
  - "2026-11-02T22:03:07Z https://mgusd.moneygram.com/.well-known/stellar.toml line 8: ORG_NAME=\"MoneyGram Payment Systems, Inc.\"; line 21: MGUSD desc=\"USD-backed stablecoin issued by Bridge on behalf of MoneyGram\". Scout company 'MoneyGram' matches the ORG_NAME; Bridge appears only in the currency desc. MGUSD is not an issuer mismatch."
  - "https://audd.digital/.well-known/stellar.toml: ORG_NAME=\"AUDC PTY LTD\"; code=\"AUDD\" with the same issuer."
  - "https://currency.one/.well-known/stellar.toml: ORG_NAME=\"Kinesis Money Panama S.A.\"; ORG_DESCRIPTION=\"Kinesis Money Panama is the issuer of institutional asset backed digital currencies\"; C1USD desc=\"Currency One USD is a fully collateralized US Dollar stablecoin by Kinesis Money Panama S.A.\" The other seven C1 rows use the same ORG. 2026-11-02T22:04:19Z: all eight rows with company 'Currency One' have distinct issuer accounts."
  - "Asset class: USDY (assetType 'Yield Stablecoin', priceUSD 1.15, first by default marketcap sort) and YLDS (assetType 'Yield Stablecoin') are in the same list as par-pegged coins. https://ondo.finance/.well-known/stellar.toml USDY desc: 'USDY is a tokenized form of US Yield Bearing Bank Deposits. As time progresses the price of USDY will appreciate as yield is accrued'. https://www.ylds.com/.well-known/stellar.toml YLDS desc: 'YLDS is the first SEC-registered, yield-bearing stablecoin...'. The YLDS issuer has auth_required true."
  - "Review rv-hm 2026-11-02T21:51:07Z re-ran both calls: 41 rows, dataAsOf 2026-11-02T16:22:16.011Z, USDY first ('Yield Stablecoin', priceUSD 1.15), USDM1 'Treasury-Backed' at 1.02; the assetType filter returned HTTP 400 'Unknown query param 'assetType'.'"
  - "2026-11-02 GET https://stellarlight.xyz/api/stablecoins?assetType=Yield%20Stablecoin returned HTTP 400 'Unknown query param 'assetType'.' with validParams ['peg','sort','limit']. OpenAPI 1.9.116 Stablecoin.assetType: 'Qualifier where the asset is not a pure peg, e.g. 'Yield Stablecoin' for Ondo's USDY. Null = a plain peg.' Stablecoin.company has no description."
  - "Dedupe 2026-11-02: resolved sls-034 (Stellar-Light/stellarlight#518, closed) added asset-level typing and the USDY record; resolved sls-066 covered USDC omission. Neither covers issuer of record or a class filter. gh issue search 'stablecoin' on Stellar-Light/stellarlight found no open report."
  - ".agents/TODO.md 'File the HackMeridian upstream findings' item R31. Golden follow-up: TODO item 'Add golden cases for the confirmed HackMeridian gaps' (R31)."
  - upstream issue filed 2026-11-02: https://github.com/Stellar-Light/stellarlight/issues/1900
recurrences:
  - date: 2026-11-02
    evidence: "Overnight method 7 independently reproduced the brand/entity gap at 2026-11-03T00:55:25Z through 00:55:26Z. The registry, Currency One TOML, and AUDD TOML returned HTTP 200. Their body hashes are a168e775e832476b24c145c24ece4a9f57b996f1c513a5892f409ba3be34446d, 3576ef6f88809558e4c272bcc5e00f95623fa7fee0bce05810710feea10ca392, and 76bc56ee896dbe79c6c62c3d40d1f9daf094b0ef4ca04c9c3d5da7496132c936. The projected registry fields match the answer's stored snapshot. Public request descriptors and receipts: research/audits/2026-11-02-golden-overnight/stablecoin-issuer-recurrence-receipts.json. Original QA scores and the finding status remain unchanged. No external message was sent."
---

## Finding

`GET /api/stablecoins` has one `company` field, and it holds a brand name.
For two issuers the brand differs from the `ORG_NAME` in the issuer's own `stellar.toml`:

- AUDD: Scout says "Novatti Group". The toml `ORG_NAME` is "AUDC PTY LTD".
- C1USD: Scout says "Currency One". The toml `ORG_NAME` is "Kinesis Money Panama S.A.". The same applies to all eight C1 rows.

For MGUSD, the toml `ORG_NAME` is "MoneyGram Payment Systems, Inc.", which matches Scout.
The MGUSD currency `desc` adds that the coin is "issued by Bridge on behalf of MoneyGram".

An agent that answers "who issues X" from `company` gives the brand, not the issuer of record.

The list also mixes yield products with par-pegged coins.
USDY and YLDS carry `assetType: "Yield Stablecoin"`, and USDY sorts first by market cap at a price of 1.15.
The endpoint rejects an `assetType` filter, so a caller cannot get "par stablecoins only".

## Evidence

Read-only reproduction:

```sh
curl -sS 'https://stellarlight.xyz/api/stablecoins?limit=100'
curl -sS https://mgusd.moneygram.com/.well-known/stellar.toml
curl -sS https://audd.digital/.well-known/stellar.toml
curl -sS https://currency.one/.well-known/stellar.toml
curl -sS 'https://stellarlight.xyz/api/stablecoins?assetType=Yield%20Stablecoin'
```

## Recommendation

Add an `issuerOfRecord` field from the toml `ORG_NAME`, with its toml URL.
Keep a currency `desc` that names a different issuing party as a note, for example Bridge for MGUSD.
Keep `company` as the brand, and document it as the brand.
On the same endpoint, add an `assetType` filter, or an `excludeYield=true` option, to `/api/stablecoins`.
Optionally, set a non-null class on every row (for example "Fiat-backed") so null does not stand for two meanings.
