# Runtime design — how a winning ranking candidate ships

> **Amended.** Contract Amendment 1 (2026-11-03) changes this file. Read the "Amendment 1" section at the end
> first. Where it differs from the text above, it wins. The v1 text is in `v1/`.

This page describes the shipping shape for a variant that passes [contract.md](contract.md). It is
a design, not code. It applies to every family that can ship (a, b, c, d, f). Tier X cannot ship
in this round (R5a). The design is forward-only: the fallback is a first-class runtime mode, not a
compatibility path, and no old format stays beside a new one.

## 1. Request flow

```text
MCP search / codemode.search / playground search
  │
  ├─ prepareCatalogSearch (unchanged validation: service, recoverFrom)
  │
  ├─ pure:  rankingPool(catalog, opts, variant)        ← only for pool-dependent variants
  ├─ host:  evidence = await rankingEvidence(ctx, catalog, opts, pool)   ← the only I/O
  │           ├─ budget check (section 5)            → refuse → fallback
  │           ├─ cache lookup (section 4)            → hit → evidence
  │           ├─ env.AI.run(..., { gateway })        ← parallel parts start together
  │           ├─ race against T = 500 ms             → late → fallback
  │           └─ validate output                     → invalid → fallback
  └─ pure:  searchCatalogPage(catalog, opts, evidence ? { variant, evidence } : undefined)
```

For dense variants, the query embedding starts before any lexical work, because it depends only on
the query. The synchronous lexical stage then runs while the request waits. For pool-dependent
variants (reranker, Clef), the pure pool step runs first. It costs a few milliseconds.

## 2. Code seam

- `src/catalog/ranking.ts` (pure): the `RankingEvidence` type, the single shipped `RankingVariant`
  constant, `lexicalLists`, `rankingPool`, the request builders, the output validators, and the
  fusion operator of the winner. It holds no I/O. Only the winner's operator ships; the other
  operators stay in the round's experiment code.
- `src/catalog/search.ts`: `searchCatalogPage(catalog, opts, ranking?)` and
  `searchCatalog(catalog, opts, ranking?)`. With no `ranking`, the code is the baseline path and
  the result is the fallback page (R3).
- `src/catalog/search-resolution.ts`: `resolve(request, ranking?)` passes the evidence through. It
  stays synchronous.
- `src/ranking/evidence.ts` (host, new): `rankingEvidence(ctx, catalog, opts, pool)`. It owns the
  budget check, the cache, the binding call, the timeout, and the validation. It returns
  `{ evidence?: RankingEvidence; outcome: RankingOutcome }`. It never throws.
- Callers: `src/mcp/tools.ts` (MCP `search`), `src/executor/providers.ts` (`codemode.search`, on
  the host), and `src/demo/tools.ts` (Playground). Each awaits `rankingEvidence`, then resolves.
  The sandbox receives only the finished page, as today. `globalOutbound` stays `null`.

`RankingOutcome` is
`{ mode: "assisted" | "fallback"; reason?: "timeout" | "error" | "invalid" | "budget" |
"rate-limit" | "off"; modelMs: number | null; cache: "isolate" | "colo" | "miss" | null;
inputTokens: number | null }`.

## 3. Timeout and fallback

- One constant, `RANKING_TIMEOUT_MS = 500`, bounds all model work of one search request.
- The adapter races the binding promise (or the `Promise.all` of parallel parts) against a timer.
  The binding API documents no abort signal, so the design does not depend on one. A late result
  is dropped, never merged, and never cached for this request. Its rejection is caught.
- Any one of these gives fallback mode for the whole request: timeout, a thrown error, a gateway
  refusal, a rate-limit refusal, an invalid output (wrong dims, a non-finite value, a missing
  probability, or a missing score), or the operator switch set to `lexical`.
- A family f request never ranks with part of its evidence.
- The fallback page is the baseline lexical page. It is the same page that CI gates in fallback
  mode.

