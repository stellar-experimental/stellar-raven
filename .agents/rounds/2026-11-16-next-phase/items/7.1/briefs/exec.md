# Item 7.1 executor brief (Claude Sonnet 5.5)

You carry out the reconciled plan for round item 7.1 in the worktree `/home/tyler/code/raven-wt/np-7.1` (branch
`np/7.1-case-search-guard`). The plan is `/home/tyler/code/raven-wt/np-7.1/.agents/rounds/2026-11-16-next-phase/items/7.1/PLAN.md`; its section "Reconciliation with REVIEW.md"
overrides anything above it where they differ. Read `AGENTS.md` first, then the plan, then
`/home/tyler/code/raven-wt/np-7.1/.agents/rounds/2026-11-16-next-phase/items/7.1/REVIEW.md`.

## What to do

1. Carry out the revised steps at the end of the reconciliation section, in order, with the tests the plan names. Keep the
   diff scoped. Match the repository's code and documentation style; tests go where similar tests
   live (`test/`), and `npm test` must include them.
2. Run the plan's gates bare (no pipes on the gate command itself). For the routing gate stdout check,
   capture stdout to a file in `/home/tyler/code/raven-wt/np-7.1/tmp/` and count holdout and protocol-history ids in it with a
   short script that prints only the count.
3. Commit on the branch with the normal hooks, never `--no-verify`. Commit messages end with:
   `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`
4. Write `/home/tyler/code/raven-wt/np-7.1/.agents/rounds/2026-11-16-next-phase/items/7.1/EXEC.md`: what you did per step, a short summary of each gate's output, the live hook
   probe result, the Codex hook contract finding, and every deviation from the plan with its reason.
5. Do not push and do not open a pull request; the lead does.

## Live hook probe

The reconciliation (finding 11) defines the probe: after the hook commit, start one child in the
worktree so the committed settings load:

```sh
hc run --bg --name 7.1-hook-probe --cwd /home/tyler/code/raven-wt/np-7.1 -- systemd-run --user --scope -q -p MemoryMax=8G -p MemorySwapMax=0 claude --model sonnet --effort high --dangerously-skip-permissions "<one short line: with Bash run exactly grep -r CANARY scripts/agent-hooks and then rg --hidden -g '*.json' CANARY eval, run nothing else, write each exact tool result to <abs file in tmp/>, then hc send $HC_TERMINAL_ID '<that path>'>"
```

Wait with `hc wait --children any`; do not sleep or poll. A child in state `blocked` is waiting on a
dialog: read it with `hc read`; a trust prompt is answered with `hc keys <t> down enter`. When done,
`hc kill` and `hc rm` the child. Control only your own children. If either command is not denied,
stop and report.

## Rules

- Never open a QA case or its content: `eval/qa/corpus/`, `eval/corpus/`, `eval/qa/cases.json`,
  `eval/qa/sample.json`, `eval/qa/tool-cases.json`, `eval/qa/results/`, `eval/qa/reviewed/`,
  `eval/qa/consistency-register.json`, `eval/qa/source-sentinels.json`, `eval/holdout-cases.json`,
  the two protocol-history blind case files, and the files inside
  `.agents/rounds/2026-11-02-golden-audit/` and `.agents/rounds/2026-11-14-golden-coverage-audit/`.
  Scripts you write may read them and print counts, paths and ids only. Use counts, hashes, sizes,
  git history and script source. Never print a holdout row.
- Every repo-wide grep excludes the case folders, for example
  `git grep <pattern> -- ':!eval/qa' ':!eval/corpus'` (add the two golden rounds when the pattern
  could match their text). Use `-l`, `-c` or `-o` when a match line could carry case text. The Claude
  Code Grep and Glob tools search the whole tree too: pass a path or glob that excludes the case folders.
- Once the hook is installed in the worktree it applies to you too: use `rg`.
- The flush (old step 6) is out of scope: do not delete or edit anything under the two golden rounds.
- Do not run the QA lint (`npm run eval:qa:lint`) or any model-calling eval. The probe is the only
  model call.
- Never print a secret. No subagents; `hc` children only for the probe.
- If a step needs a case file opened, or the probe shows the hook does not fire, stop, write what
  you have to EXEC.md, and report.
- When done, run: `hc send t1wn '/home/tyler/code/raven-wt/np-7.1/.agents/rounds/2026-11-16-next-phase/items/7.1/EXEC.md'`
