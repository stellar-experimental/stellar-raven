## q-agent-payment-standard-choice — a — 2026-08-30
- keyFacts[0]: "The x402 V2 and MPP HTTP-402 protocols differ in payloads, settlement, and infrastructure." → confirmed-as-of — B: https://raw.githubusercontent.com/stellar/stellar-mpp-sdk/main/README.md — "Charge and Channel use MPP-specific settlement paths." (as of 2026-08-30)
- keyFacts[1]: "x402 V2 provides extensions and discovery." → confirmed-as-of — B: https://raw.githubusercontent.com/x402-foundation/x402/main/specs/x402-specification-v2.md — "Extensions and GET /supported remain defined." (as of 2026-08-30)
- keyFacts[2]: "MPP uses on-chain Charge settlement and cumulative off-chain Session channel commitments." → confirmed-as-of — B: https://raw.githubusercontent.com/stellar/stellar-mpp-sdk/main/README.md — "Charge settles on-chain; Channel signs cumulative off-chain commitments." (as of 2026-08-30)
- keyFacts[3]: "AP2/ACP cover above-rail authorization/mandate/audit and beta commerce, respectively." → confirmed-as-of — B: https://raw.githubusercontent.com/google-agentic-commerce/AP2/main/docs/ap2/specification.md — "AP2 defines mandates, receipts, and dispute evidence; ACP remains beta commerce." (as of 2026-08-30)
- keyFacts[4]: "Adapter covers quote, payment intent/evidence, settlement/fulfillment/idempotency/refunds." → confirmed-as-of — B: https://github.com/agentic-commerce-protocol/agentic-commerce-protocol/tree/main/spec/2026-04-17 — "Schemas cover fulfillment, idempotency, orders, and refunds." (as of 2026-08-30)
- Sibling sweep 2026-08-30: grep x402|MPP|AP2|ACP → q-defi-agentic-payment-standards-compare, q-defi-x402-on-stellar-what, q-mpp-discovery-and-modes; no contradiction
- Conflicts: none
- Result: DONE

## q-cctp-v2-usdc-stellar — a — 2026-08-30
- keyFacts[0]: "Circle dates Stellar support to 2026-05-18 and the public-live announcement to 2026-05-19." → confirmed-as-of — A: https://developers.circle.com/release-notes/cctp-2026 — "2026.05.18 added Stellar mainnet support; SDF's public page is dated 2026-05-19." (as of 2026-08-30)
- keyFacts[1]: "Use CctpForwarder with correct mintRecipient or destinationCaller for G/M/C funds." → confirmed-as-of — A: https://developers.circle.com/cctp/references/stellar — "Set both fields to CctpForwarder; wrong values can leave funds stuck." (as of 2026-08-30)
- keyFacts[2]: "The 6-decimal CCTP format leaves Stellar USDC's seventh decimal on Stellar." → confirmed-as-of — A: https://developers.circle.com/cctp/references/stellar — "Messages use six-decimal units; the seventh outbound decimal stays in the Stellar account." (as of 2026-08-30)
- keyFacts[3]: "Re-query /v2/burn/USDC/fees for 2026-07-11 Fast/Standard 27→0 0/0, 0→27 1 bp/0." → confirmed-as-of — C: https://iris-api.circle.com/v2/burn/USDC/fees/27/0 — "Live 27→0 is 0/0; the companion 0→27 response is 1/0." (as of 2026-08-30)
- keyFacts[4]: "Treats Circle fees, network resources, relayers, integrators, and swaps as distinct costs." → confirmed-as-of — A: https://developers.circle.com/cctp/concepts/fees — "Circle defines the route-specific CCTP fee separately." (as of 2026-08-30)
- Sibling sweep 2026-08-30: grep CctpForwarder|2026-05-18|2026-05-19|seventh decimal → q-hist-cctp-stellar-live-announcement, q-token-circle-usdc-on-stellar, q-tool-cctp-stellar-integration; no contradiction
- Conflicts: none
- Result: DONE

## q-crp-oz-rwa-erc3643-trex — a — 2026-08-30
- keyFacts[0]: "Makes the as-of date visible for every changeable roster, status, version, or measurement." → confirmed-as-of — B: https://raw.githubusercontent.com/stellar/stellar-protocol/master/ecosystem/sep-0057.md — "The preamble exposes current Status, Updated, and Version fields." (as of 2026-08-30)
- keyFacts[1]: "Identifies SEP-0057 as Draft v0.3.0." → confirmed-as-of — B: https://raw.githubusercontent.com/stellar/stellar-protocol/master/ecosystem/sep-0057.md — "Status: Draft; Version: 0.3.0." (as of 2026-08-30)
- keyFacts[2]: "Treats the normative core and claim-based appendix as different specification layers." → confirmed-as-of — B: https://raw.githubusercontent.com/stellar/stellar-protocol/master/ecosystem/sep-0057.md — "The appendix is not part of the T-REX specification." (as of 2026-08-30)
- keyFacts[3]: "`add_identity` appears in the appendix and OpenZeppelin code, outside the stable core API." → confirmed-as-of — B: https://raw.githubusercontent.com/OpenZeppelin/stellar-contracts/main/examples/rwa/identity-registry/src/contract.rs — "IdentityRegistryContract implements fn add_identity." (as of 2026-08-30)
- keyFacts[4]: "Treats legal compliance and off-chain rights as external to technical policy enforcement." → confirmed-as-of — A: https://developers.stellar.org/docs/tokens/control-asset-access — "The page defines technical authorization, freezing, and clawback controls." (as of 2026-08-30)
- Sibling sweep 2026-08-30: grep SEP-0057|add_identity|T-REX|ERC-3643 → q-crp-tokenize-personal-rwa, q-rwa-stellar-vs-erc20-regulated, q-sor-evm-to-soroban-porting; no contradiction
- Conflicts: none
- Result: DONE

## q-crp-sdp-operation — a — 2026-08-30
- keyFacts[0]: "Uses dated source observations for changeable claims." → confirmed-as-of — A: https://developers.stellar.org/docs/platforms/stellar-disbursement-platform/admin-guide/design-and-architecture — "The live page was last updated on Aug 27, 2026." (as of 2026-08-30)
- keyFacts[1]: "Makes the as-of date visible for every changeable roster, status, version, or measurement." → confirmed-as-of — A: https://developers.stellar.org/docs/platforms/stellar-disbursement-platform — "The current product page supports an explicit dated observation." (as of 2026-08-30)
- keyFacts[2]: "Treats external wallets, direct G/C payments, and embedded passkey C wallets as distinct." → confirmed-as-of — A: https://developers.stellar.org/docs/platforms/stellar-disbursement-platform/admin-guide/embedded-wallets — "Embedded wallets are passkey-controlled C accounts; external and direct flows remain separate." (as of 2026-08-30)
- Sibling sweep 2026-08-30: grep Stellar Disbursement Platform|external wallet|passkey C|direct payment → q-anchor-sdp-vs-anchor-platform, q-anchor-sdp-what, q-pay-sdp-disbursement; no contradiction
- Conflicts: none
- Result: DONE