## 4. Vectors, fixture, and cache

**Entry vectors (dense variants only).** A generated artifact, `catalog/ranking-vectors.json`,
holds `{ schema, modelId, dims, entries: { <entryId>: { textSha256, vector } } }`. `vector` is
base64 little-endian Float32. `npm run ranking:embed` builds it after `build-catalog`, through
the operator's `cf` login. The Worker imports it and decodes it once per isolate. At 82 entries ×
768 dims, the raw size is about 250 KB, which fits the Worker bundle.

`getCatalog()` validation gains one check: every searchable entry has a vector whose `textSha256`
equals the hash of its current D(e) text, and the model id equals the shipped variant's model id.
A mismatch throws at load, so a stale vector file cannot reach production. CI's generated-artifact
sync check runs the same check offline. It cannot regenerate the vectors, because CI has no
Cloudflare credential, so its failure message names `npm run ranking:embed`.

**CI fixture.** `eval/ranking-fixture.json` uses the harness format
([harness.md](harness.md) section 4.3). `npm run ranking:fixture` generates it through the `cf`
login. It covers every query that CI grades or tests (contract R10). `eval/run-routing.mjs` grades
assisted mode from the fixture and fallback mode with no evidence, in one run. A missing key is a
hard failure. The fixture SHA-256, the vector file SHA-256, and the model id join the
`eval/gates.json` evidence inputs. Any manifest text change that alters a pool card or an entry
text changes keys, so the author must regenerate both files in the same change.

**Query cache.** Two layers, both keyed by the harness key
(`sha256(modelId + "\u0000" + canonicalBody)`):

1. an in-isolate LRU of 512 records;
2. the Workers Cache API (`caches.default`) on the canonical host, with a synthetic URL that holds
   only the key, and a 7-day TTL. Cache API writes have no effect on `workers.dev`. That is
   acceptable; the isolate layer still works there.

A cache record holds only the model output (vector or scores). It holds no query text. A cache hit
still counts toward the per-caller rate limit, but not toward model spend.

**Model drift canary.** `npm run ranking:canary` replays 40 fixed fixture keys live through the
`cf` login. For vectors, it requires a cosine of at least 0.999 against the committed values. For
score models, it requires the same top-five order on at least 38 of 40 keys. The deploy preflight
in `docs/operations.md` runs it. A failure blocks the deploy until the author regenerates the
fixture and vectors and passes the gates again. A model id change is a new candidate (R8).

## 5. Budget enforcement

The budget is operator-funded and host-side. It has four layers. Each refusal gives fallback mode,
never an error.

1. **Bounded by construction.** The query is cut to 512 characters. The pool is at most 60 entries
   and each card is at most 300 characters. These caps fix the worst-case cost of one call at or
   below USD 0.003 (R6).
2. **Dedicated AI Gateway.** Every search-path model call routes through a new gateway,
   `stellar-raven-search`, separate from `stellar-raven-demo`. A new var `SEARCH_AI_GATEWAY_ID`
   names it. Its dashboard config keeps at least one spend-limit rule (proposed: USD 5 per day)
   and one rate-limit rule (proposed: 3,000 requests per minute), with caching off. A gateway
   refusal is reason `budget`. `docs/operations.md` records the rules, as it does for the demo
   gateway.
3. **Per-caller rate limit.** A Workers Rate Limiting binding, `SEARCH_RANKING_LIMITER`, keys on
   the caller: the OAuth `subjectHash`, the API-key name, or the Playground subject. It allows
   120 assisted searches per 60 s per key. `codemode.search` inside `execute` uses the caller of
   that `execute`. Beyond the limit, search still answers, in fallback mode (reason `rate-limit`).
4. **Per-execute cap.** One `execute` call gets at most 8 assisted `codemode.search` calls. Later
   calls in the same `execute` use fallback mode. This stops a loop in model-written code from
   spending the caller's whole rate allowance.

