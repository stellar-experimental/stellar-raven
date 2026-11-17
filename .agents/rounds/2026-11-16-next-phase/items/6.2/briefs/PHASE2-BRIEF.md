# Item 6.2: executor phase 2

The rule's outcome is **absorb**. Both second opinions agree: `/home/tyler/code/raven-wt/np-6.2/.agents/rounds/2026-11-16-next-phase/items/6.2/SECOND-OPUS.md` and
`/home/tyler/code/raven-wt/np-6.2/.agents/rounds/2026-11-16-next-phase/items/6.2/SECOND-FABLE.md`. Read both. Every rule of `EXEC-BRIEF.md` still binds.

Do, in order:

1. **Plan step 7a.** Commit B (`eval/gates.json` re-baseline exactly as PLAN.md 7a lists; the
   "Independent review:" line names Codex frontier `gpt-6-astra` high with
   `.agents/rounds/2026-11-16-next-phase/items/6.2/CODEX-REVIEW.md` as "outstanding when this was
   written"; the lead updates it after the review). In the note, give the A/B as: 60 of 60 answered
   on Claude Fable, Opus 5.5 and Sonnet 5.5, blind-graded, FRESH 0 losses, 1 win, 29 ties, rule
   outcome absorb, both second opinions absorb, and link RESULTS.md. Then `npm run eval:routing -- --gate`
   exits 0 with stdout to a file. Then commit C (text edits in 7a).
2. **Records in RESULTS.md**, before you commit it: a short "Second opinions" section (both absorb,
   links) and a "Limits" section carrying the second opinions' caveats in a few lines each: "no
   detectable harm", not "FRESH is better"; the X/Y imbalance (HOLD was X in 22 of 30); the rule
   2(b) degenerate case when `R` is empty (it did not arise here; `blind.mjs` is left as
   pre-registered, and any reuse must fix it); the Varial probe did not separate the arms (identity
   rests on `sourceRevision`, clean tree and manifest hashes); the third lost row (holdout) was not
   tested; only Claude clients were run.
3. **Plan step 8.** Finish EXEC.md (every gate's short output summary, every deviation, including the
   "Varial" probe not discriminating), copy the two verdict files into the item folder as
   `verdicts-opus.json` and `verdicts-fable.json`, and commit the records (EXEC.md, RESULTS.md,
   SECOND-*.md, verdicts, briefs).
4. **Gates, bare:** `npm run typecheck`, `npm test`, `npm run build`, `npm run eval:routing -- --gate`
   (stdout to a file), `npm run secrets:scan -- --tree`. Summarize each in EXEC.md.

Do not push. When done, run `hc send t1v9 '/home/tyler/code/raven-wt/np-6.2/.agents/rounds/2026-11-16-next-phase/items/6.2/EXEC.md'` and wait for the lead (the Codex
review comes next, and you reconcile its findings).
