# Repository-tooling recovery v2 live run: failure analysis and next-block plan

- Author: Claude Fable 5, high effort. Independent of the Sol collector author, the Terra
  implementation lanes, the Grok reviewers, and the `claude-sonnet-5` answering model. I was also
  the v2 annotation reviewer (`repo_recovery_v2_live_fable`). This document does not change any
  annotation.
- Date: 2026-08-31
- Mode: analysis only. No repository file changed. No paid call ran. No deploy, push, or merge ran.
- Free reads used: the v2 reviewed artifact, the v1 fourth reviewed artifact, the three earlier v1
  reviewed artifacts, `eval/repo-recovery/cases.json`, `contract.mjs`, `grade-results.mjs`,
  `collect.mjs`, the round ledger and its directory, ADR-0010, `sls-080`, `.agents/TODO.md` block
  4, `src/mcp/tools.ts`, `src/policy/recovery-receipt.ts`, `scripts/catalog-data/retrieval-profiles.mjs`,
  and three pinned GitHub source files (`stellar-cli` `locator.rs` and `utils.rs` at `0cc28fcb`;
  `stellar-horizon` `internal/ingest/main.go` at `2abda012`).

## 1. Verdict summary

The v2 run is valid, complete, and honestly reviewed. The gate reads 9 of 12 positives, with 10
required. It fails by one row.

The recovery mechanism worked in every row where it ran. Twelve of twelve `scout.explainRepo`
calls were single, pinned to the frozen repository, in a later execute, and receipt-authorized.
Zero projection errors. Zero premature detours. Twenty of twenty answers grounded.

The three failed positives have three different causes:

| Row | Cause class | Binding check |
| --- | --- | --- |
| `rr-pos-go-sdk-query-enums` | model operation selection | `sequencePass` |
| `rr-pos-cli-config-home-env` | model synthesis after a partial upstream answer | `answerPass` |
| `rr-pos-horizon-max-supported-protocol` | stale upstream DeepWiki answer (`sls-080`) | `answerPass` |

Two of the three rows are structural. They fail in every stored run for reasons the product
cannot fix. The threshold tolerates exactly two misses. So the gate now requires zero misses on
the other ten rows. Operation-selection variance alone produced one to three misses per run with an
identical product surface. A rerun therefore has a low chance to pass and cannot fix the two
structural rows.

Decision: no product change, no measurement change, and no rerun now. The smallest evidence-backed
action is a record-only close of this block plus one free upstream-freshness probe as the
pre-registered trigger for the next authorized collection. Section 9 gives the ordered plan and
the stop conditions.

## 2. Run identity

| Item | v2 (fifth collection) | v1 fourth collection |
| --- | --- | --- |
| Contract | `repository-tooling-recovery-v2` | `repository-tooling-recovery-v1` |
| Server and runner revision | `8195f2c6020ccd3352e6760e85bbaf5e50ffc0f2` | `497181ca5b774e7639f663f9ee22d61facb749f1` |
| Live surface SHA-256 | `8a2232842f10d28f985881c93dbc1760e1aa15365be3f7162cf682e2e219769b` | same |
| Answering model and binary | `claude-sonnet-5`; Claude Code 2.1.251, SHA-256 `625869b0…8969e5` | same |
| Prompt identity | `qa-agent-prompt-v1` SHA-256 `3f29c317…6ecfc5d6`, 1247 chars | same |
| Collection start | `2026-08-31T00:44:40.313Z` | `2026-08-30T23:43:05.685Z` |
| Cost, calls, retries | `$4.5646914`; 20 of 40; 0 retries; 0 missing costs | `$4.263449`; 20; 0; 0 |
| Reviewer | `repo_recovery_v2_live_fable`, `claude-fable-5`, high, independent; `reviewedAt 2026-08-31T01:02:36Z` | `repo_recovery_live_fable`, same model and effort; `2026-08-30T23:58:17Z` |
| Gate | 9/12 positives; 0/8 detours; 0 projection errors; identity PASS; review PASS; `pass: false` | 3/12 v1; 7/12 v2 diagnostic; 0/8; 0 |
| Answers | 18/20 correct; 20/20 grounded | 15/20 correct; 17/20 grounded |

