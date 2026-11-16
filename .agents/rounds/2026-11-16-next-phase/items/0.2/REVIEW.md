# Review of the item 0.2 plan

Reviewer: Claude Fable 5.2 (`claude-fable-5-2`), high effort, agentpc. Read-only; the tree is
unchanged apart from this file. Reviewed `PLAN.md` in this folder against the repository at
`dfb7793d`.

The plan's decisions are right: the titles hold stands, and a fingerprint-only re-stamp is the
correct gate outcome if the final tree has zero graded changes. The findings are about steps that
would commit the wrong thing, fail in a way the executor is not told to expect, or have no real
mechanism behind them.

## Findings

1. **blocking: the skill body diff must not be committed.**
   - Evidence: step 3 saves the diff to `items/0.2/skill-body-diff.txt` (`PLAN.md:55-56`), and
     the commit takes "this item folder" (`PLAN.md:128`). The pin design forbids that:
     `scripts/diff-pins.mjs:11-12` ("committing it would re-introduce the vendored copy this
     design removes"), `ecosystem-skills/update.sh:6-7`, `ecosystem-skills/README.md:6`.
   - Fix: write it to the ignored `tmp/0.2-skill-body-diff.txt` and give the reviewer that path.
     `EXEC.md` records only the changed file names and line counts. Capture without a pipe:
     `./ecosystem-skills/update.sh > tmp/0.2-update.log 2>&1`, then check `$?`. The diff can be
     re-printed with `node scripts/diff-pins.mjs <base MANIFEST copy> ecosystem-skills/MANIFEST.json`.

2. **should: the routing gate is run in an order that cannot pass, and never run last.**
   - Evidence: `--gate` fails on any manifest whose SHA-256 differs from `eval/gates.json`
     (`eval/run-routing.mjs:111-120`). So step 4's first run, step 5 and step 6 all exit 1 by
     construction. Step 11 has no routing gate (`PLAN.md:111-114`), CI does
     (`.github/workflows/ci.yml:110`, `CONTRIBUTING.md:42`), and no test reads `gates.json`.
     Steps 5 and 6 rebuild the catalog after step 4 has stamped it.
   - Fix:
     - Step 4: name the one allowed failure line ("`catalog/manifest.json` SHA-256 does not match
       the committed gate evidence"). Any other failure line is the stop rule.
     - Re-stamp after steps 5 and 6, or assert after each restore that
       `sha256sum catalog/manifest.json` equals the stamped value.
     - Step 11: add `npm run eval:routing -- --gate` (exit 0). Add the `eval/` area gates,
       because `eval/gates.json` and `eval/plan/op-classes.json` move (`CONTRIBUTING.md:41`):
       `npm run eval:selftest`, `npm run eval:qa:lint -- --stale --enforce-floors`,
       `npm run eval:qa:register -- --check`.
     - Step 8: if reconciling a Codex finding changes the manifest, re-run step 4 and re-stamp.

3. **should: the "exclude in `groups.json`" fallback is not a real mechanism for this drift.**
   - Evidence: `groups.json` holds index themes and `unpinnedUpstream` for pick sources only
     (`ecosystem-skills/groups.json:3-4`). The bodies that moved are `stellar-dev` (mode `all`)
     and `stellar-light` (mode `root`) (`ecosystem-skills/sources.json:4-5`); neither can be
     excluded there. `cavos-stellar` is a row in `catalog.json` and `community.json`, which only
     `build-index.mjs`, `check-skills-drift.mjs` and `check-mirrors.mjs` read; it reaches
     `INDEX.md`, not the model. `update.sh` has no per-source hold.
   - Fix: change `PLAN.md:93-94` and `:140` to "a failed body or entry stops phase B and goes to
     the lead". Name the options the lead has: hold the whole re-pin
     (`git checkout HEAD -- ecosystem-skills/`, drift stays on #223); pin one source's `ref` in
     `sources.json` to its old commit and re-run `update.sh` (untested here); or retire the skill
     in `scripts/exposure.mjs`, which is a separate exposure change with the eval coupling in
     `ecosystem-skills/README.md` "Eval coupling". Never hand-edit `MANIFEST.json`,
     `catalog.json` or `community.json`. Scope the reviewer's read of `cavos-stellar` to its
     rendered `INDEX.md` row.

4. **should: step 6 is the check the TODO asks for, but its ship clause is out of scope and two
   failures are expected.**
   - Evidence: the candidate steps match `.agents/TODO.md:759-761`. The ship clause
     (`PLAN.md:86-87`) contradicts the file list (`PLAN.md:128-129`) and the hold: quality
     waits for a general scoring repair as well as a review (`src/policy/scout-exposure.ts:15-17`,
     `.agents/TODO.md:566-567`, `:573-574`). With quality exposed, `test/catalog.test.ts:397`
     and `:403` fail by construction (count 30, count 0). "Scratch copy" and "then restore"
     (`PLAN.md:80`, `:85`) describe two different procedures.
   - Fix: make step 6 record-only. A pass is reported to the lead as a separate exposure change;
     nothing ships here. Edit in place (the Map entry at `scout-exposure.ts:17`; the Set at `:42`
     is derived), list the two count pins as expected failures, and restore with
     `git checkout -- src/policy/scout-exposure.ts` plus the rebuild and the SHA assertion from
     finding 2. A build-guard failure is the recorded result; do not loosen a guard.

5. **should: `diff-inventory.mjs` is vacuous for `stellar-docs`.**
   - Evidence: the script reads only `openapi.paths` and `openapi.components`
     (`scripts/diff-inventory.mjs:31`, `:45`). `inventory/stellar-docs.json` has no `openapi`
     key (`contract`, `fetchedAt`, `pageIndex`, `service`, `source`), so all three modes exit 0
     whatever changed. Step 2 would record "equal" for a file CI reports as changed.
   - Fix: classify Docs from `git diff HEAD -- inventory/stellar-docs.json`, stating whether
     `contract` moved (expected: only `pageIndex` and `fetchedAt`). Keep the three modes for
     `stellar-light` and `lumenloop`. The all-services refresh also rewrites
     `inventory/stellar-org.json` when it moved (`scripts/refresh-inventory.mjs:629`); record it
     as unchanged or take the skill's stellar.org branch.

6. **should: state the held-out rule for every output, not only the totals.**
   - Evidence: the runner prints each holdout row to stdout, and `--dump-ranked` leaves that lane
     out on purpose (`eval/run-routing.mjs:138-139`). `PLAN.md:70` asks the gate note to name
     "the cause of each top-five or score change" and `PLAN.md:135` sends "any graded change" to
     the lead; neither exempts the holdout lane. Step 9 searches `eval/qa/**`, which on a tree
     with the ignored `eval/qa/results/` includes the split file (`eval/qa/README.md:226-230`).
     That directory is absent in this worktree today.
   - Fix: add one sentence: no holdout case id, question text or per-row cause in any committed
     file, the commit body or the stop-rule report; counts only, as in the 2026-11-15 gate note.
     Raw runner output and compare scripts stay in `tmp/` or `eval/results/`. Run step 9 with
     `git grep` so only tracked files are searched, and record QA hits by file path.

7. **should: step 5 needs the fresh titles file that step 1 discards, and can run without
   moving the tree.**
   - Evidence: `PLAN.md:46-47` restores the hold; `PLAN.md:73-74` swaps "the fresh titles" back
     in with no saved copy. `build-catalog.mjs` takes `--out` (`scripts/build-catalog.mjs:1319-1320`)
     and the runner takes `--manifest` (`eval/run-routing.mjs:63-67`).
   - Fix: in step 1, copy the regenerated titles to `tmp/0.2-titles-fresh.json` before the
     checkout. In step 5: copy it in, `node scripts/build-catalog.mjs --out tmp/0.2-fresh-titles-manifest.json`,
     `git checkout HEAD -- inventory/stellar-docs-titles.json`, then
     `node eval/run-routing.mjs --manifest tmp/0.2-fresh-titles-manifest.json`. The shipped
     manifest, micro-map, spec and op classes never move, so there is no restore rebuild. If the
     recorded verdict differs from the lead's, stop and report.

8. **nit: the Horizon reading differs from the TODO's wording.** `.agents/TODO.md:538-539` says
   "against the local Raven server"; step 10 uses a direct GET. It reads the same upstream fields
   and needs no dev server, so keep it, but record the deviation in `EXEC.md` and URL-encode the
   query (`curl --get --data-urlencode`). The source path is real: `internal/ingest/main.go:38`
   in `stellar/stellar-horizon` holds `MaxSupportedProtocolVersion uint32 = 30` on the default
   branch today.

9. **nit: step 3 repeats work and step 1 exports more than it needs.** `update.sh` already
   refreshes `community.json` and builds `INDEX.md` (`ecosystem-skills/update.sh:189`, `:227`);
   drop the two extra commands unless `groups.json` is edited, then run `build-index.mjs` only.
   Source `.dev.vars` in a subshell around `refresh-inventory.mjs`, so its other five values are
   not exported to the later test and build commands.

10. **nit: wording.**
    - The gate note keeps one "Prior note" and then points at git history; carry the 2026-11-15
      paragraph and drop the 2026-11-14 one.
    - Step 9 says "three Scout schema changes"; the CI comment lists four schema-only operations
      (`hackathonBrief`, `getQualityReport`, `explainRepo`, `getRepoTrust`). Search all four.

## Checked and sound

- Commands and files in steps 1 to 4, 8, 10 and 11 exist: the six regeneration commands, the
  three anchor tests, both exposure tests, `--manifest`, `check-pin-review.mjs --base`, and
  `--digests`. `check-pin-review.mjs` runs only in CI, so attesting after the Codex review works.
- Decision 3 is applied faithfully. Two legacy graded losses, neither the known row, fail the
  rule under either reading ("only the known row" or "at most one row"). Stopping before the
  off-golden sets is correct.
- The re-stamp matches precedent (`git diff 0a603453 986ffbaa -- eval/gates.json`): manifest
  SHA-256, `localTrace` and `notes` move; thresholds, `acceptedTotals` and `baselinedAt` stay. It
  is not a red-to-green re-baseline while the pass condition is zero graded changes.
- `.agents/TODO.md` is left to item 0.4, goldens are routed, and no generated file is
  hand-edited.
- Reviewer routing: Codex frontier (`gpt-6-astra`, `.agents/model-roster.md:13`) differs from
  the Sonnet author and the Opus lead.
- The gate passes on `dfb7793d` (exit 0) and takes about 10 seconds, so the extra runs above
  cost nothing.

## Verdict

REVISE: 1 blocking, 6 should, 3 nit. Fix finding 1 before the executor starts; fold findings 2
to 7 into the plan text. No decision in the plan changes.
