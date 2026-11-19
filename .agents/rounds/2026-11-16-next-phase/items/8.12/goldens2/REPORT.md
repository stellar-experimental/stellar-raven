# Item 8.12 (`goldens2`) — Lane report

Date: 2026-11-19 UTC
Lane: `goldens2` (Gemini 4 Neon, Antigravity)
Branch: `np/8.12-goldens2`
Pull request: https://github.com/stellar-experimental/stellar-raven/pull/514
Deadline: merge before 2026-11-23 18:00 UTC

## Summary & what changed

Audited `q-soroban-cli-bindings`, `q-tool-indexer-repos-discovery`, and their matching entries in `eval/qa/cases.json` and `eval/qa/sample.json` under the `eval/qa/README.md` Maintenance Exception (trigger: Scout 1.9.150 adding `jsSdkStatus`, `sorobanSdkStatus`, and `stellarJsDep` and redefining `Repo.codeVerified.versionStatus` from Soroban-SDK-only to combined Soroban/JS SDK status; source record `.agents/rounds/2026-11-16-next-phase/items/0.2/EXEC.md:155` and live Scout 1.9.150 OpenAPI schema). This follows up lane `goldens` (PR #511) for the two Scout SDK-status cases omitted from `0.2/REPORT.md` and `.agents/TODO.md`. No other case was opened, no split membership was consulted or recorded, no stored Raven output/verdict was read, and no judge-facing case text is quoted or paraphrased in this PR or its records.

- **`q-soroban-cli-bindings`:** **Confirmed unchanged.** Verified live on 2026-11-19 across independent source classes A, B, and E (upstream Stellar Docs, pinned GitHub commits on `stellar/stellar-cli` `v30.0.1`/`main` and `stellar/js-stellar-sdk` `main`, `stellar/stellar-docs#3151`/`#3153`, and local Raven `stellarDocs` reads on port 8797). Service is `stellarDocs` with no Scout surface or Scout SDK-status field dependency; `sd-110` still reproduces upstream; all 5 HTTP URLs in `truth.sources` return HTTP 200; parsed-JSON deep equality holds in `eval/qa/cases.json` and `eval/qa/sample.json`; keeps `truth.asOf` (`2026-11-14`) and `truth.reverifyBy` (`2027-06-10`).
- **`q-tool-indexer-repos-discovery`:** **Confirmed unchanged.** Verified live on 2026-11-19 across classes A, B, C, and E (upstream Stellar Docs, `truth.sources` GitHub repos at pinned commits plus `stellar-rpc v30.0.1` tagged source, live Scout 1.9.150 OpenAPI, and local Raven `scout.searchRepos` / `scout.analyzeEcosystem` / `stellarDocs.search_docs` reads on port 8797). Judge-facing and judge-blind fields do not depend on `versionStatus`, `sorobanSdkStatus`, `jsSdkStatus`, or `stellarJsDep`; top-level `scout.searchRepos` row keys still include `repoScore`, `codeVerified`, and `activityState` with no `license` key; all 18 distinct HTTP URLs (19 total URL references across 17 URL-bearing rows) in `truth.sources` return HTTP 200; parsed-JSON deep equality holds in `eval/qa/cases.json`; keeps `truth.asOf` (`2026-11-02`) and `truth.reverifyBy` (`2027-04-22`).
- **Files added on branch `np/8.12-goldens2`:** Records only under `.agents/rounds/2026-11-16-next-phase/items/8.12/goldens2/`:
  - `VERIFICATION.md` — primary-source verification record and per-URL HTTP ledger
  - `SOL-REVIEW.md` — Codex Sol read-only review
  - `CHALLENGE.md` — finding-by-finding challenge and dispositions
  - `REPORT.md` — this lane report
- No files under `eval/qa/`, `src/`, `catalog/`, `inventory/`, `.agents/TODO.md`, or the round ledger were modified. No case moved between splits.

## Worker bytes & model-facing impact

- `git diff origin/main -- src/ package.json package-lock.json wrangler.jsonc`: **empty (0 lines)** — Worker bytes do **not** change.
- **Model-facing:** **No.** Records-only PR; no deploy required.

## Codex Sol review & challenge

- **Reviewer:** OpenAI Codex `v0.169.0`, resolved model `gpt-6.2-sol` (`node scripts/latest-model.mjs sol`), `model_reasoning_effort="high"`, `-s read-only`, under the same Maintenance Exception (authorized to open only `q-soroban-cli-bindings`, `q-tool-indexer-repos-discovery`, and their compiled entries).
- **Sol headline verdict:** `FAIL` on the first draft of `VERIFICATION.md` (High Records-rule hygiene leak + 2 Medium + 2 Low precision/reproducibility findings), while independently confirming that both cases are unaffected by Scout 1.9.150, their corpus files and `truth` dates stay unchanged, compiled parity and all three cluster hashes match, neither case has a source sentinel, and no split membership was disclosed.
- **Challenge counts by class** (full empirical verification in `CHALLENGE.md`):
  - **valid:** 5 (Finding 1 High: remove judge-facing text overlap from `VERIFICATION.md:23,25-27`; Finding 2 Medium: pin `stellar/stellar-cli` `v30.0.1` and `main` commit SHAs; Finding 3 Medium: verify `stellar-rpc v30.0.1` directly in tagged source `rpcv1/config/options.go` and `methods/get_events.go` instead of inferring from release notes; Finding 4 Low: avoid attributing which ellipsis-abbreviated grep branch hit in `0.2/EXEC.md:155`; Finding 5 Low: include the full per-URL HTTP-200 check ledger and directly fetch both compound-row query suffixes) — all 5 verified and fixed in `VERIFICATION.md`.
  - **invalid:** 0
  - **valid but not worth fixing:** 0

## Gates (final tree, each run bare)

| Command | Exit | Result |
|---|---|---|
| `npm run typecheck` | 0 | clean (`env.d.ts` generated via `npm run typegen` with local `.dev.vars`) |
| `npm test` | 0 | 173 passed, 5 skipped (178 files); 4153 passed, 3 expected fail, 5 skipped (4161 tests) |
| `npm run build` | 0 | `wrangler deploy --dry-run` clean |
| `npm run secrets:scan -- --tree` | 0 | clean — scanned all tracked files |
| `npm run eval:qa:lint -- --stale --enforce-floors` | 0 | 0 error(s), 98 warning(s) |
| `npm run eval:qa:lint -- --since origin/main --stale --enforce-floors` | 0 | 0 error(s), 98 warning(s) |
| `npm run eval:qa:register -- --check` | 0 | up to date |
| `npm run eval:selftest` | 0 | self-test: all checks passed |
| `npm run eval:qa:sentinels -- --check` | 0 | 21 sentinels; 0 errors; 0 stale |

## TODO item closed

- `.agents/TODO.md` — **"Look at the Freighter and Scout SDK-status goldens"**: completes the remaining Scout 1.9.150 SDK-status half from `0.2/EXEC.md:155` (`q-soroban-cli-bindings` and `q-tool-indexer-repos-discovery`, both confirmed unchanged). Combined with lane `goldens` (PR #511, which confirmed `q-tool-freighter-wallet` and `q-tool-wallets-comparison` unchanged), all four cases from `0.2/EXEC.md:155,158` are verified and the TODO item is ready to close.

## Model calls made

| CLI | Resolved model ID | Purpose | Cost / billing |
|---|---|---|---|
| Antigravity (`agy`) | Gemini 4 Neon (High) | Lane `goldens2` primary-source verification, Sol challenge, records, PR | Subscription (USD 0 API) |
| OpenAI Codex `v0.169.0` | `gpt-6.2-sol` (`model_reasoning_effort="high"`) | Read-only independent review (`SOL-REVIEW.md`) | Subscription (USD 0 API) |

No AI Gateway, Workers AI, provider-API, or model-calling eval runs were made. Local `wrangler dev --port 8797` was started only for read-only `scout` and `stellarDocs` connector verification and stopped cleanly afterwards (port 8797 verified clear).

## Open questions

None.

## Records re-check

Line-by-line and 3-gram overlap audit on 2026-11-19 against every judge-facing field (`question`, `golden.*`) of `q-soroban-cli-bindings` and `q-tool-indexer-repos-discovery` under `eval/qa/README.md` ("Maintenance exception", "Records"):

- **`SOL-REVIEW.md` (lines 1-11):** Checked all lines; zero quotes or paraphrases of judge-facing text (references are by file, line, and field name only). Unchanged.
- **`CHALLENGE.md` (lines 1-53):** Rewrote lines 24, 32, 36, and 38 to remove an indirect pointer to the quoted span in Finding 1, remove a `truth.sources` repo name overlapping `golden.*` in Finding 2, and state the Finding 3 tagged-source check strictly by file, line, and commit SHA without paraphrasing release behavior.
- **`REPORT.md` (lines 1-65):** Rewrote lines 14 and 32 to avoid naming a repo or behavior term overlapping `golden.*`, and appended this section.
- **`VERIFICATION.md` (lines 1-78):** Tightened lines 23, 24, 27, 29, 32, 35, 36, 71, and 77 so no remaining upstream summary, CLI version/date echo, or Docs query string paraphrases or echoes judge-facing text.
