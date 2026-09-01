# Bounded delta review — D1 to D6 repair

Date: 2026-09-01
Reviewer: Grok 4.6 high
Source review: `review-grok-hold-delta.md` (verdict `BLOCK` on D1; D2–D6 residual)
Reconciliation: `brief-reconciliation-fable.md`, second section
Repaired file: `brief-fable.md`
Scope: D1 to D6 only. Formula, union, cache pins, acceptance values, and protected paths were
not reopened except where a repair named them.
Status: complete. No model was fetched. No model ran. No paid call ran. No network call ran.
The retained score cache was not read. This reviewer wrote only this file.

This delta authorizes the section 11 implementation only. It does not authorize a cache open, a
referee, or closeout.

## Verdict

**PASS**

D1 through D6 are repaired. Test 12 now walks top-level static `import` declarations only.
The local `shouldFail` inspects the support-fit reading. Section 10 names the dynamic
`src/catalog/search.ts` import. Section 2 pins `rerank-retrieval.mjs`. The result `experiment`
field is the literal `clause-support-fit-v1`. Section 5.3 no longer calls noisy-OR a
probability.

No formula, union, cache pin, acceptance value, or protected path changed.

## Evidence this review checked

All checks were free, offline, and read-only. The cache was not opened.

| Check | Result |
| --- | --- |
| `HEAD` | `7c2c2857df1ed3696ec863eef3d2da80332c609c` (equal to `main`) |
| Dirty paths | untracked round ledger and round directory only |
| `git diff --stat 1bfb983 HEAD` over protected paths | empty |
| `eval/vectorize/rerank-retrieval.mjs` SHA-256 | `26aa40f9d98f52684cc96c6f4bf28295c9d22a48a82d4e8ea285801522160116` |
| `run-rerank-fit.mjs` / `rerank-config.mjs` | equal the prior pins |
| `src/catalog/search.ts` SHA-256 | `04a9aa3d87451fc263aa4ee3df9b31ab8f05c0fcbe8371af5f31c7ed6458f846` |
| Score function in section 5.3 | unchanged: `pos = 1 - Π (1 - s)`, `neg` the same or 0, `fit = pos - max(0, neg - pos)`, log-space `1 - exp(Σ log1p(-s))` |
| Cache pins in section 2 | `fa1252fc…`, `44c27468…`, `ecea4c69…` unchanged |
| Section 8 table | 8/8 and 0/4; 11/11 and 0/9; legacy ±3 of 208/279/311; skills floor 16; holdout 10/22/25 with at most 11 forbidden; extended 90/109/117 and accept-either 122/122 |
| Leftover "follows every relative specifier" | none |
| Leftover "probability that at least one clause is relevant" | none |
| Retained cache | not read |
| Network / npm / model | none |

## Original issue status

| Issue | Status | Evidence |
| --- | --- | --- |
| D1 | repaired | Section 12, test 12 walks top-level static `import` declarations only. It starts at `eval/vectorize/run-support-fit.mjs`. It follows relative specifiers in those declarations under `eval/`. It does not follow `import()` or `require()`. It does not enter `main()`. The forbidden set is unchanged. Section 10, item 1, states the same rule and names the two dynamic calls inside `run-rerank-fit.mjs` `main()`. |
| D2 | repaired | Section 11 lists a local `shouldFail`. It inspects the support-fit reading only. It returns `true` unless that reading passes the section 8 table. `PARTIAL` returns `true`. Section 10 forbids importing `shouldFail` from `run-rerank-fit.mjs`. Test 18 names the local function and asserts that the referee module does not re-export the attempt-two export. |
| D3 | repaired | Section 10, item 1, names one dynamic import of `src/catalog/search.ts` for `loadManifest` and `searchCatalog`. It states that the file is the lexical scorer and loads no model. Test 12 stays under `eval/` and does not treat that import as forbidden. |
| D4 | repaired | Section 2 pins `eval/vectorize/rerank-retrieval.mjs` at `26aa40f9d98f52684cc96c6f4bf28295c9d22a48a82d4e8ea285801522160116`. Live `shasum -a 256` on this `HEAD` equals that value. |
| D5 | repaired | Section 9 says `experiment` is the literal string `clause-support-fit-v1`. The referee never writes the imported `EXPERIMENT` constant there. That constant is `cross-encoder-fit-v1` and belongs to the cache. |
| D6 | repaired | Section 5.3 calls `pos` a support-growing transform under an independence assumption. It states that `pos` is not a calibrated probability, because the cached values are sigmoid outputs of raw logits. The three displayed formulas are unchanged. |

## Unchanged contract

These values match `review-grok-hold-delta.md` and need no further repair:

- Union: `buildCandidateUnion` from `rerank-retrieval.mjs`, `P5` then ungated remainder.
- Ordering: stable descending sort; `m = 0` equivalence; ties keep base order.
- Cache identity: three hashes, 563 queries, 383,273 scores, experiment `cross-encoder-fit-v1`.
- Calibrations and one-referee rule.
- Acceptance labels `PASS`, `PARTIAL`, and `FAIL`.

## Next gate

Codex GPT-5.6 Sol high may write the section 11 files.
It runs the section 13 implementation gates.
It loads no model and opens no cache.

The referee still waits for `review-grok-implementation.md` and the recorded implementation commit.
