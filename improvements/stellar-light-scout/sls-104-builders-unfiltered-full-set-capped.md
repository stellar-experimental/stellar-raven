---
id: sls-104
service: stellar-light-scout
status: verified
discovered: 2026-11-02
upstreamTitle: "GET /api/builders caps its full set at 300 and omits rows reachable with location filters"
evidence:
  - "2026-11-02T17:18:23Z live GET https://stellarlight.xyz/api/builders?limit=200&offset=0 returned 200 rows with meta.matchMode 'all', matchModeLabel 'no text query: full set (structured filters only)', counts {returned 200, total 300}. offset=200 returned 100 rows (total 300); offset=400 returned 0 rows (total 300). The 300 rows are all distinct by githubUsername. Page sha256 b042449ccf9b37da61cee6ff448a3b291eb12dbf9e3eeb1a1530df9876760787 (offset 0) and d95acac4884a5fbc0bb8d0e7179482984ca22198c20f179e7f00401c8f6bfb2d (offset 200)."
  - "2026-11-02T17:18:25Z live GET https://stellarlight.xyz/api/status reports source builders count 399, lastUpdatedAt 2026-11-02T16:31:30.657Z, populationId 'builders|status:all'. Response sha256 6f57535759e969f8664b3c416d1c8c33591ad4ae49c0db6ea6ad9f6f417bd094."
  - "2026-11-02T17:21Z live GET https://stellarlight.xyz/api/builders?location=Latin%20America&limit=200 returned counts {returned 59, total 59}. 23 of the 59 rows (for example pedro-pelicioni, wrever, salazarsebas, DiegoPoveda01) do not appear in the 300 unfiltered rows. Response sha256 af7ccdd31c2cccc54e19d48d36cf6afe51305786cd1266670a1ee4b4e0a32ff4."
  - "The filter-miss advisory on the same endpoint reports the larger population: q=Strupey returns 'The directory has 399 builder profiles, but none match' (recorded in golden case q-edge-closed-world-builder-directory-miss on 2026-11-02)."
  - "OpenAPI 1.9.116 for GET /api/builders documents no cap on the unfiltered listing."
  - "Dedupe 2026-11-02: resolved sls-010 and sls-040 cover builder filtering semantics and the scfTier contract. Resolved sls-048 added shared population ids. None covers an unfiltered listing smaller than its population. GitHub search repo:Stellar-Light/stellarlight 'builders total 300' returned 0 results."
  - "Golden consumers: eval/qa/corpus/battery cases q-builder-by-region-latam, q-gap-leaderboard-project-not-builder, and q-edge-closed-world-builder-directory-miss cite the 300 or 399 counts."
  - "2026-11-02T22:38Z recheck: curl -sS --max-time 50 'https://stellarlight.xyz/api/builders?limit=200&offset=0' returned HTTP 200. The equivalent offset=200 and offset=400 requests also returned HTTP 200. They returned 200, 100, and 0 rows, with counts.total=300 and matchModeLabel='no text query: full set (structured filters only)'. The union contains 300 distinct githubUsername values."
  - "2026-11-02T22:38Z: curl -sS --max-time 50 'https://stellarlight.xyz/api/builders?location=Latin%20America&limit=200' returned HTTP 200 with 59 rows. A githubUsername comparison found 23 absent from the unfiltered union, including pedro-pelicioni, wrever, salazarsebas, and DiegoPoveda01. curl -sS --max-time 50 https://stellarlight.xyz/api/status returned HTTP 200 with builders count=399 and populationId=builders|status:all."
  - "2026-11-02 calibration: grep of builders/route.ts found visibility hidden excluded, a payload.find limit of 300, totalMatching=builders.length, then client-page slicing. The collection count can include hidden rows. Therefore 399 minus 300 does not prove exactly 99 eligible omissions. The 23 filter-reachable rows prove the defect independently. OpenAPI 1.9.116 documents no roster cap. No first-bad version or dependency-based snippet claim applies."
  - "2026-11-02 dedupe: gh search issues and gh search prs searched Stellar-Light/stellarlight for 'builders 300' and 'builders full set', across all states. No matching issue appeared. The only PR hit, merged PR 300, concerns repository scanning. rg over improvements/ and improvements/resolved.json found resolved sls-010, sls-040, and sls-048, with different defects. Intake resolves to Stellar-Light/stellarlight without an override."
---

## Finding

`GET /api/builders` stops its unfiltered listing at 300 rows while calling the result a full set.
Its `matchModeLabel` says "no text query: full set (structured filters only)", and `counts.total` is 300.
A Latin America filter returns 23 builders absent from all unfiltered pages.
Clients cannot enumerate those builders through the unfiltered listing.

`/api/status` reports 399 builder records in the collection.
That collection count can include hidden profiles, which the listing excludes.
The 23 filter-reachable profiles prove omissions without assuming that all 399 records qualify for listing.

## Evidence

Read-only reproduction:

```sh
curl -sS --max-time 50 'https://stellarlight.xyz/api/builders?limit=200&offset=0'
curl -sS --max-time 50 'https://stellarlight.xyz/api/builders?limit=200&offset=200'
curl -sS --max-time 50 'https://stellarlight.xyz/api/builders?limit=200&offset=400'
curl -sS --max-time 50 'https://stellarlight.xyz/api/status'
curl -sS --max-time 50 'https://stellarlight.xyz/api/builders?location=Latin%20America&limit=200'
```

All commands returned HTTP 200 on 2026-11-02.
The three pages return 200, 100, and 0 rows, each with `counts.total: 300`.
The Latin America result contains 59 rows.
Compare their `githubUsername` values against the 300 distinct unfiltered values.
Examples absent from the unfiltered listing include `pedro-pelicioni`, `wrever`, `salazarsebas`, and `DiegoPoveda01`.

The route reads at most 300 profiles before it applies the client's offset.
It calculates `counts.total` from that bounded array.

## Recommendation

Page through all eligible profiles for the unfiltered listing.
Calculate `counts.total` with the same visibility rules as the listing.
If a cap remains necessary, report the true eligible count and an explicit truncation flag.
Remove "full set" when the response cannot enumerate that eligible population.
