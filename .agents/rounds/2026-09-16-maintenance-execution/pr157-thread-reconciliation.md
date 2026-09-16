# PR #157 unresolved thread reconciliation

Date: 2026-09-16

Mode: read-only audit

PR: `stellar-experimental/stellar-raven#157`

GitHub head: `b447ff403f82734a0297b56c78a1a5515aa1f824`

Frozen worktree: `/tmp/raven-execution-2026-09-16/pr157`

Fixed point: `722eef5f2a81845ebdd8206e17ee100344eabd58`

The GitHub GraphQL API returned five unresolved review threads.

Three threads are current.

Two threads are outdated.

No thread was resolved or changed.

No candidate file was modified.

## Summary

| Thread ID | GitHub location | Current state | Reconciliation | Safe to resolve after final code lands |
| --- | --- | --- | --- | --- |
| `PRRT_kwDOTpi64M6inhRO` | `catalog/manifest.json:20620` | Current | Count contracts are fixed at `test/catalog.test.ts:351-360`. | Yes, if final counts remain `20/202/282`. |
| `PRRT_kwDOTpi64M6inhRs` | `eval/qa/corpus/battery/compliance-rwa-payments/q-tw-escrow-api-auth-custody.json:29` | Current | The squash-only lifecycle still requires the separate proposal stage. | Only after proposal and activation stages land correctly. |
| `PRRT_kwDOTpi64M6inhSU` | `ecosystem-skills/MANIFEST.json:399-400` | Current | The sync timestamp now follows the pinned commit date. | Yes, if final generation retains these timestamps. |
| `PRRT_kwDOTpi64M6inhS2` | `ecosystem-skills/PIN-REVIEW.md:291` | Outdated | The text now separates mirrored and served counts. | Yes, after final code lands. |
| `PRRT_kwDOTpi64M6inhTd` | `eval/gates.json:8` | Outdated | The note is corrected, but the required round ledger is still missing. | No, until the final candidate includes the durable ledger. |

## Thread 1: catalog count contracts

Thread ID: `PRRT_kwDOTpi64M6inhRO`

Root comment ID: `PRRC_kwDOTpi64M7vgBUX`

Discussion: `https://github.com/stellar-experimental/stellar-raven/pull/157#discussion_r4018148631`

GitHub state: unresolved and current

GitHub location: `catalog/manifest.json:20620`

The thread reported stale `19/174/253` catalog assertions.

The current catalog entry remains at these lines:

- `catalog/manifest.json:20619` contains the corrected Trustless Work description.
- `catalog/manifest.json:20620` contains `skills.trustless-work.trustless-work-dev`.

The actual count repair is here:

- `test/catalog.test.ts:351-355` requires 20 whole skills and 202 skill sections.
- `test/catalog.test.ts:359-360` requires 282 total entries.

Verification evidence:

- `npm test` passed with 116 files and 2080 tests.
- `node scripts/build-catalog.mjs` generated 282 entries.
- The generated catalog contains 20 skills and 202 skill sections.

Disposition: fixed in the PR branch and verified in the frozen candidate.

Resolution guidance: safe after final code lands.

Recheck the assertions if the independent review changes source exposure.

## Thread 2: proposed-first lifecycle

Thread ID: `PRRT_kwDOTpi64M6inhRs`

Root comment ID: `PRRC_kwDOTpi64M7vgBVN`

Discussion: `https://github.com/stellar-experimental/stellar-raven/pull/157#discussion_r4018148685`

GitHub state: unresolved and current

GitHub location: `eval/qa/corpus/battery/compliance-rwa-payments/q-tw-escrow-api-auth-custody.json:29`

The thread requires a committed proposal before activation.

The original reply depended on internal PR commit history.

A squash merge would remove that proposal-first history.

The repository permits squash merges only.

The frozen candidate has an interim quarantine at these lines:

- `eval/qa/corpus/battery/compliance-rwa-payments/q-tw-escrow-api-auth-custody.json:27-50`

That interim state is not the final lifecycle solution.

The prepared proposal patch provides the correct first stage:

- `/tmp/raven-execution-2026-09-16/pr157-proposal-stage.patch`
- SHA-256: `ce542910b96d99dc0fa34ba43787929d10472489a6dcd61c5ccd46ff7d6dffb0`
- Proposal case: `eval/qa/corpus/proposed/compliance-rwa-payments/q-tw-escrow-api-auth-custody.json:27-30`
- Proposal registry counts: `eval/qa/lifecycle-registry.json:5-9`
- Proposal registry entry: `eval/qa/lifecycle-registry.json:3966-3971`

The proposal artifact records one proposed case and 500 active cases.

The parent must squash-merge that proposal separately.

PR #157 must then start from the proposal-stage `main` commit.

