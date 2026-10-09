# Routing step 2 report (lane R2)

> Archived 2026-10-09. Files marked "(archive)" and every `tmp/routing4/` path live in the ignored local
> archive `eval/results/2026-10-09-continuation-lanes-evidence.tar.gz`. The baseline acceptance files equal
> the step 1 baseline files in [`../../2026-10-09-followup/routing-step1/`](../../2026-10-09-followup/routing-step1/).

**Reject step 2. Do not apply the retained patch.**

Step 2 fails checks 8, 10, 11, and 12 on current sources.
It fails checks 8, 10, and 12 on fresh sources.
Check 10 regresses on both sources.
Check 11 regresses on current sources.
Check 12 also worsens: source changes affect nine graded rows instead of seven.
The stop rule rejects step 2 and prevents step 3.

I restored every tracked file to the initial revision, `ef3843e3c05173c80940612ffcb49cf5142e1148`.
The restoration check covers 1,979 tracked files.
No production change remains.
The rejected patch changes only `src/catalog/scoring.ts`: 25 insertions and 24 deletions.
I saved the patch as [step2.patch](step2.patch).
I made no commit, push, deployment, paid call, or `.agents/` edit.

**Baseline verification**

I measured both baselines before I changed the scorer.
Both results match the archived baseline across all 544 rows.
Grades, result orders, scores, and protocol-history target ranks have zero differences.
Both manifests also match the archived manifests byte for byte.
All twelve acceptance results match after the comparison normalizes the evidence directory.
The verification found no baseline difference that required a scope decision.

The helper changes only its evidence directory and accepted label names.
[helper-paths.patch](helper-paths.patch) records those changes.
The helper checks manifest hashes, lane membership, and all recorded result lists.
I used the same helper for all twelve checks on all four measurements.
`baseline-verification.json` (archive) records the complete baseline comparison.

The fresh source is the supplied archive snapshot from 2026-10-09.
I did not fetch a later source during this lane.
The accepted source uses Scout `1.9.61` and 666 Docs titles.
The fresh source uses Scout `1.9.72` and 674 Docs titles.
Its Scout fetch time is `2026-10-09T16:47:28.138Z`.
The fresh catalog excludes `reviewSubmission`, RWA, and quality.

Each measurement contains 338 legacy, 122 extended, 23 skills, 49 holdout, and 12 protocol-history rows.
The grade comparison covers 532 graded rows.
The order and score comparisons cover all 544 rows.

`L` and `E` show top1/top3/top5/cardHit5.
`H` shows top1/top3/top5/forbiddenCaptures.

| Measurement | L | E | Skills top1 | H | Routing exit |
|---|---|---|---:|---|---:|
| Baseline current | 219/298/326/112 | 93/111/117/16 | 17 | 12/26/29/10 | 0 |
| Baseline fresh | 220/295/325/111 | 93/112/117/16 | 17 | 12/26/29/10 | 1 |
| Step 2 current | 220/297/326/111 | 92/111/116/16 | 17 | 12/25/29/10 | 1 |
| Step 2 fresh | 221/294/324/111 | 92/112/116/16 | 17 | 12/25/29/10 | 1 |

The fresh baseline fails only the manifest fingerprint check.
The helper excludes that fingerprint failure from fresh-source check 10.
Step 2 fails the holdout top3 floor on both sources: 25 falls below 26.
Its fresh legacy top3 count, 294, also falls outside the accepted 298 ±3 band.
Both step 2 runs lose extended top1 and top5 hits.

**Twelve acceptance checks**

| Check | Baseline current | Baseline fresh | Step 2 current | Step 2 fresh |
|---|---|---|---|---|
| 1. Retain YieldBlox and Reflector intent | PASS | PASS | PASS | PASS |
| 2. Reject generic research wording | PASS | PASS | PASS | PASS |
| 3. Require repository intent | PASS | PASS | PASS | PASS |
| 4. Preserve account-merge Docs | PASS | PASS | PASS | PASS |
| 5. Reject schema substring evidence | FAIL | FAIL | PASS | PASS |
| 6. Retain strong Docs after weak gated results | PASS | FAIL | PASS | PASS |
| 7. Preserve eight grades and fixture presence | PASS | PASS | PASS | PASS |
| 8. RWA positives / ordinary negatives / deferred controls | PASS / PASS / FAIL | PASS / PASS / FAIL | PASS / PASS / FAIL | PASS / PASS / FAIL |
| 9. Preserve leaderboard and RFP improvements | PASS | PASS | PASS | PASS |
| 10. Pass routing gates and extended comparison | PASS | PASS | FAIL | FAIL |
| 11. Expose controlled directory vocabulary | PASS | PASS | FAIL | PASS |
| 12. Accept fresh sources without grade changes | FAIL | FAIL | FAIL | FAIL |

