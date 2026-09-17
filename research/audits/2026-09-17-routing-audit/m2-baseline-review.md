# M2 baseline review: q-defi-soroswap-what-is, runs B1a and B1b

- **Date:** 2026-09-17.
- **Mode:** read-only. No candidate results were read. No paid calls or repository edits.
- **Criteria:** `/tmp/raven-routing-audit-2026-09-17/paid-comparison-review-criteria.md` (SHA-256
  `f5da74841e909c14bfdfd7e42b843bc18ea2620ec912681cc77a8ecf2f7035a6`).
- **Machine-readable mappings** (in `/tmp/raven-routing-audit-2026-09-17/paired-review/`):

| File | SHA-256 |
|---|---|
| `M2-B1a-baseline-mapping.json` | `ca0cc36be7224a98509fe3d7f6352c671c24e3fd863643ed109c370fc4d1e42f` |
| `M2-B1b-baseline-mapping.json` | `4a2449b689e073f889faff27c01886be03e26850819e13ddae30c23980cc13ce` |
| `M2-B1-baseline-summary.json` | `abcc27c0aa6e5b5c0317c516c7241453fae1bdba28f050e47b6c4c15a8eb5a1c` |
| `evidence-scout-soroswap-2026-09-17.json` (Scout record snapshot) | `f6c38c2530567c2aab46dd9fd724a8d1d27da3cacfe2ec040e314d2d778f4caa` |

## 1. Artifacts and validity

| Run | Artifact | SHA-256 | Validity |
|---|---|---|---|
| B1a | `repo/eval/qa/results/2026-09-17T02-31-40-variantA.json` | `7ee79dd9a76b313f3ba6c2110fbeda6176daabcfd459bbf01cb36c61ccc8e0a7` | valid |
| B1b | `repo/eval/qa/results/2026-09-17T02-34-22-variantA.json` | `951c2e4b17f97cd08bd5c2318374f927485c1d0d72f7c1409fe496d45c02d5b3` | valid |

Checks for both runs:
- `meta.comparable: true`; cost accounting complete (B1a $0.4686228, B1b $0.4990802); 1 row; no
  unattempted IDs
- `agent.failure: null`; `raven` MCP `connected`; outcome `graded-partial`
- tuple claude-sonnet-5 / claude-sonnet-5, rubric v2.10, pack p6, `stability-boundary-v1`, panel tier
- server revision `848edec4c9a156ef16f71dc0605409aa59c0be5c`
- selected case-content serialization hash (`meta.inputSnapshot.casesSha256`)
  `871708dd513d2b59e91fc4a2c2e51f4925d7c125aa59cbe94960e4f3aadf919d`; this is not the compiled
  `eval/qa/cases.json` file SHA-256 (`3b1aef67…`)
- `caseInputSha256` `d945e065b0e37ede78593ab7649367d1633934223377bfe8ac1b3f9824172711`, identical in
  both runs. C1a and C1b must carry the same value.

## 2. Golden reference (corrected golden, pin c6968e74)

KeyFacts:
0. Identifies the PaltaLabs Soroban AMM and aggregation stack.
1. Treats contract, API, and UI as distinct product layers.
2. Attributes marketing chronology to Soroswap.
3. Dates each current adapter set.

Avoid:
0. Do NOT state first/best marketing as independently proven history.
1. Do NOT claim classic SDEX is directly executed by the on-chain Soroban aggregator or that code
   presence proves an active adapter.

**Grading authority:** the verified adapter configuration, per the committed golden. No
attribution safe harbor exists beyond the golden.

## 3. Key-fact mapping (from actual answer wording, not judge paraphrase)

