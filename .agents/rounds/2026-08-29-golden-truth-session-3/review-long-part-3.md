# Review part 3 — long-fact batch, chunks 34–50 (Grok)

Date: 2026-08-29
Lane: read-only. Wrote only this file. Did not edit cases. Formed a view from `git diff origin/main` per case, then read the sol-a/b/c matrices.

Scope: 68 cases. Authors: gt3-sol-a/b/c. Long-fact form rewrites do not edit answer, notes, avoid, asOf, corroboration, or source arrays except two later conflict-lane overlays (`q-sep-wallet-seps-list`, `q-zk-host-functions-status`). Dead Fable paths were replaced where they existed. No remaining >90-char keyFacts.

Spot-check: fetched the first HTTP live re-check URL on each rewritten case (2026-08-29). Most returned 200. The exception is in the FAIL row.

## Table

| id | PASS/FAIL | finding |
|---|---|---|
| q-scf-pitch-prep-live | PASS | Split round.source vs awards fallback. Deterministic angles remain in the answer. scf-pitch.ts 200. |
| q-scf-rfps-hackathons-live | PASS | Split ok-empty vs soft-empty/error. tools.ts 200. |
| q-scf-skill-stellar-scout | PASS | Coverage-limits wording kept. Pinned SKILL.md 200. |
| q-scf-skill-submission-radar | PASS | Split search vs funded vs brief. `natural-language` already in the old answer. Radar SKILL.md 200. |
| q-scf-total-distributed | PASS | Shortened authoring fact. Communityfund awards 200. Dead Fable path replaced. |
| q-scf-verified-members | PASS | Shortened authoring fact. Verified-members handbook 200. Dead Fable path replaced. |
| q-scout-hackathon-brief-first-hour | PASS | Rails/RFP/verdict boundary kept. Hackathon-brief API 200. |
| q-sep-1-toml | PASS | Stellar Info File remains in the answer. SEP-0001 200. |
| q-sep-31-cross-border | PASS | Split sending/receiving vs SEP-24. Anchor-to-anchor remains. SEP-0031 200. |
| q-sep-41-token-interface | PASS | Draft transfer/allowance qualification kept. SEP-0041 200. Dead Fable path replaced. |
| q-sep-43-web-wallet-api | PASS | Method list and dapps-integrate-once remain in the answer; unpublished remains in avoid. SEP-0043 200. |
| q-sep-45-contract-auth | PASS | Split C-account analog of SEP-10. SEP-0045 200. |
| q-sep-6-24-deprecation | PASS | Interactive deprecation vs programmatic API kept. SEP-0006 200. |
| q-sep-6-vs-31-misnumber-trap | PASS | NOT hosted-UI remains in avoid. SEP-0031 200. |
| q-sep-8-regulated-assets | PASS | Split approval_server vs POST. SEP-0008 200. |
| q-sep-catalog-list | PASS | Split SEP-12/24 vs SEP-6. Ecosystem proposals 200. |
| q-sep-interactive-deposit-withdraw | PASS | Webview remains in the answer. SEP-0024 200. |
| q-sep-wallet-seps-list | PASS | Long-fact split keeps SEP-24 and/or SEP-6 in the answer. Conflict-lane overlay drops the false Wallet SDK SEP-31 wrap and adds a concrete avoid. SEP-0010 200. |
| q-smart-account-scoped-policy-signers | PASS | Scope vs full-control vs unrestricted signers kept. Advanced-patterns 200. |
| q-sor-deploy-invoke-from-js-sdk | PASS | Split deploy vs assembleTransaction/prepareTransaction. Install-deploy guide 200. |
| q-sor-doc-page-sections-followup | PASS | Snippet-is-not-the-page remains in avoid. stellar-docs.json 200. |
| q-sor-evm-to-soroban-porting | PASS | Split simulation, resources/TTL, Solang pre-alpha. Simulation guide 200. |
| q-sor-persistent-unbounded-collection-cap | PASS | Split exceed-limit vs bound vs split keys. Storage-strategies 200. |
| q-sor-sac-introspection | PASS | Split name, no issuer method, mutable admin. SAC docs 200. |
| q-sor-sep41-transfer-vs-transferfrom | PASS | Split MuxedAddress/from vs Address/spender. SAC source 200. |
| q-sor-skill-openzeppelin-setup | PASS | Split toolchain vs deps/imports. OZ SKILL.md 200. |
| q-soroban-add-signer-smart-wallet-howto | PASS | Split sibling kits vs model-based choice. passkey-kit 200. |
| q-soroban-auth-recursion-dos-audit | PASS | Split Critical/Investigated vs zero-Critical summaries. Veridise PDF 200. |
| q-soroban-check-auth-custom-account | PASS | Split contract checks vs host nonce/expiry/replay. Complex-account 200. |
| q-soroban-cli-bindings | PASS | Split TS vs Rust vs placeholder. CLI v27.0.0 200. |
| q-soroban-constructor-lifecycle | PASS | Split `__constructor` vs once-at-deploy. CAP-0058 200. |
| q-soroban-contract-build-verification | PASS | Split SEP-55/58, metadata, tooling. Workflow names remain in the answer. SEP-0055 200. |
| q-soroban-contract-id-derivation | PASS | Network ID already in the old answer. C-strkey remains there. Stellar-transaction guide 200. |
| q-soroban-event-indexing-design | PASS | Split SEP-41 vs SAC/CAP-67 vs path metadata. SEP-0041 200. |
| q-soroban-fuzz-testing | PASS | Split of proptest vs cargo-fuzz is claim-preserving. Prevalence tail stays in avoid. Presentation keyFact was deleted. Fuzzing example 200. |
| q-soroban-greenfield-escrow-prior-art-preflight | PASS | Pitfalls/failure modes, skeleton, and invariants remain in the answer. Trustless-Work repo 200. |
| q-soroban-no-std-constraints | PASS | Split alloc vs ledger time vs Env::prng. SDK alloc module 200. |
| q-soroban-oracle-defensive-consumption | PASS | NAV, baselines, isolation, rate limits, monitoring remain in the answer. Blend oracle docs 200. |
| q-soroban-oz-token | PASS | KeyFact flattened “includes”, but the answer still separates token extensions from pause/upgrade/access modules. OZ docs 200. |
| q-soroban-publish-events | PASS | Split contract vs diagnostic vs getEvents vs retention. SDK env.rs 200. |
| q-soroban-reentrancy | PASS | Split public-call rule, classic block, internal modes, composition. Host frame.rs 200. |
| q-soroban-simulate-resource-fee | PASS | `stellar tx simulate` remains in the answer. simulateTransaction 200. |
| q-soroban-storage-migration | PASS | Lazy vs explicit entrypoint kept. Migrate-storage 200. |
| q-soroban-upgradeable-storage-compat | PASS | Split compatible keys, strand/mis-decode, update_current_contract_wasm, retained address/storage. Migrate-storage 200. |
| q-stellar-recurring-payments | PASS | Split no standing order vs user/service controls. Advanced-patterns 200. |
| q-ti-classic-submission-errors | PASS | `op_bad_auth` remains in the answer. Accounts page 200. |
| q-ti-connect-wallet-button-code | PASS | Secrets/seed stay out of the client; avoid forbids handling a secret. Freighter connecting 200. |
| q-ti-explain-repo-payload-status | PASS | Split explainRepo vs optional owner/repo. Manifest 200. |
| q-ti-fetch-all-balances-classic-sac | PASS | Identity/decimals/source/network/snapshot remain in answer/avoid. Hubble guide 200. |
| q-ti-find-export-secret-key | PASS | Nondisclosure and imported-key bounds remain in avoid. CLI stellar-keys 200. |
| q-ti-scout-refresh-cached-rows | PASS | Empty-is-not-absence remains in avoid. getChanges 200. |
| q-ti-skill-builder-quickstart | PASS | Split prior-art vs build plan. Quickstart SKILL.md 200. |
| q-ti-skill-integration-finder | PASS | Capability-first discovery kept. Integration-finder SKILL.md 200. |
| q-ti-vocab-regions-live | FAIL | Form kept. HTTP live URL `https://mcp.lumenloop.com` returned 400 (`Missing session ID`) and does not show region values. A later evidence note names the working catalog URL but does not replace the Live re-check line. No keyFact change. Replace that live URL with `https://api.lumenloop.com/v1/tools/get_regions` (class B catalog line may stay). |
| q-token-circle-usdc-on-stellar | PASS | Split issuer, CCTP dates, jurisdiction. Circle Stellar USDC 200. |
| q-tool-cli-testnet-identity-howto | PASS | Exact generate command kept. stellar-cli 200. |
| q-tool-indexer-repos-discovery | PASS | Data-lake/Galexie and no-frozen-roster remain in answer/avoid. ledger-data-indexer 200. |
| q-tool-js-sdk-package | PASS | Split Horizon/RPC vs tx/XDR. js-stellar-sdk README 200. |
| q-tool-passkey-repo-live | PASS | codeVerified/deployability remain in the answer. Manifest 200. |
| q-tool-skill-detail-install | PASS | Invented-command and community-skill traps remain in avoid. stellar-dev-skill 200. |
| q-tool-wallets-comparison | PASS | Kit/hardware/WalletConnect and uncertified roster kept. Wallet overview 200. |
| q-tool-which-sdk-comparison | PASS | Security/SLA/audience bounds remain in avoid. SDK index 200. |
| q-x402-payment-verification | PASS | Horizon operation-list insufficiency remains in the answer. x402 Stellar mechanism 200. |
| q-zk-circuit-setup | PASS | On-chain/Soroban verifier remains in the answer. ZK page 200. |
| q-zk-host-functions-status | PASS | Long-fact worker left the 136-char `Final` fact on CONFLICT (correct). Conflict-lane overlay now stamps 2026-08-29, sets status Implemented, and keeps BN254 MSM / scalar arithmetic / curve-membership in the answer. Live CAP-0080 header is `Status: Implemented`, Protocol 26. |
| q-zk-nullifier-storage | PASS | Unbounded instance map remains in avoid. Storage guide 200. |
| q-zk-poseidon-input-encoding | PASS | Split field vs mapping vs params vs canonical reduction. CAP-0075 200. |
| q-zk-verification-resource-budget | PASS | Pure-Wasm contrast remains in the answer. Fees page 200. |

## Counts

- PASS: 67
- FAIL: 1
- Conflict leftover later resolved in-file: q-zk-host-functions-status

## VERDICT: APPROVE-WITH-FIXES

Apply the FAIL row: replace the get_regions live URL on `q-ti-vocab-regions-live`.
