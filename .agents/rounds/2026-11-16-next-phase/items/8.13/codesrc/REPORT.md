# Lane `codesrc` Report — Item 8.13

## What Changed

Slimmed and corrected **comments and doc comments only** across 47 files under `src/**` (no string literals, identifiers, types, logic, generated files, vendored files, or `src/**/README.md` touched):

- Cut dated narration, round/PR stories, doc restatements (replacing with single links to `ARCHITECTURE.md`, `src/skills/README.md`, `docs/stellar-docs.md`), and comments that restated self-documenting code.
- Preserved security boundaries, upstream quirks, non-obvious invariants, and test-pinned rationales.
- Fixed stale/inaccurate comment claims (e.g., `src/adapters/types.ts` "three services" → four; `src/catalog/types.ts` `keywords`/`routingPhrases`; `src/catalog/scoring.ts` vendor line ref and cache comments; `src/executor/spec-sandbox.ts` missing `stellarOrg.*`; `src/artifacts/store.ts` `admin` → `API-key`; `src/policy/validate.ts` stale entry count and Zod claim).
- **Excluded (untouched)**: generated files (`src/mcp/family-text.ts`, `src/policy/corroboration.ts`, `src/demo/globe.ts`, `src/consent-globe.ts`, `src/fonts.ts`, `src/og.ts`, `src/adapters/stellar-docs-anchors.json`), vendored files (`src/catalog/vendor/*.ts` — attribution headers per `THIRD-PARTY-NOTICES.md`), and READMEs (`src/catalog/README.md`, `src/skills/README.md` — owned by `docsguides`).
- **PR split**: Because the combined diff was ~2,000 changed lines (exceeding the ~1,500-line split guideline in `8.13-SLIM.md`), the work was split into **two completely disjoint PRs** by sub-area:
  - **PR #528** (`np/8.13-codesrc`, core): 26 `src/` files (`src/catalog/`, `src/skills/`, `src/executor/`, `src/mcp/tools.ts`, `src/artifacts/store.ts`, `src/policy/`), `+172 / -990` lines (1,162 changed lines), plus this lane's review/report artifacts under `.agents/rounds/2026-11-16-next-phase/items/8.13/codesrc/`.
  - **PR #529** (`np/8.13-codesrc-surfaces`, surfaces): 21 `src/` files (`src/adapters/`, `src/auth/`, `src/demo/`, `src/html.ts`, `src/observability.ts`, `src/server.ts`, `src/site.ts`), `+151 / -695` lines (846 changed lines).

### Line and Comment Counts (Before `c52dca8a` → After)

#### PR #528 (`np/8.13-codesrc` · core — 26 files)

