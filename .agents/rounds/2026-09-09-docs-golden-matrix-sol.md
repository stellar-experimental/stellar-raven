# Docs golden conflict removal matrix

Lane: bounded research-only `golden-truth` synthesis.

Observation window: **2026-09-09T16:39:56Z–17:04:18Z**.

Evidence-pass branch: `maintenance/drift-141`.

Evidence-pass HEAD: `1ef0cdd2bd839c156ec175e04b61df9db51926b9`.

Final comparison branch: `maintenance/docs-ingestion-closeout`.

Final comparison HEAD: `9a3e1857b02870fc09d9469edf0a2917b807b8ed`.

The user reports that PR #142 merged before this final comparison.

## Scope and authority

This report covers four cases.

- `q-ti-openzeppelin-relayer`
- `q-infra-horizon-vs-rpc`
- `q-pc-practical-fee-setting`
- `q-protocol-ledger-close-time`

The report proposes an exact patch.
It does not edit a case, source, generated artifact, register, or finding.
It uses no paid call.
It creates no agent.
It posts no comment.
It makes no external write.

The evidence reuses the independent A/B/E checks in `2026-09-09-docs-ingestion-sol.md`.
The final narrow reads repeated only the three resolved conflict claims.

## Verdict

All three source conflicts are fixed across classes A, B, and E.
The four cases need narrow provenance maintenance.
No golden answer, key fact, or avoid item needs a change.

| Case | Current conflict residue | Required result |
| --- | --- | --- |
| `q-ti-openzeppelin-relayer` | `golden.notes` says Stellar Docs still conflates Relayer and Channels. | Remove only that caution. Keep `truth.status: "disputed"` for the separate version dispute. |
| `q-infra-horizon-vs-rpc` | `golden.notes` and `truth.status` say the Docs index still conflicts. | Remove the caution. Change `truth.status` to `confirmed`. |
| `q-pc-practical-fee-setting` | `golden.notes` and `truth.verified` say the index still has the old Horizon phrase. | Remove only the stale index sentence. Keep the active `sd-003` caution. |
| `q-protocol-ledger-close-time` | `truth.sources` and `truth.verified` say the Validators index still has `3-5`. | Refresh current provenance only. Keep every historical row. |

No date receives a blanket renewal.
The 2026-09-02 Relayer version and health facts remain explicitly dated.
The fee and ledger measurements remain at their original dates.

## Final comparison with the current four-case diff

The current diff implements the same source-conflict decisions.
I found no required case correction.
The current diff preserves all unrelated facts and all historical evidence.

| Case | Current diff | Difference from my pre-diff proposal | Assessment |
| --- | --- | --- | --- |
| `q-ti-openzeppelin-relayer` | Removes the old alias caution. Adds a dated A/B/E row. Keeps `truth.status: "disputed"`, `truth.asOf: "2026-09-02"`, and `reverifyBy`. | It keeps a current-resolution sentence in `golden.notes`. It removes `freshness-drift` from the latest `truth.verified.rootCause`. | No material conflict. The latest event concerns `sd-039`. The answer and existing corroboration retain the dated version and health facts. |
| `q-infra-horizon-vs-rpc` | Removes the expired caution. Sets `truth.status: "confirmed"`. Adds the 2026-09-09 A/B/E row. | It keeps the existing answer and `truth.asOf: "2026-09-08"`. Every historical corroboration row remains unchanged. | No material difference. The current row records the fix without renewing the prior answer date. |
| `q-pc-practical-fee-setting` | Removes the expired `sd-042` caution. Keeps the separate `sd-003` caution. Adds the 2026-09-09 A/B/E row. | It keeps the existing answer. Every historical corroboration row remains unchanged. | No material difference. The 100-stroop date remains 2026-07-10. No fee fact receives a renewal. |
| `q-protocol-ledger-close-time` | Refreshes the Validators source note and current A/B/E provenance. All golden fields stay unchanged. | No material difference. | Matches the recommendation. All dated empirical and conflict rows remain. |

The Horizon historical row remains byte-for-byte unchanged.
Its original `disputed` verdict remains a dated record of the 2026-09-08 conflict.
The new `confirmed-as-of` row records the separate 2026-09-09 resolution.
The case-level `truth.status` now reports the current `confirmed` state.

The Relayer answer still dates all version and health claims to 2026-09-02.
Its earlier corroboration rows remain unchanged.
Its `truth.status` remains `disputed`.
The current verification event states that those facts did not change.

All four `golden.answer` values remain unchanged from `9a3e185`.
The Horizon case keeps `truth.asOf: "2026-09-08"`.
The fee answer keeps the 100-stroop floor at 2026-07-10.
The ledger answer keeps its 2026-07-10 sample.
All 2026-08-30 and 2026-08-31 cadence rows remain unchanged.

The bounded diff check found no historical-row change.
It found no answer or `truth.asOf` change.
The current case diff therefore matches the narrow recommendation.

## Claim corroboration matrices

### `q-ti-openzeppelin-relayer`

