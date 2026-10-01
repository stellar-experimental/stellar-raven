# Stellar/Soroban ecosystem skills — pin set

A version-pinned **reference** to the **Stellar/Soroban agent skills** (Claude-Code-style
`SKILL.md` playbooks) published across the ecosystem — LumenLoop, OpenZeppelin, the Stellar
Development Foundation (SDF), Stellar Light, and Trustless Work — plus a snapshot of the broader
[stellarlight.xyz](https://stellarlight.xyz/skills) ecosystem **directory**.

**Skill bodies are not stored here.** This directory holds their addresses: a commit SHA per
source and a path + git blob hash per file. Everything that needs the text — the catalog build,
the super-spec build, this directory's own index, and the Worker at read time — fetches it from
upstream at the pinned commit and verifies it against the pinned hash. Bytes that do not match
are refused, not used. See `THIRD-PARTY-NOTICES.md` at the repo root.

In **this** repo the pin set is what the unified catalog builds from: each skill becomes a
searchable catalog entry, and each of its `##` sections becomes an exposed exact-id entry with
`searchable: false`. Sections are readable through `skill.read` but stay out of search
([ADR-0005](../research/decisions/0005-skills-form-sections-out-of-search.md)). The manifest
allowlist applies to both.

## Layout

```
ecosystem-skills/
├── MANIFEST.json    # THE ARTIFACT: per-source pinned commit + per-file path/size/git-blob-sha
├── INDEX.md         # AUTO-GENERATED themed directory (name + description + source + size), linked upstream
├── groups.json      # theme → skill-id mapping that drives INDEX.md grouping
├── catalog.json     # full snapshot of the stellarlight.xyz/api/skills directory (count in INDEX.md)
├── build-index.mjs  # regenerates INDEX.md from MANIFEST.json + catalog.json + groups.json
├── update.sh        # re-pins every source (stores nothing), prints the body diff, rebuilds the index
├── .cache/          # gitignored working cache of fetched bodies, keyed by blob sha — safe to delete
└── README.md
```

**Start at [`INDEX.md`](./INDEX.md)** — it groups every pinned skill by theme, links straight to
the upstream source at its pinned commit, and ends with the ecosystem directory snapshot (what
else exists, including non-`skill-md` SDKs/MCP servers/CLIs that this server does *not* serve).

## Sources

| Source id | Origin | What | How |
| --- | --- | --- | --- |
| `lumenloop` | [`lumenloop/lumenloop-skills`](https://github.com/lumenloop/lumenloop-skills) `skills/` | 8 public Stellar-ecosystem analyst skills | `gh` tree listing @ pinned commit |
| `openzeppelin-stellar` | [`OpenZeppelin/openzeppelin-skills`](https://github.com/OpenZeppelin/openzeppelin-skills) `skills/` | 3 Stellar/Soroban contract skills (cherry-picked from a multi-chain repo) | `gh` tree listing @ pinned commit |
| `stellar-dev` | [`stellar/stellar-dev-skill`](https://github.com/stellar/stellar-dev-skill) `skills/` | SDF developer skills (smart-contracts, dapp, data, assets, agentic-payments, cross-chain, standards, zk-proofs) | `gh` tree listing @ pinned commit |
| `stellar-light` | [`Stellar-Light/stellar-scout`](https://github.com/Stellar-Light/stellar-scout) (root) | 1 ecosystem-analyst skill | `gh` tree listing @ pinned commit |
| `trustless-work` | [`Trustless-Work/trustlesswork-skill`](https://github.com/Trustless-Work/trustlesswork-skill) `trustless-work-dev/` (skill dir at the repo root, cherry-picked) | 1 escrow-integration skill | `gh` tree listing @ pinned commit |
| _catalog_ | [`stellarlight.xyz/api/skills`](https://stellarlight.xyz/api/skills) | ecosystem directory (sdf / stellarlight / lumenloop / external; entry count in `INDEX.md`) | `curl` snapshot → `catalog.json` (NOT downloaded as skills) |

Every source is **public**, and each source's upstream `LICENSE`/`NOTICE` file names are recorded
in `MANIFEST.json` (`license_files`) at the same pinned commit — see `THIRD-PARTY-NOTICES.md` at
the repo root for the license map.

The LumenLoop API exposes 14 skills (`GET /v1/skills`): the 8 public ones (identical to the
GitHub repo) and 6 partner-set ones. Raven pins only the public set. The partner set (the
`lumenloop-api-*` onboarding family) comes from a private repository through a credentialed
endpoint, so it has no pin source here. Partner-tier content must not live in this public
repository. Because the re-pin uses no credentials, no re-pin can pull it in. The partner skills
appear only as name-only stubs in `inventory/lumenloop.json`, so the `/v1/skills` union stays
observable.

## Design choices

- **Reference, not copy.** The pin (commit + blob hash) is the artifact; bodies stay upstream and
  are verified on every use. The "nice organization" lives in `INDEX.md` + `groups.json`.
- **The index is auto-generated.** Each skill's name + one-line description is extracted from its
  `SKILL.md` YAML frontmatter at the pinned commit, so the index never drifts from the skills.
- **Newly synced skills surface loudly.** Any skill not filed in `groups.json` lands in an
  "Uncategorized" section of `INDEX.md` (and is printed by `update.sh`).
- **What we deliberately do NOT pin is named too.** `openzeppelin-stellar` cherry-picks 3 Stellar
  skills from a multi-chain repo, and that pick list is hard-coded in `update.sh` — so a newly
  published sibling (the repo already has setup/upgrade/review per chain) would never be pinned and
  re-running `update.sh` would not find it. So every upstream sibling a cherry-picked source skips
  is recorded with a reason under `groups.json` `unpinnedUpstream`, and `check-skills-drift.mjs`
  fails on every run — current commit or not — while any upstream directory is neither pinned nor
  recorded. That makes "we skipped these" a decision someone makes rather than an omission nobody
  sees. The check enumerates a source only when its `unpinnedUpstream` map is non-empty, so a new
  cherry-picked source must record at least its first exclusion.
- **The ecosystem is bigger than what we mirror.** `catalog.json` captures the full stellarlight
  directory — including SDKs/MCP servers/CLIs that aren't `SKILL.md` skills — so the map of "what
  exists" stays complete without dragging in non-skill artifacts. `build-index.mjs` reads this
  directory directly instead of storing a second projection in `MANIFEST.json`.
- **Swap last.** `update.sh` stages the whole pin set in a temp tree and only moves
  `MANIFEST.json` and `catalog.json` into place after every source resolved, every selection
  validated, and the body diff printed. A failure before that point leaves the existing pins
  untouched. The two moves are separate files, not one transaction, and `build-index.mjs` runs
  after them: if the index rebuild fails, the new pins are in place and `INDEX.md` is stale, so
  rerun `node build-index.mjs` before committing.
- **Deterministic except timestamps.** Back-to-back runs against the same upstream produce
  byte-identical output **except the timestamp fields**: `MANIFEST.synced_at`,
  `catalog.fetched_at`, and their rendered copies in `INDEX.md`
  (the "synced …" / "fetched …" text). Nothing else changes.
- **Honest provenance per source.** Every GitHub source pins a full commit SHA (independently
  verifiable) in `MANIFEST.json`.

## Updating

```bash
./update.sh                    # re-pin every source, rebuild INDEX.md (no credentials needed)
node build-index.mjs           # just rebuild the index (e.g. after editing groups.json)
```

`update.sh` resolves a commit per source, walks its tree, records every file's path/size/blob
hash, drops skills deleted upstream, rewrites `MANIFEST.json` + `catalog.json`, then runs
`build-index.mjs`. Every step before the swap fails closed: a source it cannot resolve, a tree it
cannot fetch, a truncated tree, a selected skill without `SKILL.md`, or a body diff it cannot print
aborts the run before the swap, so a partial or mixed-age pin set is never written. The index
rebuild runs after the swap (see "Swap last" above). After a re-pin, check the output for any **Uncategorized**
skills and file them into `groups.json`, and **read the skill diffs** — skills are prompt input.

Validate the pin set:

```bash
node scripts/check-mirrors.mjs           # offline: pin shape, group coverage, counts
node scripts/check-mirrors.mjs --fetch   # + every pin still resolves upstream and hashes as recorded
```

This fails if any skill is uncategorized, if `groups.json` references skills missing from
`MANIFEST.json`, if a source has no commit SHA or a file has no blob hash, or if the pin set is
partial.

### After a re-pin: rebuild the generated surfaces (repo root)

The pin set is an *input*; the model-facing artifacts are generated from it (fetching each pinned
file once into `.cache/`) and must be rebuilt after every re-pin. The canonical, ordered sequence
— including the attestation and the gates CI actually enforces — is
[`.agents/skills/live-drift-resolution/SKILL.md`](../.agents/skills/live-drift-resolution/SKILL.md)
Step 1; run that, not a shorter version of it. In outline:

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

A re-pin is not resolved until it is **deployed** — the pinned URLs are compiled into the Worker,
so production keeps fetching the old commit until `npm run deploy` runs.

Two guard classes can fail the catalog build loudly — both mean "a human must reconcile,
nothing silently changes exposure":

- **Retirement guard** (`assertRetirementNamesResolve`, `scripts/build-catalog.mjs`): the
  deny-listed pinned skills (`RETIRED_ONBOARDING_SKILLS` in `scripts/exposure.mjs`, which holds
  `lumenloop-mcp-connect`) are matched by upstream NAME. If a sync renames or removes one, the
  build fails instead of silently un-retiring it: retire the new name, or drop the entry if the
  skill is gone. The unpinned partner family is listed separately in
  `RETIRED_PARTNER_ONBOARDING_SKILLS` (`scripts/exposure.mjs`), and `src/skills/scrub.ts` removes
  references to it at read time.
- **Orphaned description notes** (`scripts/description-notes.mjs`): catalog notes are exact-match
  data keyed on upstream tool, operation, or skill IDs. A rename orphans the note and fails every
  affected generator. Skill description overrides change only host discovery text and do not
  modify pinned source bytes. `codemode.skill.read` still applies its existing exposure scrub.

Eval coupling: `eval/skills-cases.json` grades skills routing. Cases whose target skill leaves
catalog exposure move to its inert `retiredCases` array (rationale + date), and the skills-lane
floor in `eval/gates.json` is re-baselined **in the same commit** with the decision recorded in
the round ledger ([`eval/EVALS.md`](../eval/EVALS.md) rule 1).

**Automated drift detection (CI):** the daily `refresh.yml` workflow runs
`node scripts/check-skills-drift.mjs`, which compares every pin in `MANIFEST.json` against upstream
— latest commit touching each GitHub source's pinned path, and a volatile-field-free re-projection
of the live stellarlight directory against `catalog.json`. Any drift fails the run and lands in the
same drift issue as the inventory checks. It is **detection only** — CI never runs `update.sh`,
because these skills are prompt input and upstream edits must be human-reviewed: on drift, run
`./update.sh` locally, read the skill diffs, re-pin, and commit. (Pinning by commit is exactly
what makes live fetching safe: an upstream edit cannot reach the model until someone re-pins.) The script also runs standalone
(`node scripts/check-skills-drift.mjs [--json]`, exit 1 on drift).

Requires an authenticated `gh` CLI, plus `jq`, `node`, `curl`, and `git`. **No API keys** — every
source is public, and keeping the re-pin credential-free is a deliberate publish-safety property
(see the Sources note above).

## Adding a source

A new source changes what the model reads. Treat it as an exposure decision, not a re-pin. The
Trustless Work admission is the worked example: its round ledger is
[`.agents/rounds/2026-09-16-trustless-work-acceptance.md`](../.agents/rounds/2026-09-16-trustless-work-acceptance.md).

Admission bar — answer each in the round's source review before any pin lands:

- The repository is public and names its license in a `LICENSE`/`NOTICE` file.
- The skills are Stellar-specific and do not duplicate an exposed skill
  (`research/skill-exposure-inventory.json`).
- The skills are reference content for the reader's own environment. They may describe credentials,
  paid calls, signing, writes, or network steps that the reader performs; serving them grants the
  sandbox no network access and authorizes none of those actions. Record any credential or
  supply-chain prompt that remains as accepted risk in `PIN-REVIEW.md`. `src/skills/scrub.ts` removes
  only references to non-exposed operations and retired skills at read time.
- A reviewer read every selected body: no instruction override, no literal credential, and no
  reference to a non-exposed operation or retired skill that the scrub would not remove.

Steps. The pin, catalog, fingerprint, and QA activation land in one admission PR; a new QA case
must already exist as `proposed` from an earlier commit (step 6).

1. Add a `pin_github` line to `update.sh` (with a pick list when the repo is multi-chain or mixed)
   and a row to the Sources table above. A new repo layout also needs selector and link code;
   Trustless Work needed the repo-root skill-dir mode.
2. Add the repo to `improvements/intake.json` (`services.skills.default.repos` and `sourceRepos`)
   and its license to `THIRD-PARTY-NOTICES.md`.
3. Run `./update.sh`, file the new skills in `groups.json`, and record the `sel:` digest in
   `PIN-REVIEW.md`. For a cherry-picked source, list every upstream sibling directory you do not
   pin under `groups.json` `unpinnedUpstream` with a reason; `check-skills-drift.mjs` enumerates a
   source only when that map is non-empty.
4. Add an `exposed` row per skill to `research/skill-exposure-inventory.json`
   (`test/skill-exposure-classification.test.ts` requires it).
5. Rebuild the generated artifacts as in
   [`live-drift-resolution`](../.agents/skills/live-drift-resolution/SKILL.md) Step 1.
6. Give every new exposed skill active QA battery coverage before the final gates: CI enforces
   `skill floor 1` per exposed skill, and a skills-routing case does not count. Each new case must
   already be committed as `proposed` in an earlier commit. Activate it in the admission PR after an
   independent `golden-truth` review, then run `npm run eval:qa:compile` and
   `npm run eval:qa:register`. A case in `eval/skills-cases.json` is additional routing coverage, not
   a substitute.
7. Pass the acceptance gates on the complete tree: `npm test`,
   `npm run eval:qa:lint -- --stale --enforce-floors`, and the routing comparison of that skill's
   Step 4. Expect the count contracts to move (`test/catalog.test.ts`, `test/skills.test.ts`,
   `test/search.test.ts`, the demo trace totals) and record the new catalog fingerprint in
   `eval/gates.json`. Numerical thresholds stay unchanged unless a separate decision changes them. A
   host description override (`scripts/description-notes.mjs`) or a search-admission change is its
   own routing decision with its own comparison.
8. Get an independent review from a reviewer who differs from both the author and the orchestrator
   (`AGENTS.md`), record it in a round ledger, and deploy with the owner's approval.

A candidate that is not admitted still needs a recorded decision — an open owner decision or a
work item in `.agents/TODO.md`, or a round ledger — so the directory snapshot never hides an unmade
choice.

## Source of truth

Each source's pin is recorded in [`MANIFEST.json`](./MANIFEST.json): a full commit SHA per GitHub
source plus a git blob hash per file. That pair is both the provenance record and the runtime
integrity contract. Re-run `update.sh` to reconcile with upstream.
