# Candidates — model-assisted search ranking 2026-11-03

Pre-registered with [contract.md](contract.md). Every constant on this page is fixed before the
first run (R9). Each variant id below names exactly one candidate. A lane builds and measures the
variants. It does not add, tune, or drop a variant, except under section 9.

Prices are list prices from `cf ai models list` on 2026-11-03. Request and response shapes are from
`cf ai get-model-schema` on the same day. The harness re-reads both before its first call and stops
if a price or a shape differs ([harness.md](harness.md) section 6).

## 0. Research input

The parallel lane b-research (Grok 4.7 xhigh) wrote its report before any candidate ran:
`scratchpad/lanes/b-research/report.md`, SHA-256 `4f367fa8…8120`. It measured no model on Raven.
This page adopts four of its conclusions, and the coordinator confirmed them on 2026-11-03:

1. Cloudflare-hosted candidates run first. The shortlist order is bge-base, Clef-flash `choice`
   over the lexical top 20, bge-reranker-base, qwen3-embedding, and Clef.
2. External decision models (TypeSafe Jev 1.14, `perplexity/pplx-decider-v1.2`) form a
   conditional tier X (section 7). They run only if every Cloudflare-hosted variant fails.
3. No small generative LLM runs on the search path in this round. GLM-5.3 Flash, DeepSeek V4.1
   Flash, Particle-1, and the Llama, Gemma, and Granite chat models are out (section 7). The
   report found no Worker p50 for them. Their reasoning defaults are `max` or `high`, and they
   bill output tokens. Particle-1 is a coding chat model, not a decision model, and it is not on
   Workers AI.
4. Two request details change: the BGE v1.5 models get a query-prefix twin (section 3), and the
   reranker score scale is checked before fusion (section 6).

The report also gives vendor latency for Clef on 2026-10-01: Clef-flash median 38.8 ms, p95
122.4 ms; Clef median 209.3 ms, p95 238.6 ms; Jev median 524.1 ms. These are vendor claims. Only
the R7 measurement counts. Clef-omni is skipped: it costs more than Clef-flash and adds only audio
and video input.

## 1. Shared definitions

**Searchable entries, E.** The manifest entries with `searchable !== false` that pass the request's
`kind` and `service` filters. Section entries are never in E. There are about 80 on main and 82 on
the fresh source.

**Canonical query, q.** The caller's query with runs of whitespace collapsed to one space, trimmed,
and cut to 512 characters. Case is kept. No other text is added, except the fixed prefixes and
instructions that a variant declares.

**Name words.** The entry's terminal name, split on `_`, `.`, `-`, and lowercase-to-uppercase
boundaries, then lowercased and joined by spaces (`search_content_semantic` → `search content
semantic`; `getRwaAssets` → `get rwa assets`).

**Entry text for embeddings, D(e).** `<name words> (<service> <kind>): <description>`. The
description is cut to 1,200 characters. This is the rt-b `denseEntryText` form.

**Entry card, C_n(e).** `<id> — <name words> (<service> <kind>): <description cut to n
characters>`. Rerank and choice inputs use n = 300. The listwise catalog uses n = 160.

**Lexical lists.** A new pure helper returns two ordered lists from the unchanged scorer:

- `L_gated`: the gated candidates, by score descending, then id ascending;
- `L_ungated`: every entry of E that the ungated scorer scores and that is not in `L_gated`, by
  score descending, then id ascending. This list ignores `fullPageUngatedAdmission`.

`L_lex` is `L_gated` followed by `L_ungated`. The lexical rank of an entry is its 1-based position
in `L_lex`.

**Pool size, K.** K = max(20, min(limit + 10, 60)). The routing corpus uses `limit: 5`, so K = 20
there. The production default (`limit: 10`) also gives K = 20.

**Pools.**

- `POOL-L`: the entries of `L_lex`.
- `POOL-K`: the first K entries of `L_lex`.
- `POOL-ALL`: all of E.
- `POOL-L+M10`: `POOL-L` plus the 10 entries of E with the highest model evidence.

## 2. Fusion operators

Every operator is a pure function of the lexical lists, the model evidence, and the options.

