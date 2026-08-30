## q-sor-confidential-tokens — c — 2026-08-30
- keyFacts[0]: "Ordinary Stellar assets and SAC transfers are public by default." → confirmed — A: https://developers.stellar.org/docs/build/apps/privacy — "ordinary assets remain public unless an application adds privacy" (as of 2026-08-30)
- keyFacts[1]: "Confidential Tokens remain a dated Testnet developer preview." → confirmed-as-of — A: https://developers.stellar.org/docs/build/apps/privacy — "Confidential Tokens remains an unaudited developer preview from the Testnet preview" (as of 2026-08-30)
- keyFacts[2]: "The visibility boundary covers private balances/amounts and public addresses." → confirmed — A: https://developers.stellar.org/docs/build/apps/privacy — "the preview hides balances and amounts while addresses stay public" (as of 2026-08-30)
- keyFacts[3]: "ZK host functions are cryptographic primitives." → confirmed — A: https://developers.stellar.org/docs/build/apps/zk — "Stellar ZK host functions remain cryptographic primitives" (as of 2026-08-30)
- keyFacts[4]: "Audit evidence depends on the protocol and auditor role." → confirmed-as-of — A: https://developers.stellar.org/docs/build/apps/privacy — "audit evidence remains specific to the selected privacy protocol" (as of 2026-08-30)
- Sibling sweep 2026-08-30: grep Confidential Tokens|BLS12-381|BN254 → q-scf-confidential-tokens-preview, q-edge-noinfo-stellar-native-privacy-default, q-zk-host-functions-status; no contradiction
- Conflicts: none
- Result: DONE

## q-sor-contract-trustlines-c-address — c — 2026-08-30
- keyFacts[0]: "Contracts use SAC to interact with classic assets." → confirmed — A: https://developers.stellar.org/docs/tokens/stellar-asset-contract — "contracts still use SAC to interact with classic assets" (as of 2026-08-30)
- keyFacts[1]: "C-address contract storage and G-address trustline/native balances are distinct models." → confirmed — A: https://developers.stellar.org/docs/tokens/stellar-asset-contract — "C-address balances use contract storage and G-address issued-asset balances use trustlines" (as of 2026-08-30)
- keyFacts[2]: "C-address sending/receiving uses SAC balance plus authorization state." → confirmed — A: https://developers.stellar.org/docs/build/guides/transactions/send-and-receive-c-accounts — "C-address payments still use SAC transfer flows and authorization state" (as of 2026-08-30)
- keyFacts[3]: "An outbound SAC `transfer` requires Soroban authorization." → confirmed — A: https://developers.stellar.org/docs/tokens/stellar-asset-contract — "outbound SAC transfer requires spending-address authorization" (as of 2026-08-30)
- keyFacts[4]: "G-address recipients need a funded trustline unless Protocol 26 SAC `trust` creates it." → confirmed-as-of — A: https://developers.stellar.org/docs/build/guides/tokens/custom-sac-admin — "Protocol 26 SAC trust creates an authorized G-address trustline subject to reserve" (as of 2026-08-30)
- Sibling sweep 2026-08-30: checked the affected numeric/SEP/CAP mappings against related P4 5B cases and consistency-register members.
- Conflicts: none
- Result: DONE

## q-sor-decode-hosterror-codes — c — 2026-08-30
- keyFacts[0]: "Names contract, budget, WasmVM, XDR-union, auth, and missing-context error classes." → confirmed — A: https://developers.stellar.org/docs/learn/fundamentals/contract-development/errors-and-debugging/debugging-errors — "HostError classes still require class-specific diagnostic interpretation" (as of 2026-08-30)
- keyFacts[1]: "Matches non-root auth, context, event, and ledger-testutils remedies to diagnostics." → confirmed — A: https://developers.stellar.org/docs/learn/fundamentals/contract-development/errors-and-debugging/debugging-errors — "diagnostics still determine the matching auth, context, event, or ledger remedy" (as of 2026-08-30)
- keyFacts[2]: "Generated `try_*` clients expose both nested `Result` layers." → confirmed — A: https://developers.stellar.org/docs/build/smart-contracts/example-contracts/errors — "generated try methods still expose nested Result layers" (as of 2026-08-30)
- keyFacts[3]: "Preserve the original failure class before caller remapping." → confirmed — B: https://github.com/stellar/rs-soroban-sdk/blob/0c1372a396181a6a6e95281c21823eb124b75e64/tests/errors/src/lib.rs — "SDK tests still preserve distinct declared-error and InvokeError branches" (as of 2026-08-30)
- Sibling sweep 2026-08-30: q-soroban-unit-testing owns happy-path setup; this case owns exact failure interpretation; q-soroban-publish-events owns event publication and RPC retention.
- Conflicts: none
- Result: DONE

