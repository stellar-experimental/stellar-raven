# Brief: Codex frontier review of item 3.2 (executor and adapter boundary)

You are the required independent reviewer (Codex frontier, `gpt-6-astra`, high) for round item
3.2. Worktree `/home/tyler/code/raven-wt/np-3.2`, branch `np/3.2-per-source-status`.

Review commit `8f6236db` (`git show 8f6236db`; base `origin/main`). Another agent may add a docs
commit on top while you work; review the code in `8f6236db`, and the later docs commit only if it
exists when you finish. Do not modify any tracked file. Write only
`/home/tyler/code/raven-wt/np-3.2/tmp/3.2-codex-review.md`.

## Context

- `AGENTS.md`; the plan `.agents/rounds/2026-11-16-next-phase/items/3.2/PLAN.md` (steps A to D;
  step E is held and not in this commit), its `REVIEW.md`, and `EXEC.md`.
- `@cloudflare/codemode` 0.5.1 sandbox wrapper: `node_modules/@cloudflare/codemode/dist/index.js`.

## Check

1. Security boundary: no secret, upstream body text, URL or argument value reaches a log event,
   span attribute, ledger field or model-facing text through `attempts`, `finalStatus`, `sources`,
   `errorName`, or the new timeout envelopes. `globalOutbound` stays `null`. The fetch wrapper
   passes `input` and `init` through unchanged (headers, `redirect: "manual"`, signal) and cannot
   be reached or replaced from sandbox code.
2. Timeouts: every Lumenloop and Scout path is bounded at 24 s including the body read; detection
   is by `signal.aborted`; no path multiplies the budget; Docs and stellar.org behavior unchanged
   apart from the shared constant.
3. Mintlify status: exhausted 5xx carries the last status; cleared after a later no-response
   failure; terminal, absent and success paths unchanged.
4. `finalStatus` and `sourceSummary`: correct for retries, the Docs `/index` retry and site probe,
   stellar.org redirects, guard refusals, missing keys, stalled bodies, concurrent calls in one
   script (per-call wrapper state must not be shared across calls), and skill-run calls. Fixed
   bucket keys only.
5. `errorName`: classification order and patterns, the load-rejection path, the timeout message,
   the runner-threw catches, and that it is computed from the raw message before hinting and
   redaction, with no message text logged.
6. Model-facing text: only the intended changes (the `http-5xx` reason, the timeout envelope and
   `[timeout]` reason).
7. Tests: do they prove the above, without real 24 s or 60 s waits? Anything flaky?

You may run `npm run typecheck`, `npm test`, and `npm run test:smoke` bare. No local server, no
model-calling eval, no paid call, no network except npm's own cache.

## Output

`tmp/3.2-codex-review.md`: numbered findings, each with severity (blocking, should-fix, low,
info), file:line evidence, and the fix. List what you checked with no finding. End with a one-line
verdict (PASS, PASS with fixes, or FAIL).
