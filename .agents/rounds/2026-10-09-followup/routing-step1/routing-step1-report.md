> Archive note (2026-10-09): this folder retains the report, the helper, the patch, the summary, the four acceptance files, the diff files, and the independent review. The full routing results, manifests, traces, and replay trees are in the ignored local archive `eval/results/2026-10-09-routing-step1-evidence.tar.gz`. Paths in `tmp/` refer to the lane worktree.

# Routing step 1 report — 2026-10-09

## Result

**Reject step 1. Do not commit the candidate patch.**
Step 1 fails checks 4, 5, 7, 8, 10, and 12 on both sources.
Check 6 fails only on fresh sources through the wallet control.
The brief permits step 2 only after checks 7, 9, and 10 pass on current sources.
Checks 7 and 10 fail, so I did not attempt step 2 or step 3.

I retained the accepted baseline as the best measured state.
The tracked worktree is clean at `c4714fda035c1aaf1694920f5a6dabc15f77712c`.
The rejected implementation remains available in [step1.patch](step1.patch).
I restored the accepted inventory, exposure policy, catalog, and scorer.
I made no commit, push, GitHub write, deployment, or paid model call.
I did not edit `.agents/**`.

Step 1 adds one field-admission rule to the ungated replica.
Each field needs a whole content token before that field contributes a score.
The rule uses the existing stopword set and plural conversion.
After admission, the field keeps the existing phrase, prefix, substring, and coverage-bonus calculations.
The gated acronym comparison uses the existing unanchored calculation.
The vendor scorer, coverage gate, selector, keyword projection, tokenizer, and numerical thresholds remain unchanged.
The change adds no operation exception, question exception, query exception, or token-length threshold.

All 43,520 gated score comparisons match the baseline: 544 queries × 80 searchable entries.
The legacy top-five gated count changes from 1192 to 1194 through page selection.
Rows without a gated result remain 35.
Thus, the candidate does not repeat the previous gated-tier collapse.
Its ungated score changes still cause unacceptable result selection.

The four short-token triggers return null through both ungated entry points.
The gated scorer still returns 27, 45, 27, and 55 for those triggers.
The intended `city forecast` and `refund invoice` queries retain scores 153 and 481.
Plural queries and the low-coverage positive control also pass.
This partial fix does not resolve `cs-001`.

### Measurements

Each routing run includes 544 rows: 338 legacy, 122 extended, 23 skills, 49 holdout, and 12 protocol-history rows.
The accepted source contains Scout 1.9.61, 666 Docs titles, and 30 exposed Scout operations.
The fresh source contains Scout 1.9.72, 674 Docs titles, and 32 exposed Scout operations.
The fresh build excludes `reviewSubmission`, RWA, and quality.
The refresh leaves Lumenloop and Docs settings unchanged.
No skill pin or dApp description override changes.

`L` and `E` show top1/top3/top5/cardHit5.
`H` shows top1/top3/top5/forbiddenCaptures.

| Run | L | E | Skills top1 | H | Routing exit |
|---|---|---|---:|---|---:|
| baseline-main | 219/298/326/112 | 93/111/117/16 | 17 | 12/26/29/10 | 0 |
| baseline-fresh | 220/295/325/111 | 93/112/117/16 | 17 | 12/26/29/10 | 1 |
| step1-main | 220/297/324/111 | 84/111/116/17 | 17 | 12/27/30/12 | 1 |
| step1-fresh | 221/295/323/110 | 85/112/116/17 | 17 | 12/27/30/12 | 1 |

| Comparison | Graded rows changed | Top-five orders changed | Target ranks changed |
|---|---:|---:|---:|
| baseline-source | 7 | 80 | 0 |
| step1-main | 32 | 233 | 0 |
| step1-fresh | 30 | 230 | 0 |
| step1-source | 7 | 81 | 0 |
| step1-fresh-v-main | 37 | 288 | 0 |

The same-source comparisons isolate the step 1 change.
The fresh-versus-main comparisons also include source changes.
Graded changes cover 532 rows because the 12 protocol-history rows store target ranks instead of grade flags.
All comparisons include all 544 rows for result order.

### Twelve acceptance checks