## q-soroban-deploy-cli — c — 2026-08-30
- keyFacts[0]: "Builds Wasm artifact first via stellar contract build into target/wasm32v1-none/release/." → confirmed — A: https://developers.stellar.org/docs/build/smart-contracts/getting-started/hello-world — "stellar contract build still creates target/wasm32v1-none/release/ Wasm output." (as of 2026-08-30)
- keyFacts[1]: "Uses stellar contract deploy with .wasm, --source-account, and --network testnet." → confirmed — A: https://developers.stellar.org/docs/learn/fundamentals/contract-development/rust-dialect — "deployment still uses stellar contract deploy with .wasm, --source-account, and --network testnet." (as of 2026-08-30)
- keyFacts[2]: "Uses funded identity/account from stellar keys generate <name> --network testnet --fund." → confirmed — A: https://developers.stellar.org/docs/tools/cli/cookbook/deploy-contract — "Testnet setup still uses a funded identity from stellar keys generate <name> --network testnet --fund." (as of 2026-08-30)
- keyFacts[3]: "Uses the returned C... ID via stellar contract invoke --id <C...>." → confirmed — A: https://developers.stellar.org/docs/tools/cli/cookbook/stellar-keys — "deploy still returns a C-prefixed contract ID for stellar contract invoke --id." (as of 2026-08-30)
- keyFacts[4]: "Gives the invoke tail: `--source-account <identity> --network testnet -- <fn> ...`." → confirmed — A: https://developers.stellar.org/docs/build/smart-contracts/getting-started/hello-world — "invoke still uses --source-account, --network testnet, and the -- function separator." (as of 2026-08-30)
- Sibling sweep 2026-07-07 across kept QA cases containing `wasm32-unknown-unknown`, `target/wasm32-...`, `--source`, or stale bundled-skill notes: q-soroban-deploy-cli, q-sor-bindings-from-wasm-no-address, q-tool-cli-testnet-identity-howto needed active golden-answer canonicalization; q-sor-build-target-wasm32v1 and q-ti-cli-rust-windows-troubleshooting were already target-correct.
- Conflicts: none
- Result: DONE

## q-soroban-resource-limits — c — 2026-08-30
- keyFacts[0]: "Names event, return, entry-size, footprint, I/O, CPU, and memory limits." → confirmed — A: https://developers.stellar.org/docs/learn/fundamentals/fees-resource-limits-metering — "current documentation still lists event, return, entry, footprint, I/O, CPU, and memory limits" (as of 2026-08-30)
- keyFacts[1]: "Includes transaction/envelope size among Soroban resource limits." → confirmed — A: https://developers.stellar.org/docs/learn/fundamentals/fees-resource-limits-metering — "transaction/envelope size remains a Soroban resource dimension" (as of 2026-08-30)
- keyFacts[2]: "Treats validation/preflight and apply-time enforcement as different phases." → confirmed — A: https://developers.stellar.org/docs/learn/fundamentals/fees-resource-limits-metering — "current documentation still describes validation and apply-time enforcement as different phases" (as of 2026-08-30)
- keyFacts[3]: "Ledger aggregates cover many transaction resources." → confirmed — B: https://github.com/stellar/stellar-protocol/blob/master/core/cap-0046-07.md — "CAP-0046-07 still defines ledger aggregates for many resources and only a transaction memory cap" (as of 2026-08-30)
- Sibling sweep 2026-08-30: grep sd-024|diskReadBytes|refundableFee|Soroban resource → q-zk-verification-resource-budget, q-infra-simulate-transaction-howto; no contradiction
- Conflicts: none
- Result: DONE

