# Paired QA verdict — 2026-08-29

## Route card

| Field | Value |
| --- | --- |
| Scope | `.agents/TODO.md` item “Design and validate a paired comparison verdict” only |
| Worktree | `/Users/kalepail/.herdr/worktrees/stellar-raven-codemode/codex-paired-verdict` |
| Starting revision | `35c90ecfcb303d2cc843b55a58636a39f8152e4a` |
| Operator | Codex, paired-verdict lane |
| Skill | `.agents/skills/run-evals/SKILL.md` |
| Stored evidence | Read-only artifacts in `/Users/kalepail/Desktop/stellar-raven-codemode/eval/qa/results/` |
| Spend | No paid command authorized or run |
| Write set | paired method, validator, tests, QA runner stamp, QA README, run-evals guidance, exact TODO removal, this ledger |
| Out of scope | Five-track implementation, lifecycle, judge prompt, panel cap, new QA collection, other TODO items |

No independent review was requested. No agent or Herdr pane was created.

## Method

The method is `qa-paired-ordinal-ni-v1`. It reads stored result artifacts only. It requires the
same ordered IDs and one answering-model and judge-model/rubric/pack tuple. It also requires the
same result schema, prompt append, agent binary, agent environment, QA implementation, and judge
tier contract. Each artifact must be complete and stamp `meta.comparable: true`.

New collections stamp `meta.caseIdentitySchema: "qa-judge-case-v1"`. Each row stamps
`caseInputSha256` over `question`, `golden`, and `tags`. Only IDs with one identical hash across
all supplied artifacts enter the denominator. This lets a same-100 comparison retain unchanged
rows without treating changed gospel as the same input.

The ordinal estimand has two components:

1. `P(candidate=correct) - P(baseline=correct)`.
2. `P(candidate∈{correct,partial}) - P(baseline∈{correct,partial})`.

The pair keeps all three verdict categories. It assigns no half-credit weight to `partial`. The
JSON report retains the complete baseline-by-candidate 3×3 transition matrix.

Here, `P` samples one eligible ID uniformly. It also samples one collection and judge realization
under the fixed measurement contract. The estimand applies to that stored case set and contract.

The non-inferiority margin is `-0.08` on both components. Each look uses a one-sided
`alpha=0.007143` normal bound with `z=2.45`. `PASS` requires both lower bounds above
the margin. `FAIL` requires either upper bound below the margin. Every other statistical result is
`INDETERMINATE`. The minimum eligible denominator is 50 IDs.

The fixed exclusions use the union across arms and scheduled repeats:

- T4: judge/verdict errors and `spawn`, `protocol`, `unclassified`, or unknown harness failures.
- T5: `provider-safeguard`, `transport`, and `timeout`.
- T1: an `agent` termination counts as `wrong`; it is not excluded.

A candidate-only T4 or T5 result forces `INDETERMINATE`. This prevents an availability loss from
creating a quality `PASS` by shrinking the denominator.

The repeat rule has at most two looks. Stop after an initial `PASS` or `FAIL`. Only an initial
statistical `INDETERMINATE` with at least 50 eligible IDs permits one complete repeat of both arms.
The final calculation averages the two deltas within each ID. It then stops. A guard failure,
small denominator, or candidate-only T4/T5 result never triggers a repeat.

## Stored calibration evidence

The calibration used only these stored `claude-sonnet-5` / `v2.8` / `p5` artifacts:

| Role | Artifact | SHA-256 |
| --- | --- | --- |
| Baseline | `2026-08-27T00-02-11-variantA.json` | `e0c46a1926adab92f85b084f2d46b4b0b78f8d4b19b7e0bfab23d00dead2e0e6` |
| Later run | `2026-08-28T19-27-08-variantA.json` | `3fa1bf01fe831e999c5282b332ec1309b7dcb9804e6cc4ec41135ab0681531dd` |

The dated audit fixes 41 IDs with identical `question`, `golden`, and `tags` across the source
revisions. Three IDs had a T4 or T5 result in at least one artifact. The remaining 38 IDs had four
strict-correct cutpoint discordances and three non-wrong cutpoint discordances. The validator uses
the rounded 10% and 8% rates.

