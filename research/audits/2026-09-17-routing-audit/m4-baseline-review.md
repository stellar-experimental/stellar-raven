# SEALED — M4-B1 fresh-challenge discovery baseline review

> **Do not share per-case content with the implementation agent (route-audit-code).**

- **Date:** 2026-09-17.
- **Mode:** read-only. No candidate results were read. No paid calls or repository edits.
- **Frozen labels:** not modified.
- **Per-ID mapping:** `/tmp/raven-routing-audit-2026-09-17/paired-review/sealed-fresh/M4-B1-sealed-baseline-mapping.json` (SHA-256 `e063ab2360d6120be47bcce496ac6b147ed0b8350eeaa275457ae0463c48b487`), built by `/tmp/raven-routing-audit-2026-09-17/paired-review/sealed-fresh/grade-m4.mjs` (SHA-256 `6423efeaef20d917dbb57794d3253d2597b2a711d82a1a44e7817a7d530e0b9d`).
- **Frozen challenge set:** `/tmp/raven-routing-audit-2026-09-17/evals/challenge-set-v1.json` (SHA-256 `34edbc2fe99dd560a1c1350dbd9b371020b9f7d149b85f440d8d12fb43f63406`).
- **Authority-strict addendum:** `/tmp/raven-routing-audit-2026-09-17/evals/expectation-review-v1.json` (SHA-256 `f3246d4152c7c0f3c77591eb9fef7bc1f72944aec33de55be24c77919a2b8da1`).
- **Release discovery view:** `/tmp/raven-routing-audit-2026-09-17/evals/challenge-discovery-cases-release.json` (SHA-256 `4ade5f684a4c041042a0ca799bc9efa756a1d89278ebcd265f7ed339223c927c`).
- **Known controls:** `/tmp/raven-routing-audit-2026-09-17/evals/known-controls.json` (SHA-256 `07e2c25e25fc89be28d05dd754769a2c8d07c0d9746b387a8ce5628ffbf0f0bb`).

## 1. Artifact, inputs, validity

- **Artifact:** `/tmp/raven-routing-audit-2026-09-17/repo/eval/discovery/results/2026-09-17T02-53-35-211Z-routing-audit-M4-B1-agent.json`, SHA-256 `449a88f2f1060fe45bfdb48f8023bea117c300f56cf9813a568953792539e292`.
- **challengeSet:** SHA-256 `34edbc2fe99dd560a1c1350dbd9b371020b9f7d149b85f440d8d12fb43f63406`.
- **releaseView:** SHA-256 `4ade5f684a4c041042a0ca799bc9efa756a1d89278ebcd265f7ed339223c927c`.
- **expectationReview:** SHA-256 `f3246d4152c7c0f3c77591eb9fef7bc1f72944aec33de55be24c77919a2b8da1`.
- **knownControls:** SHA-256 `07e2c25e25fc89be28d05dd754769a2c8d07c0d9746b387a8ce5628ffbf0f0bb`.
- **Validity:** {"comparable":true,"complete":true,"rows":57,"agentFailureRows":0,"costUsd":6.0498432,"missingCosts":0,"model":"claude-sonnet-5","effort":"medium","agentBinaryMatches":true,"environmentMatches":true,"allRowsValid":true}. Verdict: valid measurement; all 57 rows valid.

## 2. Grading definitions (views are reported separately)

- **visible:** Rules applied to the agent's real searches (up to 3): top-k uses each id's best rank across searches; forbid rules apply across all searches; mustOutrank must hold on every search page where both ids appear.
- **selection:** The agent's primaryToolId is in the require list (requireTop5All: every group is covered by the primary or an alternate).
- **frozen:** challenge-set-v1 rules; scout.getRwaAssets dropped from require lists because it is not exposed; forbid checks on it are vacuous in the release arm.
- **strict:** expectation-review-v1 authority tiers: strong ids only; rc15 adds scout.searchResearch; rc01/rc02 not applicable; rc08c scored in an unrelated-AV stratum; known controls keep auditor lists.
- **runnerMetricsReleaseView:** familyHit/usableOp/primary/any from the release view acceptableOps (fallback routes for rc01/rc02); reported only as context.
- **rc01rc02:** fallback visibility and selection are recorded, never counted as authoritative passes.

