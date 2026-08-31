# Vectorize frontier experiment

Todo 902 tests the remaining discovery hypothesis from the July 9 redesign: can a stronger,
reproducible embedding layer improve mixed-register entity→LumenLoop routing after prose and
lexical cards reached their measured ceiling?

This is an isolated reference harness, not production code. Cloudflare documents that neither
Vectorize nor Workers AI has a local simulation; local Workers must use remote bindings for those
products ([Cloudflare local-development bindings](https://developers.cloudflare.com/workers/local-development/)).
The harness therefore uses exact local cosine search over a committed vector artifact—the
deterministic reference for a possible versioned Vectorize index—rather than creating live account
state. It uses the same Qwen3-Embedding-0.6B model family Cloudflare exposes as
`@cf/qwen/qwen3-embedding-0.6b` ([Cloudflare model page](https://developers.cloudflare.com/workers-ai/models/qwen3-embedding-0.6b)).

## Reproducibility contract

- Model: `onnx-community/Qwen3-Embedding-0.6B-ONNX` at immutable Hugging Face commit
  `c25a394dd583836952667c12f008335071b3f43d`.
- Runtime: exact `@huggingface/transformers@4.2.0`; q8 ONNX weights; last-token pooling;
  normalized 1,024-dimensional vectors; cosine/dot-product ranking.
- Query instruction: `Given a Stellar ecosystem search query, retrieve the exposed operation
  routing card that can ground it`.
- Cards: the 72 SEARCHABLE manifest entries (54 operations + 18 whole skills). Narrowed from
  all 276 exposed entries on 2026-07-30: the policy reranks `searchCatalog` candidates, which
  never include `searchable: false` entries, so the 204 skill-section vectors were unreachable
  by construction. The surviving cards kept their original vectors bit-for-bit (sliced from the
  prior artifact, no re-embedding), so measured results are unchanged. Each card combines exact id/kind, source-family
  purpose/authority, catalog description, and any generated workflow question shapes that
  reference it. No excluded operation or uncommitted partner detail enters the artifact.
- **Coupling with live catalog prose (resolved 2026-07-30).** Card text is built from live catalog
  entry descriptions plus `SERVICE_FAMILY_PURPOSES` in
  `scripts/catalog-data/workflow-archetypes.mjs`. `loadFrontierArtifact()` still refuses any
  card-set drift — correct for anyone RUNNING the experiment, since stale vectors would produce
  meaningless rankings — but the unit-suite integrity test now calls
  `loadFrontierArtifact({ requireCatalogMatch: false })` and asserts the artifact's own payload
  hash and shape instead. Before that split, editing any catalog description failed an unrelated
  unit suite until a re-embed, and re-embedding is documented below as hazardous; the practical
  result was that a knowingly-false word ("bundled") shipped to every MCP client rather than pay
  that cost. A banked no-ship measurement must not hold live model-facing text hostage. Re-embed
  deliberately when re-running the experiment, not to fix prose.
- Artifact: `artifacts/qwen3-embedding-0.6b-q8-c25a394.json`, with per-card text hashes, card-set
  hash, model/runtime config, base64 little-endian float32 vectors, and vector payload hash. Tests
  refuse card, model, or payload drift. In the environment verified on 2026-07-27, the pinned q8
  build was bit-reproducible. The pre-rebaseline vectors on `main` came from a divergent,
  unrecoverable environment/model state (mean cosine about 0.90 versus the current build, with zero
  identical vectors). `cardSetSha256` records input-card provenance and `vectorsSha256` records
  output-vector provenance. An unexpected `vectorsSha256` change on rebuild is a red flag to
  investigate the environment and model-cache state, not expected noise.
- Policy: `semantic-rerank-lexical-top20-v1`. The shipped lexical scorer produces 20 candidates;
  the fixed semantic score reranks them, then returns the requested page. One global policy is
  used for every lane; there is no per-case or per-service tuning.

Build the artifact only when intentionally refreshing the pinned experiment:

```sh
npm run eval:vectorize:build
```

Run the deterministic routing/replay referee:

```sh
npm run eval:vectorize:run
```

For agent A/Bs, start the isolated search-only MCP harness (not Wrangler) and point
`eval/discovery/run-agent-discovery.mjs` at it:

```sh
npm run eval:vectorize:serve -- --port 8792
```

## Preregistered ship gate

The July 9 decision is binding: ship only if the mined target lane improves at least +5 percentage
points family top-1 or +3 points family top-5 after per-case net win/loss review, while the official
legacy and skills gates pass, extended accept-either top-5 stays 122/122, every docs agent sample
is 12/12, and scout medium is at least 9/10 in every sample. Agent behavior is sampled at least
three times per arm and reported as a per-case matrix. A target gain cannot offset a blocking
regression.

## Results — 2026-07-10: measured no-ship

Local-only evidence stamps:

- offline frontier: `2026-07-10T04-33-01-150Z-vectorize-frontier.json`;
- lexical medium agent arm, three runs: `2026-07-10T03-32-14-241Z-lexical-medium-3x-agent.json`;
- vector medium agent arm, three runs: `2026-07-10T03-56-45-883Z-vector-medium-3x-agent.json`.

Validation setup note: the fresh worktree initially lacked the repository's ignored generated
`env.d.ts`, so the first typecheck and an incomplete local `typegen` attempt reported missing
Worker bindings. No runtime source or test was changed for that setup artifact. The ignored file
was copied from the primary checkout only after both checkouts were verified at
`7cf6213ccd4d95016b07620ffb439552367f4bba`; source and copy both had SHA-256
`eb7f1c5058dcd8045077d3914c3c99f5f62bf3d1b3ce068e4c641ee94b66d228`. The copied file is not
committed, and typecheck then passed.

The offline harness first reproduced the shipped lexical counts exactly. This calibration is a
hard validity check, not a reported win.

| lane | lexical | Qwen frontier | gate reading |
| --- | ---: | ---: | --- |
| legacy strict top-1/3/5 (338) | 213 / 267 / 305 | **95 / 218 / 279** | FAIL all three |
| skills top-1/3/5 (23) | 18 / 22 / 22 | 22 / 23 / 23 | pass |
| extended strict top-1/3/5 (122) | 79 / 104 / 110 | **40 / 87 / 106** | regression |
| extended accept-either top-1/3/5 (122) | 110 / 121 / 122 | **46 / 97 / 114** | FAIL 122/122 hold |
| mined LumenLoop family top-1 (91 queries) | 20/91 (22.0%) | **12/91 (13.2%)** | −8.8 points |
| mined LumenLoop family top-5 | 37/91 (40.7%) | **42/91 (46.2%)** | +5.5 points; lift clears |
| mined usable operation top-5 | 28/91 (30.8%) | **29/91 (31.9%)** | +1 occurrence |

The target replay clears the top-5 lift threshold, but not the composite ship gate: every legacy
check and the extended 122/122 hold fail. Top-1 also moves backward by 8.8 points. Per-case replay
counts show the tradeoff rather than hiding it in the aggregate:

| target case (occurrences) | lexical top-1 | vector top-1 | lexical top-5 | vector top-5 | usable op top-5 |
| --- | ---: | ---: | ---: | ---: | ---: |
| tokenized RWA freshness (15) | 0 | 0 | 1 | 3 | 1→0 |
| Aquarius what-is (6) | 0 | 6 | 0 | 6 | 0→6 |
| Comet content (14) | 2 | 0 | 6 | 8 | 3→2 |
| Phoenix SCF (8) | 4 | 2 | 5 | 7 | 5→7 |
| RWA overview (8) | 0 | 1 | 1 | 2 | 1→2 |
| Soroswap what-is (12) | 2 | 2 | 5 | 5 | 5→5 |
| LOBSTR wallet (12) | 1 | 0 | 3 | 3 | 2→3 |
| Blend TVL (16) | 11 | 1 | 16 | 8 | 11→4 |
| **total (91)** | **20** | **12** | **37** | **42** | **28→29** |

Aquarius supplies all six of its new top-5 hits while Blend loses eight, and top-1 has the inverse
imbalance (Aquarius +6, Blend −10, plus Comet/Phoenix/LOBSTR losses). The +5.5-point top-5 target
gain is real, but it cannot offset the preregistered blocking regressions.

### Three-run agent matrix

Cells are the selected primary family: `LL` LumenLoop, `SC` Scout, `SK` skills, `ER` timed-out
agent. The baseline selected LumenLoop for Comet and Phoenix in all three runs (2/8 = 25% each).

| target case | lexical 1 | lexical 2 | lexical 3 | vector 1 | vector 2 | vector 3 |
| --- | --- | --- | --- | --- | --- | --- |
| tokenized RWA freshness | SC | SC | SC | LL | SC | SK |
| Aquarius what-is | SC | SC | SC | SC | LL | LL |
| Comet content | LL | LL | LL | SC | LL | LL |
| Phoenix SCF | LL | LL | LL | LL | LL | LL |
| RWA overview | SC | SC | SC | SC | SC | ER |
| Soroswap what-is | SC | SC | SC | SC | SC | SC |
| LOBSTR wallet | SC | SC | SC | LL | LL | SC |
| Blend TVL | SC | SC | SC | SC | LL | SC |
| **LumenLoop primary** | **2/8** | **2/8** | **2/8** | **3/8** | **5/8** | **3/8** |

The vector mean is 45.8% versus 25.0% baseline (+20.8 points), but the gains are unstable and
zero-sum: one Comet loss offsets a tokenized-RWA win in run 1; Aquarius and LOBSTR move in only
two runs; Blend moves once; RWA overview times out once. The independent replay is negative at
top-1 and the blocking gates fail, so this agent-primary movement does not clear the composite
ship gate.

The agent arm also has a known surface confound: its lexical endpoint is the full shipped server
with generated micro-map/search guidance, while the isolated frontier endpoint intentionally
implements only the search tool and its experimental description. It is useful as a caller-level
stress sample, not a surface-identical retrieval A/B. The offline replay runs both policies through
the same catalog/search code and independently decides the no-ship result; no claimed win relies
on the confounded agent comparison.

Blocking guardrails fail directly:

| guard | lexical runs | vector runs | required |
| --- | --- | --- | --- |
| docs primary (12) | 11 / 12 / 12 | **11 / 12 / 11** | 12/12 every run |
| docs visible family@3 | 12 / 12 / 12 | **7 / 7 / 11** | no cannibalization |
| scout primary (10) | 9 / 9 / 9 | **8 / 9 / 8** | ≥9/10 every run |
| scout visible family@3 | 9 / 9 / 10 | **3 / 3 / 6** | no cannibalization |

The vector arm fails docs 100% in two of three runs and scout-medium in two of three. The visible
ranking collapse is broader than the primary-selection loss because the model sometimes recovers
from prior knowledge; that recovery is not retrieval credit.

**Decision: NO SHIP.** No Vectorize binding, production scorer, runtime query embedding, deploy,
or index state is added. The honest artifact is this reusable isolated harness, pinned vector
artifact, replay lane, raw local results, and negative decision record. Nothing new surfaced as an
upstream service defect: the failure is this repo's retrieval experiment, so `improvements/` is
unchanged.

### Drift-maintenance refresh (2026-07-11, issue #19)

Scout 1.7.15 and the three added Docs monitoring titles changed routing-card text without changing
the 272-entry card count. The artifact was regenerated through
`npm run eval:vectorize:build`, and the referee's lexical calibration was advanced to the shipped
213/271/304 legacy and 18/22/22 skills results. The refreshed run
`2026-07-11T19-07-10-806Z-vectorize-frontier.json` passed calibration, then again rejected the
semantic arm: frontier legacy 95/211/269, extended strict 42/88/109, extended accept-either
50/100/116, and mined replay deltas −15.4 points top-1 / −8.8 points top-5. The command exits 1
by design when `triggerCleared:false`; this remains a measured no-ship experiment, not a failing
production gate.

## Clause-fit measurement attempt (2026-08-31)

The `clause-fit-hysteresis-v1` harness builds 683 mechanical routing clauses across 79 searchable entries.
It excludes all keyword fields and keeps the production scorer unchanged.
The membership gate includes `scout.searchResearch` for all 19 frozen positive questions.

The first free model fetch built the pinned artifact successfully.
Its SHA-256 is `e5f86644af89158c3ac4d61ee7f651e2a062c9d292f194cb94872c7eee4e71f4`.
All 21 offline tests pass against that artifact.

The first referee stopped before scoring because a new process lacked local tokenizer metadata.
A reviewed finish copied the pinned model files into a machine-local snapshot. It then added a
local-only loader and preflight. The preflight probe-vector SHA-256 is
`d32aabf37d5aaeda98bd2c817cc7d38c6b746f82c89d874f982d8016fbaf4b4b`.

The one authorized finish referee completed all five readings. The result stamp is
`2026-08-31T16-58-42-389Z-clause-fit-hysteresis-v1`. The query-cache SHA-256 is
`65ca5052c5258aeb1f5a30e93a1b9c1fde61aace80c8b3fdd4d044346385b8c2`, and the result
SHA-256 is `17e75f0d1b13848aa2e0841624e8496c558624493d156c3cb2115301a6a9cda0`.

| Reading | Original top-five / controls | Blind top-five / controls | Routing gate | Outcome |
| --- | --- | --- | --- | --- |
| identity | 4/8, 1/4 | 3/11, 6/9 | pass | calibration only |
| pure fit | 0/8, 2/4 | 2/11, 1/9 | fail | diagnostic only |
| `m = 0.03` | 4/8, 1/4 | 4/11, 2/9 | fail | fail |
| `m = 0.06` | 4/8, 1/4 | 4/11, 6/9 | fail | fail |
| `m = 0.10` | 4/8, 1/4 | 3/11, 6/9 | fail | fail |

The `m = 0.03` and `m = 0.06` grids increased blind top-five from 3 to 4.
Original top-five stayed 4, and every grid failed the routing gate and both control bars.
The measured outcome is `FAIL` with `selected: null`. No production search code changed.
The harness and artifact remain as the frozen instrument.

See `.agents/rounds/2026-08-31-eval-routing-next/finish-result-sol.md` for the full command record.

## Cross-encoder measurement attempt (2026-08-31)

The `cross-encoder-fit-v1` experiment is attempt two of the protocol-history routing box.
It reuses the frozen 683-clause set from the clause-fit attempt
(`clauseSetSha256` `cc5df2e4d89522c580626cfc21727b927494f5f528f42acfa035187a211d89e5`, artifact
`e5f86644af89158c3ac4d61ee7f651e2a062c9d292f194cb94872c7eee4e71f4`) and swaps only the model
class. The pinned model is `Xenova/bge-reranker-base` at commit
`280bcc27a84e0b898c251e06fddb25171bd9b101` (base `BAAI/bge-reranker-base`), q8 ONNX, loaded
directly through `AutoTokenizer` plus `AutoModelForSequenceClassification` with `text_pair`
encoding, `max_length` 512, and one sigmoid over the raw logit. The snapshot parent is
`~/.cache/stellar-raven/bge-reranker-base-q8-280bcc2`, local-only with no runtime fetch path.

The single fetch and referee each ran once under review gates. The preflight ran twice.
Its first run recorded the probe-score SHA-256. Its second run confirmed the same value after
the implementation commit: `e2bc86efb15f5232993b0bf5f63b5ce55cc7241abaec6a7e54364a13b664331b`.
The implementation commit is `2763fb0afd4e6811f449cb6b1f56f2baf85e3734`, on Node `v24.13.0`
with `onnxruntime-node` `1.24.3` on `darwin`. The five byte-hash file pins live in the round
ledger, `.agents/rounds/2026-08-31-protocol-history-cross-encoder-v1.md`.

The one authorized referee scored all 383,273 pinned pairs and wrote its result. The stamp is
`2026-08-31T23-36-38-660Z-cross-encoder-fit-v1`. The score-cache SHA-256 is
`fa1252fc8bfbf62b6f69bb8ca431cf603d2b512e4d0299b2ca0de0d7c2cec0bc`, and the result SHA-256 is
`529351b1562b14f68d18ef94b584ca37ae61290f68cfff7a5a1489e8b601ae0d`.

| Reading | Original top-five / controls | Blind top-five / controls | Routing gate | Changed rankings | Outcome |
| --- | --- | --- | --- | ---: | --- |
| identity | 4/8, 1/4 | 3/11, 6/9 | pass | 0 | calibration only |
| pure fit | 5/8, 2/4 | 3/11, 4/9 | fail | 495 | diagnostic only |
| `m = 0.05` | 4/8, 1/4 | 3/11, 6/9 | fail | 338 | fail |
| `m = 0.10` | 4/8, 1/4 | 3/11, 6/9 | fail | 276 | fail |
| `m = 0.20` | 4/8, 1/4 | 3/11, 6/9 | fail | 215 | fail |

Every registered grid kept both frozen contracts at the lexical baseline while failing the
routing gate. Among the grids, `m = 0.20` had the fewest gate failures (four) and the fewest
changed rankings (215). The measured outcome is `FAIL` with `selected: null`, and the
independent Terra verification recomputed all five readings from the stored cache and passed.
No production search code changed. No `improvements/` finding applies: the result measures
this repository's ranking. Attempt two is spent; attempt three remains unused and needs its
own reviewed brief with a distinct mechanism.

See `.agents/rounds/2026-08-31-protocol-history-cross-encoder-v1.md` for the full record.
