# Pass-2 critic: rubric hazards (2026-11-02)

Worktree: `/private/tmp/claude-501/raven-goldens-1102` (branch `eval/golden-audit-2026-11-02`).
Role: read-only critic. No file was edited.
Inputs: `git diff origin/main` and `git diff HEAD` (pass 2 only) over `eval/qa/corpus/battery`,
`eval/qa/consistency-register.json`, `improvements/`; the pass-1 reports; the pass-2 apply, verify,
and matrix files in `/private/tmp/claude-501/golden-audit/pass2/`.

Instruments:

- `node eval/qa/lint-corpus.mjs --since origin/main --stale` returned exit 1 with 485 errors and 76
  warnings. All 485 errors are `[lifecycle-registry] caseContentSha256 is stale`. These are
  expected until the orchestrator runs `eval:qa:compile` and `eval:qa:register`. No `[date-trap]` or
  `[numeric]` error remains.
- `npm run improvements:lint` failed with one error: "improvements/INDEX.md is stale".
- `node scripts/scan-secrets.mjs --tree` was clean. A regex sweep of the diff and of the untracked
  `improvements/` and `.agents/` files found no S-seeds, `sk-`, `ghp_`, AKIA, Bearer tokens, or
  `LUMENLOOP_API_KEY` values.
- Live checks on 2026-11-02:
  - `dig slender.fi` returned NXDOMAIN.
  - The xBull App Store URL `id6705122563` returned 404, and an iTunes lookup returned 0 results.
  - The Google Play URL returned 404.

## Pass-1 finding status

| Finding | Status | Note |
|---|---|---|
| H1 / F1 | Resolved | Both YieldBlox cases, numericInvariants, cluster-013/126, and the trap now agree on the separate 14,000 USDC borrow and the dated Script3 figures. |
| H2 | Resolved | `avoid[2]` now targets only the rekt.news $10.97M misattribution. |
| M1 | Resolved | No date-trap lint error. The Protocol invariant was retargeted to P27/P28/P29. Confidential Tokens and SCF traps are reviewed. |
| M2 | **Open** | See R1. 42 cases still cite `/private/tmp`. |
| M3 | Mostly resolved | sls-096, sd-060, sd-068/069/070, sd-072, sls-103/105/106 are filed and cited. `q-scf-sdf-marketing-grant` is escalated and unfiled. See R4. |
| M4 | Partly resolved | The SCF RFP caps are now symmetric plain rules. The xBull caution was removed. Many aggregator and cached-copy caps remain (R3), and no re-judge record exists (R6). |
| M5 | Resolved | The `q-scf-open-rfps` and `q-scf-rfp-tooling` keyFacts are behavioral. |
| M6 | Resolved | The listed cases are now `scheduled`, or their dated text was removed (memos). One new case has the same problem (R7). |
| L1 | Resolved | The count is dated and scoped to stock v30.0.0. |
| L2 | Resolved or explained | The asOf values were refreshed. `q-defi-bridge-evm-to-stellar-axelar` keeps 2026-07-10 because not every volatile claim was re-verified, per the rule. |
| L3 | Resolved | — |
| L4 | Mostly resolved | One multi-predicate keyFact and some judge-blind avoids remain (R9). |
| L5 | Partly resolved | `rootCause[0]` is still a score rationale (R8). |
| L6 | Resolved | — |
| F2–F16 | Resolved | Checked in each case and in register clusters 008, 047, 081, 085, 120, 125, 127 and the traps. |

## Remaining and new issues

### R1 (medium): evidence still points at /private/tmp, and pass-2 ledger references point at nothing

- 42 cases still cite `/private/tmp/claude-501/golden-audit/{matrices,verify}/*.json`. Examples are
  `q-eco-freighter-wallet`, `q-tool-freighter-wallet`, `q-raph-lobstr-legitimacy`,
  `q-pc-address-types-strkey`, `q-protocol-27-cap-0071`, `q-edge-fresh-latest-protocol-version`,
  `q-eco-pyusd-stellar-freshness`, and `q-sor-p23-auto-restore-extendto`.
- `q-sor-doc-page-sections-followup` cites `/private/tmp/claude-501/raven-goldens-1102/specs/stellar-docs.json`.
  That is the repository file `specs/stellar-docs.json`.
- The pass-1 summaries now exist under `.agents/rounds/2026-11-02-golden-audit/pass1/<batch>.json`
  (untracked). The case references were not moved to point at them.
- Pass-2 evidence cites ".agents/rounds/2026-11-02-golden-audit.md, task <name>". The ledger has no
  pass-2 content, and no `pass2/` directory exists in the repository.
- The ledger still says "Matrices ... live outside the repository under `/private/tmp/...`". Its
  Results section still says "Pending".
- No pass-2 lane escalated the 42 cases. Lanes fixed only the cases they owned.
- Fix:
  1. Commit compact pass-2 summaries under `.agents/rounds/2026-11-02-golden-audit/pass2/`.
  2. Repoint each `/private/tmp` reference to `pass1/<batch>.json` or `pass2/<task>.json`.
  3. Rewrite the ledger Method paragraph and fill in Results.

