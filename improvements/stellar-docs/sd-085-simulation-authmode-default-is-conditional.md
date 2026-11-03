---
id: sd-085
service: stellar-docs
status: verified
discovered: 2026-11-03
upstreamTitle: Document the conditional authMode default for transaction simulation
evidence:
  - "Current Docs commit 85d2d1b8e7a4451b7a6af0931f587ce73109b816. Both openrpc/src/stellar-rpc/contentDescriptors/AuthMode.json and openrpc/src/stellar-rpc/schemas/AuthMode.json describe enforce as the unconditional default."
  - "Descriptor SHA-256: 3a8cde0577b55a64297c925de6e4ca5b9efe1c09e6a45af3288660ee7f0e2274. Schema SHA-256: 7adde361c1e392383e107ca671da548d7abb789ff58681fc723676a98f6bb760."
  - "Released Stellar RPC v30.0.0, commit 13e53516633c3ce1281c7edbacb607107d3a4e55, selects record for InvokeHostFunction without authorization entries and enforce when entries exist. Source SHA-256: 857a62ad6a2137e8c2aaf2711b15157da32fd83fcc3792d678d51283b6aa0c38."
  - "Installed Stellar CLI 28.1.0 command help independently describes the same conditional RPC default. No simulation or transaction ran."
  - "Current public method page and the existing local MCP reproduce the unconditional default. Public Markdown SHA-256: 0a4378f9684b69448dc72b9abd894370a1ab8aec779bff41a80fe14b4783940b. MCP page-content SHA-256: 0d08c97822b14ff1cdc02461cbf84d47da4dcf38ab29192561f7f11ecba1bbff."
  - "Public requests, timestamps, result hashes, CLI fingerprints, and scoped source evidence: research/audits/2026-11-02-golden-overnight/late-docs-receipts.json. Independent Grok review cleared this docs-content finding."
  - "Dedupe covered active findings, recurrences, resolved.json, and intake.json in both worktrees. sd-055 concerns assembly examples; sd-078 concerns restoration. Neither owns authorization defaults."
---

## Finding

The `simulateTransaction` documentation describes `enforce` as the unconditional authorization-mode default.
The released implementation chooses its default from the invocation's authorization entries.
For `InvokeHostFunction`, an empty entry list selects `record`; a nonempty list selects `enforce`.
The condition concerns authorization-entry presence, rather than transaction signatures.

This is a `docs-content` error in generated OpenRPC descriptions, owned by `stellar/stellar-docs`.
The discrepancy can cause clients to misinterpret authorization behavior when they omit `authMode`.
It does not establish an exploit or a provider outage.

## Evidence

The two canonical inputs are the [content descriptor](https://github.com/stellar/stellar-docs/blob/85d2d1b8e7a4451b7a6af0931f587ce73109b816/openrpc/src/stellar-rpc/contentDescriptors/AuthMode.json) and [schema](https://github.com/stellar/stellar-docs/blob/85d2d1b8e7a4451b7a6af0931f587ce73109b816/openrpc/src/stellar-rpc/schemas/AuthMode.json).
Their descriptions both mark `enforce` as the default.
The generated method file and [public page](https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/simulateTransaction) repeat those descriptions.
The MCP page read reproduces them.

The [released RPC implementation](https://github.com/stellar/stellar-rpc/blob/13e53516633c3ce1281c7edbacb607107d3a4e55/cmd/stellar-rpc/internal/methods/simulate_transaction.go#L403) implements the entry-dependent rule in `validateAuthMode`.
Its release-tag and immutable-commit bodies match.
CLI `28.1.0` help describes recording without entries and enforcing existing entries.
CLI mode `root` uses different spelling from RPC mode `record`; that difference is not this defect.

The [OpenRPC README](https://github.com/stellar/stellar-docs/blob/85d2d1b8e7a4451b7a6af0931f587ce73109b816/openrpc/README.md) identifies the source and build workflow.
It also states that method-page generation requires a maintainer and a generator outside this repository.
Changing only the generated method page would leave both canonical descriptions incorrect.

This evidence covers one shipped RPC release and the identified CLI help.
It does not prove the software version deployed by every RPC provider.
It does not establish the first affected release.
Extension and restoration operations reject an explicitly supplied mode; the invocation rule must not become a universal operation rule.

## Recommendation

Correct both canonical OpenRPC descriptions.
Explain the conditional default when `authMode` is omitted for `InvokeHostFunction`.
Keep `enforce`, `record`, and `record_allow_nonroot` and their explicit meanings.
Do not replace the condition with a signed-versus-unsigned transaction rule.

Run the documented `pnpm rpcspec:build` and `pnpm rpcspec:validate` workflows.
Have a Docs maintainer regenerate the method page.
Recheck the public page and its served MCP copy.
No runtime workaround or external issue was created by this finding.
