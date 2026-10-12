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
2. Follow the upstream Docs pull request for `sd-027` and `sd-034`.

Binding spend rules: no paid method runs without its own written authorization, and a diagnostic
budget never transfers to headline collection. Use [the evaluation map](../eval/EVALS.md) and the
`run-evals` skill for the measurement sequence.

## Improvements follow-up

### Re-check `sd-027` and `sd-034` after PR #2837 receives a maintainer decision

The maintainer named https://github.com/stellar/stellar-docs/pull/2837 as the replacement for the
closed PR #2367. On 2026-10-09 the head was `0c20e720138eb126c37dab3336501b16751d1d2f`. Its last
commit (2026-10-06) describes passkey-kit as a sibling of smart-account-kit. The review decision is
`APPROVED` (second approval 2026-10-07), and the merge state is `CLEAN`. The PR is not merged.

Re-check the PR at the next improvements round, or earlier if its head changes or it closes. If it
merges and deploys, run both original live page checks before changing either finding. Do not post a
status comment while the maintainers are working on the decision. History:
`.agents/rounds/2026-09-16-maintenance-execution.md` and
`.agents/rounds/2026-09-21-improvements-followup.md`.

Done when: each finding records the resulting live state, and any fixed finding completes the
resolver gates.

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

### Move answer-style guidance from server instructions into result data

The Claude directory review (2026-10-07) found answer-style guidance in `BASE_SERVER_INSTRUCTIONS`:
how to phrase an absence, when to abstain, and when to ask for context. The reviewer suggested
result fields such as `inconclusive: true` or `as_of`, so the client can explain findings without
being told how to talk. The review capture also cut off the 7,864-character `SERVER_INSTRUCTIONS`
(the base plus the micro-map).

Today the envelope carries `error.kind: "soft-empty"` and adapter hints. It has no general
inconclusive flag or as-of field on ok results.

Draft PR #268 (branch `w1010/a`, do not merge) adds `inconclusive` and `asOf` signals, an `observedAt`
footer, and removes four instruction rules (7,864 to 7,839 characters). Its 2026-10-11 ABBA
measurement (34 rows, four collections, $47.92 of $84) is INDETERMINATE after the independent
result review (`rounds/2026-10-10-weekend/answer-style/review-result-astra.md` on that PR):

- Both candidate runs answered `q-edge-strupey-ambiguous-stellar-history` wrong: the answer promoted
  a spelling-corrected Scout match despite `inconclusive: "candidates"`. Both baseline runs were
  correct. The baseline re-judge was a T4 consistency error, so the confirmation is incomplete,
  but the regression diagnosis stands.
- The "activity" improvement is a judge artifact. The quantum-row improvement reproduced.
- The word `inconclusive` names both an ok-but-empty field and the soft-empty kind. One candidate
  answer merged them. That risks the soft-empty versus data distinction in `AGENTS.md`.

Next: restore the removed tail "…otherwise say unverified or ask for context", settle the
`inconclusive` wording against soft-empty, review the change, and measure again under a new
authorization.

Done when: ok results carry measured inconclusive and as-of signals, the instructions drop the
phrasing rules those signals replace, the full instructions are shorter, and a reviewed QA
measurement shows no regression in abstention or absence answers.

## Executor and policy

### Reduce `data.sections` misreads after a sectioned skill read

PR #247 (2026-10-09) returns a successful `codemode.skill.read` as
`{ ok: true, data: { id, url, content | sections, availableSections, notice? } }`. In the
[tool-surface round](rounds/2026-10-07-tool-surface-qa.md), scripts read a skill result without
`.data` in 9 of 13 tool-level errors. PR #249 also accepts documented comma-joined array arguments
and names failed-call reasons in the source-basis `calls:` line.

The 2026-10-11 answer-style measurement (136 rows: B1, C1, C2, B2) counted the three behaviors.
The result review is `rounds/2026-10-10-weekend/answer-style/review-result-astra.md` on draft PR
#268.

| Run | Skill-shape errors (scripts / rows) | Rejected comma-joined arguments | Failed calls with an omitted reason (calls / rows) |
|---|---:|---:|---:|
| B1 | 2 / 2 | 0 | 2 / 2 |
| C1 | 1 / 1 | 0 | 2 / 1 |
| C2 | 2 / 1 | 0 | 7 / 4 |
| B2 | 0 / 0 | 0 | 1 / 1 |

- No script read a skill result without `.data`. The PR #247 shape problem did not recur.
- All five shape errors misread the `data.sections` array: they treat a section object as a string,
  read `data.content` on a sectioned read, or index sections by a `file:` name. Rows:
  `q-edge-noinfo-sep-9999`, `q-soroban-cross-contract-call` (twice), `q-stellar-recurring-payments`.
- No host rejected a comma-joined array argument.
- The omitted reasons cover invalid paths, invalid numeric IDs, unknown operations, and one script
  error. Four of the twelve calls are the unknown `searchBuilders` operation on the Strupey row.

Next, check the existing `skill.read` guidance and the `sections` example text before proposing a
mechanism. A change to model-facing text needs its own measurement.

Done when: a reviewed change, or a recorded no-change decision, addresses the `sections` misread,
and a later authorized QA round recounts the three behaviors.

