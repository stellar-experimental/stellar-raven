---
id: ll-034
service: lumenloop
status: verified
discovered: 2026-11-02
upstreamTitle: search_directory omits the exact Blend match when limit is 1
evidence:
  - 2026-11-02T22:36:13Z orchestrator recheck: POST https://api.lumenloop.com/v1/tools/search_directory {"query":"Blend"} returned HTTP 200. count=20; first slugs account-demolisher, backyard, bexo, blend. The blend row has title "Blend Capital". With {"query":"Blend","limit":1}, HTTP 200 returned only account-demolisher. Raw responses: tmp/fl-lk/ll-recheck/ll034-blend.json and ll034-blend1.json.
  - 2026-11-02 source calibration: gh api repos/lumenloop/lumenloop-backend/contents/lumenloop-mcp/src/tools/directory.ts at main acba0387f14acd35d875719b2cc268509616a184 returned the source. search_directory uses ORDER BY title before LIMIT $2. The observed slug order does not prove ORDER BY slug. The title and recommendation now target exact-match priority.
  - 2026-11-02 adjacent check: inspected both search_directory branches in directory.ts. The substring branch uses alphabetical title ordering; the semantic fallback uses embedding distance. The request concerns exact-name priority in substring results, not a claim about every retrieval branch.
  - 2026-11-02 dedupe: gh search issues and gh search prs covered open and closed owner records. gh api --paginate issues?state=all supplied complete bodies. rg over improvements/ and improvements/resolved.json checked local records. No duplicate appeared among 30 issues and 17 PRs in lumenloop/lumenloop-backend. Existing issue 29 and ll-012 concern broad RWA discovery and deployment state, not exact-slug priority.
  - Affected golden case: eval/qa/corpus/battery/edge-behavior/q-edge-fresh-latest-blend-tvl.json
  - 2026-11-02 earlier controls: the soroswap name query placed soroswap at zero-based position 7 of 10. The xbull query placed xbull at position 1 of 2.
---

## Finding

`search_directory` returns `account-demolisher` for `{"query":"Blend","limit":1}` and omits the exact slug match `blend`.
The default result page places `blend` fourth, after three projects whose descriptions mention Blend.
Alphabetical ordering therefore prevents a small result limit from returning the named project.

## Evidence

The orchestrator repeated these read-only requests on 2026-11-02T22:36:13Z.
Both requests returned HTTP 200.

| Body | Result |
|---|---|
| `{"query":"Blend"}` | 20 rows; first slugs: `account-demolisher`, `backyard`, `bexo`, `blend` |
| `{"query":"Blend","limit":1}` | One row: `account-demolisher` |

The `blend` row has the title `Blend Capital`.
The exact match in this example is the slug, not the full title.
Earlier same-day checks also placed `soroswap` eighth and `xbull` second for their respective name queries.

The current source at `lumenloop-mcp/src/tools/directory.ts` uses `ORDER BY title` before `LIMIT $2`.
Its semantic fallback uses embedding distance instead.
The observed slug order alone did not identify the sort column.

## Recommendation

Put an exact slug match before description-only matches, before applying the result limit.
Also give exact title and `other_names` matches priority over description-only matches.
Document the order in the tool's `returns` text.
Add a regression check that `{"query":"Blend","limit":1}` returns `blend`.
