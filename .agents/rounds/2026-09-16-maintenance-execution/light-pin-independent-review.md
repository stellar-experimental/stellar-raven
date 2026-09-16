# Independent Light skill-pin content review (`d25b9f6b` → `3b587aa9`)

Reviewer: Grok high (Grok 4.6). Distinct from the pin author and Astra coordinator.
Clock: `2026-09-16T20:50:21Z`.
Mode: source-content review. No pin attestation. No gate or count metadata updates.
No candidate-code edits. No paid operations.

Issue: #141. Trigger: `.agents/rounds/2026-09-16-maintenance-execution/light-pin-impact.md`.
Bodies: `/tmp/raven-execution-2026-09-16/light-pin-review/`.
Filter under test: commit `e1ea4ab` (`SCOUT_PATHS_ABSENT_FROM_SPEC=/api/repos`).

## Verdict

**Do not attest this pin.** Combined Scout routing has not passed all eleven acceptance checks. This review does not ship `3b587aa9` and does not expose `GET /api/rwa`.

The two body diffs are internally coherent against **Scout 1.9.52**. Several claims are **not** callable on accepted **Scout 1.9.1**. Filter `e1ea4ab` correctly drops the unlisted `/api/repos` quotation and keeps `/api/repos/search` and `/api/repos/explain`. It does **not** drop the new `GET /api/rwa` section, because that path is not in the exclusion set.

Serving these bodies on current 1.9.1 catalog would advertise an unexposed RWA operation. That is an ADR-0003 leak unless RWA is excluded on a 1.9.52 inventory (presence guard) or added to the absent-from-spec set (only valid while the path is missing).

## Exact hashes (independent re-fetch)

Fetched 2026-09-16 from `raw.githubusercontent.com`. Local files match fetch bytes. Git blobs match parent `sources.json` and the impact table.

| Label | Path | Commit | Blob | SHA-256 | Bytes |
|---|---|---|---|---|---|
| old | `SKILL.md` | `d25b9f6bd842159b5a33aa6125ecb62373c2d8b5` | `54f214d228b665bd1f0579ed79dd39226dd9621e` | `fa73296b22afcf5398f0a94775c2609df43ab0f1aff15e729b923e61caa3669a` | 34617 |
| new | `SKILL.md` | `3b587aa9f23d21fc572f6e93cb6d11031dbc24e6` | `de459e784e9e927f42662aa53ab22c8dedab04b7` | `9f8a107a85b8796b18d6c7803cd14d9af16e66ff288726b551267bd66811b36c` | 34902 |
| old | `references/api-reference.md` | `d25b9f6b…` | `14f9c9c817ff853089e42333e35a7d60ca7a258a` | `9221a08fec8bcb4a7c417025b3b5f46bab1a5093b1fee228604b678aa2ea8359` | 44611 |
| new | `references/api-reference.md` | `3b587aa9…` | `5035cc98f1e0a7339ab9837e2dee19e7da0616cb` | `5e17ecaaa7f875f8d87170ba16a70c74c221a1dfc717f159e6594043ab7200cf` | 47120 |

## Changed source claims versus OpenAPI

Compared accepted inventory **1.9.1** (primary `cd87615f` tree) and candidate inventory **1.9.52** (`/tmp/raven-execution-2026-09-16/drift`, fetched `2026-09-16T18:10:53.396Z`).

| Claim in new bodies | 1.9.52 | 1.9.1 | Content verdict |
|---|---|---|---|
| Open RFP (`status=open`) is a soliciting brief; live SCF window is `meta.scfRound`, not implied by brief status | Compatible with existing `GET /api/rfps` `status=open\|closed`. Window metadata is skill/runtime, not a new path. | Same path exists | Acceptable **wording**. Aligns with `q-scf-open-rfps-live`. |
| `repoScore` is code evidence (tests, CI, releases, SDK) plus adoption/corroboration; funding is an input, not a gate | Scoring formula is not an OpenAPI enum | Same | Acceptable **prose**. No golden pins the old funding-authority formula. |
| Hackathon `totalSubmissions` / `outcomes` are `null` when no submission records exist; `null` ≠ 0 | Detail schema is not fully re-derived here; claim is a read rule | Path exists | Acceptable **read rule**. Matches `q-scf-hackathon-compare-live` key fact “Treats null as unknown rather than zero.” |
| `GET /api/partners` `type=asset-issuer` | Enum includes `asset-issuer` | Enum **omits** it | Callable only after 1.9.52 absorb |
| `accepting=0` (not-accepting) | Enum `['1','0']` | Enum `['1']` only | Callable only after 1.9.52 absorb |
| `GET /api/rwa` and `state={live\|issued-single-holder\|deployed-no-supply\|not-found}` | Path present; request enum matches those four values; `kind` classic/soroban; `level` five values as written | Path **absent** | Schema match on 1.9.52. **Not** on 1.9.1. Ledger already records those four states. |
| `/api/repos` stored-row collection vs `/api/repos/search` curated view; resolution facts on both | `/api/repos` **absent** from both OpenAPIs. Children `search`/`explain`/`trust` present. | Same | Collection path is **not** a Raven surface. Filter must keep hiding it. |
| Search `activity={active\|dormant\|archived\|unknown}` | Schema also includes `maintained` | Same extra `maintained` | Minor omission, not a false enum. Not a golden change. |

