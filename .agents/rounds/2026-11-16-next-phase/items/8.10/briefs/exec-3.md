# Executor brief 3: two additions the orchestrator ordered (item 8.10)

You are the Claude Sonnet executor for round item 8.10, third task. The lead is Claude Fable in
terminal `t20j`. Work only in `/home/tyler/code/raven-wt/np-8.10`, on branch `np/8.10-audit-8.9`.
The rules of [exec.md](exec.md) "Rules that bind" apply, with two exceptions the orchestrator
ordered on 2026-11-19: this task edits the five dated lead briefs under `items/1.4/dated/` (one
flag each, nothing else) and one `eval/qa` module with its test. Make two commits, A then B.

## A. The Codex launch line in the five dated lead briefs

In each of these files, in the Codex launch line (the one that contains `codex --no-daemon`), add
`--dangerously-bypass-hook-trust` directly after `--no-daemon`. Change nothing else in them, not
even whitespace:

- `.agents/rounds/2026-11-16-next-phase/items/1.4/dated/2.1-LEAD.md`
- `.agents/rounds/2026-11-16-next-phase/items/1.4/dated/2.2a-LEAD.md`
- `.agents/rounds/2026-11-16-next-phase/items/1.4/dated/2.2b-LEAD.md`
- `.agents/rounds/2026-11-16-next-phase/items/1.4/dated/2.2c-LEAD.md`
- `.agents/rounds/2026-11-16-next-phase/items/1.4/dated/rehearsal-LEAD.md`

Check: `git diff --stat` shows five files, one line changed in each, and
`rg --hidden -g '!.git' -c 'codex --no-daemon --dangerously-bypass-hook-trust' .agents/rounds/2026-11-16-next-phase/items/1.4/dated`
prints 1 for each of the five. If a file has more than one `codex --no-daemon` line, stop and
report. Commit A: "dated briefs: Codex launches run the case-search hook (item 8.10)".

## B. Delete `partialRecoverySource` and `isHarnessTransportFailure`

Reason (orchestrator, 2026-11-19): their only caller,
`research/audits/2026-11-06-playground-final-resolution/orchestrate.mjs`, already cannot run,
because it passes `--confirm-paid` to `scripts/run-playground-semantic-eval.mjs` and PR #498 removed
that flag. Dated research records stay unchanged and keep their history in git.

1. `eval/qa/diagnostic-rejudge-source.mjs`: delete the exported functions
   `isHarnessTransportFailure` and `partialRecoverySource` with their doc comments. Then delete
   every import and module-level helper that nothing in the file uses any more. Keep
   `diagnosticRejudgeSource` and `diagnosticAnswerProblem` exactly as they are.
2. `test/diagnostic-rejudge-source.test.mjs`: delete the tests of those two functions and every
   fixture, helper and import that only they used. Keep every test of `diagnosticRejudgeSource` and
   `diagnosticAnswerProblem` unchanged.
3. Do not edit anything under `research/`. Its `orchestrate.mjs` will keep an import that no
   longer resolves; that is accepted.
4. `.agents/TODO.md`: delete the item "Decide whether `partialRecoverySource` stays" (heading to
   the line before the next heading). Touch nothing else there.
5. Check with `rg --hidden -g '!.git' -n 'partialRecoverySource|isHarnessTransportFailure' eval test scripts src .agents/TODO.md`:
   no match. Check that no other file under `eval/`, `scripts/`, `src/` or `test/` imported either
   name before you started (the lead found none); if one does, stop and report.
6. Gates, each bare, one command per call: `npx vitest run test/diagnostic-rejudge-source.test.mjs`,
   `npm run typecheck`, `npm test`, `npm run build`, `npm run eval:selftest`,
   `npm run secrets:scan -- --tree`. Report each exit code and the test totals. A test that pins a
   hash of `eval/qa/*.mjs` and now fails: stop and report it, do not re-pin it.
7. Commit B: "eval(qa): remove partialRecoverySource and isHarnessTransportFailure (item 8.10)".
   Include this brief in commit B.

## Finish

Append a section "Third task" to `.agents/rounds/2026-11-16-next-phase/items/8.10/EXEC.md` (in
commit B): the edits with file and line counts, the tests removed (count before and after in the
test file), the gates, and any deviation. Both commits end with the trailer
`Co-Authored-By: Claude <Family> <version> <noreply@anthropic.com>` naming the model you are. Do
not push. Then run
`hc send t20j '/home/tyler/code/raven-wt/np-8.10/.agents/rounds/2026-11-16-next-phase/items/8.10/EXEC.md'`.
