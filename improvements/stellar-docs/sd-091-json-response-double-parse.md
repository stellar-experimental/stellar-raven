---
id: sd-091
service: stellar-docs
status: reported-upstream
discovered: 2026-11-03
upstreamTitle: "Remove the second JSON parse from the simulation HTTP example"
evidence:
  - "research/audits/2026-11-03-qa-followup/additional-source-findings.json (OC-JSON-PARSE; fresh source receipts, case/review/packet hashes, owner proof, and fixture results)."
  - "Current source: https://raw.githubusercontent.com/stellar/stellar-docs/85d2d1b8e7a4451b7a6af0931f587ce73109b816/docs/build/guides/transactions/simulateTransaction-Deep-Dive.mdx; SHA256 3d10b443ce150457aec5da83e274e1180bfa1e0c305db5f28f7c6983355a739d; Git blob cf3edbb514875b0ea72fd9dffaf13abed1546fec."
  - "Published page: https://developers.stellar.org/docs/build/guides/transactions/simulateTransaction-Deep-Dive.md; SHA256 2026dff38b62338b268df83e63ce596d838dec6a518b32cc2b4c7352d462942c."
  - "Case q-infra-simulate-transaction-howto; review SHA256 bd938e28e69fd4dc8941e2e65ee1c10b89aac4d94a48db511eb340c663a60df0; packet SHA256 a4cf3f90a8ee33c79629c0f4f79854d2cce08391ab400d3a86e0a5908d55a99b; full source-row SHA256 237f89f8b156259898676a5e9146db5c5cd08e05d81626f4b3ef002719db3550."
  - upstream issue filed 2026-11-03: https://github.com/stellar/stellar-docs/issues/3038
recurrences:
  - date: 2026-11-06
    evidence: "Live response.json followed by JSON.parse(result), local success/error object fixtures both SyntaxError. PR3053 CHANGES_REQUESTED: Elliot Nov5 requires result.error handling as well as top-level JSONRPC error; no subsequent fix captured. Exact URLs and upstream state: .agents/rounds/2026-11-05-truth-maintenance/docs.md, row sd-091"
---

## Finding

The simulation deep-dive example calls JSON.parse on the object returned by response.json().
A normal JSON-RPC object causes SyntaxError after the response parses successfully.
The second parse can hide either a successful result or the original JSON-RPC error.

## Evidence

The [published page](https://developers.stellar.org/docs/build/guides/transactions/simulateTransaction-Deep-Dive.md) and [canonical source](https://raw.githubusercontent.com/stellar/stellar-docs/85d2d1b8e7a4451b7a6af0931f587ce73109b816/docs/build/guides/transactions/simulateTransaction-Deep-Dive.mdx) contain the reported text.

The local fixture extracts the current function without changing its body.
A mocked fetch returns a normal success object and a normal error object.
Both original executions throw SyntaxError.
The single-parse control preserves each object.
The fixture performs no network request, signing, submission, or network simulation.

The owner is stellar/stellar-docs at source revision 85d2d1b8e7a4451b7a6af0931f587ce73109b816.
Canonical edit path: `docs/build/guides/transactions/simulateTransaction-Deep-Dive.mdx`.

## Recommendation

Remove JSON.parse around result.
Keep JSON-RPC errors separate from successful results.
Validate the sample with local object-response fixtures.
