# Interim adversarial review: Scout drift repair

Reviewer: Grok high (Grok 4.6). Distinct from Sol author.
Mode: audit only. Candidate not edited. No paid calls.
Clock: `2026-09-16T19:27:01Z`.
Candidate: `/tmp/raven-execution-2026-09-16/drift` at `722eef5f` plus dirty scoring and Scout 1.9.52 artifacts.
Fixed point: `722eef5f2a81845ebdd8206e17ee100344eabd58`.
Status: **interim**. Sol is still reconciling tests. This is not final acceptance.

## Verdict

Do not accept this candidate yet.

The change is not a provenance bump. Inventory moves Scout `1.9.1` → `1.9.52` and adds `GET /api/rwa`. That operation is exposed as `scout.getRwaAssets`. `.agents/TODO.md` still requires `GET /api/rwa` to stay excluded until all eleven acceptance checks pass.

Local probes also fail the RFP half of check 9. Prefix overlap still matches unrelated short tokens. `src/catalog/search.ts` changed while this review ran.

## File hashes at review

First snapshot `2026-09-16T19:25:36Z`:

| SHA-256 | Path | Bytes |
|---|---|---|
| `2ad36dd88b272f818c751fca0f71faa5c86d5bfe24b05acb7d21304a90209c49` | `src/catalog/extract-routing-phrases.ts` | 2860 |
| `5a7abd20098e2787f8782e02dee243207573d521513b7717a96b449769a32246` | `src/catalog/scoring.ts` | 24014 |
| `3a5cc3d23133c5be84204d9518f055812a0f435affbce25b972e8f1355110ec0` | `src/catalog/search.ts` | 55514 |
| `75995edcde16a56a6bb4490684360b7e0685750a4713f2a6a83299aa4c5f3c37` | `test/extract-routing-phrases.test.ts` | 2257 |
| `0d287d1d5cd32825c7a31926dd8279d094ae4f65b8f6e20e1bbbe7d70f15e398` | `test/scoring.test.ts` | 11718 |
| `ef2a829144f490e552b3484f1a84cb6dce13b25fc82d6b9702c714573334cb85` | `test/drift-141-routing.test.ts` | 5565 |
| `2dbcd893180569b1c9e131f155ae73836dc89601d873677dcc5187a973de2d1f` | `inventory/stellar-light.json` | 627925 |
| `773445de00a9d1cd4a33e6265c1826c5474e7913ee23b39dc74b84cf4e2104cd` | `catalog/manifest.json` | 973810 |
| `e2fecd76c03d567715c10682eff60cb1016cc72ac07c51323fe8218037bb0d91` | `specs/super-spec.json` | 278725 |
| `0f3b603263daf74e35e0bf0baa5ae8522aa602b764b606ff50c1d2380f0d47eb` | `eval/plan/op-classes.json` | 2856 |
| `920e3ba0b8e2b3cb9b1f973d709ea625213bf61fee6c42b8abedee39a44e760f` | `src/mcp/micro-map.ts` | 6514 |

Second snapshot `2026-09-16T19:27:01Z`: `src/catalog/search.ts` moved to
`9f2ad72ff9e88a01b78eacf108e03f732145dfb98cfeaafe2907fcd1d904e025` (55898 bytes).
Other listed files were unchanged. Local probes used the catalog and scoring snapshot above. They may not match later `search.ts` bytes.

## Scout exposure and schema, from files

Base inventory: `openapiVersion` `1.9.1`, `fetchedAt` `2026-08-28T12:50:57.417Z`, 37 path·method pairs.
Candidate inventory: `openapiVersion` `1.9.52`, `fetchedAt` `2026-09-16T18:10:53.396Z`, 38 path·method pairs.

- Added: `GET /api/rwa`
- Removed: none
- `GET /api/quality` still present in the spec
- Changelog `spec@1.9.52` adds scanState `gone` for deleted GitHub repos

`src/policy/scout-exposure.ts` still excludes `GET /api/quality` and `GET /api/verify`. It does **not** exclude `GET /api/rwa`.
Candidate catalog contains `scout.getRwaAssets`.

Drift class: **operation surface** plus schema/changelog plus scoring-source edits. Not provenance-only. ADR-0003 requires an expose-or-exclude decision in the same change.

TODO check 8 still says: keep `GET /api/rwa` excluded until the general scoring repair passes the added RWA check.

## Actionable findings

### High — `GET /api/rwa` is exposed before the eleven checks pass

Location: `inventory/stellar-light.json`, `catalog/manifest.json`, `src/policy/scout-exposure.ts`.

