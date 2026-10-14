# R6: independent review of the p6/p8 paired re-judge

The predeclared rule blocks p8 on one Stage 2 row.
The operator's blocking decision is correct.
The evidence on that row exposes a real answer error.
This run remains blocked even if a future rule accepts such corrections.

I reviewed commit `8d021d88`, the plan at `7ab6a3ca`, and the pinned arm artifacts.
I made no paid call, started no server, and changed no tracked file.
I used the run-evals review workflow and read all individual rationales in both arms.
The review uses saved evidence, not a new claim about current external services.

## Independent checks

[The audit script](rr6-audit.mjs) rebuilds the packs and full prompts from the original saved sources.
[The audit output](rr6-audit.json) contains the votes, costs, hashes, and individual verdicts.
The script reads both pinned arm modules directly.
It validates source hashes, case hashes, identities, selections, budgets, and recorded prompt hashes.
Its 192-call count includes 96 historical arm-A calls.
Only the 96 arm-B calls count toward this run's re-judge spend.

- All 24 artifact hashes match the manifest.
- The 12 reused arm-A manifest entries exactly match the p7 manifest.
- All 32 arm-A packs match both their recorded hashes and the original stored p6 hashes.
- All 32 arm-B packs and all 64 full prompts reproduce their recorded hashes.
- All reconstructed packs fit the 12,000-character limit.
- Both arms use `claude-sonnet-5`, `v2.11`, and panel size 3.
- Arm A uses `d15a4ce5`; arm B uses `36e77d4067e1a0d0c5156c0eaf1ee2904200b21b`.
- All recorded before/after binary and environment identities match their expected pins.
- Every invocation records `successful`, a passed postflight, and no unattempted or incomplete row.
- The 12 arm-B invocations contain exactly 32 rows and 96 calls.
- Every call reports its cost; every sequential authorization equals the remaining file budget.
- No file reaches its cap. No arm-B call exceeds $0.60.
- The maximum arm-B call costs $0.1966644.
- The self-test has seven matching grades, seven reported costs, and no dirty runner record.
- Its maximum call costs $0.0444104, below $0.50.

The self-test file hash matches `dbf292c7c6abde342ccf27c7912717d7b8db63aab6074f8bbc69e287e435b99d`.
The current executable also reproduces the recorded binary hash.
The committed launcher reproduces the recorded environment hash.
Both arm worktrees remain clean.

The only error vote occurs in S3c, vote 2.
It records `consistency`, `judgeScore: partial`, and `core-incorrect-not-wrong`.
The panel excludes that error and retains two partial votes.
The stage therefore stays below the stop threshold of more than two errors.
All three stages completed without a recorded stop condition.
These records cannot independently prove every historical shell command or exclude an unrecorded call elsewhere.

The predeclared analysis script reproduces [the committed summary](rr6-summary.json) exactly.
The independent majority calculation reproduces every panel score.
There are no graded ties.

## Costs

These figures sum the raw call costs before rounding.
Arm A is reused and costs this run $0.

| Item | New calls | Spend | Cap |
|---|---:|---:|---:|
| Self-test | 7 | $0.2821592 | $3.50 |
| Stage 1 | 18 | $1.8820840 | $4.95 |
| Stage 2 | 60 | $5.1231024 | $16.35 |
| Stage 3 | 18 | $1.7969612 | $5.00 |
| Total | 103 | $9.0843068 | $29.80 |

The reported total, $9.0843, is correct.
Correct the Stage 2 display to $5.1231.
The reported $5.1232 results from adding the rounded file figures.
Every file cap matches the predeclared invocation table.

## Rules applied to every row

C means correct, P means partial, W means wrong, and E means error.
All A votes are reused. All B votes are new.
The tables show panel scores and each vote in call order.
The linked audit contains every exact pack hash and recorded support-check status.
Support-check statuses do not replace direct source inspection.

### Stage 1

Require real support spans and no fabricated-or-absent accusation against the supported text.
A lower grade for another reason does not fail this stage.