The only difference between the two collections in `src/`, catalog, or ranking is none. Commits
`d451ca4` through `8195f2c` touched measurement, tests, docs, and ledger files only. The surface
hash is byte-identical. Every behavioral difference between the two runs is therefore model
variance or upstream variance, not product change.

The grader reproduces the v2 result deterministically:

```sh
node eval/repo-recovery/grade-results.mjs \
  eval/repo-recovery/results/repository-tooling-recovery-v2-reviewed.json --gate
# positivePasses 9, prematureDetours 0, operationProjectionErrors 0, pass false, exit 1
```

## 3. Positive partition for the v2 run

"Recovery" means the frozen Docs operation ran, its blind label was `empty` or `adjacent`, and one
pinned `scout.explainRepo` followed in a later execute.

| Case | Required op ran | Label | Recovery | Answer | v2 | Blocker |
| --- | --- | --- | --- | --- | --- | --- |
| `rr-pos-go-sdk-trade-resolutions` | exec 4 | adjacent | exec 5, exact pin | correct, grounded | PASS | — |
| `rr-pos-go-sdk-query-enums` | never | other | exec 5, exact pin, receipt from `search_rpc_horizon_data_docs` | correct, grounded | FAIL | operation selection |
| `rr-pos-js-rpc-sleep-strategies` | exec 4 | adjacent | exec 5 | correct, grounded | PASS | — |
| `rr-pos-go-sdk-default-horizon-clients` | exec 4 | adjacent | exec 5 | correct, grounded | PASS | — |
| `rr-pos-env-host-depth-limit` | exec 4 | empty | exec 5 | correct, grounded | PASS | — |
| `rr-pos-js-rpc-durability-values` | exec 4 | adjacent | exec 6 | correct, grounded | PASS | — |
| `rr-pos-cli-config-home-env` | exec 3 | adjacent | exec 11 | wrong, grounded | FAIL | answer |
| `rr-pos-cli-stellar-soroban-dir-precedence` | exec 5 | adjacent | exec 9 | correct, grounded | PASS | — |
| `rr-pos-js-rpc-insecure-http-guard` | exec 5 | adjacent | exec 6 | correct, grounded | PASS | — |
| `rr-pos-go-sdk-timebound-factories` | exec 4 | adjacent | exec 5 | correct, grounded | PASS | — |
| `rr-pos-horizon-max-supported-protocol` | exec 6 | adjacent | exec 7 | wrong (25; source 28), grounded | FAIL | upstream freshness |
| `rr-pos-go-sdk-horizon-timeout` | exec 3 | adjacent | exec 4 | correct, grounded | PASS | — |

Trace-audit counts for the v2 run: hard-invalid target calls 0; misplaced receipts 0; repeated
recovery calls 0; wrong or absent pins 0; required-operation omissions 1; ignored receipt cards 0;
positives with exactly one pinned later-execute recovery 12 of 12. The eight negatives made zero
`scout.explainRepo` calls.

## 4. The three failed rows, separated by cause

Each row is split into five questions: sequence selection, answer correctness, upstream evidence
quality, grader design, and stochastic variance.

### 4.1 `rr-pos-go-sdk-query-enums`

**Sequence selection.** The model's first `search` (`service: stellarDocs`) ranked
`stellarDocs.search_sdk_cli_tools_docs` at rank 1 (backfill, score 158). The model then wrote one
execute with `search_docs` twice, `search_rpc_horizon_data_docs`, and two `scout.searchResearch`
calls. It never called the rank-1 thematic operation. `search_rpc_horizon_data_docs` returned
`soft-empty`, which is a qualifying source in the manifest, so the host issued a receipt. The model
used that receipt correctly in execute 5 with `repo: "stellar/go-stellar-sdk"`. This is a pure
operation-selection miss. The rank was right. The receipt path was right. The model skipped the
operation the contract requires.

**Answer correctness.** Correct and grounded. All five identifier-to-string pairs match the golden.

**Upstream evidence quality.** Good. The DeepWiki answer matched pinned `main.go#L54-L64`.