| KeyFact | B1a | B1b |
|---|---|---|
| 0 PaltaLabs Soroban AMM + aggregation stack | **present** — "DEX and DEX aggregator built on **Soroban** … open-source AMM … built by **Paltalabs**" | **present** — "open-source AMM … plus a swap-routing aggregator layer … **Built by:** Paltalabs … Soroban smart-contract layer" |
| 1 contract/API/UI distinct layers | **weak/partial** — lists "core (Rust), SDK (TypeScript), aggregator (Rust), frontend", but credits the "Route API" with routing across Soroban AMMs "*and* the classic … SDEX, aiming for best on-chain execution", and ends "the routing layer that sits on top of other Soroban AMMs plus SDEX in one swap" | **weak/partial** — lists `soroswap/core`, `soroswap/aggregator`, `soroswap/sdk`, `soroswap/v2-frontend`, but says the "swap Route API" routes across AMMs "*and* the classic SDEX order book — so it functions as a meta-router", and "an aggregation layer that also reaches into the classic SDEX order book" |
| 2 marketing chronology attributed | **present, with conflict** — intro attributes "the first decentralized exchange (DEX) and DEX aggregator on Stellar Soroban" to the ecosystem directory; heading 3 says "**First-mover Soroban AMM + aggregation combo.**" without attribution | **present, with unverified chronology** — directory quote plus "It positions itself as the first Soroban DEX, predating other Soroban AMMs like Phoenix and Aquarius." |
| 3 adapter set dated | **absent** — Phoenix and Aquarius named as sources; no date and no pause-state check. The "as of 2026-09-14/15" stamp covers the key-facts block. | **absent** — Phoenix named as "one of the liquidity sources Soroswap's aggregator routes through"; no date and no pause check. The "(as of 2026-09-15/17)" stamp covers the peer comparison. |

## 4. Baseline wrong claim missed by the judges (both runs)

**Claim:**
- B1a: "Aggregator router contract: `CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH`"
- B1b: "aggregator router contract `CAG5LRYQ…`, deployed since 2024-03-11, ~267K events"

**Truth, confirmed independently:**
- `soroswap/core` `public/mainnet.contracts.json`: `ids.router` =
  `CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH`. This is the Soroswap **AMM router**.
- `soroswap/aggregator` `public/mainnet.contracts.json`: `ids.aggregator` =
  `CAYP3UWLJM7ZPTUKL6R6BFGTRWLZ46LRKOXTERI2K6BIJAWGYY62TXTO`.
- cs-002 `get_adapters`: the protocol 0 (Soroswap) adapter's router is `CAG5LRYQ…`.

**Cause (upstream source defect):**
- The Scout Soroswap record, fetched 2026-09-17, has `onchain.contracts[0]` = `{address
  CAG5LRYQ…, label "aggregator router", createdAt 2024-03-11T16:23:45Z, events 267684, source
  stellar.expert}`.
- Both answers relay that label.
- The source defect is tracked by the sls-085 draft, which is outside the repository. This lane did
  not edit it.

**Classification:**
- A **baseline wrong claim**, a layer conflation against keyFact 1.
- The judges missed it: `wrongClaims: []` and `avoidMatches: []` in both runs.
- **It is not a candidate regression.** If C1a or C1b repeats it, that is not a new loss. If a
  candidate omits it, that is not a gain claim.

## 5. Avoid review (reviewer, not judge)

| Avoid | B1a | B1b |
|---|---|---|
| 0 first/best as proven history | **fired** — unattributed heading "First-mover Soroban AMM + aggregation combo" | **unresolved** — "predating other Soroban AMMs like Phoenix and Aquarius" may be asserted chronology (scope ambiguity); truth not verified |
| 1 SDEX executed by on-chain aggregator / code presence as active adapter | **not fired (ambiguous)** — SDEX routing credited to the Route API; "in one swap" blurs layers but does not name the aggregator contract | **not fired (ambiguous)** — SDEX credited to the Route API; "aggregation layer … reaches into the classic SDEX order book" blurs layers |

**Judge paraphrase caution (B1a):** the rationale says the answer "carefully separates the on-chain
Route API's SDEX inclusion from the aggregator contract". The answer contains no such separation and
never says "on-chain Route API". The B1b rationale correctly calls layer separation weak.

## 6. Current adapter-state assertions

- Both runs imply that Phoenix and Aquarius are current routing sources. This is consistent with
  the verified configuration (Soroswap, Phoenix, and Aqua unpaused; cs-002).
- Both are undated, so keyFact 3 stays absent.
- Neither run cites the stale Soroswap docs labels.

## 7. Other claims checked

