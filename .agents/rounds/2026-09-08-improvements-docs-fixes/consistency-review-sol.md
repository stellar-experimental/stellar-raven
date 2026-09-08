# Independent consistency-register review

Date: 2026-09-08

Reviewer: Codex GPT-5.6 Sol, high effort

This reviewer did not author the reviewed edits.

## Result

The 10 reopened clusters and two numeric invariants remain internally consistent.
I re-read all 33 unique cluster members and all six numeric-invariant member positions.
The current source cases and generated cases contain identical case objects.
The current source corpus hash matches both generated files.

Two findings block the full diff.
They do not change the 12 register verdicts.

## Evidence reviewed

- I reviewed the full current diff across all 16 tracked files.
- I reviewed `verify-sd-042-fable.md`, `verify-sd-047-terra.md`, and `verify-sd-043-sol.md`.
- I reviewed each current member answer, key fact, avoid item, note, and truth status.
- `npm run eval:qa:register -- --check` reported `up to date`.
- `npm run eval:qa:lint -- --since HEAD` reported zero errors and 65 warnings.
- `npm run improvements:lint` passed with 71 findings.
- `git diff --check` passed.

The lint warnings include a material warning for `q-protocol-ledger-close-time`.
Finding F1 explains that warning below.

## Twelve-entry matrix

| Entry | Members re-read | Shared claim test | Result |
|---|---|---|---|
| `cluster-017` | `q-asset-amm-fee-reserve`; `q-asset-path-payment-ops`; `q-asset-sdex-vs-amm`; `q-asset-trustline-basics`; `q-edge-1xlm-activation-fee`; `q-edge-noinfo-stellar-pos-staking-rewards`; `q-hot-fee-pool-burn-deflation`; `q-pc-account-activation-not-found`; `q-pc-practical-fee-setting`; `q-pc-sponsored-reserves`; `q-protocol-base-reserve-min-balance`; `q-protocol-ledger-close-time`; `q-sor-doc-timestamping-manage-data`; `q-soroban-simulate-resource-fee`; `q-token-initial-supply-distribution` | Fees, reserves, cadence, supply, and monetary history remain distinct. The `~5 s` path-payment estimate is approximate. | `consistent` |
| `cluster-018` | `q-infra-horizon-vs-rpc`; `q-infra-hubble-bigquery`; `q-infra-rpc-methods-list`; `q-infra-rpc-provider-archive-tier`; `q-infra-which-indexer`; `q-soroban-event-indexing-design`; `q-soroban-publish-events`; `q-ti-compute-token-lp-market-data`; `q-ti-enumerate-holders-airdrop`; `q-ti-historical-pointintime-balances`; `q-ti-rpc-gettransactions-pagination-xdr`; `q-ti-self-host-retention-backfill` | The members preserve endpoint boundaries, retention limits, `getLedgers` archive scope, and historical-indexer roles. The Horizon labels now agree. | `consistent` |
| `cluster-042` | `q-hot-fee-pool-burn-deflation`; `q-pc-practical-fee-setting` | Fee-pool sequestration remains separate from supply burn, inflation removal, validator rewards, and the 2019 SDF burn. | `consistent` |
| `cluster-054` | `q-edge-1xlm-activation-fee`; `q-pc-account-activation-not-found`; `q-pc-account-merge-reclaim-reserve`; `q-pc-sponsored-reserves` | Account creation, the unsponsored minimum, sponsored zero-balance creation, sponsorship obligations, and AccountMerge blockers remain compatible. | `consistent` |
| `cluster-056` | `q-hot-fee-pool-burn-deflation`; `q-pc-fee-bump-channel-accounts-feepool`; `q-pc-practical-fee-setting`; `q-pc-sequence-numbers-ordering-replace`; `q-ti-channel-accounts-throughput` | The members preserve one outer fee charge, independent sequence lanes, current fee estimation, and no validator rewards. | `consistent` |
| `cluster-061` | `q-infra-horizon-vs-rpc`; `q-pc-practical-fee-setting` | Both cases use the rendered Horizon label and preserve the stale-index qualifier. | `consistent` |
| `cluster-063` | `q-infra-horizon-vs-rpc`; `q-pc-practical-fee-setting` | The dated 100-stroop floor, estimator roles, Horizon availability, and Hubble role still agree. | `consistent` |
| `cluster-065` | `q-protocol-ledger-close-time`; `q-protocol-max-tx-set-size` | The cadence case retains 5–7 seconds. The limit case makes no conflicting cadence claim. | `consistent` |
| `cluster-114` | `q-asset-amm-fee-reserve`; `q-pc-account-activation-not-found`; `q-pc-sponsored-reserves`; `q-protocol-base-reserve-min-balance` | The formula, sponsored creation, available-balance boundary, and pool-share exception remain compatible. | `consistent` |
| `cluster-123` | `q-asset-amm-fee-reserve`; `q-asset-trustline-basics`; `q-edge-1xlm-activation-fee`; `q-pc-account-activation-not-found`; `q-protocol-base-reserve-min-balance`; `q-raph-low-xlm-transfer-fail` | The members agree on 0.5 XLM, 1 XLM, ordinary trustlines, pool-share trustlines, and reserve release. | `consistent` |
| `base reserve` | `q-asset-trustline-basics`; `q-edge-1xlm-activation-fee`; `q-protocol-base-reserve-min-balance`; `q-raph-low-xlm-transfer-fail` | The changed evidence keeps the authoritative values and sponsorship-aware rule. The `sd-046` qualifier remains separate. | `consistent` |
| `Stellar base fee floor` | `q-edge-1xlm-activation-fee`; `q-pc-practical-fee-setting` | Both cases retain the dated 100-stroop floor and distinguish it from the 1 XLM minimum. | `consistent` |

