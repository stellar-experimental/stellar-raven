# Review: round item 8.9, lane `flake`

- Reviewer: Antigravity on Claude Opus 5.5 (high effort). This is an independent review: the commit is co-authored by Gemini 4 Neon (Antigravity), and the orchestrator is a different session.
- Target: `git diff origin/main...HEAD` on `np/8.9-flake`, one commit `dbbab42a` ("Stabilize URL-scan linearity test with work counters (round item 8.9)").
- Files changed: `eval/qa/evidence-sanitizer.mjs` (+33/−13) and `test/qa-judge-evidence.test.mjs` (+35/−21).
- Reviewed against: the TODO item "Stabilize the timing-ratio assertion in `test/qa-judge-evidence.test.mjs`" (`.agents/TODO.md:1176`), the lane brief (that one test, plus a scanner hook if counting needs one), and `AGENTS.md`.

## Verdict

**Approve.** There are no High or Medium findings. The change meets the item's "Done when" test: no assertion in that test compares a timed sample now. The hook catches the regression the test exists for, which is the rescan of every overlapping scheme suffix, and it fails loudly if it is not wired up. The findings below are Low or Note. None of them blocks a merge.

## What I verified

| Check | Result |
|---|---|
| Scope of the test file | Only the hunk for `scans failed and userinfo-free URL candidates in bounded linear time` changed (lines 1504–1540). The other timed tests at lines 712, 1582, 1799 and 1819 are untouched, as the TODO item requires. |
| Scope of the sanitizer | The only changes thread an optional `metrics` object through `newRedactionTally`, `sanitizeStructuredStringLeaf`, `emitKeyName`, `redactStructuredEntry`, `redactSensitiveValues` and `consumeUserinfoUrl`, plus the new `recordUrlScan` helper. Redaction logic is unchanged. |
| Worker bytes | The diff touches no `src/`, `catalog/`, `package*.json` or Wrangler config. `src/` mentions `eval/qa` only in a comment (`src/skills/runners/index.ts:11`), so the bundle is unaffected. |
| Callers | Every production caller (`sanitizeBoundedText`, `buildCliEvidence`, `diagnose-stable-evidence.mjs:233,238`) passes one argument, so the hook is reachable only from tests. The `vi.spyOn(...).mockReturnValue` in `test/qa-stable-evidence.test.mjs:182` is unaffected. |
| Fail-closed behaviour | `options` is read inside the existing `try`, so a getter that throws, or a frozen `metrics` object, returns `"[redacted]"`. The probe output is below. |
| Mutation check (scratch copy outside the repo; no repo file was edited) | With `schemeSkipUntil = url.schemeRunEnd` deleted, which restores the quadratic rescan: probes went from 2 to 5,001 (10k) and 20,001 (40k), and scanned characters went from 40,001 to 400,020,001. The new assertions (`probes <= 4`, `large === small`, `chars <= 2n`) fail on the first builder after about 1.7 s, well inside the 5 s timeout. |
| Unhooked or forgotten wiring | If `tally.metrics` stops being passed through, probes stay at 0 and `toBeGreaterThan(0)` fails, and so does `urlScanChars >= 10_000`. The test cannot pass silently in that case. |
| Gates run by the reviewer | `npx vitest run test/qa-judge-evidence.test.mjs test/qa-stable-evidence.test.mjs`: 120 passed. The target test alone took about 113 ms. `npm run eval:selftest` passed. I did not run `npm run typecheck` or `npm run build`: the diff has no TypeScript and no `src/` change, so they gate nothing here. |

Counter values on the current code (scratch probe):

| Input | 10k: probes / chars / length | 40k: probes / chars / length |
|---|---|---|
| `buildFailedCandidate` | 2 / 10,001 / 10,002 | 2 / 40,001 / 40,002 |
| `buildSchemeRun` | 2 / 10,022 / 10,014 | 2 / 40,022 / 40,014 |
| ESC-prefixed failed candidate (runs both variants) | 4 / 20,000 / 10,006 | 4 / 80,000 / 40,006 |

## Findings

### Low 1: the counter covers only `consumeUserinfoUrl`, and it reports its own work

The old test timed the whole of `sanitizeCliEvidenceText`. The new one counts only the work inside `consumeUserinfoUrl`, and the function computes that count by hand (`scannedChars` grows alongside its own loop). Two kinds of regression would still pass this test:

- quadratic work elsewhere in the per-character loop of `redactPlaintextAssignments` on the same `a+a+…` inputs, for example in `scanQuotedIdent`, `scanFlagNameStart` or `scanIdentEnd`, or a rescan that does not go through `consumeUserinfoUrl`;
- new inner-loop work inside `consumeUserinfoUrl` that nobody adds to `scannedChars`.

