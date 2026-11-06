---
id: sd-097
service: stellar-docs
status: fixed-upstream
discovered: 2026-11-06
upstreamTitle: Building with AI still describes Raven's Docs backend as Algolia
evidence:
  - "2026-11-06T18:41:02.769856Z ordinary live GET says Stellar Docs (via Mintlify), with no Algolia occurrence. SHA-256 6d5b6d53c7f0abe75c28c40b4d07bec3df92a87e31c722d0dfaf6094d4ab5d35."
  - "Deployed fix: https://github.com/stellar/stellar-docs/pull/3066; root checked the merged PR, passing checks, maintainer approval and ordinary published page."
  - "2026-11-06 follow-up: https://github.com/stellar/stellar-docs/pull/3066 proposes the Mintlify wording correction; checks green, REVIEW_REQUIRED/BLOCKED, not deployed. Bot self-review is not independent maintainer acceptance. Full live/PR evidence: .agents/rounds/2026-11-06-remaining-sweep/docs.md."
  - "2026-11-06 GET https://developers.stellar.org/docs/build/building-with-ai.md returns 'Under the hood it wraps Stellar Docs (via Algolia), Lumenloop, Stellar Light, and ecosystem skills'."
  - "stellar/stellar-docs main 310030b6078a37ed5a1959da4955e516266ac897 docs/build/building-with-ai.mdx contains the same backend name."
  - "Raven commit fec1c79f src/adapters/stellar-docs.ts and specs/stellar-docs.json use Mintlify Discovery search/page endpoints. inventory/stellar-docs.json records the Mintlify backend. ARCHITECTURE.md documents the current transport."
  - "Dedupe: active/resolved improvements and open stellar/stellar-docs Algolia issues checked. sd-003 concerned crawler coverage; sd-059 concerns search ranking; neither owns this architecture sentence."
  - ".agents/rounds/2026-11-05-truth-maintenance/docs.md: distinct adjacent finding discovered while verifying sd-079's completed canonical-host correction."
  - upstream issue filed 2026-11-06: https://github.com/stellar/stellar-docs/issues/3064
---

## Finding

The Building with AI page says Raven reads Stellar Docs through Algolia.
Raven now uses Mintlify Discovery for Docs search and page reads.
The sentence gives readers an outdated description of Raven's source transport.

## Evidence

The live Markdown page and `docs/build/building-with-ai.mdx` both contain `Stellar Docs (via Algolia)`.
Raven's `src/adapters/stellar-docs.ts` and `specs/stellar-docs.json` implement the Mintlify transport.

## Recommendation

Replace `via Algolia` with `via Mintlify`, or omit the backend name.
Keep the source-family list and canonical Raven host unchanged.

## Live fix — 2026-11-06

PR #3066 merged and the ordinary deployed page now says Mintlify.
The previous pending/deployment evidence above records the earlier observation.
Independent retirement review is required before removal.
