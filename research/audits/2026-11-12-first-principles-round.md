# First-principles round: what should Raven hand back to an agent — November 12 to 14, 2026

**Raven keeps `search` + `execute`, and ships a trimmed version of that surface for cost.** No evidence-returning `retrieve` tool beat today's design; the best one failed when served live. The trimmed surface cost the calling model 41% fewer tokens on unseen cases for a small accuracy loss the test could not rule out, and the owner chose it on cost. The decision is [ADR-0011](../decisions/0011-tool-surface-stays-code-mode-trimmed.md); the round ledger is [`.agents/rounds/2026-11-12-fp.md`](../../.agents/rounds/2026-11-12-fp.md).

This record holds aggregate numbers only. Held-out and reserve cases stay unseen: no case id, question, answer, or golden text from them appears here.

## The question

The owner's framing: the caller is always an agent. When it brings Raven a Stellar question, what should Raven hand back so that the agent can answer with real citations, at the lowest cost in tokens, time, and dollars? The round was a prototype study. Nothing merged or deployed during it.

## How it was measured

| Item | Value |
|---|---|
| Baseline, "arm A" | `search` + `execute` at `origin/main` `8cb76750`, plus a plain page fetch |
| Corpus | The 501 active golden cases, split once by rule into 151 tuning, 200 held-out, and 150 reserve. Most tuning runs used a fixed 61-case subset. |
| Calling agents | Claude Sonnet 5.5, GPT-6.1 Terra, Grok 4.7, and Claude Haiku 5.5, in one generic tool loop: 8 tool calls, 12 model calls, 2,048 output tokens |
| Score | The repo judge (rubric v2.11) on the final answer: correct 1, partial 0.5, wrong 0, averaged. The case is the unit; clients are averaged within a case. |
| Rules | Every stage's pass rule was written before its data. Lanes that built an arm never saw held-out cases. |
| Fairness view | The same result without cases whose golden facts name Raven operations or mostly prescribe procedure (15 of the 61). It could weaken a result and could not rescue one. |

## What ran, and what decided

### 1. Component measurements (151 tuning cases)

| Tried | Result |
|---|---|
| A model plans which sources to search | Cases with all facts supported fell from 18.5% to 11.9% |
| Compressing evidence to a 4k-token scored pack | Tokens down 82%, fact support down 6 points against a limit of 2 |
| A model declares the evidence sufficient | Right 14% of the time; the bar was 85% |
| Model-written queries; whole-page reads | +1.4 and +1.9 points of per-fact support under strict checking, for about twice the tokens |
| A Raven-owned search index (Cloudflare AI Search) | No clear win, and 10.8 s at the median |
| Jev 1.14 as passage scorer | Agrees with a reference labeller on 95.7% of pairs. It inflates differences between arms two to three times, so it was not used to decide anything. |

The finding that outlasts the round: **291 of 569 golden facts in the tuning set have no supporting passage anywhere in the evidence Raven retrieved.** In a sample of 60 of them, 55% were not found by a bounded targeted search, 33% were requirements on how to answer and not facts about Stellar, and none was in a fetched page but ranked out. Ranking is good. Sources and goldens set the ceiling.

### 2. The screen: eleven `retrieve` variants against arm A (61 tuning cases, four clients)

Each variant returned the same stored evidence in a different form: links, excerpts, passages at several sizes, whole pages, or a short cited brief written by a model. "Open" variants let the agent call again or read a source.

| Variant | Score | Client tokens, share of A |
|---|---:|---:|
| **Arm A** | **0.672** | 100% (117,751) |
| Best variant: cited brief plus links, open | 0.633 | 20% |
| Other open variants | 0.607 to 0.623 | 23% to 31% |
| Single-call variants | 0.520 to 0.580 | 6% to 21% |

Every variant scored below A. Follow-up calls were worth 0.08 to 0.11. Showing relevance scores to the agent did not help. The brief was not shown to beat plain passages (+0.010, interval −0.025 to 0.047).

### 3. The best variant, served live (same 61 cases)

The screen had replayed each first call from storage. The rule for the live check: stay within 0.05 of A.

| | Live | Arm A |
|---|---:|---:|
| Score | 0.598 | 0.672 |
| Difference, 95% interval | −0.074, −0.127 to −0.025 | |
| Wrong answers of 244 | 20 | 11 |
| Client tokens per question | 24,030 | 117,751 |
| Median time per question | 36.7 s | 20.3 s |

**Dropped.** One live call took 15 s at the median, 7 s of it writing the brief. No held-out case was spent on it.

