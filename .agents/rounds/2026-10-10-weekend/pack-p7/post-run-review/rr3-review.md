# Post-run review: p6 versus p7

The p7 block is correct under the approved reading rule.
However, several supporting claims need correction.
The strongest new finding concerns support measurement: omission metadata can pass the support check without a source span.

I made no paid call and changed no tracked file.
I reviewed the 24 artifacts against the saved sources and both pinned worktrees.
I rebuilt all 64 packs and all 64 judge prompts.
Their hashes match the recorded artifacts.
Both arm worktrees are clean.
Both static judge self-tests passed.

The independent calculations are in [rr3-audit.json](rr3-audit.json).
The checking script is [rr3-audit.mjs](rr3-audit.mjs).
The script makes no model call.
The source manifest identifies each original artifact: [rejudge-artifacts.json](../rejudge-artifacts.json).

## Findings

### 1. The support check accepts omission metadata as support

The operator reports that p7 repairs support across all six Stage 1 rows.
That claim exceeds the evidence.

For `q-defi-etherfuse-stablebonds`, the p7 pack shows neither the maturity sentence nor a source span containing `90`.
Only `claimSupportOmitted` contains `"90 days" (entry=2)` and `"90" (entry=2)`.
The saved transcript contains the actual maturity sentence in execute entry 2.
It states that these treasuries often mature in 90 days or less.

`findTranscriptEvidencePackOmissions` searches the complete serialized pack at `eval/qa/evidence-pack.mjs:1216` and `:1220`.
It therefore counts the omission line as evidence.
Removing that line changes the replay check to `pack-omission`, with `omittedTerms: ["90"]`.
See [the rebuilt pack](saved-data/rr3-S1a-B-q-defi-etherfuse-stablebonds-pack.txt) and [the probe](rr3-support-probe.mjs).

The stored panel votes remain valid observations.
Both arms voted P/P/P and raised no unsupported-maturity objection.
Thus, this row passes the predeclared judge-behavior rule.
It does not demonstrate repaired source support.

The distinction also limits the headline about eight removed omission votes.
Stage 1 has eight arm-A omission votes and zero arm-B omission votes.
The full sample has nine arm-A omission votes, including one Stage 3 Axelar vote.
A zero diagnostic count does not prove that every supporting span survived.

Required correction: distinguish the Stage 1 behavior pass from actual source-span coverage.
Exclude omission metadata from coverage checks and rerun the offline support replay.

### 2. The dormant-account vote infers a false source distinction

For `q-pc-quantum-preparedness-dormant`, arm-B vote 2 uses `entry 4` to assign the INRIA figures to another source.
The operator correctly identifies the omission line as its apparent basis.
However, the review must also establish that this source inference is false.

Saved execute entry 4 contains `full[0].content`.
Its title is `Introducing the Quantum Preparedness Plan`.
Its URL is `https://stellar.org/blog/foundation-news/introducing-the-quantum-preparedness-plan`.
That same record contains INRIA, `1,193 logical qubits`, the `44%` reduction, and the NIST timeline change.
Entry 4 is another retrieval of the QPP source, not proof of another document.

The p7 pack omits that passage.
Its omission line lists the INRIA terms with `entry=4`.
Several visible QPP support units also use execute entry 4.
The judge confuses a transcript-entry number with source identity.
See [the saved input](saved-data/rr3-S2e-B-q-pc-quantum-preparedness-dormant-input.json) and [the rebuilt pack](saved-data/rr3-S2e-B-q-pc-quantum-preparedness-dormant-pack.txt).

The panel moves W/W/W to P/P/C.
Vote 2 uses the omission line to make an adverse claim, not an explicit positive justification.
Thus, the artifacts do not prove that the omission line caused the upgrade.
They also cannot establish that the omission line caused no false upgrade anywhere in this sample.
The narrower Stage 3 conclusion remains valid: none of its six panel scores increased.

Required correction: identify the false provenance inference and leave the upgrade cause unresolved.
Remove source-like omission details from judge input, or replace them with actual attributed spans.

### 3. The RPC downgrade is not established as pure judge variance

