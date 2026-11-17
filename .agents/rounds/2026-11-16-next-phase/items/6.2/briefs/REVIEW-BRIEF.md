# Item 6.2: Fable plan review brief

You review the item 6.2 plan before anything runs. You are a Claude Fable lane on agentpc; your
parent is the 6.2 lead (`t1v9`). Worktree: `/home/tyler/code/raven-wt/np-6.2`.

## Read

- `/home/tyler/code/raven-wt/np-6.2/.agents/rounds/2026-11-16-next-phase/items/6.2/PLAN.md` (the plan under review).
- `AGENTS.md`; `/home/tyler/code/raven-wt/orch/6-COMMON.md` and `/home/tyler/code/raven-wt/orch/6.2-NOTE.md` (binding notes).
- `.agents/rounds/2026-11-16-next-phase/DECISIONS.md`, the 0.2 record `items/0.2/TITLES-AB.md`,
  and the 6.1 split amendment (`items/6.1/PLAN.md` step 1, `items/6.1/amend-split-v10.mjs`).
- `.agents/skills/run-evals/SKILL.md`, `eval/README.md`, `eval/gates.json`, `eval/qa/run-qa.mjs`
  (`runAgent`, `buildAgentSpawn`, `isRetryableAgentFailure`, the `isMain` guard), `scripts/build-catalog.mjs`
  (`stellarDocsTitleExtras`), `scripts/refresh-inventory.mjs`, `scripts/summarize-live-drift.mjs`.

## Rules for you

- Every repo-wide search is `git grep ... -- ':!eval/qa' ':!eval/corpus'`. Never a bare `grep -r`.
- Never open a QA case, `eval/qa/cases.json`, `sample.json`, `tool-cases.json`, or anything under
  `eval/qa/corpus/`, `eval/qa/results/` or `eval/qa/reviewed/`. Never run the QA lint.
- Never print the stdout of `node eval/run-routing.mjs` (it prints the holdout table). If you run it,
  redirect to `tmp/6.2/review-*.txt` and read totals from the result JSON with
  `node tmp/6.2-compare.mjs <base.json> <variant.json>` (prints holdout counts only).
- No model-calling run, no paid call. Free local reads and keyless public fetches are fine.
- Do not edit the plan or any tracked file. No subagents; work yourself.

## Task

Check the plan against the repository and the binding notes. Look hardest at:

1. The decision rule: is it sound, pre-registerable, and free of a flaw that would make the outcome
   foregone or arbitrary? Is the "clear regression" definition workable? Is the missing-pair rule right?
2. Blinding and judge independence (no judge grades a comparison it answered in; nothing in a packet
   reveals the arm).
3. Question selection: the handling of the holdout lost row, confirmation-only rows, the neutral
   controls, the reference pages (fetch them; are they live and right for the question?).
4. Whether the harness reuse of `runAgent` works as described (exports, neutral cwd, isolation,
   budget flag), and whether arm identity is really proven.
5. The re-baseline numbers and fields in step 6a against `gates.json` and the run-evals rule, and
   the text edits in 6a/6b (anything missed that describes the hold?).
6. Spend: caps, estimate, stop rule.

Write `/home/tyler/code/raven-wt/np-6.2/.agents/rounds/2026-11-16-next-phase/items/6.2/REVIEW.md`: numbered findings, each with severity (blocking / should-fix / nit), the
evidence (file:line or a command result), and the change you propose. End with a one-line verdict.
Then run `hc send t1v9 '/home/tyler/code/raven-wt/np-6.2/.agents/rounds/2026-11-16-next-phase/items/6.2/REVIEW.md'`.
