# Independent review — 2026-11-03

Reviewer: Grok lane in this session. Author: Codex lane, `tmp/hm/REPORT.md`.
This pass is read-only. No tracked file was edited. `.dev.vars` was not read.
Claims below were read again from live sources on 2026-11-03. The author's notes were not used as evidence.

## Verdicts

| Case | Verdict |
| --- | --- |
| `q-infra-testnet-reset-schedule-recovery` | ACTIVATE |
| `q-sor-reflector-testnet-contract-addresses` | ACTIVATE |

Both questions are realistic. Raven can answer them from Stellar Docs.
`stellarDocs.search_protocol_concepts_docs` includes `/docs/networks` (`catalog/manifest.json:29532`).
`stellarDocs.search_rpc_horizon_data_docs` covers `/docs/data`, including oracles (`catalog/manifest.json:29545`).
`stellarDocs.get_doc_page` reads a docs path (`catalog/manifest.json:28228`).
The battery has no copy of the next reset date or of the three Testnet contract IDs.

Activation still needs one follow-up in the activation commit.
`eval/qa/source-sentinels.mjs:79` accepts an active or quarantined battery case only.
A proposal cannot hold a sentinel yet. Add one sentinel per case when the case enters the battery.
Use the live Networks date for the reset case. Use the live Oracle Providers Testnet rows for the address case.

## URLs read on 2026-11-03

- https://developers.stellar.org/docs/networks
- https://raw.githubusercontent.com/stellar/stellar-docs/main/docs/networks/index.mdx
- https://github.com/stellar/packages/blob/master/docs/testnet-reset.md (raw file)
- https://status.stellar.org/api/v2/scheduled-maintenances/upcoming.json
- https://developers.stellar.org/docs/data/oracles/oracle-providers
- https://orchestrator-testnet.reflector.network/config
- https://soroban-testnet.stellar.org (`getNetwork`)
- https://api.stellar.expert/explorer/testnet/contract/CAVLP5DH2GJPZMVO7IJY4CVOD5MWEFTJFVPD2YY2FQXOQHRGHK4D6HLP
- https://api.stellar.expert/explorer/testnet/contract/CCYOZJCOPG34LLQQ7N24YXBM7LL62R7ONMZ3G6WZAAYPB5OYKOMJRN63
- https://api.stellar.expert/explorer/testnet/contract/CCSSOHTBL3LEWUCBBEB5NJFC2OKFRC74OWEIJIZLRJBGAAU4VMU5NV4W
- https://raw.githubusercontent.com/reflector-network/reflector-contract/master/README.md
- https://api.github.com/repos/OpenZeppelin/stellar-contracts/releases/latest (R23 check only)

## Reset case — ACTIVATE

File: `eval/qa/corpus/proposed/tooling-infra/q-infra-testnet-reset-schedule-recovery.json`

The Networks page lists one scheduled 2026 date: December 16, 2026.
The same sentence is in the docs repository source. Those two copies share one editorial origin.
The golden says that (`:128`) and dates the fact (`:9`, `:34`).
`tags.freshness` is `scheduled` (`:25`). `truth.reverifyBy` is `2026-12-02` (`:35`), before December 16.
The answer tells the reader to treat the date as a published schedule (`:9`).
The notes accept a later official schedule, including a postponement or a cancellation (`:20`).

A reset returns the network to the genesis ledger.
It clears ledger entries, including accounts, trustlines, offers, and smart contract data.
It also clears transactions and historical data.
The page says developers must not rely on accounts or on balances.
The packages procedure drops and recreates the Core database and the Horizon database.
It does not state December 16, 2026.

The upcoming-maintenance document was current at `2026-11-03T17:05:20.952Z`.
Its only item is the public-network Protocol 30 vote at `2026-11-23T17:00:00.000Z`.
That list has no December Testnet reset. The notes already say this absence does not cancel the Networks date (`:20`).

The question does not duplicate a battery case.
`q-infra-testnet-vs-futurenet` asks which test network to use.
`q-tool-cli-testnet-identity-howto` says a funded Testnet account is not permanent.
`q-ti-friendbot-ratelimit-alternatives` is about funding.
None of those cases requires the next reset date or the recovery steps.

### Findings

1. Severity: info. File: `:20`. The Networks page says resets are typically at 17:00 UTC. The linked packages procedure says 09:00 UTC. The golden does not pin an hour. The avoid list (`:17-18`) does not punish either hour. That split is fair.
2. Severity: info. File: `:17-18`. The avoids punish two false claims: surviving Testnet state, and a guaranteed demo slot. A newer dated official date stays acceptable under `:20`. This is not a date-contingent trap. No `dateContingentTraps` row is required for this proposal.
3. Severity: activation. File: `:132` and `eval/qa/source-sentinels.mjs:79-81`. The activation commit must add a `present` sentinel for `December 16, 2026` on `https://developers.stellar.org/docs/networks`. Set `caseAsOf` to the case `truth.asOf`. The proposal text can stay as it is.

## Reflector case — ACTIVATE

File: `eval/qa/corpus/proposed/soroban/q-sor-reflector-testnet-contract-addresses.json`

The Oracle Providers table, read on 2026-11-03, lists these Testnet rows:

| Data source on the page | Network | Address |
| --- | --- | --- |
| Stellar Mainnet DEX | Testnet | `CAVLP5DH2GJPZMVO7IJY4CVOD5MWEFTJFVPD2YY2FQXOQHRGHK4D6HLP` |
| External CEXs & DEXs | Testnet | `CCYOZJCOPG34LLQQ7N24YXBM7LL62R7ONMZ3G6WZAAYPB5OYKOMJRN63` |
| Fiat exchange rates | Testnet | `CCSSOHTBL3LEWUCBBEB5NJFC2OKFRC74OWEIJIZLRJBGAAU4VMU5NV4W` |

The same page lists different Mainnet addresses:

- Stellar Mainnet DEX: `CALI2BYU2JE6WVRUFYTS6MSBNEHGJ35P4AVCZYF3B6QOE3QKOB2PLE6M`
- External CEXs & DEXs: `CAFJZQWSED6YAWZU3GWRTOCNPPCGBN32L7QV43XX5LZLFTK6JLN34DLN`
- Fiat exchange rates: `CBKGPWGKSKZF52CFHMTRR23TBWTPMRDIYZ4O2P5VS65BMHYH4DXMCJZC`

Reflector `GET /config` reports `"network":"testnet"`.
For the three addresses above it reports `type` `oracle` and `dataSource` `pubnet`, `exchanges`, and `forex`.
Stellar Expert shows each contract on Testnet with wasm `25fc306065cbb9b05461db78ec259802cb916053ba5b3ab911b0a72dd1a81439`.
That hash matches the config `wasmHash.oracle`. Each contract was created at `2025-12-18T12:30:00Z` (seconds differ by 10).

`getNetwork` on `https://soroban-testnet.stellar.org` returned:

```json
{"friendbotUrl":"https://friendbot.stellar.org/","passphrase":"Test SDF Network ; September 2015","protocolVersion":30}
```

The passphrase matches the Networks page, including the spaces around the semicolon.
The Reflector README says a consumer must compare the returned `timestamp` with the ledger time.
An interface read does not return that price check. The third avoid (`:20`) matches that fact.

The answer carries `As of 2026-11-03` (`:10`). `tags.freshness` is `scheduled` (`:26`).
`truth.reverifyBy` is `2026-12-09` (`:36`). The notes accept newer provider-supported Testnet addresses (`:22`).
The three IDs are a dated snapshot. The avoid list does not freeze them as a permanent roster.

The question does not duplicate a battery case.
`q-sor-reflector-integration-code` tests ABI, encoding, and trap diagnosis, and its examples are the Mainnet IDs above.
Those Mainnet examples still match the live table. This case asks for the full Testnet IDs.
`q-defi-reflector-oracle` asks what Reflector is.
`q-defi-oracle-landscape-live` and `q-tool-oracle-repo-live` rank directory and repository evidence.
`q-soroban-oracle-defensive-consumption` tests price-security controls.
The notes keep price security out of this case (`:22`). No battery file contains the three Testnet IDs.

### Findings

1. Severity: low. File: `:3` and `:10`. The question says "Stellar DEX". The required row is "Stellar Mainnet DEX". Reflector config also has `CA2NWEPNC6BD5KELGJDVWWTXUE7ASDKTNQNL6DN3TGBVWFEWSVVGMUAF` with `dataSource` `testnet` and `type` `oracle`. That contract is not on the Oracle Providers table. The notes (`:22`) tell the judge to use the three public table rows. No avoid punishes the extra Testnet-native address. Activation can proceed. A tighter question can say "Stellar Mainnet DEX" if the author edits before activation.
2. Severity: info. File: `:18-20`. The Mainnet avoid is fair because the Mainnet IDs differ. The shortened-address avoid matches the request for full IDs. The interface avoid matches the README timestamp rule. A true extra address does not fire these avoids.
3. Severity: activation. File: `:225` and `eval/qa/source-sentinels.mjs:79-81`. The activation commit must add a `present` sentinel for the three Testnet addresses on `https://developers.stellar.org/docs/data/oracles/oracle-providers`. Set `caseAsOf` to the case `truth.asOf`.

## Duplicate decisions in the report

| Topic | Report decision | Review |
| --- | --- | --- |
| R04 nested `try_*` results | Existing case; no new ID | Right |
| R23 OpenZeppelin version and audits | Existing case; no new ID | Right |
| R31 stablecoin issuers | Existing case; no new ID | Right |

1. R04. `eval/qa/corpus/battery/soroban/q-sor-decode-hosterror-codes.json:10` states `Ok(Ok(value))`, `Err(Ok(contract_error))`, and `Err(Err(invoke_error))`. Line 14 requires both nested `Result` layers. A new ID would grade the same fact.
2. R23. `eval/qa/corpus/battery/soroban/q-soroban-oz-token.json:8` records release v0.8.0 on 2026-10-20 and release-scoped audits. Line 12 requires release-scoped audit claims. GitHub `releases/latest` on 2026-11-03 is still `v0.8.0`, published `2026-10-20T16:58:32Z` (https://github.com/OpenZeppelin/stellar-contracts/releases/tag/v0.8.0). A new golden would grade the same release. This decision leaves the separate product gap in `.agents/TODO.md` ("Add a release and package-version source") open.
3. R31. `q-asset-stablecoin-issuers-discovery.json:3` asks which companies issue stablecoins. `q-eco-stablecoins-on-stellar.json:3` asks which stablecoins are live and names issuers. A third issuer-list case would duplicate those questions. `improvements/stellar-light-scout/sls-107-stablecoin-issuer-of-record-and-asset-class.md` remains an upstream brand-versus-`ORG_NAME` defect. It is not a missing golden, and this decision does not close it.
