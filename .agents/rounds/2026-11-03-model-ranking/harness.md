# Measurement harness — model-assisted search ranking 2026-11-03

> **Amended.** Contract Amendment 1 (2026-11-03) changes this file. Read the "Amendment 1" section at the end
> first. Where it differs from the text above, it wins. The v1 text is in `v1/`.

This page specifies the offline harness that the Codex Sol lanes build. It serves
[contract.md](contract.md) and measures the variants in [candidates.md](candidates.md). It is a
build spec. It changes no rule. The harness code lives in ignored `tmp/` paths. It is experiment
code, not a shippable diff.

## 1. Write scope and safety

- Lanes write only under `tmp/model-ranking/` in their own worktree, and under this round folder
  when the coordinator copies a report in.
- No lane reads `.dev.vars`, `.env`, or any credential file. Model calls use the host-side `cf`
  login (section 5). The harness never prints, stores, or logs a token.
- No lane starts Wrangler or `npm run dev`. No lane deploys. The latency probe Worker (section 8)
  is deployed and deleted by the coordinator.
- Gate commands run bare, with no pipe. A lane runs `npm run secrets:scan -- --tree` before it
  hands back a tree.
- Every experiment tree is a plain `git clone` of the worktree at the baseline commit, with the Git
  override variables removed (`GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE`). rt-c used this method.

## 2. Layout

```text
tmp/model-ranking/
  src/main/            plain clone at e530c7f4 (main source)
  src/fresh/           plain clone at e530c7f4 + frozen fresh inputs (section 3)
  prices.json          pinned price table (section 6)
  schemas/             cf ai get-model-schema output per model id
  cache/<model-slug>/<key>.json     one record per live call (section 4)
  fixtures/<variant>/<source>/r<1|2>.json   packaged fixture per variant, source, repeat
  runs/<variant>/<source>/<mode>-r<n>.json  routing result JSON (eval/run-routing.mjs output)
  runs/<variant>/<source>/<mode>-r<n>.ranked.json  --dump-ranked output
  traces/<variant>/<source>/r<n>.loss-trace.json   Q3 traces
  reports/<variant>.json   per-variant verdict (section 7)
  spend.jsonl          one line per paid call (section 6)
  latency/             probe Worker source and results (section 8)
  REPORT.md            the lane's final report
```

## 3. Sources and the reproduction check

**main.** `tmp/model-ranking/src/main` is a clone at `e530c7f4`. Run `npm ci`, then
`node scripts/build-catalog.mjs`. The rebuilt `catalog/manifest.json` must have SHA-256
`f018b979460a9a0d22bfafb9b2b57b67d7ddb31650719fd8a190bdcb6bbc1534`. Stop on a mismatch.

**fresh.** Clone at `e530c7f4`, then apply the frozen fresh inputs that rt-c used:

- `inventory/stellar-light.json` at Scout 1.9.111;
- the 682-title `inventory/stellar-docs-titles.json`;
- the stellar-light skill pin `789c9061`;
- in `src/policy/scout-exposure.ts`, expose `analyzeHackathonSubmissions` and
  `getHackathonSubmission`. Keep `reviewSubmission`, `getRwaAssets`, `getQualityReport`,
  `verifyClaim`, and `locateSource` excluded.

The coordinator supplies the three inventory and pin inputs from the ignored archive
`eval/results/2026-10-28-routing-repair-evidence.tar.gz` in the main checkout. Lanes do not open
the main checkout. Rebuild the catalog. Record the manifest SHA-256 in the report.

**Reproduction check.** Before any candidate runs, the unchanged scorer must reproduce these
totals (top1/top3/top5/cardHit5). If a total differs, stop and report to the coordinator.

| Source | legacy | extended | skills | holdout t1/t3/t5 | holdout forbidden |
|---|---|---|---|---|---|
| main | 218/294/327/113 | 93/111/117/16 | 17/23/23/23 | 12/27/30 | 10 |
| fresh | 219/293/327/113 | 93/112/117/16 | 17/23/23/23 | 12/27/30 | 10 |

