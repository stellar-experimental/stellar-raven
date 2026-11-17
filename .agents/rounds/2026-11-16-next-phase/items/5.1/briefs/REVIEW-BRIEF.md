# Brief: Claude Fable review of the item 5.1 plan

You are the plan reviewer for round item 5.1. You run on agentpc in the worktree
`/home/tyler/code/raven-wt/np-5.1` (branch `np/5.1-remove-matchpartners`). Read-only: change no
file except the review file below, and scratch files under the worktree's `tmp/5.1-review/`.

## Read

- `AGENTS.md`.
- The plan: `.agents/rounds/2026-11-16-next-phase/items/5.1/PLAN.md`, and `QUESTION.md` next to it.
- The orchestrator note that binds scope: `/home/tyler/code/raven-wt/orch/5.1-NOTE.md`, and items
  B and G of `/home/tyler/code/raven-wt/orch/EVAL-FABLE.md`.
- `.agents/rounds/2026-11-16-next-phase/DECISIONS.md` (decisions 2 and 4).
- The earlier attempt: `.agents/rounds/2026-11-16-next-phase/items/3.2/EXEC.md` (step E) and
  `git show --stat b4a74b8f` (read its diff freely; it is a reference, not a base).
- Skills: `run-evals` (section 6), `improvements-pipeline`, `golden-truth` (only what bears on a
  `surface`-only edit).
- Code and data: `src/policy/scout-exposure.ts`, `scripts/exposure.mjs`, `scripts/README.md`,
  `eval/gates.json`, `eval/run-routing.mjs`, `src/mcp/tools.ts`, `eval/qa/split-amend.mjs`,
  `eval/qa/tuning-rows.mjs`, `eval/qa/lint-corpus.mjs` (`lintSurface`),
  `.agents/rounds/2026-11-16-next-phase/items/3.5/amend-split-v7.mjs` and `FOLLOWUP.md`,
  `items/1.4/dated/` (how the briefs, PRESTAGE.md and sibling-check pin the split),
  `improvements/README.md`, `improvements/intake.json`, `.agents/TODO.md`.

## Held-out rule (binding)

- Do not run `npm run eval:routing`, and do not open `eval/results/`, `eval/holdout-cases.json`,
  `eval/qa/cases.json`, any file under `eval/qa/corpus/`, any split file under `~/backups/`, or
  `tmp/5.1/`. You do not need them to review the plan.
- Do not run `npm run eval:qa:lint` (it can print case ids and golden text).
- Do not start a server. No model-calling or paid command.
- Never post anything upstream.

## Check

1. Every fact the plan states against the repository. Name each wrong one.
2. Commit order: does each commit pass its own gates (C2 before C3 for the QA lint; C1 before C2)?
3. C1: is the amendment design sound against `amend-split-v7.mjs` and `split-amend.mjs`? What else
   asserts the tuning count (tests, scans, dated briefs)? Does anything keep the id out of tracked
   files and logs?
4. C3: is the edit list complete against `b4a74b8f` and the current tree? Look for generated files,
   docs that state operation counts as current behaviour, skills, and tests. Is the rebuild order
   right per `scripts/README.md`? Can the comparison script read every non-holdout lane without
   touching `holdoutCases`, given the real results-file shape? Is the `gates.json` edit set right
   (fields, `holdoutNote`, `baselinedAt`, `localTrace`, provenance) per `run-evals` section 6 and
   the note?
5. C4: the exact strings, and any test or snapshot that pins them.
6. C5: is the finding legitimate given that the live OpenAPI documents the 503 `unavailable`
   contract? Is the recommendation the smallest correct one for the Scout owner? Is the filing
   sequence right per the skill (commit before an immutable snapshot link, `--dry-run`, index,
   lint)? Is the TODO rewrite right?
7. Gates and stop rules: do they match the note? Is any gate missing for the areas touched?
8. Anything missing, or anything the plan does that it does not need to (spend rule).

## Output

Write `.agents/rounds/2026-11-16-next-phase/items/5.1/REVIEW.md`: numbered findings, each with
severity (blocking, should-fix, nit), the evidence (file and line, or the command you ran), and a
proposed fix. End with a one-line verdict. Then report as your task line says.
