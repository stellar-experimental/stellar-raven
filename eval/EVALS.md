# Eval map — what we measure and why

This server is two tools — `search` and `execute` — for AI agents working the Stellar
ecosystem. Every eval here exists to answer one question at some layer:

> **Does an agent driving this MCP end-to-end produce a correct, current, non-fabricated
> answer?**

That end-to-end number (the QA eval) is the **headline**. Everything else is a cheaper or
sharper instrument pointed at one layer of it. When two evals disagree, the one closer to
the headline wins.

## The instruments

| Instrument | Layer | Cost / when to run | Headline vs diagnostic |
|---|---|---|---|
| `eval/run-routing.mjs` — legacy 338 strict | `search` ranking, offline | free, seconds — **every scoring/catalog change** | **GATE**: committed absolute baseline with a ±1% band. The authoritative input fingerprints, accepted totals, timestamp, and decision note live in `eval/gates.json`; `--gate` exits 1 on breach and CI runs it on every push/PR. Historical movements are recorded in `eval/README.md`. |
| — skills lane (23, hand-authored) | skills routing | free, same run | **GATE**: must not fall below the current top-1 floor in `eval/gates.json`; top-3/top-5/card@5 remain visible diagnostics. |
| — extended lane (122, real-user phrasing) | `search` on jitsu-mined questions | free, same run | Diagnostic; **target metric for retrieval work**. Read the latest local result for the current tree. Local results are not committed and do not define the gate baseline. |
| — protocol-history lane (8 positives, 4 controls) | `search` routing to a cited research corpus | free, same run | Frozen diagnostic. Positives require `scout.searchResearch` in the top five. Controls forbid any top-five capture. |
| `npm run eval:protocol-history` — original plus blind review sets (19 positives, 13 controls) | protocol-history routing and symmetric false captures | free, seconds — every candidate for this work | Frozen diagnostic. It fails unless every positive has `scout.searchResearch` in the top five and every control excludes it. |
| — accept-either views (corpus `acceptable_cards` ∪ overlay) | label-tolerance context | free, same run | Diagnostic only; never the headline |
| `eval/discovery/` | one-search, agent-allowed-≤3-search, and mined-query replay source-family / usable-route discovery | one-shot/replay free; agent arm paid; after discovery guidance or retrieval-shape work | Diagnostic: 43 adjudicated cases; `familyHit@3` + `usableOp@5`; paired miss classification; 91-query LumenLoop replay lane |
| `eval/agentic/` | agent-driven `search`, live server | ~$, minutes — after major search-behavior changes | Diagnostic (label-ambiguity analysis) |
| `eval/qa/run-qa.mjs` — main battery (499) | **end-to-end search → execute → answer** | ~$0.2–0.7/case, ~30 min per 30-case sample — before/after big changes, A/Bs | **HEADLINE** (correct / partial / wrong) |
| `npm run eval:playground` — actual `/playground/chat` SSE over existing QA cases | public playground model loop → tools → answer | paid; seeded 5-case default, max 30 per run-scoped subject — after playground prompt/model/loop changes; model-backed runs require an operator-matched server/tree generation and machine-readable round-cap context | Diagnostic, scored by the same QA judge/evidence pack; v2 artifacts self-pin answering/judge/cap/source provenance; never merge its denominator with the main MCP headline |
| — canonical live-data contract `live-data-canonical-v3` (`--cases eval/qa/corpus/live/live-cases.json`, 15 = the carried v2 ten (7 Scout / 2 Lumenloop / 1 cant-do, byte-identical under an independent projection digest) + 5 behavioral additions: lifecycle-label provenance, jobs recency, cross-service reconciliation, guessed-slug soft-empty, artifact-read continuation) | `execute` **grounding** where priors fail | ~$3.30–10 full at the documented ~$0.22–0.67/case — after executor/adapter changes | Diagnostic for the execute path; membership/order stays the frozen 15 while full case content is pinned by the contract's `caseContentDigest`; graded on behavior, never exact values. History: `live-data-canonical-v2` (10 cases) was the contract through 2026-07-12 and saturated at 10/10; v2 aggregates stay v2-denominated, per-id comparison remains valid for the carried ten |
| — opt-in digest contract `live-digest-supplement-v2` (`--cases eval/qa/corpus/live/live-digest-supplement-cases.json`, 2 Lumenloop) | `execute` recency-digest grounding | ~$0.44–1.34 full at the same per-case estimate — only for digest/skill-run questions | Diagnostic supplement; report separately from the canonical live-data lane and main battery |
| `eval/plan/grade-plan.mjs` | which services `execute` actually touched | free (regrades stored QA transcripts) | Diagnostic (coverage; progression informational only) |

