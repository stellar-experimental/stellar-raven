# Independent Scout 1.9.30 drift review

Date: 2026-09-04
Lane: Sol high
Reviewed commit: `3fed7cf9e5cd1447d5595630d5f5a5632198f9ed`
Scope: free and read-only review. No paid call ran.

## Verdict

**CORRECTIONS REQUIRED**

Keep the Scout 1.9.30 reject decision.
Do not ship this generated surface or change `eval/gates.json`.

The commit correctly restores the accepted generated files.
Its hashes and reported headline routing values are reproducible.
Its protocol-history result also expires before scoring.

However, the active-findings section materially misstates live deployment data.
It checks the absent plural `deployments` field.
It does not report the populated singular `deployment` object.

The report also understates direct schema changes by one operation.
It omits material movement in the extended and skills routing lanes.

## Exact required corrections

### 1. Replace the active-findings introduction

Replace the no-resolution statement with this text:

> The live schema partially improves deployment qualifiers.
> It does not resolve the recorded product-level and per-network evidence gaps.
> The singular `deployment` object differs from the absent plural `deployments` field.

### 2. Replace the `sls-023` statement

Use these facts:

- The RWA query returned 61 rows.
- All 61 rows included a singular `deployment` object.
- Fourteen objects reported `mainnet` with `onchain-activity`.
- Forty-seven objects reported `unknown` with a null basis.
- No row included a plural `deployments` key.
- One row had a nonempty `products` array.
- DTCC supplied that announced product record.
- DTCC remained `Development` with an operator-announcement source.
- DTCC's singular deployment remained `unknown`.

Do not say that DTCC has "no deployment."
Say that Scout has no verified DTCC deployment.
Also record its announced H1 2027 product separately.

This is a partial upstream fix for `sls-023`.
It does not resolve product identity, source coverage, or deployment verification.

### 3. Replace the `sls-024` statement

Slender, Laina, K2 Lend, and OrbitCDP each returned a singular deployment object.
Each object reported `network: "unknown"` with a null basis.
Each project had a null `products` value.
K2 Lend also retained a null `supportedNetworks` value.

Do not describe these rows as having zero deployments.
That wording hides the singular object and its explicit unknown state.
The `sls-024` deployment-scope residual still reproduces.

### 4. Replace the `sls-029` statement

The four oracle rows omitted `oracleDeployments` and plural `deployments`.
They returned these singular deployment values:

| Project | Network | Basis |
| --- | --- | --- |
| Band | `mainnet` | `onchain-activity` |
| DIA | `testnet` | `human-verified` |
| Redstone Finance | `mainnet` | `human-verified` |
| Lightecho | `mainnet` | `onchain-activity` |

Lightecho retained one product record.
The other three rows had null products.

This is a partial project-level improvement.
It does not provide the requested per-product oracle contract and feed evidence.
The `sls-029` residual therefore remains open.

### 5. Clarify the `sls-033` statement

The exact wallet query returned 71 rows.
Sixty-two rows had a non-null `productKind`.
Thirty-three rows had a nonempty `availability` value.

All 71 rows included `canonicalSlug`.
All 71 values were null.
Use "no row had a non-null `canonicalSlug` value."

MXlet retained null `productKind`, `availability`, and `canonicalSlug` values.
Its singular deployment object reported `unknown`.
The `sls-033` residual still reproduces.

### 6. Correct the direct-schema count

The 1.9.1 to 1.9.30 comparison has 22 direct parameter or response-schema changes.
The Terra report states 21.

The other classification counts are correct:

- 36 paths and 37 upstream operations in each source;
- no added, removed, or renamed operation;
- 27 changed full operation objects;
- 15 changed `x-routing` blocks; and
- six changed shared schemas.

### 7. Add the omitted routing movements

The reported legacy Scout and overall percentages are correct.
The report must also show these diagnostic movements:

| Lane | Accepted 1.9.1 | Candidate 1.9.30 |
| --- | --- | --- |
| Legacy Scout top-1/top-3/top-5 | 52.6/84.2/94.7 | 53.7/87.4/95.8 |
| Legacy overall top-1/top-3/top-5 | 63.0/82.5/92.3 | 62.7/82.5/92.3 |
| Extended overall top-1/top-3/top-5 | 73.8/90.2/95.1 | 73.8/89.3/93.4 |
| Skills top-1/top-3/top-5 | 69.6/100.0/100.0 | 69.6/95.7/100.0 |
| Holdout overall top-1/top-3/top-5 | 20.4/44.9/53.1 | 22.4/46.9/55.1 |

