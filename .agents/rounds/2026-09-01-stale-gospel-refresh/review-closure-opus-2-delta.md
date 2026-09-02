# Stale-gospel refresh — F1 to F5 remediation delta (Opus 5, pass 2)

Reviewer CLI: Claude. Model: Opus 5. Effort: high.
Date: 2026-09-01.
Parent report: `.agents/rounds/2026-09-01-stale-gospel-refresh/review-closure-opus-2.md`.
Scope: the remediation of F1 to F5 only. No other area is re-reviewed here.

**Verdict: PASS.**

All five findings are remediated. Every item I marked "Required" is done. Both items I marked
"Recommended" are done. The "Optional" F3 item is done. Two residual observations follow at the
end. Neither one blocks merge.

## Method

I read two files directly and ran no commands:

- `eval/qa/register-helper.mjs` (210 lines)
- `test/qa-register-cli.test.mjs` (151 lines)

Line numbers below are the post-remediation line numbers.

## F1 — `--review` rejects `--seed`. PASS.

`main()` now rejects both conflicting flags before it reads any file:

```js
if (options.review && options.check) throw new Error("--review cannot be combined with --check");
if (options.review && options.seed) throw new Error("--review cannot be combined with --seed");
```

These sit at lines 182-183, above the register read at line 186. The old in-block `--check`
rejection is removed from the review branch, so the two rejections are now stated together in one
place. The `--seed` bypass I described is closed. The check runs before any parse or hash work, so
a wrong flag pair fails fast.

Line 193 keeps the original guard for the remaining case:

```js
if (result.reopened.length > 0) throw new Error("cannot apply a review while member changes are unstamped");
```

The two-step flow is preserved. The operator stamps hashes in one invocation, then closes in a
second.

## F2 — `--review` requires a reopened target. PASS.

`applyReviewFields()` adds the target check at lines 122-124:

```js
if (entry.verdict !== "reopen" || !entry.reopened || typeof entry.reopened !== "object") {
  throw new Error(`${label}: target must be reopened`);
}
```

The check tests both the verdict and the reopen marker. A review can no longer convert a live
`contradiction` or `tension` entry into `consistent`. A review can no longer re-close an entry
that is already closed.

The check is placed after the unsupported-field allowlist and before the field validation. That
ordering is safe. It reports `target must be reopened` in place of a field error when a review is
both mistargeted and malformed. That is a cosmetic effect only.

I confirmed the check does not break the normal flow. `updateRegister()` sets
`entry.verdict = "reopen"` and `entry.reopened = marker` at lines 101-103 during the stamping run.
The second invocation re-runs `updateRegister()`, finds no changed hash, and leaves both values in
place. `applyReviewFields()` then passes.

## F3 — One-shot trap reviews are documented. PASS.

The file header now carries the warning at lines 6-7:

```
 * Reviewed date-trap closures match the old trigger text. A review that changes
 * that text is intentionally one-shot and cannot be applied again.
```

The statement is accurate for the trap path. It names the cause, which is that
`triggerDateEvent` is both the match key at line 157 and a writable field in `REVIEW_FIELDS` at
line 114. See observation O2 for a wording refinement.

## F4 — `reSwept` is validated by key, not only by shape. PASS.

`applyReviewFields()` adds three key checks at lines 132-140:

```js
if (review.reSwept.date !== review.lastChecked) …
if (typeof review.reSwept.reason !== "string" || !review.reSwept.reason.trim()) …
if (review.reSwept.verdict !== review.verdict) …
```

This closes the gap I reported. An empty `reSwept: {}` is now rejected. An undated re-sweep is
rejected. A re-sweep whose date disagrees with `lastChecked` is rejected. A blank or
whitespace-only reason is rejected. Because line 125 already forces `review.verdict` to
`"consistent"`, the third check also forces `reSwept.verdict` to `"consistent"`. The helper no
longer depends on `eval/qa/lint-corpus.mjs` to catch an empty re-sweep claim.

