# QA improvement plan — from ~65% toward the honest ceiling

Date: 2026-08-25. Companion to `research/qa-miss-analysis-2026-08-25.md` and the lane
reports in `research/qa-deep-dive-2026-08-25/`. Nothing here is precious: every track is
reversible until it passes its gate.

## 0. Ground rules (from repo doctrine and this round's evidence)

- No per-question tuning, no golden edits booked as product gains, no answer caches of
  live values, no tool-per-intent rewrite of ADR-0003, no quiet general-web arm.
- The manifest stays the exposed surface; new sources arrive as manifest-controlled host
  adapters with allowlists and provenance (Terra's doctrinal-conflict table).
- Every number below is half-credit points on a common-id, same-tuple 100-case remeasure,
  valid only past the ±3–4 point judge-noise band.

## 1. Quick wins already banked — collect them this week (+2 to +4)

Two upstream content fixes shipped and re-pinned after answer collection; four goldens
were corrected. A same-100-id rerun at HEAD measures them cleanly:

1. Rerun ids of `2026-08-14T03-56-23-variantA.json` at HEAD (`run-qa.mjs --ids`).
   Expected conversions: `q-mpp-discovery-and-modes`, `q-tool-passkeykit-smart-wallet`
   (skill re-pins `sk-016`/`sk-017`); `q-soroban-auth-recursion-dos-audit`,
   `q-asset-stablecoin-issuers-discovery` (golden corrections).
2. Fix the WisdomTree CRDT golden identifiers first (live Horizon/stellar.toml values;
   Grok verified current strings) so the rerun does not grade a garbled gospel.
3. Adopt Fable R8/R9 harness guards before any rejudge: `--cases-ref` at collection
   revision by default; skip rows failing `hasSuccessfulAnswer`.

## 2. Track A — measurement honesty (weeks 1–3, ~+13 apparent, not product)

Priority order from the five-lane consensus; full rationale in `fable-max.md` §5:

| # | change | where | expected |
| --- | --- | --- | --- |
| A1 | Judge ensemble: 3 calls, majority score, disagreement rate as a first-class metric (or boundary-only ensemble: missingFacts ≤ 1 or wrongClaims = 1, ≈40% of rows) | `judge.mjs`, `run-qa.mjs` | flip rate 9.6%→~3%; removes ±3–4 pt band |
| A2 | Key-fact atomization lint: one predicate per key fact, ≤90 chars; compound facts split or flagged trivial-sub-clause | `lint-corpus.mjs` | +2–3 |
| A3 | Retire boilerplate as-of key facts; replace with one graded "dated when volatile" behavior disclosed in the answering contract | corpus + `run-qa.mjs` | +3–4 (with A2) |
| A4 | Avoid-item lint: must assert a falsifiable claim; presentation-style objects rejected; symmetric caution required when truth names an improvements/ defect | `lint-corpus.mjs` + 6 cases | +3–4 |
| A5 | Pack placement after candidate answer + "the pack cannot create missingFacts" rule | `judge.mjs`, `evidence-pack.mjs` | +2 |
| A6 | Trap precedence: correct behavior with no avoid hit = correct regardless of coverage | `verdict-consistency.mjs` | +0.5 |
| A7 | Harness tool isolation: block built-in Skill/ToolSearch; assert transcripts contain only MCP tools | `run-qa.mjs` | integrity |
| A8 | Report `coreAnswer` rate and continuous coverage `1 − missing/keyFacts` beside half-credit; add a one-time 30-case pairwise/human "usable answer" panel as the user-truth number | reporting | decision quality |

A8 resolves the round's central metric dispute: keep the checklist as diagnostic, add
the panel, and let both numbers be reported together.

## 3. Track B — product mechanisms that survive doctrine (weeks 2–6)

From Sol's forensics (evidence-backed mechanics), Grok's pricing, and Kimi's cold audit:

**B0 — contract/description text only, no infrastructure, ship first** (Kimi P0):

| # | change | evidence |
| --- | --- | --- |
| B0.1 | MPP discovery description: name OpenAPI 3.1 / `x-payment-info.offers` / advisory-vs-402-Challenge in the `file:mpp.md` section + parent skill description | the one true catalog-visibility gap found; one-line-class fix |
| B0.2 | Enumeration cue on roster operations (`searchProjects`, `getPartners`, `listAudits`, `getStablecoins`): "a roster is a dated snapshot; state as-of date and lifecycle filter" | wallets-list miss |
| B0.3 | Alias packs mined from golden-question failures into descriptions/keywords (CRDT↔CRDYX↔fund name class) with provenance review like goldens | CRDT evidence-poor recovery |
| B0.4 | Dispute cues where indexed pages conflict (Horizon lifecycle, Freighter HTTPS): descriptions say "wording differs across pages; report both framings" | horizon/freighter docs-dispute wrongs |

| # | mechanism | stages hit | expected | notes |
| --- | --- | --- | ---: | --- |
| B1 | Payload-shape guard: trap `.map/.filter/.length` on object payloads; error lists real keys (`use r.data.hits`) | B | +1.5–2.5 | extends existing envelope guards |
| B2 | Host-owned provenance sidecar: capture `generatedAt`/`dataAsOf`/counts/matchMode before sandbox projection; append to SOURCE BASIS | C, E | +2–4 | answers stop losing dates they retrieved |
| B3 | Bounded final-evidence checklist in server instructions (date volatile values; copy exact symbols/types/formulas; scope absence claims to searched sources; surface conflicts; carry safety qualifications) plus a broaden-or-abstain policy with per-search confidence hints | E | +3–5 | test as a variant against unrelated E rows first; fits instruction budget |
| B4 | Multi-clause recovery metadata: widerCandidates include excluded-family skills; advisory evidence-role groups (current vs historical, product vs risk); soft-empty responses carry a next-lane hint | D, A | +2.5–4.5 | manifest-driven only |
| B5 | Host-side hybrid search (Vectorize over catalog text + routingKeywords, RRF with lexical) — PRE-REGISTERED: holdout top-1 must not drop, forbidden captures ≤11, legacy band ±1%; targets entity/paraphrase misses only. Kimi's counter-position: at 251 entries, try B0.3 alias packs and a light top-k rerank first; defer embeddings until measured zero-hit queries survive them | A | +2–6 | does nothing for empty corpora or dispute goldens |
| B6 | Reconsider skill-section searchability for high-value sections via indexed section cards, or host-side rerank of lexical top-k (small cross-encoder on Workers AI) | A | +0.5–1.5 | reverses part of the 2026-07-13 A/B only with a new A/B win |
| B7 | Freshness-and-dispute registry served into judge-visible evidence packs for cases whose truth status is disputed (Kimi 1(d)) | measurement+product | supports A-track | precomputation that buys honesty, not score laundering |

## 4. Track C — upstream truth repair (continuous, largest ceiling)

Already-filed findings cover most of Stage F; work them through the existing pipeline
(`improvements-pipeline` skill). Priorities by affected rows (Terra §Top-10):

1. **Canonical technical source reader** (host adapter over stellar-core/protocol/SEP/
   quickstart/SDK repos, allowlisted read-only): up to 14 rows. The base-reserve,
   manual-close, RPC-reference, and extendTo cases all want "read the actual source,"
   which no exposed operation provides today.
2. **Vendor/issuer primary sources** (Circle, PayPal/Paxos, MoneyGram, Allbridge,
   WisdomTree, Etherfuse): up to 10 rows. Allowlist + provenance per domain.
3. Docs repairs: `sd-003` (RPC pages unindexed), `sd-041/042/043/044/045` — filed,
   several already fixed upstream; verify and re-pin.
4. **Live network metadata op** (read-only ledger header/protocol/close-time): grounds
   Protocol 27, close-time, and reserve-value cases without side effects.
5. Advisory/CVE canonical source with version-qualified identifiers (`sls-074` family).
6. Scout dated-entity envelope + Lumenloop product identity/time-window fields
   (`sls-024/033`, `ll-012` families).

New filings needed from this round: none duplicate — Terra cross-checked all overlaps;
the WisdomTree identifier fix is a **repo-side golden repair**, not an upstream finding.

## 5. Radical options, priced honestly (Grok matrix + Kimi SOTA survey)

Kimi's survey (`kimi-k3.md` Part 1, citations verified live) maps the field onto this
system: hybrid retrieval pays when vocabulary mismatch is common; rerankers pay on
small catalogs where precision at ranks 1–3 decides; rewrite/aliasing beats HyDE for
short-description catalogs; CRAG-style broaden-or-abstain is a contract change, not
infrastructure; GraphRAG and semantic caches are overkill or rot-prone at 251 entries;
judge panels (PoLL), rubric anchoring, temperature 0, and pairwise grading directly
attack the measured 9.6% flip rate.

| option | verdict |
| --- | --- |
| Dense/vector retrieval layer (Vectorize, host-side) | KEEP as B5, pre-registered; +2–6, paraphrase-only; alias packs first per Kimi |
| Deterministic claim-support verification + broaden-or-abstain | KEEP; cheap Self-RAG/CRAG; +2–5 on fabrications/denials |
| Judge ensemble / pairwise arm / temperature-0 + flip-rate release gate | KEEP (A1/A8); field-standard fix for judge noise |
| Canonical fact cards for STABLE truths served into evidence packs | KEEP narrowly (B7 dispute registry; stable facts only) — dated, provenance-bearing |
| Canonical answer cache for live truths | REFUSE — becomes a second gospel that rots (SCF round case proves it) |
| Multi-model answering consensus | REFUSE as default; errors correlate on official-blog disputes; judge ensemble gets the variance win at ~1/10 cost |
| Tool-per-intent endpoints | REFUSE — breaks ADR-0003; wins only by overfitting the battery |
| General-web fallback arm | REFUSE while the battery remains closed-world; changes the product, not the score |
| Raising the answering model | Not a strategy; prior sample showed no material gain and judge inconsistency dominated |

## 6. Sequenced roadmap with gates

| phase | work | gate to proceed |
| --- | --- | --- |
| Week 1 | Golden ID repair; harness guards R8/R9; same-100 rerun at HEAD; A8 coreAnswer + coverage reporting lands; **B0.1–B0.4 description/contract text ships** | rerun banked ≥ +2 with zero routing-gate movement |
| Weeks 2–3 | A1 ensemble (boundary-only first), A2/A4 lints, A5/A6; golden-truth pass under the revised lint | identical-input flip ≤3%; lint clean on 499 |
| Weeks 3–5 | B1+B2 ship behind flags; B3 variant test on unrelated E-row acceptance set; B0.3 alias-pack mining loop stood up | QA slice ≥ +2 on acceptance set, no new wrongs |
| Weeks 4–6 | B4; B5 Vectorize spike only if alias packs + light rerank leave measured zero-hit paraphrase misses; pre-registration applies | holdout top-1 ≥ baseline; forbidden captures ≤11 |
| Continuous | Track C pipeline work in priority order; each landing triggers a targeted id-set rerun | per-finding recurrence probe green |
| Week 8+ | Full-battery remeasure, common-id comparison, publish both headline numbers + usable-answer panel | decide quarter-two targets on evidence |

Honest trajectory if all gates pass: ~64.5% → ~78% measurement-honest floor → mid-80s
with banked+landed upstream fixes → ~89–91% ceiling with discipline loop and second-hop
recovery, minus the 4–6 genuinely-unanswerable stratum. Grok's counter-position stands
recorded: treat anything above ~70–75% on this checklist as meter movement unless the
usable-answer panel moves with it.

## 7. What we are deliberately not doing

Per-question catalog hacks; live-value caches; exposure of paid/side-effecting ops
without host-side approval/budget machinery; rewriting search around a reranker when
top-5 is already 92%; blaming retrieval for misses the transcripts prove happened
downstream of discovery.
