# Brief: Claude Fable read of the item 3.5 identifier-token change

The orchestrator note (`/home/tyler/code/raven-wt/orch/3.5-NOTE.md`) requires a Claude Fable read
of the identifier-token change's per-case evidence when it ships. It ships. You run on agentpc in
the worktree `/home/tyler/code/raven-wt/np-3.5` (branch `np/3.5-small-fixes`). Read-only: change no
file except the review file below, and scratch files under the worktree's `tmp/3.5-token-review/`.

## Read

- `AGENTS.md`; the plan `.agents/rounds/2026-11-16-next-phase/items/3.5/PLAN.md` (step 2 and the
  gates) and `EXEC.md` next to it (step 2, the routing and replay results, deviations 1 and 3).
- The change: `git show 7925540c` (the token rule, `ARCHITECTURE.md`, the unit and provider tests).
- Evidence files under `tmp/3.5/`: `replay-base.json`, `replay-head.json` (the exact-row replay,
  tuning rows only), `base-ranked.json`, `head-ranked.json` (routing dumps, no holdout lane), and the
  lane-total files the executor extracted with `jq` (list `tmp/3.5/` to find them). Do not open any
  `*routing*.log`, any file under `eval/results/`, `eval/holdout-cases.json`, any split under
  `~/backups/`, or anything under `/home/tyler/code/raven-wt/gca-eval/`.

## Check

1. Routing: confirm that nothing the PR changes reaches catalog search or `eval/run-routing.mjs`,
   that the two ranked dumps are byte-identical, and that the lane totals match (holdout as counts,
   forbidden captures at most 10). An empty per-case diff is the expected answer; say so plainly.
2. Replay: confirm the two reports are byte-identical, and run the old regex (`git show
   d306a3ca:src/policy/identifier-token.ts`) and the new one over every `query` string in the base
   report. List any query whose tokens differ (there should be none, or only date inputs).
3. The rule: is it correct for the dates it targets and safe for real identifiers? Are the pinned
   "known and accepted" shapes honest and complete enough? Is the differential test independent of
   the rule it checks?
4. Anything wrong in EXEC.md's account of step 2, including deviation 1 (split v6, 98 calls instead
   of 90) and whether it weakens the TODO's "Done when".

## Output

Write `.agents/rounds/2026-11-16-next-phase/items/3.5/REVIEW-TOKEN.md`: numbered findings with
severity (blocking, should-fix, nit), evidence (file and line, or the command you ran) and a fix.
End with a one-line verdict. Then report as your task line says.
