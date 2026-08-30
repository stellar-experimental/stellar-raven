# Blind re-derivation — 2026-08-30

Independent lane. Live sources only. No `eval/qa/corpus/`, `.agents/`, `improvements/`, or prior verification notes were read. No git, no npm, no paid research. Observed date for every probe: **2026-08-30**.

Verdict enum: `confirmed | confirmed-as-of | disputed | contradicted | unverifiable`.

---

## Item 1 — Veridise Soroban audit / Stellar Light research API

### Claims

| # | Claim | Verdict |
|---|---|---|
| 1.1 | V2 labels the authorization-recursion item `V-SOR-VUL-002` with severity **Critical** | **unverifiable** (no live V2 PDF; V2.1 reassigns that ID) |
| 1.2 | V2 valid-vulnerability summary counts **zero Critical** issues | **unverifiable** for V2 itself; **confirmed** for currently published V2.1 Table 2.3 |
| 1.3 | V2.1 relocates the item to Appendix A.2.2 as `V-SOR-APP-VUL-003` | **confirmed** |
| 1.4 | Live Light research `q=V-SOR-APP-VUL-003&limit=2` returns the Veridise row **without** `meta.exactMiss` | **confirmed-as-of** 2026-08-30T12:30:00Z |
| 1.5 | Control `q=V-SOR-APP-VUL-999` returns `meta.exactMiss` | **confirmed-as-of** 2026-08-30T12:30:03Z |

### URL trail and quotes

**https://veridise.com/wp-content/uploads/2025/02/VAR_Stellar_Soroban.pdf** (fetched 2026-08-30, 619134 bytes). This is the live public report. Cover: “Stellar Soroban Core”, “Veridise Inc. August 27, 2025”. Version history page:

> Aug. 27, 2025 V2.1 (Intended Behavior and Invalid Issues moved to the Appendix)\
> Dec. 22, 2023 V2\
> Dec. 22, 2023 V1

Contents: §4.1.2 is **not** authorization recursion. It is:

> 4.1.2 V-SOR-VUL-002: Incorrect Metering When Adding Trackers

Appendix listing:

> A.2.2 V-SOR-APP-VUL-003: Denial of Service During Authorization …… 48

Table 2.3 Vulnerability Summary (valid issues only):

| Name | Number | Resolved |
|---|---|---|
| Critical-Severity Issues | **0** | 0 |
| High-Severity Issues | 0 | 0 |
| Medium-Severity Issues | 1 | 1 |
| Low-Severity Issues | 1 | 0 |
| Warning-Severity Issues | 2 | 0 |
| Informational-Severity Issues | 3 | 0 |
| TOTAL | 7 | 1 |

Executive summary (V2.1): “The audit uncovered 7 issues in total.” “Some implementation details initially identified as issues have been determined to be intended behavior or invalid after discussions with the developers; these can be found in Appendix A.”

Appendix A.2.2 header (PDF p.48):

> A.2.2 V-SOR-APP-VUL-003: Denial of Service During Authorization\
> Severity **Critical** | Commit 2674d86 | Type Denial of Service | Status Investigated\
> File(s) rs-soroban-env/src/auth.rs | Location(s) require_auth_enforcing()\
> Confirmed Fix At N/A

Body (authorization recursion): “it is usually frowned upon for the `__check_auth` function to call `require_auth` on its own address, as this can lead to infinite recursion.” “This will lead to repeated invocations of the `require_auth_enforcing` function”. “Why Invalid” (from Light chunk of the same report): a failed `require_auth` in `__check_auth` returns `Err` and is propagated, so loop iterations stay linear in tracker count.

