# Issue #180 independent drift review

**Verdict: ACCEPT for the scoped candidate.**

The candidate passes the independent source, exposure, pin, and routing checks.
One bounded upstream documentation defect needs follow-up.
It does not block this pin acceptance.
This review does not accept a production deployment or close issue #180.

Reviewed on 2026-09-29 against HEAD `40a77c4e892236fca96f33bc8a8e2b8521e28588`.
The candidate manifest SHA-256 is `8e19480c0005dad0fb505bfd209e771e9457a8198c586ff7aaf9e89c0a1948a8`.
The reviewer derived the drift class before reading the pin-review note.
The reviewer did not read the coordinator ledger or comparison conclusions.
The author summary did not serve as proof.

## Independent classification

- Scout retains all 38 upstream path/method pairs.
- All complete operation objects and shared OpenAPI components match HEAD.
- OpenAPI changes affect only `info.description` and `info.version`.
- The description updates the rate-limit guidance.
- Inventory metadata also updates the changelog, timestamps, version, and status.
- Thus, Scout has metadata and documentation drift, without operation, schema, or routing-text drift.
- The two skill pins change model-readable content. They are runtime content changes.
- No selected skill or file was added or removed.

Evidence: `inventory/stellar-light.json:2`, `inventory/stellar-light.json:3344`, and `ecosystem-skills/MANIFEST.json:192,399`.

The manifest retains all 282 IDs and their order.
Only entry provenance and skill transports change.
Descriptions, input schemas, output schemas, routing fields, and searchable flags match HEAD.
The super-spec changes only four generated timestamp fields.
Its operation objects remain unchanged.

## Exposure and runtime impact

All 30 exposed Scout operations remain exposed.
`scout.getRwaAssets` remains absent.
The paid Lumenloop operations remain absent.
The direct catalog and Scout exposure guards pass.
The changed source bodies pass the read-time scrub and emitted-text guard.
The new Trustless Work references describe upstream services, not new Raven operations.

All 222 catalog file transports match the selected URLs, blob hashes, and SHA-256 values.
The checks used the bytes verified by the fresh upstream mirror check.
No runtime source or policy file changed.
The only runner declares three Lumenloop operations.
The changed-operation set has no intersection with that runner's declarations.
This candidate therefore does not require a runner projection change.

Evidence: `catalog/manifest.json`, `specs/super-spec.json`, `scripts/build-catalog.mjs:1096`, and `src/skills/runners/index.ts`.

## Skill-content review

I ran `scripts/diff-pins.mjs` against a temporary HEAD pin manifest.
Both sides resolved, and I read all ten changed file diffs.
The stellar-dev change adds Trustless Work to the ecosystem directory.
The Trustless Work changes add terminal-state rules, trustline checks, and token error codes.
They also remove `receiverMemo` from the V2 request examples.
The official V2 deploy and update schemas omit that field.

I found no new credential request, unrelated instruction, agent redirection, or unsafe signing instruction.
The new relative references resolve within the selected skill files.
The error-page defect below affects external documentation navigation.

The V1 terminal-state rules match these primary-source changes:

