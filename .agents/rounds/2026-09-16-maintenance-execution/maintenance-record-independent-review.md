# PR #166 maintenance record independent review

Date: 2026-09-16

Reviewer: Sol high

Author and coordinator: Astra root

Base: `bb37bc502080c94c3f3b5223ffcdf584d4b0e29d`

Head: `b1c84e54069aea5c66ae3ce8f2b21866941e8f8d`

Tree: `280c446aef4bc0ec5a3cb169ebe1aa3a048ac8c8`

Binary diff SHA-256: `960805d2e63d28daddd0f1447c5c874cc13de540f670f986a6dc356e009b6766`

## Verdict

Changes are required before PR #166 merges.

The record has two medium findings.

The record correctly keeps Scout source acceptance separate from experimental evidence.

It also keeps the proposed RWA case outside the active corpus.

The record makes no false runtime-change claim.

The Docs publication data matches the exact remote heads and checks.

The evidence contains no detected secret.

## Findings

### M1. The current ledger ends with a false pending checklist

File: `.agents/rounds/2026-09-16-maintenance-execution.md:199`

Lines 201 through 203 mark three broad work areas as pending.

The same ledger records completed implementation, reviews, checks, GitHub read-back, deployment, and worktree cleanup.

The pending list therefore contradicts the current ledger body.

The stale list can misdirect the next maintainer and weakens the ledger as current guidance.

Smallest repair:

- Replace the three pending bullets with the actual current state.
- Keep issue #141 and the two external Docs decisions as open work.
- State that the PR #166 record review was pending until this review completed.
- Record any remaining pane or worktree action by exact path.
- State whether `.agents/TODO.md` reconciliation completed.

Do not rewrite the dated source reports to repair this finding.

### M2. The current ledger does not reconcile a known full-suite evidence conflict

Files:

- `.agents/rounds/2026-09-16-maintenance-execution/scout-test-contract-review.md:31`
- `.agents/rounds/2026-09-16-maintenance-execution/scout-combined-freeze-report.md:226`
- `.agents/rounds/2026-09-16-maintenance-execution.md:63`

The test-contract report says no full suite proves 19 failures.

The freeze report records a full suite with 2,104 passed, 19 failed, and 3 skipped.

It identifies the result file and its SHA-256.

The current ledger links both reports but does not reconcile this conflict.

The sentence that calls all copied reports non-acceptance records does not correct the evidence identity.

Smallest repair:

- Preserve the dated test-contract report unchanged.
- Add an explicit correction to the current ledger.
- Identify the record as the pre-person-fix full-suite result.
- Record 2,126 total tests, 2,104 passed, 19 failed, and 3 pending.
- Record SHA-256 `5671911af615e385a20072d66d2ee418d0627622e8f47224669080d315fdf0e9`.
- State that later repairs require a newer run before final Scout acceptance.
- State that this correction does not accept Scout 1.9.52.

This repair follows the required historical-versus-current model.

## Accepted record properties

### Current and historical separation

The initial truth-maintenance ledger labels itself as the initial review snapshot.

The current execution ledger records later actions and their outcomes.

Rejected and interim Scout reports remain dated evidence.

The current ledger says those reports do not grant source acceptance.

Scout remains at accepted version 1.9.1.

`scout.getRwaAssets` remains unexposed.

The RWA case remains a proposal draft only.

### Docs publication evidence

PR #2837 is at `108ba24e0884f46e0c543996e4e94be754709840`.

PR #2844 is at `581b884e20f3ec7e39f9fac64539ff1922d93f6d`.

Each head has nine successful checks in the committed publication records.

GitHub read-back confirms both exact heads and all nine checks.

The author hold remains on PR #2837.

Comment `5705124276` records the PR #2837 handoff.

Comment `5705124464` records the PR #2844 handoff.

Both comments were read back from their public URLs.

The current TODO keeps both maintainer approval and the author hold distinct.

### Links, structured data, and secrets

All local Markdown links in the 29 changed Markdown files resolve.

All 28 changed JSON files parse with `jq`.

The three changed TypeScript evidence scripts pass the Node syntax check.

The scripts use read-only source and index requests.

They do not print credential values.

`npm run secrets:scan -- --tree` passed.

The scan covered the committed tree at the reviewed head.

### Change scope

The diff contains 60 files, 9,076 insertions, and 3 deletions.

All changed files are under `.agents/`.

The change has no runtime, catalog, schema, corpus, gate, or dependency file.

`git diff --check` passed.

The primary worktree stayed clean during this review.

## GitHub and CI state

PR #166 is open and draft.

Its base and head match this review.

GitHub reports 60 changed files and a clean merge state.

At review time, all four PR #166 checks completed successfully.

The checks are CodeQL, secrets, test, and Analyze.

Passing checks do not close the two record findings.

