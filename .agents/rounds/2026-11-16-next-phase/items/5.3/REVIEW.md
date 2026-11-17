# Plan review, item 5.3

Reviewer: Claude Fable 5.2 (`t1v2`), high effort, 2026-11-17. Reviewed [PLAN.md](PLAN.md) against
[NOTE.md](NOTE.md), the source at `5646570d`, and fixture-only probes. USD 0. No repository file
changed except this one.

## Verdict

The site inventory is complete and the message formats are sound. The plan is not ready to execute
as written: the CLI test can pass without linting anything (finding 1). Seven should-fix findings
tighten the tests and the counting procedure. Four nits follow.

| # | Severity | Subject |
|---|---|---|
| 1 | blocking | The CLI test passes on a crash, and in pull-request CI it always crashes before linting |
| 2 | should-fix | The marker only proves a site clean when it sits inside the fragment that site prints |
| 3 | should-fix | `test/qa-strkey.test.mjs:126` asserts the strkey token; the plan expects no broken test |
| 4 | should-fix | The count misses a fragment under 40 characters taken from a longer string |
| 5 | should-fix | The count can pass with zero needles, cannot locate a hit, and its script can print text |
| 6 | should-fix | "Fails on `main`" by stash: shared stash stack, and one failing test satisfies it |
| 7 | should-fix | Keeping line 356 prints a string the lint has just confirmed is in the case text |
| 8 | should-fix | Gates omit two of the three `eval/` commands in `CONTRIBUTING.md:41` |
| 9 | nit | `golden.notes sentence <n>` is hard to count by eye; add character offsets |
| 10 | nit | ADR-0003 rerun: one finding per field, string filter, optional violation class |
| 11 | nit | JSON rethrow: anchor the position match; CI runs Node 24, not 26 |
| 12 | nit | The keep list omits several safe sites |

## What I checked and how

- Read in full: `eval/qa/lint-corpus.mjs`, `eval/qa/compile-qa.mjs`, `eval/qa/strkey.mjs`,
  `eval/qa/lifecycle.mjs`, `scripts/emitted-text-guard.mjs`, `test/qa-corpus-lint.test.mjs`,
  `test/qa-live-contract-lint.test.mjs`. Read the relevant parts of `scripts/build-catalog.mjs`
  (1250-1296), `test/qa-strkey.test.mjs`, `test/qa-lifecycle.test.mjs`, `ci.yml`, `refresh.yml`.
- Ran the lint's exported functions and the CLI on synthetic marker fixtures in my scratch folder,
  with `QA_REPO_ROOT` pointing at a temp fixture root. The real corpus was never linted.
- Not opened: anything under `eval/qa/corpus/`, `cases.json`, `sample.json`, `tool-cases.json`,
  `results/`, `reviewed/`. I also did not open `eval/qa/consistency-register.json`; finding 7 is
  argued from the lint source alone.
- **Process deviation, no golden text seen.** One early command was a recursive
  `grep -l` over the repository for six symbol names. It excluded every directory named `corpus`,
  `results` and `reviewed` and the three compiled files, and `-l` printed file names only. The brief
  says to grep named files only. I saw 18 file names and no file content. Cases possibly seen: 0.
  Every later grep named its files.

## Confirmed correct

- **Direct sites.** The eight lines (452, 496, 499, 503, 507, 514, 573, 616) are all of them. A
  mechanical pass over every `finding(` call that interpolates a value finds no ninth.
- **Console writes.** `lint-corpus.mjs` writes at 965, 968, 1014, 1024, 1028 and 1055 only. The
  imported modules (`strkey.mjs`, `lifecycle.mjs`, `emitted-text-guard.mjs`, `lib.mjs`) write
  nothing and read no corpus file at import time.
- **Thrown errors.** Only two error kinds carry a value from a case: the strkey message
  (`compile-qa.mjs:95`) and a V8 `SyntaxError`. A `TypeError` from a malformed case names the
  source expression, not the value. Git errors carry the command and git's stderr.
- **`lintSurface` line 302** is the single funnel for all five guard messages in
  `emitted-text-guard.mjs:55-105` and `build-catalog.mjs:1284-1294`. Dropping the token is right
  under NOTE.md item 1. The token is open vocabulary: `scout.stellar.buzz` in a key fact makes
  main print `"scout.stellar"`.
