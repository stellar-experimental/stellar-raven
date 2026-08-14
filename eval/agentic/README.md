# Agentic routing eval — Sonnet 5 sub-agents against live `search`

Measures what the lexical routing eval (`eval/run-routing.mjs`) can't: whether a **real agent
caller** — free to reformulate queries (≤3 searches) and read hit descriptions — commits to the
right tool for a golden question.

> The `search` evaluated here (host-side ranked query) is the shipped top-level shape — see
> [ADR-0001](../../research/decisions/0001-search-tool-shape.md) for the decision of record.

## Method

- 30 stratified cases from `eval/routing-cases.json` (12 stellarDocs / 10 scout / 8 lumenloop;
  selection = every-Nth per service, id-sorted → `sample.json`).
- Each case posed to the Workflow model alias `sonnet` (Sonnet 5 for this run) at **low** and
  **medium** reasoning effort (60 runs), via the Workflow harness `workflow-agentic-routing.js`.
- Agent gets only the question + a curl recipe for `tools/call search` against a local
  `wrangler dev` server; must return structured `{queriesUsed, primaryToolId, primaryService,
  alternateToolIds, reasoning}`.
- Each row also preserves every search call as `searchCalls`: query, limit, ordered hit
  `{id, tier, score}` tuples, `total`, `truncated`, `zeroGated` (true when the page returned no
  gated-tier hit), and advisory `widerCandidateIds` (ids from the page's widerCandidates block —
  the search response's broad-operation advisory)—no descriptions or other payload content.
  `zeroGated` is derived by the harness from the captured hit tiers (in the first
  transcript-instrumented run — the 13 pages captured across the six targeted-A/B rows below —
  agents mislabeled their own reported flag in both directions on 3 pages).
- `primaryInHits` is true when the primary id appears in any captured page's ranked hits; false
  marks an off-page primary pick, whether advisory-driven or hallucinated.
- Grades: **primary** = primary tool's service matches the label; **any** = primary or an
  alternate hits the labeled service.

## Results — 2026-07-04 (upstream stellar-light OpenAPI 1.4.4 drift verification, GitHub issue #2; runs `wf_0d429a7c-285` baseline / `wf_7ed97384-f2a` drift, local-only)

Change under test: the daily live-drift refresh brought stellar-light 1.3.2 → 1.4.4 — additive
response-schema fields on existing scout ops (`repoMeta`, `lastActivityAt`, `lastCommitAt`, date
formats) plus upstream description rewords (`searchResearch` trimmed to "security incidents —
reentrancy, soroban-sdk advisories/CVEs, DoS"). No operation added/removed. Because the rewords
feed the lexical scorer AND move the exact lumenloop/scout boundary the 835 round tuned, verified
agentic-first before committing the drift + gate re-baseline. Same 30 `sample.json` cases,
grading rule v3 (ADR-0003), Sonnet 5 low+medium. Baseline = committed post-836 catalog; drift =
1.4.4 catalog served from the same `wrangler dev`.

| scope | base low pri/any | drift low pri/any | base med pri/any | drift med pri/any |
|---|---|---|---|---|
| stellarDocs (12) | 100 / 100 | 100 / 100 | 100 / 100 | 100 / 100 |
| scout (10) | 60 / 80 | **80 / 90** | 80 / 80 | **90 / 90** |
| lumenloop (8) | 37.5 / 50 | 37.5 / 50 | 25 / 75 | **37.5** / 62.5 |
| **overall (30)** | 70 / 80 | **76.7 / 83.3** | 73.3 / 86.7 | **80 / 86.7** |

Reading (per-case, both runs' primary picks): **net +4 primary hits, no regression at medium
effort.** Six primary GAINS — 3 lumenloop (`q-asset-rwa-tokenized-freshness:low`,
`q-defi-aquarius-what-is:medium`, `q-defi-comet-content:low` all left docs/scout for lumenloop)
and 3 scout (`q-hist-unhcr-stellar-aid-assist:low`, `q-scf-ambassador-program:low`,
`q-scf-liquidity-award-amount:medium` left docs for scout). Two LOSSES, **both low-effort only**
and both lumenloop→scout: `q-defi-rwa-overview:low` ("what RWA products are live") and
`q-edge-fresh-latest-blend-tvl:low` ("Blend's TVL today") — the latter an 835 win that erodes at
low but **holds lumenloop at medium**. Both are the directory/freshness label-ambiguity the
2026-07-02 interpretation notes describe, now amplified by 1.4.4's freshness fields making scout a
defensible structured answer; not a routing failure. lumenloop primary did not collapse (flat at
low, +1 at medium); docs unchanged at 100%. Lexical instrument agrees: routing gate re-baselined
203/265/303 → 213/267/303 (`routing-2026-07-04T15-58-31-434Z.json`), 14 improvements / 8 strict
regressions (7 hold under accept-either). Nothing tuned per-question; the 2 low-effort flips are
monitor-only (re-tuning would fight a legitimate upstream scout improvement).

## Results — 2026-07-04 (post lumenloop/scout boundary notes, Solo todo 835; `results/agentic-2026-07-04.json`, git-ignored/local-only)

Catalog change under test: the paired catalog notes in `scripts/description-notes.mjs` —
`lumenloop.search_directory` claims "what is X / who builds X" narrative-editorial questions,
`scout.searchProjects` declares itself structured-facts-only and points editorial asks at
lumenloop. Twin-aware (rule v2) throughout; workflow run `wf_35311ccf-657`, same 30
`sample.json` cases:

| scope | low primary | low any | medium primary | medium any |
|---|---|---|---|---|
| stellarDocs (12) | **100%** | 100% | **100%** | 100% |
| scout (10) | **50%** | 70% | **50%** | 80% |
| lumenloop (8) | **37.5%** | 62.5% | **37.5%** | 87.5% |
| **overall (30)** | **66.7%** | 80% | **66.7%** | 90% |

Reading (per-row diff vs `agentic-2026-07-03.json`, primary picks): the flips **at the tuned
boundary all moved the intended way** — `q-defi-soroswap-what-is:low` (the follow-up idea #4
flagship case) went scout.searchProjects → lumenloop.search_directory, and
`q-edge-fresh-latest-blend-tvl` (both efforts) went scout.searchProjects →
lumenloop.get_project; no case flipped toward scout.searchProjects. The six primary
regressions vs 2026-07-03 (`q-edge-deep-no-budget-limit` ×2, `q-scf-ambassador-program:medium`,
`q-scf-liquidity-award-amount:low`, `q-asset-rwa-tokenized-freshness:medium`,
`q-defi-comet-content:low`) are all between op-pairs the notes never touched
(research pipeline vs getPartners, search_doc_titles vs searchResearch, contract docs vs
find_av_passages) and none of their recorded reasoning mentions either tuned description —
single-run agent variance, not attributable to the change. Residual lumenloop misses
(e.g. `q-eco-lobstr-wallet` → scout.searchProjects on "who builds LOBSTR and what is its
scale") ask for exactly the structured fields the scout note claims, i.e. the known label
ambiguity of interpretation #3, not a routing failure. Lexical instrument for the same
change: routing gate PASS with 0 per-case regressions / 3 improvements
(`routing-2026-07-04T02-50-10-035Z`). Nothing tuned per-question, numbers as-is.

## Results — 2026-07-03 (post src-hardening 62fa42d + stellar-light description enrichment 18e7357; `results/agentic-2026-07-03.json`, git-ignored/local-only)

Twin-aware (routing rule v2) numbers; original v1-graded values in parentheses where they
differ:

| scope | low primary | low any | medium primary | medium any |
|---|---|---|---|---|
| stellarDocs (12) | 91.7% | 91.7% | **100%** | 100% |
| scout (10) | **70%** | 100% | **70%** | 90% |
| lumenloop (8) | **25%** | 87.5% (v1 62.5%) | **37.5%** (v1 25%) | 75% (v1 50%) |
| **overall (30)** | **66.7%** | 93.3% (v1 86.7%) | **73.3%** (v1 70%) | 90% (v1 83.3%) |

Interpretation vs 2026-07-02 (v1-vs-v1, since the 2026-07-02 table below is v1-graded): scout
primary +40/+30pts (the description enrichment paying off agentically); lumenloop primary
−12.5/−37.5pts and v1 any-hit −25/−37.5pts — 8 of 12 lumenloop misses routed to
`scout.searchProjects` on "what is X / who builds X" project-lookup phrasings, i.e. the
enrichment moved the lumenloop/scout boundary. Twin-aware regrade (2026-07-03): `grade()` in
`workflow-agentic-routing.js` mirrored rule v2 at the time (`skills.lumenloop.*` /
`skills.lumenloop-api.*` twin-skill picks satisfied the lumenloop label). *(Superseded 2026-07-04,
ADR-0003: the script now grades rule v3 — no twin identity; service labels are exact.)* Offline regrade of the saved 60 rows flips 5 run verdicts
(1 medium primary — `skills.lumenloop-api.lumenloop-api-research` — plus 4 any-hit alternates),
lifting lumenloop any-hit to 87.5%/75% and medium primary to 37.5%; the boundary drift vs
2026-07-02 is real but roughly half the size v1 grading suggested on any-hit.

## Results — 2026-07-02 (manifest 374 entries, post Wave-2 scoring; `results/agentic-2026-07-02.json`, git-ignored/local-only)

| scope | low primary | low any | medium primary | medium any |
|---|---|---|---|---|
| stellarDocs (12) | **100%** | 100% | **100%** | 100% |
| scout (10) | 30% | 60% | 40% | 60% |
| lumenloop (8) | 37.5% | 87.5% | 62.5% | 87.5% |
| **overall (30)** | **60%** | 83.3% | **70%** | 83.3% |

## Interpretation

1. **The docs-spec fix fully holds up agentically**: 24/24 docs runs picked the right
   intent-named stellarDocs operation, at both efforts, usually in one search.
2. **Medium effort beats low by +10pts primary overall** (biggest gain on lumenloop,
   37.5→62.5%) — depth mostly helps agents distinguish overlapping catalog services, not find
   hits.
3. **Most remaining misses are label ambiguity, not search failure.** Examples: SCF questions
   labeled `scout` routed to `lumenloop.search_content_semantic` / `find_similar_scf_submissions`
   — Lumenloop legitimately covers SCF funding data; "what is Soroswap" (labeled lumenloop) →
   `scout.searchProjects` — a defensible project lookup; the OpenZeppelin Soroban question →
   the openzeppelin skills. The 83.3% any-hit rate at both efforts is the better signal of
   usable routing; the primary-hit gap between services reflects real corpus overlap that
   single-service labels can't express.
4. Follow-up ideas: multi-label grading for overlap questions (not yet acted on); description
   boundary-tuning between lumenloop content search and scout structured lookups — **acted on
   2026-07-04** (Solo todo 835, results section above).

## Re-run

1. `npx wrangler dev --port 8788 --host localhost` (any port; `--host localhost` is required —
   without it wrangler presents request.url as the custom-domain host and the
   `DEV_ALLOW_UNAUTHENTICATED` loopback gate 401s everything)
2. Start the harness-owned capture proxy in front of it:
   `node eval/agentic/capture-proxy.mjs --upstream http://localhost:8788 --port 8789 --out eval/agentic/results/capture-<stamp>.jsonl`
3. Invoke the Workflow tool with `eval/agentic/workflow-agentic-routing.js` and args
   `{"port": 8789, "cases": [...]}` — the PROXY port, so every agent exchange is captured —
   where cases come from `sample.json` (`node -e` slim mapping: id/question/expected_service).
4. Save the returned `{summary, rows}` under `results/` (git-ignored), then reconcile the
   transcripts against the wire before reading any mechanism forensics:
   `node eval/agentic/reconcile-capture.mjs --capture <capture.jsonl> --results <results.json>`
   — non-zero exit (`summary.tainted`) means the run's transcript forensics are untrustworthy:
   a row's reported `searchCalls` did not reproduce the captured exchanges (fabricated,
   mistranscribed, or omitted page), a row reported nothing while the wire showed searches, or
   the capture holds traffic that cannot be attributed to any row (`summary.anomalies` /
   `unmatchedMarkers`). Treat every transcript-derived field in that run as rejected; the
   Grade columns still stand. Update the summary tables in this README — the README is
   the committed record, not the JSON.
   When the raw report rejects only page content and every row still has the same query/limit
   multiset as the wire, write a separate wire-authoritative copy with:
   `node eval/agentic/reconcile-capture.mjs --capture <capture.jsonl> --results <results.json> --raw-reconciliation <reconcile.json> --write-normalized <normalized-results.json> --workflow <workflow-id>`.
   This mode keeps the exact raw reconciliation summary in `normalization.rawReconciliation`,
   verifies and hash-pins the supplied raw reconciliation,
   copies the wire pages into top-level `searchCalls`, preserves the agent's original pages in
   `rawAgentSearchCalls`, and derives `primaryInHits` from the wire. It requires a result summary,
   unique result markers, and identical query/limit multisets across verdict, top-level, and wire
   calls. It also refuses capture anomalies, unmatched markers, empty reports with captured
   traffic, and any output path that overwrites an input. Re-run the ordinary reconciliation
   command against the normalized copy before using its forensics.

## Results — 2026-07-06 (post-round-5 checkpoint; run `wf_b5be4d53-41f`, local-only)

Change under test: round-5 search-surface changes (hit tier/total/truncated fields, filter
validation, describe-as-detail-step + oversized-signature stubs, alias lever 6) on the
post-1.5.0 catalog. Same 30 `sample.json` cases, Sonnet 5 low+medium:

| scope | low pri/any | medium pri/any | prior (07-04 drift run) low / med pri |
|---|---|---|---|
| stellarDocs (12) | 100 / 100 | 100 / 100 | 100 / 100 |
| scout (10) | 90 / 100 | 90 / 100 | 80 / 90 |
| lumenloop (8) | **12.5 / 25** | **12.5 / 25** | 37.5 / 37.5 |
| **overall (30)** | 73.3 / 80 | 73.3 / 80 | 76.7 / 80 |

Reading (nothing tuned, numbers as-is): first run with **identical low/medium** numbers —
effort-stable. scout +1 case. The story is lumenloop 37.5 → 12.5: per-case decomposition shows
6/7 missed cases are the documented lumenloop/scout boundary — `scout.searchProjects`' upstream
description (1.4.4/1.5.0) now name-drops specific products and claims "what is X / who built X"
outright, so agents defensibly pick it for product questions labeled editorial
(`soroswap-what-is`, `lobstr-wallet`, `rwa-overview`, `blend-tvl`, both efforts). One genuine
misroute (`q-defi-aquarius-what-is` → docs, both efforts) and one skill-twin capture
(`rwa-tokenized-freshness:low` → the ecosystem-digest section whose heading matches the
question verbatim). Filed as **sls-015** (description editorial-capture, 8/16 lumenloop-labeled
runs) rather than re-tuned here — the enrichment legitimately improved scout's own routing and
the gateway's counter-balancing catalog note did not hold; per-question counter-tuning would
violate the no-case-tuning rule. QA headline on the same day was aggregate-identical to the
prior best (see eval/qa/README.md), so the capture costs routing-label accuracy, not answer
quality on this sample.

## July 9 P1 closeout — raw artifact unavailable

The discovery-redesign closeout records the P1 repeated-run summary (Docs 100% in all cells,
Scout medium 90% ×3, Lumenloop medium at its 37.5% ×3 baseline) and a separate QA best-of-three
summary of 23 correct / 6 partial / 1 wrong. No July 9 agentic raw result JSON is available in
the local-only results store, so there is no reproducible per-row artifact to cite here. A
coordination note mentions only the fragment `2026-07-09T15-09-32`; that is not a complete
verified filename and is deliberately **not** recorded as a result stamp. Treat the aggregate
P1 prose as an unavailable historical artifact, not as a re-runnable stamped result.

## Results — 2026-07-11 (post-tier-interleave checkpoint; run `wf_cbfb579a-c35`, artifact `results/agentic-2026-07-11-post-interleave.json`, local-only)

First full row-level agentic artifact since July 6, and the **new row-level baseline of record** —
no comparable July 9 per-row artifact exists (see above), and the July 2–4 artifacts predate
multiple catalog changes, so this run is not compared per-row against them. Same 30 `sample.json`
cases, Sonnet 5 low+medium, live `wrangler dev` on :8787 at runner revision `d6e443c`, case hash
`6f810545`. Completeness gate met: 60/60 unique id×effort rows, all 30 ids at both efforts, 0 errors,
0 retries.

| scope | low pri/any | medium pri/any | prior (07-06) low / med pri |
|---|---|---|---|
| stellarDocs (12) | 100 / 100 | 100 / 100 | 100 / 100 |
| scout (10) | 50 / 70 | 90 / 100 | 90 / 90 |
| lumenloop (8) | 50 / 50 | 50 / 62.5 | 12.5 / 12.5 |
| **overall (30)** | **70.0 / 76.7** | **83.3 / 90.0** | 73.3 / 73.3 |

Reading (aggregate-only, nothing tuned): this is a **composite** post-`c8a3b4d` checkpoint (Scout
1.7.15/Docs drift absorb `6cf5bbf` + tier interleave `bb25276` + stochasticity), so **no causal
claim is made about `bb25276`** — the committed agentic sample is the routing-cases sample and
contains none of the interleave-recovered extended cases. Docs held at 100% across all cells; scout
medium recovered to 90/100; lumenloop medium rose from July 6's 12.5% to 50% and low from 12.5% to
50% — recorded as observational, not causally attributed. Full round context and the QA/routing
lanes are in `eval/qa/reviewed/2026-07-11-tier-interleave-round.md`.

## Results — 2026-07-28 (stale-gap round checkpoint; run `wf_ef07a0b9-25f`, local-only)

Run as the agentic lane of the 2026-07-27 QA round (Solo scratchpad 715). Clean committed HEAD
`dbee852ebc755cc815d8c50dd50d86ec4a10ce92` with `src`/`test` stashed and asserted empty; dev server
restarted and readiness proven by a real MCP `initialize` returning 200. Harness-hardcoded `sonnet`
alias at low and medium, 30 cases x 2 efforts = **60 jobs, one attempt each, no retries**.
Completeness verified before reading: **60 done / 0 error / 0 skipped / 0 empty**. 2,705,631
subagent tokens, 208 tool uses, 83s. Sample `3f8ac620...d15fe`, ids `91ca1752...5dd6`, workflow
`71b787b6...c67d`; slim case hash `6f810545...4002`, byte-identical to the 2026-07-11 baseline, so
per-row comparison is valid.

| effort | scope | baseline 2026-07-11 | 2026-07-28 | delta |
| --- | --- | --- | --- | --- |
| low | overall primary | 21/30 (70.0%) | 20/30 (66.7%) | -3.3 |
| low | stellarDocs | 12/12 (100%) | 12/12 (100%) | 0.0 |
| low | scout | 5/10 (50%) | 7/10 (70%) | **+20.0** |
| low | lumenloop | 4/8 (50%) | 1/8 (12.5%) | **-37.5** |
| medium | overall primary | 25/30 (83.3%) | 20/30 (66.7%) | **-16.6** |
| medium | stellarDocs | 12/12 (100%) | 11/12 (91.7%) | -8.3 |
| medium | scout | 9/10 (90%) | 7/10 (70%) | -20.0 |
| medium | lumenloop | 4/8 (50%) | 2/8 (25%) | -25.0 |

8 primary losses, 2 gains, net -6. **Mechanism: Scout is capturing Lumenloop's entity-identity
lookups.** 12 of 13 misrouted lumenloop cases now pick a `scout.*` operation. Concentrated in
"what is X" project-identity questions: `q-defi-soroswap-what-is` moved
`lumenloop.search_directory` / `get_project` -> `scout.searchProjects` at BOTH efforts,
`q-defi-aquarius-what-is` moved to `stellarDocs.search_docs`, `q-defi-comet-content` to
`scout.searchResearch`. Medium also stopped beating low (both 66.7%), where the baseline had medium
clearly ahead.

Likely cause, **not proven**: `42be531` (absorb Scout 1.8.28) sharpened Scout project/prior-art
descriptions. The `eval/gates.json` note for that same re-baseline already documented this class of
movement in the routing lane and accepted it as more accurate Scout routing; its agentic cost was
not measured then. This run is that measurement.

**Instrument disagreement worth recording:** the routing gate PASSED unchanged on this same HEAD
while this lane moved -16.6pp at medium, and the QA headline showed no movement at all. The gate
scores the lexical scorer's top-N; this lane scores what an agent actually picks.

Reading limits, binding on any follow-up: comparison is **observational across a composite
21-commit interval, never causal**. This instrument has **no committed variance estimate** — one
sample per id x effort, no retries — so a repeat run is required before treating -16.6pp as real
rather than as instrument noise. Own-repo follow-up is Solo todo 1232; no per-question tuning.

### Variance re-run — 2026-07-28 (`wf_336f3b63-94a`, local-only)

Second sample at identical config, same clean HEAD `dbee852e`, ~10 minutes after
`wf_ef07a0b9-25f`, run specifically to separate mechanism from instrument noise.

**The re-run is INCOMPLETE: 58 done / 2 error / 0 skipped.** Both failures were
`API Error: Connection closed mid-response` — infrastructure, not routing — on
`low:q-scf-v7-changes` and `medium:q-scf-exhaustive-funding-report`. Per the lane's
completeness rule this **forbids reading run 2 as an aggregate or as a baseline delta**: its
denominators silently shrank to n=29 overall and n=9 for scout. Its raw numbers (low 21/29, medium
20/29) are recorded only to show what was discarded and must not be compared to a 30-denominated
run.

What the re-run *does* license is a **paired per-row comparison on the 58 id×effort pairs both runs
completed** — the first variance estimate this instrument has ever had:

> **Run-to-run primary-hit flip rate: 5/58 = 8.6%** on identical configuration and revision.

Flips: `q-scf-liquidity-award-amount|medium` (miss→hit), `q-defi-aquarius-what-is|medium`
(hit→miss), `q-defi-comet-content|low`, `q-defi-soroswap-what-is|low`,
`q-defi-soroswap-what-is|medium` (all miss→hit). **Four of five are lumenloop cases.**

Corrected reading of the 2026-07-28 checkpoint above:

| claim | status after the re-run |
| --- | --- |
| lumenloop low −37.5pp (4/8 → 1/8) | **substantially noise.** Run 2 gave 3/8; honest range is −12.5 to −37.5pp |
| lumenloop medium −25pp (4/8 → 2/8) | **reproduces exactly** (2/8 in both runs) |
| stellarDocs medium 12/12 → 11/12 | **reproduces** — `q-tool-cctp-stellar-integration` is a stable loss, not a draw |
| stellarDocs low 12/12 | **stable across both runs** |
| scout medium 9/10 → 7/10 | reproduces directionally (7/9 in run 2) |
| "`q-defi-soroswap-what-is` shows Scout capturing Lumenloop entity lookups" | **withdrawn as a flagship example** — it flipped to a hit at both efforts in run 2 |

The lumenloop lane is n=8. A single case is 12.5pp, so two noisy cases swing it 25pp — larger than
most effects anyone would want to read from it. **Do not draw per-service conclusions from the
lumenloop lane on one run.** The stable, twice-observed findings are: medium no longer beats low,
lumenloop medium sits at 2/8, and one stellarDocs medium case is genuinely lost.

### Targeted copy A/B — 2026-07-28 (`wf_cbc17819-87c`, local-only, 1 case × 3 repeats × 2 efforts)

The todo-1232 mechanism (zero-gated pages' nextSteps copy steering primary-tool choice to
widerCandidates) led to a general prompt-surface change: the zero-gated suffix now leads with
ranked-hit authority and scopes the advisory to genuine recovery. Measured on the affected case
(`q-tool-cctp-stellar-integration`, expected stellarDocs) with the transcript-instrumented
harness, **new copy only** — the old-copy baseline is this case's rows in the two full
2026-07-28 runs above (one observation per run per effort), NOT a matched arm, and the raw run
artifact is local-only per the results-dir convention, so the committed evidence is this table:

| repeat | effort | primary pick | service hit? | primaryInHits |
| --- | --- | --- | --- | --- |
| 1 | low | lumenloop.search_content_semantic | miss | true (ranked #1 on-page for a news-phrased query) |
| 1 | medium | lumenloop.search_content_semantic | miss | **false — advisory-followed off-page across two zero-gated pages** |
| 2 | low | stellarDocs.search_asset_token_docs | hit | true |
| 2 | medium | lumenloop.search_content_semantic | miss | true |
| 3 | low | stellarDocs.search_asset_token_docs | hit | true |
| 3 | medium | stellarDocs.search_protocol_concepts_docs | hit | true |

Honest reading, scoped to what n=3 supports: **no measurable win** (medium 1/3 vs 0/2 baseline
is not significant; low 2/3 vs a previously stable hit is not an improvement), and **no
advisory-attributed harm observed in the low repeats** — the one low miss picked a hit that
legitimately ranked #1 on its page for a news-phrased query, which is a ranking outcome, not
the advisory mechanism. That causal attribution is a judgment call, and the low aggregate did
not improve; n=3 cannot support a global no-harm product claim. One medium repeat still
followed the advisory off-page, so wording alone does not fully resolve the
recovery-vs-tool-choice collision. The structural option (suppressing/downgrading
widerCandidates when strong backfill hits exist) remains unproposed and would need its own
measured round. `primaryInHits` caught the off-page pick exactly as designed; `zeroGated`
proved unreliable as an agent-reported field and is now derived by the harness from captured
hit tiers.

**Transcript trust boundary — what the harness actually guarantees (2026-07-30).** `searchCalls`
pages are transcribed by the evaluated agent from its own curl output, and the harness derives
`zeroGated`/`primaryInHits` from that transcription. Since 2026-07-29 the runbook adds
harness-owned capture: `capture-proxy.mjs` sits in front of `wrangler dev` and logs every
exchange to a JSONL file, keyed by the mandatory `X-Eval-Agent: <caseId>:<effort>` curl header;
`reconcile-capture.mjs` then compares each row's reported calls against the wire.

Reconciliation **fails closed** (hardened 2026-07-30 after a five-model adversarial review
reproduced five bypasses of the first cut). A run is `tainted` — non-zero exit — when any row's
reported calls do not reproduce the wire multiset (fabrication, mistranscription, omission), when
a row reports no calls at all while the run captured search traffic, when a marker is stray or
unknown, or when the capture holds any exchange that cannot be attributed to a row: a missing
marker, a JSON-RPC batch, a `tools/call` for a tool other than `search` (an agent can route
discovery through `execute`), an unparseable body, or a non-200 status. Anomalies are reported
with kind + marker rather than silently dropped, and a transient upstream failure is segregated
as its own class so it taints the run without manufacturing a phantom omission.

**What it is not: adversarial isolation.** The evaluated agent runs as the same user with shell
access, so it could in principle append to the capture file or reach the upstream port directly,
bypassing the proxy. The guarantee is wire-versus-transcript reconciliation with fail-closed
anomaly detection against a non-cooperative-but-not-actively-attacking agent — not
tamper-proofing. Closing that would need the proxy under a separate user or a write-only channel
the agent cannot open; judged out of proportion for a local eval harness and recorded here as
residual risk instead. Runs made without the proxy — including everything before 2026-07-29 —
carry none of this and remain transcription-trust evidence only. Grading (`primaryService` vs
label) never consults any of it.
