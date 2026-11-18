# Brief: independent diff review of item 7.3 PR 3 (wrangler 4.164.0, the vitest plugin, miniflare, esbuild)

You are the independent reviewer (Codex frontier, a different vendor from the Sonnet author and the
Opus lead). Worktree: /home/tyler/code/raven-wt/np-7.3, branch np/7.3-deps-wrangler, one commit
(8ded7916) on origin/main abd68c63.

Read /home/tyler/code/raven-wt/np-7.3/AGENTS.md, then /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr3-wrangler/PLAN.md, /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr3-wrangler/REVIEW.md and /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr3-wrangler/EXEC.md.
Review `git diff origin/main...HEAD`:
- the lockfile: 28 removed, 2 added, 35 changed, as EXEC.md lists; registry integrity for the changed
  tarballs; one workerd copy;
- that dropping all three overrides changes no resolution beyond the list;
- the smoke config and tsconfig rename to @cloudflare/vitest-plugin keep the offline wall
  (outboundService), remoteBindings: false and the fake bindings intact, and that the plugin has no new
  default (for example a dev registry, remote proxy or network access) that weakens the smoke lane's
  isolation. Compare with @cloudflare/vitest-pool-workers@0.23.0 (npm pack into tmp/);
- the enableDevRegistry: false edit in test/usage-site-runtime.test.mjs;
- the TODO edits (the pool item removed, the standing note) match what was proved;
- EXEC.md's claim that dist/server.js and dist/usage/collector.js are byte-identical: rebuild cheaply
  (npm run build, npm run build:usage) and compare with the SHA-256 values in EXEC.md.

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
/home/tyler/code/raven-wt/np-7.3/tmp/7.3-pr3-diff-review.md (you cannot write under .agents/). Then run:
hc send t1x8 '/home/tyler/code/raven-wt/np-7.3/tmp/7.3-pr3-diff-review.md'
