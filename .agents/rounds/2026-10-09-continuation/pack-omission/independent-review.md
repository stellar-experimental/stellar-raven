# Independent review — lane E (stable-row evidence diagnostic and p6 pack-omission analysis)

Reviewer: Claude Fable 5.1 (independent; not the author). Date: 2026-10-09.
Scope: uncommitted `eval/qa/README.md` diff, untracked `eval/qa/diagnose-stable-evidence.mjs` and
`test/qa-stable-evidence.test.mjs`, `tmp/pack-omission-analysis.md`, and the two replay scripts.
I re-derived every claim below. I did not edit tracked files, commit, push, or run a paid command.

## Verdict

**Approve after changes.** The diagnostic is read-only, the protected modules are unchanged, the
tests pass, the replays reproduce exactly, and the mechanism analysis is correct. One classification
gap (finding 1) lets judge-sourced text count as `bounded-support`. Two text corrections follow.

## Findings

### 1. Medium — `bounded-support` can rest on text the candidate never wrote

- File: `eval/qa/diagnose-stable-evidence.mjs:61-74` and `:83`.
- Evidence: the probes come from `verdict.wrongClaims`. A judge claim quotes the golden's figure as
  often as the candidate's claim. The matcher then finds the golden's figure in the transcript.
  Example: `2026-07-27T22-32-31-variantA.json`, row `q-defi-streaming-payments-prior-art`, claim
  "Candidate states SStream is 'not SCF-funded,' directly contradicting the golden's SCF #16 $36K
  Awarded provenance". The diagnostic reports `bounded-support` on the bare term `16`. The saved
  candidate answer contains the phrase "not SCF-funded" and contains no `16` at all. The match
  supports the judge's objection, not the candidate's claim.
- Scale (from my own run over the 200 recognized artifacts): 51 `bounded-support` claims; 38 rest
  on exact terms only; 27 rest on bare numbers or currency amounts only; 2 rest only on terms that
  are absent from the saved candidate answer (the SStream row above and `q-defi-defindex-honest`
  on `USDC/EURC` in `2026-08-04T17-49-53-variantA.json`).
- The lane report names this limit under "Open limits", and the README says a match does not prove
  the claim. The status label and the `boundedSupport` count still present these rows as support.
- Fix (small, general): before matching, keep only probe terms and prose probes that also occur in
  the saved `row.answer`. Report the rest under a separate reason such as `judge-text-only`. This
  needs no change to the protected modules: run `findTranscriptEvidencePackOmissions` once with
  `transcript: [{ tool: "execute", result: row.answer }]` to learn which probes the answer carries,
  or add a small answer-presence filter in the module. Add one test with a judge claim whose only
  matchable term comes from the golden. Optionally split the status into `prose-match` and
  `term-match` so number-only matches are visible in the summary.

### 2. Low — authorization is attributed to the owner, not the orchestrator

- Files: `tmp/pack-omission-analysis.md:9-10`, `tmp/lane-report.md:7` and `:52`.
- Evidence: the review brief states that the orchestrator, not the owner, told the author to
  proceed without the October 1 artifact. Both documents say "The owner confirmed" and "The owner
  authorized".
- Fix: change "owner" to "orchestrator" in those lines before any ledger copy. Keep the owner's
  decision H citation as is.

### 3. Low — one line reference is off by one

- File: `tmp/pack-omission-analysis.md:30`.
- Evidence: the stable-row early return `if (!shouldIncludeTranscriptEvidence(tags)) return "";`
  is `eval/qa/evidence-pack.mjs:1403`, not 1404. All other cited ranges resolve to the named
  functions (99, 192, 236, 261, 292, 412, 424, 451, 585, 688, 740, 845, 948, 1331, 1365, 1385,
  1421-1431, 1433-1479) and `judge.mjs:445` is the stable skip.
- Fix: write 1403.

### 4. Info — `incomplete-evidence` is conservative by design

- File: `eval/qa/diagnose-stable-evidence.mjs:75-79`.
- Evidence: any loss in the row moves an unmatched claim from `no-match-in-saved-evidence` to
  `incomplete-evidence`, even when the loss is an error from an unrelated call. Of 65 such claims,
  52 rows carry truncation and 28 carry error results; 13 carry error results only. The row lists
  the exact lost entries, so a reader can judge relevance. No change required.

### 5. Info — two truncation signals never fire on saved data

- File: `eval/qa/diagnose-stable-evidence.mjs:28-29`.
- Evidence: across 16,929 saved transcript entries, no result contains `[truncated]` and no entry
  has `resultChars` greater than the result length. The `SOURCE BASIS` and `--- TRUNCATED ---`
  markers do fire (1,640 and 40 entries). The extra checks are harmless.

### 6. Nits

- `--help` works only as the sole argument. `--help <file>` reports "Unknown or repeated option".
- The CLI sanitizes the whole JSON report as one string. If the sanitizer returns its redaction
  sentinel, `JSON.parse` throws and the CLI exits 1 with a parse message instead of a report.
