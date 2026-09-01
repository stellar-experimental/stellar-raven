# Search-routing eval

> **Start at [`eval/EVALS.md`](./EVALS.md)** — the one-page map of all eval instruments,
> which numbers are gates vs diagnostics, and the rules that keep them targeted.

Measures **search ROUTING accuracy, not answer quality**: given a real user question from
the golden QA corpus, does `searchCatalog()` (src/catalog/search.ts, frozen contract in
Solo scratchpad 514) surface an entry from the *correct service* near the top of its results?

- **top-1 / top-3 / top-5**: any hit whose `service` equals the case's `expected_service`
  at rank 1 / within the first 3 / within the first 5 (query = the raw question, `limit: 5`).
- **card@5** (secondary, only for cases with operation-level `expected_cards`): any top-5
  hit whose id matches one of the expected capability-card labels under the tolerant
  normalizer below. Service-level cards of the form `<service>_mcp` (e.g.
  `stellar_docs_mcp`) name a whole service, not an operation; they are retired from card@5
  (see "Service-level cards retired from card@5" below) — a case carrying only those is not
  card-graded, because service routing is already measured by top-1/3/5.

Nothing here executes tools or grades prose answers — that is the separate `execute` Q→A
battery in [`eval/qa/`](./qa/) (LLM-judged answers over the whole two-tool surface; see
[`eval/EVALS.md`](./EVALS.md) for how the instruments fit together).

## Corpus and label mapping

Source: `eval/corpus/raven-golden-qa/big.json` — 395 labeled questions (vendored snapshot of
the retired `raven-golden-qa` sibling checkout; provenance + checksums in
`eval/corpus/PROVENANCE.md`).
Unlike the raven-next compile step, `compile-routing.mjs` **preserves** the
`expected_service` / `expected_cards` labels. Label → catalog namespace:

| corpus `expected_service` | catalog namespace | cases |
|---|---|---|
| `stellar_light` | `scout` | 95 |
| `stellar_docs` | `stellarDocs` | 183 |
| `lumenloop` | `lumenloop` | 60 |
| `perplexity` | — skipped (general-web service, not in catalog) | 43 |
| `parallel` | — skipped (general-web service, not in catalog) | 4 |
| `none` | — skipped (governance / should-not-fire cases) | 10 |

Usable: **338**; skipped: **57** (listed with reasons in `routing-cases.json` → `skipped`).

### Corpus tolerance + extended lane (2026-07-02, todo 817)

Two data-driven additions, both **strict-grading-neutral** (the legacy 338 strict numbers are
unaffected — verified exactly 183/236/256 after the change):

- **`expected_any` from `acceptable_cards`.** The corpus authors encoded "also-correct
  alternates that wouldn't be a routing miss" per case (`acceptable_cards`; non-empty on
  383/395, crossing services on 361). The compile step now derives a service-level
  accept-either set from them (281 of the 338 legacy cases carry one), unioned at run time
  with the hand-reviewed build-question overlay. Reported as a separate
  "legacy accept-either" line, never as the headline.
- **Extended lane.** The vendored 538-case corpus (`eval/corpus/raven-next/`) contains 144
  net-new ids that `big.json` predates — mostly the 2026-06-29 jitsu-mined real-user
  questions. Their routing labels are parsed from each question file's YAML frontmatter
  (`eval/lib/labels.mjs`) and compiled into `extendedCases`: **122 usable**
  (94 stellarDocs / 25 scout / 3 lumenloop), 22 skipped (4 perplexity, 18 none). Graded as
  its own lane, never merged into the legacy aggregate.

### Card-name normalizer (documented tolerance)

Corpus cards use raven-next naming (`lumenloop_search_directory`, `scout_projects`,
`stellar_docs_mcp`); catalog ids are `service.op_name`. Service-level cards — whose op
token after prefix mapping is exactly `mcp` — are excluded before matching (they name no
operation; see the retirement note below). A remaining card matches a hit when, after
canonicalization (lowercase, `-`/`.`/space → `_`):

1. the full tokens are equal, **or**
2. the card's service prefix (`lumenloop_` → lumenloop, `scout_`/`stellar_light_` → scout,
   `stellar_docs_` → stellarDocs, `skills_` → skills) equals the hit's service **and** the
   remaining op names are equal, **or**
3. same service and one op name contains the other, with the shorter op ≥ 4 chars
   (tolerates `projects` vs `list_projects`; blocks trivial substrings).

Implementation + unit fixtures: `eval/lib/grade.mjs`, `eval/self-test.mjs`.

### Service-level cards

A `<service>_mcp` card names a service, not an operation. Card@5 excludes these cards because
top-1/3/5 already measures service routing. A case with no operation-level card is not card-graded.
Stellar Docs operation routing remains unmeasured until the corpus names specific Docs operations.
This release defers those labels because the current reviewers already saw rankings and results.
A later blind author must select operation labels from source questions and the Docs API contract.
That author must not read the scorer, manifest ranking, or prior result traces before freezing labels.

## How to run

```sh
# 0. sanity-check the grader math and committed evidence (no server needed)
node eval/self-test.mjs

# 1. compile corpus -> eval/routing-cases.json (labels preserved)
node eval/compile-routing.mjs            # optional arg: alternate corpus path

# 2. grade routing -> eval/results/routing-<timestamp>.json + console tables
node eval/run-routing.mjs
```

`run-routing.mjs` also loads three **hand-authored** files at run time (deliberately not part
of the compile step, so `node eval/compile-routing.mjs` can never wipe them):
`eval/skills-cases.json` (the skills lane) and `eval/build-question-overlay.json` (the
accept-either overlay), plus `eval/protocol-history-cases.json` (a diagnostic with eight
positive cases and four direct-lookup controls). These files are optional. Without them,
the run degrades to the legacy 338-case eval.

Zero new dependencies: `run-routing.mjs` imports `src/catalog/search.ts` directly (Node
≥ 23.6 native type stripping); if the direct import fails it transpiles the file (and its
relative imports) to `eval/.build/` with the repo's own `typescript` package.

npm scripts: `npm run eval:selftest` / `eval:compile` / `eval:routing` (QA lane:
`eval:qa:compile` / `eval:qa:selftest` / `eval:qa`; plan: `eval:plan`).

**Gate enforcement:** baselines are committed in `eval/gates.json` (legacy 338 top-1/3/5
±1%, skills-lane top-1 floor). The gate record includes SHA-256 fingerprints for every gated
data input and exact accepted lane totals. `eval:selftest` proves that a fresh clone resolves
each input and matches each fingerprint. Every routing run verifies the same evidence, prints a
`GATE PASS`/`GATE FAIL` verdict, and records it in the results JSON.
`npm run eval:routing -- --gate` turns an evidence mismatch, a threshold breach, or a changed
denominator into exit 1. CI runs `eval:selftest` + `eval:routing -- --gate` on every push/PR.
Re-baselining updates the fingerprints, totals, thresholds, timestamp, and decision note together.
A raw result name can appear as optional `evidence.localTrace` context. It never defines the
committed baseline because `eval/results/` is local-only.

## Baseline

First full run: 2026-07-02, catalog/manifest.json @ 359 entries (lumenloop 35, scout 20,
stellarDocs 1, skills 303), Lane C initial lexical search. Results file:
`eval/results/routing-2026-07-02T02-59-48-071Z.json`. 338 cases graded, 57 skipped at
compile (43 perplexity, 4 parallel, 10 none).

| scope | cases | top-1 | top-3 | top-5 | card@5 |
|---|---|---|---|---|---|
| lumenloop | 60 | 38.3% | 61.7% | 76.7% | 16.7% |
| scout | 95 | 33.7% | 50.5% | 64.2% | 28.4% |
| stellarDocs | 183 | 0.0% | 0.0% | 1.1% | 3.3% |
| **OVERALL** | **338** | **16.3%** | **25.1%** | **32.2%** | **12.7%** |

Reading notes (numbers reported as-is, nothing tuned):

- Search is purely lexical over catalog text, so entries only rank when the question
  shares tokens with their description (known quirk from Lane C: e.g.
  `lumenloop.search_directory` ranks 13th for "soroban defi projects").
- stellarDocs is near-zero by construction, not by mystery: that namespace is a single
  authored docs-search op competing against 358 richly-described entries, while its 183
  questions are topical ("how do I deploy a Soroban contract…") and share almost no
  tokens with a generic docs-search description. On those questions the top-5 slots go
  to skills (206 slot appearances), scout (292), and lumenloop (137) instead.
- This baseline is the motivation for routing-aware scoring (service priors, docs-keyword
  expansion, or intent classification) — not evidence the eval or search is broken.

## Round 2 (2026-07-02, todo 793): docs-spec integration + structural scoring

Two changes, measured separately. Catalog moved 363 → **374 entries**: the 1 thin
stellarDocs op was replaced by the 12 authored, live-verified ops from
`specs/stellar-docs.json` (Lane D, todo 796); deny-list grew by `scout.submitPartnerListing`
(creates draft partner accounts) and `scout.partnerAssistant` (logs leads).