## 3. Summaries

- **Runner metrics, release view (context only):** {"n":57,"familyHitAt3":56,"familyHitAt3Pct":98.2,"usableN":57,"usableOpAt5":56,"usableOpAt5Pct":98.2,"primaryHit":54,"primaryPct":94.7,"anyHit":57,"anyPct":100}.
- **frozenVisible total:** {"n":57,"pass":51,"fail":0,"na":6}.
- **frozenSelection total:** {"n":57,"pass":51,"fail":0,"na":6}.
- **strictVisible total:** {"n":57,"pass":50,"fail":1,"na":6}.
- **strictSelection total:** {"n":57,"pass":50,"fail":1,"na":6}.

| Stratum | Frozen visible (pass/fail/na) | Frozen selection | Strict visible | Strict selection |
|---|---|---|---|---|
| rwa-positive | 0/0/6 | 0/0/6 | 0/0/6 | 0/0/6 |
| rwa-mixed | 3/0/0 | 3/0/0 | 3/0/0 | 3/0/0 |
| rwa-negative | 12/0/0 | 12/0/0 | 11/0/0 | 11/0/0 |
| rwa-editorial | 3/0/0 | 3/0/0 | 3/0/0 | 3/0/0 |
| rwa-adjacent | 3/0/0 | 3/0/0 | 3/0/0 | 3/0/0 |
| unrelated-scout-hackathons | 6/0/0 | 6/0/0 | 5/1/0 | 5/1/0 |
| unrelated-docs-rpc | 3/0/0 | 3/0/0 | 3/0/0 | 3/0/0 |
| unrelated-skills | 6/0/0 | 6/0/0 | 6/0/0 | 6/0/0 |
| unrelated-scout-security | 3/0/0 | 3/0/0 | 3/0/0 | 3/0/0 |
| unrelated-docs-meetings | 3/0/0 | 3/0/0 | 3/0/0 | 3/0/0 |
| unrelated-scout-people | 3/0/0 | 3/0/0 | 3/0/0 | 3/0/0 |
| unrelated-lumenloop-directory | 3/0/0 | 3/0/0 | 3/0/0 | 3/0/0 |
| known-control-not-fresh | 3/0/0 | 3/0/0 | 3/0/0 | 3/0/0 |
| unrelated-av | - | - | 1/0/0 | 1/0/0 |

rc08c is counted under `rwa-negative` in the frozen view and `unrelated-av` in the strict view.

## 4. Rows needing attention

### rc01a

- **Question:** Which tokenized real-world assets are currently live on Stellar, and who issues each one?
- **Search 1:** "tokenized real-world assets Stellar issuer directory" → skills.stellar-dev.assets[gated], lumenloop.search_directory[gated], skills.lumenloop.stellar-ecosystem-scout[gated], stellarDocs.search_asset_token_docs[backfill], scout.searchProjects[gated], skills.lumenloop.stellar-integration-finder[backfill], lumenloop.search_content_semantic[gated], skills.lumenloop.stellar-project-dossier[backfill]
- **Search 2:** "RWA tokens stablecoins issuers list" → scout.getStablecoins[gated], scout.resolveProject[backfill]
- **Selected:** `scout.searchProjects`; alternates `scout.getStablecoins`, `lumenloop.search_directory`, `skills.lumenloop.stellar-ecosystem-scout`.
- **Frozen:** visible n/a, selection n/a; checks [["visibleTop3Any","n/a"]].
- **Strict:** visible n/a, selection n/a; fallback-not-authority; no authoritative route exposed.
- **Note:** fallback diagnostic only: selected scout.searchProjects; fallback visible true, fallback selected true; never an authoritative pass

### rc01b

