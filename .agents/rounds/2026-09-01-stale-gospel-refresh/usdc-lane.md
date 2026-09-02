# Testnet USDC funding matrix

Case: `q-ti-testnet-usdc-faucet`.

Current as-of date: **2026-09-01**.

Recommended next `reverifyBy`: **2026-12-01**.

Scope: read-only research. No faucet request occurred. No value-changing endpoint occurred. No paid Lumenloop call occurred.

## Source ledger

| ID | Class | URL | Observed | Short evidence excerpt |
| --- | --- | --- | --- | --- |
| S1 | A — Stellar official docs | https://developers.stellar.org/docs/networks | 2026-09-01 | “Friendbot … funds accounts and contracts with fake XLM.” |
| S2 | A — Stellar official docs | https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts | 2026-09-01 | “Accounts can only exist … [with] minimum balance of XLM.” |
| S3 | B — Stellar Core source | https://github.com/stellar/stellar-core/blob/master/src/transactions/ChangeTrustOpFrame.cpp | 2026-09-01 | New trustlines set `tl.balance = 0` before creation. |
| S4 | A — Circle official docs | https://developers.circle.com/stablecoins/quickstarts/transfer-usdc-stellar | 2026-09-01 | “You need the following Stellar Testnet USDC issuer address.” |
| S5 | A — Circle official addresses | https://developers.circle.com/stablecoins/usdc-contract-addresses | 2026-09-01 | `Stellar Testnet` lists `USDC-GBBD47…FLA5`. |
| S6 | C — Circle live service surface | https://faucet.circle.com/ | 2026-09-01 | The network list includes `Stellar Testnet`. |
| S7 | C — Horizon public read | https://horizon-testnet.stellar.org/accounts/GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5 | 2026-09-01 | The account exists and reports `home_domain: "centre.io"`. |
| S8 | B — Stellar protocol source | https://github.com/stellar/stellar-protocol/blob/master/core/cap-0046-06.md | 2026-09-01 | “contractID … is deterministic” from an `Asset` preimage. |
| S9 | A — Stellar official docs | https://developers.stellar.org/docs/tokens/stellar-asset-contract | 2026-09-01 | “An asset … and its SAC represent the same asset.” |
| S10 | C — Circle live service surface | https://faucet.circle.com/ | 2026-09-01 | “Send 20 USDC”; “every 2 hours, per address, and per blockchain.” |
| S11 | B — independent published client source | https://github.com/vyperlang/circle-titanoboa-sdk | 2026-09-01 | “20 USDC (every 2 hours per address per network).” |
| S12 | A — Stellar Lab live page | https://lab.stellar.org/account/fund | 2026-09-01 | “fund … account … with XLM” and “To fund assets … add a trustline.” |
| S13 | D — dated web sweep | `parallel-cli` result `/tmp/stellar-lab-usdc-evidence.json` | 2026-09-01 | The Lab sweep found no current Lab USDC distribution or path-payment faucet. |

S3 was read from the current public raw source. The applicable excerpt sets a new trustline balance to zero.

S7 was a public `GET` request only. It did not submit a transaction or claim funds.

S10 was an unauthenticated page read. The faucet form was not submitted.

## Claim matrix

