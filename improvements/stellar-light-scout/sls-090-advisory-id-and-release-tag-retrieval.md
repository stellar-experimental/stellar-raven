---
id: sls-090
service: stellar-light-scout
status: verified
discovered: 2026-10-09
upstreamTitle: Research search misses exact SDK advisory IDs and a published release tag
evidence:
  - 2026-10-09 Scout API 1.9.72; https://stellarlight.xyz/api/status
  - 2026-10-09 exact CVE and GHSA queries with limit 10; https://stellarlight.xyz/api/research?q=CVE-2026-24889&limit=10; https://stellarlight.xyz/api/research?q=GHSA-96xm-fv9w-pf3f&limit=10
  - 2026-10-09 release-scoped queries with limit 25; https://stellarlight.xyz/api/research?q=GHSA-96xm-fv9w-pf3f&source=release&limit=25; https://stellarlight.xyz/api/research?q=rs-soroban-sdk%20v25.0.2&source=release&limit=25
  - 2026-10-09 current GitHub advisory and v25.0.2 release; https://api.github.com/repos/stellar/rs-soroban-sdk/security-advisories/GHSA-96xm-fv9w-pf3f; https://api.github.com/repos/stellar/rs-soroban-sdk/releases/tags/v25.0.2
---

## Finding

Research search returns adjacent documents for `CVE-2026-24889` and `GHSA-96xm-fv9w-pf3f`.
The tested results contain neither identifier.
A release-scoped query for `rs-soroban-sdk v25.0.2` returns other versions and omits that release.
Readers cannot retrieve the named patch release or its advisory through these queries.

These are bounded retrieval misses.
They do not prove that the entire research corpus lacks the advisory or release.
The API identifies its results as vector matches and does not claim literal matches.

## Evidence

Public reads on 2026-10-09 used Scout API `1.9.72`:

```sh
curl 'https://stellarlight.xyz/api/research?q=CVE-2026-24889&limit=10'
curl 'https://stellarlight.xyz/api/research?q=GHSA-96xm-fv9w-pf3f&limit=10'
curl 'https://stellarlight.xyz/api/research?q=GHSA-96xm-fv9w-pf3f&source=release&limit=25'
curl 'https://stellarlight.xyz/api/research?q=rs-soroban-sdk%20v25.0.2&source=release&limit=25'
```

Every read returned HTTP `200`, `meta.partial: false`, and an empty `failedReads` list.
The first two reads each returned ten documents without the named advisory.
Both release-scoped reads returned 25 documents without the advisory ID or `v25.0.2` release.
The release query first returned `v27.0.2` and `v25.3.2`.
Its source reports `221` documents.

The [primary advisory](https://github.com/stellar/rs-soroban-sdk/security/advisories/GHSA-96xm-fv9w-pf3f) identifies `CVE-2026-24889`.
It lists patched branches `25.0.2`, `23.5.1`, and `22.0.9`.
The [published v25.0.2 release](https://github.com/stellar/rs-soroban-sdk/releases/tag/v25.0.2) links the same advisory.
Its publication timestamp is `2026-01-28T05:38:49Z`.
The advisory publication timestamp is `2026-01-28T06:38:43Z`.
Those dates describe the source records, not the start of Scout's retrieval defect.

A control query for `rs-soroban-sdk v25.3.2` retrieved that exact release first.
A conceptual overflow query returned nearby security material without the named advisory.
These controls separate service availability from exact-identifier recovery.

The retired `sls-019` covers CAP identifiers.
The retired `sls-071` and `sls-074` cover audit finding identifiers.
The audit-identifier fix added an `exactMiss` signal.
The tested CVE and GHSA query responses have no `exactMiss` key in `meta`.
Those receipts do not cover SDK advisory IDs or release tags.
No active finding covers this specific source and identifier gap.

## Recommendation

Add exact recovery for CVE IDs, GHSA IDs, and repository-qualified release tags.
Match identifiers in release metadata, source URLs, and linked advisory records.
Return the named document first when it exists.
Extend the existing `exactMiss` signal to CVE IDs, GHSA IDs, and release tags.
When exact recovery fails, return that signal and identify semantic alternatives separately.

Keep the current vector-match warning.
Do not describe semantic results as proof that an advisory does not exist.
Add regression checks for a published security release and an absent identifier.