For `q-ti-rpc-gettransactions-pagination-xdr`, the panel moves P/W/P to W/W/W.
The answer combines `startLedger` and `pagination.cursor` in an example.
The golden rule already forbids that combination.
Arm-A vote 2 detects the same error.

However, arm-B vote 3 explicitly cites new pack evidence.
It cites a `getLedgers` example that pairs `startLedger` with `limit`, without `cursor`.
The p7 pack contains that example in support unit 21, at `p2[1].content`.
The p6 pack contains no `startLedger` text.
See [p6](saved-data/rr3-S1b-A-q-ti-rpc-gettransactions-pagination-xdr-pack.txt) and [p7](saved-data/rr3-S1b-B-q-ti-rpc-gettransactions-pagination-xdr-pack.txt).

This supports a possible pack contribution to one vote.
It does not establish that the pack caused the panel change.
The other two arm-B votes cite the answer-visible golden contradiction.
Report a mixed or unresolved cause, not an unqualified absence of a pack cause.
This is not a lost-support regression, and it does not fail Stage 1's support rule.

The leaderboard attribution is better supported.
Both packs lack an ecosystem developer macro block.
Both arms cite the same answer omission.
Neither arm-B rationale identifies lost or contradictory pack content.
Treat its C/C/P to P/P/P change as judge variance under the predeclared rule.
That label remains an attribution rule, not a measured noise estimate.

### 4. The quantum regression is real, but budget alone does not explain it

The Stage 2 quantum row uses the `2026-10-07T23-25-14` saved answer.
Its panel changes C/C/C to W/W/W.

The p6 pack contains this passage in claim snippet 7, selected through `term="Full"`:

> enabling enterprise wallets to migrate immediately

The text comes from the Decrypt record's `long_summary` in execute entry 2.
The p7 pack drops it.
Instead, support unit 3 includes:

> Enterprise wallets are expected to be able to move to quantum-safe signing in 2026 through Soroban contract accounts.

All three arm-B rationales use that difference when criticizing the answer's present-tense claim.
The plan therefore classifies this as a blocking pack regression.
See [p6](saved-data/rr3-S2c-A-q-hist-quantum-preparedness-plan-pack.txt) and [p7](saved-data/rr3-S2c-B-q-hist-quantum-preparedness-plan-pack.txt).

The operator's anchor explanation is substantially correct.
`immediately` produces no anchor.
The supporting sentence has no shared four-token phrase from the answer.
Its generic anchors receive coverage from other sentences.
The selector does not retain another sentence solely because it contains different support for the same claim.

The loss occurs before the final character-budget cuts.
I inspected the selected units at 440-character and 120-character span widths.
Neither set contains the lost passage.
At `maxChars: 100000`, the rebuilt pack has 26,736 characters and still omits it.
The [selection probe](rr3-probe.mjs) reproduces these results.
A larger budget alone is not an adequate repair.

The lost secondary-source summary supports the answer's wording.
It does not establish that the capability had actually shipped.
The answer still says `committed/shipping` beside Draft and Final Comment Period status.
A repair must preserve relevant evidence, not force the old correct grade.
Any change to the acceptance rule needs a reviewed amendment before another paid run.

### 5. The ledger gives the wrong cases hash for S3a

The ledger assigns one observed cases hash to all four worktree-mode invocations.
S3a uses the incomplete 20-row source and has this hash in both arms:

`7a3401a19f524e0a4f0d8f619c85aecf469cc5404da1d5b2fb7532fc33490017`

S1a, S2b, and S3b use the incomplete 94-row source and have:

`55831c3cd80f93316a5ca1dff2c8e5dc9e717ede1b70d4050d9742ebe162196f`

I recomputed both hashes through the source-case guard.
This is a ledger error, not an arm mismatch.
Correct the ledger's preflight paragraph.

## Completeness, costs, and pins

All 24 artifact hashes match the manifest.
All saved source hashes match their artifact references.
The selection contains all 32 planned rows, including the two different quantum answers.
Every row has three judge calls in each arm.
No call has an error verdict or a missing cost.
No invocation reached its cap or left an incomplete row.
Every sequential call authorization equals the invocation's remaining budget.