- **Question:** Give me the RWA tokens on Stellar that actually have holders today, with their issuers.
- **Search 1:** "real world asset tokens holders issuer Stellar" → skills.stellar-dev.assets[gated], stellarDocs.search_asset_token_docs[backfill], scout.searchProjects[gated], stellarDocs.search_docs[backfill], stellarDocs.search_doc_titles[backfill], skills.lumenloop.stellar-ecosystem-scout[backfill], stellarDocs.search_docs_in_category[backfill], stellarDocs.search_soroban_contract_docs[backfill]
- **Search 2:** "asset holders count directory Stellar" → stellarDocs.search_asset_token_docs[gated], lumenloop.search_directory[gated], stellarDocs.search_docs_in_category[gated], skills.lumenloop.stellar-ecosystem-scout[gated], skills.lumenloop.stellar-project-dossier[gated], stellarDocs.search_docs[gated], scout.searchProjects[gated], skills.stellar-dev.dapp[gated]
- **Selected:** `scout.getLeaderboard`; alternates `scout.searchProjects`, `lumenloop.search_directory`, `skills.lumenloop.stellar-ecosystem-scout`.
- **Frozen:** visible n/a, selection n/a; checks [["visibleTop3Any","n/a"]].
- **Strict:** visible n/a, selection n/a; fallback-not-authority; no authoritative route exposed.
- **Note:** fallback diagnostic only: selected scout.getLeaderboard; fallback visible true, fallback selected false; never an authoritative pass

### rc01c

- **Question:** Which tokenized gold or commodity tokens exist on Stellar, and are any of them held by investors?
- **Search 1:** "tokenized gold or commodity token Stellar" → stellarDocs.search_asset_token_docs[gated], skills.lumenloop.stellar-content-auditor[gated], stellarDocs.search_docs_in_category[gated], stellarDocs.search_rpc_horizon_data_docs[gated], skills.lumenloop.stellar-ecosystem-scout[gated], stellarDocs.get_doc_page_sections[gated], skills.lumenloop.stellar-builder-quickstart[gated], skills.lumenloop.stellar-integration-finder[gated]
- **Search 2:** "stablecoin asset holders directory Stellar" → stellarDocs.search_asset_token_docs[gated], skills.stellar-dev.assets[gated], lumenloop.search_directory[gated], skills.lumenloop.stellar-ecosystem-scout[gated], skills.lumenloop.stellar-project-dossier[gated], skills.lumenloop.stellar-ecosystem-digest[gated], scout.getStablecoins[gated], scout.searchProjects[gated]
- **Selected:** `scout.searchProjects`; alternates `scout.getLeaderboard`, `lumenloop.search_directory`, `scout.getStablecoins`.
- **Frozen:** visible n/a, selection n/a; checks [["visibleTop3Any","n/a"]].
- **Strict:** visible n/a, selection n/a; fallback-not-authority; no authoritative route exposed.
- **Note:** fallback diagnostic only: selected scout.searchProjects; fallback visible true, fallback selected true; never an authoritative pass

### rc02a

- **Question:** Is the Franklin Templeton BENJI fund token on Stellar verified on-chain, or is it only listed?
- **Search 1:** "stablecoin issuer asset verification on-chain BENJI Franklin Templeton" → stellarDocs.search_asset_token_docs[backfill], skills.stellar-dev.cross-chain[backfill], scout.getStablecoins[backfill], scout.searchProjects[backfill], skills.stellar-dev.assets[backfill], scout.searchResearch[backfill], scout.getLeaderboard[backfill], lumenloop.find_content_by_entity[backfill]
- **Search 2:** "verified asset issuer directory Stellar" → stellarDocs.search_asset_token_docs[gated], lumenloop.search_directory[gated], skills.lumenloop.stellar-ecosystem-scout[gated], skills.lumenloop.stellar-integration-finder[gated], skills.lumenloop.stellar-project-dossier[gated], stellarDocs.search_doc_titles[gated], stellarDocs.search_docs[gated], stellarDocs.search_meeting_notes[gated]
- **Selected:** `scout.getStablecoins`; alternates `scout.searchProjects`, `scout.getPartners`, `lumenloop.search_directory`.
- **Frozen:** visible n/a, selection n/a; checks [["visibleTop3Any","n/a"]].
- **Strict:** visible n/a, selection n/a; fallback-not-authority; no authoritative route exposed.
- **Note:** fallback diagnostic only: selected scout.getStablecoins; fallback visible true, fallback selected false; never an authoritative pass
- **Note:** authority mismatch: a tokenized fund verification question routed to the stablecoin ranking

