# Item 6.2: Codex frontier diff review

You review branch `np/6.2-docs-titles` against `origin/main` (`git diff origin/main...HEAD`) in
`/home/tyler/code/raven-wt/np-6.2`. You are the required independent review for a routing
re-baseline. Parent: the 6.2 lead (`t1v9`).

## Rules

- Every repo-wide search is `git grep ... -- ':!eval/qa' ':!eval/corpus'`. Never a bare `grep -r`
  or `rg` over the repo.
- Never open a QA case or anything under `eval/qa/corpus/`, `eval/qa/results/`, `eval/qa/reviewed/`,
  `eval/qa/cases.json`, `sample.json` or `tool-cases.json`. Never run the QA lint. Do not run
  `amend-split-v11.mjs` and do not open `tmp/6.2/EXPOSURE.md` or any split file under `~/backups`.
- Never print the stdout of `node eval/run-routing.mjs`: it prints the holdout table. Redirect it to
  `tmp/6.2/codex-*.txt` and compare result JSONs with `node tmp/6.2-compare.mjs <base> <variant>`
  (holdout counts only). Holdout routing rows are counts only.
- No model-calling run and no paid call. Do not edit tracked files. You cannot write under
  `.agents/`: write your report to `tmp/6.2/CODEX-REVIEW.md`.

## Read

`/home/tyler/code/raven-wt/np-6.2/.agents/rounds/2026-11-16-next-phase/items/6.2/PLAN.md`, `/home/tyler/code/raven-wt/np-6.2/.agents/rounds/2026-11-16-next-phase/items/6.2/RESULTS.md`, `/home/tyler/code/raven-wt/np-6.2/.agents/rounds/2026-11-16-next-phase/items/6.2/EXEC.md`, `eval/gates.json`, `eval/README.md`,
`.agents/skills/run-evals/SKILL.md` (section 6, re-baseline rule).

## Check

1. Re-run the routing runner on the `origin/main` manifest (`git show origin/main:catalog/manifest.json > tmp/6.2/codex-base-manifest.json`, then `--manifest`) and on the branch manifest, and
   confirm every number in the new `gates.json` note and accepted totals: legacy, extended, skills,
   protocol history, and the holdout lane by count. Confirm `npm run eval:routing -- --gate` passes
   on the branch (stdout to a file).
2. The re-baseline fields: accepted totals, band block, evidence hash, `baselinedAt`/`localTrace`,
   floors and ceiling untouched, note accuracy.
3. Generated files: `inventory/stellar-docs-titles.json`, `catalog/manifest.json` and
   `specs/super-spec.json` match what their scripts produce (rebuild into `tmp/` with `--out` where
   the script supports it, or compare after a dry rebuild you then discard with `git checkout`).
4. `items/6.2/ab-run.mjs` and `blind.mjs`: any defect that could have leaked the arm to a judge or
   mis-scored a pair (compare `blind.mjs --score` output in RESULTS.md against the code's logic).
5. Text edits (`scripts/summarize-live-drift.mjs`, `inventory/README.md`, `.agents/TODO.md`): any
   remaining live text that still describes the titles hold (dated records excepted).
6. The split commit: `eval/qa/tuning-rows.mjs` count, dated briefs and PRESTAGE point at the same
   v11 SHA-256 and counts as the TODO; no case id or golden text appears in any committed file.

Write findings as a numbered list with severity (blocking / should-fix / low), evidence and the fix,
and a final PASS or FAIL line, to `tmp/6.2/CODEX-REVIEW.md`. Then run
`hc send t1v9 '/home/tyler/code/raven-wt/np-6.2/tmp/6.2/CODEX-REVIEW.md'`.
