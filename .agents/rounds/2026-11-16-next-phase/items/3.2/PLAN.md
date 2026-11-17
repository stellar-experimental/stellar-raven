# Item 3.2 plan: per-source status, per-call timeouts, `errorName`, `scout.matchPartners`

Lead: Claude Opus 5.5, agentpc `t1s9`. Branch `np/3.2-per-source-status` from `origin/main`
`4319c6ac`, worktree `/home/tyler/code/raven-wt/np-3.2`. Scope: PLAN.md 3.2 plus the orchestrator's
[3.2 note](/home/tyler/code/raven-wt/orch/3.2-NOTE.md), which binds where it differs.

## Decision this item changes

A failed or hung source stops looking like a coverage gap, and one hung Lumenloop or Scout call
stops holding a script for 60 seconds. A failed `execute` gets a bounded error class. An operation
that fails on nearly every call leaves the exposed surface.

## Facts re-checked on `4319c6ac`

- Lumenloop (`src/adapters/lumenloop.ts`) and Scout (`src/adapters/scout.ts`) make one `fetch`
  per call, with no retry and no timeout. Stellar Docs bounds an operation at 24 s across its
  attempts (`OPERATION_BUDGET_MS`, `[8000, 12000]` attempt timeouts, deadline-clipped); stellar.org
  has its own 24 s `OPERATION_BUDGET_MS` for `get_page`; `search_site` is one 12 s request.
- `mintlifyRequest` in `src/adapters/stellar-docs.ts` drops the status of a retryable 5xx: on
  exhaustion it returns `{ ok: false, message }` with no `status`, so `failedCallReason`
  (`src/executor/providers.ts`) labels it `upstream-error`, not `http-5xx`.
- No `op` event, ledger row, or `execute` event records attempts or a per-source final status.
  `OpLedgerCall` (`src/executor/providers.ts:109-130`) has no attempt or status field. The `execute` event
  (`src/mcp/tools.ts`) carries `operationSummary` and `sourceBasis` telemetry.
- `@cloudflare/codemode` 0.5.1 catches script errors inside the sandbox and returns only
  `err.message` (no `name`). A load failure (syntax) rejects `executor.execute` on the host, and
  `run.ts` folds it into the same `error` string. A timeout is the exact message
  `Execution timed out`. So `errorName` can only be derived from the outcome path and the
  runtime's own message forms.
- Live `POST https://stellarlight.xyz/api/partners/match` (keyless, 2026-11-17): HTTP 503,
  `{"error":"AI matchmaking isn't available right now. Try the /partners directory filters.","unavailable":true}`.
- `scout.matchPartners` references outside dated records: `catalog/manifest.json`,
  `specs/super-spec.json`, `eval/plan/op-classes.json` (all generated), `scripts/exposure.mjs`
  (comment), `scripts/description-notes.mjs` (a scrub entry), `scripts/build-catalog.mjs`
  (comment), `eval/discovery/cases.json` (one `acceptableOps` entry), `test/adapters.test.ts:447`,
  `test/catalog.test.ts:392-407,622`, `test/search.test.ts:523`, and one QA corpus case.
  No routing case in `eval/routing-cases.json` names it.
- The edit to the QA case is blind, whatever the case's set. The reference is its `surface`
  array, and it is the only occurrence of `matchPartners` in the file (found by a script that
  printed only the path).
  `surface` is "hidden from agent and judge" (`eval/qa/README.md`) and is not in
  `caseInputSha256` (`eval/qa/paired-verdict.mjs`); `lint-corpus.mjs` fails a non-exposed
  `surface` id, so the edit is required.

## Steps

### A. Mintlify status through retry exhaustion (`src/adapters/stellar-docs.ts`)

1. `Attempt` `retryable` gains `status?: number`, set when the cause is an HTTP 5xx response.
2. `mintlifyRequest` keeps the last attempt's status (cleared when a later attempt fails with no
   response) and returns it on exhaustion. The two `errResult` sites already spread `status`.
