# Maintenance execution 2026-09-16

## Scope

The user authorized the work needed to close open Raven issues and pull requests.
The preceding read-only audit remains in `2026-09-16-truth-maintenance.md` and its report directory.
Each closure requires current evidence and the applicable repository gates.

## Lane plan

| Lane | Worker | Pane | Write scope | Completion gate |
| --- | --- | --- | --- | --- |
| PR #156 and issue #40 | Astra coordinator | `w3G:p2` | Primary checkout, authorized GitHub actions | Correct documentation; authenticated production copy check |
| PR #157 | Sol high | `w3G:pZ` | `/tmp/raven-execution-2026-09-16/pr157` | Correct source/parser/golden contracts, tests, independent review |
| Drift #141 | Sol high | `w3G:p0` | `/tmp/raven-execution-2026-09-16/drift` | General scoring acceptance, isolated source checks, independent review, production verification |
| Docs #158–#162 | Grok high | `w3G:p11` | Independent evidence under `/tmp/raven-execution-2026-09-16/` | Original live triggers, source/index convergence, reference reconciliation |

Repository routing instructions selected Sol for the implementation lanes.
Grok reviews the Docs evidence independently from the prior Sol author and the Astra coordinator.
The coordinator owns finding mutations and GitHub closure actions.

## Drift verdict

Implementation is in progress. The rejected audit candidate remains intact.
The current RWA-inclusive measurement passes the focused intent checks.
Its aggregate scores improve, but the unchanged full routing gate still fails.
The changed fingerprint and old upper bands still reject the unchanged routing gate.
Independent review found additional mixed-intent captures and a person-advisory defect.
The author repairs those defects without changing labels or acceptance thresholds.
The coordinator's [ablation report](2026-09-16-maintenance-execution/routing-ablation-report.md) separates source and scoring effects.
None of these experimental results accepts the Scout source.
Grok completed an interim review and identified an RFP miss and short-prefix false matches.
The implementation agent then stopped after three automatic approval rejections.
The visible rejection targeted `test/catalog.test.ts` catalog-count updates before source acceptance evidence existed.
The coordinator told the agent not to repeat the denied edits or change the baseline.
The agent must complete the unchanged acceptance checks and independent review before proposing those updates again.
The coordinator informed the user of the rejection and its stated reason.

The coordinator also reviewed the [Stellar Light pin dependencies](2026-09-16-maintenance-execution/light-pin-impact.md).
Four [public RWA schema probes](2026-09-16-maintenance-execution/rwa-live-schema-probes.json) confirm the request-state enum behavior.
Those probes do not establish routing acceptance.

The independent Grok review accepted the [skill-reference filter](2026-09-16-scout-skill-filter.md).
The filter has a separate local commit, `e1ea4abfa62ee68070bbe905962284fc3118ebfc`.
It does not accept the newer Light pin or the RWA operation.
The final drift candidate must combine the accepted source helper and this filter before final measurements.

The [runtime audit](2026-09-16-maintenance-execution/scout-runtime-golden-impact.md) found no required active golden correction.
It confirmed 30 changed operation objects and nine changed component schemas.
The generic adapter supports the new read operation without a special handler.
An exposed RWA collection needs the `broad` plan classification and staged QA coverage.
The [proposal draft](2026-09-16-maintenance-execution/scout-rwa-proposed-case.json) remains outside the active corpus.
The accepted manifest does not expose its declared surface.

Current combined scoring experiments improve the strict aggregate results.
The unchanged fingerprint and old upper bands still reject the candidate.
The [fresh parent controls](2026-09-16-maintenance-execution/scout-parent-fresh-probes.json) found two additional mixed-intent RWA captures.
Independent review must distinguish those controls from the original unrelated-query acceptance checks.
No source, count, schema, or numeric gate received acceptance from these experiments.
The first independent combined review used the code-only result instead of the source candidate.
The coordinator rejected that comparison and requested the correct variant review.
The coordinator also found dropped Trustless Work override and guard code in the experimental catalog builder.
The author restored those accepted contracts. All nine focused Trustless Work tests now pass.
The corrected independent review uses the RWA-inclusive measurement and confirms 345 ordered-list changes.
The [test diagnosis](2026-09-16-maintenance-execution/scout-test-contract-review.md) separates behavior defects from changed contracts.
The copied interim reports are not acceptance records.

