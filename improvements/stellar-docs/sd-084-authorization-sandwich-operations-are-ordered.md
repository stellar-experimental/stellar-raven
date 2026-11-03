---
id: sd-084
service: stellar-docs
status: reported-upstream
discovered: 2026-11-02
upstreamTitle: Describe authorization sandwich operations as ordered and atomic
evidence:
  - "The live asset-control page calls transaction operations simultaneous at line 108. HTTP body SHA-256: 2f53ab8331b4ec0c9d3b2e9fdb00af6bab1d109bd9f432790037260a1df78ce8. URL: https://developers.stellar.org/docs/tokens/control-asset-access.md."
  - "Stellar Core TransactionFrame::applyOperations iterates over mOperations in order and applies each operation to transaction state. Source body SHA-256: fb6c9fcb85589265c3199205d247ae8ebb2aacc662b6182fe8ef098337ac9fd5. URL: https://raw.githubusercontent.com/stellar/stellar-core/master/src/transactions/TransactionFrame.cpp."
  - "2026-11-03T01:34:06Z the existing local MCP served the same simultaneous wording in a focused get_doc_page read. Request/result hashes and public HTTP receipts: research/audits/2026-11-02-golden-overnight/authorization-source-receipts.json."
  - "The new q-comp-auth-flags-overview answer repeats the wording. Its original correct grade remains unchanged; the independent review records a qualitative disagreement."
  - upstream issue filed 2026-11-03: https://github.com/stellar/stellar-docs/issues/3031
---

## Finding

The asset-control page describes authorization sandwich operations as simultaneous.
The operations execute in order, with atomic transaction results.
The example depends on authorization before the payment and deauthorization afterward.
The current wording confuses operation order with transaction atomicity.

The finding concerns the explanation, rather than a demonstrated failure of the example transaction.

## Evidence

The [asset-control page](https://developers.stellar.org/docs/tokens/control-asset-access.md) lists five ordered sandwich operations.
Its next paragraph calls bundled operations simultaneous at line `108`.
[Stellar Core](https://raw.githubusercontent.com/stellar/stellar-core/master/src/transactions/TransactionFrame.cpp) applies `mOperations[i]` in increasing index order.
Later operations use the transaction state produced by earlier operations.
The focused MCP read reproduced the documentation wording without changing source or running a transaction.

The checks do not establish the first affected release.

## Recommendation

Replace the simultaneous-operation description with ordered execution and atomic transaction results.
Keep the existing authorization, payment, and deauthorization sequence.
Make clear that the operation order provides the payment's temporary authorization.

Recheck the paragraph against the listed operations and Core's application loop.
The explanation must preserve both order and atomicity.