- **JSON sites.** `json()` covers lines 138, 152, 996 and the config reads. Line 946 needs its own
  wrap. Line 953 already discards the error. `compile-qa.mjs:54` covers lines 143 and 151.
- **Existing assertions** in `test/qa-corpus-lint.test.mjs` (98, 120, 121, 131, 139, 148, 156, 157)
  all match phrases the new messages keep.
- **`refresh.yml:141-148`** depends on the `[stale]` tag and the exit status only. Both are unchanged.
- No doc or skill quotes an old message format (checked `eval/qa/README.md`, `CONTRIBUTING.md`,
  `eval/EVALS.md`, and the four skills that run the lint).

## Findings

### 1. Blocking: the CLI test passes on a crash, and in PR CI it always crashes before linting

Plan step 3, third bullet, asserts only "marker absent from stdout and stderr, exit status 1".

Evidence, all reproduced on fixtures:

- `lint-corpus.mjs:1009-1018`: with `CI=true` and `GITHUB_EVENT_NAME=pull_request` or
  `GITHUB_BASE_REF` set, and no resolvable base, the CLI prints one `[gospel] no base ref` line and
  exits 1 before any case is loaded. The plan cites the spawn pattern at test line 435, which passes
  `...process.env`. GitHub Actions sets those variables for `npm test` (`ci.yml:86`). The temp
  fixture root is not a git repository, so `ciSinceRef()` (913-931) resolves nothing. Result in a
  probe: status 1, one output line, no marker. The assertions pass and nothing was linted.
- `lint-corpus.mjs:1037`: a fixture root without `catalog/manifest.json` throws `ENOENT` into the
  `main` catch. Status 1, no marker. The assertions pass.

Change to the plan:

- The spawn env clears the CI variables: `CI: ""`, `GITHUB_EVENT_NAME: ""`, `GITHUB_BASE_REF: ""`,
  `GITHUB_BASE_SHA: ""`, `GITHUB_EVENT_PATH: ""`. With those cleared the battery run needs no git.
- The fixture root holds `catalog/manifest.json` (the existing fixture manifest) and the marker
  cases under `eval/qa/corpus/battery/<category>/`.
- The test asserts positive evidence before the marker check: stdout holds the summary line
  `error(s), ... warning(s)`, a line for each targeted lane tag (`[avoid]`, `[key-fact]`,
  `[snapshot-date]`, `[cap-finding]`, `[corroboration]`, `[surface]`, `[lifecycle-proposed]`), and
  stderr holds no `[lint-corpus] ERROR:` crash line.
- The malformed-JSON run asserts stderr or stdout holds `invalid JSON` and the file's relative path.

### 2. Should-fix: the marker only proves a site clean when it sits inside the printed fragment

Four sites print a fragment, so a marker elsewhere in the field never reaches the message, on
`main` or after. Probe results on `main`:

| Site | Fixture | Marker in message on `main` |
|---|---|---|
| 573 | marker after character 140 of the cap sentence | no |
| 573 | a short cap sentence (`Cap it at partial.`) inside longer notes | no; the whole sentence prints |
| 302 | excluded name or qualified name beside the marker (`request_research`) | no; only the name prints |
| JSON | marker more than 10 characters from the unexpected token | no |
| JSON | any error V8 reports by position (`Unterminated string`, `Expected ','`) | no; no source is quoted |
| 503 | marker inside the predicate object, and in the question | no finding fires at all |

The last row follows from `questionContainsObject` (469-473): the marker is in every question, so
an object containing it is "in the question".

Change to the plan:

- State the placement rule per site: inside the first 140 characters of the cap sentence; inside
  the callable token; inside the strkey token; as the unexpected token itself in the malformed
  file (`{"question": ZQXMARKER}` prints the marker on `main`); outside the captured object for 503.
- Add exact-message assertions for the changed sites, for example
  `expect(messages).toContain("golden.keyFacts[0] exceeds 90 characters (104)")`. An exact match
  fails on any leftover text, with or without the marker, and it is the only assertion that can
  fail on `main` for the excluded-name rows.
- Say that "each targeted check fired" is asserted per check by its phrase, not per lane. `key-fact`
  carries three checks, `avoid` two, `corroboration` four.