3. Message unchanged. Result: an exhausted 5xx carries `status`, so the ledger `reason` becomes
   `http-5xx`; the SOURCE BASIS `[reason]` text changes only for that case.

### B. Lumenloop and Scout timeouts (`src/adapters/{types,lumenloop,scout,stellar-docs,stellar-org}.ts`)

Decision: **24 s is one wall-clock budget per operation call, not per attempt.** Lumenloop and
Scout make one request, so the budget is that request plus its body read. Stellar Docs and
stellar.org `get_page` already clip every attempt, the `/index` retry, redirects and the site probe
to one 24 s deadline. A future retry in any adapter must take the remaining budget, never a fresh
24 s, so a timeout cannot multiply. 24 s bounds one call, not a script: three sequential hung calls
still exceed the 60 s `execute` limit, and one hung call uses 24 s of a skill runner's 30 s
(`src/skills/run.ts:53`). Record this in the adapter header and in `ARCHITECTURE.md`.

1. Export one `OPERATION_BUDGET_MS = 24_000` from `src/adapters/types.ts`; the Docs and
   stellar.org adapters import it instead of their own constants (same value, no behavior change).
   Update `docs/stellar-docs.md:201`, which says the constant is in the adapter.
2. Lumenloop and Scout hold the signal in a local (`const signal = AbortSignal.timeout(OPERATION_BUDGET_MS)`)
   and pass it to `fetch`; it also bounds the body read.
3. Timeout detection is `signal.aborted` (one abort source, so aborted means timed out, in Node and
   workerd, for headers or body), never the thrown error's name or message. Lumenloop checks it in
   the inner JSON catch (`lumenloop.ts:74-84`) before returning the non-JSON error, and in the
   outer catch; Scout in its outer catch. A timeout returns `kind: "error"`, no `status`, message
   `<service> timed out after 24 s` (no URL, no argument), and the hint "The call timed out. Do
   not retry it in this script. Report this source as unavailable, not as missing data." Any other
   throw keeps `caughtResult`.
4. Tests (`test/adapters.test.ts`): `vi.spyOn(AbortSignal, "timeout").mockImplementation(() => realTimeout(5))`
   (fake timers cannot drive `AbortSignal.timeout`; never wait 24 s), asserting the adapter asked
   for `OPERATION_BUDGET_MS`. For both adapters: a fetch that never resolves until its signal
   aborts; a fetch that resolves headers then stalls the body. Step A tests: the existing deadline
   test (`test/adapters.test.ts:853-864`) also asserts `status: 503`; a "5xx then timeout" test
   asserts the status is cleared.

### C. Per-source attempts and final status (`src/executor/providers.ts`, `run.ts`, `src/mcp/tools.ts`, `src/demo/tools.ts`)

1. In `buildOpsFns`, wrap the fetch passed to `callService` per call (default `fetch`, called
   unbound; `input` and `init` pass through untouched). The wrapper counts upstream requests,
   records the last response status, whether the last request threw, and the last request's
   signal.
2. `OpLedgerCall` gains `attempts: number` (upstream requests, counting the Docs `/index` retry,
   the site probe and stellar.org redirect hops) and `finalStatus: string`:
   - the adapter's `error.status` when the envelope carries one;
   - otherwise, for an ok result, the last response status;
   - for a failed result with no status: `timeout` if the last request's signal aborted,
     `network` if the last request threw, `none` with zero requests (guard refusal, missing key);
     else the last response status.
   Never upstream text. The `op` log event gains the same two fields (exact status there).
3. `ExecuteOutcome` gains `sourceSummary`: keyed by service (`lumenloop`, `scout`, `stellarDocs`,
   `stellarOrg`; only services called), each `{ calls, attempts, ok, error, softEmpty, finalStatus }`
   where `finalStatus` counts fixed buckets only: `2xx`, `3xx`, `4xx`, `429`, `5xx`, `timeout`,
   `network`, `none` (fixed key paths; the exact status stays on the `op` event). Built from the
   ledger in both the ok and the failed outcome. The `execute` and `demo-execute`
   (`src/demo/tools.ts:544-567`) events log it as `sources`.