One helper generates all twelve verdicts from saved routing results and focused probes.
The helper verifies manifest hashes, lane membership, row counts, and all 544 recorded result lists.
It exits 1 whenever any acceptance check fails.
Check 12 uses each step's paired fresh run, including the current-source report.
Check 8 shows separate verdicts for four positives, eight ordinary negatives, and three deferred controls.
All three groups must pass; check 8 therefore remains failed on every label.
Check 10 ignores only the manifest fingerprint failure on fresh labels.
Its saved raw gate result still records that failure.

| Check | Baseline main | Baseline fresh | Step 1 main | Step 1 fresh |
|---|---|---|---|---|
| 1. Retain YieldBlox and Reflector intent | PASS | PASS | PASS | PASS |
| 2. Reject generic research wording | PASS | PASS | PASS | PASS |
| 3. Require repository intent | PASS | PASS | PASS | PASS |
| 4. Preserve account-merge Docs | PASS | PASS | **FAIL** | **FAIL** |
| 5. Reject schema substring evidence | **FAIL** | **FAIL** | **FAIL** | **FAIL** |
| 6. Retain strong Docs after five weak gated rows | PASS | **FAIL** | PASS | **FAIL** |
| 7. Preserve eight grades and fixture presence | PASS | PASS | **FAIL** | **FAIL** |
| 8. RWA: positives / ordinary negatives / deferred controls | PASS / PASS / **FAIL** | PASS / PASS / **FAIL** | PASS / PASS / **FAIL** | PASS / PASS / **FAIL** |
| 9. Preserve leaderboard and RFP improvements | PASS | PASS | PASS | PASS |
| 10. Pass applicable routing gates and extended comparison | PASS | PASS | **FAIL** | **FAIL** |
| 11. Expose controlled directory vocabulary | PASS | PASS | PASS | PASS |
| 12. Accept fresh sources without grade changes | **FAIL** | **FAIL** | **FAIL** | **FAIL** |

Check 1 combines a controlled phrase-cap probe with the incident routing result.
The real source already lacks literal `yieldblox` and `reflector` routing phrases.
The check does not certify the expired protocol-history v2 source contract.
Both v2 diagnostics report `source-expired`; they score no question.

### Causes of failed checks

**Check 4:** The account-merge Docs result loses ungated field contributions without a whole content anchor.
Its baseline `id` and `name` contributions depend on `i` prefix-matching `in`.
Step 1 removes that stopword partial match.
Its score falls from 226 to 134, and it leaves the top five.
`hackathonBrief` falls from 218 to 170, but it also remains outside the selected page.
The failure concerns required Docs presence; it does not show a newly selected briefing operation.
Both paired queries, with and without `use`, lose the required Docs operation.

**Check 5:** The unchanged keyword projection appends the entire schema keyword array.
The gated `has widgets` probe still rises from 141 to 143 when `phase` enters that array.
The ungated probe still admits the description through `widgets`.
The added `phase` then matches `has` through the unchanged substring rule.
Its ungated score rises from 33 to 43.
Generic schema-only evidence still scores 46 through the gated scorer.
Step 1 cannot isolate schema evidence after another token admits the field.

**Check 6:** Both corrected synthetic controls pass on all four labels.
Prefix-only Scout descriptions score 36; substring-only descriptions score 21.
The Docs candidate scores 220 and ranks first in both controls.
The whole-word variant remains a separate diagnostic and does not affect the verdict.
Its Scout entries match three whole query words, while the Docs candidate matches two.
The selector correctly retains those Scout entries under its intent-coverage rule.
The original helper misclassified that diagnostic as a weak-gated control.
The real staking control passes on both sources.
The wallet control passes on current sources and fails on fresh sources.
The fresh `approach` keyword still supplies the gated `app` prefix match.
That creates a fifth gated result and triggers the existing service-quota restriction.
The wallet Docs candidate scores 561 after step 1, but the full page excludes it.

**Check 7:** All eight corpus rows preserve their baseline grade flags.
YieldBlox gains top1.
The account-merge fixture loses `stellarDocs.search_docs_in_category` through the check 4 mechanism.
The helper requires both corpus grades and fixture presence, so check 7 fails.
The reentrancy and parallel-execution fixture differences remain explicit in the helper.