**Grader design.** This row exposes a real divergence between the contract and the product. The
product accepts any of three thematic Docs operations as a receipt source
(`qualifyingSourcesForRecoveryTarget` over the `source-code` edges on
`search_rpc_horizon_data_docs`, `search_sdk_cli_tools_docs`, and `search_soroban_contract_docs`).
The contract pins one per case (`initialEvidence.id`). The product's mechanism completed end to end
here and produced a correct grounded answer. The contract still fails the row because the receipt
came from the RPC operation, not the SDK operation. A rule of "any qualifying thematic source" would
flip this row and the gate to 10 of 12. I reject applying that rule to this run. It was not
pre-registered, it would flip FAIL to PASS after the score was seen, and the per-case pin is the
only check that tests whether the model routes an SDK question to the SDK operation. Section 7
records it as a v3 candidate that can only be decided before a fresh collection.

**Stochastic variance.** Across five runs this case never ran the required operation first with
a valid later recovery: runs 1–2 called `scout.explainRepo` directly on archived `stellar/go`;
run 3 ran the required op but then made two malformed recovery calls; run 4 never ran it; v2 never
ran it. It is the most persistent selection miss in the suite.

### 4.2 `rr-pos-cli-config-home-env`

**Sequence selection.** Exact. The required operation ran first (execute 3, adjacent), and one
pinned `scout.explainRepo` ran in execute 11. Eight executes sit between them because the model kept
re-reading the CLI manual page.

**Answer correctness.** Wrong. The headline says `XDG_CONFIG_HOME` is the variable. It demotes
`STELLAR_CONFIG_HOME` to an "unverified/lower-confidence detail pending confirmation against current
source". It never states the `<cwd>/.stellar` fallback. The golden requires `STELLAR_CONFIG_HOME`
priority and forbids presenting `XDG_CONFIG_HOME` as the only override. I verified the golden
against the pinned source today: `locator.rs` L937–L949 checks `STELLAR_CONFIG_HOME` first, then
`XDG_CONFIG_HOME`, then `~/.config`; `locator.rs` L187 is
`find_config_dir(pwd.clone()).unwrap_or_else(|_| pwd.join(".stellar"))`; `utils.rs` L127–L152 walks
ancestors and returns an error only from the inner helper. The golden stands.

**Upstream evidence quality.** Partial, and different in each run. The v2 DeepWiki answer stated
the `STELLAR_CONFIG_HOME` → `XDG_CONFIG_HOME` → `~/.config/stellar` order correctly and described the
ancestor walk correctly. It omitted the `<cwd>/.stellar` fallback. The run-4 DeepWiki answer stated
the same order and walk, and then said "If no such directory is found, an error is returned." That
sentence is true of `find_config_dir` and false of `local_config`, which is the caller the question
targets. So DeepWiki has under-reported the fallback in both runs, once by omission and once by a
misleading statement. This is a candidate Scout finding, weaker than `sls-080`.

**Model synthesis.** The decisive v2 failure is not upstream. The repository evidence in the
transcript already carried the correct priority. The model chose the Docs page over the repository
answer when the two conflicted, and labelled the repository fact unverified. The prompt's authority
rule tells the model when to use the repository lane. It does not say how to weigh a conflict
between the Docs page and the repository answer. The model resolved that conflict toward Docs.

**Grader design.** The row is graded as one boolean. The v2 answer has two of three key facts
partially right and misses the priority fact and the fallback fact. The boolean is correct as a
promotion gate. It does not distinguish "DeepWiki omitted the fallback" from "the model overrode a
correct repository fact". That distinction only matters for attribution, and this document records
it.

**Stochastic variance.** Wrong in all five runs, for three different reasons: runs 1–3 never ran
`scout.explainRepo` and answered from Docs only; run 4 recovered and reported the priority correctly
but stated the error instead of the fallback; v2 recovered and then demoted the correct priority.
The case is structurally hard because the official CLI manual actively contradicts the source
(it documents only `XDG_CONFIG_HOME`), and the answering model treats Docs as senior.

### 4.3 `rr-pos-horizon-max-supported-protocol`

**Sequence selection.** Exact. The model started with research and semantic calls (execute 4),
then ran `search_docs` (soft-empty) and the required `search_rpc_horizon_data_docs` (adjacent) in
execute 6, then one pinned `scout.explainRepo` in execute 7. The contract permits extra operations
before the required one, so `sequencePass` is true.

**Answer correctness.** Wrong. The answer says 25. Pinned `internal/ingest/main.go` at `2abda012`
reads `MaxSupportedProtocolVersion uint32 = 28` (verified today). The answer also omits the file
path. It includes an as-of date and does not conflate the constant with the live network version,
so the avoid clauses hold.