Check 1 uses a controlled phrase-retention probe.
Neither real source contains literal `yieldblox` or `reflector` routing phrases.
Check 7 preserves all eight corpus grades and every required fixture result.
The helper keeps both contracts, including the known reentrancy and parallel-execution label differences.

Check 5 fixes the intended schema defect.
Adding `phase` no longer changes either `has widgets` probe.
The gated scores remain 149 and 83 across that addition.
The ungated scores remain 149 and 33.
Schema-only generic evidence changes from 46 to null.

Check 6 restores `stellarDocs.search_wallet_dapp_docs` on the fresh wallet query.
The result returns at rank 2 with score 565.
Both weak synthetic controls also pass.
The current-source wallet result remains present.

Check 8 preserves all four positives and all eight ordinary negatives.
All three deferred controls still capture RWA, at ranks 3, 2, and 1.
Their grades and capture ranks do not worsen.
The three `it.fails` markers remain unchanged.

Check 10 fails through a real holdout rank loss and two extended losses.
The Groth16 skill moves from rank 3 to rank 4.
Wallet Docs lose a schema-only gated admission on that query.
The unchanged selector then inserts stronger Soroban Docs ahead of the skill.
The Groth16 skill keeps its score of 164.
The Soroban Docs result also keeps its score of 323.

Check 11 loses `lumenloop.get_categories` on the long controlled-category query.
Its ungated score remains 298.
Removing the schema-only `scout.getRfps` admission changes page selection.
The result page then excludes the vocabulary operation.
The other three vocabulary probes pass.
The fresh-source version preserves all four probes.

Check 12 keeps all four existing fresh-source regressions.
The standards, RWA, and payroll rows still lose top3 against accepted main.
The Blend alternatives row still loses top5.
Step 2 adds a fresh-source top5 loss for `q-soroban-x402-auth-entry-signing`.
The paired source comparison also records the fresh-source recovery of the category card.
Thus, changed graded rows rise from seven to nine.

`reviewSubmission` remains excluded and never appears in the measured results.
The sequence-number control contains only Docs results.
The helper requires zero source grade changes, which exceeds the numeric gate requirement.

**Design and row changes**

The candidate separates schema keyword ranking from every admission path.
It completes lexical scoring, routing evidence, stopword rescue, aliases, and acronym rescue first.
It then adds keyword rank evidence only when that pipeline admits an entry.
Whole-token matches use the existing plural conversion.
Each distinct match uses the existing `5 × 4 × 0.4` weight.
The existing section kind weight also applies.

Schema keywords add no coverage, phrase bonus, prefix match, or substring match.

The manifest combines schema, Docs title, and section words in `keywords`.
The candidate applies one rule to that field.
It adds no operation exception, question exception, new token threshold, or routing baseline change.
It keeps the vendor scorer, ungated replica, phrase extraction, routing vocabulary, and page selector unchanged.
It does not include the rejected step 1 patch.

The admission verification covers all keyword-bearing searchable entries and every routing query.
It makes 52,224 current-source comparisons and 54,400 fresh-source comparisons.
Removing keywords changes no admission result in either tier.
Adding keywords lowers no independently admitted score.
Synthetic checks also confirm ranking support and duplicate-word stability.
Changed-row traces confirm unchanged scores when both implementations omit keywords.

| Comparison | Graded rows changed | Orders changed | Scores or membership changed | Target ranks changed |
|---|---:|---:|---:|---:|
| Archived current → measured current baseline | 0 | 0 | 0 | 0 |
| Archived fresh → measured fresh baseline | 0 | 0 | 0 | 0 |
| Current baseline → fresh baseline | 7 | 80 | 97 | 0 |
| Current baseline → step 2 current | 6 | 89 | 294 | 0 |
| Fresh baseline → step 2 fresh | 6 | 92 | 301 | 0 |
| Step 2 current → step 2 fresh | 9 | 77 | 92 | 0 |
| Current baseline → step 2 fresh | 13 | 152 | 339 | 0 |

