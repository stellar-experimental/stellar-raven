# Brief: Claude Fable review of the item 3.5 plan

You are the plan reviewer for round item 3.5. You run on agentpc in the worktree
`/home/tyler/code/raven-wt/np-3.5` (branch `np/3.5-small-fixes`). Read-only: change no file except
the review file below, and scratch files under the worktree's `tmp/`.

## Read

- `AGENTS.md`.
- The plan: `.agents/rounds/2026-11-16-next-phase/items/3.5/PLAN.md`.
- The orchestrator note that binds scope: `/home/tyler/code/raven-wt/orch/3.5-NOTE.md`.
- Item 3.5 in `.agents/rounds/2026-11-16-next-phase/PLAN.md`, and `DECISIONS.md`.
- `.agents/TODO.md`: "Point the fingerprint gate failure at the fingerprint only", "Close the
  all-capitals date gap in the identifier token", "Rename the micro-map files for what they emit".
- Code: `test/run-routing-manifest-evidence.test.mjs`, `eval/run-routing.mjs` (gate evidence and
  output), `eval/self-test.mjs`, `src/policy/identifier-token.ts`, `exactRowsOf` in
  `src/executor/providers.ts`, `test/identifier-token.test.ts`, `test/executor-providers.test.ts`,
  `test/replay-exact-rows.test.ts`, `scripts/build-micro-map.mjs` and every file that names it,
  `.github/workflows/ci.yml`, `.github/workflows/refresh.yml`, `eval/report-live-surface.mjs`,
  `eval/lib/mcp-surface.mjs`, `src/catalog/README.md`, `src/mcp/tools.ts`.

## Held-out rule (binding)

Do not run `npm run eval:routing` and do not open `eval/results/`, `eval/holdout-cases.json`, any
split file under `~/backups/`, or any stored run file under `/home/tyler/code/raven-wt/gca-eval/`.
You do not need them to review the plan. Do not start a server.

## Check

1. Every fact the plan states against the repository. Name each wrong one.
2. Step 1: does the projection stop every path by which `npm test` could print per-case rows on a
   fingerprint or gate failure? Is there another test in `npm test` or a CI step that leaks the same
   way? Is the re-baseline pointer right?
3. Step 2: is the lookbehind rule general, correct for the dates the TODO names, and safe for real
   identifier shapes? Any shape it wrongly drops or still wrongly reads? Is the differential test
   change sound?
4. Step 3: is the reference list complete (including CI path lists, generated headers, ambient
   declarations, skills, docs)? Is the new name right for what the files emit? Is the grep check the
   right "Done when"? Does the surface pin check prove the served hashes are unchanged?
5. Gates and stop rules: do they match the orchestrator note (per-lane totals against `main`,
   hit-to-miss rows, holdout ceiling 10 read as counts only, deploy only if Worker bytes change)?
   Is the replay gate runnable as written?
6. Anything missing, or anything the plan does that it does not need to (spend rule).

## Output

Write `.agents/rounds/2026-11-16-next-phase/items/3.5/REVIEW.md`: numbered findings, each with
severity (blocking, should-fix, nit), the evidence (file and line, or the command you ran), and a
proposed fix. End with a one-line verdict. Then report as your task line says.
