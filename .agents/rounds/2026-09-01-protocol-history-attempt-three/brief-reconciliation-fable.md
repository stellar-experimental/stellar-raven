# Reconciliation — attempt-three brief after the Grok `BLOCK`

Date: 2026-09-01
Author: Claude Fable 5 high
Review reconciled: `review-grok-hold.md` (Grok 4.6 high, verdict `BLOCK`)
Repaired file: `brief-fable.md` (full revision)
Status: repair only. No model was fetched or loaded. No network call ran. No paid call ran. The
retained score cache was not read. No path outside this round changed.

## Decision after reconciliation

The first brief recorded a hold. The review showed that three claims behind the hold were false
or overclaimed. This revision withdraws them. It then makes the decision the review required.

The choice was between a cache-only multi-clause aggregation measurement and a hold with a
predicted-fail reason. The revised brief selects the measurement: `clause-support-fit-v1`.

Reason. A predicted-fail reason exists without lexical overlap. The target holds 25 positive
clauses, the most of any entry, against a median of 6. A support-growing aggregate raises the
target on every query. The max-clause readings already captured 6 of 13 controls. That is a
prediction, not a measurement. The measurement costs minutes, no money, and no network. It
reads a cache that already exists. A measured result closes the question. The brief therefore
registers the measurement, and it records the prediction as risk P2 before the run.

## Blocking findings

### B1 — "Zero overlap proves a comparator cannot rank the target"

Accepted. The claim was false.

Repair in `brief-fable.md`:

- Section 3.2 now opens with: the audit measures token reachability only. It states what the
  audit does not measure: pair scores, embeddings, and rank order. It makes no claim about what
  a learned comparator can rank.
- The "cannot rank" sentence in section 1 is gone. The two zero-overlap misses are now stated
  as measured under the two spent models and the max-clause rule only.
- The `archival` and `clawback` facts are now stated as a lexical ranking conflict. Section 3.2
  says `archival` sits on four Docs operations and `clawback` on three non-target entries. It
  calls that a conflict in the lexical scorer. It does not call it a bound on a learned score.
- Section 4 no longer uses lexical overlap to dispose of any learned or aggregate mechanism.

### B2 — "Pure fit is the ceiling; 3/11 is the strongest; eight misses under every attempt-two reading"

Accepted on all three points.

Repair in `brief-fable.md`:

- Section 3.1 now calls the readings "pure max-clause" readings of the two spent models. It
  states that they bound two models under one fit rule. It states that they do not bound other
  aggregation rules over the same pair scores. The word "ceiling" is gone from every section.
- Section 3.1 quotes 4/11 as the best measured blind top-five in the box. Attempt one reached
  it at `m = 0.03` and `m = 0.06`. The table lists both rows.
- Section 3.1 replaces the eight-miss claim. Identity and every attempt-two grid missed eight
  blind positives. The pure max-clause reading rescued `phb-auditor-auth-recursion-follow-up`
  and missed `phb-auth-recursion-auditors` instead. The intersection of all attempt-two readings
  is seven ids, listed in full. The rescued case is named as evidence that a different scoring
  path can move a prior miss.
- Appendix B's second table now labels the rescued case and lists the seven-id intersection.

### B3 — "Family 3 is not distinct and not eligible"

Accepted. The charter excludes the two spent models at a registered hysteresis grid. It does
not exclude a different aggregation over frozen scores with no grid. The second reason in the
old row ("aggregation of low scores stays low") repeated B1 and is withdrawn.

Repair in `brief-fable.md`:

- Section 4 marks Terra family 3 as distinct, general, free, and **selected**.
- Section 5 registers the mechanism in full:
  - 5.1, the causal claim;
  - 5.2, the inputs;
  - 5.3, the exact score function with noisy-OR positive and negative aggregates, and the
    unchanged negative rule;
  - 5.4, no normalization, and why;
  - 5.5, the candidate union restated from attempt two;
  - 5.6, the stable-sort ordering and tie rule, with the `m = 0` equivalence;
  - 5.7, the three readings: two calibrations and one candidate.
- No formula grid and no hysteresis sweep are registered. The max-clause reading is a
  calibration. It reproduces attempt two's pure reading. It is not a second grid point.
- Sections 6 and 7 give the cache identity checks and the two exact calibrations. Section 9
  gives the result schema. Section 10 gives the five-part cache-only proof. Sections 11 and 12
  give the write set, the forbidden set, and the 18 offline tests. Sections 13 and 14 give the
  commands and the stop states.
