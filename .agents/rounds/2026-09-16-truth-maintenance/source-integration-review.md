# Source-only integration review

Reviewer: Grok high (Grok 4.6).
Clock: `2026-09-16T22:40:05Z`.
Mode: read-only. **No routing, release, RWA-exposure, or gate acceptance.**
Worktree: `/tmp/raven-execution-2026-09-16/source-integration` on `1d9fa2f20e498e441ba0428c1a6fdbac306710f7`.

## Decision

**Accept this source-only snapshot as the composition of already-reviewed slices:**

- Scout inventory **1.9.52** (`0e99b00af91f2336869af8c8a28be4dbd1317cf24755ac445b95ff43997210c1`)
- Docs titles **650→651** (`2753de9e9ece6e6e89c61ca51cc826d688e938d9d8dae777e3a87bb5d32b9ee5`), page `/docs/data/analytics/public-dashboards`
- `GET /api/rwa` **excluded** (`scout-exposure.ts` SHA-256 `dc9238321e396646a5080db5b86b622c82a79ecdcbac2375dc53672cfe29a6bb`)
- Light pin `3b587aa9f23d21fc572f6e93cb6d11031dbc24e6` / `sel:339145ff9f53` with PR165 scrub
- Parent emitted skill hashes **match** the pairing proof

**Do not grant** routing quality, numeric gates, RWA catalog exposure, #141 close, or production release. Later routing integration must regenerate these outputs again.

## Scope check vs `1d9`

Dirty vs `1d9fa2f2`:

| Path | Role |
|---|---|
| `inventory/stellar-light.json` | 1.9.52 absorb |
| `inventory/stellar-docs-titles.json` | 651st title |
| `src/policy/scout-exposure.ts` | add `GET /api/rwa` to `EXCLUDED_SCOUT_OPS` |
| `ecosystem-skills/MANIFEST.json` | Light pin only |
| `ecosystem-skills/PIN-REVIEW.md` | `sel:339145ff9f53` attestation |
| `ecosystem-skills/INDEX.md` | generated |
| `ecosystem-skills/catalog.json` | 43 entries; **timestamp only** (`fetched_at` 2026-09-08T14:18:31Z → 2026-09-16T22:35:44Z) |
| `catalog/manifest.json` | generated 282 entries |
| `specs/super-spec.json` | generated; **no `/api/rwa` path** |

`src/catalog/search.ts`, `scoring.ts`, `extract-routing-phrases.ts`, `eval/gates.json`: **clean**.
`src/skills/scrub.ts`: **unchanged**, SHA-256 `08bc4ab367d8adc8cd4d2d2c2ee42fc2e398bf1136ef0c15d054f8ef4aaa3131` (PR #165).

Other skill pins unchanged: lumenloop `d92c56bd`, OZ `6f215af6`, stellar-dev `0472452a`, trustless-work `634f32bd`.

`update.sh` script is not in the diff. Pin log: only Light `SKILL.md` and `references/api-reference.md` body diffs. `sel:339145ff9f53` recorded.

## Prior slice match

| Slice | Prior review | This tree |
|---|---|---|
| 1.9.52 schema / 30 ops / 9 components | `scout-source-schema-independent-review.md` | Inventory SHA `0e99b00a…`. Catalog has `asset-issuer`, `accepting=0`, `Yield`. 282 entries. No `scout.getRwaAssets`. |
| Docs Public Dashboards | `docs-title-independent-review.md` | Titles SHA `2753de9e…`. Keywords `public`,`dashboards` on `stellarDocs.search_rpc_horizon_data_docs` only. |
| Light pin excluded-RWA | `light-pin-excluded-rwa-review.md` | Raw blobs `de459e78…` / `5035cc98…`. Emitted `3284e340…` / `d22b904b…`. Parent `source-integration-scrub-proof.json` matches byte-for-byte. |
| TW host override | PR157 / production | Catalog still starts `Escrow-as-a-service integration for single-release and multi-release escrows…` |

Live refresh log: `inventory/stellar-light.json: unchanged (kept fetchedAt 2026-09-16T20:54:12.079Z)`.
Mirrors log: `fetched + verified 66 pinned skill files (upstream, cache bypassed)` / `mirror checks ok`.

## Scrub / exclusion

Emitted Light bodies: 0 bare `/api/repos`, 0 `/api/rwa`, 0 quality/verify/feedback/submit-listing. Neighbors `/api/repos/search|explain|trust`, partners, RFPs remain. Fail-closed did not throw.

PIN-REVIEW states source review only; routing and production stay separate.

## Limits

- Routing candidate must rebuild catalog/spec after scoring lands.
- Fingerprint / `acceptedTotals` wait on that routing review plus any later Docs/Light attribution already covered here.
- RWA stays disabled. Residuals stay in Raven TODO and #141, not as upstream defects.
- This is **not** no-degradation routing acceptance and **not** a release.