Claim: Current Stellar Docs distinguishes the self-hosted Relayer from managed Stellar Channels.

Verdict: **confirmed-as-of 2026-09-09**.

| Class | Reference | Observed | Result |
| --- | --- | --- | --- |
| A | https://developers.stellar.org/docs/tools | `2026-09-09T17:02:05Z–17:02:07Z` | The page calls Relayer an open-source framework. It calls Channels the managed service above that framework. |
| A | https://developers.stellar.org/docs/tools/openzeppelin-relayer | `2026-09-09T17:02:05Z–17:02:07Z` | The page separates self-hosting, signer control, funding, the plugin, and the managed service. The old alias has zero matches. |
| B | `stellar/stellar-docs@db501fe9f2d856f2b38c4da7bf57b325806fe842:docs/tools/README.mdx` | `2026-09-09T17:02:52Z–17:02:57Z` | Blob `86243e6cf3cc2a672668726cbf94fe87a9cead24` has the same distinction. The old alias has zero matches. |
| B | `stellar/stellar-docs@db501fe9f2d856f2b38c4da7bf57b325806fe842:docs/tools/openzeppelin-relayer.mdx` | `2026-09-09T17:02:52Z–17:02:57Z` | Blob `8ef7a6f219393fb8495fecc848982e1f37d78a13` has the same distinction. The old alias has zero matches. |
| E | Primary index, objects `2-https://developers.stellar.org/docs/tools/openzeppelin-relayer` and `13-https://developers.stellar.org/docs/tools` | `2026-09-09T17:04:18.034Z` | Both records carry the corrected distinction. Exact old-alias search returns `nbHits:0`. |
| E | `docs_replica_agent`, the same object IDs | `2026-09-09T17:04:18.034Z` | The replica matches the primary. Exact old-alias search returns `nbHits:0`. |

This matrix resolves only `sd-039`.
It does not recheck OpenZeppelin release or service-health facts.

### `q-infra-horizon-vs-rpc`

Claim: The EVM guide and both Docs indexes now use the nearing-end-of-life Horizon label.

Verdict: **confirmed-as-of 2026-09-09**.

| Class | Reference | Observed | Result |
| --- | --- | --- | --- |
| A | https://developers.stellar.org/docs/learn/migrate/evm/smart-contract-deployment | `2026-09-09T17:02:05Z–17:02:07Z` | The page contains `Horizon API (nearing end-of-life)`. It has zero `deprecated Horizon API` matches. |
| A | https://developers.stellar.org/docs/data/apis and the three controls in the ingestion report | `2026-09-09T16:43:20.930Z` | The four canonical controls keep the future-deprecation boundary. |
| B | `stellar/stellar-docs@db501fe9f2d856f2b38c4da7bf57b325806fe842:docs/learn/migrate/evm/smart-contract-deployment.mdx` | `2026-09-09T17:02:52Z–17:02:57Z` | Blob `c7b63187d38d9d368e7eadade08df45d88bff886` has the corrected phrase. The old phrase has zero matches. |
| E | Primary index, object `21-https://developers.stellar.org/docs/learn/migrate/evm/smart-contract-deployment` | `2026-09-09T17:04:18.034Z` | Exact corrected-phrase search returns this record. Exact old-phrase search returns `nbHits:0`. |
| E | `docs_replica_agent`, the same object ID | `2026-09-09T17:04:18.034Z` | The replica matches the primary. Exact old-phrase search returns `nbHits:0`. |

This matrix resolves only the indexed occurrence in `sd-042`.
It does not prove that a shared lifecycle-text refactor shipped.

### `q-pc-practical-fee-setting`

Claim: The Horizon lifecycle source conflict cited by this fee case no longer exists.

Verdict: **confirmed-as-of 2026-09-09**.

| Class | Reference | Observed | Result |
| --- | --- | --- | --- |
| A | The EVM guide and four canonical Horizon controls above | `2026-09-09T16:43:20.930Z–17:02:07Z` | The pages use the same current lifecycle boundary. |
| B | EVM source blob `c7b63187d38d9d368e7eadade08df45d88bff886` | `2026-09-09T17:02:52Z–17:02:57Z` | Current source uses the corrected phrase. The old phrase has zero matches. |
| E | Both Docs indexes, EVM object `21-https://developers.stellar.org/docs/learn/migrate/evm/smart-contract-deployment` | `2026-09-09T17:04:18.034Z` | Both indexes return the corrected record. Exact old-phrase searches return `nbHits:0`. |

This matrix does not recheck fees, surge behavior, `getFeeStats`, or Hubble.
Those facts keep their original evidence dates.
The separate `sd-003` source caution remains active.

### `q-protocol-ledger-close-time`

Claim: Current Validators and Stellar Stack sources and indexes both say `every 5-7 seconds`.

Verdict: **confirmed-as-of 2026-09-09**.

