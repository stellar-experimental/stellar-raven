# Item 8.9 Lane Report: `flush` ("Flush the uncited golden-round JSON")

- **Lane:** `flush`
- **Branch:** `np/8.9-flush`
- **PR:** https://github.com/stellar-experimental/stellar-raven/pull/502
- **TODO item closed:** "Flush the uncited golden-round JSON" (`.agents/TODO.md` left unmodified per `8.9-COMMON.md`; orchestrator closes the queue entry)
- **Worker bytes changed:** **None.** `git diff $(git merge-base origin/main HEAD) -- src/ package.json package-lock.json wrangler.jsonc` is empty (no deploy required).

## What changed

1. **Added token-only citation scanner** — `scripts/find-uncited-golden-round-json.mjs`
   - Walks `.agents/rounds/2026-11-02-golden-audit/` and `.agents/rounds/2026-11-14-golden-coverage-audit/` via `readdirSync(..., { withFileTypes: true })`, skipping symlinks and never opening or reading any candidate JSON file.
   - Searches explicit tracked scopes (`eval/qa/corpus`, `eval/corpus`, `eval/qa/consistency-register.json`, `eval/qa/source-sentinels.json`, `eval/qa/lifecycle-registry.json`, `eval/qa/reviewed`, `eval/qa/cases.json`, `eval/qa/sample.json`, `eval/qa/tool-cases.json`, `improvements`) using `rg --hidden -g !.git --with-filename --count-matches --color never` (no `-u`, no `--no-ignore`, no positive globs).
   - Fails closed if any configured round directory or search scope is missing, or if `rg` cannot run or exits with status ≥ 2 (suppressing raw `rg` stderr so case paths cannot leak).
   - Recognizes both direct file-path citations (full repo-relative or round-relative, including hash fragments and sentence-ending periods, while rejecting partial-name and extension-suffix lookalikes) and round-anchored ancestor directory citations (e.g. `2026-11-14-golden-coverage-audit/gap/`).
   - Emits only golden-round JSON paths, ancestor directory tokens, scope names, and numeric counts — never file content and never individual case filenames.
   - Supports summary output, `--uncited`, `--cited`, `--json`, `--check`, `--repo <dir>`, and `--help`/`-h`.

2. **Added test suite** — `test/find-uncited-golden-round-json.test.mjs` (11 tests)
   - Live repository invariant: asserts `0` uncited golden-round JSON files remain (runs in `npm test` and fails in CI if `rg` is missing).
   - Synthetic repository tests (setup in `beforeAll`): direct, sentence-period, hidden-file, register, `improvements/`, and directory-level citations; lookalike rejection; symlink and non-JSON exclusion; fail-closed missing scopes/rounds; `rg` missing and exit-2 error handling without stderr leakage; no content/case-filename leakage across all CLI output modes; `--check` exit codes; `--help` ordering and malformed-flag rejection.

3. **Removed 80 uncited golden-round JSON intermediates via `git rm` and kept 34 cited JSON files**

| Golden round | Before | Removed (uncited) | Kept (total cited) | Kept (direct file citation) | Kept (directory-only citation) |
|---|---:|---:|---:|---:|---:|
| `.agents/rounds/2026-11-02-golden-audit/` | 64 | 63 | 1 | 1 (`pass1/soroban-04.json`) | 0 |
| `.agents/rounds/2026-11-14-golden-coverage-audit/` | 50 | 17 | 33 | 29 | 4 (`gap/gap-1.slots.json`, `gap/gap-2.json`, `gap/gap-2.slots.json`, `gap/gap-3.slots.json`) |
| **Total** | **114** | **80** | **34** | **30** | **4** |

### Reconciliation with `.agents/TODO.md` figures (109 / 25 / 84 vs 114 / 34 / 80)

- Round item 7.1 `PLAN.md` counted **114** total JSON files in the two golden rounds, set aside **5** files already known to be cited by `eval/qa/consistency-register.json` and `improvements/` (`gap/gap-1.json`, `gap/gap-3.json`, `gap/verify-gap.json`, `resweep/resweep-1.json`, `resweep/resweep-2.json`), and listed the other **109** as removal candidates.
- Round item 7.1 `REVIEW.md` found **24** of those 109 cited inside `eval/qa/corpus/` plus **1** more (`map/taxonomy.json`) cited in relative form by `improvements/stellar-docs/sd-108-…md`, bringing direct file citations to **30** (`5 + 24 + 1`) and file-uncited candidates to **84** (`114 - 30`).
- During this lane's independent review, finding **M1** showed that 36 corpus cases cite the directory `.agents/rounds/2026-11-14-golden-coverage-audit/gap/` directly (24 of them citing only `gap/` plus `gap/verify-gap.json`, without naming their gap-lane draft file). Treating directory citations conservatively keeps the 4 remaining JSON files in `gap/` (`gap-2.json` and three `*.slots.json` files), bringing kept cited files to **34** (`30` direct + `4` directory-only) and flushed uncited files to **80**.

### Note on dated records

Historical dated records outside the active scopes (`research/audits/2026-11-09-improvements-sweep/*.md`, `research/audits/2026-11-12-truth-maintenance/review-retire-astra.md`, `.agents/rounds/2026-11-02-upstream-followup/rv-fu-review.md`, `.agents/rounds/2026-11-16-next-phase/items/7.1/scan-*.txt`) remain unchanged per `AGENTS.md`; paths to removed JSON intermediates in those dated records resolve through git history (last commit with the full tree prior to this PR: `6f0bf84b` / `origin/main` before merge).

## Pre-deletion and post-deletion proof

Verified by running `scanGoldenRoundJson` against a temporary detached `git worktree` of merge-base `6f0bf84b` (removed immediately after):

