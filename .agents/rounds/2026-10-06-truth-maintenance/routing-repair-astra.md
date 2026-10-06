# Routing repair report — issue #223 — 2026-10-06

**No general repair found.** The four tested policies cause additional graded losses. None satisfies the brief.

I recommend **no `gates.json` re-baseline for this candidate**. Four losses reflect weaker operation selection. One loss reflects a narrow card label. The new SCF service-label gain does not establish better operation selection.

No production code, generated artifact, label, or gate changed. No local commit was necessary. The branch remains `drift/2026-10-06-repair` at `c76b517cb8d61c8094b4a8fa5fab1f6a379f965b`. I did not push, deploy, post to GitHub, or run paid evaluations.

## Scope and method

The baseline is `c06dadbda3503d63e6bc50acf1533a601f3d7b9c`. Its manifest SHA-256 matches the supplied baseline result: `efea602c3ea4f0e66e3f58273e0827e79cbaaa566430d267204fbaaf9e93afe6`.

Baseline result: `/Users/kalepail/Desktop/srcm-main-baseline/eval/results/routing-2026-10-06T14-11-02-076Z.json`.

Candidate result: [routing-2026-10-06T14-17-06-019Z.json](../eval/results/routing-2026-10-06T14-17-06-019Z.json).

I used the actual `searchCatalog` implementation and the routing runner. Temporary copies exposed private scoring functions without changing their behavior. The investigation compared all 19 entries with derived scoring-field changes. These include two new operations and schema-keyword changes beyond the rewritten routing text.

For every flip, I restored each changed entry's old fields separately, in memory. The fields were `description`, `keywords`, `routingKeywords`, `routingPhrases`, and `routingExclusions`. I also restored all five fields together. New-operation ablations removed that operation from the temporary catalog. Joint ablations checked interacting causes.

The scorer adds 20 points for an exact description token. It adds 10 for a prefix match, or 5 for a substring match. Routing vocabulary uses this description slot at full weight. Schema vocabulary receives 0.4 of its score difference. Coverage bonuses and admission rules can change separately.

The scorer counts repeated query occurrences for points. It counts unique matched tokens for coverage. Coverage divides by the full query-token count, including repeated tokens. All seven reported movements use the original query form. Stopword rescue does not supply their final scores.

Sources: [vendor scoring](../src/catalog/vendor/search-scoring.ts), [weighted scoring](../src/catalog/scoring.ts), [routing admission](../src/catalog/search.ts:517), and [tier ordering](../src/catalog/search.ts:1095).

## Per-flip causes and verdicts