| Stage | Invocations | Calls | Reported spend | Enforced file-cap sum | Stage cap |
|---|---:|---:|---:|---:|---:|
| 1 | 6 | 36 | $3.7437984 | $9.90 | $11.00 |
| 2 | 10 | 120 | $10.6641646 | $32.70 | $34.00 |
| 3 | 8 | 36 | $3.7796848 | $10.00 | $10.00 |
| Total | 24 | 192 | $18.1876478 | $52.60 | $55.00 |

Arm A costs $9.0106882.
Arm B costs $9.1769596.
The maximum call costs $0.1810194, below $0.60.
The printed rounded totals in `results.md` are correct.

Both arms use `claude-sonnet-5`, rubric `v2.11`, and panel size 3.
Arm A is at `d15a4ce5`; arm B is at `7e00ede2`.
All before/after identity records match the expected binary and environment hashes.
The current versioned executable also matches the recorded binary hash.

- Binary: `c9b5341637becbd423ddffc5b254afb645682a3868cb708bbc6cc0e7bb419937`
- Environment: `ff926b437c1538395659ddf31b24d6268f61097ad4527eaf55738d0ccbe446ac`

All postflight checks passed.
The records show 16 revision-mode invocations with matching cases and eight expected worktree-mode mismatches.
All 32 arm-A pack hashes match the stored p6 hashes.
All rebuilt packs fit the 12,000-character limit.

These checks support the recorded local identities.
They cannot independently prove the operator's historical shell commands or the remote model's internal revision.
No artifact supplies a complete shell-command transcript.

## Row-by-row reading

C means correct, P means partial, and W means wrong.
Each vote sequence lists all three calls in order.
The score follows majority voting; no panel has a three-way tie.
The tables give costs for arm A and arm B.
The appendix gives both pack hashes and every support-check status.

### Stage 1

| Row | A score (votes) | B score (votes) | Cost A / B | Reading |
|---|---|---|---:|---|
| `q-defi-etherfuse-stablebonds` | partial (P/P/P) | partial (P/P/P) | $0.2952492 / $0.3170532 | Behavior pass; maturity support exists only in omission metadata. |
| `q-edge-fresh-latest-blend-tvl` | wrong (W/P/W) | correct (C/C/C) | $0.3329572 / $0.3762170 | Support pass; upgrade cites shown TVL figures, not omission metadata. |
| `q-sor-deploy-invoke-from-js-sdk` | wrong (W/W/W) | wrong (W/W/P) | $0.3413140 / $0.3389792 | Support pass; builder-signing inconsistency keeps the wrong grade. |
| `q-ti-rpc-gettransactions-pagination-xdr` | partial (P/W/P) | wrong (W/W/W) | $0.3153568 / $0.3755100 | Support pass; downgrade has a possible pack contribution. |
| `q-hist-quantum-preparedness-plan` | wrong (W/W/P) | wrong (P/W/W) | $0.2671690 / $0.2935240 | Support pass; Draft-versus-shipped contradiction remains. |
| `q-soroban-oz-upgradeable-macro` | wrong (W/W/W) | wrong (W/W/W) | $0.2317512 / $0.2587176 | Support pass; retired API remains a golden contradiction. |

### Stage 2

