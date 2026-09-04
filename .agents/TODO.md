# TODO — own-repo work queue

Own-repo fixes only: adapters, normalizers, catalog, executor, scoring, eval instruments, goldens,
gates, and documentation. Upstream service defects go to `improvements/` instead — see
`improvements/README.md` for the routing rule.

Add an item when you find work you are not doing now. Delete it when it is done; git history is the
archive. Each item states what is wrong, how it was found, and what "done" means.

Updated 2026-09-03 after the owner resolved the Raven monitor and protocol-history PH2 decisions.

## Improvements follow-up

### Re-check `sd-047` only after PR #2806 merges

Trigger only when https://github.com/stellar/stellar-docs/pull/2806 merges.
Do not poll the pull request or post reminder comments.

After the merge, re-read the cadence sentences in `docs/validators/README.mdx` and
`docs/learn/fundamentals/stellar-stack.mdx`.
Record the result against `sd-047` and issue https://github.com/stellar/stellar-docs/issues/2805.
Use `.agents/rounds/2026-09-01-free-improvements-maintenance.md` as the prior evidence ledger.

Done when: both current sentences agree, or the queue records the remaining contradiction.
Move `sd-047` only after the normal live verification and lifecycle gates pass.

## Recovery

### Monitor the rejected repository-tooling recovery experiment

The record-only closeout is in
`.agents/rounds/2026-08-31-rejected-experiments-closeout.md`.
The rejected `repository-tooling-recovery-v2` implementation does not ship.
The v2 collection returned 9 of 12 positives and 0 of 8 premature detours.
It had 18 of 20 correct answers and 20 of 20 grounded answers.

`sls-080` is retired in `improvements/resolved.json`.
The deployed API `1.9.16` reading returned `28` at `2026-09-01T20:08:07.092Z`.
Its scanned ref was `82660510ecda7fd365a14d08badb9d85fa22bc32`, whose source value is also `28`.

During each improvements or drift-maintenance round, run one free `scout.explainRepo` reading
against the existing local Raven server. Ask: “Which Horizon ingestion constant pins the highest
supported protocol version, and what is its value?” Use repository `stellar/stellar-horizon`.
Record the returned value, `generatedAt`, `scannedRef`, and `answerSource` in the current round ledger.
Use the `sls-080` receipt in `improvements/resolved.json` as the durable finding record.

The freshness blocker clears only when the DeepWiki answer equals the source value at the
response's own `scannedRef`. The current source value is `28`; the match rule is not a permanent
literal-`28` rule.

The selection trigger remains three qualifying positive operation-selection misses after recovery.
The Docs-versus-repository conflict remains monitor-only until three successful-recovery
recurrences. Each recurrence must be a dated re-execution of `sls-080`. It must use the required
Docs-first, inspect, then one-later-`scout.explainRepo` sequence. Record the same finding identity,
the case ID, the result stamp, and the transcript for every recurrence.
The `stellar-cli` fallback candidate did not reproduce and has no active finding.
G1 is a pre-registered v3 candidate only.

A matching free reading does not authorize a paid collection. A new recovery plan must cite
ADR-0008. It must retain the 10-of-12 positive and 0-of-8 premature-detour gate. Ranking remains
blocked until three qualifying positive misses remain after recovery. Any paid collection needs
an independent plan review and its own spend authorization.

G1's detailed record is in closed PR #102 at commit `6baec0a4`. Fetch it with
`git fetch origin pull/102/head` if this block reopens.

Done when: a reviewed v3 plan later passes ADR-0008 and ships, or the owner retires this recovery
program. A later Scout finding must use `sls-082`; `sls-081` is historical only.

## Routing

### `search` does not surface the research lane for protocol-history questions

Eval case `q-protocol-24-whisk-incident` asks why Protocol 24 followed Protocol 23 so quickly. The
answer needs the eviction-defect cause, the counts 478 / 84 / 77 / 394, `CAP-0076`, Hot Archive,
and a 31,879,035-stroop fee-pool remediation.