V2 PDF hunt (all 2026-08-30 HTTP 404 HTML):\
`https://veridise.com/wp-content/uploads/2024/01/VAR_Stellar_Soroban.pdf`\
`https://veridise.com/wp-content/uploads/2023/12/VAR_Stellar_Soroban.pdf`\
`https://veridise.com/wp-content/uploads/2024/01/VAR-Stellar-Soroban.pdf`\
`https://veridise.com/wp-content/uploads/2023/11/VAR_Stellar_Soroban.pdf`\
`https://veridise.com/wp-content/uploads/2023/12/VAR-Stellar-Soroban-Core.pdf`\
`https://veridise.com/wp-content/uploads/2024/01/VAR-Stellar-Soroban-Core.pdf`\
`https://veridise.com/wp-content/uploads/2023/12/VAR_Stellar_Soroban_Core.pdf`\
`https://veridise.com/wp-content/uploads/2024/02/VAR_Stellar_Soroban.pdf`\
`https://veridise.com/wp-content/uploads/2025/02/VAR_Stellar_Soroban_V2.pdf`\
`https://github.com/stellar/stellar-core/raw/master/docs/audits/VAR_Stellar_Soroban.pdf`\
Wayback CDX timed out. Therefore the **V2-specific ID/severity pairing is unverifiable from a live file**. What is live is V2.1: the DoS/auth-recursion finding is appendix `V-SOR-APP-VUL-003` Critical, and the valid-issue dashboard counts 0 Critical.

**https://stellarlight.xyz/api/research?q=V-SOR-APP-VUL-003&limit=2** (2026-08-30T12:30:00.675Z)

`meta` keys: `matchMode, matchModeLabel, source, generatedAt, query, mode, model, filters, counts, scoreModel`. **No `exactMiss` field.**

Shape (trimmed; full JSON saved from this probe):

```json
{
  "meta": {
    "matchMode": "vector",
    "matchModeLabel": "vector-similarity ranking — conceptually related, not literal keyword truth (verify before relying)",
    "source": "https://stellarlight.xyz/api/research",
    "generatedAt": "2026-08-30T12:30:00.675Z",
    "query": "V-SOR-APP-VUL-003",
    "mode": "vector",
    "model": "voyage-3",
    "filters": {"source": null, "auditor": null, "protocol": null, "severity": null, "limit": 2},
    "counts": {"returned": 2, "total": null, "totalBasis": "unbounded-similarity-ranking"}
  },
  "results": [
    {
      "id": "6a1516bc975750ee958a3bac",
      "source": "audit",
      "title": "Stellar Soroban Core — Veridise",
      "section": "V-SOR-APP-VUL-003:",
      "url": "https://stellarsecurityportal.com/report/42",
      "auditor": "Veridise",
      "protocol": "Stellar Soroban Core",
      "severity": "critical",
      "publishedAt": "2025-09-26T15:00:00.000Z",
      "content": "## V-SOR-APP-VUL-003:\n\n# DenialofService\n# During\n# Authorization\n\nSeverity Critical Commit 2674d86 ..."
    },
    { "title": "Alula — Halborn (Smart Contracts - Alula Finance)", "auditor": "Halborn" }
  ]
}
```

Row 1 is the Veridise Soroban Core report. `severity` is `"critical"`. Second row is an unrelated Halbert/Alula hit (vector neighbour).

**https://stellarlight.xyz/api/research?q=V-SOR-APP-VUL-999&limit=2** (2026-08-30T12:30:03.193Z)

`meta` **does** contain `exactMiss`:

```json
"exactMiss": {
  "identifiers": ["V-SOR-APP-VUL-999"],
  "note": "The indexed corpus contains no chunk carrying this identifier verbatim. The rows below are the nearest SEMANTIC neighbours of the query — they are not that finding, and their confidence scores rank similarity, not a match. Do not report V-SOR-APP-VUL-999 as found, and do not infer its content from these rows."
}
```

Rows returned: OtterSec Soroban Governor; Halborn Alula. Neither is the missing identifier.

Also hit: `https://veridise.com/audits/soroban/` (marketing; lists later Soroban *application* audits, not the Core V2/V2.1 PDF text). `https://stellarsecurityportal.com/report/42` and `https://sorobansecurity.com/reports` returned SPA shells (HTTP 200, ~502 bytes HTML), not the PDF body.

---

## Item 2 — Ledger close interval