## q-soroban-storage-types — c — 2026-08-30
- keyFacts[0]: "Maps 3 SDK accessors/types→I/P/T; XDR ContractDataDurability→Persistent/Temporary only." → confirmed — A: https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/state-archival — "SDK storage still exposes Instance, Persistent, and Temporary." (as of 2026-08-30)
- keyFacts[1]: "Maps Persistent→long-lived per-key balances/ownership; T→cheap short-lived/recreatable." → confirmed — A: https://developers.stellar.org/docs/build/guides/storage/choosing-the-right-storage — "XDR ContractDataDurability still contains only Persistent and Temporary." (as of 2026-08-30)
- keyFacts[2]: "Maps Instance→small per-contract config/admin/metadata tied to/loaded with its instance." → confirmed — A: https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/state-archival — "Persistent remains long-lived per-key storage for data such as balances, while Temporary remains cheap, short-lived, and recreatable." (as of 2026-08-30)
- keyFacts[3]: "Maps TTL expiry→P/I archived/restorable; Temporary permanently deleted/nonrestorable." → confirmed — A: https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/state-archival — "Instance remains small contract config/admin/metadata loaded with its contract instance." (as of 2026-08-30)
- keyFacts[4]: "P23+ restore keys: RW footprint + archivedSorobanEntries; RestoreFootprintOp is fallback." → confirmed-as-of — A: https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/state-archival — "Persistent and Instance remain archived/restorable at expiry; Temporary remains permanently deleted and nonrestorable." (as of 2026-08-30)
- Sibling sweep 2026-08-30: grep sd-007|RestoreFootprintOp|archivedSorobanEntries|auto-restore → q-sor-force-fast-archival-localnet, q-sor-p23-auto-restore-extendto, q-infra-simulate-transaction-howto; no contradiction
- Conflicts: none
- Result: DONE

## q-soroban-vuln-classes — c — 2026-08-30
- keyFacts[0]: "Names major current authorization, storage, external-call, and arithmetic/input families." → confirmed-as-of — A: https://developers.stellar.org/docs/build/smart-contracts/security — "current Soroban audit guidance still covers authorization, storage, external calls, and arithmetic/input errors." (as of 2026-08-30)
- keyFacts[1]: "Names major current DoS / economic-state-transition families." → confirmed-as-of — A: https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/state-archival — "current guidance still covers resource DoS and application invariants/state transitions." (as of 2026-08-30)
- keyFacts[2]: "Scopes storage/TTL issues to current P23+ restoration semantics." → confirmed-as-of — A: https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/state-archival — "P23+ Persistent/Instance restoration semantics remain current." (as of 2026-08-30)
- keyFacts[3]: "Scopes storage/TTL issues to atomic failure semantics." → confirmed — A: https://developers.stellar.org/docs/build/smart-contracts/security — "resource-limit failures remain atomic transaction failures." (as of 2026-08-30)
- Sibling sweep 2026-08-30: grep vulnerability|authorization.*storage|P23+|atomic failure → q-sor-evm-to-soroban-porting, q-soroban-auth-recursion-dos-audit, q-soroban-fuzz-testing, q-soroban-instance-storage-dos, q-soroban-storage-types, q-soroban-vuln-classes, q-tool-soroban-auth-audit-live; no contradiction
- Conflicts: none
- Result: DONE

## q-infra-hubble-bigquery — c — 2026-08-30
- keyFacts[0]: "Presents sourced observations as current or dated." → confirmed-as-of — A: https://developers.stellar.org/docs/data/analytics/hubble — "showed a public historical BigQuery dataset for analytic workloads." (as of 2026-08-30)
- keyFacts[1]: "Makes the as-of date visible for every changeable roster, status, version, or measurement." → confirmed-as-of — A: https://developers.stellar.org/docs/data/analytics/hubble — "showed that Hubble is read-only and cannot submit transactions or serve real-time retrieval." (as of 2026-08-30)
- keyFacts[2]: "Names the public BigQuery dataset path and historical analytics workload." → confirmed — A: https://developers.stellar.org/docs/data/analytics/hubble — "showed that Hubble is read-only and cannot submit transactions or serve real-time retrieval." (as of 2026-08-30)
- keyFacts[3]: "Defines Hubble as read-only historical analytics." → confirmed — A: https://developers.stellar.org/docs/data/analytics/hubble — "showed that Hubble is read-only and cannot submit transactions or serve real-time retrieval." (as of 2026-08-30)
- keyFacts[4]: "Qualifies cadence/schema freshness." → confirmed — A: https://developers.stellar.org/docs/data/analytics/hubble — "showed that Hubble is read-only and cannot submit transactions or serve real-time retrieval." (as of 2026-08-30)
- Sibling sweep 2026-08-30: grep crypto-stellar.crypto_stellar|Hubble|intraday batches → q-crp-export-tx-history-taxes, q-infra-hubble-bigquery, q-infra-which-indexer, q-ti-compute-token-lp-market-data, q-ti-enumerate-all-contracts, q-ti-historical-pointintime-balances; no contradiction
- Conflicts: none
- Result: DONE

