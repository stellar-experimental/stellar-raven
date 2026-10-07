# Raven calls behind the carousel frames

All calls ran on 2026-10-07 through the production Stellar Raven connector (claude.ai
connector `Stellar_Raven`, tools `search` and `execute`). Each section lists the exact
`search` queries, the `execute` script, and the returned facts that the frame quotes.
Scout `meta.generatedAt` values are copied from the host's SOURCE METADATA block.

## Frame 1 — "How do I extend the TTL of persistent storage in a Soroban contract?"

### search

- `search({ query: "extend TTL persistent storage soroban contract", limit: 8 })`
  → top hits `stellarDocs.search_soroban_contract_docs` (gated, 299),
  `skills.stellar-dev.smart-contracts` (gated, 131).

### execute

```js
async () => {
  const [docs, ttlDocs, skill] = await Promise.all([
    stellarDocs.search_soroban_contract_docs({ query: "extend_ttl persistent storage", hitsPerPage: 4, includeContent: true }),
    stellarDocs.search_docs({ query: "extend TTL persistent entry threshold extend_to", hitsPerPage: 4 }),
    codemode.skill.read("skills.stellar-dev.smart-contracts", { sections: ["file:development.md"] })
  ]);
  // ...projection of url, breadcrumb, content excerpt, and the skill's extend_ttl section
}
```

(A first attempt read `skill.data` and failed with the host's envelope hint; the
second run read `skill.sections`.)

### Returned facts quoted in the frame

- Docs: `developers.stellar.org/docs/build/guides/storage/storage-strategies`
  "Strategy 5: TTL management — bump-on-access": "when code explicitly calls
  extend_ttl() and fewer than THRESHOLD ledgers remain, extend the entry to BUMP".
  "The current maximum is 3,110,400 ledgers — approximately 180 days at today's
  ~5-second ledger close time."
