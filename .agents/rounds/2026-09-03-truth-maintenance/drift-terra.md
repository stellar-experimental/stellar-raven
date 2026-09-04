# Independent Scout drift verification

## Scope and limits

I read `AGENTS.md` and the required drift, improvements, and eval runbooks.
I inspected the generated Scout 1.9.23 diff and the four named result files.
I ran `npm test` only.
I made no network, paid, deployment, baseline, or source-file change.

The current generated hashes are:

| artifact | SHA-256 |
| --- | --- |
| `inventory/stellar-light.json` | `1bfe9d6ada6518d834a3893bb9df039ed77e1a16499897af6bdcbed878c0fc4f` |
| `catalog/manifest.json` | `ad9491b2deb51c63bae9db9231dda95d790672b216a833342c38182cb9b69ff1` |
| `specs/super-spec.json` | `f4655292872bcdbfed1ceeb6de7149882ff77eb9fc8558d0a87ac3b7e1a93286` |

## Drift classification

Scout changed from `1.9.1` to `1.9.23`.
This is mixed routing-text and schema drift.
It is not a provenance-only change.

The path and method set remains 37 operations.
No operation was added, removed, or renamed.
Therefore, no new exposure-policy decision is required.

The full `components` object changed.
Twenty-six existing operations changed.
Thirteen operations changed routing fields.
They include `getQualityReport`, `searchResearch`, `searchProjects`, and `getChangelog`.
The other changes include response, request, parameter, and schema changes.

The runner intersection is empty.
`RUNNERS` declares only the Lumenloop digest operations.
No declared runner operation is a changed Scout operation.
No runner smoke is required for this drift.

## Routing evidence

The pre-drift routing run passed at `15-22-22`.
It used the manifest hash recorded in `eval/gates.json`.
The post-drift run failed at `15-25-17`.
It failed the manifest-hash guard.
It also changed routing results.

| lane | before | after | result |
| --- | --- | --- | --- |
| Legacy strict top 1 / 3 / 5 | 213 / 279 / 312 | 211 / 277 / 312 | -2 / -2 / 0 |
| Legacy card hits | 95 | 103 | +8 |
| Extended strict top 1 / 3 / 5 | 90 / 110 / 116 | 90 / 109 / 114 | 0 / -1 / -2 |
| Skills top 1 / 3 / 5 | 16 / 23 / 23 | 16 / 22 / 23 | 0 / -1 / 0 |
| Holdout passes | 21 | 22 | +1 |
| Holdout forbidden captures | 11 | 10 | -1 |

The legacy gains include `q-edge-factcheck-soroswap-first-amm`.
It changed from a top-five miss to a top-one hit.
The losses include `q-protocol-24-whisk-incident`.
It changed from top-one to outside top-five.
Other legacy losses include two top-three losses and two top-one losses.
The two extended losses removed top-five coverage.

Do not rebaseline `eval/gates.json`.
The movement includes strict losses.
The movement also includes invalid protocol-history gains described below.
The current evidence does not show an intended, accepted routing improvement.

## Protocol-history evidence

The v2 diagnostic remained a failure in both runs.
It is a diagnostic and not a gate.

| contract | required top-five before → after | forbidden captures before → after | result |
| --- | ---: | ---: | --- |
| `protocol-history-routing-v2` | 4 / 8 → 7 / 8 | 1 / 2 → 1 / 2 | fail → fail |
| `protocol-history-blind-v2` | 3 / 11 → 7 / 11 | 4 / 7 → 5 / 7 | fail → fail |

The visible required gains cannot support a routing claim.
`scout.searchResearch` now exposes two exact frozen protocol-history questions.
They appear in `inventory/stellar-light.json` under `x-routing.exampleQuestions`.
One is the Protocol 24 state-archival question.
The other is the protocol-version-history question.

This is evaluation-input leakage.
It explains the protocol-history gains without proving general retrieval improvement.
The blind contract also gained one forbidden top-five capture.
Keep both diagnostic contracts failed.

## Test result classification

`npm test` reported 10 failures.
One failure is a hard shipping-budget failure.
Two failures are direct changed-surface assertions.
Seven failures protect a stale or contaminated vector artifact.

