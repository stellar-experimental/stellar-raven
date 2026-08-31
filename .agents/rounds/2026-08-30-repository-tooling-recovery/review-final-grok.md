# Independent review: branch through ae00292

Date: 2026-08-30
Reviewer: Grok (vendor-diverse assumption attack)
Branch: `next/repo-tooling-recovery`
Head: `ae0029224bc1ae1d2cecca6891f60db253441499`
Range: `892d899..ae00292`
Commits: `a92ccf4` (mechanism), `ae00292` (review repair)
Prior reports: `/tmp/repo-recovery-receipt-grok-review.md`, `/tmp/repo-recovery-receipt-fable-review.md`

This review is read-only. No source file was edited. No paid eval, deploy, push, or merge ran.

## Verdict

The branch implements the receipt-gated recovery-only state machine.

Commit `ae00292` repairs the durable-record defects from the Fable audit. It also repairs the HMAC-order note from the first Grok review.

I found no blocking security or correctness defect.

**PASS**

## Blocking findings

None.

## Prior finding recheck

### Grok review (`a92ccf4`)

| Item | Status at `ae00292` |
| --- | --- |
| Mechanism, identity, one-use R2, same-execute, adapter guard | Still correct. Smoke still proves issue, consume, and replay. |
| Residual 1: version check before HMAC | **Fixed.** `parseAndVerify` in `src/policy/recovery-receipt.ts:171-172` verifies HMAC first. An unsigned `version: 2` payload now returns `invalid`. The unit case expects `invalid`. |
| Residual 2: micro-map named `scout.explainRepo` as a normal step | **Fixed.** `scripts/catalog-data/workflow-archetypes.mjs` dropped that step. `src/mcp/micro-map.ts` no longer names the id. |
| Residual 3: receipt does not bind `repo` | Open. Diagnosis still requires the model to supply the canonical owner/name. Not a mechanism defect. |
| Residual 4: sandbox throw after Docs issues no receipt | Open. Fail-closed. Caller must run Docs again. |
| Residual 5: playground `demo:` vs MCP `oauth:` / `api-key:` prefixes | Open. Receipts do not cross those surfaces. |

### Fable review (`a92ccf4`)

| Item | Status at `ae00292` |
| --- | --- |
| B1. `ARCHITECTURE.md` still said nothing callable can be policy-refused | **Fixed.** Envelope section now says a recovery-only miss returns `"error"` before dispatch. |
| B2. `eval/gates.json` pointed at a ledger that denied the re-baseline | **Fixed.** `.agents/rounds/2026-08-30-repository-tooling-recovery.md` records the 0/12 sequence, the receipt design, and the 209/280/312 and 11/23/26 totals. |
| B3. ADR-0003 forbade runtime-conditional dispatch with no new ADR | **Fixed.** `research/decisions/0009-recovery-only-discovery-receipts.md` is accepted. ADR-0003 status and a 2026-08-30 amendment point at it. |
| M1. Search `nextSteps` still described ranked source-code corroboration | **Fixed.** Hits are composable. Repository detail is separate. |
| M2. No channel named qualifying sources | **Fixed.** `codemode.describe("scout.explainRepo")` returns `qualifyingSources`. The rule names Stellar Docs RPC, SDK, or Soroban search. |
| M3. Minting ignores edge `on` with no artifact | **Fixed.** Architecture and `recoveryTransitionsFromLedger` state that any non-error completion qualifies. The shared receipt block tells the model to use empty or adjacent Docs results. |
| M4. Duplicate receipt block | **Fixed.** `recoveryReceiptBlock` in `src/policy/recovery-receipt.ts` is the single renderer. |
| M5. Architecture listed same-execute as a consume rejection | **Fixed.** That word is gone. `requestId` is marked audit-only. |
| L1. Second attempt without a receipt used a one-use message | **Fixed.** Message is "only one recovery-only attempt is allowed per execute". |
| L2. `RANKED_AUTHORITY_REPOSITORY_RULE` name | **Fixed.** Renamed to `AUTHORITY_REPOSITORY_RULE`. |
| L3. Operators could not see denial reasons | **Fixed.** Host logs `recovery_receipt` with `outcome: "denied"`, `reason`, and `target`. Tests prove the receipt string is absent. |
| L4. Two overclaiming test names | **Fixed.** |
| L5. No `x-discovery-mode` assertion | **Fixed.** `test/super-spec.test.ts` asserts `/scout/explainRepo` is `recovery-only`. |
| L6. Free gate overstated receipt policy | **Fixed.** `eval/EVALS.md` and `eval/repo-recovery/README.md` attribute receipts to unit and smoke tests. |
| L7. Memory R2 `*` assumption undocumented | **Fixed.** Issue `put` comments that R2 must treat `"*"` as If-None-Match wildcard. |

