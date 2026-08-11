---
id: ll-007
service: lumenloop
status: reported-upstream
discovered: 2026-07-03
evidence:
  - live search_content_semantic events probe (2026-07-03 evening, production)
  - 2 of ~14 India event rows affected (Bhopal + Jabalpur "Build On Stellar" workshops)
  - Solo project 49, todo 807, scratchpad 521
  - live re-verified 2026-07-06 (eval round todo 846): Bhopal (id 1597) and Jabalpur (id 1598) rows still carry start_at 2026-06-27 with "July 27" in the summary prose
  - live re-verified 2026-07-09: authenticated event semantic search returned ids 1597/1598 with start_at 2026-06-27T05:30/06:30Z while both summaries still say July 27
  - filed 2026-07-13: https://github.com/lumenloop/lumenloop-backend/issues/20
recurrences:
  - date: 2026-07-09
    evidence: POST search_content_semantic for Bhopal/Jabalpur Build On Stellar returned ids 1597/1598 with June 27 structured timestamps and July 27 summary prose
  - date: 2026-07-10
    evidence: GT-39 independently found the Jaipur Builders Camp structured title/date aligned to the direct Luma record while generated summary/slug retained the stale Goa identity
  - date: 2026-08-11
    evidence: event ids 1597 and 1598 still have June 27 structured `start_at` values and summary prose that says July 27; upstream #20 remains open, with only the 2026-07-13 `kalepail` tracking comment and no maintainer activity
probe:
  type: http-text
  url: https://api.lumenloop.com/v1/tools/search_content_semantic
  method: POST
  authEnv: LUMENLOOP_API_KEY
  body: '{"query":"Bhopal Jabalpur Build On Stellar workshop","types":["events"],"date_start":"2026-06-01","limit":100}'
  expect:
    status: 200
    contains:
      - '"id":"1597"'
      - '"start_at":"2026-06-27T05:30:00.000Z"'
      - 'July 27 in Bhopal'
      - '"id":"1598"'
      - '"start_at":"2026-06-27T06:30:00.000Z"'
      - 'Jabalpur, July 27'
---

## Finding

Event summary prose can contradict the structured `start_at` field. The
Bhopal and Jabalpur "Build On Stellar" workshop rows say "July 27" in
their summary text while `start_at` is 2026-06-27 — a month off, likely a
summarizer date-extraction slip (day/month transposition against a source
that said 27 June). 2 of the ~14 India event rows probed this round are
affected; not yet observed elsewhere, so prevalence beyond this cluster
is unknown.

GT-39 independently reproduced the same root class on a third India event:
the structured record and direct Luma page identify Jaipur, August 14–18,
2026, while generated summary/slug material still identifies Goa. This
extends the defect from date prose alone to event identity/location.

## Evidence

Live probes 2026-07-03 and 2026-07-09 (production, free ops):
`search_content_semantic({query:"Stellar Build Station India builder
sprint", types:["events"], date_start:"2026-06-01"})` returns both rows
with `start_at: 2026-06-27` and "July 27" in the summary prose. Round
record: Solo scratchpad 521 (deep review report, q-scf-regional-india).

## Recommendation

Add a consistency check in the event summarization pipeline: if the
summary prose contains a date that disagrees with `start_at` by more than
a day, flag or regenerate. Consumers reading only summaries (common for
LLM agents) will report wrong event dates while the structured field is
correct.
