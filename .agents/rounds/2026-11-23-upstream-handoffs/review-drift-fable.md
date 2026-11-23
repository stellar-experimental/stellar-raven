# Independent review: live drift (#540, #550, #551) and dated launcher fix (#552)

- **Reviewer:** Claude Fable 5.2 (`claude-fable-5-2`), read-only. No tracked file edited, nothing committed, pushed or posted, no subagents.
- **Date:** 2026-11-23
- **Not opened:** `eval/qa/corpus/**`, `eval/qa/consistency-register.json`. Holdout rows were compared by script and reported as counts only.

| Part | Verdict | Findings |
| --- | --- | --- |
| 1. Live drift worktree | **PASS WITH FINDINGS** | 3 Should-fix, 5 Low |
| 2. Dated launcher fix | **PASS WITH FINDINGS** | 1 Should-fix, 3 Low |

No Blocker in either part. Every number the author claims reproduces. The findings are about what the
records say (Part 1) and one new branch that never runs (Part 2).

**Base moved during the review.** `origin/main` went from `bdf810ef` to `392c0276` (#557) at 16:09:59
local, after I started. Both branches sit on `bdf810ef`. Every "vs main" comparison below is against
`bdf810ef`, the merge-base. #557 and the drift branch change no file in common (checked with `comm`
over both name lists). A plain `git diff origin/main` in either worktree now also shows #557 in reverse.

---

## Part 1: live drift worktree

Worktree `/private/tmp/raven-wt/drift-2026-11-23`, branch `drift/2026-11-23-scout-and-skills`, 18
modified files, all uncommitted.

### What I confirmed

| Claim | Result | Evidence |
| --- | --- | --- |
| Only `inventory/stellar-light.json` drifted | Confirmed | `git diff bdf810ef --stat -- inventory/` lists that one file |
| Operation surface unchanged | Confirmed | `diff-inventory.mjs surface` exit 0, no lines; manifest has 285 entries before and after, 0 added, 0 removed, same order |
| Class is routing text plus deep contract | Confirmed | `text` exit 1 (2 operations: `getLeaderboard`, `searchResearch`); `deep` exit 1 (`paths identical: false`, `components identical: false`) |
| All 13 Scout exclusions intact | Confirmed | `src/policy/scout-exposure.ts` untouched; all 13 method+path keys are in the inventory under the expected `operationId`, none is in the manifest; manifest Scout operations (29) equal inventory minus exclusions (29); no excluded name or path anywhere in `catalog/manifest.json` or `specs/super-spec.json` |
| No runner `ops` intersection | Confirmed | `RUNNERS` has one runner, three `lumenloop.*` ops, intersection with the 11 changed Scout operations is empty |
| Generated files came from their scripts | Confirmed | In a scratch copy, `build-catalog.mjs`, `build-family-text.mjs`, `build-super-spec.mjs` and `build-op-classes.mjs` all exit 0 and leave `catalog/manifest.json`, `specs/super-spec.json`, `src/mcp/family-text.ts`, `src/policy/corroboration.ts` and `eval/plan/op-classes.json` byte-identical |
| Anchors: Protocol 30 headings | Confirmed | Diff adds `Protocol 30 (Mainnet, November 23, 2026)` and `Protocol 30 (Testnet, November 3, 2026)` plus the numbered `release-notes-20/21` and `software-34/35` ids under `/docs/networks/software-versions`; both headings are on the live page; `test/adapters.test.ts` and both `test/stellar-docs-anchor*` files pass |
| Pin diffs | Confirmed | `diff-pins.mjs` exit 0, 7 files changed (3 `stellar-dev`, 4 `stellar-light`). I also read the raw upstream diffs from clones of both repos at the old and new commits; they match |
| `check-mirrors.mjs --fetch` | exit 0 | `fetched + verified 67 pinned skill files (upstream, cache bypassed)` |
| `check-pin-review.mjs --base origin/main` | exit 0 | `stellar-dev … sel:675d38dc772a [recorded]`, `stellar-light … sel:b1c79b04755e [recorded]` |
| `check-skills-drift.mjs` | exit 0 | All seven sources `ok` |
| `eval/run-routing.mjs --gate` | exit 0 | `GATE PASS`, `committed evidence verified` |
| `eval/gates.json` fingerprints | Confirmed | All four input SHA-256 values match the files; only `baselinedAt`, the manifest SHA, `acceptedTotals.legacy.cardHit5` (114 to 115), `localTrace` and `notes` differ from the base. Thresholds unchanged: legacy 219/293/326 band 1%, skills `minTop1` 17, holdout 12/26/29 with ceiling 11 |
| `eval/self-test.mjs` | exit 0 | `self-test: all checks passed` |
| `npm test` | exit 0 | 175 files passed, 4 skipped; 4173 tests passed, 3 expected fail |
| `npm run typecheck` | exit 0 | |
| `npm run secrets:scan -- --tree` | exit 0 | `no leaks found` |
| `git diff --check` | exit 0 | |

