# Item 3.2 report

Lead: Claude Opus 5.5, agentpc `t1s9`. 2026-11-17.

## Pull request and result

[#462](https://github.com/stellar-experimental/stellar-raven/pull/462), branch
`np/3.2-per-source-status`, three content commits plus this report. Not merged.

- **Per-source status.** `attempts` and `finalStatus` on every `op` event and ledger row. `sources`
  (per service, fixed buckets) on `execute` and `demo-execute`.
- **Mintlify.** An exhausted 5xx keeps its last status (`http-5xx`).
- **Timeouts.** Lumenloop and Scout get a 24 s per-call timeout that covers the body read.
  Decision: 24 s is one budget per operation call, never per attempt. `OPERATION_BUDGET_MS` is now
  shared by all four adapters.
- **`errorName`.** `SyntaxError`, `TypeError`, `ReferenceError`, `timeout` or `other` on
  `execute`, `demo-execute` and the span.
- **`scout.matchPartners`.** Kept exposed by your answer. The TODO records the measurement and the
  one-line change that recreates the removal.
- **Reviews.** Fable plan review: 19 findings, all adopted. Codex frontier (`gpt-6-astra`, high)
  boundary review: PASS, with 1 low finding (test coverage), adopted.
- **Gates.** All bare and green on the final tree: typecheck, test (run twice), build, smoke,
  routing gate, eval selftest, QA lint, register check, secrets scan.

## Deploy

**Needed.** The Worker bytes change (adapters, executor, event fields). The catalog and manifest
do not change.

## Production checks after the deploy

1. Landing returns 200 and `/mcp` returns 401 `Bearer`, as in earlier items.
2. One authenticated `execute` that calls `stellarDocs.search_docs` and `scout.getPartners`. In
   Workers Logs:
   - each `op` event carries `attempts` (1 for each) and `finalStatus` `"200"`;
   - the `execute` event carries `sources.stellarDocs` and `sources.scout` with
     `finalStatus.2xx: 1`, and `errorName: null`.
3. One `execute` with `return undefinedName;`. The `execute` event has `errorName:
   "ReferenceError"`, `ok: false`, and no message text in any new field.
4. Optional: one `scout.matchPartners` call. Its `op` event shows `finalStatus` `"503"`, and the
   `execute` event shows `sources.scout.finalStatus.5xx: 1`.

## For the orchestrator on the Mac

Merge and deploy. Nothing else needs the Mac.

## Cleanup on agentpc (the lead's, after merge)

- The local branch `np/3.2-e-matchpartners` (`b4a74b8f`, never pushed) can be deleted when the
  worktree is cleaned up. The TODO bullet and EXEC.md record what it held.
- The worktree `/home/tyler/code/raven-wt/np-3.2` and the branch `np/3.2-per-source-status`.

## Notes and open questions

- **Owner (low).** The `SERVICE ERRORS` block in `src/mcp/tools.ts` still tells the model to
  "inspect or retry the failures". The new timeout hint says "do not retry it in this script". The
  specific hint should win, but the general sentence could name the exception. I left it because
  it is outside this item's scope.
- **Holdout headroom.** The holdout lane sits exactly at its forbidden-capture ceiling (10 of 10).
  Any catalog change that adds one capture trips it. Future exposure changes will hit the same
  wall.
- **Unexplained flake.** The executor saw one `npm test` run with 2 failures that it did not
  capture. Six of its reruns and two of mine were green. If it recurs, suspect the
  timing-sensitive adapter tests.
- **Untracked by `errorName`.** A script that throws a non-Error is recorded as `ok: true` by
  `@cloudflare/codemode`, so `errorName` never sees it. This is in the TODO.