4. Model-facing text changes only as intended: step A's `http-5xx` reason, and step B's new
   timeout envelope and `[timeout]` reason for a call that used to hang. `callsLine` reads named
   fields only; keep it that way. The artifact `opLedger` projection stays `op`/`status`/`ms`.
   `attempts` and `finalStatus` also land in `sourceBasis.calls.first` telemetry on both events
   (`projectSourceBasisTelemetry` copies whole rows); bounded, telemetry-only, documented in F1.
5. `skill.run` calls reach the run ledger (`providers.ts:1344,1356`); no change needed.
6. Tests: Docs 5xx then 200 → attempts 2, `200`; exhausted 5xx → `503`; absent page → attempts 3,
   `404` (soft-empty, even if the probe fails); stellar.org redirect → attempts 2, last hop's
   status; timeout → `timeout`; guard refusal → 0 and `none`; `sourceSummary` buckets from a mixed
   ledger; the `execute` event carries `sources` (extend the existing event test).

### D. `execute` `errorName` (`src/executor/script-hints.ts`, `run.ts`, `src/mcp/tools.ts`, `src/demo/tools.ts`)

1. Add `classifyExecuteError(message, loadRejected)` to `src/executor/script-hints.ts`, sharing
   its patterns with `SCRIPT_HINTS` so the runtime's message forms live in one file. It returns
   one of `SyntaxError`, `TypeError`, `ReferenceError`, `timeout`, `other`:
   - the exact message `Execution timed out` → `timeout`;
   - `/SyntaxError|Failed to start Worker|Unexpected (token|identifier|end of input)|Invalid or unexpected token|missing \) after|is not valid JSON|Unexpected end of JSON input/`
     → `SyntaxError` (on the load-rejection path too: that path also catches RPC, isolate and
     loader faults, which fall to `other`);
   - `/\bis not defined\b|Cannot access '[^']*' before initialization/` → `ReferenceError`;
   - `/Cannot read properties of (undefined|null)|Cannot set properties of|is not a function|is not iterable|is not a constructor|Cannot convert undefined or null|Assignment to constant variable|Cannot destructure/`
     → `TypeError`;
   - else `other`.
   Classify the raw sandbox message before hinting and redaction. The header says the class comes
   from the runtime's own message forms because `@cloudflare/codemode` drops `err.name`, so a
   model-thrown `Error` with such text is misclassed. No cleaner structural source exists without
   wrapping model code.
2. `ExecuteOutcome` (failed) carries `errorName`. The span sets `sandbox.errorName` on failure;
   the `execute` and `demo-execute` events log `errorName` (`null` when ok; `other` in the
   runner-threw catches in `src/mcp/tools.ts` and `src/demo/tools.ts:479-490`). Never message text.
3. Tests: unit, one per class, including a load-rejection non-syntax fault → `other` and a model
   `throw new Error("x")` → `other`. Smoke (`test/smoke/executor.test.ts`, near `:1213`): assert
   `errorName` for one real `ReferenceError`, one `TypeError` (`null.x`) and one load failure.
   `timeout` stays a unit test.
4. Out of scope, TODO line: a script that throws a non-Error (`throw "x"`) has no `err.message`, so
   codemode returns no error and the run records `ok: true`.

### E. Remove `scout.matchPartners` from the exposed surface