### R2 (medium): an expired sd-008 cap is removed in one case and kept in two siblings

- Pass 2 removed the Software Versions older-copy partial cap from `q-pc-protocol-upgrade-timing`.
  The reasons were that the trigger expired (sd-008 is in `improvements/resolved.json`, and the live
  page carries the P27/P28/P29 Mainnet sections) and that the cap is outside ADR-0008.
- `q-edge-fresh-latest-protocol-version` and `q-protocol-27-cap-0071` still carry the same cap.
- Those two cases also say the fix date is "2026-08-18". The pass-2 evidence gives 2026-08-28
  (stellar-docs#2574 / PR #2743).
- Fix: remove the cap from both cases, and record the correct fix date in their evidence.

### R3 (medium): caps outside ADR-0008 are kept or removed inconsistently, and one was widened

- ADR-0008 accepts exactly three cases: base reserve, Horizon lifecycle, and RPC pagination.
- 23 changed cases still carry "canonical Scout/LumenLoop source ... caps at partial" cautions for
  aggregator claims:
  - Scout/LumenLoop builder and person-lookup cases: `q-builder-by-region-latam`,
    `q-builder-by-scf-tier`, `q-builder-content-by-person`, `q-builder-justin-rice-history`,
    `q-builder-lumenloop-regions-vocab`, `q-builder-rust-soroban-devs`,
    `q-org-mazieres-chief-scientist`, `q-gap-semantic-directory-fallback`,
    `q-edge-open-world-recovery-after-narrow-miss`, `q-edge-strupey-ambiguous-stellar-history`.
  - DeFi and directory cases: `q-defi-named-newer-protocols`, `q-defi-reflector-oracle`,
    `q-defi-rwa-scf-similar`, `q-defi-streaming-payments-prior-art`, `q-edge-fresh-latest-blend-tvl`,
    `q-pc-l2-payment-channels-starlight`, `q-asset-stablecoin-issuers-discovery`,
    `q-scf-sdf-bug-bounty`.
  - History cases: `q-hist-remittance-corridors`, `q-hist-scp-rewrite-2015`.
  - Wallet and regional cases: `q-eco-stellar-wallets-list`, `q-tool-wallets-comparison`,
    `q-scf-regional-india`.
- Pass 2 removed this same pattern from `q-eco-xbull-wallet`, `q-scf-total-distributed`, and the
  five SCF RFP cases. Yet it edited `q-eco-stellar-wallets-list` (sls-024) and
  `q-tool-wallets-comparison` (sls-033) and kept their caps.
- Pass 1 widened the `q-scf-regional-india` cap (ll-007): it added "or with its earlier August
  14–18, 2026 dates". This cap also conflicts with that case's `avoid[3]` ("Do NOT repeat the stale
  Goa/July Builders Camp description").
- 26 cases carry "cached or older copy" caps whose upstream fixes are three or more months old.
  The fixes include sls-020/025/026 (2026-07-14/15), sd-012 (2026-07-27), and sk-001 (2026-07-15).
  The cases include `q-hot-sdf-transparency-wallets-reports`, `q-org-sdf-structure-mandate`,
  `q-sor-p23-auto-restore-extendto`, `q-soroban-deploy-cli`, and `q-tool-cli-testnet-identity-howto`.
  Pass 2 used this same "expired" reason to remove sls-013 from `q-scf-total-distributed`.
- Only the sd-009 cap (`q-sep6-sep24-sep31-choice`, `q-sep-6-24-deprecation`) was sent to the owner.
- These caps grant leniency in one direction only. The battery applies them unevenly.
- Fix:
  - Put the full list in the ledger as an owner decision.
  - Remove the caps whose trigger expired (fixed upstream, and no live surface carries the wording).
  - Change the aggregator caps to plain correct/wrong rules or symmetric do-not-penalize rules.
  - Revert the `q-scf-regional-india` widening.

### R4 (medium): unfiled findings and dangling "not yet filed" text

- `q-scf-sdf-marketing-grant` evidence still says "not yet filed in improvements/ (escalated to the
  round orchestrator)". The two-page SDF conflict has no finding. This is escalated but not resolved.
- These findings are now filed and name their cases, but the case evidence still says "not yet
  filed" and rootCause does not cite the path:

  | Case | Finding |
  |---|---|
  | `q-infra-which-indexer` | sd-073 (its rootCause describes the docs defect with no path) |
  | `q-gap-match-partners-degrade` | sls-097 |
  | `q-aas-claim-received-claimable-balances` | sd-061 |

- These upstream defects still have no finding:
  - `q-gap-related-projects-empty`: Lumenloop returns `get_related_projects` `data:[]` for a
    nonexistent ID.
  - `q-eco-xbull-wallet`: the notes say Lumenloop's xbull description lists stale Android and iOS
    support.
