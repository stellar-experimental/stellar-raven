# Filing preparation — Sol medium — 2026-09-08

## Contract

Route: Codex `gpt-5.6-sol`, medium reasoning.

Scope: exactly 13 `verified` findings.
The coordinator owns every external write and `improvements/INDEX.md` regeneration.
This lane made no GitHub write, deployment, paid call, commit, or push.
This lane changed only the 13 finding files and this report.

The lane read `AGENTS.md`, `.agents/skills/improvements-pipeline/SKILL.md`,
`improvements/README.md`, and `references/upstream-writing-style.md`.
The filing authority appears in `.agents/rounds/2026-09-08-maintenance-execution.md`.

## Method

Each live result below comes from a fresh 2026-09-08 read or execution.
The prior finding text only supplied the original trigger.
All hashes use SHA-256 over the exact received bytes.

The duplicate search used each finding ID and defect-specific terms.
It searched issues and pull requests in the resolved owner repository.
The owner check read current GitHub repository metadata.
Every owner is active, not archived, and has issues enabled.

Each dry-run used this command shape:

```sh
npm run improvements:file -- --file improvements/<collection>/<finding>.md --dry-run
```

All 13 commands exited `0`.
Each rendered body contains `generated-by-stellar-raven` and all five required sections.

## Deterministic finding report

