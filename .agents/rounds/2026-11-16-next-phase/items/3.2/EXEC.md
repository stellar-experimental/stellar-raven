# Item 3.2 execution (Claude Sonnet 5.5)

Branch `np/3.2-per-source-status`, worktree `/home/tyler/code/raven-wt/np-3.2`.

**Status: done as split.** This pull request ships A to D and F. Step E (remove
`scout.matchPartners`) stopped at E7 on the stop rule and is held; the orchestrator then answered
to keep the operation exposed (QUESTION.md). Step E is preserved on the unpushed side branch
`np/3.2-e-matchpartners` (`b4a74b8f`, one commit on top of `8f6236db`; the lead deletes it at
cleanup). Nothing was re-baselined; `eval/gates.json`, the manifest and `test/search.test.ts` are
untouched on the item branch.

## Done: steps A to D (commit `8f6236db`)

- **A. Mintlify status.** `Attempt` `retryable` carries `status?` for a 5xx. `mintlifyRequest` keeps
  the last attempt's status and returns it on exhaustion; a later attempt that fails with no response
  clears it. Message unchanged. The ledger reason for an exhausted 5xx is now `http-5xx`.
- **B. Timeouts.** `OPERATION_BUDGET_MS = 24_000` is exported from `src/adapters/types.ts`; Docs and
  stellar.org import it (`docs/stellar-docs.md:201` updated). Lumenloop and Scout hold
  `const signal = AbortSignal.timeout(OPERATION_BUDGET_MS)`, pass it to `fetch`, and test
  `signal.aborted` in the outer catch, and in Lumenloop's inner JSON catch, before anything else. A
  timeout returns `kind: "error"`, no `status`, message `<service> timed out after 24 s`, and the
  "Do not retry it in this script" hint. The one-budget-per-call decision is in the `types.ts`
  header and both adapter headers. `ARCHITECTURE.md` is step F.
- **C. Attempts and final status.** `buildOpsFns` wraps the fetch per call (`tracedFetch`; `input`
  and `init` pass through; default `fetch` called unbound). `OpLedgerCall` gains `attempts` and
  `finalStatus` (rules as planned: adapter `error.status`; else last response status for ok; else
  `timeout`, `network`, `none`). The `op` event logs both. `ExecuteOutcome` gains `sourceSummary`
  (`summarizeSourceLedger`, fixed buckets `2xx 3xx 4xx 429 5xx timeout network none`); `execute`
  and `demo-execute` log it as `sources`.
- **D. `errorName`.** `classifyExecuteError(message, loadRejected)` in `src/executor/script-hints.ts`
  with the planned patterns. The span sets `sandbox.errorName`; both events log `errorName`
  (`null` when ok, `other` in the two runner-threw catches).
- **Tests.** `test/per-source-status.test.ts` (new): Docs 5xx then 200, exhausted 5xx, absent page
  (3 requests, `404`, also with a failing and a hung probe), stellar.org redirect, timeout, network,
  guard refusal and missing key (0, `none`), request pass-through, bucket and summary tests, one
  `classifyExecuteError` case per class. `test/adapters.test.ts`: both adapters, never-answering and
  stalled-body fetches through `vi.spyOn(AbortSignal, "timeout")`, budget assertion, non-timeout throw
  unchanged; Docs deadline test asserts `status: 503`; a "5xx then timeout clears the status" test.
  `test/server.test.ts`: `sources` and `errorName` on the `execute` event, bounded class on a failed
  run. Smoke (`test/smoke/executor.test.ts`): real `ReferenceError`, `TypeError`, model-thrown
  `Error` (`other`) and a load failure (`SyntaxError`). Existing hand-built `ExecuteOutcome` and
  `OpLedgerCall` fixtures gained the new required fields.
- **Checked on that commit:** `npm run typecheck`, `npm test` (3716 passed), `npm run build`,
  `npm run test:smoke` (145 passed) all green.

## Held: step E up to the routing comparison (side branch only)

- `EXCLUDED_SCOUT_OPERATIONS` gains `["POST /api/partners/match", "matchPartners"]` with the reason
  and re-exposure condition; `scripts/exposure.mjs` comment fixed; `scripts/build-catalog.mjs` example
  token now `scout.getPartners`; the `matchPartners` scrub removed from
  `scripts/description-notes.mjs`.
