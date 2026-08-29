# Experimental paired QA verdict — 2026-08-29

## Route card

| Field | Value |
| --- | --- |
| Scope | `.agents/TODO.md` item “Design and validate a paired comparison verdict” only |
| Worktree | `/Users/kalepail/.herdr/worktrees/stellar-raven-codemode/codex-paired-verdict` |
| Original base | `35c90ecfcb303d2cc843b55a58636a39f8152e4a` |
| Local checkpoint | `5dc4c28` (`checkpoint: add paired QA verdict`) |
| Rebase target | `cf8af54d7e14e12e652c24872f2b655c38294f2c` (`origin/main`, merged PR-B) |
| Rebased checkpoint | `0b517432b661ac0d243e31c22965824cadade9fd` |
| Operator | Codex, paired-verdict lane |
| Skill | `.agents/skills/run-evals/SKILL.md` |
| Decision brief | `/tmp/paired-verdict-fable-decision.md` |
| Adversarial review | `/tmp/paired-verdict-review-grok.md` |
| Stored evidence | Read-only artifacts in `/Users/kalepail/Desktop/stellar-raven-codemode/eval/qa/results/` |
| Spend | No paid command authorized or run |
| Write set | paired method, validator, tests, QA runner pin and identity, EVALS, README, run-evals, NEXT, paired TODO, this ledger |
| Out of scope | Five-track implementation, lifecycle, judge prompt, panel-cap design, new QA collection, unrelated TODO items |

The rebase conflict affected `.agents/TODO.md` only. The resolution kept the paired TODO open.
It kept PR-B's completed panel-cap TODO removed. The rebased runner preserves PR-B's scaled cap,
cap-source stamps, boundary counts, summaries, and stored-judge behavior.

The rebased checkpoint has `cf8af54d7e14e12e652c24872f2b655c38294f2c` as its direct parent.
The correction work remains uncommitted after that required local checkpoint.

## Status and estimand

The method is `qa-paired-ordinal-ni-v1`. Its status is
`experimental-indeterminate-first`. It is not a ship gate.

The estimand has two cumulative-grade components:

1. `P(candidate=correct) - P(baseline=correct)`.
2. `P(candidate∈{correct,partial}) - P(baseline∈{correct,partial})`.

Here, `P` samples one eligible ID uniformly. It also samples one collection and judge realization
under the fixed measurement contract. The method keeps `correct`, `partial`, and `wrong` without
a half-credit weight.

## Decision rule

The powered denominator is 100 eligible IDs. A smaller denominator returns `INDETERMINATE` with
`denominator-below-powered-n`. The method does not apply to sample-30.

`NO_CHANGE_CONFIDENCE_RADIUS` is `0.08`. This number is the rounded no-change radius at powered
`n=100`. It is not an accepted product tolerance. The owner margin question remains open in
`.agents/NEXT.md`.

Each look uses one-sided `alpha=0.007143`. Code derives `z=2.4499904614092016` from the alpha.
Decision precedence is fixed:

1. `FAIL` when either component's upper bound is below zero.
2. Otherwise, experimental `PASS` when both lower bounds exceed the negative margin.
3. Otherwise, `INDETERMINATE`.

The default output labels `PASS` as experimental. It states that `0.08` is a no-change radius,
not a product tolerance.

## Comparability and exclusions

New rows stamp `meta.caseIdentitySchema: "qa-judge-case-v2"`. Each row stores a canonical
`caseInput` payload and its SHA-256. The payload contains `question`, `golden`,
`tags.freshness`, and `tags.trap`. Recursive key sorting makes the digest recomputable.

All artifacts must share ordered IDs, one answering model, and one judge model/rubric/pack tuple.
They must share the result schema, prompt append, agent binary, agent environment, QA
implementation, and panel contract. Each artifact must be complete and comparable.

The load-bearing panel fields are policy, threshold, effective `judgePanel`, pinned register
source/hash, effective `maxPanelCases`, its source, and the scaled default policy. Paired artifacts
must use one available register with `stabilityRegisterSource: "pinned"`.

The fixed exclusions use the union across arms and scheduled repeats:

- T4: judge/verdict errors and `spawn`, `protocol`, `unclassified`, or unknown harness failures.
- T5: `provider-safeguard`, `transport`, and `timeout`.
- T1: an `agent` termination counts as `wrong`; it is not excluded.

