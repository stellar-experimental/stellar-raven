# Upstream Docs Findings Verification

Date: 2026-09-04
Lane: Stellar Docs findings
Worktree: `/private/tmp/stellar-raven-tm-docs-findings`
Branch: `codex/tm-docs-findings`

## Scope

I read the post-candidate measurement report.
I read the candidate artifact at `/private/tmp/stellar-raven-tm-runner/eval/qa/results/2026-09-04T05-40-51-variantA.json`.
I reviewed rows `q-tool-js-sdk-package`, `q-hist-soroban-launch-protocol20`, `q-soroban-cli-bindings`, `q-soroban-wasm-size-limit`, `q-soroban-oz-upgradeable-macro`, and `q-defi-sdex-offer-lifecycle`.

I searched active findings and `improvements/resolved.json` before authoring.
I found no duplicate active finding for the four reproduced defects.
I found resolved `sd-011` for Horizon offer effects.
I found resolved `sd-026` for standalone optimization guidance.
I found a resolved, unrelated `sk-020` identifier.
I used `sk-022` for the OpenZeppelin upgrade-skill record.

## Commands

I used these read-only commands:

- `rg -n -i "stellar-sdk|@stellar/stellar-sdk|protocol 20|contract bindings|contract optimize|Upgradeable|offer effects" improvements improvements/resolved.json .agents/rounds`
- `jq -r '.rows[] | select(...)' /private/tmp/stellar-raven-tm-runner/eval/qa/results/2026-09-04T05-40-51-variantA.json`
- `stellar --version`
- `stellar contract bindings python`
- `stellar contract bindings java`
- `stellar contract bindings flutter`
- `stellar contract bindings swift`
- `stellar contract bindings php`
- `stellar contract bindings rust`
- `stellar contract bindings typescript`

The installed binary reported `stellar 27.1.0`.
The five placeholder-language commands returned a not-implemented error.
The Rust and TypeScript commands requested their documented required inputs.

I used current primary pages:

- https://developers.stellar.org/docs/tools/sdks/client-sdks
- https://github.com/stellar/js-stellar-sdk
- https://developers.stellar.org/docs/networks/software-versions
- https://stellar.org/blog/developers/protocol-20-upgrade-guide
- https://developers.stellar.org/docs/tools/cli/stellar-cli
- https://developers.stellar.org/docs/build/smart-contracts/getting-started/hello-world
- https://developers.stellar.org/docs/data/apis/horizon/api-reference/resources/effects/types
- https://github.com/OpenZeppelin/openzeppelin-skills/blob/main/skills/upgrade-stellar-contracts/SKILL.md
- https://docs.openzeppelin.com/stellar-contracts/utils/upgradeable

## Reproduced Defects

### `sd-050` JavaScript SDK package prose

The SDK page says `stellar-sdk` is the JavaScript library.
The official SDK repository installs `@stellar/stellar-sdk`.
The candidate copied the unscoped name in `q-tool-js-sdk-package`.

This is a current docs-content defect.
The record is `improvements/stellar-docs/sd-050-js-sdk-package-prose-unscoped.md`.

### `sd-051` Protocol 20 date heading

The history page heading says `Protocol 20: Soroban Phase 1 (Mainnet Edition) (February 5, 2024)`.
The Protocol 20 upgrade guide says Mainnet upgraded on February 20 at 1700 UTC.
The heading does not identify February 5 as a software-release date.

The candidate used February 5 as the Mainnet activation date in `q-hist-soroban-launch-protocol20`.
This is a current docs-content ambiguity.
The record is `improvements/stellar-docs/sd-051-protocol-20-mainnet-heading-date.md`.

### `sd-052` CLI placeholder bindings

The CLI manual lists Python, Java, Flutter, Swift, and PHP as binding generators.
Each current `stellar 27.1.0` command returned an error that it is not implemented.
Each error directed users to `https://github.com/lightsail-network/stellar-contract-bindings`.

The manual output comes from Stellar CLI.
The `stellar/stellar-cli` intake override identifies the source owner.
The record is `improvements/stellar-docs/sd-052-cli-bindings-placeholder-languages.md`.

### `sk-022` OpenZeppelin upgrade skill

The current OpenZeppelin skill recommends `#[derive(Upgradeable)]` and `UpgradeableMigratable`.
The current OpenZeppelin documentation requires direct `Upgradeable` trait implementation.
It also says there is no Migratable Trait.

The indexed skill led `q-soroban-oz-upgradeable-macro` to use retired APIs.
This belongs to the skills collection, not Stellar Docs.
The record is `improvements/skills/sk-022-oz-upgrade-skill-retired-derive-api.md`.

## Rejected Candidates

### Standalone `stellar contract optimize`

I rejected a new finding.
Resolved `sd-026` already covers this defect.
The current Hello World page says builds optimize Wasm by default.
It says the standalone command is deprecated.
The current CLI manual also labels the command deprecated.

### Horizon offer effects

I rejected a new finding.
Resolved `sd-011` already covers this defect.
The current Effect Types page says Offer Created, Offer Removed, and Offer Updated are unused and not emitted.
The same page directs readers to `result_xdr`, current offers, and offer trades.

## Result

I created four verified records.
I created three Stellar Docs records and one skills record.
I added two intake mappings for the source owners.
I did not file an external issue.

## Checks

`npm run improvements:index` generated an index with 68 findings.
`npm run improvements:lint` passed with 68 findings.
`npm run improvements:lint -- --live` passed with read-only GitHub access.

`npm run improvements:probes` returned four recurring findings and two credential-inconclusive Lumenloop findings.
It returned zero probe errors.
The findings in this lane do not define probes.

`npm test` passed 103 files and 1771 tests.
`git diff --check` passed.
`npm run secrets:scan -- --tree` passed with no leaks.

`npm ci` installed the locked dependencies.
Its optional Git hooks setup could not write the shared worktree Git config.
The install completed successfully.
