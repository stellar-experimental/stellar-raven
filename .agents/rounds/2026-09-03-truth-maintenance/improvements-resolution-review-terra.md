# Improvements resolution review

Date: 2026-09-03

## Scope and method

I independently reviewed `sls-073`, `sls-077`, `sls-078`, and `sls-079`.
I read each finding and every recorded GitHub reference.
I also read the linked resolution comments and the four pull requests named by `sls-073`.
I made no repository change, external write, paid call, deployment, or rebaseline.

I used free, read-only Scout requests against live OpenAPI 1.9.23.
I scanned every repository reference to the four finding IDs.
The active files and generated index are resolver targets.
The dated round and audit records are historical evidence and must remain.
There are no intake overrides and no resolved-ledger entries for these IDs.

The resolver needs a committed `fixed-upstream` finding.
Run its dry run after that commit.
Post its generated comment verbatim on each filed upstream issue.
Then run the same command without `--dry-run`.
The generated comment includes the required immutable source permalink.

## `sls-073` — vet-idea project consistency

Issue `Stellar-Light/stellarlight#1025` is closed as completed.
Maintainer `theboycoder` posted the live resolution comment.
The comment cites pull requests `#1026`, `#1027`, `#1028`, and `#1029`.
All four pull requests are merged.

The original no-vertical request now returns `vertical: null`, `gap: null`, and `matchMode: scored`.
It returns eight project rows and six repository rows.
The project rows include `noether`, `stellars-finance`, `turbolong`, and `zenex`.
The same directory query with `limit=6` returns the same six candidates in another order.
`matchModeLabel` states `matched the idea's own terms`.
This supplies the required response basis.

I also checked the mapped wallet path.
`vet-idea` returns a `vertical` result with eight wallet rows.
It does not need no-vertical directory parity.
This adjacent behavior does not reproduce the reported fallback defect.

Before resolution, add the dated live evidence and set the finding to `fixed-upstream`.
Commit that change before the dry run.

```sh
npm run improvements:resolve -- --file improvements/stellar-light-scout/sls-073-perps-vetidea-project-consistency.md --resolved 2026-09-03 --live-recheck "2026-09-03 live GET /api/vet-idea?q=perpetuals%20%2F%20derivatives%20trading%20protocol%20on%20Stellar returned vertical=null, matchMode=scored, and project competitors noether, stellars-finance, sushi, turbolong, vanna-finance, zenex, soroswap, and lobstr; the limit=6 directory result contained the same first six candidates." --review-evidence "Independent Terra review read issue #1025, its maintainer resolution comment, merged PRs #1026-#1029, and repeated the original live trigger plus an adjacent wallet trigger." --resolving-ref https://github.com/Stellar-Light/stellarlight/issues/1025 --references-reviewed --upstream-commented --dry-run
```

Post the dry-run generated comment on `#1025` before removing `--dry-run`.
The comment must state the live recheck and the generated immutable source permalink.

READY

## Post-resolution audit — 2026-09-03

The resolver created four receipts in `improvements/resolved.json`.
They cover `sls-073`, `sls-077`, `sls-078`, and `sls-079` exactly once.
Each receipt uses source commit `884c0e38c57c9e03b36751e105048352b896978d`.
That commit contains all four pre-deletion finding files.
Each receipt points to its matching immutable source file.

The four active finding files are deleted.
The generated index states `Total findings: 64`.
The active Markdown finding count is also 64.
`npm run improvements:lint` passes with 64 findings.
The normal reference search finds no active finding copy.

The remaining `sls-077` and `sls-078` references occur in a dated 2026-08-27 eval record.
The dated 2026-08-29 audit records also retain historical references.
These references describe past evidence and remain valid history.
The current local `sls-078` residual remains in `.agents/TODO.md` without an active upstream finding link.

The three posted comments exist and contain the expected dated rechecks and immutable source links.
Their exact URLs are:

