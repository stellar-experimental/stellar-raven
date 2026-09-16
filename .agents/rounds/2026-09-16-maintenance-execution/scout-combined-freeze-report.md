# Scout issue #141 combined candidate freeze

Date: 2026-09-16

Status: **FROZEN FOR INDEPENDENT REVIEW. NOT ACCEPTED.**

The candidate improves every strict aggregate lane against the recorded accepted baseline.
The original focused checks pass, but final acceptance remains pending.
Two extra mixed-intent RWA controls still capture `scout.getRwaAssets`.
The full unit suite has 19 failures.
The unchanged routing gate reports three upper-band improvements and a manifest hash mismatch.
No source, operation, count, schema, or gate acceptance changed.

## Frozen candidate identity

- Worktree: `/tmp/raven-execution-2026-09-16/drift-combined-accepted`
- Branch: `fix/scout-routing-accepted-main`
- Base and `HEAD`: `bb37bc502080c94c3f3b5223ffcdf584d4b0e29d`
- Base includes accepted PR157 and the accepted Scout source filter.
- Working tree: uncommitted
- Tracked binary diff SHA-256: `444dc190ba46be36c24bd233a4424375dd76ba9d158e46922e6b072ea22e768f`
- Accepted-policy manifest SHA-256: `bc91f286b8c750a7c551253a84840d2c8e2634fb9e86db939f93b1eb13a5d361`
- Experimental RWA-inclusive manifest SHA-256: `79a2c66308c9daf7458063eff2068987022b42c71ea08326bb3c8d65d81c19ba`

The frozen rejected worktree remains at `/private/tmp/raven-execution-2026-09-16/drift`.
I did not edit the primary worktree or any parent-owned metadata.

## Exact implementation

The candidate adds the following general mechanisms.

1. `extractRoutingPhrases` keeps complete source phrases under a 256-token cap.
2. The cap allocator alternates source edges within each field and rotates across fields.
3. Only `searchResearch` exceeds the current cap at 426 content tokens.
4. The allocator retains the first and last phrase from all four routing fields for that operation.
5. The candidate stores positive phrases and source-left-side `notFor` clauses separately.
6. Arrow targets never become negative evidence.
7. Prefix matching requires four characters and a 0.75 length ratio.
8. The same matcher handles plural normalization in scoring and selection.
9. A routing-only admission needs two tokens from one coherent source phrase.
10. One deduplicated routing-token union adds one score delta.
11. Repeated and overlapping phrases cannot add repeated weight.
12. One schema token can contribute only after base admission.
13. Two schema tokens can supply independent admission evidence.
14. A source negative wins a tie or a one-token positive lead.
15. An operation with exclusions needs two positive tokens or an identity token.
16. Exact operation identifiers still resolve through their identity tokens.
17. Controlled-vocabulary admission uses source description markers and operation identity.
18. One strong backfill can replace a weak result only while reducing a service overflow.
19. Full-page intent preservation can select from either scoring tier.
20. A targeted full-page admission does not expand the reported gated `total`.
21. Two complete input-enum values from distinct properties can admit an operation.
22. An explicit source `notFor` rejection still wins before enum admission.

The accepted-policy candidate excludes `GET /api/rwa`.
It also preserves the accepted exclusions for quality, verify, feedback, and partner operations.

The final builder preserves all accepted PR157 contracts.
It imports and applies `skillDescription`.
It imports and calls `assertSkillDescriptionOverrideIdsResolve`.
The 21:33:35 RWA run predates this restoration and is not final evidence.

## Review comments reconciled

### Full-page admission and `total`

`preserveIntentWithinServiceQuota` receives gated and backfill candidates.
This permits a structurally proven vocabulary result on a full page.
The reported `total` stays equal to the gated candidate count on that page.

A gated-only experiment failed two controlled-vocabulary checks.
It missed the long category query and `directory project categories list`.
The frozen test asserts the current contract.
The long category query returns `lumenloop.get_categories` as a backfill hit.
That page reports `total=6` and `truncated=true`.

### Positive admission without a matched negative

The source filter applies to every operation that publishes a `notFor` contract.
It can reject a query even when no negative clause gets two matches.
The operation must then have two positive phrase tokens or an identity token.
Fresh tests keep `scout.explainRepo` and `scout.searchResearch` first on exact identifiers.

### Extraction order at the cap

The uncapped path preserves source order.
The capped path alternates the first and last phrases before moving inward.
This prevents a long early list from hiding all source-tail examples.
The current inventory has one capped operation, `searchResearch`.
The frozen unit test records the source-edge rule.

### Strong backfill rule

`preserveStrongBackfill` does not perform a quota-neutral swap.
It permits one replacement only when the victim service exceeds its quota.
The code comment now states this exact rule.

