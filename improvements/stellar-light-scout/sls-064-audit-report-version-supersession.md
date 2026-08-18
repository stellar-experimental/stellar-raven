---
id: sls-064
service: stellar-light-scout
status: verified
discovered: 2026-08-14
upstreamTitle: Audit rows carry no relation metadata, so multiple reports for one protocol and auditor cannot be told apart
evidence:
  - 2026-08-14 live scout.listAudits({limit:100}) returned 58 rows, meta.generatedAt 2026-08-14T05:53:38.598Z, with four (protocol, auditor) pairs holding two rows each and 50 groups holding one row
  - 2026-08-14 confirmed shared engagement - a report/42 chunk reads "From Oct. 30, 2023 to Dec. 22, 2023, Stellar Development Foundation engaged Veridise to review the security of their Stellar Soro", and report/28 carries the same window with the title "Auditing Report for Soroban Stellar Soroban Core V2"
  - 2026-08-14 both Veridise Soroban Core rows carry the same critical finding - report/28 chunks show "V-SOR-VUL-002 DenialofService During Authorization" with commit 2674d86, and report/42 chunks show the same severity, commit 2674d86, file rs-soroban-env/src/auth.rs, and location require_auth_enforcing, with no finding identifier in the chunk text
  - 2026-08-14 the Veridise pair reports publishedAt 2025-09-26 for reportId 42 and 2024-01-02 for reportId 28, and findingsTotal 7 for reportId 42 and null for reportId 28
  - 2026-08-14 the three other pairs are ambiguous on the returned fields alone - Blend Protocol V2 / Certora (reportId 40 "Security Assessment DRAFT v3", reportId 51 "Blend v2 - Formal Verification"), OpenZeppelin Stellar Contracts Library / OpenZeppelin (reportId 35, reportId 2), and Allbridge Estrela / Quarkslab (reportId 16 titled "Allbridge Estrela | 2025", reportId 15 titled "Allbridge Estrela | 2024")
  - 2026-08-14 scout.searchResearch for the exact string "V-SOR-APP-VUL-003" returned no chunk containing that identifier, while the same query shape for "V-SOR-VUL-002" returned the exact finding chunk
  - eval round 2026-08-14, main stamp 2026-08-14T03-56-23-variantA, row q-soroban-auth-recursion-dos-audit
  - Solo scratchpad 809, todo 1539 shard and todo 1550 root correction round
recurrences:
  - date: 2026-08-18
    evidence: live listAudits returned 58 rows at meta.generatedAt 2026-08-18T14:14:34.747Z. Reports 28 and 42 now share engagementId veridise-soroban-core-2023q4 and the same engagement dates, while report 28 carries reportVersion V2. The three other duplicate protocol and auditor pairs still have null engagementId, reportVersion, supersededByReportId, engagementStart, and engagementEnd. All rows now carry findingsExtraction, so the relation-metadata fix remains partial.
---

## Finding

`listAudits` returns one row per audit report. Four `(protocol, auditor)` pairs
hold two rows each. Multiple reports for one protocol and one auditor are
legitimate. A re-audit, a revision, and a separate yearly engagement are all
normal.

The defect is the missing relation. No returned field says which case applies.
A consumer cannot tell a revision from an independent engagement, cannot tell
which report is current, and cannot tell whether the two rows should be counted
once or twice.

**One pair is a confirmed shared engagement.** Veridise and Stellar Soroban Core
appear as report 42 and report 28. A report/42 chunk states the engagement
window as "From Oct. 30, 2023 to Dec. 22, 2023". Report 28 carries the same
window and is titled "Auditing Report for Soroban Stellar Soroban Core V2". Both
rows carry the same critical finding against commit 2674d86, the same file
`rs-soroban-env/src/auth.rs`, and the same location `require_auth_enforcing`.
The two rows describe one engagement and are not linked.

**Three pairs are ambiguous on the returned fields alone.** Allbridge Estrela and
Quarkslab hold rows titled "Allbridge Estrela | 2025" and "Allbridge Estrela |
2024", which read like two separate yearly engagements. Blend Protocol V2 and
Certora hold a "Security Assessment DRAFT v3" row and a "Blend v2 - Formal
Verification" row, which read like two different work products. OpenZeppelin
Stellar Contracts Library holds reports 35 and 2 with no distinguishing title.
None of these is asserted here to be a duplicate. Each needs the same relation
metadata before a consumer can classify it.

**Two secondary gaps ride on the same pair.**

`publishedAt` is 2025-09-26 for report 42 and 2024-01-02 for report 28, for an
engagement that ended in December 2023. The later value is ambiguous rather than
wrong: it may be a re-publication date, a portal re-listing date, or an ingest
date. The schema exposes `dateBasis`, but the returned rows give a consumer no
way to separate the engagement period from the publication event.

`findingsTotal` is 7 for report 42 and null for report 28. The documented
semantics say null means not extracted, not zero. A consumer comparing the pair
still sees an unexplained asymmetry across one engagement, with no field
recording why one row was extracted and the other was not.

**Identifier retrieval.** Finding identifiers appear in report 28 chunks and not
in report 42 chunks. A search for the exact string `V-SOR-VUL-002` reaches the
finding. A search for an identifier the corpus does not hold returns
section-classification boilerplate instead of a clear miss. A caller therefore
cannot map a finding identifier to a report version, and cannot distinguish an
absent identifier from a weak semantic match.

## Evidence

The enumeration call and the chunk lookups ran on 2026-08-14 against
`https://stellarlight.xyz/api/audits` and the research corpus.

Grouping the 58 returned rows by lowercase `(protocol, auditor)` produced four
groups with two rows each and 50 groups with one row.

## Recommendation

Add relation metadata to each audit row so a consumer can classify multiple
reports for one protocol and auditor. Three fields are enough:

- `engagementId`, shared by every report of one engagement and distinct for
  separate engagements;
- `reportVersion`, for example "V1" or "V2", null when the source states none;
  and
- `supersededByReportId`, null when the row is current.

Populating these for the Veridise Soroban Core pair resolves the confirmed case
and lets the three ambiguous pairs be classified rather than guessed.

Separate the engagement period from the publication event. Expose
`engagementStart` and `engagementEnd` when the report states them, and keep
`publishedAt` for the publication or listing date. Keep `dateBasis` populated so
a consumer can see which event the date describes.

Preserve every known `findingsTotal`. Do not null a populated value to make a
pair symmetric. Add a completeness field instead, for example
`findingsExtraction` with values such as `extracted`, `not-extracted`, or
`partial`, plus the provenance of the extraction. A consumer can then read 7 and
null as different states of knowledge rather than as conflicting counts.

Index the finding identifiers for every report version. A caller that searches
an exact identifier should reach the finding. A caller that searches an
identifier the corpus does not hold should receive an explicit miss rather than
section-classification boilerplate.
