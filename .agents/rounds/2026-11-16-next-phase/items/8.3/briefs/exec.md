# Item 8.3 executor (Claude Sonnet 5.5, high)

Worktree `/home/tyler/code/raven-wt/np-8.3`, branch `np/8.3-model-families`. Your lead is the
terminal that started you.

Carry out `.agents/rounds/2026-11-16-next-phase/items/8.3/PLAN.md` exactly, including its
"Reconciliation" table. Read `AGENTS.md`, the plan, and
`.agents/rounds/2026-11-16-next-phase/items/8.3/REVIEW.md` (the reviewer's evidence and line
references) first.

Rules:
- Search only with `rg --hidden -g '!.git' <pattern> [path]`. Never use `grep -r`, `git grep`,
  `rg -u` or `--no-ignore`, an `rg -g` glob that matches a case file, or a shell glob over `eval/`
  or `.agents/rounds/`. Never open a QA case file (`eval/qa/corpus/`, `cases.json`, `sample.json`,
  `tool-cases.json`, `eval/qa/results/`, `eval/qa/reviewed/`).
- No model call of any kind: no `claude -p`, `codex exec`, `grok -p`, no eval, no paid call. The
  lead already ran the CLI smokes. Do not run `npm run eval:qa:lint` or `eval:qa:register`.
- Do not edit anything under `research/`, `improvements/`, `.agents/rounds/` (except your
  `items/8.3/EXEC.md`), `plugins/openai/`, `ecosystem-skills/PIN-REVIEW.md`, or the recorded
  stream fixtures. Never print a secret. The resolver and its tests never read or copy a real
  `~/.codex` or `~/.grok` cache.
- No subagents. Do not start a dev server.
- If the plan's stop rule fires (for example the Playground v3 contract cannot take the optional
  field, or a guard would refuse stored artifacts in a way the plan did not foresee), stop, write
  what you found in EXEC.md, and report.

Gates, each run bare: `npm run typecheck`, `npm test`, `npm run build`, `npm run test:smoke`,
`npm run eval:selftest`, `npm run secrets:scan -- --tree`. If you touched `usage/`, also
`npm run build:usage`, `npm run test:usage-report`, `npm run build:usage-report`. Then rerun the
plan's final version-pin scan and list what remains with a reason for each.

Commit on the branch in logical commits (for example: resolver and roster/docs; eval runners;
Playground) with the normal hooks, never `--no-verify`. Each message ends with:

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>

Write `.agents/rounds/2026-11-16-next-phase/items/8.3/EXEC.md`: what you did per plan step, a
short summary of each gate's output, the final scan result, and every deviation with its reason.
Commit it. Do not push. Then report with the hc send command in your task line.
