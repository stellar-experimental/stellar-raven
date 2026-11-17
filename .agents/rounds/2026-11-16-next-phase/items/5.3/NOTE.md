# Orchestrator note for item 5.3 (2026-11-17)

Item 5.3 is an owner follow-up that is not in PLAN.md. This note defines it and binds over
ITEM-LEAD.md. Start from current `origin/main` (5646570d or later). Item slug: `5.3-lint-no-golden-text`.

Owner, 2026-11-17: "If this is worth anything do it, but maybe carefully eval with a fable agent
first". A Fable evaluation said do it. Its verdict is `/home/tyler/code/raven-wt/orch/5.3-EVAL-FABLE.md`.
Use it as the starting draft for the plan.

## Scope: one PR

Do the TODO item "Stop QA lint from printing golden text" (`.agents/TODO.md`), with the two
adjustments in the evaluation:

1. In `eval/qa/lint-corpus.mjs`, no warning or error message interpolates golden, question or answer
   text. Print the case id, the check name and a field path with non-text metadata instead, for
   example `golden.keyFacts[2] (104 chars)`, `golden.avoid[1] [beyond-support]` or
   `golden.notes sentence 3`. Dates, finding ids and pattern labels may stay. The evaluation lists
   the sites. Re-find them all yourself from the source, and include `lintLiveContract` and every
   other lane.
2. Add a test in `test/qa-corpus-lint.test.mjs` or beside it. Put a marker string in every
   judge-facing field of a fixture case (question, answer, key facts, avoid, notes). Trip every
   text-bearing check, and assert the marker is in no `finding.message`. One spawned CLI run on a
   fixture directory also covers `printFindings`, if the lint can be pointed at a fixture corpus.
   Add no opt-in flag that shows the text.
3. Delete the TODO item, and add the round ledger row.

## Held-out integrity: binding on you and every child

The lint exists to read the real corpus, and until this fix lands its output shows golden text. The
held-out and reserve sets must not be seen.

- Nobody in this lane runs `npm run eval:qa:lint`, `node eval/qa/lint-corpus.mjs` or any lint lane
  against the real corpus with output reaching a screen, a pipe such as `tail`, or a file someone
  reads. That covers you, the Fable reviewer and the Sonnet executor. Say this in each child's brief.
- Nobody opens files under `eval/qa/corpus/`, `eval/qa/cases.json`, `eval/qa/sample.json`,
  `eval/qa/tool-cases.json`, `eval/qa/results/` or `eval/qa/reviewed/`, or greps them for text.
  Reading the lint source and the test fixtures is fine.
- The real-corpus check after the fix is done once, by the executor, as follows:
  - Send the lint's stdout and stderr to a file under `/tmp` that nobody reads.
  - A script (write it to the scratch folder, not the repo) loads every case's judge-facing
    strings, takes each string or each run of 40 characters or more, and counts how many appear in
    that file.
  - The script prints only the exit status of the lint, the count of findings by check name, and
    the leak count. It prints no case id, no text and no line of the lint output.
  - A leak count of 0 passes. If it is not 0, fix the remaining site from the source and repeat.
  - Delete the output file afterwards.
- CI runs the lint on the PR. Do not read the CI log's lint step. `gh pr checks` pass or fail is
  enough.
- If anyone sees golden text anyway, stop and report the moment, the channel and the number of cases
  that may be seen. Do not look further to find out which. The orchestrator amends the split.

## Gates

`npm run typecheck`, `npm test`, `npm run build` and the secrets scan. Run the QA lint only by the
counting procedure above. No model-calling command. USD 0.

## Report

Per ITEM-LEAD.md. In the report, give the sites changed, the test name, the counting result
(findings by check, leak count) and the PR number.