| Class | Reference | Observed | Result |
| --- | --- | --- | --- |
| A | https://developers.stellar.org/docs/validators | `2026-09-09T17:02:05Z–17:02:07Z` | The page has one `every 5-7 seconds` match. It has zero `every 3-5 seconds` matches. |
| A | https://developers.stellar.org/docs/learn/fundamentals/stellar-stack | `2026-09-09T17:02:05Z–17:02:07Z` | The page has one `every 5-7 seconds` match. It has zero `every 3-5 seconds` matches. |
| B | `stellar/stellar-docs@db501fe9f2d856f2b38c4da7bf57b325806fe842:docs/validators/README.mdx` | `2026-09-09T17:02:52Z–17:02:57Z` | Blob `f74c26290ba7653f584805bb3b02867b97aee3af` has `5-7` once and `3-5` zero times. |
| B | `stellar/stellar-docs@db501fe9f2d856f2b38c4da7bf57b325806fe842:docs/learn/fundamentals/stellar-stack.mdx` | `2026-09-09T17:02:52Z–17:02:57Z` | Blob `06c92f8dbcd2f30e0f855bd18bf7abbc3c9e9713` has `5-7` once and `3-5` zero times. |
| E | Primary index, objects `2-https://developers.stellar.org/docs/validators` and `6-https://developers.stellar.org/docs/learn/fundamentals/stellar-stack` | `2026-09-09T17:04:18.034Z` | Exact `5-7` search returns both records. Exact `3-5` search returns `nbHits:0`. |
| E | `docs_replica_agent`, the same object IDs | `2026-09-09T17:04:18.034Z` | The replica matches the primary. Exact `3-5` search returns `nbHits:0`. |

This matrix does not resample Pubnet.
It does not renew the 2026-07-10, 2026-08-30, or 2026-08-31 measurements.

## Exact four-case patch proposal

The paths below use the current JSON structure.
Every field not named below remains byte-for-byte unchanged.

### 1. `q-ti-openzeppelin-relayer`

File: `eval/qa/corpus/battery/tooling-infra/q-ti-openzeppelin-relayer.json`.

Keep these fields unchanged:

- `golden.answer`
- `golden.keyFacts`
- `golden.avoid`
- `truth.lifecycle`
- `truth.domain`
- `truth.status: "disputed"`
- `truth.asOf: "2026-09-02"`
- `truth.reverifyBy: "2026-11-24"`
- Every existing `truth.sources` entry
- Every existing `truth.corroboration` row

Replace `golden.notes` with this exact string:

```text
GT-53: grade the self-hosted Relayer versus managed Channels distinction, their different funding/service contracts, and dated evidence. As observed 2026-09-02, repository v1.8.0 and rendered 1.5.x docs disagreed. The public Channels Statuspage was inactive. A 401 proves an authenticated endpoint is reachable, not that a relay succeeded or failed globally.
```

Append this exact object to `truth.corroboration`:

```json
{
  "claim": "Current Stellar Docs pages and both serving indexes distinguish the self-hosted Relayer from managed Stellar Channels.",
  "verdict": "confirmed-as-of",
  "evidence": [
    {
      "class": "A",
      "ref": "https://developers.stellar.org/docs/tools and https://developers.stellar.org/docs/tools/openzeppelin-relayer",
      "observedAt": "2026-09-09",
      "note": "Both rendered pages distinguish the open-source Relayer framework from the managed Channels service and contain no old alias."
    },
    {
      "class": "B",
      "ref": "https://github.com/stellar/stellar-docs/tree/db501fe9f2d856f2b38c4da7bf57b325806fe842/docs/tools",
      "observedAt": "2026-09-09",
      "note": "README.mdx blob 86243e6 and openzeppelin-relayer.mdx blob 8ef7a6f carry the corrected distinction and no old alias."
    },
    {
      "class": "E",
      "ref": "Primary Docs index and docs_replica_agent strict searches for managed Channels and the former alias",
      "observedAt": "2026-09-09",
      "note": "Both indexes return corrected Tools objects 2 and 13; the exact former-alias query returns zero hits."
    }
  ]
}
```

Replace `truth.verified` with this exact object:

```json
{
  "date": "2026-09-09",
  "by": ".agents/rounds/2026-09-09-docs-golden-matrix-sol.md",
  "evidence": [
    ".agents/rounds/2026-09-09-docs-ingestion-sol.md",
    "Class A: both live Stellar Tools pages distinguish the self-hosted Relayer from managed Channels and contain no former alias.",
    "Class B: stellar-docs db501fe9f2d856f2b38c4da7bf57b325806fe842, blobs 86243e6cf3cc2a672668726cbf94fe87a9cead24 and 8ef7a6f219393fb8495fecc848982e1f37d78a13, matches the live wording.",
    "Class E: both serving indexes return corrected Tools objects 2 and 13; the exact former-alias query returns zero hits.",
    "The expired sd-039 canonical-page caution was removed.",
    "The 2026-09-02 release-version mismatch and inactive Statuspage facts were not reverified or renewed.",
    "Sibling sweep: q-defi-x402-on-stellar-what, q-soroban-x402-auth-entry-signing, q-x402-payment-verification, q-smart-wallet-fee-sponsorship, q-pc-fee-bump-channel-accounts-feepool, and q-tool-passkeykit-smart-wallet retain compatible product and fee-sponsorship boundaries."
  ],
  "rootCause": [
    "freshness-drift",
    "improvements/stellar-docs/sd-039-openzeppelin-relayer-conflated-with-managed-channels.md"
  ]
}
```

