# Independent review: near-due golden re-verification

**Verdict: approve**

Candidate commit `5b7d47ad6690af08f0a2e9f6d1a38d5707d7740c`.
Base `origin/main` is `528fa335dbc52defd82cdd961aba5304f5ee52ca`.
Range is `git diff origin/main...5b7d47ad`.
Worktree is `/Users/kalepail/Desktop/srcm-goldens-reverify`.
This review did not edit tracked files.
This review did not use the author report.

## Findings

None.

## Diff scope

The range changes 15 files.
The 11 case files change only `truth`.
`question`, `golden`, and `tags` are identical on all 11 cases.
`tags.freshness` stays `scheduled`.
`eval/qa/cases.json`, `eval/qa/sample.json`, and `eval/qa/lifecycle-registry.json` follow those truth edits.
`eval/qa/consistency-register.json` is the other edited file.

## Gospel lint

`npm run eval:qa:lint -- --since origin/main --stale` exited 0.
The log ends with `[lint-corpus] 0 error(s), 62 warning(s)`.
The gospel-change guard reports no error.
Two warnings name cases in this range.
They are avoid-text heuristics on unchanged gospel.
`q-comp-yieldblox-oracle-incident` warns on the Script3 `$10.5M` avoid line.
`q-org-sdf-enterprise-fund` warns on the MoneyGram avoid line.

## reverifyBy dates

The new dates are unique.
They run from 2026-11-03 through 2027-03-02.
The set is staggered.
It is not a wall of one date.
The spread is about one quarter.
`golden-truth` Step 5 asks for a staggered quarter-granular date.
`truth-maintenance` lines 60–63 treat one shared date as a review finding.

| Case | Old | New |
| --- | --- | --- |
| `q-hist-meridian-2026-corrected-venue` | 2026-10-08 | 2026-11-03 |
| `q-agent-payment-standard-choice` | 2026-10-15 | 2026-12-22 |
| `q-hist-x402-stellar-announcement` | 2026-10-08 | 2027-01-05 |
| `q-edge-closed-world-builder-directory-miss` | 2026-10-09 | 2027-01-12 |
| `q-edge-strupey-ambiguous-stellar-history` | 2026-10-15 | 2027-01-20 |
| `q-pc-cross-redstone-sep40` | 2026-10-15 | 2027-01-26 |
| `q-sep53-message-signing` | 2026-10-15 | 2027-02-02 |
| `q-sep-6-24-deprecation` | 2026-10-15 | 2027-02-09 |
| `q-rwa-tokenization-standards` | 2026-10-15 | 2027-02-16 |
| `q-org-sdf-enterprise-fund` | 2026-10-20 | 2027-02-23 |
| `q-comp-yieldblox-oracle-incident` | 2026-10-08 | 2027-03-02 |

Meridian 2026-11-03 is justified.
The live event is still 28–29 October 2026.
3 November 2026 is after that event.
The date trap at `eval/qa/consistency-register.json:3790` moves the check to that post-event date.
The answer still dates the schedule as of 11 July 2026.
The live pages still match that schedule.

## Consistency register

Eleven register entries include a changed case hash.
Each one is `verdict` `consistent`.
Each `lastChecked` is `2026-10-06`.
Each `reSwept.date` matches `lastChecked`.
Each `reSwept.reason` records a live re-read.
No entry has `reopened`.
A full scan of the file finds zero `verdict` `reopen`.

The eleven entries are:

- `cluster-009` at line 242, `q-sep-6-24-deprecation`
- `cluster-011`, `q-org-sdf-enterprise-fund`
- `cluster-013`, `q-comp-yieldblox-oracle-incident`
- `cluster-051`, `q-org-sdf-enterprise-fund`
- `cluster-087`, `q-org-sdf-enterprise-fund`
- `cluster-125`, `q-hist-x402-stellar-announcement`
- `cluster-126`, `q-comp-yieldblox-oracle-incident`
- `cluster-128`, both Strupey cases
- numeric invariant "YieldBlox borrowed XLM USDC totals" at lines 3518–3563
- YieldBlox date trap at lines 3745–3765
- Meridian date trap at lines 3789–3805

`applyRegisterReview` closes clusters and date traps only.
See `eval/qa/register-helper.mjs:148-163`.
The numeric invariant cannot close through that helper.
The hand edit at lines 3557–3562 is a real close.
`verdict` is `consistent`.
`reopened` is absent.
The reason names both exploit transactions, the pre-existing USDC liability, and the Blockaid quarantine figure.
Those three claims match the live checks below.

`q-sep53-message-signing`, `q-agent-payment-standard-choice`, `q-rwa-tokenization-standards`, and `q-pc-cross-redstone-sep40` are not members of a register entry.
`npm run eval:qa:register -- --check` exited 0.
The log says `[register-helper] up to date`.

