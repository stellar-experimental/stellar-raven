# Stale-gospel refresh — O1 and O2 follow-up (Opus 5, pass 2, final)

Reviewer CLI: Claude. Model: Opus 5. Effort: high.
Date: 2026-09-01.
Parent reports:

- `.agents/rounds/2026-09-01-stale-gospel-refresh/review-closure-opus-2.md`
- `.agents/rounds/2026-09-01-stale-gospel-refresh/review-closure-opus-2-delta.md`

Scope: the O1 and O2 follow-up only. No other area is re-reviewed here.

**Verdict: PASS.**

Both observations are closed. The date-trap review path now has a dedicated test that covers
success, one-shot behaviour, an ambiguous match, and the no-write property. The file header now
describes the one-shot rule for every review, not for date traps alone.

## Method

I read two files directly and ran no commands:

- `eval/qa/register-helper.mjs`, header only (lines 1-20)
- `test/qa-register-cli.test.mjs` (222 lines)

Line numbers below are the current line numbers.

## O1 — Date-trap review test. PASS.

`test/qa-register-cli.test.mjs` adds a fourth test at lines 151-220, "applies a date-trap review
once and rejects ambiguous matches". It reaches the trap branch of `applyRegisterReview()`, which
had no coverage before.

### Success. Confirmed.

Lines 186-191 stamp the trap with `--seed`, then apply the review and assert exit 0. The
assertions check all three written fields:

```js
expect(closed.triggerDateEvent).toBe(newTrigger);
expect(closed.disposition).toBe("open");
expect(closed.verdict).toBe("consistent");
```

This exercises `matchTriggerDateEvent` matching at line 157 of the helper. It also exercises the
two review fields that no earlier test wrote, which are `triggerDateEvent` and `disposition`. The
test data mirrors the real change this round made, because the review rewrites the trigger from
`"2026-09-01 review"` to `"2026-12-01 review"`.

I confirmed the trap entry does receive a member hash. `updateRegister()` includes date-trap
entries through `entry.caseIds ?? []`, so the read at line 199,
`closed.memberContentSha256["q-temp"]`, resolves.

### One-shot. Confirmed.

Lines 193-197 re-apply the same review file and assert the trap-specific failure:

```js
expect(repeated.stderr).toContain("expected one match, found 0");
```

This is the correct error for the trap path. The review rewrote its own match key, so the old
trigger text no longer matches. The cluster path reaches its one-shot state by a different route,
which is the `target must be reopened` check, and line 145 already covers that. Both one-shot
causes are now pinned by a test.

### Ambiguous match. Confirmed.

Lines 200-216 write a register with two trap entries that share the old trigger text, then assert:

```js
expect(ambiguous.stderr).toContain("expected one match, found 2");
```

The construction is careful and worth recording. Each duplicated entry carries
`memberContentSha256: { "q-temp": hash }` with the current file hash, and each carries
`verdict: "reopen"` with a `reopened` marker. That combination keeps `knownHashChanged` false, so
the unstamped-reopen guard does not fire first. The test therefore reaches the match-count guard
at helper line 159 and asserts the intended error, not an earlier one.

### No write on failure. Confirmed.

Both failure paths compare the register bytes:

- line 197 against `closedBytes`
- line 216 against `ambiguousBytes`

Both hold. `applyRegisterReview()` throws before `writeFileAtomic()`, and the top-level catch
sets the exit code without writing. The ambiguous case is the stronger of the two, because
`updateRegister()` sets `changed = true` when it grafts the missing `numericInvariants`
collection. The byte comparison proves that a truthy `changed` still produces no write once the
review throws.

### Residual, non-blocking

The trap success block does not assert `closed.reopened` is undefined. The cluster test asserts
that property at line 79, and the same `delete entry.reopened` statement serves both branches, so
the behaviour is covered. Adding the assertion would make the trap test self-contained.

An ambiguous cluster match, at helper line 153, is still untested. The trap branch now covers the
identical guard shape at line 159. This is a small and clearly bounded gap.

## O2 — Header wording. PASS.

The header at lines 6-7 now reads:

```
 * Each review applies once to a reopened entry. Date-trap reviews match the old
 * trigger text and can rewrite that same match key.
```

Both sentences are accurate against the code.

The first sentence states the general rule. `applyReviewFields()` requires
`entry.verdict === "reopen"` with a `reopened` object, and it deletes the marker on success. Every
review is therefore one-shot, for clusters and for date traps alike. My O2 concern was that the
previous wording attributed the one-shot property to the trigger-text rewrite, which could lead a
reader to retry a cluster review. The new wording removes that reading.

The second sentence keeps the trap-specific detail that the match key is also a writable field.
That detail still matters, because it explains why a repeated trap review fails with
`expected one match, found 0` rather than `target must be reopened`.

## Summary

| Observation | Confirmation asked | State |
| --- | --- | --- |
| O1 trap success | Yes | PASS, test lines 186-191 |
| O1 trap one-shot | Yes | PASS, test lines 193-197 |
| O1 trap ambiguous match | Yes | PASS, test lines 200-216 |
| O1 trap no write on failure | Yes | PASS, test lines 197 and 216 |
| O2 header describes all one-shot reviews | Yes | PASS, helper lines 6-7 |

The register-helper `--review` feature is now closed from my side. F1 to F5 were remediated in the
prior pass. O1 and O2 are remediated here. I have no further findings on this code path.

I did not run `npm test`, so I did not observe these tests pass. I traced each assertion against
the helper source by hand, including the guard-ordering questions that decide which error message
each failure produces.

The coverage limits in the parent report still stand. The claim-level truth of the seven golden
refreshes remains unverified by me, and it must come from the three lane matrices and from
`review-final-opus.md`.
