---
id: sd-066
service: stellar-docs
status: verified
discovered: 2026-11-02
upstreamTitle: Test Events guide says env.events().all() returns events since the Env was created
evidence:
  - 2026-11-02T17:17:27Z GET https://developers.stellar.org/docs/build/guides/testing/test-contract-events returned HTTP 200 with "// Get all events published since the Env was created." after three client.increment() calls, and an expected list of three events
  - stellar/stellar-docs main 7cb5e8a492706d2ae95bbb14be737fbf96100058 docs/build/guides/testing/test-contract-events.mdx lines 17-41
  - stellar/rs-soroban-sdk v29.0.1 soroban-sdk/src/testutils.rs lines 552-553 "Returns all contract events that have been published by the last contract invocation. If the last contract invocation failed, no events are returned."; the same text is at v25.0.0 and absent at v23.0.0
  - 2026-11-02 local reproduction with soroban-sdk 29.0.1 testutils - three client.increment() calls, each publishing one event, then env.events().all().events().len() printed EVENTS_AFTER_3_CALLS=1
  - golden cases q-sor-test-event-assertion-ordering and q-sor-decode-hosterror-codes (golden audit pass 2, 2026-11-02)
---

## Finding

The Test Events guide says that `env.events().all()` returns every event published since the
`Env` was created. Its example makes three top-level calls and expects three events.

Since soroban-sdk 25, `env.events().all()` returns only the events of the last contract
invocation. With the current SDK, the example sees one event, so the assertion fails.

This is a `docs-content` finding.

## Evidence

The live guide calls `client.increment()` three times. It then compares `env.events().all()`
with a list of three events. The comment says "Get all events published since the Env was
created."

The soroban-sdk v29.0.1 doc comment for `Events::all` says: "Returns all contract events that
have been published by the last contract invocation. If the last contract invocation failed, no
events are returned." The same comment is in v25.0.0. The v23.0.0 comment has no such text, and
the method returned a plain `Vec` of tuples.

A local test with soroban-sdk 29.0.1 made three `increment` calls. Each call published one event.
`env.events().all().events().len()` was 1.

## Recommendation

Change the example to check events after each call, or to assert one event after the last call.
Change the comment to say that `all()` returns the events of the last invocation. Show the current
`ContractEvents` comparison form.

Optional: link the soroban-sdk migration note `_migrating::v25_event_testing`.
