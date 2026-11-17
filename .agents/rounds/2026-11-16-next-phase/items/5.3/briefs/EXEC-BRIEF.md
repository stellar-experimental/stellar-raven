# Sonnet execution, item 5.3

You carry out the reconciled plan and commit on the item branch.

- Worktree: `/home/tyler/code/raven-wt/np-5.3` (branch `np/5.3-lint-no-golden-text`). Work only here.
- Plan: `.agents/rounds/2026-11-16-next-phase/items/5.3/PLAN.md` (reconciled with `REVIEW.md` in the
  same folder). Scope: `NOTE.md` in the same folder binds over the plan.
- Rules: `AGENTS.md`.

## Held-out integrity (binding on you)

- Never run `npm run eval:qa:lint`, `node eval/qa/lint-corpus.mjs`, `npm run eval:qa:compile`, or any
  lint lane, `npm run eval:qa:register` or `npm run eval:selftest` against the real corpus with
  output reaching your screen, a pipe (`tail`, `grep`, `head`), or a file anyone reads. The one
  exception is plan step 7, the counting script, run as the plan and NOTE.md describe.
- Never open, cat, grep or list the contents of anything under `eval/qa/corpus/`,
  `eval/qa/cases.json`, `eval/qa/sample.json`, `eval/qa/tool-cases.json`, `eval/qa/results/` or
  `eval/qa/reviewed/`. Grep only named source, test and workflow files, never the whole repo or
  `eval/` recursively. Your step 7 script may read the corpus; you may not print what it reads.
- `npm test` runs fixtures only, and is safe. If a test fails, read the failing test's output only
  after checking that its name is a lint fixture test, not a real-corpus test; if any test output
  quotes a real case's golden text, stop.
- If you see golden text anyway, stop. Write the moment, the channel and the number of cases that
  may be seen into `EXEC.md`, and report. Do not look further to find out which.

## Do

1. Plan steps 1 to 6 in order. Tests first: run the new tests against the untouched source and
   record per test that each fails, before touching `eval/qa/*.mjs`. No `git stash`.
2. Gates, run bare: `npm run typecheck`, `npm test`, `npm run build`, `npm run secrets:scan -- --tree`.
3. Commit the code, tests, README and TODO change with the normal hooks, never `--no-verify`. End
   the message with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Do not push.
4. Plan step 7. Write the script to `/tmp/claude-1000/np-5.3-count/count.mjs` (not the repo), its
   output file under `/tmp/claude-1000/np-5.3-count/`. Run the positive control on the marker
   fixture root first. Then **stop and get the lead's go**: run
   `hc send <lead terminal from your launch line> 'script ready: /tmp/claude-1000/np-5.3-count/count.mjs'`
   and end your turn. The lead reads the script and replies `go` (or with changes) in your terminal.
   Only after `go`, run it once on the real corpus. If a count is not 0, fix the site from source
   (never by reading the output file), commit, and re-run.
5. Write `.agents/rounds/2026-11-16-next-phase/items/5.3/EXEC.md`: what you did, the sites changed,
   the new test names and their per-test result on the untouched source, a short summary of each
   gate's output, the step 7 printout verbatim (integers and lane names only), confirmation that
   the output file was deleted, and any deviation from the plan with its reason. Commit it.

## Limits

No model-calling eval, no paid call, no upstream post, no push, no PR, no local server. No subagents.

Then run the report command from your launch line.