| Case | Exact cause and score contribution | Verdict |
|---|---|---|
| `q-defi-agentic-payment-standards-compare` | `searchHackathonBuilds` gains exact `x402` through the new example and `x402 builds` keyword. Previously, the description token `X` supplied a prefix match. The contribution changes 10→20; the final score changes 202→212. Docs remains backfill at 326. Previously, 326 ≥ 1.6×202 = 323.2. Now, 326 < 1.6×212 = 339.2. Docs therefore moves from rank 3 to 4. | **Real regression.** Prototype search cannot compare the four standards. The appropriate payment skill remains first, but an unrelated operation now precedes Docs. |
| `q-defi-blend-alternatives` | The new example is `How crowded is lending on Stellar?`. Its single phrase matches `lending` and `stellar`. Positive admission coverage changes 1→2. The operation was rejected before scoring; it now enters at 189. Its numeric score does not change. Its base is 148; routing contributes 41. Both query occurrences of `lending` gain 20, plus one coverage point. It displaces semantic content search at 181. | **Real regression.** Category crowding and showcase samples cannot identify alternative lending protocols reliably. The operation does not support a project-name or similarity query. |
| `q-defi-rwa-overview` | The new event example contains `Stellar Hacks: Real-World ZK`. The phrase matches `stellar`, `real`, and `world`; positive admission coverage changes 1→3. The new description contains `what they became`: `what` adds 20 points and one coverage point. Base coverage changes 5/10→6/10; base score changes 89→110. New routing tokens `real` and `world` add 40 points and two coverage points. The previous ungated score 99 becomes gated 162. It displaces semantic search at 151 from rank 3. | **Real regression.** A named event's detail cannot list live RWA products across Stellar. No event slug appears in the question. |
| `q-defi-streaming-payments-prior-art` | The new `vetIdea` lending example matches `want`, `build`, `stellar`, and `existing` through `exists`. Positive coverage changes 3→4. Negative discovery coverage stays 2. The rejection condition `negative + 1 >= positive` changes from true to false. A separate payroll example adds `contractors`; its prefix match with `contract` adds 10 points and one coverage point. `vetIdea` changes from rejected at 400 to admitted at 411. `scfPitch` gains exact `payments` plus one coverage point: 361→382. `searchHackathonBuilds` gains exact `on` and `repos`, each replacing a prefix match: 434→454. | **Stale card label, by contract.** The new composite returns competitor repositories, projects, and prior-art repositories. These directly support the requested build research. The label accepts only `scout_repos`. The erroneous `contract`/`contractors` match remains a scoring defect, but this selected operation fits the question. |
| `q-scf-funded-similar-payroll` | The new `vetIdea` example matches `payroll` and `apps` through `app`, admitting the operation. Exact `payroll` adds 20 points. Routing coverage changes 8/14→9/14, crossing 60%; the raw augmented score changes 111→131. Both coverage bonuses round to 6. Independently, `scfPitch` gains exact `payments` plus one coverage point: backfill 188→209. Similar-submission search stays at 192. It cannot pass gated `vetIdea`: 192 < 1.6×131 = 209.6. It also follows the stronger SCF backfill result. Its rank changes 3→5. | **Real regression.** The question asks about historical funded examples. `vetIdea` supplies a nullable funding count for a detected vertical. It does not identify funded submissions. `scfPitch` limits funded peers to active directory projects and the largest eight awards. Historical submission search remains the stronger contract. |
| `q-defi-stellarx-what-is` | The revised `searchHackathonBuilds` description removes exact `it` and `by`. `it` retains a 10-point prefix match through `its`, losing 10. `by` loses 20. Coverage changes 9/13→8/13, losing one bonus point. Base score changes 227→196. The new `builds[].project.status` enum supplies `Development`. This schema token adds a weighted `round(0.4×21) = 8`. Final score becomes 204. Unchanged semantic search at 217 rises from rank 2 to 1. | **Useful gain.** General sourced content fits product identity and organizational attribution better than prototype search. The demotion comes entirely from stopword losses. Schema vocabulary offsets eight points. This does not show improved semantic understanding. |
| `q-edge-scf-v7-centralization-myths` | The new SCF example asks what angles a pitch should `take`. Exact `take` adds 20 routing points. Coverage changes 9/23→10/23; both bonuses round to 4. The unchanged schema contribution is 8. Final backfill score changes 217→237, moving rank 5→2. | **Metric gain only.** Pitch preparation cannot establish program policy or mainnet censorship powers. The shared word `take` has different meanings. Do not count this service-label gain as evidence of better answers. |

### Exact upstream text

All paths below refer to `inventory/stellar-light.json`, under `openapi.paths`.

- `/api/hackathons/builds.get.x-routing.exampleQuestions`: `Which x402 projects won prizes at Stellar hackathons?`
- The same operation adds the keyword `x402 builds`.
- `/api/clusters.get.x-routing.exampleQuestions`: `How crowded is lending on Stellar?`
- `/api/hackathons/{slug}.get.x-routing.exampleQuestions`: `How are submissions judged at Stellar Hacks: Real-World ZK, and what must a submission include?`
- Its new description includes `what they became`.
- `/api/vet-idea.get.x-routing.exampleQuestions`: `I want to build a lending protocol on Stellar. What already exists?`
- The same array adds `Vet this idea: a payroll app that pays contractors in USDC.`
- `/api/scf-pitch.get.x-routing.exampleQuestions`: `What angles should my SCF pitch take for a payments idea?`
- The old build-search description includes `not proof it was never tried` and `track filters by track`.
- The new build-search description uses `not proof` and `track filters`.
- The new build-search response adds `Development` under `builds[].project.status.enum`.

### Additional causal details

`analyzeHackathonSubmissions` enters the standards comparison at 201, but it does not cause the top-three loss. Removing it leaves Docs at rank 4. Restoring only `searchHackathonBuilds.routingKeywords` restores Docs to rank 3.

The new analysis operation's base score is 144, with coverage 8/18. Its routing additions contribute 55 lexical points and two coverage points. These are `agent` +10, `payments` +20, `vs` +20, and `do` +5 inside `breakdown`. Coverage reaches 11/18, and the final score reaches 201. The examples provide two-token phrase witnesses through `stellar` plus `agent` or `payments`. Neither example supplies standards-comparison intent.

