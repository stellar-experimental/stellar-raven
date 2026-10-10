# R7: p8b pre-spend review

The evidence supports the proposed Stage 2 change.
Two method gaps need correction before spend.
Keep the original p8 result BLOCKED.

I reviewed `96f042da` and commits `6203de78..96f042da`.
I checked the pinned arm at `36e77d4067e1a0d0c5156c0eaf1ee2904200b21b`.
I used the run-evals skill for this review.
I made no paid call, started no server, and changed no tracked file.

## Required corrections

### R7-1: The named diagnostic command does not process the continuation

`amendment-p8b.md:90` directs the reader to recompute the new artifact through `analyze-rejudge-p8.mjs`.
That script reads only the original `rejudge-artifacts.json`.
It currently processes the historical 32 pairs.
It has no argument for a continuation artifact.

Adding a `P8B` entry alone does not fix this.
The script derives stage `8` from that name at line 44.
At lines 45–47, it seeks `rr3-P8B-A-q-defi-arbitrage-pathpayment-bots-input.json`.
That input does not exist.
The resulting `spanSupport` is `null`, and the new row lacks its paired baseline.
Reusing the `S2a` key would instead replace the historical B result in the report map.
That conflicts with the requirement to retain the historical panel.

Declare a separate continuation manifest and an exact offline reading command before spend.
The command must map `P8B` to its saved input and its p6 baseline.
It must retain the old p8 panel separately and recompute diagnostics for the new votes.
A small dedicated command is sufficient; no paid self-test is needed for report-only changes.

### R7-2: Error votes lack a fixed acceptance rule

The amendment forbids retries and requires reporting failed or partial invocations.
However, its acceptance rule does not state how error votes affect acceptance.
It does not specify a minimum number of graded votes.
An error vote has no grade, so the lower-grade condition does not classify it.

The existing runner does not make this decision for the amendment.
I tested the pinned `rejudgeRows` with an offline judge substitute.
An `error/correct/correct` panel produces `correct`, with three reported costs and no stop error.
Thus, a completed invocation can contain an error vote.

Declare the permitted error count and the required graded count before spend.
State whether such a panel blocks acceptance or follows an explicitly retained panel rule.
Also require the declared call count, complete costs, matching inputs, and passed identity checks before acceptance.
Do not resolve this choice after seeing the new panel.

The probe and its output are [rr7-stop-probe.mjs](rr7-stop-probe.mjs) and [rr7-stop-probe.json](rr7-stop-probe.json).
They use no model or network call.

## Checks that pass

### Rule and scope

I compared the quoted Stage 2 blocks byte for byte.
The amendment reproduces the R6 replacement exactly.
It applies the replacement only to the continuation.
The results and ledger retain the original BLOCKED result.
The new reading permits an accurate downgrade and blocks a demonstrated evidence failure at any grade.
It also blocks an unresolved downgrade cause.
These rules do not require a favorable grade.
The error-vote gap above remains separate.

### Fixed selection and free preflight

The invocation table contains exactly one `P8B` entry.
It selects only `q-defi-arbitrage-pathpayment-bots`, with panel size 3 and a $0.85 file cap.
The launcher runs only arm B and has no method retry loop.
The fixed command is:

```sh
.agents/rounds/2026-10-10-weekend/pack-p8/launcher/run-inv-p8.sh P8B paid
```

I ran only its `P8B dry` form.
It exited 0 and selected the declared row.
It reported revision mode, `cases.matches: true`, and no golden-time violation.
The current tuple was `claude-sonnet-5` / `v2.11` / `p8`.
The older source tuple is not the reused p6 baseline tuple.

Both worktrees were clean.
The arm HEAD matched the full declared commit.
The frozen launcher reproduced the declared binary and environment hashes.
The arm's free static self-test was GREEN.
Owner approval and a favorable pre-spend review still need recording before launch.

### Independent input reconstruction and R5-1