### 4. The trimmed surface, "arm B"

Arm B keeps the operations and the sandbox and trims what agents read: the advertised surface falls from 32,797 to about 10,150 characters, `search` returns five compact cards where it returned ten full entries, and the `search` output schema is gone. Two small revisions followed tuning failures. Both restored sentences from arm A's own description, and an independent overfit review found nothing case-specific in them.

| Step | Cases | Result |
|---|---|---|
| Reference run, two clients | 61 tuning | 0.656 against 0.656; client tokens 0.593 times A's. One new failure: an operation id called as a top-level tool. |
| First gate, four clients | 61 tuning | Failed one condition of seven: 23 questions with a failed `execute` against a limit of 22 |
| Re-gate after the second revision, three decisive clients | 61 tuning | Passed: 0.656 against 0.672; wrong 11 against 9; tokens 0.592 times; the two targeted error kinds fell from 7 to 0 |

Before any held-out case was opened, the owner set the margin at 0.05 and named Sonnet 5.5, GPT-6.1 Terra, and Grok 4.7 as the clients that decide. Haiku ran and was reported without a veto.

### 5. Held-out first look (100 unseen cases, both arms live and interleaved)

| Three decisive clients, 300 answers per arm | Arm A | Arm B-fixed-2 |
|---|---:|---:|
| Score | 0.662 | 0.632 |
| B minus A, 99% interval | | **−0.030, −0.070 to 0.007** |
| Wrong answers | 30 | 35 |
| Client tokens per question | 113,829 | 66,876 (41.2% fewer; interval 38.4% to 44.0%) |
| Measured cost per answer, judge included | USD 0.195 | USD 0.149 (24% lower) |
| Median / 95th percentile time | 21.6 s / 78.9 s | 21.2 s / 55.6 s |
| Answers with citations, all of them returned or fetched | 71.0% | 77.3% |
| Questions with a failed `execute` | 10 | 11 |
| Top-level misuse; non-exposed operations reached | 0; 0 | 0; 0 |

By client, B minus A: Sonnet −0.025, Terra −0.020, Grok −0.045, Haiku +0.040.

Under the registered rule this look was **undecided**: the interval crosses −0.05. The wrong-answer guard missed by one answer (limit A plus 4). The other guards passed: cost, misuse, script errors, latency, citations, the canonical live cases (35 strict-correct against 32, exactly at its allowance), and the boundary. The fairness, prior-exposure, and second-judge views all showed a smaller gap (−0.022, −0.019, −0.003).

**Where B is weaker.** On cases tagged as needing live data, B scored 0.646 against 0.707 with 12 wrong answers against 6 (99 answers per arm). On scheduled and stable cases the arms were level or close (0.535 against 0.535; 0.711 against 0.740). These strata were reported, not tested.

A second look on the other 100 held-out cases started and was stopped by the owner after 32 of 800 answers. No analysis was run on them.

## Owner decisions

| Date | Decision |
|---|---|
| 2026-11-12 | Prototype only; soft budget USD 1,000; evidence first, a server-written answer optional |
| 2026-11-13 | Override the single-event kill on arm B and confirm it; treat misuse as a rate with a limit |
| 2026-11-13 | Restore two scripting rules after the first gate; re-check; then held-out |
| 2026-11-13 | Margin 0.05; Sonnet 5.5, GPT-6.1 Terra, and Grok 4.7 decide |
| 2026-11-14 | Stop the second look and call arm B on the first: under the registered rule, not shown as good as A |
| 2026-11-14 | **Ship arm B-fixed-2.** A path that is much cheaper and only slightly less correct can be the better product. Correctness wins only when the alternative is far less correct. |

The last two are in tension by design. The registered rule asked whether B was as good as A within 0.05, and the answer was "not shown". The owner then weighed a loss of about 0.03 against a 41% token saving and chose the saving. ADR-0011 records that trade.

## Spend

**USD 583.40**: USD 567.75 settled in the gateway logs and USD 15.65 estimated for scorer calls made directly to the Jev provider. The soft budget was USD 1,000.

| Stage | Gateway, settled | Direct to Jev, estimated | Total |
|---|---:|---:|---:|
| Component lanes: probes, harness, calibration, surface, brief writer, retrieval | 37.40 | 5.54 | 42.95 |
| Smoke test of the eleven variants (10 cases) | 36.58 | 1.23 | 37.80 |
| Arm A baseline | 64.91 | | 64.91 |
| Screen of the eleven variants | 182.19 | 5.96 | 188.15 |
| Live check of the best variant | 20.13 | 2.92 | 23.05 |
| Arm B reference run | 13.22 | | 13.22 |
| Arm B tune gates, two | 54.85 | | 54.85 |
| Confirmation smoke on tuning cases | 14.28 | | 14.28 |
| Held-out first look, canonical live cases and extra votes included | 139.60 | | 139.60 |
| Held-out second look, stopped at 32 answers | 4.59 | | 4.59 |
| **Total** | **567.75** | **15.65** | **583.40** |

