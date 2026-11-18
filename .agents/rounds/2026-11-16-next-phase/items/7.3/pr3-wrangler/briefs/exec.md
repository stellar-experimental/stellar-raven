# Brief: execute item 7.3 PR 3 (wrangler 4.164.0, the vitest plugin, miniflare and esbuild)

You are the executor. Worktree: /home/tyler/code/raven-wt/np-7.3, branch np/7.3-deps-wrangler.
Read /home/tyler/code/raven-wt/np-7.3/AGENTS.md, then carry out /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr3-wrangler/PLAN.md steps 1 to 8 exactly
(the lead runs step 9). /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr3-wrangler/REVIEW.md explains why each step is shaped as it is; read it too.

Write /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr3-wrangler/EXEC.md: what you did, each gate's result in a line or two, the lockfile entry list, the
behavior table, the bundle checks, the handshake wire diff, the Node/npm versions, and any deviation.
Commit as the plan's step 8 says, with the plan folder files (../README.md, PLAN.md, REVIEW.md,
briefs/, EXEC.md) in the same commit, on np/7.3-deps-wrangler, with the normal hooks (never --no-verify). End the commit message with:

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>

Rules:
- Obey the plan's stop rule: on a stop condition, write EXEC.md with what you found, commit nothing
  further, and report.
- Do not push, open a PR, merge or deploy. No model-calling eval, no paid call, no AI Gateway or
  Workers AI call.
- Local server: start at most one `npm run dev` at a time, only as an hc child of yours
  (`hc run --bg --name 7.3-pr3-dev --cwd /home/tyler/code/raven-wt/np-7.3 -- npm run dev`), after the
  plan's `lsof` pre-check. Read its URL with `hc read`. Kill and remove it when each run is done.
  Control only terminals you started. Never use `pgrep -fl` or `ps eww` (they can print secrets).
- If anything model-facing changes (mcp:surface hashes, the handshake diff), stop and report; do not
  run any model.
- Searches: search with `rg --hidden -g '!.git' <pattern> [path]`; the .ignore files keep it out
  of the case-bearing paths. Never use `grep -r`, `git grep`, `rg -u` or `--no-ignore`, an
  `rg -g` glob that matches a case file, or a shell glob over eval/ or .agents/rounds/. Never open a
  QA held-out or reserve case or anything under eval/qa/corpus/, and never run the QA lint.
- Never print a secret. Do not read .dev.vars.
- Run gate commands bare (no pipe), one at a time.
- Keep the capture script and its outputs under tmp/ (git-ignored); never commit them. Copy the
  handshake wire diff (not the full bodies if they are large) into EXEC.md.

When done, run: hc send t1x8 '/home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr3-wrangler/EXEC.md'
