# Item 8.9 Lane `tests` — Final Report

- **Branch:** `np/8.9-tests`
- **PR:** https://github.com/stellar-experimental/stellar-raven/pull/506
- **Inventory:** [INVENTORY.md](INVENTORY.md)
- **Independent Review:** [REVIEW.md](REVIEW.md)

## 1. Before / After Metrics (`npm test`, warm `ecosystem-skills/.cache`)

| Metric | Baseline (`origin/main`) | After (`HEAD`) | Change |
| --- | --- | --- | --- |
| Test files | 182 (177 passed, 5 skipped) | 176 (171 passed, 5 skipped) | -6 files |
| Test files run under `research/` | 1 (`blind-packets.test.mjs`) | 0 | -1 |
| Total tests | 4,304 (4,296 passed, 3 expected fail, 5 skipped) | 4,150 (4,142 passed, 3 expected fail, 5 skipped) | -154 tests |
| `npm test` wall time (median of 3) | **48.69s** (51.51s, 47.41s, 48.69s) | **18.01s** (18.01s, 17.82s, 18.11s) | **-30.68s (-63.0%, 2.70× faster)** |
| Sum of per-file durations | 198.27s | 113.28s | -84.99s (-42.9%) |
| `src/` coverage command | None configured (`package.json` has no coverage script or `@vitest/coverage-*` dependency) | None configured | — |

## 2. What Changed

Full per-file rationale and named remaining guards live in [INVENTORY.md](INVENTORY.md). High-level summary:

1. **Retired the superseded 2026-11-06 Playground Final Resolution audit tests** (~25.25s CPU):
   - Added `"research/**"` to `test.exclude` in `vitest.config.ts` so `npm test` runs no dated audit file under `research/` (keeping `research/audits/2026-11-06-playground-final-resolution/blind-packets.test.mjs` untouched on disk as a historical record) and updated `test/README.md`.
   - Migrated the live `eval/` guards out of `test/playground-final-orchestrator.test.mjs` — `partialRecoverySource` (accept + 12 specific-error rejections) and `diagnosticAnswerProblem` into `test/diagnostic-rejudge-source.test.mjs`, and `verifySourceCases(..., { selectedIds })` into `test/re-judge.test.ts` — then deleted `test/playground-final-orchestrator.test.mjs` and `test/playground-finals-decision.test.mjs`.
2. **Merged 3 duplicate/fragmented suites into their sibling suites** with all unique assertions preserved:
   - `test/check-pin-review-cli.test.mjs` → `test/check-pin-review.test.ts` (reusing the single `beforeAll` git repo)
   - `test/stellar-org-guard.test.ts` → `test/corroboration-guard.test.ts`
   - `test/routing-evidence.test.ts` → `test/extract-routing-phrases.test.ts` + `test/scoring.test.ts`
3. **Removed exact internal duplicates and trimmed overdone tables** across `test/evidence-checkpoint.test.ts`, `test/evidence-pack-per-operation.test.mjs`, `test/qa-verdict-consistency.test.mjs`, `test/search.test.ts`, `test/drift-141-routing.test.ts`, `test/stellar-org-adapter.test.ts`, `test/check-skills-drift-cli.test.mjs`, `test/qa-harness-preconditions.test.mjs`, and `test/identifier-token.test.ts`.
4. **Fixed a real timer leak and parallelized slow suites** (zero lost assertions):
   - Cleared and `.unref()`'d the 5,000ms kill-escalation timer in `scripts/run-demo-model-gauntlet.mjs` (`stopWrangler`), dropping `test/demo-gauntlet-cli.test.ts` from 35.42s to ~2s.
   - Switched independent subprocess tests from sequential `spawnSync` to async `execFile` + `it.concurrent` / `Promise.all` (`test/run-routing-manifest-evidence.test.mjs`, `test/demo-gauntlet-cli.test.ts`, `test/qa-harness-preconditions.test.mjs`, `test/discovery-paid-run-guards.test.mjs`, `test/re-judge.test.ts`, `test/check-skills-drift-cli.test.mjs`, `test/improvements-writes.test.mjs`, `test/qa-register-cli.test.mjs`, `test/improvements-file-issue.test.ts`, `test/qa-postflight-keepalive.test.mjs`, `test/playground-transport.test.mjs`, `test/super-spec.test.ts`).
   - Memoized static fixtures/digests and used shallow structural sharing in `test/catalog-guards.test.mjs`, `test/qa-paired-verdict.test.mjs`, `test/evidence-pack-claim-support.test.mjs`, and `test/evidence-pack-per-operation.test.mjs`.

