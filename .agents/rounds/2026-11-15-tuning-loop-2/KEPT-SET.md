# The kept set: `tune/loop-2`

Prepared by the implementer (Claude Sonnet 5.5, terminal `loop2-kept`, `t1q5`) on the orchestrator's direct instruction after R was ruled "inconclusive, reverts" (2026-11-15). Free work only: no model
call, no spend, no paid run. The kept set is the measured code plus one change on purpose (the title-case rule, below), the TODO entries, the ledger, and the held-out launcher line. I read nothing
from the split file beyond `sets.tuning`, and no held-out or reserve row.

## 1. The final commit

**The code tip is `ac5756a4`**: the last commit that changes a tracked file outside `.agents/`. Every gate below ran on it, from a clean tree. The commits on top of it touch only `.agents/` (the ledger,
`.agents/TODO.md`, this file and the scans under `scans/kept/`); the secrets scan and the generated-artifacts diff were run again on the pushed tip (section 4). The pushed tip's hash is in the
`hc send` report to the orchestrator, because a file cannot name its own commit.

`origin/main` is at `0a603453`, the base of this branch; `git merge origin/main` reports "Already up to date", so there is nothing to regenerate from a newer main.

Commits since the run lane's last record, in order:

| Commit | What |
|---|---|
| merge of `origin/tune/loop-2-runs` | The run lane's records (`P0.md`, `P1.md`, `P2.md`, `R.md`, scans), so the round folder is complete |
| `91f6a2d2` | The pointer removed (`git revert 940dc013 a49ee918`, then the shared token module put back in its smaller form); replay tooling for the pointer removed |
| `ac5756a4` | A differential test of the token rule against the loop 1 matcher |
| docs commits | Ledger, TODO, scans, this file |

## 2. What differs from the measured commit `bd9719fb`, and why none of it can change a measured row

`git diff --stat bd9719fb ac5756a4 -- . ':!.agents'` lists five files, and nothing else:

| File | Change | Can it change a measured row? |
|---|---|---|
| `src/policy/identifier-token.ts` (new, 33 lines) | The identifier token rule for exact-row matching: letters, an optional hyphen or space, one to six digits, not followed by a dash or dot and a digit; a token whose letters are title case (`Sep-24`) is not an identifier | See below: only for a query token with title-case letters or a run of more than six digits |
| `src/executor/providers.ts` (-8, +2) | `exactRowsOf` reads its tokens from that module instead of a local regex; `stripLeadingZeros` is imported, not local | The same: the call site and the row comparison are unchanged |
| `test/identifier-token.test.ts` (new), `test/executor-providers.test.ts` | Unit cases for the rule; a differential test; one loop 1 case now reads `SEP-43` where it read `Sep-43` | Test files only |
| `ARCHITECTURE.md` | One sentence: the exact-row rule says all-upper or all-lower letters and one to six digits | Documentation |

**Why the module cannot change a measured row.** The rule differs from the regex `bd9719fb` ships only on two inputs: a token whose letters are title case (`Sep-24`, `Cap 12`) and a digit run of more
than six. An exact row needs the query to name `<source>-<number>` and the row's `source` and URL slug to agree, so the difference matters only for a research query that holds such a token with letters equal
to a value of `scout.searchResearch`'s `source` enum. Three independent checks say no measured query held one:

1. **By test.** `test/identifier-token.test.ts` runs the module and a copy of the `bd9719fb` regex over a generated corpus of more than 5,000 strings (15 letter forms, 5 joiners, 9 digit runs, 8 tails, bare and
   inside a sentence) and requires that the module returns exactly the shipped tokens less those two classes. `test/executor-providers.test.ts` pins `Sep-24`, `Sep 24 event` and `Sep24` as not exact,
   and `SEP-24`, `sep-24`, `SEP 24` and `sep24` as exact for `sep-0024`.
2. **By the stored scripts.** `scans/kept/scan-token-differences.mjs` reads the `execute` scripts of the tuning rows of every stored run (selected by id first) and counts tokens whose letters are a value of
   the research `source` enum, then those that are title case or longer than six digits: P0 50 and 0; P1 pass 1 41 and 0, pass 2 2 and 0, pass 3 0 and 0; P2 40 and 0; R pass 1 51 and 0, pass 2 48 and 0; and
   the loop 1 baseline 64 and 0 (output `scans/kept/scan-token-differences.txt`). No measured script wrote such a token. A computed query string is not visible to a static scan, which is why the live replay follows.
