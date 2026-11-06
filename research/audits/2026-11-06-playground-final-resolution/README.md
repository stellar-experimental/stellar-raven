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
