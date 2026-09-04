---
id: sk-024
service: skills
status: verified
discovered: 2026-09-04
upstreamTitle: The x402 guide presents OpenZeppelin Channels and its API key as the only facilitator path
evidence:
  - 2026-09-04 source read of https://raw.githubusercontent.com/stellar/stellar-dev-skill/790f607b451372495c94c76ec15a520e5e9b8d66/skills/agentic-payments/SKILL.md; SHA-256 2af48a37773b2d1eaa42270b13dae6c49ebbf49050c58457e47fe2e2372af570. Its decision table says "Needs facilitator? | Yes (OZ Channels)". Its shared setup says "x402 additionally needs the web-only OZ Channels key generator".
  - 2026-09-04 source read of https://raw.githubusercontent.com/stellar/stellar-dev-skill/790f607b451372495c94c76ec15a520e5e9b8d66/skills/agentic-payments/x402.md; SHA-256 5b07269ec626abede4020525e744a1285e3aad23bf3aa3de8ca0b10523eff950. The seller example throws "OZ_API_KEY is required" at startup. The runbook says the key is "Required, not optional". The env list, the mainnet checklist, and a pitfall repeat the requirement. The only alternative is one parenthetical, "(or a self-hosted relayer)".
  - The served pin in ecosystem-skills/MANIFEST.json (b78983c92330d81943fa99cdaee4e4a52e85eba3), commit 790f607, and current main carry identical bytes for both files.
  - 2026-09-04 source read of https://docs.x402.org/dev-tools/facilitators.md; SHA-256 aceb37a8ad4115c53f71925c74cb8939c39cbee5480fda1ab192b4032fda1be5. The page states that anyone can run a facilitator and links self-facilitation. Its table lists "Built on Stellar" as a free public x402 facilitator for Stellar. That entry links the Stellar documentation page for the OpenZeppelin Channels endpoint, which requires an API key.
  - 2026-09-04 source read of https://docs.x402.org/faq.md; SHA-256 bd0e91764248524790646704746402d1a18f8423b2cc3a9d4ac3463698fd2013. It describes the protocol as permissionless, with production facilitators run by multiple organizations.
  - 2026-09-04 live read of https://developers.stellar.org/docs/build/agentic-payments/x402 (page last updated 2026-09-02). Its "x402 Facilitators" section says two options are available for Stellar: the Coinbase x402 facilitator, which supports Stellar on Testnet with sponsored fees, and the Build on Stellar Relayer with the OpenZeppelin x402 plugin, which requires an API key.
  - 2026-09-04 live read of https://developers.stellar.org/docs/build/agentic-payments/x402/built-on-stellar. The Built on Stellar facilitator is built with the OpenZeppelin Relayer, uses the channels.openzeppelin.com endpoints, and requires a generated API key on testnet and mainnet.
  - eval/qa/results/2026-09-04T05-40-51-variantA.json: row q-soroban-x402-auth-entry-signing read the skill at pin b78983c, wrote "an API key is required on both testnet and mainnet" for the flow, and received a wrong verdict. Row q-defi-x402-on-stellar-what presented OZ Channels as the facilitator and received a partial verdict for the missing second option. Row q-agent-payment-standard-choice reproduced the "Yes (OZ Channels)" table. The artifact is a stopped mixed-upstream diagnostic; the skill source is unaffected by that stop.
probe:
  type: http-text
  url: https://raw.githubusercontent.com/stellar/stellar-dev-skill/main/skills/agentic-payments/SKILL.md
  expect:
    status: 200
    contains:
      - "Needs facilitator? | Yes (OZ Channels)"
---

## Finding

The router `SKILL.md` and the guide `x402.md` present OpenZeppelin Channels as the only facilitator for x402 on Stellar.
The root decision table says x402 needs OZ Channels.
The shared setup says x402 needs the OZ Channels key generator.
The seller example stops at startup without `OZ_API_KEY`.
The guide gives no configuration for any other facilitator.

The x402 protocol is permissionless. Anyone can run a facilitator, and self-facilitation is documented.
The official Stellar x402 page lists two facilitator options for Stellar.
The Coinbase x402 facilitator supports Stellar on Testnet with sponsored fees.
The Built on Stellar facilitator runs on OpenZeppelin Channels and requires an API key on both networks.
The API key is a requirement of that provider, not of x402.

A reader can conclude that x402 on Stellar requires OpenZeppelin Channels and its key.
Three candidate answers reproduced that framing.

## Evidence

The current guide names OpenZeppelin Channels in its first sentence and in every configuration step.
It mentions "a self-hosted relayer" once, inside a trade-off parenthetical, with no configuration.
The root table and the shared setup use universal wording.

The x402 facilitator page lists many providers and documents self-facilitation.
Its Stellar entry, Built on Stellar, is the same OpenZeppelin Channels endpoint and also needs a key.
The official Stellar page separates the Coinbase facilitator from the OpenZeppelin option.

`sd-039` covers the Relayer versus Channels product identity on Stellar Docs Tools pages. It does not cover this skill.

## Recommendation

Keep the OpenZeppelin Channels example, and label it as one facilitator option.
Change the root table cell to say that x402 needs a facilitator, and that the guide uses OZ Channels.
Scope the shared-setup sentence and the description line to the OZ Channels option.

Add one sentence in `x402.md` before the seller example.
Name the alternatives that the official Stellar page lists: the Coinbase x402 facilitator on testnet, the Built on Stellar facilitator, and self-facilitation.
Link https://docs.x402.org/dev-tools/facilitators and the "x402 Facilitators" section of the Stellar page.

Keep the key requirement text, but state it as the OpenZeppelin Channels requirement.
Update the trade-off sentence, the startup check, the env list, runbook step 1, the mainnet checklist, and the 401 pitfall.
