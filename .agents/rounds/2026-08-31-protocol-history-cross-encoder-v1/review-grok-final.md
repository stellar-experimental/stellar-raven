# Final independent adversarial review — `next/protocol-history-cross-encoder`

Date: 2026-08-31
Reviewer: Grok 4.6 high
Author of the closeout: the root Codex agent
Fixed point: `957b143893842d875050f42581faf514a945c41f`
Current `HEAD`: `2763fb0afd4e6811f449cb6b1f56f2baf85e3734`
Branch: `next/protocol-history-cross-encoder`
Mode: audit only. Did not load the model. Did not run preflight or the referee.
This reviewer wrote only this file.

## Verdict

**BLOCK**

The measured result is a verified `FAIL`. The harness, hashes, one-referee accounting, tables,
forbidden-file boundary, and `improvements/` silence all hold.

The work queue still tells the next agent to start attempt two. `.agents/TODO.md` still says
attempt two needs a cross-encoder brief. `.agents/NEXT.md` still says to start block 1 with
that brief. Those sentences are false. Repair them, then run a bounded delta of this review.

## Scope

Audit mode against the fixed point. In-scope: every file that differs from `957b143`, including
unstaged closeout edits and the untracked Terra verification file.

Excluded as historical evidence, with path and status checked only:

| Path | Status |
| --- | --- |
| `brief-fable.md` | present; frozen contract |
| `brief-reconciliation-fable.md` | present; reconciles the brief BLOCK |
| `review-grok-brief.md` | present; **BLOCK** |
| `review-grok-brief-delta.md` | present; **PASS** |
| `review-grok-implementation.md` | present; **PASS** |
| `review-grok-pins.md` | present; **PASS** |
| `implementation-sol.md` | present; dated pre-fetch snapshot |
| `result-verification-terra.md` | present; **PASS** |

`implementation-sol.md` still says the small phase-two hashes are `null`. That was true at
implementation time. It is not a live instruction. Do not rewrite it.

## Blocking findings

### H1 — `.agents/TODO.md` still orders attempt two

File: `.agents/TODO.md:64`

The file still says: `Attempt two needs a separate, reviewed pinned cross-encoder brief.`

The next paragraph records that attempt two is spent.

A later agent that reads the first sentence will author another attempt-two brief. That
contradicts the verified `FAIL` closeout.

Repair: delete line 64. Keep the dated attempt-two `FAIL` paragraph. Keep the open `Done when`
clause.

### H2 — `.agents/NEXT.md` still starts the cross-encoder brief

File: `.agents/NEXT.md:148`

`Suggested sequence` still says: `Start block 1 with the cross-encoder measurement brief.`

Ranked block 1 is now held. Attempt two is spent. Attempt three needs a distinct mechanism.

Repair: replace that sentence with a present-state order. Block 1 stays held until a reviewed
attempt-three brief exists. Block 2 stays monitor-only until the free Horizon probe returns
`28`.

## What holds

These checks passed. Do not change them to repair H1 and H2.

