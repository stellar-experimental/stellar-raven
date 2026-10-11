# Verdict

**INDETERMINATE at the confirmation step. The reported “confirmed FAIL” needs correction.**

The four collections are complete and comparable. They show a repeated Strupey attribution failure in the candidate arm.
However, the required baseline re-judge returned `score: "error"`, `failureClass: "consistency"`, and `judgeScore: "partial"`.
The ledger used the preserved `judgeScore` as a valid ordinal grade. This bypasses the stated T4 exclusion.
The artifacts therefore support a serious regression diagnosis, but do not complete the plan's confirmation requirement.
This result does not authorize a merge or establish PASS.

The plan does not specify a fallback for a failed confirmation re-judge.
Its incomplete-measurement rule is the appropriate conservative disposition for this missing confirmation grade.
The collections themselves do not meet the plan's incomplete-collection condition.
Do not silently convert this distinction into either a successful re-judge or a confirmed absence of regressions.

Two other corrections matter:

- The activity-row “improvement” is a judge error. The stored baseline source defines activity as `github.commits90d`.
- The contracts-domain judge rejects a real candidate-host field. C2 separately blurs successful empties and `soft-empty` errors.

I made no paid call, started no server, and made no Algolia call. I changed only this review file.
I used the stored transcripts, case snapshots, source code, and commit history.
I did not independently repeat the executor's later live checks.

# Pins and completeness

Artifact directory: `eval/qa/results/2026-10-11-answer-style/`.
The labels below identify the full `*-variantA.json` files in that directory.
All transcript indexes in this review start at zero.

| Run | Artifact stamp | Rows | Comparable | Aggregates suppressed | Wrong | Partial | Correct | Error |
|---|---|---:|---|---|---:|---:|---:|---:|
| B1 | `2026-10-11T08-17-16` | 34 | true | false | 2 | 8 | 24 | 0 |
| C1 | `2026-10-11T09-04-33` | 34 | true | false | 4 | 7 | 22 | 1 |
| C2 | `2026-10-11T09-48-55` | 34 | true | false | 6 | 4 | 24 | 0 |
| B2 | `2026-10-11T10-36-13` | 34 | true | false | 3 | 8 | 23 | 0 |

All four runs have the same 34 IDs, order, case contents, and per-case hashes.
All IDs are active. There are no missing, unattempted, unexpected, or duplicate rows.
All answering calls succeeded. C1 has one terminal judge consistency error.
All six paid artifacts match their runner-worktree originals byte for byte.

| Pin | Independently checked value |
|---|---|
| Baseline and runner revision | `d15a4ce52c997577313779872d9f89de7725debc` |
| Candidate revision | `2612f86ab6a2e9197be149230ff2bdb2251ebf5a` |
| Selected case bytes | `2cc286f6df1cd731c2999f265bac7d10d2800f98d96f5399309e965a8fd78c74` |
| Ordered IDs | `ca3940d67dfd356ef1ff4324b47cd3ff65ee489d0fd89feb987a9388e9ea9de4` |
| QA implementation | `6dbaaa5abc06a28c16f8fff78bc767a0a0d682e77675ba8f37d13fc1b0714948` |
| Frozen register | `73ed8a11f5ac290da200c3753eb2133814de5afb391c90ed94170efd5ac1b793` |
| Answering binary | `c9b5341637becbd423ddffc5b254afb645682a3868cb708bbc6cc0e7bb419937` |
| Answering environment | `1fddfbcb124e4bc7693393315fbe5657f67b6ebfb76a665e16b473e4e683adf1` |
| Remote probe | `bde386a01ceb5bfdd325f3cd24369e00e2c111f7b4747ec7c0c9e77bc84485ef` |
| Remote identity | `1a927dce05ba9a1b4e7481c85ebfc7c4d4110aa2cb681de0f0a11fc7d43c0c7b` |
| Baseline surface | `656feeef8966cbac326db00479f69b3171c401e94c5c4239364d04a28e754c4a` |
| Candidate surface | `3de271a5ae860db88eaa84c8bf5644bb4456484bc272add757ccc5aeaef74d9d` |

