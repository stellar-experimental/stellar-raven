# Maintenance execution — 2026-09-08

## Scope

The owner approved the recommendations with "do it all" and required Herdr and routing-agent-work.
The owner selected Astra low/medium and Sol medium/high as the current working routes.
This selection overrides the older fleet table where it does not list Astra.

Authorized work includes local repairs, verification, substantive issue comments, scoped issue closure,
and filing the thirteen verified findings after fresh checks and deduplication.
This authority does not replace the signed paid-QA contract or authorize production crawler/index writes.
No paid evaluation or model API probe will run.
No deployment or new Scout exposure will occur without its existing acceptance gates.

Base: `b2dbde53e9c9910b6d49a87ccea829555eeb4ef1`.
Maintenance branch: `chore/maintenance-2026-09-08`.
Existing search work remains on `fix/search-name-and-noun-ranking` in its existing worktree.

## Lane plan

| Lane | CLI/model/effort | Write set | Completion check |
| --- | --- | --- | --- |
| Search repair | Codex / gpt-5.6-sol / high | Existing search worktree only | Isolated advisory evidence, explained ranking losses, general repair, unchanged gates |
| Docs verification | Codex / gpt-6-astra / medium | Own report only | Read-only crawler inspection and three content/search comparisons |
| Filing preparation | Codex / gpt-5.6-sol / medium | Thirteen verified finding files and own report | Fresh triggers, deduplication, correct owner and dry-run bodies |
| Coordination and remaining issues | Current agent | Queue, ledger, issue actions, provider report | Reconciled evidence and explicit final state |

The Codex CLI confirms `-m` and `-c model_reasoning_effort` controls.
The host config names `gpt-6-astra`; the repository roster confirms `gpt-5.6-sol`.
Each launched worker must confirm its requested route before task actions.
Search and consequential finding changes require a fresh eligible independent reviewer.
Grok 4.6 high is the independent review route; it differs from the author and orchestrator.
No worker may spawn another lane without a coordinator-approved contract.
Workers report paths, tests, risks, and blockers rather than transcripts.

Owned worker panes: search-repair `w3G:p4`, docs-check `w3G:p5`, finding-prep `w3G:p6`.
Herdr start responses confirmed each explicit model and effort argument.
The original review pane no longer exists; it was not reused or adopted.
Docs-check completed and exited. Its owned pane `w3G:p5` now hosts maintenance-review, Grok 4.6 high.
The start response confirmed the model, effort, and `--no-subagents` arguments.
Its first review covers the queue, existing-finding updates, and Docs evidence, excluding active author work.

## Drift verdict

The accepted Scout surface remains 1.9.1. The live 1.9.48 source remains outside the accepted runtime catalog.
This round changes no exposure or source acceptance. Source acceptance remains separate from scoring repair.

## Eval verdict

Use free checks only. Keep protocol-history source expiry and frozen holdout labels intact.
Reject unexplained exact-operation losses despite a passing service-level gate.

## Golden verdict

The triage pass found zero stale errors and 62 existing lint warnings.
No golden edit is authorized merely to hide a routing loss.
The filing preparation found that sd-049 used Laboratory's obsolete `master` branch.
Current default-branch source and the public UI require independent reconciliation before retirement.
The golden-truth verification cluster covers only Saved Keypairs storage in two tooling-infra cases.
The root checked default branch `main`, commit `bbbe48c79b8a90bbc548115a0573c912b1e9fa9e`, and its writer/cipher.
The writer uses reversible XOR/base64 obfuscation for new writes and accepts legacy JSON on reads.
The public `/account/saved` UI warns that storage is unencrypted and unprotected; it permits only test networks.
The live Docs page says obfuscated, not encrypted, and notes the pre-September-2025 plaintext caveat.
These reads created no keys and made no signing, submission, storage, or funding request.
The isolated browser closed after the check. A distinct Grok lane independently re-derived these claims.
The completed review passed the two case edits and both affected consistency clusters at `2026-09-09T03:24:18Z`.
The final keyFact wording review passed at `03:26:25Z`.
Changed case IDs: `q-ti-stellar-lab-usage-and-new-ui` and `q-ti-secret-key-vs-mnemonic-derivation`.
Both cases preserve the no-custody and test-network limits. Other claims retain their prior verification dates.
The root and reviewer checked all seven members of cluster-023 and both members of cluster-137.
The existing Testnet shorthand does not claim Testnet-only funding. Both clusters are consistent after this storage-only edit.
The compiler still emits exactly 500 active cases and 500 reserved IDs. Parsed output changes only those two cases.
Content SHA-256: `4f8d38a66b980b5855643a0e2fb49c671a145a4c197f1c3b9a36e6116b053aca`.
The register reports zero reopened clusters. Diff-aware stale lint reports zero errors and the same 62 baseline warnings.
The free plan grader replayed a copy of `eval/qa/results/2026-08-30T03-43-11-variantA.json`.
Its 100 rows and summary exactly match the stored plan result: 93 required-covered and mean on-plan ratio 0.95.
Only file paths and grading time differ. The original artifacts remain unchanged.
No paid rejudge ran. This replay provides no new answer-quality or production headline.
The initial preparation report called sd-049 an exact sd-030 duplicate. That classification was wrong.
The sd-030 warning-prominence defect is distinct. The sd-049 premise instead used an obsolete source branch.
The transient fixed-upstream status enables the resolver; it does not claim a new upstream fix.