| Invocation / row | A score (votes) | B score (votes) | New cost | Reading |
|---|---|---|---:|---|
| S1a / `q-defi-etherfuse-stablebonds` | partial (P/P/P) | partial (P/P/P) | $0.2757692 | Pass. The maturity span is present; no vote rejects it. |
| S1b / `q-edge-fresh-latest-blend-tvl` | wrong (W/P/W) | correct (P/C/C) | $0.3621648 | Pass. Votes cite source figures; the trend-method concern remains. |
| S1b / `q-sor-deploy-invoke-from-js-sdk` | wrong (W/W/W) | wrong (P/W/W) | $0.3657152 | Pass. Golden API and builder contradictions keep the wrong grade. |
| S1b / `q-ti-rpc-gettransactions-pagination-xdr` | partial (P/W/P) | wrong (W/W/W) | $0.3484324 | Pass. The combined request lacks support; the cause is mixed. |
| S1c / `q-hist-quantum-preparedness-plan` | wrong (W/W/P) | wrong (W/W/W) | $0.2786756 | Pass. Votes reject shipped status, not the recovered source text. |
| S1c / `q-soroban-oz-upgradeable-macro` | wrong (W/W/W) | wrong (W/W/W) | $0.2513268 | Pass. Votes reject the retired API as current. |

Stage 1 passes: one higher score, four unchanged scores, and one lower score.

### Stage 2

A lower grade with a p8 pack cause blocks the result.
The plan classifies changes without an identified pack cause as judge variance.
That classification does not measure a statistical noise rate.

| Invocation / row | A score (votes) | B score (votes) | New cost | Reading |
|---|---|---|---:|---|
| S2a / `q-aas-list-token-on-exchanges-aggregators` | correct (C/C/C) | correct (C/C/C) | $0.2996132 | Pass. The panel score does not decrease; no blocking rationale appears. |
| S2a / `q-asset-stablecoin-issuers-discovery` | correct (C/C/C) | correct (C/C/C) | $0.3363792 | Pass. The panel score does not decrease; no blocking rationale appears. |
| S2a / `q-comp-cross-moneygram-partnership-sep24` | correct (C/C/C) | correct (C/C/C) | $0.2091572 | Pass. The panel score does not decrease; no blocking rationale appears. |
| S2a / `q-defi-arbitrage-pathpayment-bots` | correct (C/C/P) | partial (W/P/P) | $0.3563512 | Block. All B votes cite the newly shown StellarTerm contradiction. |
| S2a / `q-eco-pyusd-stellar-freshness` | correct (C/C/C) | correct (C/C/P) | $0.2022792 | Pass. The panel score does not decrease; no blocking rationale appears. |
| S2a / `q-edge-fresh-latest-scf-round` | correct (C/C/C) | correct (C/C/C) | $0.1538892 | Pass. The panel score does not decrease; no blocking rationale appears. |
| S2a / `q-mpp-discovery-and-modes` | correct (P/C/C) | correct (P/C/C) | $0.2440152 | Pass. The panel score does not decrease; no blocking rationale appears. |
| S2a / `q-raph-remove-scam-token` | correct (C/W/C) | correct (C/C/C) | $0.2417092 | Pass. The panel score does not decrease; no blocking rationale appears. |
| S2a / `q-scf-funding-by-category` | correct (C/C/C) | partial (P/P/C) | $0.3625232 | No identified p8 cause. The omitted date is absent from both packs. |
| S2a / `q-sep-43-web-wallet-api` | correct (C/C/C) | correct (C/C/C) | $0.1979752 | Pass. The panel score does not decrease; no blocking rationale appears. |
| S2a / `q-sor-cross-warmancer-zk-stack` | correct (C/C/C) | correct (C/C/C) | $0.2234012 | Pass. The panel score does not decrease; no blocking rationale appears. |
| S2a / `q-soroban-contract-build-verification` | correct (P/C/C) | correct (C/C/P) | $0.2832652 | Pass. The panel score does not decrease; no blocking rationale appears. |
| S2a / `q-ti-vocab-content-tags-live` | correct (C/C/C) | correct (C/C/C) | $0.1735252 | Pass. The panel score does not decrease; no blocking rationale appears. |
| S2b / `q-agent-identity-erc8004-stellar` | partial (P/P/P) | correct (P/C/C) | $0.2660668 | Allowed upgrade. Votes differ on implicit payment-proof coverage. |
| S2b / `q-protocol-27-cap-0071` | correct (C/C/C) | correct (C/C/C) | $0.3112492 | Pass. The panel score does not decrease; no blocking rationale appears. |
| S2b / `q-soroban-token-transfer-pattern` | correct (P/C/C) | correct (C/C/C) | $0.2890480 | Pass. The panel score does not decrease; no blocking rationale appears. |
| S2c / `q-hist-quantum-preparedness-plan` | correct (C/C/C) | partial (P/P/C) | $0.2866512 | No identified p8 cause. The missing variant names drive the partial votes. |
| S2c / `q-raph-withdraw-exchange-self-custody` | correct (C/C/P) | correct (C/C/C) | $0.2079432 | Pass. The panel score does not decrease; no blocking rationale appears. |
| S2d / `q-gap-leaderboard-project-not-builder` | correct (C/C/P) | partial (P/P/C) | $0.1787092 | No identified p8 cause. The same answer omission appears in A. |
| S2e / `q-pc-quantum-preparedness-dormant` | wrong (W/W/W) | partial (P/P/P) | $0.2993512 | Allowed upgrade. INRIA support returns; Stage 3 dating remains disputed. |

