---
id: sk-011
service: skills
status: fixed-upstream
discovered: 2026-07-11
evidence:
  - P4 H2 observed skills.stellar-dev.zk-proofs still label CAP-0074 BN254 and CAP-0075 Poseidon/Poseidon2 as proposed/gated and recommend waiting for BN254; solo://proj/49/scratchpad/super-corpus-rebuild--585
  - official Stellar ZK documentation, the stellar-protocol CAP index, and stellar-core v25.0.0 release notes identify the Protocol 25 primitives as shipped/final
  - exact existing upstream issue confirmed open 2026-07-13: https://github.com/stellar/stellar-dev-skill/issues/51
  - 2026-08-10 upstream re-pin live recheck: /tmp/skilldiff/stellar-dev__zk-proofs__SKILL.md.new states CAP-0074 and CAP-0075 are Available at Protocol 25+ and CAP-0080 is Available at Protocol 26+; the prior proposed/gated trigger no longer reproduces
  - 2026-08-10 resolving upstream record read back: https://github.com/stellar/stellar-dev-skill/issues/51 is closed by maintainer kaankacar's comment citing merged PR https://github.com/stellar/stellar-dev-skill/pull/72
---

## Finding

The served upstream ZK skill is stale after Protocol 25. It describes BN254 and
Poseidon/Poseidon2 changes as proposed or gated and tells Noir/RISC Zero users
to wait for BN254, contradicting the current official Protocol 25 status.

## Evidence

P4 H2 compared the served skill against official ZK docs, the CAP index, and
the v25.0.0 release notes on 2026-07-11. This overlaps sd-021's docs/source-link
problem but is a distinct upstream skill-content defect.

## Recommendation

Refresh the ZK skill's CAP/protocol status and toolchain advice, retaining only
genuine feature-gating caveats. Add a recurrence probe that checks Protocol/CAP
status language against the current protocol release.
