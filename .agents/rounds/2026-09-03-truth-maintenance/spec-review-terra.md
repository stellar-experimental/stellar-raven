# Independent super-spec compaction review

## Scope

I reviewed the current worktree diff against `HEAD`.
I read `spec-implementation-sol.md` and all requested implementation, test, design, and generated-spec files.
I made no implementation change.

I used separate standards and specification review lanes.
Both found the generated behavior correct.
The standards lane found current documentation conflicts.

## Verified behavior

The compact serialized spec is 174,278 bytes.
The hard limit is less than 307,200 bytes.
The artifact has 132,922 bytes of headroom.

The shared predicate remains strictly greater than 2,000 rendered output characters.
It now has one owner in `src/catalog/output-compaction.ts`.
`src/catalog/search.ts` delegates to that predicate.
No scoring, query, catalog, or routing-baseline logic changed.

The current manifest has 23 oversized operation outputs.
The generated spec compacts exactly those 23 outputs.
The compaction code uses no service or operation-name list.

An independent generated-artifact audit passed all 23 compact schemas.
For each schema, it verified:

- The exact top-level property names match the full manifest schema.
- The current required list matches the full manifest schema.
- The top-level type matches when present.
- The `x-codemode-describe` value names the exact operation id.

The audit also verified every non-oversized response schema after reference resolution.
Each equals the full manifest output schema.

The generated spec has six retained components.
It has four parameter components and two schema components.
No emitted component reference dangles.
The pruning behavior is correct for the current artifact.

`codemode.describe` still reads the full manifest entry.
The focused provider test confirms the full `scout.searchProjects` signature and raw output schema.
The compact super-spec stub does not replace that source.

The determinism test rebuilt the spec twice.
Both rebuilt bytes matched the checked-in generated artifact.

## Checks run

`git diff --check` passed.

The independent artifact audit passed:

- Size: 174,278 bytes below 307,200 bytes.
- Compacted outputs: 23.
- Compaction selection failures: 0.
- Field, required-list, type, and pointer failures: 0.
- Non-oversized identity failures: 0.
- Dangling component references: 0.

The focused test command passed:

```text
./node_modules/.bin/vitest run test/super-spec.test.ts test/search.test.ts test/executor-providers.test.ts test/spec-sandbox.test.ts
```

It reported four passing files and 194 passing tests.

## Required repairs

### 1. Preserve all required names without filtering

`scripts/build-super-spec.mjs:140` filters the original required list through emitted property names.
This changes an upstream schema if `required` names a field without a `properties` entry.
The design requires exact required names.

Copy the original top-level `required` list without filtering.
Add a fixture where `required` contains a name absent from `properties`.
The test must assert exact preservation.

### 2. Test required fields and type explicitly

`test/super-spec.test.ts:331-343` tests property names, pointer text, and size.
It does not assert the compact schema's `required` list or top-level `type`.
The current artifact passes the independent audit, but the stated invariant lacks a regression test.

Assert both values for every compacted response schema.

### 3. Repair current documentation conflicts

`ARCHITECTURE.md:309-310` says compaction applies only to search hits.
`ARCHITECTURE.md:484-487` correctly says it also applies to `codemode.spec()`.
Update the former statement.

`research/super-spec-design.md:77-85` states 24 of 28 Scout operations.
The current generated artifact contains 30 of 37 Scout operations.
`research/super-spec-design.md:137` states 54 paths and operations.
The current artifact contains 64.
Update those current-state values or mark them as dated history.

`test/super-spec.test.ts:506` still says the compact spec ships into each search sandbox.
It now ships into the execute sandbox.
Update that test description.

## Result

The current emitted artifact meets the hard size and behavior requirements.
The implementation remains general and does not change product routing.
The required-name handling and regression coverage are incomplete.
The current architecture and design documentation also contradict the implemented behavior.

CHANGES-REQUIRED

## Final reconciliation review — 2026-09-03

The author reconciled all prior required items.

`compactResponseSchema` now copies the original `required` value without filtering.
The new fixture includes a required name without a matching property.
The fixture test verifies the property names, required list, type, and describe pointer.

The compacted-schema loop now verifies each compacted schema's required list and type.
It still verifies exact property names and the exact `codemode.describe(id)` pointer.

`ARCHITECTURE.md` now states that search and the super-spec share the threshold.
`research/super-spec-design.md` now records 30 Scout operations and 64 total operations.
The test wording now identifies the execute sandbox.

The focused audit passed:

```text
./node_modules/.bin/vitest run test/super-spec.test.ts test/search.test.ts test/executor-providers.test.ts test/spec-sandbox.test.ts
```

It reported four passing files and 195 passing tests.
The determinism test rebuilt the generated spec twice without byte changes.

The independent artifact audit passed these checks:

- The compact size is 174,278 bytes, below 307,200 bytes.
- The exact top-level document fields remain correct.
- The artifact has 64 callable operations.
- The shared threshold selects exactly 23 compacted Scout response schemas.
- Each compact schema has exact property names, required values, type, and describe pointer.
- Non-oversized schemas remain identical after reference resolution.
- Six retained components are reachable from paths.
- No component reference dangles.

The manifest SHA-256 remains `ad9491b2deb51c63bae9db9231dda95d790672b216a833342c38182cb9b69ff1`.
The repair only shares the existing threshold and changes super-spec serialization.
It does not change catalog entries, scores, routing rules, or product routing.

PASS