An operator switch, the var `SEARCH_RANKING_MODE` (`assisted` or `lexical`), forces fallback mode
for every request (reason `off`). It is an incident control, not a second scorer: the fallback
mode is the same code path that every timeout uses.

Production volume is not in this repo. Before the deploy, the operator reads the private usage
report for the recent daily `search` count and checks that the count × the R6 value stays well
under the gateway's daily limit. The ledger records that check without the count.

## 6. Observability

`searchEventFields` in `src/observability.ts` gains these fields on every `search` event (MCP,
sandbox, and Playground):

| Field | Value |
|---|---|
| `rankingMode` | `assisted` or `fallback` |
| `rankingVariant` | the shipped variant id |
| `rankingModelIds` | the exact model ids |
| `rankingFallbackReason` | `timeout`, `error`, `invalid`, `budget`, `rate-limit`, `off`, or null |
| `rankingModelMs` | wall time of model work, or null on a cache hit |
| `rankingCache` | `isolate`, `colo`, `miss`, or null |
| `rankingInputTokens` | the reported or estimated input tokens, or null |

Events never contain query text, vectors, scores, or model output, which follows the existing
no-payload rule. The existing `ms` field keeps the whole search time, so `ms − rankingModelMs`
gives the lexical share. The observability skill gains one query: fallback rate and p50 and p95
`rankingModelMs` per hour. An hourly fallback rate above 5% is the alert threshold to propose.

The MCP response adds one field, `confidence.rankingMode`, with value `assisted` or `lexical`. The
caller then knows which function ranked the page. The tool description states that hit order is
still the ranking to trust in both modes.

## 7. Gates and CI

`eval/gates.json` changes in the shipping commit, and the ledger records it as an explicit
re-baseline:

- `evidence.inputs` adds `eval/ranking-fixture.json` and, for dense variants,
  `catalog/ranking-vectors.json`, with SHA-256 values. `evidence.ranking` records the variant id
  and model ids.
- The legacy, skills, and holdout blocks become the **assisted** profile. Their values are the
  winner's measured values on main. Floors move only upward. The legacy band stays ±1%.
- A new `fallback` block keeps today's values: legacy 218/294/327 with the ±1% band, skills top1
  floor 17, holdout floors 12/26/29 and forbidden ceiling 10.
- `npm run eval:routing -- --gate` checks both profiles in one run and exits 1 if either fails.
- CI needs no secret and makes no model call. The existing generated-artifact sync check adds the
  vector-hash check from section 4.

## 8. Tests

- Unit: the fusion operator against the saved reference pages of the round; `rankingPool`
  determinism; every validator rejection; the per-execute cap; the cache key form.
- Unit, host adapter with a fake `AI` binding: a hanging call gives fallback at 500 ms; a thrown
  error, an invalid output, a gateway refusal, and a rate-limit refusal each give fallback with the
  right reason; a late result is not used.
- `test:smoke` (required, because the change touches `src/executor`): the assembled Worker with a
  fake binding returns assisted pages for fixture queries and fallback pages on timeout, through
  MCP `search` and through `codemode.search`. The existing `globalOutbound: null` assertions stay.
- The routing gate in both profiles, as section 7 says.

## 9. Proposed `AGENTS.md` rule text

Replace the hard rule "Any paid or side-effecting model operation requires host-side
request-context approval, elicitation, and budget enforcement before it can ship." with these two
bullets:

```markdown
- Any paid or side-effecting model operation that a caller triggers requires host-side
  request-context approval, elicitation, and budget enforcement before it can ship.
- One exception: the `search` ranking call. It may call one pinned Workers AI model through the
  `AI` binding and the dedicated search AI Gateway, never a provider outside Cloudflare. It must
  keep a hard timeout with fallback to the lexical page, a bounded per-call cost, a gateway spend
  limit, and a per-caller rate limit. The routing gate must grade it offline from the committed
  fixture, and the lexical fallback must pass its own gate profile. Changing the model, the
  provider, or these bounds needs a new pre-registered round
  (`.agents/rounds/2026-11-03-model-ranking/contract.md`).
```

