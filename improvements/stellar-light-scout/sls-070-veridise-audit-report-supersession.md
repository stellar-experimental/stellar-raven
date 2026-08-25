---
id: sls-070
service: stellar-light-scout
status: fixed-upstream
discovered: 2026-08-19
upstreamTitle: Clarify supersession between the two Veridise Soroban Core audit reports
evidence:
  - 2026-08-19 live scout.listAudits returned report 28 and report 42 with engagementId veridise-soroban-core-2023q4
  - report 28 carries reportVersion V2, while both rows carry supersededByReportId null
  - both reports cover the same 2023-10-30 through 2023-12-22 engagement and the same investigated authorization item labeled Critical; neither valid-vulnerability summary counts a Critical issue
  - this is the residual successor to resolved finding sls-064
  - upstream issue filed 2026-08-19: https://github.com/Stellar-Light/stellarlight/issues/974
  - 2026-08-25 live GET https://stellarlight.xyz/api/audits?limit=100 returned report 28 as V2 with supersededByReportId 42 and report 42 as V2.1 with no successor; both retain engagementId veridise-soroban-core-2023q4
  - 2026-08-25 primary-source recheck: https://stellarsecurityportal.com/api/v1/reports/28 labels the historical authorization-recursion item V-SOR-VUL-002 Critical and Investigated; https://veridise.com/wp-content/uploads/2025/02/VAR_Stellar_Soroban.pdf moves the same item to V-SOR-APP-VUL-003 under Invalid Issues, while both report dashboards count zero valid Critical vulnerabilities
---

## Finding

Scout now assigns an `engagementId` to every repeated protocol and auditor
group. This resolves the broad relation-metadata defect in `sls-064`.

One relationship remained unclear. Reports 28 and 42 shared
`engagementId: veridise-soroban-core-2023q4`. Report 28 carried
`reportVersion: V2`. Both rows carried `supersededByReportId: null`.

The contract does not state whether V2 replaces report 42. It also does not
state whether both reports remain independent work products.

## Evidence

The 2026-08-19 live inventory contained both rows. Their engagement dates and
investigated authorization item matched. Only report 28 declared a version.

The 2026-08-25 live inventory identifies report 28 as V2, report 42 as V2.1,
and report 42 as the successor to report 28. The primary reports label the
investigated item Critical, while both valid-vulnerability summaries count
zero Critical issues.

## Recommendation

Set `supersededByReportId` when one report replaces another. Otherwise, state
that both reports remain independent work products.