I recomputed the selected-case and ID hashes from `d15a4ce5:eval/qa/cases.json`.
I also recomputed the frozen register hash from its saved bytes.
All four artifacts use the same binary, environment, register, remote identity, and implementation hashes.
Their remote captures and postflight checks match. Their source and surface guards match before and after collection.
Both models are `claude-sonnet-5`; all stored grades use rubric `v2.11` and pack `p6`.

The three surface reports confirm 7,864 baseline instruction characters and 7,839 candidate instruction characters.
Both baseline starts have the same surface hash. All runs use port 8799.
The collection timestamps establish B1, C1, C2, B2 order without overlap.
The saved artifacts do not independently prove the complete process history or the deleted servers' `.dev.vars` contents.
The ledger attests matching salted `.dev.vars` hashes; I treat that as an attestation, not a recomputed pin.

The replacement follows the fixed selection rule.
`q-pc-quantum-preparedness-dormant` immediately follows `q-pc-protocol-upgrade-timing` in the baseline battery.
It is active, live, non-trap, and assigned to Stellar Docs.
The baseline consistency register records Protocol 28 activation at ledger 64458446 on 2026-09-16.
The old upgrade golden uses Protocol 27 as its dated example and also permits later sourced observations.
Thus, “stale” describes the old example; it does not prove that the behavioral golden forbids Protocol 29.

Commit `e18926a7` records the pins and swap at 07:33:39 UTC, before B1 started at 07:33:51.942 UTC.
Commit `af5f8ccf` records the change list at 10:36:48 UTC, before the first re-judge started at 10:37:13.609 UTC.
The plan's reading rules did not change between the approved candidate and `6d8a75d3`.
Only its status and authorization introduction changed.

Exposure inventory follows. Every row receives the arm's instructions, shown as `I`.
`F` means a stored execute result contains a source footer.
`D` means a script requests `lumenloop.search_directory` or `scout.searchProjects`.
`N` means a script requests `lumenloop.find_content_about_project`, `scout.vetIdea`, or `scout.scfPitch`.
`D` and `N` identify requested operations; they do not prove that an aborted script completed each call.
These classes do not isolate the cause of any answer change.

| Row ID | B1 | C1 | C2 | B2 |
|---|---|---|---|---|
| `q-aas-burn-clawback-redemption-mechanics` | I | I, F | I, F | I |
| `q-asset-rwa-tokenized-freshness` | I, F, D | I, F, D | I, F, D | I, F, D, N |
| `q-asset-trustline-basics` | I | I, F | I, F | I |
| `q-defi-category-funding-ratio-live` | I, F | I, F | I, F | I, F |
| `q-defi-defindex-honest` | I, F, D | I, F, D, N | I, F, D | I, F, D |
| `q-eco-defi-tvl-current` | I, F | I, F | I, F | I, F |
| `q-eco-most-active-defi-projects` | I, F | I, F | I, F | I, F |
| `q-eco-stablecoins-on-stellar` | I, F | I, F | I, F | I, F |
| `q-edge-ambig-stellar-token-meaning` | I | I, F | I, F | I |
| `q-edge-closed-world-builder-directory-miss` | I, F | I, F | I, F | I, F |
| `q-edge-doc-title-zero-hits` | I | I, F | I | I |
| `q-edge-lumenloop-person-entity-empty` | I | I | I | I |
| `q-edge-noinfo-exact-tvl-figure` | I, F | I, F | I, F | I, F |
| `q-edge-noinfo-sep-9999` | I, F | I, F | I, F | I, F |
| `q-edge-noinfo-stellar-native-privacy-default` | I | I, F | I, F | I |
| `q-edge-noinfo-stellar-pos-staking-rewards` | I, F | I, F | I, F | I |
| `q-edge-open-world-recovery-after-narrow-miss` | I | I | I | I |
| `q-edge-strupey-ambiguous-stellar-history` | I, F, D | I, F, D, N | I, F, D, N | I, F, D |
| `q-edge-xlm-price-investment-advice` | I | I | I | I |
| `q-gap-builders-person-empty` | I | I | I | I |
| `q-gap-contracts-domain-empty` | I, F | I | I | I, F |
| `q-gap-related-projects-empty` | I, F | I, F | I, F | I, F |
| `q-gap-semantic-directory-fallback` | I | I | I | I |
| `q-hist-scp-rewrite-2015` | I, F | I, F | I, F | I, F |
| `q-history-ecosystem-index-freshness-live` | I, F | I, F | I, F | I, F |
| `q-jutsu-cash-crypto-ramps` | I, F | I, F | I, F | I, F |
| `q-pc-quantum-preparedness-dormant` | I, F | I, F | I, F | I, F |
| `q-pc-sequence-numbers-ordering-replace` | I | I, F | I, F | I |
| `q-raph-xlm-simple` | I | I, F | I, F | I |
| `q-raph-xlm-staking` | I, F, D | I, F | I, F | I, F |
| `q-sep-interactive-deposit-withdraw` | I | I, F | I, F | I |
| `q-soroban-cross-contract-call` | I | I, F | I, F | I, F |
| `q-soroban-fuzz-testing` | I, F | I, F | I, F | I, F |
| `q-stellar-recurring-payments` | I, F | I, F | I, F | I |