| Finding | Current state | Fresh source or probe | Duplicate or fix references | Resolved owner | Dry-run | Recommendation |
| --- | --- | --- | --- | --- | --- | --- |
| `sls-082` | `verified`; still reproduces on API 1.9.48 | OpenAPI `2f042393eec673f80b661b65c5e6e11c4af10b7f2496b6d530e3bb7aa70f9639`; valid response `17d68f1b6638ced73e48674595b61511b6c383831b9f797b21a3ec21dfd556e6`; invalid response `7c328a1c93872800fc93b2f2a71e278c9a54a8db72614a8f35e576d7e1e1789b`. The valid filter returned 34 assets. Both enums still omit the value. | No matching issue or pull request. A maintainer comment on `Stellar-Light/stellarlight#494` names the handler value but not the enum mismatch. | `Stellar-Light/stellarlight` | `0`; complete body | File. Add `issued-single-holder` to both enums. Add one shared-value contract test. |
| `sls-084` | `verified`; still reproduces on API 1.9.48 | OpenAPI `2f042393eec673f80b661b65c5e6e11c4af10b7f2496b6d530e3bb7aa70f9639` contains zero `package-release` strings. ACTA response `aaa020196f71250c4034572c30427915c0506dd3bbeb9bf75453b296dfac4f34` returns `statusBasis: package-release`. The nine-row and 981-row counts come from the original 2026-09-08 population scan. The fresh check covered ACTA only. | No matching issue or pull request. | `Stellar-Light/stellarlight` | `0`; complete body | File. Add `package-release` to the enum and description. Add a served-value contract test. |
| `sk-022` | `verified`; still reproduces on current `main` and crate 0.7.2 | Skill `80f565dbf623c2c0ca400c0591023f91ede9f314d487dabd255a449a83579b71`; page `3e127e2a4f358c9b06b0ee3a4a45959a67cb65f1c1c628c36df2dea9f38d3129`. A minimal `cargo check` failed with unresolved `UpgradeableMigratable` and no `Upgradeable` derive macro. | `OpenZeppelin/openzeppelin-skills#14` concerns generic triggers. `OpenZeppelin/stellar-contracts#585` removed the obsolete APIs and supports this finding. | `OpenZeppelin/openzeppelin-skills` | `0`; complete body | File. Replace all derive and internal-trait guidance with the direct `Upgradeable` trait flow. Link related issue https://github.com/OpenZeppelin/openzeppelin-skills/issues/14 in the recommendation. |
| `sd-052` | `verified`; still reproduces in current CLI v28.0.0 | Release binary `10c5abc3796505626c098583b4bdc6d4bf52dd50157aa710c62e3d9cb348326b`; rendered manual `96d0a29ea5598340d1289165354f48ce94be8c063a054b9ff022429f73ca1170`. All five placeholder commands exited `1`. Rust and TypeScript controls were last checked on 2026-09-04 with v27.1.0. | `stellar/stellar-cli#1633` and `stellar/stellar-cli#1897` introduced redirect commands. Neither tracks the misleading descriptions. | `stellar/stellar-cli` | `0`; complete body | File. Mark the five commands as external redirects or remove them until implementation exists. |
| `ll-030` | `verified`; still reproduces | Project `e2e0f203d8cfbcb4dd27827561c063d7cee62fcba59b9e066a8d40c6324fbe61`; directory `7e0e151b23a8f790477ea5a0767db34242e01f7f87688319fdf18f727d3e594e`; semantic `a4220bac8134d21614d1b7af12994f3e1948ff32245eddde43ac5200f1963ac8`. None of these returned payloads names CRDT or CRDYX. | No match in `lumenloop/lumenloop-backend` or `lumenloop/stellar-ecosystem-db`. | `lumenloop/lumenloop-backend` | `0`; complete body | File. Add named `products[]` or `assets[]`, or index one row for each named fund. |
| `sd-046` | `verified`; still reproduces at Docs `db501fe9` | Lumens `8f0ce1c60c7bf7d141cdc5807ca9f17ee5666583fb1c9bc87859857edc6df96f`; Accounts `1ed570951cf7d097ca523eda5483fef95daf53ef17d4d4286f0d867a39b8378a`; Liquidity Pools `26b3d29c162fed0fb9f8c39790bda767554e03b568cf6f6201218b4014517c03`; CAP-0038 `febebc612e1dd14006ea677161c626a27575be32b7c937d8aacb30677789c1aa`. | No matching issue or pull request. | `stellar/stellar-docs` | `0`; complete body | File. Add the pool-share exception beside both general trustline lists. |
| `sd-049` | File remains `verified`; the claimed defect does not reproduce | Writer `54fcb79cbc08f21c00b4c78f32caeade587b6f7d203096cac92b10c54cde55a0`; cipher `5a3aab65e39f891706be2adfa55b1f052f044c064d5bd868f01aedd622b0ff99`; Docs `68e3cb0c994df62414a530b2195f3ccf471e2f2019cccc38a003ac00a157880b`. Current source and Docs agree. | Exact duplicate of resolved `sd-030`, `stellar/stellar-docs#2605`, and PR `stellar/stellar-docs#2620`. The old finding read obsolete `master`. | `stellar/stellar-docs` | `0`; complete body | Do not file. Send this file for independent retirement review. Keep its status unchanged until that review finishes. |
| `sd-050` | `verified`; still reproduces at Docs `db501fe9` | Docs `fd57c064ac74c436e30ad1e5f4eb92941a0cfffda1f3a785d153f27bbe562fa2`; unscoped npm metadata `155b0eac26b840ce952f7045de875e0b6319b9e7e541570f2a0d22ec131590df`; scoped metadata `63d5addf201cfc919e2d788df1f2ca7f71211b888dc1466f52fa356deef9513b`. | No matching issue or pull request. | `stellar/stellar-docs` | `0`; complete body | File. Use `@stellar/stellar-sdk` for the package name. Define `stellar-sdk` only as a display name. |
| `sd-051` | `verified`; still reproduces at Docs `db501fe9` | Software versions `012391ecd96a48be6a9b43fac27b60020a4625344d33e435cdaf2ed902e49a84`; upgrade guide `9d7e329a1fafd371f262ce3052fae5553e3d8490e0312fdf7e3b856eacbd47c5`. | No matching issue or pull request. | `stellar/stellar-docs` | `0`; complete body | File. Separate the software-release date from the Mainnet activation date. Correct the Phase 1 heading. |
| `sk-021` | `verified`; still reproduces at skill `03b2f8e8` | Skill `2561ecf136096d2418ff17f6eee896aaa1323d4e07fd8ea21e7352dc822835eb`; Horizon `6f86a0916b12fd50eb26b370d47a1da5a8a9afbc740928be6a2ecf5a61c0d3c0`. The values are protocol 27 and supported protocol 28. | No matching issue. PR `stellar/stellar-dev-skill#47` introduced Protocol 27 guidance but left the stale comment. | `stellar/stellar-dev-skill` | `0`; complete body | File. Change the comment to Protocol 27 and retain the live-version check. |
| `sk-023` | `verified`; still reproduces at skill `03b2f8e8` | Skill `1ce5499a55d5144b0a58399afc3a790b7c7adca7030ad234b39fb8ed9d334b60`; protocol `a2abfffc6ed63c99c29a9dfc1797a284c954b2f975e0fe2171f513b07435575d`. | Issues `#57`, `#60`, and `#107` cover names, APIs, and discovery. None covers protocol identity. | `stellar/stellar-dev-skill` | `0`; complete body | File. Add one payment-method-agnostic scope sentence. Distinguish `mppx` from `@stellar/mpp`. |
| `sk-024` | `verified`; still reproduces at skill `03b2f8e8` | Router `2af48a37773b2d1eaa42270b13dae6c49ebbf49050c58457e47fe2e2372af570`; guide `c3c92eaa7b4266ee08c74f92ff7447e135a25c34200dcde6bc6085e0ba2bd5bc`; Stellar Docs `3631a62eeedb6bc92b2f3519847c336a9c6237f1aa03b579a39d71b41b6d17f7`. Stellar Docs lists the Coinbase and Built on Stellar hosted options. The x402 facilitator docs separately document self-facilitation. | PR `stellar/stellar-dev-skill#97` added `FACILITATOR_URL` handling but kept OZ-only authorization. No issue tracks this scope. | `stellar/stellar-dev-skill` | `0`; complete body | File. Scope the key requirement to OZ Channels. Name both hosted options and the separate self-facilitation path. |
| `sls-083` | `verified`; still reproduces | Scout RWA `3fb7e278ad5c7452ec15e061c2983e0384e3492fcf945874b70243acdf519def`; project search `0c41ff0039823cf56f214fb657520fd848fa037935a3d6fcdc3a3ba51ed1c031`; TOML `f9b923ae30b0abf176c6abb9acf8787c6251221e6dfb480263a8501b44b85afe`; Horizon `0b7fabe1bcfb10fc5b33a9154ecaa5639b39955ee85dd99901e9d7c0f409ca1a`. | `Stellar-Light/stellarlight#494` is the resolved `sls-023` predecessor. A Raven comment names this residual. No maintainer issue tracks it. | `Stellar-Light/stellarlight` | `0`; complete body | File. Add the four verified assets and expose explicit product-coverage metadata. |

## Filing order

Use this order after coordinator review:

1. `sls-082`
2. `sls-084`
3. `sk-022`
4. `sd-052`
5. `ll-030`
6. `sd-046`
7. `sd-050`
8. `sd-051`
9. `sk-021`
10. `sk-023`
11. `sk-024`
12. `sls-083`

Do not file `sd-049`.
Its next action is an independent retirement review.

## Local verification

`git diff --check` passed for the 13 finding files and this report.
The five corrected finding dry-runs passed after the final prose changes.
After those changes, `npm run improvements:lint` reported only a stale `improvements/INDEX.md`.
The coordinator owns that regeneration, so this lane left the index unchanged.
`npm run secrets:scan -- --tree` passed with no leaks.
This lane did not modify or regenerate `improvements/INDEX.md`.
