# Apply refusals and warnings against `coverage/coverage.json`

Lane `instrument`, 2026-11-14. This was a dry run only; the corpus is unchanged.
`coverage/verify-coverage.json` and `coverage/overrides.json` did not exist yet.

```sh
node .agents/rounds/2026-11-14-golden-coverage-audit/apply/apply.mjs --dry-run
# exit 1: leaf=6 merge=89 retire=200 rewrite=205 tool=7; refusals=10; headline=211; tool=7; openSlots=16
node .agents/rounds/2026-11-14-golden-coverage-audit/apply/apply.mjs --dry-run --overrides .agents/rounds/2026-11-14-golden-coverage-audit/apply/overrides-draft.json
# exit 0: same plan, refusals=0
```

The plan matches `coverage.json` totals: 211 headline, 7 tool, 200 retired, 89 merged, 16 empty
weight-2/3 leaves written to `openSlots`. [`overrides-draft.json`](overrides-draft.json) holds the
eight fixes below. Copy it to `coverage/overrides.json` to adopt them.

## Script changes in this follow-up

- **New inputs.** `coverage/overrides.json` (`{"cases": [{id, finalVerdict?, survivor?, note?,
  rewrite?, leaf?, secondaryLeaf?}]}`, highest precedence) and `coverage/verify-coverage.json` are
  read when present (`--overrides` and `--review` change the paths). Precedence: overrides,
  verify-coverage, coverage, verifier, auditor.
- **Coverage `disposition`** is now the final state: `headline` keeps the verifier or auditor verdict;
  `merged`, `retired`, and `tool-lane` map to merge, retire, and tool. The case's `survivor` and the
  `extraCuts[].into` field name the survivor.
- **verify-coverage handling:**
  - A rejected `extraCuts` entry keeps the case on its leaf with its pre-coverage verdict (`keep`,
    else `tighten` with its rewrite).
  - `accept-with-absorb` on a retire turns it into a merge into `absorbInto`, so the tombstone points
    forward. The absorbed fact is listed as pending.
  - A `mergeFixes[].survivor` replaces the survivor.
  - `toolLane[].final` overrides coverage.
  - Tested on a synthetic review with `--only`; all three paths gave the expected plan.
- **Date traps.** A trap string that quotes a retired case's `reverifyBy` is rewritten to
  `<id> (retired on 2026-11-14)` or `(merged into <id> on 2026-11-14)`. This cleared the four
  date-trap refusals (`q-edge-fresh-latest-scf-round`, `q-scf-confidential-tokens-preview`,
  `q-sor-confidential-tokens`, `q-tool-cctp-stellar-integration`) without a hand edit.
- **Waived leaves.** An empty leaf with only waived slots gets an `openSlots` reason that names the
  covering cases, not "awaiting a proposal". This applies to `network.upgrade-process` and
  `behavior.paid-action-refusal`.
- **Dry-run output** also prints every lint warning on the would-be corpus as `[lint-warn]`.

## Refusals (block the run)

### R1. A stable golden pins "as of <date>" (4 cases)

Each auditor rewrite dated a value in a `stable` case. **Fix:** an override rewrite that removes the
date. The overrides cannot change `tags.freshness`, and none of these needs to be `scheduled`.

| Case | Change in `overrides-draft.json` |
|---|---|
| `q-asset-trustline-basics` | "(0.5 XLM as of 2026-11-14)" → "(0.5 XLM; validators can change it)" |
| `q-edge-noinfo-sep-9999` | "(stellar/stellar-protocol, as of 2026-11-14)" → "(stellar/stellar-protocol)" |
| `q-pc-account-activation-not-found` | "1 XLM at the 0.5 XLM reserve as of 2026-11-14" → "1 XLM at the 0.5 XLM base reserve, which validators can change" |
| `q-sep-53-sign-verify-message` | "is Final (v1.0.0 as of 2026-11-14)" → "is Final (v1.0.0)" |

### R2. A key fact names a CAP but no corroboration row covers it (2 cases)

The lint treats `CAP-n` as a version fragment. **Fix:** an override rewrite that keeps the CAP
number in the answer and drops it from the key fact.

| Case | Key fact change |
|---|---|
| `q-pc-sequence-numbers-ordering-replace` | "CAP-0021 minSeqNum can permit a gap…" → "A minSeqNum precondition can permit a gap…" |
| `q-protocol-accounts-signers-thresholds` | "…four forms including the CAP-0040 signed payload." → "…four forms, including the signed-payload signer." |

### R3. No retirement reason passes `SCORE_CAUSE_RE` (2 cases)

Both reasons are sound. The words "Score-independent" and "verdict" trip the guard. **Fix:** an
override `note`.

| Case | Note in `overrides-draft.json` |
|---|---|
| `q-comp-sep8-number-lookup-no-deepresearch` | Duplicate: q-comp-sep8-regulated-assets-approval-server carries the SEP-8 identity and q-edge-exhaustive-defi-deep-report carries the paid-research proportionality behavior. |
| `q-gap-rpc-horizon-unindexed-reference` | Tests one docs-search ranking defect (sd-059, filed in improvements/) and a generic absence rule that q-live-ll-guessed-slug-soft-empty already tests; no Stellar fact rides on it. |