- Rebuilt in plan order: catalog (285 entries, Scout 29, both ADR-0003 guards passed),
  `spec:build`, `micro-map:build` (no change), `build-op-classes` (61 ops), `eval:compile`.
- `eval/discovery/cases.json`: `scout.matchPartners` removed from the one `acceptableOps` list.
- Tests retargeted: `test/catalog.test.ts` (Scout 29, `matchPartners` count 0, 61 / 285, the
  x-routing id list), `test/super-spec.test.ts` (29; `18 + 29 + 12 + 2`), `test/search.test.ts`
  (`matchPartners` absent, `getPartners` reachable), `test/live-cases.test.mjs` (callable 66 to 65),
  `test/plain-operation-harness.test.mjs` (61).

## The routing comparison (step E7) and why this stopped

The first `npm run eval:routing -- --gate` on the new manifest fails with **two** lines, not the one
fingerprint line the plan allows:

1. `catalog/manifest.json` SHA-256 does not match the committed gate evidence (expected).
2. `holdout forbidden captures=11 above ceiling 10`.

Base run (`git show HEAD:catalog/manifest.json` through `--manifest`) passes the gate. Every row of
every lane, base against new:

| Lane | Accepted totals | Graded rows changed | Top-five id or rank changes | Score-only changes |
| --- | --- | --- | --- | --- |
| Legacy (338) | identical (220 / 293 / 327, cardHit5 113) | 0 | 2 | 9 (max delta 15) |
| Extended (122) | identical | 0 | 0 | 4 (max delta 8) |
| Skills (23) | identical | 0 | 0 | 0 |
| Protocol history (12) | identical (diagnostic `pass: false`, as in base) | 0 | 0 | 0 |
| Holdout (49) | top1 12, top3 27, top5 30, cardHit5 30 identical; **forbiddenCaptures 10 to 11; passed 25 to 24** | 1 row flips pass to fail on a new forbidden capture | 2 | 1 |

Legacy and extended top-five changes (case ids, non-holdout):

- `q-tool-passkeykit-smart-wallet`: rank 5 `scout.hackathonBrief` becomes
  `skills.lumenloop.stellar-ecosystem-scout`.
- `q-tool-which-sdk-comparison`: rank 4 `scout.searchProjects` becomes
  `stellarDocs.search_doc_titles`.
- Score-only rows: legacy 9, extended 4; their grades, ids and order hold.

Holdout is counts only, per the 0.2 rule: three rows changed (two with a changed top-five list, one
score-only); one row gained a forbidden capture and lost its pass.

Cause: removing one operation changes the lexical corpus statistics, so unrelated rows shift. The
same shift drops `scout.searchRepos` from the top five of the query
"top Stellar projects by GitHub activity" and fails the existing pin at `test/search.test.ts:631`
(Scout hits in the top five 2 to 1; `scout.getLeaderboard` stays, `scout.searchRepos` goes). That
test expectation is not updated; the decision below decides it.

## Decision

Lead, on this stop: the pull request ships A to D and F only. Orchestrator (QUESTION.md): keep
`scout.matchPartners` exposed. The TODO bullet in "Triage the runtime and client gaps" records the
decision, the measurement above, the one-line change that recreates the removal
(`["POST /api/partners/match", "matchPartners"],` in `EXCLUDED_SCOUT_OPERATIONS`), and when to
revisit.

## Step F (done)

