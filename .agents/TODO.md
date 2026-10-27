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
2. Run owner decision A (the supervised paired subset) on a weekend UTC day, under its own spend
   authorization and on a quiet machine. The 2026-10-13 measurement queue is done: #272, #271,
   #281, and #270 are merged and deployed; the section guard does not ship.
3. Fix the table-row loss in `stellarDocs.get_doc_page_sections` (HackMeridian 2026 review
   follow-ups below). It is small, and it blocks address and version answers on every docs page.

Binding spend rules: no paid method runs without its own written authorization, and a diagnostic
budget never transfers to headline collection. Use [the evaluation map](../eval/EVALS.md) and the
`run-evals` skill for the measurement sequence.

## Improvements follow-up

### Monitor the Horizon protocol-ceiling note behind the rejected recovery experiment

The rejected `repository-tooling-recovery-v2` implementation does not ship
([closeout](rounds/2026-08-31-rejected-experiments-closeout.md)). Its freshness blocker is the
Scout DeepWiki note for `stellar/stellar-horizon`. The 2026-09-29 monitor failed: the answer gave
`28`, while the source at the response's `scannedRef` defined `29`. That finding (`sls-087`) and its
predecessor (`sls-080`) are retired receipts in `improvements/resolved.json`.

2026-10-09: the blocker cleared. Upstream closed issue 1738 on 2026-10-08. The reading returned `29`.
The source at the response's `scannedRef` (`ee5241ec`) also defines `29`. Evidence:
`rounds/2026-10-09-continuation/horizon-monitor.json`. On 2026-10-10 a distinct reviewer repeated the
check, Raven posted the resolution comment on issue 1738, and `sls-087` drained. The note is a curated
dated fact, so a later protocol bump can make it stale again. If this monitor fails again, file a new
id and cite both receipts.

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

### Repair the `cs-002` owner after `soroswap/docs` disappeared

On 2026-10-27, `gh api repos/soroswap/docs` and the recorded issue `soroswap/docs#47` return HTTP
404, so `npm run improvements:lint -- --live` fails on `cs-002` and its `intake.json` override. The
round ledger `rounds/2026-10-27-issue-batch.md` records the failure.

Next check: find whether the repository was renamed, made private, or deleted, and whether
`docs.soroswap.finance` still shows the stale adapter status. Then update the `cs-002` owner and
evidence, or resolve or retarget the finding.

Done when: `npm run improvements:lint -- --live` passes.

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

