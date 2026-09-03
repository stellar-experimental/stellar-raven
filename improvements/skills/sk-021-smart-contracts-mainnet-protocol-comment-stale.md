---
id: sk-021
service: skills
status: proposed
discovered: 2026-09-03
upstreamTitle: The Smart Contracts skill example says Mainnet runs Protocol 26
evidence:
  - 2026-09-03 source read of https://github.com/stellar/stellar-dev-skill/blob/main/skills/smart-contracts/SKILL.md shows a Protocol 27 dependency example followed by a comment that says Mainnet is on Protocol 26
  - 2026-09-03 read-only Horizon root response at https://horizon.stellar.org/ returned current_protocol_version 27 and core_supported_protocol_version 28
  - .agents/rounds/2026-09-03-truth-maintenance/golden-sol.md records the stale-comment review and the Mainnet protocol observation
---

## Finding

The Smart Contracts skill example uses a Protocol 27 release candidate.
Its next comment says Mainnet runs Protocol 26.
Mainnet reports protocol version 27.

The stale comment can cause an agent to select an obsolete protocol version.

## Evidence

The current upstream `skills/smart-contracts/SKILL.md` contains the conflicting example and comment.
The live Horizon root response independently reports Mainnet protocol 27.

This check only read public source and a public network-status response.

## Recommendation

Change the Mainnet comment from Protocol 26 to Protocol 27.
Keep the instruction to check current releases and network status before a deployment.
