# Brief: Codex fix review for round item 1.2 (one short pass, 30 minutes)

You reviewed `stellar-org.ts` at `ada75c0d` (your `tmp/1.2-codex-review.md`). The executor has
now committed fixes for your X1 to X5 on this branch. Same rules as before: read-only on the
tree, write only `tmp/1.2-codex-fix-review.md` and scratch under `tmp/1.2-probes/`, keyless
stellar.org reads only (at most about 15), no model call.

Read the diff: `git diff origin/main...HEAD -- src test research .agents/TODO.md`, plus
`.agents/rounds/2026-11-16-next-phase/items/1.2/PLAN.md` (triage and "Reconciliation" sections)
and `EXEC.md` next to it.

Attack three things first:
1. **Linear time of the raw-text end search (R1).** Try to make the new scanner, `mainHtml`,
   `htmlToText` or `documentTitle` super-linear: repeated `</script ` without `>`, many start tags
   without an end, mixed case, `</scriptx`, nested `<head>`/`<template>`, an unterminated comment
   before and after a raw-text element. Time 0.95 MB and 1.9 MB inputs.
2. **`svg` content (R2) and anything the new scanner now drops or leaks** that the old one did
   not: compare old and new extraction on your earlier fixtures and on hostile ones.
3. **The live before/after diff (R6)** that EXEC.md reports: is the comparison sound?

Then confirm X1 to X5 are each closed as you would have fixed them, and say if anything new on
the fetch boundary appeared.

File format: header; one-line verdict (fit to merge / not, with counts); findings `Y1`... with
severity, `file:line`, input, observed result, smallest fix; a closed/not-closed line for each of
X1 to X5. Then run: `hc send t1r9 '/home/tyler/code/raven-wt/np-1.2/tmp/1.2-codex-fix-review.md'`