I rebuilt inputs from the original saved result files and the historical case revisions.
I did not rely only on the cached R6 input files.
All 24 artifact hashes matched their manifest entries.
All 64 packs and 64 full prompts matched their recorded hashes.
All 192 historical call records matched the reconstructed prompt and answer hashes.
The reconstructed inputs also matched the cached R6 inputs.

[rr7-check.mjs](rr7-check.mjs) records these checks.
[rr7-check.json](rr7-check.json) records the results and the selected row's full verdicts.
The supplied `verify-r5-1.mjs` separately reproduced 64 matching packs and prompts.
Its 48 diagnostic comparisons showed no changed result.

Commit `e7ca3fb0` changes the diagnostic filter, its tests, and its documentation.
It does not change pack construction.
The judge, prompt, rubric, adapter, sanitizer, verdict consistency code, and `eval/lib/` have no specified revision diff.
The pinned arm also retains the original code.
The seven-call historical self-test has seven matching results, complete costs, and the recorded file hash.
Therefore, the unchanged continuation needs no paid self-test.

The selected p6 pack and prompt hashes reproduce exactly:

```text
76eec18f8cecd31e1fa7cdd3c68a6f3d85dfe1c42e0cce76a2a09903a3f6ebe8
ee8a879f38f60476aa96d7be0e0dc946a45cd448c43185c127c78a9d85955d9e
```

The selected p8 pack and prompt hashes also reproduce exactly:

```text
ac9c47b6be31afb685b94112c6c205fd7387580ea5ae935a72b5681e02caa1d0
3cc7187326b5487ae31fb433efcbe87f5eea060e992852eca54c68d4c3b1887e
```

### Reuse and the StellarTerm evidence

The manifest contains 32 paired rows.
All 12 arm-A manifest entries match the earlier p7 manifest.
Both arms retain the declared model, rubric, panel size, and identity pins.
The proposed reuse is valid under those checks.
The report must identify one newly measured row and 31 reused rows.
The other three Stage 2 downgrades retain qualitative attribution, without a measured variance claim.

The original transcript contains one StellarTerm record, at array index 5, in the first execute result.
It gives `name="StellarTerm"`, `slug="stellarterm"`, and `status="Live"`.
Its URL is `https://stellarlight.xyz/project/stellarterm`.
The source metadata gives `generatedAt="2026-10-08T00:04:52.749Z"` for `scout.searchProjects`.
The candidate joins StellarTerm to the list described as “marked Inactive”.
Its stated directory date matches that source metadata.
The remaining transcript supplies no competing StellarTerm status or stale-status qualification.

The p8 pack retains the Live status in source item 8.
All three historical p8 votes cite that contradiction.
The p6 panel is C/C/P; its first vote reads the candidate sentence more narrowly.
That alternative reading concerns sentence interpretation, not competing source evidence.
The new review must retain that rationale when assessing the new votes.

Correct one minor wording detail: p6 does show the StellarTerm URL under `canonicalUrls`.
It omits the StellarTerm status record.
Thus, “p6 omits the status record” is more exact than “p6 does not show StellarTerm”.
This correction does not change the evidence finding.

### Spending and review controls

The runner passes the remaining file budget to each sequential call.
Missing costs or exhausted budgets prevent the next call.
The $0.60 threshold is an after-invocation check, as the original plan explicitly states.
It is not a per-call cap.
My offline probe confirmed that a $0.61 first call can precede two further calls within $0.85.
Repeat the checkpoint wording in the amendment to avoid implying a stronger control.

The three-call count concerns judge invocations.
The unchanged adapter still permits two internal CLI transport retries.
The amendment prohibits repeating the method or replacing an error vote.

The post-run review is mandatory and names a primary reviewer and fallbacks.
Apply the repository's author-and-orchestrator exclusion when selecting any fallback.
A fresh session alone does not establish a different model or reviewer role.
Reconcile every finding before accepting the result or enabling p8 judge inputs.

## What acceptance would permit

