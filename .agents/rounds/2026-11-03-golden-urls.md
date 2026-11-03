# Golden documentation URL repair — 2026-11-03

Lane: `urls`, Codex gpt-6.1-sol high. The lane used the `golden-truth` skill.

The lane rechecked the 21 URLs from the 2026-11-02 migration coverage result.
The check confirmed 11 HTTP 308 redirects and 10 HTTP 404 responses.
The lane repaired current sources in 19 active cases. Every question and golden stayed unchanged.
The full current-source check also found one redirect shared by three retail cases.
The final check returned HTTP 200 for all 249 current Stellar Docs source URLs.
No active source URL returned HTTP 404 or a redirect.

Three redirect targets also returned HTTP 404: recovery, contract-account fee sponsorship, and the nested SEP page.
The lane used current recovery-policy, transaction fee-sponsorship, and SEPs pages instead.
The MoneyGram redirect target provides an overview. The linked Stellar guide retains the integration details.
The lane removed the dead author index from current sources. Dated meeting pages preserve the answer.
Five input cases already had repaired current sources. The lane confirmed those repairs without changing their metadata.

Class A public pages support the replacement decisions.
Class B CAPs, Core, CLI, and pinned MPP sources corroborate protocol, numeric, and version details.
Class F live Horizon roots confirm all three exact passphrases.
Each changed case records live URLs, HTTP statuses, the verifier, and `freshness-drift`.
The provenance records use `2026-11-03` and `lane urls (Codex gpt-6.1-sol high)`.

The sibling sweep covered 11 topics. It also compared all 53 members of 13 reopened consistency groups.
Every member retained identical questions, goldens, tags, and surfaces compared with HEAD.
The register helper applied the source-only consistency review and passed its check.

Changed cases:

- `q-crp-export-tx-history-taxes`
- `q-crp-remittance-founder-advisory`
- `q-smart-wallet-fee-sponsorship`
- `q-crp-custodial-vs-noncustodial-wallets`
- `q-raph-merchant-payments`
- `q-raph-offramp-xlm-usdc`
- `q-jutsu-cash-crypto-ramps`
- `q-soroban-simulate-resource-fee`
- `q-zk-nullifier-storage`
- `q-defi-sdex-offer-lifecycle`
- `q-protocol-cap-vs-sep`
- `q-protocol-network-passphrases-list`
- `q-ti-enumerate-all-contracts`
- `q-builder-content-by-person`
- `q-asset-deploy-sac-cli`
- `q-anchor-moneygram-ramps`
- `q-sep6-sep24-sep31-choice`
- `q-asset-path-payment-ops`
- `q-edge-noinfo-stellar-pos-staking-rewards`

Gates passed: `eval:qa:compile`, `eval:qa:register`, diff-aware stale/floor lint, register check, and `npm test`.
The lint returned zero errors and 92 warnings. Tests passed in 144 files, with three expected failures.
The final page check, secret scan, and whitespace check passed. No `ps` EPERM test failures occurred.
The lane used no paid calls, credentials, Wrangler processes, or sub-agents.
The coordinator owns any commit and independent review.

Working evidence: `tmp/urls/REPORT.md`, `decisions.json`, `initial-live.json`, `page-coverage.json`, and `evidence-index.json`.
The lane supplied this ledger and TODO closure as `tmp/urls/todo.patch` because `.agents/` is read-only.
The public-site check disables redirects. Public Markdown reads verify content without the authenticated Mintlify API.