The main row comes from rt-b and rt-c at `d6ad7350` and `35fa569f`. The later manifest changes
had zero graded flips (`eval/gates.json` note), so the totals must hold. The baseline also records
its hackathon interference set, its `locateSource` set, its probe results, and its
`--dump-ranked` file. Those are the comparison base for Q4, Q7, and R3.

The fresh manifest fails the committed gate fingerprint by design (rt-c). On fresh, the harness
applies each rule from the result JSON. It does not use `--gate`.

## 4. The pluggable evidence seam

### 4.1 Pure code in the experiment tree

Add one module, `src/catalog/ranking.ts`. It is pure: no I/O, no clock, no randomness.

```ts
export type RankingEvidence =
  | { kind: "dense"; modelId: string; dims: number;
      query: Float32Array; entries: ReadonlyMap<string, Float32Array> }
  | { kind: "scores"; modelId: string;            // reranker, Clef, tier X
      pool: readonly string[]; values: ReadonlyMap<string, number> }
  | { kind: "combined"; parts: readonly RankingEvidence[] };  // family f

export type RankingVariant = { id: string; fusion: FusionSpec; lexical: "baseline" | "morph-schema" };

export function lexicalLists(catalog: Catalog, opts: SearchOptions,
  lexical: RankingVariant["lexical"]): { gated: Scored[]; ungated: Scored[] };
export function rankingPool(catalog: Catalog, opts: SearchOptions,
  variant: RankingVariant): string[];                       // POOL-K or POOL-ALL ids, in order
export function searchCatalogPage(catalog: Catalog, opts: SearchOptions,
  ranking?: { variant: RankingVariant; evidence: RankingEvidence }): SearchPage;
```

`searchCatalogPage` with no `ranking` argument is the baseline code path, unchanged. With the
argument, it applies the variant's lexical mode and fusion operator from
[candidates.md](candidates.md) section 2. `searchCatalog` gets the same optional third argument.
The fusion operators take the lexical lists and the evidence. They never read the network.

A reranker or Clef request depends on the pool, so the order is: (1) compute `rankingPool` (pure);
(2) build the request from the pool (pure); (3) look up or call the model (I/O, harness only);
(4) call `searchCatalogPage` with the evidence (pure).

### 4.2 Runner flags

Extend `eval/run-routing.mjs` in the experiment tree only:

- `--ranking <variant-id>` selects a variant from `tmp/model-ranking/variants.json`, a machine copy
  of [candidates.md](candidates.md). Each record holds the model id, request builder name, pool,
  fusion, constants, and lexical mode.
- `--fixture <path>` names the packaged fixture. Every lookup that misses is a hard error with the
  key and the query id. There is no silent fallback.
- `--mode assisted|fallback`. `fallback` passes no `ranking` argument. Its pages must equal the
  baseline (R3).
- `--explain <path>` writes per-row traces (section 7.3).

Every lane in the runner (legacy, extended, skills, holdout, protocol history) uses the same
search call, so one flag set covers all of them. The probe scripts (section 7.4) call the same
function with the same fixture.

### 4.3 Request canonicalization and keys

Each model request body is built by one pure function per request form. The canonical input is
`JSON.stringify` of the body with keys sorted at every level and no whitespace. The key is:

```text
key = sha256(modelId + "\u0000" + canonicalBody)   // lowercase hex
```

Embedding entry texts and query texts are separate requests, so each has its own key. Batched
embedding calls are split back into one record per text, and each text has the key of the
single-text body. A batch is a transport detail. It never changes a key.

The fixture format, shared with the shipping design ([runtime-design.md](runtime-design.md)
section 4):

```json
{
  "schema": 1,
  "variant": "a-bb-gate",
  "modelIds": ["@cf/baai/bge-base-en-v1.5"],
  "source": "main",
  "repeat": 1,
  "capturedAt": "2026-11-03T00:00:00Z",
  "records": {
    "<key>": { "modelId": "...", "output": { }, "usage": { "inputTokens": 0, "outputTokens": 0,
               "cachedInputTokens": 0, "basis": "reported|estimated" }, "status": "ok|invalid" }
  }
}
```

