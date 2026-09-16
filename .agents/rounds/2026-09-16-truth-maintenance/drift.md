# Live drift audit for issue #141

Date: 2026-09-16

## Verdict

Reject the combined candidate.

Issue #141 remains open.

The candidate is not a mechanical provenance update.

The candidate changes the operation surface, routing text, schemas, Docs routing keywords, and pinned skill content.

The unchanged routing gate fails only on the new manifest fingerprint.

The strict legacy totals also regress against the accepted totals.

The skills top-three total also regresses.

The gate does not list either numerical movement as a floor failure.

The totals and individual movements need separate interpretation.

The new RWA operation still captures unrelated requests.

The candidate also lacks the required skill-pin review entry.

That missing entry is an acceptance gate.

It is not rejection evidence.

No policy edit, gate edit, baseline edit, source acceptance, release, or issue action occurred.

## Scope and authority

This lane used these instructions and runbooks:

- `AGENTS.md`
- `PLAN.md`
- `ARCHITECTURE.md`
- `.agents/skills/truth-maintenance/SKILL.md`
- `.agents/skills/live-drift-resolution/SKILL.md`
- `.agents/skills/improvements-pipeline/SKILL.md`
- `improvements/README.md`

The user requested parallel agents for the audit.

The coordinator prohibited nested agents for this lane.

Other coordinator lanes supplied the parallel coverage.

This lane performed no independent agent review.

The separate improvements lane owns full finding and handoff review.

This report does not make improvements lifecycle conclusions.

## Fixed refs and live state

| Item | Exact value |
|---|---|
| Required base | `ac1769f75f72ba41622534f5f53b9c8944aeb69d` |
| Base subject | `Clarify evaluation snapshots and preserve cleanup review safeguards` |
| Local base branch | `docs/cleanup-current-guidance` |
| GitHub `main` | `722eef5f2a81845ebdd8206e17ee100344eabd58` |
| GitHub `main` date | `2026-09-14T21:54:54Z` |
| Issue | `stellar-experimental/stellar-raven#141` |
| Issue state | `OPEN` |
| Issue updated | `2026-09-16T06:44:53Z` |
| Latest drift run | `35065087661` |
| Drift run result | `failure` |
| Drift run head | `722eef5f2a81845ebdd8206e17ee100344eabd58` |

Authenticated GitHub reads used `/opt/homebrew/bin/gh api`.

The audit made no GitHub write.

## Repository population context

GitHub listed two repository branches.

| Branch | SHA | Protected |
|---|---|---|
| `main` | `722eef5f2a81845ebdd8206e17ee100344eabd58` | yes |
| `docs/cleanup-current-guidance` | `ac1769f75f72ba41622534f5f53b9c8944aeb69d` | no |

GitHub listed two open pull requests.

| PR | Head | State relevant to this audit |
|---|---|---|
| #156 | `ac1769f75f72ba41622534f5f53b9c8944aeb69d` | Mergeable and clean. Five observed check runs succeeded. |
| #157 | `b447ff403f82734a0297b56c78a1a5515aa1f824` | Mergeable but blocked. The head has no check rollup. |

PR #156 supplies the required audit base.

This audit did not verify the repository's required-check rules.

PR #157 does not affect this candidate.

The separate repository lane owns deeper PR review.

## Retained worktree manifest

The audit created this detached worktree:

`/private/tmp/stellar-raven-drift-0916.mOmBFJ/repo`

Owner: `rv-drift-0916`.

Creation command:

```sh
git worktree add --detach /private/tmp/stellar-raven-drift-0916.mOmBFJ/repo ac1769f75f72ba41622534f5f53b9c8944aeb69d
```

The worktree remains detached at the required base.

The parent must review it before deletion.

The lane reused the shared `node_modules` directory through a symlink.

Both lockfiles had this SHA-256:

`cc2158816188d52686358f25b1c7e8294b940b58c5fceee09660f9f78efb7474`

The lane linked `.env` for approved scripts only.

The scripts did not print credential values.

The following table records a mid-round snapshot.

The two other-lane temporary worktrees are now removed.