Holdout forbidden captures changed from 11 to 10.
The candidate met the configured numeric floors.
The gate failed because the candidate manifest lacks an accepted fingerprint.

State that distinction directly.
A fingerprint mismatch proves a source change.
It does not independently prove a numeric routing regression.

### 8. Keep the reject decision, but correct its basis

The reject decision remains correct for this review.
The candidate is mixed routing and response-contract drift.
It is not a mechanical catalog bump.

The full routing movement lacks an accepted intent decision.
The source-epoch-bound v2 diagnostic is unavailable.
The live deployment response also needs a correct impact reconciliation.

These limits block a safe baseline change now.
The absent plural `deployments` field does not support the rejection.

## Independent hash verification

The accepted file hashes match the report:

| File or source | SHA-256 |
| --- | --- |
| Accepted `inventory/stellar-light.json` | `1a261c4a2e2172683e91a52ddc33b02ff41e74760c861dfacb29c60a8d8671b0` |
| Accepted sorted OpenAPI | `cce1091864cd41dee739f6b7b590b3c0a10b25b6bab76b9b69175f01efd753d4` |
| Retained 1.9.23 inventory | `1bfe9d6ada6518d834a3893bb9df039ed77e1a16499897af6bdcbed878c0fc4f` |
| Retained 1.9.23 sorted OpenAPI | `662a54f11b0ed1b027722d74fdc92b960cf5a7d7e975cc1fb1c273031a8d2320` |
| Current accepted manifest | `b613201846076e9fbaa70edfee4f506841c7cf690265e69c8d07afde567f6729` |

I reconstructed the report's exact 1.9.30 inventory timestamp in an isolated temporary copy.
Its inventory hash was `0cbc081a11c3bf27000952cf97cf8cc03b1429d59dd05834cde5ad628b144d45`.
Its generated manifest hash was `b942dbab5cf5aa624cd8e461f0c1dbe08d279e43d51b926f51fece6aa48451a9`.

The current live OpenAPI still reports version 1.9.30.
It has 36 paths and 37 operations.
Its sorted OpenAPI hash is `2acc43c45eab21156a61d242c0d35b82ec7f9894854a01a88426e310b0311571`.

## Accepted-file restoration

Commit `3fed7cf` changes only the Terra report.
The five generated files match parent commit `898063e` byte-for-byte.

The checked files were:

- `inventory/stellar-light.json`;
- `catalog/manifest.json`;
- `src/mcp/micro-map.ts`;
- `specs/super-spec.json`; and
- `eval/plan/op-classes.json`.

The accepted inventory remains Scout 1.9.1.
The accepted manifest contains 30 exposed Scout operations.
All seven existing Scout exclusions remain unchanged.
No Scout operation intersects the bundled Lumenloop runner.

## Protocol-history expiry

Both v2 contracts expect this frozen manifest hash:

`4cd28f4bdfe8c73950e0a6d4dfa1a09dd2f82674859e93990fdd62daef24fe8b`

The restored accepted manifest has this different hash:

`b613201846076e9fbaa70edfee4f506841c7cf690265e69c8d07afde567f6729`

The target scoring and routing hashes still match their frozen values.
Only `manifest-sha256` caused expiry.

The evaluator returned `measurementStatus: "source-expired"` for both contracts.
It emitted no scored sets.
No protocol-history question was scored.

Keep the source epoch strict.
Do not repin it for Scout 1.9.30 in this change.

## Free gate results

| Command | Result |
| --- | --- |
| `npm run eval:selftest` | PASS |
| `npm run eval:compile` | PASS, 338 legacy and 122 extended cases |
| `npm run eval:routing -- --gate` | PASS on restored accepted files |
| `npm run eval:protocol-history` | Expected exit 1, both contracts source-expired |
| `npm run improvements:lint` | PASS, 70 findings |

The isolated candidate rerun reproduced the reported manifest fingerprint failure.
It also reproduced the candidate routing values shown above.

## Final disposition

Return the generated Scout files to no change.
Keep the accepted Scout 1.9.1 surface.
Correct the Terra report before using it as the final drift record.

**CORRECTIONS REQUIRED**