| Row | A score (votes) | B score (votes) | Cost A / B | Reading |
|---|---|---|---:|---|
| `q-aas-list-token-on-exchanges-aggregators` | correct (C/C/C) | correct (C/C/C) | $0.3091824 / $0.3023694 | No panel regression; both panels unanimously vote correct. |
| `q-asset-stablecoin-issuers-discovery` | correct (C/C/C) | correct (C/C/C) | $0.4694822 / $0.3798356 | No panel regression; both panels unanimously vote correct. |
| `q-comp-cross-moneygram-partnership-sep24` | correct (C/C/C) | correct (C/C/C) | $0.2326240 / $0.2406792 | No panel regression; both panels unanimously vote correct. |
| `q-defi-arbitrage-pathpayment-bots` | correct (C/C/P) | correct (C/C/C) | $0.3143254 / $0.3030652 | No panel regression; one A vote objects to Zenex status. |
| `q-eco-pyusd-stellar-freshness` | correct (C/C/C) | correct (C/P/C) | $0.2119232 / $0.2034932 | No panel regression; one B vote notes an entity-disclosure omission. |
| `q-edge-fresh-latest-scf-round` | correct (C/C/C) | correct (C/C/C) | $0.1603914 / $0.1503352 | No panel regression; both panels unanimously vote correct. |
| `q-mpp-discovery-and-modes` | correct (P/C/C) | correct (C/C/P) | $0.2506816 / $0.2576472 | No panel regression; both panels split over the x402 adapter distinction. |
| `q-raph-remove-scam-token` | correct (C/W/C) | correct (C/C/C) | $0.2041312 / $0.2023112 | No panel regression; one A vote objects to an unconditional burn statement. |
| `q-scf-funding-by-category` | correct (C/C/C) | correct (C/C/C) | $0.3554368 / $0.4063384 | No panel regression; both panels unanimously vote correct. |
| `q-sep-43-web-wallet-api` | correct (C/C/C) | correct (C/C/C) | $0.2047942 / $0.2072332 | No panel regression; both panels unanimously vote correct. |
| `q-sor-cross-warmancer-zk-stack` | correct (C/C/C) | correct (C/C/C) | $0.2489344 / $0.2449136 | No panel regression; both panels unanimously vote correct. |
| `q-soroban-contract-build-verification` | correct (P/C/C) | correct (C/C/C) | $0.2544532 / $0.3155336 | No panel regression; one A vote requests the metadata command. |
| `q-ti-vocab-content-tags-live` | correct (C/C/C) | correct (C/C/C) | $0.1977332 / $0.1715652 | No panel regression; both panels unanimously vote correct. |
| `q-agent-identity-erc8004-stellar` | partial (P/P/P) | partial (P/P/C) | $0.2684560 / $0.3148532 | No panel regression; payment-proof caveat remains missing. |
| `q-protocol-27-cap-0071` | correct (C/C/C) | correct (C/C/C) | $0.3079332 / $0.3417712 | No panel regression; both panels unanimously vote correct. |
| `q-soroban-token-transfer-pattern` | correct (P/C/C) | correct (C/C/C) | $0.3002024 / $0.2839376 | No panel regression; one A vote requests the contract-own-balance example. |
| `q-hist-quantum-preparedness-plan` | correct (C/C/C) | wrong (W/W/W) | $0.2866252 / $0.3065050 | Blocking pack regression; lost supporting sentence. |
| `q-raph-withdraw-exchange-self-custody` | correct (C/C/P) | correct (C/C/C) | $0.1966772 / $0.2138874 | No panel regression. |
| `q-gap-leaderboard-project-not-builder` | correct (C/C/P) | partial (P/P/P) | $0.1811992 / $0.1725192 | Lower panel score; judge variance under the plan. |
| `q-pc-quantum-preparedness-dormant` | wrong (W/W/W) | partial (P/P/C) | $0.3215892 / $0.3685952 | Upgrade cause unresolved; vote 2 infers false source identity. |

### Stage 3

| Row | A score (votes) | B score (votes) | Cost A / B | Reading |
|---|---|---|---:|---|
| `q-defi-bridge-evm-to-stellar-axelar` | partial (P/W/P) | partial (P/P/P) | $0.3701792 / $0.3239532 | Pass; no panel upgrade. Missing RFQ comparison remains. |
| `q-ti-freighter-localhost-not-detected` | wrong (W/W/W) | wrong (W/W/W) | $0.2577932 / $0.3045276 | Pass; no panel upgrade. HTTPS recommendation remains disputed against the golden. |
| `q-sor-force-fast-archival-localnet` | partial (P/P/P) | partial (W/P/P) | $0.4867332 / $0.3820652 | Pass; no panel upgrade. Core testing controls remain missing. |
| `q-scf-verified-members` | wrong (W/W/W) | wrong (W/W/W) | $0.2700012 / $0.2562832 | Pass; no panel upgrade. Verification and voting rights remain confused. |
| `q-soroban-sdk-cve` | partial (P/P/P) | partial (P/W/P) | $0.2485032 / $0.2634212 | Pass; no panel upgrade. Third advisory remains missing. |
| `q-tool-sdk-repos-discovery` | partial (P/W/P) | partial (P/P/P) | $0.3169052 / $0.2993192 | Pass; no panel upgrade. Identity verification and activity dates remain incomplete. |