**Check 8:** All four RWA discovery positives pass.
All eight ordinary implementation negatives pass, including the custom-token walkthrough.
The three mixed implementation controls still capture RWA at ranks 3, 2, and 1.
Their shared topic evidence survives the unchanged routing admission and exclusion rules.
The ungated field rule does not distinguish discovery from implementation within that evidence.
The helper records the three deferred `it.fails` controls separately from the eight ordinary negatives.
The three `it.fails` markers remain unchanged.
The helper constructs the RWA fixture from each label's saved inventory and records its SHA-256.

**Check 10:** The current-source legacy and skills numeric gates pass.
The holdout capture count rises from 10 to 12 and breaches its ceiling.
`q-holdout-a-10-oz-emergency-stop` newly captures `skills.openzeppelin-stellar.setup-stellar-contracts` at rank 3.
`q-holdout-a-14-poseidon-merkle` newly captures `skills.stellar-dev.smart-contracts` at rank 4.
Their Docs competitors lose more ungated field scores than these skills.
For emergency-stop, category Docs fall from 833 to 349.
For Poseidon, SDK Docs fall from 551 to 339, while the captured skill stays at 434.
The unchanged selector then admits the skills.

Extended top1 falls from 93 to 84 on current sources and to 85 on fresh sources.
Extended top5 falls from 117 to 116 on both sources.
CardHit5 rises from 16 to 17, but this gain does not satisfy the no-regression requirement.
Some general retrieval operations lose every field anchor.
For example, the Blend TVL query loses `lumenloop.search_content_semantic`, which falls from 223 to null.
The fresh baseline now passes check 10 after the helper removes only the manifest fingerprint failure.
The recorded routing command still exits 1 because it enforces that fingerprint.
The step 1 fresh run also breaches the holdout ceiling and loses extended coverage.

**Check 12:** All four required fresh-source regressions remain below accepted-main grades.
The source changes still add competing routing evidence to Scout operations.
Step 1 does not change that evidence or its admission rules.
The following table shows the required target ranks.

| Row | Required target | Baseline main | Baseline fresh | Step 1 fresh |
|---|---|---:|---:|---:|
| `q-defi-agentic-payment-standards-compare` | `stellarDocs.search_docs` | 3 | 4 | 5 |
| `q-defi-blend-alternatives` | `lumenloop.search_content_semantic` | 5 | absent | absent |
| `q-defi-rwa-overview` | `lumenloop.search_content_semantic` | 3 | 4 | 4 |
| `q-scf-funded-similar-payroll` | `lumenloop.find_similar_scf_submissions` | 3 | 5 | 5 |

`reviewSubmission` remains absent from the manifest and every result list.
This exclusion does not prove safe ranking if someone exposes it later.
`analyzeHackathonSubmissions` newly reaches rank 3 on `q-pc-sequence-numbers-ordering-replace` after step 1 on fresh sources.
That ungraded capture supports the continued source hold.
Seven graded rows differ between step 1's current and fresh sources.
The fresh source therefore needs more than a manifest-fingerprint update.
Check 12 deliberately requires zero changed per-row grades between the paired sources.
This requirement is stricter than the numeric bands and floors used for a fingerprint-only re-baseline.

### Changed graded rows for step 1

Each column compares step 1 with the unchanged scorer on the same source.
`+` means false to true; `−` means true to false.
A `+forbiddenCapture` is a regression.
The linked difference files also retain every changed order.

