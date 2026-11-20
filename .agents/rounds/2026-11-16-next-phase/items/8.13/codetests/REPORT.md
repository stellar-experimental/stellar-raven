# Item 8.13 — `codetests` lane report

- Branch: `np/8.13-codetests` (base merge-base `c52dca8a`)
- PR: https://github.com/stellar-experimental/stellar-raven/pull/534
- Scope: Comments in `test/**` only (no assertion, fixture, test-name, `test/README.md`, or `test/fixtures/**` changes).

## What changed

Trimmed verbose, stale, and historical comments across **59 files** under `test/` while preserving all load-bearing "why" comments, directives (`@ts-expect-error`, `@ts-ignore`, `eslint-disable-next-line`, `secret-scan:allow`), shebangs, and manual run invocations.

- **Line counts (59 modified files):** 33333 -> 32329 (**-1004** net lines; `git diff --shortstat c52dca8a -- test/`: 59 files changed, 260 insertions(+), 1264 deletions(-)).
- **Comments removed:** 169 comment blocks removed (894 -> 725), 1029 comment lines removed (2119 -> 1090, -48.6%), 549 comment tokens removed (1540 -> 991).
- **Stale comment inaccuracies fixed:**
  - `test/executor-providers.test.ts`: removed stale op count `// 21 + 24 + 12` (actual exposed ops: 61).
  - `test/super-spec.test.ts`: removed stale `3 ops` skills count in file header (actual: 4).
  - `test/skill-content-not-vendored.test.ts`: removed stale `~18` skill count and `~11.6 KB` / `33.7 KB` historical byte counts (actual: 20 skills, 12,981 bytes).
  - `test/skill-canary.test.ts`: replaced stale `~30 urls` with `every pinned URL` (actual: 65 pins).
  - `test/site-lazy-counts.test.ts`: removed stale `~700 KB` manifest size (actual: ~1.35 MB).
  - `test/search.test.ts`: removed stale `300+ competing entries` (actual: 285).
  - `test/oauth-origins.test.ts`: removed references to nonexistent `DESIGN.md` (`D1`/`D2`/`D5`).
  - `test/qa-harness-preconditions.test.mjs`: removed reference to nonexistent `.agents/rounds/2026-08-26-connectors-contract.md`.
  - `test/smoke/vitest.config.ts`, `test/demo-page.test.ts`, `test/demo-frames.test.ts`, `test/emitted-text-guard.test.ts`: updated stale `/demo` route phrasing to Playground / `src/demo/`.
  - `test/re-judge.test.ts`: moved orphaned `stubClaudeDirectory` comment from above `writeDivergentCasesPair` onto `stubClaudeDirectory`.

## Proof of no behavior or model-facing change

- **Non-comment code byte-identity:** Parsed every modified file before (`c52dca8a`) and after with `node:module` `stripTypeScriptTypes(..., { mode: "strip" })` + `acorn` comment offsets, stripped comments from the original TypeScript/JavaScript source (preserving TypeScript types, test names, assertions, strings, and directives), and verified **0 code-line mismatches** across all 59 files.
- **Worker bytes changed:** **No.** `git diff origin/main...HEAD -- src/ package.json package-lock.json wrangler.jsonc` outputs 0 lines.
- **Model-facing text changed:** **No.** Zero files under `src/`, `catalog/`, `specs/`, or `ecosystem-skills/` were modified.
- **Routing gate aggregate:** Identical before and after (legacy 338: top-1 64.8%, top-3 86.7%, top-5 96.4%, card@5 62.6%; extended 122: top-1 76.2%, top-3 91.8%, top-5 95.9%; skills 23: top-1 73.9%, top-3 100.0%, top-5 100.0%; holdout 49: top-1 24.5%, top-3 53.1%, top-5 61.2%, forbidden captures 11/49).

## Gates (final rerun after Codex Sol fixes)

| Gate | Exit code | Result |
|---|---:|---|
| `npm run typecheck` | 0 | Clean (`tsc --noEmit`) |
| `npm test` | 0 | 174 passed, 5 skipped (179 files); 4,165 passed, 3 expected fail, 5 skipped (4,173 tests) |
| `npm run test:smoke` | 0 | 10 passed (10 files); 173 passed (173 tests) |
| `npm run build` | 0 | Dry-run bundle succeeded (6922.73 KiB / gzip 1376.10 KiB) |
| `npm run secrets:scan -- --tree` | 0 | Clean — scanned all tracked files |
| `npm run eval:routing -- --gate` | 0 | `GATE PASS`, identical aggregates before and after |