## F5 — Negative tests exist. PASS.

`test/qa-register-cli.test.mjs` adds a third test, "rejects unsafe reviewed closures without
writing the register", at lines 87-149. It covers seven rejection paths:

| Rejection | Test line | Guard line |
| --- | --- | --- |
| review verdict is not `consistent` | 127 | 125 |
| `clearReopened` is not `true` | 130 | 141 |
| `reSwept` is empty | 133 | 132 |
| `--review` with `--check` | 136 | 182 |
| `--review` with `--seed` | 137 | 183 |
| `--review` with unstamped reopens | 140 | 193 |
| target is not reopened | 145 | 122 |

This meets and exceeds the required set in my parent report, which named the verdict guard, the
`clearReopened` guard, the `--check` conflict, the unstamped-reopen guard, and the new F1
rejection.

Two design choices in the test deserve credit. First, the `rejectWithoutWrite` helper at lines
116-121 asserts the exit status, the error text, and that the register file is byte-identical
after the failure. It therefore pins the no-partial-write property, which is the strongest safety
claim the feature makes. Second, the sequence at lines 139-145 exercises the real operational
order: it dirties a case file to prove the unstamped guard fires, restores it, applies the review
successfully, and then proves the same review cannot be applied twice.

I traced the sequence and it holds. At line 140 the modified case file makes
`updateRegister()` report a reopen, so line 193 throws before `writeFileAtomic()` at line 202. At
line 145 the entry carries `verdict: "consistent"` with no `reopened` marker, so line 122 throws.

## Residual observations

Neither observation blocks merge. Both are new. Neither restates an unmet requirement.

### O1 — The date-trap review path has no test. Severity: medium-low.

`applyRegisterReview()` handles date traps at lines 156-162. No test reaches that branch. Nothing
covers `matchTriggerDateEvent` matching, the `triggerDateEvent` review field, the `disposition`
review field, or a match count other than one at line 153 or line 159.

This matters because the trap branch is the branch this round actually used on the committed
register. The round rewrote a trigger from
`"2026-09-01/2026-11-19 review or any Confidential Tokens Mainnet approval/launch"` to
`"2026-11-19/2026-12-15 review or any Confidential Tokens Mainnet approval/launch"`. The cluster
branch is now well tested and the trap branch is not.

The risk is bounded. Both branches call the same `applyReviewFields()`, which the new test
exercises well. The match-count guards fail closed, and a throw cannot persist a partial write.

Suggested follow-up: extend the new test with one trap entry. Assert one successful trap closure,
one ambiguous match, and that a second application of the same trap review throws
`expected one match, found 0`.

### O2 — The header comment now understates the one-shot scope. Severity: low.

The header at lines 6-7 attributes one-shot behaviour to the trigger-text rewrite. After the F2
fix, every review is one-shot. A cluster review that has been applied leaves the entry with
`verdict: "consistent"` and no `reopened` marker, so a second application throws
`target must be reopened`. The test proves this at line 145.

The current wording can lead a reader to believe a cluster review is safe to retry. Suggested
wording: state that a review applies once to a reopened entry, and add that a trap review also
rewrites its own match key.

## Summary

| Finding | Required or recommended | State |
| --- | --- | --- |
| F1 `--seed` bypass | Required | PASS |
| F2 reopened-target check | Recommended | PASS |
| F3 one-shot trap documentation | Optional | PASS |
| F4 `reSwept` key validation | Recommended | PASS |
| F5 negative tests | Required | PASS |

The remediation is sound and it goes past the minimum I asked for. The F2 and F4 checks in
particular convert two latent risks into hard failures with clear messages. I did not run
`npm test`, so I did not observe the new test pass. The assertions match the guards I read, and I
traced each sequence by hand.

This delta report covers the F1 to F5 remediation only. The coverage limits in the parent report
still stand. In particular, the claim-level truth of the seven golden refreshes remains
unverified by me.
