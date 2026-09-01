# Independent review — protocol-history attempt-three hold brief

Date: 2026-09-01
Reviewer: Grok 4.6 high
Author: Claude Fable 5 high (`brief-fable.md`)
Evidence lane: Codex GPT-5.6 Terra high (`evidence-terra.md`)
Orchestrator: the root agent that opened this worktree
Reviewed files: `brief-fable.md`, the round ledger, `evidence-terra.md`
Status: complete. Started from the queue, the eval rules, and the two prior ledgers.
Did not read an author transcript. Did not read a retained score cache.
No model was fetched. No model ran. No paid call ran. No network call ran.
This reviewer wrote only this file.

This review does not authorize closeout. It does not authorize a fetch, a run, or a production edit.

## Verdict

**BLOCK**

Do not record this hold in `.agents/TODO.md` or `.agents/NEXT.md` from this brief.

The two zero-overlap counts reproduce on the pinned local inputs.
No protected path changed after attempt-two revision `1bfb983`.
The hold contract still encodes three false claims.
Those claims would close the last attempt against a distinct cache-only mechanism.

Repair the blocking findings. Then run one bounded delta review.

## Evidence this review checked

All checks were free, offline, and read-only. No dependency was installed.

| Check | Result |
| --- | --- |
| `HEAD` | `7c2c2857df1ed3696ec863eef3d2da80332c609c` (equal to `main`) |
| Dirty paths | untracked round ledger and round directory only |
| `git diff --stat 1bfb983 7c2c285` over the protected paths | empty |
| Commits after `1bfb983` | `957b143` (`#108`), `7c2c285` (`#110`); harness and inventory only |
| Four gated input hashes | equal the `eval/gates.json` pins |
| Remaining section 2 hashes | equal the live files |
| Original content digest | `5b8ee40f89c846c4e69fa91f5a483f9d224dd79628afa7f9ac45b522f9aaa8a8` |
| Blind content digest | `b63cfb605bd98aeba6981535be7bd5ee968e1e8b48ee92a1d55e4d5b07521f53` |
| `x-routing` SHA-256 | `468a9d9834e8cb50cb905f80ccc42f9d3daa7a3d0ff2d8c5194d566812ba716b` |
| `scout.searchResearch` description SHA-256 | `80157277b8d9c834b1b3cc5a6aeab8ec89dea5ed2d449b434d8064cd4c798e43` |
| `routingKeywords` | 176 |
| Searchable entries | 79 |
| Target scored tokens / full tokens | 338 / 1,300 |
| Appendix A SHA-256 | `4d3ccfdb40d9214567e15f6838ce610b3f3e9d173b87eaf4e2d294c5d1f7b3e8` |
| `evidence-terra.md` | 13,653 bytes; SHA-256 `18c92bf50f79559fdb0217fef0c465a01cc5e24d7d88728ab8d8137bd0ca24d7` |
| Retained attempt-two cache | not read |
| Network / npm / model | none |

Independent strict audit of the two named positives. The audit used vendor `tokenize`, `STOPWORDS`, the full catalog view, and the four-character prefix floor.

| Case | `C(q)` | scored | full | catalog-absent | in catalog, not on target |
| --- | ---: | ---: | ---: | --- | --- |
| `phb-whisk-forced-follow-up` | 8 | 0 | **0** | rushed, whisk, eviction, matter | forced, follow, archival, numbers |
| `phb-clawback-origin-emergency-changes` | 7 | 0 | **0** | emergency | give, origin, story, clawback, later, changes |

The 32-question summary matched section 3.2.
Positives: 17/19 with a catalog-absent token, 2/19 with zero full-view matches, 4/19 with no rare target token.
Mean rare was 1.53. Mean common was 3.37.
Controls: 3/13, 0/13, 6/13, mean rare 0.69, mean common 2.62.

Exact-token search of all 79 full views: `whisk` 0, `eviction` 0, `emergency` 0, `stroop` 0. `archival` hits 4 Docs operations. `clawback` hits 3 non-target entries.

## What holds

These parts match the queue and the anti-overfitting rules. They do not need repair.

- The round may record a hold. The ledger allows one distinct mechanism or a justified hold.
- No production file, frozen contract, gate, or generated artifact changed.
- The frozen contracts stay acceptance data. They are not training data.
- `QUERY_TOKEN_ALIASES` still holds only `tx`, `txn`, `txs`, `acct`, and `addr`.
- The brief does not add case vocabulary to any file outside this round directory.
- The vendor short-token prefix observation stays monitor-only.
- No `improvements/` finding applies. The data remains reachable upstream.
- T1 names both inventory and `x-routing` hashes. T2 leaves the bar to the owner. T4 needs two unrelated live misses.
- Cost is `$0`. This lane spent no paid call.