- The README example path `eval/qa/results` is gitignored and absent in a fresh clone. The other
  README sections use the same convention, so this is consistent.

## Verified claims

- **Read-only and protected modules.** `git diff --exit-code HEAD -- judge.mjs run-qa.mjs
  re-judge.mjs evidence-pack.mjs` exits 0. The tracked diff is `eval/qa/README.md` only (+25).
  The module writes only to stdout. It imports two exported read-only helpers. `tmp/` is ignored.
- **Judge inputs preserved.** The module never calls `buildTranscriptEvidencePack` or attaches a
  pack. It reads `verdict.wrongClaims` and `transcript` only. Grades, rubric, pack version, and
  saved files are untouched; the CLI records each source SHA-256.
- **Support classification.** Search results, `input`, `isError`, `Execution failed:` results,
  `SOURCE BASIS`, `SOURCE METADATA`, `TRUNCATED`, and console sections are excluded. The body
  split matches the pack's marker constants (`evidence-pack.mjs:14-19`). Execute entries without a
  `result` string occur only in 12 July files and in no stable row, so no evidence is skipped.
  The gap in finding 1 remains.
- **Tests.** `npx vitest run test/qa-stable-evidence.test.mjs` exits 0 (10 tests). They cover
  supported, unsupported, three truncation shapes, missing transcript, missing result, empty
  transcript, exclusion rules, numeric fragments, selection, and the CLI with redaction. The
  exclusion test puts `methodName` only in `input` and in non-execute or error entries, so it
  tests real behavior. The numeric test asserts the weak-match behavior that finding 1 describes.
- **Gates.** `npm run typecheck` exits 0. The CLI over the main checkout's results exits 0.
- **CLI.** Flags, repeated flags, missing `--ids` value, empty ID, missing path, invalid JSON, and
  mixed flag order behave as documented. Missing path exits 1.
- **CLI summary.** My run reproduces the author's counts exactly: 378 files, 200 artifacts, 178
  skipped, 2,888 rows, 794 stable, 133 with claims, 163 claims, 51 bounded-support, 112 uncertain
  (65 incomplete, 38 no-match, 6 no-execute-results, 3 no-probes). Source hashes match.
- **README.** The section is accurate. No sentence exceeds 20 words. It sits before "Re-judge
  stored results" and names the limits.
- **Missing artifact.** `2026-10-01T22-05-47-variantA.json` is absent from the main checkout's
  results directory (350 entries, none dated 2026-10-01). The manifest records its SHA-256 at
  line 19 and `review-result.md:52` records the `pack-omission` status.
- **Replays.** `node tmp/trace-saved-pack.mjs` exits 0 and produces output identical to the
  author's file. Both reproduced p6 hashes equal the stored hashes (`c2a605…7859` and
  `09b8de…9849`). Quantum: phrase in entries 4 and 5, not an extracted term, zero raw snippets,
  absent at 12,000 and 100,000 characters (19,809 produced). Macro: both macros are extracted
  terms; one selected snippet (739 chars) holds `#[derive(UpgradeableMigratable)]` at offset 7
  with anchor `_require_auth` at offset 363; `truncateAroundTerm` at 520 and 260 chars drops the
  macro. I also confirmed that `#[derive(Upgradeable)]` alone yields one snippet, and that the
  two-term window overlap suppresses it. `node tmp/replay-pack-boundary.mjs` exits 0 and is
  deterministic: 14 of 14 dates kept, 9 of 14 prose probes lost at both budgets.
- **Saved omission rows.** I count 11 rows with `evidenceSupportCheck.status: pack-omission`,
  matching `tmp/stored-pack-omissions.json`.
- **Proposed repair.** It is general (serialized-unit coverage, no judge-verdict feedback,
  recheck after each budget cut) and names replayable coverage: the two October 8 rows with
  hashes, the nine other saved rows, `test/fixtures/evidence-pack.mjs` and
  `test/evidence-pack-per-operation.test.mjs` (both exist), and new fixture classes. It keeps the
  p6 A/V exclusion and the 12,000-character limit, and requires a new version and review.

## Required before merge

1. Apply finding 1 (answer-presence gate or split status) with one test.
2. Apply findings 2 and 3 in the `tmp/` documents.

## Delta re-review (fix round)

Reviewer: Claude Fable 5.1. Date: 2026-10-09. Scope: the current diff of
`eval/qa/diagnose-stable-evidence.mjs`, `test/qa-stable-evidence.test.mjs`, `eval/qa/README.md`,
and the "Fix round" section of `tmp/lane-report.md`. I reran every gate and replay named below.

### Verdict

**Approve.** The answer-presence gate is correct and general. The new statuses and counts are
right, and I reproduced them exactly. The two review examples now come out `judge-text-only`. The
tests are real. One low, conservative blind spot remains (delta finding 1); it changes no stored
status and can land as a follow-up or a one-line normalization.

### Gate review (`diagnose-stable-evidence.mjs:61-107`)

