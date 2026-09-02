# Testnet funding corroboration matrix

Round: `2026-09-01-stale-gospel-refresh`  
Cases: `q-ti-friendbot-ratelimit-alternatives` and `q-ti-testnet-usdc-faucet`  
Current as-of date: **2026-09-01**  
Recommended next `reverifyBy`: **2026-12-01**

## Method and limits

This matrix used independent primary documentation, public source or protocol
semantics, and read-only public service pages. Two independent source classes
support each volatile claim where an assertion remains in gospel.

No Friendbot request occurred. No Circle Faucet form was submitted. No payment,
transaction, trustline change, or other value-changing endpoint occurred. No
paid Lumenloop request occurred.

`confirmed` means the current evidence supports the claim. `disputed` means
the sources support different formulations. `unverifiable` means that the
current evidence cannot support the asserted claim. A source-relative negative
does not claim that a future service or wallet cannot exist.

## Source ledger

| ID | Class | Exact URL | Observed | Short evidence excerpt |
| --- | --- | --- | --- | --- |
| F1 | A, Stellar Docs | https://developers.stellar.org/docs/networks | 2026-09-01 | “Requests are rate limited”; “Provides 10,000 fake XLM”; fund one account, then use `Create Account`. |
| F2 | B, SDF Friendbot source | https://github.com/stellar/friendbot | 2026-09-01 | It names Testnet, Futurenet, and local endpoints. The documented configuration has `starting_balance = "10000.00"`. |
| F3 | A, Stellar Docs | https://developers.stellar.org/docs/tools/quickstart/faucet | 2026-09-01 | “In local network mode, a local Friendbot is running.” Public Testnet and Futurenet requests “will be proxied”. |
| F4 | B, Quickstart source | https://github.com/stellar/quickstart | 2026-09-01 | Its README repeats that local runs Friendbot while Testnet and Futurenet proxy their public deployments. |
| F5 | A, Circle Docs | https://developers.circle.com/stablecoins/quickstarts/setup-usdc-trustline-stellar | 2026-09-01 | The rate-limit example is `Friendbot funding failed: 400`; it says to wait a few seconds. |
| F6 | B, HTTP standard | https://www.rfc-editor.org/rfc/rfc6585#section-4 | 2026-09-01 | `429` denotes rate limiting and a response “MAY include a Retry-After header.” |
| F7 | B, HTTP standard | https://www.rfc-editor.org/rfc/rfc9110#section-10.2.3 | 2026-09-01 | `Retry-After` states when a user agent can make a follow-up request. |
| F8 | A, Validation Cloud | https://www.validationcloud.io/multi-chain-faucets | 2026-09-01 | The page lists “Stellar Testnet” and “Get XLM”. |
| F9 | A, Validation Cloud docs | https://docs.validationcloud.io/v1/about/faucets | 2026-09-01 | The provider says it can link to existing working testnet faucets and requires login for instructions. |
| F10 | A, Circle Docs | https://developers.circle.com/stablecoins/quickstarts/transfer-usdc-stellar | 2026-09-01 | It requires Testnet XLM from Friendbot and Testnet USDC from Circle Faucet. |
| U1 | A, Circle Docs | https://developers.circle.com/stablecoins/usdc-contract-addresses | 2026-09-01 | `Stellar Testnet` lists `USDC-GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`. |
| U2 | C, Circle public page | https://faucet.circle.com/ | 2026-09-01 | The page lists Stellar Testnet, “Send 20 USDC”, and one request every two hours per address and blockchain. |
| U3 | C, Testnet Horizon read | https://horizon-testnet.stellar.org/accounts/GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5 | 2026-09-01 | The issuer account exists and reports `home_domain: "centre.io"`. |
| U4 | A, Stellar Docs | https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts | 2026-09-01 | An account needs an XLM minimum balance. |
| U5 | B, Stellar Core source | https://github.com/stellar/stellar-core/blob/master/src/transactions/ChangeTrustOpFrame.cpp | 2026-09-01 | A newly created trustline starts with `tl.balance = 0`; reserve failure uses `CHANGE_TRUST_LOW_RESERVE`. |
| U6 | A, Stellar Docs | https://developers.stellar.org/docs/tokens/stellar-asset-contract | 2026-09-01 | A classic account uses a trustline balance. An asset and its SAC represent the same asset. |
| U7 | B, Stellar protocol | https://github.com/stellar/stellar-protocol/blob/master/core/cap-0046-06.md | 2026-09-01 | The asset contract ID is deterministic because its preimage contains the `Asset`. |
| U8 | A, Stellar Lab | https://lab.stellar.org/account/fund | 2026-09-01 | The current page describes XLM account funding and says assets need a trustline. |
| U9 | D, independent published client source | https://github.com/vyperlang/circle-titanoboa-sdk | 2026-09-01 | It records “20 USDC (every 2 hours per address per network).” |

## Case: `q-ti-friendbot-ratelimit-alternatives`

### Claim matrix