### Input-enum admission

The filter now accepts complete enum values from two distinct input properties.
It uses input schemas only and never reads response-schema keywords.
Adjacent query tokens can match one compact enum value, such as `LatAm` and `latam`.
The rule restores `scout.getPartners` for `LatAm asset issuers services`.
Fresh negatives reject one-property, incomplete-value, and explicit `notFor` evidence.

## Variant map and measurements

The recorded accepted gate totals are the acceptance reference.
They are `213/279/312`, `90/110/116`, `16/23/23`, and `10/22/26`.
The recorded holdout has 11 forbidden captures and 21 passing cases.

| Variant | Exact artifact | Legacy | Extended | Skills | Holdout aggregate | Forbidden | Passed |
|---|---|---:|---:|---:|---:|---:|---:|
| Recorded accepted policy | `eval/gates.json` in base | 213/279/312 | 90/110/116 | 16/23/23 | 10/22/26 | 11 | 21 |
| Accepted-manifest control rerun | `routing-2026-09-16T21-19-26-724Z.json` | 213/280/314 | 90/111/116 | 16/23/23 | 10/22/27 | 11 | 21 |
| Source-only drift | `routing-2026-09-16T21-38-54-587Z.json` | 212/281/315 | 90/109/115 | 16/22/23 | 11/23/28 | 10 | 23 |
| Code-only frozen scorer | `routing-2026-09-16T21-45-27-385Z.json` | 217/291/321 | 90/112/117 | 16/23/23 | 11/23/29 | 10 | 24 |
| Combined accepted-policy candidate | `routing-2026-09-16T21-42-30-893Z.json` | 217/297/327 | 93/111/117 | 17/23/23 | 12/27/29 | 10 | 24 |
| RWA-inclusive experiment | `routing-2026-09-16T21-42-48-623Z.json` | 217/295/326 | 92/111/117 | 17/23/23 | 12/27/29 | 9 | 25 |

The 21:42:30 result is the corrected combined accepted-policy candidate.
The 21:45:27 result is the code-only variant against manifest `0cff03fd...`.
Neither result represents the RWA-inclusive experiment.
The 21:42:48 result is the corrected full RWA-inclusive experiment.
It uses manifest SHA-256 `79a2c663...` and the same frozen code.
The 21:33:35 result is a pre-restoration diagnostic only.

The source-only variant uses the accepted scorer with required phrase forwarding.
It loses `1/-2/-1` in extended top-three lanes against the control rerun.
The combined candidate repairs that loss to `93/111/117`.

The accepted-policy candidate changes 307 of 495 non-holdout ranked lists.
The split is 224 legacy, 60 extended, 12 skills, and 11 protocol rows.
Source-only drift changes 140 lists.
Code-only routing changes 151 lists.
The RWA-inclusive experiment changes 314 lists.
The split is 229 legacy, 61 extended, 13 skills, and 11 protocol rows.

Ranked artifacts:

- Accepted control: `/tmp/raven-execution-2026-09-16/drift-accepted-baseline-ranked.json`
- Source-only: `/tmp/raven-execution-2026-09-16/scout-final-source-only-ranked.json`
- Code-only: `/tmp/raven-execution-2026-09-16/scout-final-code-only-ranked.json`
- Combined: `/tmp/raven-execution-2026-09-16/scout-final-accepted-policy-ranked.json`
- RWA-inclusive: `/tmp/raven-execution-2026-09-16/scout-final-rwa-inclusive-ranked.json`

## Strict top-one movement

The combined candidate has 12 legacy improvements and eight legacy regressions.
It has three extended improvements and no extended regressions.
It has one skills improvement and no skills regression.

The eight strict legacy regressions need independent intent review.

| Case | Accepted top | Candidate top | Assessment |
|---|---|---|---|
| `q-builder-by-scf-tier` | `scout.getBuilders` | `lumenloop.find_similar_scf_submissions` | Residual wrong layer for a builder roster. |
| `q-comp-yieldblox-oracle-incident` | `scout.searchResearch` | `stellarDocs.search_docs_in_category` | Residual top-one loss. Scout remains in the top five. |
| `q-eco-defi-projects-discovery` | `scout.searchProjects` | `skills.lumenloop.stellar-integration-finder` | Residual wrong layer for a directory request. |
| `q-eco-dex-saturation` | `scout.compareHackathons` | `skills.lumenloop.stellar-ecosystem-digest` | Both labels are indirect. Independent review must choose intent. |
| `q-protocol-24-whisk-incident` | `stellarDocs.search_protocol_concepts_docs` | `scout.searchResearch` | The candidate follows the new history source contract. |
| `q-protocol-version-history-list` | `stellarDocs.search_protocol_concepts_docs` | `scout.searchResearch` | The candidate follows the new chronology source contract. |
| `q-scf-nqg-voting` | `scout.searchResearch` | `skills.lumenloop.scf-submission-radar` | Residual wrong layer for governance history. |
| `q-soroban-instance-storage-dos` | `scout.searchResearch` | `stellarDocs.search_docs_in_category` | The candidate favors implementation documentation. |

