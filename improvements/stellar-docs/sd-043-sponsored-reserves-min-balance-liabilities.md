---
id: sd-043
service: stellar-docs
status: verified
discovered: 2026-08-14
upstreamTitle: The sponsored-reserves minimum-balance formula wrongly adds liabilities.selling
evidence:
  - 2026-08-14 live read of https://developers.stellar.org/docs/build/guides/transactions/sponsored-reserves returned the formula "(2 base reserves + numSubEntries + numSponsoring - numSponsored) * baseReserve + liabilities.selling" under "Effect on minimum balance"
  - 2026-08-14 live scout.explainRepo against stellar/stellar-core confirmed getMinBalance in src/transactions/TransactionUtils.cpp excludes selling liabilities, and getAvailableBalance subtracts sellingLiabilities separately from protocol V_10
  - 2026-08-14 live read of https://developers.stellar.org/docs/learn/fundamentals/lumens returned a minimum-balance explanation with no liabilities term, so the two official pages disagree
  - eval round 2026-08-14, main stamp 2026-08-14T03-56-23-variantA, rows q-pc-sponsored-reserves and q-protocol-base-reserve-min-balance
  - "consumer-side patch: eval/qa/corpus/battery/protocol-core/q-pc-sponsored-reserves.json truth.verified dated 2026-08-14, by \"Root-reconciled golden-truth matrices in Solo todos 1546 and 1547\"; its rootCause names this finding, and its evidence cites the same sponsored-reserves anchor and the same stellar-core TransactionUtils.cpp source used here"
  - "sibling case eval/qa/corpus/battery/protocol-core/q-protocol-base-reserve-min-balance.json uses the Core formula without liabilities and subtracts selling liabilities only from available balance, so the two owned cases now encode one definition"
  - Solo scratchpad 809, todo 1542 review and todo 1550 reciprocal-citation round
---

## Finding

The sponsored-reserves guide states this minimum-balance formula under "Effect
on minimum balance":

`(2 base reserves + numSubEntries + numSponsoring - numSponsored) * baseReserve + liabilities.selling`

The `+ liabilities.selling` term is wrong for minimum balance.

Stellar Core computes the two values separately. `getMinBalance` in
`src/transactions/TransactionUtils.cpp` sums 2, `numSubentries`, and
`numSponsoring`, subtracts `numSponsored`, and multiplies by `baseReserve`.
Selling liabilities are not a factor. `getAvailableBalance` then subtracts
`sellingLiabilities` from the balance after it subtracts the minimum balance,
for protocol V_10 and later.

Selling liabilities therefore reduce the spendable balance. They do not raise
the minimum balance.

The Lumens page on the same site explains minimum balance without any
liabilities term. The two official pages give different formulas for the same
quantity.

A reader who follows the sponsored-reserves formula overstates the minimum
balance whenever the account has open sell offers. Any client that reproduces
the formula rejects valid transactions.

## Evidence

The live page reads and the Core source lookup ran on 2026-08-14.

The Core lookup named the exact file, `src/transactions/TransactionUtils.cpp`,
and the exact protocol boundary, V_9 for the entry count and V_10 for the
selling-liability subtraction.

## Recommendation

Remove `+ liabilities.selling` from the minimum-balance formula on the
sponsored-reserves page. The corrected formula is:

`(2 + numSubEntries + numSponsoring - numSponsored) * baseReserve`

Add one separate sentence for spendable balance:

`available balance = balance - minimum balance - liabilities.selling`

Use the same two-part split on the Lumens page so both pages state one
definition of each quantity.
