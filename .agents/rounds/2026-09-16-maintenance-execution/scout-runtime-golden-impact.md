# Scout 1.9.1 to 1.9.52 runtime and golden-impact audit

Date: 2026-09-16

Author: Sol high

Control: `bb37bc502080c94c3f3b5223ffcdf584d4b0e29d`

Control worktree: `/tmp/raven-execution-2026-09-16/scout-runtime-audit`

## Verdict

Scout 1.9.52 is not a mechanical inventory refresh.

It adds one operation and changes 30 existing operation objects.

It also changes nine shared component schemas.

The generic Scout adapter can carry the new operation without a special handler.

However, source policy, plan classification, tests, and golden lifecycle still require deliberate changes.

`GET /api/rwa` must remain unaccepted until all eleven routing checks pass.

The current safe source-absorb path must exclude that operation explicitly.

An exposed `scout.getRwaAssets` also needs the `broad` plan class.

The current generator classifies it as `detail` because its name starts with `get`.

The pinned Light guide is coherent with 1.9.52.

It is not accepted for Raven use.

The guide advertises `/api/rwa` unless the 1.9.52 exposure policy scrubs that section.

No accepted golden needs an immediate content correction from this audit.

One new proposal has a clear coverage purpose.

The proposal remains outside the repository corpus and active count.

## Scope and controls

I read the full `.agents/TODO.md` file.

I used its eleven Scout source-acceptance checks as the policy boundary.

I also followed `live-drift-resolution` and `golden-truth`.

I compared these sources:

- Accepted Scout 1.9.1 inventory at control `bb37bc50`.
- Public Scout 1.9.52 OpenAPI and status endpoints.
- The parent 1.9.52 inventory candidate.
- The proposed pinned Light API guide.
- Public upstream handler, registry, schema, and enum-parity source.
- Fresh bounded public GET observations.
- The current Raven adapter, validator, exposure policy, plan classes, and QA corpus.

I used no credential.

I made no paid call.

I called no write endpoint.

I retained no asset, issuer, project, partner, or financial value from live responses.

I did not change the control worktree.

I did not change a routing worktree or case label.

## Source identity

The accepted control inventory reports Scout `1.9.1`.

The public OpenAPI and status endpoint report Scout `1.9.52`.

The public OpenAPI contains 37 paths and 38 path-method operations.

The accepted OpenAPI contains 37 operations.

The new operation is `GET /api/rwa`, with operation ID `getRwaAssets`.

The parent candidate OpenAPI matches the fresh public OpenAPI after canonical JSON sorting.

Both canonical documents have SHA-256 `bb9e778ef549fbc378648bf70a00f2452c40b95d9dee935042d7614be46b9986`.

The inspected upstream repository commit is `76dfa696b790c321a29aa271d3831735a90e3b0d`.

Its commit time is `2026-09-16T20:45:46Z`.

## OpenAPI operation impact

The normalized comparison found these totals:

| Item | Count |
| --- | ---: |
| Old operations | 37 |
| New operations | 38 |
| Added operations | 1 |
| Removed operations | 0 |
| Changed existing operation objects | 30 |
| Unchanged existing operation objects | 7 |

Eighteen changed operations modify `x-routing`.

Twelve changed operations modify only non-routing contract fields.

Six changed operation objects are excluded by current Raven policy.

Twenty-four changed operation objects are currently exposed on Scout 1.9.1.

### Added operation

| Method and path | Operation ID | Impact |
| --- | --- | --- |
| `GET /api/rwa` | `getRwaAssets` | New read-only collection, new schema, new routing card, and new policy decision. |

### Changed existing operations

This table names every changed operation object.

“Routing only” means the operation object changes only in `x-routing`.

Shared component changes can still alter its effective output contract.

