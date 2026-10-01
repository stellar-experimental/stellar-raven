# Grok xhigh — assumption attack + radical alternatives

Lane: grok-xhigh. Date: 2026-08-25. Repo: stellar-raven-codemode.
Constraint: read-only against the repository. This file is the only write.

Evidence base for the headline number:

- `eval/qa/results/2026-08-14T03-56-23-variantA.json` — 100 cases, answering `claude-sonnet-5`, judge `claude-sonnet-5`, rubric `v2.4`, pack `p3`. 45 correct / 39 partial / 15 wrong / 1 error. Half-credit **64.5%**. Strict **45%**. Cost **$64.95**.
- `eval/qa/results/2026-08-18T22-04-13-rejudge.json` — same answers, pack `p5`, **non-identical goldens** (`casesSha256` 9f0bc00f… vs 372e0e70…). 40 / 46 / 14. **17 flips** (7 up, 10 down).
- Full-battery reviewed record in `eval/qa/README.md`: 497 cases at `90d0ba75…` → **187 / 226 / 84**, half-credit **60.36%**, strict **37.63%**.

This lane independently re-answered 10 goldens from live primary sources on 2026-08-25. It does not trust the golden files, the judge, or the routing story.

---

## Executive summary (10 bullets)

1. **The ~65% number is not a user-quality score.** It is checklist coverage against a golden that often grades *how you talk about disputes, dates, and sibling products*, not whether a developer can act. Recode the 15 “wrong” rows through that lens and several are useful answers punished for quoting official docs.

2. **You cannot honestly take this instrument +30 points in a quarter.** Sample-100 half-credit is 64.5%. Full-battery reviewed half-credit is 60.4%. Strict correctness is 38–45%. A +30 goal on *this* rubric is a request to launder score, not to make Raven better.

3. **Judge noise is already in the high teens.** Same answers, later goldens, 17/100 flips. Answering model = judge model (`claude-sonnet-5`). Field practice (MT-Bench / Chatbot Arena / G-Eval surveys) treats same-family pointwise judges as biased and unstable. This headline has no ensemble, no pairwise arm, and no human sample.

4. **At least 3 of 10 independently checked goldens are not “true today” in the form the judge uses.** SCF #45-as-current is stale (official site now shows SCF #46 in Submission). WisdomTree issuer/SAC strings in the golden are garbled versus live Horizon and `stellar.toml`. MPP docs URL in the golden 404s.

5. **Several “wrong” answers are docs-faithful.** Horizon “nearing EOL”, Freighter “HTTPS required”, RPC “hardcoded 200”, SCF v7 “four-tranche”, and “use Smart Account Kit for new builds” all appear on current SDF pages. The goldens encode *disputes with those pages*. The agent that trusts `stellarDocs` is graded wrong.

6. **Lexical catalog routing is a structural ceiling, not a tuning leftover.** Routing gate: legacy top-1 **209/338 (61.8%)**, holdout top-1 **10/49 (20.4%)**. The vendor scorer needs token coverage of id/name/description. User phrasing that does not share those tokens (CRDT, “wallets the directory tracks”, “advertise that agents can pay”) will miss. `QUERY_TOKEN_ALIASES` only maps `tx→transaction` class abbreviations.

7. **The CRDT miss is upstream data, not a dumb model.** Live 2026-08-14 execute found no CRDT in Lumenloop/Scout. That recurrence is already filed as `improvements/lumenloop/ll-012`. Vectorize will not invent a row the corpora do not carry. A canonical-answer cache for CRDT would hide the gap and violate “no per-question tuning.”

8. **Partials are mostly framing, not ignorance.** 39/100 sample rows are partial. Missing-fact lists are dominated by as-of dates, audit-scope caveats, “do not call this exhaustive,” and extra protocol minus-ones. That is a writing rubric, not a retrieval rubric. Prompt-append work already measured this (`eval/qa/README.md` todo 1231) and banked no production change.

9. **Radical alternatives that look like +30 mostly buy 3–8 points and spend doctrine.** Dense retrieval is the only routing change that is both general and host-legal. Answer caches, multi-model consensus, and tool-per-intent endpoints either freeze live truth, multiply cost, or abandon ADR-0003. Self-verification helps fabrication, not missing as-of clauses.

10. **If the job is “better Stellar answers,” change the headline metric first.** Keep the checklist as a diagnostic. Add a small human or pairwise “would this answer ship?” panel on the same 100 ids. Drive product work off that panel plus upstream findings. Do not promise 100% on v2.4/v2.8 fact checklists.

---

## 1. Is the metric even right?

### What the instrument actually grades

`eval/qa/judge.mjs` (current `JUDGE_RUBRIC` **v2.8**; the 100-case run is **v2.4**) is a pointwise LLM judge. The prompt requires:

- every `keyFacts[]` item present in substance
- no `wrongClaims` of substance
- no binding `avoid` hit
- `correct` = all (or all-but-trivial) key facts and no wrong claims
- `partial` = core right, omissions or minor slips
- `wrong` = core incorrect, avoid hit, or trap failure

Half-credit is `(correct + 0.5×partial) / n`. The repo is explicit that weighted rubrics and citation hard-gates were *rejected* for judge variance (`eval/EVALS.md`). That is honest. It does not make 65% a product KPI.

### Partials are undercounted *as user value* and overcounted *as product failure*

On the 100-case run, 39 partials. Typical missing facts (from the saved verdicts):