# Costs

I summed each row's answering and judging costs, each budget call, and each artifact total.
The three sums agree within floating-point precision. Every reported call has a cost.
The four free plan reports do not add paid spend.

| Artifact | Actual USD | Authorized cap USD | Missing costs |
|---|---:|---:|---:|
| B1 | 11.6398508 | 19 | 0 |
| C1 | 12.0836566 | 19 | 0 |
| C2 | 11.6535360 | 19 | 0 |
| B2 | 11.8514340 | 19 | 0 |
| B1 re-judge `2026-10-11T10-37-13-rejudge.json` | 0.3283216 | 4 | 0 |
| C1 re-judge `2026-10-11T10-38-57-rejudge.json` | 0.3603036 | 4 | 0 |
| Total | **47.9171026** | **84** | **0** |

Collections total $47.2284774. Re-judges total $0.6886252.
The rounded ledger total, $47.92, is correct. No cap was exceeded.
The budgets account for 398 calls: 136 answering calls and 262 judge calls, including panels and re-judges.

# Consistent changes

I recomputed the ordinal changes with `rowOutcomeClass` and the plan's all-four-observations rule.
The initial consistent-change list is correct.
C1 `q-edge-open-world-recovery-after-narrow-miss` has a terminal T4 outcome and excludes that ID.
No terminal T5 outcome occurs. The common eligible denominator is 33.
The disagreement counts are B1/B2: 8/33 and C1/C2: 7/33.

The Strupey baseline panels contain failed component judges.
Their final panel grades remain `correct`, so those component failures do not exclude the initial comparison.
B1's panel scores are `correct, correct, error`; B2's are `correct, error, error`.
The latter grade rests on one valid panel vote and deserves explicit disclosure.

| Row ID | B1 / B2 | C1 / C2 | B1 re-judge / C1 re-judge | Review |
|---|---|---|---|---|
| `q-edge-strupey-ambiguous-stellar-history` | correct / correct | wrong / wrong | **error** / wrong | Observed regression; valid confirmation pair missing. |
| `q-gap-contracts-domain-empty` | correct / correct | wrong / wrong | partial / partial | Regression does not reproduce. Judge also rejects a real field. |
| `q-eco-most-active-defi-projects` | wrong / wrong | correct / correct | wrong / correct | Grades reproduce; stored sources contradict the baseline wrong grades. |
| `q-pc-quantum-preparedness-dormant` | partial / partial | correct / correct | partial / correct | Missing-fact improvement reproduces. Additional advice remains unsupported. |

Both re-judges preserve the source artifact hash, selected case identity, model/rubric/pack tuple, and prompt hashes.
Neither changes the source answer. Each contains the four authorized IDs.

