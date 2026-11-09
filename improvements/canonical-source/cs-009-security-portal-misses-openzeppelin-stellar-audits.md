---
id: cs-009
service: canonical-source
status: reported-upstream
discovered: 2026-11-02
upstreamTitle: "Portal lists 2 of 8 published OpenZeppelin Stellar Contracts audits; v0.2.0 and v0.5.0 to v0.8.0 are missing"
evidence:
  - "2026-11-09 sweep (still-repro): Portal still has 66 reports and only OpenZeppelin IDs 35 (v0.3.0-rc.2) and 2 (0.1.0). Upstream audits folder still publishes eight PDFs through v0.8.0; Scout mirror still returns the same two reports. New third-party GangDev6707 comment requests assignment and discusses unrelated Redis work; it is neither owner acceptance nor a delivered fix. Recheck: https://stellarsecurityportal.com/api/v1/reports; https://stellarlight.xyz/api/audits?auditor=OpenZeppelin"
  - "2026-11-02T22:03:14Z GET https://stellarsecurityportal.com/api/v1/reports returned 66 reports. The only rows with auditorName 'OpenZeppelin' are id 35 'Stellar Contracts Library v0.3.0-rc.2 Audit' and id 2 'Stellar Contracts Library 0.1.0 Audit'. Review rv-hm 2026-11-02T21:55:54Z got the same 66 reports and the same two OpenZeppelin rows."
  - "2026-11-02T22:03:14Z gh api repos/OpenZeppelin/stellar-contracts/contents/audits lists 8 PDFs: 'Stellar Contracts Library 0.1.0-RC Audit.pdf', 'v0.2.0 Audit.pdf', 'v0.3.0-rc.2 Audit.pdf', 'v0.5.0 Audit.pdf', 'v0.5.0 Re-Audit.pdf', 'v0.6.0 Audit.pdf', 'v0.7.0 Audit.pdf', 'v0.8.0 Audit.pdf'. gh api repos/OpenZeppelin/stellar-contracts/releases/latest: v0.8.0, published 2026-10-20T16:58:32Z."
  - "Mirror: 2026-11-02T22:03:14Z GET https://stellarlight.xyz/api/audits?auditor=OpenZeppelin returned the same two rows, with reportUrl https://stellarsecurityportal.com/report/35 and https://stellarsecurityportal.com/report/2. Review rv-hm 2026-11-02T21:51:07Z: counts.matched 2. Stellar Light/Scout OpenAPI 1.9.116 /api/audits: 'One row per security-audit report from stellarsecurityportal.com... a project ABSENT here has no audit on record at our source.' Scout repeats the portal faithfully; the gap is in the portal."
  - "2026-11-02 GET https://stellarlight.xyz/api/research?q=OpenZeppelin Stellar Contracts v0.5.0 audit returned only the 0.1.0 and v0.3.0-rc.2 audit chunks (review rv-hm re-ran it at 21:51:34Z with the same result)."
  - "Owner: 2026-11-02T22:03:17Z gh api repos/Inferara/soroban-security-portal: public, not archived, has_issues true. Its description is 'Unified knowledge base of Soroban common vulnerabilities and best practices', and its homepage is https://stellarsecurityportal.com."
  - "Dedupe 2026-11-02T22:03:17Z: gh issue list -R Inferara/soroban-security-portal --state all for 'OpenZeppelin' and 'stellar contracts' found per-report vulnerability-entry tasks for other vendors (#103 to #111) and no request for the OpenZeppelin Stellar Contracts reports. Stellar-Light/stellarlight open #562 is a generic coverage watch. Resolved sls-003, sls-064, sls-070, and sls-074 cover Scout audit corpus quality, engagement metadata, and exact IDs, not portal coverage."
  - ".agents/TODO.md 'File the HackMeridian upstream findings' items R17 and R23. Golden follow-up: TODO item 'Add golden cases for the confirmed HackMeridian gaps' (R23)."
  - upstream issue filed 2026-11-02: https://github.com/Inferara/soroban-security-portal/issues/256
recurrences:
  - date: 2026-11-09
    evidence: "Portal still has 66 reports and only OpenZeppelin IDs 35 (v0.3.0-rc.2) and 2 (0.1.0). Upstream audits folder still publishes eight PDFs through v0.8.0; Scout mirror still returns the same two reports. New third-party GangDev6707 comment requests assignment and discusses unrelated Redis work; it is neither owner acceptance nor a delivered fix."
  - date: 2026-11-06
    evidence: "2026-11-06 still-repro: GET portal/api/v1/reports; GH OZ audits folder/release; Scout audit mirror — Portal still only OZ reports35(v0.3.0-rc.2) and2(0.1.0), versus8 published PDFs includingv0.8.0. Scout repeats2. Two contributor assignment comments are not owner acceptance or delivered PR. Evidence/owner state: .agents/rounds/2026-11-05-truth-maintenance/other.md, row cs-009."
---

## Finding

The Stellar Security Portal lists 2 audit reports for the OpenZeppelin Stellar Contracts library: 0.1.0 and v0.3.0-rc.2.
The `OpenZeppelin/stellar-contracts` repository publishes 8 audit reports in its `audits/` folder.
Six reports are not in the portal: v0.2.0, v0.5.0, the v0.5.0 re-audit, v0.6.0, v0.7.0, and v0.8.0.

The newest listed report is v0.3.0-rc.2 from mid-2025.
The current release is v0.8.0, published 2026-10-20, and its audit is public.
A reader who asks the portal for the latest audit of the library gets a report from 15 months earlier.

Stellar Light/Scout reads its audit registry from the portal and repeats the same two rows.
The fix in the portal also corrects that registry.

## Evidence

Read-only reproduction:

```sh
curl -sS https://stellarsecurityportal.com/api/v1/reports
gh api repos/OpenZeppelin/stellar-contracts/contents/audits --jq '.[].name'
curl -sS 'https://stellarlight.xyz/api/audits?auditor=OpenZeppelin'
```

## Recommendation

Ingest the six missing OpenZeppelin Stellar Contracts reports from `https://github.com/OpenZeppelin/stellar-contracts/tree/main/audits`.
The missing reports are v0.2.0, v0.5.0, the v0.5.0 re-audit, v0.6.0, v0.7.0, and v0.8.0.
