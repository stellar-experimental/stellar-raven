# Scout 1.9.23 super-spec size repair

Date: 2026-09-03

## Result

PASS

The repair keeps the hard 300 KiB compact-size limit.
The rebuilt compact spec is 174,278 bytes.
The limit is 307,200 bytes.
The remaining headroom is 132,922 bytes.

The prior Scout 1.9.23 artifact was 308,091 bytes.
The repair removes 133,813 bytes from the compact form.

## Implementation

`src/catalog/output-compaction.ts` now owns the shared compaction threshold.
The threshold remains exactly 2,000 rendered output characters.
The comparison remains strictly greater than the threshold.

`src/catalog/search.ts` uses the shared rule without changing search behavior.
The existing export of `COMPACT_OUTPUT_THRESHOLD` remains available.

`scripts/build-super-spec.mjs` applies the rule to each manifest operation output.
It uses the existing TypeScript schema renderer for the size decision.
It changes only an oversized `200` JSON response schema.
It does not use Scout names or a service-specific list.
`scripts/lib/super-spec-compaction.ts` builds the selected compact schema.

Each compact schema keeps these items:

- The exact top-level output property names.
- The original top-level required names.
- The original top-level type when present.
- An exact `codemode.describe("<id>")` pointer.

The builder then prunes components that no path can reach.
This step removes full components used only by compacted responses.

The full schemas remain in `catalog/manifest.json`.
`codemode.describe("<id>")` still returns the full signature and raw schemas.

## Compacted outputs

The shared rule selected 23 operation outputs:

```text
scout.analyzeEcosystem
scout.explainRepo
scout.getBuilders
scout.getChanges
scout.getClusters
scout.getHackathon
scout.getHackathons
scout.getLeaderboard
scout.getPartner
scout.getPartners
scout.getPeople
scout.getRepoTrust
scout.getRfps
scout.getStablecoins
scout.hackathonBrief
scout.listAudits
scout.listSkills
scout.resolveProject
scout.scfPitch
scout.searchProjects
scout.searchRepos
scout.searchResearch
scout.vetIdea
```

The builder compacted no output at or below the threshold.

## Tests

The focused tests cover these contracts:

- The shared rule selects every compacted response.
- Compact schemas keep exact top-level fields.
- Compact schemas keep the exact original `required` value.
- Compact schemas keep the exact original top-level `type` value.
- Compact schemas keep exact-id describe pointers.
- A fixture keeps a required name that has no matching property.
- Non-compacted schemas remain equivalent after reference resolution.
- Two rebuilds remain byte-identical.
- `codemode.describe` preserves full output details.
- The manifest keeps the full output schemas.

`test/search.test.ts` also records the three Scout 1.9.23 threshold crossings.
They are `scout.getRepoTrust`, `scout.scfPitch`, and `scout.vetIdea`.

## Exact verification results

`npm run spec:build` exited with code 0.

- Paths: 64.
- Lumenloop operations: 18.
- Scout operations: 30.
- Skills operations: 4.
- Stellar Docs operations: 12.
- Compacted response schemas: 23.
- Pruned unreachable components: 21.
- Pretty artifact size: 285,466 bytes.
- Compact artifact size: 174,278 bytes.

`./node_modules/.bin/vitest run test/super-spec.test.ts test/search.test.ts test/executor-providers.test.ts test/spec-sandbox.test.ts` exited with code 0.

- Test files: 4 passed, 4 total.
- Tests: 195 passed, 195 total.
- Duration: 807 ms.

`npm run typecheck` exited with code 0.

`npm run build` exited with code 0.
The final clean run used `WRANGLER_LOG_PATH=/tmp/stellar-raven-wrangler.log`.

- Wrangler: 4.124.0.
- Dry-run upload: 6,928.49 KiB.
- Gzip upload: 1,383.46 KiB.
- Deployment: none.

`npm run secrets:scan -- --tree` exited with code 0.
It reported no leaks.

`git diff --check` exited with code 0.

The full `npm test` suite exited with code 1.

- Test files: 96 passed and 4 failed, from 100 total.
- Tests: 1,694 passed and 8 failed, from 1,702 total.
- Duration: 14,471.687 ms.

The eight failures match the known Scout drift blockers.
One failure is the stale Scout routing-keyword count.
Seven failures cover frozen-question leakage and protected vector artifacts.

The failed files are:

- `test/catalog.test.ts`: 1 failure.
- `test/eval-vectorize-clause-fit.test.mjs`: 3 failures.
- `test/eval-vectorize-rerank-fit.test.mjs`: 3 failures.
- `test/eval-vectorize-support-fit.test.mjs`: 1 failure.

The super-spec size test and all focused repair tests pass.
This lane did not repair the unrelated failures because the task excludes those areas.

## Artifact hashes

| Artifact | SHA-256 |
| --- | --- |
| `specs/super-spec.json` | `a82bbbf9886fe89360c6dd3083704c90b205354d01270ada9bf9fc7d13cb4e32` |
| `catalog/manifest.json` | `ad9491b2deb51c63bae9db9231dda95d790672b216a833342c38182cb9b69ff1` |
| `inventory/stellar-light.json` | `1bfe9d6ada6518d834a3893bb9df039ed77e1a16499897af6bdcbed878c0fc4f` |
| `inventory/stellar-docs-titles.json` | `2ec2718fa24df11b02ec11eee7f5079a81f3464673fcf0182dfdd4afed00412e` |

The manifest hash matches the pre-implementation drift report.
This lane did not change its full schemas.

## Review reconciliation

I reconciled every required item from `spec-review-terra.md`.

### Exact required-list preservation

The builder no longer filters `required` through `properties`.
The compact helper copies the original value when the source contains `required`.
This rule also preserves an explicitly empty list.

The new fixture is `test/fixtures/super-spec/required-without-property.json`.
It requires both `present` and `missing`.
Only `present` has a property definition.
The focused test confirms that the compact schema keeps both required names.

### Required and type assertions

The artifact test now checks every compacted response schema.
For each schema, it compares `required` with the full manifest schema.
It also compares the top-level `type` with the full manifest schema.

### Documentation repair

`ARCHITECTURE.md` no longer says compaction applies only to search hits.
It records both search-signature and super-spec compaction.
It records 23 compacted Scout outputs for Scout 1.9.23.

`research/super-spec-design.md` now records 30 of 37 Scout operations.
It records 64 total paths and operations.
It records the current pretty and compact sizes.
It no longer describes every response as unchanged.
It no longer calls the compacted spec a full-schema OpenAPI view.

The size-test description now names the execute sandbox and 300 KiB limit.

### Reconciliation verification

The final focused tests, typecheck, build, secrets scan, and diff check passed.
The rebuilt artifact remains byte-identical to the prior compact artifact.
Its SHA-256 remains `a82bbbf9886fe89360c6dd3083704c90b205354d01270ada9bf9fc7d13cb4e32`.

## Scope confirmation

This lane changed the builder, shared threshold location, focused tests, and two requested documents.
It rebuilt `specs/super-spec.json` through `npm run spec:build`.
The build preflight rebuilt `src/mcp/micro-map.ts` without a diff.

This lane did not change these areas:

- Routing baselines.
- Vector artifacts.
- Scout exposure policy.
- Golden files.
- Paid evaluations.
- Deployment.
- Improvements.

The pre-existing inventory and manifest drift remains in the working tree.
