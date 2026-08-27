# Lane 3 last check

**Verdict: APPROVE-DRAFT**

## Scope

I reread all 455 draft lines. I checked only score ownership and the phase-to-surface contract.

## Results

### Score ownership — closed

Draft lines 254–271 define one query-global score. The formula now depends only on the query and pointer.

Lines 262–267 place all score factors in one valid table. Their weights total 1.0.

Lines 269–295 make authority role a separate hit eligibility filter. A hit cannot change the pointer's score.

The draft no longer uses `buildAuthorityRoles` for pointer applicability. This matches `src/catalog/types.ts:175–179`.

Lines 287–288 define the safe default for skills. Skills without `sourceRoles` accept every query-matched table pointer.

Lines 396–398 make `sourceRoles` an explicit owner choice. Phase 2 uses it only after owner approval.

I found no hidden score owner or conflicting role weight.

### Atomic surface and phases — closed

Draft line 87 defines two independent complete surfaces. The attachment surface requires the locate surface.

Lines 411–412 align the shipping phases with those two surfaces. Each phase has its own consistency test.

Phase 1 can ship without attachment fields. Phase 2 adds every attachment field and projection together.

I found no flag, partial advertisement, or conflict between the surface contract and phase sequence.

## Verification

I used read-only checks with `nl`, `rg`, and `jq`.
I ran no tests because this task reviews a design draft only.
I found no new contradiction within the narrow scope.
