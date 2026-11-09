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

Binding spend rules: no paid method runs without its own written authorization, and a diagnostic
budget never transfers to headline collection. Use [the evaluation map](../eval/EVALS.md) and the
`run-evals` skill for the measurement sequence.

## Stellar Docs migration to Mintlify

### Repair or retire stale golden docs references — completed 2026-11-03

Rechecked all 21 stale URLs live. Repaired current sources in 19 active cases, including three
retail siblings found by the full source sweep. The final check returned HTTP 200 for all 249
current Stellar Docs source URLs, with zero 404s and zero redirects. Questions and goldens stayed
unchanged. Required gates passed. See [the round ledger](rounds/2026-11-03-golden-urls.md).

### Point agents at the page when a docs hit has no body

`sd-059`: Mintlify search rarely returns `<ResponseField>` text, so a result-code page often comes
back as its title-and-description chunk only. In the 2026-11-02 QA diagnostic the agent had the
Set Options result-code path in a hit, did not read the page, and gave a wrong code mapping. Options:
mark such hits (a chunk that is the page title plus one description line) with a hint to call
`stellarDocs.get_doc_page`, or read those pages host-side and take the snippet from the body. Either
changes the output contract, so it needs the routing gate and a free retrieval replay of the
result-code queries in `rounds/2026-11-02-mintlify-migration/identifier-probe.json`. Done when the
`op_bad_signer` query yields the `SET_OPTIONS_BAD_SIGNER` mapping in one search call or one hinted
page read, and the change is measured on the retrieval A/B. Remove when `sd-059` is fixed upstream.

New evidence (2026-11-02, `rounds/2026-11-02-upstream-followup.md`): the site's own MCP search
(`POST https://developers.stellar.org/mcp`, tool `search_stellar_developer_docs`, public, no key)
returns a relevant result-code page first for all seven probe queries (for `op_low_reserve`, several
operations share the code, and Set Options ranks third). In the author's production measurement,
Raven's Discovery API path (`POST /discovery/v1/search/<domain>`, then the adapter's path scope and
query-term guard) returned none of them in its top 5. First compare the raw Discovery candidates with
the adapter output, to rule out Raven's own filtering. A third option is to serve `search_docs` from
the site MCP backend. It needs the same gates: a general mechanism, a free
retrieval A/B on the golden docs pages and the identifier probe, the routing gate, and a check of
the backend's rate limits and terms.

## Improvements follow-up

### Recheck sk-039 after the Docs skill copy updates

