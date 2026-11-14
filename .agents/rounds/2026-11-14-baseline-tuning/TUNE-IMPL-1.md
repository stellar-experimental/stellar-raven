# Tuning loop 1: implementation record

Implementer: Claude Sonnet 5.5 (`claude-sonnet-5-5`), branch `tune/loop-1`, from `origin/main` at
`6ce86dce`. Inputs: [`TUNING-PLAN.md`](TUNING-PLAN.md), [`TUNING-PLAN-REVIEW.md`](TUNING-PLAN-REVIEW.md),
[`TUNING-PLAN-AMENDMENTS.md`](TUNING-PLAN-AMENDMENTS.md) (A1 to A9, A11; A2 and A5 appended from the
review in the first commit of this branch). Free work only: no model call, no paid run. The
orchestrator authorizes each run in the ledger after an independent reviewer reads the diffs.

## 1. Exposure scan and the 50-row panel (amendment A3)

Script: `eval/qa/scan-tuning-exposure.mjs` (test: `test/tuning-exposure-scan.test.mjs`).
Command, run from the repository root:

```sh
node eval/qa/scan-tuning-exposure.mjs \
  --split ~/backups/gca-2026-11-14-split-v2.json \
  --results eval/qa/results/2026-11-14T20-13-51-variantA.json   # the gca-eval worktree's copy
```

Hygiene (A9): the script reads `sets.tuning` from the split and nothing else, selects the results
rows by that id list before it reads any other field, and asserts 79. Its test proves a row outside
the set is never read past its id. No held-out or reserve row was opened.

Definitions (A3): arm 1 exposed is any `stellarDocs.search_*` call with no `stellarDocs.get_doc_page`
in any script of the row. Arm 2 exposed is a `scout.searchResearch` query that contains a
letters-plus-digits identifier (`[A-Za-z]{2,}`, an optional hyphen or space, digits). A query held in
a variable (`qs.map(q => searchResearch({ q }))`) cannot be read directly; the string literals of
the same script stand in, and the cell says "(inferred)". That match is loose by A3's wording: it
also matches `burn 50`, `USDT0`, `issue 842`, `Tier 1`, `ERC-8004`. Only a direct match makes a
non-target row an "A2 rule fires" row.

Panel rules the script applies, from the plan: targets are the plan's named rows; "A2 rule fires" is a
non-target row with a direct identifier match; baseline-correct rows are controls, exposed when arm 1
or arm 2 exposure is true; baseline-partial rows in `soroban` or `tooling-infra` are priority partials
when a Docs search with no page read or a research call is present. The four rows PR 442 edited
(`q-token-xlm-supply-total-circulating`, `q-scf-hackathons-active`, `q-infra-testnet-vs-futurenet`,
`q-raph-stolen-wallet-recovery`) stay out of the panel, as in the plan's "left out" list.

Result: the scan reproduces the plan's 48 rows with the plan's roles, changes exactly the three
cells that A3 names (`q-sep6-sep24-sep31-choice` and `q-nft-vault-contract-standards` Docs "yes",
`q-protocol-tier1-requirements` research "yes"), and adds exactly `q-soroban-vuln-classes` and
`q-soroban-oz-token` as priority partials. 50 rows, 24 correct, 23 partial, 3 wrong, as A3 states.

Review's reproduced numbers: 56 arm 1 exposed rows (the review's 56), 10 Docs-searching rows read a
page of 66 (the A7 figure), 26 rows call research.

Notes for the reviewer:

- `q-protocol-version-history-list` (partial, protocol-core) has research queries naming CAP ids
  only through variables, so its match is inferred, not direct. It is not an "A2 rule fires" row
  under the script's rule, which keeps the panel at A3's 50. If the orchestrator wants it, the panel
  is 51 rows and the per-run cap USD 12.75.
- `q-token-xlm-supply-total-circulating` has a direct loose match (`burn 50`), is a PR 442 row, and
  is out of the panel for that reason. A11's sentence about the four edited cases applies only if
  one of them is added.

### Scan output

Tuning rows scanned: 79 (asserted 79).
Arm 1 exposed (a `stellarDocs.search_*` call and no `get_doc_page`): 56 of 79.
Docs-searching rows that read a page: 10; Docs-searching rows in all: 66.
Rows that called `scout.searchResearch`: 26.
Arm 2 exposed (a research query holds a letters-plus-digits identifier): 12, 8 from a string literal in the call and 4 inferred from the script's literals.
Panel: 50 rows (24 correct, 23 partial, 3 wrong).

