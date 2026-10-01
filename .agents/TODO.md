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
3. Complete the private usage checks ("Usage archive follow-up" below).

Binding spend rules: no paid method runs without its own written authorization, and a diagnostic
budget never transfers to headline collection. Use [the evaluation map](../eval/EVALS.md) and the
`run-evals` skill for the measurement sequence.

## Adapters

### Apply the documented `hitsPerPage` default on the three stellarDocs operations that pass it through

Found on 2026-09-21 by validating every stellarDocs operation against live responses.
`search_docs`, `search_doc_titles`, and `search_meeting_notes` map `hitsPerPage` straight to Algolia
and document `default: 5`. When the caller omits it, the adapter sends no value, so the index
default applies and the call returns 20 hits. The over-fetching operations are not affected: they
slice to the documented default. Logged external-harness calls omitted the field rarely, and never
together with `includeContent: true`.

Done when: the adapter sends the documented default, or the schema states the real default, and a
test pins the behavior. Either choice changes what an agent sees, so measure it before shipping.

### Fetch stellarDocs `content` only for the hits that are returned

Found on 2026-09-19 while wiring `includeContent`
([ledger](rounds/2026-09-19-stellardocs-include-content.md)). The eight client-filtered stellarDocs
operations over-fetch 100 hits and keep at most 20. With `includeContent: true`, the adapter
retrieves `content` for all 100. A 2026-09-21 measurement over 17 live queries found a larger
upstream payload (median 93 KB to 145 KB) and no latency change. This is a payload cost, not a
correctness defect. A two-pass design (filter without `content`, then fetch `content` for the kept
hits) removes the waste.

Done when: the upstream request carries `content` only for returned hits, or a measurement shows the
single-pass payload is acceptable and this item is closed with that evidence.

## Skill system

Found by the [skill system audit](rounds/2026-09-30-skill-system-audit.md) and its independent
reviews.

### Decide whether to track the skills.stellar.org Community section

The `https://skills.stellar.org/` index has a Community section with skills that are not in the
Stellar Light directory snapshot, for example `soroban-common-mistakes`, `pollar-wallet-auth`,
`sub-rosa`, `caatinga`, and `nirium-agentic-payments`. `ecosystem-skills/catalog.json` snapshots
only `stellarlight.xyz/api/skills`, so these candidates are invisible to the drift check and
`INDEX.md`.

Done when: the index is either snapshotted beside `catalog.json` or recorded as out of scope with a
reason.

### Make the drift check's cherry-pick mode explicit

`scripts/check-skills-drift.mjs` `unclassifiedSkillDirs` enumerates a source only when
`groups.json` `unpinnedUpstream` has an entry for it. A new cherry-picked source with an empty map
gets no sibling check. The README tells operators to record the first exclusion, but the code still
infers the mode.

Done when: the pick mode comes from the manifest or `update.sh` source definition, and a test covers
a cherry-picked source with no exclusions and one new upstream sibling.

## Golden truth

### Reconcile Soroswap API and contract scope in sibling grader notes

The September 17 golden audit found ambiguous SDEX routing notes in `q-eco-dex-saturation` and
`q-defi-soroswap-vs-stellarx`. Soroswap API quotes can include SDEX, while its deployed aggregator
lists three AMM adapters. Do not treat those surfaces as identical. Use the `golden-truth` workflow.

Done when: independently verified notes preserve this distinction, and the corpus and sibling
checks pass.

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

### Recheck three dated upstream leads from the GT-41 and GT-43 audits

Found in dated golden-truth audits on 2026-07-10 and 2026-07-11. These are leads, not confirmed
current defects. None is verified or filed, and none fits the current `improvements/` service map.

- Recheck the GT-41 scaffold dependency failure with current supported versions. The report
  observed `ed25519-dalek` 3.0 resolving under `soroban-sdk` 26.1 and 27.0. Incompatible random
  traits then broke `cargo test`; pinning 2.2.0 made the SDK-27 test pass. Reproduce before filing
  against `stellar/rs-soroban-env`, or close the lead with evidence.
  [Dated GT-41 evidence](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/research/audits/2026-07-10-gt41-soroban-empirical-findings.md).
