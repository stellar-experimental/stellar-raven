# Item 8.13 Report — lane `skills`

- **PR:** https://github.com/stellar-experimental/stellar-raven/pull/525
- **Branch:** `np/8.13-skills`
- **Worker bytes changed:** No (`git diff origin/main -- src/ package.json package-lock.json wrangler.jsonc` is empty)
- **Model-facing change:** No (`.agents/skills/` are repo-local coding-agent skills, not Worker-served `ecosystem-skills/`, MCP descriptions, or prompts)
- **TODO item closed:** None directly (executes lane `skills` of item 8.13's 2026-11-20 slimming pass; no `.agents/TODO.md` edits per lane boundary)

## What changed

Verified every path, command, flag, telemetry field, link, anchor, and procedural rule across all 12 files under `.agents/skills/` against current source code, tests, and workflows, then slimmed repetition and filler while preserving every binding rule, pinned section number (`golden-truth` §5, `run-evals` §5), pinned heading (`improvements-pipeline` "Follow up on filed findings"), and test-pinned token (`cf-aig-skip-cache: true` in `cloudflare-observability-review/SKILL.md`, pinned by `test/model-call-billing.test.mjs`).

### Accuracy and timelessness fixes

1. **`cloudflare-observability-review/SKILL.md`**
   - Corrected `sourceBasis` emission condition to match `src/executor/run.ts:529-553`, `src/mcp/tools.ts:455`, and `src/demo/tools.ts:570`: emitted only on a successful (`ok: true`) execute when the result is truncated or any operation call has a non-`soft-empty` outcome (`ok` or `error`).
   - Narrowed the thrown-value trap to match `@cloudflare/codemode` (`err.message`): a script throwing a value with no `.message` (such as a string or number) logs `ok: true`.
   - Replaced unverifiable point-in-time TTL observation ("300 seconds when last read") with "dashboard-side TTL", and rephrased historical "older `auth` field" note into present-state guidance.
2. **`golden-truth/SKILL.md`**
   - Listed all four generated outputs of `npm run eval:qa:compile` (`cases.json`, `sample.json`, `tool-cases.json`, `lifecycle-registry.json`) per `eval/qa/compile-qa.mjs:304` and `.github/workflows/ci.yml:138`.
3. **`improvements-pipeline/SKILL.md`**
   - Updated the `fixed-upstream` reference reconciliation search to `rg --hidden -g '!.git' -n "<finding-id>" .` (so `.agents/TODO.md` is included while `.ignore` keeps case text out), added `npm run eval:qa:lint -- --stale --enforce-floors` (`cap-finding` checks golden partial caps without exposing case text), and added an explicit handoff to a `eval/qa/README.md` maintenance-exception lane when the corpus or register is linked.
   - Removed stray blank line in `## Probes and cadence`.
4. **`live-drift-resolution/SKILL.md`**
   - Updated `npm run family-text:build` comment to list both generated outputs (`src/mcp/family-text.ts`, `src/policy/corroboration.ts`) per `scripts/build-family-text.mjs`.
   - Made `node scripts/check-mirrors.mjs --fetch` directly runnable in steps 1 and 7.
   - Aligned step 8 with step 7 ("After any required independent review"), replaced "all free and local" with "with no paid evals or reviewer lanes" (steps 1 and 8 hit live upstreams and Cloudflare), and narrowed the step 7 manifest check to "every exposed changed Markdown skill file" (`scripts/build-catalog.mjs:989,1070`).
5. **`run-evals/SKILL.md`**
   - Removed ephemeral TODO item title (`"Build a subscription second judge on OpenCode when a decision needs one"`) to keep the skill timeless per `AGENTS.md` and `8.13-LANES.md`.
   - Aligned the live-lane `--cases` comment with `eval/qa/README.md:90` ("replace `--sample 30` with `--cases eval/qa/corpus/live/live-cases.json`").
   - Deduplicated Playground E1/E2 routing rules (restated twice) in favor of linking `eval/EVALS.md#model-call-billing`.
6. **`truth-maintenance/SKILL.md`**
   - Distinguished PR CI (`npm run eval:qa:lint -- --stale --enforce-floors`) from daily refresh (`--stale` in `.github/workflows/refresh.yml:148`).
7. **`audit-reviewability/references/audit-rubric.md`**
   - Updated candidate `rg` commands to `--hidden -g '!.git'` to match `AGENTS.md`.

### Line counts (before / after)

| File | Before | After | Delta |
|---|---:|---:|---:|
| `.agents/skills/audit-reviewability/SKILL.md` | 145 | 138 | -7 |
| `.agents/skills/audit-reviewability/references/audit-rubric.md` | 306 | 184 | -122 |
| `.agents/skills/cloudflare-observability-review/SKILL.md` | 218 | 213 | -5 |
| `.agents/skills/golden-truth/SKILL.md` | 167 | 164 | -3 |
| `.agents/skills/improvements-pipeline/SKILL.md` | 195 | 199 | +4 |
| `.agents/skills/improvements-pipeline/references/upstream-writing-style.md` | 22 | 22 | 0 |
| `.agents/skills/live-drift-resolution/SKILL.md` | 168 | 165 | -3 |
| `.agents/skills/retrieval-system-audit/SKILL.md` | 79 | 79 | 0 |
| `.agents/skills/retrieval-system-audit/references/evidence-contract.md` | 59 | 59 | 0 |
| `.agents/skills/run-evals/SKILL.md` | 262 | 249 | -13 |
| `.agents/skills/run-evals/references/source-addition.md` | 26 | 26 | 0 |
| `.agents/skills/truth-maintenance/SKILL.md` | 87 | 88 | +1 |
| **Total** | **1,734** | **1,586** | **-148** |

- **Diff size (`.agents/skills/`):** `8 files changed, 188 insertions(+), 336 deletions(-)` (524 total changed lines; 4 already-minimal files left untouched).
- **Removed/collapsed blocks:** 26 redundant items across the 8 edited files (1 manual unlinked TOC, 21 repetitive `###` subheadings collapsed into bold-lead lists in `audit-rubric.md`, 2 redundant essay lists in `audit-rubric.md` `## Why these rules exist`, 1 redundant baseline wrap-up paragraph in `audit-reviewability/SKILL.md`, and 1 throat-clearing opener paragraph in `golden-truth/SKILL.md`, plus repeated Playground routing prose and duplicate sentences in `run-evals/SKILL.md` and `live-drift-resolution/SKILL.md`).

## Gates (post-challenge final run)

| Command | Exit code | Notes |
|---|---:|---|
| `npm run typecheck` | 0 | After `npm run typegen` with stub `.dev.vars` (untracked/ignored) |
| `npm test` | 0 | Includes `test/model-call-billing.test.mjs`, `test/case-text-scan.test.mjs`, `test/case-search-ignore.test.mjs` |
| `npm run build` | 0 | Dry-run Worker bundle unchanged |
| `npm run secrets:scan -- --tree` | 0 | Clean |
| `npm run eval:routing -- --gate` | 0 | `GATE PASS` — legacy 338, skills 23, holdout 49 unchanged |
| Relative Markdown link & anchor check (25 links across 12 files) | 0 | 25/25 OK, 0 broken links or missing anchors |
| `git diff --check origin/main -- .agents/skills` | 0 | Clean |

## Codex Sol review and challenge

- **Review artifact:** `.agents/rounds/2026-11-16-next-phase/items/8.13/skills/SOL-REVIEW.md`
- **Challenge artifact:** `.agents/rounds/2026-11-16-next-phase/items/8.13/skills/CHALLENGE.md`
- **Counts by class (11 findings total: 1 High, 5 Medium, 5 Low):**
  - **Valid (fixed):** 10
  - **Partially valid (2 of 3 sub-parts fixed; 1 refuted and kept deleted):** 1 (`audit-reviewability/SKILL.md` completion criteria — baseline wrap-up was redundant with steps 1–4, while evidence-based exclusions and finding-disposition completion criteria were genuinely non-redundant and restored)
  - **Invalid:** 0 (outside the refuted sub-part of finding 6)
  - **Valid but not worth fixing:** 0

## Model calls made

| CLI | Resolved model ID | Effort | Purpose |
|---|---|---|---|
| `codex` (subscription, read-only) | `gpt-6.2-sol` | `high` | Independent review of `git diff origin/main...HEAD` (`SOL-REVIEW.md`) |

No API-billed calls were made.

## Questions for the owner

1. **Dated audit link in `run-evals/SKILL.md:40-41`**
   - **Exact text:** `[research/audits/2026-07-11-eval-round-orchestration.md](../../../research/audits/2026-07-11-eval-round-orchestration.md)` ("records what such reviews catch.")
   - **Context:** `AGENTS.md` allows linking dated research from current docs, and item 8.12's retention sweep (`items/8.12/sweep/CANDIDATES.md:241`) kept that audit solely because `run-evals/SKILL.md` cites it.
   - **Recommendation:** Keep the link if that 2026-07-11 audit still teaches useful review failure modes; remove it if you want `run-evals/SKILL.md` free of dated audit links and are ready to retire `research/audits/2026-07-11-eval-round-orchestration.md` in a later retention pass.
2. **External forum link in `audit-reviewability/references/audit-rubric.md:183-184`**
   - **Exact text:** `The practitioner discussion: [Hacker News item 49337050](https://news.ycombinator.com/item?id=49337050).`
   - **Context:** Kept as part of the rubric's source provenance (it backs the "practitioner testimony" clause in `## Why these rules exist`).
   - **Recommendation:** Keep unless you prefer omitting external forum threads from reference lists.
