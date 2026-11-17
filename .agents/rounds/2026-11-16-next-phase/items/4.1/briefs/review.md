# Review brief: item 4.1 plan (Claude Fable, high)

You review a plan; you do not execute it. Work read-only in `/home/tyler/code/raven-wt/np-4.1`
except for the one file you write.

## Read

- `AGENTS.md`.
- The plan: `.agents/rounds/2026-11-16-next-phase/items/4.1/PLAN.md`.
- Its binding inputs: `.agents/rounds/2026-11-16-next-phase/PLAN.md` item 4.1,
  `.agents/rounds/2026-11-16-next-phase/DECISIONS.md` decision 7, and the orchestrator note
  `/home/tyler/code/raven-wt/orch/4.1-NOTE.md` (it binds where it differs).
- `.agents/TODO.md` sections "M2: bound the default `execute` result under the Grok clip" and "Add a
  runner for Codex and Grok as QA answering clients".
- `.agents/skills/run-evals/SKILL.md` sections 1, 2 and 5.
- `research/audits/2026-11-14-client-text-limits.md` and
  `research/audits/2026-11-14-client-text-limits/probe/adapters.py` (how these CLIs were isolated
  before).
- Item 3.4's `PLAN.md`, `RESULT.md` and `read-boundary.mjs` under
  `.agents/rounds/2026-11-16-next-phase/items/3.4/`.
- `eval/qa/tuning-rows.mjs`, and `agentPrompt` / `buildAgentSpawn` in `eval/qa/run-qa.mjs`.

You may run `--help` and offline catalog reads of the `codex`, `grok` and `opencode` CLIs and read
their bundled docs (`~/.grok/docs/user-guide/`). Do not run any model, do not start a server, do
not call `codex exec`, `grok -p` or `opencode run`.

## Data rules

- Never open the split file's `heldOut` or `reserve` sets, and never read a case outside the plan's
  selection. You do not need any case content to review this plan.
- Never print a credential or the contents of an `auth.json`.

## Check, explicitly

1. **Spend.** Does the plan stay inside decision 7 and the note: subscription logins only, no API
   key, Gateway or Workers AI path, USD 8 per client subscription-equivalent, a stop that fires
   before a row would pass the cap, one pass of 24 rows, no judge, no repeat? Is the cost
   accounting sound for each CLI's token fields (cached, reasoning)? Can anything in the harness
   silently fall back to a per-token API path (environment keys, CLI config, OpenCode providers)?
2. **Data handling.** Row selection by id before any other field; the same 24 rows per client;
   golden read only where needed and never committed; raw transcripts kept out of the repo;
   answering agents isolated from this repo's `AGENTS.md`, the user's global rules and other MCP
   servers.
3. **The four behaviours.** Is each definition readable from the logs the plan names, for each
   client, and does it answer the round plan's wording? Is the B3 "lost cited fact" definition
   sound, and is the M2 decision rule fixed before the run and fair?
4. **Feasibility.** The CLI flags and config keys the plan relies on, as far as `--help` and the
   docs show; the tap's SSE handling; the dirty-tree refusal of `dev:eval`; the Mac lane's server
   and the way its counts come back.
5. **Anything else** that would make the run waste spend or give a misleading record.

## Output

Write `.agents/rounds/2026-11-16-next-phase/items/4.1/REVIEW.md`: numbered findings, each with
severity (blocking, should, nit), the evidence (file and line, or the help text you read), and a
concrete fix. Keep it short. Then report as your launch line says, and stop.
