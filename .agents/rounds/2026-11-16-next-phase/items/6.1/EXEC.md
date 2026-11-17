# Item 6.1 execution report

Executor: Claude Sonnet 5.5 (`claude-sonnet-5-5`), high, 2026-11-17. Worktree
`/home/tyler/code/raven-wt/np-6.1`, branch `np/6.1-codemode-0.5.6`, seven commits on `origin/main` `35d5de90`,
not pushed. No stop-rule event. No sub-agent, QA lint, model call, Wrangler or upstream post.

## Commits

| # | Commit | Content |
|---|---|---|
| 1 | `242e5296` | Split v10: `amend-split-v10.mjs`, `QUESTION.md` ("Answer"), `TUNING_ROW_COUNT` 92, TODO held-out block, `items/1.4/dated/` briefs and `PRESTAGE.md` |
| 2 | `d4112b5b` | Pin `@cloudflare/codemode` 0.5.6 (`package.json`, `package-lock.json`) |
| 3 | `8a108a71` | Spec sandbox onto 0.5.6 host-side shaping (`spec-sandbox.ts`, `run.ts`, two test files) |
| 4 | `5480c6be` | cs-012 recurrence and body, cs-001 evidence line, `INDEX.md` |
| 5 | `058ff10b` | `test/script-hints.test.ts:3` comment: "0.5.6, observed 2026-11-17" |
| 6 | `825244fe` | `DECISIONS.md` section and the TODO codemode bullet |

`PLAN.md`, `REVIEW.md`, `briefs/` and this file stay untracked in the item folder for the lead.
`.agents/rounds/2026-11-16-next-phase.md` is not edited; the row is drafted below.

## Steps

### 1. Split v10

- `amend-split-v10.mjs` is `amend-split-v8.mjs` with the v9 inputs: v9 SHA-256 `0b6c9c04…800c`, counts
  91/111/45, exactly-one check, `moveToTuning`, mode 600, `wx` (never overwrites). The note points at
  `items/6.1/QUESTION.md`. I did not open `tmp/6.1/EXPOSURE.md` or any split file.
- `--dry-run` printed, then the real run printed the same:

  ```text
  counts: tuning 92, heldOut 110, reserve 45
  outside tuning with a reverifyBy: 62; earliest 2027-01-14
  v10 SHA-256: fea3d467e0df7b21a3fab7b5e4013d077da789de5aea16188d5bf975063f35e9
  ```

  `~/backups/gca-2026-11-14-split-v10.json` exists, mode 600; `sha256sum` matches.
- **reverifyBy figure (for EXEC only, as planned):** 62 cases outside tuning carry a `reverifyBy`;
  earliest 2027-01-14.
- `TUNING_ROW_COUNT` 91 → 92 in `eval/qa/tuning-rows.mjs`. Every test builds synthetic ids from the
  constant; the three tests that import it pass. No other file asserted 91 (`git grep` for tuning/split
  lines with 91, outside `eval/qa`, `eval/corpus`, `research`, `.agents/rounds`: none).
- `git grep -c "split-v9\|0b6c9c04" -- eval/qa/README.md`: no hit (count 0), nothing to update.
- Pointed at v10 and its SHA-256: `items/1.4/dated/{2.1,2.2a,2.2b,2.2c}-LEAD.md` (one `--split` line each),
  `PRESTAGE.md` (lines 10 and 104).
- TODO held-out block, per reconciliation 6: (a) path, SHA-256 and counts → v10; (b) v9 joins the
  predecessor chain with `0b6c9c04…800c` and 91/111/45; (c) a v10 bullet after v9 naming
  `items/6.1/QUESTION.md` ("Answer") as the authority; (d) the `--split` line → v10. The reverifyBy
  figure is not in the TODO.
- **Timers need no edit.** No unit names a split; `launch-dated-lead.sh` reads each brief from
  `origin/main` at fire time (per the plan and review). They pick up v10 only if PR 6.1 is merged before
  **2026-11-23 18:00 UTC**; otherwise hold until run 2.1 and its follow-ups merge, then rebase. The v10
  file must be copied to the Mac (a Mac copy of any earlier split is stale).

### 2. Pin

- `package.json` `"@cloudflare/codemode": "0.5.6"`, then `npm install`. `npm ls @cloudflare/codemode`:
  one `0.5.6`, `agents@0.28.1` deduped to it.