**Step 1 — integration only** (scoring untouched, results file
`routing-2026-07-02T14-12-33-697Z.json`): the 12 topical docs descriptions alone fixed the
starvation, at a small cost to scout/lumenloop (docs entries flooding their top-5s):

| scope | top-1 | top-3 | top-5 | card@5 |
|---|---|---|---|---|
| lumenloop | 38.3% | 56.7% | 71.7% | 16.7% |
| scout | 28.4% | 47.4% | 58.9% | 27.4% |
| stellarDocs | 65.6% | 71.6% | 72.7% | 2.7% |
| **OVERALL** | **50.3%** | **62.1%** | **68.6%** | **12.1%** |

**Step 2 — structural scoring** (`src/catalog/scoring.ts`, wrapped around the untouched
vendored scorer; frozen search contract unchanged). Three query-independent levers — no
per-question cases, no query→service maps:

1. **Stopword gate-rescue** — entries failing the vendor token-coverage gate are rescored
   with general English stopwords removed from the query (40/338 questions previously
   returned zero hits). Entries that pass keep their exact vendor score. (Filtering
   stopwords for *all* scoring was iteration 1 and regressed everything — recorded below.)
2. **Kind weight** — `skill-section` × 0.75 (fragments whose whole-skill entry also ranks;
   they held 303 of 1284 top-5 slots and are never a routable service).
3. **Service diversity** — per-service quota in the returned set (⌈40%⌉ of the page,
   floor 2); a service's first in-page hit always survives, only 3rd+ appearances get
   trimmed in favor of runner-up services.

Iteration trajectory (runs land in `eval/results/`, git-ignored/local-only; overall top-1/3/5):

| iteration | levers | overall | verdict |
|---|---|---|---|
| baseline-r2 | integration only | 50.3 / 62.1 / 68.6 | reference |
| 1 (`14-16-01`) | stopwords-everywhere + kind 0.8/0.65 + diversity | 43.2 / 52.1 / 56.2 | regression — discarded |
| 2 (`14-17-23`) | gate-rescue + diversity | 50.6 / 67.5 / 75.4 | keep |
| 3 (`14-17-47`) | + skill-section × 0.85 | 53.0 / 68.9 / 75.7 | keep |
| 4 (`14-18-00`, **shipped**) | skill-section × 0.75 | 54.1 / 69.8 / 75.7 | best |

**Shipped result** (`routing-2026-07-02T14-20-45-119Z.json`, vs round-1 baseline):

| scope | cases | top-1 | top-3 | top-5 | card@5 | round-1 top-5 |
|---|---|---|---|---|---|---|
| lumenloop | 60 | 41.7% | 76.7% | 86.7% | 20.0% | 76.7% |
| scout | 95 | 31.6% | 54.7% | 67.4% | 29.5% | 64.2% |
| stellarDocs | 183 | 69.9% | 75.4% | 76.5% | 3.3% | 1.1% |
| **OVERALL** | **338** | **54.1%** | **69.8%** | **75.7%** | **13.6%** | **32.2%** |

Targets (todo 793): stellarDocs top-3 ≥ 50% ✓ (75.4), overall top-5 ≥ 60% ✓ (75.7),
lumenloop top-5 ≥ 70% ✓ (86.7), scout top-5 ≥ 60% ✓ (67.4).

Honest caveats:

- card@5 for stellarDocs stays ~3%: the corpus expects the raven-next card name
  `stellar_docs_mcp`, whose op token ("mcp") never matches our intent-named op ids under
  the normalizer. Service-level routing is the metric that matters here.
- stellarDocs top-5 caps at ~76%: of its 43 remaining fails, most are questions whose
  vocabulary genuinely lives in scout/lumenloop descriptions (slot fillers on those fails:
  scout 50, lumenloop 26, skills 21), and 16 are still zero-hit. The stopword rescue only
  recovered 4 of the original 40 zero-hit cases overall (36 remain): the rest fail on rare
  proper-noun/topic tokens ("YieldBlox", "Travel Rule", …) absent from every catalog
  description — unreachable lexically without corpus-side vocabulary, which would violate
  the no-case-tuning rule if hand-added.
- scout top-1 (31.6%) is the weakest headline: docs ops out-score scout ops on shared
  topical vocabulary; diversity recovers it at top-3/5 but rank 1 goes to the wordier
  description. A field-level length normalizer is the obvious next lever if Wave 3's
  agentic eval shows it matters in practice.

## Skills lane (2026-07-02, todo 809)

**Why.** The compiled corpus labels only scout / stellarDocs / lumenloop — there was **no
case whose expected answer is the `skills` service** (25 mirrored skills + 203 sections,
299 catalog entries). Under that structure every skills hit graded as a miss, so any
scoring change tuned against this eval was structurally rewarded for burying skills (the
shipped skill-section × 0.75 kind-weight is exactly such a lever). This lane fixes the
*measurement*; it does not touch `src/` or the scorer.

Two hand-authored files, both loaded by `run-routing.mjs` at run time (NOT by
`compile-routing.mjs`, so recompiles never wipe them — verified: recompile + rerun
reproduces all numbers):

