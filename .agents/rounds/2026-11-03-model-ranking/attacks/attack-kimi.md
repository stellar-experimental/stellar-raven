# Adversarial review: model-assisted search ranking contract

## Verdict

Do not start candidate measurement yet. The contract has two blockers and several major gaps. A winner can overfit the selection corpus. The measured model path can also differ from the production model path. The amendments below keep the current candidate set unchanged.

No candidate result informed this review.

## Findings

### K-01 — Blocker: variant selection has no untouched confirmation set

**Exact text.** `contract.md` section 6: “Order of preference among eligible candidates.” Section 7 says: “Holdout and extended rows are not used to choose constants.” `candidates.md` section 8 selects `dense*`, `rerank*`, and `clef*` by “the highest Q score.”

**Problem.** The round can evaluate up to 89 Cloudflare-hosted variants. It then selects the winner on the same rows used for acceptance. Family f also selects components on those rows. This is model and fusion tuning, even when every numeric constant stays fixed. The two sources use the same queries and labels. They are not independent confirmation samples. Two repeats measure model noise, not sampling error. The holdout therefore stops being a holdout.

**Smallest amendment.** Freeze a separate confirmation corpus before measurement. Reveal its results only after the coordinator names one finalist. Require every Q rule and the minimum-effect rule on that corpus. Otherwise, report the round as diagnostic and ship nothing.

### K-02 — Blocker: fixture capture does not exercise the production model path

**Exact text.** `contract.md` section 3 says: “In the harness and in CI, the evidence comes from the committed fixture (R10). In production, it comes from the live call.” `harness.md` section 5 requires `cf ai run`. `runtime-design.md` section 1 requires `env.AI.run(..., { gateway })`. The latency probe “returns no model output” (`harness.md` section 8).

**Problem.** The CLI and the Worker binding can apply different wrappers, defaults, gateway behavior, and errors. R7 measures Worker timing but discards the Worker output. No rule proves that the accepted fixture represents production evidence. A candidate can pass offline and rank differently after deployment.

**Smallest amendment.** Validate the final fixture through the same Worker adapter and gateway used in production. Compare every final fixture key before acceptance. Use the declared output validators and repeat-stability tolerances. Run the deploy canary through that path too.

### K-03 — Major: class (m) removes the semantic check from every model-caused loss

**Exact text.** `contract.md` Q3 defines class (m) as “a promoted entry with higher model evidence than the demoted entry.” It requires only that the entry “is not a forbidden card for that row.” `harness.md` section 7.3 repeats the same mechanical test.

**Problem.** A higher score does not establish relevance. An arbitrarily small score margin satisfies the rule. Most rows have no forbidden-card label. Every promoter in a pure model reorder can therefore satisfy (m), even when it answers the wrong question. Q1 and Q2 still count the loss, but Q3 no longer rejects a demonstrated semantic regression.

**Smallest amendment.** Require an independent, blinded relevance judgment for every (m) loss. The promoted entry must be at least as responsive as the demoted expected entry. Fail Q3 when it is less responsive. Keep the mechanical trace as supporting evidence.

### K-04 — Major: class (m) is undefined for combined evidence

**Exact text.** `contract.md` Q3 requires “the model evidence values.” `candidates.md` section 8 defines family f with two model components and RRF fusion. `harness.md` section 7.3 refers to “the variant's model value.”

**Problem.** Family f has no single declared model value. Dense and reranker evidence can rank the same entries differently. A reviewer can choose the favorable component after seeing a loss. The coordinator cannot recompute one mechanical class from the current text.

**Smallest amendment.** Declare one combined-evidence formula for each family f fusion before measurement. Trace every component and the combined value. Forbid component selection during loss classification.

### K-05 — Major: the minimum effect can come from only a few rows

**Exact text.** `contract.md` section 3 says: “One row can give both.” Section 6 requires “net gain on each source” of at least `+10`. It defines net gain as the lane sum of `W − L` over strict keys.

**Problem.** The strict keys are nested and correlated. One row moving from outside top five to rank one can create several wins. Ten net key flips can therefore represent about three rows. The same rows can supply the gain on both sources. This does not establish a general improvement.