- Section 1.2 records the evidence-based choice between the measurement and a predicted-fail
  hold. The predicted-fail reason (clause-count asymmetry) is kept as risk P2 in section 15. It
  does not use lexical overlap.
- Trigger T3 now reflects family 3's disposition. Family 3 is the registered attempt-three
  mechanism. T3 therefore covers only evidence sources outside the catalog text.

## Residual findings

### R1 — T3 not pinned tightly enough

Accepted.

Repair in `brief-fable.md`:

- Section 2 pins the 76-case QA regression inventory by derivation rule and hash. The rule: files
  under `eval/qa/corpus/battery/**` whose top-level `surface` array contains
  `scout.searchResearch`. The count is 76. The sorted-id list SHA-256 is
  `c88940063e3306f6afa279e9f004a0824fd9de5c674895aa98c09a657008e17a`. Section 2 also records
  the one extra file, `q-hist-yieldblox-v2-2026-exploit`, which mentions the id outside
  `surface`. It records the battery size of 500 JSON files. A read-only script recomputed the
  derivation on this `HEAD`. The rule matches `routing-analysis-sol.md`.
- Section 6 restates the 495-row membership: legacy 338, extended 122, skills 23, original 8
  positives, original 4 controls. It adds holdout 49 and blind 20. That gives 564 rows and 563
  unique questions. Section 8 and T3 use "the 495 comparison rows" with that definition.
- T3 now bounds the open phrase. It names the `scout.searchResearch` corpus as the primary
  source. Any other source must be named. T3 requires the exact endpoints, request count, and
  byte budget of every network call. It keeps the sample rule, the leakage test, and the
  pre-fetch review. It states that T3 needs an owner decision to open a new box. The reason is
  that attempt three is reserved or spent by this brief.

### R2 — Hold status and attempt accounting easy to misread

Accepted.

Repair:

- Section 1.1 states the accounting in one place. This brief spends no attempt. The one
  authorized referee run spends attempt three. Until then the slot stays unused and reserved.
- Section 14 states which stop states spend the attempt (`PASS`, `PARTIAL`, `FAIL`) and which do
  not (`BLOCKED-*`).
- The ledger outcome carries the same sentence.

### R3 — ASD-STE100 length and one-idea rule

Accepted.

Repair:

- `brief-fable.md` was rewritten in full. The author checked prose sentences for the 20-word
  limit and the one-idea rule. Table cells, code, identifiers, and hash strings are not
  sentences and are excluded from that check.
- The ledger's earlier entries received sentence splits only. No fact, number, hash, command,
  or verdict changed in those entries. The new ledger entry discloses this.
- This reconciliation follows the same rule.

### R4 — Two provenance statements do not match the files

Accepted.

Repair:

- The strict audit script's header comment was corrected to describe the strict rule. The code
  did not change. The corrected script was rerun and reproduced the same tables and the same
  two zero-overlap results. Its new SHA-256 is
  `7a30222b9f7ad215de8e06286d18865d4006803d0400419020018ae93edea0b7`. Appendix A carries the
  corrected script verbatim and the new hash. Section 17 carries both script hashes.
- Section 17 no longer says the raw outputs are in the ledger. It points at section 3.2,
  Appendix A, Appendix B, and the independent reproduction in `review-grok-hold.md`. It states
  that the raw console outputs are session-local and not committed.

## What did not change

- No protected path changed. `src/`, `catalog/manifest.json`, `eval/gates.json`, both frozen
  contracts, the holdout, the routing cases, the overlay, the runners, `eval/self-test.mjs`,
  `inventory/`, and every attempt-one and attempt-two file are byte-identical.
- The frozen acceptance table is unchanged.
- The token reachability tables in section 3.2 and Appendix B are unchanged in content.
- The vendor short-token prefix observation stays monitor-only.
- No `improvements/` finding applies.

## Requested next gate (first delta)

One bounded delta review of the repaired sections. The sections are:

- the decision (1, 1.1, 1.2);
- the evidence corrections (3.1, 3.2, 3.3, 3.5);
- the mechanism (5);
- the cache identity and calibrations (6, 7);
- the acceptance table and schema (8, 9);
- the cache-only proof (10);
- the files and tests (11, 12);
- the stop states and predictions (14, 15);
- the triggers (16).