This loss is partly covered: the test at line 1819 (160,000-byte ReDoS-shaped input) still times the whole function, though with a single-sample 250 ms bound, which is out of scope here. The test's title and the TODO item are both about URL-candidate scanning, and the TODO says "count work … where the scanner allows it", so the narrower guard is acceptable. Optional hardening: also count the outer-loop iterations of `redactPlaintextAssignments` and assert that they stay at most `c·n`. That would make the test an end-to-end linearity check again without a clock.

### Low 2: the `urlScanChars <= largeInput.length * 2` bound is tight for `buildSchemeRun`

A single variant of `buildSchemeRun(40_000)` reports 40,022 characters against a length of 40,014, because the `example.com` tail is scanned twice: once inside the first probe, then again as its own scheme run. Today `chooseSanitizedVariant` runs one variant when stripping changes nothing. A legitimate change that always runs both variants would still be linear, but it would report 80,044 against a bound of 80,028 and fail this test with no real regression. (The ESC probe shows the two-variant case: 80,000 for the failed-candidate shape, just under its bound.) Consider `length * 4`. The probe-count and ratio assertions already catch quadratic behaviour, so the absolute bound only needs to rule out gross blow-ups.

### Low 3: the `qaImplementationSha256` change is not noted

`run-qa.mjs:741-758` hashes every `eval/qa/*.mjs`, and `paired-verdict.mjs:653` requires `qaImplementationSha256` in the expected tuple and matches it across arms. Editing `evidence-sanitizer.mjs` therefore separates QA artifacts produced after this merge from stored ones in paired comparisons. Every eval code change has this effect, and the item needs a scanner hook, so the impact is acceptable. The ledger rows I read show no paired QA run in flight that would straddle the merge. The commit message does not say any of this. The PR body or item report should state it in one line, as the 8.3 review asked for its own change: "eval code change; `qaImplementationSha256` changes; no Worker bytes".

### Note 1: metrics accumulate across calls and across both variants

`??=` seeds only missing fields, so a reused `metrics` object keeps adding up: two calls on `"a+b://x"` gave `{probes: 4, chars: 10}`. When stripping changes the text, both variants' work is counted even though only one output is kept. For counting work that is correct, and the test creates a fresh object per call. The doc comment at line 803 could still say "accumulates; pass a fresh object per measurement".

### Note 2: malformed `metrics` values behave safely but oddly

These are test-only paths, and the fail-closed behaviour holds. For the record:
- A frozen `metrics` object makes the `+=` throw in strict ESM, so the call returns `"[redacted]"`. The hook can change the output, but only by failing closed.
- A non-numeric seed concatenates as a string: `{urlCandidateProbes: "x"}` became `"x11"`.
- A primitive or `null` `options`, or a primitive `metrics`, is ignored and the output is unchanged (`"hello"`).
- A throwing `metrics` getter returns `"[redacted]"`.
- Arrays pass the `typeof === "object"` check and get the fields as properties, which is harmless.

No change needed.

### Note 3: "zero overhead when omitted" is nearly, not exactly, true

With no `metrics`, `recordUrlScan` returns at once, but `consumeUserinfoUrl` still does its `scannedChars` integer adds on every scanned character, and every tally object carries one extra field. The cost is negligible next to the string building in the same loop, and I did not benchmark it. There is no behavioural difference: the output is byte-identical, and the full file's 104 tests pass.

### Note 4: the counter's semantics, which are consistent

The scheme-run length is counted from `start`, the three `://` characters are not counted, a loop terminator character is counted, and `%40` counts as 3 (the loop's 1 plus the explicit `+= 2`). Probe: `"x://u%40h"` gave probes 1 and chars 6 (`x` = 1, then `u%40h` = 5), and the output was redacted to `x://[redacted]@h` as before. Off-by-a-few differences like these cannot hide quadratic behaviour.

### Note 5: `{ timeout: 5_000 }` repeats the default

Vitest 5.1.0's default `testTimeout` is 5,000 ms, and `vitest.config.ts` does not override it. The option does nothing. As a backstop it reads as intentional, so it is harmless, but it can be dropped.

### Note 6: one stale doc line

The module header (`evidence-sanitizer.mjs:18`) still lists `sanitizeCliEvidenceText(text)`. The new function comment at line 803 documents `options.metrics`, so this is cosmetic only.

## AGENTS.md conformance

- **Forward-only:** the change adds an optional parameter with no shim, dual format or deprecation path.
- **Secrets and security boundaries:** no credentials are involved and the sandbox is untouched. Redaction behaviour is unchanged, and the hook keeps fail-closed behaviour.
- **Manifest, exposure and Worker:** not touched.
- **Generated files:** none were touched.
- **Case-text discipline:** the diff touches no corpus or case file. This review opened none and searched only with `rg` on named non-case paths.
- **Tests:** the new test is deterministic, keeps both redaction sentinels (`SCAN_SENTINEL`, `PLUS_SENTINEL`), and adds an identity check that the input comes back unchanged, which is a small gain over the old test.
- **Scope:** only the one test and its scanner changed, so the diff stays inside the lane brief.