| Case | Role | Category | Baseline | Docs search, no page read | Research called | Identifier in research query |
|---|---|---|---|---|---|---|
| `q-infra-rpc-methods-list` | A1 target | tooling-infra | partial | yes | no | no |
| `q-pc-account-activation-not-found` | A1 target | protocol-core | partial | yes | no | no |
| `q-pc-cross-redstone-sep40` | A1 target | protocol-core | partial | yes | no | no |
| `q-pc-sequence-numbers-ordering-replace` | A1 target | protocol-core | partial | yes | no | no |
| `q-smart-wallet-fee-sponsorship` | A1 target | compliance-rwa-payments | partial | yes | no | no |
| `q-soroban-cli-bindings` | A1 target | soroban | wrong | yes | no | no |
| `q-soroban-contract-id-derivation` | A1 target | soroban | partial | yes | no | no |
| `q-ti-classic-submission-errors` | A1 target | tooling-infra | partial | yes | no | no |
| `q-sep-45-contract-auth` | A1 and A2 target | assets-anchors-seps | partial | yes | no | no |
| `q-crp-oz-rwa-erc3643-trex` | A2 target | compliance-rwa-payments | wrong | yes | no | no |
| `q-edge-factcheck-soroswap-first-amm` | A2 target | edge-behavior | correct (trap) | no | no | no |
| `q-net-protocol-meeting-notes-find-cap` | A2 target | protocol-core | partial | yes | no | no |
| `q-nft-vault-contract-standards` | A2 target | assets-anchors-seps | partial | yes | no | no |
| `q-protocol-ledger-close-time` | A2 target | protocol-core | partial | yes | no | no |
| `q-sep-43-web-wallet-api` | A2 target | assets-anchors-seps | wrong | yes | yes | SEP-43 |
| `q-sep-53-sign-verify-message` | A2 target | assets-anchors-seps | partial | yes | yes | SEP-53 |
| `q-sep6-sep24-sep31-choice` | A2 target | assets-anchors-seps | partial | yes | no | no |
| `q-pc-sponsored-reserves` | A2 rule fires | protocol-core | partial | yes | yes | CAP-33 |
| `q-asset-usdt0-layerzero-oft` | control, exposed | assets-anchors-seps | correct | yes | yes | USDT0 |
| `q-comp-aml-analytics-vendors` | control, exposed | compliance-rwa-payments | correct | yes | yes | SEP-12 (inferred) |
| `q-comp-sep8-regulated-assets-approval-server` | control, exposed | compliance-rwa-payments | correct | yes | no | no |
| `q-defi-agent-identity-stellar-experimental` | control, exposed | defi-ecosystem | correct | yes | yes | ERC-8004 (inferred) |
| `q-defi-agentic-payment-standards-compare` | control, exposed | defi-ecosystem | correct | yes | no | no |
| `q-edge-asset-site-scam-detection` | control, exposed | edge-behavior | correct | yes | yes | SEP-1 |
| `q-edge-inject-ignore-instructions` | control, exposed | edge-behavior | correct (trap) | yes | no | no |
| `q-edge-noinfo-stellar-native-privacy-default` | control, exposed | edge-behavior | correct (trap) | yes | no | no |
| `q-n3-issues-842-backup-faucet-wallet` | control, exposed | edge-behavior | correct (trap) | yes | yes | issue 842 |
| `q-n3-pi-network-wrong-chain` | control, exposed | edge-behavior | correct (trap) | yes | yes | no |
| `q-pc-quantum-preparedness-dormant` | control, exposed | protocol-core | correct | yes | no | no |
| `q-protocol-tier1-requirements` | control, exposed | protocol-core | correct | yes | yes | Tier 1 |
| `q-scf-instawards` | control, exposed | scf-grants-builders | correct | yes | yes | no |
| `q-sep24-interactive-deposit-flow` | control, exposed | assets-anchors-seps | correct | yes | no | no |
| `q-smart-account-scoped-policy-signers` | control, exposed | soroban | correct | yes | yes | no |
| `q-soroban-reentrancy` | control, exposed | soroban | correct | yes | yes | no |
| `q-zk-host-functions-status` | control, exposed | soroban | correct | yes | no | no |
| `q-aas-trustline-limit-lifecycle` | control, unexposed | assets-anchors-seps | correct | no | no | no |
| `q-asset-usdc-eurc-issuer` | control, unexposed | retail-consumer | correct | no | no | no |
| `q-edge-oos-solana-vs-aptos` | control, unexposed | edge-behavior | correct (trap) | no | no | no |
| `q-hot-fee-pool-burn-deflation` | control, unexposed | history-org-tokenomics | correct | no | no | no |
| `q-infra-which-indexer` | control, unexposed | tooling-infra | correct | no | no | no |
| `q-sor-custom-errors-find-failure-cause` | control, unexposed | soroban | correct | no | no | no |
| `q-sor-deploy-invoke-from-js-sdk` | priority partial | soroban | partial | yes | no | no |
| `q-soroban-check-auth-custom-account` | priority partial | soroban | partial | yes | no | no |
| `q-soroban-oz-token` | priority partial | soroban | partial | yes | no | no |
| `q-soroban-pre-mainnet-security-steps` | priority partial | soroban | partial | no | yes | no |
| `q-soroban-storage-types` | priority partial | soroban | partial | yes | no | no |
| `q-soroban-vuln-classes` | priority partial | soroban | partial | yes | yes | no |
| `q-ti-enumerate-holders-airdrop` | priority partial | tooling-infra | partial | yes | no | no |
| `q-ti-parse-raw-ledger-data` | priority partial | tooling-infra | partial | yes | no | no |
| `q-tool-js-sdk-package` | priority partial | tooling-infra | partial | yes | no | no |
