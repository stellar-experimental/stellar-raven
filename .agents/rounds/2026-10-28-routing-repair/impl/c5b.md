C5B does not pass. Positive-coverage hygiene adds graded losses. RWA controls and the interference guards still fail.

C5b starts from C5a. It also removes example-only tokens from positive routing coverage.

The per-catalog frequency calculation uses each searchable operation and whole skill once. It does not use a word list.

Scores, schema support, negative coverage, identity witnesses, enum witnesses, and directory witnesses remain unchanged.

The source and phrase boundaries remain visible. Example tokens can still add rank through the unchanged scorer.

The exact common tokens and coverage reductions appear in tmp/impl/c5-cause-trace.json. This file also records example-only removals.

The cumulative patch is [c5b.patch](c5b.patch). The step patch is [c5b-step.patch](c5b-step.patch).

Every source run contains 544 rows: 338 legacy, 122 extended, 23 skills, 49 holdout, and 12 protocol-history rows.

| Label | Legacy top1/top3/top5/cardHit5 | Extended top1/top3/top5/cardHit5 | Skills top1/top3/top5/cardHit5 | Holdout top1/top3/top5/captures |
| --- | --- | --- | --- | --- |
| c5b-main | 218/298/327/104 | 92/113/119/15 | 17/23/23/23 | 13/25/31/12 |
| c5b-fresh | 218/298/327/103 | 92/114/118/15 | 17/23/23/23 | 13/25/31/12 |

| Check | Main | Fresh |
| --- | --- | --- |
| 1 | PASS | PASS |
| 2 | PASS | PASS |
| 3 | PASS | PASS |
| 4 | PASS | PASS |
| 5 | PASS | PASS |
| 6 | PASS | PASS |
| 7 | FAIL | FAIL |
| 8 | FAIL | FAIL |
| 9 | FAIL | FAIL |
| 10 | FAIL | FAIL |
| 11 | PASS | PASS |
| 12 | FAIL | FAIL |
| 12 strict diagnostic | FAIL | FAIL |

Check 12 uses baseline-main grades for the four named rows. D1 permits gains and rejects paired source losses.

Paired source losses: q-defi-blend-repo, q-defi-bridge-evm-to-stellar-axelar.

The following table lists every candidate-versus-baseline graded change in every lane.