**1. `eval/skills-cases.json` — the lane itself.** 23 active hand-written questions where a
mirrored skill is the uniquely right route, phrased as playbook/walkthrough requests
(the thing a skill is and a single catalog op isn't), plus 8 retained `retiredCases` for
the lumenloop-api onboarding/API-surface skills removed from catalog exposure on
2026-07-03. Active coverage spans both skill flavors: code-operational (stellar-dev
smart-contracts ×4 incl. its testing/security companions, openzeppelin setup/upgrade/
secure ×3, dapp ×2, data ×2, assets, agentic-payments, standards, zk-proofs) and
non-coding operational (lumenloop ecosystem playbooks scout/digest/dossier/integration-
finder/scf-radar/content-auditor/builder-quickstart/mcp-connect ×8; stellar-light
stellar-scout ×1). Active cases carry `expected_cards` in the
`skills_<terminal-name>` form the normalizer maps to the skills service (rule 2 + rule-3
containment bridges the `<source>` segment in `skills.<source>.<name>` ids). Graded
strictly as its own scope — **never merged into the legacy 338-case aggregate**.

**2. `eval/build-question-overlay.json` — per-case accept-either labels for genuinely
ambiguous cases.** 34 hand-reviewed records (33 legacy, 1 extended) attach an
`expected_any` set to a specific case at load time. Most are stellarDocs-labeled
build/how-do-I questions where a mirrored skill covers the same procedure; the
extended Axelar bridge case accepts scout, lumenloop, or skills. Records are reviewed
question-by-question against actual skill content, precision over recall (what-is /
which-SEP / lookup / comparison questions excluded), and reported **both ways**:
strict (expected_service only) and accept-either (any accepted service counts).
The headline `overall` / `perService` numbers stay strict-only, so legacy comparability
is never lost — grader-side, `gradeCase`'s strict fields are computed identically whether
or not an accept set is passed (fixture-proved in `self-test.mjs`).

**How to run:** nothing new — `node eval/run-routing.mjs` prints the normal lane tables
plus separate legacy and extended overlay dual-grading tables, and writes `skillsLane`
+ `overlay` sections into the results JSON alongside the unchanged legacy keys.

**BEFORE numbers** (`routing-2026-07-02T20-41-03-868Z.json`, same catalog + shipped
scoring as Round 2; legacy strict verified byte-identical to the
`14-23-33-014Z` baseline — 183/236/256 of 338):

| scope | cases | top-1 | top-3 | top-5 | card@5 |
|---|---|---|---|---|---|
| skills lane (strict) | 31 | 48.4% | 90.3% | 90.3% | 90.3% |
| overlay subset, strict | 32 | 90.6% | 93.8% | 93.8% | — |
| overlay subset, accept-either | 32 | 93.8% | 96.9% | 100.0% | — |

Legacy overall recomputed with the overlay's accept-either grading (context only):
54.4 / 70.1 / 76.3 vs strict 54.1 / 69.8 / 75.7.

Reading notes (nothing tuned, numbers as-is):

- Skills route well at top-3/5 (90.3%) but only 48.4% at rank 1. The dominant rank-1
  competitor is not scout/docs ops but **`lumenloop.skill.*`** — the lumenloop service's
  own skill-fetch operations share the mirrored skills' vocabulary and grade as service
  `lumenloop`. On 11 of the 16 top-1 misses the rank-1 hit is the *same-named*
  `lumenloop.skill.*` entry with the `skills.*` entry at rank 2 (remainder: 2 zero-hit,
  2 outranked by stellarDocs ops, 1 by a scout op). Whether that should
  count as correct routing is a policy question for the next scoring round, not a grader
  bug — recorded here so the AFTER comparison can address it deliberately.
- 3/31 cases are full misses (2 of them zero-hit): `q-skill-soroban-first-contract`,
  `q-skill-soroban-testing-strategy`, `q-skill-eco-scout-rwa-landscape` — same lexical
  starvation family as the legacy zero-hit cases (question vocabulary absent from every
  catalog description).
- card@5 equals top-5 in this lane (90.3%): when the skills service surfaces at all, it
  is the *right* skill — the `skills_<terminal>` card form + rule-3 containment works.

## Corpus tolerance + extended lane results (2026-07-02, todo 817)

Run: `routing-2026-07-03T01-06-36-453Z.json` (same catalog + shipped scoring as the skills
round; **legacy strict gate verified — exactly 183/236/256 of 338**).

| scope | cases | top-1 | top-3 | top-5 |
|---|---|---|---|---|
| legacy strict (unchanged headline) | 338 | 54.1% | 69.8% | 75.7% |
| legacy accept-either (acceptable_cards ∪ overlay) | 338 | 67.2% | 83.4% | 86.1% |
| extended lane, strict | 122 | 24.6% | 27.0% | 28.7% |
| extended lane, accept-either | 122 | 37.7% | 41.8% | 42.6% |

Reading notes (nothing tuned, numbers as-is):

- **Corpus-sanctioned tolerance closes a big chunk of the "misses."** +13.1 points top-1,
  +13.6 top-3 under the corpus's own `acceptable_cards`. This is the data-driven
  confirmation of the agentic eval's "label ambiguity, not search failure" reading — and
  the corpus-side context for the twin-shadowing policy question (todo 816): many
  lumenloop/scout "wrong-service" hits are alternates the corpus authors explicitly
  sanctioned.
- **The extended lane is the real news: search struggles on real-user phrasing.** The 144
  net-new questions are jitsu-mined from actual user traffic (long, multi-clause,
  operational). 65/122 return **zero hits** (vs 26/338 legacy); stellarDocs strict top-1 is
  18.1% (94 cases) with top-3 ≈ top-5 ≈ top-1 — when the lexical scorer misses, nothing
  ranks at all. This lane is the target metric for any future retrieval work (query
  decomposition, synonym/vocab expansion, semantic scoring); the legacy 338 stays the
  non-regression gate.
- card@5 is near-zero in the extended lane (1.6%) for the same structural reason as legacy
  stellarDocs card@5 (~3%): frontmatter expects the `stellar_docs_mcp` card whose "mcp" op
  token never matches intent-named ops. Known artifact, not new signal.

## Twin-aware grading (rule v2) + metadata-twin suppression (2026-07-03, todo 816)

**Policy decision.** `lumenloop.skill.<name>` (metadata-only, transport null) and
`skills.<source>.<name>` (readable) are ONE resource — `src/skills/store.ts` aliases reads
across them by terminal-name equality. Grading them as different services created the
zero-sum recorded in todo 810/816: every twin dedupe variant traded legacy lumenloop hits
for skills-lane gains. Two changes, in order:

1. **Grading rule v2 (twin-aware):** the grader mirrors the store alias — a hit on either
   twin form satisfies both the `lumenloop` and `skills` labels (and twin card identities).
   The twin terminal-name set is derived from the manifest at run time, never hardcoded
   (`eval/lib/grade.mjs` `hitServices`, fixtures in `self-test.mjs`). Rule v1 (twin-blind)
   was reported for one transition round as `overallV1TwinBlind`; that transitional
   reporting was retired 2026-07-03 (todo 820) — the runner now emits v2 only.
2. **Search-side suppression:** with grading fixed, the previously-rejected dedupe was
   re-measured and SHIPPED — `searchCatalog` drops the metadata twin when its readable
   twin exists (except under an explicit `service: "lumenloop"` filter, where the readable
   form is ineligible). Catalog/execute/`skill.read` unaffected.

Measured (routing-2026-07-03T01-38-05-370Z, same catalog/scorer):

| scope | rule | top-1 | top-3 | top-5 | card@5 |
|---|---|---|---|---|---|
| legacy 338, pre-suppression | v1 (old gate) | 183 (54.1%) | 236 (69.8%) | 256 (75.7%) | 13.3% |
| legacy 338, pre-suppression | v2 | 195 (57.7%) | 244 (72.2%) | 261 (77.2%) | 13.3% |
| legacy 338, **suppression shipped** | **v2 (NEW GATE)** | **195 (57.7%)** | **250 (74.0%)** | **266 (78.7%)** | **15.4%** |
| skills lane 31, suppression shipped | v2 | 28 (90.3%) | 30 (96.8%) | 30 (96.8%) | 96.8% |

Reading notes:

- The v1→v2 jump (+12 top-1) is lumenloop cases whose rank-1 hit was the readable
  `skills.lumenloop.*` twin — correct routes that v1 mis-graded. The suppression then
  IMPROVED top-3/top-5/card@5 outright: freed result slots surface real ops (scout
  top-3 53.7→60.0, lumenloop card@5 18.3→26.7).
- Skills lane 54.8%→90.3% top-1 under v2: the twin-shadowing "misses" were grading
  artifacts, exactly as todo 809's key finding suspected. 3/31 remain missed (the
  lexical-starvation family).
- **Gate baselines from this point: legacy 338 v2 = 195/250/266; skills lane = 28/31
  top-1.** The v1 line (171/227/253 post-suppression) is retired after this round —
  v1 penalizes the readable twin the product now correctly prefers. *(Superseded
  2026-07-03 by todo 820 — re-baselined to 208/267/283, skills 26/31, on stellar-light
  description-enrichment drift; the v1 transitional reporting was removed entirely that
  round. See "Re-baseline (2026-07-03, todo 820)" below.)*

## Re-baseline (2026-07-03, todo 820): stellar-light description-enrichment drift

Upstream Stellar Light (scout) enriched its operation descriptions with routing-guidance
text; the daily live-drift refresh rebuilt the inventory/catalog with it. That drift
legitimately improves legacy routing and shifts the skills lane, so the gates are
re-baselined (`eval/gates.json`) in the same change — and the rule-v1 (twin-blind)
transitional reporting is retired here per EVALS.md rule 1 (`overallV1TwinBlind`, the
per-case `v1` field, the `aggV1` aggregate, and the "legacy strict under retired rule v1"
console line are all removed; the runner emits v2 only).

Run: `routing-2026-07-03T02-32-37-858Z.json` (same scorer; catalog is the drifted refresh).

| scope | rule | top-1 | top-3 | top-5 | card@5 |
|---|---|---|---|---|---|
| legacy 338 (prior gate) | v2 | 195 | 250 | 266 | 15.4% |
| legacy 338 (**new gate**) | **v2** | **208 (61.5%)** | **267 (79.0%)** | **283 (83.7%)** | **24.0%** |
| skills lane 31 (prior floor) | v2 | 28 | 30 | 30 | 96.8% |
| skills lane 31 (**new floor**) | **v2** | **26 (83.9%)** | **30 (96.8%)** | **30 (96.8%)** | **96.8%** |

Reading notes:

- **Legacy +13 top-1 / +17 top-3 / +17 top-5** come from scout ops that now carry
  routing-guidance vocabulary, so they rank on questions where they previously lost slots
  to docs/lumenloop entries. No scoring change, no per-question tuning — pure catalog drift.
- **Skills lane 28→26 top-1** (two regressions, investigated and accepted):
  `q-skill-soroban-testing-strategy` and `q-skill-builder-quickstart-remittance` now rank a
  scout op at rank 1 (`scout.searchRepos` / `scout.searchProjects` — defensibly relevant to
  a testing-strategy / remittance-builder ask). Both keep the skills hit in top-3 and their
  `cardHit5`, so the right skill still surfaces; accepted per the build-questions-pull-both
  rubric (a build/how-do-I question legitimately pulls both a procedure skill and a
  discovery op). The three long-standing lexical-starvation misses
  (`q-skill-soroban-first-contract`, `q-skill-data-indexer-workflow`,
  `q-skill-assets-stablecoin-issuance`) are unchanged.
- Gate verdict: `--gate` PASSES against the new baseline (legacy within ±3 of 208/267/283,
  skills lane top-1 26 at floor).

## Re-baseline (2026-07-03, todo 825): onboarding-skills retirement + tiered gate-rescue backfill

Two round-4 changes landed in this baseline. (1) The **tiered gate-rescue backfill** (round 4 M1,
`src/catalog/scoring.ts` lever 5): long multi-clause questions that gate to zero now get an
ungated tier-2 page appended strictly below the gated tier-1 hits — no gated ranking changed, so
the legacy lane moved on backfill alone (208→219 top-1). (2) The **onboarding-skills retirement +
twin de-dup** (ADR-0002): the 7 Lumenloop API-onboarding skills were retired and all 14
`lumenloop.skill.*` twins deny-listed, and the skills lane was **re-scoped 31→23 cases** — the 8
cases that targeted the retired onboarding skills moved to `eval/skills-cases.json` `retiredCases`
(documented-inert, not deleted). The skills floor is re-expressed on the new denominator; the 5
long-standing lexical-starvation misses are unchanged, so 26/31 → 18/23 is the same real miss set.

Run: `routing-2026-07-03T13-59-06-937Z.json` (grading rule v2, twin-aware).

