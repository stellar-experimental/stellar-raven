# Item 8.9, lane `live` — Report

- **Branch**: `np/8.9-live`
- **PR**: https://github.com/stellar-experimental/stellar-raven/pull/500
- **TODO item closed**: `Repair the \`test/live/\` suites against current code` (`.agents/TODO.md`, lines 1009–1024; left untouched by this lane for the orchestrator to update on merge)
- **Worker bytes changed**: **No** (`git diff origin/main -- src/ package.json package-lock.json wrangler.jsonc` is empty). No product defect was found in `src/`; no `npm run test:smoke` or deploy is required.

## What changed

All four failing checks across `test/live/run-live-execute.mjs` and `test/live/run-live-spec-search.mjs` were traced to deliberate, documented contract changes in the current server — none exposed a defect in `src/`:

1. **`test/live/run-live-execute.mjs` (`initialize` check)**
   - **Cause**: Checked `instructions.includes("r.data.projects")`. Commit `e3d0cd55` (#430) intentionally moved the payload-access example out of `BASE_SERVER_INSTRUCTIONS` into `EXECUTE_DESCRIPTION` to keep `SERVER_INSTRUCTIONS` under Grok CLI's 2,033-char cut (`src/mcp/tools.ts:174-193`, guarded by `test/mcp-instructions.test.ts:41-44,225-233`).
   - **Fix**: Verified `initRes.ok` and updated the check to assert the envelope contract carried by `SERVER_INSTRUCTIONS` (`{ ok: true, data, asOf, asOfBasis, caveat? }` and `{ ok: false, error: { kind, message, hint? } }`).
2. **`test/live/run-live-execute.mjs` (case 6)**
   - **Cause**: Split the result only on `"\n--- console"`. `src/executor/run.ts:553-632` and `src/mcp/tools.ts:516` now append host blocks (`--- SOURCE METADATA ---`, corroboration guidance, `--- EVIDENCE CHECKPOINT ---`) immediately after the compact JSON result and before `--- console`, causing `JSON.parse` to fail at line 2.
   - **Fix**: Cut the compact single-line JSON body at the first newline (`text.indexOf("\n")`), added upstream preconditions (`out.raw?.ok`, `out.viaData !== null`, `out.spOk`) so upstream failures do not blame the envelope guard, and asserted `errGuardIsUndefined`, `okGuard` (`use r.data.projects`), `metaGuard` (`use r.data.meta`), and `writeBack === viaData` directly on the parsed object.
3. **`test/live/run-live-execute.mjs` (cases 8 & 9)**
   - **Cause**: Targeted `skills.stellar-dev.standards`, whose pinned `SKILL.md` shrank upstream to 8,380 chars (~2,095 tokens), well below `src/skills/store.ts`'s `NOTICE_THRESHOLD_TOKENS` (5,000 tokens ≈ 20,000 chars). Because `r.data.notice` was rightly `undefined`, the test script's own `r.data.notice.slice(0, 140)` threw `TypeError`.
   - **Fix**: Switched cases 8 and 9 to `skills.stellar-light.stellar-scout` (34,660 chars, 16 sections — the oversized skill in the pinned catalog, matching `test/skills.test.ts`), and guarded `r.data.notice?.slice(0, 140) ?? null` so a future size drop reports a structured assertion failure instead of throwing.
4. **`test/live/run-live-spec-search.mjs` (case 4)**
   - **Cause**: Expected the raw `truncateForModel` footer (`--- TRUNCATED ---`, `tokens (limit: 6000)`). `src/executor/run.ts:629-632` replaces that footer with `--- SOURCE BASIS ---` (`ARCHITECTURE.md:162`, guarded by `test/smoke/executor.test.ts:155-156`).
   - **Fix**: Added an optional per-case `check` hook to the spec-search runner, updated case 4 to expect `--- SOURCE BASIS ---`, `Bulk lost from top-level keys:`, and `guidance: prefer a narrower re-run`, forbade `--- TRUNCATED ---`, and verified the visible prefix is clipped within 24,000 chars (default `EXECUTE_MODEL_BOUNDARY_MAX_TOKENS` 6000 × 4 chars/token). Also removed an unused `parseRpc` import.

## Gates (final pass after review fixes)

All commands were run bare from `/home/tyler/code/raven-wt/np-8.9-live`. The local `wrangler dev --host localhost --port 8791` server was started for the live runs and stopped afterwards.

| Gate | Exit | Result |
|---|---|---|
| `node test/live/run-live-execute.mjs --base-url http://localhost:8791` | `0` | Pass (`initialize` + 9/9 cases) |
| `node test/live/run-live-spec-search.mjs --base-url http://localhost:8791` | `0` | Pass (5/5 cases) |
| `npm run typecheck` | `0` | Pass (`tsc --noEmit`) |
| `npm test` | `0` | Pass (177 passed, 5 skipped / 182 files; 4296 passed, 3 expected fail, 5 skipped / 4304 tests; includes `test/live-cases.test.mjs` 20/20) |
| `npm run build` | `0` | Pass (`prebuild` + `wrangler deploy --dry-run --outdir dist`) |
| `npm run secrets:scan -- --tree` | `0` | Clean (all tracked files) |

## Independent review and reconciliation

- **Reviewer**: Claude Opus 5.5 (`claude-opus-5-5`, high effort, via Antigravity CLI `agy`), different model family from the author (Gemini 4 Neon).
- **Artifact**: `.agents/rounds/2026-11-16-next-phase/items/8.9/live/REVIEW.md` (JSON `status: "SUCCESS"`).
- **Verdict**: No blocking or major findings; 2 minor findings and 4 nits.
- **Reconciliation**:
  - **Minor 1 (accepted)**: Replaced the hand-maintained host-block header regex in case 6 with cutting at the first `\n`, since `execute` emits compact single-line JSON.
  - **Minor 2 (accepted)**: Returned `spOk: sp.ok` in case 6 and added upstream preconditions for both `lumenloop.search_directory` and `scout.searchProjects` before asserting the envelope guards.
  - **Nit 1 (accepted)**: Added an inline comment explaining `24000` (`EXECUTE_MODEL_BOUNDARY_MAX_TOKENS` 6000 in `wrangler.jsonc` × `CHARS_PER_TOKEN` 4).
  - **Nit 2 (accepted)**: Relaxed `'Bulk lost from top-level keys: "paths"'` to `'Bulk lost from top-level keys:'` so the check does not depend on `"paths"` staying the largest truncated key.
  - **Nit 3 (declined)**: Matching the exact envelope shape strings in `initialize` is intentional; they are the contract (`test/mcp-instructions.test.ts` pins the same shapes).
  - **Nit 4 (declined)**: Adding deeper assertions to execute cases 1–3 is out of scope for this lane (those checks already passed and predate this lane).

## Model calls made

| CLI | Model ID | Purpose |
|---|---|---|
| `agy` (Antigravity subscription) | `claude-opus-5-5` (high effort) | Mandatory independent code review (`REVIEW.md`, 1 turn, `status: "SUCCESS"`) |

No AI Gateway, Workers AI, or provider-API calls were made.

## Open questions

None. After merging PR #500, the orchestrator can close `Repair the \`test/live/\` suites against current code` in `.agents/TODO.md`.