This pre-spend review does not approve a merge or deployment.
After the corrections, launch approval would permit only the declared invocation, subject to the recorded owner approval.
An accepted prospective result could clear the measurement gate for a later active-p8 merge.
That merge still requires the applicable code checks, review reconciliation, and merge authorization.
The current branch already uses p8 for judge inputs; it is not an isolated diagnostic implementation.
The original p8 result remains BLOCKED even after a successful continuation.
Acceptance would not establish general accuracy, statistical equivalence, or 32 newly measured rows.
It would not authorize another paid call.

PRE-SPEND: BLOCK: R7-1 continuation diagnostic path; R7-2 error-vote acceptance rule

## Delta re-review

I reviewed only commit `b783a18bed405ca43e601b53cafc43c39181def3` against the R7 findings.
I read the reconciliation section in `/private/tmp/claude-501/w1010/r-report.md`.
Both blocking findings are resolved.
The minor corrections are also complete.
I made no paid call, started no server, and changed no tracked file.

### R7-1: resolved

The separate `p8b-artifacts.json` maps the continuation to the saved input and the p6 baseline.
It retains both historical B panels separately.
Its `continuation` field remains `null`.
The original 32-pair manifest is unchanged.

The new `analyze-p8b.mjs` verifies the artifact hashes and rebuilds the expected p8 pack and prompt.
It recomputes the current support diagnostic for each new vote.
It reports all rationales and keeps the baseline's first rationale visible.
The amendment gives the exact command and the steps for recording the new artifact.
It permits no replacement of a historical panel.

### R7-2: resolved

The amendment now requires three graded calls, zero error votes, and three reported costs.
It also requires matching inputs, the declared tuple, successful completion, and passed identity checks.
The command checks these requirements before returning `ready-for-reading`.
Any error vote makes the continuation `INCONCLUSIVE`.
That result cannot pass, permit a retry, or permit a replacement call.
The p8 result stays BLOCKED in that case.

A `ready-for-reading` status is not an acceptance decision.
The operator and independent reviewer must still assess every rationale under the amended evidence rule.
The requirement blocks an evidence failure regardless of the grade.

### Repeated free checks

All four requested commands exited 0.

| Command | Confirmed result |
|---|---|
| `analyze-p8b.mjs` | `not-run`; both input hashes match; baseline C/C/P; historical p7 C/C/C and p8 W/P/P. |
| `analyze-p8b.mjs --stand-in historical` | `ready-for-reading`; three graded votes; lower grade; three StellarTerm citations; recomputed diagnostics present. |
| `analyze-p8b.mjs --stand-in error-vote` | `INCONCLUSIVE`; two graded votes; failure message `an error vote has no grade`. |
| `launcher/run-inv-p8.sh P8B dry` | One declared row; revision mode; matching cases; no golden-time violation; declared model, rubric, and pack. |

Both stand-in outputs exactly match the committed JSON outputs.
They use historical evidence and make no new measurement.
The stand-in mode explicitly bypasses the historical artifact's larger row count and file cap.
The ordinary continuation path retains both checks.

The saved outputs are [default](rr7-delta-default.json), [historical](rr7-delta-historical.json), [error-vote](rr7-delta-error-vote.json), and [dry run](rr7-delta-dry.json).

### Minor corrections and disposition

The amendment now states that p6 retains the StellarTerm URL but omits its status record.
It identifies $0.60 as an after-invocation checkpoint and $0.85 as the enforced file cap.
It distinguishes internal transport retries from prohibited method retries.
The reviewer selection excludes both the author and the orchestrator, including the Claude Opus fallback.
The mandatory independent post-run review remains in place.

This commit changes no judge input construction or paid runner code.
It creates no requirement for another paid self-test.
The prior evidence checks remain applicable within this bounded review.

Launch clearance covers only the declared P8B invocation after the required owner approval and preflight checks.
It does not authorize additional paid calls, a merge, or a deployment.
The original p8 run remains BLOCKED.
Only an accepted prospective result can clear its separate measurement gate for a later active-p8 merge.

PRE-SPEND: LAUNCH-OK