**MULT(β).** The model gives a value v(e) for each entry of E (cosine or reranker score). Let
med and max be the median and maximum of v over E. Then
rel(e) = clamp((v(e) − med) / (max − med), −1, 1), with rel = 0 when max = med. Each gated and
ungated lexical score becomes score × (1 + β · rel(e)). The unchanged selector then runs on these
scores: diversity, short-page fill, `preserveStrongBackfill`, `preserveIntentWithinServiceQuota`,
interleave, and the freshness reorder. MULT never admits a new entry. β = 0.15 (fixed by rt-b
before its 2026-11-02 run).

**GATE(n, τ) + MULT(β).** First apply the admission step. Each entry of E that is among the n
entries with the highest v, and that has rel ≥ τ, joins the gated set if it is absent. Its gated
score is max(its ungated score, 1). Then apply MULT(β) and the unchanged selector. n = 3, τ = 0.5,
β = 0.15. This is the direct form of the ledger's next direction: legitimate evidence admits the
entry, so the selector sees it.

**RRF(lists, pool).** For each entry e in the pool, f(e) = Σ_i 1 / (60 + r_i(e)), where r_i is the
1-based rank of e in list i. An absent entry adds no term for that list. Sort the pool by f
descending, then lexical score descending (absent = 0), then id ascending. Then apply
`diversifyByService` with the existing quota max(2, ceil(0.4 · limit)) to fill `limit`. The
lexical score-margin rules do not run, because their margins use the lexical scale. Each hit keeps
`tier: "gated"` when it is in `L_gated`, else `"backfill"`. `total` is the pool size after the
filters. The hit `score` is the lexical score (0 for a model-only entry), so a caller sees no
model value.

**PURE(pool).** Sort the pool by model value descending, then lexical rank ascending, then id
ascending. Apply `diversifyByService` as in RRF. Tier, `total`, and `score` follow the RRF rules.

## 3. Family a — dense query embedding fused with lexical

Entry vectors D(e) are computed once per model and stored in the fixture. The query vector of q is
computed per search. The value v(e) is the cosine between them.

| Model | Variant prefix | Dims | Request form | List price | Est. USD / 1,000 calls |
|---|---|---:|---|---|---:|
| `@cf/baai/bge-small-en-v1.5` | a-bs | 384 | `{ text: [..], pooling: "mean" }`, no prefix | 0.0202 / M in | 0.001 |
| `@cf/baai/bge-base-en-v1.5` | a-bb | 768 | same | 0.0666 / M in | 0.003 |
| `@cf/baai/bge-large-en-v1.5` | a-bl | 1024 | same | 0.204 / M in | 0.008 |
| `@cf/baai/bge-m3` | a-m3 | 1024 | `{ text: [..] }` | 0.0118 / M in | 0.001 |
| `@cf/qwen/qwen3-embedding-0.6b` | a-q3 | 1024 | queries: `{ queries: [q], instruction: I_Q3 }`; entries: `{ documents: [D(e)] }` | 0.0118 / M in | 0.001 |
| `@cf/google/embeddinggemma-300m` | a-eg | 768 | query text `task: search result \| query: <q>`; entry text `title: <name words> \| text: <D(e)>` | not listed | ≤ 0.01 (assumed) |
| `@cf/baai/bge-small-en-v1.5` | a-bsp | 384 | as a-bs, query text `P_BGE<q>`; entries unchanged | 0.0202 / M in | 0.001 |
| `@cf/baai/bge-base-en-v1.5` | a-bbp | 768 | as a-bb, query text `P_BGE<q>`; entries unchanged | 0.0666 / M in | 0.003 |
| `@cf/baai/bge-large-en-v1.5` | a-blp | 1024 | as a-bl, query text `P_BGE<q>`; entries unchanged | 0.204 / M in | 0.008 |

`P_BGE` = `Represent this sentence for searching relevant passages: ` (with the trailing space).
It is the BAAI v1.5 card's query instruction. It goes on the query only, never on entry text. The
unprefixed rows keep rt-b's measured form, so the pair is a clean A/B. All BGE rows use `mean`
pooling for both sides; `cls` vectors are not compatible with `mean` vectors.

