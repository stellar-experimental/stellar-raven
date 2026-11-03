# Adversarial Review of the Model-Assisted Search Ranking Pre-Registered Contract (2026-11-03)

Reviewer: Gemini 4 Argon (`openrouter/google/gemini-4-argon`), independent adversarial review (read-only).
Scope: `.agents/rounds/2026-11-03-model-ranking/{contract.md,candidates.md,harness.md,runtime-design.md}` against prior round records (`.agents/rounds/2026-11-02-routing-repair*`) and repository implementation.

---

## Executive Summary

The pre-registered contract does not yet prevent a noisy, overfitted, or contract-breaking candidate from passing, and several of its rules conflict with the repository's existing code and CI gates. The most severe issues are:

1. **Class `(m)` in Q3 is a tautological rubber stamp** (`A1`): in assisted mode, every model-driven demotion occurs because a promoter had higher model evidence. Because `legacy`, `extended`, and `skills` rows have no `forbidden_cards` field in `eval/routing-cases.json` or `eval/skills-cases.json`, class `(m)` automatically excuses 100% of model-hallucinated losses outside the 49 holdout forbidden cards without checking whether the promoted entry is relevant.
2. **Multiple-testing and post-hoc holdout fitting across ~89 variants** (`A2`): evaluating up to 89 variants on the 49-row holdout and 23-row skills sets—and explicitly using holdout/extended Q-scores from Repeat 1 to select `dense*`, `rerank*`, and `clef*` in Family `f`—violates `contract.md` §7 and `eval/gates.json` `holdoutNote`.
3. **Unanchored relative normalization and `POOL-ALL` / `RRF` / `PURE` break `SearchPage` invariants** (`A4`, `A5`): `rel(e)` in `GATE(3, 0.5)` normalizes against the sample median and max of the filtered entry set `E` with no minimum similarity floor, so `GATE(3, 0.5)` admits 1–3 gated hits even on gibberish (`"zzzzqqqq zzqqzzqq"`), stopwords, or narrow `service`/`kind` filters; `POOL-ALL` sets `total = 80` and `truncated = true` on every query; and `RRF`/`PURE` emit lexical `score` (including `0`) in model order, corrupting `confidence.topScoreGap` and `topScoreTiers` (`src/catalog/search.ts:1289-1293`).
4. **Direct conflicts with repository code and tests** (`A8`, `A9`, `A10`, `A13`, `A15`):
   - `eval/run-routing.mjs:420` enforces a symmetric `±1%` (`±3`) ceiling on `legacy`, so any candidate that achieves the required `+10` minimum net gain on `legacy` fails `--gate`.
   - `eval/run-routing.mjs:464` omits `holdoutPerCase` from `--dump-ranked`, so R3's dump diff never checks holdout or non-ID `SearchPage` fields.
   - `harness.md` §7.2 defines a "Hackathon row" as any question containing the token `hackathon`, which exempts `q-scf-ecosystem-listing-partner-jobs` (`eval/routing-cases.json:4596`)—the canonical non-hackathon interference victim in `.agents/TODO.md:191`—from Q4.
   - `runtime-design.md` §9 proposes an `AGENTS.md` rule allowing `"one pinned Workers AI model"`, which forbids shipping any two-model Family `f` winner that the same document designs for.

---

## 1. Loopholes & Score Laundering

### A1 — `blocker` — Q3 class `(m)` tautologically excuses every model-caused loss without checking relevance
- **Contract text:**
  - `contract.md` §4 Q3 (lines 89–91): `"*(m) new:* a promoted entry with higher model evidence than the demoted entry. The promoted entry is not a forbidden card for that row. It gains no new lexical contribution of the kinds in (a)."`
  - `harness.md` §7.3 (lines 261–262): `"3. (m) Every promoter has a higher model value than the demoted entry, is not a forbidden card for that row, and gains no contribution of a class (a) kind."`
- **Why it is a problem:**
  1. In families `a`, `c`, `d`, and `f`, the lexical scorer is unchanged, so no promoter ever gains a new lexical contribution of kind `(a)`.
  2. By construction of `MULT`, `GATE+MULT`, `RRF`, and `PURE`, any entry that passes the expected entry in assisted mode (when it did not in baseline) did so *because* it had a higher model value. Class `(m)` mistakes the *mechanism of the model error* ("the model scored the wrong entry higher") for a *relevance justification*.
  3. Only `eval/holdout-cases.json` (49 rows) defines `forbidden_cards`. `eval/routing-cases.json` (338 legacy + 122 extended rows) and `eval/skills-cases.json` (23 rows) have no `forbidden_cards` field (`eval/run-routing.mjs:235-250`). Thus, on 483 of 532 graded rows, `"is not a forbidden card for that row"` is vacuously true, and even on holdout it only checks the short explicit forbidden list. A model can promote a completely unrelated tool over the expected tool on dozens of rows, and every single loss passes Q3 as class `(m)` so long as aggregate `W − L ≥ 0`.
  4. For the 156 legacy rows where `expected_cards` is empty (`cardN = 182` of `338` in `eval/gates.json:30`), `harness.md` §7.3 does not even define which catalog entry is `"the demoted expected entry"`.
- **Smallest amendment:**
  Require every class `(m)` promoter on a strict-key loss to match an allowed service in the row's `expected_any` union (`eval/run-routing.mjs:240`) or an entry in `expected_cards` (when `cardHit5` was not lost), OR cap unexcused model-only losses (`(m)` where a promoter is outside `expected_any` and `expected_cards`) at `≤ 2` per lane and require human/coordinator relevance sign-off on each such row before selection. Define `"the demoted expected entry"` as the highest-ranked baseline hit matching `expected_cards` (for `cardHit5` / holdout losses) or `expected_service` (for service `top1`/`top3`/`top5` losses).

---

### A2 — `blocker` — Post-hoc selection across ~89 variants and Family `f` component selection fit the holdout and extended lanes
- **Contract text:**
  - `contract.md` §3 (lines 64–65): `"A variant is one fully specified member. Each variant is a separate candidate."`
  - `contract.md` §6 (lines 239–240): `"Q score. The sum over lanes and both sources of (W − 2L) on strict keys."`
  - `contract.md` §7 (line 273): `"Holdout and extended rows are not used to choose constants. Constants are already fixed here."`
  - `candidates.md` §8 (lines 286–290): `"dense* = the family a variant with the highest Q score among those that pass every Q and R rule on repeat 1 of both sources... rerank* = the same rule over family d. clef* = the same rule over the c-cf variants."`
- **Why it is a problem:**
  1. `candidates.md` declares up to 89 variants (36 in `a`, 36 in `b`, 8 in `c`, 5 in `d`, 4 in `f`). Filtering all 89 variants by holdout Q1/Q2/Q4 and picking the maximum Q-score (which sums `W − 2L` across `legacy`, `extended`, `skills`, and `holdout`) is hyperparameter/model selection directly on the blind holdout (`n = 49`) and `skills` (`n = 23`), violating `eval/gates.json:66` (`"Do not tune against it"`).
  2. Worse, Family `f` (`candidates.md` §8) is not fixed before measurement: it selects `dense*`, `rerank*`, and `clef*` *after* reading Repeat 1's Q-score (which includes `holdout` and `extended`), directly violating `contract.md` §7 (`"Holdout and extended rows are not used to choose constants"`).
- **Smallest amendment:**
  Compute the selection Q-score (both for choosing `dense*`/`rerank*`/`clef*` in `candidates.md` §8 and for ranking eligible candidates in `contract.md` §6 step 1) on `legacy` only. Keep `skills`, `extended`, and `holdout` strictly as pass/fail non-regression gates (Q1, Q2, Q4), never as maximization targets.

---

### A3 — `major` — Minimum effect (`+10` net gain) counts multi-key flips on a single row and allows zero gain on all gated lanes
- **Contract text:**
  - `contract.md` §3 (lines 56–57): `"W and L. One false-to-true flip of a strict key is one win. One true-to-false flip is one loss. One row can give both."`
  - `contract.md` §6 (lines 241, 246–247): `"Net gain. The sum over lanes of W − L, on each source separately... Minimum effect. A candidate is eligible to ship only when its net gain on each source is at least +10."`