The B1 Strupey re-judge has `consistencyViolations: ["partial-without-issue"]` and `coreAnswer: null`.
The ledger's “partial (effective)” comes from the diagnostic `judgeScore`, not a valid final grade.
`eval/qa/README.md` states that `error` records judge failure and never grades the answer.
`classifyPairedRow` likewise classifies this final verdict as T4.
`re-judge.mjs` preserves an effective score for agreement diagnostics; that helper does not waive the plan's exclusions.

Reading rule 4 needs a confirmed regression. This confirmation is incomplete.
Reading rule 3 cannot establish a clean pass by treating the failed confirmation as evidence of no regression.
The report must retain the observed failure and the incomplete confirmation separately.
A further paid confirmation needs a new bounded authorization.

# Row findings

**Strupey: the candidate substitutes an unconfirmed identity.**
B1 and B2 explicitly reject an exact match and ask for clarification.
C1 says the name “resolves to Stroopy.AI” and supplies a detailed history.
C2 says it will cover the nearest project and gives its history without asking for clarification.
C2 does mark the identity as inferred; the failure is proceeding with the substituted history despite that caveat.

C1 transcript index 7 returns `inconclusive: "candidates"`, `matchMode: "corrected"`, and the identity-verification warning.
Its script reads the field. C1 transcript index 9 returns Stroopy.AI with `other_names: []`.
C2 transcript index 8 also contains the corrected-match warning and candidate footer.
These records support an agent attribution failure. They do not establish a missing warning or a service identity error.
The executor's later `resolve` check appears only as a ledger account in the supplied evidence.

The claimed single-sentence cause exceeds the experiment's design.
The plan measures instruction removals, signals, footer changes, and candidate-block changes as one bundle.
Restoring the attribution sentence is a hypothesis for another measurement, not a proven isolated remedy.
Existing candidate warnings already told the agent to verify identity before attribution.
The prose-surface rule requires checking that ignored guidance before adding more wording.

**Activity: dispute the reported improvement.**
B1 and B2 transcript index 3 contain `meta.metricDefinitions.activity`.
It explicitly defines sorting by `github.commits90d`, with recency breaking ties.
Both baseline answers use that definition and date their source.
The judges instead claim that activity means latest-commit recency. B1's re-judge repeats the same false premise.
Its `evidenceSupportCheck` flags a pack omission for `metricDefinitions`.

C1 includes the definition in its judge-visible evidence and receives credit for the same interpretation.
This is a source-evidence and stale-golden problem, not demonstrated answer improvement.
The candidate and baseline also use different visible type filters, which explain their different project lists.
C1 overstates its filtered list as an overall ranking. Its own metadata has a type filter.
Do not count this row as a measured quality win.

**Quantum preparedness: confirm the specific missing-fact improvement.**
B1 and B2 miss the source's qualitative discussion of dormant, unreachable holders.
Both broadly deny finding that concept in the checked sources.
C1 transcript index 9 and C2 transcript index 5 contain the relevant QPP passage.
Both candidate answers explain the unresolved recovery-versus-lock decision. The re-judge preserves that distinction.

The blanket `correct` grades still need qualification.
C1 promises that an active account with a future signer will escape any future dormant-account category.
C2 suggests a recent transaction because future policy will likely depend on activity.
The retrieved source leaves that policy unresolved. Those assurances and instructions lack support in the stored evidence.
Confirm the recovered fact; do not endorse the additional eligibility advice.

**Contracts-domain: distinguish the host signal from the error envelope.**
C1 and C2 answer from the catalog. Neither calls `scout.listContracts` in its stored transcript.
C1 correctly describes the candidate host's `ok: true` plus `inconclusive: "empty"` behavior.
`src/executor/providers.ts` computes that signal only after the successful-response branch.
An error, including `soft-empty`, returns through the separate `ok: false` branch.
Thus, the judge's claim that this signal contradicts successful empty data is false.

C2's phrase “empty/`soft-empty` result” does blur the distinction in its answer.
Both candidate answers also omit explicit preservation of the returned counts and `generatedAt`.
Those are answer omissions or ambiguity. They do not prove that the host conflates the two envelope types.
The partial/partial re-judge does not confirm a consistent regression.
A field rename is not justified by this evidence alone.

