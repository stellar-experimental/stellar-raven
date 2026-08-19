---
id: sls-070
service: stellar-light-scout
status: verified
discovered: 2026-08-19
upstreamTitle: Clarify supersession between the two Veridise Soroban Core audit reports
evidence:
  - 2026-08-19 live scout.listAudits returned report 28 and report 42 with engagementId veridise-soroban-core-2023q4
  - report 28 carries reportVersion V2, while both rows carry supersededByReportId null
  - both reports cover the same 2023-10-30 through 2023-12-22 engagement and the same critical authorization finding
  - this is the residual successor to resolved finding sls-064
---

## Finding

Scout now assigns an `engagementId` to every repeated protocol and auditor
group. This resolves the broad relation-metadata defect in `sls-064`.

One relationship remains unclear. Reports 28 and 42 share
`engagementId: veridise-soroban-core-2023q4`. Report 28 carries
`reportVersion: V2`. Both rows carry `supersededByReportId: null`.

The contract does not state whether V2 replaces report 42. It also does not
state whether both reports remain independent work products.

## Evidence

The 2026-08-19 live inventory contains both rows. Their engagement dates and
critical authorization finding match. Only report 28 declares a version.

## Recommendation

Set `supersededByReportId` when one report replaces another. Otherwise, state
that both reports remain independent work products.

