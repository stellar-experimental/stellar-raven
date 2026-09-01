# Bounded delta re-review: release closeout paid eval brief

- Reviewer: Claude Fable 5.1, high effort
- Author and orchestrator under review: Codex GPT-5.6 Sol
- Revised brief: `.agents/rounds/2026-09-01-release-closeout.md` (untracked, revised 2026-09-01 17:10)
- Prior review: `/tmp/release-eval-fable-review.md`, copied byte-identical to
  `.agents/rounds/2026-09-01-release-closeout/pre-spend-fable.md`
- Branch: `maintenance/free-improvements-followup` at `482226c` (unchanged since the prior review)
- Scope: only the lines the revision changed, checked against findings F1 through F8
- Mode: read-only. No repository file was edited. No paid call ran.

Per instruction, the planned prelaunch receipt is treated as the exact revision assertion.

## Reconciliation table

| # | Prior finding | Revised brief text | Status |
| --- | --- | --- | --- |
| F1 | Untracked brief trips the clean-tree gate | "The brief and its review must enter that commit before the server starts." Stop rule on clean-tree mismatch retained. | Reconciled, with one placement condition (see below) |
| F2 | "One judge call" contradicts tiered judging | "The cap includes one answering call and up to three judge calls." Budget stays `$1.50`. | Reconciled |
| F3 | Server revision unnamed; run position undefined | "The paid run occurs before merge on the committed branch head." "A prelaunch receipt will record the exact commit before spend." "The paid command and the server must use that exact commit." "The later production deployment will use the merged `main` commit." | Reconciled via the receipt |
| F4 | Three artifact checks missing; aggregate wording | `safeMode` false, `agentBinary.matches` true, `inherited.matches` true, `raven` connected, `aggregatesSuppressed: false`, five tracks, every panel vote inspected. | Reconciled |
| F5 | Environment SHA is an observation, not a pin | "The paid shell must not run inside a nested Claude Code session." "The closeout will record environment variable names, but never their values." Recompute in the paid shell retained. | Reconciled |
| F6 | Opus choice unjustified; no findings file rule | Sol excluded as author and orchestrator. Fable excluded as prior reviewer. Opus named with reason. "The final reviewer writes findings to Markdown and returns only the path." | Reconciled |
| F7 | Rubric and pack unnamed | "The judge rubric is `v2.10`." "The evidence pack is `p5`." | Reconciled; matches `JUDGE_RUBRIC` and `PACK_VERSION` at `482226c` |
| F8 | Repo edits during the run break comparability | "Do not edit a repository file between server launch and paid-command completion." | Reconciled |

## Verification notes

**F2 budget check.** The worst observed case from stored `v2.9`/`p5` Sonnet-5 runs is one
answering call at $0.65 plus three judge calls at $0.16 each, or $1.13. That is below `$1.50`.
The ledger enforces the cap through one `--max-budget-usd` flag. The call-count authorization now
matches the harness default. No `--max-panel-cases` override is needed.

**F3 receipt as revision assertion.** The receipt records the commit before spend. The runner
independently stamps `runnerRevision`, `serverRevision`, and the compiled source revision, and it
refuses a mismatch before any paid call. The receipt plus those stamps satisfy the skill rule that
pins are asserted before spend, not reconstructed after.

**F1 placement condition.** The receipt must not sit inside the repository as an untracked or
modified file at launch. The runner counts every untracked file as dirty. A receipt written after
the brief commit but inside the tree would recreate the F1 failure. Two placements work: a path
outside the repository, or the gitignored `eval/qa/results/` directory. If the receipt lands
elsewhere, the existing clean-tree stop rule halts the run before spend, so no money is at risk.
The condition is a procedure note, not a defect in the brief text.

**Unchanged sections.** Scope, change attribution, denominator, free checks, cost context, and
the production evidence section are byte-for-byte unchanged and stay outside this delta. The
prior review's findings on those sections were passes, except the production section, which the
prior review did not verify and this review does not verify.

**Minor wording.** The brief still says "Claude Fable 5". The reviewing model is Fable 5.1. This
does not affect independence or the gate.

## Remaining open items before spend

None that block. One procedure condition:

1. Place the prelaunch receipt outside the tracked tree, or under `eval/qa/results/`, so the
   launch tree stays clean.

## Result

PASS
