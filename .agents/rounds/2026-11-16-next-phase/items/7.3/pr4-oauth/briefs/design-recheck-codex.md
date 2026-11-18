# Brief: Codex frontier security re-check of the item 7.3 PR 4 design, revision 2 (oauth-provider 1.x)

You are the read-only security reviewer, independent of the Opus lead. Worktree: /home/tyler/code/raven-wt/np-7.3, branch np/7.3-deps-oauth at origin/main fdd001a4 (oauth-provider 0.10.4 installed).
Read /home/tyler/code/raven-wt/np-7.3/AGENTS.md, then /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr4-oauth/DESIGN.md. Check it against src/server.ts, src/hosts.ts,
src/auth/ (gate.ts, workos.ts, redirects.ts, retention.ts), ARCHITECTURE.md (auth sections), test/auth*.test.ts,
test/smoke/auth-redirects.test.ts, and the oauth-provider 1.2.4 package (npm pack it into a scratch dir; read
dist/oauth-provider.js, the .d.ts, docs/migration-1.x.md via gh api repos/cloudflare/workers-oauth-provider).

This is a re-check of DESIGN.md revision 2. Your first read is /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr4-oauth/CODEX-DESIGN-REVIEW.md (verdict: design FAIL
as written; approval could proceed once findings 1 to 3 were resolved, finding 4 updated and the migration
and rollback limits recorded). The Fable review is /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr4-oauth/REVIEW.md. Check only: are findings 1 (request-local
env), 2 (404 for unknown origins, exact-origin selection), 3 (positive callback allowlist, completeCallback
check) resolved soundly in revision 2; is finding 4 reflected; are the limits recorded; and does revision 2
introduce any new security problem (for example the registration rule "at least one allowlisted URI", the
logged scheme token, or the loopback provider cache). Reuse your probe under tmp/oauth-security-review/ if it
helps. Keep it short.

Rules:
- Read-only: edit nothing except your report and scratch files under tmp/ (Codex) or your scratchpad (Claude). Do not install into the worktree, commit or push. No model-calling eval, no paid call. Do not start a dev server. Do not read production KV or any production data: the lead already gathered the aggregates in DESIGN.md.
- Searches: search with `rg --hidden -g '!.git' <pattern> [path]`; the .ignore files keep it out of the case-bearing paths. Never use `grep -r`, `git grep`, `rg -u` or `--no-ignore`, an `rg -g` glob that matches a case file, or a shell glob over eval/ or .agents/rounds/. Never open a QA held-out or reserve case or anything under eval/qa/corpus/; never run the QA lint. If rg is missing, use git grep with the exclusion pathspec that eval/qa/README.md ("Held-out split") prints.
- Never print a secret. Do not read .dev.vars.

Write numbered findings (severity blocker/major/minor/note, file, fix) and a verdict (design PASS or FAIL)
to /home/tyler/code/raven-wt/np-7.3/tmp/7.3-pr4-design-codex-r2.md (you cannot write under .agents/). Then run:
hc send t1x8 '/home/tyler/code/raven-wt/np-7.3/tmp/7.3-pr4-design-codex-r2.md'
