# PH2 protocol-history contract repair

Date: 2026-09-03.

## Delivered contract

The evaluator now reads only `protocol-history-routing-v2` and `protocol-history-blind-v2`.

The v2 contracts cite these sources:

- `eval/protocol-history-cases.json` and `eval/protocol-history-blind-cases.json`.
- `.agents/rounds/2026-09-02-protocol-history-free-evidence/label-review-grok.md`.

Each contract uses version `2` and `authoredAt` `2026-09-03`.
Each contract pins `JSON.stringify({requiredCases,forbiddenCases,neutralCases})` with SHA-256.

The routing contract has 8 required, 2 forbidden, and 2 neutral cases.
Its neutral IDs are `ph-control-validator-vote` and `ph-control-clawback-cap`.

The blind contract has 11 required, 7 forbidden, and 2 neutral cases.
Its neutral IDs are `phb-control-sdk-version-history` and `phb-control-cap-history-sep-support`.

The self-test preserves the v1 pins.
It also verifies v2 counts, digests, unique IDs, neutral membership, and required-case order.

## Commands

`npm run eval:selftest` exited 0.
The self-test passed all checks.

The first `npm run eval:protocol-history` exited 1 before grading.
The worktree did not have the `zod` dependency.

`npm ci --offline` exited 0 without network access.
It added 310 cached packages.
Its prepare hook could not write the shared Git config.
The hook error was ignored by the existing command.

The second `npm run eval:protocol-history` exited 1 as expected.
The repaired contract still fails its routing requirements.
It wrote `eval/results/protocol-history-2026-09-03T14-32-22-231Z.json`.

| Contract | Required | Required top five | Forbidden | Forbidden top-five captures | Neutral | Neutral top-five captures | Pass |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `protocol-history-routing-v2` | 8 | 4 | 2 | 1 | 2 | 1 | no |
| `protocol-history-blind-v2` | 11 | 3 | 7 | 4 | 2 | 2 | no |
