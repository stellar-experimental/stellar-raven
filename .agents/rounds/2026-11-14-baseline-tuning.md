# Round 2026-11-14: baseline and tuning on the rebuilt battery

Orchestrator: Claude Fable 5.2 (Mac, hc). Lanes run on the owner's Linux machine under the owner's
Claude subscription (owner, 2026-11-14: approved subscription spend for evals and tuning loops
while weekly limits have headroom). No API-billed path.

This round's branches and the commits it cites are archived in the branch bundle
`~/backups/raven-next-phase/raven-branches-2026-11-16.bundle` (SHA-256
`15f6ff8390c52e259c4fdc97621d2b6278b84d397451c5329d234e88a0138ce7`); see
[DISPOSITION.md](2026-11-16-next-phase/items/0.3/DISPOSITION.md).

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

**Arm 2 result (A5 read).** Branch `tune/loop-1-arm2` (`origin/main` plus arm 2 only), 15 of 15
repeats, USD 2.90 (ARM-2.md). **Kept by rule**, as a contract fix: an exact row came back in 8 of 15
repeats on 3 of 5 rows, the agent used its text in all 8, no repeat stated a status or date the
returned text does not show, the marking was never wrong, and both controls stayed correct in all
six repeats. No grade gain is claimed. Where the agent never calls research (one row, 0 of 3) the
arm cannot act.

**Arm 3 (amendment A6), implementation authorized, run not yet.** A commit on top of
`tune/loop-1-arm2` that removes the micro-map from `SERVER_INSTRUCTIONS` through its generator and
leaves `FAMILY_LINE` in the `search` description. An independent reviewer reads the diff before
the run is authorized.

**Arm 3 diff review.** ARM-3-REVIEW.md (Claude Opus 5.5): fit to measure. Served instructions
proven from the assembled Worker (1,899 characters, a strict prefix of 4,066; both tool
descriptions byte-identical).

**Authorization, arm 3.** One collection of the 50-row panel on `d4919118`, same flags and pins as
step 0-prime, `--max-budget-usd 12.5`. Before any verdict is read: freeze and hash the arm 2
exclusion list (rows with an exact row on either side). The trap step adds a transcript read for
governance and attribution claims. Decision rule as A6, threshold 6 net rows, fixed before the run.

**Owner decision, arm 1 (2026-11-14).** The owner keeps arm 1 as a named exception, on the
orchestrator recommendation: it missed K0 by one row (21 of 44, 22 needed), with two traced ups,
no traced down, K2, K3 and K5 held, and cost per answer down 3.3%. The pre-registered result
stands in the record as "not kept by rule"; the exception is the owner decision, not a re-reading
of the rule. The kept set is therefore arm 1 and arm 2 (the code on `tune/loop-1`), plus arm 3
if its run deletes the map.

**Arm 3 result.** Stamp `2026-11-15T00-32-53-variantA`, 50 of 50, USD 9.16 (ARM-3.md). No-map
26 correct, 22 partial, 2 wrong against 22, 25, 3 with the map; net 4 rows up, inside noise;
required-service coverage 49 to 50; no traced down; all six traps kept; input tokens per question
down 4.6%. The governance and attribution read found one unhedged audit attribution on the no-map
side, taken from a Scout audit row with no Docs corroboration.

**Ruling: the map stays (by rule, clause c), and the orchestrator does not seek an exception.** The
one counted instance is the behaviour the removed authority rule guards, in the area the owner
ranks first (audits). One sample with no counterfactual does not show the map caused the
difference, and it does not show the guard is unneeded. Arm 3 (`d4919118`) is not merged. Next
loop: carry the corroboration guard on a surface every client receives (a result caveat or the
base instructions), measure it, and only then remove the map.

**Kept set for the held-out harm check:** arm 1 and arm 2, the code on `tune/loop-1`, after the
diff review's non-blocking fixes.

**Kept set.** `tune/loop-1` at `5fca33a3` (KEPT-SET.md): arm 1, arm 2, and the diff review's
non-blocking fixes; all gates exit 0.

**Authorization, held-out harm check (A8, D3).** One collection of the held-out set on the kept
commit, launched by the orchestrator with `eval/qa/heldout-read.sh` from a sealed id list,
`--max-budget-usd 30`, counts only. Reading fixed in A8: ship the kept changes unless wrong is at
least 15 or correct is at most 31. No held-out result is described as an improvement. The results
file stays in a sealed directory outside the repository; only its SHA-256 is recorded.

**Held-out harm check, result.** 119 of 119 judged, USD 25.02, results SHA-256
`a79c4f07e74fa424d377b71ebe2bf8942c68df3440e759c70998dab7824bf2a2` (sealed, outside the
repository). Correct 51, partial 61, wrong 7; core answer correct on 115; trap rows 7 of 7. Paired
with the stored baseline on 119 rows: 24 up, 10 down, 5 became wrong, 8 left wrong (stored
baseline on these rows: 37, 72, 10).

**Reading (A8): no harm; ship the kept changes.** Wrong is below 15 and correct is above 31. This is
not reported as an improvement: the two runs used different judge-panel caps (34 for the 247-row
baseline, 119 here), and identical surfaces moved 17 of 50 panel rows in step 0-prime.

**Loop 1 closed.** Kept: arm 1 (owner exception) and arm 2. Not merged: arm 3. Spend: step
0-prime 9.74, arm 1 9.61, arm 2 2.90, arm 3 9.16, held-out 25.02; USD 56.43 subscription-equivalent.

## Outcome

**Baseline (Plan 1).** 247 of 247 judged: 82 correct, 144 partial, 21 wrong. Stamp
`2026-11-14T20-13-51-variantA` on `66301389`; USD 45.27 of the 90 cap
([BASELINE.md](2026-11-14-baseline-tuning/BASELINE.md)). Merged in #442 as `06757beb`.

**Tuning loop (Plan 2).** Kept: arm 1 (owner exception) and arm 2. Merged in #446 as `0a603453`
(2026-11-15 02:28:53 UTC) and deployed (see the header of
[the loop 2 ledger](2026-11-15-tuning-loop-2.md)). Arm 3 was not merged; its micro-map removal
shipped in loop 2 (#447). The held-out harm check read "no harm shown". Spend: USD 56.43
subscription-equivalent, the tuning loop only; the baseline is the USD 45.27 above.

**Retained evidence, and what needs it.** Every file in this round's folder stays, because the
ledger, [`.agents/TODO.md`](../TODO.md) and the loop 2 plan cite its labels (amendments A1 to A11,
step 0-prime, K0 to K5) or hold a result: `BASELINE.md`, `ARM-1.md` to `ARM-3.md`,
`CASE-DEFECTS.md` and its review, `STEP-0-PRIME.md`, `TUNE-IMPL-1.md`, `TUNE-DIFF-REVIEW.md`,
`ARM-3-IMPL.md`, `ARM-3-REVIEW.md`, `KEPT-SET.md`, `TUNING-PLAN.md` with its review and
amendments, `review.json` and `arm3/`. Current artifacts that cite them: `eval/qa/cases.json`,
`eval/qa/sample.json`, `eval/qa/consistency-register.json` (which also cites
`CASE-DEFECTS-REVIEW.md`), four battery cases, and the findings `sd-074`, `sd-109` and `sd-110`.
The launch brief `briefs/baseline.md` is deleted.

Open work moved to the TODO: "Settle the routing-row overlap with the held-out QA questions" and
the rest of "First-principles round follow-ups".
