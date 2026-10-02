# TODO — own-repo work queue

Own-repo fixes only: adapters, normalizers, catalog, executor, scoring, eval instruments, goldens,
gates, and documentation. Upstream service defects go to `improvements/` instead — see
`improvements/README.md` for the routing rule.

Add an item when you find work you are not doing now. Delete it when it is done; git history is the
archive. Each item states what is wrong, how it was found, the current state, and what "done"
means. Keep each item short; link the round ledger for its history.

Open owner decisions are at the end of this file. Each one is listed once.

## Priorities

1. Resolve the general routing and source-authority work from the
   [routing audit](rounds/2026-09-17-routing-audit.md) (Routing and Eval instruments below). Keep
   the current scorer until a general repair passes.
2. Follow the upstream Docs and protocol pull requests for `sd-027`, `sd-034`, and `sd-037`.

Binding spend rules: no paid method runs without its own written authorization, and a diagnostic
budget never transfers to headline collection. Use [the evaluation map](../eval/EVALS.md) and the
`run-evals` skill for the measurement sequence.

## Improvements follow-up

### Re-check `sd-027` and `sd-034` after PR #2837 receives a maintainer decision

The maintainer named https://github.com/stellar/stellar-docs/pull/2837 as the replacement for the
closed PR #2367. The reviewed repair is at head `108ba24e0884f46e0c543996e4e94be754709840`. On
2026-09-29, all nine checks passed and the review decision was `REVIEW_REQUIRED`. Required
maintainer approval and the author's explicit merge hold remain.

Re-check the PR at the next improvements round, or earlier if its head changes or it closes. If it
merges and deploys, run both original live page checks before changing either finding. Do not post a
status comment while the maintainers are working on the decision. History:
`.agents/rounds/2026-09-16-maintenance-execution.md` and
`.agents/rounds/2026-09-21-improvements-followup.md`.

Done when: each finding records the resulting live state, and any fixed finding completes the
resolver gates.

### Re-check `sd-037` after stellar-protocol PR #2021 receives a maintainer decision

