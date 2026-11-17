# Brief: Claude Fable per-case review of item 3.3

You are the per-case reviewer the orchestrator note requires for round item 3.3. You run on agentpc
in the worktree `/home/tyler/code/raven-wt/np-3.3` (branch `np/3.3-ranker-mechanisms`). Read-only:
change no file except the review file below.

## Read

- `AGENTS.md`, `/home/tyler/code/raven-wt/orch/3.3-NOTE.md`.
- In `.agents/rounds/2026-11-16-next-phase/items/3.3/`: `PLAN.md` (binds), `QUESTION.md`,
  `MEASURE.md`, `EXEC.md`, and any `*.patch`.
- The shipped diff: `git diff origin/main...HEAD`, and each local measurement branch's diff
  (`git diff <base commit>..np/3.3-prefix-floor`, `..np/3.3-slot-keeping`), base commit per EXEC.md.

You may re-run `measure.mts` and `compare-routing.mjs` as PLAN.md "Measurement" says. If you run
`npm run eval:routing`, redirect its output to a file and read it only with `sed -n '/^GATE/,$p'`.
Never open `eval/results/routing-*.json` yourself.

## Check

1. Each mechanism's code does exactly what PLAN.md states, no more (no variant, no tweak after the
   reading). Compare the measured code with the shipped code.
2. Every per-case change the `--lists` output names: is each gain real (the new card fits the
   question) and each order change harmless? Read every extended hit-to-miss id. Name any row whose
   change is a loss the counts hide.
3. The verdict per mechanism against each pass rule, from the recorded numbers. Re-derive at least
   one mechanism's numbers yourself.
4. Re-pinned tests: does each fall under rule 6's re-pin clause, or is it a hidden loss?
5. Records: TODO text (cause 1 sentence, floor-3 failure next to the prefix-floor result), docs,
   `eval/gates.json` edits if any, cs-001 if the floor shipped.

## Rules

- **Holdout and QA.** Never read holdout routing rows (`eval/holdout-cases.json` row content or
  per-row output); holdout results are counts only. Never open a QA corpus file, an
  `eval/qa/cases.json` row or a split file. Never name a confirmation-only row.
- No model-calling eval, no paid call, no local server. No subagents; no `hc` children.

## Output

Write `.agents/rounds/2026-11-16-next-phase/items/3.3/CASE-REVIEW.md`: numbered findings with
severity (blocking, should-fix, nit), evidence and fix, and a one-line verdict per mechanism. Then
report as your launch line says.
