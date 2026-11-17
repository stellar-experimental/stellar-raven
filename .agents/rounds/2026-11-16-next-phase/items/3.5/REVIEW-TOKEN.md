# Item 3.5: Fable read of the identifier-token change

Reviewer: Claude Fable 5.2 (`claude-fable-5-2`), agentpc `t1sx`, child of the lead `t1ss`; effort as
set on the launch line. Scope: commit `7925540c` and its evidence under `tmp/3.5/`, per
[briefs/TOKEN-REVIEW-BRIEF.md](briefs/TOKEN-REVIEW-BRIEF.md). Read-only: this file is the only
tracked change; scratch scripts are in `tmp/3.5-token-review/` (git-ignored). I opened no routing
log, nothing under `eval/results/`, no holdout case file, no split and nothing under `gca-eval/`.

No blocking finding. Two should-fix findings, both about what the comment, the commit message and
EXEC.md say the rule accepts; the rule itself is correct for the dates it targets.

## What I confirmed

**1. Routing: the per-case diff is empty, as expected.**

- The token rule cannot reach routing. The import closure of `eval/run-routing.mjs` and
  `src/catalog/search.ts` is 15 files (`node tmp/3.5-token-review/closure.mjs`);
  `src/policy/identifier-token.ts` is not in it. Its one importer is `src/executor/providers.ts:82`.
- The PR does change two files in that closure, both from step 1: `eval/run-routing.mjs` and the
  new `eval/lib/gate-evidence.mjs`. The change moves `gateEvidenceFailures` and its message; it
  touches no ranking or grading line. So "nothing the PR changes reaches the runner" is true of
  step 2 and not literally true of the PR.
- No routing input moved: `git diff --name-only d306a3ca..HEAD -- catalog eval/*.json src/catalog specs`
  lists only `src/catalog/README.md` (step 4).
- `cmp tmp/3.5/base-ranked.json tmp/3.5/head-ranked.json`: byte-identical (SHA-256 `76816c29…e479`,
  495 cases: legacy, extended, skills and protocol-history; `run-routing.mjs:412-417` leaves
  holdout out of the dump).
- `cmp tmp/3.5/base-totals.json tmp/3.5/head-totals.json`: byte-identical. The numbers match
  EXEC.md's table. Holdout, counts only: n 49, top1 12, top3 27, top5 30, cardHit5 30,
  `forbiddenCaptures` 10 (ceiling 10), `passed` 25, before and after.

**2. Replay: byte-identical, and no query's tokens differ.**

- `cmp tmp/3.5/replay-base.json tmp/3.5/replay-head.json`: byte-identical (SHA-256
  `5239b56b…b293`). 98 entries: 89 stored calls from 30 tuning rows and 9 probes. All 98 are `ok`;
  17 carry an exact row; every exact key is a token of its own query.
- Old rule (`git show d306a3ca:src/policy/identifier-token.ts`) against the new one over all 98
  `query` strings (`node tmp/3.5-token-review/replay-tokens.mjs`): **0 queries differ.** 26 queries
  hold a token under both rules.
- There is no date input in the replay. No query holds a digit followed by `-` or `.` at all
  (`replay-inventory.mjs`), so no replay query can reach the new lookbehind. See finding 5.

**3. The rule.**

- Correct for the targeted dates: `10-SEP-2024`, `2024-SEP-10`, `10-SEP-24`, `10.SEP-2024`,
  `10-sep-2024`, `(10-SEP-2024)`, `FY2024-SEP-10` and `Q3-SEP-24` no longer read as `sep-N`
  (`node tmp/3.5-token-review/probes.mjs`).
- Subtractive only. The new rule never reads a token the old one did not: the differential test
  holds over its 129,600 strings, and no later match can start inside a dropped one.
- The spaces had to stay. Four stored replay queries put a digit and a space directly before a
  real standard (`Protocol 19 CAP-40 CAP-21 precondition` and three like it). A rule that also
  treated a space as a join would lose 9 of the replay's 23 exact rows across those four queries.
  Leaving `10 SEP 2024` and `SEP 10, 2024` to read is the right trade, not an oversight.
- The differential test is independent in mechanism. It computes the third class with
  `/\d[-.]$/` on `text.slice(0, match.index)` over the loop 1 regex, not with the lookbehind. It
  restates the same specification, so it checks how the lookbehind behaves inside `matchAll`, and
  the named unit cases check the specification. Mutation check (`node tmp/3.5-token-review/mutate.mjs`,
  the test file run against 11 changed rules in scratch): removing the lookbehind, dash only, dot
  only, adding `/`, adding a space, dropping the digit condition, requiring two or four digits all
  fail. Three of those (any character before the dash, a word character before it, two digits
  required) fail only in the differential test, so that test carries real weight. One non-equivalent
  mutant survives; see finding 4.
- `npx vitest run test/identifier-token.test.ts test/executor-providers.test.ts`: exit 0, 117 tests.

**4. EXEC.md, step 2.** The regex, the 129,600 count (12 × 15 × 5 × 9 × 8 × 2), the 98 entries, the
17 exact rows and the split counts in deviation 1 (79, 80, 81, 86, 87; they match
`.agents/TODO.md:45-50`) are right. Deviation 3 is right: `see-2024` is existing behaviour.

## Findings

### 1. should-fix: "a missed exact mark, never a false one" is said of the dates that still read

`src/policy/identifier-token.ts:15-18` lists the dates that still read and the dropped second
token, then ends "Both are accepted: a missed exact mark, never a false one." The commit message of
`7925540c` and `EXEC.md:138-140` say the same. For the dropped token that is true. For the dates it
is the opposite: `SEP 10, 2024` reads `sep-10`, and a query about that day can still mark
`sep-0010` exact. That is the false mark the deleted TODO item described, kept for the space-joined
shapes. The test comments already separate the two (`test/identifier-token.test.ts:36` and `:41`).

