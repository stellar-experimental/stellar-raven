# Item 8.13 — Lane `docsguides` Report

## Summary

Audited all 26 non-root, non-skill, non-TODO tracked guides and `README.md` files owned by lane `docsguides` for accuracy, clarity, and brevity per `8.13-SLIM.md`.

- **22 files slimmed:** **3,155 → 1,808 lines (-1,347 net lines, -42.7%)**; **631 → 506 paragraphs/blocks (-125 blocks removed)**.
- **4 already-minimal guides audited and kept unchanged:** `.agents/README.md` (39 lines), `.agents/rounds/README.md` (46 lines), `assets/repo/README.md` (9 lines), `research/decisions/README.md` (21 lines).
- **Non-guide/generated/dated records untouched:** `ecosystem-skills/INDEX.md` (generated), `improvements/INDEX.md` (generated), `ecosystem-skills/PIN-REVIEW.md` (CI-gated review ledger), `assets/brand/listing.md` (dated design record), `eval/qa/claim-read-brief.md` (frozen reader prompt), `plugins/openai/{EXCEPTION-REQUEST,MCP-FINDINGS,RESUBMISSION,REVIEW-CASES-2026-10-23,VERIFICATION}.md` (dated records), and all guarded case paths (`eval/qa/corpus/`, `eval/corpus/`).
- **Split into two reviewable, disjoint PRs** per `8.13-SLIM.md` ("if your diff exceeds about 1,500 changed lines, split it into two PRs by sub-area"):
  - **PR #527** (`np/8.13-docsguides`): 9 `eval/` guides — **1,067 changed lines** (+165 / -902, net -737 lines; plus item records). URL: https://github.com/stellar-experimental/stellar-raven/pull/527
  - **PR #530** (`np/8.13-docsguides-other`): 13 non-`eval/` guides — **1,082 changed lines** (+236 / -846, net -610 lines). URL: https://github.com/stellar-experimental/stellar-raven/pull/530

### Accuracy fixes landed

- `ecosystem-skills/README.md`: replaced stale "Drift goes into the same issue as the inventory checks" with per-kind `<class>:<source>` `drift`-labeled issues reconciled by `scripts/sync-drift-issues.mjs`.
- `test/README.md`: added missing `find-uncited-golden-round-json*` and `sync-drift-issues*` patterns so every file in `test/` maps to a documented group.
- `.agents/model-roster.md`: removed two placeholder `per catalog` columns from the Repo-work tiers table and tightened `fetched_at` stderr behavior against `scripts/latest-model.mjs`.
- `eval/qa/README.md`: added required `--judge-model <exact-judge-model-id>` to the standalone P6 self-test command example (verified against `eval/qa/run-p6-judge-self-test.mjs:278`) and noted the pre-existing `paired-collection-supervisor.mjs` command mismatch.
- `eval/plan/README.md`: corrected output path from `<file>.plan.json` to `<stem>.plan.json` (`eval/plan/grade-plan.mjs:393`) and included MCP `search` + `codemode.catalog` in skill-progression discovery (`grade-plan.mjs:188,250`).
- `src/catalog/README.md`: tightened `detail` pointer trigger to match `src/catalog/detail-relation.ts:45-59` (at least one returned row carrying every join key as a non-empty string) and separated catalog/sandbox vs MCP `search` limit handling.
- `usage/README.md`: aligned retention window ("`USAGE_RETENTION_MONTHS` UTC calendar months including the current month") and write attempts ("three attempts total") with `src/usage/collector.ts:143,147-151`.
- `inventory/README.md`, `improvements/README.md`, `scripts/README.md`, `eval/agentic/README.md`, `eval/partner-docs/README.md`, `eval/temporal/README.md`: tightened subtle overstatements caught during code verification and Sol review challenge.

---

## Line and block counts (before vs after)

| File | PR | Before | After | Delta | Blocks before | Blocks after |
|---|---:|---:|---:|---:|---:|---:|
| `eval/EVALS.md` | #527 | 169 | 106 | -63 | 27 | 23 |
| `eval/README.md` | #527 | 139 | 61 | -78 | 34 | 24 |
| `eval/agentic/README.md` | #527 | 87 | 43 | -44 | 21 | 15 |
| `eval/discovery/README.md` | #527 | 76 | 39 | -37 | 19 | 13 |
| `eval/partner-docs/README.md` | #527 | 71 | 30 | -41 | 19 | 13 |
| `eval/plan/README.md` | #527 | 106 | 53 | -53 | 20 | 15 |
| `eval/playground/README.md` | #527 | 183 | 59 | -124 | 39 | 18 |
| `eval/qa/README.md` | #527 | 873 | 602 | -271 | 145 | 131 |
| `eval/temporal/README.md` | #527 | 53 | 27 | -26 | 14 | 9 |
| `.agents/model-roster.md` | #530 | 113 | 75 | -38 | 21 | 20 |
| `assets/brand/README.md` | #530 | 64 | 48 | -16 | 17 | 14 |
| `ecosystem-skills/README.md` | #530 | 183 | 118 | -65 | 33 | 33 |
| `improvements/README.md` | #530 | 145 | 83 | -62 | 34 | 27 |
| `inventory/README.md` | #530 | 76 | 44 | -32 | 18 | 17 |
| `plugins/openai/README.md` | #530 | 152 | 92 | -60 | 33 | 27 |
| `plugins/openai/domain-verification/README.md` | #530 | 29 | 23 | -6 | 9 | 9 |
| `scripts/README.md` | #530 | 60 | 45 | -15 | 10 | 9 |
| `src/catalog/README.md` | #530 | 153 | 49 | -104 | 28 | 21 |
| `src/skills/README.md` | #530 | 145 | 56 | -89 | 28 | 19 |
| `test/README.md` | #530 | 81 | 59 | -22 | 13 | 12 |
| `usage/README.md` | #530 | 166 | 83 | -83 | 41 | 30 |
| `usage/report-site/README.md` | #530 | 31 | 13 | -18 | 8 | 7 |
| **Total (22 edited)** | | **3155** | **1808** | **-1347** | **631** | **506** |