**Smallest amendment.** Add a unique-row effect requirement. Require at least 10 distinct rows per source with more strict wins than losses. Keep the existing key-based W/L rules as secondary guards.

### K-06 — Major: the repeat protocol permits capture cherry-picking

**Exact text.** `contract.md` R13 says: “Each candidate captures two repeats.” `harness.md` section 5 says repeat 2 uses `cache-r2/`, “so it is a real second capture.” No rule covers discarded or overwritten captures.

**Problem.** A lane can repeat a failed capture until it gets two acceptable fixtures. The contract requires reports for variants, not for every capture attempt. Timestamps alone do not prevent replacement. The lower-Q fixture rule does not fix this selection effect.

**Smallest amendment.** Create an append-only capture manifest before grading. Hash and report every attempt in capture order. Grade the first two complete captures only. Permit replacement only for a pre-declared infrastructure failure, with evidence.

### K-07 — Major: the fresh source is not cryptographically frozen

**Exact text.** `harness.md` section 3 says: “The coordinator supplies the three inventory and pin inputs from the ignored archive.” It then says: “Record the manifest SHA-256 in the report.”

**Problem.** No input hashes or expected fresh-manifest hash are pre-registered. An accidental archive mismatch can change the second source. Independent reviewers cannot reconstruct the promised input from the contract alone. Recording a hash after rebuilding does not prove that it was frozen.

**Smallest amendment.** Record the archive SHA-256 and every extracted input SHA-256 before measurement. Pre-register the expected fresh-manifest SHA-256. Stop on any mismatch, as the main source already does.

### K-08 — Major: R3 does not prove exact fallback identity

**Exact text.** `contract.md` R3 says: “Fallback mode returns exactly the baseline lexical page.” It proves this with “an empty `--dump-ranked` diff.”

**Problem.** The current dump excludes holdout rows. See `eval/run-routing.mjs` lines 138–142 and 461–467. The dump also compares only ordered hit IDs. It ignores scores, totals, confidence, recovery metadata, and other page fields. It covers only the runner's `limit: 5` calls.

**Smallest amendment.** Add holdout to the dump. Also deep-compare complete baseline and fallback pages for every corpus row and probe. Include the declared option slices from K-09.

### K-09 — Major: quality is measured only at an unfiltered `limit: 5`

**Exact text.** `candidates.md` section 1 says: “The routing corpus uses `limit: 5`, so K = 20 there. The production default (`limit: 10`) also gives K = 20.” `eval/run-routing.mjs` line 10 fixes every graded call at `limit: 5`.

**Problem.** Selection and pool construction can behave differently at other limits. Service and kind filters also change E and every model pool. No Q rule measures the production default or the maximum limit. A design can improve the test slice and degrade common production slices.

**Smallest amendment.** Add pre-declared baseline-versus-candidate comparisons at the default and maximum limits. Include compatible service and kind filter slices. Apply Q1, Q2, Q4, and the unique-row effect rule to those slices.

### K-10 — Major: R7 measures a narrow model wait, not production added latency

**Exact text.** `contract.md` R7 defines added latency as “the wall time from the start of model work to evidence-ready.” `harness.md` section 8 times only `env.AI.run(...)`. It uses “the coordinator's nearest colo.”

**Problem.** The probe excludes pool construction, canonicalization, validation, vector decoding, fusion, and adapter overhead. It does not measure a cold production isolate. One colo cannot establish the production tail. The routing requests also exercise K = 20, not the maximum K = 60. The percentile algorithm and treatment of timed-out samples are unspecified.

**Smallest amendment.** Run an end-to-end baseline-versus-assisted A/B through the production adapter. Include maximum-pool and maximum-input requests. Measure at least two distinct colos and cold isolates. Define nearest-rank percentiles and include every timed-out call.

### K-11 — Major: character-based token estimates cannot prove the cost cap

**Exact text.** `harness.md` section 6 estimates input tokens as “`ceil(chars / 3)`” and calls this conservative. It computes worst case using “the longest canonical query (512 characters).” `contract.md` R6 relies on character caps “by construction.”

