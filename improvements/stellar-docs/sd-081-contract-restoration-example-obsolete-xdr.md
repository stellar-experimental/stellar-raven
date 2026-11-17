---
id: sd-081
service: stellar-docs
status: reported-upstream
discovered: 2026-11-02
upstreamTitle: "Contract-restoration example fails parsing and reads the WASM hash and footprint with obsolete XDR access"
evidence:
  - "2026-11-09 sweep (still-repro): Known partial fix in merged PR2977 persists: both copies setTimeout(30). Both live contract-restoration fences still fail TypeScript parsing TS1131/TS1128 at the empty return type; both still pass instance LedgerKey as entry and response as footprint key. Combined polling/data-restoration fences with SDK17.4.0 reproduce TS2440 Api redeclaration. Recheck: https://developers.stellar.org/docs/build/guides/archival/restore-contract-js.md; https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/state-archival.md; https://developers.stellar.org/docs/build/guides/archival/restore-data-js.md; https://developers.stellar.org/docs/build/guides/transactions/submit-transaction-wait-js.md"
  - "Raven verification of the PR 3083 fix and the remaining Api defect posted and read back 2026-11-17 (author kalepail): https://github.com/stellar/stellar-docs/issues/2562#issuecomment-6933906845"
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
  - date: 2026-11-17
    evidence: "Partly fixed live; the finding stays open for one defect. Checked 2026-11-17 (00:20Z). The `-js` page paths now answer HTTP 307 to the unsuffixed pages: https://developers.stellar.org/docs/build/guides/archival/restore-contract.md, https://developers.stellar.org/docs/build/guides/archival/restore-data.md and https://developers.stellar.org/docs/build/guides/transactions/submit-transaction-wait.md. All four pages answer 200 (those three and https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/state-archival.md). Fixed: PR https://github.com/stellar/stellar-docs/pull/3083 (merged 2026-11-10, \"Port JS snippets to stellar-sdk v17 XDR property access\") rewrote the contract-restoration example. Both JavaScript restoration fences (restore-contract, and the second fence of state-archival) now parse. `getWasmLedgerKey(data: xdr.LedgerEntryData): xdr.LedgerKey` has a return type. The caller reads `entries[0].val` from `getLedgerEntries(instance)`, and the restore-contract fence type-checks with 0 errors against @stellar/stellar-sdk 17.4.0 (tsc, SDK installed in a scratch directory, `submitTx` declared). The state-archival fence reports only TS2304 for the `server` it assumes from elsewhere. Still reproduces: the data-restoration defect. restore-data still declares `const { Api, assembleTransaction } = StellarRpc;` and tells readers to reuse `submitTx` from submit-transaction-wait, whose fence has `import { Api, Server } from \"@stellar/stellar-sdk/rpc\";`. The two fences combined in one module report `TS2440: Import declaration conflicts with local declaration of 'Api'.` with SDK 17.4.0. Issue https://github.com/stellar/stellar-docs/issues/2562 is open and holds no reply after Raven's 2026-11-06 comment."
---

## Finding

The contract-restoration example on two docs pages once failed to parse and could not build a valid
restoration transaction. stellar/stellar-docs PR #3083 (merged 2026-11-10) fixed it. On
2026-11-17 both JavaScript restoration fences parse. The restore-contract fence type-checks with
`@stellar/stellar-sdk` 17.4.0.

One defect remains in the data-restoration guide. The guide tells readers to reuse `submitTx` from
the polling guide. That guide imports `Api` from `@stellar/stellar-sdk/rpc`. The data-restoration
code then declares `const { Api, assembleTransaction } = StellarRpc;`. TypeScript reports
`TS2440` when a reader combines the two code blocks.

## Evidence

The `-js` page paths now answer HTTP 307 to these pages:

- [restore-contract](https://developers.stellar.org/docs/build/guides/archival/restore-contract)
- [restore-data](https://developers.stellar.org/docs/build/guides/archival/restore-data)
- [submit-transaction-wait](https://developers.stellar.org/docs/build/guides/transactions/submit-transaction-wait)
- [state-archival](https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/state-archival)

Fixed on 2026-11-17. `getWasmLedgerKey(data: xdr.LedgerEntryData): xdr.LedgerKey` has a return
type. The caller reads `entries[0].val` from `getLedgerEntries(instance)`. The footprint holds two
`LedgerKey` values. Each fence parses, and the restore-contract fence has 0 type errors with SDK
17.4.0.

Still failing. `restore-data` line 42 declares `Api` again:

```typescript
// submit-transaction-wait, line 38
import { Api, Server } from "@stellar/stellar-sdk/rpc";
// restore-data, line 42
const { Api, assembleTransaction } = StellarRpc;
```

The two fences combined in one module report
`TS2440: Import declaration conflicts with local declaration of 'Api'.` with SDK 17.4.0.

## Recommendation

In `restore-data`, remove `Api` from the local declaration. Use this line:

```typescript
const { assembleTransaction } = StellarRpc;
```

The guide already says to reuse the imports of `submitTx`, which include `Api`.
