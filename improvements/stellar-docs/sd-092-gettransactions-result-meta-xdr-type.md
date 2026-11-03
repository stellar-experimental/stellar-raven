---
id: sd-092
service: stellar-docs
status: verified
discovered: 2026-11-03
upstreamTitle: "Correct the getTransactions metadata type and source link"
evidence:
  - "research/audits/2026-11-03-qa-followup/additional-source-findings.json (OC-META-TYPE; fresh source receipts, case/review/packet hashes, owner proof, and fixture results)."
  - "Current source: https://raw.githubusercontent.com/stellar/stellar-docs/85d2d1b8e7a4451b7a6af0931f587ce73109b816/docs/data/apis/rpc/api-reference/methods/getTransactions.mdx; SHA256 377dd24ee85a212ecc0ccb722ed386f215d2f321f05ef02f23b99edca9cc302e; Git blob cd5ef24b5322edfcdef22559b89911bb2f3f5c6e."
  - "Published page: https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getTransactions.md; SHA256 f9717349ff73728a341347b0cb342a31dcad56cca6e5ab13d21f3b58b8dcfa93."
  - "Case q-ti-rpc-gettransactions-pagination-xdr; review SHA256 4e3ee1909698963cd7e673407b3692b73a6fc6520489dc533095e10d1b619972; packet SHA256 7d6d68cbd706047f8684b5085b10f366e76239729851f63bd2961171af41a87a; full source-row SHA256 77e3657488863ee37f769573065659903fbbaf02ec4f44f9b25529ed0b7c14b7."
---

## Finding

The getTransactions page names TransactionResultMeta for resultMetaXdr.
The payload type is TransactionMeta.
TransactionResultMeta is a separate wrapper that contains TransactionMeta as txApplyProcessing.
The same field link begins with the malformed prefix L446https.

## Evidence

The current source and published method page retain the type name and malformed link.
The independent XDR source defines the union and its larger wrapper separately.
The installed SDK 17.4.0 parser decodes resultMetaXdr with TransactionMeta.fromXdr.
A local unsigned fixture passes the actual SDK parser.
The same metadata bytes fail when decoded as TransactionResultMeta.
No chain query, network simulation, signature, or submission occurs.

The public receipt binds the current repository tree and source file to exact Git blob bytes.
The owner is stellar/stellar-docs at source revision 85d2d1b8e7a4451b7a6af0931f587ce73109b816.
Canonical edit path: `docs/data/apis/rpc/api-reference/methods/getTransactions.mdx`.

The duplicate search covers every active namespace, recurrence text, and the resolved ledger.
Related records remain separate in the public triage receipt.
No external issue, message, source patch, grade change, or paid measurement occurs.

## Recommendation

Name TransactionMeta for resultMetaXdr and link to the correct union definition.
Remove the malformed link prefix.
Keep pagination limits unchanged.
The sd-004 owner decision concerns operational limits, not this metadata type.
This finding requests no configurability change or reopening of that decision.