The stale bot closed issue https://github.com/stellar/stellar-protocol/issues/1981 as
`NOT_PLANNED`; no maintainer made a scope decision, and the owner decided not to reopen it. The
author-owned fix is https://github.com/stellar/stellar-protocol/pull/2021. It adds the SLP list to
`limits/README.md` and an SLP mention to the root README, and it offers to drop the table if the
maintainers do not want to maintain it. Commit `65d35aebf3ae3d5b9094b36959c27d9b8540e2a0` answers
the Copilot review; all four checks passed on 2026-09-29. On 2026-09-30, `leighmcculloch`
(`MEMBER`) approved head `777561b2`
(https://github.com/stellar/stellar-protocol/pull/2021#pullrequestreview-5358887566), but GitHub
reports `mergeable_state: blocked`, so a second condition still holds the merge. The default-branch
READMEs still lack the SLP index, and the finding stays `reported-upstream`. Do not post a reminder
because of the approval.

At the next improvements round, read the merge blocker, the PR state, and any new review, and
respond to requested changes.
The stale workflow marks a quiet PR after 30 days and closes it 30 days later. Do not post a
keep-alive comment. If the PR closes unmerged, record the reason and keep the finding. If it merges,
re-run the two README source checks before changing the finding.

Done when: the finding records the merged or declined result, and a fixed finding completes the
resolver gates.

### Monitor the Horizon protocol-ceiling note behind the rejected recovery experiment

The rejected `repository-tooling-recovery-v2` implementation does not ship
([closeout](rounds/2026-08-31-rejected-experiments-closeout.md)). Its freshness blocker is the
Scout DeepWiki note for `stellar/stellar-horizon`. The 2026-09-29 monitor failed: the answer gave
`28`, while the source at the response's `scannedRef` defined `29`. The active finding is
`improvements/stellar-light-scout/sls-087-horizon-protocol-ceiling-note-stale.md`; the retired
predecessor receipt is `sls-080` in `improvements/resolved.json`.

During each improvements or drift round, run one free `scout.explainRepo` reading against the
existing local Raven server for `stellar/stellar-horizon`: "Which Horizon ingestion constant pins
the highest supported protocol version, and what is its value?" Record the value, `generatedAt`,
`scannedRef`, and `answerSource` in the round ledger. The blocker clears only when the answer
equals the source value at the response's own `scannedRef`.

Reopen rules: the selection trigger is three qualifying positive operation-selection misses after
recovery. The Docs-versus-repository conflict stays monitor-only until three dated successful
re-executions of the Docs-first, inspect, then one-later-`scout.explainRepo` sequence. A matching
free reading does not authorize paid collection. A new recovery plan must cite ADR-0008, keep the
10-of-12 positive and 0-of-8 premature-detour gate, and pass an independent plan review and its own
spend authorization. The G1 candidate record is in closed PR #102 at commit `6baec0a4`
(`git fetch origin pull/102/head`).

Done when: a reviewed v3 plan passes ADR-0008 and ships, or the owner retires this recovery program.

## Routing

### `search` does not surface the research lane for protocol-history questions

Eval case `q-protocol-24-whisk-incident` asks why Protocol 24 followed Protocol 23 so quickly.
`scout.searchResearch` holds every required fact (`source: "cap"` and a broad call together return
478, 84, 77, 394, 31879035, `CAP-0076`, and Hot Archive). `search` does not rank it in the top ten
for the case's own wording; `stellarDocs.*` operations win. The lane already advertises incident
reports, so this is a ranking defect, not a description gap. Filed here and not in `improvements/`:
the data is reachable, so there is no upstream gap.

Current state: three reviewed mechanism attempts (`clause-fit-hysteresis-v1`,
`cross-encoder-fit-v1`, `clause-support-fit-v1`) failed the routing gates, and the three-attempt box
is spent. Records: `.agents/rounds/2026-08-31-protocol-history-cross-encoder-v1.md`,
`.agents/rounds/2026-09-01-protocol-history-attempt-three.md`, and
`.agents/rounds/2026-09-02-protocol-history-free-evidence.md`. The owner set the v2 contracts on
2026-09-03 (`.agents/rounds/2026-09-03-owner-decisions.md`): 19 required, nine forbidden, and four
neutral cases. Both v2 contracts pin manifest epoch `4cd28f4b…fe8b`, so
`npm run eval:protocol-history` stops as `source-expired` before scoring. That stop is correct. Do
not repin the v2 epoch; a new epoch needs a new independently authored contract after an accepted
source freeze (PH3).

Triggers:

- **PH1 — dual upstream card change.** Both hashes must change together. The
  `inventory/stellar-light.json` SHA-256 must differ from
  `1a261c4a2e2172683e91a52ddc33b02ff41e74760c861dfacb29c60a8d8671b0`, and
  `sha256(JSON.stringify(openapi.paths["/api/research"].get["x-routing"]))` must differ from
  `468a9d9834e8cb50cb905f80ccc42f9d3daa7a3d0ff2d8c5194d566812ba716b`. Routine inventory drift alone
  does not fire PH1. The drift lane may run the free `npm run eval:protocol-history` diagnostic and
  record both contract counts. PH1 does not authorize a new mechanism.
- **PH2 — owner contract decision.** Complete (the v2 contracts above).
- **PH3 — new non-card evidence box.** The owner can open a box for corpus-derived route vocabulary
  or another named non-card source. The brief must carry every pre-registration item from the
  attempt-three brief, section 16. Independent review must pass before any fetch.
- **PH4 — new live routing evidence.** Two cases show the same absent-lane pattern, from different
  question families and entities, neither paraphrasing a frozen positive, each with a dated
  transcript. PH4 opens a TODO note and a token-reachability audit. The owner then decides whether
  it opens PH3.

Run `npm run eval:protocol-history` as a free diagnostic after changes to `src/catalog/**`,
`catalog/manifest.json`, `scripts/build-catalog.mjs`, or `src/catalog/vendor/search-scoring.ts`.
Record the counts when the contracts are eligible, and `source-expired` when they are not.

Done when: a later reviewed mechanism passes both v2 contracts and all routing gates: 19 of 19
required top-five hits and zero captures among the nine forbidden cases. Neutral cases stay
diagnostic. One new target capture or one-case improvement does not close this item.

### Preserve structured routing intent across extraction caps and gate tiers

The 2026-09-03 Scout routing attribution found eight real regressions from phrase flattening,
first-token truncation, generic schema-word coverage, substring coverage, and five weak gated rows.
It also found valid leaderboard and RFP gains. Rejected search and Scout candidates are retired
([disposition](rounds/2026-09-09-outstanding-closeout.md#rejected-candidate-retirement--2026-09-10));
the current accepted source is Scout 1.9.61 (absorbed 2026-10-02). Use current main and a fresh source snapshot for any
later authorized repair.

Trigger only after the owner authorizes a general Raven scoring repair. This item does not
authorize a routing-baseline change, operation-specific exceptions, or question-specific
exceptions.

Required direction: keep phrase and field boundaries from `x-routing` during scoring. Replace
first-token truncation with deterministic fair allocation. Retain specific older intent when a
source adds long sections. Stop generic response-property names and unrelated substrings inside
schema words from satisfying the coverage gate. Let strong ungated cross-service evidence compete
with five weak gated rows.

Exposure held by this item: keep `GET /api/rwa` excluded until check 8 passes;
[issue #167](https://github.com/stellar-experimental/stellar-raven/issues/167) tracks its three
deferred controls (`rounds/2026-09-16-scout-acceptance.md`). Keep `GET /api/quality` excluded
(`sls-078` residual: response-schema keywords caused unrelated `scout.getQualityReport` captures).
Do not create a separate routing TODO or upstream successor for either. Three mixed-intent
controls run as `it.fails` in `test/drift-141-routing.test.ts`. Remove those markers after the
general routing repair passes.

Acceptance checks:

1. Protocol-history additions do not remove `yieldblox` or `reflector` intent.
2. `through`, `network`, `each`, and `walk through` cannot route alone.
3. `contract` cannot route `explainRepo` without a repository or code anchor.
4. Added `use` cannot promote `hackathonBrief` above account-merge Docs.
5. `has` cannot match inside the schema keyword `phase`.
6. Strong Docs evidence remains eligible after five weak gated Scout candidates.
7. All eight regression rows meet their clean grades.
8. A general RWA query reaches `scout.getRwaAssets`, while unrelated Friendbot, RPC, WASM,
   simulation, and balance questions do not capture it.
9. The leaderboard and RFP improvements remain.
10. The legacy, skills, and holdout routing gates pass. The extended diagnostic shows no regression.
11. A controlled-vocabulary operation reaches the top five for general directory-taxonomy queries.

Done when: all eleven acceptance checks pass in a reviewed general scoring change. The
protocol-history diagnostic stays source-expired until a separate accepted Scout source epoch exists.

## Dependencies

### Remove the vitest pool override when the pool updates

`package.json` `overrides` points `@cloudflare/vitest-pool-workers` 0.22.0 at `miniflare`
5.20260930.0-alpha and `wrangler` 4.145.0. Pool 0.22.0 pins `miniflare` 5.20260815.0-alpha and
`wrangler` 4.124.0 exactly, and those carry high advisories through `undici` 7.29.0 and `sharp`
0.35.2. Found by the `dependency-audit` issue on 2026-10-01. With the override, `npm audit` reports
no findings, `npm run test:smoke` passes, and every package uses one `workerd` version.

Done when: a pool release pins patched `miniflare` and `wrangler` versions, the override is
removed, and `npm audit` and `npm run test:smoke` still pass.

### Upgrade `ai` and `@ai-sdk/*` past the OpenAI tool-strictness default change

The lockfile holds `ai` 7.0.79 and `@ai-sdk/openai` 4.0.47.
On 2026-10-02, an in-range update to `ai` 7.0.127 and `@ai-sdk/openai` 4.0.83 passed the free gates.
The lead held the update after an independent review.
`@ai-sdk/openai` 4.0.77 changed an omitted tool `strict` from "not sent" to `strict: false`.
The Playground tools set no `strict` (`src/demo/tools.ts`).

The [OpenAI function-calling guide](https://developers.openai.com/api/docs/guides/function-calling#strict-mode) defines both cases.
With `strict` omitted, Responses attempts strict mode and normalizes the schema.
It falls back to non-strict function calling when it cannot convert the schema.
With `strict: false`, it uses non-strict, best-effort function calling from the start.
The update is a confirmed request change with a possible behavior effect.
No live run has shown which mode the server selects today.

`test/smoke/demo-openai-tool-request.test.ts` pins the request from the production tool builder.
It fails on the updated lockfile and on any explicit `strict` in `src/demo/tools.ts`.
The review also lists other active-path entries: stream error normalization, tool-output serialization, Responses usage handling, and schema normalization.
Evidence: `rounds/2026-10-02-raven-next-followup.md`, its `review-ai-plan-astra.md`, and `ai-bump-lockfile.patch`.

First decide the strictness on purpose in `src/demo/tools.ts`.
The unchanged `search` schema does not meet the documented requirements for explicit `strict: true`.
It has six properties and requires one.
A schema with required fields that accept `null` can support strict mode.

Then measure the update on the Playground.
The lead recommends the judged, two-repetition design of `rounds/2026-10-01-backlog-closeout/authority-plan.md`.
Strictness can change answers, not only the loop.
That plan also supplies the receipt gate with usage correlation and the current Gateway headroom check.
It supplies the server-slot rule and the source-probe stop rule too.
Save `demo-step` events to check the final tools-disabled step.

Do not run or merge the update during the owner's paired collection window.

Done when:

- the tools state their strictness on purpose;
- a measurement shows no routing regression and no verified answer regression;
- the request-shape test records the reviewed shape.

## Eval instruments

### Extend Playground eval accounting to native and no-plugin model paths

The [accounting coverage review](../research/audits/2026-10-01-playground-accounting-coverage.md) reproduced refusals for
`@cf/moonshotai/kimi-k2.7-code` and `moonshotai/kimi-k3` before upstream access.
Keep the guard until these paths support complete accounting.

Done when: native and no-plugin chat calls request `returnRawResponse: true`, capture the log identifier,
and preserve the shared settlement and budget checks.
Return the response body stream or parsed JSON that the installed native parser expects.
Keep returning the full `Response` for existing raw-response callers.
Do not remove the guard and dispatch without a captured log identifier.
Add real-handler regressions for both named models and a fallback into a native model.
Require an answer, captured log reads, and a complete numeric receipt in each regression.

### Investigate missing source evidence in the p6 judge pack

The 2026-10-01 adapter comparison found a disputed Beans Wrong grade in
`eval/qa/results/2026-10-01T22-05-47-variantA.json` (`q-live-beans-cross-service-reconcile`).
The raw transcript contains the founder story, lifecycle claims, release tag, and SDK commit date.
The p6 pack omits those details, and the judges call them fabricated.
The result records `evidenceSupportCheck.status: pack-omission` and `requiresReview: true`.
The primary SDF article independently confirms the founder story.

Trace the general evidence-selection boundary and propose a repair with replayable coverage.
Do not change the frozen adapter-measurement artifacts or replace their original verdicts.
Any repaired pack needs a separate reviewed measurement before it supports acceptance.

### Re-check the upstream codemode short-token repair

The September 17 audit reproduced false routing across unrelated weather and billing operations.
The defect exists in codemode 0.4.2, 0.5.1, 0.5.2, and the tested upstream main revision.
[Cloudflare #2296](https://github.com/cloudflare/agents/issues/2296) owns the upstream repair; the
source record is `improvements/canonical-source/cs-001-codemode-search-short-token-prefix.md`.
Raven also has an ungated copy of the same prefix rule. Reverse-prefix deletion and standard
Porter stemming both failed routing coverage and do not ship. Do not replace them with query
exceptions or a tuned token-length threshold.

Done when: an upstream or general local repair passes the original triggers, positive controls, and
Raven routing gates. Keep the RWA exclusion until its three technical controls also pass.

### Revisit general directory admission after the rejected D3 experiment

The September 17 D3 deletion failed the predeclared answer gate and did not ship. The candidate
omitted the no-transcript warning present in the baseline A/V answer. Both arms reached the same
source, so the experiment does not establish a causal routing regression. The directory
field-placement exception remains a known design risk. Do not repeat D3 or add entity-specific
exceptions to make its examples pass. Evidence:
`research/audits/2026-09-17-routing-audit/m1-c1-passkeys-loss-review.md`.

Done when: a general mechanism passes frozen routing controls and independently reviewed answer
checks.

### Reconcile the QA answering prompt with out-of-scope goldens

The answering prompt asks for a plain, brief out-of-scope answer at `eval/qa/run-qa.mjs:749` and
`:767`. The goldens and rubric require decision support, acknowledgment, or alternatives. Evidence:
`q-edge-oos-solana-vs-aptos` requires a comparison framework after an honest coverage limit.
`q-n3-wallet-hacked-support-redirect` requires acknowledgment of the user's loss.
`eval/qa/README.md:220` rejects a bare refusal when the golden requires further helpful behavior.
Pattern 2 in [the Skills
report](rounds/2026-09-03-truth-maintenance/candidate-row-review-skills-none-fable.md) names this
measurement-contract tension.

Current state: the delegated October 1 adjudication preserves both the prompt and the goldens. The
owner can veto that adjudication. [The decision
record](rounds/2026-10-01-backlog-closeout/owner-adjudications.md) records the conflict. A prompt
change needs a separate reviewed decision and measurement.

Done when: a reviewed decision either changes the prompt with a measured before/after on the
out-of-scope cases, or records why the prompt stays. Land this change before the first paired arm or
after the second. A change to run-qa.mjs or judge.mjs changes the implementation hash.

### Monitor Raven capability-boundary offers

Case `q-n3-missing-funds-account-support` offered a later Raven lookup by G-address or transaction
hash. Raven exposes no account-scoped lookup, and the answer used no tool. Control case
`q-jutsu-check-account-history` asks for public lookup guidance that another service can perform; a
valid mechanism must not suppress it.

Current state: monitor-only by owner decision on 2026-09-03 (rounds/2026-09-03-owner-decisions.md).
The delegated October 1 adjudication confirmed `q-n3-wallet-hacked-support-redirect` as the third
distinct case. The free cause audit found seven unsupported offers among 44 stored no-tool answers.
It also confirmed the September 4 recurrence from the retained shard report. The current source
inventory identifies no causal shipped instruction or exposed account lookup. Keep the monitor; the
audit grants no prompt change, product change, or further spend.

The September 4 run also had five correct zero-tool refusals that described unexposed coverage
("on-chain data", "network state"). They are context for this monitor, not trigger events.

Evidence: [delegated adjudications](rounds/2026-10-01-backlog-closeout/owner-adjudications.md). The
prompt-wording mechanism was withdrawn, and both capability-boundary authorizations are spent. The
design record from closed PR #103 is at commit `fb9a35eb` (`git fetch origin pull/103/head`).

Reopen a free cause audit after any of these events:

- Any production occurrence.
- Any transcript with an attempted account-scoped operation.
- Any direct model-facing prose that advertises the capability.
- A new distinct QA case beyond the three already reviewed.

A fired trigger allows free scans, inventory, plan writing, and independent plan review.
A focused diagnostic needs its own bounded authorization.
A headline sample needs a separate authorization after that.
Any plan names the surface owner and an observable product hypothesis.
The plan uses a mechanism that reaches no-tool answers.
The plan includes the trap, the control, the environment pin, and a pre-registered product gate.

Do not add another QA-prompt wording layer or copy case facts into a prompt.

Done when: the owner retires the monitor, or a fired trigger leads to a reviewed resolution.

### Record QA attempt timestamps beside existing identity captures

The September 4 candidate audit reconstructed intervals from durations because rows lack absolute
start and end timestamps. The current runner records attempt durations and identity captures with
case IDs, attempt numbers, and vector hashes. The delegated resolution of owner decision H
(2026-10-01, owner veto open) schedules this remaining metadata work
([evidence](rounds/2026-10-01-backlog-closeout/owner-adjudications.md)).

Done when: saved attempts have start and end timestamps linked to the existing identity captures.
Tests cover success, retry, guard failure, and partial collection without changing order, spending,
grades, or comparability rules. Land this change before the first paired arm or after the second. A
change to run-qa.mjs or judge.mjs changes the implementation hash.

### Diagnose stable-row evidence omissions without changing judge inputs

The September 4 candidate audit found transcript-supported claims that judges called unsupported.
`attachTranscriptEvidenceDiagnostics` skips stable rows, and the pack builder also omits stable-row
evidence. Removing only the diagnostic condition would leave an empty pack. The delegated resolution
of owner decision H (2026-10-01, owner veto open) schedules an offline diagnostic design
([evidence](rounds/2026-10-01-backlog-closeout/owner-adjudications.md)).

Done when: a separate diagnostic inspects saved stable-row claims against saved execute evidence and
reports bounded support or uncertainty. Tests cover supported claims, unsupported claims, truncated
evidence, and missing transcripts. The change preserves judge inputs, grades, saved source
artifacts, rubric, pack version, and comparison denominators. Land this change before the first
paired arm or after the second. A change to run-qa.mjs or judge.mjs changes the implementation hash.

### Label skipped-panel uncertainty in flip reports

The September 4 candidate audit found 64 boundary rows whose panel escalation reached the cap. The
judge records the skipped escalation, but flip analysis needs a visible confidence distinction. The
delegated resolution of owner decision H (2026-10-01, owner veto open) schedules a reporting change
([evidence](rounds/2026-10-01-backlog-closeout/owner-adjudications.md)).

Done when: flip reports (eval/qa/re-judge.mjs --flips-vs and the paired report) identify rows with
panelEscalationSkipped: "max-panel-cases" separately. Tests cover both arms, absent metadata, and
actual panel results. The report preserves all selected IDs, grades, panel caps, and comparison
denominators.

### Measure planning text in saved final answers

The September 4 candidate audit found 155 possible planning preambles among 500 answers with a broad
regular expression. The answering prompt already prohibits this text, so additional prompt wording
lacks support. The delegated resolution of owner decision H (2026-10-01, owner veto open) schedules
an offline metric with reviewed positive and negative examples
([evidence](rounds/2026-10-01-backlog-closeout/owner-adjudications.md)).

Done when: a reproducible diagnostic reports reviewed planning-text matches and its false-positive
limits. Tests distinguish planning text from legitimate explanations of uncertainty and quoted
examples. The metric changes no answer, judge grade, prompt, or release gate.

### Resolve paired-QA design before promotion

`qa-paired-ordinal-ni-v1` is implemented, experimental, and not a ship gate. No same-tuple pinned
pair exists. The method requires 100 eligible IDs after five-track T4 and T5 exclusions; the one
real run returned `INDETERMINATE` at 99. The collection supervisor, identity guards, per-arm caps,
and the `qa-paired-collection-plan-v2` launch contract are in place; the contract is in
`eval/qa/README.md` and `eval/EVALS.md`. The revision 3 plan has an independent `LAUNCH-OK`
(`.agents/rounds/2026-09-03-truth-maintenance/final-launch-contract-review-opus.md`), which grants
no paid authority.

Permitted now: free validator work on a pre-registered selected denominator above 100, and a fresh
free capacity artifact for a chosen launch window (an artifact older than 24 hours at launch is
invalid). Never change the denominator or candidate-only rule after reading a paid look. Paid
collection waits for owner decision A.

Done when: two complete arms share the answering model, judge model, rubric, pack, pinned register,
environment hash, agent binary, implementation hash, probe hash, and remote identity vector; at
least 100 IDs remain eligible; `npm run eval:qa:paired:validate -- --recalibrate <baseline>
<candidate>` passes; and a round ledger records the promotion decision. Owner decision A recording
`NOT AUTHORIZED` also closes the paid part.

### Monitor Friendbot network-context synthesis

Case `q-edge-send-me-free-xlm` called Friendbot Testnet-only, with no tool call. Stellar Docs expose
Testnet, Futurenet, and local Quickstart distinctions. The same case was wrong again in the
2026-09-04 candidate artifact. This is one answering failure, not an upstream finding or a
prompt-repair decision. A repeat of the same case does not fire this monitor.

Done when: the same wording defect appears in a second unrelated case (a different question family
and primary service; not a paraphrase), a contract mismatch appears, or trace evidence shows the
prompt requests the wrong behavior. Record every recurrence with its case ID, result stamp, and
transcript.

### Monitor the Stellar Docs title-set size against the remote identity probe ceiling

The remote identity probe `eval/qa/probe-remote-identities.mjs` enumerates the public Docs `lvl1`
title set through Algolia. The public key clamps pages to 100 records, the index limits pagination
to 1,000 records, and the probe fails closed above ten pages. Found in
`.agents/rounds/2026-09-03-truth-maintenance/remote-identity-guard-review-opus.md` (item R4).

During each drift round, record the current title count from `inventory/stellar-docs-titles.json`.
Open a design item for a different enumeration strategy before the count reaches 1,000. A larger
page size cannot help because the index limit is the same.

Done when: a reviewed enumeration change removes the ceiling, or the owner retires the guard.

## Deferred programs

### Re-evaluate Scout exposure after a routing-contract change

Trigger only when a new Scout inventory changes `GET /api/quality` or `GET /api/verify` `x-routing`,
description, request schema, or response schema. A version-only change does not trigger this work.
Two earlier candidates were rejected
(`.agents/rounds/2026-09-03-truth-maintenance/final-routing-review-terra.md` and
`.agents/rounds/2026-09-03-truth-maintenance/scout-1.9.30-drift-terra.md`). The first review found
that `scout.verifyClaim` causes no routing regression on its own, but it may ship only after the
general Scout routing regressions receive an independent resolution.

Before an exposure candidate, rebuild the catalog and generated surfaces. Run the focused exposure
tests and `npm run eval:routing -- --gate` without changing `eval/gates.json`. Compare the candidate
against the current accepted surface, and record the manifest hash and all routing lane totals.

Done when: a changed routing contract passes the existing gate and an independent review accepts the
exposure decision. Otherwise, keep both operations in `EXCLUDED_SCOUT_OPS`.

### Keep `sources.locate` deferred

The owner deferred the program on 2026-08-28. The design and reopen rule live in
`ideas/source-delivery-ranked-references.md` section 8. Every verified incident must prove source
coverage rather than routing, answer craft, judge error, or golden error, and must meet all four
section 8 conditions. Condition 3 requires live repository-recovery steering, which does not exist
because recovery v2 was rejected. Log incidents that meet conditions 1, 2, and 4 in the recovery
item, but do not count them until condition 3 holds. No trigger authorizes implementation.

Done when: the full section 8 trigger fires and the owner approves a phase-zero study, or the owner
retires the program.

## Owner decisions

Each decision names the question, the evidence it needs, and the safe default. Record each answer
in a round ledger, `eval/qa/README.md`, or a decision record, then delete the decision here.

### A. Authorize the supervised paired subset measurement

The owner approved spend on 2026-10-01. Run on a weekend UTC day after signing the canonical plan hash.
Use [the run sheet](rounds/2026-10-01-backlog-closeout/paired-run-sheet.md).
Run it on a quiet machine. Under a heavy load average, the `ps` calls of the launch cleanup can
time out. Cleanup then stops safely for manual action and causes no extra spend.

After the run, or after a stop, either promote the launch tooling into `eval/qa/` with its test,
or delete the round's launch scripts, `paired-stability-register.json`,
`test/qa-paired-launch.test.mjs`, and `test/qa-paired-claude-pin.test.mjs` together. Both tests
import the scripts from the round folder.