The hold as a product pause can survive. The contract as written cannot.

## Blocking findings

### B1 — Zero lexical overlap does not prove a learned comparator cannot rank the target

Severity: blocking
Claim under attack: 1

Section 3.2 says a comparator cannot weigh absent evidence.
Section 1 then says no comparator over that text can rank the target for the two zero-overlap positives.

That step is false.

The audit measures strict token overlap against `scout.searchResearch`.
It does not measure pair scores, embeddings, or rank order.

The two questions still carry incident and history meaning:

- `phb-whisk-forced-follow-up`: "What forced the rushed follow-up to Whisk, and which archival eviction numbers matter?"
- `phb-clawback-origin-emergency-changes`: "Give the origin story of clawback and any later emergency changes to it."

The target card advertises incident reports, CAPs, SEPs, audits, and `source=release` for protocol upgrade tags.
A learned comparator can score that pair without a shared content token.

The stronger local fact is relative ranking, not impossibility.
`archival` sits on four Docs operations and not on the target.
`clawback` sits on three non-target entries and not on the target.
Those competitors can beat the target on distinctive tokens.
That is a ranking conflict. It is not a proof that every semantic comparator fails.

Attempts one and two missed both cases under every recorded reading.
That is empirical evidence for those two models and those two fit rules.
It is not a proof about the class of learned comparators.

Repair: state the audit as token reachability only.
State the two misses as measured under the two spent models.
Do not write "cannot rank" for a later brief to inherit.

### B2 — Pure-fit readings are not a ceiling on all card-comparison mechanisms

Severity: blocking
Claim under attack: 2

Section 3.1 calls the pure-fit readings the ceiling of the card-comparison class.
The prose then says the strongest comparator reached 3/11 blind positives with no margin.

Both sentences are false as written.

Pure fit is max-clause rerank of the candidate union.
It bounds that formula for Qwen clause vectors and for `bge-reranker-base` pair scores.
It does not bound top-k mean, support count, or dispersion over the same pairs.
Those orderings can change rank when one high clause no longer wins.

The 3/11 figure is also not the strongest measured blind reading.
Attempt-one grids `m = 0.03` and `m = 0.06` reached 4/11 blind positives
(`.agents/rounds/2026-08-31-eval-routing-next/finish-result-sol.md`).
The section 3.1 table already lists that 4/11 row.
The ceiling prose ignores it.

The eight-miss list is also false for every attempt-two reading.
Identity and the hysteresis grids missed these eight blind positives, including
`phb-auditor-auth-recursion-follow-up`.
Attempt-two pure fit rescued that case and instead missed `phb-auth-recursion-auditors`
(attempt-two ledger, 2026-08-31 referee closeout).
The intersection of all attempt-two readings is seven ids, not eight.
The two zero-overlap ids stay in that intersection.
The rescued id shows that a different comparator can move a prior miss.

Repair: call the pure-fit numbers the max-clause readings of the two spent models.
Quote 4/11 as the best measured blind top-five in the box.
Replace the eight-miss claim with the seven-id intersection, and name the rescued case.

### B3 — The hold excludes a distinct cache-only aggregation mechanism

Severity: blocking
Claim under attack: 3

`.agents/NEXT.md` and `.agents/TODO.md` rule out the clause bi-encoder and the pairwise
cross-encoder at a registered hysteresis grid.
The round ledger uses the same limit: do not reuse those two mechanisms with hysteresis.

Terra family 3 is a different mechanism.
It keeps the frozen pair scores.
It changes the aggregation: top-k mean, support count, or dispersion.
Terra states that neither completed attempt tests multi-clause aggregation.
Terra names this family as the cheapest next measurement.

The brief marks that family `Distinct: no` and `Not eligible`.
It says the charter excludes reuse of the pairwise scores.
The charter does not say that.
Reuse of scores without the hysteresis grid is still a distinct mechanism.

The second reason is "aggregation of low pair scores stays low."
This review did not read the retained cache, as required.
Max-clause miss does not prove every aggregate miss.
A competitor can win on one high clause while the target has many medium clauses.
Support count can reverse that order.
The brief asserts the scores are low because tokens do not overlap.
That repeats B1.

T3 then spends attempt three only on a non-card evidence source.
Family 3 reads catalog clause text.
T3 cannot reopen it.
The hold therefore closes the last attempt against the one untested free mechanism that Terra left open.

The brief already allows a later cache-only diagnostic that does not spend the attempt.
That diagnostic path is not enough.
If family 3 can pass the frozen table, it must be allowed to spend attempt three.
If the authors still refuse to spend the attempt, they must call it a predicted fail.

Repair: mark family 3 distinct and eligible under the queue.
Either keep it in scope for attempt three, or give a predicted-fail reason that does not reuse B1.
If it stays a non-spending diagnostic, T3 must still name it so a later lane can run it.

