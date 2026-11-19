# Item 8.8 executor fixes (after the Codex Sol review)

Read `/home/tyler/code/raven-wt/np-8.8/.agents/rounds/2026-11-16-next-phase/items/8.8/CODEX-REVIEW.md` (Codex
Sol, `gpt-6.2-sol`). Apply these, same rules as your first brief, then add a commit on top (no amend):

1. Sol 1 (medium), wording only, no Worker change: the docs now say "hard cap". The cap is checked between
   provider calls against the Gateway-logged cost, so one call can overshoot it (`eval/playground/README.md`
   "Dollar accounting" already says so). In AGENTS.md ("No per-run approvals" and the subscriptions bullet),
   `eval/EVALS.md` "Model-call billing"/"Sizing", the run-evals skill, ITEM-LEAD.md and the new DECISIONS.md
   section, say "dollar cap" (drop "hard" where it describes the Playground or QA budget) and add once, in
   EVALS.md "Sizing": "A cap stops the next call once the reported spend reaches it; one in-flight call can
   overshoot it (`eval/playground/README.md`, \"Dollar accounting\"), so size caps with that headroom."
   Keep the sentences short.
2. Sol 2 (low): describe the paired-plan hash as binding the canonical plan contents and the ordered command
   arguments, not the plan bytes (the code comment at `eval/qa/paired-collection-supervisor.mjs` near 99,
   `eval/qa/README.md` near 801, and EXEC.md).
3. Sol 3 (low): in `scripts/run-demo-model-gauntlet.mjs`, the no-cap launch-plan line prints
   "no cap supplied; preview only" instead of "none (no cost accounting; read the Gateway logs)"; update the
   test assertion (`test/demo-gauntlet-cli.test.ts` near 107) and the "Optional dollar accounting" comment
   near line 303 so it describes current behaviour.
4. Sol 4 (low, pre-existing, fails closed): do not fix. Record it in EXEC.md as deferred with that reason.
5. `.agents/TODO.md`: fix the doubled "under under its own cap" (OpenCode reopen item) and reflow the two
   ragged paragraphs you edited (the `execute`-timeout preamble near 115 and the codegen A/B trigger near
   1505) to the file's normal width.
6. Re-run the gates bare: `npm run typecheck`, `npm test`, `npm run build`, `npm run secrets:scan -- --tree`
   (and `npm run eval:selftest` if you touched eval code beyond the comment). Append a "Review
   reconciliation (Codex Sol)" section to EXEC.md: each finding, adopted or not, and the gate results.
   Commit with the normal hooks and your model trailer. Do not push.
