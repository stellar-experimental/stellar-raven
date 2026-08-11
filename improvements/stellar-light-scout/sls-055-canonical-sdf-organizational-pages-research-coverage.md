---
id: sls-055
service: stellar-light-scout
status: reported-upstream
discovered: 2026-07-13
evidence:
  - 2026-07-13 production source-ceiling audit over four owned SDF-organizational QA cases, using Scout research/projects/builders, Lumenloop semantic/entity/A-V, and Stellar Docs search; solo://proj/49/scratchpad/sdf-organizational-s--630
  - q-org-sdf-structure-mandate: no exposed source returned the current Mandate page's self-funded/pays-taxes wording or the Terms page's Delaware nonprofit wording, while direct live reads did
  - q-org-sdf-enterprise-fund: exposed results returned historical portfolio scalars but not the current Enterprise Fund page's venture-style description and portfolio-totaling-over-$100m wording
  - boundary controls: Scout retrieved current mandate-bucket labels from an SDF blog and historical Chief Scientist/SCP material, showing that routing and blog/paper ingestion work while canonical non-blog page coverage is the residual
  - 2026-07-14 targeted QA q-org-mazieres-chief-scientist covered the required broad/detail plan but found historical title/SCP material without current canonical Team-page role, founder, and Stanford context
  - 2026-07-14 normalized-semantic generality round still left Justin Rice partial on both playground and main MCP because neither retrieved the live Team-page title as a dated observation
  - upstream issue filed 2026-07-13 America/New_York (2026-07-14 UTC): https://github.com/Stellar-Light/stellarlight/issues/533
  - 2026-07-15 live recheck on spec 1.7.26 returned the canonical Team page top-ranked for source=sdf-org with David Mazières as Founder and Chief Scientist, Justin Rice as VP of Ecosystem, and observedAt 2026-07-15T08:01:44.242Z; Mandate, Terms, Enterprise Fund, and Quarterly Reports remained covered
  - closed-unfixed verification posted and read back 2026-07-15: https://github.com/Stellar-Light/stellarlight/issues/533#issuecomment-4982290851
recurrences:
  - date: 2026-07-14
    evidence: eval/qa/results/2026-07-14T03-29-01-variantA.json scored q-org-mazieres-chief-scientist wrong after five on-plan calls; the answer promoted a 2014-2015 Chief Scientist title as timeless current and omitted canonical founder/professor context
  - date: 2026-07-14
    evidence: the reopened playground generality artifact and eval/qa/results/2026-07-14T13-10-10-variantA.json both retrieved Justin Rice history but missed the live Team-page role and observation date
  - date: 2026-07-14
    evidence: source=sdf-org now covers Mandate, Terms, Enterprise Fund, Team, Foundation, and report pages, but the Team page's embedded leadership-role text (Founder and Chief Scientist; VP of Ecosystem) is still absent and records lack per-record crawl-observation dates
  - date: 2026-07-15
    evidence: Team, Mandate, and Terms coverage now passes, but the canonical Enterprise Fund page's portfolio-totaling-over-$100m claim remains absent from an exact source=sdf-org query
  - date: 2026-08-04
    evidence: eval/qa/results/2026-08-04T21-12-30-variantA.json q-scf-academic-research-grant repeatedly searched exact research-grant vocabulary but did not retrieve https://research.stellar.org/research-grants or its eligibility, quarterly-deadline, $150K-cap, and two-submissions/year facts
  - date: 2026-08-04
    evidence: eval/qa/results/2026-08-04T21-45-25-variantA.json q-scf-vs-sdf-enterprise-fund said there was no public application despite the live canonical Enterprise Fund form, reproducing the non-blog page-family coverage gap
  - ref health 2026-07-27: https://github.com/Stellar-Light/stellarlight/issues/533 closed completed 2026-07-14 and the residual verification was posted after closure, so issue 533 no longer tracks the remaining gap; a consolidated successor issue carries it
  - consolidated successor issue filed 2026-07-27 carrying this residual on an open thread: https://github.com/Stellar-Light/stellarlight/issues/742
  - date: 2026-08-11
    evidence: Production API 1.8.41 returns canonical Mandate, Terms, Team, and Enterprise Fund URLs for source=sdf-org queries and quotes the first three named claims, but the exact Enterprise Fund query does not expose its live portfolio-totaling-over-$100m wording; open #742 has no newer maintainer activity
---

## Finding

Scout research does not reliably expose quotable canonical SDF organizational pages.
Its broad cited-research lane routes SDF-organizational questions correctly, but it
does not reliably expose quotable sections from canonical non-blog
`stellar.org` pages. This is a source-family coverage gap rather than another
named-person or keyword-ranking miss.

Two independent owned-QA failures reproduce the ceiling. For SDF's legal and
funding structure, all exposed research, project, builder, semantic, A/V, and
Docs searches missed the current Mandate page's statements that SDF is
self-funded and pays taxes and the Terms page's Delaware-nonprofit wording.
For the Enterprise Fund, the same broad fan-out returned older portfolio
figures but not the current page's venture-style description and
portfolio-totaling-over-$100m statement. Direct live reads of the canonical
pages contained those facts.

The gap extends beyond those two probes: the family also depends on Foundation,
Team, current and historical Mandate, Quarterly Reports, and related
organization pages. Some adjacent claims are already retrievable from SDF blog
articles or papers, so per-query synonyms would hide the underlying page-family
omission and create uneven coverage.

## Evidence

The 2026-07-13 production audit exercised every currently exposed broad family:
`scout.searchResearch`, `scout.searchProjects`, `scout.getBuilders`,
`lumenloop.search_content_semantic`, `lumenloop.find_content_by_entity`,
`lumenloop.find_av_passages`, and `stellarDocs.search_docs`. It then compared
the results with direct live reads of:

- `https://stellar.org/foundation`
- `https://stellar.org/foundation/team`
- `https://stellar.org/foundation/mandate`
- `https://stellar.org/foundation/mandate/2019`
- `https://stellar.org/enterprise-fund`
- `https://stellar.org/terms-of-service`

The exact per-case result counts, claim classifications, counterargument, and
independent trigger adjudication are recorded in the internal audit ledger.
Existing `sls-006`
already covers SDF blog article-body ingestion, and `sls-052` covers routing
vocabulary; neither covers canonical non-blog organizational pages.

## Recommendation

Add a general canonical-SDF-site source family to `searchResearch` (for
example `sdf-site`) and ingest the substantive sections of non-blog
organizational pages and canonical SDF subdomains, including Foundation, Team,
current and historical Mandate, Enterprise Fund, Quarterly Reports, Terms, and
`research.stellar.org/research-grants`. Preserve canonical URL,
page/update date when present, crawl observation time, section heading, and
verbatim text. Exclude navigation/listing boilerplate and retain rendered-page
semantics when embedded page data differs from visible content.

Guard the source family with representative claim probes across legal
structure, current fund scope, leadership-page rendering, historical mandate
labels, and report discovery. The fix should be corpus-wide and
provenance-bearing; do not implement per-person aliases, per-question ranking
rules, or a Raven-only duplicate endpoint.
