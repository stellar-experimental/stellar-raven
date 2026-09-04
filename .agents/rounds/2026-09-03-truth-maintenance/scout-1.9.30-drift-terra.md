# Scout 1.9.30 free drift audit

Date: 2026-09-04
Lane: Terra high
Scope: free, read-only Scout evidence. No paid model call ran. No issue was filed.

## Verdict

Do not ship Scout 1.9.30.

The upstream operation count is unchanged. The upstream routing and response
contracts changed. The generated 1.9.30 manifest fails the frozen routing
fingerprint check. The protocol-history diagnostic also has expired source
evidence. These facts do not permit a routing baseline move.

I restored the accepted 1.9.1 generated files. This commit contains this report only.

The earlier same-live-interval paired measurement is invalid. Scout changed from
1.9.23 to 1.9.30 during that interval. The present audit confirms that 1.9.30
has a different canonical OpenAPI identity. Do not use that pair as a Scout
release measurement.

## Identity evidence

The repository procedure uses `scripts/refresh-inventory.mjs`. It stores the
upstream document verbatim in `inventory/stellar-light.json`. The file SHA-256
is the repository identity. I also calculated a sorted OpenAPI SHA-256. That
second hash removes the volatile `fetchedAt` field from comparison.

| Surface | Version | Fetched at | Inventory SHA-256 | Sorted OpenAPI SHA-256 |
| --- | --- | --- | --- | --- |
| Accepted commit | 1.9.1 | 2026-08-28T12:50:57.417Z | `1a261c4a2e2172683e91a52ddc33b02ff41e74760c861dfacb29c60a8d8671b0` | `cce1091864cd41dee739f6b7b590b3c0a10b25b6bab76b9b69175f01efd753d4` |
| Rejected candidate | 1.9.23 | 2026-09-03T15:24:32.527Z | `1bfe9d6ada6518d834a3893bb9df039ed77e1a16499897af6bdcbed878c0fc4f` | `662a54f11b0ed1b027722d74fdc92b960cf5a7d7e975cc1fb1c273031a8d2320` |
| Live refresh | 1.9.30 | 2026-09-04T06:58:39.901Z | `0cbc081a11c3bf27000952cf97cf8cc03b1429d59dd05834cde5ad628b144d45` | `2acc43c45eab21156a61d242c0d35b82ec7f9894854a01a88426e310b0311571` |
| Earlier 1.9.30 capture | 1.9.30 | 2026-09-04T05:42:52.877Z | `ac9d9b258980436370ce798fa4e5f9db21e93b31e77d0fcedc3e96307427c918` | `2acc43c45eab21156a61d242c0d35b82ec7f9894854a01a88426e310b0311571` |

The two 1.9.30 captures have equal sorted OpenAPI hashes. Their file hashes
differ because `fetchedAt` differs. The live refresh therefore confirms the
earlier 1.9.30 contract.

The rejected 1.9.23 source is `/private/tmp/stellar-light-1.9.23.json`.
The earlier 1.9.30 source is
`/private/tmp/stellar-raven-upstream-ObAJaV/repo/inventory/stellar-light.json`.

## Regeneration and classification

`node scripts/refresh-inventory.mjs` could not refresh all services. It stopped
at the unavailable Lumenloop credential. It did not expose a credential. The
Scout-only command succeeded:

```text
node scripts/refresh-inventory.mjs --service stellar-light
node scripts/build-catalog.mjs
npm run micro-map:build
npm run spec:build
node eval/plan/build-op-classes.mjs
```

The generated 1.9.30 surface had 36 paths, 37 upstream operations, and 30
exposed Scout operations. The accepted surface has the same path and operation
counts. `GET /api/quality` and `GET /api/verify` remain excluded.

The accepted 1.9.1 to live 1.9.30 comparison has no added or removed operation.
It has 27 changed operation objects, 15 changed `x-routing` blocks, 21 changed
direct parameter or response schemas, and six changed shared schemas:
`HackathonDetailResponse`, `Meta`, `Partner`, `Project`, `Repo`, and
`Stablecoin`.

The changed operation objects are:

```text
GET /api/analyze
GET /api/audits
GET /api/builders
GET /api/changelog
GET /api/changes
GET /api/contracts
GET /api/feedback
GET /api/hackathon-brief
GET /api/hackathons/builds
GET /api/hackathons/compare
GET /api/leaderboard
GET /api/partners
POST /api/partners/assistant
POST /api/partners/match
POST /api/partners/onboard
POST /api/partners/submit-listing
GET /api/partners/{slug}
GET /api/projects/search
GET /api/quality
GET /api/repos/explain
GET /api/repos/trust
GET /api/research
GET /api/rfps
GET /api/scf-pitch
GET /api/skills/{name}
GET /api/verify
GET /api/vet-idea
```

The smaller rejected 1.9.23 to live 1.9.30 comparison has no added or removed
operation. It changes four direct operations and two shared schemas.

| Class | Changed contract |
| --- | --- |
| Routing and schema | `GET /api/analyze` adds analytics routing terms and response metadata. |
| Routing | `GET /api/audits` adds audit-history routing and examples. |
| Response | `GET /api/contracts` adds the `contractBasis` enum. |
| Response | `GET /api/repos/trust` adds the `publishes-contract-id` reason. |
| Shared response | `HackathonDetailResponse` adds prize and award details. |
| Shared response | `Project` adds product and lifecycle status-basis details. |