| Path | HEAD | Ownership in this lane | Action |
|---|---|---|---|
| `/Users/kalepail/Desktop/stellar-raven-codemode` | `ac1769f75f72ba41622534f5f53b9c8944aeb69d` | Shared checkout | Preserved |
| `/private/tmp/raven-audit-2026-09-16/base-worktree` | `722eef5f2a81845ebdd8206e17ee100344eabd58` | Another lane | Untouched |
| `/private/tmp/raven-audit-2026-09-16/pr-157-worktree` | `b447ff403f82734a0297b56c78a1a5515aa1f824` | Another lane | Untouched |
| `/private/tmp/stellar-raven-drift-0916.mOmBFJ/repo` | `ac1769f75f72ba41622534f5f53b9c8944aeb69d` | This lane | Retained |

The current registry contains only the shared checkout and `rv-drift-0916` worktree.

## Exact regeneration commands

The first two network commands failed inside the restricted sandbox.

Both failures reported `ENOTFOUND`.

The approved reruns succeeded outside that network boundary.

```sh
node scripts/refresh-inventory.mjs
node scripts/check-skills-drift.mjs
./ecosystem-skills/update.sh
node scripts/check-mirrors.mjs --fetch
node scripts/check-pin-review.mjs --base ac1769f75f72ba41622534f5f53b9c8944aeb69d
node scripts/build-catalog.mjs
npm run micro-map:build
npm run spec:build
node eval/plan/build-op-classes.mjs
npm run eval:compile
npm run eval:routing -- --gate
npm run secrets:scan -- --tree
```

The inventory refresh reported these facts:

- `inventory/stellar-docs.json` stayed unchanged.
- `inventory/stellar-docs-titles.json` changed.
- `inventory/stellar-light.json` changed.
- `inventory/lumenloop.json` stayed unchanged.

## Candidate artifact manifest

The candidate contains nine tracked modifications.

`git diff --check` passed.

| Artifact | SHA-256 |
|---|---|
| `catalog/manifest.json` | `1468d7c593d9bce81bd568297a88d4917b6ddb26f226f61b35f678a8d7c806bf` |
| `ecosystem-skills/INDEX.md` | `65098d1dcdf3f993c12b12cd32f944a95db0a86c3fe62f9ebe25b08f9c6a0f19` |
| `ecosystem-skills/MANIFEST.json` | `90d701c8a0fd216560d6d8c5a3a6e376fa796ee19aaabe531324346f4990b6ec` |
| `ecosystem-skills/catalog.json` | `75dc74feca84f6f837e598d92b0a0eeaf83e5814d4435af555a403332b440153` |
| `eval/plan/op-classes.json` | `0f3b603263daf74e35e0bf0baa5ae8522aa602b764b606ff50c1d2380f0d47eb` |
| `inventory/stellar-docs-titles.json` | `a2d5ce925dd06d750b5bce3b8737419df7be486e503a7b3882ac0fd0f017c7c4` |
| `inventory/stellar-light.json` | `2dbcd893180569b1c9e131f155ae73836dc89601d873677dcc5187a973de2d1f` |
| `specs/super-spec.json` | `be1c98f496e64390c66a9089bb33b99cdac13dbab817bc1059f035d4b8bc283c` |
| `src/mcp/micro-map.ts` | `920e3ba0b8e2b3cb9b1f973d709ea625213bf61fee6c42b8abedee39a44e760f` |

The candidate stat is:

```text
9 files changed, 9010 insertions(+), 2789 deletions(-)
```

The coordinator ran the secrets scan in the retained candidate.

`npm run secrets:scan -- --tree` exited with status 0.

The private usage boundary passed.

The tree scan and Gitleaks found no leaks.

## Service classification

### Lumenloop

The live inventory is unchanged.

Classification: no drift.

### Stellar Docs settings

The live settings inventory is unchanged.

Classification: no drift.

### Stellar Docs titles

The title count changes from 650 to 651.

The added page is:

`/docs/data/analytics/public-dashboards` — `Public Dashboards`

The catalog adds `public` and `dashboards` to `stellarDocs.search_rpc_horizon_data_docs`.

Classification: routing-relevant text data.

This change needs isolated routing evidence before acceptance.

### Scout

