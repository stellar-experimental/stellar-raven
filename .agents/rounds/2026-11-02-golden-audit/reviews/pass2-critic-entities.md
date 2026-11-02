# Pass-2 critic: cross-case entity consistency (2026-11-02)

Worktree: /private/tmp/claude-501/raven-goldens-1102 (branch eval/golden-audit-2026-11-02).
Inputs: `git diff origin/main` and `git diff HEAD` over eval/qa/corpus/battery,
eval/qa/consistency-register.json, and improvements/; the pass-1 reports; and the pass-2
`*.apply.json` and `*.verify.json` files. No file was edited.

Instruments:

- A per-case diff of judge-facing fields, HEAD to worktree (58 cases with judge-facing changes).
- Battery-wide entity greps for YieldBlox, MoneyGram, Allbridge, Varial/Freighter, xBull,
  Slender, Soroswap venues, Horizon lifecycle, event retention, P27-P30, the SCF #46 deadline,
  hackathon feed zeros, and partial-cap wording.
- `node eval/qa/lint-corpus.mjs --since origin/main --stale`: exit 1. All 485 errors are
  `lifecycle-registry` stale-hash errors. The three pass-1 `date-trap` errors are gone.
- `node scripts/improvements-lint.mjs`: one failure, "improvements/INDEX.md is stale".

## Pass-1 findings: status

| ID | Status | Basis |
|---|---|---|
| F1 / H1 | Resolved | Both YieldBlox cases now treat the 14,000 USDC as a separate borrow (tx 01c2ba75…). Both accept Script3 ~$10M (2026-02-22) and ~$10.5M (2026-03-04) when attributed. The numericInvariant, cluster-013, cluster-126, and the trap disposition match. |
| H2 | Resolved | The q-comp avoid now targets only rekt.news's $10.97M. |
| F2 | Resolved | q-scf-contract-verification-rfp-live says both sources show 2026-11-09. |
| F3 | Resolved | The avoid is round-neutral ("the current SCF round"). |
| F4 | Resolved | cluster-047, cluster-127, and the Confidential Tokens trap date the v0.8.0 Mainnet-ready status. They quote reverifyBy 2027-04-08 and 2027-04-22. |
| F5 | Resolved | The invariant is now "Mainnet protocol activation history". The trap is re-dispositioned. cluster-120 names P29 as current. |
| F6 | Resolved | The cluster-125 note gives the 2026-10-29 Varial roster. Its hash still needs a re-stamp. |
| F7 | Resolved | cluster-081, 085, and 089 are rewritten. The repeated trap fragment is gone. The `.agents/TODO.md` item at line 427 is still open (see E7). |
| F8 | Resolved | cluster-008 says CAP-73 Final/P26. |
| F9 | Resolved | q-gap-compare-hackathons dates the comparison fields to 2026-11-02. Names and placement stay detail-only. |
| F10 | Resolved | q-crp-anchors-by-corridor gives the widget/legacy split and the per-host minimum. |
| F11 | Resolved | The Etherfuse note dates the OrbitCDP grounding and drops "Live". cluster-012 drops the $280K figure. |
| F12 | Resolved | A symmetric CAP-88 caution is in q-protocol-ledger-header-fields. The q-pc-protocol-upgrade-timing answer now says the direct fields stay the same. |
| F13 | Resolved | q-asset-issue-asset-howto carries the SAC-admin caveat. |
| F14 | Resolved | Both cases give $58,585,451.99 / 582 / 906 as of 2026-11-02. The earlier $39.85M/391 figure is dated history. |
| F15 | Resolved | The staking negative case carries the dated fee-pool-paper caution and the 2026-11-02 re-sweep. |
| F16 | Resolved, with residue | Hana is now `scheduled`. The HoneyCoin note is rewritten. The three headers now say 2026-11-02. The same pattern remains elsewhere (see E5). |
| M1 | Resolved | The date-trap lint errors are gone. The register needs only the hash re-stamp. |
| M2 | Partial | 15 of the 42 listed cases no longer cite /private/tmp. 27 still do, and 15 more cases (mostly no-gospel-change re-verifications) do too. The ledger Results section still reads "Pending". |
| M3 | Mostly resolved | The SCF RFP, x402, events, and Horizon rootCauses now point at sls-096, sd-060, sd-068/069, and sd-072. q-scf-sdf-marketing-grant is still unfiled and escalated. See E4 for new stale pointers. |
| M4 | Partial / escalated | The new aggregator caps are now plain rules. The stale xBull caution is gone. The re-judge flip direction is not recorded, because it needs a paid judge run (an owner decision). The q-sep6 sd-009 cap goes to the owner. |
| M5 | Resolved | The keyFacts are behavior-based. The dated state is in the answer and notes only. |
| M6 | Resolved | Five cases are now `scheduled` with staggered reverifyBy. The ledger-entry and header keyFacts are scoped to releases v27-v30. |
| L1 | Resolved | The answer and keyFact name the stock v30.0.0 release with an as-of date. |
| L2 | Resolved | The asOf values moved. The axelar case keeps 2026-07-10 by a recorded verifier decision. |
| L3 | Resolved | The keyFact accepts either generator. |
| L4 | Resolved | The keyFact and avoid reshapes match the lint suggestions. |
| L5 | Resolved | The rootCause names the avoid item that could fire. |
| L6 | Resolved | The "Also good" line now says alloc is optional. |

