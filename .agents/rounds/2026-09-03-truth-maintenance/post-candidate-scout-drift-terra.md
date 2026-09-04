# Post-candidate Scout drift classification

Date: 2026-09-04

## Verdict

**STOP THE PAID PAIR UNDER THE PRE-ARM PIN.**

Scout changed after the recorded pre-arm check.
The old same-live-interval assertion is false.
No paid arm started in this lane.
No paid model call occurred.

This change does not invalidate the paired method itself.
It invalidates the recorded Scout `1.9.23` interval pin.
The method can resume only under one newly recorded, unchanged live identity.

## Canonical identities

The round ledger records the pre-arm live identity below.

| State | OpenAPI version | Inventory SHA-256 |
| --- | --- | --- |
| Recorded pre-arm identity | `1.9.23` | `ec0c345b297220e8225c211adcc8c8eae91d07c24f33b645ad0142f2abd4fee5` |
| Retained `1.9.23` generated candidate | `1.9.23` | `1bfe9d6ada6518d834a3893bb9df039ed77e1a16499897af6bdcbed878c0fc4f` |
| Current generated clone inventory | `1.9.30` | `ac9d9b258980436370ce798fa4e5f9db21e93b31e77d0fcedc3e96307427c918` |

The retained candidate has `fetchedAt` `2026-09-03T15:24:32.527Z`.
The current inventory has `fetchedAt` `2026-09-04T05:42:52.877Z`.

The different `1.9.23` hashes are not interchangeable evidence.
The launch ledger owns `ec0c…fee5` as the pre-arm identity.
The retained candidate is useful only for the field-level comparison.

I used the repository inventory identity procedure.
It hashes the deterministic generated file bytes with SHA-256.
The current canonical command was:

```sh
shasum -a 256 /private/tmp/stellar-raven-upstream-ObAJaV/repo/inventory/stellar-light.json
```

It returned `ac9d9b258980436370ce798fa4e5f9db21e93b31e77d0fcedc3e96307427c918`.

## Drift classification

This is not a provenance-only drift.
It is mixed routing-text and schema/response-contract drift.
It has no operation-surface drift.
It does not affect a runnable skill runner.

| Check | Result |
| --- | --- |
| Paths | 36 → 36 |
| HTTP operations | 37 → 37 |
| Added, removed, or renamed operations | None |
| Full operation objects changed directly | 4 |
| Operations with routing fields changed | 2 |
| Changed shared schemas | 2 |
| Runnable-runner intersection | Empty |

The direct operation changes are below.

| Operation | Class | Material change |
| --- | --- | --- |
| `GET /api/analyze` / `scout.analyzeEcosystem` | Routing text and response schema | Added analytics routing terms. Added toolchain measurement denominators, completeness, and capped-list metadata. |
| `GET /api/audits` / `scout.listAudits` | Routing text | Added recent smart-contract-audit example and audit-history keywords. |
| `GET /api/contracts` / `scout.listContracts` | Response schema | Added `contractBasis`. It separates `self-validated` from `published` contract evidence. |
| `GET /api/repos/trust` / `scout.getRepoTrust` | Response schema | Added the `publishes-contract-id` repository-trust reason. |

The shared-schema changes affect these additional exposed contracts.

| Shared schema | Affected operation | Material change |
| --- | --- | --- |
| `HackathonDetailResponse` | `GET /api/hackathons/{slug}` / `scout.getHackathon` | Added winner `prizeUsd`. Clarified category awards. Made vote counts nullable. Added `awardName`. Made award round nullable. |
| `Project` | `GET /api/projects/search` / `scout.searchProjects` | Added `repo-activity` and `product-integration` status-basis values. Clarified status and award semantics. |

The current source also advances `changelogEntryCount` from 225 to 232.
It reports `spec@1.9.30` as its latest changelog version.

The clone diff also changes `fetchedAt`, OpenAPI version fields, and latest-changelog text.
These fields are provenance data only.

## Impact decision

The two routing changes can change search ranking.
The five response-contract changes change sandbox-visible contracts.
Therefore, the prior `1.9.23` interval cannot stand as the current launch precondition.

No policy change is safe now.
No new operation needs exposure approval.
The existing exclusions for `GET /api/quality` and `GET /api/verify` remain unchanged.

No runner smoke is required.
`RUNNERS` declares only `skills.lumenloop.stellar-ecosystem-digest` operations.
It declares no Scout operation.

No golden change is safe now.
The field diff alone does not prove a golden fact is stale.
No improvement finding is safe now.
The change does not reproduce an active finding trigger.

Keep the existing general scoring TODO unchanged.
It already owns source-text extraction, schema-keyword, and gate-tier defects.
Do not add an operation-specific TODO or a routing baseline change.

Do not resolve `sls-023`, `sls-024`, or `sls-033` from this schema alone.
Their original live recurrence probes remain necessary.

## Smallest deterministic next action

Do not start either QA arm.

Run the free Scout identity check immediately before the candidate arm.
Record its OpenAPI version and raw inventory SHA-256.
Repeat the same check after the candidate arm, before the baseline arm, and after the baseline arm.

Reject the paired result if any of the four identities differs.
The new identity needs explicit launch authorization before a paid call.

The launch command is:

```sh
node scripts/refresh-inventory.mjs --service stellar-light
shasum -a 256 inventory/stellar-light.json
```

Do not rebuild or adopt generated artifacts during this identity gate.
The gate records live service identity only.

## Evidence and commands

I inspected these sources:

- `.agents/rounds/2026-09-03-truth-maintenance.md`
- `.agents/rounds/2026-09-03-truth-maintenance/final-prespend-launch-sol.md`
- `.agents/rounds/2026-09-03-truth-maintenance/drift-terra.md`
- `/private/tmp/stellar-light-1.9.23.json`
- `/private/tmp/stellar-raven-upstream-ObAJaV/repo`

I ran these read-only commands:

```sh
git -C /private/tmp/stellar-raven-upstream-ObAJaV/repo status --short
git -C /private/tmp/stellar-raven-upstream-ObAJaV/repo diff --check
git -C /private/tmp/stellar-raven-upstream-ObAJaV/repo diff -- inventory/stellar-light.json
diff -u /private/tmp/stellar-light-1.9.23.json /private/tmp/stellar-raven-upstream-ObAJaV/repo/inventory/stellar-light.json
shasum -a 256 /private/tmp/stellar-light-1.9.23.json /private/tmp/stellar-raven-upstream-ObAJaV/repo/inventory/stellar-light.json
```

I also ran a read-only Node comparison.
It compared every path-method pair, every full operation object, routing fields, components, and runner operation IDs.

The clone contains one modified file:

```text
 M inventory/stellar-light.json
```

`git diff --check` returned no output.

## Limitations

I did not call the live Scout service.
I did not run the inventory refresh command.
I did not run a routing gate or any QA arm.
I did not inspect runtime payload values.

The inventory records only its latest changelog item.
It does not preserve a release-by-release `1.9.24` through `1.9.30` mapping.
This report classifies the complete material field delta from retained `1.9.23` to generated `1.9.30`.

I made no code, policy, golden, TODO, improvement, or generated-artifact edit.
