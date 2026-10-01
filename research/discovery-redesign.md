# Discovery redesign — assessment of issues #9–#13 and the measured plan

**Status:** reconciled 2026-07-09 — Phase 0 + Phase 1 shipped; Phase 2 was built, measured
below the noise floor, and fully reverted. Outcome records:
[`p1-guidance-spec.md`](./p1-guidance-spec.md),
[`p2-lanes-spec.md`](./p2-lanes-spec.md),
[`p2-outcome-addendum.md`](./p2-outcome-addendum.md), and the discovery-redesign round in
[`eval/README.md`](../eval/README.md).
**Scope:** github.com/kalepail/stellar-raven issues #9 (problem statement), #10 (capability
atlas), #11 (Vectorize routing cards), #12 (unified discovery surface), #13 (subtool
taxonomy) — the "matching Questions → services/tools" redesign thread.
**Method:** orchestrating agent's own evidence audit (routing/QA/agentic results, code,
ADRs, `ideas/architecture-explorations.md`) plus three independent adversarial Codex
reviewers spawned via Solo, each attacking one slice with read-only repo access. The full
reviews are vendored at
[`research/audits/discovery-redesign-reviews-2026-07-09/`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/research/audits/discovery-redesign-reviews-2026-07-09/README.md).
All four assessments converged; nothing below rests on a single reviewer's claim.

## 1. TL;DR

The issues diagnose a real *shape* of risk (vague/status questions need source-family
reasoning, not one magic keyword) but overstate the current failure and prescribe surfaces
before measurements. The repo's own evidence says:

- **Retrieval is not collapsing on vague questions.** Extended lane (122 real-user-phrasing
  cases): zero-hit 0, strict top-5 110/122, accept-either top-5 122/122 (saturated). The 12
  strict top-5 misses all have an acceptable service in top-5 — label/authority boundary
  disagreements, not blank pages.
- **Agents already multi-search.** Latest 30-case QA run: mean 2.27 searches + 2.90 executes
  per case, 20/30 cases multi-search, 0 zero-search — and non-correct cases search exactly as
  much as correct ones. Issue #9's "one phrase → hope" flow is not the observed behavior; the
  weak link is the *guidance text* ("2–6 word intent phrase"), not the agents' willingness to
  fan out.
- **QA headline losses are mostly not discovery losses.** The 9 non-correct cases in the
  latest 30-case run fail on content depth and upstream data (canonical CLI flags absent from
  the Algolia index [sd-006], stale `scfRound` metadata [sls-014], missing rename history) —
  atlas/semantic layers cannot fix these; `improvements/` filings can.
- **Embeddings already lost here.** Round 5f (eval/README.md) embedded all 271 entries + 483
  queries with bge-base and measured four modes against the real grader: every semantic/hybrid
  mode failed the cut; the ungated lexical backfill beat semantic backfill outright (ext
  strict 79 vs 54). Issue #11 was written as if this experiment hadn't happened.
- **The one measured routing weak spot is lumenloop/source-family capture** (agentic lane
  primary-hit 37.5% on lumenloop vs 100% on stellarDocs, largely the sls-015
  `searchProjects` editorial-capture boundary) — which IS a source-family orientation
  problem, and is the honest kernel of the atlas idea.

**Recommendation:** keep exactly two top-level tools (`search` + `execute`), keep the name
`search`. Build the atlas idea in its *cheap, deterministic, measurable* form — a guidance
rewrite plus a generated orientation layer (SERVER_INSTRUCTIONS micro-map and/or
`kind:"service"`/`kind:"workflow"` catalog lanes through existing `search`) — refereed by a
new discovery-only eval instrument and the existing gates. Vectorize/semantic is
**trigger-gated backlog**, not part of this build. No new top-level tool ships without
beating the zero-new-tool arms in a three-arm A/B.

## 2. Evidence base (verified 2026-07-09, working tree at 8f803d1)

