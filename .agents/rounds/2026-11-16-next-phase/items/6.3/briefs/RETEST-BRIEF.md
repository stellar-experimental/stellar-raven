# Executor brief: item 6.3 re-test (second measurement)

You are the Claude Sonnet 5.5 executor. Lead: Claude Opus 5.5, agentpc `t1w3`. No subagents: start
children with `hc` only (`hc --skill`). Control only your own children; `hc kill` and `hc rm` each when done.

Worktree: `/home/tyler/code/raven-wt/np-6.3`, branch `np/6.3-rwa-retest`. You may create and later remove
one second worktree, `/home/tyler/code/raven-wt/np-6.3-inc`, detached at `92f71b8d`, as the plan says.

Read first: `AGENTS.md`; `.agents/rounds/2026-11-16-next-phase/items/6.3/PLAN.md`, the whole file, and
above all its last section "Re-test: second measurement" (it binds you, including its reconciliation of
REVIEW-2.md); RESULTS.md and EXEC.md (result 1, which you must not edit); the binding notes
`/home/tyler/code/raven-wt/orch/6-COMMON.md` and `/home/tyler/code/raven-wt/orch/6.3-NOTE.md`; the
`run-evals` skill.

Do, in order, then STOP and report:
1. Implement the harness changes (`ab-run.mjs`, `blind.mjs --retest`, new `attribute.mjs`) and make every
   selftest in the section pass, plus result 1's `blind.mjs --selftest` unchanged and `node --check` on all
   three. Then the re-test pre-registration commit: PLAN.md, REVIEW-2.md, the briefs, the scripts. Record
   its SHA in EXEC.md as proof that the rule predates every re-test answer.
2. EXCLUDED arm, then INCLUDED arm, exactly as the section says (identity, probes, warm-up, caps, order,
   captures).
3. Blind grading (Opus), validation and at most one completion pass; then attribution (Fable) only if the
   packed set is non-empty; then `--score`.
4. Write `RESULTS-2.md` and extend EXEC.md (re-test part: commits, arm windows, identity checks, probes,
   attempt and answer counts, cost, deviations). Keep drafts in `tmp/6.3/` until both arms end. Do not edit
   RESULTS.md. Commit nothing after the pre-registration commit until the lead says.

Binding rules:
- Search rule: every repo-wide search is
  `git grep ... -- ':!eval/qa' ':!eval/corpus' ':!test/fixtures/evidence-pack.mjs'`; for any pattern that
  can hit case sets, list file names only and never open `eval/holdout-cases.json`, `eval/discovery/`,
  `eval/agentic/` or that fixture. Never open a QA case, QA results or reviewed files; never run the QA lint;
  never print the stdout of `eval/run-routing.mjs`. Put this in any child brief you write.
- Spend: subscription Claude Code CLI only, as `hc` children, against one local `npm run dev:eval` at a
  time. Never AI Gateway, Workers AI or a provider API. The caps in the section are hard.
- Never print a secret. Commits use the normal hooks, never `--no-verify`, end with
  `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Do not push.
- Do not change the rule, questions, rubrics or scoring after the pre-registration commit. If something in
  the section cannot be done as written, stop before that commit and report to the lead.
- Judge launch lines (fresh `mktemp -d` under `/tmp`, `--cwd` that dir):
  `hc run --bg --name 6.3-judge2 --cwd <dir> -- systemd-run --user --scope -q -p MemoryMax=8G -p MemorySwapMax=0 claude --model opus --effort high --dangerously-skip-permissions "Confirmed by the orchestrator, a direct instruction: read <dir>/RUBRIC.md and grade <dir>/packet.json as it says. Report with hc send <your terminal id> '<dir>/verdicts.json'."`
  and the same shape with `--name 6.3-attrib --model fable` for attribution. A Claude trust prompt is
  answered with `hc keys <t> down enter`. Wait with `hc wait --children any`; never sleep or poll.

Report with `hc send t1w3 '/home/tyler/code/raven-wt/np-6.3/.agents/rounds/2026-11-16-next-phase/items/6.3/RESULTS-2.md'`
(or, if you stopped before step 2, the path of EXEC.md) and wait in your terminal.
