# Independent exact-old-runtime adapter review

Date: 2026-09-03

Role: independent reviewer

## Decision

The adapter has a sound local design.
Its paid measurement gate is not complete.

Do not start any paid call.
I made no implementation edit or paid call.

## Scope

I read these planning records:

- `.agents/rounds/2026-09-03-truth-maintenance/two-week-impact-prespend-sol.md`
- `.agents/rounds/2026-09-03-truth-maintenance/adapter-implementation-sol.md`
- `.agents/rounds/2026-09-03-truth-maintenance.md`

I inspected every file named by the implementation report:

- `eval/qa/exact-old-runtime-adapter.mjs`
- `eval/lib/bound-server-identity.mjs`
- `eval/qa/run-qa.mjs`
- `eval/qa/judge.mjs`
- `eval/qa/run-p6-judge-self-test.mjs`
- `package.json`
- `test/exact-old-runtime-adapter.test.mjs`
- `test/p6-judge-self-test.test.mjs`
- `test/qa-harness-preconditions.test.mjs`

I also inspected the unchanged paired-result gate.
That gate is `eval/qa/paired-verdict.mjs`.

## Findings

### 1. Blocker: the paired gate ignores the adapter contract

`collectionTuple()` does not include `meta.runtimeAdapter`.
It also omits `meta.listenerPairGuard`.
See `eval/qa/paired-verdict.mjs:147`.

The comparison only checks the existing collection tuple.
See `eval/qa/paired-verdict.mjs:235`.

Therefore, the printer can accept an invalid cross-arm topology.
One arm can omit the adapter.
The modes can also be reversed or mismatched.
The adapter hashes can differ without a pairing error.

The shared QA implementation hash does not fix this defect.
That hash proves file availability only.
It does not prove adapter use.

Exact repair:

1. Add an adapter-specific pairing guard.
2. Require `runtimeAdapter` on every baseline and candidate artifact.
3. Require schema `exact-old-runtime-adapter-v1` on both arms.
4. Require one `adapterRevision` and one `implementationSha256` across both arms.
5. Require identical public and private ports under this registered method.
6. Require baseline mode `add-missing`.
7. Require candidate mode `verify-native`.
8. Require each adapter source revision to equal its server revision.
9. Require both preflight and postflight attestations to match.
10. Require `listenerPairGuard.matches: true` on both artifacts.
11. Reject a missing, direct, reversed, or mixed adapter topology.
12. Add negative paired-result tests for every rejected topology.

### 2. Blocker: the paid self-test does not report total spend

The wrapper forwards child text without parsing it.
See `eval/qa/run-p6-judge-self-test.mjs:18`.

Its final result contains only the wrapper hash and call count.
See `eval/qa/run-p6-judge-self-test.mjs:49`.

The wrapper does not produce these required values:

- `reportedCosts`
- `missingCosts`
- `totalCostUsd`
- the seven machine-readable call records

Each child enforces its `$0.50` cap.
This correctly limits the maximum to `$3.50`.
However, the operator cannot reconcile the actual total automatically.

The wrapper also lacks a clean-runner guard.
It does not require a runner revision.
It does not require Claude binary or environment hashes.

`runJudgeSelfTestCandidate()` passes only `maxBudgetUsd` to the judge.
See `eval/qa/judge.mjs:895`.
The default `claude` resolution can therefore change between child processes.

Exact repair:

1. Make each child return one strict JSON result.
2. Parse all seven results in the wrapper.
3. Reject missing, duplicate, negative, or over-cap costs.
4. Print one machine-readable total summary.
5. Include `reportedCosts`, `missingCosts`, and `totalCostUsd`.
6. Require the clean runner revision before the first paid call.
7. Require the Claude binary SHA-256.
8. Require the Claude environment SHA-256.
9. Resolve one Claude path before all seven calls.
10. Pass that exact path to every judge child.
11. Add tests for total accounting and identity drift.

### 3. Blocker: no test uses the exact old runtime

The adapter tests use a mock HTTP server.
They also use simulated listener identities.
See `test/exact-old-runtime-adapter.test.mjs:64`.

No recorded test starts revision `90d0ba75eb529c6a1cf6fe276f16cf4f1da4f9f0`.
No recorded test starts the final candidate runtime.

Therefore, actual Wrangler compatibility remains unproved.
The tests prove the proxy functions in isolation.
They do not prove the registered operator topology.

Exact repair:

