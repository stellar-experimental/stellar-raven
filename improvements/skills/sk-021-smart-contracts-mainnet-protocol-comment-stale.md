---
id: sk-021
service: skills
status: reported-upstream
discovered: 2026-09-03
upstreamTitle: The Smart Contracts skill example says Mainnet runs Protocol 26
evidence:
  - 2026-09-09 canonical correction deployed in https://github.com/stellar/stellar-dev-skill/pull/127 at 711d6e293b0ba6ae110db0ae307a4d7805a00b8a; live skills.stellar.org bytes match SHA-256 205faa248dd6c828da4679cee9bfdbf0d71d99269a9a469bafd526756b2a273e. Accepted Raven pin 03b2f8e8 still reproduces the original trigger; retain pending source acceptance.
  - .agents/rounds/2026-09-09-sk021-handoff-review-grok.md independently verifies the deployed correction, accepted-pin residual, and retirement boundary.
  - Raven handoff acknowledged with verified partial result: https://github.com/stellar-experimental/stellar-raven/issues/136#issuecomment-5595645949
  - 2026-09-08 fresh source read at stellar/stellar-dev-skill main 03b2f8e8 reproduced the Protocol 26 comment; SHA-256 2561ecf136096d2418ff17f6eee896aaa1323d4e07fd8ea21e7352dc822835eb. The Horizon root returned current_protocol_version 27 and core_supported_protocol_version 28; response SHA-256 6f86a0916b12fd50eb26b370d47a1da5a8a9afbc740928be6a2ecf5a61c0d3c0.
  - 2026-09-03 source read of https://github.com/stellar/stellar-dev-skill/blob/main/skills/smart-contracts/SKILL.md shows a Protocol 27 dependency example followed by a comment that says Mainnet is on Protocol 26
  - 2026-09-03 read-only Horizon root response at https://horizon.stellar.org/ returned current_protocol_version 27 and core_supported_protocol_version 28
  - .agents/rounds/2026-09-03-truth-maintenance/golden-sol.md records the stale-comment review and the Mainnet protocol observation
  - .agents/rounds/2026-09-03-truth-maintenance/golden-final-review-sol.md independently re-derived the live trigger
  - upstream issue filed 2026-09-09: https://github.com/stellar/stellar-dev-skill/issues/124
---

## Finding

The accepted Raven Smart Contracts skill example uses a Protocol 27 release candidate.
Its next comment says Mainnet runs Protocol 26.
Mainnet reports protocol version 27.

The stale comment can cause an agent to select an obsolete protocol version.

## Evidence

The accepted Raven pin `03b2f8e8` contains the conflicting example and comment.
The deployed upstream skill now uses stable `27` and correctly identifies Mainnet protocol 27.
The live bytes match upstream merge `711d6e29`. Raven source acceptance remains incomplete.
The live Horizon root response independently reports Mainnet protocol 27.

This check only read public source and a public network-status response.

## Recommendation

The upstream correction is complete. No further upstream edit is requested.
Review and accept the corrected source separately, then verify the accepted-pin trigger before retirement.
