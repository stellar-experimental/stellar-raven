# Item 7.1 assessor brief (Sonnet)

You are one of two independent assessors for round item 7.1 of stellar-raven-codemode. The other
assessor works separately; you will not see its answer and it will not see yours. Do not read
`/home/tyler/code/raven-wt/np-7.1/.agents/rounds/2026-11-16-next-phase/items/7.1/ASSESS-*.md` files other than your own.

Worktree: `/home/tyler/code/raven-wt/np-7.1` (branch `np/7.1-case-search-guard`). Read-only for you,
except your output file.

## Task

1. Read `AGENTS.md` and the options brief `/home/tyler/code/raven-wt/np-7.1/.agents/rounds/2026-11-16-next-phase/items/7.1/OPTIONS.md`. Follow its "Ground rules for
   assessors" exactly.
2. Check the brief's facts where you can cheaply (script source, `package.json`, `.github/`,
   `.gitignore`, tool behavior in a scratch directory outside the repo). In particular, if your
   session has Claude Code `Grep` or `Glob` tools, test in a scratch git repo with canary files
   whether they honor a root `.ignore`, and whether an explicit path into an ignored directory still
   searches it. Say plainly if you do not have those tools.
3. Answer the brief's five questions. For every option give pros, cons and a verdict
   (adopt, adopt in part, reject). End with one recommended combination, the exact path lists you
   would use, and the tests you would require.
4. Write your assessment to `/home/tyler/code/raven-wt/np-7.1/.agents/rounds/2026-11-16-next-phase/items/7.1/ASSESS-SONNET.md`. Keep it under about 250 lines.
   Do not edit any other file. Do not commit.

## Rules

- Never open a QA case or its content: `eval/qa/corpus/`, `eval/corpus/`, `eval/qa/cases.json`,
  `eval/qa/sample.json`, `eval/qa/tool-cases.json`, `eval/qa/results/`, `eval/qa/reviewed/`, and the
  dated records the brief's fact 3 names. Use counts, hashes, sizes, git history and script source.
- Every repo-wide grep excludes the case folders, for example
  `git grep <pattern> -- ':!eval/qa' ':!eval/corpus'`. The Claude Code Grep and Glob tools search the
  whole tree too: pass a path or glob that excludes the case folders.
- No model-calling run and no paid call. No subagents. Do not touch other terminals.
- When done, run: `hc send t1wn '/home/tyler/code/raven-wt/np-7.1/.agents/rounds/2026-11-16-next-phase/items/7.1/ASSESS-SONNET.md'`