`scout.searchResearch` holds all of them. `source: "cap"` returns 478, 84, 77, 394, Hot Archive,
and TTL; a broad call returns 478, 84, 77, 31879035, `CAP-0076`, and Hot Archive. The union is the
complete fact set, so this question is fully answerable today.

`search` does not point there. Measured 2026-08-25 with the case's own wording: ten hits, none of
them `scout.searchResearch`. The top hits were `stellarDocs.*` operations, and no Stellar Docs
lane carries a single required fact.

This is not a description gap. `scout.searchResearch` already advertises "incident reports" and
offers `source` values `cap` and `incident`. The lane says what it is; ranking does not find it.

The 2026-08-31 `clause-fit-hysteresis-v1` measurement produced a reviewed `FAIL`.
No grid passed both frozen contracts with the routing gates intact.
Its result stamp is `2026-08-31T16-58-42-389Z-clause-fit-hysteresis-v1`, and its clause artifact
SHA-256 is `e5f86644af89158c3ac4d61ee7f651e2a062c9d292f194cb94872c7eee4e71f4`.
Attempt one is spent.

The 2026-08-31 `cross-encoder-fit-v1` measurement also produced a verified `FAIL`.
Every registered grid kept both frozen contracts at the lexical baseline and failed the routing
gate. Its result stamp is `2026-08-31T23-36-38-660Z-cross-encoder-fit-v1`, and its result
SHA-256 is `529351b1562b14f68d18ef94b584ca37ae61290f68cfff7a5a1489e8b601ae0d`. The full record
is `.agents/rounds/2026-08-31-protocol-history-cross-encoder-v1.md`. Attempt two is spent.

The 2026-09-01 `clause-support-fit-v1` measurement also produced a verified `FAIL`.
It used cache-only multi-clause aggregation over the retained attempt-two pair scores.
Its result stamp is `2026-09-01T14-22-28-993Z-clause-support-fit-v1`.
Its result SHA-256 is
`a522bfa28ef4b06146c5f247ba64c08bfd6edaa4a81a0642c4010da2d6de479c`.
Blind top-five rose from 3/11 to 10/11. Control captures also rose to 2/4 and 7/9.
The routing gate failed on legacy, holdout, extended, and protocol-version top-one.
The full record is `.agents/rounds/2026-09-01-protocol-history-attempt-three.md`.
Attempt three is spent, so the three-attempt box is spent. No fourth attempt is authorized.
No production change shipped, and no `improvements/` finding applies.

The free evidence is complete in `.agents/rounds/2026-09-02-protocol-history-free-evidence.md`.
The blind label review disputes four of 13 frozen controls: `ph-control-validator-vote`,
`ph-control-clawback-cap`, `phb-control-sdk-version-history`, and
`phb-control-cap-history-sep-support`. All 19 positive labels hold. The product-exposure union
contains 78 QA cases. It combines the 76-case
`scout.searchResearch` inventory and four-case protocol-history family, with two shared cases.
The attempt-one result file is absent locally, so its matrix column remains `NA`.
On manifest `4cd28f4b…fe8b`, the original diagnostic reads 4/8 positives and 2/4 controls.
`ph-control-validator-vote` reaches rank five without a new mechanism. The blind set reads 3/11
positives and 6/9 controls. These results informed the PH2 owner decision. They do not authorize
PH3.

The owner resolved PH2 on 2026-09-03. The v2 contracts retain all 19 required cases, keep nine
valid controls as forbidden, and mark the four disputed controls neutral. Neutral ranks remain
visible but do not affect pass or fail. The v1 contracts remain byte-identical historical inputs.
The decision record is `.agents/rounds/2026-09-03-owner-decisions.md`.

The current v2 baseline reaches 7 of 19 required cases. It captures five of nine forbidden cases.
Three of four neutral cases also surface the target. Both v2 contracts remain diagnostic `FAIL`.

