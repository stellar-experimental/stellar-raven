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

### File the 2026-10-07 tool-surface round's upstream candidates

The [tool-surface QA round](rounds/2026-10-07-tool-surface-qa.md) row review listed candidates but filed
none: recurrence evidence for `ll-012`, `ll-030`, `ll-025`, and `sk-022`; Stellar Docs
`assembleTransaction` example signing an unbuilt builder; the ledger-header page (`feePool` units,
missing `ext`); Scout exact advisory-ID and release-tag retrieval; Scout Zenex Live versus Testnet.
The 2026-10-09 own-repo triage added two more. Lumenloop listing rows carry string ids (`"10190"`),
while `get_document.id` and `get_related_projects.content_id` require numbers (2 T rows; one lost its
document reads). If the upstream accepts numeric strings, the fix is an own-repo argument alias
instead. The Stellar Docs Anchor Platform admin guide calls `stellar:USDC:GBBD47…LFLA5` (Circle's
Testnet issuer) "Circle USD" with no network label; one B3 Mainnet bridge answer copied it.
The round's live-probe evidence sat in temporary storage, so each filing re-gathers its own evidence.

Done when: each candidate is filed or rejected through `improvements-pipeline`, with the round ledger
linked.

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

2026-10-09 design pass (Codex frontier xhigh; Claude Fable audit agrees): three general candidates
(whole-content anchors, field provenance, per-phrase alternatives, complete candidate competition)
on all 544 rows and both sources. None passes. The best fails checks 7, 8, 10, and 12 and changes 220
graded rows: strict whole-word coverage starves the gated tier (legacy top-five gated hits 1192 to
308), so Scout and Lumenloop lose service selection and card precision falls. It eliminates the
short-token triggers and passes checks 1 to 6, 9, and 11. Check 8 detail: the five named negatives
pass; the three `it.fails` controls and the passing "Walk me through issuing a new custom token"
assertion fail. Check 7 means the baseline corpus grades of the eight IDs plus fixture presence; the
two disagree for `q-soroban-reentrancy` and `q-protocol-parallel-execution`. On the fresh source,
`analyzeHackathonSubmissions` reaches rank 4 on `q-pc-sequence-numbers-ordering-replace`. Next
attempt: change one mechanism at a time from the accepted baseline, measuring all 544 rows after each
step: (1) whole-content anchors in the ungated replica only; (2) schema `keywords` as rank-only
evidence; (3) then per-phrase alternatives with the corroborated-partial coverage rule. Use one
acceptance helper that computes all twelve checks. Evidence: `rounds/2026-10-09-backlog/routing-design/`.

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

### Return `codemode.skill.read` results in the service-call envelope

`codemode.skill.read` keeps content at the top level. Service calls, `codemode.skill.run`, and
`codemode.artifact.read` resolve to `{ ok, data }`. In the
[tool-surface round](rounds/2026-10-07-tool-surface-qa.md), scripts read `.data` on a skill read in 5 B3 and 4 T rows (9 of the 13 tool-level errors). The
guard in `src/executor/providers.ts` (`SKILL_PRELUDE`) threw its corrective message, and every row
recovered one `execute` later. The `execute` description and `ARCHITECTURE.md` state the exception
next to the `.data` rule.

Done when: a successful `skill.read` resolves to
`{ ok: true, data: { id, url, content | sections, availableSections, notice? } }`, and each section
keeps its exact URL; the skill `.data` trap and the top-level exception text are gone; the shared
envelope guard covers skill reads; owned examples, documentation, and the spec builder
(`scripts/build-super-spec.mjs`) describe the new shape, and the spec is regenerated by its script;
unit tests and `npm run test:smoke` pass; and the next authorized QA round reports skill-read shape
errors from its stored transcripts.

### Accept the documented comma-joined `sources` on `scout.searchResearch`

The Scout `sources` description says "comma-separated (e.g. cap,sep,dev-docs)", but the manifest
types `sources` as an array. In the [tool-surface round](rounds/2026-10-07-tool-surface-qa.md), scripts passed a comma-joined string in 12 call sites (B3 7,
T 5; 9 cases), and the guard rejected each one with no call made. Truncation hid 3 of those
rejections. `src/policy/argument-aliases.ts` already maps a comma in `source` to `sources`, but it
skips a string in `sources` itself.

Done when: `applyArgumentAliases` splits a string `sources` into the documented array, tests cover
one value, several values, and an unknown source (still rejected), and `npm test` passes.

### Name failed-call reasons in the source-basis block

The source-basis `calls:` line shows a failed call only as `op=error/0ms`. The call record keeps the
outcome but not the reason. In the [tool-surface round](rounds/2026-10-07-tool-surface-qa.md), four executes held a guard-rejected call whose reason the
script never saw: three through truncation (B3 `q-scf-audit-bank`; T `q-agent-identity-erc8004-stellar`,
`q-scf-audit-bank`) and one through script filtering (T `q-scf-verified-members`, where
`if (d.ok) docs.push(d.data)` dropped every failed `lumenloop.get_document` read and returned
`"docs":[]`). Final truncation alone showed no grade harm (B3 26 rows: 10 correct, 0 wrong; T 22
rows: 9 correct, 4 wrong).

Done when: refused and failed calls carry a short bounded reason (for example
`invalid-args: sources`), the `calls:` line shows it within the existing caps, and tests cover a
rejection inside a dropped branch and a script that filters out failed envelopes.

## Dependencies

### Remove the vitest pool override when the pool updates