## Exact numeric-invariant `reSwept` text

Use this exact replacement for the `base reserve` review fields.
Remove its `reopened` object when applying this review.

```json
{
  "verdict": "consistent",
  "lastChecked": "2026-09-08",
  "reSwept": {
    "date": "2026-09-08",
    "reason": "Improvements follow-up (2026-09-08): q-protocol-base-reserve-min-balance changed its current Docs/Core evidence and removed the expired sd-043 caution; its dated 0.5 XLM base reserve, 1 XLM empty unsponsored account minimum, and sponsorship-aware formula remain unchanged. Re-read q-asset-trustline-basics, q-edge-1xlm-activation-fee, and q-raph-low-xlm-transfer-fail; none contradicts the authoritative value or rule. The separate two-reserve pool-share qualifier remains tracked by sd-046. Verdict consistent.",
    "verdict": "consistent"
  }
}
```

Use this exact replacement for the `Stellar base fee floor` review fields.
Remove its `reopened` object when applying this review.

```json
{
  "verdict": "consistent",
  "lastChecked": "2026-09-08",
  "reSwept": {
    "date": "2026-09-08",
    "reason": "Improvements follow-up (2026-09-08): q-pc-practical-fee-setting changed its dated Horizon lifecycle guidance and current provenance only. Its 100-stroop-per-operation floor, surge qualification, and fee-estimator guidance remain unchanged. Re-read q-edge-1xlm-activation-fee; it states the same dated 100-stroop floor and keeps transaction fees separate from the 0.5 XLM base reserve and 1 XLM empty-account minimum. Verdict consistent.",
    "verdict": "consistent"
  }
}
```

## Findings

### F1 — The cadence case lacks a required source-specific grading caution

`q-protocol-ledger-close-time` forbids a `3-5 seconds` answer without a source exception.
The Terra report shows that the official Docs search index still returns `3-5 seconds`.
The edit records this stale result in `truth` only.
It adds no matching caution to `golden.notes`.

The current lint reports a `symmetric-caution` warning for this changed case.
An answer can still quote the official stale index accurately.
Add a partial-grade caution until that index refreshes.
This change will alter two reviewed member hashes.

### F2 — Two files claim that the local `sd-043` resolver already completed

