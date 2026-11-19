# Item 8.12 lane `driftissues` — Report

- **PR**: https://github.com/stellar-experimental/stellar-raven/pull/519 (branch `np/8.12-driftissues`)
- **TODO item closed**: None closed in full (owner request from 2026-11-19 to split the monolithic drift issue); updated the routing-gate headroom bullet under `"Preserve structured routing intent across extraction caps and gate tiers"` in `.agents/TODO.md` so it no longer depends on closed issue #223. No frozen dated-run anchor changed.
- **Worker bytes changed**: No (`git diff origin/main -- src/ package.json package-lock.json wrangler.jsonc` is empty).
- **Model-facing**: No (CI workflow, maintenance scripts, unit tests, and documentation only).

## What changed

- **[`scripts/sync-drift-issues.mjs`](../../../../../../scripts/sync-drift-issues.mjs)** (new):
  - `collect` builds a normalized `drift-report.json` with one item per drifted `<class>:<source>` key (`anchors:stellar-docs`, `canary:failing`, `canary:stale`, `pins:ecosystem-skills`, `gospel:qa-corpus`, `inventory:<source>`, `skills-pin:<id>`, `skills-directory:<id>`) and writes the 5 enum outputs (`skills_error`, `pins_error`, `gospel_error`, `canary_error`, `drift`) to `$GITHUB_OUTPUT`.
  - Every managed issue body and update comment carries a line-1 hidden marker `<!-- raven-drift key=<key> fingerprint=<sha256> -->` and a specific `Drift (<class>): <source>...` title. Fingerprints exclude volatile run fields (Run URL, canary `checkedAt`/`ms` on failing verdicts, `lint-corpus.mjs` `(today YYYY-MM-DD)`, and non-deterministic `Promise.all` bullet order in `check-mirrors.mjs`).
  - `sync` reconciles open `drift`-labeled issues via `gh`: opens missing keys (preserving `REFRESH_ISSUE_ASSIGNEE` with non-fatal warning fallback), comments on open keyed issues only when the canonical fingerprint changed since the latest drift marker (ignoring human comments), comments the clearing run URL and closes cleared keys only when their owning check completed cleanly (fail-closed on checker errors, partial skills errors, stale canary for `canary:failing`, failed anchor capture for `inventory:stellar-docs-anchors`, and skipped derived builders for `inventory:derived`), and leaves unkeyed legacy `drift` issues untouched.
  - Supports `--dry-run` (offline with `--open-issues`, or live read-only against GitHub) and isolates per-action `gh` failures so one failing issue never skips other independent keys.
- **[`scripts/summarize-live-drift.mjs`](../../../../../../scripts/summarize-live-drift.mjs)**:
  - Exported `collectInventoryDrift()` to emit independent per-source inventory records (`lumenloop`, `stellar-light`, `stellar-docs`, `stellar-docs-titles`, `stellar-docs-anchors`, `stellar-org`, any future `inventory/*.json`, or `derived` when `catalog/`/`specs/` JSON changes without any catalog-feeding snapshot changing), plus `classifyStellarOrg()` / `summarizeStellarOrg()`.
- **[`scripts/check-skills-drift.mjs`](../../../../../../scripts/check-skills-drift.mjs)**:
  - Exported `DIRECTORY_SOURCE_IDS` and guarded `main()` behind a main-module check so `sync-drift-issues.mjs` shares the single source of truth.
- **[`.github/workflows/refresh.yml`](../../../../../../.github/workflows/refresh.yml)**:
  - Added `concurrency` (`group: refresh`, `cancel-in-progress: false`).
  - Runs `check-skills-drift.mjs --json > skills-drift.json` and replaces the inline bash report/issue logic with thin calls to `scripts/sync-drift-issues.mjs collect` and `scripts/sync-drift-issues.mjs sync`.
  - Runs `sync drift issues` whenever `steps.drift.outcome == 'success'` (including clean runs so cleared keys auto-close), switching automatically to `--dry-run` on non-default refs so branch dispatches cannot mutate `main`'s issues.
  - Skips `build-catalog.mjs` / `family-text:build` / `spec:build` when `steps.pins.outputs.state == 'unresolvable'` so a cold-runner 404 pin outage reaches `detect drift` and opens `pins:ecosystem-skills` instead of crashing into `refresh-failure`.
  - **`refresh-failure` decision**: left unchanged. `refresh-failure` fires only on unclassified pre-detection crashes (`steps.drift.outcome != 'success'`) with no per-source breakdown; it does not have the multi-class bundling problem, and auto-closing a crash ticket on a later green run could hide an intermittent script bug before investigation.
