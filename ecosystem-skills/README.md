# Stellar/Soroban ecosystem skills — pin set

This directory is a version-pinned reference to the Stellar/Soroban agent skills that the
ecosystem publishes. A skill is a Claude-Code-style `SKILL.md` playbook. The sources are
LumenLoop, OpenZeppelin, the Stellar Development Foundation (SDF), Stellar Light, and Trustless
Work. The directory also holds a snapshot of the broader
[stellarlight.xyz](https://stellarlight.xyz/skills) ecosystem directory.

**This directory stores no skill body.** It stores addresses: a commit SHA for each source, and a
path and a git blob hash for each file. Four consumers need the text: the catalog build, the
super-spec build, this directory's index, and the Worker at read time. Each consumer fetches the
file from upstream at the pinned commit and verifies it against the pinned hash. It refuses bytes
that do not match. See [`THIRD-PARTY-NOTICES.md`](../THIRD-PARTY-NOTICES.md).

The unified catalog builds from this pin set. Each skill becomes a searchable catalog entry. Each
`##` section becomes an exact-ID entry with `searchable: false`. `skill.read` can read a section,
but search does not return it
([ADR-0005](../research/decisions/0005-skills-form-sections-out-of-search.md)). The manifest
allowlist applies to skills and to sections.

## Layout

```
ecosystem-skills/
├── MANIFEST.json    # THE ARTIFACT: per-source pinned commit + per-file path/size/git-blob-sha
├── PIN-REVIEW.md    # review ledger: one `sel:` digest per reviewed pin selection (CI-gated)
├── INDEX.md         # AUTO-GENERATED themed directory (name + description + source + size), linked upstream
├── groups.json      # theme → skill-id mapping that drives INDEX.md grouping
├── catalog.json     # full snapshot of the stellarlight.xyz/api/skills directory (count in INDEX.md)
├── build-index.mjs  # regenerates INDEX.md from MANIFEST.json + catalog.json + groups.json
├── update.sh        # re-pins every source (stores nothing), prints the body diff, rebuilds the index
├── .cache/          # gitignored working cache of fetched bodies, keyed by blob sha — safe to delete
└── README.md
```

Start at [`INDEX.md`](./INDEX.md). It groups every pinned skill by theme and links each skill to
the upstream source at its pinned commit. It ends with the ecosystem directory snapshot. That
snapshot also lists SDKs, MCP servers, and CLIs that are not `SKILL.md` skills. This server does
not serve those entries.

## Sources

| Source id | Origin | What | How |
| --- | --- | --- | --- |
| `lumenloop` | [`lumenloop/lumenloop-skills`](https://github.com/lumenloop/lumenloop-skills) `skills/` | 8 public Stellar-ecosystem analyst skills | `gh` tree listing @ pinned commit |
| `openzeppelin-stellar` | [`OpenZeppelin/openzeppelin-skills`](https://github.com/OpenZeppelin/openzeppelin-skills) `skills/` | 3 Stellar/Soroban contract skills (cherry-picked from a multi-chain repo) | `gh` tree listing @ pinned commit |
| `stellar-dev` | [`stellar/stellar-dev-skill`](https://github.com/stellar/stellar-dev-skill) `skills/` | SDF developer skills (smart-contracts, dapp, data, assets, agentic-payments, cross-chain, standards, zk-proofs) | `gh` tree listing @ pinned commit |
| `stellar-light` | [`Stellar-Light/stellar-scout`](https://github.com/Stellar-Light/stellar-scout) (root) | 1 ecosystem-analyst skill | `gh` tree listing @ pinned commit |
| `trustless-work` | [`Trustless-Work/trustlesswork-skill`](https://github.com/Trustless-Work/trustlesswork-skill) `trustless-work-dev/` (skill dir at the repo root, cherry-picked) | 1 escrow-integration skill | `gh` tree listing @ pinned commit |
| _catalog_ | [`stellarlight.xyz/api/skills`](https://stellarlight.xyz/api/skills) | ecosystem directory (sdf / stellarlight / lumenloop / external; entry count in `INDEX.md`) | `curl` snapshot → `catalog.json` (NOT downloaded as skills) |

Every source is public. `MANIFEST.json` records the names of each source's upstream `LICENSE` and
`NOTICE` files (`license_files`) at the same pinned commit.
[`THIRD-PARTY-NOTICES.md`](../THIRD-PARTY-NOTICES.md) gives the license of each source.

The LumenLoop API exposes 14 skills (`GET /v1/skills`): 8 public skills and 6 partner-set skills.
The public skills are identical to the GitHub repository. Raven pins only the public set.

The partner set is the `lumenloop-api-*` onboarding family. It comes from a private repository
through a credentialed endpoint, so it has no pin source here. Partner-tier content must not be
in this public repository. The re-pin uses no credentials, so no re-pin can add that content. The
partner skills appear only as name-only stubs in `inventory/lumenloop.json`. Those stubs keep the
full `/v1/skills` set observable.

## Design choices

- **Reference, not copy.** The pin (commit and blob hash) is the artifact. Bodies stay upstream,
  and each use verifies them. `INDEX.md` and `groups.json` supply the organization.
- **Generated index.** `build-index.mjs` takes each skill's name and one-line description from the
  YAML frontmatter of its `SKILL.md` at the pinned commit. The index therefore agrees with the
  skills.
- **New skills are visible.** A skill that `groups.json` does not file goes to an "Uncategorized"
  section of `INDEX.md`. `update.sh` also prints it.
- **Skipped skills are recorded.** `sources.json` defines each source's selection mode and pick list.
  `update.sh` and `check-skills-drift.mjs` read the same definitions.
  `openzeppelin-stellar` picks 3 Stellar skills from a multi-chain repository. A
  later run of `update.sh` does not find a new upstream sibling. For this reason,
  `groups.json` `unpinnedUpstream` records each skipped sibling with a reason.
  `check-skills-drift.mjs` fails on every run while an upstream directory is neither pinned nor
  recorded. The check lists every source with `mode: "pick"`, including sources with no exclusions.
  The modes `all` and `root` do not need this sibling check.
- **Complete directory snapshot.** `catalog.json` holds the full stellarlight directory. It
  includes SDKs, MCP servers, and CLIs that are not `SKILL.md` skills, but Raven does not download
  them. `build-index.mjs` reads this file directly. `MANIFEST.json` holds no second copy.
- **Community source directory snapshot.** `community.json` records Community names and links from `stellar/stellar-dev-skill main`.
  The drift check reads the exported `ECOSYSTEM_CARDS` array in
  [`site/src/data/skills.ts`](https://github.com/stellar/stellar-dev-skill/blob/main/site/src/data/skills.ts).
  The site's [generator](https://github.com/stellar/stellar-dev-skill/blob/main/site/scripts/generate-llms-txt.mjs)
  uses the same array for the `Community Built` listing in `llms.txt`.
  The 2026-10-01 check found 30 entries, including candidates absent from `catalog.json`.
  This check measures `stellar/stellar-dev-skill main` directory drift, not deployed-site drift.
  Source changes can precede deployment or never deploy.
  The check parses literal titles and links without executing upstream code.
  It ignores descriptions, including Markdown bullets and headings, and the snapshot date.
  An empty or missing array, invalid syntax, or unsupported entry identity fails the check.
  Any `ECOSYSTEM_CARDS` reference outside its declaration also fails the check.
  `build-index.mjs` renders the snapshot as discovery links.
  Each candidate needs a separate pin and exposure review before Raven can serve it.
  To refresh only this directory, run `node scripts/lib/stellar-community.mjs ecosystem-skills/community.json`, then `node ecosystem-skills/build-index.mjs`.
- **Swap last.** `update.sh` stages `MANIFEST.json`, `catalog.json`, `community.json`, and `INDEX.md`
  in a temporary tree. It moves the four files into place only after four steps
  pass. Every source resolves. Every selection validates. The body diff prints. The index builds.
  A failure before that point leaves the committed files unchanged.

  The swap uses four same-filesystem renames from a sibling `.swap.<pid>/` directory.
  That directory holds copies of the previous four files. A rollback trap restores them if a rename
  fails. The swap is not one atomic transaction. But it never leaves a new manifest next to an old
  catalog or index.
- **Deterministic except timestamps.** Two runs against the same upstream produce byte-identical
  output, except these timestamp fields: `MANIFEST.synced_at`, `catalog.fetched_at`, `community.fetched_at`, and their
  rendered copies in `INDEX.md` (the "synced …" and "fetched …" text).
- **Verifiable provenance.** `MANIFEST.json` pins a full commit SHA for every GitHub source.
  Anyone can verify it independently.

## Updating

```bash
./update.sh                    # re-pin every source, rebuild INDEX.md (no credentials needed)
node build-index.mjs           # just rebuild the index (e.g. after editing groups.json)
```

`update.sh` does these steps in order:

1. It resolves a commit for each source and walks its tree.
2. It records the path, size, and blob hash of every file. It drops skills that upstream deleted.
   It snapshots both public directories.
3. It builds the index from the staged files with
   `build-index.mjs --manifest … --catalog … --community … --out …`.
4. It swaps `MANIFEST.json`, `catalog.json`, `community.json`, and `INDEX.md` into place.

Every step before the swap fails closed. Each of these conditions aborts the run before the swap:

- A source that does not resolve.
- A tree that the script cannot fetch, or a truncated tree.
- A selected skill without `SKILL.md`.
- A body diff that the script cannot print.
- An index that the script cannot build.

The script therefore never writes a partial or mixed-age pin set.

After a re-pin, do two things. File each **Uncategorized** skill in `groups.json`. **Read the
skill diffs**, because skills are prompt input.

Validate the pin set:

```bash
node scripts/check-mirrors.mjs           # offline: pin shape, group coverage, counts
node scripts/check-mirrors.mjs --fetch   # + every pin still resolves upstream and hashes as recorded
```

The check fails in these conditions:

- A skill is uncategorized.
- `groups.json` refers to a skill that `MANIFEST.json` does not contain.
- A source has no commit SHA, or a file has no blob hash.
- The pin set is partial.

### After a re-pin: rebuild the generated surfaces (repo root)

The pin set is an input. The model-facing artifacts are generated from it, and each pinned file is
fetched once into `.cache/`. Rebuild them after every re-pin.
[`.agents/skills/live-drift-resolution/SKILL.md`](../.agents/skills/live-drift-resolution/SKILL.md)
Step 1 gives the canonical ordered sequence, with the attestation and the gates that CI enforces.
Run that sequence, not a shorter version. In outline:

```bash
node scripts/check-mirrors.mjs --fetch   # every new pin resolves upstream (bypasses .cache)
$EDITOR ecosystem-skills/PIN-REVIEW.md   # record the sel: digests; CI fails without them
node scripts/check-pin-review.mjs --base origin/main
node scripts/build-catalog.mjs   # catalog/manifest.json (applies policy: retirements, de-dup)
npm run micro-map:build          # src/mcp/micro-map.ts
npm run spec:build               # specs/super-spec.json (in-sandbox spec; policy-aware skill index)
node eval/plan/build-op-classes.mjs
npm test                         # contract tests over the rebuilt artifacts
npm run eval:routing -- --gate   # routing gates (eval/gates.json baselines)
npm run secrets:scan -- --tree
```

A re-pin is not resolved until it is **deployed**. The pinned URLs are compiled into the Worker.
Production fetches the previous commit until `npm run deploy` runs.

Two guards can fail the catalog build. Each failure means that a person must reconcile the data.
Neither guard changes exposure silently.

- **Retirement guard** (`assertRetirementNamesResolve`, `scripts/build-catalog.mjs`).
  `RETIRED_ONBOARDING_SKILLS` in `scripts/exposure.mjs` lists the deny-listed pinned skills. It
  holds `lumenloop-mcp-connect`. The guard matches them by upstream name. If a sync renames or
  removes one, the build fails. It does not un-retire the skill silently. Retire the new name, or
  remove the entry if the skill is gone.

  `RETIRED_PARTNER_ONBOARDING_SKILLS` in `scripts/exposure.mjs` lists the unpinned partner family
  separately. `src/skills/scrub.ts` removes references to that family at read time.
- **Orphaned description notes** (`scripts/description-notes.mjs`). Catalog notes are exact-match
  data. Their keys are upstream tool, operation, or skill IDs. An upstream rename orphans the note
  and fails every affected generator. A skill description override changes only host discovery
  text. It does not change pinned source bytes. `codemode.skill.read` still applies its exposure
  scrub.

**Eval coupling.** `eval/skills-cases.json` grades skills routing. When a target skill leaves
catalog exposure, move its cases to the inert `retiredCases` array. Add a rationale and a date.
Re-baseline the skills-lane floor in `eval/gates.json` in the same commit, and record the decision
in the round ledger. The
[`run-evals`](../.agents/skills/run-evals/SKILL.md) skill, Step 4, gives the re-baseline rule.

**Automated drift detection (CI).** The daily `refresh.yml` workflow runs
`node scripts/check-skills-drift.mjs`. The script compares every pin in `MANIFEST.json` against
upstream in three ways:

- For each GitHub source, it finds the latest commit that touches the pinned path.
- It projects the live stellarlight directory again, without volatile fields, and compares the
  result with `catalog.json`.
- It projects Community names and links from `stellar/stellar-dev-skill main` and compares them with `community.json`.
  This source-directory check does not establish deployed-site drift.

Drift fails the run and goes into the same drift issue as the inventory checks. The workflow only
detects drift. CI never runs `update.sh`, because skills are prompt input and a person must review
upstream edits. For source drift, run `./update.sh` locally, read the skill diffs, re-pin, and commit.
For Community-only drift, use the two directory refresh commands above.
The checker labels both paths when both kinds of drift occur.
The commit pin makes live fetching safe: an upstream edit cannot reach the model until someone
re-pins. The script also runs standalone (`node scripts/check-skills-drift.mjs [--json]`, exit 1
on drift).

`update.sh` requires an authenticated `gh` CLI, plus `jq`, `node`, `curl`, and `git`. It needs no
API keys, because every source is public. The credential-free re-pin is a deliberate
publish-safety property (see [Sources](#sources)).

## Adding a source

A new source changes what the model reads. Treat it as an exposure decision, not a re-pin. The
Trustless Work admission is the worked example. Its round ledger is
[`.agents/rounds/2026-09-16-trustless-work-acceptance.md`](../.agents/rounds/2026-09-16-trustless-work-acceptance.md).

**Admission bar.** Answer each point in the round's source review before any pin lands:

- The repository is public and names its license in a `LICENSE` or `NOTICE` file.
- The skills are Stellar-specific and do not duplicate an exposed skill
  (`research/skill-exposure-inventory.json`).
- The skills are reference content for the reader's own environment. They can describe
  credentials, paid calls, signing, writes, or network steps that the reader does. Serving them
  gives the sandbox no network access and authorizes none of those actions. Record any remaining
  credential or supply-chain prompt as accepted risk in `PIN-REVIEW.md`. At read time,
  `src/skills/scrub.ts` removes only references to non-exposed operations and retired skills.
- A reviewer read every selected body. The body contains no instruction override and no literal
  credential. It contains no reference to a non-exposed operation or retired skill that the scrub
  does not remove.

**Steps.** The pin, the catalog, the fingerprint, and the QA activation land in one admission pull
request. A new QA case must already exist as `proposed` from an earlier commit (step 6).

1. Add a source definition to `sources.json` and a row to the Sources table above. Use `mode: "pick"`
   when the repository is multi-chain or mixed. A new repository layout also needs selector and
   link code. For example, Trustless Work uses the repo-root skill-dir mode.
2. Add the repository to `improvements/intake.json` (`services.skills.default.repos` and
   `sourceRepos`). Add its license to `THIRD-PARTY-NOTICES.md`.
3. Run `./update.sh`, file the new skills in `groups.json`, and record the `sel:` digest in
   `PIN-REVIEW.md`. For a cherry-picked source, list every upstream sibling directory that you do
   not pin under `groups.json` `unpinnedUpstream`, with a reason.
   `check-skills-drift.mjs` lists every source with `mode: "pick"`, even when that map is empty.
4. Add an `exposed` row for each skill to `research/skill-exposure-inventory.json`.
   `test/skill-exposure-classification.test.ts` requires it.
5. Rebuild the generated artifacts as in
   [`live-drift-resolution`](../.agents/skills/live-drift-resolution/SKILL.md) Step 1.
6. Give every new exposed skill active QA battery coverage before the final gates. CI enforces
   `skill floor 1` for each exposed skill, and a skills-routing case does not count. Commit each
   new case as `proposed` in an earlier commit. Activate it in the admission pull request after an
   independent `golden-truth` review. Then run `npm run eval:qa:compile` and
   `npm run eval:qa:register`. A case in `eval/skills-cases.json` is additional routing coverage,
   not a substitute.
7. Pass the acceptance gates on the complete tree: `npm test`,
   `npm run eval:qa:lint -- --stale --enforce-floors`, and the routing comparison in Step 4 of
   `live-drift-resolution`. Expect the count contracts to move (`test/catalog.test.ts`,
   `test/skills.test.ts`, `test/search.test.ts`, and the demo trace totals). Record the new
   catalog fingerprint in `eval/gates.json`. Numerical thresholds stay unchanged unless a separate
   decision changes them. A host description override (`scripts/description-notes.mjs`) or a
   search-admission change is a separate routing decision with its own comparison.
8. Get an independent review from a reviewer who is neither the author nor the orchestrator
   (`AGENTS.md`). Record it in a round ledger, and deploy with the owner's approval.

A candidate that is not admitted still needs a recorded decision. Record it as an open owner
decision or a work item in `.agents/TODO.md`, or in a round ledger. The directory snapshot then
never hides a decision that nobody made.

## Source of truth

[`MANIFEST.json`](./MANIFEST.json) records each source's pin: a full commit SHA for each GitHub
source and a git blob hash for each file. That pair is the provenance record and the runtime
integrity contract. Run `update.sh` again to reconcile with upstream.
