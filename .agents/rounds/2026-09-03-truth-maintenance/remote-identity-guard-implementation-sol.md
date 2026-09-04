# Remote identity guard implementation

Date: 2026-09-04

Branch: `codex/tm-remote-identity-guard`

Author lane: Codex GPT-5.6 Sol, high effort

Reviewed commit: `2ca588080c4ae9097aff66f79ff1a2dcc20126b5`

Required-repair base: `8cd724de76858a0c9d6fa0908964f3c119ed52aa`

Bounds-closure base: `e7c2ad8b61cbc73d27ab72fa5f7cbbb07e6dbb6c`

Review: `remote-identity-guard-review-opus.md`

## Outcome

The QA runner now has a production-ready remote identity guard.
The guard uses a committed, free, read-only probe.
The probe covers Scout, Lumenloop, and Stellar Docs.

The runner checks the probe before and after every answering call.
It stops before the next paid call after any change.
It also checks the remote vector after the local postflight.

The runner keeps completed rows and lists unattempted IDs.
It marks a stopped artifact as non-comparable.
It suppresses every aggregate after a stop.
It never permits resume with the same authorization.

## Finding reconciliation

| Finding | Status | Reconciliation |
|---|---|---|
| B1 | Reconciled | Added executable `eval/qa/probe-remote-identities.mjs`, deterministic canonicalization, tests, and `--stable-sha256`. |
| B2 | Reconciled | The child receives only `PATH`. The committed probe uses public, free, read-only sources. |
| B3 | Reconciled | Added a final remote postflight capture and baseline comparison. Its failure suppresses comparability. |
| F4 | Reconciled | Added required `--expect-remote-identity-sha256`. The first vector must match it before a paid call. |
| F5 | Reconciled | The wrapper rethrows the primary paid-call error. It attaches an after-probe error as `cause`. |
| F6 | Reconciled | `completedAnsweringCalls` increases only when the paid call returns. |
| F7 | Reconciled | Added table-driven paired-gate tests for all eight requested guard mutations. |
| F8 | Reconciled | Added real spawn tests for tampering, exit, timeout, overflow, missing, directory, and success paths. |
| F9 | Reconciled | Probe failures record a safe kind, path, status, signal, and timeout flag. They omit raw output. |
| F10 | Reconciled | Each request has a 20-second timeout, two retries, and a capped `Retry-After` delay. |
| F11 | Reconciled | Artifacts store `eval/qa/probe-remote-identities.mjs`. They never store the absolute path. |
| F12 | Reconciled | Updated `eval/EVALS.md` with remote comparability and listener-insufficiency rules. |

The repair also closes the review's pre-existing comparability observation.
Stored judging now requires `meta.comparable === true`.

## Required repair reconciliation

| Finding | Status | Reconciliation |
|---|---|---|
| R2 | Reconciled | The Docs probe discovers the page count, then requests exactly the remaining pages. |
| R3 | Reconciled | The 145-second process timeout covers the 140-second maximum network budget. |
| R5 | Reconciled | Pre-arm mismatches use an accurate reason. A stopped postflight adds no duplicate reason. |

## Bounds re-review reconciliation

| Finding | Status | Reconciliation |
|---|---|---|
| N1 | Accepted residual | Algolia HTTP requests rise while billed search operations fall. The report records both measures. |
| N2 | Accepted residual | The two Docs batches create a small torn-read window. A mixed vector still stops the arm. |
| N3 | Reconciled | The paired gate requires `skippedReason: null` for an attempted successful postflight. |
| N4 | Reconciled | A missing baseline has its own failure and comparability reason. |
| N5 | Accepted residual | The 145-second ceiling permits the complete bounded retry sequence. Normal captures remain much faster. |
| N6 | Accepted residual | The phase count remains explicit. The request-count and timeout tests guard the coupling. |

N1, N2, N5, and N6 are accepted residual notes.
They do not weaken the guard or change the six-field vector.

R2 changes the current Algolia search load from ten operations to seven operations per capture.
One discovery search returns page zero.
One batch returns the six remaining current pages.
The combined result still contains all 650 current title records.

The total HTTP load changes from six requests to seven requests per capture.
Algolia HTTP requests change from two to three per capture.
The extra HTTP request avoids three billed search operations.

For 1,001 captures, HTTP requests change from 6,006 to 7,007.
Algolia search operations change from 10,010 to 7,007.
Algolia settings reads remain 1,001.

Each request still permits three 20-second attempts.
Each of the two retry delays can reach the five-second `Retry-After` cap.
One complete request phase therefore has a 70-second limit.
The two sequential Docs phases have a 140-second limit.
The outer process timeout changes from 60 seconds to 145 seconds.

The probe accepts integer-seconds and IMF-fixdate `Retry-After` values.
It rejects malformed and negative values.
It caps valid values at five seconds.
It never records or prints the header value.

## Probe command

Run these commands before each new paid authorization:

```sh
REMOTE_IDENTITY_PROBE=eval/qa/probe-remote-identities.mjs
REMOTE_IDENTITY_PROBE_SHA256=$(shasum -a 256 "$REMOTE_IDENTITY_PROBE" | cut -d ' ' -f 1)
REMOTE_IDENTITY_SHA256=$(env -i PATH="$PATH" "$REMOTE_IDENTITY_PROBE" --stable-sha256)
```