This queue calls the dated brief's T1 to T4 triggers `PH1` to `PH4`. This avoids collision with
the five-track T1 to T5 contract.

- **PH1 — dual upstream card change.** Both hashes must change together. The
  `inventory/stellar-light.json` SHA-256 must differ from
  `1a261c4a2e2172683e91a52ddc33b02ff41e74760c861dfacb29c60a8d8671b0`. The
  `sha256(JSON.stringify(openapi.paths["/api/research"].get["x-routing"]))` value must differ from
  `468a9d9834e8cb50cb905f80ccc42f9d3daa7a3d0ff2d8c5194d566812ba716b`. Routine inventory drift
  alone does not fire PH1. The drift lane may run the free `npm run eval:protocol-history`
  diagnostic and record both contract counts. PH1 does not authorize a new mechanism.
- **PH2 — completed owner contract decision.** The versioned v2 contract uses 19 required, nine
  forbidden, and four neutral cases. It preserves the 19-of-19 required bar and all v1 evidence.
- **PH3 — new non-card evidence box.** The owner can open a box for corpus-derived route vocabulary
  or another named non-card source. The brief must carry every pre-registration item from the
  attempt-three brief, section 16. Independent review must pass before any fetch.
- **PH4 — new live routing evidence.** Two cases must show the same absent-lane pattern. They must
  use different question families and entities. Neither can paraphrase a frozen positive. Each case
  needs a dated transcript. PH4 opens a TODO note and a token-reachability audit. The owner then
  decides whether the new evidence opens PH3. PH4 does not open a mechanism box by itself.

Run `npm run eval:protocol-history` as a free diagnostic after changes to `src/catalog/**`,
`catalog/manifest.json`, `scripts/build-catalog.mjs`, or
`src/catalog/vendor/search-scoring.ts`. Record the counts. Keep this lane diagnostic-only.

Done when: a later reviewed mechanism passes both v2 contracts and all routing gates. That requires
19 of 19 required top-five hits and zero captures among nine forbidden cases. Neutral cases remain
diagnostic. The attempt-three section 8 table remains historical and is not the current ship gate.
One new target capture or one-case improvement does not close this item.

Filed here and not in `improvements/`: the data is reachable, so there is no upstream gap. This is
our ranking.

### Preserve structured routing intent across extraction caps and gate tiers

Trigger only after the current truth-maintenance round closes and the owner authorizes a general
Raven scoring repair. The 2026-09-03 Scout routing attribution found eight real regressions from
phrase flattening, first-token truncation, generic schema-word coverage, substring coverage, and
five weak gated rows. It also found valid leaderboard and RFP gains. This item does not authorize
the rejected Scout surface, a routing-baseline change, operation-specific exceptions, or
question-specific exceptions. Keep the protocol-history measurement source-expired for the rejected
Scout surface.

Keep phrase and field boundaries from `x-routing` during scoring. Replace first-token truncation
with deterministic fair allocation. Retain specific older intent when a source adds long sections.
Stop generic response-property names and unrelated substrings inside schema words from satisfying
the coverage gate. Let strong ungated cross-service evidence compete with five weak gated rows.
The 2026-09-04 category check is another instance. A controlled-vocabulary operation did not reach
the top five for two general directory-taxonomy queries. The existing compiled category case also
missed its expected operation. Do not add query wording or an operation exception. Include this
family in the next reviewed general scoring design.
This item also owns the `sls-078` residual. Scout fixed its quality `x-routing`
contract in 1.9.13. The reviewed 1.9.23 candidate still caused 90 unrelated
`scout.getQualityReport` captures through Raven response-schema keywords. Keep
`GET /api/quality` excluded until this general repair passes. Do not create a
separate routing TODO or upstream successor.

Acceptance checks:

1. Protocol-history additions do not remove `yieldblox` or `reflector` intent.
2. `through`, `network`, `each`, and `walk through` cannot route alone.
3. `contract` cannot route `explainRepo` without a repository or code anchor.
4. Added `use` cannot promote `hackathonBrief` above account-merge Docs.
5. `has` cannot match inside the schema keyword `phase`.
6. Strong Docs evidence remains eligible after five weak gated Scout candidates.
7. All eight regression rows meet their clean grades.
8. The leaderboard and RFP improvements remain.
9. The full legacy, extended, skills, and holdout gates do not regress.
10. A controlled-vocabulary operation reaches the top five for general directory-taxonomy queries.

Done when: all ten acceptance checks pass in a reviewed general scoring change. The existing
protocol-history diagnostic stays source-expired until a separate accepted Scout source epoch exists.

## Eval instruments

### Monitor vendor short-token prefix matching

The 2026-09-01 token audit found no minimum length in the vendored scorer prefix rule.
The tokenizer keeps one-character tokens.
A description containing `a` therefore prefix-matches each query token that starts with `a`.
This is a single-source observation. Do not edit the vendor file from this observation.
The record is `.agents/rounds/2026-09-01-protocol-history-attempt-three.md`.
The rule lives in `src/catalog/vendor/search-scoring.ts`. Its current SHA-256 is
`718924d10533ea49d472602f600ece0e4d7a0aae3e9e0ca5a95d9a8c6e611b14`.

Done when: a case from a different question family and primary service shows short-token coverage
inflation, or a re-vendor changes the file hash.

### Monitor Raven capability-boundary offers

Case `q-n3-missing-funds-account-support` offered a later Raven lookup by G-address or transaction
hash. Raven exposes no account-scoped lookup. The answer was a no-tool answer. Control case
`q-jutsu-check-account-history` asks for public lookup guidance that another service can perform.
A valid mechanism must not suppress that guidance.

The rejected capability-boundary Method 1 added prose to `eval/qa/run-qa.mjs:agentPrompt`. Its
environment pin differed, so it is invalid as a measurement. Its five-track T3 safety failure is
one observation. The prompt mechanism was withdrawn. The capability-boundary Method 2 was the
deterministic sample-30 headline with an offline plan regrade. It did not run. Both
capability-boundary authorizations are spent. The five-track Method 2 is separate and complete.

The free evidence record is
`.agents/rounds/2026-09-01-next-actionable-blocks/raven-free-evidence.md`. Its all-answer screen
scanned 338 local result files, 4,891 rows, and 2,406 answers. It adjudicated 51 high-recall offer
candidates. Six offers were unsupported, and no additional unsupported offer appeared. Its
separate no-tool screen scanned 44 explicit no-tool answers and adjudicated 17 candidates. The
same six offers remain unsupported. Five repeat this trap case. One appears in the Friendbot case.
No direct shipped prose advertises an account or transaction lookup. The generated micro-map gives
Data/RPC documentation and skill guidance, but does not expose an account query. The evidence
shows repeated QA behavior, but it does not identify a shipped Raven cause.

The `--expect-agent-environment-sha256` guard now fails before any answering-agent or judge call.
Matching runs stamp the expected and observed identities. Its CLI tests cover a match and every
rejected flag form. Rejected stored-judge and collection runs record zero paid-call attempts.

The owner selected monitor-only on 2026-09-03. Muse Spark 1.3, Fable 5.1, and Kimi K3 independently
supported that classification. No active diagnostic or product change remains.

Reopen a free cause audit after any production occurrence, any transcript showing an attempted
account-scoped operation, or any direct model-facing prose that advertises the capability. A third
distinct QA case can also reopen the free audit. It does not authorize a product change.

Any later plan must name the surface owner and an observable product hypothesis. It must use a
mechanism that reaches no-tool answers. Another QA-prompt wording layer is spent. Do not copy case
facts, identifiers, or redirect lists into a prompt. Include the trap, the control, the environment
pin, and a pre-registered product gate.

The design record from closed PR #103 is at commit `fb9a35eb`. Fetch it with
`git fetch origin pull/103/head` if needed. Its result artifact is not a durable baseline.

