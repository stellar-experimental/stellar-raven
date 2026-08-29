# Blind lane R2 — independent re-derivation (Grok)

Date: 2026-08-29
Lane: reviewer R2 (canonical re-derivation)
Rule followed: did not read case `truth` blocks, this round ledger, `program-log.md`, or `improvements/` before writing these findings.

Live Mainnet probe used as class C/F for protocol version and base reserve:

- `GET https://horizon.stellar.org/` at 2026-08-29 ~11:44 UTC
- `GET https://horizon.stellar.org/ledgers?order=desc&limit=1`

Observed: `current_protocol_version: 27`, `supported_protocol_version: 28`, `horizon_version: 28.0.1-a70eb47f…`, `core_version: stellar-core 28.0.1 (947aad84…)`, `history_latest_ledger: 64178140`, `history_latest_ledger_closed_at: 2026-08-29T11:44:54Z`. Latest ledger record: `base_reserve_in_stroops: 5000000`, `protocol_version: 27`.

---

## 1. Stellar base reserve and minimum balance

### Claim 1.1 — Current Mainnet baseReserve is 5,000,000 stroops (0.5 XLM)

**Verdict: confirmed** (as of ledger 64178140 / 2026-08-29T11:44:54Z)

| class | url | quote | asOf |
|---|---|---|---|
| C | https://horizon.stellar.org/ledgers?order=desc&limit=1 | `"base_reserve_in_stroops": 5000000` on ledger `64178140`, `closed_at: "2026-08-29T11:44:54Z"`, `protocol_version: 27` | 2026-08-29 |
| A | https://developers.stellar.org/docs/learn/fundamentals/lumens | "One base reserve is currently 0.5 XLM." | 2026-08-29 |
| A | https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts | "One base reserve is currently 0.5 XLM." | 2026-08-29 |
| A | https://developers.stellar.org/docs/build/guides/transactions/create-account | "at the current base reserve of 0.5 XLM that works out to 1 XLM" | 2026-08-29 |

Notes: 5,000,000 stroops = 0.5 XLM (1 XLM = 10,000,000 stroops). Live ledger and official Docs agree. The value is validator-voted and can change.

### Claim 1.2 — Core minimum-balance formula (sponsorship terms), excluding selling liabilities

**Verdict: confirmed**

Core `getMinBalance` (protocol ≥ 9, sponsorship ≥ 14):

```
effEntries = 2 + numSubentries + numSponsoring - numSponsored
return effEntries * int64_t(lh.baseReserve)
```

| class | url | quote | asOf |
|---|---|---|---|
| B | https://github.com/stellar/stellar-core/blob/master/src/transactions/TransactionUtils.cpp (lines 886–911) | `int64_t effEntries = 2LL; effEntries += numSubentries; effEntries += numSponsoring; effEntries -= numSponsored; … return effEntries * int64_t(lh.baseReserve);` | 2026-08-29 (master) |
| B | same file, `getMinBalance(LedgerHeader, AccountEntry)` (lines 870–883) | Reads `numSponsoring` / `numSponsored` from `AccountEntry` ext v2 when protocol ≥ 14 | 2026-08-29 |
| A | https://developers.stellar.org/docs/build/guides/transactions/sponsored-reserves | "Once sponsorships are introduced, the minimum balance calculation is: (2 base reserves + `numSubEntries` + `numSponsoring` - `numSponsored`) * `baseReserve` + `liabilities.selling`." | 2026-08-29 |

Notes: The reserve/sponsorship product in Core matches the Docs product **except** the Docs add `+ liabilities.selling` into the same "minimum balance" formula. See claim 1.3.

### Claim 1.3 — Selling liabilities do **not** enter Core `getMinBalance`; they are applied separately

**Verdict: confirmed** (Core). Docs wording **conflicts** with Core.

