# Independent review: stale golden docs source repair

Verdict: **APPROVE**

Reviewer: Grok, read-only, 2026-11-03.
Author lane: Codex, recorded in `tmp/urls/REPORT.md`.
This review did not edit tracked files.
This review did not read `.dev.vars`.
This review did not re-run `npm test`, lint, or compile.

## Check 1 — diff surface

Git shows 19 case files.
Each case changes only `truth.sources` and `truth.verified`.
Questions, goldens, key facts, avoid items, notes, and tags are unchanged.
The same fields match between each case file and `eval/qa/cases.json`.
`eval/qa/cases.json` has 501 cases.
`eval/qa/sample.json` changes only `corpusContentSha256`.
`eval/qa/lifecycle-registry.json` changes 19 `caseContentSha256` values.
Those 19 digests match canonical JSON of the case files.
`eval/qa/consistency-register.json` changes 13 clusters.
Changed cluster fields are `memberContentSha256`, `lastChecked`, and `reSwept`.
Cluster ids, members, notes, and verdicts stay the same.
`numericInvariants` and `dateContingentTraps` stay the same.
All 60 member hashes in those 13 clusters match the case file bytes.
Each `reSwept` record matches `tmp/urls/register-review.json`.
`git apply --check tmp/urls/todo.patch` succeeds.
The patch case list matches the 19 git case ids.

## Check 2 — live pages

I fetched these pages on 2026-11-03.
I did not follow redirects for the status checks.
The three named redirect targets return HTTP 404 and the title `Page Not Found`.

Old URL `.../docs/build/apps/smart-wallets/recovery` returns HTTP 308.
Its Location is `/docs/build/guides/contract-accounts/recovery`.
That target returns HTTP 404.
`q-passkey-wallet-recovery` is unchanged in git.
Its current pages support the recovery facts.
`advanced-patterns` says recovery stays with admins.
It names a guardian key as a policy signer.
It describes a cooldown after key rotation.
It says to emit an event when a spend limit rejects a call.
`smart-wallets` says passkeys avoid seed phrases.
It allows Ed25519 keys and policy signers.
It says keys can sync across devices through cloud providers.
File: `eval/qa/corpus/battery/soroban/q-passkey-wallet-recovery.json:39`.
File: `eval/qa/corpus/battery/soroban/q-passkey-wallet-recovery.json:53`.

Old SEP URL returns HTTP 308 to the nested fundamentals path.
That target returns HTTP 404.
The current SEPs page says SEPs differ from CAPs.
It says CAPs propose changes to the core protocol.
The stellar-protocol README says the same split.
File: `eval/qa/corpus/battery/protocol-core/q-protocol-cap-vs-sep.json`.

Old fee-sponsorship URL returns HTTP 308 to the contract-accounts path.
That target returns HTTP 404.
The current fee-sponsorship page compares fee-bump transactions, sponsored reserves, and relayers.
The new sponsored-reserves page documents `BeginSponsoringFutureReserves` and `EndSponsoringFutureReserves`.
It says the sponsor carries the base reserves.
File: `eval/qa/corpus/battery/compliance-rwa-payments/q-smart-wallet-fee-sponsorship.json`.

The old MoneyGram Docs URL returns HTTP 308.
Its Location is the MoneyGram developer ramp page.
That page says USDC cash-in and cash-out can run on Stellar.
The Stellar guide is Version 1.2, July 2026.
It documents SEP-10, SEP-24, and USDC settlement.
It has a custodial versus non-custodial table.
It sends new partners to the widget path.
`q-anchor-moneygram-ramps` already cited that guide.
The other two MoneyGram cases add the guide in this diff.

Other replacement pages also support the cited facts.

