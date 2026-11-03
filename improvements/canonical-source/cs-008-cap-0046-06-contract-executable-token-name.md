---
id: cs-008
service: canonical-source
repo: stellar/stellar-protocol
status: declined-upstream
disposition: Accept the CAP maintainer decision that the stale name is not significant to fix; keep the current XDR name in consumer truth and do not re-file without materially new evidence.
discovered: 2026-11-02
upstreamTitle: CAP-0046-06 names the SAC executable CONTRACT_EXECUTABLE_TOKEN; the XDR name is CONTRACT_EXECUTABLE_STELLAR_ASSET
evidence:
  - "2026-11-02T21:24:12Z GET https://raw.githubusercontent.com/stellar/stellar-protocol/master/core/cap-0046-06.md returned HTTP 200 with 'Status: Final' and, in 'Semantics: Deployment': \"The `CreateContractArgs` under that will contain a `ContractExecutable` of type `CONTRACT_EXECUTABLE_TOKEN`, and a `ContractIDPreimage` of type `CONTRACT_ID_PREIMAGE_FROM_ASSET`\". The last commit to the file is 3bc9054e (2025-03-19, 'Add set_authorized to CAP-0067 (#1683)')."
  - "2026-11-02 GET https://raw.githubusercontent.com/stellar/stellar-xdr/curr/Stellar-contract.x: \"CONTRACT_EXECUTABLE_WASM = 0, CONTRACT_EXECUTABLE_STELLAR_ASSET = 1, CONTRACT_EXECUTABLE_EXTERNAL_REF = 2\". The name CONTRACT_EXECUTABLE_TOKEN does not exist in the current XDR."
  - "stellar/stellar-xdr commit ed34303d93 (2023-10-09, 'Rename CONTRACT_EXECUTABLE_TOKEN->CONTRACT_EXECUTABLE_STELLAR_ASSET. (#158)') made the rename before Protocol 20 reached mainnet."
  - "2026-11-02T21:24:12Z GET https://developers.stellar.org/docs/tokens/stellar-asset-contract.md: \"its `SCContractInstance.executable` is `CONTRACT_EXECUTABLE_STELLAR_ASSET` rather than a Wasm hash\". The docs were fixed under sd-020 (resolved 2026-07-31, stellar/stellar-docs#2655); the CAP was not."
  - "2026-11-02T21:26:00Z Raven stellarDocs.search_docs 'CONTRACT_EXECUTABLE_TOKEN' returned no page carrying that name; the docs index is clean. The CAP is the remaining public source."
  - "Same-family check 2026-11-02: cap-0046-01, -02, -03, and -05 on stellar-protocol master contain zero CONTRACT_EXECUTABLE_TOKEN matches."
  - "Precedent: stellar-protocol accepts post-Final corrections to this CAP, for example 7b1ff42b 'CAP-0046-06: Fix events emitted (#1564)' (2024-10-28)."
  - "Dedupe 2026-11-02: gh search issues stellar/stellar-protocol 'CONTRACT_EXECUTABLE_TOKEN' and gh search prs 'CONTRACT_EXECUTABLE_STELLAR_ASSET' returned no results. No improvements/ finding names CAP-0046-06."
  - "Golden consumer: eval/qa/corpus/battery/soroban/q-sor-sac-introspection.json golden.notes partial cap; truth.verified 2026-11-02 (golden cap backlog, caps-2)."
  - upstream issue filed 2026-11-02: https://github.com/stellar/stellar-protocol/issues/2056
  - "maintainer decline 2026-11-03: leighmcculloch (stellar org MEMBER) wrote https://github.com/stellar/stellar-protocol/issues/2056#issuecomment-6593819856 with the text \"This doesn't seem significant to fix.\" and closed #2056 as not_planned at 2026-11-03T02:24:44Z. No linked PR."
  - "2026-11-03T15:06Z live re-check: core/cap-0046-06.md on stellar-protocol master ded60f56201478b82b341151a6c44f7d1a4aec6e line 351 still names CONTRACT_EXECUTABLE_TOKEN; stellar-xdr curr Stellar-contract.x line 175 defines CONTRACT_EXECUTABLE_STELLAR_ASSET = 1. The trigger still reproduces; the owner declined the correction."
---

## Finding

CAP-0046-06 (Stellar Asset Contract, Status Final) says a SAC deployment uses a
`ContractExecutable` of type `CONTRACT_EXECUTABLE_TOKEN`. The XDR renamed that variant to
`CONTRACT_EXECUTABLE_STELLAR_ASSET` in stellar-xdr#158 on 2023-10-09. The developer docs use the
current name. The CAP still uses the old name.

A developer who identifies a SAC by its instance executable searches the XDR and SDKs for
`CONTRACT_EXECUTABLE_TOKEN` and finds nothing. Tools and models that cite the CAP repeat the old
name as current.

## Evidence

```sh
curl -s https://raw.githubusercontent.com/stellar/stellar-protocol/master/core/cap-0046-06.md | grep -n "CONTRACT_EXECUTABLE_TOKEN"
curl -s https://raw.githubusercontent.com/stellar/stellar-xdr/curr/Stellar-contract.x | grep -n "CONTRACT_EXECUTABLE_"
```

## Recommendation

In `core/cap-0046-06.md`, "Semantics: Deployment", replace `CONTRACT_EXECUTABLE_TOKEN` with
`CONTRACT_EXECUTABLE_STELLAR_ASSET`. If the CAP must keep its design-era text, add a one-line
errata note that names the rename and stellar-xdr#158.
