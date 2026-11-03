# Model-assisted search ranking 2026-11-03 — pre-registered acceptance contract

Author: lane b-design (Claude Opus 5.5 high), for the coordinator t16. Written on 2026-11-03,
before any candidate of this round was built or measured. Candidate results must not change this
file. A later change needs a reason that does not depend on a candidate number, and the round
ledger must record it.

Companion files in this folder: [candidates.md](candidates.md) (what to measure),
[harness.md](harness.md) (how to measure), [runtime-design.md](runtime-design.md) (how a winner
ships). This file decides pass or fail. When the files disagree, this file wins.

## 1. Owner input

The owner gave these decisions on 2026-11-03:

- Decision B: "Explore this and explore models like Jev, Clef, Particle-1 as well as other models
  before landing too solidly anywhere but I'm definitely fine adding more improvements and evals
  here just as long as it's fast, actually improves things and doesn't cost too much per query."
  Also: "fine to spend more per query and with parallel execution we may be able to increase
  speed."
- Decision C (standing): "We don't need to overfit for any single case or instance."
- Standing rule: correctness over cost. A deviation from upstream Cloudflare codemode needs
  conviction or a measured win. Upstream `search` is lexical only, so a model layer is a
  deviation. This contract defines the measured win.

## 2. What this round decides, and what it does not

This round decides one question. Can a bounded model call on the `search` path improve ranking
under the rules below? If no candidate passes, nothing ships and the current scorer stays.

A pass does not authorize these items:

- the Scout 1.9.111 absorb, the 973-title Docs absorb, or the close of issue #223;
- the exposure of `GET /api/rwa`, or the close of issue #167;
- the exposure of `reviewSubmission`, `getRwaAssets`, `getQualityReport`, `verifyClaim`, or
  `locateSource`;
- a provider that sends query text outside Cloudflare (see R5);
- a deploy. Shipping also needs the `AGENTS.md` rule change in
  [runtime-design.md](runtime-design.md) section 9, an owner sign-off on that rule, and an
  independent review.

## 3. Definitions

- **Baseline commit.** `e530c7f4c29af1fdad65ce7961f87d9d50d9c2a6` (origin/main on 2026-11-03).
  The manifest SHA-256 is `f018b979…1534`. The 2026-11-02 baselines were taken at `d6ad7350` and
  `35fa569f`. The manifest has changed since then, so this round measures its baseline again.
- **Sources.** Every rule applies on both sources, separately:
  - *main*: the committed manifest at the baseline commit.
  - *fresh*: the frozen archive source of rt-b and rt-c. It uses Scout 1.9.111 and the 682-title
    `inventory/stellar-docs-titles.json`. It exposes `analyzeHackathonSubmissions` and
    `getHackathonSubmission`. It keeps the five G8 operations excluded.
    [harness.md](harness.md) section 3 defines how to rebuild it.
- **Lanes.** legacy (338), extended, skills (23), holdout (49). The lanes never add together.
- **Strict keys.** `top1`, `top3`, `top5`, `cardHit5`. Holdout `cardHit5` equals `top5` and
  counts once. No `any*`, `pass`, or accept-either key counts.
- **W and L.** One false-to-true flip of a strict key is one win. One true-to-false flip is one
  loss. One row can give both.
- **Assisted mode.** The candidate ranks with model evidence. In the harness and in CI, the
  evidence comes from the committed fixture (R10). In production, it comes from the live call.
- **Fallback mode.** The candidate ranks with no model evidence. This is the path after a timeout,
  an error, a budget refusal, or an invalid model output.
- **Repeat.** One complete live capture of model outputs for every fixture key. Each candidate
  gets two repeats, at least one hour apart (R13).
- **Family.** A candidate group in [candidates.md](candidates.md): families a, b, c, d, f, and the conditional tier X. Family e is excluded. A **variant** is one
  fully specified member. Each variant is a separate candidate.

## 4. Quality rules (assisted mode, both sources, both repeats)

These rules carry forward the 2026-11-02 contract, Amendment 1 (G-rules), and Amendment 2
(H-rules). Changes from those texts are marked.

**Q1 (G2).** W − L ≥ 0 inside each lane, on each source, on each repeat.

**Q2 (G3).** No strict metric falls below the remeasured baseline, except holdout top3 and holdout
top5. Each of those two may fall by one, because the committed floor has that slack. Legacy
cardHit5, every extended metric, every skills metric, and holdout top1 may not fall.