**Routing, per case, base manifest against branch manifest (all 544 rows).** I ran the runner on both
manifests and compared every row's grades, top-five ids and scores by script.

| Lane | Rows | Identical | Grade changes | Top-five list changes | Score-only |
| --- | --- | --- | --- | --- | --- |
| legacy | 338 | 331 | 1 (`q-scf-growth-hack` `cardHit5` false to true) | 4 | 3 |
| extended | 122 | 119 | 0 | 3 | 0 |
| skills | 23 | 22 | 0 | 0 | 1 |
| holdout (counts only) | 49 | 49 | 0 | 0 | 0 |
| protocol history | 12 | 12 | 0 | 0 | 0 |

This matches the author's note exactly: zero losses, legacy `cardHit5` 114 to 115, holdout 12/26/30
with 11 forbidden captures and 24 passed.

**Prompt-input safety of the changed skill text.** I read every added line in the 7 files.

- No instruction override, credential, seed or key request, or unsafe signing instruction.
- No new Raven capability claim.
- No excluded Scout path or operation name on any added line. The 4 selected Scout files, after the
  runtime scrub, contain no excluded path, no excluded operation name and no retired skill id.
- `stellar-dev` `standards/ecosystem.md` adds XOXNO and RedStone entries. The four contract ids are
  valid `C…` strkeys (checksums verified). The XOXNO entry links a third-party `SKILL.md` on a `main`
  branch; the previous pin already carried three links of that kind, so this is not new.
- `references/feedback.md` at the pinned commit carries `side-effects: Writes`, `read-only: false`,
  `opt-in: true` and documents `POST /api/feedback` and `GET /api/feedback`, as the brief says.

**`excludeFiles`.**

- Replaying `selectGitHubSkillFiles` on the upstream tree at `a07d00c4` with the exclusion gives the
  same path, size and blob-sha set as `MANIFEST.json`. Without it, `references/feedback.md` is selected.
- `readSourceDefinitions` rejects a non-array, `SKILL.md`, `..`, an absolute path, a non-`.md` path,
  `""`, `null` and `.MD`.
- The orphan guard throws for a wrong-case path, a `./` prefix, and a list with one stale entry.
- The CLI rejects a non-array, and a failed selection aborts `update.sh` under `set -e`.
- The loop in `update.sh` delivers `["references/feedback.md"]` to `pin_github` for `stellar-light` and
  `[]` for the other four (replayed under `/bin/bash` 3.2), and the variable does not leak past the call.

### Findings

#### S1 (Should-fix). The gate note and the test comment misdescribe the routing change, and leave out a loss the gate cannot see

`eval/gates.json:53` (`evidence.notes`) and `test/drift-141-routing.test.ts:95-98` both say the expanded
`sdf-org` `useWhen` entry "shifted the SCF-Handbook `useWhen` phrase into the 256-token phrase budget".

What actually happens in `extractRoutingPhrases` (`src/catalog/extract-routing-phrases.ts`, the
`if (phrase.tokens.length > remaining) continue;` line): a phrase that does not fit the remaining
budget is dropped whole. Running the function on both inventories:

```
old: uncapped phrases 89 tokens 421; capped phrases 27 tokens 256
  useWhen[4] 33 tok KEPT    sdf canonical organizational pages source org…
  useWhen[5] 27 tok DROPPED funding governance scf v7 award tiers…
new: uncapped phrases 89 tokens 429; capped phrases 30 tokens 256
  useWhen[4] 41 tok DROPPED sdf canonical organizational pages source org…
  useWhen[5] 27 tok KEPT    funding governance scf v7 award tiers…
  keyword phrases newly kept: dev docs | scf handbook | network upgrade
```