The active `sd-043` file has status `fixed-upstream`.
`improvements/resolved.json` has no `sd-043` receipt.
The round ledger says that `sd-043` is ready for the resolver.

`sd-046-pool-share-trustline-reserve-conflict.md` calls `sd-043` a resolved finding in that registry.
`ideas/source-delivery-ranked-references.md` makes the same claim.
Change both references to `fixed-upstream` until the resolver creates the receipt.

## Final verdict

CHANGES-REQUIRED

---

## Follow-up review: latest two note changes

Date: 2026-09-08

This follow-up supersedes the earlier final verdict.
I re-read both latest source-case edits and all 28 unique affected members.
Only the two stated note changes caused these seven register entries to reopen.

### Source-case verdicts

`q-infra-horizon-vs-rpc` now uses the required lint-canonical form.
The caution names the official documentation search index.
It permits an attributed quote, sets a partial cap, and expires after the crawler refreshes.
The edit does not change any Horizon or RPC claim.

`q-protocol-base-reserve-min-balance` now preserves the accepted base-reserve caution slot.
The caution names the official Lumens and Accounts pages.
It permits an attributed one-reserve quote and sets a partial cap.
It names active `sd-046` and gives a clear expiry.
The edit does not change the controlling two-reserve rule.

### Seven-entry matrix

| Entry | Members re-read | Follow-up result |
|---|---|---|
| `cluster-017` | All 15 members from the earlier matrix | The new `sd-046` caution changes grading only. All shared facts remain consistent. |
| `cluster-018` | All 12 members from the earlier matrix | The lint-canonical wording changes no lifecycle, endpoint, retention, or history claim. |
| `cluster-061` | `q-infra-horizon-vs-rpc`; `q-pc-practical-fee-setting` | Both cases retain the same rendered-page and stale-index boundary. |
| `cluster-063` | `q-infra-horizon-vs-rpc`; `q-pc-practical-fee-setting` | The fee floor, estimator roles, and Horizon lifecycle boundary still agree. |
| `cluster-114` | `q-asset-amm-fee-reserve`; `q-pc-account-activation-not-found`; `q-pc-sponsored-reserves`; `q-protocol-base-reserve-min-balance` | The formula, sponsored creation, liability boundary, and pool-share rule remain consistent. |
| `cluster-123` | `q-asset-amm-fee-reserve`; `q-asset-trustline-basics`; `q-edge-1xlm-activation-fee`; `q-pc-account-activation-not-found`; `q-protocol-base-reserve-min-balance`; `q-raph-low-xlm-transfer-fail` | All reserve values and qualifications remain consistent. |
| `base reserve` | `q-asset-trustline-basics`; `q-edge-1xlm-activation-fee`; `q-protocol-base-reserve-min-balance`; `q-raph-low-xlm-transfer-fail` | The note change does not alter the numeric value or formula. |

All seven entries have verdict `consistent`.

The helper-compatible file covers the six cluster entries.
The helper does not apply numeric-invariant reviews.
Use this exact manual replacement for the `base reserve` review fields.
Remove its `reopened` object during application.

```json
{
  "verdict": "consistent",
  "lastChecked": "2026-09-08",
  "reSwept": {
    "date": "2026-09-08",
    "reason": "Follow-up consistency review (2026-09-08): q-protocol-base-reserve-min-balance changed only its accepted canonical-page caution and matching verification evidence. Re-read q-asset-trustline-basics, q-edge-1xlm-activation-fee, q-protocol-base-reserve-min-balance, and q-raph-low-xlm-transfer-fail. The dated 0.5 XLM base reserve, 1 XLM empty unsponsored minimum, sponsorship-aware formula, and pool-share qualification remain unchanged. The active sd-046 caution changes grading for an attributed official-page quote, not the authoritative numeric value. Verdict consistent.",
    "verdict": "consistent"
  }
}
```

### Earlier finding reconciliation

The earlier F1 is withdrawn.
ADR-0008 fixes the accepted caution set at exactly three cases.
Those cases are base reserve, Horizon lifecycle, and RPC pagination.
Adding a cadence caution requires a later owner decision.

