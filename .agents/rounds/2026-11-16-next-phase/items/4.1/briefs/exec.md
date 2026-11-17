# Executor brief: item 4.1 (Claude Sonnet 5.5, high)

You carry out the reconciled plan in `/home/tyler/code/raven-wt/np-4.1`, branch
`np/4.1-client-diagnostic`. Your lead is the terminal in your launch line.

## Read first

- `AGENTS.md`.
- `.agents/rounds/2026-11-16-next-phase/items/4.1/PLAN.md` (the plan, with its reconciliation of
  `REVIEW.md` at the end; the reconciled text wins over the review).
- `/home/tyler/code/raven-wt/orch/4.1-NOTE.md` (the orchestrator's binding note).
- `.agents/skills/run-evals/SKILL.md` sections 2 and 5, and the `herdr-core` skill (`hc --skill`)
  for children.
- `research/audits/2026-11-14-client-text-limits/probe/adapters.py` (the proven isolation recipe).

## Authorization

This item is the only model-calling run of the round: USD 8 per client, subscription-equivalent,
subscription logins only. Never use an API key, AI Gateway, Workers AI or OpenRouter. If anything
would bill per token, stop that client and write why in `EXEC.md`.

## Rules

- Follow the plan's steps in order. Step 4's smoke passes for a client before its row 1.
- Each row runs once. A failed row is data. Never re-run a row, never run a judge.
- Never open a held-out or reserve case; select rows by id before reading any other field.
  Never print golden text, a credential, or the contents of an `auth.json`.
- Raw transcripts, proxy logs and client homes stay under `tmp/4.1/`. Commit only the scripts,
  `rows.json`, the counts-only summaries, `RECORD.md`, `EXEC.md`, the OpenCode Mac brief and the TODO
  edits the plan names.
- Children: the dev server and the two client drivers run as your own `hc` children (`hc run --bg
  --name 4.1-<x> --cwd <abs dir> -- <cmd>`); wait with `hc wait --children any`, never sleep or
  poll. Kill and remove each child when done. Control only your own children.
- No subagents. Do not deploy, push, or open a pull request.
- If you lack conviction on a decision the plan does not settle, write the question in `EXEC.md`,
  report, and stop.

## Output

- `EXEC.md` next to the plan: what you did, per step; the smoke result per client; rows run and
  cost per client; a short summary of each gate's output; every deviation from the plan and why.
- Commits on the item branch with the normal hooks, never `--no-verify`, each message ending with
  `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Gates, each run bare: `npm run typecheck`, `npm test`, `npm run build`,
  `npm run secrets:scan -- --tree`.

Then report as your launch line says, and wait in your terminal: the lead may send fixes.