These artifacts have one rubric tuple but different tier contracts. The baseline also predates the
current comparability and per-row identity stamps. The new command therefore returns the honest
result:

```text
INDETERMINATE denominator=0/100 eligible IDs (content=0, T4=0, T5=0, excluded=0) runPairs=1 reasons=baseline run 1 has a row without a valid caseInputSha256; baseline run 1 does not stamp meta.comparable: true; baseline run 1 does not have complete, allowed aggregates; candidate run 1 has a row without a valid caseInputSha256
```

This result is a legacy-input guard check. It is not a product comparison.

## Deterministic validation evidence

Command: `npm run eval:qa:paired:validate`.

The validator uses 100 IDs, 100,000 trials, and seed `1592594996`. It applies the complete fixed
repeat rule. The 8-point margin was the smallest tested half-point margin that reached at least
80% no-change `PASS` power under the stored discordance calibration.

| Scenario | Terminal event | Rate | Gate |
| --- | --- | ---: | --- |
| One component at the `-8` point margin | false `PASS` | 2.561% | ≤5%, pass |
| Both components at the `-8` point margin | false `FAIL` | 0.755% | ≤5%, pass |
| No change | `PASS` power | 81.241% | ≥80%, pass |
| Both components lose 16 points | `FAIL` power | 96.415% | ≥90%, pass |

The 20,000-trial margin sweep measured 73.945% no-change power at 7.5 points and 81.620% at 8
points. The 20,000-trial discordance grid varied each applicable rate from 8% through 40%. Its
worst false `PASS` was 3.465%, and its worst false `FAIL` was 2.725%.

The validator also measured 0% false `FAIL` under no change and 0% false `PASS` under the
16-point regression scenario. Those are diagnostics, not extra gates.

## Implementation

- `eval/qa/paired-verdict.mjs` owns guards, fixed exclusions, estimates, bounds, repeat handling,
  the terminal verdict, JSON detail, and the one-line report.
- `eval/qa/validate-paired-verdict.mjs` owns the deterministic simulation and its four gates.
- `eval/qa/run-qa.mjs` stamps the per-row case identity and its schema on new stored results.
- `test/qa-paired-verdict.test.mjs` covers PASS, FAIL, both forms of INDETERMINATE, exact boundary
  equality, both ordinal cutpoints, all fixed exclusions, the T1 agent-failure rule, tuple drift,
  content drift, the repeat stop, and the one-line CLI output.
- `eval/qa/README.md` and `.agents/skills/run-evals/SKILL.md` carry the matching operator contract.

## Gates

| Gate | Result |
| --- | --- |
| Narrow paired and measurement tests | PASS — 18 tests |
| Deterministic false-verdict and power simulation | PASS — five of five gates |
| `npm run eval:selftest` | PASS |
| `npm run eval:compile` | PASS — 338 legacy and 122 extended cases |
| `npm run eval:qa:compile` | PASS — 500 cases; SHA-256 `3d889653fa116fe6e2ca3f4922b509fd502eba05ae5c408e6e8fdebc5617f37d` |
| `npm run eval:qa:lint -- --stale` | PASS — zero errors and 60 warnings |
| `npm run eval:qa:register -- --check` | PASS — register is current |
| `npm run eval:routing -- --gate` | PASS |
| Stored-result plan regrade | PASS diagnostic — 92/100 required facts covered; mean on-plan ratio 0.95 |
| `npm run typecheck` | PASS |
| `npm test` | PASS — 1,395 tests in 92 files |
| `npm run build` | PASS |
| `npm run secrets:scan -- --tree` | PASS — no leaks |
| `git diff --check` | PASS |

`npm ci` installed 310 packages. Its `prepare` hook could not update the shared primary-worktree
Git config under the sandbox. The hook already tolerates that failure, and installation completed.

`npm run typegen` generated `env.d.ts`. Wrangler could not write its external log file under the
sandbox, but the command completed successfully.

## Outcome

`PASS`. The paired-verdict lane is complete, and every required free gate passed. The paid judge
self-test did not run. No paid command ran. The primary worktree remained read-only.