The three extended improvements route tax export, fee setting, and TTL questions to Docs.
No extended case changes from a correct top-one result to an incorrect result.

## Eleven unchanged acceptance checks

These are focused results, not a final acceptance verdict.
The independent reviewer must still decide the numeric baseline and failing-test effects.

| Check | Result | Evidence |
|---:|---|---|
| 1 | PASS | YieldBlox and Reflector intent remains in the top five. |
| 2 | PASS | `through`, `network`, `each`, and `walk through` do not route alone. |
| 3 | PASS | `contract` does not route `explainRepo`; repository wording does. |
| 4 | PASS | Account-merge Docs stays present; `hackathonBrief` stays absent. |
| 5 | PASS | `has` does not match `phase`. `use/user` and `cat/category` also stay separate. |
| 6 | PASS | The staking Docs result survives five weak gated Scout candidates. |
| 7 | PASS | All eight attributed regression rows meet their clean top-five grades. |
| 8 | PASS, experimental | Four direct RWA queries pass. Eight unrelated technical negatives pass. |
| 9 | PASS | The leaderboard and exact RFP queries reach their operations. |
| 10 | PASS by direction only | Every strict aggregate lane meets or improves the accepted totals. |
| 11 | PASS | Three category queries and one region query reach vocabulary operations. |

Check 10 still triggers the old symmetric upper bands.
No gate baseline changed.
The RWA-inclusive aggregate also improves every strict lane over the accepted totals.
It reports `217/295/326`, `92/111/117`, `17/23/23`, and `12/27/29`.
It reduces forbidden holdout captures from 11 to 9.

## RWA-inclusive experiment and residual limitation

The original check 8 uses direct discovery positives and unrelated technical negatives.
Those cases pass against the RWA-inclusive manifest.

Two additional mixed-intent controls fail:

1. `Simulate a transfer of a tokenized bond through Stellar RPC.` places `scout.getRwaAssets` at rank 3.
2. `How do I read a wallet balance for tokenized treasury assets?` places it at rank 2.

Docs leads both mixed-intent queries.
These controls combine implementation intent with explicit RWA subjects.
They do not automatically change the unchanged check 8 result.
The independent reviewer must decide whether this limitation blocks source acceptance.

Final policy decision: keep `GET /api/rwa` excluded.
The schema and handler checks do not grant routing or source acceptance.
The new Scout pin still needs a complete source and operation-surface review.

## Verification

Passed:

- `npm run typecheck`
- `npm run build`
- `npm run secrets:scan -- --tree`
- `git diff --check`
- Accepted-policy routing tests: 32 passed and 3 skipped.
- Trustless Work focused tests: 9 passed.

Failed or incomplete:

- `npm test`: 2,104 passed, 19 failed, and 3 skipped.
- RWA-inclusive focused tests: 33 passed and 2 failed.
- RWA-inclusive full routing: strict aggregate lanes improve, but the unchanged gate fails upper bands.
- `npm run test:smoke`: startup failed on a public GitHub fetch.
- Routing gate: manifest evidence mismatch and three upper-band failures.
- Protocol-history diagnostic: 7/8 positives and 3/4 control captures.

The smoke command could not fetch the pinned Lumenloop skill from `raw.githubusercontent.com`.
I did not repeat the fetch with another tool.

### Complete unit failure inventory

1. `x-routing ingestion` — routing keyword exposed-operation count.
2. `x-routing ingestion` — routing phrase exposed-operation count.
3. `static example trace is truthful` — current catalog example totals.
4. `extractRoutingPhrases` — old prefix-cap expectation.
5. `scoreEntryWeighted` — old routing blend expectation.
6. `scoreEntryWeighted` — old routing-only rescue expectation.
7. `structural wider candidates` — person-query anchors.
8. `routing quality` — default-kind name ranking at limit 1.
9. `routing quality` — default-kind name ranking at limit 5.
10. `routing quality` — GitHub leaderboard intent.
11. `routing quality` — Stellar GitHub leaderboard intent.
12. `routing quality` — later Scout slot replacement.
13. `routing quality` — Scout-only and exact-id source equality.
14. `routing quality` — source-drift control equality.
15. `tiered gate-rescue backfill` — old full-tier-one membership contract.
16. `tier marker and total` — old fixed membership expectation.
17. `search-hit signature compaction` — generated compacted-operation set.
18. `docs page truthfulness` — search-to-execute trace.
19. `host-side ranked search` — short-name directory result snapshot.
The accepted Trustless Work description and admission guard now pass all nine focused tests.
Their two earlier failures came from dropped accepted build contracts.