1. Create the three clean worktrees from the reviewed plan.
2. Start the exact old Wrangler on the private port.
3. Start the adapter from the clean runner worktree.
4. Compare direct and adapted old initialize results.
5. Prove that only `serverInfo.sourceRevision` differs semantically.
6. Compare direct and adapted `tools/list` results and surface hashes.
7. Run one deterministic `search` through both old paths.
8. Record both real listener and worktree attestations.
9. Repeat the direct and adapted checks for the candidate.
10. Prove byte preservation for the candidate initialize body.
11. Repeat all checks after the probes.
12. Save the free evidence paths and SHA-256 values in the ledger.

### 4. High: modified responses can carry stale integrity headers

The old-arm response body changes after revision injection.
The code then replaces only `Content-Length`.
See `eval/qa/exact-old-runtime-adapter.mjs:186`.

The code preserves any old `ETag`, `Digest`, or `Content-MD5` value.
Those values can describe the unmodified body.
This breaks response integrity semantics.

The `deflate` fallback also calls `gunzipSync()`.
See `eval/qa/exact-old-runtime-adapter.mjs:208`.
That fallback cannot decode a raw deflate stream.

My raw-deflate HTTP probe returned `502` with `incorrect header check`.
The current tests do not cover response codecs.

The tests also omit a full HTTP candidate-preservation path.
They test candidate preservation only in the body helper.
See `test/exact-old-runtime-adapter.test.mjs:143`.

Exact repair:

1. Remove or recompute every body integrity header after old-arm mutation.
2. Preserve all such headers unchanged in candidate mode.
3. Replace the invalid fallback with the intended raw-deflate decoder.
4. Add identity, gzip, deflate, raw-deflate, and Brotli tests.
5. Add JSON and SSE tests for both modes.
6. Add full HTTP tests for candidate byte preservation.
7. Add tests for integrity-header handling.

### 5. Blocker: the launch record is still incomplete

The round ledger still contains the old `$875` table.
It does not contain the reviewed `$853.50` full-pair method.

The active tree is dirty.
The runner and final candidate revisions are not frozen.
The final surface, corpus, stability, binary, environment, and upstream pins are absent.

The adapter report also contains stale self-test evidence.
It reports a 14-of-15 static result.
The current free static check passes 15 of 15.

Exact repair:

1. Reconcile findings 1 through 4.
2. Update the adapter report with the current static result.
3. Amend the round ledger with the `$853.50` method.
4. Commit one clean runner revision.
5. Commit one clean final candidate revision.
6. Freeze the final 500-case bytes and ordered IDs.
7. Freeze every required measurement pin.
8. Run the real free adapter proof.
9. Obtain another bounded independent delta review.
10. Run the paid `p6` self-test only after that review passes.

## Verified behavior

The old-arm mutation is narrow at the JSON object level.
`add-missing` rejects any native source revision.
It adds the attested revision only when the field is absent.

The candidate helper preserves the original input buffer.
`verify-native` rejects a missing or mismatched native revision.

Non-initialize responses stream without adapter buffering.
The test preserves status, body, session headers, and JSON-RPC errors.

The adapter binds to `127.0.0.1`.
Its attestation endpoint is outside `/mcp`.

The adapter process checks its clean runner worktree.
It checks the expected runner revision.

The adapter checks the private Wrangler listener before startup.
It repeats that check before initialize attestation.
It repeats that check for the local attestation endpoint.

The runner checks both listeners before collection.
It checks different ports, processes, and worktrees.
It repeats both checks after collection.
It marks postflight failures as non-comparable.

The runner requires the adapter mode, revision, hash, and private port together.
It rejects partial adapter flags.
It rejects a local adapter hash mismatch.

The current adapter SHA-256 matches the implementation report:

`ff392a22f2de96d8c11d54bcb2fa0092602d97ba1b2efef4c5c1c3be917b9dfd`

The current wrapper SHA-256 also matches the report:

`85dd6a22bdb1c1acbcc742d7b80fb8cfcf02898c15dba2c9b3570bbcee36f834`

The ordinary full-arm runner still requires one `--max-budget-usd` value.
The reviewed operator shape uses `$400` for each full arm.

The uncapped legacy self-test command now fails before a paid call.
The free static preflight now passes all 15 prompt fixtures.

## Commands run

No command below made a paid model call.

