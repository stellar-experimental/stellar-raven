# Item 6.1 execution brief (Claude Sonnet 5.5, high)

You carry out the reconciled plan for round item 6.1: upgrade `@cloudflare/codemode` 0.5.1 to 0.5.6.

- Worktree: `/home/tyler/code/raven-wt/np-6.1`, branch `np/6.1-codemode-0.5.6`. Work only here.
- Plan: `/home/tyler/code/raven-wt/np-6.1/.agents/rounds/2026-11-16-next-phase/items/6.1/PLAN.md`. Its "Review reconciliation" section binds over the steps above it.
  Review: `/home/tyler/code/raven-wt/np-6.1/.agents/rounds/2026-11-16-next-phase/items/6.1/REVIEW.md`. Orchestrator's answer: `/home/tyler/code/raven-wt/np-6.1/.agents/rounds/2026-11-16-next-phase/items/6.1/QUESTION.md` ("Answer").
- Read `AGENTS.md` and `.agents/skills/improvements-pipeline/SKILL.md` first.
- Upstream packages, unpacked: `/home/tyler/code/raven-wt/np-6.1/tmp/6.1/pkgs/0.5.1/package` and `.../0.5.6/package`.

## Hard rules

- **Searches.** Every repo-wide search is `git grep ... -- ':!eval/qa' ':!eval/corpus'`. Never run a bare
  `grep -r` or `rg` over the repo. Never open anything under `eval/qa/` or `eval/corpus/` except
  `eval/qa/tuning-rows.mjs`, `eval/qa/split-amend.mjs`, and the one count-only check of
  `eval/qa/README.md` that the plan names. Never read a split file under `~/backups/` and never open
  `tmp/6.1/EXPOSURE.md`. The amend script reads them; it prints counts and the SHA-256 only.
- Never run the QA lint, a model-calling eval, or anything that calls AI Gateway, Workers AI or a provider API.
  Never post upstream.
- Do not start Wrangler or `npm run dev`. `test:smoke` and `mcp:surface` are fine.
- Commit on the branch with the normal hooks, never `--no-verify`. End every commit message with
  `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Commit 1 is the split v10 commit alone.
  Then the pin and spec-sandbox commits, the improvements commit, and the records commit (DECISIONS.md, TODO).
  Do not push. Do not edit the round ledger `.agents/rounds/2026-11-16-next-phase.md`; draft its row in EXEC.md.
- Run each gate bare (no pipe). On a stop-rule event, stop, write what happened in EXEC.md, and report.
- Do not start sub-agents.

## Output

Write `/home/tyler/code/raven-wt/np-6.1/.agents/rounds/2026-11-16-next-phase/items/6.1/EXEC.md`. It covers each step with what you did, a short summary of each gate's output, the
surface hashes before and after, the cs-012 console lines, the re-vendor checklist answers, the vendored-file
diff result, the amend script's printed counts, SHA-256 and reverifyBy figure, the lockfile package list,
any deviation from the plan with its reason, and the ledger row draft. Then run
`hc send t1v5 '/home/tyler/code/raven-wt/np-6.1/.agents/rounds/2026-11-16-next-phase/items/6.1/EXEC.md'`.
