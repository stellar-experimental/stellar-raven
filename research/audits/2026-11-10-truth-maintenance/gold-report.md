# Golden truth verification, November 10, 2026

Base `8e58f7a841fa8d7e3305bf1f49f355e06f69dd96`. The author lane left the edits uncommitted. All observations below were made on 2026-11-10 UTC. Earlier publication and ledger dates are identified separately. GitHub issue #406 was the trigger for the SCF round recheck. [Issue #406](https://github.com/stellar-experimental/stellar-raven/issues/406)

## Case verdicts

Each file below is under `eval/qa/corpus/`. All ten update `truth.asOf`, `truth.reverifyBy`, `truth.verified`, `truth.sources`, and `truth.corroboration`. The latest verification carries `rootCause: ["freshness-drift"]`. Source IDs refer to the dated observations below.

| Case file | Verdict and changed golden fields | Sources | Next review |
| --- | --- | --- | --- |
| `battery/scf-grants-builders/q-scf-current-round.json` | **Changed.** `answer`, `keyFacts`, `avoid`, `notes`. No Build Award submission window was listed. #46 had moved to Initial Review after the Nov 9 deadline. #45 remained last concluded. No #47 deadline was listed. Grade the dated submission state and applicable deadline. | S1–S4 | 2027-02-04 |
| `battery/edge-behavior/q-edge-fresh-latest-scf-round.json` | **Changed.** Same fields and evidence. Removed the trap that penalized a correct report that submissions were closed. A later sourced opening is eligible for full credit. | S1–S4 | 2027-02-11 |
| `battery/scf-grants-builders/q-scf-open-rfps.json` | **Changed.** `answer`, `avoid`, `notes`. Official Q4 roster remains empty as observed. Scout changed from one synthetic submission-window row to zero and retains #46 in round metadata. Both withdrawn Q3 briefs remain closed. | S1, S3, S5–S8 | 2027-01-28 |
| `battery/scf-grants-builders/q-scf-rfp-tooling.json` | **Changed.** `answer`, `avoid`, `notes`. No developer-tooling or indexing brief appeared in the official roster. The current-quarter brief requirement and rolling interest-form invitation flow were reverified. Removed the synthetic count trap. | S1, S3, S5–S8 | 2027-02-18 |
| `battery/edge-behavior/q-edge-fresh-latest-protocol-version.json` | **Reverified unchanged.** Pubnet remains P29. Refreshed `answer` and `notes` to use the Nov 10 live observation, retain the November 23 vote context, and grade future dated observations. | P1–P3, P6–P9 | 2027-01-26 |
| `battery/protocol-core/q-pc-protocol-upgrade-timing.json` | **Changed.** `answer`, `keyFacts`, `avoid`, `notes`. Bell already activated on Testnet, and the next announced Mainnet vote remains November 23 at 17:00 UTC. Testnet's SDK deadline has passed. Explicitly grade the network, schedule, validator agreement, and SDK decoding implications. | P1–P2, P4–P13 | 2027-02-09 |
| `battery/protocol-core/q-protocol-version-history-list.json` | **Changed.** `answer`, `notes`. Historical Mainnet version/date/feature mappings and the one-cluster Whisk initialization were reverified. Updated the tail to Bell live on Testnet with a pending Mainnet vote. | P1–P10, P14–P16 | 2027-02-16 |
| `battery/history-org-tokenomics/q-hist-quantum-preparedness-plan.json` | **Changed deployment context.** Historical `answer` and grading requirements reverified unchanged. `notes` now reflect Bell and CAP-0087 live on Testnet, P29 on Pubnet, and classic-account native post-quantum signers still described as future work. | Q1–Q3, P1–P2, P4–P5, P7–P10 | 2027-02-23 |
| `proposed/tooling-infra/q-infra-testnet-reset-schedule-recovery.json` | **Reverified unchanged.** Dated `answer` and `notes` refresh. December 16 remains the date listed by Stellar Networks. There was no December notice in the status calendar and no confirmed event hour. Recheck this December-specific proposal before activation or planning the demo. | T1–T4, P8 | 2027-02-25 |
| `proposed/soroban/q-sor-reflector-testnet-contract-addresses.json` | **Reverified unchanged.** Dated `answer` refresh. All three documented IDs matched the provider config and returned an interface on Testnet. The cases stay proposed, so the battery-only sentinel workflow does not cover them. | T1, R1–R4 | 2027-03-02 |

