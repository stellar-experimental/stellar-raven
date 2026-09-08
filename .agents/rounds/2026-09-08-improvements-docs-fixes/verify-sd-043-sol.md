# Independent verification of `sd-043`

## Result

PR [`stellar/stellar-docs#2806`](https://github.com/stellar/stellar-docs/pull/2806) fully resolves the upstream defect in `sd-043`.

The corrected source is on `main`.
The corrected source is also deployed on both affected pages.
The live pages now match the current `stellar-core` calculations.

`sd-043` qualifies for `fixed-upstream` as of 2026-09-08T15:50:03Z.
Local golden and lifecycle cleanup still remains.

## Observation scope

I performed this review on 2026-09-08.
The final browser check ran from 2026-09-08T15:50:00Z through 2026-09-08T15:50:03Z.
The branch-head check ran at 2026-09-08T15:52:24Z.

I read these records directly:

- Active finding: `improvements/stellar-docs/sd-043-sponsored-reserves-min-balance-liabilities.md`
- Upstream issue: https://github.com/stellar/stellar-docs/issues/2771
- Merged PR: https://github.com/stellar/stellar-docs/pull/2806
- Current Docs source at `main`
- Current `stellar-core` source at `master`
- The rendered Sponsored Reserves page
- The rendered Lumens page
- Adjacent Accounts, Liquidity Pools, and operation-reference content
- All repository matches for `sd-043`

I used an isolated Chromium session for the rendered-page checks.
I did not accept the merged state as deployment proof.

## Source classes

| Class | Meaning |
| --- | --- |
| A | A deployed, first-party Stellar Docs page |
| B | The canonical `stellar-core` implementation |
| C | The upstream Docs source, PR, commit, issue, or CI record |
| D | A local Raven finding, golden, generated file, or repository reference |

## Upstream identities and state

### PR `#2806`

The PR title is `fix: correct ledger cadence, minimum balance formula, and Horizon status`.
GitHub user `ElliotFriend` authored the PR.
The account has the `MEMBER` association.
The profile name is Elliot Voris.
The profile URL is https://github.com/ElliotFriend.

The PR merged at 2026-09-08T15:05:25Z.
`ElliotFriend` merged it.
The merge commit is [`ad0accbd0da545ccba12b5a01fd5dc9e387977f8`](https://github.com/stellar/stellar-docs/commit/ad0accbd0da545ccba12b5a01fd5dc9e387977f8).
The final PR head is `2632c7a3681cb964ae7612325f085d1eacfa8b0d`.
The PR base was `d2f5cd7ba07a685821b8ebef80f520134686c9d4`.

The relevant PR commits are:

- [`42fd530db562754a32699f9409a75817d64f0c18`](https://github.com/stellar/stellar-docs/commit/42fd530db562754a32699f9409a75817d64f0c18)
- [`e3deb9dc1aa4d94f2e7d10a72f94ce93f7fd2934`](https://github.com/stellar/stellar-docs/commit/e3deb9dc1aa4d94f2e7d10a72f94ce93f7fd2934)
- [`2632c7a3681cb964ae7612325f085d1eacfa8b0d`](https://github.com/stellar/stellar-docs/commit/2632c7a3681cb964ae7612325f085d1eacfa8b0d)

The final head changes four files.
The two `sd-043` files have these blob identities:

| File | Blob ID | Exact PR-head source |
| --- | --- | --- |
| `docs/build/guides/transactions/sponsored-reserves.mdx` | `88c483bfcb0f1c1e9cc70e761bfeb2f6a24dc462` | https://github.com/stellar/stellar-docs/blob/2632c7a3681cb964ae7612325f085d1eacfa8b0d/docs/build/guides/transactions/sponsored-reserves.mdx#L60-L64 |
| `docs/learn/fundamentals/lumens.mdx` | `2b1c367995f57654f301aced586f6430b8fbb275` | https://github.com/stellar/stellar-docs/blob/2632c7a3681cb964ae7612325f085d1eacfa8b0d/docs/learn/fundamentals/lumens.mdx#L28-L40 |

All reported PR checks passed.
The build, format, analysis, CodeQL, preview, and completion checks passed.

### Issue `#2771`

Issue [`#2771`](https://github.com/stellar/stellar-docs/issues/2771) opened at 2026-08-19T20:36:59Z.
GitHub user `kalepail` opened it.
The account has the `MEMBER` association.
The profile name is Tyler van der Hoeven.
The profile URL is https://github.com/kalepail.

The issue asks for three exact changes:

1. Remove `+ liabilities.selling` from the minimum-balance formula.
2. Add the separate available-balance identity.
3. State the same split on the Lumens page.

The issue closed as `completed` at 2026-09-08T15:05:26Z.
`ElliotFriend` closed it after the PR merge.

### Cited issue comment

I cite one issue comment.

- URL: https://github.com/stellar/stellar-docs/issues/2771#issuecomment-5587808957
- Author: Elliot Voris, GitHub login `ElliotFriend`
- Author association: `MEMBER`
- Company on the profile: `@stellar`
- Created: 2026-09-08T15:40:22Z
- Updated: 2026-09-08T15:40:22Z

The author reports a successful deploy at 2026-09-08T15:10:43Z.
The author reports corrected live content at 2026-09-08T15:37:28Z.
This statement is a maintainer report.
The independent browser result below supplies the deployment proof.

## Current source identities

At 2026-09-08T15:52:24Z, `stellar-docs/main` was:

`83b4612d6b8d63d7c2e2dc28b69524783fa40848`

Exact commit URL:

https://github.com/stellar/stellar-docs/commit/83b4612d6b8d63d7c2e2dc28b69524783fa40848

Both affected files still use the PR blobs at this newer `main` commit.

| File | Current blob | Exact current source |
| --- | --- | --- |
| Sponsored Reserves | `88c483bfcb0f1c1e9cc70e761bfeb2f6a24dc462` | https://github.com/stellar/stellar-docs/blob/83b4612d6b8d63d7c2e2dc28b69524783fa40848/docs/build/guides/transactions/sponsored-reserves.mdx#L60-L64 |
| Lumens | `2b1c367995f57654f301aced586f6430b8fbb275` | https://github.com/stellar/stellar-docs/blob/83b4612d6b8d63d7c2e2dc28b69524783fa40848/docs/learn/fundamentals/lumens.mdx#L28-L40 |

At the same time, `stellar-core/master` was:

`7e64393b61808fd498ae13317e0cf9cdc0a0c018`

Exact commit URL:

https://github.com/stellar/stellar-core/commit/7e64393b61808fd498ae13317e0cf9cdc0a0c018

`src/transactions/TransactionUtils.cpp` has blob ID `94fdffd958d3e6e8d1c762550f575100a97698c0`.

Exact source URLs:

- https://github.com/stellar/stellar-core/blob/7e64393b61808fd498ae13317e0cf9cdc0a0c018/src/transactions/TransactionUtils.cpp#L752-L778
- https://github.com/stellar/stellar-core/blob/7e64393b61808fd498ae13317e0cf9cdc0a0c018/src/transactions/TransactionUtils.cpp#L871-L912
- https://api.github.com/repos/stellar/stellar-core/git/blobs/94fdffd958d3e6e8d1c762550f575100a97698c0

## Formula re-derivation from `stellar-core`

### Minimum balance

`getMinBalance(header, acc)` starts both sponsorship counters at zero.
It reads both counters for protocol V14 and later.
It reads them only when the account has extension V2.

The second overload creates `effEntries` from these steps:

1. Start with `2`.
2. Add `numSubentries`.
3. Add `numSponsoring`.
4. Subtract `numSponsored`.
5. Reject a negative result.
6. Multiply the result by `baseReserve`.

Therefore, the current sponsorship-aware formula is:

`minimumBalance = (2 + numSubEntries + numSponsoring - numSponsored) * baseReserve`

The function has no liabilities term.
Before protocol V9, the source returns `(2 + numSubentries) * baseReserve`.
From V9 through V13, the sponsorship counters must remain zero.
From V14 onward, the function uses the sponsorship-aware expression.

### Available balance

For an account, `getAvailableBalance` first computes this value:

`balance - getMinBalance(header, account)`

For protocol V10 and later, it then subtracts `getSellingLiabilities(header, account)`.

Therefore, the current account formula is:

`availableBalance = balance - minimumBalance - sellingLiabilities`

Selling liabilities reduce spendable XLM.
They do not increase the minimum balance.

For a trustline, the function starts with the trustline balance.
It then subtracts selling liabilities from protocol V10 onward.
The Docs correction concerns the account formula.

## Claim matrix

| Claim | Evidence | Classes | Result |
| --- | --- | --- | --- |
| The old Docs formula was wrong. | Active `sd-043`, issue `#2771`, and current Core functions | B, C, D | Confirmed |
| Core excludes liabilities from minimum balance. | `TransactionUtils.cpp` lines 871-912 at `7e64393b` | B | Confirmed |
| Core subtracts selling liabilities from available balance. | `TransactionUtils.cpp` lines 752-778 at `7e64393b` | B | Confirmed from V10 |
| The PR removes the wrong term. | PR diff and blob `88c483bf` | C | Confirmed |
| The PR fixes the dimensional `2 base reserves` wording. | PR diff and blob `88c483bf` | C | Confirmed; the formula starts with `2` |
| The PR adds the separate available-balance identity. | Both changed Docs blobs | C | Confirmed |
| The Lumens page now states the same split. | Blob `2b1c3679` and the rendered page | A, C | Confirmed |
| The changed source remains on current `main`. | `main` commit `83b4612d`; both PR blobs remain present | C | Confirmed |
| The Sponsored Reserves fix is deployed. | Timed rendered-page check at 2026-09-08T15:50:00Z | A | Confirmed |
| The Lumens fix is deployed. | Timed rendered-page check at 2026-09-08T15:50:03Z | A | Confirmed |
| A direct liabilities-formula conflict remains elsewhere in Docs. | Current source-wide phrase scan | A, C | Not found |
| A separate pool-share reserve conflict remains. | Accounts, Lumens, Liquidity Pools, and `sd-046` | A, C, D | Confirmed, but outside `sd-043` |

## Deployment verification

The rendered Sponsored Reserves page showed this text at 2026-09-08T15:50:00Z:

`(2 + numSubEntries + numSponsoring - numSponsored) * baseReserve`

It also showed this separate identity:

`available balance = balance - minimum balance - liabilities.selling`

Exact deployed URL:

https://developers.stellar.org/docs/build/guides/transactions/sponsored-reserves#effect-on-minimum-balance

The rendered Lumens page showed the same balance split at 2026-09-08T15:50:03Z.

Exact deployed URL:

https://developers.stellar.org/docs/learn/fundamentals/lumens#minimum-balance

Both pages displayed `Last updated on Sep 8, 2026 by Elliot Voris`.
The deployed content matched the current source blobs.

The fix is deployed.

## Adjacent Docs review

I scanned current `stellar-docs/main` for these terms:

- `liabilities.selling`
- `numSponsored`
- `numSponsoring`
- `available balance`
- `minimum balance calculation`
- Minimum-balance and base-reserve wording in adjacent pages

The only direct minimum-balance and available-balance definitions now agree.
They appear in Sponsored Reserves and Lumens.

The operation reference uses compatible wording.
It separates a minimum-reserve requirement from selling-liability sufficiency.

One adjacent conflict remains.
It does not concern selling liabilities.

The Accounts page says each subentry adds one base reserve.
It then includes pool-share trustlines in that group.

Exact rendered Accounts URL:

https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts#subentries

Current Accounts blob:

`d8eca575c0b4e7d8e7474f9f9c88cfdf150ffb05`

Exact current source:

https://github.com/stellar/stellar-docs/blob/83b4612d6b8d63d7c2e2dc28b69524783fa40848/docs/learn/fundamentals/stellar-data-structures/accounts.mdx#L34-L50

The Lumens page contains the same general grouping.
The Liquidity Pools page states the two-reserve exception.

Exact rendered Liquidity Pools URL:

https://developers.stellar.org/docs/learn/fundamentals/liquidity-on-stellar-sdex-liquidity-pools

Current Liquidity Pools blob:

`f31709881d6c3a5c71ef46f9c287af350d86c27e`

Exact current source:

https://github.com/stellar/stellar-docs/blob/83b4612d6b8d63d7c2e2dc28b69524783fa40848/docs/learn/fundamentals/liquidity-on-stellar-sdex-liquidity-pools.mdx#L109-L116

The rendered page says a pool-share trustline requires two base reserves.
This residual belongs to `sd-046`.
It does not limit the complete `sd-043` fix.

## `fixed-upstream` assessment

The `fixed-upstream` evidence bar is met.

- The original trigger no longer reproduces.
- Both requested pages now contain the corrected definitions.
- The deployed pages match the current upstream source.
- The corrected definitions match the current Core source.
- No adjacent liabilities-formula conflict remains.
- The pool-share conflict has a separate finding.

The active finding can move from `reported-upstream` to `fixed-upstream`.
The repository must then complete the resolution workflow.

## Golden cautions that now expire

Exactly two source-specific cautions match `sd-043`.
Both cautions now expire.

### 1. `q-pc-sponsored-reserves`

File:

`eval/qa/corpus/battery/protocol-core/q-pc-sponsored-reserves.json`

Required cleanup:

- Line 10 quotes the old Docs formula as current.
- Replace that formula with the corrected Docs formula.
- Keep the correct Core and available-balance distinction.
- Line 22 contains the `sd-043` partial-grade caution.
- Remove that caution.
- Lines 60-73 encode the old Docs-versus-Core conflict.
- Replace that corroboration with the current agreement.
- Lines 88-90 describe the old caution and active finding.
- Replace current-state evidence with the 2026-09-08 live result.
- Line 98 names the soon-deleted active finding path.
- Remove it or replace it with the resolved receipt.

This golden needs more than caution removal.
Its answer currently teaches the retired, wrong Docs formula.

### 2. `q-protocol-base-reserve-min-balance`

File:

`eval/qa/corpus/battery/protocol-core/q-protocol-base-reserve-min-balance.json`

Required cleanup:

- Line 23 contains the expiring canonical-page caution.
- Remove that caution.
- Line 48 says the current page includes `liabilities.selling` in minimum balance.
- Replace that note with the current aligned state.
- Lines 172-177 contain old live-conflict evidence.
- Keep it only as clearly dated history, or replace current-state entries.
- Line 181 says the `sd-043` caution remains unchanged.
- Remove or supersede that statement.
- Line 190 names the soon-deleted active finding path.
- Remove it or replace it with the resolved receipt.

The golden answer and avoid rules remain correct.
The separate `sd-046` pool-share evidence remains valid.

### Generated mirror

`eval/qa/cases.json` mirrors both source cases.
Its `sd-043` matches are at lines 28175, 28241-28243, 28251, 29313, 29467, 29471, and 29480.

Do not edit this generated file by hand.
Run `npm run eval:qa:compile` after the source-case cleanup.

## Other repository cleanup

### Active finding lifecycle

1. Update `improvements/stellar-docs/sd-043-sponsored-reserves-min-balance-liabilities.md` to `fixed-upstream`.
2. Add the merge commit, current blobs, and timed live result.
3. Record issue `#2771` and PR `#2806` as resolving references.
4. Complete the golden cleanup above.
5. Add the resolution receipt to `improvements/resolved.json`.
6. Delete the active finding through `npm run improvements:resolve`.

The resolver will remove the `sd-043` override at `improvements/intake.json:171-174`.
The resolver will regenerate `improvements/INDEX.md` and remove its line 52 row.

### Required upstream resolution comment

The existing maintainer comment reports the deployment and live result.
It does not include the commit-pinned Raven source snapshot.

Before retirement, post the resolver's resolution comment on issue `#2771`.
That comment must include the independent live result and the immutable source snapshot.
This step satisfies the repository retirement gate.

### Active, non-generated references

`improvements/stellar-docs/sd-046-pool-share-trustline-reserve-conflict.md:28-29` references `sd-043` as an active neighbor.
Update it to identify `sd-043` as resolved.
Point to the resolved receipt if the cross-reference remains useful.

`ideas/source-delivery-ranked-references.md:47-50` states the old conflict in the present tense.
Update it to mark the conflict as resolved on 2026-09-08.

`ideas/source-delivery-ranked-references.md:501-502` lists `sd-043` under the active improvements directory.
Remove it from that active list, or point to `improvements/resolved.json`.

The parent round ledger contains the current lane status.
The orchestrator should change the lane from `running` to `PASS`.

### Historical references that should remain

The dated `research/` reports describe evidence observed before this deployment.
They are historical provenance.
Do not rewrite those reports.

The dated 2026-08-29 and 2026-09-03 round records are also historical provenance.
Do not rewrite those records.

The current round ledger should retain its request and result history.
Only its active status needs reconciliation.

## Resolution commands for the owning lane

The research-only restriction forbids these changes in this lane.
The owning lane should use the standard workflow.

First, update the two source golden files.
Then run:

```sh
npm run eval:qa:compile
npm run eval:qa:lint
```

Next, update the active finding to `fixed-upstream`.
Then run:

```sh
npm run improvements:index
npm run improvements:lint
```

After the required issue comment, dry-run the resolver.

```sh
npm run improvements:resolve -- \
  --file improvements/stellar-docs/sd-043-sponsored-reserves-min-balance-liabilities.md \
  --live-recheck "2026-09-08T15:50:00Z rendered Sponsored Reserves and Lumens pages match Core" \
  --review-evidence ".agents/rounds/2026-09-08-improvements-docs-fixes/verify-sd-043-sol.md" \
  --resolving-ref https://github.com/stellar/stellar-docs/issues/2771 \
  --resolving-ref https://github.com/stellar/stellar-docs/pull/2806 \
  --references-reviewed --upstream-commented --dry-run
```

Review the printed receipt and comment before any write.
Then run the non-dry command after the comment exists.

Finally, run the required improvement gates.

```sh
npm run improvements:index
npm run improvements:lint
npm run improvements:lint -- --live
npm run improvements:probes
```

## Final verdict

PASS
