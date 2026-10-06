# Near-due golden re-verification — 2026-10-06

- Worktree: `/Users/kalepail/Desktop/srcm-goldens-reverify`, branch `goldens/2026-10-06-reverify`, base `528fa335`.
- Commit: `5b7d47ad` — "eval: re-verify 11 near-due goldens without truth changes". It is local only. I did not push, deploy, or post to GitHub.
- Author: Claude Opus 5.5, one session. I did not spawn a reviewer. The independent re-verification is still open, and the coordinator owns it.
- I ran no paid evaluation.

## Summary

All 11 cases passed re-verification with no change to their truth. I made no edits to `question`, `golden`, or `tags`. A parsed-JSON diff shows that each case file changed only in `truth.asOf`, `truth.reverifyBy`, `truth.corroboration[].evidence`, and `truth.verified`.

| Case | Action | Old asOf → new | Old reverifyBy → new |
|---|---|---|---|
| q-comp-yieldblox-oracle-incident | Re-verified unchanged | 2026-07-28 → 2026-10-06 | 2026-10-08 → 2027-03-02 |
| q-hist-meridian-2026-corrected-venue | Re-verified unchanged | 2026-07-11 → 2026-10-06 | 2026-10-08 → 2026-11-03 (after the event) |
| q-hist-x402-stellar-announcement | Re-verified unchanged | 2026-07-11 → 2026-10-06 | 2026-10-08 → 2027-01-05 |
| q-edge-closed-world-builder-directory-miss | Re-verified unchanged | 2026-07-13 → 2026-10-06 | 2026-10-09 → 2027-01-12 |
| q-agent-payment-standard-choice | Re-verified unchanged | 2026-08-04 → 2026-10-06 | 2026-10-15 → 2026-12-22 |
| q-edge-strupey-ambiguous-stellar-history | Re-verified unchanged | 2026-07-13 → 2026-10-06 | 2026-10-15 → 2027-01-20 |
| q-pc-cross-redstone-sep40 | Re-verified unchanged | 2026-07-11 → 2026-10-06 | 2026-10-15 → 2027-01-26 |
| q-sep53-message-signing | Re-verified unchanged | 2026-07-11 → 2026-10-06 | 2026-10-15 → 2027-02-02 |
| q-sep-6-24-deprecation | Re-verified unchanged | 2026-07-13 → 2026-10-06 | 2026-10-15 → 2027-02-09 |
| q-rwa-tokenization-standards | Re-verified unchanged | 2026-07-11 → 2026-10-06 | 2026-10-15 → 2027-02-16 |
| q-org-sdf-enterprise-fund | Re-verified unchanged | 2026-07-13 → 2026-10-06 | 2026-10-20 → 2027-02-23 |

How I chose the dates: each new date is one week from the next. The dates run from late December to early March, which is about one quarter out. A case that changes faster gets an earlier date. For example, the agent-payment protocols get 2026-12-22, and the stable incident history gets 2027-03-02. No two cases share a date. Meridian is the one exception to the quarter horizon. The event takes place on 2026-10-28/29. After that, the "scheduled / still upcoming" framing becomes history, so its check comes right after the event.

All observations below are from 2026-10-06. Source classes follow the golden-truth skill (A official, B source/repo, C live service, D general web, E docs index, F empirical).

## Per-case evidence

### q-comp-yieldblox-oracle-incident

- **Date 2026-02-22, USTRY-SDEX/Reflector VWAP path**
  - F, `https://horizon.stellar.org/transactions/ae721cacee382bdecac8d2c47286ecd42cb4711f658bb2aec7cba60dc64a31ff`: successful, ledger 61340384, 2026-02-22T00:22:09Z. Tx `3e81a3f7…` is at 2026-02-22T00:24:27Z.
  - B, `https://github.com/DK27ss/YieldBlox-10M-PoC`: "SDEX price manipulation of an illiquid collateral asset (USTRY) feeding into the Reflector oracle".
  - D, `https://blocksec.com/blog/yieldblox-dao-incident-on-stellar-oracle-misconfiguration-enabled-a-10m-drain`: "On February 22, 2026, a lending pool operated by YieldBlox DAO on Stellar's Blend V2 was exploited".
- **Transfers 61,249,278.3064502 XLM and 1,000,196.7040837 USDC**
  - F, Horizon `/effects` for both transactions: `contract_debited`/`account_credited` 1000196.7040837 USDC and 61249278.3064502 native.
  - B, PoC: TX1 1,000,196.70 USDC; TX2 61,249,278.31 XLM.
- **14,000 USDC liability is pre-existing; valuations are source-specific**
  - B, PoC: "USDC liability (reserve 1) 119,028,268,790 d-tokens (~14,000 USDC)". The PoC gives "~$10.86M".
  - D, BlockSec: "losses exceeding $10 million".
