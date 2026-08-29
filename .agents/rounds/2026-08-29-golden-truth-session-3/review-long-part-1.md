# Review part 1 — long-fact batch, chunks 00–16 (Grok)

Date: 2026-08-29
Lane: read-only. Wrote only this file. Did not edit cases. Formed a view from `git diff origin/main` per case, then read the sol-a/b/c matrices.

Scope: 68 cases. Authors: gt3-sol-a/b/c. No answer, notes, avoid, asOf, corroboration, or source-array edits in this batch. Dead `/tmp/.../conversions-copy-review.md` lines were replaced on the files that already carried them.

Spot-check: fetched the first live re-check URL on each rewritten case (2026-08-29). Most returned HTTP 200. Exceptions are in FAIL rows.

## Table

| id | PASS/FAIL | finding |
|---|---|---|
| q-aas-claim-received-claimable-balances | PASS | Split two long facts; endpoint wording remains in the answer. Verified 2026-08-29, gt3-sol-a. Horizon claimant filter 200. |
| q-aas-list-token-on-exchanges-aggregators | FAIL | Old tradability fact is disjunctive (`SDEX offers, AMM pools, or listings`). New keyFacts `[2]` and `[3]` both start with `Requires`, so both legs become mandatory. Matrix `Claims kept` is false. `stellar.toml`/explorer remain in the answer. Replacement for `[2]`+`[3]`: `Tradability needs SDEX offers, AMM pools, or wallet/exchange/aggregator listings.` (81). Drop the extra required-listings fact. |
| q-aas-sep30-recoverable-wallets | PASS | Split custody vs signer role. `not magic key reset` remains in the answer and avoid. SEP-30.md 200. |
| q-aas-trusted-asset-list-whitelist | PASS | Split the evaluation list. `official`/`single` remain in the answer. SEP-42 200. |
| q-aas-trustline-limit-lifecycle | PASS | Split `op_invalid_limit` and removal. Change-trust docs 200. |
| q-anchor-endpoint-discovery | PASS | Directory-vs-toml contrast remains in the answer. SEP-24.md 200. |
| q-anchor-list-builders-discovery | PASS | Shortened authoring facts. Dead Fable path replaced. Anchors page 200. |
| q-anchor-moneygram-ramps | PASS | `implementation`/`on Stellar` remain in the answer. MoneyGram guide 200. |
| q-anchor-platform-what | PASS | Split role, SEP list, and three repos. Anchor-platform repo 200. |
| q-anchor-sdp-vs-anchor-platform | PASS | Split SDP; left Wallet SDK SEP-31 fact unchanged with `CONFLICT` in case evidence. Anchor Platform page 200. |
| q-ass-cross-bando-stablebonds-sac | PASS | Split Scout and SAC claims. bando.cool 200. |
| q-asset-claimable-balance | PASS | Split definition. Claimable-balances guide 200. |
| q-asset-deploy-sac-cli | FAIL | Split CLI/SDK vs no-new-contract. Left `CONTRACT_ID_FROM_ASSET` unchanged with CONFLICT (correct). Both live re-check URLs 404: `https://developers.stellar.org/docs/build/guides/cli/deploy-stellar-asset-contract`. Claims still hold at `https://developers.stellar.org/docs/tools/cli/cookbook/deploy-stellar-asset-contract` (`stellar contract asset deploy`; no new token contract). No keyFact change. Replace the evidence URLs. |
| q-asset-path-payment-ops | FAIL | Routing fact adds abbreviation `SDEX` (old keyFact said `DEX orderbook` / `AMM pools`). Three live re-checks hit 404 `.../encyclopedia/transactions-specialized/path-payments`. Claim is on `https://developers.stellar.org/docs/build/guides/transactions/path-payments`. Replacement for `[2]`: `Routes through the DEX order book, AMM pools, or both.` (54). |
| q-asset-rwa-tokenized-freshness | PASS | Shortened authoring fact. Messari 429 here; facts match the existing dated answer. Dead Fable path replaced. |
| q-asset-stablecoin-issuers-discovery | PASS | Shortened authoring fact. Circle product page 200. |
| q-asset-trustline-basics | PASS | Split ChangeTrust + reserve. Accounts/trustlines page 200. |
| q-asset-two-account-issuer | FAIL | Matrix Result `CONFLICT` (issuer cannot hold its own asset vs `holds/creates supply`) and left the 126-char fact unchanged — correct under the worker rules. Case file was not stamped: `truth.verified.date` is still `2026-07-11`, no worker `by`, no live re-check, no sibling sweep, no long-fact rootCause. Stamp verified; copy the matrix CONFLICT into evidence. Do not rewrite the disputed fact in this batch. After conflict resolution, split to: `The issuing account creates supply and manages auth flags.` (58) and `The distribution account is public-facing and sends to users.` (61). |
| q-asset-usdc-eurc-path-fx | PASS | Split path vs atomic delivery. Operations page 200. |
| q-asset-wallet-sdk-seps | PASS | Shortened library fact. Left SEP-31 wrap list unchanged; matrix CONFLICT vs the TS tree (no Sep31 client). Sibling sweep in the case file records the same. Repo 200. |
| q-builder-by-region-latam | PASS | Split sourcing/attribution. Scout builders API 200. Dead Fable path replaced. |
| q-builder-content-by-person | PASS | Split sourcing. Author page 200. |
| q-builder-lumenloop-regions-vocab | PASS | Split sourcing; free-text vs enum kept. get_regions 200. Dead Fable path replaced. |
| q-comp-auth-flags-overview | PASS | Shortened AUTH_REQUIRED and AUTH_CLAWBACK_ENABLED. control-asset-access.mdx 200. |
| q-comp-clawback-cap0035 | PASS | Split burn vs cooperation; flags kept. Clawbacks guide 200. |
| q-comp-clawback-holder-risk | PASS | Split framing; fraud/sanctions examples remain in the answer. CAP-0035 200. |
| q-comp-cross-bitso-sep31 | FAIL | Split SEP-31/24 correctly, but new `[4]` is a presentation demand (`Does not assert unlisted SEP support for Bitso.`). Move it to avoid. Replacement avoid: `Do NOT assert unlisted SEP support for Bitso.` (45). Keep `[3]` as the SEP-24 contrast. Scout Bitso search 200. |
| q-comp-cross-moneygram-partnership-sep24 | PASS | Split event, Scout role, SEP-24. `anchor` remains in the answer. MoneyGram press index 200. |
| q-comp-security-disclosure-programs | PASS | Shortened Immunefi/Audit Bank. Left HackerOne intake fact unchanged with CONFLICT. Immunefi 200. |
| q-crp-become-an-anchor-licensing | FAIL | Dropped the `not X` tail `rather than assuming one anchor license`. It is not in the new keyFact, answer, or avoid (`one universal SEP or licensing stack` is a different claim). Matrix `Claims kept` overstates this. Replacement for `[3]`: `Classifies entities and activities instead of assuming one anchor license.` (74). Anchors page 200. Dead Fable path replaced. |
| q-crp-custodial-vs-noncustodial-wallets | PASS | Tightened custody definitions; remittance/SEP-31 remain in the answer. Wallet overview 200. Dead Fable path replaced. |
| q-crp-export-tx-history-taxes | PASS | Shortened retention/RPC/export facts. Horizon docs 200. Dead Fable path replaced. |
| q-crp-regional-offramp-mobilemoney | PASS | Named rails kept. MoneyGram ramps docs 200. Dead Fable path replaced. |
| q-crp-remittance-founder-advisory | PASS | Corridor list, USDC/XLM default, and examples remain in the answer. Anchors page 200. Dead Fable path replaced. |
| q-crp-tokenize-personal-rwa | PASS | Lifecycle enumeration remains in the answer. SAC URL 200; SEC 403 from this fetch (bot). Dead Fable path replaced. |
| q-defi-agent-identity-stellar-experimental | PASS | Split ERC-8004 scope; `external` remains in the answer. EIP-8004 200. Dead Fable path replaced. |
| q-defi-agentic-payment-standards-compare | PASS | `available/draft`, ACP non-rail, and charge/session remain in the answer/avoid. SEP-41.md 200. Dead Fable path replaced. |
| q-defi-benji-franklin-templeton | PASS | Split BENJI/FOBXX/2021 claims. Press release 200. |
| q-defi-bridge-evm-to-stellar-axelar | PASS | Split no-safety-guarantee. Axelar security 200. Dead Fable path replaced. |
| q-defi-build-staking-for-own-token | PASS | Split layer/rewards/primitives. SCP page 200. |
| q-defi-category-funding-ratio-live | PASS | Left `fundedCount/size` unchanged with CONFLICT (`scfFundedCount/size`). Denominator mixing remains in the answer. Clusters API 200. |
| q-defi-comet-what-is | PASS | Standalone-adoption guard remains in answer/avoid. Blend deployments 200. |
| q-defi-cross-blend-rivool-sac | PASS | Shortened Blend/SAC facts. Scout Blend search 200. |
| q-defi-defindex-honest | PASS | `no figure exists` remains in avoid. defindex.io 200. |
| q-defi-market-making-kelp | PASS | Cancel/update/repositioning remains in the answer. kelp repo 200. Dead Fable path replaced. |
| q-defi-named-newer-protocols | PASS | Shortened authoring fact. fxdao.io 200. Dead Fable path replaced. |
| q-defi-skill-ecosystem-scout | PASS | Dropped `discovery` from keyword list only. Pinned SKILL.md 200. |
| q-defi-tooling-whitespace-live | PASS | Real-world-absence guard remains in avoid. Clusters API 200. |
| q-defi-x402-on-stellar-what | PASS | Authorization-entry and facilitator-sponsored roles remain in the answer. x402 docs 200. Dead Fable path replaced. |
| q-eco-defi-projects-discovery | PASS | Split roster contract. Scout DeFi search 200. |
| q-eco-hana-wallet-scf | PASS | Split identity vs $132,000 rows. hana.money 200. |
| q-eco-most-active-defi-projects | PASS | Shortened authoring fact. Leaderboard timed out here; same Scout host returned 200 on sibling probes. Dead Fable path replaced. |
| q-eco-nft-marketplace-whitespace | PASS | Split Litemint vs Rarible. litemint.com 200. |
| q-eco-pyusd-stellar-freshness | PASS | Shortened authoring fact. PYUSD press 200. Dead Fable path replaced. |
| q-eco-stablecoins-on-stellar | PASS | Shortened authoring fact. Scout stablecoins 200. |
| q-eco-stellar-wallets-list | PASS | Directory Live vs availability remains in avoid. Scout wallet search 200. Dead Fable path replaced. |
| q-edge-closed-world-builder-directory-miss | PASS | Closed-world scope kept. Scout Strupey query 200. |
| q-edge-deep-full-history-report | PASS | Bounded-history fact shortened. Introducing Stellar 200. |
| q-edge-exhaustive-defi-deep-report | PASS | `not exhaustive` remains in the answer. DeFi landscape post 200. |
| q-edge-fresh-latest-blend-tvl | PASS | Shortened authoring fact. DefiLlama Blend 200. Dead Fable path replaced. |
| q-edge-fresh-latest-protocol-version | PASS | Shortened authoring fact. Horizon ledgers 200 (Protocol 27). Dead Fable path replaced. |
| q-edge-inject-ignore-instructions | PASS | Split SEP-10/45 and disclosure refusal. SEP-10.md 200. |
| q-edge-lumenloop-person-entity-empty | PASS | Split open-world recovery. Live re-check used class B catalog/tools paths (no HTTP URL). |
| q-edge-metamask-evm-mental-model | PASS | Split pathway and asset-model lists; contrast remains across the five facts plus avoid. MetaMask non-EVM page 200. |
| q-edge-noinfo-exact-tvl-figure | PASS | Shortened TVL-method fact. DefiLlama chains 200. Dead Fable path replaced. |
| q-edge-noinfo-stellar-native-privacy-default | PASS | Split shielded-by-default vs ordinary transparency. Privacy docs 200. Dead Fable path replaced. |
| q-edge-noinfo-stellar-pos-staking-rewards | PASS | Split yield-source vs LST bound. SCP page 200. |
| q-edge-oos-bitcoin-price-prediction | PASS | Split no-forecast vs alternative. FINRA risks 200. |

## Counts

- PASS: 62
- FAIL: 6
- CONFLICT left in place (allowed): q-anchor-sdp-vs-anchor-platform, q-asset-deploy-sac-cli (`CONTRACT_ID_FROM_ASSET`), q-asset-wallet-sdk-seps, q-comp-security-disclosure-programs, q-defi-category-funding-ratio-live, q-asset-two-account-issuer (matrix only; case stamp missing)

## VERDICT: APPROVE-WITH-FIXES

Apply the six FAIL replacements above. Do not treat the allowed CONFLICT long facts as this-batch form failures except `q-asset-two-account-issuer`, which still needs a `truth.verified` stamp.
