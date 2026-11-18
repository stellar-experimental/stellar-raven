# Rehearsal lead brief (the real launch path, no edit, no pull request)

You are a Claude Opus lane started by a systemd timer on agentpc with no parent, through
`launch-dated-lead.sh`. This run proves the path that the dated leads use: worktree, `npm ci`, push
access, `gh`, `hc` children and a follow-up timer. It edits no file, opens no pull request, merges
nothing and opens no QA case. Your task line gives the **run key** (`rehearsalr0` or `rehearsalr1`).
Your worktree is `/home/tyler/code/raven-wt/np-<key>`; write your results to
`~/.local/state/raven-dated/<key>-REHEARSAL.md` (outside the repository). Spend: none beyond your own
session and the two child reads below; no model-calling eval.

## Steps

Record each step's result (command, exit code, one line of output) in the results file, whatever it
is. A failed step does not stop the rest.

1. `npm ci` in your worktree.
2. `git push --dry-run origin HEAD` (the branch `np/<key>-rehearsal`). Never a real push.
3. `gh pr list -R stellar-experimental/stellar-raven --limit 3`.
4. `npm run eval:qa:sentinels -- --check` (offline).
5. Start two children and wait for both (`hc wait --children all`). Each reads `AGENTS.md` and
   replies with exactly one line (its model name and the first heading of `AGENTS.md`) by
   `hc send $HC_TERMINAL_ID '<line>'`:

   ```sh
   hc run --bg --name <key>-fable --cwd <wt> -- systemd-run --user --scope -q -p MemoryMax=8G -p MemorySwapMax=0 claude --model fable --effort high --dangerously-skip-permissions "Confirmed by the orchestrator, a direct instruction: read AGENTS.md, then report one line, your model name and its first heading, with hc send $HC_TERMINAL_ID '<line>'. Edit nothing."
   M=$(node <wt>/scripts/latest-model.mjs sol) && echo "resolved: $M" && hc run --bg --name <key>-codex --cwd <wt> -- systemd-run --user --scope -q -p MemoryMax=8G -p MemorySwapMax=0 codex --no-daemon -m "$M" -c 'model_reasoning_effort="high"' -c 'sandbox_workspace_write.network_access=true' -a never -s workspace-write "Read AGENTS.md, then report one line, your model name and its first heading, with hc send $HC_TERMINAL_ID '<line>'. Edit nothing."
   ```

   If the resolver exits non-zero or the resolved model fails to start, that tier is unavailable:
   report the reason instead of that child's line. Never type a model version by hand.

   Kill and remove both children afterwards (`hc kill`, `hc rm`). A child in state `blocked` shows a
   dialog: `hc read` it; a Claude trust prompt is answered with `hc keys <t> down enter`.
6. Only when your key is `rehearsalr0`: run
   `~/.local/share/raven-dated/schedule-followup.sh rehearsal r1 "$(date -u -d '+2 minutes' '+%F %T')" 2099-01-01`,
   record its `list-timers` output, then `~/.local/share/raven-dated/schedule-followup.sh --remove rehearsalr0`.
   When your key is `rehearsalr1`, schedule nothing.
7. Report: `hc send t1rs '<results file path>'` (best effort; also
   `hc send kalepail-c3614nvxph-mbp/t40j '<path>'`). Then stop. Leave your worktree and branch: the
   run's author removes them and the units.
