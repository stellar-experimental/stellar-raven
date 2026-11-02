---
id: sd-060
service: stellar-docs
status: reported-upstream
discovered: 2026-11-02
upstreamTitle: Remove Albedo from the x402 auth-entry signing wallet list
evidence:
  - 2026-11-02T17:17:27Z GET https://developers.stellar.org/docs/build/agentic-payments/x402 returned HTTP 200 with "The following wallets support auth-entry signing" followed by a list that includes "Albedo"
  - stellar/stellar-docs main 7cb5e8a492706d2ae95bbb14be737fbf96100058 docs/build/agentic-payments/x402/index.mdx line 26 is "- Albedo"
  - Creit-Tech/Stellar-Wallets-Kit HEAD 9db6b363f678eb7ba95b6349d4a32a60d5b1253b src/sdk/modules/albedo.module.ts lines 57-61 throw code -3 with message 'Albedo does not support the "signAuthEntry" function'
  - 2026-11-02 npm @albedo-link/intent latest 0.13.0 (modified 2025-06-13); src/intent-interface.js defines the intents public_key, sign_message, tx, pay, trust, exchange, implicit_flow, manage_account, and batch, and no auth-entry intent
  - 2026-11-02 stellar-expert/albedo master c2fe8f68 (2026-08-31) intent/src/intent-interface.js defines the same nine intents, so unreleased Albedo code also has no auth-entry intent
  - the Wallets Kit Albedo module already rejected signAuthEntry at commit 90b8854a (2025-09-13); the x402 page listed Albedo from its first version, stellar/stellar-docs#2264 (merged 2026-02-18)
  - golden case q-soroban-x402-auth-entry-signing (golden audit pass 2, 2026-11-02)
  - upstream issue filed 2026-11-02: https://github.com/stellar/stellar-docs/issues/2997
---

## Finding

The x402 overview page lists Albedo as a wallet that supports auth-entry signing. Albedo has no
auth-entry signing intent, and the Stellar Wallets Kit Albedo module rejects `signAuthEntry`.

The page says that a wallet must support Soroban authorization-entry signing for x402. It then
lists Albedo with seven other wallets. The Stellar Wallets Kit Albedo module throws an error for
`signAuthEntry`. The Albedo intent library has no auth-entry intent.

A reader can choose Albedo for an x402 client and get a failure at signing time.

## Evidence

The live page section "x402 Compatible Wallets" reads: "The following wallets support auth-entry
signing". The list contains "Albedo".

The Wallets Kit module `src/sdk/modules/albedo.module.ts` contains:

```typescript
async signAuthEntry(): Promise<{ signedAuthEntry: string; signerAddress?: string }> {
  throw {
    code: -3,
    message: 'Albedo does not support the "signAuthEntry" function',
  };
}
```

The latest `@albedo-link/intent` package is 0.13.0. Its `src/intent-interface.js` defines nine
intents. None of them signs a Soroban authorization entry.

## Recommendation

Remove Albedo from the auth-entry signing list. If Albedo adds auth-entry signing later, add it
again with a link to the Albedo documentation for that feature.

Optional: link each listed wallet to the source that shows its auth-entry support.
