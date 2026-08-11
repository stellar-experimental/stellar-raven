---
id: sd-009
service: stellar-docs
status: declined-upstream
disposition: Accept the docs owner's noise/placement decision; retain the canonical SEP status in standards-aware consumer truth and do not re-file without materially new evidence.
discovered: 2026-07-09
evidence:
  - eval/qa/reviewed/2026-07-09-improvements-evidence.md (durable redacted row q-sep-6-24-deprecation, wrong; verdict manually reviewed and upheld)
  - stellar/stellar-protocol ecosystem/sep-0006.md live source rechecked 2026-07-09: status is "Active (Interactive components are deprecated in favor of SEP-24)"
  - developers.stellar.org Anchors fundamentals page rechecked 2026-07-09: contrasts SEP-6 programmatic with SEP-24 hosted flows but never surfaces the deprecation status
  - upstream issue filed 2026-07-09: https://github.com/stellar/stellar-docs/issues/2575
  - maintainer response 2026-07-13: https://github.com/stellar/stellar-docs/issues/2575#issuecomment-4962781289 — adding a six-year-old deprecation notice would be noise because the retired SEP-6 interactive components are not otherwise documented on the site
recurrences:
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

The live `stellar/stellar-protocol` source begins SEP-0006 with:
`Status: Active (Interactive components are deprecated in favor of SEP-24)`. Its introduction also
states that SEP-6 is programmatic and SEP-24 exists for anchor-hosted interactive use.

The live Anchors fundamentals page links both specifications and accurately describes the
programmatic-versus-hosted split, but a text check finds no `deprecated` language in that section.
The durable reviewed row in
`eval/qa/reviewed/2026-07-09-improvements-evidence.md` (source stamp
`2026-07-09T19-53-07`) records that the agent exhaustively searched the exposed docs corpus, found
the split but not the status note, and answered that no explicit deprecation language exists. The
judge correctly scored this wrong. The answer still recommended SEP-24, demonstrating that the
missing fact is specifically deprecation status rather than the basic flow distinction.

Live 2026-07-10 (todo 903 closeout): the same QA case recurred across both architecture arms —
search+execute denied the status and graded wrong; the direct-operation answer recommended SEP-24
but still omitted the canonical deprecation fact and graded partial. A fresh live
`stellarDocs.search_docs({query: "SEP-6 interactive deprecated SEP-24"})` response contained no
`deprecated` text. This strengthens the existing content-parity finding; it does not establish a
separate architecture-specific defect.

## Recommendation

The Docs owner reasonably does not want a historical warning added to current
beginner guidance for a mechanism the site never teaches. Do not keep pushing
that prose change. The unresolved need is answering-time source coverage:
prefer making canonical SEP status metadata retrievable, or adding a concise
provenance-bearing status note to the upstream `stellar-dev-skill` standards
reference that already routes agents to SEP-6/SEP-24. If neither surface should
carry it, treat the QA row as a corpus/source-coverage diagnostic rather than
ordinary agent-quality evidence until a general official-source mechanism can
reach `stellar-protocol`. Track that placement decision in Solo todo 989 and
scratchpad 625; if Docs declines/closes, create a successor skills/source
finding rather than stretching this Docs finding.
