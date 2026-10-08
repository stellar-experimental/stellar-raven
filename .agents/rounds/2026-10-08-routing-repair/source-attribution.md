# Source changes: field ablations

Each row restores one changed field or removes one new operation.
A listed field changes the fresh page order when restored.
The result shows a causal contribution, not complete semantic correctness.

| Case | Fields with a measured order effect |
|---|---|
| `q-anchor-platform-what` | scout.explainRepo.keywords (restores main order) |
| `q-anchor-sdp-what` | added scout.analyzeHackathonSubmissions (restores main order) |
| `q-asset-sac-usdc-soroban` | scout.vetIdea.routingKeywords (restores main order)<br>scout.vetIdea.routingPhrases (restores main order) |
| `q-comp-sep10-auth-role` | added scout.analyzeHackathonSubmissions (restores main order) |
| `q-defi-agentic-payment-standards-compare` | added scout.analyzeHackathonSubmissions<br>scout.searchHackathonBuilds.routingKeywords |
| `q-defi-blend-alternatives` | scout.getClusters.routingPhrases (restores main order) |
| `q-defi-blend-repo` | scout.listContracts.routingKeywords (restores main order) |
| `q-defi-lending-scf-flagships` | scout.searchHackathonBuilds.description<br>scout.searchHackathonBuilds.keywords (restores main order) |
| `q-defi-liquid-staking-whitespace` | scout.searchHackathonBuilds.description (restores main order) |
| `q-defi-lumenloop-categories-vocab` | added scout.analyzeHackathonSubmissions |
| `q-defi-phoenix-scf` | added scout.getHackathonSubmission<br>added scout.reviewSubmission |
| `q-defi-rwa-overview` | scout.getHackathon.description<br>scout.getHackathon.routingKeywords<br>scout.getHackathon.routingPhrases (restores main order) |
| `q-defi-soroswap-what-is` | added scout.analyzeHackathonSubmissions (restores main order) |
| `q-defi-stellarx-what-is` | scout.searchHackathonBuilds.description (restores main order)<br>scout.searchHackathonBuilds.keywords |
| `q-defi-streaming-payments-prior-art` | scout.scfPitch.routingKeywords<br>scout.vetIdea.routingKeywords<br>scout.vetIdea.routingPhrases |
| `q-defi-x402-on-stellar-what` | added scout.analyzeHackathonSubmissions (restores main order) |
| `q-defi-x402-projects-discovery` | scout.searchHackathonBuilds.description<br>scout.searchHackathonBuilds.routingKeywords |
| `q-eco-pyusd-stellar-freshness` | added scout.getHackathonSubmission (restores main order) |
| `q-edge-fresh-latest-protocol-version` | scout.getHackathon.description<br>scout.getHackathon.routingKeywords<br>scout.getHackathon.routingPhrases<br>scout.getRfps.routingKeywords |
| `q-edge-fresh-latest-scf-round` | added scout.reviewSubmission (restores main order) |
| `q-hist-remittance-corridors` | scout.getHackathon.description (restores main order)<br>scout.getHackathon.routingKeywords (restores main order)<br>scout.getHackathon.routingPhrases (restores main order) |
| `q-infra-anchor-platform` | added scout.analyzeHackathonSubmissions (restores main order) |
| `q-infra-horizon-deprecated` | scout.vetIdea.routingPhrases (restores main order) |
| `q-infra-horizon-rpc-migration` | scout.searchHackathonBuilds.description (restores main order)<br>scout.searchHackathonBuilds.keywords (restores main order) |
| `q-protocol-23-whisk-caps` | scout.searchHackathonBuilds.description (restores main order) |
| `q-protocol-24-whisk-incident` | scout.vetIdea.routingPhrases (restores main order) |
| `q-protocol-bls12-381-cap59` | scout.vetIdea.routingPhrases (restores main order) |
| `q-protocol-cap-process` | scout.vetIdea.routingPhrases (restores main order) |
| `q-protocol-clawback-cap-0035` | scout.vetIdea.routingPhrases (restores main order) |
| `q-protocol-passkeys-secp256r1` | scout.searchHackathonBuilds.routingKeywords (restores main order) |
| `q-protocol-validator-upgrade-vote` | scout.searchHackathonBuilds.description |
| `q-scf-award-tiers-list` | scout.scfPitch.routingExclusions (restores main order) |
| `q-scf-build-award-cap` | scout.searchHackathonBuilds.description (restores main order) |
| `q-scf-category-funded-ratio` | scout.compareHackathons.routingKeywords (restores main order)<br>scout.compareHackathons.routingPhrases (restores main order) |
| `q-scf-current-round` | added scout.getHackathonSubmission (restores main order) |
| `q-scf-eligibility-criteria` | scout.searchHackathonBuilds.description (restores main order) |
| `q-scf-funded-similar-payroll` | added scout.reviewSubmission<br>scout.scfPitch.routingKeywords<br>scout.vetIdea.routingKeywords<br>scout.vetIdea.routingPhrases |
| `q-scf-hackathon-detail-results` | scout.compareHackathons.routingKeywords<br>added scout.getHackathonSubmission<br>scout.searchHackathonBuilds.routingPhrases |
| `q-scf-hackathons-active` | added scout.getHackathonSubmission<br>added scout.reviewSubmission |
| `q-scf-hackathons-dorahacks` | scout.getHackathon.routingKeywords (restores main order)<br>scout.searchHackathonBuilds.keywords |
| `q-scf-how-to-apply` | scout.searchHackathonBuilds.description (restores main order) |
| `q-scf-sdf-marketing-grant` | scout.compareHackathons.description<br>scout.compareHackathons.routingKeywords<br>scout.compareHackathons.routingPhrases<br>scout.searchHackathonBuilds.description<br>scout.searchHackathonBuilds.routingKeywords |
| `q-soroban-add-signer-smart-wallet-howto` | scout.hackathonBrief.routingKeywords (restores main order)<br>scout.hackathonBrief.routingPhrases (restores main order) |
| `q-soroban-cross-contract-call` | scout.vetIdea.routingKeywords (restores main order) |
| `q-soroban-factory-pattern` | scout.vetIdea.routingKeywords (restores main order)<br>scout.vetIdea.routingPhrases (restores main order) |
| `q-soroban-upgrade-wasm` | scout.getRepoTrust.routingPhrases (restores main order) |
| `q-soroban-x402-auth-entry-signing` | scout.getHackathon.description<br>scout.listSkills.routingKeywords |
| `q-tool-cli-skills-discovery` | scout.vetIdea.routingPhrases (restores main order) |
| `q-tool-cli-testnet-identity-howto` | scout.vetIdea.routingPhrases (restores main order) |
| `q-tool-leaderboard-open-issues` | scout.getHackathon.description (restores main order)<br>scout.getHackathon.routingKeywords (restores main order)<br>scout.getHackathon.routingPhrases (restores main order) |
| `q-tool-passkeykit-smart-wallet` | scout.hackathonBrief.routingKeywords (restores main order)<br>scout.hackathonBrief.routingPhrases (restores main order) |
| `q-tool-sdk-repos-discovery` | scout.getRepoTrust.description (restores main order) |
| `q-tool-skill-detail-install` | added scout.getHackathonSubmission (restores main order) |
| `q-tool-smart-wallet-repos-discovery` | scout.hackathonBrief.routingKeywords (restores main order)<br>scout.hackathonBrief.routingPhrases (restores main order) |
| `q-tool-wallets-kit` | stellarDocs.search_soroban_contract_docs.keywords (restores main order) |
| `q-tool-which-sdk-comparison` | scout.compareHackathons.description<br>scout.searchProjects.keywords (restores main order) |
| `q-aas-trusted-asset-list-whitelist` | scout.searchHackathonBuilds.description<br>scout.searchHackathonBuilds.keywords |
| `q-crp-anchors-by-corridor` | scout.searchHackathonBuilds.description (restores main order) |
| `q-crp-tokenize-personal-rwa` | scout.getHackathon.routingKeywords (restores main order)<br>scout.getHackathon.routingPhrases (restores main order) |
| `q-edge-deep-leave-no-stone-unturned-wallets` | scout.searchHackathonBuilds.description (restores main order) |
| `q-edge-scf-v7-centralization-myths` | scout.scfPitch.routingKeywords (restores main order) |
| `q-pc-l2-payment-channels-starlight` | scout.compareHackathons.description |
| `q-pc-sequence-numbers-ordering-replace` | added scout.reviewSubmission (restores main order) |
| `q-scf-ecosystem-listing-partner-jobs` | added scout.getHackathonSubmission (restores main order) |
| `q-scf-submission-lifecycle-deadlines` | added scout.reviewSubmission |
| `q-ti-enumerate-all-contracts` | added scout.getHackathonSubmission (restores main order) |
| `q-ti-launchtube-mercury` | stellarDocs.search_soroban_contract_docs.keywords (restores main order) |
| `q-skill-dapp-freighter-invoke` | scout.searchHackathonBuilds.description (restores main order) |
| `q-skill-dapp-wallets-kit-passkeys` | scout.hackathonBrief.routingKeywords (restores main order)<br>scout.hackathonBrief.routingPhrases (restores main order) |
| `q-skill-agentic-payments-paid-api` | scout.getHackathon.description<br>scout.vetIdea.routingKeywords<br>scout.vetIdea.routingPhrases |
| `q-skill-builder-quickstart-remittance` | scout.vetIdea.routingKeywords (restores main order) |
| `q-skill-stellar-scout-hackathon` | added scout.reviewSubmission (restores main order) |
| `q-holdout-a-07-contract-audit-checklist` | scout.getRepoTrust.description (restores main order)<br>scout.getRepoTrust.routingPhrases (restores main order) |
| `q-holdout-a-16-current-protocol` | scout.getRfps.routingKeywords (restores main order)<br>scout.getRfps.routingPhrases (restores main order) |
| `q-holdout-a-18-zk-ecosystem-search` | scout.searchHackathonBuilds.description (restores main order)<br>scout.searchHackathonBuilds.routingKeywords (restores main order) |
| `q-holdout-b-10-nextjs-payment` | added scout.getHackathonSubmission<br>scout.searchHackathonBuilds.description |
| `q-holdout-b-14-compliance-backfill` | added scout.analyzeHackathonSubmissions (restores main order) |
| `q-holdout-c-02-defi-landscape` | scout.searchHackathonBuilds.description (restores main order) |
| `q-holdout-c-05-oracle-pick` | added scout.analyzeHackathonSubmissions (restores main order) |
| `q-holdout-c-07-tipping-start` | scout.vetIdea.routingPhrases |
| `q-holdout-c-10-scf-positioning` | scout.vetIdea.routingKeywords (restores main order)<br>scout.vetIdea.routingPhrases (restores main order) |
| `q-holdout-c-12-blend-directory` | added scout.reviewSubmission (restores main order) |
| `ph-protocol-24-archival-root-cause` | scout.vetIdea.routingPhrases (restores main order) |
| `ph-protocol-corrective-upgrade-history` | scout.searchHackathonBuilds.description (restores main order) |
