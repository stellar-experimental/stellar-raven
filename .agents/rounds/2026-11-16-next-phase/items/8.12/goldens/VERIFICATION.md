# Item 8.12 (`goldens`) — Primary-source verification record

Date: 2026-11-19 UTC
Branch: `np/8.12-goldens`
Lane: `goldens` (Gemini 4 Neon, Antigravity)
TODO item: `.agents/TODO.md` — "Look at the Freighter and Scout SDK-status goldens"

## Maintenance exception & scope

This lane runs under the Maintenance Exception in `eval/qa/README.md` ("Held-out split", "Maintenance exception"):

- **Trigger:** Upstream events shown by primary sources — (1) Stellar Docs retitling `/docs/build/guides/freighter*` to Varial (2026-11-16; observed in PR #452 while the Docs titles hold remained active, titles absorbed in PR #474) and (2) Scout 1.9.150 adding `jsSdkStatus`, `sorobanSdkStatus`, and `stellarJsDep` and redefining the existing `Repo.codeVerified.versionStatus` field from Soroban-SDK-only to a combined Soroban/JS SDK status (absorbed in PR #452). Source record: `.agents/rounds/2026-11-16-next-phase/items/0.2/REPORT.md`.
- **Cases opened:** Exactly `q-tool-freighter-wallet`, `q-tool-wallets-comparison`, and their matching entries in `eval/qa/cases.json`. No other case file or compiled entry was opened.
- **No Raven output:** No stored answer, transcript, or verdict was read, and no model-calling eval was run.
- **Split & text hygiene:** No split file was opened or consulted, no split membership is recorded, and this record neither quotes nor paraphrases any case's judge-facing text (`question`, `golden.*`).

## Primary-source observations (2026-11-19 UTC)

Independent source classes per `.agents/skills/golden-truth/SKILL.md`:

| Class | Source / command | Observed on 2026-11-19 UTC |
|---|---|---|
| A | `GET https://developers.stellar.org/docs/build/guides/freighter.md` | HTTP 200 at unchanged URL path `/docs/build/guides/freighter`. Title is `# Varial Wallet`; body introduces Varial (formerly Freighter) as an SDF browser extension wallet. Companion guides `integrate-freighter-react.md` and `prompt-to-sign-tx.md` are also retitled to Varial and still live under `/docs/build/guides/freighter/*`. |
| A | `GET https://developers.stellar.org/docs/tools/developer-tools/wallets.md` | HTTP 200. Lists `Stellar Wallet Kit` (`https://github.com/Creit-Tech/Stellar-Wallets-Kit`, citing Albedo, Varial, Hana, Ledger Hardware Wallet, Trezor Hardware Wallet, Lobstr, Rabet, Scopuly, WalletConnect, xBull, HOT Wallet) and `Varial Wallet` (`https://varialwallet.com`, open-source repo `https://github.com/stellar/freighter`) as distinct tools. |
| A | `GET https://developers.stellar.org/docs/build/apps/wallet/overview` & `.../contract-accounts/smart-wallets` | Both HTTP 200 at unchanged URLs. |
| A | `GET https://varialwallet.com/` & `https://varialwallet.com/changelog` | HTTP 200. Links Chrome Web Store (`bcacfldlkkdogcmkkibnjlakofdplcbk`), Apple App Store (`id6743947720`), Google Play (`org.stellar.freighterwallet`), and `https://github.com/stellar/freighter`. Changelog records `v5.50.0` (extension) and `v1.28.29` (mobile) on 2026-10-29 as the first Varial releases. |
| A | `GET https://docs.varialwallet.com/` | HTTP 200. States Varial (formerly Freighter) is a non-custodial Stellar wallet available as a browser extension and mobile app, existing `@stellar/freighter-api` and WalletConnect integrations keep working unchanged, and new integrations should use `@stellar/varial-sdk`. |
| A | `GET https://stellar.org/blog/foundation-news/freighter-is-now-varial` | HTTP 200. SDF rename announcement ("Freighter is now Varial"). |
| B | `gh api repos/stellar/freighter` + README + releases | Active repo (`pushed_at` 2026-11-19). README `# Varial` confirms open-source non-custodial wallet extension and client SDK `@stellar/varial-sdk` (`/@stellar/freighter-api`). Latest release `5.53.0` (2026-11-16). |
| B | `gh api repos/stellar/freighter-mobile` + README + releases | Active repo (`pushed_at` 2026-11-19). README `# Varial Mobile` confirms iOS and Android non-custodial wallet with App Store (`id6743947720`) and Google Play (`org.stellar.freighterwallet`) links. Latest release `v1.30.30` (2026-11-19). |
| B | `gh api repos/Creit-Tech/Stellar-Wallets-Kit` + `src/sdk/modules/*` | Active repo, latest release `v2.8.0` (2026-10-28). `src/sdk/modules/` includes `ledger.module.ts` (`ModuleType.HW_WALLET`), `trezor.module.ts` (`ModuleType.HW_WALLET`), `wallet-connect.module.ts` (`ModuleType.BRIDGE_WALLET`), and `varial.module.ts` (`ModuleType.HOT_WALLET`) alongside 15 other wallet modules. |
| C | Local Raven (`localhost:8794`) `scout.searchProjects` (`q="freighter"`, `q="varial"`, `type="Wallet"`) | `generatedAt` `2026-11-19T21:47:42Z` / `21:49:23Z`. `freighter` row serves `name: "Varial"`, `productKind: "end-user-wallet"`, `status: "Live"`, `identity: { currentName: "Varial", aliases: ["Freighter"], renamedAt: "2026-10-29T00:00:00.000Z" }`. `type=Wallet` returns `total: 74`. |
| C | `inventory/stellar-light.json` & `catalog/manifest.json` (Scout 1.9.150 schema inspection) | Scout 1.9.150 added `jsSdkStatus`, `sorobanSdkStatus`, and `stellarJsDep` and redefined existing `Repo.codeVerified.versionStatus` (previously Soroban-SDK-only in 1.9.135) as a combined Soroban/JS SDK status on repository and ecosystem-analysis records; neither the additions nor the `versionStatus` redefinition alters wallet-product identity, custody, hardware-wallet, or WalletConnect facts. |
| E | Local Raven (`localhost:8794`) `stellarDocs.search_wallet_dapp_docs` & `stellarDocs.search_doc_titles` | `observedAt` `2026-11-19T21:49:22Z`. `search_wallet_dapp_docs({ query: "Freighter Varial wallet", hitsPerPage: 5 })` returns `/docs/build/guides/freighter` ("Varial Wallet") at rank 1 and the retitled companion guides in the top 5; `search_doc_titles` with `hitsPerPage: 10` for both `query: "Freighter"` and `query: "Varial"` surfaces `/docs/build/guides/freighter` ("Varial Wallet") and `/docs/tools/developer-tools/wallets` ("Wallet Integration"). |
| F | `curl -sSI https://www.freighter.app` & `https://docs.freighter.app` | `www.freighter.app` returns HTTP 301 to `https://varialwallet.com/`; `docs.freighter.app` returns HTTP 307 to `https://docs.varialwallet.com/`. |

## Per-case disposition

### 1. `q-tool-freighter-wallet` — **Confirmed unchanged**

- **Trigger 1 (2026-11-16 Docs retitle):** Already accounted for prior to the Docs retitle. The case was updated for the 2026-10-29 rename in PR #319 (2026-11-02) and re-verified in PR #436 (2026-11-14). Every claim across `question`, `golden.answer`, `golden.keyFacts`, `golden.avoid`, and `golden.notes` was checked against the 2026-11-19 multi-class primary sources above and remains accurate; the 2026-11-16 Docs title change brought the guide titles into alignment with the existing case rather than invalidating it. Under `golden-truth` section 5 ("When a re-check confirms an unchanged value, update the date in the golden text at the next judge-facing edit"), no judge-facing edit is warranted.
- **Trigger 2 (Scout 1.9.150 SDK-status fields):** Not applicable; the case does not depend on Scout's SDK-status schema fields.
- **Metadata & compiled parity:** `surface` (`stellarDocs.search_wallet_dapp_docs`) verified live; all seven `truth.sources` URLs resolve HTTP 200 (the `/docs/build/guides/freighter` path did not move); `truth.asOf` is `2026-11-14` and `truth.reverifyBy` is `2027-02-09`; `eval/qa/cases.json` matches the battery file verbatim. Not referenced in `eval/qa/consistency-register.json` or `eval/qa/source-sentinels.json`.

### 2. `q-tool-wallets-comparison` — **Confirmed unchanged**

- **Trigger 1 (2026-11-16 Docs retitle):** Already accounted for prior to the Docs retitle. The case was updated for the 2026-10-29 rename in PR #319 (2026-11-02) and re-verified in PR #436 (2026-11-14). Every claim across `question`, `golden.answer`, `golden.keyFacts`, `golden.avoid`, and `golden.notes` was checked against the 2026-11-19 multi-class primary sources above and remains accurate.
- **Trigger 2 (Scout 1.9.150 SDK-status fields):** Not applicable; the case does not depend on Scout's SDK-status schema fields. Its judge-blind `truth.notes` provenance was already updated on 2026-11-17 (PR #456) for `sls-033` resolution on Scout 1.9.150.
- **Metadata & compiled parity:** All HTTP URL entries in `truth.sources` resolve HTTP 200 (and the Class F redirect check for `www.freighter.app` / `docs.freighter.app` returns 301/307 to `varialwallet.com` / `docs.varialwallet.com`); `truth.asOf` is `2026-11-14` and `truth.reverifyBy` is `2027-05-14`; `eval/qa/cases.json` matches the battery file verbatim. Not referenced in `eval/qa/consistency-register.json` or `eval/qa/source-sentinels.json`.

## Provenance gap flagged for the orchestrator

While checking the trigger provenance in `.agents/rounds/2026-11-16-next-phase/items/0.2/EXEC.md`, we found that the two triggers originally matched **disjoint** pairs of QA case IDs in item 0.2's path-only consumer grep:

- `0.2/EXEC.md` line 158 (Docs Freighter->Varial retitle): `q-tool-freighter-wallet`, `q-tool-wallets-comparison`.
- `0.2/EXEC.md` line 155 (Scout 1.9.150 new SDK-status schema terms): `q-soroban-cli-bindings`, `q-tool-indexer-repos-discovery` (plus compiled entries in `eval/qa/cases.json` and `eval/qa/sample.json`).

`0.2/REPORT.md` (lines 72-74) combined both triggers into a single bullet that named only `q-tool-freighter-wallet` and `q-tool-wallets-comparison`, and `.agents/TODO.md` ("Look at the Freighter and Scout SDK-status goldens") inherited that omission. Because this lane's maintenance exception strictly authorized opening only `q-tool-freighter-wallet` and `q-tool-wallets-comparison`, `q-soroban-cli-bindings` and `q-tool-indexer-repos-discovery` were **not** opened. The orchestrator should decide whether to open a separate scoped maintenance lane for `q-soroban-cli-bindings` and `q-tool-indexer-repos-discovery` before closing the Scout SDK-status half of the TODO item.