## rootCause and solo://

Gospel did not change.
`golden-truth` lines 166–174 require `rootCause` when the event changes gospel.
A metadata-only refresh may drop the prior `rootCause`.
Nine cases drop `rootCause`.
Two cases keep a narrowed non-score cause.
`q-sep-6-24-deprecation` keeps `improvements/stellar-docs/sd-009-sep-6-interactive-deprecation-undiscoverable.md`.
`q-edge-strupey-ambiguous-stellar-history` keeps `improvements/lumenloop/ll-017-semantic-person-match-provenance.md`.
The diff adds zero `solo://` lines.
The diff removes 30 `solo://` lines from replaced verification events.
Git history still holds those events.
No new `solo://` reference was added.

## Command exits

| Command | Exit |
| --- | --- |
| `npm run eval:qa:lint -- --since origin/main --stale` | 0 |
| `npm run eval:qa:lint -- --stale --enforce-floors` | 0 |
| `npm run eval:qa:register -- --check` | 0 |
| `npm run eval:selftest` | 0 |

The floor lint log also ends with `0 error(s), 62 warning(s)`.
`eval:selftest` printed `self-test: all checks passed`.
Commands ran in `/Users/kalepail/Desktop/srcm-goldens-reverify`.

## Live checks

Observation date for these probes is 2026-10-06.
The four full-fact cases are first.
The other seven cases have the most volatile fact.

### q-comp-yieldblox-oracle-incident

Every key fact still holds.

- The drain date is 2026-02-22.
  StellarExpert transaction `ae721cac…` is ledger `61340384` at `2026-02-22T00:22:09Z`.
  StellarExpert transaction `3e81a3f7…` is ledger `61340408` at `2026-02-22T00:24:27Z`.
  Source: `https://api.stellar.expert/explorer/public/tx/{hash}`.
- Horizon effects show the exact transfers.
  `ae721cac…` credits `1000196.7040837` USDC.
  `3e81a3f7…` credits `61249278.3064502` native XLM.
  StellarExpert effect routes returned HTTP 404.
  Horizon is the decoded amount source.
  Source: `https://horizon.stellar.org/transactions/{hash}/effects`.
- Blockaid rounds the same transfers to `61,249,278.31` XLM and `1,000,196.70` USDC.
  Those strings are accepted spellings on the numeric invariant.
  Blockaid also states `max_dev = 10`.
  Two consecutive fresh windows both carried the manipulated price.
  The deviation check then passed.
  Blockaid states the exact quarantine figure `48,069,094` XLM.
  Quarantine stopped origination.
  It is not repayment or recovery.
  Source: `https://www.blockaid.io/blog/73-quarantined-how-blockaid-and-stellar-validators-contained-a-10m-price-manipulation-attack`.
- The PoC lists a pre-TX1 USDC liability of about 14,000 USDC.
  The row is `119,028,268,790` d-tokens.
  Source: `https://github.com/DK27ss/YieldBlox-10M-PoC`.
- Script3 posted direct-depositor remediation on 2026-02-27.
  Payments under `0.01` XLM, EURC, or USDC were skipped.
  That notice excludes liquidation users and backstop depositors.
  Post `2027462360294953200`.
- Script3 posted backstop remediation on 2026-03-20.
  Liquidated users receive no remediation in that notice.
  The post says the distribution concludes the effort.
  Post `2035066332887023761`.
- The answer leaves the Script3 `$10.5M` net-loss figure unverified.
  These primary posts do not establish that figure.
- Blockaid describes a pool oracle-wrapper failure.
  It does not report a Reflector, Blend-core, Etherfuse, or Stellar-consensus compromise.

### q-hist-meridian-2026-corrected-venue

Every key fact still holds.

- `https://meridian.stellar.org/event-details` says 28–29 October 2026 at Convento do Beato, Lisbon.
- `https://meridian.stellar.org/schedule` lists Wednesday 28 October and Thursday 29 October at Convento do Beato.
- `https://meridian.stellar.org/hackmeridian` says HackMeridian is 25–26 October 2026 in Lisbon.
- `https://hackmeridian.com/` says `25–26 October 2026 · ONE16, Lisbon`.
- `@StellarOrg` post `2039405316803031315` is 2026-04-01 18:11 UTC.
  The text says Lisbon and 28–29 October.
- The live official pages show Lisbon.
  They do not show Abu Dhabi or Yas Marina as the current venue.

### q-hist-x402-stellar-announcement

Every key fact still holds.

