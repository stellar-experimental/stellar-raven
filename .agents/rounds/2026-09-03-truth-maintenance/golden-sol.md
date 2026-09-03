# Golden-truth health review

Review date: 2026-09-03.

This review covers every case with `truth.reverifyBy` through 2026-10-01.
It gives priority to the five cases due on 2026-09-03.
It uses live primary sources and independent source classes where necessary.
No corpus file changed during this review.
No paid call or deployment occurred.

## Result

Five cases need material judge-facing edits.
Three more cases need date-only judge-facing edits.
Seven cases need only truth metadata refreshes.
Two cases remain unresolved after the proposed edits.

| Result | Cases |
|---|---|
| Material judge-facing edit | `q-scf-current-round`, `q-edge-fresh-latest-scf-round`, `q-scf-open-rfps`, `q-scf-rfp-tooling`, `q-ti-stellar-lab-usage-and-new-ui` |
| Date-only judge-facing edit | `q-soroban-sdk-cve`, `q-edge-factcheck-soroswap-first-amm`, `q-ti-rpc-gettransactions-pagination-xdr` |
| Truth metadata refresh only | `q-tool-cli-skills-discovery`, `q-tool-indexer-repos-discovery`, `q-tool-leaderboard-open-issues`, `q-tool-sdk-repos-discovery`, `q-tool-skill-detail-install`, `q-tool-smart-wallet-repos-discovery`, `q-pc-slp-0004-0006-status` |
| Remains unresolved | `q-ti-rpc-gettransactions-pagination-xdr`, `q-ti-stellar-lab-usage-and-new-ui` |

The five cases due today have one material failure.
`q-scf-current-round` is stale because SCF #46 opened.
The other four due cases remain correct.

## Corroboration matrix

Source classes follow the golden-truth runbook.
Class A is an authoritative operational page.
Class B is a primary repository or specification.
Class C is a live service response.
Class D is an independent source.
Class F is an empirical observation.