## 3. Gates (All Run Bare After Review Reconciliation)

| Gate | Command | Exit | Result |
| --- | --- | --- | --- |
| Typecheck | `npm run typecheck` | `0` | Clean (`tsc --noEmit`) |
| Unit tests | `npm test` | `0` | 176 files (171 passed, 5 skipped), 4,150 tests (4,142 passed, 3 expected fail, 5 skipped); median wall time 18.01s (runs: 18.01s, 17.82s, 18.11s) |
| Worker build | `npm run build` | `0` | `prebuild` + `wrangler deploy --dry-run --outdir dist` succeeded |
| Secrets scan | `npm run secrets:scan -- --tree` | `0` | Clean across all tracked files; private usage boundary passed |
| Eval selftest | `npm run eval:selftest` | `0` | All checks passed |
| CI (GitHub Actions) | `gh pr checks 506 --watch` | `0` | Verified green after final push (see PR #506) |

## 4. Worker Bytes & Protected Boundaries

- `git diff origin/main -- src/ package.json package-lock.json wrangler.jsonc` is **empty**. **No Worker bytes changed**; no deploy is needed for this PR.
- Zero files owned by other 8.9 lanes were touched (`test/qa-judge-evidence.test.mjs`, `test/live/**`, `eval/lib/grade.mjs` tests, `src/skills/scrub.ts`, `scripts/agent-hooks/**`, `eval/qa/heldout-read.sh`).
- Zero security-boundary, ADR-0003 exposure, secrets-handling, case-text ratchet, or billing guards were removed or weakened.

## 5. Independent Review & Reconciliation

- **Reviewer:** Antigravity CLI (`agy --model claude-opus-5-5 --effort high`), completion-gate review of `git diff origin/main...HEAD` against `8.9-LANES.md` § `tests`, `INVENTORY.md`, and `AGENTS.md`.
- **Status:** JSON `status: "SUCCESS"`, conversation `81a2052c-8887-446d-858a-24c37a9ca933`.
- **Verdict on initial commit (`0182e288`):** `REQUEST CHANGES` (1 High, 2 Medium, 7 Low, 8 Notes; zero Critical; all speedups, `stopWrangler`, concurrency safety, and protected boundaries verified clean).

### Reconciliation

| ID | Severity | Action | Resolution |
| --- | --- | --- | --- |
| **H1** | High | **Accepted & fixed** | Restored all 4 env-gated opt-in measurement/replay files (`test/replay-detail-hint.test.ts`, `test/replay-exact-rows.test.ts`, `test/replay-guard.test.ts`, `test/search-page-size.test.ts`) verbatim from `origin/main`, restored `replay-*` in `test/README.md`, and updated `INVENTORY.md` §1 to document them accurately as env-gated opt-in instruments. |
| **M1** | Medium | **Accepted & fixed** | Restored `iterations: 5_000` in `test/qa-paired-verdict.test.mjs` (preserving 1.8 SE headroom above `noChangeTwoLookPassPower >= 0.80` at zero wall-clock penalty to `npm test`) and updated `INVENTORY.md`. |
| **M2** | Medium | **Accepted & fixed** | Restored `keeps the historical freshness tag for every stored-correct control` in `test/evidence-pack-per-operation.test.mjs` (0ms cost; preserves the `live` vs `scheduled` pin) and removed it from `INVENTORY.md` §4. |
| **L1** | Low | **Accepted & fixed** | Added `"."` back into `tails` in `test/identifier-token.test.ts` (preserving end-of-sentence `SEP-24.` coverage of `(?![-.]\d)`) and fixed the counter names (`titleCase`, `longDigits`, `afterNumber`) in `INVENTORY.md`. |
| **L2** | Low | **Accepted & fixed** | Added the 2-of-3 coherent-phrase positive admission assertion into `test/scoring.test.ts` and corrected the `INVENTORY.md` §3 description. |
| **L3** | Low | **Accepted & fixed** | Fixed `INVENTORY.md` citations (`test/playground-eval-contract.test.ts`, `vitest.config.ts:20-21`, and explicit note that pre-change citations use `origin/main` numbering). |
| **L4** | Low | **Accepted & fixed** | Restored both frozen-sentence policy checks in `test/exact-evidence.test.ts` (`makes no status or date claim of its own`) and `test/evidence-checkpoint.test.ts` (`keeps the sentence short and free of case or operation vocabulary`) — <1ms cost, unique coverage — and removed them from `INVENTORY.md` §4. |
| **L5** | Low | **Accepted & fixed** | Raised `test/qa-postflight-keepalive.test.mjs` loopback idle timeout from `150ms`/`350ms` to `300ms`/`700ms` for wider CI jitter margin (zero `npm test` wall-clock penalty) and updated `INVENTORY.md`. |
| **L6** | Low | **Accepted & fixed** | Added final before/after numbers and the `catalog-guards` multi-clause `notFor` merge to `INVENTORY.md`. |
| **L7** | Low | **Accepted & fixed** | Replaced bare `.toThrow()` on all 12 `partialRecoverySource` rejections in `test/diagnostic-rejudge-source.test.mjs` with exact expected `partial recovery: ...` error message regexes. |
| **N1** | Note | **Declined (new test)** | Declined adding a 5s SIGKILL escalation test for unexported `stopWrangler`: it would add back 5s of latency and `stopWrangler` preserves the exact SIGTERM→5s→SIGKILL escalation structure (`clearTimeout` + `.unref()` only). |
| **N3** | Note | **Accepted & fixed** | Changed `explainOnce` cache key in `test/evidence-pack-claim-support.test.mjs` from object-reference equality to `JSON.stringify([candidateAnswer, transcript, extra])` so any future in-place mutation cannot return a stale pack. |
| **N4** | Note | **Accepted & fixed** | Added an inline comment in `test/improvements-file-issue.test.ts` explaining why parallelizing the successor-filing refusals with the accept path is safe. |
| **N5** | Note | **Accepted & fixed** | Restored `routing*` in `test/README.md:33` (`test/routing-qa-overlap.test.mjs` still exists). |
| **N6** | Note | **Passed to lead** | See Open Questions below (`partialRecoverySource` dead-code follow-up). |
| **N8** | Note | **Recorded** | Reviewer disclosed passing `eval/qa/*.mjs` (code files only) to `rg -l` in one command; printed only matching code-file paths and opened/printed zero case text, corpus, split, or golden paths. |

## 6. TODO Item Closed

- **`.agents/TODO.md:1254` — "Move the playground blind-packets test out of a record folder"** (`Done when: npm test runs no file under research/`): satisfied by excluding `"research/**"` in `vitest.config.ts` and updating `test/README.md` (verified `researchFiles: []` in Vitest JSON output).
- Plus Item 8.9 lane `tests` ("reduce the test load").

## 7. Model Calls Made

| CLI | Model ID | Effort | Purpose | Outcome |
| --- | --- | --- | --- | --- |
| `agy` (Antigravity subscription) | `claude-opus-5-5` | `high` | Independent completion-gate code review (`git diff origin/main...HEAD`, checking every removal's named guard) | `SUCCESS` (conversation `81a2052c-8887-446d-858a-24c37a9ca933`, 543,143 input / 55,971 output / 16,476,910 cache-read tokens) |

Zero AI Gateway, Workers AI, or provider-API calls were made.

## 8. Open Questions for Owner / Lead

1. **Env-gated replay/measurement files (`test/replay-detail-hint.test.ts`, `test/replay-exact-rows.test.ts`, `test/replay-guard.test.ts`, `test/search-page-size.test.ts`):** Kept intact per `AGENTS.md` after review H1 because no unit test replaces stored-transcript replay or page-size byte measurement and `replay-exact-rows.test.ts` was used in item 3.5 this round. Should they stay in `test/`, move out of `test/` into an opt-in folder (e.g. `scripts/replay/`), or be retired once no further replay checks are planned?
2. **Dead-code follow-up (review N6):** With `research/audits/2026-11-06-playground-final-resolution/orchestrate.mjs` out of the live test suite, `partialRecoverySource` in `eval/qa/diagnostic-rejudge-source.mjs` currently has no live caller outside `test/diagnostic-rejudge-source.test.mjs`. Worth queuing a follow-up item if the owner wants to retire `partialRecoverySource` too.
