# Item 8.6 diff review (Codex, Sol, high)

Review the diff `git diff origin/main...HEAD` in `/home/tyler/code/raven-wt/np-8.6` (branch
`np/8.6-subs-first`). Read `AGENTS.md`, the plan
`.agents/rounds/2026-11-16-next-phase/items/8.6/PLAN.md`, its `REVIEW.md` and `EXEC.md`, and the
binding note `/home/tyler/code/raven-wt/orch/8.6-NOTE.md`.

Look for: correctness bugs in `assertClaudeSubscription` and its six call sites (wrong env passed,
check after a paid call, a path that skips it, a leak of the status body); anything that breaks reading
stored `gateway-rejudge-v1` receipts; a guard test that can pass vacuously or flag the wrong files;
docs that contradict the code or each other (AGENTS.md, eval/EVALS.md "Model-call billing", run-evals
skill, roster, TODO); a live reference to a removed file; and any eval, test or build path that still
calls AI Gateway, Workers AI or a provider API without being a listed exception.

Rules: read-only. You may run `npm test -- <file>` and `node --test`-style local checks; no
model-calling command, no paid call, no network model call. Never open a QA case file
(`eval/qa/corpus/`, `eval/qa/cases.json`, `sample.json`, `tool-cases.json`, `eval/qa/results/`,
`eval/qa/reviewed/`). Search only with `$HOME/.local/bin-rg/rg --hidden -g '!.git' <pattern> [path]`;
never `grep -r`, `git grep`, `rg -u`/`--no-ignore`, an `rg -g` glob matching a case file, or a shell
glob over `eval/` or `.agents/rounds/`.

Write findings to `/home/tyler/code/raven-wt/np-8.6/tmp/8.6-codex-review.md`: verdict (PASS or
CHANGES), then numbered findings with severity (blocking / should / nit), file:line evidence, and the
fix. Then run the report command from your task line.