| class | url | quote | asOf |
|---|---|---|---|
| B | https://github.com/stellar/stellar-core/blob/master/src/transactions/TransactionUtils.cpp `getMinBalance` (886–911) | Formula is only `effEntries * baseReserve`. No `liabilities.selling`. | 2026-08-29 |
| B | same file, `getAvailableBalance` (751–777) | `avail = acc.balance - getMinBalance(header, acc);` then, protocol ≥ 10, `avail -= getSellingLiabilities(header, le);` | 2026-08-29 |
| B | same file, `addBalance` (607–612) | Withdrawals fail if `newBalance - minBalance < getSellingLiabilities(...)` | 2026-08-29 |
| B | same file, `addSellingLiabilities` (704–708) | Max selling liabilities = `acc.balance - getMinBalance(...)` | 2026-08-29 |
| A | https://developers.stellar.org/docs/build/guides/transactions/sponsored-reserves | Folded into one formula: `… * baseReserve + liabilities.selling` | 2026-08-29 |
| A | https://developers.stellar.org/docs/learn/fundamentals/lumens | Minimum-balance section does **not** mention selling liabilities. It says two base reserves plus one per subentry. | 2026-08-29 |
| A | https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts | Trustlines "must always have a balance sufficiently large to satisfy its selling liabilities" — liabilities are a spendable-balance constraint, not a reserve-entry count. | 2026-08-29 |

Notes: Core computes a reserve floor (`getMinBalance`) and then subtracts selling liabilities when computing **available** XLM. The sponsored-reserves Docs page states a combined formula that treats selling liabilities as part of "minimum balance." That is operationally similar for "can I spend this XLM?" but it is not how Core names or computes `getMinBalance`. Lumens/accounts pages do not include `liabilities.selling` in the reserve formula. **Do not pin a golden that says Core's min-balance formula includes selling liabilities.**

### Claim 1.4 — Liquidity-pool-share trustline costs 2 base reserves

**Verdict: confirmed**

| class | url | quote | asOf |
|---|---|---|---|
| A | https://developers.stellar.org/docs/learn/fundamentals/liquidity-on-stellar-sdex-liquidity-pools | "A pool share trustline requires 2 base reserves instead of 1. For example, an account (2 base reserves) with a trustline for asset A (1 base reserve), a trustline for asset B (1 base reserve), and a trustline for the A-B pool share (2 base reserves) would have a reserve requirement of 6 base reserves." | 2026-08-29 |
| B | https://github.com/stellar/stellar-core/blob/master/src/transactions/SponsorshipUtils.cpp `computeMultiplier` (193–201) | `case TRUSTLINE: return le.data.trustLine().asset.type() == ASSET_TYPE_POOL_SHARE ? 2 : 1;` | 2026-08-29 |
| B | same file ~665 | `acc.data.account().numSubEntries += computeMultiplier(le);` so a pool-share trustline increments `numSubEntries` by 2 | 2026-08-29 |
| A | https://github.com/stellar/stellar-protocol/blob/master/core/cap-0038.md | "The pool share trust line should count as two subentries (and therefore require two base reserves)"; "TrustLineEntry with asset of type ASSET_TYPE_POOL_SHARE takes two base reserves" | 2026-08-29 |

### Claim 1.5 — Official Docs min-balance / sponsored-reserves wording vs Core

**Verdict: disputed** on whether selling liabilities belong inside the "minimum balance" formula. Reserve product and LP-share 2× are confirmed.

Docs pages hit:

1. https://developers.stellar.org/docs/learn/fundamentals/lumens — base reserve 0.5 XLM; min balance two base reserves (1 XLM) plus one per subentry; sponsorship can cover the two base reserves.
2. https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts — same 0.5 XLM; subentries include trustlines (traditional and pool shares), offers, additional signers, data entries; cap 1,000 subentries. Does not give the sponsorship formula.
3. https://developers.stellar.org/docs/build/guides/transactions/sponsored-reserves — sponsorship formula includes `+ liabilities.selling`.
4. https://developers.stellar.org/docs/learn/fundamentals/liquidity-on-stellar-sdex-liquidity-pools — pool-share trustline = 2 base reserves.