### rc02b

- **Question:** Check whether the Stellar deployment of BENJI has holders other than its issuer.
- **Search 1:** "token holders distribution asset issuer Stellar" → stellarDocs.search_asset_token_docs[gated], skills.stellar-dev.assets[gated], stellarDocs.search_docs[gated], stellarDocs.search_doc_titles[gated], skills.lumenloop.stellar-ecosystem-scout[gated], skills.stellar-dev.dapp[gated], scout.getLeaderboard[gated], scout.getStablecoins[gated]
- **Search 2:** "BENJI stablecoin asset Stellar" → stellarDocs.search_asset_token_docs[gated], skills.stellar-dev.assets[gated], skills.lumenloop.stellar-ecosystem-digest[gated], scout.getStablecoins[gated], stellarDocs.search_doc_titles[backfill], stellarDocs.search_docs[backfill], scout.getLeaderboard[gated], scout.searchProjects[gated]
- **Selected:** `scout.getStablecoins`; alternates `scout.searchProjects`, `scout.getLeaderboard`, `stellarDocs.search_asset_token_docs`.
- **Frozen:** visible n/a, selection n/a; checks [["visibleTop3Any","n/a"]].
- **Strict:** visible n/a, selection n/a; fallback-not-authority; no authoritative route exposed.
- **Note:** fallback diagnostic only: selected scout.getStablecoins; fallback visible false, fallback selected false; never an authoritative pass
- **Note:** authority mismatch: a tokenized fund verification question routed to the stablecoin ranking

### rc02c

- **Question:** Is WisdomTree's tokenized treasury fund on Stellar live with outside holders, or deployed with no supply?
- **Search 1:** "WisdomTree tokenized treasury fund Stellar holders supply" → stellarDocs.search_asset_token_docs[backfill], lumenloop.find_content_by_entity[backfill], skills.openzeppelin-stellar.upgrade-stellar-contracts[backfill], skills.stellar-light.stellar-scout[backfill], stellarDocs.get_doc_page_sections[backfill], stellarDocs.search_anchor_sep_docs[backfill], stellarDocs.search_docs_in_category[backfill], stellarDocs.search_soroban_contract_docs[backfill]
- **Search 2:** "on-chain asset holders and circulating supply lookup RWA fund token" → scout.searchProjects[gated], stellarDocs.search_asset_token_docs[backfill], scout.getLeaderboard[gated], lumenloop.search_content_semantic[gated], skills.stellar-dev.cross-chain[backfill], lumenloop.find_content_by_entity[backfill], scout.hackathonBrief[backfill], scout.getStablecoins[backfill]
- **Selected:** `scout.searchProjects`; alternates `scout.getStablecoins`, `scout.getLeaderboard`, `stellarDocs.search_asset_token_docs`.
- **Frozen:** visible n/a, selection n/a; checks [["visibleTop3Any","n/a"]].
- **Strict:** visible n/a, selection n/a; fallback-not-authority; no authoritative route exposed.
- **Note:** fallback diagnostic only: selected scout.searchProjects; fallback visible true, fallback selected true; never an authoritative pass

### rc03a

