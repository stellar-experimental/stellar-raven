# Item 8.2: reconciliation of the Fable plan review

Review: [REVIEW.md](REVIEW.md) (Claude Fable 5.2, agentpc `t1ys`, verdict "approve with changes").
Every finding is adopted. Where this file and [PLAN.md](PLAN.md) differ, this file wins.

| Review | Decision |
|---|---|
| R-01 | Adopt. B-03 lands with the reviewer's text: rotation changes every `clientHash` at once, gives each user a new subject (so a new `subjectHash`) at the next sign-in while an older grant keeps its old subject, and stops signed Playground cookies verifying. Keep the `clientHash = null` line. |
| R-02 | Adopt. A fourth pull request, **PR 4** (executor E4, worktree `np-8.2-cases`, branch `np/8.2-docs-case-text`), holds only the case-text edits: the move of `ideas/codegen-correctness-substrate.md` to `research/audits/2026-08-07-codegen-partner-report.md` with its sanitization, and the sanitization of section 1 of `ideas/source-delivery-ranked-references.md`. Its body says the diff holds case text, nobody reads the diff, and it merges on check status plus a reader of the two result files only. PR 3 does not touch those two files. E4 writes the codegen residues (ids and finding ids only, no case text) to `items/8.2/codegen-residues.md`; E3 folds them into the TODO. |
| R-03 | Adopt. EXPOSURE.md adds `q-sor-evm-to-soroban-porting` (`codegen` lines 42, 135, 157) and corrects line 34. E4 reads those lines and sanitizes them if they carry more than the id; E4's terminal is recorded as a reader. |
| R-04 | Adopt. No edit to `improvements-pipeline` before run 2.2c merges: B-13, B-14 and the "Raven scoping" sentence join the deferred item. PR 2 covers every skill except `golden-truth` and `improvements-pipeline`. |
| R-05 | Adopt. `ideas/skill-discovery-without-bundling.md` stays. E3 fixes its three dead references (O-52), adds one queue line that fires the overdue read, points at the file, and notes Workers Logs hold at most 7 days. O-42 (the skill stops citing it) stays. |
| R-06 | Adopt. B-12 declined as superseded by O-06. E3 deletes from `improvements/README.md` only text the skill already holds, and `README:100-118` becomes the one-line `intake.json` pointer. |
| R-07 | Adopt. PR 1 links `.agents/TODO.md` with no anchor. These headings keep their text: "Deploy" (`docs/operations.md`), "Evaluation rules" (`eval/EVALS.md`), the re-pin heading (`ecosystem-skills/README.md`), "Models for evals and tests" (roster). Each later PR rebases on `main` after the earlier merge and reruns the link check; the lead reruns it on `main` after the last merge. |
| R-08 | Adopt. Added gates: the 8.1 frozen-anchor diff on `.agents/TODO.md` (PR 3); `git diff --quiet origin/main -- .agents/skills/golden-truth .agents/skills/improvements-pipeline` (PR 2); the `### Held-out split` heading and Maintenance exception block unchanged (PR 3); `git diff --stat origin/main -- src public wrangler.jsonc catalog specs` shows at most `src/catalog/README.md` (every PR). Merge window: before 2026-11-23 18:00 UTC, else hold until run 2.1 and its follow-ups merge. |
| R-09 | Adopt. Copy, not move: `RESUBMISSION.md` stays byte-identical; the README section says "last run 2026-10-23; check the portal before you act". D-17 declined: the draft's header already says to refresh counts. |
| R-10 | Adopt. A-01 lands as the fact only: "There is no `CLAUDE.md`; Claude Code reads this file natively." The prohibition goes on the approval list. C-17's README line states the fact without "exception". The frozen-list correction itself goes on the approval list. |
| R-11 | Adopt the reviewer's two sentences for A-16. |
| R-12 | Adopt. A-21: the roster's "Run on `hc` agents first" bullet is cut (PR 2, O-05 part 3). A-28: keep; O-33 proposes moving it. O-21: `eval/qa/corpus/README.md` and `eval/corpus/PROVENANCE.md` reported as not audited, plus a queue line for a golden-maintenance lane. O-25 row `plugins/openai/README.md:111-113`: adopt (PR 3). O-27 "Playground/demo", "round ledger/record", "terminal/pane": adopt in the non-frozen files each PR owns. O section 7 `domain-verification/README.md:6`: declined (D checked it correct). A-02: the hook message and `.ignore` headers keep "Held-out split"; with C-13's pointer they stay navigable; listed in the deferred item. |
| R-13 | Adopt. `test/README.md` gains group rows for the new areas; stragglers join the nearest row; the table says it names groups. |
| R-14 | Adopt. B-07 runs the roster's offline block only and records that the alias probe (a model call) was skipped. |
| R-15 | Adopt. The moved codegen note gets a header line (moved from `ideas/` and sanitized on 2026-11-18 by item 8.2; case text replaced by case ids; partner detail removed). EXEC records, per deleted or sanitized file, the last commit holding the earlier version. EXPOSURE.md adds the three facts. The partner-detail question goes in the report. |
| R-16 | Adopt: "Catalog, spec, and family-text checks reject stale generated outputs." |
| R-17 | Adopt. E3 records item 5's second half and item 4's pointer as rejected or carried, with a reason, and appends one bullet to the existing p9 claim-support item. |
| R-18 | Adopt. C-13's pointer goes before `**Maintenance exception.**`. A-27: rename the heading text, keep "1." and every number. Decision 6 wording points at `specs/stellar-org.json` and the adapter, and calls the research file "the 2026-11-14 measurement". Each executor writes `EXEC-<n>.md` in its own worktree's `items/8.2/` and commits it with its PR; PR 1 also carries PLAN, REVIEW, RECONCILE, EXPOSURE, audit/ and briefs/. |

## Approval list for the orchestrator (before merge)

1. The correction to the frozen list (PLAN "Correction to the frozen list in COMMON.md").
2. PR 1 `AGENTS.md` edits: the `CLAUDE.md` fact, the search-heading pointer, the map rows.
3. Proposed, not applied (deferred item, after run 2.2c): the `CLAUDE.md` prohibition; O-10 posting
   and deploy authority; O-27 role terms; O-30; O-32 to O-38; O-40; C-17's Wrangler exception;
   "File and response size come second"; B-12 superseded; B-13, B-14 and the scoping sentence in
   `improvements-pipeline`; the `golden-truth` lifecycle overlap; O-12's `eval/qa/README.md` split;
   pointing the hook message and `.ignore` headers at the search heading.
4. PR 2 `SKILL-BEHAVIOR` changes: B-02, B-04, B-05, O-16/O-45 (as listed in EXEC-2).
