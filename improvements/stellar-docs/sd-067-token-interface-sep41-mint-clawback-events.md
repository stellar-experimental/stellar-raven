---
id: sd-067
service: stellar-docs
status: verified
discovered: 2026-11-02
upstreamTitle: Token interface events table says SEP-41 mint and clawback events are not part of the interface
evidence:
  - 2026-11-02T17:17:27Z GET https://developers.stellar.org/docs/tokens/token-interface returned HTTP 200 with the table rows "mint - not part of this interface - [mint, to, sep0011_asset]" and "clawback - not part of this interface - [clawback, from, sep0011_asset]"
  - stellar/stellar-docs main 7cb5e8a492706d2ae95bbb14be737fbf96100058 docs/tokens/token-interface.mdx lines 211-212
  - stellar/stellar-protocol master ecosystem/sep-0041.md Version 0.5.2 defines "Mint Event" (topics Symbol "mint" and Address to; data i128 amount) and "Clawback Event"; its changelog says "v0.3.0 - Add mint and clawback event"
  - the same SEP section "Mint and Clawback Event Flexibility" says the SEP has not added mint() or clawback() functions, and that mint and clawback events must be emitted during those actions
  - a predecessor Raven finding (stellar/stellar-docs issue 2715, closed; sd-018 in improvements/resolved.json, resolved 2026-08-05) asked for the SEP-41 versus SAC event table on the same page; this residual in that table is new
  - 'stellar/stellar-protocol 1e09d9f636 (2025-03-13, "SEP-41: add mint and clawback event (#1588)") introduced both events; the table cells came from stellar/stellar-docs PR 2720 merged 2026-08-04, so the cells were wrong from creation'
  - "2026-11-02T20:07Z recheck: live .md lines 209-210 unchanged; main 5142b219 token-interface.mdx lines 211-212 unchanged"
  - Raven eval golden case q-soroban-event-indexing-design, audited 2026-11-02
---

## Finding

The "Events: SEP-41 Tokens vs. Stellar Asset Contracts" table says that the `mint` and `clawback`
events are "not part of this interface" for a SEP-41 token. SEP-41 defines both events. It omits
only the `mint()` and `clawback()` functions.

It still requires the `mint` and
`clawback` events when those actions happen. The table mixes up the functions and the events.

An indexer author can skip `["mint", to]` and `["clawback", from]` events from custom SEP-41
tokens and miss supply changes.

The table came from stellar/stellar-docs#2720. SEP-41 has defined both events since v0.3.0.

## Evidence

The live table rows are:

```text
mint      | not part of this interface | ["mint", to, sep0011_asset]
clawback  | not part of this interface | ["clawback", from, sep0011_asset]
```

SEP-41 v0.5.2 has a "Mint Event" section with topics `Symbol "mint"` and `Address to`, and
single-value data `i128` amount (or a map with `amount` and `to_muxed_id`). It has a "Clawback Event" section too. The section "Mint and Clawback Event
Flexibility" says that implementations choose how to start mint and clawback, but must emit the
events.

The `set_authorized` and `set_admin` rows are correct. SEP-41 defines neither event.

## Recommendation

Change the SEP-41 cells for `mint` to `["mint", to]` and for `clawback` to `["clawback", from]`.
Add a note that SEP-41 defines these events but not the functions that emit them.

Optional: say that SEP-41 events can use the map data format, so consumers must accept keys they
do not recognize.