- Docs: `developers.stellar.org/docs/build/guides/archival/test-ttl-extension`
  example: `env.storage().persistent().extend_ttl(&DataKey::MyKey, 1000, 5000);`
  ("Extend the persistent entry TTL to 5000 ledgers, when its TTL is smaller than
  1000 ledgers").
- Skill `skills.stellar-dev.smart-contracts` (`development.md`, "TTL management"):
  `const DAY_IN_LEDGERS: u32 = 17280;`, `BUMP_THRESHOLD = 30 * DAY_IN_LEDGERS`,
  `BUMP_TO = 120 * DAY_IN_LEDGERS`,
  `env.storage().persistent().extend_ttl(&DataKey::Balance(user), BUMP_THRESHOLD, BUMP_TO);`
  "extend_ttl(threshold, extend_to): no-op unless current TTL < threshold, then sets
  TTL to extend_to. Idempotent and floor-only — never shortens."
  "Anyone can extend any entry's TTL via the `ExtendFootprintTTLOp` transaction
  operation". "Protocol 26 added bounded variants ...
  `extend_ttl_with_limits(&key, extend_to, min_extension, max_extension)`."

## Frame 2 — "Which lending protocols are built on Stellar, and which ones got Stellar Community Fund awards?"

### search

- `search({ query: "lending protocol directory projects", limit: 8 })`
  → top hit `scout.searchProjects` (gated, 193), with `type` filter `"Lending"` and
  `scfAwarded` filter.

### execute

```js
async () => {
  const [all, scf] = await Promise.all([
    scout.searchProjects({ type: "Lending", limit: 50, fields: "name,slug,status,scfAwarded,scfTotalAwardedUSD,scfAwardedRounds,scfAsOf,scfSourceUrl,shortDescription,tvlUSD,tvlAsOf,statusAsOf" }),
    scout.searchProjects({ type: "Lending", scfAwarded: true, limit: 50, fields: "name,slug,status,scfAwarded,scfTotalAwardedUSD,scfAwardedRounds,scfAsOf,scfSourceUrl" })
  ]);
  // ...projection of name, status, scfAwarded, scfTotalAwardedUSD, rounds, scfAsOf, tvlUSD, tvlAsOf
}
```

`meta.generatedAt` = `2026-10-07T14:51:26.184Z` (all) and `2026-10-07T14:51:26.283Z`
(SCF filter). `meta.counts.total` = 43 Lending-typed projects, 33 with `scfAwarded: true`.

### Returned rows quoted in the frame

| Project | Status | SCF awarded | SCF total (USD) | Rounds | TVL (USD, as of 2026-10-05) |
|---|---|---|---|---|---|
| Blend | Live | yes | 50,000 | (none listed) | 166,113,344 |
| Templar Protocol | Live | no | — | — | 13,459,048 |
| DeFa by InvoiceMate | Live | no | — | — | 4,014,637 |
| YieldBlox | Live | no | — | — | (not tracked) |
| K2 Lend | Live | no | — | — | (not tracked) |
| Untangled | Live | yes | 320,000 | 31, 41 | (not tracked) |
| Bondhive | Live | yes | 190,000 | 27, 29 | (not tracked) |
| Alula | Live | yes | 145,000 | 34 | (not tracked) |
| XOXNO | Live | yes | 135,000 | 43 | (not tracked) |
| Peridot Finance | Live | yes | 91,750 | 38 | (not tracked) |
| Crebit | Live | yes | 100,000 | 45 | (not tracked) |
| Slender | Inactive | yes | 296,750 | 17, 21 | 106 |
| OrbitCDP | Inactive | yes | 280,000 | 21, 25, 29 | (not tracked) |
| FxDAO | Inactive | yes | 224,800 | 13 | 0 |

## Frame 3 — "Walk me through adding passkey smart accounts to my Stellar dApp."

### search

- `search({ query: "passkey smart account dapp", limit: 8 })`
  → top hits `stellarDocs.search_wallet_dapp_docs` (gated, 183),
  `skills.stellar-dev.dapp` (gated, 163, section `file:smart-accounts.md`),
  `scout.searchRepos` (gated, 58).

### execute (two runs)

```js
async () => {
  const [docs, skill, repos] = await Promise.all([
    stellarDocs.search_wallet_dapp_docs({ query: "passkey smart wallet", hitsPerPage: 5 }),
    codemode.skill.read("skills.stellar-dev.dapp", { sections: ["file:smart-accounts.md"] }),
    scout.searchRepos({ q: "passkey smart account", limit: 6, fields: "fullName,url,description,repoScore,lastCommitAt,stars,activityState" })
  ]);
  // ...projection
}
```

```js
async () => {
  const r = await scout.searchRepos({ q: "smart-account-kit", limit: 5, fields: "fullName,url,description,repoScore,lastCommitAt,activityState" });
  // ...projection
}
```

`meta.generatedAt` = `2026-10-07T14:51:35.040Z` and `2026-10-07T14:51:43.121Z`.

### Returned facts quoted in the frame

- Skill `skills.stellar-dev.dapp` (`smart-accounts.md`, pinned at stellar-dev-skill
  `d9ca04bf`): `npm install smart-account-kit`;
  `new SmartAccountKit({ rpcUrl, networkPassphrase, accountWasmHash, webauthnVerifierAddress, storage: new IndexedDBStorage() })`;
  `kit.connectWallet()` (silent restore), `kit.createWallet('My App', 'user@example.com', { autoSubmit: true })`,
  `kit.connectWallet({ prompt: true })`, `kit.signAndSubmit(transaction)`.
  Fee sponsorship: OpenZeppelin Relayer ("Stellar Channels Service"), testnet
  `https://channels.openzeppelin.com/testnet`; "replaces the deprecated Launchtube service".
  "Passkey Kit and Smart Account Kit are sibling SDKs, not successive versions ...
  not drop-in compatible." smart-account-kit = "OpenZeppelin context rules + an auth
  digest"; passkey-kit = "A flat multi-signer `Signatures` map". "Both are maintained."
- Docs: `developers.stellar.org/docs/build/apps/guestbook` — "Build a Passkey Powered
  Guestbook Dapp".
- Scout repos: `stellar/smart-account-kit` (repoScore 85, active, last commit
  2026-09-18); `stellar/passkey-kit` (repoScore 85, active, last commit 2026-09-18).
