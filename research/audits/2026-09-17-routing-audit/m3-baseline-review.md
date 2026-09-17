# M3-B1 baseline discovery review

- **Date:** 2026-09-17.
- **Mode:** read-only. No candidate results were read. No paid calls or repository edits.
- **Frozen labels:** not modified.
- **Per-ID machine-readable mapping:** `/tmp/raven-routing-audit-2026-09-17/paired-review/M3-B1-baseline-mapping.json`, SHA-256 `534879e5d58529c2b33af93e157a90db1a9eb5fd607389dff31879640003149b`.
- **Mapping builder:** `paired-review/build-m3-b1-mapping.mjs`.

## 1. Artifact and validity

- **Artifact:** `/tmp/raven-routing-audit-2026-09-17/repo/eval/discovery/results/2026-09-17T02-42-57-169Z-routing-audit-M3-B1-agent.json`, SHA-256 `ddc8d9b6b3df574865a5bbc3eec59c57a2346938cb4138969488649a00546f5e`.
- **Cases:** `/tmp/raven-routing-audit-2026-09-17/repo/eval/discovery/cases.json`, SHA-256 `a81df0b9a6867d3385f679ac353a981ea1fd6e494940cbde41cdcb441842e135` (repaired labels, frozen).
- **Comparability:** comparable true; complete true; rows 43; agent-failure rows 0.
- **Cost:** $4.7252672; missing costs 0.
- **Tuple:** model claude-sonnet-5, effort medium, max searches 3.
- **Pins:** agent binary matches true; environment matches true.
- **Every row:** raven connected true; search contracts valid true.
- **Verdict:** valid measurement.

## 2. Metric scope

- **familyHitAt3:** any search (max 3) has an expected-family hit in its top 3
- **usableOpAt5:** any search has an acceptableOps id in its top 5
- **primaryHit:** selected primaryService is an expected family (family-level; does not require an acceptable operation)
- **anyHit:** primary or an alternate is in an expected family
- **scope:** Target-family discovery metrics only. They do not measure answer quality, and a family hit does not imply the selected operation can answer correctly.

## 3. Summary (repaired labels)

| Scope | n | familyHit@3 | usableOp@5 | primaryHit | anyHit |
|---|---|---|---|---|---|
| overall | 43 | 39 | 38 | 36 | 42 |
| extended-strict-misses | 12 | 12 | 12 | 12 | 12 |
| issue-9-exemplars | 10 | 10 | 10 | 10 | 10 |
| lumenloop-agentic-misses | 8 | 4 | 3 | 4 | 7 |
| pr17-fold | 3 | 3 | 3 | 2 | 3 |
| round-844-real-user | 10 | 10 | 10 | 8 | 10 |

**Historical-label recomputation** (read-only, same rows): familyHit@3 39, usableOp@5 38, primaryHit 37. The only changed row is round844-q-ti-tx-too-late-resubmit (primaryHit true under historical skills family).

## 4. Miss rows (8)

### agentic-lumenloop-q-asset-rwa-tokenized-freshness

- **Pool:** lumenloop-agentic-misses.
- **Expected families:** lumenloop.
- **Acceptable operations:** `lumenloop.search_content_semantic`, `lumenloop.list_research`.
- **Metrics:** familyHit@3 false; usableOp@5 false; primaryHit false; anyHit false.
- **Selected:** `scout.analyzeEcosystem` (acceptable false).
- **Alternates:** `scout.searchProjects`, `scout.getStablecoins`, `scout.searchResearch`.
- **Search 1:** "tokenized real-world assets RWA value on Stellar" → skills.stellar-dev.assets[gated], skills.lumenloop.stellar-ecosystem-scout[gated], stellarDocs.search_asset_token_docs[backfill], scout.searchProjects[gated], skills.stellar-dev.cross-chain[gated], skills.lumenloop.stellar-integration-finder[backfill], stellarDocs.search_soroban_contract_docs[backfill], lumenloop.search_content_semantic[gated].
- **Search 2:** "stablecoin RWA market cap growth ecosystem stats" → scout.analyzeEcosystem[backfill], scout.getStablecoins[backfill].
- **Classification:** retrieval-rank + label-boundary.
- **Review:** The only acceptable LumenLoop operation (search_content_semantic) appeared at rank 8 of search 1; search 2 returned only Scout backfill. The agent chose scout.analyzeEcosystem for a current aggregate value, which is a defensible Scout reading of 'currently'. The frozen label is LumenLoop editorial only; this is the known LumenLoop/Scout boundary.