The November 6 [assets handoff review](rounds/2026-11-06-assets-type-handoff.md)
confirmed canonical PR181 and skills.stellar.org have the corrected SEP-41 types.
The ordinary [Docs skill URL](https://developers.stellar.org/.well-known/agent-skills/assets/skill.md)
still lists `transfer` destination `Address` and `symbol()` return `Symbol` at 18:58 UTC.
After generation/cache refresh, or the next maintenance pass from November 7,
require `MuxedAddress` and `String`, with `transfer_from` still using `Address`.
No further canonical type change is requested. A distinct reviewer must repeat
the ordinary URL check before retiring sk-039. Routine recurrences stay local.
The earlier sk-038 signer-control delivery defect is now fixed on that ordinary URL.

### Recheck November 5 partial fixes after deployment or owner data jobs

The [round ledger](rounds/2026-11-05-truth-maintenance.md) and its per-finding tables cover all
130 starting findings. Recheck only when the named change or new evidence arrives; untouched
issues do not need reminders.

- Scout: [PR1924](https://github.com/Stellar-Light/stellarlight/pull/1924) is deployed (spec
  1.9.127 live on 2026-11-09) and sls-113 is retired. The 2026-11-09 probe run flags sls-099/100/102
  as fixed candidates: repeat their originals with a distinct reviewer before any status change.
  sls-112 stays open. For sls-107, require the
  enabled issuer refresh to populate issuer/source/date fields, including the nine affected
  AUDD/Currency One records and the MGUSD control. For sls-114, require a new Horizon code scan
  and verify fixture paths/classification. For sls-101, repeat aggregate and Spiko/Sentora/Etherfuse
  provider checks after remap/enrichment; warnings are fixed but values remain stale.
- SCF coverage: after draft [PR1922](https://github.com/Stellar-Light/stellarlight/pull/1922)
  is rebased, merged and applied, repeat the full round-45 directory comparison for sls-111.
  Liqvid must have awarded rounds 37 and 45, never submitted-but-not-awarded rounds 30 and 44.
  The proposed 11 edits do not replace missing-project intake.
- Docs: the [Docs table](rounds/2026-11-05-truth-maintenance/docs.md) identifies each unmerged
  PR, review/check blocker and exact live trigger. Recheck those pages after deployment;
  green checks alone do not close findings. The author-owned protocol PR2059 is behind but
  green and awaiting review; respond to substantive review without a keepalive rebase.
- Docs continuation (2026-11-09): sd-091 and sd-098 are retired with ten other deployed fixes
  ([ledger](rounds/2026-11-09-upstream-handoffs.md)). sd-101 carries the remaining complete
  WebAuthn example compile failure and sd-100 the USDT0 launch-page cadence; recheck each only
  when its upstream issue reports a fix. sd-095 and sd-097 were retired earlier; see the
  [resolution ledger](rounds/2026-11-06-playground-final-resolution.md).
  The [continuation table](rounds/2026-11-06-remaining-sweep/docs.md) records all current
  review/conflict blockers, including draft2752 and the separate pending generated-skill PR3069.
- Lumenloop ll-022/023/024: the original records did not retain a reproducible wrong milestone,
  preview-boundary omission or stale venue row. The current checks do not prove those content
  errors. Before any future closure or renewed claim, obtain the exact original/corrected record
  or an owner explanation of the change; otherwise reassess the evidentiary basis. See the
  [other-collections table](rounds/2026-11-05-truth-maintenance/other.md) for exact IDs and queries.
- cs-006: the Paxos metadata wording still reproduces, but no public repository owns the served
  TOML. Keep intake unclear until a metadata repository is identified or the owner authorizes
  contact through the published support channel. Do not file against an unrelated contract repo.
- sk-031: the orphan legacy skill remains live. After the owner applies the supplied workflow
  cleanup patch, verify both legacy/current skill URLs and preserve preview deployments.


Done when each triggered verification has a fresh live result and independent retirement review,
or a precise remaining defect in its active finding. Source tables carry the exact URLs/commands.

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

2026-11-06: the monitor fails again. The answer selects `MaxSupportedProtocolVersion = 29`
from an October 8 note, while its own `scannedRef` (`597544b6…`) defines `30` at
`internal/ingest/main.go:38`. This is a current-source selection defect, not a claim that the
historical note or Mainnet protocol 29 is false. New finding `sls-115` preserves the regression;
see [the continuation](rounds/2026-11-06-remaining-sweep/other.md) and its distinct cross-review.
The November 5 passing monitor verdict missed the scan-ref comparison. After an upstream note
refresh/invalidation fix, repeat both original and explicitly current queries against each
returned scan commit. Keep the recovery program blocked; no paid collection is authorized.

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
the current accepted source is Scout 1.9.116 (accepted 2026-11-03). Use current main and a fresh source snapshot for any
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

Source decision for this item: Scout spec 1.9.116 replaces 1.9.61 with all twelve exclusions retained.
The coordinator accepted option (a) on 2026-11-03.
None of the five historical loss grades recurs on the unchanged scorer.
The new source loses `q-scf-how-to-apply` at top3 and gains two strict grades.
The coordinator accepted this tradeoff; it does not satisfy the general repair checks.
The four new operations remain excluded: `reviewSubmission`, `analyzeHackathonSubmissions`,
`getHackathonSubmission`, and `locateSource`.
The four golden proposals remain inactive because their required operations remain excluded.
Decision and evidence: `rounds/2026-11-03-scout-1.9.116.md`.
Issue #223 stays open for the routing repair and the separate Docs title hold.
The Scout source hold ends; the stellar-light skill pin remains unchanged.
The separate hold keeps `inventory/stellar-docs-titles.json` at its Algolia-era bytes, so its
`source.authEnv` still names the deleted `ALGOLIA_*_DOCS` secrets. Nothing reads them; the next
refresh after the hold ends rewrites the file keyless.

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

2026-10-28 authorized repair round (owner authorization and decision B option 1, conditional;
Codex `gpt-6.1-sol` xhigh built, Claude Opus high verified; ledger
`rounds/2026-10-28-routing-repair.md`). Five designs ran on all 544 rows against current sources and
a frozen fresh source (Scout 1.9.111, 682 Docs titles, stellar-light pin `789c9061`). C6 stopped at
offline validation. No design passes. Decision B never applied: no design passed every other check.

- On the unchanged scorer, Scout 1.9.111 no longer has the four named 1.9.71 regressions. The fresh
  source changes two grades, and both are gains. The lead judged check 12 on graded losses only
  (ledger, decision D1). The written check and the strict helper verdict still fail on the two
  gains.
- C1 (schema keywords cannot admit, quota replacement at or above quota) fails 5, 8, 10, 12.
- C2 (schema keywords add rank only within whole-token boundaries) passes 1–7, 9, 11 on both
  sources. It loses OZ upgradeable-macro top3, Friendbot top5, Groth16 top3, and fresh x402 top5.
  Stopword substrings inside schema words held up the first two.
- C3 (global Porter stemming and broad quota repair) and C4 (short-page quota fill, full-page
  membership block) trade many losses for gains. The short-page fill raises hackathon interference
  from 7 to 13 rows.
- C5 (near-universal and example-only tokens do not count toward admission) loses checks 7 and 9.
- C6 (build-time Clef intent/object labels with a committed naive Bayes query classifier; USD 0.57)
  failed offline validation and was not wired: 50.8% intent and 27.8% object agreement on the
  corpus. Its gate rejects the correct OpenZeppelin entries and keeps the third RWA control.
- No candidate passes check 8. The RWA fixture lacks the builder's schema `keywords`; exposed
  through the builder, RWA costs four graded rows and enters 20 pages.
- T1: `test/search.test.ts:1039` holds on main only through the spurious schema-only
  `scout.getRfps` admission.

Next attempt: needs new mechanism evidence, not a seventh lexical variant. The class approach needs
a requested-subject object axis and a calibrated model (verify lane `design-check8.md` and
`c6-offline.md`, defects D1–D3). The best clean parent is C2 with the stem fold scoped to the
schema-support test. Evidence: `rounds/2026-10-28-routing-repair/` (`impl/failure-analysis.md`,
`verify/final.md`) and the ignored archive `eval/results/2026-10-28-routing-repair-evidence.tar.gz`.

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


2026-11-02 delegated round (decision B, pre-registered contract with two amendments; ledger
`rounds/2026-11-02-routing-repair.md`). Nine designs ran on both sources; none passes, and the
scorer stays. `morph` token boundaries plus the schema rule fix the short-token and schema-only
classes, but broad retrieval and skills recall then collapses. Next direction: restore that
recall with legitimate evidence first, then remove the spurious kind. Owner decision B (a model
call on search) was answered on 2026-11-03: search stays lexical-only. Eight pre-registered
Workers AI variants and the recorded Jev rankings (#294) all fail the signed contract
(`rounds/2026-11-03-model-ranking/results.md`). The closest, dense MULT and clef-flash RRF,
fail mostly by promoting hackathon operations and unlabeled skills, so a lexical repair must
not depend on model evidence.

### Bind the `scout_hackathon_detail` card to its operation

Found by the 2026-11-03 null-result attack (`rounds/2026-11-03-model-ranking/results.md`,
"Independent checks"). `cardMatches` in `eval/lib/grade.mjs` matches the expected operation text
`hackathon_detail` against `gethackathon`, so the card binds to no catalog operation. The
routing eval cannot credit `scout.getHackathon` on `q-scf-hackathon-detail-results`, and
interference checks cannot classify the row as a hackathon row. Fix the card-to-operation
binding generally, then re-run `npm run eval:routing -- --gate` and record any cardHit5 change
through the accepted-evidence process.

Done when: every card in the routing corpus binds to at least one catalog operation or service,
with a test that fails on an unbound card.

### Stop schema enum values and example tokens from admitting new Scout operations

Found by the 2026-10-28 repair round (`rounds/2026-10-28-routing-repair/verify/final.md`, O3). On
the fresh Scout source, `analyzeHackathonSubmissions` and `getHackathonSubmission` enter seven
non-hackathon top-five pages. The matched evidence is own-repo extraction, not Scout text. The
builder turns input-schema category enum values into entry `keywords` (`anchor`, `dex`, `rpc`,
`indexer`, `off`, `others`). It also extracts generic tokens from Scout `exampleQuestions` into
`routingKeywords` (`stellar`, `building`, `use`, `show`, `pay` from "TollPay"). Scout's own
`x-routing` keywords and `notFor` clauses for these operations are specific and correct, so this is
not an upstream finding.

Next: treat it with the scoring repair above. A narrow builder rule needs the same twelve checks.

Scout 1.9.116 also admits `searchHackathonBuilds` on `q-defi-lumenloop-categories-vocab` through new schema keywords.
It replaces `getRfps` at rank 5; `lumenloop.get_categories` stays at rank 4.
The gated pool grows from 6 to 7, with no strict grade change.
The source acceptance records this capture; it does not resolve this item.

Done when: the two operations, and `searchHackathonBuilds` through schema keywords, no longer
enter non-hackathon pages in the 544-row corpus and the verify lane's 22 hackathon negative
probes, with no graded loss.

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

### Move the demo off the deprecated `workers-ai-provider`

On 2026-10-20 Cloudflare closed cloudflare/ai#639 unmerged and froze `workers-ai-provider`. npm
marks 4.0.1 deprecated and names `createAI` from `agents/models/ai-sdk` as the replacement. That
replacement accepts any `<author>/<model>` catalog id, so it can remove the second providers-less
instance that `src/demo/chat.ts` keeps for `moonshotai/kimi-k3` (finding `wai-001`, now
`declined-upstream`). Raven pins `agents` 0.28.1. Both 0.28.1 and 0.32.0 export `createAI` from
`agents/models/ai-sdk`, but in a 2026-11-02 review check only 0.32.0 accepted `moonshotai/kimi-k3`
before a binding call, so the migration needs the upgrade. The `agents` upgrade also moves the MCP server runtime, so it needs `npm run test:smoke`, the
single-`workerd` check above, and a Playground run of every demo model.

Blocked since 2026-11-03. A migration attempt with `agents@0.32.0` found that `createAI` string
catalog models drop `providerOptions.anthropic` (adaptive `thinking` and `effort`) on the binding
`/run` path. Finding `cs-010` records it with a self-contained repro under
`rounds/2026-11-03-demo-createai/repro/`; `agents@0.33.0` behaves the same. A native Anthropic
model keeps the options but moves to the provider-native route, so it is not a substitute. The
binding path also has no stream-resume opt-out (cloudflare/agents#2790 requests one); that gap is
lower priority because no Raven failure from automatic resume is known. Keep `workers-ai-provider`
until `cs-010` is fixed upstream. Owner decision recorded the same day: keep current behavior and
do not migrate through a different transport.

Done when: an `agents` release forwards Anthropic provider options for `anthropic/*` catalog ids on
`/run` (re-run the `cs-010` repro to prove it), a reviewed decision covers stream resume (the
`#2790` opt-out, or accepting automatic resume), and then `src/demo` and
`test/demo-model-config.test.ts` no longer import
`workers-ai-provider`, the package is out of `package.json`, and `wai-001` is closed out under the
`improvements-pipeline` skill. The migration removes Raven's dependency but does not fix the frozen
package, so it is not `fixed-upstream` evidence. The resolver accepts only `fixed-upstream`
records, so that close-out needs a reviewed lifecycle decision.

### Re-check the Playground primary when a new OpenAI model ships

On 2026-11-03 a paired 30-case semantic check kept `openai/gpt-5.6-terra` as the primary.
`openai/gpt-6-luna` cost $0.094 against $1.883 in answer spend, but scored 6 correct, 18 partial,
and 6 wrong against Terra's 8, 17, and 5. Luna had three new wrong answers (two hand-confirmed) and
two tool-loop failures. Terra had two new wrong answers (both hand-confirmed) and no tool-loop
failures. The switch rule allows no new wrong answers and no tool-loop regressions. That check retained `openai/gpt-5.6-luna` as fallback. The
numbers are in
[the re-check record](../research/audits/2026-11-03-playground-model-recheck.md).

The recovered November 3–4 sweep supplies the recorded transport gauntlets for the SDK upgrade
to `@ai-sdk/openai@4.0.108`, which fixes the earlier dropped-effort failure. The November 6
integration keeps the shipped model tuple and adds offline regression checks. The sweep's stage 3
stopped before a final decision; its partial results do not authorize promotion. See the
[recovered sweep ledger](rounds/2026-11-03-playground-model-sweep.md) and
[cleanup record](rounds/2026-11-06-main-only-cleanup.md). Any resumed paid collection needs a fresh
reviewed plan, complete comparable rows, evidence-pack validation, and production-transport gates.
OpenAI's cyber-safety filter also refused `q-n3-cross-thread-memory-exfiltration` for both Terra
models in the earlier 10-case diagnostic; no current fix is asserted.

Done when: a later OpenAI model passes the gauntlet on the installed SDK and is not worse than the
primary on a paired 30-case semantic check, or the owner decides to stop re-checking.

## Eval instruments

### Clarify the model-facing `codemode.describe` response shape

The November 9 primary production check recovered from reading `spec.data.signature`:
`codemode.describe` returns `{ ok: true, signature, inputSchema, ... }` at the top
level, while service calls use `{ ok: true, data }`. See the retained failure in
[the Playground decision](../research/audits/2026-11-09-playground-product-decision.md).
Decide whether model-facing documentation or a forward-only shape change best
resolves the ambiguity; evaluate that prompt/behavior change separately. Do not
retry the closed model experiment or bundle a shape change into its release.

Done when: one reviewed, measured correction makes the describe shape clear to models.

### Resolve diagnostic noncompletions and judge ambiguities

Done on 2026-11-03: the bounded proposal task is complete.
The [follow-up](../research/audits/2026-11-03-qa-followup/README.md) maps 100 cases and 314 observations to actions.
It records 15 verified source findings, three local patches, and two approved and applied v4 golden corrections.
Eight local SDK checks support three finding promotions.
The separate five-file finalization candidate remains unmeasured and preserves the 16-request ceiling and expired deadline.

Original results retain 97 grades, three limits, and $28.973832; quality remains withheld.
The [final checks](../research/audits/2026-11-03-qa-followup/final-checks.json) pass with their recorded warnings and separate protocol-history diagnostic failure.
The [final independent review](../research/audits/2026-11-03-qa-followup/independent-review.md) clears the follow-up.

### Review a fresh finalization comparison and capability canary

The [candidate](../research/audits/2026-11-03-qa-followup/finalization-candidate.md) has no measured completion or quality benefit.
Its expired deadline authorizes no collection.
Prepare a separate paired protocol with fresh control and candidate results.
Match the selection and corpus, and pin source and provider identities.
Keep the judge contract fixed across both arms.
Obtain independent review, explicit paid authorization, and an approved active deadline before any capability canary or collection.

Done when: an authorized canary checks `tool_choice: "none"`.
Fresh paired evidence must measure completion, factual quality, refusals, violations, latency, and cost.
Preserve every selected failure and keep historical results separate.
No current document grants that authorization.

### Resolve held source ownership and bounty policy

The [source triage](../research/audits/2026-11-03-qa-followup/additional-source-triage.md) and [bounty access record](../research/audits/2026-11-03-qa-followup/bounty-policy-access.json) retain these holds:

- RWA: identify the source owner, measurement period, denominator, and component set before correcting a growth rate.
- Phoenix: identify the source owner and dated submission IDs; reconcile the headline with the same award-status filter.
- Bounty: obtain the current controlling policy and its revision before settling scope, severity, or reward claims.

Done when: primary owner and policy evidence supports a reviewed correction or an explicit continued hold.
Do not infer an owner, denominator, deployment, or controlling policy from search snippets.

### Re-verify the event-tied goldens after SCF #46 Panel Review and the Bell vote

The 2026-11-02 golden audit (`rounds/2026-11-02-golden-audit.md`) moved every other `reverifyBy`
date into 2027. Eight cases keep earlier dates, because each one depends on a known event, and
`npm run eval:qa:lint -- --stale --enforce-floors` fails every PR once a date passes:

- SCF #46 Submission closes 2026-11-09 and Panel Review starts 2026-11-11: `q-scf-open-rfps`
  (2026-11-10), `q-scf-rfp-tooling` (11-11), `q-scf-current-round` and
  `q-edge-fresh-latest-scf-round` (11-12). Also check whether the official RFP Track page has
  published Q4 briefs and whether Scout agrees. The November 5/6 round verified the withdrawn
  Q3 briefs are now closed in Scout and retired `sls-096`; do not carry forward the old lag claim.
- The Bell/P30 Mainnet vote is on 2026-11-23 17:00 UTC: `q-pc-protocol-upgrade-timing`,
  `q-protocol-version-history-list`, and `q-edge-fresh-latest-protocol-version` (11-24), and
  `q-hist-quantum-preparedness-plan` (12-01). The `mainnet-protocol-29` source sentinel fires when
  Mainnet activates Protocol 30. Update the register's Bell date trap in the same change.

Use the `golden-truth` skill: live evidence from two or more source classes, a refreshed
`truth.verified`, staggered 2027 dates where no new event applies, and `npm run eval:qa:register`.

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

- The recovered November 3–4 model sweep reports an 85-row tag list reduced to 82 rows in
  judge evidence, with false wrong verdicts on `q-ti-vocab-project-tags-live`. Before another
  model-selection round, recover the original transcript and compare its exact rendered pack;
  repair and independently validate any confirmed truncation before relying on affected scores.
  This is a dated reported defect, not a new live reproduction; see the
  [sweep ledger](rounds/2026-11-03-playground-model-sweep.md).
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

Trigger: a reviewed exposure change makes `scout.getHackathonSubmission` callable.
The Scout 1.9.116 acceptance keeps this operation excluded.
The upstream operation returns explicit `placement` for one stored submission.
Two
existing cases still require the event-detail path as the only route: `q-scf-kale-winner-live`
(key facts 1 and 2 require `getHackathons` then `getHackathon`) and `q-gap-hackathon-winner-order`
(key fact 1 requires `getHackathon` detail). The independent review of the 2026-10-06 golden lane
found this grading-path overlap. No factual contradiction exists. History:
`.agents/rounds/2026-10-06-scout-hackathon-goldens/review-astra.md` ("Duplicate and boundary
review") and `reconciliation.md` row 15.

Done when: both cases accept explicit placement from event or submission detail, through the
`golden-truth` workflow, or a recorded decision keeps the event-detail path as the only route.

### Activate the Scout hackathon golden proposals when their required operations are exposed

Four proposals sit in `eval/qa/corpus/proposed/scf-grants-builders/`.
The Scout 1.9.116 acceptance keeps their required operations excluded.
None is active, and the two operation floors stay unmet.
The independent review cleared three for activation after
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
out-of-scope cases, or records why the prompt stays.
A change to run-qa.mjs or judge.mjs changes the implementation hash.

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

### Monitor Friendbot network-context synthesis

Case `q-edge-send-me-free-xlm` called Friendbot Testnet-only, with no tool call. Stellar Docs expose
Testnet, Futurenet, and local Quickstart distinctions. The same case was wrong again in the
2026-09-04 candidate artifact. This is one answering failure, not an upstream finding or a
prompt-repair decision. A repeat of the same case does not fire this monitor.

Done when: the same wording defect appears in a second unrelated case (a different question family
and primary service; not a paraphrase), a contract mismatch appears, or trace evidence shows the
prompt requests the wrong behavior. Record every recurrence with its case ID, result stamp, and
transcript.

## HackMeridian 2026 review follow-ups

Found by the 2026-10-26 weekend review: 58 probe questions in two rounds (22 Opus, 36 Sonnet),
four questions repeated on Sonnet and Haiku, and independent Fable grades against primary sources.
Probe ids below are `Q<n>` (round 1) and `R<nn>` (round 2). The report, the probe answers, and the
grades are in the owner's private evidence snapshot `2026-10-26-hackmeridian` (see
`usage/README.md`); that copy also holds the production figures, which stay out of this repo.

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

### Add golden cases for the confirmed HackMeridian gaps

Use the `golden-truth` skill. First cases: R04 (`try_` nesting), R20 (testnet reset, December 16,
2026), R23 (OZ stellar-contracts version and audits), R31 (stablecoin issuers), and Q18 (testnet
oracle addresses). Writing the cases is free. The owner decided on 2026-11-02 not to run a
dedicated paid battery for them ("We don't need to overfit for any single case or instance"); they
are graded in the next authorized QA round with the rest of the battery.

Proposal pass 2026-11-03: R04 already has `q-sor-decode-hosterror-codes`; R23 has
`q-soroban-oz-token`; R31 has `q-asset-stablecoin-issuers-discovery`. New R20 and Q18 IDs stay
proposed: `q-infra-testnet-reset-schedule-recovery` and
`q-sor-reflector-testnet-contract-addresses`. Public-source matrices live in their truth blocks.
See [the proposal ledger](rounds/2026-11-03-hackmeridian-golden-proposals.md).

Activation hold 2026-11-03: the independent review gave ACTIVATE for both proposals
([review](rounds/2026-11-03-hackmeridian-golden-proposals-review.md)). Activation fails the corpus
coverage lint: the scheduled share would be 177/503 (35.2%), above the 35% cap in
`eval/qa/lint-corpus.mjs` (the 2026-07-11 design target that limits upkeep by design). One case alone
is 176/502 (35.06%). The coordinator kept the cap: both facts expire with the 2026-12-16 Testnet
reset, which also removes the listed Reflector Testnet contracts. Reopen after the reset with the
post-reset facts, or when the scheduled share has room, or by converting other scheduled cases to
behavioral wording through `golden-truth`. Raising the cap needs an owner decision.
Independent activation review and the later activation commit remain outstanding.

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

### Consider consolidating the auxiliary Workers

Raven deploys three Workers beside `stellar-raven-codemode`: the usage collector
`stellar-raven-usage` (Tail Worker, `usage/wrangler.jsonc`), the usage report API
`stellar-raven-usage-report` (`usage/report-site/cloudflare/wrangler.jsonc`), and the OpenAI domain
challenge `stellar-raven-openai-verification`. The owner asked on 2026-10-25 whether fewer Workers
would do. Each has its own config and deploy step, which adds operator load.
The domain-challenge Worker has no secrets or service bindings.

Questions to answer before any change:

- Can the main Worker serve the report API and the OpenAI challenge as fixed routes without
  widening the MCP surface, the sandbox boundary, or the D1 binding's reach?
- Can a Worker be its own tail consumer, or must the collector stay separate? Cite Cloudflare docs.
- Does the collector's "no HTTP route" isolation in `usage/README.md` still hold if it absorbs the
  report API?
- What changes in `usage-health`, `scripts/check-usage-deployment.mjs`, the fork setup steps, and
  the Sites dashboard's `USAGE_REPORT_URL`?

No trigger authorizes implementation. A proposal needs a short design note and independent review,
and it must keep the privacy rules in `usage/README.md`.

Done when: the owner accepts a reviewed consolidation and it ships, or the owner keeps the current
split and this item is deleted.

## OpenAI plugin submission

### Obtain a written exception for the accepted two-tool endpoint

The owner selected one endpoint and preservation of the accepted Claude implementation on 2026-10-23.
The October 23 portal scan reported two operation-exposure findings and one artifact-persistence
annotation finding. Reviewer OAuth access passed checks that day. Package `0.1.2` passed all eight
rehearsal cases after a description fix. The owner submitted it on October 23; the last recorded
portal state was `In review` and `Not published`. The reply was still an unsent draft.
Recheck the existing submission and correspondence before acting; later status is not established here.
The shared runtime, tool definitions, and annotations remain unchanged.
Use the [case report](../plugins/openai/REVIEW-CASES-2026-10-23.md),
[findings](../plugins/openai/MCP-FINDINGS.md), and
[exception request](../plugins/openai/EXCEPTION-REQUEST.md).
Do not describe the exception as approved without OpenAI's written decision.
Before publication, resolve publisher verification and privacy-policy coverage. The November 6
source check still finds query/response logging for 30 days in `src/site.ts` versus operational
metadata retention of at most seven days in `docs/operations.md`; the plugin records do not resolve it.

Done when: OpenAI grants the required exceptions, or the owner approves another submission approach.

### Remove the OpenAI domain verification Worker after approval

`stellar-raven-openai-verification` (source: `plugins/openai/domain-verification/`) serves only
`raven.stellar.org/.well-known/openai-apps-challenge`. The October 23 portal check confirmed
`Domain verified`. Preserve the service until its current verification requirement is confirmed.

Trigger: OpenAI approves and publishes the app, or the owner withdraws the submission. Before
removal, confirm in the portal that no active submission or published app still needs the live challenge. Then
delete the Worker and its route, delete `plugins/openai/domain-verification/`, and update the
references in `plugins/openai/README.md` and `plugins/openai/VERIFICATION.md`. Fold this into the
consolidation item above if that work runs first.

Done when: the Worker, its route, and its source are gone, and either the published app still passes
the portal's connection check or the owner has confirmed withdrawal with no remaining challenge requirement.

## Owner decisions

Each decision names the question, the evidence it needs, and the safe default. Record each answer
in a round ledger, `eval/qa/README.md`, or a decision record, then delete the decision here.

No owner decision is open.
