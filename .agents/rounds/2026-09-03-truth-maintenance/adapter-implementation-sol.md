# Exact-old-runtime adapter implementation reconciliation

Date: 2026-09-03

## Outcome

I repaired every implementation finding in `adapter-review-sol.md`.
I made no paid call.
I did not attempt the real old-runtime worktree proof.
I made no production, generated, golden, or exposure change for this repair.

The paid launch remains blocked until the real proof and revision freeze occur.

## Cross-arm adapter pairing guard

`eval/qa/paired-verdict.mjs` now requires the adapter on every paired artifact.
It rejects a direct, missing, reversed, or mixed adapter topology.

The guard requires these facts for all baseline and candidate runs:

- The adapter schema is `exact-old-runtime-adapter-v1`.
- The baseline mode is `add-missing`.
- The candidate mode is `verify-native`.
- One adapter revision serves both arms.
- One adapter SHA-256 serves both arms.
- Both arms use identical public and private ports.
- Each adapter source revision equals its server revision.
- Each public port equals the artifact port.
- Each listener pair matches the registered topology.
- Preflight and postflight listener attestations are identical.
- Preflight and postflight adapter attestations are identical.
- Every adapter attestation reports `matches: true`.
- Every dual-listener guard reports `matches: true` for both listeners.

The negative tests cover each rejected condition.
They also cover adapter, listener, mode, revision, hash, and port drift.

## Response preservation and codecs

The old arm still adds only `serverInfo.sourceRevision`.
The candidate arm still returns the original initialize response bytes.

An old-arm body mutation now removes stale body integrity headers.
The removed headers include `ETag`, `Digest`, `Content-MD5`, `Content-Digest`, and `Repr-Digest`.
The rule also removes `X-Goog-Hash` and all `X-Amz-Checksum-*` headers.
It recomputes `Content-Length` when the upstream response supplied that header.

Candidate mode preserves all response headers and body bytes.
It also preserves the status, status text, session header, content encoding, and content length.

The `deflate` fallback now uses `inflateRawSync` for raw deflate data.
The adapter supports identity, gzip, zlib deflate, raw deflate, and Brotli inputs.

The focused HTTP tests cover JSON and SSE initialize responses.
They cover both adapter modes and every supported codec.
They also cover full candidate response preservation and integrity-header behavior.

## P6 judge self-test contract

`npm run eval:qa:selftest` remains evaluation-only.
The wrapper still authorizes exactly seven judge calls.
It injects the exact `--max-budget-usd 0.50` pair into each call.
It runs calls sequentially and stops after the first failure.

The wrapper now requires these operator pins before the first paid call:

- `--runner-revision <RUNNER_SHA>`
- `--claude-path <ABSOLUTE_CLAUDE_PATH>`
- `--expect-claude-binary-sha256 <CLAUDE_SHA256>`
- `--expect-claude-environment-sha256 <ENVIRONMENT_SHA256>`

The runner worktree must be clean at the pinned revision.
The wrapper resolves one Claude path before all seven calls.
It verifies the Claude binary and environment hashes before all calls.
It repeats all identity checks before and after each call.
Each child repeats the same checks around its one paid call.

The wrapper detects runner, binary, path, version, real-path, and environment drift.
It passes one exact Claude path and the same hashes to every child.

Each child writes one strict `p6-judge-self-test-call-v1` JSON object.
The wrapper rejects non-JSON output and unexpected object fields.
It rejects missing, duplicate, negative, and over-cap cost records.

After seven successful calls, the wrapper writes one JSON summary.
The summary schema is `p6-judge-self-test-summary-v1`.
It contains all seven call records.
It also contains `expected`, `actual`, `reportedCosts`, `missingCosts`, and `totalCostUsd`.
The maximum authorized total remains `$3.50`.

The operator command is:

```sh
npm run eval:qa:selftest -- \
  --runner-revision <RUNNER_SHA> \
  --claude-path <ABSOLUTE_CLAUDE_PATH> \
  --expect-claude-binary-sha256 <CLAUDE_SHA256> \
  --expect-claude-environment-sha256 <ENVIRONMENT_SHA256>
```

The wrapper rejects a command without all four pins before any paid call.
I confirmed that fail-closed behavior without making a paid call.

## Current implementation hashes

The adapter hash command is:

```sh
npm run eval:qa:runtime-adapter -- --print-sha256
```

The adapter SHA-256 is:

`5d1237a56e1354957833247b53e6446b515ef486b16087fa2a9d0451ea17d583`

The wrapper hash command is:

```sh
npm run eval:qa:selftest -- --print-sha256
```

The wrapper SHA-256 is:

`8f063404b9bccbcf41a9c544163cf7dda0b10d88b4e78a2afb4b051cbf60c206`

## Files changed by the adapter work

Implementation files:

- `eval/lib/bound-server-identity.mjs`
- `eval/qa/exact-old-runtime-adapter.mjs`
- `eval/qa/judge.mjs`
- `eval/qa/paired-verdict.mjs`
- `eval/qa/run-p6-judge-self-test.mjs`
- `eval/qa/run-qa.mjs`
- `package.json`

Focused test files:

- `test/exact-old-runtime-adapter.test.mjs`
- `test/p6-judge-self-test.test.mjs`
- `test/qa-harness-preconditions.test.mjs`
- `test/qa-paired-verdict.test.mjs`

This report is the only round record changed by this reconciliation.

## Exact verification results

No verification command made a paid call.

| Check | Result |
| --- | --- |
| Focused Vitest command | 5 files passed; 198 tests passed |
| `node eval/qa/judge.mjs --self-test-static` | passed; 15 of 15 prompt hashes matched |
| `npm run eval:qa:paired:validate` | passed; all six deterministic gates passed |
| `npm run typecheck` | passed; exit 0 |
| `npm run build` | passed; exit 0 |
| Build upload | 6854.67 KiB; gzip 1374.73 KiB |
| `npm run secrets:scan -- --tree` | passed; no leaks found |
| `git diff --check` | passed; exit 0 |
| Adapter SHA-256 | `5d1237a56e1354957833247b53e6446b515ef486b16087fa2a9d0451ea17d583` |
| Wrapper SHA-256 | `8f063404b9bccbcf41a9c544163cf7dda0b10d88b4e78a2afb4b051cbf60c206` |
| Production marker scan | passed; adapter and P6 code are absent from `dist` |
| Unpinned P6 command | rejected before any paid call |

## Remaining proof gate

The active tree is not a clean runner revision.
The exact old-runtime worktree proof remains unexecuted by instruction.
The final candidate revision and measurement pins also remain unfrozen.

Do not run the paid P6 self-test yet.
Do not run either paid 500-case arm yet.

BLOCKED