Conflict to encode honestly: sponsored-reserves Docs vs Core `getMinBalance` on selling liabilities.

---

## 2. Horizon vs Stellar RPC

### Claim 2.1 — Official Docs Horizon lifecycle wording

**Verdict: confirmed** that the standing official wording is "nearing end-of-life and will eventually be deprecated," with continued protocol-compatibility updates and **no new feature development**. **No sunset date** on any page found.

Pages that state the EOL warning (verbatim, 2026-08-29):

| url | quote |
|---|---|
| https://developers.stellar.org/docs/data/apis | "Horizon is nearing end-of-life and will eventually be deprecated in favor of Stellar RPC and Portfolio APIs. While it will continue to receive updates to maintain compatibility with upcoming protocol releases, it won't receive new feature development." |
| https://developers.stellar.org/docs/learn/fundamentals/stellar-stack | same warning block |
| https://developers.stellar.org/docs/tools/lab/api-explorer/horizon-endpoint | same warning; page description repeats it |
| https://developers.stellar.org/docs/tools/lab/api-explorer | child card: "Horizon is nearing end-of-life and will eventually be deprecated in favor of Stellar RPC and Portfolio APIs. While it will continue to receive updates to maintain compatibility with upcoming protocol releases, it won't receive new feature development." |

Page that does **not** carry that warning:

| url | observation |
|---|---|
| https://developers.stellar.org/docs/data/apis/horizon | Horizon landing/admin page. Describes Horizon as the HTTP API, notes 2024-08-01 history truncation, lists SDF testnet/futurenet instances. **No** "deprecated" / "end-of-life" / sunset date in the body fetched 2026-08-29. |

Search notes: Docs search for Horizon + deprecat hits the warning pages above. None name a sunset date. "Deprecated" is future-tense ("will eventually be deprecated"), not a completed deprecation. Horizon remains live (`horizon.stellar.org` returned protocol 27 data today).

**Pages do not fully agree:** overview/stack/lab warn EOL; the dedicated Horizon docs root does not. None contradict each other on a sunset date because none give one.

### Claim 2.2 — RPC covers classic (non-Soroban) transactions

**Verdict: confirmed**

| class | url | quote | asOf |
|---|---|---|---|
| A | https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/sendTransaction | "This supports all transactions, not only smart contract-related transactions." Also: "This method supports **all Stellar transactions**, including but not limited to smart contract invocations." | 2026-08-29 |
| A | https://developers.stellar.org/docs/build/guides/dapps/frontend-guide | Builds a classic `Operation.payment` of native XLM and submits it with `server.sendTransaction` against `https://soroban-testnet.stellar.org` | 2026-08-29 |
| A | https://developers.stellar.org/docs/data/apis | Comparison table: RPC has Real-time Data ✅, Smart Contracts ✅, Transaction Simulation ✅. Horizon has Curated and Parsed Data ✅, Smart Contracts ❌. RPC is "the recommended API for accessing and interacting with Stellar network data in real-time." | 2026-08-29 |
| A | https://developers.stellar.org/docs/data/apis/rpc | RPC is "a lightweight tool that provides real-time access to Stellar network data" and "not a drop-in replacement for Horizon" because Horizon still has indexing features RPC does not. | 2026-08-29 |

Notes: RPC is not Horizon-feature-complete (no long history, no curated aggregations). It **does** submit and query classic transactions.

---

## 3. Stellar RPC getTransactions pagination

### Claim 3.1 — Documented limits

**Verdict: confirmed** as the current Docs text (2026-08-29)

| method | Docs default | Docs max | Docs "hardcoded" wording | url |
|---|---|---|---|---|
| getTransactions | 50 | 1–200 | "The limit for getTransactions can range from 1 to 200 - an upper limit that is hardcoded in Stellar-RPC for performance reasons. If this argument isn't designated, it defaults to 50." | https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getTransactions |
| getEvents | 100 | 1–10000 | "The limit for getEvents can range from 1 to 10000 - an upper limit that is hardcoded in Stellar-RPC for performance reasons. If this argument isn't designated, it defaults to 100." | https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getEvents |
| getLedgers | 50 | 1–200 | "The limit for getLedgers can range from 1 to 200 - an upper limit that is hardcoded in Stellar-RPC for performance reasons. If this argument isn't designated, it defaults to 50." | https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getLedgers |