The table below covers every initially wrong or partial ID and every grade transition.
Vectors use B1, C1, C2, B2 order. `C`, `P`, `W`, and `E` mean correct, partial, wrong, and error.
These are stored grades, not replacement grades from this review.

| Row ID | Grades | Finding and disposition |
|---|---|---|
| `q-defi-category-funding-ratio-live` | P/P/P/P | All answers omit small-denominator caution and the distinction from future funding probability. Shared answer omission; no arm change. |
| `q-defi-defindex-honest` | W/W/W/P | All answers give dated, source-scoped TVL. The golden demands source disagreement; judges vary on the avoid rule. Product-list scope also varies. Keep disputed and monitor-only. |
| `q-eco-defi-tvl-current` | C/C/P/P | Answers use a protocol sum containing RWA values. They vary in metric and date caveats. Shared metric-scope weakness; no consistent change. |
| `q-eco-most-active-defi-projects` | W/C/C/W | Stored metric definitions contradict the baseline wrong grades. Dispute the claimed improvement. |
| `q-eco-stablecoins-on-stellar` | C/W/W/W | C1, C2, and B2 omit yield/RWA distinctions for USDY and YLDS. B1 labels yield products. Shared synthesis omission; no consistent change. |
| `q-edge-noinfo-stellar-native-privacy-default` | C/C/W/C | C2 gives the network boundary but omits named products and their status. The wrong grade needs review. No avoid fires; no fresh verification occurred. |
| `q-edge-open-world-recovery-after-narrow-miss` | C/E/C/C | All answers require broader evidence before a wider absence claim. C1 has a judge consistency failure. Exclude it from the ordinal comparison. |
| `q-edge-strupey-ambiguous-stellar-history` | C/W/W/C | Candidate answers substitute Stroopy.AI despite corrected-match warnings. Real observed failure; confirmation re-judge remains T4. |
| `q-edge-xlm-price-investment-advice` | C/C/C/W | All answers decline the same four requests. B2 alone gets wrong for omitted education. Judge applies conflicting golden instructions; monitor-only. |
| `q-gap-builders-person-empty` | P/P/C/C | All answers scope the absence to the directory. None gives the populated-directory count required by the golden. Partial/correct variation is mainly judge inconsistency. |
| `q-gap-contracts-domain-empty` | C/W/W/C | C1 states real host behavior. C2 blurs empty and soft-empty language. Both omit reporting details. Re-judge does not reproduce regression. |
| `q-gap-related-projects-empty` | P/P/C/P | B1, C1, and B2 omit empty-result meaning. C2 supplies an actual empty example and explains valid zero mentions. One-run improvement only. |
| `q-gap-semantic-directory-fallback` | C/P/C/P | All answers describe candidates and broader recovery. C1/B2 partial grades cite the pending ll-017 documentation cap. The cap varies across equivalent answers. |
| `q-hist-scp-rewrite-2015` | P/C/C/C | All answers include SDF attribution and Ripple disagreement. B1 alone gets the ll-016 cap and missing-date penalties. Keep the disputed history monitor-only. |
| `q-jutsu-cash-crypto-ramps` | P/P/P/P | All answers omit specific availability, compliance, fee, and limit checks. Shared omission; no arm change. |
| `q-pc-quantum-preparedness-dormant` | P/C/C/P | Candidate answers recover the dormant-holder passage. Confirm that improvement, but flag their unsupported future-policy advice. |
| `q-pc-sequence-numbers-ordering-replace` | C/C/W/C | C2 quotes the general precondition exception but later makes an unconditional seq+2 rejection claim. Stored source supports the omitted minSeqNum exception. One-run synthesis failure. |
| `q-soroban-cross-contract-call` | P/P/C/C | B1/C1 omit nested user authorization and direct-invoker distinctions. Later answers add authorization detail. Skill extraction errors affect early runs. No consistent arm change. |
| `q-stellar-recurring-payments` | P/P/P/P | All answers omit billing idempotency and failed-payment handling. Most omit pause/revocation controls. C2 repeatedly misreads skill sections. Shared omissions; no arm change. |

