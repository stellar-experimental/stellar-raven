---
id: sk-023
service: skills
status: reported-upstream
discovered: 2026-09-04
upstreamTitle: The agentic-payments MPP guide omits MPP's payment-method-agnostic scope
evidence:
  - 2026-09-08 fresh main read at stellar/stellar-dev-skill 03b2f8e8 reproduced the Stellar-native-only framing; SHA-256 1ce5499a55d5144b0a58399afc3a790b7c7adca7030ad234b39fb8ed9d334b60. The current MPP protocol still says it works with any payment network and has a Payment method agnostic section; SHA-256 a2abfffc6ed63c99c29a9dfc1797a284c954b2f975e0fe2171f513b07435575d.
  - 2026-09-08 recurrence at accepted pin 03b2f8e8c88a42b16551926a938ec8173763b45a: `mpp.md` still says "building a Stellar-native payment stack" and adds no payment-method-agnostic scope sentence. SHA-256 1ce5499a55d5144b0a58399afc3a790b7c7adca7030ad234b39fb8ed9d334b60.
  - 2026-09-04 source read of https://raw.githubusercontent.com/stellar/stellar-dev-skill/790f607b451372495c94c76ec15a520e5e9b8d66/skills/agentic-payments/mpp.md; SHA-256 14214c9ae7e1e61a3f00c0df50a7d40fcd323997aa06399bf36613c2e39d279d.
  - 2026-09-04 source read of the same file at the then-served pin https://raw.githubusercontent.com/stellar/stellar-dev-skill/b78983c92330d81943fa99cdaee4e4a52e85eba3/skills/agentic-payments/mpp.md; SHA-256 14214c9ae7e1e61a3f00c0df50a7d40fcd323997aa06399bf36613c2e39d279d, matching commit 790f607. The current accepted pin 03b2f8e8 has different bytes and still reproduces the framing, as the newer evidence records.
  - The guide's only scope statements are Stellar-specific. Its first sentence says "Facilitator-free machine payments settled directly on Stellar". A "When to use MPP" bullet says "You're building a Stellar-native payment stack". No sentence states that MPP works with other payment networks.
  - 2026-09-04 source read of https://mpp.dev/overview; SHA-256 39c571e5ff17b80020b09726305c463d8b0e3d1c3db9f45ac807285d14b90dd4. It calls MPP an open standard that is "neutral to the implementation of underlying payment flows and methods".
  - 2026-09-04 source read of https://mpp.dev/protocol; SHA-256 a2abfffc6ed63c99c29a9dfc1797a284c954b2f975e0fe2171f513b07435575d. It says MPP "works with any payment network", has a section titled "Payment method agnostic", and lists payment methods as the network integration layer.
  - 2026-09-04 source read of https://developers.stellar.org/docs/build/agentic-payments/mpp; SHA-256 9056df9951a1624ce5e2c6a3b7f431d0a6d9d6c252da4eafd3ce5134c9e182f7. It names @stellar/mpp as the npm package for MPP on Stellar, calls mppx the core MPP framework library, and links the MPP specification separately.
  - eval/qa/results/2026-09-04T05-40-51-variantA.json row q-defi-agentic-payment-standards-compare read the skill at pin b78983c, labeled MPP "Stellar-native", and received a wrong verdict. Row q-mpp-discovery-and-modes repeated "the Stellar-native alternative to x402". The artifact is a stopped mixed-upstream diagnostic; the skill source is unaffected by that stop.
  - upstream issue filed 2026-09-09: https://github.com/stellar/stellar-dev-skill/issues/125
probe:
  type: http-text
  url: https://raw.githubusercontent.com/stellar/stellar-dev-skill/main/skills/agentic-payments/mpp.md
  expect:
    status: 200
    contains:
      - "building a Stellar-native payment stack"
---

## Finding

The MPP guide `mpp.md` never states the scope of MPP.
Its only scope statements are Stellar-specific.
The router `SKILL.md` introduces x402 and MPP as "payments on Stellar".

The guide installs `mppx` and `@stellar/mpp` together.
It does not say that `mppx` is the general MPP framework and `@stellar/mpp` is the Stellar payment method.

MPP is a payment-method-agnostic HTTP 402 protocol.
Payment methods define how specific networks integrate.
The Stellar payment method is one of them.

A reader can conclude that MPP is a Stellar protocol.
Two candidate answers reached that conclusion from this guide.

## Evidence

The current guide opens with Stellar settlement and gives only SAC and Stellar channel instructions.
It links mpp.dev only for service discovery and registries.

The MPP protocol pages describe an open protocol that works with any payment network.
The Stellar documentation distinguishes the MPP specification, the `mppx` framework, and the `@stellar/mpp` package.

`sk-012` covered the retired Channel mode name. `sk-016` covered MPP discovery support. Both are resolved.
`sd-005` covers landscape positioning on the Stellar Docs page, not this skill.
No finding covers protocol identity in the skill.

## Recommendation

Add one scope sentence at the top of `mpp.md`.
State that MPP is a payment-method-agnostic HTTP 402 protocol, and that this guide documents its Stellar payment method.
State that `mppx` is the general MPP framework and `@stellar/mpp` is the Stellar payment method.
Link https://mpp.dev/protocol for the protocol definition.
Keep the rest of the guide unchanged.