- **Lockfile package list:** only `node_modules/@cloudflare/codemode` changed (version, resolved URL,
  integrity), plus its own optional peer range `@tanstack/ai` `<1.0.0` → `<2.0.0`, plus the root
  dependency line. `git diff --stat`: `package-lock.json` 10 lines, `package.json` 2. No other package.

### 3. Spec sandbox

- `spec-sandbox.ts`: deleted `CHARS_PER_TOKEN`, `MAX_TOKENS`, `MAX_CHARS`, `TRUNCATION_MARKER`,
  `TRUNCATION_FOOTER_PREFIX`, `MAX_SANDBOX_TRUNCATED_CHARS`, `truncateResponse`, `sandboxResponseText`
  and the in-sandbox `__truncateResponse`. The wrapper ends `return await (${normalized})();`. Header
  rewritten for 0.5.6 and host-side shaping. The generated wrapper otherwise equals 0.5.6
  `createOpenApiSandboxCode` with `includeRequest` false (compared against `dist/mcp.js:213-254`).
- `run.ts`: imports `truncateResult`; `specResponseText` is a copy of 0.5.6 `dist/mcp.js` `responseText`
  (`24_000`, `truncateResult(content, { maxChars })`, string as is, 2-space JSON if it fits else compact,
  `?? "undefined"`), commented with source and version. `createSpecSearchRunner` mirrors the upstream
  handler (reconciliation 2): one `try` around `executor.execute(...)` and `specResponseText(...)`, with
  `catch` returning `{ ok: false, error: e instanceof Error ? e.message : String(e) }`. Doc line fixed.
- `test/spec-sandbox.test.ts` (reconciliation 1): the truncation test, the JSON-stringify test and the
  "host-side truncation helpers" block are gone. Every kept test drops its `as string` cast and
  `JSON.parse` and asserts the raw value (fence `toBe(42)`, `$ref`/circular `toEqual`, lazy cache
  `toBe(true)`, real super spec on the object, and the `resolveSpecRefs` twin comparing objects). New
  test: `not.toContain("__truncateResponse")` plus a raw-object check. 8 tests, all pass.
- `test/smoke/executor.test.ts` (reconciliation 11, spec-search block): existing case also asserts
  `toContain('\n  "services"')`; new cases for an oversized object (≤ 24,000 chars, valid JSON,
  contains `--- TRUNCATED ---`), an oversized string (`startsWith("y"×24,000)` and
  `endsWith("Narrow the request to reduce response size.")`, no ceiling), `async () => 1n` giving
  `ok: false` without rejecting, and a `createExecuteRunner` case for the 0.5.5 gate
  (`async () => { codemode.search("x"); return 1; }` gives `ok: true`, result starts with `1`).
  `codemode.search` is an existing provider call, so I used it as the plan said.
- Mock exports (reconciliation 12): `npm test` raised no missing `truncateResult` export. No mock edited.
- `ARCHITECTURE.md`, `README.md` and `docs/`: `git grep` for `truncateResponse`, `__truncate`,
  `sandboxResponseText`, `0.5.1`, `0.4.2` found nothing, so they are untouched.

### 4. cs-012 by execution on 0.5.6

Scratch test `test/smoke/zz-non-error-throw.test.ts`, rebuilt from `items/5.2/EXEC.md` "Reproduction",
run with the same command, deleted (never committed; `git status` clean of it). Installed
`@cloudflare/codemode` 0.5.6. Console lines:

```text
PACKAGE string: result=undefined error=undefined keys=result,logs
RUNNER string: ok=true result="undefined"
PACKAGE object: result=undefined error=undefined keys=result,logs
RUNNER object: ok=true result="undefined"
RUNNER null: ok=false error=Cannot read properties of null (reading 'message')
PACKAGE null: rejected: TypeError: Cannot read properties of null (reading 'message')
Tests 5 passed (5)
```

Identical to the 0.5.1 run. Improvements edits: a dated `recurrences` entry (2026-11-17, still reproduces on
0.5.6; #2898 "opened by a bot … bot activity only and no human maintainer"; status stays
`reported-upstream`); body now says "0.5.1 and 0.5.6 were both executed"; the table lead-in says "again
unchanged on 0.5.6". The frontmatter "Read, not executed … 0.5.6" line is left as dated history
(reconciliation 10). No upstream comment (skill rule 6). `improvements:index` regenerated `INDEX.md` (one
line); `improvements:lint -- --live`: `improvements lint ok (93 findings, live intake checked)`.

