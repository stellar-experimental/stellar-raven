# Brief: Claude Fable review of the item 3.4 plan

You are the plan reviewer for round item 3.4. You run on agentpc in the worktree
`/home/tyler/code/raven-wt/np-3.4` (branch `np/3.4-execute-boundary-read`). Read-only: change no
file except the review file below, and scratch files under the worktree's `tmp/`.

## Read

- `AGENTS.md`.
- The plan: `.agents/rounds/2026-11-16-next-phase/items/3.4/PLAN.md`.
- The orchestrator note that binds scope and the held-out rule: `/home/tyler/code/raven-wt/orch/3.4-NOTE.md`.
- Item 3.4 in `.agents/rounds/2026-11-16-next-phase/PLAN.md`, and `DECISIONS.md`.
- `.agents/TODO.md` "M2: execute boundary of 4,000 tokens against 6,000".
- Code: `src/policy/truncate.ts`, `src/policy/source-basis.ts`, `src/executor/run.ts` (result
  assembly around `truncateForModel`), `src/mcp/tools.ts` (the `execute` description and the
  handler's result blocks), `src/server.ts` (how the variable reaches the runner), `src/demo/tools.ts`,
  `wrangler.jsonc`, `eval/qa/tuning-rows.mjs`.
- Prior method: `.agents/rounds/2026-10-12-call-pattern-triage.md` (misread classes) and
  `.agents/rounds/2026-10-12-call-pattern-triage/count-patterns.mjs`.

## Held-out rule (binding)

Stored run files under `/home/tyler/code/raven-wt/gca-eval/eval/qa/results/` hold tuning, held-out
and reserve rows together. If you open one, select rows by id against `sets.tuning` of
`~/backups/gca-2026-11-14-split-v6.json` before reading any other row field. Never print, count by
set name, or name the set of a non-tuning row. Never write in `gca-eval` or run git there. You do
not need to run the read; checking the plan's stated layout on a tuning row or two is enough.

## Check

1. Every fact the plan states against the repository and the stored files. Name each wrong one.
2. The read method (steps 2 to 4): does it measure what the TODO and the note ask, "cited facts
   that sit only past the cut"? Is the value-region parse right for every host block the handler
   can emit? Is the kept-corpus rule (host blocks kept, other results counted) faithful to what the
   model would have seen at 16,000 or 18,000? Is the Grok-clip simulation right?
3. The candidate extractor (step 3): does it miss a class of cited fact that matters, or admit noise
   that step 5 cannot handle at reasonable effort?
4. The stop rule (step 6): does it match the round plan and the note ("no cited fact ... sets the
   boundary; many ... keeps 6,000 and closes M2")? Is the middle case handled honestly? Is the unit
   right, given several runs repeat the same tuning rows?
5. Step 8, the conditional change: complete? Every place that states the cap to the model, docs,
   tests, the demo path, smoke tests, and the security invariant in `truncate.ts`.
6. The recount (step 7): are the class definitions precise enough to count the same way twice?
   Is the sample the right one?
7. Anything missing, or anything the plan does that it does not need to (spend rule).

## Output

Write `.agents/rounds/2026-11-16-next-phase/items/3.4/REVIEW.md`: numbered findings, each with
severity (blocking, should-fix, nit), the evidence (file and line, or the command you ran), and a
proposed fix. End with a one-line verdict. Then report as your task line says.
