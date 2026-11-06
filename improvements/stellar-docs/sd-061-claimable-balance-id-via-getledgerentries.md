---
id: sd-061
service: stellar-docs
status: reported-upstream
discovered: 2026-11-02
upstreamTitle: Claimable-balances guide says getLedgerEntries finds the Balance ID, but the method needs the ID as input
evidence:
  - "2026-11-06 follow-up: https://github.com/stellar/stellar-docs/pull/2752 remains draft, DIRTY and REVIEW_REQUIRED, with 15 unresolved threads (9 current). Historical green checks do not establish current readiness. Evidence and head/check receipts: .agents/rounds/2026-11-06-remaining-sweep/docs.md."
  - 2026-11-02T17:17:27Z GET https://developers.stellar.org/docs/build/guides/transactions/claimable-balances returned HTTP 200 with "we'll need its Balance ID to claim it. You can call the RPC's getLedgerEntries endpoint to do this."
  - stellar/stellar-docs main 7cb5e8a492706d2ae95bbb14be737fbf96100058 docs/build/guides/transactions/claimable-balances.mdx line 366 carries the sentence; the JavaScript sample that follows starts with "// Replace with your actual Claimable Balance ID" and builds xdr.LedgerKey.claimableBalance from that ID
  - the same page at lines 170-200 already derives the ID before submission with transaction.getClaimableBalanceId(0) and reads it from the operation result
  - golden case q-aas-claim-received-claimable-balances (golden audit pass 2, 2026-11-02) records that RPC getLedgerEntries reads a claimable balance only by a known balance id and has no claimant filter
  - stellar/stellar-docs main 5142b219 docs/data/apis/migrate-from-horizon-to-rpc.mdx lines 46-47 say GET /claimable_balances has "No direct RPC equivalent" and that getLedgerEntries retrieves "a specific claimable balance by ID"
  - the sentence came from stellar/stellar-docs#1784 (merged 2025-09-17), which replaced the earlier "can be done in several ways" text
  - upstream issue filed 2026-11-02: https://github.com/stellar/stellar-docs/issues/2998
recurrences:
  - date: 2026-11-06
    evidence: "Live line359 still says getLedgerEntries obtains Balance ID, while following BALANCE_ID input and earlier getClaimableBalanceId prove known-ID requirement. Exact URLs and upstream state: .agents/rounds/2026-11-05-truth-maintenance/docs.md, row sd-061"
---

## Finding

The claimable-balances guide says that RPC `getLedgerEntries` gets the Balance ID. The sample
that follows needs the Balance ID as its input.

`getLedgerEntries` reads ledger entries by ledger key. A claimable-balance ledger key contains the
Balance ID. The method cannot find a Balance ID from a claimant or from a transaction.

A reader can expect `getLedgerEntries` to discover the ID and look for a search parameter that
does not exist.

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

Draft PR stellar/stellar-docs#2752 rewrites this sentence as part of a full guide refresh. That PR
is not merged and has merge conflicts with `main`. The one-sentence fix can land on its own.