So the upstream edit grew the `sdf-org` canonical-pages phrase from 33 to 41 tokens, and that phrase
**fell out** of `scout.searchResearch`'s routing phrases. The room it left admitted the "funding &
governance / SCF program mechanics" `useWhen` phrase and three keyword phrases. The phrase that
entered is not the "SCF-Handbook" phrase; `scf handbook` is one of the three keyword phrases.

The consequence is not in the 544 rows, so "zero losses" is true of the corpus and incomplete as a
description. Probes I wrote for this review, base manifest against branch manifest, rank of
`scout.searchResearch` in the top five:

| Query | Base | Branch |
| --- | --- | --- |
| `SDF board roster` | 2 | absent |
| `SDF quarterly reports index` | 1 | absent |
| `Is SDF a Delaware non-profit?` | 1 | 2 |
| `Does SDF pay taxes or is it self-funded?` | 1 | 1 |
| `SDF 2026 strategy`, `SDF product roadmap`, `SDF service provider directory` | absent | absent |

The first three are topics the dropped phrase names. The last row is the text upstream just added
(sls-117): it gains nothing, because the phrase that carries it is no longer in the manifest.

The +1 `cardHit5` and this loss are the same event. The drift skill asks that a re-baseline be
justified as an intended improvement; this one is a side effect of an eviction.

Suggested reconciliation, for the lead to decide:

1. Correct `eval/gates.json:53` and the test comment to state the eviction and the trade.
2. Decide to absorb or hold with that trade in view. If absorbing, record a TODO for a general repair
   of the whole-phrase drop at the cap (a per-query patch would be the wrong fix).

#### S2 (Should-fix). The replacement probe does not test what its comment says

`test/drift-141-routing.test.ts:97-100` replaces `"SCF community funding"` with
`"List SCF funded projects"` and says it "exercises the product/funding notFor exclusion instead".

It does not. I removed `notFor[0]` (`products exist funding status`) from the branch manifest's
`scout.searchResearch` entry, and separately replaced both exclusions with a dummy:

```
Q: List SCF funded projects
  new                                  research@-
  new -notFor[0] (products/funding)    research@-
  new dummy-exclusion-only             research@-
```

The query is rejected because no routing phrase matches two of its tokens (`funded` does not overlap
`funding` under `tokensOverlap`), which is the same weak-evidence path as the neighbouring
`"How do I deploy a Soroban contract?"`. It passes on the base manifest too, and would keep passing if
the exclusion were deleted.

On the two questions in the brief:

- **Is the stated cause exact?** The effect is right: on the branch all three tokens of
  `SCF community funding` sit in one `searchResearch` phrase, so `hasCoherentRoutingWitness` admits
  it. The mechanism and the phrase name are wrong, as in S1.
- **Does the change loosen a real guard?** No code guard changed. The old probe flips because the
  data changed, and the flip is mild: `scout.searchResearch` enters at rank 5 with score 85 in place
  of `scout.analyzeEcosystem` at the same score. But the list loses its only SCF-vocabulary probe and
  gains one that guards nothing new.

Two queries that the exclusion does decide on the branch manifest, if a real exclusion probe is wanted:

```
Q: SCF handbook funding for existing products
  new research@-    new -notFor[0] research@2
Q: Which products exist for SCF funding and what is their status?
  new research@-    new -notFor[0] research@5
```

Either swap in one of these or correct the comment to say the probe is a weak-evidence case.

#### S3 (Should-fix). Nothing checks that `excludeFiles` reaches the pin, and the default is fail-open

- `ecosystem-skills/update.sh:173` passes the list as an environment prefix, and `update.sh:114` reads
  it as `"${EXCLUDE_FILES_JSON:-[]}"`.
- The wiring test's stub at `test/skill-source-definitions.test.mjs:33` prints only `"$@"`, so it
  never sees the variable. With the prefix on line 173 deleted, `pin_github` receives the default
  for every source (replayed: `stellar-light excludeFiles=<unset>`), and no test fails.
- No offline check compares `MANIFEST.json` with `excludeFiles`. `check-mirrors.mjs`,
  `check-pin-review.mjs` and `check-skills-drift.mjs` do not read the field.

