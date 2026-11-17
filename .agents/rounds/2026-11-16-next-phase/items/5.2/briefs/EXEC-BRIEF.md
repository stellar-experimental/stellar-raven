# Sonnet execution, item 5.2

You carry out the reconciled plan for item 5.2. Documentation, one QA README rule, improvements
records and one upstream issue. No product code.

- Worktree: `/home/tyler/code/raven-wt/np-5.2`, branch `np/5.2-owner-followups`. Work only there.
- Plan: `.agents/rounds/2026-11-16-next-phase/items/5.2/PLAN.md`. Its "Reconciliation" section
  overrides the steps it names. `REVIEW.md` is the review behind it; `NOTE.md` and `EVAL-FABLE.md`
  are its inputs (take the E rule text and the I text from `EVAL-FABLE.md` as the plan says).
- Rules: `AGENTS.md`; `.agents/skills/improvements-pipeline/SKILL.md` and its
  `references/upstream-writing-style.md` for step 5.

## Do

1. Steps 1 to 7 of the plan, as reconciled. Edit by heading; keep the surrounding text and the
   repository's prose style (short sentences, no history in TODO beyond what the plan states).
2. Step 6 before step 5's filing: if the scratch reproduction does not show `ok: true` for a
   non-Error throw, stop, write that in EXEC.md, and report without filing.
3. Step 5 posting: dedupe first; then `--dry-run`; read the rendered body as the upstream
   maintainer; then post. This is standing authority (owner decision 4). Never open a pull request.
4. Run the gates bare, each on its own: `npm run eval:qa:lint`, `npm run improvements:lint -- --live`,
   `npm run typecheck`, `npm test`, `npm run secrets:scan -- --tree`. The lead already created the placeholder `.dev.vars` and ran `npm run typegen`; `.dev.vars` is git-ignored, never commit it.
5. Commit on the branch with the normal hooks (never `--no-verify`). One or two commits. Message
   ends with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Push only as the plan orders.
6. Write `.agents/rounds/2026-11-16-next-phase/items/5.2/EXEC.md`: what you did per step, the
   reproduction output, the issue URL (or the duplicate), a one-line summary of each gate, and any
   deviation from the plan with its reason. Commit it too.

## Hard limits

- Never open a file under `eval/qa/corpus/`, `eval/qa/cases.json`, `eval/qa/sample.json`, or any
  split file, and never name which set a QA case is in.
- No model-calling eval, no paid call, no local Wrangler server, no deploy, no merge.
- You may push the branch for the cs-012 snapshot link (plan finding 15); never open a pull request.
- Do not edit `sibling-check.mjs`, the launcher, the timers, or the four dated `*-LEAD.md` briefs
  unless the reconciled plan says so.
- Never print a secret.
- No subagents. If something blocks you, write it in EXEC.md and report.

Then run the report command from your launch line.
