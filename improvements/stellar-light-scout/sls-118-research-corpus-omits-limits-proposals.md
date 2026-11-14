---
id: sls-118
service: stellar-light-scout
status: verified
discovered: 2026-11-14
upstreamTitle: Research corpus does not index Stellar Limits Proposals, so enacted Quorum Freeze votes are missing
probe:
  type: http-text
  url: https://stellarlight.xyz/api/research?q=SLP-0006%20freeze%20YieldBlox%20exploit%20accounts&limit=25
  expect:
    status: 200
    excludes:
      - "limits/slp-0006"
evidence:
  - "2026-11-14T05:10:48Z GET https://stellarlight.xyz/api/research?q=SLP-0006%20freeze%20YieldBlox%20exploit%20accounts&limit=25 returned HTTP 200 with 25 rows from the sources incident, dev-docs, cap, audit, sdf-blog, and sep. No row URL is under stellar-protocol limits/. Scout OpenAPI 1.9.150."
  - "2026-11-14T05:04:48Z Raven execute: scout.searchResearch({q:'SLP-0006 freeze YieldBlox exploit accounts frozen ledger keys mainnet'}) returned CAP-0077, the YieldBlox incident row, Software Versions, and getLedgerEntries. A second call with source cap returned CAP-0077, CAP-0011, CAP-0012, and CAP-0083. A third call with sources incident, sdf-blog, and release returned the YieldBlox incident row, the Quorum Freeze post of 2026-05-05, and Protocol 26 posts. No row content names SLP-0006 or SLP-0008."
  - "2026-11-14T05:05:26Z and 05:14:04Z Raven execute: five more scout.searchResearch calls about the use of Quorum Freeze on Mainnet returned the CAP, the Protocol 26 posts of April and May 2026, and the SDF Q2 2026 report (\"Yardstick shipped a governed freeze\"). The incident row for YieldBlox describes the earlier overlay filter (\"transaction-filtering configuration that effectively quarantined about 48 million XLM\"), not the CAP-0077 freeze. No row states that validators froze the accounts under CAP-0077. stellarDocs.search_docs and lumenloop.search_content_semantic also returned no record of either freeze."
  - "2026-11-14 stellar/stellar-protocol master: limits/ holds slp-0001.md through slp-0008.md. limits/slp-0006.md is 'Freeze YieldBlox Exploit Stellar Accounts', Status Final, Created 2026-05-07. limits/slp-0008.md is 'Freeze Mercado Bitcoin Exploit Stellar Account', Status Final, Created 2026-11-02. Both use the frozen ledger key mechanism of CAP-0077."
  - "The round's gap and verify lanes reached the same result on 2026-11-14 (.agents/rounds/2026-11-14-golden-coverage-audit/gap/gap-3.json and gap/verify-gap.json, q-pc-quorum-freeze-cap77). The verify lane read the live frozen-keys configuration entry from three RPC providers."
  - "Classification: research-corpus coverage. The corpus declares cap and sep sources from the same repository, so the limits/ directory is in its stated scope."
  - "Affected golden case: eval/qa/corpus/battery/protocol-core/q-pc-quorum-freeze-cap77.json, key fact 4. Ledger: .agents/rounds/2026-11-14-golden-coverage-audit/gaps/GAPS.md."
---

## Finding

The Scout research corpus indexes CAPs and SEPs from `stellar/stellar-protocol`. It does not index
the Stellar Limits Proposals (SLPs) in the `limits/` directory of the same repository.

SLPs record the network configuration votes. Two of them record the uses of Quorum Freeze
(CAP-0077) on Mainnet to date: SLP-0006 for the YieldBlox exploit accounts and SLP-0008 for the
Mercado Bitcoin exploit account.

A research query about Quorum Freeze returns the CAP and the announcement posts. Those sources
describe the mechanism. None says that validators have used it. The YieldBlox incident row
describes only the earlier overlay filter. An agent cannot answer "has Quorum Freeze been used on
Mainnet" from the corpus.

## Evidence

Read-only reproduction:

```sh
curl -sS 'https://stellarlight.xyz/api/research?q=SLP-0006%20freeze%20YieldBlox%20exploit%20accounts&limit=25'
curl -sS https://raw.githubusercontent.com/stellar/stellar-protocol/master/limits/slp-0006.md
```

The first response has no row from `limits/`. The second is the Final proposal.

## Recommendation

Index `limits/slp-*.md` from `stellar/stellar-protocol`, in a new `slp` source or in the `cap`
source. Carry the title, status, and creation date of each proposal. Add the proposal number to
`exactKeys`, for example `SLP-0006`, so that an exact query finds it.
