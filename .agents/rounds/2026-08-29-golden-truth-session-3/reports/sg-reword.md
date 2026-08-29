# Sourcing-guard rewords report

Worker: `gt3-sol-b`

Date: `2026-08-29`

## Results

- `q-defi-oracle-landscape-live`: Reworded the specified avoid item. Kept all key facts and other avoid items unchanged. Re-fetched the official provider page. The page lists `Reflector Network`, `Band`, and `DIA Oracles`. The sibling sweep found no contradiction.
- `q-tool-go-sdk-ingest`: Reworded the specified avoid item. Kept all key facts and other avoid items unchanged. The official documentation names `github.com/stellar/go-stellar-sdk/ingest`. The GitHub API lists `ingest/README.md` and `ingest/ledgerbackend`. The sibling sweep found no contradiction.
- `q-defi-market-making-kelp`: Reworded the specified avoid item. Kept all key facts and other avoid items unchanged. The GitHub API reports `"archived": true` and `"pushed_at": "2023-11-03T05:46:15Z"`. The SDF blog names Kelp as an open-source market-making and trading bot. Added the required `confirmed-as-of` corroboration row. The Kelp sibling sweep found no contradiction.

Each case now has the required verification date, worker text, evidence, and root cause. The Kelp dead-provenance line already had a live repair. No new dead-provenance repair was required.

The matrix entry was appended before the case edits.

## Verification

Command:

```text
node eval/qa/lint-corpus.mjs --since origin/main 2>&1 | grep -E "ERROR|q-defi-oracle-landscape-live|q-tool-go-sdk-ingest|q-defi-market-making-kelp"
```

Result: The filtered output was empty. It contained no `ERROR` or `[gospel]` result.