The following rows compare step 2 with the baseline on the same source.
`+` means a gain; `−` means a loss.

| Row | Current source | Fresh source |
|---|---|---|
| `q-defi-lumenloop-categories-vocab` | −cardHit5 | unchanged |
| `q-infra-hubble-vs-rpc-layer` | +top1, +any1 | +top1, +any1 |
| `q-soroban-oz-upgradeable-macro` | −top3 | −top3 |
| `q-soroban-x402-auth-entry-signing` | unchanged | −top5 |
| `q-ti-friendbot-ratelimit-alternatives` | −top5, −any5 | −top5, −any5 |
| `q-ti-multisig-recover-lobstr-vault` | −top1, −any1 | −top1, −any1 |
| `q-holdout-a-05-groth16-soroban` | −top3 | −top3 |

Current legacy gated hits fall from 1192 to 1174.
Fresh legacy gated hits fall from 1209 to 1189.
This smaller admission change still causes unacceptable page selection.

**Changed files and retained evidence**

No tracked file remains changed.
Only the local evidence and report remain under `tmp/`.
The initial and final source inventories, exposure policy, catalog, skill pins, and routing baseline match byte for byte.

| Evidence | Path |
|---|---|
| Rejected implementation | [step2.patch](step2.patch) |
| Candidate source for replay | `tmp/routing4/candidate/src/` |
| Original source for comparison | `tmp/routing4/accepted/` |
| Complete routing results | `tmp/routing4/{baseline,step2}-{main,fresh}.json` |
| Twelve-check evidence | `tmp/routing4/{baseline,step2}-{main,fresh}-acceptance.json` |
| Measured manifests | `tmp/routing4/{baseline,step2}-{main,fresh}-manifest.json` |
| Complete row differences | `tmp/routing4/*-diff.json` |
| Lane totals and stop decision | [measurement-summary.json](measurement-summary.json) |
| Admission verification | [keyword-admission-verification.json](keyword-admission-verification.json) |
| Changed-row score evidence | [changed-row-traces.json](changed-row-traces.json) |
| Source metadata | `source-versions.json` (archive) |
| Fresh source changes | `fresh-source.patch` (archive) |
| Helper and snapshot changes | [helper-paths.patch](helper-paths.patch) |
| Initial and final file verification | `tmp/routing4/tracked-before.json`, `tmp/routing4/restored-files.json` |
| Command records and logs | `tmp/routing4/gate-commands.json`, `tmp/routing4/*.log` |

Replay a baseline check with `node tmp/routing4/acceptance.mjs baseline-main` or the `baseline-fresh` label.
Replay a candidate check with `node tmp/routing4/acceptance.mjs step2-main tmp/routing4/candidate` or the `step2-fresh` label.
Each helper command returns 1 because the measured state fails acceptance.
The replay commands leave production source files unchanged.

Replay the admission verification with `node tmp/routing4/verify-keyword-admission.mjs tmp/routing4/candidate`.


**Gate commands and validation**

No gate command used a pipe.
The following table records each command and its exit code.