- SAC cookbook shows `stellar contract asset deploy` and `stellar contract id asset`.
- Hubble says the dataset is hosted on BigQuery for historical retrieval.
- Galexie says it exports ledger metadata and creates a data lake.
- Path payments cross the SDEX and liquidity pools.
- The page names Path Payment Strict Send and Strict Receive.
- Offer trades can stream, and a cursor selects the start.
- Lumens says supply rose by 1% annually.
- The same page says validator vote ended inflation on October 28, 2019.
- CAP-26 is Final and disables inflation at protocol 12.
- Core v12 comments the rate as 1% a year.
- `isVersionSupported` returns true only when `protocolVersion < 12`.
- Networks lists the three exact passphrases.
- They are `Public Global Stellar Network ; September 2015`.
- They are `Test SDF Network ; September 2015`.
- They are `Test SDF Future Network ; October 2022`.
- Anchor Platform lists SEP-6, SEP-12 KYC/AML, SEP-24, and SEP-31.
- The anchors page maps SEP-6, SEP-24, and SEP-31.
- Transaction simulation covers footprints, authorization, and a stale footprint.
- It says the simulation must be retried to refresh that footprint.
- State archival says a Temporary entry at TTL 0 is deleted.
- It says a Persistent or Instance entry at TTL 0 is archived until restore.

Active Docs sources contain 249 unique ref strings.
Those strings use 215 URLs after the fragment is removed.
I requested each of the 215 URLs with redirects disabled.
All 215 returned HTTP 200 and no Location header.
A fragment does not create a second HTTP resource.
The patch count of 249 matches the unique ref strings.

## Check 3 — `q-builder-content-by-person`

The diff removes only `https://developers.stellar.org/meetings/authors/kalepail`.
That URL returns HTTP 404.
Seven meeting pages remain in `truth.sources`.
Each page returns HTTP 200.
Each page shows `Tyler van der Hoeven, Developer Advocate Director`.
The 2024-06-13 page also names Super Peach, Passkey Kit, and Launchtube.
Repository sources for the meetings and projects remain.
The golden and notes still record the old index 404.
Removal of the index does not leave the roster unsupported.

## Check 4 — `tmp/urls/todo.patch`

The patch applies on the current tree.
`.agents/TODO.md` still has the open repair heading.
`.agents/rounds/2026-11-03-golden-urls.md` does not exist yet.
The patch edits only those two paths.
Its 19 case ids match the git diff.
Its claim that questions and goldens stay unchanged matches the parsed diff.
Its three HTTP 404 redirect targets match the live checks above.
Its 249 HTTP 200 count matches the unique active Docs ref strings.
I did not re-run the test or lint commands named in the patch.

## Findings

No findings require a change.

Note, severity low, no change required.
Some `truth.corroboration` rows still cite retired URLs.
Example: `eval/qa/corpus/battery/soroban/q-zk-nullifier-storage.json:82`.
Example: `eval/qa/corpus/battery/scf-grants-builders/q-builder-content-by-person.json` still cites the author index in corroboration.
Those rows keep older `observedAt` dates.
Current `truth.sources` now point at live pages.
The requested edit surface did not include corroboration.

## URLs read for content

