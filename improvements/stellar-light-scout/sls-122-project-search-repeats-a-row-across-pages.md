---
id: sls-122
service: stellar-light-scout
status: reported-upstream
discovered: 2026-11-17
upstreamTitle: "Scout project search with q=wallet returns the Coca project twice, so pages overlap and total counts it once"
evidence:
  - "2026-11-17T01:31Z, two runs, GET https://stellarlight.xyz/api/projects/search?q=wallet&limit=100&offset=0 and offset=100 (meta.counts.total 195 on both pages). The first page returns 100 rows. The second page returns 96 rows although only 95 remain. The union is 196 rows and 195 distinct ids. Both runs give the same result."
  - "The repeated row is Coca (id 69b035ad2d04b7c0f26da1a0, slug coca). It sits at index 46 of page one and index 3 of page two. The two copies differ only in confidence: one has score 0.97 (freshness 1, authority 0.85), the other 0.85 (freshness 0.5, authority 0.6)."
  - "The repeat does not depend on page size. The same walk with limit=50 (4 pages) and limit=25 (8 pages) also returns 196 rows, 195 distinct, and coca twice."
  - "Control walks that return no repeat: q=stablecoin limit=100 (207 rows, 207 distinct, total 207) and q=defi limit=100 (199 rows, 199 distinct, total 199). The type=Wallet query returns 74 rows with total 74 and coca once."
  - "Dedupe 2026-11-17: sls-033 (resolved) covered exact Wallet enumeration with type=Wallet, which is clean. This finding covers the q= ranking path. No active Scout finding covers it."
  - upstream issue filed 2026-11-17: https://github.com/Stellar-Light/stellarlight/issues/1975
---

## Finding

`GET /api/projects/search?q=wallet` returns the project Coca twice in its ranked list, once at
rank 47 and once at rank 104. `meta.counts.total` is 195 and counts the project once. A client that
pages through the list collects 196 rows and 195 distinct projects.

The two copies carry the same project id. They differ only in their `confidence` values.

The repeat is stable. It appears in two runs and for page sizes 25, 50, and 100. Two control queries,
`q=stablecoin` and `q=defi`, do not repeat a row.

A client that counts rows from the pages gets 196 for a total of 195. A client that treats the
slug as a unique key gets a duplicate.

## Evidence

Read-only reproduction:

```sh
for off in 0 100; do
  curl -sS "https://stellarlight.xyz/api/projects/search?q=wallet&limit=100&offset=$off" | jq -r '.projects[].slug'
done | sort | uniq -d          # coca
curl -sS 'https://stellarlight.xyz/api/projects/search?q=wallet&limit=100&offset=100' | jq '.projects | length'   # 96
```

Page two has 96 rows where 95 remain after the first 100.

## Recommendation

Merge the two matches of one project into one row before ranking and before the count, so that each
project id appears once in the ranked list. The merged row keeps the higher confidence.