- **Question:** List the tokenized treasury funds on Stellar and explain how a user adds a trustline to one in a wallet app.
- **Search 1:** "tokenized treasury funds Stellar stablecoins real world assets" → skills.stellar-dev.assets[gated], stellarDocs.search_asset_token_docs[backfill], scout.searchProjects[gated], skills.lumenloop.stellar-builder-quickstart[backfill], stellarDocs.search_soroban_contract_docs[backfill], stellarDocs.search_docs[backfill], stellarDocs.search_docs_in_category[backfill], lumenloop.search_content_semantic[gated]
- **Search 2:** "add trustline wallet asset" → stellarDocs.search_wallet_dapp_docs[gated], stellarDocs.search_docs[gated], stellarDocs.search_asset_token_docs[backfill], scout.searchProjects[gated], scout.searchResearch[gated], lumenloop.search_directory[gated], skills.stellar-dev.dapp[gated], skills.lumenloop.stellar-ecosystem-scout[gated]
- **Selected:** `scout.searchProjects`; alternates `stellarDocs.search_asset_token_docs`, `stellarDocs.search_wallet_dapp_docs`, `lumenloop.search_directory`.
- **Frozen:** visible true, selection true; checks [["visibleTop5All[0]","n/a"],["visibleTop5All[1]",true]].
- **Strict:** visible true, selection true; checks [["visibleTop5All[0]","n/a"],["visibleTop5All[1]",true]].
- **Note:** partial applicability: the RWA inventory group (scout.getRwaAssets) is not exposed in the release arm, so only the wallet/trustline half is graded; the selected route is not an authoritative RWA list

### rc03b

- **Question:** Which tokenized T-bill products exist on Stellar, and what steps let someone hold one in Freighter?
- **Search 1:** "tokenized treasury bill T-bill products Stellar" → stellarDocs.search_asset_token_docs[backfill], stellarDocs.search_doc_titles[backfill], stellarDocs.search_sdk_cli_tools_docs[backfill], skills.lumenloop.stellar-builder-quickstart[backfill], stellarDocs.get_doc_page_sections[backfill], stellarDocs.search_docs_in_category[backfill], stellarDocs.search_rpc_horizon_data_docs[backfill], stellarDocs.search_soroban_contract_docs[backfill]
- **Search 2:** "add trustline asset Freighter wallet steps" → stellarDocs.search_wallet_dapp_docs[gated], stellarDocs.search_docs[gated], stellarDocs.search_asset_token_docs[backfill], scout.searchResearch[gated], skills.stellar-dev.dapp[gated], skills.stellar-dev.assets[backfill], stellarDocs.search_soroban_contract_docs[gated], scout.searchProjects[backfill]
- **Selected:** `scout.searchProjects`; alternates `lumenloop.search_directory`, `stellarDocs.search_wallet_dapp_docs`, `skills.stellar-dev.assets`.
- **Frozen:** visible true, selection true; checks [["visibleTop5All[0]","n/a"],["visibleTop5All[1]",true]].
- **Strict:** visible true, selection true; checks [["visibleTop5All[0]","n/a"],["visibleTop5All[1]",true]].
- **Note:** partial applicability: the RWA inventory group (scout.getRwaAssets) is not exposed in the release arm, so only the wallet/trustline half is graded; the selected route is not an authoritative RWA list

### rc03c

- **Question:** Which tokenized real-estate tokens are on Stellar, and how would my dapp request a trustline for one?
- **Search 1:** "tokenized real estate tokens Stellar" → stellarDocs.search_asset_token_docs[gated], skills.lumenloop.stellar-ecosystem-scout[gated], stellarDocs.get_doc_page_sections[gated], stellarDocs.search_doc_titles[gated], stellarDocs.search_docs[gated], skills.lumenloop.stellar-builder-quickstart[gated], skills.lumenloop.stellar-content-auditor[gated], skills.lumenloop.stellar-integration-finder[gated]
- **Search 2:** "create trustline for asset" → stellarDocs.search_asset_token_docs[gated], stellarDocs.search_docs[gated], skills.stellar-dev.assets[gated], skills.openzeppelin-stellar.setup-stellar-contracts[gated], lumenloop.find_av_passages[gated], stellarDocs.search_soroban_contract_docs[gated], stellarDocs.search_doc_titles[backfill], stellarDocs.search_sdk_cli_tools_docs[gated]
- **Selected:** `lumenloop.search_content_semantic`; alternates `skills.lumenloop.stellar-ecosystem-scout`, `stellarDocs.search_asset_token_docs`, `skills.stellar-dev.assets`.
- **Frozen:** visible true, selection true; checks [["visibleTop5All[0]","n/a"],["visibleTop5All[1]",true]].
- **Strict:** visible true, selection true; checks [["visibleTop5All[0]","n/a"],["visibleTop5All[1]",true]].
- **Note:** partial applicability: the RWA inventory group (scout.getRwaAssets) is not exposed in the release arm, so only the wallet/trustline half is graded; the selected route is not an authoritative RWA list

