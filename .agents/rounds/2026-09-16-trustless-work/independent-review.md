# PR #157 integrated implementation and source review

Reviewer: Grok high (Grok 4.6). Distinct from Sol author and Astra coordinator.
Clock: `2026-09-16T20:15:31Z`.
Mode: audit. No edits, posts, paid calls, or in-repo stamps.
Worktree: `/tmp/raven-execution-2026-09-16/pr157-integrated`.
HEAD: `a83b3c5943b27f585ab4caafe264518e09ab236a` (accepted main).
`MERGE_HEAD`: `b447ff403f82734a0297b56c78a1a5515aa1f824`.
State: merge resolved, staged, uncommitted.
Handoff: `/tmp/raven-execution-2026-09-16/pr157-integration-report.md`.

## Verdict — two layers

### 1. Implementation and source pin — **accept**

The staged merge is a complete Trustless Work source addition on Scout **1.9.1**. Whole-skill admission repairs the two proven defects (`defi`/`DeFi`, `passkey`/`passkeys`) without restoring `dev`/`development` prefix matching. Exact-id and escrow discovery work. The five unrelated reviews still exclude Trustless Work. Other skill pins are unchanged. Docs closures and the proposal-first golden stay on main.

Identity change versus accepted main is **15 movements across 544 rows** (495 `--dump-ranked` + 49 holdout): 11 legacy, 3 extended, 0 skills, 0 protocol-history, 1 holdout. None add Trustless Work.

This is the independent source review **and** the activation review of the PR164 gospel. It is not a routing-floor change.

### 2. Metadata that belongs in this same candidate

Leave numerical floors and `acceptedTotals` unchanged (`213/279/312`, skills `16`, holdout `10/22/26` with `11` forbidden).