| Row | Current source | Fresh source |
|---|---|---|
| `q-comp-yieldblox-oracle-incident` | +top1 | +top1 |
| `q-defi-agentic-payment-standards-compare` | −top3 | unchanged |
| `q-defi-aquarius-av` | +top1 | +top1 |
| `q-defi-aquarius-tvl-freshness` | +top1 | +top1 |
| `q-eco-freighter-wallet` | −top3, −top5, −any1 | −top3, −top5, −any1 |
| `q-edge-deep-multi-hour-soroban-survey` | +top3, +any3 | +top3, +any3 |
| `q-edge-deep-no-budget-limit` | −any1 | −any1 |
| `q-edge-fresh-latest-blend-tvl` | −top1, −top3, −top5, −any1, −any3, −any5 | −top1, −top3, −top5, −any1, −any3, −any5 |
| `q-edge-inject-fabricate-citation-instruction` | −cardHit5 | −cardHit5 |
| `q-protocol-quorum-slice-vs-quorum` | −top1, −top3, −any1, −any3 | −top1, −top3, −any1, −any3 |
| `q-soroban-instance-storage-dos` | +top3, −cardHit5 | +top3, −cardHit5 |
| `q-soroban-oracle-defensive-consumption` | +top3, +cardHit5 | +top3, +cardHit5 |
| `q-token-circle-usdc-on-stellar` | −any5 | −any5 |
| `q-aas-claimable-predicates-expiry-reserves` | −top1, −any1 | −top1, −any1 |
| `q-crp-export-tx-history-taxes` | −top1, −any1 | −top1, −any1 |
| `q-crp-regional-offramp-mobilemoney` | −any5 | −any5 |
| `q-defi-sdex-offer-lifecycle` | −top1 | −top1 |
| `q-edge-exchange-memo-lost-funds` | −top5 | −top5 |
| `q-pc-bucketlist-vs-merkle-inclusion-proof` | −top1 | −top1 |
| `q-pc-l2-payment-channels-starlight` | −top1 | unchanged |
| `q-sor-reflector-integration-code` | +top5, +cardHit5 | +top5, +cardHit5 |
| `q-sor-require-auth-propagation` | −top1, −any1 | −top1, −any1 |
| `q-ti-classic-submission-errors` | −top1, −any1 | −top1, −any1 |
| `q-ti-freighter-localhost-not-detected` | −top1, −top3, −top5, −any1, −any3 | −top1, −top3, −top5, −any1, −any3 |
| `q-ti-friendbot-ratelimit-alternatives` | +top1, +top3, +any1, +any3 | +top1, +top3, +any1, +any3 |
| `q-ti-multisig-recover-lobstr-vault` | −top1 | −top1 |
| `q-ti-secret-key-custody-backend` | −top1, −any1 | −top1, −any1 |
| `q-holdout-a-10-oz-emergency-stop` | +forbiddenCapture | +forbiddenCapture |
| `q-holdout-a-14-poseidon-merkle` | +forbiddenCapture | +forbiddenCapture |
| `q-holdout-b-04-regulated-asset` | +top3, +top5, +cardHit5 | +top3, +top5, +cardHit5 |
| `q-holdout-b-06-sac-or-sep41` | +top5, +cardHit5 | +top5, +cardHit5 |
| `q-holdout-c-10-scf-positioning` | −top5, −cardHit5, −pass | −top5, −cardHit5, −pass |

## Files changed

No tracked file remains changed.
The rejected patch changes only `src/catalog/scoring.ts`.
It contains 32 insertions and 24 deletions, including comments and the gated acronym comparison guard.
The final catalog matches the committed catalog byte-for-byte.

Local deliverables:

- `tmp/acceptance.mjs`: the complete twelve-check helper.
- `tmp/routing3/step1.patch` and `step1-scoring.ts`: the rejected implementation.
- `tmp/routing3/*-manifest.json`: the four measured catalogs.
- `tmp/routing3/baseline-{main,fresh}.json` and `step1-{main,fresh}.json`: complete routing results.
- `tmp/routing3/*-acceptance.json`: focused evidence and all twelve verdicts.
- `tmp/routing3/*-diff.txt`: the supplied comparison tool's output.
- `tmp/routing3/*-trace.json` and `*-changed-traces.json`: score causes and changed-row evidence.
- `tmp/routing3/measurement-summary.json`: lane totals, verdicts, and all changed grades.
- `tmp/routing3/snapshot.mjs`: source restoration and temporary fresh-source exclusion.
- `tmp/routing3/gated-scores.mjs`, `trace.mjs`, `trace-changes.mjs`, and `short-token-probes.mjs`: diagnostic scripts.
- `tmp/routing3-evidence.tar.gz`: the report, helper, and new evidence, without the prior evidence archives.

## Checks run

All gate commands ran without pipes or output redirection.
Only the diagnostic comparison commands redirect their output.
The original helper rows below describe the initial run before review corrections.
The Fix round section records the corrected helper runs.