### rc11c

- **Question:** How did the DoraHacks Stellar buildathon compare with the previous Stellar hackathon on number of submissions?
- **Search 1:** "hackathon submissions count DoraHacks buildathon" → scout.hackathonBrief[gated], scout.searchHackathonBuilds[gated], scout.getHackathon[gated], scout.getHackathons[gated], scout.analyzeEcosystem[gated], lumenloop.get_scf_submissions[backfill], lumenloop.find_similar_scf_submissions[backfill], scout.compareHackathons[backfill]
- **Search 2:** "hackathon projects list Stellar" → scout.searchHackathonBuilds[gated], scout.searchProjects[gated], scout.listAudits[gated], scout.compareHackathons[gated], scout.getHackathons[gated], scout.hackathonBrief[gated], scout.resolveProject[backfill], scout.getBuilders[backfill]
- **Selected:** `scout.getHackathons`; alternates `scout.compareHackathons`, `scout.getHackathon`, `scout.hackathonBrief`.
- **Frozen:** visible true, selection true; checks [["visibleTop3Any",true],["forbidTop5",true],["selectionNotForbidden",true]].
- **Strict:** visible false, selection false; checks [["visibleTop3Any",false],["forbidTop5",true],["selectionNotForbidden",true]].
- **Note:** strict: scout.compareHackathons reached rank 4 (search 2), outside strict top-3; primary scout.getHackathons is a weak list route, with compareHackathons as an alternate

## 5. Per-ID baseline table (all 57)