The staggered queue runs from January 26 through March 2. The SCF phase and Bell vote event checks remain in the register. The active-case sentinels flag changes ahead of the queue dates.

## Evidence observed November 10

Source classes follow the golden-truth skill. Scout and public grant listings cite the SCF site for their round state, and the Git handbook source and rendered handbook share an editorial owner. The report treats those distinctions as provenance rather than independent announcements.

### SCF round and RFP roster

- **S1 (A, official index).** The live awards index showed #46 in Initial Review and its November 9 deadline. #45 and #44 showed Ended. No listing was in Submission and no #47 appeared. [SCF Awards](https://communityfund.stellar.org/awards)
- **S2 (A, official round record).** #46 showed Initial Review, a Build Submission closing date of November 9, Panel Review scheduled November 11–18, Community Vote scheduled November 23–December 3, and notification TBD. These are published dates. [SCF #46](https://communityfund.stellar.org/awards/recxrSMYwAl8vcglg)
- **S3 (C, read-only Scout).** At 22:51:22 UTC `meta.scfRound` reported round 46, phase Initial Review, last concluded round 45, null submission opening and closing values, and only #46 in progress. `counts` was open 0, closed 16, syntheticRounds 0. `activeQuarter` was q4-2026. [Scout open RFP response](https://stellarlight.xyz/api/rfps?status=open)
- **S4 (D, public grant index and web sweep).** The grant index showed #46 closed November 9 and the next window unannounced. Searches for `"SCF #47" "Stellar Community Fund" November 2026` and `Stellar SCF 46 Initial Review November 2026 SCF 47 submission period next` turned up older November 8 copies and no newer dated #47 schedule. Absence is scoped to the checked sources. [Grant index](https://grants.watch/programs/stellar-community-fund-build-award?awardPage=2) [Older third-party #47 check](https://www.web3grant.com/guides/reapplying-after-grant-rejection)
- **S5 (A, official handbook).** The Current Open RFPs section says “October 2026: New Q4 RFPs are coming soon.” Its two entries are placeholders. The rules require a current-quarter open brief and say eligible interest-form applicants are invited to a Build round. [RFP Track](https://stellar.gitbook.io/scf-handbook/scf-awards/build-award/rfp-track.md)
- **S6 (B, handbook source repository).** The latest path commit was `e07b4bfce158639f81908f74cfd74ec8d87f051a`, committed October 16 at 18:20:46 UTC. The patch removed the LayerZero DVN and x402 Facilitator with Bazaar briefs and inserted the placeholders. [Commit](https://github.com/stellar/scf-handbook/commit/e07b4bfce158639f81908f74cfd74ec8d87f051a) [Latest path commit API](https://api.github.com/repos/stellar/scf-handbook/commits?path=scf-awards/build-award/rfp-track.md&per_page=1)
- **S7 (C, read-only Scout).** At 22:51:23 UTC the closed roster contained `layerzero-dvn`, `x402-facilitator-bazaar` and the older `prices-api` indexing brief. [Scout closed RFP response](https://stellarlight.xyz/api/rfps?status=closed)
- **S8 (D, web sweep and community response guide).** Searches for `Stellar Community Fund RFP current open Q4 November 2026 Stellar SCF briefs dev tooling` and `Stellar Community Fund open November 2026 SCF indexing RFP` surfaced no newer published official brief. The community response guide separately states the current-quarter open-brief requirement. The indexed older Q3 handbook copy conflicts with the live page and current Git path and was treated as stale. [Community guide](https://github.com/Stellar-Light/awesome-stellar-community-fund/blob/main/docs/rfp-response-guide.md)

### Protocol version, upgrade, and history

- **P1 (C).** Horizon Pubnet reports current protocol 29 and supported protocol 30. Ledger 65413007 at 22:51:17 UTC was protocol 29. [Horizon root](https://horizon.stellar.org/) [Latest Pubnet ledger](https://horizon.stellar.org/ledgers?order=desc&limit=1)
- **P2 (C).** Read-only `getNetwork` and `getLatestLedger` reported Pubnet, P29, and ledger 65413029 at 22:53:07 UTC. [Mainnet RPC](https://mainnet.sorobanrpc.com)
- **P3 (A).** Official Mainnet dates and software/CAP headings cover P20–P29. P29 is security-focused with no new CAPs. [Software Versions](https://developers.stellar.org/docs/networks/software-versions.md)
- **P4 (C).** Testnet ledger 5665487 at 22:51:18 UTC was protocol 30. [Latest Testnet ledger](https://horizon-testnet.stellar.org/ledgers?order=desc&limit=1)
- **P5 (F).** Read-only `getNetwork` returned the Testnet passphrase and P30. `getLatestLedger` returned P30 at ledger 5665509 at 22:53:08 UTC. [Testnet RPC](https://soroban-testnet.stellar.org)
- **P6 (C).** P27 was recorded at ledger 63386819 on July 8, P28 at 64458446 on September 16 at 17:00:06 UTC and P29 at 64717645 on October 1 at 17:00:07 UTC. [P27 ledger](https://horizon.stellar.org/ledgers/63386819) [P28 ledger](https://horizon.stellar.org/ledgers/64458446) [P29 ledger](https://horizon.stellar.org/ledgers/64717645)
- **P7 (A).** The Bell guide specifies November 3 for Testnet and November 23 for Mainnet, both at 17:00 UTC. It requires an SDK upgrade before each network upgrade so clients can decode the new CAP-0088 ledger encoding. [Bell upgrade guide](https://stellar.org/blog/developers/bell-protocol-30-upgrade-guide)
- **P8 (C).** The status API lists November 23 at 17:00 UTC as scheduled for the Mainnet vote. The historical calendar marks the November 3 Testnet upgrade completed. [Upcoming maintenance](https://status.stellar.org/api/v2/scheduled-maintenances/upcoming.json) [Maintenance history](https://status.stellar.org/api/v2/scheduled-maintenances.json) [Testnet completion](https://status.stellar.org/incidents/4p75xxpd0kkv)
- **P9 (B).** Core v30.0.0, published October 16, includes CAP-0084, CAP-0087 and CAP-0088. [Core release](https://github.com/stellar/stellar-core/releases/tag/v30.0.0)
- **P10 (B).** CAP-0088 adds the millisecond value in new `StellarValue` extension arms inside `LedgerHeader.scpValue`. [CAP-0088](https://raw.githubusercontent.com/stellar/stellar-protocol/master/core/cap-0088.md)
- **P11 (A).** The network upgrade documentation explains agreement on upgrade parameters among validators. [Validator guide](https://developers.stellar.org/docs/validators/admin-guide/network-upgrades.md)
- **P12 (B).** `createUpgradesFor` checks the requested version against the last closed ledger before proposing the ledger version upgrade. [Core implementation](https://raw.githubusercontent.com/stellar/stellar-core/v30.0.0/src/herder/Upgrades.cpp)
- **P13 (A/C).** The status incident publishes the Mainnet schedule independently of the SDK guide's phrasing. [Mainnet vote status](https://status.stellar.org/incidents/w33m5pjv2q6d)
- **P14 (A).** SDF's completion announcement confirms June 8, 2022 for P19. [P19 upgrade complete](https://stellar.org/blog/developers/protocol-19-upgrade-complete)
- **P15 (B).** The CAP index confirms feature/version assignments, including P19 CAP-0021 preconditions and CAP-0040 signed-payload signers. [CAP index](https://github.com/stellar/stellar-protocol/blob/master/core/README.md)
- **P16 (B).** CAP-0063 initializes `ledgerMaxDependentTxClusters` to one during the P23 transition. [CAP-0063](https://github.com/stellar/stellar-protocol/blob/master/core/cap-0063.md)

### Quantum preparedness

- **Q1 (A).** The June 9, 2026 plan describes Soroban ML-DSA-44/65 verification in its 2026 stage, protocol-level opt-in migration in its 2027 stage, and deprecation timing based on the threat. [Preparedness Plan](https://stellar.org/blog/foundation-news/introducing-the-quantum-preparedness-plan)
- **Q2 (A).** The Bell explainer says native classic-account post-quantum signing is a future change and network transaction signatures remain Ed25519. [Bell overview](https://stellar.org/blog/developers/introducing-bell-protocol-30-on-stellar)
- **Q3 (B).** CAP-0087 is implemented for protocol 30, with ML-DSA-44/65/87 Soroban verification host functions. P4–P5 establish Testnet activation separately. [CAP-0087](https://raw.githubusercontent.com/stellar/stellar-protocol/master/core/cap-0087.md)

### Testnet reset and Reflector

- **T1 (A).** Stellar Networks still lists December 16, 2026 and documents a reset to genesis, clearing ledger entries, transactions and history. It describes 17:00 UTC as typical and links the Horizon resynchronization runbook. [Networks](https://developers.stellar.org/docs/networks.md)
- **T2 (B).** The linked packages runbook corroborates database recreation and resynchronization. Its generic time is 09:00 UTC, which differs from the Networks page. P8 had no December reset announcement when read. [Operator reset runbook](https://github.com/stellar/packages/blob/master/docs/testnet-reset.md)
- **T3 (D).** Triport repeats December 16 and attributes it to Stellar Docs. It provides a separate class with the same schedule authority. [Chain reference](https://triport.io/tools/chain-config/stellar)
- **T4 (A).** The Stellar.org operators describe an automated setup script for recreating required Testnet accounts. [Operator recovery example](https://stellar.org/blog/developers/how-stellar-org-recovers-from-a-testnet-reset)
- **R1 (A).** Stellar Oracle Providers names the three public Reflector Testnet feeds and their full IDs. [Oracle Providers](https://developers.stellar.org/docs/data/oracles/oracle-providers.md)
- **R2 (C).** Reflector's own config reports network `testnet` and matches `CAVLP5DH2GJPZMVO7IJY4CVOD5MWEFTJFVPD2YY2FQXOQHRGHK4D6HLP` to `pubnet`, `CCYOZJCOPG34LLQQ7N24YXBM7LL62R7ONMZ3G6WZAAYPB5OYKOMJRN63` to `exchanges`, and `CCSSOHTBL3LEWUCBBEB5NJFC2OKFRC74OWEIJIZLRJBGAAU4VMU5NV4W` to `forex`. [Reflector config](https://orchestrator-testnet.reflector.network/config)
- **R3 (F).** `stellar contract info interface --no-cache --config-dir <local scratch> --contract-id <full id> --rpc-url https://soroban-testnet.stellar.org --network-passphrase 'Test SDF Network ; September 2015'` exited 0 for each ID with 89 lines of interface output. P5 verifies the passphrase independently. [Testnet RPC](https://soroban-testnet.stellar.org)
- **R4 (B).** The Reflector contract documentation describes price validity and timestamps separately from interface compatibility. [Reflector contract repository](https://github.com/reflector-network/reflector-contract/blob/master/README.md)

## Consistency and generated artifacts

- **SCF clusters 011, 027, 030, 033, 040, 081, 085, 089, 121 and 122.** The two round cases agree with each other. The RFP cases distinguish brief status, synthetic row and proposal availability. The live RFP siblings retain explicitly dated November 5 examples and allow newer observations. Hummingbot and source verification are historical closed examples. Build award cap, tracks, entry and voting mechanics, historical #43 results, totals, and named awards remain consistent. Updated the SCF Submission invariant and the SCF phase-change trap.
- **Protocol clusters 007, 024, 025, 032, 044, 062, 067, 104, 112, 118, 119 and 120.** Rechecked the version, timeline, CAP semantics, Whisk configuration, P27 delegation, and SDK relationships. No historical activation moved. The Testnet activation does not alter the Mainnet version, P27 credentials, or the CAP-0088 distinction between direct header fields and nested `scpValue` encoding. The quantum dormant-account, StrKey, ledger close-time, ZK and Testnet/Futurenet siblings either give dated observations or discuss separate capabilities. Updated the Mainnet activation invariant and Bell event trap. The November 23 vote still triggers a post-vote check.
- **Proposal siblings.** The existing network-selection, Friendbot and test identity cases agree on reset and recovery semantics. The existing Reflector, oracle landscape, repository lookup, and defensive-consumption cases distinguish deployment network, interface, and price validity. No register cluster contains either proposal.
- `npm run eval:qa:register` restamped hashes and reopened 22 clusters, two invariants and two date-contingent traps. Author sweep found no remaining contradiction. Independent re-derivation and register closure are pending coordinator review. This session exposes `HC_TERMINAL_ID` for handoff, while the repo's legacy Herdr control prerequisite `HERDR_ENV=1` is absent. The worktree's `.agents/` is read-only, so this report serves as the lane's evidence for the coordinator's round ledger.
- Reauthored the two #406 anchors as `scf-46-initial-review` and `scf-46-initial-review-edge`, matching the #46 phase and historical deadline. Refreshed `scf-45-ended` and `mainnet-protocol-29`. Added RFP roster anchors for both RFP cases, Pubnet version anchors for the latest-version and history cases, and an upcoming Mainnet vote anchor for the timing case.
- Parsed diff confirmed exactly the eight intended active cases changed in `cases.json`. Sample membership is identical and its corpus digest regenerated. The lifecycle registry includes the same reserved IDs and states with updated digests for the ten owned cases. The two proposed cases stayed in their existing proposal paths.
- The brief prohibited paid evals and QA answering. The plan comparison used a saved result only. The saved review artifact carries the prior verdict for both freshness edge cases and an incomplete quantum row, but has no raw answers for those cases. The brief precluded a paid rejudge.

## Upstream candidates for coordinator routing

- **Software Versions Testnet guidance lags the network.** The current page tells Testnet users its recommended software versions are provided below, yet its highest Testnet entry is Protocol 29. The Bell upgrade completed November 3 and live Testnet Horizon and RPC both returned Protocol 30. The Bell guide requires a compatible SDK because of CAP-0088. Reproduced November 10 against the primary page and live APIs. [Software Versions](https://developers.stellar.org/docs/networks/software-versions.md) [Testnet status](https://status.stellar.org/incidents/4p75xxpd0kkv) [Testnet Horizon](https://horizon-testnet.stellar.org/ledgers?order=desc&limit=1)
- **The linked legacy Testnet reset runbook gives conflicting generic timing.** Networks says resets typically happen at 17:00 UTC. Its linked packages procedure says resets always occur at 09:00 UTC. The next date is published, and the calendar lacks an event-specific December time at observation. Reproduced November 10. [Networks](https://developers.stellar.org/docs/networks.md) [Linked runbook](https://github.com/stellar/packages/blob/master/docs/testnet-reset.md) [Status calendar](https://status.stellar.org/api/v2/scheduled-maintenances/upcoming.json)
- Scout's earlier Q3 false-open mismatch did not recur. The November 10 API correctly lists both historical briefs as closed and carries round metadata with zero synthetic rows. Existing `sls-096` remains resolved. No new upstream issue was filed.

## Verification gates

| Command | Exit | Result |
| --- | --- | --- |
| `npm run eval:qa:compile` | 0 | Regenerated 501 active cases, the 30-case sample, and the 507-ID lifecycle registry. |
| `npm run eval:qa:lint -- --stale --enforce-floors` | 0 | 0 errors, 81 warnings. |
| `npm run eval:qa:lint -- --since HEAD --stale --enforce-floors` | 0 | Diff-aware gospel gate passed with 0 errors, 81 warnings. |
| `npm run eval:qa:register` | 0 | Restamped the touched entries. |
| `npm run eval:qa:register -- --check` | 0 | Register up to date. |
| `npm run eval:qa:sentinels -- --check` | 0 | 31 sentinels, 0 errors, 0 stale. |
| `npm run eval:qa:sentinels -- --ids scf-46-initial-review,scf-46-initial-review-edge,scf-45-ended,scf-rfp-q4-roster,scf-rfp-q4-tooling-roster,mainnet-protocol-29,mainnet-protocol-29-latest,mainnet-protocol-29-history,bell-mainnet-vote-scheduled` | 0 | All nine live checks held with one match each. |
| `npm test` | 0 | 151 files passed, 3,386 tests passed, 3 expected failures. No paired-launch sandbox error. |
| `npm run eval:selftest` | 0 | All checks passed. |
| `npm run eval:plan -- tmp/gold-evidence/reviewed-run.json` | 0 | Rows and summary exactly match the HEAD grader on the same saved artifact. |
| `git diff --check` | 0 | No whitespace errors. |

Probe bodies, captured interfaces, and gate logs are under ignored `tmp/gold-evidence/`.

## Fixes applied

Corpus paths below are relative to `eval/qa/corpus/`. Register and sentinel paths are relative to the repository root.

| Review item | File and field | Change |
| --- | --- | --- |
| R1 | `battery/protocol-core/q-pc-protocol-upgrade-timing.json`, `battery/edge-behavior/q-edge-fresh-latest-protocol-version.json`, and `battery/protocol-core/q-protocol-version-history-list.json` → `truth.reverifyBy`. `eval/qa/consistency-register.json` → `dateContingentTraps.entries[0].disposition`. | Restored 2026-11-24 in all three cases and appended the three lint-enforced dates to the Bell trap disposition. |
| R2 | `eval/qa/source-sentinels.json` → `sentinels[]`. | Added `scf-47-not-listed` and `scf-47-not-listed-edge` with the review's guarded absence check on the official Awards page and `caseAsOf` 2026-11-10. |
| R3 | `proposed/tooling-infra/q-infra-testnet-reset-schedule-recovery.json` and `proposed/soroban/q-sor-reflector-testnet-contract-addresses.json` → `truth.reverifyBy`. | Set 2026-12-02 for the reset schedule and 2026-12-17 for the Reflector contracts. |
| R4 | `battery/scf-grants-builders/q-scf-open-rfps.json` and `battery/scf-grants-builders/q-scf-rfp-tooling.json` → `truth.sources[]`, `truth.corroboration[]`, and `truth.verified.evidence`. | Documented the community guide's provenance and current-quarter rule. Removed it from the roster evidence and kept the sweep in verified evidence. Added the grants.watch record to the sources and application-flow evidence with its reliance on SCF stated. |
| R5 | `battery/scf-grants-builders/q-scf-current-round.json` and `battery/edge-behavior/q-edge-fresh-latest-scf-round.json` → `truth.verified.evidence`. | Recorded both dated #47 queries and the absence of a dated schedule in the results. |
| R6 | `tmp/gold-report.md` → P8, P13, and the first upstream candidate. | Used canonical status incident IDs `4p75xxpd0kkv` and `w33m5pjv2q6d`. Both URLs returned HTTP 200. |
| S1 | `battery/scf-grants-builders/q-scf-current-round.json` and `battery/edge-behavior/q-edge-fresh-latest-scf-round.json` → `golden.keyFacts[2]`. | Requires the open round's published deadline or a statement that no upcoming deadline is published. Shortened the suggested wording to meet the key-fact lint. |
| S2 | `battery/protocol-core/q-pc-protocol-upgrade-timing.json` → `golden.keyFacts[0]`. | Requires the relevant network's next announced vote or its absence as of the source date. Shortened the suggested wording to meet the key-fact lint. |
| S3 | `battery/history-org-tokenomics/q-hist-quantum-preparedness-plan.json` → `truth.reverifyBy` and `golden.notes`. | Restored 2026-12-01 and added “Accept a later sourced Mainnet activation.” |
| S4 | `battery/scf-grants-builders/q-scf-current-round.json` and `battery/edge-behavior/q-edge-fresh-latest-scf-round.json` → `truth.reverifyBy`. | Set 2026-12-04 and 2027-01-07, respectively. |
| S5 | `eval/qa/source-sentinels.json` → `sentinels[]` for `scf-46-submission-deadline` and `scf-46-submission-deadline-edge`, fields `id` and `check.pattern`. | Restored the existing deadline IDs and used the review's phase-agnostic pattern. Both checks also detect a return to Submission. The R2 checks detect the appearance of #47. |
| S6 | `eval/qa/consistency-register.json` → `numericInvariants.entries[]`, Mainnet protocol activation history, `rule`. | Restored the rule accepting a later dated answer that reports P30 as current. |
| S7 | `eval/qa/consistency-register.json` → `clusters.entries[]`, clusters 081, 122, 025, 067, and 120, `note`. | Updated SCF round, RFP and synthetic-row observations, and separated completed Testnet activation from the scheduled Mainnet vote. The coordinator owns register closure. |
| S8 | `battery/edge-behavior/q-edge-fresh-latest-protocol-version.json`, `battery/protocol-core/q-pc-protocol-upgrade-timing.json`, `battery/protocol-core/q-protocol-version-history-list.json`, and `battery/history-org-tokenomics/q-hist-quantum-preparedness-plan.json` → `truth.sources[].class` and applicable `truth.corroboration[].evidence[].class`. `tmp/gold-report.md` → P2. | Classified all six November 10 Mainnet RPC records as C, matching November 3. The earlier November 2 provenance is historical. |

For S5, the sentinel runner evaluated HTML captured live from Awards. Replacing Initial Review with Panel Review, Community Vote, or Ended held both #46 and #47 checks. Changing the #46 deadline drifted both #46 checks and failed the unchanged #47 guards. Changing the phase to Submission drifted both #46 checks. Inserting a #47 Submission row held the #46 checks and drifted both #47 checks.

Parsed artifact verification found exactly the eight intended active case changes and ten changed lifecycle digests. Sample membership and order, lifecycle IDs, paths, and states matched HEAD. The date backstops above supersede the initial author-pass dates in this report.

### Gate results after fixes

| Command | Exit | Result |
| --- | --- | --- |
| `npm run eval:qa:compile` | 0 | Regenerated 501 active cases, the 30-case sample, and the 507-ID lifecycle registry. |
| `npm run eval:qa:register` | 0 | Re-stamped the affected entries and left them open for coordinator closure. |
| `npm run eval:qa:lint -- --stale --enforce-floors` | 0 | 0 errors and the same 81 warnings as the original pass. |
| `npm run eval:qa:lint -- --since HEAD --stale --enforce-floors` | 0 | 0 errors and 81 warnings. |
| `npm run eval:qa:register -- --check` | 0 | Register up to date. |
| `npm run eval:qa:sentinels -- --check` | 0 | 33 sentinels, 0 errors, 0 stale. |
| `npm run eval:qa:sentinels -- --ids scf-46-submission-deadline,scf-46-submission-deadline-edge,scf-45-ended,scf-47-not-listed,scf-47-not-listed-edge,scf-rfp-q4-roster,scf-rfp-q4-tooling-roster,mainnet-protocol-29,mainnet-protocol-29-latest,mainnet-protocol-29-history,bell-mainnet-vote-scheduled` | 0 | All 11 held live. The two absence checks had zero matches, and each presence check had one. |
| `npm test` | 0 | 151 files passed, with 3,386 tests passing and three expected failures. |
| `npm run eval:selftest` | 0 | All checks passed. |
| `npm run eval:routing -- --gate` | 0 | Legacy, skills, and holdout gates passed. |
| `npm run eval:plan -- tmp/gold-evidence/reviewed-run.json` | 0 | Saved rows and summary matched the HEAD grader. |
| `git diff --check` | 0 | Clean. |

The final logs, live HTML and mutation outcomes are under `tmp/gold-evidence/fixes/`. Worktree edits are uncommitted for the coordinator. No paid eval, QA answering run, or upstream write occurred.
