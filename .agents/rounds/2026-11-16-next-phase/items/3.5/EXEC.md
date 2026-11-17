# Item 3.5 execution record

Executor: Claude Sonnet 5.5 (`t1sv`, agentpc), worktree `/home/tyler/code/raven-wt/np-3.5`, branch
`np/3.5-small-fixes` from `d306a3ca`. Scratch: `tmp/3.5/` (git-ignored). Nothing pushed, no pull
request, no deploy. No model-calling eval and no paid call. No stop rule fired; all four steps ship.

## Commits

| Step | Commit | Subject |
|---|---|---|
| 0 | `43993baf` | Add the item 3.5 plan, review and execution brief (round files only) |
| 1 | `f7349d8a` | Point the gate fingerprint failure at the input |
| 2 | `7925540c` | Read an all-capitals date as a date, not an identifier |
| 3 | `da949a9a` | Rename the micro-map generator for what it emits |
| 4 | `8733c434` | State the public search default as seven |
| EXEC | `34efbb9c` | Record the item 3.5 execution |
| Reconcile | the commit after `34efbb9c` | Reconcile the item 3.5 token review |

## What each step did

- **Step 0.** Committed the round files so the tree was clean. Took the baselines on `43993baf`:
  routing gate run (exit 0) with `--dump-ranked`, lane totals through `jq`, `npm run -s mcp:surface
  -- --json`, `npm run build` and the SHA-256 of each `dist/` file.
- **Step 1.** New `eval/lib/gate-evidence.mjs` holds `gateEvidenceFailures(gateConfig, { repo,
  manifestPath })`, `GATE_EVIDENCE_INPUTS` and `REBASELINE_POINTER`. A committed-input mismatch now
  names the input, the actual and committed hash (first 12 hex) and the pointer; the variant-manifest
  message is unchanged and has no pointer. `run-routing.mjs` imports it; `eval/self-test.mjs`
  imports the input list and puts the pointer in its fingerprint assertion message. New
  `test/gate-evidence.test.mjs` (temp directory, no spawn, three cases). The spawn test
  `test/run-routing-manifest-evidence.test.mjs` now returns `{ status, failures,
  rawHasPerCaseTable }` and never the raw string; the variant run asserts `rawHasPerCaseTable ===
  true`, the variant path in the failure and no `│` or `┌` in any failure line. No third runner run,
  no `.d.mts` needed. TODO: deleted the fingerprint item; added "Stop the routing gate run from
  printing the holdout rows".
- **Step 2.** `TOKEN_RE` is now `/(?<!\d[-.])\b([A-Za-z]+)[- ]?(\d{1,6})\b(?![-.]\d)/g`. The module
  comment names what still reads and the accepted loss; `ARCHITECTURE.md` states the preceding half
  with `2024-SEP-10`. Unit tests: dates give `[]`, standards read, the accepted shapes are pinned
  (`SEP 10, 2024`, `10 SEP 2024`, `in SEP 2024`, `2024/SEP-10`, `CAP-46-SEP-45`), and the
  differential test against the loop 1 matcher (twelve prefixes, 129,600 strings) computes the third
  excluded class from `text.slice(0, match.index)` and asserts each class drops at least one token.
  `test/executor-providers.test.ts` pins `2024-SEP-10`, `10-SEP-24` and `SEP-10`. TODO: deleted the
  all-capitals item.
- **Step 3.** `git mv` of the four files to `family-text`; `buildFamilyText`, `FAMILY_TEXT_PATH`,
  `family-text:build`, `prebuild`; every live reference in the plan's list updated (CI `git diff`
  path list, both workflows, the skill, READMEs, `ARCHITECTURE.md`, TODO lines 130 and 225 now say
  "the source map" and "the source-map removal"). Generated files regenerated with `npm run
  family-text:build`. TODO: deleted the rename item.
- **Step 4.** `src/catalog/README.md:22` reads "defaults to 7".

## Gates

All run bare (output redirected to `tmp/3.5/g-*.log`, exit status read from the command itself).

| Gate | Result |
|---|---|
| `npm run typecheck` | exit 0 |
| `npm test` | exit 0; 168 files passed, 5 skipped; 3,725 tests passed, 3 expected fail, 5 skipped |
| `npm run build` | exit 0 |
| `npm run test:smoke` | exit 0; 9 files, 145 tests |
| `npm run eval:selftest` | exit 0; "self-test: all checks passed" |
| `npm run secrets:scan -- --tree` | exit 0; "clean — scanned all tracked files" |

