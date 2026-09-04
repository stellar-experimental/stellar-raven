# Candidate row review — stellarDocs — Terra

## Scope and result

I reviewed the `stellarDocs` shard in the candidate artifact.

- Artifact: `/private/tmp/stellar-raven-tm-runner/eval/qa/results/2026-09-04T05-40-51-variantA.json`
- Artifact SHA-256: `e629666bf476244d350840069094a8a579757724c101830d6d6727685b5904f7`
- Selected rows: 239.
- Correct: 91.
- Partial: 112.
- Wrong: 36.
- Ungraded, T4, and T5 rows: 0.

I found no disputed grade. I found no confirmed judge artifact.

I did not make a live check. The review uses candidate-window evidence only.
No post-drift current-truth evidence is present in this report.

## Review method

For every partial and wrong row, I inspected the answer, transcript, canonical
`caseInput.golden`, missing facts, wrong claims, avoid matches, and rationale.
For every correct row, I checked the answer and transcript for unsupported claims,
hidden omissions, and suspicious tool use.

All 239 rows had a successful `mcp__raven__execute` call. Therefore, no row had a
terminal tool-transport failure. The judged failures are answer synthesis or
evidence-selection failures. They are not a Docs data finding on this evidence.

The three correct rows with a panel split were `q-anchor-moneygram-ramps`,
`q-comp-auth-flags-overview`, and `q-pc-protocol-27-zipper`. A direct review supports
their final Correct grades. Each answer kept the required historical or source scope.

## Coverage proof

The selector was exactly `rows[].tags.service == "stellarDocs"`.

| Check | Result |
| --- | --- |
| Selected rows | 239 |
| Unique selected IDs | 239 |
| Duplicate selected IDs | none |
| Grade total | 91 + 112 + 36 = 239 |
| Sorted selected-ID SHA-256 | `48b5b6a51f3c3c6dce94da831457f1d27e05983346eae4b4069d878af03757b0` |
| Reviewed-ID set | equal to the selected-ID set |

The two failure ledgers below contain 148 distinct IDs. The remaining 91 unique IDs
are the Correct ledger. This partition totals 239 once and only once.

## Step 5 root-cause classification

Every Partial and Wrong row is an **Agent failure**. The transcript shows that the
agent reached usable evidence, then omitted a required distinction, overgeneralized
a source, or stated an unsupported detail. No reviewed row supports an
own-repo scoring, catalog, executor, adapter, normalizer, golden, or Docs-content
root cause as the reason for its grade.

`q-pc-slp-0004-0006-status` is also an Agent failure. Its search exposed
`scout.searchRepos` as the leading exact follow-up. The agent did not use it.

### Wrong ledger — 36 Agent failures

`q-asset-amm-fee-reserve`, `q-defi-flash-loans`, `q-defi-sdex-offer-lifecycle`,
`q-edge-metamask-evm-mental-model`, `q-edge-noinfo-stellar-native-privacy-default`,
`q-infra-quickstart-local-network`, `q-infra-rpc-methods-list`,
`q-infra-secp256r1-passkeys`, `q-infra-which-indexer`,
`q-pay-anchor-msb-licensing`, `q-pc-muxed-accounts`,
`q-pc-slp-0004-0006-status`, `q-protocol-accounts-signers-thresholds`,
`q-protocol-base-reserve-min-balance`, `q-protocol-ledger-close-time`,
`q-quickstart-manual-ledger-close`, `q-raph-lobstr-legitimacy`,
`q-raph-restore-wallet`, `q-sep-8-regulated-assets`,
`q-sor-decode-hosterror-codes`, `q-sor-deploy-invoke-from-js-sdk`,
`q-sor-force-fast-archival-localnet`, `q-sor-persistent-unbounded-collection-cap`,
`q-soroban-cli-bindings`, `q-soroban-contractmeta-vs-contractevent`,
`q-soroban-wasm-size-limit`, `q-ti-enumerate-holders-airdrop`,
`q-ti-freighter-localhost-not-detected`, `q-ti-historical-pointintime-balances`,
`q-ti-scaffold-stellar`, `q-ti-stellar-lab-usage-and-new-ui`,
`q-ti-tx-too-late-resubmit`, `q-tool-cctp-stellar-integration`,
`q-tool-flutter-mobile-sdk`, `q-tool-js-sdk-package`,
`q-tool-passkey-wallet-recovery`.