Vectors are stored as base64 of little-endian Float32 arrays, rounded by nothing else. `output`
for an embedding is `{ "vector": "<base64>", "dims": 768 }`.

## 5. Calling models host-side

Use the `cf` CLI with the operator's existing login. Write each request body to a temporary file
under `tmp/model-ranking/req/`, then run:

```sh
cf ai run <model-id> --body @tmp/model-ranking/req/<key>.json
```

Run `cf ai run <model-id> --help` once per model to confirm its flags, and run each new request
form once with `--dry-run` first. Do not use REST with a token, because that needs a credential in
the harness. If `cf` cannot run a form, report the exact command to the coordinator.

Call rules:

- The cache wins. Before a call, look up `cache/<model-slug>/<key>.json`. Repeat 2 uses a separate
  cache directory (`cache-r2/`), so it is a real second capture.
- Concurrency is at most 8 calls at a time per model.
- Retry once, after 2 s, on HTTP 429 or 5xx. A second failure records `status: "error"`. The
  harness grades that query in fallback mode and counts it under R6a.
- Batch embeddings where the schema allows it (`text` up to 100 for BGE and EmbeddingGemma;
  `queries` and `documents` up to 32 for qwen3).
- Validate every output before it enters a fixture: dims equal the declared dims; every number is
  finite; Clef has `answers.best.probabilities`; the reranker returns one score per context.
  A failed validation is `status: "invalid"` (R6a).
- Capture order: the main source first, then fresh. Only pool-dependent requests (families c, d,
  tier X) differ by source. Query and entry embeddings depend only on text, so the two sources
  share them when the text is the same.
- Before the first call of a model, save `cf ai get-model-schema <model-id>` output to
  `schemas/`. Compare it with the request form in [candidates.md](candidates.md). Stop on a
  difference.

## 6. Cost and token logging

**Prices.** Save the `cf ai models list` price entries for every model in scope to `prices.json`
before the first call. If a price differs from [candidates.md](candidates.md), stop and report.
Where the model page and the pricing page round differently, use the higher value.
`@cf/google/embeddinggemma-300m` has no listed price. Use the highest family a embedding price
(`bge-large`, USD 0.204 per M input tokens) for it.

**Tokens.** Use the model's reported `usage` when the response has it (Clef does). Otherwise
estimate input tokens as `ceil(chars / 3)` of the canonical body's text fields, the conservative
rt-b rule. Record the basis.

**Ledger.** Append one JSON line to `spend.jsonl` for every call, cached or not:

```json
{"ts":"...","lane":"...","variant":"...","modelId":"...","key":"...","repeat":1,"source":"main",
 "cacheHit":false,"inputTokens":0,"cachedInputTokens":0,"outputTokens":0,"basis":"reported",
 "usd":0.0,"hostMs":0,"status":"ok"}
```

`usd` is 0 for a cache hit. `hostMs` is the host-side wall time of the `cf` process. It is a screen
only and never passes R7.

**Spend guard.** Before each paid call, sum `usd` for the lane and the round. Refuse the call when
the sum plus this call's estimate would pass the lane's sub-cap or the round cap (section 9).

**R6 value.** For each variant, compute the mean list-price cost per call over the routing corpus
queries of repeat 1, using full price for every call (cache hits included). Multiply by 1.5 and by
1,000. Also compute the worst-case call: the longest canonical query (512 characters) with the
largest pool at `limit: 50`. Report both. The R6 ceiling applies to both values.

## 7. Grading

One script, `tmp/model-ranking/compare.mjs`, reads the baseline and candidate result JSON files and
writes `reports/<variant>.json`. The coordinator can rerun it from saved files only.

### 7.1 Strict keys, W/L, and metric floors (Q1, Q2)