- **48M XLM quarantine; remediation on 2026-02-27 and 2026-03-20, with exclusions**
  - D, Blockaid blog: "Approximately 48,069,094 XLM was effectively quarantined".
  - A, Script3 posts 2027462360294953200 (2026-02-27 19:14 UTC) and 2035066332887023761 (2026-03-20 18:49 UTC). I read these through the `api.fxtwitter.com` mirror. They say that payments under 0.01 were skipped, that claimable balances went to accounts without trustlines, and that there was "no remediation for those liquidated".
  - B, `script3/yieldblox-incident-remediation`: commits dated 2026-02-27 and 2026-03-20. `src/execute.js` skips amounts below the threshold and destinations that do not exist.
- **Fresh poisoned values passed the checks**
  - B, PoC: Oracle Adapter `lastprice` gave the manipulated price, and "Health factor with manipulated oracle ($106.74/USTRY)" passed.
  - D, `https://rekt.news/yieldblox-rekt`: the adapter "returned the latest price and passed the full 100x inflation straight through".
- **Avoid clauses**
  - The $10.5M net-loss figure is still unverifiable. Two D WebSearch queries and the Script3 repository showed no primary source for it.
  - No source reports repayment or recovery. Rekt.news says the attacker kept laundering funds after the bounty message.

### q-hist-meridian-2026-corrected-venue

- **2026-10-28/29, Convento do Beato, Lisbon**
  - A, `https://meridian.stellar.org/event-details`: "October 28–29, 2026 at Convento do Beato in Lisbon, Portugal".
  - D, `https://luma.com/meridian2026ll`: Lisbon, startDate 2026-10-28.
- **HackMeridian 2026-10-25/26**
  - A, `https://www.hackmeridian.com/`: "25–26 October 2026 · ONE16, Lisbon".
- **SDF announcement on 2026-04-01**
  - A, `https://x.com/StellarOrg/status/2039405316803031315`, read through the fxtwitter mirror: "Wed Apr 01 18:11:32 +0000 2026 … Meridian is headed to Lisbon. October 28–29."
- **Avoid clauses**
  - The current FAQ has no Abu Dhabi schedule. A D WebSearch found no later change of city or date.
- **Weakness**
  - Luma is a placeholder hosted by Lumen Loop, and it defers to the official site. Its independence is weak. The A sources carry this claim.

### q-hist-x402-stellar-announcement

- **Announcement on 2026-03-10**
  - A, `https://stellar.org/blog/foundation-news/x402-on-stellar`: page metadata `"date":"2026-03-10"`.
  - B, `https://github.com/stellar/x402-stellar`: created 2026-03-03, not archived, last push 2026-09-29.
- **Per-request HTTP payments; Soroban and SEP-41 flow**
  - A, `https://developers.stellar.org/docs/build/agentic-payments/x402`: "x402 works with Soroban authorization … via signed auth entries" and "supports any SEP-41 compliant token".
- **No SEP number for x402**
  - B: the `stellar/stellar-protocol` ecosystem directory has 59 entries, and no file name contains x402 or 402. GitHub code search and PR search for x402 in that repository both return zero.
  - D: a WebSearch found implementations but no SEP number.
- **Settlement live, tooling still in development**
  - A, blog: "The settlement layer is live. The agent tooling is being built."

### q-edge-closed-world-builder-directory-miss

- **Exact directory miss**
  - C, `https://stellarlight.xyz/api/builders?q=Strupey`: returned=0, total=0, partial=false, generatedAt 2026-10-06T14:52:43Z.
  - B, `catalog/manifest.json` at `528fa335`: still exposes `scout.getBuilders`.
- **Behavior facts**
  - The scope and avoid facts describe behavior, not live values. No source can contradict them.

### q-agent-payment-standard-choice

- **x402 V2 and MPP differ; x402 V2 has extensions and discovery; sessions are outside the core spec**
  - B, `x402-foundation/x402` `specs/x402-specification-v2.md`: the "Out of Scope" list includes "Session handling mechanisms". The spec defines `extensions` and "8. Discovery API".
  - B, `stellar/stellar-mpp-sdk` README: the charge method is `draft-stellar-charge-00`.
- **MPP Charge settles on-chain; Session uses cumulative off-chain commitments**
  - B, MPP README: "Each payment is a Soroban SEP-41 transfer settled on-chain individually". Channel mode signs "cumulative commitments — no per-payment on-chain transactions".
  - A, `https://mpp.dev/`: "An improved sessions experience" (2026-06-17).
- **AP2 and ACP roles**
  - B, AP2 `docs/ap2/specification.md`: "Mandates are the core means that AP2 uses to authorize agents".
  - B, ACP README: "currently in `beta`". The latest spec is dated 2026-04-17.
