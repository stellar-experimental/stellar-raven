---
id: sd-066
service: stellar-docs
status: verified
discovered: 2026-11-02
upstreamTitle: Test Events guide says env.events().all() returns events since the Env was created
evidence:
  - 2026-11-02T17:17:27Z GET https://developers.stellar.org/docs/build/guides/testing/test-contract-events returned HTTP 200 with "// Get all events published since the Env was created." after three client.increment() calls, and an expected list of three events
  - stellar/stellar-docs main 7cb5e8a492706d2ae95bbb14be737fbf96100058 docs/build/guides/testing/test-contract-events.mdx lines 17-41
  - stellar/rs-soroban-sdk v29.0.1 soroban-sdk/src/testutils.rs lines 552-553 "Returns all contract events that have been published by the last contract invocation. If the last contract invocation failed, no events are returned."; rs-soroban-sdk PR 1638 (merged 2026-01-09, released in v25.0.0) added this comment with the ContractEvents return type, documenting behavior that already existed
  - 2026-11-02 local reproduction with soroban-sdk 29.0.1 testutils - three client.increment() calls, each publishing one event, then env.events().all().events().len() printed EVENTS_AFTER_3_CALLS=1
  - 2026-11-02 bisect: three client.increment() calls then env.events().all().len() printed 3 on soroban-sdk 22.0.0 and 22.0.3 (soroban-env-host 22.1.2) and 1 on 22.0.4 (same host), 22.0.7, and 23.0.1; soroban-sdk v22.0.4 released 2024-12-20
  - stellar/soroban-examples 65d25d2402 (2025-02-27, "Update soroban-sdk crates to 22.0.7 (#366)") rewrote events/src/test.rs from three-call/three-event to per-call assertions
  - 2026-11-02 verbatim guide test on soroban-sdk 29.0.1 compiles (ContractEvents implements PartialEq<Vec<(Address, Vec<Val>, Val)>>) and panics at assert_eq; left has one event with data U32(3)
  - docs/build/smart-contracts/example-contracts/events.mdx line 239 already says all() returns the events published by the last contract invocation
  - Raven eval golden case q-sor-test-event-assertion-ordering, audited 2026-11-02
---

## Finding

The Test Events guide says that `env.events().all()` returns every event published since the
`Env` was created. Its example makes three top-level calls and expects three events.

Since soroban-sdk 22.0.4, `env.events().all()` returns only the events of the last contract
invocation. With the current SDK, the example sees one event, so the assertion fails at run time.
The example still compiles.

## Evidence

The live guide calls `client.increment()` three times. It then compares `env.events().all()`
with a list of three events. The comment says "Get all events published since the Env was
created."

The soroban-sdk v29.0.1 doc comment for `Events::all` says: "Returns all contract events that
have been published by the last contract invocation. If the last contract invocation failed, no
events are returned." The SDK added this comment in v25.0.0, but the behavior is older. A local test with
soroban-sdk 22.0.3 returned three events after three calls. The same test with 22.0.4 returned one.
soroban-examples changed its own events test to per-call assertions in the 22.0.7 upgrade.

A local run of the guide's exact test with soroban-sdk 29.0.1 compiled and failed the assertion.
The left side held one event, with data `3`.

## Recommendation

Change the example to check events after each call, or to assert one event after the last call.
Change the comment to say that `all()` returns the events of the last invocation. The tuple
comparison form still compiles, so only the expected events must change. The events example page
already shows the correct pattern.

Optional: link the soroban-sdk migration note `_migrating::v25_event_testing`.
