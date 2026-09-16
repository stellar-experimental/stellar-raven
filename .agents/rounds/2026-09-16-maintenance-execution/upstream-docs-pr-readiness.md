# Upstream Docs PR readiness (semantic/spec)

Reviewer: Grok high (Grok 4.6).
Clock: `2026-09-16T21:13:11Z` (head re-check). First pass `2026-09-16T21:09:42Z`.
Mode: read-only. No approve, merge, comment, push, or edit.
Merged code is not deployed/indexed truth.

## Branch rules (parent-measured on `main`)

Classic `branch-protection` endpoint: **404**. Active `/rules/branches/main`:

- `required_approving_review_count`: **1**
- `require_extra_approval_for_unattributed_changes`: **true**
- `require_code_owner_review`: **false**
- `required_linear_history`: **true**

User: `push: true`, `maintain`/`admin`: **false**. Cannot override the rule.

`CONTRIBUTING.md` Review Process: maintainer approval; CI must pass prettier, full site build, and route-removal check.

`xw-dd` `APPROVED` (“Auto-approved: raven label”) is not a docs maintainer review. Extra approval for unattributed changes can still require a second human after Copilot/bot-authored hunks. Linear history forbids merge commits; squash/rebase is the usual path (parent lane).

## Summary

| PR | Head | Files | Raven finding | CI | Spec at HEAD | Author action | Remaining merge gate |
|---|---|---|---|---|---|---|---|
| [#2837](https://github.com/stellar/stellar-docs/pull/2837) | `3855b52ed4933d3ad50fab6d546675f66f0fe76f` | **10**, including deleted `static/assets/guestbook/mercury_token.png` | `sd-027` / #2700 | 10/10 success | LaunchTube vs Mercury split holds. Four Copilot threads still match this head. | **Author hold still in body** plus four live Copilot nits | **REVIEW_REQUIRED**. Do not merge on green CI while the hold remains. |
| [#2844](https://github.com/stellar/stellar-docs/pull/2844) | `1e67426a49b7152f45c6ee559e964fc2f0cda1d9` | **2** MDX | `sd-046` / #2842 | 10/10 success | CAP-0038 / `computeMultiplier` facts correct | Yes: ElliotFriend wording | **REVIEW_REQUIRED**. No requested reviewer listed. |

Neither PR is merged. Neither is live on `developers.stellar.org`. Do not move findings to `fixed-upstream`.

This lane does not publish. User has push permission; parent has not authorized external publication.

## PR 2844 — pool-share two-reserve (`sd-046`)

**The reserve fact and the claimable-balance arithmetic in the PR body are spec-correct. The PR is not merge-ready.**

Body (head `1e67426a`) states: a pool share trustline counts as two subentries and needs two base reserves; CAP-0038 and `computeMultiplier` return 2 for `ASSET_TYPE_POOL_SHARE`; `calculateDelta` adds 2 toward the 1,000 cap. Second commit: one claimant is 0.5 XLM, example total **3 XLM** not 3.5 XLM, citing the Claimable Balances guide and `claimants.size()`. Independent CAP-0038 and `SponsorshipUtils.cpp` reads match that body.

Hunks (2 files):

- `lumens.mdx`: adds that a pool share trustline counts as two subentries / two base reserves and links `#trustlines`. Fixes the example: one claimant is 0.5 XLM, total **3 XLM** not 3.5 XLM.
- `accounts.mdx`: splits trustline bullets (traditional = one subentry, pool share = two) and repeats the two-reserve / two-of-1000-cap sentence.

Pinned spec (independent fetch, 2026-09-16):

- CAP-0038: “The pool share trust line should count as two subentries (and therefore require two base reserves).”
- `stellar-core` `SponsorshipUtils.cpp` `computeMultiplier`: `ASSET_TYPE_POOL_SHARE` trustline returns `2`, other trustlines `1`; `CLAIMABLE_BALANCE` returns `claimants.size()`.

Those facts match the finding recommendation. The arithmetic fix is in-scope for the same section and is spec-correct.

**Author action (blocks a clean review):** four review threads remain **unresolved**. Copilot asked to drop “the one exception” without an antecedent. ElliotFriend **agreed** on both pages and supplied replacement paragraphs. Current head still uses “the one exception” / “exception to the rule above” while the bullets already say “(two subentries each)”. That is a semantic defect in the *wording*, not in CAP-0038.

ElliotFriend’s issue comment (2026-09-15) says the PR is still good for the reserve fact and filed Hubble/sponsorship follow-up **#2860** as out of scope. That does not resolve the in-thread suggestions.

**Exact remaining gate:** GitHub `REVIEW_REQUIRED` (`mergeable_state: blocked`). CI is green. `xw-dd` `APPROVED` (“Auto-approved: raven label”) did not clear it. Author should apply the maintainer wording, then a required human review can pass.

Do not treat preview `developers-pr-2844.previews.kube001.services.stellar-ops.com` as production Docs.

## PR 2837 — Guestbook / LaunchTube (`sd-027`)

**Not technically ready to merge.** CI is green. `REVIEW_REQUIRED` still blocks. Re-read of head `3855b52e` (not comment dates) keeps four Copilot defects. The PR-body freeze about passkey-kit 0.11.1 is **stale** and is not a current template defect.

Maps to `sd-027` and issue **#2700** (OPEN). 10 files, including deleted `mercury_token.png` (asset, not a docs route; route-removal CI already passed).

### Copilot threads vs this head

**Author hold (still in force):**

Current PR body (SHA-256 `d09c20a7552a0aabd79f3edc19a0df73484701aa208fd50e070bb59996102b13`, read 2026-09-16T21:16:30Z) still contains **Please do not merge yet**. It still says the companion template ships `passkey-kit ^0.11.1`, Launchtube, Mercury, and a funder secret, and “this stays in draft until that lands.” `draft` on the GitHub object is **false**. Head SHA is unchanged `3855b52e`. `updated_at` 2026-09-15T18:40:30Z (`xw-dd` auto-approve). There is **no later ElliotFriend comment** that releases the hold. Issue comments after open are only preview-bot URLs.

Treat the hold as an **author reconcile gate**, not as permission to merge because checks pass.

**Template bytes now (do not confuse with the hold text):**

`https://raw.githubusercontent.com/ElliotFriend/stellar-template-sveltekit-passkeys/main/package.json` SHA-256 `ac0f0ff8b78d3f903b8a12ee7495d5626846b3b43f8d06ab9441df10fed9e4f8`. Dependencies include `smart-account-kit: ^0.8.0`. No `passkey-kit`. `ye-olde-guestbook` main also has `smart-account-kit: ^0.8.0`. The hold paragraph is **stale relative to those bytes**. The author has not rewritten the body to match. Reconcile: update the template claim, drop or keep the hold explicitly, then a maintainer can review.

**No longer current as code defects (do not treat as live HEAD bugs):**

- Origin `includes()` bypass — author switched to exact equality; thread resolved.
- `{ params }` wrapper — author explained Channels HTTP vs SDK; thread resolved.

**Still current at `3855b52e`:**

1. **Unscoped audit.** overview L56: “the audited contract framework”. prerequisites L8: “deploys an audited OpenZeppelin Smart Account”. smart-wallets L45: “audited, modular smart account framework”. No artifact, Wasm hash, release, or audit URL. #2700 still requires that scope. Copilot threads on those lines remain unresolved.
2. **RPC 200-key cap.** frontend.mdx `getAllMessages` still builds keys from 2..`totalCount` and one `rpc.getLedgerEntries(...ledgerKeysArray)`. Unresolved Copilot thread. Spec cap is 200 keys.
3. **`PRIVATE_` as SvelteKit convention.** prerequisites L30 still says `PRIVATE_` and `PUBLIC_` prefixes are a SvelteKit convention and that `PRIVATE_` is only readable server-side. Copilot is right that only the public prefix is special by default. Unresolved.
4. **Cancelled toast.** setup-passkeys L150 still says a cancelled prompt “shows a gentle Cancelled toast”. frontend callers at HEAD do `if (userDismissedPasskey(err)) return;` with no `Cancelled` string in that file. Unresolved.

### Remaining merge gate

`required_approving_review_count=1` plus extra approval for unattributed changes. Maintainer approval per CONTRIBUTING. `kaankacar` is still a requested reviewer. `xw-dd` auto-approve does not satisfy that. Linear history: no merge commit.

Author should fix the four live threads (or explicitly decline with spec). Updating the stale PR-body freeze is editorial, not a template-alignment blocker.

Not deployed. Live Docs can still show LaunchTube until merge **and** site deploy.

## Author-action list (this lane)

2837:

1. Scope or remove “audited” claims still present at `3855b52e`.
2. Page `getLedgerEntries` at 200 keys (still unbounded at this head).
3. Fix or drop the Cancelled-toast sentence; callers still `return` without that toast.
4. Fix the `PRIVATE_` SvelteKit-convention sentence.
5. Release or rewrite the **Please do not merge yet** hold after the template claim matches current `package.json` (`smart-account-kit ^0.8.0`, not passkey-kit 0.11.1). No later author comment has released that hold.
6. Required: one maintainer approval. Extra approval may apply for unattributed Copilot/bot hunks. Do not treat `xw-dd` auto-approve as that review. Do not merge on green CI while the hold text remains.

2844:

1. Apply ElliotFriend’s two suggested paragraphs (or equivalent that states the multiplier without “exception to a rule that already contains the exception”).
2. Then required human review. `xw-dd` auto-approve is not sufficient.

No comments, pushes, or approvals from this lane.