## Improvements/issues/PR verdict

Initial queue: 71 active findings; 55 reported, 13 verified, three declined, zero fixed-upstream.
Nine configured probes reproduced their findings during triage.
Raven issues open at start: #40, #109, #123, #124, #130, #132. No Raven PR was open.
Docs PR #2723 merged; rendered Relayer pages pass, but production search retains old wording.
Docs #130/#132 have the same source/index distinction.
Cloudflare PR #639 is open, requires review, and reports no checks. npm latest remains 4.0.0.

At `2026-09-09T02:43:47Z`, #123 closed as `NOT_PLANNED` after a scope response.
Read-back: https://github.com/stellar-experimental/stellar-raven/issues/123#issuecomment-5594974480.

At `2026-09-09T02:55:48Z`, #40 received the approved product decisions and the remaining acceptance boundary.
Read-back: https://github.com/stellar-experimental/stellar-raven/issues/40#issuecomment-5595065793 (author `kalepail`).
Keep the 8000-character limit and decline persistent history. The copy action was previously shipped.
All 51 local playground tests passed across five files. Authenticated production copying remains unverified.
The isolated browser reached the sign-in page; no login or paid chat request ran. The issue stays open.

At `2026-09-09T02:44:10.820Z`, the installed provider reproduced `Unknown gateway provider "moonshotai"`.
The mocked binding recorded zero calls. All 16 demo model-config tests passed.
PR #639 changes the private, source-bundled gateway-core registry and carries a provider patch changeset.
The private gateway-core package requires no separate public package release.

Docs verification completed at `2026-09-09T02:48Z`; its report is `2026-09-08-docs-index-execution-astra.md`.
All three source corrections pass. All three original production search triggers still reproduce.
The latest completed crawl ended at `2026-09-08T12:03:10.118Z`, before both deployments.
The configured midnight schedule conflicts with the observed noon start; the cause remains unknown.
No completed post-deployment crawl or blocking error proves extraction failure.
The next read-only checkpoint is `2026-09-09T12:05Z`, not a guaranteed schedule time.
Findings sd-039, sd-042, and sd-047 remain reported upstream. Handoffs #130 and #132 remain open.

Root rechecks at `2026-09-09T03:10:05.793Z` and `03:10:19.484Z` still returned all three old statements.
The first alias substring check missed Markdown emphasis; direct returned snippets confirmed the unchanged alias.
The root then posted partial verification replies after reconciling H1/H2/M1/M2 from the completed independent review.
Each reply passed a byte-exact GitHub read-back and identified `kalepail` as its author:

- sd-042, Raven #130: https://github.com/stellar-experimental/stellar-raven/issues/130#issuecomment-5595182633
- sd-047, Raven #132: https://github.com/stellar-experimental/stellar-raven/issues/132#issuecomment-5595182816
- sd-039, Docs #2707: https://github.com/stellar/stellar-docs/issues/2707#issuecomment-5595183018

The Docs reply does not request reopening the corrected page occurrence. No duplicate replies went to #2770 or #2805.

The initial triage checked 64 unique recorded GitHub refs across the 71 active findings.
Nine configured recurrence probes reproduced their findings. This does not mean all 71 live triggers were rerun.

