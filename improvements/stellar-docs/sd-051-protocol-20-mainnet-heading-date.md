---
id: sd-051
service: stellar-docs
status: verified
discovered: 2026-09-04
upstreamTitle: Protocol 20 history heading conflates a software release with Mainnet activation
evidence:
  - 2026-09-04 live read of https://developers.stellar.org/docs/networks/software-versions shows Protocol 20 Phase 1 Mainnet Edition dated February 5, 2024
  - 2026-09-04 live read of https://stellar.org/blog/developers/protocol-20-upgrade-guide says Mainnet upgraded to Protocol 20 on February 20 at 1700 UTC
  - eval/qa/results/2026-09-04T05-40-51-variantA.json row q-hist-soroban-launch-protocol20 treated the heading date as the Mainnet date and received a wrong verdict
  - .agents/rounds/2026-09-03-truth-maintenance/upstream-docs-findings-terra.md records the dated recheck
---

## Finding

The software-versions page labels a February 5 entry as Mainnet Edition.
The page does not say that February 5 is a software-release date.

The Protocol 20 upgrade guide records Mainnet activation on February 20.
The candidate answer read February 5 as the activation date.

## Evidence

On 2026-09-04, the history heading read Protocol 20: Soroban Phase 1 (Mainnet Edition) (February 5, 2024).
The official upgrade guide states that Mainnet upgraded on February 20 at 1700 UTC.

The history page presents the entry beside protocol and network dates.
This makes the date purpose ambiguous.

## Recommendation

Label February 5 as the applicable software-release date.
Add the February 20 Mainnet activation date to the same Protocol 20 entry.
Use distinct labels for software release and network activation.
