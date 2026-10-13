# Post-run review of the p6/p7 paired re-judge

- [rr3-review.md](rr3-review.md): the mandatory post-run review (Codex frontier `gpt-6-astra`, high effort).
  Verdict: `POST-RUN: DISPUTED` on five items. It confirms the p7 block.
- [rr3-audit.mjs](rr3-audit.mjs): the reviewer's offline audit. It makes no model call.
  [rr3-audit.json](rr3-audit.json) is its output.
- [rr3-probe.mjs](rr3-probe.mjs) and [rr3-support-probe.mjs](rr3-support-probe.mjs): the selection probe and the support probe.
- [rr3-omissions.json](rr3-omissions.json): the reviewer's copy of the omission replay.
- [rr3-write-tables.py](rr3-write-tables.py): the reviewer's table helper.

The audit also wrote 128 files: the rebuilt pack and the full judge input for each row and arm.
They hold saved answers and transcripts, so they are not committed. They stay in the ignored
`saved-data/` folder on the operator's machine. Run `rr3-audit.mjs` to rebuild them.
The scripts still name their original `tmp/` paths.

The operator moved these files here from `tmp/` on 2026-10-10. Only the review's links changed,
to point at `saved-data/` and `../rejudge-artifacts.json`.
