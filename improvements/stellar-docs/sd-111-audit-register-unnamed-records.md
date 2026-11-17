---
id: sd-111
service: stellar-docs
status: verified
discovered: 2026-11-17
upstreamTitle: "The stellar.org audit register titles 4 of 77 records Unnamed record, so a project-name search cannot find them"
evidence:
  - "2026-11-17 GET https://stellar.org/audit-bank/projects returned HTTP 200. The page is titled \"Security Audited Projects\". Its meta description reads \"Browse security-audited Soroban smart contracts from Stellar Community Fund projects.\" Its data names the collection \"audits\" and reports total 77, 12 records per page, 7 pages."
  - "2026-11-17 GET https://stellar.org/api/collections/audits?page=1&locale=en through page=7 (the endpoint the page loads) returned 77 distinct records. Four titles start with \"Unnamed record\": audit-recE9SyJrESqxO9VO (Certora Ltd, 2023-11-13, https://www.certora.com/reports/blend), audit-recwvHNnj7iJRDFrp (Certora Ltd, 2025-02-03, https://www.certora.com/reports/blend-smart-contract-verification-report), audit-recVvSfnpl1PXfHaL (Certora Ltd, Code4rena / Zellic, 2025-03-17, the same Certora URL), and audit-recm9Dovfv5WWeQjL (OtterSec, 2024-02-29, an OtterSec Notion index page). The other 73 titles have the form \"Project - Firm\"."
  - "The report URLs of three records contain the word blend. The fourth URL names no project. Probe output: .agents/rounds/2026-11-16-next-phase/items/1.3/probes/stellarorg-audit-register.json"
  - "2026-11-17 GET https://stellar.org/api/search?q=Unnamed%20record&locale=en returned the same four records as kind audit. GET https://stellar.org/api/search?q=Blend%20audit&locale=en returned one partner row (Blend), one case study, and one solutions page, and no audit record. A query for a named project, for example q=Slender, returns that project's record."
  - "Supporting source for the project names: Scout GET /api/audits?project=blend (via scout.listAudits, 2026-11-17) returns six Blend reports dated 2023-12-31 to 2025-08-13 on stellarsecurityportal.com. It is not the register's data, and it is not the requested fix."
  - "Classification: site-content. The register page undertakes to let a reader browse audited projects. A record with no project name cannot serve that task. The stellar.org page copy has no public issue tracker, so intake.json marks this finding unclear (precedent: sd-077)."
  - "Not posted: the stellar.org page copy has no public tracker, so no public owner can receive this finding. It stays verified until the owner forwards it."
---

## Finding

The stellar.org audit register at `https://stellar.org/audit-bank/projects` gives 4 of its 77
records the title "Unnamed record". Each title has the form "Unnamed record - <Firm>". The other 73
titles have the form "<Project> - <Firm>".

Three of the four records link a report whose URL contains `blend`. Those records belong to Blend
by their own evidence. The register does not say so. A search for "Blend audit" returns no audit
record. A search for "Unnamed record" returns the four.

A reader or a tool that looks up the audits of one project by name cannot find these records. The
register undertakes to let readers browse audited projects, so a record without a project name does
not do that job.

## Evidence

Read-only reproduction:

```sh
for n in 1 2 3 4 5 6 7; do
  curl -sS "https://stellar.org/api/collections/audits?page=$n&locale=en"
done                                     # 77 records; 4 titles start "Unnamed record"
curl -sS 'https://stellar.org/api/search?q=Unnamed%20record&locale=en'   # the four records
curl -sS 'https://stellar.org/api/search?q=Blend%20audit&locale=en'      # no audit record
```

The four records:

| id | firm | date | report URL |
|---|---|---|---|
| audit-recE9SyJrESqxO9VO | Certora Ltd | 2023-11-13 | `https://www.certora.com/reports/blend` |
| audit-recwvHNnj7iJRDFrp | Certora Ltd | 2025-02-03 | `https://www.certora.com/reports/blend-smart-contract-verification-report` |
| audit-recVvSfnpl1PXfHaL | Certora Ltd, Code4rena / Zellic | 2025-03-17 | `https://www.certora.com/reports/blend-smart-contract-verification-report` |
| audit-recm9Dovfv5WWeQjL | OtterSec | 2024-02-29 | an OtterSec Notion index page (no project in the URL) |

Scout lists six Blend audit reports for `project=blend`. That list shows the project is known
outside the register.

## Recommendation

Name the project in each of the four records. For the three Certora records, "Blend - Certora Ltd"
fits the existing title form. The report URL is the evidence that the project is known. For the
OtterSec record, name the audited project in the title as well.

Optional: reject a record without a project name when it is added to the register.