The final case must include real independent activation evidence.

Disposition: the issue remains open until both lifecycle stages exist on `main`.

Resolution guidance: do not resolve after only the proposal lands.

Resolve after final activation code lands and `npm run eval:qa:compile` passes.

## Thread 3: false synchronization provenance

Thread ID: `PRRT_kwDOTpi64M6inhSU`

Root comment ID: `PRRC_kwDOTpi64M7vgBWL`

Discussion: `https://github.com/stellar-experimental/stellar-raven/pull/157#discussion_r4018148747`

GitHub state: unresolved and current

GitHub location: `ecosystem-skills/MANIFEST.json:399-400`

The thread reported a sync timestamp before the pinned commit existed.

Current provenance lines:

- `ecosystem-skills/MANIFEST.json:2` sets `synced_at` to `2026-09-15T16:20:00Z`.
- `ecosystem-skills/MANIFEST.json:399-400` records the commit and `2026-09-12T04:46:13Z` date.
- `ecosystem-skills/INDEX.md:5` records the 2026-09-15 pin time.
- `catalog/manifest.json:23449` records the 2026-09-15 generation time.
- `specs/super-spec.json:161` records the 2026-09-15 generation time.

The sync time now follows the upstream commit time.

The dependent generated surfaces use the same sync time.

Verification evidence:

- A second generation pass produced the same candidate diff.
- `node scripts/check-mirrors.mjs` passed.
- `node scripts/check-pin-review.mjs --base 722eef5f2a81845ebdd8206e17ee100344eabd58` passed.

Disposition: fixed and verified in the PR branch.

Resolution guidance: safe after final code lands.

## Thread 4: mirrored count versus served count

Thread ID: `PRRT_kwDOTpi64M6inhS2`

Root comment ID: `PRRC_kwDOTpi64M7vgBW1`

Discussion: `https://github.com/stellar-experimental/stellar-raven/pull/157#discussion_r4018148789`

GitHub state: unresolved and outdated

Original GitHub location: `ecosystem-skills/PIN-REVIEW.md:291`

The thread reported a contradiction between mirrored and served skill counts.

The current text separates these counts:

- `ecosystem-skills/PIN-REVIEW.md:291` says the mirrored count changes from 20 to 21.
- `ecosystem-skills/PIN-REVIEW.md:291` notes that `lumenloop-mcp-connect` remains retired.
- `ecosystem-skills/PIN-REVIEW.md:292` says searchable whole skills change from 19 to 20.
- `ecosystem-skills/PIN-REVIEW.md:292` says served entries change from 253 to 282.
- `ecosystem-skills/PIN-REVIEW.md:292` says sections change from 174 to 202.

The thread became outdated because the target text changed.

The current count wording matches the catalog contract.

Disposition: fixed in the PR branch.

Resolution guidance: safe after final code lands.

## Thread 5: routing baseline decision record

Thread ID: `PRRT_kwDOTpi64M6inhTd`

Root comment ID: `PRRC_kwDOTpi64M7vgBXq`

Discussion: `https://github.com/stellar-experimental/stellar-raven/pull/157#discussion_r4018148842`

GitHub state: unresolved and outdated

Original GitHub location: `eval/gates.json:8`

The thread requires a current re-baseline note and durable decision record.

The stale 2026-09-09 rationale is gone.

Current evidence lines:

- `eval/gates.json:4` records the current baseline time.
- `eval/gates.json:8-9` records the current manifest fingerprint.
- `eval/gates.json:24-50` records exact accepted totals.
- `eval/gates.json:54` names all five routing identity movements.
- `ecosystem-skills/PIN-REVIEW.md:299-305` keeps independent review pending.

The current note does not claim completed independent review.

However, `eval/EVALS.md:67-73` requires a round-ledger decision record.

The frozen candidate does not include that durable round ledger.

The pending Grok review can provide the missing evidence.

The final candidate must commit that evidence under `.agents/rounds/`.

The gate note should point to the committed ledger.

Disposition: the stale rationale is fixed, but the finding remains open.

Resolution guidance: not safe after code landing without the ledger.

Resolve only after the ledger lands and the routing gate passes again.

## Final resolution map

- Thread `PRRT_kwDOTpi64M6inhRO`: fixed; resolve after final code lands.
- Thread `PRRT_kwDOTpi64M6inhRs`: lifecycle remains conditional; wait for both squash stages.
- Thread `PRRT_kwDOTpi64M6inhSU`: fixed; resolve after final code lands.
- Thread `PRRT_kwDOTpi64M6inhS2`: fixed and outdated; resolve after final code lands.
- Thread `PRRT_kwDOTpi64M6inhTd`: unresolved; wait for a committed round ledger.

No GitHub write occurred during this reconciliation.