Source held by this item: Scout spec 1.9.71 (2026-10-06, drift issue #223). It adds
`GET /api/hackathons/analyze`, `GET /api/hackathons/builds/{id}`, and `GET /api/hackathons/review`,
and rewrites `x-routing` examples on twelve existing operations. Against the 1.9.61 manifest, with
`reviewSubmission` excluded, legacy routing lost top3 298 to 295, top5 326 to 325, and cardHit5 112
to 111. Four losses are real operation-selection regressions: `q-defi-agentic-payment-standards-compare`,
`q-defi-blend-alternatives`, `q-defi-rwa-overview`, and `q-scf-funded-similar-payroll`. The fifth,
`q-defi-streaming-payments-prior-art`, is a narrow card label. Exposed, `scout.reviewSubmission`
ranked first on `q-pc-sequence-numbers-ordering-replace`. Ungraded captures also appeared
(`getHackathonSubmission` first on `q-scf-ecosystem-listing-partner-jobs`; `getHackathon` first on
`q-hist-remittance-corridors`). Four tested general policies failed; the narrower admission-only
example policy is untested. Evidence: `rounds/2026-10-06-truth-maintenance.md` and its
`routing-repair-astra.md`. Four golden proposals for the two read operations wait in
`eval/qa/corpus/proposed/scf-grants-builders/` (see "Activate the Scout hackathon golden
proposals"). Keep `inventory/stellar-light.json`
at 1.9.61 until check 12 passes; the daily drift report keeps #223 open meanwhile.

2026-10-08 authorized repair attempt (Codex frontier; Claude Fable review): no general policy passes.
Ten policies were tested on all 544 rows against current and fresh sources (Scout 1.9.72, 674 Docs
titles). Each fails at least one check (5, 8, 10, or 12). The three mixed RWA controls still fail.
New mechanisms: `tokenize` splits `dApp` into `d` + `app`, and the new title keyword `approach`
prefix-matches `app`. That admits a weak fifth gated row, and `fullPageUngatedAdmission` then drops the
stronger `stellarDocs.search_wallet_dapp_docs` (565) from `q-tool-wallets-kit`. Short description
tokens (`is`, `an`, `also`) prefix- and substring-match unrelated queries the same way; a
`SKILL_DESCRIPTION_OVERRIDES` entry for `skills.stellar-dev.dapp` holds that skill's search text until
this repair lands (`rounds/2026-10-08-maintenance.md`). The identity fallback admits `reviewSubmission` on any "submission". The Docs title
snapshot is also held by this item now. Exposure recommendation for the later absorb:
`analyzeHackathonSubmissions` (broad) and `getHackathonSubmission` (detail) after the repair passes;
keep `reviewSubmission` excluded. Ledger: `rounds/2026-10-08-maintenance.md`; evidence:
`rounds/2026-10-08-routing-repair/`.

2026-10-15 re-check (Scout 1.9.78, 682 Docs titles; `rounds/2026-10-15-truth-maintenance.md`): the
hold stands with the same numbers (legacy top3 298→295, top5 326→325, cardHit5 112→111) and the
same four regressions; Docs titles alone still drop `stellarDocs.search_wallet_dapp_docs` from
`q-tool-wallets-kit`. The hold now has a model-facing cost: the held manifest omits the new
response facts that close `sls-089`, `sls-090`, `sls-092`, and `sls-093` (`counts.totalBasis`
`partial-read`, research `exactKeys`, hackathon `entries`, `upstreamSubmissions`, `coverageNote`,
`hiddenWinners`, `winnersNote`, the `corrected` repo and project match mode, and the 503
declarations). The runtime passes the fields through, but discovery and `codemode.describe` do not
document them.

2026-10-09 design pass (Codex frontier xhigh; the Claude Fable audit agrees). Three general
candidates ran on all 544 rows and both sources. They used whole-content anchors, field provenance,
per-phrase alternatives, and complete candidate competition. None passes:

- The best candidate fails checks 7, 8, 10, and 12. It changes 220 graded rows.
- Cause: strict whole-word coverage starves the gated tier. Legacy top-five gated hits fall from 1192
  to 308. Scout and Lumenloop lose service selection, and card precision falls.
- It removes the short-token triggers and passes checks 1 to 6, 9, and 11.
- Check 8: the five named negatives pass. The three `it.fails` controls fail. The passing assertion
  "Walk me through issuing a new custom token" also fails.
- Check 7 means two things: the baseline corpus grades of the eight IDs, and fixture presence. The two
  disagree for `q-soroban-reentrancy` and `q-protocol-parallel-execution`.
- On the fresh source, `analyzeHackathonSubmissions` reaches rank 4 on
  `q-pc-sequence-numbers-ordering-replace`.

Next attempt: change one mechanism at a time from the accepted baseline. Measure all 544 rows after
each step:

1. Whole-content anchors in the ungated replica only.
2. Schema `keywords` as rank-only evidence.
3. Then per-phrase alternatives with the corroborated-partial coverage rule.

Use one acceptance helper that computes all twelve checks. Evidence:
`rounds/2026-10-09-backlog/routing-design/`.

2026-10-09 step 1 (Codex frontier xhigh; Claude Fable review agrees). Whole-content anchors in the
ungated replica only. Rejected; step 2 did not run.

- The change keeps all 43,520 current-source gated scores. Page selection raises legacy top-five gated
  hits from 1192 to 1194.
- Graded rows change on 32 current-source and 30 fresh-source cases.
- Holdout forbidden captures rise from 10 to 12, above the ceiling. Extended top1 falls from 93 to 84.
- Checks 4, 5, 7, 8, 10, and 12 fail on both sources. Check 6 also fails on the fresh source, through
  the `approach` to `app` wallet control.
- Check 7 keeps the corpus grades but loses the account-merge Docs fixture. That fixture's baseline
  presence depends on the stopword `i` prefix-matching `in` in the Docs `id` and `name`. It is not a
  clean scoring target.
- Check 8: all positives and ordinary negatives pass. The three deferred `it.fails` controls fail.
- The unchanged baseline fails checks 5, 8, and 12 on current sources.

The acceptance helper is `rounds/2026-10-09-followup/routing-step1/acceptance.mjs`. It reads saved
runs, manifests, and inventories from a `tmp/routing3/` layout. `snapshot.mjs` in the same folder
switches the sources. A fresh checkout does not have the step 1 inputs. They exist only in the owner's
ignored local archive `eval/results/2026-10-09-routing-step1-evidence.tar.gz`. The next attempt
measures its own baseline and candidate runs into that layout.

Check 1 is a controlled probe: neither source carries literal `yieldblox` or `reflector` routing
phrases. Check 12 requires zero per-row grade changes between sources, which is stricter than a
fingerprint-only re-baseline. The step 1 patch is not part of later attempts.

2026-10-09 step 2 (Codex frontier xhigh; Claude Fable review agrees). Schema `keywords` became
rank-only evidence, from the accepted baseline. Rejected; step 3 did not run.

- The re-measured baseline equals the archived step 1 baseline on all 544 rows and both sources.
- Step 2 passes check 5 on both sources and check 6 on the fresh source. The baseline fails them.
- Check 10 fails on both sources: holdout top3 falls from 26 to 25 (Groth16 skill rank 3 to 4).
- Check 11 fails on current sources: `lumenloop.get_categories` leaves the long category page.
- Check 12 adds one fresh-source loss: `q-soroban-x402-auth-entry-signing` top5.
- The candidate bundles three sub-changes: no keyword admission, whole-token matching, and a flat
  rank weight. An admission-only variant alone reproduces the check 10 and check 11 failures. The
  weight change causes the OpenZeppelin, Friendbot, and multisig losses.
- Check 11 is a selector gap in `src/catalog/search.ts`. The quota replacement cannot fire when a
  service is above its quota. A general fix lets it fire at or above the quota, and it replaces the
  weakest same-service entry.
- Check 10 is not a selector gap. Without the schema-only Docs admission, the Groth16 page is short.
  A stronger Docs entry then fills it above the ZK skill. Every rank-only keyword attempt repeats
  this loss.

Next attempt: owner decision B comes first. Then measure the admission-only variant with the
selector quota fix as one step. Evidence: `rounds/2026-10-09-continuation/routing-step2/`.

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
12. On a fresh Scout snapshot (1.9.71 or later), the four real 1.9.71 regressions meet their main
    grades, `reviewSubmission` does not rank on non-hackathon questions, and the absorb needs only a
    manifest-fingerprint re-baseline.

Done when: all twelve acceptance checks pass in a reviewed general scoring change. The
protocol-history diagnostic stays source-expired until a separate accepted Scout source epoch exists.

### Stop identity substitution on spelling-corrected matches

The answer-style v2 measurement (merged in PR #271, 2026-10-13, PASS under rule 3) left one
known defect. On `q-edge-strupey-ambiguous-stellar-history`, both candidate runs answered `wrong`.
C1 called Stroopy.AI "almost certainly" the asked entity and gave its history, although the
result carried `caveat: "unverified-match"` and no record linked the two names (H1 fails). C2 ended
with an unscoped absence claim. The row left the consistent-change set only because the B1 judge
ended T4, so the measurement neither confirms nor clears a regression. See
[`result-v2.md`](rounds/2026-10-10-weekend/answer-style/result-v2.md) and the
[independent review](rounds/2026-10-10-weekend/answer-style/review-result-v2-astra.md).

Next: find a general mechanism (result data or adapter behavior, not a per-question rule) that
keeps a corrected-name match from being presented as the asked entity, and measure it on the
abstention slice under its own authorization.

Done when: a reviewed measurement shows that both candidate runs of the Strupey row say the
identity is unverified or ask for context, with no regression in the abstention or absence slices.

The `meta.didYouMean` path of Scout project search needs no own-repo mechanism. Since spec
1.9.79 (`sls-094`, resolved), a typo-distance name recovery such as `q=frieghter` →
Freighter returns `matchMode: "corrected"`. The existing `semantic`/`corrected` rule in
`src/executor/providers.ts` then attaches `caveat: "unverified-match"` (live recheck 2026-10-27,
Scout 1.9.111).

## Executor and policy

### Recount `data.sections` misreads in the next authorized QA round

The section-shape text merged in PR #270 (2026-10-14). The `execute` description and the
`codemode.describe` usage line now say that a section read has no `content`, and that `sections` is
an array of `{ section, content, url }` in request order. Its re-measure on `main` `0a60d98a` gave
PASS: section misreads fell from 5 in 38 scripts (A) to 0 in 35 (T), with no consistent regression
([result](rounds/2026-10-12-call-pattern-triage/result-text-v2.md),
[review](rounds/2026-10-12-call-pattern-triage/review-post-run-text-v2-astra.md)). The sample is
16 rows and two collections per arm, so it is a direction, not a rate. No script called
`codemode.describe` on a sectioned skill, so the usage-line change has no direct evidence.

The sandbox guard (commits `ba6a1dfa` and `416d2aa2`, reachable through PR #270) is INDETERMINATE:
with the text present, no misread occurred for it to act on. It does not ship. A guard needs a new
design or an owner decision before any new measurement.

Done when: a later authorized QA round recounts section misreads, `.data` omissions, and failed
calls with an omitted reason on the current `main`, and records them here.

## Dependencies

### Migrate the deprecated vitest pool and remove its overrides

Found by the `dependency-audit` issue. PR #248 (2026-10-09) and the issue #296 update (2026-10-27)
moved the toolchain to `wrangler` 4.153.0, `miniflare` 5.20261023.0-beta, `vitest` 4.1.12, and
`@cloudflare/vitest-pool-workers` 0.23.0. `npm audit` reports 0 findings, and the tree carries one
`workerd` (1.20261023.1).

The registry deprecates `@cloudflare/vitest-pool-workers` and names `@cloudflare/vitest-plugin` as
its replacement; 0.23.0 gets no further updates. It pins `wrangler` 4.124.0, `miniflare`
5.20260815.0-alpha, and `zod` 4.4.3 exactly, so `package.json` `overrides` keeps three entries:

- The global `"miniflare": "$miniflare"` keeps every package on the root `miniflare`. Without it,
  `npm audit` reports 4 high findings and the tree gets a second `workerd`.
- The pool's `"wrangler": "$wrangler"` keeps one `workerd`. Without it, the audit stays at 0, but
  `wrangler` 4.124.0 brings back `workerd` 1.20260815.1.
- The pool's `"zod": "$zod"` replaces the vulnerable `zod` 4.4.3. Without it, the audit reports 2
  high findings.

On 2026-10-13, `agents` 0.28.1 replaced the `agents` override. It pins `@modelcontextprotocol/sdk`
1.32.1, `@modelcontextprotocol/client` 2.3.1, and `@modelcontextprotocol/server` 2.3.1, and the tree
carries one copy of each and of `@modelcontextprotocol/core` 2.3.1.

Done when: the tests run on `@cloudflare/vitest-plugin`, all three overrides are removed, and
`npm audit`, `npm test`, `npm run test:smoke`, and the single-`workerd` check still pass.

### Verify that xAI accepts the explicit tool `strict` field

PR #267 (2026-10-11) upgraded `ai` to 7.0.137 and `@ai-sdk/openai` to 4.0.91, and it sets
`strict: false` on both Playground tools. That field also reaches the OpenAI-compatible chat
transport of the control models. The Grok control model `xai/grok-4.6` now receives it, and xAI
acceptance is unverified. The measured release verdict is in
`rounds/2026-10-10-weekend/ai-upgrade/results.md`.

Done when: the model gauntlet shows that `xai/grok-4.6` accepts the request before the next
control-model lane, or a reviewed change omits the field for that transport.

## Eval instruments

### Re-verify the next near-due goldens before the stale gate fails CI

`npm run eval:qa:lint -- --stale --enforce-floors` fails every PR and `main` once a battery case
passes its `truth.reverifyBy` date. That happened on 2026-10-23, and #298 fixed it. The next dates:
5 cases on 2026-11-01, 1 on 11-03, 5 on 11-05, and 31 more through 2026-11-30 (83 by 2026-12-31).
List them with `grep -rl '"reverifyBy": "2026-11-0' eval/qa/corpus/battery`.

Re-verify each batch before its date with the `golden-truth` skill, as #298 did: live evidence from
two or more source classes, a refreshed `truth.verified`, staggered `reverifyBy` dates, and a
register re-sweep (`npm run eval:qa:register`, then `--review`). The `truth-maintenance` skill owns
the drip policy; fold the batch into a round when one runs.

Done when: no battery case has a `reverifyBy` date before 2027-01-01; then delete this item.

### Measure the execute annotation change in isolation

PR #225 and #234 set `execute` `readOnlyHint: true` and `openWorldHint: false`. Claude Code `2.1.292`
maps these to `isReadOnly()`, `isConcurrencySafe()`, and `isOpenWorld()`. In the
[tool-surface round](rounds/2026-10-07-tool-surface-qa.md), T made more execute calls (195→214) and
fewer artifact reads (8 calls on 5 rows → 3 calls on 2 rows) than B3. The round shows no demonstrated
mechanism and cannot separate annotation effects from description edits or answering variance.

The [2026-10-08 re-collection](rounds/2026-10-08-flagged-row-recollection.md) ran an annotation-only
arm A on three rows (5 samples per arm). No 2026-10-07 drop held, so attribution did not apply.
Attempted artifact reads (call sites; no successful read outcome recorded) were B 6, T 1, A 5, all of
the difference on the QPP row: A, which shares B's annotations, attempted reads like B. Execute calls
per answer: B 2.5, T 2.4, A 2.7. The parallel-call prediction could not be checked: stored transcripts
have no assistant-turn boundaries.

Done when: a reviewed, separately authorized annotation-only comparison over more rows, or a free
transcript audit over more stored runs, decides whether the annotations change artifact-read
behavior. QA transcript entries now record `assistantTurn` and `assistantTurnBasis` (2026-10-09).
Calls with one message ID share an ordinal across assistant events. Entries without a message ID use
event counts, so their message boundaries stay unknown. A shared ordinal does not prove overlapping
host execution.

### Refresh the activity-row golden note against the live `metricDefinitions`

The golden notes of `q-eco-most-active-defi-projects` say that the served `meta.metricDefinitions`
define `sort=activity` as latest-commit recency. On 2026-10-13 the Scout leaderboard defines it as
`github.commits90d`, with `github.lastActivityAt` as the tie-break. Judges that follow the note
grade a correct commit-volume answer `wrong` (answer-style v1 baseline rows; v2 B2, stamp
`2026-10-13T23-59-41`). The B2 evidence pack also lacked the definition (the C2 pack had it), so the
evidence cannot isolate one cause; the stale note is a supported contributor. Fix the note through
the `golden-truth` workflow, with live evidence.

Done when: the golden notes match the live `metricDefinitions`, and `npm run eval:qa:lint -- --stale`
passes.

### Close the remaining claim-support gaps of judge pack p9

The judge uses pack `p9` from PR #272 (2026-10-13). Before that merge, `main` used `p6`. p9 keeps
the p8 omission repairs and shows the sibling records of every entity list in a claim sentence.
History: p7 ($18.19) and p8 ($9.0843) were blocked, and the p8b continuation ($0.3774) was not
accepted (review R8). Draft PR #264 holds those records.

The p9 measurement ran on 2026-10-13 under the owner's approval: $2.0591 of the $8.55 cap,
6 changed rows, 25 calls, self-test 7 of 7. The verdict is ACCEPT under the predeclared R6 rule.
Stage 1 passes. Three Stage 2 rows have lower panels with no identified pack cause (two reused p8
panels and the leaderboard row). The R8-1 row is `correct` (C C C). Codex `gpt-6-astra` at high
confirmed the verdict in the post-run review. Result:
[result-p9.md](rounds/2026-10-12-pack-p9/result-p9.md).

Known limits that remain:

- Field and unit limits: Etherfuse shows 5 of 7 records, stablecoin issuers 41 of 42, and
  ERC-8004 0 of 2.
- In the control rows, 5 rows lose 1 to 3 answer probes against p8.
- The R8-1 sentence scope is unresolved. The `correct` panel does not show that the judges read the
  narrow scope.
- R8-2 belongs to the rubric item below.

Done when: a reviewed later pack closes these gaps with an authorized measurement, or the owner
accepts them as the standing limits of p9.

### Decide whether a sourced summary error matches must-avoid "unsupported memory"

In the p8b continuation, two of three judges matched a candidate's misread directory status to
the must-avoid item "Do NOT claim unsupported memory is a source-supported current observation".
Any avoid match forces `wrong` under rubric `v2.11`. The third judge recorded the same
contradiction as a wrong claim and gave `partial`. Review R8 (PR #264,
`pack-p8/post-run-review-p8b/rr8-review.md`) found that the saved evidence does not show memory.

Decide whether the rubric or the judge prompt must separate a misread retrieved source from
unsupported memory. A change is a judging-semantics change: it needs the paid seven-call
self-test, an independent review, and a paired re-judge.

Done when: a reviewed decision is recorded, and any rubric change has its measurement.

### Re-check the upstream codemode short-token repair

The September 17 audit reproduced false routing across unrelated weather and billing operations.
The defect exists in codemode 0.4.2, 0.5.1, 0.5.2, and the tested upstream main revision.
[Cloudflare #2296](https://github.com/cloudflare/agents/issues/2296) owns the upstream repair; the
source record is `improvements/canonical-source/cs-001-codemode-search-short-token-prefix.md`.
Raven also has an ungated copy of the same prefix rule. Reverse-prefix deletion and standard
Porter stemming both failed routing coverage and do not ship. Do not replace them with query
exceptions or a tuned token-length threshold.

The 2026-10-09 design pass's anchored matcher returns no match for all four weather and billing
triggers, but its complete Raven candidate fails the routing gates
(`rounds/2026-10-09-backlog/routing-design/`).

The 2026-10-09 isolated step 1 (whole-content anchors in the ungated replica) removes all four
ungated false matches and keeps the intended positive queries. The gated scorer still reproduces the
defect, and the candidate fails the routing gates (`rounds/2026-10-09-followup/routing-step1/`).

`@cloudflare/codemode` 0.5.3 (2026-10-02) keeps the prefix rule byte-identical, and the four triggers
reproduce with the same scores. Raven stays on 0.5.1. A later upgrade must also move
`src/executor/spec-sandbox.ts`: it mirrors the 0.5.1 `truncateResponse`, `sandboxResponseText`, and
in-sandbox `__truncateResponse`, which 0.5.3 removes in favor of host-side structural truncation
(`truncateResult`, 24,000 characters). `test/spec-sandbox.test.ts` pins the 0.5.1 behavior.

On 2026-10-13, `@cloudflare/codemode` 0.5.4 shipped a `dist/index.js` byte-identical to 0.5.3, so
the prefix rule is unchanged and the four triggers reproduce with the same scores (27, 55, 45, 27).

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

### Reconcile hackathon winner goldens with the submission-detail operation

Trigger: the Scout 1.9.71 absorb lands. `scout.getHackathonSubmission` then returns explicit
`placement` for one stored submission. Two
existing cases still require the event-detail path as the only route: `q-scf-kale-winner-live`
(key facts 1 and 2 require `getHackathons` then `getHackathon`) and `q-gap-hackathon-winner-order`
(key fact 1 requires `getHackathon` detail). The independent review of the 2026-10-06 golden lane
found this grading-path overlap. No factual contradiction exists. History:
`.agents/rounds/2026-10-06-scout-hackathon-goldens/review-astra.md` ("Duplicate and boundary
review") and `reconciliation.md` row 15.

Done when: both cases accept explicit placement from event or submission detail, through the
`golden-truth` workflow, or a recorded decision keeps the event-detail path as the only route.

### Activate the Scout hackathon golden proposals when the Scout 1.9.71 absorb lands

Four proposals sit in `eval/qa/corpus/proposed/scf-grants-builders/`. The 2026-10-06 round held the Scout `1.9.71` absorb, so none is active
and the two operation floors stay unmet. The independent review cleared three for activation after
its requested edits, which are applied: `q-scout-hackathon-winner-libraries-vs-field`,
`q-scout-hackathon-submission-link-comet-hoops`, and `q-scout-hackathon-submission-xbid-outcome`.
It blocked `q-scout-hackathon-placed-share-kale-vs-zk`: the complete winner totals have no witness
independent of DoraHacks. History: `.agents/rounds/2026-10-06-scout-hackathon-goldens.md`.

Done when: the dated facts are re-probed, the fourth case has an independent winner-list source or
a reviewed source-relative rewrite, each activated case carries `truth.lifecycle.activation`, and
`npm run eval:qa:lint -- --stale --enforce-floors` passes for both operations.

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
The 2026-10-07 tool-surface round repeated the same case in both arms with no tool call. No other
answer in either arm offered a lookup, so no trigger fired.
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

### Absorb the 2026-10-15 skill pins without the unexposed Scout operations

The skills refresh works again after the stellar-community parser repair (2026-10-15 round). The
candidate pins are stellar-dev `1fc65d59affb` and stellar-light `811c5384af52`, plus 15 directory
additions. All 544 routing rows match main. The absorb is still held: the new
`stellar-light/stellar-scout/references/api-reference.md` describes `GET /api/hackathons/builds/{id}`
and `GET /api/hackathons/analyze`, which the held manifest does not expose. The section filter
drops only the explicit excluded-path set, so both sections reach `codemode.skill.read`. That
breaks the manifest-exposure rule. The stellar-dev pin alone carries a correctness fix
(`agentic-payments/mpp.md` drops a production-billing claim) and SEP-55 build-provenance guidance.

Options: (a) a general filter that drops skill sections describing service paths absent from the
manifest, (b) a stellar-dev-only absorb (untested), or (c) wait for the Scout absorb. Any absorb also
updates the three section and entry counts (202→203, 282→283, 222→223) and needs pin-review
attestations. Evidence: `rounds/2026-10-15-truth-maintenance.md`, "Drift verdict".

Done when: the stellar-dev pin is absorbed with no exposure leak, and the stellar-light pin is
absorbed together with, or after, the Scout operations it describes.

### Monitor the Stellar Docs title-set size against the remote identity probe ceiling

The remote identity probe `eval/qa/probe-remote-identities.mjs` enumerates the public Docs `lvl1`
title set through Algolia. The public key clamps pages to 100 records, the index limits pagination
to 1,000 records, and the probe fails closed above ten pages. Found in
`.agents/rounds/2026-09-03-truth-maintenance/remote-identity-guard-review-opus.md` (item R4).

During each drift round, record the current title count from `inventory/stellar-docs-titles.json`.
Open a design item for a different enumeration strategy before the count reaches 1,000. A larger
page size cannot help because the index limit is the same.

Done when: a reviewed enumeration change removes the ceiling, or the owner retires the guard.

## HackMeridian 2026 review follow-ups

Found by the 2026-10-26 weekend review: 58 probe questions in two rounds (22 Opus, 36 Sonnet),
four questions repeated on Sonnet and Haiku, and independent Fable grades against primary sources.
Probe ids below are `Q<n>` (round 1) and `R<nn>` (round 2). The report, the probe answers, and the
grades are in the owner's private evidence snapshot `2026-10-26-hackmeridian` (see
`usage/README.md`); that copy also holds the production figures, which stay out of this repo.

### Return every table row from `stellarDocs.get_doc_page_sections`

`sortAndDedupeSections` (`src/adapters/stellar-docs.ts`) keeps one Algolia record for each section
URL. Every row of a docs table shares its heading's URL, so only the first row survives. Q18 (the
oracle testnet addresses) lost its answer this way. R22 (the software-versions sections came back
empty) and R32 (a chunk cut the `getEvents` limits table) are related table losses; confirm their
cause in the same pass. The same pass should normalize `path` (strip the
`https://developers.stellar.org` origin and any `#anchor` before the `^/(docs|meetings)/` guard)
and fix or document the soft-empty `/meetings` pages (Q9). A Markdown page reader over the docs'
`<page>.md` text is the broader fix for tables and admonitions; weigh it against a dedupe fix.

Done when: a test shows that the oracle page's testnet table and the software-versions table come
back complete, and Q18 and R22 pass when run again.

### Add a release and package-version source

Raven cannot answer "what changed, with dates" or "which version is current". The Scout release
index has dated rows for stellar-cli, stellar-core, js-stellar-sdk, and rs-soroban-sdk, but none
for stellar-rpc (Q5, the RAVEN 101 demo prompt). No source gives the current npm, JSR, or crates
version of common packages (R33 `@stellar/freighter-api`, R35 Stellar Wallets Kit) or the latest
OZ stellar-contracts release (R23). Search also ranks `scout.getChangelog` (Scout's own API log)
above `scout.searchResearch` `source: "release"` for release queries.

Decide between an upstream Scout request (file it in `improvements/`) and a new host adapter (an
ADR-0003 exposure change). Fix the `getChangelog` ranking trap either way.

Done when: Q5, R23, R33, and R35 pass when run again, or the owner chooses to leave release data
upstream and the finding is filed.

### Measure "read past the snippet" guidance

In 11 of the 29 round 2 answers below Strong, the agent stopped at a cut snippet, the first page,
or the first 10 rows and did not open the cited page (R02, R09, R14, R16, R18, R20, R28, R29).
Haiku did worse than Sonnet on all four repeated questions. Candidate fix: when a result is a cut
snippet or a partial page of rows, say so and name the call that reads the rest (this overlaps the
open question of a conditional `recoveryHint`). Upstream codemode is the default, so a change needs
a measured win (the `run-evals` skill) before it ships.

Done when: a measured change ships, or the measurement shows no gain and this item is deleted.

### Triage the runtime and client gaps the weekend telemetry showed

Each needs a check before a fix:

- `scout.matchPartners` returned the upstream "AI not configured" failure on every call. Check it
  against live Scout; if it still fails, remove it from the exposed surface (ADR-0003).
- `execute` failures have no error class. Add a bounded `errorName` (SyntaxError, TypeError,
  ReferenceError, timeout) to the `execute` event and span, with no message text.
- `recoveryHint` appears on most successful executes, so agents probably ignore it. Show it only
  for empty, thin, or conflicting results.
- The playground often stopped at `DEMO_CAPS.maxOutputTokens` (4096). Review the cap.
- Docs ranking misses canonical pages: the testnet reset section on `/docs/networks` (R20), the
  Custom Account example (R02), and the fee-sponsorship pages (R09). Add routing cases first.
- Clients: Grok CLI never completed OAuth (every `/mcp` request got 401), Copilot CLI looped on 404
  (protocol 2026-07-28), and one browser looped on the consent page with "CSRF token mismatch".
  Reproduce each one.

Done when: each bullet has a merged fix or a recorded "no change" decision.

### File the HackMeridian upstream findings

Route these through the `improvements-pipeline` skill. Cite primary sources, not production
figures.

- stellar-dev-skill: `development.md` swaps the `try_` result nesting (`Ok(Err(e))` is called the
  contract error; soroban-sdk gives `Err(Ok(e))`) (R04); the deprecated
  `update_current_contract_wasm` (R07); the limits table lacks the 400-entry footprint cap (R08);
  no SEP-8 approval-server section (R30); no `sendTransaction` or `getTransaction` status values
  (R34); SDK pins at 27 (Q1).
- Scout: stablecoin issuer of record (MGUSD is issued by Bridge, AUDD by AUDC Pty Ltd, C1USD by
  Kinesis) and an asset class that keeps USDY and YLDS out (R31); "Live" without a network (R10,
  R15); audits outside the Audit Bank and OZ audits after v0.3.0-rc.2 (R17, R23); partner SEP lists
  (Bitso SEP-24, R36); canonical repo ranking (R16, R18); hackathon rubric, winner descriptions,
  and placements (R24, R26, R27); SCF #45 coverage (R28); Chainlink oracle and native MetaMask rows
  (Q2, Q18); DEX sub-type tags (Q6).
- stellar-docs: the state-archival page says `current_ledger + 4095` for the restored persistent
  minimum TTL, but mainnet uses 2,073,600; RPC method pages stay unindexed (sd-003: Q21, R03, R32,
  R34); "Building with AI" and `llms.txt` still name `raven.stellar.buzz`.
- Lumenloop: the Friday roundup leaves Saturday to Monday without news items (R21, near ll-006).

Done when: each item is filed, merged into an existing finding, or rejected with a reason.

### Add golden cases for the confirmed HackMeridian gaps

Use the `golden-truth` skill. First cases: R04 (`try_` nesting), R20 (testnet reset, December 16,
2026), R23 (OZ stellar-contracts version and audits), R31 (stablecoin issuers), and Q18 (testnet
oracle addresses). Writing the cases is free; running the QA battery on them is owner decision C.

Done when: the cases pass `npm run eval:qa:lint -- --stale --enforce-floors` and are merged.

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

The owner approved spend on 2026-10-01 and delegated the signature on 2026-10-10. Use
[the run sheet](rounds/2026-10-01-backlog-closeout/paired-run-sheet.md) and its "2026-10-11
amendment". Three launches on 2026-10-11 produced no result. They spent $146.2439 in total, and
their rows support no claim. Each record is archived, moved unchanged, under
`eval/qa/results/2026-10-11-paired-attempt-*` in the main checkout (ignored).

- Attempt 1 (`0dc353b9`, $72.7624): the guard stopped both arms at row 146, because the public
  DocSearch key reached its limit of 1000 calls per hour. PRs #265 and #266 repaired this.
- Attempt 2 (`826be10f`, $0): the stable pre-arm probe got HTTP 429 before any paid call.
- Attempt 3 (`8bca4167`, $73.4815): the probe repair held (zero failed probes; 141 of 142
  before-checks reused in each arm). Then the baseline server (`90d0ba75`, Wrangler 4.120.1)
  stopped at 07:02:39Z, after 1 h 56 min, with an empty `[ERROR]`. The supervisor stopped both
  arms at about row 143. The Wrangler debug log is in the attempt 3 archive.

The 2026-10-12 soak reproduced the stop path ([record](rounds/2026-10-12-baseline-soak/README.md)).
A request about 5 s after the previous response can fail with `Network connection lost.` Wrangler
4.120.1 then exits with an empty `[ERROR]`. The leading explanation is a race with the local
proxy-to-runtime keep-alive idle limit. The server survived the token expiry and the scheduled
refresh times, which weakens a fixed-time expiry explanation; the lane did not isolate the remote
binding or the token. Wrangler 4.149.0 logs that failure and continues. Near the same timing, a
runtime crash of unknown cause can also occur, and both versions then refused later requests on
the public port.

Launch change (2026-10-12, chosen by the orchestrator under the owner's delegation): the record's
option 1. The baseline server runs the candidate server's installed Wrangler toolchain (4.149.0 at
the current lockfile). The reason: 4.120.1 exits on one `ProxyWorker` error, and 4.149.0 fails only
that request. Before any server starts, the launcher requires one identical toolchain in both
servers, with the same `workerd` binary SHA-256. The signed plan records it. The local dev runtime
is no longer part of the measured difference. A local listener check also runs before every paid
call: before P6 and collection, before each P6 call, before each answering attempt and retry, and
before each row release. The signed plan binds the listener record by its digest. A lost or
replaced listener stops the method. Nothing restarts a server.
The check reads sockets and does not connect, and a short interval remains between a check and its
call. See the run sheet's "2026-10-12 amendment" for these limits.

Codex `gpt-6-astra` at high reviewed the change (RA to RA4, final APPROVE). A free live check ran
the baseline source under the candidate's Wrangler and matched the surface pin.

Next step (paid; needs a weekend spend authorization): a fresh assembled and signed plan. A full
collection needs about 2.5 hours of baseline uptime. Run on a quiet machine, and leave the DocSearch
key idle for at least one hour before the capacity check.

The launch tooling stays in the round folder until the next attempt ends or the owner retires the
method. Then either promote it into `eval/qa/` with its test, or delete the round's launch scripts,
`paired-stability-register.json`, `test/qa-paired-launch.test.mjs`, and
`test/qa-paired-claude-pin.test.mjs` together. Both tests import the scripts from the round folder.

Assemble the plan again before you sign its hash. The dated hashes in the run sheet are history.

### B. Choose how the routing repair treats the Groth16 holdout loss

Routing step 2 showed that any rank-only keyword change drops the Groth16 ZK skill from holdout
rank 3 to 4. A stronger Docs entry fills the short page above it on its own evidence. The holdout
top3 floor (26) then fails. See "Preserve structured routing intent…" and its step 2 evidence.

Option 1: lower the holdout top3 floor to 25 for a repair that passes every other check. Option 2:
require a skill-evidence change before the keyword step. Safe default: keep the floor, and do not start the
next routing attempt.

### C. Authorize a paid QA battery run on the HackMeridian golden cases

The 2026-10-26 weekend review asked for this step and did not run it, because the QA battery costs
money. It needs the golden cases from "Add golden cases for the confirmed HackMeridian gaps" first.
The run measures the gaps before the fixes above ship, and then again after them.

Safe default: do not run it. Use the free probe evidence until the owner authorizes the spend in
writing.
