# Review — PR D golden freshness pass

Verdict: accept with fixes

Reviewer: Grok. Author: raven-next (Claude Fable 5.1).
Branch: `golden/queued-freshness-2026-09-30`.
Base: `origin/main` `157c26b42038055b87f904e1c0b92479afad35a7`.
Gospel commit: `c2cff118`. Gate-time HEAD: `8af50107` (round ledger only).
This review did not edit repository files, post upstream, or run a paid evaluation.

## Findings

### 1. `eval/qa/corpus/battery/scf-grants-builders/q-gap-builders-person-empty.json`

Claim: The direct `stellarlight.xyz` read is class D, and it corroborates the Raven `scout.getBuilders` read.

Evidence: Skill step 2 puts a direct Stellar Light call in class C. The same step says the aggregator does not corroborate itself. On 2026-09-30 both reads were the same directory. `https://stellarlight.xyz/api/status` reported builders count 226 and `lastUpdatedAt` `2026-09-30T12:57:22.194Z` (`generatedAt` `2026-09-30T21:45:05.749Z`). Raven `scout.getBuilders({ q: "zzzzqqq", limit: 1 })` returned `builders: []`, total 0, `matchMode` `expanded`, and the same filter-miss advisory naming 226 (`generatedAt` `2026-09-30T21:45:32.819Z`).

Expected fix: Label the direct read class C. State that 226 has one witness. Keep the dated count in the answer. Keep the filter-miss key fact.

### 2. `eval/qa/corpus/battery/defi-ecosystem/q-defi-x402-on-stellar-what.json`

Claim: The tftc.io page and the SDF post are class E, and tftc.io is a 2026-07-16 report.

Evidence: Skill class E is the docs search index. The live tftc.io page is a news article. Its text does not show 2026-07-16. The body says the foundation is about three months old since it became operational. The SDF post `2077056655758664090` is from `@StellarOrg` at 2026-07-14 15:44:42 GMT. Its words are "SDF will hold a seat on the x402 Foundation Governing Board, with CPO @tomerweller".

Expected fix: Give tftc.io and the SDF post their real classes. Drop the 2026-07-16 date, or cite a date printed on the page. Keep the answer sentence that SDF states the seat.

### 3. `eval/qa/consistency-register.json` — numeric invariant `base reserve`

Claim: The freshness pass cleared every reopened register entry.

Evidence: The entry `label` "base reserve" has `verdict` `reopen`. `reopened.date` is 2026-09-30 and `reopened.reason` is `member-content-changed`. `reSwept.date` is still 2026-09-29. That reason says the answer, key facts, avoid rules, `asOf`, and `reverifyBy` stayed unchanged. This diff dates the 0.5 XLM amount in `q-asset-trustline-basics`. `register-review-d.json` clears eight clusters. `applyRegisterReview` has no numeric-invariant review path. `npm run eval:qa:register -- --check` still prints `up to date`. The round ledger names only the eight clusters.

Expected fix: Write a 2026-09-30 `reSwept` reason for this entry. Say the dated 0.5 XLM wording matches the invariant. Set `verdict` to `consistent` and remove `reopened`. Record this reopen in the round ledger. The review file cannot clear this entry, so edit the register entry directly.

## What was verified and found correct

No change launders a score. No key fact gained a new number. No case gained an avoid item. The builders key fact still grades a filter miss against an empty directory. The x402 notes accept a dated pre-2026-07-14 unseated reading and a dated 2026-09-30 seat reading. The AMM key fact now binds the two-reserve count. The person case leaves the answer, key facts, and avoid text unchanged.

`q-gap-builders-person-empty`: The absent query is a filter miss. The answer dates 114 on 2026-07-11 and 226 on 2026-09-30. `truth.asOf` is 2026-09-30. `truth.verified` has date, by, evidence, and `rootCause` `freshness-drift` plus the TODO item. The sibling sweep is in `truth.verified.evidence`.

`q-defi-x402-on-stellar-what`: The Linux Foundation press page is dated 14 July 2026. It announces the operational launch. It lists 17 Premier members, including the Stellar Development Foundation, and 40 members. The release does not use the words Governing Board. `https://x402.org/members` lists the Stellar Development Foundation under Premier Members. The Premier benefit says "Appointed seat on the Governing Board". `https://stellar.org/x402` says SDF holds a seat, represented by Tomer Weller, SDF's Chief Product Officer. The seat claim has support beyond SDF's own page: the foundation members page states the Premier entitlement and lists SDF. The 2026-07-10 unseated sentence is the prior golden observation. This review did not recover a 2026-07-10 snapshot. The answer dates all three points. Key facts and avoid items are unchanged. `rootCause` is `freshness-drift` plus the TODO item.

`q-asset-trustline-basics` and `q-asset-amm-fee-reserve`: The lumens page says one base reserve is currently 0.5 XLM and that validators can vote to change it. A pool-share trustline counts as two. The liquidity-pools page says a pool-share trustline requires 2 base reserves, and the fee is 30 bps (0.30%). Horizon ledger 64703824 closed `2026-09-30T21:48:22Z` with `base_reserve_in_stroops` 5000000 and protocol 28. The author's ledger 64703557 is earlier the same evening. The reserve setting is the same. Both cases set `truth.asOf` to 2026-09-30. Both `truth.verified` records have date, by, evidence, and a non-score `rootCause`.

`q-builder-content-by-person`: The author page title says 7 posts. The main list has seven dated headings: 2024-06-13, 2024-04-18, 2024-03-21, 2024-03-07, 2024-02-22, 2024-02-08, and 2024-01-26. The 2024-06-13 page still covers Super Peach, passkey-kit, and Launchtube. Practical Path Payments is dated April 10, 2020 and names Tyler van der Hoeven. The Turing page header is July 10, 2020, and the body says June 19th 2020. The AMA page is May 4, 2023 and names Tyler van der Hoeven. GitHub API: `kalepail/passkey-kit` is `archived: true`, `pushed_at` `2026-07-31T17:18:57Z`, and the README says development moved to `stellar/passkey-kit`. `stellar/launchtube` is `archived: true` and `pushed_at` `2026-01-14T03:09:51Z`. `reverifyBy` is 2027-01-07. `rootCause` is `freshness-drift`.

Gates, run in the worktree on 2026-09-30:

- `npm run eval:qa:compile` exit 0. It wrote 501 cases. `cases.json` sha256 `dee3a486022eb4b6d8b3a980712332a87ff324920d1eb4ff8c0db0d8862141a7`. The three generated files matched HEAD.
- `npm run eval:qa:lint -- --since origin/main --stale` exit 0. Result: `0 error(s), 62 warning(s)`. One warning names `q-builder-content-by-person` for an avoid line this diff does not change.
- `npm run eval:qa:register -- --check` exit 0. Result: `[register-helper] up to date`.

The eight clusters in `register-review-d.json` are 012, 017, 073, 114, 116, 123, 125, and 128. Each review sets `clearReopened` true. This review did not run `eval:plan`.