`package.json` `overrides` has three entries. The pool entry points `@cloudflare/vitest-pool-workers`
0.22.0 at `wrangler` 4.145.0. A global `miniflare` entry pins `miniflare` to the direct version
(5.20260930.0-alpha) and `sharp` to 0.35.5. An `agents` entry overrides the two MCP peers to the
direct versions. Pool 0.22.0 pins `miniflare` 5.20260815.0-alpha and
`wrangler` 4.124.0 exactly, and those carry high advisories through `undici` 7.29.0 and `sharp`
0.35.2. Found by the `dependency-audit` issue on 2026-10-01.
Pool 0.23.0 still pins those versions, so the pool override remains necessary.
Issue #233 adds a `miniflare` override for `sharp` 0.35.5 because even Miniflare
5.20261006.0-alpha pins vulnerable `sharp` 0.35.4 (GHSA-wq5f-xc86-pv6w).
With these overrides, `npm audit` reports no findings, `npm run test:smoke` passes,
and every package uses `workerd` 1.20260930.2.

Done when: a pool release pins patched `miniflare` and `wrangler` versions, the override is
removed, and `npm audit` and `npm run test:smoke` still pass.
Remove the `miniflare`/`sharp` override when Miniflare pins `sharp` 0.35.5 or later.
Remove the `agents` override when an `agents` release accepts `@modelcontextprotocol/sdk` 1.31.0 and
`@modelcontextprotocol/client` 2.2.0 or later (GHSA-6qxp-vccf-f47h). `agents` 0.20.1 pins 1.30.0 and
2.0.0 exactly; issue #233 overrides those peers to the patched direct versions. `agents` 0.21.0
through 0.27.0 keep the same exact pins, so a bump alone does not remove this override. Until then the
tree carries two `@modelcontextprotocol/core` versions: 2.0.0 for the server and 2.2.0 under the client.

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

### Keep freeze-type must-avoid items off dated, source-scoped lists

Three of the five judge errors in the [tool-surface round](rounds/2026-10-07-tool-surface-qa.md) row review share one pattern. A must-avoid item about a
frozen, permanent, or network-wide list fired on an answer that dated its list and named its source:
B3 `q-jutsu-cash-crypto-ramps`, T `q-soroban-sdk-cve`, and T `q-tool-sdk-repos-discovery`. A fired
avoid forces `wrong`, and the directed re-judge repeated two of the three. The rubric limits avoid
items to answer-visible content, but it does not say that a dated, source-scoped, or non-exhaustive
list is not a frozen list. Control: B3 `q-eco-defi-market-map`, where the avoid fires correctly.

Done when: the rubric states that rule and that a missing list item is a missing fact,
`JUDGE_RUBRIC` moves past `v2.10`, a free test pins the prompt text, and a separately authorized
re-judge of the three rows and the control shows the intended grades. Land this change before the
first paired arm or after the second. A change to judge.mjs changes the implementation hash.

### Make the claimable-balance safety warning a key fact

`q-raph-claimable-balance-safety` is a `scam-check` trap. Its golden answer and grader note require
the scam warning, but its two key facts cover only protocol mechanics. In the [tool-surface round](rounds/2026-10-07-tool-surface-qa.md), four judge calls
on two answers that both omit the warning split two to two. The B3 judge said the warning "is not
listed as a separate required-behavior item". Both original votes had stability score 1, so stable
history kept them at the `single` tier and the false pass stood.

Done when: through `golden-truth`, the case gets a key fact for the warning; a sibling sweep of the
`scam-check` goldens confirms each required safety behavior is a key fact (check
`q-raph-scam-spam-tokens` first); and `npm run eval:qa:lint -- --stale --enforce-floors` and
`npm run eval:qa:register -- --check` pass. Change trap tiering only if a fixed golden still splits
in a later authorized run. Land this change before the first paired arm or after the second.
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

The 2026-10-09 design pass's anchored matcher returns no match for all four weather and billing
triggers, but its complete Raven candidate fails the routing gates
(`rounds/2026-10-09-backlog/routing-design/`).

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

### Decide whether Scout's hackathon store gaps are upstream findings

Probes on 2026-10-06 found stored totals below the organizer's totals: KALE x Reflector 45 against
46 to 47, Real-World ZK 319 against 345, Stellar Hacks: Agents 248 against 262, and Stellar Hacks:
Blend 35 submissions and 2 winners against 39 and 3. Scout holds the Blend first-place submission
(`dorahacks.io/buidl/27438`) under `stellar-hacks-paltalabs` with no placement, so its Blend
first-place result is lost. Scout documents that deleted or private submissions are not served, so
part of the total gap is by design. The lost first-place record changes `winners` counts and placed
shares. Evidence: `.agents/rounds/2026-10-06-scout-hackathon-goldens.md` entries 2, 12, and 14.

Done when: the `improvements-pipeline` workflow files a finding for the missing-winner case, or
records why it is intended behavior.

### Decide whether Scout's strict repo-search label is an upstream finding

On 2026-10-06, `https://stellarlight.xyz/api/repos/search?q=strupey` reported
`matchMode: "strict"` ("every query term matched"), but none of its 23 returned rows (for example
`stellar/freighter`) contains the token. The near-due golden re-verification lane found this while
it checked `q-edge-strupey-ambiguous-stellar-history`. Evidence:
`rounds/2026-10-06-truth-maintenance.md` ("Golden verdict").

Done when: the `improvements-pipeline` workflow reproduces the label on a second query and files a
finding, or records why the label is correct.

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