### Claims

| # | Claim | Verdict |
|---|---|---|
| 2.1 | Official docs/sites that state a close-time **number** | **confirmed** (several pages; numbers are not identical) |
| 2.2 | Any official page still says **“3–5 seconds”** | **contradicted** (not found on developers.stellar.org or stellar.org) |
| 2.3 | Any official page still says **“about 5 seconds”** | **disputed** (no exact phrase; close paraphrases exist: “5-second”, “~5-second”, “target ~5 s”, “under 6 seconds”) |
| 2.4 | Live Pubnet `closed_at` deltas over ≥100 consecutive ledgers | **confirmed-as-of** ledger 64193568–64193767 (199 deltas) |
| 2.5 | CAP-0070 makes SCP timing / target close time configurable | **confirmed** |

### Official pages that state a number (search “seconds”)

**https://stellar.org/soroban** (2026-08-30):

> Benefit from **5-second smart contract finality** on a mature network with 150 real-time TPS.

**https://stellar.org/learn/intro-to-stellar** (2026-08-30), footnote 1:

> The Stellar network achieves consensus in **under 6 seconds** and relies on Federated Byzantine Agreement consensus which enjoys instant TTF.

**https://developers.stellar.org/docs/build/guides/storage/storage-strategies** (2026-08-30):

> The current maximum is 3,110,400 ledgers — approximately 180 days at today's **~5-second ledger close time**.\
> Also: “Per ledger (**target ~5 s today**) | Limit” in the resource table (web-search extract); body later: “BALANCE_BUMP_AMOUNT … target ~30 days **at the current close time**” and `DAY_IN_LEDGERS: u32 = 17280`.

**https://developers.stellar.org/docs/learn/fundamentals/fees-resource-limits-metering** (2026-08-30):

> Stellar’s ledger close time is constrained to **a few seconds**, preventing the execution of arbitrarily large transactions…

**https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/ledgers** (2026-08-30) — close *clock accuracy*, not interval:

> The close time is a UNIX timestamp indicating when the ledger closes. … SCP may confirm a close time that lags **a few seconds behind or up to 60 seconds ahead**. It's strictly monotonic.

**https://developers.stellar.org/docs/networks** — no close-interval number.

**https://github.com/stellar/stellar-protocol/blob/master/core/cap-0070.md** (raw 2026-08-30). Title: Configurable SCP Timing Parameters. Protocol version 23. Simple Summary:

> This CAP introduces ledger configuration settings allowing the Stellar network to dynamically adjust **ledger close times, nomination timeouts, and ballot timeouts**…

Configurable settings: `ledgerTargetCloseTimeMilliseconds` (initial **5000**, range **[4000, 5000]**), `nominationTimeoutInitialMilliseconds`, `nominationTimeoutIncrementMilliseconds`, `ballotTimeoutInitialMilliseconds`, `ballotTimeoutIncrementMilliseconds`.

> While significant changes, such as going from **5 seconds to 2.5 seconds**, will require significant protocol work…\
> downstream systems may assume a **consistent 5 second block time**…

CAP-0070 therefore makes **target ledger close time and SCP nomination/ballot timeouts** network-configurable (within those ranges; further range changes need a later protocol).

“3–5 seconds” appears on **xrpl.org** Ledger Close Times and on Stellar **Stack Exchange** (2018), not on official Stellar docs/sites today.

### Horizon empirical close deltas

**https://horizon.stellar.org/ledgers?order=desc&limit=200** (2026-08-30 ~12:30Z)

- 200 consecutive Pubnet ledgers, sequences **64193568 … 64193767** (confirmed `seq[0]-seq[-1]+1 == 200`).
- Window: `closed_at` 2026-08-30T12:11:05Z → 2026-08-30T12:29:55Z.
- 199 consecutive `closed_at` deltas (seconds):

| stat | value |
|---|---|
| min | **5.0** |
| max | **7.0** |
| mean | **5.678** |
| median | **6.0** |
| histogram | 5s×78, 6s×107, 7s×14 |

