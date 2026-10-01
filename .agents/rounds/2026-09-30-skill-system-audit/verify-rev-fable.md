# Verification addendum — rev-fable

Reviewer: Claude Fable 5.1, high. Scope: commit `a6db8c1a` on `docs/sk-027-filed-and-review`
(`git diff f65e165d..a6db8c1a`). Read-only. Date: 2026-09-30.

## Verdict

`accept`. Every finding in my lane is resolved or correctly queued, the new selector code is sound and
reproduces the pinned manifest for all five live sources, and the reconciled tree passes the gates.

## Notes

### My findings

| finding | status | evidence |
| --- | --- | --- |
| F1 admission bar contradicted PR #157 | resolved | `ecosystem-skills/README.md` bullets 3-4 now call the skills reference content, route remaining credential or supply-chain prompts to `PIN-REVIEW.md`, and state that `src/skills/scrub.ts` removes only non-exposed operation and retired skill references. That matches `scrub.ts:41`, `:95`, `:166`. |
| F2 "code changes only for a new layout" | resolved | Step 1 now says a new layout needs selector and link code. Step 5 names `npm test`, `eval:qa:lint -- --stale --enforce-floors`, the Step 4 routing comparison, the four count contracts, the `eval/gates.json` fingerprint, and treats description-note or search-admission changes as separate routing decisions. `live-drift-resolution` Step 4 is the routing baseline step, so the pointer resolves. |
| F3 step 6 understated two hard gates | resolved | Preface says the QA case must exist as `proposed` from an earlier commit. Step 6 states `skill floor 1` per exposed skill, that a routing case does not count, and proposal-first activation with an independent review. |
| F4 `unpinnedUpstream` omitted | resolved (docs); code queued | Step 3 and the design-choices bullet now say to record every skipped sibling and that the check enumerates only when the map is non-empty, which matches `check-skills-drift.mjs:114`. The code change is queued in `TODO.md` "Make the drift check's cherry-pick mode explicit". Queueing is right: it is a behavior change with its own test, not a doc fix. |
| F5 sk-027 incomplete locations; skills.stellar.org fact | resolved | Finding adds `SKILL.md:90`, `README.md:76,78`, `api-reference.md:196`, the legacy `skills/soroban/SKILL.md` 200, and the `/soroban` and `/anchors` 404s. Comment `issues/14#issuecomment-5919085549` exists, author `kalepail`, 2026-09-30T20:24:54Z, and its text matches the finding. I re-checked: `README.md:76` and `:78` URLs return 404; the `skills.stellar.org/skills/{name}/SKILL.md` pattern returns 404 for `stellar-scout`, `scf-submission-radar`, `lumenloop-scf-radar`, `scf-budget-builder`, and `stellar-scout-mcp`, so the new "take the install location from catalog metadata" line is justified. The revised recommendation removes fixed lists instead of writing a new roster of eight; that is the smaller fix. The comment was an allowed write under `improvements-pipeline` ("materially new evidence ... that changes the proposed action"). |
| F6 `update.sh:36` "≈30 entries" | resolved | Line now reads "every ecosystem entry ...; the count is in INDEX.md". |
| F7 decision K framing | resolved | K now records the overlap with `scf-submission-radar` and `stellar-scout`, the 2026-07-23 push date, the standard `skills/` layout, the `fetch-external-doc` directory name, and points to the queued body read in `TODO.md`. |
| F8 decision location sentence | resolved | README closing sentence now names [`.agents/NEXT.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/NEXT.md), `.agents/TODO.md`, and a round ledger. |
| F9 deploy id absent from ledger | resolved | Ledger line 100 records Worker Version ID `c4d27b61-e0f0-47a4-a6fe-6ce298fb1b81`, which matches my `wrangler deployments list` read. |
| F10 [NEXT.md](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/NEXT.md) header stamp | resolved | Header reads "Updated 2026-09-30 during the skill system audit" and dates items 1-2 to the routing audit. |
| F11 filer repeats evidence | no change; agreed | Template behavior, not this finding. |
| F12 "Solo todo 825" in `update.sh` | resolved | Line 25 keeps only the `RETIRED_ONBOARDING_SKILLS` pointer. |
| add. 5 `EVALS.md` link | resolved | README line 161 links `../eval/EVALS.md`. |
| add. 6 coverage-rules kind list | resolved | `coverage-rules.json:97` now says "the kinds in meta.validKinds". |
| add. 7 THIRD-PARTY scrub counts | no change; accepted | `rev-sol` verified the 7 + 1 file counts. I did not re-derive it; the reconciliation table records the verifier. |
| add. 4 decision K body read | queued | `TODO.md` "Read the Stellar Light SCF skill bodies" names all four criteria. Correct placement. |

No rejection in the table applies to my findings. The one rejection (`rev-grok`, "Quickstart has no `/lab`")
is correct: `stellar/quickstart` default branch is `main`, tip `8f5dcf166978` (2026-09-29T12:26:01Z);
its README lines 59, 185, 247, and 252 name `http://localhost:8000/lab`, `--enable lab`, and "Lab is
also built-in to Quickstart"; `common/nginx/etc/conf.d/lab.conf` returns 200; `common/lab/bin/start`
line 9 exports `NEXT_PUBLIC_DEFAULT_NETWORK=custom`.

### New code

`scripts/lib/skill-source-selection.mjs`:

- The `truncated` guard uses the field GitHub sets on an over-limit tree, and the missing-array guard
  replaces the old silent `[]`. Both throw before any selection, so a partial pin cannot look complete.
- Repo-root mode now requires a root `SKILL.md`; directory mode requires a `SKILL.md` for every pick
  and refuses an empty selection. The CLI wrapper catches the throw, prints `error: ...`, and sets exit
  code 1; `update.sh` assigns `files="$(...)"` under `set -euo pipefail`, so the run aborts before the
  swap. Correct.
- Live check: I ran the exported function against the GitHub tree at each pinned commit with
  `update.sh`'s pick lists. Every source selected exactly the manifest's file set, identical by
  `skill/relpath:sha` (lumenloop 15, openzeppelin-stellar 3, stellar-dev 22, stellar-light 4,
  trustless-work 22; `truncated=false` on all five).
- One gap, not a regression: in directory mode with no pick list (lumenloop, stellar-dev) a skill
  directory that lacks `SKILL.md` is still pinned as a skill. The new check covers picks only. A one-line
  extension would check every selected skill. Nit; optional.

`scripts/check-mirrors.mjs`: the empty-`skills` guard reports through `fail()` and the loop uses
`source.skills ?? []`, so a malformed source produces one clear failure instead of a crash. Live run:
`mirror checks ok`.

`test/skill-source-selection.test.mjs`: the fixture gained a root `SKILL.md` so the existing root-mode
test still passes; the three new tests exercise truncated, malformed, empty, missing-pick, pick-without-
`SKILL.md`, and rootless cases. `npx vitest run test/skill-source-selection.test.mjs
test/skill-markdown.test.mjs` → 10 passed.

### Golden follow-up

The two new corroboration rows corroborate text the golden already asserts ("Current signing paths
include wallet-kit, hardware, external, and raw-secret paths"; "Quickstart exposes a local `/lab` with
custom endpoints"). Re-derived: the upload-deploy Docs page contains "secret key", "hardware wallet",
"extension wallet", and "signature"; the Quickstart evidence is above. No judge-facing field changed.
`npm run eval:qa:register -- --check` → `up to date`. `verified.by` names me as an independent
re-derivation, which is accurate for the 19:58Z probe recorded in my review.

### Gates on `a6db8c1a`

- `npm test` → 2185 passed, 4 skipped, exit 0.
- `npm run eval:qa:lint -- --stale` → `0 error(s), 62 warning(s)`.
- `npm run improvements:lint` → `improvements lint ok (65 findings)`.
- `node scripts/check-mirrors.mjs` → `mirror checks ok`.

### New problems introduced

None found. Spot checks on the reconciliation's other edits: `sk-028` quotes are exact at `3b587aa9`
(`SKILL.md:91` "dozens, not hundreds"; `api-reference.md:104` "~110 profiles") and `/api/status`
reports `builders` `count: 226` at 2026-09-30T12:57:22.194Z. The README's new claim that the drift check
fails "current commit or not" while a sibling is unclassified matches `check-skills-drift.mjs:136-149`.
