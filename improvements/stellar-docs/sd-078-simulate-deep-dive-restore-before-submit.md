---
id: sd-078
service: stellar-docs
status: verified
discovered: 2026-11-02
upstreamTitle: simulateTransaction deep dive says archived entries need a restore step first; Protocol 23 restores them in place
evidence:
  - "2026-11-02T21:26:10Z GET https://developers.stellar.org/docs/build/guides/transactions/simulateTransaction-Deep-Dive.md returned HTTP 200. The 'Handling Archived Ledger Entries' section says: \"When a ledger entry is archived, it needs to be restored before the transaction can be submitted. This is indicated in the `restorePreamble` field of the result.\" The use-case list says: \"Restoring Archived Ledger Entries or Contract Code: To prepare and restore archived data before actual transaction submission.\" The page has no Protocol 23 qualifier and does not mention automatic restoration or `archivedSorobanEntries`."
  - "stellar/stellar-docs main 85d2d1b8e7a4451b7a6af0931f587ce73109b816 docs/build/guides/transactions/simulateTransaction-Deep-Dive.mdx line 171 carries the same sentence. The last three commits to the file (70b9fa42 #2979 2026-11-02, 700ed32d #2941 2026-10-22, abd0066f #2409 2026-07-21) did not change this section."
  - "2026-11-02T21:26:00Z Raven stellarDocs.search_docs 'restorePreamble restore then retry archived entry Protocol 23' returned the deep-dive page as hit 3 with the snippet 'When a ledger entry is archived, it needs to be restored before the transaction can be submitted. This is indicated in the `restorePreamble` field of the result.' The search surfaces the stale guidance next to the corrected archival guides."
  - "2026-11-02T21:24:12Z GET https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/state-archival.md: \"Starting in Protocol 23 ... archived `Persistent` or `Instance` contract entries can be automatically restored before a host function runs, but only if they're included in the transaction's restore list. In practice, this list is usually populated by the contract invocation simulation\" and \"`RestoreFootprintOp` is, for the most part, no longer needed starting in Protocol 23\". Predecessor finding sd-007 (resolved 2026-07-27, stellar/stellar-docs#2620) fixed this page but did not reach the deep-dive guide."
  - "stellar/stellar-rpc main c436cd7ddf cmd/stellar-rpc/internal/integrationtest/simulate_transaction_test.go: the manual restore test skips with \"Protocols > 22 support autorestore and generally don't require manual restoring\"; TestSimulateTransactionAutoRestore asserts `require.Nil(t, response.RestorePreamble)` and `require.NotEmpty(t, transactionData.Ext.ResourceExt.ArchivedSorobanEntries)`. CHANGELOG: \"Auto-restoration for transactions that have expired footprints (#463)\"."
  - "Adjacent wording 2026-11-02T21:24:12Z: https://developers.stellar.org/docs/build/guides/archival/restore-data-js.md says archived entries \"are automatically restored when they appear in a footprint during `InvokeHostFunctionOp`\". The state-archival page says a footprint key that is not in the restore list fails the transaction, so the condition is the restore list, not the footprint alone."
  - "Adjacent omission: https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/simulateTransaction.md documents `restorePreamble` (\"indicates that the simulation detected archived ledger entries which need to be restored before the submission\") and has no mention of automatic restoration or of `archivedSorobanEntries` in the returned transaction data."
  - "Dedupe 2026-11-02: gh search issues stellar/stellar-docs 'restorePreamble' returned no results; 'simulateTransaction deep dive' returned #1856 (open, generic guide update), #2964 (closed, funding helper), and no issue about archived-entry handling. No improvements/ finding or resolved.json entry names the deep-dive page."
  - "Golden consumers (partial caps naming this finding): eval/qa/corpus/battery/soroban/q-sor-p23-auto-restore-extendto.json, eval/qa/corpus/battery/soroban/q-sor-force-fast-archival-localnet.json, eval/qa/corpus/battery/soroban/q-sor-ttl-defaults-extend.json, eval/qa/corpus/battery/soroban/q-soroban-storage-types.json."
---

## Finding

The simulateTransaction deep-dive guide tells readers that an archived ledger entry must be
restored before the transaction can be submitted, and that `restorePreamble` signals this. Its
example builds a separate `RestoreFootprint` transaction and then retries.

Since Protocol 23, this is not the normal path. Simulation adds archived Persistent and Instance
entries to the transaction's restore list (`archivedSorobanEntries`). The same
`InvokeHostFunction` transaction restores them and then runs. Current Stellar RPC returns no
`restorePreamble` in that case. A manual `RestoreFootprintOp` is a rare fallback.

The state-archival page and the restore guides already say this. The deep-dive guide does not, so
the official docs give two different answers to the same question. A reader or a model that finds
the deep-dive page first builds an extra transaction or waits for a `restorePreamble` that does not
come.

## Evidence

```sh
curl -s https://developers.stellar.org/docs/build/guides/transactions/simulateTransaction-Deep-Dive.md | grep -n "needs to be restored before the transaction can be submitted"
curl -s https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/state-archival.md | grep -n "no longer needed starting in Protocol 23"
curl -s https://raw.githubusercontent.com/stellar/stellar-rpc/main/cmd/stellar-rpc/internal/integrationtest/simulate_transaction_test.go | grep -n "RestorePreamble\|ArchivedSorobanEntries\|autorestore"
```

## Recommendation

1. In `docs/build/guides/transactions/simulateTransaction-Deep-Dive.mdx`, rewrite "Handling
   Archived Ledger Entries". State that since Protocol 23 simulation puts archived entries in the
   restore list and the same invocation restores them. Keep the `restorePreamble` example as the
   manual fallback for a transaction that is too large or for a payer who wants to restore
   separately, and link the state-archival "Contract Data Automatic Restoration" section.
2. In the use-case list item 5, say "restore archived data automatically in the invocation, or
   manually when needed".
3. In `restore-data-js`, change "when they appear in a footprint" to "when simulation includes
   them in the transaction's restore list".
4. On the simulateTransaction method page, add one sentence to `restorePreamble`: since Protocol
   23 it is normally absent, because the returned `transactionData` lists archived entries for
   automatic restoration.