### Triage calls to `stellarDocs.search_anchor_sep_docs` without `query`

The `ai` upgrade result review (`rounds/2026-10-10-weekend/ai-upgrade/review-result-fable.md`)
found that every anchor row in both arms called `stellarDocs.search_anchor_sep_docs` without the
required `query`. One stablecoin row in each arm did the same with `search_asset_token_docs`. The
host returned "invalid arguments … no call was made" and reported the call as failed evidence, so
the envelope behaved as designed. Both arms show the pattern, so the SDK did not cause it.

Decide whether the operation's schema, description, or `search` card leads the model to omit the
argument. Check stored transcripts first (free). File an `improvements/` finding only for an
upstream cause; an own-repo cause gets a scoped fix with a test.

Done when: the cause is recorded, and a fix or a no-change decision has its evidence.

## Dependencies

### Remove the vitest pool override when the pool updates

Found by the `dependency-audit` issue on 2026-10-01. PR #248 (2026-10-09) moved the toolchain to
`wrangler` 4.149.0, `miniflare` 5.20261006.1-alpha, and `@cloudflare/workers-types` 5.20261009.1.

`package.json` `overrides` has three entries:

- The pool entry points `@cloudflare/vitest-pool-workers` 0.22.0 at `wrangler` 4.149.0. Pool 0.23.0
  still pins `wrangler` 4.124.0 and `miniflare` 5.20260815.0-alpha exactly.
- The global `"miniflare": "$miniflare"` entry keeps every package on `workerd` 1.20261006.1.
  Without it, the pool restores `sharp` 0.35.2 (GHSA-wq5f-xc86-pv6w) and a second `workerd`, with 4
  high audit findings. Miniflare 5.20261006.1-alpha pins `sharp` 0.35.5 directly, so the separate
  `sharp` override is gone.
- The `agents` entry overrides the two MCP peers to the direct versions (GHSA-6qxp-vccf-f47h, issue
  #233). `agents` 0.20.1 is installed; 0.21.0 through 0.28.0 keep the exact pins on
  `@modelcontextprotocol/sdk` 1.30.0 and `@modelcontextprotocol/client` 2.0.0. The tree carries two
  `@modelcontextprotocol/core` versions: 2.0.0 for the server and 2.2.0 under the client.

`npm audit` reports 0 findings. `wrangler` nests `esbuild` 0.28.2; the root keeps 0.28.1.

Done when: a pool release accepts patched `wrangler` and `miniflare` versions, both the pool and the
global `miniflare` overrides are removed, and `npm audit`, `npm run test:smoke`, and the
single-`workerd` check still pass. Remove the `agents` override when an `agents` release accepts SDK
1.31.0 and client 2.2.0 or later.

### Verify that xAI accepts the explicit tool `strict` field

PR #267 (2026-10-11) upgraded `ai` to 7.0.137 and `@ai-sdk/openai` to 4.0.91, and it sets
`strict: false` on both Playground tools. That field also reaches the OpenAI-compatible chat
transport of the control models. The Grok control model `xai/grok-4.6` now receives it, and xAI
acceptance is unverified. The measured release verdict is in
`rounds/2026-10-10-weekend/ai-upgrade/results.md`.

Done when: the model gauntlet shows that `xai/grok-4.6` accepts the request before the next
control-model lane, or a reviewed change omits the field for that transport.

## Eval instruments

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

### Repair claim-support selection in the p6 judge pack

The judge still uses p6. Two repairs were measured on 2026-10-10 and neither cleared the gate.
Draft PR #264 holds the code, the plans, the results, and every review. Do not merge it.
The re-judge artifacts are in the ignored `eval/qa/results/2026-10-10-pack-rejudge/` folder.

- p7 ($18.19) lost the supporting snippet of a stable quantum row (Stage 2).
- p8 ($9.0843) recovered the omission rows, with no false fabrication call in Stage 1.
  One Stage 2 row moved down (StellarTerm), so the predeclared rule blocks p8.
- The reviewed p8b continuation ($0.3774, one row, three calls) was not accepted (review R8):
  - R8-1: p8 drops the status records of the other entities in the same claim sentence
    (Comet, Zenex, and others) that p6 showed. The candidate sentence scope stays unresolved.
  - R8-2 belongs to the rubric item below.

Next repair: start from the p8 span units on PR #264. Keep the sibling records of every entity
list in a claim sentence, and measure that coverage on the final text. Replay the p6, p7, and p8
rows offline first. A new pack version needs an independent review and its own authorized
measurement, with the R6 Stage 2 evidence-correction rule predeclared.

Done when: a reviewed new pack version passes the replayable coverage, and an authorized
measurement shows no grade regression.

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
proxy-to-runtime keep-alive idle limit. Uptime, the cf token, and the remote AI binding are not
necessary for the stop. Wrangler 4.149.0 logs that failure and continues. Near the same timing, a
runtime crash of unknown cause can also occur, and both versions then refused later requests on
the public port.

Next step (owner decision): choose a launch change from the record's recommendation. The record
recommends the candidate's Wrangler 4.149.0 for the baseline server, with a stop-on-lost-port
rule. Then assemble and sign the plan again. A full collection needs about 2.5 hours of baseline
uptime. Run on a quiet machine, and leave the DocSearch key idle for at least one hour before the
capacity check.

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
