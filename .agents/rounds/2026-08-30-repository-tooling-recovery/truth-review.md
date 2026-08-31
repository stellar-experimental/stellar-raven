# Repository-recovery golden-truth re-review

Date: 2026-08-30
Suite: `eval/repo-recovery/cases.json`
Contract: `repository-tooling-recovery-v1`
Scope: bounded re-review of two repaired class B fragments
Excluded: round ledger, retrieval profile, product recovery code, score output
Prior durable report: BLOCKING

## Method

Read current `eval/repo-recovery/cases.json` and current `/tmp/repo-recovery-truth-review.md`.
Linted the frozen suite.
Recomputed both digests from `JSON.stringify(cases)` and `ids.join("\n")`.
Checked only the two repaired source fragments against the pinned files.

Lint: `npm run eval:repo-recovery:lint` PASS.

## Digests

| Digest | Authored | Independent recompute |
|---|---|---|
| Case content | `sha256(JSON.stringify(cases))=5dee41663f80bde85328e624a02f6fd8f21f2d39a93bac04ef028c1265195534` | match |
| Ordered IDs | `sha256(ids.join("\n"))=1883592ca7b52ac06cc40881efa49e4b84b2054875aee459be2245f71372115f` | match |

Counts: 20 cases, 12 positive, 8 negative.
Source classes in the suite: A, B, C, F. No class E.

## Fragment repairs

1. `rr-neg-core-validators-fields` now cites `stellar-core_example.cfg#L875-L905`. That range lists `NAME`, `QUALITY`, `HOME_DOMAIN`, `PUBLIC_KEY`, optional `ADDRESS`, and optional `HISTORY`.
2. `rr-neg-quickstart-diagnostic-flag` now cites `start#L42-L75` and `start#L189-L193`. L42–L75 holds the local-mode default. L189–L193 holds `--enable-soroban-diagnostic-events` and `--disable-soroban-diagnostic-events`.

## 20-row review

