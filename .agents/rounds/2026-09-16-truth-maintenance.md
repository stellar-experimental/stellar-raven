# Truth maintenance 2026-09-16

This record preserves the initial review snapshot.
[Subsequent authorized work](2026-09-16-maintenance-execution.md) records implementation, closure, and production evidence.

## Scope

Review Raven PRs, issues, branches, worktrees, live drift, and active improvements.
The starting checkout was clean at `ac1769f75f72ba41622534f5f53b9c8944aeb69d`.
Its branch was `docs/cleanup-current-guidance`.
The initial `main` and `origin/main` were `722eef5`.
This round produces local review evidence. It does not accept sources or release changes.

## Lane plan

| Lane | Agent | Model and effort | Owned pane | Report |
|---|---|---|---|---|
| Current drift and candidate checks | `rv-drift-0916` | Sol high | `w3G:pW` | [Drift](2026-09-16-truth-maintenance/drift.md) |
| Active findings and upstream handoffs | `rv-findings-0916` | Sol high | `w3G:pX` | [Improvements](2026-09-16-truth-maintenance/improvements.md) |
| PR diffs, checks, reviews, and issue inventory | `rv-github-0916` | Terra high | `w3G:pY` | [GitHub](2026-09-16-truth-maintenance/github.md) |
| Branches, worktrees, freshness, and reconciliation | Coordinator | Current session | `w3G:p2` | This ledger |

Herdr confirmed all three model selections at launch.
Sol owns live interpretation. Terra owns the bounded PR and issue review.
The coordinator will verify consequential findings before accepting them.
Workers can write their reports and isolated evidence only.
Workers cannot change accepted sources, findings, gates, or public state.

## Drift verdict

The rebuilt candidate does not pass the unchanged routing gate.
Its recorded gate failure is the changed manifest fingerprint, not a numeric-floor failure.
Separate per-case evidence still rejects source acceptance.
`scout.getRwaAssets` appears in 51 of 495 top-five lists and leads 11 lists.
The holdout has nine top-five appearances and two top-one appearances across 49 cases.
Some appearances are valid RWA queries. Others include WASM limits, SAC storage, and balance-fetching questions.
The coordinator independently recounted the candidate artifact.
See [routing evidence](2026-09-16-truth-maintenance/drift-independent-routing.json).
The [drift report](2026-09-16-truth-maintenance/drift.md) contains the complete classification and gate record.
Scout advances from `1.9.1` to `1.9.52` in this rejected candidate.
Thirty existing operation objects and nine shared schemas change.
The candidate adds one Docs title and changes the Stellar Light skill pin.
The candidate lacks the required `sel:339145ff9f53` pin attestation.
The runner intersection is empty.
Production health and the skill canary pass, but neither establishes the deployed catalog identity.

## Eval verdict

No new paid evaluation is in scope.
The existing measurement restrictions remain unchanged.
The September 4 result remains diagnostic and non-comparable.

## Golden verdict

`npm run eval:qa:lint -- --stale` passes: 0 errors and 60 warnings.
All 150 dated cases are current. Six cases are due within 28 days.
The known Lab cookbook link still returns 404; its replacement returns 200.
See [freshness review](2026-09-16-truth-maintenance/freshness.md).
This round does not renew factual verification dates or change goldens.

## Improvements/issues/PR verdict

GitHub initially returned PRs #156 and #157.
Open issues were #40, #141, and #158 through #162.
The five new handoffs need original-trigger checks.

