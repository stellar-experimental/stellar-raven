# Launch contract repair — implementation report

Date: 2026-09-04.

Lane: launch-contract repair. Worker: Codex Sol at `high` effort.

Source: the Sol handoff at `/private/tmp/launch-contract-repair-sol.md`, rewritten here as the
repository record. The orchestrator committed the code as `1847ffd` and the capacity evidence as
`dc0761d`.

Input: `final-synthesis-review-sol.md`, findings P1, P2, and P3.

## Result

Sol implemented P1, P2, and P3. Sol then applied the requested second repair pass.

The supervisor now requires an external authorized canonical plan SHA-256. The launch command is
`npm run eval:qa:paired:collect -- --plan <plan.json> --authorized-plan-sha256 <sha256>`.
The plan uses schema `qa-paired-collection-plan-v2`. Version 1 plans are invalid. The validator
binds the P6, capacity, collection, judging, flip re-judge, and comparison commands before either
collection child starts. The owner authorization record stays outside the plan. The owner
signature covers the canonical plan hash and every command array in the plan.

Each flip command now pins the Claude path, the binary SHA-256, and the environment SHA-256.
`re-judge.mjs` requires spaced identity flags for every paid run. It validates the identities
before the first paid call and again after judging. The final result stamps both identities and
the stability guard. Dry runs do not inspect or start Claude.

The capacity gate now uses a fixed contract and a 24-hour freshness window. The exact 86,400,000 ms
boundary is valid. One millisecond beyond the boundary is invalid. The remote identity
`--stable-sha256` probe still controls immediate service drift.

The P6 wrapper refuses an existing `--out` path or `.tmp` path before paid work. It creates the
temporary record with exclusive access. It never overwrites an earlier method record. It removes
a temporary path only when the current invocation created that path.

The corpus gate now requires exactly 200 selected IDs and exactly 500 unique active IDs. Both
runner worktrees recompute the ordered 500-ID hash, the ordered 200-ID hash, the selected content
hash, and the cases-file hash.

## Finding map

| Finding | Repair |
| --- | --- |
| P1 | External authorized plan hash; plan schema v2; every paid command array frozen and validated; flip identity pins; `--allow-empty` required for a valid zero-flip result. |
| P2 | Fixed capacity contract with an exact command, schedule, thresholds, and freshness; the artifact bytes and instrument bytes are bound in the plan. |
| P3 | `selected.count: 200`, `selected.activeCorpusCount: 500`, `selected.activeCorpusIdsSha256`; both runners recompute all four corpus hashes. |

## Files

- `eval/qa/paired-collection-supervisor.mjs`
- `eval/qa/check-paired-capacity.mjs`
- `eval/qa/re-judge.mjs`
- `eval/qa/run-p6-judge-self-test.mjs`
- `test/qa-paired-collection-supervisor.test.mjs`
- `test/qa-paired-capacity.test.mjs`
- `test/re-judge.test.ts`
- `test/p6-judge-self-test.test.mjs`
- `eval/qa/README.md`
- `eval/EVALS.md`
- `package.json`

No `.agents` file changed in the repair lane. No paid call ran. No live network request ran.

## Checks in the repair worktree

Sol ran these checks on branch `codex/tm-launch-contract-repair` at `e5c835e`. The trees at
`e5c835e` and `1847ffd` differ only by `final-synthesis-review-sol.md`. Every code file is
byte-identical.

- Focused second-pass tests: 153 passed.
- Full `npm test`: 1,961 passed in the restricted sandbox measurement.
- A later full rerun hit sandbox `listen EPERM` and GPG test-commit restrictions. It passed 1,923
  tests before those environment failures.
- `npm run typecheck`: passed after the second pass.
- `npm run build`: passed after the second pass.
- `npm run secrets:scan -- --tree`: passed after the second pass.
- `git diff --check`: passed after the second pass.

These checks ran before commit `1847ffd` existed on the round branch. They do not cover
`dc0761d`. The orchestrator later completed the full validation on the root branch with the work
through `dc0761d`. See the ledger `## Final checklist`.

## Commit record

Sol could not commit inside its sandbox. The orchestrator committed the repair as `1847ffd`
("eval: enforce the paired launch contract") on `codex/truth-maintenance-2026-09-03`. The
orchestrator then committed the authoritative v2 capacity evidence as `dc0761d`.

## Contract file hashes at `dc0761d`

These values are provisional. The launch revision recomputes every one of them.

| File | SHA-256 |
| --- | --- |
| `eval/qa/paired-collection-supervisor.mjs` | `0afb9c4dbddd33cb9d979d47a1076f8df5e0e6ade931280b9a1a5764cad3222c` |
| `eval/qa/paired-collection-control.mjs` | `1f3e4ce3bdbb6679c4e6e8e59c433c3093ecab98eaa0bbdb74b3ad5a06a76bb7` |
| `eval/qa/check-paired-capacity.mjs` | `59a52b96e890f0de4babb911022ed863c4ad5a62a6473b146007544143e8f3a9` |
| `eval/qa/re-judge.mjs` | `d3dca551164f7b6fbb6587faedace1fe97cc59b287c36d7db451da4bf2dea9c9` |
| `eval/qa/run-p6-judge-self-test.mjs` | `d821bb7d9d15004e65544c5de5f80255a1de190b788fce2603de1168da4f7c24` |
| `eval/qa/judge.mjs` | `2d14376ac4b1c1f0b9c50b0067fc4287ba200eee46c6d5d4dd6425c5c8a07637` |
| `eval/qa/evidence-pack.mjs` | `ad6cd7e6a0502f9ce0fd36208e2c9872bde08862b039b8b419917f37130bf4bd` |
| `eval/qa/run-qa.mjs` | `60aa6f3b5cb46e509dadf54fba7a34777569f2e1ba437374a282b2fc5f65f61f` |
| `eval/qa/paired-verdict.mjs` | `5a473a57708ddb17791e264b7da68e96b5b49b0102141d3a687b15510e8bd960` |
| `eval/qa/probe-remote-identities.mjs` | `bde386a01ceb5bfdd325f3cd24369e00e2c111f7b4747ec7c0c9e77bc84485ef` |
| `eval/qa/exact-old-runtime-adapter.mjs` | `473690c7f10d5384be252bb97f9aa16ee88428d23589779289f5910c08e60303` |

## Standing

The repair changes the launch contract only. It authorizes no spend. The measurement design moved
to revision 3 in `revised-impact-measurement-fable.md`. Revision 3 still needs an independent
review. No independent review of commit `1847ffd` is recorded in this round.