## Codex Sol review and challenge

- Review: `.agents/rounds/2026-11-16-next-phase/items/8.13/codetests/SOL-REVIEW.md`
- Challenge: `.agents/rounds/2026-11-16-next-phase/items/8.13/codetests/CHALLENGE.md`
- Reviewer scope check: confirmed 0 non-comment token changes across all 59 files and 0 files outside `test/`.
- Challenge verdicts by class:
  - **valid:** 10 (4 medium, 6 low) — all 10 independently confirmed against code/library source and fixed before final gate rerun.
  - **invalid:** 0
  - **valid but not worth fixing:** 0

## TODO item closed

None in `.agents/TODO.md` — this lane executes the `codetests` slimming scope from the owner's 2026-11-20 instruction (`8.13-SLIM.md`, `8.13-LANES.md`).

## Model calls made

| CLI | Model ID | Purpose |
|---|---|---|
| Antigravity (`agy`) | Gemini 4 Neon (High) | Lane author, verification, Sol challenge, and fixes |
| `codex` | `gpt-6.2-sol` (reasoning effort `high`, sandbox `read-only`) | Independent diff review (`SOL-REVIEW.md`) |

No AI Gateway, Workers AI, or provider-API calls were made.

## Questions for the owner

None.

## Per-file before / after counts

