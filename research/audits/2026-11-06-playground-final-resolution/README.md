# Playground model finals and independent judge

This round completes the previously interrupted model comparison and validates a supported,
independent second judge. The owner authorized up to $200 additional API spend. The operative
brief and amendments are in [the round ledger](../../../.agents/rounds/2026-11-06-playground-final-resolution.md).
No model-selection result is established by calibration alone.

## Frozen study

Eight historically selected models, two repeats, 100 quality cases and one exfiltration case:
1,616 first-attempt answers. `selection.json` records the reconstructed selection, excluded screen
IDs, full case hashes and exact shard mapping. Historical final transcripts did not survive; no
old final cells receive credit. Six case objects changed since the previous sweep, so every arm
uses the same current case snapshot.

The initial collection stopped twice on immediate local fetch failures. All 85 attempted
observations are retained as a separate diagnostic cohort, including the successful answers.
A free regression reproduced stale socket reuse after synchronous judging; the repaired runner
opens a fresh connection for each answer and records bounded transport diagnostics. The historical
errors did not capture their causes, so that attribution remains an inference. The fresh comparison
starts all 1,616 cells under one repaired harness revision, with no prior cells imported.

`prior-cohort.mjs` imports the earlier evidence and its costs into the unchanged $200 ceiling.
The opening debit is $8.82879459, including both full uncertain method allocations; known API
cash is $0.8915166 and the two failed-call costs remain unknown. The prior 85 observations receive
their own full blinded review. A new unknown-cost or transport failure halts collection without
automatic retry, partial recovery or selective replacement.

`decision.mjs` implements the predeclared case-clustered exact test, Holm correction across fourteen
comparisons, replicated improvements, fixed denominators, reliability and safety gates. A failed
answer counts as a bad outcome. Full blinded transcript adjudication is required for every cell;
raw Judge A, Judge B and adjudicated grades stay separate. Qualified models are ordered by observed
outcomes without claiming pairwise statistical superiority. A release also requires the production
transport checks.

`orchestrate.mjs` records bounded method reservations and validates receipts against the launch
manifest, case snapshot, Gateway log identities and cost accounting. It does not launch paid work.
Raw answers, transcripts, OAuth credentials and production usage are not committed here.

## Independent judge transport

The archived Codex CLI design could not establish a supported global tool-denial boundary. The
implemented opt-in alternative uses the ordinary OpenAI Responses API through Cloudflare Gateway,
with no tools, storage or automatic inference retries. Claude Sonnet 5 remains the default Judge A
(v2.11 rubric, p9 evidence pack). Judge B uses GPT-6.1 Sol at high effort, with exact request,
implementation, executable and environment identities. Costs come from matching Gateway logs.

The p9 pack has a confirmed limit: a short unquoted lowercase source term can be omitted without
an audit notice. The older alleged 85-to-82 transcript is unavailable and is not treated as proof.
The study therefore requires full-transcript adjudication rather than treating omitted pack text
as proof that an answer invented a fact. No golden answer or pack version changes in this round.

## Review and verification

The adapter author was Astra at high; the independent reviewer was Claude Fable 5.1 at high.
The reviewer examined the spending plan, exact pilot replay, blinding, row-versus-method failures,
raw plan-file authorization, Gateway log reconciliation and the decision rule. Findings and their
dispositions are retained in the round ledger. Calibration and finalist collection are separate
gates, and neither an incomplete run nor an unknown cost can be silently excluded.

At implementation checkpoint `e800eef8`, typecheck, build, 149 unit-test files (3,248 passing
checks and three expected failures), 140 smoke checks and eval self-tests passed. Corpus lint had
zero errors and 84 existing warnings; registration was current. Secret scans passed. Later dated
orchestration changes receive their focused tests and independent review before collection.

Judge A's seven known-answer calibration expectations all passed at the clean checkpoint:
seven subscription calls, $0.3017528 CLI-reported notional usage, no API cash. Judge B calibration
uses the same seven fixtures plus twenty seeded historical inputs. The historical pilot prompts
reproduce their saved Judge A hashes exactly; they are disjoint from final cases. Its manifest and
reproducible generator are committed here, while the historical payload stays local.

Judge B completed all 27 calls for $0.416287 Gateway-reported API cost. All seven known-answer
fixtures passed; all twenty historical inputs produced valid complete verdicts with reported cost.
Raw historical grade agreement was 16/20. Agreement is descriptive, not a calibration pass
criterion. See [calibration-summary.json](calibration-summary.json) for case grade pairs, source
hash and cost distribution. The full-study forecast and disagreement reconciliation follow this
instrument check; calibration does not establish the best Playground model.

## Subscription reset checkpoint

On November 6, the repaired harness completed both Luna repeats: 202 first-attempt
answers and $1.00290804 reconciled answer API cash. Two answers hit the output
limit. Judge A produced 195 valid grades, one consistency error and six explicit
zero-token weekly-quota errors. All original receipts remain intact. No new-era
Judge B calls or later model arms have launched.

The owner chose to keep the $200 ceiling and resume after the reported November 8,
19:00 Eastern subscription reset. No server or paid process remains active at the
checkpoint. Total ceiling consumption is $9.83170263, including the immutable
prior-cohort debit; known API cash is $1.89442464. The remaining estimate still
requires per-model reforecasts and may stop at the budget gate.

See [the resume checkpoint](../../../.agents/rounds/2026-11-06-playground-resume.md)
for exact retained artifacts, identities, pending reviews and continuation gates.
Neither experiment is complete, no winner is declared, and the shipped model pair
remains unchanged. The separately prepared route-preservation patch remains
conditional and unmerged until independent review and model selection.

Two verified upstream defects were filed with immutable source records:
[assets interface types](https://github.com/stellar/stellar-dev-skill/issues/180)
and [the cross-contract guide example](https://github.com/stellar/stellar-docs/issues/3070).
Their live checks and compile evidence distinguish source defects from answer errors.

The final sweep independently verified the deployed fixes for sd-095 (SDP passkey
storage) and sd-097 (Raven's Docs backend). Both active records were retired with
immutable sources and resolution receipts. See [the retirement review](handoff-retirement-review.md),
[root live evidence](handoff-root-live.json), [independent live evidence](handoff-independent-live.json),
and [posted resolution comments](handoff-resolution-comments.json). Dated earlier
blocked/undeployed observations remain historical; they are superseded by this check.
