# Brief: Claude Fable review of the item 3.2 plan

You are the plan reviewer for round item 3.2. You run on agentpc in the worktree
`/home/tyler/code/raven-wt/np-3.2` (branch `np/3.2-per-source-status`). Read-only: change no file
except the review file below.

## Read

- `AGENTS.md`.
- The plan: `.agents/rounds/2026-11-16-next-phase/items/3.2/PLAN.md`.
- The orchestrator's note that binds the scope: `/home/tyler/code/raven-wt/orch/3.2-NOTE.md`.
- Item 3.2 in `.agents/rounds/2026-11-16-next-phase/PLAN.md` and `DECISIONS.md`.
- The TODO items the plan names in `.agents/TODO.md`.
- The code the plan touches: `src/adapters/*.ts`, `src/executor/providers.ts`,
  `src/executor/run.ts`, `src/mcp/tools.ts`, `src/policy/scout-exposure.ts`,
  `src/policy/source-basis.ts`, `scripts/exposure.mjs`, `scripts/description-notes.mjs`, and their
  tests under `test/`.

## Check

1. Every fact the plan states against the repository. Name each wrong one.
2. Whether each step achieves the decision with the least change, and whether anything in the
   note's scope is missing or anything outside it crept in.
3. The timeout-and-retry decision: can any path still exceed 24 s per operation call, or
   multiply the budget?
4. Per-source status: is the fetch-wrapper design correct (stalled bodies, redirects in
   stellar.org, the Docs `/index` retry and site probe, guard refusals, missing keys)? Does any new
   field leak into model-facing text or exceed a bounded telemetry size?
5. `errorName`: is the classification sound given that `@cloudflare/codemode` 0.5.1 returns only
   `err.message` from the sandbox (see `node_modules/@cloudflare/codemode/dist/index.js`)? Is there
   a cleaner structural source for the class that does not add a sandbox global or change
   model-visible text?
6. `scout.matchPartners` removal: does the plan reach every reference the ADR-0003 guards, the QA
   lint, and the routing gate will check? Is the routing-gate re-stamp rule right?
7. Tests: are they sufficient for the TODO's "done when", and do they avoid real 24 s waits?
8. Gates and the QA-case rule: confirm the plan never opens a QA case outside tuning.

## Rules

- **QA cases.** Never open a QA corpus case outside tuning, and never name which set a case is
  in. Do not read `eval/qa/corpus/` files, `eval/qa/cases.json` rows, or the split files.
- No model-calling eval, no paid call, no local server. Keyless reads of public upstreams are
  allowed but not needed.
- No subagents; no `hc` children.

## Output

Write `.agents/rounds/2026-11-16-next-phase/items/3.2/REVIEW.md`: a numbered list of findings,
each with severity (blocking, should-fix, nit), the plan step, the evidence (file:line), and the
fix you recommend. End with a one-line verdict. Then report as your launch line says.