| scope | rule | top-1 | top-3 | top-5 |
|---|---|---|---|---|
| legacy 338 (prior gate, todo 820) | v2 | 208 | 267 | 283 |
| legacy 338 (**new gate**) | **v2** | **219** | **287** | **313** |
| skills lane (prior floor, /31) | v2 | 26 | 30 | 30 |
| skills lane (**new floor, /23**) | **v2** | **18** | — | — |

Reading notes:

- **Legacy +11/+20/+30** is pure tier-2 backfill of previously-zero-hit long questions; the
  extended (real-user-phrasing) lane is where it shows most — extended zero-hit 65/122 → 0,
  pass@5 → 120/122, strict top-1 74/122 at this baseline.
- **Skills 26/31 → 18/23**: the 8 retired cases were all top-1 hits, so both numerator and
  denominator drop by 8 (26−8=18, 31−8=23); the miss set is unchanged.
- Gate verdict: `--gate` PASSES against the new baseline.

## Re-baseline (2026-07-03, todo 824): operation keywords (M3/M4)

Operations gained the low-weight `keywords` field, distilled from schema property names / enum
values plus (for stellarDocs) the page-title snapshot in `inventory/stellar-docs-titles.json`,
document-frequency-filtered so only op-distinguishing vocabulary survives. This is a catalog +
scoring change, so the gates are re-baselined in the same commit (`eval/gates.json`, current).

Run: `routing-2026-07-03T15-14-31-853Z.json` (grading rule v2, twin-aware).

| scope | rule | top-1 | top-3 | top-5 |
|---|---|---|---|---|
| legacy 338 (prior gate, todo 825) | v2 | 219 | 287 | 313 |
| legacy 338 (**new gate**) | **v2** | **222** | **288** | **318** |
| extended 122 (prior) | strict | 74 | — | 106 |
| extended 122 (**new**) | **strict** | **77** | — | **109** |
| skills lane 23 | v2 | 18 | — | — |

Reading notes:

- **Legacy +3/+1/+5, extended +3 top-1 / +3 top-5**: scout/lumenloop/docs ops now carry
  op-distinguishing keyword vocabulary, so they rank on questions where they previously lost slots.
  **Zero per-case hit→miss regressions** in any lane vs `routing-2026-07-03T14-37-46-628Z`
  (13 case-improvements). **Skills lane unchanged 18/23.**
- A naive variant **without** the DF filter measured NEGATIVE (extended top-1 74→71, skills top-5
  23→22) and was rejected — the DF filter (keep only op-distinguishing vocabulary) is what makes
  the field pay.
- Gate verdict: was the gate until the 2026-07-04 re-baseline below.

## Re-baseline (2026-07-04, todo 836): ADR-0003 build-time exposure filtering + grading rule v3

The manifest now contains ONLY exposed entries (299→274: the 14 `lumenloop.skill.*` twins, the 7
retired mirror skills, and the 4 denied operations are never emitted —
`research/decisions/0003-build-time-exposure-filtering.md`), and the grader moved to **rule v3
(`v3-manifest-exposed`)**: the v2 twin-identity layer is deleted, a hit's service label is exactly
its own, and cross-service tolerance is expressed only via `expected_any`.

Run: `routing-2026-07-04T15-46-49-007Z.json` (grading rule v3; current baseline).

| scope | rule | top-1 | top-3 | top-5 |
|---|---|---|---|---|
| legacy 338 (prior gate, todo 824) | v2 | 222 | 288 | 318 |
| legacy 338 (**new gate**) | **v3** | **203** | **265** | **303** |
| legacy 338 accept-either | v3 | 250 (74.0%) | 310 | 330 |
| skills lane 23 | v3 | 18 | — | — |

Reading notes:

- **This is a grading-severity change, not a ranking regression.** Of 37 changed cases, 35 have
  **byte-identical top hits** — lumenloop-expected cases whose top hit is a `skills.lumenloop.*`
  playbook are no longer credited to the lumenloop service (v2's twin-identity did that; the twins
  it keyed on no longer exist). That tolerance is the accept-either lane's job (74.0% top-1).
- The only 2 real ranking changes are both **improvements** (top-1 miss→hit): keyword
  document-frequency denominators shifted when the excluded ops left the per-service op sets.
- **Skills lane unchanged 18/23.** Extended lane strict top-1 77/122, top-5 108/122 (−1 top-5,
  same grading-severity mechanism).
- Gate verdict: was the gate for minutes — superseded the same day by the stellar-light 1.4.4
  re-baseline below.

## Re-baseline (2026-07-04, issue #2): stellar-light 1.4.4 drift

Same-day follow-up to the ADR-0003 re-baseline (commit `b62938a`): the daily live-drift CI caught
the upstream stellar-light OpenAPI 1.3.2 → 1.4.4 refresh — additive response-schema fields on
existing ops, upstream description rewords (`searchResearch` trimmed to "security incidents"
phrasing), docs-titles refresh. No operation added/removed, no exposure decisions.

Run: `routing-2026-07-04T15-58-31-434Z.json` (grading rule v3; **current baseline** in
`eval/gates.json`).

| scope | rule | top-1 | top-3 | top-5 |
|---|---|---|---|---|
| legacy 338 (prior gate, ADR-0003 above) | v3 | 203 | 265 | 303 |
| legacy 338 (**new gate**) | **v3** | **213** | **267** | **303** |
| skills lane 23 (floor unchanged) | v3 | 18 | — | — |

Reading notes:

- **+10/+2/0 is upstream description quality, not our scoring**: 14 scout improvements from the
  richer 1.4.4 descriptions vs 8 strict regressions, 7 of which hold under accept-either (grading
  severity, not ranking); only `q-edge-inject-ignore-instructions` truly drops (top3→top5).
- Agentic-verified **before** the re-baseline (30-case Sonnet low+med effort): overall primary low
  70→76.7%, med 73.3→80%; docs 100% unchanged. Full decision record in the `note` field of
  `eval/gates.json`.
- Gate verdict: this is the current gate — `--gate` enforces legacy within ±1% of 213/267/303 and
  the skills lane floor 18/23, under gradingRule `v3-manifest-exposed`.

## Round 5e (2026-07-06, todo 842): three ranking levers — all discarded

Rounds 5a–5d (commits `a284417`, `43297d7`) were contract/presentation work on `search` (tier
marker, filter validation, honest total/truncated, describe + signature stubs), proven
ranking-neutral (rankings byte-identical, gate unchanged) — no ranking section needed. 5e was the
round's ranking half: three wrapper-layer levers from the adversarial review (Solo scratchpad
528), each implemented and measured **separately** per EVALS.md discipline (vendored scorer
byte-identical throughout). **All three were discarded — no code shipped, gate baseline
unchanged.** The runs live in git-ignored `eval/results/`, so this section is the durable record;
don't re-attempt these levers blind.

Baseline for every comparison: the post-5d tree — legacy strict **213/268/305** (accept-either
265/314/333), extended strict **79/104/110** (accept-either 110/121/122), skills **18/22/22**;
gate PASS. Reproduced ranking-identically across all three lanes by runs `16-29-58`, `16-41-54`,
`16-42-57`, `16-50-32` (timestamps = `routing-2026-07-06T*` result files).

**Lever A — curated domain alias table** (build-time manifest data: tx/txn→transaction,
wallet/address→account, swap/amm/dex, 402/payment-required/x402, staking/rewards; target =
extended strict top-1, 79/122):

| iteration | legacy strict | ext strict | skills | gate | verdict |
|---|---|---|---|---|---|
| baseline (`16-29-58`) | 213/268/305 | 79/104/110 | 18/22/22 | PASS | reference |
| alias table (`16-33-32`) | 213/268/305 | 79/104/110 | 18/22/22 | PASS | flat everywhere — discarded |

The alias set changed rankings in only 10 cases and moved **zero** graded numbers in any lane —
not a regression, a null result. Conclusion: whatever value structural aliases have is **not
measurable on the offline routing instrument**; re-attempt only with a live/agentic instrument
that can grade result quality, and reuse the vetted alias candidates above rather than
re-deriving them.

**Lever B — short-token tightening** (no bidirectional prefix-overlap for query tokens under
3 chars unless alias-listed; evidence: "tx"/"ai"/"ap" false positives, scratchpad 528):

| iteration | legacy strict | ext strict | skills | gate | verdict |
|---|---|---|---|---|---|
| 1 — overlap gate only (`16-39-00`) | 214/270/306 | 79/104/110 | 18/22/22 | PASS | target flat — see note |
| 2 — drop short tokens in primary pass (`16-39-53`) | 214/262/306 | 68/104/108 | 15/23/23 | **FAIL** | hard regression |
| 3 — softened variant of 2 (`16-40-45`) | 214/271/305 | 74/101/107 | 18/22/22 | **FAIL** | still regressive |
| revert (`16-41-54`) | 213/268/305 | 79/104/110 | 18/22/22 | PASS | back to baseline |

Failure mechanism (iterations 2–3): dropping short tokens in the **primary** scoring pass changes
the effective query token count, crossing the vendor gate's ≤2-token 100%-coverage boundary —
the same failure shape as Round 2's discarded stopwords-everywhere iteration (extended top-1
−11, skills top-1 −3). Iteration 1 stayed inside the gate but never moved the lever's target
(extended lane flat); its legacy +1/+2/+1 sits inside the gate's ±1% noise band and is not
attributable to the intended mechanism, so the whole family was discarded rather than
re-baselining on noise.