**Upstream evidence quality.** This is the whole failure. The DeepWiki answer for
`stellar/stellar-horizon` returned 25 with `scannedRef 82660510`, a ref that also contains 28. The
finding `sls-080` (status `verified`) already records this with the run-4 evidence. The v2 row is a
second independent recurrence at `generatedAt 2026-08-31T00:52:03.666Z`. The model copied the
value faithfully and cited the source, so the answer is grounded.

**Grader design.** The golden pins a value with `asOf: 2026-08-30` and `reverifyBy: 2026-09-30`.
The row therefore measures whether the recovery source is current, not only whether the mechanism
runs. That is by design: evals exist to produce upstream findings. The consequence for the gate is
that this row cannot pass until DeepWiki re-indexes the repository, whatever the product does.

**Stochastic variance.** None in the failure. Five of five runs returned a wrong value: 22, 22, 22
(from archived `stellar/go`), then 25, 25 (from `stellar/stellar-horizon`). The value moved only
when the repository pin moved. This row is deterministic until upstream changes.

## 5. Comparison with the v1 fourth run

Same 20 cases, same order, same model, same binary, same prompt, same surface hash, same reviewer
identity and effort. Only the measurement contract and the ledger changed between the runs.

| Case | Run 4, v1 grade | Run 4, v2 diagnostic | v2 live |
| --- | --- | --- | --- |
| `trade-resolutions` | FAIL (label) | PASS | PASS |
| `query-enums` | FAIL (selection) | FAIL (selection) | FAIL (selection) |
| `sleep-strategies` | PASS | PASS | PASS |
| `default-horizon-clients` | PASS | PASS | PASS |
| `env-host-depth-limit` | FAIL (label) | PASS | PASS |
| `durability-values` | FAIL (selection, ungrounded) | FAIL | PASS |
| `config-home-env` | FAIL (answer) | FAIL (answer) | FAIL (answer) |
| `dir-precedence` | FAIL (label) | PASS | PASS |
| `insecure-http-guard` | FAIL (selection, abstained) | FAIL | PASS |
| `timebound-factories` | PASS | PASS | PASS |
| `horizon-max-supported-protocol` | FAIL (label + stale) | FAIL (stale) | FAIL (stale) |
| `horizon-timeout` | FAIL (label) | PASS | PASS |
| **Total** | **3/12** | **7/12** | **9/12** |

What changed and why:

- Four rows moved from FAIL to PASS because v2 removed the unstable per-case label equality. This is
  the ADR-0010 repair working as designed. The v2 labels for those rows (`adjacent`, `empty`,
  `adjacent`, `adjacent`) again differ from the retired frozen labels in three of four rows, which
  confirms the v1 defect diagnosis.
- Two rows (`durability-values`, `insecure-http-guard`) moved from selection miss to PASS with zero
  product change. In run 4 the model skipped the rank-2 thematic op and answered wrong or abstained.
  In v2 it included the thematic op in a parallel Docs bundle and recovered. This is model variance.
- Three rows did not move. `query-enums` missed selection in both runs. `config-home-env` was wrong
  in both runs for different reasons. `horizon-max-supported-protocol` was stale in both runs.
- `scout.explainRepo` adoption rose from 9 of 12 rows to 12 of 12 rows. Every call in both runs
  was well-formed. The contract-card repair (`4e2bb6b`) holds.
- Answer quality rose from 15/20 correct and 17/20 grounded to 18/20 and 20/20.
- Cost was flat: `$4.26` and `$4.56`.

The v2 run is the best result in the series and the first with a majority of positives passing.
It is still one row short, and the shortfall is not attributable to anything the product controls.

## 6. Stochastic variance

The operation-selection class is the only class that moved between the two runs with an identical
product. Counts per run for positives that never ran the required thematic operation:

| Run | Revision | Selection misses | Which |
| --- | --- | ---: | --- |
| 2 (replacement) | `892d899` | 6 | six positives ran no Docs op |
| 3 | `d23766d` | 0 (but 9 malformed recoveries) | — |
| 4 | `497181c` | 3 | `query-enums`, `durability-values`, `insecure-http-guard` |
| 5 (v2) | `8195f2c` | 1 | `query-enums` |

In every selection miss the required operation was visible at rank 1 or 2 in the model's own
`search` result. Ranking is not the cause. The model's execution plan is.