| ID | Stratum (frozen) | Selected | Frozen vis/sel | Strict vis/sel | Runner F3/U5/P/A | Searches |
|---|---|---|---|---|---|---|
| rc01a | rwa-positive | `scout.searchProjects` | n/a/n/a | n/a/n/a | ✓✓✓✓ | 2 |
| rc01b | rwa-positive | `scout.getLeaderboard` | n/a/n/a | n/a/n/a | ✓✓✓✓ | 2 |
| rc01c | rwa-positive | `scout.searchProjects` | n/a/n/a | n/a/n/a | ✓✓✓✓ | 2 |
| rc02a | rwa-positive | `scout.getStablecoins` | n/a/n/a | n/a/n/a | ✓✓✓✓ | 2 |
| rc02b | rwa-positive | `scout.getStablecoins` | n/a/n/a | n/a/n/a | ✗✗✓✓ | 2 |
| rc02c | rwa-positive | `scout.searchProjects` | n/a/n/a | n/a/n/a | ✓✓✓✓ | 2 |
| rc03a | rwa-mixed | `scout.searchProjects` | ✓/✓ | ✓/✓ | ✓✓✗✓ | 2 |
| rc03b | rwa-mixed | `scout.searchProjects` | ✓/✓ | ✓/✓ | ✓✓✗✓ | 2 |
| rc03c | rwa-mixed | `lumenloop.search_content_semantic` | ✓/✓ | ✓/✓ | ✓✓✗✓ | 2 |
| rc04a | rwa-negative | `skills.stellar-dev.smart-contracts` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 1 |
| rc04b | rwa-negative | `skills.stellar-dev.smart-contracts` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc04c | rwa-negative | `skills.stellar-dev.smart-contracts` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc05a | rwa-negative | `skills.stellar-dev.data` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc05b | rwa-negative | `stellarDocs.search_rpc_horizon_data_docs` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc05c | rwa-negative | `stellarDocs.search_rpc_horizon_data_docs` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc06a | rwa-negative | `stellarDocs.search_asset_token_docs` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc06b | rwa-negative | `stellarDocs.search_asset_token_docs` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc06c | rwa-negative | `stellarDocs.search_asset_token_docs` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc07a | rwa-editorial | `lumenloop.search_content_semantic` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc07b | rwa-editorial | `lumenloop.search_content_semantic` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc07c | rwa-editorial | `lumenloop.search_content_semantic` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc08a | rwa-negative | `lumenloop.find_av_passages` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc08b | rwa-negative | `lumenloop.find_av_passages` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc08c | rwa-negative | `lumenloop.find_av_passages` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc09a | rwa-adjacent | `scout.getStablecoins` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc09b | rwa-adjacent | `scout.getStablecoins` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 1 |
| rc09c | rwa-adjacent | `scout.getStablecoins` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc10a | unrelated-scout-hackathons | `scout.searchHackathonBuilds` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc10b | unrelated-scout-hackathons | `scout.searchHackathonBuilds` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc10c | unrelated-scout-hackathons | `scout.searchHackathonBuilds` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc11a | unrelated-scout-hackathons | `scout.compareHackathons` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 1 |
| rc11b | unrelated-scout-hackathons | `scout.compareHackathons` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc11c | unrelated-scout-hackathons | `scout.getHackathons` | ✓/✓ | ✗/✗ | ✓✓✓✓ | 2 |
| rc12a | unrelated-docs-rpc | `stellarDocs.search_rpc_horizon_data_docs` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 1 |
| rc12b | unrelated-docs-rpc | `skills.stellar-dev.data` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 1 |
| rc12c | unrelated-docs-rpc | `stellarDocs.search_rpc_horizon_data_docs` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 1 |
| rc13a | unrelated-skills | `skills.trustless-work.trustless-work-dev` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc13b | unrelated-skills | `skills.trustless-work.trustless-work-dev` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc13c | unrelated-skills | `skills.trustless-work.trustless-work-dev` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc14a | unrelated-skills | `skills.openzeppelin-stellar.upgrade-stellar-contracts` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc14b | unrelated-skills | `skills.openzeppelin-stellar.upgrade-stellar-contracts` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc14c | unrelated-skills | `skills.openzeppelin-stellar.upgrade-stellar-contracts` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc15a | unrelated-scout-security | `scout.listAudits` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc15b | unrelated-scout-security | `scout.listAudits` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc15c | unrelated-scout-security | `scout.listAudits` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc16a | unrelated-docs-meetings | `stellarDocs.search_meeting_notes` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc16b | unrelated-docs-meetings | `stellarDocs.search_meeting_notes` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc16c | unrelated-docs-meetings | `stellarDocs.search_meeting_notes` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc17a | unrelated-scout-people | `scout.getPeople` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 1 |
| rc17b | unrelated-scout-people | `scout.getPeople` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc17c | unrelated-scout-people | `scout.getPeople` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc18a | unrelated-lumenloop-directory | `skills.lumenloop.stellar-ecosystem-scout` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc18b | unrelated-lumenloop-directory | `lumenloop.search_directory` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| rc18c | unrelated-lumenloop-directory | `lumenloop.search_directory` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| kc1-rpc-simulate-bond | known-control-not-fresh | `stellarDocs.search_rpc_horizon_data_docs` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| kc2-wallet-balance-treasury | known-control-not-fresh | `skills.stellar-dev.data` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |
| kc3-issuer-controls | known-control-not-fresh | `stellarDocs.search_asset_token_docs` | ✓/✓ | ✓/✓ | ✓✓✓✓ | 2 |

Query texts and top-8 hit lists for every row are in the mapping under `rows[].searches`.

## 6. Rules for the pending M4-C1 comparison

1. Pair by ID, one run per arm: report per-ID transitions only, and separately for frozen visible, frozen selection, strict visible, and strict selection. No aggregate or variance claim.
2. rc01/rc02 stay not applicable in both views. Fallback visibility or selection changes are diagnostics only, never authoritative passes or losses.
3. rc03: only the wallet/trustline group is gradable in the release arm; the RWA inventory half remains not applicable.
4. Forbid checks on scout.getRwaAssets are vacuous in both release arms; they cannot fail and are not evidence.
5. Attribute a transition to D3 only when the C1 agent real-query pages differ in the relevant ranking; different agent query wording alone is agent variance.
6. Answer quality is out of scope for M4.
7. Row validity: invalid only for agent error, invalid search contract, or raven not connected; all 57 B1 rows are valid.
8. Keep this review and the C1 comparison sealed from the implementation agent.