Stage 2 fails: two higher scores, 14 unchanged scores, and four lower scores.
Only the StellarTerm row has an identified blocking pack cause.

### Stage 3

Check for higher panel scores and false support from notices, labels, or entry numbers.
No panel score rises in this stage.

| Invocation / row | A score (votes) | B score (votes) | New cost | Reading |
|---|---|---|---:|---|
| S3a / `q-defi-bridge-evm-to-stellar-axelar` | partial (P/W/P) | partial (W/P/P) | $0.3254072 | Pass. The panel stays partial; route and safety caveats remain missing. |
| S3b / `q-ti-freighter-localhost-not-detected` | wrong (W/W/W) | wrong (W/W/W) | $0.2549892 | Pass. The HTTPS contradiction keeps the wrong grade. |
| S3c / `q-sor-force-fast-archival-localnet` | partial (P/P/P) | partial (P/E/P) | $0.4304572 | Pass. Two partial votes remain; the error vote abstains. |
| S3d / `q-scf-verified-members` | wrong (W/W/W) | wrong (W/W/W) | $0.2515792 | Pass. The voting-rights contradiction keeps the wrong grade. |
| S3d / `q-soroban-sdk-cve` | partial (P/P/P) | partial (P/P/P) | $0.2454352 | Pass. The third advisory remains missing. |
| S3d / `q-tool-sdk-repos-discovery` | partial (P/W/P) | partial (P/P/P) | $0.2890932 | Pass. Identity checks and per-repository labels remain missing. |

Stage 3 passes: all six panel scores stay unchanged.

## Source checks and changed scores

### Stage 1 support

[The offline replay](rr6-replay.json) reproduces the committed result, except for the current revision identifier.
It reports 12 of 12 supported disputed claims retained under its term-and-prose coverage definition.
That measure checks coverage, not the truth of each complete claim.
The replay also preserves all 131 stable prompts.

The Stablebonds pack contains the real maturity sentence.
It appears under `Etherfuse Aims to Bring 100 Sovereign Currencies Onchain`, execute entry 2.
The span says: “These treasuries often mature in 90 days or less.”
All three B votes accept this support and identify other missing facts.
See [the rebuilt pack](saved-data/rr6-S1a-B-q-defi-etherfuse-stablebonds-pack.txt:12).

The dormant-account pack contains INRIA and `1,193 logical qubits` in attributed source spans.
Both spans identify `Introducing the Quantum Preparedness Plan`, execute entry 4, `full[0].content`.
The saved record has the QPP stellar.org URL and the same paragraph.
No B vote assigns those figures to another document through an entry number.
See [the rebuilt pack](saved-data/rr6-S2e-B-q-pc-quantum-preparedness-dormant-pack.txt:16).

No Stage 1 B wrong claim calls recovered, supported text fabricated or absent.
The deploy, quantum, and OpenZeppelin rows retain separate golden contradictions.
The Blend upgrade cites actual source figures, not a notice.
However, B vote 1 still identifies the mixed-provider trend problem.
The Stage 1 pass does not establish that the complete Blend answer deserves a correct grade.

### RPC: P/W/P to W/W/W

The candidate joins `startLedger` and `pagination.cursor` in its claimed documentation example.
The golden forbids that combination.
A vote 2 already identifies this error.
All three B votes identify it again and also discuss the source examples.

The p8 pack shows a generic `exampleMethod` request with cursor and limit only.
It also shows a `getLedgers` request with `startLedger` and limit only.
Neither source example supports the candidate's combined request.
The saved transcript confirms these separate examples.
See [support units 35 and 43](saved-data/rr6-S1b-B-q-ti-rpc-gettransactions-pagination-xdr-pack.txt:78).

This has a mixed cause: an existing golden contradiction and newly visible source examples.
The artifacts cannot isolate their separate effects on the panel score.
The operator correctly avoids calling this pure judge variance.
The downgrade does not fail Stage 1's support rule.

### StellarTerm: C/C/P to W/P/P

The candidate's venue sentence includes:

> StellarTerm (classic SDEX UI), and Comet marked Inactive.

