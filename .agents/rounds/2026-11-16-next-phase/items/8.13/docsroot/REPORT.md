# Item 8.13 Lane Report — `docsroot`

- **PR:** https://github.com/stellar-experimental/stellar-raven/pull/524
- **Branch:** `np/8.13-docsroot`
- **Lane scope:** `README.md`, `ARCHITECTURE.md`, `PLAN.md`, `CONTRIBUTING.md`, `AGENTS.md`, `THIRD-PARTY-NOTICES.md`, `docs/operations.md`, `docs/stellar-docs.md`
- **Worker bytes changed:** **No** (`git diff $(git merge-base origin/main HEAD) -- src/ package.json package-lock.json wrangler.jsonc` = 0 lines)
- **Model-facing change:** **No** (documentation only; no Worker or prompt strings edited)
- **TODO item closed:** None directly in `.agents/TODO.md` (part of the 2026-11-20 owner slimming directive; lane `docsroot` does not edit `.agents/TODO.md`).

## Before / after counts

| File | Lines (before → after) | Delta | Words (before → after) | Paragraphs/blocks (before → after) |
|---|---:|---:|---:|---:|
| `README.md` | 100 → 91 | -9 | 698 → 591 (-15%) | 23 → 22 (-1) |
| `ARCHITECTURE.md` | 463 → 255 | -208 | 5,638 → 3,503 (-38%) | 93 → 83 (-10) |
| `PLAN.md` | 52 → 46 | -6 | 373 → 325 (-13%) | 12 → 10 (-2) |
| `CONTRIBUTING.md` | 60 → 54 | -6 | 431 → 349 (-19%) | 16 → 15 (-1) |
| `AGENTS.md` | 233 → 224 | -9 | 2,480 → 2,362 (-5%) | 28 → 28 (0) |
| `THIRD-PARTY-NOTICES.md` | 103 → 83 | -20 | 854 → 657 (-23%) | 22 → 15 (-7) |
| `docs/operations.md` | 153 → 137 | -16 | 1,269 → 946 (-25%) | 35 → 34 (-1) |
| `docs/stellar-docs.md` | 235 → 192 | -43 | 2,162 → 1,514 (-30%) | 47 → 40 (-7) |
| **Total** | **1,399 → 1,082** | **-317 (-23%)** | **13,905 → 10,247 (-26%)** | **276 → 247 (-29 blocks)** |

Diff size for the 8 doc files: `556 insertions(+), 873 deletions(-)` (1,429 changed lines — single reviewable PR under the ~1,500-line threshold).

## Key accuracy fixes (verified against source)

- **`ARCHITECTURE.md`:**
  - `UPSTREAM_DOC_LINKS` covers Lumenloop, Scout, and Stellar Docs (not `stellarOrg`; `src/mcp/tools.ts:132`).
  - `scripts/build-family-text.mjs` emits both `FAMILY_LINE` and `SEARCH_OPENING` into `src/mcp/family-text.ts`, plus `src/policy/corroboration.ts`.
  - CI artifact sync rebuilds catalog, family text and corroboration guard, super spec, globes (`src/demo/globe.ts`, `src/consent-globe.ts`), skill index, and eval artifacts—not instructions or `site:og`/`site:fonts` images (`.github/workflows/ci.yml:118-138`); unit tests (`test/super-spec.test.ts`, `test/family-text.test.mjs`) also check staleness.
  - Playground request-body cap checks both `Content-Length > 384 KiB` (`413`) and decoded body `> 393,216` chars (`400`) (`src/demo/chat.ts:88, 124-127, 573-574`); loopback fallback `dev-loopback` uses no signed cookie (`src/demo/chat.ts:73, 115-117`); `Promise.all({ ... })` preflight rejects detected calls (`src/demo/tools.ts:273-282`); artifact metadata holds up to 12 calls within the 8,192-byte cap (`src/artifacts/store.ts:204, 264-290`).
- **`THIRD-PARTY-NOTICES.md`:**
  - `scrubNonExposedRefs` runs at both build and read time and handles sections, table rows, blockquotes, paragraphs, and list items (`src/skills/scrub.ts`).
  - Listed committed companion-file single-line H1/H2 titles/filenames and whole-skill description fallbacks (`scripts/build-catalog.mjs:1023-1026, 1075-1088`; `test/skill-content-not-vendored.test.ts:49-54`).
  - Added `ecosystem-skills/community.json` under "Other snapshot data"; cut dated 2026-11-18 counsel-review narration.
- **`docs/operations.md`:**
  - `REFRESH_ISSUE_ASSIGNEE` defaults to `kalepail` on `stellar-experimental/stellar-raven`, and `github.repository_owner` on forks (`.github/workflows/refresh.yml:46`, `dependency-audit.yml:30`, `golden-sentinels.yml:37`).
  - `GET /health/skills` post-deploy check requires `checkedAt` after the deploy, and returns `503` if failed, never ran, or unreadable/invalid (`src/skills/canary.ts:178-214`, `scripts/classify-canary.mjs:64-73`).
  - `predeploy` fetches `origin/main` and fails closed; `DEPLOY_ALLOW_UNCLEAN=1` skips the entire preflight and deploys the working tree as-is (`scripts/deploy-preflight.mjs:21-56`).
