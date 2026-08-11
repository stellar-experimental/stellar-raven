---
id: ll-009
service: lumenloop
status: reported-upstream
discovered: 2026-07-03
evidence:
  - https://github.com/lumenloop/lumenloop-backend/issues/25 (filed 2026-07-13; backend owns the content enrichment and publishing pipeline; confirmed open with `gh issue view`)
  - lumenloop.com/research/stellar-weekly-roundup-week-29-2026 + lumenloop.com/media/state-stellar-q1-2026-beyond (fetched 2026-07-03)
  - messari.io/report/state-of-stellar-q1-2026 (the written report, pub 2026-04-29) + Messari interview youtube.com/watch?v=t0agtgLajhg (2026-06-04)
  - Solo project 49, todo 829 (consistency sweep + golden-truth resolution), scratchpad 521
  - live re-verified 2026-07-06 (eval round todo 846): both divergent sources still live in the index — av 2207 (interview: $2.8B RWA, 1,700 devs) vs article 5945 (written report: $2B RWA, 4,400+ devs) — so the misattribution mechanism persists; the lumenloop.com editorial pages themselves were not re-fetched this round
  - GT-20 recurrence 2026-07-10: live RWA search mixed SDF Q1, Allium raw/adjusted transfer volumes, and later ~$3B corpus summaries without machine-readable metric taxonomy/provenance
recurrences:
  - date: 2026-08-11
    evidence: the roundup still places $2.8B and 1,700 monthly active developers beside a report label that links to the Messari interview `t0agtgLajhg`; the media page still presents a $2.8B tokenized-RWA claim under its Q1 2026 title. Upstream #25 remains open, with only the 2026-07-13 `kalepail` tracking comment and no maintainer activity.
---

## Finding

Lumenloop's editorial content misattributes two headline statistics to
"Messari's State of Stellar Q1 2026 report":

1. The **~$2.8B tokenized-RWA figure** — actually a June-2026 point-in-time
   value (rwa.xyz distributed asset value; stated by the SDF president in
   Messari's 2026-06-04 *interview* "State of Stellar Q1 2026 & Beyond").
   The written report never states $2.8B — it pins the ex-stablecoin RWA
   market cap at $796M → $1.52B at Q1-end (+91% QoQ), crossing $2B on
   April 11. The smoking gun is mechanical: the roundup's "Messari's State
   of Stellar Q1 2026 report" hyperlink targets the **YouTube interview
   URL**, not the report.
2. The **"1,700 monthly active developers"** stat — actually Electric
   Capital's dashboard (May 2026), quoted by the SDF president in the same
   interview ("as per Electric Capital's dashboard"), merged by the roundup
   into the same "per Messari's report" sentence.

The same conflation appears on the media page
(`/media/state-stellar-q1-2026-beyond`: "In Q1 2026, Stellar reached
$2.8B…" — the figure is June, not Q1).

## Evidence

All URLs fetched 2026-07-03 with quotes recorded in Solo scratchpad 521.
Consumer impact is demonstrated, not hypothetical: two of this repo's eval
goldens inherited the misattribution from the roundup (a third inherited a
downstream scope-confusion theory trying to reconcile the resulting
"conflict"), producing a cross-question contradiction caught by the
2026-07-03 consistency sweep. Any agent answering RWA-adoption questions
from the Lumenloop corpus reproduces the false attribution.

## Recommendation

(1) Correct both pages: attribute ~$2.8B to rwa.xyz/June-2026 (or "SDF
president, June 2026 Messari interview") and 1,700 MAD to Electric Capital
(May 2026); the written report's citable figures are $1.52B at Q1-end and
$2B on April 11. (2) Editorially: when a summary cites "a report", make the
hyperlink target the report — interview-derived numbers should be labeled
as such, since interviews carry later data than the publication they
promote. Consumer-side, this gateway's goldens now carry the corrected
attributions and instruct graders not to fail answers that repeat the
corpus's own misattribution (three owned cases under eval/qa/corpus/battery/).

GT-20 reproduced the broader mechanism. Lumenloop search could surface the
SDF Q1 payment-volume snapshot, a later ~$3B RWA summary, and related reporting,
but did not expose enough structured metadata to prevent market cap, supply,
distributed/represented value, payment volume, raw/adjusted transfer volume,
and TVL from being treated as one comparable series.

Add machine-readable `metricName`, `metricKind` (stock/flow), period,
raw/adjusted methodology, inclusion/exclusion scope, original source URL,
source publication date, and data-as-of fields to metric-bearing content.