**Routing** (`eval:routing -- --gate --dump-ranked`, base `43993baf`, head `8733c434`). Both runs
exit 0. Lane totals, read with `jq` only (`overall`, `extendedLane.strict`, `skillsLane`, holdout
counts), are equal; `diff` of the two total files is empty.

| Lane | n | top1 | top3 | top5 | cardN | cardHit5 |
|---|---|---|---|---|---|---|
| overall (legacy) | 338 | 220 | 293 | 327 | 182 | 113 |
| extended strict | 122 | 93 | 112 | 117 | 28 | 16 |
| skills | 23 | 17 | 23 | 23 | 23 | 23 |
| holdout (counts) | 49 | 12 | 27 | 30 | 49 | 30 |

Holdout `forbiddenCaptures` 10 before and after (ceiling 10), `passed` 25 before and after.
`cmp tmp/3.5/base-ranked.json tmp/3.5/head-ranked.json`: byte-identical. I read no routing log, no
`holdoutCases` and no `protocolHistoryCases`.

**Exact-row replay.** Base run immediately before the step 2 edit, head run immediately after, same
command, `RAVEN_REPLAY_LIVE=1`. Both passed. Each report has 98 entries (98 calls: see Deviations).
`cmp tmp/3.5/replay-base.json tmp/3.5/replay-head.json`: byte-identical, so no `exactRows`,
`exactUrls` or `ledgerExact` moved on any row and no upstream noise needed explaining. 17 of the 98
entries carry an exact row, the same 17 before and after. I did not open the split or the results
file.

No replay query holds a digit followed by `-` or `.`, so none can reach the new lookbehind. The old
and new rules read the same tokens from all 98 queries ([REVIEW-TOKEN.md](REVIEW-TOKEN.md)). The
replay is evidence of no regression on 98 real calls; the date behaviour rests on the unit and
provider tests alone.

**Surface.** `npm run -s mcp:surface -- --json`, head equals base:

```
surfaceSha256     815333b74671dec3a7919333a9960392fd9a39d12efbcaa148b447995de2bd07  (base and head)
instructionsSha256 67a6bd0b57da385b412a5dc47dc3de3b8ae65f4b39e3a862cb53deec659c6c00  (base and head)
```

Live check at head: no other Wrangler server on agentpc (`hc ls`, `pgrep`), clean tree, `hc run
--bg --name 3.5-server ... npm run dev:eval -- --port 53637` (terminal `t1sw`), `Ready`, then
`node eval/report-live-surface.mjs --port 53637 --expect-sha256 42ec6102…f17f --json
tmp/3.5/surface-live.json`: exit 0, "arm pin OK".

```
surfaceSha256      42ec61020a5f38c73ac30eb204ff424f30220f68ee3827373071c077ada8f17f
instructionsSha256 67a6bd0b57da385b412a5dc47dc3de3b8ae65f4b39e3a862cb53deec659c6c00
```

`t1sw` was killed and removed (`hc kill t1sw`, `hc rm t1sw`); `hc ls` shows only `t1ss` and `t1sv`;
no Wrangler or workerd process remains; the tree is clean.

**Generated-file diff** (`git diff -M d306a3ca HEAD -- src/mcp/family-text.ts src/policy/corroboration.ts`
with the rename detected), the whole change:

```
--- a/src/mcp/micro-map.ts
+++ b/src/mcp/family-text.ts
-// Generated by scripts/build-micro-map.mjs. Do not edit by hand.
+// Generated by scripts/build-family-text.mjs. Do not edit by hand.
--- a/src/policy/corroboration.ts
+++ b/src/policy/corroboration.ts
-// Generated by scripts/build-micro-map.mjs. Do not edit by hand.
+// Generated by scripts/build-family-text.mjs. Do not edit by hand.
```

**Grep residue after step 3** (`git grep -in "micro.\?map"` outside `research/` and
`.agents/rounds/`; `git ls-files | grep -i micro` is empty): `eval/gates.json:53` (dated
`evidence.notes`), `plugins/openai/VERIFICATION.md:257`, the `Source Micro-Map` / `Micro-Map` absence
guards in `test/demo-prompt.test.ts:17-18` and `test/mcp-instructions.test.ts:115`, and the
`not.toContain("MICRO_MAP")` guard in `test/family-text.test.mjs`. That is the expected list and
nothing else.

**Worker bytes.** `dist/` differs from the step 0 build: `server.js` `a0c0a64a…` to `7865bff9…`,
`server.js.map` `cbf2bfd2…` to `56d0ad7e…`; `dist/README.md` holds a build timestamp and always
differs. Step 2 changes runtime code, so a difference was expected; I did not separate the rename's
path comments from it. Deploy is needed after merge. Production checks: landing 200, `/mcp` 401 with
`Bearer`, and `report-live-surface` against production still `42ec6102…f17f`.

