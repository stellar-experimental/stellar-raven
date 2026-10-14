Independent post-run review of draft PR #270

Reviewer: Codex. Review target: `w1012/t`, `26ee296a6f6ef2e9e960b5cfe3e7dd345bb4afdd`.
I read the stored results, scripts, judge reasons, plans, and source changes.
I changed no repository file and made no paid call.

The text passed on the measured baseline, but its combination with #271 needs a new measurement.
The guard remains INDETERMINATE on T against TG.
I do not confirm the proposed clip FAIL.
The written rules require an independent content check, which identifies inconsistent judging in C2.
The clip passes this historical screen.

1. **Merge blocker: the text measurement does not cover `0a60d98a` plus the text change.**

The measured A revision was `f7b1b775`; T was `52415bb0`.
Neither revision contains #271.
The new `main`, `0a60d98a`, changes the execute description, server instructions, successful envelopes, and source footers.
These changes affect model input before and after section reads.
A clean cherry-pick proves source compatibility only.
It does not prove that the measured reduction survives the new input.

Evidence: `.agents/rounds/2026-10-12-call-pattern-triage/plan-section-guard.md:101` requires rebuilding arms when `main` moves before launch.
Its exception removes another plan review when the changed lines remain identical.
It does not transfer old measurements to a changed baseline.
The same plan requires the complete arm tree at line 106.
The combination warning at line 46 explains why separate passing changes do not prove a combined change safe.
The merge order at line 60 also keeps each change separate.
The run-evals skill requires measuring description changes at `.agents/skills/run-evals/SKILL.md:429`.

Apply the text change alone to the intended shipping baseline.
Measure that baseline against its text candidate under a new authorization.
Keep the current A/T PASS as historical evidence.
Do not merge the guard with the text.
The existing authorization does not cover another collection.
The ledger states this at `.agents/rounds/2026-10-12-call-pattern-triage.md:305`.

I checked source compatibility independently in `/private/tmp/claude-501/w1013/rt-combined/`.
I extracted `0a60d98a` there and performed three-way merges for the six text-change files.
All six merged without conflicts.
A plain context patch failed first; that was not a cherry-pick conflict.
The three-way merge preserves #271 and the section-shape text.
The descriptions, docs page, skills README, and assertions agree about the section array.
The code still returns section objects in request order and omits `data.content` for section reads.
The description test and provider test passed: 2 files, 115 tests.
These focused tests establish compatibility, not model behavior.
I did not rerun the full build, typecheck, or smoke suite for this read-only review.

2. **The clip FAIL treats a confirmed judge pair as a verified repeated content regression.**

The initial grades are B1 correct, B2 correct, C1 partial, and C2 partial.
The authorized re-judges reproduce B1 correct and C1 partial.
I read all four SCF answers, their executed evidence, and both re-judge reasons.

| Cell | Answer content | Judge reason | Independent trace |
| --- | --- | --- | --- |
| B1 | $150,000, XLM, four installments, date, source | Accepts four installments as the tranche fact | Baseline standard |
| B2 | $150,000, XLM, four installments, date, source | Accepts four installments as the tranche fact | Same baseline standard |
| C1 | $150,000, XLM, date, source; no installments | Missing the tranche fact | Real answer omission |
| C2 | $150,000, XLM, four installments, date, source | Requires an explicit link to milestones | Inconsistent standard against B1 and B2 |

All four transcripts contain the handbook's four-installment evidence.
C1 and C2 also contain milestone evidence.
C2 says "typically in four installments".
Its judge penalizes the missing milestone link, not the word "typically".
B1 and B2 also omit an explicit milestone link.
Their judges accept the installment wording.
Applying either interpretation consistently removes the repeated cross-arm content regression.
This does not erase C1's omission.
It identifies C2's relative grade difference as judge variance.

The controlling requirement is a **confirmed verified answer regression**, in clip rule 4.
See `.agents/rounds/2026-10-12-call-pattern-triage/plan-clip-marker.md:135`.
Clip rule 3 explicitly imports the ai-upgrade answer rules.
Those rules require a non-author trace of every difference.
They also state: "A judge verdict alone does not establish a regression."
See `.agents/rounds/2026-10-10-weekend/ai-upgrade/measurement-plan.md:578` and line 585.