| File | Lines before | Lines after | Line delta | Comment blocks before | Comment blocks after | Comment lines before | Comment lines after |
|---|---:|---:|---:|---:|---:|---:|---:|
| `test/adapters.test.ts` | 1521 | 1516 | -5 | 30 | 30 | 43 | 38 |
| `test/agentic-capture.test.mjs` | 495 | 487 | -8 | 6 | 6 | 16 | 8 |
| `test/analyze-composition.test.mjs` | 164 | 158 | -6 | 9 | 9 | 18 | 12 |
| `test/auth.test.ts` | 1448 | 1346 | -102 | 63 | 27 | 138 | 42 |
| `test/case-search-guard.test.mjs` | 665 | 665 | 0 | 26 | 26 | 29 | 29 |
| `test/catalog-guards.test.mjs` | 442 | 431 | -11 | 4 | 4 | 19 | 8 |
| `test/catalog.test.ts` | 846 | 824 | -22 | 23 | 23 | 56 | 34 |
| `test/check-pin-review.test.ts` | 223 | 208 | -15 | 10 | 8 | 29 | 14 |
| `test/classify-canary.test.ts` | 101 | 87 | -14 | 10 | 10 | 34 | 20 |
| `test/compare-architecture-ab.test.mjs` | 499 | 497 | -2 | 7 | 6 | 13 | 11 |
| `test/demo-budget.test.ts` | 168 | 160 | -8 | 7 | 6 | 14 | 7 |
| `test/demo-copy-core.test.ts` | 294 | 283 | -11 | 6 | 6 | 24 | 13 |
| `test/demo-frames.test.ts` | 41 | 37 | -4 | 2 | 2 | 7 | 3 |
| `test/demo-model-config.test.ts` | 537 | 520 | -17 | 24 | 24 | 54 | 37 |
| `test/demo-page.test.ts` | 179 | 163 | -16 | 6 | 4 | 24 | 7 |
| `test/demo-prompt.test.ts` | 56 | 50 | -6 | 2 | 2 | 9 | 3 |
| `test/diff-pins.test.ts` | 60 | 53 | -7 | 4 | 4 | 16 | 9 |
| `test/emitted-text-guard.test.ts` | 155 | 147 | -8 | 4 | 4 | 17 | 9 |
| `test/executor-providers.test.ts` | 1874 | 1843 | -31 | 62 | 46 | 107 | 58 |
| `test/helpers/fake-judge-cli.mjs` | 151 | 138 | -13 | 13 | 13 | 33 | 20 |
| `test/helpers/memory-kv.ts` | 69 | 64 | -5 | 2 | 2 | 12 | 7 |
| `test/helpers/paired-plan-fixtures.mjs` | 146 | 139 | -7 | 5 | 5 | 15 | 8 |
| `test/helpers/skill-source.ts` | 75 | 65 | -10 | 5 | 5 | 25 | 15 |
| `test/improvements-file-issue.test.ts` | 508 | 489 | -19 | 25 | 25 | 54 | 35 |
| `test/mcp-instructions.test.ts` | 287 | 267 | -20 | 20 | 12 | 41 | 13 |
| `test/oauth-origins.test.ts` | 630 | 614 | -16 | 12 | 9 | 27 | 14 |
| `test/observability.test.ts` | 191 | 185 | -6 | 3 | 3 | 9 | 3 |
| `test/partner-docs-eval.test.mjs` | 209 | 208 | -1 | 5 | 5 | 7 | 6 |
| `test/plan-grade.test.mjs` | 283 | 277 | -6 | 9 | 9 | 19 | 13 |
| `test/policy.test.ts` | 383 | 372 | -11 | 15 | 14 | 36 | 25 |
| `test/qa-agent-result.test.mjs` | 888 | 829 | -59 | 24 | 19 | 86 | 27 |
| `test/qa-harness-preconditions.test.mjs` | 1468 | 1457 | -11 | 8 | 8 | 22 | 11 |
| `test/qa-judge-evidence.test.mjs` | 1979 | 1957 | -22 | 48 | 43 | 100 | 78 |
| `test/qa-judge-stability.test.mjs` | 570 | 569 | -1 | 1 | 0 | 1 | 0 |
| `test/qa-judge-stored.test.mjs` | 1754 | 1741 | -13 | 30 | 30 | 53 | 40 |
| `test/qa-measure-harness.test.mjs` | 388 | 387 | -1 | 5 | 5 | 7 | 6 |
| `test/qa-paired-verdict.test.mjs` | 1338 | 1335 | -3 | 6 | 6 | 9 | 6 |
| `test/qa-verdict-consistency.test.mjs` | 900 | 894 | -6 | 6 | 6 | 15 | 9 |
| `test/re-judge.test.ts` | 1218 | 1218 | 0 | 9 | 10 | 18 | 18 |
| `test/retention.test.ts` | 41 | 34 | -7 | 1 | 1 | 8 | 1 |
| `test/scoring.test.ts` | 461 | 438 | -23 | 17 | 17 | 50 | 27 |
| `test/search.test.ts` | 1867 | 1754 | -113 | 68 | 21 | 147 | 27 |
| `test/server.test.ts` | 1979 | 1920 | -59 | 46 | 32 | 107 | 48 |
| `test/site-lazy-counts.test.ts` | 72 | 66 | -6 | 1 | 1 | 10 | 4 |
| `test/skill-canary.test.ts` | 339 | 321 | -18 | 21 | 20 | 53 | 35 |
| `test/skill-content-not-vendored.test.ts` | 66 | 56 | -10 | 3 | 3 | 18 | 8 |
| `test/skill-run.test.ts` | 536 | 513 | -23 | 26 | 21 | 46 | 23 |
| `test/skill-runners.test.ts` | 443 | 421 | -22 | 14 | 10 | 37 | 15 |
| `test/skill-source.test.ts` | 306 | 296 | -10 | 19 | 19 | 33 | 23 |
| `test/skills.test.ts` | 448 | 432 | -16 | 20 | 19 | 43 | 27 |
| `test/smoke/demo-openai-tool-request.test.ts` | 228 | 212 | -16 | 14 | 11 | 32 | 16 |
| `test/smoke/executor.test.ts` | 1490 | 1456 | -34 | 28 | 20 | 67 | 32 |
| `test/smoke/host-routing.test.ts` | 351 | 346 | -5 | 11 | 11 | 26 | 21 |
| `test/smoke/mcp-modern-client.test.ts` | 96 | 87 | -9 | 3 | 2 | 12 | 3 |
| `test/smoke/oauth-identity.test.ts` | 120 | 115 | -5 | 2 | 2 | 10 | 5 |
| `test/smoke/server.test.ts` | 412 | 381 | -31 | 13 | 9 | 42 | 11 |
| `test/smoke/vitest.config.ts` | 105 | 65 | -40 | 10 | 9 | 55 | 15 |
| `test/spec-sandbox.test.ts` | 163 | 153 | -10 | 7 | 7 | 21 | 11 |
| `test/super-spec.test.ts` | 607 | 583 | -24 | 14 | 14 | 46 | 22 |
| **Total (59 files)** | **33333** | **32329** | **-1004** | **894** | **725** | **2119** | **1090** |
