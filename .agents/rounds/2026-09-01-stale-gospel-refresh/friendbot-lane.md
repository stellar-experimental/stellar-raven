# Friendbot funding verification matrix

Case: `q-ti-friendbot-ratelimit-alternatives`  
Research date: 2026-09-01  
Method: read-only primary-page, public-source, protocol, and web-search checks.  
No faucet, payment, or paid Lumenloop endpoint was called.

## Case result

**Confirmed as of 2026-09-01.**  
The golden keeps valid distinctions between native XLM, Testnet USDC, Quickstart local mode, and Futurenet.  
The sources do not support a public Friendbot numeric quota.  
The sources also do not verify an SDF backup-faucet wallet.

**No judge-facing change is needed.**  
The present `429` wording is conditional.  
It does not say that Friendbot must return `429`.

Recommended `truth.asOf`: `2026-09-01`.  
Recommended `truth.reverifyBy`: `2026-12-01`.

## Claim matrix

| Claim | Verdict | Evidence | Required gospel action |
| --- | --- | --- | --- |
| Public Testnet Friendbot is rate limited. | **Confirmed.** | A, [Stellar Networks](https://developers.stellar.org/docs/networks), observed 2026-09-01: “Requests are rate limited.” B, [Friendbot router source](https://github.com/stellar/friendbot/blob/main/main.go), observed 2026-09-01: the public handler has one `GET` and one `POST` route. Its checked configuration fields contain no public rate quota. | Keep the rate-limit statement. Do not add a numeric quota. |
| No durable official requests-per-hour quota is corroborated. | **Confirmed.** This is an as-of, source-relative negative finding. | A, [Stellar Networks](https://developers.stellar.org/docs/networks), observed 2026-09-01: it says requests are rate limited but gives no request-window value. B, [Friendbot README and configuration reference](https://github.com/stellar/friendbot), observed 2026-09-01: it documents endpoint, balance, and service configuration, but no public request quota. D, `/tmp/friendbot-rate-sweep.json`, observed 2026-09-01: the targeted current-source sweep found no SDF numeric quota. | Keep the non-numeric formulation. Do not treat source absence as a promise that a quota cannot change. |
| A client can honor `Retry-After` after a `429`, or use bounded backoff with jitter. | **Confirmed** for the conditional HTTP rule. The Friendbot-specific status code is **disputed**. | B, [RFC 6585 section 4](https://www.rfc-editor.org/rfc/rfc6585#section-4), observed 2026-09-01: `429` means rate limiting and “MAY include a Retry-After header.” B, [RFC 9110 section 10.2.3](https://www.rfc-editor.org/rfc/rfc9110#section-10.2.3), observed 2026-09-01: `Retry-After` gives the wait before a follow-up request. A, [Circle's Stellar trustline guide](https://developers.circle.com/stablecoins/quickstarts/setup-usdc-trustline-stellar), observed 2026-09-01: “Friendbot funding failed: 400” for its rate-limit example, then “Wait a few seconds.” | Keep the conditional wording. Do not make `429`, `Retry-After`, or jitter a Friendbot-specific invariant. Do not add an avoid clause that rejects a dated `400` report. |
| Clients must not rotate IPs or hammer retries. | **Confirmed** as safe operational guidance. | B, [RFC 6585 section 4](https://www.rfc-editor.org/rfc/rfc6585#section-4), observed 2026-09-01: the specification does not define how a service identifies or counts a client. A, [Stellar Networks](https://developers.stellar.org/docs/networks), observed 2026-09-01: “Requests are rate limited, so use wisely.” | Keep this safety guidance. It is not a numeric-limit claim. |
| Fund one public-Testnet account, then create and fund additional accounts with normal operations. | **Confirmed.** | A, [Stellar Networks](https://developers.stellar.org/docs/networks), observed 2026-09-01: “fund your first account with Friendbot, then use that account to fund subsequent accounts using the Create Account operation.” B, [CreateAccount operation source semantics](https://stellar.github.io/js-stellar-base/operations_create_account.js.html), observed 2026-09-01: the operation creates and funds a nonexistent account with the supplied XLM starting balance. | Keep. No amount belongs in the golden because the necessary balance can change. |
| Quickstart local mode has a local Friendbot. | **Confirmed.** | A, [Quickstart Faucet](https://developers.stellar.org/docs/tools/quickstart/faucet), observed 2026-09-01: “In local network mode, a local Friendbot is running.” B, [Quickstart source](https://github.com/stellar/quickstart/blob/main/start), observed 2026-09-01: `--local`, `--testnet`, and `--futurenet` select different network configuration paths. | Keep. |
| Quickstart Testnet and Futurenet modes proxy the respective public Friendbot. They do not evade the public service limits. | **Confirmed.** | A, [Quickstart Faucet](https://developers.stellar.org/docs/tools/quickstart/faucet), observed 2026-09-01: requests in Testnet and Futurenet mode “will be proxied to the Friendbot deployments for the respective network.” B, [Quickstart README](https://github.com/stellar/quickstart/blob/main/README.md), observed 2026-09-01: it repeats that local mode runs a local Friendbot and public modes proxy their respective deployments. | Keep. |
| Validation Cloud advertises a Stellar Testnet XLM path. Its access and limits are provider-specific. It must not be assumed independent of Friendbot. | **Confirmed**, with an important provider wording nuance. | A, [Validation Cloud faucet page](https://www.validationcloud.io/multi-chain-faucets), observed 2026-09-01: “Stellar Testnet” and “Get XLM.” A, [Validation Cloud faucet documentation](https://docs.validationcloud.io/v1/about/faucets), observed 2026-09-01: it says Validation Cloud “link[s] to other existing and working testnet faucets” for Stellar and requires a login to follow instructions. D, `/tmp/validation-stellar-independent.json`, observed 2026-09-01: the targeted sweep found no independent operator evidence for the eventual Stellar funding service. | Current wording is safe because it says “advertises” and does not assume independence. Optional precision change: replace “advertises a Stellar Testnet XLM faucet” with “lists a Stellar Testnet XLM faucet path; its documentation says Stellar is an existing faucet it links to.” Do not add an amount, cooldown, or independence claim. |
| Futurenet is a separate, reset-prone network. It is not a Testnet quota bypass. | **Confirmed.** | A, [Stellar Networks](https://developers.stellar.org/docs/networks), observed 2026-09-01: Testnet has a regular reset cadence, while Futurenet resets “whenever necessary.” It lists different passphrases, network IDs, and Friendbot APIs. B, [Quickstart source](https://github.com/stellar/quickstart/blob/main/start), observed 2026-09-01: `testnet` and `futurenet` set different network paths and passphrases. A, [Quickstart Faucet](https://developers.stellar.org/docs/tools/quickstart/faucet), observed 2026-09-01: each public mode proxies its respective public Friendbot. | Keep. No change. |
| Circle's public faucet provides Testnet USDC, not native XLM or a base reserve. | **Confirmed.** | A, [Circle Testnet Faucet](https://faucet.circle.com/), observed 2026-09-01: it lists USDC, EURC, and cirBTC, includes Stellar Testnet, and labels the action “Send 20 USDC.” A, [Circle Stellar USDC guide](https://developers.circle.com/stablecoins/quickstarts/setup-usdc-trustline-stellar), observed 2026-09-01: it first obtains Testnet XLM from Friendbot, then creates a USDC trustline. B, [Stellar CreateAccount source semantics](https://stellar.github.io/js-stellar-base/operations_create_account.js.html), observed 2026-09-01: `startingBalance` is an XLM amount. | Keep the XLM-versus-USDC distinction. Do not call Circle a native-XLM replacement. |
| Circle Testnet USDC requires a trustline for an account recipient. | **Confirmed.** | A, [Circle Stellar USDC guide](https://developers.circle.com/stablecoins/quickstarts/setup-usdc-trustline-stellar), observed 2026-09-01: “an account must add a USDC trustline before it can hold USDC.” It shows `Operation.changeTrust`. B, [Stellar CreateAccount guide](https://developers.stellar.org/docs/build/guides/transactions/create-account), observed 2026-09-01: native XLM belongs directly to an account, while other assets use trustlines. | Keep as an “also good” statement. The case has no SAC assertion. Do not add one. |
| Circle's current public-faucet amount and cooldown are 20 USDC and two hours. | **Confirmed**, but it is not a present golden claim. | A, [Circle Testnet Faucet](https://faucet.circle.com/), observed 2026-09-01: “One request per pairing of asset and test network every 2 hours” and “Send 20 USDC.” B, [Circle faucet FAQ on the same owner page](https://faucet.circle.com/), observed 2026-09-01: “20 USDC on testnet every 2 hours, per address, and per blockchain.” | **No judge-facing change is needed.** Do not add volatile numbers to this XLM funding case. If a later case needs these facts, it needs a dated assertion and separate re-verification. |
| No official SDF backup faucet or distribution-wallet address is verified. | **Confirmed** as a source-relative negative finding. | A, [Stellar Networks](https://developers.stellar.org/docs/networks), observed 2026-09-01: the official page names only the Testnet and Futurenet Friendbot APIs. B, [Friendbot README](https://github.com/stellar/friendbot), observed 2026-09-01: it names the same Testnet, Futurenet, and local endpoints. D, `/tmp/friendbot-backup-sweep.json`, observed 2026-09-01: the targeted SDF, Stellar, and GitHub sweep found no SDF backup-wallet publication. | Keep the present wording: “do not trust an alleged official backup wallet without current primary documentation.” Do not say that no wallet can ever exist. |

## Provider and protocol observations outside the golden

- Circle currently shows a public `20 USDC` request and a two-hour cooldown.
  This is a provider value, not a Testnet XLM rule.
- Validation Cloud's documentation distinguishes a faucet it operates from a Stellar faucet it links to.
  This supports the golden's non-independence caution.
- Neither the case nor the checked sources make a Stellar Asset Contract claim.
  No SAC claim needs verification or a judge-facing change in this case.

## Sibling-case sweep

Search terms: `Friendbot`, `Quickstart`, `Futurenet`, `Testnet XLM`, `test USDC`,
`Validation Cloud`, `backup faucet`, `distribution wallet`, `Retry-After`, `429`,
`400`, `trustline`, `CreateAccount`, `20 USDC`, `two hours`, and `SAC`.

Checked siblings:

- `q-infra-quickstart-local-network`: confirms the local-only Friendbot boundary and public-mode proxy behavior.
- `q-infra-testnet-vs-futurenet`: confirms the separate-network and reset boundary.
- `q-ti-testnet-usdc-faucet`: should own any Circle issuer, amount, cooldown, trustline, and SAC detail.
- `q-n3-issues-842-backup-faucet-wallet`: confirms that an alleged backup wallet needs primary verification.
- `q-edge-send-me-free-xlm`: confirms that Friendbot does not fund Mainnet.

Result: no contradiction.  
The Circle numeric facts remain absent from this case.  
The Validation Cloud wording needs the provider-link nuance above only if the owner wants greater precision.

## Exact source list

- https://developers.stellar.org/docs/networks
- https://developers.stellar.org/docs/tools/quickstart/faucet
- https://developers.stellar.org/docs/build/guides/transactions/create-account
- https://github.com/stellar/friendbot
- https://github.com/stellar/friendbot/blob/main/main.go
- https://github.com/stellar/quickstart/blob/main/start
- https://github.com/stellar/quickstart/blob/main/README.md
- https://stellar.github.io/js-stellar-base/operations_create_account.js.html
- https://www.rfc-editor.org/rfc/rfc6585#section-4
- https://www.rfc-editor.org/rfc/rfc9110#section-10.2.3
- https://www.validationcloud.io/multi-chain-faucets
- https://docs.validationcloud.io/v1/about/faucets
- https://faucet.circle.com/
- https://developers.circle.com/stablecoins/quickstarts/setup-usdc-trustline-stellar