- Trip both cap variants: a single sentence and the joined pair (563-565).
- Add a function-level case for line 151 with a malformed proposed file, and one CLI run for
  live-contract mode: `--live-contract <malformed file> --since HEAD`. `json()` throws before git
  is called (996), so it needs no repository. The probe confirms `main` prints the marker there.

### 3. Should-fix: an existing test asserts the strkey token

`test/qa-strkey.test.mjs:126-128` expects the message to contain
`` `invalid strkey at $.golden.answer: ${broken}` ``. The plan's new format
(`invalid strkey at <json path> (<reason>)`) breaks it. The plan's step 3 checks only
`test/qa-corpus-lint.test.mjs` and expects no change.

Change to the plan: add `test/qa-strkey.test.mjs` to step 3. New expectation:
`invalid strkey at $.golden.answer (CRC16 checksum mismatch)`, plus `not.stringContaining(broken)`.

### 4. Should-fix: the count misses a fragment under 40 characters taken from a longer string

Step 6 takes strings under 40 characters whole and 40-character windows of longer ones. A printed
piece that is shorter than 40 characters and comes from a longer string matches neither.

Evidence:

- Line 573 prints a whole sentence when it is shorter than 140 characters. `Cap it at partial.` is
  18 characters of a longer `golden.notes`. No needle matches it.
- The ADR-0003 token (`"scout.stellar"`, 13 characters) and the V8 snippet (about 20 characters)
  are in the same class.

On today's corpus the practical loss is small. Those three sites are error lanes that are empty on
a green `main`, and the warn lanes that do fire print whole key facts and avoid items, which the
plan's needles cover. The gap matters for a site nobody listed.

Change to the plan: add a line-shape check to the script, beside the window scan. It counts two
things and prints both as integers:

- output lines that do not start with `[lint-corpus] ` (npm's two banner lines excepted). Leaked
  multi-line text lands here.
- lines in the changed lanes (`avoid`, `key-fact`, `snapshot-date`, `cap-finding`, `corroboration`,
  `surface` lines holding `ADR-0003`, and any line holding `invalid strkey` or `invalid JSON`) whose
  message does not match its new closed template. The templates hold only field paths, integers,
  dates, finding ids, tiers and pattern labels, so any free text fails the match at any length.

Pass requires both counts at 0 and the window count at 0.

### 5. Should-fix: the count can pass with nothing checked, cannot locate a hit, and can print text

- A wrong path or a failed load gives zero cases, zero needles and a leak count of 0. Nothing in
  the printed output distinguishes that from a real pass.
- A count above 0 gives the executor no way to find the site without reading the file. Short whole
  strings can also match by coincidence: line 359 prints accepted spellings, which are strings
  expected to occur in case text.
- The script parses every case file. An uncaught `SyntaxError` prints a source snippet to the
  executor's screen. A shell redirect typed wrong sends the lint output to the screen.

Change to the plan:

- The script spawns both lint commands itself with stdout and stderr on a file descriptor
  (`stdio: ["ignore", fd, fd]`), so no shell redirect exists to get wrong. It deletes the file in a
  `finally`.
- The whole script body sits in one `try`. The `catch` prints `script error: <error.name>` and
  nothing from `error.message`.
- It also prints the number of cases loaded per lane and the number of needles, and exits non-zero
  when either is 0.
- It prints the leak count split by the lane tag of the matching output line. That is still
  integers and check names.
- One positive control before the real run: point the script at the marker fixture root with an
  output file that holds a planted 40-character window. It must report at least 1.
- The lead reads the script before the executor runs it.
- Build a `Set` of every 40-character window of the output file and test case windows against it.
  Per-needle `indexOf` over roughly a million windows is slow for no gain.

NOTE.md says the script "prints only" three things. Case counts, needle counts and a per-lane leak
split are integers and lane names, but they go past that list. Ask the orchestrator to confirm
before the run.

### 6. Should-fix: the "fails on `main`" check

Stop rule: "stashing the source change once and running the new test only".

- The stash stack is shared by every worktree of this repository, and other lanes work in sibling
  worktrees. A bare `git stash` and `git stash pop` can take or lose another lane's entry.
- "The new test fails" is satisfied when one of several new tests fails. Finding 2 lists tests that
  pass on `main` if written naively.

Change to the plan: reorder the steps. Write the tests first (step 3 before steps 1 and 2), run
that file against the untouched source, and record the result per test. Every new test must fail
there. Then make the source change. No stash is needed. Fixture text in the failure output is
synthetic, so reading it is safe.

### 7. Should-fix: keeping line 356 as is

`lint-corpus.mjs:356` fires only when `text.includes(value)` is true, then prints `value`. The
string comes from the register, but the finding states that this case's judge-facing text contains
it. That is a confirmed substring of golden text beside a case id. A marker test that used the
marker as a forbidden value would fail on this line; the plan passes by not tripping the check.

The other register sites are safe: 351 and 604 print a label, and 359 fires when no accepted
spelling is present.

Change to the plan, one of:

- Preferred: drop the value. Print `exact contradiction to <label>: forbidden value <k> of the
  register entry is present`, where `k` indexes the concatenated list built at 340-344. The fixer
  reads the value from the register. Add it to the marker test.
- Or keep it, and state the residual in the plan and the report: a `numeric` error confirms a
  register value inside a named case. Then the test should pin that the message holds the register
  value and no other case text.

### 8. Should-fix: gates

`CONTRIBUTING.md:41` lists three commands for a change under `eval/`: `npm run eval:selftest`,
the QA lint, and `npm run eval:qa:register -- --check`. `AGENTS.md` says to run the matching row.
The plan runs the lint through step 6 and omits the other two.

Change to the plan: add both. `eval/qa/register-helper.mjs` parses case files at line 34 and prints
`error.message` at 228, so it has the same V8 snippet channel on a malformed case. Run it with
output to a file and report the exit status only, or have the step 6 script spawn it the same way.
`npm run eval:selftest` (`eval/self-test.mjs`) I did not audit; treat its output the same way until
someone has.

The stop rule is otherwise runnable once finding 6 is applied.

### 9. Nit: `golden.notes sentence <n>` is hard to act on

The index counts pieces of a `(?<=[.!?])\s+` split. That split breaks after `e.g.`, `vs.` and
`approx.`, so a person counting sentences lands on the wrong one.

Change to the plan: add character offsets, which are exact and carry no text:
`golden.notes sentence 3 (chars 212-298): partial cap names no improvements finding`. For the
joined pair, the offsets span both pieces.

### 10. Nit: the ADR-0003 rerun

- Emit one finding per field that throws. Today only the first leak is reported, so this is a gain.
- Apply the same `typeof part === "string"` filter as `caseText` (110-118).
- The fallback is unreachable in practice: fields are joined with a newline and no guard pattern
  matches across one. It is harmless; keep it.
- Optional, for the fixer: name the violation class without the token, taken from the fixed phrase
  of the guard message (excluded scout operation name, non-exposed operation, excluded scout
  endpoint path, retired-skill reference, excluded lumenloop tool name).

### 11. Nit: the JSON rethrow

- Anchor the position match to the end of the message:
  `/ in JSON at position (\d+)(?: \(line (\d+) column (\d+)\))?$/`. The quoted-snippet form can hold
  the words `at positio…` from the source, and an unanchored match would read digits from case text.
  Probes show the quoted form and the positioned form never occur together.
- The plan says Node 26. CI and `package.json` pin Node 24 (`.nvmrc`, `ci.yml:26`,
  `engines: >=24 <25`); this machine runs 26.13. The tests should assert `invalid JSON` and the
  path, not V8's exact wording or position.

### 12. Nit: the keep list is incomplete

All of these are safe. List them so the inventory reads as complete:

- 294: ids from the case's `surface` array.
- 151: `compile-qa.mjs` messages, which are a path plus a fixed string or an echoed enum value
  (`compile-qa.mjs:101, 109-113`; `lifecycle.mjs:93-110, 183`).
- 665, 669: the case's `truth.leaf` and `truth.secondaryLeaf` values.
- 694-695: counts, keyed by `tags.service`.
- 965: `printFindings` prints the lane and the id as well as the message. Both are non-text.

## Outside the lint path, for the lead

Not in NOTE.md's scope; record or drop as you see fit.

- `test/qa-strkey.test.mjs:113-116` and `test/qa-lifecycle.test.mjs:493` load a real battery case
  into a test. Their current assertions print no case text on failure. A future assertion on the
  case object would.
- `eval/qa/register-helper.mjs:228` is the snippet channel described in finding 8. It runs in CI
  directly after the lint (`ci.yml:98`).