`I_Q3` = `Given a question about the Stellar ecosystem, retrieve the catalog tool or playbook that
an agent should use to answer it`. rt-b's qwen3 run used no instruction and the symmetric `text`
alias, and it failed. This variant uses the documented asymmetric form. The Qwen card's raw form
is `Instruct: <task>\nQuery:<q>`. It is not known whether the Workers AI `instruction` field
applies that wrapper. Before any a-q3 run, the harness embeds three corpus queries both ways
(field form, and the raw wrapper in `queries` with an empty `instruction`) and records the
cosine. a-q3 always uses the field form. A cosine below 0.99 is reported, but it does not change
the variant. The embeddinggemma
prefixes are the model card's retrieval prompts. The harness confirms the dims from the first
response and stops on a mismatch.

The estimate uses 30 input tokens per query at list price × 1.5. EmbeddingGemma has no listed
price. The harness prices it at the highest family a rate, bge-large
([harness.md](harness.md) section 6).

Fusions, for each model:

- `<prefix>-mult`: MULT(0.15);
- `<prefix>-gate`: GATE(3, 0.5) + MULT(0.15);
- `<prefix>-rrf`: RRF([L_lex, dense order], POOL-L);
- `<prefix>-rrf-m10`: RRF([L_lex, dense order], POOL-L+M10).

That is 9 encoder forms × 4 fusions = 36 variants. The dense order is E sorted by cosine descending, then
id ascending.

**Validity screen (not a tune).** Before any fused run, compute the dense-only service top-1 on the
legacy lane. A model below 150 of 338 is broken for this task (rt-b: bge-base 174, bge-small 181,
qwen3 without instruction 39). Drop all four of its variants, and report the screen value.