### 5. cs-001

No recurrence entry. One evidence line: on 2026-11-17 the 0.5.6 `dist/index.js` search region is
byte-identical to 0.5.1's (0.5.1 lines 1282–1394, 0.5.6 lines 1291–1403, extracted by region markers; SHA-256 `a7daa25f312b2e6be4179c508b47fef7e1dc1c4915e97752304632933d410255`) and the rule is at
line 1328. The vendored scorer is unchanged. Index and live lint rerun together with step 4 (above).

### 6. Script-hints comment

`npm run test:smoke` passed on 0.5.6 without edits, so only `test/script-hints.test.ts:3` changed
("0.5.6, observed 2026-11-17"). `src/executor/script-hints.ts` has no version text. No logic changed.

### 7. Records

`DECISIONS.md` gains "Follow-up answers (2026-11-17, assumptions review)" between the 2026-11-17 section
and "Timing": the three owner answers quoted short, mapped RWA → 6.3, Docs titles → 6.2, codemode → 6.1,
with the Fable assessment named as the source of the proposals. TODO bullet: deleted "Raven stays on
0.5.1", the spec-sandbox paragraph and "An upgrade past 0.5.1 also re-checks"; kept "has an ungated copy of
the same rule" with "through 0.5.4" → "through 0.5.6"; `cs-012` stays a live bullet (no local workaround,
the #2898 fix makes a non-Error throw `ok: false` with `String(err)`, which is model-facing when it ships,
reserved names `String`, `Object`, `Proxy`, `JSON`, `Math`, `Uint8Array`, `ArrayBuffer`, `btoa`, `atob`
collide with none of Raven's, re-run the 5.2 scratch test and retire under the skill); the done criterion
is kept.

## Gates (each bare, one at a time)

| Gate | Result |
|---|---|
| `npm run typegen` | Needed first: `env.d.ts` is gitignored and absent in this worktree, so `typecheck` printed 77 `Env` errors before it. Not a code issue. |
| `npm run typecheck` | exit 0 (run twice, last on the final head) |
| `npm test` | exit 0 (twice): 168 files passed, 5 skipped; 3744 tests passed, 3 expected fail, 5 skipped |
| `npm run build` | exit 0 (wrangler dry run, bindings listed). I piped this one to `tail` and took the exit from `PIPESTATUS`, against the "run bare" rule; the status is the real one. |
| `npm run test:smoke` | exit 0: 9 files, 149 tests passed, first try, no retry |
| `npm run eval:selftest` | exit 0: "self-test: all checks passed" (gate evidence resolves from committed files) |
| `npm run improvements:index` | no diff after the commit |
| `npm run improvements:lint -- --live` | exit 0, 93 findings |
| `npm run secrets:scan -- --tree` | exit 0, clean over all tracked files |
| Routing gate | Not run. `git diff origin/main --name-only` touches nothing under `src/catalog/`, `catalog/`, `specs/`, `eval/*.json` or `src/mcp/` |
| QA lint, register check | Not run (left to CI). No model-calling command run. |

## Surface hashes (`npm run -s mcp:surface -- --json`)

| | `surfaceSha256` | `instructionsSha256` |
|---|---|---|
| Before (after commit 1, before the pin; `src/` equals `origin/main`) | `815333b74671dec3a7919333a9960392fd9a39d12efbcaa148b447995de2bd07` | `67a6bd0b57da385b412a5dc47dc3de3b8ae65f4b39e3a862cb53deec659c6c00` |
| After (final head) | `815333b74671dec3a7919333a9960392fd9a39d12efbcaa148b447995de2bd07` | `67a6bd0b57da385b412a5dc47dc3de3b8ae65f4b39e3a862cb53deec659c6c00` |

Identical, and the same pair item 3.5 recorded. The diff touches no `src/mcp/` file.

## Vendored files against the 0.5.6 dist, and the re-vendor checklist

Method: `esbuild` strips types from each vendored file; both sides are compared with comments,
whitespace, braces and semicolons removed. The `json-schema-types`, `run-code`, `resolve`, `shared` and
`base` chunks have equal SHA-256 in 0.5.1 and 0.5.6 (first 16 hex: `53cd10cf586be5c7`, `d8bc6e4cbff85c58`,
`b45065a17ac6f7d2`, `be571130c566302f`, `9d63e77ada939ce5`), and the search region of `dist/index.js`
(0.5.6 lines 1291–1403; 0.5.1 lines 1282–1394, extracted by region markers) is byte-identical (SHA-256 `a7daa25f312b2e6be4179c508b47fef7e1dc1c4915e97752304632933d410255`).