| Operation | Current exposure | Non-routing change |
| --- | --- | --- |
| `analyzeEcosystem` | Exposed | Typed analytics for categories, developers, funding, gaps, hackathons, TVL, and toolchain. |
| `listAudits` | Exposed | Routing only. |
| `getBuilders` | Exposed | Adds response warnings. |
| `getChangelog` | Exposed | Defines structured response metadata. |
| `getChanges` | Exposed | Adds metadata facet counts and notes. |
| `getClusters` | Exposed | Routing only. |
| `listContracts` | Exposed | Reworks domain ordering and expands contract evidence, audits, usage, and metadata. |
| `getFeedbackSchema` | Excluded | Expands submission schema and examples. |
| `hackathonBrief` | Exposed | Types funding, contract, starting-point, vetting, and metadata blocks. |
| `searchHackathonBuilds` | Exposed | Clarifies awards and placements, then types counts and filters. |
| `compareHackathons` | Exposed | Adds prize-pool and response-count detail. |
| `getLeaderboard` | Exposed | Adds `Yield`, activity semantics, filters, and counts. |
| `getPartners` | Exposed | Adds `asset-issuer`, `accepting=0`, and a closed region enum. |
| `getPartner` | Exposed | Types case studies and expands ramp types. |
| `resolveProject` | Exposed | Routing only. |
| `searchProjects` | Exposed | Adds `Yield` and removes `Pre-Development`. |
| `getQualityReport` | Excluded | Changes quality summary and finding fields. |
| `explainRepo` | Exposed | Adds answer dates, source meaning, repository kind, warnings, and capability evidence. |
| `searchRepos` | Exposed | Routing only. |
| `getRepoTrust` | Exposed | Expands audit, scan-state, signal, usage, and metadata fields. |
| `searchResearch` | Exposed | Routing only. |
| `getRfps` | Exposed | Changes description and types filter metadata. |
| `scfPitch` | Exposed | Types funding, open-round, vetting, and metadata blocks. |
| `getSkill` | Exposed | Adds source, tagline, tags, and target user. |
| `verifyClaim` | Excluded | Adds a claim-type enum value. |
| `vetIdea` | Exposed | Types competitor, funding, gap, prior-art, and metadata blocks. |
| `partnerAssistant` | Excluded | Types returned partner matches. |
| `matchPartners` | Exposed | Types the partner inside each match. |
| `partnerOnboard` | Excluded | Replaces broad fields with structured fields and profile objects. |
| `submitPartnerListing` | Excluded | Expands the side-effecting request schema. |

### Unchanged operation objects

These seven operation objects remain byte-equivalent after key sorting:

- `submitFeedback`
- `getHackathons`
- `getHackathon`
- `getPeople`
- `listSkills`
- `getStablecoins`
- `getStatus`

The first operation remains excluded.

Five others consume a changed shared schema.

Only `getStatus` has no identified shared-schema change.

## Input-contract changes

The new RWA operation accepts these query parameters:

| Parameter | Contract |
| --- | --- |
| `state` | `live`, `issued-single-holder`, `deployed-no-supply`, or `not-found` |
| `level` | Five documented verification levels |
| `kind` | `classic` or `soroban` |
| `project` | A directory project slug |
| `limit` | Integer, default 100, maximum 100 |

Existing input contracts also change:

- `getLeaderboard.type[]` adds `Yield`.
- `searchProjects.type` adds `Yield`.
- `searchProjects.status` removes `Pre-Development`.
- `getPartners.type` adds `asset-issuer`.
- `getPartners.accepting` adds `0`.
- `getPartners.region` becomes a closed eight-value enum.
- `listContracts.domain` reorders values without changing the value set.
- `submitPartnerListing` gains a detailed body schema, but Raven excludes that operation.

Fresh public reads confirmed each non-side-effecting input change.

`Pre-Development` returned HTTP 400 with the current valid status list.

`accepting=0` returned HTTP 200 with an empty collection during this observation.

That empty result says nothing about future partner availability.

## Nine changed component schemas

The component set remains at 23 schemas.

Nine existing schemas change.

No component schema is added or removed.

| Schema | Consumers | Meaningful change |
| --- | --- | --- |
| `Builder` | `getBuilders` | Adds `code-language` as a match basis. |
| `HackathonDetailResponse` | `getHackathon` | Adds per-winner `prizeUsd` and narrows `award` to a category title. |
| `LeaderboardProject` | `getLeaderboard` | Adds nullable `commits90d` and `commits90dAsOf`. |
| `Meta` | 12 collection operations | Defines `semantic` as part of `returned`, but not `total`. |
| `Partner` | `getPartners` | Adds the `asset-issuer` partner type. |
| `PartnersResponse` | `getPartners` | Adds `meta.validRegions`. |
| `Project` | `searchProjects` | Adds deployment, product evidence, coverage, SCF award, and status-basis fields. |
| `Repo` | `searchProjects`, `searchRepos` | Adds repository kind, succession, deprecation, and tier evidence. |
| `Stablecoin` | `getStablecoins` | Adds logo provenance and price-basis semantics. |