| Finding | Trigger | Upstream state | Checks/reviews | Fresh result | Action |
| --- | --- | --- | --- | --- | --- |
| sd-039 | Tools product alias | Docs #2707 closed; PR #2723 merged | Approved; successful deployment | Live pages corrected; two search records stale | Record partial verification; retain finding |
| sd-042 | Horizon lifecycle wording | Docs #2770 closed; PR #2806 merged | Approved; successful deployment | Live pages corrected; search phrase stale | Respond to Raven #130; retain finding |
| sd-047 | Conflicting ledger cadence | Docs #2805 closed; PR #2806 merged | Approved; successful deployment | Live pages agree; Validators search stale | Respond to Raven #132; retain finding |
| sd-027, sd-034 | Smart-wallet reference/tutorial drift | Docs PR #2367 open | Checks pass; review required; bot:needs-decision | Maintainer decision remains active | Wait for head, label, or state change; no reminder |
| wai-001 | Configured provider rejects moonshotai | Cloudflare #634 and PR #639 open | Review required; no checks reported | Published 4.0.0 fails before mocked binding call | Record candidate PR; retain workaround |
| ll-004 | Authenticated tool listing hides partner names | Existing report remains active | No verified resolving change | Authenticated list exposes 21 names; anonymous list exposes 18 | Correct stale prose; retain intermittent finding |
| sd-037 | Source-standard finding | Stellar protocol #1981 open | Last activity is stale-bot notice | State check confirms no maintainer action | Recheck after 2026-09-13; no keep-alive |
| Thirteen verified findings | Individual original triggers | Filing preparation in progress | Independent review and exact dry runs remain required | Pending author report | File supported, nonduplicate findings only |

The filing author report is `2026-09-08-filing-preparation-sol.md`.
It supports twelve new issues and recommends no filing for sd-049.
The coordinator independently read all twelve rendered bodies. Their source snapshots remain absent until the evidence commit is public.
Pre-filing prose checks found an overbroad ll-030 absence claim, missing sk-022 cross-link, and sk-024 source attribution ambiguity.
The author corrected those claims before independent filing review.
Grok independently passed nine candidates and found three blockers in `2026-09-08-filing-independent-review-grok.md`.
The root confirmed that existing Docs issue #2561 already requests the sd-050 correction.
Its author is `oceans404`; its state is open. The finding now records that issue as reported upstream.
No duplicate issue or reminder comment was posted.
The other two blockers were stale byte-equality claims in sk-023 and sk-024.
The root independently matched the current pinned file hashes and corrected the old statements to dated evidence.
The completed final Grok delta passed all twelve dispositions: eleven new filings and one existing issue link.
New filings still require public evidence snapshots and committed-byte dry runs.

The sls-080 monitor used production Raven because no existing local server was available.
At `2026-09-09T02:53:32.955Z`, explainRepo returned `MaxSupportedProtocolVersion = 28`, with `answerSource: knowledge-note`.
Its `scannedRef` was `82660510ecda7fd365a14d08badb9d85fa22bc32`; `answerAsOf` was `2026-09-01T00:00:00Z`.
A fresh GitHub raw read of `internal/ingest/main.go` at that exact ref independently returned `uint32 = 28`.
The source-parity monitor passes. This is not a Docs-first recovery recurrence or paid-collection authority.

## Own-repo todos

The triage statement that NEXT.md was missing was incorrect.
The file exists at `.agents/NEXT.md`; TODO.md uses a sibling-relative reference.
Correct stale handoff statements without creating a duplicate file or inventing settled owner decisions.
Reconcile ll-004 prose against its latest recurrence and a fresh safe listing check.
Keep protocol-history, recovery, paid-QA, and exposure programs within their existing authority.

## Decisions

Keep bounded playground input. Decline persistent history for the demonstration as recommended and approved.
Close #123 as non-actionable. Do not execute its proposed handshake.
Do not send reminder comments to untouched upstream issues.
File only findings whose fresh evidence still supports their recommendation.

## Final checklist

Local maintenance checks passed: typecheck, 1,974 tests across 108 files, and the Wrangler build dry run.
No source or runtime code changed in this maintenance snapshot.
Live improvements lint passed with 71 findings. All nine probes reproduced their findings with zero errors or inconclusive results.
The full tracked-tree secret scan passed, including Gitleaks. No paid evaluation, provider call, or deployment ran.

- [ ] All worker and reviewer results reconciled.
- [ ] Required tests, lint, probes, and secret scan pass.
- [ ] Every external write has a read-back URL.
- [ ] Completed items leave the active queue; unresolved items have concrete triggers.
- [ ] Branch, commit, PR, deployment, and issue states are reported separately.