### Claim 3.2 — Source: the 200/10000 caps are config defaults, not compile-time constants in the method

**Verdict: confirmed** that stellar-rpc source treats max/default as **configurable**. Docs "hardcoded" wording **conflicts** with that.

| class | url | quote | asOf |
|---|---|---|---|
| B | https://github.com/stellar/stellar-rpc/blob/main/cmd/stellar-rpc/internal/config/options.go | `"max-transactions-limit"` DefaultValue `uint(200)`; `"default-transactions-limit"` DefaultValue `uint(50)`; `"max-events-limit"` DefaultValue `uint(10000)`; `"default-events-limit"` DefaultValue `uint(100)`; `"max-ledgers-limit"` DefaultValue `uint(200)`; `"default-ledgers-limit"` DefaultValue `uint(50)` | 2026-08-29 (main @ 9c13d418) |
| B | https://github.com/stellar/stellar-rpc/blob/main/cmd/stellar-rpc/internal/methods/get_transactions.go | Handler fields `maxLimit uint`, `defaultLimit uint`. `initializePagination` starts at `h.defaultLimit` and uses `request.Pagination.Limit` when > 0. `request.IsValid(h.maxLimit, …)` enforces the configured max. `NewGetTransactionsHandler(..., maxLimit, defaultLimit uint, ...)` injects both. | 2026-08-29 |
| B | https://github.com/stellar/stellar-rpc/blob/main/cmd/stellar-rpc/internal/methods/get_events.go | Same pattern: `maxLimit` / `defaultLimit` constructor args; `LedgerScanLimit = 10000` is a separate per-request ledger-scan cap | 2026-08-29 |

Notes: Stock defaults match the Docs numbers. Operators can raise or lower the caps with flags/TOML. The Docs sentence that the 200 (and 10000) upper limit "is hardcoded in Stellar-RPC" is **false as a description of the implementation**. It is true only as "the published default max on SDF-style deployments." Encode as: documented default max 200 / default page 50 for getTransactions and getLedgers; 10000 / 100 for getEvents; source-configurability vs Docs "hardcoded" is a Docs defect, not a reason to pin "hardcoded."

---

## 4. Freighter on localhost

### Claim 4.1 — Official frontend guide on HTTPS / localhost

**Verdict: confirmed**

| class | url | quote | asOf |
|---|---|---|---|
| A | https://developers.stellar.org/docs/build/guides/dapps/frontend-guide section "Setup HTTPS on Localhost" | "Freighter wallet requires a secure connection (HTTPS) to interact with your dapp. To enable HTTPS on localhost, you can use a tool like `mkcert`. Fortunately, Next.js provides built-in support for HTTPS." Scripts example: `"dev": "next dev --experimental-https"` | 2026-08-29 |

### Claim 4.2 — Current Freighter extension manifest v3

**Verdict: confirmed** for host pattern and `run_at`. `all_frames` is **absent** (Chrome MV3 default is `false`).

Fetched: https://github.com/stellar/freighter/blob/b98ad020f3b115eff8daee5e05810b0e7c3a0f8e/extension/public/static/manifest/v3.json (class B), version `5.45.0`, `manifest_version: 3`.

`content_scripts` verbatim:

```json
"content_scripts": [
  {
    "matches": [
      "<all_urls>"
    ],
    "js": [
      "contentScript.min.js"
    ],
    "run_at": "document_start"
  }
]
```

| field | observed |
|---|---|
| matches / host patterns | `"<all_urls>"` only. No explicit `http://localhost/*` or `https://localhost/*` list. |
| run_at | `"document_start"` |
| all_frames | **not set** |

