# Item 6.2: Sonnet executor brief

You execute the reconciled plan for round item 6.2. You are a Claude Sonnet 5.5 lane on agentpc;
your parent is the 6.2 lead (`t1v9`). Worktree and cwd:
`/home/tyler/code/raven-wt/np-6.2`, branch `np/6.2-docs-titles`.

## Read first

- `/home/tyler/code/raven-wt/np-6.2/.agents/rounds/2026-11-16-next-phase/items/6.2/PLAN.md` (binding; the reconciliation table at its end is part of it) and `/home/tyler/code/raven-wt/np-6.2/.agents/rounds/2026-11-16-next-phase/items/6.2/REVIEW.md`.
- `AGENTS.md`, `/home/tyler/code/raven-wt/orch/6-COMMON.md`, `/home/tyler/code/raven-wt/orch/6.2-NOTE.md`.
- `.agents/rounds/2026-11-16-next-phase/items/6.1/PLAN.md` step 1 and `items/6.1/amend-split-v10.mjs` (step 1 precedent).
- The `herdr-core` skill contract (`hc --skill`) for children.

## Hard rules (repeat the first four in every brief you write for a child)

1. Every repo-wide search is `git grep ... -- ':!eval/qa' ':!eval/corpus'`. Never a bare `grep -r`.
2. Never open a QA case, `eval/qa/cases.json`, `sample.json`, `tool-cases.json`, or anything under
   `eval/qa/corpus/`, `eval/qa/results/` or `eval/qa/reviewed/`. Never run the QA lint.
   `amend-split-v11.mjs` prints only counts, a SHA-256 and its outcome word, never an id or note text.
3. Never print the stdout of `node eval/run-routing.mjs` or `npm run eval:routing`: redirect to
   `tmp/6.2/*.txt` and read totals from the result JSON with `node tmp/6.2-compare.mjs <base> <variant>`
   (holdout counts only). Holdout routing rows are counts only; tune nothing on them.
4. Never print a secret. Export the Mintlify key with `set -a; . ./.dev.vars; set +a` and no echo.
5. Spend: model-calling runs only through the subscription `claude` CLI as `hc` children, against
   your single local `npm run dev:eval`. No AI Gateway, Workers AI or provider API. Hold every cap
   in the plan.
6. Pre-registration: questions, rubric, scoring and rule are fixed by the step 2 commit. Do not
   change them after any answer exists. If something in them cannot work, stop and report to the
   lead before collecting.
7. Commits use the normal hooks, never `--no-verify`, and end with
   `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Do not push. No subagents: use
   `hc` children (dev server, three harness runs per arm, two judges) and `hc wait --children any`,
   never sleep-polling. A child in state `blocked` is on a dialog: read it with `hc read`; a Claude
   trust prompt is answered with `hc keys <t> down enter`. Kill and remove each child when done.
   Control only your own children.

## Task, phase 1 (now)

Carry out plan steps 1 to 6: split v11, pre-registration commit, HOLD arm, commit A and FRESH arm,
blind grading, scoring. Launch judges as in the plan, e.g.
`hc run --bg --name 6.2-judge-opus --cwd <judge dir> -- systemd-run --user --scope -q -p MemoryMax=8G -p MemorySwapMax=0 claude --model opus --effort high --dangerously-skip-permissions "<one line pointing at a brief file in that dir>"`
(and `--model fable` for the other). Write each judge brief into its own judge directory; it says
what to read (only packet.json and the live pages), the rubric, the output file, and to report
with `hc send <your terminal id> '<verdicts path>'`.

Write `/home/tyler/code/raven-wt/np-6.2/.agents/rounds/2026-11-16-next-phase/items/6.2/RESULTS.md` and start `/home/tyler/code/raven-wt/np-6.2/.agents/rounds/2026-11-16-next-phase/items/6.2/EXEC.md` (what you did, the step 2 commit SHA, a short summary
of each check and gate output, every deviation). Do not commit RESULTS.md or EXEC.md yet. Then run
`hc send t1v9 '/home/tyler/code/raven-wt/np-6.2/.agents/rounds/2026-11-16-next-phase/items/6.2/RESULTS.md'` and wait in your terminal for the lead. Phase 2 (plan
steps 7a or 7b and 8, then review reconciliation) comes as a message from the lead.

If you hit a stop condition in the plan, write what happened in EXEC.md and send its path instead.
