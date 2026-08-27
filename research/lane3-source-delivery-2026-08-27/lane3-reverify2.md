# Lane 3 final re-verification

**Verdict: CHANGES-REQUESTED**

## Scope

I reread all 450 draft lines. I checked R1–R4 against the revised text and current catalog contracts.

## R1–R4 status

| Residual | Status | Result |
| --- | --- | --- |
| R1. Role-fit scoring | Open | The draft uses real fields, but the score and eligibility rules conflict. The skill metadata also has incompatible semantics. |
| R2. Runtime index binding | Closed | Lines 209–235 define a descriptor, content-addressed key, digest checks, upload order, validation, and cache policy. Lines 236–238 remove fallback pointers. |
| R3. Utility gate | Closed | Lines 293–300 set minimum targets before measurement. Lines 413–422 define an independent holdout and a separate development set. |
| R4. Surface control | Open | Line 87 requires one atomic surface. Lines 405–407 split that surface across two shipping phases. Owner question 11 does not remove this conflict. |

## Residual findings

### 1. High — R1 still has no coherent score owner

`SourcePointer` has one response-level `score`. See draft lines 118–138.

However, line 262 makes `R` depend on each search hit. One pointer can serve several hits with different preferences.

The draft does not define which hit owns the pointer's single score. It also defines no aggregation rule.

Lines 278–283 exclude every role mismatch from `sourceIds`. Therefore, every attached pointer has `R = 1.0`.

The `unrelated 0.5` value cannot affect attachment ranking. The no-preference path also sets `R = 1.0`.

Line 272 also uses `buildAuthorityRoles` to decide repository-pointer applicability.

The current field contract forbids that meaning. It says this metadata never claims that a returned repository applies.
See `src/catalog/types.ts:175–179`.

The same row includes `skill-section`. Current validation permits `buildAuthorityRoles` only on whole-skill entries.
See `src/catalog/search.ts:256–260`.

Required change:

- Remove `R` from the query-global pointer score and keep a separate eligibility rule.
- Otherwise, put the score on each hit-to-pointer link and define response-table ordering separately.
- Do not reuse `buildAuthorityRoles` for pointer applicability.
- Add dedicated manifest metadata if skill-to-pointer roles need a reviewed contract.
- Move the `F` and `P` rows at lines 284–285 back into the scoring table.

This issue is not an owner question. The draft commits to conflicting mechanics.

### 2. High — R4 conflicts with the shipping sequence

Line 87 says all source surfaces appear together when `sources.locate` lands.

The proposed test requires the manifest, search schema, sandbox projection, and instructions together.

Phase 1 ships `sources.locate` at lines 405–406. Phase 2 adds search attachments and source-basis output at line 407.

The Phase 1 state must fail the line 87 consistency test. Therefore, the two-phase sequence cannot implement the stated contract.

Owner question 11 presents two models. However, line 87 and the phase table already select incompatible models.

Required change:

- Merge locate and attachments into one shipping phase under the line 87 contract.
- Otherwise, define the Phase 1 surface as a valid complete surface.
- In that model, test locator consistency separately from later attachment consistency.
- If the owner must choose, remove both hidden selections and mark the phase sequence pending that answer.

## Verification

I used read-only checks with `nl`, `rg`, and `jq`.
I ran no tests because this task reviews a design draft only.
I changed no repository file.