| Fact | Value | Source |
|---|---|---|
| Catalog size | 272 entries: 50 operations (lumenloop 18, scout 20, stellarDocs 12), 18 skills, 204 skill-sections | `catalog/manifest.json` (measured) |
| Routing gate | PASS: legacy 213/267/305 of 338; skills 18/23 | `eval/run-routing.mjs` run 2026-07-09 (`routing-2026-07-09T12-08-18-789Z.json`), `eval/gates.json` |
| Extended lane (real-user phrasing) | strict 79/104/110 of 122 (64.8/85.2/90.2%); accept-either 110/121/122; **zero-hit 0** | same run |
| Extended strict top-5 misses | 12 cases, every one with an acceptable service in top-5 | semantic-skeptic review §1, per-case ids |
| QA headline (latest full sample) | 21 correct / 7 partial / 2 wrong of 30 (weighted 81.7%) | `eval/qa/results/2026-07-07T19-58-35-variantA-rejudge-v2.4-p3-pass3.json` |
| QA agent search behavior | mean 2.27 searches, 2.90 executes/case; 20/30 multi-search; non-correct cases avg 2.22 searches | same file (measured from transcripts) |
| QA failure modes | content depth / upstream data gaps (sd-006 code blocks stripped, sls-014 stale scfRound, CLI rename history), not routing | same file, judge missingFacts; `improvements/` |
| Agentic routing | overall primary 76.7% (low) / 80% (med); stellarDocs 100%, scout 80–90%, **lumenloop 37.5%** | `eval/agentic/results/agentic-2026-07-04-drift.json` |
| Embeddings prototype | round 5f: semantic-only, semantic backfill, RRF k=60, rerank-top-20 ALL failed the cut; lexical tier-2 backfill beat semantic backfill 79 vs 54 ext strict; rerank20 = 24 wins / 25 losses (churn) | `eval/README.md` round 5f; commit c763ca2 |
| Real-user alias lane | round 844: curated alias lever +15/+19/+6 strict on the 213-case alias register, control byte-identical — the template for measured deterministic recall levers | `eval/README.md` round 844 |
| Prior front-door A/B | ADR-0001: heavier code-shaped search front door lost the golden Q→A A/B (9 max-turn failures); revisit notes already name op-cards, workflow hits, and a discovery-only eval | `research/decisions/0001-search-tool-shape.md` |
| Ranked backlog overlap | `ideas/architecture-explorations.md` items 1 (per-op null hypothesis), 2 (embedding A/B, determinism-preserving), 3 (MCP 2026-07-28 spec removes `initialize` — where SERVER_INSTRUCTIONS rides), 4 (op-card search re-test), 5 (discovery-only eval) | committed 29d85ff |
| Atlas token math | 50 op descriptions alone ≈ 46.1KB ≈ 11.5k tokens at the repo's 4-chars/token rule — the issues' "≤6k token atlas with per-op cards" requires a NEW editorial compression layer, not generation from existing descriptions | atlas-critic review §3 (measured) |

## 3. Issue-by-issue verdicts

### #9 — "Rethinking search-first discovery for vague user questions"

**Verdict: accept the guidance fix; reject the implied retrieval-failure premise.**
The one concretely wrong artifact is `SEARCH_DESCRIPTION`'s "short intent phrase (2-6
words)" step (`src/mcp/tools.ts:164`), which teaches exactly the compression #9 warns
about. The suggested replacement mental model (hypotheses → source categories → multiple
capability searches → execute fan-out → synthesize) is sound and cheap: it is a prose
change to `SEARCH_DESCRIPTION`/`SERVER_INSTRUCTIONS`/`nextSteps`, not a surface change.
But the premise that this brittleness is currently causing measurable failures is
unsupported: agents already multi-search, zero-hit is 0, and failing QA cases search as
much as passing ones. Ship the rewrite; measure it (it is *not* free — instructions-mass
effects are real in both directions, per ADR-0001).