- **Adapter facets**
  - B, ACP `spec/2026-04-17` checkout OpenAPI: it uses "idempotency" 46 times. The examples include `orders/digital-fulfillment.json` and `orders/refunded-order.json`.
  - B, x402 core types: `PaymentRequirements`, `PaymentPayload`, `SettlementResponse`.

### q-edge-strupey-ambiguous-stellar-history

- **No exact identity in the searched sources (dated, source-scoped)**
  - C, Stellar Raven connector: Docs, LumenLoop semantic, Scout research, and Scout projects returned no row with the exact token. Scout projects spell-corrected the query to Stroopy.AI.
  - C, Stellar Light `/api/people` and `/api/builders` returned 0.
  - B, GitHub user and repository searches returned `total_count=0`.
  - E, a Docs search for "Strupey" returned 5 hits, and none contained the token.
  - D, a WebSearch found only Otto Struve and "stroop" results.
- **Standing caution**
  - `improvements/lumenloop/ll-017-semantic-person-match-provenance.md` is still `reported-upstream`, so the grader caution stays.
  - I kept that path as the only `rootCause` entry because it backs the caution.

### q-pc-cross-redstone-sep40

- **The June 2026 article is RedStone's**
  - A, RedStone blog: heading "Reliability at Scale: RedStone and the Data Standard for Stellar's RWA Moment", datePublished 2026-06-04.
  - C, LumenLoop semantic search still indexes the article.
- **Redstone Finance is a live oracle**
  - C, Scout `searchProjects`: Redstone Finance, status Live, type Oracle.
- **Official docs on SEP-40 compatibility**
  - A, `https://developers.stellar.org/docs/data/oracles/oracle-providers`: "Publicly availble free price oracles are compatible with SEP40 ecosystem standard interface".
  - B, `sep-0040.md`: "Oracle Consumer Interface".
- **Observations (no truth change)**
  - The page `<title>` changed to "RedStone Adopts Stellar's SEP-40 Oracle Standard for RWA Markets" (dateModified 2026-09-01). The article heading did not change.
  - RedStone published later SEP-40 posts on 2026-08-05 and 2026-08-26. "June 2026" still points to exactly one article.

### q-sep53-message-signing

- **Prefix, then one SHA-256, then Ed25519**
  - A/B, `sep-0053.md`: `"Stellar Signed Message:\n"`, then `messageHash = SHA256(encodedMessage)`, then ed25519.
  - B, `stellar-cli` `commands/message/mod.rs`: `SEP53_PREFIX`.
  - B, `js-stellar-sdk` `src/base/keypair.ts`: `MESSAGE_PREFIX` and `signMessage`.
- **Final, 1.0.0, updated 2026-06-18**
  - A, `sep-0053.md` preamble.
- **SDK and CLI support**
  - B: js-stellar-sdk and py-stellar-base (`sign_message`/`verify_message`).
  - B, GitHub code search: java-stellar-sdk `KeyPair.java`, stellar_flutter_sdk, stellar-ios-mac-sdk, stellar-php-sdk, and kmp-stellar-sdk.
  - B: the stellar-cli `message sign|verify` subcommands (I read the source but did not run it).
- **SEP-43 is a Draft**
  - B, `sep-0043.md`: Draft, 1.2.1.

### q-sep-6-24-deprecation

- **Only the interactive parts of SEP-6 are deprecated**
  - B, `sep-0006.md`: "Status: Active (Interactive components are deprecated in favor of SEP-24)", 4.3.0.
  - B, `sep-0024.md`: Active.
- **The programmatic API stays**
  - A, Anchors page: "SEP-6: Programmatic Deposit and Withdrawal".
  - E, a Docs search still returns no deprecation text.
  - `improvements/stellar-docs/sd-009-…` is `declined-upstream`, so the caution is durable. I kept that path as the only `rootCause` entry.

### q-rwa-tokenization-standards

- **Legal, custody/reserve, eligibility, and redemption design**
  - A, `https://developers.stellar.org/docs/tokens/publishing-asset-info`: `redemption_instructions` and `attestation_of_reserve`.
  - B, SEP-1: the same fields plus `regulated`.
  - A, tokenization use-case page: regulated custody providers.
  - The "legal claim" element is a design principle. No page states it in those words.
- **Classic flags and Soroban compliance**
  - A, `control-asset-access`: AUTH_REQUIRED, AUTH_REVOCABLE, and clawback.
  - A, `anatomy-of-an-asset`: a comparison of Stellar Asset, SEP-41, and SEP-57 T-REX.
- **SEP-41 is the token interface**
  - B: Draft 0.5.2, updated 2026-08-24.
- **SEP-56 is a Draft for tokenized vaults, not attestation**
  - B: Draft 0.1.2. It covers deposits, withdrawals, and share conversion, and it has no reserve mechanism.