- `src/catalog/vendor/json-schema-types.ts` vs `dist/json-schema-types-D_m9tVnI.js`: the shared functions
  are token-identical. Not vendored: `normalizeCode`/`stripCodeFences` (in `normalize.ts`),
  `extractJsonSchemaDescriptions` and `generateTypesFromJsonSchema`. No other difference.
- `src/catalog/vendor/normalize.ts` vs the same chunk: identical except `stripCodeFences` returns
  `match?.[1] ?? code` where upstream has `match ? match[1] : code`. Same result (group 1 always
  participates; an empty capture is not nullish). The header's "TypeScript annotations added; no behavior
  changes" does not name it, but it is behavior-neutral.
- `src/catalog/vendor/search-scoring.ts` vs the `connectors/search.ts` region: differences are the
  documented adaptations (field names `path`/`connector`/`method`/`description` → `id`/`service`/`name`/
  `description`, the extra `kind` field at weight 2, `scoreEntry` instead of `scoreMatch`, no
  `searchConnectors`/`SEARCH_RESULT_LIMIT`, `0.6` vs `.6`). **One difference is undocumented:**
  `normalizeSearchText` splits on `/[_./:#-]+/` where upstream has `/[_./:-]+/`, so `#` is a separator in
  Raven only. It has been there since the initial snapshot; the header says scoring math is "unchanged".
  I changed nothing. Lead: add a line to the report's deviations table (and the vendor header) or decide
  otherwise.

Re-vendor checklist (`src/catalog/scoring.ts:448-463`), 0.5.1 → 0.5.6:

1. Field weights, tokenization, normalization: unchanged (byte-identical search region). Only the `#`
   difference above, which predates this item.
2. Coverage-gate semantics: unchanged (same region); `search.ts`'s tier-2 rationale stands.
3. Returned search shape `{ results, total, truncated }`: unchanged.
4. Newly exported search helpers: none. The 0.5.6 root export list (`dist/index.js:2036`) still has no
   `searchConnectors`.
5. Type-gen changes: the 0.5.4 output-type work (`.default()`, `.pipe()`, `.transform()`) is in
   `dist/ai.js` (`safeOutputSchemaToTs`, `standardOutputJsonSchema`); the `json-schema-types` chunk Raven
   vendors is byte-identical, so `renderSignature` and output compaction are unaffected.
6. New native docs/snippet/section weighting: none in the search region (`snippet` items exist only in
   `searchConnectors`, which Raven does not call).

## Deviations from the plan

1. `npm run typegen` was run before `typecheck` (generated, gitignored `env.d.ts`); not in the plan.
2. `npm run build` was piped (see Gates).
3. Search-rule slips, none of which printed corpus content: one `git grep -n "91"` named
   `eval/qa/tuning-rows.d.mts`, and one `git grep -nE "TUNING_ROW_COUNT|91" -- 'eval/qa/*.mjs' …` piped to
   `grep -w 91`; both printed nothing. A first `git grep` over `eval/qa/tuning-rows.mjs` and `test` printed
   130 KB of `test/` lines (saved to a tool-result file, none from `eval/qa` other than `tuning-rows.mjs`).
4. Commit 5 is its own commit (script-hints), so there are six commits, not five.
5. The "before" surface hash was taken in the worktree after commit 1, not a clean `origin/main`
   checkout. `src/` is identical to `origin/main` at that point, so the value is the same.

## Ledger row draft (`.agents/rounds/2026-11-16-next-phase.md`)