Latest record used: `sequence=64193767`, `closed_at=2026-08-30T12:29:55Z`, `protocol_version=27`.

---

## Item 3 — Base reserve / minimum balance / pool-share trustlines

### Claims

| # | Claim | Verdict |
|---|---|---|
| 3.1 | Current Mainnet base reserve is **5_000_000 stroops** | **confirmed-as-of** ledger **64193767** |
| 3.2 | Lumens + accounts pages on min balance and pool-share trustlines | **confirmed** (quoted); they treat pool shares as ordinary subentries |
| 3.3 | Pool-share trustline consumes **2** base reserves | **disputed** vs lumens/accounts wording; **confirmed** by liquidity-pools docs + CAP-0038 |
| 3.4 | `getMinBalance` in stellar-core | **confirmed** |

### Live Horizon

**https://horizon.stellar.org/ledgers?order=desc&limit=200** latest record (2026-08-30):

```json
{
  "sequence": 64193767,
  "closed_at": "2026-08-30T12:29:55Z",
  "base_reserve_in_stroops": 5000000,
  "base_fee_in_stroops": 100,
  "protocol_version": 27
}
```

5_000_000 stroops = 0.5 XLM.

### Official docs

**https://developers.stellar.org/docs/learn/fundamentals/lumens** (2026-08-30):

> One base reserve is currently **0.5 XLM**.\
> An account must always maintain a minimum balance of **two base reserves (currently 1 XLM)**. Every subentry after that requires an additional base reserve (currently 0.5 XLM)… Subentries include **trustlines (for both traditional assets and pool shares)**, offers, signers, and data entries. An account cannot have more than 1,000 subentries.

**https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts** (2026-08-30):

> One base reserve is currently **0.5 XLM**.\
> Possible subentries are: **Trustlines (includes traditional assets and pool shares)**; Offers; Additional signers; Data entries…

**https://developers.stellar.org/docs/learn/fundamentals/liquidity-on-stellar-sdex-liquidity-pools** (2026-08-30) — stronger, explicit exception:

> 2) A pool share trustline requires **2 base reserves instead of 1**. For example, an account (2 base reserves) with a trustline for asset A (1 base reserve), a trustline for asset B (1 base reserve), and a trustline for the A-B pool share (**2 base reserves**) would have a reserve requirement of **6 base reserves**.

**https://github.com/stellar/stellar-protocol/blob/master/core/cap-0038.md** (2026-08-30):

> The pool share trust line should count as **two subentries (and therefore require two base reserves)**\
> The `TrustLineEntry` for pool shares require **two base reserves**.

### stellar-core `getMinBalance`

**https://raw.githubusercontent.com/stellar/stellar-core/master/src/transactions/TransactionUtils.cpp** (2026-08-30):

```cpp
int64_t
getMinBalance(LedgerHeader const& lh, uint32_t numSubentries,
              uint32_t numSponsoring, uint32_t numSponsored)
{
    if (protocolVersionIsBefore(lh.ledgerVersion, ProtocolVersion::V_14) &&
        (numSponsored != 0 || numSponsoring != 0))
    {
        throw std::runtime_error("unexpected sponsorship state");
    }

    if (protocolVersionIsBefore(lh.ledgerVersion, ProtocolVersion::V_9))
    {
        return (2 + numSubentries) * lh.baseReserve;
    }
    else
    {
        int64_t effEntries = 2LL;
        effEntries += numSubentries;
        effEntries += numSponsoring;
        effEntries -= numSponsored;
        if (effEntries < 0)
        {
            throw std::runtime_error("unexpected account state");
        }
        return effEntries * int64_t(lh.baseReserve);
    }
}
```

The function itself does not special-case pool shares; the extra reserve is applied by counting the pool-share trustline as **two** `numSubEntries` (CAP-0038). `lh.baseReserve` on Mainnet today is 5_000_000 stroops.

---

## Item 4 — FinClusive

### Claims