### #10 — "Capability atlas as the primary discovery surface"

**Verdict: reject as stated (mandatory 4–9k-token preload, per-op cards, hand-authored
useWhen/notFor); accept a scoped, generated, measured experiment.**
What kills the stated version: (a) token math — honest per-op cards blow the ≤6k budget
unless someone hand-compresses 50 operations, creating a second prose surface outside the
`description-notes.mjs` discipline that WILL rot under daily drift; (b) the premise gap
above; (c) "agents will read it" is unproven — the sls-015 evidence shows even targeted
counter-notes in descriptions get overpowered; (d) it taxes every session including the
exact-lookup majority. What survives: the **source-family/authority orientation kernel** —
the lumenloop 37.5% agentic number is a genuine orientation failure, and services/workflows
are a genuinely missing *kind* in the catalog. The defensible version is §4's Phase 1/2:
a ~800–1.5k-token generated micro-map (services, authority rules, workflow archetypes — no
per-op cards) plus searchable `kind:"service"`/`kind:"workflow"` entries, all generated
from build-script data with the existing emitted-text guards.

### #11 — "Vectorize-backed semantic routing cards"

**Verdict: reject now, with explicit trigger conditions (below).**
Round 5f is direct negative evidence on this exact catalog and grader — including the
fusion math (#12's rerank ladder ≈ RRF, which lost −30 top-1). Vectorize additionally
breaks the repo's determinism/offline-CI contract unless vectors become a checked-in,
model-pinned generated artifact with a deploy-state audit (the `ideas/` item 2 framing).
At 272 entries the deterministic levers (aliases, keywords, description enrichment,
upstream `improvements/` findings) are cheaper and have measured wins. Routing cards as
the *embedding unit* is the right call if the trigger ever fires — the issue's "embed
cards, not schemas" reasoning survives.

**Trigger to revisit (all must hold):** (1) Phase 1+2 arms measured first; (2) an
unsaturated target lane (round-844-style real-user lane, not the saturated extended
accept-either); (3) a prototype beating the deterministic baseline by ≥+5pt strict top-1
or ≥+3pt strict top-5 on that lane with legacy gate in band, skills ≥18/23, extended
accept-either top-5 held at 122/122; (4) wins adjudicated as net quality (win/loss
accounting like round 5f's 24/25), not label reshuffles; (5) reproducibility: committed
card text + model id/version + vector artifact + deployed-index audit.

### #12 — "Unify atlas + lexical + semantic under one discovery surface"

**Verdict: reject the hybrid `search(auto)` internals and per-hit `why`/`matchedBy` prose
for now; accept its conservative naming conclusion (keep `search`).**
A third scoring prong multiplies the already-carefully-documented tier-seam problem
(gated/backfill scores are not comparable; a semantic tier makes cross-tier semantics
strictly worse), and per-hit reasons re-inflate the pages that COMPACT_OUTPUT_THRESHOLD
was measured to deflate (~26KB limit-10 pages). The refined agent flow in the issue's
first comment is largely a description of what already ships (execute as in-script
discovery workbench). If Phase 2's lanes ship, `matchedBy` collapses to the existing
`kind` + `tier` fields at zero added prose.

### #13 — "Subtool taxonomy and placement"

**Verdict: accept as documentation; note it is ~90% the status quo.**
Every "keep/expose" placement (describe/catalog/spec/skill.read/skill.run/artifact.* under
execute; catalog and spec as advanced escape hatches; no top-level describe) is already
implemented, tested, and in several cases the subject of a prior measured decision
(ADR-0001 for spec). The genuinely open items are exactly the ones this doc phases: atlas
generation/placement, whether new kinds enter search, and the semantic escape hatch
(trigger-gated). `codemode.searchLexical`/`searchSemantic` siblings are rejected as
duplicate surface unless/until the semantic trigger fires. Filterable
`codemode.catalog({ kind, service })` is a reasonable small QoL addition, unblocked and
low-risk, but not load-bearing for this thread.

## 4. The plan (build in its own worktree, phased, each phase gated)

**Design constraints carried throughout:** two top-level tools; the manifest IS the surface
(ADR-0003 — new kinds are emitted by `scripts/build-catalog.mjs` from build-script data,
never hand-edited artifacts, `assertNoNonExposedRefs` extended to atlas text); determinism
(byte-identical builds, offline CI); forward-only (breaking the deployed contract is fine —
but every break is enumerated and updated in the same change); no per-question tuning.

### Phase 0 — instrument before touching anything (small, ~1 day)

Build the **discovery-only eval instrument** (`ideas/` item 5, ADR-0001 revisit note 4):
given a question, did one `searchCatalogPage` call (and separately: did an agent allowed ≤3
searches) surface the right *source family* top-3 and a usable operation/skill top-5?
Seed cases: the 12 current extended strict top-5 misses, the #9 exemplar class ("Has
protocol Zipper landed yet?", "Is CAP-62 implemented?" analogues), the lumenloop-labeled
agentic misses, and a slice of the round-844 real-user lane. Each miss gets a **cause
classification: retrieval / agent-behavior / downstream** — the redesign only gets credit
for the first two. This instrument referees every later phase and is reusable for `ideas/`
items 1, 2, and 4. No production code changes.

### Phase 1 — guidance rewrite + instructions micro-map (zero new surface)

1. Rewrite the search workflow prose: replace "2-6 word intent phrase" with
   multi-query/source-category planning language (issue #9's recommendation) in
   `SEARCH_DESCRIPTION`, `SERVER_INSTRUCTIONS`, and search `nextSteps`.
2. Add a **generated micro-map** to `SERVER_INSTRUCTIONS`: services + purposes + authority/
   corroboration rules + 8–12 workflow archetypes; target 800–1,500 tokens; NO per-op
   cards, NO schemas. Generated at build time from build-script data (new
   `scripts/` emitter or a build-catalog byproduct) so drift guards apply; the existing
   authority sentences in SERVER_INSTRUCTIONS fold into it rather than duplicating.
3. **RC check RESOLVED (2026-07-09, primary-source web research).** The 2026-07-28 RC
   removes `initialize` entirely (SEP-2575: stateless MCP, per-request `_meta` + required
   HTTP headers per SEP-2243); `instructions` survives, moved to the new `server/discover`
   RPC's `DiscoverResult` — but calling `server/discover` is **optional for clients**, so
   instructions delivery is no longer structurally guaranteed. Client reality today:
   Claude Code injects instructions; claude.ai silently ignores them (open issue
   anthropics/claude-ai-mcp#93); Cursor/ChatGPT consumption undocumented. Tool
   descriptions are the only channel every major client demonstrably puts in front of the
   model, in both revisions — and the RC strengthens them (deterministic `tools/list`
   ordering + `ttlMs` caching for prompt-cache hits). **Channel decision — split by
   function, don't duplicate:** a compact orientation layer (~300–500 tokens: catalog
   coverage, search→describe→execute workflow, source-category planning) rides in
   `SEARCH_DESCRIPTION` as the primary carrier (with two tools total, per-tool overhead
   multiplication doesn't apply; first line must be a strong standalone summary for
   deferred-tool-loading clients); the full micro-map (800–1,500 tokens) rides in
   `SERVER_INSTRUCTIONS`, served dual-era (legacy `initialize` result now, `server/discover`
   when the SDK stack adopts the final spec). Re-check client adoption after July 28.
4. Demo: decide explicitly whether the micro-map enters the demo preamble (it competes with
   the demo's tight token caps) — default NO for v1.

**Gates:** routing eval byte-identical (no scorer change → no re-baseline); Phase 0
instrument improves on agent-behavior-classified misses; agentic 30-case low+med (watch
lumenloop primary, docs must hold 100%); QA 30-case sample no regression, ideally converts
part of the lumenloop/source-family class.

### Phase 2 — atlas as catalog data: `kind:"service"` + `kind:"workflow"` lanes

Emit ~3 service cards and ~8–12 workflow cards as new catalog kinds through
`scripts/build-catalog.mjs` (shallow, schema-free, description ≤ ~300 chars, keywords like
skill-sections): searchable through the existing `search`/`codemode.search` with zero new
tools. `CATALOG_KINDS` grows, so `SEARCH_KINDS` follows automatically; scoring needs a
kind-weight decision for the new kinds (start ≤ skill-section's 0.75; workflow cards must
not blanket-outrank operations). `codemode.describe` on a workflow card returns its steps
and the exact next calls.

**Gates:** routing gate re-baseline only by explicit decision if lanes shift legacy
rankings (target: legacy within band, extended strict flat-or-up, skills ≥18/23); Phase 0
instrument is the primary success metric; three-arm comparison (baseline / Phase 1 /
Phase 1+2) on agentic + QA 30-case decides whether the lanes ship or revert. This phase is
the honest test of issues #10/#12's core idea in its deterministic form.

### Phase 3 — explicitly NOT in this build (trigger-gated backlog)

- **Semantic/Vectorize** — per the #11 trigger above (`ideas/` item 2 holds the
  determinism-preserving design if it fires).
- **Any new top-level tool (`atlas`, `discover`) or rename** — only if the Phase 1/2 arms
  fail AND a third-arm A/B shows a top-level surface beating them by more than run
  variance. ADR-0001 is the standing evidence that heavier front doors lose.
- **Per-hit `why`/`matchedBy` prose** — superseded by `kind` + `tier` once lanes exist.
- Related but separate: `ideas/` item 1 (per-op null-hypothesis A/B) shares the Phase 0
  instrument and should be scheduled independently.

### Blast radius (union, updated in the same change per phase)

Phase 1: `src/mcp/tools.ts` prose; `src/demo/prompt.ts` decision; README workflow prose;
ARCHITECTURE §1; new generator script + tests. Phase 2 additionally: `src/catalog/types.ts`
(`CATALOG_KINDS`), `scripts/build-catalog.mjs` + exposure/emitted-text guards,
`src/catalog/scoring.ts` kind weights, manifest/super-spec regeneration (does the super
spec carry workflow cards? default: yes, as x-workflow vendor extension, decide in build),
`test/search.test.ts` / `test/server.test.ts` / catalog staleness test, `eval/gates.json`
re-baseline decision, demo search visibility of new kinds, `eval/run-routing.mjs` kind
handling. Deploy + production verification per house rules.

## 5. Issue hygiene once this is reviewed

- #9: comment with the evidence summary (agents already multi-search; guidance rewrite
  shipping in Phase 1), keep open until Phase 1 lands.
- #10: comment linking this doc; retitle scope to the deterministic micro-map + lanes form.
- #11: comment with the round-5f table + trigger conditions; close or label
  `trigger-gated` — it should not read as pending work.
- #12: comment: hybrid internals rejected for now, naming resolved (keep `search`), lanes
  cover the unification goal; close into #10 or keep as umbrella.
- #13: comment: placement table confirmed as status quo + this doc's deltas; close.

## 6. What would change these conclusions

New evidence that would reopen the rejected branches: the Phase 0 instrument classifying a
large share of misses as *retrieval* (not agent-behavior/downstream); the real-user lane
showing vague-question zero-hits the extended lane doesn't; a stronger embedding model
clearing the #11 trigger; MCP client telemetry showing instructions are widely dropped
(would push the micro-map into SEARCH_DESCRIPTION or a lane-only design); or the `ideas/`
item 1 null-hypothesis A/B redirecting the architecture entirely.
