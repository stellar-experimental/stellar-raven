---
id: sd-081
service: stellar-docs
status: reported-upstream
discovered: 2026-11-02
upstreamTitle: "Contract-restoration example fails parsing and reads the WASM hash and footprint with obsolete XDR access"
evidence:
  - "Successor of sd-055, which stellar/stellar-docs#2933 fixed. The sd-055 retirement review (Codex gpt-6.1-sol high, 2026-11-02, .agents/rounds/2026-11-02-upstream-followup/rv-fu-review.md section A1) found this adjacent example still broken on both deployed pages."
  - "2026-11-02 GET https://developers.stellar.org/docs/build/guides/archival/restore-contract-js.md (HTTP 200) line 69: 'function getWasmLedgerKey(entry: xdr.ContractDataEntry):  {' has an empty return type, and the imports on lines 27-36 do not import xdr. The same function is on https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/state-archival.md line 365."
  - "Same snippet: getWasmLedgerKey(instance) receives c.getFootprint(), a LedgerKey, but reads entry.val().instance().wasmHash() as if it were a ContractDataEntry. The instance ledger key holds no WASM hash. server.getLedgerEntries(...) returns a response object, and the snippet puts that response into setReadWrite([instance, wasmEntry]), where the footprint needs a LedgerKey. The restoreTx builder sets no time bounds."
  - "Reviewer harness 2026-11-02: tmp/rv-fu/fixtures/check-docs.mjs with @stellar/stellar-sdk 17.4.0 and local fixtures, no network submission; output line 'PASS adjacent contract-restoration parse failure confirmed' (sdk-check.log line 19)."
  - "2026-11-02 GET https://developers.stellar.org/docs/build/guides/archival/restore-data-js.md (HTTP 200) line 30 tells readers to reuse submitTx from https://developers.stellar.org/docs/build/guides/transactions/submit-transaction-wait-js.md, whose line 13 is 'import { Server, Api } from \"@stellar/stellar-sdk/rpc\";'. restore-data-js line 43 declares 'const { Api, assembleTransaction } = StellarRpc;'. Reviewer check tmp/rv-fu/fixtures/check-shared-types.mjs (TypeScript, the two code blocks combined) reports TS2440 'Import declaration conflicts with local declaration of 'Api'.' (evidence2/shared-types.log). Issue #2562 does not list this conflict."
  - "Pre-existing upstream report: https://github.com/stellar/stellar-docs/issues/2562 (open, filed 2026-07-07 by oceans404, a JS SDK snippet audit) lists restore-contract-js.mdx line 69 for the empty return type and the missing xdr import. It does not list the state-archival copy or the obsolete XDR access, the response-as-key footprint, or the missing time bounds."
---

## Finding

The contract-restoration example on two docs pages does not parse and cannot build a valid restoration transaction.
`getWasmLedgerKey` has an empty return type, and the snippet uses `xdr` without importing it.
Issue #2562 already reports those two defects for one of the pages.

The example also has runtime defects that #2562 does not list:

- It passes the instance `LedgerKey` from `c.getFootprint()` to a function that reads it as a `ContractDataEntry`.
- It reads the WASM hash from the instance key. The key holds no WASM hash; the hash is in the instance ledger entry.
- It puts the `getLedgerEntries` response into the read-write footprint, which needs a `LedgerKey`.
- The restoration transaction sets no time bounds.

The data-restoration guide has a separate defect.
It tells readers to reuse `submitTx` from the polling guide, which imports `Api` from `@stellar/stellar-sdk/rpc`.
The guide also declares `const { Api, assembleTransaction } = StellarRpc;`.
The combined code fails TypeScript check `TS2440`.

## Evidence

[`restore-contract-js`](https://developers.stellar.org/docs/build/guides/archival/restore-contract-js) line 69 and the
[state-archival page](https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/state-archival) line 365 contain:

```typescript
function getWasmLedgerKey(entry: xdr.ContractDataEntry):  {
  return xdr.LedgerKey.contractCode(
    new xdr.LedgerKeyContractCode({
      hash: entry.val().instance().wasmHash()
    })
  );
}
```

The caller passes `c.getFootprint()` and uses the `getLedgerEntries` response as a footprint key:

```typescript
const instance = c.getFootprint();
const wasmEntry = await server.getLedgerEntries(getWasmLedgerKey(instance));
new SorobanDataBuilder().setReadWrite([instance, wasmEntry]).build()
```

A local check with `@stellar/stellar-sdk` 17.4.0 confirms the parse failure.

[`restore-data-js`](https://developers.stellar.org/docs/build/guides/archival/restore-data-js) line 43 declares `Api` again:

```typescript
// submit-transaction-wait-js, line 13
import { Server, Api } from "@stellar/stellar-sdk/rpc";
// restore-data-js, line 43
const { Api, assembleTransaction } = StellarRpc;
```

TypeScript reports `TS2440: Import declaration conflicts with local declaration of 'Api'.` for the combined code.

## Recommendation

Fix both copies of the example:

1. Give `getWasmLedgerKey` a `xdr.LedgerKey` return type and import `xdr`.
2. Read the instance ledger entry with `getLedgerEntries(instance)`, and take the WASM hash from that entry's contract instance executable. With `@stellar/stellar-sdk` 17.4.0 the path is `response.entries[0].val.value.val.value.executable.value`. Check that the entry exists and that the executable is `contractExecutableWasm`.
3. Build the contract-code `LedgerKey` from that hash, and put the two `LedgerKey` values in the read-write footprint.
4. Set time bounds on the restoration transaction.

In `restore-data-js`, remove the local `Api` declaration and use the `Api` that the polling guide imports.