Verdict file: `review-grok-hold-delta.md`. No implementation, run, fetch, or closeout is
authorized before it passes.

---

# Second reconciliation — after `review-grok-hold-delta.md`

Date: 2026-09-01
Author: Claude Fable 5 high
Review reconciled: `review-grok-hold-delta.md` (Grok 4.6 high, verdict `BLOCK` on D1; D2–D6
residual)
Repaired file: `brief-fable.md`
Status: repair only. No model was fetched or loaded. No network call ran. No paid call ran. The
retained score cache was not opened. No path outside this round changed. No formula, union,
cache pin, or acceptance value changed.

The delta review found B1–B3 and R1–R4 repaired in substance. It blocked on one test sentence
and listed five one-line pins. This section repairs D1 to D6 only.

## D1 — Test 12 contradicted the cache-only import proof

Accepted. The old Test 12 followed every relative specifier under `eval/`. That walk reaches
`run-rerank-fit.mjs`. That file calls `import("./rerank-scorer.mjs")` and
`require("onnxruntime-node/package.json")` inside `main()`. A faithful walk would then fail on a
correct referee.

Repair in `brief-fable.md`, section 12, test 12. The test now walks top-level static `import`
declarations only. It follows each relative specifier that appears in such a declaration under
`eval/`. It does not follow `import()` calls. It does not follow `require()` calls. It does not
enter `main()`. The forbidden set is unchanged: `rerank-scorer.mjs`, `embedder.mjs`,
`fetch-rerank-model.mjs`, `preflight-rerank-model.mjs`, `preflight-clause-model.mjs`, and any
top-level static specifier that starts with `@huggingface` or `onnxruntime`.

Section 10, item 1, now states the same rule. It names the two dynamic calls inside `main()` and
states that `main()` runs only when `process.argv[1]` is that module.

## D2 — A local `shouldFail`

Accepted. The attempt-two export looks for `readings[].role === "grid"`. This experiment has no
grid reading. Importing that export would fail a true `PASS`.

Repair. Section 11 now lists a local `shouldFail` among the referee functions. It inspects the
support-fit reading only. It returns `true` unless that reading passes the full section 8
table. `PARTIAL` returns `true`. Section 10 states that the referee does not import `shouldFail`
from `run-rerank-fit.mjs`. Test 18 now names the local function and asserts that the referee
does not re-export the attempt-two one.

## D3 — The dynamic import of `src/catalog/search.ts`

Accepted. `buildCandidateUnion` needs `searchCatalog` and `loadManifest`.

Repair. Section 10, item 1, names the one dynamic import of `src/catalog/search.ts`, as attempt
two did. It states that the file is the lexical scorer and loads no model. Test 12 stays under
`eval/` and does not treat that import as forbidden.

## D4 — `rerank-retrieval.mjs` unpinned

Accepted.

Repair. Section 2 now pins `eval/vectorize/rerank-retrieval.mjs` at SHA-256
`26aa40f9d98f52684cc96c6f4bf28295c9d22a48a82d4e8ea285801522160116`. The author recomputed the
hash with `shasum -a 256` on this `HEAD`. It equals the review's value.

## D5 — `result.experiment` must be the literal string

Accepted.

Repair. Section 9 now states that `experiment` is the literal string `clause-support-fit-v1`.
The referee never writes the imported `EXPERIMENT` constant there. That constant is
`cross-encoder-fit-v1` and belongs to the cache.

## D6 — Noisy-OR is not a calibrated probability

Accepted. The cached values are sigmoid outputs of raw logits.

Repair. Section 5.3 now calls `pos` a support-growing transform under an independence
assumption. It states that `pos` is not a calibrated probability. The formula is unchanged.

## What did not change in this pass

- The score function, the negative rule, the ordering, and the tie rule.
- The candidate union and the pair index rule.
- The cache pins: file hash `fa1252fc…`, `scoresSha256` `44c27468…`, record hash `ecea4c69…`.
- The acceptance table, the outcome labels, and the two calibrations.
- Every protected path.

## Requested next gate (second delta)

One bounded delta review of the repaired test and import lines only: section 2 (one hash),
section 5.3 (one paragraph), section 9 (`experiment`), section 10 (item 1), section 11 (the
referee function list), and section 12 (tests 12 and 18). Verdict file:
`review-grok-hold-delta-2.md`. No implementation, run, fetch, or closeout is authorized before
it passes.