TODO: “Keep `GET /api/rwa` excluded until the general scoring repair passes the added check below.”
Prior 1.9.48/1.9.49 rejections recorded mass unrelated RWA captures.

Smallest repair: add `GET /api/rwa` to `EXCLUDED_SCOUT_OPS` until checks 8 and 10 pass on a frozen candidate. Rebuild catalog. Do not ship `scout.getRwaAssets` as a side effect of scoring work.

### High — prefix overlap still false-matches short tokens

Location: `src/catalog/scoring.ts` `tokensOverlap`.

Measured at this snapshot:

| Pair | `tokensOverlap` |
|---|---|
| `has` ~ `phase` | false |
| `use` ~ `user` | true |
| `use` ~ `used` | true |
| `cat` ~ `category` | true |
| `con` ~ `contract` | true |
| `net` ~ `network` | true |
| `through` ~ `throughout` | true |
| `token` ~ `tokenized` | true |

Check 5 is only the `has`/`phase` pair. The function still treats any length≥3 prefix as a match. That is first-token truncation’s sibling, not a replacement.

Smallest repair: require equality after light stemming, or require the shorter token to be a whole word of length ≥ 4, or both a prefix and a bounded length ratio. Add probes for `use`/`user` and `cat`/`category`.

### High — RFP gain from check 9 is missing on this snapshot

Query: `Is there an open SCF RFP for developer tooling or indexing infrastructure I could build against?`
Top five: `skills.lumenloop.scf-submission-radar`, Docs, `scout.getBuilders`, Lumenloop semantic, integration-finder.
`scout.getRfps` is absent.

Leaderboard query still contains `scout.getLeaderboard`. Check 9 is a conjunction. This snapshot fails it.

### Medium — admitted entries can boost from a single overlapping phrase token

Location: `scoreWithKeywords`.
`qualifyingRoutingPhrases(..., base === null ? 2 : 1)` lets one content-token overlap raise an already-gated score. Separate phrases take `max`, which is good. The 1-token path is not.

Smallest repair: keep the two-token coherent-phrase rule for boosts, not only for admission.

### Medium — service quota is not a hard cap

`serviceQuota(5)` is 2. Query `network` returned four `stellarDocs` hits. `diversifyByService` backfills overflow from the same service when the page is short of other services. The comment admits this. Check 6 needs mixed-service competition; a 4/5 Docs page on a generic token shows the quota is advisory.

### Low — `search.ts` moved during this review

Bytes 55514 → 55898 between `19:25:36Z` and `19:27:01Z`. Freeze the tree before a final review. Re-run probes on the frozen bytes.

## Eleven acceptance checks (local, unpaid)

| # | Check | This snapshot |
|---|---|---|
| 1 | YieldBlox/Reflector keep `scout.searchResearch` | Present (rank 2) |
| 2 | `through` / `network` / `each` / `walk through` do not route `searchResearch` | Pass |
| 3 | `contract` does not route `explainRepo`; repo/code wording does | Pass |
| 4 | Account-merge Docs stays; `hackathonBrief` not in top five | Pass (`search_docs_in_category` rank 5) |
| 5 | `has` does not match `phase` | Pass as a pair; prefix family still fails |
| 6 | Strong Docs after five weak gated Scout rows | Not fully re-measured on the staking query |
| 7 | Eight regression rows | Partial: YieldBlox, first-contract, account-merge present; full eight not re-run |
| 8 | RWA query hits `getRwaAssets`; Friendbot/RPC/WASM/simulate/balance do not | Pass on those probes, but the op should still be excluded |
| 9 | Leaderboard and RFP gains remain | Leaderboard pass; **RFP fail** |
| 10 | Full gates do not regress | Unmeasured; author still reconciling tests |
| 11 | Directory taxonomy reaches `lumenloop.get_categories` | Pass on two paraphrases |

## What looks structurally right

- Phrase extraction keeps field boundaries and does not join separate keyword items.
- Incomplete phrases are skipped at the 256-token cap.
- Routing admission for ungated entries still wants two content-token matches on one phrase.
- `GET /api/quality` remains excluded.
- No paid evaluation ran.

## Required before any later acceptance pass

1. Freeze candidate bytes. Re-hash.
2. Exclude `GET /api/rwa` or produce a reviewed expose decision after all eleven checks pass.
3. Tighten `tokensOverlap`.
4. Restore `scout.getRfps` on the RFP query without a per-query exception.
5. Run the unpaid routing gate on the frozen tree.
6. Re-issue this review as final only after those steps.