The `freshness-drift` cause still governs the unrelated dated version and health facts.
Keep the active finding path until the resolver creates a receipt.

After retirement, replace only the active path with this receipt form:

```text
Resolved finding sd-039 at Raven commit <resolved.json sourceCommit>
```

### 2. `q-infra-horizon-vs-rpc`

File: `eval/qa/corpus/battery/tooling-infra/q-infra-horizon-vs-rpc.json`.

Keep these fields unchanged:

- `golden.answer`
- `golden.keyFacts`
- `golden.avoid`
- `truth.lifecycle`
- `truth.domain`
- `truth.asOf: "2026-09-08"`
- Every existing `truth.sources` entry
- Both existing `truth.corroboration` rows

The general answer sentence about possible index lag remains valid.
It does not claim that the index still lags.

Replace `golden.notes` with this exact string:

```text
Core must_avoid: confusing Horizon/RPC roles + over-claiming a wholesale migration. This is the must_avoid the brief flagged.
Also good if the answer: Roughly half of Horizon's endpoints have no direct RPC equivalent (e.g. claimable balances, offers, liquidity pools, operations/{id}, effects), so Horizon or an indexer is still needed for those. | Both return XDR values inside JSON.
Golden cites: developers.stellar.org Horizon overview, RPC overview, and the migrate-from-horizon-to-rpc guide.
GT-49 CORRECTION 2026-07-11: weight durable architecture and date the lifecycle label.
```

Change this exact field:

```json
"status": "confirmed"
```

Append this exact object to `truth.corroboration`:

```json
{
  "claim": "The current EVM guide, its source, and both serving indexes use the nearing-end-of-life Horizon label.",
  "verdict": "confirmed-as-of",
  "evidence": [
    {
      "class": "A",
      "ref": "https://developers.stellar.org/docs/learn/migrate/evm/smart-contract-deployment",
      "observedAt": "2026-09-09",
      "note": "The rendered guide says Horizon API (nearing end-of-life) and contains no deprecated Horizon API phrase."
    },
    {
      "class": "B",
      "ref": "https://github.com/stellar/stellar-docs/blob/db501fe9f2d856f2b38c4da7bf57b325806fe842/docs/learn/migrate/evm/smart-contract-deployment.mdx",
      "observedAt": "2026-09-09",
      "note": "Blob c7b63187d38d9d368e7eadade08df45d88bff886 contains the corrected phrase and no former phrase."
    },
    {
      "class": "E",
      "ref": "Primary Docs index and docs_replica_agent strict searches for the corrected and former EVM-guide phrases",
      "observedAt": "2026-09-09",
      "note": "Both indexes return corrected EVM object 21; the exact former-phrase query returns zero hits."
    }
  ]
}
```

Replace `truth.verified` with this exact object:

```json
{
  "date": "2026-09-09",
  "by": ".agents/rounds/2026-09-09-docs-golden-matrix-sol.md",
  "evidence": [
    ".agents/rounds/2026-09-09-docs-ingestion-sol.md",
    "Class A: the live EVM guide uses the nearing-end-of-life label, and the four canonical controls keep the future-deprecation boundary.",
    "Class B: stellar-docs db501fe9f2d856f2b38c4da7bf57b325806fe842, EVM blob c7b63187d38d9d368e7eadade08df45d88bff886, matches the live wording.",
    "Class E: both serving indexes return corrected EVM object 21; the exact former-phrase query returns zero hits.",
    "The expired sd-042 canonical-page caution was removed. The durable Horizon and RPC role guidance did not change.",
    "Sibling sweep: q-pc-practical-fee-setting and q-ti-compute-token-lp-market-data use the same lifecycle boundary and reject wholesale replacement."
  ],
  "rootCause": [
    "improvements/stellar-docs/sd-042-horizon-deprecated-present-tense-regression.md"
  ]
}
```

Keep the active finding path until the resolver creates a receipt.
After retirement, replace it with this receipt form:

```text
Resolved finding sd-042 at Raven commit <resolved.json sourceCommit>
```

### 3. `q-pc-practical-fee-setting`

File: `eval/qa/corpus/battery/protocol-core/q-pc-practical-fee-setting.json`.

Keep these fields unchanged:

- `golden.answer`
- `golden.keyFacts`
- `golden.avoid`
- `truth.lifecycle`
- `truth.domain`
- `truth.status: "confirmed"`
- Every existing `truth.sources` entry
- The existing fee corroboration row

Replace `golden.notes` with this exact string:

```text
GT-29/GT-32 CORRECTION 2026-07-10: lead with RPC getFeeStats/current CLI; Horizon /fee_stats remains available and Horizon is legacy/no-new-features, not formally deprecated. Hubble is historical analytics. Date the 100-stroop floor and provider observations.
GT-29 endpoint/discoverability recurrence attaches to sd-003. The 2026-09-08 live pages agree on the nearing-end-of-life label.
Accurately quoting the canonical Stellar documentation on RPC getFeeStats method discoverability is not a wrong claim while sd-003 stands; grade caps at partial for that claim unless the answer contradicts the golden fact independently of the quoted source.
```

Append this exact object to `truth.corroboration`:

```json
{
  "claim": "The Horizon lifecycle source conflict cited by this fee case no longer exists in current pages, source, or indexes.",
  "verdict": "confirmed-as-of",
  "evidence": [
    {
      "class": "A",
      "ref": "https://developers.stellar.org/docs/learn/migrate/evm/smart-contract-deployment and current canonical Horizon pages",
      "observedAt": "2026-09-09",
      "note": "The rendered pages use the same nearing-end-of-life and future-deprecation boundary."
    },
    {
      "class": "B",
      "ref": "https://github.com/stellar/stellar-docs/blob/db501fe9f2d856f2b38c4da7bf57b325806fe842/docs/learn/migrate/evm/smart-contract-deployment.mdx",
      "observedAt": "2026-09-09",
      "note": "Blob c7b63187d38d9d368e7eadade08df45d88bff886 contains the corrected phrase and no former phrase."
    },
    {
      "class": "E",
      "ref": "Primary Docs index and docs_replica_agent strict searches for the corrected and former EVM-guide phrases",
      "observedAt": "2026-09-09",
      "note": "Both indexes return corrected EVM object 21; the exact former-phrase query returns zero hits."
    }
  ]
}
```

Replace `truth.verified` with this exact object:

```json
{
  "date": "2026-09-09",
  "by": ".agents/rounds/2026-09-09-docs-golden-matrix-sol.md",
  "evidence": [
    ".agents/rounds/2026-09-09-docs-ingestion-sol.md",
    "Classes A, B, and E agree that the EVM guide now uses the nearing-end-of-life label.",
    "Both serving indexes return corrected EVM object 21; the exact former-phrase query returns zero hits.",
    "The stale sd-042 index sentence was removed from golden.notes.",
    "The fee floor, surge, getFeeStats, Horizon fee_stats, Hubble, and active sd-003 claims were not reverified or renewed.",
    "Sibling sweep: q-infra-horizon-vs-rpc and q-ti-compute-token-lp-market-data use the same lifecycle boundary."
  ],
  "rootCause": [
    "improvements/stellar-docs/sd-042-horizon-deprecated-present-tense-regression.md",
    "improvements/stellar-docs/sd-003-rpc-method-reference-pages-unindexed.md"
  ]
}
```

Keep both active paths until the `sd-042` resolver creates a receipt.
After retirement, replace only the `sd-042` path with this receipt form:

```text
Resolved finding sd-042 at Raven commit <resolved.json sourceCommit>
```

Keep `improvements/stellar-docs/sd-003-rpc-method-reference-pages-unindexed.md` unchanged.

### 4. `q-protocol-ledger-close-time`

File: `eval/qa/corpus/battery/protocol-core/q-protocol-ledger-close-time.json`.

Keep these fields unchanged:

- All `golden` fields
- `truth.lifecycle`
- `truth.domain`
- `truth.status: "confirmed"`
- Every historical `truth.corroboration` row
- Every empirical cadence value and date
- Every `truth.sources` entry except the Validators note

Replace `truth.sources[2].note` with this exact string:

```text
On 2026-09-09 the rendered page and both Docs indexes said 'every 5-7 seconds'; the former 3-5-second phrase returned zero strict hits.
```

Append this exact object to `truth.corroboration`:

```json
{
  "claim": "Current Validators and Stellar Stack pages, source files, and serving indexes agree on every 5-7 seconds.",
  "verdict": "confirmed-as-of",
  "evidence": [
    {
      "class": "A",
      "ref": "https://developers.stellar.org/docs/validators and https://developers.stellar.org/docs/learn/fundamentals/stellar-stack",
      "observedAt": "2026-09-09",
      "note": "Both rendered pages say every 5-7 seconds and contain no every 3-5 seconds phrase."
    },
    {
      "class": "B",
      "ref": "https://github.com/stellar/stellar-docs/tree/db501fe9f2d856f2b38c4da7bf57b325806fe842/docs",
      "observedAt": "2026-09-09",
      "note": "Validators blob f74c262 and Stellar Stack blob 06c92f8 each say 5-7 once and 3-5 zero times."
    },
    {
      "class": "E",
      "ref": "Primary Docs index and docs_replica_agent strict searches for every 5-7 seconds and every 3-5 seconds",
      "observedAt": "2026-09-09",
      "note": "Both indexes return Validators object 2 and Stellar Stack object 6 for 5-7; the exact 3-5 query returns zero hits."
    }
  ]
}
```

Replace `truth.verified` with this exact object:

```json
{
  "date": "2026-09-09",
  "by": ".agents/rounds/2026-09-09-docs-golden-matrix-sol.md",
  "evidence": [
    ".agents/rounds/2026-09-09-docs-ingestion-sol.md",
    "Class A: live Validators and Stellar Stack pages each say every 5-7 seconds and contain no former cadence phrase.",
    "Class B: stellar-docs db501fe9f2d856f2b38c4da7bf57b325806fe842, blobs f74c26290ba7653f584805bb3b02867b97aee3af and 06c92f8dbcd2f30e0f855bd18bf7abbc3c9e9713, matches both pages.",
    "Class E: both serving indexes return Validators object 2 and Stellar Stack object 6; the exact former-cadence query returns zero hits.",
    "The 2026-08-30 and 2026-08-31 conflict and sample rows remain dated historical evidence.",
    "The golden answer, key facts, avoid items, and empirical cadence claims did not change or receive a new date.",
    "Sibling sweep: q-protocol-ledger-header-fields, q-ti-tx-too-late-resubmit, q-soroban-storage-types, q-infra-quickstart-local-network, and q-protocol-max-tx-set-size contain no conflicting cadence claim."
  ],
  "rootCause": [
    "improvements/stellar-docs/sd-047-validators-ledger-close-cadence-conflict.md"
  ]
}
```

Keep the active finding path until the resolver creates a receipt.
After retirement, replace it with this receipt form:

```text
Resolved finding sd-047 at Raven commit <resolved.json sourceCommit>
```

## Sibling and register impact

### Direct topical siblings

| Changed case | Sibling IDs | Result |
| --- | --- | --- |
| `q-ti-openzeppelin-relayer` | `q-defi-x402-on-stellar-what`; `q-soroban-x402-auth-entry-signing`; `q-x402-payment-verification`; `q-smart-wallet-fee-sponsorship`; `q-pc-fee-bump-channel-accounts-feepool`; `q-tool-passkeykit-smart-wallet` | Product identity and fee-sponsorship boundaries remain compatible. |
| `q-infra-horizon-vs-rpc` | `q-pc-practical-fee-setting`; `q-ti-compute-token-lp-market-data` | All use the same dated Horizon boundary. All reject wholesale RPC replacement. |
| `q-pc-practical-fee-setting` | `q-infra-horizon-vs-rpc`; `q-ti-compute-token-lp-market-data`; `q-edge-1xlm-activation-fee`; `q-hot-fee-pool-burn-deflation`; `q-pc-fee-bump-channel-accounts-feepool`; `q-pc-sequence-numbers-ordering-replace`; `q-ti-channel-accounts-throughput` | The lifecycle cleanup changes no fee, estimator, fee-pool, or sequence claim. |
| `q-protocol-ledger-close-time` | `q-protocol-ledger-header-fields`; `q-ti-tx-too-late-resubmit`; `q-soroban-storage-types`; `q-infra-quickstart-local-network`; `q-protocol-max-tx-set-size`; `q-asset-path-payment-ops` | No sibling states a conflicting fixed cadence. The path-payment estimate remains approximate. |

### Current register memberships

`q-ti-openzeppelin-relayer` has no consistency-register membership.

| Register entry | Changed members | Other member IDs | Current state |
| --- | --- | --- | --- |
| `cluster-017` | `q-pc-practical-fee-setting`; `q-protocol-ledger-close-time` | `q-asset-amm-fee-reserve`; `q-asset-path-payment-ops`; `q-asset-sdex-vs-amm`; `q-asset-trustline-basics`; `q-edge-1xlm-activation-fee`; `q-edge-noinfo-stellar-pos-staking-rewards`; `q-hot-fee-pool-burn-deflation`; `q-pc-account-activation-not-found`; `q-pc-sponsored-reserves`; `q-protocol-base-reserve-min-balance`; `q-sor-doc-timestamping-manage-data`; `q-soroban-simulate-resource-fee`; `q-token-initial-supply-distribution` | `consistent`, checked 2026-09-09. |
| `cluster-018` | `q-infra-horizon-vs-rpc` | `q-infra-hubble-bigquery`; `q-infra-rpc-methods-list`; `q-infra-rpc-provider-archive-tier`; `q-infra-which-indexer`; `q-soroban-event-indexing-design`; `q-soroban-publish-events`; `q-ti-compute-token-lp-market-data`; `q-ti-enumerate-holders-airdrop`; `q-ti-historical-pointintime-balances`; `q-ti-rpc-gettransactions-pagination-xdr`; `q-ti-self-host-retention-backfill` | `consistent`, checked 2026-09-09. The note states current agreement before dated conflict history. |
| `cluster-042` | `q-pc-practical-fee-setting` | `q-hot-fee-pool-burn-deflation` | `consistent`, checked 2026-09-09. |
| `cluster-056` | `q-pc-practical-fee-setting` | `q-hot-fee-pool-burn-deflation`; `q-pc-fee-bump-channel-accounts-feepool`; `q-pc-sequence-numbers-ordering-replace`; `q-ti-channel-accounts-throughput` | `consistent`, checked 2026-09-09. |
| `cluster-061` | Both Horizon cases | None | `consistent`, checked 2026-09-09. Both members now state current source/index agreement. |
| `cluster-063` | Both Horizon cases | None | `consistent`, checked 2026-09-09. Fee and estimator claims remain unchanged. |
| `cluster-065` | `q-protocol-ledger-close-time` | `q-protocol-max-tx-set-size` | `consistent`, checked 2026-09-09. |
| Numeric invariant `Stellar base fee floor` | `q-pc-practical-fee-setting` | `q-edge-1xlm-activation-fee` | `100 stroops per operation`; `consistent`, checked 2026-09-09. |

