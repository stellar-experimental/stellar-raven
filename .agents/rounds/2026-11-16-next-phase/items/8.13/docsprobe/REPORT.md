# Item 8.13 (`docsprobe`) Lane Report

## What Changed

Re-probed all four canonical Docs pages named in `.agents/TODO.md` ("Fix Docs search misses on canonical pages") on current `main` (`c52dca8a`) through both paths (Raven `search` / `codemode.search` on local MCP port `8798`, and `stellarDocs.search_docs` plus direct Mintlify Discovery API `pageSize: 50` controls). Strictly honored the stop rule (record and local finding only; no changes to ranking, catalog, keywords, scoring, routing cases, or Worker code).

- [PROBE.md](./PROBE.md) — Complete per-page, per-path probe record (queries, ranks, parity checks, root causes, and implied `.agents/TODO.md` update).
- [sd-114-docs-search-contract-id-derivation.md](../../../../../improvements/stellar-docs/sd-114-docs-search-contract-id-derivation.md) — Local verified upstream finding (`status: verified`, `statusNote` held pending upstream posting review, `stellar/stellar-docs` on the `sd-112` precedent) for the confirmed Mintlify ranking miss on natural Soroban contract-ID derivation queries.
- [improvements/intake.json](../../../../../improvements/intake.json) — Added `sd-114` -> `stellar/stellar-docs` override.
- [improvements/INDEX.md](../../../../../improvements/INDEX.md) — Regenerated via `npm run improvements:index` (94 active findings).
- [SOL-REVIEW.md](./SOL-REVIEW.md) — Read-only Codex Sol review of `origin/main...d8ad450d`.
- [CHALLENGE.md](./CHALLENGE.md) — Finding-by-finding challenge and evidence for all 7 Sol findings.

### Probe Summary