## Warnings (the run proceeds; each needs a decision)

### W1. Absorb pending: a merged case's fact is not in its survivor's rewrite (14)

I compared each fact with the survivor's final rewrite (verifier `finalRewrite`, else the auditor's
rewrite). **Fix:** an override `rewrite` for the survivor that adds the fact as one key fact, or a
clause in the answer. The suggested facts are drafts and need the golden-truth bar before they land.

| Merged case → survivor | Fact | In survivor now? | Smallest fix |
|---|---|---|---|
| `q-aas-burn-clawback-redemption-mechanics` → `q-asset-issue-asset-howto` | Sending an asset back to its issuer burns it; the issuer cannot hold its own asset. | no | add key fact |
| `q-aas-trusted-asset-list-whitelist` → `q-aas-list-token-on-exchanges-aggregators` | No protocol or SDF whitelist exists; SEP-42 lists are opt-in. | in the answer ("SEP-42 asset lists are optional and not an endorsement") | none |
| `q-comp-sac-inherits-flags` → `q-asset-trustline-vs-sac` | The SAC keeps the asset's authorization and clawback controls. | no | add key fact |
| `q-crp-become-an-anchor-licensing` → `q-anchor-sdp-vs-anchor-platform` | The Anchor Platform is technical plumbing, not a licence. | no | add a clause to the answer and an avoid item ("Do NOT claim that running the Anchor Platform licenses an anchor.") |
| `q-infra-testnet-reset-schedule-recovery` (proposal) → `q-infra-testnet-vs-futurenet` | A reset returns Testnet to genesis and wipes accounts and contract data. | partly ("resets on a planned cadence") | extend that key fact: "Testnet resets on a planned cadence, wiping accounts and contract data." |
| `q-pay-travel-rule-aid-flows` → `q-pay-anchor-msb-licensing` | Travel Rule duties attach to covered intermediaries, not to the protocol or the SDP. | no | add key fact |
| `q-sep-7-uri` → `q-sep-53-sign-verify-message` | SEP-7 defines the `web+stellar:` URI scheme. Coverage also suggests re-asking the survivor as the SEP mapping. | no | add key fact. A re-ask changes the question and needs its own golden-truth review; I would not do it in this change. Merge this into the R1 override for that case. |
| `q-sor-recurring-escrow-patterns` → `q-stellar-recurring-payments` | Pulls use `transfer_from` against a bounded allowance. | no | add key fact |
| `q-sor-sep41-transfer-vs-transferfrom` → `q-soroban-token-transfer-pattern` | Allowance expiry is an absolute ledger sequence. | no (the survivor has 4 key facts) | add key fact (5 is the cap) |
| `q-soroban-oz-upgradeable-macro` → `q-soroban-storage-migration` | An upgrade replaces the executable in place at the same address and needs explicit authorization. | partly (keeps the address) | add "needs the contract's own upgrade authorization" to the answer |
| `q-tool-cctp-stellar-integration` → `q-cctp-v2-usdc-stellar` | Domain 27; `deposit_for_burn` via the USDC SAC; inbound `mintRecipient`/`destinationCaller` = CctpForwarder. | domain 27 and CctpForwarder yes; method names no | none; method names are integration detail |
| `q-tool-greenfield-indexer-prior-art-preflight` → `q-tool-indexer-repos-discovery` | A durable index needs checkpointed, idempotent ingestion with replay. | partly ("history needs your own storage") | none |
| `q-tool-passkey-wallet-recovery` → `q-passkey-wallet-recovery` | SEP-30 recovers classic G-accounts, not a passkey C-account; a relayer is not recovery authority. | no | add avoid item ("Do NOT claim that SEP-30 recovers a passkey contract account.") |
| `q-tool-sep41-status-live` → `q-sep-41-token-interface` | SEP-41 is Draft v0.5.2 as of 2026-11-14. | yes | none |

Ten survivors need an override rewrite. Four need nothing. Survivors with override rewrites stop
warning.

### W2. Merge survivor is in the tool lane (4)

`q-defi-asset-whitespace-live`, `q-defi-category-funding-ratio-live`, and
`q-defi-tooling-whitespace-live` → `q-defi-cluster-rollup-live`; `q-gap-vet-pitch-vertical-null` →
`q-scf-pitch-prep-live`. The registry accepts these replacement IDs because the survivors stay in
the battery. **Fix:** none if the tool lane stays. If verify-coverage retires those survivors, give
each merged case an override `finalVerdict: "retire"` (the survivor would otherwise be a retired
replacement).

### W3. Retires with absorb text but no survivor (1)

`q-tool-soroban-auth-audit-live`: the auditor's absorb text says it adds nothing beyond the
survivor's labels. **Fix:** none.

### W4. Avoid items wrapped as "Do NOT claim that …" (40 items in 28 cases)