No date-contingent trap contains these four cases.

### Exact current register result

The register carries the changed member hashes.
It reopened seven clusters and one numeric invariant.
The scoped review returned every entry to `consistent`.

`lastChecked` and `reSwept.date` equal `2026-09-09` for all eight entries.
Each `reSwept.verdict` and top-level `verdict` equals `consistent`.

The current `reSwept.reason` values are:

| Entry | Exact reason |
| --- | --- |
| `cluster-017` | `Docs ingestion review (2026-09-09): the 15 member goldens retain the same fee, reserve, supply, monetary-history, and cadence facts. The fee-setting case changes only Horizon lifecycle sourcing. The cadence case changes only source/index provenance. Related-claim sweep found no contradiction; prior numeric evidence remains dated and unchanged.` |
| `cluster-018` | `Docs ingestion review (2026-09-09): the 12 members retain endpoint-specific Horizon/RPC roles, provider retention, getLedgers archive scope, and historical indexer boundaries. The Horizon case removes only the expired source/index conflict. The market-data sibling already uses nearing-end-of-life wording. Related-claim sweep found no contradiction.` |
| `cluster-042` | `Docs ingestion review (2026-09-09): both members retain fee-pool sequestration, supply-burn distinctions, and fee-estimator facts. Only the fee-setting case's Horizon source/index qualifier changes. No monetary-history fact changes.` |
| `cluster-056` | `Docs ingestion review (2026-09-09): all five members retain outer-fee charging, independent channel sequences, fee-estimator priority, and the absence of validator fee rewards. The only judge-facing change concerns the fee-setting case's Horizon source/index agreement.` |
| `cluster-061` | `Docs ingestion review (2026-09-09): both members now state the verified September 9 Horizon source/index agreement. Neither claims complete Horizon/RPC parity. The expired index caution is removed; endpoint and fee facts remain unchanged.` |
| `cluster-063` | `Docs ingestion review (2026-09-09): both members retain the dated 100-stroop floor, RPC getFeeStats priority, Horizon fee_stats availability, and Hubble historical role. Only Horizon lifecycle sourcing and the expired index qualifier change.` |
| `cluster-065` | `Docs ingestion review (2026-09-09): both members retain their prior numeric claims. The cadence case changes only current source/index provenance and preserves all historical samples. The max-tx-set case asserts separate dated limits, not a conflicting cadence.` |
| Numeric invariant `Stellar base fee floor` | `Docs ingestion review (2026-09-09): q-pc-practical-fee-setting changes only its Horizon source/index agreement and current provenance. Its dated 100-stroop floor, surge qualification, and fee-estimator facts remain unchanged. The sibling q-edge-1xlm-activation-fee retains the same dated fee floor and distinguishes fees from reserves. This review does not refresh the network fee setting.` |

The generator computed these changed hashes:

```text
q-infra-horizon-vs-rpc       cf5eaca0cdcc4bec435176547b45cfc6b349075f632931f3395b958be801ed25
q-pc-practical-fee-setting   6b45c8ba7ea0c18e21ff067667a771e49544decc09ac89425516917a11b8f833
q-protocol-ledger-close-time b9accde040d46de223f08aebd18a5967659db045889337c1c44486929278c67d
```

`q-ti-openzeppelin-relayer` has no register hash.
The final `npm run eval:qa:register -- --check` passed.

The targeted sibling projection found no contradictory claim.
`q-asset-path-payment-ops` keeps only an approximate `~5 s` estimate.
No sibling states `3-5 seconds` as the current guaranteed cadence.
The Horizon siblings retain endpoint-specific roles.
The fee siblings retain the existing fee and sequence rules.
The Relayer siblings do not repeat the retired product alias.

## Exact command record

The following commands produced or checked the evidence.
They disclose no credential value.

### Read the four cases and register

```sh
jq '{id, golden, truth}' eval/qa/corpus/battery/tooling-infra/q-ti-openzeppelin-relayer.json
jq '{id, golden, truth}' eval/qa/corpus/battery/tooling-infra/q-infra-horizon-vs-rpc.json
jq '{id, golden, truth}' eval/qa/corpus/battery/protocol-core/q-pc-practical-fee-setting.json
jq '{id, golden, truth}' eval/qa/corpus/battery/protocol-core/q-protocol-ledger-close-time.json

jq -c '.clusters.entries[] | select(any(.members[]; . == "q-ti-openzeppelin-relayer" or . == "q-infra-horizon-vs-rpc" or . == "q-pc-practical-fee-setting" or . == "q-protocol-ledger-close-time")) | {id,label,members,verdict,lastChecked,reSwept}' eval/qa/consistency-register.json

jq '.numericInvariants.entries[] | select(any(.affectedCaseIds[]?; . == "q-pc-practical-fee-setting")) | {label,authoritativeValue,affectedCaseIds,verdict,lastChecked,reSwept}' eval/qa/consistency-register.json
```