**Q3 (G5, extended for model evidence).** Every loss has a machine-readable trace. The trace gives
the query tokens, the per-field lexical contributions, the score deltas, the page-selection stage,
and the model evidence values. Model evidence is the cosine or normalized relevance, the reranker
score, the Clef probability, or the listwise rank. The trace covers the demoted expected entry and
each entry that passed it. The coordinator recomputes the class from the saved trace. A loss has
one of three classes:

- (a) removed spurious lexical evidence (a substring, stopword, short-token prefix, or
  schema-only match that H2 forbids);
- (b) a promoted entry whose new decisive lexical tokens are whole query tokens in its
  description, routing phrase, or operation id;
- (m) *new:* a promoted entry with higher model evidence than the demoted entry. The promoted
  entry is not a forbidden card for that row. It gains no new lexical contribution of the kinds
  in (a).

A loss caused by new spurious lexical evidence fails the candidate. A loss with no class fails the
candidate. Class (m) losses still count in Q1 and Q2.

**Q4 (G7).** Interference does not grow, in either mode:

- no new (row, operation) pair and no better rank for a hackathon operation on a non-hackathon row;
- the same rule for `locateSource` while it is excluded (the set stays empty);
- holdout forbidden captures do not rise above the remeasured baseline count.

**Q5 (G8).** The exposed operation set does not change. `reviewSubmission` never appears in a
top five on either source.

**Q6 (G9).** The four RWA discovery positives and the ordinary negatives in
`test/drift-141-routing.test.ts` stay vetoes. The three mixed controls are diagnostics. That file
is frozen: no candidate edits it. If a candidate makes a mixed control pass, its `it.fails`
marker fails. The shipping change then removes only that marker, with the trace as the reason.

**Q7 (probes; replaces A1 and G10 for this round).** Use the 2026-10-28 acceptance checks 1–6
(H1: check 4 is a diagnostic) and the G10 synthetic probe under H2 scope (42 comparisons).
Two rules apply:

- *Non-regression, every candidate.* No required probe that passes on the baseline fails. The
  G10 pass count does not fall below the remeasured baseline count. The G10 probe is the rebuilt
  set in [harness.md](harness.md) section 7.4 (14 token pairs × 3 base queries = 42 comparisons).
  rt-c's lane-local set is not kept, so its 12 of 42 is context, not the baseline.
- *Full pass, lexical changes only.* A candidate that changes lexical matching (family b) must
  pass checks 1, 2, 3, 5, and 6, and every G10 comparison, in assisted mode. It claims to fix
  those defects, so it must fix them.

A candidate that leaves lexical matching unchanged does not close the TODO item "Preserve
structured routing intent across extraction caps and gate tiers". The ledger must say so.

**Q8 (G11).** In fallback mode, the G11 page-fill invariant holds. In assisted mode, every change
to page membership or order must come from the declared fusion rule. The harness checks this
against a reference implementation of that rule ([harness.md](harness.md) section 7.5).

**Q9 (G12).** Measure each passing candidate once with
`SKILL_DESCRIPTION_OVERRIDES["skills.stellar-dev.dapp"]` removed. If a graded page changes, the
candidate fails. No new override is allowed.

**Q10 (G15).** A unit test changes only when it asserts an old page or score that a Q3 trace
explains. The `getRfps` schema-admission witness and the RWA tests do not change under this rule.

**Q11 (protocol history).** Run `npm run eval:protocol-history`. It is a diagnostic. Record
`source-expired` or the counts. It does not decide this round.

## 5. Runtime rules (replace G13)

A model call on the search path is allowed only when every rule below holds.

**R1. Purity.** `searchCatalogPage` and `searchCatalog` stay pure, synchronous functions with no
I/O. Model evidence enters as an optional input value. The host adapter makes the model call
before or between pure stages. [runtime-design.md](runtime-design.md) section 2 gives the seam.

**R2. Timeout and fallback.** The adapter enforces one hard timeout on all model work for one
search request: **T = 500 ms** wall time from the first model request. After T, after an error,
after a budget refusal, or after an output that fails validation, the adapter uses fallback mode.
It does not wait for, retry, or merge a late result. The timeout value is a code constant. It is
not a per-request input.

**R3. Fallback identity.** Fallback mode returns exactly the baseline lexical page. The harness
proves this with an empty `--dump-ranked` diff between the baseline and the candidate in fallback
mode, on both sources. The fallback must also pass `npm run eval:routing -- --gate` on the
unmodified fallback gate profile ([runtime-design.md](runtime-design.md) section 7). A family b
lexical change therefore applies only in assisted mode.

