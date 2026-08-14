---
id: ll-012
service: lumenloop
status: reported-upstream
discovered: 2026-07-10
evidence:
  - live broad search_directory query for real-world assets returned 10 rows
  - broad results included planned DTCC while omitting several primary-confirmed live issuers/products
  - exact-name probes could retrieve Benji, WisdomTree, Figure, Spiko, and Etherfuse records
  - Solo scratchpad 575 GT-11 primary process 3231
  - https://github.com/lumenloop/lumenloop-backend/issues/29
recurrences:
  - date: 2026-08-11
    evidence: "Broad RWA search still omits five exact-name records and lacks product state; issue #29 remains open."
  - date: 2026-08-14
    evidence: "Content-absence instance for a live RWA product. lumenloop.search_content_semantic('WisdomTree CRDT tokenized private credit fund on Stellar', types articles/research/av/events, limit 6) returned 24 rows and no CRDT or CRDYX row. lumenloop.search_documents({collection:'articles', query:'CRDT'}) and the same call for 'CRDYX' each returned zero items. lumenloop.get_project({slug:'wisdomtree'}) returns only the WisdomTree Prime record, with empty mainnet.tokens. scout.searchResearch for both terms returned no exact match. The product is canonically confirmed: WisdomTree IR release 2025-09-12, the SEC prospectus, and https://stellar.wisdomtree.com/.well-known/stellar.toml. Issue #29 remains open."
---

## Finding

Broad Lumenloop RWA discovery mixes planned and live product states and has
weak recall for major currently live Stellar products. A live broad
search_directory query for real-world assets returned ten rows and included
planned DTCC work, while omitting several headline live issuers/products that
exact-name probes can retrieve.

The omitted broad-query set includes primary-confirmed current examples such as
Benji/Franklin Templeton, WisdomTree, Figure YLDS, Spiko/Amundi, and Etherfuse
Stablebonds. Directory inclusion also does not distinguish an entity from a
specific live Stellar-issued product.

## Evidence

The audit ran broad and exact-name directory probes on 2026-07-10. Exact-name
queries located the named entities, and operator/issuer primary records plus
independent current corroboration established product state. DTCC's primary
record says its Stellar connection is targeted for H1 2027.

This is a search/state-model finding, not proof that the omitted records are
absent from Lumenloop.

## Recommendation

Improve RWA synonym/semantic recall and expose product-level network deployment
state with asOf and primary provenance. Broad results should distinguish:

- live issued products;
- announced/planned integrations;
- stablecoins;
- infrastructure/tooling; and
- unverified/RWA-adjacent candidates.

Add a regression query for "real-world assets on Stellar." It should retrieve
multiple primary-confirmed live issuers while labeling DTCC planned, and must
not imply exhaustive coverage from a ten-row directory result.