| # | Claim | Verdict |
|---|---|---|
| 4.1 | Legal self-description: third-party service provider, **not a bank**, **not an MSB** | **confirmed** |
| 4.2 | Marketing claims on CaaS product page | **confirmed** (quoted) |
| 4.3 | stellar.org blog names **Biccos** | **confirmed** |

**https://finclusive.com/company/operating-provisions** (2026-08-30), §3.1.1:

> Third Party Service Provider (TPSP). FinClusive is **not a bank**, does not have a banking charter and is **not a licensed Money Services Business**. Rather FinClusive is an **exempt third party services provider**, providing compliance services and tools to assist its payment partners and “banks of records” (BoRs) in meeting their legal and regulatory compliance obligations.

Also: “FBO Accounts - NOT FDIC INSURED.” (typo “FinCluisve” on the live page).

**https://finclusive.com/products/compliance-as-a-service** (2026-08-30) marketing claims:

> Enable your organization with an automated, full-stack, and global financial crimes compliance (FCC) solution\
> Single FCC workflow and orchestration layer integrating hundreds of data sources…\
> Global know-your-customer/business (KYC/KYB) coverage…\
> 500+ integrated global sanctions, watchlist, criminal background, and PEP screens.\
> Evaluate 'actual' vs 'perceived' risk.\
> One platform + one contract + one integration = efficiency, speed, and cost savings.\
> FinCID: Compliance-Backed Verifiable Credentials\
> As a certified GLEIF validation agent, FinClusive can issue legal entity identifiers (LEIs)…

**https://stellar.org/blog/policy/drive-inclusion-through-compliance** (2026-08-30):

> #### Use Case: Biccos\
> FinClusive’s partnership with **Biccos** provides a good example. With **Biccos, an anchor in Mexico**, FinClusive is working to enable money-service businesses to facilitate quicker cross-border remittances.

Yes, the live blog names Biccos.

---

## Item 5 — Stellar wallets (Light directory + docs)

### Claims

| # | Claim | Verdict |
|---|---|---|
| 5.1 | Search API `generatedAt`, `total`, type field, Wallet counts | **confirmed-as-of** 2026-08-30T12:31:05Z |
| 5.2 | First-page names | **confirmed-as-of** (99 names) |
| 5.3 | Docs wallets page lists Freighter, Lobstr, xBull | **confirmed** |

**https://stellarlight.xyz/api/projects/search?q=wallet&limit=100&offset=0**\
**https://stellarlight.xyz/api/projects/search?q=wallet&limit=100&offset=100**

`meta` (offset=0, generatedAt `2026-08-30T12:31:05.094Z`):

```json
{
  "source": "https://stellarlight.xyz/directory",
  "generatedAt": "2026-08-30T12:31:05.094Z",
  "filters": {"q": "wallet", "category": null, "type": null, "status": null, "scfAwarded": false, "scfAwardedOnly": false, "limit": 100, "offset": 0},
  "matchMode": "strict",
  "matchModeLabel": "all keywords matched",
  "counts": {"returned": 99, "total": 183, "semantic": 0}
}
```

Offset=100: `generatedAt` `2026-08-30T12:31:05.678Z`, `counts.returned=87`, `counts.total=183`.

There is **no scalar `type` field**. Project type is carried on:

- **`types`**: array of strings (e.g. `["Wallet"]`, `["Wallet","Payments"]`)
- also `category` (e.g. `User-Facing App`) and `productKind` (e.g. `end-user-wallet`)

Counts over the unique 183 projects (3 name overlaps between pages: Coca, Stellar Passport, Pakana.Net):

| definition | count |
|---|---|
| `types == ["Wallet"]` (exact sole type) | **31** |
| `"Wallet"` ∈ `types` | **66** |

