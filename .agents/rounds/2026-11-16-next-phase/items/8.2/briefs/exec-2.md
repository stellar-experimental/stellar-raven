# Item 8.2 executor E2: .agents/ README, rounds guide, roster, skills

Read `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/briefs/COMMON.md` first; its rules bind you, except that `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/PLAN.md` section "Correction
to the frozen list in COMMON.md" replaces COMMON's frozen list, and that you may edit files (below).
You are a Claude Sonnet 5.5 executor. Work only in `/home/tyler/code/raven-wt/np-8.2-agents` on branch `np/8.2-docs-agents`.

## Do

1. Read `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/PLAN.md` in full: "Global decisions" and the section for **PR 2**. Read
   `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/REVIEW.md` (the Fable plan review) and `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/RECONCILE.md` (the lead's answers to it); where
   RECONCILE changes the plan, RECONCILE wins.
2. For each finding the PR 2 section adopts, read it in `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/audit/<set>.md`, re-check its evidence
   against the code in your worktree, and apply the fix. Use the finding's proposed text unless the
   code says otherwise; keep the house style of the file you edit (short sentences, present tense,
   current behavior, no history narration). A finding whose evidence is wrong is skipped and noted.
3. Edit only the files the PR 2 section lists. Do not touch any file outside that list, any case
   file, `src/` (Worker bytes) or a generated file by hand.
4. Gates, each run bare (no pipe), in `/home/tyler/code/raven-wt/np-8.2-agents`: `npm run typegen` once (the `.dev.vars` placeholder is
   there), then `npm run typecheck`, `npm test`, `npm run build`, `npm run secrets:scan -- --tree`,
   and the link check `node /home/tyler/code/raven-wt/np-8.2/tmp/check-links.mjs $(git ls-files -- '*.md' ':!eval/qa/corpus' ':!eval/corpus' ':!.agents/rounds' ':!research' ':!improvements/*/*.md' ':!eval/qa/reviewed' ':!eval/qa/results') research/decisions/*.md`
   (plus any new file). B-07 needs the installed CLI versions and catalogs on this host; follow the roster's "How to re-verify" exactly, offline reads only (no model call). Label each `SKILL-BEHAVIOR` change in EXEC-2 so the lead can list it for approval.
5. Commit on `np/8.2-docs-agents` with the normal hooks (never `--no-verify`), one or a few commits by topic.
   Messages end with:

   ```
   Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
   ```
   Do not push.
6. Write `.agents/rounds/2026-11-16-next-phase/items/8.2/EXEC-2.md` in your worktree (commit it with your PR; PR 1's executor leaves it uncommitted for the lead): per finding id, applied / skipped (why) / changed (how); each gate with a
   one-line result; every deviation; for PR 3, the `ideas/` disposition table (file, disposition,
   where the content went, commit). Then report.

## Overrides from RECONCILE.md

- Do not edit `.agents/skills/golden-truth/` or `.agents/skills/improvements-pipeline/` at all
  (R-04). Gate: `git diff --quiet origin/main -- .agents/skills/golden-truth .agents/skills/improvements-pipeline`.
- B-03 uses R-01's text, not B-03's. B-07 runs the offline block only (R-14).
- Gate for every PR: `git diff --stat origin/main -- src public wrangler.jsonc catalog specs` is empty.
