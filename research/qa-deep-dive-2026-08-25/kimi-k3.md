# QA deep dive — lane kimi-k3 (2026-08-25)

Repository: stellar-raven-codemode. Run audited: eval/qa/results/2026-08-14T03-56-23-variantA.json (100 cases; 45 correct, 39 partial, 15 wrong, 1 error; about 64.5 percent with half credit; judge flips 9.6 percent of verdicts between identical-input passes).

Part 1 surveys 2025-2026 practice for retrieval-grounded QA over structured catalogs and maps each technique onto this system: a Cloudflare Worker host owns all traffic and secrets, model code runs networkless in a Dynamic Worker, and a 251-entry manifest (59 operations, 19 skills, 173 skill sections) is the only callable surface.

Part 2 is a fresh-eyes audit of six failed cases, spread across services: lumenloop (1), scout (2), stellarDocs (2), skills (1). For each case I read only the question and the catalog surface first, stated my own plan, then compared with the saved answer and the golden.

## Executive summary

1. Retrieval was adequate in four of six audited misses. The losses came from answer discipline: no as-of dating, categorical labels on disputed facts, synthesis beyond the evidence, and early give-up on entity aliases.
2. One miss was a real surface gap. The MPP discovery mechanism (OpenAPI 3.1 with x-payment-info.offers, MPPScan, the mpp.dev registry) appears in no manifest description. The model asserted the opposite of the golden.
3. One miss was evidence-poor recovery. WisdomTree CRDT/CRDYX needed alias expansion and date-bounded queries; the model concluded the token may not exist.
4. Highest-value survey mappings for this system: a host-side freshness and dispute contract; description-level alias packs and enumeration cues; a light rerank of the lexical top-k; pairwise or panel judging with rubric anchors against the 9.6 percent flip rate; a CRAG-style broaden-or-abstain policy in the tool contract.
5. Defer embeddings infrastructure and GraphRAG. The catalog holds 251 entries; lexical plus structure is near the routing ceiling. The headroom sits in grounding and grading, not in recall.


## Part 1(a) — Hybrid retrieval: BM25, dense, rerankers, RRF

Mechanism. BM25 scores exact term matches with term-frequency saturation and document-length normalization. Dense embeddings score semantic similarity and catch paraphrase. Reciprocal Rank Fusion merges ranked lists by 1/(k+rank) with no score calibration; k=60 is the standard constant. A cross-encoder reranker re-scores the fused top-k with query and candidate in one forward pass: the most accurate stage and the slowest.