These grades are supported by the answer-visible wrong claim or avoid match. The
main classes are an incorrect precise value or command, an unsafe universal claim,
or a source-evidence tier that the answer promoted without support.

### Partial ledger — 112 Agent failures

`q-aas-claim-received-claimable-balances`, `q-anchor-endpoint-discovery`,
`q-anchor-platform-what`, `q-anchor-sdp-vs-anchor-platform`,
`q-asset-deploy-sac-cli`, `q-asset-trustline-basics`, `q-asset-usdc-eurc-issuer`,
`q-asset-wallet-sdk-seps`, `q-comp-anchor-compliance-stack`,
`q-comp-sac-inherits-flags`, `q-comp-sep6-vs-sep12-roles`,
`q-comp-sep8-regulated-assets-approval-server`, `q-crp-become-an-anchor-licensing`,
`q-crp-export-tx-history-taxes`, `q-crp-sdp-operation`,
`q-defi-arbitrage-pathpayment-bots`, `q-edge-asset-site-scam-detection`,
`q-edge-exchange-memo-lost-funds`, `q-edge-fresh-latest-protocol-version`,
`q-edge-validators-reverse-tx-fork-detection`, `q-infra-horizon-vs-rpc`,
`q-infra-hubble-bigquery`, `q-infra-rpc-provider-archive-tier`,
`q-infra-simulate-transaction-howto`, `q-jutsu-check-account-history`,
`q-jutsu-what-is-a-memo`, `q-passkey-platform-constraints`,
`q-passkey-smart-account-architecture`, `q-passkey-wallet-recovery`,
`q-pay-moneygram-ramps`, `q-pay-sdp-disbursement`, `q-pc-address-types-strkey`,
`q-pc-bucketlist-vs-merkle-inclusion-proof`, `q-pc-memos-reference`,
`q-pc-multisig-setup-lifecycle`, `q-pc-protocol-26-yardstick`,
`q-pc-quantum-preparedness-dormant`, `q-pc-sequence-numbers-ordering-replace`,
`q-pc-surge-griefing-threat-model`, `q-pc-tx-finality-failure-semantics`,
`q-production-anchor-architecture`, `q-protocol-19-preconditions-cap-0021`,
`q-protocol-23-whisk-caps`, `q-protocol-24-whisk-incident`,
`q-protocol-27-cap-0071`, `q-protocol-bn254-poseidon-xray`,
`q-protocol-cap-process`, `q-protocol-cap-vs-sep`,
`q-protocol-ledger-header-fields`, `q-protocol-parallel-execution`,
`q-protocol-validator-node-roles`, `q-protocol-validator-upgrade-vote`,
`q-protocol-version-history-list`, `q-raph-buy-xlm-safely`,
`q-raph-low-xlm-transfer-fail`, `q-raph-merchant-payments`,
`q-raph-offramp-xlm-usdc`, `q-raph-remittance-path-payment`,
`q-rwa-stellar-vs-erc20-regulated`, `q-sep-12-kyc`, `q-sep-41-token-interface`,
`q-sep-45-contract-auth`, `q-sep-6-24-deprecation`, `q-sep53-message-signing`,
`q-sep6-sep24-sep31-choice`, `q-sor-build-target-wasm32v1`,
`q-sor-classic-dex-from-contract`, `q-sor-contract-trustlines-c-address`,
`q-sor-doc-timestamping-manage-data`, `q-sor-evm-to-soroban-porting`,
`q-sor-p23-auto-restore-extendto`, `q-sor-require-auth-propagation`,
`q-sor-scval-conversion`, `q-sor-sep41-transfer-vs-transferfrom`,
`q-soroban-auth-delegation-p27`, `q-soroban-check-auth-custom-account`,
`q-soroban-constructor-lifecycle`, `q-soroban-contract-build-verification`,
`q-soroban-contract-id-derivation`, `q-soroban-cross-contract-call`,
`q-soroban-event-indexing-design`, `q-soroban-factory-pattern`,
`q-soroban-no-std-constraints`, `q-soroban-publish-events`,
`q-soroban-require-auth`, `q-soroban-simulate-resource-fee`,
`q-soroban-storage-migration`, `q-soroban-storage-types`,
`q-soroban-unit-testing`, `q-soroban-upgradeable-storage-compat`,
`q-soroban-wasm-language`, `q-stellar-recurring-payments`,
`q-ti-classic-submission-errors`, `q-ti-cli-rust-windows-troubleshooting`,
`q-ti-compute-token-lp-market-data`, `q-ti-custodial-account-generation-c-address`,
`q-ti-enumerate-all-contracts`, `q-ti-find-export-secret-key`,
`q-ti-friendbot-ratelimit-alternatives`, `q-ti-java-sdk-wallet-feebump`,
`q-ti-parse-raw-ledger-data`, `q-ti-rpc-gettransactions-pagination-xdr`,
`q-ti-secret-key-vs-mnemonic-derivation`, `q-ti-self-host-retention-backfill`,
`q-ti-testnet-usdc-faucet`, `q-tool-cli-testnet-identity-howto`,
`q-tool-freighter-wallet`, `q-tool-lab-what-is`,
`q-tool-passkeykit-smart-wallet`, `q-tool-rust-soroban-sdk`,
`q-tool-wallets-comparison`, `q-tool-which-sdk-comparison`.