Reason for the change: the existing rule protects callers from paid or side-effecting operations
that they start, such as the paid Lumenloop research trigger. Search ranking has no side effect,
stores no user data, and its cost falls on the operator with a fixed bound per call. Approval and
elicitation have no meaning there. The exception keeps the rule's intent through the operator
budget layers in section 5.

The owner must sign this text. The independent review of the shipping change reviews it too.

## 10. Documentation changes in the shipping commit

- `ARCHITECTURE.md` section 2 (one new stage: optional model evidence and the fallback), section 7
  (timeout, rate limit, per-execute cap), and section 9 (the new event fields).
- `src/catalog/README.md`: the fusion operator, the pool, and the fallback identity.
- `wrangler.jsonc`: the `AI` binding comment stops saying "Playground-only"; add
  `SEARCH_AI_GATEWAY_ID`, `SEARCH_RANKING_MODE`, and the rate-limit binding.
- `docs/operations.md`: the search gateway rules, the canary in the deploy preflight, and the
  switch.
- `eval/EVALS.md` and `eval/README.md`: the two gate profiles and the fixture.
- `.agents/TODO.md`: delete owner decision B and record the result in the round ledger. If the
  winner leaves lexical matching unchanged, the structured-routing item stays open (contract Q7).
- `PLAN.md`: the search capability line.

---

## Amendment 1 (2026-11-03; contract Amendment 1, items N9, N10, N14, N16–N20)

This section was written before any candidate was built or measured. Where it differs from sections 1–10, it
wins.

### A1.1 Request flow: lexical work runs once (N20)

- Dense variants: call `env.AI.run` first. The call starts the subrequest. Then compute `lexicalLists`
  synchronously while the subrequest is in flight. Then await the evidence.
- Pool-dependent variants: compute `lexicalLists` once. Derive the pool from it. Pass the same lists on.
- `searchCatalogPage(catalog, opts, ranking?)` accepts the precomputed lists inside `ranking`, so the pure stage
  never scores twice. With no `ranking`, the function is the unchanged baseline path.
- `deriveServiceFilterExcludedSkillAdvisories` keeps its two-argument lexical call. It makes no model call.

### A1.2 One output validator (N14; replaces the validation list of section 3)

One module in `src/catalog/ranking.ts` validates every model output. The harness, the CI fixture loader, and
the host adapter use the same rules:

- embeddings: one vector per text; length equals the declared dims; every value finite; not all zero;
- reranker: exactly one score per context index; each index once; every score finite;
- Clef: `answers.best.probabilities` is an object; every key is an option id of the pool; every value is finite
  and in [0, 1]; the values sum to at most 1.001; at least one value is above 0. An option with no key gets 0
  and is absent from the Clef order.

An output that fails any rule is invalid and gives fallback mode. The v1 phrase "a missing probability" is
replaced by these rules.

### A1.3 Cache safety and privacy (N18; changes section 4)

- Write to either cache layer only an output that passed the validator and arrived before T. Never write a
  late, invalid, error, or partial output.
- The Cache API URL is `https://<canonical host>/_internal/ranking-cache/v1/<hmac>`. `<hmac>` is
  HMAC-SHA256 of the fixture key, with a key that the host derives from `MCP_SERVER_SECRET` with HKDF and the
  label `raven-ranking-cache-v1`. So the URL does not reveal a guessable query hash. The isolate LRU may use the
  plain fixture key, because it stays in memory.
- Validate a cached record again on read. An invalid record is a cache miss.
- Run `caches.default.put` inside `ctx.waitUntil`. Catch every Cache API error and treat it as a miss.
- `rankingModelMs` is the full evidence wall time: the Cache API lookup on a `colo` hit, 0 on an `isolate` hit.

### A1.4 Model drift canary (N17; changes section 4)