### agentic-lumenloop-q-defi-aquarius-what-is

- **Pool:** lumenloop-agentic-misses.
- **Expected families:** lumenloop.
- **Acceptable operations:** `lumenloop.get_project`, `lumenloop.search_directory`, `lumenloop.find_content_about_project`.
- **Metrics:** familyHit@3 true; usableOp@5 false; primaryHit true; anyHit true.
- **Selected:** `lumenloop.get_project` (acceptable true).
- **Alternates:** `lumenloop.find_content_about_project`, `lumenloop.find_content_by_entity`, `stellarDocs.search_asset_token_docs`.
- **Search 1:** "Aquarius AQUA token Stellar project" → skills.lumenloop.stellar-project-dossier[gated], scout.resolveProject[gated], skills.lumenloop.stellar-content-auditor[gated], skills.openzeppelin-stellar.setup-stellar-contracts[gated], stellarDocs.search_sdk_cli_tools_docs[gated], skills.lumenloop.stellar-ecosystem-scout[gated], stellarDocs.search_docs[gated], stellarDocs.search_docs_in_category[gated].
- **Search 2:** "AQUA token role liquidity incentives voting" → stellarDocs.search_asset_token_docs[backfill], stellarDocs.search_docs_in_category[backfill], lumenloop.find_content_by_entity[backfill], stellarDocs.search_docs[backfill], lumenloop.find_av_passages[backfill], lumenloop.get_project[backfill], lumenloop.search_content_semantic[backfill], lumenloop.search_documents[backfill].
- **Classification:** retrieval-rank only (selection correct).
- **Review:** The family was visible at rank 3 (lumenloop.find_content_by_entity, search 2), but no acceptable operation ranked in the top 5 (lumenloop.get_project was rank 6). The agent still selected lumenloop.get_project, which is acceptable.

### agentic-lumenloop-q-defi-rwa-overview

- **Pool:** lumenloop-agentic-misses.
- **Expected families:** lumenloop.
- **Acceptable operations:** `lumenloop.search_content_semantic`, `lumenloop.search_directory`.
- **Metrics:** familyHit@3 false; usableOp@5 false; primaryHit false; anyHit true.
- **Selected:** `scout.searchProjects` (acceptable false).
- **Alternates:** `lumenloop.search_directory`, `skills.lumenloop.stellar-ecosystem-scout`, `stellarDocs.search_asset_token_docs`.
- **Search 1:** "real-world assets RWA tokenization Stellar" → skills.stellar-dev.assets[gated], skills.lumenloop.stellar-ecosystem-scout[gated], stellarDocs.search_asset_token_docs[backfill], scout.searchProjects[gated], skills.stellar-dev.cross-chain[gated], skills.lumenloop.stellar-builder-quickstart[backfill], skills.lumenloop.stellar-integration-finder[backfill], stellarDocs.search_soroban_contract_docs[backfill].
- **Search 2:** "stablecoins and RWA projects directory" → scout.searchProjects[gated], scout.resolveProject[gated], scout.getClusters[gated].
- **Classification:** retrieval + label-boundary.
- **Review:** No LumenLoop operation appeared in either top-8 page (only LumenLoop skills, family skills). The agent chose scout.searchProjects (type RWA, status Live roster) and named lumenloop.search_directory as a backup it never saw ranked. The structured Scout roster is a defensible source; the frozen label is LumenLoop only.

### agentic-lumenloop-q-defi-soroswap-what-is

