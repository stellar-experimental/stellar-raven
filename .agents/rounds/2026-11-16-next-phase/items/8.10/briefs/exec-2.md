# Executor brief 2: two test timeouts (item 8.10, fix F4)

You are the Claude Sonnet executor for round item 8.10, second task. The lead is Claude Fable in
terminal `t20j`. Work only in `/home/tyler/code/raven-wt/np-8.10`, on branch `np/8.10-audit-8.9`.
The rules of [exec.md](exec.md) "Rules that bind" apply unchanged (search rule, no case text, no QA
lint, no subagents, no model call, normal commit hooks, no push).

## Why

CI run 44604472775 on this branch failed once: `test/qa-paired-verdict.test.mjs`, "runs reduced
deterministic operating-characteristic gates under npm test", "Test timed out in 5000ms" (5,098 ms).
The next run passed with no test change. The test does fixed CPU work (5,000 iterations) and has no
timeout of its own, so it runs under vitest's 5,000 ms default. Measured on agentpc (16 cores):

| Where | Duration of that test |
|---|---|
| Alone (`npx vitest run test/qa-paired-verdict.test.mjs`), 3 runs | 1,446 to 1,448 ms |
| Full suite on `cd9ea54b` (before PR #506), 3 runs | 3,009 to 3,154 ms |
| Full suite on this branch (after PR #506), 3 runs | 4,489 to 4,707 ms |

PR #506 made many subprocess tests run concurrently, so this test now runs under more load and sits
at 90% of the default timeout. The second-slowest test on the default timeout is
`test/find-uncited-golden-round-json.test.mjs`, "never leaks file content or case filenames across
all CLI output modes and honors --check": 3,393 ms in the full suite.

## The change

Give each of those two tests an explicit timeout of 30,000 ms, in the options-object form the
repository already uses (`it("name", { timeout: 30_000 }, () => { ... })`; for the `it.skipIf(...)`
test, the same options object as the second argument). Above each, one short comment: the test does
fixed work whose wall time depends on suite load, and the timeout only guards against a hang.
Change nothing else: not `iterations: 5_000`, not any assertion, not `vitest.config.ts`.

## Finish

1. Run, each bare, one command per call: `npx vitest run test/qa-paired-verdict.test.mjs test/find-uncited-golden-round-json.test.mjs`,
   then `npm run typecheck`, `npm test`, `npm run secrets:scan -- --tree`. Report each exit code.
2. Append a section "Second task (F4)" to `.agents/rounds/2026-11-16-next-phase/items/8.10/EXEC.md`:
   the two edits with file and line, and each gate's result in one line.
3. Commit on `np/8.10-audit-8.9` (this brief included), with the trailer
   `Co-Authored-By: Claude <Family> <version> <noreply@anthropic.com>` naming the model you are.
4. Run `hc send t20j '/home/tyler/code/raven-wt/np-8.10/.agents/rounds/2026-11-16-next-phase/items/8.10/EXEC.md'`.
