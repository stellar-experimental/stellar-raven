---
id: ll-001
service: lumenloop
status: reported-upstream
discovered: 2026-07-03
evidence:
  - eval/qa/results/2026-07-03T03-49-35-variantA.json
  - eval/qa/results/2026-07-03T04-13-42-variantA.json
  - live re-execution against local server confirmed slug/content mismatch
  - Solo project 49, todo 822, comments 2204-2210
  - live re-verified 2026-07-06 (eval round todo 846): slug stellar-weekly-roundup-week-29-2026 still fronts "week of May 29, 2026" content (created 2026-06-05) — the week-number/date mismatch persists; side drift: search_documents now requires a collection arg
  - https://github.com/lumenloop/lumenloop-backend/issues/21 (filed 2026-07-13; public page rechecked HTTP 200 with "week of May 29, 2026" and publication date 2026-06-05)
recurrences:
  - date: 2026-11-09
    evidence: "2026-11-09 sweep at 2026-11-09T20:31:25.278705+00:00: still-repro. The week-29-2026 URL still renders the title week of May 29, 2026, with Published 2026-06-05. Adjacent roundups still use week-based dates independently of their slug labels. Read-only exact requests and response hashes: research/audits/2026-11-09-improvements-sweep/lane-lumenloop.md; upstream issue state/comments freshly read; no maintainer comments or claimed fix."
  - date: 2026-11-06
    evidence: "2026-11-06 still-repro: GET https://lumenloop.com/api/md/research/stellar-weekly-roundup-week-29-2026 — HTTP200: title week of May 29, 2026; Published 2026-06-05; URL still week-29. Evidence/owner state: .agents/rounds/2026-11-05-truth-maintenance/other.md, row ll-001."
  - date: 2026-08-11
    evidence: public `stellar-weekly-roundup-week-29-2026` still renders "week of May 29, 2026" and 2026-06-05; upstream #21 remains open, with only the 2026-07-13 `kalepail` tracking comment and no maintainer activity
---

## Finding

Weekly-roundup canonical slugs mismatch their content dates. The research doc for
"week of May 29, 2026" lives at slug `stellar-weekly-roundup-week-29-2026`, which
reads as "week 29". Readers — including an eval judge — parsed a citation to it as
fabricated because the slug's week number does not correspond to the content's date.

## Evidence

Surfaced in the 2026-07-03 eval round (results files above); the judge flagged the
citation as fabricated purely from the slug. Live re-execution against the local
server confirmed the doc's content is the week of May 29, 2026 while the slug says
week 29.

## Recommendation

The slug or item metadata should carry the actual week date (e.g. an explicit
`week_of: 2026-05-29` field, or date-based slugs), so citations to roundups are
verifiable without fetching the body.
