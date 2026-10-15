---
id: sls-090
service: stellar-light-scout
status: fixed-upstream
discovered: 2026-10-09
upstreamTitle: Research search misses exact SDK advisory IDs and a published release tag
evidence:
  - 2026-10-09 Scout API 1.9.72; https://stellarlight.xyz/api/status
  - 2026-10-09 exact CVE and GHSA queries with limit 10; https://stellarlight.xyz/api/research?q=CVE-2026-24889&limit=10; https://stellarlight.xyz/api/research?q=GHSA-96xm-fv9w-pf3f&limit=10
  - 2026-10-09 release-scoped queries with limit 25; https://stellarlight.xyz/api/research?q=GHSA-96xm-fv9w-pf3f&source=release&limit=25; https://stellarlight.xyz/api/research?q=rs-soroban-sdk%20v25.0.2&source=release&limit=25
  - 2026-10-09 current GitHub advisory and v25.0.2 release; https://api.github.com/repos/stellar/rs-soroban-sdk/security-advisories/GHSA-96xm-fv9w-pf3f; https://api.github.com/repos/stellar/rs-soroban-sdk/releases/tags/v25.0.2
  - upstream issue filed 2026-10-09: https://github.com/Stellar-Light/stellarlight/issues/1809
  - "2026-10-15 author recheck confirmed all four original queries recover the named records. A distinct reviewer remains required before retirement."
  - "2026-10-15T17:42:57Z live OpenAPI reports 1.9.78. https://stellarlight.xyz/api/openapi.json"
  - "2026-10-15 resolving work: https://github.com/Stellar-Light/stellarlight/pull/1815, https://github.com/Stellar-Light/stellarlight/pull/1821, and https://github.com/Stellar-Light/stellarlight/pull/1826."
  - "2026-10-15 upstream merge commits are f9e66babb30f20607c7df749cef89985a9f6c3cd, 24b8c12aaf63f1840b7bd55c56ca4b6ebf2529f9, and 46d6e1ad4c02a4639bbe14ed4736316fb215af5c."
  - "2026-10-15 inbound exactKeys update came from theboycoder: https://github.com/stellar-experimental/stellar-raven/issues/284#issuecomment-6196580657"
  - "2026-10-15T17:42:59Z CVE-2026-24889 returned the named advisory first. GHSA-96xm-fv9w-pf3f did the same at 17:43:00Z."
  - "2026-10-15T17:43:01Z release-scoped GHSA search returned the advisory first. Repository-qualified v25.0.2 search returned its release first at 17:43:02Z."
  - "2026-10-15 original queries returned HTTP 200, partial false, failedReads [], and matching exactKeys. Semantic alternatives carried exactKeys []."
  - "2026-10-15 absent CVE, GHSA, and repository-qualified release controls returned exactMiss. Prefix CVE-2026-2488 did not match CVE-2026-24889."
  - "2026-10-15 fields and multi-source controls retained exactKeys. A page-limit control reported a held identifier without an exactMiss."
  - "2026-10-15 raw responses and exact URLs are in tmp/lane-a/research-*.raw.json. This local evidence is uncommitted."
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

## Live recheck — 2026-10-15

The author repeated all four original requests against OpenAPI `1.9.78`.
Each returned HTTP `200`, `partial: false`, and `failedReads: []`.
The CVE and GHSA queries returned the named advisory first.
The release-scoped GHSA query also returned that advisory first.
The repository-qualified release query returned `rs-soroban-sdk v25.0.2` first.

Rows carrying the requested key included it in `exactKeys`.
Semantic alternatives carried `exactKeys: []`.
The vector-match warning remained present.
Absent CVE, GHSA, and repository-qualified release controls returned `exactMiss`.
The miss note distinguished corpus absence from absence at the primary source.

The truncated CVE control did not match the longer CVE.
The conceptual-query control omitted `exactKeys`.
The fields and multi-source controls retained the row markers.
A page-limit control named an omitted identifier as held, without an `exactMiss`.

The author read the pinned matching, ingestion, and regression-test sources.
The author did not run the upstream test suite.
No material residual reproduced in these live checks.
A distinct reviewer must repeat the original requests before retirement.
