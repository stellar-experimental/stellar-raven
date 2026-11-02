Raven rechecked sd-003 on 2026-11-02, after the move to Mintlify (#2941). The original trigger no longer reproduces.

Live recheck (Mintlify search and page API, 2026-11-02):

- A search for `getTransactions API reference limit` ranks `/docs/data/apis/rpc/api-reference/methods/getTransactions` first.
- That page states "The limit for getTransactions can range from 1 to 200" and "defaults to 50".
- The generated `getEvents`, `getLedgers`, and `simulateTransaction` method pages are also in the search index.
- The per-method limits table that #2572 added to the Pagination page survived the migration.

The crawler-inclusion request in this issue is now moot: the Algolia crawler is retired, and the Mintlify index includes the generated method pages. Source: stellar/stellar-docs@700ed32d0b2bac10e265cdc5fb1a4b70671ab130 (#2941).

This issue can be closed with #2572 and #2941 as the resolving changes. Raven is retiring its sd-003 record. Immutable source snapshot: https://github.com/stellar-experimental/stellar-raven/blob/ac0663fe5b04cf81cd0f5cc972b66fdee071adfb/improvements/stellar-docs/sd-003-rpc-method-reference-pages-unindexed.md