### Project schema details

`Project` has the largest semantic expansion.

It adds a separate project-level `deployment` fact.

It does not equate project lifecycle with mainnet deployment.

It makes community votes nullable.

It expands product records with identity, controls, issuer, launch date, registry state, and verification level.

It adds nullable `productsCoverage`.

It allows an SCF award record to have a null round.

It adds `awardName` for unnumbered awards.

It adds `repo-activity`, `package-release`, and `product-integration` status bases.

These changes improve truth boundaries.

They also require response-aware QA before source acceptance.

### Stablecoin schema details

`priceBasis` distinguishes an assumed peg from a measured market price.

`marketCapUSD` can therefore represent supply at par.

It is not always a measured market valuation.

The existing stablecoin goldens already reject unsupported current numbers.

They need regression review after the schema ships.

## RWA handler and source review

The public handler uses one shared array for each enum family.

The OpenAPI builder uses the same arrays.

The upstream parity test checks request, response, and handler enum agreement.

The handler accepts only `state`, `level`, `kind`, `project`, and `limit`.

It returns HTTP 400 for an unknown parameter.

That error includes `validParams`.

It returns HTTP 400 for an invalid state, level, or kind.

Those errors include valid values in the message.

They do not include a structured `validStates`, `validLevels`, or `validKinds` array.

The handler lowercases the project slug.

It clamps `limit` to 100.

It sorts rows before applying the limit.

The endpoint returns `{meta, assets}`.

Each row can include `evidenceUrl`, `verifiedAt`, and `verificationLevel`.

The method describes registry absence as untracked.

It does not describe absence as proof that an asset does not exist.

The handler can return `measured: null` when its measurement store is unavailable.

It adds a warning instead of returning HTTP 503.

The method dates each measurement with `measuredAt` when present.

It identifies classic assets by code and issuer.

It identifies Soroban tokens by contract ID.

## Fresh public observations

I ran bounded public GET requests at `2026-09-16T21:10:22.293Z`.

All four state-filter requests returned HTTP 200.

Rows for three states matched their requested state.

The `not-found` filter returned no rows during this observation.

That empty result is source-relative and time-specific.

An invalid state returned HTTP 400.

An unknown `sort` parameter returned HTTP 400 with `validParams`.

The parent probe observed the same four state contracts at `2026-09-16T20:06:02.644082+00:00`.

The two observations agree without retaining private identifiers.

## Raven runtime implications

### Adapter

`src/adapters/scout.ts` already supports this read path.

It fills path templates and serializes GET arguments with `URLSearchParams`.

It returns successful JSON without reshaping it.

It maps HTTP 400 to the normal error envelope.

It copies top-level `valid*` arrays into error details.

It maps HTTP 404 to `soft-empty`.

It maps `meta.error` success bodies to `soft-empty`.

The RWA handler uses neither condition for an empty filtered collection.

Therefore, `{meta, assets: []}` remains successful source-relative data.

That behavior is appropriate only when answers preserve the curated-registry boundary.

No Scout operation receives runtime output-schema validation.

The generated output schema guides the model, but it does not reject response drift.

Response changes therefore need source review and QA coverage.

### Input validation

`scripts/build-catalog.mjs` derives Scout input schemas from OpenAPI.

`src/policy/validate.ts` enforces declared types, enums, and numeric limits.

The 1.9.52 manifest will reject an invalid RWA enum before network traffic.

The generated Scout object schema omits `additionalProperties: false`.

An unknown argument can therefore reach the upstream handler.

The handler then returns HTTP 400 and `validParams`.

This is existing Scout behavior, not an RWA-only defect.

### Exposure and generated text

The accepted 1.9.1 policy does not name `GET /api/rwa`.

That omission is expected because the path does not exist in 1.9.1.

The 1.9.52 absorb must make an explicit policy decision.

Current TODO policy requires exclusion until all eleven checks pass.

The exclusion must use `GET /api/rwa` in `EXCLUDED_SCOUT_OPS`.

That entry also lets the skill-body scrub remove the guide's RWA section.

The current source-presence guard will then verify that the excluded path exists.

### Plan classification

