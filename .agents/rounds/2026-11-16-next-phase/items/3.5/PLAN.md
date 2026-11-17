# Item 3.5 plan: small own-repo fixes

Lead: Claude Opus 5.5, agentpc `t1ss`. Worktree `/home/tyler/code/raven-wt/np-3.5`, branch
`np/3.5-small-fixes` from `origin/main` `d306a3ca`. Binding scope: round PLAN.md 3.5 and the
orchestrator note `/home/tyler/code/raven-wt/orch/3.5-NOTE.md`. Revised after the Fable plan
review ([REVIEW.md](REVIEW.md)); the reconciliation is at the end.

## Decisions this item changes

1. A failing `gates.json` fingerprint test stops printing routing per-case rows (holdout ids and
   top-five lists) and says which input moved and how to re-baseline.
2. An all-capitals date joined by `-` or `.` (`10-SEP-2024`, `2024-SEP-10`, `10-SEP-24`) stops
   reading as an identifier token, so it cannot mark a row exact in `execute` results.
3. The generator of the family line, the `search` opening and the guard sentence is named for what
   it emits (`family-text`); the served surface and the guard text do not move.
4. `src/catalog/README.md` states the public `search` default as 7, matching `SEARCH_DEFAULT_LIMIT`.

One pull request, one commit per change, in the order below. Each step deletes its own TODO item
in its own commit, so a dropped step keeps its item.

## Facts re-checked on `d306a3ca`

- The failing test was `test/run-routing-manifest-evidence.test.mjs`. It spawns
  `eval/run-routing.mjs --gate` and asserts on `run.stdout + run.stderr` with `toMatch` /
  `not.toMatch`; a failed assertion prints the whole string. The runner prints per-service
  aggregates for legacy, extended and skills, and per-case tables for holdout (`run-routing.mjs`
  541-549) and protocol-history (557-565). `gateEvidenceFailures` (lines 84-138) emits aggregate
  lines only. `GATES` and the input paths are constants (69-82), so a spawn can force only the
  variant-manifest mismatch, not a committed-input mismatch. `eval/self-test.mjs:60` checks the
  same hashes with `assert.equal` (paths and hashes only).
- No other test in `npm test` touches holdout (`git grep holdout -- test` is empty). The runner
  itself prints the holdout table on every run, including CI's `npm run eval:routing -- --gate`
  (`.github/workflows/ci.yml:110`). That is out of this item's scope; step 1 records it in the TODO.
- Re-baseline has no npm command: `run-evals` SKILL.md section 6.
- `identifierTokens` (`src/policy/identifier-token.ts`) has one importer, `exactRowsOf` in
  `src/executor/providers.ts:82`, and reads only the query. Neither `src/catalog/` nor
  `eval/run-routing.mjs` imports it, so routing cannot move. `ARCHITECTURE.md:215` states the rule.
- `micro-map` reference list: `src/mcp/micro-map.ts`, `scripts/build-micro-map.mjs`,
  `scripts/build-micro-map.d.mts`, `test/micro-map.test.mjs`, `package.json` (`prebuild`,
  `micro-map:build`), `src/mcp/tools.ts` (import, comment), `src/policy/corroboration.ts` (generated
  header), `test/corroboration-guard-build.test.mjs`, `test/mcp-instructions.test.ts`,
  `scripts/build-super-spec.mjs`, `scripts/catalog-data/source-families.mjs`, `scripts/README.md`,
  `test/README.md`, `ARCHITECTURE.md` (57, 375), `.github/workflows/ci.yml` (122, 134),
  `.github/workflows/refresh.yml` (175, 407, 420), `.agents/skills/live-drift-resolution/SKILL.md`
  (32, 55), `.agents/TODO.md` (130, 225, the item).
- Expected residue after the rename (anything else is a miss): `research/`, `.agents/rounds/`,
  `plugins/openai/VERIFICATION.md:257` (a historical record), `eval/gates.json:53` (the dated
  `evidence.notes` string; a live file, kept because the note is a dated record), the
  `Source Micro-Map` absence guards at `test/demo-prompt.test.ts:17-18` and
  `test/mcp-instructions.test.ts:115`, and the `not.toContain("MICRO_MAP")` guard in the renamed
  test. The guards stay: they check served text.