The streaming loss has multiple causes. Restoring `vetIdea` alone still leaves `searchRepos` outside the page. The new `getHackathonSubmission` scores 379, equal to `searchRepos`. Its earlier lexical ID wins the score tie. Its contract requires a known submission identifier or URL.

The new detail operation's score is 357 base + 12 schema + 10 routing = 379. Schema tokens upgrade `build` by 10 and add `payments` at 20. Their weighted contribution is `round(0.4×30) = 12`. Routing token `pay`, from the `TollPay` example, adds a 10-point prefix match for `payments`.

Restoring both `vetIdea.routingPhrases` and `scfPitch.routingKeywords` returns `searchRepos` at rank 5. Restoring either one and removing `getHackathonSubmission` also returns it at rank 5. No single-operation ablation restores this card grade.

The payroll loss also has two independent causes. Restoring only `vetIdea` leaves the strengthened `scfPitch` before similar-submission search. Restoring only `scfPitch` leaves gated `vetIdea` before similar-submission search. Restoring both affected fields restores the original page.

The streaming verdict does not certify the whole new page. It should ideally retain both `vetIdea` and `searchRepos`.
The stronger `scfPitch` and the competing submission-detail operation leave a residual selection defect.
Restoring the narrow card grade by removing the useful composite does not establish a better answer.

### Contract evidence

These verdicts assess operation suitability. They do not claim measured answer-quality changes. The existing `expected_any` lists accept Scout for these questions. That service tolerance does not make every Scout operation suitable. This investigation used stored contracts and offline routing, not live service responses or paid QA.

- [Scout inventory](../inventory/stellar-light.json): `/api/hackathons/builds`, `/api/hackathons/analyze`, `/api/clusters`, `/api/hackathons/{slug}`, `/api/vet-idea`, and `/api/scf-pitch`.
- [Cluster contract](../catalog/manifest.json:6344): taxonomy counts, crowding, and showcase samples. `sampleProjects` explicitly excludes full membership.
- [Event-detail contract](../catalog/manifest.json:6793): one hackathon selected by an exact slug.
- [Idea-review contract](../catalog/manifest.json:23027): `report.competitors.repos`, `report.competitors.projects`, and `report.priorArt.repos`. Its `report.funding` contains `basis` and `scfAwardedProjects`, not identified awards.
- [SCF pitch contract](../catalog/manifest.json:16581): `fundedPeers` contains only the eight largest active-directory awards within the detected vertical.
- [Similar-submission contract](../catalog/manifest.json:411): semantic discovery of prior proposals with round, award type, and linked projects.
- [Semantic-content contract](../catalog/manifest.json:1205): dated source URLs and content discovery for conceptual, identity, and historical questions.
- [Docs search contract](../catalog/manifest.json:29219): documentation discovery for protocol and developer questions.

## General repair search

I tested four separate policies. None contains a query, operation, or holdout exception. No policy changed a tracked file.

| Policy | General mechanism | Legacy top1/top3/top5/cardHit5 | Rows with additional losses | Rows with gains | Loss/gain rows versus main | Decision |
|---|---|---:|---:|---:|---:|---|
| Candidate | Existing behavior | 220/295/325/111 | 0 | 0 | 5/2 | Reference |
| `intent_examples_only` | Remove example phrases from structured intent evidence; keep existing vocabulary scores. | 218/296/327/104 | 12 | 4 | 14/2 | Reject |
| `no_example_vocabulary` | Also rebuild positive routing vocabulary from purpose, useWhen, and keywords. | 218/296/327/105 | 15 | 7 | 14/3 | Reject |
| `bounded_prefix` | Require four-character prefix operands and a 0.75 length ratio; bound substring queries to four characters. | 238/289/311/102 | 107 | 103 | 107/101 | Reject |
| `content_query` | Score the content-word query first for every entry. | 224/285/304/105 | 120 | 90 | 122/89 | Reject |

The first loss/gain columns compare each policy with the candidate across all 544 rows. The final count column compares with main. Both comparisons reject every tested policy. A row can contain both a loss and a gain. The comparison includes strict grades, accept-either grades, holdout capture/pass, and protocol-history thresholds. Denominators remain separate in the detailed results.

The first policy recovers the standards, Blend, and RWA grades. However, it loses several SCF and protocol card grades. It also creates a forbidden holdout capture in `q-holdout-b-07-sep24-fields`.

The second policy recovers all five original loss grades. It nevertheless loses 15 other rows, including protocol and SCF cards. Its holdout forbidden captures increase 10→11. This is the closest tested repair, but it fails the explicit non-regression requirement.