- **Pool:** lumenloop-agentic-misses.
- **Expected families:** lumenloop.
- **Acceptable operations:** `lumenloop.get_project`, `lumenloop.search_directory`, `lumenloop.find_content_about_project`.
- **Metrics:** familyHit@3 false; usableOp@5 false; primaryHit false; anyHit true.
- **Selected:** `scout.searchProjects` (acceptable false).
- **Alternates:** `stellarDocs.search_protocol_concepts_docs`, `lumenloop.search_content_semantic`, `stellarDocs.search_docs`.
- **Search 1:** "Soroswap Stellar DEX AMM" → skills.lumenloop.stellar-ecosystem-digest[gated], skills.lumenloop.stellar-ecosystem-scout[gated], stellarDocs.search_protocol_concepts_docs[gated], skills.lumenloop.stellar-content-auditor[gated], stellarDocs.search_doc_titles[gated], stellarDocs.get_doc_page_sections[gated], stellarDocs.search_docs_in_category[gated], scout.searchProjects[gated].
- **Search 2:** "Soroban decentralized exchange documentation" → stellarDocs.search_doc_titles[gated], stellarDocs.search_soroban_contract_docs[backfill], stellarDocs.get_doc_page_sections[backfill], stellarDocs.search_docs[backfill], stellarDocs.search_protocol_concepts_docs[gated], stellarDocs.search_asset_token_docs[backfill], stellarDocs.search_sdk_cli_tools_docs[backfill], stellarDocs.search_meeting_notes[backfill].
- **Classification:** retrieval + label-boundary; D3 WATCH.
- **Review:** Search 1 'Soroswap Stellar DEX AMM' top 8: LumenLoop skills, Docs, and scout.searchProjects at rank 8 (gated). Search 2 was Docs only. No LumenLoop operation was visible. The agent selected scout.searchProjects (not acceptable under the frozen LumenLoop-only label). D3 is expected to affect scout.searchProjects' position for Soroswap-style queries; compare the actual C1 query pages before attributing any selection change.

### agentic-lumenloop-q-eco-lobstr-wallet

- **Pool:** lumenloop-agentic-misses.
- **Expected families:** lumenloop.
- **Acceptable operations:** `lumenloop.get_project`, `lumenloop.search_directory`.
- **Metrics:** familyHit@3 false; usableOp@5 false; primaryHit false; anyHit true.
- **Selected:** `scout.searchProjects` (acceptable false).
- **Alternates:** `lumenloop.search_directory`, `skills.lumenloop.stellar-project-dossier`, `scout.getBuilders`.
- **Search 1:** "LOBSTR wallet project directory" → scout.searchProjects[gated], scout.resolveProject[backfill], scout.getClusters[gated].
- **Search 2:** "LOBSTR wallet builder team scale users" → stellarDocs.search_wallet_dapp_docs[backfill], skills.lumenloop.stellar-builder-quickstart[backfill], scout.getBuilders[backfill], scout.searchProjects[backfill], skills.lumenloop.stellar-integration-finder[backfill], skills.lumenloop.stellar-project-dossier[backfill], stellarDocs.search_docs[backfill], lumenloop.search_directory[backfill].
- **Classification:** agent choice + label-boundary.
- **Review:** Search 1 top hit was scout.searchProjects; search 2 had lumenloop.search_directory at rank 8 (backfill). The agent selected scout.searchProjects, citing builtBy, supportedNetworks, and scale fields, and listed lumenloop.search_directory as an alternate. anyHit is true through the alternate.

### round844-q-ti-tx-too-late-resubmit

- **Pool:** round-844-real-user.
- **Expected families:** stellarDocs.
- **Acceptable operations:** `stellarDocs.search_rpc_horizon_data_docs`, `stellarDocs.search_protocol_concepts_docs`.
- **Metrics:** familyHit@3 true; usableOp@5 true; primaryHit false; anyHit true.
- **Selected:** `skills.stellar-dev.dapp` (acceptable false).
- **Alternates:** `stellarDocs.search_protocol_concepts_docs`, `stellarDocs.search_rpc_horizon_data_docs`, `stellarDocs.search_docs`.
- **Search 1:** "tx_too_late timebounds sequence number resubmit transaction" → stellarDocs.search_sdk_cli_tools_docs[backfill], stellarDocs.search_rpc_horizon_data_docs[backfill], stellarDocs.search_protocol_concepts_docs[backfill], stellarDocs.search_soroban_contract_docs[backfill], stellarDocs.search_docs[backfill], stellarDocs.search_docs_in_category[backfill], stellarDocs.search_asset_token_docs[backfill], stellarDocs.get_doc_page_sections[backfill].
- **Search 2:** "update transaction sequence number and time bounds before resubmitting" → skills.lumenloop.scf-submission-radar[backfill], skills.stellar-dev.dapp[backfill], skills.stellar-light.stellar-scout[backfill], skills.stellar-dev.data[backfill].
- **Classification:** label-repair effect + agent over-trust of skill description.
- **Review:** The family (Docs) was visible at ranks 1-3 and acceptable operations at ranks 2-3. The agent selected skills.stellar-dev.dapp. Under the historical labels (families stellarDocs,skills) this row was a primary hit. The 2026-09-17 repair removed the skills family because the pinned dapp body lacks timebounds, sequence-refresh, and resubmission guidance. So this primary miss is caused by the label repair, and the selection itself does not reach the authority.