The full list joins several venues under that status statement.
The p8 pack shows a source item with title `StellarTerm`, slug `stellarterm`, and `status="Live"`.
Its source URL is `https://stellarlight.xyz/project/stellarterm`.
See [the source item](saved-data/rr6-S2a-B-q-defi-arbitrage-pathpayment-bots-pack.txt:94).

The original execute result contains the same name, slug, status, and URL.
It is the first execute result, at transcript array index 5.
The saved answer and source therefore disagree about StellarTerm's status.
The p6 pack does not show StellarTerm.
It instead shows the separate Zenex `Live` contradiction, which A vote 3 identifies.

All three B votes explicitly cite the StellarTerm source item against the candidate's statement.
The new source item provides a direct p8 cause for the lower score.
The plan already classifies this case as a regression under its literal rule.
It names “a span read as a contradiction” as an example of a blocking cause.
It supplies no exception for a correct contradiction.
The general aim of preserving evidence cannot supply an unstated exception after the result.

Thus, this is a rule-defined regression, despite the accurate evidence.
Changing this run to pass would change the rule after reading the data.
The operator correctly leaves it blocked.

### The other three Stage 2 downgrades

For SCF funding, B vote 1 applies the missing methodology-label requirement.
B vote 2 treats `2026-10-03` as fabricated because the compact pack omits it.
The saved source contains `snapshotAsOf: "2026-10-03T08:00:19.683Z"`.
Both p6 and p8 omit that date.
A vote 3 already notes the missing evidence but does not call the date wrong.

This is an existing omission with changed judge treatment, not a demonstrated p8 loss.
The report should retain that residual false-fabrication finding.

For the quantum control, both partial votes cite missing `ML-DSA-44/65` names.
The saved answer gives generic `ML-DSA` instead.
A votes acknowledge that same omission but accept it as minor.
B vote 1 also questions “committed/shipping,” with the candidate's CAP caveat.
No B vote uses the p7-style source contradiction.

The p8 pack retains both “immediately” and “expected to be able to” with their source records.
B vote 3 explicitly accepts that support.
See [the paired source spans](saved-data/rr6-S2c-B-q-hist-quantum-preparedness-plan-pack.txt:22).

For the leaderboard, both partial votes identify missing ecosystem developer aggregate information in the answer.
A vote 3 identifies that same omission.
Neither p6 nor p8 supplies the missing aggregate block.
Neither B partial rationale identifies a new pack contradiction or lost source.

The original attribution rule therefore treats these three movements as judge variance.
There is no measured variance rate, and no claim of statistical equivalence is justified.
A decision that needs stronger variance evidence requires a separately reviewed repeated comparison.

### Stage 2 upgrades and source labels

The identity row rises because two B votes accept implicit coverage of the payment-proof caveat.
The disputed caveat concerns the answer's wording, not an omission notice.
B vote 3 refers to “entries 10-17” as evidence locations.
It does not infer a different source identity from those numbers.

The dormant-account row rises after the pack restores the attributed INRIA text.
All three B votes still dispute the answer's Stage 3 “readiness targeted for 2027” statement.
B vote 3 also rejects the NIST timeline detail as unsupported.
The saved QPP paragraph contains the change from 2030 and beyond to `2029+`.
Neither compact pack retains that detail.
This is another remaining omission, not proof that p8 removes all false-fabrication judgments.

No B rationale cites `claimSupportNotice` as support.
The RPC reference to “item 43” locates a displayed example; it does not establish source identity.
I found no repeated p7-style source inference from an entry number.

## Disposition and prospective amendment

Keep this run recorded as blocked.
Do not remove the StellarTerm source item or change the saved answer to preserve its old grade.
The accurate contradiction justifies a general amendment for future measurements.
The amendment must assess evidence fidelity rather than require every older answer grade to survive.

I recommend this exact Stage 2 replacement:

> Review every lower arm-B panel score against the complete saved transcript and both packs.
> A lower score blocks acceptance when p8 loses relevant support, changes meaning, removes a necessary qualifier, or misattributes a source.
> A newly visible contradiction counts as an evidence correction only when the complete saved source directly contradicts the candidate claim.
> Confirm the entity, field, date, scope, and source identity.
> Check the complete transcript for relevant qualifications and competing support.
> Record the candidate claim, exact source text, both pack locations, and each relevant vote.
> An independently confirmed evidence correction does not block acceptance because its grade is lower.
> An unresolved cause blocks acceptance.
> Changes with no identified pack cause retain the predeclared variance classification, without a statistical variance claim.
> Keep every selected row and all individual votes in the result.
> Apply the unchanged Stage 1 support rule and Stage 3 false-upgrade rule.
> This amendment applies only to its separately declared future measurement.