**R4. Sandbox isolation.** `globalOutbound` stays `null`. The sandbox receives no binding, model
id, vector, or model score. `codemode.search` keeps running host-side, so it can use the same
evidence path under the same budget.

**R5. Data location.** A shippable candidate uses only a Workers AI model through the Worker `AI`
binding. Query text stays inside Cloudflare.

**R5a. Conditional external tier (tier X).** External decision models (TypeSafe Jev 1.14,
`perplexity/pplx-decider-v1.2`, and other OpenRouter Decisions API models) run only when the
coordinator records that every Cloudflare-hosted variant failed or stopped. They then need a
coordinator-signed key and sub-cap. They are measured under every Q and R rule except R5. A
passing tier X variant does not ship in this round. It becomes evidence for an owner decision. To
ship one later needs that decision, counsel review of the data transfer, and a new host-side
secret. Small generative LLMs, including Particle-1, are not on the search path in this round
([candidates.md](candidates.md) section 7).

**R6. Cost ceiling.** List-price model cost is at most **USD 1.00 per 1,000 search calls**. The
harness computes it from the measured token usage of the corpus queries: mean cost per call × 1.5
safety factor × 1,000. The usage is the model's reported `usage` when present, else the
harness tokenizer estimate from [harness.md](harness.md) section 6. The input is capped by
construction (fixed k, fixed card length, query truncation). That cap must make the worst-case
cost of one call at most **USD 0.003**, at any allowed `limit`. A query-result cache hit counts
as a full-price call in this computation. Provider prompt-prefix caching counts only at the cached
share that the `usage` of the repeat captures reports. With no such report, all input tokens count
at the uncached price.

**R6a. Output validity.** An invalid model output (bad shape, wrong dimension, non-finite number,
or zero valid ids) gives fallback mode for that query. The invalid-output rate over each repeat
must be at most **1%**. The harness grades those queries in fallback mode.

**R7. Latency ceiling.** The added latency is the wall time from the start of model work to
evidence-ready, measured inside a Worker on the Cloudflare network
([harness.md](harness.md) section 8). Gate on cache misses only:

- p50 added ≤ **150 ms**;
- p95 added ≤ **400 ms**;
- the timeout rate (calls longer than T) ≤ **1%**.

The sample has at least 400 calls from the corpus queries, in at least two windows at least one
hour apart. Each window must pass by itself. Host-side REST timing from a laptop is a screen only.
It never passes R7.

**R8. Pinned model.** The candidate names an exact Workers AI model id, never an alias. It names
the output dimension (embeddings), the output shape, and every request parameter: instruction or
prefix text, pooling, temperature, `max_tokens`, reasoning mode, and JSON schema. The entry
vectors and the fixture key on that model id. A model id change is a new candidate, not a refresh.

**R9. No exceptions.** No per-query, per-operation, per-service, or per-lane fusion weight,
prompt, threshold, or rule. No question text in a prompt except the caller's query. No new
`SKILL_DESCRIPTION_OVERRIDES` entry. No label, expected-answer, floor, or ceiling change to hide a
loss. Every constant is declared in [candidates.md](candidates.md) before the first run. No
constant changes after a result is read. A new constant is a new variant, and it needs a written
reason that does not depend on a result.

**R10. CI determinism.** The routing gate runs offline. It reads a committed, script-generated
fixture of model outputs. Each record has the key `sha256(modelId + "\u0000" + canonical input)`
and stores the model output. The fixture covers every query that CI grades or tests: the routing
corpus, skills, holdout, protocol history, the acceptance probes, the G10 probe, the drift-141
fixture, and every unit test that runs assisted search. Entry-side vectors use the same key over
the entry text. A missing key in CI is a hard failure, never a silent fallback. One script
generates the fixture through the host-side `cf` login, and CI never calls a model. The fixture
SHA-256 and the model id join the `eval/gates.json` evidence inputs.

**R11. Budget enforcement.** The runtime enforces the budget on the host, as
[runtime-design.md](runtime-design.md) section 5 defines. Budget exhaustion gives fallback mode,
never an error, and never a page with partial evidence.

**R12. Observability.** Every search event records the ranking mode, the fallback reason, the
model id, the model wall time, the cache result, and the input token count. It never records
query text, vectors, or model outputs ([runtime-design.md](runtime-design.md) section 6).

