# Brief: Claude Sonnet execution of the item 3.5 plan

You execute round item 3.5 on agentpc in the worktree `/home/tyler/code/raven-wt/np-3.5`, branch
`np/3.5-small-fixes`. Your lead is terminal `t1ss`.

## Read

- `AGENTS.md`.
- The reconciled plan: `.agents/rounds/2026-11-16-next-phase/items/3.5/PLAN.md`. It is your
  instruction. `REVIEW.md` next to it explains why each choice was made.
- The orchestrator note: `/home/tyler/code/raven-wt/orch/3.5-NOTE.md`.

## Do

Carry out steps 0 to 4 and the gates exactly as the plan says, in order. One commit per step
(step 0 commits only the round files under `items/3.5/`). Commit with the normal hooks, never
`--no-verify`. End each commit message with:

```
Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
```

Do not push, open a pull request, merge or deploy.

## Rules

- **Held-out.** Never read a routing runner log or the `holdoutCases` / `protocolHistoryCases`
  arrays of a results file; read lane totals with `jq` only. Never open a split file under
  `~/backups/` or a stored run under `/home/tyler/code/raven-wt/gca-eval/` (the replay test reads
  them itself and selects tuning rows by id first). Never write in `gca-eval`.
- **Spend.** No model-calling eval and no paid call. The replay's keyless Scout reads are allowed.
- **Server.** At most one `npm run dev:eval` child, launched as the plan says, killed and removed
  when the surface check is done. Control only terminals you start.
- **Generated files** come from their scripts. Run gates bare (no pipe).
- **Stop rules.** If a stop rule fires, follow it (step 2 is dropped by reverting its commit and
  keeping its TODO item with the reason). If something the plan does not cover needs a decision,
  stop and say so in EXEC.md rather than guess.
- No subagents. Use `hc` only for the server child.

## Output

Write `.agents/rounds/2026-11-16-next-phase/items/3.5/EXEC.md` (after the server stops): what you
did per step with commit hashes; each gate's command and a short summary of its output (quote the
two surface hash lines, the generated-file diff, the lane totals before and after with holdout as
counts, the ranked-dump `cmp`, the replay call count and comparison, the bundle hash comparison);
the known residuals; and every deviation from the plan. Commit EXEC.md as the last commit. Then
report as your task line says.
