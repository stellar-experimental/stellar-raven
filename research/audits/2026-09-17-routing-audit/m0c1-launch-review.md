# M0-C1 launch review

- Date: 2026-09-17.
- Reviewer: independent of the plan author.
- Not done: paid launch, repo edits, Wrangler, or reads of sealed discovery outputs.
- Only command executed: the M0-C1 array plus `--dry-run`.

## Verdict

**PASS for the M0-C1 command as drafted.** Launch requires the draft to become `paid-plan.json`, with an
authorization that names its hash and adds `M0-C1`.

## Plan delta

| File | SHA-256 |
|---|---|
| `paid-plan.json` (current, authorized) | `8bcd7ba602ae2a343226a749edb3de82ced9dbf675d4390ced7b098b5583a829` |
| `paid-plan-m0c1-draft.json` | `b62252674314fd8c3b1ebf970ef36db1676e9ad02760586089c482b01ccda186` |

A recursive JSON diff finds exactly one change:
`commands.M0-C1[2]`: `PENDING_M1_C1_ARTIFACT` → `/private/tmp/raven-routing-audit-2026-09-17/repo/eval/qa/results/2026-09-17T03-21-24-variantA.json`.

## Exact M0-C1 command

```json
["node", "/private/tmp/raven-routing-audit-2026-09-17/repo/eval/qa/re-judge.mjs",
 "/private/tmp/raven-routing-audit-2026-09-17/repo/eval/qa/results/2026-09-17T03-21-24-variantA.json",
 "--ids", "q-eco-lobstr-wallet,q-defi-aquarius-what-is,q-defi-soroswap-what-is",
 "--judge-model", "claude-sonnet-5", "--max-budget-usd", "2",
 "--claude-path", "/Users/kalepail/.local/bin/claude",
 "--expect-agent-binary-sha256", "3509913f9d1576316c8845b88837f8fd3bbbcf26625833ac82cfb6b8985da94a",
 "--expect-agent-environment-sha256", "a460b90255f52a7714f9645701eca60f045c7a10c19dacbe4a2d9c99536212a6",
 "--judge-panel", "3"]
```

- **IDs:** the three corrected IDs. They match `goldenCorrection.ids` and the M0-B1 command.
- **Panel and cap:** `--judge-panel 3` and `--max-budget-usd 2`, the same form as M0-B1.
- **Case source:** no `--cases-ref`, so re-judge reads the cases at the artifact's recorded runner revision.
- **Override:** no `--allow-non-identical`, so any snapshot or tuple mismatch refuses.
- **Identities:** the claude binary realpath sha256 is `3509913f9d1576316c8845b88837f8fd3bbbcf26625833ac82cfb6b8985da94a`,
  which matches the flag. The environment hash is enforced by re-judge at paid launch.
- **Paths:** the runner and artifact paths are realpaths.

## Source artifact (M1-C1)

- File: `repo/eval/qa/results/2026-09-17T03-21-24-variantA.json`, sha256 `9f5fdab852d5c7e7ab872f238491df818fcd2b33dce411f6a8992d5f1c105308`.
- It is the only artifact in `M1-C1-receipt.json`. The receipt shows exit 0, 16 rows, comparable true,
  `aggregatesAllowed` true, and cost $5.9831158.
- `sourceIdentity`:
  - `runnerRevision` `c6968e7412399f099c0df51b51eacd7bf4c48f12`, `runnerDirty` false;
  - `serverRevision` `c6968e7412399f099c0df51b51eacd7bf4c48f12` (candidate);
  - `qaImplementationSha256` `4d0ccc8d4b37…`, matching the plan;
  - `manifestFileSha256` `da21ab9a…`, matching the plan.
- `inputSnapshot.casesSha256` is `94ac7f19e906cbe8fb57cbf3c6a59616680f9e60f623c6ace90bf9c46c936fbb`. That is the
  corrected-cases selection hash, the same as the M0-B1 dry run's actual hash. `caseIdsSha256` is `ceebf328…`.