**Lever C — diversity-quota score-ratio guard** (don't evict a same-service candidate scoring
far above the off-service hit it's traded for; evidence: "wallet" evicts a 124-score passkey
section for a 75-score `getClusters`, scratchpad 528 finding 4):

| iteration | legacy strict | ext strict | skills | gate | verdict |
|---|---|---|---|---|---|
| baseline (`16-42-57`) | 213/268/305 | 79/104/110 | 18/22/22 | PASS | reference |
| ratio 1.5 (`16-46-22` + `16-47-10`, identical rankings) | 213/267/305 | 79/104/110 | 18/22/22 | PASS | target flat, legacy top-3 −1 |
| ratio 1.25 (`16-47-43`) | 213/267/301 | 79/104/110 | 18/22/22 | PASS | legacy top-5 −4 |
| ratio 2.0 (`16-48-09`) | 213/267/305 | 79/104/110 | 18/22/22 | PASS | target flat, legacy top-3 −1 |
| revert (`16-50-32`) | 213/268/305 | 79/104/110 | 18/22/22 | PASS | back to baseline |

(The ratio-1.5 configuration was run twice — `16-46-22` and `16-47-10` produce byte-identical
rankings; both listed for measurement-log completeness.) Extended strict is **flat at every
ratio in [1.25, 2.0]** — the guard cannot move the lane it was aimed at, and every setting costs
legacy top-3 (−1) with the aggressive end also costing top-5 (−4): the high-scoring same-service
runs it protects are usually the *wrong* service for the graded question (e.g.
`q-comp-sep10-auth-role` keeps a 3rd scout hit and pushes the expected `stellarDocs.search_docs`
out of the top 3). The "wallet" eviction it was built for is real but is a result-*quality*
problem the offline grader doesn't score. Discarded.

**Round outcome:** tree reverted to post-5d state (closing run `16-50-32` reproduces the baseline
rankings exactly), `eval/gates.json` untouched — no gated number moved, so no re-baseline. Next
step for extended-lane strict (79/122): a live/agentic instrument (5f), not further offline
lexical levers.

## Round 5f (2026-07-06, todo 843): offline embeddings prototype — no mode shipped

Offline-only experiment (no `src/` change; harness + vectors in session scratchpad, not the
repo): 271 catalog entries + all 483 eval queries embedded with Workers AI
`@cf/baai/bge-base-en-v1.5` (768-dim), then four retrieval modes measured at limit 5 through
the REAL grader with a calibration gate (the harness's pure-lexical mode reproduces the
official 213/268/305 · 79/104/110 · 18/22/22 numbers exactly before any embedding number is
trusted). One global config per mode, no per-lane/per-case tuning. Independently verified by a
second agent, which found and corrected a harness bug (section entry `name` derivation used
last-`.` instead of `lastIdSegment`'s `#`-stripping — invalidated exact backfill/RRF figures,
conclusion-neutral) and hand-reproduced example queries.

| mode | legacy strict | extended strict | skills | verdict vs cut* |
|---|---|---|---|---|
| lexical (baseline) | 213/268/305 | 79/104/110 | 18/22/22 | reference |
| semantic-only | 130/205/232 | 36/59/73 | 18/23/23 | fails everywhere |
| lexical + semantic backfill (corrected) | −8 top-1 | 79→54 top-1 | ≥18 | fails |
| RRF k=60 (corrected) | −30 top-1 | −25 to −31 top-1 | 17 | fails |
| semantic rerank of lexical top-20 | 175/259/283 | 78/107/112 | 17/23/23 | fails (legacy −38 top-1, skills < floor) |

\* cut = extended strict up (top-1 or top-5), legacy strict within −3/metric, skills ≥ 18.

Findings that outlive the experiment:

- **The ungated lexical tier-2 backfill beats bge-base semantic backfill outright** (ext strict
  79 vs 54) on the gate-to-zero queries backfill exists for — the round-4 lever is doing real
  work, not just filling pages. (Current gate-to-zero count: 43/122 extended, not the stale
  58/122 in older comments.)
- Cosine over entry text systematically prefers **skill-section prose** over the docs-search
  operations rule v3 grades correct — the same structural imbalance lexical lever 2 (0.75 kind
  weight) suppresses; cosine has no equivalent damping, and adding one would be tuning.
- rerank20's 24 genuine wins prove semantic signal exists (e.g. `q-crp-become-an-anchor-licensing`
  → `search_anchor_sep_docs`), but it is churn (25 losses), not lift. The measurable ceiling is
  the known instrument saturation: extended accept-either top-5 is already 122/122.
- If ever revisited: bundle build-time entry vectors (~830 KB f32) + a Workers AI query
  embedding per search (20–100 ms p50 + availability dependency). Revisit only with a stronger
  embedding model or richer entry text, and ideally a live/agentic instrument (see round 5e's
  alias finding) — not more fusion math.

## Round 844 (2026-07-06, todo 844): real-user lane + alias lever shipped (lever 6)

The round-5e alias lever was blocked on an instrument, not on merit. This round built the
instrument: a **real-user routing lane** mined from the retired raven-golden-qa raw jutsu pool
(25,875 genuine user questions, 2025-11→2026-02 — months before round 5, so independence from
the lever is inherent).

**Lane construction** (local-only: `eval/local-lanes/jutsu-real-user/`, gitignored — derived
from the privacy-sensitive raw pool at `~/Desktop/raven-golden-qa/jutsu_stellar_questions_export/`;
regenerate with the scrub script recorded in the Solo round log): drop seed/email-bearing +
<2/>60-token + duplicate messages → 222 alias-register questions (contain tx/txn/txs/acct/addr;
the offline corpus has 10 total) + 250 random control. **Labels:** dual independent Fable passes
(labelers saw question + service charters only — never search results or the scorer), 96.6%
agreement, 16 adjudicated; distribution stellarDocs 337 / none 96 / scout 26 / skills 8 /
lumenloop 6. `none` (out-of-gateway-scope) cases are skipped at grading.

**Baseline vs lever (strict / accept-either, top-1·3·5 of graded cases):**

| group | pre-lever strict | post-lever strict | pre AE | post AE |
|---|---|---|---|---|
| alias (n=213) | 72·135·173 (33.8/63.4/81.2%) | **87·154·179 (40.8/72.3/84.0%)** | 82·142·178 | **97·159·184** |
| control (n=163) | 67·106·128 | 67·106·128 (byte-identical) | 85·122·139 | byte-identical |

The alias register routed **7.3 points worse** than control at strict top-1 pre-lever; the lever
closes that entire gap (+15/+19/+6 strict), while the control group and every offline lane are
byte-identical (legacy 213/268/305, extended 79/104/110, skills 18/22/22 — GATE PASS, no
re-baseline). Unlike the offline corpus (extended AE top-5 = 100%), this lane is unsaturated
(top-5 81–86%), so it becomes the target metric for future retrieval work alongside the legacy
non-regression gate.

**Shipped:** `QUERY_TOKEN_ALIASES` + `canonicalizeQuery` + max-of-two-queries scoring
(scoring.ts lever 6) — the exact round-5e design (same 5 vetted pairs; amm/dex/defi/nft/etc.
remain excluded as load-bearing catalog vocabulary). Unit tests pin the no-op path, token-only
substitution, and the register bridge.

### Real-user-lane re-measurement of the discarded 5e levers (2026-07-06, todo 845 follow-on)

With the round-844 lane available (unsaturated, real phrasing), levers B and C were re-measured
exactly as designed in round 5e, on top of the shipped lever 6. Both discarded AGAIN, now on
lane evidence rather than instrument blindness:

- **Lever B (short-token damping, rescue-only):** legacy +1/+2/+1 (214/270/306) and lane alias
  top-1 +2 (clean, 0 lost), but lane alias top-3 net −3 (won 1 / lost 4). The four losses are
  all the **error-paste register** (users pasting `tx_bad_seq`/`tx_too_late` result-code JSON +
  XDR blobs, expecting docs): dropping short junk tokens (`v`, `9` from base64) shrinks the
  rescue coverage denominator for EVERY entry, letting weakly-matching scout/lumenloop entries
  through the gate to crowd out the docs ops. Structural side effect, systematic register —
  discarded.
- **Lever C (diversity quota score-ratio guard, 1.5):** strictly worse on the lane — alias
  strict top-5 −2, control strict top-3 −1 / top-5 −2, accept-either top-5 −3/−4, nothing up.
  Consistent with the 5e offline read (legacy top-3 −1 at every ratio). Discarded; the hard
  quota stays.

Lane numbers to beat (post-lever-6 baseline): alias strict 87/154/179, AE 97/159/184 (n=213);
control strict 67/106/128, AE 85/122/139 (n=163).

## Round 806 (2026-07-06, todo 806): codemode.skill.run A/B — ship decision

