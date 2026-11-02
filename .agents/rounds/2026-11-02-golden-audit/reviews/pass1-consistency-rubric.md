# Consistency pass: rubric and evidence hazards (2026-11-02)

Scope: the 204 listed cases in `git diff origin/main -- eval/qa/corpus/battery`
(worktree `/private/tmp/claude-501/raven-goldens-1102`, branch `eval/golden-audit-2026-11-02`).
Lens: score laundering, avoid items that can punish true claims, judge-blind avoid items, pinned
disputed values, volatile facts with no as-of date, keyFacts over 90 characters, rootCause entries
that are score rationales, evidence that a stranger cannot re-walk, reverifyBy clustering, and
secrets. No file was edited.

Instruments: `node eval/qa/lint-corpus.mjs --since origin/main --stale` (exit 1: 488 errors, 65
warnings; 485 errors are expected `lifecycle-registry` stale-hash errors until
`eval:qa:compile`/`register` run), `node scripts/scan-secrets.mjs --tree`, and parsed-JSON diff
scripts over each listed case against `origin/main`.

## High

### H1. YieldBlox siblings contradict each other and the register invariant

- IDs: `q-comp-yieldblox-oracle-incident`, `q-hist-yieldblox-v2-2026-exploit`.
- `q-comp-yieldblox-oracle-incident` now asserts two things. First, a separate earlier attacker
  borrow of 14,000 USDC (tx `01c2ba75…`). Second, a confirmed Script3 2026-03-04 post-mortem figure
  of about $10.5M net loss.
- `q-hist-yieldblox-v2-2026-exploit` is also changed in this diff. It still says that the 14,000
  USDC was a pre-existing liability and that the Script3 $10.5M figure is unverified.
- Its `avoid[1]` and `avoid[2]` therefore punish claims that the sibling marks `confirmed`.
- The q-comp evidence names this contradiction ("CONTRADICTS this correction, escalated"). The
  q-hist sibling sweep still records "consistent".
- `consistency-register.json` numericInvariants "YieldBlox borrowed XLM USDC totals" still says
  the 14,000 USDC was "a PRE-EXISTING liability, not a separate earlier borrow".
- The dateContingentTraps YieldBlox disposition still says that no final post-mortem exists.
- Fix: re-derive q-hist from the Script3 post-mortem and Horizon tx `01c2ba75…`. Align its answer,
  avoid[1], avoid[2], and notes with q-comp, or encode the point as disputed in both cases. Update
  the invariant rule and the trap disposition, then run `npm run eval:qa:register`.

### H2. A q-comp avoid can punish a possibly true Script3 figure

- ID: `q-comp-yieldblox-oracle-incident`, `avoid[2]`: "Do NOT attribute a net-loss figure other
  than ~$10.5M to Script3".
- The sibling golden says "Script3 reported about $10M", which is a different and earlier Script3
  statement.
- An answer that correctly quotes that dated Script3 figure fires the avoid.
- The evidence shows that the real hazard is narrower: a Perplexity answer misattributed rekt's
  $10.97M to Script3.
- Fix: narrow the item to the known false claim, for example "Do NOT attribute rekt.news's $10.97M
  to Script3". Accept any dated, attributed Script3 statement.

## Medium

### M1. The register dispositions are stale; the lint fails on three date traps

- IDs: `q-scf-confidential-tokens-preview`, `q-sor-confidential-tokens`,
  `q-tool-cctp-stellar-integration`, `q-edge-fresh-latest-protocol-version`,
  `q-protocol-version-history-list`, `q-pc-protocol-upgrade-timing`, `q-scf-open-rfps`,
  `q-scf-rfp-tooling`.
- The lint reports `ERROR [date-trap]` because the dispositions still give reverifyBy 2026-11-19,
  2026-12-15, and 2026-11-26. The cases now give 2027-04-08, 2027-04-22, and 2027-03-04.
- The Protocol trap trigger (Protocol 28 activation) fired on 2026-09-16. The disposition still
  says "open — P27 is current as of 2026-08-30".