**R13. Repeat stability.** Each candidate captures two repeats. Every Q rule must pass on each
repeat fixture by itself. A candidate fails when its two repeats differ by more than **5**
strict-key flips on either source. For embeddings, the cosine between repeat vectors of the same
text must be at least 0.999. The gate fixture is the repeat with the lower Q score (section 6).

## 6. Choosing among passing candidates

Compute these values for each passing candidate:

- **Q score.** The sum over lanes and both sources of (W − 2L) on strict keys. Use the repeat
  with the lower value. A loss weighs twice a win, so churn costs more than it gains.
- **Net gain.** The sum over lanes of W − L, on each source separately.
- **Latency.** The p95 added latency from R7.
- **Cost.** The USD per 1,000 calls from R6.
- **Diff.** The changed lines under `src/`, without generated files.

**Minimum effect.** A candidate is eligible to ship only when its net gain on *each* source is at
least **+10**. The net gain must also be at least twice its repeat-flip count from R13. A smaller
gain does not pay for a network call on every search.

**Order of preference among eligible candidates:**

1. The higher Q score. A difference of 4 or less is a tie.
2. The lower p95 added latency. A difference of 50 ms or less is a tie.
3. The lower cost per 1,000 calls. A difference of USD 0.10 or less is a tie.
4. The smaller diff.
5. If still tied: the candidate with fewer model calls per search, then the earlier family letter.

A candidate in family b that passes the full Q7 bar wins a tie at step 1 against a candidate that
does not, because it also removes the defect class. This is the only family preference.

If no candidate is eligible, nothing ships. The floors stay, and `.agents/TODO.md` owner decision
B records the measured results.

## 7. Process rules

- The coordinator signs the spend cap in [harness.md](harness.md) section 9 before the first paid
  call. No lane spends more than its sub-cap.
- Lanes measure the baseline first. The baseline must reproduce the reproduction check in
  [harness.md](harness.md) section 3 before a candidate runs.
- Lanes report every declared variant, including variants that fail early. A lane does not drop a
  variant without the stop rule in [candidates.md](candidates.md) section 9.
- Holdout and extended rows are not used to choose constants. Constants are already fixed here.
- An independent review of the winner and of this decision is a completion gate. The reviewer
  differs from the author of the winner and from the coordinator (`AGENTS.md`, "Model routing").

## 8. Timing record

This file and its three companions were written before any candidate of this round was built or
measured. When the author finished, no candidate result existed in this round, and the author had
read no candidate result from this round.

The parallel research lane b-research (Grok 4.7 xhigh) delivered its report while this design was
in progress. It contains no Raven measurement. The coordinator told this lane to fold it in, and
gave three directions: Cloudflare-hosted candidates first; external decision models only if all
Cloudflare rows fail, as a conditional tier; no small LLM on the search path. R5a and
[candidates.md](candidates.md) sections 0 and 7 carry them. Report SHA-256:
`4f367fa8becc62fba5b54ef61ff5484a0a9ee9876bdf6cac7b53a769424c8120`.

Prior evidence that this design uses, all from earlier rounds: the 2026-11-02 round (rt-b dense
diagnostic, rt-c token and schema results) and the external Jev measurement in issue #294
(holdout top1 12 to 36, but forbidden captures 10 to 21, extended top1 93 to 82, and 377 of 792
lists different between repeats).

Model ids and list prices come from `cf ai models list` on 2026-11-03. Request shapes come from
`cf ai get-model-schema` on 2026-11-03.

SHA-256 of the companion files at completion:

| File | SHA-256 |
|---|---|
| `candidates.md` | `2569ebb0cdb52b24c88bbf100a72b4dd50c647536c06acff5741aeba4b17a289` |
| `harness.md` | `17eb69d5ca7b4dfe3c00bc21b4f08c3322658dba183f88c30d031b0350dec378` |
| `runtime-design.md` | `06839d8206fc7dd83e60d3e734581beb75e4ee4c163cd4aa66cc3d89bdf0b2a1` |
| b-research `report.md` (input) | `4f367fa8becc62fba5b54ef61ff5484a0a9ee9876bdf6cac7b53a769424c8120` |

A file cannot hold its own hash. The coordinator records the SHA-256 of this file in the round
ledger when it receives it. Completed 2026-11-03 by lane b-design.

---

## Amendment 1 (2026-11-03, after two pre-measurement attacks; adopted before any candidate was built or measured)

