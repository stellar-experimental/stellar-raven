# Item 3.5 report

Lead: Claude Opus 5.5, agentpc `t1ss`. Branch `np/3.5-small-fixes`.

## Pull request and result

[#465](https://github.com/stellar-experimental/stellar-raven/pull/465), open and not merged. It
holds four changes, one commit each, plus one reconciliation commit:

1. **Fingerprint failure output.** The `gates.json` fingerprint test no longer passes the raw
   runner output to an assertion. A failure prints only the `GATE FAIL` lines, which name the input,
   both hashes and the re-baseline procedure. Tests cover both mismatch paths.
2. **All-capitals dates.** A date joined to the token by `-` or `.` no longer reads as an identifier
   token (`10-SEP-2024`, `2024-SEP-10`, `10-SEP-24`). Two accepted cases are pinned in tests and
   named in the module comment:
   - Dates joined by a space or slash still read as identifiers (an accepted false mark).
   - A token directly after a digit and a dash is dropped (an accepted missed mark).
3. **Rename.** The micro-map generator is renamed `family-text`. The served hashes and the guard
   text are unchanged: the in-process hashes are unchanged, the live pin `42ec6102…f17f` held, and
   the generated files differ only in their header.
4. **Doc fix.** `src/catalog/README.md` states the public `search` default as 7.

The routing gate passes at exit 0. Every lane total and the ranked dump are identical to `main`.
Holdout was read as counts only: forbidden captures 10 against a ceiling of 10. The token module is
not in the routing import closure, so the per-case routing diff was expected to be empty, and it
was. The 98-call exact-row replay is byte-identical between base and head.

I re-ran these gates bare on the final commit:

- `npm run typecheck`, `npm test` (3,725 passed, 3 expected fail), `npm run build` and
  `npm run secrets:scan -- --tree` pass.
- On `abc45f4f`, `npm run test:smoke`, `npm run eval:selftest`,
  `npm run eval:qa:lint -- --stale --enforce-floors` (0 errors, 98 known warnings),
  `npm run eval:qa:register -- --check` and `npm run eval:routing -- --gate` also pass. The
  reconciliation commit changed only comments and tests.

Reviews: Claude Fable 5.2 reviewed the plan (15 findings, all adopted), and Claude Fable 5.2 read
the token change as the note requires (no blocking finding, 6 findings, all adopted). The executor
was Claude Sonnet 5.5. USD 0.

## Deploy

**Needed: the Worker bytes change.** The token rule is runtime code. Production checks after
deploy:

- The landing page returns 200.
- `/mcp` returns 401 with `Bearer`.
- `node eval/report-live-surface.mjs --url <production> --expect-sha256 42ec61020a5f38c73ac30eb204ff424f30220f68ee3827373071c077ada8f17f`
  passes. It needs `RAVEN_MCP_BEARER_TOKEN`.

## For the orchestrator on the Mac

- Merge #465 and deploy.
- **Incidental exposure, mine.** I ran the QA lint gate and then ran `tail -2` on its log. The
  output showed one lint warning with a corpus case id and the numeric
  amounts in its golden. The id is not in this tracked file; it is in the untracked
  `/home/tyler/code/raven-wt/np-3.5/tmp/3.5/EXPOSURE.md`. I do not know which set the case is in, and I have not checked. I
  used nothing from it. If the case is held-out or reserve, deciding whether to move it is yours,
  as in item 1.4. No other case content was read by me or my children. The executor's split trials
  (v2 to v5) failed on the test's count check before any row was read.

## Open questions for the owner

None.

## Follow-up recorded

- New TODO item: "Stop the routing gate run from printing the holdout rows". The runner prints the
  holdout per-case table on every `--gate` run, CI included.
