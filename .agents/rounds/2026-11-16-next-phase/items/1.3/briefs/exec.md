# Brief: execute the item 1.3 plan

You are the executor for round item 1.3 (close the source-gap residue). The lead is Claude Opus 5.5
at agentpc `t1rm`. You work in `/home/tyler/code/raven-wt/np-1.3` on branch
`np/1.3-source-gap-residue`.

## Read first

- `AGENTS.md`.
- The reconciled plan: `.agents/rounds/2026-11-16-next-phase/items/1.3/PLAN.md`, and its review
  `REVIEW.md` next to it. The plan's "Reconciliation" section says which review findings changed
  it. The plan is your contract.
- The skills the plan names: `improvements-pipeline` (with `references/upstream-writing-style.md`)
  and `golden-truth`, under `.agents/skills/`.

## Local server

The lead runs `npm run dev:eval` for you at `http://localhost:8787/mcp` (terminal `t1rn`, owned by
the lead: never send it input or kill it). `.dev.vars` sets `DEV_ALLOW_UNAUTHENTICATED`, so a
loopback MCP client needs no token. Call `search` and `execute` with a small MCP client script in
the worktree's `tmp/` (ignored); `eval/report-live-surface.mjs` shows a working client. Never print
`.dev.vars` or a key.

## Rules

- Follow the plan's QA case scope exactly: open only the three case files it names. Never read a
  split file under `~/backups/`. Never write which evaluation set a case is in.
- No model-graded eval, no AI Gateway or Workers AI call, no paid call. Keyless reads only.
- Upstream: issues and comments only, never pull requests, through `npm run improvements:file`.
  Post only after the Grok review is reconciled (plan step 11), and after the finding is committed.
- No subagents. For the Grok attack in plan step 11, start one `hc` child yourself:

  ```sh
  hc run --bg --name 1.3-grok --cwd /home/tyler/code/raven-wt/np-1.3 -- grok --model grok-4.7 --reasoning-effort high --always-approve "Read /home/tyler/code/raven-wt/np-1.3/.agents/rounds/2026-11-16-next-phase/items/1.3/briefs/grok.md and do it. Report with hc send <your terminal ID> '<path>'."
  ```

  Write `briefs/grok.md` first (scope: CLASSIFICATION.md and every new finding; try to find each
  "missing" or "nowhere" fact in a source Raven reaches; keyless; findings to
  `/home/tyler/code/raven-wt/np-1.3/tmp/1.3-grok.md`; edit nothing else). Wait with
  `hc wait --children any`, copy the file to `items/1.3/GROK-REVIEW.md`, reconcile every finding,
  then `hc kill` and `hc rm` the child. If Grok fails to start, use Codex frontier instead
  (`.agents/model-roster.md` has the launch line; Codex writes only under `tmp/`).
- Commit on the branch with the normal hooks, never `--no-verify`. End each commit message with
  `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Do not push; the lead pushes.
- If a step needs an owner decision you cannot make with conviction, write the question into
  `EXEC.md`, finish what does not depend on it, and report.

## Output

`items/1.3/EXEC.md`: what you did per plan step, a short summary of each gate's output (run bare,
after the last edit), every upstream URL you posted, and every deviation from the plan with its
reason. Plus `LEAVES.md`, `CLASSIFICATION.md`, `GROK-REVIEW.md`, and `probes/` as the plan says.
Then report as your task line says.

## Two hand-offs to the lead mid-task

The lead's terminal is `t1rm`. Each time, send one line and wait with `hc wait` for the reply in
your terminal before going on with the dependent step (do other steps meanwhile if you can):

1. **Cluster review** (reconciliation 2). After `npm run eval:qa:register` reopens the clusters,
   commit, then `hc send t1rm 'clusters reopened: <cluster ids>, commit <sha>'`. The lead writes
   the review file and replies with its path; you close the clusters with it.
2. **Push before posting** (reconciliation 13). After the Grok reconciliation and the commit of
   every finding, `hc send t1rm 'ready to post: commit <sha>, findings <ids>'`. The lead pushes and
   replies; then dry-run and post.