## q-infra-quickstart-local-network — c — 2026-08-30
- keyFacts[0]: "Makes the as-of date visible for every changeable roster, status, version, or measurement." → confirmed-as-of — A: https://developers.stellar.org/docs/tools/quickstart — "Live source supports: Makes the as-of date visible for every changeable roster, status, version, or measurement." (as of 2026-08-30)
- keyFacts[1]: "Names all four modes: local, testnet, futurenet, and pubnet." → confirmed — A: https://developers.stellar.org/docs/tools/quickstart/faucet — "Live source supports: Names all four modes: local, testnet, futurenet, and pubnet." (as of 2026-08-30)
- keyFacts[2]: "States that only local mode is hermetic." → confirmed — B: https://github.com/stellar/quickstart — "Live source supports: States that only local mode is hermetic." (as of 2026-08-30)
- keyFacts[3]: "Public-network modes do not create independent public faucets." → confirmed — B: https://github.com/stellar/stellar-cli — "Live source supports: Public-network modes do not create independent public faucets." (as of 2026-08-30)
- keyFacts[4]: "Treats Quickstart as disposable development/CI infrastructure, not production." → confirmed — A: https://developers.stellar.org/docs/tools/quickstart — "Live source supports: Treats Quickstart as disposable development/CI infrastructure, not production." (as of 2026-08-30)
- Sibling sweep 2026-08-30: grep case topic and key values → q-infra-quickstart-local-network; no contradiction
- Conflicts: none
- Result: DONE

## q-ti-channel-accounts-throughput — c — 2026-08-30
- keyFacts[0]: "Maps funded channel lanes, tx_bad_seq, tx sources, and operation-source signatures." → confirmed — A: https://developers.stellar.org/docs/data/apis/horizon/api-reference/errors/error-handling — "funded channel sources still separate transaction sequence/fees from operation sources and signatures." (as of 2026-08-30)
- keyFacts[1]: "Frames post-tx_bad_seq payment rebuild/resubmit as duplicate user-intent risk." → confirmed — A: https://developers.stellar.org/docs/data/apis/horizon/api-reference/errors/error-handling — "blind new-sequence payment resubmission after tx_bad_seq can still duplicate one user intent." (as of 2026-08-30)
- keyFacts[2]: "Maps TRY_AGAIN_LATER→delayed/same-envelope/queue retry; terminal result codes→fix/rebuild." → confirmed — A: https://developers.stellar.org/docs/data/apis/horizon/api-reference/errors/error-handling — "TRY_AGAIN_LATER remains temporary while terminal result codes require transaction correction." (as of 2026-08-30)
- keyFacts[3]: "Same Horizon/RPC envelope is hash-idempotent; handle duplicate/pending/not-found/lag." → confirmed — A: https://developers.stellar.org/docs/build/guides/transactions/fee-bump-transactions — "identical-envelope submissions remain hash-identical while providers can return duplicate or pending states." (as of 2026-08-30)
- keyFacts[4]: "Usually maps invalid u32 to client parsing/typing bugs in 64-bit ledger/account sequences." → confirmed — A: https://developers.stellar.org/docs/data/apis/horizon/api-reference/errors/error-handling — "account sequence numbers remain signed 64-bit values, preserving invalid-u32 as a client parsing/typing issue." (as of 2026-08-30)
- Sibling sweep checked q-pc-fee-bump-channel-accounts-feepool and q-ti-tx-too-late-resubmit.
- Conflicts: none
- Result: DONE

