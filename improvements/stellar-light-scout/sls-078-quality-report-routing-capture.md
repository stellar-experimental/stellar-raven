---
id: sls-078
service: stellar-light-scout
status: verified
discovered: 2026-08-27
upstreamTitle: Narrow quality-report routing to source-calibration questions
evidence:
  - eval/results/routing-2026-08-28T02-25-30-382Z.json with scout.getQualityReport exposed
  - eval/results/routing-2026-08-28T02-27-05-660Z.json with scout.getQualityReport excluded
  - the exposed operation entered 56 of 338 legacy top-five results, including 25 top-three and 3 top-one results
  - the exposed operation entered 26 of 122 extended top-five results, including 14 top-three and 4 top-one results
  - excluding the operation changed extended strict routing from 88/109/116 to 90/109/117 and removed unrelated top-one captures
  - An independent live OpenAPI 1.8.110 recheck kept the same broad x-routing keywords
  - Raven keeps GET /api/quality unexposed until its routing contract becomes selective
---

## Finding

Scout OpenAPI 1.8.109 gives `getQualityReport` broad routing words such as
`trust`, `confidence`, `coverage`, `source`, `health`, and `limitations`. Raven's
measured lexical router therefore promotes the operation for many questions
that do not ask about Scout's data quality.

The operation is useful for explicit source-calibration questions. Its current
routing contract does not preserve that boundary.

## Evidence

Raven ran the same routing corpus with and without `scout.getQualityReport`.
With the operation exposed, it entered 56 of 338 legacy top-five results. It
entered the top three 25 times and ranked first three times.

It also entered 26 of 122 extended top-five results. It entered the top three
14 times and ranked first four times. Unrelated top-one captures included a
question about unlimited research depth and a question about Soroban
`msg.sender` behavior.

Excluding the operation changed extended strict routing from 88/109/116 to
90/109/117. It also restored the relevant documentation operations for those
unrelated queries.

## Recommendation

Anchor the operation's description and `x-routing` to explicit questions about
Scout, Stellar Light, the directory, or this source. Remove generic standalone
routing words that apply to normal technical questions.

Add negative routing controls for protocol, SDK, and operational questions that
mention words such as confidence, source, limit, trust, or health without asking
about Scout's own data quality.
