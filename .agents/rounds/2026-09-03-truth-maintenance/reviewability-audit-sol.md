# Reviewability audit

Date: 2026-09-03

Fixed point: `2ee801f80d626e68f010392a7d541aab7997349d`

Mode: `audit-reviewability` repair mode

## Verdict

The current diff is reviewable after three behavior-neutral repairs.
The audit found no remaining reviewability blocker.

The reviewed scope contained 59 tracked changes and 37 untracked files before this report.
It covered implementation, tests, durable documents, generated artifacts, improvements, and round records.

## Findings and repairs

### R1: The runtime-adapter schema identifier had three implementation owners

Severity: medium

The same schema string appeared in the adapter, the QA runner, and the paired comparator.
Independent copies could accept different artifact contracts after a later edit.

Repair:

- `eval/qa/exact-old-runtime-adapter.mjs` now exports `RUNTIME_ADAPTER_SCHEMA`.
- `eval/qa/run-qa.mjs` uses that export when it records adapter metadata.
- `eval/qa/paired-verdict.mjs` uses that export when it validates paired artifacts.

This repair changes no schema value, record shape, or validation rule.

### R2: The P6 call-record schema identifier had two implementation owners

Severity: medium

The judge and its paid-call wrapper each declared `p6-judge-self-test-call-v1`.
That duplication could make the wrapper reject records from its own judge.

Repair:

- `eval/qa/judge.mjs` remains the schema owner.
- `eval/qa/run-p6-judge-self-test.mjs` imports and re-exports the judge constant.

This repair changes no schema value, call count, cost cap, or stop rule.

### R3: The durable super-spec size record was eight bytes stale

Severity: low

`research/super-spec-design.md` listed 287,774 pretty bytes and 174,778 compact bytes.
The deterministic builder reported 287,782 pretty bytes and 174,786 compact bytes.

Repair:

- The document now records 287,782 pretty bytes.
- The document now records 174,786 compact bytes.

The generated super spec did not change.

## Reviewed areas

### Implementation

The new adapter, paired guard, judge wrapper, protocol source epoch, vector freeze, and spec compaction remain focused.
Their comments explain invariants, failure boundaries, or required provenance.
The audit found no speculative compatibility layer or operation-specific scoring exception.

### Tests

The changed tests cover observable contracts and failure boundaries.
The test data supports exact hashes, compression behavior, identity pins, and generated-schema invariants.
The audit found no duplicate test that only mirrors implementation structure.

### Durable documents

`ARCHITECTURE.md`, `eval/EVALS.md`, `eval/README.md`, and the research documents describe current behavior.
`.agents/TODO.md` owns future work with triggers and completion rules.
The audit removed no durable explanation.

### Generated artifacts

The audit did not edit a generated file by hand.
The owning scripts and focused tests rebuilt the generated artifacts without byte drift.

| Artifact | File SHA-256 after rebuild |
| --- | --- |
| `catalog/manifest.json` | `b613201846076e9fbaa70edfee4f506841c7cf690265e69c8d07afde567f6729` |
| `specs/super-spec.json` | `93799e8c9e5c9045b1f2352d2611c1741d2d2458e12712de81da878a33147538` |
| `eval/qa/cases.json` | `1042c0e226ad44b5ffab8844e1c97a2752f94a3096b13e628ed630fd0f015c7f` |
| `eval/qa/sample.json` | `a23b3fc7332ba8aef182ffeb3865ecca387b3456f23659ea2c9f1e45bbd42851` |
| `eval/qa/lifecycle-registry.json` | `5f6f135dcf6c026ad911842d7f5ffea84136c96e1b29f0b47751b556c0700098` |
| `improvements/INDEX.md` | `59fb641b6bba848b249366fba6277f6bf29f11e168760aa3322b909df953f8f5` |
| `inventory/stellar-docs-titles.json` | `9494de6789fc509ceab1056f8df49e4d4440484d0bd9cb5ccb41f30ce27478e2` |

The QA compiler reported 500 cases and content digest `623cd65816979285338865d7e62043bbe2247f083f5b1492d94b5c8805a1d915`.
The improvements index contains 68 findings.

### Round records

The audit preserved every dated report and the main round ledger.
Earlier blocked verdicts remain valid historical evidence beside later reconciliations.
The 6,022-line affected-case artifact remains necessary reproducibility evidence for the paired review stratum.
Its companion report explains its purpose, hashes, rules, and non-causal boundary.

## Exclusions

The audit did not change golden answers, truth metadata, findings, routing policy, or generated artifacts.
It did not remove historical evidence from round records.
It did not change unrelated work in the dirty tree.

The audit did not run paid model calls or deploy any service.
It did not run the full product suite because the repairs had narrow verification paths.

The protocol-history command stopped with `source-expired` for both v2 contracts.
The manifest hash caused the expected stop before scoring.
This result confirms the new source-epoch guard and is not a reviewability failure.

The corpus lint retains its established 62-warning baseline.
It reports zero errors.
This audit did not broaden scope into that separate authoring backlog.

## Verification

| Command | Result |
| --- | --- |
| `npx vitest run test/catalog.test.ts test/eval-protocol-history-source-epoch.test.mjs test/eval-vectorize-clause-fit.test.mjs test/eval-vectorize-rerank-fit.test.mjs test/eval-vectorize-support-fit.test.mjs test/exact-old-runtime-adapter.test.mjs test/executor-providers.test.ts test/p6-judge-self-test.test.mjs test/qa-harness-preconditions.test.mjs test/qa-paired-verdict.test.mjs test/super-spec.test.ts` | PASS, 387 tests |
| `npm run typecheck` | PASS |
| `npm run spec:build` | PASS, 64 operations and 20 compacted responses |
| `npm run eval:compile` | PASS, 338 legacy and 122 extended cases |
| `npm run eval:selftest` | PASS |
| `npm run eval:qa:compile` | PASS, 500 cases |
| `npm run eval:qa:lint -- --stale` | PASS, 0 errors and 62 warnings |
| `npm run eval:qa:register` | PASS, 0 reopened clusters |
| `npm run improvements:index` | PASS, byte-identical output |
| `npm run improvements:lint` | PASS, 68 findings |
| `npm run eval:routing -- --gate` | PASS |
| `npm run eval:protocol-history` | Expected `source-expired`; no case scored |
| `git diff --check` | PASS |

The first sandboxed adapter test run could not bind `127.0.0.1`.
The approved local-port rerun passed all 26 adapter tests.
The final focused suite then passed all 387 tests.

PASS