1. `src/policy/scout-exposure.ts`: add `["POST /api/partners/match", "matchPartners"]` to
   `EXCLUDED_SCOUT_OPERATIONS`, with the reason and the re-exposure condition beside it, as the
   other entries have: upstream returns 503 `unavailable` on nearly every call;
   `scout.getPartners` is the directory path; re-expose when the endpoint answers again. No round
   ids in code comments. Fix the comment block in `scripts/exposure.mjs` (it says the endpoint
   "stays exposed" and names it as the assistant's alternative). `scripts/build-catalog.mjs:1263`
   uses `scout.matchPartners` as its example token: use an exposed id.
2. `scripts/description-notes.mjs`: remove the `matchPartners` scrub (required:
   `build-catalog.mjs:834-840` throws on a scrub keyed to a non-exposed op). Add a scrub only if a
   build guard names another description that points at the removed endpoint.
3. Rebuild: `node scripts/build-catalog.mjs`, `npm run spec:build`, `npm run micro-map:build`,
   `node eval/plan/build-op-classes.mjs`, `npm run eval:compile`. Both ADR-0003 guards must pass.
4. Tests: retarget `test/adapters.test.ts:447` (the 503 `unavailable` branch stays) to a
   hand-built Scout entry; `test/catalog.test.ts` expects `scout.matchPartners` absent (`:407`,
   `:622`), Scout count 30 → 29 at `:397` with its comment at `:387-393`, and `:456-457` 62 → 61
   operations and 286 → 285 entries; `test/plain-operation-harness.test.mjs:14-22` 62 → 61;
   `test/super-spec.test.ts:195` Scout 30 → 29; `test/search.test.ts:523` expects no hit.
5. `eval/discovery/cases.json`: remove `scout.matchPartners` from the one `acceptableOps` list
   (four remain; `eval/discovery/lib.mjs:115-121` requires the edit).
6. The QA case, blind:
   1. Find the file with `git grep -l 'scout.matchPartners' eval/qa/corpus` (prints a path only).
      A script removes the exact string from its `surface` array and writes the file in the
      corpus's formatting. It prints nothing from the case. Never open, cat or diff the file with
      context; never read `eval/qa/cases.json` rows.
   2. `node eval/qa/compile-qa.mjs`.
   3. A script proves the edit is surface-only: parse the case at `HEAD` and in the worktree,
      delete `surface` from both, assert deep equality, and assert the new `surface` is the old one
      minus exactly `scout.matchPartners`. It prints `ok` or fails.
   4. `npm run eval:qa:register` (stamps the new member hash, reopens its one cluster), then
      `npm run eval:qa:register -- --review <file>` with the cluster's previous `verdict`,
      `clearReopened: true`, and a `reSwept.reason` saying the change is a hidden `surface` id
      only and no judge-facing field moved (`register-helper.mjs:114-146` lists the fields). Read
      only the register entry's own fields, never the members' content.
   5. Verify only with `git diff --numstat -- <case> eval/qa/cases.json` and the step-3 script;
      then `eval:qa:lint` and `eval:qa:register -- --check`.
   Nothing written (EXEC.md, REPORT.md, commits, PR body) names the case's set.
7. Routing: follow item 0.2's method (`items/0.2/PLAN.md:54,82-88`). Save
   `git show HEAD:catalog/manifest.json` to `tmp/`; run the routing runner with `--manifest` on the
   old and on the new manifest; compare every row of every lane (grades, top-five lists, forbidden
   captures). The first `npm run eval:routing -- --gate` must fail with exactly the one
   fingerprint line. If every grade and total holds, re-stamp in `eval/gates.json` the manifest
   SHA-256, `localTrace` and `evidence.notes`, in the same commit as the manifest; thresholds,
   totals and `baselinedAt` stay. Report top-five list changes in EXEC.md even when no grade moves.
   If any grade moves, stop and report; do not re-baseline.
8. Served skill: the exclusion also changes the served `stellar-scout` skill at read time
   (`src/skills/scrub.ts`). The scrub removes `SKILL.md` workflow step 4 whole (with its stablecoin
   peg guidance, partner-directory filters and "none listed at our source" rule), the "Use when"
   sentence of the `getPartner` paragraph in `references/api-reference.md`, and that file's
   `POST /api/partners/match` section. The lead accepts this loss; a narrower scrub unit is a
   separate change and gets a TODO line. Run the scrub over the three pinned files and confirm no
   reference survives.
9. Final sweep: `git grep -n "matchPartners\|partners/match"` outside `research/`, dated
   `.agents/rounds/`, `improvements/resolved.json`, `inventory/`, `test/fixtures/` and the
   exclusion entry returns nothing that is emitted text, a skill, a routing case or a golden.

### F. Documentation and TODO

1. `ARCHITECTURE.md` (the 24 s per-call decision from B; the `op`, `execute` and `demo-execute`
   event fields), and the `cloudflare-observability-review` skill's event-field list if it has
   one: `attempts`, `finalStatus`, `sources` (fixed buckets), `errorName`, and the two fields in
   `sourceBasis.calls.first`. Timeless wording.
2. `.agents/TODO.md`:
   - Priorities item 3 drops "This order waits on the orchestrator's confirmation" (confirmed
     2026-11-17).
   - Delete "Report per-source attempts and final status" (done).
   - "Ship the cap decisions" (`:199-204`, `:213`): the timeouts bullet is shipped; "Next" and
     "Done when" keep only the `EXECUTE_TIMEOUT_MS` and key follow-up.
   - "Triage the runtime and client gaps": the `matchPartners` and `errorName` bullets leave the
     list, and the production-read paragraph (`:850-852`) drops its sentences about them; the
     other bullets stay.
   - "Audit source coverage": drop the `scout.matchPartners` 503 pointer.
   - Add two lines where they fit: the narrower skill scrub unit (E8) and the non-Error throw
     recorded as `ok: true` (D4).
3. Round ledger: the 3.1 row's "(pending the orchestrator's confirmation)" becomes "confirmed by
   the orchestrator 2026-11-17"; the lead adds the 3.2 row.