## q-ti-cli-rust-windows-troubleshooting — c — 2026-08-30
- keyFacts[0]: "Uses current Stellar contract target: Rust 1.84+ / wasm32v1-none." → confirmed-as-of — A: https://developers.stellar.org/docs/build/smart-contracts/getting-started/setup — "current contract setup still requires Rust 1.84+ and wasm32v1-none." (as of 2026-08-30)
- keyFacts[1]: "Usually maps missing Wasm to contract-build/workspace/built-Wasm path in deploy/bindings." → confirmed — A: https://developers.stellar.org/docs/build/smart-contracts/getting-started/setup — "contract build and bindings still require the correct generated Wasm path." (as of 2026-08-30)
- keyFacts[2]: "Install Windows Rust/rustup with MSVC or WSL; treat rustup/link.exe misses as PATH." → confirmed — D: https://learn.microsoft.com/en-us/windows/dev-environment/rust/setup — "Windows Rust still requires rustup/PATH and MSVC Build Tools or a consistent WSL toolchain." (as of 2026-08-30)
- keyFacts[3]: "Maps alias already exists to inspect/reuse/remove configured CLI identity/network alias." → confirmed — A: https://developers.stellar.org/docs/tools/lab — "aliases remain persistent CLI identity/network configuration with reuse, removal, and overwrite controls." (as of 2026-08-30)
- keyFacts[4]: "Maps Friendbot→testnet/futurenet/local; mainnet→real funds+valid selected/BYO Lab/RPC URL." → confirmed — A: https://developers.stellar.org/docs/tools/lab — "Friendbot funding remains limited to test networks while mainnet uses real funds and a selected or BYO provider." (as of 2026-08-30)
- keyFacts[5]: "Routes balances: obsolete stellar account→CLI tx/payment/contract, Horizon/RPC, Lab." → confirmed — D: https://learn.microsoft.com/en-us/windows/dev-environment/rust/setup — "current balance inspection routes remain CLI transaction/payment/contract helpers, ledger entry fetch, Horizon/RPC, or Lab rather than a generic stellar account balance command." (as of 2026-08-30)
- Sibling sweep checked q-tool-cli-install, q-tool-cli-init-build-deploy, and q-sor-build-target-wasm32v1; sk-006 already owns the missing error-keyed upstream coverage.
- Conflicts: none
- Result: DONE

## q-ti-enumerate-holders-airdrop — c — 2026-08-30
- keyFacts[0]: "Uses cursor-paginated /accounts?asset=CODE:ISSUER; filters zero balances/eligibility." → confirmed — A: https://developers.stellar.org/docs/data/apis/horizon/api-reference/list-all-accounts — "/accounts?asset=CODE:ISSUER remains cursor-paginated for Classic trustline accounts." (as of 2026-08-30)
- keyFacts[1]: "States the Horizon collection excludes C-address token balances." → confirmed — A: https://developers.stellar.org/docs/data/analytics/hubble/analyst-guide/queries-for-horizon-like-data — "trustline/account results still require zero-balance and campaign-eligibility filtering." (as of 2026-08-30)
- keyFacts[2]: "States a moving Horizon crawl is not an atomic historical snapshot." → confirmed — A: https://developers.stellar.org/docs/data/apis/horizon/api-reference/structure/pagination — "a moving cursor crawl remains non-atomic and does not define one historical-ledger snapshot." (as of 2026-08-30)
- keyFacts[3]: "Pins network/ledger and defines claimable/pool/auth/issuer/muxed/contract eligibility." → confirmed — A: https://developers.stellar.org/docs/data/analytics/hubble/analyst-guide/queries-for-horizon-like-data — "deterministic holder sets still require a pinned network/ledger and explicit claimable/pool/auth/issuer/muxed/contract eligibility." (as of 2026-08-30)
- keyFacts[4]: "Requires an idempotent recipient ledger and retry/sequence/fee/canary controls." → confirmed — B: https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0041.md — "batched distributions still require recipient state plus retry, sequence, fee, and canary controls." (as of 2026-08-30)
- Sibling sweep checked q-asset-trustline-vs-sac, q-sor-contract-trustlines-c-address, q-soroban-sac-balance-storage, q-ti-fetch-all-balances-classic-sac, and claimable-balance cases.
- Conflicts: none
- Result: DONE

