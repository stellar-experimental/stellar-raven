# Item 8.2 executor E3: folder guides, ideas/, TODO additions

Read `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/briefs/COMMON.md` first; its rules bind you, except that `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/PLAN.md` section "Correction
to the frozen list in COMMON.md" replaces COMMON's frozen list, and that you may edit files (below).
You are a Claude Sonnet 5.5 executor. Work only in `/home/tyler/code/raven-wt/np-8.2-guides` on branch `np/8.2-docs-guides`.

## Do

1. Read `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/PLAN.md` in full: "Global decisions" and the section for **PR 3**. Read
   `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/REVIEW.md` (the Fable plan review) and `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/RECONCILE.md` (the lead's answers to it); where
   RECONCILE changes the plan, RECONCILE wins.
2. For each finding the PR 3 section adopts, read it in `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/audit/<set>.md`, re-check its evidence
   against the code in your worktree, and apply the fix. Use the finding's proposed text unless the
   code says otherwise; keep the house style of the file you edit (short sentences, present tense,
   current behavior, no history narration). A finding whose evidence is wrong is skipped and noted.
3. Edit only the files the PR 3 section lists. Do not touch any file outside that list, any case
   file, `src/` (Worker bytes) or a generated file by hand.
4. Gates, each run bare (no pipe), in `/home/tyler/code/raven-wt/np-8.2-guides`: `npm run typegen` once (the `.dev.vars` placeholder is
   there), then `npm run typecheck`, `npm test`, `npm run build`, `npm run secrets:scan -- --tree`,
   and the link check `node /home/tyler/code/raven-wt/np-8.2/tmp/check-links.mjs $(git ls-files -- '*.md' ':!eval/qa/corpus' ':!eval/corpus' ':!.agents/rounds' ':!research' ':!improvements/*/*.md' ':!eval/qa/reviewed' ':!eval/qa/results') research/decisions/*.md`
   (plus any new file). Also run `npm run improvements:lint` (you edit `improvements/README.md`) and `node ecosystem-skills/build-index.mjs` then `git status --short` (no diff expected). Case text: `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/EXPOSURE.md` names the passages in two `ideas/` files. Read only those line ranges, rewrite them as the plan says (case ids and field names, finding ids), and never quote or paraphrase them in EXEC, a commit message, the TODO or any other file. `.agents/TODO.md`: add items only; the anchors in `items/8.1/PLAN.md` "Frozen anchors" stay byte-identical (check with `git diff`). Match the existing item format (what is wrong, current state, next step or trigger, done).
5. Commit on `np/8.2-docs-guides` with the normal hooks (never `--no-verify`), one or a few commits by topic.
   Messages end with:

   ```
   Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
   ```
   Do not push.
6. Write `.agents/rounds/2026-11-16-next-phase/items/8.2/EXEC-3.md` in your worktree (commit it with your PR; PR 1's executor leaves it uncommitted for the lead): per finding id, applied / skipped (why) / changed (how); each gate with a
   one-line result; every deviation; for PR 3, the `ideas/` disposition table (file, disposition,
   where the content went, commit). Then report.

## Overrides from RECONCILE.md

- **Never open** `ideas/codegen-correctness-substrate.md` or lines 28-62 of
  `ideas/source-delivery-ranked-references.md`. PR 4 (another executor) owns both. For the codegen
  residues, read `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/codegen-residues.md` and fold them into the TODO. Fix the
  `stellar-org-source-lane` citation inside `source-delivery-ranked-references.md` (lines 504-506)
  only, and add its "Code anchors are as of 2026-08-27." line under the status; nothing else in that
  file. `ideas/stellar-org-source-lane.md` line 34 names a case id: delete the file without quoting it.
- R-05: keep `ideas/skill-discovery-without-bundling.md`; fix its three dead references and add one
  TODO line that fires the overdue read (Workers Logs hold at most 7 days).
- R-06: B-12 declined. Delete from `improvements/README.md` only text the skill already holds;
  `README:100-118` becomes a one-line `improvements/intake.json` pointer. Do not edit the skill.
- R-09: `plugins/openai/RESUBMISSION.md` and `EXCEPTION-REQUEST.md` stay byte-identical; copy the
  standing procedure into the README ("last run 2026-10-23; check the portal before you act"). D-17
  declined.
- R-10: C-17's line states the fact ("It starts its own Wrangler per model on its own port"), no
  "exception".
- R-12: also adopt the O-25 row for `plugins/openai/README.md:111-113`; add a TODO line that
  `eval/qa/corpus/README.md` and `eval/corpus/PROVENANCE.md` were not audited (golden-maintenance
  lane).
- R-13: `test/README.md` gets group rows, not a per-file map.
- R-17: record item 5's second half and item 4's pointer from `architecture-explorations.md` as
  rejected or carried, with a reason; append one bullet to the existing p9 claim-support item.
- R-18: C-13's pointer line goes before `**Maintenance exception.**`.
- Keep the heading texts "Evaluation rules" (`eval/EVALS.md`) and the re-pin heading in
  `ecosystem-skills/README.md` (R-07).
- Add to the TODO one item "Apply the item 8.2 deferred documentation changes after run 2.2c merges"
  that lists RECONCILE.md "Approval list" point 3 and says it waits for the orchestrator's approval.
- Gates (R-08): the 8.1 frozen-anchor check (`items/8.1/PLAN.md` "Frozen anchors": every anchor
  string still present byte-identical in `.agents/TODO.md`); `git diff origin/main -- eval/qa/README.md`
  shows the `### Held-out split` heading and the Maintenance exception block untouched;
  `git diff --stat origin/main -- src public wrangler.jsonc catalog specs` shows at most
  `src/catalog/README.md`.
- PR 4 (already committed on another branch) moved the codegen note and retargeted the link on
  `ideas/README.md` line 30 to `../research/audits/2026-08-07-codegen-partner-report.md`. In your
  `ideas/README.md` rewrite, link that research path for the codegen entry (as a dated record, not an
  idea), and put residue 3 from `codegen-residues.md` in the index or the TODO "Deferred programs".
  Your link check will report that path missing in your branch; record it in EXEC-3 as expected (PR 4
  adds it) and do not "fix" it.
