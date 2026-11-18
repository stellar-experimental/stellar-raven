# Brief: Codex frontier security review of the item 7.3 PR 4 diff (oauth-provider 1.2.4)

You are the required independent security reviewer (Codex frontier; the author is Claude Sonnet 5.5, the lead and
orchestrator are Claude Opus 5.5). Worktree: /home/tyler/code/raven-wt/np-7.3, branch np/7.3-deps-oauth.
Review `git diff fdd001a4...HEAD` (origin/main is fdd001a4; three commits: design records, plan, implementation c341e0f1).

Read /home/tyler/code/raven-wt/np-7.3/AGENTS.md, then /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr4-oauth/DESIGN.md (revision 2.1, approved), /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr4-oauth/PLAN.md,
/home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr4-oauth/EXEC.md, and your own earlier design reads /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr4-oauth/CODEX-DESIGN-REVIEW.md and /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr4-oauth/CODEX-DESIGN-RECHECK.md.
Check that the implementation does what DESIGN.md approved, and look for security defects in the auth flow:
- src/server.ts dispatch order and selectOAuthOrigin (src/hosts.ts): origin from request.url only, 404 before the
  playground and any provider or WorkOS work, module-scope production providers, uncached loopback providers,
  every provider call with { ...env, OAUTH_PROVIDER: undefined } (including the metadata alias), no shared-env
  mutation anywhere;
- src/auth/redirects.ts allowlist and scheme token; src/auth/gate.ts options (allowPrivateUseRedirectUris with its
  reason, requiredScopes, registration callback, onError logging only category/reason/status/code);
- src/auth/workos.ts: refusals on both /authorize legs, the error redirect and the parked completeCallback check
  (placement after state and binding validation, before the WorkOS exchange; state consumption and cookie
  cleanup kept); no Location, no WorkOS hop, no URI in logs;
- D4: no identity or token from ctx.auth reaches tools or the execute context;
- the new and changed tests actually test what they claim (for example the fresh-env smoke test failing without
  the fix, the D4 mutation check); the KV fake;
- docs and TODO edits match the behavior; the observability skill edit is accurate.
Re-run cheap checks: npm run typecheck, the new test files (vitest run <file>), and npm run -s mcp:surface -- --json.
You may re-run the scratch harness under tmp/pr4-migration/.

Rules:
- Read-only apart from your report and scratch files under tmp/. Do not edit tracked files, install into the
  worktree, commit or push. No model-calling eval, no paid call. Do not start a dev server. No production access.
- Searches: search with `rg --hidden -g '!.git' <pattern> [path]`; the .ignore files keep it out of the
  case-bearing paths. Never use `grep -r`, `git grep`, `rg -u` or `--no-ignore`, an `rg -g` glob that
  matches a case file, or a shell glob over eval/ or .agents/rounds/. Never open a QA held-out or reserve case or
  anything under eval/qa/corpus/; never run the QA lint. If rg is missing, use git grep with the exclusion
  pathspec that eval/qa/README.md ("Held-out split") prints.
- Never print a secret. Do not read .dev.vars.

Write numbered findings (severity blocker/major/minor/note, file:line, fix) and a PASS or FAIL verdict to
/home/tyler/code/raven-wt/np-7.3/tmp/7.3-pr4-diff-review.md. Then run:
hc send t1x8 '/home/tyler/code/raven-wt/np-7.3/tmp/7.3-pr4-diff-review.md'
