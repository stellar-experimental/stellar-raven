# Item 8.13 (`docsprobe`): Canonical Docs Pages Re-Probe

- **Probed at:** `2026-11-20T00:30:06Z` (main pass) and `2026-11-20T00:31:40Z` (parity + mechanism follow-up)
- **Base commit:** `c52dca8a` (`origin/main`)
- **Local MCP server:** `http://localhost:8798/mcp` (`npm run dev -- --port 8798`, stopped cleanly after probing)
- **Paths probed:**
  1. **Raven `search`**: MCP `search` tool (default `limit: 7`, unfiltered and with `service: "stellarDocs"`), plus `await codemode.search(query)` inside `execute` to verify parity, plus executing the `#1`-ranked Docs operation to test whether following rank 1 hides the canonical page.
  2. **`stellarDocs.search_docs`**: via MCP `execute` (`hitsPerPage: 20`, reporting top-10 and top-20 ranks), paired with `stellarDocs.search_doc_titles` (`hitsPerPage: 10`), the page's natural scoped operation (`hitsPerPage: 10`), and direct Mintlify Discovery API (`POST https://api.mintlify.com/discovery/v1/search/stellardevelopmentfoundation`, `pageSize: 50`) to separate Mintlify ranking from Raven adapter scoping.
- **Stop rule respected:** Record and local finding only. No changes to ranking, catalog, keywords, scoring, or routing cases. No model calls. No upstream posts.

## Summary Matrix

| Canonical page | Raven `search` path | `stellarDocs.search_docs` (top 10) | Root cause / action |
|---|---|---|---|
| 1. Testnet reset section on `/docs/networks` (`#Testnet and Futurenet data reset`) | **Residual rank-1 misroute**: ranks `stellarDocs.search_soroban_contract_docs` #1 on all 3 queries; its path scope excludes `/docs/networks`. (`search_docs` is #2–3; `search_protocol_concepts_docs` is #3–4 or omitted from unfiltered top 7 on natural question.) | **Pass**: `/docs/networks` ranks **#1** (`testnet reset`, `Testnet and Futurenet data reset`) and **#2** (`when does Stellar testnet reset`). | Keep in TODO as a Raven `search` routing-only gap. No `sd-` finding. |
| 2. Custom Account example (`custom-account` -> HTTP 308 -> `/docs/build/smart-contracts/example-contracts/complex-account`, paired with `simple-account` and `/docs/build/guides/contract-accounts/examples`) | **Pass**: ranks `stellarDocs.search_soroban_contract_docs` #1 on all 4 queries; its scope covers `/docs/build/smart-contracts` and `/docs/build/guides/`. | **Pass**: `contract-accounts/examples` #1, `simple-account` #4, `complex-account` #5 on `"Custom Account example"`; all in top 10 across all 4 queries. `get_doc_page` follows the 308 redirect cleanly. | **Resolved on both paths.** Remove from TODO. No `sd-` finding. |
| 3. Fee-sponsorship pages (`/docs/build/guides/transactions/fee-sponsorship`, `fee-bump-transactions`, `sponsored-reserves`) | **Residual rank-1 misroute**: ranks `stellarDocs.search_rpc_horizon_data_docs` #1 for `"fee sponsorship"` / `"fee-sponsorship"` and `stellarDocs.search_protocol_concepts_docs` #1 for `"how to sponsor transaction fees on Stellar"`. Both #1 scopes exclude `/docs/build/guides/transactions/*`. (`search_soroban_contract_docs` is #2; `search_docs` is #3–4.) | **Pass**: all three pages rank in **top 5** on all 3 queries (`fee-sponsorship` #1–2, `fee-bump-transactions` #2–4, `sponsored-reserves` #3–5). | Keep in TODO as a Raven `search` routing-only gap. No `sd-` finding. |
| 4. Contract-ID derivation (`q-soroban-contract-id-derivation`: `/docs/learn/fundamentals/contract-development/contract-interactions/stellar-transaction`, secondary `/docs/tokens/stellar-asset-contract`) | **Pass**: ranks `stellarDocs.search_soroban_contract_docs` #1 on natural questions and control query (#2 behind `scout.listContracts` on bare `contractIDPreimage`); `search_docs` is #3–4 (#2 under `service: "stellarDocs"`). | **Fail on natural questions (Mintlify ranking)**: bare `contractIDPreimage` now ranks **#1** (improved since 2026-11-17), and `HOST_FUNCTION_TYPE_CREATE_CONTRACT` ranks **#1**. All **5 of 5** natural derivation queries omit both pages from top 10; 2 of 5 omit `stellar-transaction` from all Mintlify candidates (`pageSize: 50`). | Filed locally as **`sd-114`** (`improvements/stellar-docs/sd-114-docs-search-contract-id-derivation.md`, status `verified`, repo `stellar/stellar-docs`) on the `sd-112` precedent. |