| Source | Row | Grade changes | Mechanism cause |
| --- | --- | --- | --- |
| main | `q-defi-bridges-content` | top5: false→true; cardHit5: false→true | Admission hygiene rejects scout.searchProjects (positive coverage 2→1, negative coverage 0), scout.analyzeEcosystem (positive coverage 2→1, negative coverage 0). Page competition then changes the grade |
| main | `q-defi-reflector-alternatives` | top3: true→false; any3: true→false | Admission hygiene rejects scout.searchProjects (positive coverage 2→1, negative coverage 0). Page competition then changes the grade |
| main | `q-defi-soroswap-vs-stellarx` | top3: false→true | Admission hygiene rejects scout.searchProjects (positive coverage 2→1, negative coverage 0). Page competition then changes the grade |
| main | `q-defi-stellarx-what-is` | any1: true→false | Admission hygiene rejects scout.searchHackathonBuilds (positive coverage 2→1, negative coverage 0), scout.searchProjects (positive coverage 2→1, negative coverage 0). Page competition then changes the grade |
| main | `q-eco-defi-market-map` | cardHit5: true→false | Admission hygiene rejects scout.getClusters (positive coverage 2→1, negative coverage 1). Page competition then changes the grade |
| main | `q-eco-most-active-defi-projects` | top1: true→false; top3: true→false | Admission hygiene rejects scout.searchProjects (positive coverage 4→2, negative coverage 2). Page competition then changes the grade |
| main | `q-edge-deep-no-budget-limit` | cardHit5: false→true | Quota-aware filling of existing admitted candidates replaces stellarDocs.search_protocol_concepts_docs (356), stellarDocs.get_doc_page_sections (354) with lumenloop.search_content_semantic (328), skills.lumenloop.stellar-integration-finder (328) |
| main | `q-hist-franklin-templeton-benji` | top1: true→false; top3: true→false; top5: true→false | Admission hygiene rejects scout.analyzeEcosystem (positive coverage 2→1, negative coverage 0). Page competition then changes the grade |
| main | `q-infra-hubble-vs-rpc-layer` | top1: false→true; any1: false→true | C1 removes schema-only gated admission. The unchanged ungated RPC Docs score 445 moves first. Later membership changes do not cause this inherited grade gain. |
| main | `q-infra-testnet-vs-futurenet` | top3: false→true; top5: false→true; any1: true→false | Admission hygiene rejects scout.searchResearch (positive coverage 2→1, negative coverage 0). Page competition then changes the grade |
| main | `q-protocol-27-cap-0071` | cardHit5: true→false | Admission hygiene rejects scout.searchResearch (positive coverage 2→1, negative coverage 0). Page competition then changes the grade |
| main | `q-protocol-bn254-poseidon-xray` | cardHit5: true→false | Admission hygiene rejects scout.searchHackathonBuilds (positive coverage 2→0, negative coverage 0), scout.searchResearch (positive coverage 2→1, negative coverage 0). Page competition then changes the grade |
| main | `q-protocol-cap-vs-sep` | cardHit5: true→false | Admission hygiene rejects scout.searchResearch (positive coverage 2→1, negative coverage 0). Page competition then changes the grade |
| main | `q-protocol-clawback-cap-0035` | cardHit5: true→false | Admission hygiene rejects scout.searchResearch (positive coverage 2→1, negative coverage 0). Page competition then changes the grade |
| main | `q-protocol-parallel-execution` | cardHit5: true→false | Admission hygiene rejects scout.searchResearch (positive coverage 2→1, negative coverage 0). Page competition then changes the grade |
| main | `q-protocol-passkeys-secp256r1` | top1: false→true; cardHit5: true→false | Admission hygiene rejects scout.searchResearch (positive coverage 2→1, negative coverage 0), scout.searchHackathonBuilds (positive coverage 2→0, negative coverage 0). Page competition then changes the grade |
| main | `q-scf-build-tracks` | cardHit5: true→false | Admission hygiene rejects scout.searchResearch (positive coverage 2→0, negative coverage 0). Page competition then changes the grade |
| main | `q-scf-build-tranches` | cardHit5: true→false | Admission hygiene rejects scout.searchResearch (positive coverage 3→1, negative coverage 0). Page competition then changes the grade |
| main | `q-scf-eligibility-criteria` | cardHit5: true→false | Admission hygiene rejects scout.searchResearch (positive coverage 2→0, negative coverage 0), scout.getClusters (positive coverage 2→1, negative coverage 1). Page competition then changes the grade |
| main | `q-soroban-current-sdk-cli-version` | cardHit5: false→true | Admission hygiene rejects scout.analyzeEcosystem (positive coverage 2→1, negative coverage 0). Page competition then changes the grade |
| main | `q-soroban-x402-auth-entry-signing` | top3: false→true | Admission hygiene rejects scout.searchHackathonBuilds (positive coverage 2→0, negative coverage 0). Page competition then changes the grade |
| main | `q-token-circle-usdc-on-stellar` | any3: false→true | Quota-aware filling of existing admitted candidates replaces skills.lumenloop.stellar-integration-finder (437), skills.openzeppelin-stellar.upgrade-stellar-contracts (421) with stellarDocs.search_docs_in_category (411), lumenloop.search_content_semantic (302) |
| main | `q-tool-leaderboard-open-issues` | top1: true→false; cardHit5: true→false | Admission hygiene rejects scout.getLeaderboard (positive coverage 4→3, negative coverage 2). Page competition then changes the grade |
| main | `q-crp-custodial-vs-noncustodial-wallets` | top1: true→false; top3: true→false; cardHit5: true→false; any1: true→false; any3: true→false | Admission hygiene rejects scout.searchResearch (positive coverage 2→1, negative coverage 0). Page competition then changes the grade |
| main | `q-defi-arbitrage-pathpayment-bots` | top1: false→true | Admission hygiene rejects scout.searchResearch (positive coverage 2→1, negative coverage 0). Page competition then changes the grade |
| main | `q-defi-bridge-evm-to-stellar-axelar` | top5: false→true | Quota-aware filling of existing admitted candidates replaces stellarDocs.search_sdk_cli_tools_docs (564), stellarDocs.search_doc_titles (541) with skills.lumenloop.stellar-content-auditor (506), scout.compareHackathons (404) |
| main | `q-defi-build-staking-for-own-token` | top3: false→true | Quota-aware filling of existing admitted candidates replaces scout.searchHackathonBuilds (278) with skills.stellar-dev.cross-chain (213) |
| main | `q-defi-named-newer-protocols` | top3: false→true; any3: false→true | Quota-aware filling of existing admitted candidates replaces skills.lumenloop.stellar-integration-finder (353), skills.stellar-dev.standards (289) with stellarDocs.search_docs_in_category (271), stellarDocs.search_doc_titles (245) |
| main | `q-edge-deep-leave-no-stone-unturned-wallets` | top1: true→false; top3: true→false; top5: true→false | Admission hygiene rejects scout.vetIdea (positive coverage 2→1, negative coverage 0), scout.searchHackathonBuilds (positive coverage 2→1, negative coverage 1). Page competition then changes the grade |
| main | `q-scf-ecosystem-listing-partner-jobs` | cardHit5: true→false | Quota-aware filling of existing admitted candidates replaces scout.searchProjects (438), scout.getRfps (395), scout.searchResearch (395) with skills.lumenloop.stellar-integration-finder (623), skills.lumenloop.stellar-project-dossier (591), stellarDocs.search_doc_titles (583) |
| main | `q-sor-reflector-integration-code` | top3: false→true; top5: false→true; cardHit5: false→true | The local schema-support correction changes supported inflection scores; it changes the selected order. Quota-aware filling of existing admitted candidates replaces stellarDocs.search_doc_titles (608), stellarDocs.search_docs (555), stellarDocs.search_docs_in_category (540) with scout.explainRepo (505), scout.searchResearch (502), lumenloop.search_content_semantic (472) |
| main | `q-ti-friendbot-ratelimit-alternatives` | top3: false→true; any3: false→true | Quota-aware filling of existing admitted candidates replaces lumenloop.get_document (227), lumenloop.get_tags_vocabulary (221), lumenloop.search_directory (217) with stellarDocs.search_wallet_dapp_docs (212), stellarDocs.get_doc_page_sections (211), scout.searchResearch (190) |
| main | `q-ti-video-tutorials` | top5: false→true; any5: false→true | Quota-aware filling of existing admitted candidates replaces stellarDocs.search_soroban_contract_docs (335), stellarDocs.search_doc_titles (288) with skills.lumenloop.stellar-builder-quickstart (256), lumenloop.search_content_semantic (218) |
| main | `q-holdout-a-04-oz-workspace-setup` | top5: false→true; cardHit5: false→true; pass: false→true | Quota-aware filling of existing admitted candidates replaces stellarDocs.search_docs (940), stellarDocs.search_sdk_cli_tools_docs (928), stellarDocs.get_doc_page_sections (886) with skills.lumenloop.stellar-project-dossier (819), skills.openzeppelin-stellar.setup-stellar-contracts (809), lumenloop.list_documents (662) |
| main | `q-holdout-a-05-groth16-soroban` | top3: true→false | C1 removes weak schema-only admission; Soroban Docs at 323 enter above the unchanged ZK skill at 164 |
| main | `q-holdout-b-06-sac-or-sep41` | top5: false→true; cardHit5: false→true | Quota-aware filling of existing admitted candidates replaces stellarDocs.search_docs (508), stellarDocs.search_wallet_dapp_docs (505) with skills.stellar-dev.assets (458), scout.searchProjects (453) |
| main | `q-holdout-b-07-sep24-fields` | forbiddenCapture: false→true; pass: true→false | Admission hygiene rejects scout.matchPartners (positive coverage 2→1, negative coverage 0). Page competition then changes the grade |
| main | `q-holdout-c-01-defi-map` | top1: false→true | Admission hygiene rejects scout.searchProjects (positive coverage 5→3, negative coverage 2). Page competition then changes the grade |
| main | `q-holdout-c-03-rwa-month` | forbiddenCapture: false→true; pass: true→false | Admission hygiene rejects scout.analyzeEcosystem (positive coverage 2→1, negative coverage 0). Page competition then changes the grade |
| fresh | `q-defi-blend-repo` | cardHit5: true→false | Quota-aware filling of existing admitted candidates replaces scout.searchRepos (276), scout.listAudits (270), scout.getSkill (207) with skills.stellar-dev.smart-contracts (321), stellarDocs.search_soroban_contract_docs (260), stellarDocs.search_asset_token_docs (216) |
| fresh | `q-defi-bridges-content` | top5: false→true; cardHit5: false→true | Admission hygiene rejects scout.searchProjects (positive coverage 2→1, negative coverage 0), scout.analyzeEcosystem (positive coverage 2→1, negative coverage 0). Page competition then changes the grade |
| fresh | `q-defi-reflector-alternatives` | top3: true→false; any3: true→false | Admission hygiene rejects scout.searchProjects (positive coverage 2→1, negative coverage 0). Page competition then changes the grade |
| fresh | `q-defi-soroswap-vs-stellarx` | top3: false→true | Admission hygiene rejects scout.searchProjects (positive coverage 2→1, negative coverage 0). Page competition then changes the grade |
| fresh | `q-defi-stellarx-what-is` | top1: true→false; any1: true→false | Admission hygiene rejects scout.searchProjects (positive coverage 2→1, negative coverage 0), scout.searchHackathonBuilds (positive coverage 2→1, negative coverage 0). Page competition then changes the grade |
| fresh | `q-eco-defi-market-map` | cardHit5: true→false | Admission hygiene rejects scout.getClusters (positive coverage 2→1, negative coverage 1). Page competition then changes the grade |
| fresh | `q-eco-most-active-defi-projects` | top1: true→false; top3: true→false | Admission hygiene rejects scout.searchProjects (positive coverage 4→2, negative coverage 2). Page competition then changes the grade |
| fresh | `q-edge-deep-no-budget-limit` | cardHit5: false→true | Quota-aware filling of existing admitted candidates replaces stellarDocs.search_protocol_concepts_docs (356), stellarDocs.get_doc_page_sections (354) with lumenloop.search_content_semantic (328), skills.lumenloop.stellar-integration-finder (328) |
| fresh | `q-hist-franklin-templeton-benji` | top1: true→false; top3: true→false; top5: true→false | Admission hygiene rejects scout.analyzeEcosystem (positive coverage 2→1, negative coverage 0). Page competition then changes the grade |
| fresh | `q-infra-hubble-vs-rpc-layer` | top1: false→true; any1: false→true | C1 removes schema-only gated admission. The unchanged ungated RPC Docs score 445 moves first. Later membership changes do not cause this inherited grade gain. |
| fresh | `q-infra-testnet-vs-futurenet` | top3: false→true; top5: false→true; any1: true→false | Admission hygiene rejects scout.searchResearch (positive coverage 2→1, negative coverage 0). Page competition then changes the grade |
| fresh | `q-protocol-27-cap-0071` | cardHit5: true→false | Admission hygiene rejects scout.searchResearch (positive coverage 2→1, negative coverage 0). Page competition then changes the grade |
| fresh | `q-protocol-bn254-poseidon-xray` | cardHit5: true→false | Admission hygiene rejects scout.searchHackathonBuilds (positive coverage 2→0, negative coverage 0), scout.searchResearch (positive coverage 2→1, negative coverage 0). Page competition then changes the grade |
| fresh | `q-protocol-cap-vs-sep` | cardHit5: true→false | Admission hygiene rejects scout.searchResearch (positive coverage 2→1, negative coverage 0). Page competition then changes the grade |
| fresh | `q-protocol-clawback-cap-0035` | cardHit5: true→false | Admission hygiene rejects scout.searchResearch (positive coverage 2→1, negative coverage 0). Page competition then changes the grade |
| fresh | `q-protocol-parallel-execution` | cardHit5: true→false | Admission hygiene rejects scout.searchResearch (positive coverage 2→1, negative coverage 0). Page competition then changes the grade |
| fresh | `q-protocol-passkeys-secp256r1` | top1: false→true; cardHit5: true→false | Admission hygiene rejects scout.searchResearch (positive coverage 2→1, negative coverage 0), scout.searchHackathonBuilds (positive coverage 2→0, negative coverage 0). Page competition then changes the grade |
| fresh | `q-scf-build-tracks` | cardHit5: true→false | Admission hygiene rejects scout.searchResearch (positive coverage 2→0, negative coverage 0). Page competition then changes the grade |
| fresh | `q-scf-build-tranches` | cardHit5: true→false | Admission hygiene rejects scout.searchResearch (positive coverage 3→1, negative coverage 0). Page competition then changes the grade |
| fresh | `q-scf-eligibility-criteria` | cardHit5: true→false | Admission hygiene rejects scout.searchResearch (positive coverage 2→0, negative coverage 0), scout.getClusters (positive coverage 2→1, negative coverage 1). Page competition then changes the grade |
| fresh | `q-soroban-current-sdk-cli-version` | cardHit5: false→true | Admission hygiene rejects scout.analyzeEcosystem (positive coverage 2→1, negative coverage 0). Page competition then changes the grade |
| fresh | `q-soroban-x402-auth-entry-signing` | top3: false→true | Admission hygiene rejects scout.searchHackathonBuilds (positive coverage 2→0, negative coverage 0), scout.getHackathon (positive coverage 2→1, negative coverage 0). Page competition then changes the grade |
| fresh | `q-token-circle-usdc-on-stellar` | any3: false→true | Quota-aware filling of existing admitted candidates replaces skills.lumenloop.stellar-integration-finder (437), skills.openzeppelin-stellar.upgrade-stellar-contracts (421) with stellarDocs.search_docs_in_category (411), lumenloop.search_content_semantic (302) |
| fresh | `q-tool-leaderboard-open-issues` | top1: true→false; cardHit5: true→false | Admission hygiene rejects scout.getLeaderboard (positive coverage 4→3, negative coverage 2), scout.getHackathon (positive coverage 2→1, negative coverage 1). Page competition then changes the grade |
| fresh | `q-crp-custodial-vs-noncustodial-wallets` | top1: true→false; top3: true→false; cardHit5: true→false; any1: true→false; any3: true→false | Admission hygiene rejects scout.searchResearch (positive coverage 2→1, negative coverage 0). Page competition then changes the grade |
| fresh | `q-defi-arbitrage-pathpayment-bots` | top1: false→true | Admission hygiene rejects scout.searchResearch (positive coverage 2→1, negative coverage 0). Page competition then changes the grade |
| fresh | `q-defi-build-staking-for-own-token` | top3: false→true | Quota-aware filling of existing admitted candidates replaces scout.searchHackathonBuilds (291) with skills.stellar-dev.cross-chain (213) |
| fresh | `q-defi-named-newer-protocols` | top3: false→true; any3: false→true | Quota-aware filling of existing admitted candidates replaces skills.lumenloop.stellar-integration-finder (353), skills.stellar-dev.standards (289) with stellarDocs.search_docs_in_category (271), stellarDocs.search_doc_titles (245) |
| fresh | `q-edge-deep-leave-no-stone-unturned-wallets` | top1: true→false; top3: true→false; top5: true→false | Admission hygiene rejects scout.vetIdea (positive coverage 2→1, negative coverage 0), scout.searchHackathonBuilds (positive coverage 2→1, negative coverage 1). Page competition then changes the grade |
| fresh | `q-scf-ecosystem-listing-partner-jobs` | cardHit5: true→false | Quota-aware filling of existing admitted candidates replaces scout.searchProjects (438), scout.getRfps (395), scout.searchResearch (395) with skills.lumenloop.stellar-integration-finder (623), skills.lumenloop.stellar-project-dossier (591), stellarDocs.search_doc_titles (583) |
| fresh | `q-sor-reflector-integration-code` | top3: false→true; top5: false→true; cardHit5: false→true | The local schema-support correction changes supported inflection scores; it changes the selected order. Quota-aware filling of existing admitted candidates replaces stellarDocs.search_doc_titles (608), stellarDocs.search_docs (555), stellarDocs.search_docs_in_category (540) with scout.explainRepo (505), scout.searchResearch (502), lumenloop.search_content_semantic (472) |
| fresh | `q-ti-friendbot-ratelimit-alternatives` | top3: false→true; any3: false→true | Quota-aware filling of existing admitted candidates replaces lumenloop.get_document (227), lumenloop.get_tags_vocabulary (221), lumenloop.search_directory (217) with stellarDocs.search_wallet_dapp_docs (212), stellarDocs.get_doc_page_sections (211), scout.searchResearch (190) |
| fresh | `q-ti-video-tutorials` | top5: false→true; any5: false→true | Quota-aware filling of existing admitted candidates replaces stellarDocs.search_soroban_contract_docs (335), stellarDocs.search_doc_titles (288) with skills.lumenloop.stellar-builder-quickstart (256), lumenloop.search_content_semantic (218) |
| fresh | `q-holdout-a-04-oz-workspace-setup` | top5: false→true; cardHit5: false→true; pass: false→true | Quota-aware filling of existing admitted candidates replaces stellarDocs.search_docs (940), stellarDocs.search_sdk_cli_tools_docs (928), stellarDocs.get_doc_page_sections (886) with skills.lumenloop.stellar-project-dossier (819), skills.openzeppelin-stellar.setup-stellar-contracts (809), lumenloop.list_documents (662) |
| fresh | `q-holdout-a-05-groth16-soroban` | top3: true→false | C1 removes weak schema-only admission; Soroban Docs at 323 enter above the unchanged ZK skill at 164 |
| fresh | `q-holdout-b-06-sac-or-sep41` | top5: false→true; cardHit5: false→true | Quota-aware filling of existing admitted candidates replaces stellarDocs.search_docs (508), stellarDocs.search_wallet_dapp_docs (505) with skills.stellar-dev.assets (458), scout.searchProjects (453) |
| fresh | `q-holdout-b-07-sep24-fields` | forbiddenCapture: false→true; pass: true→false | Admission hygiene rejects scout.matchPartners (positive coverage 2→1, negative coverage 0). Page competition then changes the grade |
| fresh | `q-holdout-c-01-defi-map` | top1: false→true | Admission hygiene rejects scout.searchProjects (positive coverage 5→3, negative coverage 2). Page competition then changes the grade |
| fresh | `q-holdout-c-03-rwa-month` | forbiddenCapture: false→true; pass: true→false | Admission hygiene rejects scout.analyzeEcosystem (positive coverage 2→1, negative coverage 0). Page competition then changes the grade |