Author: lane b-amend (Claude Opus 5.5 high), for the coordinator t16.

v1 of this file has SHA-256 `0ec05f5fa1850e12000c9947239cb75cb425ee471bcb4be8ece11fcd9930f0c0`. A byte copy is in
`v1/contract.md`. Two independent attacks read v1 before any measurement: Gemini 4 Argon high (A1–A24) and Kimi
K3.1 Pro high (K-01–K-23). [attack-reconciliation.md](attack-reconciliation.md) gives one verdict per finding,
with repo evidence. Each item below rests on a property of a rule or of the repo, never on a candidate number.

Owner direction for this amendment: "fast, actually improves things, doesn't cost too much per query"; "don't
overfit for any single case"; explore before landing. So the amendment cuts the variant count, adds an untouched
confirmation part, and counts improvement in distinct rows.

Supersession: where this amendment and v1 differ, this amendment wins. Every v1 rule that no item names stays in
force. The companions carry the build detail in their own "Amendment 1" sections.

### N1. Primary set and exploratory tier (A2, A4, A10, K-01)

- Only 8 primary variants can ship in this round: P1 `a-bb-mult`, P2 `a-bb-rrf-m10`, P3 `a-bbp-rrf-m10`, P4
  `a-q3-rrf-m10`, P5 `d-k-rrf`, P6 `c-cf-k-rrf`, P7 `c-cl-k-rrf`, P8 `f-dr`. [candidates.md](candidates.md)
  A1.1 fixes each model, request, pool, fusion, and constant. Prior evidence and published defaults chose them.
- P8 uses fixed components: P2's dense form and P5's reranker form. The v1 rule that picks `dense*`, `rerank*`,
  and `clef*` by Q score is withdrawn.
- Every other variant is exploratory ([candidates.md](candidates.md) A1.2). It runs only after the finalist
  record (N2), on development rows only, from the spend reserve. It cannot ship in this round.
- Tier X (R5a) runs only when every primary variant failed or stopped, or the finalist failed confirmation. It
  uses development rows only. It still cannot ship.
- Section 7 "Lanes report every declared variant" now means every primary variant. Exploratory variants are
  reported when they run.

### N2. Development part, confirmation part, and one finalist (A2, K-01)

- [partition.json](partition.json) is a seeded, stratified split of the graded legacy and skills rows.
  [partition.mjs](partition.mjs) regenerates it. Seed: `raven-model-ranking-2026-11-03-A1`. Strata: the row's
  `expected_service`.
  - Development part: 170 legacy rows and 12 skills rows.
  - Confirmation part: 168 legacy rows and 11 skills rows.
  - Gate-only lanes: extended (122), holdout (49), and protocol history (12). They never enter a score, a
    ranking, or a component choice.
- **Development.** Candidates are graded on the development part only. The runner skips confirmation rows and
  gate-only lanes for every candidate. Probes (Q5, Q6, Q7), fallback identity (N7), and the slices that are not
  graded rows (N8: S4, S5) run in development, as vetoes only.
- **Finalist record.** The finalist is the first eligible primary variant in the section 6 order, computed on
  development values. Before any confirmation run, the coordinator writes to the round ledger: the finalist,
  the full development order with each tie-break step, and the SHA-256 of every development report.
- **Confirmation.** Only the finalist runs. Every Q rule applies on the confirmation part and on each gate-only
  lane, on both sources and both repeats. The N4 confirmation test applies.
- If the finalist fails confirmation, nothing ships in this round. There is no second finalist. The ledger
  records the development order as evidence for a later round.
- After confirmation, the confirmation part is no longer untouched. A later round draws a new partition with a
  new seed.
- Q rules per part: Q1 holds per lane and part (development legacy, development skills, confirmation legacy,
  confirmation skills, extended, holdout). Q2 holds per lane and part against the baseline value on the same
  rows. The holdout top3 and top5 slack of one stays. Q3 and Q4 cover every graded row of the phase.

### N3. Loss classes (replaces class (m) of Q3; A1, K-03, K-04)

- **Demoted entry and promoters.** For a service top-k loss: the demoted entry is the highest baseline hit of
  the expected service in the first k. The promoters are the candidate's first-k hits that were not in the
  baseline's first k. For a `cardHit5` loss: the demoted entry is the highest baseline top-five hit that matches
  an expected card. The promoters are the candidate's top-five hits that were not in the baseline top five.