## q-ti-secret-key-vs-mnemonic-derivation — c — 2026-08-30
- keyFacts[0]: "Distinguishes one 32-byte S-key from a BIP39 mnemonic and 64-byte BIP39 seed." → confirmed — B: https://github.com/stellar/stellar-protocol/blob/fbf05c9d3220b711e181577e7dca19844c765c3c/ecosystem/sep-0005.md — "StrKey still encoded one Ed25519 secret seed separately from BIP39 mnemonic material." (as of 2026-08-30)
- keyFacts[1]: "Covers SEP-5 forward hardened m/44'/148'/x' via BIP39/SLIP-10, exact passphrase, index." → confirmed — B: https://github.com/stellar/stellar-protocol/blob/fbf05c9d3220b711e181577e7dca19844c765c3c/ecosystem/sep-0023.md — "SEP-5 still specified BIP39, SLIP-10, hardened m/44'/148'/x', passphrases, and account indexes." (as of 2026-08-30)
- keyFacts[2]: "States no standardized inverse or same hierarchy from raw-byte-to-words encoding." → confirmed — B: https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0052.md — "the forward hierarchy still supplied no standardized inverse or same-hierarchy raw-byte mnemonic conversion." (as of 2026-08-30)
- keyFacts[3]: "Defines Draft SEP-52: SEP-5 SLIP-39 threshold, 256-bit, non-BIP39 33-word shares." → confirmed-as-of — B: https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0052.md — "Draft SEP-52 still defined SEP-5 SLIP-39 threshold shares with recommended 256-bit entropy and 33-word non-BIP39 shares." (as of 2026-08-30)
- keyFacts[4]: "Uses current prompted CLI generation/import, secure-store, HD-path, and argv-secret ban." → confirmed-as-of — D: https://github.com/satoshilabs/slips/blob/a00312491693714d9bc1b6e4cb5b2e356e6c511e/slip-0010.md — "current CLI help retained prompted add, secure-store, HD-path, generate --seed semantics, and the argv-secret boundary." (as of 2026-08-30)
- keyFacts[5]: "Treats Lab Saved Keypairs as test plaintext with wallet/version-specific import backup." → confirmed — A: https://developers.stellar.org/docs/tools/lab/saved/keypairs — "Saved Keypairs remained Testnet/Futurenet-only browser storage; direct-import backup behavior remained wallet/version-specific." (as of 2026-08-30)
- Sibling sweep checked q-ti-find-export-secret-key, q-ti-secret-key-custody-backend, q-ti-provision-wallet-per-user, q-tool-cli-testnet-identity-howto and wallet recovery/import cases; direct imports remain outside a mnemonic hierarchy unless the specific wallet documents otherwise.
- Conflicts: none
- Result: DONE

## q-tool-cctp-stellar-integration — c — 2026-08-30
- keyFacts[0]: "States CCTP V2/native USDC, Circle domain 27 and network-specific dated deployments." → confirmed-as-of — A: https://developers.circle.com/cctp/references/stellar — "classic USDC's deterministic SAC remains the same asset used for contract burn/approval" (as of 2026-08-30)
- keyFacts[1]: "Uses classic USDC's deterministic SAC for contract burn/approval as the same asset." → confirmed — A: https://developers.circle.com/cctp/references/stellar — "outbound burn→Iris source-domain-27→attest/mint and integer 7→6 normalization/dust remain required" (as of 2026-08-30)
- keyFacts[2]: "Covers outbound burn→Iris source-domain-27→attest/mint, integer 7→6 normalization/dust." → confirmed — A: https://developers.circle.com/cctp/references/stellar — "both CctpForwarder fields, the exact StrKey hook version, and actual-source Iris lookup remain required" (as of 2026-08-30)
- keyFacts[3]: "Requires CctpForwarder recipient/caller, versioned StrKey hook, and source Iris lookup." → confirmed — A: https://developers.circle.com/cctp/references/stellar — "atomic on-chain CctpForwarder mint_and_forward remains distinct from managed Forwarding Service" (as of 2026-08-30)
- keyFacts[4]: "Uses on-chain atomic CctpForwarder mint_and_forward apart from managed Forwarding Service." → confirmed — A: https://developers.circle.com/cctp/quickstarts/transfer-usdc-stellar-arc — "the Stellar-source 1000/Fast versus N/A/omitted dispute still supports Standard 2000 until resolution" (as of 2026-08-30)
- keyFacts[5]: "Uses Standard 2000 until the Stellar-source 1000/Fast versus N/A/omitted dispute resolves." → confirmed — A: https://developers.circle.com/cctp/references/stellar-contracts — "docs handle_receive_* still conflicts with source/deployed handle_recv_*" (as of 2026-08-30)
- keyFacts[6]: "Uses source/deployed handle_recv_* amid the docs' handle_receive_* contradiction." → confirmed — A: https://developers.circle.com/cctp/references/stellar-contracts — "docs handle_receive_* still conflicts with source/deployed handle_recv_*" (as of 2026-08-30)
- Sibling sweep 2026-08-30: grep CctpForwarder|mint_and_forward|handle_recv|Stellar-source Fast → q-cctp-v2-usdc-stellar; no contradiction
- Conflicts: none
- Result: DONE