First-page names (`projects[0..98]`, offset=0, n=99):\
Lobstr, xBull, Freighter, Hana, Beans, Albedo, Decaf, Rabet, Vesseo, Solar Wallet, Stellar Passport, Ledger, Trezor, HOT Wallet, Bitget Wallet, Klever, Cactus Link, Neon Wallet, Unstoppable Wallet, Hito Wallet, Freedom Pay Wallet, Ben Wallet, Bexo, MPCVault, Lumexo, Volta Circuit, SwiftEx, Stellar-MetaMask, Sollpay, Sentit, OneKey, human.tech, HedgePay, Freelii, Coca, Cobo, Bousol, AirGap, Peer, Meru, Kotani Pay, Bebop, Blaze, Cypher, OpenXSwitch, Scopuly, Akuna, Stellarport, Spatium, Simple Signer, Interstellar, Honey Coin, Empowch, Elsa, Boss Revolution, Arculus, Keystone, Tago Cash, Ripio, Pakana.Net, Lemon, Emigro, OpenZeppelin Stellar Privacy Wallet, Stellar Agent Wallet Skill, NemorixPay, DFNS, TypeScript Wallet SDK, Fordefi, WalletConnect, Piggy Wallet, Swift Wallet SDK, Flutter Wallet SDK, D'CENT, Paywit, xcapit, Wirex, Stellar Light, SocketFi, Palremit, Nobak, Blux, Abroad, Rehoboth, SAFU Protocol, Walletban, Wallet Guru, Infinity Wallet, Para, SAFU, Stellar Wallets Kit, Passkey Kit, Privy, uils, Soundness, Sendit, RampMeDaddy, Plutope, Coins PH, Airtm.

**https://developers.stellar.org/docs/tools/developer-tools/wallets** (2026-08-30). Stellar Wallet Kit supported wallets include:

> Albedo, **Freighter**, Hana, Ledger Hardware Wallet, Trezor Hardware Wallet, **Lobstr**, Rabet, WalletConnect, **xBull**, HOT Wallet

Freighter, Lobstr, and xBull are listed. Freighter also has its own heading “Freighter Wallet”. Blux list repeats Freighter, xBull, Lobstr.

---

## Item 6 — Protocol 27 “Zipper”

### Claims

| # | Claim | Verdict |
|---|---|---|
| 6.1 | software-versions heading + date for Protocol 27 Mainnet | **confirmed** |
| 6.2 | Horizon `current_protocol_version` today | **confirmed-as-of** 2026-08-30: **27** |
| 6.3 | Protocol 28 live on Mainnet? | **contradicted** (not live; page says Testnet TBD; Horizon is 27) |
| 6.4 | CAP-0071-02 “Protocol 28” deprecation sentence | **confirmed** |

**https://developers.stellar.org/docs/networks/software-versions** (2026-08-30):

Heading: **Protocol 27 (Mainnet, July 8, 2026)**\
Release notes: “New features in **Zipper, Protocol 27**”\
Also listed: Protocol 27 (Testnet, June 18, 2026); **Protocol 28 (Testnet, TBD)** at the top of the page.

**https://horizon.stellar.org/** (2026-08-30):

```json
{
  "horizon_version": "28.0.1-a70eb47f76985d372de3e59f4d75c7f8542752f7",
  "core_version": "stellar-core 28.0.1 (947aad8413c189d85504acf72207e85eeda9b021)",
  "network_passphrase": "Public Global Stellar Network ; September 2015",
  "current_protocol_version": 27,
  "core_supported_protocol_version": 28,
  "history_latest_ledger": 64193767
}
```

Software build 28.0.1 is deployed; **activated protocol on Pubnet is 27**. Protocol 28 is **not** live on Mainnet.

**https://raw.githubusercontent.com/stellar/stellar-protocol/master/core/cap-0071-02.md** (2026-08-30), section “No deprecation of `SOROBAN_CREDENTIALS_ADDRESS`”:

> However, **in the future protocol (28 or later) we may want to consider deprecating the old credential type and preimage type**, given that the clients will have had enough time to migrate to the new credentials and preimage type.

That is the Protocol 28 sentence. It is a *possible future* deprecation, not an enacted Protocol 28 change.

---

## Item 7 — Freighter on localhost

### Claims