The stable command makes three captures.
It waits five minutes between captures.
It exits unsuccessfully when any vector differs.

Pass both hashes to `run-qa.mjs`:

```sh
--remote-identity-probe "$REMOTE_IDENTITY_PROBE" \
--expect-remote-identity-probe-sha256 "$REMOTE_IDENTITY_PROBE_SHA256" \
--expect-remote-identity-sha256 "$REMOTE_IDENTITY_SHA256"
```

## Source identities

- Scout uses `https://stellarlight.xyz/api/openapi.json`.
- Scout records the advertised version and the canonical full-document hash.
- Lumenloop uses public `/v1/openapi.json`, `/v1/tools`, and `/v1/skills` responses.
- Lumenloop records the advertised OpenAPI version and one canonical inventory hash.
- Stellar Docs uses the public Algolia settings and multiple-query endpoints.
- Stellar Docs records the settings hash and the complete normalized `type:lvl1` title-set hash.

The Docs probe requests page zero before its remaining-page batch.
It requests exactly seven pages for the current index.
The probe fails when the result exceeds that complete 1,000-record window.
The complete current title set contains 650 records.

The probe uses seven public HTTP requests for the current index.
It starts six requests in parallel, then sends the remaining-page batch.
The runner sends no Claude variable or repository secret to the probe.

## Development capture

Two final development captures returned this vector hash:

`afd993854a981d4a5a3026ad047347c7a62a1b731b887ec08d48d5b9e07bbc7f`

Both captures used the same minimal environment as the runner.
These captures did not replace the formal five-minute pre-arm command.

The final observed service fields were:

- Scout version `1.9.30`, OpenAPI hash `2acc43c45eab21156a61d242c0d35b82ec7f9894854a01a88426e310b0311571`.
- Lumenloop identity `openapi-1.0.0`, inventory hash `a588bf486be8161c6bd31a8353a87f6dccd37a3ea2319bde77764708796a404c`.
- Stellar Docs settings hash `ca09d2a9804ce47eaca32486caa5f4cd3aca4bae00012f6234f6139d43de623c`.
- Stellar Docs title hash `aecaf9a5597ef8262a6d0f559272898c2fb2f0848a4523937525e909beb9b209`.

## Tests

- Focused guard, probe, pairing, and harness tests passed: 4 files and 191 tests.
- `npm run typecheck` passed.
- `npm test` passed: 105 files and 1,828 tests.
- One parallel gate run timed out in `test/eval-vectorize-clause-fit.test.mjs` at five seconds.
- The standalone full-suite rerun passed all 1,828 tests.
- `npm run build` passed.
- `npm run eval:qa:paired:validate` passed every deterministic gate.
- The minimal-environment live probe passed.
- No improvements file changed, so improvements checks did not apply.
- The tree and staged secret scans passed.

The tests cover matching vectors and each service change.
They cover the pre-arm pin and final postflight.
They cover metadata, aggregate suppression, and stop timing.
They prove that detection prevents the next paid call.
They reject every tested successful postflight with a non-null or absent skip reason.
They distinguish a missing baseline from an unavailable probe.

No test started a QA collection.
No command made a paid model call.

## Risks

Public source rate limits or outages can still stop an arm.
Bounded retries reduce transient failures but keep the guard fail-closed.

Each 500-call arm uses 1,001 probe captures plus one formal pre-arm sequence.
Each current normal capture makes seven public requests.
This cost is wall time and public request load, not model spend.

The guard hashes full public contracts and explicit public catalogs.
A real upstream contract change will stop the arm by design.

## Planning risks

R1 remains a planning risk only.
Scout release cadence can prevent two long arms from sharing one identity window.
This repair does not weaken the Scout fields or change the paired-run contract.

R4 remains a planning risk only.
The public Docs index has a 1,000-record pagination ceiling.
The probe fails closed if the page count exceeds ten.
The current title set uses 650 records.

## Remaining blockers

This repair removes every blocker in `remote-identity-guard-review-opus.md`.
It does not authorize a baseline or candidate QA arm.

The truth-maintenance baseline must remain stopped for two separate reasons:

- The Scout `1.9.30` drift decision remains open.
- The candidate artifact still needs a complete row review and closeout decision.

The owner must also resolve the R1 paired-run scheduling risk before new spend.

A future authorization must run the formal stable pre-arm command.
Both paired arms must use its same vector hash and the same committed probe bytes.

## Changed files

- `eval/qa/probe-remote-identities.mjs`
- `eval/qa/remote-identity-guard.mjs`
- `eval/qa/run-qa.mjs`
- `eval/qa/paired-verdict.mjs`
- `test/qa-remote-identity-probe.test.mjs`
- `test/qa-remote-identity-guard.test.mjs`
- `test/qa-paired-verdict.test.mjs`
- `test/qa-harness-preconditions.test.mjs`
- `eval/EVALS.md`
- `eval/qa/README.md`
- `.agents/skills/run-evals/SKILL.md`
- This implementation report

No golden or product scoring file changed.