- **Why it is a problem:**
  1. Because `top1`, `top3`, `top5`, and `cardHit5` are cumulative on the same row (`eval/lib/grade.mjs:100-113`), one row whose expected card moves from rank 6 to rank 1 yields `+4` wins (`top1`, `top3`, `top5`, `cardHit5`). Moving just 3 rows from rank 6 to rank 1 produces `W − L = +12`, satisfying the `+10` bar on 3 questions.
  2. Because `Net gain` sums across all four lanes (`legacy + extended + skills + holdout`), a candidate can have `W − L = 0` on `legacy`, `0` on `skills`, and `0` on `holdout`, get `+10` key flips on 3 rows in the ungated `extended` lane, and ship.
  3. Within a lane, Q1 (`W − L ≥ 0`) and Q2 allow a candidate to lose `top1` on 3 rows (provided another 3 rows move from rank 2 to rank 1) or trade `top3` losses for `cardHit5` wins.
- **Smallest amendment:**
  In `contract.md` §6, require in addition to `Net gain ≥ +10`: (a) at least **8 distinct rows** per source with a strict-key improvement and zero strict-key losses on those rows, (b) `W − L ≥ +6` on the gated lanes (`legacy + skills + holdout`) on each source, and (c) in Q2, no individual strict metric (`top1`, `top3`, `top5`, `cardHit5`) in `legacy`, `extended`, or `skills`, and `top1` in `holdout`, may fall below baseline (already in Q2), *and* `top1` must increase on at least one gated lane.

---

### A4 — `blocker` — Relative `rel(e)` normalization in `GATE(3, 0.5)` has no absolute similarity floor and admits noise on gibberish, stopwords, and filtered searches
- **Contract text:**
  - `candidates.md` §1 (lines 36–37): `"Searchable entries, E. The manifest entries with searchable !== false that pass the request's kind and service filters."`
  - `candidates.md` §2 (lines 78–88): `"Let med and max be the median and maximum of v over E. Then rel(e) = clamp((v(e) − med) / (max − med), −1, 1), with rel = 0 when max = med... GATE(n, τ) + MULT(β). First apply the admission step. Each entry of E that is among the n entries with the highest v, and that has rel ≥ τ, joins the gated set if it is absent. Its gated score is max(its ungated score, 1)."`
- **Why it is a problem:**
  1. `rel(e)` is normalized purely against the within-query median and max over `E`. For any query where not all cosines are identical, the maximum entry in `E` *always* has `rel(e) = 1.0 ≥ 0.5`, and typically 3 entries have `rel(e) ≥ 0.5`, even when every cosine in `E` is noise (e.g. `max = 0.21, med = 0.17`).
  2. Consequently, on a gibberish query (`"zzzzqqqq zzqqzzqq"`, tested in `test/search.test.ts:116`) or a stopword-only query, `GATE(3, 0.5)` unconditionally admits 1–3 entries into `L_gated` with score `1.15`, returning non-empty `"gated"` hits instead of `[]`.
  3. On a page that previously had only `"backfill"` hits (or zero hits), `GATE(3, 0.5)` marks its admitted hits as `tier: "gated"`, which sets `allBackfill = false` in `deriveWiderCandidates` (`src/catalog/search.ts:1496-1499`) and **suppresses `widerCandidates` recovery advice**!
  4. When a caller passes `service` or `kind` filters (as `SEARCH_DESCRIPTION` in `src/mcp/tools.ts:258,270` instructs agents to do), `E` shrinks to 12–21 entries; min-max scaling over 12 entries forces top-3 admission regardless of relevance.
  5. `GATE(n, τ)`, `POOL-ALL`, and `POOL-L+M10` draw from `E` without checking `rejectsRoutingIntent` (`x-routing.notFor` exclusions, `src/catalog/search.ts:512-548`) or `admitsWholeSkill` (`src/catalog/search.ts:767-769`), allowing model evidence to admit entries that explicit `notFor` rules excluded.
- **Smallest amendment:**
  1. Define `E_eligible` (for `GATE`, `POOL-ALL`, and `POOL-L+M10` admissions) as entries of `E` that are not rejected by `rejectsRoutingIntent` and, for skills, pass `admitsWholeSkill` (or explicitly state if dense admission may bypass `admitsWholeSkill`, while never bypassing `rejectsRoutingIntent`).
  2. Never run model admission (`GATE`, `POOL-ALL`, `POOL-L+M10`) when `L_lex` is empty (preserving `[]` on gibberish/whitespace queries in `test/search.test.ts:116-117`).
  3. In `deriveWiderCandidates` (`src/catalog/search.ts:1496`), compute `allBackfill` from lexical `L_gated` before model admission so model-admitted hits do not suppress `widerCandidates`.

---

### A5 — `blocker` — `POOL-ALL`, `RRF`, and `PURE` corrupt `SearchPage.total`, `truncated`, `SearchHit.score`, and `confidence.topScoreGap`
- **Contract text:**
  - `candidates.md` §2 (lines 95–101): `"Each hit keeps tier: 'gated' when it is in L_gated, else 'backfill'. total is the pool size after the filters. The hit score is the lexical score (0 for a model-only entry), so a caller sees no model value. PURE(pool)... Tier, total, and score follow the RRF rules."`
- **Why it is a problem:**
  1. In `src/catalog/search.ts:1289-1293`, `confidence` computes:
     `topScoreGap: hits.length >= 2 ? Math.abs(hits[0]!.score - hits[1]!.score) : null`
     `topScoreTiers: hits.length >= 2 ? { first: hits[0]!.tier, second: hits[1]!.tier } : null`
     Under `RRF` and `PURE`, `hits` are ordered by fused RRF score or model score, while `hit.score` is left as the raw lexical score (`0` for a model-only hit). If `hits[0]` is a model-promoted hit with lexical `score: 0` (or `40`) and `hits[1]` is a gated lexical hit with `score: 450`, `hits[0].score < hits[1].score` and `topScoreGap` is reported as `450` (high confidence!) when `hits[0]` actually had zero lexical score. This directly contradicts `searchHitSchema` and `searchConfidenceSchema` (`src/mcp/tools.ts:98-106,164-171,271`).
  2. For `POOL-ALL` (`c-*-all-*`, `d-all-*`), `"total is the pool size after the filters"` sets `total = |E| ≈ 80` and `truncated = true` (`80 > hits.length`) on **every single search**, even when only 2 entries matched lexically and 78 entries had Clef probability `0`! That breaks `truncated` semantics (`src/mcp/tools.ts:198-203`: `"truncated: true means more entries matched (total) than the page shows"`).
- **Smallest amendment:**
  1. For `RRF` and `PURE`, define `total` as the count of entries in the pool that have positive lexical score OR positive model evidence (e.g., `prob > 0` for Clef), not `|POOL-ALL|`.
  2. When hit order is determined by `RRF` or `PURE` and `hits[0].score < hits[1].score` (or either hit has lexical `score === 0`), set `confidence.topScoreGap = null` (or expose fused rank score on a documented scale) so `topScoreGap` never reports an inverted lexical difference as positive confidence.

---

### A6 — `major` — Repeat selection, cost (R6), and override (Q9) checks do not apply to the same repeat, and failed repeats can be silently re-captured
- **Contract text:**
  - `contract.md` §5 R13 (lines 230–233): `"Each candidate captures two repeats. Every Q rule must pass on each repeat fixture by itself... The gate fixture is the repeat with the lower Q score (section 6)."`
  - `harness.md` §6 (line 217): `"For each variant, compute the mean list-price cost per call over the routing corpus queries of repeat 1..."`
  - `harness.md` §7.6 (lines 311–313): `"Q9: rebuild the catalog with SKILL_DESCRIPTION_OVERRIDES['skills.stellar-dev.dapp'] removed, rerun assisted mode on repeat 1..."`
  - `candidates.md` §9 (line 321): `"Latency runs (R7) are needed only for variants that pass every Q rule on both sources and on repeat 1."`
- **Why it is a problem:**
  1. `Q score` (`contract.md` §6 line 239) sums `W − 2L` over **both sources** (`main` and `fresh`), whereas `eval/ranking-fixture.json` (`runtime-design.md` §4) commits the `main` fixture. If Repeat 1 has a lower combined Q-score (due to `fresh`) while Repeat 2 has a lower Q-score on `main`, R13 selects Repeat 1 and commits the *higher* `main` score to `eval/gates.json`.
  2. If Repeat 2 is selected as the gate fixture under R13, Q9 (`dapp` override check) and R6 (cost check) were only run on Repeat 1 (`harness.md` §6, §7.6).
  3. Nothing in `harness.md` §5 prevents a lane from deleting `cache-r2/` and re-capturing Repeat 2 if the first Repeat 2 capture differed by `> 5` flips (R13), because `spend.jsonl` is written locally in `tmp/model-ranking/`.