Each diagnostics file retains the complete before/after pages and individual score traces.

| Source | Gate failures |
| --- | --- |
| main | holdout lane top3=25 below floor 26; holdout forbidden captures=12 above ceiling 10 |
| fresh | catalog/manifest.json SHA-256 does not match the committed gate evidence — re-baseline gates.json explicitly; holdout lane top3=25 below floor 26; holdout forbidden captures=12 above ceiling 10 |

The fixed D2 guard rejects new interference rows, rank improvements, and higher interference counts.

| Guard | Baseline count | Candidate count | Verdict | New rows | Promoted rows |
| --- | --- | --- | --- | --- | --- |
| hackathon | 7 | 9 | FAIL | q-defi-lumenloop-categories-vocab, q-pc-sequence-numbers-ordering-replace, q-sor-testing-negative-auth-events, q-infra-rpc-provider-archive-tier, q-ti-channel-accounts-throughput, q-ti-launchtube-mercury | none |
| locator | 6 | 5 | FAIL | q-ti-historical-events-beyond-retention, q-ti-self-host-core-rpc-full-history | none |

| Operation | Interference row | Rank |
| --- | --- | --- |
| scout.analyzeHackathonSubmissions | q-comp-sep10-auth-role | 2 |
| scout.analyzeHackathonSubmissions | q-defi-lumenloop-categories-vocab | 5 |
| scout.analyzeHackathonSubmissions | q-infra-anchor-platform | 4 |
| scout.analyzeHackathonSubmissions | q-pc-sequence-numbers-ordering-replace | 3 |
| scout.analyzeHackathonSubmissions | q-sor-testing-negative-auth-events | 3 |
| scout.getHackathonSubmission | q-defi-phoenix-scf | 4 |
| scout.getHackathonSubmission | q-infra-rpc-provider-archive-tier | 3 |
| scout.getHackathonSubmission | q-ti-channel-accounts-throughput | 4 |
| scout.getHackathonSubmission | q-ti-launchtube-mercury | 4 |
| scout.locateSource | q-soroban-contract-build-verification | 3 |
| scout.locateSource | q-tool-cli-skills-discovery | 5 |
| scout.locateSource | q-tool-smart-wallet-repos-discovery | 3 |
| scout.locateSource | q-ti-historical-events-beyond-retention | 4 |
| scout.locateSource | q-ti-self-host-core-rpc-full-history | 5 |