Fix: in the module comment, split the sentence: the still-read dates are an accepted false mark
(the host cannot tell `SEP 10` the date from `SEP 10` the standard, and a number and a space before
a standard is common in real queries); the dropped token is a missed mark, never a false one. Make
the same correction in `EXEC.md:138-140` and state it correctly in the pull request body. The
commit message is unpushed; reword it or leave it and let the PR body carry the correction.

### 2. should-fix: the accepted loss is wider than "a second token after a digit and a hyphen"

`src/policy/identifier-token.ts:16-17`, `PLAN.md:187` and the test name describe the loss as a
second token after a digit and a hyphen (`CAP-46-SEP-45` reads `cap-46`). The rule drops any token
that directly follows a digit and `-` or `.`, and the dropped token can be the only standard in the
query:

| Query | Old | New |
|---|---|---|
| `BLS12-381-CAP-59` | `cap-59` | none |
| `protocol-27-cap-0071` | `protocol-27`, `cap-71` | `protocol-27` |
| `1.SEP-10 2.SEP-24` | `sep-10`, `sep-24` | none |
| `SEP-6.SEP-24` | `sep-6`, `sep-24` | `sep-6` |
| `x402-SEP-10` | `x-402`, `sep-10` | `x-402` |

The first two are this repository's own slug style: the case ids `q-protocol-bls12-381-cap59` and
`q-protocol-27-cap-0071` in `eval/routing-cases.json` lose their CAP token under the new rule
(`probes.mjs`, "CORPUS DIFF"). Measured rate in query text is low: 0 of 98 replay queries hold the
shape, and of 1,168 strings in the routing, skills and protocol-history case files one query text
changes (`SetOptions 2-of-3` loses the junk token `of-3`). I agree with accepting it. The record
should say what was accepted.

Fix: reword the comment to "drops any token that directly follows a digit and a `-` or `.`, even
when it is the only standard named (`BLS12-381-CAP-59` reads nothing; `CAP-46-SEP-45` reads
`cap-46`)", and pin `BLS12-381-CAP-59` reads `[]` beside the `CAP-46-SEP-45` pin. The lead confirms
the wider class is accepted; no rule change.

### 3. nit: `ARCHITECTURE.md:215` states the preceding half backwards

"one to six digits, neither followed nor preceded by a dash or dot and another digit" reads, for
"preceded", as a dash and then a digit before the token. The rule is a digit and then a dash or dot
before the letters. The example (`2024-SEP-10`) rescues it.

Fix: "…and one to six digits; the token is not followed by a dash or dot and a digit, and not
preceded by a digit and a dash or dot (…)".

### 4. nit: three pins would close the gaps the mutation check found

- A comma list has no pin. A rule that also treated `digit,` as a join passes all 8 tests and
  drops `sep-24` from `SEP-6,SEP-24`. Add `SEP-6,SEP-24` reads both, next to `SEP-6/SEP-24`
  (`test/identifier-token.test.ts:28`).
- The pinned space date `10 SEP 2024` reads `sep-2024`, a key no document has. The same shape with
  a two-digit year is the one that can mark a row: `10 SEP 24` reads `sep-24`, and `2024 SEP 10`
  reads `sep-10`. Pin `10 SEP 24` so the accepted false mark is shown with a real key.
- Optional: `x-SEP-10` and `9-SEP-10` as named cases (a word before the dash still reads; one
  digit is enough to drop). Today only the differential test holds them.

### 5. nit: EXEC.md should say what the replay can and cannot show

`EXEC.md:77-82` reports the byte-identical replay, which is true. Because no replay query holds a
digit joined to a token, the two reports would be identical whichever rule produced each, and the
TODO's "byte-identical except for the date inputs" is met with no date inputs. The replay is
evidence of no regression on 98 real calls. The date behaviour rests on the unit and provider
tests alone.

Fix: add one sentence to the replay paragraph: no replay query holds a digit followed by `-` or
`.`, the old and new rules read the same tokens from all 98 queries (this review), and the dates
are covered by unit tests only.

### 6. nit: deviation 1 is sound but under-cited, and the record has two stale lines

- Split v6 is the current split by the repo's own record (`.agents/TODO.md:45-51`, 87 tuning,
  "Tuning scans pass `--split …v6.json`"; `eval/qa/tuning-rows.mjs:9`). Citing that would have
  replaced the trial of v3, v4 and v5. The trials exposed nothing: the count check throws before
  any row is read (`eval/qa/scan-tuning-exposure.mjs:167-168`).
- It does not weaken the TODO's "Done when". The 90 was 81 stored calls from the 79-row v2 split
  plus 9 probes (`.agents/rounds/2026-11-15-tuning-loop-2/KEPT-SET.md:45`); the 98 is 89 stored
  calls from the 87-row split plus the same 9 probes. The exact-row count is 17 in both records
  (`.agents/rounds/2026-11-14-baseline-tuning/TUNE-IMPL-1.md:359`). I did not open a split, so
  "v6 tuning contains v2 tuning" rests on the TODO's account that each version moved cases into
  tuning. Base and head used the same split and results file, so the comparison is like for like.
- `EXEC.md:16` still says "the commit after this file"; it is `34efbb9c`. `EXEC.md:141-143` says
  this review has not run. Update both, and commit `briefs/TOKEN-REVIEW-BRIEF.md` and this file
  (both untracked now).

## Verdict

Pass with no blocking finding: routing and replay are unmoved and the rule is correct for the dates it targets; fix the two wording findings (1 and 2) before the pull request, and take the nits as cheap.
