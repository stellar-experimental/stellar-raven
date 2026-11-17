# Brief: Codex frontier review of the item 5.1 diff

You review round item 5.1 on agentpc in the worktree `/home/tyler/code/raven-wt/np-5.1`, branch
`np/5.1-remove-matchpartners`. The diff is `origin/main...HEAD`. Do not edit tracked files. Write
your review to `tmp/5.1/CODEX-REVIEW.md` (you cannot write under `.agents/`; the lead copies it).

## Read

- `AGENTS.md`.
- `.agents/rounds/2026-11-16-next-phase/items/5.1/PLAN.md` (the reconciled plan), `EXEC.md`,
  `REVIEW.md`.
- `/home/tyler/code/raven-wt/orch/5.1-NOTE.md` (binding scope).
- `.agents/skills/run-evals/SKILL.md` section 6, `.agents/skills/improvements-pipeline/SKILL.md`.

## Held-out rules (binding)

- Run every `npm run eval:routing` command with stdout and stderr redirected to a file under
  `tmp/5.1/codex/`. Never display that log. Read only lines starting with `GATE` and the
  `results -> ` line, with `grep`.
- In a results file, never read the `holdoutCases` array. Read `holdoutLane` aggregate keys only.
  Never print a row with `confirmationOnly: true`; count those rows.
- Never open `eval/holdout-cases.json`, `eval/qa/corpus/`, `eval/qa/cases.json` rows, any file
  under `~/backups/`, or `tmp/5.1/EXPOSURE.md`. Do not run `eval:qa:lint` with visible output;
  redirect it to a file and read only its exit status.
- No model-calling eval, no paid call, no server, no upstream post.

## Check

1. Re-run the routing comparison on both manifests:
   - base: `git show origin/main:catalog/manifest.json` to a file, with `--manifest`;
   - new: HEAD;
   - both with `--dump-ranked`.

   Then confirm EXEC.md's lane table, holdout aggregates (captures 10 to 11, passed 25 to 24, other
   holdout aggregates equal) and listed-row ids. Also run `npm run eval:routing -- --gate` on HEAD:
   it must pass.
2. `eval/gates.json`. The fingerprint must equal the HEAD manifest SHA-256. Check the holdout
   fields, `maxForbiddenCaptures`, `baselinedAt`, `localTrace`, `holdoutNote`, and that the new
   `evidence.notes` lead is accurate and complete per the note and `run-evals` section 6. Confirm
   that the other input hashes are unchanged.
3. The exposure boundary (ADR-0003):
   - nothing emitted or served still references the operation;
   - the scrub and guards hold;
   - the adapter test change keeps meaning.
4. Generated files are in sync: rerun the CI generators and confirm a clean tree.
5. Test retargets are correct and not weakened beyond the count changes.
6. `src/mcp/tools.ts` wording change: is it correct and safe?
7. The finding `improvements/stellar-light-scout/sls-123-*.md` and its index entry: accurate, and
   free of internal terms and production counts. Check the issue URL by reading it with `gh`.
8. The split amendment: `items/5.1/amend-split-v8.mjs`, `eval/qa/tuning-rows.mjs` and the dated
   brief pins. Check them by reading the code only, never the split file. No id may appear in any
   prose.
9. Anything else wrong in the diff.

## Output

`tmp/5.1/CODEX-REVIEW.md`: numbered findings with severity (blocking, should-fix, nit), evidence
(file:line or command), and a proposed fix; then the commands you ran with short results; then a
one-line verdict (PASS or FAIL).