| Page | Raven `search` | `stellarDocs.search_docs` (top 10) | Outcome |
|---|---|---|---|
| 1. Testnet reset (`/docs/networks#testnet-and-futurenet-data-reset`) | **Residual rank-1 misroute** (`search_soroban_contract_docs` #1 excludes `/docs/networks`; `search_docs` #2–3) | **Pass** (#1–#2) | Retain in TODO (Raven `search` routing only). |
| 2. Custom Account example (`custom-account` -> 308 -> `complex-account`, plus `simple-account`, `contract-accounts/examples`) | **Pass** (`search_soroban_contract_docs` #1 covers both paths) | **Pass** (`complex-account` and `simple-account` in top 10 on all 4 queries; `contract-accounts/examples` #1 on item query, #19 on `Q2d`; `get_doc_page` follows 308) | **Resolved on both paths.** Remove from TODO. |
| 3. Fee-sponsorship pages (`/docs/build/guides/transactions/fee-sponsorship`, `fee-bump-transactions`, `sponsored-reserves`) | **Residual rank-1 misroute** (`search_rpc_horizon_data_docs` #1 on item queries, `search_protocol_concepts_docs` #1 on question; both scopes exclude `/docs/build/guides/transactions/*`; `search_soroban_contract_docs` #2, `search_docs` #3–4) | **Pass** (all three in top 5 across all 3 queries) | Retain in TODO (Raven `search` routing only). |
| 4. Contract-ID derivation (`q-soroban-contract-id-derivation`: `stellar-transaction`, secondary `stellar-asset-contract`) | **Pass** (`Q4a`–`Q4e` route to eligible ops `search_soroban_contract_docs` #1–#2 and `search_docs` #2–#3 filtered) | **Fail on natural questions** (bare `contractIDPreimage` now ranks #1, improved since 2026-11-17; 5 of 5 natural derivation queries omit both pages from top 10, including 0/40 and 0/35 Mintlify sections on `Q4a` and `Q4f`) | Filed locally as **`sd-114`** (`verified`, `stellar/stellar-docs`). |

## Gates (Post-Challenge Fixes, All Run Bare)

| Gate | Exit Code | Result |
|---|---|---|
| `npm run improvements:index` | `0` | Wrote `improvements/INDEX.md` (94 findings) |
| `npm run improvements:lint` | `0` | `improvements lint ok (94 findings)` |
| `npm run improvements:file -- --file improvements/stellar-docs/sd-114-docs-search-contract-id-derivation.md --dry-run` | `0` | Rendered all 5 required sections cleanly; no internal note leaked |
| `npm run eval:routing -- --gate` | `0` | `GATE PASS` (unchanged from baseline; legacy 338 within band, skills & holdout at/above floors, 11/49 holdout forbidden captures) |
| `npm run typecheck` | `0` | Clean |
| `npm test` | `0` | 174 passed, 5 skipped (4165 passed, 3 expected fail, 5 skipped) |
| `npm run build` | `0` | Dry-run Worker bundle built cleanly |
| `npm run secrets:scan -- --tree` | `0` | `secret-scan: clean` |

## Codex Sol Review and Challenge Verdicts

- **Reviewer:** Codex Sol (`gpt-6.2-sol`, `model_reasoning_effort="high"`, read-only sandbox)
- **Findings reported:** 7 total (3 medium, 4 low)
- **Challenge verdicts by class:**
  - **Valid:** **7** (all 7 fixed in `PROBE.md` and `sd-114`; Finding 1 included one refuted sub-claim that conflated Mintlify's 0-section retrieval on `Q4a` with Raven operation routing)
  - **Invalid:** **0**
  - **Valid but not worth fixing:** **0**
- Full evidence in [CHALLENGE.md](./CHALLENGE.md).

## Pull Request and Impact Classification

- **PR URL:** https://github.com/stellar-experimental/stellar-raven/pull/523
- **Worker bytes changed (`git diff origin/main -- src/ package.json package-lock.json wrangler.jsonc`):** **No** (empty diff; 0 bytes changed in Worker code, dependencies, or Wrangler config).
- **Model-facing change:** **No** (docs/records and `improvements/` metadata only; no deploy required).

## TODO Item Status (for Orchestrator)

- **Target item:** `.agents/TODO.md` — **"Fix Docs search misses on canonical pages"** (not edited by this lane; only `todofix` edits `.agents/TODO.md`).
- **Implied TODO change:** Narrow rather than delete:
  1. Remove the resolved **Custom Account example** bullet (passes on both paths; `custom-account` 308-redirects to `complex-account`).
  2. Close the **contract-ID derivation / Mintlify ranking** bullet onto `sd-114` (`improvements/stellar-docs/sd-114-docs-search-contract-id-derivation.md`), noting that bare `contractIDPreimage` now ranks #1 while natural derivation questions still miss Mintlify top 10, and that all three HackMeridian pages pass `stellarDocs.search_docs` top 5 on item queries / top 10 overall.
  3. Retain only the two remaining **Raven `search` rank-1 routing misses** (testnet reset -> `search_soroban_contract_docs` excludes `/docs/networks`; fee sponsorship -> `search_rpc_horizon_data_docs` / `search_protocol_concepts_docs` exclude `/docs/build/guides/transactions/*`), gated on routing headroom (`holdout top1`, `top3`, and forbidden captures at their limits; Refs #223).

## Model Calls Made

| CLI | Model ID | Effort | Purpose | Cost |
|---|---|---|---|---|
| `codex` (subscription) | `gpt-6.2-sol` | `high` | Read-only independent review of `origin/main...d8ad450d` (`SOL-REVIEW.md`) | Subscription ($0 API) |

No model calls were made during the probe itself.

## Open Questions

1. **Upstream posting of `sd-114`:** Once merged, should the orchestrator/owner run `npm run improvements:file -- --file improvements/stellar-docs/sd-114-docs-search-contract-id-derivation.md` to file the Mintlify ranking issue in `stellar/stellar-docs` (same precedent as `sd-112` / `stellar/stellar-docs#3163`)?
2. **Remaining Raven `search` rank-1 misses (testnet reset, fee sponsorship):** Confirm keeping them folded behind routing-gate headroom (#223) rather than adding per-query exceptions.