The initial run totals contain 15 wrong rows and 27 partial rows across these IDs.
The review does not treat unrepeated grades as confirmed regressions.
The executor omitted fresh checks for several candidate wrongs, including privacy, sequence numbers, and DeFindex.
That omission limits failure attribution even where the final bundle decision would stay blocked.

The free plan reports are present. Required coverage is 28/34, 28/34, 27/34, and 29/34.
The ledger's absence-phrase regex includes scoped statements and negations. It does not measure unscoped absence claims.
The B2 date regex also misses the Unicode date in the quantum answer.
That answer contains source publication dates, but lacks a clear current observation date for its negative claim.
Do not treat the regex's 7/8 as a complete manual date audit.

# Behavior counts

I inspected all 136 stored transcripts, including successful rows.
Counts below distinguish erroneous scripts, affected rows, and failed calls.
A recovered failure still counts when the final answer omits its reason.
I count an omitted reason when the answer gives neither the specific cause nor a clear equivalent explanation.

| Run | Skill-shape errors: scripts / rows | Rejected comma-joined array arguments | Hard failures with omitted reasons: calls / rows |
|---|---:|---:|---:|
| B1 | 2 / 2 | 0 | 2 / 2 |
| C1 | 1 / 1 | 0 | 2 / 1 |
| C2 | 2 / 1 | 0 | 7 / 4 |
| B2 | 0 / 0 | 0 | 1 / 1 |

No script directly reads skill payload fields without `.data`.
The five errors instead misread the documented `data.sections` array.

| Run | Row ID | Transcript index | Evidence |
|---|---|---:|---|
| B1 | `q-edge-noinfo-sep-9999` | 3 | Calls `.toString()` on section objects; result is `[object Object],[object Object]`. |
| B1 | `q-soroban-cross-contract-call` | 3 | Treats the first section object as a string; returns `crossContractSection: null`. |
| C1 | `q-soroban-cross-contract-call` | 4 | Reads `skill.data.content` instead of `skill.data.sections[0].content`; returns `skillExcerpt: null`. |
| C2 | `q-stellar-recurring-payments` | 4, 5 | Indexes sections by `"file:security.md"`; loses the text twice. Index 5 reports length zero. |

C2 recovers the section shape at indexes 6 and 7.
I do not count successful whole-envelope returns or harmless fallback expressions as shape errors.
B1's quantum failure concerns `codemode.search`; C2's Strupey failure concerns `codemode.catalog`. Neither is a skill-read error.

No transcript records a host rejection caused by a comma-joined array argument.
Some scripts use comma forms, but the saved rejections concern paths, numeric IDs, or other script errors.
The rejected-array row-ID list is empty for every run.

Hard failures and omitted reasons follow.
These counts include host argument rejections, service errors, and failed execute calls.
They exclude `soft-empty`, which appears separately below.

| Run | Row ID | Omitted calls | Cause absent from the final answer |
|---|---|---:|---|
| B1 | `q-edge-noinfo-stellar-pos-staking-rewards` | 1 | A full URL fails the `get_doc_page_sections` path pattern. |
| B1 | `q-pc-quantum-preparedness-dormant` | 1 | Script reads `.data.hits` from the wrong result shape; execution fails. |
| C1 | `q-edge-strupey-ambiguous-stellar-history` | 2 | Unknown `searchBuilders`; later non-JSON HTTP 502. “Empty/errored” omits the causes. |
| C2 | `q-defi-defindex-honest` | 1 | Returned Promise cannot be cloned. |
| C2 | `q-edge-ambig-stellar-token-meaning` | 1 | Full URL fails the page-section path pattern. |
| C2 | `q-edge-strupey-ambiguous-stellar-history` | 2 | Unknown `searchBuilders`; then `names.filter is not a function`. |
| C2 | `q-gap-related-projects-empty` | 3 | Three calls pass null numeric IDs. The final answer explains string rejection, but omits these null-ID failures. |
| B2 | `q-edge-strupey-ambiguous-stellar-history` | 1 | Unknown `searchBuilders`. |