| # | Claim | Verdict |
|---|---|---|
| 7.1 | `content_scripts.matches`, `run_at`, `all_frames` | **confirmed** |
| 7.2 | Latest GitHub release tag | **confirmed-as-of** 2026-08-26 publish / 2026-08-30 fetch: **5.46.0** |
| 7.3 | Exact HTTPS sentence on frontend-guide | **confirmed** |

**https://raw.githubusercontent.com/stellar/freighter/master/extension/public/static/manifest/v3.json** (2026-08-30). Manifest `version`/`version_name`: `5.45.0` (repo copy lags the release tag).

```json
"content_scripts": [
  {
    "matches": ["<all_urls>"],
    "js": ["contentScript.min.js"],
    "run_at": "document_start"
  }
]
```

- `matches`: `["<all_urls>"]`
- `run_at`: `"document_start"`
- **`all_frames` is not set** (omitted; Chrome default is `false`)

**https://api.github.com/repos/stellar/freighter/releases/latest** (2026-08-30):

```json
{
  "tag_name": "5.46.0",
  "name": "5.46.0",
  "published_at": "2026-08-26T20:27:49Z",
  "html_url": "https://github.com/stellar/freighter/releases/tag/5.46.0",
  "draft": false,
  "prerelease": false
}
```

**https://developers.stellar.org/docs/build/guides/dapps/frontend-guide** (2026-08-30), heading “Setup HTTPS on Localhost”:

> Freighter wallet requires a secure connection (HTTPS) to interact with your dapp. To enable HTTPS on localhost, you can use a tool like `mkcert`. Fortunately, Next.js provides built-in support for HTTPS.

That is the exact HTTPS sentence.

---

## URL inventory (every URL this lane hit)