---

## Page 1: Testnet Reset Section on `/docs/networks`

- **Expected page:** `/docs/networks` (heading `Testnet and Futurenet data reset`; also linked from `/docs/build/guides/basics/automate-reset-data`).
- **Why Raven `search` misroutes rank 1:** In `catalog/manifest.json`, `stellarDocs.search_soroban_contract_docs` has 139 keywords including `"reset"` (pulled from `/docs/build/guides/basics/automate-reset-data`, "Automating Testnet and Futurenet reset data", under `/docs/build/guides/`). Meanwhile `stellarDocs.search_protocol_concepts_docs` (whose scope is `/docs/learn/`, `/docs/networks`) has only 29 keywords and contains none of `testnet`, `reset`, or `network`.

### Queries and Results

| Query ID | Kind | Query | Raven `search` (unfiltered top 7) | Raven `search` (`service: "stellarDocs"`) | `stellarDocs.search_docs` rank of `/docs/networks` (top 10 / direct Mintlify 50) | `search_protocol_concepts_docs` rank |
|---|---|---|---|---|---|---|
| `Q1a` | Item wording | `testnet reset` | 1. `stellarDocs.search_soroban_contract_docs`<br>2. `skills.stellar-dev.agentic-payments`<br>3. `stellarDocs.search_docs`<br>4. `stellarDocs.search_protocol_concepts_docs` | 1. `search_soroban_contract_docs`<br>2. `search_docs`<br>3. `search_protocol_concepts_docs` | **#1** (`#Testnet and Futurenet data reset`) / **#1** of 50 | **#1** |
| `Q1b` | Question | `when does Stellar testnet reset` | 1. `stellarDocs.search_soroban_contract_docs`<br>2. `stellarDocs.search_docs`<br>3. `skills.openzeppelin-stellar.upgrade-stellar-contracts`<br>4. `stellarDocs.search_meeting_notes`<br>5. `skills.stellar-dev.agentic-payments`<br>6. `skills.stellar-dev.dapp`<br>7. `lumenloop.search_content_semantic` | 1. `search_soroban_contract_docs`<br>2. `search_docs`<br>3. `search_meeting_notes`<br>4. `search_protocol_concepts_docs`<br>5. `search_doc_titles` | **#2** (`#Testnet and Futurenet data reset`; #1 is `automate-reset-data`) / **#2** of 50 | **#1** |
| `Q1c` | Mechanism separator | `Testnet and Futurenet data reset` | 1. `stellarDocs.search_soroban_contract_docs`<br>2. `stellarDocs.search_docs`<br>3. `stellarDocs.search_protocol_concepts_docs`<br>4. `skills.stellar-dev.data`<br>5. `stellarDocs.search_rpc_horizon_data_docs`<br>6. `lumenloop.find_content_by_entity`<br>7. `skills.stellar-dev.agentic-payments` | 1. `search_soroban_contract_docs`<br>2. `search_docs`<br>3. `search_protocol_concepts_docs`<br>4. `search_rpc_horizon_data_docs`<br>5. `get_doc_page` | **#1** (`#Testnet and Futurenet data reset`) / **#1** of 50 | **#1** |

- **`codemode.search("testnet reset")` parity:** Identical order (`search_soroban_contract_docs`, `skills.stellar-dev.agentic-payments`, `search_docs`, `search_protocol_concepts_docs`).
- **Effect of calling Raven `search` rank #1 (`stellarDocs.search_soroban_contract_docs`):** For both `Q1a` and `Q1b`, `/docs/networks` is **absent** (excluded by path scope). Rank 1 is `/docs/build/guides/basics/automate-reset-data`, followed by `deploy-to-testnet`, `connect-testnet`, and testing/CLI pages. An agent that stops at rank #1 misses `/docs/networks` and the scheduled reset dates. An agent that also calls `stellarDocs.search_docs` (rank #2–3) hits `/docs/networks#Testnet and Futurenet data reset` at rank #1–2.
- **`search_doc_titles`:** `/docs/networks` is #6 on `Q1a` and outside top 10 on `Q1b`/`Q1c` (`automate-reset-data` is #1 on all three, because its title contains "Testnet", "Futurenet", and "reset").