`eval/plan/build-op-classes.mjs` classifies most `get*` operations as detail operations.

`getRwaAssets` returns a filtered collection.

The candidate generator currently classifies it as `detail`.

Future exposure requires this explicit override:

```js
"scout.getRwaAssets": "broad"
```

The plan test must assert that class.

This is an evaluation-contract correction.

It does not change search scoring.

## Golden and evaluation impact

No active case names `scout.getRwaAssets`.

No active case contains the new RWA state or evidence field names.

The broad operation-object comparison touches 147 active cases through declared surfaces.

That number includes routing-only changes.

The nine changed components affect 124 active cases through 13 consumer operations.

The shared `Meta` schema explains much of that reach.

Excluding `Meta`, seven domain schemas affect 62 active cases.

These counts identify review scope.

They do not prove a golden is false.

### Existing RWA case boundaries

`q-rwa-projects-tokenizing-stellar` asks for projects and institutions.

It should keep `scout.searchProjects` as its declared surface.

The new registry can corroborate product deployment after exposure.

It should not replace the project-directory question.

`q-asset-rwa-tokenized-freshness` asks for current aggregate value and growth.

It needs dated measurement sources and explicit scope.

Individual registry values do not create a stable aggregate golden.

`q-defi-rwa-scf-similar` asks whether similar work received SCF funding.

The RWA registry does not establish SCF funding.

The existing SCF operations remain the correct source family.

### Existing cases requiring focused regression review

- Hackathon comparison cases must use `prizeUsd` for a winner's amount.
- Winner-order cases must keep placement semantics.
- Leaderboard cases must date `commits90d` with `commits90dAsOf`.
- Partner cases can test `asset-issuer` and `accepting=0` without claiming availability.
- Project cases must separate lifecycle, deployment, product state, and coverage.
- Repository cases must weigh kind and succession evidence.
- Stablecoin cases must distinguish `priceBasis` from a measured market price.

The schema diff alone does not justify editing these goldens.

Their next live run must inspect each returned field under its new meaning.

## Required meaningful QA for `getRwaAssets`

The operation needs more than a count assertion.

The minimum meaningful coverage is:

1. A catalog test checks all input enums and required output keys.
2. An exposure test proves the operation stays absent until policy accepts it.
3. A policy test rejects invalid enums before any fetch.
4. An adapter test verifies query serialization and pass-through `{meta, assets}` data.
5. An adapter test maps unknown-parameter HTTP 400 and preserves `validParams`.
6. An adapter test keeps an empty `assets` array successful with coverage metadata.
7. A plan test classifies `scout.getRwaAssets` as `broad`.
8. Routing acceptance covers genuine RWA discovery and the required unrelated negatives.
9. A QA case grades state and evidence semantics without volatile counts or values.
10. Independent review checks the source, routing, plan class, and golden before activation.

The QA case must reject these errors:

- Calling `issued-single-holder` a live market.
- Treating no registry row as proof of real-world absence.
- Using a ticker as a complete classic-asset identity.
- Treating null measurements as zero.
- Freezing current counts, values, prices, supplies, or holders into the golden.

## Proposed case draft

The separate draft is:

`/tmp/raven-execution-2026-09-16/scout-rwa-proposed-case.json`

Its ID is `q-rwa-registry-state-verification`.

Its lifecycle state is `proposed`.

Its review state is `none`.

It has no activation metadata.

The repository compiler structurally validated the draft under the proposed lifecycle rules.

The draft cannot enter the repository today.

The accepted manifest does not expose its declared surface.

The corpus lint would correctly reject that surface.

After operation exposure, the proposal must land before any activation commit.

An independent reviewer must then verify the proposal.

A later commit can activate it with actual activation evidence.

## Required order

1. Finish the combined Scout routing review against accepted main.
2. Decide `GET /api/rwa` exposure from all eleven checks.
3. If checks fail, absorb 1.9.52 with `GET /api/rwa` excluded.
4. If checks pass, add explicit exposure approval and the `broad` plan override.
5. Add the focused runtime, policy, plan, and source tests.
6. Pin the Light guide only with matching exposure and scrub behavior.
7. Run full source, routing, registry, QA, typecheck, test, build, and smoke gates.
8. Land the new case in the proposed lane after its surface exists.
9. Obtain independent golden review in a later stage.
10. Activate the unchanged proposal in a later commit with real evidence.

