# Item 8.3 executor, round 3: the Codex re-check

Read `.agents/rounds/2026-11-16-next-phase/items/8.3/CODEX-RECHECK.md`. Three items remain. All are
adopted:

1. **Finding 3 (blocker).** `compare-architecture-ab.mjs` must detect a judged input from the
   rows as well as from the metadata: any row with a non-null verdict score makes the arm judged,
   and then requires an exact judge ID. Change the answer-only test so its rows carry no verdict,
   and add the reviewer's probe as a refusal test: scored rows with both judge metadata fields
   null.
2. **Finding 4 (blocker).** Wherever a reader trusts a Playground judge identity (the v3 metadata
   validator at read time and the re-judge tuple guard), check `judge.resolvedModel` against the
   eligible verdicts' `resolvedModel`. Every eligible verdict that reports one must equal it, and
   a conflict refuses. Unresolved legacy v3 artifacts stay readable. Add the reviewer's probe as a
   test: `judge.resolvedModel` `claude-sonnet-5-6` against a verdict reporting
   `claude-sonnet-5-5` must refuse. Correct EXEC.md's earlier note that Playground rows carry no
   model field.
3. **New should-fix.** `judge-stability.mjs` derives judge provenance only from the rows that
   actually contribute verdicts or pairs. A file that contributes none adds no identity. Add the
   reviewer's empty re-judge probe as a test.

The same rules as before apply (`briefs/exec.md`). Commit `CODEX-RECHECK.md` unchanged with your
fix. Append a "Round 3" section to EXEC.md (a disposition and a test for each item, then the
gates). Commit it, and report with `hc send <lead terminal> '<abs EXEC.md path>'`.