| Claim | Run | Check | Status |
|---|---|---|---|
| TVL ~$1.2M (DefiLlama, as of 2026-09-14) | both | `api.llama.fi/protocol/soroswap` 2026-09-14 = $1,196,231 | true |
| SCF $346,750 across rounds 15, 17, 21 plus Q1'24 Liquidity Award | both | matches `q-scf-history-soroswap` golden | true |
| Audits by OtterSec and Runtime Verification, latest 2025-03-17 (B1b: 3 audits, code changed since) | both | Scout audits `{count 3, auditors [OtterSec, Runtime Verification], latestAt 2025-03-17, codeChangedSinceAudit true}` | source-consistent (Scout only) |
| Aquarius ~$37.5M TVL | both | DeFiLlama `aquarius-stellar` 2026-09-17 = $37,216,305 | approximately true; undated in answer |
| LumAgg (B1a); StellarBroker and LumAgg are pure aggregators (B1b) | both | not re-verified | unverified; not golden-relevant |
| Soroswap predates Phoenix and Aquarius Soroban AMMs | B1b | not re-verified | unverified chronology |

## 8. Judge verdicts (context only)

| Run | Score | coreAnswer | Tier | missingFacts theme | wrongClaims | avoidMatches |
|---|---|---|---|---|---|---|
| B1a | partial | correct | panel | undated adapter set (3 entries) | [] | [] |
| B1b | partial | correct | panel | undated adapter set (3 entries) | [] | [] |

## 9. Transcript evidence

**B1a:**
- Search 1 "Soroswap": `lumenloop.find_content_about_project`, `lumenloop.list_research`,
  `lumenloop.search_directory`, `stellarDocs.search_doc_titles` (no `scout.searchProjects`).
- Search 2 "Soroban DEX AMM comparison": `stellarDocs.search_soroban_contract_docs`,
  **`scout.searchProjects`** (rank 2), `scout.searchRepos`, and others.
- Execute 1 (26,725 chars): `lumenloop.search_directory`, `scout.searchProjects` (type DEX; q
  soroswap), `stellarDocs.search_docs`, `lumenloop.find_content_about_project`.
- Execute 2 (5,120 chars): `stellarDocs.search_protocol_concepts_docs`, `scout.searchProjects`
  (q Comet DEX).

**B1b:**
- Search 1 "Soroswap DEX AMM Soroban": **`scout.searchProjects`** (rank 1),
  `stellarDocs.search_soroban_contract_docs`, `scout.searchRepos`,
  `lumenloop.find_content_about_project`, `lumenloop.search_directory`, and others.
- Search 2 "Stellar decentralized exchange DEX comparison": skills and Docs hits only.
- Execute 1 (26,766 chars): `lumenloop.search_directory`, `scout.searchProjects` (type DEX; q
  Soroswap), `stellarDocs.search_protocol_concepts_docs`, `lumenloop.find_content_about_project`.
- Execute 2 (4,777 chars): `scout.searchProjects` (q Aquarius AMM Stellar),
  `stellarDocs.search_protocol_concepts_docs`.

**Both runs:**
- Reached `scout.searchProjects` through reformulated queries.
- Neither queried adapter state (no `get_adapters`, no deployment file).
- Execute result bodies are not stored, so a live re-check is needed for any disputed fact.

**D3 relevance:** among the frozen 501 QA questions, D3 changes the search ranking only for this
Soroswap question's verbatim text. That does not mean no other query can change: the agent issues its
own reformulated queries, and D3 may rank some of those differently. Candidate comparisons must check
the actual transcript queries and their result pages. A candidate that does not reach
`scout.searchProjects` is a mechanism difference to record, not a loss by itself.

## 10. Rules for the pending C1a and C1b comparison

1. **Pairing:** C1a↔B1a and C1b↔B1b. Compare per pair, never against the union of both baselines.
2. **Row validity:** the candidate row is invalid only for a completeness, comparability, or
   transport guard failure, including a `caseInputSha256` different from `d945e065…`. Other
   failures are reviewed as fact quality.
3. **Loss candidates (verify by transcript plus live re-check):** relative to the paired baseline,
   any of:
   - the candidate lacks keyFact 0 or keyFact 2 (attributed chronology)
   - keyFact 1 drops below the baseline's weak mark (for example, it asserts that the on-chain
     aggregator executes SDEX)
   - the candidate adds a wrong claim or avoid hit that the paired baseline lacked
4. **Baseline defects:** the router mislabel (both runs) and the B1a first-mover heading are
   baseline defects. Their repetition is not a new loss; their absence is not a gain.
5. **keyFact 3:** absent in both baselines, so it cannot be lost. A dated adapter set in a candidate
   is recorded only as a difference.
6. **Adapter state:**
   - Any current-adapter-state assertion is judged against the verified configuration.
   - An attributed report of the stale Soroswap docs labels is recorded separately from a
     current-state assertion.
   - There is no safe harbor beyond the committed golden.