## Gates (bare, in the worktree)

`npm run typecheck`, `npm test`, `npm run build`, `npm run test:smoke`,
`npm run eval:routing -- --gate`, `npm run eval:selftest`,
`npm run eval:qa:lint -- --stale --enforce-floors`, `npm run eval:qa:register -- --check`,
`npm run secrets:scan -- --tree`, and the generated-file sync (rerun each generator; `git status`
clean after). No local server, no model-calling eval, no paid call.

## Commits

Sonnet commits on `np/3.2-per-source-status`, normal hooks: one commit for A–D (runtime), one for
E (exposure), one for F (docs and TODO). The lead adds the ledger row.

## Reviews

1. Claude Fable reviews this plan (REVIEW.md).
2. After execution, Codex frontier (`gpt-6-astra`, high) reviews the executor and adapter boundary
   (CODEX-REVIEW.md, written to the worktree `tmp/` and copied over). Sonnet reconciles every
   finding.

## Stop rule

Done when the TODO's "done when" holds (a Mintlify exhaustion carries the last status; the
`execute` event records attempts and final status per source, with tests), both timeouts ship with
tests, `errorName` ships with tests, `scout.matchPartners` is gone from every emitted surface with
both guards green, and all gates pass. Stop and report instead of re-baselining if the routing gate
moves a row.

## Risks

- `AbortSignal.timeout` in workerd vs Node: the smoke lane blocks outbound requests, so detection
  uses `signal.aborted`, which needs no runtime-specific error shape.
- Wrapping `fetch` must not change what adapters send (method, headers, `redirect: "manual"`,
  signal). Pass `input` and `init` through untouched.
- The `errorName` classifier is heuristic by necessity; it is telemetry only and never reaches the
  model.
- Telemetry size: `sources` is at most 4 services with 8 fixed buckets each.
- Removing an operation can shift lexical ranking; the gate decides (step E7).

## Needed from the orchestrator or owner

Nothing to start. For the report: the deploy, and the production checks after it.

## Review reconciliation (Claude Fable, [REVIEW.md](REVIEW.md))

All 19 findings adopted: 1 → E6.3-E6.5; 2 → Facts and E6 (no set named anywhere); 3, 4, 6 → B3;
5 → B4; 7 → C2, C6; 8, 17 → D1, D4; 9 → D3; 10 → E8 (loss accepted by the lead, TODO line);
11 → E4; 12 → E7; 13 → C3, C4, D2, F1; 14 → E6.5; 15 → C3; 16 → E1, E2; 18 → Facts, C4;
19 → B, B1, F2. On finding 1's question: closing the reopened cluster on the surface-only proof,
without reading members, is accepted, because the register guards judge-facing content and the
proof shows none moved. The report names this for the orchestrator.