Notes: `<all_urls>` includes `http://localhost` and `https://localhost` at the extension-permission layer. The official guide still requires HTTPS for Freighter to interact with a dapp. Do not treat the manifest host pattern as a contradiction of the HTTPS guidance; they are different layers (injection vs Freighter API / secure-context policy).

---

## 5. Protocol 27 "Zipper"

### Claim 5.1 — Mainnet upgrade **vote** date is 8 July 2026

**Verdict: confirmed**

| class | url | quote | asOf |
|---|---|---|---|
| A | https://stellar.org/blog/foundation-news/stellar-zipper-protocol-27-upgrade-guide | Key dates: "**July 8, 2026: Mainnet upgrade vote**". Testnet: "**June 18, 2026: Testnet upgrade**". Changelog: "June 4, 2026: Initial draft published." | 2026-08-29 |
| A | https://developers.stellar.org/docs/networks/software-versions | Heading: "Protocol 27 (Mainnet, July 8, 2026)". Release notes: "New features in Zipper, Protocol 27" with Core v27.0.0 as protocol activation build and v27.1.0 recommended. | 2026-08-29 |

### Claim 5.2 — Date Protocol 27 became active on Mainnet

**Verdict: confirmed-as-of that Mainnet is on protocol 27 today; the exact first-active calendar day is not pinned by an official post-upgrade announcement I found.** Official software-versions labels Mainnet as "July 8, 2026," which is the **vote** date in the upgrade guide, not a measured first-externalize timestamp.

| class | url | quote | asOf |
|---|---|---|---|
| C | https://horizon.stellar.org/ | `"current_protocol_version": 27` (supported 28) | 2026-08-29 |
| C | https://horizon.stellar.org/ledgers?order=desc&limit=1 | ledger 64178140 `"protocol_version": 27` | 2026-08-29 |
| A | https://developers.stellar.org/docs/networks/software-versions | "Protocol 27 (Mainnet, July 8, 2026)" | 2026-08-29 |
| A | https://stellar.org/blog/foundation-news/stellar-zipper-protocol-27-upgrade-guide | Vote date 8 July 2026; no "activated on" day | 2026-08-29 |
| D (unofficial) | https://github.com/Pi-Defi-world/Wpi/issues/27 | "Stellar is now on Protocol 27 \"Zipper,\" live since July 10, 2026." | 2026-07-15 |

Notes: Validator votes often close the protocol upgrade on the vote day or shortly after, depending on `upgrades` schedule. I did not find an SDF blog titled as a post-activation announcement that names a distinct activation day. Do **not** pin 10 July or 11 July as official activation.

### Claim 5.3 — "July 11, 2026" as an activation date

**Verdict: contradicted as an official activation date.** It does **not** appear in:

- https://developers.stellar.org/docs/networks/software-versions (fetched 2026-08-29; contains "July 8", not "July 11" or "July 10")
- https://stellar.org/blog/foundation-news/stellar-zipper-protocol-27-upgrade-guide (contains "July 8, 2026: Mainnet upgrade vote"; no July 11)
- https://github.com/stellar/stellar-core/releases/tag/v27.0.0 (released 2026-06-05; CAP-71; no calendar activation date)

July 11, 2026 is a plausible **check date** after a 8 July vote, not a date I can cite from official sources as activation.

### Claim 5.4 — CAPs that Zipper comprised

**Verdict: confirmed** as CAP-71 (split as CAP-0071-01 and CAP-0071-02). No other CAP is listed as a Protocol 27 feature on the official pages.

| class | url | quote | asOf |
|---|---|---|---|
| A | https://developers.stellar.org/docs/networks/software-versions | "Authentication Delegation and Address-Bound Soroban Credentials: CAP-71" | 2026-08-29 |
| A | https://stellar.org/blog/foundation-news/stellar-zipper-protocol-27-upgrade-guide | CAP-0071-01 (authentication delegation for custom accounts) and CAP-0071-02 (address-bound Soroban credentials / `SOROBAN_CREDENTIALS_ADDRESS_V2`) | 2026-08-29 |
| B | https://github.com/stellar/stellar-core/releases/tag/v27.0.0 | "This release bumps the protocol to version 27, which includes CAP-0071: Authentication delegation and address-bound Soroban credentials." | 2026-06-05 |
| B | https://github.com/stellar/stellar-protocol/blob/master/core/README.md | CAP-0071 protocol 27; CAP-0071-01 protocol 27 | 2026-08-29 |

