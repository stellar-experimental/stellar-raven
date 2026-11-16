# Brief: Fable review of the item 0.2 plan

You are a Claude Fable lane on agentpc, reviewing a plan. Read-only on the repository except for
your one output file. No subagents, no hc children, no model-calling eval, no paid call.

Worktree: `/home/tyler/code/raven-wt/np-0.2` (branch `np/0.2-absorb-drift-223`, from `origin/main`
at `dfb7793d`). Do not commit. Do not leave edits in the tree.

Read:
- `AGENTS.md`.
- The plan: `.agents/rounds/2026-11-16-next-phase/items/0.2/PLAN.md`.
- Its binding inputs: `.agents/rounds/2026-11-16-next-phase/PLAN.md` (item 0.2) and
  `.agents/rounds/2026-11-16-next-phase/DECISIONS.md` (answer 3 binds).
- `.agents/skills/live-drift-resolution/SKILL.md`, and `improvements-pipeline` / `golden-truth`
  only as far as the plan touches them.
- `.agents/TODO.md` sections "Preserve structured routing intent across extraction caps and gate
  tiers", "Re-evaluate Scout exposure after a routing-contract change", "Monitor the Horizon
  protocol-ceiling note", and "`search` does not surface the research lane for protocol-history
  questions".
- GitHub issue #223's latest comment (`gh issue view 223 --json comments --jq '.comments[-1].body'`).

Check the plan against the repository, not only against itself:
1. Is each step's command real and correctly ordered (scripts exist, flags exist, files named
   are the files that move)? Check `ecosystem-skills/update.sh`, `ecosystem-skills/README.md`,
   `scripts/check-pin-review.mjs`, `eval/run-routing.mjs`, `src/policy/scout-exposure.ts`.
2. Does it meet the skill's required checks for this drift class, and is anything missing?
3. Is the titles A/B rule applied faithfully to decision 3, and is the stop rule sound?
4. Is the Scout exposure candidate check what the TODO trigger asks for?
5. Is the gate re-stamp proposal consistent with how `eval/gates.json` has been re-stamped before
   (read its `evidence.notes`)? Is anything forbidden by AGENTS.md (re-baselining to make red
   green, editing generated files by hand, TODO edits owned by another item)?
6. Any held-out or QA-case handling risk (the plan reports holdout-lane movement as counts only).
7. Anything simpler that decides the same thing with less spend.

You may re-run free, local, read-only commands to verify a fact (for example `node
scripts/diff-inventory.mjs`, or the routing runner) but restore the tree afterwards
(`git checkout -- . && git status --short` must be empty apart from the item folder).

Write findings to `.agents/rounds/2026-11-16-next-phase/items/0.2/REVIEW.md`: a header with your
model and effort, then numbered findings, each with severity (blocking / should / nit), file:line
evidence, and a concrete fix. End with a verdict line. Keep it short.