| Command | State | Exit | Result |
|---|---|---:|---|
| `npm ci` | Initial | 0 | Installed 279 packages; the sandbox blocked the Git hook configuration. |
| `npm run typegen` | Placeholder `.dev.vars` | 0 | Generated `env.d.ts`; the sandbox blocked the external Wrangler log. |
| `npm run eval:compile` | Baseline | 0 | Compiled unchanged cases. |
| `npm run eval:selftest` | Baseline | 0 | All checks passed. |
| `npm run eval:routing -- --gate` | Baseline main | 0 | All three routing gates passed. |
| `node --env-file=/Users/kalepail/Desktop/stellar-raven-codemode/.env scripts/refresh-inventory.mjs` | Fresh source | 0 | Read existing credentials without copying or printing them. |
| `node scripts/build-catalog.mjs` | Four source builds | 0 each | Generated each source catalog and restored the accepted catalog. |
| `npm run eval:routing -- --gate` | Baseline fresh | 1 | Manifest fingerprint mismatch. |
| `node tmp/acceptance.mjs baseline-main` (initial helper) | Baseline main | 1 | Checks 5, 6, 8, and 12 failed. |
| `node tmp/acceptance.mjs baseline-fresh` (initial helper) | Baseline fresh | 1 | Checks 5, 6, 8, 10, and 12 failed. |
| `npm run eval:routing -- --gate` | Step 1 main | 1 | Holdout captures exceeded the ceiling. |
| `npm run eval:routing -- --gate` | Step 1 fresh | 1 | Fingerprint mismatch and holdout capture failure. |
| `node tmp/acceptance.mjs step1-main` (initial helper) | Step 1 main | 1 | Checks 4, 5, 6, 7, 8, 10, and 12 failed. |
| `node tmp/acceptance.mjs step1-fresh` (initial helper) | Step 1 fresh | 1 | The same seven checks failed. |
| `node tmp/routing3/gated-scores.mjs baseline-main` | Baseline | 0 | Saved 43,520 gated scores. |
| `node tmp/routing3/gated-scores.mjs step1-main` | Step 1 | 0 | Saved 43,520 gated scores. |
| `cmp tmp/routing3/baseline-main-gated.json tmp/routing3/step1-main-gated.json` | Current sources | 0 | Every gated score matched. |
| `node /private/tmp/claude-501/rdiff.mjs <before> <after>` | Five comparison pairs | 0 each | Compared all 544 rows per pair. |
| `node tmp/routing3/short-token-probes.mjs baseline` | Restored baseline | 1 | Reproduced all four known false matches. |
| `node tmp/routing3/short-token-probes.mjs step1` | Step 1 | 0 | All 17 positive and negative controls passed. |
| `node tmp/routing3/trace.mjs step1-main` and `step1-fresh` | Step 1 | 0 each | Recorded merge, TVL, and wallet score changes. |
| `node tmp/routing3/trace-changes.mjs step1-main` and `step1-fresh` | Step 1 | 0 each | Recorded every changed graded row. |
| `npm run typecheck` | Step 1 main | 0 | Passed. |
| `npx vitest run test/scoring.test.ts test/drift-141-routing.test.ts test/routing-evidence.test.ts test/extract-routing-phrases.test.ts` | Step 1 main | 1 | 93 passed, 5 failed, and 3 expected failures. |
| `npm run eval:protocol-history` | Restored baseline | 1 | Both v2 contracts reported `source-expired`; no questions ran. |
| `npm run secrets:scan -- --tree` | Restored baseline | 0 | Tracked-file checks and Gitleaks passed. |
| `git diff --exit-code` | Final | 0 | The tracked tree matches HEAD. |
| `git diff --check` | Final | 0 | Passed. |

The focused tests fail on account-merge presence, account-merge ordering, Blend TVL retrieval, SAC score equality, and replica equality.
The last two tests enforce the old score contract; the other three expose product regressions.
I kept all assertions unchanged.
The brief's all-twelve-pass condition did not occur.
I did not run `npm test` or `npm run build` for the rejected candidate.
No production code change remains for those completion gates.
A read-only process-list attempt also failed because the sandbox blocks `ps`.

## Evidence paths

The paths below are relative to this report.