The `codemode.skill.run` ship gate from `research/skill-run-design.md` §10, run exactly as
designed: instruments first (commit `eb412bd` — ranked-id dump, whole execute results,
composition analyzer, plan-grader recognition, the two opt-in live-digest supplement cases),
BEFORE lanes on that instrumented main, feature commit `f99be10`, AFTER lanes same day, same judge, same
rubric (v2.1). QA result stamps live in `eval/qa/results/`, routing runs in `eval/results/`
(both git-ignored/local-only, so this section is the durable record).

**Routing neutrality (gate part 1, both halves green):** the per-case ranked-id dump on the
feature build diffs **EMPTY** against the settled-main baseline
(`eval/results/ranked-baseline-806.json`) — rank/membership identity proven directly, the true
invariant (runnable-skill hits gain `signature` by design, so byte identity was never the
claim). `eval:routing -- --gate` **PASS** against the unchanged 2026-07-04 baseline
(`routing-2026-07-07T00-34-41-282Z.json`), no re-baseline.

**QA verdicts (gate parts 2–4):**

| lane | BEFORE | AFTER |
|---|---|---|
| targeted `--ids` battery (6 cases: 5 dossier-shaped incl. the fabrication trap + 1 digest-shaped) | 4 correct / 1 partial / 1 wrong (`2026-07-06T20-41-52-variantA`) | **6 / 0 / 0** (`2026-07-07T00-38-53-variantA`) |
| canonical + digest supplement (12 cases = membership-frozen 10 + opt-in 2, historically run from one then-combined file; not a canonical-lane denominator) | 11 / 0 / 1 (`2026-07-06T20-51-40-variantA`) | 11 / 0 / 1 (`2026-07-07T00-47-30-variantA`) — the **same pre-existing wrong** (`q-live-hackathon-recent-winners`), unrelated to the feature |

**Composition** (`analyze-composition.mjs`, ids battery): mean turns 4.83 → 4.5, execute
scripts 8 → 7, constituent op calls 24 → 21 (skill.run calls expanded through declared ops for
comparability), truncated-input cases 1 → 0. Canonical + digest supplement: mean turns 5.83 → 5.0, op calls
60 → 53, execution failures 2 → 0 — but execute scripts went **up** 22 → 25, so read the
combined-lane composition delta as mixed, not a win.

**Adoption, per runner — the honest split:**

- **Digest: 2 of 3 digest-shaped cases adopted** `codemode.skill.run`, both single-script,
  both correct: `q-edge-fresh-most-recent-news` (ids battery) and `q-live-digest-rwa-recent`
  (digest supplement). The third (`q-live-digest-blend-coverage`, also supplement) answered
  correctly without it.
- **Dossier: 0 of 5 dossier-shaped cases adopted.** All 5 were answered correctly via manual
  op composition in the AFTER run — which means the ids-battery verdict flips
  (`q-defi-phoenix-scf` wrong→correct, `q-scf-history-soroswap` partial→correct; both were
  fabricated per-round SCF breakdowns in the BEFORE) are **NOT attributable to the feature**.
  Stated plainly: the 6/0/0 headline satisfies the non-regression + improvement gate, but the
  improvement rides on run-to-run agent/judge behavior on the fabrication traps, not on
  dossier-runner usage.

**Verdict (design §10.5 ship rule): SHIP-APPROVED.** Ranked-id diff empty AND gate green AND
verdict non-regression AND a real composition delta on the targeted battery (fewer scripts,
fewer op calls, fewer turns) — with adoption demonstrated for one of the two runners. The
**per-runner adoption gap is the named follow-up**: dossier-runner surfacing (description /
signature prominence for dossier-shaped questions) needs its own round; §10.4's zero-adoption
do-not-ship rule was cleared by digest adoption, not blanket adoption. Deploy was held at
decision time for an unrelated merge-train window — ship approval and deploy timing are
separate facts.

### Round 806 postscript (2026-07-07, todo 849): dossier runner retired, digest confirmed

The adoption follow-up resolved by measurement (full trail in todo 849 + the design doc §10
postscript): three surfacing levers all failed the no-regression bar, the dossier runner was
retired (962a71c, retrieval-neutral by ranked-id proof), and a third 6-case battery run
(`2026-07-07T02-28-31-variantA`) confirmed the digest runner's adoption reproduces (1/6 = the
digest-shaped case, single-script, both keyFacts) while no transcript ever touched the dossier.
That run's headline 4C/1P/1W calibrates to ~5–6C: the wrong is a live-proven judge artifact —
every "fabricated" award label and the "invented" fourth submission are verbatim
`get_scf_submissions` rows (todo 853; transcript-blindness class) — and the partial dinged the
adopting case only for a missing honesty-caveat phrase with both keyFacts satisfied.

## Discovery-redesign round (2026-07-09, todos 892–894; issues #9/#10): P1 shipped, P2 measured-and-reverted

Full record: `research/discovery-redesign.md` (plan+evidence), `research/p1-guidance-spec.md`,
`research/p2-lanes-spec.md`, `research/p2-outcome-addendum.md`. Merged to main at f711603.

