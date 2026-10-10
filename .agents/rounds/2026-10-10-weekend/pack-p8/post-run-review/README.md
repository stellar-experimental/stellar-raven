# Post-run review of the p8 re-measurement

- [rr6-review.md](rr6-review.md): the mandatory post-run review (R6). Verdict: `POST-RUN: CONFIRMED`.
  It confirms the block under the predeclared Stage 2 rule. It also reads every individual rationale in both arms.
- [rr6-audit.mjs](rr6-audit.mjs): the reviewer's offline audit. It makes no model call.
  [rr6-audit.json](rr6-audit.json) is its output.
- [rr6-summary.json](rr6-summary.json): the reviewer's rerun of the predeclared reading script.
- [rr6-replay.json](rr6-replay.json): the reviewer's rerun of the p8 replay.
- [rr6-diagnostic.mjs](rr6-diagnostic.mjs) and [rr6-diagnostic.json](rr6-diagnostic.json): the reviewer's
  test of a proposed R5-1 filter, without a change to tracked code.

The audit also wrote 128 files: the rebuilt pack and the full judge input for each row and arm.
They hold saved answers and transcripts, so they are not committed. They stay in the ignored
`saved-data/` folder on the operator's machine. Run `rr6-audit.mjs` to rebuild them.
The scripts still name their original `tmp/` paths.

The operator moved these files here from `tmp/` on 2026-10-10. Only the review's links to the
rebuilt packs and inputs changed, to point at `saved-data/`.
