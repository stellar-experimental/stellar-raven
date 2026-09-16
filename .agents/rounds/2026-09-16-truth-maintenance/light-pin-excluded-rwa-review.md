# Light pin pairing: 1.9.52 with `/api/rwa` excluded

Reviewer: Grok high (Grok 4.6).
Clock: `2026-09-16T22:17:42Z`.
Mode: read-only. No pin edits, routing-gate edits, publication, or #141 close.

Pairing under review:

- Pin `3b587aa9f23d21fc572f6e93cb6d11031dbc24e6` / `sel:339145ff9f53`
- Policy: current `drift-combined-accepted` `EXCLUDED_SCOUT_OPS` **includes** `GET /api/rwa`
- Filter: shipped PR #165 (`bb37bc50`) whole-quote / exact-path scrub (`src/skills/scrub.ts` identical on `bb37bc50` and this candidate)

This is **not** authority to close #141, expose RWA, raise `acceptedTotals`, or accept routing.

User/root scope (2026-09-16): **Do not degrade live performance.** Keep `GET /api/rwa` **disabled**. Track mixed-intent and other residuals in existing Raven `.agents/TODO.md` plus issue **#141**. Do **not** file them as upstream Scout defects. Do **not** silently weaken routing gates. This pairing is the **only** Light-pin surface for the current review. Existing-operation routing still needs a later independent **no-meaningful-degradation** review after the NQG fix.

## Decision

**Accept this excluded-RWA pairing** of pin `3b587aa9` + PR165 scrub + `GET /api/rwa` on `EXCLUDED_SCOUT_OPS` against Scout **1.9.52** inventory (path present so the exclusion-presence guard can pass).

**Reject** serving the raw pin on 1.9.1 (RWA path absent; exclusion-presence would fail if `GET /api/rwa` is listed; PR165 alone leaves the RWA section).

**Reject** treating this as RWA catalog exposure or issue-#141 completion.

## Exact hashes

### Source bodies (unchanged from independent re-fetch)

| File | Blob | SHA-256 |
|---|---|---|
| new `SKILL.md` | `de459e784e9e927f42662aa53ab22c8dedab04b7` | `9f8a107a85b8796b18d6c7803cd14d9af16e66ff288726b551267bd66811b36c` |
| new `references/api-reference.md` | `5035cc98f1e0a7339ab9837e2dee19e7da0616cb` | `5e17ecaaa7f875f8d87170ba16a70c74c221a1dfc717f159e6594043ab7200cf` |

### Policy + scrub (this pairing)

| File | SHA-256 |
|---|---|
| `src/policy/scout-exposure.ts` (candidate, RWA excluded) | `dc9238321e396646a5080db5b86b622c82a79ecdcbac2375dc53672cfe29a6bb` |
| `src/skills/scrub.ts` (PR165; same as `bb37bc50`) | `08bc4ab367d8adc8cd4d2d2c2ee42fc2e398bf1136ef0c15d054f8ef4aaa3131` |
| `bb37bc50` `scout-exposure.ts` (no RWA exclude) | `eb84decf2852ae5c226303b19ac7d3cfea620f2377658d704e689c5a4cb47357` |

### Emitted scrubbed text

`scrubNonExposedRefs` from the candidate exposure+scrub modules, 2026-09-16T22:17:42Z:

| Body | In SHA-256 | Out SHA-256 | Bytes in→out |
|---|---|---|---|
| `SKILL.md` | `9f8a107a…` | `3284e340e66a2b1dbdc0d4902ee7208d970033863337e516f3cf00158859e386` | 34542→34229 chars |
| `api-reference.md` | `5e17ecaa…` | `d22b904b4da586ab4ea7289a92c85d8a5cf7ce9f43f36cd2256002c4946554ee` | 46705→40534 chars |

Copies: `/tmp/raven-execution-2026-09-16/light-pin-scrubbed-skill.md`, `light-pin-scrubbed-ref.md`.

## Scrub proof (emitted counts)

| Token | SKILL.md | api-reference.md |
|---|---:|---:|
| `/api/repos` bare (`(?![\\w/-])`) | 0 | 0 |
| “Two views of a repo” quote | 0 | 0 |
| `/api/rwa` / `getRwaAssets` | 0 / 0 | 0 / 0 |
| `/api/quality` | 0 | 0 |
| `/api/verify` | 0 | 0 |
| `/api/feedback` | 0 | 0 |
| `submit-listing` | 0 | 0 |
| `/api/repos/search` | 3 | 2 |
| `/api/repos/explain` | 0 | 3 |
| `/api/repos/trust` | 2 | 2 |
| `/api/partners` | 3 | 8 |
| `/api/rfps` | 9 | 4 |

Scrub succeeded (no fail-closed throw). Forbidden collection, RWA, quality, verify, and paid/write partner/feedback paths are gone. Neighbor search/explain/trust, partners, and RFPs remain.

`GET /api/rwa` is present in candidate inventory 1.9.52, so `assertScoutExclusionsResolve` can keep it in `EXCLUDED_SCOUT_OPS`. `/api/repos` stays in `SCOUT_PATHS_ABSENT_FROM_SPEC` (absent from 1.9.52 paths).

## Claims vs reviewed 1.9.52 (after scrub)

Surviving prose still matches the earlier content review:

- Open RFP `status=open` is a soliciting brief; live window is `meta.scfRound`.
- `repoScore` is code evidence; funding is not a gate.
- Hackathon `totalSubmissions` / `outcomes` `null` ≠ 0.
- Partners: `type` includes `asset-issuer`; `accepting` is `1` or `0`.

The RWA `state=` section is **removed** in this pairing, which is required while the op stays excluded. Do not teach `getRwaAssets` from skill.read.

## Scope limits

- Does not close GitHub #141. Residuals stay in Raven TODO and the #141 record.
- Does not accept routing or numeric gates. Existing-op routing waits for a post-NQG no-degradation review.
- Does not accept serving this pin on 1.9.1 (RWA path missing).
- Does not change original check-8 / exposure scope: RWA stays excluded.
- Does not relabel Raven routing residuals as Scout upstream bugs.
