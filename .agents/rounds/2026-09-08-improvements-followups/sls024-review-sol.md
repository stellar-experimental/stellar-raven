# Independent fixed-upstream audit: `sls-024`

Date: 2026-09-08
Live surface: Scout OpenAPI `1.9.48`
Finding: `improvements/stellar-light-scout/sls-024-project-lifecycle-operator-conflicts.md`

## Decision

`sls-024` does not yet meet the fixed-upstream evidence bar.

The five named fixtures now expose dated lifecycle provenance.
They also expose a separate deployment object with an explicit `unknown` network.
The current Fluxity recurrence therefore misclassifies correct unknown semantics as a defect.

However, the full searchable population still contains five core source-provenance gaps.
Those rows use `human-verified` or `source-inherited` while `statusSourceUrl` remains null.
This condition reproduces the finding's exact source-population requirement.

The live API also returns an undocumented `statusBasis` value on nine rows.
That schema defect needs a self-contained successor.

## Scope and method

I read these local authorities:

- `improvements/stellar-light-scout/sls-024-project-lifecycle-operator-conflicts.md`
- `improvements/README.md`
- `.agents/skills/improvements-pipeline/SKILL.md`

I read the current issue body and all 13 comments on `Stellar-Light/stellarlight#494`.
I also read the current issue body and both comments on `Stellar-Light/stellar-scout#9`.

I fetched the live OpenAPI document and confirmed `info.version: 1.9.48`.
I did not accept the stored recurrences or the current round conclusion as evidence.
I made no external writes.

The fixed-upstream bar requires a deployed fix and a fresh original-trigger check.
It also requires an adjacent population scan and complete reference cleanup.
An issue closure or a maintainer claim is not sufficient.

## Upstream record review

### `Stellar-Light/stellarlight#494`

The issue is closed with reason `completed`.
It closed on 2026-08-11.
Its original body described optional lifecycle fields and a zero-migration legacy boundary.

I reviewed every comment because several comments corrected earlier claims.