Clip rule 6, at line 142, adds the B1/C1 confirmation check.
It does not cancel the independent content check or re-judge C2.
The successful B1/C1 confirmation establishes that pair's difference.
It does not establish a content regression in both candidate repetitions.
I preserve every stored grade and record this trace separately.
I introduce no new threshold, exception, wording change, or paid re-judge.

Artifact evidence: `/private/tmp/raven-clip-marker/results/{b1,b2,c1,c2}/*-playground-semantic.json`, row `q-scf-build-award-cap`.
The relevant fields are `answer`, `verdict.rationale`, and the execute transcript's `result`.
Confirmation evidence: `results/rejudge-b1.json` and `results/rejudge-c1.json`, under the same directory.
Their `rows[0].new` objects preserve the confirmed pair.

Every other clip PASS condition holds.
Target omissions fall from 3 to 0; control omissions remain 0.
The target cards show `required input: query` in every candidate target row.
No baseline result shows that marker.
All protocol controls pass routing, and no row has a routing regression.
The step records show no tool-loop defect.
The candidate reserve wrong grade also occurs in both baseline runs.
The result report records its live check and existing `sd-046` classification.
That row does not supply a repeated candidate regression.

This PASS covers the pinned historical six-case screen only.
It does not establish safety on the later #271 baseline or on another model.

3. **The text PASS and guard INDETERMINATE follow the fixed rules.**

I reran the pinned counter on all twelve method artifacts.
Both counter copies have SHA-256 `2a99d5146cf48b3438d774f583027764ca225c43cb0c64378c16fcddca88c36f`.
All 23 counter fixtures pass.
I used the manifest from `f7b1b775`.
The repository lacked `acorn`, so I ran the unchanged counter from a temporary directory.
All stored screen counts match, except the artifact path after file relocation.
I read the eight misread scripts directly and checked their results.
I also checked every execute error and the G2 recovery script.
The two stored readers agree on all classification fields across 139 inspected scripts.
One is the G1 syntax-error script; it contains no section read.

| Collection | S | M | L | E | F | K | Execute calls | Execute errors |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| A1 | 23 | 2 | 1 | 0 | 0 | 0 | 37 | 2 |
| T1 | 15 | 0 | 0 | 0 | 0 | 0 | 34 | 0 |
| G1 | 17 | 0 | 0 | 0 | 0 | 0 | 33 | 2 |
| TG1 | 17 | 0 | 0 | 0 | 0 | 0 | 30 | 0 |
| TG2 | 12 | 0 | 0 | 0 | 0 | 0 | 33 | 0 |
| G2 | 21 | 4 | 2 | 1 | 0 | 0 | 36 | 2 |
| T2 | 16 | 0 | 0 | 0 | 0 | 0 | 33 | 0 |
| A2 | 17 | 2 | 2 | 0 | 0 | 0 | 38 | 1 |

S counts section-read scripts; M counts misreads; L counts silent losses.
E counts guard exceptions; F counts false guard exceptions; K counts sectioned-skill describe calls.
The A misreads are four string-use errors.
G2 has two string-use errors and two absent-content errors.
There are no map-key or other misreads.

The four A misreads are:

- A1, `q-defi-build-staking-for-own-token`, transcript index 6: joins section objects.
- A1, `q-passkey-smart-account-architecture`, index 4: calls `.slice` on a section object.
- A2, `q-asset-trustline-basics`, index 2: calls `.toString()` on the section array.
- A2, `q-defi-build-staking-for-own-token`, index 5: joins section objects.

Each citation refers to `/private/tmp/raven-section-screen/results-<collection>.json`.
The saved counter outputs and `read/R1-*.json` / `read/R2-*.json` give the complete script mapping.
I found no `codemode.describe` call in any screen execute script.
Thus K = 0 is correct; the describe usage-line change lacks direct exposure evidence.

