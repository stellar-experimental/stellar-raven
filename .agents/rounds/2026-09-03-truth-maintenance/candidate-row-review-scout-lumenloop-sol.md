# Candidate row review: Scout and LumenLoop

## Scope and evidence

I reviewed every candidate row tagged `scout` or `lumenloop`.
I inspected each answer, transcript, canonical golden, verdict, missing fact, wrong claim, and avoid match.
I also checked all correct rows for unsupported claims, hidden omissions, and suspicious tool use.

The candidate artifact is:
`/private/tmp/stellar-raven-tm-runner/eval/qa/results/2026-09-04T05-40-51-variantA.json`.

The artifact and its transcripts provide candidate-window evidence.
Existing `improvements/` records and `catalog/manifest.json` provide later repository evidence.
I did not run a live service check.
Therefore, this report contains no post-drift current-truth evidence.
I made no paid model call.

## Shard counts

| Service | Correct | Partial | Wrong | Total |
|---|---:|---:|---:|---:|
| `lumenloop` | 28 | 29 | 6 | 63 |
| `scout` | 54 | 68 | 21 | 143 |
| Total | 82 | 97 | 27 | 206 |

The shard contains 206 rows and 206 unique row IDs.
The coverage ledger below contains 206 row IDs.
It contains no duplicate IDs and omits no selected ID.
Each selected row appears exactly once in the ledger.

## Grade disputes

I dispute nine `correct` grades.
Each listed answer needs a small but material correction.

| Row | Proposed grade | Reason |
|---|---|---|
| `q-anchor-list-builders-discovery` | Partial | The answer reports four inactive entries, then names six inactive entries. |
| `q-asset-rwa-tokenized-freshness` | Partial | The answer labels a June Spiko milestone as a mid-May milestone. |
| `q-defi-cross-blend-rivool-sac` | Partial | The answer omits the required isolated-pool property. |
| `q-defi-lending-landscape-live` | Partial | The answer omits the required pagination statement. |
| `q-hist-quantum-preparedness-plan` | Partial | The answer omits ML-DSA-44 and ML-DSA-65. |
| `q-scf-academic-research-grant` | Partial | The answer gives current details without an explicit observation date. |
| `q-scf-blend-winners-live` | Partial | The answer silently omits the missing YieldBack demo URL. |
| `q-tool-leaderboard-open-issues` | Partial | The answer omits current `lastActivityAt` values for most rows. |
| `q-tool-zk-repo-live` | Partial | The claimed `repoScore` order conflicts with the displayed order. |

I found two verdict-rationale defects that do not change their row grades.

- `q-gap-semantic-directory-fallback` should remain correct.
  The judge's missing-fact note applies only to unsupported identity claims.
  The answer clearly limits the claim and covers all five golden facts.
- `q-ti-scout-refresh-cached-rows` should remain partial.
  Its answer does not condition absence on `truncated:false`.
  However, the judge incorrectly says `limit:20` conflicts with the default limit.
  The transcript shows an explicit `limit:20` argument.
  The repository manifest permits limits from 1 through 500.

## Root-cause classification for partial and wrong rows

I applied the Step 5 root-cause classes from the `run-evals` skill.

| Primary class | Rows | Main evidence |
|---|---:|---|
| Agent failure | 101 | The transcript contained enough evidence, or the answer overclaimed beyond it. |
| Own-repo gap | 1 | Search routing hid the exact LumenLoop taxonomy operation. |
| Upstream data/content gap | 13 | The source lacked stable, complete, or current fields. |
| Upstream semantics/spec gap | 8 | The source mixed distinct statuses, products, or milestones. |
| Corpus-coverage diagnostic | 1 | The tested service surface could not supply the required canonical text. |
| Eval-side gap | 0 | No failed row had an eval-side issue as its primary cause. |
| Judge artifact | 0 | One rationale had an artifact, but the partial grade still stands. |
| Total partial and wrong | 124 | Every failed row has one primary class. |

### Own-repo gap

- `q-defi-lumenloop-categories-vocab`

The initial search ranked `scout.analyzeEcosystem` first.
It omitted `lumenloop.get_categories` from the leading results.
The answer then used the wrong service taxonomy.

