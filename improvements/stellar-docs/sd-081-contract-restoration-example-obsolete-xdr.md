---
id: sd-081
service: stellar-docs
status: reported-upstream
discovered: 2026-11-02
upstreamTitle: "Contract-restoration example fails parsing and reads the WASM hash and footprint with obsolete XDR access"
evidence:
  - "2026-11-09 sweep (still-repro): Known partial fix in merged PR2977 persists: both copies setTimeout(30). Both live contract-restoration fences still fail TypeScript parsing TS1131/TS1128 at the empty return type; both still pass instance LedgerKey as entry and response as footprint key. Combined polling/data-restoration fences with SDK17.4.0 reproduce TS2440 Api redeclaration. Recheck: https://developers.stellar.org/docs/build/guides/archival/restore-contract-js.md; https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/state-archival.md; https://developers.stellar.org/docs/build/guides/archival/restore-data-js.md; https://developers.stellar.org/docs/build/guides/transactions/submit-transaction-wait-js.md"
  - "Raven partial-fix verification posted and read back 2026-11-06 (author kalepail): https://github.com/stellar/stellar-docs/issues/2562#issuecomment-6686867459"
  - "Partial fix: https://github.com/stellar/stellar-docs/pull/2977 merged 2026-11-03T16:14:21Z at d7845d6c594bfac2c1a9cbc856ccd68d92d66eb0; both deployed restoration copies now setTimeout(30). The November 2 initial evidence predates this change. Independent current residual tests: .agents/rounds/2026-11-06-remaining-sweep/cross-review.md."
  - "Successor of sd-055, which stellar/stellar-docs#2933 fixed. The sd-055 retirement review (Codex gpt-6.1-sol high, 2026-11-02, .agents/rounds/2026-11-02-upstream-followup/rv-fu-review.md section A1) found this adjacent example still broken on both deployed pages."
  - "2026-11-02 GET https://developers.stellar.org/docs/build/guides/archival/restore-contract-js.md (HTTP 200) line 69: 'function getWasmLedgerKey(entry: xdr.ContractDataEntry):  {' has an empty return type, and the imports on lines 27-36 do not import xdr. The same function is on https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/state-archival.md line 365."
  - "Same snippet: getWasmLedgerKey(instance) receives c.getFootprint(), a LedgerKey, but reads entry.val().instance().wasmHash() as if it were a ContractDataEntry. The instance ledger key holds no WASM hash. server.getLedgerEntries(...) returns a response object, and the snippet puts that response into setReadWrite([instance, wasmEntry]), where the footprint needs a LedgerKey. The restoreTx builder sets no time bounds."
  - "Reviewer harness 2026-11-02: tmp/rv-fu/fixtures/check-docs.mjs with @stellar/stellar-sdk 17.4.0 and local fixtures, no network submission; output line 'PASS adjacent contract-restoration parse failure confirmed' (sdk-check.log line 19)."
  - "2026-11-02 GET https://developers.stellar.org/docs/build/guides/archival/restore-data-js.md (HTTP 200) line 30 tells readers to reuse submitTx from https://developers.stellar.org/docs/build/guides/transactions/submit-transaction-wait-js.md, whose line 13 is 'import { Server, Api } from \"@stellar/stellar-sdk/rpc\";'. restore-data-js line 43 declares 'const { Api, assembleTransaction } = StellarRpc;'. Reviewer check tmp/rv-fu/fixtures/check-shared-types.mjs (TypeScript, the two code blocks combined) reports TS2440 'Import declaration conflicts with local declaration of 'Api'.' (evidence2/shared-types.log). Issue #2562 does not list this conflict."
  - "Pre-existing upstream report: https://github.com/stellar/stellar-docs/issues/2562 (open, filed 2026-07-07 by oceans404, a JS SDK snippet audit) lists restore-contract-js.mdx line 69 for the empty return type and the missing xdr import. It does not list the state-archival copy or the obsolete XDR access, the response-as-key footprint, or the missing time bounds."
recurrences:
  - date: 2026-11-09
    evidence: "Known partial fix in merged PR2977 persists: both copies setTimeout(30). Both live contract-restoration fences still fail TypeScript parsing TS1131/TS1128 at the empty return type; both still pass instance LedgerKey as entry and response as footprint key. Combined polling/data-restoration fences with SDK17.4.0 reproduce TS2440 Api redeclaration."
  - date: 2026-11-06
    evidence: "Correction after the continuation recheck: BOTH live restore examples retain the empty return type and fail TypeScript parsing; instance LedgerKey is read as an entry and the response is used as a footprint key. Both now call setTimeout(30), so the preceding sweep incorrectly retained missing time bounds. restore-data still redeclares Api imported by the polling helper. Fresh evidence: .agents/rounds/2026-11-06-remaining-sweep/docs.md and cross-review.md."
---

## Finding

The contract-restoration example on two docs pages does not parse and cannot build a valid restoration transaction.
`getWasmLedgerKey` has an empty return type, and the snippet uses `xdr` without importing it.
Issue #2562 already reports those two defects for one of the pages.

The example also has runtime defects that #2562 does not list:

- It passes the instance `LedgerKey` from `c.getFootprint()` to a function that reads it as a `ContractDataEntry`.
- It reads the WASM hash from the instance key. The key holds no WASM hash; the hash is in the instance ledger entry.
- It puts the `getLedgerEntries` response into the read-write footprint, which needs a `LedgerKey`.

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

In `restore-data-js`, remove the local `Api` declaration and use the `Api` that the polling guide imports.

## Partial fix verified — 2026-11-06

Both deployed contract-restoration copies now call `.setTimeout(30)` before `.build()`.
The time-bounds recommendation is complete. The initial November 2 evidence above is historical;
the November 5 sweep incorrectly repeated it as a current defect. The parse, missing import,
instance-entry, footprint and duplicate `Api` defects remain. Keep this finding active.

Live reproduction and independent review: `.agents/rounds/2026-11-06-remaining-sweep/docs.md`
and `.agents/rounds/2026-11-06-remaining-sweep/cross-review.md`.
