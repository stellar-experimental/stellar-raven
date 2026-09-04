---
id: sk-023
service: skills
status: verified
discovered: 2026-09-04
upstreamTitle: The MPP guide presents a general protocol as Stellar-only
evidence:
  - 2026-09-04 source read of https://raw.githubusercontent.com/stellar/stellar-dev-skill/790f607b451372495c94c76ec15a520e5e9b8d66/skills/agentic-payments/mpp.md; SHA-256 14214c9ae7e1e61a3f00c0df50a7d40fcd323997aa06399bf36613c2e39d279d.
  - The guide opens with Stellar settlement, defines MPP use as a Stellar-native stack, and does not state that MPP is payment-network independent.
  - 2026-09-04 source read of https://mpp.dev/overview; SHA-256 39c571e5ff17b80020b09726305c463d8b0e3d1c3db9f45ac807285d14b90dd4.
  - 2026-09-04 source read of https://mpp.dev/protocol; SHA-256 a2abfffc6ed63c99c29a9dfc1797a284c954b2f975e0fe2171f513b07435575d. The protocol sources describe payment methods as the network integration layer.
  - 2026-09-04 source read of https://developers.stellar.org/docs/build/agentic-payments/mpp; SHA-256 9056df9951a1624ce5e2c6a3b7f431d0a6d9d6c252da4eafd3ce5134c9e182f7. It names @stellar/mpp as the MPP package for Stellar and links the MPP specification.
probe:
  type: http-text
  url: https://raw.githubusercontent.com/stellar/stellar-dev-skill/main/skills/agentic-payments/mpp.md
  expect:
    status: 200
    contains:
      - "building a Stellar-native payment stack"
---

## Finding

The MPP guide presents a general protocol as Stellar-only.

MPP supports payment methods that integrate different payment networks.
The guide only describes the Stellar payment method.
It does not identify that scope before its Stellar-specific advice.

This wording can make users treat MPP as a Stellar-native protocol.

## Evidence

The current guide calls MPP a Stellar-native payment stack.
It gives only SAC and Stellar channel instructions.

The MPP protocol pages describe an open protocol with payment methods.
The Stellar documentation also distinguishes the MPP specification from its `@stellar/mpp` package.

`sk-012` covers the retired Channel mode name.
`sk-016` covers MPP discovery support.
Neither finding covers protocol identity.

## Recommendation

Add one opening scope sentence.
State that MPP is a payment-network-independent HTTP payment protocol.
State that this guide documents its Stellar payment method.