| Case | Due | Evidence | Live result | Verdict | Proposed action |
|---|---:|---|---|---|---|
| `q-scf-current-round` | 2026-09-03 | A: [SCF awards](https://communityfund.stellar.org/awards). C: [Scout open RFPs](https://stellarlight.xyz/api/rfps?status=open). | #46 is in Submission through 2026-11-08. #45 is in Panel Review. #44 is last confirmed. | Stale | Material edit |
| `q-tool-cli-skills-discovery` | 2026-09-03 | C: [Scout skills](https://stellarlight.xyz/api/skills). A/B: [Stellar Skills](https://skills.stellar.org/). | The live response returned 43 rows. Its source and kind enums remain unchanged. | Confirmed | Metadata only |
| `q-tool-indexer-repos-discovery` | 2026-09-03 | C: live Scout repository search. B: direct GitHub repositories. | Current results preserve indexer, Galexie, ETL, Go SDK, and starter roles. | Confirmed | Metadata only |
| `q-tool-leaderboard-open-issues` | 2026-09-03 | C: live Scout leaderboard. D: GitHub issue-query rules. | The response defines issue-only totals. It excludes pull requests. It labels the value as backlog size. | Confirmed | Metadata only |
| `q-tool-sdk-repos-discovery` | 2026-09-03 | C: live Scout repository search. A/B: official SDK pages and direct repositories. | The current rows remain dynamic. The golden already forbids a static roster. | Confirmed | Metadata only |
| `q-edge-fresh-latest-scf-round` | 2026-09-10 | A: SCF awards. C: Scout open RFPs. | The same SCF phase change invalidates its dated example. | Stale | Material edit |
| `q-soroban-sdk-cve` | 2026-09-10 | B: [GitHub advisories](https://github.com/stellar/rs-soroban-sdk/security/advisories). D: [OSV](https://osv.dev/). | The same three CVE/GHSA mappings remain current. No listed advisory was withdrawn. | Confirmed | Date-only edit |
| `q-edge-factcheck-soroswap-first-amm` | 2026-09-17 | B: [CAP-0038](https://github.com/stellar/stellar-protocol/blob/master/core/cap-0038.md). D: [DefiLlama Soroswap AMM](https://defillama.com/protocol/soroswap-amm). | Protocol 18 still disproves broad first-AMM wording. The live TVL was about $1.19M. | Confirmed | Date-only edit |
| `q-scf-open-rfps` | 2026-09-17 | A: [SCF RFP track](https://stellar.gitbook.io/scf-handbook/scf-awards/build-award/rfp-track). C: Scout open RFPs. | Two briefs remain open. Scout now adds one synthetic #46 round row. | Stale | Material edit |
| `q-scf-rfp-tooling` | 2026-09-24 | A: SCF RFP track. C: Scout open RFPs. | The two tooling briefs remain. The response now reports `syntheticRounds=1`. | Stale | Material edit |
| `q-tool-skill-detail-install` | 2026-09-24 | C: live Scout skill detail. A/B: Stellar Skills and its repository. | `soroban` remains absent. `smart-contracts` remains the current topic match. | Confirmed | Metadata only |
| `q-tool-smart-wallet-repos-discovery` | 2026-09-29 | C: live Scout repository search. B: direct GitHub repository metadata. | `stellar/passkey-kit` and `stellar/smart-account-kit` remain active. | Confirmed | Metadata only |
| `q-pc-slp-0004-0006-status` | 2026-10-01 | B: [SLP-0004](https://github.com/stellar/stellar-protocol/blob/master/limits/slp-0004.md) and [SLP-0006](https://github.com/stellar/stellar-protocol/blob/master/limits/slp-0006.md). | SLP-0004 remains Final. SLP-0006 remains Draft. Their stated values remain unchanged. | Confirmed | Metadata only |
| `q-ti-rpc-gettransactions-pagination-xdr` | 2026-10-01 | A: [getTransactions](https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getTransactions). B: [RPC options source](https://github.com/stellar/stellar-rpc/blob/main/cmd/stellar-rpc/internal/config/options.go). | The page still says hardcoded 200. Source still exposes configurable 50 and 200 defaults. | Disputed | Date-only edit |
| `q-ti-stellar-lab-usage-and-new-ui` | 2026-10-01 | A: [Saved Keypairs docs](https://developers.stellar.org/docs/tools/lab/saved/keypairs). B: [Lab storage source](https://github.com/stellar/laboratory/blob/master/src/helpers/localStorageSavedKeypairs.ts). F: live Lab inspection. | Docs say obfuscated. Source writes raw `secretKey` objects as JSON. The UI says unencrypted and unprotected. | Disputed | Material edit |

### Supporting live observations

The SCF awards page showed #46 in Submission.
It showed a 2026-11-08 deadline.
It showed #45 in Panel Review.
It showed #44 as ended.

Scout returned `currentRound: 46` and `currentPhase: Submission`.
Scout returned `lastConfirmedRound: 44`.
Scout returned two open RFP briefs and one synthetic round row.
Its observed response time was `2026-09-03T15:39:35.870Z`.

The Scout skills response returned 43 rows.
It returned eight SDF rows and 15 Stellar Light rows.
It returned eight Lumenloop rows and 12 external rows.
It returned zero community rows.
Empty categories remain valid.

The GitHub advisory API returned three current Soroban SDK advisories.
OSV returned the same three CVEs.
The patch mappings remain unchanged.

The current Laboratory source defines `SavedKeypair.secretKey` as a string.
The storage helper applies `JSON.stringify` directly to each saved object.
The Saved Keypairs page calls the storage unencrypted and unprotected.
The official documentation still calls the same storage obfuscated.

Mainnet still runs Protocol 27.
Horizon returned `current_protocol_version: 27` on 2026-09-03.
It returned `core_supported_protocol_version: 28`.

## Exact proposed corpus edits

Do not apply these edits before owner approval.
Each applied judge-facing edit must refresh `truth.verified` in the same change.

### 1. `q-scf-current-round`

Replace `golden.answer` with:

> A grounded answer checks the live official awards state and Scout round metadata. It dates every volatile claim. As of 2026-09-03, SCF #46 is the current round in Submission. Its submission deadline is 2026-11-08. SCF #45 is in Panel Review. SCF #44 is the last concluded round.
>
> The dated example is illustrative. A later answer must report the state supported at its observation time.

Replace `golden.keyFacts` with:

```json
[
  "Presents specific source-supported content as current or dated.",
  "Makes the as-of date visible for each changeable status or deadline.",
  "Reports SCF #46 in Submission in the dated example.",
  "Reports 2026-11-08 as SCF #46's submission deadline.",
  "Places #45 in Panel Review and #44 as the last concluded round."
]
```

Replace `golden.avoid` with:

```json
[
  "Do NOT call #45 current, say no round is in Submission, or treat #44 as current.",
  "Do NOT invent a deadline time, timezone, notification date, or submission count.",
  "Do NOT present a live phase or deadline as permanent."
]
```

Replace `golden.notes` with:

> Freshness item: grade a dated round, phase, and deadline from official and live sources. As of 2026-09-03, #46 is in Submission through 2026-11-08. #45 is in Panel Review. #44 is the last concluded round. The fixed #43 result remains separate.

Set these truth fields:

```json
{
  "status": "confirmed",
  "asOf": "2026-09-03",
  "reverifyBy": "2026-11-09"
}
```

Replace its corroboration claim with this text:

> As of 2026-09-03, SCF #46 is in Submission through 2026-11-08. #45 is in Panel Review. #44 is last concluded.

Use verdict `confirmed-as-of`.
Use the SCF awards page as class A evidence.
Use the Scout response as class C evidence.

### 2. `q-edge-fresh-latest-scf-round`

Replace `golden.answer` with:

> As of 2026-09-03, SCF #46 is the current round in Submission. Its submission deadline is 2026-11-08. SCF #45 is in Panel Review. SCF #44 is the last concluded round. A grounded answer checks official awards state and Scout metadata.
>
> The dated example is illustrative. A later answer must report the state supported at its observation time.

Replace its five key facts with the five key facts from `q-scf-current-round`.
Replace its avoid items with the three avoid items from `q-scf-current-round`.

Replace `golden.notes` with:

> GT-23 refreshed 2026-09-03. Require a dated round, phase, and deadline. #46 is in Submission through 2026-11-08. #45 is in Panel Review. #44 is concluded.

Set these truth fields:

```json
{
  "status": "confirmed",
  "asOf": "2026-09-03",
  "reverifyBy": "2026-11-10"
}
```

Use the same updated claim and evidence classes as `q-scf-current-round`.

### 3. `q-scf-open-rfps`

Replace `golden.answer` with:

> A grounded answer derives names and status from the live Scout response and official SCF pages. As of 2026-09-03, two Q3 RFP briefs remain open: LayerZero DVN and x402 Facilitator with Bazaar. Scout also returns one synthetic `scf-round-46` row. That row represents #46's Submission window through 2026-11-08. It is not a third RFP brief.
>
> The dated example is illustrative. A later answer must report the roster and round state supported then.

Replace `golden.keyFacts` with:

```json
[
  "Presents specific source-supported content as a current or dated observation.",
  "Makes the as-of date visible for each changeable roster or status.",
  "Reports the two currently open RFP briefs.",
  "Reports one synthetic SCF #46 round row.",
  "Distinguishes an RFP brief from a synthetic round row."
]
```

Replace `golden.avoid` with:

```json
[
  "Do NOT claim syntheticRounds=0 or omit the current synthetic #46 row.",
  "Do NOT count the synthetic round row as a third RFP brief.",
  "Do NOT claim an open brief guarantees eligibility or an invitation.",
  "Do NOT claim the observed roster is permanent or complete."
]
```

Replace `golden.notes` with:

> Freshness item: grade dated roster and round behavior. As of 2026-09-03, two briefs remain open. Scout returns one separate #46 synthetic round row. #46 accepts submissions through 2026-11-08.

Set these truth fields:

```json
{
  "status": "confirmed",
  "asOf": "2026-09-03",
  "reverifyBy": "2026-11-12"
}
```

Update both corroboration rows.
The first row must confirm two briefs and `syntheticRounds=1`.
The second row must confirm #46 Submission through 2026-11-08.

### 4. `q-scf-rfp-tooling`

Replace `golden.answer` with:

> Yes. As of 2026-09-03, two open infrastructure briefs remain published: LayerZero DVN and x402 Facilitator with Bazaar. Scout also returns one synthetic `scf-round-46` row. Applicants start with the rolling interest form. They submit a full proposal only if invited. #46 accepts submissions through 2026-11-08. An open brief does not guarantee eligibility or an invitation.
>
> The dated example is illustrative. A later answer must report the roster and round state supported then.

Replace `golden.keyFacts` with:

```json
[
  "Presents specific source-supported content as current or dated.",
  "Makes the as-of date visible for each changeable roster or status.",
  "Reports two briefs and one separate synthetic round row.",
  "Explains the rolling interest-form-to-invitation path.",
  "Does not treat an open brief as guaranteed eligibility."
]
```

Replace `golden.avoid` with:

```json
[
  "Do NOT claim syntheticRounds=0 or count the round row as a brief.",
  "Do NOT claim every interest form receives an invitation.",
  "Do NOT claim each brief has a published bounty or community vote.",
  "Do NOT claim the observed roster is permanent or complete."
]
```

Replace `golden.notes` with:

> Freshness item: grade dated roster and round behavior. As of 2026-09-03, two tooling briefs remain open. Scout returns one separate #46 row. The rolling interest path remains invitation-gated.

Set these truth fields:

```json
{
  "status": "confirmed",
  "asOf": "2026-09-03",
  "reverifyBy": "2026-11-13"
}
```

Update both corroboration rows like `q-scf-open-rfps`.
Keep the official RFP page as class A evidence.

### 5. `q-ti-stellar-lab-usage-and-new-ui`

Keep the first, third, and fourth answer paragraphs.
Replace the second answer paragraph with:

> Current signing paths include wallet-kit, hardware, external, and raw-secret paths. Prefer a wallet, hardware, or a separately trusted external signer. Lab performs raw-secret signing in browser JavaScript. Saved Keypairs is limited to Testnet and Futurenet. The live UI and current source store secret keys unencrypted in browser `localStorage`. The official page still says they are obfuscated. Treat this as a canonical-page conflict. Never use Saved Keypairs for Mainnet custody.

Replace the third key fact with:

> Records the current Saved Keypairs documentation and implementation conflict.

Replace the first avoid item with:

> Do NOT call Saved Keypairs encrypted, protected, offline, air-gapped, or suitable for a Mainnet seed. Attribute any obfuscation claim to the official page.

Replace `golden.notes` with:

> GT-54 refreshed 2026-09-03. Grade current capabilities, signer categories, offline boundaries, and SAC deployment correctly. The official Saved Keypairs page says secrets are obfuscated. Current source writes `SavedKeypair.secretKey` through direct JSON serialization. The live page says storage is unencrypted and unprotected. Treat the storage representation as disputed. An attributed documentation claim can earn partial credit. An unqualified current-obfuscation claim conflicts with implementation. This caution expires after source, UI, and documentation agree.

Set these truth fields:

```json
{
  "status": "disputed",
  "asOf": "2026-09-03",
  "reverifyBy": "2026-10-01"
}
```

Replace the Saved Keypairs corroboration row with:

```json
{
  "claim": "Current documentation says Saved Keypairs are obfuscated, while current source and live UI show unencrypted JSON storage.",
  "verdict": "disputed"
}
```

Add these evidence records to that row:

```json
[
  {
    "class": "A",
    "ref": "https://developers.stellar.org/docs/tools/lab/saved/keypairs",
    "observedAt": "2026-09-03",
    "note": "The page says saved keys are obfuscated but not encrypted."
  },
  {
    "class": "B",
    "ref": "https://github.com/stellar/laboratory/blob/master/src/helpers/localStorageSavedKeypairs.ts",
    "observedAt": "2026-09-03",
    "note": "The helper serializes SavedKeypair objects directly with JSON.stringify."
  },
  {
    "class": "F",
    "ref": "https://lab.stellar.org/account/saved",
    "observedAt": "2026-09-03",
    "note": "The live UI says localStorage is unencrypted and has no protection."
  }
]
```

Add `improvements/stellar-docs/sd-049-lab-saved-keypairs-obfuscation-conflict.md` to `truth.verified.rootCause`.
Do not reuse resolved finding `sd-030`.
Add a matching `.agents/TODO.md` item before a corpus edit.

### 6. `q-soroban-sdk-cve`

Change only the answer date from `2026-08-05` to `2026-09-03`.
Keep the three CVE mappings and all patch versions.

Set these truth fields:

```json
{
  "status": "confirmed",
  "asOf": "2026-09-03",
  "reverifyBy": "2026-12-10"
}
```

Refresh advisory evidence from GitHub and OSV.

### 7. `q-edge-factcheck-soroswap-first-amm`

Change the DefiLlama observation date to `2026-09-03`.
Change the current TVL example from `$1.20M` to `$1.19M`.
Keep the maximum as below `$10M`.
Keep those measurements non-gating.

Set these truth fields:

```json
{
  "status": "confirmed",
  "asOf": "2026-09-03",
  "reverifyBy": "2026-12-17"
}
```

### 8. `q-ti-rpc-gettransactions-pagination-xdr`

Change the stock-default observation date from `2026-07-11` to `2026-09-03`.
Keep every limit and XDR mapping unchanged.
Keep the canonical-page caution unchanged.

Set these truth fields:

```json
{
  "status": "disputed",
  "asOf": "2026-09-03",
  "reverifyBy": "2027-01-14"
}
```

Refresh the dispute evidence.
The class A page still calls 200 hardcoded.
The class B source still exposes operator configuration.

## Exact metadata-only refreshes

Keep `golden.answer`, `golden.keyFacts`, `golden.avoid`, and `golden.notes` unchanged for these cases.
Replace `truth.verified` with a dated review record.
The record must cite this report and the matrix evidence.

| Case | `truth.asOf` | `truth.reverifyBy` | Exact new evidence summary |
|---|---:|---:|---|
| `q-tool-cli-skills-discovery` | 2026-09-03 | 2026-12-03 | C returned 43 rows and unchanged enums. A/B confirmed the official skill catalog and source links. |
| `q-tool-indexer-repos-discovery` | 2026-09-03 | 2026-12-10 | C returned current indexer results. B confirmed the current official repository roles and activity. |
| `q-tool-leaderboard-open-issues` | 2026-09-03 | 2026-12-17 | C defined issue-only totals and backlog semantics. D confirmed GitHub issue and pull-request distinctions. |
| `q-tool-sdk-repos-discovery` | 2026-09-03 | 2026-12-24 | C returned current SDK rows. A/B confirmed current ownership and repository identity. |
| `q-tool-skill-detail-install` | 2026-09-03 | 2026-12-24 | C returned a `soroban` soft-empty and current `smart-contracts` detail. A/B confirmed the slug and files. |
| `q-tool-smart-wallet-repos-discovery` | 2026-09-03 | 2026-12-31 | C returned current passkey and smart-account rows. B confirmed active official repositories. |
| `q-pc-slp-0004-0006-status` | 2026-07-11 | 2027-01-07 | B confirmed SLP-0004 Final and SLP-0006 Draft. The question keeps its fixed historical date. |

Use this exact `truth.verified.by` value for each row:

> 2026-09-03 truth-maintenance golden health review; `.agents/rounds/2026-09-03-truth-maintenance/golden-sol.md`

Set each `truth.verified.date` to `2026-09-03`.
Use the table's evidence summary as the first evidence item.
Add a sibling-sweep evidence item for each affected consistency cluster.

### Skill-source drift found during the metadata refresh

`q-tool-skill-detail-install` remains correct.
Its required stale-version review exposed a source defect.

The current `smart-contracts` skill says it targets Protocol 27.
Its example still says Mainnet runs Protocol 26.
Mainnet runs Protocol 27 on 2026-09-03.

Propose `improvements/skills/sk-020-smart-contracts-mainnet-protocol-comment-stale.md`.
Do not change the golden answer for this upstream source defect.

## Consistency register

`npm run eval:qa:register -- --check` reported `up to date` before proposed edits.
The current hashes therefore match the unchanged corpus.

The SCF phase trigger has fired.
The current register now contains stale SCF facts.

After corpus edits, run:

```sh
npm run eval:qa:register -- --date 2026-09-03
```

This command must reopen every affected entry.
Then review each reopened entry before stamping it consistent.

Replace the `SCF Submission` invariant fields with:

```json
{
  "authoritativeValue": "SCF #46 Submission through 2026-11-08; #45 Panel Review; #44 last concluded",
  "rule": "As of 2026-09-03, SCF #46 is in Submission through 2026-11-08; #45 is in Panel Review; #44 is the last concluded round.",
  "acceptedSpellings": [
    "SCF #46",
    "Submission",
    "2026-11-08",
    "November 8, 2026",
    "Panel Review"
  ],
  "datePolicy": {
    "mode": "as-of",
    "asOf": "2026-09-03",
    "recheckOn": "next SCF round or phase change"
  }
}
```

Refresh its A and C evidence to 2026-09-03.
Keep both affected case IDs.
Generate the new member hashes with the helper.

Update `cluster-122` after the current-round edit.
Keep the fixed #43 result unchanged.
Replace its note with:

> SCF #43 keeps its fixed 29-project and $3,139,069 result. #44 is now last concluded. #45 is in Panel Review. #46 is current in Submission.

Re-sweep all clusters that own the four SCF cases.
The expected relevant clusters include `cluster-011`, `cluster-030`, `cluster-040`, and `cluster-081`.
They also include `cluster-085`, `cluster-089`, `cluster-121`, and `cluster-122`.

The register does not own the Saved Keypairs representation conflict.
Add a new cluster after the two Lab cases change.
Use these members:

```json
[
  "q-ti-secret-key-vs-mnemonic-derivation",
  "q-ti-stellar-lab-usage-and-new-ui"
]
```

Use this cluster claim:

> Saved Keypairs is Testnet/Futurenet browser storage. Current source and UI show plaintext JSON. Current official documentation still says obfuscated.

Set its verdict to `consistent` only after both cases encode the same conflict.

## Date-triggered traps

| Trap | Live check | Result | Proposed action |
|---|---|---|---|
| Mainnet Protocol 28 or AddressV2 successor | Horizon reports Protocol 27. It supports Protocol 28. | Not triggered | Refresh `lastChecked` to 2026-09-03 only. |
| Circle CCTP review date | The register records a full 2026-08-31 review. | No new trigger found | Keep open. |
| SCF #44/#45 state change | #46 opened. #45 moved to Panel Review. #44 ended. | Triggered | Rewrite the trap. |
| YieldBlox recheck | Scheduled for 2026-10-08. | Not due | Keep open. |
| Confidential Tokens Mainnet approval | Rechecked on 2026-09-02. No approval exists. | Not triggered | Keep open. |
| Meridian pre-event check | Scheduled for 2026-10-08. | Not due | Keep open. |
| Noether Mainnet opening | No recorded event triggered this review. | Not triggered | Keep open. |

Replace the SCF trap fields with:

```json
{
  "triggerDateEvent": "Publication or state change for SCF #46/#45/#44 after the fixed SCF #43 recap",
  "requiredRecheck": "Keep SCF #43's fixed result separate. Refresh current-round and open-RFP cases after each official phase change.",
  "disposition": "reviewed — as of 2026-09-03, #46 is in Submission through 2026-11-08, #45 is in Panel Review, #44 is last concluded, and #43 remains fixed historical truth.",
  "lastChecked": "2026-09-03",
  "verdict": "consistent"
}
```

Add `q-scf-open-rfps` and `q-scf-rfp-tooling` to the SCF trap.
Generate every member hash with the helper.

## Unresolved cases

### `q-ti-rpc-gettransactions-pagination-xdr`

The official page still calls the 200 cap hardcoded.
The current RPC source still exposes `max-transactions-limit` as a configuration key.
The source default remains 200.
The default page size remains 50.

Keep `truth.status: "disputed"`.
Keep the partial-credit canonical-page caution.
Do not reopen declined finding `sd-004` without new owner direction.

### `q-ti-stellar-lab-usage-and-new-ui`

The official page says Saved Keypairs are obfuscated.
The current source serializes raw secret-key objects directly.
The current UI calls the storage unencrypted and unprotected.

Set `truth.status: "disputed"`.
File a new improvement finding before changing the corpus.
Do not reuse resolved finding `sd-030`.

## Verification commands

These checks did not modify corpus files.

```text
npm run eval:qa:register -- --check
  [register-helper] up to date

npm run eval:qa:lint -- --stale --today 2026-09-03
  0 errors, 62 warnings
```

The stale lint does not fail cases due today.
It fails only dates before today.
The live review therefore found the SCF drift before the lint did.