Margin arithmetic for a rerun with the current product and current upstream:

- Two rows are structurally failing (`config-home-env` in 5 of 5 runs; `horizon-max-supported-protocol`
  in 5 of 5 runs). They consume the entire two-miss tolerance.
- The gate then needs all ten other rows to pass. The three selection-prone rows passed together in
  zero of the last two runs. `query-enums` missed in both. Even if each of the three rows missed
  independently with probability 0.5, the chance of zero selection misses is 0.125, before any new
  answer miss elsewhere.
- Observed cost of one more measurement: about `$4.50` for collection plus a `$20.00`-class
  independent review session.

A rerun is therefore a low-probability attempt at the gate and cannot change the two structural
rows. It is not justified as a promotion attempt. It could only be justified as a variance
measurement, and that question does not need answering to make the next decision.

## 7. Grader design findings

Two findings. Neither should be applied to the stored v2 result.

**G1. Per-case operation pin versus product qualifying sources.** The contract requires the one
frozen thematic operation per case. The product issues a receipt from any of the three thematic
operations. `query-enums` completed the product mechanism through a different qualifying source and
answered correctly, and still failed. A pre-registered v3 rule could accept any qualifying
`source-code` edge source as the initial authority while keeping the `empty | adjacent` label,
single later-execute call, exact pin, and answer checks. This would test the mechanism as built.
It would also stop testing whether the model routes an SDK question to the SDK corpus. That is a
measurement-scope decision for the owner. If adopted, it must be decided and recorded before the
next collection, with new digests and a new ADR, and it must never be applied to a stored run.
Regrading this run under G1 would read 10 of 12; quoting that number as a result would be laundering.

**G2. Upstream staleness consumes promotion margin.** The horizon row measures DeepWiki freshness.
While `sls-080` is open, the suite has one guaranteed miss and a tolerance of two. The grader should
not change. The plan should account for the margin honestly and tie the next collection to a
freshness trigger.

## 8. Decisions

| Option | Decision | Evidence |
| --- | --- | --- |
| Product change: authority bundle, `search_docs` source-code edge, ranking, or prompt prose | **No** | Ranking trigger requires three recurring selection misses; v2 has one. 12/12 recovery calls were well-formed. The thematic op ranked first or second in the miss. TODO block 4 reopen rule is not met. |
| Product change: Docs-versus-repository conflict rule in the prompt | **No** | One row of evidence (`config-home-env`). Prompt prose already carries the authority rule; more words are clutter without an A/B. Record as monitor-only. |
| Measurement change to the v2 contract | **No** | Any rule change now would be post-hoc. G1 is recorded as a v3 candidate for pre-registration only. |
| Golden edit | **No** | Both failing goldens were re-verified today against pinned source: `STELLAR_CONFIG_HOME` first, `<cwd>/.stellar` fallback, `MaxSupportedProtocolVersion = 28`. |
| Reviewer guidance change | **No** | All 20 annotations reconcile with stored evidence. No leakage. |
| One controlled rerun now | **No** | Two structural misses consume the tolerance; selection variance gives a low pass probability; the ledger stop rule forbids repeating an honest gate failure without a new reason. |
| Merge `next/repo-tooling-recovery` to `main` | **No** | The pre-registered ship condition is the live gate. It is unmet. |
| Record-only close of the v2 block | **Yes** | Free, required by the ledger rules, and the v2 result is the current best evidence. |
| Free upstream-freshness probe as the rerun trigger | **Yes** | The one deterministic miss is upstream. A zero-cost `scout.explainRepo` probe through Raven can detect when DeepWiki returns 28. |
| Second Scout finding (stellar-cli fallback) | **Yes, as a candidate** | Two runs show under-reported `local_config` fallback. It needs a fresh free probe before `verified`. |

## 9. Ordered plan

Every step is free unless marked paid. Steps 1–4 need no owner authorization beyond the existing
record-only permission pattern used in this round. Steps 5–7 need explicit authorization.

1. **Record the v2 run in the ledger** (`.agents/rounds/2026-08-30-repository-tooling-recovery.md`).
   Append a "Fifth collection, v2 (2026-08-31)" section. Record the identities from section 2, the
   file SHA-256 of the four v2 artifacts (`-collection`, `-review-packet`, `-annotations`,
   `-reviewed`), the 9/12, 0/8, 0, 18/20, 20/20 aggregates, the section 3 partition, and the
   section 5 comparison. Label the G1 10-of-12 figure as a rejected post-hoc regrade, or omit it.
   Rename the four stable v2 files with a qualifier such as
   `repository-tooling-recovery-v2-fifth-upstream-stale-failed-*` so the stable names are free.
   Do not rewrite earlier sections.
