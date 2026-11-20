# Stellar/Soroban ecosystem skills — pin set

A version-pinned reference to the agent skills (`SKILL.md` playbooks) that the Stellar ecosystem
publishes, plus snapshots of two ecosystem directories.

**This directory stores no skill body.** It stores addresses: a commit SHA per source, and a path
and git blob hash per file. Four consumers need the text: the catalog build, the super-spec
build, this directory's index, and the Worker at read time. Each fetches the file from upstream
at the pinned commit and refuses bytes that do not match the pinned hash. An upstream edit
therefore cannot reach a model until someone re-pins. Licenses are in
[`THIRD-PARTY-NOTICES.md`](../THIRD-PARTY-NOTICES.md).

In the catalog, each skill is a searchable entry, and each `##` section is an exact-ID entry
that `skill.read` can read but search does not return
([ADR-0005](../research/decisions/0005-skills-form-sections-out-of-search.md)). The catalog manifest
(`catalog/manifest.json`) allowlist applies to both.

## Layout

| File | Role |
| --- | --- |
| `MANIFEST.json` | The artifact: each source's pinned commit, and each file's path, size, and blob hash. It is the provenance record and the runtime integrity contract. |
| `sources.json` | Each source's selection mode (`all`, `root`, `pick`) and pick list |
| `PIN-REVIEW.md` | Review ledger: one `sel:` digest per reviewed pin selection (CI-gated) |
| `groups.json` | Theme-to-skill mapping for `INDEX.md`; `unpinnedUpstream` records each skipped sibling with a reason |
| `catalog.json` | Snapshot of the [stellarlight.xyz](https://stellarlight.xyz/api/skills) directory. It also lists SDKs, MCP servers, and CLIs, which Raven does not download or serve. |
| `community.json` | Snapshot of Community names and links from `stellar/stellar-dev-skill` `main` |
| `INDEX.md` | Generated themed directory, linked upstream at the pinned commits. Start here. |
| `build-index.mjs` | Regenerates `INDEX.md` from the files above |
| `update.sh` | Re-pins every source, prints the body diff, rebuilds the index |
| `.cache/` | Ignored cache of fetched bodies, keyed by blob hash. Safe to delete. |

## Sources

| Source id | Origin | What |
| --- | --- | --- |
| `lumenloop` | [`lumenloop/lumenloop-skills`](https://github.com/lumenloop/lumenloop-skills) `skills/` | Public Stellar-ecosystem analyst skills |
| `openzeppelin-stellar` | [`OpenZeppelin/openzeppelin-skills`](https://github.com/OpenZeppelin/openzeppelin-skills) `skills/` | Stellar/Soroban contract skills, picked from a multi-chain repo |
| `stellar-dev` | [`stellar/stellar-dev-skill`](https://github.com/stellar/stellar-dev-skill) `skills/` | SDF developer skills |
| `stellar-light` | [`Stellar-Light/stellar-scout`](https://github.com/Stellar-Light/stellar-scout) (root) | Ecosystem-analyst skill |
| `trustless-work` | [`Trustless-Work/trustlesswork-skill`](https://github.com/Trustless-Work/trustlesswork-skill) `trustless-work-dev/` | Escrow-integration skill, picked from the repo root |

Every source is public, and the re-pin needs no Raven or service credential, only your own `gh`
login. That is a deliberate publish-safety property: no re-pin can add private content. `MANIFEST.json` records each source's upstream
`LICENSE` and `NOTICE` file names (`license_files`) at the pinned commit.

The Lumenloop API also lists partner-set skills (`lumenloop-api-*`) from a private repository,
beyond the public set that matches the GitHub repository. Raven pins only the public set. Partner-tier content must never be in this repository; the partner skills appear only as
name-only stubs in `inventory/lumenloop.json`.

## Re-pin

`update.sh` needs an authenticated `gh` CLI, `jq`, `node`, and `git`, and no API key.

```bash
./ecosystem-skills/update.sh                 # re-pin every source, refresh directories, and rebuild INDEX.md
node scripts/refresh-skill-directories.mjs   # refresh directory snapshots and INDEX.md only (no pin changes)
node ecosystem-skills/build-index.mjs        # rebuild the index only (after editing groups.json)
```

`update.sh` resolves each source's commit, records file paths/sizes/blob hashes, drops deleted skills, refreshes directory snapshots, builds `INDEX.md`, and atomically swaps `MANIFEST.json`, `catalog.json`, `community.json`, and `INDEX.md` (rolling back on rename error). It aborts before swapping on unresolved sources, fetch/truncation errors, missing `SKILL.md`, diff-print failures, or index build errors.

After a re-pin:

1. **Read the skill diffs.** Skills are prompt input.
2. File each **Uncategorized** skill in `groups.json`. For `pick` sources, record skipped upstream siblings under `unpinnedUpstream` with a reason (`check-skills-drift.mjs` fails otherwise).
3. Record the `sel:` digests in `PIN-REVIEW.md` (`node scripts/check-pin-review.mjs --base origin/main` gates CI).
4. Rebuild generated surfaces and run gates in the order defined by [`live-drift-resolution`](../.agents/skills/live-drift-resolution/SKILL.md).
5. Deploy (`npm run deploy`); pinned URLs are compiled into the Worker.

Validate pins at any time:

```bash
node scripts/check-mirrors.mjs           # offline: pin shape, group coverage, counts
node scripts/check-mirrors.mjs --fetch   # also verify upstream resolution and hashes
```

### Catalog build guards

Both guards fail loudly rather than changing exposure silently:

- **Retirement guard** (`assertRetirementNamesResolve`, `scripts/build-catalog.mjs`): fails if a sync renames or removes a skill listed in `RETIRED_ONBOARDING_SKILLS` (`scripts/exposure.mjs`). Update the deny-list accordingly. `RETIRED_PARTNER_ONBOARDING_SKILLS` lists unpinned partner skills that `src/skills/scrub.ts` strips at read time.
- **Orphaned description notes** (`scripts/description-notes.mjs`): keyed by exact upstream ID, so renames fail affected generators. Overrides change only host discovery text, never pinned bytes.

**Eval coupling.** When a skill leaves exposure, move its `eval/skills-cases.json` rows to `retiredCases` (with rationale and date), re-baseline the skills floor in `eval/gates.json` in the same commit, and log the decision ([`run-evals`](../.agents/skills/run-evals/SKILL.md)).

## Drift detection

`refresh.yml` runs `node scripts/check-skills-drift.mjs` daily (standalone: add `--json`; exits 1 on drift), checking each GitHub source's latest commit touching its pinned path, live stellarlight against `catalog.json`, and Community cards against `community.json`. The workflow reconciles one `drift`-labeled issue per `<class>:<source>` kind via `scripts/sync-drift-issues.mjs` ([`inventory/README.md`](../inventory/README.md)). CI never runs `update.sh`.

- **Source drift** (pin moved or unclassified sibling): run `./ecosystem-skills/update.sh` and follow "After a re-pin".
- **Directory-only drift** (`stellarlight-catalog` / `stellar-community-catalog`): run `node scripts/refresh-skill-directories.mjs` (updates snapshots and `INDEX.md` only; leaves `MANIFEST.json`, catalog, super-spec, and Worker untouched).

The Community check parses literal titles/links from `ECOSYSTEM_CARDS` in [`site/src/data/skills.ts`](https://github.com/stellar/stellar-dev-skill/blob/main/site/src/data/skills.ts) on `main` without executing upstream code (accepting only a literal array or a `localeCompare` sort of one; anything else fails). Community candidates require their own admission review before pinning as `skills.*`; Scout pass-through (`scout.listSkills`, `scout.getSkill`) already exposes community skills published in Stellar Light.

## Adding a source

Adding a source is an exposure decision, not a re-pin (worked example: [Trustless Work](../.agents/rounds/2026-09-16-trustless-work-acceptance.md); rejection: [ADR-0010](../research/decisions/0010-scf-community-fund-skills-stay-unpinned.md)).

**Admission bar** (answer in the round's source review before pinning):

- Public repo with a `LICENSE` or `NOTICE` file.
- Stellar-specific and non-duplicative of an exposed skill (`research/skill-exposure-inventory.json`).
- Reference content for the reader's own environment; serving it gives the sandbox no network access or authority. Record any residual credential/supply-chain prompt as accepted risk in `PIN-REVIEW.md`.
- Every selected body read by a reviewer: no instruction override, literal credential, or reference to a non-exposed operation or retired skill that `src/skills/scrub.ts` does not remove.

**Steps** (pin, catalog, fingerprint, and QA activation land in one PR):

1. Add the source to `sources.json` (`mode: "pick"` for multi-chain/mixed repos; new layouts also need selector/link code) and the Sources table above.
2. Add the repo to `improvements/intake.json` (`services.skills.default.repos`, `sourceRepos`) and its license to `THIRD-PARTY-NOTICES.md`.
3. Run `./ecosystem-skills/update.sh` and complete "After a re-pin" steps 1–3.
4. Add `exposed` rows to `research/skill-exposure-inventory.json` (required by `test/skill-exposure-classification.test.ts`).
5. Rebuild generated artifacts per `live-drift-resolution`.
6. Add a case to `eval/skills-cases.json`. Add a QA battery case only when the skill answers a taxonomy leaf (`truth.leaf`): commit as `proposed` first, activate in the admission PR after independent `golden-truth` review, then run `npm run eval:qa:compile` and `npm run eval:qa:register`.
7. Pass `npm test`, `npm run eval:qa:lint -- --stale --enforce-floors`, and the `live-drift-resolution` routing comparison. Update count contracts (`test/catalog.test.ts`, `test/skills.test.ts`, `test/search.test.ts`, demo trace totals) and the catalog fingerprint in `eval/gates.json` (thresholds stay unchanged without a separate decision; host description overrides or search-admission changes require a separate routing comparison).
8. Complete an independent review (`AGENTS.md`), record it in a round ledger, and deploy under the `AGENTS.md` owner delegation.

Record rejected candidates in `.agents/TODO.md` or a round ledger.
