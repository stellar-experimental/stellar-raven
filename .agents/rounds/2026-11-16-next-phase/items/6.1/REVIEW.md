# Item 6.1 plan review

Reviewer: Claude Fable 5.2 (`claude-fable-5-2`), high, 2026-11-17. Reviewed [PLAN.md](PLAN.md) against the
worktree at `35d5de90`, the unpacked 0.5.1 and 0.5.6 packages, and upstream GitHub (keyless reads).
No file changed except this one. No install, no model call, no upstream post.

Findings are ordered by severity. "Verified" at the end lists what I checked and found correct.

## Findings

### 1. Blocking: six "kept" spec-sandbox tests fail once the wrapper returns the raw value

Step 3 says to keep the `$ref`, circular, lazy-cache, fence and real-spec tests and lists only
deletions plus one new test. Every kept test that evaluates the wrapper assumes a string, which
only `__truncateResponse` produced:

| `test/spec-sandbox.test.ts` | Today | After the wrapper change |
|---|---|---|
| `:80` fence | `toBe("42")` | value is `42` |
| `:90`, `:99` `$ref`, circular | `JSON.parse(result)` | `result` is an object; `JSON.parse` throws |
| `:111` lazy cache | `toBe("true")` | value is `true` |
| `:163` real super spec | `JSON.parse(result)` | object |
| `:193` `resolveSpecRefs` twin | `JSON.parse(await runWrapped(...))` | object |

The plan does not mention the `resolveSpecRefs` twin test at all. As written, `npm test` fails.

Fix: in step 3, say that each kept test drops its `as string` cast and `JSON.parse` and asserts the
raw value (`toBe(42)`, `toBe(true)`, `toEqual({...})`), including the twin test at `:190-197`. The
planned "an object stays an object" test then overlaps the `$ref` test; keep it only for the
`not.toContain("__truncateResponse")` source assertion.

### 2. Should-fix: the runner mirror drops upstream's error handling, so an unserializable result now rejects

`responseText` throws on a value `JSON.stringify` cannot handle. I ran the 0.5.6 logic from
`dist/truncate-Dd-VZZYQ.js` under Node: `{ n: 1n }` throws `Do not know how to serialize a BigInt`,
and a cyclic object throws `Converting circular structure to JSON`. Upstream calls both
`executor.execute` and `responseText` inside one `try` and returns `Error: ${formatError(error)}`
(0.5.6 `dist/mcp.js:300-321`, `formatError` at `:23`).

`createSpecSearchRunner` has no `try` (`src/executor/run.ts:681-692`). Today a script that returns
a BigInt fails inside the sandbox's `__truncateResponse` and comes back as
`{ ok: false, error }`. After the plan's change the value crosses RPC, `specResponseText` throws on
the host, and the runner rejects. A cyclic return fails at RPC serialization and rejects the same
way. That is a regression from error-as-data to a thrown rejection, and it is not what upstream does.

Fix: mirror the handler, not only the helper. Wrap the `execute` call and `specResponseText` in one
`try`/`catch` that returns `{ ok: false, error: e instanceof Error ? e.message : String(e) }`. Add one
smoke case: `async () => 1n` gives `ok: false` and does not reject. Add this to the
deviations table if the lead decides not to do it.

### 3. Should-fix: "`npm test` includes the gates fingerprint" is not true

`test/gate-evidence.test.mjs` tests `gateEvidenceFailures` on synthetic files in a temp directory
(`:15-24`). The check of the committed inputs against `eval/gates.json` is in `eval/self-test.mjs:50-54`,
which is `npm run eval:selftest`. The fingerprint also covers only `catalog/manifest.json` and the three
case files (`eval/lib/gate-evidence.mjs:6-11`), not the scorer.

The decision not to run the routing gate is still sound: Raven's search never imports the package
(only `src/executor/run.ts:19` does), and the path check in the plan is the real proof.