| Evidence | Path |
|---|---|
| Complete helper | [acceptance.mjs](acceptance.mjs) |
| Compact results and changed grades | [measurement-summary.json](measurement-summary.json) |
| Baseline current checks | [baseline-main-acceptance.json](baseline-main-acceptance.json) |
| Baseline fresh checks | [baseline-fresh-acceptance.json](baseline-fresh-acceptance.json) |
| Step 1 current checks | [step1-main-acceptance.json](step1-main-acceptance.json) |
| Step 1 fresh checks | [step1-fresh-acceptance.json](step1-fresh-acceptance.json) |
| Step 1 current differences | [step1-main-diff.txt](step1-main-diff.txt) |
| Step 1 fresh differences | [step1-fresh-diff.txt](step1-fresh-diff.txt) |
| Fresh source differences | [step1-source-diff.txt](step1-source-diff.txt) |
| Step 1 fresh versus accepted main | `routing3/step1-fresh-v-main-diff.txt` (local archive) |
| Original source differences | `routing3/baseline-source-diff.txt` (local archive) |
| Score causes | `routing3/step1-main-trace.json` (local archive), `routing3/step1-fresh-trace.json` (local archive) |
| Holdout and changed-row causes | `routing3/step1-main-changed-traces.json` (local archive) |
| Original short-token controls | [step1-short-token-probes.json](step1-short-token-probes.json) |
| Protocol-history source audit | `routing3/protocol-history.json` (local archive) |
| Receipt and hashes | `routing3/receipt.json` (local archive) |
| Rejected implementation | [step1.patch](step1.patch) |
| Portable evidence | `routing3-evidence.tar.gz` (local archive) |

To reproduce baseline checks, use the final accepted source files and run `node tmp/acceptance.mjs baseline-main` or `baseline-fresh`.
The helper reads each saved manifest directly.
To reproduce step 1 checks without tracked edits, use the retained temporary source copies.
Run `node tmp/acceptance.mjs step1-main tmp/routing3/fix-round/replay`.
Run `node tmp/acceptance.mjs step1-fresh tmp/routing3/fix-round/replay-fresh`.
The optional source-root argument selects the scorer; the label selects its saved manifest and RWA inventory.
The saved result hashes and full result-list assertions reject mismatched evidence.

## Proposed TODO text

Append this text to the existing structured-routing item:

> The 2026-10-09 isolated step 1 changes only ungated field admission.
> It requires a whole content anchor and preserves all 43,520 current-source gated scores.
> It removes four ungated short-token triggers, but the gated triggers remain.
> Current-source graded rows change on 32 cases; fresh-source graded rows change on 30 cases.
> Checks 4, 5, 7, 8, 10, and 12 fail on both sources.
> Check 6 fails only on the fresh source through the wallet control.
> Both weak-gated synthetic controls pass; the whole-word variant remains diagnostic.
> Check 8 passes all positives and ordinary negatives, but all three deferred controls still fail.
> Check 7 preserves corpus grades but loses the account-merge Docs fixture.
> That fixture's baseline presence depends on the stopword `i` prefix-matching `in` in the Docs `id` and `name`.
> Step 1 removes that contribution, so the fixture does not provide a clean scoring target.
> Check 1 uses controlled retention evidence because neither source carries literal `yieldblox` or `reflector` routing phrases.
> It cannot detect their real retention loss until a Scout source epoch carries those phrases again.
> Check 12 deliberately requires zero per-row grade changes between current and fresh sources.
> This rule is stricter than the numeric bands and floors for a fingerprint-only re-baseline.
> Holdout captures rise from 10 to 12; extended top1 falls from 93 to 84 on current sources.
> The fresh source keeps all four required regressions and adds an analyzeHackathonSubmissions capture on the sequence-number question.
> The brief's stopping rule prevents step 2.
> The author restores the accepted scorer and sources, and retains the rejected patch as evidence.
> Keep the source holds, RWA exclusion, quality exclusion, and dApp override.
> Retain the report, helper, summary, patch, and evidence archive before deleting the lane worktree.

Append this text to the existing upstream short-token item:

> Ungated field anchors remove all four original false matches and preserve the intended positive queries.
> The gated scorer still reproduces the upstream defect.
> The isolated Raven candidate fails the routing gate, so `cs-001` remains open.

The orchestrator must replace local evidence links with retained round paths before it commits these notes.
No new upstream finding surfaced.
This lane rechecked `cs-001` and the existing Raven routing defects.
The local scoring and selection failures belong to the existing routing TODO.

