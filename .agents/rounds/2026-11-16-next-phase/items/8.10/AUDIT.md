# Item 8.10 audit of item 8.9

Auditor: Claude Fable (`claude-fable-5-2`), agentpc `t20j`, 2026-11-19. Audited `main` at `50418fa3`.
For each lane I read the brief, REPORT, REVIEW and the merged diff, and ran the free checks named
below. The `flush` lane was read from `--stat`, its script and its test only; no deleted file and no
case file was opened, and every check into a case path returned counts.

## Verdicts

| Lane | PR | Verdict | Fixes |
|---|---|---|---|
| register | #499 | good | none (the `usage/README.md` row is a close-out edit) |
| live | #500 | good | none |
| flake | #501 | good | none |
| flush | #502 | good with fixes | F3: one line in `scripts/README.md` |
| cards | #503 | good | none |
| scrub | #504 | good | none; two follow-ups go to the TODO |
| hooks | #505 | good with fixes | F1, F2: Codex wording in `eval/qa/README.md`, and the launch lines |
| tests | #506 | good with fixes | F4: explicit timeouts on two load-sensitive tests; one follow-up goes to the TODO |

Nothing needs rework. No guard was weakened: the manifest exposure tests, the billing and
precondition checks, the secrets handling, the case-text guard and the routing gate evidence all
hold. Three fixes are documentation; the fourth adds a timeout to two tests.

## Checks I ran (all free except one probe)

| Check | Result |
|---|---|
| `npm test` on `main` | exit 0: 173 files passed, 5 skipped; 4165 passed, 3 expected fail, 5 skipped; 20.8 s |
| `npm run eval:routing -- --gate` | GATE PASS; legacy card@5 62.6% of 182 (114), as `eval/gates.json` records |
| Both `test/live/` suites against one local `npm run dev` (port 8791, stopped after) | `run-live-execute.mjs` exit 0 (initialize and 9 of 9), `run-live-spec-search.mjs` exit 0 (5 of 5) |
| Old scrub (`cd9ea54b~1`) against the current one over all 67 pinned skill files | 2 files differ, 65 identical; the two differences are the restored passages below |
| Register copy | `/home/tyler/raven-data/qa/judge-stability.json` hashes to the pin `4322dd4d…f458`; the 25-file manifest hash is `3036a109…2b54`, the lane's value; the `gca-eval` worktree is gone; the backup folder and branch `keep/gca-eval-361ff2ef` exist |
| Citation forms the flush script does not match, over its own scopes, counts only | 0 of the 80 deleted files is named by bare file name or by its path without `.json`; 0 of their 13 folders is cited without a trailing slash, with one, or with a glob |
| Codex hook probe (one model call, see "hooks") | the hook denied `grep -r` and let the control run |
| CI on `main` after each of the eight merges | green |
| CI on this item's branch | one of two runs failed on a test timeout (F4 under "tests") |

## register (#499): good

- Correct. `eval/qa/heldout-read.sh:54` defaults to `/home/tyler/raven-data/qa/judge-stability.json`
  and line 55 keeps the same pin. The copy is byte-identical (table above).
- Complete. The item's "Done when" has three parts: a fixed path outside any worktree, the same pin,
  and the worktree removed. All three hold now that the orchestrator removed `gca-eval`.
- Fit. Four changed lines, two README sentences and one test. The test reads the script source, as
  three other tests in `test/heldout-read.test.mjs` do.
- No live file names `gca-eval` any more except the TODO item being deleted.

## live (#500): good

- Correct. Each of the four failing checks traced to a deliberate contract change, and the lane
  changed no `src/` file. I re-ran both suites on `main`: both pass.
- Case 6 now parses the first line of the result and reads the guards from the parsed object
  (`test/live/run-live-execute.mjs:112-136`), with upstream preconditions first, so an upstream
  failure no longer reads as a guard regression. This is stronger than the check it replaced.
- Cases 8 and 9 moved to `skills.stellar-light.stellar-scout`, the skill `test/skills.test.ts`
  already uses for its oversized read. The scrub lane lengthened that skill by 363 characters, and
  the cases still pass.
- Left as is: case 4 hard-codes 24,000 characters (`run-live-spec-search.mjs:86`), with a comment
  naming where the number comes from. A local server with a raised cap would fail it.

## flake (#501): good

