# Independent review: Stellar Docs title drift

Reviewer: Grok high (Grok 4.6). Distinct from the drift author.
Clock: `2026-09-16T21:03:57Z`.
Mode: audit. No edits to the author candidate. No Scout pin or RWA inference.
Candidate: `/tmp/raven-execution-2026-09-16/docs-title-drift` at `cd87615f8e3f2d9dda2d8b2765acb80c711b7915` plus three dirty generated files.
Base: PR157 commit `cd87615f`. `git diff cd87615f 58954b67` is empty, so that merge tree matches this base.
Handoff: `/tmp/raven-execution-2026-09-16/docs-title-drift-report.md`.

## Verdict

**This Docs title snapshot is acceptable for a later combined #141 integration**, with **fingerprint attribution only** and **no numeric baseline, label, or count change**.

It is not provenance-only: one existing operation gained two keywords. It is not an operation-surface or policy change. It is not Scout acceptance.

Filter commit `bb37bc50` does not change `catalog/manifest.json` versus `cd87615f` (both SHA-256 `0cff03fd…`). This review does not fold that filter into the title snapshot.

## Three-file candidate

Unstaged versus `cd87615f` is exactly:

| File | SHA-256 |
|---|---|
| `inventory/stellar-docs-titles.json` | `2753de9e9ece6e6e89c61ca51cc826d688e938d9d8dae777e3a87bb5d32b9ee5` |
| `catalog/manifest.json` | `d427224ade022bd1b43c28803e2ee02625cb921dcdce3ddc1882ad67bc83054b` |
| `specs/super-spec.json` | `7eac29acdd16bc41756ab99ce24862d169ba2e1cdfa6ed5fc9d9efdee4b40201` |

Complete unstaged binary diff SHA-256: `584a7aeecb7426ea1367aeea9773cc399aaf716a040c2dc3fc8d34833c7b5259`.

`eval/plan/op-classes.json` and `src/mcp/micro-map.ts` are clean. Hashes remain `4cda9783…` and `bb4aefc5…`.

## Added Public Dashboards page

Titles: 650 → 651. `fetchedAt` 2026-09-03T17:09:55.410Z → 2026-09-16T20:51:36.112Z.

Independent pair diff:

- Added: path `/docs/data/analytics/public-dashboards`, title `Public Dashboards`
- Removed: none
- Existing title strings: none changed

Live GET 2026-09-16: HTTP 200, canonical `https://developers.stellar.org/docs/data/analytics/public-dashboards`. Heading `Public Dashboards`. HTML SHA-256 `280663725357b44a848fb3fdc617def9c2ec96db2f245e351464c85df84c82f8`.

GitHub `docs/data/analytics/public-dashboards.mdx` on `stellar/stellar-docs` main frontmatter: `title: Public Dashboards`. Description: free public dashboards for network activity, real-world assets, stablecoins, and DeFi.

This is a real official page, not a snapshot glitch.

## Two keywords on one existing operation

Catalog still has 282 entries. Ordered entry IDs are byte-identical to `cd87615f`.

The only changed entry is `stellarDocs.search_rpc_horizon_data_docs`. Keywords 88 → 90. Added tokens: `public`, `dashboards`. No other field on that entry changed besides those keywords (and any generated keyword-list identity that follows from them).

That operation’s Docs filter includes `/docs/data`, so the new analytics page is in-scope vocabulary. No new operation, schema, exposure, or runner.

## Unchanged spec paths and components

Canonical JSON SHA-256 of `specs/super-spec.json` `paths` is unchanged: `082eafb8…`.
Canonical `components` is unchanged: `ad8da234…`.

The only spec value diffs are generation timestamps:

- `info.x-generatedAt` and `x-generated.generatedAt`: `2026-09-15T16:20:00Z` → `2026-09-16T20:51:36.112Z`

No path or component object moved.

## Full 544-row identity

`--dump-ranked` 495-row dumps:

- PR157 final: `/tmp/raven-execution-2026-09-16/pr157-final-metadata-ranked.json` SHA-256 `4e2ece4a33fd1d35706dd5ace182536a5496649820be58eae72669da7d1a1765`
- Candidate: `/tmp/raven-execution-2026-09-16/docs-title-drift-ranked.json` same SHA-256

They are equal. Dump movements: **0**.

Holdout from result JSON `holdoutCases` (49 rows), comparing:

- `/tmp/raven-execution-2026-09-16/pr157-integrated/eval/results/routing-2026-09-16T20-37-40-896Z.json` SHA-256 `a5e7d13f…`
- `/tmp/raven-execution-2026-09-16/docs-title-drift/eval/results/routing-2026-09-16T20-53-51-227Z.json` SHA-256 `38b44eee…`

Per-row top-hit IDs, scores, pass, and forbidden-capture flags are identical. Holdout movements: **0**.
Holdout lane both: n=49, 10/22/27, forbidden 11, passed 21.

Union 544 identities: **zero movements**.

Measured totals match the PR157 freeze (legacy 213/280/314 of 338, skills 16/23/23, holdout 10/22/27 with 11 forbidden). Committed floors stay 213/279/312, 16, 10/22/26 with max 11 forbidden. Do not change `acceptedTotals`. A later combined land updates **only** the catalog fingerprint.

## Fresh dashboard controls

Independent `searchCatalog` on base catalog vs this candidate (target `stellarDocs.search_rpc_horizon_data_docs`):

| Query | Base | Candidate |
|---|---|---|
| `public dashboards` | absent | rank 1, score 38 |
| `Stellar public dashboards` | absent | rank 2, score 69 |
| `analytics dashboards for Stellar` | absent | rank 1 |
| `dashboard for Horizon API activity` | rank 1 | rank 1 (same top-5 IDs) |
| `build an admin dashboard UI in React` | absent | absent (same top-5 IDs) |
| `public company earnings dashboard` | absent | absent (same top-5 IDs) |
| `Hubble analytics` | rank 3 | rank 3 (same IDs and score) |
| `Horizon metrics` | rank 1 | rank 1 (same IDs and score) |

The new title vocabulary improves exact subject discovery. It does not capture the unrelated dashboard queries tested here. Frozen 544-row identities stay still because those queries are not in the gate set.

## Filter `bb37bc50`

That commit’s `catalog/manifest.json` SHA-256 is `0cff03fd…`, equal to `cd87615f`. The skill-reference filter has **no manifest effect**. This title snapshot does not include Scout filter or 1.9.52 inventory.

## Combined-integration conditions

Accept this snapshot into a later combined #141 tree if:

1. Base remains accepted PR157 (`cd87615f` / `58954b67` tree).
2. Only these three generated files (plus a catalog fingerprint in `eval/gates.json`) change for this slice.
3. Thresholds, labels, lane sizes, and `acceptedTotals` stay unchanged.
4. Scout pin, RWA exposure, and skill-filter policy stay on their own gates.

This review does not authorize commit, deploy, issue close, or Scout acceptance.