- `https://github.com/Stellar-Light/stellarlight/issues/1025#issuecomment-5529711483`
- `https://github.com/Stellar-Light/stellarlight/issues/1086#issuecomment-5529711476`
- `https://github.com/Stellar-Light/stellarlight/issues/1087#issuecomment-5529711487`

The round ledger records only comment IDs, not these direct URLs.
Its rows 214 through 216 therefore do not meet the required receipt form.
`sls-079` correctly has no upstream comment.

Required action: replace the three comment IDs in the round ledger with the three exact URLs above.
Then rerun `npm run improvements:lint` and the normal reference search.

CHANGES-REQUIRED

## Post-resolution audit superseding verdict — 2026-09-03

The final receipt-format check passes.
The ledger contains each required direct comment URL once.
The URLs cover `sls-073`, `sls-077`, and `sls-078`.
`sls-079` correctly has no upstream comment.

`npm run improvements:lint` passes with 64 findings.
The normal reference search finds only dated historical evidence records.
The four resolved receipts, four deletions, source snapshot, and index count remain valid.

This verdict supersedes the earlier receipt-format finding.

PASS

## `sls-077` — issued response enum

Issue `Stellar-Light/stellarlight#1086` is closed as completed.
Maintainer `theboycoder` states that the fix shipped in spec 1.9.13.

Live OpenAPI 1.9.23 lists `audited`, `live`, `maintained`, and `issued` in both claim-type enums.
The original EURC request returns `claim.type: "issued"` and `verdict: "supported"`.
An adjacent audited request also returns a valid `claim.type` response.
The published schema now covers the valid issued response.

The current references in `research/services/stellar-light.md`, `eval/README.md`, `src/policy/scout-exposure.ts`, and `test/catalog.test.ts` still name the old enum defect.
Update them during the resolution change.
They must say that the accepted 1.9.1 surface remains excluded by a separate exposure decision.
They must not retain a link to a deleted `sls-077` file.

Before resolution, add the dated live evidence, set `fixed-upstream`, and commit the finding and reference updates.

```sh
npm run improvements:resolve -- --file improvements/stellar-light-scout/sls-077-verify-issued-response-enum.md --resolved 2026-09-03 --live-recheck "2026-09-03 live GET /api/verify?type=issued&subject=EURC&auditor=Circle returned claim.type=issued and verdict=supported; live OpenAPI 1.9.23 lists issued in both request and 200-response claim.type enums." --review-evidence "Independent Terra review read issue #1086 and its maintainer resolution comment, then repeated the original issued EURC request and checked both live OpenAPI enums." --resolving-ref https://github.com/Stellar-Light/stellarlight/issues/1086 --references-reviewed --upstream-commented --dry-run
```

Post the dry-run generated comment on `#1086` before removing `--dry-run`.
The comment must state the live recheck and the generated immutable source permalink.

The retained exposure decision is not an upstream enum defect.

READY

## `sls-078` — quality-report routing capture

Issue `Stellar-Light/stellarlight#1087` is closed as completed.
Maintainer `theboycoder` states that the route fix shipped in spec 1.9.13.

Live OpenAPI 1.9.23 now limits `x-routing` to eight source-calibration phrases.
Its purpose names Scout and Stellar Light.
Its `notFor` section rejects generic technical, protocol, SDK, and operational questions.
The prior standalone capture terms are absent.
The original upstream routing-contract defect no longer reproduces.

Raven still has a separate local scoring defect.
`scripts/build-catalog.mjs` extracts every response-schema property and enum into low-weight `keywords`.
The current 1.9.23 quality response therefore produced generic Raven keywords such as `response`, `issues`, `records`, and `failure`.
The independent four-state routing run found 90 unrelated `scout.getQualityReport` top-five captures.
All measured aggregate movement came from that Raven projection.