For each lane and source: per row, compare `top1`, `top3`, `top5`, `cardHit5` (holdout `cardHit5`
skipped, because it equals `top5`). Count W and L. Report lane totals and deltas. Q2 allows −1 only
on holdout top3 and top5.

### 7.2 Interference (Q4) and exposure (Q5)

- *Hackathon operation*: a Scout operation whose terminal name contains `hackathon` (any case).
- *Hackathon row*: a row whose question contains the token `hackathon` or `hackathons` (any
  case), or whose expected cards name a hackathon operation.
- The set is every (row id, operation id, rank) with a hackathon operation in the top five of a
  non-hackathon row. Q4 fails on a new (row, operation) pair or a better rank for an existing pair.
- The `locateSource` set uses the same rule for `scout.locateSource`.
- Holdout forbidden captures: the runner's count, against the baseline count.
- Q5: assert the manifest's operation id set equals the baseline set for that source, and that
  `scout.reviewSubmission` is in no top five.

### 7.3 Loss traces and classes (Q3)

Add an explain hook in the experiment tree only: `explainEntryScore(entry, query, scorer)` returns
every (query token, field, field token, match kind, contribution) for the gated and the ungated
scorer, plus the coverage values. Match kinds are `exact`, `phrase`, `prefix`, `substring`,
`plural`, `stopword-rescue`, `schema`, `alias`, and `acronym`.

For each loss row, write the trace for the demoted expected entry and for every entry that now
ranks above it. Include the variant's model value for each of those entries. Then classify the
loss mechanically, in this order:

1. **(a)** The demoted entry lost lexical contribution, and every lost pair is H2-forbidden (a
   query token of length 1–2 or a stopword matching by prefix or substring, or a non-morphological
   prefix or substring pair), or a schema-only match.
2. **(b)** Every promoter's added contribution comes only from `exact` or `phrase` matches of whole
   query tokens in the description, a routing phrase, or the operation id.
3. **(m)** Every promoter has a higher model value than the demoted entry, is not a forbidden card
   for that row, and gains no contribution of a class (a) kind.
4. Otherwise the loss is **unclassified**, and the variant fails Q3.

A promoter that gains a new H2-forbidden or schema-only contribution fails the variant, whatever
its class.

### 7.4 Probes (Q6, Q7)

- **Checks 1–6.** Port the check logic from
  `.agents/rounds/2026-10-28-routing-repair/impl/acceptance.mjs` into `tmp/model-ranking/probes.mjs`.
  Call the variant's search function with the fixture. Check 4 is reported as a diagnostic (H1).
- **RWA (Q6).** Run the four discovery positives, the ordinary negatives, and the three mixed
  controls from `test/drift-141-routing.test.ts` by reading its `rows` array. Do not edit the file.
- **G10 probe (rebuilt).** Fourteen (query token, field token) pairs, each in three base queries,
  give 42 comparisons:

  | # | query token | field token | kind |
  |---|---|---|---|
  | 1 | in | integration | short prefix |
  | 2 | 1 | lvl1 | substring |
  | 3 | with | without | non-morphological prefix |
  | 4 | has | phase | substring |
  | 5 | approach | app | reverse prefix |
  | 6 | i | in | short prefix |
  | 7 | on | content | substring |
  | 8 | on | one | short prefix |
  | 9 | do | docs | short prefix |
  | 10 | it | with | substring |
  | 11 | s | search | short prefix |
  | 12 | so | soroban | short prefix |
  | 13 | to | token | short prefix |
  | 14 | as | asset | short prefix |

  Base queries: `stellar account balance`, `soroban contract events`, `project funding history`.
  For each pair and base, let q1 = base + " " + query token. The comparison passes when, for every
  searchable entry whose scoring fields contain the field token as a whole token and do not
  contain the query token as a whole token, the explain trace for q1 shows no nonzero
  contribution from that (query token, field token) pair, in the gated or the ungated scorer.
  `type`/`types` is out of scope (H2: morphology).
- Every probe query joins the fixture key set, so assisted mode can run it.

