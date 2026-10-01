# 2026-07-11 tier-interleave eval round — orchestration trail and re-judge evidence

Dated evidence companion to the committed round record
[`eval/qa/reviewed/2026-07-11-tier-interleave-round.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/eval/qa/reviewed/2026-07-11-tier-interleave-round.md)
(commit `917371b`). Preserves two things that otherwise lived only in Solo scratchpads
(`solo://proj/49/scratchpad/e2e-eval-round-2026--593` plan+review, `…--594` working record,
both archived after this file landed): the **13 identical-input re-judge dispositions** —
closing the independent reviewer's residual risk that they were not persisted in the repo —
and the **plan-level adversarial-review trail** that shaped the round. Round todo:
`solo://proj/49/todo/941`.

## Re-judge dispositions (13 calls of the 20 cap; identical saved input, sonnet judge, v2.4/p3)

Confirmed stable (re-judge returned the run's flipped score — real transitions):

| id | lane | transition | re-judge | reading |
|---|---|---|---|---|
| q-hist-quantum-preparedness-plan | headline | W→C | correct | baseline wrong genuinely overturned (agent retrieved June-9-2026 QPP + Stage-1 framing) |
| q-asset-rwa-tokenized-freshness | headline | P→C | correct | dated sourced figures; baseline's contradictory 5× arithmetic gone |
| q-eco-stellar-rwa-stablecoin-volume | headline | P→C | correct | stock/flow separation, dated Q1-2026 report |
| q-pc-muxed-accounts | headline | P→C | correct | now includes Soroban-invocation source restriction |
| q-ti-cli-rust-windows-troubleshooting | headline | P→C | correct | all 6 keyFacts incl. no-mainnet-Friendbot |
| q-live-zk-repos-current | live-10 | P→C | correct | genuine synthesis gain: categorical dated groupings replaced the rigid #1/Groth16 overclaim |
| q-live-oracle-repo-triage | live-10 | P→C | correct | baseline was a calibrated-correct judge artifact; now raw + stable correct |
| q-aas-list-token-on-exchanges-aggregators | headline | P→W | wrong | real overclaim ("explorers/aggregators surface an asset automatically") hits avoid #1; omits home_domain/trustline prerequisites |
| q-jutsu-what-is-a-memo | headline | C→P | partial | real omission of "use exactly the memo type/value the receiving service supplies" |

Variance (re-judge contradicted the run's flip on identical input — monitor-only, not real):

| id | lane | run flip | re-judge | reading |
|---|---|---|---|---|
| q-ti-explain-repo-payload-status | headline | P→C | partial | really P→P |
| q-scf-rfps-hackathons-live | headline | C→P | correct | really C→C |
| q-live-digest-rwa-recent | digest-2 | C→P | correct | fabricated-date sub-claim (Reflector-DAO/USTRY 2026-06-28) downgraded to unverified-not-wrong extra |
| q-live-digest-blend-coverage | digest-2 | C→P | correct | 2026-07-09 date on a `date:null` Space item, same downgrade |

Net variance rate among flips this round: 4 of 13 re-judged flips (the two headline ones
offset exactly, leaving reviewed = raw 12C/14P/4W). This is the concrete cost the committed
23.3% any-flip noise floor predicts, and the empirical basis for the follow-up idea of
persisting re-judge outputs as machine-readable artifacts and/or auto-re-judging flips
inside the runner (a measurement-contract decision, not a casual change).

## Independent round review (STEP 7 gate)

Reviewer: gpt-5.6-sol high, read-only (Solo process 3448, closed after harvest). Verdict
**APPROVE-WITH-FIXES**. It independently re-ran the production
`scout.searchProjects({q:"streaming recurring payments"})` probe (confirmed 19/19 `Live`,
Fluxity `Live`/`Unverified` with null `statusAsOf`/`statusBasis`/`statusSourceUrl`,
`supportedNetworks:[]` — the sls-024 recurrence), recomputed every lane's counts from rows,
the 30-id transition matrix, the budget arithmetic ($24.3291723), and the 60-row agentic
completeness gate. Three record-completeness defects (two catch-all miscounts, one missing
raw breakdown) were fixed in the record before commit; the full verification table is in the
archived scratchpad 594 and summarized in the record's "Independent review" section.

## Plan-level adversarial review trail (the pre-spend gate)

The round brief itself went through a paid-work-shaped review loop before any spend:
coordinator drafted PLAN v1 → gpt-5.6-sol **max** adversarial review → REVISE
(1 blocker, 13 majors, 5 minor/nit) → PLAN v2 → bounded delta pass → REVISE
(1 new blocker, 2 majors, 1 minor — including a deadlock the reviewer found in the fix
for its own finding) → PLAN v3 + v3.1 budget amendment → launch. 23 defects total were
caught before the first paid token. The highest-value catches, as evidence for making
plan-review a standing step before paid rounds:

- The mandatory independent review of the round was optional in v1 (completion-gate violation).
- The committed 30-case agentic sample contains **none** of the interleave-recovered extended
  cases — v1's "direct behavioral read on bb25276" claim was unsupportable; reframed as a
  diagnostic that established the missing row-level baseline instead.
- v1 misused the 23.3% noise floor as an aggregate significance threshold.
- v1 over-attributed a composite interval (drift absorb + interleave + stochasticity) to one
  commit; v3 predeclared the only 3 deterministically affected ids.
- Guard ordering, denominator-shrink on lane failures, unpinned `QA_AGENT_PROMPT_APPEND` /
  `--server-revision`, unenforceable budget sub-caps, and missing improvements-lint/index
  gates were all fixed pre-launch.

Follow-up recommendations distilled from the round (tracked in Solo, not here): answering-model
A/B arm; report sls-024 upstream (fields now schema-present-but-unpopulated); persist re-judge
artifacts / consider auto-re-judge-on-flip; live-contract v3 expansion (both live lanes
saturated); codify pre-spend plan review in `run-evals`.
