---
id: ll-034
service: lumenloop
status: verified
discovered: 2026-11-02
upstreamTitle: search_directory sorts matches by slug and does not put exact name matches first
evidence:
  - "2026-11-02T17:17:23Z authenticated POST https://api.lumenloop.com/v1/tools/search_directory with {\"query\":\"Blend\"}: count 20; rows 0-3 are account-demolisher, backyard, bexo, blend (title \"Blend Capital\"); all rows are in slug order"
  - "2026-11-02T17:17:43Z same query with limit 100: count 21; the exact match blend is row 3; the last row is yieldblox"
  - "2026-11-02T17:18:13Z same query with limit 1: the only row is account-demolisher; Blend Capital is not returned"
  - "2026-11-02 same tool, default limit: soroswap exact match at row 7 of 10 (first rows account-demolisher, dig, etesia); aquarius at row 1 of 10; reflector at row 1 of 2; xbull at row 1 of 2; every result list is in slug order"
  - "2026-11-02 GET https://api.lumenloop.com/v1/tools/search_directory: the tool tells callers to \"Start here to find a Stellar ecosystem project by name\"; the returns text documents no ordering"
  - "Affected golden case: eval/qa/corpus/battery/edge-behavior/q-edge-fresh-latest-blend-tvl.json"
---

## Finding

`search_directory` returns substring matches in slug order. It does not put
an exact title or slug match first. It does not rank by relevance.

A query for `Blend` returns `account-demolisher`, `backyard`, and `bexo`
before `blend` ("Blend Capital"). Those rows match only because their
descriptions mention Blend. With `limit: 1`, the response does not contain
Blend Capital.

The tool description tells callers to start here to find a project by name.
A caller that reads the first row, or uses a small limit, gets the wrong
project. When the match count is more than the limit, an exact match that sorts
late can drop off the page.

## Evidence

All calls ran on 2026-11-02 with read-only requests to
`POST https://api.lumenloop.com/v1/tools/search_directory`.

| Body | Count | Position of exact match | First rows |
|---|---:|---:|---|
| `{"query":"Blend"}` | 20 | 3 | `account-demolisher`, `backyard`, `bexo` |
| `{"query":"Blend","limit":100}` | 21 | 3 | same |
| `{"query":"Blend","limit":1}` | 1 | absent | `account-demolisher` |
| `{"query":"soroswap"}` | 10 | 7 | `account-demolisher`, `dig`, `etesia` |
| `{"query":"aquarius"}` | 10 | 1 | `account-demolisher`, `aquarius` |
| `{"query":"xbull"}` | 2 | 1 | `soroban-academy`, `xbull` |

Every observed result list was in ascending slug order. The `returns` text
of the tool documents no order.

## Recommendation

Rank substring matches by match quality. Put an exact slug match first. Put
an exact title or `other_names` match next. Put title-prefix matches before
description-only matches.

Document the result order in the tool `returns` text. Add a test that a query
for `Blend` with `limit: 1` returns the `blend` record.