- **Class (m′), label-relevant.** Every promoter meets three conditions. It is not a forbidden card for the row.
  It gains no contribution of a class (a) kind. Its service is in the row's accept-either union
  (`expected_service`, `expected_any`, and the overlay), or it matches an expected card of the row by
  `cardMatches`.
- **Class (u), model-unexplained.** Every promoter gains no contribution of a class (a) kind, but at least one
  promoter fails the label test.
- **Cap.** A (u) loss does not fail Q3 by itself. On each source and repeat, at most 2 rows may hold a (u) loss
  in the development part. The same cap of 2 applies to the confirmation part, and 2 to the gate-only lanes
  together. Above a cap, the candidate fails Q3. The report lists every (u) row.
- Classes (a) and (b), the rule on new spurious evidence, and the rule on unclassified losses stay as in v1.
  The order of classification is (a), (b), (m′), (u). A row takes its worst class.
- The test uses labels and lexical traces, not a model value. So it is the same for one model and for combined
  evidence. The trace still records every component value and the fused value.

### N4. Minimum effect in distinct rows (replaces "Net gain" and "Minimum effect" in section 6; A3, K-05)

- **Row outcome.** For each row, source, and repeat: a net-win row has more strict-key wins than losses; a
  net-loss row has more losses than wins. Row gain = net-win rows − net-loss rows.
- **Gated lanes.** The effect counts legacy and skills rows only. Extended and holdout are non-regression lanes
  (Q1, Q2, Q4).
- **Development eligibility.** On each source and each repeat, the development row gain is at least **+4**. It is
  also at least twice the number of development rows whose strict keys differ between the two repeats.
- **Confirmation test.** On each source and each repeat, the confirmation part passes an exact one-sided sign
  test at 0.05 on net-win rows (w) against net-loss rows (l). The minimum w for each l:

  | l | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
  |---|---|---|---|---|---|---|---|---|---|---|---|
  | minimum w | 5 | 7 | 9 | 10 | 12 | 13 | 15 | 16 | 18 | 19 | 20 |

  For l above 10, use the exact binomial tail. Neutral rows do not count.
- **Q score** (order only): the sum over development legacy and development skills, on both sources, of
  (W − 2L) on strict keys. Use the lower repeat. A difference of 4 or less is still a tie.
- Reason: v1 counted nested key flips, so three rows could reach +10. Distinct rows on gated lanes measure a
  general change. The confirmation test carries the statistical weight, and it reads rows that no selection
  step saw.

### N5. Repeats and capture discipline (changes R13; A6, K-06)

- Both repeats run every rule: Q1–Q11, R6, R6a, and Q9. Each must pass by itself.
- Repeat 1 is the fixture that ships. Selection values use the lower value of the two repeats.
- An append-only capture manifest records every capture attempt. Only the first two complete captures grade.
- A recapture needs a recorded infrastructure failure, as [harness.md](harness.md) A1.4 defines. A failed capture
  stays in the manifest.
- The R13 flip limit (5) and the cosine floor (0.999) stay.

### N6. Fresh source frozen by SHA-256 (A14, K-07)

The coordinator builds the fresh tree once, before any candidate run. It records the SHA-256 of the archive, of
each extracted input, and of the rebuilt `catalog/manifest.json` in the round ledger. Every lane checks the
manifest SHA-256 and stops on a mismatch. [harness.md](harness.md) A1.2 gives the skills-manifest rule.

### N7. Fallback identity on complete pages (replaces the proof in R3; A15, K-08)

Fallback mode must return a `SearchPage` deep-equal to the baseline page. This holds for every graded row of
every lane (including holdout and protocol history), every probe query, and every slice query, at `limit` 5 and
10, on both sources. The proof is a byte-identical `--dump-pages` file with sorted keys. Fallback mode still
passes `npm run eval:routing -- --gate` on main with the unmodified `eval/gates.json`. Fallback pages carry no
candidate information, so this check covers all rows during development.

### N8. Diagnostic slices with non-regression (A24, K-09)

Five slices, defined in [harness.md](harness.md) A1.6: S1 `limit: 10`; S2 `service` filter; S3 `kind` filter;
S4 the 91 stored agent queries; S5 queries with an empty lexical list. S1–S4 need W − L ≥ 0 on each measure, per
lane and part. The Q4 sets do not grow on S1. S5 needs zero differences from fallback. Slices never enter the Q
score or the effect rule. S1–S3 follow the split. S4 and S5 run in development as vetoes only.

### N9. Gate bands (A8, K-18)

