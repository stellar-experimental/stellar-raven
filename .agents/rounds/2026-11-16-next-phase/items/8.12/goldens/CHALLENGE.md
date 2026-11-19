# Item 8.12 (`goldens`) — Challenge of Codex Sol review

Reviewer: OpenAI Codex `v0.169.0`, resolved model `gpt-6.2-sol` (`node scripts/latest-model.mjs sol`), `model_reasoning_effort="high"`, `-s read-only`.
Review file: `.agents/rounds/2026-11-16-next-phase/items/8.12/goldens/SOL-REVIEW.md`.
Challenger: Gemini 4 Neon (Antigravity).
Date: 2026-11-19 UTC.

## Summary counts

| Verdict | Count | Findings |
|---|---|---|
| **valid** | 2 | Finding 2, Finding 3 |
| **invalid** | 1 | Finding 1 |
| **valid but not worth fixing** | 1 | Finding 4 |

Note: Sol's headline verdict independently confirmed that judge-facing fields in `q-tool-freighter-wallet` and `q-tool-wallets-comparison` should stay unchanged, found no Maintenance Exception Records violation, and independently confirmed the `0.2/EXEC.md:155` vs `0.2/REPORT.md:72` provenance gap.

## Finding-by-finding challenge

### Finding 1 (Sol: Medium) — Refresh `truth.asOf` and `truth.reverifyBy` in both scheduled cases

- **Sol's claim (`SOL-REVIEW.md:5`):** Because `VERIFICATION.md:43` and `:49` document a 2026-11-19 check of two scheduled cases, leaving `truth.asOf` (`2026-11-14`) and `truth.reverifyBy` (`2027-02-09`, `2027-05-14`) unchanged violates `.agents/skills/golden-truth/SKILL.md:110-115` and leaves freshness tooling on the old cycle.
- **Verdict:** **invalid**
- **Evidence:**
  1. **Lane and TODO contracts explicitly make "confirmed unchanged" a valid terminal state:** `/home/tyler/code/raven-wt/orch/8.12-LANES.md:13` ("Each case ends edited through `golden-truth` or confirmed unchanged") and `.agents/TODO.md:244` ("Done when: each case is edited through `golden-truth` or confirmed unchanged"). Requiring an in-file metadata bump on every unchanged confirmation would make "confirmed unchanged" impossible.
  2. **Maintenance Exception scope (`eval/qa/README.md:255`):** "It changes only what the trigger made stale, through `golden-truth` and its independent re-derivation." Neither trigger (2026-11-16 Docs retitle; Scout 1.9.150 SDK-status fields) made `truth.asOf` (`2026-11-14`, five days old) or `truth.reverifyBy` (`2027-02-09`, `2027-05-14`) stale.
  3. **Freshness tooling has no failure or gap:** `eval/qa/lint-corpus.mjs:669-671` checks only `truth.reverifyBy < today`. Both dates are already quarter-granular and staggered (`2027-02-09`, 82 days ahead; `2027-05-14`, 176 days ahead), and neither case has a sentinel in `eval/qa/source-sentinels.json`. Both `npm run eval:qa:lint -- --stale --enforce-floors` and `npm run eval:qa:sentinels -- --check` exit 0 with 0 stale items.
  4. **Repo precedent & diff hygiene:** PR #456 (`ada75c0d`, 2026-11-17) updated judge-blind `truth.notes` on `q-tool-wallets-comparison.json` for `sls-033` without bumping `truth.asOf` (`2026-11-14`) or `truth.reverifyBy` (`2027-05-14`). Moving `truth.asOf` by five days on a 90/180-day cycle would dirty both battery JSON files, `eval/qa/cases.json`, `eval/qa/sample.json`, and `eval/qa/lifecycle-registry.json`, putting case-file diff hunks into a PR whose readers must not view case text (`eval/qa/README.md:266-268`), for no operational gain.
- **Action:** None. Both case files remain unchanged.