3. **By the 90-query live replay (loop 1's arm 2 replay, `test/replay-exact-rows.test.ts`).** The 79 stored baseline tuning rows' research queries (81 calls) and nine fixed probes, sent live to Scout through
   the real operation wrapper, on `bd9719fb` (a scratch worktree) and on `ac5756a4`, back to back: **90 of 90 ok both times, 17 calls with an exact row both times, and the two report files are byte-identical**
   (SHA-256 `4ad64957…8a612`; also byte-identical to loop 1's recorded `scans/step3/review-live-replay-90.json`). Report: `scans/kept/replay-90-kept-tip.json`. R also ran on a Worker with this rule in place
   (`940dc013`) and no title-case token appeared in any of its calls.

**What is byte-identical to `bd9719fb`:** every file under `src/` except the two above, `scripts/`, `catalog/manifest.json` (no `documentSeries` field), `specs/`, `eval/` (`eval/gates.json` included, so the
routing evidence's manifest fingerprint is P2's), `package.json`, `package-lock.json`, `wrangler.jsonc`, `env.d.ts`, and the generated files. An `execute` result carries no pointer sentence (a live check on
the kept server, `scans/kept/live-no-pointer.txt`: a Docs search naming `SEP-45` returns none; `Sep-24` marks no exact row; `SEP-24` and `sep-24` mark `sep-0024`).

## 3. The served surface

Live, from a `dev:eval` server on this tree (`node eval/report-live-surface.mjs --expect-sha256 <P2's>`; the server was my own `hc` child, killed afterwards, port closed):

| Text | Served length |
|---|---:|
| Server instructions | **1,899** (SHA-256 `67a6bd0b57da385b412a5dc47dc3de3b8ae65f4b39e3a862cb53deec659c6c00`, unchanged since P1) |
| `search` description | **1,960** (73 under Grok's 2,033) |
| `execute` description | **1,964** (69 under) |
| Descriptions, input schemas, serialized tool list | 3,924, 1,661, 6,069 |
| **Surface hash** | **`42ec61020a5f38c73ac30eb204ff424f30220f68ee3827373071c077ada8f17f`** |

**The surface hash equals P2's `42ec6102…f17f`: yes.** The pin check passed (`arm pin OK`), as the change expected: only exact-row matching moved, and no served text, schema or catalog entry did. Report:
`scans/kept/surface-kept.json`.

## 4. Gates (each bare; exit code is the command's own)

All on `ac5756a4`, clean tree, after `npm ci` and `npm run typegen`, with the placeholder `.dev.vars`.

| Command | Exit | Detail |
|---|---:|---|
| `npm run typecheck` | **0** | |
| `npm test` | **0** | 164 files passed, 5 skipped; 3,608 tests passed, 3 expected fail, 5 skipped |
| `npm run build` | **0** | |
| `npm run test:smoke` | **0** | 9 files, 144 tests |
| `npm run eval:routing -- --gate` | **0** | GATE PASS (legacy 338 within band, skills lane at or above floor, holdout lane at or above floors and under its capture ceiling; committed evidence verified) |
| CI "generated artifacts in sync": the ten generators, then `git diff --exit-code --stat` on the CI path list | **0** and **0** | `build-catalog`, `micro-map:build`, `spec:build`, `site:globes`, `check-mirrors`, `build-index`, the golden, routing and QA compilers, `build-op-classes`; nothing changed |
| `npm run secrets:scan -- --tree` | **0** | clean |

The test count is 3,608 where `bd9719fb` ran 3,602: the pointer's tests are gone and the token module's tests are new. The routing gate needs no re-baseline: `eval/gates.json` is `bd9719fb`'s, and the manifest is
its manifest.

## 5. Review findings the three step reviews marked "before ship" or "fix now"

Only one finding carried those words: step 3's F1 ("should land before ship"). The reviews' other items were "before P2", "before the keep commit", "when next touched", or record-only. Each is below.

| Finding | Where | Status |
|---|---|---|
| F1, bound the token's digits to six | Step 3 review: "should land before ship" | **Applied and kept** (`{1,6}` in the shared module, a unit case, and in the differential test). The pointer it was written for is removed; the bound now applies to exact-row matching |
| F2, title-case letters are not an identifier | Step 3 review: not required; kept by instruction | **Kept** with unit cases for both forms |
| S1 (`detail` sentence only when a row carries the join keys), S2 (a zero-row site search is `soft-empty`) | Step 2 review: "before P2 preferred, before the keep commit required" | **Applied before P2** in `bd9719fb`; unchanged here |
| R8 brief for `stellarOrg` results | Step 2 review: before P2 is read | **Applied** in `bd9719fb` (`eval/qa/claim-read-brief.md`); R8 itself is untested (TODO) |
| R1 (rubric), R2 (one judge cap), R3 (denominator) | Step 1 review: blocking before P0/P1 | **Applied** in `06b15651` |
| R4 (amendment ranges), R5, R6, R10 | Step 1 review: non-blocking, recorded | Recorded; no code |
| R7 (the map ships only with item 4's opening) | Step 1 review: forward | **Holds**: the opening is generated from the manifest and ships in the same set |
| The step 3 `eval/gates.json` note wording ("when next touched") | Step 3 review | **Moot**: the re-stamp it describes is reverted with the pointer; the file is `bd9719fb`'s |
| The `live-drift-resolution` checklist line for `documentSeries` | Step 3 review | **Moot**: the field is gone |
| D1, D2, F3, F4, D5 (the pointer's rename of `detailOnlyHint`) | Step 3 | **Moot**: removed with the pointer; the product paths are `bd9719fb`'s |

**Left, with the reason:**

- **R9** (add `attack`, `drain`, `compromis*`, `stolen` and `theft` to the claim-word scan). Optional, and it would change the guard-row set and the stored reference after both were fixed; P0, P1 and P2 are
  already read with the current list. Not applied.
- **Renaming `micro-map.ts`, `build-micro-map.mjs` and `micro-map:build`** (the plan's "keep commit" item). Nothing marked it before ship; it touches the CI workflows, the package scripts and a skill, and
  doing it here would widen the diff against the measured commit from five files to about fifteen, which is what section 2 argues from. In the TODO ("Rename the micro-map files for what they emit") with a done-when
  rule that asserts the surface hash.
- **The client probe harness** on this tip (step 2 review: "run it on this tip before the keep commit"). It calls models and needs its own authorization line; no Codex or Grok answering runner exists
  (TODO "Add a runner for Codex and Grok as QA answering clients", which now lists what item 4 leaves unverified).
- **The vendor-diverse adapter attack** and the title cap of 300 characters (G2): in the TODO's stellar.org item.
- **The ranker changes** step 2's S3 named (a 4-character minimum for the vendor prefix rule; a gate-failed candidate that beats the page's weakest gated card keeps its slot): in the TODO's routing-reach
  item. They are routing changes and need the gate and the off-golden 40.

## 6. What the final tree is not

The pointer is not shipped. R and its caveats are in `R.md` and the ledger. Nothing in this file is a held-out result, an improvement claim, or a result for a client other than Claude Code with Sonnet 5.5.
The source is unproven; the map removal is "not shown harmful", not "harmless"; the guard is "delivered, harmless, cost-neutral"; seven cards and item 4 are kept on a result that cannot isolate either.

## 7. The held-out launcher, for the orchestrator (I did not run it)

`eval/qa/heldout-read.sh` is the loop 1 launcher, unchanged. It starts nothing, needs a clean worktree at the kept commit, and an `npm run dev:eval` server for that commit already listening on the port (it
stops unless `report-live-surface --expect-source-revision <HEAD>` agrees). It stops unless the Claude Code 2.1.325 wrapper, the remote-identity probe and the stability register hash to the panel runs'
pins. One collection, `--max-budget-usd 30`, `--max-panel-cases <id count>`. Everything it writes goes to the sealed directory; it prints counts only.

```sh
KEPT=$(git -C /home/tyler/code/raven-wt/loop2 rev-parse origin/tune/loop-2)         # the pushed tip
cd /home/tyler/code/raven-wt/gca-eval && git fetch origin && git checkout --detach "$KEPT" \
  && npm ci && npm run typegen && test -z "$(git status --porcelain)"
hc run --bg --name kept-server --cwd /home/tyler/code/raven-wt/gca-eval npm run dev:eval -- --port 8800
hc wait kept-server --output Ready
eval/qa/heldout-read.sh <sealed-ids-file> 8800 <sealed-output-dir> <stored-baseline-results.json>
hc kill kept-server
```

- `<sealed-ids-file>` and `<sealed-output-dir>` are outside the repository; the directory must exist.
- `<stored-baseline-results.json>` is the file the paired counts compare against. The plan's reference is loop 1's held-out read of its kept surface (51 correct, 61 partial, 7 wrong; cap 119;
  results SHA-256 `a79c4f07…bf2a2`, sealed). Which file to pass is the orchestrator's choice. The launcher pairs rows by `caseInputSha256`.
- The expected pins on this surface: surface `42ec6102…f17f` (P2's; the launcher records it, it does not compare it), instructions 1,899, `search` 1,960, `execute` 1,964.
- **Open for the orchestrator, from the plan:** "Recompute both thresholds from P0's measured rate and fix them in the ledger before launch" (the plan states ship unless correct is at most 42 or wrong at
  least 13, at a 20% flip rate); the ledger does not hold the recomputed values yet. And the held-out read should be analysed by a lane other than `loop2-impl3` (step 3 review, D7).