```sh
./node_modules/.bin/vitest run \
  test/exact-old-runtime-adapter.test.mjs \
  test/p6-judge-self-test.test.mjs \
  test/qa-harness-preconditions.test.mjs \
  test/qa-budget.test.mjs
```

Result: 4 files passed and 134 tests passed.

```sh
./node_modules/.bin/vitest run \
  test/qa-paired-verdict.test.mjs \
  test/qa-postflight-keepalive.test.mjs \
  test/qa-judge-evidence.test.mjs
```

Result: 3 files passed and 126 tests passed.

```sh
npm run typecheck
```

Result: passed.

```sh
npm run eval:qa:paired:validate
```

Result: passed.
The output still uses mixed-tuple calibration.

```sh
npm run eval:qa:runtime-adapter -- --print-sha256
npm run eval:qa:selftest -- --print-sha256
node eval/qa/judge.mjs --self-test-static
```

Result: both hashes matched, and the free static preflight passed.

```sh
node eval/qa/judge.mjs --self-test
```

Result: the command failed before any paid call, as required.

## Paid measurement gate

The `$400` arm caps remain valid.
The seven `$0.50` child caps bound the self-test at `$3.50`.

The gate still lacks cross-arm adapter enforcement.
The self-test still lacks complete cost and executable identity evidence.
The exact old runtime has no real free compatibility proof.

The operator commands are structurally consistent.
They remain templates until every placeholder receives a frozen value.

Paid launch remains blocked.

CHANGES-REQUIRED

## Final bounded delta review

Date: 2026-09-03

This section supersedes the earlier code verdict.
It reviews only the repairs listed above.
It does not require the real worktree proof.
It does not authorize paid work.

### Paired topology enforcement

`eval/qa/paired-verdict.mjs` now rejects an unregistered adapter topology.

The gate requires both artifacts to use `exact-old-runtime-adapter-v1`.
It requires baseline mode `add-missing` and candidate mode `verify-native`.
It requires one adapter revision, implementation hash, public port, and private port.

Each adapter source revision must equal its artifact server revision.
Each public port must equal the artifact port.
The public and private ports must differ.

The gate requires equal preflight and postflight listener records.
It also requires equal preflight and postflight adapter records.
Both stability guards must report success for each listener.

The runner creates these records from two different processes and worktrees.
`dualBoundServerIdentity()` rejects an equal process, worktree, or port.

The paired tests cover missing, direct, reversed, and mixed adapter topologies.
They also cover revision, hash, port, source, attestation, and guard drift.

Finding 1 is repaired.

### P6 JSON accounting and identity

The wrapper runs one free static preflight before any paid child.
It then authorizes exactly seven sequential child calls.
Each child receives exactly `--max-budget-usd 0.50`.

Each child returns one strict `p6-judge-self-test-call-v1` JSON object.
The wrapper rejects extra fields and malformed JSON.
It rejects missing, negative, duplicate, and over-cap cost records.

The summary uses `p6-judge-self-test-summary-v1`.
It records all seven child records.
It records `reportedCosts`, `missingCosts`, and `totalCostUsd`.
Its maximum authorized cost is `$3.50`.

The wrapper requires a clean runner revision.
It requires the Claude path, binary SHA-256, and environment SHA-256.
It resolves one Claude path for all seven children.

The wrapper checks runner, path, real path, version, binary, and environment stability.
It checks identity before and after every child.
Each child also checks identity around its paid call.

Finding 2 is repaired.

### Response fidelity and codecs

The old arm changes only `serverInfo.sourceRevision` in the initialize result.
The candidate arm returns the original initialize bytes.

An old-arm mutation removes stale body integrity headers.
This includes `ETag`, `Digest`, `Content-MD5`, `Content-Digest`, and `Repr-Digest`.
It also removes `X-Goog-Hash` and every `X-Amz-Checksum-*` header.

The adapter recomputes `Content-Length` when the upstream response supplied it.
It preserves unrelated headers, status, status text, session data, and encoding.

Candidate mode preserves all tested response bytes and headers.
The HTTP tests cover JSON and SSE responses.

The deflate decoder first accepts zlib-wrapped data.
It then uses `inflateRawSync()` for raw deflate data.

The tests cover identity, gzip, zlib deflate, raw deflate, and Brotli.
The raw deflate HTTP path now passes.

Finding 4 is repaired.

### Planning and remaining operations

The round ledger now marks the `$875` table as superseded.
It contains the reviewed `$853.50` paired-method cap.

The implementation report records the current static result and hashes.

