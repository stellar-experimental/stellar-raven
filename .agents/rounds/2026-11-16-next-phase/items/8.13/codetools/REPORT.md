# Item 8.13 Lane `codetools` — Final Report

- **Branch / PR 1 (scripts + workflows):** `np/8.13-codetools` -> https://github.com/stellar-experimental/stellar-raven/pull/526
- **Branch / PR 2 (eval code files):** `np/8.13-codetools-eval` -> https://github.com/stellar-experimental/stellar-raven/pull/535
- **Split rationale:** Per `8.13-SLIM.md` ("if your diff exceeds about 1,500 changed lines, split it into two PRs by sub-area"), the combined diff (~2,450 changed lines) was split into two conflict-free PRs rooted on `origin/main` with disjoint file sets.
- **Worker bytes changed:** No (`git diff origin/main...HEAD -- src/ package.json package-lock.json wrangler.jsonc` and `git diff origin/main...np/8.13-codetools-eval -- src/ package.json package-lock.json wrangler.jsonc` are both empty).
- **Model-facing change:** No (zero non-comment token/YAML diffs; all regenerated catalog/spec/family-text/globe/eval artifacts are byte-identical).
- **TODO item closed:** None (owner's 2026-11-20 item 8.13 slimming directive; `.agents/TODO.md` untouched).

## Summary of Changes

Comment-only slimming across **41 files** (20 `scripts/**`, 4 `.github/workflows/*.yml`, 17 `eval/**` `.mjs` code files):
- **Total lines (modified files):** 17,965 -> 16,440 (**-1,525 net lines**)
- **Comment lines (modified files):** 3,372 -> 1,853 (**-1,519 comment lines removed**)
- **Non-comment JS token / YAML diffs:** **0** across all 41 files (verified with `esbuild` comment-stripped comparison for `.mjs`/`.js`/`.ts` and comment-stripped line comparison for `.yml`).
- **Stale comment accuracy fixes landed:**
  - `scripts/refresh-inventory.mjs` & `scripts/build-catalog.mjs`: updated "three" service snapshots to four services (`lumenloop`, `stellar-light`, `stellar-docs`, `stellar-org`).
  - `scripts/build-super-spec.mjs`: added `stellarOrg` to header service list; updated `skills` path count from 3 to 4.
  - `.github/workflows/refresh.yml`: removed stale claim that `check-skills-drift.mjs` reads `LUMENLOOP_API_KEY`; clarified `.env` deletion timing and exit-code/drift semantics.
  - `eval/qa/run-qa.mjs`: replaced stale "manifest's 60 operations" (now 61) with "manifest operations".
  - `eval/qa/analyze-composition.mjs`: removed stale `Node >= 22.6` header note (repo requires Node 24).
  - `eval/report-live-surface.mjs`, `eval/qa/source-sentinels.mjs`, `eval/qa/agent-result.mjs`, `eval/qa/evidence-sanitizer.mjs`, `eval/run-routing.mjs`, `scripts/scan-secrets.mjs`, `scripts/refresh-inventory.mjs`, `scripts/diff-pins.mjs`, `scripts/classify-canary.mjs`, `scripts/description-notes.mjs`: precision fixes verified from Codex Sol reviews.
- **No case, split, corpus, or result data files were opened or modified.**

### Before / After Line and Comment Counts

#### PR 1 (`np/8.13-codetools`, #526) — 24 files

| File | Lines Before | Lines After | Net Lines | Comment Lines |
|---|---:|---:|---:|---|
| `.github/workflows/ci.yml` | 142 | 106 | -36 | 50 -> 14 (-36) |
| `.github/workflows/dependency-audit.yml` | 84 | 77 | -7 | 14 -> 7 (-7) |
| `.github/workflows/golden-sentinels.yml` | 102 | 92 | -10 | 17 -> 7 (-10) |
| `.github/workflows/refresh.yml` | 332 | 266 | -66 | 94 -> 28 (-66) |
| `scripts/build-catalog.mjs` | 1447 | 1308 | -139 | 310 -> 173 (-137) |
| `scripts/build-super-spec.mjs` | 943 | 859 | -84 | 173 -> 92 (-81) |
| `scripts/catalog-data/source-families.mjs` | 42 | 28 | -14 | 27 -> 13 (-14) |
| `scripts/check-mirrors.mjs` | 163 | 134 | -29 | 38 -> 9 (-29) |
| `scripts/check-pin-review.mjs` | 159 | 121 | -38 | 56 -> 18 (-38) |
| `scripts/check-skills-drift.mjs` | 338 | 282 | -56 | 94 -> 38 (-56) |
| `scripts/classify-canary.mjs` | 90 | 63 | -27 | 49 -> 22 (-27) |
| `scripts/deploy-preflight.mjs` | 76 | 58 | -18 | 26 -> 8 (-18) |
| `scripts/description-notes.mjs` | 327 | 236 | -91 | 129 -> 38 (-91) |
| `scripts/diff-pins.mjs` | 156 | 136 | -20 | 32 -> 12 (-20) |
| `scripts/emitted-text-guard.mjs` | 91 | 76 | -15 | 31 -> 16 (-15) |
| `scripts/eval-partner-docs.mjs` | 444 | 433 | -11 | 38 -> 27 (-11) |
| `scripts/exposure.mjs` | 154 | 99 | -55 | 85 -> 30 (-55) |
| `scripts/gen-globes.mjs` | 83 | 56 | -27 | 39 -> 12 (-27) |
| `scripts/improvements-file-issue.mjs` | 391 | 355 | -36 | 58 -> 22 (-36) |
| `scripts/lib/skill-mirror.mjs` | 188 | 171 | -17 | 67 -> 50 (-17) |
| `scripts/refresh-inventory.mjs` | 644 | 611 | -33 | 122 -> 89 (-33) |
| `scripts/run-demo-model-gauntlet.mjs` | 815 | 754 | -61 | 112 -> 51 (-61) |
| `scripts/scan-secrets.mjs` | 302 | 263 | -39 | 78 -> 40 (-38) |
| `scripts/summarize-live-drift.mjs` | 640 | 627 | -13 | 49 -> 36 (-13) |
| **PR 1 Subtotal** | **8,153** | **7,211** | **-942** | **1,788 -> 852 (-936)** |

#### PR 2 (`np/8.13-codetools-eval`, #535) — 17 files

| File | Lines Before | Lines After | Net Lines | Comment Lines |
|---|---:|---:|---:|---|
| `eval/agentic/reconcile-capture.mjs` | 401 | 383 | -18 | 59 -> 41 (-18) |
| `eval/compile-routing.mjs` | 175 | 152 | -23 | 40 -> 17 (-23) |
| `eval/lib/grade.mjs` | 237 | 226 | -11 | 64 -> 53 (-11) |
| `eval/lib/harness-guards.mjs` | 351 | 323 | -28 | 91 -> 63 (-28) |
| `eval/lib/mcp-surface.mjs` | 183 | 169 | -14 | 45 -> 31 (-14) |
| `eval/plan/build-op-classes.mjs` | 150 | 133 | -17 | 45 -> 28 (-17) |
| `eval/plan/grade-plan.mjs` | 419 | 377 | -42 | 92 -> 50 (-42) |
| `eval/qa/agent-result.mjs` | 621 | 520 | -101 | 207 -> 106 (-101) |
| `eval/qa/analyze-composition.mjs` | 301 | 282 | -19 | 54 -> 35 (-19) |
| `eval/qa/evidence-sanitizer.mjs` | 851 | 774 | -77 | 184 -> 107 (-77) |
| `eval/qa/judge.mjs` | 1382 | 1312 | -70 | 163 -> 93 (-70) |
| `eval/qa/re-judge.mjs` | 1144 | 1138 | -6 | 64 -> 58 (-6) |
| `eval/qa/run-qa.mjs` | 2437 | 2369 | -68 | 260 -> 192 (-68) |
| `eval/qa/search-projection.mjs` | 117 | 104 | -13 | 37 -> 24 (-13) |
| `eval/qa/source-sentinels.mjs` | 323 | 310 | -13 | 51 -> 38 (-13) |
| `eval/report-live-surface.mjs` | 152 | 133 | -19 | 36 -> 17 (-19) |
| `eval/run-routing.mjs` | 568 | 524 | -44 | 92 -> 48 (-44) |
| **PR 2 Subtotal** | **9,812** | **9,229** | **-583** | **1,584 -> 1,001 (-583)** |
| **Combined Total (41 files)** | **17,965** | **16,440** | **-1,525** | **3,372 -> 1,853 (-1,519)** |

## Gates & Verification (after final Sol fixes)

| Gate | PR 1 (#526) | PR 2 (#535) |
|---|---|---|
| `npm run typecheck` | exit 0 | exit 0 |
| `npm test` | exit 0 (174 passed, 5 skipped; 4,165 tests) | exit 0 (174 passed, 5 skipped; 4,165 tests) |
| `npm run build` | exit 0 | exit 0 |
| `npm run secrets:scan -- --tree` | exit 0 | exit 0 |
| `npm run improvements:lint` | exit 0 (93 findings) | n/a |
| `npm run eval:selftest` | n/a | exit 0 |
| `npm run eval:qa:lint -- --stale --enforce-floors` | n/a | exit 0 (0 errors) |
| `npm run eval:qa:register -- --check` | n/a | exit 0 (up to date) |
| `npm run eval:routing -- --gate` | exit 0 (identical aggregates) | exit 0 (identical aggregates) |
| Generated artifacts byte-sync (`build-catalog`, `family-text:build`, `spec:build`, `site:globes`, `compile-routing`, `compile-qa`, `build-op-classes`) | exit 0 (0 diffs) | exit 0 (0 diffs) |
| Non-comment token/YAML diff (`esbuild` / YAML strip) | exit 0 (0 diffs / 24 files) | exit 0 (0 diffs / 17 files) |

Routing gate aggregates (identical before and after on both PRs):
- Legacy 338 strict: top-1 `64.8%`, top-3 `86.7%`, top-5 `96.4%`, card@5 `62.6% (182)`
- Extended 122 strict: top-1 `76.2%`, top-3 `91.8%`, top-5 `95.9%`
- Skills 23 strict: top-1 `73.9%`, top-3 `100.0%`, top-5 `100.0%`
- Holdout 49: top-1 `24.5%`, top-3 `53.1%`, top-5 `61.2%`, forbidden captures `11/49`

## Codex Sol Review & Challenge Summary

Both PRs were independently reviewed read-only by Codex CLI (`gpt-6.2-sol`, `model_reasoning_effort="high"`), and every finding was verified against the code before acting:

| PR | Review / Challenge Files | Valid (fixed) | Invalid | Valid, not worth fixing |
|---|---|---:|---:|---:|
| PR 1 (#526) | `SOL-REVIEW.md` / `CHALLENGE.md` | 12 | 0 | 0 |
| PR 2 (#535) | `SOL-REVIEW-eval.md` / `CHALLENGE-eval.md` | 8 | 0 | 1 |
| **Total** | | **20** | **0** | **1** |

The single "valid, not worth fixing" finding (PR 2 Finding 2) notes that editing comments in `eval/qa/*.mjs` and `eval/lib/*.mjs` changes `meta.sourceIdentity.qaImplementationSha256` (which hashes raw file bytes). This is expected for any edit to those files; see note below.

## Model Calls Made

| CLI | Resolved Model ID | Effort | Purpose |
|---|---|---|---|
| `codex exec` (subscription, read-only) | `gpt-6.2-sol` | `high` | Independent review of PR 1 (`scripts/**` + `.github/workflows/*.yml`, #526) |
| `codex exec` (subscription, read-only) | `gpt-6.2-sol` | `high` | Independent review of PR 2 (`eval/**` code files, #535) |

No API-billed, AI Gateway, or Workers AI calls were made.

## Open Questions / Notes for Orchestrator & Owner

1. **Merge timing note for PR #535 (`qaImplementationSha256`):** Because `eval/qa/run-qa.mjs:sourceIdentity()` hashes raw `.mjs` bytes under `eval/qa/` and `eval/lib/`, merging PR #535 changes `qaImplementationSha256`. Standard paired runs (`eval/qa/paired-collection-supervisor.mjs`) run both arms from one runner checkout and are unaffected, but if any active session plans to pair a pre-PR baseline artifact against a post-PR candidate artifact, hold merging PR #535 until that pair completes.
2. **Optional follow-up (out of scope for comment-only lane):** `eval/report-live-surface.mjs:51` throws HTTP error messages containing `text.slice(0, 200)` without redacting `RAVEN_MCP_BEARER_TOKEN` if a misconfigured proxy/server echoes the `Authorization` header. We corrected the misleading "never printed" comment in PR #535; if desired, a small code follow-up could scrub `token` from the error excerpt.
