---
id: sls-074
service: stellar-light-scout
status: reported-upstream
discovered: 2026-08-25
upstreamTitle: Include appendix audit identifiers in exact-match indexing
evidence:
  - 2026-08-25 live GET https://stellarlight.xyz/api/research?q=V-SOR-APP-VUL-003&limit=2 returned meta.exactMiss.identifiers containing V-SOR-APP-VUL-003 and instructed callers not to report it as found
  - the Veridise V2.1 primary report contains V-SOR-APP-VUL-003 in Appendix A.2.2 for Denial of Service During Authorization: https://veridise.com/wp-content/uploads/2025/02/VAR_Stellar_Soroban.pdf
  - the portal-owned V2.1 record contains the same exact appendix heading and identifier: https://stellarsecurityportal.com/api/v1/reports/42
  - independent primary-source reviews on 2026-08-25 confirmed the identifier, Critical and Investigated labels, and invalid disposition
  - successor to sls-071 because the exact-miss mechanism shipped, but its verbatim identifier index excludes this real appendix identifier
  - 2026-08-25 consumer-side truth guards updated in eval/qa/corpus/battery/soroban/q-soroban-auth-recursion-dos-audit.json and eval/qa/corpus/battery/tooling-infra/q-tool-soroban-auth-audit-live.json
  - upstream issue filed 2026-08-25: https://github.com/Stellar-Light/stellarlight/issues/1031
---

## Finding

Scout reports `V-SOR-APP-VUL-003` as an exact miss. The Veridise V2.1 report
contains that exact identifier in Appendix A.2.2 for `Denial of Service During
Authorization`.

The response tells a caller that no indexed chunk carries the identifier and
that the caller must not report it as found. This is a confident false negative
for a real historical audit item.

Scout can retrieve adjacent content from the same report. The missing match is
therefore specific to the identifier index or its appendix-heading coverage.

## Evidence

On 2026-08-25, `GET /api/research?q=V-SOR-APP-VUL-003&limit=2` returned
`meta.exactMiss.identifiers: ["V-SOR-APP-VUL-003"]`. Its note said that the
indexed corpus contains no chunk with the identifier and instructed the caller
not to report it as found.

The auditor-owned V2.1 PDF lists `V-SOR-APP-VUL-003: Denial of Service During
Authorization` in the table of contents and Appendix A.2.2. The portal-owned
report 42 record contains the same appendix heading. Both sources retain the
`Critical` and `Investigated` labels and the invalid-disposition analysis.

This finding does not dispute the exact-miss mechanism for truly absent
identifiers. `V-SOR-APP-VUL-999` correctly returns an exact miss. The defect is
that the presence check uses an incomplete identifier index.

## Recommendation

Build the exact-match identifier index from valid findings and appendix
findings. Include table-of-contents and appendix headings when the report body
uses them as the canonical finding location.

Return `meta.exactMiss` only after that complete index does not contain the
requested identifier. Add `V-SOR-APP-VUL-003` as a regression control that must
resolve to the V2.1 appendix item.
