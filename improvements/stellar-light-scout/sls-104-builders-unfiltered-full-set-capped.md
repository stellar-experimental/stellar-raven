---
id: sls-104
service: stellar-light-scout
status: verified
discovered: 2026-11-02
upstreamTitle: "Unfiltered GET /api/builders labels 300 rows a full set while the directory holds 399"
evidence:
  - "2026-11-02T17:18:23Z live GET https://stellarlight.xyz/api/builders?limit=200&offset=0 returned 200 rows with meta.matchMode 'all', matchModeLabel 'no text query: full set (structured filters only)', counts {returned 200, total 300}. offset=200 returned 100 rows (total 300); offset=400 returned 0 rows (total 300). The 300 rows are all distinct by githubUsername. Page sha256 b042449ccf9b37da61cee6ff448a3b291eb12dbf9e3eeb1a1530df9876760787 (offset 0) and d95acac4884a5fbc0bb8d0e7179482984ca22198c20f179e7f00401c8f6bfb2d (offset 200)."
  - "2026-11-02T17:18:25Z live GET https://stellarlight.xyz/api/status reports source builders count 399, lastUpdatedAt 2026-11-02T16:31:30.657Z, populationId 'builders|status:all'. Response sha256 6f57535759e969f8664b3c416d1c8c33591ad4ae49c0db6ea6ad9f6f417bd094."
  - "2026-11-02T17:21Z live GET https://stellarlight.xyz/api/builders?location=Latin%20America&limit=200 returned counts {returned 59, total 59}. 23 of the 59 rows (for example pedro-pelicioni, wrever, salazarsebas, DiegoPoveda01) do not appear in the 300 unfiltered rows. Response sha256 af7ccdd31c2cccc54e19d48d36cf6afe51305786cd1266670a1ee4b4e0a32ff4."
  - "The filter-miss advisory on the same endpoint reports the larger population: q=Strupey returns 'The directory has 399 builder profiles, but none match' (recorded in golden case q-edge-closed-world-builder-directory-miss on 2026-11-02)."
  - "OpenAPI 1.9.116 for GET /api/builders documents no cap on the unfiltered listing."
  - "Dedupe 2026-11-02: resolved sls-010 and sls-040 cover builder filtering semantics and the scfTier contract. Resolved sls-048 added shared population ids. None covers an unfiltered listing smaller than its population. GitHub search repo:Stellar-Light/stellarlight 'builders total 300' returned 0 results."
  - "Golden consumers: eval/qa/corpus/battery cases q-builder-by-region-latam, q-gap-leaderboard-project-not-builder, and q-edge-closed-world-builder-directory-miss cite the 300 or 399 counts."
---

## Finding

The unfiltered builder listing stops at 300 rows.
Its `matchModeLabel` says "no text query: full set", and `counts.total` is 300.
`/api/status` and the filter-miss advisory both report 399 builder profiles.
A location filter reaches rows that the unfiltered pages never return.
For Latin America, 23 of 59 matching builders are absent from the unfiltered pages.
A client that pages the "full set" undercounts the directory by 99 profiles.

## Evidence

Read-only reproduction:

```sh
curl -sS 'https://stellarlight.xyz/api/builders?limit=200&offset=0'
curl -sS 'https://stellarlight.xyz/api/builders?limit=200&offset=200'
curl -sS 'https://stellarlight.xyz/api/builders?limit=200&offset=400'
curl -sS 'https://stellarlight.xyz/api/status'
curl -sS 'https://stellarlight.xyz/api/builders?location=Latin%20America&limit=200'
```

The three pages return 200, 100, and 0 rows, each with `counts.total: 300`.
The status source `builders` reports `count: 399`.
Compare `githubUsername` values between the location result and the unfiltered pages.

## Recommendation

Make the unfiltered listing page through the whole population.
Make `counts.total` match the `/api/status` builders count for the same population.
If a cap is intended, report it with a `truncated` flag and the true total, and remove "full set" from the label.