- Pins: live `surfaceSha256` `42ec61020a5f38c73ac30eb204ff424f30220f68ee3827373071c077ada8f17f`,
  instructions `67a6bd0b57da385b412a5dc47dc3de3b8ae65f4b39e3a862cb53deec659c6c00`. In process,
  `npm run mcp:surface -- --json` gives `815333b7…bd07` and `67a6bd0b…6c00` at base (the
  in-process surface hash differs from the live pin by design).
- `src/catalog/README.md:22` says the public default is 5; `src/mcp/tools.ts:55` sets 7.
- Setup done by the lead: `.dev.vars` copied (mode 600), `env.d.ts` from `npm run typegen`; both
  git-ignored. `npm run dev:eval` refuses a dirty tree, untracked files included.

## Steps

`<scratch>` is the worktree's `tmp/3.5/` (git-ignored).

**Step 0, baselines (no commit).**
- Commit the round files (`items/3.5/`) first, so the tree is clean for the server later.
- `npm run eval:routing -- --gate --dump-ranked <scratch>/base-ranked.json > <scratch>/base-routing.log 2>&1; echo $?`.
  Do not read the log. Take the results path from `tail -n 1` of the log, then extract lane totals
  with `jq`: `overall`, `extendedLane.strict`, `skillsLane` totals, and `holdoutLane` counts only
  (`n`, `top1`, `top3`, `top5`, `cardN`, `cardHit5`, `forbiddenCaptures`, `passed`). Never read
  `holdoutCases` or `protocolHistoryCases`.
- `npm run mcp:surface -- --json > <scratch>/surface-base.json`.
- `npm run build`, then record the SHA-256 of each file under `dist/` to `<scratch>/dist-base.sha`.

**Step 1, fingerprint failure message.** Commit "Point the gate fingerprint failure at the input".
Edit the test before running it.
- New `eval/lib/gate-evidence.mjs`: a pure `gateEvidenceFailures(gateConfig, { repo, manifestPath })`
  moved from `run-routing.mjs`, with the input list and a `REBASELINE_POINTER` constant:
  "re-baseline: run `npm run eval:routing -- --gate > <file>`, read the totals with `jq`, compare per
  case, then update eval/gates.json in the same commit (run-evals skill, section 6)". The committed
  input mismatch names the input, the actual and the committed hash (first 12 hex), and the pointer.
  The variant-manifest mismatch keeps "a variant manifest cannot pass --gate" and gets no pointer.
  `run-routing.mjs` imports it; behaviour otherwise unchanged. Add the `.d.mts` only if typecheck
  needs it.
- `eval/self-test.mjs`: its fingerprint message uses `REBASELINE_POINTER`.
- New unit test (for example `test/gate-evidence.test.mjs`): a temp directory with the four inputs
  and a `gates.json` holding one wrong hash; assert the committed-input message (input path, both
  hashes, pointer) and the variant message, with no spawn.
- `test/run-routing-manifest-evidence.test.mjs`: `gate()` returns derived values only,
  `{ status, failures, rawHasPerCaseTable }`, and never the raw string. `failures` is the lines
  under `GATE FAIL` (`  - …`) plus any `run-routing failed:` line; when the runner exits non-zero
  with neither, it is one line, "runner exited N without a gate verdict".
  `rawHasPerCaseTable` tests fixed runner text (`/holdout lane — \d+ FROZEN/` and a `┌`). On the
  existing variant spawn, assert `rawHasPerCaseTable === true`, that the failure names the variant
  path, and that no `failures` line holds `│` or `┌`. The pass test asserts `failures` equals `[]`
  and `status` 0. No third runner run.
- Known residual, recorded in a comment and EXEC.md: a `run-routing failed:` line can carry a case
  id (`run-routing.mjs:322`).
- `.agents/TODO.md`: delete "Point the fingerprint gate failure at the fingerprint only"; add a short
  item: under `--gate` the runner prints the holdout per-case table on every run (CI included);
  print the holdout aggregate only and keep the rows in the results file. Done when a gate run's
  stdout holds no holdout case id.

**Step 2, identifier token.** Commit "Read an all-capitals date as a date, not an identifier".
Run the base replay (see Gates) immediately before this edit.
- `src/policy/identifier-token.ts`: `/(?<!\d[-.])\b([A-Za-z]+)[- ]?(\d{1,6})\b(?![-.]\d)/g`. A
  token joined to a number on either side by `-` or `.` is part of a longer string (a date, a
  version, a CVE). A shape rule, not a month list. The module comment names what still reads (below)
  and the accepted loss (a second token after a digit-hyphen, as in `CAP-46-SEP-45`; a missed exact
  mark, never a false one).
