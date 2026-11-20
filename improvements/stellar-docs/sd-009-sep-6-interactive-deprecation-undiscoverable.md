---
id: sd-009
service: stellar-docs
status: declined-upstream
disposition: Accept the docs owner's noise/placement decision; retain the canonical SEP status in standards-aware consumer truth and do not re-file without materially new evidence.
discovered: 2026-07-09
evidence:
  - "2026-11-09 sweep (declined): Live Anchors guidance still omits deprecated wording; canonical SEP-6 still explicitly marks its interactive components deprecated in favor of SEP-24. Programmatic SEP-6 remains Active. Recheck: https://developers.stellar.org/docs/learn/fundamentals/anchors.md; https://raw.githubusercontent.com/stellar/stellar-protocol/master/ecosystem/sep-0006.md"
  - eval/qa/reviewed/2026-07-09-improvements-evidence.md (durable redacted row q-sep-6-24-deprecation, wrong; verdict manually reviewed and upheld)
  - stellar/stellar-protocol ecosystem/sep-0006.md live source rechecked 2026-07-09: status is "Active (Interactive components are deprecated in favor of SEP-24)"
  - developers.stellar.org Anchors fundamentals page rechecked 2026-07-09: contrasts SEP-6 programmatic with SEP-24 hosted flows but never surfaces the deprecation status
  - upstream issue filed 2026-07-09: https://github.com/stellar/stellar-docs/issues/2575
  - maintainer response 2026-07-13: https://github.com/stellar/stellar-docs/issues/2575#issuecomment-4962781289 — adding a six-year-old deprecation notice would be noise because the retired SEP-6 interactive components are not otherwise documented on the site
recurrences:
  - date: 2026-11-06
    evidence: "Anchors and SEP6 tutorial/search omit deprecated wording; current canonical SEP still states interactive components deprecated. Repo-wide matching phrase scan empty. Exact URLs and upstream state: .agents/rounds/2026-11-05-truth-maintenance/docs.md, row sd-009"
  - date: 2026-11-02
    evidence: live re-check on the Mintlify docs search after the 2026-10-22 migration: `stellarDocs.search_docs` `SEP-6 interactive components deprecated SEP-24` with includeContent returns the SEP-6 tutorial, anchors fundamentals, SDP get-sep-24-info, Anchor Platform SEP guide, and SEP-10 tutorial; no returned section contains `deprecat`. The gap is content, not the search backend. Ledger: .agents/rounds/2026-11-02-mintlify-migration.md
  - date: 2026-11-02
    evidence: golden audit pass 2 live recheck 2026-11-02T17:26:21Z - Raven stellarDocs.search_docs 'SEP-6 interactive deprecated SEP-24' returned five anchor and SEP pages with no deprecated-status text; a grep of stellar/stellar-docs main 7cb5e8a4 docs/ for 'interactive components are deprecated' and 'deprecated in favor of SEP-24' returns no file. Issue #2575 remains closed not_planned. Owner decision stands; no re-file. Cases q-sep-6-24-deprecation and q-sep6-sep24-sep31-choice.
  - date: 2026-08-11
    evidence: live Docs search for `SEP-6 interactive deprecated SEP-24` still returns no deprecated-status text. Issue #2575 remains closed by the docs owner; the recorded maintainer rationale is ElliotFriend's 2026-07-13 noise-and-placement decision.
  - date: 2026-07-10
    evidence: architecture A/B todo 903 — q-sep-6-24-deprecation remained wrong/partial across the two QA arms, and a fresh live stellarDocs search for `SEP-6 interactive deprecated SEP-24` returned no `deprecated` text
  - date: 2026-07-13
    evidence: post-comment raw Algolia re-check still returned no `deprecated` text for `SEP-6 interactive components deprecated SEP-24`; the exposed stellar-dev standards skill maps SEP-6 to programmatic and SEP-24 to hosted flows but also omits the canonical deprecation status
---

## Finding

The docs omit SEP-6's canonical interactive-component deprecation status.

The canonical SEP-6 specification explicitly says its **interactive components are deprecated in
favor of SEP-24**, while the indexed developer-docs guidance only contrasts SEP-6 as programmatic
with SEP-24 as hosted/interactive. It never carries the specification's deprecation sentence.
Consequently, a docs-search consumer can correctly recommend SEP-24 for interactive flows yet
incorrectly deny that SEP-6's interactive components are deprecated.

This is a discoverability/content-parity gap, not a claim that SEP-6 itself is retired. SEP-6
remains Active for programmatic deposit and withdrawal; only its interactive components are the
deprecated part.

## Evidence

- `stellar/stellar-protocol` `ecosystem/sep-0006.md` begins with `Status: Active (Interactive components are deprecated in favor of SEP-24)`.
- The live Anchors fundamentals page links both SEPs and explains the programmatic-vs-hosted split, with zero `deprecated` language.
- Mintlify search (`stellarDocs.search_docs` for `SEP-6 interactive components deprecated SEP-24`, 2026-11-02) and a `stellar/stellar-docs` tree grep find no deprecation sentence.

## Recommendation

Accept the Docs owner's decline on #2575 (adding a six-year-old deprecation notice for undocumented interactive flows would be noise). Do not re-file against `stellar/stellar-docs`. Keep canonical SEP status coverage in `stellar-protocol` retrieval or a concise note in the upstream `stellar-dev-skill` standards reference; if neither surface carries it, treat the QA row as a corpus/source-coverage diagnostic rather than an agent-quality failure.
