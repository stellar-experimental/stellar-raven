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
