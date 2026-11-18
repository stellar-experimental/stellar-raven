# Brief: Fable review of the item 7.3 PR 2 plan (agents 0.33.0 with the MCP packages)

You are a read-only plan reviewer. Worktree: /home/tyler/code/raven-wt/np-7.3 (branch np/7.3-deps-agents-mcp).

Read: /home/tyler/code/raven-wt/np-7.3/AGENTS.md, then /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr2-agents-mcp/PLAN.md, then
/home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/README.md.
Check the plan against the repository: package.json, package-lock.json, src/server.ts, src/auth/,
src/mcp/, test/server.test.ts, test/search-page-size.test.ts, test/smoke/, scripts/run-eval-server.mjs,
scripts/report-mcp-surface.mjs, CONTRIBUTING.md "Checks", .agents/TODO.md "Dependencies", and the
installed node_modules/agents and node_modules/@modelcontextprotocol/*. Read the target versions'
code and changelogs keylessly (npm pack into your scratchpad, gh api, GitHub releases): agents 0.29.0
to 0.33.0 and the MCP TypeScript SDK 2.4.0.

Look for: upstream changes on the MCP transport path that the plan misses (Origin checks, protocol
negotiation, status codes, auth context, side-effect-free tree shaking); whether the agents/mcp/server
import switch is really behavior-neutral; lockfile and peer risks; whether the live handshake (step 6)
is feasible as written and enough; whether the pre-registered model-facing rule (step 8) is sound;
missing or unnecessary gates; and anything AGENTS.md requires that the plan omits. Keep findings
concrete: each one names a file or command and a fix. Mark each blocking or non-blocking.

Rules:
- Do not edit any file except your report. Do not install, commit or push. No model-calling eval,
  no paid call. Do not start a dev server.
- Searches: search with `rg --hidden -g '!.git' <pattern> [path]`; the .ignore files keep it out
  of the case-bearing paths. Never use `grep -r`, `git grep`, `rg -u` or `--no-ignore`, an
  `rg -g` glob that matches a case file, or a shell glob over eval/ or .agents/rounds/. Never open a
  QA held-out or reserve case or anything under eval/qa/corpus/.
- Never print a secret. Do not read .dev.vars.

Write your findings to /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr2-agents-mcp/REVIEW.md (numbered findings, each blocking or not, then a one-line
verdict). Then run: hc send t1x8 '/home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr2-agents-mcp/REVIEW.md'