- Assisted runs never use `--gate`. The harness applies Q1, Q2, and Q4 from the result JSON on both sources. The
  legacy band therefore cannot reject a gain.
- In the shipping change, the assisted profile has a floor for every Q2 metric, including extended and every
  `cardHit5`, with no upper bound. Only the fallback profile keeps the ±1% legacy band.
  [runtime-design.md](runtime-design.md) A1.6 gives the runner change.

### N10. `AGENTS.md` exception text (A9, K-17)

The proposed exception allows the pinned Workers AI model set of the accepted variant, not one model. One hard
timeout and one total cost bound cover all its calls. A later change needs a new pre-registered contract, not an
edit to this round. [runtime-design.md](runtime-design.md) A1.7 has the exact text.

### N11. Latency (replaces the measurement of R7; A18, K-10)

- Added latency = the in-Worker model wait (through the gateway) + the host-measured p95 extra CPU of the
  assisted pure path. In a Worker, `Date.now()` advances only across I/O, so CPU needs the host measurement.
- Each window adds 41 idle calls (after at least 30 s of no calls, including the first call) and 20 worst-case
  calls (512-character query, `limit: 50` pool).
- Percentiles use the nearest-rank method. A timed-out call stays in the sample at its real time.
- Per window: burst and idle calls together meet p50 ≤ 150 ms, p95 ≤ 400 ms, and timeouts ≤ 1%. At most 2 idle
  calls exceed T. The worst-case calls have p95 ≤ T. Timeouts, errors, and invalid outputs are at most 2% of all
  calls together.
- The minimum sample, the two windows, and the one-hour gap stay. One colo is a known limit. N19 adds a
  production check after deploy.

### N12. Cost of one complete search (replaces the computation of R6; A17, K-11, K-12)

- The cost of one search is the sum of every model call that it makes: each component, each retry, and each
  call with an invalid output.
- Tokens come from reported `usage`, or else from the model's published tokenizer. The reranker counts the
  query once per context. `ceil(chars / 3)` is only a cross-check.
- Mean: computed on each repeat separately; the higher repeat × 1.5 × 1,000 must be at most USD 1.00.
- Worst case: exact tokens of the fixed card text in the largest pool, plus 2,064 tokens for the query (the
  UTF-8 byte bound of 512 characters, plus 16) for each time the model reads it. One search must cost at most
  USD 0.003.
- The usage sample uses the 20 longest corpus queries.

### N13. Fusion and page definitions (A4, A5, A10, A11)

[candidates.md](candidates.md) A1.3 fixes: the model admission guards (no admission on an empty lexical list;
`rejectsRoutingIntent` always holds; admitted entries are `backfill`; admitted skills may skip
`admitsWholeSkill`); `L_ungated`; tie rules; zero-probability Clef options; the even-length median; float
handling; and page fields (`total`, `truncated`, and `topScoreGap: null` for RRF and PURE). GATE and `f-gr` are
exploratory (N1).

### N14. One output validator (changes R6a; A16, K-13)

- One validator serves capture, CI, and production ([runtime-design.md](runtime-design.md) A1.2).
- The R6a rate uses query keys as the denominator.
- Entry vectors must all be valid.
- For families a, b, and d, the committed fixture has zero invalid and zero error keys. Clef keeps the 1%
  ceiling, and those rows grade in fallback mode, as in production.

### N15. Interference definitions (changes Q4; A13)

Hackathon operations are an exact id set. A hackathon row is a row whose expected cards match a hackathon
operation. The question text plays no part. Q4 scans every graded lane of the phase. `reviewSubmission` stays
under Q5. [harness.md](harness.md) A1.7 lists the ids.

### N16. CI coverage of assisted mode (changes Q6, R10, Q11; A19, A20)

- A new test file runs the RWA vetoes, checks 1–6, the G10 probe, and the eight attributed rows in assisted
  mode from the fixture ([runtime-design.md](runtime-design.md) A1.6).
- `test/drift-141-routing.test.ts` stays frozen and tests fallback. The Q6 instruction to remove its `it.fails`
  marker is withdrawn.
- R10's fixture covers the synthetic and injected probe entries (check 6 entries, `docs.walletDapp`, and the RWA
  entry) and the pool requests over those catalogs. "Protocol history" in R10 means
  `eval/protocol-history-cases.json`.
- Q11: `source-expired` with exit code 1 is a valid recorded result.

### N17. Production-path check and model drift (K-02, K-14)

