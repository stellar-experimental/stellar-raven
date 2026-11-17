# Item 6.3: execution record (Sonnet 5.5 executor, agentpc t1w5)

## Step 1: pre-registration commit 370fb3224f9dcb9059cd51a16419978fd8b42698
PLAN.md, REVIEW.md, briefs/, questions.json, ab-run.mjs, blind.mjs. `node --check` on both scripts;
`blind.mjs --selftest` passed (10 pairs packed, balanced 5/5, blinded; 20 rule cases covering every clause; 3 refusals).
ab-run.mjs: a copy of the 6.2 harness with the plan's changes only (arms, USD 10 per-arm cap checked before every attempt,
full-URL reference matcher, rwaCalled/rwaMentioned); a unit check of the matcher and the call regex passed.
questions.json: C1/C2 verbatim from #167; C3, D1 to D4, N1 to N3 copied by id from eval/routing-cases.json; all 8 ids
absent from eval/routing-qa-overlap.json (string-membership boolean, nothing printed). Reference URLs re-checked 2026-11-17:
all 25 (path, required string) pairs returned 200, no redirect, and contained the required string.
This tree is the EXCLUDED arm (only .agents/ differs from main). git status --porcelain empty after the commit.

## Deviations
- EXEC.md and RESULTS.md live under tmp/6.3/ until both arms end: an untracked file in items/6.3/ makes dev:eval refuse the dirty tree (same as 6.2).

## Step 2: EXCLUDED arm (tree = 370fb322)
`npm run dev:eval -- --port 8793` as hc child `63-dev`; readiness: `initialize` POST 200. Identity at start and end
(`tmp/6.3/probe.mjs`): `serverInfo.sourceRevision` = 370fb3224f9dcb9059cd51a16419978fd8b42698 = HEAD; manifest
sha256 of `git show 370fb322:catalog/manifest.json` = 7a4fab7687507691d1ac7b219761fe9f9a7600b29ffb96d17f8815503c5caa29;
`git status --porcelain` empty. Probe ("Which tokenized real-world assets are live on Stellar?", top seven at start and end):
skills.stellar-dev.assets, stellarDocs.search_docs, stellarDocs.search_sdk_cli_tools_docs, lumenloop.search_content_semantic,
skills.lumenloop.stellar-ecosystem-scout, scout.searchProjects, skills.stellar-dev.standards: no scout.getRwaAssets (as required).
One harness process (hc child `63-ab-ex`): 10/10 answered, 1 attempt each, no failure, no retry, `rwaCalled` 0, `rwaMentioned` 0.
Cost USD 1.12 (answers file `tmp/6.3/answers-excluded.jsonl`). Window 2026-11-17 20:57:01Z to 20:59:52Z. Server and children
killed and removed.