2. **Update `sls-080`** with the v2 recurrence: collection SHA-256
   `da4a4e245b05c737023d6e858e8b8866b00375649b0a90b2be0a1b68da6424da`, row
   `rr-pos-horizon-max-supported-protocol`, execute call 7, `generatedAt 2026-08-31T00:52:03.666Z`,
   value 25, `scannedRef 82660510`. Prevalence: 1 of 12 successful repository answers in v2 carried a
   stale numeric value; the other 11 matched pinned source. Regenerate `improvements/INDEX.md`.
   Owner decides whether to file upstream now; the finding is already `verified`.
3. **Open a candidate Scout finding for `stellar/stellar-cli`** through the improvements pipeline:
   DeepWiki under-reports the `local_config` fallback (`locator.rs` L187,
   `unwrap_or_else(|_| pwd.join(".stellar"))`). Evidence: run-4 answer states an error is returned;
   v2 answer omits the fallback. Status stays `candidate` until one fresh free `scout.explainRepo`
   probe reproduces the omission. That probe is a free service call, not a paid answering call.
4. **Update `.agents/TODO.md` block 4** (owner authorization, as before): record that the v2
   collection evaluated the ranking trigger and did not meet it (one selection miss); keep the
   monitor-only reopen rule; add the Docs-versus-repository conflict pattern as monitor-only with
   the same three-recurrence trigger; record G1 as a v3 candidate that requires pre-registration,
   new digests, and an ADR before any collection. Point `.agents/NEXT.md` block 4 at this document.
5. **Set the rerun trigger** (owner decision, recorded in the ledger): run one zero-cost readiness
   style probe of `scout.explainRepo` for `stellar/stellar-horizon` with the frozen question
   through the local Raven surface, on demand or weekly beside the telemetry band check. The
   trigger fires when the answer states 28. Do not run a paid collection before the trigger fires.
   Rationale: it removes the one deterministic miss and restores a one-miss margin.
6. **One authorized v2 collection after the trigger fires** (paid; `$30.00` cap; 40-call max; fresh
   pins for revision, `surfaceSha256`, binary, implementation hash; README procedure). Same
   `claude-sonnet-5` answering model. Then one independent high-effort annotation review by a
   reviewer that differs from the answering model, collector author, orchestrator, and v2
   implementer. Record the same trace-audit counts as section 3.
7. **Merge only on a v2 PASS** (positives ≥ 10, detours 0, projection errors 0, review integrity
   PASS) with every review finding reconciled.

## 10. Stop conditions

Stop and return the decision to the owner when any of these holds:

- The next authorized collection fails with **at least three selection misses**. That is the
  pre-registered ranking trigger. The decision is then whether the lane measures operation selection
  or recovery, and whether to open the `stellarDocs.search_docs` source-code edge as its own measured
  A/B with the production detour band read first.
- The next authorized collection fails with **two or more answer misses after successful recovery**.
  The decision is then whether upstream answer quality, not the product, is the blocker, and whether
  the suite should carry fewer facts that depend on DeepWiki freshness in a v3 contract.
- The next authorized collection fails **only on the two structural rows** and every other row
  passes. The decision is then whether to adopt G1 or another pre-registered v3 rule, with a new
  ADR and digests, before any further collection.
- The horizon freshness trigger has **not fired by 2026-09-30**, the golden's `reverifyBy` date.
  Re-verify the golden against source and live Horizon, then decide whether to wait, file upstream,
  or re-freeze.
- Any weekly telemetry band leaves its pre-registered range (zero-hit 0–5%, all-backfill 10–40%,
  `scout.explainRepo` share 0–5%). That is a product signal that overrides this plan.
- Any identity pin (revision, surface, binary, prompt, implementation hash) changes before the next
  collection. Re-pin and re-verify before spending.

Do not repeat a paid collection as a retry of the same conditions. Do not apply any rule to a
stored artifact to change its verdict. Do not edit a golden, question, repository, required
operation, case order, or case count in v2.