### round844-q-defi-bridge-evm-to-stellar-axelar

- **Pool:** round-844-real-user.
- **Expected families:** scout, lumenloop, stellarDocs.
- **Acceptable operations:** `scout.searchProjects`, `scout.searchResearch`, `lumenloop.search_content_semantic`, `stellarDocs.search_asset_token_docs`.
- **Metrics:** familyHit@3 true; usableOp@5 true; primaryHit false; anyHit true.
- **Selected:** `skills.stellar-dev.cross-chain` (acceptable false).
- **Alternates:** `scout.listAudits`, `skills.stellar-light.stellar-scout`, `stellarDocs.search_asset_token_docs`.
- **Search 1:** "bridge USDC Ethereum to Stellar" → stellarDocs.search_asset_token_docs[gated], stellarDocs.search_protocol_concepts_docs[gated], skills.lumenloop.stellar-ecosystem-scout[gated], stellarDocs.get_doc_page_sections[gated], stellarDocs.search_doc_titles[gated], skills.stellar-dev.agentic-payments[gated], skills.stellar-dev.assets[gated], skills.stellar-dev.cross-chain[gated].
- **Search 2:** "Axelar security model Stellar bridge comparison audits" → scout.listAudits[gated], skills.stellar-light.stellar-scout[backfill], stellarDocs.search_docs_in_category[backfill], skills.lumenloop.stellar-ecosystem-digest[backfill], stellarDocs.search_sdk_cli_tools_docs[backfill], skills.lumenloop.stellar-builder-quickstart[backfill], skills.lumenloop.stellar-content-auditor[backfill], skills.lumenloop.stellar-ecosystem-scout[backfill].
- **Classification:** label gap candidate (do not modify frozen label).
- **Review:** Families scout/lumenloop/stellarDocs were visible (Docs rank 1). The agent selected skills.stellar-dev.cross-chain, whose description covers CCTP, Axelar, and LayerZero rail selection. Skills was never an expected family. A reviewer may consider a separate, evidence-based label review; frozen labels stay unchanged here.

### pr17-protocol-24-bare

- **Pool:** pr17-fold.
- **Expected families:** stellarDocs, lumenloop.
- **Acceptable operations:** `stellarDocs.search_protocol_concepts_docs`, `lumenloop.search_content_semantic`.
- **Metrics:** familyHit@3 true; usableOp@5 true; primaryHit false; anyHit true.
- **Selected:** `scout.searchResearch` (acceptable false).
- **Alternates:** `stellarDocs.search_meeting_notes`, `stellarDocs.search_docs`, `lumenloop.search_content_semantic`.
- **Search 1:** "Protocol 24 upgrade status mainnet" → skills.openzeppelin-stellar.upgrade-stellar-contracts[gated], scout.searchResearch[gated], stellarDocs.search_protocol_concepts_docs[backfill], scout.getStatus[backfill], stellarDocs.search_meeting_notes[gated], lumenloop.search_content_semantic[backfill], stellarDocs.search_docs[backfill], skills.stellar-dev.agentic-payments[backfill].
- **Search 2:** "protocol version release notes CAP" → stellarDocs.search_meeting_notes[gated], stellarDocs.search_protocol_concepts_docs[backfill], stellarDocs.search_docs[gated], stellarDocs.search_soroban_contract_docs[gated], stellarDocs.search_docs_in_category[backfill], stellarDocs.get_doc_page_sections[backfill], stellarDocs.search_asset_token_docs[backfill], stellarDocs.search_doc_titles[backfill].
- **Classification:** label gap candidate (do not modify frozen label).
- **Review:** Families were visible (Docs ranks 3, 5; LumenLoop rank 6). The agent selected scout.searchResearch for release notes (source=release). Scout was never an expected family for this case. Release notes are a plausible status authority; frozen labels stay unchanged here.