`npm run eval:qa:paired` is an experimental stored-run printer. It requires 100 eligible IDs
after exclusions, so it does not apply to the sample-30 headline lane.

Corpus provenance: the QA battery is **owned** at `eval/qa/corpus/battery/` (one hand-authored
file per case; `eval/qa/README.md`); `eval/corpus/` is the **archival** vendored snapshot and
the routing eval's committed label source (`eval/corpus/PROVENANCE.md`) — the raven sibling
repos are retired; growth happens in this repo's own formats.

**Owned-battery and sample history.** The authoritative current denominator is **499 cases as of
2026-08-19**. The 497→499 compile added two `scout.hackathonBrief` cases to the 497-case corpus. The
retrieval audit previously added five service-semantics cases to the 492-case corpus. Commit
`6e1f979` before that added two Soroban cases to the 490-case corpus. The 490-case corpus was created
after six release-closeout cases were added to the 484-case 2026-07-11 baseline. Historical
484-case, 490-case, and 492-case results retain their original denominators. Per-id comparisons
remain valid when the rubric and pack tuple matches.

The sample-30 algorithm did not change: it allocates proportionally by `tags.service`, sorts each
stratum by id, and makes even-spaced picks. Growing the Scout and LumenLoop strata by three cases
each changed those pick positions, so recompilation deterministically retained 25 ids and replaced
five. Removed: `q-defi-liquid-staking-whitespace`, `q-hist-quantum-preparedness-plan`,
`q-scf-current-hackathons-compare-live`, `q-scf-rfps-hackathons-live`, and
`q-ti-explain-repo-payload-status`. Added: `q-defi-defindex-honest`,
`q-hist-meridian-2026-corrected-venue`, `q-scf-current-round`, `q-scf-sdf-bug-bounty`, and
`q-ti-openzeppelin-relayer`. None of the six new cases itself entered sample-30. Therefore, that
historical sample was deterministic for the 490-case corpus but was **not membership-identical**
to the 2026-07-11 484-case baseline sample. Aggregate before/after claims across that boundary
require either the same explicit ids or a disclosed sample-membership change.

The 492→497 compile retained 9 sample ids and replaced 21. Two new cases entered sample-30.
`eval/qa/README.md` records the exact membership history. Comparisons across this boundary need a
common-id set or a disclosed membership change. The 497→499 compile retained 28 sample ids and
replaced two; the same README rule applies across that boundary.

## Rules that keep this from getting messy

1. **One headline, two gates, everything else is diagnostic.** New reporting views don't
   get promoted into gates without a decision recorded in the round ledger. The two gates are
   mechanical, not prose: baselines live in `eval/gates.json`, every `run-routing` run
   prints a gate verdict, `--gate` turns a breach into exit 1, and CI runs
   `eval:selftest` + `eval:routing -- --gate` on every push/PR — so re-baselining means
   changing `gates.json` in the same commit as the change that moved the numbers. The file
   records SHA-256 fingerprints for every gated data input and exact accepted lane totals.
   Grading-rule changes
   re-baseline the gates explicitly (results files carry `gradingRule`). Current rule: v3,
   manifest-exposed entries only, no lumenloop/skills twin identity; cross-service tolerance
   belongs in `expected_any`, not in the strict headline.
2. **Lanes never merge.** The legacy 338, skills 23 (active; +8 documented-inert
   `retiredCases` in `eval/skills-cases.json` after the 2026-07-03 onboarding-skills
   retirement, ADR-0002), extended 122, protocol-history diagnostics 12 and 20,
   membership-frozen canonical live-data 15
   (`live-data-canonical-v3`; the carried v2 ten are a subset of it, and v2-denominated
   aggregates stay v2-denominated), and opt-in live-digest
   supplement 2 are separate scopes with separate denominators, forever. A historical
   12-case run means canonical v2 + supplement were run together; it is not a canonical-lane
   result. Comparability > bigger n.
3. **No per-question tuning.** Zero-hit cases stay failing until a *general* mechanism
   fixes them (inherited from the raven ADRs; it has held through three scoring rounds).
4. **Spirit, not schema.** Corpus content is fair input; foreign schemas, judge code, and
   labels built for other systems are not. Concretely: the semantic battery's `skillsAny`
   labels were evaluated and **deliberately not imported** (2026-07-03) — they were
   diagnostic-only in their source system, use cf-flue composite skill names, and every
   skill family they reference is already covered by the 23 active hand-authored skills cases
   (`eval/skills-cases.json`; 8 onboarding-skill cases moved to inert `retiredCases` on
   2026-07-03 per ADR-0002).
   Adding them would have grown the denominator, not the signal.
