---
id: sd-087
service: stellar-docs
status: proposed
discovered: 2026-11-03
upstreamTitle: "Check simulation success before decoding the preview return value"
evidence:
  - "2026-11-03 public GET of https://developers.stellar.org/docs/build/guides/transactions/simulateTransaction-Deep-Dive.md returned HTTP 200. The example calls scValToNative(sim.result?.retval) before logging sim.error. Body SHA256 2026dff38b62338b268df83e63ce596d838dec6a518b32cc2b4c7352d462942c."
  - "Canonical edit file: stellar/stellar-docs docs/build/guides/transactions/simulateTransaction-Deep-Dive.mdx at 85d2d1b8e7a4451b7a6af0931f587ce73109b816. Fresh immutable-source GET returned HTTP 200; body SHA256 3d10b443ce150457aec5da83e274e1180bfa1e0c305db5f28f7c6983355a739d."
  - "The exact served source was also visible in case77 transcript entries 5 and 6. This is source evidence, not a verdict-based truth claim."
  - "Dedupe checked every improvements namespace, recurrences, resolved.json, and intake in MAIN and the method tree. Related sd-055 covers assembly examples; sd-078 covers archived-entry restoration. Neither covers this decoding guard."
  - "research/audits/2026-11-02-golden-overnight/tail-source-receipts.json records request/result hashes, bounded public source text, currentness, and verification limits. No simulation or transaction ran."
---

## Finding

The simulation deep-dive example decodes a possible return value before it checks simulation success.
It calls `scValToNative(sim.result?.retval)` and logs `sim.error` afterward.
Optional chaining can produce an absent decoder argument when simulation returns an error or no invocation result.
The example does not establish the expected return-value boundary.

This is a Docs example defect, separate from transaction assembly and restoration guidance.
It can obscure the simulation error with a later conversion failure.
No network failure or transaction submission is needed to identify the missing guard.

## Evidence

The current [published guide](https://developers.stellar.org/docs/build/guides/transactions/simulateTransaction-Deep-Dive.md) retains the call.
The [immutable source](https://github.com/stellar/stellar-docs/blob/85d2d1b8e7a4451b7a6af0931f587ce73109b816/docs/build/guides/transactions/simulateTransaction-Deep-Dive.mdx) contains the same example.
These are one content producer; their agreement proves source-to-render currentness, not independent authority.
The receipt preserves the exact call and observation times.
No original or replacement example executed during this preparation.

The exact runtime failure and success, error, and restoration fixtures require independent verification before publication.

## Recommendation

Check the SDK's simulation-success result type before accessing the invocation return value.
Decode only a present value with the expected contract return type.
Report simulation errors before attempting conversion.
Keep restoration and missing-result outcomes separate from successful invocation output.
Preserve the guide's correct assembled-transaction build step.

Validate the corrected example with local fixtures that require no network or submitted transaction.
