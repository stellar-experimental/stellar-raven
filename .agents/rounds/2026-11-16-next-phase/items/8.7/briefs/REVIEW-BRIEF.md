# Item 8.7 plan review brief (Claude Fable)

You review the plan for round item 8.7 against the repository. Read-only: do not edit any file except
your report.

- Worktree: `/home/tyler/code/raven-wt/np-8.7` (branch `np/8.7-playground-billing`, from `origin/main` `48f034d3`).
- Plan: `/home/tyler/code/raven-wt/np-8.7/.agents/rounds/2026-11-16-next-phase/items/8.7/PLAN.md`.
- Orchestrator note (binds): `/home/tyler/code/raven-wt/orch/8.7-NOTE.md`; common rules: `/home/tyler/code/raven-wt/orch/7-COMMON.md`.
- Read `AGENTS.md`, `eval/EVALS.md` ("Model-call billing"), `eval/playground/README.md`,
  `.agents/skills/run-evals/SKILL.md` (sections 2 and 3), the headers of
  `scripts/run-playground-semantic-eval.mjs` and `scripts/run-demo-model-gauntlet.mjs`,
  `src/demo/model-config.ts`, `src/demo/prompt.ts`, `src/demo/budget.ts`, `test/demo-model-config.test.ts`,
  `test/model-call-billing.test.mjs`, the TODO items in `.agents/TODO.md` the plan names, and
  `research/audits/2026-11-09-playground-product-decision.md` and
  `research/audits/2026-11-10-playground-gpt61-terra-recheck.md`. The round's 8.6 records are in
  `.agents/rounds/2026-11-16-next-phase/items/8.6/`.

The owner's goal: "ensure there's the right balance there to ensure we can run fully accurate tests but
where subs can reasonably and accurately be used, do that". Judge value against accuracy.

Check in particular:

1. Is the question → path table complete and correct? Is any question kept on the Gateway that a
   subscription run would decide equally well, or moved to subscriptions where the Playground difference
   matters?
2. Is the accuracy check right about what differs between the CLIs and the Playground?
3. Is the sizing rule supported by the cited evidence, and proportionate?
4. Is the gauntlet default change (shipped tuple, derived from `DEMO_MODELS`) right, and its test
   change? Anything else that reads `DEFAULT_MODELS` or the Sonnet literal?
5. The tool-blindness probe: is the rule pre-registered tightly enough, and are the Grok and Codex
   commands the strongest real restriction in the installed versions (`grok --help`, `codex exec --help`,
   `codex features list` are offline and free)? Is the Codex `web_search` config key right? Do NOT run any
   model call: no `grok -p`, no `codex exec`, no `claude -p`.
6. Missing files, wrong facts, scope creep.

Search rule: search with `rg --hidden -g '!.git' <pattern> [path]`. Never use `grep -r`, `git grep`,
`rg -u` or `--no-ignore`, an `rg -g` glob that matches a case file, or a shell glob over `eval/` or
`.agents/rounds/`. Never open a QA case file (`eval/qa/corpus/`, `cases.json`, `sample.json`,
`tool-cases.json`, eval/qa `results/` or `reviewed/`).

Write numbered findings to
`/home/tyler/code/raven-wt/np-8.7/.agents/rounds/2026-11-16-next-phase/items/8.7/REVIEW.md`, each with a
severity (blocking, should, nit), the evidence (file:line), and a concrete fix. Then report the path as
your task line says.