| Check | Evidence |
| --- | --- |
| Frozen brief contract | `text_pair` tokenizer call, raw-logit sigmoid, parent snapshot, lazy local-only loader, frozen projection and pair order remain in `eval/vectorize/rerank-*.mjs` |
| Model locality | Scorer sets `allowRemoteModels=false` and `useFSCache=false` before `from_pretrained`. Fetch is a separate five-URL script. No transformers `pipeline()` in the scorer |
| Hash pins | `PHASE_TWO_SHA256` holds the five reviewed byte hashes. Pin comment is present-state: `These byte hashes bind the reviewed snapshot used by preflight and the referee.` |
| Preflight count | Ledger and `eval/vectorize/README.md` record two preflight runs. Both printed `e2bc86efb15f5232993b0bf5f63b5ce55cc7241abaec6a7e54364a13b664331b` |
| Cache integrity | Independent `sha256` of the preserved files matches the ledger and Terra: result `529351b1…`, cache `fa1252fc…`, payload `44c27468…`, record `ecea4c69…`. Cache has 563 queries and 383,273 scores |
| One-referee accounting | Preserved directory has exactly two JSON files. Result `outcome` is `FAIL`, `selected` is `null`. `shouldFail` is true |
| Result-verification evidence | `result-verification-terra.md` is `PASS`. It imported no scorer and rebuilt all five readings from the cache |
| Terminal FAIL wording | Ledger, `eval/vectorize/README.md`, `eval/README.md`, and the result JSON all say verified `FAIL` with selected margin `null` |
| Exact tables | Independent parse of the result JSON matches the README top-five table and the ledger miss/capture lists. Identity is 4/8 and 1/4 original, 3/11 and 6/9 blind, routing gate pass, 0 changed rankings. Grids stay 4/8 and 1/4 original, 3/11 and 6/9 blind, and fail the routing gate. `m = 0.20` has 215 changed rankings and four gate failures |
| Identity calibration | Identity totals equal `eval/gates.json` accepted totals: legacy 208/279/311, skills 16/23/23, holdout 10/22/25 with 11 forbidden and 21 passed |
| No `improvements/` finding | `git diff --name-only 957b143 -- improvements` is empty. Closeout text states the defect is this repository's ranking |
| No forbidden-file changes | Empty diff on `src/`, manifest, frozen contracts, overlay, QA corpus, and attempt-one vectorize files |
| Reviewability of code | Preflight pin comment is present-state. No session narrative remains in the scorer, fetch, or referee |

## Reviewability notes that do not block

The dated round files keep the review chain. That is their job. Do not flatten them into
`TODO.md`.

`eval/vectorize/README.md` reports original and blind as top-five counts. The ledger also
prints top-1/top-3/top-5. Both match the result JSON. Identity original top-1 is 3, so the
4/8 figure is the top-five count.

## Commands

```sh
./node_modules/.bin/vitest run test/eval-vectorize-rerank-fit.test.mjs
git diff --check
git diff --check 957b143893842d875050f42581faf514a945c41f
git diff --name-only 957b143893842d875050f42581faf514a945c41f -- src catalog/manifest.json eval/gates.json eval/protocol-history-cases.json eval/protocol-history-blind-cases.json eval/holdout-cases.json eval/routing-cases.json eval/skills-cases.json eval/build-question-overlay.json eval/qa improvements
python3 - <<'PY'
# independent sha256 of preserved result and cache; parse reading tables
PY
```

Results:

- focused tests: 25 passed in 13.05s
- `git diff --check`: pass
- forbidden-path and `improvements/` diffs: empty
- model, preflight, and referee: not run

## What this BLOCK requires

- Repair H1 and H2 only.
- Do not edit the harness, hashes, result tables, or frozen contracts.
- Run a bounded delta of this review on `.agents/TODO.md` and `.agents/NEXT.md`.

## What this BLOCK does not require

- A second fetch or referee.
- An `improvements/` finding.
- A production routing change.

## Delta verdict

Date: 2026-08-31
Scope: H1 and H2 only (`.agents/TODO.md`, `.agents/NEXT.md`)
Status: complete. Did not load the model. Did not run preflight or the referee. This
reviewer appended only this section.

**PASS**

H1 is repaired. The sentence `Attempt two needs a separate, reviewed pinned cross-encoder
brief.` is gone. `.agents/TODO.md` now ends the attempt-one paragraph with `Attempt one is
spent.` The dated attempt-two `FAIL` paragraph remains. The open `Done when` clause remains.

H2 is repaired. `Suggested sequence` now says: `Keep block 1 held until a distinct
attempt-three brief passes review.` Block 2 stays monitor-only until the free Horizon probe
returns `28`. Ranked block 1 remains `Routing (held)`.

No other final-review finding was introduced. A search of `.agents/TODO.md` and
`.agents/NEXT.md` finds no remaining `Attempt two needs` or `Start block 1 with the
cross-encoder measurement brief` instruction.

`git diff --check` passed. `git diff --check 957b143893842d875050f42581faf514a945c41f`
passed.

This delta closes the original BLOCK. The measured outcome remains a verified `FAIL`.
Attempt two stays spent. Attempt three stays unused and still needs its own reviewed brief
with a distinct mechanism.