| # | Claim | Independent evidence | Verdict | Required gospel change |
| --- | --- | --- | --- | --- |
| F-1 | Public Testnet Friendbot is rate-limited. | F1 (A) directly says requests are rate-limited. F2 (B) defines the public service and its configuration. | confirmed | None. Keep the rate-limit statement. |
| F-2 | A durable public requests-per-hour quota is not corroborated. | F1 (A) gives no request-window value. F2 (B) documents the endpoint and funding configuration but no public quota. A targeted current SDF and GitHub web sweep found no such published quota. | confirmed, source-relative | None. Do not add a numeric quota. Do not treat source absence as a promise that a quota cannot change. |
| F-3 | On `429`, a client can honor `Retry-After` when present and use bounded backoff. | F6 and F7 (B) define the conditional HTTP behavior. F5 (A) shows a current Friendbot rate-limit example with `400` and a wait instruction. | disputed for a Friendbot-specific status; confirmed for the conditional HTTP rule | No judge-facing change. The answer says “On `429`” conditionally. It does not claim that Friendbot must use `429`. Do not make `429`, `Retry-After`, or jitter a Friendbot invariant. |
| F-4 | A client must not rotate IPs or hammer retries. | F1 (A) says to use the limited service wisely. F6 (B) defines the limit response without authorizing bypass behavior. | confirmed as safe guidance | None. This is not a numeric-limit claim. |
| F-5 | Fund one public-Testnet account, then fund additional accounts through normal `CreateAccount` or payment operations. | F1 (A) gives this exact operational sequence. F2 (B) establishes the native XLM funding model. | confirmed | None. Keep it. Do not pin a required starting amount. |
| F-6 | Quickstart local mode has a local Friendbot. | F3 (A) states this directly. F4 (B) repeats the local-mode implementation behavior. | confirmed | None. Keep it. |
| F-7 | Quickstart Testnet and Futurenet modes proxy public Friendbot. They do not evade public limits. | F3 (A) says the endpoint proxies the respective deployment. F4 (B) repeats the implementation behavior. | confirmed | None. Keep it. |
| F-8 | Validation Cloud lists a Stellar Testnet XLM route. Its access, limits, and independence are provider-dependent. | F8 (A) lists Stellar Testnet and XLM. F9 (A, a second provider-owned page) says its service can link to existing faucets and needs login. An independent web sweep found no operator proof for a separate backing faucet. | confirmed for “lists”; unverifiable for independent operation | No judge-facing change. The case correctly says “advertises” and does not assume independence. Optional wording precision: replace “advertises a Stellar Testnet XLM faucet” with “lists a Stellar Testnet XLM faucet path.” |
| F-9 | Futurenet is a separate, reset-prone network. It is not a Testnet quota bypass. | F1 (A) gives different network IDs, passphrases, Friendbot APIs, and reset behavior. F4 (B) uses separate network paths. F3 (A) shows each public mode proxies its own public deployment. | confirmed | None. Keep it. |
| F-10 | Circle Faucet supplies Testnet USDC. It does not replace native-XLM funding or the account base reserve. | F10 (A) first gets Testnet XLM from Friendbot, then names Circle Faucet for USDC. F2 (B) configures Friendbot with native XLM only. | confirmed | None. Keep the XLM-versus-USDC distinction. |
| F-11 | Circle Testnet USDC needs a trustline for a classic account recipient. | F10 (A) requires the trustline. U5 (B) shows that trustline creation creates a zero balance. | confirmed | None. Keep this as an optional useful detail. |
| F-12 | The Circle Faucet currently shows 20 test USDC and a two-hour cooldown. | U2 (C) shows both values. U9 (D) independently records the same values. | confirmed-as-of | No judge-facing change. These values do not belong in this XLM-funding case. Any future use needs its own dated evidence. |
| F-13 | An official SDF backup faucet or distribution-wallet address is not verified. | F1 (A) names only the Testnet and Futurenet APIs. F2 (B) names the same endpoints. A targeted SDF, Stellar, and GitHub sweep found no official wallet publication. | confirmed, source-relative negative | None. Keep: “do not trust an alleged official backup wallet without current primary documentation.” Do not claim that no future wallet can exist. |

### Case verdict

**Confirmed as of 2026-09-01.**

No judge-facing change is needed. Update only the verification metadata after
the owner reconciles this matrix: set `truth.asOf` to `2026-09-01` and set
`truth.reverifyBy` to `2026-12-01`.

### Sibling-case sweep

Search terms: `Friendbot`, `Quickstart`, `Futurenet`, `Testnet XLM`, `test
USDC`, `Validation Cloud`, `backup faucet`, `distribution wallet`,
`Retry-After`, `429`, `400`, `trustline`, `CreateAccount`, `20 USDC`, `two
hours`, and `SAC`.

Checked siblings: `q-infra-quickstart-local-network`,
`q-infra-testnet-vs-futurenet`, `q-ti-testnet-usdc-faucet`,
`q-n3-issues-842-backup-faucet-wallet`, and `q-edge-send-me-free-xlm`.

