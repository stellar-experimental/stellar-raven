---
id: sd-061
service: stellar-docs
status: verified
discovered: 2026-11-02
upstreamTitle: Claimable-balances guide says getLedgerEntries finds the Balance ID, but it needs the ID
evidence:
  - 2026-11-02T17:17:27Z GET https://developers.stellar.org/docs/build/guides/transactions/claimable-balances returned HTTP 200 with "we'll need its Balance ID to claim it. You can call the RPC's getLedgerEntries endpoint to do this."
  - stellar/stellar-docs main 7cb5e8a492706d2ae95bbb14be737fbf96100058 docs/build/guides/transactions/claimable-balances.mdx line 366 carries the sentence; the JavaScript sample that follows starts with "// Replace with your actual Claimable Balance ID" and builds xdr.LedgerKey.claimableBalance from that ID
  - the same page at lines 170-200 already derives the ID before submission with transaction.getClaimableBalanceId(0) and reads it from the operation result
  - golden case q-aas-claim-received-claimable-balances (golden audit pass 2, 2026-11-02) records that RPC getLedgerEntries reads a claimable balance only by a known balance id and has no claimant filter
---

## Finding

The claimable-balances guide says that RPC `getLedgerEntries` gets the Balance ID. The sample
that follows needs the Balance ID as its input.

`getLedgerEntries` reads ledger entries by ledger key. A claimable-balance ledger key contains the
Balance ID. The method cannot find a Balance ID from a claimant or from a transaction.

A reader can expect `getLedgerEntries` to discover the ID and look for a search parameter that
does not exist.

This is a `docs-content` finding.

## Evidence

The live guide says: "At this point, the `ClaimableBalanceEntry` exists in the ledger, but we'll
need its Balance ID to claim it. You can call the RPC's `getLedgerEntries` endpoint to do this."

The JavaScript sample then sets `BALANCE_ID` to a fixed 72-character hex value with the comment
"Replace with your actual Claimable Balance ID". It parses the ID and builds
`xdr.LedgerKey.claimableBalance` from it.

Earlier on the same page, the creation sample gets the ID with
`transaction.getClaimableBalanceId(0)` before submission. It also reads the ID from the
operation result after submission.

## Recommendation

Change the sentence to say that `getLedgerEntries` reads the entry for a known Balance ID. Point
to the earlier steps that get the ID from the transaction or the operation result.

Optional: say that RPC has no claimant filter, and that Horizon `/claimable_balances?claimant=`
lists the balances for a claimant.
