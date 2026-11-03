---
id: sd-088
service: stellar-docs
status: reported-upstream
discovered: 2026-11-03
upstreamTitle: Show consensus-value members beneath scpValue in the Ledgers page
evidence:
  - "Canonical owner: stellar/stellar-docs at 85d2d1b8e7a4451b7a6af0931f587ce73109b816. Edit docs/learn/fundamentals/stellar-data-structures/ledgers.mdx. Source SHA-256: bc741e2f6a0e20b0fdb50050598b71bef854bf4271d29e187051f3102c04883f."
  - "The source and live page place transaction-set hash, close time, and upgrades at the same heading level as direct header fields. The SCP paragraph describes storage here and in the following three fields."
  - "Official XDR v28.0 at 9c9c145953e80990d6ff1ae3a6a973a0ce6d0694 and v30.0 at 4f524bbac80c781c06e4fb5fc93a2d0d331d6705 place these members inside StellarValue, held by LedgerHeader.scpValue. The direct LedgerHeader definitions match with SHA-256 f42033fd3417e595a40521eb3efc41f464cac22a9cb3b50a8666335abecc2833."
  - "Current public Markdown SHA-256: 542beafe9c23c70ebd321606b29342054732172d2d93fb07c4643e7a15adc37d. Current MCP page-content SHA-256: 8a53f3bb15356ed6e485184ff2bff6b60e6adcd6bc3ff5b99063328bffbd6597."
  - "Public requests, timestamps, schema identities, result hashes, and scoped source evidence: research/audits/2026-11-02-golden-overnight/late-docs-receipts.json. Independent Grok review cleared a narrow presentation clarification, not a false wire declaration."
  - "Dedupe covered both worktrees. Resolved sd-056 corrected units and the header extension; those fixes remain. Active sd-014 concerns inclusion proofs, a different boundary."
  - upstream issue filed 2026-11-03: https://github.com/stellar/stellar-docs/issues/3035
---

## Finding

The Ledgers page gives direct header fields and nested consensus-value members identical heading levels.
Its SCP paragraph also describes storage here and in the following three fields.
This hierarchy can encourage an incorrect direct-field table.
The page does not explicitly declare a false XDR wire structure.

The correction should clarify nesting, rather than claim that the wire format changed.

## Evidence

The [canonical page source](https://github.com/stellar/stellar-docs/blob/85d2d1b8e7a4451b7a6af0931f587ce73109b816/docs/learn/fundamentals/stellar-data-structures/ledgers.mdx) places three headings after `SCP value` at the same level.
The [live page](https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/ledgers) and MCP response preserve that layout.
An overview can discuss nested concepts alongside direct fields, but its storage sentence does not make the relationship clear.

[XDR v28.0](https://github.com/stellar/stellar-xdr/blob/9c9c145953e80990d6ff1ae3a6a973a0ce6d0694/Stellar-ledger.x) and [v30.0](https://github.com/stellar/stellar-xdr/blob/4f524bbac80c781c06e4fb5fc93a2d0d331d6705/Stellar-ledger.x) define `StellarValue scpValue` within `LedgerHeader`.
They place `txSetHash`, `closeTime`, and `upgrades` within `StellarValue`.
Their complete direct header definitions match.
Protocol 30 adds millisecond close-time information inside `StellarValue.ext`, rather than a direct `LedgerHeader.closeTime` field.
This versioned comparison does not claim that every network runs Protocol 30.

The [Core implementation](https://github.com/stellar/stellar-core/blob/0e49751aa9ddf892302cca02cea7f3f5d97df9f1/src/ledger/LedgerManagerImpl.cpp#L1774) independently assigns the agreed value to `header.current().scpValue`.
Its transaction-set validation reads that value's `txSetHash`.
No ledger decoder, account query, or transaction ran for this finding.

## Recommendation

Name the `scpValue` member and its `StellarValue` type in the SCP paragraph.
Nest the three following headings beneath it and show their full member paths.
State that `StellarValue` also has an extension.
Preserve the corrected stroop units and direct header-extension explanation.
Leave the separate transaction-set application wording outside this patch.

Recheck the rendered heading hierarchy and both schema structures.
