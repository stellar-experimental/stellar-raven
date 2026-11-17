# Brief: Claude Fable review of the item 3.3 plan

You are the plan reviewer for round item 3.3. You run on agentpc in the worktree
`/home/tyler/code/raven-wt/np-3.3` (branch `np/3.3-ranker-mechanisms`). Read-only: change no file
except the review file below.

## Read

- `AGENTS.md`.
- The plan: `.agents/rounds/2026-11-16-next-phase/items/3.3/PLAN.md`, and the instruments next to it
  (`measure.mts`, `compare-routing.mjs`, `probe-queries.json`).
- The orchestrator note that binds the scope: `/home/tyler/code/raven-wt/orch/3.3-NOTE.md`.
- Item 3.3 in `.agents/rounds/2026-11-16-next-phase/PLAN.md`, and `DECISIONS.md`.
- In `.agents/TODO.md`: "Treat stellar.org routing reach as a lexical and description question" and
  "Re-check the upstream codemode short-token repair".
- Evidence: `.agents/rounds/2026-11-15-tuning-loop-2/STEP-2-REVIEW.md` (S3),
  `research/audits/2026-09-17-routing-audit/scorer-followup-plan.md`,
  `research/audits/2026-11-14-family-decider.md`.
- Code: `src/catalog/vendor/search-scoring.ts`, `src/catalog/scoring.ts`, `src/catalog/search.ts`
  (`searchCatalogPage` and the helpers it calls), `src/catalog/README.md`, `eval/run-routing.mjs`,
  `eval/lib/grade.mjs`, `eval/gates.json`, and `test/scoring.test.ts`, `test/search.test.ts`.

You may run the two instruments on `main` code (they are in-process, free, and print counts or
public probe rows). Do not run `npm run eval:routing` without redirecting its output to a file: it
prints holdout rows to the console. Read only its `GATE` line.

## Check

1. Every fact the plan states against the repository. Name each wrong one.
2. M1 and M2 as written: does each implement the round plan's mechanism faithfully, with no hidden
   variant or tuned choice? Is M2's placement, pool, victim, candidate, quota and one-swap rule
   precise enough that two implementers would write the same code? Name any ambiguity.
3. The pass rule: does the plan's operational form match the round plan and the orchestrator note?
   Is the effect criterion (rule 5) justified? Is the holdout read counts-only everywhere?
4. The instruments: is `measure.mts` a correct measure of displacement, off-golden reach and FAM
   reach? Does `compare-routing.mjs` count hit-to-miss correctly, gate the right lanes, and never
   print a holdout or confirmation-only row id?
5. Branch and commit plan: are the two mechanisms measured alone, and the combination measured, as
   the note requires? Is the re-baseline rule right under `eval/gates.json`'s own rule?
6. Anything missing: tests, docs, the vendor header, TODO edits, the cs-001 finding.

## Rules

- **QA cases.** Never open a QA corpus case outside tuning, and never name which set a case is
  in. Do not read `eval/qa/corpus/` files, `eval/qa/cases.json` rows, or the split files. Never read
  holdout routing rows (`eval/holdout-cases.json` row content or per-row output).
- No model-calling eval, no paid call, no local server.
- No subagents; no `hc` children.

## Output

Write `.agents/rounds/2026-11-16-next-phase/items/3.3/REVIEW.md`: a numbered list of findings,
each with severity (blocking, should-fix, nit), the plan section, the evidence (file:line), and the
fix you recommend. End with a one-line verdict. Then report as your launch line says.