Scout changes from OpenAPI `1.9.1` to `1.9.52`.

The operation count changes from 37 to 38.

The complete path-method comparison found one added operation.

Added:

- `GET /api/rwa` as `scout.getRwaAssets`

Removed:

- none

Thirty existing operation objects changed.

Seven existing operation objects stayed identical.

Eighteen existing operations changed routing text.

| Path and method | Operation ID |
|---|---|
| `GET /api/analyze` | `scout.analyzeEcosystem` |
| `GET /api/audits` | `scout.listAudits` |
| `GET /api/builders` | `scout.getBuilders` |
| `GET /api/changelog` | `scout.getChangelog` |
| `GET /api/changes` | `scout.getChanges` |
| `GET /api/clusters` | `scout.getClusters` |
| `GET /api/contracts` | `scout.listContracts` |
| `GET /api/leaderboard` | `scout.getLeaderboard` |
| `GET /api/partners` | `scout.getPartners` |
| `POST /api/partners/match` | `scout.matchPartners` |
| `GET /api/partners/{slug}` | `scout.getPartner` |
| `GET /api/projects/resolve` | `scout.resolveProject` |
| `GET /api/projects/search` | `scout.searchProjects` |
| `GET /api/quality` | `scout.getQualityReport` |
| `GET /api/repos/explain` | `scout.explainRepo` |
| `GET /api/repos/search` | `scout.searchRepos` |
| `GET /api/research` | `scout.searchResearch` |
| `GET /api/rfps` | `scout.getRfps` |

Twelve operations changed only outside the routing tuple.

| Path and method | Operation ID |
|---|---|
| `GET /api/feedback` | `scout.getFeedbackSchema` |
| `GET /api/hackathon-brief` | `scout.hackathonBrief` |
| `GET /api/hackathons/builds` | `scout.searchHackathonBuilds` |
| `GET /api/hackathons/compare` | `scout.compareHackathons` |
| `POST /api/partners/assistant` | `scout.partnerAssistant` |
| `POST /api/partners/onboard` | `scout.partnerOnboard` |
| `POST /api/partners/submit-listing` | `scout.submitPartnerListing` |
| `GET /api/repos/trust` | `scout.getRepoTrust` |
| `GET /api/scf-pitch` | `scout.scfPitch` |
| `GET /api/skills/{name}` | `scout.getSkill` |
| `GET /api/verify` | `scout.verifyClaim` |
| `GET /api/vet-idea` | `scout.vetIdea` |

The complete `components` comparison found nine changed schemas.

- `Builder`
- `HackathonDetailResponse`
- `LeaderboardProject`
- `Meta`
- `Partner`
- `PartnersResponse`
- `Project`
- `Repo`
- `Stablecoin`

No component was added or removed.

Four shared parameters stayed identical.

Classification: operation-surface, routing-text, and schema drift.

## Exposure and generated consumers

The base manifest has 253 entries.

The candidate manifest has 254 entries.

| Family | Base | Candidate |
|---|---:|---:|
| Lumenloop operations | 18 | 18 |
| Scout operations | 30 | 31 |
| Stellar Docs operations | 12 | 12 |
| Whole skills | 19 | 19 |
| Skill sections | 174 | 174 |

The only added manifest ID is `scout.getRwaAssets`.

No manifest ID was removed.

`src/policy/scout-exposure.ts` does not exclude `GET /api/rwa`.

ADR-0003 therefore makes the new operation callable.

The existing work queue says to keep this operation excluded.

That instruction appears in `.agents/TODO.md:242-250`.

Acceptance check 8 appears in `.agents/TODO.md:266-267`.

The candidate does not satisfy that check.

The super-spec changes from 64 to 65 callable paths.

The candidate has these callable counts:

| Family | Callable paths |
|---|---:|
| Lumenloop | 18 |
| Scout | 31 |
| Skills | 4 |
| Stellar Docs | 12 |

The operation classes change from 60 to 61 operations.

The builder classifies `scout.getRwaAssets` as `detail`.

The micro-map changes the Scout count from 30 to 31.

## Routing gate and exact totals

The routing result is:

`/private/tmp/stellar-raven-drift-0916.mOmBFJ/repo/eval/results/routing-2026-09-16T18-13-18-199Z.json`