## 5. Family hit but operation not acceptable (diagnostic; not a runner metric)

- `ext-strict-miss-q-edge-metamask-evm-mental-model`: selected `stellarDocs.search_protocol_concepts_docs`; acceptable alternates `stellarDocs.search_wallet_dapp_docs`, `stellarDocs.search_asset_token_docs`.
- `ext-strict-miss-q-pc-practical-fee-setting`: selected `stellarDocs.search_docs_in_category`; acceptable alternates `stellarDocs.search_rpc_horizon_data_docs`, `stellarDocs.search_protocol_concepts_docs`.
- `issue-9-cap-46-6-token-standard`: selected `skills.stellar-dev.standards`; acceptable alternates `stellarDocs.search_asset_token_docs`.
- `issue-9-erc3643-rwa-stack`: selected `scout.searchRepos`; acceptable alternates `lumenloop.search_directory`, `scout.searchResearch`.
- `agentic-lumenloop-q-edge-fresh-latest-blend-tvl`: selected `scout.getLeaderboard`; acceptable alternates `scout.analyzeEcosystem`, `scout.searchResearch`, `lumenloop.search_content_semantic`.
- `round844-q-ti-testnet-usdc-faucet`: selected `stellarDocs.search_anchor_sep_docs`; acceptable alternates `stellarDocs.search_asset_token_docs`.
- `round844-q-ti-openzeppelin-relayer`: selected `stellarDocs.search_sdk_cli_tools_docs`; acceptable alternates `stellarDocs.search_docs`, `lumenloop.search_content_semantic`.

## 6. Per-ID baseline table (all 43)