Run order inside family a: a-bb, a-bbp, a-q3 first (the report's shortlist), then the rest.

Cheap enough to try first: yes, all of family a. Expected added latency is one embedding call,
with no dependency on the lexical stage, so it starts with the request.

## 4. Family b — family a plus `morph` token boundaries and the schema rule

In assisted mode, the lexical scorer changes to the rt-c combination c.1 + c.2 `morph`:

- c.2 `morph`: in the vendor `scoreField` and its ungated replica (kept in lockstep), a whole-query
  phrase match respects token boundaries. A query token matches a field token only when it is the
  same token, or when the existing `tokensOverlap` rule accepts the pair (plural fold; prefix pair
  with shorter token ≥ 4 characters and length ratio ≥ 0.75).
- c.1 schema rule: schema keywords cannot create gated admission. A schema keyword with no other
  support adds nothing to rank. Use a1's pinned Porter implementation. Do not include a1's
  unrelated selector condition.
- c.3 (open-world admission on `retrievalProfile.lane`) is **not** part of family b. It failed
  check 2 and G5(b) on 2026-11-02.

In fallback mode, the lexical scorer is the baseline scorer (contract R3).

Variants: `b-<model>-<fusion>` for every family a model that passes the validity screen, and every
fusion in section 3. That is at most 36 variants. Family b must also pass the full Q7 probe bar.

Expected effect: the token rule removes spurious evidence, and dense evidence restores the recall
of broad retrieval entries and skills. GATE and RRF-M10 can admit those entries. MULT can only
reorder them, so it tests whether reordering alone is enough.

Cheap enough to try first: yes. Its model cost equals family a.

## 5. Family c — decision-model rerank (Clef)

Request (one call per search):

```json
{
  "model": "<clef | clef-flash>",
  "state": { "query": "<q>" },
  "questions": {
    "best": {
      "type": "choice",
      "instructions": "Which catalog entry should an agent use first to answer the query in the state? Each option is a Stellar ecosystem service operation or a skill playbook. Pick the entry whose described capability answers the query, not one that only shares words with it.",
      "criteria": { "<option id>": "<C_300(e)>", "...": "..." }
    }
  }
}
```

The option id is the entry id when it matches `^[A-Za-z0-9_.-]{1,100}$`. Otherwise it is
`e<NN>`, the 1-based pool index with two digits. The model value is
`answers.best.probabilities[<option id>]`. An option with no returned probability gets 0. A
response with no valid probability is an invalid output (R6a). Clef accepts 2 to 255 options, so
both pools fit.

| Model | Variant prefix | Price | Est. USD / 1,000 calls, POOL-K (K=20) | Est., POOL-ALL (≈80) |
|---|---|---|---:|---:|
| `@cf/cloudflare/clef-flash` | c-cf | 0.038 / M in | 0.12 | 0.43 |
| `@cf/cloudflare/clef` | c-cl | 0.24 / M in | 0.72 | 2.70 (fails R6) |

Estimates assume 100 tokens per option plus 200 tokens of frame, × 1.5. They are high on purpose.
The b-research budget (40 tokens per option) gives USD 0.04 and 0.13 for Clef-flash, and 0.25 and
0.82 for Clef. Clef reports `usage`, so the harness uses the real counts, and R6 decides on them.
Output tokens cost nothing on Clef. Clef-flash has a 24,576-token window, so POOL-ALL must fit it;
the harness checks the reported input tokens.

Variants, for each model:

- `<prefix>-k-pure`: PURE(POOL-K);
- `<prefix>-k-rrf`: RRF([L_lex, Clef order], POOL-L);
- `<prefix>-all-pure`: PURE(POOL-ALL);
- `<prefix>-all-rrf`: RRF([L_lex, Clef order], POOL-L ∪ POOL-ALL).

`c-cl-all-*` runs only if its measured repeat 1 usage on a 20-query sample shows a cost under the
R6 ceiling. The harness computes that before the full run (section 9, stop rule 1).

Cheap enough to try first: Clef-flash with POOL-K, yes (stage 1). Clef-flash with POOL-ALL and
Clef with POOL-K, stage 2.

## 6. Family d — cross-encoder rerank (`@cf/baai/bge-reranker-base`)

Request: `{ "query": "<q>", "contexts": [ { "text": "<C_300(e)>" }, ... ] }` with no `top_k`, so
every context returns a score. The model value is the returned `score` for each context index,
as returned. The model page says the score maps to [0, 1] through a sigmoid, but not whether the
API already applies it. The harness records the observed range on the first 20 calls. RRF and PURE
use only the order, so the scale does not matter for them. `d-all-mult` uses the raw value, and
its rel normalization is declared on that raw value.

Price: 0.00311 / M input tokens. Estimate: POOL-K 20 × 110 tokens × 1.5 → USD 0.01 per 1,000
calls; POOL-ALL ≈ 80 × 110 × 1.5 → USD 0.04 per 1,000 calls. The model reads at most 512 tokens per
query-context pair, and C_300 fits.

Variants:

- `d-k-pure`: PURE(POOL-K);
- `d-k-rrf`: RRF([L_lex, reranker order], POOL-L);
- `d-all-pure`: PURE(POOL-ALL);
- `d-all-rrf`: RRF([L_lex, reranker order], POOL-L ∪ POOL-ALL);
- `d-all-mult`: MULT(0.15) with v = reranker score over POOL-ALL.

Cheap enough to try first: yes.

## 7. Family e and tier X — out of the default run

**Family e (small generative LLMs) is excluded from this round.** No variant of GLM-5.3 Flash,
DeepSeek V4.1 Flash, Gemma, Llama, Granite, or Particle-1 runs. Reasons, from the b-research
report: no published Worker p50 near the R7 ceiling; default reasoning `max` or `high`; billed
output and reasoning tokens; and listwise output that needs id validation. Particle-1 is a coding
chat model off Cloudflare. A later round may reopen family e only with a new pre-registered
variant that sets reasoning to `none` and has a measured Worker p50.

**Tier X (external decision models) is conditional.** It runs only when the coordinator records
that every Cloudflare-hosted variant in families a, b, c, d, and f failed or stopped. It then
needs a coordinator-signed key and sub-cap. Under contract R5 a tier X variant cannot ship in this
round; it is evidence for a later owner decision about data transfer.

| Variant | Provider and model | Request | Fusion | List price | Data |
|---|---|---|---|---|---|
| x-jev-k-rrf | TypeSafe `jev-1.14.0` (never the `jev-latest` alias) | the section 5 `choice`, POOL-K | RRF([L_lex, Jev order], POOL-L) | USD 0.042 / M in, output free | leaves Cloudflare |
| x-jev-k-pure | same | same | PURE(POOL-K) | same | leaves Cloudflare |
| x-ppx-k-rrf | Perplexity `pplx-decider-v1.2` | the section 5 `choice`, POOL-K, one question | RRF([L_lex, decider order], POOL-L) | USD 0.02 / M in, output free | leaves Cloudflare |

The Jev request goes to `POST https://api.typesafe.ai/v1/systemone`. The direct API limit is 255
options per `choice`. Prior evidence for Jev (issue #294, a 50-candidate pool, PURE order):
holdout top1 12 to 36, but forbidden captures 10 to 21, extended top1 93 to 82, and 377 of 792
lists different between repeats. The RRF variants test whether a lexical vote holds the forbidden
count down.

## 8. Family f — parallel combinations

The components start at the same time. The added latency is the highest component time, except
where the table says *sequential*. A combination is fixed by these rules:

- **dense\*** = the family a variant with the highest Q score among those that pass every Q and R
  rule on repeat 1 of both sources. If none passes, use the a variant with the highest Q score
  that passes R6, R7 screen, and R13. Its model gives the dense order.
- **rerank\*** = the same rule over family d.
- **clef\*** = the same rule over the `c-cf` variants.

| Variant | Components | Fusion | Timing |
|---|---|---|---|
| f-dr | dense\*, rerank\* | RRF([L_lex, dense, rerank], POOL-L+M10 ∪ POOL-K) | parallel |
| f-dc | dense\*, clef\* | RRF([L_lex, dense, clef], POOL-L+M10 ∪ POOL-K) | parallel |
| f-bdr | family b lexical, dense\*, rerank\* | as f-dr, on the b lexical lists | parallel |
| f-gr | dense\* then rerank\* | GATE(3, 0.5) on dense, then PURE(first K of the gated-then-ungated order) by rerank | sequential |

If any component times out or fails validation, the combination uses fallback mode. It never
ranks with partial evidence.

## 9. Run order and stop rules

**Stage 1 (Cloudflare-hosted, cheap).** Baseline on both sources; then a-bb, a-bbp, `c-cf-k-*`,
`d-k-*`, a-q3, then the rest of families a and d, then family b.
**Stage 2.** `c-cf-all-*`, `c-cl-k-*`, `c-cl-all-*` (if stop rule 1 allows), f-dr, f-bdr, f-dc,
f-gr.
**Tier X.** Only under the section 7 condition.

A variant stops early only for one of these reasons. The report records the reason.

1. It fails R6 by construction. The harness computes the cost from the token counts before any
   call. When the estimate is within 2× of the ceiling, the harness may first run a 20-query
   usage sample (counted in the sub-cap) and decide on the reported tokens.
2. Its validity screen fails (family a, and so its family b twins).
3. Its repeat 1 fails Q1, Q2, or Q4 on main. Its fresh run and repeat 2 then do not need to run.
   It has already failed, because every rule applies to both sources.
4. Its lane sub-cap ([harness.md](harness.md) section 9) is spent. The variant is then unmeasured,
   not failed.

Latency runs (R7) are needed only for variants that pass every Q rule on both sources and on
repeat 1. Run them before the choice.

## 10. Why these families, and what each risks

- Dense evidence is the only measured signal that adds recall (rt-b: W − L +20 main, +21 fresh).
  On the current lexical scorer, it failed by one count on legacy top5, extended cardHit5, and
  holdout forbidden captures. GATE and RRF test whether admission fixes those counts. Family b
  tests the ledger's direction: legitimate evidence in, spurious evidence out.
- Rerankers and decision models judge capability, not word overlap. The #294 Jev evidence says
  that a wide model rerank raises top1 a lot but also doubles forbidden captures. The RRF variants
  keep a lexical vote, so a forbidden entry needs both signals to rise.
- Small generative LLMs are out of this round (section 7). External decision models are a
  conditional tier. The owner named Jev, Clef, and Particle-1: Clef runs in stage 1 and 2, Jev in
  tier X, and Particle-1 is out with its reason recorded.
- No variant uses a per-service weight, a per-query rule, or a label. Every constant is on this
  page.