## Complete file coverage

I reviewed every changed file.

The review included direct prose review, structured-data inspection, link checks, and script inspection.

1. `.agents/TODO.md` — accepted, subject to M1 reconciliation wording.
2. `.agents/rounds/2026-09-16-maintenance-execution.md` — M1 and M2.
3. `deployment-bb37bc50.json` — accepted deployment evidence.
4. `docs-repair-independent-review.md` — accepted dated review.
5. `docs-repair-patch-identities.json` — accepted exact patch identities.
6. `docs-title-drift-report.md` — accepted dated drift evidence.
7. `docs-title-independent-review.md` — accepted dated review.
8. `docs2837-published-state.json` — accepted publication evidence.
9. `docs2837-repair-report.md` — accepted dated repair evidence.
10. `docs2844-published-state.json` — accepted publication evidence.
11. `docs2844-repair-report.md` — accepted dated repair evidence.
12. `drift-interim-review.md` — accepted rejected-stage evidence.
13. `external-docs-publication-plan.md` — accepted dated plan.
14. `light-pin-impact.md` — accepted non-acceptance evidence.
15. `light-pin-independent-review.md` — accepted dated review.
16. `pr157-independent-review.md` — accepted staged review history.
17. `pr157-proposal-review.md` — accepted proposal review.
18. `pr157-thread-closeout.json` — accepted thread closeout evidence.
19. `pr157-thread-reconciliation.md` — accepted pre-closeout evidence.
20. `production-canary-after.json` — accepted post-deployment evidence.
21. `production-catalog-after.json` — accepted post-deployment evidence.
22. `production-catalog-before.json` — accepted control evidence.
23. `production-content-comparison.json` — accepted content comparison.
24. `production-search-after.json` — accepted search evidence.
25. `production-search-before.json` — accepted search control.
26. `production-skill-sections-after.json` — accepted section evidence.
27. `raven-docs-closure-readback.json` — accepted GitHub read-back.
28. `routing-ablation-inputs.json` — accepted experimental inputs.
29. `routing-ablation-report.md` — accepted experimental report.
30. `routing-ablation-results.json` — accepted experimental results.
31. `rwa-live-schema-probes.json` — accepted bounded probe evidence.
32. `scout-combined-freeze-report.md` — accepted dated freeze, with M2 reconciliation needed.
33. `scout-combined-independent-review.md` — accepted dated review.
34. `scout-parent-fresh-probes.json` — accepted experimental controls.
35. `scout-runtime-golden-impact.md` — accepted runtime-impact analysis.
36. `scout-rwa-proposed-case.json` — accepted proposal-only draft.
37. `scout-test-contract-review.md` — M2 source report.
38. `sk025-review.md` — accepted dated review.
39. `skill-routing-design-review.md` — accepted design evidence.
40. `sls-080-monitor.json` — accepted bounded monitor evidence.
41. `trustless-auth-source-sweep.json` — accepted source sweep.
42. `upstream-docs-pr-readiness.md` — accepted readiness record.
43. `upstream-pr-followup.json` — accepted open-upstream state.
44. `.agents/rounds/2026-09-16-truth-maintenance.md` — accepted initial snapshot.
45. `branches-worktrees.md` — accepted dated inventory.
46. `drift-independent-routing.json` — accepted routing evidence.
47. `drift.md` — accepted rejected-candidate report.
48. `freshness-source-check.json` — accepted source evidence.
49. `freshness.json` — accepted freshness results.
50. `freshness.md` — accepted freshness report.
51. `github.md` — accepted initial GitHub audit.
52. `improvements-evidence/README.md` — accepted evidence instructions.
53. `improvements-evidence/priority-index-section-extract.ts` — accepted read-only script.
54. `improvements-evidence/priority-recheck-results.json` — accepted trigger results.
55. `improvements-evidence/priority-source-index-recheck.ts` — accepted read-only script.
56. `improvements-evidence/sd044-search-recheck.ts` — accepted read-only script.
57. `improvements.md` — accepted dated improvements audit.
58. `pr157-root-mode-check.json` — accepted review-mode evidence.
59. `routing-identity-diff.json` — accepted routing comparison.
60. `sd051-independent-source.json` — accepted independent source evidence.

Paths 3 through 43 use the prefix `.agents/rounds/2026-09-16-maintenance-execution/`.

Paths 45 through 60 use the prefix `.agents/rounds/2026-09-16-truth-maintenance/`.

## Required closeout

PR #166 needs the two ledger repairs above.

After those repairs, rerun the Markdown link check and the secret scan.

A reviewer must verify the repaired current ledger against this report.

No runtime test rerun is required for these prose-only repairs.

This review does not accept Scout 1.9.52 or close issue #141.

This review does not remove the Docs author hold.

No GitHub write, paid call, or repository file mutation occurred.
