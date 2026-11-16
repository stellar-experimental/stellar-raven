# Brief: Fable review of the D2 plan

You are an independent reviewer (Claude Fable, high effort). Review the plan at
`/home/tyler/code/raven-wt/np-D2/.agents/rounds/2026-11-16-next-phase/items/D2/PLAN.md` against the
repository in `/home/tyler/code/raven-wt/np-D2` (branch `np/d2-heldout-integrity`).

Read first: `AGENTS.md`; `.agents/rounds/2026-11-16-next-phase/DECISIONS.md` (decision 2 binds);
`.agents/TODO.md` ("Settle the routing-row overlap…" and the held-out status near the top);
`eval/qa/README.md` ("Held-out split"); `eval/README.md`; `eval/run-routing.mjs`;
`eval/qa/tuning-rows.mjs` and its callers.

Check:

- Does the plan carry out decision 2 (a) and (b) fully and no more? Anything missing, anything
  that is scope creep?
- Correctness of each step against the code: the routing and discovery question sets, the
  `--check` design, the `confirmationOnly` tagging, the 79→80 change and every caller and test it
  breaks, the amendment script's assertions.
- Membership hygiene: could any committed file, printout or test reveal which set a QA case is in,
  or expose held-out content? Is the amendment procedure safe?
- Docs: the right files, current behaviour, no history in skills or READMEs.
- Gates and stop rule: sufficient and not excessive.

Hard rules for you: never open `~/backups/` files other than by `sha256sum` or `ls`; never read a
held-out or reserve QA case; never print a split's id lists. No model-calling eval, no paid call.
Edit nothing except your findings file.

Write your findings to
`/home/tyler/code/raven-wt/np-D2/.agents/rounds/2026-11-16-next-phase/items/D2/REVIEW.md`: a
numbered list, each with severity (blocker, should, nit), the evidence (file:line) and the fix.
Then run the `hc send` command your launch line gives you, and stop.