- **Smallest amendment:**
  1. Require R6 and Q9 to pass on **both** repeats, and select the committed `eval/ranking-fixture.json` for `main` as the repeat with the lower Q-score on `main` (and use the lower combined Q-score across repeats for candidate comparison).
  2. Require `spend.jsonl` to be append-only with every HTTP call logged *before* response validation, and forbid deleting or overwriting `cache/` or `cache-r2/` records once written; any key with more than one live capture per repeat in `spend.jsonl` (beyond the single allowed 429/5xx retry in `harness.md` §5) invalidates the run.

---

### A7 — `major` — Family `b` keeps the broken lexical scorer in fallback mode while claiming to fix the lexical defect class
- **Contract text:**
  - `contract.md` §4 Q7 (lines 118–123): `"Full pass, lexical changes only. A candidate that changes lexical matching (family b) must pass checks 1, 2, 3, 5, and 6, and every G10 comparison, in assisted mode. It claims to fix those defects, so it must fix them. A candidate that leaves lexical matching unchanged does not close the TODO item 'Preserve structured routing intent across extraction caps and gate tiers'."`
  - `contract.md` §5 R3 (lines 153–157): `"Fallback mode returns exactly the baseline lexical page... A family b lexical change therefore applies only in assisted mode."`
- **Why it is a problem:**
  Under R3, if a Family `b` variant wins, the Worker runs `morph + schema` lexical scoring when Workers AI responds within 500 ms, and silently switches back to the *old, buggy* lexical scorer (`has`/`phase`, `in`/`integration`, `approach`/`app`, schema-only admission) on every timeout, error, budget refusal, rate-limit refusal, or `SEARCH_RANKING_MODE=lexical` switch—and in every unit test that calls `searchCatalog(catalog, opts)` with two arguments! Therefore, even a Family `b` winner leaves the lexical defects active in fallback mode and cannot close the TODO item `.agents/TODO.md:156`.
- **Smallest amendment:**
  Amend `contract.md` §4 Q7 lines 122–123 to state: `"No candidate in this round (including family b, whose lexical change applies only in assisted mode under R3) closes the TODO item 'Preserve structured routing intent across extraction caps and gate tiers' or authorizes the Scout/Docs absorbs."`

---

## 2. Internal Contradictions & Rules That Wrongly Reject Better Designs

### A8 — `blocker` — `eval/run-routing.mjs --gate` enforces a two-sided `±1%` (`±3`) band on `legacy`, rejecting any candidate that improves `legacy` by `≥ +4`
- **Contract text:**
  - `contract.md` §6 (lines 246–247): `"Minimum effect. A candidate is eligible to ship only when its net gain on each source is at least +10."`
  - `runtime-design.md` §7 (lines 165–170): `"The legacy, skills, and holdout blocks become the assisted profile. Their values are the winner's measured values on main. Floors move only upward. The legacy band stays ±1%... npm run eval:routing -- --gate checks both profiles in one run and exits 1 if either fails."`
- **Why it is a problem:**
  `eval/run-routing.mjs:418-421` checks `legacy` with `Math.abs(o[k] - g.legacy[k]) > band`, where `band = Math.round(338 * 1 / 100) = 3`. As `report-rt-c.md:219` already proved on 2026-11-02 (`"Main exact gates also reject large legacy improvements because the legacy gate uses a symmetric band"`):
  1. During candidate evaluation against unmodified `gates.json`, any candidate that raises `legacy.top1` from `218` to `≥ 222` or `legacy.top3` from `294` to `≥ 298` fails `--gate`.
  2. Even after re-baselining `gates.json` to the winner's values (`runtime-design.md` §7), keeping the symmetric `Math.abs` `±1%` band means any subsequent catalog refresh that *improves* `legacy` by `+4` fails CI, while the `±3` downward band on the assisted profile would allow the assisted profile to regress by `-3` in future commits (violating Q2's zero-drop floor).
- **Smallest amendment:**
  Specify in `harness.md` §7.1 and `runtime-design.md` §7 that `legacy` gate checking for the assisted profile uses the Q2 non-regression floor (no metric below baseline) rather than an upper ceiling, and in `runtime-design.md` §7 specify whether `eval/run-routing.mjs` keeps `±1%` only for the `fallback` profile or changes `legacy` in the `assisted` profile to a floor (`o[k] < g.legacy[k] - band`).

---

### A9 — `blocker` — Proposed `AGENTS.md` rule text in `runtime-design.md` §9 forbids shipping Family `f` (two-model combinations)
- **Contract text:**
  - `runtime-design.md` intro (lines 3–4): `"It applies to every family that can ship (a, b, c, d, f)."`
  - `candidates.md` §8 (lines 294–297): `f-dr`, `f-dc`, `f-bdr`, `f-gr` each call **two** models per search (`dense*` plus `rerank*` or `clef*`).
  - `runtime-design.md` §9 (lines 195–196): `"One exception: the search ranking call. It may call one pinned Workers AI model through the AI binding and the dedicated search AI Gateway, never a provider outside Cloudflare."`
- **Why it is a problem:**
  If a Family `f` candidate wins (`f-dr`, `f-dc`, `f-bdr`, `f-gr`), it calls *two* pinned Workers AI models per search (which is why `runtime-design.md` §4 line 143 and §6 line 142 use plural `modelIds` / `rankingModelIds`). Yet the proposed `AGENTS.md` rule in `runtime-design.md` §9 says `"It may call one pinned Workers AI model"`, making a Family `f` winner violate `AGENTS.md` on the commit that ships it.
- **Smallest amendment:**
  In `runtime-design.md` §9 line 195, change `"It may call one pinned Workers AI model"` to `"It may call at most two pinned Workers AI models"` (or `"the pinned Workers AI model(s) of the accepted variant"`).

---

### A10 — `major` — `f-gr` sequential admission is defeated whenever `|L_gated| ≥ K` (`K = 20`)
- **Contract text:**
  - `candidates.md` §2 (lines 85–88): `"GATE(n, τ) + MULT(β). First apply the admission step. Each entry of E that is among the n entries with the highest v, and that has rel ≥ τ, joins the gated set if it is absent. Its gated score is max(its ungated score, 1). Then apply MULT(β) and the unchanged selector."`
  - `candidates.md` §8 (line 297): `"f-gr | dense* then rerank* | GATE(3, 0.5) on dense, then PURE(first K of the gated-then-ungated order) by rerank | sequential"`
- **Why it is a problem:**
  1. `f-gr` does not define whether `"the gated-then-ungated order"` after `GATE(3, 0.5)` sorts `L_gated` by the `MULT(0.15)`-adjusted scores or keeps them in some other position.
  2. If `L_gated` is sorted by score descending, an entry admitted by `GATE(3, 0.5)` that had no ungated lexical score (so its gated score is `1 × (1 + 0.15 · rel) ≤ 1.15`) sorts at the **very bottom** of `L_gated`. Whenever `|L_gated| ≥ 20` (`K = 20` on the routing corpus), that newly admitted entry sits at index `≥ 20` and is **excluded from the first `K` entries** sent to `rerank*`! The entire purpose of `GATE(3, 0.5)` in `f-gr` (admitting a semantically relevant entry that missed lexical tokens so the reranker can score it) is defeated whenever 20 entries pass the lexical gate.
- **Smallest amendment:**
  In `candidates.md` §8 (`f-gr`), define the pool sent to `rerank*` as: the `≤ 3` entries admitted by `GATE(3, 0.5)` unioned with the first `K` entries of `L_lex` (capped at `K` by dropping the lowest-ranked entries of `L_lex`), and specify that `PURE` tie-breaks by the `GATE(3, 0.5) + MULT(0.15)` rank order.

---

### A11 — `major` — Undefined tie-breaking and zero-probability handling in Clef/reranker order and `MULT` median break Q8 (`ref-fusion.mjs`)
- **Contract text:**
  - `candidates.md` §2 (lines 78–95): `"Let med and max be the median and maximum of v over E... RRF(lists, pool). For each entry e in the pool, f(e) = Σ_i 1 / (60 + r_i(e)), where r_i is the 1-based rank of e in list i. An absent entry adds no term for that list."`
  - `candidates.md` §5 (lines 202–203, 222, 224): `"The model value is answers.best.probabilities[<option id>]. An option with no returned probability gets 0... <prefix>-k-rrf: RRF([L_lex, Clef order], POOL-L); ... <prefix>-all-rrf: RRF([L_lex, Clef order], POOL-L ∪ POOL-ALL)."`
  - `harness.md` §7.5 (lines 305–308): `"A second, independent implementation of each fusion operator lives in tmp/model-ranking/ref-fusion.mjs... For every row of every lane, its page (ids and order) must equal the candidate's page. One mismatch fails the variant."`
