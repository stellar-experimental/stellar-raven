# Item 6.2: execution record (Sonnet 5.5 executor, agentpc t1vc)

## Step 1: split v11 (commit 1b568d76)
- `amend-split-v11.mjs` dry run, then for real: outcome word "moved"; counts 93 / 109 / 45;
  v11 SHA-256 `bb4390d3398f5e0cbdf99948bdd61be4b6872fe57c2484524802771407d71fd6`; written to
  `~/backups/gca-2026-11-14-split-v11.json`, mode 600. The id came from the heldOut set (counts).
  Cases outside tuning with a `reverifyBy`: 62, earliest 2027-01-14. No id, path or note text printed.
- `TUNING_ROW_COUNT` 92 -> 93; `items/1.4/dated/{2.1,2.2a,2.2b,2.2c}-LEAD.md` and `PRESTAGE.md` point at v11
  and its SHA-256; `.agents/TODO.md` held-out status block updated (SHA-256, counts, path, `--split` line,
  v11 amendment bullet). The TODO has no "outside tuning with a reverifyBy" figure to update (none exists in
  the block), so none was added.
- Asserting tests (`tuning-exposure-scan`, `tuning-panel-scan`, `corroboration-scan`, `replay-detail-hint`)
  read `TUNING_ROW_COUNT`; run: 27 passed, 1 skipped. Timers need no edit (`launch-dated-lead.sh` reads
  briefs from `origin/main`).

## Step 2: pre-registration commit 4092901af4ee0308008b3696c358404d435ec951
PLAN.md, QUESTION.md, REVIEW.md, briefs/, questions.json, ab-run.mjs, blind.mjs. `node --check` on both
scripts; `blind.mjs --selftest` (synthetic answers: 29 pairs packed, packet leak check, scoring, missing
pair, verdict validation) passed. questions.json: L1, L2, N1 to N4 copied by id from `eval/routing-cases.json`
(N4's row sits in the file's extended section); F1 to F4 as written in the plan.
Reference URLs re-checked 2026-11-17: all 20 distinct paths returned 200.

## Phase 2: step 7a, records and gates (lead's brief PHASE2-BRIEF.md; both second opinions say absorb)
Commits on `np/6.2-docs-titles` (none pushed): `1b568d76` split v11; `4092901a` pre-registration; `8c9241cc` A
(titles + manifest); `48b2b421` B (gates); `9006c30e` C (hold text); then the super-spec regeneration and the
records commit (SHAs in `git log`).

- **B, `eval/gates.json`:** legacy `acceptedTotals` and the `legacy` band block top1 220 -> 219, top5 327 ->
  326; holdout `acceptedTotals.top3` 27 -> 26 (`minTop3` stays 26, every other holdout number unchanged); manifest
  SHA-256 in `evidence.inputs` -> `7a4fab76...aa`; `baselinedAt` 2026-11-17T20:15:40.286Z and `localTrace`
  `routing-2026-11-17T20-15-40-285Z.json` from the `--gate` run; a new note at the head of `evidence.notes` (owner's
  answer, the zero-regression departure, the two legacy losses by id, the holdout lane by count, the floor warning,
  extended/skills/protocol history unchanged in grade with 24/2/0 list changes, the A/B as 60 of 60 answered,
  FRESH 0 losses, 1 win, 29 ties, absorb, both second opinions absorb, RESULTS.md link, "Independent review:
  Codex frontier, GPT-6 Astra (gpt-6-astra), high effort, CODEX-REVIEW.md, outstanding when this was written", then
  "Prior note:" and the previous note). `npm run eval:routing -- --gate` exit 0 (stdout to `tmp/6.2/gate*.txt`);
  I read only the `GATE PASS` line and the result JSON's counts (legacy 219/293/326/113; holdout top1 12, top3 26,
  top5 30, cardHit5 30, captures 11, passed 24).