The canary keeps its checks. A canary failure has one result: the operator sets `SEARCH_RANKING_MODE` to
`lexical` and a new pre-registered round starts. Regenerating the fixture or vectors alone never restores
assisted mode. The canary may use the `cf` path, because the production-path check (contract N17) compared that
path with the Worker binding path for the finalist.

### A1.5 Caller identity, caps, and fallback health (N19; changes sections 5 and 6)

- `registerTools` options and `ExecuteCallContext` gain `env` access for ranking and a `callerKey`:
  `oauth:<subjectHash>`, `api-key:<name>`, `demo:<subject>`, or `dev-local`. An OAuth call with no subject uses
  the shared key `unknown`. When that bucket is full, search answers in fallback mode.
- The per-execute cap counts model calls (cache misses) only. A cache hit does not count toward it. The
  per-caller rate limit counts every assisted search.
- `RankingOutcome.reason` and `rankingFallbackReason` gain `execute-cap`.
- The hourly fallback alert (above 5%) is mandatory before deploy. It excludes `off` and `execute-cap`.
- The owner signs the exact gateway spend limit, gateway rate limit, and per-caller limit before deploy.
- After deploy, the operator checks the first 24 hours of production events. If p95 `rankingModelMs` is above
  400 ms, or the fallback rate (without `off` and `execute-cap`) is above 2%, the operator sets
  `SEARCH_RANKING_MODE` to `lexical`.
- `test/smoke/vitest.config.ts` sets `SEARCH_RANKING_MODE: "lexical"` by default. The assisted smoke tests set
  `assisted` and use a fake `AI` binding.

### A1.6 Gates and CI (N9, N16; replaces section 7 and adds to section 8)

- `eval/gates.json` keeps two profiles. The **fallback** profile is today's block, with the legacy ±1% band.
  The **assisted** profile has a floor for every strict metric that contract Q2 protects: legacy top1, top3,
  top5, and `cardHit5`; extended top1, top3, top5, and `cardHit5`; skills top1, top3, and top5; holdout floors
  and the forbidden ceiling. The floors are the finalist's measured values on main. The assisted profile has no
  upper bound, so a later gain does not fail CI.
- `eval/run-routing.mjs` changes in the shipping commit: it grades both profiles in one run, checks the
  assisted profile with floors (`o[k] < floor`), checks the fallback profile with the band, and exits 1 if
  either fails.
- New test file `test/ranking-assisted.test.ts`. It runs in `npm test` from `eval/ranking-fixture.json` (and
  `catalog/ranking-vectors.json` for dense variants), in assisted mode. It covers: the RWA discovery positives
  and ordinary negatives as vetoes; the three mixed controls as recorded diagnostics; checks 1–6 (check 4 as a
  diagnostic); the G10 probe; and the eight attributed rows.
- `test/drift-141-routing.test.ts` stays frozen. It tests the two-argument (fallback) path, which R3 keeps
  identical. The v1 contract Q6 instruction to remove its `it.fails` marker is withdrawn.

### A1.7 Proposed `AGENTS.md` rule text (N10; replaces section 9's second bullet)

```markdown
- Any paid or side-effecting model operation that a caller triggers requires host-side
  request-context approval, elicitation, and budget enforcement before it can ship.
- One exception: `search` ranking. It may call the pinned Workers AI model set of the accepted
  variant through the `AI` binding and the dedicated search AI Gateway, never a provider outside
  Cloudflare. One hard timeout bounds all its model work, with fallback to the lexical page. One
  bound caps the total cost of all its calls for one search. A gateway spend limit and a
  per-caller rate limit apply. The routing gate grades it offline from the committed fixture, and
  the lexical fallback passes its own gate profile. A change to the model set, the provider, or
  these bounds needs a new pre-registered acceptance contract.
```

The reason for the exception is unchanged from section 9. The owner signs this text, and the independent review
of the shipping change reviews it.