- The numericInvariants entry "Protocol 27 Mainnet version" still names Protocol 27 (Zipper) as
  authoritative, but the goldens now say that Mainnet runs Protocol 29. The lint shows a numeric
  fuzzy warning on `q-edge-fresh-latest-protocol-version`.
- The SCF entry still describes the two-brief roster conflict as open. Its cluster notes still say
  "two current Q3 briefs".
- This diff does not touch the register.
- Fix: update each disposition, the Protocol invariant, and the member hashes in the same change.
  Then run `npm run eval:qa:register` and `eval:qa:lint -- --since origin/main --stale`.

### M2. Strangers cannot re-walk the independent-review evidence

- IDs (42 listed cases): `q-eco-freighter-wallet`, `q-eco-xbull-wallet`,
  `q-raph-lobstr-legitimacy`, `q-ti-find-export-secret-key`, `q-tool-freighter-wallet`,
  `q-crp-dtcc-stellar-connection-plan`, `q-pay-moneygram-ramps`,
  `q-rwa-projects-tokenizing-stellar`, `q-rwa-tokenization-standards`,
  `q-smart-wallet-fee-sponsorship`, `q-x402-payment-verification`,
  `q-eco-pyusd-stellar-freshness`, `q-eco-stablecoins-on-stellar`,
  `q-eco-stellar-rwa-stablecoin-volume`, `q-gap-leaderboard-project-not-builder`,
  `q-edge-fresh-latest-protocol-version`, `q-edge-noinfo-sep-9999`,
  `q-edge-noinfo-stellar-pos-staking-rewards`, `q-pc-account-merge-reclaim-reserve`,
  `q-pc-address-types-strkey`, `q-pc-bucketlist-vs-merkle-inclusion-proof`,
  `q-pc-cross-redstone-sep40`, `q-pc-fee-bump-channel-accounts-feepool`,
  `q-pc-l2-payment-channels-starlight`, `q-protocol-23-whisk-caps`, `q-protocol-27-cap-0071`,
  `q-protocol-accounts-signers-thresholds`, `q-sor-deploy-invoke-from-js-sdk`,
  `q-sor-doc-page-sections-followup`, `q-sor-evm-to-soroban-porting`,
  `q-sor-p23-auto-restore-extendto`, `q-soroban-cli-bindings`, `q-soroban-av-passkeys-talk`,
  `q-soroban-contract-build-verification`, `q-soroban-factory-pattern`,
  `q-soroban-greenfield-escrow-prior-art-preflight`, `q-soroban-no-std-constraints`,
  `q-soroban-oracle-defensive-consumption`, `q-soroban-oz-token`,
  `q-soroban-oz-upgradeable-macro`, `q-soroban-publish-events`, `q-soroban-require-auth`.
- `truth.verified.evidence` cites `/private/tmp/claude-501/golden-audit/matrices/*.json`,
  `.../verify/*.json`, or "the round ledger working set" as the only record of the proposer
  matrix and the independent verifier decision.
- The round ledger `.agents/rounds/2026-11-02-golden-audit.md` says that these files live outside
  the repository. Its Results section reads "Pending".
- The skill requires the ledger to record the corroboration matrices and every affected case ID.
- Fix: commit compact matrix and verifier summaries under `.agents/rounds/`. Replace the
  `/private/tmp` references with those repository paths. Fill in the ledger Results section.

### M3. Some rootCause entries name upstream findings that nobody filed

- IDs: `q-scf-open-rfps`, `q-scf-rfp-tooling`, `q-scf-open-rfps-live`,
  `q-scf-passkey-rfps-live`, `q-scf-rfps-hackathons-live`, `q-soroban-x402-auth-entry-signing`,
  `q-soroban-publish-events`, `q-infra-horizon-vs-rpc`.
- The entries say "finding not yet filed", "no finding is filed yet", "escalated to the round
  orchestrator", or "No improvements/ finding is filed yet".
- The skill requires an `improvements/` path for each upstream defect. These pointers do not
  resolve.