- **Docs & TODO**:
  - Updated [`.agents/skills/live-drift-resolution/SKILL.md`](../../../../../../.agents/skills/live-drift-resolution/SKILL.md) (timeless), [`docs/operations.md`](../../../../../../docs/operations.md), [`inventory/README.md`](../../../../../../inventory/README.md), [`scripts/README.md`](../../../../../../scripts/README.md), and [`.agents/TODO.md`](../../../../../../.agents/TODO.md).
- **Tests**:
  - Added [`test/sync-drift-issues.test.mjs`](../../../../../../test/sync-drift-issues.test.mjs) covering key routing, fingerprint stability, fail-closed error handling, line-1 marker anchoring, CLI flag/dry-run guardrails, and open/update/unchanged/close/hold-on-error/ignore-legacy planning (no wording assertions).
  - Updated [`test/refresh-anchor-workflow.test.mjs`](../../../../../../test/refresh-anchor-workflow.test.mjs) for the structured `drift-report.json` output and `sync drift issues` step.

## Verification & dry-run proofs

No real GitHub issues were created, edited, or closed, and `refresh.yml` was not dispatched.

- **Offline fixture dry-run** (exercising `open`, `update`, `unchanged`, `close`, `hold-on-error`, and `ignore-legacy` with a code-fenced marker example):
  ```text
  [dry-run] ignore     #223 "Live service drift detected" (unkeyed legacy drift issue)
  [dry-run] open       canary:stale -> "Drift (canary): stale — Worker skill-retrieval detector stale" (assign kalepail) [b65a31c68fc9]
  [dry-run] unchanged  inventory:stellar-light -> #601 [b5d7ab406218]
  [dry-run] open       skills-directory:stellar-community-catalog -> "Drift (skills-directory): stellar-community-catalog" (assign kalepail) [ea5465a6c1db]
  [dry-run] update     skills-pin:stellar-dev -> comment #602 (000000000000 -> 1f6368c8e1b2) + assign kalepail
  [dry-run] hold       canary:failing -> keep #604 open (canary state is stale; retrieval recovery is unverified)
  [dry-run] close      skills-directory:stellarlight-catalog -> comment + close #603
  ```
- **Live clean-state dry-run** (`collect` on clean tree + read-only `gh api` against `stellar-experimental/stellar-raven`):
  ```text
  [dry-run] no drift issue actions planned.
  ```

## Gates (all run bare after final fixes)

| Gate | Exit code | Notes |
|---|---:|---|
| `npm run typecheck` | 0 | Clean |
| `npm test` | 0 | 174 passed, 5 skipped (4165 passed, 3 expected fail, 5 skipped) |
| `npm run build` | 0 | Dry-run bundle succeeded (6922.73 KiB / gzip 1376.10 KiB) |
| `npm run secrets:scan -- --tree` | 0 | Clean |
| `git diff --check` | 0 | Clean |
| `python3 -c 'import yaml; yaml.safe_load(open(".github/workflows/refresh.yml"))'` | 0 | Valid YAML (`configuration`, `refresh`). `actionlint` is not installed on this host. |

## Codex Sol review & challenge

- **Review**: [`SOL-REVIEW.md`](./SOL-REVIEW.md) — Codex CLI (`gpt-6.2-sol`, `reasoning effort: high`, read-only).
- **Challenge**: [`CHALLENGE.md`](./CHALLENGE.md).
- **Verdicts by class**:
  - **Valid (fixed)**: 10 (`F1`, `F2`, `F3`, `F4`, `F5`, `F7`, `F8`, `F9`, `F10`, `F11`)
  - **Invalid**: 1 (`F6`)
  - **Valid but not worth fixing**: 0

## Model calls made

| CLI | Resolved model ID | Purpose |
|---|---|---|
| Antigravity (lane worker) | Gemini 4 Neon (High) | Implementation, challenge, fixes, verification |
| `codex exec` (read-only) | `gpt-6.2-sol` (`high`) | Independent review of `origin/main...HEAD` (`SOL-REVIEW.md`) |

## Open questions

- None. After merge, the orchestrator can dispatch one live run of `refresh.yml` on `main` to confirm clean-state reconciliation end-to-end.
