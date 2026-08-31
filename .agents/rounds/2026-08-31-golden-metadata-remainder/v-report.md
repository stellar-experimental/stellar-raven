# Lane V verification report

## Deterministic checks

| Check | Pass | Fail | Total |
| --- | ---: | ---: | ---: |
| c1: no prohibited temporary paths | 54 | 0 | 54 |
| c2: required verification metadata | 47 | 7 | 54 |
| c3: Live re-check count equals keyFacts | 50 | 4 | 54 |
| c4: sibling sweep present | 54 | 0 | 54 |
| c5: P1-D corroboration and disposition | 6 | 1 | 7 |

Failures:

- q-eco-stellar-wallets-list: c2: `truth.verified.rootCause` lacks `.agents/TODO.md — Replace expired temporary evidence in golden truth metadata`
- q-pc-protocol-27-zipper: c2: `truth.verified.rootCause` lacks `.agents/TODO.md — Replace expired temporary evidence in golden truth metadata`
- q-ti-freighter-localhost-not-detected: c2: `truth.verified.rootCause` lacks `.agents/TODO.md — Replace expired temporary evidence in golden truth metadata`; c3: live=4, keyFacts=5
- q-comp-finclusive-caas: c2: `truth.verified.rootCause` lacks `.agents/TODO.md — Replace expired temporary evidence in golden truth metadata`; c3: live=4, keyFacts=3; c5: classBar=false, landed=true, newRows=1
- q-protocol-base-reserve-min-balance: c2: `truth.verified.rootCause` lacks `.agents/TODO.md — Replace expired temporary evidence in golden truth metadata`
- q-protocol-ledger-close-time: c2: `truth.verified.rootCause` lacks `.agents/TODO.md — Replace expired temporary evidence in golden truth metadata`; c3: live=3, keyFacts=2
- q-tool-soroban-auth-audit-live: c2: `truth.verified.rootCause` lacks `.agents/TODO.md — Replace expired temporary evidence in golden truth metadata`; c3: live=3, keyFacts=4

## URL re-walk

Fetched 52 URL records. 51 returned HTTP 200. 40 claims had matching page text. 1 page was unrendered. 11 records failed or lacked a phrase.

URLs that failed, lacked a phrase, or were unrendered:

- q-protocol-ledger-close-time: https://horizon.stellar.org/ledgers?order=desc&limit=200 — status 200; found=false; claim: two independent 199-delta samples: min 5 / max 7 / median 6 s and min 5 / max 9 (one delta) / median 6 s.; quote: NOT-FOUND-ON-PAGE
- q-scf-sdf-marketing-grant: https://stellar.org/grants-and-funding/marketing-grants — status 200; found=false; claim: the current dedicated page supported the program facts.; quote: NOT-FOUND-ON-PAGE
- q-scf-sdf-marketing-grant: https://stellar.org/grants-and-funding/marketing-grants — status 200; found=false; claim: the page still showed the changeable $500,000 cap.; quote: NOT-FOUND-ON-PAGE
- q-defi-wisdomtree-crdt: https://www.sec.gov/Archives/edgar/data/1859001/000121465925013564/wtd98250485bpos.htm — status 403; found=false; claim: makes the transfer-agent book entry official and describes wallet approval.; quote: NOT-FOUND-ON-PAGE
- q-defi-wisdomtree-crdt: https://horizon.stellar.org/assets — status 200; found=false; claim: returns CRDT SAC CBQDK4Y3B2RYUSXE6JYYTHB6AIW655FPGE4OW7A2BWDZXZ5RALQ3UK3P for the exact issuer query.; quote: NOT-FOUND-ON-PAGE
- q-eco-stellar-rwa-stablecoin-volume: https://stellar.org/blog/foundation-news/q1-2026-execution-at-network-scale — status 200; found=false; claim: shows Q1 2026 and publication date 2026-05-07.; quote: NOT-FOUND-ON-PAGE
- q-eco-stellar-rwa-stablecoin-volume: https://stellar.org/blog/foundation-news/q1-2026-execution-at-network-scale — status 200; found=false; claim: the dated quarterly scope requires a staleness warning for current use.; quote: NOT-FOUND-ON-PAGE
- q-defi-soroswap-vs-stellarx: https://github.com/soroswap/docs — status 200; found=false; claim: the owner README separates AMM contracts, aggregation, and API routing.; quote: NOT-FOUND-ON-PAGE
- q-defi-soroswap-vs-stellarx: https://www.stellarx.com/legal/terms — status 200; found=unrendered; claim: StellarX remains a non-custodial user interface for the Classic decentralized exchange.; quote: UNRENDERED: raw HTML has no usable visible text; phrase not found.
- q-crp-sdp-operation: https://developers.stellar.org/docs/platforms/stellar-disbursement-platform/admin-guide/design-and-architecture — status 200; found=false; claim: current observations come from a dated page.; quote: NOT-FOUND-ON-PAGE
- q-crp-sdp-operation: https://developers.stellar.org/docs/platforms/stellar-disbursement-platform — status 200; found=false; claim: the product page supports an explicit observation date.; quote: NOT-FOUND-ON-PAGE
- q-scf-vs-sdf-enterprise-fund: https://stellar.org/enterprise-fund/apply — status 200; found=false; claim: the current Enterprise page still exposed an application route.; quote: NOT-FOUND-ON-PAGE

Overall verdict: FAIL-WITH-LIST