- `ARCHITECTURE.md`: the 24 s per-call budget row in the operating limits (one budget per call, not
  per attempt; three hung calls still exceed the 60 s `execute` limit; one hung call uses 24 s of
  a skill runner's 30 s), and the `op`, `execute` and `demo-execute` fields in section 9
  (`attempts`, `finalStatus`, `sources` fixed buckets, `errorName`, the two fields in
  `sourceBasis.calls.first`, `sandbox.errorName`).
- `cloudflare-observability-review` SKILL.md: the same fields in the measurement traps.
- `.agents/TODO.md`: Priorities item 3 drops the confirmation wait; "Report per-source attempts and
  final status" deleted; "Ship the cap decisions" records the timeouts as shipped and keeps the
  `EXECUTE_TIMEOUT_MS` and key follow-up; "Triage the runtime and client gaps" drops the `errorName`
  bullet (shipped note added, with the non-Error-throw line), and its `matchPartners` bullet is
  rewritten per the orchestrator's decision; the production-read paragraph drops its `errorName`
  sentence. "Audit source coverage" keeps its `matchPartners` pointer. No narrower-skill-scrub line
  (it belongs to step E).
- Round ledger: the 3.1 row now reads "confirmed by the orchestrator 2026-11-17". The lead adds
  the 3.2 row.

## Codex review (`CODEX-REVIEW.md`, verdict PASS, one low finding)

Finding 1 (test coverage gaps; the implementation is correct by inspection) is adopted, in
`test/per-source-status.test.ts` and `test/smoke/executor.test.ts`:

1. Interleaved concurrent calls: "keeps two interleaved calls' attempts and final status apart"
   holds a Docs call (503 then 200) and a Scout call (404) on deferred promises, releases them out
   of order, and asserts each ledger row (`2` / `200`, `1` / `404`).
2. Pass-through: "passes the request through to fetch untouched" now asserts the Lumenloop
   `Authorization` and `Content-Type` headers, method, POST body and signal; the Scout GET and
   query; and `redirect: "manual"` on both stellar.org hops.
3. Stalled body: "pins finalStatus timeout on the ledger row for a stalled body" runs a Lumenloop
   stalled body through `buildSandbox` with the shortened signal and asserts `reason: "timeout"`,
   `attempts: 1`, `finalStatus: "timeout"`.
4. The skill-run smoke (digest run) asserts `outcome.sourceSummary` (`lumenloop`: 2 calls, 2
   attempts, 2 ok, `2xx: 2`).

No long waits: every abort uses the 5 ms signal.

## Gates (item branch, run bare)

`npm run typecheck`, `npm test` (3718 passed), `npm run build`, `npm run test:smoke` (145 passed),
`npm run eval:routing -- --gate` (PASS, unchanged: the manifest is untouched), `npm run
eval:selftest`, `npm run eval:qa:lint -- --stale --enforce-floors`, `npm run eval:qa:register --
--check`, `npm run secrets:scan -- --tree`, and the generated-file sync (every generator rerun; `git
status` shows only the intended files). One caveat: the first `npm test` run of the F sweep reported
2 failures that I did not capture; six full reruns afterwards were all green. I have no cause for
it. If it recurs, suspect the timing-sensitive adapter tests.

## State

- Item branch `np/3.2-per-source-status`: `8f6236db` (A to D), then one commit with step F, the
  Codex-follow-up tests, `CODEX-REVIEW.md`, the item folder (PLAN, REVIEW, briefs) and this file.
- Side branch `np/3.2-e-matchpartners` (`b4a74b8f`): step E as built, not pushed.
- Local setup, all gitignored: `.dev.vars` (stub names only), `env.d.ts`, `tmp/3.2-*`.

## Deviations from the plan

1. **Stopped at E7** on the stop rule; E6, E8 and E9 were not done. The lead then split the item:
   this pull request ships A to D and F, and step E is held on a side branch (above). The plan's
   step F changed accordingly: the `matchPartners` TODO bullet stays (rewritten), the narrower-skill-scrub
   TODO line is dropped, and no `matchPartners` text leaves the TODO.
2. **Harness constants (side branch).** The plan lists `test/plain-operation-harness.test.mjs` only. The counts
   it asserts come from `eval/qa/plain-operation-harness.mjs` (`EXPECTED_OPERATION_COUNTS`,
   `EXPECTED_OPERATION_COUNT`, its header), so those changed to Scout 29 and 61.
3. **Extra count tests (side branch).** `test/live-cases.test.mjs:40` (callable 66 to 65), `test/super-spec.test.ts:246`
   and the two x-routing id lists in `test/catalog.test.ts` also had to change; the plan listed a
   subset.
4. **Required fields.** `OpLedgerCall.attempts` and `finalStatus`, and `ExecuteOutcome`
   `sourceSummary` and `errorName`, are required types as planned, so about 30 hand-built test
   fixtures gained them (mechanical edits in `test/server.test.ts`, `test/smoke/demo-tools.test.ts`
   and four ledger fixtures).
5. **Classifier on the load path.** On `loadRejected` only the syntax forms classify; every other
   message is `other`, including a `ReferenceError`-shaped one (finding 8). The plan text was ambiguous
   on whether the reference and type forms apply there too.
6. **Two non-adapter hint sentences not touched.** The `SERVICE ERRORS` block in
   `src/mcp/tools.ts` still says "inspect or retry the failures". It is outside this item's scope, but
   it sits against the new "do not retry" timeout hint; flagged for the lead.