---

## Corroboration matrix (compact)

```json
{
  "claims": [
    {
      "claim": "Mainnet baseReserve is 5000000 stroops (0.5 XLM) as of ledger 64178140 / 2026-08-29T11:44:54Z",
      "verdict": "confirmed",
      "sources": [
        {"class": "C", "url": "https://horizon.stellar.org/ledgers?order=desc&limit=1", "quote": "base_reserve_in_stroops: 5000000", "asOf": "2026-08-29"},
        {"class": "A", "url": "https://developers.stellar.org/docs/learn/fundamentals/lumens", "quote": "One base reserve is currently 0.5 XLM.", "asOf": "2026-08-29"}
      ],
      "notes": "Volatile; validators can vote to change it."
    },
    {
      "claim": "Core min-balance = (2 + numSubEntries + numSponsoring - numSponsored) * baseReserve; selling liabilities are applied outside getMinBalance",
      "verdict": "confirmed",
      "sources": [
        {"class": "B", "url": "https://github.com/stellar/stellar-core/blob/master/src/transactions/TransactionUtils.cpp", "quote": "effEntries += numSponsoring; effEntries -= numSponsored; return effEntries * int64_t(lh.baseReserve);", "asOf": "2026-08-29"},
        {"class": "B", "url": "https://github.com/stellar/stellar-core/blob/master/src/transactions/TransactionUtils.cpp", "quote": "avail = acc.balance - getMinBalance(...); avail -= getSellingLiabilities(...)", "asOf": "2026-08-29"}
      ],
      "notes": "Sponsored-reserves Docs add + liabilities.selling into the min-balance formula. That conflicts with Core naming."
    },
    {
      "claim": "Docs sponsored-reserves min-balance formula includes + liabilities.selling",
      "verdict": "disputed",
      "sources": [
        {"class": "A", "url": "https://developers.stellar.org/docs/build/guides/transactions/sponsored-reserves", "quote": "(2 base reserves + numSubEntries + numSponsoring - numSponsored) * baseReserve + liabilities.selling", "asOf": "2026-08-29"},
        {"class": "B", "url": "https://github.com/stellar/stellar-core/blob/master/src/transactions/TransactionUtils.cpp", "quote": "getMinBalance has no selling-liabilities term", "asOf": "2026-08-29"}
      ],
      "notes": "Do not pin either formulation as the only true 'minimum balance' without saying which layer (Docs phrase vs Core getMinBalance)."
    },
    {
      "claim": "Liquidity-pool-share trustline costs 2 base reserves",
      "verdict": "confirmed",
      "sources": [
        {"class": "A", "url": "https://developers.stellar.org/docs/learn/fundamentals/liquidity-on-stellar-sdex-liquidity-pools", "quote": "A pool share trustline requires 2 base reserves instead of 1.", "asOf": "2026-08-29"},
        {"class": "B", "url": "https://github.com/stellar/stellar-core/blob/master/src/transactions/SponsorshipUtils.cpp", "quote": "ASSET_TYPE_POOL_SHARE ? 2 : 1", "asOf": "2026-08-29"}
      ]
    },
    {
      "claim": "Horizon is nearing end-of-life and will eventually be deprecated; no sunset date; still protocol-maintained",
      "verdict": "confirmed",
      "sources": [
        {"class": "A", "url": "https://developers.stellar.org/docs/data/apis", "quote": "Horizon is nearing end-of-life and will eventually be deprecated in favor of Stellar RPC and Portfolio APIs.", "asOf": "2026-08-29"},
        {"class": "A", "url": "https://developers.stellar.org/docs/data/apis/horizon", "quote": "(no EOL warning on this landing page)", "asOf": "2026-08-29"}
      ],
      "notes": "Warning is consistent on APIs overview, stellar-stack, and Lab Horizon endpoints. Horizon admin landing page omits it. No sunset date anywhere found."
    },
    {
      "claim": "Stellar RPC covers classic (non-Soroban) transactions",
      "verdict": "confirmed",
      "sources": [
        {"class": "A", "url": "https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/sendTransaction", "quote": "This supports all transactions, not only smart contract-related transactions.", "asOf": "2026-08-29"}
      ]
    },
    {
      "claim": "getTransactions documented limit default 50 max 200; getEvents default 100 max 10000; getLedgers default 50 max 200",
      "verdict": "confirmed",
      "sources": [
        {"class": "A", "url": "https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getTransactions", "quote": "1 to 200 ... defaults to 50", "asOf": "2026-08-29"},
        {"class": "A", "url": "https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getEvents", "quote": "1 to 10000 ... defaults to 100", "asOf": "2026-08-29"},
        {"class": "A", "url": "https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getLedgers", "quote": "1 to 200 ... defaults to 50", "asOf": "2026-08-29"}
      ]
    },
    {
      "claim": "The 200 getTransactions upper limit is hardcoded in stellar-rpc",
      "verdict": "disputed",
      "sources": [
        {"class": "A", "url": "https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getTransactions", "quote": "an upper limit that is hardcoded in Stellar-RPC for performance reasons", "asOf": "2026-08-29"},
        {"class": "B", "url": "https://github.com/stellar/stellar-rpc/blob/main/cmd/stellar-rpc/internal/config/options.go", "quote": "Name: max-transactions-limit ... DefaultValue: uint(200)", "asOf": "2026-08-29"}
      ],
      "notes": "Stock default is 200. Config flags exist. Do not pin 'hardcoded' as implementation truth."
    },
    {
      "claim": "Official frontend guide says Freighter requires HTTPS on localhost",
      "verdict": "confirmed",
      "sources": [
        {"class": "A", "url": "https://developers.stellar.org/docs/build/guides/dapps/frontend-guide", "quote": "Freighter wallet requires a secure connection (HTTPS) to interact with your dapp.", "asOf": "2026-08-29"}
      ]
    },
    {
      "claim": "Freighter MV3 manifest matches <all_urls>, run_at document_start; all_frames omitted",
      "verdict": "confirmed",
      "sources": [
        {"class": "B", "url": "https://github.com/stellar/freighter/blob/b98ad020f3b115eff8daee5e05810b0e7c3a0f8e/extension/public/static/manifest/v3.json", "quote": "matches: <all_urls>; run_at: document_start; no all_frames key", "asOf": "2026-08-29"}
      ]
    },
    {
      "claim": "Protocol 27 Zipper Mainnet upgrade vote was 8 July 2026; Zipper is CAP-71 (71-01 and 71-02); Mainnet current_protocol_version is 27 today",
      "verdict": "confirmed",
      "sources": [
        {"class": "A", "url": "https://stellar.org/blog/foundation-news/stellar-zipper-protocol-27-upgrade-guide", "quote": "July 8, 2026: Mainnet upgrade vote", "asOf": "2026-08-29"},
        {"class": "C", "url": "https://horizon.stellar.org/", "quote": "current_protocol_version: 27", "asOf": "2026-08-29"}
      ]
    },
    {
      "claim": "July 11, 2026 is an official Protocol 27 Mainnet activation date",
      "verdict": "contradicted",
      "sources": [
        {"class": "A", "url": "https://developers.stellar.org/docs/networks/software-versions", "quote": "Protocol 27 (Mainnet, July 8, 2026); July 11 not present", "asOf": "2026-08-29"},
        {"class": "A", "url": "https://stellar.org/blog/foundation-news/stellar-zipper-protocol-27-upgrade-guide", "quote": "July 8, 2026: Mainnet upgrade vote; July 11 not present", "asOf": "2026-08-29"}
      ],
      "notes": "July 11 is at most a plausible post-vote check date. Unofficial third-party text used July 10, not July 11."
    }
  ],
  "overallNotes": "Highest-stakes Docs-vs-source conflicts: (1) sponsored-reserves min-balance formula includes selling liabilities; Core getMinBalance does not. (2) RPC pagination Docs say 200/10000 limits are hardcoded; stellar-rpc config exposes max-*-limit flags. Horizon EOL warning is consistent on several pages but omitted from the Horizon admin landing page; no sunset date. Protocol 27 is live (v27) as of 2026-08-29; official calendar label is the 8 July 2026 vote, not 11 July 2026."
}
```

