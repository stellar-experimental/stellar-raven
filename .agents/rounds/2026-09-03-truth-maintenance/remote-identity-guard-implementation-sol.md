# Remote identity guard implementation

Date: 2026-09-04

Branch: `codex/tm-remote-identity-guard`

Author lane: Codex GPT-5.6 Sol, high effort

## Outcome

The QA runner now enforces remote service identity during each answering call.
It requires a reviewed executable probe and an exact probe SHA-256.
The probe covers Scout, Lumenloop, and Stellar Docs.

The isolated worktree lacked the requested stop audit file.
I read the root worktree copy without editing that worktree.

## Probe contract

The probe prints one `qa-remote-identity-vector-v1` JSON object.
The object has exact keys and no optional fields.
Extra fields cause a failure.
This rule excludes timestamps and volatile telemetry.

The vector contains these values:

- Scout OpenAPI version and canonical OpenAPI SHA-256.
- Lumenloop advertised contract identity and canonical inventory SHA-256.
- Stellar Docs index settings SHA-256 and canonical title-set SHA-256.

The runner executes the probe without a shell.
It rechecks the executable bytes before every probe.
It does not store raw stdout or stderr.
It stores only validated fields and vector hashes.

## Stop behavior

The runner captures one vector before each answering call.
It captures a second vector after that call.
Each later before-call vector must match the first vector.
Each after-call vector must match its paired before-call vector.

An unavailable probe stops before the next paid call.
An identity change has the same effect.
The runner does not start a retry or judge after detection.

The artifact preserves each completed answering row.
It lists all later IDs in `meta.unattemptedIds`.
It sets `meta.comparable` to `false`.
It sets `meta.aggregatesSuppressed` to `true`.
It removes the summary and measurement metrics.

`meta.remoteIdentityGuard.failure` records the changed service.
It also records both identity vectors.
Probe failures record a null unavailable vector.
The record forbids a same-authorization resume.
Stored judging also rejects the non-comparable artifact.

## Paired analysis

The paired printer now requires a complete remote identity guard.
It requires matching probe bytes across all artifacts.
It also requires one matching baseline remote vector.
A missing or different vector returns `INDETERMINATE`.

## Changed files

- `eval/qa/remote-identity-guard.mjs` implements the probe contract and state guard.
- `eval/qa/run-qa.mjs` wraps every answering call with the guard.
- `eval/qa/paired-verdict.mjs` validates the guard and cross-arm vector.
- `test/qa-remote-identity-guard.test.mjs` adds focused guard tests.
- `test/qa-paired-verdict.test.mjs` adds the cross-arm identity test.
- `test/qa-harness-preconditions.test.mjs` registers the new CLI flags.
- `eval/qa/README.md` documents the probe contract and stop rules.
- `.agents/skills/run-evals/SKILL.md` adds the required launch inputs.

No golden or product-scoring file changed.

## Verification

- Focused guard, pairing, and harness tests: 149 passed.
- `npm run typecheck`: passed.
- `npm test`: 104 files and 1,786 tests passed.
- `npm run build`: passed.
- `npm run eval:qa:paired:validate`: passed all deterministic gates.
- `npm run secrets:scan -- --tree`: passed.
- `npm run secrets:scan`: passed for all staged changes.

The first sandboxed full test rerun could not open fixture sockets.
Its Git fixtures also could not access the GPG agent.
The permitted rerun passed all tests.

Wrangler could not write its user log inside the sandbox.
It still generated the required types and completed the dry-run build.

No command started a QA collection.
No command made a paid model call.