---

## Page 2: Custom Account Example

- **Canonical live path check:** `GET https://developers.stellar.org/docs/build/smart-contracts/example-contracts/custom-account` returns **HTTP 308** -> `/docs/build/smart-contracts/example-contracts/complex-account` (`Complex Account`), paired with `/docs/build/smart-contracts/example-contracts/simple-account` (`Simple Account`) and `/docs/build/guides/contract-accounts/examples` (`Contract account examples`).
- **`get_doc_page` redirect check:** `stellarDocs.get_doc_page({ path: "/docs/build/smart-contracts/example-contracts/custom-account" })` returns `{ ok: true, path: "/docs/build/smart-contracts/example-contracts/complex-account", title: "Complex Account" }`.

### Queries and Results

| Query ID | Kind | Query | Raven `search` (unfiltered top 5) | `stellarDocs.search_docs` ranks (top 10) | `search_soroban_contract_docs` ranks (top 10) | `search_doc_titles` ranks (top 10) | Direct Mintlify (`pageSize: 50`) |
|---|---|---|---|---|---|---|---|
| `Q2a` | Item wording | `Custom Account example` | 1. `stellarDocs.search_soroban_contract_docs`<br>2. `stellarDocs.search_asset_token_docs`<br>3. `lumenloop.search_content_semantic`<br>4. `lumenloop.search_documents`<br>5. `stellarDocs.get_doc_page` | `contract-accounts/examples`: **#1**<br>`simple-account`: **#4**<br>`complex-account`: **#5**<br>`contract-accounts`: **#6** | `contract-accounts/examples`: **#1**<br>`simple-account`: **#3**<br>`complex-account`: **#4** | `contract-accounts/examples`: **#2**<br>`simple-account`: **#3**<br>`complex-account`: **#4** | 36 sections; `examples` #1, `simple-account` #5, `complex-account` #6 |
| `Q2b` | Question | `Soroban custom account contract example` | 1. `stellarDocs.search_soroban_contract_docs`<br>2. `scout.listContracts`<br>3. `skills.openzeppelin-stellar.setup-stellar-contracts`<br>4. `stellarDocs.search_asset_token_docs`<br>5. `scout.searchRepos` | `contract-accounts/examples`: **#1**<br>`complex-account`: **#4**<br>`contract-accounts`: **#6**<br>`simple-account`: **#9** | `contract-accounts/examples`: **#1**<br>`complex-account`: **#4**<br>`simple-account`: **#9** | `contract-accounts/examples`: **#2**<br>`contract-accounts`: **#3**<br>`complex-account`: **#8**<br>`simple-account`: **#9** | 41 sections; `examples` #1, `complex-account` #4, `simple-account` #9 |
| `Q2c` | Mechanism separator | `Complex Account example` | 1. `stellarDocs.search_soroban_contract_docs`<br>2. `lumenloop.get_related_projects`<br>3. `lumenloop.search_content_semantic`<br>4. `lumenloop.search_documents`<br>5. `stellarDocs.get_doc_page` | `contract-accounts`: **#1**<br>`simple-account`: **#3**<br>`complex-account`: **#7**<br>`contract-accounts/examples`: **#8** | `contract-accounts`: **#1**<br>`simple-account`: **#3**<br>`complex-account`: **#7**<br>`contract-accounts/examples`: **#8** | **`complex-account`: #1**<br>`contract-accounts`: **#2**<br>`simple-account`: **#4**<br>`examples`: **#5** | 43 sections; `contract-accounts` #1, `simple-account` #3, `complex-account` #7 |
| `Q2d` | Mechanism separator | `custom account __check_auth` | 1. `stellarDocs.search_soroban_contract_docs`<br>2. `stellarDocs.search_asset_token_docs`<br>3. `skills.lumenloop.scf-submission-radar` | `complex-account`: **#2**<br>`simple-account`: **#5**<br>`contract-accounts`: **#9** | `complex-account`: **#2**<br>`simple-account`: **#5**<br>`contract-accounts`: **#9** | `complex-account`: **#4**<br>`simple-account`: **#7** | 40 sections; `complex-account` #2, `simple-account` #5 |