## URL log (every URL hit)

Class C/F

- https://horizon.stellar.org/
- https://horizon.stellar.org/ledgers?order=desc&limit=1
- https://horizon.stellar.org/fee_stats
- https://soroban-testnet.stellar.org (JSON-RPC `getHealth`)

Class A (Docs / SDF)

- https://developers.stellar.org/docs/learn/fundamentals/lumens
- https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts
- https://developers.stellar.org/docs/learn/fundamentals/stellar-stack
- https://developers.stellar.org/docs/learn/fundamentals/liquidity-on-stellar-sdex-liquidity-pools
- https://developers.stellar.org/docs/build/guides/transactions/sponsored-reserves
- https://developers.stellar.org/docs/build/guides/transactions/create-account
- https://developers.stellar.org/docs/build/guides/dapps/frontend-guide
- https://developers.stellar.org/docs/build/guides/basics/classic-transition
- https://developers.stellar.org/docs/data/apis
- https://developers.stellar.org/docs/data/apis/horizon
- https://developers.stellar.org/docs/data/apis/rpc
- https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getTransactions
- https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getEvents
- https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getLedgers
- https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/sendTransaction
- https://developers.stellar.org/docs/networks/software-versions
- https://developers.stellar.org/docs/tools/lab/api-explorer
- https://developers.stellar.org/docs/tools/lab/api-explorer/horizon-endpoint
- https://stellar.org/blog/foundation-news/stellar-zipper-protocol-27-upgrade-guide
- https://stellar.org/protocol-upgrades

