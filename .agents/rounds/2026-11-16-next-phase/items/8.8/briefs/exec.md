# Item 8.8 execution (Claude Sonnet)

Carry out the reconciled plan `/home/tyler/code/raven-wt/np-8.8/.agents/rounds/2026-11-16-next-phase/items/8.8/PLAN.md`
in the worktree `/home/tyler/code/raven-wt/np-8.8` (branch `np/8.8-no-per-run-approvals`). The section
"Review reconciliation" at the end binds over anything above it that it contradicts. The review it
answers is `REVIEW.md` next to the plan. Read `AGENTS.md` first.

Owner instruction this item applies (2026-11-19, verbatim, quote it exactly in DECISIONS.md): "we can
honestly remove all per turn or per request approvals, I don't want to be approving things, we should
relax these guidelines anywhere and everywhere they show up especially for sub use". It answered the item
8.7 question "do you want a standing authorization for the shipped-tuple smoke (about USD 0.45 per
model-path change)?". Put the new DECISIONS.md section after "Follow-up answers (2026-11-19, Playground
billing)" and before "## Timing", titled "Follow-up answers (2026-11-19, no per-run approvals)".

Do:
1. The code changes (plan "Code gates" 1-4 plus reconciliation 1, 2, 7, 12, 13) with their tests. Edit a
   script and its test together; do not run `npm test` in between (the gauntlet test spawns the script).
2. The document, skill, TODO, brief and DECISIONS edits (plan "Documents and skills" plus reconciliation
   3-6, 8, 9). Sentence edits only: no heading renamed, moved or deleted in AGENTS.md, eval/qa/README.md or
   .agents/TODO.md. Historical records (earlier DECISIONS sections, research/, earlier item records,
   improvements/ receipts) stay unchanged. Out-of-scope lines (plan "Out of scope") stay unchanged.
3. Gates, each run bare (no pipe): `npm run typecheck`, `npm test`, `npm run build`,
   `npm run eval:selftest`, `npm run eval:routing -- --gate`, `npm run eval:qa:register -- --check`,
   `npm run secrets:scan -- --tree`. Also: `node scripts/run-demo-model-gauntlet.mjs --models openai/test --prompts rpc-simulate`
   must print the plan and refuse without starting Wrangler; `git diff --stat origin/main -- src catalog specs ecosystem-skills/catalog.json wrangler.jsonc`
   must be empty; the TODO-heading check in reconciliation 9; the stop-rule search in reconciliation 11
   (read every hit and classify it in EXEC.md).
4. Write `EXEC.md` next to the plan: what you changed per file, the TODO items touched with old and new
   trigger, the code-gate classification (changed vs kept), a short summary of each gate's output, the
   stop-rule search classification, and any deviation from the plan with its reason.
5. Commit on the branch with the normal hooks (never `--no-verify`). Commit message ends with
   `Co-Authored-By: Claude <Family> <version> <noreply@anthropic.com>` naming the exact model your system
   prompt gives you. Do not push.

Rules:
- Spend: no model-calling run of any kind, no paid call, no AI Gateway, no Wrangler process. The gates
  above make none.
- Search with `rg --hidden -g '!.git' <pattern> [path]` only. Never use `grep -r`, `git grep`, `rg -u` or
  `--no-ignore`, an `rg -g` glob that matches a case file, or a shell glob over `eval/` or `.agents/rounds/`.
  Never open a QA held-out or reserve case (eval/qa/corpus/, cases.json, sample.json, tool-cases.json,
  eval/qa results/ or reviewed/). Never run the QA lint (`eval:qa:lint`).
- Generated files come from their scripts (`scripts/README.md`).
- No subagents. If a gate fails for a reason outside this item, say so in EXEC.md with the output; do not
  hide it.
- If something in the plan is wrong once you are in the code, take the smallest sound fix and record it as
  a deviation.
