# D2 report

Lead: Claude Opus 5.5, agentpc `t1r2`.

- Plan review: Claude Fable `t1r3`.
- Executor: Claude Sonnet 5.5 `t1r4`.
- Both child terminals are killed and removed.

## Pull request and result

- [#455](https://github.com/stellar-experimental/stellar-raven/pull/455), branch
  `np/d2-heldout-integrity`. Not merged.
- **(a) Confirmation-only rows.** The overlap list is committed as `eval/routing-qa-overlap.json`.
  - It covers every routing and discovery row that matches a QA headline question (token Jaccard
    ≥ 0.8 against all 247): legacy 108/338, extended 43/122, discovery 15/43, agentic 12/30,
    protocol-history v1 and v2 1/12 each, and 0 in the other sets.
  - The old 73 legacy and 26 extended ids are all contained in it (0 missing). I checked this
    against `~/backups/fd-2026-11-14/routing-matches.json`; the script printed counts only.
  - The runners tag listed rows and print no per-row outcome for them. The aggregates and
    `--dump-ranked` output are byte-identical to `main`.
  - The loop 2 interim ruling is replaced, so round item 3.3's per-case review is unblocked for
    unlisted rows.
- **(b) The exposed held-out row moved to tuning.**
  - New split file on agentpc: `~/backups/gca-2026-11-14-split-v3.json`, SHA-256
    `ceb98d6a612aa2a85b48a20dac953f76b7e67f860092c61c84292dcb53434155`, 80/118/49. v2 is kept.
  - Nothing printed an id. I read the amendment code before the one real run.
  - `TUNING_ROW_COUNT` is now 80.
- **Gates.** I ran each one bare on the tip, and all pass: typecheck, `npm test` (3,632 passed),
  build, routing `--gate`, selftest and the secrets scan.
- **Other reviews.** After execution, no further review was required. No skill names one, and no
  product or security boundary changed: nothing under `src/` changed.

## Deploy

Not needed. No Worker bytes change.

## For the orchestrator on the Mac

- If the Mac holds a copy of the v2 split, or a held-out id list taken from it, it is stale.
  Replace it with v3 from agentpc and check SHA-256 `ceb98d6a…4155`.
- A future held-out read pairs on v3's 118 held-out ids.
- Any lane that runs a tuning scan must now pass `--split ~/backups/gca-2026-11-14-split-v3.json`.
  Under the new code, v2 throws (79 ≠ 80).
- The 0.3 bundle's held-out copy (`~/backups/raven-next-phase/heldout-private`) is a dated archive.
  I left it unchanged.

## Deviations and notes

- While locating the gate line, the executor printed the routing-holdout table of the unchanged tree
  once. That table holds routing-holdout ids and ranks: 0 listed rows, and no QA content.
- `eval/qa/split-amend.mjs` hard-codes this amendment's before and after counts and its dated note.
  The next amendment edits those constants.

## Open questions for the owner

None.