These are mechanical rewrites of declarative avoid items, listed as `[avoid-wrapped]` in the dry
run. Most read correctly. Some fragments read awkwardly, for example in
`q-soroban-check-auth-custom-account` and `q-sep-catalog-list`. **Fix:** optional; an override
rewrite with the avoid text in `Do NOT …` form.

Cases: `q-aas-claimable-predicates-expiry-reserves`, `q-aas-issuer-fees-supply-cap-freeze`,
`q-aas-sep30-recoverable-wallets`, `q-anchor-endpoint-discovery`,
`q-anchor-list-builders-discovery`, `q-asset-issue-asset-howto`, `q-asset-path-payment-ops`,
`q-asset-sdex-vs-amm`, `q-asset-trustline-basics`, `q-edge-fresh-latest-blend-tvl`,
`q-passkey-smart-account-architecture`, `q-passkey-wallet-recovery`, `q-sep-12-kyc`,
`q-sep-41-token-interface`, `q-sep-43-web-wallet-api`, `q-sep-45-contract-auth`,
`q-sep-53-sign-verify-message`, `q-sep-catalog-list`, `q-sor-build-target-wasm32v1`,
`q-sor-classic-dex-from-contract`, `q-sor-decode-hosterror-codes`, `q-sor-evm-to-soroban-porting`,
`q-soroban-check-auth-custom-account`, `q-soroban-cli-bindings`, `q-sor-p23-auto-restore-extendto`,
`q-sor-require-auth-propagation`, `q-sor-scval-conversion`, `q-sor-ttl-defaults-extend`.

### W5. Lint warnings on the would-be corpus (148)

- **Key-fact authoring heuristics (110).** 69 multiple predicates, 23 over 90 characters, and 18
  negative-predicate objects missing from the question. **Fix:** none required; these are heuristics.
- **Snapshot-date (18).** A key fact demands the round date 2026-11-14. Common-brief rule: a `live`
  or `scheduled` key fact must accept a later dated figure. **Fix:** an override rewrite
  replacing "as of 2026-11-14" in the key fact with "dated". Cases:
  - `q-anchor-moneygram-ramps`
  - `q-defi-agent-identity-stellar-experimental`
  - `q-defi-bridge-evm-to-stellar-axelar`
  - `q-edge-metamask-evm-mental-model`
  - `q-infra-horizon-vs-rpc`
  - `q-org-sdf-board-directors`
  - `q-protocol-max-tx-set-size`
  - `q-raph-xlm-staking`
  - `q-sep-41-token-interface`
  - `q-sep-45-contract-auth`
  - `q-sep6-sep24-sep31-choice`
  - `q-soroban-contract-build-verification`
  - `q-sor-ttl-defaults-extend`
  - `q-ti-rpc-gettransactions-pagination-xdr`
  - `q-ti-scaffold-stellar`
  - `q-ti-self-host-retention-backfill`
  - `q-tool-passkeykit-smart-wallet`
  - `q-zk-host-functions-status`
- **Avoid sourcing guards (16).** These are the existing avoid-pattern heuristic. **Fix:** none.
- **Numeric fuzzy match (2).** `q-raph-low-xlm-transfer-fail` (base reserve) and
  `q-comp-yieldblox-oracle-incident` (YieldBlox totals) no longer quote the register's authoritative
  spelling. **Fix:** none if the compact wording is intended. Otherwise restore the figure.
- **Negative-claim heuristic (2).** `q-defi-benji-franklin-templeton` and
  `q-ti-explain-repo-payload-status`. **Fix:** none.

## Side effects the run will make (not refusals)

- **Register:** 124 changes. 44 clusters fall under two members and are deleted. Also deleted: the
  numeric invariant "SCF #43 official total" and the Noether/Kryon date trap (no cases left). After
  `npm run eval:qa:register`, member-hash changes reopen most remaining entries for phase-6 review.
- **Sentinels dropped (12):**
  - `scf-46-submission-deadline-edge`, `scf-47-not-listed-edge` (`q-edge-fresh-latest-scf-round`)
  - `zenex-mainnet-deployment`, `zenex-xlm-usd-market-active` (`q-defi-perps-whitespace`)
  - `mazieres-chief-scientist` (`q-org-mazieres-chief-scientist`)
  - `flutter-sdk-soneso` (`q-tool-flutter-mobile-sdk`)
  - `enterprise-fund-portfolio` (`q-org-sdf-enterprise-fund`)
  - `sdp-transaction-submission-service` (`q-anchor-sdp-what`)
  - `soroban-sdk-advisories` (`q-soroban-sdk-cve`)
  - `x402-no-sep` (`q-hist-x402-stellar-announcement`)
  - `x402-albedo-absent` (`q-soroban-x402-auth-entry-signing`)
  - `scf-rfp-q4-tooling-roster` (`q-scf-rfp-tooling`)

  A sentinel on a merged case could be re-pointed to its survivor only after a live anchor read.
  The script drops it.
- **`openSlots`: 16.** 14 leaves await proposals; `network.upgrade-process` and
  `behavior.paid-action-refusal` are waived (covered by a case on another leaf).
  `tooling.wallet-sdk` (weight 1, waived) needs no slot.
