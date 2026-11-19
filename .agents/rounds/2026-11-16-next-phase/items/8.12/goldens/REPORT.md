# Item 8.12 (`goldens`) — Lane report

Date: 2026-11-19 UTC
Lane: `goldens` (Gemini 4 Neon, Antigravity)
Branch: `np/8.12-goldens`
Pull request: https://github.com/stellar-experimental/stellar-raven/pull/511
Deadline: merge before 2026-11-23 18:00 UTC

## Summary & what changed

Audited `q-tool-freighter-wallet`, `q-tool-wallets-comparison`, and their matching entries in `eval/qa/cases.json` under the `eval/qa/README.md` Maintenance Exception (trigger: 2026-11-16 Stellar Docs retitle of `/docs/build/guides/freighter*` to Varial and Scout 1.9.150 SDK-status schema additions/redefinition; source record `.agents/rounds/2026-11-16-next-phase/items/0.2/REPORT.md`). No other case was opened, no split membership was consulted or recorded, no stored Raven output/verdict was read, and no judge-facing case text is quoted or paraphrased in this PR or its records.

- **`q-tool-freighter-wallet`:** **Confirmed unchanged.** Verified live on 2026-11-19 across independent source classes A, B, C, E, and F (upstream Docs/Varial/GitHub/redirect checks plus local Raven `stellarDocs` and `scout` reads on port 8794). Already updated for the 2026-10-29 rename in PR #319 (2026-11-02) and re-verified in PR #436 (2026-11-14); unaffected by Scout 1.9.150's SDK-status fields; all `truth.sources` URLs return HTTP 200; `eval/qa/cases.json` equals the parsed battery object; `truth.reverifyBy` is `2027-02-09`.
- **`q-tool-wallets-comparison`:** **Confirmed unchanged.** Verified live on 2026-11-19 across classes A, B, C, E, and F. Already updated in PR #319 and PR #436, with judge-blind `truth.notes` updated on 2026-11-17 (PR #456) for `sls-033` on Scout 1.9.150; unaffected by Scout 1.9.150's SDK-status fields; all HTTP URLs in `truth.sources` return HTTP 200 (and Class F redirects return 301/307); `eval/qa/cases.json` equals the parsed battery object; `truth.reverifyBy` is `2027-05-14`.
- **Files added/changed on branch `np/8.12-goldens`:** Records only under `.agents/rounds/2026-11-16-next-phase/items/8.12/goldens/`:
  - `VERIFICATION.md` — primary-source verification record
  - `SOL-REVIEW.md` — Codex Sol read-only review
  - `CHALLENGE.md` — finding-by-finding challenge and dispositions
  - `REPORT.md` — this lane report
- No files under `eval/qa/`, `src/`, `catalog/`, `inventory/`, `.agents/TODO.md`, or the round ledger were modified. No case moved between splits.

## Worker bytes & model-facing impact

- `git diff origin/main -- src/ package.json package-lock.json wrangler.jsonc`: **empty (0 lines)** — Worker bytes do **not** change.
- **Model-facing:** **No.** Records-only PR; no deploy required.

## Codex Sol review & challenge

- **Reviewer:** OpenAI Codex `v0.169.0`, resolved model `gpt-6.2-sol`, `model_reasoning_effort="high"`, `-s read-only`, under the same Maintenance Exception (authorized to open only `q-tool-freighter-wallet`, `q-tool-wallets-comparison`, and their two compiled entries).
- **Sol headline verdict:** Agreed that judge-facing fields in both cases stay unchanged, found no Maintenance Exception Records violation, and independently confirmed the `0.2/EXEC.md:155` vs `0.2/REPORT.md:72` provenance gap.
- **Challenge counts by class** (full evidence in `CHALLENGE.md`):
  - **valid:** 2 (Finding 2: PR #452 title-hold vs PR #474 absorb precision and `Repo.codeVerified.versionStatus` redefinition; Finding 3: missing `query` parameter for `stellarDocs.search_wallet_dapp_docs` reproducibility) — both fixed in `VERIFICATION.md`.
  - **invalid:** 1 (Finding 1: request to bump `truth.asOf`/`truth.reverifyBy` inside both unchanged scheduled case JSONs — refuted by `8.12-LANES.md:13`, `.agents/TODO.md:244`, `eval/qa/README.md:255`, `eval/qa/lint-corpus.mjs:669-671`, and PR #456 precedent).
  - **valid but not worth fixing:** 1 (Finding 4: "verbatim" vs parsed-JSON equality across `compile-qa.mjs:336` wrapper indentation — `.agents/skills/golden-truth/SKILL.md:136` defines parity on parsed JSON).

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

- `.agents/TODO.md` — **"Look at the Freighter and Scout SDK-status goldens"**: closed for both cases named in the TODO item and lane brief (`q-tool-freighter-wallet` and `q-tool-wallets-comparison`, both confirmed unchanged). See Open questions below regarding the two Scout SDK-status case IDs from `0.2/EXEC.md:155` that `0.2/REPORT.md` omitted.

## Model calls made

| CLI | Resolved model ID | Purpose | Cost / billing |
|---|---|---|---|
| Antigravity (`agy`) | Gemini 4 Neon (High) | Lane `goldens` primary-source verification, challenge, records, PR | Subscription (USD 0 API) |
| OpenAI Codex `v0.169.0` | `gpt-6.2-sol` (`model_reasoning_effort="high"`) | Read-only independent review (`SOL-REVIEW.md`) | Subscription (USD 0 API) |

No AI Gateway, Workers AI, provider-API, or model-calling eval runs were made. Local `wrangler dev --port 8794` was started only for read-only `stellarDocs` and `scout` connector verification and stopped cleanly afterwards.

## Open questions for the orchestrator

1. **Omitted Scout 1.9.150 SDK-status case IDs (`0.2/EXEC.md:155` vs `0.2/REPORT.md:72`):** Item 0.2's path-only consumer grep found two *other* QA case IDs for Scout 1.9.150's new/redefined SDK-status schema terms (`jsSdkStatus`, `sorobanSdkStatus`, `stellarJsDep`, redefined `Repo.codeVerified.versionStatus`): **`q-soroban-cli-bindings`** and **`q-tool-indexer-repos-discovery`** (`0.2/EXEC.md:155`). `0.2/REPORT.md:72-74` combined both triggers into a single bullet that named only `q-tool-freighter-wallet` and `q-tool-wallets-comparison`, and `.agents/TODO.md` inherited that omission. Respecting the strict scope ceiling ("open no other case"), neither this lane nor Codex Sol opened `q-soroban-cli-bindings` or `q-tool-indexer-repos-discovery`. Recommend deciding whether to close the TODO item now or spawn a narrow follow-up maintenance lane scoped specifically to `q-soroban-cli-bindings` and `q-tool-indexer-repos-discovery` (noting that `Repo.codeVerified.versionStatus` changed semantics in Scout 1.9.150 from Soroban-SDK-only to combined Soroban/JS SDK status).