### Upstream semantics/spec gap

- `q-crp-cme-xlm-futures-dates`
- `q-defi-rwa-scf-similar`
- `q-eco-defi-tvl-current`
- `q-eco-stablecoins-on-stellar`
- `q-hist-scp-rewrite-2015`
- `q-soroban-av-passkeys-talk`
- `q-ti-openzeppelin-relayer`
- `q-token-circle-usdc-on-stellar`

These rows expose ambiguous dates, mixed product types, or unclear milestone semantics.
Existing findings include `ll-026`, `ll-016`, `ll-019`, and `ll-022`.

### Upstream data/content gap

- `q-defi-wisdomtree-crdt`
- `q-eco-lobstr-wallet`
- `q-eco-stellar-wallets-list`
- `q-edge-fresh-latest-blend-tvl`
- `q-hist-meridian-2026-corrected-venue`
- `q-hist-remittance-corridors`
- `q-hist-yieldblox-v2-2026-exploit`
- `q-hot-sdf-transparency-wallets-reports`
- `q-rwa-projects-tokenizing-stellar`
- `q-scf-audit-bank`
- `q-scf-regional-india`
- `q-scf-round-43-results`
- `q-scf-sdf-marketing-grant`

These rows lack stable deployment, history, award, source, or current-state fields.
Relevant existing findings include `ll-007`, `ll-011`, `ll-012`, `ll-024`, and `ll-030`.
They also include `sls-023`, `sls-024`, `sls-033`, and `sls-039`.

### Corpus-coverage diagnostic

- `q-tool-sep41-status-live`

The canonical SEP-41 preamble exists outside the tested Scout service surface.
This row measures a source-coverage boundary.

### Agent failure

- `q-aas-list-token-on-exchanges-aggregators`
- `q-aas-trusted-asset-list-whitelist`
- `q-ass-cross-bando-stablebonds-sac`
- `q-builder-by-scf-tier`
- `q-builder-content-by-person`
- `q-comp-finclusive-caas`
- `q-comp-yieldblox-oracle-incident`
- `q-crp-anchors-by-corridor`
- `q-crp-custodial-vs-noncustodial-wallets`
- `q-crp-oz-rwa-erc3643-trex`
- `q-crp-regional-offramp-mobilemoney`
- `q-crp-tokenize-personal-rwa`
- `q-defi-agent-identity-stellar-experimental`
- `q-defi-allbridge-what-is`
- `q-defi-aquarius-what-is`
- `q-defi-asset-whitespace-live`
- `q-defi-benji-franklin-templeton`
- `q-defi-blend-alternatives`
- `q-defi-blend-what-is`
- `q-defi-bridge-evm-to-stellar-axelar`
- `q-defi-category-funding-ratio-live`
- `q-defi-cluster-rollup-live`
- `q-defi-defindex-honest`
- `q-defi-etherfuse-stablebonds`
- `q-defi-liquid-staking-whitespace`
- `q-defi-market-making-kelp`
- `q-defi-named-newer-protocols`
- `q-defi-ondo-usdy`
- `q-defi-perps-whitespace`
- `q-defi-phoenix-what-is`
- `q-defi-provide-liquidity-impermanent-loss`
- `q-defi-reflector-oracle`
- `q-defi-soroswap-vs-stellarx`
- `q-defi-soroswap-what-is`
- `q-defi-streaming-payments-prior-art`
- `q-defi-tooling-whitespace-live`
- `q-eco-defi-market-map`
- `q-eco-defi-projects-discovery`
- `q-eco-dex-saturation`
- `q-eco-stellar-rwa-stablecoin-volume`
- `q-eco-xbull-wallet`
- `q-edge-deep-full-history-report`
- `q-edge-fresh-most-recent-news`
- `q-edge-scf-v7-centralization-myths`
- `q-gap-builders-person-empty`
- `q-gap-contracts-domain-empty`
- `q-gap-explainrepo-payload-ok`
- `q-gap-hackathon-brief-evidence-boundaries`
- `q-gap-hackathon-winner-order`
- `q-gap-scout-changelog-envelope`
- `q-gap-scout-get-skill-detail`
- `q-gap-scout-status-envelope`
- `q-gap-vet-pitch-vertical-null`
- `q-hist-soroban-launch-protocol20`
- `q-hist-unhcr-stellar-aid-assist`
- `q-hist-x402-stellar-announcement`
- `q-jutsu-cash-crypto-ramps`
- `q-org-mazieres-chief-scientist`
- `q-org-sdf-board-directors`
- `q-org-sdf-enterprise-fund`
- `q-org-sdf-mandate-buckets`
- `q-org-sdf-structure-mandate`
- `q-pay-travel-rule-aid-flows`
- `q-scf-ambassador-program`
- `q-scf-build-tracks`
- `q-scf-contract-verification-rfp-live`
- `q-scf-cross-decaf-sep24`
- `q-scf-current-hackathons-compare-live`
- `q-scf-ecosystem-listing-partner-jobs`
- `q-scf-instawards`
- `q-scf-nqg-voting`
- `q-scf-pitch-prep-live`
- `q-scf-resolve-passport-superseded-slug`
- `q-scf-rfp-tooling`
- `q-scf-rfps-hackathons-live`
- `q-scf-sdf-bug-bounty`
- `q-scf-submission-lifecycle-deadlines`
- `q-scf-v7-changes`
- `q-scf-verified-members`
- `q-scf-vs-sdf-enterprise-fund`
- `q-scout-hackathon-brief-first-hour`
- `q-sor-cross-socketfi-auth`
- `q-sor-reflector-integration-code`
- `q-soroban-auth-recursion-dos-audit`
- `q-soroban-greenfield-escrow-prior-art-preflight`
- `q-soroban-oracle-defensive-consumption`
- `q-soroban-reentrancy`
- `q-ti-block-explorer-basics`
- `q-ti-explain-repo-payload-status`
- `q-ti-scout-refresh-cached-rows`
- `q-ti-video-tutorials`
- `q-ti-vocab-project-categories-live`
- `q-ti-vocab-project-tags-live`
- `q-tool-cli-skills-discovery`
- `q-tool-greenfield-indexer-prior-art-preflight`
- `q-tool-indexer-repos-discovery`
- `q-tool-oracle-repo-live`
- `q-tool-sdk-repos-discovery`
- `q-tool-skill-detail-install`
- `q-tool-smart-wallet-repos-discovery`
- `q-tool-soroban-auth-audit-live`