- **Observation (no truth change)**
  - The official docs now name SEP-57 T-REX (Draft 0.4.0) for regulated tokens. The golden does not deny this, so I changed nothing. An editor could add it later through this workflow.

### q-org-sdf-enterprise-fund

- **Venture-style fund; "portfolio totaling over $100m"**
  - A, `https://stellar.org/enterprise-fund`: the exact wording is present.
  - D, a WebSearch repeats the same wording and shows no newer figure.
- **MoneyGram came from the cash treasury, not the fund**
  - A, SDF post dated 2023-08-15: "made out of SDF's own cash treasury … rather than the Enterprise Fund".
  - D, Ledger Insights (2023-08-16): "the money came from the SDF treasury used for SDF operations, not its Enterprise Fund".

## Sibling sweep

I searched the battery for each topic and read the matching siblings. I found no contradiction. The siblings were:

- q-hist-yieldblox-v2-2026-exploit
- q-scf-hackathons-active
- q-defi-x402-on-stellar-what
- q-sep-53-sign-verify-message
- q-scf-vs-sdf-enterprise-fund
- q-defi-agentic-payment-standards-compare
- q-mpp-discovery-and-modes
- q-sep-interactive-deposit-withdraw
- q-sep6-sep24-sep31-choice
- q-defi-reflector-oracle
- the Strupey/closed-world family

Each case's `truth.verified.evidence` records its own sweep.

## Consistency register

- `npm run eval:qa:register` re-stamped the hashes and reopened 11 entries: clusters 009, 011, 013, 051, 087, 125, 126, and 128, the "YieldBlox borrowed XLM USDC totals" numeric invariant, and two date-contingent traps.
- I applied a review file with `register-helper.mjs --review tmp/register-review-2026-10-06.json`. That file is not committed because `tmp/` is gitignored. The review set all clusters and traps to `consistent`.
- The two traps had stale `reverifyBy` references, so I moved their triggers:
  - YieldBlox: "2027-03-02 … remediation recheck …"
  - Meridian: "2026-11-03 post-event check after Meridian 2026 on 2026-10-28/2026-10-29"
- The helper cannot review numeric invariants. I closed that entry by hand with the same fields: verdict, lastChecked, reSwept, and removal of `reopened`.

## Gates (exit codes)

| Command | Exit |
|---|---|
| `node eval/qa/compile-qa.mjs` | 0 |
| `npm run eval:qa:lint -- --stale --enforce-floors` | 0 (0 errors, 62 warnings) |
| `npm run eval:qa:lint -- --since origin/main --stale` | 0 |
| `npm run eval:qa:register -- --check` | 0 (up to date) |
| `npm run eval:selftest` | 0 |
| `npm test` | 0 (136 files; 2427 passed, 3 expected fail) |
| `npm run secrets:scan -- --tree` | 0 (clean) |
| After commit: `node eval/qa/compile-qa.mjs` then `git diff --exit-code eval/qa/cases.json eval/qa/sample.json eval/qa/lifecycle-registry.json` | 0 / 0 (clean) |

Two lint warnings name these cases: an avoid sourcing-guard on yieldblox and one on enterprise-fund. Both come from avoid text I did not change, so they existed before this commit.

## Deviations and items for the coordinator

1. **No fan-out.** Step 4 of the skill tells you to fan out verification lanes. I did all the verification in one session. The brief asked me not to spawn a reviewer. No case changed truth, but the independent re-verification lane is still open.
2. **Golden text dates stay as they were.** The golden answers keep their original "as of" dates (for example 2026-07-11). Each dated statement is still true, and the brief's unchanged path covers only truth metadata. The answer dates are now older than `truth.asOf` (2026-10-06).
3. **rootCause.** Nothing changed gospel, so I removed `rootCause` from the refreshed `truth.verified` on 9 cases. I kept it only on the two cases where an improvements finding backs a standing caution (ll-017 and sd-009). The old solo:// and expired-lane references went away with the replaced verification events. I added no new solo:// reference.
4. **X posts.** I read them through the `api.fxtwitter.com` mirror because x.com does not render without a login. The evidence notes say this.
5. **Candidate finding, not filed.** `https://stellarlight.xyz/api/repos/search?q=strupey` reports `matchMode: "strict"` ("every query term matched"). But none of its 23 returned rows (for example stellar/freighter) contains the token. This looks like a mislabeled match mode in Scout. It is out of scope for this brief, so I did not file it under `improvements/`.
6. **Meridian follow-up.** After 2026-10-29, the case needs a gospel edit that changes "scheduled" to "was held". The 2026-11-03 `reverifyBy` and the date trap now point at that edit.
7. **Round ledger and `.agents/TODO.md`.** I did not update either one. I expect the coordinator to record this round.
