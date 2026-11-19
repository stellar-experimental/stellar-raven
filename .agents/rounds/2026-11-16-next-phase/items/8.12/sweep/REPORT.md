# Item 8.12 `sweep` — Final Report

- **PR:** https://github.com/stellar-experimental/stellar-raven/pull/516
- **Branch:** `np/8.12-sweep` (from `origin/main` `9384acf8`)
- **TODO item closed:** None (owner's 2026-11-19 retention-sweep instruction; `.agents/TODO.md` was not edited).
- **Worker bytes changed:** **No** (`git diff origin/main -- src/ package.json package-lock.json wrangler.jsonc` is empty). No deploy needed.
- **Model-facing:** **No.**

## What Changed

Applied `.agents/README.md` ("Retention"), `.agents/rounds/README.md`, and `eval/EVALS.md` across all **993** in-scope tracked files (18,049,334 bytes) in `research/` (excluding `research/decisions/`) and `.agents/rounds/` (excluding `README.md`, `.ignore`, the running round `2026-11-16-next-phase`, and the two `.ignore`-listed golden-round folders).

- **Deletions (`git rm`):** **603 files** removed (**11,473,860 bytes** / ~10.94 MiB) — uncited intermediate reviews, briefs, raw outputs, superseded research notes, and finished ledgers with no current artifact, QA provenance scope, retained ledger Outcome, or runtime/supporting-evidence consumer.
- **Retained:** **390 files** kept (**6,575,474 bytes**), each backed by a verified current artifact, count-only QA provenance scope, retained ledger Outcome, or runtime/supporting-evidence dependency.
- **Folded:** **0 files** (every durable invariant in uncited `research/` notes already lives in ADRs, `AGENTS.md`, `ARCHITECTURE.md`, `docs/`, `src/`, or `test/`).
- **Out of scope (untouched):**
  - `research/decisions/` (durable ADRs).
  - `.agents/rounds/README.md`, `.agents/rounds/.ignore`.
  - `.agents/rounds/2026-11-16-next-phase.md` and `.agents/rounds/2026-11-16-next-phase/` (active running round; dated runs read it until 2026-12-04).
  - `.agents/rounds/2026-11-02-golden-audit/` and `.agents/rounds/2026-11-14-golden-coverage-audit/` (listed in `.agents/rounds/.ignore`; never opened, listed into, or deleted; governed by `scripts/find-uncited-golden-round-json.mjs`).
  - `docs/` (2 live docs: `operations.md`, `stellar-docs.md`) and `ideas/` (9 live files: `README.md` plus 8 held/deferred/measuring idea notes) — verified as live docs/notes, not one-off records.
- **Case-text ratchet baseline (`eval/qa/case-text-baseline.json`):** removed the stale `research/audits/2026-11-09-improvements-sweep/review-lct-fable.md` entry (required by `test/case-text-scan.test.mjs` once that uncited file is deleted; ceilings only fall).
- **Retained ledger `## Outcome` consumer lines:** added one-line `Retained for:` consumer notes (without rewriting historical prose) to nine retained ledgers:
  - `.agents/rounds/2026-08-28-eval-block2.md`
  - `.agents/rounds/2026-08-28-human-review-grill.md`
  - `.agents/rounds/2026-08-29-golden-truth-session-3.md`
  - `.agents/rounds/2026-08-31-rejected-experiments-closeout.md`
  - `.agents/rounds/2026-09-02-protocol-history-free-evidence.md`
  - `.agents/rounds/2026-10-08-maintenance.md` (also notes closure of the annotation TODO item in #433 and removal of `2026-10-08-flagged-row-recollection/`)
  - `.agents/rounds/2026-11-02-mintlify-migration.md`
  - `.agents/rounds/2026-11-02-routing-repair.md`
  - `.agents/rounds/2026-11-03-playground-model-sweep.md`
- **Lane records:**
  - [`CANDIDATES.md`](CANDIDATES.md) — full classification table (307 rows covering all 993 files; exact 1-for-1 match with `git diff --name-only --diff-filter=D origin/main`)
  - [`SOL-REVIEW.md`](SOL-REVIEW.md) — independent Codex Sol review
  - [`CHALLENGE.md`](CHALLENGE.md) — finding-by-finding challenge and verdicts
  - [`REPORT.md`](REPORT.md) — this report

## Gates (all run bare after final fixes)

| Gate | Exit code | Result |
|---|---:|---|
| `npm run typecheck` | 0 | Clean (`tsc --noEmit`) |
| `npm test` | 0 | 173 passed, 5 skipped (178 files); 4,156 passed, 3 expected fail, 5 skipped (4,164 tests); includes `case-text-scan`, `find-uncited-golden-round-json`, `case-search-ignore`, `skill-exposure-classification` |
| `npm run build` | 0 | Wrangler dry-run clean (6922.73 KiB / gzip 1376.10 KiB) |
| `npm run secrets:scan -- --tree` | 0 | `secret-scan: clean — scanned all tracked files.` |
| `npm run eval:selftest` | 0 | `self-test: all checks passed` |
| `npm run eval:qa:lint -- --stale --enforce-floors` | 0 | `0 error(s), 98 warning(s)` (conditional gate for `eval/qa/case-text-baseline.json`) |
| `npm run eval:qa:register -- --check` | 0 | `[register-helper] up to date` |
| `npm run improvements:lint` | 0 | `improvements lint ok (93 findings)` |
| Current-artifact link check | 0 | 172 current `.md` files, 613 local links, **0 broken** (all 77 links into in-scope paths resolve) |
| `git diff origin/main -- src/ package.json package-lock.json wrangler.jsonc` | 0 | Empty (0 Worker bytes changed) |

## Codex Sol Review & Challenge Verdicts

- **Reviewer:** Codex CLI (`v0.169.0`), resolved model `gpt-6.2-sol`, `high` effort, `read-only` sandbox, ChatGPT subscription (`OPENAI_API_KEY` unset), reviewing `origin/main...HEAD` at `142282cc`.
- **Total findings:** 11 (`SOL-REVIEW.md`).
- **Challenge verdicts (`CHALLENGE.md`):**
  - **Valid (fixed): 4** — F2 (High: restored `.agents/rounds/2026-11-02-mintlify-migration/responsefield-files.txt`, input to `rf-rank.mjs` cited by open finding `sd-059`), F4 (Medium: restored `research/retired-skill-guidance.md`, cited in live `research/skill-exposure-inventory.json:174,224`), F9 (Medium: deleted 8 uncited `research/gauntlets/` run summaries while keeping the 4 relevant to `scripts/run-demo-model-gauntlet.mjs:48,53`), F10 (Medium: added retaining-consumer lines to `## Outcome` in 4 retained ledgers).
  - **Invalid (refuted): 6** — F1 (High: item 3.4 closed in #464), F3 (Medium: item 3.3 closed in #463), F5 (Medium: switch rule stated inline in `2026-11-10-playground-gpt61-terra-recheck.md:4-7`; `eval/EVALS.md:136` cites it only for cost sizing), F6 (Medium: intermediate p9 plan/raw outputs excluded by `.agents/README.md` Retention), F7 (Medium: intermediate plans/reviews/lane reports already summarized inline in retained ledgers/audits), F8 (Medium: `sls097-author.md` embeds all 6 fixture rows and a standalone reproducer; `improvements/resolved.json:4061` does not cite `validation.json`).
  - **Valid but not worth fixing: 1** — F11 (Low: `eval/qa/case-text-baseline.json` stale-entry removal is required by `test/case-text-scan.test.mjs:89`, and all conditional `eval/` gates passed with exit 0).

## Model Calls Made

| Role | CLI | Model ID | Purpose | Billing |
|---|---|---|---|---|
| Lane author | Antigravity | Gemini 4 Neon (high) | Reference analysis, classification, deletions, review challenge, fixes, reports | Subscription (USD 0 API) |
| Independent reviewer | Codex (`v0.169.0`) | `gpt-6.2-sol` (high, read-only) | Review of `origin/main...HEAD` and `CANDIDATES.md` (`SOL-REVIEW.md`) | ChatGPT subscription (USD 0 API) |

## Open Questions

None blocking merge. The two `.agents/rounds/.ignore` golden-round folders remain out of scope (never opened, listed into, or deleted; guarded by `scripts/find-uncited-golden-round-json.mjs`), and `.agents/rounds/2026-11-16-next-phase/` remains out of scope while the active round runs until 2026-12-04.