| URL | Date | What was observed |
|---|---|---|
| https://veridise.com/wp-content/uploads/2025/02/VAR_Stellar_Soroban.pdf | 2026-08-30 | Live V2.1 PDF (Aug 27, 2025); Table 2.3 Critical=0; A.2.2 = V-SOR-APP-VUL-003 Critical DoS-during-auth |
| https://veridise.com/audits/soroban/ | 2026-08-30 | Veridise Soroban audit marketing / later app reports |
| https://veridise.com/wp-content/uploads/2024/01/VAR_Stellar_Soroban.pdf and other V2 path guesses | 2026-08-30 | HTTP 404 |
| https://stellarsecurityportal.com/report/42 | 2026-08-30 | SPA shell HTML, not the PDF |
| https://sorobansecurity.com/reports | 2026-08-30 | SPA shell HTML |
| https://stellarlight.xyz/api/research?q=V-SOR-APP-VUL-003&limit=2 | 2026-08-30T12:30:00Z | Veridise row, no `meta.exactMiss` |
| https://stellarlight.xyz/api/research?q=V-SOR-APP-VUL-999&limit=2 | 2026-08-30T12:30:03Z | `meta.exactMiss` present |
| https://horizon.stellar.org/ | 2026-08-30 | `current_protocol_version: 27` |
| https://horizon.stellar.org/ledgers?order=desc&limit=200 | 2026-08-30 | 200 ledgers; base_reserve 5000000; close deltas min 5 / max 7 / mean 5.678 / median 6 |
| https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/ledgers | 2026-08-30 | close-time accuracy quote |
| https://developers.stellar.org/docs/learn/fundamentals/lumens | 2026-08-30 | 0.5 XLM base reserve; min 2 reserves; pool shares listed as ordinary subentries |
| https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts | 2026-08-30 | same subentry list |
| https://developers.stellar.org/docs/learn/fundamentals/liquidity-on-stellar-sdex-liquidity-pools | 2026-08-30 | pool-share trustline = 2 base reserves |
| https://developers.stellar.org/docs/learn/fundamentals/fees-resource-limits-metering | 2026-08-30 | “a few seconds” |
| https://developers.stellar.org/docs/build/guides/storage/storage-strategies | 2026-08-30 | “~5-second ledger close time”; `DAY_IN_LEDGERS = 17280` |
| https://developers.stellar.org/docs/networks | 2026-08-30 | no close-interval number |
| https://developers.stellar.org/docs/networks/software-versions | 2026-08-30 | Protocol 27 Mainnet July 8, 2026 Zipper; Protocol 28 Testnet TBD |
| https://developers.stellar.org/docs/tools/developer-tools/wallets | 2026-08-30 | Freighter, Lobstr, xBull listed |
| https://developers.stellar.org/docs/build/guides/dapps/frontend-guide | 2026-08-30 | HTTPS-on-localhost sentence |
| https://stellar.org/soroban | 2026-08-30 | “5-second smart contract finality” |
| https://stellar.org/learn/intro-to-stellar | 2026-08-30 | “consensus in under 6 seconds” |
| https://stellar.org/blog/policy/drive-inclusion-through-compliance | 2026-08-30 | names Biccos |
| https://github.com/stellar/stellar-protocol/blob/master/core/cap-0070.md | 2026-08-30 | configurable SCP timings; 5000 ms initial |
| https://raw.githubusercontent.com/stellar/stellar-protocol/master/core/cap-0070.md | 2026-08-30 | same |
| https://raw.githubusercontent.com/stellar/stellar-protocol/master/core/cap-0071-02.md | 2026-08-30 | Protocol 28-or-later deprecation sentence |
| https://github.com/stellar/stellar-protocol/blob/master/core/cap-0038.md | 2026-08-30 | pool-share = two subentries |
| https://raw.githubusercontent.com/stellar/stellar-core/master/src/transactions/TransactionUtils.cpp | 2026-08-30 | `getMinBalance` |
| https://raw.githubusercontent.com/stellar/stellar-core/master/src/transactions/ChangeTrustOpFrame.cpp | 2026-08-30 | pool-share trustline management (use counts); extra reserve is via subentry count, not this snippet |
| https://finclusive.com/company/operating-provisions | 2026-08-30 | TPSP, not a bank, not an MSB |
| https://finclusive.com/products/compliance-as-a-service | 2026-08-30 | CaaS marketing claims |
| https://stellarlight.xyz/api/projects/search?q=wallet&limit=100&offset=0 | 2026-08-30T12:31:05Z | total 183, 99 returned |
| https://stellarlight.xyz/api/projects/search?q=wallet&limit=100&offset=100 | 2026-08-30T12:31:05Z | 87 returned |
| https://raw.githubusercontent.com/stellar/freighter/master/extension/public/static/manifest/v3.json | 2026-08-30 | matches `<all_urls>`, `run_at=document_start`, no `all_frames` |
| https://api.github.com/repos/stellar/freighter/releases/latest | 2026-08-30 | tag `5.46.0` |
| https://web.archive.org/cdx/search/cdx?… | 2026-08-30 | connection timeout |
| https://developers.stellar.org/docs/learn/fundamentals/contract-development/authorization | 2026-08-30 | `require_auth` docs (auth recursion context; not the audit ID) |
| xrpl.org ledger-close-times / stellar.stackexchange.com | 2026-08-30 | “3 to 5 seconds” / “3-5 seconds” — **not** official Stellar docs |

---

## Overall notes

- V2 PDF is not on the live Veridise URL set that still serves V2.1. Do not pin V2’s `V-SOR-VUL-002 = Critical authorization recursion` without that file. Pin V2.1: appendix `V-SOR-APP-VUL-003`, valid-table Critical = 0, Light exactMiss behaviour as of today.
- Close-time gospel should not pin 5.0 s. Official phrasing ranges from “5-second finality” to “under 6 seconds” to “~5-second”; live Pubnet median was **6 s** in this sample.
- Pool-share reserve: treat **2 base reserves** as protocol truth (CAP-0038 + liquidity-pools page). The lumens/accounts pages collapse pool shares into the generic 1-subentry trustline list.
- Protocol 28 is not Mainnet-live. CAP-0071-02 only *contemplates* deprecating `SOROBAN_CREDENTIALS_ADDRESS` in protocol 28 or later.