The prefix policy improves legacy top1 but damages 107 rows. It also raises holdout forbidden captures 10→14. The content-query policy damages 120 rows. Neither aggregate improvement can offset these losses.

The prefix bounds reuse the numerical limits from `tokensOverlap`. They do not reuse its plural normalization: the experiment compares raw tokens. I did not search thresholds for better case scores. Temporary copies changed both the vendor scorer and its ungated replica consistently. No vendored source changed in the worktree.

The example-phrase policies do not isolate standalone admission witnesses. Four consumers read `routingPhrases`: rejection, lexical rescue, directory corroboration, and structured selection.
Deleting examples changes all four consumers. It also disables the directory rule that requires both a useWhen phrase and an example.
These results reject the tested broad deletions. They do not reject a narrower admission-only policy that preserves corroboration.
That narrower policy remains untested. I did not extend the search after this review finding.

The example-vocabulary experiment retains the current schema vocabulary. It therefore tests removal of example-derived positive evidence, without adding newly available schema terms. It is a diagnostic policy test, not a rebuilt release artifact.

**Stopped search:** no tested general repair satisfies the brief. These experiments do not prove that no possible repair exists. They reject four plausible mechanisms with complete row-level evidence. Further threshold searches would risk tuning to these failures.

## Ungraded operation mismatches

Seventy of the 77 reorders leave all measured grades unchanged. Service-level grades can hide replacement by a worse operation from the same service.
The independent reviewer identified these examples. I confirmed each order change against the complete 544-row comparison.

| Case | Hidden change | Contract problem |
|---|---|---|
| `q-hist-remittance-corridors` | `getHackathon` enters at rank 1, before `searchProjects`. | The question asks about remittance deployments and names no hackathon. |
| `q-scf-current-round` | `getHackathonSubmission` replaces `scfPitch` at rank 3. | Submission detail cannot report the current SCF deadline. Pitch preparation exposes live round state. |
| `q-scf-ecosystem-listing-partner-jobs` | `getHackathonSubmission` enters at rank 1, before `getPartners`. | The question concerns directory listing, partners, and jobs. |
| `q-defi-phoenix-scf` | `getHackathonSubmission` enters at rank 2. | SCF history does not identify a hackathon submission. |
| `q-protocol-cap-process` | `vetIdea` enters at rank 3. | Build-idea assessment does not explain the CAP process. |

Across all 544 rows, `vetIdea` newly enters 14 top-five lists. `getHackathonSubmission` enters nine; `analyzeHackathonSubmissions` enters eight.
These counts describe new appearances, not proven defects in every row. No complete semantic review covers all 70 ungraded reorders.
These observed mismatches strengthen the no-baseline-change recommendation. They also inform the parent round's separate new-operation exposure review.

## Full 544-row evidence

The candidate reproduces all seven supplied grade flips and all 77 top-five order changes. Unchanged service grades do not certify unchanged operation quality. This report does not establish semantic safety for every ungraded reorder.

| Lane | Rows | Main top1/top3/top5/cardHit5 | Candidate top1/top3/top5/cardHit5 |
|---|---:|---:|---:|
| Legacy | 338 | 219/298/326/112 | 220/295/325/111 |
| Extended | 122 | 93/111/117/16 | 93/112/117/16 |
| Skills | 23 | 17/23/23/23 | 17/23/23/23 |
| Holdout | 49 | 12/26/29/29 | 12/26/29/29 |
| Protocol-history diagnostic | 12 | 7/7/7 positive hits | 7/7/7 positive hits |

Legacy card denominator: 182. Extended card denominator: 28. Skills card denominator: 23. Holdout card denominator: 49.

The protocol-history lane has eight positives and four controls. Three controls capture the target in both runs. Its existing diagnostic failure does not change. Holdout forbidden captures remain 10; passed rows remain 24.

The machine-readable comparisons preserve every row, grade, score, and ordered top-five list:

- [Main → candidate, all 544 rows](routing-repair/candidate-routing-vs-main-544.json), with a [tabular export](routing-repair/main-candidate-544.tsv).
- [Candidate → final unchanged candidate, all 544 rows](routing-repair/candidate-routing-vs-candidate-544.json).
- [Intent-policy comparison, all 544 rows](routing-repair/intent_examples_only-vs-candidate-544.json).
- [Vocabulary-policy comparison, all 544 rows](routing-repair/no_example_vocabulary-vs-candidate-544.json).
- [Prefix-policy comparison, all 544 rows](routing-repair/bounded_prefix-vs-candidate-544.json).
- [Content-query comparison, all 544 rows](routing-repair/content_query-vs-candidate-544.json).
- [All experiment result paths and lane totals](routing-repair/experiment-summary.json).
- [Per-field and whole-entry ablations](routing-repair/diagnosis.json).
- [Joint ablations](routing-repair/joint-ablations.json).
- [Exact token changes](routing-repair/token-deltas.json) and [complete score decomposition](routing-repair/full-traces.json).

Reproduction scripts: [diagnose.mjs](routing-repair/diagnose.mjs), [experiments.mjs](routing-repair/experiments.mjs), [compare.mjs](routing-repair/compare.mjs), and [joint-ablations.mjs](routing-repair/joint-ablations.mjs).

## Verification and disposition

`npm run eval:compile` passed and left generated content unchanged.

`npm run eval:routing -- --gate` reproduced the candidate. It failed only because the manifest SHA-256 differs from the committed gate evidence. Existing numerical thresholds pass. This fingerprint failure does not authorize acceptance of the changed routing behavior.

`npm run eval:selftest` reported one failure for the same manifest fingerprint mismatch. Its other checks passed. The logs retain both failures: [selftest](routing-repair/selftest.log) and [routing](routing-repair/candidate-routing.log).

The first temporary prefix experiment had a script-replacement error. I corrected the temporary script and reran it. Only the completed run appears in the comparisons.

No implementation met the acceptance requirement. Therefore, the conditional rebuild, typecheck, test, build, and commit steps did not apply. I did not claim those checks passed.

The existing work queue already owns these general defects. See [structured routing intent](../.agents/TODO.md:138) and [short-token prefix matching](../.agents/TODO.md:265). No new live upstream defect was verified. I did not duplicate the existing upstream finding or change its status.

A future repair should retain source phrase boundaries and distinguish an example's topic from its requested action. It must preserve existing valid examples and allow stronger documentation evidence to compete across scoring tiers. This investigation does not establish a passing implementation.

Do not change the gate merely to accept the new manifest fingerprint. First resolve the four real regressions, or defer this routing-text candidate. Review the streaming card label through a separate routing-label policy decision. Its narrow label does not justify treating the other losses as stale.
The compiler preserves `expected_cards` from the retained `eval/corpus/` inputs. The current overlay changes accepted services, not exact cards.
The repository treats those retained inputs as read-only. No card-label override mechanism was established here. Do not edit the QA battery or retained corpus to erase this loss.

Deferral has a cost: the catalog retains older contracts while the new source snapshot describes changed behavior and two additional operations.
This lane does not measure that freshness cost against the routing cost. It does not authorize an owner exception to the acceptance rules.

The requested external report directory lies outside the sandbox's writable roots. This report uses the brief's permitted worktree fallback.

## Independent review

The independent review completed. Reviewer: Claude Fable tier, model `claude-fable-5-1`, launched with `--model fable --effort high`.
The reviewer used its own Herdr pane, `w3W:p1V`. It differed from the Codex author and orchestrator.
The coordinator authorized resuming the same session with `--permission-mode bypassPermissions` after repeated read-command permission blocks.

Review: [independent-review.md](routing-repair/independent-review.md). The reviewer checked source and stored evidence but did not rerun evaluations.
It agreed with the stopped search and found no score-arithmetic error.

| Finding | Reconciliation |
|---|---|
| F1: Hidden operation mismatches | Added five checked examples, verified appearance counts, and the unreviewed-scope limit. |
| F2: Broad example deletion does not isolate admission | Identified all affected consumers. Limited conclusions to tested policies. Retained the narrower hypothesis as untested. |
| F3: Streaming qualification and label ownership | Added the residual selection defect. Confirmed compiler and overlay ownership. Removed the proposed QA-golden workflow path. |
| F4: Inconsistent baseline advice | Removed the named-risk acceptance path. Recommended deferral until repair. Recorded the cost of stale contracts. |
| F5: StellarX cause | Attributed the demotion entirely to stopword loss, with an eight-point schema offset. |
| F6: Main comparisons | Added main-relative loss/gain counts for all four policies. Complete main-relative JSON files also remain available. |
| F7: Prefix-policy limits | Distinguished numerical bounds from plural normalization. Retained the substring-rule disclosure and temporary-only scope. |

All findings are reconciled in this report. No review finding requires a production edit for the no-repair result.
