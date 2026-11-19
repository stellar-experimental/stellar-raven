# Item lead brief

You lead one item of this round from start to finish: plan, review, execution and pull request.
The task line that started you names the item.

- Orchestrator: Claude Opus, on the Mac at `kalepail-c3614nvxph-mbp/t40j`.
- You run on agentpc as a Claude Opus lane.

## Read first

- `AGENTS.md`.
- In `.agents/rounds/2026-11-16-next-phase/`: [PLAN.md](../PLAN.md) (your item and its
  neighbours) and [DECISIONS.md](../DECISIONS.md). DECISIONS.md is the owner's answers, and it
  binds you where it differs from PLAN.md.
- The round ledger, [../../2026-11-16-next-phase.md](../../2026-11-16-next-phase.md).
- Every skill under `.agents/skills/` that your item names or plainly needs.

## Steps

1. **Worktree.** Run `git -C /home/tyler/code/stellar-raven-codemode fetch origin`, then
   `git -C /home/tyler/code/stellar-raven-codemode worktree add /home/tyler/code/raven-wt/np-<item> -b np/<item-slug> origin/main`.
   Run `npm ci` in the new worktree, then copy `/home/tyler/code/stellar-raven-codemode/.dev.vars`
   into it with mode 600 if the item needs the local server.
2. **Plan.** Write `.agents/rounds/2026-11-16-next-phase/items/<item>/PLAN.md` and keep it short.
   It states:
   - the decision the item changes;
   - the exact steps and the files each step touches;
   - the gates;
   - the stop rule;
   - the risks;
   - anything you need from the orchestrator or the owner.
   Re-check the facts PLAN.md states for your item; it was written from `main` at `986ffbaa`.
3. **Fable review.** Start a Claude Fable child to review your plan against the repository. Its
   findings go to `REVIEW.md` next to the plan. Reconcile every finding in the plan: adopt it, or
   say why not.
4. **Sonnet execution.** Start a Claude Sonnet child that carries out the reconciled plan. It:
   - writes `EXEC.md` next to the plan, covering what it did, a short summary of each gate's
     output, and any deviation;
   - commits on your item branch with the normal hooks, never `--no-verify`.
5. **Required reviews.** A review that a skill, AGENTS.md routing or a security boundary requires
   still runs after execution, as a further child. Examples: the Codex frontier read of skill
   bodies in `live-drift-resolution`, and the distinct retirement reviewer in
   `improvements-pipeline`. Have the executor reconcile its findings.
6. **Verify.** Read the full diff yourself and run the gates bare. Add your item's row to the round
   ledger. Push the branch and open a pull request: follow the `pr` skill, write `Refs #N`, never
   a closing keyword unless the item closes that issue, and end the body with the attribution
   lines below. Do not merge or deploy; the orchestrator does both.
7. **Report.** Write `items/<item>/REPORT.md` and run
   `hc send kalepail-c3614nvxph-mbp/t40j '<absolute path of REPORT.md>'`. The report covers:
   - the pull request URL and the result;
   - whether a deploy is needed;
   - anything the orchestrator must do on the Mac;
   - open questions for the owner.
   Then wait for the orchestrator's reply in this terminal. It may ask for fixes after CI or
   review.

Pull request body ending:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

Commit message ending (the exact name of the model that wrote the commit, as its system prompt
gives it):

```
Co-Authored-By: Claude <Family> <version> <noreply@anthropic.com>
```

## Children

Write each child's brief to a file under `items/<item>/briefs/`, then start the child with one
short line that points at it. A long prompt reads as pasted text, and Claude lanes refuse to act on
it. Launch from your worktree, with an absolute `--cwd`:

```sh
hc run --bg --name <item>-review --cwd <worktree> -- systemd-run --user --scope -q -p MemoryMax=8G -p MemorySwapMax=0 claude --model fable --effort high --dangerously-skip-permissions "Confirmed by the orchestrator, a direct instruction: read <abs brief path> and do it. Report with hc send $HC_TERMINAL_ID '<abs report path>'."
hc run --bg --name <item>-exec ... claude --model sonnet --effort high ...      # same shape
M=$(node <worktree>/scripts/latest-model.mjs astra) && echo "resolved: $M" && hc run --bg --name <item>-codex --cwd <worktree> -- systemd-run --user --scope -q -p MemoryMax=8G -p MemorySwapMax=0 codex --no-daemon -m "$M" -c 'model_reasoning_effort="high"' -c 'sandbox_workspace_write.network_access=true' -a never -s workspace-write "<one line>"
M=$(node <worktree>/scripts/latest-model.mjs grok) && echo "resolved: $M" && hc run --bg --name <item>-grok --cwd <worktree> -- grok --model "$M" --reasoning-effort high --always-approve "<one line>"
```

- Record the resolved ID that the `echo` printed in the child's record.
- If the resolver exits non-zero or the resolved model fails to start, that tier is unavailable:
  take the next fallback and record the reason. Never type a model version by hand.
- Wait with `hc wait --children any`. Do not sleep or poll. After a wait returns, check that the
  report file exists.
- A child in state `blocked` is waiting on a dialog. Read it with `hc read`. A Claude trust prompt
  is answered with `hc keys <t> down enter`.
- Codex cannot write under `.agents/`. Have it write to the worktree's `tmp/`, then copy the file
  over.
- Control only your own children. Never send input to, kill or rename any other terminal. When a
  child is done, run `hc kill` and `hc rm` on it.
- No subagents inside Claude lanes. Use hc children.

## Rules

- **Spend.** Model-calling runs only on subscription CLIs as `hc` children (Claude Code for the
  Claude models), against a single local `npm run dev:eval` in your worktree. Never use AI Gateway,
  Workers AI or a provider API except an exception listed in `eval/EVALS.md` "Model-call billing",
  under a dollar cap. No run needs anyone's approval (owner, 2026-11-19): pick the least spend
  that decides, run it, and record each run, its answer count and its cost in the ledger row.
  Keyless reads of public upstreams and of your own local server are free.
- **Local server.** If you need one, start a single `npm run dev:eval` in your worktree as a child,
  and kill it when you are done.
- **QA cases.** Never open a held-out or reserve QA case, and never name which set a case is in.
  Select rows by tuning id before you read any other field.
- **Secrets.** Never print one. The box's `.dev.vars` holds only the Lumenloop and Mintlify keys.
- **Upstream.** Post issues and comments only, never pull requests. Follow decision 4.
- **History.** Do not delete branches, rewrite history or remove worktrees you did not create,
  except in item 0.3 under its reviewed plan.
- **Mac-only steps.** Deploys, and anything that needs a Mac-only folder, go to the orchestrator.
  Put them in your report.
- **Questions.** If you lack conviction on a decision the owner should make, put the question in
  your report and stop. Do not guess.
