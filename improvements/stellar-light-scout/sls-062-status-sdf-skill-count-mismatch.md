---
id: sls-062
service: stellar-light-scout
status: reported-upstream
discovered: 2026-08-06
upstreamTitle: Scout status reports nine SDF skills while its directory exposes seven
evidence:
  - 2026-08-06 https://stellarlight.xyz/api/status (API 1.8.36) reported count 9 on the sources entry named sdfSkills and described it as proxied from skills.stellar.org
  - 2026-08-06 https://stellarlight.xyz/api/skills?source=sdf returned 7 rows and meta.counts.bySource.sdf 7: agentic-payments, assets, dapp, data, smart-contracts, standards, and zk-proofs
  - 2026-08-06 https://skills.stellar.org/sitemap.xml and https://github.com/stellar/stellar-dev-skill/tree/main/skills exposed the same 7-skill canonical roster
  - the latest canonical commit touching the skills path was 2026-07-20 and already contained the same 7 directories, so the documented 24-hour Scout cache does not explain the 9-vs-7 gap: https://github.com/stellar/stellar-dev-skill/commit/52baea1d8cb1aa9441004ce44b723f55cbc90901
  - independent adversarial live recheck: Solo Todo 1400 comment 3761
  - upstream issue filed 2026-08-06: https://github.com/Stellar-Light/stellarlight/issues/768
---

## Finding

Scout's status endpoint reports nine SDF skills while its filterable skills
directory and the canonical upstream roster each expose seven. The status row
says it is proxied from `skills.stellar.org`, so a consumer cannot reconcile
the extra two with a different documented population.

## Evidence

The current surfaces are:

- https://stellarlight.xyz/api/status
- https://stellarlight.xyz/api/skills?source=sdf
- https://skills.stellar.org/sitemap.xml
- https://github.com/stellar/stellar-dev-skill/tree/main/skills

This is a status-metadata mismatch, not a missing skill-content finding: the
directory and both canonical upstream surfaces agree on the same seven slugs.

## Recommendation

Derive the `sdfSkills` source count from the same population as
`meta.counts.bySource.sdf`, or document the additional counted population if
the difference is intentional. Keep the status cache coherent with the
filterable skills response.
