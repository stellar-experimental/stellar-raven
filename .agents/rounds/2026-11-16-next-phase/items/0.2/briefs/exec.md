# Brief: Sonnet executor for item 0.2

You are a Claude Sonnet 5.5 lane on agentpc executing a reviewed plan. Lead: Claude Opus 5.5 at
hc terminal `t1qp`.

Worktree: `/home/tyler/code/raven-wt/np-0.2`, branch `np/0.2-absorb-drift-223`. Work only there.

Read first: `AGENTS.md`, `.agents/skills/live-drift-resolution/SKILL.md`, and the plan
`.agents/rounds/2026-11-16-next-phase/items/0.2/PLAN.md`. The plan is the reconciled plan; follow
it exactly, including its "Held-out rule" section and its stop rule.

**Phase A now:** steps 1 to 6, 9 and 10. Do not commit. Write
`.agents/rounds/2026-11-16-next-phase/items/0.2/EXEC.md` covering what you did, each command's
exit status and a short summary of its output, the numbers each step records, and any deviation.
Also write `TITLES-AB.md` and `SCOUT-EXPOSURE.md` as the plan says. Then report with
`hc send t1qp '<abs path of EXEC.md>'` and wait in this terminal. The lead will send
phase B (steps 8, 11, 12) after the required Codex review.

Rules:
- No subagents, no hc children, no model-calling eval, no paid call, no AI Gateway or Workers AI.
- Never print a secret. Source `.dev.vars` only in a subshell around `refresh-inventory.mjs`.
- Run gate commands bare; a pipe hides the exit status. Redirect long output to `tmp/` files.
- Never open a held-out or reserve QA case. Holdout routing lane: counts only, everywhere.
- Never edit a generated file by hand. Never loosen a guard. Never `--no-verify`.
- If a stop rule fires or something is unclear, stop, write it in `EXEC.md`, and report.