Candidate-only means candidate T4/T5 against baseline T1. It forces `INDETERMINATE`. A T4-to-T5
or T5-to-T4 swap is only a union exclusion.

## Register pin and repeat rule

`run-qa.mjs --stability-register <path>` loads one frozen register without regeneration. The
runner stamps the absolute path, source `pinned`, and SHA-256. Default sequential launches stamp
source `regenerated`; the comparator rejects them.

The method stops after an initial `PASS` or `FAIL`. Only statistical uncertainty at 100 eligible
IDs permits one complete repeat. The final calculation averages deltas within each ID. A guard
failure, small denominator, or candidate-only loss cannot trigger a repeat. There is no third look.

JSON records `transitions.perLook` as labeled T1/T1 attempt matrices before union exclusion.
It records `transitions.perId` for final eligible IDs. The `--json` output is the ledger form.
It keeps the machine verdict and its experimental warning in adjacent fields.

## Stored calibration evidence

| Role | Artifact | SHA-256 |
| --- | --- | --- |
| Baseline | `2026-08-27T00-02-11-variantA.json` | `e0c46a1926adab92f85b084f2d46b4b0b78f8d4b19b7e0bfab23d00dead2e0e6` |
| Later run | `2026-08-28T19-27-08-variantA.json` | `3fa1bf01fe831e999c5282b332ec1309b7dcb9804e6cc4ec41135ab0681531dd` |

Both artifacts use the `claude-sonnet-5` / `v2.8` / `p5` rubric tuple. They do not share a judge
tier contract. The 38 eligible audit IDs had four strict-correct and three non-wrong
discordances. The rounded 10% and 8% rates are a mixed-tuple upper bound. They are not operating
noise for a same-tuple comparison.

`npm run eval:qa:paired:validate -- --recalibrate <baseline> <candidate>` accepts one same-tuple
pinned pair. It derives the two discordance rates and reruns all tables. The current legacy pair
still fails closed before calibration.

## Deterministic validation

Command: `npm run eval:qa:paired:validate`.

The validator uses 100,000 trials and seed `1592594996`. Every row below uses the mixed-tuple
calibration.

| Eligible IDs | Look-1 `PASS` | Two-look `PASS` | Look-1 `FAIL` | Two-look `FAIL` | Second collection |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 90 | 0% | 0% | 0% | 0% | 0% |
| 100 | 36.350% | 80.925% | 1.196% | 2.254% | 62.454% |

| Margin | Look-1 no-change `PASS` | Two-look no-change `PASS` | False `PASS` at a true 5-point loss | Second collection |
| ---: | ---: | ---: | ---: | ---: |
| 0.05 | 6.992% | 25.963% | 0.051% | 91.812% |
| 0.08 | 36.350% | 80.925% | 3.899% | 62.454% |
| 0.10 | 66.208% | 95.657% | 18.357% | 32.596% |

| True loss | Look-1 `FAIL` | Two-look `FAIL` | Two-look `PASS` |
| ---: | ---: | ---: | ---: |
| 0 points | 1.196% | 2.254% | 80.925% |
| 5 points | 36.629% | 76.532% | 3.899% |
| 8 points | 93.030% | 99.937% | 0.060% |
| 10 points | 99.759% | 99.998% | 0.002% |
| 12 points | 99.989% | 100% | 0% |
| 16 points | 100% | 100% | 0% |

The missingness diagnostic draws a 3% T4/T5 rate. That rate includes a 1% candidate-only rate.
It also draws a separate 1% content-exclusion rate. Mean eligibility was 95.959 of 100. The
terminal `INDETERMINATE` rate was 99.356%. Candidate-only loss blocked 64.079% of trials.

All six validator gates passed:

- No-change `FAIL` stayed at or below 5% for both looks.
- Two-look no-change `PASS` reached at least 80% at the 0.08 radius.
- Two-look `FAIL` power at a 12-point loss reached at least 80%.
- Two-look false `PASS` at an 8-point loss stayed at or below 5%.
- The powered-denominator check passed.
- The derived `LOOK_Z` check passed.

## Finding reconciliation