| File | Lines before | Lines after | Δ lines | Comment lines before | Comment lines after | Δ comment lines | Comment blocks before→after |
|---|---:|---:|---:|---:|---:|---:|---:|
| `src/artifacts/store.ts` | 364 | 362 | -2 | 15 | 13 | -2 | 3 → 3 |
| `src/catalog/extract-keywords.ts` | 68 | 47 | -21 | 35 | 14 | -21 | 4 → 4 |
| `src/catalog/id.ts` | 29 | 11 | -18 | 21 | 3 | -18 | 3 → 3 |
| `src/catalog/load.ts` | 20 | 10 | -10 | 11 | 1 | -10 | 1 → 1 |
| `src/catalog/output-compaction.ts` | 14 | 9 | -5 | 9 | 4 | -5 | 1 → 1 |
| `src/catalog/scoring.ts` | 598 | 519 | -79 | 174 | 95 | -79 | 32 → 32 |
| `src/catalog/search.ts` | 1728 | 1637 | -91 | 290 | 199 | -91 | 77 → 66 |
| `src/catalog/types.ts` | 254 | 181 | -73 | 125 | 53 | -72 | 32 → 31 |
| `src/executor/providers.ts` | 1417 | 1312 | -105 | 149 | 63 | -86 | 49 → 23 |
| `src/executor/shape-logs.ts` | 49 | 41 | -8 | 19 | 11 | -8 | 6 → 6 |
| `src/executor/spec-sandbox.ts` | 126 | 104 | -22 | 43 | 21 | -22 | 4 → 4 |
| `src/mcp/tools.ts` | 521 | 490 | -31 | 96 | 65 | -31 | 45 → 31 |
| `src/policy/argument-aliases.ts` | 65 | 53 | -12 | 28 | 16 | -12 | 5 → 5 |
| `src/policy/guard.ts` | 27 | 22 | -5 | 10 | 5 | -5 | 2 → 2 |
| `src/policy/identifier-token.ts` | 44 | 29 | -15 | 28 | 13 | -15 | 6 → 6 |
| `src/policy/scout-exposure.ts` | 110 | 107 | -3 | 44 | 41 | -3 | 34 → 31 |
| `src/policy/truncate.ts` | 283 | 272 | -11 | 77 | 66 | -11 | 28 → 28 |
| `src/policy/validate.ts` | 158 | 148 | -10 | 23 | 13 | -10 | 5 → 5 |
| `src/skills/canary.ts` | 224 | 162 | -62 | 96 | 34 | -62 | 35 → 17 |
| `src/skills/run.ts` | 371 | 308 | -63 | 115 | 52 | -63 | 34 → 31 |
| `src/skills/runners/index.ts` | 29 | 11 | -18 | 23 | 5 | -18 | 1 → 1 |
| `src/skills/runners/stellar-ecosystem-digest.ts` | 318 | 293 | -25 | 51 | 26 | -25 | 13 → 13 |
| `src/skills/runners/types.ts` | 62 | 24 | -38 | 47 | 9 | -38 | 7 → 6 |
| `src/skills/scrub.ts` | 398 | 374 | -24 | 50 | 26 | -24 | 10 → 10 |
| `src/skills/source.ts` | 232 | 185 | -47 | 98 | 51 | -47 | 37 → 28 |
| `src/skills/store.ts` | 428 | 408 | -20 | 40 | 27 | -13 | 9 → 9 |
| **Subtotal (26 files)** | **7,937** | **7,119** | **-818** | **1,717** | **926** | **-791** | **483 → 397** |

#### PR #529 (`np/8.13-codesrc-surfaces` · surfaces — 21 files)

| File | Lines before | Lines after | Δ lines | Comment lines before | Comment lines after | Δ comment lines | Comment blocks before→after |
|---|---:|---:|---:|---:|---:|---:|---:|
| `src/adapters/index.ts` | 41 | 37 | -4 | 5 | 1 | -4 | 1 → 1 |
| `src/adapters/lumenloop-shape.ts` | 273 | 248 | -25 | 40 | 15 | -25 | 8 → 6 |
| `src/adapters/lumenloop.ts` | 145 | 124 | -21 | 30 | 9 | -21 | 9 → 4 |
| `src/adapters/scout.ts` | 257 | 219 | -38 | 52 | 14 | -38 | 20 → 8 |
| `src/adapters/stellar-docs.ts` | 563 | 547 | -16 | 52 | 36 | -16 | 16 → 16 |
| `src/adapters/stellar-org.ts` | 557 | 540 | -17 | 80 | 63 | -17 | 31 → 31 |
| `src/adapters/types.ts` | 109 | 87 | -22 | 52 | 30 | -22 | 15 → 15 |
| `src/auth/gate.ts` | 160 | 134 | -26 | 75 | 49 | -26 | 34 → 29 |
| `src/auth/redirects.ts` | 65 | 55 | -10 | 28 | 18 | -10 | 3 → 3 |
| `src/auth/retention.ts` | 53 | 29 | -24 | 42 | 18 | -24 | 9 → 9 |
| `src/auth/workos.ts` | 625 | 527 | -98 | 190 | 92 | -98 | 59 → 52 |
| `src/demo/auth.ts` | 130 | 121 | -9 | 35 | 26 | -9 | 11 → 11 |
| `src/demo/budget.ts` | 172 | 163 | -9 | 53 | 44 | -9 | 19 → 19 |
| `src/demo/frames.ts` | 27 | 21 | -6 | 11 | 5 | -6 | 2 → 2 |
| `src/demo/model-config.ts` | 350 | 262 | -88 | 142 | 54 | -88 | 30 → 21 |
| `src/demo/page.ts` | 1113 | 1088 | -25 | 58 | 33 | -25 | 38 → 29 |
| `src/demo/tools.ts` | 622 | 604 | -18 | 73 | 55 | -18 | 46 → 46 |
| `src/html.ts` | 77 | 55 | -22 | 30 | 8 | -22 | 4 → 4 |
| `src/observability.ts` | 119 | 94 | -25 | 42 | 17 | -25 | 8 → 8 |
| `src/server.ts` | 309 | 299 | -10 | 73 | 63 | -10 | 49 → 46 |
| `src/site.ts` | 1567 | 1536 | -31 | 113 | 82 | -31 | 65 → 59 |
| **Subtotal (21 files)** | **7,334** | **6,790** | **-544** | **1,276** | **732** | **-544** | **477 → 419** |