| Comment | Author | Assessment |
|---|---|---|
| [4971116711](https://github.com/Stellar-Light/stellarlight/issues/494#issuecomment-4971116711) | `kalepail` | Adds the Raven source backlink. It does not verify a fix. |
| [4971408499](https://github.com/Stellar-Light/stellarlight/issues/494#issuecomment-4971408499) | `kalepail` | Records the earlier Fluxity source and network gap. |
| [4971571266](https://github.com/Stellar-Light/stellarlight/issues/494#issuecomment-4971571266) | `kalepail` | Resolves `sls-031`. It does not resolve `sls-024`. |
| [4971573304](https://github.com/Stellar-Light/stellarlight/issues/494#issuecomment-4971573304) | `kalepail` | Records an `sls-029` residual. |
| [4972504233](https://github.com/Stellar-Light/stellarlight/issues/494#issuecomment-4972504233) | `theboycoder` | Addresses `sls-029` rows and queues product scope. |
| [4976982375](https://github.com/Stellar-Light/stellarlight/issues/494#issuecomment-4976982375) | `theboycoder` | Claims full `sls-024` resolution after basis backfills. It leaves product and network modeling elsewhere. |
| [4982290048](https://github.com/Stellar-Light/stellarlight/issues/494#issuecomment-4982290048) | `kalepail` | Rejects full resolution on live `1.7.26` evidence. |
| [5259690253](https://github.com/Stellar-Light/stellarlight/issues/494#issuecomment-5259690253) | `theboycoder` | Claims full lifecycle population on `1.8.42`. It explicitly leaves deployment and availability scope open. |
| [5415888246](https://github.com/Stellar-Light/stellarlight/issues/494#issuecomment-5415888246) | `kalepail` | Keeps the finding active after a broad `1.8.87` check. |
| [5546570474](https://github.com/Stellar-Light/stellarlight/issues/494#issuecomment-5546570474) | `theboycoder` | Adds the `sls-023` product model. It excludes the `sls-024` source and network counts. |
| [5547454129](https://github.com/Stellar-Light/stellarlight/issues/494#issuecomment-5547454129) | `theboycoder` | Adds project deployment facts for verified products. It defines `unknown` as an admission. |
| [5547988441](https://github.com/Stellar-Light/stellarlight/issues/494#issuecomment-5547988441) | `theboycoder` | Corrects two broad `sls-023` claims. It confirms that unknown deployment values are intentional. |
| [5548777030](https://github.com/Stellar-Light/stellarlight/issues/494#issuecomment-5548777030) | `theboycoder` | Adds `sls-023` control facts. It does not resolve `sls-024`. |

The relevant maintainer comments are useful deployment evidence.
They do not prove the current full population.
The live population check below controls the current decision.

### `Stellar-Light/stellar-scout#9`

The issue is closed with reason `completed`.
It closed on 2026-08-11.

| Comment | Author | Assessment |
|---|---|---|
| [5259690727](https://github.com/Stellar-Light/stellar-scout/issues/9#issuecomment-5259690727) | `theboycoder` | Claims no bare-null lifecycle qualifiers on `1.8.42`. It admits that deployment and availability work remained. |
| [5415888272](https://github.com/Stellar-Light/stellar-scout/issues/9#issuecomment-5415888272) | `kalepail` | Records the later broad recurrence and keeps the finding active. |

The first comment overstates lifecycle source coverage.
The current API still has five non-unknown labels without `statusSourceUrl`.

## Live OpenAPI `1.9.48`

The live schema now makes the critical semantic separation explicit.

- `status` describes the project lifecycle.
- The schema says `status` never proves a deployment.
- `deployment.network` is `mainnet`, `testnet`, or `unknown`.
- The schema says `unknown` means no evidence either way.
- `deployment.basis` is null when `network` is `unknown`.
- `products: null` means the API has no modeled product records.
- `supportedNetworks: null` means the API has no network evidence.
- A non-curated `supportedNetworks` list is not exhaustive.

These rules directly solve the earlier status-to-mainnet ambiguity.
They also prevent a null product list from becoming a negative product claim.

The schema still marks `statusSourceUrl` nullable.
Its description says null remains on legacy rows.
This statement preserves the precise population gap that `sls-024` requested upstream to remove.

## Original named fixtures

I executed one direct `searchProjects` request for each named fixture.
Each hash covers the exact raw response bytes from that request.

| Fixture | Generated at | Lifecycle provenance | Deployment | Other scope | SHA-256 |
|---|---|---|---|---|---|
| Slender | `2026-09-08T17:34:26.302Z` | `Inactive`; `2026-07-09`; `human-verified`; source set | `unknown`; all evidence fields null | `supportedNetworks:["stellar"]`; `products:null` | `0b36e257c5b77e9183c1e7525722a7e746692f37af080d54f5c2b4d29a67d9d8` |
| Laina | `2026-09-08T17:34:27.675Z` | `Pre-Release`; `2026-08-27`; `human-verified`; source set | `unknown`; all evidence fields null | `supportedNetworks:["stellar"]`; `products:null` | `4bad4cfcac47541803cb67cca8159f9730e2abfc9280aa8df1cb339e0bfde5aa` |
| K2 Lend | `2026-09-08T17:34:28.155Z` | `Live`; `2026-08-17`; `site-liveness`; source set | `unknown`; all evidence fields null | `supportedNetworks:null`; `products:null` | `0d33ef5df4520f56c4f1a8ce1b8a948cf81690906a74fe5c112084162a2fab59` |
| OrbitCDP | `2026-09-08T17:34:28.808Z` | `Inactive`; `2026-09-05`; `human-verified`; source set | `unknown`; all evidence fields null | `supportedNetworks:["stellar"]`; `products:null` | `db6f862ca988b752cebc22bf9a3ff82ef84502ae38667657aab2dc9995855ec2` |
| Fluxity | `2026-09-08T17:34:28.017Z` | `Live`; `2026-08-14`; `repo-activity`; source set | `unknown`; all evidence fields null | `supportedNetworks:["stellar"]`; `products:null` | `925415fc08ae227e0d0d88d07db24622e2c0bea2d5d5002fb5532f5e8d8d5ca7` |

All five rows pass the original lifecycle field-population fixture.
All five rows also distinguish lifecycle from deployment.

The current `sls-024` recurrence treats Fluxity's null deployment evidence as a defect.
That interpretation conflicts with the live schema.
The explicit `network: unknown` value is the requested admission.

## Source checks for the five fixtures

I also checked the cited source behavior.

- Laina's cited file uses `horizon-testnet.stellar.org` and `Networks.TESTNET`.
- Fluxity's cited repository last committed at `2026-08-14T15:41:53Z`.
- That commit timestamp exactly matches Fluxity's `statusAsOf` value.
- K2's site presents a live product page and a launch link.
- Its `site-liveness` basis does not claim mainnet deployment.
- Slender's cited DefiLlama source currently reports Stellar TVL and borrowed value.
- OrbitCDP's cited site currently says `Live on Stellar` and links a mainnet Blend application.

The Slender and OrbitCDP sources conflict with their current `Inactive` labels.
Those conflicts do not reproduce missing qualifiers.
The fields expose the basis, date, source, and unknown deployment.

The two rows still need a separate accuracy or freshness review.
That review must not expand `sls-024` after its provenance contract passes.

## Broad searchable-population check

The endpoint rejects a request without `q` or a filter.
The seven documented categories cover the complete searchable population.
I paged each category at the documented `limit=100` cap.

The scan returned 981 rows and 981 unique IDs.
The category totals also sum to 981.
The five documented status filters also sum to 981.

`/api/status` reports 1,103 stored project rows.
The public search API exposes only 981 canonical searchable rows through these filters.
Therefore, this audit covers the full served search population, not every stored database row.

### Lifecycle results

| Check | Count |
|---|---:|
| Searchable rows | 981 |
| Null `statusBasis` | 0 |
| Null `statusAsOf` | 0 |
| Null `statusSourceUrl` | 6 |
| `unverified` plus null source | 1 |
| Non-unknown basis plus null source | 5 |

The six null-source rows are:

| Project | Status | Basis | Assessment |
|---|---|---|---|
| MyDataCoin | `Development` | `unverified` | Correct explicit unknown-source semantics. |
| Scam Flagging System | `Inactive` | `human-verified` | Core source-provenance gap. |
| Stellar Pulse | `Live` | `source-inherited` | Core source-provenance gap. |
| Pactta | `Inactive` | `human-verified` | Core source-provenance gap. |
| The Blue Marble | `Inactive` | `human-verified` | Core source-provenance gap. |
| ChainCred | `Inactive` | `human-verified` | Core source-provenance gap. |

`unverified` explicitly means that no citable source exists.
The null source on MyDataCoin therefore follows the documented semantics.

The other five rows do not make that admission.
They claim inherited or human verification without the requested primary evidence URL.
All five rows expose candidate URLs in `links`, but not in `statusSourceUrl`.

### Deployment results

| Network | Count |
|---|---:|
| `mainnet` | 92 |
| `testnet` | 2 |
| `unknown` | 887 |

Every searchable row has a deployment object.
All 887 unknown deployments have null `basis`, `sourceUrl`, and `asOf` fields.
No unknown deployment carries contradictory evidence fields.

These null fields are correct unknown semantics.
Fabricated values would falsely imply evidence that the service does not have.

All 94 known deployments have a basis and an as-of date.
However, 54 known `onchain-activity` deployments have a null `sourceUrl`.
The live schema permits this value.

That 54-row condition is a separate citation-completeness question.
It does not erase the explicit network scope or basis.
It falls outside the original unknown-deployment defect.

### Product and supported-network results

| Check | Count |
|---|---:|
| `products:null` | 959 |
| Non-empty `products` | 22 |
| Empty `products` arrays | 0 |
| `supportedNetworks:null` | 303 |
| Non-empty `supportedNetworks` | 678 |
| Empty `supportedNetworks` arrays | 0 |

The live schema defines each null as unknown.
These values are not false negative claims.
They therefore do not reproduce the old collapsed lifecycle meaning.

## Separate schema defect

The population returned `statusBasis: "package-release"` on nine rows.
OpenAPI `1.9.48` does not include this value in the `statusBasis` enum.
The full OpenAPI document contains zero `package-release` strings.

The affected rows are Drips, Blockaid, DeFarm, Fundable, ACTA, Unstoppable Wallet, Cypher, Smart Treasury, and AXIS.

This response-to-schema mismatch is a real defect.
It can break generated clients and strict validators.
It is narrower than `sls-024` and needs a self-contained successor.

## Answers to the requested decisions

### 1. Does a core lifecycle-provenance defect still reproduce?

Yes.

The five named fixtures pass.
However, five other rows retain a lifecycle label without the requested `statusSourceUrl`.
Their bases are not `unverified`.
The broad claim that no lifecycle labels retain source gaps is therefore false.

### 2. Does `deployment.network: unknown` provide the requested explicit admission?

Yes.

The deployment object separates project lifecycle from network deployment.
Its `unknown` value explicitly says that the service has no deployment evidence.
This design is stronger than a null `supportedNetworks` field alone.

### 3. Are null deployment evidence fields on an unknown deployment a defect?

No.

Null `basis`, `sourceUrl`, and `asOf` values correctly follow `network: unknown`.
The OpenAPI states this rule directly for `basis`.
The population applies the rule consistently across all 887 unknown deployments.

### 4. Do residuals need successors, or do they fall outside this finding?

The five lifecycle source gaps remain inside `sls-024`.
They reproduce the original source-population requirement.
Do not retire the finding by moving its exact residual into a successor.

The undocumented `package-release` value needs a self-contained successor.
It is a schema-contract mismatch, not an unknown-deployment problem.

The 54 known deployments without source URLs are a separate citation-completeness question.
They fall outside the original explicit-scope requirement.
Create a successor only if the product contract requires direct deployment evidence URLs.

The current Slender and OrbitCDP contradictions need a row-accuracy or freshness review.
They do not reproduce missing lifecycle qualifiers.

Integration currency, store availability, and per-product oracle deployment also fall outside this finding.
Existing findings such as `sls-029` and `sls-033` own parts of that work.

### 5. Which active references must change before deletion?

Deletion is not allowed now.
After the five core rows pass, reconcile every active reference below.

1. Remove `improvements/stellar-light-scout/sls-024-project-lifecycle-operator-conflicts.md` through the resolver.
2. Remove the `sls-024` override from `improvements/intake.json`.
3. Regenerate `improvements/INDEX.md`.
4. Append the complete receipt to `improvements/resolved.json`.
5. Update `improvements/stellar-light-scout/sls-029-oracle-product-network-evidence.md` to remove its live routing to `sls-024`.
6. Replace the live `sls-024` example in `.github/ISSUE_TEMPLATE/upstream-improvement-ready.yml`.
7. Update `eval/qa/corpus/live/live-cases.json` with the resolved receipt or a valid successor.
8. Update `eval/qa/corpus/battery/defi-ecosystem/q-eco-stellar-wallets-list.json`.
9. Update `eval/qa/corpus/battery/defi-ecosystem/q-defi-named-newer-protocols.json`.
10. Update `eval/qa/corpus/battery/history-org-tokenomics/q-hist-remittance-corridors.json`.
11. Update `eval/qa/corpus/battery/retail-consumer/q-eco-xbull-wallet.json`.
12. Update `eval/qa/corpus/battery/protocol-core/q-pc-l2-payment-channels-starlight.json`.
13. Regenerate `eval/qa/cases.json` with `npm run eval:qa:compile`.
14. Reconcile the current `.agents/rounds/2026-09-08-improvements-followups.md` ledger.
15. Supersede the current `sls023-review-fable.md` routing statement in the parent ledger.
16. Post and read back a commit-pinned resolution comment on `stellarlight#494`.
17. Post and read back the same resolution evidence on `stellar-scout#9`.

The dated `research/`, `eval/qa/reviewed/`, and completed `.agents/rounds/` references are historical evidence.
Do not rewrite those records.

The generic template reference is active because its current example will become a dead main-branch link.

### 6. Are upstream resolution comments justified now?

No.

Do not post a Raven resolution comment on `stellarlight#494` now.
Do not post one on `stellar-scout#9` now.

The existing maintainer comments correctly describe several deployed improvements.
Their full-resolution wording is broader than the current population supports.

After the five core rows pass, a resolution comment is justified on both references.
That comment must include the dated population result and the commit-pinned source snapshot.
It should also name the schema successor without treating that successor as an unresolved `sls-024` core defect.

## Numbered findings

1. Five searchable rows still lack `statusSourceUrl` under a non-unknown lifecycle basis.
2. The named fixtures now pass lifecycle provenance and deployment-separation checks.
3. The Fluxity recurrence incorrectly treats explicit unknown deployment evidence as a defect.
4. All 887 unknown deployments use correct null evidence semantics.
5. Nine rows return the undocumented `package-release` lifecycle basis.
6. Slender and OrbitCDP need separate status accuracy or freshness checks.
7. Resolution comments on both upstream issues are premature.
8. The active references require the listed cleanup before eventual deletion.

CHANGES-REQUIRED
