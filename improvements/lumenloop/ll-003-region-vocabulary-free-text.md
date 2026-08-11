---
id: ll-003
service: lumenloop
status: reported-upstream
discovered: 2026-07-03
evidence:
  - eval/qa/results/2026-07-03T03-49-35-variantA.json
  - eval/qa/results/2026-07-03T04-13-42-variantA.json
  - live-lane case q-live-ll-regions-vocab (passes on behavior; drift recurring)
  - Solo project 49, todo 822, comments 2204-2210
  - live re-verified 2026-07-06 (eval round todo 846): get_regions → 95 free-text values with duplicate casings/synonyms ('africa'/'Africa', 'mena'/'MENA', 'latam' vs 'Latin America & Caribbean') — still no canonical enum
  - live re-verified 2026-07-09: authenticated get_regions returned 95 values and the duplicate case pairs africa/Africa, asia/Asia, global/Global, and mena/MENA
  - live re-verified 2026-07-10 during GT-35: count remained 95 with the same four capitalization-only duplicate pairs and mixed country/macro-region aliases
  - upstream issue filed 2026-07-13: https://github.com/lumenloop/lumenloop-backend/issues/23
recurrences:
  - date: 2026-07-09
    evidence: authenticated POST /v1/tools/get_regions returned count 95 with four case-insensitive duplicate pairs (africa/Africa, asia/Asia, global/Global, mena/MENA)
  - date: 2026-07-10
    evidence: GT-35 primary/blind re-execution returned count 95 and reproduced africa/Africa, asia/Asia, global/Global, and mena/MENA
  - date: 2026-08-11
    evidence: `get_regions` still returns 95 values and all four capitalization-only pairs; upstream #23 remains open, with only the 2026-07-13 `kalepail` tracking comment and no maintainer activity
probe:
  type: http-text
  url: https://api.lumenloop.com/v1/tools/get_regions
  method: POST
  authEnv: LUMENLOOP_API_KEY
  body: '{}'
  expect:
    status: 200
    contains:
      - '"africa"'
      - '"Africa"'
      - '"mena"'
      - '"MENA"'
---

## Finding

Region vocabulary is free-text rather than a controlled list. The live-lane eval
case `q-live-ll-regions-vocab` currently passes on behavior, but the vocabulary
drifts recurringly, which makes region-scoped queries and drift gates fragile.

## Evidence

Recurring drift observed across eval rounds; tracked via the live-lane case above
and the 2026-07-03 results files. The 2026-07-09 authenticated recurrence returned
95 values and reproduced four capitalization-only duplicate pairs.

## Recommendation

Publish a canonical region enum (and validate/normalize incoming region values
against it), so consumers can filter deterministically.