Authorization boundary: a fired trigger allows free scans, inventory, plan writing, and independent
plan review. A focused diagnostic needs its own bounded authorization. A headline sample needs a
separate authorization after the focused diagnostic passes. Denominators never merge.

Done when: the owner retires the monitor, or a fired trigger leads to a reviewed resolution.

### Resolve paired-QA design before promotion

`qa-paired-ordinal-ni-v1` is implemented, experimental, and not a ship gate. No same-tuple pinned
pair exists. The 2026-08-30 artifact used rubric `v2.9`; the target rubric is `v2.10`.

The method selects 100 IDs and requires 100 eligible IDs after five-track T4 and T5 exclusions.
The validator reports a 99.356% terminal `INDETERMINATE` rate under its selected-100 missingness
assumptions. The real run lost one ID and returned `INDETERMINATE` at 99 eligible IDs. A
candidate-only T4 also forces `INDETERMINATE`; the validator reports 64.079% blocking under its 1%
assumption.

Permitted now: extend the free validator to evaluate a pre-registered selected denominator above
100. Review denominator and candidate-only rules before the first new look. Never change either
rule after reading a paid look.

The spend trigger is a merged product candidate that needs a paired look, plus a recorded owner
margin. Do not collect a pair for calibration alone. Two new same-tuple collections cost about
`$82`; the stored range is `$64` to `$92`. Each collection needs a reviewed brief and its own cap.

Before the next collection, decide whether the optional one-row rubric `v2.10` rejudge of
`q-eco-stellar-wallets-list` is still useful. It is judge-contract evidence only and needs its own
small authorization.

Done when: two complete arms share the answering model, judge model, rubric, pack, pinned register,
environment hash, agent binary, and implementation hash. At least 100 IDs remain eligible. Then
`npm run eval:qa:paired:validate -- --recalibrate <baseline> <candidate>` passes, and a round ledger
records the promotion decision.

### Monitor Friendbot network-context synthesis

Case `q-edge-send-me-free-xlm` called Friendbot Testnet-only. The transcript made no tool call.
Stellar Docs expose Testnet, Futurenet, and local Quickstart distinctions. This is one answering
failure, not an upstream finding or a prompt-repair decision.

Done when: the same wording defect appears in a second unrelated case, a contract mismatch appears,
or trace evidence shows the prompt requests the wrong behavior. An unrelated case uses a different
question family and primary service. A paraphrase of the first case does not count. Record every
recurrence with its case ID, result stamp, and transcript.

## Deferred programs

### Re-evaluate Scout exposure after a routing-contract change

Trigger only when a new Scout inventory changes `GET /api/quality` or `GET /api/verify`
`x-routing`, description, request schema, or response schema. A version-only change does not trigger
this work.

Before an exposure candidate, rebuild the catalog and generated surfaces. Run the focused exposure
tests and `npm run eval:routing -- --gate` without changing `eval/gates.json`. Compare the candidate
against the committed 1.9.1 surface. Record the manifest hash and all routing lane totals.

Done when: a changed routing contract passes the existing gate and an independent review accepts the
exposure decision. Otherwise, keep both operations in `EXCLUDED_SCOUT_OPS`.

### Keep `sources.locate` deferred

The owner deferred the program on 2026-08-28. The design and reopen rule live in
`ideas/source-delivery-ranked-references.md` section 8. Its twelve design questions are not current
owner questions.

Every verified incident must prove source coverage rather than routing, answer craft, judge error,
or golden error. It must meet all four section 8 conditions. Condition 3 requires live
repository-recovery steering. No such steering is live because recovery v2 was rejected.

Log incidents that meet conditions 1, 2, and 4 in the recovery item. Do not count them until
condition 3 is satisfied. No trigger authorizes implementation.

Done when: the full section 8 trigger fires and the owner approves a phase-zero study, or the owner
retires the program.

## Owner decisions

Owner decisions that block agent work are listed once, in `NEXT.md` under "Owner decisions".
Record each answer there or in `eval/qa/README.md`, then delete the question.
