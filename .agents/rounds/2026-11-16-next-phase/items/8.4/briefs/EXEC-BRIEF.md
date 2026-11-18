# Item 8.4: Sonnet execution

Worktree `/home/tyler/code/raven-wt/np-8.4`, branch `np/8.4-families-everywhere`. Carry out the
reconciled plan at `.agents/rounds/2026-11-16-next-phase/items/8.4/PLAN.md`: steps 1 to 6 as amended
by its section "Reconciliation of REVIEW.md" (that section wins where they differ). Read `AGENTS.md`,
the plan, `REVIEW.md` next to it, and `.agents/model-roster.md` first.

Owner instruction to record in step 6 (verbatim, 2026-11-18): "We should update all things everywhere
around this to not name versions but rather familes running the latest version. e.g. there are new
Sol and Astra versions that came out recently"

Rules:
- The dated briefs under `items/1.4/dated/` run unattended on 2026-11-23. Change only lines that
  name a model, a launch line, the commit trailer, and the added fail-closed sentence. Check every
  hunk with `git diff --word-diff`. Keep indentation exactly.
- The commit trailer wording in the briefs: the lane writes its own running model's exact name
  (for a Claude lane, the name its system prompt gives), not a version written in the brief.
- Do not edit `src/`. Do not add or move eval cases. Do not touch records (research/, improvements/,
  PIN-REVIEW rows, eval/gates.json notes, dated round records, test fixtures).
- Gates, each run bare (no pipe): `npm run typecheck`, `npm test`, `npm run build`,
  `npm run eval:selftest`, `npm run secrets:scan -- --tree`. Do not run `test:smoke`, the QA lint or
  `eval:qa:register`. Then run the plan's stop-rule scan and list every remaining match in live
  files with why it stays.
- Search rule (binding): search with `rg --hidden -g '!.git' <pattern> [path]`. Never use `grep -r`,
  `git grep`, `rg -u` or `--no-ignore`, an `rg -g` glob that matches a case file, or a shell glob
  over `eval/` or `.agents/rounds/`. Never open a QA held-out or reserve case (eval/qa/corpus/,
  cases.json, sample.json, tool-cases.json, eval/qa results/ or reviewed/).
- No model-calling eval, no paid call, no network writes, no push, no PR. No subagents.
- Commit on the branch with the normal hooks (never `--no-verify`): one commit for the code and doc
  changes, one for the round records (PLAN.md, REVIEW.md, briefs/, EXEC.md, DECISIONS.md). Each
  message ends with `Co-Authored-By: <your exact model name> <noreply@anthropic.com>`.
- Write `EXEC.md` next to the plan: what you did per step, a one-line summary of each gate's output
  (counts), the scan result, and any deviation with its reason. Record your resolved model ID at the
  top.

When done, send only the EXEC.md path as the task line says. The lead may send you review findings
to reconcile afterwards; stay in your terminal.
