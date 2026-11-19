# Item 8.11 Lane Report (`hygiene`)

- **Lane:** `hygiene` (item 8.11)
- **Branch:** `np/8.11-hygiene` (worktree `/home/tyler/code/raven-wt/np-8.11-hygiene`)
- **PR:** https://github.com/stellar-experimental/stellar-raven/pull/508
- **Worker bytes change:** **Yes** — `git diff origin/main -- src/ package.json package-lock.json wrangler.jsonc` modifies 8 files under `src/` (`src/auth/gate.ts`, `src/auth/redirects.ts`, `src/mcp/tools.ts`, `src/policy/scout-exposure.ts`, `src/policy/source-basis.ts`, `src/policy/truncate.ts`, `src/server.ts`, `src/skills/scrub.ts`; +155/-67 lines). No changes to `package.json`, `package-lock.json`, or `wrangler.jsonc`.
- **TODO items closed** (`.agents/TODO.md`, left untouched for the orchestrator to prune):
  1. `Decouple extractLossDetail from the truncation footer wording`
  2. `Fix the document pointers in src/ comments`
  3. `Align the skill scrub with the emitted-text guard`

## What Changed

1. **Structural `lossDetail` handoff (`src/policy/truncate.ts`, `src/policy/source-basis.ts`):**
   - Added required `lossDetail: string` to `Truncated` in `src/policy/truncate.ts`. `truncateForModel` computes `lossDetail(...)` once, passes it into `footer(...)`, and returns it as `lossDetail` (`""` when untruncated). `truncateLogsForModel` returns `lossDetail: ""`.
   - `sourceBasisShapeFromTruncation` in `src/policy/source-basis.ts` reads `truncated.lossDetail` directly, and `extractLossDetail` (the footer-wording regex) is removed. Footer wording changes can no longer silently empty `lossDetail`.

