# Lane 3 draft re-verification

**Verdict: CHANGES-REQUESTED**

## Scope

I reread all 397 draft lines. I checked each prior finding against the revised text.

I also checked the proposed mechanics against the current catalog, tool schemas, bindings, and refresh workflow.

## Prior findings 1–9

| Prior finding | Status | Re-verification result |
| --- | --- | --- |
| 1. Query and index path | Addressed | Draft lines 98–111 define one explicit query for every projection. Lines 196–225 define one shared index. |
| 2. Pointer budgets | Addressed | Lines 141–151 define separate pointer caps and a worst-case 50-hit measurement. Lines 184–189 protect the source-basis budget. |
| 3. General utility | Partial | Lines 258–278 remove the battery-derived proof. Lines 360–369 add an independent evaluation. The gate still lacks a minimum utility target. See R3. |
| 4. Disagreement inference | Addressed | Lines 85–86 and 190–194 report matched roles only. The host makes no agreement claim. |
| 5. ADR-0003 doctrine | Partial | Lines 75–87 fix the capability, secret, envelope, and runtime-scrub claims. The mutable index and build flag remain incomplete. See R2 and R4. |
| 6. Scoring and gates | Partial | Lines 227–256 give one formula and separate the routing gate. The role factor uses fields that do not exist. See R1 and R3. |
| 7. Alternatives matrix | Addressed | Lines 280–290 fix the model boundary, Git time, and license claims. The matrix now states uncertainty honestly. |
| 8. `extendTo` classification | Addressed | Lines 54–58 classify the miss as `ANSWER-FAIL`, `EXPOSED`, and `output-contract`. They call pointer benefit unproven. |
| 9. Sizing | Addressed | Lines 347–372 now size the program as Large. The phases include storage, adapters, schemas, telemetry, tests, and measurements. |

## Residual findings

### R1 — High — The role-fit factor cannot use the current manifest

Draft line 241 maps `retrievalProfile.lane` to `source-code`, protocol, and docs lanes.

The current lanes are `exact`, `directory`, `detail`, `semantic`, `research`, `av`, and `corpus`.
See `src/catalog/types.ts:110`.

`source-code` is a retrieval relation, not a lane. See `src/catalog/types.ts:112–120`.

The current manifest has no protocol or docs lane. Its 19 skill entries also lack `retrievalProfile`.

Therefore, 20 percent of the score lacks a defined input for many search hits.
The draft also lacks an exact pointer eligibility rule for each hit.

Required change:

- Map roles from actual, validated manifest fields.
- Define the default for skills and entries without retrieval metadata.
- Define pointer eligibility for a hit before scoring its eligible pointers.

### R2 — High — The runtime index is not bound to the reviewed deployment

Draft lines 198–219 place the locator index in a mutable R2 object or KV value.
They only define behavior for a missing or unparseable object.

The draft does not define schema validation, a content digest, or a versioned object key.
It does not bind the loaded index to the deployed manifest or build version.

The current catalog rejects malformed data through `refinedCatalogSchema.parse`.
See `src/catalog/search.ts:314–322`.

The current builder also verifies SHA-256 values before it trusts generated provenance.
See `scripts/build-catalog.mjs:255–265`.

The present refresh workflow is detection-only and has no storage write permission.
See `.github/workflows/refresh.yml:1–36`.

The present Worker has no locator binding. See `wrangler.jsonc:46–63`.
The phase sizing acknowledges this binding, but it does not define deployment consistency.

A stale or mismatched object can change repositories, roles, and pointers without a matching deployment.

Required change:

- Define a schema version and validate the complete index before memoization.
- Put the index under a versioned object key.
- Bind its SHA-256 and allowlist digest to a reviewed generated descriptor.
- Reject a manifest, builder, allowlist, or digest mismatch.
- Define the upload order and the cache refresh policy.

### R3 — Medium — The frozen evaluation has no minimum utility target

Draft lines 251–253 and 363–369 set floors from the first measurement.
Phase 1 only has to preserve those floors.

This process can preserve a poor initial result. It cannot prove general utility before shipment.

Required change:

- Set minimum positive-case and negative-query targets before the first implementation result.
- Include top-result file accuracy and false-positive limits.
- Keep a separate development set for formula changes.
- Keep the frozen evaluation as the untouched final gate.

### R4 — Medium — The build flag does not control every exposed shape

Draft line 87 says the build flag makes the operation and attachments disappear.
Lines 342–343 ask the owner to confirm this behavior.

The current search output schema is static. See `src/mcp/tools.ts:186–220`.
A `build-catalog.mjs` input cannot remove fields from that schema by itself.

The flag must also control the top-level schema, sandbox projection, server text, and source-basis code.
Without one shared mechanism, the disabled build can still advertise source fields.

Required change:

- Define one generated build constant for every affected surface.
- Add a test that compares the manifest, tool schema, sandbox projection, and server text.
- Alternatively, remove the flag and ship each completed phase forward-only.

## Non-blocking owner question

Draft lines 215–217 define an unscored fallback pointer.
However, `SourcePointer.score` is required at line 136.

Lines 334–336 correctly ask whether the owner wants this fallback.
If selected, the draft must define a separate fallback type or a valid score rule.

## Verification notes

I used read-only checks with `nl`, `rg`, and `jq`.
I ran no tests because this task reviews a design draft only.
I changed no repository file.
