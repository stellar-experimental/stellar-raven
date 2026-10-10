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
`28`, while the source at the response's `scannedRef` defined `29`. The active finding is
`improvements/stellar-light-scout/sls-087-horizon-protocol-ceiling-note-stale.md`; the retired
predecessor receipt is `sls-080` in `improvements/resolved.json`.

2026-10-09: the blocker cleared. Upstream closed issue 1738 on 2026-10-08. The reading returned `29`.
The source at the response's `scannedRef` (`ee5241ec`) also defines `29`. `sls-087` is
`fixed-upstream`. Its drain needs a distinct reviewer and a resolution comment on issue 1738.
Evidence: `rounds/2026-10-09-continuation/horizon-monitor.json`.

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

Done when: ok results carry measured inconclusive and as-of signals, the instructions drop the
phrasing rules those signals replace, the full instructions are shorter, and a reviewed QA
measurement shows no regression in abstention or absence answers.

## Executor and policy

### Count skill-read shape errors in the next authorized QA round

PR #247 (2026-10-09) returns a successful `codemode.skill.read` as
`{ ok: true, data: { id, url, content | sections, availableSections, notice? } }`. In the
[tool-surface round](rounds/2026-10-07-tool-surface-qa.md), scripts read `.data` on a skill read in 9
of the 13 tool-level errors (5 B3 rows, 4 T rows). PR #249 also accepts documented comma-joined array
arguments and names failed-call reasons in the source-basis `calls:` line.

Done when: the next authorized QA round counts three things from its stored transcripts:

- skill-read shape errors;
- rejected comma-joined arguments;
- failed calls whose reason the answer missed.

Compare the counts with the tool-surface round. This item authorizes no spend.

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

The 2026-10-01 adapter comparison graded a disputed Beans row Wrong
(`q-live-beans-cross-service-reconcile`). The p6 pack omitted transcript details, and the judges
called them fabricated. That artifact (`2026-10-01T22-05-47-variantA.json`) is not retained.

The [2026-10-09 analysis](rounds/2026-10-09-continuation/pack-omission/pack-omission-analysis.md)
replayed two saved pack-omission rows with exact p6 hashes:

- `q-hist-quantum-preparedness-plan`: a source phrase is not a candidate term, so no snippet holds it.
- `q-soroban-oz-upgradeable-macro`: final shortening around another anchor removes a selected macro.
- A 100,000-character budget repairs neither row.

Proposed repair: build evidence units with exact source spans, and measure coverage on the final
serialized text. Recompute coverage after each budget cut. Record an omission when a claim's
evidence cannot fit. The analysis lists the replayable coverage: the two rows above, nine other
saved omission rows, and new fixture classes.

The repair changes judge inputs. It needs a new pack version, an independent review, and its own
authorized measurement. Land it after the paired run (owner decision A), or pin p6 for that run.
Do not change frozen adapter-measurement artifacts or replace their verdicts.
`eval/qa/diagnose-stable-evidence.mjs` (#257) reports bounded support offline in the meantime.

Done when: a reviewed new pack version passes the replayable coverage, and an authorized
measurement shows no grade regression.

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

The owner approved spend on 2026-10-01. Run on a weekend UTC day after signing the canonical plan hash.
Use [the run sheet](rounds/2026-10-01-backlog-closeout/paired-run-sheet.md).
Run it on a quiet machine. Under a heavy load average, the `ps` calls of the launch cleanup can
time out. Cleanup then stops safely for manual action and causes no extra spend.

After the run, or after a stop, either promote the launch tooling into `eval/qa/` with its test,
or delete the round's launch scripts, `paired-stability-register.json`,
`test/qa-paired-launch.test.mjs`, and `test/qa-paired-claude-pin.test.mjs` together. Both tests
import the scripts from the round folder.

PR #256 (2026-10-09) changed the `re-judge.mjs` and `paired-verdict.mjs` implementation hashes.
Assemble the plan again before you sign its hash. The dated hashes in the run sheet are history.
The run sheet's 2026-10-10 re-preparation fixed the rubric `v2.11` tuple and lists the other drift.

### B. Choose how the routing repair treats the Groth16 holdout loss

Routing step 2 showed that any rank-only keyword change drops the Groth16 ZK skill from holdout
rank 3 to 4. A stronger Docs entry fills the short page above it on its own evidence. The holdout
top3 floor (26) then fails. See "Preserve structured routing intent…" and its step 2 evidence.

Option 1: lower the holdout top3 floor to 25 for a repair that passes every other check. Option 2:
require a skill-evidence change before the keyword step. Safe default: keep the floor, and do not start the
next routing attempt.
