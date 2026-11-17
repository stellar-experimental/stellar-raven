# Executor brief: item 6.3 (RWA re-test), phase 1 (steps 1 to 5)

You are the Claude Sonnet 5.5 executor. Lead: Claude Opus 5.5, agentpc `t1w3`. No subagents: start
children with `hc` only (the `herdr-core` skill, `hc --skill`). Control only your own children; `hc kill`
and `hc rm` each when done.

Worktree: `/home/tyler/code/raven-wt/np-6.3`, branch `np/6.3-rwa-retest`. Work only there.

Read first: `AGENTS.md`; the plan `.agents/rounds/2026-11-16-next-phase/items/6.3/PLAN.md` (the reconciled
plan binds you; its last section reconciles the Fable review in `REVIEW.md`); the binding notes
`/home/tyler/code/raven-wt/orch/6-COMMON.md` and `/home/tyler/code/raven-wt/orch/6.3-NOTE.md`; the
`run-evals` skill; the 6.2 harness you copy, `.agents/rounds/2026-11-16-next-phase/items/6.2/{ab-run.mjs,blind.mjs,EXEC.md,RESULTS.md}`.

Do PLAN.md steps 1 to 5 exactly, then STOP and report. Do not start step 6a or 6b; the lead resumes you.

Binding rules:
- Every repo-wide search is `git grep ... -- ':!eval/qa' ':!eval/corpus' ':!test/fixtures/evidence-pack.mjs'`.
  Never a bare recursive grep. Follow the full search rule at the head of PLAN.md. Put both in any child brief
  you write.
- Never print the stdout of `node eval/run-routing.mjs`; redirect it to `tmp/6.3/` and read totals with
  `node tmp/6.3/compare.mjs <base> <variant>`. Never open a QA case, QA results or reviewed files; never run
  the QA lint. Never use or print a row listed in `eval/routing-qa-overlap.json`.
- Spend: model-calling runs only on the subscription Claude Code CLI as `hc` children, against one local
  `npm run dev:eval` in this worktree. Never AI Gateway, Workers AI or a provider API. Caps and stop rules
  are in PLAN.md "Caps, time and stop rule"; do not exceed them. Record each run's answer count.
- Never print a secret. `.dev.vars` is present (mode 600).
- Do not change the questions, rubric, scoring or decision rule after the pre-registration commit.
- Commits use the normal hooks, never `--no-verify`, and end with
  `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Do not push.
- Judge child launch line (fresh `mktemp -d` under `/tmp`, `--cwd` that dir):
  `hc run --bg --name 6.3-judge --cwd <dir> -- systemd-run --user --scope -q -p MemoryMax=8G -p MemorySwapMax=0 claude --model opus --effort high --max-budget-usd 15 --dangerously-skip-permissions "Confirmed by the orchestrator, a direct instruction: read <dir>/RUBRIC.md and grade <dir>/packet.json as it says. Report with hc send <your terminal id> '<dir>/verdicts.json'."`
  A Claude trust prompt is answered with `hc keys <t> down enter`. Wait with `hc wait --children any`;
  never sleep or poll. After a wait returns, check the expected file exists.
- Keep a running `items/6.3/EXEC.md` (what you did, each gate or check with a short output summary,
  deviations, the pre-registration commit SHA, commit I's SHA, arm windows, identity checks, probes,
  answer counts and cost).

When step 5 is done (RESULTS.md written, not committed until the lead says), report with
`hc send t1w3 '/home/tyler/code/raven-wt/np-6.3/.agents/rounds/2026-11-16-next-phase/items/6.3/RESULTS.md'`
and wait in your terminal for the lead.