Stage 1 has one upgrade, four unchanged scores, and one downgrade.
Its narrow behavior rule passes, but the claim of complete support repair does not.
Stage 2 has 17 unchanged scores, one upgrade, and two downgrades.
The quantum pack regression blocks p7 under the plan.
Stage 3 has six unchanged scores and no upgrades.
It passes its predeclared rule.
Panel disagreement occurs in 12 arm-A rows and eight arm-B rows.

## Smallest acceptable general repair

Keep the single forward pack implementation and assign the repaired pack a new version.
Do not preserve p6 through a compatibility path.
Do not add case IDs, quantum-specific words, or hand-selected source sentences.

I would accept these bounded changes:

1. Add a fallback for claim words that current anchors do not cover.
   Compare answer claims with related source sentences using discriminative words, including lowercase words.
   Reward new claim-word coverage rather than repeated coverage of names or shared phrases.
   Keep exact source spans and record identity.
   Preserve differing relevant source statements without deciding which statement is true.
2. Move omitted anchor text and entry lists to audit-only metadata.
   Keep at most a general incomplete-evidence notice in the judge pack.
   Compute support diagnostics from rendered source spans and source fields only.
   Exclude anchor labels, omission lists, headings, and counters from evidence coverage.
3. Confirm that the final budget keeps the required source context.
   Recover the Stablebonds maturity sentence and the dormant-account INRIA paragraph with their actual source identities.
   Recover the quantum support sentence beside the differing primary-source wording.
   Keep the 12,000-character limit.

A budget increase alone fails the demonstrated selection defect.
Removing entry numbers alone leaves the support-check defect.
Additional warning text does not resolve either mechanism.

Use general fixtures with changed names and numbers.
Cover a lowercase paraphrase, repeated names across sources, and two retrievals of the same source.
Test that an omission label cannot satisfy a support check.
Retain controls for unrelated records, fabricated claims, and budget pressure.

## Minimal re-measurement

First run the corrected offline replay across all 11 omission rows and the stored control inventory.
Separate source-span coverage from the judge's grade.
Verify all 131 stable prompts remain identical.
Check the full candidate prompt changes, not only pack lengths or token counts.
Run the required code checks and obtain independent review before paid work.

The existing arm-A verdicts can serve as the fixed p6 baseline.
They already use `v2.11` and the same saved answers and case inputs.
Reuse requires identical full p6 prompts, model, rubric, panel contract, executable, and environment pins.
Do not reuse the old `v2.10` stored verdicts as the baseline.
Any judge-prompt or rubric change requires a new matched arm A for affected comparisons.
A changed executable or environment requires a reviewed method amendment.

For the repaired candidate, rerun panel 3 for every selected row whose complete judge prompt changes.
Retain old arm-B verdicts only where the complete prompt remains byte-identical.
Keep all 32 rows in the result and report which candidate verdicts were reused.
This needs `3 × changed rows` calls, at most 96 candidate calls.
A complete candidate rerun has the existing one-arm file-cap envelope of $26.30.

Repeat all three stage readings, including every individual rationale.
Require real spans for the previously supported claims.
Review the Stablebonds and dormant-account findings explicitly.
Keep the existing Stage 3 false-upgrade controls.
Do not stop after the single quantum row improves.

The run-evals skill also requires the seven-call paid behavior self-test when the evidence pack changes.
Include those calls in the reviewed authorization and cost cap.
No further paid call was made during this review.

The previous arm-A observations do not create an identical-input noise estimate.
If the new result depends on resolving a variance claim, predeclare a small repeated comparison for that row.
Do not rerun selectively until a desired grade appears.

## Per-row pack hashes and support checks

The values below come from the independent rebuild and raw call records.
`O` means `pack-omission`; `N` means `no-pack-omission`; `-` means the call has no support-check field.
These statuses are observations from the current diagnostic, with the limitation in finding 1.

