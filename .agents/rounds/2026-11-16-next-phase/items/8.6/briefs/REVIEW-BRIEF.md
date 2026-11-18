# Item 8.6 plan review (Claude Fable)

Review the plan `/home/tyler/code/raven-wt/np-8.6/.agents/rounds/2026-11-16-next-phase/items/8.6/PLAN.md`
against the repository in the worktree `/home/tyler/code/raven-wt/np-8.6` (branch `np/8.6-subs-first`).
Read first: `AGENTS.md`, `/home/tyler/code/raven-wt/orch/8.6-NOTE.md` (the item's binding note, with
the owner's instruction verbatim), `/home/tyler/code/raven-wt/orch/7-COMMON.md`, and
`.agents/rounds/2026-11-16-next-phase/DECISIONS.md`.

Check that the plan:
- meets every goal and answers every question in the 8.6 note, plus the orchestrator's two additions
  (second non-Claude judge on a subscription with tool-denial verified offline; drop the AGENTS.md
  dated-brief launch-line clause; propose and add an OpenCode roster row);
- states facts that are true on this tree (re-check the file and line references, the importer list,
  the claim that no npm script runs the gateway judge, the inventory table, and the CLI claims; you may
  run `codex exec --help`, `codex features list`, `grok --help`, `opencode run --help`,
  `opencode debug agents --standalone` under private `XDG_*` dirs; never a command that calls a model);
- keeps stored gateway verdicts readable and removes only the ability to produce new ones;
- has a cheap, sound mechanical guard, and a subscription-env hardening that does not break identity
  pins or existing tests;
- keeps AGENTS.md short and puts the exception list in one owning doc;
- misses no live path that calls AI Gateway, Workers AI or a provider API from an eval, test or build
  step.

Rules: read-only except your report. No model-calling command, no paid call, no edits to the plan.
Searches: `PATH=$HOME/.local/bin-rg:$PATH rg --hidden -g '!.git' <pattern> [path]`; never `grep -r`,
`git grep`, `rg -u`/`--no-ignore`, an `rg -g` glob that matches a case file, or a shell glob over
`eval/` or `.agents/rounds/`. Never open a QA case file (`eval/qa/corpus/`, `cases.json`, `sample.json`,
`tool-cases.json`, `eval/qa/results/`, `eval/qa/reviewed/`). No subagents.

Write findings to `/home/tyler/code/raven-wt/np-8.6/.agents/rounds/2026-11-16-next-phase/items/8.6/REVIEW.md`:
numbered, each with severity (blocking / should / nit), the evidence (file:line or command output
summary), and the change you propose. Then report the path as your task line says.