- **Combined total (47 files)**: **15,271 → 13,909 lines (-1,362)**; **2,993 → 1,658 comment lines (-1,335; remaining -27 are adjacent blank lines around removed standalone comments)**; **960 → 816 comment blocks (-144 removed)**.

## Gates and Verification

All gates were run bare on both final branch tips after applying the Codex Sol review fixes (`7607f122` on PR #528, `b2b2847b` on PR #529):

| Gate | PR #528 (`7607f122`) | PR #529 (`b2b2847b`) |
|---|---|---|
| `npm run typecheck` | exit 0 | exit 0 |
| `npm test` | exit 0 (`174 passed \| 5 skipped (179)`; `4165 passed \| 3 expected fail \| 5 skipped (4173)`) | exit 0 (`174 passed \| 5 skipped (179)`; `4165 passed \| 3 expected fail \| 5 skipped (4173)`) |
| `npm run test:smoke` | exit 0 (`10 passed (10)`; `173 passed (173)`) | exit 0 (`10 passed (10)`; `173 passed (173)`) |
| `npm run build` | exit 0 | exit 0 |
| `npm run secrets:scan -- --tree` | exit 0 (clean) | exit 0 (clean) |
| `npm run eval:routing -- --gate` | exit 0 (`GATE PASS`) | exit 0 (`GATE PASS`) |
| `npm run -s mcp:surface -- --json` vs base `c52dca8a` | **Byte-identical** (`894 → 894` bytes) | **Byte-identical** (`894 → 894` bytes) |
| `dist/server.js` minified (`esbuild`, `legalComments: "none"`) vs base | **Byte-identical** (`3,900,715 → 3,900,715` bytes) | **Byte-identical** (`3,900,715 → 3,900,715` bytes) |
| Per-file `esbuild` minified check & non-comment diff lines | `0` mismatches, `0` non-comment diff lines (26 files) | `0` mismatches, `0` non-comment diff lines (21 files) |
| `git diff --check` | exit 0 | exit 0 |

### Served-Text & Routing Baseline Proof

- `mcp:surface -- --json` (identical before and after on both PRs):
  - `surfaceSha256`: `815333b74671dec3a7919333a9960392fd9a39d12efbcaa148b447995de2bd07`
  - `instructionsSha256`: `67a6bd0b57da385b412a5dc47dc3de3b8ae65f4b39e3a862cb53deec659c6c00`
  - `advertisedWireChars`: `7968`
- `npm run eval:routing -- --gate` aggregates (identical before and after on both PRs):
  - Legacy 338: top-1 `64.8%`, top-3 `86.7%`, top-5 `96.4%`, card@5 `62.6% (182)`
  - Skills 23: top-1 `73.9%`, top-3 `100.0%`, top-5 `100.0%`, card@5 `100.0% (23)`
  - Holdout 49: top-1 `24.5%`, top-3 `53.1%`, top-5 `61.2%`, forbidden captures `11/49`

## Codex Sol Review and Challenge

- **Reviewer**: Codex CLI (`codex exec -m gpt-6.2-sol -c 'model_reasoning_effort="high"' -s read-only`)
- **Review output**: [SOL-REVIEW.md](SOL-REVIEW.md) (confirmed comments-only scope, non-comment token/AST/minified equality, and `git diff --check` on both PRs; 0 High findings)
- **Challenge log**: [CHALLENGE.md](CHALLENGE.md)
- **Verdict counts by class**:
  - **Valid**: `23` (10 Medium, 13 Low; 15 on PR #528, 8 on PR #529) — **all 23 fixed** (`7607f122`, `b2b2847b`) and re-verified.
  - **Invalid**: `0`
  - **Valid, not worth fixing**: `0`

## Pull Requests

- **PR #528** (core `src/` + lane reports): https://github.com/stellar-experimental/stellar-raven/pull/528 (`np/8.13-codesrc`)
- **PR #529** (surface `src/`): https://github.com/stellar-experimental/stellar-raven/pull/529 (`np/8.13-codesrc-surfaces`)

## Worker Bytes & Model-Facing Impact

- **`git diff origin/main...<branch> -- src/ package.json package-lock.json wrangler.jsonc`**: changes files under `src/**` only (comments only). Unminified `wrangler deploy --dry-run` output (`dist/server.js`) changes raw bytes where comments were trimmed, while **minified executable JS (`esbuild`, `legalComments: "none"`) is byte-identical (`3,900,715 → 3,900,715` bytes)** on both PRs.
- **Model-facing change**: **No** (`mcp:surface -- --json` is byte-identical; zero changes to served tool descriptions, instructions, hints, schemas, or strings).

## TODO Item Closed

- None directly in `.agents/TODO.md` (this slimming lane originates from the owner's 2026-11-20 instruction; `.agents/TODO.md` was left untouched per `8.13-COMMON.md`).

## Model Calls Made

| CLI / Tool | Resolved Model ID | Effort | Purpose |
|---|---|---|---|
| Antigravity (`agy`) | `Gemini 4 Neon` | — | Lane `codesrc` author: audit, comment slimming, verification, challenge of Sol findings, fixes, and report |
| Codex CLI (`codex exec`) | `gpt-6.2-sol` | `high` | Independent read-only review of PR #528 (`bea9af79`) and PR #529 (`2a6e7774`) against `c52dca8a` |

*(Subscription CLIs only; zero AI Gateway, Workers AI, or provider-API calls.)*

## Questions / Observations for the Owner

1. **Pre-existing non-envelope rejection on unpaired UTF-16 surrogates in `src/adapters/scout.ts` (`fillPathTemplate`)** *(out of scope for this comments-only lane)*:
   - **Location**: `src/adapters/scout.ts:25-39,78` and `src/executor/providers.ts` (`buildOpsFns`).
   - **Finding**: `fillPathTemplate` calls `encodeURIComponent(String(raw))` before `scout.ts`'s `try` block, and `buildOpsFns` awaits `callService` without a `try/catch`. A validated path parameter containing an unpaired UTF-16 surrogate (e.g. `"\uD800"`) rejects with `URIError` toward sandbox code rather than returning `{ ok: false, error }`.
   - **What this lane did**: Softened the comments in `src/adapters/types.ts` and `src/executor/providers.ts` so they accurately describe current behavior instead of promising "never throws".
   - **Recommendation**: If a strict never-throw guarantee is desired, move `fillPathTemplate` inside `try` in `src/adapters/scout.ts` (or guard `callService` in `src/executor/providers.ts`) in a small dedicated behavior PR.
