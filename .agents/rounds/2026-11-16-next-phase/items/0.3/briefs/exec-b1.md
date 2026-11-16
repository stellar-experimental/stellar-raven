# Brief: item 0.3, step 6 only (the record commit and pull request; delete nothing)

Same executor rules as `exec-a.md`. Still **no deletion** of any ref, worktree, tag or file
outside this worktree; the orchestrator has not given the phase B go.

Work in the worktree `/home/tyler/code/raven-wt/np-0.3` on `np/0.3-branch-bundle`.

## Edits

1. `.agents/TODO.md`:
   - The identifier-pointer item: replace "The implementation is in git history (`a49ee918`,
     `940dc013`, replay tooling `3d65d0ff`)." with a sentence that says the implementation is
     archived in the branch bundle (agentpc `~/backups/raven-next-phase/raven-branches-2026-11-16.bundle`,
     ref `refs/heads/tune/loop-2-runs`, commits `a49ee918`, `940dc013`, replay tooling `3d65d0ff`;
     restore with `git fetch <bundle> <ref>:<ref>`).
   - "Treat stellar.org routing reach as a lexical and description question": delete the two
     sentences that say the bullet "sits under … on `feat/stellar-org-source`, not on `main`" and
     "When that branch merges, link that bullet …" (REVIEW F10; keep the paragraph readable). Add
     one bullet or sentence (F1): the FAM development rows are archived in the bundle at ref
     `refs/heads/exp/family-decider`, path
     `.agents/rounds/2026-11-14-family-decider/sets/fam.development.discovery.json`, and in
     `~/backups/fd-2026-11-14/split/`, with their SHA-256 (compute it from the blob, `git cat-file
     -p <ref>:<path> | sha256sum`, and from the backup copy; report both, they should match); moving
     them into `eval/discovery/` is owed when this item is worked, since the loader now accepts
     `stellarOrg`; it changes the routing set and needs its own gate run.
   - Owner decisions: delete "The round's prototype branches" (answered by decision 8; the ledger
     row records it).
   - Add one short item in the fitting section (F7): move the pinned judge-stability register and
     the stored QA results out of the `gca-eval` worktree to a fixed path outside any worktree, and
     change `eval/qa/heldout-read.sh`'s default, in a reviewed change; then remove that worktree.
     Done-when line in the file's style.
2. `.agents/rounds/2026-11-16-next-phase.md`: add the 0.3 row to the Items table. Lead
   `Claude Opus 5.5, agentpc t1qw`; PR: the URL once opened (commit it in a follow-up if needed);
   Result: bundle path and SHA-256, the two tarball SHA-256 values, "phase B pending the
   orchestrator's go"; Deployed: "Not needed: no Worker bytes change". Keep it as terse as the
   other rows.
3. `.agents/rounds/2026-11-15-tuning-loop-2.md`: one line under the header saying this round's
   branches and the commits it cites are archived in the branch bundle (path, SHA-256), with a
   link to `2026-11-16-next-phase/items/0.3/DISPOSITION.md`.
4. `.agents/README.md`: one sentence, in the most fitting place, saying deleted branches are
   archived in dated git bundles outside the repository and that the item record that deleted them
   lists each ref, SHA and bundle (link `rounds/2026-11-16-next-phase/items/0.3/DISPOSITION.md`).
5. `items/0.3/DISPOSITION.md`: the content of `/home/tyler/backups/raven-next-phase/MANIFEST.md`,
   with a one-line header saying it is the committed copy. Keep no line that names which QA set a
   case is in (the manifest names none; check).
6. `items/0.3/EXEC.md`: add a "Step 6" section.

Keep `PLAN.md`, `REVIEW.md`, `GO-REQUEST.md`, `briefs/` in the commit too.

## Gates and commit

Run bare: `npm run typecheck`, `npm test`, `npm run build`, `npm run secrets:scan -- --tree`. If the
repo has a docs or link lint in `CONTRIBUTING.md`'s Checks table for `.agents/`, run it too.
One commit, normal hooks, never `--no-verify`, message
`Bundle the branches before deleting them (round item 0.3)` with a short body and
`Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.

Push `np/0.3-branch-bundle` and open a pull request against `main` with `gh pr create`: title as the
commit; body in the style of #452 (a summary, the disposition counts, the bundle and tarball
SHA-256, "phase B pending: nothing deleted yet", what the orchestrator does on the Mac), no closing
keyword, ending with:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

Then report with `hc send t1qw '<abs path of EXEC.md>'` and wait for phase B instructions.
