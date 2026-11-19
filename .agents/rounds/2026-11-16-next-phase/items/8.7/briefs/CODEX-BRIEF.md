# Item 8.7 Codex review brief

Read-only review of branch `np/8.7-playground-billing` in `/home/tyler/code/raven-wt/np-8.7` against
`origin/main` (`git diff origin/main...HEAD`). Make no model call and run no eval, Gateway or paid
command. Free offline commands (`npm test`, `node --check`, `--help`) are fine.

Context: `.agents/rounds/2026-11-16-next-phase/items/8.7/PLAN.md` (the reconciled plan),
`REVIEW.md`, `EXEC.md`, `probes/PROBE.md` in the same folder, and `/home/tyler/code/raven-wt/orch/8.7-NOTE.md`.

Review:
1. Code: `scripts/run-demo-model-gauntlet.mjs` (default matrix now derived from `DEMO_MODELS`; any
   reader of `DEFAULT_MODELS`, turn counts, port ranges, launch plan, tests that assumed three models)
   and `test/demo-model-config.test.ts`. Correctness and whether the test guards a literal creeping back.
2. Policy text against the code: `eval/EVALS.md` "Model-call billing", `eval/playground/README.md`,
   `.agents/skills/run-evals/SKILL.md`, the script headers, the `.agents/TODO.md` edits and the
   DECISIONS.md section. Flag any claim the code or records contradict (costs, caps, flags, turn
   counts, which questions go where), any contradiction between these documents, and any rule that
   would push a question onto AI Gateway that a subscription run decides as well, or the reverse.
3. Whether `test/model-call-billing.test.mjs` still passes its intent (no new provider endpoint,
   Gateway token, chat route string in skill Markdown, or AI SDK import outside the allowlist).
4. Whether Worker bytes change (`git diff origin/main -- src/ package.json package-lock.json wrangler.jsonc`).

Search rule: search with `rg --hidden -g '!.git' <pattern> [path]`. Never use `grep -r`, `git grep`,
`rg -u` or `--no-ignore`, an `rg -g` glob that matches a case file, or a shell glob over `eval/` or
`.agents/rounds/`. Never open a QA case file (`eval/qa/corpus/`, `cases.json`, `sample.json`,
`tool-cases.json`, eval/qa `results/` or `reviewed/`). Where `rg` is missing, use the `git grep`
exclusion pathspec that `eval/qa/README.md` ("Searching without reading case text") prints.

Write findings to `/home/tyler/code/raven-wt/np-8.7/tmp/8.7-CODEX-REVIEW.md`: a verdict (PASS or
CHANGES), then numbered findings with severity (blocking, should, nit), file:line evidence and a fix.
Name your model and effort at the top. Then run: hc send t1zn '/home/tyler/code/raven-wt/np-8.7/tmp/8.7-CODEX-REVIEW.md'
