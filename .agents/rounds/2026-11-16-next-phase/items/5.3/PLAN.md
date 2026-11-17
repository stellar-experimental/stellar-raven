# Item 5.3 plan: QA lint never prints golden text

Lead: Claude Opus 5.5, agentpc `t1v1`. Worktree `/home/tyler/code/raven-wt/np-5.3`, branch
`np/5.3-lint-no-golden-text` from `origin/main` at `5646570d`. Scope: [NOTE.md](NOTE.md) (binding),
starting from [EVAL-FABLE.md](EVAL-FABLE.md). USD 0.

## Decision this changes

Whether a lane may read QA lint output. After this lands, every lint finding names the case id, the
check and a field path with non-text metadata, so lint output (screen, `tail`, CI log, the
`refresh.yml` `stale-gospel.txt` artifact) no longer exposes held-out or reserve golden text, and the
TODO item "Stop QA lint from printing golden text" closes.

## Sites (re-found from source at `5646570d`)

Direct interpolation of judge-facing text into a finding message, `eval/qa/lint-corpus.mjs`:

| Line | Function (also reached from `lintLiveContract`?) | Today | New message |
|---|---|---|---|
| 452 | `lintAvoidPhrases` (no) | avoid item | `golden.avoid[i] <tier> [<labels>]` |
| 496 | `lintGoldenAuthoring` (yes) | key fact | `golden.keyFacts[i] exceeds 90 characters (<n>)` |
| 499 | same | key fact | `golden.keyFacts[i] contains multiple predicates` |
| 503 | same | key fact | `golden.keyFacts[i] negative predicate object is absent from the question; consider moving it to golden.avoid` |
| 507 | same | key fact | `golden.keyFacts[i] requires the golden snapshot date <date>` |
| 514 | same | avoid item | `golden.avoid[i] is a presentation, omission, or phrasing requirement, not a concrete false-content avoid item` |
| 573 | `lintCapFindings` (no) | 140 chars of notes | `golden.notes sentence <n>` or `sentences <n>-<n+1>` (1-based, of the `(?<=[.!?])\s+` split) `(<len> chars): partial cap names no improvements finding` |
| 616 | `lintCorroboration` (yes) | key fact | `golden.keyFacts[i] numeric/version/date keyFact lacks a covering corroboration row` |

Indirect sites that carry a fragment of case text (line 356 also moves here, see the keep list):

| Where | Fragment | Change |
|---|---|---|
| `lint-corpus.mjs:302` `lintSurface` catch, from `assertNoNonExposedRefs` / `assertNoNonExposedRefsInText` | the offending token or excluded path (the eval proposed keeping it) | Keep the guard as the authority, but on a throw re-run it per judge-facing field (`question`, `golden.answer`, `golden.keyFacts[i]`, `golden.avoid[i]`, `golden.notes`) and report `ADR-0003 leak in <field path>: references a non-exposed operation, excluded scout name, or excluded path`. No token. The fixer opens the case anyway, and the field path is exact. Fall back to `ADR-0003 leak in case text` if no single field throws. |
| `eval/qa/compile-qa.mjs:95` `validateCase`, reached by `loadLifecycleLane` (proposed lane, `lint-corpus.mjs:151`) and by every compile | the strkey token | `invalid strkey at <json path> (<reason>)`; the reasons in `strkey.mjs` are fixed strings or numbers. |
| `JSON.parse` of a case file: `lint-corpus.mjs` `json()` (battery, live contract), `loadCasesAtRef` (`git show`), `compile-qa.mjs` `json()` (proposed and retired lanes) | Node 26 quotes the source text in an `Unexpected token` message | Catch `SyntaxError` and rethrow `<repo-relative path>: invalid JSON` plus `line L column C` / `position P` when the message has one, never the quoted source. |

Kept as is, with the reason:

- `numeric` 351, 359 and `corroboration` 604 print register labels and accepted spellings from
  `eval/qa/consistency-register.json`; 359 fires only when no accepted spelling is in the case. Line
  356 is changed (step 2): it fires only when the value is in the case, so printing it confirms case
  text.
- 294 (ids from the case's `surface` array), 151 (`compile-qa.mjs` messages: a path plus a fixed
  string or an echoed enum, once the strkey token is gone), 665 and 669 (`truth.leaf` values),
  694-695 (counts keyed by `tags.service`), and 965 (`printFindings` also prints lane and id).
- Dates (`date-trap`, `stale`, `snapshot-date`), finding ids and statuses (`cap-finding` 576), pattern
  labels (`avoid`), taxonomy leaf ids (`coverage`), ledger ids, lifecycle and live-schema enum values,
  and case ids. Case ids are allowed by NOTE.md.