## Correct-row coverage ledger

The following 73 correct grades stand after review.

- `q-ass-cross-etherfuse-cetes-controls`
- `q-asset-stablecoin-issuers-discovery`
- `q-builder-by-region-latam`
- `q-builder-justin-rice-history`
- `q-builder-lumenloop-regions-vocab`
- `q-builder-rust-soroban-devs`
- `q-comp-cross-bitso-sep31`
- `q-comp-cross-moneygram-partnership-sep24`
- `q-comp-security-disclosure-programs`
- `q-crp-dtcc-stellar-connection-plan`
- `q-crp-partner-detail-after-discovery`
- `q-crp-remittance-founder-advisory`
- `q-defi-category-saturation-live`
- `q-defi-comet-what-is`
- `q-defi-oracle-landscape-live`
- `q-defi-rwa-treasury-funding-live`
- `q-eco-freighter-wallet`
- `q-eco-hana-wallet-scf`
- `q-eco-most-active-defi-projects`
- `q-eco-nft-marketplace-whitespace`
- `q-eco-pyusd-stellar-freshness`
- `q-edge-closed-world-builder-directory-miss`
- `q-edge-exhaustive-defi-deep-report`
- `q-edge-factcheck-soroswap-first-amm`
- `q-edge-fresh-latest-scf-round`
- `q-edge-lumenloop-person-entity-empty`
- `q-edge-noinfo-exact-tvl-figure`
- `q-edge-open-world-recovery-after-narrow-miss`
- `q-edge-partner-detail-soft-empty`
- `q-edge-retail-everyday-use-eli5`
- `q-edge-strupey-ambiguous-stellar-history`
- `q-gap-av-offset-not-timestamp`
- `q-gap-compare-hackathons`
- `q-gap-leaderboard-project-not-builder`
- `q-gap-lumen-content-tag-vocabulary`
- `q-gap-lumen-documents-browse`
- `q-gap-lumen-exact-document-empty`
- `q-gap-lumen-project-tag-vocabulary`
- `q-gap-match-partners-degrade`
- `q-gap-related-projects-empty`
- `q-gap-scout-list-skill-directory`
- `q-gap-semantic-directory-fallback`
- `q-gap-semantic-similar-projects`
- `q-gap-upcoming-hackathon-fallback`
- `q-hist-cctp-stellar-live-announcement`
- `q-history-ecosystem-index-freshness-live`
- `q-hot-sdf-xlm-holdings-sales`
- `q-scf-build-award-cap`
- `q-scf-confidential-tokens-preview`
- `q-scf-cross-reflector-rounds-current`
- `q-scf-current-round`
- `q-scf-eligibility-criteria`
- `q-scf-funding-by-category`
- `q-scf-hackathon-compare-live`
- `q-scf-hackathons-active`
- `q-scf-history-soroswap`
- `q-scf-how-to-apply`
- `q-scf-hummingbot-kelp-closed-rfp`
- `q-scf-kale-winner-live`
- `q-scf-open-rfps`
- `q-scf-open-rfps-live`
- `q-scf-passkey-rfps-live`
- `q-scf-total-distributed`
- `q-soroban-instance-storage-dos`
- `q-soroban-sdk-cve`
- `q-ti-related-projects-from-content`
- `q-ti-scout-changelog-contract-check`
- `q-ti-vocab-content-tags-live`
- `q-ti-vocab-regions-live`
- `q-token-initial-supply-distribution`
- `q-tool-developer-leaderboard-live`
- `q-tool-passkey-repo-live`
- `q-tool-taxonomy-dispatch-live`