**Problem.** Three characters per token is not an upper bound for arbitrary Unicode or uncommon strings. The longest string need not have the most tokens. Card text has the same problem. The reported worst case can therefore understate billable usage.

**Smallest amendment.** Enforce a token-based input cap with the provider tokenizer. Otherwise, use a proven tokenizer-independent upper bound. Compute worst-case cost from that bound, not from corpus string lengths.

### K-12 — Major: R6 does not clearly price one complete search

**Exact text.** `contract.md` R6 sets a ceiling per “1,000 search calls” but specifies “mean cost per call.” `harness.md` section 6 uses repeat 1 only. `candidates.md` section 8 allows parallel model components.

**Problem.** The text does not explicitly sum component calls, retries, failed attempts, and invalid outputs for each search. Family f can pass component-level accounting while its total exceeds the ceiling. Repeat 2 can also have different cached-input usage.

**Smallest amendment.** Define R6 as total list-price model spend for one search request. Sum every component attempt, including retries and failures. Compute each repeat separately and gate on the higher value. Apply the same sum to worst-case cost.

### K-13 — Major: Clef partial-output rules conflict between harness and runtime

**Exact text.** `candidates.md` section 5 says: “An option with no returned probability gets 0.” `runtime-design.md` section 3 lists “a missing probability” as invalid. `contract.md` R6a invalidates only an output with “zero valid ids.”

**Problem.** The harness can rank with zero-filled partial evidence while production falls back. The validator also lacks rules for unknown IDs, duplicates, and out-of-range probabilities. These outputs can change order without triggering the invalid-rate gate.

**Smallest amendment.** Define one validator shared by capture, CI, and production. State the required ID coverage and every rejection condition. Use exactly the same partial-output behavior in every path.

### K-14 — Major: same-ID model drift can bypass a new acceptance round

**Exact text.** `contract.md` R8 says: “A model id change is a new candidate.” `runtime-design.md` section 4 says a canary failure blocks deployment “until the author regenerates the fixture and vectors and passes the gates again.”

**Problem.** A hosted model can change while its ID stays fixed. Regenerating artifacts can make the changed model the new baseline without repeating Q1–Q13. This contradicts the purpose of pinning and pre-registration.

**Smallest amendment.** Treat every canary-detected output drift as a new candidate. Require the full acceptance contract and independent review before regeneration can ship. Never resolve a failed canary by fixture regeneration alone.

### K-15 — Major: cache-write safety is not specified

**Exact text.** `runtime-design.md` section 3 says a late result “is dropped, never merged, and never cached for this request.” Section 4 defines the shared cache but gives no write precondition.

**Problem.** “For this request” leaves a late shared-cache write ambiguous. The design also does not explicitly require validation before caching. A late, invalid, or drifted result could affect later callers. Section 8 tests cache keys but not these cases.

**Smallest amendment.** Cache only validated outputs that arrive before T. Never write late, invalid, error, or partial outputs. Add unit and smoke tests for each rejected write.

### K-16 — Major: production can fall back too often to deliver the accepted gain

**Exact text.** `contract.md` R6a allows a 1% invalid-output rate. R7 separately allows a 1% timeout rate. `runtime-design.md` section 5 gives only “proposed” gateway limits. Section 6 calls the 5% fallback alert a threshold “to propose.”

**Problem.** Errors, budget refusals, and rate-limit refusals have no combined ceiling. The assisted quality profile can therefore describe a small fraction of production calls. Unsigned gateway limits also leave R11 without exact enforceable values.

**Smallest amendment.** Sign exact gateway and caller limits before acceptance. Add one combined non-operator-disabled fallback ceiling of 2% to the runtime measurements. Make the fallback alert mandatory before deployment.

### K-17 — Major: the proposed `AGENTS.md` exception forbids family f

**Exact text.** `runtime-design.md` section 9 says: “It may call one pinned Workers AI model.” `candidates.md` section 8 defines family f with two model components.

**Problem.** A family f winner can pass the contract and violate the required repository rule. The singular model bound also leaves combined cost and timeout ownership unclear. The final sentence points future changes to this already frozen round contract.

