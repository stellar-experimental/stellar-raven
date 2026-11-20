# Item 8.13 (`improvements`) Lane Report

## What Changed

Ran a full live audit and slimming pass across all **95 active findings** under `improvements/` (including fresh `sk-040` from #521 and `sd-114` from #523, which were left untouched as `verified` per brief):

- **Live probes and verification (0 model calls):**
  - `npm run improvements:probes`: **18/18 recurring**, 0 fixed-candidate, 0 inconclusive, 0 errors.
  - `npm run improvements:lint -- --live`: **ok** (all 95 findings, all intake repos, and all GitHub URLs verified live).
  - Checked all 106 unique GitHub issue/PR refs across `improvements/` via `gh api` and checked open inbound `upstream-improvement-ready` issues on `stellar-experimental/stellar-raven` (**0 open**).
  - Live-verified all 77 non-probed findings against Scout (`scout-1.0.0`), Lumenloop API, Stellar Docs / Mintlify Discovery API, `stellar.org`, upstream skill repos, and `cloudflare/agents` `main`/npm.
  - **Result:** **0 findings are fixed upstream and deployed**, so no finding was drained to `improvements/resolved.json` and no upstream post or comment was made.
- **Dated recurrences added (25 findings):**
  - All 18 probed findings (`cs-004`, `cs-005`, `cs-006`, `cs-007`, `ll-003`, `ll-007`, `sk-005`, `sk-007`, `sk-014`, `sk-015`, `sk-022`, `sd-105`, `sd-106`, `sd-107`, `sd-109`, `sd-110`, `sls-117`, `sls-118`) per `.agents/skills/improvements-pipeline/SKILL.md` ("Probes and cadence").
  - The 7 slimmed still-reproducing findings where a `2026-11-20` live check was recorded in the file (`ll-009`, `ll-012`, `ll-025`, `ll-030`, `sd-005`, `sk-027`, `sk-028`) per `SKILL.md` ("Follow up on filed findings").
- **Stale wording slimmed (18 findings) and metadata repaired:**
  - Removed 10 redundant/non-standard body sections (7 `## Current verification — 2026-11-06` / `## Current upstream disposition — 2026-11-06` blocks duplicating frontmatter, 1 40-line `## Recurrence — 2026-07-13` internal-eval narration in `ll-017`, 1 `### Later implementation context — 2026-11-06` block in `ll-025`, and 1 non-standard `## Consequence` section folded into `sd-004`), plus ~18 stale/duplicated paragraphs (retired Algolia references in `sd-005`, retired `Solo` body references in `ll-006`, `ll-007`, `ll-009`, `sd-009`, stale `"proposed pending"` in `ll-022`, stale `"authenticated API returned 401 without a key"` in `ll-012`/`ll-030`, stale mirror wording in `sk-007`, stale version/count numbers in `cs-001`, `sk-027`, `sk-028`, and stale replay/date-field scope in `ll-007`/`ll-006`).
  - Fixed a misplaced `evidence` entry under `recurrences` in `sd-005` and added open PR `stellar/stellar-docs#3142` to `sd-005` evidence.
- **Generated index:** Regenerated `improvements/INDEX.md` via `npm run improvements:index` (95 findings). `improvements/resolved.json` and `improvements/intake.json` needed no edits.
- **Horizon protocol-ceiling monitor** (`.agents/TODO.md` "Monitor the Horizon protocol-ceiling note"):
  - Live `GET https://stellarlight.xyz/api/repos/explain?repo=stellar%2Fstellar-horizon&q=...`: `ok: true`, `answerSource: "stellarlight-code-scan"`, `generatedAt: "2026-11-20T00:57:56.401Z"`, `codeVerified.scannedRef: "01ba44a988b3ebc2d68d3cb6747fa2c2733773cd"`, `sourceCheck.scannedValue: "30"` (`notedValue: "29"` at `430a28e` flagged as dated conflict).
  - Source check at `stellar/stellar-horizon` `01ba44a988b3ebc2d68d3cb6747fa2c2733773cd` `internal/ingest/main.go:38`: `MaxSupportedProtocolVersion uint32 = 30`. **PASS** (matches source at `scannedRef`; no finding filed).

## Line Counts (Before vs After)

Total across 37 edited files under `improvements/`: **2,671 → 2,442 lines (-229 net lines)**; 10 duplicate/obsolete body sections and ~18 redundant/stale paragraphs removed.

| File | Before | After | Delta |
|---|---:|---:|---:|
| `improvements/INDEX.md` | 131 | 131 | 0 |
| `improvements/canonical-source/cs-001-codemode-search-short-token-prefix.md` | 115 | 115 | 0 |
| `improvements/canonical-source/cs-004-circle-stellar-contracts-handler-names.md` | 62 | 64 | +2 |
| `improvements/canonical-source/cs-005-circle-stellar-arc-quickstart-fast-threshold.md` | 62 | 64 | +2 |
| `improvements/canonical-source/cs-006-paxos-stellar-toml-stale-llc-entity-name.md` | 49 | 51 | +2 |
| `improvements/canonical-source/cs-007-stellar-8004-readme-mpp-expansion.md` | 53 | 51 | -2 |
| `improvements/canonical-source/cs-010-createai-catalog-drops-anthropic-provider-options.md` | 118 | 114 | -4 |
| `improvements/lumenloop/ll-003-region-vocabulary-free-text.md` | 59 | 61 | +2 |
| `improvements/lumenloop/ll-006-article-ranking-freshness.md` | 66 | 59 | -7 |
| `improvements/lumenloop/ll-007-event-summary-date-prose-mismatch.md` | 73 | 73 | 0 |
| `improvements/lumenloop/ll-009-messari-report-misattribution.md` | 75 | 73 | -2 |
| `improvements/lumenloop/ll-012-rwa-live-planned-recall.md` | 70 | 62 | -8 |
| `improvements/lumenloop/ll-017-semantic-person-match-provenance.md` | 108 | 65 | -43 |
| `improvements/lumenloop/ll-020-protocol-27-post-vote-state.md` | 56 | 49 | -7 |
| `improvements/lumenloop/ll-022-cctp-milestone-provenance.md` | 48 | 41 | -7 |
| `improvements/lumenloop/ll-023-confidential-tokens-preview-status.md` | 51 | 44 | -7 |
| `improvements/lumenloop/ll-024-meridian-event-supersession.md` | 52 | 45 | -7 |
| `improvements/lumenloop/ll-025-quantum-roadmap-maturity-typing.md` | 64 | 44 | -20 |
| `improvements/lumenloop/ll-030-project-record-subproducts-unnamed.md` | 77 | 59 | -18 |
| `improvements/skills/sk-005-onboarding-skills-audience-metadata.md` | 73 | 75 | +2 |
| `improvements/skills/sk-007-ecosystem-digest-hardcoded-date.md` | 73 | 75 | +2 |
| `improvements/skills/sk-014-develop-secure-contracts-stellar-vocabulary.md` | 67 | 69 | +2 |
| `improvements/skills/sk-015-oz-stellar-skills-vendor-neutral-triggers.md` | 66 | 68 | +2 |
| `improvements/skills/sk-022-oz-upgrade-skill-retired-derive-api.md` | 80 | 68 | -12 |
| `improvements/skills/sk-027-scout-skill-stale-skills-catalog.md` | 78 | 80 | +2 |
| `improvements/skills/sk-028-scout-skill-stale-builder-count.md` | 55 | 57 | +2 |
| `improvements/stellar-docs/sd-004-rpc-limits-described-as-hardcoded.md` | 70 | 47 | -23 |
| `improvements/stellar-docs/sd-005-agentic-payments-no-landscape-positioning.md` | 118 | 57 | -61 |
| `improvements/stellar-docs/sd-009-sep-6-interactive-deprecation-undiscoverable.md` | 79 | 52 | -27 |
| `improvements/stellar-docs/sd-035-wallets-kit-jsr-package-api-drift.md` | 70 | 62 | -8 |
| `improvements/stellar-docs/sd-105-lumens-page-genesis-supply-contradiction.md` | 60 | 62 | +2 |
| `improvements/stellar-docs/sd-106-tier-1-page-names-no-organizations.md` | 66 | 68 | +2 |
| `improvements/stellar-docs/sd-107-newer-protocol-contract-rejection-undocumented.md` | 67 | 69 | +2 |
| `improvements/stellar-docs/sd-109-passkeys-page-says-friendbot-cannot-fund-contracts.md` | 71 | 73 | +2 |
| `improvements/stellar-docs/sd-110-lab-contract-explorer-bindings-language-list.md` | 68 | 70 | +2 |
| `improvements/stellar-light-scout/sls-117-sdf-org-source-missing-strategy-service-provider-pages.md` | 61 | 63 | +2 |
| `improvements/stellar-light-scout/sls-118-research-corpus-omits-limits-proposals.md` | 60 | 62 | +2 |
| **Total (37 files)** | **2,671** | **2,442** | **-229** |

## Per-Finding Verdict Table (All 95 Active Findings, 2026-11-20)

| Finding | Status | Verdict | Evidence (2026-11-20 live check) |
|---|---|---|---|
| `cs-001` | `reported-upstream` | keep + slimmed | `cloudflare/agents` `main` `search.ts` still contains `token.startsWith(c)`; npm latest `@cloudflare/codemode@0.5.6`; `#2296` open. |
| `cs-004` | `reported-upstream` | keep + probed | `improvements:probes`: HTTP 200 still contains `handle_receive_finalized_message`; `#36` open. |
| `cs-005` | `reported-upstream` | keep + probed | `improvements:probes`: HTTP 200 still contains `// Fast Transfer finality threshold`; `#37` open. |
| `cs-006` | `verified` | keep + probed | `improvements:probes`: HTTP 200 still contains `Paxos Trust Company LLC is`; intake `unclear`. |
| `cs-007` | `reported-upstream` | keep + probed + slimmed | `improvements:probes`: HTTP 200 still contains `Managed Payment Protocol`; `#71` open. |
| `cs-008` | `declined-upstream` | keep (declined) | Explicit maintainer decline (`stellar-protocol#2056` closed `not_planned`); no new evidence. |
| `cs-010` | `reported-upstream` | keep + slimmed | `cloudflare/agents` `main` `language.ts` still sets `format: "chat-completions"`; npm latest `agents@0.33.0`; `#2809` open. |
| `cs-012` | `reported-upstream` | keep | `cloudflare/agents` `main` `executor.ts` still uses `error: err.message`; `#2897` and bot PR `#2898` open. |
| `ll-001` | `reported-upstream` | keep | `get_document` research `86` (`week of May 29, 2026`) still has slug `stellar-weekly-roundup-week-29-2026`; `#21` open. |
| `ll-002` | `reported-upstream` | keep | `get_document` av `2207` still returns summary 344 / long_summary 694 chars; `#22` open. |
| `ll-003` | `reported-upstream` | keep + probed | `improvements:probes`: `get_regions` HTTP 200 still contains `africa`/`Africa` and `mena`/`MENA`; `#23` open. |
| `ll-004` | `reported-upstream` | keep (inconclusive) | `GET /v1/tools` auth=21, anon=18, `/v1/me` available=21/visible=21; matches prior intermittent passing windows; `#42` open with no fix explanation. |
| `ll-005` | `reported-upstream` | keep | `find_content_by_entity` `{entity: "Denelle Dixon", entity_type: "person"}` still returns `success: true`, all groups empty; `#19` open. |
| `ll-006` | `reported-upstream` | keep (partial) + slimmed | Broad RWA articles remain non-monotonic (`0.580`, `0.556`, `0.677`); default bounded July query still mixes undated `9054` and non-chronological order (`date_field: "publishing_date"` filters undated rows for articles only); `#18` open. |
| `ll-007` | `reported-upstream` | keep + probed + slimmed | `improvements:probes`: events `1597`/`1598` still return June 27 `start_at` and July 27 summary prose; `#20` open. |
| `ll-008` | `reported-upstream` | keep | `get_project` `lobstr` still returns `operating_region: ["Indonesia"]`, `based_in: "Estonia"`; `stellar-ecosystem-db#3` open. |
| `ll-009` | `reported-upstream` | keep + slimmed + rec | Roundup `week-29-2026` still carries `$2.8B` beside YouTube `t0agtgLajhg`; `#25` open. |
| `ll-010` | `reported-upstream` | keep | Research `133` (`week of Jun 19, 2026`) and `86` unchanged; `#27` open. |
| `ll-011` | `reported-upstream` | keep | Research `66` unchanged; `#24` open. |
| `ll-012` | `reported-upstream` | keep + slimmed + rec | `search_directory` `"real-world assets"` still returns `agama`, `archax`, `borderdollar`, `centrifuge`, `dtcc` ahead of major live issuers; `#29` open. |
| `ll-013` | `reported-upstream` | keep | `get_scf_submissions` `{slug: "blend"}` still returns bare `budget` without award/paid/currency fields; `#26` open. |
| `ll-014` | `reported-upstream` | keep | `find_content_about_project` `{slug: "soroswap"}` still lacks per-row match class / evidence span; `#30` open. |
| `ll-015` | `reported-upstream` | keep | `get_document` research `141` (`stellar-weekly-roundup-week-jul-3-2026`) still says `July 9`; `#28` open. |
| `ll-016` | `reported-upstream` | keep | Historical fork/SCP semantic retrieval still returns unstructured rows with no claimant/dispute links; `#31` open. |
| `ll-017` | `reported-upstream` | keep (partial) + slimmed | `search_content_semantic` (`limit: 10`) returns `_weak_match: true` (`0.231` Tyler vs `0.259` Strupey) with no per-row match provenance; `#36` open. |
| `ll-018` | `reported-upstream` | keep | `get_scf_submissions` `{slug: "band"}` still returns 2 rows including `Bando` (`linked_project_slugs: ["bando"]`); `#34` open. |
| `ll-019` | `reported-upstream` | keep | `GET /v1/tools/find_av_passages` `output_schema` still declares `["results","text"]` while live call returns `{success,data:[...],error,meta}`; `#35` open. |
| `ll-020` | `reported-upstream` | keep (partial) + slimmed | `search_documents` articles `"Zipper"` still returns only pre-vote article `8084` with no activation link; `#32` open. |
| `ll-022` | `reported-upstream` | keep (inconclusive) + slimmed | `get_document` article `6461` still has no typed milestone fields; `#38` open (owner question Q2). |
| `ll-023` | `reported-upstream` | keep (inconclusive) + slimmed | `get_document` article `8877` still has no typed network/maturity/audit fields; `#39` open (owner question Q2). |
| `ll-024` | `reported-upstream` | keep (inconclusive) + slimmed | Event `1457` still not found; Meridian searches return current Lisbon rows without revision metadata; `#33` open (owner question Q2). |
| `ll-025` | `reported-upstream` | keep + slimmed + rec | `get_document` article `8228` still contains `"immediately"` without structured deployment state; `#37` open. |
| `ll-026` | `reported-upstream` | keep | `get_document` article `5416` still has no typed announcement/effective/launch timestamps; `#40` open. |
| `ll-027` | `reported-upstream` | keep | `get_document` article `8068` still states `"nine assets"` without enumerated unit/as-of basis; `#41` open. |
| `ll-028` | `reported-upstream` | keep | `list_documents` with bogus `sort: "definitely_not_a_real_sort_key"` still returns HTTP 200 `success: true`; `#43` open. |
| `ll-029` | `reported-upstream` | keep | All 5 public tool detail schemas (`find_content_by_entity`, `find_similar_projects_semantic`, `find_similar_scf_submissions`, `get_related_projects`, `get_tags_vocabulary`) still declare `["results","text"]`; `#35` open. |
| `ll-030` | `reported-upstream` | keep + slimmed + rec | `get_project` `{slug: "wisdomtree"}` still omits `CRDT` and `CRDYX`; `#44` open. |
| `ll-031` | `reported-upstream` | keep | `search_documents` still emits string ID `"13855"` which `get_document` rejects with HTTP 400 `Expected number, received string`; `#46` open. |
| `ll-032` | `reported-upstream` | keep | `get_project` `{slug: "freighter"}` still has `title: "Freighter"` and no Varial reference; `stellar-ecosystem-db#5` open. |
| `ll-033` | `reported-upstream` | keep | `get_project` `{slug: "slender"}` still says `"borrow assets without collateral"`; `stellar-ecosystem-db#6` open. |
| `ll-034` | `reported-upstream` | keep | `search_directory` `{query: "Blend", limit: 3}` still returns `["account-demolisher","backyard","bexo"]`; `#48` open. |
| `ll-035` | `reported-upstream` | keep | `list_documents` with `nonexistent_arg_xyz: 123` still returns HTTP 200 `success: true`; `#49` open. |
| `ll-036` | `reported-upstream` | keep | `list_documents` `{collection: "proposals", search: "onerror", limit: 20}` still returns 7 rows; `#50` open. |
| `ll-037` | `reported-upstream` | keep | `get_related_projects` `{content_id: 99999999, content_type: "article"}` still returns HTTP 200 `success: true, data: []`; `#47` open. |
| `ll-038` | `reported-upstream` | keep | `get_project` `{slug: "xbull"}` description still lists Android/iOS unqualified; `stellar-ecosystem-db#4` open. |
| `ll-039` | `reported-upstream` | keep | `search_content_semantic` for NBU TASCOMBANK pilot still returns no `bank.gov.ua` row; `#52` open. |
| `sd-004` | `declined-upstream` | keep (declined) + slimmed | Explicit operational-policy decline (`stellar-docs#2567`); folded non-standard `## Consequence` section. |
| `sd-005` | `reported-upstream` | keep + slimmed + rec | `agentic-payments.md` & `x402.md` still credit Coinbase and omit AP2/ACP; `#2565` & PR `#3142` open. |
| `sd-009` | `declined-upstream` | keep (declined) + slimmed | Explicit decline (`stellar-docs#2575`); removed stale hypothetical & Solo ref while preserving diagnostic fallback. |
| `sd-014` | `reported-upstream` | keep | Mintlify `"transaction inclusion proof"` (49 sections) & `gh search code "inclusion proof"` (0 results) show no guide; `#2611` open. |
| `sd-035` | `reported-upstream` | keep + slimmed | `example-application-tutorial/overview.md` still pins `@^1` / `new StellarWalletsKit`; `#2609` open. |
| `sd-048` | `reported-upstream` | keep | `stellar-protocol` `master` `cap-0075.md` still lists `(3, 5, 7, or 11)`; PR `#2059` open (behind, unmerged). |
| `sd-050` | `reported-upstream` | keep | `client-sdks.md` still uses unscoped `` `stellar-sdk` ``; `#2561` open. |
| `sd-059` | `reported-upstream` | keep | Mintlify Discovery `op_bad_signer` (38 sections) still omits `set-options` result-code page; `#2995` open. |
| `sd-061` | `reported-upstream` | keep | `claimable-balances.md:632` still says to call `getLedgerEntries` to obtain Balance ID; `#2998` & draft PR `#2752` open. |
| `sd-070` | `reported-upstream` | keep | `migrate-contract-storage.md` still states `UnexpectedSize` trap with no CAP-86/v28 scope; draft PR `#2763` open. |
| `sd-074` | `reported-upstream` | keep | `scaffold-stellar.md` still names `environments.toml` and omits `scaffold.yml`; PR `#2708` open. |
| `sd-077` | `reported-upstream` | keep | `stellar.org/grants-and-funding` still requires `"live product"` while `marketing-grants` still contains `"preparing to launch soon"`; privately forwarded to SDF web team. |
| `sd-081` | `reported-upstream` | keep | `restore-data.md` still redeclares `const { Api, assembleTransaction } = StellarRpc` against `submit-transaction-wait.md` `import { Api, Server }`; `#2562` open. |
| `sd-096` | `declined-upstream` | keep (declined) | Explicit decline (`stellar-docs#3028`); owner question Q3. |
| `sd-102` | `declined-upstream` | keep (declined) | Explicit RPC-team scope decline (`stellar-docs#2899` review). |
| `sd-105` | `reported-upstream` | keep + probed | `improvements:probes`: `lumens.md` HTTP 200 still contains `"will ever exist was created when the Stellar network went live"`; `#3143` & PR `#3147` open. |
| `sd-106` | `reported-upstream` | keep + probed | `improvements:probes`: `tier-1-orgs.md` HTTP 200 still excludes `Blockdaemon` and `Franklin Templeton`; `#3144` & PR `#3148` open. |
| `sd-107` | `reported-upstream` | keep + probed | `improvements:probes`: `overview.md` HTTP 200 still matches `"should match..."` and excludes `"newer"`; `#3145` & PR `#3149` open. |
| `sd-108` | `reported-upstream` | keep | `gh search code "blind signing"` and `"unsolicited"` in `stellar/stellar-docs` still return 0 results; `#3146` open. |
| `sd-109` | `reported-upstream` | keep + probed | `improvements:probes`: `passkeys-prerequisites.md` HTTP 200 still contains `"only funds classic"`; `#3150` & PR `#3152` open. |
| `sd-110` | `reported-upstream` | keep + probed | `improvements:probes`: `contract-explorer.md` HTTP 200 still contains `"TypeScript, JSON, Rust, Python, and Java"`; `#3151` & PR `#3153` open. |
| `sd-111` | `reported-upstream` | keep | `stellar.org/api/collections/audits` (pages 1–7) still returns 77 records with 4 `"Unnamed record"` titles; privately forwarded to SDF web team. |
| `sd-112` | `reported-upstream` | keep | Mintlify Discovery `"web+stellar:pay payment request QR code"` (43 sections) still omits `/wallet/sep7`; `#3163` open. |
| `sd-113` | `verified` | keep (owner Q1) | `gh search code "Pi Network"` in `stellar/stellar-docs` returns 0 results; owner ruled out of scope / not forwarded on 2026-11-17 (owner question Q1). |
| `sd-114` | `verified` | untouched (fresh) | Merged today in #523 (`docsprobe`); stays `verified` per brief (owner question Q4). |
| `sk-004` | `reported-upstream` | keep | `lumenloop/lumenloop-skills` `main` dossier/digest still claim `"Direct quotes"` / `"verbatim passages"`; `#1` open. |
| `sk-005` | `reported-upstream` | keep + probed | `improvements:probes`: `stellar-project-dossier/SKILL.md` still has `user-invocable: true` and excludes `audience:`/`transport:`; `#2` open. |
| `sk-007` | `reported-upstream` | keep + probed + slimmed | `improvements:probes`: `stellar-ecosystem-digest/SKILL.md` still contains `Today is 2026-06-08`; `#3` open. |
| `sk-014` | `reported-upstream` | keep + probed | `improvements:probes`: `develop-secure-contracts/SKILL.md` still contains `security primitives (Pausable, ReentrancyGuard)`; `#13` open. |
| `sk-015` | `reported-upstream` | keep + probed | `improvements:probes`: `setup-stellar-contracts/SKILL.md` still contains `(1) install Stellar CLI and Rust toolchain for Soroban`; `#14` open. |
| `sk-019` | `reported-upstream` | keep | `Stellar-Light/stellar-scout` `main` `SKILL.md` still lists `/api/feedback`; `#13` open. |
| `sk-022` | `reported-upstream` | keep + probed + slimmed | `improvements:probes`: `upgrade-stellar-contracts/SKILL.md` still contains `#[derive(UpgradeableMigratable)]`; `#16` open. |
| `sk-025` | `reported-upstream` | keep | `Trustless-Work/trustlesswork-skill` `main` `v2/core-concepts.md` still forbids `Authorization: Bearer`; `#6` open. |
| `sk-027` | `reported-upstream` | keep + slimmed + rec | `Stellar-Light/stellar-scout` `main` still names 7 SDF skills, `soroban`, and `skills.stellar.org/anchors` while live `/api/skills` has 84 entries; `#14` open. |
| `sk-028` | `reported-upstream` | keep + slimmed + rec | `Stellar-Light/stellar-scout` `main` still says `"in the dozens"` / `"~110 profiles"` while live `/api/status` reports 417 builders; `#15` open. |
| `sk-029` | `reported-upstream` | keep | All 4 ungrouped error URLs still return HTTP 404 while control `stellar-tx-failed` returns 200; `#20` open. |
| `sk-030` | `reported-upstream` | keep | `lumenloop/lumenloop-skills` `main` still names Freighter with zero Varial matches; `#6` open. |
| `sk-031` | `reported-upstream` | keep | `https://skills.stellar.org/skills/soroban/SKILL.md` still returns HTTP 200 (71,149 bytes) with `wasm32-unknown-unknown`; `#172` open. |
| `sk-040` | `verified` | untouched (fresh) | Merged today in #521 (`skmalformed`); stays `verified` per brief (owner question Q4). |
| `sls-039` | `declined-upstream` | keep (declined) | Explicit provider-hosted-history boundary (`stellarlight#522` closed); no new evidence. |
| `sls-116` | `reported-upstream` | keep | `scfAwarded=true` returns 711 rows; `soroban-contract-source-verification-service-bax` still absent; `peer` still has null `scfSourceUrl`/`scfAsOf`; `#1952` open. |
| `sls-117` | `reported-upstream` | keep + probed | `improvements:probes`: `source=sdf-org` HTTP 200 still excludes `stellar.org/foundation/strategy`; `#1969` open. |
| `sls-118` | `reported-upstream` | keep + probed | `improvements:probes`: SLP-0006 research query HTTP 200 still excludes `limits/slp-0006`; `#1970` open. |
| `sls-119` | `reported-upstream` | keep | `/api/stablecoins?peg=EUR` EURC row still serves `issuerOfRecord: "Circle Internet Financial, LLC"`; `#1971` open. |
| `sls-120` | `reported-upstream` | keep | `/api/stablecoins` `BRLT-GCHQ3F2B` still has all issuer-of-record fields `null`; `#1973` open. |
| `sls-121` | `reported-upstream` | keep | `/api/projects/search?type=Wallet` still serves 5 `Live` wallets (`spatium`, `sentit`, `freelii`, `elsa`, `bebop`) with later `none-found` `availabilityCheck`; `#1974` open. |
| `sls-122` | `reported-upstream` | keep | `/api/projects/search?q=wallet` still returns 196 rows (`total: 195`) with duplicate `coca`; `#1975` open. |
| `sls-123` | `reported-upstream` | keep | `POST /api/partners/match` still returns HTTP 503 `unavailable: true`; `#1976` open. |
| `wai-001` | `declined-upstream` | keep (declined) | `workers-ai-provider` deprecated/frozen (`cloudflare/ai#639` closed unmerged, `#634` closed `not_planned`); Raven still depends on it pending `createAI` migration. |

## Gates (Post-Challenge Fixes, All Run Bare)

| Gate | Exit Code | Result |
|---|---|---|
| `npm run improvements:index` | `0` | Wrote `improvements/INDEX.md` (95 findings) |
| `npm run improvements:lint` | `0` | `improvements lint ok (95 findings)` |
| `npm run improvements:lint -- --live` | `0` | `improvements lint ok (95 findings, live intake checked)` |
| `npm run typecheck` | `0` | Clean |
| `npm test` | `0` | 174 passed, 5 skipped (4165 tests passed, 3 expected fail, 5 skipped) |
| `npm run build` | `0` | Dry-run Worker bundle built cleanly |
| `npm run secrets:scan -- --tree` | `0` | `secret-scan: clean` |

## Codex Sol Review and Challenge Verdicts

- **Reviewer:** Codex Sol (`gpt-6.2-sol`, `model_reasoning_effort="high"`, read-only sandbox)
- **Review file:** [SOL-REVIEW.md](./SOL-REVIEW.md)
- **Challenge file:** [CHALLENGE.md](./CHALLENGE.md)
- **Findings reported:** 6 total (2 medium, 4 low)
- **Challenge verdicts by class:**
  - **Valid:** **6** (all 6 verified live and fixed; two mechanism clarifications noted in `CHALLENGE.md`)
  - **Invalid:** **0**
  - **Valid but not worth fixing:** **0**

## Pull Request and Impact Classification

- **PR URL:** https://github.com/stellar-experimental/stellar-raven/pull/533
- **Worker bytes changed (`git diff origin/main -- src/ package.json package-lock.json wrangler.jsonc`):** **No** (0 bytes changed).
- **Model-facing change:** **No** (`improvements/` records and round report only; no deploy required).

## TODO Item Status (for Orchestrator)

- **Target lane:** Item 8.13 `improvements` — findings up to date, clean, viable (`.agents/TODO.md` not edited by this lane).
- **Reference reconciliation:** 0 findings were retired, so no golden case, consistency register entry, or `.agents/TODO.md` finding reference became dangling.
- **Horizon monitor (`.agents/TODO.md`, "Monitor the Horizon protocol-ceiling note"):** Checked on 2026-11-20 and passed (`MaxSupportedProtocolVersion = 30` at `scannedRef` `01ba44a9`); orchestrator can note the dated check in the round ledger.

## Model Calls Made

| CLI | Model ID | Effort | Purpose | Cost |
|---|---|---|---|---|
| `codex` (subscription) | `gpt-6.2-sol` | `high` | Read-only independent review of `origin/main...247b0469` (`SOL-REVIEW.md`) | Subscription ($0 API) |

No model calls were made during probing, verification, or slimming.

## Questions for the Owner

1. **`sd-113` (`improvements/stellar-docs/sd-113-pi-network-not-stellar-faq-request.md:13`) — delete out-of-scope record?**
   - Exact line: `"Not posted and not forwarded (owner, 2026-11-17): out of scope for stellar.org; Pi Network owns the fact. No owner page undertakes the topic."`
   - It sits at `status: verified` with `intake: unclear` and no viable upstream owner; `improvements-resolve.mjs` only retires `fixed-upstream` records.
   - **Recommendation:** Delete `sd-113` and remove its `intake.json` override so the active queue holds only viable upstream items (and update the `.agents/TODO.md:1462` reference if deleted).
2. **`ll-022`, `ll-023`, `ll-024` (`improvements/lumenloop/ll-022-cctp-milestone-provenance.md:32`, `ll-023-confidential-tokens-preview-status.md:21`, `ll-024-meridian-event-supersession.md:19`) — close upstream and retire speculative metadata requests?**
   - All three are July 11 optional structured-metadata requests that never retained a reproduced wrong-content response (`inconclusive` across 2026-11-06, 2026-11-09, and 2026-11-20 sweeps), with zero maintainer activity on `lumenloop/lumenloop-backend#38`, `#39`, `#33`.
   - **Recommendation:** Either keep them open as low-priority upstream feature requests (status quo) or authorize closing `#33`, `#38`, `#39` upstream as unsubstantiated and retiring the three local records.
3. **`sd-096` (`improvements/stellar-docs/sd-096-wildcard-redirects-land-on-missing-pages.md:25`) — keep `declined-upstream` or delete?**
   - Exact line: `Three invented source paths redirect to pages that do not exist. The original old-page premise was incorrect; the maintainer confirmed these paths never existed.`
   - **Recommendation:** Keep `declined-upstream` per `improvements-pipeline/SKILL.md` so future redirect sweeps do not re-file the same three paths.
4. **`sk-040` and `sd-114` upstream posting:**
   - Both fresh `verified` findings have verified repo targets (`stellar/stellar-dev-skill` and `stellar/stellar-docs`) and await owner approval to run `npm run improvements:file`.