- no visible as-of date on a live roster
- audit coverage is version-scoped
- pool-share trustlines cost two reserves
- “do not present this list as complete”
- exact launch day (Sep 18 vs “September 2025”)

Those are real. They are not “the agent failed Stellar.” A builder who received the 63-wallet Scout dump, the SCF v7 10/20/30/40 split, or the Horizon-vs-RPC migration table can ship. The instrument scores them 0.5 or 0.

Conversely, partials are *not* undercounted as checklist coverage. Rubric v2.6 already caps omissions at partial when the core is right. If anything the 100-case **wrong** bucket is the distorted one: several wrongs have empty or thin `wrongClaims` and are “wrong” because a must-avoid about *how to describe a dispute* fired.

### Wrongs that are actually right (or right enough)

Independent of the 10-case table below, the saved 100-case wrongs include:

| id | saved score | why the “wrong” is contestable |
|---|---|---|
| `q-infra-horizon-vs-rpc` | wrong → later rejudge partial | Answer quotes the current APIs overview: “Horizon is nearing end-of-life and will eventually be deprecated.” That is the live sentence on https://developers.stellar.org/docs/data/apis (fetched 2026-08-25). Golden demands encoding a *dispute* with a present-tense “deprecated” page (`improvements/stellar-docs/sd-042`). |
| `q-ti-freighter-localhost-not-detected` | wrong | Answer follows https://developers.stellar.org/docs/build/guides/dapps/frontend-guide (“Freighter wallet requires a secure connection (HTTPS)”). Golden demands preserving a source/manifest disagreement. |
| `q-ti-rpc-gettransactions-pagination-xdr` | wrong | Live method page still says the 200 cap is “hardcoded in Stellar-RPC for performance reasons” (https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getTransactions). Golden / `sd-004` say source is operator-configurable. Grading the docs’ own words as wrong is a docs-bug detector, not an answer-quality detector. |
| `q-tool-passkeykit-smart-wallet` | wrong | Answer recommends Smart Account Kit. `stellar/ecosystem-resources` wallet README (live 2026-08-25) says: “For most new projects in 2026, we recommend **Smart Account Kit**.” Passkey-kit README says sibling, not successor. The eval picked one official voice and trapped the other. |
| `q-scf-v7-changes` | wrong | Answer uses the launch blog’s “four-tranche, milestone-based” wording and the blog’s v6 “three equal disbursements” contrast (https://stellar.org/blog/ecosystem/introducing-scf-v7). Golden wants handbook payment taxonomy (acceptance vs deliverable). The blog is still live. |
| `q-eco-stellar-wallets-list` | wrong | Agent enumerated 63 `type=Wallet` Scout rows. Golden does not want a roster; it wants as-of dating and “not exhaustive.” User question *asked* for a list. |
| `q-edge-fresh-latest-scf-round` | correct on 2026-08-14, wrong on 2026-08-18 rejudge | Same answer. Golden moved. Official site moved again by 2026-08-25 (SCF #46 Submission). |

That is 6 of 15 sample wrongs whose failure mode is “the golden is a dispute detector or a freshness snapshot,” not “the agent fabricated Stellar.”

The remaining wrongs include real failures: `q-defi-wisdomtree-crdt` (entity miss / denial), indexer alias fabrication (`q-tool-indexer-repos-discovery`), custodial key generation (`q-ti-custodial-account-generation-c-address` on rejudge). Mixing those with docs-dispute traps is how 15 wrongs feel like a crisis.

### Same-model judge is a known bad design

Zheng et al., *Judging LLM-as-a-Judge* (MT-Bench / Arena) documented position bias, verbosity bias, and self-preference. Later surveys (`arXiv:2411.16594`, Springer AI Review 2026) still list those biases as unsolved. This pipeline:

- uses **one** judge model
- uses **the same family** as the answering model
- is **pointwise** against a long checklist, not pairwise against another answer
- has **no human calibration set** on the 100-case sample
- already observed **17% flip** when pack/goldens moved

`eval/qa/README.md` itself says the 2026-08-19 canary review flipped 3 of 53 saved-correct rows, so the reviewed correct count “can contain a small, unquantified overstatement.” The instrument knows it is noisy. Management treating 65% as a point estimate toward 100% is the actual error.

### What field practice would change about the number

| practice | what it would do here |
|---|---|
| Pairwise preference vs a frozen baseline answer | Measures “did this change help?” instead of “did we hit 5 keyFacts.” Stops as-of omissions from zeroing a good roster. |
| Judge ensemble (2–3 families, majority) | Cuts 17% single-judge flip. Cost ≈ 2–3× judge spend (~$10–17 on this 100). |
| Separate axes: factuality / grounding / completeness / safety | Matches RAGAS / CCRS. Completeness would absorb most partials. Factuality would isolate fabrications. |
| Human 20-case panel on the same ids | Sets a noise floor. If humans score 80% “ship it” while the checklist scores 45% strict, the KPI is the wrong object. |
| FreshQA-style recency labels | Already exists (`stable` / `scheduled` / `live`) but keyFacts still pin volatile phases (SCF round). FreshQA’s lesson: do not freeze a live value in the grade. |

**Recommendation:** keep correct/partial/wrong as a *diagnostic*. Stop using half-credit as the board number. Report three numbers: (1) strict checklist, (2) coreAnswer==correct rate (needs v2.5+; the 100-case run has `coreAnswer: null` everywhere), (3) a 30-case human or pairwise “usable” rate.

A generous recode of the 100-case run, treating docs-faithful dispute cases as partial and process-only date misses as partial rather than wrong, would likely land **~70–75% half-credit** without any product change. That is not a gain. That is the honest width of the instrument.

---

## 2. Independent verification of 10 goldens (2026-08-25)

Method: re-derive each claim from live class A/B/C sources. Do not trust `truth.corroboration` rows. The four extra cases were chosen for maximum controversy (docs-vs-core, docs-vs-manifest, docs-vs-source, launch-blog-vs-handbook).

### Verification table

| id | golden’s claim (compressed) | independently verified 2026-08-25 | verdict | why it matters to the 65% |
|---|---|---|---|---|
| `q-defi-wisdomtree-crdt` | 2025-09-12 WisdomTree Private Credit fund CRDYX / token CRDT on Ethereum+Stellar; issuer `GBWMQUGGGS5PC6CDJCZDCOVBA4LAJ6NYZVBFFXXCPRZCKW3ERQHJ2P45`; SAC `CBQDK4Y3EWQHI7S4EYYICV2GZ4ETC2376IKLZHH4MDCYXM5SWY2UK3P` | **Product identity is true.** IR release 2025-09-12: CRDT / CRDYX, Gapstow index, $25 min, T+0 / T+2, Ethereum+Stellar ([WisdomTree IR](https://ir.wisdomtree.com/news-events/press-releases/detail/755/wisdomtree-brings-private-credit-onchain-with-the-launch-of)). **Issuer/SAC in the golden are wrong.** Live `stellar.toml` and Horizon list issuer `GBWMQUGPPLSC62YPGD5CEHATOQRQMNLNAV2TMEXJ4ZYOTY4TJD6J2P45` and SAC `CBQDK4Y3B2RYUSXE6JYYTHB6AIW655FPGE4OW7A2BWDZXZ5RALQ3UK3P`. The golden strings share prefixes/suffixes and look like a transcription scramble. | **golden-stale** on exact IDs; **golden-right** on product | Agent scored **wrong** because Lumenloop/Scout returned no CRDT row (ll-012 recurrence 2026-08-14). The golden would also fail its own “exact issuer/SAC” key fact against live Horizon. |
| `q-eco-stellar-wallets-list` | Do not freeze a roster; 2026-07-11 live wallet search had 164 matches; Lobstr/xBull/Freighter on page 1; date it; directory Live ≠ availability | **Process claim is right.** Official wallets page is a *curated kit* (Freighter, Lobstr, xBull, Hana, …), not a census ([Wallet Integration](https://developers.stellar.org/docs/tools/developer-tools/wallets)). Agent’s 63 `type=Wallet` Scout dump is a real directory slice, undated. Golden’s 164 is a July snapshot, not a law of nature. | **golden-right** as a *behavior* golden; **genuinely-contested** as a “wrong” | Scoring an actual dated-missing enumeration as **wrong** rather than partial is the metric bug. User asked to “enumerate.” |
| `q-edge-fresh-latest-scf-round` | As of 2026-08-18: no round in Submission; SCF #45 Initial Review after 2026-08-16 deadline; #44 distributing; #43 last concluded | **Stale as of 2026-08-25.** Official awards index: **SCF #46 Submission**, deadline **November 8, 2026**; SCF #45 **Panel Review**, deadline Aug 16; #44 Ended ([communityfund.stellar.org/awards](https://communityfund.stellar.org/awards)). Scout `GET /api/rfps?status=open` at `generatedAt` 2026-08-25T22:14:00Z: `currentRound=46`, `currentPhase=Submission`, `closes=2026-11-08`. | **golden-stale** | 2026-08-14 answer “#45 open until 2026-08-16” was **correct** then, **wrong** on 2026-08-18 rejudge, and would be **wrong** again today for a different reason. This case is a time bomb. `reverifyBy` is 2026-09-10 — already late relative to #46 opening. |
| `q-mpp-discovery-and-modes` | HTTP 402; Charge = per-request SAC; Session = off-chain channel; publish OpenAPI 3.1 `/openapi.json` with `x-payment-info.offers`; 402 Challenge is authoritative; MPPScan + `https://mpp.dev/mcp/services`; do not relabel x402 | **Mostly right, URL and mode-name drift.** Live Stellar docs (new path): Charge + Session ([MPP on Stellar](https://developers.stellar.org/docs/build/agentic-payments/mpp)). Golden path `/docs/build/apps/agentic-payments/mpp` **404s**. mpp.dev Stellar method page names intents **charge** and **channel** ([mpp.dev/payment-methods/stellar](https://mpp.dev/payment-methods/stellar)) while linking `/payment-methods/stellar/session`. Discovery spec matches the golden ([mpp.dev/advanced/discovery](https://mpp.dev/advanced/discovery)). | **golden-right** on protocol; **golden-stale** on docs URL; **genuinely-contested** Session vs Channel naming | Agent got modes right and missed OpenAPI discovery (“no separate manifest”). That is a real completeness miss. Calling it **wrong** because of one over-claim about 402-as-advertising is harsh but not invented. |
| `q-protocol-base-reserve-min-balance` | Core min-balance `(2 + numSubEntries + numSponsoring - numSponsored) * baseReserve`; 0.5 XLM dated; liabilities are spendability, not min-balance; pool-share = 2 reserves; sponsored start at 0 | **0.5 XLM still live.** Horizon latest ledger 64123958 closed 2026-08-25T22:15:01Z: `base_reserve_in_stroops=5000000`, protocol 27. **Core agrees with the golden, official docs do not.** `stellar-core` `addBalance` uses `getMinBalance(...)` then separately compares `newBalance - minBalance` to `getSellingLiabilities`. Sponsored-reserves *docs* still write min-balance as that formula **plus `liabilities.selling`** ([sponsored-reserves](https://developers.stellar.org/docs/build/guides/transactions/sponsored-reserves)). Lumens page uses the pre-sponsorship shorthand ([lumens](https://developers.stellar.org/docs/learn/fundamentals/lumens)). | **golden-right** vs Core; **genuinely-contested** vs official docs | Agent quoted the sponsored-reserves page and hit must-avoid #1. This grades “did you read Core?” not “did Raven retrieve Stellar docs?” |
| `q-tool-passkeykit-smart-wallet` | passkey-kit and smart-account-kit are maintained sibling SDKs; different auth models; not drop-in; do not call passkey-kit legacy; README does not redirect | **Sibling claim is true in the kit READMEs.** [stellar/passkey-kit README](https://github.com/stellar/passkey-kit): unaudited caution + “smart-account-kit is a sibling SDK… not drop-in compatible.” [stellar/smart-account-kit README](https://github.com/stellar/smart-account-kit): OpenZeppelin context-rule / auth-digest model. **Successor claim is also live in SDF ecosystem-resources:** “For most new projects in 2026, we recommend Smart Account Kit” ([ecosystem-resources/wallet-integration/README.md](https://github.com/stellar/ecosystem-resources/blob/main/wallet-integration/README.md)). Docs “Smart wallets” page still lists Passkey Kit as tooling ([smart wallets](https://developers.stellar.org/docs/build/guides/contract-accounts/smart-wallets)). | **genuinely-contested** (official voices disagree) | Agent followed ecosystem-resources and scored **wrong**. Golden treats one README as gospel and another SDF repo as a trap. |
| `q-infra-horizon-vs-rpc` *(pick)* | RPC is JSON-RPC current-state + contracts, not Soroban-only; Horizon REST/HAL; do not pin Horizon lifecycle; encode deprecated vs nearing-EOL dispute | **Architecture claim is true.** APIs overview comparison table is still the right split ([APIs](https://developers.stellar.org/docs/data/apis)). **Canonical lifecycle sentence today is the warning the agent quoted:** “Horizon is nearing end-of-life and will eventually be deprecated.” A second page still says “the deprecated Horizon API” (`sd-042`). Dispute is real. Pinning *either* label is what the golden forbids — and what the docs invite. | **golden-right** as a dispute encoding; **agent was docs-faithful** | This is a stellar-docs bug (`sd-042`) leaking into Raven’s headline. |
| `q-ti-freighter-localhost-not-detected` *(pick)* | Distinguish isConnected / requestAccess; HTTPS is official guidance; Freighter 5.43+ manifest is `<all_urls>` at `document_start`, no `all_frames`; do not claim HTTP always works or HTTPS always fixes | **Both layers still true.** Frontend guide still requires HTTPS (link above). Live manifest `stellar/freighter` `extension/public/static/manifest/v3.json` **v5.45.0**: `"matches": ["<all_urls>"]`, `run_at: document_start`, no `all_frames`. | **golden-right** as a dispute; **agent was docs-faithful** | Same pattern as Horizon. The eval wants source-code epistemology from a docs-grounded MCP. |
| `q-ti-rpc-gettransactions-pagination-xdr` *(pick)* | startLedger then opaque cursor; stock getTransactions 50/200; source-configurable; docs say hardcoded | **Both still true on 2026-08-25.** Method page: limit 1–200, default 50, “hardcoded in Stellar-RPC.” Golden notes `stellar-rpc` options.go defaults. `stellar-docs#2567` already told graders to accept *either* stock 50/200 *or* configurable-default, and not to call the cap compile-time immutable. The saved wrongClaims still punish “hardcoded caps, not just app defaults.” | **genuinely-contested** (docs vs source); golden notes already try to be lenient, the v2.4 judge was not | Rubric/pack/golden tuple failed to protect a docs-faithful answer. |
| `q-scf-v7-changes` *(pick)* | Jan 2026 / ~SCF #41; three Build tracks; four *payments* = 10% acceptance + 20/30/40 deliverables; no unified Growth track | **Launch date and tracks are true.** Blog 2026-01-16 ([introducing-scf-v7](https://stellar.org/blog/ecosystem/introducing-scf-v7)). Handbook history: “Awarded budget is distributed in 4 payments: Tranche #0: 10% → #1 20% → #2 30% → #3 40%” ([scf-handbook](https://github.com/stellar/scf-handbook)). Blog still says “four-tranche, milestone-based” and “10% upon award.” Blog also claims v6 “three equal disbursements (with the Testnet tranche unpaid)” — the same sentence the judge called unsupported. | **golden-right** on payment taxonomy; **genuinely-contested** on whether repeating the live blog is a wrong claim | Punishing the official announcement’s own words is how you get “wrong” on a page-one source. |

**Score among the 10:** 2 golden-stale (SCF round; WisdomTree IDs), 4 genuinely-contested official-voice splits, 4 golden-right as *behavior/dispute* goldens that still over-punish docs-faithful answers. Zero of 10 are “the golden is a simple lie.” Zero of 10 support “just raise the answering model.”

### Per-question findings (agent path, not just gospel)

**CRDT.** Search queries were “WisdomTree tokenized fund Stellar” and “CRDT token.” Execute hit Lumenloop semantic/entity and Scout research. Results: WisdomTree Prime, XLM ETP, CRDT-as-conflict-free-replicated-data-type. The agent then *denied the token exists*. That is worse than a miss: it converted an upstream hole into a confident negative. Retrieval cannot fix a closed-world denial. The skill/prompt rule “absence from these corpora is not non-existence” is the product fix. Dense search over empty corpora still returns empty.

**Wallets list.** Agent *did* the right op (`searchProjects` `type=Wallet`) and got 63. Golden wants ritual: as-of, not exhaustive, lifecycle ≠ availability. That is a writing template. Cheap. Do not rebuild ranking for it.

**SCF round.** This is the cleanest proof that pinning live phase in `keyFacts` makes the headline uninterpretable week to week. Freshness-leniency in the judge prompt did **not** save the 2026-08-18 rejudge: the new golden’s avoid item (“do not call #45 open”) bound, and the old correct answer became wrong.

**MPP.** Agent used the agentic-payments skill and got Charge/Session right, including the Channel→Session rename. It failed discovery metadata. Catalog lexical gap: user words “advertise that agents can pay” do not look like `x-payment-info.offers`. A skill section would have to carry those tokens; skills sections are `searchable: false` in the shipped catalog.

**Base reserve.** Agent retrieved the right docs family and reproduced the official *wrong-for-Core* formula. Raven did its job. The golden wants Core. Unless execute grows a `stellar-core` reader, this case will keep failing docs-grounded agents.

**Passkey.** Search “passkey smart wallet Stellar” will surface Smart Account Kit harder in 2026 ecosystem copy. Lexical routing did not fail; synthesis picked the louder SDF recommendation.

---

## 3. Is routing fundamentally flawed?

### The premise, stated steelman-first

Raven’s doctrine (ADR-0003, `ARCHITECTURE.md`): the **manifest is the exposed surface**. `search` is host-side lexical ranking over that manifest. `execute` is networkless JS against host adapters. Model code never owns URLs, keys, or exposure. That is the right security story.

The silent extra premise: **if a Stellar question is answerable from an exposed operation, lexical catalog search will surface that operation from user phrasing.**

That extra premise is false. Evidence:

1. **Holdout top-1 is 20.4%** (`eval/gates.json`: 10/49). Legacy top-1 is 61.8% (209/338). The labeled routing set is saturating. The frozen holdout is not. A system that cannot route 4 in 5 unseen phrasings to the intended card cannot “route any Stellar question.”

2. **Vendor coverage gate.** `src/catalog/vendor/search-scoring.ts`: 100% token coverage for ≤2-token queries, 60% otherwise, or an exact phrase. Long questions gate to zero; lever 5 only *backfills a short page*. That is a lexical overlap machine.

3. **Alias surface is tiny.** `QUERY_TOKEN_ALIASES` = tx/txn/acct/addr. No entity aliases, no CRDT/CRDYX, no “smart wallet”→passkey-kit, no “advertise payment”→OpenAPI discovery.

4. **Skills body is invisible to search.** Since the 2026-07-13 A/B, skill-section entries are `searchable: false`. Whole-skill cards remain. Mid-skill tokens (`x-payment-info`, `__check_auth`, `resultMetaXdr`) do not rank unless they appear in the short description.

5. **Service diversity quota** (`max(2, ceil(0.4×limit))`) is correct for exploration and harmful for “I already know I want Scout wallets.” The MCP `service` filter exists; agents often omit it (wallet query had no service filter; CRDT’s later search added `service: lumenloop` too late).

### Where user phrasing structurally loses

| user phrasing | catalog vocabulary | loss type |
|---|---|---|
| “CRDT token” | WisdomTree Prime, “private credit,” Gapstow — if those strings even exist upstream | **entity alias + empty corpus** |
| “wallets the ecosystem directory tracks” | `scout.searchProjects`, type `Wallet` | often recovered (this sample did) |
| “advertise that agents can pay” | `x-payment-info.offers`, OpenAPI 3.1 | **jargon gap into a non-searchable skill body** |
| “passkey-based smart wallet” | two SDK names, SDF 2026 “use Smart Account Kit” copy | **synthesis / official-voice**, not ranking |
| “currently open SCF round” | `scout.getRfps` synthetic `scf-round` row | recovered; **truth moves under the golden** |
| “localhost Freighter undefined SSL/CORS” | frontend-guide HTTPS; extension manifest | recovered the *docs* card, missed the *source* card |

Lexical ranking did not “fail Stellar.” It failed **paraphrase and aliases**. That is what BM25-only catalogs do. Cloudflare’s own `searchConnectors` math was never a semantic retriever.

### Would dense / hybrid / rewrite / planner raise the ceiling?

**Cloudflare Vectorize is host-side bindable.** It does not violate `globalOutbound: null`. Embeddings and queries stay in the host Worker, same as today’s scorer. Doctrine: compatible. Secrets: compatible.

Honest cost/benefit against this architecture:

| change | expected battery impact | infra cost | maintenance | doctrine |
|---|---|---|---|---|
| **Host-side Vectorize over catalog descriptions + routingKeywords** (hybrid: keep lexical, add dense, RRF or score blend) | **+2 to +6 half-credit points** if entity/paraphrase misses are ~5–10 of 100. Does **nothing** for empty upstream rows (CRDT), dispute goldens, or as-of writing. | Low: catalog is hundreds of entries, not millions. Rebuild embeddings in `build-catalog.mjs`. Query: one Vectorize + existing lexical. Workers Paid already required for Dynamic Workers. | Must freeze embedding model. Drift CI needs a vector fingerprint. Risk of retrieving *related* wrong ops (holdout forbidden-capture already 11/49). | Compatible if Vectorize stays host-only and never a new model-facing tool. |
| **Query rewriting** (LLM rewrite before lexical) | **+1 to +3**, mostly on long questions. Extra model call on every `search`. Latency and cost on the hot path. Self-preference toward verbose rewrites. | Medium: a host LLM call per search (AI Gateway). | Prompt is another gospel surface. | Compatible; it is host-side. Conflicts with “search is cheap and deterministic.” Routing gates become non-reproducible unless the rewriter is frozen. |
| **Agentic planner** (multi-search with a plan) | Sample agents already multi-search (CRDT: 3 searches + 2 executes and still failed). Planner without new evidence **does not raise the ceiling**. Discovery eval already allows ≤3 searches. | High if it adds turns. | High. | Compatible. Does not fix empty corpora. |
| **Rerank (host cross-encoder / LLM listwise)** | Helps when the right card is in top-20 but not top-5. Legacy top-5 is already 312/338 (**92.3%**). Rerank is the wrong medicine for a top-1/holdout problem and for QA misses that *had* the right op. | Medium. | Medium. | Compatible. |

**The structural lose is not “top-5 ranking among known cards.”** Legacy card@5 is 94/182 by a different metric; top-5 hit is 92%. The structural lose is (a) holdout paraphrase, (b) upstream absence, (c) goldens that punish the card you *did* retrieve (docs vs Core). Hybrid search addresses (a) only.

**Do not sell Vectorize as +30.** Sell it as a general alias/paraphrase layer with a holdout forbidden-capture cap. Pre-register against holdout + a 30-case QA slice, not the board KPI.

---

## 4. Radical alternatives, priced

Point impacts are **half-credit points on the 100-case sample**, not promises. They assume no score-laundering of goldens.

### (a) Canonical answer cache / precomputed answers for high-frequency truths

What: host KV of `{questionCluster → dated answer}` for protocol constants, SEP lists, “what is X.”

| | |
|---|---|
| Point impact | **+4 to +10** on stable protocol/tooling facts; **negative** on live cases if cache is treated as gospel. SCF round would have been *more* wrong with a 2026-08-18 cache. |
| Infra | Cheap KV. Write path is the cost: who refreshes, from which primary, with which `asOf`. |
| Maintenance | **This becomes a second golden corpus.** The repo already cannot keep 499 goldens true (WisdomTree IDs, SCF phase, MPP URL). A cache of answers will rot faster. |
| Failure | Users get last month’s SCF round with high confidence. CRDT cache hides ll-012. |
| Doctrine | Breaks “manifest is the surface” if the cache is a third tool. As a host-side hint inside `execute` it is a silent oracle — worse. **Refuse as a product feature.** Accept only as an *eval fixture* for stable protocol, never live. |

### (b) Retrieval-time self-verification

What: second pass: “does this claim appear in the execute pack? if not, hedge or drop.”

| | |
|---|---|
| Point impact | **+2 to +5** on fabrication wrongs (indexer aliases, unsourced repoScore, CRDT denial). **~0** on as-of partials and dispute goldens (the false claim *is* in the docs pack). |
| Infra | Extra model tokens per case, or a deterministic pack-vs-answer checker (you already have `evidence-pack.mjs` / `findTranscriptEvidencePackOmissions`). |
| Maintenance | Deterministic support-check is the cheap version. LLM self-check is recursive judge cost. |
| Failure | Over-hedging: “I cannot confirm” on facts that are in the pack but wording-mismatched. |
| Doctrine | Compatible. **Do this.** Prefer deterministic pack contradiction over a second LLM. The playground already has an evidence checkpoint (`ARCHITECTURE.md`). Promote the same rule to MCP `SERVER_INSTRUCTIONS` within the 2,048-character budget, or it will not reach Claude Code. |

### (c) Multi-model answering consensus

What: two answering models, vote or judge-pair.

| | |
|---|---|
| Point impact | **+1 to +4** if errors are uncorrelated. Same-family (Sonnet+Sonnet) ≈ 0. Cross-family (Sonnet+Grok/Opus) may catch CRDT denial vs “I cannot find it, do not assert absence.” Will **not** agree on Horizon lifecycle or passkey-kit politics — those are source conflicts. |
| Infra | **2× agent cost.** 100-case run was **$47.87 agent**. Full 497 was **~$304**. Consensus full battery ≈ $600–900 before judges. |
| Maintenance | Tie-break policy becomes new gospel. |
| Failure | Consensus toward the louder SDF blog, i.e. the same “wrong” on dispute cases. |
| Doctrine | Compatible. **Refuse as the first +30 lever.** Use as a *judge ensemble* first (cheaper, $10/100) rather than double answering. |

### (d) Replace code-mode with curated tool-per-intent endpoints

What: `get_scf_round`, `get_wallet_roster`, `get_base_reserve`, `get_passkey_sdks` as first-class MCP tools.

| | |
|---|---|
| Point impact | **+8 to +15 on the current battery** because the battery *is* those intents. That is overfitting. Holdout and real users will ask questions you did not mint tools for. |
| Infra | Each tool is an adapter + schema + exposure review. You already fled this shape (PLAN.md: Cloudflare ships search+execute for a reason). |
| Maintenance | Tool explosion. Every SCF phase change is a tool contract change. |
| Failure | The model picks the wrong tool; you have no compose path. Paid/side-effecting ops become easier to expose by accident. |
| Doctrine | **Hard break of ADR-0003.** Manifest-as-surface, networkless JS compose, and “no per-question tuning” all die. **Refuse.** |

### (e) Hybrid: keep code-mode, add a fallback “direct answer” for evidence-poor queries

What: if execute returns soft-empty / low support, host synthesizes from a frozen FAQ or from a web arm.

| | |
|---|---|
| Point impact | **+3 to +8** on CRDT-class holes *if* the fallback may use the public web. **Eval/EVALS.md deliberately does not measure general-web questions** and skipped 51 such cases. Adding a web arm changes the product. |
| Infra | Web arm = secrets, SSRF, cost, ToS. FAQ arm = answer cache (see a). |
| Maintenance | Fallback policy is a new judge: when is evidence “poor”? |
| Failure | Fallback answers ungrounded in execute, then the QA judge (rightly) wants transcript support. You will grade your own fallback as unverified or wrong unless you also change the judge. |
| Doctrine | A web arm contradicts “closed-world Stellar corpora.” A FAQ arm contradicts forward-only live truth. **Refuse a web arm.** Allow a *hedge fallback* (“not in these sources as of T; here is how to verify on-chain”) — that is self-verification, not a second oracle. |

### Alternatives matrix (compressed)

| option | Δ half-credit (honest) | $ / 100 cases | maintenance | failure | doctrine |
|---|---|---|---|---|---|
| (a) answer cache | +4..10 stable / negative live | low | **second gospel** | stale SCF/CRDT | break or dirty |
| (b) self-verify (deterministic first) | +2..5 fabrications | low–med | low | over-hedge | **keep** |
| (c) multi-model answers | +1..4 | 2× agent (~$96) | tie-break gospel | agrees on blogs | keep, poor ROI |
| (d) tool-per-intent | +8..15 on *this* battery | high eng | explosion | no compose | **break ADR-0003** |
| (e) direct-answer fallback | +3..8 if web | high if web | policy | ungrounded | web = product change |
| Vectorize hybrid search | +2..6 paraphrase | low-med | embedding pin | related-wrong ops | **keep** |
| Rubric/golden honesty (not a product change) | **+5..12 apparent** | judge-only | high (golden-truth) | accused of laundering | keep if sourced |

The only items that both raise *real* answer quality and survive doctrine are **(b)** and **hybrid dense search**, plus **upstream filings** (ll-012, sd-004, sd-042, sd-003). Apparent points from relaxing dispute goldens are real *measurement* work, not product work. Do them under `golden-truth`, with independent review, and do not book them as Raven quality gains.

---

## 5. Uncomfortable synthesis — +30 points in one quarter

**I would refuse the +30 target on this KPI.** 60–65% half-credit with 38–45% strict and 17% judge flip is not a system that is 35 points from “done.” It is a system whose meter is a 5-item checklist judged by the same model family, against goldens that encode live phases and docs disputes.

If I were still accountable for a large visible move, I would do this — and I would pre-announce that the *board number* will change.

### First (weeks 1–3): stop lying with the meter

1. Freeze a **usable-answer** panel: 30 of the 100 ids, two independent humans or a pairwise judge vs the saved answer, binary “ship to a Stellar builder?” Report that beside half-credit. Budget: low thousands of dollars, once.
2. Split the 15 wrongs into **fabrication / upstream-empty / docs-dispute / freshness-snapshot / process-writing**. This lane’s 10-case work is the template. Do not change goldens in the same commit as a product change.
3. Fix the three stale-gospel items under `golden-truth`: SCF #46 live phase as *behavior* not a pinned round; WisdomTree issuer/SAC to live Horizon/`toml`; MPP docs URL. Independent re-derivation required. **Do not re-grade the 2026-08-14 answers as a victory.**
4. Turn on **coreAnswer reporting** in the next comparable run (rubric ≥ v2.5). The 100-case file has `coreAnswer: null` on every row. You cannot even say “core was right” from the headline artifact.

Expected apparent move: **+3 to +8 half-credit** after golden hygiene, mostly SCF/Horizon/passkey/Freighter reclassification. Say out loud that this is measurement, not product.

### Second (weeks 3–8): general mechanisms only

5. **Deterministic self-verification** in MCP instructions + playground: no confident existence/non-existence without a supporting execute row; no “hardcoded” vs “configurable” without naming the source layer. Stay inside the 2,048-character instruction budget (`ARCHITECTURE.md`).
6. **Host-side hybrid search** over catalog text + `routingKeywords` (Vectorize or Workers AI embedding). Pre-register: holdout forbidden-captures must not rise; legacy top-1 band ±1%; two unrelated QA targets (entity paraphrase + long-question recovery). Cap spend. Independent review before paid QA.
7. **Upstream, not local patches:** keep ll-012 / sd-004 / sd-042 / sls-023 alive. CRDT will not fall out of lexical ranking. Horizon/RPC wording will keep failing docs-faithful agents until docs agree with themselves.
8. **As-of dating** as a *general* synthesis rule for `freshness != stable`. This is the partial-mass. Prior prompt-append work found it is framing, not clause coverage — so make it a hard instruction, not a per-case keyFact farm.

Expected real move: **+5 to +10 half-credit** on a *common-id, same-tuple* remeasure, if hybrid search actually recovers 2–3 entity misses and self-verify converts 1–2 denials/fabrications. If holdout forbidden-captures rise, stop.

### Third (weeks 8–12): only if 1–8 moved the usable-answer panel

9. Judge **ensemble** (Sonnet + one other family) on stored answers. Cheap. Cuts flip rate. Do not change answering model as a default (`eval/qa/README.md` already declined that).
10. Expand corroboration clusters so auto-reopen is not blind to 238 unclustered cases (`eval/qa/README.md`). This prevents the next WisdomTree-ID scramble.

Expected: variance down, not a heroic +15.

### What I would refuse

- **Promising 100% or +30 on v2.4/v2.8 half-credit.** That number is a checklist. Checklists with 5 keyFacts and live phases do not go to 100.
- **Per-question tuning.** CRDT alias, SCF special-case, passkey boost. The ADR has held; breaking it will win the sample and lose holdout.
- **Answer cache of live SCF / TVL / wallet counts.**
- **Replacing search+execute with tool-per-intent.**
- **Web/Perplexity arm** as a quiet product change while still calling the closed-world QA battery the headline.
- **Booking golden edits as quality gains** without a common-id remeasure and a reviewer who did not author the gospel change.
- **Raising the answering model** as the strategy. The 2026-08-19 sample-30 majority did not show a material gain; review rejected two upgrades as judge inconsistency.
- **Dense search as a substitute for empty Lumenloop rows.**
- **Using the 100-case 64.5% as if it were the 497-case 60.4%.** Sample-100 is optimistic relative to the owned battery.

### What “good” looks like in a quarter without self-deception

- Usable-answer panel ≥ 80% on 30 ids, with humans.
- Strict checklist maybe 45→52%. Half-credit maybe 60→68% on a common 100, same tuple, after hygiene + one general mechanism.
- Holdout top-1 not worse; forbidden captures not up.
- ll-012 either fixed-upstream or still open with new live evidence, not papered over.
- Zero new `solo://` live paths; zero per-question catalog hacks.

If management needs a hockey stick, they need a different meter or a different product (a Stellar FAQ with editors). Raven is a closed-world MCP over three uneven corpora and a skill pack. Its honest ceiling on a 5-fact live checklist is not 100. It is “most builders get a sourced, dated, non-fabricated answer, and we file the rest upstream.” That is already what `EVALS.md` says the evals are for. The 65% panic is what happens when that sentence is forgotten.

---

## Citations (primary, this lane)

**Eval artifacts.** `eval/qa/results/2026-08-14T03-56-23-variantA.json`; `eval/qa/results/2026-08-18T22-04-13-rejudge.json` (`nonIdentical: true`, 17 disagreements); `eval/qa/judge.mjs`; `eval/EVALS.md`; `eval/qa/README.md` (rubric, 490- and 497-case reviewed records); `eval/gates.json`; `ARCHITECTURE.md`; `PLAN.md`; `src/catalog/scoring.ts`; `improvements/lumenloop/ll-012-rwa-live-planned-recall.md`; `improvements/stellar-docs/sd-042-horizon-deprecated-present-tense-regression.md`; `improvements/stellar-light-scout/sls-023-rwa-product-deployment-status.md`.

**Live 2026-08-25.** WisdomTree IR 2025-09-12; `https://stellar.wisdomtree.com/.well-known/stellar.toml`; Horizon `GET /ledgers?order=desc&limit=1` (ledger 64123958, base reserve 5e6 stroops); Horizon `GET /assets?asset_code=CRDT&asset_issuer=GBWMQUGPPLSC62YPGD5CEHATOQRQMNLNAV2TMEXJ4ZYOTY4TJD6J2P45` (SAC `CBQDK4Y3B2RYUSXE6JYYTHB6AIW655FPGE4OW7A2BWDZXZ5RALQ3UK3P`); `https://communityfund.stellar.org/awards`; `https://stellarlight.xyz/api/rfps?status=open`; Stellar docs APIs / lumens / sponsored-reserves / frontend-guide / getTransactions / MPP / wallets / smart-wallets; `https://mpp.dev/advanced/discovery`; `https://mpp.dev/payment-methods/stellar`; GitHub `stellar/passkey-kit`, `stellar/smart-account-kit`, `stellar/freighter` manifest v5.45.0, `stellar/ecosystem-resources` wallet README, `stellar/scf-handbook`, `stellar/stellar-core` `TransactionUtils.cpp` (`getMinBalance` vs `getSellingLiabilities`).

**Field practice.** Zheng et al. MT-Bench/Arena; G-Eval (Liu et al. 2023); RAGAS (Es et al. 2023); CRAG (Yang et al. 2024); FreshQA; `arXiv:2411.16594` LLM-as-judge survey; `arXiv:2506.20128` CCRS; Springer *Artificial Intelligence Review* 2026 LLM-as-judge survey (self-preference, length, position bias; pairwise vs pointwise).
