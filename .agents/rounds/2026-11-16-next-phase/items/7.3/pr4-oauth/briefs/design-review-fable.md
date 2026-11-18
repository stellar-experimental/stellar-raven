# Brief: Fable review of the item 7.3 PR 4 design proposal (oauth-provider 1.x)

You are a read-only design reviewer. Worktree: /home/tyler/code/raven-wt/np-7.3, branch np/7.3-deps-oauth at origin/main fdd001a4 (oauth-provider 0.10.4 installed).
Read /home/tyler/code/raven-wt/np-7.3/AGENTS.md, then /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr4-oauth/DESIGN.md. Check it against src/server.ts, src/hosts.ts,
src/auth/ (gate.ts, workos.ts, redirects.ts, retention.ts), ARCHITECTURE.md (auth sections), test/auth*.test.ts,
test/smoke/auth-redirects.test.ts, and the oauth-provider 1.2.4 package (npm pack it into a scratch dir; read
dist/oauth-provider.js, the .d.ts, docs/migration-1.x.md via gh api repos/cloudflare/workers-oauth-provider).

Look for: whether D1 (per-origin providers, allow-listed) is correct and complete (issuer, metadata paths, the
401 challenge, aliases, loopback dev, unknown hosts, the API-key and dev-bypass paths, module-scope caching);
whether D2 and the network-scheme denylist are the right call, or an allowlist is better; D3 option details
(construction-time validation of Raven's TTLs, the removed and renamed options, API signatures used by
workos.ts); D5 behavior changes that could break a real client; the open rollback question (can 0.10.4 read
grants and tokens that 1.2.4 wrote?); and gaps in the test plan. Answer the rollback question from source if
you can. Each finding names a file or command and a fix, marked blocking or non-blocking.

Rules:
- Read-only: edit nothing except your report and scratch files under tmp/ (Codex) or your scratchpad (Claude). Do not install into the worktree, commit or push. No model-calling eval, no paid call. Do not start a dev server. Do not read production KV or any production data: the lead already gathered the aggregates in DESIGN.md.
- Searches: search with `rg --hidden -g '!.git' <pattern> [path]`; the .ignore files keep it out of the case-bearing paths. Never use `grep -r`, `git grep`, `rg -u` or `--no-ignore`, an `rg -g` glob that matches a case file, or a shell glob over eval/ or .agents/rounds/. Never open a QA held-out or reserve case or anything under eval/qa/corpus/; never run the QA lint. If rg is missing, use git grep with the exclusion pathspec that eval/qa/README.md ("Held-out split") prints.
- Never print a secret. Do not read .dev.vars.

Write findings to /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr4-oauth/REVIEW.md (numbered, each blocking or not, then a one-line verdict). Then run:
hc send t1x8 '/home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr4-oauth/REVIEW.md'