Its SHA-256 is:

`b734b52af409cf01f2bbfbbb69f240f083be8f4d2eb81f8e60acec0ff99bd3a8`

The run time is `2026-09-16T18:13:18.200Z`.

The unchanged gate failed.

Exact failure:

```text
catalog/manifest.json SHA-256 does not match the committed gate evidence — re-baseline gates.json explicitly
```

This fingerprint mismatch is the only listed gate failure.

The gate does not list a numerical floor failure.

No gate or baseline changed.

The other three committed input hashes stayed identical.

| Lane | Accepted | Candidate | Delta |
|---|---|---|---|
| Legacy top-1 | 213 | 211 | -2 |
| Legacy top-3 | 279 | 278 | -1 |
| Legacy top-5 | 312 | 312 | 0 |
| Skills top-1 | 16 | 16 | 0 |
| Skills top-3 | 23 | 22 | -1 |
| Skills top-5 | 23 | 23 | 0 |
| Holdout top-1 | 10 | 11 | +1 |
| Holdout top-3 | 22 | 23 | +1 |
| Holdout top-5 | 26 | 27 | +1 |
| Holdout forbidden captures | 11 maximum | 10 | -1 |
| Holdout passed | 21 accepted evidence | 23 | +2 |

The holdout gains do not resolve the separate legacy and skills movements.

These totals are comparisons with the accepted evidence totals.

They are not additional reported gate failures.

The legacy band permits bounded movement.

The skills gate enforces the top-one floor, which remains 16.

The holdout candidate meets its committed floors and capture ceiling.

Each individual routing movement still needs intent review.

The extended lane produced `88/109/114` for top-1, top-3, and top-5.

The committed gate does not define an extended-lane floor.

The protocol-history diagnostic produced `7/8` at top-five.

It captured `3/4` controls at top-five.

The diagnostic remained red.

This audit does not attribute that diagnostic without a separate control run.

## Current RWA capture population

The audit rechecked all current result rows.

The coordinator independently repeated this count.

Independent evidence:

`.agents/rounds/2026-09-16-truth-maintenance/drift-independent-routing.json`

Its SHA-256 is:

`f7162f5e07c196cab7dae84e26c9063113f3b9b5290ff442bab6fb82dcc777d2`

The primary population contains 495 rows.

It combines legacy, extended, skills, and protocol-history rows.

`scout.getRwaAssets` appears in 51 primary top-five lists.

It ranks first in 11 primary lists.

The holdout population contains 49 rows.

`scout.getRwaAssets` appears in nine holdout top-five lists.

It ranks first in two holdout lists.

The complete combined count is 60 of 544 lists.

This count matches the September 14 candidate result.

The primary top-one rows follow.

| Case | Query classification |
|---|---|
| `q-asset-clawback-decentralization` | Clawback and censorship resistance |
| `q-asset-issue-asset-howto` | General asset issuance |
| `q-defi-rwa-overview` | Direct RWA request |
| `q-defi-rwa-scf-similar` | Direct RWA request |
| `q-eco-stellar-rwa-stablecoin-volume` | Direct RWA request |
| `q-hist-franklin-templeton-benji` | Direct RWA request |
| `q-soroban-sac-balance-storage` | SAC balance storage |
| `q-soroban-wasm-size-limit` | WASM size limit |
| `q-aas-issuer-fees-supply-cap-freeze` | Issuer protocol controls |
| `q-crp-tokenize-personal-rwa` | Direct RWA request |
| `q-ti-fetch-all-balances-classic-sac` | Balance enumeration |

The holdout top-one rows follow.

- `q-holdout-b-01-sep-asset-metadata`
- `q-holdout-b-02-asset-metadata-standard`

The current output still shows unrelated top-one captures.

Examples include asset issuance, SAC balances, WASM limits, and metadata standards.

### Complete top-five capture IDs

Legacy, 38:

`q-asset-clawback-decentralization`, `q-asset-deploy-sac-cli`, `q-asset-issue-asset-howto`, `q-asset-rwa-tokenized-freshness`, `q-asset-sac-functions`, `q-asset-trustline-vs-sac`, `q-asset-two-account-issuer`, `q-builder-by-scf-tier`, `q-comp-auth-flags-overview`, `q-comp-sac-inherits-flags`, `q-comp-sep8-number-lookup-no-deepresearch`, `q-comp-sep8-regulated-assets-approval-server`, `q-defi-benji-franklin-templeton`, `q-defi-blend-repo`, `q-defi-rwa-overview`, `q-defi-rwa-scf-similar`, `q-defi-soroswap-content`, `q-defi-wisdomtree-crdt`, `q-eco-2025-defi-launches`, `q-eco-stellar-rwa-stablecoin-volume`, `q-edge-deep-comprehensive-sep-audit`, `q-hist-franklin-templeton-benji`, `q-hist-remittance-corridors`, `q-infra-friendbot-fund-testnet`, `q-infra-hubble-vs-rpc-layer`, `q-infra-simulate-transaction-howto`, `q-infra-what-is-stellar-rpc`, `q-rwa-projects-tokenizing-stellar`, `q-scf-academic-research-grant`, `q-sep-8-regulated-assets`, `q-sep-clawback-prereq-flag`, `q-soroban-add-signer-smart-wallet-howto`, `q-soroban-reentrancy`, `q-soroban-sac-balance-storage`, `q-soroban-sac-what-is`, `q-soroban-simulate-resource-fee`, `q-soroban-wasm-size-limit`, `q-tool-python-sdk`.

Extended, 11:

`q-aas-burn-clawback-redemption-mechanics`, `q-aas-issuer-fees-supply-cap-freeze`, `q-crp-tokenize-personal-rwa`, `q-sor-classic-dex-from-contract`, `q-sor-contract-as-claimable-arbiter`, `q-sor-contract-trustlines-c-address`, `q-sor-recurring-escrow-patterns`, `q-sor-sac-introspection`, `q-ti-enumerate-all-contracts`, `q-ti-fetch-all-balances-classic-sac`, `q-ti-historical-pointintime-balances`.

Skills, two:

`q-skill-assets-stablecoin-issuance`, `q-skill-eco-scout-rwa-landscape`.

Protocol-history, zero.

Holdout, nine:

`q-holdout-a-09-oz-pausable-ownable`, `q-holdout-a-13-zk-replay`, `q-holdout-a-15-resource-profiling`, `q-holdout-b-01-sep-asset-metadata`, `q-holdout-b-02-asset-metadata-standard`, `q-holdout-b-03-clawback-stablecoin`, `q-holdout-b-04-regulated-asset`, `q-holdout-b-05-classic-or-sep41`, `q-holdout-b-06-sac-or-sep41`.

## RWA contract state

The live OpenAPI version is `1.9.52`.

The request enum includes these values:

- `live`
- `issued-single-holder`
- `deployed-no-supply`
- `not-found`

The response enum includes the same four values.

The old upstream enum defect is fixed.

That fix does not accept the Raven routing behavior.

## Skill pin results

The pin checker found one current drifted source.

| Source | Accepted pin | Upstream pin | Result |
|---|---|---|---|
| `stellar-light` | `d25b9f6bd842159b5a33aa6125ecb62373c2d8b5` | `3b587aa9f23d21fc572f6e93cb6d11031dbc24e6` | drift |

The other four source checks passed.

The update changed two pinned prompt files.

| File | Old blob | New blob |
|---|---|---|
| `SKILL.md` | `54f214d228b665bd1f0579ed79dd39226dd9621e` | `de459e784e9e927f42662aa53ab22c8dedab04b7` |
| `references/api-reference.md` | `14f9c9c817ff853089e42333e35a7d60ca7a258a` | `5035cc98f1e0a7339ab9837e2dee19e7da0616cb` |

The audit read the complete printed body diff.

The changes clarify RFP windows, repository scoring, null hackathon totals, and repository views.

They also add the complete RWA reference.

The candidate catalog serves this skill body:

```text
https://raw.githubusercontent.com/Stellar-Light/stellar-scout/3b587aa9f23d21fc572f6e93cb6d11031dbc24e6/SKILL.md
blob: de459e784e9e927f42662aa53ab22c8dedab04b7
sha256: 9f8a107a85b8796b18d6c7803cd14d9af16e66ff288726b551267bd66811b36c
```

