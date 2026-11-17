# Item 7.1 plan review brief (Claude Fable)

Review the item plan `/home/tyler/code/raven-wt/np-7.1/.agents/rounds/2026-11-16-next-phase/items/7.1/PLAN.md` against the repository in the worktree `/home/tyler/code/raven-wt/np-7.1` (branch
`np/7.1-case-search-guard` at `131c6c1c`). Inputs it rests on: `/home/tyler/code/raven-wt/np-7.1/.agents/rounds/2026-11-16-next-phase/items/7.1/OPTIONS.md`,
`/home/tyler/code/raven-wt/np-7.1/.agents/rounds/2026-11-16-next-phase/items/7.1/ASSESS-FABLE.md`, `/home/tyler/code/raven-wt/np-7.1/.agents/rounds/2026-11-16-next-phase/items/7.1/ASSESS-SONNET.md`, `AGENTS.md`, `.agents/README.md` ("Retention"),
`eval/qa/README.md` ("Held-out split"), `eval/run-routing.mjs`, `.gitignore`.

Check:
1. Every fact the plan states (paths, counts, cited files, test commands, script names). Re-measure
   what you can by counts and source only.
2. Whether the decision and each disposition are sound, and whether any step is unsafe: in
   particular the flush of 109 JSON files (is any of them cited by a current artifact, a test, a
   script or CI, by full path, relative path or basename?), the main-checkout `tmp/` archive, the
   hook's deny list and fail-open behavior, the ratchet's design and runtime, and the runner change.
3. Missing gates, tests or risks, and anything the executor brief must say that the plan omits.

Write findings to `/home/tyler/code/raven-wt/np-7.1/.agents/rounds/2026-11-16-next-phase/items/7.1/REVIEW.md`: numbered, each with severity (blocker, major, minor), evidence,
and the fix you propose. Keep it under about 150 lines. Edit no other file; do not commit.

Rules:
- Never open a QA case or its content: `eval/qa/corpus/`, `eval/corpus/`, `eval/qa/cases.json`,
  `eval/qa/sample.json`, `eval/qa/tool-cases.json`, `eval/qa/results/`, `eval/qa/reviewed/`, the files
  inside `.agents/rounds/2026-11-02-golden-audit/` and `.agents/rounds/2026-11-14-golden-coverage-audit/`,
  and the main checkout's `tmp/`. Use counts, hashes, sizes, git history and script source. Listing
  file names with `git ls-files` is fine.
- Every repo-wide grep excludes the case folders, for example
  `git grep <pattern> -- ':!eval/qa' ':!eval/corpus'` (add the two golden rounds when your pattern
  could match their text). To list matches without printing lines, use `git grep -l` or `-c` or `-o`.
  The Claude Code Grep and Glob tools search the whole tree too: pass a path or glob that excludes the
  case folders.
- No model-calling run, no subagents. Do not touch other terminals.
- When done, run: `hc send t1wn '/home/tyler/code/raven-wt/np-7.1/.agents/rounds/2026-11-16-next-phase/items/7.1/REVIEW.md'`
