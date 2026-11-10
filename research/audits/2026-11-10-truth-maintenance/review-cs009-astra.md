# Independent review: cs-009 retirement

Verdict: **fixed (retire)**. The six originally missing reports are deployed and publicly readable. All six newly served PDFs are byte-for-byte identical to their corresponding upstream PDFs. Scout lists all eight audits, the original research query finds the added reports, and a fresh latest-audit query ranks v0.8.0 first. No material successor is needed for the finding's coverage/latest-audit defect.

Reviewer: Codex, independent session `t3kv`; coordinator/author-side recheck was Claude Opus `t2dn`. This review used fresh direct HTTP and GitHub API reads, not the coordinator's evidence. Scope was read-only outside `tmp/`. No repository source edits, commits, GitHub posts, or paid evals were performed.

This is clearance of the live-fix evidence, **not a claim that retirement cleanup has already happened**. The author still must perform the resolver/comment/reference steps below.

## Observation and upstream resolution

Original reproduction began **2026-11-10T22:53:02Z**. HTTP detail/page/PDF checks completed by 22:54:11Z; the additional latest-audit query was generated at 22:55:02Z. Raw evidence is under `tmp/rv-cs009-evidence/`.

Read directly with:

```sh
gh api repos/Inferara/soroban-security-portal/issues/256 --jq .body
gh api repos/Inferara/soroban-security-portal/issues/256 --jq '{state,state_reason,closed_at,closed_by:.closed_by.login}'
gh api repos/Inferara/soroban-security-portal/issues/256/comments --jq '.[] | {html_url,author:.user.login,author_association,created_at,body}'
```

