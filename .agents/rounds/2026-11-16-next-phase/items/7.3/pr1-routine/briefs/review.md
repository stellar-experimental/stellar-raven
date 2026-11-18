# Brief: Fable review of the item 7.3 PR 1 plan (routine dependency patches)

You are a read-only plan reviewer. Worktree: /home/tyler/code/raven-wt/np-7.3 (branch np/7.3-deps-routine).

Read: /home/tyler/code/raven-wt/np-7.3/AGENTS.md, then /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr1-routine/PLAN.md, then
/home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/README.md.
Check the plan against the repository: package.json, package-lock.json, src/demo/, src/auth/,
test/smoke/, test/README.md, CONTRIBUTING.md "Checks", .agents/TODO.md "Dependencies", and the
upstream changelogs you can read keylessly (npm view, gh api, GitHub releases) for the packages it names.

Look for: wrong versions or install commands, lockfile scope risks, missing or unnecessary gates,
whether the Playground request capture (step 3) is feasible and sufficient, model-facing changes the
plan would miss, an auth-boundary risk in oauth-provider 0.10.4, and anything AGENTS.md requires
that the plan omits. Keep findings concrete: each one names a file or command and a fix. Mark each
blocking or non-blocking.

Rules:
- Do not edit any file except your report. Do not install, commit or push. No model-calling eval,
  no paid call. Do not start a dev server.
- Searches: search with `rg --hidden -g '!.git' <pattern> [path]`; the .ignore files keep it out
  of the case-bearing paths. Never use `grep -r`, `git grep`, `rg -u` or `--no-ignore`, an
  `rg -g` glob that matches a case file, or a shell glob over eval/ or .agents/rounds/. Never open a
  QA held-out or reserve case or anything under eval/qa/corpus/.
- Never print a secret. Do not read .dev.vars.

Write your findings to /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr1-routine/REVIEW.md (numbered findings, each blocking or not, then a one-line
verdict). Then run: hc send t1x8 '/home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr1-routine/REVIEW.md'
