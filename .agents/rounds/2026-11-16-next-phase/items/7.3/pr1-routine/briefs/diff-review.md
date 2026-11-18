# Brief: independent diff review of item 7.3 PR 1 (routine dependency patches)

You are the independent reviewer (Codex, a different vendor from the Sonnet author and the Opus lead).
Worktree: /home/tyler/code/raven-wt/np-7.3, branch np/7.3-deps-routine, one commit on origin/main.

Read /home/tyler/code/raven-wt/np-7.3/AGENTS.md, then /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr1-routine/PLAN.md, /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr1-routine/REVIEW.md and /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr1-routine/EXEC.md.
Review `git diff origin/main...HEAD`: package.json, package-lock.json, two stale-text lines and the
records. Check:
- the lockfile moves only the expected set, with registry integrity intact;
- the upstream changes in the bundled packages (ai, @ai-sdk/*, acorn, workers-ai-provider,
  @cloudflare/workers-oauth-provider 0.10.4) carry no auth, sandbox or model-facing risk the records
  miss. Read the installed node_modules sources and changelogs keylessly;
- the EXEC.md claims hold. Re-run what is cheap: `npm run -s mcp:surface -- --json` hashes,
  `npm ls workerd`, `npm audit`. Optionally re-run the capture at tmp/capture/ with
  `CAPTURE_OUT=tmp/review-capture.json npx vitest run --config tmp/capture/capture.config.ts`;
- where the 204,788-byte bundle growth comes from, if you can attribute it cheaply (for example
  `npm run build` with a metafile or comparing package sizes). Do not spend long on it.

Rules:
- Read-only apart from your report and scratch files under tmp/. Do not edit tracked files, install,
  commit or push. No model-calling eval, no paid call. Do not start a dev server.
- Searches: search with `rg --hidden -g '!.git' <pattern> [path]`; the .ignore files keep it out of
  the case-bearing paths. Never use `grep -r`, `git grep`, `rg -u` or `--no-ignore`, an `rg -g`
  glob that matches a case file, or a shell glob over eval/ or .agents/rounds/. Never open a QA
  held-out or reserve case or anything under eval/qa/corpus/; never run the QA lint. If rg is missing,
  use git grep with the exclusion pathspec that eval/qa/README.md ("Held-out split") prints.
- Never print a secret. Do not read .dev.vars.

Write numbered findings (severity blocker/major/minor/note, file, fix) and a PASS or FAIL verdict to
/home/tyler/code/raven-wt/np-7.3/tmp/7.3-pr1-diff-review.md (you cannot write under .agents/). Then run:
hc send t1x8 '/home/tyler/code/raven-wt/np-7.3/tmp/7.3-pr1-diff-review.md'
