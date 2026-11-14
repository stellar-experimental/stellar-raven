# Lane brief: scope-finalize (apply the review, activate, push)

You continue as author on branch `audit/scope-decisions`. Read `decisions/REVIEW.md` and the
`golden-truth` skill. Apply every finding exactly as the reviewer wrote it:

1. F1, F5: amend `q-comp-xlm-us-classification` (answer, keyFacts, avoid; update `truth.verified`,
   keep the SDF letter in `truth` only).
2. F6: amend custody KF3.
3. F2: date the negative claim in `q-defi-agentic-payment-standards-compare`.
4. F4: reword the EURC note.
5. F3 option (a) and F7: activate both proposals through the lifecycle (move the files, state
   `active`, `truth.verified.by` names the reviewer, remove both `openSlots`), update the five
   register reasons and the tombstone reviewer field.
6. Commit `decisions/REVIEW.md` and the review brief. Update the `.agents/TODO.md` entry "Finish the
   2026-11-14 golden coverage audit": the scope advice is applied (name the outcome in two lines),
   the envelope-trap decision is "add nothing" (the 503 path is pinned in `test/adapters.test.ts`),
   and `sls-119` is `verified` and unposted. Add the same to the round ledger's owner-decision list.
7. Run the gates in `briefs/scope-apply.md` bare, plus
   `npm run eval:qa:lint -- --since origin/main --stale`. Append a "Review reconciliation" section
   to `decisions/APPLY.md` with each finding, what you did, and gate exit codes. Push the branch.

If a reviewer fix cannot be applied as written, stop and say why instead of improvising.