### Class A rendered-page checks

```sh
for u in \
  https://developers.stellar.org/docs/tools \
  https://developers.stellar.org/docs/tools/openzeppelin-relayer \
  https://developers.stellar.org/docs/learn/migrate/evm/smart-contract-deployment \
  https://developers.stellar.org/docs/data/apis \
  https://developers.stellar.org/docs/validators \
  https://developers.stellar.org/docs/learn/fundamentals/stellar-stack
do
  body=$(curl -LsS "$u")
  printf '%s\told_alias=%s\tdeprecated=%s\tnearing=%s\t3-5=%s\t5-7=%s\n' \
    "$u" \
    "$(printf '%s' "$body" | rg -o -i 'also known as Stellar Channels Service' | wc -l | tr -d ' ')" \
    "$(printf '%s' "$body" | rg -o -i 'deprecated Horizon API' | wc -l | tr -d ' ')" \
    "$(printf '%s' "$body" | rg -o -i 'Horizon API \(nearing end-of-life\)' | wc -l | tr -d ' ')" \
    "$(printf '%s' "$body" | rg -o -i 'every 3-5 seconds' | wc -l | tr -d ' ')" \
    "$(printf '%s' "$body" | rg -o -i 'every 5-7 seconds' | wc -l | tr -d ' ')"
done
```

The ingestion report also checked these three Horizon controls:

```text
https://developers.stellar.org/docs/learn/fundamentals/stellar-stack
https://developers.stellar.org/docs/tools/lab/api-explorer
https://developers.stellar.org/docs/tools/lab/api-explorer/horizon-endpoint
```

### Class B source checks

```sh
gh api repos/stellar/stellar-docs/commits/main --jq .sha

for p in \
  docs/tools/README.mdx \
  docs/tools/openzeppelin-relayer.mdx \
  docs/learn/migrate/evm/smart-contract-deployment.mdx \
  docs/validators/README.mdx \
  docs/learn/fundamentals/stellar-stack.mdx
do
  gh api "repos/stellar/stellar-docs/contents/$p?ref=db501fe9f2d856f2b38c4da7bf57b325806fe842" --jq .sha
  gh api "repos/stellar/stellar-docs/contents/$p?ref=db501fe9f2d856f2b38c4da7bf57b325806fe842" \
    -H 'Accept: application/vnd.github.raw+json' \
    | rg -n 'open source framework|managed service|Horizon API \(nearing end-of-life\)|every 3-5 seconds|every 5-7 seconds|also known as Stellar Channels Service|deprecated Horizon API'
done
```

### Class E index checks

The completed ingestion batch queried both serving indexes.
It set `analytics:false` and `clickAnalytics:false` on every request.

Indexes:

```text
crawler_Stellar Docs - Docusaurus
docs_replica_agent
```

Exact query set:

```json
[
  "\"also known as Stellar Channels Service\"",
  "managed Channels",
  "\"deprecated Horizon API\"",
  "\"Horizon API (nearing end-of-life)\"",
  "\"every 3-5 seconds\"",
  "\"every 5-7 seconds\""
]
```

Every strict request also used these exact parameters:

```json
{
  "hitsPerPage": 15,
  "removeWordsIfNoResults": "none",
  "queryType": "prefixNone",
  "typoTolerance": false,
  "analytics": false,
  "clickAnalytics": false
}
```

The request endpoint was exact:

```text
POST https://VNSJF5AWIZ-dsn.algolia.net/1/indexes/*/queries
```

The report records only projected object IDs, URLs, counts, and phrase matches.
No operator credential entered output.

### Proposed author verification

These commands apply only after an authorized author edits the cases.
They are not part of this research-only lane.

```sh
npm run eval:qa:register
npm run eval:qa:compile
npm run eval:qa:lint -- --since <branch-base>
npm run secrets:scan -- --tree
git diff -- \
  eval/qa/corpus/battery/tooling-infra/q-ti-openzeppelin-relayer.json \
  eval/qa/corpus/battery/tooling-infra/q-infra-horizon-vs-rpc.json \
  eval/qa/corpus/battery/protocol-core/q-pc-practical-fee-setting.json \
  eval/qa/corpus/battery/protocol-core/q-protocol-ledger-close-time.json \
  eval/qa/consistency-register.json \
  eval/qa/cases.json \
  eval/qa/sample.json
```

## Retirement boundary

The three findings currently have `fixed-upstream` status.
Their distinct retirement reviews and resolver receipts remain pending.

Do not invent a resolved commit in the golden patch.
Keep each active finding path until its receipt exists.
Then replace only that path with the exact receipt form above.

Historical matrices, findings, and round reports remain historical evidence.
Do not rewrite them to describe current state.