| ID | Pool | F@3 | U@5 | Primary | Any | Selected (acceptable?) | Searches | Cost |
|---|---|---|---|---|---|---|---|---|
| `ext-strict-miss-q-crp-export-tx-history-taxes` | extended-strict-misses | ✓ | ✓ | ✓ | ✓ | `stellarDocs.search_rpc_horizon_data_docs` (yes) | 2 | $0.2408 |
| `ext-strict-miss-q-crp-regional-offramp-mobilemoney` | extended-strict-misses | ✓ | ✓ | ✓ | ✓ | `scout.getPartners` (yes) | 2 | $0.1175 |
| `ext-strict-miss-q-defi-build-staking-for-own-token` | extended-strict-misses | ✓ | ✓ | ✓ | ✓ | `skills.stellar-dev.smart-contracts` (yes) | 2 | $0.0910 |
| `ext-strict-miss-q-defi-sdex-offer-lifecycle` | extended-strict-misses | ✓ | ✓ | ✓ | ✓ | `stellarDocs.search_rpc_horizon_data_docs` (yes) | 2 | $0.1061 |
| `ext-strict-miss-q-edge-exchange-memo-lost-funds` | extended-strict-misses | ✓ | ✓ | ✓ | ✓ | `stellarDocs.search_docs` (yes) | 2 | $0.1256 |
| `ext-strict-miss-q-edge-metamask-evm-mental-model` | extended-strict-misses | ✓ | ✓ | ✓ | ✓ | `stellarDocs.search_protocol_concepts_docs` (no) | 2 | $0.1349 |
| `ext-strict-miss-q-pc-account-merge-reclaim-reserve` | extended-strict-misses | ✓ | ✓ | ✓ | ✓ | `stellarDocs.search_docs` (yes) | 1 | $0.0642 |
| `ext-strict-miss-q-pc-practical-fee-setting` | extended-strict-misses | ✓ | ✓ | ✓ | ✓ | `stellarDocs.search_docs_in_category` (no) | 2 | $0.1109 |
| `ext-strict-miss-q-pc-sequence-numbers-ordering-replace` | extended-strict-misses | ✓ | ✓ | ✓ | ✓ | `stellarDocs.search_protocol_concepts_docs` (yes) | 2 | $0.1200 |
| `ext-strict-miss-q-pc-surge-griefing-threat-model` | extended-strict-misses | ✓ | ✓ | ✓ | ✓ | `stellarDocs.search_protocol_concepts_docs` (yes) | 2 | $0.1088 |
| `ext-strict-miss-q-sor-msg-sender-equivalent` | extended-strict-misses | ✓ | ✓ | ✓ | ✓ | `stellarDocs.search_soroban_contract_docs` (yes) | 1 | $0.0600 |
| `ext-strict-miss-q-ti-friendbot-ratelimit-alternatives` | extended-strict-misses | ✓ | ✓ | ✓ | ✓ | `stellarDocs.search_docs` (yes) | 2 | $0.1079 |
| `issue-9-protocol-zipper-landed` | issue-9-exemplars | ✓ | ✓ | ✓ | ✓ | `scout.searchResearch` (yes) | 2 | $0.1153 |
| `issue-9-cap-62-implemented` | issue-9-exemplars | ✓ | ✓ | ✓ | ✓ | `scout.searchResearch` (yes) | 2 | $0.1307 |
| `issue-9-passkey-smart-wallet-recommendation` | issue-9-exemplars | ✓ | ✓ | ✓ | ✓ | `stellarDocs.search_wallet_dapp_docs` (yes) | 2 | $0.1057 |
| `issue-9-soroswap-feature-status` | issue-9-exemplars | ✓ | ✓ | ✓ | ✓ | `scout.searchProjects` (yes) | 2 | $0.0981 |
| `issue-9-x402-facilitator-status` | issue-9-exemplars | ✓ | ✓ | ✓ | ✓ | `scout.searchProjects` (yes) | 2 | $0.0973 |
| `issue-9-bn254-poseidon-status` | issue-9-exemplars | ✓ | ✓ | ✓ | ✓ | `skills.stellar-dev.zk-proofs` (yes) | 2 | $0.1136 |
| `issue-9-cap-46-6-token-standard` | issue-9-exemplars | ✓ | ✓ | ✓ | ✓ | `skills.stellar-dev.standards` (no) | 1 | $0.0758 |
| `issue-9-protocol-23-mainnet-status` | issue-9-exemplars | ✓ | ✓ | ✓ | ✓ | `scout.searchResearch` (yes) | 2 | $0.1062 |
| `issue-9-horizon-vs-rpc-latest` | issue-9-exemplars | ✓ | ✓ | ✓ | ✓ | `stellarDocs.search_rpc_horizon_data_docs` (yes) | 2 | $0.1014 |
| `issue-9-erc3643-rwa-stack` | issue-9-exemplars | ✓ | ✓ | ✓ | ✓ | `scout.searchRepos` (no) | 2 | $0.1247 |
| `agentic-lumenloop-q-asset-rwa-tokenized-freshness` | lumenloop-agentic-misses | ✗ | ✗ | ✗ | ✗ | `scout.analyzeEcosystem` (no) | 2 | $0.1042 |
| `agentic-lumenloop-q-defi-aquarius-what-is` | lumenloop-agentic-misses | ✓ | ✗ | ✓ | ✓ | `lumenloop.get_project` (yes) | 2 | $0.1181 |
| `agentic-lumenloop-q-defi-comet-content` | lumenloop-agentic-misses | ✓ | ✓ | ✓ | ✓ | `lumenloop.search_content_semantic` (yes) | 2 | $0.1238 |
| `agentic-lumenloop-q-defi-phoenix-scf` | lumenloop-agentic-misses | ✓ | ✓ | ✓ | ✓ | `lumenloop.get_scf_submissions` (yes) | 2 | $0.1090 |
| `agentic-lumenloop-q-defi-rwa-overview` | lumenloop-agentic-misses | ✗ | ✗ | ✗ | ✓ | `scout.searchProjects` (no) | 2 | $0.0973 |
| `agentic-lumenloop-q-defi-soroswap-what-is` | lumenloop-agentic-misses | ✗ | ✗ | ✗ | ✓ | `scout.searchProjects` (no) | 2 | $0.1095 |
| `agentic-lumenloop-q-eco-lobstr-wallet` | lumenloop-agentic-misses | ✗ | ✗ | ✗ | ✓ | `scout.searchProjects` (no) | 2 | $0.1093 |
| `agentic-lumenloop-q-edge-fresh-latest-blend-tvl` | lumenloop-agentic-misses | ✓ | ✓ | ✓ | ✓ | `scout.getLeaderboard` (no) | 2 | $0.1215 |
| `round844-q-ti-channel-accounts-throughput` | round-844-real-user | ✓ | ✓ | ✓ | ✓ | `stellarDocs.search_rpc_horizon_data_docs` (yes) | 2 | $0.1285 |
| `round844-q-ti-classic-submission-errors` | round-844-real-user | ✓ | ✓ | ✓ | ✓ | `stellarDocs.search_rpc_horizon_data_docs` (yes) | 2 | $0.1310 |
| `round844-q-ti-tx-too-late-resubmit` | round-844-real-user | ✓ | ✓ | ✗ | ✓ | `skills.stellar-dev.dapp` (no) | 2 | $0.0905 |
| `round844-q-tool-cli-skills-discovery` | round-844-real-user | ✓ | ✓ | ✓ | ✓ | `scout.listSkills` (yes) | 2 | $0.0986 |
| `round844-q-tool-mcp-servers-skills-discovery` | round-844-real-user | ✓ | ✓ | ✓ | ✓ | `scout.listSkills` (yes) | 2 | $0.1064 |
| `round844-q-defi-bridge-evm-to-stellar-axelar` | round-844-real-user | ✓ | ✓ | ✗ | ✓ | `skills.stellar-dev.cross-chain` (no) | 2 | $0.0956 |
| `round844-q-sor-native-xlm-sac-address` | round-844-real-user | ✓ | ✓ | ✓ | ✓ | `skills.stellar-dev.assets` (yes) | 2 | $0.1025 |
| `round844-q-ti-testnet-usdc-faucet` | round-844-real-user | ✓ | ✓ | ✓ | ✓ | `stellarDocs.search_anchor_sep_docs` (no) | 2 | $0.1090 |
| `round844-q-ti-openzeppelin-relayer` | round-844-real-user | ✓ | ✓ | ✓ | ✓ | `stellarDocs.search_sdk_cli_tools_docs` (no) | 2 | $0.1161 |
| `round844-q-ti-secret-key-vs-mnemonic-derivation` | round-844-real-user | ✓ | ✓ | ✓ | ✓ | `stellarDocs.search_sdk_cli_tools_docs` (yes) | 2 | $0.1174 |
| `pr17-protocol-24-bare` | pr17-fold | ✓ | ✓ | ✗ | ✓ | `scout.searchResearch` (no) | 2 | $0.1131 |
| `pr17-ap2-acp` | pr17-fold | ✓ | ✓ | ✓ | ✓ | `skills.stellar-dev.agentic-payments` (yes) | 2 | $0.1111 |
| `pr17-rpc-gettransactions` | pr17-fold | ✓ | ✓ | ✓ | ✓ | `stellarDocs.search_rpc_horizon_data_docs` (yes) | 1 | $0.0563 |