- **Pre-deletion (`6f0bf84b`):** `114 total, 34 cited (30 direct, 4 directory-only), 80 uncited` (identical counts verified against `origin/main` `ccb0d6e5`).
- **Deleted set equality:** `before.uncited` === `git diff --name-only --diff-filter=D 6f0bf84b` (`80 === 80`, empty diff).
- **Cited set preservation:** `before.cited` === `after.cited` (`34 === 34`, all 34 files exist on disk).
- **Post-deletion (`HEAD`):** `node scripts/find-uncited-golden-round-json.mjs --check` → `34 total, 34 cited (30 direct, 4 directory-only), 0 uncited` (exit 0).

## Gates (all run bare after final fixes)

| Gate | Exit code | Result |
|---|---:|---|
| `node scripts/find-uncited-golden-round-json.mjs --check` | 0 | `34 total, 34 cited (30 direct, 4 directory-only), 0 uncited` |
| `npx vitest run test/find-uncited-golden-round-json.test.mjs` | 0 | 1 file passed, 11/11 tests passed (1.78 s) |
| `npm run typecheck` | 0 | clean (`tsc --noEmit`) |
| `npm test` | 0 | 178 passed, 5 skipped (183 files); 4307 passed, 3 expected fail, 5 skipped (4315 tests) |
| `npm run build` | 0 | dry-run Worker bundle built (6918.57 KiB / gzip 1375.14 KiB) |
| `npm run secrets:scan -- --tree` | 0 | private usage boundary passed; secret-scan clean |
| `npm run improvements:lint` | 0 | `improvements lint ok (93 findings)` |
| `npm run eval:qa:lint -- --stale --enforce-floors` | 0 | `0 error(s), 98 warning(s)` |
| `npm run eval:qa:register -- --check` | 0 | `[register-helper] up to date` |

## Independent review and reconciliation

- **Reviewer:** Claude Opus 5.5 via `agy --model claude-opus-5-5 --effort high` (`status: SUCCESS`, `conversation_id: 196797a7-9a48-40fb-a7c6-fadb593db4da`)
- **Review file:** `.agents/rounds/2026-11-16-next-phase/items/8.9/flush/REVIEW.md`
- **Review diff rule:** Reviewer inspected `git diff --stat origin/main...HEAD` and `git diff origin/main...HEAD -- scripts/ test/` only, never opening any deleted golden-round JSON file or case text.
- **Initial verdict:** Request changes (1 major finding M1, 4 minor findings m1–m4, 5 nits n1–n5).

| ID | Severity | Resolution | Action / Reason |
|---|---|---|---|
| **M1** | Major | **Accepted** | Added round-anchored ancestor directory citation scanning (`directoryCitationPattern`, `ancestorRoundDirs`) and restored the 4 directory-cited `gap/` files (`gap-1.slots.json`, `gap-2.json`, `gap-2.slots.json`, `gap-3.slots.json`). Flush is now 80 removed / 34 kept (30 direct, 4 directory-only). |
| **m1** | Minor | **Accepted** | Made `scanGoldenRoundJson` fail closed whenever any configured search scope or golden round directory is missing (instead of silently skipping missing scopes). |
| **m2** | Minor | **Declined** | `8.9-COMMON.md` ("open one pull request") and `8.9-LANES.md` (`flush`: one committed script+test and `git rm` of the listed files) specify a single PR for this lane, and branch history may not be rewritten/force-pushed. Documented `--stat` / `-- scripts/ test/` review guidance in the PR body and kept the review-fix commit additive. |
| **m3** | Minor | **Partially accepted / partially declined** | **Accepted** recording the pre-deletion proof and the 109/25 vs 114/34/80 reconciliation in this `REPORT.md`. **Declined** editing `.agents/TODO.md` because `8.9-COMMON.md` forbids lanes from editing `.agents/TODO.md` (orchestrator closes the item). |
| **m4** | Minor | **Accepted** | Added tests covering directory-level citations, missing default/explicit scopes, missing `rg` and `rg` exit-2 error suppression without stderr leakage, and `--help`/`-h` flag handling. |
| **n1** | Nit | **Accepted** | Added `--hidden` and `-g '!.git'` to `rg` arguments and added a synthetic dotfile citation test. |
| **n2** | Nit | **Accepted** | Short-circuited `--help`/`-h` before flag validation and scanning, and rejected `--repo` values starting with `-`. |
| **n3** | Nit | **Accepted** | Kept raw `rg` stderr suppressed (documented with inline comment), reported suppressed stderr line count alongside exit status, and tested with a stderr canary stub. |
| **n4** | Nit | **Accepted** | Moved synthetic fixture creation (`mkdtempSync`, `.ignore` copies, symlink, `git init`) into `beforeAll`. |
| **n5** | Nit | **Accepted** | Added the dated-records git-history resolution note above. |

## Model calls made

| CLI | Model ID | Effort | Purpose | Billing |
|---|---|---|---|---|
| `agy` | `claude-opus-5-5` | `high` | Independent code review of `np/8.9-flush` (`REVIEW.md`, `status: SUCCESS`) | Subscription (no AI Gateway / Workers AI / provider API) |

## Open questions

- **Directory-cited `gap/` files (M1):** This branch takes the conservative route and keeps the 4 files in `.agents/rounds/2026-11-14-golden-coverage-audit/gap/` (`gap-1.slots.json`, `gap-2.json`, `gap-2.slots.json`, `gap-3.slots.json`) because 36 corpus cases cite `gap/` as a directory (24 without naming their gap-lane draft). If the owner later rules that bare `gap/` citations co-cited with `verify-gap.json` do not protect siblings, those 4 files can be removed in a tiny follow-up.
- **`.agents/TODO.md` update:** Orchestrator to remove the "Flush the uncited golden-round JSON" item after merge.