5. **Freshness-sensitive truth is graded as behavior, not values.** Anything that drifts
   (RFPs, leaderboards, rounds, region vocab) belongs in the live-data lane with a
   behavioral golden; putting a snapshot value in a hard gate is how evals rot.
6. **Hand-authored files are the sources; compiles can't wipe them.** The owned QA battery
   (`qa/corpus/battery/**`), the routing supplements (`skills-cases.json`,
   `build-question-overlay.json`), and the frozen live contracts
   (`qa/corpus/live/live-cases.json`, `qa/corpus/live/live-digest-supplement-cases.json`) are
   committed. `eval:selftest` pins both named QA contracts' names, ordered membership, and
   case-content digests. Any live-contract question/golden/tag/note change requires an explicit
   contract-version bump, provenance note, and digest update. Generated files
   (`routing-cases.json`, `qa/cases.json`, `qa/sample.json`, `qa/lifecycle-registry.json`) are never hand-edited — CI
   byte-pins them.
7. **Results are local-only evidence** (`eval/**/results/`, gitignored). `eval/gates.json`
   carries the routing gate's committed fingerprints and accepted totals. READMEs carry historical
   records and can cite exact local result stamps. A routing gate can add `evidence.localTrace` as
   optional context, but the trace is never required to resolve the baseline. The results dirs are
   unbounded. Prune results older than 30 days after the active investigation ends.
8. **Discovery is intentionally narrower than QA.** Its one-shot lane asks whether one verbatim
   `search` surfaces an expected family in the top 3 and a usable operation/skill in the top 5.
   The agent arm allows a real caller at most three searches and records visible hits plus final
   selection; the replay lane uses PII-safe queries mined from eval agents, never raw user traffic.
   Paired classification separates retrieval, agent-behavior, and downstream rows. None of these
   lanes measures final-answer correctness; use QA for that headline.
9. **Agentic cross-service tolerance needs an explicit contract change.** The current agentic
   workflow grades the exact expected service. Before the next comparable run, either consume the
   committed per-case `expected_any` labels and stamp that grading contract, or keep exact-primary
   grading. Never reinterpret stored results after the run.
10. **As-of-date omissions need a cross-shard inventory.** The 2026-08-14 row review found several
    otherwise-correct answers that omitted dates for volatile claims. Inventory the pattern across
    service shards before changing prompts or rubrics. A single case remains diagnostic and does
    not justify per-question tuning.

## Primary artifact: service-improvement recommendations

This server's own tuning ceiling is limited — scoring tweaks buy single-digit points. The
outsized leverage of running these instruments is **discovering gaps and errors in the four
upstream surfaces** (Lumenloop, Stellar Light/Scout, Stellar Docs, skills). So a primary
artifact of every eval run is an evidence-backed set of service-improvement recommendations
filed in `improvements/` (charter: `improvements/README.md`; one file per finding, in the
matching collection: `lumenloop/`, `stellar-light-scout/`, `stellar-docs/`, `skills/`).

- **Filing rule:** every eval round files new findings or updates existing ones. A round
  that surfaces an upstream gap and doesn't file it has dropped its most valuable output.
- **Evidence rule:** findings move `proposed → verified → reported-upstream → fixed-upstream`;
  `verified` requires live re-execution evidence, not a stale transcript.
- **Scope rule:** `improvements/` is for the upstream services only. Fixes to this repo's
  own scoring/catalog/executor go to `.agents/TODO.md`, as ever.

## What we deliberately do NOT measure

- **General-web questions** (perplexity/parallel arms) — this server intentionally has no
  web arm; 51 corpus cases skipped with reasons, 10 curated none-traps kept.
- **Raven-agent internals** (its brand, its Airtable, its pipeline stages) — 4 traps
  skipped; stage-attribution grading dropped.
- **Weighted rubric scores / citation hard-gates** — replaced by coarse
  correct/partial/wrong + explicit missingFacts/wrongClaims (robust to judge variance;
  rationale in `research/audits/2026-07-qa-history.md`).
- **Exact placements/rankings from surfaces that don't carry them** — the upstream reviews
  rejected those cases (`sl-hackathon-kale-reflector-1st`, `sl-hackathon-kale-vs-blend-counts`,
  `sl-ecosystem-asset-rwa-underbuilt-unfunded`); the rejections hold here and the live-data
  lane encodes their failure modes as `avoid` items instead.
