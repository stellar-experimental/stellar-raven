# Follow-up 3 for the item 3.2 executor: reconcile the Codex review

The required Codex frontier review is in `.agents/rounds/2026-11-16-next-phase/items/3.2/CODEX-REVIEW.md`
(commit it with your next commit). Verdict PASS, one low finding. Adopt it after follow-ups 1 and 2:

1. An interleaved pair of concurrent calls through `buildOpsFns` (deferred promises, different
   statuses and retry counts); assert each ledger row's `attempts` and `finalStatus`.
2. Extend the pass-through test to assert the authorization header, the POST body, and
   `redirect: "manual"` (a stellar.org hop) reach the underlying fetch unchanged.
3. A stalled-body case through `buildSandbox` (or `buildOpsFns`) that pins
   `finalStatus: "timeout"` on the ledger row, with the shortened abort signal.
4. In the existing skill-run smoke (`test/smoke/executor.test.ts` near `:1352`), assert
   `outcome.sourceSummary`.

No long waits. Re-run `npm test` and `npm run test:smoke` bare. In EXEC.md, add a "Codex review"
section that maps the finding to these tests. Commit, then report as before.