Evidence. BEIR (https://arxiv.org/abs/2104.08663) shows BM25 is a strong zero-shot baseline and cross-encoders beat bi-encoders at much higher latency. RRF original paper: https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf. Blended RAG (https://arxiv.org/abs/2404.07220) reports that blending sparse, dense, and multi-query retrievers beats any single retriever across NQ, TriviaQA, and SQuAD-style sets. On small catalogs the rule of thumb from these results: embeddings pay off when vocabulary mismatch is common (aliases, paraphrase); BM25 alone is enough when entries share user vocabulary; a reranker pays off when the candidate set is small and precision at ranks 1-3 decides the outcome. Tool routing is exactly that regime.

Mapping onto this system. The vendored lexical scorer plus seven structural levers already plays the BM25-plus-structure role. Cheap wins in order: (1) alias packs per entry at index time (MPP = Machine Payments Protocol; Horizon = REST API; CRDT = CRDYX), which is dense-retrieval value without embeddings; (2) a host-side rerank of the top 10-20 hits by a small cross-encoder on Workers AI, or an LLM re-rank inside the existing search tool; (3) dense fallback only if alias packs still leave measured zero-hit queries. At 251 entries, reranking 20 candidates costs one small model call per search; latency stays acceptable. Keep RRF defaults if a second ranker is added.

## Part 1(b) — Query understanding: rewriting, HyDE, decomposition, aliasing

Mechanism. Query rewriting turns vague or conversational input into a standalone keyword query before retrieval (Rewrite-Retrieve-Read). HyDE generates a hypothetical answer and embeds that instead of the raw question, closing the vocabulary gap between question and document style. Decomposition splits multi-hop questions into sub-questions and interleaves retrieval with reasoning (IRCoT, self-ask). Entity aliasing maps names to canonical forms and known alternates before scoring.

Evidence. Rewrite-Retrieve-Read (https://arxiv.org/abs/2305.14283) improves retrieval-augmented QA on ambiguous and conversational queries over direct retrieve-then-read. HyDE (https://arxiv.org/abs/2212.10496) lets an unsupervised dense retriever approach fine-tuned retriever performance across web-search and low-resource sets. IRCoT (https://arxiv.org/abs/2212.10509) beats one-step retrieval on HotpotQA, 2WikiMultihopQA, and MuSiQue.

Mapping onto this system. The manifest search takes one query string, so the leverage sits before and inside scoring. A host-side rewrite or canonicalization step (the existing QUERY_TOKEN_ALIASES lever, lever 6 in src/catalog/scoring.ts) should grow a reviewed alias table mined from golden-question failures, with provenance per alias. The audited WisdomTree case shows the value: CRDT needed expansion to CRDYX and to the full fund name before any search could hit. HyDE fits poorly here: the catalog is 251 short descriptions, not prose paragraphs, so hypothetical-answer embeddings add cost for little gain. Decomposition is already the job of the answering model through multi-turn search plus execute. Practical moves: alias packs in descriptions and keywords, a rewrite hint in the search tool contract (prefer canonical entity names, then alternates), and failure-mined aliases reviewed like golden changes.

## Part 1(c) — Agentic RAG: Self-RAG, CRAG, iteration, verification

Mechanism. Self-RAG trains reflection tokens so the generator decides when to retrieve and self-critiques whether passages support the draft. CRAG adds a lightweight retrieval evaluator: when confidence is low it triggers corrective actions (broaden the query, decompose, or fall back to another source) and strips irrelevant passages before generation. Iterative retrieval loops search and reading until evidence suffices. A verification pass checks each claim against retrieved snippets before the answer is finalized. Survey: Agentic RAG (https://arxiv.org/abs/2501.09136).

Evidence. Self-RAG (https://arxiv.org/abs/2310.11511) reports gains over ChatGPT and strong retrieval baselines on factuality and citation accuracy. CRAG (https://arxiv.org/abs/2401.15884) improves over standard RAG and Self-RAG-style baselines on PopQA, PubHealth, ARC-Challenge, and biography tasks; the cost is an evaluator call plus extra searches. The survey consensus: corrective and iterative loops trade roughly 1.5-3x latency and tokens for higher faithfulness on hard queries, so gate them on detected weakness rather than running them always.

Mapping onto this system. The answering model already loops search plus execute; what is missing is the corrective policy. The audited Horizon case is a conflict-detection failure (two doc framings existed; the model pinned one). The WisdomTree case is a broadening failure (empty entity results did not trigger new vocabulary). Host option: return a per-search confidence hint (hit count, gate pass, score margin between ranks 1 and 2) so the model can trigger broaden-or-abstain deliberately. Add a verification micro-pass to the QA answering contract: every changeable claim must carry a source and a date before finalizing. These are contract and metadata changes, not new infrastructure.

## Part 1(d) — Knowledge organization: graphs, caches, precomputed answers

Mechanism. GraphRAG builds an entity-relation graph with community summaries so global, cross-document questions can be answered when flat chunk retrieval fails. A semantic cache stores query embeddings with prior answers and serves near-repeats without recompute. Cache-augmented generation (CAG) preloads a small, stable corpus into context and skips retrieval at runtime. A canonical answer layer precomputes vetted answers for recurring question classes and serves them with dates and provenance.

Evidence. GraphRAG (https://arxiv.org/abs/2404.16130) beats baseline RAG on comprehensiveness and diversity for global sensemaking over large corpora. CAG (https://arxiv.org/abs/2412.15605) shows that when the knowledge base fits context, preloading can match or beat RAG pipelines while removing retrieval latency. GPTCache (https://github.com/zilliztech/GPTCache) documents large cost and latency reductions from semantic reuse in production LLM applications. The shared precondition: precomputation wins when the corpus is small, stable, or repeatedly asked.

Mapping onto this system. The catalog is 251 entries, not millions of chunks; a graph is overkill for routing. Precomputation fits elsewhere: (1) canonical fact cards for stable high-traffic facts (base reserve, ledger close time, Horizon lifecycle status with its dispute note) served into the judge-visible evidence pack; (2) a semantic cache on the search tool for repeated eval and demo queries; (3) a dispute registry for golden cases whose truth status is disputed, so the answering model surfaces the conflict instead of pinning a label. Two of my six audited goldens demand dispute preservation; a maintained registry is precomputation that buys points directly.

## Part 1(e) — LLM-as-judge calibration

Mechanism. LLM judges show position bias (swapping candidate order flips verdicts), verbosity bias (longer answers win), and self-preference (judges favor outputs from their own model family). Rubric anchoring with explicit criteria and reference facts reduces drift. Pairwise comparison against a reference is more stable than absolute pointwise scores. Ensembles of diverse judges act like a jury and cancel idiosyncrasies; an adjudicator resolves disagreement.

Evidence. Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena (https://arxiv.org/abs/2306.05685) documents position, verbosity, and self-enhancement bias, and shows a strong judge reaching over 80 percent agreement with humans once mitigated. LLM Evaluators Recognize and Favor Their Own Generations (https://arxiv.org/abs/2404.13076) shows self-recognition correlates with self-favoritism. Prometheus (https://arxiv.org/abs/2310.08491) shows a rubric-anchored open evaluator approaching GPT-4-level correlation with human judgment. Replacing Judges with Juries / PoLL (https://arxiv.org/abs/2404.18796) shows a panel of diverse smaller models out-judging a single large judge at lower cost.

Mapping onto this system. The 9.6 percent flip rate on identical inputs signals rubric and sampling instability, not missing knowledge. Concrete moves: (1) judge at temperature 0 with the rubric version recorded on every verdict; (2) pairwise grading of the candidate against golden reference points instead of absolute labels; (3) a two-judge panel from different model families with adjudication on disagreement, matching the existing lane1 blind-adjudication artifacts in eval/qa/results; (4) strip length cues from judge packets so verbosity cannot dominate; (5) make flip rate a release gate: re-judge a fixed probe set twice and require flips under a set threshold before any rubric or surface change ships. These directly attack the measured instability without touching retrieval.

## Part 2 — Fresh-eyes cold audit (six cases)

Protocol: for each case I read the question and grepped catalog/manifest.json descriptions first, stated my plan and expected answer, and only then read the saved answer, the verdict, and the golden in eval/qa/cases.json. Verdicts and quotes below come from the results file; goldens from cases.json.

### Case 1 — q-defi-wisdomtree-crdt (lumenloop, verdict: wrong)

Question: what did WisdomTree launch on Stellar in 2025, and what is the CRDT token.

Cold read of the surface: lumenloop.search_directory (find the issuer project), lumenloop.get_project, lumenloop.find_content_by_entity (entity-mention search), lumenloop.search_content_semantic, plus scout.searchResearch. My plan: directory-search WisdomTree, entity-search CRDT, then a date-bounded semantic search for a 2025 fund launch. Expected: a tokenized fund.

What happened: the model ran broad semantic, entity, and research calls, surfaced WisdomTree Prime and an XLM ETP, got zero on CRDT, and concluded the token may not exist. The golden identifies the WisdomTree Private Credit and Alternative Income Digital Fund, ticker CRDYX, token CRDT, launched 2025-09-12 on Ethereum and Stellar, with transfer-agent record priority and dated Stellar issuer and SAC addresses.

Where the surface misled me: entity search is literal; nothing at catalog level says tickers need alias expansion (CRDT to CRDYX to the full fund name), and no empty-result playbook names the next lanes. The evidence-poor recovery archetype in the micro-map was never triggered.

Fix that would have steered me right: (1) find_content_by_entity description gains a line: zero hits means try alias expansion, then search_directory for the issuer, then date-bounded search_content_semantic; (2) an alias pack CRDT/CRDYX/private credit on the relevant lumenloop entries; (3) soft-empty responses carry a next-lane hint when an entity lookup returns nothing.

### Case 2 — q-eco-stellar-wallets-list (scout, verdict: wrong)

Question: list the Stellar wallets the ecosystem directory tracks.

Cold read of the surface: scout.searchProjects with a type filter; the description says the type filter gives exact product-type rosters. My plan: searchProjects with type Wallet, paginate to the total, and report the roster with an explicit as-of date and lifecycle states.

What happened: the model did almost exactly that. It paginated to 63 wallets, recovered truncated output through codemode.artifact.read, and named real wallets. But it presented the list as a timeless, complete roster: no as-of date anywhere, no separation of directory lifecycle from product availability, no note on duplicates or canonical records. The golden demands all three.

Where the surface misled me: it did not; retrieval was correct and complete. The answer contract did. Nothing in the searchProjects description or the QA answering rules forces dated framing for enumerations, so the judge penalized a presentation choice the surface never asked for.

Fix that would have steered me right: a standing cue on every enumeration operation (searchProjects, getPartners, listAudits, getStablecoins): a roster is a dated snapshot; state the as-of date and the lifecycle filter used. Add the same rule to the QA answering prompt. Zero new infrastructure; pure contract text.

### Case 3 — q-scf-v7-changes (scout, verdict: wrong)

Question: what changed when the SCF moved to v7.0, and when.

Cold read of the surface: scout.searchResearch covers the SDF blog and SCF Handbook; scout.scfPitch covers live round state; scout.getChangelog is about the Scout API, an obvious trap to avoid. My plan: searchResearch on the v7 announcement and payment mechanics, then date every claim.

What happened: the model got the January 2026 date, the three Build tracks, and the 10/20/30/40 percentages. Then it flattened the 10 percent acceptance payment into a fourth deliverable tranche, invented v6 history (three equal disbursements with an unpaid testnet tranche), and never stated that v7 did not create a unified Growth track. The golden requires exactly those distinctions.

Where the surface misled me: the launch blog shorthand (four-tranche) and the detailed mechanics (four payments: acceptance plus three deliverable tranches) both live in the research corpus; the model synthesized across partial chunks and filled gaps from prior knowledge. No catalog gap here; this is grounding discipline.

Fix that would have steered me right: a host-side evidence-pack annotation listing which key facts the retrieved chunks support and which they do not, so invented history has nowhere to hide. At prompt level: forbid version-history claims without a retrieved source. The judge-visible pack already exists; adding support markers is a presentation change, not new retrieval.

### Case 4 — q-infra-horizon-vs-rpc (stellarDocs, verdict: wrong)

Question: the difference between Horizon and Stellar RPC, and which to use for a new Soroban app.

Cold read of the surface: stellarDocs.search_rpc_horizon_data_docs explicitly covers RPC, Horizon, and the migration between them; stellarDocs.search_doc_titles plus get_doc_page_sections fetch the canonical pages. My plan: read the migration page, state transport and scope differences, and date any lifecycle claim.

What happened: retrieval was textbook (data-docs search, titles, page sections). The answer then pinned Horizon as nearing end-of-life as settled fact, framed RPC as smart-contract focused (missing that RPC also covers classic queries), and gave no as-of date. The golden says official pages dispute whether Horizon is already deprecated versus nearing EOL, and requires stating that conflict.

Where the surface misled me: doc pages genuinely disagree, and nothing at catalog or result level signals that this topic carries a known dispute. The model picked one framing and stated it categorically — exactly the must-avoid clause.

Fix that would have steered me right: (1) a dispute flag in the evidence pack when indexed pages conflict on a lifecycle or status claim; (2) a description note on search_rpc_horizon_data_docs: Horizon lifecycle wording differs across pages, so report both framings with dates; (3) the freshness-and-dispute contract from Part 1(c) and 1(d) applied at answer time.

### Case 5 — q-ti-freighter-localhost-not-detected (stellarDocs, verdict: wrong)

Question: Freighter works on live dApps but window.freighterApi is undefined on localhost; cause (SSL/CORS) and fix for local dev.

Cold read of the surface: stellarDocs.search_wallet_dapp_docs names the Freighter integration guides; grep shows localhost and secure context appear nowhere in any manifest description. My plan: pull the frontend guide, separate installation detection from authorization, troubleshoot extension state, then treat HTTPS as the documented workaround with a date.

What happened: the model found the official HTTPS section and stated it as the categorical cause: Freighter requires a secure context, plain http localhost does not count. The golden requires troubleshooting first (browser profile, extension enabled and unlocked, reload, top-level frame), and requires preserving the disagreement between the official docs and current Freighter source (the 5.43 manifest matches all_urls at document_start, so top-level HTTP localhost is not categorically blocked). It also forbids exporting secrets, which the model avoided.

Where the surface misled me: the docs corpus carries one rule; the current-source behavior lives in the extension repo, outside every exposed lane. The model had no surface that even hints a disagreement exists.

Fix that would have steered me right: a maintained Freighter troubleshooting section in the skills.stellar-dev.dapp skill stating the docs-versus-source disagreement and the checklist order; plus a cue on search_wallet_dapp_docs that Freighter guidance can lag extension releases and the dapp skill carries the current-source note. This is the canonical-answer-layer pattern from Part 1(d) applied to one fast-moving topic.

### Case 6 — q-mpp-discovery-and-modes (skills, verdict: wrong)

Question: what is MPP on Stellar, what payment modes does it support, and how should an API advertise that agents can pay it.

Cold read of the surface: skills.stellar-dev.agentic-payments with sections file:mpp.md, file:x402.md, quick-decision. The section description in the manifest is a single line: MPP — Machine Payments Protocol (Charge + Session). My plan: codemode.skill.read of file:mpp.md for modes and for the discovery mechanism, then answer with sources.

What happened: the model read the skill twice and covered Charge and Session correctly. But on the actual question — how to advertise — it claimed the 402 response is the advertising mechanism and that no separate manifest is used. The golden requires publishing OpenAPI 3.1, commonly at /openapi.json, with x-payment-info.offers; discovery metadata is advisory while the runtime 402 Challenge is authoritative for price, token, network, expiry, and terms; MPPScan and the mpp.dev services registry are optional surfaces; MPP and x402 payloads must never be relabeled.

Where the surface misled me: grep confirms x-payment-info and OpenAPI appear nowhere in the manifest, and the mpp.md section description names only the two modes. The discovery surface is invisible at catalog level, so the model filled the gap with a plausible wrong claim — the exact must-avoid trap.

Fix that would have steered me right: expand the file:mpp.md section description to name discovery explicitly (OpenAPI 3.1, x-payment-info.offers, advisory metadata versus authoritative 402 Challenge, MPPScan, mpp.dev registry), and mirror it in the parent skill description. Description text is the only retrieval surface for skill sections; this is the highest-leverage one-line fix in the audit.

## Synthesis and prioritized recommendations

Cross-case pattern: four of six misses were retrieval-adequate discipline failures (dating, dispute preservation, synthesis beyond evidence). One was an evidence-poor recovery failure (aliases, broadening). One was a true catalog-visibility gap (MPP discovery). Category stats from the same run support the pattern: tooling-infra is the weakest category (2 correct, 4 partial, 6 wrong of 12), and stellarDocs carries the largest load (49 cases, 7 wrong).

P0 — contract and description text, no infrastructure: (1) alias packs mined from golden failures, shipped in descriptions and keywords; (2) the enumeration cue (as-of date plus lifecycle filter) on all roster operations; (3) the MPP discovery description fix; (4) dispute cues on the Horizon and Freighter surfaces; (5) a broaden-or-abstain policy plus per-search confidence hints in the search tool contract.

P1 — host features: (1) a freshness-and-dispute registry served into evidence packs; (2) a rerank of the lexical top-k (small cross-encoder or LLM re-rank); (3) a verification micro-pass before answer finalization.

P2 — judging: (1) temperature-0 judging with rubric version on every verdict; (2) pairwise grading against golden reference points; (3) a two-family judge panel with adjudication; (4) length-cue stripping in judge packets; (5) a flip-rate release gate on a fixed probe set.

Expected effect on the audited six: wallets, horizon, freighter, and scf-v7 move to correct with P0 discipline cues; mpp moves to correct with the description fix; wisdomtree needs the alias and recovery lane and likely moves from wrong to partial or correct. None of the P0 items touch the sandbox, the manifest build, or secrets.

## Limitations and provenance

- No other lane reports in research/qa-deep-dive-2026-08-25/ were read. The cold-audit protocol (question and surface first, golden second) was followed per case.
- All Part 1 citations were verified by direct fetch of the arXiv abstract pages or the Waterloo PDF on 2026-08-25. One initial mis-identification (BEIR) was caught and corrected to https://arxiv.org/abs/2104.08663.
- Evidence-of-gain statements summarize the cited papers; numbers not quoted here were deliberately left unquoted.
- Tooling note: the write/edit tool channel failed to emit in this session (every non-bash tool call collapsed), so this file was created and appended in staged sub-3000-character chunks through node -e fs writes. No other files were created or modified; no redirection, mkdir, touch, rm, or temp files were used; the report path is the only artifact.
