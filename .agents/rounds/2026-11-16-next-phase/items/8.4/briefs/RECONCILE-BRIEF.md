# Item 8.4: reconcile the Codex review

Read `/home/tyler/code/raven-wt/np-8.4/.agents/rounds/2026-11-16-next-phase/items/8.4/CODEX-REVIEW.md` (Codex workhorse `gpt-6.2-sol`, high).
Adopt both findings:
1. `.agents/model-roster.md` (around line 101): replace "When its launch fails, fall back to the
   previous model and report." with wording that never selects a version by hand, e.g. "When
   resolution or the launch fails, record the reason and take the lane's tier fallback."
2. Remove the trailing space at `.agents/rounds/2026-11-16-next-phase/items/8.4/EXEC.md` line 132.
Then add a "Codex review reconciliation" section to EXEC.md, run `git diff --check origin/main..HEAD`
and `npm run secrets:scan -- --tree` bare, and commit (normal hooks; trailer with your exact model
name) including the copied `CODEX-REVIEW.md` and `briefs/CODEX-BRIEF.md` and this brief. Same
rules as your first brief. Send only the EXEC.md path to t1z6 when done.