`printFindings` (965) prints `item.message` only, so the fixes above cover the CLI. `main`'s catch
(1055) prints `error.message`, covered by the JSON rethrow.

## Steps

Order matters (review 6): tests first, against the untouched source.

1. **Tests first.** In `test/qa-corpus-lint.test.mjs`, new
   `describe("QA lint never prints judge-facing text")`. Run that file against the unchanged
   source and record the result per test in `EXEC.md`: every new test must fail there. No stash
   (the stash stack is shared across worktrees). Fixture text in that output is synthetic.
   - Marker `ZQXMARKER` (base32-safe, word-safe) in `question`, `golden.answer`, each
     `golden.keyFacts[i]`, each `golden.avoid[i]` and `golden.notes`, **placed inside the fragment
     each site prints** (review 2): within the first 140 characters of a cap sentence; inside the
     callable token (`scout.ZQXMARKER`); inside an invalid strkey token; as the unexpected token in
     the malformed file (`{"question": ZQXMARKER}`); outside the captured object for the
     negative-predicate check (whose object must also be absent from the question).
   - Trip every text-bearing check, asserted **per check by its phrase**, not per lane: avoid
     (judge-blind and sourcing-guard tiers), non-content avoid, key fact over 90 characters,
     multiple predicates, negative predicate object, snapshot date, numeric key fact without
     corroboration (real-world), partial cap with no finding id in both variants (single sentence,
     and the joined attribution + grade pair), surface leak through the callable-token guard and
     through an excluded name or path beside the marker, numeric `exact contradiction` with the
     marker as the forbidden value, invalid strkey and malformed JSON in the proposed lane through
     `loadLifecycleLane`.
   - **Exact-message assertions** for each changed site, for example
     `golden.keyFacts[0] exceeds 90 characters (104)`. These fail on any leftover text, with or
     without the marker, and are the only assertions that fail on `main` for the excluded-name row.
   - Assert no `finding.message` contains the marker. Same for `lintLiveContract` on a contract built
     from marker cases.
   - **CLI runs** with `spawnSync` (review 1): env clears `CI`, `GITHUB_EVENT_NAME`,
     `GITHUB_BASE_REF`, `GITHUB_BASE_SHA`, `GITHUB_EVENT_PATH`; `QA_REPO_ROOT` is a temp root with
     `catalog/manifest.json` (the fixture manifest) and the marker cases under
     `eval/qa/corpus/battery/<category>/`. Assert positive evidence first: the
     `error(s), ... warning(s)` summary line, a line for each targeted lane tag (`[avoid]`,
     `[key-fact]`, `[snapshot-date]`, `[cap-finding]`, `[corroboration]`, `[surface]`, `[numeric]`,
     `[lifecycle-proposed]`), no `[lint-corpus] ERROR:` crash line; then the marker absent from stdout
     and stderr. A second run on a malformed battery file and a third in live-contract mode
     (`--live-contract <malformed file> --since HEAD`; `json()` throws before git) assert
     `invalid JSON` plus the relative path, and no marker. Do not assert V8 wording or positions:
     CI runs Node 24, this box Node 26 (review 11).
   - `test/qa-strkey.test.mjs:126-128` (review 3): expect
     `invalid strkey at $.golden.answer (CRC16 checksum mismatch)` and `not.stringContaining(broken)`.
   - Existing assertions in `test/qa-corpus-lint.test.mjs` (98, 120, 121, 131, 139, 148, 156, 157)
     match kept phrases; keep them.
2. **`eval/qa/lint-corpus.mjs`.** The eight direct sites (iterate with `.entries()`). Line 573 gets
   character offsets (review 9): `golden.notes sentence <n> (chars <a>-<b>)`, the offsets spanning
   both pieces of a joined pair. Line 356 drops the value (review 7):
   `exact contradiction to <label>: forbidden value <k> of the register entry is present`, `k`
   indexing the list built at 340-344. `lintSurface`: on a throw, re-run the guard per
   judge-facing string field (same `typeof === "string"` filter as `caseText`), emit **one finding
   per field that throws** with the violation class from the guard's fixed phrase and no token
   (review 10); keep the case-text fallback. JSON rethrow in `json()` and `loadCasesAtRef` (946):
   `<repo-relative path>: invalid JSON`, plus position/line/column only from the anchored match
   `/ in JSON at position (\d+)(?: \(line (\d+) column (\d+)\))?$/` (review 11).
3. **`eval/qa/compile-qa.mjs`.** Strkey message `invalid strkey at <json path> (<reason>)`; the same
   JSON rethrow in `json()` (54).
4. **Re-run** the new tests: all pass.
5. `eval/qa/README.md`, near the lint commands (line 32): one sentence of current behaviour, "Lint
   findings name the case id, the check and a field path, never golden or question text."