| Invocation / row | Arm | Pack SHA-256 | Support checks |
|---|---|---|---|
| S1a / `q-defi-etherfuse-stablebonds` | A | `5ba37a8ab940aba50632c9faa8d1131b307e7ea4ebdb037778acf4f8dc4eb271` | -/-/- |
| S1a / `q-defi-etherfuse-stablebonds` | B | `6503dba18cf833f594683dbc1e4a01d22387fb763418f8a1a8160e43d25ff5a7` | -/-/- |
| S1b / `q-edge-fresh-latest-blend-tvl` | A | `1dedf51305054d662df4c838e1ee97c595dc9f530ddcb88389728c68aefb60bc` | -/-/O |
| S1b / `q-edge-fresh-latest-blend-tvl` | B | `c532238a334e4fa2b5b9fe53afb7d328926bb0c2525c034d8d9235e3f4b1ea6c` | -/-/- |
| S1b / `q-sor-deploy-invoke-from-js-sdk` | A | `ed38f9fa13966550ce6f826a72534ee7cea50d4b8991c397dd4b5953c1a9fce0` | O/O/O |
| S1b / `q-sor-deploy-invoke-from-js-sdk` | B | `e399cac7179ebdd0bc15995eb6299b3426f5cc7328fbfbccabb16cc12c11a575` | N/N/- |
| S1b / `q-ti-rpc-gettransactions-pagination-xdr` | A | `7926739da93e31f8f323c9af8d3108335c0787c7a45499acf098ebd8b178cb25` | -/O/- |
| S1b / `q-ti-rpc-gettransactions-pagination-xdr` | B | `2f9fb8f145de47e17a00418e9dd98c99ce584ad0dece88ef44422b1b27fd71e9` | N/N/N |
| S1c / `q-hist-quantum-preparedness-plan` | A | `c2a605e968d48e741e6975c009a74fe397bc9a1cf5d1b7b2e223457409637859` | O/N/N |
| S1c / `q-hist-quantum-preparedness-plan` | B | `e4079c24db9727d58450c3a73f4bc972b15bf4c837dc0a84cbdfc20136cf6f4f` | N/N/N |
| S1c / `q-soroban-oz-upgradeable-macro` | A | `09b8dee0d1c772a1d17373cbe0b3b5d87d8b5b32c4d652e6847c067983659849` | O/-/O |
| S1c / `q-soroban-oz-upgradeable-macro` | B | `c039268c49193a40fe90184bb8d13446d7cb651744adef55cb1878b373149d58` | N/N/N |
| S2a / `q-aas-list-token-on-exchanges-aggregators` | A | `b4ed76b2a5ca5c98fec35917b0eed3cd2b4e0dc2dba38abde3f4f751bda76154` | -/-/- |
| S2a / `q-aas-list-token-on-exchanges-aggregators` | B | `a6f67824ee9a9a815766b85eee86796ca91f11d3403d33d80b2f0612b243d7cf` | -/-/- |
| S2a / `q-asset-stablecoin-issuers-discovery` | A | `33f18272a6a788c7b6755eec55fc44b5f184e87bb778fdf9bdadf3d7f2108337` | -/-/- |
| S2a / `q-asset-stablecoin-issuers-discovery` | B | `afcf117f1eaaf8e5093b78667487f5112ad4d09270276da6e034e4bdbb70048e` | -/-/- |
| S2a / `q-comp-cross-moneygram-partnership-sep24` | A | `74cb2f08631365fbdf81cd981efd62862759b60da161fafc566c2f135d72ec2c` | -/-/- |
| S2a / `q-comp-cross-moneygram-partnership-sep24` | B | `783b77ed47e5eddfc7f12ab13c41a975f59337b2406f95f49c83cddfe271c122` | -/-/- |
| S2a / `q-defi-arbitrage-pathpayment-bots` | A | `76eec18f8cecd31e1fa7cdd3c68a6f3d85dfe1c42e0cce76a2a09903a3f6ebe8` | -/-/N |
| S2a / `q-defi-arbitrage-pathpayment-bots` | B | `6525f36bbab0fa4b68710b5182ee449232f570419f631106cec03a055c195d77` | -/-/- |
| S2a / `q-eco-pyusd-stellar-freshness` | A | `e12be535542023155f96b14f1746d73124ab844ff7321884518ec9cb1bd3462f` | -/-/- |
| S2a / `q-eco-pyusd-stellar-freshness` | B | `4198e55cd160a911cd81c0a0e2aabc88389a32eba513e123e365776ff0ae4a40` | -/-/- |
| S2a / `q-edge-fresh-latest-scf-round` | A | `518a568b67e1e820269ce7dd60a46d412750fa8d5fc34a1e643c6774d8e66154` | -/-/- |
| S2a / `q-edge-fresh-latest-scf-round` | B | `2554da33871169f224fafc7c84634827328515dacc59d3939ba56c7d1b284d4a` | -/-/- |
| S2a / `q-mpp-discovery-and-modes` | A | `bcb183f49f5de8164e1c0a5ad4c57a112ada40c31158cede16e5d99e60061f0b` | -/-/- |
| S2a / `q-mpp-discovery-and-modes` | B | `f9a0a7f489a9d9481f701f4f96e5f6c59c9b2bc16b14dddbb69c1e111ca3e1a3` | -/-/- |
| S2a / `q-raph-remove-scam-token` | A | `c550f03dcdab8470332f84779b57377ed447b3bf935365ee48258a9c26f51aa6` | -/N/- |
| S2a / `q-raph-remove-scam-token` | B | `794a0d7f0b2bcbd28b6e00f2b23cdfb2bcc1f9e83715a40ebf090412435676af` | -/-/- |
| S2a / `q-scf-funding-by-category` | A | `0d25f2f9dd60ea5027197801d89227ea1c269e4a4f90616c19bc6c28122dd1e9` | -/-/- |
| S2a / `q-scf-funding-by-category` | B | `a71ee65475c533839ca9c64423432e51a6dfaf6a9285a7fac09a81fe8ad98efa` | -/-/- |
| S2a / `q-sep-43-web-wallet-api` | A | `db5c5a4dc79d3d6a2943b4f4008e5cfaf0edf1897e37a98b7c05727de4909b3a` | -/-/- |
| S2a / `q-sep-43-web-wallet-api` | B | `538cdf275e6edc72cc61d19439e5d75781a9fba3e49beac9ae4f2183e7a88c09` | -/-/- |
| S2a / `q-sor-cross-warmancer-zk-stack` | A | `57c44286b4fdb7ef160f276198b1c7a1d9f2791bdb63a38a75d09fdf891f5e85` | -/-/- |
| S2a / `q-sor-cross-warmancer-zk-stack` | B | `b89e120119ada618c5d397962a2edc1534462fc3db8057d853859fd8f55df089` | -/-/- |
| S2a / `q-soroban-contract-build-verification` | A | `dd67b4b6481fc3b07e04c9d66575f93272d2e8c71f932248551de4b7179db7e2` | -/-/- |
| S2a / `q-soroban-contract-build-verification` | B | `17a6114361ebe52eb5b19dae9a4240ad237852b17d1fc647742bbd62a3cda2b8` | -/-/- |
| S2a / `q-ti-vocab-content-tags-live` | A | `721f5839a45d4e89e9e0e068ed4ae071f3e96a2529b4eb9c1c29fea8452c5e68` | -/-/- |
| S2a / `q-ti-vocab-content-tags-live` | B | `668ac809c3ac38b90fa00416ff957122550ba564ed861f15ce429fad40c76637` | -/-/- |
| S2b / `q-agent-identity-erc8004-stellar` | A | `6e14dab26b6855055626ab91cb9f6b679e13d720f616d8600376bf7cbacedbac` | -/-/- |
| S2b / `q-agent-identity-erc8004-stellar` | B | `cc0430ee105cf117597d67bcd3d97c2a940c2c3e3b6423e24e1ed31085679203` | -/-/- |
| S2b / `q-protocol-27-cap-0071` | A | `d393b45c9adaba39ce009c3ec840f7a281cdc02ca49d881deacf5b1e585bbc92` | -/-/- |
| S2b / `q-protocol-27-cap-0071` | B | `5bae0d8f29fa44e12434dbc0c7f5a13ef7f9ec13ecff3af61c82cb313e55f4ca` | -/-/- |
| S2b / `q-soroban-token-transfer-pattern` | A | `60880f3d236c7e9801e6233617a8d47fa0f0f6d8ce4e865392ed708e2fd21e38` | -/-/- |
| S2b / `q-soroban-token-transfer-pattern` | B | `ab915d9261c1b3279d62803e9bca0322805812779f90963f433616f228037f49` | -/-/- |
| S2c / `q-hist-quantum-preparedness-plan` | A | `8b7da2df987128984fc2ec11901e32ead2323722c68b3a74f720eede3d316cd6` | -/-/- |
| S2c / `q-hist-quantum-preparedness-plan` | B | `9066456116ed46dfc4d4f8441ecdbd07ed913cd444e622aebce1f86b2f944bf9` | N/N/N |
| S2c / `q-raph-withdraw-exchange-self-custody` | A | `bd6e065ac6697d23d190900533cd5dbbb1a6ef0b3541a26949319ef37f2272f7` | -/-/- |
| S2c / `q-raph-withdraw-exchange-self-custody` | B | `a283ead5e39e8c1d1f8e68c53ae4f2acd7be5b69c61141c4e9cceb9c0e84b3c2` | -/-/- |
| S2d / `q-gap-leaderboard-project-not-builder` | A | `5701999cb936c792146ec50280695ad82197836e81f8d4998b814aa575c3fe5f` | -/-/- |
| S2d / `q-gap-leaderboard-project-not-builder` | B | `01fb2bf3b898e2691ccc0f033c3119e13e4dac48f048947e73ce900dcc177533` | -/-/- |
| S2e / `q-pc-quantum-preparedness-dormant` | A | `fdb39ff5c436a69c1c38b062a88b6ac9684d1287bfb8b892007964dc807c25b9` | N/N/N |
| S2e / `q-pc-quantum-preparedness-dormant` | B | `ac319f5a4138e406a3d70b8c3f0b72355a621f0a6979b7d614b044172ecd1b9f` | N/N/- |
| S3a / `q-defi-bridge-evm-to-stellar-axelar` | A | `8fbd6bc7d34481dda8545dbff2586de626ba0c2466eba1d125e3d5d183dbefbe` | -/N/O |
| S3a / `q-defi-bridge-evm-to-stellar-axelar` | B | `396a8188ca0668af82192029e7eab758bbab14c79e17cb2c31832a7347177cfb` | -/-/- |
| S3b / `q-ti-freighter-localhost-not-detected` | A | `649b71001191115833ed832f36ec80bdab631a20c0da4f7d92780a9fcfc23a47` | N/N/N |
| S3b / `q-ti-freighter-localhost-not-detected` | B | `f81944d8e4ec84ab8a3c4aad9ad8f46619792648d93a34415ff4267c3b9cf777` | N/N/N |
| S3c / `q-sor-force-fast-archival-localnet` | A | `72dce8c1ae07704a0b35800d7d5993df416005cd4992aaaa4688c89b7a5b22a1` | -/-/- |
| S3c / `q-sor-force-fast-archival-localnet` | B | `df51ff56c96640c139c2ea6f618d56b70ddd08fab060aa3cc84d140f28e7be2c` | N/-/- |
| S3d / `q-scf-verified-members` | A | `97d7a6e33100b9f1230a7eb678e85222c637f4340eceb2738c15e1d07daf0eb8` | N/N/N |
| S3d / `q-scf-verified-members` | B | `19c43c77fdb8b15efb6ff4c1f606a28a21e64618bb88e13fd5fef1d0b04eed83` | N/N/N |
| S3d / `q-soroban-sdk-cve` | A | `90a5c679ff6863c576c86e29ff325bcf075cf30a402ddef18c916a13a33377e5` | -/-/- |
| S3d / `q-soroban-sdk-cve` | B | `29f658c31e044c2b01a242e4ac3db9d4a138130aecc522a5f1b118153fea5de3` | -/N/- |
| S3d / `q-tool-sdk-repos-discovery` | A | `70241a7b485e2619d82c96f3c4f0cb1b3149562095370e7dc67a5942d3866ff0` | -/N/- |
| S3d / `q-tool-sdk-repos-discovery` | B | `8cf685bb5f4a91b9494778ae4606b32e93ea2cbd90ff510ee11f967188a385ba` | -/-/- |

POST-RUN: DISPUTED: support-repair claim; dormant-source attribution; RPC variance attribution; quantum selection mechanism; S3a ledger hash.