## Known residuals

- A `run-routing failed:` line can carry a case id (`run-routing.mjs`, the holdout card resolution
  throw). The spawn test's `failures` includes such a line; recorded in the test comment.
- The runner still prints the holdout and protocol-history per-case tables on every `--gate` run, CI
  included. Recorded as a TODO item ("Stop the routing gate run from printing the holdout rows"); out
  of this item's scope.
- Step 2, accepted false mark (pinned in tests): a date with no `-` or `.` joining its number to the
  token (`SEP 10, 2024`, `10 SEP 24`, `2024/SEP-10`) still reads as an identifier, so a question
  about that day can mark a row exact. The host cannot tell a date from a standard there, and a
  number and a space before a standard is common in real queries (the replay has four).
- Step 2, accepted missed mark, never a false one (pinned): the rule drops any token that directly
  follows a digit and `-` or `.`, even the only standard named (`BLS12-381-CAP-59` reads nothing;
  `CAP-46-SEP-45` reads `cap-46`).
- The Fable read of step 2 is [REVIEW-TOKEN.md](REVIEW-TOKEN.md): no blocking finding, two
  should-fix (wording) and four nits, reconciled below.

## Deviations from the plan

1. **Replay split.** The plan's `gca-2026-11-14-split-v2.json` holds 79 tuning ids and the test now
   requires `TUNING_ROW_COUNT = 87` (error: "sets.tuning must list 87 ids, got 79"). I read only that
   count from the test's error message. v3, v4 and v5 gave 80, 81 and 86; v6 passes. Split v6 is the
   current split by the repo's record (`.agents/TODO.md`, `eval/qa/tuning-rows.mjs`), so the trial
   of v3 to v5 was not needed. Base and head
   both used `gca-2026-11-14-split-v6.json`, so the comparison is like for like. The call count is 98,
   not the expected 90. The `cmp` result does not depend on it.
2. **`npm run -s`** for `mcp:surface -- --json`, because the npm banner lines otherwise make the file
   invalid JSON. Same command otherwise.
3. **Test expectations.** The plan's `see 2024 SEP-10` and the `on 10-SEP-2024, SEP-10` example also
   read a word-and-digits token (`see-2024`, `on-10`), which is existing behaviour. The test expects
   `["see-2024", "sep-10"]`, and the second example became `10-SEP-2024, then SEP-10`.
4. **Gate output** was redirected to log files instead of shown, with the exit status read from the
   command (no pipe).

## Token review reconciliation

[REVIEW-TOKEN.md](REVIEW-TOKEN.md) (Claude Fable 5.2) found no blocking issue. The lead adopted all
six findings; each was done in the "Reconcile the item 3.5 token review" commit. The commit
message of `7925540c` is not amended: it still says "pinned as accepted: a missed exact mark, never
a false one" of the dates too, and the pull request body carries the correction.

| # | Finding | What I did |
|---|---|---|
| 1 | "Never a false one" said of dates that still read | `src/policy/identifier-token.ts` comment split: space-joined dates are an accepted false mark (with the reason); the dropped token is a missed mark. Test comments and the residuals above say the same. |
| 2 | Loss wider than "a second token" | Comment and test name now say any token directly after a digit and `-` or `.`, even the only standard named. Pinned `BLS12-381-CAP-59` as `[]` beside `CAP-46-SEP-45`. No rule change. |
| 3 | `ARCHITECTURE.md:215` states the preceding half backwards | Now "one to six digits; the token is not followed by a dash or dot and a digit, and not preceded by a digit and a dash or dot (…)". |
| 4 | Three pins | Added `SEP-6,SEP-24` (reads both), `10 SEP 24` (reads `sep-24`, accepted false mark), `x-SEP-10` (reads `sep-10`) and `9-SEP-10` (reads nothing). |
| 5 | Replay shows no date input | Sentence added to the replay paragraph. |
| 6 | Citation and stale lines | Split v6 cited as current; the commit row and the Fable-child residual fixed; this section added. |

Checks run bare after the changes (output in `tmp/3.5/r-*.log`):

- `npm run typecheck`: exit 0.
- `npx vitest run test/identifier-token.test.ts test/executor-providers.test.ts`: exit 0; 2 files,
  117 tests passed.
- `npm test`: exit 0; 168 files passed, 5 skipped; 3,725 tests passed, 3 expected fail, 5 skipped.
