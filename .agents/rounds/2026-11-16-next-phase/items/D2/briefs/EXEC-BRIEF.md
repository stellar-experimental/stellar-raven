# Brief: execute item D2

You are the executor (Claude Sonnet 5.5, high effort) for round item D2. Work in
`/home/tyler/code/raven-wt/np-D2` on branch `np/d2-heldout-integrity`. Your lead is the terminal
that launched you; its id is in your launch line.

Read first: `AGENTS.md`; `items/D2/PLAN.md` in full — the "Reconciliation" section at its end
amends the steps and wins where they differ; `items/D2/REVIEW.md` for the evidence behind each
finding. (`items/D2` = `.agents/rounds/2026-11-16-next-phase/items/D2`.)

## Hard rules

- Never open, `cat`, `head`, `jq`, `grep` or print any file under `~/backups/`. Only `ls`,
  `sha256sum`, and the amendment runner may touch them. Never print an id list of a split, a
  question or a golden of any QA case, or which set a case is in.
- No model-calling eval, no paid call, no network beyond `npm`.
- Commits use the normal hooks, never `--no-verify`. End each commit message with
  `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Do not push.
- No subagents. Do not start Wrangler.

## Phase 1: everything except the real amendment run

1. Part (a), steps 1-4 as reconciled (findings 1-4, 9, 12, 13). Before changing `run-routing.mjs`,
   run `node eval/run-routing.mjs --dump-ranked <scratch>/main.json` on the unchanged tree (write it
   outside the repo, e.g. `/tmp/d2-main.json`), and do not read its console output beyond the gate
   summary lines. After the change, dump again and `cmp` the two files; they must be identical.
2. Part (b) code: `eval/qa/split-amend.mjs` (the pure function, with the post-conditions in
   finding 7) and its test under `test/` with poisoned getters on synthetic data; the thin runner
   `items/D2/amend-split.mjs` with `--dry-run`, fixed-line errors, and the hard-coded expected
   hashes (v2 `697c550ae15400f5d7e8d9e47f4fd3d5460a6052d91571f5014ef4d35f64ed12`, results
   `1902171b4cd930459f4b3baf149cc20a2b581c0df5dc2ff28cd6c5405851f9d3`). Paths: v2
   `~/backups/gca-2026-11-14-split-v2.json`, target `~/backups/heldout-2026-11-15/exposed-row.sha256`,
   results `~/backups/heldout-2026-11-15/results.json`, out `~/backups/gca-2026-11-14-split-v3.json`.
3. Step 7 as reconciled (finding 5): one `TUNING_ROW_COUNT` = 80 and every caller and test.
4. Docs: steps 4 and 6, findings 4, 10, 11. Leave `.agents/TODO.md` held-out SHA and the ledger
   v3 lines as `<v3 SHA pending>` until phase 2.
5. Run `node <worktree>/.agents/rounds/2026-11-16-next-phase/items/D2/amend-split.mjs --dry-run`
   once. It must print only counts (80/118/49) or one fixed failure line.
6. Run the gates bare: `npm run typecheck`, `npm test`, `npm run build`,
   `npm run eval:routing -- --gate`, `npm run eval:selftest`,
   `npm run eval:qa:lint -- --stale --enforce-floors`, `npm run eval:qa:register -- --check`,
   `npm run secrets:scan -- --tree`.
7. Commit. Write `items/D2/EXEC.md` (what you did, a short summary of each gate's output, the
   dry-run printout, every deviation). Then `hc send <lead id> '<abs path of EXEC.md>'` and wait
   for the lead's reply in this terminal. Do not run the real amendment before the lead says so.

## Phase 2: after the lead says "proceed"

8. Run the runner once without `--dry-run`. Record the printed counts and v3 SHA-256.
   `chmod 600` is the runner's job; confirm with `ls -l`.
9. Fill the `<v3 SHA pending>` places; add the D2 row to the round ledger
   `.agents/rounds/2026-11-16-next-phase.md` (PR column `pending`; result: list counts per set, v3
   SHA-256, 80/118/49, deployed "Not needed: no Worker bytes change" unless your diff touched
   `src/`). Re-run `npm test` and the secrets scan. Commit, update EXEC.md, and send its path again.

On any failed assertion, stop and report the fixed line. Never work around it.