Do not change an active-count contract during the proposal stage.

Do not change a manifest-count contract unless the operation becomes exposed.

## Independent review boundary

Grok high reviewed the proposed Light pin content.

That review did not accept the pin, Scout 1.9.52, or `getRwaAssets` exposure.

It found the guide coherent with 1.9.52.

It also confirmed the current RWA section would leak on a 1.9.1 surface.

This audit does not replace the required combined source and routing review.

## Remaining limitations

- This audit did not rerun or accept the eleven routing checks.
- No independent reviewer has reviewed the proposed RWA case.
- The proposed Light pin has no source acceptance or pin attestation.
- The accepted manifest does not expose `scout.getRwaAssets`.
- The proposal cannot pass surface lint until that operation is exposed.
- The live probes checked contracts and response shapes only.
- The probes did not corroborate individual asset identities or financial values.
- Raven does not enforce Scout output schemas at runtime.
- This audit did not run full typecheck, test, build, smoke, QA, or routing gates.
- No active-count or manifest-count contract changed.
- No activation evidence exists for the proposal.

## Evidence and hashes

| Evidence | SHA-256 |
| --- | --- |
| Accepted `inventory/stellar-light.json` | `1a261c4a2e2172683e91a52ddc33b02ff41e74760c861dfacb29c60a8d8671b0` |
| Parent candidate `inventory/stellar-light.json` | `2dbcd893180569b1c9e131f155ae73836dc89601d873677dcc5187a973de2d1f` |
| Fresh public OpenAPI raw JSON | `47ebac2a318f8883e6d2ae4fd8dc911953fca92336d2f32f047777ece5fc163f` |
| Normalized OpenAPI diff | `461f8f134f10d8507088da1d23b63a01bda06b1a87742c774defa55bd675191e` |
| Schema-consumer map | `866ceb1a735610b0f281aae49b89cc473af5f95bb0d95599e85b4e1a91f3aeb5` |
| Fresh redacted runtime probes | `d472d0484cfa04bb310828270b19352b43939b46859faf58478843bb2a55c90b` |
| Parent four-state probes | `1341517f275d43916d413f3fa707fbd0ab78edf0bb231585406ce5d42afe0f7c` |
| Grok Light pin review | `7621ad4175dec064dcb8c9efd4d65fdfccab97292302639d0094b73903d2f3b4` |
| Proposed Light API reference | `5e17ecaaa7f875f8d87170ba16a70c74c221a1dfc717f159e6594043ab7200cf` |
| Candidate `getRwaAssets` manifest entry | `8dc99954f58f8d65419b418f561ce35e0520ed19eef1676dbff6ae969dfa304e` |
| External proposed case draft | `d2998853dbc049f69f212838a95fa0ace4c7a551aafd6bcf4ffa0ffd66d41a67` |

Upstream source hashes:

| Source file | SHA-256 |
| --- | --- |
| `src/app/api/rwa/route.ts` | `de10f3feabeef7b9443c0cb069f5970df4cc01a256ae7ce0ea1006636085ed9a` |
| `src/data/rwa-registry.ts` | `e832aa7c4162c00c8de1c50a0aa11877e1053918ef5242f1207a27a4b267b03a` |
| `src/lib/rwa-products.ts` | `d27e7ef4d242889b04886c46baafef4f1b0dc7525c0932b0d8fc9ae5f38b4644` |
| `api-client/src/schema.ts` | `8b42598ecd32c2813abe997e1278fdad0554760eb67f11e6d4fe60d59a7d727a` |
| `src/lib/__tests__/spec-enum-parity.test.ts` | `0c25c3aebed8ce2f6a2b61ec2ec5a0cc1d5b3391b8d4113d3833d35aeecfb449` |
| `public/skills/references/api-reference.md` | `5e17ecaaa7f875f8d87170ba16a70c74c221a1dfc717f159e6594043ab7200cf` |

Supporting files remain under:

`/tmp/raven-execution-2026-09-16/scout-runtime-audit-evidence/`

## Final state

The control worktree remains clean at `bb37bc502080c94c3f3b5223ffcdf584d4b0e29d`.

The Docs title candidate remains unchanged.

No repository file changed during this audit.

No source, pin, golden, count, gate, label, commit, push, or deployment received acceptance here.