PR #156 has successful GitHub checks at its current head.
Its `PLAN.md:22` incorrectly assigns argument validation and client authentication to adapters.
The policy guard and authentication modules own those checks.
Correct that sentence before merging the documentation PR.
PR #157 has no check runs at its current head.
Its [CI run](https://github.com/stellar-experimental/stellar-raven/actions/runs/35001188272) reports `action_required`.
Its active golden records a future maintainer review as activation evidence.
It also marks V1/V2 deployment claims as stable without a scheduled review date.
The coordinator independently reproduced the root-directory mode defect with an empty allow-list.
The current Trustless Work allow-list prevents that defect for this source.
See [root-mode evidence](2026-09-16-truth-maintenance/pr157-root-mode-check.json).
The generated Trustless Work description also retains the YAML `>` marker.
The index description contains only that marker.
Five top-five lists change despite unchanged aggregate routing scores.
The gate-input fingerprint statement is accurate; it does not prove identical ranked results.
PR #157 passed 2,074 unit tests, 94 smoke tests, build, and focused local checks.
The worker did not run typecheck. GitHub CI remains pending maintainer action.
See the [complete PR and issue review](2026-09-16-truth-maintenance/github.md).

The coordinator independently confirmed the corrected `sd-051` rendered page.
Its Phase 0 heading, activation date, and table agree.
The old `Mainnet Edition` marker is absent.
See [source evidence](2026-09-16-truth-maintenance/sd051-independent-source.json).
The improvements worker also reports corrected source and index results for all five new handoffs.
The [improvements report](2026-09-16-truth-maintenance/improvements.md) covers all 61 active records.
The coordinator checked its table against the active files: no missing or duplicate records.
Stored statuses remain 58 `reported-upstream` and three `declined-upstream`.
Base lint and authenticated live lint pass, including all recorded references.
Seven registered probes still reproduce their findings.
Five Docs records pass fresh source and index checks: `sd-040`, `sd-041`, `sd-044`, `sd-045`, and `sd-051`.
These 12 records have fresh original-trigger evidence. The other 49 records remain unchecked in this round.
GitHub metadata review does not establish whether those 49 defects still occur.
Retirement of the five corrected Docs findings still needs the independent review and lifecycle workflow.
The `sd-044` Run Commands page is not page-indexed; its original search trigger now returns corrected indexed pages.
The `#162` handoff has one `2026-02-05` typo. Both served surfaces correctly use 2024.

Docs PRs #2837 and #2844 had an automated approval review.
The later permission check found that neither approval satisfies the required maintainer gate.
See the execution ledger for that correction and the subsequent reviewed patches.
Docs PR #2810 remains a draft. Cloudflare PR #639 has no reported reviews or checks.
The existing `sls-080` cadence check remains unchecked because no existing local Raven server was available.

| Open Raven issue | Disposition |
|---|---|
| #40 | Keep open for authenticated production copy acceptance |
| #141 | Keep open; reject the combined drift candidate |
| #158 / `sd-040` | Fix observed; independent retirement review remains |
| #159 / `sd-041` | Fix observed; independent retirement review remains |
| #160 / `sd-044` | Fix observed; independent retirement review remains |
| #161 / `sd-045` | Fix observed; independent retirement review remains |
| #162 / `sd-051` | Fix observed; independent retirement review and handoff typo correction remain |

## Own-repo todos

Recommended follow-ups, without changing the existing queue:

| Date or trigger | Work | Completion evidence |
|---|---|---|
| Next PR #156 update | Correct the ownership statement in `PLAN.md:22` | Statement matches the policy, authentication, and adapter modules |
| Next PR #157 update | Repair verification records, descriptions, root-mode handling, and review changed rankings | Completed independent review and current-head CI |
| Next source-acceptance decision | Separate Scout, Docs title, and skill-pin candidates | Unchanged acceptance checks and explicit pin review |
| Next maintenance round, from 2026-09-17 | Review retirement of `sd-040`, `sd-041`, `sd-044`, `sd-045`, and `sd-051` | Distinct reviewer repeats original triggers and checks persistent references |
| After upstream deployment | Recheck `sd-027`, `sd-032`, `sd-034`, `sd-046`, and `wai-001` | Original trigger passes against the deployed version |
| Before 2026-10-01 | Complete the existing golden source-metadata task | Live source verification and golden-truth gates |
| Authenticated production session available | Complete the existing #40 copy check | Copy an existing answer without a paid chat request |
| Existing local Raven server available | Run the existing `sls-080` cadence check | Compare the answer with source at the returned `scannedRef` |

## Branch and worktree verdict

Keep the two initial branches and the original worktree.
`main` matches the live remote at `722eef5f2a81845ebdd8206e17ee100344eabd58`.
The documentation branch matches origin and is two commits ahead of `main`.
The initial registry contains one clean worktree and no stashes or stale registrations.
PR #157 uses the external `armandocodecr/stellar-raven` fork.
See [branch and worktree evidence](2026-09-16-truth-maintenance/branches-worktrees.md).
The PR worker removed its two clean temporary worktrees after preserving evidence.
The rejected candidate remains at `/private/tmp/stellar-raven-drift-0916.mOmBFJ/repo`.
It contains nine generated-file changes. Its exact hashes appear in the drift report.
Keep this worktree for evidence. Do not treat it as an accepted update.

## Decisions

Preserve all initial branches and worktrees during the review.
Record cleanup eligibility separately from deletion.
Use current service responses to assess fixes.
Keep GitHub state separate from source, index, and production evidence.

## Local output incident

The improvements worker printed credential-bearing lines during a local search.
The coordinator stopped that search pattern and required secret-free report files.
No GitHub write, commit, or deployment occurred.
The candidate tree scan passed, including the private-usage boundary and Gitleaks.
The coordinator also scanned all tracked files and new review artifacts through a temporary Git index.
That secret scan and the whitespace check passed. The real Git index remained byte-identical.
No credential value appears in the delivered review files.

## Review verification

- Both PR diffs have complete file coverage in the GitHub report.
- The improvements table matches all 61 active IDs, without missing or duplicate rows.
- Local Markdown links resolve.
- The primary checkout has no tracked-file changes or staged changes.
- The PR worker removed its two clean temporary worktrees.
- The coordinator closed the completed PR and drift panes, `w3G:pY` and `w3G:pW`.
- The improvements worker completed. The coordinator closed its pane, `w3G:pX`.
- The improvements worker preserved read-only reproduction scripts and concise results under `improvements-evidence/`.
- All three preserved scripts compiled and executed from the repository root.
- Candidate acceptance, finding retirement, and #40 production acceptance remain future work.

## Final checklist

- [x] All lane findings reviewed and reconciled.
- [x] Every PR and issue has a disposition.
- [x] Branch and worktree ownership and ancestry checked.
- [x] Freshness checks completed.
- [x] Drift and improvements limitations recorded.
- [x] Shared checkout changes contain only review evidence.
- [x] Spawned agents completed; owned panes reconciled.

Final result: the review is complete. Accepted source files, GitHub state, and production remain unchanged.
Only this round's reports, reproduction scripts, and evidence remain untracked in the primary checkout.