- Judge tuple: model `claude-sonnet-5`, rubric `v2.10`, pack `p6`.
- Budget: $20 authorized, $5.9831158 reported, 48 of 48 calls, 0 missing costs, not exhausted.
- Completeness: complete, 16 collected and judged rows, 0 agent failures, 0 error verdicts.
- The three rows have answers and no agent failure:

  | ID | Answer chars | Collection score | Tier |
  |---|---|---|---|
  | `q-defi-aquarius-what-is` | 1,764 | wrong | panel, 3 judges |
  | `q-defi-soroswap-what-is` | 3,210 | wrong | panel, 3 judges |
  | `q-eco-lobstr-wallet` | 2,324 | correct | single |

## Dry run

Command: the exact M0-C1 array plus `--dry-run`, cwd `plan.runner.cwd`. Output saved to
`/tmp/raven-routing-audit-2026-09-17/M0-C1-dry-run.json`.

- Exit 0, empty stderr.
- `selectedIds`: `q-defi-aquarius-what-is`, `q-defi-soroswap-what-is`, `q-eco-lobstr-wallet`.
- `guards.cases`: expected equals actual `94ac7f19…`, case IDs `ceebf328…` match, `missingCaseIds` empty,
  `orderMatches` true, `matches` true.
- `guards.casesMode`: `revision`. `historicalCases` requested and resolved `c6968e7412399f099c0df51b51eacd7bf4c48f12`
  (`eval/qa/cases.json`), with selected sha `94ac7f19…` and its guard matching.
- `guards.tuple`: source equals current (claude-sonnet-5 / v2.10 / p6), `matches` true.
- `guards.goldenTime`: `matches` true, no violations (all three IDs stable), `allowGoldenDrift` false.
- `allowNonIdentical` false and `wouldRefuse` false, so no override is needed.
- Side effects: the results directory listing and mtimes did not change. The candidate worktree porcelain status
  is empty.

## Launch-state checks

- Candidate worktree HEAD is `c6968e7412399f099c0df51b51eacd7bf4c48f12` with a clean porcelain status.
- All seven `filePins` in the draft match the working copy, including `eval/qa/cases.json` `3b1aef67…`.
- `M0-C1-start.json` does not exist, so the method is not yet launched.
- Every prior non-noop start has a receipt with numeric `costUsd`:

  | Method | Cost (USD) |
  |---|---|
  | M0-B1 | 0.6172996 |
  | M1-B1 | 5.8820244 |
  | M1-C1 | 5.9831158 |
  | M2-B1a | 0.4686228 |
  | M2-B1b | 0.4990802 |
  | M3-B1 | 4.7252672 |
  | M4-B1 | 6.0498432 |
  | **Total** | **24.2252532** |

  With the $2 M0-C1 cap, the total is at most $26.2252532, under the $250 round cap.
- M0-B1 receipt: exit 0, 3 rows, `nonIdentical` true, `costAccounting.complete` true. Its panel-3 overlay is the
  paired comparison for M0-C1.

## Launch conditions

1. Install the draft as `paid-plan.json`, byte-identical to `b62252674314fd8c3b1ebf970ef36db1676e9ad02760586089c482b01ccda186`.
2. Update `paid-authorization.json`: set `planSha256` to that hash and add `M0-C1` to `allowedMethods`. The current
   authorization names `8bcd7ba6…` and excludes `M0-C1`, so the launcher refuses until then. The added method must
   not include M5 or reserve spend.
3. Launch exactly once through `launch-method.py M0-C1`, without Python optimization and with no retry.
4. After the run, require:
   - 3 rows;
   - `costAccounting.complete`;
   - no incomplete or unattempted IDs;
   - gradeable `new.score` on every row;
   - cost at or below $2;
   - the artifact's `meta` records `nonIdentical` false.
5. Compare M0-C1 only with the M0-B1 panel-3 overlay for these three IDs. Do not pool with collection-time tiered
   grades.