- `https://stellar.org/blog/foundation-news/x402-on-stellar` has `<time dateTime="2026-03-10T00:00:00.000Z">`.
- The page describes HTTP 402 per-request payment.
- The page says the settlement layer is live.
- The page says MCP integration is in active development.
- `https://developers.stellar.org/docs/build/agentic-payments/x402` says Soroban authorization and any SEP-41 token.
- `https://developers.stellar.org/docs/build/agentic-payments/x402/built-on-stellar` says the same SEP-41 asset rule.
- `sep-0041.md` is the Soroban token interface.
  It is Draft, version `0.5.2`, updated 2026-08-24.
- The `stellar-protocol` ecosystem directory has SEP files through `sep-0059.md`.
  No file is an x402 SEP.
  SEP titles 0050 through 0059 do not name x402.
  The July 11, 2026 no-SEP statement still matches the directory.

### q-edge-closed-world-builder-directory-miss

Every key fact still holds.

- `GET https://stellarlight.xyz/api/builders?q=Strupey` returned `counts.returned` 0 and `counts.total` 0.
  `generatedAt` is `2026-10-06T14:52:43.835Z`.
  `matchMode` is `expanded`.
- The answer dates the directory miss to 2026-07-13.
  The same exact-name miss is still true on 2026-10-06.
- The question asks only for the Scout builder directory.
  The zero row is that directory result.
- A web search for `Strupey` plus Stellar returned no exact builder, person, or project.

### q-sep-6-24-deprecation

SEP-6 interactive deposit and withdrawal stay deprecated in favor of SEP-24.
Raw `sep-0006.md` status is `Active (Interactive components are deprecated in favor of SEP-24)`.
Updated date is 2025-09-10.
Version is `4.3.0`.
The same file says the SEP is the programmatic interface.
Raw `sep-0024.md` status is Active.
The cluster-009 reason also matches live SEP-41 Draft `0.5.2`, SEP-43 Draft, and SEP-57 Draft `0.4.0`.

### q-sep53-message-signing

SEP-53 is Final, version `1.0.0`, updated 2026-06-18.
Raw `sep-0053.md` states that preamble.
The prefix is `Stellar Signed Message:\n`.
The hash is one SHA-256.
The signature is Ed25519 over that digest.
SEP-43 remains Draft in raw `sep-0043.md`.
Current support still appears on these surfaces.
JS `signMessage` and `verifyMessage` are in the SDK reference dated 2026-10-05.
Flutter `verifyMessage` documents SEP-53.
`stellar message sign` and `verify` document SEP-53 on 2026-09-30.
The KMP SDK README lists SEP-53.

### q-agent-payment-standard-choice

x402 V2 core leaves session handling out of scope.
Raw `x402-specification-v2.md` lists `Session handling mechanisms` under Out of Scope.
MPP Charge is an on-chain SEP-41 transfer.
MPP Session uses a channel and off-chain cumulative commitments.
Source: `https://github.com/stellar/stellar-mpp-sdk`.
Stellar docs name both one-time charge settlement and high-frequency off-chain channels.
Source: `https://developers.stellar.org/docs/build/agentic-payments/mpp`.

### q-rwa-tokenization-standards

SEP-56 remains Draft.
Raw `sep-0056.md` title is Tokenized Vault Standard.
Version is `0.1.2`.
Updated date is 2025-11-06.
SEP-41 remains the token interface in raw `sep-0041.md`.

### q-edge-strupey-ambiguous-stellar-history

A 2026-10-06 web sweep found no verified exact Stellar identity for Strupey.
The hits were unrelated names and the word stellar.
The Scout builder query also returned zero rows.
The open-world negative stays source-scoped and dated.

### q-org-sdf-enterprise-fund

`https://stellar.org/enterprise-fund` still says `portfolio totaling over $100m`.
The same page calls the fund a venture-style fund.
`https://stellar.org/blog/foundation-news/sdfs-investment-in-moneygram-international` says the MoneyGram investment came from SDF cash treasury.
The same sentence says it did not come from the Enterprise Fund.

### q-pc-cross-redstone-sep40

The 2026-06-04 RedStone article is live.
URL: `https://blog.redstone.finance/2026/06/04/reliability-at-scale-redstone-and-the-data-standard-for-stellars-rwa-moment/`.
The article identifies the SEP-40 rollout.
Scout search `q=Redstone Finance` returns project `Redstone Finance`.
Status is Live.
`generatedAt` is `2026-10-06T15:19:27.080Z`.
The short description says the project implements SEP-40.
`https://developers.stellar.org/docs/data/oracles/oracle-providers` says public price oracles are compatible with the SEP-40 interface.
Raw `sep-0040.md` is Draft, title Oracle Consumer Interface.
The article count and the Scout feed count still differ.
The avoid rule that refuses one frozen count still holds.