## Focused review of the branch

### Security, HMAC ordering, identity

HMAC-SHA256 still uses `MCP_SERVER_SECRET` and the `stellar-raven-recovery:` prefix.

`parseAndVerify` now verifies the signature before it reads `version`. A forged version field cannot produce a `version` failure.

Identity remains HMAC-bound, not raw. Consume checks identity before R2 writes.

`resolveRecoveryIdentity` still namespaces OAuth, API-key, and local-dev identities. Missing OAuth subject fails closed.

The sandbox never receives the secret. `callService` remains the only adapter path and sits after the host guard.

Denial logs include reason and target only. The denial test uses a dummy receipt string and asserts it is not logged.

### One-use concurrency and R2 conditions

Issue still uses `onlyIf: { etagDoesNotMatch: "*" }`.

Consume still uses `HEAD` then `onlyIf: { etagMatches: marker.etag }`.

workerd maps `"*"` to a wildcard ETag. Failed conditionals return `null`.

`recoveryAttempted` still blocks a second recovery-only call in one execute.

The Dynamic Worker smoke test still shows: direct miss, same-execute miss, one later success, then replay deny. Replay now also emits `recovery_receipt` with `reason: "replayed"`.

### Recovery-only discovery and qualifyingSources

Ranked hits, totals, and wider candidates still exclude `scout.explainRepo`.

Exact recovery still returns it from the three Docs `source-code` edges.

`qualifyingSourcesForRecoveryTarget` sorts inbound `source-code` sources:

- `stellarDocs.search_rpc_horizon_data_docs`
- `stellarDocs.search_sdk_cli_tools_docs`
- `stellarDocs.search_soroban_contract_docs`

`codemode.describe` attaches that list only when `discoveryMode === "recovery-only"`.

### Generated artifacts and frozen eval integrity

`catalog/manifest.json` still only adds `discoveryMode: "recovery-only"` and `searchable: false` on `scout.explainRepo`.

SHA-256 is `efd567d04ed0b00d27d0a664ab2d225d04362e657f1661ae7cfab330e89324d1`. That matches `eval/gates.json`.

`specs/super-spec.json` still has `x-discovery-mode: "recovery-only"`.

`ae00292` did not edit frozen corpora: routing cases, holdout cases, QA goldens, or repo-recovery cases.

The free repo-recovery gate still reports 12 exact positive edges and 0 ordinary discovery leaks.

`git diff --check 892d899..ae00292` is clean.

### ADR coherence

ADR-0009 states the new design in positive form: manifest exposure, host gate, identity/target/expiry/nonce binding, one-use R2 consume, error envelope, denial logs without receipt content.

ADR-0003 now says it is amended by ADR-0009. The 2026-08-30 amendment says this is not a generic deny layer.

One leftover sentence in ADR-0003 is slightly wide: it says the design "does not alter catalog, search, spec, or describe visibility." Ranked search membership did change. ADR-0009 states that ranked search excludes the operation. Exact catalog, spec, describe, and graph recovery remain exposed. That leftover line is not a security defect.

## Residual notes (not blocking)

1. `research/decisions/0003-build-time-exposure-filtering.md` (2026-08-30 amendment) says search visibility is unaltered. Ranked membership changed. ADR-0009 is the accurate record.

2. The receipt still does not bind the `repo` argument. Frozen Go SDK rows can still pick `stellar/go`.

3. A sandbox throw after a qualifying Docs call still issues no receipt.

4. Playground identity `demo:${subject}` still does not share receipts with MCP identities.

## Tests run (read-only)

Unit: 8 files, 321 passed.

- `test/recovery-receipt.test.ts`
- `test/executor-providers.test.ts`
- `test/search.test.ts`
- `test/catalog.test.ts`
- `test/mcp-instructions.test.ts`
- `test/server.test.ts`
- `test/super-spec.test.ts`
- `test/repo-recovery.test.mjs`

Smoke: `test/smoke/executor.test.ts` receipt case passed on a real Dynamic Worker.

Free gates:

- `npm run eval:repo-recovery:lint` — PASS
- `npm run eval:repo-recovery -- --gate` — PASS

Routing gate was not re-run in this pass. Catalog bytes and `eval/gates.json` fingerprints did not change after `a92ccf4`. The earlier Grok pass already saw `GATE PASS` at baseline `2026-08-30T20:57:46.024Z`.

## Conclusion

`a92ccf4` shipped the host receipt machine. `ae00292` aligned architecture, ADRs, ledger, discovery guidance, HMAC order, denial logs, and tests with that machine.

No blocking finding remains.

PASS