| Status | URL |
| --- | --- |
| 404 | https://developers.stellar.org/docs/build/guides/contract-accounts/recovery |
| 404 | https://developers.stellar.org/docs/learn/fundamentals/contract-development/contract-interactions/stellar-ecosystem-proposals |
| 404 | https://developers.stellar.org/docs/build/guides/contract-accounts/fee-sponsorship |
| 200 | https://developers.stellar.org/docs/build/guides/contract-accounts/advanced-patterns |
| 200 | https://developers.stellar.org/docs/build/guides/contract-accounts/smart-wallets |
| 200 | https://developers.stellar.org/docs/learn/fundamentals/stellar-ecosystem-proposals |
| 200 | https://developers.stellar.org/docs/build/guides/transactions/sponsored-reserves |
| 200 | https://developers.stellar.org/docs/build/guides/transactions/fee-sponsorship |
| 200 | https://developer.moneygram.com/moneygram-developer/docs/integrate-moneygram-ramps |
| 200 | https://xramps.moneygram.com/ops/developer/guides/stellar |
| 200 | https://developers.stellar.org/docs/tools/cli/cookbook/deploy-stellar-asset-contract |
| 200 | https://developers.stellar.org/docs/data/analytics/hubble |
| 200 | https://developers.stellar.org/docs/data/indexers/build-your-own/galexie |
| 200 | https://developers.stellar.org/docs/build/guides/transactions/path-payments |
| 200 | https://developers.stellar.org/docs/data/apis/horizon/api-reference/get-trades-by-offer-id |
| 200 | https://developers.stellar.org/docs/learn/fundamentals/lumens |
| 200 | https://developers.stellar.org/docs/networks |
| 200 | https://developers.stellar.org/docs/platforms/anchor-platform |
| 200 | https://developers.stellar.org/docs/learn/fundamentals/anchors |
| 200 | https://developers.stellar.org/docs/learn/fundamentals/contract-development/contract-interactions/transaction-simulation |
| 200 | https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/state-archival |
| 404 | https://developers.stellar.org/meetings/authors/kalepail |
| 200 | https://developers.stellar.org/meetings/2024/06/13 |
| 200 | https://developers.stellar.org/meetings/2024/01/26 |
| 200 | https://developers.stellar.org/meetings/2024/02/08 |
| 200 | https://developers.stellar.org/meetings/2024/02/22 |
| 200 | https://developers.stellar.org/meetings/2024/03/07 |
| 200 | https://developers.stellar.org/meetings/2024/03/21 |
| 200 | https://developers.stellar.org/meetings/2024/04/18 |
| 200 | https://raw.githubusercontent.com/stellar/stellar-protocol/master/core/cap-0026.md |
| 200 | https://raw.githubusercontent.com/stellar/stellar-core/v12.0.0/src/transactions/InflationOpFrame.cpp |
| 200 | https://raw.githubusercontent.com/stellar/stellar-protocol/master/README.md |

## Redirect checks, redirects disabled

| Status | Location | URL |
| --- | --- | --- |
| 308 | `/docs/build/guides/contract-accounts/recovery` | https://developers.stellar.org/docs/build/apps/smart-wallets/recovery |
| 308 | `/docs/learn/fundamentals/contract-development/contract-interactions/stellar-ecosystem-proposals` | https://developers.stellar.org/docs/learn/encyclopedia/contract-development/contract-interactions/stellar-ecosystem-proposals |
| 308 | `/docs/build/guides/contract-accounts/fee-sponsorship` | https://developers.stellar.org/docs/build/apps/smart-wallets/fee-sponsorship |
| 308 | `https://developer.moneygram.com/moneygram-developer/docs/integrate-moneygram-ramps` | https://developers.stellar.org/docs/build/apps/moneygram-access-integration-guide |
| 308 | `/docs/build/guides/transactions/sponsored-reserves` | https://developers.stellar.org/docs/learn/encyclopedia/sponsored-reserves |
| 308 | `/docs/platforms/anchor-platform` | https://developers.stellar.org/platforms/anchor-platform |

## Active Docs bases, status only

Each URL below returned HTTP 200 on 2026-11-03.
The client did not follow redirects.
The response had no Location header.
The client read the first 200 bytes only.

