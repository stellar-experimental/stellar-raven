# Improvements resolution verification — 2026-09-03

## Scope and method

I acted as the distinct resolution verifier.
I did not change an improvement record, intake, index, code, or generated artifact.
I did not post a comment, make a paid call, or deploy.

I read the public Scout API and GitHub issue state directly.
All live Scout calls were free read-only requests.
`GET /api/status` returned `apiVersion: "1.9.23"` at `2026-09-03T15:53:07.822Z`.

I ran `rg -n --hidden -g '!.git/**'` for every requested id.
I also searched the active policy and documentation references for `getQualityReport` and `verifyClaim`.

## Candidate verdicts

| Finding | Independent live result | Upstream state | Verdict |
|---|---|---|---|
| `sls-073` | `vet-idea` returned eight project competitors, including `noether`, `stellars-finance`, `turbolong`, and `zenex`. | `Stellar-Light/stellarlight#1025` is closed as completed. | Fixed candidate. |
| `sls-077` | The request and response `claim.type` enums both contain `issued`. The issued EURC call returned `supported`. | `Stellar-Light/stellarlight#1086` is closed as completed. | Fixed candidate. |
| `sls-078` | The live route contract uses eight self-referential phrases. It excludes generic technical and operational questions. | `Stellar-Light/stellarlight#1087` is closed as completed. | Fixed candidate. |
| `sls-079` | `stellars-finance` now returns `Pre-Release` and a separate `deployment.network: testnet`. | No upstream issue exists. | Fixed candidate. |

None can run the resolver now.
Each finding still has a non-`fixed-upstream` status.
The three filed findings also lack the required Raven resolution comment.

## Fixed candidate evidence and resolution handoff

### `sls-073`

Live evidence:

- `GET /api/vet-idea?q=perpetuals%20%2F%20derivatives%20trading%20protocol%20on%20Stellar` at `2026-09-03T15:53:09.999Z` returned `vertical: null`, `gap: null`, `matchMode: scored`, eight project rows, and six repo rows.
- The project rows included `noether`, `stellars-finance`, `turbolong`, and `zenex`.
- The matching directory call at `2026-09-03T15:53:10.992Z` returned those four named rows.

Independent review evidence:

- This Terra verification repeated the original public call.
- It did not use the author transcript.
- Issue `#1025` is closed as completed since `2026-08-25`.
- Maintainer `theboycoder` documented four general retrieval fixes in comment `#issuecomment-5416306990`.

Resolving reference:

- `https://github.com/Stellar-Light/stellarlight/issues/1025`

References reviewed:

- Exact-id search found four files: the active finding, `improvements/INDEX.md`, and two round ledgers.
- The round ledgers are historical evidence and must remain.
- The finding and generated index entry are resolver targets.
- Result: references are reconciled after the required resolution comment and status update.

Required prerequisites:

1. Set the finding status to `fixed-upstream` with this dated evidence.
2. Post the resolver-generated Raven comment on `#1025`.
3. Commit the updated finding before the resolver runs.

Correct resolver command after those prerequisites:

```sh
npm run improvements:resolve -- --file improvements/stellar-light-scout/sls-073-perps-vetidea-project-consistency.md --live-recheck "2026-09-03T15:53:09.999Z Scout 1.9.23: original perps vet-idea trigger returned eight project competitors, including noether, stellars-finance, turbolong, and zenex, while vertical remained null." --review-evidence "Distinct Terra verifier independently replayed the original public trigger on Scout 1.9.23; issue #1025 is closed completed and maintainer comment 5416306990 documents the deployed general fix." --resolving-ref https://github.com/Stellar-Light/stellarlight/issues/1025 --references-reviewed --upstream-commented --dry-run
```

### `sls-077`

Live evidence:

- `GET /api/verify?type=issued&subject=EURC&auditor=Circle` at `2026-09-03T15:44:38.321Z` returned `claim.type: "issued"` and `verdict: "supported"`.
- Live OpenAPI `1.9.23` lists `audited`, `live`, `maintained`, and `issued` in both claim-type enums.

Independent review evidence:

- This Terra verification repeated the original issued-claim request and read the live response schema.
- Issue `#1086` is closed as completed since `2026-09-01`.
- Maintainer `theboycoder` states the response enum fix shipped in `1.9.13` in comment `#issuecomment-5486800978`.

Resolving reference:

- `https://github.com/Stellar-Light/stellarlight/issues/1086`