- **New instrument:** `eval/discovery/` — live-HTTP Phase-0 lane over the real MCP server,
  43 adjudicated cases (opus ground-truth review re-seeded the lumenloop pool from real
  agentic drift rows; 3 cases folded from PR #17). Post-fold baseline: familyHit@3 32/43
  (74.4%), usableOp@5 25/43 (58.1%). Known scope limit: naive-verbatim queries
  under-represent the mixed register real agents use (see below).
- **Routing closeout:** the two latest stored runs,
  `routing-2026-07-09T21-32-59-931Z.json` and
  `routing-2026-07-09T21-38-32-482Z.json`, reproduce the same current counts: legacy strict
  213/267/305 of 338, skills 18/22/22 of 23, extended strict **79/104/110** of 122,
  extended accept-either 110/121/122; gate PASS. Earlier 120/122 and 77/122 extended figures
  are historical milestones, not the current strict result.
- **P1 (shipped):** multi-query source-family guidance + generated micro-map
  (`scripts/catalog-data/workflow-archetypes.mjs` → `src/mcp/micro-map.ts`). Gated on live
  distributions, 3 agentic runs/arm: docs 100% all cells, scout medium 90×3, lumenloop at
  baseline 37.5×3, QA 23/6/1 best-of-three. One mechanism-attributed regression
  (docs-verify nudge over-routing ecosystem-data questions) was found by dual review and
  fixed (52cdb23) before ship.
- **Method finding:** single agentic runs cannot gate ±2-case family movements — lumenloop
  medium sampled 75/50/50 on one build arm. All future lane A/Bs: ≥3 runs/arm + per-case
  family matrices, not aggregate rates.
- **P2 (measured, then reverted):** `kind:"service"`/`kind:"workflow"` cards built with
  full guards; routing stayed byte-identical; but live probes + mining of 160 real agent
  queries showed 66% mixed-register traffic and card interception ≤6.9% upper bound — the
  three-arm A/B was skipped as provably null and the card code reverted (keep-nothing-unused).
  Net: **entity→family capture is beyond lexical reach** (prose ceiling + card ceiling +
  op-layer evidence). Successor: the greenlit Vectorize frontier-embedding spike
  (`ideas/architecture-explorations.md` item 2) — round 5f above tested only offline
  bge-base, never Vectorize with a frontier model.

## Vectorize frontier round (2026-07-10, todo 902): pinned harness landed, retrieval mode not shipped

Full design, stamps, matrices, and decision: `eval/vectorize/README.md`. The round landed the
previously missing discovery prerequisites (≤3-search agent arm, 91-query replay lane, paired
miss classification) and a local Qwen3-Embedding-0.6B reference harness pinned by model commit,
runtime version, card hashes, and committed vectors. Pure lexical calibration reproduced
213/267/305 legacy, 18/22/22 skills, and 79/104/110 extended exactly.

The fixed semantic rerank failed the composite ship gate: mined LumenLoop replay family top-1
moved 22.0→13.2%, while top-5 improved 40.7→46.2% and cleared its target lift; legacy still
fell to 95/218/279 and extended accept-either top-5 fell 122→114. Three medium agent runs per
arm moved LumenLoop primary from 2/8×3 to 3/8, 5/8,
3/8, but docs primary was only 11/12, 12/12, 11/12 and scout primary 8/10, 9/10, 8/10 in
the vector arm. Per-case review found Aquarius wins offset by Blend/Comet churn and broad
docs/scout ranking cannibalization. **Measured no-ship:** no production scorer, binding, index,
runtime inference, deploy, or re-baseline. No upstream service defect surfaced, so
`improvements/` is unchanged.

## Per-operation architecture A/B (2026-07-10, todo 903): null / no ship

The manifest-derived 50-operation plain MCP harness was measured against shipped search+execute on
the fixed QA-30 and canonical live-10 lanes. Reviewed results were QA **20C/9P/1W vs
17C/12P/1W**, live **9C/1P vs 10C**. Metrics were mixed: direct was cheaper and used fewer cache
tokens, but regressed QA turns, calls, plan coverage, and truncation count. Claude deferred-tool /
ToolSearch behavior means serialized tool definitions are advertised wire surface, not necessarily
consumed context. The direct arm also omitted skills and artifact retrieval, and the experiment had
only one run per cell with order reversed across lanes rather than within each lane. No production
surface, routing, golden, or baseline changed. Full identities, usage counters, row review, live
rechecks, and limitations are in
[`eval/qa/reviewed/2026-07-10-per-operation-architecture-ab.md`](./qa/reviewed/2026-07-10-per-operation-architecture-ab.md).

## Re-baseline (2026-07-11, issue #19): Scout 1.7.15 + Docs monitoring titles

The daily drift refresh moved Scout OpenAPI/status 1.7.11 → 1.7.15 and Stellar Docs titles
632 → 635. The actual path/method and operationId sets are unchanged. Four Scout operation
descriptions changed (`analyzeEcosystem`, `getBuilders`, `getLeaderboard`, `searchProjects`),
seven operation schemas gained provenance/scope fields, and three monitoring-page titles were
added. No exposure or runnable-skill runner decision was required.

Immediate pre-drift `main` versus the regenerated catalog:

| lane | before | after | reading |
|---|---:|---:|---|
| legacy strict top-1/3/5 | 213/267/305 | **213/271/304** | top-1 flat, top-3 +4, top-5 −1 |
| legacy accept-either | 263/314/333 | **268/317/333** | +5/+3/0 |
| skills strict | 18/22/22 | **18/22/22** | unchanged |
| extended strict | 79/104/110 | **71/101/107** | diagnostic regression; not called a win |
| extended accept-either | 110/121/122 | **111/120/122** | family availability largely holds |

The legacy movement is accepted as intended routing enrichment from the new structured project
filters, builder match provenance, and TVL wording. A targeted seven-case Sonnet 5 check at low
and medium effort kept the appropriate Docs/Lumenloop family as a primary or alternate on the
affected boundaries; the primary shifts were the already-documented structured-directory versus
editorial/freshness label ambiguity. Nothing was tuned per question. The extended-lane
`searchProjects` spillover remains an own-repo follow-up (Solo todo 940) for a general,
query-independent mitigation; it is explicitly recorded rather than laundered through the new
baseline. Decision record: `solo://proj/49/scratchpad/issue-19-drift-resol--591`. Baseline result:
`routing-2026-07-11T18-53-06-914Z.json`.

## Re-baseline + lever 7 (2026-07-12, issue #21): Scout 1.7.16 x-routing absorb

Upstream shipped the sls-051 structural fix: all 17 non-meta Scout operation descriptions
rewritten as terse ≤600-char purpose statements (verified live at ingest: 0 over 600), with the
routing vocabulary — synonym chains, region/product terms, question exemplars — MOVED to a
machine-readable `x-routing` extension `{purpose, keywords, useWhen, notFor, exampleQuestions}`.
Path/method and operationId sets are byte-identical; no schema changes; no exposure or runner
decision. Upstream's documented consumer convention: score `x-routing` as separately-weighted
fields, never concatenated into the description.

A bare absorb collapsed routing — legacy strict 213/271/304 → 185/241/285, with all 50 top-1
losses on scout-expected cases and 22 gains that are exactly the docs/lumenloop capture-relief
sls-051 asked for. The absorb therefore ships with **scoring lever 7** (`routingKeywords`:
operation entries carry the x-routing vocabulary as its own field, scored as an independent
augmented pass; `notFor` is excluded as cross-op vocabulary). Swept on the routing eval:

| config (legacy strict top-1/3/5) | result |
|---|---:|
| merged into lever-4 keywords @0.4 | 185/244/287 |
| lever 7 @0.8, DF-filtered, cap 64 | 191/250/295 |
| lever 7 @1.0, DF-filtered, cap 64 | 194/255/298 |
| lever 7 @1.0, no DF, cap 64 | 197/260/297 |
| lever 7 @0.9, no DF, cap 128 | 201/263/— |
| **lever 7 @1.0, no DF, cap 128 (shipped)** | **205/272/305** |

The DF filter and default cap were dropped/raised for this field because upstream already
curates the vocabulary per-op (the filter was double-applying a noise control) and the 64 cap
bound exactly on the three broad search ops. Final: top-3/top-5 in-band (+1/+1), top-1 −8.

## Skills-form A/B (2026-07-13, todo 890): sections leave search — SHIPPED

The full program record (R1 evidence / R2 pre-registered design / R3 form-factor + prior art,
P2 synthesis, offline screen, grok-4.5 pre-spend adversarial review + reconciliation, paid
round, P4 decision) lives in Solo scratchpad `skills-program-how-r--608`. Summary: four
manifest arms differing only in the skills search representation (A current, B sections
`searchable:false`, C all skills out of search, D section vocabulary distilled onto parents),
built by `scripts/build-catalog.mjs --skills-form`, served sequentially through the Solo dev
process under a SHA-verified swap/restart/probe procedure after the pre-spend review proved
disk hash ≠ served catalog without it.

Offline screen: D eliminated (recapture hazard confirmed: parent keyword bags at full kind
weight, interloper top-1 59 vs B's 56); C banked (+30/−1 legacy but kills the skills lane by
design); **B advanced** (legacy strict 205/272/305 → 209/285/316, skills lane at floor 18/23,
extended/overlay improved, capture 68→56 top-1 / 278→214 top-5, deterministic discovery
one-shot + replay improved). Paid round, counterbalanced 3× paired blocks: QA-30 **A
39C/42P/9W vs B 41C/42P/7W** over 90 gradings/arm; stable per-case wins 3–1 for B; skills
stratum flat (OpenZeppelin correct 6/6 — whole-skill discovery carries the load-bearing case);
carried live-v2 ten: B zero wrongs across 3 runs; agent discovery: B ≥ A on every overall
metric in every run. No pre-registered blocker fired; ledger ~738 top-level jobs under the
850/$228 ceiling.

**Shipped**: `buildSkills` stamps every skill-section entry `searchable:false` (exposed for
`skill.read`/`availableSections`/future arms; out of search scoring, results, and totals).
Whole-skill entries, the runnable digest, the bundle, and all scoring constants unchanged.
Gate re-baselined to `routing-2026-07-13T08-54-21-839Z.json` (209/285/316; skills floor 18 —
q-skill-eco-scout-rwa-landscape moved top-1→top-3). Arm C remains a possible future round from
this baseline; arm A stays buildable for replication.

The honest decomposition — corrected by the grok-4.5 adversarial review (scratchpad 606),
which caught an arithmetic error in the first draft of this record: of the 50 scout losses,
lever 7 recovers **20** (not 42), leaving **30** residual; all 22 capture-relief gains hold
(−50 + 20 + 22 = −8). The full cost is stated, not laundered: legacy scout-scope top-1 falls
67 → 37, printed accept-either top-1 268 → 236, card@5 100 → 89. Extended strict improves
71/101/107 → **85/102/109**, but by composition shift — docs 49 → 81 while scout collapses
22 → 4 — and skills moves 18 → **19**/23/23. The 30 residual cases routed on prose upstream
deliberately deleted, and their distinctive vocabulary does not appear in `x-routing` either,
so no blend setting recovers them (sweep above); several route to plausible alternates
(lumenloop SCF ops on SCF questions, skills on how-to). Accepted as the honest new floor with
the upstream curation gap filed as sls-052, the successor finding to sls-051. Decision record:
`solo://proj/49/scratchpad/drift-issue-21-scout--605`. Baseline result:
`routing-2026-07-12T21-12-46-662Z.json`.

## Drift absorb (2026-07-13, issue #22): Scout 1.7.18 + routing cap repair

Scout 1.7.18 kept the path/method and operation-description sets stable, added
nullable project rename-continuity data, and expanded `x-routing` for builders,
leaderboard repo health, and SDF organizational research. The expansion exposed
a consumer-side flaw: `searchResearch` grew to 149 curated tokens, while lever 7
kept only 128 by frequency. Repeated new org vocabulary evicted existing
security/SCF terms, moving legacy strict routing from the 209/285/316 baseline to
207/283/314 and dropping two expected Scout cards from the top five even though
the aggregate band still passed.

The general repair raises only the bounded curated-routing ceiling from 128 to
256; blend weight, document-frequency behavior, operation descriptions, and the
gate baseline stay unchanged. This retains the complete current 149-token set
and measures **211/287/316** legacy strict, **86/102/110** extended strict, and
**18/23/23** skills strict. The two lost cards return, the YieldBlox incident
case moves `searchResearch` rank 3→1, and no baseline edit is needed. New broad
builder vocabulary adds `getBuilders` at ranks 3–5 on five smart-contract/docs
queries, but it does not displace their expected family; the exact builder
queries improve. Owned QA surface annotations for the Rust/Soroban and LatAm
builder-directory cases now name `scout.getBuilders`. Review evidence and the
upstream finding reconciliation (`sls-050`, `sls-052`, new `sls-054`) live in
`solo://proj/49/scratchpad/issue-22-drift-revie--623`.

## Re-baseline (2026-07-26, issue #28): Scout 1.8.28 + ecosystem skills

Scout 1.8.28 added four public, keyless, read-only collection operations:
`searchHackathonBuilds`, `getPeople`, `listAudits`, and `getStablecoins`. It also
changed existing operation summaries and curated `x-routing`; the mirrored
OpenZeppelin, stellar-dev, and stellar-light skills moved in the same drift
window. Raven exposes all four collections under ADR-0003 and keeps the four
existing feedback/partner write surfaces excluded.

The prior committed legacy baseline was 209/285/316 (2026-07-13), which main's
catalog no longer matched; measured pristine-main pre-change was 210/282/318,
so this drift's actual legacy-strict effect is **210/282/318 → 210/282/317**
(one top-5 loss). The skills lane moved from 18 to **17** top-1 while retaining
23/23 top-3, top-5, and card@5: the mixed
`q-skill-builder-quickstart-remittance` question now ranks Scout
project/prior-art lookup first and the intended builder-quickstart skill second.
Because the query explicitly asks which prior art exists, this is an intended
routing improvement, not a skill disappearance; weakening the accurate Scout
route solely to preserve the old strict winner was rejected.
The authoritative baseline and full rationale are in `eval/gates.json`, with
result `routing-2026-07-26T23-51-48-789Z.json`.

## Re-baseline (2026-08-18, issue #26): Scout 1.8.67 composite operations

Scout 1.8.67 added four public, keyless, read-only operations:
`listContracts`, `getRepoTrust`, `scfPitch`, and `vetIdea`. Raven exposes all
four operations under ADR-0003. The generic Scout adapter handles them, and no
runnable-skill runner uses them.

A pristine-main control under the current scorer measured legacy
207/280/314, skills 17/23/23, and holdout 12/25/27. The regenerated manifest
measures legacy **208/280/313**, skills **16/23/23**, and holdout
**11/24/27**. Forbidden holdout captures remain 11, and passed holdout cases
remain 23.

Controlled ablations isolate the declines. Removing only `scfPitch` restores
the skills and holdout top-1 floors. Removing only `listContracts` restores
the holdout top-3 floor. Removing all four new operations passes the prior
gate. This proves that the scorer and the existing catalog changes did not
cause the movement.

The two operations are relevant results for the displaced questions.
`scfPitch` directly handles current SCF funding and pitch questions.
`listContracts` is relevant to contract inventory and audit questions. The
new floors accept this tradeoff without a scorer change, corpus edit, or
per-question tuning. The decision record is Solo scratchpad 814. The baseline
result is `routing-2026-08-18T14-10-11-708Z.json`.

## Re-baseline (2026-08-19): golden QA overfitting review

Four independent reviewers found no runtime golden-answer map or query-specific
regex. They found benchmark-aware comments and model-facing wording. The repair
keeps case evidence in eval records and uses general product language in the
catalog.

The same-scorer control measures legacy **208/281/313**, with card@5 at
**94/182**. The reviewed change measures **208/280/312**, with card@5 at
**94/182**. The skills lane stays at **16/23/23**. The frozen holdout measures
**10/22/25**, with 11 forbidden captures. The extended lane measures
**89/109/117**.

Commit `2396700` had already removed service-only cards from card@5. It changes
the evidence denominator from 338 to 182 independently of this wording change.

The re-baseline accepts the measured movements. The change removes case-shaped
wording instead of adding a question rule. It does not change the routing
corpus. The decision record is Solo scratchpad 832.

Scout 1.8.73 then removed three rejected hackathon-build parameters. It corrected
the RFP semantics and most round-schema fields. It also expanded the stablecoin
schema. The new Scout skill prefers the read-only Hackathon Build Brief.
Raven adopts the pin. A manifest-derived filter removes structural blocks for
excluded Scout paths from every selected file.

The prior exposure rule hid that endpoint only because it moved eval totals.
Raven now exposes `scout.hackathonBrief`. The scorer consumes its upstream
`x-routing` fields through the existing weighting system. This release accepts
the raw routing result without a new query rule or composite-specific weight.
The evidence trace is `routing-2026-08-19T20-26-07-408Z.json`.

## Re-baseline (2026-08-25, issue #35): Scout 1.8.87 and resolver exclusion

Scout 1.8.87 has 34 paths and 35 operations. It adds the read-only
`GET /api/projects/resolve` operation. Raven withholds that operation because
OpenAPI leaves its `subject`, `current`, and `evidence` objects opaque and omits
the live `meta` envelope. Resolved ledger entry `sls-075` tracks the upstream contract gap.

The refresh changes routing text for `scout.getPartners` and
`scout.searchProjects`. The Stellar Docs title vocabulary grows from 636 to
646 titles. The stellar-light skill pin advances to `540c4c3f19e9`; Raven
filters the non-exposed resolver reference from served prompt input.

The strict legacy totals move from **208/280/312** to **209/279/312**, within
the existing 1% band. Card@5 remains **94/182**. Skills remain **16/23/23**.
The frozen holdout remains **10/22/25**, with 11 forbidden captures. No scorer
lever, routing corpus, per-question rule, floor, or band changes. The runner
operation set does not intersect the upstream operation changes.

Independent Herdr review checked exposure, generated artifacts, routing,
runner impact, documentation, and the complete skill-body diff.

## Re-baseline (2026-08-27, issue #67): Scout 1.8.110 exposure review

Scout 1.8.110 has 36 paths and 37 operations. It includes the read-only
`GET /api/quality` and `GET /api/verify` operations. It also fully types the
historical project resolver and adds Oracle vocabulary to `searchProjects`.
The Stellar Docs title vocabulary grows from 646 to 649 titles.

Raven exposes `scout.resolveProject` because its identity, status evidence,
and provenance fields now match the live response. Resolved ledger entry `sls-075` records
the upstream fix. Raven withholds `scout.verifyClaim` because its live
`claim.type: "issued"` response is absent from the published response enum.
Finding `sls-077` records that contract gap.

Raven also withholds `scout.getQualityReport`. An A/B run showed that its broad
routing vocabulary entered 56 of 338 legacy top-five results and 26 of 122
extended top-five results. It ranked first for unrelated protocol and research
questions. Excluding it improved extended strict routing from **88/109/116** to
**90/109/117**. Finding `sls-078` records the upstream routing boundary.

Against the prior baseline, legacy strict routing moves from **209/279/311** to
**208/279/311**. The one strict change is `q-defi-reflector-resolve`.
`scout.resolveProject` reaches rank one, while the strict corpus label remains
Lumenloop and `expected_any` includes Scout. This is an accepted labeling
trade, not a strict routing win. Card@5 remains **95/182**. Extended strict
improves from **89/109/117** to
**90/109/117** because the Oracle routing moves
`q-defi-oracles-chainlink-band` to `scout.searchProjects` at rank one.

Skills remain **16/23/23**. The frozen holdout remains **10/22/25**, with 11
forbidden captures. No scorer, routing corpus, floor, band, or runner operation
changed. The final passing evidence trace is
`routing-2026-08-28T02-49-08-451Z.json`.

## Protocol-history frozen measurement (2026-08-30)

This round adds a frozen diagnostic with eight positive cases and four direct controls.
It measures whether `scout.searchResearch` surfaces for protocol-history and incident questions.
Positive cases require a top-five hit. Controls forbid any top-five research capture.

An independent review supplied a second frozen set before the replacement product design.
It has 11 blind paraphrases and nine hostile controls. Run both sets with
`npm run eval:protocol-history`. The original 12 cases remain in `run-routing.mjs`.
This keeps its ranked dump at exactly 495 cases.

The untouched scorer passes all existing routing gates. The original diagnostic starts at
3/4/4 for top-1/top-3/top-5. One of four controls captures research at rank five.
The blind set starts at 3/11 top-five, with six hostile control captures.

The first product attempt is not part of this measurement commit. Independent review found
copied vocabulary, broad false captures, and a gated-tier inversion. The round ledger records
that rejected attempt and each finding.

Three manifest-driven tiering replacements were also rejected. The closest candidate kept all
routing gates and surfaced the named case at rank five. It increased blind hostile captures from
6/9 to 8/9 and changed 15 of 495 rankings. The branch therefore ships measurement only.

The reviewed clause-fit follow-up lives under `eval/vectorize/`.
Its 2026-08-31 local-only finish completed and measured `FAIL` under both frozen contracts.
The experiment changed no production search code. See `eval/vectorize/README.md` for the pins.

The reviewed cross-encoder attempt two also completed on 2026-08-31 and measured a verified
`FAIL`: every registered grid kept both frozen contracts at the lexical baseline while failing
the routing gate. The experiment changed no production search code. Attempt three is spent.
See `eval/vectorize/README.md` for the pins and tables.

The reviewed cache-only attempt three, `clause-support-fit-v1`, completed on 2026-09-01.
It measured a verified `FAIL`. Multi-clause aggregation raised blind top-five recall to 10/11.
It also raised blind control captures to 7/9 and failed the routing gate.
The experiment changed no production search code. The three-attempt box is spent.
See `eval/vectorize/README.md` for the pins and table.