| # | Claim | Domain | Independent evidence | Verdict | Required gospel change |
| --- | --- | --- | --- | --- | --- |
| 1 | Friendbot funds fake Testnet XLM. It does not fund USDC. | real-world | S1 (A) says Friendbot provides fake XLM. S4 (A) uses Friendbot for XLM, then requires a separate USDC source. S3 (B) confirms a trustline is not a credit. | confirmed | None. Keep the Friendbot/XLM-only boundary. |
| 2 | A classic account needs XLM for activation, fees, and the trustline reserve. | real-world | S2 (A) requires an XLM minimum balance. S3 (B) returns `CHANGE_TRUST_LOW_RESERVE` during trustline creation. | confirmed | None. Do not pin a reserve amount. |
| 3 | A USDC trustline permits holding USDC. It does not credit USDC. | real-world | S2 (A) calls a trustline an opt-in to hold an asset. S3 (B) initializes `tl.balance = 0`. | confirmed | None. Keep the explicit non-credit statement. |
| 4 | Testnet USDC uses code plus the issuer `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`. | freshness-sensitive | S4 and S5 (A) list the same Stellar Testnet issuer. S7 (C) confirms that public account exists. | confirmed | Change the answer-visible as-of date from **2026-07-11** to **2026-09-01**. Refresh `truth.asOf`. |
| 5 | Circle's public faucet supports Stellar Testnet USDC. | freshness-sensitive | S6 (C) lists `Stellar Testnet`. S4 (A) names Circle Faucet as the Testnet USDC funding source. | confirmed | Change the answer-visible as-of date to **2026-09-01**. No wording change is required. |
| 6 | The current public faucet UI offers 20 USDC per address and blockchain every two hours. | freshness-sensitive, numeric | S10 (C) states both the amount and limit. S11 (B) independently records the same limit. | confirmed | Keep this as a dated, non-gating observation. Change its observation date to **2026-09-01**. |
| 7 | Circle faucet payment and a current SDF/Lab path-payment demo are distinct USDC distribution paths. | freshness-sensitive | S12 (A) shows only XLM Friendbot funding on the current Lab fund page. S13 (D) found no current Lab USDC distribution or path-payment demo. | unverifiable | Remove the Lab path-payment-demo assertion. Keep only the durable boundary: a separate USDC payment may credit an established trustline. Revise the matching key fact and notes. |
| 8 | The classic issuer/trustline and its SAC C-address represent one asset. The SAC is deterministic and not wrapped. | real-world | S9 (A) says no bridge or intermediary token is needed. S8 (B) derives the contract ID from the `Asset` preimage. | confirmed | None. Keep this judge-facing distinction. |
| 9 | Testnet USDC has no Mainnet redemption value. Testnet endpoints and assets must remain separate. | real-world | S1 (A) says Testnet does not connect to real money. S10 (C) describes testnet tokens as test assets without real-world value. | confirmed | None. Keep the network and value warning. |

## Case result

**Overall verdict: unverifiable.**

Claims 1 through 6 and 8 through 9 are confirmed on 2026-09-01.

Claim 7 is unverifiable. Current official Lab evidence does not show the asserted distribution demo.

A judge-facing change is required for claim 7.

The remaining claims need no judge-facing change beyond the dated issuer and faucet observation refresh.

Recommended metadata changes after reconciliation:

- Set `truth.asOf` to `2026-09-01`.
- Set `truth.reverifyBy` to `2026-12-01`.
- Record S1 through S13 in the case provenance.
- Set the claim-7 corroboration verdict to `unverifiable`.
- Do not retain a named Lab path-payment distribution claim without new primary evidence.

## Sibling-case sweep

Search terms used:

- `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`
- `Circle Faucet`
- `testnet USDC`
- `Friendbot`
- `deterministic SAC`
- `Stellar Asset Contract`

Relevant siblings:

- `q-ti-friendbot-ratelimit-alternatives`
- `q-ti-stellar-lab-usage-and-new-ui`
- `q-tool-lab-what-is`
- `q-infra-testnet-vs-futurenet`
- `q-asset-trustline-vs-sac`
- `q-asset-deploy-sac-cli`
- `q-sor-contract-trustlines-c-address`
- `q-asset-usdc-eurc-issuer`

No sibling contradicts the Friendbot, trustline, issuer, Testnet, or SAC findings.

`q-ti-stellar-lab-usage-and-new-ui` also says a trustline does not credit units.

No sibling establishes a current Lab USDC path-payment distribution demo.

## Reverification trigger

Reverify earlier than 2026-12-01 if Circle changes its faucet UI, listed networks, issuer list, or rate-limit text.

Reverify earlier if Stellar changes Friendbot funding or SAC/trustline protocol semantics.