- https://developers.stellar.org/docs/learn/fundamentals/anchors
- https://developers.stellar.org/docs/platforms/anchor-platform
- https://developers.stellar.org/docs/data/apis/horizon
- https://developers.stellar.org/docs/data/analytics/hubble
- https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getTransactions
- https://developers.stellar.org/docs/data/indexers/build-your-own/galexie
- https://developers.stellar.org/docs/build/guides/contract-accounts/advanced-patterns
- https://developers.stellar.org/docs/platforms/stellar-disbursement-platform
- https://developers.stellar.org/docs/platforms/stellar-disbursement-platform/admin-guide/design-and-architecture
- https://developers.stellar.org/docs/tokens/control-asset-access
- https://developers.stellar.org/docs/build/agentic-payments/mpp
- https://developers.stellar.org/docs/tools/openzeppelin-contracts
- https://developers.stellar.org/docs/build/guides/transactions/fee-sponsorship
- https://developers.stellar.org/docs/build/guides/transactions/sponsored-reserves
- https://developers.stellar.org/docs/tokens/stellar-asset-contract
- https://developers.stellar.org/docs/build/agentic-payments/x402
- https://developers.stellar.org/docs/build/agentic-payments/x402/built-on-stellar
- https://developers.stellar.org/docs/tools/cli/agent-cli/guides/pay-for-apis-x402
- https://developers.stellar.org/docs/build/guides/transactions/clawbacks
- https://developers.stellar.org/docs/platforms/stellar-disbursement-platform/admin-guide/embedded-wallets
- https://developers.stellar.org/docs/build/apps/overview
- https://developers.stellar.org/docs/tools/ramps
- https://developers.stellar.org/docs/platforms/anchor-platform/sep-guide/sep31/integration
- https://developers.stellar.org/docs/tokens/anatomy-of-an-asset
- https://developers.stellar.org/docs/build/guides/tokens/custom-sac-admin
- https://developers.stellar.org/docs/build/guides/freighter
- https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts
- https://developers.stellar.org/docs/build/guides/transactions/pooled-accounts-muxed-accounts-memos
- https://developers.stellar.org/docs/learn/fundamentals/liquidity-on-stellar-sdex-liquidity-pools
- https://developers.stellar.org/docs/tools/developer-tools/block-explorers
- https://developers.stellar.org/docs/tools/lab/transaction-dashboard
- https://developers.stellar.org/docs/tools/lab/smart-contracts/contract-explorer
- https://developers.stellar.org/docs/networks
- https://developers.stellar.org/docs/build/agentic-payments/x402/quickstart-guide
- https://developers.stellar.org/docs/build/guides/transactions/claimable-balances
- https://developers.stellar.org/docs/build/apps/example-application-tutorial/anchor-integration/sep1
- https://developers.stellar.org/docs/build/guides/transactions/path-payments
- https://developers.stellar.org/docs/learn/fundamentals/transactions/operations-and-transactions
- https://developers.stellar.org/docs/learn/fundamentals/transactions/list-of-operations
- https://developers.stellar.org/docs/build/apps/example-application-tutorial/anchor-integration/setup
- https://developers.stellar.org/docs/learn/fundamentals/lumens
- https://developers.stellar.org/docs/data/analytics/hubble/data-catalog/data-dictionary/gold/hourly-fee-agg-account
- https://developers.stellar.org/docs/learn/fundamentals/transactions/transaction-lifecycle
- https://developers.stellar.org/docs/tools/cli/agent-cli/reference/troubleshooting
- https://developers.stellar.org/docs/build/guides/transactions/create-account
- https://developers.stellar.org/docs/tools/cli/cookbook/stellar-keys
- https://developers.stellar.org/docs/data/apis/horizon/api-reference/retrieve-an-account
- https://developers.stellar.org/docs/learn/fundamentals/stellar-consensus-protocol
- https://developers.stellar.org/docs/networks/software-versions
- https://developers.stellar.org/docs/tools/cli/stellar-cli
- https://developers.stellar.org/docs/learn/fundamentals/contract-development/types/fully-typed-contracts
- https://developers.stellar.org/docs/build/guides/storage/migrate-contract-storage
- https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/state-archival
- https://developers.stellar.org/docs/build/apps/zk
- https://developers.stellar.org/docs/build/guides/transactions/invoke-contract-tx-sdk
- https://developers.stellar.org/docs/build/guides/transactions/signing-soroban-invocations
- https://developers.stellar.org/docs/build/smart-contracts/example-contracts/events
- https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getEvents
- https://developers.stellar.org/docs/build/guides/events/ingest
- https://developers.stellar.org/docs/learn/migrate/evm/solidity-and-rust-advanced-concepts
- https://developers.stellar.org/docs/build/smart-contracts/overview
- https://developers.stellar.org/docs/learn/fundamentals/contract-development/contract-interactions/stellar-transaction
- https://developers.stellar.org/docs/build/smart-contracts/getting-started/hello-world
- https://developers.stellar.org/docs/learn/fundamentals/contract-development/rust-dialect
- https://developers.stellar.org/docs/tools/cli/cookbook/deploy-contract
- https://developers.stellar.org/docs/build/guides/storage/choosing-the-right-storage
- https://developers.stellar.org/docs/learn/fundamentals/contract-development/errors-and-debugging/debugging-errors
- https://developers.stellar.org/docs/build/guides/conventions/error-enum
- https://developers.stellar.org/docs/build/guides/testing/differential-tests
- https://developers.stellar.org/docs/build/guides/testing/integration-tests
- https://developers.stellar.org/docs/build/smart-contracts/example-contracts/errors
- https://developers.stellar.org/docs/learn/migrate/evm/solidity-support-via-solang
- https://developers.stellar.org/docs/build/guides/contract-accounts/smart-wallets
- https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/simulateTransaction
- https://developers.stellar.org/docs/learn/fundamentals/contract-development/contract-interactions/transaction-simulation
- https://developers.stellar.org/docs/build/guides/storage/storage-strategies
- https://developers.stellar.org/docs/build/guides/transactions/send-and-receive-c-accounts
- https://developers.stellar.org/docs/build/guides/contract-accounts
- https://developers.stellar.org/docs/build/guides/tokens/stellar-asset-contract
- https://developers.stellar.org/docs/build/guides/conventions/upgrading-contracts
- https://developers.stellar.org/docs/build/guides/auth/check-auth-tutorials
- https://developers.stellar.org/docs/learn/fundamentals/contract-development/authorization
- https://developers.stellar.org/docs/build/smart-contracts/example-contracts/fuzzing
- https://developers.stellar.org/docs/build/apps/privacy
- https://developers.stellar.org/docs/tokens/token-interface
- https://developers.stellar.org/docs/learn/fundamentals/fees-resource-limits-metering
- https://developers.stellar.org/docs/build/guides/auth/contract-authorization
- https://developers.stellar.org/meetings/2024/12/05
- https://developers.stellar.org/docs/tools/cli/cookbook/tx-new-create-claimable-balance
- https://developers.stellar.org/meetings/2026/08/06
- https://developers.stellar.org/docs/build/guides/testing/unit-tests
- https://developers.stellar.org/docs/build/guides/testing/test-contract-auth
- https://developers.stellar.org/docs/build/smart-contracts/getting-started/setup
- https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/persisting-data
- https://developers.stellar.org/docs/build/smart-contracts/example-contracts/auth
- https://developers.stellar.org/docs/build/smart-contracts/example-contracts/deployer
- https://developers.stellar.org/docs/build/smart-contracts/getting-started/storing-data
- https://developers.stellar.org/docs/build/guides/archival/test-ttl-extension
- https://developers.stellar.org/docs/tools/quickstart/network-modes
- https://developers.stellar.org/docs/build/apps/guestbook
- https://developers.stellar.org/docs/learn/fundamentals/contract-development/contract-interactions/cross-contract
- https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/ledgers
- https://developers.stellar.org/docs/data/apis/horizon/api-reference/errors/result-codes/operation-specific/path-payment-strict-send
- https://developers.stellar.org/docs/data/apis/horizon/api-reference/errors/result-codes/operation-specific/path-payment-strict-receive
- https://developers.stellar.org/docs/data/apis/horizon/api-reference/get-trades-by-offer-id
- https://developers.stellar.org/docs/build/agentic-payments
- https://developers.stellar.org/meetings/2026/04/16
- https://developers.stellar.org/docs/tools/developer-tools/wallets
- https://developers.stellar.org/docs/data/oracles/oracle-providers
- https://developers.stellar.org/docs/learn/fundamentals/stellar-stack
- https://developers.stellar.org/docs/validators
- https://developers.stellar.org/docs/learn/fundamentals/stellar-ecosystem-proposals
- https://developers.stellar.org/docs/learn/glossary
- https://developers.stellar.org/docs/build/agentic-payments/mpp/channel-guide
- https://developers.stellar.org/docs/data/apis/horizon/api-reference/errors/result-codes/transactions
- https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getTransaction
- https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/sendTransaction
- https://developers.stellar.org/docs/data/apis/horizon/api-reference/errors/result-codes/operation-specific/payment
- https://developers.stellar.org/docs/build/guides/transactions/fee-bump-transactions
- https://developers.stellar.org/docs/build/apps/wallet/stellar
- https://developers.stellar.org/docs/tools/cli/cookbook/contract-invoke-arguments
- https://developers.stellar.org/docs/build/guides/transactions/channel-accounts
- https://developers.stellar.org/docs/data/indexers/build-your-own/ingest-sdk/developer_guide/ledgerbackends
- https://developers.stellar.org/docs/validators/admin-guide/network-upgrades
- https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getFeeStats
- https://developers.stellar.org/docs/validators/tier-1-orgs
- https://developers.stellar.org/docs/learn/fundamentals/transactions/signatures-multisig
- https://developers.stellar.org/docs/data/apis/horizon/api-reference/errors/result-codes/operation-specific/account-merge
- https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getLedgerEntries
- https://developers.stellar.org/docs/validators/admin-guide
- https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods
- https://developers.stellar.org/docs/data/apis/rpc/admin-guide/data-lake-integration
- https://developers.stellar.org/docs/data/analytics/hubble/analyst-guide/history-vs-state-tables
- https://developers.stellar.org/docs/data/analytics/hubble/analyst-guide/queries-for-horizon-like-data
- https://developers.stellar.org/docs/data/analytics/hubble/data-catalog/data-dictionary/bronze/accounts
- https://developers.stellar.org/docs/data/analytics/hubble/data-catalog/data-dictionary/bronze/trustlines
- https://developers.stellar.org/docs/data/indexers/build-your-own/ingest-sdk/developer_guide/ledgerreaders
- https://developers.stellar.org/docs/tools/sdks/client-sdks
- https://developers.stellar.org/docs/build/apps/wallet/intro
- https://developers.stellar.org/docs/data/indexers
- https://developers.stellar.org/docs/data/apis/migrate-from-horizon-to-rpc
- https://developers.stellar.org/docs/data/apis/rpc/api-reference/structure/pagination
- https://developers.stellar.org/docs/data/apis/rpc/api-reference/structure/data-format
- https://developers.stellar.org/docs/data/apis/horizon/api-reference/resources/accounts
- https://developers.stellar.org/docs/tools/cli/install-cli
- https://developers.stellar.org/docs/tools/cli
- https://developers.stellar.org/docs/tools/lab
- https://developers.stellar.org/docs/tools/cli/agent-cli/guides/check-balances-and-metadata
- https://developers.stellar.org/docs/tools/cli/cookbook/payments-and-assets
- https://developers.stellar.org/docs/data/analytics/hubble/developer-guide/connecting-to-bigquery
- https://developers.stellar.org/docs/data/analytics/hubble/developer-guide/backfill/data-import
- https://developers.stellar.org/docs/data/apis/rpc/providers
- https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getLedgers
- https://developers.stellar.org/docs/build/building-with-ai
- https://developers.stellar.org/docs/data/apis/horizon/api-reference/errors/error-handling
- https://developers.stellar.org/docs/tools/scaffold-stellar
- https://developers.stellar.org/docs/build/smart-contracts/getting-started
- https://developers.stellar.org/docs/build/guides/dapps/frontend-guide
- https://developers.stellar.org/docs/tools/openzeppelin-relayer
- https://developers.stellar.org/docs/data/apis/horizon/admin-guide/configuring
- https://developers.stellar.org/docs/data/apis/horizon/admin-guide/ingestion
- https://developers.stellar.org/docs/tools/quickstart/faucet
- https://developers.stellar.org/docs/build/apps/wallet/overview
- https://developers.stellar.org/docs/tools/sdks
- https://developers.stellar.org/docs/tools/sdks/contract-sdks
- https://developers.stellar.org/docs/data/indexers/build-your-own/galexie/data-lake-format
- https://developers.stellar.org/docs/build/guides/transactions/simulateTransaction-Deep-Dive
- https://developers.stellar.org/docs/tools/quickstart
- https://developers.stellar.org/docs/tools/lab/quickstart-with-lab
- https://developers.stellar.org/docs/build/apps/ingest-sdk/overview
- https://developers.stellar.org/docs/tools/quickstart/advanced-usage/operation-modes
- https://developers.stellar.org/docs/tools/cli/cookbook/tx-sign
- https://developers.stellar.org/docs/tools/lab/saved/keypairs
- https://developers.stellar.org/docs/data/apis/horizon/api-reference/list-all-accounts
- https://developers.stellar.org/docs/data/apis/horizon/api-reference/structure/pagination
- https://developers.stellar.org/docs/data/apis/horizon/api-reference/errors/result-codes/operation-specific/set-options
- https://developers.stellar.org/docs/build/apps/wallet/sep30
- https://developers.stellar.org/docs/data/apis/rpc
- https://developers.stellar.org/docs/data/apis
- https://developers.stellar.org/docs/tools/lab/api-explorer
- https://developers.stellar.org/docs/tools/lab/api-explorer/horizon-endpoint
- https://developers.stellar.org/docs/build/apps/guestbook/bindings
- https://developers.stellar.org/docs/tokens/cross-chain-transfers
- https://developers.stellar.org/docs/tools/cli/cookbook/deploy-stellar-asset-contract
- https://developers.stellar.org/
- https://developers.stellar.org/meetings/2024/01/26
- https://developers.stellar.org/meetings/2024/06/13
- https://developers.stellar.org/meetings/2024/02/08
- https://developers.stellar.org/meetings/2024/02/22
- https://developers.stellar.org/meetings/2024/03/07
- https://developers.stellar.org/meetings/2024/03/21
- https://developers.stellar.org/meetings/2024/04/18
- https://developers.stellar.org/meetings/2026/04/23
- https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/assets
- https://developers.stellar.org/docs/platforms/stellar-disbursement-platform/admin-guide/making-your-wallet-sdp-ready
- https://developers.stellar.org/docs/build/apps/wallet
- https://developers.stellar.org/docs/platforms/anchor-platform/sep-guide/sep45
- https://developers.stellar.org/docs/platforms/anchor-platform/sep-guide/sep6/getting-started
- https://developers.stellar.org/docs/platforms/anchor-platform/sep-guide/sep31/getting-started
- https://developers.stellar.org/docs/tokens/how-to-issue-an-asset
- https://developers.stellar.org/docs/learn/fundamentals/transactions/signatures-multisig.md
- https://developers.stellar.org/docs/data/apis/horizon/api-reference/list-all-claimable-balances
- https://developers.stellar.org/docs/build/apps/example-application-tutorial/anchor-integration
- https://developers.stellar.org/docs/platforms/anchor-platform/sep-guide/sep24/getting-started
- https://developers.stellar.org/docs/data/apis/horizon/api-reference/errors/result-codes/operation-specific/change-trust
- https://developers.stellar.org/docs/build/guides/basics/verify-trustlines
- https://developers.stellar.org/docs/platforms/anchor-platform/admin-guide/architecture
- https://developers.stellar.org/docs/build/apps/application-design-considerations
- https://developers.stellar.org/docs/networks/software-versions.md
- https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getLatestLedger.md
- https://developers.stellar.org/docs/validators/admin-guide/network-upgrades.md
- https://developers.stellar.org/docs/learn/fundamentals/stellar-consensus-protocol.md
- https://developers.stellar.org/docs/tools/lab/account
- https://developers.stellar.org/docs/validators/admin-guide/monitoring
- https://developers.stellar.org/docs/validators/admin-guide/publishing-history-archives