There are 3, 2, 8, and 2 hard failures in B1, C1, C2, and B2 respectively.
The other failures are string `content_id` rejections in B1, C2, and B2 `q-gap-related-projects-empty`.
Their final answers explain the numeric-ID requirement and string rejection.
C2's generic numeric-ID guidance can support a broader interpretation of reason disclosure.
Under that interpretation, omit its three null-ID failures from the count: C2 becomes 4 calls across 3 rows.
The strict count above preserves the distinct stored causes.

If “failed calls” includes `soft-empty`, add these omitted reasons:

| Run | Additional calls | Row IDs and counts |
|---|---:|---|
| B1 | 3 | `q-edge-ambig-stellar-token-meaning` (1); `q-pc-sequence-numbers-ordering-replace` (1); `q-raph-xlm-staking` (1). |
| C1 | 4 | `q-edge-strupey-ambiguous-stellar-history` (3); `q-raph-xlm-staking` (1). |
| C2 | 6 | `q-edge-strupey-ambiguous-stellar-history` (4); `q-raph-xlm-staking` (2). |
| B2 | 0 | None. |

These causes include unindexed slugs, missing embeddings or submissions, and empty Docs candidate windows.
The final answers do not explain those specific causes.
With `soft-empty` included, the strict omitted-reason totals are 5, 6, 13, and 1 calls.
Their affected-row totals are 5, 2, 5, and 1.
These behavior counts describe this sample. They do not establish a causal effect of the candidate bundle.

# Root-cause routing

Apply `run-evals` Step 5 as follows. This review does not edit the queue or create findings.

| Cause | Evidence | Destination and next action |
|---|---|---|
| Judge/measurement error | Strupey re-judge has a terminal consistency error. | Correct the round ledger. Preserve `error`; do not replace it with diagnostic `judgeScore`. |
| Judge artifact and eval evidence gap | Activity definitions support both baseline answers; judges assert an obsolete definition. | Record the pack omission in the round. Route a general evidence-pack check to `.agents/TODO.md`. |
| Eval-side golden gap | Activity grader notes conflict with the stored service definition. | Use `golden-truth` for any later golden change, with retained source evidence. |
| Agent attribution failure | Both candidate Strupey answers proceed despite explicit identity warnings. | Keep the observed regression in the round. Test a general remedy under a new authorization. |
| Judge artifact | Contracts-domain judges reject the real `inconclusive: "empty"` field. | Correct the interpretation in the round. Review judging against the candidate's host contract. |
| Agent synthesis ambiguity | C2 groups successful empty data with `soft-empty`. | Monitor the answer-level distinction. Do not infer a host envelope bug or prescribe a rename. |
| Agent result-shape pattern | Five bad section reads across unrelated SEP, contract, and payment questions. | Attach these counts to the existing `.agents/TODO.md` item. Check existing guidance before proposing a mechanism. |
| Agent call construction and reporting | Invalid paths, invalid numeric IDs, unknown operations, and omitted failure reasons. | Record the sample counts and recovery outcomes. Separate these from upstream data gaps. |
| Eval policy inconsistency | Builder-directory, fallback, historical, and investment-answer grades vary under equivalent behavior. | Keep monitor-only records. Review golden instructions and judge application before changing product prose. |
| Shared answer omissions | Funding ratios, ramps, authorization, billing safety, and product distinctions. | Record the affected cases locally. Require a general pattern before changing prompts. |
| Upstream transport failure | C1 receives a non-JSON HTTP 502 from Lumenloop. | Retain the occurrence. One transient failure does not establish a verified upstream finding. |

The stored evidence does not establish a new verified upstream content or semantics defect.
It does establish local measurement defects and agent behavior worth tracking.
Do not create an upstream finding merely because a judge called an answer wrong.
The Strupey failure and the measurement defects must both remain visible in the round record.

RESULT-REVIEW: DISPUTED: INDETERMINATE confirmation; the Strupey baseline re-judge is T4, and the activity improvement is a judge artifact.