| 6.1 `@cloudflare/codemode` 0.5.1 → 0.5.6 (owner follow-up) | Claude Opus 5.5, agentpc `t1v5` (executor Claude Sonnet 5.5) | PR number pending. **Merge before 2026-11-23 18:00 UTC** so the dated timers read v10 from `origin/main`; if that is missed, hold the merge until 2.1 and its follow-ups have merged, then rebase. Copy v10 to the Mac. Deploy on the Mac after merge (Worker bytes change). | Exact pin 0.5.6, lockfile changes only the codemode entry and its `@tanstack/ai` peer range. `spec-sandbox` moved onto 0.5.6 host-side shaping: sandbox truncation constants and helpers deleted, wrapper returns the raw value, `createSpecSearchRunner` uses a copy of upstream `responseText` with `truncateResult` (24,000 chars, structural) and returns `ok: false` on a serialization failure; the runner is not a registered tool. 0.5.5 gate needs no Raven change (smoke case added). cs-012 re-executed on 0.5.6, unchanged (recurrence added; #2898 open, bot activity only); cs-001 rule byte-identical (evidence line). Not model-facing: `mcp:surface` `815333b7…bd07` / `67a6bd0b…6c00` before and after; no `src/mcp/`, `src/catalog/`, `catalog/`, `specs/` or `eval/*.json` in the diff; routing gate not run; USD 0. Split v10: one case seen by the lead moved to tuning (orchestrator answer, `QUESTION.md`), 92/110/45, SHA-256 `fea3d467…35e9`, 62 outside-tuning cases carry a `reverifyBy` (earliest 2027-01-14); `TUNING_ROW_COUNT` 92. Gates: typecheck, `npm test` (3744 passed), build, `test:smoke` (149 passed), `eval:selftest`, `improvements:lint -- --live` (93), secrets scan, all exit 0. Open for the lead: the Codex frontier review of the diff, the `#` separator note, the deviations table and the 0.5.2 (not 0.5.3) correction in REPORT.md. |

## Codex reconciliation

Review: `CODEX-REVIEW.md` (Codex frontier `gpt-6-astra`, high, verdict FAIL on finding 1). One new commit,
`04ee2278` (no history rewrite), makes the code and wording changes below; this section and the line-range
edits in this file are untracked like the rest of the item folder.

1. **Codex 1 (should-fix): adopted.** `amend-split-v10.mjs` now maps every imported `AmendError` to
   `LINES.amend` ("check failed: the amendment library refused the move (message withheld)"); only the
   local `RunnerError` messages print as written. `node --check` passes. The script was not run again (v10
   exists and it refuses to overwrite).
2. **Codex 2 (low): adopted.** The smoke case is now "execute runner: unawaited provider call (codemode
   0.5.5 compatibility)" / "an unawaited provider call does not break the run", and asserts
   `outcome.result.split("\n")[0]` is exactly `"1"` (a footer may follow the value, so no whole-string
   equality). It claims no gate-release regression coverage.
3. **Codex 3 (low): adopted.** The two places that cited the search region (the cs-001 step and the vendored
   files section above) now read 0.5.1 lines 1282–1394 and 0.5.6 lines 1291–1403, extracted by region
   markers, SHA-256 `a7daa25f312b2e6be4179c508b47fef7e1dc1c4915e97752304632933d410255`. The committed
   cs-001 evidence line cites no line range, so it needs no edit.
4. **Codex 4 to 8 (info): no change.** Recorded as findings that need no fix. Finding 4's qualification is
   kept: unawaited provider work still runs host-side, and its ledger and summary timing is a race, not
   an atomic guarantee, so identical timing across versions is not claimed. Finding 6: the surface hashes
   alone do not prove runtime equivalence of the gate's lifecycle change.
5. **Lead note A: adopted.** `.agents/TODO.md` reads "`cs-012` (…): through 0.5.6, …" (wording only).
6. **Lead note B: adopted.** `src/catalog/vendor/search-scoring.ts` header gains a comment that
   `normalizeSearchText` also splits on `#` (upstream `/[_./:-]+/`, Raven `/[_./:#-]+/`), present since the
   initial snapshot. Comment only.

Gates after the commit, run one at a time: `npm run typecheck` exit 0; `npm test` exit 0 (168 files passed,
5 skipped; 3744 passed, 3 expected fail, 5 skipped); `npm run test:smoke` exit 0 (9 files, 149 passed);
`npm run build` exit 0; `npm run secrets:scan -- --tree` exit 0 (clean); `npm run -s mcp:surface -- --json`
unchanged: `815333b74671dec3a7919333a9960392fd9a39d12efbcaa148b447995de2bd07` /
`67a6bd0b57da385b412a5dc47dc3de3b8ae65f4b39e3a862cb53deec659c6c00`. I filtered the output of `npm test`,
`test:smoke`, `build` and the scan through `grep`/`tail` for length and read each exit status from
`PIPESTATUS` or `$?`; that departs from "run bare" in form only.