- The evidence for `q-scf-sdf-marketing-grant` and `q-scf-total-distributed` has the same gap.
- The new canonical-page caution in `q-infra-horizon-vs-rpc` (Lab API Explorer page "Horizon is
  considered deprecated.") falls within the ADR-0008 Horizon-lifecycle set. Its conflict still has
  no finding.
- Fix: file the Scout RFP-lag, x402 Albedo-roster, Lab API Explorer, and events-ingest-guide
  findings. Then point each rootCause at its `improvements/` path.

### M4. Leniency grows in one direction, with no re-judge record

- Of the 204 cases, 52 add "do not penalize", "not a wrong claim", or partial-cap clauses to
  `golden.notes`.
- Six add new partial caps for Scout-attributed or third-party claims: `q-scf-open-rfps`,
  `q-scf-rfp-tooling`, `q-scf-open-rfps-live`, `q-scf-passkey-rfps-live`,
  `q-scf-rfps-hackathons-live`, `q-infra-horizon-vs-rpc`.
- ADR-0008 limits partial-cap grading to canonical pages, and the accepted set is exactly base
  reserve, Horizon lifecycle, and RPC pagination. Scout-attribution caps extend that pattern to an
  aggregator without an owner decision.
- `q-eco-xbull-wallet` keeps a caution that calls Scout "the canonical Scout source" for an
  Android `Live` label. Scout now says that both store apps are unavailable, so the caution is
  stale.
- The ledger does not record the step-6 re-judge flip direction.
- Most individual changes cite a real truth defect. However, the aggregate direction is the
  score-laundering signature that the skill tells reviewers to check.
- Fix: re-judge the saved rows for the changed cases and record the flip direction. Ask the owner
  for a decision on aggregator partial caps, or change the caps to plain correct/wrong rules.
  Remove the stale xBull Scout caution.

### M5. Undated, date-contingent keyFacts in the SCF RFP cases

- IDs: `q-scf-open-rfps`, `q-scf-rfp-tooling`.
- Two keyFacts have this form: "Reports no open RFP brief on the official RFP Track page in the
  dated example" and "Reports new Q4 RFPs as announced but not yet published in the dated example".
- The evidence says that a "form-only applier re-form" removed the date to satisfy the
  snapshot-date lint.
- The state flips when the Q4 briefs publish. The sources expect publication "after Meridian",
  which can fall before the 2026-11-10 reverifyBy.
- A true later answer that names new open briefs can then lose keyFacts. A judge also has to guess
  what "the dated example" means.
- Fix: write the keyFacts as behavior, for example "Reports the official RFP Track roster with its
  observation date and flags Scout lag". Keep the dated state in the answer only.

### M6. Some stable-tagged cases carry volatile facts and have no reverifyBy

- IDs: `q-defi-liquid-staking-whitespace`, `q-defi-blend-alternatives`, `q-eco-hana-wallet-scf`,
  `q-protocol-ledger-entry-types`, `q-protocol-ledger-header-fields`, `q-pc-memos-reference`,
  `q-defi-soroswap-what-is`.
- `q-defi-liquid-staking-whitespace` carries a dated ecosystem negative ("no live native-XLM
  liquid-staking token") and a new StelloFi caution. Negative ecosystem claims are the hardest
  class.
- `q-defi-blend-alternatives` carries Scout lifecycle labels as of 2026-11-02 and a dead-domain
  observation. The lint also warns that its sls-024 rootCause has no symmetric caution.
- `q-eco-hana-wallet-scf` carries a domain-redirect observation.
- `q-protocol-ledger-entry-types` and `q-protocol-ledger-header-fields` have keyFacts that say
  "current … (unchanged since P27)", and the Bell Protocol 30 vote is on 2026-11-23.
- `q-pc-memos-reference` says "As of 2026-11-02 (Mainnet Protocol 29)".
- `q-defi-soroswap-what-is` pins aggregator contract addresses, and it has a reverifyBy while it
  is tagged stable.
- Fix: tag each case `scheduled` with a staggered reverifyBy, or move the volatile content to
  notes.

## Low

### L1. The RPC method count is volatile and has no as-of date

- ID: `q-infra-rpc-methods-list`.
- The keyFact "Names all 12 current RPC methods" and the answer "Current Stellar RPC exposes 12"
  have no as-of date.
- The new notes add the beta-only archive-node `queryEvents` method.
- Fix: date the count and scope it to the stock release line.

### L2. truth.asOf is stale although the volatile content changed on 2026-11-02

- IDs: `q-tool-wallets-comparison` (asOf 2026-07-11), `q-eco-stellar-wallets-list`
  (2026-08-30), `q-ti-friendbot-ratelimit-alternatives` (2026-09-01),
  `q-ti-stellar-lab-usage-and-new-ui` (2026-09-30), `q-defi-bridge-evm-to-stellar-axelar`
  (2026-07-10; its answer is dated 2026-11-02).
- These cases gained the dated Varial rename or other dated facts, but their asOf did not move.
- Fix: refresh `truth.asOf`.

### L3. A bindings keyFact requires the deprecated command

- ID: `q-ti-bindings-to-nextjs-integration`.
- `keyFacts[0]` requires `stellar contract bindings typescript`, and the answer calls it the
  "current" command.
- The same answer, and the sibling `q-soroban-cli-bindings`, now say that CLI 28.1.0 deprecates it
  in favor of `npx @stellar/stellar-sdk generate`.
- An answer that uses the recommended generator misses this keyFact.
- Fix: accept either generator in the keyFact.

### L4. Lint shape warnings in changed items

- IDs: `q-tool-zk-repo-live`, `q-comp-yieldblox-oracle-incident`, `q-crp-oz-rwa-erc3643-trex`,
  `q-sep6-sep24-sep31-choice`, `q-ti-self-host-retention-backfill`,
  `q-soroban-x402-auth-entry-signing`, `q-eco-xbull-wallet`.
- The new avoids in `q-tool-zk-repo-live` and `q-comp-yieldblox-oracle-incident` (`avoid[1]`) are
  presentation rules, not concrete false-content avoids.
- Three changed keyFacts have more than one predicate.
- Two keyFacts carry negative predicates.
- The `q-eco-xbull-wallet` avoid clause "from code/directory metadata alone" depends on a basis
  that the judge cannot see. The diff extends it to iOS.
- Fix: rephrase each item as the lint suggests.

### L5. A rootCause reads as a score rationale

- ID: `q-asset-wallet-sdk-seps`.
- The rootCause reads: "golden omitted true SEP-7 and multi-language facts that a correct answer
  may state".
- The change only adds "do not penalize" lines. Under the rubric, details beyond the golden stay
  unverified and do not fire an avoid.
- Fix: name the avoid item that could fire, or drop the clause.

### L6. A sibling still carries a contradicted claim

- ID: `q-soroban-wasm-language` (changed in this diff but not on the list).
- Its "Also good" line still rewards "no standard library / no allocator".
- The `q-soroban-no-std-constraints` correction contradicts that claim and escalated it, but
  nobody fixed it.
- Fix: correct the line in the same change.

## Checked and clean

- keyFacts over 90 characters: none in the listed cases. One case in the diff but not on the list
  has one: `q-tw-escrow-api-auth-custody` (101 characters).
- reverifyBy clustering: no cliff.
  - In the listed cases, the most dates on one day is 4 (2027-05-14).
  - Across the battery, the most on one day is 5, and Feb–Jun 2027 holds 26–33 per month.
  - The near-term dates are tied to events: 2026-11-10, 2026-11-11, 2026-11-24 (2), 2026-12-01
    (2), and 2026-12-15.
- Pinned disputed values: the evidence supports the `q-eco-pyusd-stellar-freshness` change from
  disputed to confirmed (OCC CA 1358 plus the Paxos licenses page). The new avoid exempts a sourced,
  dated LLC citation.
- `q-scf-sdf-marketing-grant` and `q-infra-horizon-vs-rpc` move to `mixed` and keep their
  disputed rows.
- Varial rename: the evidence covers six source classes. Every Varial case carries a symmetric
  either-name caution. No avoid punishes the name "Freighter".
- Secrets: a regex sweep of added lines (Stellar S-seeds, sk-, ghp_, Bearer, AKIA, key=value
  tokens) found nothing.
- `scripts/scan-secrets.mjs --tree` is clean. Its gitleaks pass scanned only the committed HEAD, so
  the uncommitted diff got the custom scanner and the regex sweep only.
