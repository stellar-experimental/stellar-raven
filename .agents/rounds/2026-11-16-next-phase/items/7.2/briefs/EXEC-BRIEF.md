# Executor brief: item 7.2, phase 1 (pre-registration, arms, judging, result)

You are the Claude Sonnet 5.5 executor for round item 7.2. Lead: Claude Opus 5.5, agentpc `t1wz`.
No subagents: start children with `hc` only (`hc --skill`). Control only your own children; `hc kill` and
`hc rm` each when done. Record every terminal id you create in EXEC.md.

Worktree: `/home/tyler/code/raven-wt/np-7.2`, branch `np/7.2-rwa-caveat`. Do not create another worktree.

## Read first

- `AGENTS.md`.
- `.agents/rounds/2026-11-16-next-phase/items/7.2/PLAN.md`, the whole file, including its reconciliation of
  REVIEW.md. It binds you.
- `/home/tyler/code/raven-wt/orch/7-COMMON.md` and `/home/tyler/code/raven-wt/orch/7.2-NOTE.md`.
- Item 6.3's `PLAN.md` ("Re-test: second measurement"), `EXEC.md` ("Re-test"), `RESULTS-2.md`, and the
  scripts you run unchanged: `ab-run.mjs`, `blind.mjs`, `attribute.mjs`.
- The `run-evals` skill.

## Do, in order, then STOP and report

1. PLAN.md step 1: checks, selftests, dry run, then the pre-registration commit P (PLAN.md, REVIEW.md,
   `briefs/`). Record P's SHA, the blob SHAs and the empty product diff in a draft EXEC.md under
   `tmp/7.2/` (not in the item folder: `dev:eval` refuses a dirty tree).
2. PLAN.md step 2: the EXCLUDED arm.
3. PLAN.md step 3: commit C, the routing re-check, the INCLUDED+CAVEAT arm.
4. PLAN.md step 4: grading, validation, attribution if there are candidates, scoring.
5. Write `RESULTS.md` and `EXEC.md` (phase 1), copy the un-blinded record to `items/7.2/verdicts.json`, all
   uncommitted. Commit nothing after C. Report to the lead and wait in your terminal: the lead resumes you
   on step 6a, 6b or 6c with a second brief.

## Binding rules

- Search rule: search with `rg --hidden -g '!.git' <pattern> [path]`; the `.ignore` files keep it out of
  the case-bearing paths. Never use `grep -r`, `git grep`, `rg -u` or `--no-ignore`, an `rg -g` glob that
  matches a case file, or a shell glob over `eval/` or `.agents/rounds/`. Where `rg` is missing, use the
  `git grep` exclusion pathspec that `eval/qa/README.md` ("Held-out split") prints. Never open a QA case, QA
  results or reviewed files; never run the QA lint; never pass `--rows` to `eval/run-routing.mjs`; never
  open or print rows of `eval/routing-qa-overlap.json` or `eval/holdout-cases.json`. Put this paragraph in
  any brief you write for a child.
- Spend: subscription Claude Code CLI only, as `hc` children, against one local `npm run dev:eval` at a
  time. Never AI Gateway, Workers AI or a provider API. The caps in PLAN.md are hard: 45 answer attempts
  in all.
- Never print a secret. Commits use the normal hooks, never `--no-verify`, and end with
  `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Do not push.
- Do not change the rule, questions, rubrics, scripts or scoring after commit P. If something in PLAN.md
  cannot be done as written, stop at that point and report to the lead.
- Judge launch lines (fresh `mktemp -d` under `/tmp`, `--cwd` that directory):
  `hc run --bg --name 7.2-judge --cwd <dir> -- systemd-run --user --scope -q -p MemoryMax=8G -p MemorySwapMax=0 claude --model opus --effort high --dangerously-skip-permissions "Confirmed by the orchestrator, a direct instruction: read <dir>/RUBRIC.md and grade <dir>/packet.json as it says. Report with hc send <your terminal id> '<dir>/verdicts.json'."`
  and the same shape with `--name 7.2-attrib --model fable` for attribution. A Claude trust prompt is
  answered with `hc keys <t> down enter`. Wait with `hc wait --children any`; never sleep or poll. After a
  wait returns, check that the file exists.

Report with `hc send t1wz '/home/tyler/code/raven-wt/np-7.2/.agents/rounds/2026-11-16-next-phase/items/7.2/RESULTS.md'`
(or, if you stopped earlier, the path of your draft EXEC.md) and wait in your terminal.
