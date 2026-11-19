# Item 8.8 plan review (Claude Fable)

You review the plan at `/home/tyler/code/raven-wt/np-8.8/.agents/rounds/2026-11-16-next-phase/items/8.8/PLAN.md`
against the repository in `/home/tyler/code/raven-wt/np-8.8` (branch from origin/main 7121bba2).
Read-only: edit nothing except your findings file.

Context: the owner said (2026-11-19) "we can honestly remove all per turn or per request approvals, I don't
want to be approving things, we should relax these guidelines anywhere and everywhere they show up
especially for sub use". The orchestrator's note is `/home/tyler/code/raven-wt/orch/8.8-NOTE.md`; the
common rules are `/home/tyler/code/raven-wt/orch/7-COMMON.md`. Read both, then `AGENTS.md`.

Check:
1. Completeness: is there any document, skill, brief, TODO item or script that requires approval,
   authorization, a signature or a confirmation flag before a run, that the plan misses? Search for it.
2. Classification: is each code gate correctly called an approval gate (remove) or a cost/integrity guard
   (keep)? Is the `--confirm-paid` replacement safe (default caps, `--dry-run`)? Is the
   `--round-cap-context` change sound and does it keep stored artifacts valid? Is renaming
   `--authorized-plan-sha256` worth it?
3. The proposed AGENTS.md text and default caps: correct, minimal, consistent with EVALS.md and #497.
4. Anything the plan changes that it should not (owner product decisions, end-user consent rules,
   deploy/merge gates, historical records), and any risk it misses.
5. Gates and stop rule: sufficient and runnable without a model call.

Rules: search with `rg --hidden -g '!.git' <pattern> [path]` only. Never use `grep -r`, `git grep`,
`rg -u` or `--no-ignore`, an `rg -g` glob that matches a case file, or a shell glob over `eval/` or
`.agents/rounds/`. Never open a QA held-out or reserve case (eval/qa/corpus/, cases.json, sample.json,
tool-cases.json, eval/qa results/ or reviewed/). No model-calling run, no paid call, no subagents.

Write numbered findings (severity, evidence with file:line, recommended change) to
`/home/tyler/code/raven-wt/np-8.8/.agents/rounds/2026-11-16-next-phase/items/8.8/REVIEW.md`, record your
model ID at the top, then report as your task line says.