- For the finalist, the coordinator replays every fixture key through the probe Worker's binding and gateway
  path and compares the outputs with repeat 1 ([harness.md](harness.md) A1.10). A failure fails the finalist.
- A canary failure in production switches `SEARCH_RANKING_MODE` to `lexical` and needs a new round.
  Regenerating the fixture alone never restores assisted mode.

### N18. Cache safety and privacy (A22, K-15, K-22)

Only validated outputs that arrive before T enter a cache. The Cache API URL is versioned and keyed by an HMAC
with a host-derived secret. Cached records are validated on read. Cache writes run in `ctx.waitUntil`, and cache
errors are misses. [runtime-design.md](runtime-design.md) A1.3 gives the detail.

### N19. Caller identity, caps, and fallback health (A21, K-16)

The design threads a caller key to MCP `search` and `codemode.search`, adds the `execute-cap` reason, counts only
model calls toward the per-execute cap, and makes the fallback alert mandatory before deploy. The owner signs the
exact gateway and caller limits before deploy. The first 24 hours after deploy have a p95 and fallback-rate check
that switches to `lexical` on a breach. [runtime-design.md](runtime-design.md) A1.5 gives the detail.

### N20. Lexical work runs once (A18, A23)

The pure lexical stage runs once per search, during the model wait for dense variants. The advisory search stays
lexical. [runtime-design.md](runtime-design.md) A1.1 gives the detail.

### N21. Q7 scope (A7, K-19)

The full Q7 bar applies to every variant with lexical mode `morph-schema`, including `f-bdr`. No candidate of this
round closes the TODO item "Preserve structured routing intent across extraction caps and gate tiers", because
R3 keeps the old lexical scorer in fallback mode.

### N22. Q9 measures need, not page stability (K-20)

With the dApp override removed, a candidate fails Q9 only on a strict-key loss against its own result with the
override. Page changes are a diagnostic.

### N23. Validity screen (A12, K-21)

The family a validity screen becomes a diagnostic. It drops no variant.

### N24. Spend reservation (K-23)

All lanes reserve spend in one round ledger under an exclusive lock before each paid call, and reconcile after
it ([harness.md](harness.md) A1.11).

### Timing record for Amendment 1

This amendment and the companion changes were written on 2026-11-03, before any candidate of this round was
built or measured. When the author finished, no candidate result existed in this round. The author read no
candidate result. The baseline per-part values were not computed; the partition was drawn without them.

SHA-256 of every file at completion, except this file:

| File | SHA-256 |
|---|---|
| `candidates.md` (amended) | `806350c061f6f44e2d07349b370e16acacf93f29ffd89f107067776283cea3e4` |
| `harness.md` (amended) | `0ca82ccce7482eb791e4a8a9527c1a3f5ec6cee66ed29b636f8d3d85640732a2` |
| `runtime-design.md` (amended) | `5a28679fccc12c1b7baecd2c41933bcc036069aa7c79c118c0049313799723f3` |
| `attack-reconciliation.md` | `8c5714cd843777b34f8b96ce15b37f827ef9e2bebd72fe96429caf70feeffa2f` |
| `partition.json` | `a9305fff67553297781e1474c2673f7a99a6ffc71bb4f586b8d7c467d671d755` |
| `partition.mjs` | `f2b05e839d5bc658ab925647acb054f6c412a4e00d2c81646dee2595f12eac36` |
| `v1/contract.md` | `0ec05f5fa1850e12000c9947239cb75cb425ee471bcb4be8ece11fcd9930f0c0` |
| `v1/candidates.md` | `2569ebb0cdb52b24c88bbf100a72b4dd50c647536c06acff5741aeba4b17a289` |
| `v1/harness.md` | `17eb69d5ca7b4dfe3c00bc21b4f08c3322658dba183f88c30d031b0350dec378` |
| `v1/runtime-design.md` | `06839d8206fc7dd83e60d3e734581beb75e4ee4c163cd4aa66cc3d89bdf0b2a1` |
| `tmp/attack/attack-argon.md` (input) | `aafdf482a0e17b4a40ec38326912cce9c7bc9181581b147ec47f0b8706f9a29a` |
| `tmp/attack/attack-kimi.md` (input) | `574b960989d9c3332effa915a3d637288941048c2a24da640dc7d877c9c43054` |

The coordinator records the SHA-256 of this file in the round ledger when it receives it. Completed 2026-11-03 by
lane b-amend.