| test group | count | classification | required response |
| --- | ---: | --- | --- |
| `super-spec` size budget | 1 | Hard product limit failure | Reduce the serialized sandbox spec below 300 KiB. |
| `catalog` routing-keyword count | 1 | Expected surface count is stale: 26 → 30 | Update only after the routing decision. |
| `search` output compaction list | 1 | Three upstream response schemas crossed the existing threshold | Review and update the pinned list after the spec fix. |
| Clause-fit direct assertions | 3 | Stale unmatched-operation expectation and frozen-question leakage | Remove the leaked question source before any artifact refresh. |
| Rerank and support artifact checks | 4 | Dependent `clause artifact input drift` failures | Rebuild and revalidate only after the leakage decision. |

The compact super-spec is 308,091 bytes.
The hard limit is less than 307,200 bytes.
The generated artifact exceeds the limit by 891 bytes.
It grew by 25,334 bytes from the previous generated spec.

Do not increase the 300 KiB limit.
Do not hand-edit `specs/super-spec.json`.
Add a general super-spec compaction rule for oversized response schemas.
Keep the full response shape available through the existing detail path.
Then rebuild the generated spec and repeat the full test suite.

The largest generated path increases are `hackathonBrief` at 5,438 bytes,
`explainRepo` at 4,283 bytes, and `analyzeEcosystem` at 4,214 bytes.
The solution must be general.
It must not remove selected Scout fields or add case-specific routing rules.

## Scout finding lifecycle

`sls-077` has a candidate upstream fix.
The refreshed response enum now includes `issued`.
Run the original free issued-claim request before changing its status.

`sls-078` has a candidate upstream fix.
`getQualityReport` now names Scout and Stellar Light explicitly.
It now excludes generic technical and operational questions.
Re-run its original routing comparison before changing its status.

`sls-079` has a candidate schema fix only.
The schema now adds `deployment` and states that `status` is not deployment proof.
Re-run the strict Stellars Finance check.
Confirm that the field is populated and accurate before changing its status.

The `searchResearch` exact-question injection is a separate routing contract defect.
Do not classify it as a protocol-history improvement.
After a fresh independent OpenAPI confirmation, file or extend an upstream Scout finding.
The finding must request general intent wording without frozen evaluation questions.

## Required actions

1. Reject a routing rebaseline for this generated Scout state.
2. Resolve the exact-question leakage before regenerating any vector artifact.
3. Implement general sandbox-spec response compaction and preserve the 300 KiB limit.
4. Rebuild generated artifacts through their scripts.
5. Refresh vector artifacts only after the leakage fix and approved routing state.
6. Re-run routing, protocol-history, `npm test`, and the required generated-artifact checks.
7. Recheck `sls-077`, `sls-078`, and `sls-079` with their original free triggers.

CHANGES-REQUIRED

## Docs-only resolution

Verdict: accept the independently approved Stellar Docs title refresh only.

The live Algolia settings snapshot was unchanged.
The live title snapshot added one page and increased the total from 649 to 650.

- Path: `/docs/tokens/usdt0-layerzero`
- Title: `USDT0 Transfers with LayerZero`

The accepted Scout inventory remains OpenAPI `1.9.1`.
Its file SHA-256 remains `1a261c4a2e2172683e91a52ddc33b02ff41e74760c861dfacb29c60a8d8671b0`.
The catalog still exposes 30 Scout operations and 252 manifest entries.

The Docs title creates only the derived catalog keywords `usdt0`, `layer`, and `zero`.
This Docs-only resolution does not modify adapters, goldens, exposure policy, routing baselines,
vector artifacts, or finding files.

### Artifact hashes

| Artifact | SHA-256 |
| --- | --- |
| `inventory/stellar-docs-titles.json` | `9494de6789fc509ceab1056f8df49e4d4440484d0bd9cb5ccb41f30ce27478e2` |
| `inventory/stellar-light.json` | `1a261c4a2e2172683e91a52ddc33b02ff41e74760c861dfacb29c60a8d8671b0` |
| `catalog/manifest.json` | `b613201846076e9fbaa70edfee4f506841c7cf690265e69c8d07afde567f6729` |
| `src/mcp/micro-map.ts` | `eda38f9d752dc28a300c4450dd6033349e7de21a17f620a7637f9e72d9f4a77f` |
| `specs/super-spec.json` | `93799e8c9e5c9045b1f2352d2611c1741d2d2458e12712de81da878a33147538` |
| `eval/plan/op-classes.json` | `4cda9783f098c9e55cfb399ad3d1c77ced8acf3f81f37d6170b1d82048b196bb` |
| `eval/routing-cases.json` | `9e863cedc1f1754f67b3955bfe744254da6ae0d069502aefc7964530493fafd3` |