| Case ID | Fact result | Source result | Authority or coverage result | Defect |
|---|---|---|---|---|
| rr-pos-go-sdk-trade-resolutions | CONFIRMED. Minute/5/15/60/1440/10080 minute durations at pin L99–L115. | PASS (B+A) | Empty in SDK/CLI Docs is plausible. | none |
| rr-pos-go-sdk-query-enums | CONFIRMED. `asc`, `desc`, `credit_alphanum4`, `credit_alphanum12`, `native`. | PASS (B+A) | Empty in SDK/CLI Docs is plausible. | none |
| rr-pos-js-rpc-sleep-strategies | CONFIRMED. Runtime `@stellar/stellar-sdk@17.0.1`: Basic(7)=1000, Linear(7)=7000. | PASS (B+F) | Empty in SDK/CLI Docs is plausible. | none |
| rr-pos-go-sdk-default-horizon-clients | CONFIRMED. Trailing-slash Horizon URLs and `HorizonTimeout`. | PASS (B+A) | Adjacent is plausible. | none |
| rr-pos-env-host-depth-limit | CONFIRMED. `pub const DEFAULT_HOST_DEPTH_LIMIT: u32 = 100`. docs.rs latest 28.0.2 agrees. | PASS (B+A) | Adjacent is plausible. | none |
| rr-pos-js-rpc-durability-values | CONFIRMED. Runtime enum is `temporary` / `persistent`. | PASS (B+F) | Adjacent is plausible. | none |
| rr-pos-cli-config-home-env | CONFIRMED. `STELLAR_CONFIG_HOME` wins over `XDG_CONFIG_HOME`. Local lookup walks ancestors. Fallback is `<cwd>/.stellar`. Local stellar 27.1.0 wrote keys under `STELLAR_CONFIG_HOME`. | PASS (B+F) | Adjacent is plausible. CLI manual names `XDG_CONFIG_HOME` only. | none |
| rr-pos-cli-stellar-soroban-dir-precedence | CONFIRMED in `utils.rs` `find_config_dir`. Warning text at L136 says it uses `.stellar`. Local stellar 27.1.0 emitted that warning. | PASS (B+F) | Empty in CLI Docs is plausible. | none |
| rr-pos-js-rpc-insecure-http-guard | CONFIRMED. Runtime throws `Cannot connect to insecure Soroban RPC server if \`allowHttp\` isn't set`. | PASS (B+F) | Empty in SDK/CLI Docs is plausible. | none |
| rr-pos-go-sdk-timebound-factories | CONFIRMED. `TimeoutInfinite = int64(0)`. `NewInfiniteTimeout` sets MinTime 0 and MaxTime `TimeoutInfinite`. | PASS (B+A) | Adjacent is plausible. | none |
| rr-pos-horizon-max-supported-protocol | CONFIRMED as of 2026-08-30. Constant is 28. Live Horizon `core_supported_protocol_version` is 28. Live current protocol is 27. | PASS (B+C) | Empty for the source constant. | none |
| rr-pos-go-sdk-horizon-timeout | CONFIRMED. `HorizonTimeout = 60 * time.Second`. `SetHorizonTimeout` exists on `Client`. | PASS (B+A) | Empty in developer Docs. | none |
| rr-neg-release-profile | CONFIRMED. Hello World lists `opt-level = "z"`, overflow checks, strip, abort, one codegen unit, LTO. Local `stellar contract init` generated the same profile. | PASS (A+F) | Sufficient. Named op covers `/docs/build/smart-contracts`. | none |
| rr-neg-quickstart-diagnostic-flag | CONFIRMED on the official page. Flag is `--enable-soroban-diagnostic-events`. Local mode enables diagnostics by default. | PASS (A+B) | Sufficient. Named op covers `/docs/tools`. | none |
| rr-neg-testnet-endpoints | CONFIRMED. Networks page and skill Network Configuration list the three URLs. SDK `Networks.TESTNET` is the passphrase constant. | PASS (A+B) | Sufficient without repository code. Skill section is exposed and contains the values. | none |
| rr-neg-core-validators-fields | CONFIRMED on the validators page. Six fields. ADDRESS and HISTORY are optional. Cited example.cfg L875–L905 lists the same fields. | PASS (A+B) | Sufficient. Named op is `stellarDocs.search_docs`, which covers `/docs/validators`. | none |
| rr-neg-rpc-history-retention-window | CONFIRMED. Docs default 120960 ledgers, about seven days. Source default is `SevenDayOfLedgers` (17280 * 7 = 120960). Sibling `q-ti-self-host-retention-backfill` agrees. | PASS (A+B) | Sufficient. Named op covers `/docs/data` admin-guide pages, not a per-method RPC page. | none |
| rr-neg-sdp-max-base-fee | CONFIRMED. Docs default is 10000 stroops. Source is `100 * txnbuild.MinBaseFee` with `MinBaseFee = 100`. | PASS (A+B) | Sufficient. Named op covers `/docs/platforms`. | none |
| rr-neg-rpc-max-events-limit | CONFIRMED. Docs and source set max 10000 and default 100. Queue limit 1000 is a separate key. Sibling `q-ti-rpc-gettransactions-pagination-xdr` agrees 100/10000. | PASS (A+B) | Sufficient. Named op covers the admin-guide page. | none |
| rr-neg-contract-optimize-deprecated | CONFIRMED. CLI manual deprecates `stellar contract optimize`. Local `stellar 27.1.0` help says `Deprecated, use build --optimize`. Build `--optimize` defaults true. Sibling `q-soroban-wasm-size-limit` agrees. | PASS (A+F) | Sufficient. Named op covers `/docs/tools`. | none |

## Complete source-defect list

none

## Catalog, sibling, and contract notes

`stellarDocs.search_docs` description includes `/docs/validators`.
`scout.explainRepo` remains an exposed operation.
`skills.stellar-dev.data#network-configuration` is an exposed skill section and contains the testnet RPC, Horizon, and Friendbot URLs plus `StellarSdk.Networks.TESTNET`.
Every positive starts with a Stellar Docs op and records `empty` or `adjacent`.
Every negative names a Docs or skill op that can retrieve the cited authority without `scout.explainRepo`.
No sibling QA gospel contradiction was found for overlapping facts.

Contract lint and digest identity pass.
The two repaired class B fragments now match the claimed evidence.

## Final computed digests

sha256(JSON.stringify(cases))=5dee41663f80bde85328e624a02f6fd8f21f2d39a93bac04ef028c1265195534
sha256(ids.join("\n"))=1883592ca7b52ac06cc40881efa49e4b84b2054875aee459be2245f71372115f

PASS