| Command | State | Exit |
|---|---|---:|
| `npm run eval:routing -- --gate` | baseline-main | 0 |
| `node tmp/routing4/snapshot.mjs fresh && node scripts/build-catalog.mjs` | baseline-fresh | 0 |
| `npm run eval:routing -- --gate` | baseline-fresh | 1 |
| `node tmp/routing4/acceptance.mjs baseline-main` | baseline-main | 1 |
| `node tmp/routing4/acceptance.mjs baseline-fresh` | baseline-fresh | 1 |
| `node tmp/routing4/snapshot.mjs accepted && node scripts/build-catalog.mjs && cmp catalog/manifest.json tmp/routing4/baseline-main-manifest.json` | baseline-main | 0 |
| `npm run typecheck` | step2-main | 0 |
| `npm run eval:routing -- --gate` | step2-main | 1 |
| `npm run eval:selftest` | step2-main | 0 |
| `npm run eval:qa:lint -- --stale --enforce-floors` | step2-main | 0 |
| `npm run improvements:lint` | step2-main | 0 |
| `npm run build` | step2-main | 0 |
| `node tmp/routing4/verify-keyword-admission.mjs` | step2-main | 0 |
| `npm test -- --maxWorkers=2` | step2-main | 1 |
| `node tmp/routing4/snapshot.mjs fresh && node scripts/build-catalog.mjs && cmp catalog/manifest.json tmp/routing4/step2-fresh-manifest.json` | step2-fresh | 0 |
| `npm run eval:routing -- --gate` | step2-fresh | 1 |
| `node tmp/routing4/acceptance.mjs step2-main tmp/routing4/candidate` | step2-main | 1 |
| `node tmp/routing4/acceptance.mjs step2-fresh tmp/routing4/candidate` | step2-fresh | 1 |
| `cp tmp/routing4/accepted/src/catalog/scoring.ts src/catalog/scoring.ts && node tmp/routing4/snapshot.mjs accepted && node scripts/build-catalog.mjs && git diff --exit-code && git diff --check` | restored-main | 0 |
| `npm test -- --maxWorkers=2` | restored-main | 0 |
| `npx vitest run test/qa-paired-launch.test.mjs --maxWorkers=1` | restored-main | 1 |
| `npm test -- --maxWorkers=2 test/qa-paired-launch.test.mjs` | restored-main | 0 |
| `npm run typecheck` | restored-main | 0 |
| `npm run build` | restored-main | 0 |
| `npm run eval:routing -- --gate` | restored-main | 0 |
| `npm run secrets:scan -- --tree` | restored-main | 0 |
| `node tmp/routing4/verify-baseline.mjs` | before baseline helpers finished | 1 |
| `node tmp/routing4/verify-baseline.mjs` | baseline comparison | 0 |
| `node tmp/routing4/summarize.mjs` | complete measurements | 0 |
| `node tmp/routing4/trace-changes.mjs` | candidate and restored replay | 0 |
| `node tmp/routing4/verify-restored.mjs` | restored-main | 0 |
| `git diff --check` | candidate and restored-main | 0 |
| `git diff --exit-code` | restored-main | 0 |

All eight routing comparison commands returned 0.
Each comparison file records its exact input paths and every changed row.
The final routing result matches the baseline across grades, orders, scores, and target ranks.

The candidate unit suite reported 22 failures, 2,570 passes, and three expected failures.
Five failures concern keyword admission or vocabulary page selection.
The other 17 failures concern timeouts and subprocess cleanup checks.
The restored unit suite passed all 139 files: 2,592 passes and three expected failures.
Thus, the restored suite also clears every unrelated candidate-run timeout.

The isolated `npx vitest` invocation failed because the sandbox denied `ps` with `EPERM`.
It reported 29 failures and 17 passes.
The repository command, `npm test -- --maxWorkers=2 test/qa-paired-launch.test.mjs`, then passed all 46 tests.
All 15 process groups named in the denied invocation were absent during the subsequent existence check.
`isolated-process-check.json` (archive) records those checks.

The early baseline comparison started before the acceptance files existed.
It returned 1 for a missing file, not a baseline difference.
The completed comparison returned 0 before implementation began.
The fresh baseline console capture was truncated; its saved JSON contains all 544 rows.

The QA corpus lint reported zero errors and 62 warnings.
The improvements lint passed with 72 findings.
The final secret scan passed both the tracked-file checks and Gitleaks.
The build commands used the repository's existing Wrangler dry-run script.
No executor or demo source changed, so the additional smoke lane did not apply.

**Open risks and next action**

The schema-only admission defect remains in accepted production code because this candidate fails acceptance.
The source hold, RWA exclusion, quality exclusion, and dApp description override remain necessary.
The existing RWA controls and fresh-source grade losses remain unresolved.
Offline routing cannot establish answer quality.
The known short-token defect also remains outside this isolated mechanism.

No new upstream finding surfaced.
This lane rechecked the known schema, selection, RWA, and source-change failures.
The failures belong to the existing repository routing item.
Independent review remains outstanding; the owner retains that review step.
The report does not approve the candidate for release.

The evidence lives under ignored `tmp/` paths.
The owner must retain the evidence before removing this worktree.
The next attempt needs a new scoped brief because the current stop rule prevents step 3.

Suggested evidence-only commit message: `eval: record rejected rank-only keyword routing experiment`.
No production commit is appropriate for this result.
