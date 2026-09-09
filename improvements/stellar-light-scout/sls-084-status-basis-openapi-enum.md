---
id: sls-084
service: stellar-light-scout
status: reported-upstream
discovered: 2026-09-08
upstreamTitle: The project response returns package-release outside the documented statusBasis enum
evidence:
  - 2026-09-08 fresh OpenAPI 1.9.48 read still contains zero `package-release` strings; SHA-256 2f042393eec673f80b661b65c5e6e11c4af10b7f2496b6d530e3bb7aa70f9639. `GET /api/projects/search?q=ACTA&limit=10` returned ACTA with `statusBasis: package-release`; response SHA-256 aaa020196f71250c4034572c30427915c0506dd3bbeb9bf75453b296dfac4f34.
  - 2026-09-08 live OpenAPI 1.9.48 read from https://stellarlight.xyz/api/openapi.json; SHA-256 2f042393eec673f80b661b65c5e6e11c4af10b7f2496b6d530e3bb7aa70f9639. The document contains zero package-release strings.
  - The original 2026-09-08 complete seven-category scan paged all 981 searchable project rows. Nine rows returned statusBasis package-release: ACTA, AXIS, Blockaid, Cypher, DeFarm, Drips, Fundable, Smart Treasury, and Unstoppable Wallet. The normalized scan summary has SHA-256 ec1c00760efb7b268bea71ca18909eeea860d007226f5bbd372927d678569c20.
  - Direct name searches reproduced package-release on all nine rows between 2026-09-08T17:55:14.136Z and 2026-09-08T17:55:19.369Z. Each row also returned a dated npm registry statusSourceUrl.
  - independent population review: .agents/rounds/2026-09-08-improvements-followups/sls024-review-sol.md
  - upstream issue filed 2026-09-09: https://github.com/Stellar-Light/stellarlight/issues/1530
---

## Finding

The project response returns a `statusBasis` value that the OpenAPI enum omits.
The original 2026-09-08 population scan found nine rows with `package-release`.
The fresh ACTA check reproduced that value.
The `Project.statusBasis` enum lists eight other values.
The full OpenAPI document does not contain `package-release`.

A generated client can reject these valid live responses.
A strict validator can also treat the nine rows as malformed.

## Evidence

On 2026-09-08, the original scan covered 981 searchable rows and 981 unique IDs.
The scan paged each category with the documented `limit=100` cap.
Nine rows used `package-release`, which was 0.92% of that scanned population.

All nine rows supply a package registry URL as `statusSourceUrl`.
Their `statusAsOf` values range from 2025-11-17 through 2026-09-07.
Direct searches by project name reproduced each value after the population scan.

OpenAPI 1.9.48 lists `operator-announcement`, `site-liveness`, `repo-activity`,
`product-integration`, `onchain-activity`, `human-verified`, `source-inherited`,
and `unverified` in `Project.statusBasis`.
It omits the value returned by the service.

## Recommendation

Add `package-release` to the `Project.statusBasis` enum and its description.
Define the value as package publication evidence without deployment proof.
Add a contract test that compares every served basis with the OpenAPI enum.
Keep the response model and OpenAPI schema from one value set.
