# Item 6.1 plan review brief (Claude Fable, high)

You review the plan for round item 6.1 against the repository. You do not edit code or the plan.

- Worktree: `/home/tyler/code/raven-wt/np-6.1` (branch `np/6.1-codemode-0.5.6`, from `origin/main` `35d5de90`).
- Plan: `/home/tyler/code/raven-wt/np-6.1/.agents/rounds/2026-11-16-next-phase/items/6.1/PLAN.md`.
- Binding notes: `/home/tyler/code/raven-wt/orch/6-COMMON.md`, `/home/tyler/code/raven-wt/orch/6.1-NOTE.md`,
  `/home/tyler/code/raven-wt/orch/6-ASSUMPTIONS-FABLE.md` (a starting draft, not a verdict).
- Also read: `AGENTS.md`, `.agents/skills/improvements-pipeline/SKILL.md`, `/home/tyler/code/raven-wt/np-6.1/.agents/rounds/2026-11-16-next-phase/items/6.1/QUESTION.md` and the
  orchestrator's answer: "approve option (a), in its own commit in PR 6.1 ... the case moves. Make sure the
  dated timers and briefs end up pointing at v10 and its SHA-256".
- Upstream packages, already unpacked: `/home/tyler/code/raven-wt/np-6.1/tmp/6.1/pkgs/0.5.1/package` and `.../0.5.6/package`
  (diff their `dist/`). Upstream changelog: `gh api repos/cloudflare/agents/contents/packages/codemode/CHANGELOG.md --jq .content | base64 -d`.

## Rules

- Every repo-wide search excludes the QA corpora: `git grep ... -- ':!eval/qa' ':!eval/corpus'`. Never
  open anything under `eval/qa/` (cases, corpus, sample, tool-cases, results, reviewed) or `eval/corpus/`,
  except `eval/qa/tuning-rows.mjs` and `eval/qa/split-amend.mjs`. Never read a split file under `~/backups/`.
- No model-calling eval, no paid call, no upstream post. Keyless reads of GitHub and npm are fine.
- Do not run `npm install` or change files in the worktree other than your review file.

## What to check

1. Is each upstream fact in the plan true (versions, line numbers, identical chunks, the 0.5.5 gate, cs-001 and
   cs-012 state, peer ranges)? Did the plan miss an upstream change that touches Raven?
2. Is the spec-sandbox move a faithful mirror of 0.5.6 `mcp.js` (`responseText`, the wrapper without
   `__truncateResponse`)? Is putting `specResponseText` in `run.ts` the right place, given the Node-testability
   constraint? Are the test edits right and enough?
3. Is the "not model-facing" claim correct? Look at `src/executor/run.ts`, `src/mcp/`, and what the model sees.
4. Is the split v10 step complete: script shape (compare `items/5.1/amend-split-v8.mjs` and
   `items/5.2/amend-split-v9.mjs`), `TUNING_ROW_COUNT` and its assertions, the dated briefs, PRESTAGE, the TODO
   block, and the claim that timers need no edit (`items/1.4/dated/launch-dated-lead.sh`, `units/`)?
5. Are the gates, the stop rule and the decision not to run the routing gate sound? Is the Codex review
   choice right under AGENTS.md routing?
6. Is the remaining-deviations table complete and correct? Is each reason true?
7. Do the TODO and DECISIONS.md edits keep what is still open and remove only what is done?
8. Anything that over-reaches the item scope or under-delivers on 6.1-NOTE.md.

## Output

Write `/home/tyler/code/raven-wt/np-6.1/.agents/rounds/2026-11-16-next-phase/items/6.1/REVIEW.md`: numbered findings, each with severity (blocking / should-fix / nit), the evidence
(file:line or command output), and a concrete fix. End with a one-line verdict. Then run
`hc send t1v5 '/home/tyler/code/raven-wt/np-6.1/.agents/rounds/2026-11-16-next-phase/items/6.1/REVIEW.md'`.