`node scripts/check-mirrors.mjs --fetch` passed.

It fetched and verified all 44 pinned files without the cache.

`node scripts/check-pin-review.mjs` failed as designed.

Exact missing review selection:

`stellar-light 3b587aa9f23d sel:339145ff9f53`

No pin review entry was added.

This failure blocks acceptance.

## Runner intersection

The complete runner registry has one runnable skill.

`skills.lumenloop.stellar-ecosystem-digest` declares these operations:

- `lumenloop.search_content_semantic`
- `lumenloop.list_documents`
- `lumenloop.find_content_by_entity`

The touched operation population contains Scout operations only.

The runner intersection is empty.

The Docs title change affects routing keywords, not a declared runner operation.

The skill pin change affects a non-runnable skill.

The runbook therefore does not require a live runner smoke.

No Wrangler process started.

## Golden and documentation effects

The active QA corpus contains no direct `scout.getRwaAssets` reference.

It contains no direct `issued-single-holder` reference.

The routing cases remain byte-identical to the committed gate evidence.

The dated decision in `eval/README.md:1132-1150` still rejects the Scout absorb.

The current work queue retains the stronger acceptance contract.

The candidate requires no golden edit during this audit.

A future acceptance must add coverage only after the exposure decision.

The Docs title change affects one routing keyword list.

It does not change a Docs operation schema.

The skill pin changes model-read prompt content.

It requires separate review even if service routing later passes.

## Live health checks

The audit checked each health endpoint separately.

```sh
curl -sS -w '\nHTTP_STATUS=%{http_code}\n' https://raven.stellar.org/health
```

Result:

```json
{"status":"ok","service":"stellar-raven-codemode"}
```

HTTP status: `200`.

```sh
curl -sS -w '\nHTTP_STATUS=%{http_code}\n' https://raven.stellar.org/health/skills
```

Result:

```json
{"ok":true,"checkedAt":"2026-09-16T18:07:39.105Z","checked":42,"ms":9817,"error":null}
```

HTTP status: `200`.

Production health does not prove candidate acceptance.

The health endpoints do not expose the exact production catalog identity.

This report makes no production catalog identity claim.

## Limitations

The candidate combines three independent inputs.

They are Scout `1.9.52`, one Docs title, and the Stellar Light pin.

The combined routing result does not isolate each input.

This lane did not run typecheck, `npm test`, `npm run test:smoke`, or `npm run build`.

The current blockers already establish rejection.

No commit or release was in scope.

This lane did not perform an independent review.

The coordinator prohibited nested agents for this lane.

The user requested parallel agents across the audit.

The separate improvements lane owns full live lint, probes, upstream refs, and inbound handoffs.

Two already-running improvements commands completed before that ownership clarification.

This report makes no lifecycle decision from those outputs.

## Required next actions

1. Keep issue #141 open.
2. Keep the accepted Scout surface at `1.9.1`.
3. Do not rebaseline the routing gate for this candidate.
4. Isolate Scout `1.9.52` from the Docs title change and the skill pin.
5. Run an RWA-excluded Scout ablation with every current gate unchanged.
6. Apply all eleven checks in `.agents/TODO.md:257-270`.
7. Make an explicit exposure decision before `GET /api/rwa` becomes callable.
8. Evaluate the Docs title change as a separate routing candidate.
9. Review the two skill-body diffs before any new pin attestation.
10. Run a distinct independent review after the candidate becomes acceptable.
11. Run typecheck, baseline tests, smoke tests, and build before release.
12. Obtain separate authority before commit, push, deploy, issue comments, or issue closure.

## Final status

Current combined candidate status: `REJECTED`.

Rejection evidence:

- unapproved `scout.getRwaAssets` exposure;
- current unrelated RWA captures;
- unaccepted routing movements requiring separate intent review;
- combined, unattributed Docs and pin changes.

Unmet acceptance-only gates:

- missing `stellar-light` pin review entry;
- missing independent review;
- deferred typecheck, baseline tests, smoke tests, and build.

The retained worktree contains all candidate artifacts for parent review.