Class B (source)

- https://github.com/stellar/stellar-core/blob/master/src/transactions/TransactionUtils.cpp
- https://github.com/stellar/stellar-core/blob/master/src/transactions/TransactionUtils.h
- https://github.com/stellar/stellar-core/blob/master/src/transactions/SponsorshipUtils.cpp
- https://github.com/stellar/stellar-core/blob/master/src/transactions/ChangeTrustOpFrame.cpp
- https://github.com/stellar/stellar-core/releases/tag/v27.0.0
- https://github.com/stellar/stellar-protocol/blob/master/core/cap-0038.md
- https://github.com/stellar/stellar-protocol/blob/master/core/README.md
- https://github.com/stellar/stellar-rpc/blob/main/cmd/stellar-rpc/internal/methods/get_transactions.go
- https://github.com/stellar/stellar-rpc/blob/main/cmd/stellar-rpc/internal/methods/get_events.go
- https://github.com/stellar/stellar-rpc/blob/main/cmd/stellar-rpc/internal/config/options.go
- https://github.com/stellar/freighter/blob/b98ad020f3b115eff8daee5e05810b0e7c3a0f8e/extension/public/static/manifest/v3.json
- https://raw.githubusercontent.com/stellar/stellar-docs/main/docs/learn/fundamentals/lumens.mdx

Class D (not used as corroboration for official dates)

- https://github.com/Pi-Defi-world/Wpi/issues/27 (unofficial "live since July 10, 2026")
- parallel-cli search dumps under `/tmp/stellar-min-balance.json`, `/tmp/horizon-deprecation.json`, `/tmp/rpc-pagination.json`, `/tmp/freighter-localhost.json`, `/tmp/protocol-27.json`
