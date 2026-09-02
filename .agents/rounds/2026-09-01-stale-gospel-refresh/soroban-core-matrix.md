# Soroban core matrix — stale-gospel refresh

Round: `.agents/rounds/2026-09-01-stale-gospel-refresh.md`
Lane: Soroban privacy, migration, and Reflector
Worker: Claude (Fable 5.1), high effort, research only
Observed: 2026-09-02 between 00:42 and 00:48 UTC (all "observed" dates below are 2026-09-02 unless stated)
Constraints honored: no case-file, TODO, NEXT, or main-ledger edits; no paid Lumenloop call; no faucet; prior
`truth.verified` evidence was not used as a source. Every volatile claim below has at least two independent
source classes with at least one primary class (A official docs or B source code).

Source-class letters follow `.agents/skills/golden-truth/SKILL.md` §Step 2:
A official docs/sites · B source code/repos · C live service APIs · D general-web research ·
E Stellar Docs search index (via `stellarDocs.search_docs`) · F empirical execution.

## Live network context (applies to all three cases)

| Fact | Value | Class | Evidence |
| --- | --- | --- | --- |
| Mainnet protocol | 27 (RPC 27.1.1, captive core 27.1.0) | C | `POST https://mainnet.sorobanrpc.com getNetwork/getVersionInfo` → `"protocolVersion":27` |
| Testnet protocol | 28 (RPC 28.0.1, core 28.0.1) | C | `POST https://soroban-testnet.stellar.org getNetwork` → `"protocolVersion":28` |
| Protocol 28 "Adapter" mainnet vote | 2026-09-16 17:00 UTC | A + B | https://stellar.org/blog/developers/adapter-protocol-28-upgrade-guide ("September 16, 2026, 1700 UTC — Mainnet upgrade vote"); https://github.com/stellar/stellar-core/releases/tag/v28.0.1 (published 2026-09-01) |
| Local CLI used for class-F probes | `stellar 27.1.0` | F | `stellar --version` |

None of the three cases pins a current protocol number, so P28 does not force a gospel change. It does
affect the `reverifyBy` recommendations below.

---

## Case 1 — `q-sor-confidential-tokens`

**Overall verdict: confirmed (as of 2026-09-02). No substantive judge-facing change is needed.**
Only the in-text `asOf` (currently **2026-07-10**) is stale; the status it dates is unchanged.

### Claim matrix

| # | Claim (from golden) | Verdict | Classes | Evidence (URL · observed · excerpt) |
| --- | --- | --- | --- | --- |
| 1.1 | Ordinary Stellar assets, SAC transfers, and SEP-41 tokens are public unless an application adds a privacy protocol | confirmed | A, B | A https://developers.stellar.org/docs/build/apps/privacy · 2026-09-02 · "Stellar is a public blockchain: every transaction is recorded onchain and visible to anyone." B https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0041.md (v0.5.1, Updated 2026-08-03) · public `balance(env, id) -> i128` getter and `transfer` events carrying `amount: i128`. |
| 1.2 | Confidential Tokens is a Testnet developer preview, unaudited, not Mainnet-approved default infrastructure | confirmed-as-of 2026-09-02 | A, A, B, D, E | A privacy docs (raw HTML grep) · "Confidential tokens on Stellar are a developer preview. The contracts and demo linked below are unaudited — not yet intended for production use or real assets." and "published on June 29, 2026 during the Testnet preview"; page last commit `stellar/stellar-docs` 21557e044aa5 2026-08-27. A https://stellar.org/blog/developers/developer-preview-confidential-tokens-on-stellar · editor's note "While they're not yet approved for mainnet, the Confidential Token contract is live on testnet." A https://developers.stellar.org/meetings/2026/08/06 · "Audits were days from starting at the time of the call; after remediation comes a stable release." B https://github.com/OpenZeppelin/stellar-contracts/tree/main/packages/tokens/src · `confidential/` directory present on default branch; latest release v0.7.2 (2026-06-09) predates it, so no tagged release yet carries it. D https://nansen.ai/post/stellar-q2-2026-report (2026-08-21) · "The preview is live on testnet and not yet approved for mainnet". E `stellarDocs.search_docs("confidential tokens developer preview")` → top hit `/docs/build/apps/privacy#confidential-tokens`. |
| 1.3 | Visibility boundary: balances and amounts private, sender/receiver addresses public | confirmed | A, A, D | A privacy docs · "keep token balances and transaction amounts private while keeping the sender and receiver's addresses publicly visible onchain." A blog post table (Public: addresses; Private: balances, transfer amounts). A meeting 2026-08-06 · "private balances and transfer amounts for SEP-41 tokens, with sender and recipient addresses kept public for compliance." D Nansen (same). |
| 1.4 | BLS12-381 (CAP-0059) and BN254/Poseidon (CAP-0074/0075) host functions are primitives, not a privacy product; CAP-59 Final/P22, CAP-74/75 Final/P25 (in `golden.notes`) | confirmed | B, A, C | B https://github.com/stellar/stellar-protocol/blob/master/core/cap-0059.md · preamble `Status: Final` / `Protocol version: 22`; cap-0074.md · `Status: Final` / `Protocol version: 25`; cap-0075.md · `Status: Final` / `Protocol version: 25`. A https://developers.stellar.org/docs/build/apps/zk · primitives "do not, on their own, provide end-to-end private payments without additional higher-level protocol or application logic"; "The Poseidon host functions expose the underlying permutation primitives, not complete hash functions". A privacy docs · "Protocol 22, 25 ("X-Ray") and 26 ("Yardstick") releases introduced native host functions". C mainnet protocol 27 ≥ 25, so the primitives are live on Mainnet. |
| 1.5 | No universal Stellar "offline leaf" audit package; evidence is protocol- and role-specific (negative claim) | confirmed (source-relative, as of 2026-09-02) | A, D | A privacy docs · Confidential Tokens list "auditor view key" and "selective disclosure"; Stellar Private Payments list "Global View Keys" and "Association Set Providers" — two official privacy protocols with different disclosure mechanisms and no shared audit-evidence spec. D web sweep (perplexity + WebSearch, 2026-09-02) surfaced no Stellar standard for offline-leaf or cross-chain confidential audit evidence. Keep phrased as of-date. |
| 1.6 | In-text `asOf` **2026-07-10** | stale date, fact unchanged | — | Status re-confirmed 2026-09-02; refresh the date only. |