All four direct operations are exposed. The shared schemas affect exposed
`getHackathon` and `searchProjects`. This is mixed routing and contract drift.
It is not a mechanical inventory bump.

## Runtime, exposure, docs, and limits

The Scout adapter builds the documented HTTP request and returns successful JSON
unchanged. It does not translate these response fields. No deterministic runtime
patch is safe without accepted contract evidence.

No Scout operation belongs to a bundled runnable skill. The only bundled runner
uses Lumenloop operations. No runner schema change or runner smoke test applies.

`src/policy/scout-exposure.ts` still excludes quality and verification operations.
The drift does not justify an operation-specific exception. It does not justify
an exposure change.

`PLAN.md`, `research/services/stellar-light.md`, and `eval/README.md` correctly
state that committed Scout remains 1.9.1 and 1.9.23 was rejected. I did not
change them.

Exact searches found no golden or QA reference to `contractBasis`,
`publishes-contract-id`, `prizeUsd`, `awardName`, or `product-integration`.
`repo-activity` appears only as an unrelated golden subcategory. No golden edit
is safe.

The generated micro-map remained within its limit: about 1472 tokens against a
1500-token maximum. The family line was about 90 tokens against a 150-token
maximum. The generated 1.9.30 catalog had 252 entries. No manifest limit failed.

## Routing and protocol-history evidence

The generated 1.9.30 manifest SHA-256 was
`b942dbab5cf5aa624cd8e461f0c1dbe08d279e43d51b926f51fece6aa48451a9`.
`npm run eval:selftest` rejected it because the committed routing fingerprint is
the accepted 1.9.1 manifest SHA-256:
`b613201846076e9fbaa70edfee4f506841c7cf690265e69c8d07afde567f6729`.

The free 1.9.30 routing run reported legacy Scout top-1/top-3/top-5 values of
53.7/87.4/95.8 percent. It reported overall values of 62.7/82.5/92.3 percent.
The gate failed only because its manifest fingerprint was not committed. These
values are diagnostic only. They do not permit a baseline move.

After restoration, the accepted routing gate passed. It reported legacy Scout
top-1/top-3/top-5 values of 52.6/84.2/94.7 percent. It reported overall values
of 63.0/82.5/92.3 percent.

Both protocol-history v2 contracts are source-expired, even after restoration.
They expect manifest SHA-256
`4cd28f4bdfe8c73950e0a6d4dfa1a09dd2f82674859e93990fdd62daef24fe8b`.
The current accepted manifest SHA-256 is `b613201846076e9fbaa70edfee4f506841c7cf690265e69c8d07afde567f6729`.
The evaluator wrote `source-expired` and scored no question. I did not change
the frozen membership, source epoch, target scoring, or target routing fields.

This expiry is a separate limitation. It prevents a protocol-history score from
supporting a 1.9.30 decision. It does not justify a source-epoch refresh here.

## Active findings

I checked active Scout findings without changing their lifecycle state. The
new schemas do not resolve their recorded population defects.

- `sls-023`: `https://stellarlight.xyz/api/projects/search?q=real%20world%20asset&limit=100`
  returned 61 rows. One row had `products`; no row had `deployments` or `assets`.
  DTCC remained Development with an operator-announcement source and no deployment.
- `sls-024`: Slender, Laina, and OrbitCDP each retained a status basis and source.
  They had zero products and deployments. K2 Lend also had zero products and deployments.
- `sls-029`: Band, DIA, Redstone Finance, and Lightecho retained zero
  `oracleDeployments` and zero `deployments`. Lightecho had one product.
- `sls-033`: `https://stellarlight.xyz/api/projects/search?type=Wallet&limit=100`
  returned 71 rows. Sixty-two rows had `productKind`; 33 had `availability`.
  MXlet still had neither field. No row had `canonicalSlug`.
- `sls-039` remains declined upstream. The drift did not affect its provider-hosted
  TVL-history boundary.

These checks reproduce existing records. They do not establish a new defect.
No finding, TODO, policy record, or golden record is safe to add in this lane.

## Verification

| Command | Result |
| --- | --- |
| `npm run typegen` | Passed with local placeholder names only. |
| `npm run typecheck` | Passed. |
| `npm test` | Passed: 103 files and 1784 tests. |
| `npm run build` | Passed. |
| `npm run eval:selftest` | Passed after generated-file restoration. |
| `npm run eval:compile` | Passed: 338 legacy and 122 extended cases. |
| `npm run eval:qa:compile` | Passed: 500 cases. |
| `npm run eval:qa:lint -- --stale` | Passed with 62 existing warnings. |
| `npm run eval:routing -- --gate` | Passed after restoration. |
| `npm run eval:protocol-history` | No score. Both v2 contracts are source-expired. |
| `npm run improvements:lint` | Passed: 70 findings. |
| `npm run secrets:scan -- --tree` | Passed. |
| `git diff --check` | Passed. |

`npm run improvements:index:check` is not a defined package script. I did not
run the writing `improvements:index` script because this lane changes no finding.

## Exact next action

Keep the accepted 1.9.1 generated surface. Do not start either paid QA arm.

Before a new paired measurement, run the Scout-only refresh before and after
the interval. Record both inventory file SHA-256 values and sorted OpenAPI
SHA-256 values. Continue only when both identities match.

Then run an independent, free 1.9.30 routing and source-epoch review. Keep the
existing routing baseline frozen. Accept, reject, or revise the surface only
after that review has evidence. Do not add operation-specific scoring exceptions.