- Recheck the GT-41 CLI template version decision with the `stellar/stellar-cli` owner. The report
  observed CLI 27.0.0 generating a `soroban-sdk = "26"` template. Confirm whether protocol-support
  policy explains the difference before treating it as a defect.
  [Dated GT-41 evidence](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/research/audits/2026-07-10-gt41-soroban-empirical-findings.md).
- Recheck the GT-43 CAP-0075 selector and protocol-floor discrepancy with the protocol-spec owner.
  The report contrasts U32Val/P24 text with v25+ Symbol selectors and a P25 feature floor. Verify
  current specification and implementation evidence before filing or closing the lead. This
  candidate differs from `sd-048`, which concerns S-box degrees.
  [Dated GT-43 evidence](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/research/audits/2026-07-11-gt43-sac-sep41-bn254.md).

Done when: each lead is reproduced against current sources and filed through `improvements-pipeline`,
or closed with recorded evidence.

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
the current accepted source is Scout 1.9.54. Use current main and a fresh source snapshot for any
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

### Scope the Stellar Docs miss messages to the query

Found by the 2026-09-30 repository audit. Two soft-empty messages in `src/adapters/stellar-docs.ts`
claim corpus absence: the page-sections miss says "the path is not in the docs index", and the
ordinary search miss says "this topic is not in the docs corpus (zero is a reliable negative on this
index)". The adapter searches a bounded, filtered window of the index, so a miss proves only that
this query and window returned nothing (see `docs/stellar-docs.md`, "Result and absence
semantics"). These strings are model-facing, so a change alters agent behavior.

Done when: both messages use query-scoped language, a test pins the new wording, and a measured run
shows no verified answer regression before release.

## Dependencies

### Remove the vitest pool override when the pool updates

`package.json` `overrides` points `@cloudflare/vitest-pool-workers` 0.22.0 at `miniflare`
5.20260930.0-alpha and `wrangler` 4.145.0. Pool 0.22.0 pins `miniflare` 5.20260815.0-alpha and
`wrangler` 4.124.0 exactly, and those carry high advisories through `undici` 7.29.0 and `sharp`
0.35.2. Found by the `dependency-audit` issue on 2026-10-01. With the override, `npm audit` reports
no findings, `npm run test:smoke` passes, and every package uses one `workerd` version.

Done when: a pool release pins patched `miniflare` and `wrangler` versions, the override is
removed, and `npm audit` and `npm run test:smoke` still pass.

## Eval instruments

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

### Reconcile source-authority guidance for full-description clients

The September 17 audit found conflicting instructions in `EXECUTE_DESCRIPTION` and
`AUTHORITY_RULES`. The former says all factual questions use Docs first; the latter assigns
ecosystem facts to Scout or Lumenloop. The conflicting clause falls beyond Claude's 2,048-character
tool-description clip, so a clipped-client QA run cannot measure its correction. Evidence:
`research/audits/2026-09-17-routing-audit/direction-review.md`, section 8.

Use the existing source-family rule when removing the contradictory clause. Measure a
full-description client or Playground against protocol and ecosystem controls before release. Do
not add operation lists, entity examples, or a new routing field. The existing Playground runner
lacks answer-cost accounting and a judge dollar cap, so keep that comparison unlaunched until
budget enforcement covers both costs. Do not add a parallel evaluation runner.

Done when: one consistent authority rule reaches the relevant client, with no verified answer
regression.

### Monitor Raven capability-boundary offers

Case `q-n3-missing-funds-account-support` offered a later Raven lookup by G-address or transaction
hash. Raven exposes no account-scoped lookup, and the answer used no tool. Control case
`q-jutsu-check-account-history` asks for public lookup guidance that another service can perform; a
valid mechanism must not suppress it.

Current state: monitor-only by owner decision on 2026-09-03. A free scan of 338 local result files
found six unsupported offers (five in this trap case, one in the Friendbot case) and no shipped
prose that advertises an account or transaction lookup
(`.agents/rounds/2026-09-01-next-actionable-blocks/raven-free-evidence.md`). The prompt-wording
mechanism was withdrawn, and both capability-boundary authorizations are spent. Owner decision G
asks whether a third candidate case counts. The design record from closed PR #103 is at commit
`fb9a35eb` (`git fetch origin pull/103/head`).

Reopen a free cause audit after any production occurrence, any transcript with an attempted
account-scoped operation, any direct model-facing prose that advertises the capability, or a
confirmed third distinct QA case. A fired trigger allows free scans, inventory, plan writing, and
independent plan review. A focused diagnostic needs its own bounded authorization, and a headline
sample needs a separate authorization after that. Any plan names the surface owner and an
observable product hypothesis, uses a mechanism that reaches no-tool answers, and includes the
trap, the control, the environment pin, and a pre-registered product gate. Do not add another
QA-prompt wording layer or copy case facts into a prompt.

Done when: the owner retires the monitor, or a fired trigger leads to a reviewed resolution.

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

## Usage archive follow-up

### Verify scheduled collection and cleanup

The usage collector shipped on 2026-09-11. After its release, verify the next scheduled canary and
the daily retention cleanup in private storage. The hourly usage-health workflow detects stale
canaries and possible collection gaps. Keep production counts and request identifiers out of this
public task queue.

Done when: private operational checks confirm the scheduled canary and cleanup succeeded.

## Owner decisions

Each decision names the question, the evidence it needs, and the safe default. Record each answer
in a round ledger, `eval/qa/README.md`, or a decision record, then delete the decision here.

### A. Authorize the supervised paired subset measurement

The owner approved spend on 2026-10-01. Run on a weekend UTC day after signing the canonical plan hash.
Use [the run sheet](rounds/2026-10-01-backlog-closeout/paired-run-sheet.md).

After the run, or after a stop, either promote the launch tooling into `eval/qa/` with its test,
or delete the round's launch scripts, `paired-stability-register.json`, and
`test/qa-paired-launch.test.mjs` together. The test imports the scripts from the round folder.

### C. Golden truth and product judgment blockers

Evidence: `.agents/rounds/2026-09-03-truth-maintenance/golden-followup-fable.md`. No golden changes
from these items without a `golden-truth` edit and independent review. Recheck each question against
the current corpus first; the per-case truth metadata owns current dispute status.

- `q-scf-rfp-tooling`: does "developer tooling or indexing infrastructure" bind by the RFP-track
  definition or by each brief's Scout category?
- `q-sor-persistent-unbounded-collection-cap`: does an attributed, dated 64 KiB docs figure trip
  avoid item 2?
- `q-protocol-ledger-close-time`: does key fact 1 keep the live multi-ledger sample requirement, or
  accept a dated attributed Docs range? No exposed operation returns ledger close timestamps.
- `q-ti-historical-pointintime-balances`: do trade-implied USD prices from Hubble trade rows count
  as invented ledger-derived prices under avoid item 3?
- Compliance cluster (`q-pay-anchor-msb-licensing`, `q-pay-travel-rule-aid-flows`,
  `q-comp-finclusive-caas`, `q-crp-custodial-vs-noncustodial-wallets`,
  `q-crp-become-an-anchor-licensing`): expand ADR-0008 beyond three cases with independent review,
  or keep the goldens strict and route the gap to a coverage diagnostic?
- `q-edge-metamask-evm-mental-model`: move the case from `stable` to `scheduled` with a re-verify
  cadence? The answer carries a dated third-party Snap claim.
- `q-defi-aquarius-what-is`: should key fact 3 bind on the tested surface? No exposed surface hosts
  the Aquarius ICE documentation.

Safe default: no golden change.

### D. Adjudicate the candidate row-review disagreements

Question: for each row below, does the recorded grade stand? Evidence: the raw transcripts in the
stopped 2026-09-04 candidate artifact and the three shard reports. A paid rejudge needs its own
small authorization. No artifact is rewritten, and no grade change affects any claim, because the
artifact is diagnostic.

- Judge-artifact sentences: `q-comp-finclusive-caas`, `q-edge-scf-v7-centralization-myths`,
  `q-ti-stellar-lab-usage-and-new-ui`, `q-ti-scout-refresh-cached-rows`.
- Nine disputed `correct` grades from the Scout and Lumenloop shard, listed in the ledger.
- Two disputed avoid matches: `q-edge-send-me-free-xlm`, `q-soroban-x402-auth-entry-signing`.
- Two three-way ties resolved to wrong: `q-eco-dex-saturation`, `q-eco-stablecoins-on-stellar`.
- Two trap goldens with tone or scope requirements to confirm: `q-edge-oos-solana-vs-aptos` and
  `q-n3-wallet-hacked-support-redirect`.

Safe default: no rejudge spend; grades stand as diagnostic values.

### G. Confirm the Raven capability-boundary third case

Question: does `q-n3-wallet-hacked-support-redirect` count as the third distinct QA case with an
unsupported account-lookup offer? In the stopped artifact `2026-09-04T05-40-51-variantA.json`, the
row offered to trace funds through Horizon or Stellar Expert queries, which Raven does not expose,
and made no tool call. Evidence:
`.agents/rounds/2026-09-03-truth-maintenance/candidate-row-review-skills-none-fable.md`. A confirmed
trigger allows a free cause audit only. No prompt, paid diagnostic, or product change follows from
confirmation.

Safe default: not confirmed.

### H. Select harness follow-ups from the candidate audit

Question: which of these recorded candidates become TODO items? Evidence:
`.agents/rounds/2026-09-03-truth-maintenance/post-candidate-measurement-fable.md` and
`candidate-row-review-skills-none-fable.md`.

- Store per-row start and end timestamps and a per-row identity vector in the result schema.
- Record per-turn cost in `agent.usage.perTurn`.
- Add a serialization hint to the sandbox error path.
- Randomize row order or interleave categories in long live runs.
- Give the judge source-basis evidence on stable rows, or state that stable-row specifics are
  unverifiable.
- Remove the stable-row gate that hides wrong-claim rows from `evidenceSupportCheck`.
- Treat boundary rows skipped by the panel cap as low confidence in flip analysis.
- Add a harness metric for planning text that leaks into final answers.
- Record capability self-description drift in zero-tool refusals.

Safe default: none scheduled.

### I. Decide the optional one-row rubric `v2.10` rejudge

Question: is the one-row rubric `v2.10` rejudge of `q-eco-stellar-wallets-list` still useful before
the next paired collection? It is judge-contract evidence only, and it is paid, so it needs its own
small authorization.

Safe default: no spend.

### K. Decide exposure for the Stellar Light SCF skills

Question: pin some, all, or none of the twelve `scf-*` skills from
`Stellar-Light/awesome-stellar-community-fund` (MIT; the copyright line names LumenLoop). They are
in the directory snapshot in `ecosystem-skills/catalog.json`, but no pin decision exists. SCF work
is a main Raven use case. Overlap to resolve: the exposed `skills.lumenloop.scf-submission-radar`
and `skills.stellar-light.stellar-scout` already cover SCF positioning and pitch drafting. The
repository uses the standard `skills/` layout, so pinning needs no `update.sh` code change.

Evidence: the body read in `.agents/rounds/2026-09-30-raven-next/scf-skill-bodies-astra.md`
(upstream HEAD `b9a1509f`), judged against the admission bar in `ecosystem-skills/README.md`
"Adding a source". Verdicts: eleven `fit` as reference content, and one `no fit`
(`scf-round-reviewer`, which depends on an absent `CLAUDE.md`, local CSV files, and external skill
packages). Caveats the decision must weigh:

- Four bodies link to root `docs/` files, and the submission drafter requires the root template.
  The standard `skills/` selector does not pin either.
- `scf-live-context` identifies the round from an open RFP row. That conflicts with the pinned
  Scout body and the current `scout.getRfps` schema, a content defect to resolve before admission.
- `scf-fetch-external-doc` and the referral, tranche, and round bodies carry credential, sharing,
  or install prompts that admission must record.
- The fetch skill's frontmatter name is `fetch-external-doc`.

Safe default: not pinned, with this decision recorded.
