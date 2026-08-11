---
id: sd-014
service: stellar-docs
status: reported-upstream
discovered: 2026-07-10
upstreamTitle: Document Stellar transaction inclusion verification boundaries
evidence:
  - official Ledger, LedgerCloseMeta, and history/archive documentation
  - stellar-xdr ledger/SCP value definitions
  - stellar-core TxSetFrame and LedgerManager hash construction
  - live recheck 2026-07-14: current stellar-docs search and repository code search expose the component concepts but no transaction-inclusion-proof guide or compact-proof claim boundary
  - Solo scratchpad 575 GT-29 primary 3276 and independent blind 3278
  - GT-41 recurrence: document timestamping guidance required historical transaction/result and ledger-close evidence because the current Manage Data entry is mutable
  - upstream issue filed 2026-07-14: https://github.com/stellar/stellar-docs/issues/2611
recurrences:
  - date: 2026-08-11
    evidence: live Docs search for `transaction inclusion proof` still returns adjacent material only, not a verification-boundaries guide. Issue #2611 remains open; ElliotFriend's 2026-07-21 comment classed it as a valid enhancement and confirmed no compact per-transaction Merkle branch.
---

## Finding

Official documentation exposes `bucketListHash`, `txSetHash`,
`txSetResultHash`, LedgerCloseMeta, SCP envelopes, and archive retrieval in
separate places, but does not provide one current explanation of what a Stellar
transaction-inclusion proof is—or is not.

The resulting ambiguity encourages two opposite errors: describing the Bucket
List state commitment as a Bitcoin/Ethereum-style per-transaction Merkle proof,
or treating an RPC/Horizon/indexer row as a self-authenticating cryptographic
proof. Stellar does not expose a standard compact one-call per-transaction
Merkle branch through these surfaces.

## Evidence

Current Docs explain ledgers, history archives, SCP, transaction sets, and close
metadata separately. A current repository and Docs-search recheck found no guide
for “transaction inclusion proof” that joins those commitments into a supported
verification procedure or explicitly distinguishes full-XDR recomputation from a
compact Merkle branch.

## Recommendation

Add a transaction verification guide that distinguishes:

- Bucket List state commitments from transaction-set/result commitments;
- `scpValue.txSetHash` over the full serialized transaction set and
  `txSetResultHash` over the full result set;
- retrieval evidence from cryptographic recomputation;
- ledger-header hash-chain verification from SCP/quorum finality assumptions.

Provide a reproducible full-XDR verification recipe and state explicitly that
it is not a compact standard per-transaction Merkle proof. Name any supported
light-client or archive tooling separately with its trust model.