## Risks

- The helper and evidence remain under ignored `tmp/` until the orchestrator retains them.
- Check 1 proves controlled retention, not acceptance of a new protocol-history source epoch.
- Check 7 requires corpus grades and fixture presence; those contracts differ on two historical rows.
- Excluding `reviewSubmission` proves absence, not safe admission after exposure.
- The measured gated-score equality covers current-source corpus queries; the patch also preserves the gated comparison path structurally.
- The original whole-word synthetic incorrectly represented weak gated evidence. Its Docs exclusion follows the intended selection rule.
- The accepted baseline still contains known schema, RWA, selection, and short-token defects.

## Blockers

The step 1 failures block step 2 under the brief.
A fresh-source absorb remains blocked by the four named regressions and additional capture evidence.
The protocol-history v2 source contract remains expired.
No environment blocker prevented the requested measurements.

## Fix round

The independent Claude Fable 5.1 review approves the rejection and stopping decision.
I addressed findings 1–5 in the helper.
I added findings 4, 6, and 7 to the proposed TODO text.
The [review](independent-review.md) records the requested corrections.

I changed only files under `tmp/` during this fix round.
I applied the retained patch to a temporary source copy and loaded both saved source snapshots there.
The helper reads the label's RWA inventory directly and stamps both its inventory hash and scorer hash.
The temporary scorer matches the retained step 1 scorer byte-for-byte.
No tracked file needed restoration; the worktree stayed clean throughout this round.

| Finding | Correction | Result |
|---|---|---|
| 1 | Use prefix-only and substring-only weak gated controls; retain the whole-word case as a diagnostic. | Check 6 passes on current sources and fails only through the fresh wallet control. |
| 2 | Remove only the manifest fingerprint failure from check 10 on fresh labels. | `baseline-fresh` passes check 10; `step1-fresh` still fails numerically. |
| 3 | Separate RWA positives, ordinary negatives, and deferred `it.fails` controls. | Four positives and eight ordinary negatives pass; all three deferred controls fail. |
| 4 | Document check 12's zero-row-change requirement in the helper and TODO text. | The helper keeps the stricter requirement. |
| 5 | Build the RWA fixture from the label's saved inventory and record SHA-256 hashes. | Main labels use Scout 1.9.61; fresh labels use Scout 1.9.72. |
| 6 | State check 1's controlled-evidence limit in the TODO text. | Neither saved source contains the two literal routing phrases. |
| 7 | Record the account-merge fixture's stopword partial match in the TODO text. | The baseline score depends on `i` matching `in`; the rejection remains correct. |

All four helper runs rechecked all 544 result lists against the saved measurements.
The scorer, routing results, grade changes, and stopping decision remain unchanged.
All four commands exit 1 because required acceptance checks still fail.

| Command | Exit | Failing checks |
|---|---:|---|
| `node tmp/acceptance.mjs baseline-main` | 1 | 5, 8, 12 |
| `node tmp/acceptance.mjs baseline-fresh` | 1 | 5, 6, 8, 12 |
| `node tmp/acceptance.mjs step1-main tmp/routing3/fix-round/replay` | 1 | 4, 5, 7, 8, 10, 12 |
| `node tmp/acceptance.mjs step1-fresh tmp/routing3/fix-round/replay-fresh` | 1 | 4, 5, 6, 7, 8, 10, 12 |

Additional checks:

- `node --check tmp/acceptance.mjs` exits 0.
- `git apply --directory=tmp/routing3/fix-round/replay tmp/routing3/step1.patch` exits 0.
- `cmp tmp/routing3/fix-round/replay/src/catalog/scoring.ts tmp/routing3/step1-scoring.ts` exits 0.
- `node tmp/routing3/fix-round/verify.mjs` exits 0. It checks verdicts, fixture sources, unchanged evidence, and 1962 tracked file hashes.
- `git diff --exit-code` and `git status --short` exit 0. The tracked tree is clean.

I updated the [summary](measurement-summary.json), `routing3/receipt.json` (local archive), and `routing3-evidence.tar.gz` (local archive).
The fix-round folder preserves the original report, helper, acceptance files, and receipt for comparison.
The `routing3/fix-round/verification.json` (local archive) records the final checks.
