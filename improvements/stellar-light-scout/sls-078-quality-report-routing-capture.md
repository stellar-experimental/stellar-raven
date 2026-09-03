---
id: sls-078
service: stellar-light-scout
status: fixed-upstream
discovered: 2026-08-27
upstreamTitle: Narrow quality-report routing to source-calibration questions
evidence:
  - 2026-08-28T13:38:25Z live OpenAPI 1.9.1 lists broad getQualityReport x-routing keywords, including trust, confidence in the data, coverage, source-calibration terms, health, and limitations
  - routing evaluation: the operation entered 56 of 338 legacy and 26 of 122 extended top-five results; unrelated top-one captures occurred in both sets
  - routing evaluation: excluding the operation changed extended strict routing from 88/109/116 to 90/109/117 and removed unrelated top-one captures
  - upstream issue filed 2026-08-28: https://github.com/Stellar-Light/stellarlight/issues/1087
  - 2026-09-03 live Scout OpenAPI 1.9.23 GET /api/quality x-routing contains eight self-referential Scout or Stellar Light source-calibration phrases and excludes generic technical, protocol, SDK, and operational questions in notFor
recurrences:
  - date: 2026-08-28
    evidence: OpenAPI 1.9.1 changes only the quality-report response schema and keeps the broad x-routing contract byte-identical to 1.8.110
---

## Finding

Scout OpenAPI 1.9.1 gives `getQualityReport` broad `x-routing` keywords. The live
list includes `trust`, `confidence in the data`, `coverage`, `provenance`, `health`,
and `limitations`. They capture questions that do not ask about Scout data quality.

The operation is useful for source-calibration questions. Its routing contract
does not preserve that boundary.

## Evidence

A routing evaluation included and excluded `getQualityReport`. With the
operation included, it entered 56 of 338 legacy top-five results. It entered
the top three 25 times and ranked first three times.

It also entered 26 of 122 extended top-five results. It entered the top three
14 times and ranked first four times. Unrelated top-one captures included a
question about unlimited research depth and a question about Soroban
`msg.sender` behavior.

Excluding the operation changed extended strict routing from 88/109/116 to
90/109/117. It also restored the relevant documentation operations for those
unrelated queries.

### Fixed upstream recheck (2026-09-03)

Live Scout OpenAPI 1.9.23 gives `GET /api/quality` eight self-referential
Scout or Stellar Light source-calibration phrases in `x-routing`. Its `notFor`
excludes generic technical, protocol, SDK, and operational questions. The prior
standalone generic terms are absent. Upstream issue #1087 is closed as
completed.

The upstream contract is fixed. A separate Raven response-schema keyword
projection caused 90 unrelated `scout.getQualityReport` captures in the
reviewed 1.9.23 candidate. That local residual does not reproduce this upstream
defect. The general Raven scoring TODO tracks the repair. Raven keeps
`GET /api/quality` excluded until that repair passes review.

## Recommendation

Anchor the operation's description and `x-routing` to explicit questions about
Scout, Stellar Light, the directory, or this source. Remove generic standalone
routing words that apply to normal technical questions.

Add negative routing controls for protocol, SDK, and operational questions that
mention words such as confidence, source, limit, trust, or health without asking
about Scout's own data quality.