Audited, unchanged (4 files, 115 lines): `.agents/README.md` (39), `.agents/rounds/README.md` (46), `assets/repo/README.md` (9), `research/decisions/README.md` (21).

---

## Gates (all run bare after final edits)

| Command | Branch / PR | Exit code | Result |
|---|---|---:|---|
| `npm run typecheck` | #527 & #530 | 0 | Clean |
| `npm test` | #527 & #530 | 0 | 174 passed, 5 skipped (4165 passed, 3 expected fail, 5 skipped) |
| `npm run build` | #527 & #530 | 0 | `dist/server.js` SHA-256 unchanged (`61fffe43b6f0d249bf67898c508e19989896b2d0811013fcda75a2ee51fa4b06`) |
| `npm run secrets:scan -- --tree` | #527 & #530 | 0 | Clean |
| `npm run eval:selftest` | #527 | 0 | All checks passed |
| `npm run eval:qa:lint -- --stale --enforce-floors` | #527 | 0 | 0 errors (98 pre-existing warnings) |
| `npm run eval:qa:register -- --check` | #527 | 0 | Up to date |
| `npm run eval:routing -- --gate` | #527 | 0 | `GATE PASS` (unchanged aggregates) |
| `npm run improvements:lint` | #530 | 0 | `improvements lint ok (95 findings)` |
| `npm run build:usage` | #530 | 0 | Clean |
| `npm run test:usage-report` | #530 | 0 | 13/13 passed, syntax check clean |
| `npm run build:usage-report` | #530 | 0 | Clean |
| Repo-wide Markdown link & anchor check (67 live `.md` files) | #527 & #530 | 0 | 0 broken local links or anchors |

---

## Codex Sol review & challenge

Full reviews: [`SOL-REVIEW.md`](SOL-REVIEW.md) (PR #527) and [`SOL-REVIEW-pr2.md`](SOL-REVIEW-pr2.md) (PR #530).
Challenge record: [`CHALLENGE.md`](CHALLENGE.md).

- **PR #527 (`eval/` guides):** 17 findings — **16 valid & fixed** in docs (plus doc note on #1), **1 code-bug half escalated** (out of lane scope), **0 invalid**, **0 valid-not-worth-fixing**.
- **PR #530 (non-`eval/` guides):** 19 findings — **19 valid & fixed**, **0 invalid**, **0 valid-not-worth-fixing**.

---

## Worker bytes & model-facing check

- **PR #527 (`np/8.13-docsguides`):** `git diff origin/main...HEAD -- src/ package.json package-lock.json wrangler.jsonc` is **empty**. No Worker byte change; not model-facing.
- **PR #530 (`np/8.13-docsguides-other`):** `git diff origin/main...HEAD -- src/ package.json package-lock.json wrangler.jsonc` lists only `src/catalog/README.md` and `src/skills/README.md` (Markdown documentation, not bundled). `dist/server.js` SHA-256 is byte-identical before and after (`61fffe43b6f0d249bf67898c508e19989896b2d0811013fcda75a2ee51fa4b06`). No Worker byte change; not model-facing.

---

## TODO item closed

None directly in `.agents/TODO.md` — this lane fulfills the owner's 2026-11-20 slimming request (`8.13-SLIM.md`, lane `docsguides`).

---

## Model calls made

| CLI | Resolved model ID | Effort | Purpose |
|---|---|---|---|
| Codex (`codex exec -s read-only`, ChatGPT subscription) | `gpt-6.2-sol` | `high` | Independent review of PR #530 (`np/8.13-docsguides-other`, non-`eval/` guides) |
| Codex (`codex exec -s read-only`, ChatGPT subscription) | `gpt-6.2-sol` | `high` | Independent review of PR #527 (`np/8.13-docsguides`, `eval/` guides) |

No API-billed or AI Gateway model calls were made.

---

## Questions for the owner / follow-ups

1. **Pre-existing paired-collection P6 `--judge-model` mismatch (code bug, out of `docsguides` scope):**
   - `eval/qa/run-p6-judge-self-test.mjs:70-75,278` requires `--judge-model <exact-id>` (added when exact judge-model pinning landed), whereas `eval/qa/paired-collection-supervisor.mjs:328-348` checks an `expectedCommand` array that omits `--judge-model`. Consequently, a paired collection plan cannot currently pass both P6 CLI parsing and supervisor plan validation.
   - **Recommendation:** File a small follow-up item in `.agents/TODO.md` (or fix in an eval-code lane) to add `--judge-model` to `paired-collection-supervisor.mjs`'s `p6.command` validation and its tests, then remove the temporary note in `eval/qa/README.md`.
2. **No binding rules were removed from `eval/qa/README.md` or any other guide.** The held-out split and golden-maintenance exception sections in `eval/qa/README.md` were preserved verbatim.
