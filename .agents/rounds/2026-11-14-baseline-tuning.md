# Round 2026-11-14: baseline and tuning on the rebuilt battery

Orchestrator: Claude Fable 5.2 (Mac, hc). Lanes run on the owner's Linux machine under the owner's
Claude subscription (owner, 2026-11-14: approved subscription spend for evals and tuning loops
while weekly limits have headroom). No API-billed path.

## Plan 1: first full baseline

1. **Decision.** Sets the reference for every later comparison on the 247-case battery, and names
   the tuning targets: which failure classes recur (agent, own-repo, source gap) on the tuning
   set. It also answers whether compact key facts grade more strictly than the old prose.
2. **Smallest run.** All 247 headline cases once, variant A, Claude Sonnet 5.5 answering, the
   pinned judge. One client: the decision does not depend on the client. No stored run matches
   (cases, key facts and denominator changed in PRs 436 and 438). Commit `66301389`, before the
   `stellarOrg` source lands, so that source's effect can be measured against these rows.
3. **Stop rule, cap, estimate.** One collection, `--max-budget-usd 90`. The 70-case test cost
   USD 0.22 per case and 57 minutes; stored older runs cost USD 0.32 to 0.41. Expect USD 55 to
   100-equivalent and three to four hours. A changed pin, the cap, or a rate limit stops the run:
   report what completed, do not resume, do not re-judge.
4. **Review coverage.** Tuning-set rows only (79 cases): every `wrong`, every trap row, every
   `partial`, and every fifth `correct`. Held-out and reserve rows are reported as counts only and
   no lane opens their transcripts.

Held-out split: amended after PR 438 by the README rule (one retired case removed, two new cases
to reserve). SHA-256 `697c550ae15400f5d7e8d9e47f4fd3d5460a6052d91571f5014ef4d35f64ed12`; 79 tuning,
119 held-out, 49 reserve; kept outside the repository.

## Lanes

| Lane | Model | Terminal | State | Output |
|---|---|---|---|---|

## Ledger

## Plan 2: first tuning loop

Plan [TUNING-PLAN.md](2026-11-14-baseline-tuning/TUNING-PLAN.md), review and adopted amendments A1
to A9 and A11 beside it. Implementer report: TUNE-IMPL-1.md (arm 1 `a321c5b7`, arm 2 `3eb40f56`).

Orchestrator rulings on TUNE-IMPL-1 (Claude Fable 5.2, 2026-11-14): the panel stays at 50 rows
(`q-protocol-version-history-list` is not added); the `eval/gates.json` fingerprint re-stamp and
the missing live Mintlify check go to the independent reviewer of the diffs.

**Authorization, step 0-prime.** One collection of the 50-row panel on `6ce86dce` (surface
`b336fa14…3404` asserted before spend), Claude Sonnet 5.5 answering, pinned judge,
`--max-panel-cases 50`, `--max-budget-usd 12.5`. Subscription spend under the owner approval of
2026-11-14. No resume, no re-judge. Arm runs are authorized separately after the diff review.

**Step 0-prime result.** Stamp `2026-11-14T22-18-17-variantA`, 50 of 50, USD 9.74: 22 correct, 25
partial, 3 wrong (STEP-0-PRIME.md). Same-surface movement against the stored baseline: 17 of 50 rows
changed (8 up, 9 down); on the 35 tier-matched rows, 7 changed. Verdict counts alone cannot carry a
decision here; traced attribution (A1) does.

**Diff review.** TUNE-DIFF-REVIEW.md (Claude Opus 5.5): arm 1 and arm 2 fit to measure, no blocking
finding. Condition on arm 1: one free keyed live execute on the arm 1 server must show the detail
sentence before collection.

**Authorization, arm 1.** One collection of the 50-row panel on `a321c5b7`, same flags and pins as
step 0-prime, `--max-budget-usd 12.5`, after the live check above passes and after the two trap
rows that fail on step 0-prime are reviewed from their transcripts. Compared with step 0-prime
under K0 to K5 as amended. No resume, no re-judge.

**Arm 1 result.** Stamp `2026-11-14T23-04-27-variantA`, 50 of 50, USD 9.61 (ARM-1.md). By the
pre-registered rules: **not kept**. K0 failed by one row (21 of 44 rows that saw the sentence then
read a page; 22 needed), so the verdict changes count as noise. Evidence recorded for the owner:
page reads 10 to 34; target rows reading a page 0 of 9 to 4 of 9; two traced ups, no traced down,
one traced wrong claim removed; K2, K3, K5 held; cost per answer down 3.3%. The run lane recommends
keeping it. The orchestrator does not override a pre-registered rule: arm 1 stays on its commit,
unmerged, and the keep decision goes to the owner as a named exception with this evidence.

**Authorization, arm 2 (amendment A5).** Arm 2 is measured without arm 1: a commit that is
`origin/main` plus arm 2 only. After free checks 1 to 3 pass on that commit, collect the five
identifier-naming panel rows three times each, `--max-budget-usd 4`. Keep rule as A5 states.
