# Item 6.1 plan: `@cloudflare/codemode` 0.5.1 to 0.5.6

Lead: Claude Opus 5.5, agentpc `t1v5`, 2026-11-17. Worktree `/home/tyler/code/raven-wt/np-6.1`,
branch `np/6.1-codemode-0.5.6` from `origin/main` `35d5de90`. Binding notes:
`/home/tyler/code/raven-wt/orch/6-COMMON.md` and `6.1-NOTE.md`.

## Decision this changes

Raven moves from codemode 0.5.1 to 0.5.6, with one PR. Before this item, no record called staying on
0.5.1 a deliberate deviation from upstream; the TODO only listed what an upgrade would cost. After
this item, Raven runs the current upstream executor. The one module that copied 0.5.1 code is moved
onto the upstream behavior, and each remaining deviation from upstream has a stated reason.

## What changed upstream (lead's read, 2026-11-17)

Sources: `npm pack` of 0.5.1 and 0.5.6, with each `dist/` diffed, and
`packages/codemode/CHANGELOG.md` on `cloudflare/agents` `main`.

| Version | Change | Touches Raven? |
|---|---|---|
| 0.5.2 (#2224) | `truncateResult` truncates structurally: it shrinks the largest values first and returns valid JSON of the same shape. `codeMcpServer`/`openApiMcpServer` drop the in-sandbox `__truncateResponse` and shape output host-side with `responseText` (24,000 chars, pretty-printed if it fits, otherwise compact). `createCodeTool` gains `toModelOutput`. | **Yes**, through `src/executor/spec-sandbox.ts`, which copies the 0.5.1 `mcp.js` truncation. `toModelOutput` and `createCodeTool`: no (Raven does not use the AI SDK tool). |
| 0.5.3 (#2428) | Standard Schema `types` metadata on the Code Mode tool. | No |
| 0.5.4 (#2472) | `ToolSetConnector` forwards output schemas. | No (Raven uses no connectors) |
| 0.5.5 (#2614) | `ExecutionGate`: once `execute()` settles, any tool call still pending (or that arrives later) is released with a "late" error, so an unawaited call no longer holds a Dynamic Worker concurrency slot. The host-side work still runs. | **Yes, automatically.** `DynamicWorkerExecutor.execute(code, providers)` wraps every provider fn, and Raven's `execute` passes provider fns. No Raven code change. |
| 0.5.6 (#2766) | `@tanstack/ai` 1.x allowed in the optional peer range. | No |

Facts re-checked for this item:

- Raven imports only `DynamicWorkerExecutor` from the package (`src/executor/run.ts:19`).
  Several unit tests mock it.
- These chunks are byte-identical between 0.5.1 and 0.5.6: `json-schema-types` (holds
  `normalizeCode` and type generation), `run-code`, `resolve`, `shared` and `base`, and the
  `src/connectors/search.ts` region of `dist/index.js`. The `ToolDispatcher` source is unchanged.
- **cs-001** (#2296): the reverse short-token prefix rule is unchanged in 0.5.6 `dist/index.js:1328`
  and on `main` (`search.ts:68`). #2296 is still open with no comments. The vendored scorer
  therefore stays unchanged, and no routing gate run is needed: neither scoring nor catalog
  output changes.
- **cs-012** (#2897): the catch block is unchanged in 0.5.6 (`error: err.message`). A
  `github-actions` bot opened fix PR cloudflare/agents#2898 on 2026-11-17. It is open and not
  merged.
- Peer and dependency ranges: 0.5.6 needs `acorn ^8.17` (Raven has 8.18), and its optional peers
  are `@modelcontextprotocol/sdk ^1.25` (Raven has 1.32.1), `ai ^6 || ^7` and `zod ^4`. `agents`
  0.28.1 needs `@cloudflare/codemode >=0.5.0`, so it dedupes to 0.5.6. No other package changes.
- `createSpecSearchRunner` (the only consumer of the spec-sandbox truncation) is not registered as
  a production tool (ADR-0001). It is reached only by the smoke test and by A/B callers.

## Steps

The order matters. Each numbered step is one commit unless noted. The executor uses `git grep ... --
':!eval/qa' ':!eval/corpus'` for every repo-wide search, never a bare `grep -r` over the repo
(orchestrator rule of 2026-11-17).

1. **Split v10 (orchestrator answer to [QUESTION.md](QUESTION.md), option (a)), in its own commit.**
   Add `items/6.1/amend-split-v10.mjs`, a copy of `items/5.1/amend-split-v8.mjs` adapted the same way
   `items/5.2/amend-split-v9.mjs` adapted its predecessor. It verifies the v9 SHA-256
   `0b6c9c04b59f5f49225df4c054df0a1117bfb8f179660147dde14887515c800c` and the v9 counts
   (91 / 111 / 45). It reads `tmp/6.1/EXPOSURE.md` (untracked) and requires exactly one id outside
   v9 tuning. It moves that id with `moveToTuning` and a dated note, then writes
   `~/backups/gca-2026-11-14-split-v10.json` with mode 600, never overwriting. It prints only
   the counts and the SHA-256, never an id or note text. Run it once with `--dry-run`, then for
   real. Then:
   - `eval/qa/tuning-rows.mjs` `TUNING_ROW_COUNT` 91 → 92, and every test or document that asserts 91
     (`git grep -n "91" -- eval/qa/tuning-rows.mjs test` and the `--split`/count lines found next).
   - Point `items/1.4/dated/{2.1,2.2a,2.2b,2.2c}-LEAD.md` and `PRESTAGE.md` at v10 and its SHA-256.
   - Update the `.agents/TODO.md` held-out status block (lines 40–55: path, SHA-256, counts,
     `--split` line). Recompute its "outside tuning with a `reverifyBy`" figure with the script's
     counts-only output, as in 5.2.
   - The timers need no edit: `launch-dated-lead.sh` reads each brief from `origin/main` at fire
     time. Record that in EXEC.md.
2. **Upgrade the pin.** `package.json` `"@cloudflare/codemode": "0.5.6"` (exact pin, as now), then
   `npm install`, so only the lockfile entries for codemode change. Confirm with
   `npm ls @cloudflare/codemode` (one deduped 0.5.6) and `git diff --stat package-lock.json`.
   Touch nothing else.
3. **Move `spec-sandbox` onto the upstream behavior** (`src/executor/spec-sandbox.ts`,
   `src/executor/run.ts`, `test/spec-sandbox.test.ts`, `test/smoke/executor.test.ts`).
   - `spec-sandbox.ts`: delete `CHARS_PER_TOKEN`, `MAX_TOKENS`, `MAX_CHARS`, `TRUNCATION_MARKER`,
     `TRUNCATION_FOOTER_PREFIX`, `MAX_SANDBOX_TRUNCATED_CHARS`, `truncateResponse` and
     `sandboxResponseText`. In the generated wrapper, delete `__truncateResponse` and end with
     `return await (${normalized})();`, as 0.5.6 `mcp.js` does. The rest of the wrapper is unchanged:
     the spec stays inline, and `__resolveRefs`, `__resolvedSpec` and `codemode.spec` stay.
     Rewrite the header so it says the module mirrors 0.5.6 `openApiMcpServer`
     (`createOpenApiSandboxCode`) and that output shaping is host-side in `run.ts`. The module stays
     pure and Node-importable.
   - `run.ts`: `import { DynamicWorkerExecutor, truncateResult } from "@cloudflare/codemode";`, plus a
     module-private `specResponseText(content)` that mirrors 0.5.6 `dist/mcp.js` `responseText`
     line for line: the constant `24_000`; `truncateResult(content, { maxChars })`; return a string
     as is; otherwise use 2-space JSON if it fits, else compact JSON, with `?? "undefined"`. A
     comment names the source file and version, and says the function is copied because upstream
     does not export it. `createSpecSearchRunner` returns `specResponseText(outcome.result)`. Fix the
     `run.ts:671` doc line.
   - `test/spec-sandbox.test.ts`: delete the in-sandbox truncation test, the "JSON-stringifies
     non-string results" test and the "host-side truncation helpers" block. Add one test that the
     wrapper returns the script's raw value (an object stays an object) and that the generated
     source has no `__truncateResponse`. Update the header. Keep the `$ref`, circular, lazy-cache,
     fence, `</` and real-spec tests.
   - `test/smoke/executor.test.ts`, in the spec-search block: add one oversized case. A script
     returns an object about 40,000 chars long. Assert that `outcome.result` is at most 24,000 chars,
     parses as JSON, and contains `--- TRUNCATED ---`, which shows the structural path. Add one more
     case: a returned string longer than 24,000 chars ends with the `truncateResponse` footer
     `Narrow the request to reduce response size.`
4. **Re-check cs-012 by execution on 0.5.6.** Re-create item 5.2's scratch test from
   `items/5.2/EXEC.md` "Reproduction" as `test/smoke/zz-non-error-throw.test.ts`. Run it with the
   same command, record the console lines in EXEC.md, and delete it. It never enters a commit.
   Expected: unchanged (string and object give `error` undefined, the runner says `ok: true`;
   `throw null` rejects). Then, under the `improvements-pipeline` skill: add a dated `recurrences`
   entry (still reproduces on 0.5.6; upstream fix PR #2898 open, not merged), keep the status
   `reported-upstream`, make the body's "Only 0.5.1 was executed" accurate, run
   `npm run improvements:index`, and run `npm run improvements:lint`. Do not comment upstream:
   #2898 has had no maintainer activity, so skill rule 6 says stay silent.
5. **Re-check cs-001.** Add no recurrence entry; the last one is from 2026-11-09 and the rule did
   not change. Add one evidence line: on 2026-11-17 the 0.5.6 `dist/index.js` search region is
   byte-identical to 0.5.1, and the rule is at line 1328. Leave the vendored scorer unchanged. Run
   `improvements:index` and `improvements:lint` again with step 4's changes if they share a commit.
6. **Script-hint comments.** `test/script-hints.test.ts:3` and `src/executor/script-hints.ts`
   describe error message forms "observed" on 0.5.1. If `npm run test:smoke` passes on 0.5.6
   without edits, change the version in those comments to 0.5.6. Change no logic.
7. **Records.**
   - `DECISIONS.md`: a new section "Follow-up answers (2026-11-17, assumptions review)" after
     "Follow-up answers (2026-11-17)". It quotes the three owner answers from 6-COMMON.md in a short
     form, says which item carries each (6.1, 6.2, 6.3), and names the Fable assessment as the
     source of the proposals.
   - `.agents/TODO.md` "Re-check the upstream codemode short-token repair": delete "Raven stays on
     0.5.1", the spec-sandbox paragraph (done) and "An upgrade past 0.5.1 also re-checks". Keep the
     cs-001 paragraph ("reproduces through 0.5.6") and the done criterion. Keep cs-012 as a live
     bullet: Raven logs a non-Error throw as `ok: true` until #2898 (or a fix like it) ships; then
     re-run the 5.2 scratch test and retire it under the skill.
   - Ledger row for 6.1 in `.agents/rounds/2026-11-16-next-phase.md` (the lead adds it at verify; the
     executor drafts it in EXEC.md).

The lead writes the remaining-deviations list (section below) into REPORT.md. The executor does
not edit `ARCHITECTURE.md` unless a gate or grep shows that it describes spec-sandbox truncation.
The lead's grep found no such mention.

## Remaining deviations from upstream codemode (mirror-upstream rule)

| Deviation | Reason |
|---|---|
| Vendored scorer, `normalizeCode` and JSON-schema types from 0.4.2 (`src/catalog/vendor/*`), plus the ungated tier-2 replica | Upstream exports neither `searchConnectors` scoring nor a Node-safe entry. Raven searches its own catalog host-side (ADR-0001 and ADR-0009). The executor diffs each vendored file against the 0.5.6 dist and reports any difference beyond the documented adaptations. |
| Execute model-boundary truncation (`src/policy/truncate.ts`) slices text and adds the SOURCE BASIS footer and artifact storage; upstream's `truncateResult` truncates structurally | Raven's footer, artifact and 6,000-token contract (item 3.4) is model-facing, and the module must import under plain Node. Adopting structural truncation would change what the model sees, so it is a **proposal** for its own measurement, not part of this PR. |
| `resolveSpecRefs` host-side twin for `execute`'s `codemode.spec()` | Injecting the spec into the sandbox would shadow Raven's `codemode` provider global. The result is the same document. |
| `specResponseText` in `run.ts` copies upstream's private `responseText` | Upstream does not export it. It is a line-for-line copy and uses the exported `truncateResult`. |
| `classifyExecuteError` derives `errorName` from the message | `DynamicWorkerExecutor` drops `err.name` (item 3.2). |

## Gates

Run each one bare, in the worktree:

- `npm run typecheck`, `npm test`, `npm run build`, `npm run test:smoke` (the item touches
  `src/executor`).
- `npm run improvements:index` (no diff after the commit) and `npm run improvements:lint`.
- `npm run secrets:scan -- --tree`.
- Routing gate: not run. Scoring and catalog output do not change. As proof, `npm test` includes
  the gates fingerprint, and `git diff origin/main --stat` must touch no file under
  `src/catalog/`, `catalog/` or `specs/`. If either check fails, run
  `node eval/run-routing.mjs --gate` as eval/README.md directs and stop if it regresses.
- The executor runs no QA lint and no model-calling eval.

## Model-facing check

Not model-facing, so no Sonnet spot check and USD 0:

- The production `search` (host-ranked catalog) is unchanged.
- The `execute` output path (`truncateForModel`, footers and error text from `err.message`) is
  unchanged.
- The tool descriptions and types text are Raven's own and do not change.
- The 0.5.5 late-call error can reach only sandbox code that keeps running after the script has
  returned, and its logs are not returned.
- `createSpecSearchRunner` output does change shape (structural truncation), but that runner is not
  exposed.

The executor confirms that `src/mcp/` and the tool-description sources do not appear in the diff.
If anything model-facing does change, it stops and reports.

## Stop rule

The executor stops and reports to the lead in these cases:

- The upgrade needs an API or design change beyond what this plan lists.
- `test:smoke` fails in a way the upstream diff does not explain.
- Typecheck fails on a 0.5.6 type change that needs more than an import edit.
- The `amend-split-v10` script fails any check.
- The lockfile changes any package other than `@cloudflare/codemode`.
- The routing gate is triggered and regresses.

The executor never tries a second design without the lead.

## Risks

- **0.5.5 gate and Raven's op ledger.** Host-side work from an unawaited provider call still runs
  after `execute` returns, as before. Whether a late call reaches the ledger before the summary
  is computed is unchanged; the gate only changes what the sandbox sees.
- **Lockfile churn.** If `npm install` re-resolves other ranges, revert and use
  `npm install @cloudflare/codemode@0.5.6 --save-exact`. As a last resort, edit only the codemode
  lock entries with npm, never by hand.
- **Smoke-lane flake.** Smoke runs real workerd. One retry is allowed. Report the first failure.
- **Held-out integrity.** Step 1 handles exactly one case, chosen by script. The executor gets the
  exposure note path, never the id in prose.

## Reviews

- Fable plan review (this step) → `REVIEW.md`.
- After execution: **Codex frontier** (`gpt-6-astra`, high) reviews the diff. The change touches the
  sandbox execution path (`src/executor`), which is security-boundary routing under AGENTS.md
  ("Codex frontier: … security review"). Its scope: confirm that `globalOutbound: null` and the
  provider passing are untouched; confirm that `specResponseText` matches upstream; and
  re-derive the "not model-facing" claim. Findings go to `tmp/6.1/CODEX-REVIEW.md` and are copied
  into the item folder.
- The improvements-pipeline skill requires a distinct reviewer only to retire a finding. No
  finding is retired here.

## From the orchestrator or owner

- Split v10 is approved (option (a)). Nothing else is needed before the PR.
- The deploy runs on the Mac after merge, because the Worker bytes change. The report proposes
  structural execute truncation as a separate measured item.
- `npm outdated` (lead, 2026-11-17) goes into the report with a one-line recommendation for each
  package. Nothing else is upgraded here.

## Review reconciliation (Fable, [REVIEW.md](REVIEW.md))

All 15 findings are adopted. Where this section and the steps above differ, this section binds.

1. **Blocking, adopted.** In step 3, every kept test that evaluates the wrapper drops its
   `as string` cast and its `JSON.parse`, and asserts the raw value: fence `toBe(42)`, `$ref` and
   circular `toEqual`/property checks on the object, lazy cache `toBe(true)`, the real super spec on
   the object, and the `resolveSpecRefs` twin test (`:190-197`) comparing objects. The new test
   keeps only the `not.toContain("__truncateResponse")` source assertion and a raw-object check if
   no other test covers one.
2. **Adopted.** `createSpecSearchRunner` mirrors the upstream handler, not only the helper: one
   `try`/`catch` around `executor.execute(...)` and `specResponseText(...)` returns
   `{ ok: false, error: e instanceof Error ? e.message : String(e) }`. New smoke case:
   `async () => 1n` gives `ok: false` and does not reject.
3. **Adopted.** In Gates, `npm test` does not run the gates fingerprint. Run
   `npm run eval:selftest` (also the `eval/` gate, since step 1 edits `eval/qa/tuning-rows.mjs`).
   The path check widens: the diff touches nothing under `src/catalog/`, `catalog/`, `specs/` or
   `eval/*.json`. The other `eval/` gates (QA lint, register check) are left to CI under 6-COMMON.md.
4. **Adopted.** Step 4 and Gates run `npm run improvements:lint -- --live`.
5. **Adopted.** Merge window: merge before 2026-11-23 18:00 UTC (first dated timer). If that is
   missed, hold until run 2.1 and its follow-ups have merged, then rebase. Goes in the ledger row
   and the report. From the orchestrator: copy v10 to the Mac.
6. **Adopted.** The orchestrator's answer is recorded verbatim in [QUESTION.md](QUESTION.md)
   ("Answer"), in the step 1 commit; the script's note and the TODO bullet point at it. TODO edits in
   step 1: (a) path, SHA-256 and counts lines → v10; (b) v9 joins the predecessor chain with SHA-256
   `0b6c9c04…800c` and 91/111/45; (c) a new v10 bullet naming the authority, after the v9 bullet;
   (d) the `--split` line → v10. The "outside tuning with a `reverifyBy`" figure goes to EXEC.md
   only. Base the script on `amend-split-v8.mjs` ("exactly one" check). Also check
   `git grep -c "split-v9\|0b6c9c04" -- eval/qa/README.md` (a count only) and update any hit.
7. **Adopted.** Run `npm run -s mcp:surface -- --json` on `origin/main` before step 2 and on the
   final head. Record `surfaceSha256` and `instructionsSha256` both times in EXEC.md. A changed hash
   is a stop-rule event.
8. **Adopted.** The lead adds the three missing deviations (own tools instead of
   `codeMcpServer`/`createCodeTool`; `shape-logs.ts`; the adapted `withGlobalsHint`), the cs-012
   no-workaround line, and the spec-sandbox adaptations to the report's deviations table.
9. **Adopted.** The 0.5.4 row also covers output-type generation (in `dist/ai.js`; the vendored
   `json-schema-types` chunk is byte-identical). EXEC.md answers the six points of the re-vendor
   checklist at `src/catalog/scoring.ts:448-463`. Step 4's diff of the vendored files against 0.5.6
   feeds it.
10. **Adopted.** cs-012: leave the dated "Read, not executed" evidence line as history. The new
    recurrence carries the 0.5.6 execution and says #2898 has "bot activity only, no human
    maintainer". The body sentence says 0.5.1 and 0.5.6 were executed. The TODO bullet notes that
    the fix makes a non-Error throw `ok: false` with `String(err)` (model-facing when it ships) and
    reserves more provider names, none of which collide with Raven's.
11. **Adopted.** The existing spec-search smoke case also asserts `toContain('\n  "services"')`. The
    oversized-string case asserts with `endsWith(...)` and no 24,000 ceiling. Add the
    `createExecuteRunner` smoke case for the 0.5.5 gate: `async () => { codemode.search("x"); return 1; }`
    gives `ok: true` and result `1` (use whatever exact provider call the existing smoke tests use
    without `await` if `codemode.search` is not one).
12. **Adopted as a contingency.** If `npm test` reports a missing `truncateResult` mock export, add
    the key to the mocks. That is not a stop event.
13. **Adopted.** Step 6 edits only `test/script-hints.test.ts:3` ("0.5.6, observed 2026-11-17").
14. **Adopted.** DECISIONS.md: answer 1 (RWA re-test) is item 6.3, answer 2 (Docs titles) is item
    6.2, answer 3 (codemode) is item 6.1. The section goes between "Follow-up answers (2026-11-17)"
    and "Timing". TODO `:669`: delete only "Raven stays on 0.5.1", keep "has an ungated copy of the
    same rule", and change "through 0.5.4" to "through 0.5.6". The report notes that host-side
    structural truncation came in 0.5.2, not 0.5.3. The plan's "and by A/B callers" is wrong: only
    the smoke test calls the spec-search runner.
15. **Adopted.** The Codex brief carries the grep exclusion rule and "never read a file under
    `~/backups/`", and has `amend-split-v10.mjs` in scope (it must print no id).
