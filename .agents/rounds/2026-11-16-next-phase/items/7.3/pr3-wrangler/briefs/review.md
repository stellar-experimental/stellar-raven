# Brief: Fable review of the item 7.3 PR 3 plan (wrangler 4.164.0, the vitest plugin, miniflare and esbuild)

You are a read-only plan reviewer. Worktree: /home/tyler/code/raven-wt/np-7.3 (branch np/7.3-deps-wrangler).

Read: /home/tyler/code/raven-wt/np-7.3/AGENTS.md, then /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr3-wrangler/PLAN.md, then
/home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/README.md.
Check the plan against the repository: package.json (overrides), package-lock.json, tsconfig.json,
vitest.config.ts, test/smoke/vitest.config.ts, test/usage-site-runtime.test.mjs, wrangler.jsonc,
usage/ and usage/report-site/ build paths, .github/workflows/ci.yml, CONTRIBUTING.md "Checks",
.agents/TODO.md "Dependencies", and the PR 2 records (../pr2-agents-mcp/EXEC.md) for the handshake
script. Read the target versions keylessly (npm view, npm pack into your scratchpad, gh api): wrangler
4.154.0 to 4.164.0 (CHANGELOG), @cloudflare/vitest-plugin 1.x against @cloudflare/vitest-pool-workers
0.23.0 (exports, cloudflareTest options, cloudflare:test types, the plugin CHANGELOG), miniflare
5.20261117.0-beta.

Look for: whether the plugin migration really is a rename for this repo's smoke config (options such
as wrangler.configPath, remoteBindings, miniflare.bindings, outboundService); whether dropping all
three overrides resolves cleanly (you may run npm install --package-lock-only --ignore-scripts on a
scratch copy of package.json and package-lock.json, never in the worktree); wrangler changes that
reach Raven's bindings, build, dev or deploy; missing or unnecessary gates; whether the fallback is
sound; and anything AGENTS.md requires that the plan omits. Keep findings concrete: each one names a
file or command and a fix. Mark each blocking or non-blocking.

Rules:
- Do not edit any file except your report. Do not install, commit or push. No model-calling eval,
  no paid call. Do not start a dev server.
- Searches: search with `rg --hidden -g '!.git' <pattern> [path]`; the .ignore files keep it out
  of the case-bearing paths. Never use `grep -r`, `git grep`, `rg -u` or `--no-ignore`, an
  `rg -g` glob that matches a case file, or a shell glob over eval/ or .agents/rounds/. Never open a
  QA held-out or reserve case or anything under eval/qa/corpus/.
- Never print a secret. Do not read .dev.vars.

Write your findings to /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr3-wrangler/REVIEW.md (numbered findings, each blocking or not, then a one-line
verdict). Then run: hc send t1x8 '/home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr3-wrangler/REVIEW.md'