For text, A has 4/40 misreads, or 10%; T has 0/31.
T's denominator exceeds half of A's denominator: 31 exceeds 20.
Read avoidance V is 0.
The additional A scripts include repeated reads and recovery after errors.
The Etherfuse row instead gains a section read in both T collections.
All T execute scripts finish without an execute error.
No row has both T grades below both A grades.
No row has a consistent improvement either.
A has 0 within-arm grade disagreements; T has 2.
The A misread counts are 2 and 2.
These values satisfy text rules 4 and 5 without changing the floor.
See `.agents/rounds/2026-10-12-call-pattern-triage/plan-section-text.md:104`.
The result remains a small-sample PASS, exactly at the four-misread floor.

Text PASS selects T against TG for the guard verdict.
TG has 0 exceptions across 29 section-read scripts.
T and TG have no consistent grade change.
TG has 6 within-arm grade disagreements.
Guard rule 6 therefore gives INDETERMINATE; no FAIL condition applies.

A against G remains diagnostic.
Its single guard exception occurs in G2, `q-pc-surge-griefing-threat-model`, index 5.
The model converts section objects to strings; the exception is valid.
Index 6 reads the same security section correctly.
Thus R = 1, U = 0, F = 0, and D = 4 lost service co-results.
The staking row has A grades 2,2 and G grades 1,1.
That diagnostic regression lacks confirmation and cannot decide the shipping comparison.
A against TG has no consistent grade change.

4. **Collection completeness, identities, and costs pass within the recorded evidence limits.**

All four clip runs have six frozen rows and valid grades.
All eight screen collections have sixteen frozen rows and valid grades.
No collection loses a row, omits a cost, or suppresses aggregates.
Every screen artifact has `comparable: true` and passing revision, surface, executable, environment, and process checks.
The remote identity checks also pass.
All screen artifacts use the same case hash and QA implementation hash.
All judged collections use `claude-sonnet-5`, rubric `v2.11`, and pack `p9`.
The clip answer logs show only `openai/gpt-5.6-terra` attempts.

| Arm | Server revision | Surface or generation prefix |
| --- | --- | --- |
| Clip BASE | `f7b1b775` | generation `3f90c8cf` |
| Clip CANDIDATE | `fb84c199` | generation `c83bb070` |
| Screen A | `f7b1b775` | surface `656feeef` |
| Screen T | `52415bb0` | surface `0e429c70` |
| Screen G | `7c2b2030` | surface `656feeef` |
| Screen TG | `e972a6f1` | surface `0e429c70` |

The trees match the launch amendment.
Each amended arm diff equals its reviewed diff byte for byte.
The 22 selected case entries also match between `6891dca2` and `f7b1b775`.
Screen case hash: `5872d7527c914fbd2a862e1ec6499659460c2ffe58fc804b4f7fab646f08fe83`.
Clip method case hash: `207ca631c052341b73a3b0ed173104e8848c6f3f824e97bdd977a6ba6127f16d`.
Executable hash: `c9b5341637becbd423ddffc5b254afb645682a3868cb708bbc6cc0e7bb419937`, version `2.1.296`.
Screen environment hash: `190d0b47f86ab39d51716fe67dab7e50a97a92381f230ce156d3f3531b892368`.
The frozen probe vector is `414667aa38583bc99d775e02c7efe3e5a8a731f33e756668141052e05fe1205e`.
The screen probe hash is `eb06cd89bc6232d6747b7d44973f2deec272b48ba343b9d19a9800b74a18c226`.
The stability register hash is `aebd5b94346141599ada2e85ab0f4a40beff5937ed52d2e2728ab67e7aa7c54c`.

Clip identity proof is weaker than the screen's automatic checks.
Its generation is operator-asserted, as `meta.server.proofLimit` explicitly states.
Server logs contain the expected revisions and model attempts.
The clip environment checks and repeated source-probe receipts survive in the ledger's record.
I cannot reconstruct their original shell checks from the retained result JSON.
The ledger records clip environment hash `2a41a9e687b744638ab6c7dd6f65e835a05d9345ef3fcb1d317af01133726bec`.
The removed worktrees also prevent repeating their original clean-tree and `.dev.vars` checks.
These are evidence limits, not observed pin mismatches.

I recomputed spend from individual `budget.calls[].costUsd` values using decimal arithmetic.
Every value is positive, reported, and within its command authorization.

