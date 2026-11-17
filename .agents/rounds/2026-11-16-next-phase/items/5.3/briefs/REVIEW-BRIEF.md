# Fable plan review, item 5.3

You review a plan; you change no repository file except the review file below.

- Worktree: `/home/tyler/code/raven-wt/np-5.3` (branch `np/5.3-lint-no-golden-text`, from `origin/main`).
- Plan: `.agents/rounds/2026-11-16-next-phase/items/5.3/PLAN.md`.
- Its inputs, in the same folder: `NOTE.md` (the orchestrator's scope, binding) and `EVAL-FABLE.md`.
- Rules: `AGENTS.md`, `eval/qa/README.md`.
- Code: `eval/qa/lint-corpus.mjs`, `eval/qa/compile-qa.mjs`, `eval/qa/strkey.mjs`,
  `eval/qa/lifecycle.mjs`, `scripts/build-catalog.mjs` (`assertNoNonExposedRefs`),
  `scripts/emitted-text-guard.mjs`, `test/qa-corpus-lint.test.mjs`,
  `test/qa-live-contract-lint.test.mjs`, `test/qa-lifecycle.test.mjs`, `test/fixtures/qa-corpus/`,
  `.github/workflows/ci.yml`, `.github/workflows/refresh.yml`.

## Held-out integrity (binding)

- Never run `npm run eval:qa:lint`, `node eval/qa/lint-corpus.mjs`, `npm run eval:qa:compile` or
  any lint lane against the real corpus. Running the lint's exported functions or the CLI on
  fixtures you build under `/tmp` is fine.
- Never open, cat, grep or list the contents of anything under `eval/qa/corpus/`,
  `eval/qa/cases.json`, `eval/qa/sample.json`, `eval/qa/tool-cases.json`, `eval/qa/results/` or
  `eval/qa/reviewed/`. Grep only named source, test and workflow files, never the whole repo or
  `eval/` recursively.
- If you see golden text anyway, stop, write the moment, the channel and the number of cases that
  may be seen into the review file, and report. Do not look further.

## Check

1. Completeness: every place in the lint path (both CLI modes, every lane, `printFindings`, the
   `main` catch, errors thrown by imported modules) where question, answer, key-fact, avoid or notes
   text, or a fragment of it, can reach stdout or stderr. Name any site the plan misses, with file
   and line.
2. The "kept as is" list: is each keep safe?
3. The new message formats: still actionable for whoever fixes the warning; no text leak through
   metadata.
4. The test design: does it trip every text-bearing check, can it pass vacuously, is the CLI run
   feasible as described (`QA_REPO_ROOT`, the options `main` needs), and does the "fails on `main`"
   check work.
5. The real-corpus counting procedure against NOTE.md: does it detect a leak of any judge-facing
   string, including strings under 40 characters and fragments such as the cap-finding's 140-char
   slice; does the script itself risk printing text.
6. Gates and stop rule: sufficient and runnable.

## Hard limits

No model-calling eval, no paid call, no upstream post, no commit.

## Output

Write `.agents/rounds/2026-11-16-next-phase/items/5.3/REVIEW.md`: numbered findings, each with
severity (blocking / should-fix / nit), the evidence (file and line), and the concrete change to
the plan. Then run the report command from your launch line.