References reviewed:

- Exact-id search found eleven files.
- Historical round and audit records must remain.
- The active finding and index are resolver targets.
- `research/services/stellar-light.md`, `src/policy/scout-exposure.ts`, `test/catalog.test.ts`, and `eval/README.md` still say this response is incomplete or excluded.
- Result: not references-reviewed for deletion until those current behavior references are repaired and the exposure decision is re-baselined.

Required prerequisites:

1. Repair the current behavior references and decide exposure separately.
2. Set the finding status to `fixed-upstream` with this dated evidence.
3. Post the resolver-generated Raven comment on `#1086`.
4. Commit the updated finding before the resolver runs.

Correct resolver command after those prerequisites:

```sh
npm run improvements:resolve -- --file improvements/stellar-light-scout/sls-077-verify-issued-response-enum.md --live-recheck "2026-09-03T15:44:38.321Z Scout 1.9.23: the original issued EURC request returned claim.type issued and supported; live OpenAPI includes issued in both request and 200-response claim.type enums." --review-evidence "Distinct Terra verifier independently repeated the original public request and schema check on Scout 1.9.23; issue #1086 is closed completed and maintainer comment 5486800978 records the upstream fix." --resolving-ref https://github.com/Stellar-Light/stellarlight/issues/1086 --references-reviewed --upstream-commented --dry-run
```

### `sls-078`

Live evidence:

- Live OpenAPI `1.9.23` describes `getQualityReport` as a Scout and Stellar Light source-calibration operation.
- Its eight keywords are all self-referential.
- Its `notFor` list excludes generic protocol, SDK, and operational questions.
- The removed terms include standalone `trust`, `confidence in the data`, `coverage`, `health`, and `limitations`.

Independent review evidence:

- This Terra verification read the current public `x-routing` contract directly.
- Issue `#1087` is closed as completed since `2026-09-01`.
- Maintainer `theboycoder` records the eight-phrase route contract in comment `#issuecomment-5486801250`.

Resolving reference:

- `https://github.com/Stellar-Light/stellarlight/issues/1087`

References reviewed:

- Exact-id search found eleven files.
- Historical round and audit records must remain.
- The active finding and index are resolver targets.
- `research/services/stellar-light.md`, `src/policy/scout-exposure.ts`, `test/catalog.test.ts`, and `eval/README.md` still describe the broad capture as current.
- Result: not references-reviewed for deletion until those current behavior references are repaired and the routing re-baseline is complete.

Required prerequisites:

1. Re-run the local routing comparison with the now-selective operation.
2. Repair the current behavior references and decide exposure separately.
3. Set the finding status to `fixed-upstream` with this dated evidence.
4. Post the resolver-generated Raven comment on `#1087`.
5. Commit the updated finding before the resolver runs.

Correct resolver command after those prerequisites:

```sh
npm run improvements:resolve -- --file improvements/stellar-light-scout/sls-078-quality-report-routing-capture.md --live-recheck "2026-09-03 Scout 1.9.23: getQualityReport x-routing contains only eight Scout/Stellar Light source-calibration phrases and excludes generic technical, protocol, SDK, and operational questions." --review-evidence "Distinct Terra verifier independently read the live public routing contract on Scout 1.9.23; issue #1087 is closed completed and maintainer comment 5486801250 records the upstream fix." --resolving-ref https://github.com/Stellar-Light/stellarlight/issues/1087 --references-reviewed --upstream-commented --dry-run
```

### `sls-079`

Live evidence:

- `GET /api/projects/search?q=Stellars%20Finance&limit=8` at `2026-09-03T15:55:57.782Z` returned `stellars-finance`.
- The row returns `status: "Pre-Release"` and `statusBasis: "human-verified"`.
- The row also returns `deployment.network: "testnet"`.
- The deployment basis and source point to the operator bundle.

Independent review evidence:

- This Terra verification repeated the named project public trigger.
- The original `Live` label no longer reproduces.
- The separate deployment field makes the missing distinction explicit.

Resolving reference:

- No upstream issue or pull request exists.

References reviewed:

- Exact-id search found nine files.
- The active finding and index are resolver targets.
- Historical round and audit records must remain.
- `inventory/stellar-light.json` and `catalog/manifest.json` retain the upstream fixed-contract explanation.
- Those generated copies are intentional public-source provenance, not unresolved behavior.
- Result: references are reconciled after status update. Use `--upstream-comment-na`.

