---
id: sd-065
service: stellar-docs
status: verified
discovered: 2026-11-02
upstreamTitle: Debugging Errors page names HostError(..., LimitExceeded); the error code is ExceededLimit
evidence:
  - 2026-11-02T17:17:27Z GET https://developers.stellar.org/docs/learn/fundamentals/contract-development/errors-and-debugging/debugging-errors returned HTTP 200 with the table rows "HostError(Budget, LimitExceeded)" and "INVOKE_HOST_FUNCTION_TRAPPED, diagnostics - HostError(Storage, LimitExceeded)"
  - stellar/stellar-docs main 7cb5e8a492706d2ae95bbb14be737fbf96100058 debugging-errors.mdx lines 38 and 100
  - stellar/stellar-xdr 4f524bbac80c781c06e4fb5fc93a2d0d331d6705 Stellar-contract.x line 104 "SCEC_EXCEEDED_LIMIT = 5"
  - soroban-env-common 29.0.1 src/error.rs lines 194 and 219 build Error::from_type_and_code(ScErrorType::Budget, ScErrorCode::ExceededLimit)
  - the sibling page docs/learn/fundamentals/contract-development/contract-interactions/overview.mdx line 38 already says the error code is ExceededLimit with type Budget or Storage
  - "2026-11-02T20:07Z recheck: live page .md lines 41 and 99 still read HostError(Budget, LimitExceeded) and HostError(Storage, LimitExceeded); stellar/stellar-docs main 5142b219 lines 38 and 100 unchanged"
  - Raven eval golden case q-sor-decode-hosterror-codes, audited 2026-11-02
---

## Finding

The Debugging Errors page names the resource-limit errors `HostError(Budget, LimitExceeded)` and
`HostError(Storage, LimitExceeded)`. No error code `LimitExceeded` exists. The XDR code is
`SCEC_EXCEEDED_LIMIT`, and the host prints it as `ExceededLimit`.

A reader who searches logs or code for `LimitExceeded` does not find the real error. The sibling
Contract Interactions overview already uses the correct name.

## Evidence

The live table on the Debugging Errors page has the row `HostError(Budget, LimitExceeded)`. A
later row says `diagnostics: HostError(Storage, LimitExceeded)`.

`Stellar-contract.x` defines `SCEC_EXCEEDED_LIMIT = 5`. The host constructs
`ScErrorCode::ExceededLimit` with `ScErrorType::Budget` when a budget runs out. The overview page
says: "Resource limit errors, which carry the error code `ExceededLimit` and the error type
`Budget` or `Storage`."

## Recommendation

Change `LimitExceeded` to `ExceededLimit` in both table rows: `HostError(Budget, ExceededLimit)` and
`HostError(Storage, ExceededLimit)`. This keeps the `HostError(Type, Code)` notation that the other rows use.
The host prints the same error as `Error(Budget, ExceededLimit)` in diagnostics.