- **Why it is a problem:**
  Three mathematical ambiguities in `candidates.md` will cause either perverse rankings or Q8 mismatches between `ranking.ts` and `ref-fusion.mjs`:
  1. **Zero-probability options in `"Clef order"` for `RRF`:** Clef `choice` typically assigns positive probability to a few options and omits or assigns `0` to the remaining 15–78 options (`candidates.md` §5: `"An option with no returned probability gets 0"`). If options with `probability === 0` are included in `"Clef order"` (list 2 of `RRF`) and tie-broken by `id ascending`, then an alphabetically early entry (e.g. `lumenloop.find_av_passages`) that Clef gave **0 probability** gets rank ~4 in list 2 (`+1/64` RRF boost), outranking entries with real lexical support! And if tie-broken by `L_lex` vs `id`, `ranking.ts` and `ref-fusion.mjs` will diverge unless specified.
  2. **Even-length median `med` in `MULT`:** `|E|` is `80` on `main` and `82` on `fresh` (both even). `candidates.md` §2 does not specify whether `med` for even `N` is `(sorted[N/2 - 1] + sorted[N/2]) / 2` or `sorted[N/2]`.
  3. **Rounding in `MULT(β)`:** `src/catalog/scoring.ts:221,240` rounds lexical scores with `Math.round`. `candidates.md` §2 does not state whether `score × (1 + β · rel(e))` is rounded or kept as IEEE-754 float64 before `preserveStrongBackfill` (`candidate.score >= 1.6 * victim.score`) and `interleaveSelectedPage`.
  4. **`L_ungated` admissibility:** `candidates.md` §1 line 58 says `"every entry of E that the ungated scorer scores and that is not in L_gated. This list ignores fullPageUngatedAdmission."` It does not state that `L_ungated` still enforces `rejectsRoutingIntent` and `admitsWholeSkill` (`src/catalog/search.ts:741-769`), as `scoreCandidates` does when `fullPageUngatedAdmission` is omitted.
- **Smallest amendment:**
  Specify in `candidates.md` §§1–2 and §5:
  1. In `RRF`, `"Clef order"` includes only options with `probability > 0` (options with `probability === 0` are treated as absent from the Clef list), and any tie in `"Clef order"` or `"reranker order"` is broken by `id ascending` (matching `"dense order"` in §3 line 147).
  2. In `MULT`, `med` for even `N` is `(sorted[N/2 - 1] + sorted[N/2]) / 2`, and `score × (1 + β · rel(e))` is kept as float64 (unrounded).
  3. `L_ungated` is `scoreCandidates(catalog, opts, scoreEntryWeightedUngated, query)` minus `L_gated` (preserving `rejectsRoutingIntent` and `admitsWholeSkill`, omitting only `fullPageUngatedAdmission`).

---

### A12 — `minor` — Family `a` validity screen uses strict `legacy` service top-1, which penalizes instruction-tuned models (`a-q3`) that surface `skills` playbooks
- **Contract text:**
  - `candidates.md` §3 (lines 125–126, 150–152): `"I_Q3 = Given a question about the Stellar ecosystem, retrieve the catalog tool or playbook that an agent should use to answer it... Validity screen (not a tune). Before any fused run, compute the dense-only service top-1 on the legacy lane. A model below 150 of 338 is broken for this task... Drop all four of its variants"`
- **Why it is a problem:**
  In `eval/routing-cases.json`, `expected_service` in the 338-row `legacy` lane is *never* `"skills"` (`skills` is only in `expected_any` via `eval/build-question-overlay.json`). Yet `E` contains 15 searchable `skills.*` entries, and `a-q3`'s prompt `I_Q3` explicitly instructs the model to retrieve `"the catalog tool or playbook"`. A model that ranks relevant `skills.*` playbooks at top-1 on legacy build questions gets scored `0` on strict legacy service top-1 in a dense-only run, risking an artificial screen drop below 150.
- **Smallest amendment:**
  In `candidates.md` §3 line 150, compute the dense-only validity screen on `legacy` using `accept-either` (`any1`, which accepts `skills` on overlay build questions) OR filter `E` to `kind: "operation"` for the legacy-only screen.

---

## 3. Measurement Flaws

### A13 — `blocker` — `harness.md` §7.2 defines "Hackathon row" in a way that exempts the canonical non-hackathon interference victim (`q-scf-ecosystem-listing-partner-jobs`)
- **Contract text:**
  - `contract.md` §4 Q4 (lines 96–98): `"Interference does not grow, in either mode: no new (row, operation) pair and no better rank for a hackathon operation on a non-hackathon row"`
  - `harness.md` §7.2 (lines 234–239):
    `"- Hackathon operation: a Scout operation whose terminal name contains hackathon (any case).`
    `- Hackathon row: a row whose question contains the token hackathon or hackathons (any case), or whose expected cards name a hackathon operation."`
- **Why it is a problem:**
  1. Look at `q-scf-ecosystem-listing-partner-jobs` (`eval/routing-cases.json:4596-4601`):
     - `question`: `"How do I get my project listed on the Stellar ecosystem directory, become a partner/service provider or hackathon sponsor, find Stellar/Soroban jobs, and what is the Matching Fund?"`
     - `expected_cards`: `["scout_projects"]`.
     - `.agents/TODO.md:191` explicitly names this exact row as the canonical non-hackathon interference failure (`"Ungraded captures also appeared (getHackathonSubmission first on q-scf-ecosystem-listing-partner-jobs; getHackathon first on q-hist-remittance-corridors)"`).
     - Because the question contains the token `"hackathon"` (`"hackathon sponsor"`), `harness.md` §7.2 classifies `q-scf-ecosystem-listing-partner-jobs` as a **Hackathon row**, completely blinding Q4 to `getHackathonSubmission` or `analyzeHackathonSubmissions` capturing rank 1 on it!
  2. Look at the list of watched hackathon operations in `.agents/rounds/2026-10-28-routing-repair/verify/probes.json:14` and `report-rt-a.md:82`: there are **eight** watched operations (`analyzeHackathonSubmissions`, `getHackathonSubmission`, `reviewSubmission`, `getHackathon`, `getHackathons`, `searchHackathonBuilds`, `compareHackathons`, `hackathonBrief`). Notice that `getHackathonSubmission` and `reviewSubmission`: `reviewSubmission` does **not** contain the substring `"hackathon"` in its terminal name! And what if a future or existing hackathon op is checked? (Though `reviewSubmission` is covered by Q5, `harness.md` §7.2 should name the exact 8 operation IDs).
  3. `harness.md` §7 lines 224–225 says `compare.mjs` `"reads the baseline and candidate result JSON files"` (`eval/run-routing.mjs` outputs). However, `eval/run-routing.mjs:242-249` does **not** write `question` or `expected_cards` into the output JSON for `cases`, `extendedCases`, or `skillsCases`! And `harness.md` §7.2 does not state which lanes (`cases`, `extendedCases`, `skillsCases`, `holdoutCases`) are scanned for the Q4 set.
- **Smallest amendment:**
  In `harness.md` §7.2:
  1. Define *Hackathon operation* by the exact 8-ID set (`scout.analyzeHackathonSubmissions`, `scout.getHackathonSubmission`, `scout.reviewSubmission`, `scout.getHackathon`, `scout.getHackathons`, `scout.searchHackathonBuilds`, `scout.compareHackathons`, `scout.hackathonBrief`).
  2. Define *Hackathon row* strictly by corpus labels/IDs: a row whose `expected_cards` (or `acceptable_cards` in `routing-cases.json`) names a hackathon operation, plus `q-skill-stellar-scout-hackathon` in `skills-cases.json`—**never** by substring matching `"hackathon"` in `question` (or explicitly exclude `q-scf-ecosystem-listing-partner-jobs` from hackathon rows).
  3. Specify that Q4 scans all 532 graded rows (`cases`, `extendedCases`, `skillsCases`, `holdoutCases`) and that `compare.mjs` reads `eval/routing-cases.json`, `eval/skills-cases.json`, and `eval/holdout-cases.json` for row metadata.