- **Mechanism.** The module runs the shared helper once with the saved answer as the only
  "execute" entry. With an empty pack, the helper's `omittedTerms` and `omittedProse` are exactly
  the probes present in the answer. Source matches then pass only when the probe is in that set.
  This reuses the same matcher for both sides, so answer presence and source presence use one
  definition. The gate is not tied to any claim wording, term type, or case.
- **Generality probes I ran.** Currency, URL, date, identifier, and prose probes all gate
  correctly: a probe in both answer and source gives a match; a probe only in the judge text and
  source gives `judge-text-only`; a mixed claim keeps the answer term as `term-match` and lists
  the golden's figures under `excludedMatches`. A non-string answer gives `missing-answer`. A
  partial prose overlap (answer lacks "monthly") stays uncertain.
- **Bounds.** `probeLimitReached` compares the helper's supported counts with its bounded lists,
  so a hidden probe cannot silently become `judge-text-only`. No stored claim reaches the bound.
- **Reason precedence.** `judge-text-only` outranks `incomplete-evidence`. The SStream row has two
  truncated entries and reports `judge-text-only`; `evidenceLosses` still lists both. Acceptable.

### Delta finding 1 — Low: sentence-final punctuation hides answer probes

- File: `eval/qa/diagnose-stable-evidence.mjs:64-67` (inherits `evidence-pack.mjs:1177-1200`).
- Evidence: the helper's date, identifier, and bare-number matchers reject a following `.`
  (lookaheads exclude `.`), which is right for JSON source text but not for prose. The answer
  "Released 2025-09-26." does not count as containing `2025-09-26`; "Use getLedger." does not
  count as containing `getLedger`. Both then report `judge-text-only` although the candidate
  wrote the term. Stored impact: 10 of 256 checked terms are present in the answer by plain text
  but absent from `answerTerms`; one (`dApps`, `q-eco-xbull-wallet`) would move from excluded to
  matched; no claim's status changes. The direction is conservative.
- Fix (optional, general): pad punctuation before probing the answer, for example
  `row.answer.replace(/[.,;:!?)\]]+(?=\s|$)/g, " $&")`, and add one test with a date before a
  period. Or extend the README limit sentence from "typographic variants" to include
  sentence-final punctuation. Either keeps the module read-only and the helper unchanged.

### Verified in this round

- **Gates.** `npm run typecheck` exits 0. `npx vitest run test/qa-stable-evidence.test.mjs`
  exits 0 with 15 tests.
- **Counts.** My CLI run over the main checkout's results matches the fix-round report exactly:
  378 files, 200 artifacts, 794 stable rows, 163 claims; 13 `prose-match`, 35 `term-match`
  (26 number-only), 115 uncertain; reasons 65 incomplete, 38 no-match, 6 no-execute-results,
  3 no-probes, 3 judge-text-only; 7 claims carry `excludedMatches`; 0 reach the probe bound.
- **Review examples.** `q-defi-streaming-payments-prior-art` (`2026-07-27T22-32-31-variantA`)
  reports `uncertain` / `judge-text-only` with `16` excluded from entries 6 and 7 and
  `answerTerms: []`. `q-defi-defindex-honest` (`2026-08-04T17-49-53-variantA`) reports the same
  with `USDC/EURC` excluded. The third, `q-soroban-auth-recursion-dos-audit`
  (`2026-08-28T19-27-08-variantA`), excludes two dates; I confirmed the saved answer writes them
  with U+2011 nonbreaking hyphens and has no ASCII form, so the exclusion is the documented limit.
- **Beans rerun.** `--all-freshness --ids q-live-beans-cross-service-reconcile`: 5 rows, 7
  claims, 1 prose match, 4 term matches (1 number-only), 0 judge-text-only, 2 uncertain.
- **Replays.** `node tmp/trace-saved-pack.mjs` exits 0; both reproduced p6 hashes still equal the
  stored hashes; the diagnostic now reports `prose-match` (quantum) and `term-match` (macro).
- **Tests are real.** The golden-only test asserts `matches: []`, the exact `excludedMatches`
  entry, and the summary counters. The judge-only-prose test keeps the answer term and excludes
  the golden sentence. The missing-answer test deletes `answer` and expects `missing-answer`. The
  help test runs the CLI three ways with other arguments, including a missing path. The sentinel
  test spies the sanitizer and asserts the literal `[redacted]` reaches `console.log`; a failed
  spy would print JSON and fail the assertion. The read-only check remains an unknown-flag probe.
- **README.** The section describes the new statuses, counts, limits, `--help` behavior, and the
  sentinel path accurately. No sentence exceeds 20 words.
- **Document fixes.** Both `tmp/` documents now say "orchestrator" (analysis lines 9-10; report
  lines 8 and 74). The analysis cites line 1403.
- **Protected modules.** `git status` shows only `eval/qa/README.md` modified plus the two new
  files; `judge.mjs`, `run-qa.mjs`, `re-judge.mjs`, and `evidence-pack.mjs` are unchanged.