- [Single-release commit 22a0b23](https://github.com/Trustless-Work/trustlesswork-smart-contract-stellar/commit/22a0b23f71f7e716ca8e1cc20aaf645566641aab).
- [Multi-release commit 887182a](https://github.com/Trustless-Work/trustlesswork-smart-contract-stellar/commit/887182ace85f9c56d40bbea57573dfde23f98eb0).

Both commits add terminal-state guards and tests that permit updates during an open dispute.
The skill dates the V1 change and retains the earlier-deployment qualification.

The V2 source also supports the new rules and error numbers:

- [Single-release validator, lines 30–36](https://github.com/Trustless-Work/trustlesswork-smart-contract-stellar/blob/1d22d0c1b9c5788f4fd7184e42024bbe10303756/contracts/escrow/src/core/validators/milestone.rs#L30-L36).
- [Single-release error values, lines 74–75](https://github.com/Trustless-Work/trustlesswork-smart-contract-stellar/blob/1d22d0c1b9c5788f4fd7184e42024bbe10303756/contracts/escrow/src/error.rs#L74-L75).
- [Multi-release validator, lines 53–61](https://github.com/Trustless-Work/trustlesswork-smart-contract-stellar/blob/ab06d9c60fa5560b0bc17cf8fb77d89ffeb2fcbd/contracts/escrow/src/core/validators/milestone.rs#L53-L61).
- [Multi-release error values, lines 95–96](https://github.com/Trustless-Work/trustlesswork-smart-contract-stellar/blob/ab06d9c60fa5560b0bc17cf8fb77d89ffeb2fcbd/contracts/escrow/src/error.rs#L95-L96).

The official [receiver error page](https://docs.trustlesswork.com/trustless-work/v2-en/api-rest/errors/escrow/escrow-receiver-trustline-missing) supports the new preflight matrix.
It distinguishes deploy, update, and new milestone receivers.
The official [token error page](https://docs.trustlesswork.com/trustless-work/v2-en/api-rest/errors/token/token-trustline-missing) supports the missing-account and missing-trustline guidance.

These checks verify published source behavior and documentation.
They do not prove which WASM a deployed escrow runs.
I did not verify a deployment manifest, WASM hash, or authenticated API response.
The V2 testnet deployment statement remains an upstream claim.

## Nonblocking finding: error-page URLs return HTTP 404

**Proposed `sk-026`: Trustless Work skill promises documentation links that do not resolve.**

Priority: P3. Scope: newly pinned skill guidance and official documentation examples.

Selection evidence: `ecosystem-skills/MANIFEST.json:445` selects the changed `skills/api/v2/core-concepts.md`.
At pin `80e2467f34041b9f70e66d6c2f567fc76ba9b1bb`, line 179 includes the first failing URL.
Line 214 claims the ungrouped URL pattern points to each error's documentation page.
[Pinned source](https://github.com/Trustless-Work/trustlesswork-skill/blob/80e2467f34041b9f70e66d6c2f567fc76ba9b1bb/trustless-work-dev/skills/api/v2/core-concepts.md#L179-L214).

| Exact URL | GET result |
| --- | --- |
| https://docs.trustlesswork.com/trustless-work/v2-en/api-rest/errors/escrow-receiver-trustline-missing | HTTP 404; missing-page response |
| https://docs.trustlesswork.com/trustless-work/v2-en/api-rest/errors/token-trustline-missing | HTTP 404; missing-page response |
| https://docs.trustlesswork.com/trustless-work/v2-en/api-rest/errors/escrow/escrow-receiver-trustline-missing | HTTP 200; documented receiver error |
| https://docs.trustlesswork.com/trustless-work/v2-en/api-rest/errors/token/token-trustline-missing | HTTP 200; documented token error |

The Markdown forms also distinguish missing pages from complete error documentation.
The working pages repeat the ungrouped URLs in their example `type` fields.
Thus, this defect spans the skill claim and published examples.
It does not establish that the live API emits those URLs.
I made no escrow API call.

An agent following the documented URL reaches a missing page during error recovery.
Error codes and the documented corrective actions remain usable.
This limited navigation defect does not change transaction construction, signing, authority, or Raven exposure.
Therefore, it does not block pin acceptance.

Minimal upstream correction: provide redirects or correct the documentation-link claim and examples.
Keep any stable problem-type identifier separate from a working documentation link.
Do not claim a server response change without live response evidence.

The local active findings and resolved register contain no matching error-link finding.
`sk-025` concerns authentication, so this proposed finding is distinct.
The coordinator can record the proposal through the improvements workflow.
I did not create a finding file or contact upstream.

## Golden and improvement impact

The authentication lines match the old pin in `SKILL.md`, `constitution.md`, and the V2 core reference.
The live [Core API introduction](https://docs.trustlesswork.com/trustless-work/v2-en/api-rest/introduction) still documents bearer authentication.
`sk-025` therefore remains unresolved.
The existing disputed golden preserves that conflict and the caller-signing requirement.

The other two Trustless Work battery cases concern prior-art discovery and partner detail.
They do not assert the changed terminal-state, trustline, or error-link behavior.
No existing golden requires a changed answer for this candidate.
The battery has no direct case for these new details.
That coverage limit does not invalidate the source checks above.

The separate `sd-046` edit concerns Stellar Docs and does not result from these pin changes.
Its retirement needs its own source-and-index review.
This report does not approve that retirement.

## Independent routing and gates

I ran the current routing evaluator with two temporary `--manifest` snapshots.
The first snapshot came from HEAD; the second came from the candidate.
I did not change labels, evaluator code, thresholds, or gate configuration.
I compared complete scored row objects, including scores, ordered hits, grades, and holdout fields.

| Lane | Rows | Complete rows equal |
| --- | ---: | --- |
| Legacy | 338 | Yes |
| Extended | 122 | Yes |
| Skills | 23 | Yes |
| Holdout | 49 | Yes |
| Protocol history | 12 | Yes |
| Total | 544 | Yes |

The baseline result is `eval/results/routing-2026-09-29T19-37-30-094Z.json`.
The candidate result is `eval/results/routing-2026-09-29T19-37-34-013Z.json`.
The candidate `--gate` run passed.
Legacy totals remain 219/298/326 at top-1/top-3/top-5.
Skills totals remain 17/23/23.
Holdout totals remain 12/26/29, with 10 forbidden captures and 24 passes.

`eval/gates.json:9` changes only the manifest fingerprint.
`eval/gates.json:54` adds the dated explanation.
After excluding those two values, the entire gate object matches HEAD.
All numerical floors, accepted totals, denominators, and other fingerprints remain unchanged.
Both recorded manifest fingerprints match the actual corresponding file bytes.

The evaluator checks fingerprints against repository inputs, even with `--manifest`.
The temporary baseline run therefore uses the candidate's repository fingerprint check.
The separate complete-row comparison proves baseline equivalence without relying on that check.

## Verification and limits

| Check | Result |
| --- | --- |
| `node scripts/check-mirrors.mjs --fetch` | PASS; 66 fresh files |
| `node scripts/check-pin-review.mjs --base HEAD` | PASS; two recorded selections |
| `node scripts/diff-pins.mjs <HEAD pins> ecosystem-skills/MANIFEST.json` | PASS; ten complete diffs reviewed |
| Direct exposure and emitted-text guards | PASS |
| All catalog file transports | PASS; 222 entries |
| Independent baseline/candidate routing | PASS; all 544 rows equal |
| Candidate routing `--gate` | PASS |
| `npm test -- test/catalog.test.ts test/skills.test.ts` | PASS; 55 tests |
| `npm run eval:qa:lint` | PASS; 0 errors, 62 warnings |
| `npm run secrets:scan -- --tree` | PASS |
| `git diff --check` | PASS |

The lint warnings include existing corroboration and caution warnings.
I did not hide or change them.
I did not run paid evaluations, transaction calls, new servers, or deployment commands.
The coordinator still owns the baseline build checks and release acceptance.
I changed only this report among repository source files.
Temporary evidence is under `/tmp/drift-independent-fxKUd5`.