- Correct and complete. The test at `test/qa-judge-evidence.test.mjs:1504-1540` compares no timed
  sample. It counts URL-candidate probes and scanned characters through an optional
  `options.metrics` argument (`eval/qa/evidence-sanitizer.mjs:807-812`).
- The hook is read inside the existing `try`, so a hostile `metrics` object still returns
  `[redacted]`. No production caller passes a second argument.
- Fit. The counter covers `consumeUserinfoUrl` only, which is what the test's title names. The
  whole-function timing test at line 1819 still exists and is outside the item's scope.
- Side effect, correctly recorded by the lane: `qaImplementationSha256` changes, so stored QA
  artifacts from before the merge do not pair with later ones.

## flush (#502): good with fixes

- Correct. The script lists files with `readdirSync`, never opens one, and searches with
  `rg --count-matches` over explicit scopes. It fails closed on a missing scope, a missing round
  folder, or an `rg` error, and it withholds `rg`'s stderr.
- Citation logic (`scripts/find-uncited-golden-round-json.mjs:63-75`). A file is cited when its
  round-relative path appears on token boundaries, or when any ancestor folder is cited with a
  trailing slash. Both rules err toward keeping. The one way to delete a cited file would be a
  citation in a form neither rule matches. I counted those forms for all 80 deleted files and found
  none (table above).
- Complete. 80 removed, 34 kept (30 named, 4 by the `gap/` folder citation). The lane's report
  reconciles these with the TODO's 109, 25 and 84.
- Fit: slightly over-built. Four output modes and eleven tests for a job that ran once. I leave it:
  34 files remain, the invariant test (`test/find-uncited-golden-round-json.test.mjs:80`) is what
  turns a dropped citation into a visible failure, and it costs under two seconds.
- **F3.** No document names the script. A reader who meets that failing test has no pointer to the
  remedy. Add one line to `scripts/README.md`.

## cards (#503): good

- Correct. Rule 4 (`eval/lib/grade.mjs:80-85`) binds a same-service `<noun>_detail` card to
  `get_<noun>` or `get<noun>` by exact name. It cannot reach the holdout lane, which grades with
  `cardMatchesExact`. The lane's reviewer checked every card against every manifest entry: the rule
  adds two pairs (`scout.getHackathon`, `scout.getSkill`) and no other.
- The `eval/gates.json` edit follows the accepted-evidence process: `cardHit5` 113 to 114, the note,
  `baselinedAt` and `localTrace` move in one commit, and the four input fingerprints and every
  threshold are unchanged. The gate reproduces. The gained row is not on
  `eval/routing-qa-overlap.json` (count 0). The ledger entry the `$comment` asks for is a close-out
  edit.
- Complete. `test/routing-card-binding.test.mjs` fails on an unbound card, a missing card list, and
  a case with no catalog card, and its failures carry indexes, never an id or a label.
- Fit. A name rule, not a per-card table, as the item asked. `classifyCardBinding` and
  `findUnboundRoutingCards` live in `grade.mjs` and only the test calls them; that is a matter of
  taste.

## scrub (#504): good

- Correct. `stripTrailingExcludedOrClause` (`src/skills/scrub.ts:180-216`) drops the last top-level
  `or` clause only when the prefix names no excluded path, and returns `null` in every other case,
  which falls back to the old whole-sentence or whole-item removal. The end-of-scrub check at line
  341 is unchanged and still runs last.