The Partial grades retain a correct core answer. They omit a required distinction,
scope limit, dated observation, or operational step. Ten also contain a bounded
wrong claim. Those rows are `q-anchor-sdp-vs-anchor-platform`,
`q-asset-deploy-sac-cli`, `q-crp-sdp-operation`, `q-edge-exchange-memo-lost-funds`,
`q-pc-quantum-preparedness-dormant`, `q-raph-offramp-xlm-usdc`,
`q-rwa-stellar-vs-erc20-regulated`, `q-ti-find-export-secret-key`,
`q-ti-friendbot-ratelimit-alternatives`, and `q-tool-freighter-wallet`.

`q-aas-claim-received-claimable-balances` has a duplicate, contradictory
`missingFacts` entry. Its rationale and answer still support Partial. It omits the
single-balance lookup. This is a verdict-field quality note, not a grade dispute.

## Actionable patterns

1. **Own-repo executor or adapter gap: non-serializable successful results.**
   A direct return caused `Could not serialize object of type "Object"` in 220 of
   239 selected rows. Every affected agent then retried with `JSON.stringify` or a
   projection. This is repeated executor-shape friction. Record it as one own-repo
   work item. Do not treat it as a Docs failure.

2. **Agent evidence-to-claim discipline is weak.**
   Wrong rows repeatedly promoted a generic or adjacent source into a precise claim.
   Examples include a generic trustline reserve for pool shares, code presence for
   deployment, and a stale or incomplete command pattern. This pattern crosses
   unrelated stable facts. It clears the monitor-only bar.

3. **Agent completeness drops after long evidence collection.**
   Partial rows often answer the main question but omit a required boundary, such as
   a support limit, a separate role, a recovery constraint, a transaction follow-up,
   or a distinction between protocol and product behavior. This pattern crosses
   anchors, Classic, Soroban, tools, and wallet cases. It clears the monitor-only bar.

4. **Changeable claims need a visible observation date and source scope.**
   The failures include provider rosters, CLI forms, protocol status, product versions,
   and wallet behavior. The agent often cited a URL without attaching the observation
   date to the claim. This is a cross-case agent behavior pattern.

No case-specific fix is proposed in this review.

## Grade disputes

None.
