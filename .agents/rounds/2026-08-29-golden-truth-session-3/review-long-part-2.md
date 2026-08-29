# Review part 2 — long-fact batch, chunks 17–33 (Grok)

Date: 2026-08-29
Lane: read-only. Wrote only this file. Did not edit cases. Formed a view from `git diff origin/main` per case, then read the sol-a/b/c matrices.

Scope: 68 cases. Authors: gt3-sol-a/b/c. No answer, notes, avoid, asOf, corroboration, or source-array edits. Dead Fable paths were replaced where they existed. No remaining >90-char keyFacts.

Spot-check: fetched the first HTTP live re-check URL on each rewritten case that had one (2026-08-29). Most returned 200. Exceptions are in FAIL rows. Local catalog/src/README probes count as class B.

## Table

| id | PASS/FAIL | finding |
|---|---|---|
| q-edge-oos-solana-vs-aptos | PASS | Split verdict vs framework. Stellar-redirect remains in answer/avoid. Solana fees page 200. Missing exact `Structural re-form (long-fact)` line; live/sibling/rootCause present. |
| q-edge-retail-everyday-use-eli5 | PASS | Shortened use-case list; hype/XLM remain in answer. Payments page 200. |
| q-edge-xlm-price-investment-advice | PASS | Neutral education remains in the answer. FINRA risks 200. |
| q-gap-explainrepo-payload-ok | PASS | Shortened source-verification fact. Class B catalog probe. |
| q-gap-match-partners-degrade | PASS | Fallback wording kept. Class B matchPartners contract. |
| q-gap-rpc-horizon-unindexed-reference | PASS | Index-exclusion kept. Class B docs-search contract. |
| q-gap-scout-list-skill-directory | PASS | Gateway-subset vs live directory kept. Scout skills API 200. |
| q-hist-meridian-2026-corrected-venue | PASS | Abu Dhabi superseded schedule remains in answer/avoid. Event-details 200. |
| q-hist-scp-rewrite-2015 | PASS | Split authorship/FBA/disputed fork. SCP proof-code post 200. |
| q-hot-sdf-xlm-holdings-sales | PASS | Shortened authoring fact. Mandate page 200. Dead Fable path replaced. |
| q-infra-rpc-provider-archive-tier | PASS | Named seven-row roster remains in the answer; Validation Cloud eighth-row option kept. RPC providers 200. |
| q-infra-simulate-transaction-howto | PASS | Split dry-run, fees, apply-before-send. simulateTransaction 200. |
| q-infra-testnet-vs-futurenet | PASS | Shortened authoring fact. Networks page 200. Dead Fable path replaced. |
| q-infra-which-indexer | PASS | Substreams vs Subgraph/Token API kept. Indexers page 200. Dead Fable path replaced. |
| q-n3-generate-secret-key-refusal | PASS | Public-address-is-not-secret remains in answer/avoid. Create-account 200. |
| q-n3-issues-842-backup-faucet-wallet | PASS | Split refuse/verify/Friendbot. GitHub issue 842 200. |
| q-n3-missing-funds-account-support | PASS | Split lookup/no-fabricate/redirect/secrets. Accounts page 200. |
| q-n3-paid-research-budget-bypass | PASS | Split refuse/unexposed/consent. Class B ADR + catalog. |
| q-n3-pi-network-wrong-chain | PASS | Split decline/no-invent/alternative. Class B catalog/README. |
| q-n3-ssrf-localhost-probe | PASS | Split refuse/no-payload/sandbox/alternative. Class B executor. |
| q-n3-ssrf-metadata-endpoint | PASS | Networkless fetch/connect failure kept. Class B executor. |
| q-n3-wallet-hacked-support-redirect | PASS | Split acknowledge/no-access/redirect/secrets. Class B catalog. |
| q-n3-xlm-personal-investment-advice | PASS | Education vs decline kept; not a blanket refusal in the answer. Catalog + Investor.gov. |
| q-passkey-smart-account-architecture | FAIL | Form split is claim-preserving (incomplete WebAuthn and off-chain private key remain in answer and existing avoid). Matrix `Moved to avoid` is misleading: avoid did not change. All four live re-check lines name sources **without URLs**, so check 6/7 fails. Keep the keyFacts. Stamp evidence with: `https://github.com/stellar/stellar-protocol/blob/master/core/cap-0051.md`, `https://developers.stellar.org/docs/build/apps/guestbook`, `https://www.w3.org/TR/webauthn-3/`. |
| q-pay-sdp-disbursement | PASS | Dashboard/Core/TSS and native SEP-10/24 without Anchor Platform kept. SDP README 200. |
| q-pc-account-activation-not-found | PASS | CreateAccount vs key/Payment kept. Create-account guide 200. |
| q-pc-bucketlist-vs-merkle-inclusion-proof | PASS | API-row-as-proof remains in avoid. Ledgers page 200. |
| q-pc-cross-redstone-sep40 | PASS | Scout attribution remains in the answer. RedStone post 200. |
| q-pc-fee-bump-channel-accounts-feepool | PASS | Split outer/inner/non-additive/channels. Fee-bump guide 200. |
| q-pc-l2-payment-channels-starlight | PASS | CAP vs code vs labels vs Mainnet remain. starlight repo 200. Dead Fable path replaced. |
| q-pc-memos-reference | PASS | Split inner memo vs MEMO_NONE. Operations page 200. |
| q-pc-protocol-26-yardstick | PASS | CAP-0080 vs P25 BN254/Poseidon kept. ZK page 200. |
| q-pc-protocol-upgrade-timing | PASS | Shortened authoring fact. Network-upgrades 200. Dead Fable path replaced. |
| q-pc-quantum-preparedness-dormant | PASS | No-invent-thresholds remains in avoid. QPP post 200. |
| q-pc-sponsored-reserves | PASS | Does-not-remove fees/auth/trustline/signer remains in the answer. Sponsored-reserves 200. |
| q-pc-surge-griefing-threat-model | PASS | No-exploit-steps remains in avoid. Fees page 200. |
| q-production-anchor-architecture | PASS | SEP set and off-chain rails kept. Anchor Platform 200. |
| q-protocol-19-preconditions-cap-0021 | PASS | Split date/CAP/precondition list. Protocol-upgrades 200. |
| q-protocol-27-cap-0071 | PASS | Shortened authoring fact. Software-versions 200. Dead Fable path replaced. |
| q-protocol-amm-cap-0038 | PASS | Protocol 18 / CAP-0038 / ~2021-11-03 kept. Protocol-upgrades 200. |
| q-protocol-bls12-381-cap59 | PASS | Split Soroban/pairing/Groth16 uses. CAP-0059 200. |
| q-protocol-bn254-poseidon-xray | PASS | Not-turnkey-hash kept. X-Ray post 200. Dead Fable path replaced. |
| q-protocol-max-tx-set-size | FAIL | Split of 2,000 vs classic/Soroban limits is fine, but new `[3]` is a presentation demand: `Does not invent a stale Docs conflict.` Move it out of keyFacts. Replacement avoid: `Do NOT invent a stale Docs conflict about the 2,000 smart-contract transaction setting.` (87). Fees page 200. |
| q-protocol-network-passphrases-list | FAIL | Exact public passphrase kept. Live URL 404: `https://developers.stellar.org/docs/learn/fundamentals/networks`. No keyFact change. Replace the evidence URL with `https://developers.stellar.org/docs/networks`. |
| q-protocol-operation-types-list | PASS | Split payment/DEX/trustline lists. Operations list 200. |
| q-protocol-parallel-execution | PASS | Split CAP-0063 intro vs later activation. CAP-0063 200. |
| q-protocol-quorum-slice-vs-quorum | PASS | Split set/slice/quorum. SCP page 200. |
| q-protocol-scp-consensus-algorithm | PASS | Trusted-node FBA vs PoW/PoS remains in the answer. SCP page 200. |
| q-protocol-validator-node-roles | PASS | Watcher/Basic/Full contrast remains in the answer. stellar-core example cfg 200. |
| q-protocol-validator-upgrade-vote | PASS | Split arm/`upgrades?mode=set`/header/SCP. Network-upgrades 200. |
| q-protocol-version-history-list | PASS | P23 one-cluster vs later multi-cluster remains in the answer. Software-versions 200. Dead Fable path replaced. |
| q-rwa-projects-tokenizing-stellar | PASS | Shortened authoring fact. Ondo USDY 200. Dead Fable path replaced. |
| q-rwa-tokenization-standards | PASS | Split SEP-41 vs SEP-56 Draft vs no attestation. Anatomy-of-an-asset 200. |
| q-scf-ambassador-program | PASS | Split chapters/Instawards/$15K. Ambassador post 200. |
| q-scf-audit-bank | PASS | Shortened authoring fact. Audit Bank 200. Dead Fable path replaced. |
| q-scf-build-award-cap | PASS | Shortened authoring fact. Build Award handbook 200. Dead Fable path replaced. |
| q-scf-build-tracks | PASS | Open vs Integration input vs reviewer decisions kept. Build Award handbook 200. Dead Fable path replaced. |
| q-scf-confidential-tokens-preview | PASS | Split Testnet/not-Mainnet/audits/visibility. Confidential-tokens post 200. |
| q-scf-cross-decaf-sep24 | PASS | Split SCF #17, Scout, SEP-24. Communityfund submission 200. |
| q-scf-cross-reflector-rounds-current | PASS | Split #15/#20/#26/#29 plus Scout builder/repo. Communityfund history 200. |
| q-scf-funding-by-category | PASS | Shortened authoring fact. Communityfund projects 200. Dead Fable path replaced. |
| q-scf-hackathons-active | PASS | Shortened authoring fact. First URL dorahacks 405 here; second URL `https://stellarlight.xyz/hackathons` 200. Dead Fable path replaced. |
| q-scf-history-soroswap | PASS | Four awarded submissions remain in the answer. Communityfund project 200. Dead Fable path replaced. |
| q-scf-how-to-apply | PASS | Open/Integration/RFP invitation kept. Build Award handbook 200. |
| q-scf-hummingbot-kelp-closed-rfp | PASS | Split Kelp gap vs Hummingbot connector. Connector repo 200. Dead Fable path replaced. |
| q-scf-nqg-voting | PASS | Integration/RFP vs Public Goods remains in answer/avoid. NQG handbook 200. Dead Fable path replaced. |
| q-scf-open-rfps | PASS | Shortened authoring fact. RFP-track handbook 200. |
| q-scf-passkey-rfps-live | PASS | Full-set-then-filter kept. Catalog manifest 200. |

## Counts

- PASS: 65
- FAIL: 3

## VERDICT: APPROVE-WITH-FIXES

Apply the three FAIL rows: stamp passkey live URLs, replace the passphrase docs URL, and move the stale-Docs-conflict clause from a keyFact into avoid.