Paid Lumenloop research ops are not in this skill. `GET /api/quality`, `GET /api/verify`, and `POST /api/feedback` remain in the upstream reference and remain **excluded**. Filter `e1ea4ab` still strips quality, verify, and feedback from both new bodies.

## Approved filter `e1ea4ab` on these bodies

Applied `scrubNonExposedRefs` from the `e1ea4ab` tree to the new files (read-only):

| File | Result |
|---|---|
| new `SKILL.md` | Succeeds. Bare `/api/repos` count 0. `/api/repos/search` kept. `/api/quality`, `/api/verify`, `/api/feedback` stripped. No `/api/rwa` in this file. |
| new `references/api-reference.md` | Succeeds. Blockquote “Two views… `/api/repos` is the stored row” **removed**. `/api/repos/search`, `explain`, `trust` headings kept. quality/verify/feedback stripped. **`GET /api/rwa` section remains.** |

Exact-path matching works as approved: children are not treated as the collection.

Unresolved: RWA section survives because `/api/rwa` is neither an excluded present op on 1.9.1 nor in `SCOUT_PATHS_ABSENT_FROM_SPEC`. Pinning these bytes on current main would teach `GET /api/rwa` without a catalog op.

On a 1.9.52 inventory, `GET /api/rwa` can enter `EXCLUDED_SCOUT_OPS` (presence guard would pass). Then the scrub would drop that section until routing accepts exposure. That pairing is a **later** combined change, not this pin alone.

## Golden impact

`golden-truth` is not required. No gospel edit.

- `q-scf-open-rfps-live` already requires distinguishing open briefs from a confirmed SCF submission window and `meta.scfRound`. New SKILL.md matches that. Do not weaken. Do not renew `asOf` from this pin.
- `q-scf-hackathon-compare-live` already requires null ≠ zero on submissions/winners. New api-reference matches that. Do not weaken.
- No active golden names `scout.getRwaAssets` (ledger). Adding RWA skill text does not by itself force a golden change. A future exposed RWA op would need new or updated goldens under `golden-truth`, not this review.

## Parent free RWA state probes (ledger)

`.agents/rounds/2026-09-16-truth-maintenance/drift.md` records live OpenAPI 1.9.52 request/response enums `live`, `issued-single-holder`, `deployed-no-supply`, `not-found`. The new api-reference `state=` list matches those four. The same ledger still shows unrelated `getRwaAssets` captures (issuance, WASM, SAC balances, holdout metadata). That is routing, not a reason to attest this pin.

## Acceptable content (when runtime deps are satisfied)

These wording changes are fit to serve **after** 1.9.52 absorb + RWA exposure-or-exclude + `/api/repos` filter:

- RFP brief vs SCF submission window
- `repoScore` as code/corroboration, funding not a gate
- Hackathon `null` submission totals
- `asset-issuer` and `accepting=0` as 1.9.52 partner filters
- RWA states/levels/kinds **if** the op is accepted or the section is scrubbed

## Explicit unresolved runtime dependencies

1. **Combined routing must pass all 11 checks** before pin attestation or gate/count edits. This review does not start that work.
2. **`GET /api/rwa` exposure** is a separate policy. Keep it unaccepted. Do not put it in the 1.9.1 catalog.
3. **Skill-body leak:** new api-reference documents RWA. Filter `e1ea4ab` does not remove it. Pinning on 1.9.1 leaks a non-manifest path. On 1.9.52, exclude the op (or expose it after check 11) in the same change as the pin.
4. **`/api/repos` collection** remains absent from both OpenAPIs. Keep `SCOUT_PATHS_ABSENT_FROM_SPEC`. Do not invent `listRepos`.
5. **`type=asset-issuer` and `accepting=0`** need 1.9.52 parameters. They 400 on 1.9.1.
6. **Quality, verify, paid feedback** stay excluded. Filter still strips them. Do not relax that.
7. **Runner intersection** is empty (digest runner is Lumenloop-only). No runner re-smoke from this pin.
8. **`sel:` attestation** is not written. `check-pin-review` should keep failing until a later combined review records `stellar-light 3b587aa9 sel:339145ff9f53` after routing passes.

This is not pin acceptance.