| Collection | Recomputed USD |
| --- | ---: |
| Clip receipt | 0.0842625 |
| Clip B1 | 0.7983035 |
| Clip C1 | 0.7781323 |
| Clip C2 | 0.7605709 |
| Clip B2 | 0.7701312 |
| Clip B1 re-judge | 0.0790134 |
| Clip C1 re-judge | 0.0597824 |
| **Clip total / cap** | **3.3301962 / 22** |
| Screen A1 | 6.6985946 |
| Screen T1 | 6.6318970 |
| Screen G1 | 6.7421682 |
| Screen TG1 | 5.8277914 |
| Screen TG2 | 6.1198368 |
| Screen G2 | 6.2686388 |
| Screen T2 | 6.4095010 |
| Screen A2 | 6.7411778 |
| **Screen total / cap** | **51.4396056 / 136** |
| **Combined total** | **54.7698018** |

The clip has 25 answer turns, including the receipt, and 26 judge calls, including confirmations.
Its highest reported call costs $0.1152964, below the $0.30 stop line.
The screen has 128 answer calls and 190 judge calls.
No replacement, initial-judge retry, or screen confirmation call ran.
Detailed independent checks remain in `/private/tmp/claude-501/w1013/rt-audit.json` and `rt-evidence-checks.txt`.
Counter reruns remain in `/private/tmp/claude-501/w1013/rt-counter/`.

5. **Process deviations do not establish a non-comparable collection, but the report needs corrections.**

Deviation 1 predates paid collection and fixes port 8799.
The screen process and surface checks identify the intended Raven server before and after each collection.
The clip logs identify the intended revisions.
The foreign server therefore does not create an observed wrong-server collection.

Amendment 2 came after A1, T1, and G1 data existed.
It is an adaptive operational amendment, not a fully preregistered contention rule.
Keep that fact visible.
It changes no sample, grade rule, model, arm, or budget.
The lane stopped before TG1 when the old count condition failed.

I checked every execute error in all eight artifacts.
G1 has an invalid identifier and an unknown operation; neither indicates host contention.
A1 has two model shape errors; A2 has a local variable initialization error.
G2 has a section string-use error and the intended guard exception.
T1, T2, TG1, and TG2 have no execute error.
The reported contention count of 0 therefore holds under amendment 2's definition.
The later start receipts satisfy the new load gate, including TG1's 10.36.
This check excludes recorded failures; it does not prove identical CPU conditions.
I find no evidence that requires discarding a collection under the stated rules.

The refused T1 command stopped at the environment check before paid calls.
The successful T1 artifact retains the original expected environment hash.
See `/private/tmp/raven-section-screen/T1-refused-env.out` and `results-T1.json`.
This is a successful stop, not a replaced paid collection.

The piped receipt lost its process exit status.
The receipt artifact still records a complete budget, one successful answer, and its cost.
The server step record supplies matching usage and no defect.
Accept it as a receipt with a missing shell-status record, not as proof of exit 0.
The four method runs retain their completeness records.
The missing Gateway headroom read remains a launch-check omission.
No cost or completion evidence shows that it affected these collections.

Correct these reporting errors before publishing the final result:

- `result-clip.md:69` says 26 answer turns. The three step files show 7 + 12 + 6 = 25.
- `result-clip.md:169` says SCF uses both families in all runs. B2 uses only `scout`; its routing class remains E.
- `result-clip.md:115` reports hit-card markers only. Include or label the additional `widerCandidates` markers.
- C1 has 5 SCF markers and 11 SEP-45 markers when advisory cards count. C2 has 4 SCF markers.
- The ledger at line 450 says 7.5 load at 01:58Z. `result-screen.md` reports 19.11 for that time.

The load discrepancy needs reconciliation in the record.
It does not change TG1's retained pre-start receipt at 01:59:55Z, which records 10.36.
The marker-count scope does not change target exposure or the primary omission counts.
The report should also replace the proposed clip FAIL with the independent trace above.

CLIP: PASS
TEXT: PASS-CONFIRMED-NEEDS-REMEASURE
GUARD: INDETERMINATE-CONFIRMED
