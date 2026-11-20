# Item 8.13 (`docsguides`) — Codex Sol review challenge

Reviewer CLI: Codex (`codex --dangerously-bypass-hook-trust exec -m gpt-6.2-sol -c 'model_reasoning_effort="high"' -s read-only`), ChatGPT subscription.
- PR #527 (`np/8.13-docsguides`, `eval/` guides): [`SOL-REVIEW.md`](SOL-REVIEW.md), resolved `gpt-6.2-sol` (catalog `fetched_at 2026-11-20T01:06:15.118Z`).
- PR #530 (`np/8.13-docsguides-other`, non-`eval/` guides): [`SOL-REVIEW-pr2.md`](SOL-REVIEW-pr2.md), resolved `gpt-6.2-sol` (catalog `fetched_at 2026-11-20T00:57:14.317Z`).

Every finding below was independently verified against source code and `origin/main` docs before deciding whether to apply a fix.

## Verdict totals

| Review | Total | Valid (fixed in PR) | Valid (out of lane scope; escalated) | Invalid | Valid, not worth fixing |
|---|---:|---:|---:|---:|---:|
| PR #527 (`eval/` guides) | 17 | 16 (+ doc note for #1) | 1 (code half of #1) | 0 | 0 |
| PR #530 (non-`eval/` guides) | 19 | 19 | 0 | 0 | 0 |
| **Combined** | **36** | **35** | **1 (code half of PR #527 #1)** | **0** | **0** |

---

## PR #527 (`eval/` guides) — 17 findings

| # | Severity | Location | Verdict | Verification evidence & action |
|---|---|---|---|---|
| 1 | High | `eval/qa/README.md:440,589`, `eval/qa/paired-collection-supervisor.mjs:328` | **Valid** (doc fixed; code escalated) | Verified in `eval/qa/run-p6-judge-self-test.mjs:70-75,278` (`--judge-model` required, exact ID) vs `eval/qa/paired-collection-supervisor.mjs:328-348` (`expectedCommand` omits `--judge-model`). Added `--judge-model <exact-judge-model-id>` to the standalone P6 example and noted the pre-existing supervisor mismatch in `eval/qa/README.md`; escalated the `.mjs` fix under Questions/Follow-ups in `REPORT.md` (out of `docsguides` write scope). |
| 2 | Medium | `eval/EVALS.md:65` | **Valid** (fixed) | Verified in `eval/lib/harness-guards.mjs:124-126` (all four root flags before `auth status`) and original `eval/EVALS.md:96` (read only `connections[].method`). Restored both. |
| 3 | Medium | `eval/EVALS.md:85` | **Valid** (fixed) | Verified in `eval/plan/grade-plan.mjs:250,257` (`searchQueries` counts both MCP `search` and nested `codemode.search`) and original `eval/EVALS.md:117,120`. Restored matched-stored-traces preference and direct top-level call counting warning. |
| 4 | Medium | `eval/README.md:41`, `eval/discovery/README.md:3` | **Valid** (fixed) | Verified in `eval/discovery/run-discovery.mjs:72` (matches by committed row ID, not custom `--cases` text). Clarified runner integration (`pass its set name and row IDs to lib/confirmation-only.mjs`) and committed-ID scope in `eval/discovery/README.md`. |
| 5 | Medium | `eval/README.md:45,53` | **Valid** (fixed) | Confirmed against `origin/main` `eval/README.md:89,127`. Restored "freeze blind labels before reading scorer details or result traces" and reserved `--rows` for readers who need per-row tables. |
| 6 | Medium | `eval/qa/README.md:394` | **Valid** (fixed) | Confirmed against `origin/main` `eval/qa/README.md:544,547`. Restored "under a common target contract" and the prompt-hash fixture requirement for formatting edits. |
| 7 | Medium | `eval/qa/README.md:590` | **Valid** (fixed) | Verified in `eval/qa/paired-collection-supervisor.mjs:688-690` (`twoArmCumulativeUsd === baseline.cumulativeUsd + candidate.cumulativeUsd`) and `origin/main` `eval/qa/README.md:798-835`. Clarified cap arithmetic and restored `selected.activeCorpusCount` / active-ID hash pin, `add-missing`/`verify-native` adapter modes, and `--paired-control-arm`. |
| 8 | Medium | `eval/qa/README.md:591` | **Valid** (fixed) | Confirmed against `origin/main` `eval/qa/README.md:839-840`. Restored process-group verification before signaling and complete-evidence/unsuppressed-aggregates gate after stored judging. |
| 9 | Medium | `eval/playground/README.md:51` | **Valid** (fixed) | Verified in `scripts/run-playground-semantic-eval.mjs:729-738` (`QUARANTINE WRITE FAILED` stderr marker) and `origin/main` `eval/playground/README.md:157,169-171`. Restored generation-check error trigger, best-effort write + stderr recovery, and transcript-proven `infra-retry`. |
| 10 | Low | `eval/playground/README.md:5,18,54` | **Valid** (fixed) | Confirmed E2 duplicate cap fails before printing plan; restored separate `--ids` targeted example in E1; restored "run it after Playground prompt or tool-loop changes" under Plan grading. |
| 11 | Low | `eval/playground/README.md:49` | **Valid** (fixed) | Verified in `scripts/run-playground-semantic-eval.mjs:686-699` (`budget-exhausted` sets `nonPromotable: true`, `summary: null`, exit 1) and missing logged models stop with `observed-model-mismatch`. Added both. |
| 12 | Low | `eval/qa/README.md:326,456` | **Valid** (fixed) | Verified `run-qa.mjs` writes attempt timestamps and `originalFailureClass`; restored `run-qa.mjs` attribution, shared `assistantTurn` non-concurrency caveat, and `--help`/`-h` in stable-row diagnostic. |
| 13 | Low | `eval/agentic/README.md:7` | **Valid** (fixed) | Verified in `eval/agentic/workflow-agentic-routing.js:62,97-100` (1–3 searches prompt; `.catch(() => null)` drops failed jobs). Updated wording accordingly. |
| 14 | Low | `eval/partner-docs/README.md:13` | **Valid** (fixed) | Verified in `scripts/eval-partner-docs.mjs:340` (`validateSuite`, not JSON-schema validation; committed cases use pinned commits). Updated wording to match runtime behavior. |
| 15 | Low | `eval/partner-docs/README.md:24` | **Valid** (fixed) | Confirmed against `origin/main` `eval/partner-docs/README.md:51,64-65`. Restored rendered-HTML non-proof rule and fresh paired run + source-set/hash check. |
| 16 | Low | `eval/plan/README.md:14,45` | **Valid** (fixed) | Verified in `eval/plan/grade-plan.mjs:188,250,393` (`resultsPath.replace(/\.json$/, "") + ".plan.json"`; MCP `search`, `codemode.search`, and `codemode.catalog` all satisfy broad step before skill call). Fixed output name (`<stem>.plan.json`) and progression description. |
| 17 | Low | `eval/temporal/README.md:5` | **Valid** (fixed) | Verified in `eval/temporal/score-temporal.mjs:243` (`hasObservationContextInAnyResult`). Specified "baseline rows must lack it in every tool result". |

---

## PR #530 (non-`eval/` guides) — 19 findings

| # | Severity | Location | Verdict | Verification evidence & action |
|---|---|---|---|---|
| 1 | High | `plugins/openai/README.md:75` | **Valid** (fixed) | Confirmed against `origin/main` `plugins/openai/README.md:126`. Restored readable-text and private-account-content checks before hosting a demo recording. |
| 2 | Medium | `plugins/openai/README.md:50` | **Valid** (fixed) | Confirmed against `origin/main` `plugins/openai/README.md:57-63`. Restored stored results, upstream recipients, usage records, and third-party source authorization checks. |
| 3 | Medium | `plugins/openai/README.md:54` | **Valid** (fixed) | Confirmed against `origin/main` `plugins/openai/README.md:79-85`. Restored account registration, email verification, password setup, and 8-case rehearsal prep steps. |
| 4 | Medium | `plugins/openai/domain-verification/README.md:14` | **Valid** (fixed) | Chained `npm ci --ignore-scripts && npm run typecheck && npm run build && npm audit` and separated `cf deploy` into its own block after validation passes. |
| 5 | Medium | `ecosystem-skills/README.md:82` | **Valid** (fixed) | Confirmed against `origin/main` `ecosystem-skills/README.md:96`. Restored explicit rename vs upstream-removal instruction for `RETIRED_ONBOARDING_SKILLS`. |
| 6 | Medium | `usage/README.md:9` | **Valid** (fixed) | Confirmed against `origin/main` `usage/README.md:20-21`. Separated the account-hash rule from the rule applying to every user-level dataset. |
| 7 | Medium | `usage/README.md:41` | **Valid** (fixed) | Moved `npm run deploy` ahead of live D1/canary verification and restored the monthly report check. |
| 8 | Medium | `usage/report-site/README.md:7` | **Valid** (fixed) | Confirmed against `origin/main` `usage/report-site/README.md:18`. Restored explicit "apply migration 0003 before deploying" and private bound-parameter import of trusted operator-generated launch JSON. |
| 9 | Medium | `src/catalog/README.md:47` | **Valid** (fixed) | Verified in `src/catalog/detail-relation.ts:45-59` (`rowsCarryJoinKeys` requires at least one row with every join key as a non-empty string). Tightened wording beyond `origin/main` to match code. |
| 10 | Low | `.agents/model-roster.md:19` | **Valid** (fixed) | Verified in `scripts/latest-model.mjs:17` (`if (fetchedAt) console.error(...)`). Added "when present". |
| 11 | Low | `assets/brand/README.md:7` | **Valid** (fixed) | Clarified `/raven-icon.svg` is mark-only and `tools/` rebuilds outlined logos and pattern (not carousel frames). |
| 12 | Low | `ecosystem-skills/README.md:61` | **Valid** (fixed) | Verified in `ecosystem-skills/update.sh:252-255` (four sequential `mv -f` calls with rollback trap). Changed "atomically swaps" to "swaps ... into place together (renaming sequentially with rollback on failure)". |
| 13 | Low | `improvements/README.md:64` | **Valid** (fixed) | Verified in `scripts/improvements-file-issue.mjs:307-318` (snapshot link emitted only when HEAD blob matches `finding.raw`). Added "(when committed cleanly)". |
| 14 | Low | `inventory/README.md:16` | **Valid** (fixed) | Verified in `scripts/refresh-inventory.mjs:92-105` (checks `.env` values `length >= 6` plus env `LUMENLOOP_API_KEY` and `MINTLIFY_ASSISTANT_API_KEY`). Updated description to match. |
| 15 | Low | `scripts/README.md:15` | **Valid** (fixed) | Verified in `scripts/run-mcp-surface.mjs:11-22` (bundles into temp dir, spawns Node in caller cwd). Updated description to match. |
| 16 | Low | `src/catalog/README.md:10,44` | **Valid** (fixed) | Separated catalog/sandbox non-finite limit fallback from public MCP Zod schema validation; changed "gets" to "can receive" for one-token directory anchors. |
| 17 | Low | `src/skills/README.md:29` | **Valid** (fixed) | Verified in `src/skills/store.ts:406-415` (unknown sections list `availableSections`; uncataloged body headings fail closed with an indexing-drift error). Separated the two cases. |
| 18 | Low | `test/README.md:16` | **Valid** (fixed) | Separated catalog/spec freshness temp-path isolation from improvement-write `gh`/`git` command substitution. |
| 19 | Low | `usage/README.md:19` | **Valid** (fixed) | Verified in `src/usage/collector.ts:143,147-151` (`USAGE_RETENTION_MONTHS` includes the current UTC month; 3 write attempts total). Fixed both phrasing errors. |
