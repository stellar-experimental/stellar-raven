---
id: sd-084
service: stellar-docs
status: verified
discovered: 2026-11-02
upstreamTitle: Correct strict-send destination descriptions in the Horizon OpenAPI source
evidence:
  - "Current upstream owner: stellar/stellar-docs, main commit 85d2d1b8e7a4451b7a6af0931f587ce73109b816. Canonical edit source: openapi/horizon/components/parameters.yml, description lines 181 and 213."
  - "DestinationAccountParam and DestinationAssetsParam have correct names, but their descriptions incorrectly require source_account or source_assets for strict-send. Source SHA-256: 9b1f9b63f2d4ab85654852823bef35158166710a0b152b093013d0a55e0ce4c9."
  - "The page wrapper selects openapi/horizon/bundled.yml GET /paths/strict-send. The repository README identifies components as the editing source. redocly.yaml and package.json define local bundling."
  - "Fresh public GET of the deployed strict-send page reproduces both descriptions. Deployed body SHA-256: 2da3693f8dda68ccb5f5641c6af3e2b436af0fcd8daca679b7a7a9471fc25f88."
  - "Fresh public Horizon GET with destination_assets returns HTTP 200 and path records. Replacing that selector with source_assets returns HTTP 400 for a missing destination selector."
  - "Safe public request receipts, exact timestamps, small query descriptors, validation details, and body hashes: research/audits/2026-11-02-golden-overnight/horizon-strict-send-receipts.json. No full response bodies are retained."
  - "Dedupe covered active findings and resolved.json in MAIN and the method worktree before creation. No strict-send destination-description finding appeared."
---

## Finding

The Horizon strict-send destination parameter descriptions name the wrong alternative parameters.
`DestinationAccountParam` correctly defines `destination_account`, and `DestinationAssetsParam` correctly defines `destination_assets`.
Both descriptions instead tell readers to provide `source_account` or `source_assets` for strict-send requests.
The endpoint introduction and parameter references correctly use the destination selectors.

Following the incorrect descriptions can produce a rejected pathfinding request.
This is a `docs-content` defect in documentation-owned OpenAPI descriptions.
The parameter names, runtime contract, and endpoint implementation remain correct.

## Evidence

### Canonical source and generation owner

The current source owner is **`stellar/stellar-docs`**.
The observed upstream main commit is `85d2d1b8e7a4451b7a6af0931f587ce73109b816`.
The source chain is explicit at that commit:

1. [The page wrapper](https://github.com/stellar/stellar-docs/blob/85d2d1b8e7a4451b7a6af0931f587ce73109b816/docs/data/apis/horizon/api-reference/list-strict-send-payment-paths.mdx) selects `openapi/horizon/bundled.yml GET /paths/strict-send`.
2. [The endpoint component](https://github.com/stellar/stellar-docs/blob/85d2d1b8e7a4451b7a6af0931f587ce73109b816/openapi/horizon/components/endpoints/paths.yml#L86) references both destination parameter components.
3. [The parameter source](https://github.com/stellar/stellar-docs/blob/85d2d1b8e7a4451b7a6af0931f587ce73109b816/openapi/horizon/components/parameters.yml#L177) contains the incorrect descriptions at lines `181` and `213`.
4. [The OpenAPI README](https://github.com/stellar/stellar-docs/blob/85d2d1b8e7a4451b7a6af0931f587ce73109b816/openapi/horizon/README.md) directs contributors to edit components and regenerate the bundle.
5. [The Redocly configuration](https://github.com/stellar/stellar-docs/blob/85d2d1b8e7a4451b7a6af0931f587ce73109b816/redocly.yaml) selects `openapi/horizon/main.yml` as the Horizon root.
6. [The package script](https://github.com/stellar/stellar-docs/blob/85d2d1b8e7a4451b7a6af0931f587ce73109b816/package.json) runs `redocly bundle horizon --output openapi/horizon/bundled.yml`.

The editing source therefore belongs to the Docs repository, rather than an inferred external API-spec generator.
The generated bundle contains the same two incorrect sentences.
The live [strict-send page](https://developers.stellar.org/docs/data/apis/horizon/api-reference/list-strict-send-payment-paths.md) reproduces both after whitespace normalization.
The retained receipts record the exact sentence once and identify both affected component locations.
This record does not claim when the error first appeared.

### Runtime contract check

The valid read-only query supplies:

```text
GET https://horizon.stellar.org/paths/strict-send
source_asset_type=native
source_amount=1
destination_assets=USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN
```

It returns HTTP `200`, with path records that preserve the requested source amount.
A second query keeps `source_asset_type` and `source_amount`, but supplies `source_assets=native` without a destination selector.
That request returns HTTP `400` and identifies the missing destination asset list or destination account.
The response also states that both destination selector fields cannot be present together.
These checks use public asset identity, rather than private wallet balances.
They execute no payment, transaction, or bridge.

| Observation | Exact response-body SHA-256 |
| --- | --- |
| Valid destination selector, HTTP `200` | `3771f3fff0a558a2ba730c0e2d040e234d2998d5af6f9070c8e05d343ca860d9` |
| Incorrect source alternative, HTTP `400` | `8e856959ebdf4d4eb62384af5df146ecb2ec5e6a81ed18a447d54434aadc6fb1` |

[The safe evidence receipt](../../research/audits/2026-11-02-golden-overnight/horizon-strict-send-receipts.json) records exact URLs, timestamps, request hashes, and response hashes.
It retains field names and validation metadata, rather than complete third-party bodies or returned prices.
The reviewed QA answer selected the correct parameters and retains its original `correct` grade.
Method `7` remains invalid; this finding makes no aggregate QA claim.

## Recommendation

Edit only `DestinationAccountParam.description` and `DestinationAssetsParam.description` in `openapi/horizon/components/parameters.yml`.
Replace the incorrect source alternatives with `destination_account` and `destination_assets`.
Explain that strict-send requires exactly one destination selector.
Keep all parameter names, references, `required` flags, source-amount fields, and runtime behavior unchanged.
Preserve the correct source-selector descriptions for strict-receive.

Run the upstream repository's existing `pnpm bundle-horizon` script and retain its generated bundle update.
Do not repair the generated bundle by hand.
Recheck the rendered strict-send descriptions against the endpoint introduction and both public GET outcomes.
