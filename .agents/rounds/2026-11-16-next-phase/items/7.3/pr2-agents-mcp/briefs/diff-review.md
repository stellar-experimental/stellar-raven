# Brief: independent security review of item 7.3 PR 2 (agents 0.33.0 with the MCP packages)

You are the independent reviewer (Codex frontier, a different vendor from the Sonnet author and the
Opus lead). Worktree: /home/tyler/code/raven-wt/np-7.3, branch np/7.3-deps-agents-mcp, two commits on
origin/main (2aa1ef83 import switch, 8b1973e6 version bump and records).

Read /home/tyler/code/raven-wt/np-7.3/AGENTS.md, then /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr2-agents-mcp/PLAN.md, /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr2-agents-mcp/REVIEW.md and /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr2-agents-mcp/EXEC.md.
Review `git diff origin/main...HEAD` as a security read of the MCP transport path:
- Is importing createMcpHandler from agents/mcp/server behavior-equivalent for Raven (src/server.ts)?
  Does dropping 28 agents modules, SDK v1 and ajv from the bundle remove anything a request path
  needs (auth context, ctx.props propagation, Origin/Host checks, error mapping)?
- agents 0.28.1 to 0.33.0 stateless handler (installed node_modules/agents/dist/handler-stateless-*.js;
  fetch 0.28.1 with npm pack into tmp/ to diff): the new getResourceAuthInfo / ctx.auth path. Can a
  request or a client set ctx.auth or the verified-context symbol, so tools see attacker-chosen
  authInfo? Does it change which identity Raven uses for artifact ownership (resolveArtifactOwner)?
- @modelcontextprotocol/server 2.3.1 to 2.4.0 (gh api repos/modelcontextprotocol/typescript-sdk/compare/v2.3.1...v2.4.0):
  anything reaching Raven's path that EXEC.md's behavior table misses.
- Lockfile: the 82 prod-to-devOptional flips and the added @opentelemetry/api; anything bundled
  that should not be.
- Check EXEC.md's claims cheaply: npm run -s mcp:surface -- --json hashes, npm ls workerd, the bundle
  positive list on dist/server.js after npm run build.

Rules:
- Read-only apart from your report and scratch files under tmp/. Do not edit tracked files, install
  into the worktree, commit or push. No model-calling eval, no paid call. Do not start a dev server.
- Searches: search with `rg --hidden -g '!.git' <pattern> [path]`; the .ignore files keep it out of
  the case-bearing paths. Never use `grep -r`, `git grep`, `rg -u` or `--no-ignore`, an `rg -g`
  glob that matches a case file, or a shell glob over eval/ or .agents/rounds/. Never open a QA
  held-out or reserve case or anything under eval/qa/corpus/; never run the QA lint. If rg is missing,
  use git grep with the exclusion pathspec that eval/qa/README.md ("Held-out split") prints.
- Never print a secret. Do not read .dev.vars.

Write numbered findings (severity blocker/major/minor/note, file, fix) and a PASS or FAIL verdict to
/home/tyler/code/raven-wt/np-7.3/tmp/7.3-pr2-diff-review.md (you cannot write under .agents/). Then run:
hc send t1x8 '/home/tyler/code/raven-wt/np-7.3/tmp/7.3-pr2-diff-review.md'
