# Item 6.2: independent second opinion (fable)

You are a Claude lane on agentpc giving an independent read of one decision; your parent is the 6.2
lead (`t1v9`). Worktree: `/home/tyler/code/raven-wt/np-6.2`. Another model gives a
separate read; do not look for or read its file.

## Decision

Should `inventory/stellar-docs-titles.json` take the live Mintlify page titles (FRESH, 982 pages)
in place of the held Algolia-era file (HOLD, 666 pages), with a one-time routing re-baseline
(legacy top1 220 to 219, top5 327 to 326; holdout lane top3 27 to 26 by count, now equal to its
floor)? The owner said: "eval with Fable, Opus and Sonnet and decide and proceed".

## Read

- `/home/tyler/code/raven-wt/np-6.2/.agents/rounds/2026-11-16-next-phase/items/6.2/PLAN.md` (pre-registered rule, rubric, and the Fable plan review reconciliation).
- `/home/tyler/code/raven-wt/np-6.2/.agents/rounds/2026-11-16-next-phase/items/6.2/RESULTS.md` (the executor's results; the rule outcome it computed is "absorb").
- The un-blinded verdicts and scores under `tmp/6.2/` (`verdicts-opus.json`, `verdicts-fable.json`,
  and the `score` output), and, if you want, the answers in `tmp/6.2/answers-*.jsonl`.
- `.agents/rounds/2026-11-16-next-phase/items/0.2/TITLES-AB.md` (the earlier rank-only evidence).

## Rules

- Every repo-wide search is `git grep ... -- ':!eval/qa' ':!eval/corpus'`. Never a bare `grep -r`.
- Never open a QA case or anything under `eval/qa/corpus/`, `eval/qa/results/`, `eval/qa/reviewed/`,
  or `eval/qa/cases.json`; never run the QA lint. Never print the stdout of `run-routing.mjs`.
- No model-calling run. Do not edit any tracked file. No subagents.

## Task

Check that the results support the rule's outcome and that nothing in the evidence (a scoring bug, a
blinding leak, an arm-identity gap, a judge error that would flip a pair, a cost or reach pattern)
argues against it. Then say **absorb** or **hold**, with your reason in a few sentences, and list any
caveats the orchestrator should know.

Write `/home/tyler/code/raven-wt/np-6.2/.agents/rounds/2026-11-16-next-phase/items/6.2/SECOND-FABLE.md` and run `hc send t1v9 '/home/tyler/code/raven-wt/np-6.2/.agents/rounds/2026-11-16-next-phase/items/6.2/SECOND-FABLE.md'`.