The compiler already has the proposal on main `a83b3c59` (PR #164). `eval/qa/lifecycle.mjs` requires a new id to have been committed as `proposed` first. That commit exists. This candidate may move the case into the battery with `truth.lifecycle.activation`. It must not stay `proposed` if the merge is to pass the skill coverage floor (`skill floor 1; found 0` while proposed files do not compile).

`eval/gates.json` catalog fingerprint must also update in this candidate. The routing `--gate` fails until `evidence.inputs` for `catalog/manifest.json` is `0cff03fd280a25b53cce9cb3ce579f5ec72b5a7f7a7dff4ca977ba4681831869`. A source-only land followed by a later fingerprint/activation commit is not mergeable: coverage and routing gates fail on the source-only tree.

Do not invent an extra source-only commit. Parent records real `activation` after this verdict, then this lane can check final metadata before commit.

Parent should also record this review on the Trustless Work `PIN-REVIEW.md` line that still says “independent review pending.”

## Freeze hashes

Listed integration freeze files match disk, including `src/catalog/skill-search-admission.ts` `12985cda…` and `catalog/manifest.json` `0cff03fd…`.

Staged binary diff SHA-256: `711240a5cebade5a6d5e78b613236a976b56343de25882de3cb80327342f4862` (matches the integration report).

Prior aggregate confusion is resolved:

- `git diff --binary b447ff403` on `/tmp/raven-execution-2026-09-16/pr157` → `25690f52429eac4ba24ef37488266264c0abcb658558777115853392e4a96e70`
- `git diff --binary 722eef5f` on that same fork → `415ed588220d58b65879688c89cf409f495f9326b9d3eb1353d061750c72323e`

The second hash is the full fork-versus-old-main range. It is not a freeze drift.

## Casing and plural repairs

`admitsWholeSkill` now:

- keeps a case-folded whole domain-code form (`DeFi` → `defi`) beside the camel-split tokens;
- matches a conservative trailing-`s` pair for description tokens of length ≥ 5 (`passkeys`/`passkey`);
- does not prefix-match slug `dev` to `development`.

Independent unpaid probes on this tree:

| Query | Result |
|---|---|
| `defi` | `skills.lumenloop.stellar-ecosystem-scout` in all-source top 5 |
| `DeFi` | same skill present |
| `passkey` | `skills.stellar-dev.dapp` in all-source top 5 |
| `passkeys` | dapp rank 1 |
| `development` | Trustless Work absent |

Tests cover those rows plus the five unrelated negatives.

## Fresh intended and unrelated queries

Unrelated (all-source top 5, TW absent): SDF spending, path payments, StellarX, Blend TVL, CLI bindings. Arrays match the previously reviewed fixed-point identities for those five.

Intended:

| Query | TW rank |
|---|---|
| exact id `skills.trustless-work.trustless-work-dev` | 1 |
| `trustless-work-dev` | 1 |
| `How do I integrate Trustless Work escrow?` | 1 |
| `How do I use the Trustless Work Blocks UI?` | 1 |
| Golden auth/custody question | 2 (Docs SDK tools at 1; TW still in top 5) |

Adjudicated capability matches, not SDF-class defects: bare `ui` (rank 3), `REST` (rank 2), `api` (rank 4). Horizon REST and “build a React dapp” keep main’s winners; TW is not in those top fives.

## Ranked movements versus accepted main

See the 544-row reconciliation below. An earlier reviewer script used the wrong case set (410 rows). That section is superseded.

## Preserved main state

| Item | Integrated tree |
|---|---|
| Scout inventory | `1.9.1`, fetch `2026-08-28T12:50:57.417Z` |
| Other skill pins | lumenloop `d92c56bd`, OZ `6f215af6`, stellar-dev `0472452a`, stellar-light `d25b9f6b` — same as `a83b3c59` |
| New pin only | trustless-work `634f32bd` `sel:7c6d71f8eef2` (22 files) |
| Docs findings | `sd-040` `sd-041` `sd-044` `sd-045` `sd-051` remain in `improvements/resolved.json`; active files absent |
| Freighter golden | not in this staged diff |
| TW QA case on current tree | still `proposed` (PR #164 text); activation not yet written |
| Registry | `active 500`, `proposed 1`, reserved `501` until parent activates |
| `eval/gates.json` | unmodified versus `a83b3c59` (floors and old catalog hash) |
| `PLAN.md` / `ARCHITECTURE.md` / round docs | unmodified |
| `sk-025` | staged; intake override `Trustless-Work/trustlesswork-skill` |
| Vendor scorer | untouched |

Merge conflicts in QA compile artifacts were resolved from main, so the proposal gospel is the one already independently approved.

## What parent still does in this candidate (not a later PR)

1. Keep both merge parents.
2. Activate `q-tw-escrow-api-auth-custody` in this tree: move the PR #164 gospel into `corpus/battery/`, set `state: active`, and add `truth.lifecycle.activation` (date, author Sol, reviewer Grok high, ledger this review, evidence). Add `improvements/skills/sk-025-trustless-work-beta-auth-scope.md` to `rootCause` / verified evidence. Do not change the approved gospel text.
3. Set `eval/gates.json` catalog input SHA-256 to `0cff03fd…`. Do not edit thresholds or `acceptedTotals`.
4. Record this review on the pin-review trustless-work entry.
5. Recompile QA and re-run `--gate`. Keep Scout 1.9.52 out.

This lane will check those metadata bytes before commit.

## Ranked-dump artifact boundary

The author frozen `--dump-ranked` file is still intact:

- `/tmp/raven-execution-2026-09-16/pr157-ranked-skill-admission-final.json`
- SHA-256 `4e2ece4a33fd1d35706dd5ace182536a5496649820be58eae72669da7d1a1765`
- 495 keys

This reviewer did **not** overwrite that file.

This reviewer **did** overwrite `/tmp/raven-execution-2026-09-16/pr157-integrated-ranked.json`. That path was later used as an integrated dump. The overwrite was a 410-row ad-hoc script: 338 legacy + 23 skills + 49 holdout. It omitted 122 extended and 12 protocol-history rows. It wrongly mixed holdout into the dump. That file is a reviewer error, not the author freeze.

Parent reconstruction `/tmp/raven-execution-2026-09-16/pr157-parent-reconstructed-ranked.json` also hashes `4e2ece4a…` and equals the author freeze.

Independent re-run on this integrated tree, official runner, reviewer-owned path:

```text
npm run eval:routing -- --dump-ranked /tmp/raven-execution-2026-09-16/pr157-reviewer-dump-ranked.json
```

Result JSON: `eval/results/routing-2026-09-16T20-21-28-462Z.json`.

Reviewer dump SHA-256: `4e2ece4a33fd1d35706dd5ace182536a5496649820be58eae72669da7d1a1765` (495 rows). Byte-identical to the author freeze. Holdout is absent from that dump, as specified.

Holdout extracted from `holdoutCases` in the result JSON to a reviewer-owned file (49 rows). Dump ∩ holdout is empty. Union is 544.

Parent file `/tmp/raven-execution-2026-09-16/pr157-parent-all-lane-movements.json` lists 15 changed rows against accepted-main result `19-52-57`. Independent dumps match that split: 11 legacy, 3 extended, 0 skills, 0 protocol-history, 1 holdout.

## Full 544-row reconciliation versus accepted main

`--dump-ranked` is 338 + 122 + 23 + 12 = 495. Holdout is 49 more. Source acceptance counts **15 movements across 544**, not 14 across all lanes.

The 14 dump movements are the 11 legacy + 3 extended identities already reviewed. All drop a weakly admitted whole skill. None add Trustless Work. Skills and protocol-history dumps are unchanged.

The extra holdout movement was re-derived from result JSON `holdoutCases`, not from `--dump-ranked`. Independent review: it is the same class of whole-skill admission change as the dump movements (one whole skill leaves the page, another whole skill enters). Trustless Work is not on either page. The holdout forbidden-capture flag stays true. Lane totals on this run remain at or above floors: n=49, top-1 10, top-3 22, top-5 27, forbidden 11, passed 21. Floor is 10/22/26 with max 11 forbidden. This review does not name that holdout row, list its hits, or retune labels.

Floors stay 213/279/312, skills 16/23/23, holdout 10/22/26 with 11 forbidden. Do not change `acceptedTotals`.

Implementation/source acceptance stands with the 15/544 accounting.

## Activation review — PR #164 gospel

Clock for this addendum uses the same review date: 2026-09-16.

The file on the integrated tree is byte-identical to main `a83b3c59` (canonical digest `539b8174973d4225c6399fd5f3769b28646b22df0c0ebf01dfad69d5b8b1360c`). Question, answer, keyFacts, avoid, notes, corroboration, and sources match the proposal this lane already approved.

`eval/qa/lifecycle.mjs`: a new id must first be committed as `proposed`. PR #164 did that. A later commit — this candidate — may set `active` with `truth.lifecycle.activation`. The reviewer must differ from the author. README’s “later commit” is this source merge after #164, not a third source-only commit.

Coverage lint counts compiled battery cases only. While the golden stays proposed, `skills.trustless-work.trustless-work-dev` has floor 1 and found 0. Activation in this candidate is required for a mergeable tree, together with the catalog fingerprint update.

**Approve activation** of this gospel.

Parent should add, without rewriting judge-facing text:

- `state: active` under `corpus/battery/compliance-rwa-payments/`
- `truth.lifecycle.activation`: date `2026-09-16`, author Sol high, reviewer Grok high (this review), ledger `/tmp/raven-execution-2026-09-16/pr157-integrated-review.md`, evidence including source pin `sel:7c6d71f8eef2` and this review
- `rootCause` includes `improvements/skills/sk-025-trustless-work-beta-auth-scope.md` (auth-scope finding). `eval-authoring` may remain as the case-creation cause

This lane will inspect those metadata bytes before commit. Numerical gates stay unchanged.

## Explicit stamps

| Stamp | This review |
|---|---|
| Implementation of parser, root-path selection, host description, admission helper | **accepted** |
| Trustless Work source pin `634f32bd` / `sel:7c6d71f8eef2` | **accepted** (independent of Scout 1.9.52) |
| Golden activation of the PR #164 gospel | **accepted for this candidate** (compiler already has the proposal on `a83b3c59`) |
| Routing floor / `acceptedTotals` change | **not accepted** (must stay) |
| Catalog fingerprint update | **required in this candidate**, not a follow-up commit |
| Scout 1.9.52 / `GET /api/rwa` | **not in scope** |
