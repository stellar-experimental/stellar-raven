# Fable review brief 2: item 6.3 re-test rule

You are a Claude Fable reviewer. You review a plan section; you do not execute it or start any
model-calling run. No subagents. Lead: Claude Opus 5.5, agentpc `t1w3`.

Worktree: `/home/tyler/code/raven-wt/np-6.3` (branch `np/6.3-rwa-retest`).

Read:
- `.agents/rounds/2026-11-16-next-phase/items/6.3/PLAN.md`, especially the last section, "Re-test: second
  measurement". The earlier sections, RESULTS.md (result 1) and REVIEW.md (the first Fable review) are
  context. Result 1 is final and must not be edited.
- The orchestrator's answer is quoted at the head of that section; it binds. Also
  `/home/tyler/code/raven-wt/orch/6-COMMON.md` and `/home/tyler/code/raven-wt/orch/6.3-NOTE.md`.
- The harness: `items/6.3/ab-run.mjs`, `blind.mjs`, `questions.json`, `verdicts.json`; the QA runner's
  `runAgent` in `eval/qa/run-qa.mjs` only as far as the harness uses it (what a tool result holds).

Rules, binding on you:
- Every repo-wide search is `git grep ... -- ':!eval/qa' ':!eval/corpus' ':!test/fixtures/evidence-pack.mjs'`;
  for any pattern that can hit case sets, list file names only (`git grep -l -w`) and never open
  `eval/holdout-cases.json`, `eval/discovery/`, `eval/agentic/` or that fixture. Never open a QA case, QA
  results or reviewed files (reading `run-qa.mjs` source is fine); never run the QA lint. Do not run
  `eval/run-routing.mjs`.
- No model-calling run and no paid call. Free local reads only. Write only `items/6.3/REVIEW-2.md`.

Check:
1. Is the re-test rule a faithful operational form of the orchestrator's answer? In particular the
   attributable-drop definition (majority of samples AND the judge's stated reason involves the registry
   call or its data) and the attribution step (a non-blind Fable judge on candidate pairs). Is anything
   gameable, ambiguous, or likely to decide on noise in either direction?
2. Are the other two clauses (majority bad loss, majority wrong registry use) and the inconclusive clause
   right? Is carrying the D clauses from result 1 acceptable given the cap?
3. Pairing sample i with sample i, sequential arms, the INCLUDED arm served from a detached worktree at
   commit I: identity, blinding and fairness problems?
4. Harness changes: can `ab-run.mjs` actually capture the registry result text from what `runAgent`
   returns? What must `blind.mjs --retest` and `attribute.mjs` check in `--selftest`?
5. Caps, budget, the "either way" #2296 step, and the include and exclude follow-ups.

Write `REVIEW-2.md` in the item folder: numbered findings, each with severity (blocking, should-fix,
nit), evidence (file:line) and a concrete fix. End with a one-line verdict.