This residual is not a Scout upstream routing defect.
Do not create an upstream successor finding for it.
Create a separate own-repository TODO for a general schema-keyword design repair.
Keep `GET /api/quality` excluded until that repair passes its routing review.
Update the current policy, test, research, and eval references during resolution.
They must explain the local schema-keyword capture, not the now-fixed upstream `x-routing` contract.

Before resolution, add the dated live evidence, set `fixed-upstream`, create the local TODO, and commit the finding and reference updates.

```sh
npm run improvements:resolve -- --file improvements/stellar-light-scout/sls-078-quality-report-routing-capture.md --resolved 2026-09-03 --live-recheck "2026-09-03 live OpenAPI 1.9.23 GET /api/quality x-routing contains only eight Scout/Stellar Light source-calibration phrases; its notFor section excludes generic technical, protocol, SDK, and operational questions." --review-evidence "Independent Terra review read issue #1087 and its maintainer resolution comment, checked the live OpenAPI route contract, and separated the remaining 90-capture Raven schema-keyword result from the upstream fix." --resolving-ref https://github.com/Stellar-Light/stellarlight/issues/1087 --references-reviewed --upstream-commented --dry-run
```

Post the dry-run generated comment on `#1087` before removing `--dry-run`.
The comment must state the live recheck and the generated immutable source permalink.

READY

## `sls-079` — project status and deployment

`sls-079` has no filed upstream issue or pull request.
It can still become `fixed-upstream` because the original live defect no longer reproduces.

The strict Stellars Finance response now returns `status: "Pre-Release"`.
It returns `statusBasis: "human-verified"` and the operator-bundle source URL.
It also returns `deployment.network: "testnet"` with a human-verified basis.
The live schema says that `status` is never deployment proof.
It directs consumers to the separate `deployment` field.
The schema defines `mainnet`, `testnet`, and `unknown` states.

This fixes both parts of the finding.
The old `Live` label no longer describes Stellars Finance.
The API model now separates lifecycle status from deployment evidence.

Before resolution, add the dated live evidence, set `fixed-upstream`, and commit the finding.

```sh
npm run improvements:resolve -- --file improvements/stellar-light-scout/sls-079-project-status-deployment-conflation.md --resolved 2026-09-03 --live-recheck "2026-09-03 live strict Stellars Finance search returned status=Pre-Release, statusBasis=human-verified, deployment.network=testnet, and the operator-bundle source URL; live OpenAPI states status is never deployment proof." --review-evidence "Independent Terra review repeated the original named-project trigger and checked the live Project schema; the Live/mainnet conflation no longer reproduces." --references-reviewed --upstream-comment-na --dry-run
```

No upstream comment applies because this finding was never filed.
Remove `--dry-run` after the printed resolved receipt is accepted.

READY

## Final post-resolution verdict — 2026-09-03

The final receipt-format check passes.
The ledger contains each required direct comment URL once.
The URLs cover `sls-073`, `sls-077`, and `sls-078`.
`sls-079` correctly has no upstream comment.

`npm run improvements:lint` passes with 64 findings.
The normal reference search finds only dated historical evidence records.
The four resolved receipts, four deletions, source snapshot, and index count remain valid.

This verdict supersedes the earlier receipt-format finding.

PASS

## Post-resolution audit final — 2026-09-03

The four resolved receipts, four deletions, source snapshot, and index count passed this audit.
The normal improvements lint passes with 64 active findings.
Historical references remain only in dated evidence records.
The three upstream comments exist and contain the required rechecks and source permalinks.

The round ledger records comment IDs instead of the three required direct comment URLs.
It must contain the URLs listed in the earlier post-resolution audit section.
This is the only unresolved receipt-format defect.

Required action: add the three direct comment URLs to ledger rows 214 through 216.
Then rerun `npm run improvements:lint` and the normal reference search.

CHANGES-REQUIRED

## Final superseding verdict — 2026-09-03

The three direct comment URLs now exist in the round ledger.
No receipt-format finding remains.

PASS
