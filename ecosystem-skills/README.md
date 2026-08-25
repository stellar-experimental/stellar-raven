# Stellar/Soroban ecosystem skills — pin set

A version-pinned **reference** to the **Stellar/Soroban agent skills** (Claude-Code-style
`SKILL.md` playbooks) published across the ecosystem — LumenLoop, OpenZeppelin, the Stellar
Development Foundation (SDF), and Stellar Light — plus a snapshot of the broader
[stellarlight.xyz](https://stellarlight.xyz/skills) ecosystem **directory**.

**Skill bodies are not stored here.** This directory holds their addresses: a commit SHA per
source and a path + git blob hash per file. Everything that needs the text — the catalog build,
the super-spec build, this directory's own index, and the Worker at read time — fetches it from
upstream at the pinned commit and verifies it against the pinned hash. Bytes that do not match
are refused, not used. See `THIRD-PARTY-NOTICES.md` at the repo root.

In **this** repo the pin set is what the unified catalog builds from: each skill becomes a
searchable catalog entry, and each of its `##` sections becomes an exposed exact-id entry with
`searchable: false` — readable via `skill.read`, out of search since the 2026-07-13 skills-form
A/B (see `PLAN.md` §3) — subject to the manifest allowlist.

## Layout

```
ecosystem-skills/
├── MANIFEST.json    # THE ARTIFACT: per-source pinned commit + per-file path/size/git-blob-sha
├── INDEX.md         # AUTO-GENERATED themed directory (name + description + source + size), linked upstream
├── groups.json      # theme → skill-id mapping that drives INDEX.md grouping
├── catalog.json     # full snapshot of the stellarlight.xyz/api/skills directory (42 entries)
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
| `stellar-dev` | [`stellar/stellar-dev-skill`](https://github.com/stellar/stellar-dev-skill) `skills/` | 7 SDF developer skills (soroban, dapp, data, assets, agentic-payments, standards, zk-proofs) | `gh` tree listing @ pinned commit |
| `stellar-light` | [`Stellar-Light/stellar-scout`](https://github.com/Stellar-Light/stellar-scout) (root) | 1 ecosystem-analyst skill | `gh` tree listing @ pinned commit |
| _catalog_ | [`stellarlight.xyz/api/skills`](https://stellarlight.xyz/api/skills) | 42-entry ecosystem directory (sdf / stellarlight / lumenloop / external) | `curl` snapshot → `catalog.json` (NOT downloaded as skills) |

Every source is **public**, and each source's upstream `LICENSE`/`NOTICE` file names are recorded
in `MANIFEST.json` (`license_files`) at the same pinned commit — see `THIRD-PARTY-NOTICES.md` at
the repo root for the license map.

The LumenLoop API exposes 14 skills total (`GET /v1/skills`): the 8 public ones (identical to the
GitHub repo) and 6 partner-set ones. Only the public set is mirrored. The partner set (the
`lumenloop-api-*` onboarding family, served from a private repo via a credentialed archive
endpoint) was retired from catalog exposure 2026-07-03 and its mirror source was **removed
entirely 2026-07-06**: partner-tier content must not live in this public repo, and this mirror
staying credential-free is what guarantees future (including agent-run) re-pins can never pull it
back in. The partner skills survive only as name-only stubs in `inventory/lumenloop.json` so the
`/v1/skills` union stays observable.

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
  re-running `update.sh` would not find it. `check-skills-drift.mjs` therefore lists every unpinned
  upstream skill dir on any drift of a cherry-picked source, making "we skipped these" a decision
  someone makes rather than an omission nobody sees.
- **The ecosystem is bigger than what we mirror.** `catalog.json` captures the full stellarlight
  directory — including SDKs/MCP servers/CLIs that aren't `SKILL.md` skills — so the map of "what
  exists" stays complete without dragging in non-skill artifacts. `build-index.mjs` reads this
  directory directly instead of storing a second projection in `MANIFEST.json`.
- **Swap atomically.** `update.sh` stages the whole pin set in a temp tree and only swaps
  `MANIFEST.json` / `catalog.json` into place on full success. A mid-run failure leaves the
  existing pins untouched — it never produces a half-written manifest.
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
`build-index.mjs`. It fails closed at every step: a source it cannot resolve, a directory it
cannot fetch, or a body diff it cannot print aborts the run before the swap, so a partial or
mixed-age pin set is never written. After a re-pin, check the output for any **Uncategorized**
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
  deny-listed skills (`RETIRED_ONBOARDING_SKILLS` — now only `lumenloop-mcp-connect`; the
  lumenloop-api onboarding family was retired 2026-07-03 and then removed from the mirror
  entirely 2026-07-06, surviving only in the scrub regex in `src/skills/scrub.ts`) are pinned by upstream NAME. If a
  sync renames or removes one, the build fails instead of silently un-retiring it: retire the
  new name, or drop the entry if the skill is gone.
- **Orphaned description notes** (`scripts/description-notes.mjs`): catalog notes are exact-match
  data keyed on upstream tool/operation names; a rename orphans the note and fails both builders.

Eval coupling: `eval/skills-cases.json` grades skills routing. Cases whose target skill leaves
catalog exposure move to its inert `retiredCases` array (rationale + date), and the skills-lane
floor in `eval/gates.json` is re-baselined **in the same commit** with the decision recorded in
the round ledger (EVALS.md rule 1).

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

## Source of truth

Each source's pin is recorded in [`MANIFEST.json`](./MANIFEST.json): a full commit SHA per GitHub
source plus a git blob hash per file. That pair is both the provenance record and the runtime
integrity contract. Re-run `update.sh` to reconcile with upstream.