After such a regression the next re-pin would select `references/feedback.md` again. The operations
stay uncallable and the scrub would strip the `/api/feedback` sentences, but the rest of the write
companion would be served, and only the human pin review would stand in the way.

Two small additions close it: have the stub also print `$EXCLUDE_FILES_JSON` and assert it equals each
definition's `excludeFiles ?? []`; and in the existing "preserves every current source's coordinates"
test (`:18`), assert that no manifest file path of a source is in its `excludeFiles`.

#### L1 (Low). Two served sentences point at a file Raven does not mirror

After the scrub, `SKILL.md:263` and `README.md:106` of the Scout skill still name
`references/feedback.md`. Neither contains `/api/feedback` (confirmed), and `PIN-REVIEW.md:62` records
the choice. A model that follows the pointer gets a not-found on an exact-id read. Acceptable as
recorded; no change needed unless the lead wants the sentence scrubbed.

#### L2 (Low). `excludeFiles` semantics are looser than the one use needs

- `scripts/lib/skill-source-definitions.mjs:25-39` accepts `./references/feedback.md`,
  `references//feedback.md` and `references/./feedback.md`. None can match a tree path, so each fails
  only at the next re-pin, not in the daily drift check or the tests.
- In `all` and `pick` modes, `scripts/lib/skill-source-selection.mjs:19` matches the skill-relative
  path, so one entry removes that file from every skill of the source, and the orphan guard is
  satisfied by a single match. This is untested and undocumented (`ecosystem-skills/README.md:23` says
  only "optional `excludeFiles`").
- `update.sh:40` and the `pin_github` header at `update.sh:84` do not mention the new input.

Simplest: allow `excludeFiles` only with `mode: "root"` until another mode needs it.

#### L3 (Low). `baselinedAt` and `localTrace` are a rounded stamp, not a run

`eval/gates.json:4` is `2026-11-23T21:00:00.000Z` and `:52` names
`routing-2026-11-23T21-00-00-000Z.json`. No such trace exists in `eval/results/` (the runs there start
at `21-00-44-049Z`). The previous entry used the real run stamp for both.

#### L4 (Low). The note's list of schema changes is incomplete

`eval/gates.json:53` lists `listContracts`, `hackathonBrief`, `resolveProject`, `getRepoTrust`,
`getStablecoins`, `searchProjects`. The manifest diff also changes `scout.searchRepos` (output schema
and keywords) and re-derives keywords on `scout.scfPitch` and `scout.vetIdea`. The `searchRepos`
change is what moves `q-tool-indexer-repos-discovery` by score (409 to 401).

#### L5 (Low). Records to settle before the commit

- `PIN-REVIEW.md:66` cites `.agents/rounds/2026-11-23-upstream-handoffs.md`. That file is not on the
  branch base. It arrived on `origin/main` with #557 during this review, so merge `origin/main` first
  and the reference resolves. #557 also retires the findings the pin entry cites as fixed
  (`sk-019`, `sk-027`, `sk-028`, `sls-117` to `sls-121`), which still read `reported-upstream` on this branch.
- `PIN-REVIEW.md:55-56` records the independent review before it happened. Replace `fable` with the
  resolved id `claude-fable-5-2`, and add this verdict and report path.

---

## Part 2: dated launcher readiness fix

Worktree `/private/tmp/raven-wt/fix-552-launcher`, branch `fix/2026-11-23-dated-launcher-readiness`,
one uncommitted file: `.agents/rounds/2026-11-16-next-phase/items/1.4/dated/launch-dated-lead.sh`
(+11 −2). Line numbers below are the working file's.

### What I confirmed

| Check | Result |
| --- | --- |
| `bash -n` | exit 0 under bash 3.2.57 (`bash` and `/bin/bash`); `shellcheck -S warning` exit 0 |
| `set -e` and arithmetic | Safe. `:146` and `:149` use `$(( … ))` in assignments, which always return 0. The only `(( … ))` command (`:168`) is an `if` condition, which `set -e` ignores. There is no bare `((attempt++))` |
| `set -u` | `attempt` and `DEADLINE` are set before use |
| Deadline and sleep | With stubbed `date`, `sleep` and status: 25 checks, 5 s apart, ending at 120 s. The message at `:171` ("about 2 minutes") still fits |
| `working` | `SENT=true`, leaves the loop (unchanged) |
| `done` | `fail 75` with the screen; with `RAVEN_DATED_TEST=1`, `SENT=true` (unchanged) |
| `blocked` | Reads the screen and presses the same keys as before, then rechecks 5 s later |
| The stated reason for dropping `hc wait` | Consistent with hc's own help: "Without a launch task, startup idle still counts as stopped" |