### Finding 2 (Sol: Low) — PR #452 vs PR #474 title-hold precision and `Repo.codeVerified.versionStatus` redefinition

- **Sol's claim (`SOL-REVIEW.md:6`):** `VERIFICATION.md:12` blurred PR #452 (which kept the Docs titles hold) with PR #474 (which absorbed the retitles), and `VERIFICATION.md:12`/`:33` described Scout 1.9.150's `versionStatus` only as an addition when Scout 1.9.150 actually redefined the existing `Repo.codeVerified.versionStatus` field.
- **Verdict:** **valid**
- **Evidence:**
  1. `.agents/rounds/2026-11-16-next-phase/items/0.2/REPORT.md:19-21` confirms PR #452 kept the Docs title hold; commit `cd4520bd` (PR #474) ended the hold and absorbed the retitled `inventory/stellar-docs-titles.json`.
  2. `git show 0bfbc8f4~1:inventory/stellar-light.json` (line 3768) confirms `versionStatus` already existed in Scout 1.9.135 as `"soroban-sdk status vs the latest protocol at scan time"`. Commit `0bfbc8f4` (PR #452, `inventory/stellar-light.json:3811`) redefined it as `"Combined SDK status: deprecated when EITHER sorobanSdkStatus or jsSdkStatus is deprecated..."` while adding `jsSdkStatus`, `sorobanSdkStatus`, and `stellarJsDep`. Recording that redefinition matters for any follow-up check of existing `versionStatus` consumers (`0.2/EXEC.md:155`).
- **Action:** Fixed `VERIFICATION.md:12` and `VERIFICATION.md:33` to distinguish PR #452 (hold kept) from PR #474 (titles absorbed) and to state that Scout 1.9.150 both added the three new fields and redefined existing `Repo.codeVerified.versionStatus`.

### Finding 3 (Sol: Low) — Missing required `query` argument in `search_wallet_dapp_docs` reproducibility record

- **Sol's claim (`SOL-REVIEW.md:7`):** `VERIFICATION.md:34` cited rank-1 and top-5 hits for `stellarDocs.search_wallet_dapp_docs` without stating the `query` argument, which `catalog/manifest.json:32267` requires.
- **Verdict:** **valid**
- **Evidence:** Confirmed by reading `VERIFICATION.md:34` and `catalog/manifest.json:32267` (`required: ["query"]`). `.agents/skills/golden-truth/SKILL.md:87` requires verification notes a stranger can re-walk; omitting `query` and `hitsPerPage` left that Class E check non-reproducible.
- **Action:** Fixed `VERIFICATION.md:34` to record the exact arguments passed to the local Raven server (`{ query: "Freighter Varial wallet", hitsPerPage: 5 }` and `search_doc_titles` with `hitsPerPage: 10`).

### Finding 4 (Sol: Low) — "Verbatim" overstates compiled parity because `cases.json` re-indents wrapped entries

- **Sol's claim (`SOL-REVIEW.md:8`):** `VERIFICATION.md:43` and `:49` say `eval/qa/cases.json` matches the battery file "verbatim", whereas `eval/qa/compile-qa.mjs:336` wraps and re-indents entries in `cases.json`, so raw byte equality fails even though parsed JSON objects match.
- **Verdict:** **valid but not worth fixing**
- **Evidence:** Confirmed `eval/qa/compile-qa.mjs:336` writes `JSON.stringify(wrapper(cases, ...), null, 2)`, which adds wrapper indentation relative to standalone battery files, while parsed-JSON deep equality holds (`JSON.stringify(batteryObj) === JSON.stringify(compiledObj)` returned `true` for both cases). However, `.agents/skills/golden-truth/SKILL.md:136` explicitly defines corpus parity on parsed JSON (`compare parsed JSON`), not raw indentation bytes, so no check or consumer can fail on the phrasing.
- **Action:** Left as-is per `8.12-COMMON.md` ("Fix only valid findings").
