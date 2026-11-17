# Brief: reconcile the item 5.1 Codex review

The Codex frontier review is at `.agents/rounds/2026-11-16-next-phase/items/5.1/CODEX-REVIEW.md`
(the lead copied it from `tmp/5.1/`). Verdict FAIL on one should-fix; everything else passes.
The same rules as in your EXEC-BRIEF.md apply.

1. **Finding 1 (adopt).** In `improvements/stellar-light-scout/sls-123-*.md`, replace "gets a 503
   on every call we observed" with a sentence true to the table. For example: "gets no match:
   every call we observed failed, and every call on 2026-11-17 returned 503 with `unavailable:
   true`." Then fix the same sentence in the open upstream issue
   https://github.com/Stellar-Light/stellarlight/issues/1976:
   - fetch the body byte-exact with `gh api repos/Stellar-Light/stellarlight/issues/1976 --jq .body`;
   - replace only that sentence;
   - write it back with `gh issue edit 1976 -R Stellar-Light/stellarlight --body-file <file>`;
   - read it back.

   Editing our own issue body is within decision 4: no pull request, and no new issue. Leave the
   snapshot link as is. Add a dated evidence line to the finding that the issue body was corrected
   on 2026-11-17. Run `npm run improvements:index` and `npm run improvements:lint -- --live`.
2. **`eval/gates.json`.** In the new `evidence.notes` lead, replace "Independent review: Codex
   frontier, GPT-6 Astra, high effort, outstanding when this was written." with: "Independent
   review: Codex frontier, GPT-6 Astra (gpt-6-astra), high effort, one should-fix on the finding's
   wording, adopted; it re-ran the runner on both manifests and reproduced every lane count and
   holdout aggregate in this note,
   .agents/rounds/2026-11-16-next-phase/items/5.1/CODEX-REVIEW.md." Make sure the gate still
   passes, since the note is not a fingerprinted input.
3. **Commit.** Add `CODEX-REVIEW.md`, `briefs/CODEX-REVIEW-BRIEF.md` and this brief. Add a short
   "Codex review reconciliation" section to EXEC.md. Commit, then push.
4. **Gates, bare.** `npm test`, `npm run eval:routing -- --gate` (log only, `GATE` line),
   `npm run improvements:lint`, `npm run secrets:scan -- --tree`.

Report with `hc send t1tm '<EXEC.md path>'`.