[Issue #256](https://github.com/Inferara/soroban-security-portal/issues/256) is closed, reason `completed`, closed by **SurfingBowser** at **2026-11-10T06:51:57Z**. The [closing comment](https://github.com/Inferara/soroban-security-portal/issues/256#issuecomment-6761071173) is by SurfingBowser with association `COLLABORATOR`. It says the reports were uploaded, automated scans were updated to catch future OpenZeppelin reports, and another team member's approval was needed before they became visible. Earlier third-party assignment requests do not establish a fix.

Deployment is independently established by public report retrieval: IDs 85–90 now have `status: approved`, `createdBy: 8`, `lastActionBy: 7`, with last actions from **12:18:59.240926Z through 12:19:38.173067Z** on November 10. This establishes visibility after the closing comment. I did not independently audit the claimed automation change or identify the numeric user IDs.

## Fresh original trigger

Executed the finding's three commands, saving the complete responses:

```sh
curl -sS https://stellarsecurityportal.com/api/v1/reports
gh api repos/OpenZeppelin/stellar-contracts/contents/audits --jq '.[].name'
curl -sS 'https://stellarlight.xyz/api/audits?auditor=OpenZeppelin'
```

The portal returns **73 reports total; exactly 8 OpenZeppelin Stellar Contracts rows**. All eight have the expected protocol name and approved status:

| Portal ID | Exact title | API date (UTC) |
|---|---|---|
| 90 | Stellar Contracts Library v0.8.0 Audit | 2026-10-20T06:39:26.554Z |
| 89 | Stellar Contracts Library v0.7.0 Audit | 2026-04-26T06:38:30.186Z |
| 88 | Stellar Contracts Library v0.6.0 Audit | 2026-01-07T06:37:30.468Z |
| 87 | Stellar Contracts Library v0.5.0 Re-Audit | 2025-10-23T06:36:01.953Z |
| 86 | Stellar Contracts Library v0.5.0 Audit | 2025-10-28T06:32:47.761Z |
| 85 | Stellar Contracts Library v0.2.0 | 2025-07-03T06:20:17.286Z |
| 35 | Stellar Contracts Library v0.3.0-rc.2 Audit | 2025-07-09T15:00:00Z |
| 2 | Stellar Contracts Library 0.1.0 Audit | 2025-02-20T15:00:00Z |

`gh api repos/OpenZeppelin/stellar-contracts/contents/audits` still returns eight PDFs, all of which were downloaded successfully from their returned `download_url`. `gh api repos/OpenZeppelin/stellar-contracts/releases/latest` returns [v0.8.0](https://github.com/OpenZeppelin/stellar-contracts/releases/tag/v0.8.0), published **2026-10-20T16:58:32Z**. The eight upstream filenames and correspondence are:

| Portal ID | Upstream PDF | Comparison |
|---|---|---|
| 90 | Stellar Contracts Library v0.8.0 Audit.pdf | Identical SHA-256 and bytes |
| 89 | Stellar Contracts Library v0.7.0 Audit.pdf | Identical SHA-256 and bytes |
| 88 | Stellar Contracts Library v0.6.0 Audit.pdf | Identical SHA-256 and bytes |
| 87 | Stellar Contracts Library v0.5.0 Re-Audit.pdf | Identical SHA-256 and bytes |
| 86 | Stellar Contracts Library v0.5.0 Audit.pdf | Identical SHA-256 and bytes |
| 85 | Stellar Contracts Library v0.2.0 Audit.pdf | Identical SHA-256 and bytes |
| 35 | Stellar Contracts Library v0.3.0-rc.2 Audit.pdf | Older web-print representation; matching engagement/scope, see residual review |
| 2 | Stellar Contracts Library 0.1.0-RC Audit.pdf | Older web-print representation; matching engagement/scope, see residual review |

## Pages, report bodies, and PDF identity

For **each** ID 2, 35, 85, 86, 87, 88, 89, 90:

- `https://stellarsecurityportal.com/report/<id>` returned HTTP 200. These are the SPA's 502-byte HTML shell, so that status alone was not treated as proof of report content or browser rendering.
- `https://stellarsecurityportal.com/api/v1/reports/<id>` returned HTTP 200 JSON with the correct ID/title and nonempty extracted Markdown report content.
- The deployed JavaScript exposes `/api/v1/reports/<id>/download` as the report PDF link. Every download returned HTTP 200, `Content-Type: application/pdf`, and `%PDF` bytes. List responses have empty `binFile`/`mdFile`; detail `binFile` is null, which does not mean the download is absent.

The six new reports match the upstream PDFs exactly:

| ID | Bytes | SHA-256 |
|---|---:|---|
| 85 | 244344 | `59fa25010851fbcad18cd69f2a4d2cedd0e03b23fa720c150f64fc355e6d336d` |
| 86 | 356261 | `5e9949eddbcdd38f1c7651f405c5205d7c1af90ff1bec21d35a5607f1b14a600` |
| 87 | 228320 | `8f89a6a71ff1c3a9c4530f58e0b0a17d45ab8b1fe2779b887c8bd3a6725c6451` |
| 88 | 220051 | `769b01596bc2ed0e7f00f4bd605c59c4df83fda6cffd045eb7c8fb181d8bf2af` |
| 89 | 318495 | `9514b16815e853d656e0f284fb8d82b98135c04b394595f3c3f97e68804f40f5` |
| 90 | 285901 | `52cff3150ad82eea6c62d4ff564c79149952b98c17d1cddc05fb2964fe5764d0` |

Full URLs, timestamps, HTTP results, byte counts, and identities are retained in `fetch-results.json` and `pdf-comparison.json`. The upstream GitHub contents response also retains each Git blob SHA. All PDFs parsed successfully with `pypdf`; text extracts are beside them. No rendered-browser/UI assertion is made.

## Scout mirror and research search

The [audits query](https://stellarlight.xyz/api/audits?auditor=OpenZeppelin) has `counts.total: 71`, `matched: 8`, `returned: 8`. All eight corresponding report IDs are present, with correct portal links. New reports have `observedAt: 2026-11-10T14:14:06.651Z` and nonzero indexed chunks: 85→10, 86→16, 87→8, 88→7, 89→13, 90→11. Scout's global total differs from the portal's 73; that does not leave any OpenZeppelin report missing, and this review does not assert global mirror parity.

Fresh reproduction of the research search:

```sh
curl -sS -G 'https://stellarlight.xyz/api/research'   --data-urlencode 'q=OpenZeppelin Stellar Contracts v0.5.0 audit'
```

At **22:53:23.447Z**, this returned eight results, in report-ID order **86, 87, 2, 85, 89, 88, 90, 35**. Thus both v0.5.0 reports now lead the results, and all eight audits are discoverable. `meta.partial: false`, `failedReads: []`. This is vector similarity search, not a claim of literal exact matching.

Additional adjacent check:

```sh
curl -sS -G 'https://stellarlight.xyz/api/research'   --data-urlencode 'q=latest OpenZeppelin Stellar Contracts library audit'
```

At **22:55:02.304Z**, the first result is [report 90, v0.8.0](https://stellarsecurityportal.com/report/90), with October 20, 2026 metadata. No partial-read warning. The audit PDF cover is October 20, 2026, and the scope identifies base `fbfde38` and target `a5bd8cb`. The report concerns audited snapshots/RC scope, not blanket certification of every library release or downstream application.

## Residual review

No missing new PDF, wrong-version link, or wrong latest-audit answer was found. The following bounded metadata/representation caveats do **not** justify a material successor to cs-009:

1. **v0.7.0 date mismatch:** portal ID 89 and Scout say **2026-04-26**, while the identical upstream/downloaded PDF cover and portal extracted text say **April 6, 2026**. This is a real 20-day metadata discrepancy. Correcting it would be useful; it neither hides the audit nor changes which library audit is latest. Do not describe the metadata as flawless.
2. **v0.2.0 title:** ID 85 omits the final word “Audit”; its PDF identity is exact and version unambiguous.
3. **Original reports are older web-print copies:** ID 2 is 392,956 bytes/13 pages versus the upstream 186,078-byte/14-page PDF; ID 35 is 1,882,232 bytes/32 pages versus 345,818 bytes/34 pages upstream. They are not byte-identical. Scope matches (`01dbcb5` for 0.1.0; `cf05a5d` against `d3741c3` for v0.3.0-rc.2), with approximately 95% normalized word-sequence similarity. The main differences are typography, headings, issue-number prefixes, pagination, and the ID 35 web-print's unrelated related-post/site-footer text. ID 2 uses “0.1.0” where upstream says “0.1.0-RC”; the body describes the release candidate. This is not evidence of swapped reports.
4. **Older dates differ by representation:** ID 2 metadata February 20 agrees with upstream PDF, while the web-print says February 21. ID 35 metadata July 9 differs from upstream July 8 and web-print July 10. Record the source when reporting dates; these pre-existing differences do not change latest-audit selection.
5. **v0.5.0 audit/re-audit dates look inverted but match the source PDFs:** regular audit October 28, re-audit October 23, 2025. The portal did not swap their PDFs. Do not invent a correction based only on the names.
6. New Scout rows have null engagement/version fields and `dateBasis: portal-record`; version is still explicit in the title and linked source. This review does not claim those optional fields were enriched.

A character-level comparison of the two older PDFs was stopped when it became slow; completed word-level comparisons, scope checks, full text extraction, and exact-byte checks for all six newly added files support the conclusions above. No audit-content security review was attempted.

## Persistent references and reconciliation

Ran the requested `rg -n 'cs-009' . --glob '!node_modules/**'` (13 matching lines) and an additional hidden-path scan so `.agents/` was not skipped (27 matching lines). Raw outputs are `tmp/rv-cs009-evidence-refs-default.txt` and `tmp/rv-cs009-evidence-refs-hidden.txt`. The latter excluded `.git/`, `node_modules/`, and temporary review artifacts. Every persistent file hit is listed below.

| Persistent file and matching lines | Retirement treatment |
|---|---|
| `improvements/canonical-source/cs-009-security-portal-misses-openzeppelin-stellar-audits.md`: 2, 21 | Update with fresh fix evidence, then delete through resolver after handoff gates. No probe frontmatter exists. |
| `improvements/INDEX.md`: 117 | Regenerate; remove active row, never edit by hand. |
| `improvements/intake.json`: 250 | Remove the per-finding override through resolver. |
| `research/audits/2026-11-03-qa-followup/case-dispositions.json`: 132, 135, 2023, 2026, 3125, 3127, 10073 | Preserve dated snapshot bytes/hashes. Its README explicitly preserves original historical references. Explain in the current retirement ledger/receipt that these paths are historical and resolve through Git/source snapshot, not the active collection. |
| `research/audits/2026-11-09-improvements-sweep/lane-docs.md`: 15, 115 | Preserve dated still-repro evidence; current ledger supersedes it. |
| `.agents/rounds/2026-11-02-upstream-filing.md`: 101 | Preserve historical filing record. |
| `.agents/rounds/2026-11-02-upstream-followup.md`: 34 | Preserve historical contributor-activity observation. |
| `.agents/rounds/2026-11-03-upstream-sweep/state.md`: 34, 93 | Preserve dated state table; do not rewrite past observations. |
| `.agents/rounds/2026-11-03-upstream-sweep/report.md`: 13, 78 | Preserve dated report. |
| `.agents/rounds/2026-11-03-demo-createai/report.md`: 75 | Preserve historical ID-allocation note; resolved IDs remain reserved. |
| `.agents/rounds/2026-11-05-truth-maintenance/other.md`: 27 | Preserve dated still-repro evidence; current retirement ledger closes its next-check event. |
| `.agents/rounds/2026-11-05-truth-maintenance/other-actions.json`: 83, 84 | Preserve historical action packet/path, with Git/receipt available for lookup. |
| `.agents/rounds/2026-11-06-remaining-sweep/other.md`: 78 | Preserve dated still-repro evidence; current retirement ledger supersedes its next-check event. |
| `.agents/rounds/2026-11-06-remaining-sweep/other-actions.json`: 179, 180 | Preserve historical action packet/path. |
| `.agents/rounds/2026-11-09-improvements-sweep.md`: 19 | Preserve historical sweep summary. |

No literal `cs-009` reference exists in `eval/`, `.agents/TODO.md`, or `improvements/resolved.json` at review time. The resolved receipt must be added during retirement.

The required `rg -n 'HackMeridian' .agents/TODO.md` returns lines **846** (section) and **899** (golden follow-up). The “File the HackMeridian upstream findings” item named in the finding is no longer present. Current relevant queue text:

- Lines 899–924 retain “Add golden cases for the confirmed HackMeridian gaps”; its November 3 proposal notes already map **R23 to `q-soroban-oz-token`**. Remaining activation holds concern R20 and Q18, not cs-009. Do not delete that whole task when retiring this finding.
- The release-source task starting at line 854 includes R23, but it concerns live release/package data and is broader than audit ingestion. Portal repair does not prove that task complete.
- `eval/qa/corpus/battery/soroban/q-soroban-oz-token.json` already cites v0.8.0 and upstream audits, scopes audit claims to releases, and has `truth.verified.rootCause: ["freshness-drift"]`. It contains no cs-009 cap, missing-audits premise, or finding-file link. **No golden edit is required for this retirement.**
- `eval/qa/consistency-register.json` references that case at lines 235/260 and 2431/2443, but not cs-009. With no golden change, no member hash update is required. Lifecycle/generated case files also have no cs-009 dependency.

## Remaining author-side retirement gates

This brief forbids repository edits and external posts, so these are verified prerequisites for the coordinator, not work claimed complete here:

1. Add the dated live result and this distinct review evidence; use `fixed-upstream` transiently as required by the resolver.
2. Post the resolution comment on issue #256 with the live result and a commit-pinned source snapshot, then read it back. Existing upstream comments contain the maintainer closure but no Raven live-verification retirement comment. The issue body already has immutable source snapshot `56803bcfc0f6e585641f0fcf444e734a3f6d9bef`; use the reviewed source revision appropriate to the final record.
3. Run resolver dry-run, then resolver; verify file deletion, intake removal, regenerated index, and a complete `improvements/resolved.json` receipt including issue #256, this review, recheck, and reference disposition. Do not reuse cs-009.
4. Record the historical-reference dispositions above in the current round ledger and run required improvements gates. There is no material successor and no golden/register repair required.

Repository baseline was ` M inventory/stellar-docs.json`; this unrelated existing change was not touched. At final status, concurrent work also showed modifications to `scripts/summarize-live-drift.mjs`, `test/summarize-live-drift.test.mjs`, and a new `.agents/rounds/2026-11-10-truth-maintenance.md`; none were edited by this reviewer. The review itself changes only `tmp/`. Code/unit/build tests are not applicable to this read-only evidence review.