Every paired source gain requires a source-text cause. These controls restore each entry’s main scoring fields within the fresh catalog.

| Source gain | Source-text cause |
| --- | --- |
| q-edge-scf-v7-centralization-myths | scout.scfPitch: description, keywords, routingKeywords, routingPhrases, routingExclusions; restoring these fields removes top3 |

The published RWA fixture remains the check 8 basis. The builder diagnostic also measures all 544 rows.

| Source | Fixture positives | Fixture ordinary negatives | Fixture mixed controls | Builder check 8 | Builder graded cost | Builder RWA pages |
| --- | --- | --- | --- | --- | --- | --- |
| main | PASS | PASS | FAIL | FAIL | losses | 28 |
| fresh | PASS | PASS | FAIL | FAIL | losses | 28 |

| Builder RWA source | Legacy totals | Extended totals | Skills totals | Holdout top1/top3/top5/captures |
| --- | --- | --- | --- | --- |
| main | 219/297/327/102 | 92/113/119/15 | 17/23/23/23 | 13/25/31/11 |
| fresh | 219/297/327/101 | 92/114/118/15 | 17/23/23/23 | 13/25/31/11 |

| Builder RWA source | Lost row | Lost grades | Cause |
| --- | --- | --- | --- |
| main | q-defi-rwa-overview | top3 | Generated RWA exposure changes the scored catalog and page competition |
| main | q-defi-rwa-scf-similar | top3, cardHit5 | Generated RWA exposure changes the scored catalog and page competition |
| main | q-eco-2025-defi-launches | top5, cardHit5 | Generated RWA exposure changes the scored catalog and page competition |
| fresh | q-defi-rwa-overview | top3 | Generated RWA exposure changes the scored catalog and page competition |
| fresh | q-defi-rwa-scf-similar | top3, cardHit5 | Generated RWA exposure changes the scored catalog and page competition |
| fresh | q-eco-2025-defi-launches | top5, cardHit5 | Generated RWA exposure changes the scored catalog and page competition |

