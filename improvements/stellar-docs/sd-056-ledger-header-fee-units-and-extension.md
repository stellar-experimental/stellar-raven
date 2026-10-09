---
id: sd-056
service: stellar-docs
status: verified
discovered: 2026-10-09
upstreamTitle: Correct ledger-header fee units and document its extension member
evidence:
  - 2026-10-09 live ledger page and source at 2efd1d55840eb780f4b311c313e35d34fedf2f63; https://raw.githubusercontent.com/stellar/stellar-docs/2efd1d55840eb780f4b311c313e35d34fedf2f63/docs/learn/fundamentals/stellar-data-structures/ledgers.mdx
  - 2026-10-09 Stellar-ledger.x at 4f524bbac80c781c06e4fb5fc93a2d0d331d6705; https://raw.githubusercontent.com/stellar/stellar-xdr/4f524bbac80c781c06e4fb5fc93a2d0d331d6705/Stellar-ledger.x
  - 2026-10-09 TransactionFrame.cpp at ba6a4e6e322a8069b85bdf48a35d971a2d72cc81; https://raw.githubusercontent.com/stellar/stellar-core/ba6a4e6e322a8069b85bdf48a35d971a2d72cc81/src/transactions/TransactionFrame.cpp
  - 2026-10-09 public ledger 64853885 header_xdr and fee_pool; https://horizon.stellar.org/ledgers/64853885
---

## Finding

The Ledgers page says the ledger-header fee pool uses lumens rather than stroops.
The XDR field `feePool` holds an integer amount in stroops.
The page's ledger-header field list also omits the direct `ext` member.
Readers can apply the wrong conversion or construct an incomplete field list.

The adjacent `totalCoins` field also holds stroops, although the page describes a total number of lumens.
The page should distinguish stored units from amounts displayed in XLM.

## Evidence

On 2026-10-09, the [published fee-pool section](https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/ledgers#fee-pool) explicitly specifies lumens.
The [source page](https://github.com/stellar/stellar-docs/blob/2efd1d55840eb780f4b311c313e35d34fedf2f63/docs/learn/fundamentals/stellar-data-structures/ledgers.mdx#L110) has the same claim.
Its field list ends at Skip list without describing `ext`.

The [XDR definition](https://github.com/stellar/stellar-xdr/blob/4f524bbac80c781c06e4fb5fc93a2d0d331d6705/Stellar-ledger.x#L100) defines `feePool`, `totalCoins`, and the direct `ext` union.
The union has discriminants `0` and `1`.
The `1` arm holds `LedgerHeaderExtensionV1`.
The `totalCoins` comment explicitly specifies stroops and `10,000,000` stroops per XLM.

[Core fee processing](https://github.com/stellar/stellar-core/blob/ba6a4e6e322a8069b85bdf48a35d971a2d72cc81/src/transactions/TransactionFrame.cpp#L1745) subtracts the integer fee from account balance.
It adds that same integer to `header.current().feePool` without a lumen conversion.

A public [Horizon ledger read](https://horizon.stellar.org/ledgers?order=desc&limit=1) returned ledger `64853885`.
Its XDR `feePool` was `108008397804790`.
Its displayed `fee_pool` was `10800839.7804790` XLM.
Its XDR `totalCoins` was `1054439020873472865`.
Its displayed `total_coins` was `105443902087.3472865` XLM.

Both pairs use the `10,000,000` conversion factor.
The decoded header also has `ext` with discriminant `0`.

The source scan found this explicit denomination error only on the ledger page.
The separate lumen-supply page describes displayed Dashboard and Horizon values.
Those displayed values use XLM and do not contradict the raw XDR units.
The observed source commits do not identify when the error began.

## Recommendation

State that raw `feePool` and `totalCoins` use stroops.
Explain the conversion to XLM for displayed supply values.
State the raw `baseReserve` units with the adjacent reserve description.

Add the direct `ext` union to the field list.
Describe its discriminant and the versioned extension payload.
Keep transaction-set hash, close time, and upgrades under the nested `StellarValue` scope.
The current SCP-value paragraph already explains that nesting.