| Finding | Disposition |
| --- | --- |
| H1 | Applied as decided. Powered `n` is 100; n=90 stays `INDETERMINATE`; docs exclude sample-30. |
| H2 | Applied as decided. `0.08` is only the no-change radius; margin tables and the owner question replace post-hoc selection. |
| H3 | Applied as decided. The 10%/8% inputs are mixed-tuple upper bounds; recalibration and missingness modes exist. |
| H4 | Applied as decided. `FAIL` now demonstrates a loss through an upper bound below zero. |
| H5 | Applied as decided. `--stability-register` pins one register and skips regeneration. |
| M1 | Applied as decided. `judgePanel`, policy, register, and PR-B panel-cap fields are load-bearing. |
| M2 | Applied as decided. Tables separate look 1, two looks, and the second-collection rate. |
| M3 | Applied as decided. JSON has per-look attempt matrices and a first-look per-ID matrix. |
| M4 | Applied as decided. Reduced deterministic validator gates run in the paired Vitest file. |
| M5 | Applied as decided. The paired TODO remains open until a pinned pair and owner decision exist. |
| M6 | Applied as decided. EVALS, README, and run-evals exclude sample-30. |
| M7 | Applied as decided. `--json` is the ledger form; the one-line output includes estimates and bounds. |
| M8 | Applied as decided. Candidate-only now requires candidate T4/T5 against baseline T1. |
| L1 | Applied as decided. Identity uses canonical key order and only judge-facing tags. |
| L2 | Applied as decided. Code derives `LOOK_Z` from `LOOK_ALPHA`; validation asserts the value. |
| L3 | Applied as decided. The catch path honors `--json`. |
| L4 | Applied as decided. Each row stores the canonical digest payload. |
| Grok M-new | Applied. Regenerated resumes may refresh, but saved unpinned verdicts cannot become pinned. |
| Grok L-new-1 | Applied. `run-evals` describes `caseInput.golden` and keeps the join for legacy rows. |
| Grok L-new-2 | Applied. Each per-look matrix counts T1/T1 attempts before the union exclusion. |
| Grok L-new-3 | Applied. A disallowed repeat keeps every initial reason before `repeat-rule`. |
| Grok L-new-4 | Applied. JSON keeps `verdictLabel` next to the machine `verdict`. |

## Implementation

- `eval/qa/paired-verdict.mjs` owns guards, bounds, decisions, matrices, repeats, and output.
- `eval/qa/validate-paired-verdict.mjs` owns tables, missingness, gates, and recalibration.
- `eval/qa/run-qa.mjs` owns the frozen register option and canonical row payload stamp.
- `test/qa-paired-verdict.test.mjs` covers statistical, boundary, tuple, identity, matrix, and CLI behavior.
- `test/qa-judge-stability.test.mjs` proves that a pinned register skips regeneration.

## Gates

| Gate | Result |
| --- | --- |
| Focused paired, stability, measurement, and stored-judge tests | PASS — 4 files, 84 tests |
| Deterministic validation | PASS — 100,000 trials, seed `1592594996`, six of six gates |
| `npm run eval:selftest` | PASS — all checks |
| `npm run eval:compile` | PASS — 338 legacy and 122 extended cases |
| `npm run eval:qa:compile` | PASS — 500 cases, SHA-256 `3d889653fa116fe6e2ca3f4922b509fd502eba05ae5c408e6e8fdebc5617f37d` |
| `npm run eval:qa:lint -- --stale` | PASS — 0 errors, 60 warnings; gospel lane skipped without `--since` |
| `npm run eval:qa:register -- --check` | PASS — up to date |
| `npm run eval:routing -- --gate` | PASS — legacy, skills, and holdout gates |
| Stored-result plan regrade | PASS — 92/100 required facts, mean ratio 0.95 |
| `npm run typecheck` | PASS |
| `npm test` | PASS — 92 files, 1,421 tests |
| `npm run build` | PASS — Wrangler dry run |
| `npm run secrets:scan -- --tree` | PASS — clean |
| `git diff --check` | PASS |
| Grok 4.6 high re-review | PASS — no findings after four repairs |

## Outcome

Implementation verdict: `PASS`. The paired method remains experimental and is not a ship gate.
Promotion still needs one same-tuple pinned pair and the owner margin decision.

The independent Grok review first found one medium and four low defects. All five repairs passed
the same reviewer's delta check. The final report is `/tmp/paired-verdict-grok-rereview.md`.

No paid command ran. No push or pull request occurred. The primary worktree remained read-only.
