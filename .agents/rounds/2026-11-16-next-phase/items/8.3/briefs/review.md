# Item 8.3 plan review (Claude Fable, high)

You review a plan; you do not edit code. Worktree: `/home/tyler/code/raven-wt/np-8.3` (branch
`np/8.3-model-families`).

Read:
- `AGENTS.md`, `.agents/model-roster.md`, `.agents/skills/run-evals/SKILL.md`.
- `/home/tyler/code/raven-wt/orch/8.3-NOTE.md` (the item's goal and questions) and
  `/home/tyler/code/raven-wt/orch/7-COMMON.md` (binding rules).
- `.agents/rounds/2026-11-16-next-phase/DECISIONS.md` (owner answers to the item 8.2 questions,
  "Models").
- The plan: `.agents/rounds/2026-11-16-next-phase/items/8.3/PLAN.md`.

Check the plan against the repository, not against the plan's own claims:
1. Does it answer every question in 8.3-NOTE.md? Is any answer wrong?
2. Is its scan complete? Look for live files that pin a model version for a choice and are
   missing from the plan, and for files the plan edits that are really records.
3. Is the code design sound: the resolver, the resolved-ID capture in `eval/qa/run-qa.mjs`,
   `eval/qa/agent-result.mjs`, `eval/qa/judge.mjs`, the `--judge-stored` mixing guard, the
   stability-register flag, and `eval/discovery/run-agent-discovery.mjs`? Name smaller or safer
   designs where they exist. Read the relevant code.
4. The judge change from `claude-sonnet-5` to the latest Sonnet: is the handling right, and is
   anything else (stored artifacts, Playground contracts in `eval/playground/`, re-judge paths)
   broken by it?
5. Will anything change what the dated runs under `items/1.4/dated/` do?
6. Gates, stop rule and risks: anything missing?

Rules:
- Search only with `rg --hidden -g '!.git' <pattern> [path]`. Never use `grep -r`, `git grep`,
  `rg -u` or `--no-ignore`, an `rg -g` glob that matches a case file, or a shell glob over `eval/`
  or `.agents/rounds/`. Never open a QA case file (`eval/qa/corpus/`, `cases.json`, `sample.json`,
  `tool-cases.json`, `eval/qa/results/`, `eval/qa/reviewed/`).
- No model-calling eval, no paid call, no network writes. No subagents.
- Do not edit any file except your report.

Write findings to `.agents/rounds/2026-11-16-next-phase/items/8.3/REVIEW.md`: one numbered
finding each, with severity (blocker, should-fix, nit), the file and line evidence, and the change
you recommend. End with a verdict line. Then report with the hc send command in your task line.
