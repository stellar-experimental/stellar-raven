# Brief: Claude Sonnet execution of the item 5.1 plan

You execute round item 5.1 on agentpc in the worktree `/home/tyler/code/raven-wt/np-5.1`, branch
`np/5.1-remove-matchpartners`. Your lead is terminal `t1tm`.

## Read

- `AGENTS.md`.
- The reconciled plan: `.agents/rounds/2026-11-16-next-phase/items/5.1/PLAN.md`. It is your
  instruction. `REVIEW.md` and `QUESTION.md` next to it explain why.
- The orchestrator note: `/home/tyler/code/raven-wt/orch/5.1-NOTE.md`.
- Skills: `improvements-pipeline` (and its `references/upstream-writing-style.md`), `run-evals`
  section 6, `golden-truth` (only if C2 stops).

## Do

Carry out C1 to C5 and the gates exactly as the plan says, in order, one commit per step (C3 has
two: the finding, then the script's rewrite after filing). Commit with the normal hooks, never
`--no-verify`. End each commit message with:

```
Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
```

You may push the item branch (`git push -u origin np/5.1-remove-matchpartners`) for C3's snapshot
link, and push again at the end. Do not open a pull request, merge or deploy. Post exactly one
upstream issue (C3), through `npm run improvements:file`, after you read the dry run as the
maintainer. Never open an upstream pull request.

## Rules

- **The moved QA case id** stays in `tmp/5.1/EXPOSURE.md` (untracked) and appears in no prose you
  write: commit messages, EXEC.md, the amendment note, `gates.json`, the TODO, the finding, and
  messages. The case's own file, `eval/qa/cases.json` and the register necessarily name it.
  That is expected.
- **Held-out.**
  - Never display a routing runner log; read only the `GATE` lines and the `results -> ` line by
    `grep`.
  - Never read the `holdoutCases` array of a results file, and never print a row flagged
    `confirmationOnly`.
  - Never open a split file under `~/backups/` except through your amendment script.
  - Never open `eval/holdout-cases.json`, or a QA case other than the moved one (after C1).
  - `eval:qa:lint` and `sibling-check.mjs` output go to log files; read only the lines the plan
    allows.
- **Spend.** No model-calling eval and no paid call. No local server is needed; start none.
- **Generated files** come from their scripts. Run gates bare, with no pipe, redirecting to a file
  where the plan says.
- **Stop rules.** If a plan stop rule fires, stop, write what you saw (counts only) in EXEC.md,
  and report to the lead. If something the plan does not cover needs a decision, stop and ask the
  lead (`hc send t1tm '<path of a note>'`) rather than guess.
- No subagents. You start no hc children.

## Output

Write `.agents/rounds/2026-11-16-next-phase/items/5.1/EXEC.md`. It covers:

- what you did per step, with commit hashes;
- the v8 path, counts and SHA-256, and the sibling-check last line;
- the C2 read result: "golden independent of the operation", or the stop;
- the upstream issue URL;
- the first gate's two lines;
- the per-case comparison as counts per lane (confirmation-only as counts, other ids allowed) and
  the holdout aggregates;
- each gate's command and a short summary;
- the reverse edit list for a future re-exposure;
- every deviation from the plan.

Commit EXEC.md together with the item folder (PLAN, QUESTION, REVIEW, FOLLOWUP, briefs) as the last
commit, then push. Then report as your task line says. The lead will then start a Codex review and
may send you its findings to reconcile.