- **`codemode.search("Custom Account example")` parity:** Identical top 7 (`stellarDocs.search_soroban_contract_docs` #1).
- **Verdict:** No miss on either path. Both Raven `search` (#1 `search_soroban_contract_docs`, which includes `/docs/build/smart-contracts` and `/docs/build/guides/`) and `stellarDocs.search_docs` reach all canonical Custom/Complex/Simple Account example pages in top 10.

---

## Page 3: Fee-Sponsorship Pages

- **Expected pages:** `/docs/build/guides/transactions/fee-sponsorship` (`Choose a fee sponsorship approach`), `/docs/build/guides/transactions/fee-bump-transactions` (`Fee-bump transactions`), `/docs/build/guides/transactions/sponsored-reserves` (`Sponsored reserves`).
- **Why Raven `search` misroutes rank 1:** In `catalog/manifest.json`, `stellarDocs.search_rpc_horizon_data_docs` has 164 keywords including `"fee"`, `"sponsoring"`, and `"sponsorship"` (derived from Horizon API reference pages such as `begin-sponsoring-future-reserves`, `end-sponsoring-future-reserves`, `revoke-sponsorship`, and `fee-stats` under `/docs/data/apis/horizon/`). Its path scope (`/docs/data`, `/docs/build/guides/rpc/`) excludes `/docs/build/guides/transactions/*`. On natural question wording (`Q3c`), `stellarDocs.search_protocol_concepts_docs` (`/docs/learn/`, `/docs/networks`) ranks #1 and also excludes `/docs/build/guides/transactions/*`.

### Queries and Results

| Query ID | Kind | Query | Raven `search` (unfiltered top 6) | `stellarDocs.search_docs` ranks (top 10) | `search_soroban_contract_docs` ranks (top 10) | `search_doc_titles` ranks (top 10) | Direct Mintlify (`pageSize: 50`) |
|---|---|---|---|---|---|---|---|
| `Q3a` | Item wording | `fee sponsorship` | 1. `stellarDocs.search_rpc_horizon_data_docs`<br>2. `stellarDocs.search_soroban_contract_docs`<br>3. `lumenloop.list_research`<br>4. `stellarDocs.search_docs`<br>5. `stellarDocs.search_docs_in_category`<br>6. `stellarDocs.search_protocol_concepts_docs` | `fee-sponsorship`: **#2**<br>`fee-bump-transactions`: **#4**<br>`sponsored-reserves`: **#5** (#1 is `x402/seller-and-agent-guide#Fee sponsorship`) | `fee-sponsorship`: **#1**<br>`fee-bump-transactions`: **#2**<br>`sponsored-reserves`: **#3** | `fee-sponsorship`: **#1**<br>`fee-bump-transactions`: **#2** | 48 sections; `fee-sponsorship` #2, `fee-bump` #4, `sponsored-reserves` #5 |
| `Q3b` | Item wording | `fee-sponsorship` | 1. `stellarDocs.search_rpc_horizon_data_docs`<br>2. `stellarDocs.search_soroban_contract_docs`<br>3. `lumenloop.list_research`<br>4. `stellarDocs.search_docs`<br>5. `stellarDocs.search_docs_in_category`<br>6. `stellarDocs.search_protocol_concepts_docs` | `fee-sponsorship`: **#2**<br>`sponsored-reserves`: **#3**<br>`fee-bump-transactions`: **#4** | `fee-sponsorship`: **#1**<br>`sponsored-reserves`: **#2**<br>`fee-bump-transactions`: **#3** | `fee-sponsorship`: **#1**<br>`fee-bump-transactions`: **#2** | 44 sections; `fee-sponsorship` #2, `sponsored-reserves` #3, `fee-bump` #4 |
| `Q3c` | Question | `how to sponsor transaction fees on Stellar` | 1. `stellarDocs.search_protocol_concepts_docs`<br>2. `stellarDocs.search_soroban_contract_docs`<br>3. `stellarDocs.search_docs`<br>4. `stellarDocs.search_docs_in_category`<br>5. `skills.stellar-dev.agentic-payments`<br>6. `stellarDocs.search_asset_token_docs` | `fee-sponsorship`: **#1**<br>`fee-bump-transactions`: **#2**<br>`sponsored-reserves`: **#5** | `fee-sponsorship`: **#1**<br>`fee-bump-transactions`: **#2**<br>`sponsored-reserves`: **#4** | `fee-sponsorship`: **#3**<br>`sponsored-reserves`: **#4**<br>`fee-bump-transactions`: **#5** | 44 sections; `fee-sponsorship` #1, `fee-bump` #2, `sponsored-reserves` #5 |

- **`codemode.search("fee sponsorship")` parity:** Identical order (`stellarDocs.search_rpc_horizon_data_docs` #1, `stellarDocs.search_soroban_contract_docs` #2).
- **Effect of calling Raven `search` rank #1:**
  - `Q3a` / `Q3b` via `stellarDocs.search_rpc_horizon_data_docs`: **0 of 3** canonical guide pages appear; all 10 hits are Horizon/RPC API reference and Hubble data dictionary pages (`revoke-sponsorship`, `fee-stats`, `getFeeStats`, etc.).
  - `Q3c` via `stellarDocs.search_protocol_concepts_docs`: **0 of 3** canonical guide pages appear; all 8 hits are under `/docs/learn/fundamentals/` (`stellar-transaction`, `fees-resource-limits-metering`, etc.).
  - Calling rank #2 (`search_soroban_contract_docs`) or `search_docs` (rank #3–4) surfaces all three canonical pages in top 5.

---

## Page 4: Contract-ID Derivation (`q-soroban-contract-id-derivation`)

- **Expected primary page:** `/docs/learn/fundamentals/contract-development/contract-interactions/stellar-transaction` (under `### InvokeHostFunctionOp` -> `#### Function` -> item `3. HOST_FUNCTION_TYPE_CREATE_CONTRACT`, which defines `ContractIDPreimage`, `HashIDPreimage`, `ENVELOPE_TYPE_CONTRACT_ID`, and the SHA-256 hash with `networkID`).
- **Expected secondary page (named in TODO):** `/docs/tokens/stellar-asset-contract` (under `### Deployment`: `"sha256 hash of HashIDPreimage::ENVELOPE_TYPE_CONTRACT_ID"`).

### Queries and Results

| Query ID | Kind | Query | Raven `search` (unfiltered top 4) | `stellarDocs.search_docs` ranks (`stellar-transaction` / `stellar-asset-contract`) | `search_soroban_contract_docs` rank (`stellar-transaction`, top 10) | Direct Mintlify `pageSize: 50` (`stellar-transaction` / `stellar-asset-contract`, total sections) |
|---|---|---|---|---|---|---|
| `Q4a` | Question | `how is a Soroban contract ID derived` | 1. `search_soroban_contract_docs`<br>2. `scout.listContracts`<br>3. `search_asset_token_docs`<br>4. `search_docs` | Top 10: **absent / absent**<br>Top 20: **absent / absent** | **absent** | **absent / #31** (40 sections) |
| `Q4b` | Question (page words) | `Soroban contract ID derivation sha256 network identifier` | 1. `search_soroban_contract_docs`<br>2. `scout.listContracts`<br>3. `search_docs`<br>4. `skills.openzeppelin-stellar.upgrade-stellar-contracts` | Top 10: **absent / absent**<br>Top 20: **#15 / absent** | **#7** | **#16 / #47** (50 sections) |
| `Q4c` | Item query | `contractIDPreimage` | 1. `scout.listContracts`<br>2. `search_soroban_contract_docs`<br>3. `search_docs`<br>4. `skills.openzeppelin-stellar.develop-secure-contracts` | Top 10: **#1 / #3** | **#1** | **#1 / #3** (50 sections) |
| `Q4d` | Item control | `HOST_FUNCTION_TYPE_CREATE_CONTRACT` | 1. `search_soroban_contract_docs`<br>2. `skills.openzeppelin-stellar.setup-stellar-contracts`<br>3. `scout.listContracts`<br>4. `skills.stellar-dev.zk-proofs` | Top 10: **#1 / #3** | **#1** | **#1 / #3** (50 sections) |
| `Q4e` | Mechanism separator | `ContractIDPreimage HashIDPreimage` | 1. `search_soroban_contract_docs`<br>2. `scout.listContracts`<br>3. `skills.openzeppelin-stellar.develop-secure-contracts`<br>4. `skills.openzeppelin-stellar.setup-stellar-contracts` | Top 10: **#5 / #7** | **#3** | **#6 / #8** (50 sections) |
| `Q4f` | Mechanism separator (deployer phrasing) | `how is a Soroban contract ID calculated from deployer address and salt` | *(Mintlify ranking check)* | Top 10: **absent / absent**<br>Top 20: **absent / #13** | — | **absent / #14** (35 sections; #1–2 are `deployer` and `deploy-contract`, neither stating SHA-256 / `HashIDPreimage` / `networkID`) |
| `Q4g` | Mechanism separator (address phrasing) | `how are Soroban contract addresses derived` | *(Mintlify ranking check)* | Top 10: **absent / absent**<br>Top 20: **absent / absent** | — | **#36 / #21** (46 sections) |
| `Q4h` | Mechanism separator (preimage phrasing) | `contract ID preimage network ID` | *(Mintlify ranking check)* | Top 10: **absent / absent**<br>Top 20: **#18 / absent** | — | **#19 / #32** (50 sections) |

- **`codemode.search("how is a Soroban contract ID derived")` parity:** Identical top 4 (`search_soroban_contract_docs` #1, `scout.listContracts` #2, `search_asset_token_docs` #3, `search_docs` #4).
- **What changed since 2026-11-17:** Bare `contractIDPreimage` (`Q4c`) now returns `/docs/learn/fundamentals/contract-development/contract-interactions/stellar-transaction` at **rank 1** (and `/docs/tokens/stellar-asset-contract` at rank 3), matching the `HOST_FUNCTION_TYPE_CREATE_CONTRACT` control (`Q4d`).
- **What still misses (proven Mintlify upstream ranking/chunking):** All 5 natural derivation queries (`Q4a`, `Q4b`, `Q4f`, `Q4g`, `Q4h`) omit both pages from `stellarDocs.search_docs` top 10. Direct Mintlify Discovery API calls (`pageSize: 50`) match the Raven adapter results (the 1-rank offset on `Q4b`/`Q4e`/`Q4h` is a single `/meetings/` section excluded by `search_docs` default scope): `stellar-transaction` is completely absent from all returned sections on `Q4a` (0/40) and `Q4f` (0/35), and buried at ranks 16, 19, and 36 on `Q4b`, `Q4h`, and `Q4g`.
- **Action taken:** Filed locally as `improvements/stellar-docs/sd-114-docs-search-contract-id-derivation.md` (`status: verified`, intake override `stellar/stellar-docs`) on the `sd-112` precedent, and regenerated `improvements/INDEX.md`.

---

## Implied `.agents/TODO.md` Change (for Orchestrator)

Do not delete "Fix Docs search misses on canonical pages" outright; narrow and update it:

1. **Drop Custom Account example** (resolved on both paths; `/docs/build/smart-contracts/example-contracts/custom-account` now 308-redirects to `complex-account`, and both Raven `search` and `stellarDocs.search_docs` surface `contract-accounts/examples`, `simple-account`, and `complex-account` cleanly).
2. **Close the `stellarDocs.search_docs` / Mintlify ranking bullet onto `sd-114`**: record that on 2026-11-20 bare `contractIDPreimage` now ranks `stellar-transaction` #1, while natural derivation questions still miss Mintlify top 10 (and even all 50 candidates on 2 of 5 phrasings) and are now tracked locally in `improvements/stellar-docs/sd-114-docs-search-contract-id-derivation.md` (awaiting upstream posting decision). Note that all three HackMeridian pages pass `stellarDocs.search_docs` top 5 today.
3. **Retain only the two remaining Raven `search` rank-1 routing misses** (referencing this probe record):
   - **Testnet reset (`/docs/networks`)**: Raven `search` ranks `search_soroban_contract_docs` #1 (scope excludes `/docs/networks`) because `automate-reset-data` injects `"reset"` into `search_soroban_contract_docs` keywords while `search_protocol_concepts_docs` lacks `"testnet"`, `"reset"`, and `"network"`.
   - **Fee sponsorship (`/docs/build/guides/transactions/fee-sponsorship`, `fee-bump-transactions`, `sponsored-reserves`)**: Raven `search` ranks `search_rpc_horizon_data_docs` #1 for `"fee sponsorship"` / `"fee-sponsorship"` (Horizon operation pages inject `fee`/`sponsoring`/`sponsorship`) and `search_protocol_concepts_docs` #1 for `"how to sponsor transaction fees on Stellar"`; both #1 scopes exclude `/docs/build/guides/transactions/*`.
   - **Keep held/gated on routing headroom:** any general routing/keyword fix waits for routing-gate headroom (`holdout top1`, `top3`, and forbidden captures sit on their gate limits, tracked with the routing repair / #223).
