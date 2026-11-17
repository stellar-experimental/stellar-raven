# Brief: Fable review of the item 1.2 plan

You are the Claude Fable plan reviewer for round item 1.2. Review only; edit no file except your
findings file.

Read:
- `.agents/rounds/2026-11-16-next-phase/items/1.2/PLAN.md` (the plan, with its triage table).
- `.agents/rounds/2026-11-16-next-phase/items/1.2/CODEX-REVIEW.md` (the vendor-diverse review the
  triage answers).
- `src/adapters/stellar-org.ts` and `test/stellar-org-adapter.test.ts` (the code the fixes touch).
- `AGENTS.md`, and item 1.2 in `.agents/rounds/2026-11-16-next-phase/PLAN.md` and `DECISIONS.md`.

Check, against the repository:
1. Is each disposition right? Is any low finding better waived than fixed, or any "no change"
   (X6, X7) actually a defect?
2. Is each fix the smallest correct one? Attack the X3/X4 scanner design hardest: HTML raw-text
   semantics for the element set chosen, linear time, interaction with `mainHtml`'s `<main>`
   depth tracking and the existing nested-`svg` test, and anything the new scanner could now
   drop or leak that the old one did not.
3. Are the caps (title 300, tags 10 x 200, header excerpt 200) sound for the live site and the
   host's 6k-token return cap? Should clipping be flagged?
4. Are the tests enough, and are the docs edits right (TODO bullet, research design section, spec
   untouched)?
5. Gates, stop rule, fix-review step, deploy note: anything missing or excessive for spend?

No model-calling eval, no paid call, no upstream post. Keyless reads of stellar.org are allowed
but not expected.

Write findings to `.agents/rounds/2026-11-16-next-phase/items/1.2/REVIEW.md`: header (reviewer,
model, effort, date), a one-line verdict, then numbered findings (`R1`...) each with severity
(blocking / should change / nit), the plan text it targets, and the change you want. Keep it
short. Then run: hc send t1r9 '/home/tyler/code/raven-wt/np-1.2/.agents/rounds/2026-11-16-next-phase/items/1.2/REVIEW.md'