The nine disputed correct rows complete the correct-row ledger.

- `q-anchor-list-builders-discovery`
- `q-asset-rwa-tokenized-freshness`
- `q-defi-cross-blend-rivool-sac`
- `q-defi-lending-landscape-live`
- `q-hist-quantum-preparedness-plan`
- `q-scf-academic-research-grant`
- `q-scf-blend-winners-live`
- `q-tool-leaderboard-open-issues`
- `q-tool-zk-repo-live`

## Actionable patterns

### 1. Source boundaries collapse

Many answers treat directory tags, statuses, totals, and summaries as primary-source facts.
The answer must name the evidence boundary for each claim.
Directory metadata must not become protocol behavior, deployment proof, or verified history.

### 2. Current, scheduled, and historical facts merge

Several answers merge announcement dates, effective dates, event dates, and current state.
This pattern affects CME, Meridian, Soroban, CCTP, RWA, and other milestone questions.
The system needs typed dates and explicit state transitions.

### 3. Product and taxonomy layers merge

The answers mix LumenLoop categories with Scout types.
They also mix stablecoins, yield products, assets, relayers, channels, applications, and contracts.
Search results should state the service and taxonomy for every vocabulary value.

### 4. Completeness claims exceed the evidence

Answers use words such as `all`, `complete`, `top`, or `only` without a complete source.
Some answers ignore pagination, truncated results, or broad-query limits.
The answer should state the query scope before making a completeness claim.

### 5. Empty, null, and truncated results lose meaning

The answers often treat an empty result as proof of absence.
They also treat `null` as a negative fact.
Change-feed absence only proves no change when the response is not truncated.

### 6. Retrieved facts disappear from the answer

Some transcripts contain the required fact, but the final answer omits it.
This pattern appears in people, awards, dates, standards, and source-caveat cases.
A final grounding pass should compare the answer with each required fact.

### 7. Fabricated fields often come from inference

The answers infer missing dates, repo order, status, verticals, and product roles.
These inferred values then appear as source fields.
The answer must label inference and must not invent a source field.

### 8. Existing upstream findings explain recurring failures

Several failures match open LumenLoop and Scout findings.
The main clusters cover date semantics, lifecycle status, product identity, and historical series.
This lane did not file or change any finding.

## Conclusion

The shard grade distribution is 82 correct, 97 partial, and 27 wrong.
I dispute nine correct grades and two verdict rationales.
The dominant root cause is agent failure across 101 failed rows.
The strongest service gaps concern date semantics, lifecycle state, product typing, and missing history.
