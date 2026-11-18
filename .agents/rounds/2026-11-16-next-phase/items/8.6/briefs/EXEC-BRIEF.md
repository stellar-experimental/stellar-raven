# Item 8.6 executor brief (Claude Sonnet)

Carry out the reconciled plan
`/home/tyler/code/raven-wt/np-8.6/.agents/rounds/2026-11-16-next-phase/items/8.6/PLAN.md`, steps 1 to 8,
in the worktree `/home/tyler/code/raven-wt/np-8.6` on branch `np/8.6-subs-first`. Step 9 (the ledger
row) is the lead's. Read first: `AGENTS.md`, the plan, its `REVIEW.md`, and
`/home/tyler/code/raven-wt/orch/8.6-NOTE.md` (step 1 copies the owner's instruction verbatim from it).

## Rules

- No model-calling command, paid call, AI Gateway or Workers AI call. `claude auth status --json`,
  `codex login status`, `opencode auth list --standalone --format json` (read only the `method`
  fields; never print values), `opencode models --standalone` and `opencode debug agents --standalone`
  are free and allowed.
- Never open a QA case file (`eval/qa/corpus/`, `cases.json`, `sample.json`, `tool-cases.json`,
  `eval/qa/results/`, `eval/qa/reviewed/`, `consistency-register.json`, `source-sentinels.json`), and
  never run the QA lint.
- Searches: `PATH=$HOME/.local/bin-rg:$PATH rg --hidden -g '!.git' <pattern> [path]`. Never `grep -r`,
  `git grep`, `rg -u`/`--no-ignore`, an `rg -g` glob that matches a case file, or a shell glob over
  `eval/` or `.agents/rounds/`.
- Do not edit `src/`. In `.agents/model-roster.md` touch only what step 8 names. Do not edit dated
  records except what steps 1 and 2 name.
- Writing style for docs: short sentences, current behavior, no history narrative; follow the
  surrounding file. Keep AGENTS.md short.
- No subagents. Do not start Wrangler.
- If a step cannot be done as planned, or hits the plan's stop rule, stop and write why in EXEC.md.

## Gates (run each bare, not piped)

`npm run typecheck`, `npm test`, `npm run build`, `npm run eval:selftest`,
`npm run secrets:scan -- --tree`. Compare `dist/server.js` with a build of `origin/main` (expected
byte-identical; build `origin/main` in a scratch `git worktree add --detach` under
`/tmp/claude-1000/` and remove that worktree after). Show the guard test failing on a planted file,
then remove the file.

## Commits and record

Commit on `np/8.6-subs-first` with the normal hooks, never `--no-verify`, in a few logical commits.
End each message with `Co-Authored-By: Claude <Family> <version> <noreply@anthropic.com>`, using the
exact model name your system prompt gives you. Do not push.

Write `.agents/rounds/2026-11-16-next-phase/items/8.6/EXEC.md` (what you did per step, a short summary
of each gate's output with counts, the byte comparison, any deviation and why) and
`items/8.6/DISPOSITION.md` (step 3). Commit both. Then report the EXEC.md path as your task line says,
and stay open: the lead may send review findings for you to reconcile.