Simulation of the new loop (lines 145 to 171, hc stubbed), status sequence to outcome:

```
[live live idle working]     -> OK: SENT after checks=4 elapsed=15s
[idle]                       -> FAIL(75): readiness not established [checks=25 elapsed=120s]
[finished]                   -> FAIL(75): readiness not established [checks=25 elapsed=120s]
[exited]                     -> FAIL(75): exited inside window [checks=1 elapsed=0s]
[done]                       -> FAIL(75): done inside window [checks=1 elapsed=0s]
[blocked blocked working]    -> OK: SENT after checks=3 elapsed=10s
[error]                      -> FAIL(75): readiness not established [checks=25 elapsed=120s]
[done] RAVEN_DATED_TEST=1    -> OK: SENT after checks=1 elapsed=0s
```

The core change, a wall-clock window in place of twelve `hc wait` calls that returned at once, is
correct and safe.

### Findings

#### P2-S1 (Should-fix). The new `exited)` arm never matches

`:150` computes the state as `.status.state // .state`. In hc 0.1.22 those two fields are:

- `.status.state`: `idle`, `working`, `done`, `blocked` or `error` (hc's skill text: "Status comes from
  the program's OSC 7501 reports"), or `.status` is `null`.
- `.state`: `live` or `finished`.

`exited` is a value of a third field, `.reason`. I started a throwaway program under hc
(`sh -c 'exit 3'`), ran the launcher's own expression on it, then removed it:

```
launcher expression on an exited terminal -> 'finished'
{"state":"finished","status":null,"reason":"exited","exit_code":3}
```

So a lead that exits in the start window is logged as `status finished` 25 times and fails at 120 s
with the generic readiness message and no screen dump. That is the behaviour before this change; the
arm at `:158-160` adds nothing. Nothing gets worse, but the fix does not do what it says.

Fix: match `finished)` (or `finished|exited)`). I checked the Mac's hc 0.1.22; confirm the same shape
on agentpc before relying on it.

#### P2-L1 (Low). `error` is not handled

A lead whose status is `error` in the window waits out the full 120 s and fails with the generic
message and no screen. It could share the fail-fast arm.

#### P2-L2 (Low). The deadline is checked only between iterations

`hc get` (`:150`), `hc read` (`:156`, `:159`, `:162`) and `hc keys` (`:164-165`) have no `timeout`,
unlike the `hc send` calls at `:44` and `:52`. A hung hc call holds the loop past 120 s. This was true
before the change.

#### P2-L3 (Low). The comment at `:142-143` names the wrong boot value

Before claude's first status report `.status` is `null`, so the expression falls back to `.state` and
the log shows `live`, not `idle`. Harmless, and the same fallback is why P2-S1 exists.

### After merge

The timer runs the installed copy (`~/.local/share/raven-dated/launch-dated-lead.sh`, per the
script's header), so the fix takes effect only once that copy is replaced on agentpc. A
`RAVEN_DATED_TEST=1 … 1.4 timertest` run there would confirm both the window and the P2-S1 state name.

---

## Evidence and scripts

All in `/private/tmp/claude-501/-private-tmp-raven-wt-drift-2026-11-23/9f492825-6efc-477a-9f9b-1c1c9bf94c85/scratchpad/`
(session scratch; a reboot may clear it):

- `gate-new.txt`, `gate-old.txt`, `ranked-new.json`, `ranked-old.json`: gate runs on both manifests.
- `cmp.mjs`: per-case comparison. `probe.mjs`, `probe2.mjs`: admission probes. `phr.mjs`: phrase budget.
- `pins.diff`: `diff-pins.mjs` output. `up/scout`, `up/devskill`: upstream clones.
- `loop-sim.sh`: launcher loop simulation. `harness/`: `update.sh` loop replay.

Not run: `npm run build`, `npm run test:smoke` (no `src/executor` or `src/demo` change), any live
`execute` against a dev server (no runner affected), any model-calling eval.