- `ARCHITECTURE.md:215`: add the preceding half, with `2024-SEP-10` as the example.
- `test/identifier-token.test.ts`:
  - `[]`: `10-SEP-2024` (flip the old pin), `2024-SEP-10`, `10-SEP-24`, `10.SEP-2024`.
  - Read: `SEP-6/SEP-24`, `CAP 46 SEP 45`, `SEP-10 and SEP-24`, `see 2024 SEP-10`.
  - Known and accepted, pinned: `SEP 10, 2024` reads `sep-10`; `10 SEP 2024` and `in SEP 2024` read
    `sep-2024`; `2024/SEP-10` reads `sep-10`; `CAP-46-SEP-45` reads `["cap-46"]`.
  - Differential test against the loop 1 matcher: add twelve prefixes including `10-`, `2024-`,
    `1.`; compute the third excluded class from `match.index` and `text.slice(0, index)` (ends in a
    digit and `-` or `.`), not with the new lookbehind; assert each excluded class drops at least one
    token.
- `test/executor-providers.test.ts`, next to the `Sep-24` pins: `2024-SEP-10` marks no `sep-0010`
  row exact; `10-SEP-24` marks no `sep-0024` row; `SEP-10` still marks `sep-0010`.
- `.agents/TODO.md`: delete "Close the all-capitals date gap in the identifier token".

**Step 3, rename.** Commit "Rename the micro-map generator for what it emits". Stem `family-text`:
every output derives from `scripts/catalog-data/source-families.mjs`.
- `git mv`: `src/mcp/micro-map.ts` to `src/mcp/family-text.ts`, `scripts/build-micro-map.mjs` to
  `scripts/build-family-text.mjs`, `scripts/build-micro-map.d.mts` to
  `scripts/build-family-text.d.mts`, `test/micro-map.test.mjs` to `test/family-text.test.mjs`.
- `buildMicroMap` to `buildFamilyText`, `MICRO_MAP_PATH` to `FAMILY_TEXT_PATH`; npm script
  `micro-map:build` to `family-text:build`; `prebuild` follows.
- Update every live reference in the list above, including the CI `git diff` path list and the
  skill. `.agents/TODO.md` lines 130 and 225 say "the source map" for the removed feature; delete
  the rename item.
- Regenerate `src/mcp/family-text.ts` and `src/policy/corroboration.ts` with
  `npm run family-text:build`. Never edit them by hand.
- Checks: `git grep -n "micro-map"`, `git grep -in "micro.\?map"` and `git ls-files | grep -i micro`
  show only the expected residue. `git diff -M d306a3ca HEAD -- src/mcp/family-text.ts src/policy/corroboration.ts`
  (with the rename detected) changes one line in each generated file, the header.

**Step 4, doc.** Commit "State the public search default as seven". `src/catalog/README.md:22`:
"the public MCP `search` tool defaults to 7".

## Gates

Run bare, each summarized in EXEC.md.

- `npm run typecheck`, `npm test`, `npm run build`, `npm run test:smoke`, `npm run eval:selftest`,
  `npm run secrets:scan -- --tree`.
- **Routing.** After step 4, as in step 0 with `<scratch>/head-*`. Exit 0. Lane totals equal step
  0's for legacy, extended and skills; holdout counts equal and `forbiddenCaptures` ≤ 10; `cmp` of
  the ranked dumps (they exclude holdout) byte-identical. No step can move routing, so any
  difference is a stop and a report, with no hit-to-miss analysis.
- **Exact-row replay.** From the worktree root, two commands, base just before the step 2 edit and
  head just after:
  `RAVEN_REPLAY_SPLIT=$HOME/backups/gca-2026-11-14-split-v2.json RAVEN_REPLAY_RESULTS=/home/tyler/code/raven-wt/gca-eval/eval/qa/results/2026-11-14T20-13-51-variantA.json RAVEN_REPLAY_LIVE=1 RAVEN_REPLAY_OUT=<scratch>/replay-base.json npx vitest run test/replay-exact-rows.test.ts`
  and the same with `replay-head.json`. Expect 90 calls. Do not open the split or the results file;
  the test selects tuning rows by id first. `cmp` first. On a difference, decide by what step 2 can
  move: compare `exactRows`, `exactUrls` and `ledgerExact` per `row` and `query`, and run the old and
  new `identifierTokens` over the base report's `query` strings (equal tokens mean equal exact rows
  for the same data). Upstream noise in `rows`, `top3`, `ok` or `errorKind` is not a step 2 failure.
