---
id: sls-067
service: stellar-light-scout
status: verified
discovered: 2026-08-18
upstreamTitle: RFP contract overstates current fundability and omits live round-state fields
evidence:
  - 2026-08-18 live GET https://stellarlight.xyz/api/rfps?status=open&limit=1 returned an open brief, a funding sentence claiming current-round eligibility, and meta.scfRound data that did not establish an open submission window
  - 2026-08-18 live https://stellarlight.xyz/api/openapi.json repeated current-round fundability claims in the operation, status input, funding output, row status, and currentRound descriptions
  - 2026-08-18 the live response carried meta.scfRound.currentPhase, roundsInProgress, and source, while the OpenAPI response schema omitted all three fields
  - 2026-08-18 the live meta.scfRound phase disagreed with the official https://communityfund.stellar.org/awards phase observed the same day
  - Solo scratchpad 819 Grok adversarial improvement attack / Additional evidence — scout.getRfps fundability contract
---

## Finding

The `GET /api/rfps` contract states that an open brief is fundable in the current SCF round or
quarter. An open brief only shows that Scout classifies the sponsor brief as open. It does not
prove that the current SCF proposal window accepts submissions.

The live response carries the current round-state fields `currentPhase`, `roundsInProgress`, and
`source`. The OpenAPI response schema omits these fields. Its `currentRound` description also
equates current round identity with an open submission window.

The live phase label disagreed with the official awards page on the same day. This shows that the
phase field can become stale even when Scout labels the round metadata as live.

## Evidence

A live read with `status=open` returned an open brief and the current-round eligibility sentence.
The same response returned a null submission window and separate round progress data. Those facts
do not support the contract's fundability claim.

The live OpenAPI repeated the claim in five model-visible locations. It described the operation,
the `status` input, the `funding` output, each row's `status`, and `currentRound` as current
fundability or an open submission round.

The response included `meta.scfRound.currentPhase`, `meta.scfRound.roundsInProgress`, and
`meta.scfRound.source`. The response schema omitted them. The official awards page then showed a
different phase from the live API payload.

## Recommendation

Define `status=open` as an open solicited brief. State that this value does not prove an open SCF
proposal window.

Remove current-round fundability claims from the operation, input, and output descriptions. Define
`currentRound` as Scout's current round identity without asserting that submissions are open.

Add `currentPhase`, `roundsInProgress`, and `source` to the OpenAPI response schema. Document the
round, phase, deadline, and provenance fields that each `roundsInProgress` item returns.

Refresh phase data from the official awards source. Preserve `asOf` and `verifyAt`. Do not infer an
open proposal window from an open brief, a current round number, or a stale phase label.
