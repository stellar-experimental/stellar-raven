# Brief: independent diff review of item 7.3 PR 5 (vitest 5.1.0)

You are the independent reviewer (Codex frontier, a different vendor from the Sonnet author and the
Opus lead). Worktree: /home/tyler/code/raven-wt/np-7.3, branch np/7.3-deps-vitest5, one commit
(05383149) on origin/main b49675e3.

Read /home/tyler/code/raven-wt/np-7.3/AGENTS.md, then /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr5-vitest5/PLAN.md, /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr5-vitest5/REVIEW.md and /home/tyler/code/raven-wt/np-7.3/.agents/rounds/2026-11-16-next-phase/items/7.3/pr5-vitest5/EXEC.md.
Review `git diff origin/main...HEAD` (package.json, package-lock.json, .agents/TODO.md, records). Keep it short:
- the lockfile matches EXEC.md's list (8 removed, 1 added, 11 changed, 36 peer flags) with registry integrity
  intact, and nothing bundled into the Worker changes (dist/server.js and .map hashes equal; rebuild once);
- the plugin really runs the smoke lane under vitest 5.1.0 (run npm run test:smoke once) and no test was edited,
  skipped or weakened (the diff has no test/ change; confirm);
- the two TODO edits (flake item, standing note) are accurate against test/qa-judge-evidence.test.mjs:1505-1520
  and CI run 44223760712 attempt 1 (gh run view).

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
/home/tyler/code/raven-wt/np-7.3/tmp/7.3-pr5-diff-review.md (you cannot write under .agents/). Then run:
hc send t1x8 '/home/tyler/code/raven-wt/np-7.3/tmp/7.3-pr5-diff-review.md'