- Served text. Two files change and 65 do not. `stellar-scout/SKILL.md` regains step 4 ("Rails and
  partners the demo needs.") with the peg guidance, the partner filters and the "none listed at our
  source" rule, less the `POST /api/partners/match` clause. `references/api-reference.md` regains the
  "**Use when** …" sentence. The match section stays removed.
- Fail-closed. An indented fence now ends list-item collection (line 326), so an excluded path in a
  fence under a bullet throws where `main` used to drop it silently. Tested for a kept and a dropped
  bullet.
- Fit. Round 2 is 65 net lines against round 1's 518. The orchestrator's round-2 note fixed the
  rule's shape; I do not reopen it.
- Follow-ups for the TODO, not fixes:
  1. The lane review's three pre-existing differences between the scrub and the emitted-text guard.
     None can leak, because each fails closed somewhere, but they are two guards on one boundary
     that disagree. One TODO item, to do when either file next changes.
  2. A residual of the round-2 rule. It can change a sentence's meaning: "never call A or B without
     a key" would be served as "never call A". Skill bytes are pinned, so this can only appear at a
     re-pin, and the re-pin procedure reads the upstream diff, not the served sentence. A count of
     narrowed sentences in the corpus test would turn a new narrowing into a test failure. Same TODO
     item.

## hooks (#505): good with fixes

- Correct. One `decide` function serves all four CLIs, so the rules cannot differ between them.
  `parsePayload` maps each CLI's payload, and `formatOutput` writes each CLI's deny shape and empty
  stdout on allow (`scripts/agent-hooks/case-search-guard.mjs:997-1039`). `PROJECT_DIR` comes from
  the script's own location, not from a CLI's environment.
- Parity. Claude Code and Grok guard the shell and grep tools; Antigravity guards `run_command` and
  `grep_search`; Codex guards `Bash` and has no grep tool. A truncated Grok input on a guarded tool
  is denied. A tool-level working directory replaces the session one before the verdict.
- Tests are proportionate: each layer (decision, payload mapping, process, the config's own
  command) catches a different break.
- **F1. The Codex row in `eval/qa/README.md` is wrong.** It says the hook loads only in a folder
  that `~/.codex/config.toml` trusts and that an untrusted worktree skips it, and it calls the Codex
  wiring subprocess-tested. Two live probes say otherwise:
  - the orchestrator's (Mac, `gpt-6.2-sol`, low effort, ChatGPT login): `grep -r` and a positive
    `rg -g '*.json' … eval` denied, the control ran, in the main checkout; `grep -r` denied in a
    fresh detached worktree;
  - mine ([CODEX-PROBE.md](CODEX-PROBE.md); agentpc, Codex 0.169.0, resolved `gpt-6.2-sol`, low
    effort, ChatGPT login, no API key in the environment, the roster launch line plus
    `--dangerously-bypass-hook-trust`, in `/home/tyler/code/raven-wt/np-8.10`, which that config
    does not list): `grep -r HOOK_PROBE_CANARY_810 scripts/agent-hooks` denied with the guard
    message (`rule: recursive grep`), the control `grep -n` exit 0.
  So the flag is what makes Codex run the hook, with or without folder trust. The lane's own probe
  used `codex exec -s read-only` with a rejected `-c` trust override and did not load the hook; I did
  not chase why. The same wrong claim sits in "What the guard does not stop".
- **F2. The flag is missing from the live launch lines.** `.agents/model-roster.md` and
  `briefs/ITEM-LEAD.md` launch Codex without it, so a Codex lane started from either still runs
  unguarded. The five dated lead briefs under `items/1.4/dated/` carry the same line; I leave those
  to the orchestrator (see REPORT.md), because timers launch them and they were rehearsed as written.
- The stale sentences in `AGENTS.md`, `golden-truth`, `.agents/README.md` and the TODO item "Move the
  compiled case files into `eval/qa/compiled/`" ("The case-search hook covers Claude Code only") are
  close-out edits.
- Antigravity needs no flag: the lane's live probe and its reviewer's session both saw denials.
  Grok needs a trusted folder; its probe passed 4 of 4.

## tests (#506): good with fixes

Before the lane: 182 files, 4304 tests, 48.7 s. After it: 176 files, 4150 tests, 18.0 s. `main` now
runs 178 files and 4173 tests in 20.8 s.

- I checked every removal in INVENTORY.md section 4 and both whole-file merges against the named
  guard. Each guard exists and asserts what the inventory says. The ones that sit next to a
  boundary:
  - `test/stellar-org-adapter.test.ts`: the removed `/API`, `/API/search` and `/Api/search` loop is
    covered by the "refuses %s without a request" table (lines 293-325, zero requests asserted), the
    removed redirect case by the redirect table (lines 377-391), and the removed comment and tag
    timing cases by the 1.9 MB suite (lines 591-607).
  - `test/catalog-guards.test.mjs` (the ADR-0003 guards): every must-throw case is unchanged. The 25
    accept-legitimate-prose cases became 5 that set all five `x-routing` fields at once and assert
    that all five reached the builder; a wrongly rejected field still fails. The three notFor cases
    became one with three clauses.
  - `test/qa-harness-preconditions.test.mjs`: 11 of 13 `--flag=value` subprocess checks became an
    in-process table on `assertRunQaCliSyntax`, and 2 subprocess checks remain. `run-qa.mjs:1774`
    calls that one function before anything else, so the table plus two end-to-end checks cover the
    same property. Every billing, subscription, pin and `--ids` check is intact (214 to 215
    `expect` calls).
  - `test/discovery-paid-run-guards.test.mjs`: 40 `expect` calls before and after.
- The speedups dropped no assertion: `expect` counts per file are equal wherever the inventory says
  "zero assertions removed".
- Shortened timers (`qa-postflight-keepalive`, `playground-transport`) cannot create a false
  failure. Both tests pass when every request uses a fresh socket, whatever the timing; a slow
  machine can only make them less sensitive.
- `scripts/run-demo-model-gauntlet.mjs:292-309` clears and unrefs the kill timer. A real fix: the
  script used to hold the event loop for five seconds after every run.
- **F4. The parallelization pushed one test to the edge of its timeout, and it failed once in
  CI.** `test/qa-paired-verdict.test.mjs`, "runs reduced deterministic operating-characteristic
  gates under npm test", does fixed CPU work (5,000 iterations) under vitest's 5,000 ms default
  timeout. CI run 44604472775 on this item's branch failed on it at 5,098 ms; the next run passed
  with no test change. Measured on agentpc (16 cores), three runs each: 1,446 to 1,448 ms alone;
  3,009 to 3,154 ms in the full suite on `cd9ea54b`, the commit before #506; 4,489 to 4,707 ms in the
  full suite after it. The lane made many subprocess tests run concurrently, so this test now runs
  under more load. Three 8.9 lanes had already seen it time out locally while eight lanes shared the
  box, and the lane's review (M1) kept `iterations: 5_000` "at zero wall-clock penalty", which held
  for the suite and not for this test's margin. Fix: an explicit 30,000 ms timeout, which only
  guards against a hang. The next test down on the default timeout,
  `test/find-uncited-golden-round-json.test.mjs` "never leaks file content …" at 3,393 ms in the
  full suite, gets the same. Every other test above 1,500 ms already sets its own timeout or sits
  under a third of the default.
- Fit. Two places where the lane kept more than the task needed, both defensible:
  - It moved the tests of `partialRecoverySource` (one accepting case, twelve rejection branches)
    into `test/diagnostic-rejudge-source.test.mjs`.
    That function and `isHarnessTransportFailure` have one caller, the superseded 2026-11-06
    orchestrator under `research/`, which `npm test` no longer runs. Removing them is a deletion
    decision, so it goes to the TODO.
  - It kept the four env-gated replay files in `test/`. I would not track a move: each file states
    its opt-in command in its header, each skips in `npm test`, and `test/README.md` lists the
    group. Moving them buys nothing.
- The same six-line `execFile` wrapper now appears in eight test files. Taste; left.

## Close-out facts found during the audit

- The note says nine TODO items closed; eight are headed items. The ninth is owner decision 5,
  "Install ripgrep on agentpc": `ripgrep 15.1.0` is at `/usr/bin/rg`, installed by `apt` on
  2026-11-19 18:28 (`/var/log/apt/history.log`), and a plain `bash -c 'command -v rg'` finds it.
- The orchestrator's three TODO candidates: (a) the scrub and guard differences, agreed, one item;
  (b) a home for the env-gated replay files, not agreed, reason above; (c) `partialRecoverySource`
  without a live caller, agreed, one item.

## Fix list for the executor

| Id | File | Change |
|---|---|---|
| F1 | `eval/qa/README.md` | Correct the Codex table row and the Codex clause in "What the guard does not stop" |
| F2 | `.agents/model-roster.md`, `briefs/ITEM-LEAD.md` | Add `--dangerously-bypass-hook-trust` to the Codex launch line, with one sentence saying why |
| F3 | `scripts/README.md` | One line for `find-uncited-golden-round-json.mjs` |
| F4 | `test/qa-paired-verdict.test.mjs`, `test/find-uncited-golden-round-json.test.mjs` | `{ timeout: 30_000 }` on one test in each ([briefs/exec-2.md](briefs/exec-2.md)) |

The close-out edits from the orchestrator's note ride in the same pull request
([briefs/exec.md](briefs/exec.md)).