- **C, text:** deleted the "held at its Algolia-era bytes" line in `scripts/summarize-live-drift.mjs`, the hold
  sentence in `inventory/README.md`, and replaced the TODO titles-hold bullet with one bullet in the routing repair
  item (issue #223 stays open for the repair; holdout top3 now sits on its floor). No test asserted the deleted
  sentence (`git grep` over `test` and `scripts`).
- **Gates, each run bare (output to `tmp/6.2/gate-*.txt`):**
  - `npm run typecheck`: exit 0. The first run failed (`Property 'OAUTH_KV' does not exist on type 'Env'`)
    because this worktree's generated `env.d.ts` was stale; `npm run typegen` fixed it (generated file, not tracked).
  - `npm test`: exit 0, 168 files passed, 3744 tests passed, 3 expected fail, 5 skipped. The first run failed one test
    (`test/super-spec.test.ts`, `specs/super-spec.json is stale`): see the deviation below.
  - `npm run build`: exit 0 (wrangler dry run).
  - `npm run eval:routing -- --gate`: exit 0, `GATE PASS`.
  - `npm run secrets:scan -- --tree`: exit 0, clean over all tracked files.
  - No `test:smoke` (no `src/executor` or `src/demo` change) and no QA lint, as planned.

## Reviews
- Fable plan review ([REVIEW.md](REVIEW.md)): 13 findings, all adopted (reconciliation table in PLAN.md).
- Second opinions ([SECOND-OPUS.md](SECOND-OPUS.md), [SECOND-FABLE.md](SECOND-FABLE.md)): Opus 5.5 and Fable
  both absorb.
- Codex frontier, GPT-6 Astra (`gpt-6-astra`), high effort ([CODEX-REVIEW.md](CODEX-REVIEW.md)): PASS, one low
  finding, recorded without a code change. `ab-run.mjs` checks the arm budget (`spent + 4 <= 25`) before a
  question but does not reserve a retry, so a retried run could pass the USD 25 cap. It did not arise (all 60 runs
  took one attempt; largest arm USD 6.37) and the harness stays as pre-registered. Any reuse must check the
  remaining arm budget before each attempt. The same line is in RESULTS.md "Limits". The review's note line in
  `eval/gates.json` now states the PASS and the low finding (only the note string changed; `--gate` exit 0).

## Deviations
- EXEC.md and RESULTS.md are written under `tmp/6.2/` (draft) until both arms end, because an untracked
  file in `items/6.2/` makes `dev:eval` refuse the dirty tree (`scripts/run-eval-server.mjs:18-21`). They are
  copied to the item folder, uncommitted, before the report.

## Step 3: HOLD arm (tree = 4092901a)
`npm run dev:eval -- --port 8791` as hc child `62-dev`; readiness by the `initialize` POST (200). Identity and
Docs probes at start and end passed (see RESULTS.md). Three `ab-run.mjs` children, one per client, ran in
parallel: 10/10 answered each, no failure, no retry. Window 19:44:20 to 19:49:45 UTC. Server stopped after
the end checks.

## Step 4: commit A (8c9241cc) and FRESH arm
`refresh-inventory.mjs --service stellar-docs` (key exported from `.dev.vars`, never printed): 982 titles,
`inventory/stellar-docs.json` unchanged. `build-catalog.mjs` run. Titles equal the lead's candidate by
(path, title) pairs and the manifest equals the lead's with `generatedAt` removed, so no routing re-run.
Commit A holds `inventory/stellar-docs-titles.json` and `catalog/manifest.json` only. `dev:eval` restarted
on commit A; identity and Docs probes passed; three harness children, 10/10 answered each. Window
19:50:15 to 19:57:30 UTC; no midnight straddle.

## Step 5: blind grading
`blind.mjs --pack`: 30 pairs (opus judge 20, fable judge 10), key in `tmp/6.2/blind-key.json` (mode 600). Judge
dirs under `/tmp` hold only `packet.json`, `RUBRIC.md`, `BRIEF.md`; no arm, key, model name or file name in a
packet (checked: the only hits for "hold"/"fresh" are ordinary English in questions and answers). Judges:
Claude Opus 5.5 (Sonnet + Fable pairs) and Claude Fable (Opus pairs), both `--effort high`, both launched under
`systemd-run --scope` with an 8G cap. Both hit the Claude trust prompt (one answered with `down enter`, the other
with `up enter`, which wrapped to "Yes" as the screen showed afterwards). The Fable judge also asked to approve
an `rm` of a scratch `pages/*` folder inside its own judge directory; approved. Both wrote `verdicts.json` and
reported the path. Terminals killed.

## Step 6: scoring
`blind.mjs --score` -> outcome absorb. Details in RESULTS.md. 60/60 answered, 0 missing, FRESH 1 win,
0 losses, 29 ties; no attributable loss; no fabrication marked; USD 19.9 total.

## Deviations
- EXEC.md and RESULTS.md were written under `tmp/6.2/` until both arms ended, because an untracked file in
  `items/6.2/` makes `dev:eval` refuse the dirty tree (`scripts/run-eval-server.mjs:18-21`). They are now in the
  item folder, uncommitted, as the brief asked.
- `questions.json` was generated by a throwaway script (copying L1, L2, N1 to N4 by id from
  `eval/routing-cases.json`, N4 from the file's extended section) that I deleted after use; only its output is
  committed. All 20 reference paths returned 200 before step 3.
- The "Varial wallet" search probe did not discriminate the arms (same top five, the word is not in the
  search text on either arm); identity rests on `sourceRevision`, the clean tree and the manifest SHA-256.
- The TODO held-out block had no "outside tuning with a reverifyBy" figure, so none was added (the script's
  count, 62 with earliest 2027-01-14, is in step 1 above).
- No other deviation: no retry, resume, cap stop or missing pair occurred.
- **`specs/super-spec.json` needed regenerating** (own commit). The plan said no spec reads the titles; true for
  content, but the super spec takes `generatedAt` from the catalog manifest, which is the titles `fetchedAt`, so
  commit A made `test/super-spec.test.ts` fail. `npm run spec:build` changed only the two `generatedAt` fields. The
  A/B arms served the pre-regeneration spec, which differs only by that stamp.
- The `env.d.ts` regeneration above is a local step, not a repository change.
- Verdict files copied from `tmp/6.2/` into the item folder; answers and transcripts stay in ignored `tmp/6.2/`.
