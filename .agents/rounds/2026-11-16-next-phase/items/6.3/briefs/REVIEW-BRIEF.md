# Fable plan review brief: item 6.3 (RWA re-test, issue #167)

You are a Claude Fable reviewer. You review a plan; you do not execute it, start answer runs, or start
any model-calling eval. No subagents. Lead: Claude Opus 5.5, agentpc `t1w3`.

Worktree: `/home/tyler/code/raven-wt/np-6.3` (branch `np/6.3-rwa-retest`, from `origin/main` `cd4520bd`).

Read:
- The plan: `.agents/rounds/2026-11-16-next-phase/items/6.3/PLAN.md`.
- The binding notes: `/home/tyler/code/raven-wt/orch/6-COMMON.md` and `/home/tyler/code/raven-wt/orch/6.3-NOTE.md`.
- `AGENTS.md`; `.agents/skills/run-evals/SKILL.md`; ADR-0003 (`research/decisions/0003-build-time-exposure-filtering.md`).
- The prior A/B this plan copies: `.agents/rounds/2026-11-16-next-phase/items/6.2/` (PLAN.md, ab-run.mjs, blind.mjs, RESULTS.md, REVIEW.md).
- Issue #167 (`gh issue view 167 --comments`), `test/drift-141-routing.test.ts`, `test/fixtures/rwa-routing.ts`,
  `src/policy/scout-exposure.ts`, `.agents/TODO.md` (the routing-repair item and check 8, the "Resolve held source
  ownership" RWA bullet, the 5.1 `matchPartners` re-exposure steps), `eval/gates.json` (thresholds only).

Rules, binding on you:
- Every repo-wide search is `git grep ... -- ':!eval/qa' ':!eval/corpus'`. Never a bare recursive grep.
- Never print the stdout of `node eval/run-routing.mjs`; redirect it to a file under `tmp/6.3/review/` and read
  totals with `node tmp/6.3/compare.mjs <base result json> <variant result json>` (it prints counts only for the
  holdout lane). Never open a holdout row, a QA case, QA results or reviewed files; never run the QA lint.
  Never print or use a row listed in `eval/routing-qa-overlap.json`.
- Free local reads and keyless public HTTP reads are fine. No model-calling run, no paid call.
- Write only under `.agents/rounds/2026-11-16-next-phase/items/6.3/REVIEW.md` and `tmp/6.3/review/`.

Check, against the repository, not the plan's word:
1. Re-verify the "Facts re-checked" section: build the INCLUDED manifest the way the plan says (edit
   `src/policy/scout-exposure.ts` in place, `node scripts/build-catalog.mjs --out tmp/6.3/review/included.json`,
   then `git checkout src/policy/scout-exposure.ts` and confirm a clean `git status`), run the routing comparison,
   and confirm or correct every number.
2. The pre-registered decision rule: is it a faithful, operational form of the note's rule? Is anything
   ambiguous, gameable after seeing results, or noise-dominated so the A/B cannot decide? Is the inconclusive
   clause right? Is the "call RWA wrongly" definition sound?
3. Question selection: is each question a fair test of the rule's clause? Is the "neutral = off-target" choice
   right, or should neutral be something else? Are the reference URLs adequate for a blind judge (check status)?
   Confirm none is on `eval/routing-qa-overlap.json` without printing any that is.
4. Blinding: does dropping the tool-call list from packets suffice? Anything else that leaks the arm?
5. Arm identity: is commit I (policy edit plus regenerated outputs) the right INCLUDED arm, and does it match what
   would ship? Which generators really depend on the exposure policy? Does the host adapter need any change to
   call `GET /api/rwa`?
6. The include path (6a): is anything missing for an ADR-0003 exposure change (guards, skill scrub, drift config,
   description notes, docs that say RWA is excluded, generated files)? Is tightening the holdout ceiling to 10
   right? Is the "Closes #167" condition right?
7. The exclude path (6b), caps, gates, required reviews, risks.

Write `REVIEW.md` in the item folder: numbered findings, each with severity (blocking, should-fix, nit), the
evidence (file:line or command and its counts-only output), and a concrete fix. End with a one-line verdict.