I do not classify the remaining failures as stale.
The repaired regional partner query now passes with schema enum evidence.
The phrase-cap and routing-score failures assert intentional candidate contracts.
The full-page tier and membership failures also assert intentional candidate contracts.
The count, compaction, demo, Docs, and host results need a source decision before snapshot changes.
The remaining routing-quality failures need individual behavior review.
The result file is `/tmp/raven-execution-2026-09-16/scout-unit-results-final.json`.

## Frozen file hashes

| File | SHA-256 |
|---|---|
| `inventory/stellar-light.json` | `0e99b00af91f2336869af8c8a28be4dbd1317cf24755ac445b95ff43997210c1` |
| `catalog/manifest.json` | `bc91f286b8c750a7c551253a84840d2c8e2634fb9e86db939f93b1eb13a5d361` |
| `specs/super-spec.json` | `7ae72e7913074ec5b1e8b4cee30f51c44bd59615e2b58a2438b43086b893b109` |
| `scripts/build-catalog.mjs` | `85918fc2347adca30461288dcabe2d225624ac5873e41bc32d55dafb2e8ce124` |
| `src/catalog/extract-routing-phrases.ts` | `943251c31eb5ce37ea27ee960ad7aa707a80793df0dfdda8c77df7d16b247812` |
| `src/catalog/scoring.ts` | `8e28959b6be4c173a73dbb171e8a89937d8c58d04c6621639ad9b15b89287201` |
| `src/catalog/search.ts` | `54ec16bfe2a9d831031d5e33a12ea00ff2c962ba6e87a28cb7c1a0dcf0325e2f` |
| `src/catalog/types.ts` | `50568a81bc822b07f618338c72d831d4cc7cc586abb66c16e76e5f258d9f180b` |
| `src/policy/scout-exposure.ts` | `dc9238321e396646a5080db5b86b622c82a79ecdcbac2375dc53672cfe29a6bb` |
| `test/drift-141-routing.test.ts` | `f84fa366635de89932d59e76790580fa8fb988d772b5bc9952dbef6223da004d` |
| `test/routing-evidence.test.ts` | `9eeebdd2dfe6ddcfe9b061ae167439d1b42d35c91fa5bbfbd686c40e60bfbd7e` |
| Combined result | `aa48805e63755a485226128b4d338adf0e146bfa2cc02e2d1f9e080a17f39239` |
| Code-only result | `8171acdf7561f92461e05bb66b24751939c0808bc90ad4e6cad97113f05559ba` |
| Source-only result | `35591d5c004f4712e5ee60b1bbd929968fcd0e302adf5d6bf1cf5fa3b20416d2` |
| Source-only ranked dump | `6ba8fc4d3acc659ac88033aa5facec50be65906fe971cbbec9f67fcaaa967a4b` |
| Combined ranked dump | `4a7dd3efaa2e772fb6d222f251e5d6b67f591c28d93d1aa97ee9d58dd8316638` |
| Code-only ranked dump | `edfdee3369ae05041dafec586bfa7fd7d4347ab71ff6750d3ae474b44a516fe8` |
| RWA-inclusive result | `b867e0e2d7d2949cf8b281ff2ff40f1ad84c69153bbd28ad9ec6babb5e6af39d` |
| RWA-inclusive ranked dump | `1967e9b07c0cffec22613ea79280a2f06e8a32095452fba54e180f46d8432bd8` |
| Final unit result | `5671911af615e385a20072d66d2ee418d0627622e8f47224669080d315fdf0e9` |

## Remaining gates

1. Grok must review the frozen Scout candidate independently.
2. The reviewer must reconcile all 19 unit failures.
3. The reviewer must adjudicate the two mixed-intent RWA captures.
4. A source owner must attest the complete changed Scout prompt and operation surface.
5. The team must decide whether `GET /api/rwa` enters the exposed manifest.
6. Count, schema, and gate changes remain blocked until that decision.
7. The smoke lane needs a successful pinned-source fetch.
8. A final candidate must pass the required baseline suite.

I made no commit, push, deployment, paid evaluation, external comment, or upstream edit.
I did not expose a paid operation.
The candidate does not close issue #141.

The live-drift skill kept source acceptance separate from generation.
The eval skill required the source-only and code-only attribution.
The reviewability skill caused the comment and naming cleanup before the freeze.