### 7.5 Fusion reference check (Q8)

A second, independent implementation of each fusion operator lives in
`tmp/model-ranking/ref-fusion.mjs`. It reads only the saved lexical lists and the fixture. For every
row of every lane, its page (ids and order) must equal the candidate's page. One mismatch fails
the variant. In fallback mode, also run the G11 page-fill check from the 2026-11-02 round.

### 7.6 Override check (Q9), fallback identity (R3), repeats (R13)

- Q9: rebuild the catalog with `SKILL_DESCRIPTION_OVERRIDES["skills.stellar-dev.dapp"]` removed,
  rerun assisted mode on repeat 1 with the same fixture keys for queries (entry keys for the dApp
  skill change, so capture that one entry's vector or score), and count graded page changes.
- R3: run `--mode fallback --dump-ranked`. Diff against the baseline dump. The diff must be empty
  on both sources. Then run `npm run eval:routing -- --gate` on main in fallback mode.
- R13: count strict-key flips between repeat 1 and repeat 2 per source. For embeddings, report
  the minimum cosine between repeat vectors of the same key.

### 7.7 Scores and verdict

Each `reports/<variant>.json` holds: every Q and R rule as pass or fail with its evidence path; W
and L per lane per source per repeat; the Q score; the net gain per source; the R6 values; the R7
values when measured; the repeat flips; the diff line count; and the stop reason when the variant
stopped. `tmp/model-ranking/choose.mjs` applies [contract.md](contract.md) section 6 to all
reports and prints the order with each tie-break step.

## 8. Latency measurement (R7)

R7 needs timing inside a Worker on the Cloudflare network. The harness provides a probe Worker. The
coordinator deploys it, runs the driver, and deletes it.

**Probe Worker** (`tmp/model-ranking/latency/worker/`, created with `cf init`, deployed with
`cf deploy` by the coordinator):

- name `raven-rank-latency-probe`, `workers.dev` only, no route, Smart Placement off;
- bindings: `AI` only, plus one secret `PROBE_TOKEN` that the coordinator sets and never writes to
  a file;
- every model call goes through the AI Gateway path that [runtime-design.md](runtime-design.md)
  section 5 names, with caching off, so the timing includes the gateway hop that production uses;
- `POST /measure` with `Authorization: Bearer <PROBE_TOKEN>` and a body
  `{ variant, calls: [ { modelId, body } | { parallel: [ { modelId, body }, ... ] } ] }`;
- for each call it records `t0 = Date.now()`, awaits `env.AI.run(...)` (or `Promise.all` for a
  parallel group), and records `Date.now() - t0`. The Workers clock advances across I/O, so this
  measures the model wait. It also returns `request.cf.colo`, status, and `usage` when present;
- it logs nothing about the request body, and it returns no model output.

**Driver** (`tmp/model-ranking/latency/drive.mjs`, run by the coordinator on the host): it replays
the recorded request bodies of the routing corpus for one variant. Each window sends at least 200
calls, one at a time, in random order with a fixed seed. Run two windows at least one hour apart.
Record per window p50, p95, p99, the timeout rate at T = 500 ms, and the colo. Embedding and
reranker calls are cache misses by design, because the probe has no cache. Family f groups are
sent as one parallel group, or as a sequence for f-gr.

Lexical time is not part of "added" latency. For reference, report the production `ms` field of
recent `search` events from the observability skill, as context only.

Limits: the probe runs from the coordinator's nearest colo. Users in other regions may see other
times. The report states the colo.

## 9. Spend cap (proposed; the coordinator signs it)

Proposed round cap: **USD 15.00** at list price, for every live call of this round, including
repeats and latency runs. The expected spend is about USD 5.

| Sub-cap | USD | Basis of the estimate |
|---|---:|---|
| Baseline checks, schema checks, qwen3 wrapper test | 0.10 | a few calls |
| Family a (36 variants share 9 encoder forms) | 0.50 | ≈ 900 queries + 82 entries × 9 forms × 2 repeats ≈ 0.5 M tokens |
| Family b | 0.05 | reuses family a vectors; only Q9 dApp entry re-embeds |
| Family d | 0.50 | ≈ 900 queries × 2 sources × 2 repeats × (20 or 80 contexts) |
| Family c, Clef-flash | 2.00 | ≈ 3,600 calls × 2–9 k tokens at USD 0.038 / M |
| Family c, Clef | 4.00 | ≈ 3,600 calls × 2 k tokens at USD 0.24 / M, plus the POOL-ALL usage sample |
| Family f | 0.50 | mostly reuses component fixtures |
| Latency runs | 3.00 | ≥ 400 calls per passing variant |
| Reserve | 4.35 | unplanned retries; nothing else |
| Tier X | 0.00 | needs its own signed key and cap (contract R5a) |

The guard in section 6 enforces each sub-cap. A lane that reaches a sub-cap stops that family and
reports the remaining variants as unmeasured. Moving money between sub-caps needs a coordinator
note in the round ledger.

## 10. Suggested lane split

Lanes must own disjoint files. A suggested split for Codex Sol lanes:

1. **h-core:** sections 2–4 and 7 (pure seam, runner flags, compare, probes, reference fusion).
   Other lanes depend on it.
2. **h-capture:** sections 5–6 (request builders, `cf` calls, cache, fixtures, ledger). It starts
   with the baseline and families a and d.
3. **h-latency:** section 8 (probe Worker and driver). It needs no candidate result, so it can
   start at once. The coordinator deploys it.

The coordinator commits. Codex lanes cannot commit in worktrees and cannot write under `.agents/`;
they write to `tmp/` and the coordinator copies reports in.

---

## Amendment 1 (2026-11-03; contract Amendment 1, items N2, N3, N5–N9, N11, N12, N14–N17, N24)

This section was written before any candidate was built or measured. It changes the build spec below. Where
it differs from sections 1–10, it wins.

### A1.1 Partition and row selection (N2)

- `partition.json` in this round folder is the pre-registered split. `partition.mjs` regenerates it from the
  corpus files. The harness checks its SHA-256 against the contract and stops on a mismatch.
- New runner flag `--rows dev|confirm|all`. `dev` grades only the development rows of legacy and skills, and
  skips extended, holdout, and protocol history. `confirm` grades the confirmation rows of legacy and skills,
  plus every row of extended, holdout, and protocol history. `all` is for the baseline and fallback only.
- Before the finalist record, no lane runs `--rows confirm` or `--rows all` in assisted mode. `compare.mjs`
  refuses an assisted result that contains a confirmation row or a gate-only lane, unless the coordinator
  passes `--finalist <variant>` after the record exists.
- Capture is not grading. The capture step may fetch model outputs for every fixture key, including
  confirmation rows, so the fixture is complete.

### A1.2 Fresh source (N6)

The coordinator builds `src/fresh/` once, before any candidate run. It replaces only the
`sources[id="stellar-light"]` object of `ecosystem-skills/MANIFEST.json` (pin `789c9061`) and the skill files
that object pins. If the section 3 fresh totals do not reproduce, it tries the archive's whole `MANIFEST.json`
once. It records which form reproduced. If neither reproduces, it stops. It writes these SHA-256 values to the
round ledger: the archive, each extracted input, and the rebuilt `catalog/manifest.json`. Every lane copies that
tree and checks the manifest SHA-256 before it runs. A mismatch stops the lane.

### A1.3 Runner and fixture changes (N7, N14)

- New runner flag `--dump-pages <file>`. It writes the complete `SearchPage` for every graded row of every lane
  (including holdout and protocol history), every probe query, and every slice query (A1.6), at `limit` 5 and
  10. The JSON uses sorted keys at every level.
- The fixture `status` values are `ok`, `invalid`, and `error`.
- The output validator is one module, `validate.mjs`, shared by capture, grading, and the reference fusion. It
  is the N14 validator. The shipping code ports the same rules.

### A1.4 Capture manifest, repeats, and recapture (N5)

- Append one line to `tmp/model-ranking/captures.jsonl` when a capture starts and when it ends. A line holds
  the variant or encoder form, source, repeat, start and end time, key count, `ok`/`invalid`/`error` counts,
  the fixture SHA-256 (at the end), and a status. No line is ever edited or deleted.
- Grade only the first two complete captures for each variant and source.
- A recapture is allowed only for an infrastructure failure: a crash of the capture process, a `cf` login
  failure, or more than 2% of keys with `status: "error"` after the one retry. Record the evidence in the
  manifest. The failed capture stays in the manifest. The repeats still need one hour between them.
- For families a, b, and d, the committed fixture has zero `invalid` and zero `error` keys. A key with `error`
  after the retry is recaptured once under the infrastructure rule. Entry vectors must all be `ok`.
- Both repeats run every rule: Q1–Q11, R6, R6a, and Q9. Repeat 1 is the fixture that ships. Selection values use
  the lower value of the two repeats.

### A1.5 Cost (N12; replaces the R6 part of section 6)

- **One search.** The cost of one search is the sum over every model call that the search makes: each
  component of a family f variant, each retry, and each call with an invalid output.
- **Tokens.** Use the reported `usage` when the response has it. Otherwise count tokens with the model's
  published tokenizer. Save each tokenizer file and its SHA-256 in `prices.json`. The reranker counts each
  (query, context) pair, so the query counts once per context. The v1 rule `ceil(chars / 3)` is only a
  cross-check. Report each variant where the tokenizer count is more than 10% above it.
- **Mean.** For each repeat separately, take the mean cost per search over the routing corpus queries, × 1.5 ×
  1,000. The higher repeat must be at most USD 1.00. A cache hit counts at full price.
- **Worst case.** Use the largest pool (`limit: 50`, K = 60). Card text is fixed manifest text, so count its
  tokens exactly. The query is user input, so bound it: a 512-character query has at most 2,048 UTF-8 bytes,
  and a byte-level tokenizer gives at most one token per byte. Use 2,048 + 16 tokens for the query, multiplied
  by the number of times the model reads it (1 for an embedding or Clef, the pool size for the reranker). The
  sum must be at most USD 0.003 for one search.
- **Usage sample.** Stop rule 1 uses the 20 corpus queries with the longest canonical text, ties by id
  ascending.

### A1.6 Diagnostic slices (N8)

Each slice compares the candidate with the baseline on the same rows and options. The rows follow the split
(A1.1), except S4 and S5.

| Slice | Rows | Options | Measures |
|---|---|---|---|
| S1 | legacy, extended, skills, holdout | `limit: 10` | strict keys on the first five hits; Q4 sets |
| S2 | legacy, extended, holdout | `service` = the row's `expected_service`, `limit: 10` | `cardHit5` (holdout: card rank and forbidden captures) |
| S2s | skills | `kind: "skill"`, `limit: 10` | strict keys and `cardHit5` |
| S3 | legacy | `kind: "operation"`, `limit: 10` | strict keys on the first five hits |
| S4 | the 91 stored agent queries in `eval/discovery/mined-lumenloop-queries.json` | `limit: 10` | family top1 (first hit's service is in `expectedFamilies`) and usable-op top5 (an `acceptableOps` id in the first five) |
| S5 | every corpus and probe query whose `L_lex` is empty, plus the gibberish queries in `test/search.test.ts` | as in the corpus | the assisted page equals the fallback page |

Pass rule: S1–S4 have W − L ≥ 0 on each measure, per lane and part, on each source and repeat. The Q4 sets do
not grow on S1. S5 has zero differences. Slices never enter the Q score or the effect rule. Every slice query
joins the fixture key set.

### A1.7 Grading changes (N3, N9, N15)

- **Gate use (N9).** No assisted run uses `--gate`, on either source. `compare.mjs` applies Q1, Q2, and Q4 from
  the result JSON on both sources. Only the fallback check runs `npm run eval:routing -- --gate`, on main, with
  the unmodified `eval/gates.json`.
- **Labels.** `compare.mjs` reads `eval/routing-cases.json`, `eval/build-question-overlay.json`,
  `eval/skills-cases.json`, and `eval/holdout-cases.json` for questions and labels, because the runner output
  has no question or card field.
- **Interference sets (N15).** Replace the section 7.2 definitions:
  - A *hackathon operation* is one of `scout.compareHackathons`, `scout.getHackathon`, `scout.getHackathons`,
    `scout.hackathonBrief`, `scout.searchHackathonBuilds`, and on fresh also `scout.analyzeHackathonSubmissions`
    and `scout.getHackathonSubmission`. `scout.reviewSubmission` stays under Q5.
  - A *hackathon row* is a row whose `expected_cards` match a hackathon operation by `cardMatches`. The question
    text plays no part.
  - The scan covers every graded lane of the phase.
- **Loss classes (N3).** Replace step 3 of section 7.3 with the N3 rule. For each loss, write the demoted entry,
  each promoter, the lexical trace, every component model value, the fused value, and the label test result.
  Classify in the order (a), (b), (m′), (u). Count classes per row; a row takes its worst class, in the order
  unclassified, (u), (m′), (b), (a).

### A1.8 Fallback identity (N7; replaces the R3 part of section 7.6)

Run `--mode fallback --rows all --dump-pages` and the baseline with the same flags, on both sources. The two
files must be byte-identical. Then run `npm run eval:routing -- --gate` on main in fallback mode.

### A1.9 Latency (N11; replaces the window rules of section 8)

- The probe Worker times the model wait for each call, as in section 8. A family f group is one parallel group;
  a sequential variant is the sum of its steps.
- In a Worker, `Date.now()` advances only across I/O. So CPU work is measured on the host. For each corpus
  query, time the assisted pure path (request build, validation, vector decode, and fusion with the
  precomputed lexical lists) and the fallback page in Node with `performance.now()`, 20 runs each, median per
  query. Take the p95 over queries of (assisted − fallback). Add it to every Worker sample.
- Each window has:
  - at least 200 burst calls, one at a time, in seeded random order;
  - 40 idle calls, each sent after at least 30 seconds of no calls;
  - the first call of the window, counted as an idle call;
  - 20 worst-case calls: a 512-character query and the `limit: 50` pool.
- The probe waits up to 5,000 ms for a call and records its real time. A call longer than T counts as a timeout
  and stays in the sample at its real time.
- Percentiles use the nearest-rank method.
- Pass rules per window: burst and idle calls together meet p50 ≤ 150 ms, p95 ≤ 400 ms, and timeouts ≤ 1%. At
  most 2 of the 41 idle calls exceed T. The worst-case calls have p95 ≤ T. Timeouts, errors, and invalid
  outputs together are at most 2% of all calls.
- The report states the colo. One colo is a known limit. N19 adds the production check after deploy.

### A1.10 Production-path check (N17)

For the finalist only, the coordinator adds a `POST /capture` route to the probe Worker. It returns model
outputs and logs nothing. The coordinator replays every fixture key of the finalist through it, with the
gateway, and compares the outputs with repeat 1:

- vectors: cosine ≥ 0.999 for every key;
- reranker and Clef: the same top-five order on at least 98% of keys;
- grading the corpus with the Worker outputs gives at most 5 strict-key flips per source against repeat 1.

A failure fails the finalist.

### A1.11 Spend reservation (N24)

All lanes use one round ledger at an absolute path that the coordinator names. Before each paid call, a lane
takes an exclusive lock file (create with the `wx` flag; retry on `EEXIST`), sums the ledger, appends a
reservation line with the estimate, and releases the lock. After the call, it appends the actual cost. The
guard counts reservations that have no actual line yet. Latency and capture calls use the same ledger.

### A1.12 Spend cap (section 9)

The round cap stays USD 15.00. Primary variants use the family sub-caps first. The exploratory tier spends only
from the reserve, after the finalist record.
