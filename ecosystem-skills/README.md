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
([ADR-0005](../research/decisions/0005-skills-form-sections-out-of-search.md)). The manifest
allowlist applies to both.

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
| `lumenloop` | [`lumenloop/lumenloop-skills`](https://github.com/lumenloop/lumenloop-skills) `skills/` | 8 public Stellar-ecosystem analyst skills |
| `openzeppelin-stellar` | [`OpenZeppelin/openzeppelin-skills`](https://github.com/OpenZeppelin/openzeppelin-skills) `skills/` | 3 Stellar/Soroban contract skills, picked from a multi-chain repo |
| `stellar-dev` | [`stellar/stellar-dev-skill`](https://github.com/stellar/stellar-dev-skill) `skills/` | SDF developer skills |
| `stellar-light` | [`Stellar-Light/stellar-scout`](https://github.com/Stellar-Light/stellar-scout) (root) | 1 ecosystem-analyst skill |
| `trustless-work` | [`Trustless-Work/trustlesswork-skill`](https://github.com/Trustless-Work/trustlesswork-skill) `trustless-work-dev/` | 1 escrow-integration skill, picked from the repo root |

Every source is public, and the re-pin uses no credential. That is a deliberate publish-safety
property: no re-pin can add private content. `MANIFEST.json` records each source's upstream
`LICENSE` and `NOTICE` file names (`license_files`) at the pinned commit.

The Lumenloop API lists 14 skills: the 8 public ones, identical to the GitHub repository, and 6
partner-set skills (`lumenloop-api-*`) from a private repository. Raven pins only the public
set. Partner-tier content must never be in this repository; the partner skills appear only as
name-only stubs in `inventory/lumenloop.json`.

## Re-pin

`update.sh` needs an authenticated `gh` CLI, `jq`, `node`, `curl`, and `git`, and no API key.

```bash
./update.sh                    # re-pin every source and rebuild INDEX.md
node build-index.mjs           # rebuild the index only (after editing groups.json)
```

`update.sh` resolves a commit for each source, records every file's path, size, and blob hash,
drops skills that upstream deleted, snapshots both directories, and builds the index from the
staged files. It then swaps `MANIFEST.json`, `catalog.json`, `community.json`, and `INDEX.md`
into place together, with a rollback if a rename fails. It aborts before the swap, and leaves
the committed files unchanged, when a source does not resolve, a tree cannot be fetched or is
truncated, a selected skill has no `SKILL.md`, the body diff cannot print, or the index cannot
build. Two runs against the same upstream differ only in their timestamps.

After a re-pin:

1. **Read the skill diffs.** Skills are prompt input.
2. File each **Uncategorized** skill in `groups.json`. For a `pick` source, record each new
   upstream sibling you do not pin under `unpinnedUpstream`, with a reason;
   `check-skills-drift.mjs` fails while a sibling is neither pinned nor recorded.
3. Record the `sel:` digests in `PIN-REVIEW.md`. CI fails without them
   (`node scripts/check-pin-review.mjs --base origin/main`).
4. Rebuild the generated surfaces and run the gates. The
   [`live-drift-resolution`](../.agents/skills/live-drift-resolution/SKILL.md) skill has the
   canonical ordered sequence; run that sequence, not a shorter one.
5. Deploy. The pinned URLs are compiled into the Worker, so production fetches the previous
   commit until `npm run deploy` runs.

Validate the pin set at any time:

```bash
node scripts/check-mirrors.mjs           # offline: pin shape, group coverage, counts
node scripts/check-mirrors.mjs --fetch   # also: every pin resolves upstream and hashes as recorded
```

### Catalog build guards

Each failure means a person must reconcile the data. Neither guard changes exposure silently.

- **Retirement guard** (`assertRetirementNamesResolve`, `scripts/build-catalog.mjs`).
  `RETIRED_ONBOARDING_SKILLS` in `scripts/exposure.mjs` deny-lists pinned skills by upstream
  name. If a sync renames or removes one, the build fails: retire the new name, or remove the
  entry if the skill is gone. `RETIRED_PARTNER_ONBOARDING_SKILLS` lists the unpinned partner
  family, and `src/skills/scrub.ts` removes references to it at read time.
- **Orphaned description notes** (`scripts/description-notes.mjs`). Notes are keyed by exact
  upstream tool, operation, or skill ID, so an upstream rename fails every affected generator.
  A description override changes only host discovery text, never pinned bytes.

**Eval coupling.** When a skill leaves catalog exposure, move its cases in
`eval/skills-cases.json` to `retiredCases` with a rationale and a date, re-baseline the
skills-lane floor in `eval/gates.json` in the same commit, and record the decision in the round
ledger (the [`run-evals`](../.agents/skills/run-evals/SKILL.md) skill has the re-baseline rule).

## Drift detection

The daily `refresh.yml` workflow runs `node scripts/check-skills-drift.mjs` (also runnable
alone, with `--json`; exit 1 on drift). It compares, per GitHub source, the latest commit that
touches the pinned path; the live stellarlight directory against `catalog.json`; and the
Community names and links against `community.json`. Drift goes into the same issue as the
inventory checks. CI never runs `update.sh`: a person must review upstream skill edits.

- Source drift: run `./update.sh` and follow "After a re-pin".
- Community-only drift: run
  `node scripts/lib/stellar-community.mjs ecosystem-skills/community.json`, then
  `node ecosystem-skills/build-index.mjs`.

The Community check reads the exported `ECOSYSTEM_CARDS` array in
[`site/src/data/skills.ts`](https://github.com/stellar/stellar-dev-skill/blob/main/site/src/data/skills.ts)
on `main`. It parses literal titles and links and never executes upstream code. It accepts a
sorted copy of one preceding same-file literal array (a `localeCompare` on `title` or
`copyValue`) and fails on anything else: an empty or missing array, invalid syntax, an
unsupported entry identity, or another reference to the array. It measures source drift, not
deployed-site drift. Each Community candidate needs its own pin and exposure review before
Raven can serve it.

## Adding a source

A new source changes what the model reads. Treat it as an exposure decision, not a re-pin. The
worked example is the
[Trustless Work admission](../.agents/rounds/2026-09-16-trustless-work-acceptance.md);
[ADR-0010](../research/decisions/0010-scf-community-fund-skills-stay-unpinned.md) records a
source that failed the bar.

**Admission bar.** Answer each point in the round's source review before any pin lands:

- The repository is public and names its license in a `LICENSE` or `NOTICE` file.
- The skills are Stellar-specific and do not duplicate an exposed skill
  (`research/skill-exposure-inventory.json`).
- The skills are reference content for the reader's own environment. They can describe
  credentials, paid calls, signing, writes, or network steps that the reader does; serving them
  gives the sandbox no network access and authorizes none of those actions. Record any
  remaining credential or supply-chain prompt as accepted risk in `PIN-REVIEW.md`.
- A reviewer read every selected body. It contains no instruction override, no literal
  credential, and no reference to a non-exposed operation or retired skill that
  `src/skills/scrub.ts` does not remove.

**Steps.** The pin, the catalog, the fingerprint, and the QA activation land in one admission
pull request.

1. Add a source definition to `sources.json` and a row to the Sources table. Use `mode: "pick"`
   for a multi-chain or mixed repository. A new repository layout also needs selector and link
   code.
2. Add the repository to `improvements/intake.json` (`services.skills.default.repos` and
   `sourceRepos`) and its license to `THIRD-PARTY-NOTICES.md`.
3. Run `./update.sh` and do "After a re-pin" steps 1 to 3.
4. Add an `exposed` row for each skill to `research/skill-exposure-inventory.json`
   (`test/skill-exposure-classification.test.ts` requires it).
5. Rebuild the generated artifacts through `live-drift-resolution`.
6. Add a skills-routing case to `eval/skills-cases.json`; routing and skills cases own skill
   reach. Add a QA battery case only when the skill answers a taxonomy leaf, named in
   `truth.leaf`: commit it as `proposed` in an earlier commit, activate it in the admission pull
   request after an independent `golden-truth` review, then run `npm run eval:qa:compile` and
   `npm run eval:qa:register`.
7. Pass the gates on the complete tree: `npm test`,
   `npm run eval:qa:lint -- --stale --enforce-floors`, and the routing comparison in
   `live-drift-resolution`. The count contracts move (`test/catalog.test.ts`,
   `test/skills.test.ts`, `test/search.test.ts`, and the demo trace totals). Record the new
   catalog fingerprint in `eval/gates.json`; numerical thresholds stay unless a separate
   decision changes them. A host description override or a search-admission change is a
   separate routing decision with its own comparison.
8. Get an independent review (`AGENTS.md`), record it in a round ledger, and deploy with the
   owner's approval.

A candidate that is not admitted still needs a recorded decision: an owner decision or work
item in `.agents/TODO.md`, or a round ledger entry.