Required prerequisites:

1. Set the finding status to `fixed-upstream` with this dated evidence.
2. Commit the updated finding before the resolver runs.

Correct resolver command after those prerequisites:

```sh
npm run improvements:resolve -- --file improvements/stellar-light-scout/sls-079-project-status-deployment-conflation.md --live-recheck "2026-09-03T15:55:57.782Z Scout 1.9.23: original Stellars Finance trigger now returns Pre-Release with a separate human-verified deployment.network testnet field." --review-evidence "Distinct Terra verifier independently repeated the named-project public trigger on Scout 1.9.23; the prior Live/mainnet conflation no longer reproduces." --references-reviewed --upstream-comment-na --dry-run
```

## Older residual contracts

| Finding | Live Scout 1.9.23 evidence | Upstream state | Result |
|---|---|---|---|
| `sls-023` | RWA query returned 61 rows. Only one row had `products`; no row had `assets`. DTCC is correctly `Development`, but its generic deployment is `unknown` and assets remain absent. | `#494` is closed as completed. Its latest maintainer comment states product deployment remains separate work. | Still reproduces. Keep active. |
| `sls-024` | Slender, Laina, K2 Lend, and OrbitCDP have status provenance. K2 Lend has no supported network. All four have `deployment.network: unknown` and `products: null`. | `#494` is closed as completed. | Still reproduces. Keep active. |
| `sls-029` | Band, DIA, RedStone, and Lightecho have better project and deployment facts. `products` is absent for Band, DIA, and RedStone. `oracleDeployments` and `deployments` are absent for all four. | `#514` and consolidated `#742` are closed as completed. They record this model as an accepted absence, not a deployed fix. | Still reproduces. Keep active. |
| `sls-033` | Exact `type=Wallet` returned 71 unique rows. Nine rows have null `productKind`. Only 33 rows have nonempty `availability`. No row has a nonempty `canonicalSlug`. | `#519` and consolidated `#742` are closed as completed. | Still reproduces. Keep active. |

These four findings are not resolver candidates.

## Resolution preparation implementation (2026-09-03)

This implementation prepared `sls-073`, `sls-077`, `sls-078`, and `sls-079`.
It did not run `npm run improvements:resolve`.
It did not post an external comment.

| Finding | Status | Dated live evidence added | Current-reference result |
| --- | --- | --- | --- |
| `sls-073` | `fixed-upstream` | `2026-09-03T15:53:09.999Z`: the original perpetuals call returned eight project competitors and six repos. | No current reference needed repair. |
| `sls-077` | `fixed-upstream` | `2026-09-03T15:44:38.321Z`: the issued EURC claim returned `issued` and `supported`; both 1.9.23 enums include `issued`. | All current references now state that a separate accepted-surface routing decision excludes verify. |
| `sls-078` | `fixed-upstream` | `2026-09-03`: Scout 1.9.23 has eight self-referential quality phrases and `notFor` generic technical, protocol, SDK, and operational questions. | All current references now identify the 90 captures as a Raven response-schema keyword residual. |
| `sls-079` | `fixed-upstream` | `2026-09-03T15:55:57.782Z`: Stellars Finance returned `Pre-Release`, `human-verified`, and `deployment.network: testnet`. | No current reference needed repair. |

The dated 2026-08-27 `eval/README.md` record remains unchanged.
The dated audit and round records remain unchanged.
The generated index now lists all four findings as `fixed-upstream`.

The existing general Raven scoring TODO now owns the `sls-078` local residual.
It names the 90 `scout.getQualityReport` captures.
It keeps `GET /api/quality` excluded until a general repair passes review.
It prohibits a duplicate routing TODO and an upstream successor.
The separate deferred routing-change TODO remains unchanged.

### Verification

| Command | Result |
| --- | --- |
| `npm run improvements:index` | Passed. Generated index reports 68 findings. |
| `npm run improvements:lint` | Passed. 68 findings. |
| `npm run improvements:lint -- --live` | Passed after the network-enabled retry. The sandbox-only attempt could not access GitHub. |
| `npm run improvements:probes` | Passed after the network-enabled retry. Six probes ran and all six were recurring. |
| `./node_modules/.bin/vitest run test/improvements-lint.test.ts test/improvements-run-probes.test.ts test/catalog.test.ts test/catalog-guards.test.mjs` | Passed. Four files and 55 tests passed. |
| `git diff --check` | Passed. |