**Smallest amendment.** Permit only “the pinned model set of the shipped variant.” Apply one total timeout and one total cost ceiling to that set. Require a new pre-registered contract for later changes, not an edit to this round.

### K-18 — Major: the shipping gates omit accepted strict metrics

**Exact text.** `runtime-design.md` section 7 creates assisted and fallback profiles. It names legacy, skills, and holdout values but no extended-lane or card-level gates. `contract.md` Q2 protects every extended metric and legacy `cardHit5`.

**Problem.** The acceptance contract protects metrics that CI will not enforce after shipping. The current runner gates only legacy top1/top3/top5, skills top1, and holdout. See `eval/gates.json` lines 55–73. Later changes can silently remove part of the accepted improvement.

**Smallest amendment.** Add every Q2 strict metric to both shipping profiles. Include extended and all `cardHit5` values with explicit thresholds. Add their evidence hashes and per-lane denominators.

### K-19 — Major: `f-bdr` can escape the full lexical-probe bar

**Exact text.** `contract.md` Q7 says: “A candidate that changes lexical matching (family b) must pass” every required probe. `candidates.md` section 8 defines `f-bdr` with “family b lexical.”

**Problem.** `f-bdr` changes lexical matching but belongs to family f. The parenthetical creates a loophole. It can seek the weaker non-regression bar while direct family b variants must fix every probe.

**Smallest amendment.** Apply the full Q7 bar to every variant with `lexical: "morph-schema"`. Name `f-bdr` explicitly for clarity.

### K-20 — Major: Q9 rejects harmless description sensitivity

**Exact text.** `contract.md` Q9 says: “If a graded page changes, the candidate fails.” `harness.md` section 7.6 counts page changes after removing the dApp override.

**Problem.** A model can produce a different but equally correct order after entry text changes. Q9 fails even when every strict grade improves or stays fixed. This tests page stability, not dependence on the override. It can reject a genuinely robust design.

**Smallest amendment.** Fail only on a strict-key loss after override removal. Compare against the candidate's own pre-removal result. Retain page changes as diagnostics.

### K-21 — Minor: the dense validity screen can reject complementary evidence

**Exact text.** `candidates.md` section 3 says: “A model below 150 of 338 is broken for this task. Drop all four of its variants.”

**Problem.** Dense-only top1 does not measure complementarity with lexical evidence. A model with lower standalone accuracy can still improve the missed subset. The fixed screen prevents the fused measurement that answers the round's question.

**Smallest amendment.** Make the screen a diagnostic. Keep all pre-registered fusions unless they fail a declared quality, cost, or safety stop rule.

### K-22 — Minor: the shared cache retains a dictionary-reversible query identifier

**Exact text.** `runtime-design.md` section 4 uses `sha256(modelId + "\u0000" + canonicalBody)`. It stores that key in a synthetic URL for seven days. Section 9 says search “stores no user data.”

**Problem.** The cache contains no plaintext query, but its deterministic key derives from the query. An observer can hash likely queries and match them. This is derived user data under a conservative privacy reading.

**Smallest amendment.** Use a host-secret HMAC for the runtime cache key. Keep the existing SHA-256 fixture key for offline determinism. Otherwise, classify the hash as derived query data and obtain explicit privacy approval.

### K-23 — Minor: the experiment spend guard is not atomic

**Exact text.** `harness.md` section 5 allows “at most 8 calls at a time per model.” Section 6 says: “Before each paid call, sum `usd` for the lane and the round.”

**Problem.** Concurrent calls can all pass the same check before any result enters the ledger. Separate worktrees also lack one specified shared round ledger. The signed cap can therefore be exceeded.

**Smallest amendment.** Reserve estimated spend atomically in one ledger before dispatch. Reconcile actual cost after completion. Include latency calls in the same reservation system.

## Minimum pre-measurement set

Resolve K-01 and K-02 before any candidate run. Resolve K-03 through K-19 before accepting a winner. The remaining amendments can land with the harness or shipping design, but none should stay implicit.