2. **Document pointers in `src/` comments (`src/mcp/tools.ts`, `src/auth/gate.ts`, `src/auth/redirects.ts`, `src/server.ts`):**
   - `src/mcp/tools.ts` (`BASE_SERVER_INSTRUCTIONS`): states current behavior (complete workflow/evidence contract within Grok's 2,033-character cut; payload-access rule in `EXECUTE_DESCRIPTION`; per-family orientation in `FAMILY_LINE`) with no history about the removed source map.
   - `src/auth/gate.ts`, `src/auth/redirects.ts`, and `src/server.ts` (line 149, discovered via `rg` for `DESIGN.md`): replaced all `DESIGN.md D1/D2` and `.agents/rounds/...` pointers with `"Request routes and authorization"` in `ARCHITECTURE.md`. `rg` confirms zero `DESIGN.md` or `.agents/rounds` references remain under `src/`.

3. **Shared Scout path matcher, CommonMark fence matching, and re-pin narrowing visibility (`src/policy/scout-exposure.ts`, `src/skills/scrub.ts`, `scripts/exposure.mjs`, `scripts/exposure.d.mts`, `scripts/emitted-text-guard.mjs`, `scripts/diff-pins.mjs`, `ecosystem-skills/PIN-REVIEW.md`):**
   - `src/policy/scout-exposure.ts` exports one shared matcher `findExcludedScoutPath(text)` over `EXCLUDED_SCOUT_PATHS` (which includes `SCOUT_PATHS_ABSENT_FROM_SPEC`, `/api/repos`), case-insensitive, percent-decoding, with lookahead `(?![\w-]|\/[\w{%-])`. Trailing-slash references (e.g. `/api/feedback/`, `/api/partners/match/`, `/api/repos/`) are caught while distinct child paths (e.g. `/api/repos/search`, `/api/repos/explain`) remain allowed.
   - Both `src/skills/scrub.ts` and `scripts/emitted-text-guard.mjs` (via `scripts/exposure.mjs`) call `findExcludedScoutPath`, removing the duplicated path regex/decoding logic from the guard.
   - `src/skills/scrub.ts` replaces `fenceLine` with CommonMark `openingFence` / `closesFence` matching fence character (`` ` `` vs `~`) and length (`>= openLength`), rejecting closing info strings and backtick-containing backtick info strings, and tracking fences in both the heading-removal pass (including skipped sections) and block-removal pass.
   - `src/skills/scrub.ts` adds optional `options?: ScrubOptions` (`onNarrow?: (change: NarrowedSentence) => void`), emitting only sentences that actually survived in the scrubbed output (not items that fell back to full removal, and never when the scrub throws).
   - `scripts/diff-pins.mjs` reports new or changed narrowed sentences (`### SCRUB NARROWED` with `  narrowed from:` / `  served as:`) and scrub blocks (`### SCRUB BLOCKED`) on exposed skill files (skipping `RETIRED_ONBOARDING_SKILLS`) during re-pin review, and `ecosystem-skills/PIN-REVIEW.md` documents what reviewers should check.

## Tests Added, Modified, or Removed (Owner's Ephemeral-Test Rule)

Following the owner's rule ("don't write and maintain permanent tests for ephemeral issues"):

- **No test added for Item 1 (`lossDetail`):** `lossDetail` is now a required typed field on `Truncated` consumed directly by `sourceBasisShapeFromTruncation`; no silent failure path remains on footer wording edits.
- **No upstream-count test added for Item 3:** replaced the TODO's proposed pinned count of narrowed sentences with structural visibility in `scripts/diff-pins.mjs`.
- **Removed (redundant after structural alignment):**
  - `test/skill-scrub.test.ts` (previous L284-289): removed the manual `/api/` regex scan for `SCOUT_PATHS_ABSENT_FROM_SPEC`, now covered directly by `assertNoNonExposedRefsInText(scrubbed, key)` via the shared `findExcludedScoutPath`.
  - `test/skill-scrub.test.ts` (previous L306-319): removed assertions pinning exact upstream sentences in today's pinned `stellar-scout/SKILL.md` and `references/api-reference.md` (flagged in review as M1; ephemeral upstream-text pins made redundant by `diff-pins.mjs` narrowing visibility and synthetic unit tests). Kept the loop verifying every pinned Scout file scrubs cleanly against `assertNoNonExposedRefsInText`.
- **Decoupled (pre-existing wording pin):**
  - `test/source-basis.test.ts` (`uses truncate.ts loss detail for generic shape summaries`): replaced hardcoded `truncate.ts` wording checks (`"Bulk lost from top-level keys:"`, `/"rows" ~\d+(\.\d+)?k chars \(cut\)/`, already covered by `test/policy.test.ts`) with `expect(shape.lossDetail).toBeTruthy(); expect(text).toContain(shape.lossDetail!);` so it tests only the lasting manifest-passthrough invariant (review L2).
- **Added (minimal lasting structural invariants only):**
  - `test/emitted-text-guard.test.ts`: added one data-driven test iterating `EXCLUDED_SCOUT_PATHS` (no hardcoded paths) asserting that plain (`Use ${path}.`) and trailing-slash (`Use ${path}/.`) forms throw while non-templated child paths (`Use ${path}/child.`) pass (guards ADR-0003 boundary + H1 + L1).
  - `test/skill-scrub.test.ts`: added one line to existing fence-failure test (`["```", "~~~", \`- \${excludedPath}\`, "```"]`) guarding CommonMark fence-kind matching; added one mixed-case line (`- Call /API/HACKATHONS/ANALYZE now.`) to existing templated/encoded path test; added `onNarrow` assertions onto existing synthetic narrowing and fallback-list tests (verifying narrowed sentences report and whole-dropped list items emit `[]`, with zero new `it(...)` blocks and zero upstream-text pinning).

## Gates and Verification

All gates run bare after the final review-reconciliation edits:

| Gate | Exit | Summary |
|---|---|---|
| `npm run typecheck` | `0` | Clean (`tsc --noEmit`) |
| `npm test` | `0` | `173 passed \| 5 skipped (178)` files; `4153 passed \| 3 expected fail \| 5 skipped (4161)` tests |
| `npm run test:smoke` | `0` | `10 passed (10)` files; `173 passed (173)` tests |
| `npm run build` | `0` | `prebuild` (`FAMILY_LINE` 441 chars, `SEARCH_OPENING` 116 chars, `CORROBORATION_GUARD` 415 chars) + `wrangler deploy --dry-run` (6922.73 KiB / gzip 1376.10 KiB) |
| `npm run eval:routing -- --gate` (before) | `0` | `GATE PASS` — legacy 64.8%/86.7%/96.4% (338), extended 76.2%/91.8%/95.9% (122), skills 73.9%/100.0%/100.0% (23), holdout 24.5%/53.1%/61.2% (49), forbidden 11/49 |
| `npm run eval:routing -- --gate` (after) | `0` | `GATE PASS` — identical aggregates on every lane (legacy 64.8%/86.7%/96.4%, extended 76.2%/91.8%/95.9%, skills 73.9%/100.0%/100.0%, holdout 24.5%/53.1%/61.2%, forbidden 11/49) |
| `node scripts/check-pin-review.mjs --base origin/main` | `0` | `pin-review: no skill pin or file selection moved.` |
| `npm run secrets:scan -- --tree` | `0` | Clean across all tracked files |
| Served-text check (`codemode.skill.read`, port 8793) | `0` | Read all 63 served files across all 19 exposed file-backed skills on `origin/main` and on branch (post-H1 fix): **0 diffs** (865,867 total chars compared byte-for-byte) |

## Independent Review and Reconciliation

- **Reviewer:** Antigravity CLI (`agy --model claude-opus-5-5 --effort high --dangerously-skip-permissions --output-format json --print-timeout 0`), `status: "SUCCESS"`.
- **Record:** `.agents/rounds/2026-11-16-next-phase/items/8.11/REVIEW.md`.

| Finding | Severity | Disposition | Action / Reason |
|---|---|---|---|
| **H1** | high | **Accepted & fixed** | Tightened `excludedPathPattern` lookahead in `src/policy/scout-exposure.ts` from `(?![\w/-])` to `(?![\w-]|\/[\w{%-])` so trailing-slash references (`/api/feedback/`, `/api/partners/match/`, `/api/repos/`) fail closed in both scrub and guard while child paths (`/api/repos/search`) remain allowed. Added data-driven trailing-slash/child assertion in `test/emitted-text-guard.test.ts` and re-verified 0 served-text diffs across all 63 files. |
| **M1** | medium | **Accepted & fixed** | Deleted upstream-text assertions in `test/skill-scrub.test.ts` (previous L306-319) and renamed the test to `"removes excluded paths from every selected Scout file"`. |
| **L1** | low | **Accepted & fixed** | Replaced hardcoded `/api/repos` guard test in `test/emitted-text-guard.test.ts` with a data-driven loop over `EXCLUDED_SCOUT_PATHS`. |
| **L2** | low | **Accepted & fixed** | Decoupled `test/source-basis.test.ts` (`uses truncate.ts loss detail for generic shape summaries`) from `truncate.ts` wording by asserting `shape.lossDetail` is truthy and appears in `text`. |
| **L3** | low | **Accepted & fixed** | Documented `### SCRUB NARROWED` and `### SCRUB BLOCKED` in `ecosystem-skills/PIN-REVIEW.md` under "What to look for". |
| **N1** | nit | **Partially accepted** | Changed `diff-pins.mjs` labels from `- before:`/`+ after:` to `  narrowed from:`/`  served as:`, skipped `RETIRED_ONBOARDING_SKILLS`, and filtered `CHANGED` files to report only new/changed narrowings vs `oldText`. **Declined** exiting non-zero on `SCRUB BLOCKED`: `diff-pins.mjs`'s contract (header L15-17) is to exit non-zero only when a pinned file cannot be fetched, and exiting 1 during `update.sh` would abort the swap and prevent an operator from landing the new pin locally to update `src/skills/scrub.ts`; `build-catalog.mjs` and `npm test` already fail closed before any commit/CI can pass. |
| **N2** | nit | **Accepted & fixed** | Imported `type { ScrubOptions }` from `../src/skills/scrub.ts` in `scripts/exposure.d.mts` instead of duplicating the shape inline. |
| **N3** | nit | **Accepted & fixed** | Added full test-changes list and boundary semantics to both this report and the PR #508 description. |

## Model Calls

| CLI | Model ID | Purpose |
|---|---|---|
| `agy` (Antigravity subscription) | `claude-opus-5-5` (`--effort high`) | Independent code review of `git diff origin/main...HEAD` (PR #508) -> `REVIEW.md` |

No AI Gateway, Workers AI, or provider API calls were made.

## Open Questions

None.
