# Item 8.2 executor E1: root, docs/, ADR index

Read `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/briefs/COMMON.md` first; its rules bind you, except that `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/PLAN.md` section "Correction
to the frozen list in COMMON.md" replaces COMMON's frozen list, and that you may edit files (below).
You are a Claude Sonnet 5.5 executor. Work only in `/home/tyler/code/raven-wt/np-8.2` on branch `np/8.2-docs-audit`.

## Do

1. Read `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/PLAN.md` in full: "Global decisions" and the section for **PR 1**. Read
   `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/REVIEW.md` (the Fable plan review) and `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/RECONCILE.md` (the lead's answers to it); where
   RECONCILE changes the plan, RECONCILE wins.
2. For each finding the PR 1 section adopts, read it in `/home/tyler/code/raven-wt/np-8.2/.agents/rounds/2026-11-16-next-phase/items/8.2/audit/<set>.md`, re-check its evidence
   against the code in your worktree, and apply the fix. Use the finding's proposed text unless the
   code says otherwise; keep the house style of the file you edit (short sentences, present tense,
   current behavior, no history narration). A finding whose evidence is wrong is skipped and noted.
3. Edit only the files the PR 1 section lists. Do not touch any file outside that list, any case
   file, `src/` (Worker bytes) or a generated file by hand.
4. Gates, each run bare (no pipe), in `/home/tyler/code/raven-wt/np-8.2`: `npm run typegen` once (the `.dev.vars` placeholder is
   there), then `npm run typecheck`, `npm test`, `npm run build`, `npm run secrets:scan -- --tree`,
   and the link check `node /home/tyler/code/raven-wt/np-8.2/tmp/check-links.mjs $(git ls-files -- '*.md' ':!eval/qa/corpus' ':!eval/corpus' ':!.agents/rounds' ':!research' ':!improvements/*/*.md' ':!eval/qa/reviewed' ':!eval/qa/results') research/decisions/*.md`
   (plus any new file). Do not commit `tmp/` (it is git-ignored). Also add the owner's 8.2 instruction to `.agents/rounds/2026-11-16-next-phase/DECISIONS.md` under "Follow-up answers (2026-11-18)", verbatim, in the style of that section; do not commit other files under `items/8.2/` (the lead commits those).
5. Commit on `np/8.2-docs-audit` with the normal hooks (never `--no-verify`), one or a few commits by topic.
   Messages end with:

   ```
   Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
   ```
   Do not push.
6. Write `.agents/rounds/2026-11-16-next-phase/items/8.2/EXEC-1.md` in your worktree (commit it with your PR; PR 1's executor leaves it uncommitted for the lead): per finding id, applied / skipped (why) / changed (how); each gate with a
   one-line result; every deviation; for PR 3, the `ideas/` disposition table (file, disposition,
   where the content went, commit). Then report.

## Overrides from RECONCILE.md

- A-01 lands as the fact only: "There is no `CLAUDE.md`; Claude Code reads this file natively." (R-10)
- A-16 uses R-11's two sentences. A-18 links `.agents/TODO.md` with no anchor (R-07).
- A-27: rename the heading text only; keep "1." and every section number (R-18).
- `ARCHITECTURE.md:416`: "Catalog, spec, and family-text checks reject stale generated outputs." (R-16)
- O-20 / decision 6: point at `specs/stellar-org.json` and the adapter; call the research file "the
  2026-11-14 measurement" (R-18).
- Keep the heading text "Deploy" in `docs/operations.md` (R-07).
- Gate: `git diff --stat origin/main -- src public wrangler.jsonc catalog specs` is empty.
