# Item 8.12 (`goldens2`) — Primary-source verification record

Date: 2026-11-19 UTC
Branch: `np/8.12-goldens2`
Lane: `goldens2` (Gemini 4 Neon, Antigravity)
Follow-up to: lane `goldens` (PR #511) and `.agents/TODO.md` — "Look at the Freighter and Scout SDK-status goldens"

## Maintenance exception & scope

This lane runs under the Maintenance Exception in `eval/qa/README.md` ("Held-out split", "Maintenance exception"):

- **Trigger:** Upstream schema change shown by primary sources — Scout 1.9.150 (absorbed in PR #452, commit `0bfbc8f4`) added `jsSdkStatus`, `sorobanSdkStatus`, and `stellarJsDep` and redefined existing `Repo.codeVerified.versionStatus` from Soroban-SDK-only (Scout 1.9.135) to a combined Soroban/JS SDK status. Item 0.2's path-only consumer grep (`.agents/rounds/2026-11-16-next-phase/items/0.2/EXEC.md:155`) listed two QA cases (`q-soroban-cli-bindings` and `q-tool-indexer-repos-discovery`) that `0.2/REPORT.md` and `.agents/TODO.md` subsequently omitted.
- **Cases opened:** Exactly `q-soroban-cli-bindings`, `q-tool-indexer-repos-discovery`, and their matching entries in `eval/qa/cases.json` and `eval/qa/sample.json`. No other case file or compiled entry was opened.
- **No Raven output:** No stored answer, transcript, or verdict was read, and no model-calling eval was run.
- **Split & text hygiene:** No split file was opened or consulted, no split membership is recorded, and this record neither quotes nor paraphrases any case's judge-facing text (`question`, `golden.*`).

## Primary-source observations (2026-11-19 UTC)

Independent source classes per `.agents/skills/golden-truth/SKILL.md`:

| Class | Source / command | Observed on 2026-11-19 UTC |
|---|---|---|
| A | `GET https://developers.stellar.org/docs/tools/cli/stellar-cli.md` (and HTML page) | HTTP 200. Lines 283-370 match all CLI claims checked against `q-soroban-cli-bindings`. |
| A | `GET https://developers.stellar.org/docs/learn/fundamentals/contract-development/types/fully-typed-contracts.md` (and HTML page) | HTTP 200. Primary docs page matches the claims checked against `q-soroban-cli-bindings`. |
| A | `GET https://developers.stellar.org/docs/tools/lab/smart-contracts/contract-explorer.md` | HTTP 200. Line 84 still satisfies the `probe.expect.contains` check in `improvements/stellar-docs/sd-110-lab-contract-explorer-bindings-language-list.md`, confirming `sd-110` still reproduces. |
| A | `GET https://developers.stellar.org/docs/data/indexers.md`, `.../indexers/build-your-own.md`, `.../indexers/build-your-own/ingest-sdk.md` | All HTTP 200. Current tool descriptions and architecture sections match the claims checked against `q-tool-indexer-repos-discovery`. |
| A | `GET https://developers.stellar.org/docs/build/guides/events/ingest.md` (and HTML page) | HTTP 200. Line 9 matches the claims checked against `q-tool-indexer-repos-discovery`. |
| B | `gh api repos/stellar/stellar-cli/releases/latest` + `compare/v30.0.1...main` + `bindings.rs` & `bindings/rust.rs` | Latest release is still `v30.0.1` (tag commit `f2a7b74175c34585f3b30a1abf42a2d41cbcc390`, published `2026-11-03T02:24:38Z`). `main` (`0571268fdce4ac12f5732ff6a9af42a0ea05296b`) is 2 commits ahead with 0 changed files under `bindings`; `cmd/soroban-cli/src/commands/contract/bindings.rs` and `bindings/rust.rs` at `v30.0.1` / `main` match `q-soroban-cli-bindings`. |
| B | `gh api repos/stellar/js-stellar-sdk/commits/main` + `contents/README.md?ref=main` (`## CLI`) | Default branch `main` at `5243062fdf7a874d33cbf3089e898eb0777337a8` (`2026-11-13T23:17:41Z`). `## CLI` section matches the claims checked against `q-soroban-cli-bindings`. |
| B | `gh api repos/stellar/stellar-docs/issues/3151` & `pulls/3153` | Both remain `open` (`closed_at: null`, `merged_at: null`), confirming `sd-110` remains `reported-upstream`. |
| B | `gh api repos/{stellar/stellar-ledger-data-indexer,stellar/stellar-galexie,stellar/go-stellar-sdk,stellar/stellar-etl,subquery/stellar-subql-starter}` + `go-stellar-sdk/commits/main` & `contents/ingest?ref=main` | All five `truth.sources` repos have `archived: false`. SDF repos pushed `2026-11-12` to `2026-11-19`; `subquery/stellar-subql-starter` pushed `2026-01-22`. `stellar/go-stellar-sdk` `main` at `4cee025512a603a2f21639160e379251f4f43507` (`2026-11-19T05:31:49Z`) serves 36 entries in `ingest/`. |
| B | `gh api repos/stellar/stellar-rpc/releases/latest` + `compare/v30.0.0...v30.0.1` + tagged `v30.0.1` source (`rpcv1/config/options.go`, `methods/get_events.go`) | Latest release is `v30.0.1` (commit `6b6ec60c8bde5a93984b6290065d3882d384b25d`, published `2026-11-12T17:06:18Z`; 211 commits ahead of `v30.0.0` `13e53516633c`). Direct inspection at tag `v30.0.1` of `cmd/stellar-rpc/internal/rpcv1/config/options.go:307-312` (renamed from `internal/config/options.go` with 0 diff) and `cmd/stellar-rpc/internal/methods/get_events.go:139,160-175,269-270` matches `q-tool-indexer-repos-discovery`. `Stellar-Light/stellarlight#512` remains `closed` (`2026-07-14T00:13:10Z`). |
| B | `inventory/stellar-light.json` vs `git show 0bfbc8f4~1:inventory/stellar-light.json` + `catalog/manifest.json#scout.searchRepos` | Confirms Scout 1.9.135 -> 1.9.150 added `Repo.codeVerified.{jsSdkStatus,sorobanSdkStatus,stellarJsDep}` and redefined `Repo.codeVerified.versionStatus` from Soroban-SDK-only to combined Soroban/JS SDK status (`'unknown' never implies staleness`). `catalog/manifest.json#scout.searchRepos` still carries its discovery-metadata catalog note. |
| C | `GET https://stellarlight.xyz/api/openapi.json` | Live Scout OpenAPI version is `1.9.150`, matching committed `inventory/stellar-light.json` (`Repo.codeVerified` exposes `jsSdkStatus`, `sorobanSdkStatus`, `stellarJsDep`, and combined `versionStatus`). |
| C | Local Raven (`localhost:8797`, `observedAt` `2026-11-19T22:08:45Z`–`22:08:53Z`) `scout.searchRepos` (`{ q: "indexer", limit: 20 }`, `{ q: "subquery/stellar-subql-starter", limit: 5 }`, `{ q: "stellar-subql-starter", limit: 5 }`, `{ q: "stellar/stellar-galexie", limit: 3 }`, `{ q: "stellar/stellar-ledger-data-indexer", limit: 3 }`, `{ q: "stellar/stellar-etl", limit: 3 }`, `{ q: "stellar/go-stellar-sdk", limit: 3 }`, `{ q: "mercury", limit: 5 }`, `{ q: "obsrvr", limit: 5 }`) and `scout.analyzeEcosystem({})` | `generatedAt` `2026-11-19T22:08:46Z`–`22:08:53Z`. Top-level repo row keys still include `repoScore`, `codeVerified`, and `activityState` with no `license` key (`hasLicenseKey: false`). All four SDF Go repos (`stellar-ledger-data-indexer` 92, `stellar-galexie` 92, `stellar-etl` 91, `go-stellar-sdk` 100) are `active`, `isArchived: false`, `stellarProof: "lang-sdk"`, and carry `sorobanSdkStatus: "unknown"`, `jsSdkStatus: "unknown"`, `versionStatus: "unknown"`. Both qualified and bare-name queries for `subquery/stellar-subql-starter` return it at rank 1 (`repoScore: 58`, `activityState: "dormant"`, `isArchived: false`, `versionStatus: "unknown"`). Community JS-SDK rows (e.g., `subquery/subql-stellar` `@stellar/stellar-sdk@^14.4.3` `supported`, `paltalabs/mercury-sdk` `isArchived: true` `deprecated`, `withObsrvr/stellarbeat` `@stellar/stellar-base@15.0.0` `deprecated`) populate the new `stellarJsDep`/`jsSdkStatus`/combined `versionStatus` fields as expected. `analyzeEcosystem({})` returns `toolchain` with `byVersionStatus`, `bySorobanSdkStatus`, `byJsSdkStatus`, and `adoption`. |
| E | Local Raven (`localhost:8797`, `observedAt` `2026-11-19T22:08:53Z`) `stellarDocs.search_sdk_cli_tools_docs` (`hitsPerPage: 5`), `stellarDocs.search_soroban_contract_docs` (`hitsPerPage: 5`), and `stellarDocs.search_docs` (`hitsPerPage: 5`); query strings omitted under the Maintenance Exception Records rule to avoid echoing case terms | `search_sdk_cli_tools_docs` returns `/docs/tools/cli/stellar-cli` at rank 1 (and `/docs/tools/lab/smart-contracts/contract-explorer` at rank 3); `search_soroban_contract_docs` returns `/docs/learn/fundamentals/contract-development/types/fully-typed-contracts` at rank 1; `search_docs` returns `/docs/build/guides/events/ingest` at rank 1 and `/docs/data/indexers` at rank 5. |

## `truth.sources` HTTP URL check ledger (2026-11-19 UTC, `fetch(..., { redirect: "manual" })`)

- **`q-soroban-cli-bindings` (5/5 HTTP URLs returned HTTP 200):**
  - `https://developers.stellar.org/docs/tools/cli/stellar-cli` — 200
  - `https://github.com/stellar/stellar-cli/blob/main/cmd/soroban-cli/src/commands/contract/bindings.rs` — 200
  - `https://developers.stellar.org/docs/learn/fundamentals/contract-development/types/fully-typed-contracts` — 200
  - `https://github.com/stellar/stellar-cli/releases/tag/v28.1.0` — 200
  - `https://raw.githubusercontent.com/stellar/js-stellar-sdk/master/README.md` — 200
- **`q-tool-indexer-repos-discovery` (18/18 distinct HTTP URLs — 19 total URL references across all 17 URL-bearing rows — returned HTTP 200):**
  - `https://stellarlight.xyz/api/repos/search` — 200
  - `https://developers.stellar.org/docs/data/indexers` — 200
  - `https://developers.stellar.org/docs/build/guides/events/ingest` — 200
  - `https://github.com/stellar/stellar-ledger-data-indexer` — 200
  - `https://github.com/stellar/stellar-galexie` — 200
  - `https://github.com/stellar/go-stellar-sdk/tree/main/ingest` — 200
  - `https://github.com/stellar/stellar-etl` — 200
  - `https://github.com/subquery/stellar-subql-starter` — 200
  - `https://stellarlight.xyz/api/repos/search?q=indexer` — 200
  - `https://github.com/stellar/stellar-rpc/releases/tag/v30.0.0` — 200
  - `https://stellarlight.xyz/api/repos/search?q=stellar-subql-starter&limit=5` — 200 (listed in two rows)
  - `https://stellarlight.xyz/api/repos/search?q=subquery%2Fstellar-subql-starter` — 200 (second query in compound row)
  - `https://stellarlight.xyz/api/repos/search?q=mercury` — 200
  - `https://stellarlight.xyz/api/repos/search?q=obsrvr` — 200 (second query in compound row)
  - `https://api.github.com/repos/subquery/stellar-subql-starter` — 200
  - `https://api.github.com/repos/Stellar-Light/stellarlight/issues/512` — 200
  - `https://stellarlight.xyz/api/repos/search?q=subquery/stellar-subql-starter&limit=5` — 200
  - `https://stellarlight.xyz/api/repos/search?q=subquery&limit=5` — 200

## Per-case disposition

### 1. `q-soroban-cli-bindings` — **Confirmed unchanged**

- **Trigger analysis (Scout 1.9.150 SDK-status fields):** Not applicable. `tags.service` is `"stellarDocs"` and `surface` is `["stellarDocs.search_sdk_cli_tools_docs", "stellarDocs.search_soroban_contract_docs"]`. Direct inspection of the current file confirms that none of Scout 1.9.150's SDK-status or schema-specific field names (`jsSdkStatus`, `sorobanSdkStatus`, `stellarJsDep`, `versionStatus`, `codeVerified`, `goneRepos`, `wasLive`, `byMajor`, `twice-weekly`) appear anywhere in the case (the only overlapping tokens present in the file are the QA schema key `truth.lifecycle` and ordinary English words such as `current` and `deprecated`; item `0.2/EXEC.md:155` recorded matching file paths without logging which pattern in its ellipsis-abbreviated grep matched).
- **Live claim verification:** Every claim across `question`, `golden.answer`, `golden.keyFacts`, `golden.avoid`, and `golden.notes` (including the `sd-110` canonical-page grading cap) was re-verified on 2026-11-19 across classes A, B, and E and remains accurate. Latest `stellar-cli` release tag (`v30.0.1`) has not advanced and `sd-110` (`stellar/stellar-docs#3151` / `#3153`) remains open upstream.
- **Metadata, dates & compiled parity:** All 5 HTTP URLs in `truth.sources` returned HTTP 200 (see ledger above). Keeps existing `truth.asOf` (`2026-11-14`) and `truth.reverifyBy` (`2027-06-10`) per the confirmed-unchanged rule (`items/8.12/goldens/CHALLENGE.md` Finding 1). Parsed-JSON deep equality (`JSON.stringify(batteryObj) === JSON.stringify(compiledObj)`) holds in both `eval/qa/cases.json` and `eval/qa/sample.json`. Referenced by `cluster-095` and `cluster-103` in `eval/qa/consistency-register.json` (both `consistent`, `lastChecked: 2026-11-17`, not reopened); not in `eval/qa/source-sentinels.json`.

### 2. `q-tool-indexer-repos-discovery` — **Confirmed unchanged**

- **Trigger analysis (Scout 1.9.150 SDK-status fields):** Although `tags.service` is `"scout"`, `surface` is `["scout.searchRepos"]`, and direct inspection of the file shows judge-blind `truth.sources[8].note` (`observedAt: "2026-11-02"`) mentions the top-level row key `codeVerified` (alongside the QA schema key `truth.lifecycle`), neither judge-facing fields (`question`, `golden.*`) nor judge-blind `truth.*` reference or depend on `versionStatus`, `sorobanSdkStatus`, `jsSdkStatus`, or `stellarJsDep`. Live Scout 1.9.150 `scout.searchRepos` calls confirm: (1) top-level row keys still include `repoScore`, `codeVerified`, and `activityState` with no `license` key; (2) all four SDF Go repos report `stellarProof: "lang-sdk"` and `unknown` across `sorobanSdkStatus`, `jsSdkStatus`, and combined `versionStatus` (which Scout's schema states never implies staleness); and (3) the new JS-SDK status fields on community repos add scan metadata without altering or contradicting any claim in the case.
- **Live claim verification:** Every claim across `question`, `golden.answer`, `golden.keyFacts`, `golden.avoid`, and `golden.notes` was re-verified on 2026-11-19 across classes A, B, C, and E and remains accurate. All five `truth.sources` GitHub repositories remain unarchived, `stellar/go-stellar-sdk` `ingest/` is live at `4cee025512a6`, tagged `stellar-rpc v30.0.1` (`6b6ec60c8bde`) source (`methods/get_events.go`, `rpcv1/config/options.go`) confirms no behavioral drift, and `scout.searchRepos` returns `subquery/stellar-subql-starter` at rank 1 for both qualified and bare-name queries.
- **Metadata, dates & compiled parity:** All 18 distinct HTTP URLs (19 total URL references across the 17 URL-bearing `truth.sources` rows) returned HTTP 200 (see ledger above). Keeps existing `truth.asOf` (`2026-11-02`) and `truth.reverifyBy` (`2027-04-22`) per the confirmed-unchanged rule. Parsed-JSON deep equality (`JSON.stringify(batteryObj) === JSON.stringify(compiledObj)`) holds in `eval/qa/cases.json` (not selected in `eval/qa/sample.json` or `eval/qa/tool-cases.json`). Referenced by `cluster-129` in `eval/qa/consistency-register.json` (`consistent`, `lastChecked: 2026-11-14`, not reopened); not in `eval/qa/source-sentinels.json`.