- **`docs/stellar-docs.md`:**
  - Noted `includeMeetings` on `search_docs`/`search_doc_titles`, weighted title/path scoring (`2× title + 1× path`, upstream rank tie-break; `src/adapters/stellar-docs.ts:391-402`), H2–H6 ATX heading anchor restriction (`:544`), shared 404 absence set (`:42, 95`), `/index` redirect probe condition (`:454-466`), accurate soft-empty guard and per-case hints (`:515-537`), and anchor snapshot drift warning.
- **`AGENTS.md`:** Preserved every binding rule intact; tightened wording only.

## Codex Sol review & challenge

- **Review:** `.agents/rounds/2026-11-16-next-phase/items/8.13/docsroot/SOL-REVIEW.md`
- **Challenge:** `.agents/rounds/2026-11-16-next-phase/items/8.13/docsroot/CHALLENGE.md`
- **Counts by class (27 findings):**
  - **Valid (fixed):** 26 (F1–F25, F27; with partial challenges on F19 where Sol fabricated an `origin/main` quote and F20 where Sol missed unit-test staleness checks; F23's malformed-response path-omission fallback was classified as not worth fixing)
  - **Invalid:** 0
  - **Valid but not worth fixing:** 1 (F26: 1/3 vs 1/2 snippet window phrasing, plus F23's upstream-bug fallback sub-item)

## Gates (all run bare after final edits)

| Check | Exit code | Notes |
|---|---:|---|
| `npm run typecheck` | 0 | Clean |
| `npm test` | 0 | 174 passed, 5 skipped (179 files); 4,165 passed, 3 expected fail, 5 skipped |
| `npm run build` | 0 | Dry-run bundle clean (`6922.73 KiB`) |
| `npm run secrets:scan -- --tree` | 0 | Clean across all tracked files |
| Outbound + inbound link/anchor audit | 0 | 0 broken files or anchors across all 8 target docs and 77 inbound repo links |

## Model calls made

| CLI | Resolved Model ID | Effort | Purpose |
|---|---|---|---|
| Antigravity (`agy`) | Gemini 4 Neon (High) | high | Lane `docsroot` authoring, verification, Sol challenge, and fixes |
| `codex` | `gpt-6.2-sol` | high | Read-only review of `git diff origin/main...HEAD` (`SOL-REVIEW.md`) |

## Questions for the owner

All binding rules in `AGENTS.md` were preserved untouched in spirit; the items below look stale or incomplete and are flagged for owner decision rather than edited unilaterally:

1. **Antigravity / Gemini Neon missing from `AGENTS.md` model routing and subscription lists**
   - **Location & exact text:** `AGENTS.md:70-72` (*"subscription CLIs as `hc` children: Claude Code, Codex, Grok, and OpenCode only after its subscription-provider probe"*), `AGENTS.md:76-78` (*"Eval and test models. Claude Sonnet, Codex Terra, and Grok..."*), and `AGENTS.md:153-162` (`## Model routing for repo-work fan-out` table: Codex frontier, Codex workhorse, Claude Fable, Claude Opus, Grok). Meanwhile `AGENTS.md:203` already lists Antigravity for `PreToolUse` hooks, and item 8.13 runs Antigravity Neon lanes.
   - **Recommendation:** Add Antigravity (`agy`) / Gemini Neon to the subscription CLI list and repo-work routing table (or explicitly document when to route work to it).

2. **Codex sandbox `ps` caveat in `AGENTS.md`**
   - **Location & exact text:** `AGENTS.md:125` (*"Re-run `npm test` outside the Codex sandbox before trusting a red suite (it denies `ps`)."*)
   - **Evidence:** `rg --hidden -g '!.git' '\bps\b' test/` shows only one string literal fixture (`"ps aux | grep node"` in `test/case-search-guard.test.mjs:212`); no test currently spawns `ps`.
   - **Recommendation:** Delete this clause unless a Codex-sandboxed `npm test` run still fails for another sandbox reason (in which case name the real blocker).

3. **Retired tracker (`Solo`) and retired sibling repo standing rules in `AGENTS.md`**
   - **Location & exact text:** `AGENTS.md:209-213` (*"Solo, a retired task tracker, is not a live path. Add no `solo://` reference, Solo todo, or Solo scratchpad. Leave Solo references in dated records unchanged."* and *"Never reference a retired sibling repo as a live path. Prior art under `eval/corpus/` is read-only..."*)
   - **Evidence:** `solo://` appears only in historical records (`improvements/`, `ecosystem-skills/PIN-REVIEW.md`, comments in `eval/`).
   - **Recommendation:** Keep the `eval/corpus/` read-only boundary (still load-bearing), and confirm whether the `Solo` prohibition is still needed as a standing rule or can be retired now that Solo is long gone.
