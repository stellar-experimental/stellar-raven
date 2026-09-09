# Independent pre-filing review — Grok 4.6 high — 2026-09-08

Reviewer: Grok 4.6, high effort.
This reviewer is not the Sol author and is not the Astra orchestrator.
No subagent ran.
This file is the only write.

Base: `b2dbde53e9c9910b6d49a87ccea829555eeb4ef1`.
Checks: `2026-09-09T03:19:18Z` through `2026-09-09T03:32Z`.
Scope: `sls-082`, `sls-084`, `sk-022`, `sd-052`, `ll-030`, `sd-046`, `sd-050`, `sd-051`, `sk-021`, `sk-023`, `sk-024`, `sls-083`.

The evidence commit and public snapshots will exist before filing.
Their current absence in dry runs is expected.

## Verdict

**CHANGES-REQUIRED** for three candidates.
Do not file `sd-050`, `sk-023`, or `sk-024` until the actions below land.
The other nine candidates may be filed after the evidence commit.

| ID | Verdict | Owner | Action |
| --- | --- | --- | --- |
| sls-082 | PASS | `Stellar-Light/stellarlight` | File |
| sls-084 | PASS | `Stellar-Light/stellarlight` | File |
| sk-022 | PASS | `OpenZeppelin/openzeppelin-skills` | File |
| sd-052 | PASS | `stellar/stellar-cli` | File |
| ll-030 | PASS | `lumenloop/lumenloop-backend` | File |
| sd-046 | PASS | `stellar/stellar-docs` | File |
| sd-050 | CHANGES-REQUIRED | `stellar/stellar-docs` | Do not file. Record `#2561`. |
| sd-051 | PASS | `stellar/stellar-docs` | File |
| sk-021 | PASS | `stellar/stellar-dev-skill` | File |
| sk-023 | CHANGES-REQUIRED | `stellar/stellar-dev-skill` | Remove the false identical-bytes claim. |
| sk-024 | CHANGES-REQUIRED | `stellar/stellar-dev-skill` | Remove the false identical-bytes claim. |
| sls-083 | PASS | `Stellar-Light/stellarlight` | File |

## Actionable findings

### sd-050 — CHANGES-REQUIRED

Do not file a new issue.

Open issue https://github.com/stellar/stellar-docs/issues/2561 already asks for the same fix.
It names `docs/tools/sdks/client-sdks.mdx` line 28.
It says the prose uses bare `stellar-sdk`.
It requires `@stellar/stellar-sdk` throughout the section.

Independent source at `stellar/stellar-docs` `db501fe9` still has that prose.
SHA-256 `fd57c064ac74c436e30ad1e5f4eb92941a0cfffda1f3a785d153f27bbe562fa2`.
npm still serves deprecated `stellar-sdk` 13.3.0 and scoped `@stellar/stellar-sdk` 17.0.1.

The defect still reproduces. The owner already has the ask.
Required change: store issue 2561 in evidence. Do not open a second issue.

### sk-023 — CHANGES-REQUIRED

Do not file until the identical-bytes bullet is corrected.

Generated evidence still says the served pin, commit `790f607`, and current `main` carry identical bytes.
Independent hashes:

| Ref | `mpp.md` SHA-256 |
| --- | --- |
| `03b2f8e8` / `main` | `1ce5499a55d5144b0a58399afc3a790b7c7adca7030ad234b39fb8ed9d334b60` |
| `790f607` | `14214c9ae7e1e61a3f00c0df50a7d40fcd323997aa06399bf36613c2e39d279d` |

Current `stellar/stellar-dev-skill` `main` is `03b2f8e8c88a42b16551926a938ec8173763b45a`.
The live defect still reproduces.
Required change: remove or date the present-tense identical-bytes claim.

### sk-024 — CHANGES-REQUIRED

Do not file until the identical-bytes bullet is corrected.

Generated evidence still says pin `b78983c`, commit `790f607`, and current `main` carry identical bytes for both files.
Independent hashes:

| File | Ref | SHA-256 |
| --- | --- | --- |
| `SKILL.md` | `03b2f8e8` / `main` | `2af48a37773b2d1eaa42270b13dae6c49ebbf49050c58457e47fe2e2372af570` |
| `x402.md` | `03b2f8e8` / `main` | `c3c92eaa7b4266ee08c74f92ff7447e135a25c34200dcde6bc6085e0ba2bd5bc` |
| `x402.md` | `790f607` | `5b07269ec626abede4020525e744a1285e3aad23bf3aa3de8ca0b10523eff950` |

Current MANIFEST pin is `03b2f8e8`, not `b78983c`.
`x402.md` bytes are not identical.
The live defect still reproduces.
The hosted versus self-facilitation split is correct.
Required change: remove or date the present-tense identical-bytes claim.

## PASS evidence