New context found (not a contradiction; optional "also good" material): Stellar Private Payments (Nethermind
privacy pool) entered developer preview on Testnet in August 2026 (https://stellar.org/blog/developers/developer-preview-stellar-private-payments, privacy docs section updated 2026-08-27).
Lumenloop's 2026-08-28 roundup also reports Moonlight private UTXO payment channels live on Mainnet
(https://lumenloop.com/research/stellar-weekly-roundup-week-aug-21-2026, class D only, not re-verified
here). Neither changes the "public by default unless an application adds privacy" framing.

### Required gospel changes

- `golden.answer`: replace "As of **2026-07-10**" with "As of **2026-09-02**". No other wording change.
- `truth.asOf` → `2026-09-02`; `truth.reverifyBy` → **2026-12-15** (see rationale).
- `truth.corroboration[]`: replace the two "verbatim legacy evidence descriptor" rows with the rows in the JSON
  block below (real URLs and dates).
- `truth.verified`: new event dated 2026-09-02, `by` = this lane, `rootCause` = `freshness-drift`.
- `eval/qa/consistency-register.json` → `dateContingentTraps` entry "2026-09-01/2026-11-19 review or any
  Confidential Tokens Mainnet approval/launch": update `disposition` to the new reverifyBy; trap stays open
  (no Mainnet approval evidence as of 2026-09-02; audits reported as about to start on 2026-08-06).

### reverifyBy rationale

Sibling `q-scf-confidential-tokens-preview` already rechecks the same trap on 2026-11-19. Staggering this
case to 2026-12-15 keeps one case in the cluster watching each quarter boundary and avoids a second cliff
on the same day. If Mainnet approval lands earlier, the register trigger reopens the cluster regardless.

### Sibling-case search terms and sweep

Search terms: `Confidential Token`, `developer preview`, `BLS12-381`, `BN254`, `Poseidon`, `CAP-0059`,
`CAP-0074`, `CAP-0075`, `X-Ray`, `Yardstick`, `privacy pool`, `Stellar Private Payments`, `view key`.

Cases hit (grep of `eval/qa/corpus/battery`, 2026-09-02): `q-scf-confidential-tokens-preview`
(asOf 2026-07-11, reverifyBy 2026-11-19, says "live on Testnet, not approved for Mainnet"),
`q-edge-noinfo-stellar-native-privacy-default` ("Testnet Confidential Tokens developer preview"),
`q-zk-host-functions-status` (asOf 2026-07-11: CAP-0059 P22, CAP-0074/0075 P25),
`q-protocol-bls12-381-cap59`, `q-protocol-bn254-poseidon-xray`, `q-pc-protocol-26-yardstick`,
`q-protocol-version-history-list`, `q-sor-cross-warmancer-zk-stack`, `q-zk-poseidon-input-encoding`,
`q-zk-proof-systems-stellar`. Verdict: no contradiction with the re-derived facts. The privacy-docs page
now also documents Stellar Private Payments; `q-edge-noinfo-stellar-native-privacy-default` already says
"privacy pools", so it is compatible.

### Corroboration rows (paste-ready)

```json
[
  {"claim":"Confidential Tokens is a Testnet developer preview, unaudited and not Mainnet-approved, as of 2026-09-02.","verdict":"confirmed-as-of","evidence":[
    {"class":"A","ref":"https://developers.stellar.org/docs/build/apps/privacy","observedAt":"2026-09-02","note":"'developer preview ... unaudited — not yet intended for production use or real assets'; 'published on June 29, 2026 during the Testnet preview'"},
    {"class":"A","ref":"https://stellar.org/blog/developers/developer-preview-confidential-tokens-on-stellar","observedAt":"2026-09-02","note":"editor's note: 'not yet approved for mainnet, the Confidential Token contract is live on testnet'"},
    {"class":"A","ref":"https://developers.stellar.org/meetings/2026/08/06","observedAt":"2026-09-02","note":"'Audits were days from starting at the time of the call; after remediation comes a stable release.'"},
    {"class":"B","ref":"https://github.com/OpenZeppelin/stellar-contracts/tree/main/packages/tokens/src/confidential","observedAt":"2026-09-02","note":"confidential package exists on main; latest tagged release v0.7.2 (2026-06-09) predates it"},
    {"class":"D","ref":"https://nansen.ai/post/stellar-q2-2026-report","observedAt":"2026-09-02","note":"'live on testnet and not yet approved for mainnet' (2026-08-21)"}]},
  {"claim":"Confidential Tokens hide balances and transfer amounts while sender and receiver addresses stay public.","verdict":"confirmed","evidence":[
    {"class":"A","ref":"https://developers.stellar.org/docs/build/apps/privacy","observedAt":"2026-09-02","note":"'keep token balances and transaction amounts private while keeping the sender and receiver's addresses publicly visible onchain'"},
    {"class":"A","ref":"https://developers.stellar.org/meetings/2026/08/06","observedAt":"2026-09-02","note":"'sender and recipient addresses kept public for compliance'"}]},
  {"claim":"CAP-0059 is Final at Protocol 22; CAP-0074 and CAP-0075 are Final at Protocol 25; the host functions are primitives, not a privacy product.","verdict":"confirmed","evidence":[
    {"class":"B","ref":"https://github.com/stellar/stellar-protocol/blob/master/core/cap-0059.md","observedAt":"2026-09-02","note":"Status: Final; Protocol version: 22"},
    {"class":"B","ref":"https://github.com/stellar/stellar-protocol/blob/master/core/cap-0074.md","observedAt":"2026-09-02","note":"Status: Final; Protocol version: 25"},
    {"class":"B","ref":"https://github.com/stellar/stellar-protocol/blob/master/core/cap-0075.md","observedAt":"2026-09-02","note":"Status: Final; Protocol version: 25"},
    {"class":"A","ref":"https://developers.stellar.org/docs/build/apps/zk","observedAt":"2026-09-02","note":"'do not, on their own, provide end-to-end private payments without additional higher-level protocol or application logic'"},
    {"class":"C","ref":"https://mainnet.sorobanrpc.com getVersionInfo","observedAt":"2026-09-02","note":"protocolVersion 27 (primitives live on Mainnet)"}]}
]
```

---

## Case 2 — `q-sor-evm-to-soroban-porting`

**Overall verdict: confirmed (as of 2026-09-02). No judge-facing change is needed.** Both versioned
values (SEP-57 Draft v0.3.0, Solang 0.3.5) are still the current values. The only optional judge-facing
touch is the `golden.notes` snapshot date ("GT-41 snapshot 2026-07-10"); the answer text itself carries no
`asOf`, and the values did not move, so the notes date may stay if the author prefers a judge-blind-only
refresh.

### Claim matrix

| # | Claim (from golden) | Verdict | Classes | Evidence (URL · observed · excerpt) |
| --- | --- | --- | --- | --- |
| 2.1 | SEP-57 is **Draft v0.3.0**, not Final | confirmed-as-of 2026-09-02 | B, D, A | B https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0057.md · preamble `Status: Draft` / `Updated: 2026-06-11` / `Version: 0.3.0`; last commit on the file 34cc9dbf3f2d 2026-06-17 "SEP-57 RWA Hook Update (#1961)". D https://www.openzeppelin.com/news/rwa-wizard-issue-regulated-real-world-assets-on-stellar (2026-08-27) · "build on OpenZeppelin's Stellar Contracts Library and SEP-0057"; Wizard "targets Stellar testnet"; no Final claim. A https://developers.stellar.org/docs/tools/openzeppelin-contracts · lists "RWA (ERC-3643) Token". |
| 2.2 | Current OpenZeppelin RWA modules exist (fungible, non-fungible, RWA/ERC-3643, allowlist/blocklist, pausable, access control, upgradeability) | confirmed | B, A, D | B https://github.com/OpenZeppelin/stellar-contracts/tree/main/packages/tokens/src · `rwa/`, `fungible/`, `non_fungible/`, `vault/`, `confidential/`; latest release https://github.com/OpenZeppelin/stellar-contracts/releases/tag/v0.7.2 (2026-06-09, soroban_sdk 26.1.0). A docs tools page · "Fungible Token", "Non-Fungible Token", "RWA (ERC-3643) Token", "Allowlist", "Blocklist", "Pausable and Upgradeable Utilities", "Role-based and Ownable Access Control". D OZ RWA Wizard post 2026-08-27. |
| 2.3 | No ambient `msg.sender`; pass `Address` and call `require_auth` / `require_auth_for_args`; auth is the top footgun | confirmed | A, B, E | A https://developers.stellar.org/docs/learn/migrate/evm/solidity-and-rust-advanced-concepts · "Soroban relies on passing an [Env] argument to all functions"; "Soroban provides built-in functions such as `require_auth` and `require_auth_for_args` through the `Address` struct." B https://github.com/stellar/rs-soroban-sdk/blob/main/soroban-sdk/src/address.rs · `pub fn require_auth_for_args(&self, args: Vec<Val>)`. E docs index returns the advanced-concepts page for "msg.sender require_auth". |
| 2.4 | SEP-41 allowances include ledger expiry and are not copied EVM approvals | confirmed | B, A | B sep-0041.md v0.5.1 · `fn approve(env, from, spender, amount: i128, live_until_ledger: u32)`; "`live_until_ledger` - The ledger number where this allowance expires"; v0.5.1 also states approve "overwrites the current allowance rather than adding to it". A https://developers.stellar.org/docs/tokens/token-interface · same signature and "An expired entry (where live_until_ledger < the current ledger number) should be treated as a 0 amount allowance." |
| 2.5 | All-zero G/C bytes encode valid Stellar addresses; EVM `0x000…` is not a Stellar Address; never use zero bytes as a null sentinel | confirmed (strengthened) | F, C | F computed strkeys `GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF` and `CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4` (version byte + 32 zero bytes + CRC16-XModem). C https://mainnet.sorobanrpc.com `getLedgerEntries` with the zero-account key returned an **existing account entry** (`lastModifiedLedgerSeq` 64218634, `latestLedger` 64231878) and accepted the zero contract-instance key (parsed, no entry). C https://horizon.stellar.org/accounts/GAAAA…AWHF → HTTP 200 account record. C Horizon `/accounts/0x0000000000000000000000000000000000000000` → 400 "Account ID must start with `G` and contain 56 alphanum characters". The zero G address is not only valid but funded on Mainnet, so a sentinel would route real value there. |
| 2.6 | Simulation is temporary, may be stale, discards writes, is not consensus-final; submitted transactions commit | confirmed | A, A | A https://developers.stellar.org/docs/learn/fundamentals/contract-development/contract-interactions/transaction-simulation · "executes a transaction against a temporary, possibly out-of-date snapshot of the ledger"; "discards the execution's effects"; "the footprint may be too stale". A https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/simulateTransaction · `error` "Only present if the transaction simulation failed"; diagnostic events "can be present on error, providing extra context about what failed". |
| 2.7 | Fees are multidimensional (CPU, memory, ledger reads/writes, tx size, events/return, rent) with hard limits; storage has TTL/rent/archival | confirmed | A, B | A https://developers.stellar.org/docs/learn/fundamentals/fees-resource-limits-metering · "Instructions", "Ledger entry accesses", "Ledger I/O", "Transaction size", "Events & return value size", "Ledger space rent"; "All resources mentioned in the prior section are subject to a per-transaction limit"; memory "capped, though not subject to any charge". B Solang support matrix documents Soroban storage classes `persistent`, `temporary`, `instance` plus `extendTtl(...)` (independent implementation of the same model). |
| 2.8 | Solang **0.3.5** exists; its Soroban target is pre-alpha/experimental and not a production default | confirmed-as-of 2026-09-02 | B, B, A, E | B https://github.com/hyperledger-solang/solang/releases/tag/v0.3.5 · "v0.3.5: Luxor", published 2026-07-07; tag list top = v0.3.5 (no newer tag). B https://github.com/hyperledger-solang/solang/blob/main/docs/targets/soroban.rst · "The Soroban target is still pre-alpha."; "not yet feature-complete or production-ready". A https://developers.stellar.org/docs/learn/migrate/evm/solidity-support-via-solang · "Solidity support via Solang for Stellar is experimental and evolving ... We Don't recommend using Solang for production contracts at this time." E docs index returns that page for "Solang Solidity Soroban experimental". |
| 2.9 | Unsupported/risky areas: assembly/Yul, crypto builtins, value transfer, creation, destruction, compiler-defined storage layout | confirmed | B, B, A | B https://github.com/hyperledger-solang/solang/blob/main/docs/targets/soroban_support_matrix.rst · "Yul and inline assembly — Unsupported"; "Solidity hash and crypto builtins — Unsupported"; "Creating contracts with `new` — Unsupported"; "Native value transfer and payable-style flows — Unsupported"; "`selfdestruct` — Unsupported". B https://github.com/hyperledger-solang/solang/blob/main/docs/targets/soroban_rust_sdk_differences.rst · "Solang does not use EVM slot packing on Soroban"; "should not assume raw storage compatibility with handwritten Rust SDK contracts". A Stellar Solang page · "Not all Solidity features are supported yet, and breaking changes may occur." |
| 2.10 | ERC-20 → SAC (classic asset) or SEP-41 (custom token); ERC-1404/1410 need custom policy/partition state | confirmed | B, A | B sep-0041.md · "The interface is a subset of the Stellar Asset contract" (SAC implements SEP-41). A docs tools page lists no ERC-1404/1410 module; SEP-57 scope is T-REX/ERC-3643 only ("based on the T-REX ... framework, as implemented in ERC-3643"). No official 1404/1410 mapping found (negative, as of 2026-09-02). |

Coverage diagnostic (not a defect): the official EVM migration page covers `Env`/`require_auth` but does not
address `address(0)`, allowance expiry, gas-vs-resources, or simulation. The case measures cross-page
synthesis; the truthful answer is canonical across the pages cited in 2.4–2.7.

### Required gospel changes

- None to `golden.answer`, `golden.keyFacts`, or `golden.avoid`.
- Optional: `golden.notes` "GT-41 snapshot 2026-07-10" → "GT-41 snapshot 2026-07-10; re-verified unchanged
  2026-09-02". If the author makes this judge-facing touch, `truth.verified` must move in the same diff.
- `truth.asOf` → `2026-09-02`; `truth.reverifyBy` → **2026-12-01**.
- `truth.corroboration[]`: replace the "verbatim legacy evidence descriptor" rows with the JSON below.
- `truth.verified`: new event 2026-09-02, `rootCause` = `freshness-drift`.

### reverifyBy rationale

SEP-57 moved twice in seven months (created 2025-11-26, updated 2026-06-11, hook update 2026-06-17) and
OpenZeppelin shipped the RWA Wizard on 2026-08-27, so a Final/1.0 bump inside a quarter is plausible.
Solang releases are irregular (0.3.4 → 0.3.5 took until 2026-07-07). 2026-12-01 gives one quarter and does
not collide with sibling `q-tool-rust-soroban-sdk` (2027-01-21) or `q-tool-which-sdk-comparison`
(2027-01-28).

### Sibling-case search terms and sweep

Search terms: `SEP-57`, `SEP-0057`, `T-REX`, `ERC-3643`, `Solang`, `solang`, `0.3.5`, `v0.3.0`,
`require_auth`, `msg.sender`, `address(0)`, `live_until_ledger`, `simulation`, `multidimensional`,
`TTL`, `rent`, `OpenZeppelin`.

Cases hit (grep, 2026-09-02): `q-crp-oz-rwa-erc3643-trex` ("SEP-0057 is a Draft v0.3.0"),
`q-crp-tokenize-personal-rwa`, `q-rwa-stellar-vs-erc20-regulated` ("Draft SEP-57/OpenZeppelin RWA
contracts are a separate, evolving Soroban path"), `q-tool-rust-soroban-sdk`, `q-tool-which-sdk-comparison`
(both: Solang is a community path with different maturity). Verdict: no contradiction.

### Corroboration rows (paste-ready)

```json
[
  {"claim":"SEP-57 is Draft version 0.3.0 as of 2026-09-02.","verdict":"confirmed-as-of","evidence":[
    {"class":"B","ref":"https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0057.md","observedAt":"2026-09-02","note":"Status: Draft; Updated: 2026-06-11; Version: 0.3.0; last file commit 2026-06-17"},
    {"class":"D","ref":"https://www.openzeppelin.com/news/rwa-wizard-issue-regulated-real-world-assets-on-stellar","observedAt":"2026-09-02","note":"2026-08-27 post builds on SEP-0057, testnet-only, no Final claim"},
    {"class":"A","ref":"https://developers.stellar.org/docs/tools/openzeppelin-contracts","observedAt":"2026-09-02","note":"lists 'RWA (ERC-3643) Token'"}]},
  {"claim":"Solang 0.3.5 is the latest release and its Soroban target is pre-alpha/experimental, not production-ready, as of 2026-09-02.","verdict":"confirmed-as-of","evidence":[
    {"class":"B","ref":"https://github.com/hyperledger-solang/solang/releases/tag/v0.3.5","observedAt":"2026-09-02","note":"'v0.3.5: Luxor' published 2026-07-07; newest tag"},
    {"class":"B","ref":"https://github.com/hyperledger-solang/solang/blob/main/docs/targets/soroban.rst","observedAt":"2026-09-02","note":"'The Soroban target is still pre-alpha.' / 'not yet feature-complete or production-ready'"},
    {"class":"A","ref":"https://developers.stellar.org/docs/learn/migrate/evm/solidity-support-via-solang","observedAt":"2026-09-02","note":"'experimental and evolving ... We Don't recommend using Solang for production contracts at this time.'"}]},
  {"claim":"SEP-41 allowances carry a live_until_ledger expiry.","verdict":"confirmed","evidence":[
    {"class":"B","ref":"https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0041.md","observedAt":"2026-09-02","note":"v0.5.1: approve(..., live_until_ledger: u32) 'The ledger number where this allowance expires'"},
    {"class":"A","ref":"https://developers.stellar.org/docs/tokens/token-interface","observedAt":"2026-09-02","note":"same signature; expired entry treated as 0 allowance"}]},
  {"claim":"All-zero G and C strkeys are valid Stellar addresses; the zero G account exists on Mainnet.","verdict":"confirmed","evidence":[
    {"class":"F","ref":"strkey computed locally: GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF / CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4","observedAt":"2026-09-02","note":"version byte + 32 zero bytes + CRC16"},
    {"class":"C","ref":"https://mainnet.sorobanrpc.com getLedgerEntries","observedAt":"2026-09-02","note":"zero-account key returned an existing entry (lastModifiedLedgerSeq 64218634); zero contract-instance key parsed with no entry"},
    {"class":"C","ref":"https://horizon.stellar.org/accounts/GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF","observedAt":"2026-09-02","note":"HTTP 200; 0x0000… form rejected with 400 'must start with G and contain 56 alphanum characters'"}]}
]
```

---

## Case 3 — `q-sor-reflector-integration-code`

**Overall verdict: confirmed with one clause now unverifiable.** Registry IDs, signatures, types, DAO
identification, and the live Pulse ABI are all re-confirmed. The clause "official site text mentioning x_*
conflicts with current source/live ABI" can no longer be observed on the live operator site (2026-09-02);
the `x_last_price` residue now lives in the October 2025 official snapshot and in third-party copies. A
judge-facing rewording is required, and the in-text `asOf` (**2026-07-11**) must be refreshed.

### Claim matrix

| # | Claim (from golden) | Verdict | Classes | Evidence (URL · observed · excerpt) |
| --- | --- | --- | --- | --- |
| 3.1 | Select the live contract by network/type from the operator registry, then fetch its spec | confirmed | C, A | C https://orchestrator.reflector.network/config · JSON with `"network":"pubnet"`, per-contract `type` ∈ {`oracle`, `subscriptions`, `dao`}, `dataSource` ∈ {`exchanges`, `pubnet`, `forex`}, `wasmHash.oracle.hash` `8ecd1857…bd11c`. A https://developers.stellar.org/docs/data/oracles/oracle-providers · "Deployed Reflector public oracles" table (Mainnet + Testnet). |
| 3.2 | Pulse: `lastprice(asset)`; Beam: `lastprice(caller, asset)` | confirmed (Pulse live; Beam interface-only) | B, F, C | B https://github.com/reflector-network/reflector-contract/blob/main/pulse-contract/src/lib.rs (tag v6.0.1 = 42f3116, 2026-07-23) · `pub fn lastprice(e: &Env, asset: Asset) -> Option<PriceData>`; beam-contract/src/lib.rs · `pub fn lastprice(e: &Env, caller: Address, asset: Asset) -> Option<PriceData>` with `caller.require_auth()` and `charge_invocation_fee`. F `stellar contract info interface --id CAFJ…4DLN|CALI…LE6M|CBKG…CJZC --network mainnet` · each prints `fn lastprice(env, asset: Asset) -> Option<PriceData>`; no `caller` parameter; no `x_*` functions. C https://api.stellar.expert/explorer/public/contract/CAFJ…4DLN · `validation.status: "verified"`, `package: "reflector-pulse-contract"`, `commit: 42f3116…`. **Beam:** no `oracle`-type entry in the operator config or the Stellar docs table exposes the `(caller, asset)` ABI, so a live Mainnet Beam deployment is **unverifiable** as of 2026-09-02; the signature claim is source-confirmed only. |
| 3.3 | `Asset` = `Stellar(Address)` \| `Other(Symbol)`; return `Option<PriceData>{price:i128,timestamp:u64}`; apply `decimals()`; reject None/stale | confirmed | B, B, F, C | B https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0040.md (Draft v0.1.0, Updated 2023-05-13) · `enum Asset { Stellar(Address), Other(Symbol) }`, `struct PriceData { price: i128, timestamp: u64 }`, "the actual price can be calculated as `price/10^decimals`", "check the timestamp field ... to make sure that the reported price value is not stale". B reflector-contract README interface (same types). F live ABI dump · `pub struct PriceData { pub price: i128, …}`, `pub enum Asset {…}`, `fn decimals(env) -> u32`. C operator config · `decimals: 14` for CAFJ and CALI. |
| 3.4 | Mainnet registry examples: external-exchanges `CAFJZQW…N34DLN`, on-chain/pubnet `CALI2BY…B2PLE6M`, forex `CBKGPWG…DXMCJZC` | confirmed-as-of 2026-09-02 | C, A, F, C | C operator config · `CAFJZQWSED6YAWZU3GWRTOCNPPCGBN32L7QV43XX5LZLFTK6JLN34DLN` `dataSource:"exchanges"`; `CALI2BYU2JE6WVRUFYTS6MSBNEHGJ35P4AVCZYF3B6QOE3QKOB2PLE6M` `dataSource:"pubnet"`; `CBKGPWGKSKZF52CFHMTRR23TBWTPMRDIYZ4O2P5VS65BMHYH4DXMCJZC` `dataSource:"forex"`. A Stellar docs table · same three IDs labelled "External CEXs & DEXs", "Stellar Mainnet DEX", "Fiat exchange rates" (Mainnet). F all three answer `stellar contract info interface` on Mainnet with the Pulse ABI. C stellar.expert · CAFJ created 1709563577 (2024-03-04), `wasm` `8ecd1857…` equals the config's `wasmHash.oracle`, `versions: 4`. Abbreviations in the golden match the full IDs. |
| 3.5 | `CBQSUF…XQLSE` is a DAO, not an oracle | confirmed | C, C, F | C operator config · `CBQSUF57OYX4RIMCZV62DKN6JFOTEKPHIZASMJYOUOCNHGNG2P3XQLSE` `type:"dao"`. C https://api.stellar.expert/explorer/public/contract/CBQSUF…XQLSE · verified `repository: reflector-network/reflector-dao-contract`. F live ABI · `create_ballot`, `vote`, `claim`, `unlock`, `set_deposit`; no price functions. The live SPA bundle `https://reflector.network/app.15f5d5389a86b33026a9.js` still embeds this ID 3×. |
| 3.6a | Current public Pulse ABI exposes `lastprice`, not stale `x_last_price` | confirmed | F, B | F live ABI (3.2) has no `x_*` export. B GitHub code search `x_last_price repo:reflector-network/reflector-contract` → 0 results on main. |
| 3.6b | "official site text mentioning x_* conflicts with current source/live ABI" | **unverifiable as of 2026-09-02** (historically true) | A, B, D | A live site: `https://reflector.network/app.15f5d5389a86b33026a9.js` (2.7 MB) plus chunks `docs.37c1193e…js`, `665.06c53bb…js`, `959.17a65f6…js`, `subscription.a613a90…js` fetched 2026-09-02 → 0 occurrences of `x_last_price` or any `x_*` function name; the docs chunk shows only `fn lastprice(asset: Asset) -> Option<PriceData`. B https://github.com/code-423n4/2025-10-reflector · `pulse-contract/src/lib.rs`, `beam-contract/src/lib.rs`, `oracle/src/price_oracle.rs`, `README-sponsor.md` all still define `x_last_price` (official code as of October 2025); reflector-contract README last changed 2026-03-09 "Merge v3, Pulse+Beam oracles…", v6.0.0/v6.0.1 tags carry the new interface. D GitHub-wide code search `x_last_price reflector` → 38 files in third-party repos (tutorials, hackathon projects, boilerplates) still carrying the old interface. Conclusion: the conflict has moved from the operator site to stale copies; the golden must not assert the site still says it. |
| 3.7 | Trap diagnosis is multi-cause (network, ID, live spec/WASM, Pulse-vs-Beam signature, UDT ScVals, simulation diagnostics) | confirmed | A, B | A simulateTransaction docs · `error` and diagnostic events "providing extra context about what failed". B Beam `lastprice` performs `caller.require_auth()` and an XRF fee sub-call, so calling a Beam ABI with a Pulse-style argument list (or vice versa) fails before price lookup — a concrete signature-mismatch cause distinct from network/ID mistakes. |
| 3.8 | Beam's nested XRF call may need `authorize_as_current_contract` | confirmed | B, B | B README "ReflectorBeam contract" example · `e.authorize_as_current_contract(Vec::from_array(e, [invocation]))` authorising an XRF `burn` sub-invocation (`CBLLEW7HD2RWATVSMLAGWM4G3WCHSHDJ25ALP4DI6LULV5TU35N2CIZA`). B https://github.com/stellar/rs-soroban-sdk/blob/main/soroban-sdk/src/env.rs · `pub fn authorize_as_current_contract(&self, auth_entries: Vec<InvokerContractAuthEntry>)`. |
| 3.9 | SEP-40 is the oracle-interface standard | confirmed | B, A, C | B sep-0040.md · "Implementations — Reflector oracle contract". A Stellar docs · "compatible with SEP40 ecosystem standard interface". C stellar.expert CAFJ `features: ["sep40"]`. |
| 3.10 | In-text `asOf` **2026-07-11** | stale date, facts unchanged | — | All IDs and the ABI re-confirmed 2026-09-02. |

Upstream defect observed (improvements candidate, not a gospel change): the README "ReflectorBeam contract"
example hard-codes `CAFJZQWSED6YAWZU3GWRTOCNPPCGBN32L7QV43XX5LZLFTK6JLN34DLN` as the oracle address, but that
contract is a verified **Pulse** deployment with `lastprice(asset)`; a developer copying the Beam example
against that ID gets exactly the signature mismatch the question asks about.

### Required gospel changes

- `golden.answer`: (a) "as of 2026-07-11" → "as of 2026-09-02"; (b) replace "official site text mentioning
  x_* conflicts with current source/live ABI" with wording such as: "`x_last_price` was part of the official
  interface through the October 2025 code snapshot and still circulates in third-party interface copies and
  tutorials; the current official repository, operator site, and live ABI expose `lastprice` only". Keep the
  avoid trap "do not grade x_last_price as current" (still true per 3.6a).
- `golden.notes`: the "GT-42 live-spec correction as of 2026-07-11 … operator site currently conflicts with
  live ABI" sentence should become "as of 2026-09-02 the operator site no longer shows x_*; stale copies
  do". Add the README Beam-example defect as grader context (an answer that warns "the README Beam sample
  points at a Pulse ID" is correct, not penalised).
- `truth.asOf` → `2026-09-02`; `truth.reverifyBy` → **2026-11-01**.
- `truth.corroboration[]`: replace legacy descriptor rows with the JSON below; add a row for 3.6b with
  verdict `unverifiable` scoped to the "site text" clause.
- `truth.verified`: new event 2026-09-02; `rootCause` = `freshness-drift` plus
  `research/audits/2026-07-11-gt42-archival-events-reflector.md` (existing operator-drift record) and a new
  `improvements/` finding for the README Beam example if the author files one.

### reverifyBy rationale

Reflector shipped v6.0.0 → v6.0.1 within the last quarter (README 2026-03-09, code 2026-07-23), stellar.expert
shows four WASM versions on CAFJ, and contract IDs are the most-copied volatile value in this case.
2026-11-01 is one quarter out, staggered against `q-pc-cross-redstone-sep40` (2026-10-15) and the YieldBlox
cluster recheck (2026-10-08).

### Sibling-case search terms and sweep

Search terms: `Reflector`, `lastprice`, `x_last_price`, `SEP-40`, `SEP40`, `PriceData`, `Asset::Other`,
`CAFJZQW`, `CALI2BY`, `CBKGPWG`, `CBQSUF`, `Pulse`, `Beam`, `XRF`, `authorize_as_current_contract`,
`orchestrator.reflector.network`.

Cases hit (grep, 2026-09-02): `q-defi-reflector-oracle` ("SEP-40-style oracle interfaces", no IDs),
`q-soroban-oracle-defensive-consumption` (SEP-40 timestamp/staleness discipline),
`q-pc-cross-redstone-sep40` (reverifyBy 2026-10-15; RedStone implements SEP-40),
`q-defi-oracle-landscape-live`, `q-tool-oracle-repo-live`, `q-comp-yieldblox-oracle-incident`,
`q-hist-yieldblox-v2-2026-exploit`, `q-defi-etherfuse-stablebonds`, `q-eco-defi-market-map`,
`q-eco-defi-projects-discovery`, `q-eco-most-active-defi-projects`, `q-hist-x402-stellar-announcement`,
`q-eco-xbull-wallet`, `q-builder-by-scf-tier`, `q-scf-cross-reflector-rounds-current`,
`q-scf-hackathon-compare-live`, `q-scf-kale-winner-live`. None of the siblings pins a Reflector contract ID
or names `x_last_price`, so the 3.6b rewording contradicts nothing. Verdict: no contradiction.

### Corroboration rows (paste-ready)

```json
[
  {"claim":"Reflector Mainnet Pulse oracles are CAFJZQWSED6YAWZU3GWRTOCNPPCGBN32L7QV43XX5LZLFTK6JLN34DLN (exchanges), CALI2BYU2JE6WVRUFYTS6MSBNEHGJ35P4AVCZYF3B6QOE3QKOB2PLE6M (pubnet), CBKGPWGKSKZF52CFHMTRR23TBWTPMRDIYZ4O2P5VS65BMHYH4DXMCJZC (forex) as of 2026-09-02.","verdict":"confirmed-as-of","evidence":[
    {"class":"C","ref":"https://orchestrator.reflector.network/config","observedAt":"2026-09-02","note":"type oracle; dataSource exchanges/pubnet/forex; decimals 14 (exchanges, pubnet)"},
    {"class":"A","ref":"https://developers.stellar.org/docs/data/oracles/oracle-providers","observedAt":"2026-09-02","note":"Deployed Reflector public oracles table lists the same three Mainnet IDs"},
    {"class":"F","ref":"stellar contract info interface --network mainnet (CLI 27.1.0)","observedAt":"2026-09-02","note":"all three expose fn lastprice(env, asset: Asset) -> Option<PriceData>; no x_* functions"},
    {"class":"C","ref":"https://api.stellar.expert/explorer/public/contract/CAFJZQWSED6YAWZU3GWRTOCNPPCGBN32L7QV43XX5LZLFTK6JLN34DLN","observedAt":"2026-09-02","note":"verified reflector-pulse-contract @ 42f3116; wasm 8ecd1857… matches config wasmHash.oracle"}]},
  {"claim":"CBQSUF57OYX4RIMCZV62DKN6JFOTEKPHIZASMJYOUOCNHGNG2P3XQLSE is the Reflector DAO contract, not a price oracle.","verdict":"confirmed","evidence":[
    {"class":"C","ref":"https://orchestrator.reflector.network/config","observedAt":"2026-09-02","note":"type: dao"},
    {"class":"C","ref":"https://api.stellar.expert/explorer/public/contract/CBQSUF57OYX4RIMCZV62DKN6JFOTEKPHIZASMJYOUOCNHGNG2P3XQLSE","observedAt":"2026-09-02","note":"verified reflector-network/reflector-dao-contract"},
    {"class":"F","ref":"stellar contract info interface --network mainnet","observedAt":"2026-09-02","note":"ABI is create_ballot/vote/claim/unlock; no lastprice"}]},
  {"claim":"Pulse exposes lastprice(asset); Beam source exposes lastprice(caller, asset); the current official interface has no x_last_price.","verdict":"confirmed","evidence":[
    {"class":"B","ref":"https://github.com/reflector-network/reflector-contract/blob/main/pulse-contract/src/lib.rs","observedAt":"2026-09-02","note":"v6.0.1 (42f3116, 2026-07-23): pub fn lastprice(e, asset: Asset) -> Option<PriceData>"},
    {"class":"B","ref":"https://github.com/reflector-network/reflector-contract/blob/main/beam-contract/src/lib.rs","observedAt":"2026-09-02","note":"pub fn lastprice(e, caller: Address, asset: Asset) with caller.require_auth() and charge_invocation_fee"},
    {"class":"B","ref":"https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0040.md","observedAt":"2026-09-02","note":"Draft v0.1.0: lastprice(env, asset) -> Option<PriceData>; Asset::Stellar/Other; PriceData{price:i128,timestamp:u64}"},
    {"class":"F","ref":"stellar contract info interface --network mainnet","observedAt":"2026-09-02","note":"live ABI matches pulse-contract; no x_* exports"}]},
  {"claim":"The Reflector operator site text mentions x_* functions that conflict with the live ABI.","verdict":"unverifiable","evidence":[
    {"class":"A","ref":"https://reflector.network/app.15f5d5389a86b33026a9.js (+ docs/665/959/subscription chunks)","observedAt":"2026-09-02","note":"0 occurrences of x_last_price or any x_* function name; docs chunk shows lastprice only"},
    {"class":"B","ref":"https://github.com/code-423n4/2025-10-reflector","observedAt":"2026-09-02","note":"October 2025 official snapshot still defines x_last_price in pulse/beam/oracle and README-sponsor.md"},
    {"class":"D","ref":"GitHub code search: x_last_price reflector","observedAt":"2026-09-02","note":"38 third-party files still carry the old interface (tutorials, boilerplates, hackathon repos)"}]},
  {"claim":"A live Mainnet Beam oracle deployment exposing lastprice(caller, asset) exists.","verdict":"unverifiable","evidence":[
    {"class":"C","ref":"https://orchestrator.reflector.network/config","observedAt":"2026-09-02","note":"no oracle-type entry carries the Beam ABI; only Pulse oracles, one subscriptions contract, one DAO"},
    {"class":"A","ref":"https://developers.stellar.org/docs/data/oracles/oracle-providers","observedAt":"2026-09-02","note":"table lists Pulse oracles only"}]}
]
```

---

## Cross-case summary for the orchestrator

| Case | Verdict | Judge-facing change | Proposed `truth.asOf` | Proposed `reverifyBy` |
| --- | --- | --- | --- | --- |
| `q-sor-confidential-tokens` | confirmed | date refresh only (2026-07-10 → 2026-09-02) | 2026-09-02 | 2026-12-15 |
| `q-sor-evm-to-soroban-porting` | confirmed | none required; optional notes date | 2026-09-02 | 2026-12-01 |
| `q-sor-reflector-integration-code` | confirmed + one clause unverifiable | date refresh + reword the "official site text mentioning x_*" clause; add README Beam-example caution | 2026-09-02 | 2026-11-01 |

Improvements candidates surfaced (author decides whether to file):

1. `reflector-network/reflector-contract` README — Beam example uses the Pulse contract ID
   `CAFJZQWSED6YAWZU3GWRTOCNPPCGBN32L7QV43XX5LZLFTK6JLN34DLN`; no Beam deployment is published in the operator
   config or Stellar docs. Class B + C evidence above.
2. Coverage diagnostic only (no defect claim): the Stellar EVM-migration page does not cover `address(0)`,
   allowance expiry, gas-vs-resources, or simulation; canonical owners are the token-interface, fees, and
   simulation pages, all indexed (E hits recorded above).

Tools and surfaces touched (for a stranger to re-walk): WebFetch/raw curl of developers.stellar.org,
stellar.org blog, openzeppelin.com; GitHub contents/search API for stellar-protocol, rs-soroban-sdk,
hyperledger-solang/solang, OpenZeppelin/stellar-contracts, reflector-network/reflector-contract,
code-423n4/2025-10-reflector, stellar/stellar-core, stellar/stellar-docs; live RPC (mainnet + testnet),
Horizon, stellar.expert API, orchestrator.reflector.network/config, reflector.network JS bundles; local
`stellar` CLI 27.1.0 `contract info interface`; `stellar-raven` `search`/`execute` over `stellarDocs.search_docs`
and `scout.searchResearch`; perplexity and WebSearch sweeps. No Lumenloop research trigger was invoked.