- **Surface.** After step 3: `npm run mcp:surface -- --json > <scratch>/surface-head.json`; both
  hashes equal step 0's. Then one live check at head: with the tree clean, check `hc ls` for another
  Wrangler server on agentpc (if one serves another worktree, say why this one is needed), then
  `hc run --bg --name 3.5-server --cwd <worktree> -- npm run dev:eval -- --port <free port>`, wait for
  `Ready` (`hc wait <t> --output Ready`), and run
  `node eval/report-live-surface.mjs --port <port> --expect-sha256 42ec61020a5f38c73ac30eb204ff424f30220f68ee3827373071c077ada8f17f --json <scratch>/surface-live.json`:
  exit 0 and `instructionsSha256` `67a6bd0b…6c00`. Kill and remove the server child. Write EXEC.md
  after the server stops. Quote both hash lines and the generated-file diff in EXEC.md.
- **Worker bytes.** `npm run build` at head; compare with `<scratch>/dist-base.sha`. Expected to
  differ (step 2 is runtime code). If step 2 is dropped and bytes still differ, say whether the
  difference is only module path comments from the rename (no behaviour).

## Stop rules

- Step 1: done when the unit test and the spawn test pass, and no `failures` line holds a table row.
- Step 2: done when the unit cases pass and the replay shows no step-2-attributable change on a
  non-date query. A routing total or dump difference, a holdout forbidden capture above 10, or a
  step-2-attributable replay change on a non-date query drops step 2 (revert its commit, keep its
  TODO item with the reason, never re-baseline).
- Step 3: done when the grep checks show only the expected residue, both surface hashes hold, and
  each generated file differs only in its header. A pin mismatch stops the step: first check whether
  base already serves a different hash, then report; do not chase.
- Step 4: done when the line reads 7.

## Risks

- The lookbehind drops a second token after a digit-hyphen (`CAP-46-SEP-45`, `ERC-20-SEP-41`):
  a missed exact mark, never a false one. Pinned.
- Holdout exposure: every runner log goes to a file and is read through `jq` totals only.
- A missed CI path fails CI's generated-file diff check, not production.

## Reviews

- Fable plan review: [REVIEW.md](REVIEW.md), reconciled below.
- If step 2 ships, a Claude Fable child reads its evidence: the routing comparison (expected empty;
  nothing in the PR reaches routing), the replay comparison and the unit cases, into
  `REVIEW-TOKEN.md`.

## Needs from the orchestrator

- Deploy after merge if the bundle hash differs (expected). Production checks: landing 200, `/mcp`
  401 with `Bearer`, and `report-live-surface` against production still `42ec6102…f17f`.
- Nothing from the owner.

## Reconciliation of the Fable review

| # | Finding | Disposition |
|---|---|---|
| 1 | New test hands raw output to an assertion | Adopted: `gate()` returns derived values only; fixed-text boolean |
| 2 | Pointer asserted on the wrong path; committed mismatch not forceable | Adopted: `eval/lib/gate-evidence.mjs`, unit test with a temp dir |
| 3 | Pointer sends readers to a command that prints the rows | Adopted: pointer says redirect and `jq`; the runner's holdout print goes to a new TODO item (out of scope) |
| 4 | Projection residual, crash fallback, no third run, edit test first | Adopted, all four |
| 5 | `ARCHITECTURE.md:215` states the rule | Adopted |
| 6 | Dates that still read | Adopted: `10-SEP-24` closed and tested; the rest pinned as known and accepted, named in the module comment and the commit |
| 7 | Real identifiers dropped | Adopted: `CAP-46-SEP-45` pinned; `10.SEP.2024` replaced by `10.SEP-2024` |
| 8 | Keep the differential test independent | Adopted |
| 9 | Replay `cmp` vulnerable to upstream noise; timing; brace expansion | Adopted |
| 10 | Routing cannot move | Adopted: gate kept, any difference is a stop; stated in REPORT.md |
| 11 | `surface-text` names too much | Adopted: `family-text` |
| 12 | Surface gate not runnable as written | Adopted: setup done, clean tree, `mcp:surface` first, launch per `run-evals` |
| 13 | Pin does not cover the guard sentence | Adopted: generated-file diff in Done when |
| 14 | Grep residue list; path check | Adopted |
| 15 | Results path, base bundle at step 0, TODO deletion per step | Adopted |
