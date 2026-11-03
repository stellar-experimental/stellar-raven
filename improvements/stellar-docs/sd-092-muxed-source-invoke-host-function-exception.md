---
id: sd-092
service: stellar-docs
status: verified
discovered: 2026-11-03
upstreamTitle: "Document the muxed-source exception for contract invocation"
evidence:
  - "research/audits/2026-11-03-qa-followup/additional-source-findings.json (OC-MUXED-SOURCE; fresh source receipts, case/review/packet hashes, owner proof, and fixture results)."
  - "Current source: https://raw.githubusercontent.com/stellar/stellar-docs/85d2d1b8e7a4451b7a6af0931f587ce73109b816/docs/build/guides/transactions/pooled-accounts-muxed-accounts-memos.mdx; SHA256 7b8584dd15e756006aec21823b560a57ba0ec1bc7d0a6eb22cb8dc875e667a08; Git blob af7ecae3202b86f227b03338f968842d1df93539."
  - "Published page: https://developers.stellar.org/docs/build/guides/transactions/pooled-accounts-muxed-accounts-memos.md; SHA256 58947c5707163492a6e52d435166ad8029feed7015dc141c1f8c8a7e9294a1e1."
  - "Case q-pc-muxed-accounts; review SHA256 c00e62867a4934936a47c1996858999aaf8d818cfe16be782511e1c2ea49c62e; packet SHA256 1c8b6c7941e2ab6fd10a19e43363c47c483140ae89ce7c9d7c6d45b56ec37a19; full source-row SHA256 003eda477402f2e86554d0ba00d5cb01040b824e2ebda939448371ce6ca6fb0a."
---

## Finding

The pooled-account guide permits a muxed source for any operation or transaction.
Core rejects muxed sources for a single InvokeHostFunction operation from Protocol 25 onward.
The restriction applies to the inner transaction source and the operation source.
The generic matrix needs this exception.

## Evidence

Core v29.0.0 and v30.0.0 contain the same validateSorobanMemo checks.
The caller applies these checks from ProtocolVersion::V_25.
The local fixtures compile each extracted production helper with minimal input type stubs.
They reject both muxed source positions and preserve the non-invocation control.
These fixtures do not execute complete Core transactions or prove a network activation date.

The public receipt binds the current repository tree and source file to exact Git blob bytes.
The owner is stellar/stellar-docs at source revision 85d2d1b8e7a4451b7a6af0931f587ce73109b816.
Canonical edit path: `docs/build/guides/transactions/pooled-accounts-muxed-accounts-memos.mdx`.

The duplicate search covers every active namespace, recurrence text, and the resolved ledger.
Related records remain separate in the public triage receipt.
No external issue, message, source patch, grade change, or paid measurement occurs.

## Recommendation

Qualify the source-account bullet with the InvokeHostFunction exception and applicable protocol version.
Keep the fee-bump fee source and supported SAC destination interfaces separate.
Do not imply that every Soroban operation has the same source restriction.