The copied test diagnosis incorrectly says no full suite proves 19 failures.
The pre-person-fix result records 2,126 tests: 2,104 passed, 19 failed, and three pending.
Its SHA-256 is `5671911af615e385a20072d66d2ee418d0627622e8f47224669080d315fdf0e9`.
The result file is `/tmp/raven-execution-2026-09-16/scout-unit-results-final.json`.
This correction does not accept Scout 1.9.52. Later repairs require a newer full run before final acceptance.
The dated diagnosis remains unchanged so the correction stays explicit.

## Eval verdict

No paid evaluation is authorized by this ledger.
The coordinator rejected an unrelated change from 500 to 501 in the frozen paired-collection contract.
The active battery can grow without retargeting a separately reviewed paid plan.
The final local PR #157 gates passed with 2,087 unit tests and 94 smoke tests.
QA lifecycle lint reports zero errors and 62 warnings.
The parent completed the two credentialed probes that the worker could not run.
All seven registered findings still reproduce.
Offline acceptance checks are in scope.

## Golden verdict

PR #164 landed the separate Trustless Work proposal stage at `a83b3c5943b27f585ab4caafe264518e09ab236a`.
Grok high approved the corrected proposal and lifecycle counts.
All four GitHub checks passed at `042084a34958494c8f07d7e82791e1dd432b1e07`.
The proposal stage contains 500 active cases and one proposed case.
Grok subsequently accepted the source, implementation, and golden activation for PR #157.
The golden activation and final metadata review passed.
PR #157 now contains commit `cd87615f8e3f2d9dda2d8b2765acb80c711b7915`.
Its first parent is the landed proposal stage. Its second parent preserves the contributor branch.
The maintainer push used a fast-forward update without force.
The [review comment](https://github.com/stellar-experimental/stellar-raven/pull/157#issuecomment-5704315526) was read back.
CI run `35148821971` was approved for that exact head after workflow review.

The independent source review rejected five irrelevant Trustless Work routing captures.
The review also required submission-path scope by API version.
The proposal now accepts the V1 helper and V2/Core stellar paths.
Sol repaired the source description while preserving immutable upstream bodies.
The first frozen helper review confirmed the original five captures were absent.
It also found casing and plural-word discovery gaps.
The coordinator requested repairs and challenged the classification of broad API/UI queries as unrelated intent.
The final independent review accepted the corrected description and measured query behavior.
PR #157 uses accepted Scout 1.9.1; it does not depend on accepting the Scout experiment.

The coordinator verified the beta authentication conflict against current source, official documentation, and SDK code.
The existing upstream issue received the [new evidence](https://github.com/Trustless-Work/trustlesswork-skill/issues/6#issuecomment-5703275444).
The candidate records this conflict as `sk-025`; no duplicate upstream issue was created.

## Improvements/issues/PR verdict

PR #156 merged as `d4a6cefb3db52702e8f3b605d7693e83974e10fd` at `2026-09-16T18:58:30Z`.
Grok high completed the independent review. All four GitHub checks passed at `e4c34d18` before merge.
The repository permits only squash merges. Merge and rebase methods returned policy errors without changing the PR.
PR #164 preserved the proposal stage before the PR #157 activation.

Grok independently confirmed all five original Docs fixes in source and index.
All five findings now have committed resolver receipts.
Their upstream issues and resolving PRs contain verified resolution comments.
The independently reviewed Freighter golden correction landed with the `sd-045` receipt.
PR #163 merged as `c4b2ff095cf9c3f318a09dab5ae58cf1711b1982` at `2026-09-16T19:16:52Z`.
All four GitHub checks passed. Issues #158–#162 closed through the merge.
The coordinator posted closure evidence and corrected the #162 handoff year to 2024.

The owner closed #40 at `2026-09-16T18:38:30Z`.
The user later provided an authenticated Playground session.
The user approved one short test message.
The production copy check passed: native Chrome paste preserved the exact 22-character Markdown answer and newline.
The coordinator cleared the unsent paste. No second message ran.
The verified result is [recorded on #40](https://github.com/stellar-experimental/stellar-raven/issues/40#issuecomment-5702963203).

PR #157 merged as `58954b6759b8d5a1b7a743e5d2d96893b4c6151f` at `2026-09-16T20:52:13Z`.
Its two CI checks passed on `cd87615f`. All five review threads are resolved with read-back evidence.
PR #165 merged the independently reviewed filter as `bb37bc502080c94c3f3b5223ffcdf584d4b0e29d`.
All four checks passed on `b31718accde52c89dd57f0bf8441fb8e433b31a6`.
The latest GitHub read lists only issue #141 as open.
The [upstream follow-up](2026-09-16-maintenance-execution/upstream-pr-followup.json) still lists four unmerged external PRs.
The later independent review found unresolved author actions in Docs PRs #2837 and #2844.
The user has Docs push permission, but neither PR meets its review gate.
PR #2837 also retains an explicit author hold.
Both local repair patches passed formatting, full production builds, and route checks.
The builds required a local Yarn identity-check environment correction.
No dependency manifest or lockfile changed.
Independent review accepted PR #2844 and found two wording defects in PR #2837.
The coordinator repaired the PR #2837 wording. Independent review now accepts both patches.
The user then authorized both external publications.
The normal pushes produced `108ba24e` on PR #2837 and `581b884e` on PR #2844.
Both remote heads were read back. The author hold remains unchanged.
All nine checks passed on each published commit, including the full build and preview.
Both PRs still require maintainer approval. PR #2837 also retains its author hold.
The [#2837 handoff](https://github.com/stellar/stellar-docs/pull/2837#issuecomment-5705124276) records the remaining author decisions.
The [#2844 handoff](https://github.com/stellar/stellar-docs/pull/2844#issuecomment-5705124464) records the applied wording suggestions.
Both comments were read back from GitHub.
The [patch identities](2026-09-16-maintenance-execution/docs-repair-patch-identities.json) identify their exact reviewed content.
See the [readiness review](2026-09-16-maintenance-execution/upstream-docs-pr-readiness.md).
The coordinator captured [production search controls](2026-09-16-maintenance-execution/production-search-before.json) before deployment.
Those calls used only catalog search and made no provider request.

The free `sls-080` monitor passed through authenticated production Raven MCP.
No existing local server was available. The transport difference is explicit in the evidence.
The returned `MaxSupportedProtocolVersion` value was `28`.
The source at returned ref `84553bb4dc6d0c0300d052f76cb745178ede0be1` also contains `28`.
The [monitor record](2026-09-16-maintenance-execution/sls-080-monitor.json) preserves the response timestamp and source path.
One free provider request ran. No answering model or judge model ran.

## Accepted release

The clean deployment checkout passed preflight with `HEAD == origin/main` at `bb37bc50`.
The deployment used the existing `sdf` profile and retained all usage bindings.
Worker version `06222885-f873-4164-8e99-9fc5f2b9a5f2` receives 100% traffic.
The [deployment record](2026-09-16-maintenance-execution/deployment-bb37bc50.json) records its ID and HTTP checks.

Authenticated production reads verified all 28 new sections across 22 pinned files.
All section fingerprints match local verified content. The main body hash also matches its pinned source.
All 282 catalog IDs, services, kinds, and descriptions match the committed catalog.
The new escrow query ranks the new skill first. Five unrelated controls remain byte-identical.
See the [content comparison](2026-09-16-maintenance-execution/production-content-comparison.json).
The [production comment](https://github.com/stellar-experimental/stellar-raven/pull/157#issuecomment-5704435949) was read back.
The [hourly canary](2026-09-16-maintenance-execution/production-canary-after.json) passed at `2026-09-16T21:07:47.104Z`.
It checked all 64 current pinned files. The existing production comment now records this result.
Scout remains 1.9.1. RWA remains unexposed.

## Own-repo todos

Reconcile each completed item with `.agents/TODO.md` and the current handoff.

## Decisions

Preserve the audit evidence and all unrelated work.
Do not treat closed upstream issues as proof of a corrected live trigger.

## Cleanup evidence

The coordinator removed the clean Docs execution worktree after PR #163 merged.
Its commit `84ab1e461e45a06c75c1e7aee02df2ec0404999e` has the same tree as merge commit `c4b2ff095cf9c3f318a09dab5ae58cf1711b1982`.
The branch remains available at its exact tip.
The coordinator also removed the clean proposal and filter worktrees after exact-tree comparisons.
The proposal tip `042084a3` equals the `a83b3c59` merge tree.
The filter tip `b31718ac` equals the `bb37bc50` merge tree.
Both branches retain their exact tips.
The coordinator preserved the rejected drift candidate and all initial branches.

## Final checklist

- Completed: PRs #156, #157, and #163–#165 merged after the required checks and independent reviews.
- Completed: issue #40 passed its authenticated copy check; issues #158–#162 have verified closure evidence.
- Completed: production catalog, pinned content, health, and canary checks passed on `bb37bc50`.
- Completed: both reviewed external Docs patches published and passed all nine checks.
- Completed: `.agents/TODO.md` now records the current Docs handoff and this maintenance ledger.
- Completed: PR #168 accepted Scout 1.9.52 and passed production verification. Issue #141 closed.
- Open: issue #167 tracks the three RWA routing failures. RWA remains excluded.
- Open: both Docs PRs need maintainer approval. PR #2837 also retains its author hold.
- Record review: Sol high reviewed all 60 files in PR #166 and requested two ledger corrections.
- Record review: Sol high confirmed both corrections at `5b75eaec`; the repair delta has no new finding.
- Record review: the [acceptance record](2026-09-16-maintenance-execution/maintenance-record-repair-review.md) preserves that completed review.
- Retained: owned panes `w3G:pZ`, `w3G:p0`, and `w3G:p11` support the remaining work.

The completed worktree removals are recorded above. These temporary worktrees remain available for the active review:

- `/tmp/raven-execution-2026-09-16/deploy` — clean release checkout; retain its scoped profile binding for the next release.
- `/tmp/raven-execution-2026-09-16/docs-title-drift` — reviewed generated Docs candidate.
- `/tmp/raven-execution-2026-09-16/drift` — preserved rejected experiment.
- `/tmp/raven-execution-2026-09-16/drift-combined` — preserved intermediate experiment.
- `/tmp/raven-execution-2026-09-16/drift-combined-main` — preserved source-only control.
- `/tmp/raven-execution-2026-09-16/drift-combined-accepted` — active implementation.
- `/tmp/raven-execution-2026-09-16/pr157` — preserved contributor-based experiment.
- `/tmp/raven-execution-2026-09-16/pr157-integrated` — accepted routing control.
- `/tmp/raven-execution-2026-09-16/routing-ablation` — preserved attribution experiment.
- `/tmp/raven-execution-2026-09-16/scout-runtime-audit` — clean schema-audit checkout.
- `/private/tmp/stellar-raven-drift-0916.mOmBFJ/repo` — original rejected audit candidate.

Reconcile these paths after the active drift review. Preserve each unique dirty experiment before any removal.

## Scout release completion

The [Scout release record](2026-09-16-scout-release.md) supersedes the earlier temporary-worktree state.
Production serves `022970d5`. All 17 search checks and the full catalog projection match the reviewed files.
All four pinned Scout files match verified local reads.
The coordinator removed three clean detached controls after ancestry checks.
Unique dirty experiments and all original branches remain preserved.