Result: no contradiction. The USDC case owns issuer, faucet amount, cooldown,
trustline, and SAC detail. The backup-wallet safety case remains consistent.

## Case: `q-ti-testnet-usdc-faucet`

### Claim matrix

| # | Claim | Independent evidence | Verdict | Required gospel change |
| --- | --- | --- | --- | --- |
| U-1 | Friendbot funds fake Testnet XLM, not USDC. | F1 (A) calls Friendbot fake-XLM funding. F10 (A) separately gets USDC from Circle Faucet. F2 (B) uses the native `starting_balance` setting. | confirmed | None. Keep the Friendbot/XLM-only boundary. |
| U-2 | A classic account needs XLM for activation, fees, and the additional trustline reserve. | U4 (A) requires a minimum XLM balance. U5 (B) enforces a low-reserve failure when a trustline is created. | confirmed | None. Do not pin a reserve amount. |
| U-3 | A USDC trustline permits holding the asset. It does not credit USDC. | F10 (A) describes a trustline before receiving USDC. U5 (B) initializes a new trustline with a zero balance. | confirmed | None. Keep the explicit non-credit statement. |
| U-4 | Current Testnet USDC is `USDC` plus issuer `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`. | F10 and U1 (A) list the same issuer. U3 (C) confirms the current Testnet account exists and has Circle's `centre.io` home domain. | confirmed-as-of | Change the answer-visible observation date from **2026-07-11** to **2026-09-01**. Refresh `truth.asOf`. |
| U-5 | Circle's public faucet supports Stellar Testnet USDC. | F10 (A) calls Circle Faucet the source for Testnet USDC. U2 (C) lists Stellar Testnet. | confirmed-as-of | Change the answer-visible observation date to **2026-09-01**. No substantive wording change is needed. |
| U-6 | The current public Circle Faucet offers 20 USDC per address and blockchain every two hours. | U2 (C) provides the amount and limit. U9 (D) independently records the same values. | confirmed-as-of | Keep this as a dated, non-gating observation. Change the observation date to **2026-09-01**. |
| U-7 | Circle Faucet payment and an SDF/Lab path-payment demo are distinct current distribution paths. | U8 (A) only shows XLM funding and a trustline requirement. An independent current Lab sweep found no current USDC distribution or path-payment demo. | unverifiable | **A judge-facing change is required.** Remove the named Lab path-payment-demo assertion. Keep the durable statement that a separate USDC payment can credit an established trustline. Revise the matching key fact and notes. |
| U-8 | A classic issuer/trustline and its SAC C-address represent one asset. The SAC is deterministic and not wrapped. | U6 (A) says the asset and SAC are the same asset. U7 (B) derives its ID from an `Asset` preimage. | confirmed | None. Keep this judge-facing distinction. |
| U-9 | Testnet USDC has no Mainnet redemption value. Testnet endpoints and assets must remain separate. | F1 (A) says Testnet does not connect to real money. U2 (C) describes testnet tokens as test assets. | confirmed | None. Keep the network and value warning. |

### Case verdict

**Unverifiable as of 2026-09-01.**

Claims U-1 through U-6 and U-8 through U-9 are confirmed. Claim U-7 is not
verified by the current official Lab surface or an independent sweep.

The required judge-facing change is limited to U-7. Remove the current
SDF/Lab path-payment-demo claim. Do not replace it with another named
distribution route without new primary evidence.

After that change, update `truth.asOf` to `2026-09-01` and set
`truth.reverifyBy` to `2026-12-01`. Record the dated issuer, faucet support,
amount, and cooldown observations. Keep their non-gating status.

### Sibling-case sweep

Search terms: `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`,
`Circle Faucet`, `testnet USDC`, `Friendbot`, `deterministic SAC`, `Stellar
Asset Contract`, `trustline`, `path payment`, `20 USDC`, and `two hours`.

Checked siblings: `q-ti-friendbot-ratelimit-alternatives`,
`q-ti-stellar-lab-usage-and-new-ui`, `q-tool-lab-what-is`,
`q-infra-testnet-vs-futurenet`, `q-tool-cctp-stellar-integration`,
`q-token-circle-usdc-on-stellar`, and the asset trustline/SAC cases returned
by the search.

Result: no sibling treats Friendbot as a USDC faucet, a trustline as a credit,
or a SAC as a separate wrapped asset. No sibling establishes a current Lab
USDC path-payment distribution demo. The required U-7 removal will therefore
not create a sibling contradiction.

## Earlier reverification triggers

Reverify before 2026-12-01 if Stellar changes Friendbot funding, network
roles, Quickstart routing, or trustline and SAC semantics.

Reverify before 2026-12-01 if Circle changes its issuer list, public faucet
network list, amount, cooldown, or availability. Reverify earlier if Stellar
Lab adds a documented USDC distribution or path-payment workflow.