## New or remaining issues

### E1 MEDIUM: an expired sd-008 partial cap stays in two cluster-120 siblings

- Pass 2 removed the sd-008 canonical-page cap from `q-pc-protocol-upgrade-timing`. The cap
  covers a cached Software Versions page that shows P26 as Mainnet-current. Its trigger expired:
  sd-008 was resolved on 2026-08-28 (improvements/resolved.json), and the case text says "fixed
  2026-08-18".
- `q-edge-fresh-latest-protocol-version` and `q-protocol-27-cap-0071` still carry the same
  sentence: "...(fixed 2026-08-18 in sd-008) is not a wrong claim; grade caps at partial for that
  older-copy quote...".
- The three cases are cluster-120 siblings. Two of them grade an expired trigger, and the third
  no longer does. The Software Versions page is also not in the ADR-0008 accepted set.
- Fix: remove the sentence from both cases, and keep their P30 leniency.

### E2 MEDIUM: the branch is not rebased on origin/main, and the sentinel pins will conflict

- `git merge-base HEAD origin/main` is 1ba59ccd (#314). origin/main is 1539a872 (#315).
- `git diff origin/main` therefore shows #315's .agents/rounds/2026-11-02-pr314-review* files as
  deleted. It also shows #315's eval/qa/source-sentinels.json changes reverted: new guards, the
  rpc-archive-provider-names and zenex-xlm-usd-market-active sentinels, new patterns, and the
  removed ledger-operation-limits sentinel.
- The worktree sentinel file (edited in pass 2) pins match the new truth.asOf. origin/main's file
  pins 10 sentinels to the old dates:
  - sdf-board-roster 2026-08-18
  - sep55-draft and sep58-draft 2026-08-04
  - flutter-sdk-soneso 2026-07-11
  - go-sdk-module 2026-07-11
  - ml-dsa-not-shipped 2026-07-11
  - instaward-cap 2026-08-04
  - soroban-sdk-advisories 2026-09-03
  - x402-no-sep 2026-10-06
- The cases now say 2026-11-02. A plain rebase conflicts. If the merge takes either side whole,
  it loses #315 or fails `npm test` (the caseAsOf check).
- Fix: rebase, merge the pass-2 caseAsOf bumps into #315's structure by hand, re-confirm each
  bumped anchor live, and run `npm run eval:qa:sentinels -- --check` and `npm test`.

### E3 LOW: the November 8 grading differs across the SCF siblings

- q-scf-open-rfps, q-scf-rfp-tooling, and q-scf-open-rfps-live (pass 2) say "do not penalize a
  dated, attributed November 8 citation".
- q-scf-current-round and q-edge-fresh-latest-scf-round keep "Grade an answer that gives November
  8 with attribution to an older or third-party source as at most partial, not wrong". The source
  of that sentence is r/Stellar and @lumenloop.
- The outcomes are defensible. The deadline is a keyFact only in the round cases. However, the
  round-case sentence is a third-party partial-cap form, which ADR-0008 and the pass-2 constraints
  bar.
- The SCF trap and cluster-011 also say the Nov-8 partial cap "became a do-not-penalize caution",
  but both round cases are trap and cluster members.
- Fix: write the round-case rule as a plain rule. 2026-11-09 meets the deadline keyFact. A dated,
  attributed Nov-8 citation of the pre-change page is not a wrong claim, but it does not meet that
  keyFact. Then re-word the trap and cluster-011 text to name only the RFP cases.

### E4 LOW: improvements text and case pointers disagree

- ll-033 evidence says "Operator site https://slender.fi/ (read 2026-11-02)". However,
  q-defi-blend-alternatives and q-defi-flash-loans both say slender.fi did not resolve on
  2026-11-02. The defi lane escalated this, and it is not fixed. Fix: re-attribute the quote to
  the 2026-08-08 cached copy.
- The sls-099 "Golden consumers" line omits q-defi-provide-liquidity-impermanent-loss, which now
  cites sls-099. This was escalated and is not fixed.
- sd-073 names q-infra-which-indexer as a consumer, and sls-097 names
  q-gap-match-partners-degrade. Both cases still say "Upstream defect ... not yet filed in
  improvements/", and neither rootCause carries the path.
- q-gap-related-projects-empty has the same "not yet filed" text, and no finding exists for it.
- q-scf-sdf-marketing-grant is still unfiled (escalated).
- `improvements/INDEX.md` is stale (improvements lint).

### E5 LOW: answer dates lag a refreshed truth.asOf

- 38 cases have truth.asOf 2026-11-02 while every "As of / on" date in the answer is older. Most
  are pass-1 re-verifications without gospel change. That state is consistent if asOf means
  "re-verified".
- Two cases need wording:
  - q-infra-horizon-vs-rpc opens "As of 2026-07-11" and dates the lifecycle label 2026-09-08.
    Its notes now record that the Lab card says "Horizon is considered deprecated." on
    2026-11-02.
  - q-comp-cross-moneygram-partnership-sep24 says "As observed on 2026-07-11" and names SEP-24 as
    MoneyGram's wallet-facing flow. It gives no dated widget/legacy split, unlike cluster-016 and
    the Decaf sibling. No avoid punishes the split, so the risk is a judge reading SEP-24 as the
    only current path.
- Fix: date the lifecycle sentence to 2026-11-02 in q-infra-horizon-vs-rpc. Add a one-line
  either-path note to the MoneyGram partnership case.

### E6 LOW: reverifyBy differs inside cluster-120 for the same Bell event

- q-protocol-version-history-list and q-pc-protocol-upgrade-timing use reverifyBy 2026-11-24 for
  the 2026-11-23 P30 Mainnet vote.
- q-edge-fresh-latest-protocol-version uses 2026-12-15, the case most exposed to the vote. It
  also lacks the explicit "a dated answer after activation may report P30" sentence that its
  siblings and the invariant carry. Its notes only say "grade what a dated live lookup shows".
- Fix: align the date to 2026-11-24, or record why it is 2026-12-15. Add the explicit P30
  sentence.

### E7 LOW: bookkeeping outside the corpus is still open

- `.agents/TODO.md` line 427, "Resolve the SCF RFP roster conflict in two goldens before
  2026-11-12", still describes the two-brief state.
- The ledger Results section reads "Pending". Pass-2 evidence points at
  ".agents/rounds/2026-11-02-golden-audit.md, batch …", but those records are in the untracked
  `.agents/rounds/2026-11-02-golden-audit/pass1/` folder.
- Every register cluster and invariant touched here needs `memberContentSha256` re-stamped
  (orchestrator; eval:qa:register is out of scope for agents).
- Some live cases still carry dated values and have the owner-routed freshness question:
  q-defi-flash-loans, q-defi-etherfuse-stablebonds, q-scf-build-tracks,
  q-eco-stellar-wallets-list, and q-defi-bridge-evm-to-stellar-axelar.

## Checked and consistent after pass 2

- YieldBlox: all six cluster-013 members, cluster-126, the invariant, and the trap agree.
- MoneyGram: cluster-016 members and q-scf-cross-decaf-sep24 agree on the widget/legacy split,
  the per-host minimum, and the 950/2,500 maximums.
- Allbridge: q-defi-allbridge-what-is and q-defi-bridge-evm-to-stellar-axelar agree on the Core
  pool discontinuation and the pending-audit Stellar status.
- Varial: the rename text (5.50.0, varial-sdk 7.0.0, freighter-api 6.0.1, Wallets Kit 2.8.0
  VarialModule) is uniform. No case names Freighter without Varial.
- x402: q-soroban-x402-auth-entry-signing and cluster-125 agree on the roster and the Albedo
  dispute.
- Slender: the over-collateralized lending and the domain-down state agree across
  q-defi-blend-alternatives and q-defi-flash-loans.
- Soroswap: the venue list agrees across q-defi-phoenix-what-is,
  q-defi-provide-liquidity-impermanent-loss, and q-defi-soroswap-what-is.
- Horizon lifecycle: only q-infra-horizon-vs-rpc carries a deprecated-label avoid. No sibling
  avoid conflicts with its sd-072 caution.
- Event retention: 120960 ledgers is uniform, and no case keeps a fixed 7-day or 24-hour default.
- Staking: the fee-pool paper caution agrees across four cases.
- Hackathons: the feed-relative zero (sls-106) agrees in q-scf-hackathons-active and
  q-scf-rfps-hackathons-live.
- SCF #46: the 2026-11-09 deadline, #45 ended, and the 906/582/$58.59M Scout population agree.
- keyFacts: none exceeds 90 characters in the battery.