---

### A14 — `major` — Fresh-source rebuild in `harness.md` §3 has no pinned manifest SHA-256 and conflicts on `ecosystem-skills/MANIFEST.json`
- **Contract text:**
  - `harness.md` §3 (lines 46–57): `"fresh. Clone at e530c7f4, then apply the frozen fresh inputs that rt-c used: inventory/stellar-light.json at Scout 1.9.111; the 682-title inventory/stellar-docs-titles.json; the stellar-light skill pin 789c9061... The coordinator supplies the three inventory and pin inputs from the ignored archive eval/results/2026-10-28-routing-repair-evidence.tar.gz in the main checkout... Rebuild the catalog. Record the manifest SHA-256 in the report."`
- **Why it is a problem:**
  1. On `e530c7f4`, `ecosystem-skills/MANIFEST.json` is a single file holding pins for all four skill repos (`lumenloop`, `openzeppelin-stellar`, `stellar-dev` at `cac64041`, and `stellar-light` at `9f77b3f9`). In `eval/results/2026-10-28-routing-repair-evidence.tar.gz`, `ecosystem-skills/MANIFEST.json` has the 2026-10-28 pins for *all* skill repos (predating the 2026-11-02 merge of `1539a872` noted in `eval/gates.json:54`). Overwriting `ecosystem-skills/MANIFEST.json` from the archive reverts `stellar-dev` and `openzeppelin-stellar` too; whereas splicing only the `stellar-light` source block produces a different manifest; and `report-rt-b.md:20-22` kept `9f77b3f9`.
  2. Because `harness.md` §3 does not pin the expected `catalog/manifest.json` SHA-256 for `fresh` (unlike `main`'s `f018b979…1534`), different lanes (`h-core`, `h-capture`) can build byte-different `fresh` manifests (and therefore different entry/pool SHA-256 keys!) while still matching the coarse 16-number reproduction table.
- **Smallest amendment:**
  Have the coordinator build `src/fresh/catalog/manifest.json` once before any lane starts, specify whether only the `sources[id="stellar-light"]` object in `ecosystem-skills/MANIFEST.json` is replaced with `789c9061`, and pin the exact 64-hex SHA-256 of the resulting `fresh` `catalog/manifest.json` in `harness.md` §3.

---

### A15 — `major` — R3 relies on `--dump-ranked`, which omits all 49 `holdout` rows and all non-ID `SearchPage` fields
- **Contract text:**
  - `contract.md` §5 R3 (lines 153–155): `"Fallback mode returns exactly the baseline lexical page. The harness proves this with an empty --dump-ranked diff between the baseline and the candidate in fallback mode, on both sources."`
  - `harness.md` §7.6 (lines 315–316): `"R3: run --mode fallback --dump-ranked. Diff against the baseline dump. The diff must be empty on both sources."`
- **Why it is a problem:**
  Look at `eval/run-routing.mjs:461-466`:
  ```js
  for (const r of [...perCase, ...extendedPerCase, ...skillsPerCase, ...protocolHistoryPerCase]) {
    ranked[r.id] = r.topHits.map((h) => h.id);
  }
  ```
  1. `holdoutPerCase` (49 rows) is **completely omitted** from `--dump-ranked`!
  2. `--dump-ranked` records only the top-5 `hit.id` strings. It does not check `score`, `tier`, `total`, `truncated`, `widerCandidates`, `confidence`, or `recoveryMetadata`. A candidate that mutates any of those fields or changes holdout rankings in fallback mode passes R3's `--dump-ranked` diff with zero differences.
- **Smallest amendment:**
  In `harness.md` §7.6 and `contract.md` §5 R3, require the fallback identity check to assert deep equality of the full `searchCatalogPage(catalog, opts)` return object across all 544 corpus rows (including `holdoutCases`), all probe queries, and `limit` values `5` and `10`.

---

### A16 — `major` — R6a allows up to 1% invalid/error outputs per repeat to fall back to baseline and be committed into the CI fixture
- **Contract text:**
  - `contract.md` §5 R6a (lines 185–187): `"An invalid model output (bad shape, wrong dimension, non-finite number, or zero valid ids) gives fallback mode for that query. The invalid-output rate over each repeat must be at most 1%. The harness grades those queries in fallback mode."`
  - `harness.md` §5 (lines 178–179): `"Retry once, after 2 s, on HTTP 429 or 5xx. A second failure records status: 'error'. The harness grades that query in fallback mode and counts it under R6a."`
  - `contract.md` §5 R10 (line 218): `"A missing key in CI is a hard failure, never a silent fallback."`
- **Why it is a problem:**
  1. In `harness.md` §4.3 (line 151), the fixture schema only lists `"status": "ok|invalid"`, omitting `"error"`.
  2. For dense variants (Families `a`, `b`), if 1 of the 82 **entry vectors** has `status: "invalid"` or `"error"`, what happens? Every single query needs all 82 entry vectors! One invalid entry vector breaks assisted mode for all 544 queries, or silently drops that catalog entry from `E`.
  3. On query calls, allowing up to 1% (~5–8 queries) to be graded in fallback mode in `eval/ranking-fixture.json` means:
     - a query where the model would have caused a loss is converted into a 0-loss fallback if the model output is invalid or times out;
     - committing that repeat fixture to `eval/ranking-fixture.json` permanently bakes `"status": "invalid"` / `"error"` fallback responses into the offline CI gate!
  4. R6a does not define whether the 1% denominator is per HTTP request (where embeddings are batched up to 100 texts per call in `harness.md` §5 line 180) or per canonical key.
- **Smallest amendment:**
  1. Require `100%` of **entry vectors** (`D(e)`) to have `status: "ok"`.
  2. Define the R6a `≤ 1%` invalid-output rate per unique query-level fixture key (not per batch HTTP call), and require that any query key in the committed `eval/ranking-fixture.json` must have `status: "ok"` (if a passing candidate had `≤ 1%` transient `error` keys during capture, those specific keys must either be re-captured to `ok` and re-verified under Q1–Q10, or `status: "invalid"` must be 0% for deterministic models in families `a`, `b`, `d`).

---

### A17 — `major` — R6 cost estimation in `harness.md` §6 undercounts cross-encoder (`bge-reranker-base`) tokens and conflates the mean and worst-case ceilings
- **Contract text:**
  - `contract.md` §5 R6 (lines 175–180): `"List-price model cost is at most USD 1.00 per 1,000 search calls. The harness computes it from the measured token usage of the corpus queries: mean cost per call × 1.5 safety factor × 1,000... That cap must make the worst-case cost of one call at most USD 0.003, at any allowed limit."`
  - `harness.md` §6 (lines 199–200, 217–220): `"Otherwise estimate input tokens as ceil(chars / 3) of the canonical body's text fields, the conservative rt-b rule... Also compute the worst-case call: the longest canonical query (512 characters) with the largest pool at limit: 50. Report both. The R6 ceiling applies to both values."`
- **Why it is a problem:**
  1. For `@cf/baai/bge-reranker-base` (Family `d`), the request JSON is `{ query: q, contexts: [{ text: C_300(e) }, ...] }`. A cross-encoder pairs and tokenizes `(query, context_i)` for **each** of the `N` contexts (`N = 20` or `82`), so the query `q` is processed `N` times, not once. Estimating tokens as `ceil(chars / 3)` of the JSON body's text fields counts `query` only once, undercounting query tokens by `(N - 1) × ceil(query.length / 3)` (up to `81 × 171 = 13,851` tokens on a 512-char query with `POOL-ALL`).
  2. `harness.md` §6 line 220 says `"The R6 ceiling applies to both values"`, which conflates the two distinct R6 ceilings in `contract.md` (`USD 1.00 per 1,000 calls` for `mean × 1.5 × 1,000` vs `USD 0.003 per call` = `USD 3.00 per 1,000 calls` for the single worst-case call at `limit: 50`).
  3. In `candidates.md` §5 line 226 and §9 line 313, `c-cl-all-*`'s 20-query usage sample does not fix which 20 queries are sampled. Choosing 20 short queries biases the token count downward.
- **Smallest amendment:**
  1. For cross-encoder rerankers when `usage` is not reported, estimate input tokens as `Σ_{i=1..N} ceil((query.length + context_i.length) / 3)`.
  2. Clarify in `harness.md` §6 line 220 that `mean × 1.5 × 1,000 ≤ USD 1.00` and `worstCaseCall(limit=50) ≤ USD 0.003`.
  3. Fix the 20-query usage sample in `candidates.md` §9 stop rule 1 to the 20 longest questions in `eval/routing-cases.json` (or a fixed deterministic seed over all 544 rows).

---

### A18 — `major` — Latency probe (R7, `harness.md` §8) measures warm back-to-back model wait only, ignoring cold/idle gaps and double lexical execution in `runtime-design.md` §1
- **Contract text:**
  - `contract.md` §5 R7 (lines 189–198): `"The added latency is the wall time from the start of model work to evidence-ready, measured inside a Worker on the Cloudflare network... p50 added ≤ 150 ms; p95 added ≤ 400 ms"`
  - `harness.md` §8 (lines 349–355): `"Each window sends at least 200 calls, one at a time, in random order with a fixed seed... Lexical time is not part of 'added' latency."`
  - `runtime-design.md` §1 (lines 14–26):
    `"├─ pure: rankingPool(catalog, opts, variant) ← only for pool-dependent variants`
    `├─ host: evidence = await rankingEvidence(ctx, catalog, opts, pool) ← the only I/O`
    `└─ pure: searchCatalogPage(catalog, opts, evidence ? { variant, evidence } : undefined)`
    `For dense variants, the query embedding starts before any lexical work, because it depends only on the query. The synchronous lexical stage then runs while the request waits."`
- **Why it is a problem:**
  1. **Contradiction in `runtime-design.md` §1:** Because `searchCatalogPage` is synchronous and takes `evidence` as an argument *after* `await rankingEvidence(...)` resolves, the synchronous lexical stage does **not** run while the request waits for the embedding I/O—it runs *after* `await rankingEvidence` completes! Conversely, for pool-dependent variants (Families `c`, `d`, `f`), `rankingPool` runs `lexicalLists(catalog, opts)` *before* `rankingEvidence`, and then `searchCatalogPage` runs `lexicalLists(catalog, opts)` a **second time** after `rankingEvidence` (unless precomputed `lexicalLists` are passed through).
  2. **Unmeasured CPU & serialization overhead:** For `POOL-ALL` (`82` cards × `300` chars) or `1024`-dim embeddings (`82` cosines), request construction, JSON serialization, base64/float decoding, and fusion add CPU time on the search path that `Date.now() - t0` around `env.AI.run` alone excludes.
  3. **Zero-gap sequential probing masks cold/idle latency:** Sending 200 calls back-to-back with 0 ms pause from one host keeps the single nearest colo's GPU worker and AI Gateway connection hot for the entire burst, masking first-call / idle-period latency spikes that real intermittent MCP traffic hits.
- **Smallest amendment:**
  1. In `runtime-design.md` §1–2, compute `lexicalLists` once per search request: for dense variants, start the `rankingEvidence` promise first, run `lexicalLists` synchronously while it is in flight, then `await` the promise and fuse; for pool-dependent variants, pass the already-computed `lexicalLists` from `rankingPool` into `searchCatalogPage` so lexical scoring never runs twice.
  2. In `harness.md` §8, measure `Date.now() - t0` across the entire added ranking path (request building + `env.AI.run` + validation + fusion), include the first call of each window (cold/unwarmed) in the sample, and space at least 20 calls per window by `≥ 5 s` idle intervals to sample non-burst latency.

---

### A19 — `minor` — Probe Runner (Q6, Q7) and Q11 (`eval:protocol-history`) have missing entry-key and exit-code specifications
- **Contract text:**
  - `contract.md` §4 Q11 (lines 136–137): `"Run npm run eval:protocol-history. It is a diagnostic. Record source-expired or the counts."`
  - `contract.md` §5 R10 (lines 215–218): `"The fixture covers every query that CI grades or tests: the routing corpus, skills, holdout, protocol history, the acceptance probes, the G10 probe, the drift-141 fixture, and every unit test that runs assisted search. Entry-side vectors use the same key over the entry text. A missing key in CI is a hard failure"`
  - `harness.md` §7.4 (lines 270–301): `"Port the check logic from .agents/rounds/2026-10-28-routing-repair/impl/acceptance.mjs into tmp/model-ranking/probes.mjs. Call the variant's search function with the fixture... Every probe query joins the fixture key set, so assisted mode can run it."`
- **Why it is a problem:**
  1. In `acceptance.mjs`, Check 6 (`lines 114-125`) constructs three **synthetic catalogs** with entries `scout.weak0`..`scout.weak4` (under three different descriptions) and `docs.walletDapp`, and Check 8 / Q6 (`test/drift-141-routing.test.ts:17`) injects `rwaEntry` (`scout.getRwaAssets`) into `rwaCatalog`. None of those synthetic/injected entries are in `catalog/manifest.json` (`E`). If `probes.mjs` calls assisted `searchCatalogPage` on Check 6 or Q6 without embedding those synthetic entries and capturing pool-dependent Clef/reranker responses for `rwaCatalog` and the three Check 6 synthetic catalogs, `--fixture` will throw a missing-key error!
  2. Conversely, Check 5 (`acceptance.mjs:107-112`) and G10 (`harness.md` §7.4 lines 295–300) call `scoreEntryWeighted`, `scoreEntryWeightedUngated`, and `explainEntryScore` directly on the lexical scorer, not `searchCatalogPage`, so capturing model query fixtures for the 42 G10 queries is unused unless `searchCatalogPage` is also called.
  3. `npm run eval:protocol-history` (`eval/run-protocol-history.mjs:61-70`) checks the pinned v2 epoch (`4cd28f4b…fe8b`) *before* calling `searchCatalog`, prints `source-expired`, and exits with `process.exitCode = 1`. Meanwhile, `eval/run-routing.mjs:359` runs the v1 `eval/protocol-history-cases.json` diagnostic (12 cases). R10 says `"protocol history"` without specifying that the fixture covers the 12 queries in `eval/protocol-history-cases.json` (and that `eval:protocol-history` exiting `1` with `source-expired` is expected in Q11).
- **Smallest amendment:**
  In `harness.md` §7.4 and `contract.md` R10:
  1. Explicitly include `rwaEntry` (`test/fixtures/rwa-routing.ts`) and Check 6's synthetic entries (`scout.weak0`..`4` and `docs.walletDapp`)—plus pool-dependent calls over `rwaCatalog` and Check 6's synthetic catalogs—in the fixture key set.
  2. Clarify that R10's `"protocol history"` refers to `eval/protocol-history-cases.json` (12 queries graded by `eval/run-routing.mjs`), and that `npm run eval:protocol-history` exiting `1` with `source-expired` satisfies Q11.

---

## 4. Runtime, Safety, and CI Determinism Gaps

### A20 — `blocker` — CI never runs `test/drift-141-routing.test.ts`, `test/search.test.ts`, or Q7 probes in assisted mode
- **Contract text:**
  - `contract.md` §4 Q6 (lines 105–108): `"The four RWA discovery positives and the ordinary negatives in test/drift-141-routing.test.ts stay vetoes... If a candidate makes a mixed control pass, its it.fails marker fails. The shipping change then removes only that marker"`
  - `contract.md` §5 R10 (lines 215–218): `"The fixture covers every query that CI grades or tests: the routing corpus, skills, holdout, protocol history, the acceptance probes, the G10 probe, the drift-141 fixture, and every unit test that runs assisted search."`
  - `runtime-design.md` §2 (lines 35–37): `"src/catalog/search.ts: searchCatalogPage(catalog, opts, ranking?) and searchCatalog(catalog, opts, ranking?). With no ranking, the code is the baseline path and the result is the fallback page (R3)."`
- **Why it is a problem:**
  Look at `test/drift-141-routing.test.ts:20` and `test/search.test.ts`: every test calls `searchCatalog(source, { query, limit: 5 })` **with two arguments** (no third `ranking` argument).
  Under `runtime-design.md` §2 (`"With no ranking, the code is the baseline path and the result is the fallback page"`):
  1. `test/drift-141-routing.test.ts` in `npm test` **only ever runs fallback mode (the unchanged baseline scorer)**! It never runs assisted mode! Therefore:
     - Even if the winning candidate makes a mixed control pass in assisted mode, `it.fails` in `test/drift-141-routing.test.ts` will **not** fail in `npm test` (and if the author removes `it.fails` per Q6, `npm test` will **fail** because `test/drift-141-routing.test.ts` runs fallback mode!).
     - Even worse, CI will never gate the RWA discovery positives or ordinary negatives (`test/drift-141-routing.test.ts:162-183`) in assisted mode!
  2. Likewise, none of the ~100 routing quality and contract tests in `test/search.test.ts` will run in assisted mode in CI unless a test suite explicitly loads `eval/ranking-fixture.json` and `catalog/ranking-vectors.json` and passes `ranking` to `searchCatalogPage`.
- **Smallest amendment:**
  In `runtime-design.md` §7–8 and `contract.md` Q6/R10:
  1. Keep `test/drift-141-routing.test.ts` untouched (testing fallback mode, where `it.fails` stays), AND add a committed CI test file `test/ranking-assisted.test.ts` that runs the RWA positives, RWA ordinary negatives, Checks 1–6 (with Check 4 diagnostic), the G10 probe, and the `drift-141` 8 attributed rows in **assisted mode** using `eval/ranking-fixture.json` (and `catalog/ranking-vectors.json`).
  2. Remove the instruction in Q6 to edit `it.fails` in `test/drift-141-routing.test.ts` (since `drift-141-routing.test.ts` tests two-arg fallback `searchCatalog`, which is unchanged by R3).

---

### A21 — `major` — Caller identity is not threaded to MCP `search` or `codemode.search` for `SEARCH_RANKING_LIMITER`, and `test/smoke` has `remoteBindings: false`
- **Contract text:**
  - `runtime-design.md` §5 item 3 (lines 118–122): `"Per-caller rate limit. A Workers Rate Limiting binding, SEARCH_RANKING_LIMITER, keys on the caller: the OAuth subjectHash, the API-key name, or the Playground subject. It allows 120 assisted searches per 60 s per key. codemode.search inside execute uses the caller of that execute."`
  - `runtime-design.md` §5 item 4 (lines 123–125): `"Per-execute cap. One execute call gets at most 8 assisted codemode.search calls. Later calls in the same execute use fallback mode."`
  - `runtime-design.md` §2 (lines 47–50): `"RankingOutcome is { mode: 'assisted' | 'fallback'; reason?: 'timeout' | 'error' | 'invalid' | 'budget' | 'rate-limit' | 'off'; ... }"`
- **Why it is a problem:**
  1. **Missing caller identity in `src/mcp/tools.ts` and `src/executor/run.ts`:**
     - In `src/server.ts:110-118`, `registerTools(server, options)` does not pass `env`, `subjectHash`, `apiKeyName`, or `accessContext` to the MCP `search` tool handler.
     - In `src/server.ts:76-83`, `resolveArtifactOwner` returns `undefined` for `api-key` callers, so `ExecuteCallContext` (`src/executor/run.ts:103-108`) has **no caller key** for `api-key` callers inside `codemode.search`.
     - What is the rate-limit key when `accessContext.mode === "dev-bypass"` or when an OAuth token has no `subject` (`subjectHash === null`)? If it is a shared constant or `null`, either one unauthenticated/missing-subject caller exhausts the bucket for others or bypasses rate limiting.
  2. **Per-execute cap reason & alert skew:** When the 9th `codemode.search` inside one `execute` uses fallback mode (`runtime-design.md` §5 item 4), `RankingOutcome.reason` has no `"execute-cap"` value. If it logs `"rate-limit"` or `"budget"`, a single agent script looping over `codemode.search` 50 times in one `execute` will push the hourly fallback rate above the 5% alert threshold (`runtime-design.md` §6 line 152) even when Workers AI is completely healthy.
  3. **`test/smoke/vitest.config.ts` compatibility:** `test/smoke/vitest.config.ts:64` sets `remoteBindings: false` because `"ai": { "binding": "AI", "remote": true }` in `wrangler.jsonc` cannot connect in offline CI. Without a default binding stub or `SEARCH_RANKING_MODE: "lexical"` in `test/smoke/vitest.config.ts`, every existing smoke test that calls `search` will hit an unconfigured `AI` binding.
- **Smallest amendment:**
  1. In `runtime-design.md` §2 and §5, thread `callerKey: string` (`oauth:${subjectHash}`, `api-key:${apiKeyName}`, `demo:${subjectHash}`, or `dev-local`) and `env` into `RegisterToolsOptions` and `ExecuteCallContext`.
  2. Add `"execute-cap"` to `RankingOutcome["reason"]` and `rankingFallbackReason`, and exclude `"execute-cap"` and `"off"` from the 5% hourly health alert query in `runtime-design.md` §6.
  3. In `runtime-design.md` §8, specify that `test/smoke/vitest.config.ts` sets `SEARCH_RANKING_MODE: "lexical"` by default and overrides `env.AI` / `SEARCH_RANKING_MODE: "assisted"` in the dedicated assisted-search smoke tests.

---

### A22 — `major` — `caches.default` synthetic URL lacks a schema/model version prefix and `ctx.waitUntil` non-blocking write rule
- **Contract text:**
  - `runtime-design.md` §4 (lines 87–95): `"Query cache. Two layers, both keyed by the harness key (sha256(modelId + '\u0000' + canonicalBody)): 1. an in-isolate LRU of 512 records; 2. the Workers Cache API (caches.default) on the canonical host, with a synthetic URL that holds only the key, and a 7-day TTL... A cache record holds only the model output (vector or scores)."`
  - `runtime-design.md` §6 (lines 145–151): `"rankingModelMs: wall time of model work, or null on a cache hit... The existing ms field keeps the whole search time, so ms − rankingModelMs gives the lexical share."`
- **Why it is a problem:**
  1. **Cache format versioning:** The Cache API URL keys only on `sha256(modelId + "\u0000" + canonicalBody)` with a 7-day TTL. If a deploy changes the cached record wire format or output validation rules without changing `modelId`, isolates in the same colo will read stale/incompatible 7-day cache entries and either fail validation (falling back on every cached query for 7 days) or misparse outputs.
  2. **Critical-path latency & error safety:** `caches.default.put` is asynchronous I/O and can throw in non-standard environments. `runtime-design.md` §1 and §4 do not specify that `caches.default.put` must be scheduled via `ctx.waitUntil(...)` (off the critical search path) and that `caches.default.match`/`put` errors must be caught and treated as a cache miss.
  3. **In-isolate cache hits inside `execute`:** `runtime-design.md` §4 line 95 says `"A cache hit still counts toward the per-caller rate limit"`, which is right for `SEARCH_RANKING_LIMITER`, but if an `execute` script calls `codemode.search` with an identical query (hitting the in-isolate LRU), counting it against the 8-call per-execute cap (`§5 item 4`) penalizes zero-cost in-memory hits.
  4. **Telemetry math (`ms - rankingModelMs`):** On a `"colo"` cache hit (`caches.default.match`), `rankingModelMs` is `null`, yet `caches.default.match` takes 1–15 ms of I/O time, so `ms - rankingModelMs` is undefined or conflates Cache API I/O with lexical CPU time.
- **Smallest amendment:**
  1. Version the synthetic Cache API URL as `https://raven.stellar.org/_internal/ranking-cache/v1/<key>`, validate cached records with the same output validator on read (evicting/ignoring invalid cached records as a cache miss), and run `caches.default.put` inside `ctx.waitUntil` with `.catch(() => {})`.
  2. Count only cache misses (or colo lookups) against the 8-call per-execute cap, and record `rankingModelMs` as the total `rankingEvidence` wall time (including `caches.default.match` on `"colo"` hits, `0` on `"isolate"` hits).

---

### A23 — `minor` — Recursive `deriveServiceFilterExcludedSkillAdvisories` call in `searchCatalogPage` is unspecified under assisted mode
- **Contract text:**
  - `runtime-design.md` §2 (lines 35–36): `"src/catalog/search.ts: searchCatalogPage(catalog, opts, ranking?) and searchCatalog(catalog, opts, ranking?)."`
- **Why it is a problem:**
  In `src/catalog/search.ts:1281,1298-1328`, when `opts.service` is defined and not `"skills"`, `searchCatalogPage` calls `deriveServiceFilterExcludedSkillAdvisories`, which recursively calls `searchCatalogPage(catalog, { query: opts.query, kind: "skill", service: "skills", limit: 3 })` with **two arguments** (no `ranking`).
  - For dense variants (Families `a`, `b`), skill vectors are already in memory (`catalog/ranking-vectors.json`), and the query vector is already computed, yet the two-argument recursive call drops `ranking` and uses baseline lexical scoring (or if `ranking` were passed, for pool-dependent variants `c`, `d`, `f`, the outer `rankingPool` was filtered to `opts.service` and contains no skills, so passing `ranking` would fail or have zero scores for skills).
- **Smallest amendment:**
  Explicitly state in `candidates.md` §1 and `runtime-design.md` §2 that `deriveServiceFilterExcludedSkillAdvisories` always calls two-argument `searchCatalogPage` (lexical-only advisory), so it never requires a second model call or skill pool scores when `opts.service` is set.

---

## 5. Missing Coverage for Owner Goals ("fast, actually improves things, doesn't cost too much per query", "don't overfit for any single case")

### A24 — `major` — Zero evaluation coverage of filtered searches (`service`, `kind`), default `limit: 10`, or short targeted agent queries (`eval:discovery:replay`)
- **Contract text:**
  - `contract.md` §1 (lines 16–21): `"Explore this and explore models... just as long as it's fast, actually improves things and doesn't cost too much per query... We don't need to overfit for any single case or instance."`
  - `contract.md` §4 Q1–Q11 (lines 67–137).
- **Why it is a problem:**
  1. Every single row in `eval/run-routing.mjs` (all 544 rows) calls `searchCatalog(catalog, { query: c.question, limit: 5 })` with a full natural-language question, `limit: 5`, `service: undefined`, and `kind: undefined`.
  2. In actual agent runs (`SEARCH_DESCRIPTION` in `src/mcp/tools.ts:258,269-270`), models are instructed to issue short 2–4 word targeted queries (`"account trustlines"`, `"soroban storage patterns"`), pass `service` and `kind` filters, and use the default `limit: 10`.
  3. As shown in `A4`, normalization and pooling rules (`rel(e)` over `E`, `POOL-K` with `K = 20`) behave completely differently when `service` or `kind` restricts `E` to 12–21 entries or when `limit = 10` changes `serviceQuota(limit)` from `2` to `4` (`src/catalog/scoring.ts:559`).
  4. The repository already has a free offline agent-query replay instrument (`npm run eval:discovery:replay`, `package.json:27`), which is not included anywhere in `contract.md` or `harness.md`.
- **Smallest amendment:**
  Add a required non-regression check in `contract.md` §4 (and `harness.md` §7.4):
  1. Run `npm run eval:discovery:replay` (or a synthetic filtered probe across all four `service` values and both `kind` values at `limit: 10`) in assisted mode and verify no increase in zero-hit or wrong-service pages and no `GATE` admission on negative controls when `service`/`kind` filters are active.

---

## Summary Table of Findings

| ID | Severity | Target File & Section | Core Issue |
|---|---|---|---|
| **A1** | `blocker` | `contract.md` §4 Q3; `harness.md` §7.3 | Class `(m)` tautologically excuses all model-induced losses outside holdout `forbidden_cards` without checking relevance. |
| **A2** | `blocker` | `contract.md` §6, §7; `candidates.md` §8 | Best-of-89 variant selection and post-hoc Family `f` component selection (`dense*`, `rerank*`, `clef*`) maximize over `holdout` and `extended`. |
| **A3** | `major` | `contract.md` §3, §6 | `+10` minimum net gain counts 4 cumulative flips on 1 row and allows 0 gain across all gated lanes (`legacy`, `skills`, `holdout`). |
| **A4** | `blocker` | `candidates.md` §1, §2 | Relative `rel(e)` in `GATE(3, 0.5)` has no absolute similarity floor and bypasses `rejectsRoutingIntent`, admitting noise on gibberish/filtered queries and suppressing `widerCandidates`. |
| **A5** | `blocker` | `candidates.md` §2; `runtime-design.md` §6 | `POOL-ALL` sets `total = 80, truncated = true` on every query; `RRF`/`PURE` keep lexical `score` (`0`) in model order, corrupting `confidence.topScoreGap`. |
| **A6** | `major` | `contract.md` §5 R13; `harness.md` §5, §6, §7.6 | Q9 and R6 run only on Repeat 1 even when Repeat 2 is chosen; combined Q-score can pick the higher `main` repeat; `cache-r2/` can be re-captured. |
| **A7** | `major` | `contract.md` §4 Q7, §5 R3 | Family `b` reverts to the broken baseline lexical scorer on fallback and in 2-arg `searchCatalog()`, so it cannot close the lexical TODO item. |
| **A8** | `blocker` | `contract.md` §6; `runtime-design.md` §7; `eval/run-routing.mjs:420` | `eval/run-routing.mjs --gate` enforces a two-sided `±3` ceiling on `legacy`, rejecting any candidate that improves `legacy` by `≥ +4`. |
| **A9** | `blocker` | `runtime-design.md` §9 vs `candidates.md` §8 | Proposed `AGENTS.md` rule allows only `"one pinned Workers AI model"`, outlawing two-model Family `f` winners. |
| **A10** | `major` | `candidates.md` §8 (`f-gr`) | `GATE(3, 0.5)` admissions with lexical score `1` sort at the bottom of `L_gated` (`> 20`) and never reach the top-`K` reranker pool in `f-gr`. |
| **A11** | `major` | `candidates.md` §1, §2, §5; `harness.md` §7.5 | Undefined tie-breaking and `0`-probability handling in `"Clef order"`, even-`N` median in `MULT`, float rounding, and `L_ungated` exclusions break Q8. |
| **A12** | `minor` | `candidates.md` §3 | Dense-only legacy strict service top-1 screen penalizes `a-q3` when it surfaces `skills.*` playbooks on overlay build questions. |
| **A13** | `blocker` | `harness.md` §7.2; `contract.md` §4 Q4 | Defining "Hackathon row" by `question` containing `"hackathon"` exempts `q-scf-ecosystem-listing-partner-jobs` (the `.agents/TODO.md:191` victim) from Q4. |
| **A14** | `major` | `harness.md` §3 | `fresh` source rebuild has no pinned `catalog/manifest.json` SHA-256 and leaves `ecosystem-skills/MANIFEST.json` partial-vs-whole replacement ambiguous. |
| **A15** | `major` | `contract.md` §5 R3; `harness.md` §7.6; `eval/run-routing.mjs:464` | `--dump-ranked` omits all 49 `holdout` rows and all non-ID `SearchPage` fields, so R3's diff does not prove fallback identity. |
| **A16** | `major` | `contract.md` §5 R6a, R10; `harness.md` §4.3, §5 | R6a allows up to 1% invalid/error outputs per repeat to fall back (erasing losses) and be committed into `eval/ranking-fixture.json` or break entry vectors. |
| **A17** | `major` | `contract.md` §5 R6; `harness.md` §6; `candidates.md` §9 | Cross-encoder token estimate counts `query` once instead of `K` times; `harness.md` §6 conflates the $1.00/1k and $0.003/call ceilings; 20-query sample is unseeded. |
| **A18** | `major` | `contract.md` §5 R7; `harness.md` §8; `runtime-design.md` §1 | `runtime-design.md` §1 runs lexical after `await rankingEvidence` (or twice for pool variants); probe Worker omits CPU/fusion time and idle gaps. |
| **A19** | `minor` | `contract.md` §4 Q11, §5 R10; `harness.md` §7.4 | `rwaEntry` and Check 6 synthetic entries/catalogs are missing from the fixture spec; `eval:protocol-history` exits `1` before calling `searchCatalog`. |
| **A20** | `blocker` | `contract.md` §4 Q6, §5 R10; `runtime-design.md` §2, §7 | `test/drift-141-routing.test.ts` and `test/search.test.ts` call 2-arg `searchCatalog` (fallback mode), so CI never runs RWA vetoes or unit tests in assisted mode. |
| **A21** | `major` | `runtime-design.md` §2, §5, §6, §8 | Caller identity is not passed to MCP `search` or `api-key` `codemode.search`; per-execute cap lacks a reason enum; `test/smoke` has `remoteBindings: false`. |
| **A22** | `major` | `runtime-design.md` §4, §6 | `caches.default` synthetic URL lacks a format version prefix and `ctx.waitUntil` rule; `ms - rankingModelMs` fails on `"colo"` cache hits (`rankingModelMs = null`). |
| **A23** | `minor` | `runtime-design.md` §2; `src/catalog/search.ts:1312` | Recursive `deriveServiceFilterExcludedSkillAdvisories` call inside `searchCatalogPage` is unspecified in assisted mode. |
| **A24** | `major` | `contract.md` §1, §4 | Zero evaluation of `service`/`kind` filtered searches, default `limit: 10`, or short agent queries (`npm run eval:discovery:replay`). |