## Step 3: commit I 92f71b8d (INCLUDED surface)
Edits: `src/policy/scout-exposure.ts` (RWA entry and its two comment lines deleted), `scripts/catalog-data/card-caveats.mjs`
(`scout.getRwaAssets` caveat, 132 characters, max 135), `eval/plan/build-op-classes.mjs` (`"scout.getRwaAssets": "broad"`).
Regenerated: `node scripts/build-catalog.mjs`, `npm run spec:build`, `npm run family-text:build` (no change),
`node eval/plan/build-op-classes.mjs`. Diff = exactly 6 files: the 3 source files plus `catalog/manifest.json`,
`specs/super-spec.json` (66 paths), `eval/plan/op-classes.json` (+1 id, broad). (PLAN.md says "four source and three
generated files"; the actual source set is three, so the commit holds six files. No other file changed.)
Manifest = `tmp/6.3/included-manifest.json` apart from `generatedAt` and the new entry's `cardCaveat` (checked by script): 286 entries.
Routing re-check on the committed manifest vs main (`run-routing.mjs --gate`, stdout to `tmp/6.3/routing-i.txt`, totals by compare.mjs):
legacy 219/293/326/113 -> 219/291/325/111; extended 93/112/117/16 unchanged; skills top1 17 unchanged; protocol history unchanged;
holdout counts 12/26/30/30 unchanged, captures 11 -> 10, passed 24 -> 25; list changes 16/3/1/0; the same 3 legacy rows hit -> miss;
getRwaAssets in the top five on 11 listed legacy, 2 listed extended, 1 skills, 2 holdout rows. Every number equals the plan's table.
The only gate failure is the expected manifest SHA-256 mismatch against eval/gates.json (new sha d90a7a46926d...). No test run.
git status --porcelain empty after the commit.

## Step 3 (cont.): INCLUDED arm (tree = 92f71b8d)
`npm run dev:eval -- --port 8793` as hc child `63-dev` (restarted on commit I); readiness: initialize POST 200.
Identity at start and end: sourceRevision = HEAD = 92f71b8dc7c3cd937fbeb635e69642d6c8679059; manifest sha256
`d90a7a46926dd70eff2fcd0ab07550d1f3f9c56a0c1055e199e7a9129947c3a1`; `git status --porcelain` empty.
Probe (top seven, start and end): scout.getRwaAssets (rank 1), skills.stellar-dev.assets, stellarDocs.search_docs,
stellarDocs.search_sdk_cli_tools_docs, lumenloop.search_content_semantic, scout.searchProjects, skills.stellar-dev.standards.
`execute` of `scout.getRwaAssets({ limit: 3 })`: start ok, asOfBasis "observed", 3 rows (asOf 21:00:59Z, 427 ms);
end ok, asOfBasis "observed", 3 rows (asOf 21:04:20Z, 143 ms).
Served skill: `skills.stellar-light.stellar-scout` (SKILL.md has only a passing "RWA tokenization" topic-cluster mention; the
RWA reference sits in the companion `references/api-reference.md`, section "GET /api/rwa", plus a mention in "GET /api/vet-idea").
Saved to `tmp/6.3/stellar-light-rwa-section.md` (2,796 bytes; the plan's "stellar-light skill" resolves to this id).
Harness (hc child `63-ab-in`): 10/10 answered, 1 attempt each, no failure, no retry; cost USD 1.08;
`rwaCalled` in 6 runs (C1, C2, C3, D1, D3, D4), not in D2, N1, N2, N3; `rwaMentioned` the same 6.
Windows (UTC, 2026-11-17): EXCLUDED 20:57:01 to 20:59:52; INCLUDED 21:01:34 to 21:04:20. Neither straddles 00:00 UTC.
Server and children killed and removed. Answer counts: EXCLUDED 10, INCLUDED 10 (20 of 20).

## Step 4: blind grading
`blind.mjs --pack --dir /tmp/ab63-judge.8L0yyk` (only `packet.json`, 122 KB, and `RUBRIC.md`); 10 pairs; split 5/5 (selftest-checked);
leak check on the real packet: no registry URL in `resultUrls`, no `excluded`/`included`/`arm`/`getRwaAssets` outside answer text.
Judge: hc child `6.3-judge` (Claude Opus 5.5, `--model opus`, effort high, `--max-budget-usd 15`, launch line from the brief). The Claude
trust prompt was answered with `hc keys 6.3-judge down enter` (own child). It wrote `verdicts.json` (10 verdicts) and sent the path; it was
killed and removed. Key: `tmp/6.3/blind-key.json` (mode 600).

## Step 5: scoring
`blind.mjs --score --verdicts tmp/6.3/verdicts-blinded.json`: outcome **exclude** (clause 1, C3 attributable drop). Details in RESULTS.md.
Un-blinded verdicts copied to `items/6.3/verdicts.json`. EXEC.md and RESULTS.md copied into `items/6.3/` (uncommitted, as the brief asks).
Spend: answers USD 2.20 (1.12 + 1.08), judge not recorded (cap 15); well under the item total cap USD 40. No commit after `92f71b8d`.

## Phase 2 (brief: briefs/PHASE2-BRIEF.md; the lead accepts the mechanical outcome, exclude)
- Step 6b, revert: `git revert --no-edit 92f71b8d`, then the commit message (only) was amended to give the reason and the
  Sonnet co-author line, as the brief asks; no content changed. Revert commit `5cfec6f3`. Check:
  `git diff --stat cd4520bd -- src scripts specs catalog eval/plan` is empty (0 lines). Commit I stays in history.
- TODO (`.agents/TODO.md`, routing-repair item "Preserve structured routing intent…"): the "Held by this item" RWA bullet keeps
  RWA excluded and now states the 6.3 A/B result (exclude on one clause: one attributable drop on a mixed-intent control; no wrong
  registry call, no bad answer, no loss on the displacement or registry questions, no registry call on the three off-target
  questions), links `rounds/2026-11-16-next-phase/items/6.3/RESULTS.md`, and says the A/B is not re-run on routine drift and a
  re-test needs an owner or orchestrator decision. Check 8 keeps its rank wording and gains one sentence: the answer-level form was
  tested in 6.3 and not adopted. The `it.fails` bullet is untouched; no other TODO item changed (diff: 11 insertions, 2 deletions).

## Gates on the final tree (each run bare, output under tmp/6.3/gate-*.txt)
Tree = revert commit plus the TODO edit and the item records (docs only; src, scripts, specs, catalog and eval/plan equal cd4520bd).
- `npm run typecheck`: exit 0. The first run failed (`Property 'OAUTH_KV' does not exist on type 'Env'`, test files only) because this
  worktree's generated `env.d.ts` was stale; `npm run typegen` fixed it (generated, untracked), same as in 6.2.
- `npm test`: exit 0, 168 files passed, 5 skipped; 3744 tests passed, 3 expected fail, 5 skipped.
- `npm run build`: exit 0 (wrangler dry run).
- `npm run eval:routing -- --gate`: exit 0, `GATE PASS` (legacy within band, skills at floor, holdout at floors and under the
  capture ceiling; baseline 2026-11-17T20:15:40.286Z, committed evidence verified). stdout in `tmp/6.3/gate-routing.txt`; only the
  GATE line was read.
- `npm run eval:selftest`: exit 0, "all checks passed".
- `npm run secrets:scan -- --tree`: exit 0, "clean — scanned all tracked files" (run before the records commit; the pre-commit hook scans the staged files again).
No test:smoke (no `src/executor` or `src/demo` change) and no QA lint, as planned. No push.

## Commits on `np/6.3-rwa-retest` (none pushed)
`370fb322` pre-registration; `92f71b8d` commit I (RWA exposed); `5cfec6f3` revert of commit I; the records commit that holds this file.

## Re-test (second measurement; brief: briefs/RETEST-BRIEF.md; plan: PLAN.md, "Re-test: second measurement")

### Step 1: re-test pre-registration commit 0100fa6a5c7115d63f7c8231f473bd05952dcac7
PLAN.md (re-test section and Fable review 2 reconciliation), REVIEW-2.md, briefs/RETEST-BRIEF.md, briefs/REVIEW-2-BRIEF.md,
ab-run.mjs, blind.mjs, attribute.mjs: every re-test rule, rubric and scorer predates every re-test answer. `node --check` on the
three scripts passed; `blind.mjs --selftest` (result 1, unchanged) passed ("10 pairs packed, balanced and blinded; 20 rule
cases; 3 refusals"); `blind.mjs --retest --selftest`, `attribute.mjs --selftest` and `ab-run.mjs --selftest` passed (mutation
checks on the clause thresholds, candidate ordering, bad-loss netting, quote checks and the attempt cap each made a selftest
fail, so the selftests can fail). `ab-run.mjs --dry-run` prints the 21-run round-major order and refuses unknown keys, bad
sample counts and duplicate keys. The commit hooks ran (secrets scan clean).
Arm tree check: `git diff --stat cd4520bd 0100fa6a -- . ':!.agents'` is empty; manifest SHA-256
`7a4fab7687507691d1ac7b219761fe9f9a7600b29ffb96d17f8815503c5caa29`; `git status --porcelain` empty after the commit.
Question texts, references and rubric wording are those of result 1 (questions.json unchanged); the retest rubric is `RETEST_RUBRIC` in
blind.mjs and the attribution rubric `ATTRIBUTION_RUBRIC` in attribute.mjs, both in the pre-registration commit.

### Step 2: EXCLUDED arm (tree = 0100fa6a, served from /home/tyler/code/raven-wt/np-6.3)
`npm run dev:eval -- --port 8793` as hc child `63-dev`; readiness: `initialize` POST 200. Identity at start and end (`tmp/6.3/rt/probe2.mjs`):
`serverInfo.sourceRevision` = HEAD = 0100fa6a5c7115d63f7c8231f473bd05952dcac7; manifest sha256 of that revision
`7a4fab7687507691d1ac7b219761fe9f9a7600b29ffb96d17f8815503c5caa29`; `git -C <worktree> status --porcelain` empty. Probe top seven at start and end:
skills.stellar-dev.assets, stellarDocs.search_docs, stellarDocs.search_sdk_cli_tools_docs, lumenloop.search_content_semantic,
skills.lumenloop.stellar-ecosystem-scout, scout.searchProjects, skills.stellar-dev.standards (no scout.getRwaAssets). Skills-cache warm-up: one
`codemode.skill.read("skills.stellar-light.stellar-scout", { sections: ["when-to-use-this-skill"] })` through `execute`, ok.
One harness process (hc child `63-ab-ex`): `ab-run.mjs --arm excluded --keys C1,C2,C3,D3,N1,N2,N3 --samples 3 --max-attempts 22`; 21/21 answered, 21 attempts,
no failure, no retry; `rwaCalled` 0, `rwaRan` 0, `rwaMentioned` 0; cost USD 2.51; window 21:36:25Z to 21:42:29Z; 21 capture files
(`tmp/6.3/rt/exec-excluded-<key>-<sample>.json`). Server and child killed and removed; port free.

### Step 2 (cont.): INCLUDED arm (commit I 92f71b8d, second worktree)
`git worktree add --detach /home/tyler/code/raven-wt/np-6.3-inc 92f71b8d`; `npm ci`; `.dev.vars` copied with `cp -p`, mode 600. Diff from 0100fa6a to
92f71b8d outside `.agents/` is commit I's six files (`src/policy/scout-exposure.ts`, `scripts/catalog-data/card-caveats.mjs`,
`eval/plan/build-op-classes.mjs`, `catalog/manifest.json`, `specs/super-spec.json`, `eval/plan/op-classes.json`). Server as hc child `63-dev` with
`--cwd` the second worktree, same port. Identity at start and end: sourceRevision = worktree HEAD = 92f71b8dc7c3cd937fbeb635e69642d6c8679059; manifest
sha256 `d90a7a46926dd70eff2fcd0ab07550d1f3f9c56a0c1055e199e7a9129947c3a1`; `git -C /home/tyler/code/raven-wt/np-6.3-inc status --porcelain` empty. Probe (start and
end the same): scout.getRwaAssets rank 1, then skills.stellar-dev.assets, stellarDocs.search_docs, stellarDocs.search_sdk_cli_tools_docs,
lumenloop.search_content_semantic, scout.searchProjects, skills.stellar-dev.standards. `scout.getRwaAssets({ limit: 3 })` through `execute`: start ok,
`asOfBasis` "observed", 3 rows (382 ms); end ok, "observed", 3 rows (161 ms). Same skill-read warm-up. Harness as hc child `63-ab-in` from the branch worktree
(`--max-attempts 24`, 45 minus EXCLUDED's 21): 21/21 answered, 21 attempts, no failure; `rwaCalled` 8, `rwaRan` 8 (never differ), `rwaMentioned` 8
(C1 samples 1 and 2, C2 samples 1 to 3, D3 samples 1 to 3); cost USD 2.58; window 21:42:57Z to 21:50:33Z; 21 capture files. Neither arm window straddles 00:00 UTC and
neither started between 23:30 and 00:00. Server and child killed and removed; `git worktree remove --force` run; the directory and its `.dev.vars` copy are gone
(checked with `ls`); `git worktree list` shows no `np-6.3-inc`.

### Step 3: blind grading, validation, attribution, scoring
- `blind.mjs --retest --pack --dir /tmp/ab63rt-judge.E3j0Tv` (only `packet.json`, 272 KB, and `RUBRIC.md`): 21 pairs; included-as-X per question
  C1 1, C2 2, C3 1, D3 2, N1 1, N2 2, N3 1 (10 overall); leak check on the real packet: none of `excluded`, `included`, `"arm"`, `getRwaAssets`, `claude-`,
  `sample`, `rwaCalled` outside answer and question text, and no registry URL in `resultUrls`. Key `tmp/6.3/rt/blind-key.json` (mode 600).
- Judge: hc child `6.3-judge2`, launch line from the brief (Claude Opus 5.5, `--model opus`, effort high, `systemd-run` memory cap). The line has no
  `--max-budget-usd` (PLAN.md names USD 15; it is a print-mode flag and the interactive CLI runs under the subscription). The Claude trust prompt was
  answered with `hc keys 6.3-judge2 down enter` (own child). It wrote `verdicts.json` and sent the path at 21:56:57Z; killed and removed.
- `blind.mjs --retest --validate`: grade hash recorded at the first write and the file valid; no completion pass was needed. Copy of the first write:
  `tmp/6.3/rt/verdicts-first.json`.
- `blind.mjs --retest --score`: outcome pending-attribution, 4 candidates (C1:1, D3:1, D3:2, D3:3), no fired clause yet.
- `attribute.mjs --pack --dir /tmp/ab63rt-attrib.9tL8VM`: packed set 4 items (equal to the candidates here), each with its capture file; hc child `6.3-attrib`
  (Claude Fable, `--model fable`, effort high; trust prompt answered with `down enter`); verdicts at 21:58:06Z; `attribute.mjs --validate`: valid on the first write, no
  correction pass; killed and removed. `attribute.mjs --score`: outcome **exclude** (D3 clause 2, count 3). Outputs: `tmp/6.3/rt/score-retest.{json,md}` (preliminary) and
  `score-retest-final.{json,md}`; un-blinded record copied to `items/6.3/verdicts-2.json`; `RESULTS-2.md` written.
- Spend: answers USD 5.09 (2.51 + 2.58) for 42 attempts of the 45 cap; judge costs not recorded (subscription; caps USD 15 each); well under the USD 50 re-test total.

### Deviations and notes
- RESULTS-2.md, `verdicts-2.json` and this section were drafted under ignored `tmp/6.3/rt/` until both servers stopped, then copied into the item folder uncommitted
  (an untracked or modified file there makes `dev:eval` refuse the tree).
- The first `probe2.mjs` run crashed with ENOBUFS hashing the 1 MB manifest through `execFileSync` (no server effect); fixed to pipe through `sha256sum`. The EXCLUDED start
  probe was run twice: the first run's warm-up read named a section that does not exist (it still loaded the skill and returned the section list); the second used
  `when-to-use-this-skill`. The recorded start probe is the second; the INCLUDED arm used it from the start.
- Interpretation recorded in the `blind.mjs` header, not exercised by this outcome: when a clause fires and another condition is inconclusive, the label is
  "inconclusive" (the result-1 precedence) and every fired clause is listed.
- The judge launch lines omit `--max-budget-usd` (see step 3); no judge cost was recorded.
- No commit after the pre-registration commit `0100fa6a`; RESULTS.md and the result-1 part of this file are unedited. No push.

### Records (brief: briefs/RETEST-RECORD-BRIEF.md; the lead accepts the mechanical outcome, exclude)
- `.agents/TODO.md`, routing-repair item, "Held by this item" RWA bullet: result 1's sentences stay; added the result-2 summary (42 answers, exclude on the
  2025-launches question, a completeness loss; result 1's control drop did not repeat; controls and off-target questions not hurt), the RESULTS-2.md link, and
  kept "a re-test needs an owner or orchestrator decision".
- `.agents/TODO.md`, "Re-check the upstream codemode short-token repair": one sentence that #167 does not depend on cloudflare/agents#2296 (Raven vendors its scorer),
  no longer tracks it, and this item keeps the watch. Nothing is posted on cloudflare/agents.
- Records commit: EXEC.md, RESULTS-2.md, verdicts-2.json, briefs/RETEST-RECORD-BRIEF.md and the TODO edits. Not pushed.

## Gates on the final tree (each run bare, output under tmp/6.3/rt-gate-*.txt)
Tree = `0100fa6a` plus the TODO edit and the records (docs only; src, scripts, specs, catalog and eval/plan equal `cd4520bd`).
- `npm run typecheck`: exit 0.
- `npm test`: exit 0; 168 files passed, 5 skipped; 3744 tests passed, 3 expected fail, 5 skipped.
- `npm run build`: exit 0 (wrangler dry run).
- `npm run eval:routing -- --gate`: exit 0, `GATE PASS` (legacy 338 within band, skills at floor, holdout at floors and under the capture ceiling; committed evidence
  verified). stdout in `tmp/6.3/rt-gate-routing.txt`; only the GATE line was read.
- `npm run eval:selftest`: exit 0, "all checks passed".
- `npm run secrets:scan -- --tree`: exit 0, "clean — scanned all tracked files" (the commit hook scans the staged files again).
No test:smoke (no `src/executor` or `src/demo` change) and no QA lint. No push.

## Commits on `np/6.3-rwa-retest` since result 1 (none pushed)
`0100fa6a` re-test pre-registration; the re-test records commit that holds this file.