## Residual findings

### R1 — T3 is usable but not pinned tightly enough

Severity: residual
Claim under attack: 4

T3 requires a query-independent sample rule. It also requires a leakage test, flood metrics, and review before any fetch.
A later author can write that brief from the checklist.

Three identities are still loose:

1. "the 76-case QA regression inventory" has no path and no hash.
   On this `HEAD`, 76 owned battery files list `scout.searchResearch` in `surface`.
   One extra battery file mentions the id outside `surface`.
   The derivation lives in `.agents/rounds/2026-08-31-eval-routing-next/routing-analysis-sol.md`.
   T3 does not cite that rule. The count can move when the battery moves.
2. "the 495-case comparison" is not restated.
   The prior referee set is legacy 338 + extended 122 + skills 23 + original 8 positives + 4 controls.
3. "or another evidence source outside the catalog text" has no bound.
   Combined with B3, that phrase is the only remaining spender of attempt three.

T3 also names a "keyless Scout fetch" and does not name the endpoint or byte budget.
Those details belong in the later brief. The trigger should still require them by name.

Repair: pin the 76-case derivation and the 495-row membership.
Name family 3 in the reopen set, or state why it cannot spend the attempt.
Keep the sample rule, leakage test, and pre-fetch review.

### R2 — Hold status and attempt accounting are easy to misread

Severity: residual
Claim under attack: 5

The ledger says attempt three is the last attempt in the box.
The brief and the outcome say attempt three stays unused.
T3 says a later brief spends attempt three.

Those lines can all be true if this round only reserves the slot.
They will not stay true if closeout treats this round as the spent attempt.

The queue still asks for a distinct attempt-three mechanism.
This round added a hold option that the queue did not name.
That is allowed by the ledger charter.
Closeout must then say: this round did not spend attempt three; the slot stays open for a trigger.

Repair: use one sentence in section 5 and in the ledger outcome.
Say the slot is unused and reserved. Do not say the box is spent.

### R3 — The brief and ledger miss ASD-STE100

Severity: residual
Claim under attack: 6

`evidence-terra.md` stays close to the length rule.
The brief and the ledger do not.

A crude sentence split, with fenced code removed, counted the over-length lines.
The brief had 43 sentences over 20 words. The ledger had 25.
Prose examples:

- Brief: "It records why no mechanism in the tested class can pass the frozen acceptance table, and it fixes the exact conditions that reopen the box." (two ideas, 25 words)
- Brief: "Eight blind positives stayed missed under identity and under every attempt-two reading: …" (this sentence is also false; see B2)
- Ledger: "This round authorizes no model fetch, no model run, no network call, no paid call, no production edit, no corpus-label edit, no frozen-contract edit, no gate edit, and no generated-artifact edit." (31 words, many ideas)

Repair in the same pass. Keep one idea in each sentence. Keep each sentence at 20 words or fewer.

### R4 — Two provenance statements do not match the files

Severity: residual
Claim under attack: 6

Appendix A is byte-identical to the claimed strict-script hash.
The first comment in that script is still wrong.
It says the script mirrors the vendor token-match rules.
The vendor matcher also uses raw substring and unrestricted prefix overlap.
The strict matcher does not.

Section 7 says the raw output of both runs is in the ledger.
The ledger says both raw outputs live in the session scratchpad and are not committed.
This review reproduced the strict table from the pinned inputs, so the counts still hold.
A later agent cannot replay the vendor-rule run from the ledger.

Repair: fix the Appendix A comment.
Point section 7 at Appendix B and at the independent review reproduction, not at the ledger.

## Required repair

The author must repair `brief-fable.md` and write `brief-reconciliation-fable.md`.

The repair must:

1. Drop the "cannot rank" claim. Keep the token-reachability table.
2. Drop the class-wide ceiling. Keep the two max-clause tables. Quote 4/11 as the best blind top-five.
3. Correct the eight-miss list. Name `phb-auditor-auth-recursion-follow-up` as rescued by attempt-two pure fit.
4. Mark Terra family 3 distinct and eligible, or give a predicted-fail reason that does not reuse B1. Name it in the reopen set if it will not spend the attempt now.
5. Pin the T3 76-case derivation and the 495-row membership.
6. State that this round does not spend attempt three.

Do not change a protected path. Do not fetch a model. Do not read the retained cache.

Then request one bounded delta review of the repaired sections.

## What this review does not decide

The frozen 19/19 and 0/13 bar may be the wrong product bar.
That is an owner decision under T2.
This review does not change that bar.

A cache-only family-3 diagnostic may still fail.
This review does not run it.

Corpus-derived route vocabulary may still be the only way to place `whisk` on the card.
That class still needs its own reviewed brief before any fetch.
