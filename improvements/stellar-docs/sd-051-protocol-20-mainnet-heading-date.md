---
id: sd-051
service: stellar-docs
status: verified
discovered: 2026-09-04
upstreamTitle: Protocol 20 history heading conflates a software release with Mainnet activation
evidence:
  - 2026-09-04 live read of https://developers.stellar.org/docs/networks/software-versions shows Protocol 20 Phase 1 Mainnet Edition dated February 5, 2024
  - 2026-09-04 live read of the same page shows sibling headings Protocol 21 (Mainnet, June 18, 2024) and Protocol 22 (Mainnet, December 5, 2024), which use the Mainnet token for a network activation date
  - 2026-09-04 live read of the same page shows the February 5 entry lists Phase 0 Limits and Phase 0 Fees although its heading says Phase 1, while the separate February 27, 2024 entry lists Phase 1 Limits and Phase 1 Fees
  - 2026-09-04 live read of https://stellar.org/blog/developers/protocol-20-upgrade-guide says Mainnet upgraded to Protocol 20 on February 20 at 1700 UTC, and its key-date list records February 20 as the Protocol 20 Upgrade Vote plus Phase 0
  - eval/qa/results/2026-09-04T05-40-51-variantA.json row q-hist-soroban-launch-protocol20 treated the heading date as the Mainnet date and received a wrong verdict
  - .agents/rounds/2026-09-03-truth-maintenance/upstream-docs-findings-terra.md records the dated recheck
  - .agents/rounds/2026-09-03-truth-maintenance/upstream-docs-findings-review-opus.md records the independent review and this correction
---

## Finding

The software-versions page labels a February 5 entry as Mainnet Edition.
Sibling headings on the same page use the Mainnet token for a network activation date.

The Protocol 20 upgrade guide records Mainnet activation on February 20.
The candidate answer read February 5 as the activation date.

## Evidence

On 2026-09-04, the history heading read Protocol 20: Soroban Phase 1 (Mainnet Edition) (February 5, 2024).
The same page headed later entries Protocol 21 (Mainnet, June 18, 2024) and Protocol 22 (Mainnet, December 5, 2024).
A reader therefore sees the Mainnet token beside a date and reads an activation date.

The official upgrade guide states that Mainnet upgraded on February 20 at 1700 UTC.
Its key-date list records February 20 as the Protocol 20 upgrade vote and Phase 0.
The same list records the Phase 2 network settings vote on March 19.

The February 5 entry also lists Phase 0 Limits and Phase 0 Fees.
Its heading still says Phase 1.
The separate February 27, 2024 entry lists Phase 1 Limits and Phase 1 Fees.

## Recommendation

Label February 5 as the applicable software-release date.
Record February 20 as the Protocol 20 Mainnet activation date for Phase 0.
Correct the February 5 heading, because it says Phase 1 but lists Phase 0 limits and fees.
Use distinct labels for software release and network activation.