- Adapter SHA-256: `5d1237a56e1354957833247b53e6446b515ef486b16087fa2a9d0451ea17d583`
- Wrapper SHA-256: `8f063404b9bccbcf41a9c544163cf7dda0b10d88b4e78a2afb4b051cbf60c206`

The clean revisions and final measurement pins remain operational launch requirements.
The real old-runtime proof also remains an operational launch requirement.
These items do not block this bounded code verdict.

Findings 3 and 5 are outside this code verdict where they require live frozen processes.
The ledger repair from finding 5 is complete.

### Independent verification

No command made a paid call.

```sh
./node_modules/.bin/vitest run \
  test/exact-old-runtime-adapter.test.mjs \
  test/p6-judge-self-test.test.mjs \
  test/qa-paired-verdict.test.mjs \
  test/qa-harness-preconditions.test.mjs \
  test/qa-budget.test.mjs
```

Result: five files passed and 198 tests passed.

```sh
npm run eval:qa:paired:validate
```

Result: all six deterministic gates passed.
The output remains labeled `mixed-tuple calibration`.

```sh
node eval/qa/judge.mjs --self-test-static
```

Result: all 15 prompt hashes matched.
All static behavior checks passed.

```sh
node eval/qa/judge.mjs --self-test
```

Result: the command stopped before any paid call.

```sh
npm run typecheck
git diff --check -- eval/lib/bound-server-identity.mjs eval/qa/exact-old-runtime-adapter.mjs eval/qa/judge.mjs eval/qa/paired-verdict.mjs eval/qa/run-p6-judge-self-test.mjs eval/qa/run-qa.mjs package.json test/exact-old-runtime-adapter.test.mjs test/p6-judge-self-test.test.mjs test/qa-harness-preconditions.test.mjs test/qa-paired-verdict.test.mjs
```

Result: both checks passed.

PASS-CODE-READY

## Post-audit reviewability verdict

Date: 2026-09-03

This review covers the three repairs in `reviewability-audit-sol.md`.
It makes no implementation edit and authorizes no paid work.

### Adapter schema ownership

`eval/qa/exact-old-runtime-adapter.mjs` now owns and exports `RUNTIME_ADAPTER_SCHEMA`.
`eval/qa/run-qa.mjs` imports that constant for adapter metadata.
`eval/qa/paired-verdict.mjs` imports that constant for artifact validation.

The schema remains `exact-old-runtime-adapter-v1`.
The adapter record shape and all validation rules remain unchanged.
The focused tests cover adapter metadata, paired topology, and runner preconditions.

### P6 schema ownership

`eval/qa/judge.mjs` remains the owner of `P6_SELF_TEST_CALL_SCHEMA`.
`eval/qa/run-p6-judge-self-test.mjs` imports and re-exports that constant.

The call schema remains `p6-judge-self-test-call-v1`.
The summary schema remains `p6-judge-self-test-summary-v1`.
The strict call record shape remains unchanged.
The seven-call limit and the `$0.50` per-call cap remain unchanged.

### Super-spec size record

`research/super-spec-design.md` now records 287,782 pretty bytes.
It also records 174,786 compact bytes.

The current `specs/super-spec.json` contains 287,782 bytes.
Its compact JSON form contains 174,786 bytes.
Its SHA-256 remains `93799e8c9e5c9045b1f2352d2611c1741d2d2458e12712de81da878a33147538`.
The repair changes only the stale size record.

### Current implementation hashes

| File | SHA-256 |
| --- | --- |
| `eval/qa/exact-old-runtime-adapter.mjs` | `473690c7f10d5384be252bb97f9aa16ee88428d23589779289f5910c08e60303` |
| `eval/qa/run-p6-judge-self-test.mjs` | `7526fdfb2f9c2c6a50d6b653830d818b403989a9eec5e26ab9470511e79e50f8` |

Both operator hash commands matched direct `shasum -a 256` results.
These hashes replace the earlier hashes in this report.

### Focused verification

```sh
./node_modules/.bin/vitest run \
  test/exact-old-runtime-adapter.test.mjs \
  test/p6-judge-self-test.test.mjs \
  test/qa-paired-verdict.test.mjs \
  test/qa-harness-preconditions.test.mjs
```

Result: four files passed and 177 tests passed.
No command made a paid model call.

The three repairs preserve the measured contracts.
They remove duplicate ownership and correct one stale document record.

PASS-CODE-READY
