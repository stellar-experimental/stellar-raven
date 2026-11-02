---
id: sd-076
service: stellar-docs
status: verified
discovered: 2026-11-02
upstreamTitle: Re-crawl the Stellar Docs Algolia index after the Mintlify migration; records predate 2026-10-22
evidence:
  - 2026-11-02T17:20:19Z Raven stellarDocs.get_doc_page_sections path /docs/build/guides/freighter returned one record with breadcrumb "Freighter Wallet > Freighter Wallet" and content "Freighter is a browser extension wallet provided by the Stellar Development Foundation."
  - 2026-11-02T17:17:27Z GET https://developers.stellar.org/docs/build/guides/freighter returned HTTP 200 with title "Varial Wallet" and "Varial (formerly Freighter) is a browser extension wallet provided by the Stellar Development Foundation."
  - 2026-11-02T17:19:51Z Raven stellarDocs.search_docs "Varial" returned only "variables" pages; "state archival freighter-api install" returned the state-archival record "Freighter API - npm install @stellar/freighter-api", while the live page says "Varial SDK - npm install @stellar/varial-sdk"
  - 2026-11-02T17:20:48Z Raven stellarDocs.get_doc_page_sections path /docs/build/guides/storage/storage-strategies returned the appendix record "Protocol 27, checked 2026-07-20"; the live page says "checked 2026-10-22" and lists "Dependent transaction clusters 3"
  - 2026-11-02T17:19:51Z Raven stellarDocs.search_docs "dependent transaction clusters" returned no storage-strategies hit; "ledgerMaxDependentTxClusters" was soft-empty
  - 2026-11-02T17:20:19Z Raven stellarDocs.search_docs "Horizon is considered deprecated" returned the api-explorer record with the pre-migration text "Horizon is nearing end-of-life"; the live card says "Horizon is considered deprecated."
  - stellar/stellar-docs main 7cb5e8a492706d2ae95bbb14be737fbf96100058; commits 700ed32d (Mintlify migration, 2026-10-22T18:00:55Z), d16cf103 (storage-strategies SLP-0007 update, 2026-10-22T23:08:47Z), and de385430 (Varial rename, 2026-10-29T16:11:40Z)
  - 2026-11-02 the rendered Mintlify pages carry no algolia or docsearch reference, so the site search no longer reads this index
  - golden cases q-tool-freighter-wallet, q-eco-freighter-wallet, q-ti-freighter-localhost-not-detected, q-ti-connect-wallet-button-code, q-protocol-parallel-execution, and q-infra-horizon-vs-rpc (golden audit pass 2, 2026-11-02)
---

## Finding

The Stellar Docs Algolia index still serves page text from before the Mintlify migration of
2026-10-22. No checked change from 2026-10-22 or later is in the index.

The live site moved to Mintlify on 2026-10-22. The rendered pages no longer load Algolia
DocSearch. The index still exists, and Raven and other API clients still query it. Records for
changed pages still carry the old text:

- The Freighter guide record says "Freighter Wallet" and "Freighter is a browser extension
  wallet". The live page says "Varial (formerly Freighter)". A search for "Varial" finds no
  Varial page.
- The state-archival dapp guide record says `npm install @stellar/freighter-api`. The live page
  says `npm install @stellar/varial-sdk`.
- The storage-strategies appendix record says "Protocol 27, checked 2026-07-20". The live page
  has the SLP-0007 values, including "Dependent transaction clusters 3". A search for
  "dependent transaction clusters" does not return that page.
- The Lab API Explorer record carries the pre-migration card text. It does not carry the
  current card text.

This is a `docs-search` finding. Suitable current content exists on the live pages.

## Evidence

On 2026-11-02, `stellarDocs.get_doc_page_sections` for `/docs/build/guides/freighter` returned
one record. Its breadcrumb is "Freighter Wallet > Freighter Wallet". The live page at the same
time had the title "Varial Wallet".

The Varial rename landed in stellar/stellar-docs commit `de385430` on 2026-10-29. The
storage-strategies SLP-0007 update landed in commit `d16cf103` on 2026-10-22. The Mintlify
migration landed in commit `700ed32d` on 2026-10-22. The index has none of these changes.

The storage-strategies appendix record reads "Protocol 27, checked 2026-07-20. Network validators
can change these values". The live appendix reads "checked 2026-10-22" and describes SLP-0007.
Live Mainnet `ledger_max_dependent_tx_clusters` is 3 (`stellar network settings --network
mainnet`, 2026-11-02T17:19:29Z).

The rendered Freighter and API Explorer pages contain zero `algolia` or `docsearch` strings.

## Recommendation

Run the crawler against the Mintlify site now, and schedule it again. The crawler must read the
current page structure. The index must carry the Varial rename and the SLP-0007 appendix after
the crawl.

If the docs team retires the Algolia index, announce a replacement search endpoint for API
clients. Then retire the index, so that clients do not read a frozen copy.

Smallest recheck: search the index for "Varial". A current index returns the Varial Wallet guide.