- The sls-099 "Golden consumers" line omits `q-defi-provide-liquidity-impermanent-loss`, which now
  cites sls-099.
- `improvements:lint` fails because `improvements/INDEX.md` is stale. Regenerate it with
  `npm run improvements:index`.
- Fix: file the SDF marketing-grant and Lumenloop findings, cite the paths in rootCause, replace the
  "not yet filed" evidence lines, and regenerate the index.

### R5 (low): live-read claims for a dead domain

- `improvements/lumenloop/ll-033-slender-record-collateral-misstatement.md` says "Operator site
  https://slender.fi/ (read 2026-11-02)".
- `q-defi-flash-loans` evidence has "2026-11-02 [A] https://slender.fi/ — ...".
- slender.fi is NXDOMAIN: the defi lane found this, and this critic re-checked it on 2026-11-02.
  The quote exists only in a cached copy from 2026-08-08. The same case's own evidence records the
  NXDOMAIN, so its evidence contradicts itself.
- The defi lane escalated this, but it is not fixed.
- Fix: label the source as a cached copy with the cache date and class D, in ll-033 and in the case.

### R6 (low): no re-judge record (rest of M4)

- The ledger Results section still says "Pending". No step-6 re-judge flip direction is recorded.
- Pass 2 itself is balanced. Across its 71 cases, it added about as many plain-wrong rules and
  avoids as do-not-penalize lines.
- Pass 1 added leniency to 52 cases and was not re-judged.
- Re-judging is a paid operation, so it was correctly not run.
- Fix: record it in the ledger as an open owner action.

### R7 (low): dated volatile content under the wrong freshness tag

- New in pass 1: `q-pc-protocol-26-yardstick` (stable, no asOf or reverifyBy) says "as of
  2026-11-02 its CAP preamble lists the protocol version as TBD" for CAP-0081.
- Already on main: stable dated values remain in `q-defi-reflector-oracle`,
  `q-defi-wisdomtree-crdt`, `q-eco-lobstr-wallet`, and `q-eco-dex-saturation`.
- Escalated to the owner: `q-defi-flash-loans`, `q-defi-etherfuse-stablebonds` (asOf 2026-07-10),
  `q-eco-stellar-wallets-list`, `q-defi-bridge-evm-to-stellar-axelar`, and `q-scf-build-tracks` are
  live-tagged with dated values. The scf-rfp matrix counts 83 of 154 live cases with this pattern,
  so this is a battery-wide policy question.
- Fix:
  - Move the CAP-0081 date clause to the notes, or tag the case `scheduled` with a reverifyBy.
  - Record the live-with-dated-example policy question in the ledger.

### R8 (low): a rootCause entry is still a score rationale

- `q-asset-wallet-sdk-seps` `rootCause[0]` is "golden omitted true SEP-7 and multi-language facts
  that a correct answer may state".
- `rootCause[1]` now names the avoid item that could fire.
- Fix: drop `rootCause[0]`.

### R9 (low): shape leftovers

- `q-comp-yieldblox-oracle-incident` keyFacts[2] joins two predicates: the separate 14,000 USDC
  borrow, and valuations as source-specific.
- Some avoids in cases that pass 2 changed depend on process the judge cannot see:
  - `q-scf-open-rfps-live` `avoid[1]`: "...without checking the live status metadata".
  - `q-scf-contract-verification-rfp-live` `avoid[0]`: "...without current status evidence".
  - Both raise lint sourcing-guard warnings.
- Fix: split the keyFact, and phrase each avoid as answer-visible content, such as "undated" or
  "unattributed".

## Checked and clean

- keyFacts over 90 characters: none in any changed case. `q-tw-escrow-api-auth-custody` is fixed.
- reverifyBy: none is before 2026-11-10. The dates near 2026-11-10 and 2026-11-11 are tied to
  events: the #46 deadline is 2026-11-09. The most dates on one day across the battery is 5, so
  there is no cliff. Every scheduled case has an asOf and a reverifyBy.
- Pinned disputed values:
  - `q-scf-hummingbot-kelp-closed-rfp` moves from disputed to confirmed-as-of with A, B, and C
    evidence. Scout is correctly not used to corroborate itself.
  - `q-soroban-x402-auth-entry-signing` stays disputed for Albedo.
- New plain-wrong rules were spot-checked and are well-founded:
  - The `q-sor-build-target-wasm32v1` cargo shortcut rule has a local repro in sd-075.
  - The `q-soroban-publish-events` 7-day ceiling rule matches stellar-rpc v30.0.0.
  - The `q-defi-blend-alternatives` Slender collateral rule has a Certora audit and DefiLlama as
    sources.
  - The new xBull store avoid is supported: both store URLs return 404 and the iTunes lookup is
    empty on 2026-11-02.
- The `q-infra-horizon-vs-rpc` Lab-card cap is inside the ADR-0008 Horizon-lifecycle set, names
  sd-072, and has an expiry.
- Secrets: clean (see Instruments).