RWA remains excluded unless both fixture and builder controls pass without a graded cost.

The short-token table counts actual gated entries across all services. The linked diagnostics retain every entry and score.

| Query | Main gated entries | Fresh gated entries |
| --- | --- | --- |
| through | 2 | 2 |
| each | 8 | 8 |
| network | 6 | 6 |
| is | 24 | 24 |
| an | 28 | 28 |
| also | 21 | 21 |
| app | 21 | 21 |

| Source | Wallet score with approach | Wallet score without approach |
| --- | --- | --- |
| main | null | null |
| fresh | null | null |

The supplied off-corpus file contains 149 queries. The lead note names 159; this report measures all supplied queries.

| Probe group | n | Main watched captures | Fresh watched captures | Main builder captures | Fresh builder captures |
| --- | --- | --- | --- | --- | --- |
| shortTokens | 20 | 20 | 20 | — | — |
| hackathonNegatives | 22 | 1 | 2 | — | — |
| hackathonPositives | 12 | 12 | 12 | — | — |
| locateNegatives | 20 | 0 | 1 | — | — |
| locatePositives | 5 | 0 | 4 | — | — |
| rwaDiscovery | 10 | 8 | 8 | 8 | 8 |
| rwaImplementation | 20 | 10 | 10 | 11 | 11 |
| schemaWords | 20 | 20 | 20 | — | — |
| taxonomyPositives | 12 | 10 | 10 | — | — |
| taxonomyNegatives | 8 | 0 | 0 | — | — |

A check 8 claim also requires fewer RWA implementation-probe captures than the baseline.

Typecheck passes.

The focused suite reports 191 passes, two expected failures, and 13 failed assertions.

Failures include lost accepted routing rows and changed page membership. All frozen assertions remain in place.

The numeric gates and extended diagnostic show regression. The candidate does not satisfy rule 2.

The positive-only coverage rule can let generic negative clauses override valid topical intent. The per-row traces expose those decisions.

The drift test, description override, routing cases, golden answers, and gate thresholds remain frozen.

The brief forbids a Wrangler process. The catalog builds use plain Node; this lane does not run the Worker build.

The tracked source tree remains unchanged. Spend remains USD 0.

Complete evidence: `tmp/impl/runs/c5b-{main,fresh}/` and `tmp/impl/c5b-commands.json`.

C6 will use the best earlier parent. Its offline classifier report must precede serving-path code.