`scripts/build-catalog.mjs` reported canonical manifest SHA-256
`0b1c978b026d342cad886c94bd322704eba023d2bc75d0566dd5612b2c97c00c`.

### Commands and results

```text
node scripts/refresh-inventory.mjs --service stellar-docs
result: stellar-docs settings unchanged; wrote 650-title snapshot

node scripts/build-catalog.mjs
result: passed; 252 manifest entries and 30 Scout operations

npm run micro-map:build
result: passed; generated micro-map unchanged

npm run spec:build
result: passed; 64 callable paths

node eval/plan/build-op-classes.mjs
result: passed; 60 operations, 43 broad, 11 detail, and 6 meta

npm run eval:compile
result: passed; compiled 338 legacy and 122 extended routing cases

npm run eval:routing -- --gate
result: scores match the accepted surface; gate failed only because the manifest SHA differs from the frozen gate evidence

npm run eval:protocol-history
result: both v2 contracts are source-expired by manifest SHA; no question was scored

npm run typecheck
result: passed

npm test -- test/catalog-guards.test.mjs test/catalog.test.ts test/search-resolution.test.ts test/search.test.ts test/spec-sandbox.test.ts
result: passed; 5 files and 146 tests

npm run secrets:scan -- --tree
result: passed; gitleaks found no leaks in all tracked files

git diff --check
result: passed with no output
```

## Addendum — Scout exposure candidate

This addendum supersedes the earlier exposure-policy conclusion.
The 1.9.23 drift creates two new exposure candidates.
It requires a policy decision before the drift can close.

`scout.verifyClaim` now meets its recorded contract condition.
The live request at `2026-09-03T15:30:01.402Z` returned `claim.type: "issued"`.
It returned `verdict: "supported"` for EURC and Circle.
The live 1.9.23 OpenAPI declares `issued` in both request and `200` response enums.

`scout.getQualityReport` now meets its recorded routing condition.
Its live 1.9.23 contract names Scout and Stellar Light in its purpose.
Its `notFor` list excludes unrelated technical and operational questions.
Its keywords are source-specific.

The policy should consider exposing both operations together.
They are read-only operations.
They remain distinct from the five excluded feedback and partner write paths.

The candidate needs these checks before it can land:

1. Remove only `GET /api/quality` and `GET /api/verify` from `EXCLUDED_SCOUT_OPS`.
2. Rebuild the catalog, micro-map, super-spec, and operation classes through their scripts.
3. Update exposure-count tests from 30 Scout operations to 32.
4. Update the routing-keyword assertion from 30 exposed Scout operations to 32.
5. Add a focused routing case for an issued-claim request.
6. Add focused negative routing cases for generic quality vocabulary.
7. Confirm that the quality operation does not regain unrelated captures.
8. Run `npm run eval:compile` and `npm run eval:routing -- --gate`.
9. Review every routing hit-to-miss change before any baseline proposal.
10. Run `npm run eval:protocol-history` as a separate diagnostic.
11. Run `npm test`, `npm run typecheck`, `npm run build`, and `npm run secrets:scan -- --tree`.

The existing live issued response proves contract correctness.
It does not prove that `verifyClaim` routes issued-claim questions well.
The focused routing case must test discovery and exact execution separately.

This candidate can join this round as a bounded policy lane.
It cannot join the current generated change as a closed exposure decision.
The 300 KiB failure and frozen-question routing leakage remain blockers.
Do not rebaseline while those blockers remain.

CHANGES-REQUIRED

## Routing-gate evidence rebaseline

This addendum applies only the reviewed routing-gate evidence change.

`catalog/manifest.json` now uses SHA-256
`b613201846076e9fbaa70edfee4f506841c7cf690265e69c8d07afde567f6729`.
The clean gate run set `baselinedAt` to `2026-09-03T17:23:50.826Z`.
The clean gate result is `routing-2026-09-03T17-23-50-826Z.json`.

All numeric gate values remain unchanged.
The three other evidence input hashes remain unchanged.
Protocol-history source pins remain unchanged.
The decision note exactly matches `docs-drift-review-sol.md`.

```text
npm run eval:routing -- --gate
result: passed; committed evidence verified, legacy 213/279/312, skills 16/23/23,
holdout 10/22/26, 11 forbidden captures, and 21 passed cases

git diff --check
result: passed with no output
```