All twelve dry-runs exited 0.
Each body has `generated-by-stellar-raven` and all five required sections.
No dry-run includes an immutable snapshot. That is expected until the evidence commit is public.

- **sls-082.** OpenAPI 1.9.48 SHA-256 `2f042393eec673f80b661b65c5e6e11c4af10b7f2496b6d530e3bb7aa70f9639`. Both state enums omit `issued-single-holder`. Live filter returned 34 rows. Invalid-state body SHA-256 `7c328a1c93872800fc93b2f2a71e278c9a54a8db72614a8f35e576d7e1e1789b` lists the value as valid.
- **sls-084.** Same OpenAPI hash contains zero `package-release` strings. ACTA and AXIS still return `statusBasis: package-release`. The 981-row count stays dated 2026-09-08 evidence.
- **sk-022.** Skill SHA-256 `80f565dbf623c2c0ca400c0591023f91ede9f314d487dabd255a449a83579b71`. `cargo check` against crate 0.7.2 failed on unresolved `Upgradeable` and `UpgradeableMigratable`. Issue `#14` is linked.
- **sd-052.** Published v28.0.0 binary SHA-256 `10c5abc3796505626c098583b4bdc6d4bf52dd50157aa710c62e3d9cb348326b`. `python`, `java`, `flutter`, `swift`, and `php` each exited 1. Rust and TypeScript controls stay dated 2026-09-04 on v27.1.0.
- **ll-030.** `get_project` SHA-256 `e2e0f203d8cfbcb4dd27827561c063d7cee62fcba59b9e066a8d40c6324fbe61`. `search_directory` SHA-256 `7e0e151b23a8f790477ea5a0767db34242e01f7f87688319fdf18f727d3e594e`. Returned matches do not name `CRDT` or `CRDYX`.
- **sd-046.** Lumens and Accounts hashes match the finding and still omit the two-reserve exception. The Liquidity Pools page and CAP-0038 still state it.
- **sd-051.** Software-versions source SHA-256 `012391ecd96a48be6a9b43fac27b60020a4625344d33e435cdaf2ed902e49a84`. The February 5 heading still says Mainnet Edition and lists Phase 0 limits. The upgrade guide still dates Mainnet activation to February 20.
- **sk-021.** Skill SHA-256 `2561ecf136096d2418ff17f6eee896aaa1323d4e07fd8ea21e7352dc822835eb`. The comment still says protocol 26. Horizon still reports protocol 27.
- **sls-083.** Scout still returns five Etherfuse assets. The issuer TOML SHA-256 `f9b923ae30b0abf176c6abb9acf8787c6251221e6dfb480263a8501b44b85afe` still declares nine. Horizon still shows authorized trustlines for `MEX`, `CETESZ`, `GILTS`, and `MEXe`.

Root owns writes after this review.
This review did not file, comment, push, or deploy.
It did not inspect `sd-049`, goldens, the queue, other findings, or the search worktree.

## Reconciliation — 2026-09-09T03:32:32Z

Root updated the three blocked files. This reviewer re-read those files and reran the `sk-023` and `sk-024` dry-runs.
No paid call and no external write occurred.

Final verdict: **PASS** for all twelve candidates.
File eleven new issues after the evidence commit.
Keep `sd-050` on the existing open Docs issue. Do not post a new issue or comment.

| ID | Final | Action |
| --- | --- | --- |
| sls-082 | PASS | File |
| sls-084 | PASS | File |
| sk-022 | PASS | File |
| sd-052 | PASS | File |
| ll-030 | PASS | File |
| sd-046 | PASS | File |
| sd-050 | PASS | Do not file. Keep https://github.com/stellar/stellar-docs/issues/2561. |
| sd-051 | PASS | File |
| sk-021 | PASS | File |
| sk-023 | PASS | File |
| sk-024 | PASS | File |
| sls-083 | PASS | File |

### sd-050

Status is now `reported-upstream`.
Evidence records https://github.com/stellar/stellar-docs/issues/2561, authored by `oceans404`.
`improvements/INDEX.md` already shows `reported-upstream`.
The dry-run body includes that URL and author.
No new issue or reminder comment will post.

### sk-023

The old `b78983c` / `790f607` equality is now dated 2026-09-04.
The current accepted pin is named `03b2f8e8`.
The dry-run says current bytes differ and the framing still reproduces.
Dry-run exit 0. Marker and five sections present. No present-tense identical-bytes claim.

### sk-024

The old `b78983c` / `790f607` equality is now dated 2026-09-04.
The current accepted pin is named `03b2f8e8c88a42b16551926a938ec8173763b45a`.
The dry-run says `x402.md` bytes differ and both current files still reproduce the wording.
Dry-run exit 0. Marker and five sections present. No present-tense identical-bytes claim.

Confirmed set: eleven filings plus one existing issue link.
