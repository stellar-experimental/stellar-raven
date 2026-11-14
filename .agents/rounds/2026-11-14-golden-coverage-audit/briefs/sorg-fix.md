# Lane brief: sorg-fix (apply the review to the stellar.org source)

You continue as author on branch `feat/stellar-org-source`. Read `decisions/SORG-REVIEW.md` in full.

1. Merge `origin/main` first (the battery changed in PR 438); regenerate anything a script owns.
2. Apply every finding as the reviewer wrote it: the two blocking fixes (path guard percent forms,
   the quadratic tag pattern) each with a regression test built from the reviewer's failing input;
   the cuts the reviewer recommends (partner rows, the drift classifier); the rule 3 sentence; the
   stale docs. Where a fix cannot be applied as written, stop and say why.
3. Re-run the routing gate and report any change against the reviewer's numbers.
4. Gates bare with exit codes: `npm run typecheck`, `npm test`, `npm run build`,
   `npm run test:smoke`, `npm run eval:routing -- --gate`, the CI "generated artifacts in sync"
   sequence then `git diff --exit-code`, `npm run secrets:scan -- --tree`.
5. Commit `decisions/SORG-REVIEW.md` and the briefs. Append "Review reconciliation" to
   `decisions/SORG.md`: each finding, what you did, the added and removed line counts, gate exit
   codes. Update `.agents/TODO.md`: the entry "Decide whether stellar.org pages outside Docs belong
   in a Raven source" becomes what remains (verify Worker egress to stellar.org after deploy; a
   scoped QA run on the affected cases; the Blend audit and Anchor Directory facts the source does
   not hold). Push.
