# Brief: Fable review of the item 7.3 PR 5 plan (vitest 5)

You are a read-only plan reviewer. Worktree: /home/tyler/code/raven-wt/np-7.3 (branch np/7.3-deps-vitest5).

Read: /home/tyler/code/raven-wt/np-7.3/AGENTS.md, then /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr5-vitest5/PLAN.md, then
/home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/README.md.
Check the plan against the repository: package.json, package-lock.json, vitest.config.ts,
test/smoke/vitest.config.ts, the test suites under test/ (search them for the patterns the plan's table names),
scripts/ and eval/ imports of vitest, .gitignore, test/README.md, .agents/TODO.md, and CI (.github/workflows/ci.yml).
Read vitest 5 keylessly: the migration guide (gh api repos/vitest-dev/vitest/contents/docs/guide/migration/index.md),
release notes 5.0.0 to 5.1.0, and @cloudflare/vitest-plugin 1.8.4's handling of vitest 5 (npm pack into your
scratchpad). You may resolve the change lock-only on a scratch copy of package.json and package-lock.json
(npm install --package-lock-only --ignore-scripts), never in the worktree.

Look for: breaking changes the plan's table misses or mis-states; which tests in this repo each change actually
hits (name them); whether the plugin really runs under vitest 5 (any known issue); lockfile and peer risks; whether
the "no deploy" expectation and the bundle-hash check are sound; the flake TODO wording; missing or unnecessary
gates. Each finding names a file or command and a fix, marked blocking or non-blocking.

Rules:
- Do not edit any file except your report. Do not install, commit or push. No model-calling eval,
  no paid call. Do not start a dev server.
- Searches: search with `rg --hidden -g '!.git' <pattern> [path]`; the .ignore files keep it out
  of the case-bearing paths. Never use `grep -r`, `git grep`, `rg -u` or `--no-ignore`, an
  `rg -g` glob that matches a case file, or a shell glob over eval/ or .agents/rounds/. Never open a
  QA held-out or reserve case or anything under eval/qa/corpus/.
- Never print a secret. Do not read .dev.vars.

Write your findings to /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr5-vitest5/REVIEW.md (numbered findings, each blocking or not, then a one-line
verdict). Then run: hc send t1x8 '/home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr5-vitest5/REVIEW.md'