- **Settled** means the cost Cloudflare recorded per request. All 56,402 logs of the round's four AI Gateways were read once, on 2026-11-14 at 01:59 UTC, before the gateways were removed. Every lane's own ledger matches its gateway figure plus its direct estimate to within USD 0.12.
- **Estimated** means the provider's reported token usage priced by the harness. No provider invoice was checked.
- One request in the first arm B gate timed out with no gateway receipt. Its cost is unknown and is in no total; its reservation was USD 1.21.
- Not included: the Cloudflare AI Search index (its usage does not appear in gateway logs and the account bill was not settled), the subscription CLI usage of the coding agents and reviewers, and upstream service calls.
- Judging was half of the gateway spend (USD 287.47). One judge vote cost about USD 0.049, more than a whole answer from any `retrieve` variant.

## Limits

- **One look of 100 unseen cases decided arm B.** Its interval runs from a loss of 0.07 to a gain of 0.007. A true loss of 0.03 is the best single estimate, not an established size.
- **Everything before the held-out look is tuning-case evidence.** The `retrieve` variants were never run on unseen cases. They failed on the cases they were built on, which is enough for "do not build", not for a size.
- **Judge noise.** One vote per answer, with re-votes only where arms disagreed. A same-day repeat of arm A changed 12 of 61 grades. In the held-out look, 6 of 71 repeat votes flipped a grade.
- **The judge does not see sources.** In a fixed review it called a correctly quoted fact "fabricated" in about 2% of answers from the new variants and in none of arm A's.
- **The goldens mix facts with procedure.** 77 of 569 tuning key facts are flagged as procedural or as naming a Raven operation. This tilts comparisons toward today's surface by an unknown amount.
- **A generic loop, not the products.** Answers came from a plain model-with-tools loop. Claude Code, Codex, and the Grok CLI were only smoke-tested. The Grok CLI cuts tool results at 20,000 bytes, which the loop did not reproduce.
- **Latency across stages** compares runs from different hours. Only the held-out look ran both arms side by side.
- **Review.** Independent overfit reviews covered the dropped finalist and arm B. Independent review of the prototype lanes' code did not happen; none of that code merges.

## Open

| Item | Evidence | Next step |
|---|---|---|
| Arm B is weaker on live-data questions | Section 5: 0.646 against 0.707, 12 wrong against 6 | Find which change costs it (five cards per search, the removed schema, or the shorter instructions) before spending on a fix |
| Golden-truth pass | 77 of 569 tuning key facts are procedural or name an operation; one suspected source-against-golden conflict on Protocol 27 credentials | Separate world facts from process requirements; resolve the conflict against the primary source |
| Source coverage | 291 of 569 tuning facts unsupported; 55% of a sample not found in Raven's sources | Classify where the missing facts live, then test the one or two sources that recover the most |
| The judge sees cited text | About 2% of new-variant answers penalized for sourced facts | A measured judge change, re-scoring stored answers |
| Per-source attempts and final status | In the round's aggregation layer, a successful response hid which source failed. In production Raven, 429 survives all three adapters and 5xx survives Lumenloop and Scout; Mintlify retry exhaustion on 5xx returns no numeric status, and no event records attempts per source. (Corrected 2026-11-14 after independent review; the first version said 429 and 5xx codes are lost in the adapters.) | Record attempts and final status per source, and carry the last status through Mintlify retry exhaustion; reproduce the masking in production Raven before treating it as a product defect |
| Tool results over 20,000 bytes | On held-out, arm B sent no `search` result over that size and 275 of 565 `execute` results over it, counting the three decisive clients | Measure in the Grok CLI; put status lines first |
| Design rules for any future `retrieve` | Accept a lone string for a list argument; give every model-written part a deterministic fallback; return PDF text or say it is unsupported; score lazily; do not write a brief inside the request | Recorded here; no build planned |

## Evidence

The round's working files were not tracked. The text evidence (plans, results, decisions, scripts) is archived on the owner's machine; the round ledger records the archive's name, size, and hash. Row-level data stays out of the repository, and held-out material stays with the lane that ran it.
