# Round Item 8.9 — Lane `flake` Report

- **Lane:** `flake` (branch `np/8.9-flake`, worktree `/home/tyler/code/raven-wt/np-8.9-flake`)
- **PR:** https://github.com/stellar-experimental/stellar-raven/pull/501
- **TODO item closed:** `Stabilize the timing-ratio assertion in \`test/qa-judge-evidence.test.mjs\`` (`.agents/TODO.md` left untouched per lane rules)
- **Worker bytes:** Unchanged (`git diff origin/main -- src/ package.json package-lock.json wrangler.jsonc` is empty; no deploy required). Note: eval code change (`eval/qa/evidence-sanitizer.mjs`); `qaImplementationSha256` changes, no Worker bytes.

## What changed

1. [`eval/qa/evidence-sanitizer.mjs`](../../../../../../eval/qa/evidence-sanitizer.mjs):
   - Added an optional second parameter `options` (`options.metrics`) to `sanitizeCliEvidenceText(text, options)` that accumulates URL-candidate scan counts (`urlCandidateProbes` and `urlScanChars`) via `newRedactionTally(metrics)`, `recordUrlScan`, `consumeUserinfoUrl`, and `sanitizeStructuredStringLeaf`.
   - `options` is read inside the existing `try` block, preserving fail-closed `"[redacted]"` behavior on hostile inputs and leaving all single-argument callers unchanged.
2. [`test/qa-judge-evidence.test.mjs`](../../../../../../test/qa-judge-evidence.test.mjs):
   - Updated only the flaky test `scans failed and userinfo-free URL candidates in bounded linear time` (lines 1504–1540); all other timed assertions in the file remain untouched.
   - Replaced both single-sample wall-clock assertions (`largeMs < 250` and `largeMs / smallMs < 8`) with deterministic work-counter assertions on `10_000` and `40_000` inputs (`buildFailedCandidate` and `buildSchemeRun`), plus `{ timeout: 5_000 }` and an identity check (`expect(sanitized).toBe(input)`):
     - `small.urlCandidateProbes > 0` and `<= 4` (catches silently unwired counters and quadratic rescanning)
     - `large.urlCandidateProbes === small.urlCandidateProbes` (O(1) probes across 4× size increase)
     - `small.urlScanChars >= 10_000` and `large.urlScanChars >= 40_000` (proves real scan work is measured)
     - `large.urlScanChars <= largeInput.length * 4` (linear absolute bound)
     - `large.urlScanChars / small.urlScanChars < 5` (linear scaling: observed `3.9997` for failed candidate and `3.9934` for scheme run; deleting `schemeSkipUntil` yields `20,001` probes and `400,020,001` scanned chars, ratio `16.0`)
   - Preserved both existing redaction assertions (`PASSWORD=SCAN_SENTINEL` and `token+password=PLUS_SENTINEL`).

## Gates (final reconciled tree, all run bare)

| Gate | Exit code | Result |
|---|---|---|
| `npm run typecheck` | `0` | Clean (`tsc --noEmit`) |
| `npm test` | `0` | 177 files passed, 5 skipped (182); 4,296 tests passed, 3 expected fail, 5 skipped (4,304) |
| `npm run build` | `0` | Clean dry-run Worker bundle (6918.57 KiB / gzip 1375.14 KiB) |
| `npm run eval:selftest` | `0` | All checks passed |
| `npm run eval:qa:lint -- --stale --enforce-floors` | `0` | 0 error(s), 98 warning(s) |
| `npm run eval:qa:register -- --check` | `0` | Up to date |
| `npm run secrets:scan -- --tree` | `0` | Clean across all tracked files |
| Extra gate: 20× `npx vitest run test/qa-judge-evidence.test.mjs` | `0` | **20/20 passed** (`pass=20 fail=0`, 104 tests per run) |
| `git diff origin/main -- src/ package.json package-lock.json wrangler.jsonc` | `0` | Empty (no Worker byte changes) |

## Independent review and reconciliation

- **Review artifact:** [`REVIEW.md`](REVIEW.md)
- **Reviewer:** Antigravity (`agy`), model `claude-opus-5-5`, effort `high` (independent of author Gemini 4 Neon and orchestrator)
- **Status / Verdict:** `SUCCESS` — **Approve** (0 High, 0 Medium, 3 Low, 6 Notes). The reviewer independently verified scope, fail-closed handling, unwired-counter failure, and a scratch mutation test deleting `schemeSkipUntil = url.schemeRunEnd`.

| Item | Disposition | Action / Reason |
|---|---|---|
| Low 1: counter covers only `consumeUserinfoUrl`, not outer plaintext loop | Declined | The test specifically guards the URL-candidate `schemeSkipUntil` optimization; the outer `while` loop advances `index` monotonically on every iteration so counting outer iterations would not catch inner-helper regressions, while `{ timeout: 5_000 }` and line 1819 remain as backstops. Keeping hooks scoped strictly to `consumeUserinfoUrl` minimizes sanitizer instrumentation. |
| Low 2: `urlScanChars <= largeInput.length * 2` is tight if both variants run (`80,044` vs `80,028`) | Accepted | Loosened bound to `largeInput.length * 4` in `test/qa-judge-evidence.test.mjs`. |
| Low 3: `qaImplementationSha256` change not noted in commit message | Accepted | Noted explicitly in the PR body, the reconciliation commit message, and this report ("eval code change; `qaImplementationSha256` changes; no Worker bytes"). |
| Note 1: `options.metrics` accumulates across calls and variants | Accepted | Updated the `sanitizeCliEvidenceText` comment in `eval/qa/evidence-sanitizer.mjs` to note accumulation and passing a fresh object per measurement. |
| Notes 2–4: malformed `metrics`, off-path integer increment, counter semantics | No action | Confirmed safe / fail-closed / consistent by reviewer. |
| Note 5: `{ timeout: 5_000 }` matches Vitest default | Declined | Kept to match the explicit style of `test/qa-judge-evidence.test.mjs:1402` as an intentional backstop. |
| Note 6: module header line 18 lists `sanitizeCliEvidenceText(text)` | Declined | Kept public signature concise in the module header; test-only `options.metrics` is documented directly above the export. |

## Model calls

| CLI | Model ID | Effort | Purpose | Billing |
|---|---|---|---|---|
| `agy` | `claude-opus-5-5` | `high` | Independent code review of `git diff origin/main...HEAD` (`REVIEW.md`, conversation `44636d30-6c39-4dc7-9186-5da85627d851`, status `SUCCESS`) | Subscription (no AI Gateway / API call) |

## Open questions

None.