6. `.agents/TODO.md`: delete "Stop QA lint from printing golden text". The lead adds the ledger row.
7. **Real-corpus count, once, by the executor only** (NOTE.md; review 4, 5, 8). The lead reads the
   script before it runs on the real corpus. The script, in the scratch folder outside the repo:
   - spawns each command itself with stdout and stderr on one file descriptor
     (`stdio: ["ignore", fd, fd]`) into a file under `/tmp` nobody reads, and deletes the file in a
     `finally`. Commands: `node eval/qa/lint-corpus.mjs --stale --enforce-floors`; the
     live-contract command from `ci.yml:102` with `--since origin/main`; `npm run eval:qa:register --
     --check` and `npm run eval:selftest` (the other two `eval/` gates from `CONTRIBUTING.md`, whose
     output is unaudited, so it is treated the same way: exit status only);
   - wraps its body in one `try`; the `catch` prints `script error: <error.name>` only;
   - loads every battery, proposed and live-contract case, and takes as needles each judge-facing
     string under 40 characters whole and every 40-character window of longer ones; tests windows
     against a `Set` of the output's 40-character windows;
   - adds a line-shape check: counts output lines (lint runs only) that do not start with
     `[lint-corpus] ` (npm banner lines excepted), and lines in the changed lanes (`avoid`,
     `key-fact`, `snapshot-date`, `cap-finding`, `corroboration`, `numeric` contradictions, `surface`
     lines with `ADR-0003`, any `invalid strkey` or `invalid JSON`) whose message fails its new
     closed template;
   - prints only integers and check names: each command's exit status, cases loaded per lane, needle
     count, findings by lane, window-leak count split by lane tag, and the two shape counts; exits
     non-zero when cases or needles are 0;
   - is first run once as a positive control on the marker fixture root with a planted 40-character
     window in the output, which must report at least 1.
   Pass: all leak and shape counts 0. Otherwise fix from source and repeat.

The extra integers (cases, needles, per-lane split, shape counts) go past NOTE.md's three printed
items. They are integers and lane names, carry no text or case id, and only make a pass
falsifiable, so the lead adopts them without asking (review 5); the report says so.

## Gates

`npm run typecheck`, `npm test`, `npm run build`, `npm run secrets:scan -- --tree`, run bare. The QA
lint, the register check and the self-test only through step 7. No model-calling command. CI's lint
step: pass or fail from `gh pr checks` only, never its log.

## Stop rule

Done when every new test failed on the untouched source and passes after, the gates pass, and the
step 7 counts are 0. If anyone sees golden text, stop and report the moment, the channel and the case
count, per NOTE.md.

## Risks

- A message change breaks a downstream parser: `refresh.yml:141-144` greps `[stale]`; the `stale`
  message is unchanged. No other consumer parses messages (checked: `ci.yml`, `refresh.yml`, tests).
- The marker test passes vacuously if a fixture fails to trip a check: the per-check "fired"
  assertions guard this.
- The real-corpus count script itself prints text: it prints only integers and lane names; the
  executor writes it to print nothing else and runs it once.
- The per-field ADR-0003 rerun misses a token split across fields: the case-text fallback covers it.

## Needs from the orchestrator or owner

Nothing. No deploy: no Worker bytes change.

## Review reconciliation

[REVIEW.md](REVIEW.md), Claude Fable 5.2, high: 1 blocking, 7 should-fix, 4 nits. All adopted.

| # | Disposition |
|---|---|
| 1 | Adopted: CI env cleared, fixture manifest, positive-evidence assertions (step 1) |
| 2 | Adopted: placement rule, per-check phrases, exact messages, both cap variants, proposed-lane and live-contract malformed runs (step 1) |
| 3 | Adopted: `test/qa-strkey.test.mjs` updated (step 1) |
| 4 | Adopted: line-shape check (step 7) |
| 5 | Adopted: self-spawning script, `try`, counts, per-lane split, positive control, `Set`, lead reads the script. Extra integers adopted without asking the orchestrator (step 7 note) |
| 6 | Adopted: tests first, no stash, every new test must fail on the untouched source |
| 7 | Adopted, preferred option: value dropped, index printed, marker test covers it |
| 8 | Adopted: register check and self-test run inside the step 7 script, exit status only. `register-helper.mjs:228` shares the JSON-snippet channel; it is outside NOTE.md's scope and CI runs it after the lint, which fails first on a malformed case, so it goes to the report, not this diff |
| 9 | Adopted: character offsets |
| 10 | Adopted: one finding per field, string filter, violation class; fallback kept |
| 11 | Adopted: anchored match; tests assert `invalid JSON` and the path only |
| 12 | Adopted: keep list completed |

The reviewer's process note (one recursive `grep -l` printing 18 file names, no content, 0 cases
possibly seen) is recorded; no golden text was seen.
