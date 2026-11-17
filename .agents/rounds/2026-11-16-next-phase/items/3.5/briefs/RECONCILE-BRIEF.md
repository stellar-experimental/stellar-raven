# Brief: reconcile the item 3.5 token review

Read `.agents/rounds/2026-11-16-next-phase/items/3.5/REVIEW-TOKEN.md`. The lead adopts all six
findings. Same rules as your execution brief (held-out, no spend, hooks on, no push).

1. `src/policy/identifier-token.ts` comment: split the accepted cases. The still-read space-joined
   dates (`SEP 10, 2024`, `10 SEP 24`, `2024/SEP-10`) are an accepted false mark: the host cannot
   tell a date from a standard there, and a number and a space before a standard is common in real
   queries (the replay has four). The dropped token is a missed mark, never a false one.
2. Same comment and the test name: the rule drops any token that directly follows a digit and `-`
   or `.`, even the only standard named (`BLS12-381-CAP-59` reads nothing; `CAP-46-SEP-45` reads
   `cap-46`). Pin `BLS12-381-CAP-59` as `[]`. The lead accepts the wider class; no rule change.
3. `ARCHITECTURE.md:215`: "the token is not followed by a dash or dot and a digit, and not preceded
   by a digit and a dash or dot (…)".
4. Pins: `SEP-6,SEP-24` reads both; `10 SEP 24` reads `sep-24` (accepted false mark); `x-SEP-10`
   reads `sep-10`; `9-SEP-10` reads nothing.
5. EXEC.md replay paragraph: no replay query holds a digit followed by `-` or `.`; the old and new
   rules read the same tokens from all 98 queries (REVIEW-TOKEN.md); the date behaviour rests on the
   unit and provider tests.
6. EXEC.md: cite split v6 as the current split (`.agents/TODO.md`, `eval/qa/tuning-rows.mjs`), fix
   line 16's commit reference, replace the "has not run" residual with a pointer to REVIEW-TOKEN.md,
   and fix the "missed exact mark, never a false one" sentence as in 1. Add a "Token review
   reconciliation" section listing each finding and what you did.

Amend nothing already committed; add one commit "Reconcile the item 3.5 token review" with the code
and test changes, REVIEW-TOKEN.md, both review briefs and the EXEC.md updates. Run
`npm run typecheck` and `npx vitest run test/identifier-token.test.ts test/executor-providers.test.ts`
bare, then `npm test` bare, and record the results in EXEC.md before committing. Then report the
EXEC.md path as before.