The smallest prospective confirmation can use three new p8 calls for the StellarTerm row.
It must be a separately reviewed, fixed continuation, with a $0.85 file cap and no retry.
Reuse its p6 baseline only after the full prompt, model, rubric, panel, executable, and environment checks pass.
Retain the other 31 paired rows explicitly as reused evidence under their unchanged rules.
Retain both earlier StellarTerm panels as historical evidence; never replace or hide them.

The new result must identify one newly measured row and 31 reused rows.
It must not describe all 32 rows as a new experiment.

Predeclare that an accurate repeated downgrade can pass the amended rule.
A higher grade is not the target.
Review every new rationale for missing context, unsupported inference, and source identity.
An unresolved cause or new fidelity failure keeps the prospective result blocked.
A repeated panel alone cannot erase a demonstrated evidence defect.
This is a targeted confirmation of the fixed acceptance set, not a general accuracy estimate.

No new paid self-test is needed if the pack, prompt, rubric, and judge adapter remain unchanged.
A diagnostic-only filter fix must preserve every complete judge prompt byte for byte.
If judge inputs change, follow the existing rule: three new candidate calls for each changed row.
Include the seven-call self-test when the evidence pack or judging semantics change.
A changed identity pin requires a reviewed method amendment and a matched baseline.

The three-call minimum retains the original qualitative attribution for the other three downgrades.
If acceptance instead depends on measured variance, that minimum is insufficient.
Predeclare repeated matched panels for those rows, including fixed counts and decision rules, before spending.
Do not spend until a favorable grade appears.

## Diagnostic-only merge

The p8 implementation can merge as an isolated offline diagnostic after review findings are reconciled.
That path requires no paid call and does not clear p8 for judge inputs.
The active judge must retain the accepted input contract.
Verify complete prompt hashes for the affected rows, not only the pack version label.

The current branch is not isolated that way.
`eval/qa/evidence-pack.mjs:5` sets `PACK_VERSION` to `p8`.
`eval/qa/judge.mjs:438` calls its `buildTranscriptEvidencePack` directly.
Therefore, do not merge this branch unchanged while describing it as diagnostic-only.
Separate the offline implementation from active judge construction before that merge.
Alternatively, keep it unmerged until the prospective acceptance review clears judge use.

## R5-1 remains open

`packSourceEvidenceText` still retains the entire `provenance:` line and the `(+N more)` suffix.
A direct probe falsely accepts `18126` from a character counter as source support.
A second probe falsely accepts `20` from `(+20 more)`.
The 32 rebuilt p8 packs contain 13 retained provenance lines and 17 retained URL-count suffixes.

[The diagnostic comparison](rr6-diagnostic.mjs) tests the proposed R5 filtering change without changing tracked code.
[Its output](rr6-diagnostic.json) checks all 48 votes with wrong claims across both arms.
All 32 p8 pack strings remain byte-identical under that temporary diagnostic change.
One new B diagnostic result changes: StellarTerm vote 1.
It changes from `no-pack-omission` to `pack-omission` for `2026-10-08`.

That date comes from genuine `sourceMetadata` within the provenance line, not from a host counter.
Dropping the entire line removes the date along with the counters.
Thus, the proposed R5 fix can affect a new diagnostic result even when the judge inputs stay unchanged.
This does not repair the candidate's `Inactive` claim or change the blocking decision.
It also does not prove that the judge called a supported date fabricated.
The vote used the date while identifying the status contradiction.

Close R5-1 with a diagnostic-only change, fixtures, documentation, and refreshed offline results.
Define whether source metadata values count before removing the entire provenance line.
Exclude host counters under either policy.
Until then, inspect actual source text for numeric support claims.
Do not describe the diagnostic as counting source text only.

## Report corrections

The blocking verdict and total spend are confirmed.
The following record corrections do not change that verdict:

- Correct Stage 2 spend from $5.1232 to $5.1231.
- Correct the arm-A artifact directory from `raven-p7-arm` to `raven-p6-arm` in `results.md`.
- Update the ledger's stale opening status, which still says “not run.”
- Retain R5-1 and the new diagnostic comparison above.
- Record that this review completed the required reading of all individual rationales.

The operator explicitly skipped the full rationales for 14 unchanged Stage 2 rows.
The predeclared plan required every individual rationale in both arms.
This review completes that missing reading and finds no additional blocking pack cause.
The owner must reconcile these corrections before finalization.

POST-RUN: CONFIRMED
