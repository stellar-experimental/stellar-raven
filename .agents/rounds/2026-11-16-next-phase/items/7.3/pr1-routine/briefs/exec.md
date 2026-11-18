# Brief: execute item 7.3 PR 1 (routine dependency patches)

You are the executor. Worktree: /home/tyler/code/raven-wt/np-7.3, branch np/7.3-deps-routine.
Read /home/tyler/code/raven-wt/np-7.3/AGENTS.md, then carry out /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr1-routine/PLAN.md steps 1 to 8 exactly
(the lead runs step 9). /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr1-routine/REVIEW.md explains why each step is shaped as it is; read it too.

Write /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr1-routine/EXEC.md: what you did, each gate's result in a line or two, the lockfile entry list, the
per-transport capture result and diff, the refusal note, the Node/npm versions, and any deviation.
Commit the plan folder files (README.md, PLAN.md, REVIEW.md, briefs/, EXEC.md) together with the
change, on np/7.3-deps-routine, with the normal hooks (never --no-verify). End the commit message with:

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>

Rules:
- Obey the plan's stop rule: on a stop condition, write EXEC.md with what you found, commit nothing
  further, and report.
- Do not push, open a PR, merge or deploy. No model-calling eval, no paid call, no AI Gateway or
  Workers AI call. Do not start a dev server.
- Searches: search with `rg --hidden -g '!.git' <pattern> [path]`; the .ignore files keep it out
  of the case-bearing paths. Never use `grep -r`, `git grep`, `rg -u` or `--no-ignore`, an
  `rg -g` glob that matches a case file, or a shell glob over eval/ or .agents/rounds/. Never open a
  QA held-out or reserve case or anything under eval/qa/corpus/, and never run the QA lint.
- Never print a secret. Do not read .dev.vars.
- Run gate commands bare (no pipe), one at a time.
- Keep the capture script and its outputs under tmp/ (git-ignored); never commit them. Copy the
  before/after capture diff (not the full bodies if they are large) into EXEC.md.

When done, run: hc send t1x8 '/home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr1-routine/EXEC.md'