Each row's query texts and top-8 hit lists are in the JSON mapping under `rows[].searches`.

## 7. Rules for the pending C1 comparison

1. Pair C1 rows with B1 rows by id. One run per arm: report per-ID transitions only; no within-arm variance or aggregate claim.
2. A C1 metric change is diagnostic. It is D3-attributable only if the actual C1 query page differs in ranking relevant to the change; compare the top-8 lists of the agent's real queries, not only the case question.
3. Answer quality is out of scope for M3; a family or operation hit is not evidence of a correct answer.
4. Do not modify frozen labels. Label-gap candidates stay recorded as notes.
5. Row validity: invalid only for completeness, comparability, or transport failures (agent error, search contract invalid, raven not connected).

## 8. Notes

- **Soroswap (D3 watch):** in B1 the agent's query "Soroswap Stellar DEX AMM" showed `scout.searchProjects` at rank 8 (gated). The agent selected it despite the LumenLoop-only label. D3 may change that operation's position for Soroswap-style queries. C1 attribution must compare the actual C1 query pages.
- **Label gaps:** `round844-q-defi-bridge-evm-to-stellar-axelar` and `pr17-protocol-24-bare` are label-gap candidates only. Any label change needs a separate, evidence-based review.
- **Label-repair effect:** the `round844-q-ti-tx-too-late-resubmit` primary miss comes from the 2026-09-17 label repair, not from a routing change.
