---
id: sk-024
service: skills
status: verified
discovered: 2026-09-04
upstreamTitle: The x402 guide makes OZ Channels and its API key appear universal
evidence:
  - 2026-09-04 source read of https://raw.githubusercontent.com/stellar/stellar-dev-skill/790f607b451372495c94c76ec15a520e5e9b8d66/skills/agentic-payments/SKILL.md; SHA-256 2af48a37773b2d1eaa42270b13dae6c49ebbf49050c58457e47fe2e2372af570. Its decision table says x402 needs OZ Channels.
  - 2026-09-04 source read of https://raw.githubusercontent.com/stellar/stellar-dev-skill/790f607b451372495c94c76ec15a520e5e9b8d66/skills/agentic-payments/x402.md; SHA-256 5b07269ec626abede4020525e744a1285e3aad23bf3aa3de8ca0b10523eff950.
  - The x402 guide says its OZ_API_KEY is required and its runbook says the OZ key is required, while its introduction does not label the example as OZ-specific.
  - 2026-09-04 source read of https://docs.x402.org/dev-tools/facilitators.md; SHA-256 aceb37a8ad4115c53f71925c74cb8939c39cbee5480fda1ab192b4032fda1be5. The primary x402 page states that anyone can run a facilitator, lists the free public Stellar option, and lists facilitators with no API key requirement.
  - 2026-09-04 source read of https://docs.x402.org/faq.md; SHA-256 bd0e91764248524790646704746402d1a18f8423b2cc3a9d4ac3463698fd2013. It describes x402 facilitators as permissionless and run by multiple organizations.
probe:
  type: http-text
  url: https://raw.githubusercontent.com/stellar/stellar-dev-skill/main/skills/agentic-payments/SKILL.md
  expect:
    status: 200
    contains:
      - "Needs facilitator? | Yes (OZ Channels)"
---

## Finding

The x402 guide makes OZ Channels and its API key appear universal.

The root decision table names only OZ Channels.
The shared setup says x402 needs an OZ key.
The detailed page states the key requirement without first limiting it to its OZ example.

OZ Channels may require its own key.
The x402 protocol permits self-operated and other facilitator choices.

## Evidence

The current guide includes a self-hosted relayer in one trade-off sentence.
It gives no non-OZ configuration path.
The root table and shared setup use universal wording.

The current x402 primary facilitator page lists many options.
It explicitly lists self-facilitation and a public Stellar facilitator.
It also lists a provider with no API key requirement.

## Recommendation

Label the existing code and key requirement as the OZ Channels example.
Change the root table to say a facilitator is required, with OZ Channels as one option.
Link to the x402 facilitator list before the runbook.
