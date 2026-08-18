---
id: sd-025
service: stellar-docs
status: fixed-upstream
discovered: 2026-07-11
upstreamTitle: Update the Horizon-to-RPC migration guide for shipped CAP-67 asset events
evidence:
  - Horizon-to-RPC migration guidance describes unified classic-asset events as near-future
  - CAP-0067 is Final for Protocol 23
  - Mainnet and Testnet report Protocol 27
  - live recheck 2026-07-27 of the Horizon-to-RPC migration page still renders "In the near future as a result of CAP-67 this method will be expanded to include events from non-contract operations", plus equivalence-table qualifiers "CAP-67 events when available" and "when expanded to cover all effects with CAP-67"
  - live Mainnet getNetwork 2026-07-27 returned protocolVersion 27, so the capability the page defers has been live since Protocol 23
  - ref health 2026-07-27 - the only prior durable reference was a comment on stellar/stellar-docs#1585, but that issue closed completed 2026-07-13T22:11Z and the follow-up was posted 2026-07-14T16:14Z; a comment on an already-closed issue never created a live tracker, so this finding is treated as unfiled
  - upstream issue filed 2026-07-27: https://github.com/stellar/stellar-docs/issues/2699
  - 2026-08-18 fresh source recheck: the guide states CAP-67 shipped in Protocol 23, names the unified classic asset events, and limits meta-XDR guidance to effect classes CAP-67 does not model
  - 2026-08-18 upstream issue 2699 is closed as completed
recurrences:
  - date: 2026-08-11
    evidence: live source and indexed-page recheck — migrate-from-horizon-to-rpc.mdx still says CAP-67 expansion is in the near future and retains the `when available` and `when expanded` qualifiers. Issue #2699 remains open with no comments or maintainer activity.
  - date: 2026-07-14
    evidence: independent Fable recheck confirmed the rendered migration page and stellar/stellar-docs main still say CAP-67 expansion is "in the near future"; issue 1585 fixed a different events page and has no response to the migration-page follow-up, so no additional comment was posted
  - date: 2026-07-27
    evidence: still reproduces verbatim on the live page; escalated from a comment on a closed issue to a standalone filing
---

## Finding

The Horizon-to-RPC migration guide still describes CAP-67 unified asset events
as future work, even though CAP-0067 is Final for Protocol 23 and the live
networks report Protocol 27.

The page's warning block reads: *"The method returns a stream of events that in
the current protocol only include events from contracts. In the near future as
a result of CAP-67 this method will be expanded to include events from
non-contract operations."* Several rows in the endpoint-equivalence table carry
matching hedges — "CAP-67 events **when available**" and "**when expanded** to
cover all effects with CAP-67".

Because this page is widely used as the authoritative endpoint-mapping source,
a reader migrating today is told to plan around a capability they already have,
and is steered toward the `getTransactions` meta-XDR workaround that the page
itself frames as an interim measure.

## Evidence

### Resolution, 2026-08-18

The current source no longer uses `near future`, `when available`, or `when expanded` for CAP-67.
It states that CAP-67 shipped in Protocol 23. It lists the unified classic asset event types and
limits meta-XDR guidance to effect classes that CAP-67 does not model. Issue 2699 closed as
completed on 2026-08-18. A distinct resolver must still complete the deletion workflow.

Live re-check on 2026-07-27:

- `https://developers.stellar.org/docs/data/apis/migrate-from-horizon-to-rpc`
  still renders the "in the near future as a result of CAP-67" warning, and the
  Payments, Effects, and Offers rows still carry `when available` and
  `when expanded` qualifiers.
- Live Mainnet `getNetwork` returned
  `{"passphrase":"Public Global Stellar Network ; September 2015","protocolVersion":27}`.
- CAP-0067 is Final and shipped in Protocol 23.

This is distinct from resolved-ledger entry `sd-018`, which owned the SAC and CAP-67 event *schema*
documentation gap. This finding covers only the migration guide's tense and its
interim-workaround framing.

## Recommendation

Replace the future-tense framing with present-tense guidance: `getEvents`
returns unified asset events today. Drop the `when available` and
`when expanded` qualifiers from the equivalence table. Either remove the
`getTransactions` meta-XDR interim advice or relabel it explicitly as the
pre-Protocol-23 historical path.

If any effect classes genuinely remain uncovered by unified events, name those
classes explicitly rather than gating the whole method on CAP-67.
