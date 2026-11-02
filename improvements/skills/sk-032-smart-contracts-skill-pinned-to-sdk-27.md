---
id: sk-032
service: skills
status: verified
discovered: 2026-11-02
upstreamTitle: "Smart Contracts skill pins soroban-sdk 27 and uses the deprecated update_current_contract_wasm; Mainnet runs Protocol 29"
evidence:
  - "2026-11-02T21:23Z stellar/stellar-dev-skill main 313832e98b7606feba2cb0b03c4f9542b2d0c4c3 (skills/ unchanged since the Raven pin cac64041d0c759a3b10ce6fba4fa3e0672bcbe0f; the compare touches only site/) skills/smart-contracts/SKILL.md line 36: 'This skill was written against **protocol 27** (`soroban-sdk` v27, `rs-soroban-env` v27, `stellar-cli` v27).' Line 70: 'soroban-sdk = \"27\"  # protocol 27, which mainnet runs at the time of writing.' Line 76 pins the testutils dev-dependency to \"27\"."
  - "2026-11-02T21:24:18Z GET https://horizon.stellar.org/ returned current_protocol_version 29 and core_supported_protocol_version 30. GET https://horizon-testnet.stellar.org/ returned current_protocol_version 29."
  - "2026-11-02 GitHub releases of stellar/rs-soroban-sdk: v28.0.0 (2026-09-18), v29.0.0 (2026-10-07), v29.0.1 (2026-10-12), v30.0.0-rc.1 (2026-10-21)."
  - "skills/smart-contracts/development.md lines 334-338, Upgradeability example: 'env.deployer().update_current_contract_wasm(new_wasm_hash);'"
  - "rs-soroban-sdk v29.0.1 soroban-sdk/src/deploy.rs line 287: '#[deprecated(note = \"use update_current_contract\")]' above 'pub fn update_current_contract_wasm'. The attribute is absent at v27.0.0 and present at v28.0.0 and v29.0.0 (raw-file grep of each tag). The replacement 'pub fn update_current_contract(&self, executable: ContractExecutable)' is at line 313."
  - "Predecessor: resolved sk-021 (receipt in improvements/resolved.json) and closed upstream issue stellar/stellar-dev-skill#124 corrected the same Mainnet-protocol sentence from 26 to 27 (PR #127). The sentence went stale again after the Protocol 29 upgrade."
  - "Dedupe 2026-11-02: gh issue list and gh pr list on stellar/stellar-dev-skill (all states) show no open report of Protocol 29, SDK 28/29, or update_current_contract_wasm. No active Raven finding names update_current_contract_wasm."
  - ".agents/TODO.md 'File the HackMeridian upstream findings' items Q1 and R07."
---

## Finding

The Smart Contracts skill says it targets Protocol 27 and pins `soroban-sdk = "27"`.
Its comment says Mainnet runs Protocol 27.
On 2026-11-02 Mainnet and Testnet run Protocol 29.
`soroban-sdk` 28.0.0 and 29.0.x are released.

The Upgradeability example in `development.md` calls `env.deployer().update_current_contract_wasm(...)`.
Since `soroban-sdk` 28.0.0 that function carries `#[deprecated(note = "use update_current_contract")]`.
A reader who follows the skill on a current SDK gets a deprecation warning in the core upgrade pattern.

## Evidence

Horizon on 2026-11-02 reports `current_protocol_version` 29 on Mainnet and Testnet.
The `soroban-sdk` deprecation attribute is present at tags `v28.0.0` and `v29.0.0`, and absent at `v27.0.0`.
The skill text is unchanged between the Raven pin and the current `main`.

## Recommendation

Update the version sentence, the two `Cargo.toml` pins, and the Mainnet comment to the current major.
Keep the existing rule to resolve the live version from RPC `getVersionInfo`.
Change the Upgradeability example to `update_current_contract` with the matching `ContractExecutable` value.
Optionally, remove the "which mainnet runs" clause so the comment does not go stale at the next upgrade.