Fix: in "Gates", replace the `npm test` claim with `npm run eval:selftest`, and extend the path check
to `src/catalog/`, `catalog/`, `specs/` and `eval/*.json`. `eval:selftest` is also the `eval/` gate in
`CONTRIBUTING.md:41`, which applies because step 1 edits `eval/qa/tuning-rows.mjs`. State that the
other two `eval/` gates (QA lint, register check) are left to CI under 6-COMMON.md ("never run the QA
lint").

### 4. Should-fix: the improvements lint needs `-- --live`

Step 4 adds a new GitHub ref (PR #2898) to `cs-012`. The skill says to add `-- --live` "when intake
repos or GitHub refs changed" (`.agents/skills/improvements-pipeline/SKILL.md:14`), and item 5.2 ran
it for the same reason (`items/5.2/PLAN.md:127`). It is a keyless GitHub read.

Fix: step 4 and "Gates" run `npm run improvements:lint -- --live`.

### 5. Should-fix: the plan does not state the merge deadline that makes "the timers need no edit" true

The claim is correct as far as it goes. No unit names a split (`units/raven-dated-2.1.service`
passes only `2.1 bell-goldens`), and `launch-dated-lead.sh` creates a fresh worktree from
`origin/main` and reads the brief from it. So the timers pick up v10 only if PR 6.1 is on `main` when
they fire. The first fires at 2026-11-23 18:00 UTC (`units/raven-dated-2.1.timer`). Item 5.2's ledger
row carried the same window.

Fix: add to the plan and the ledger row draft: "Merge before 2026-11-23 18:00 UTC. If that is missed,
hold until run 2.1 and its follow-ups have merged, then rebase." Add to "From the orchestrator": copy
v10 to the Mac, because the TODO says a Mac copy of an earlier split is stale. Also note that items
6.2 and 6.3 start from `main` after this merge, so they see 92 and v10 together.

### 6. Should-fix: the TODO held-out block edit is under-specified, and the orchestrator's answer is in no tracked file

`.agents/TODO.md:40-76` needs more than "path, SHA-256, counts, `--split` line":

- `:47-53` keeps a predecessor chain. v9 must join it with its SHA-256
  (`0b6c9c04…800c`) and counts (91/111/45), as v8 did.
- `:55-76` has one bullet per amendment (v5 to v9). v10 needs its own bullet that names the
  authority.
- The block has no "outside tuning with a `reverifyBy`" figure (`git grep -n reverifyBy -- .agents/TODO.md`
  gives lines 58, 334 and 357, none a count). Item 5.1 recorded that figure in its EXEC.md only. Send
  the script's figure to EXEC.md, not the TODO.

The authority itself is missing from the repository. `QUESTION.md` holds the question and the proposed
answer. The orchestrator's answer ("approve option (a), in its own commit in PR 6.1 ... the case moves.
Make sure the dated timers and briefs end up pointing at v10 and its SHA-256") exists only in the
review brief. Items 3.5 and 5.1 recorded theirs in `FOLLOWUP.md`.

Fix: record the answer verbatim (an "Answer" section in `QUESTION.md`, or `FOLLOWUP.md`) in the
step 1 commit. Point the script's note and the TODO v10 bullet at that file. List the three TODO edits
above in step 1.

### 7. Should-fix: prove "not model-facing" with the surface hash, not only by argument

The argument is right (see "Verified"). A free measurement exists and item 3.5 used it:
`npm run -s mcp:surface -- --json` gives `surfaceSha256` and `instructionsSha256`
(`items/3.5/EXEC.md:90-95`). It bundles with esbuild and runs under Node; it starts no Wrangler.

Fix: run it on `origin/main` before step 2 and on the final head. Put both hash pairs in EXEC.md and
the report. Add "a surface hash differs" to the stop rule. This covers descriptions, schemas, types
text and instructions; the unchanged smoke assertions cover error and truncation shapes.

### 8. Should-fix: the remaining-deviations table misses three deviations

Each reason in the five rows is true (checked against `src/policy/truncate.ts:1-16`,
`src/executor/spec-sandbox.ts:16-27`, `src/catalog/vendor/search-scoring.ts:1-19`,
`src/executor/script-hints.ts:49-55`). Missing:

| Deviation | Reason to state |
|---|---|
| Raven registers its own `search` and `execute` tools and calls `DynamicWorkerExecutor` directly, instead of `codeMcpServer`, `openApiMcpServer` or `createCodeTool` | ADR-0001 and ADR-0003. This is why `toModelOutput` (0.5.2), the Standard Schema metadata (0.5.3) and upstream's tool descriptions do not apply. |
| Log shaping in `src/executor/shape-logs.ts` (100 lines, 2,000 chars a line, redact before clip); upstream 0.5.2 bounds `logs` with `truncateResult` in `toModelOutput` | Redaction order is a security rule, and the module must load under plain Node. A candidate for the same measured proposal as row 2. |
| The `is not defined` hint in `src/executor/script-hints.ts:11-16` is an adapted copy of upstream's private `withGlobalsHint` (0.5.6 `dist/index.js:1749`): it names providers and adds "and standard JavaScript" | Upstream does not export it and applies it only in the durable runtime path. The addition stops the hint from denying builtins. |

Also add one line that is not a deviation, so the list is complete: Raven has no local workaround for
`cs-012` and inherits the defect until upstream ships a fix. In row 3, mention the other
spec-sandbox adaptations already in the module header (`includeRequest` always false, the unified
super spec, the spec serialized once per isolate).

### 9. Should-fix (small): the 0.5.4 row is incomplete, and the re-vendor checklist is not walked

The 0.5.4 changelog entry has a second half: output types in `generateTypes` now describe the value
a tool returns (`.default()` required, `.pipe()` piped type, `.transform()` as `unknown`). Raven
vendors type generation, so the table should say why this does not reach it: the change is in
`dist/ai.js` (`safeOutputSchemaToTs`, `standardOutputJsonSchema`), and the `json-schema-types` chunk
that Raven's `src/catalog/vendor/json-schema-types.ts` comes from is byte-identical.

`src/catalog/scoring.ts:448-463` holds a six-point "Re-vendor checklist for an @cloudflare/codemode
upgrade". The plan does not cite it.

Fix: extend the 0.5.4 row, and have EXEC.md answer the six points. From my read: 1, 2, 3, 5 and 6
are unchanged by byte identity; for 4, the 0.5.6 root export list (`dist/index.js:2036`) still has no
`searchConnectors`.

### 10. Nit: `cs-012` details

- The frontmatter evidence line also says "Read, not executed: the same line in 0.5.6". Step 4 fixes
  only the body sentence. Leave the dated line as history and let the new recurrence carry the 0.5.6
  execution, or the two will disagree.
- "#2898 has had no maintainer activity" is true but thin. The PR has 3 comments, 5 reviews and 6
  review comments, all from `github-actions[bot]`, `devin-ai-integration[bot]` and
  `changeset-bot[bot]`. Say "bot activity only, no human maintainer" in the recurrence. Staying
  silent is right under skill rule 6: no claimed fix has shipped.
- For the TODO bullet: #2898 also reserves the provider names `String`, `Object`, `Proxy`, `JSON`,
  `Math`, `Uint8Array`, `ArrayBuffer`, `btoa` and `atob`. Raven's provider names do not collide. When
  the fix ships, a non-Error throw becomes `ok: false` with `String(err)`, which is model-facing.

### 11. Nit: smoke coverage after the unit tests go

- The deleted unit test pinned the 2-space form. That behavior now lives only in `run.ts`. In the
  existing smoke case, add `expect(outcome.result).toContain('\n  "services"')`.
- The planned oversized cases are right. I confirmed them on the 0.5.6 code: four objects of 40,000
  to 55,000 chars come back at 23,932 to 24,000 chars, compact, valid JSON, with the marker. A
  24,100-char string comes back at 24,106 chars and ends with
  `Response was ~6,025 tokens (limit: 6,000). Narrow the request to reduce response size.` Assert the
  string case with `endsWith`, and do not assert a 24,000 ceiling on it.
- Optional: one `createExecuteRunner` smoke case for the 0.5.5 gate, `async () => { codemode.search("x"); return 1; }`
  gives `ok: true` and result `1`. It pins the "no Raven code change" claim.

### 12. Nit: seven unit-test mocks do not export `truncateResult`

`vi.mock("@cloudflare/codemode", () => ({ DynamicWorkerExecutor: ... }))` appears in
`test/server.test.ts:111` and six other files. `run.ts` will import `truncateResult` too. Vitest
throws on a missing mock export only when it is read, and no unit test calls
`createSpecSearchRunner`, so this should pass. If `npm test` reports `No "truncateResult" export is
defined on the mock`, add the key to the mocks; that is not a stop-rule event.

### 13. Nit: step 6 names a file with nothing to change

`src/executor/script-hints.ts` has no version text (`git grep -n "0\.5\.1" -- src` is empty). Only
`test/script-hints.test.ts:3` does. Update its date with the version ("0.5.6, observed 2026-11-17").

### 14. Nit: DECISIONS.md and TODO wording

- The owner's answers and the items do not share numbers: answer 1 (RWA) is item 6.3, answer 2 (Docs
  titles) is item 6.2, answer 3 (codemode) is item 6.1 (`orch/6.2-NOTE.md`, `orch/6.3-NOTE.md`). Write
  the mapping out.
- The new section goes between `## Follow-up answers (2026-11-17)` (`DECISIONS.md:66`) and `## Timing`
  (`:89`).
- In `.agents/TODO.md:669`, delete only "Raven stays on 0.5.1". Keep "has an ungated copy of the same
  rule" and change "through 0.5.4" to "through 0.5.6".
- 6.1-NOTE.md and `.agents/TODO.md:677` say 0.5.3 introduced host-side truncation. It was 0.5.2
  (#2224). The plan has it right; say so in the report so the wrong version is not copied forward.
- "reached only by the smoke test and by A/B callers": no A/B caller exists in the tree
  (`git grep createSpecSearchRunner` finds only `run.ts` and the smoke test).

### 15. Nit: the Codex review brief

The choice is right: Codex frontier is `gpt-6-astra` in `.agents/model-roster.md`, the change is in
the sandbox execution path, and the reviewer differs from the author (Sonnet 5.5), the lead (Opus) and
this reviewer. Add to its brief: the `git grep` exclusion rule, "never read a file under `~/backups/`",
and `amend-split-v10.mjs` in scope (it must print no id). Its output folder `tmp/6.1/` also holds
`EXPOSURE.md`; by then the case is in tuning, so that is not a new exposure.

## Verified and correct

- **Versions and changelog.** The table matches `CHANGELOG.md` on `main` (0.5.2 #2224, 0.5.3 #2428,
  0.5.4 #2472, 0.5.5 #2614, 0.5.6 #2766). npm's latest is 0.5.6. No upstream change that touches Raven
  is missing.
- **Identical chunks.** `json-schema-types-D_m9tVnI.js`, `run-code-Q3Jh6Dcu.js`, `resolve-34dC47Il.js`,
  `shared-SMjV5yN4.js` and `base-BqhlNCSH.js` have equal SHA-256 in both versions. The
  `src/connectors/search.ts` region of `dist/index.js` is byte-identical (SHA-256 `a7daa25f…`). The
  `src/executor.ts` region differs only by the gate.
- **cs-001.** The rule is at 0.5.6 `dist/index.js:1328` and `main` `search.ts:68`. #2296 is open with
  0 comments. The vendored scorer should not change.
- **cs-012.** 0.5.6 `dist/index.js:365` still has `error: err.message`. #2897 is open. #2898 was
  opened by `github-actions[bot]` on 2026-11-17 15:04 UTC and is open and unmerged.
- **Peers.** 0.5.6 needs `acorn ^8.17.0`; its optional peers are `@modelcontextprotocol/sdk ^1.25.0`,
  `@tanstack/ai >=0.8.0 <2.0.0`, `ai ^6 || ^7` and `zod ^4`. `agents` 0.28.1 has
  `@cloudflare/codemode >=0.5.0` as an optional peer. The installed tree satisfies all of them.
- **The 0.5.5 gate.** `execute()` wraps each provider fn in `gate.run` and closes the gate in
  `finally`. The host fn still runs. The late error reaches only sandbox code that outlives the
  script, and each run uses a fresh Dynamic Worker, so nothing carries to the next call.
- **The mirror.** The planned wrapper matches 0.5.6 `createOpenApiSandboxCode` line for line with
  `includeRequest` false. The planned `specResponseText` matches `responseText` (`dist/mcp.js:9-22`).
  `truncateResult` is exported from the root entry in both versions, and no Node-safe entry exports
  it, so `run.ts` is the right place.
- **Not model-facing.** Only `run.ts` imports the package. `src/server.ts` imports `agents/mcp`, and
  no file under `node_modules/agents/dist/mcp/` references codemode. The `execute` path
  (`truncateForModel`, footers, hints) does not change. The spec-search runner is not registered.
- **Split v10.** `TUNING_ROW_COUNT` is the only constant; every test builds synthetic ids from it.
  The live v9 references are exactly `.agents/TODO.md:45,47,54`, the four `*-LEAD.md` briefs and
  `PRESTAGE.md:10,104`. `~/backups/` holds v9 (mode 600) and no v10. The exposure note has exactly one
  match of the script's id pattern (I printed the count only) and is ignored by `.gitignore:43`. The
  v8 and v9 scripts are the right models; use v8's "exactly one" check.
- **Stop rule and risks.** Sound, with the addition in finding 7.

## Reviewer notes

- I did not open `tmp/6.1/EXPOSURE.md`, any split file, or anything under `eval/corpus/`.
- One of my searches broke the letter of the search rule: `git grep -n TUNING_ROW_COUNT` excluded
  the corpus paths but not all of `eval/qa/`. It printed lines from `eval/qa/README.md:237`,
  `scan-tuning-exposure.mjs`, `scan-tuning-panel.mjs` and `tuning-rows.d.mts`. Each line holds the
  constant name only: no case id, question or golden text.
- I could not check `eval/qa/README.md` for a v9 or "91" mention. The executor should check it with
  `git grep -c "split-v9\|0b6c9c04" -- eval/qa/README.md`.

Verdict: approve after reconciliation; fix finding 1 before execution, and reconcile findings 2 to 9 in the plan.