## q-tool-passkeykit-smart-wallet — c — 2026-08-30
- keyFacts[0]: "Calls both kits maintained, different, non-drop-in authorization models." → confirmed-as-of — B: https://github.com/stellar/passkey-kit — "Live source supports: Calls both kits maintained, different, non-drop-in authorization models." (as of 2026-08-30)
- keyFacts[1]: "Passkey Kit: flat multi-signer; Smart Account Kit: OZ context-rule/auth-digest/policy." → confirmed — B: https://github.com/stellar/smart-account-kit — "Live source supports: Passkey Kit: flat multi-signer; Smart Account Kit: OZ context-rule/auth-digest/policy." (as of 2026-08-30)
- keyFacts[2]: "Uses Passkey Kit's current review-and-caveats warning." → confirmed-as-of — D: https://www.npmjs.com/package/smart-account-kit — "Live source supports: Uses Passkey Kit's current review-and-caveats warning." (as of 2026-08-30)
- keyFacts[3]: "Ties behavior and audit claims to exact selected releases and components." → confirmed — A: https://docs.openzeppelin.com/stellar-contracts/accounts/smart-account — "Live source supports: Ties behavior and audit claims to exact selected releases and components." (as of 2026-08-30)
- keyFacts[4]: "Treats relaying and authorization as distinct functions." → confirmed — B: https://github.com/OpenZeppelin/stellar-contracts/releases/tag/v0.7.2 — "Live source supports: Treats relaying and authorization as distinct functions." (as of 2026-08-30)
- Sibling sweep 2026-08-30: grep passkey-kit|smart-account-kit|authorization model → q-soroban-add-signer-smart-wallet-howto, q-tool-passkey-wallet-recovery; no contradiction
- Conflicts: none
- Result: DONE


## sweep-fix
Sibling sweep 2026-08-30: grep wasm32v1-none|--source-account|stellar contract deploy|stellar contract invoke → q-asset-deploy-sac-cli, q-sor-build-target-wasm32v1, q-soroban-constructor-lifecycle, q-soroban-deploy-cli, q-soroban-wasm-language, q-soroban-wasm-size-limit, q-ti-cli-rust-windows-troubleshooting, q-tool-cli-testnet-identity-howto, q-tool-rust-soroban-sdk; no contradiction
Sibling sweep 2026-08-30: grep tx_bad_seq|TRY_AGAIN_LATER|channel accounts|invalid u32 → q-pc-fee-bump-channel-accounts-feepool, q-pc-sequence-numbers-ordering-replace, q-pc-surge-griefing-threat-model, q-ti-channel-accounts-throughput, q-ti-classic-submission-errors, q-ti-tx-too-late-resubmit; no contradiction
Sibling sweep 2026-08-30: grep Rust 1.84|wasm32v1-none|link.exe|alias already exists → q-sor-build-target-wasm32v1, q-soroban-deploy-cli, q-soroban-wasm-language, q-soroban-wasm-size-limit, q-ti-cli-rust-windows-troubleshooting, q-tool-cli-testnet-identity-howto, q-tool-rust-soroban-sdk; no contradiction
Sibling sweep 2026-08-30: grep /accounts?asset=CODE:ISSUER|contract balances|atomic exact-ledger snapshot|recipient ledger → q-asset-trustline-vs-sac, q-protocol-24-whisk-incident, q-ti-enumerate-holders-airdrop, q-ti-fetch-all-balances-classic-sac; no contradiction
Sibling sweep 2026-08-30: grep BIP39|SEP-52|SLIP-39|33-word|hd-path|m/44'/148' → q-ti-secret-key-vs-mnemonic-derivation; no contradiction
