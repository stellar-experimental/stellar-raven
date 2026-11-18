# Brief: execute item 7.3 PR 4 (oauth-provider 1.2.4, per-origin providers, callback allowlist)

You are the executor. Worktree: /home/tyler/code/raven-wt/np-7.3, branch np/7.3-deps-oauth.
Read /home/tyler/code/raven-wt/np-7.3/AGENTS.md, then carry out /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr4-oauth/PLAN.md steps 1 to 11 exactly
(the lead runs step 12). DESIGN.md (revision 2.1) is the specification. /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr4-oauth/REVIEW.md, CODEX-DESIGN-REVIEW.md and CODEX-DESIGN-RECHECK.md in the same folder explain why; read them too.

Write /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr4-oauth/EXEC.md: what you did, each gate's result in a line or two, the lockfile entry list, the
test list, the fresh-env fail/pass proof, the migration-harness and local-flow tables, the public pages that
state the client registration lifetime, the Node/npm versions, and any deviation.
Commit as the plan's step 11 says, with the plan folder files (PLAN.md, briefs/, EXEC.md) in the same commit, on np/7.3-deps-oauth, with the normal hooks (never --no-verify). End the commit message with:

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>

Rules:
- Obey the plan's stop rule: on a stop condition, write EXEC.md with what you found, commit nothing
  further, and report.
- Do not push, open a PR, merge or deploy. No model-calling eval, no paid call, no AI Gateway or
  Workers AI call.
- Local server: start at most one `npm run dev` at a time, only as an hc child of yours
  (`hc run --bg --name 7.3-pr4-dev --cwd /home/tyler/code/raven-wt/np-7.3 -- npm run dev`), after the
  plan's `lsof` pre-check. Read its URL with `hc read`. Kill and remove it when each run is done.
  Control only terminals you started. Never use `pgrep -fl` or `ps eww` (they can print secrets).
- If anything model-facing changes (mcp:surface hashes), stop and report; do not run any model.
- Production: no read or write of production KV, D1 or any production endpoint. Never complete a real WorkOS
  login. Do not edit public legal or privacy pages.
- Searches: search with `rg --hidden -g '!.git' <pattern> [path]`; the .ignore files keep it out
  of the case-bearing paths. Never use `grep -r`, `git grep`, `rg -u` or `--no-ignore`, an
  `rg -g` glob that matches a case file, or a shell glob over eval/ or .agents/rounds/. Never open a
  QA held-out or reserve case or anything under eval/qa/corpus/, and never run the QA lint.
- Never print a secret. Do not read .dev.vars.
- Run gate commands bare (no pipe), one at a time.
- Keep the capture script and its outputs under tmp/ (git-ignored); never commit them. Copy the
  handshake wire diff (not the full bodies if they are large) into EXEC.md.

When done, run: hc send t1x8 '/home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr4-oauth/EXEC.md'