The cadence avoid item is narrower than the earlier review stated.
It rejects an immutable guarantee based on one adjacent-ledger delta.
It does not reject an attributed stale-index quote by itself.
The advisory lint warning remains accepted under ADR-0008.

The earlier F2 is resolved.
Both references now call `sd-043` fixed upstream.
Both references also state that the local resolver receipt remains pending.

### Follow-up verification

- `npm run eval:qa:lint -- --since HEAD`: zero errors and 63 warnings.
- `npm run eval:qa:register -- --check`: `up to date`.
- The 500 source cases exactly match `eval/qa/cases.json`.
- The source hash matches `eval/qa/cases.json` and `eval/qa/sample.json`.
- Every sampled case matches its source case.
- `git diff --check`: passed.

### Follow-up final verdict

PASS

---

## Final register follow-up after the `sd-043` resolver

Date: 2026-09-08

This follow-up supersedes the previous register verdict.
I reviewed the two resolver edits and all affected members.

### Resolver edit review

Only `q-pc-sponsored-reserves` and `q-protocol-base-reserve-min-balance` changed.
Each edit replaces the deleted active-file `rootCause` with Raven commit `767c981a9304bd74b167357ffdf9a39dd017cce4`.
No question, answer, key fact, avoid item, note, source, or corroboration changed.

The commit exists in this repository.
Its archived `sd-043` file records the verified defect, evidence, fix, and `fixed-upstream` status.
The `sd-043` receipt in `improvements/resolved.json` names the same commit and immutable source URL.
The remaining `sd-046` root cause stays active for the separate pool-share conflict.

### Reopened register review

| Entry | Members re-read | Result |
|---|---|---|
| `cluster-017` | All 15 registered members | The provenance-only edits change no fee, reserve, cadence, supply, or monetary-history claim. |
| `cluster-054` | All four registered members | Account creation, reserve sponsorship, and AccountMerge rules remain compatible. |
| `cluster-114` | All four registered members | The formula, liability boundary, sponsored creation, and pool-share rule remain compatible. |
| `cluster-123` | All six registered members | The reserve values and all qualifications remain compatible. |
| `base reserve` | All four registered members | The provenance-only edit changes no value, formula, or qualification. |

All five entries have verdict `consistent`.
The helper-compatible file covers the four cluster entries.
The helper does not apply numeric-invariant reviews.

### Exact manual base-reserve `reSwept` text

Use this exact replacement for the `base reserve` review fields.
Remove its `reopened` object during application.

```json
{
  "verdict": "consistent",
  "lastChecked": "2026-09-08",
  "reSwept": {
    "date": "2026-09-08",
    "reason": "Final resolver follow-up (2026-09-08): q-protocol-base-reserve-min-balance changed only its truth.verified.rootCause provenance. The deleted active sd-043 path now points to immutable Raven commit 767c981a9304bd74b167357ffdf9a39dd017cce4. Re-read q-asset-trustline-basics, q-edge-1xlm-activation-fee, q-protocol-base-reserve-min-balance, and q-raph-low-xlm-transfer-fail. The dated 0.5 XLM base reserve, 1 XLM empty unsponsored minimum, sponsorship-aware formula, and pool-share qualification remain unchanged. Verdict consistent.",
    "verdict": "consistent"
  }
}
```

### Final follow-up verification

- `npm run eval:qa:compile`: wrote 500 cases and a 30-case sample.
- The compiled corpus SHA-256 is `49bc52baae868ff48ca5c04d5f3a823cc7bb4fc0a4e4f5adae34810f954289cd`.
- `npm run eval:qa:lint -- --since HEAD`: zero errors and 62 warnings.
- `npm run eval:qa:register -- --check`: `up to date`.
- The helper accepted `register-review-sol-v3.json` against a copied register.
- The helper cleared all four reopened cluster markers in that copy.
- `git diff --check`: passed.

### Final register verdict

PASS
