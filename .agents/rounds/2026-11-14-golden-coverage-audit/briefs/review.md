# Brief: independent review of the applied audit

Read `briefs/common.md` first. Your lane is `review`. You are the independent reviewer for commit
`c7dbdc87` on branch `audit/golden-coverage` (`git diff origin/main...HEAD`). You did not write
it. Re-derive from the diff, the files, and the gates; do not trust the ledger or the lane
reports. Read `AGENTS.md` (hard rules, definition of done).

## Review

1. **Instrument code**: `eval/qa/lint-corpus.mjs`, `compile-qa.mjs`, `lib.mjs`, `judge.mjs`
   (fixture pins only), `.github/workflows/ci.yml`, and the tests. Is each deleted floor really
   safe to delete: name what, if anything, now goes unguarded. Do the new coverage rules do what
   `eval/qa/README.md` says? Any dead code, shim, or check weakened to pass? Is any deleted or
   rewritten test a lost guard? Is `tool-cases.json` wired so that the lane has its own
   denominator and never enters `cases.json` or `sample.json`?
2. **Lifecycle integrity.** Every id that was active on `origin/main` is now exactly one of:
   active headline, active tool lane, or retired with a tombstone that has a score-independent
   reason, a reviewer, the last digest, and (for a merge) a replacement id that is active. No id
   reused. Write a short script to prove it and give its output.
3. **Applied text against reviewed text.** For 30 rewritten cases chosen by a rule you state
   (cover all ten directories), compare the case file with its reviewed source (precedence:
   `coverage/overrides.json`, then `verify/*.json` `finalRewrite`, then `audit/*.json`
   `rewrite`). The script must have written the reviewed text and nothing else judge-facing.
4. **Read as the judge.** For the same 30, read question, answer, key facts, avoid, and notes.
   Flag an answer that is wrong or stale (check its most volatile claim live), a key fact a
   correct agent could not satisfy from another good source, a tool name or provenance in
   judge-facing text, and a merge survivor that lost the merged case's fact.
5. **Taxonomy.** `eval/qa/taxonomy.json` holds only what a lint needs. Each `openSlots` entry has
   an honest reason. Spot-check ten leaf assignments.
6. **Gates.** Run bare and record exit codes: `npm run typecheck`, `npm test`, `npm run build`,
   `npm run eval:qa:lint -- --stale --enforce-floors`,
   `npm run eval:qa:lint -- --since origin/main --stale`, `npm run eval:qa:register -- --check`,
   `npm run eval:selftest`, `npm run eval:routing -- --gate`,
   `npm run eval:qa:sentinels -- --check`.
7. **Docs.** `eval/qa/README.md`, `eval/qa/corpus/README.md`, and the golden-truth skill describe
   current behavior, with no history and no stale statement about floors or categories anywhere
   in live docs (`grep` for `CATEGORY_FLOORS`, "category floor", "35%", "scheduled share").

## Output

`.agents/rounds/2026-11-14-golden-coverage-audit/review/REVIEW.md`: findings ranked by severity,
each with file and line or case id, what is wrong, and the fix; then the lifecycle proof output,
the 30-case sample rule and results, and the gate table. State plainly whether the change is fit
to merge once findings are fixed. You write only that file.
