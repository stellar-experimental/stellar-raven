# Connectors Directory item 8 paid evidence

This directory preserves the paid first-pair evidence from the 2026-08-26 item 8 round.

- Baseline revision: `e488c4fc6a4a44b01ee58f4276baf7cd4dde2f47`.
- Rejected treatment revision: `1f961ab1116bb23f97c32b14502401ccb2441be7`.
- Answer model: `claude-sonnet-5`.
- Judge calls: `0`.
- Total answering cost: `$3.6545430`.
- Decision: reject the treatment after the fixed first-pair stop.

## Preserved files

| File | SHA-256 |
| --- | --- |
| `2026-08-26T17-39-11-variantA.json` | `02ac68ae8607f9bdbecc0a558b902d16eb9b1710449a13abf94cef7240606de9` |
| `2026-08-26T17-39-11-variantA.plan.json` | `4d7bbc8f110e10f98958a1c43115dd4ddfe7baf5dd1d163ef6e2c219ff90f14f` |
| `2026-08-26T17-39-11-variantA.composition.json` | `0688a31759317a8678b583fe2d52e672a071193dc0b5f682d3deee5a8c0f91eb` |
| `2026-08-26T17-44-25-variantA.redacted.json` | `5a2431ec9d8139cb746a0e6acd1d962e3326c7ba5bee5646254b60f49959bc98` |
| `2026-08-26T17-44-25-variantA.plan.json` | `e37bb2dcdc8f313a682d51a39240e4915d50db1915bcfd79a9958931e2e6454d` |
| `2026-08-26T17-44-25-variantA.composition.json` | `ca8a596521fae3ab31a699a9e32191cf3a5a7b15d9da8fd2f3b8b09475903f0f` |
| `claude-wrapper.sh` | `6ff1e1663ba1f672723d75385be9d1f375d2d15757957f23847529e0c50b4ce5` |

The two result files contain the answer rows. The companion files preserve plan and composition analysis.

The plan sidecars contain historical absolute paths from the original machines and worktrees. They
are evidence, not portable replay inputs. Generate new plan sidecars from the current checkout for
any replay.

The original B1-1 file has SHA-256 `3d40f8768a019175d6c0eabf20dba10f4e5e46250c46785adf7b2f59b42a1c9e`.
The reviewed copy replaces one Stellar secret seed with `[REDACTED_STELLAR_SECRET_SEED]`.
It also changes one answer label from `Key sources` to `Primary sources` to avoid a scanner false positive.
The local ignored archive retains the original file. The repository must not contain that secret seed.

The wrapper is the exact source used for both paid calls. Its historical absolute binary path remains evidence.

See [the round ledger](../../../../.agents/rounds/2026-08-26-connectors-item8-efficacy.md) for the preregistration and verdict.
