# Improvements follow-ups — 2026-09-08

Base commit: `a0a398ad447e2845b4a1e9dcf90458c41c222777`.

This round reviews upstream references that changed after the 2026-09-03 maintenance round.
It uses public read-only service calls and GitHub reads.
It makes no paid calls, upstream comments, issue filings, or provider writes.

## State table

| finding | trigger evidence | upstream ref | ref state | PR checks/reviews | live re-check | action |
|---|---|---|---|---|---|---|
| `sd-027` | Guestbook prerequisites still require a LaunchTube JWT | `stellar/stellar-docs#2700`, PR `#2367` | Issue open; PR open at `bdc081d9c25d2e2db6f674b8b61421a4f2bf32cd`, updated 2026-09-08 | All current checks pass. Copilot found current-version and safety defects. The author selected `ElliotFriend/ye-olde-guestbook`. The triage bot left `bot:needs-decision`. | 2026-09-08 live page SHA-256 `657c65c9ba51fbce9868a85af453daa3def3856192822dedc929278b15b35ee6`; LaunchTube and JWT instructions remain. | Keep `reported-upstream`; record the material PR activity; wait for a maintainer decision. |
| `sd-034` | The smart-wallet page names only Passkey Kit and links the archived `kalepail/passkey-kit` move pointer | `stellar/stellar-docs#2700`, PR `#2367` | Issue open; PR open at the same refreshed head | The branch fixes the two reference pages. Its combined tutorial still needs a current-stack decision. | 2026-09-08 live page SHA-256 `a31347abd00f32d9558c3ceeaa543acb81ab5a38996e3c4fc3deb9132ece111b`; the original trigger remains. | Keep `reported-upstream`; record the material PR activity; wait for a maintainer decision. |
| `sls-023` | Broad RWA project search, named issuer examples, and the RWA registry | `Stellar-Light/stellarlight#494` | Closed completed; four owner comments from 2026-09-04 through 2026-09-05 claim a deployed fix and narrow its limits | Not a PR owned by this repository | 2026-09-08 project search returned 59 rows, 11 product-bearing rows, and 38 product records; SHA-256 `fe2a0ffa3ab2e219a04e2c0460016ca4f445d02eef03acc4ab4ebb0657eda2ae`. `/api/rwa` returned 97 verified assets from 52 issuers, including the named examples, exact identities, states, evidence, verification levels, asset classes, and classic-asset controls. | Set `fixed-upstream`. Fable independently confirmed both original failure modes stopped. Route the smaller Etherfuse completeness residual to `sls-083`. Reconcile two corpus references before terminal deletion. |
| `sls-024` | Exact lifecycle fixtures plus the full searchable population | `Stellar-Light/stellarlight#494`, `Stellar-Light/stellar-scout#9` | Both closed completed; the claimed full lifecycle population does not match the current response | Not applicable | The five named fixtures now pass. Five other rows use `human-verified` or `source-inherited` with a null `statusSourceUrl`. All 887 unknown deployments use consistent explicit unknown semantics. QCAD and GLOUSD also lack canonical product links to their verified registry rows. | Keep `reported-upstream`. Do not post a resolution comment. Sol independently found the five remaining source gaps and separated the schema defect into `sls-084`. |
| `sls-083` | Exact Etherfuse project, registry, issuer TOML, and Horizon issuer lookup | No upstream ref | New verified residual | Not applicable | Scout exposes five Etherfuse products. The operator TOML declares nine assets for the same issuer, and Horizon confirms all nine. The missing assets are `MEX`, `CETESZ`, `GILTS`, and `MEXe`. | Keep `verified` until the owner grants filing authority. |
| `sls-084` | OpenAPI enum plus all seven paged project categories | No upstream ref | New verified schema mismatch | Not applicable | All 981 searchable rows were scanned. Nine rows return `statusBasis: "package-release"`, but OpenAPI 1.9.48 contains no such value. | Keep `verified` until the owner grants filing authority. |

## GitHub activity

The active tree contains 64 unique upstream issue and pull-request references.
All 64 API reads succeeded.
Only five references changed since 2026-09-04.
Three belong to the already completed `sd-042` and `sd-047` work.

PR #2367 received a refreshed branch, passing checks, review comments, and an author response on 2026-09-08.
The current decision is whether to update the full tutorial or land only the two reference pages.
Neither finding needs a Raven response while maintainers make that decision.

Issue #494 received four substantive owner comments after the prior state audit.
They claim that the RWA registry, project products, deployment evidence, and classic-asset controls are live.
The direct service reads confirm those fields on Scout OpenAPI 1.9.48.
Fable independently confirmed that `sls-023` meets the fixed-upstream bar after residual separation.
Its report is `.agents/rounds/2026-09-08-improvements-followups/sls023-review-fable.md`.

The same review found a smaller issuer-completeness defect.
The Etherfuse project and RWA registry expose five products without a partial-coverage field.
The issuer TOML and Horizon confirm four additional current assets under the same issuer.
That distinct defect is `sls-083`.

Sol independently checked `sls-024` against all 981 searchable project rows.
The five named fixtures now pass, and `deployment.network: unknown` has correct null evidence fields.
Five other lifecycle rows still lack `statusSourceUrl` under a non-unknown basis.
The finding therefore remains `reported-upstream`.
The same scan found nine rows with an undocumented `package-release` basis.
That separate response-schema defect is `sls-084`.
The review is `.agents/rounds/2026-09-08-improvements-followups/sls024-review-sol.md`.

## Independent review reconciliation

Claude Fable 5.1 reviewed `sls-023` at high effort.
Fable matched the product, API, and evidence-boundary work.
The review first returned `CHANGES-REQUIRED`.
Its follow-up accepted `sls-083` as a distinct verified successor.
The author moved the fixed-state recheck into evidence and listed all six resolving pull requests.
The author corrected the Horizon provenance and added the `productsCoverage` recommendation.
The author also recorded the QCAD and GLOUSD identity residual under active `sls-024`.

Codex Sol reviewed `sls-024` at high effort.
Sol matched the dense population and schema analysis.
The review returned `CHANGES-REQUIRED` because the finding still reproduces on five rows.
The author removed the incorrect Fluxity interpretation and retained the finding as `reported-upstream`.
The author recorded the correct unknown-deployment semantics and all five lifecycle source gaps.
The author created `sls-084` for the separate `package-release` enum mismatch.
No review finding remains unreconciled.

`sls-084` does not duplicate `sls-082`.
The earlier finding covers the RWA `state` request and response enums.
The new finding covers `Project.statusBasis` on the project search response.

## Filing readiness

No finding was filed.
The existing filing-authority block remains in force.

Read-only dry runs passed for `sls-082`, `sls-083`, `sk-023`, and `sk-024`.
The `sls-082`, `sk-023`, and `sk-024` bodies include immutable source snapshots.
The new `sls-083` body resolves to `Stellar-Light/stellarlight` but needs a rerun after its first commit.
The new `sls-084` body also needs its first dry run and a rerun after its first commit.
The exact rendered bodies are in `/tmp/sls082-dry-run.txt`, `/tmp/sls083-dry-run.txt`,
`/tmp/sk023-dry-run.txt`, and `/tmp/sk024-dry-run.txt`.

## Evidence files outside the repository

- `/tmp/raven-upstream-states.json`: normalized state for 64 upstream references.
- `/tmp/sls023-projects.json`: the current broad RWA project response.
- `/tmp/sls023-rwa.json`: the current RWA registry response.
- `/tmp/sls024-fluxity.json`: the current exact Fluxity response.
- `/tmp/sls084-population-summary.json`: the normalized 981-row status-basis scan.
- `/tmp/sls084-openapi.json`: the current OpenAPI document.
- `/tmp/sd027-live.html`: the current Guestbook prerequisites page.
- `/tmp/sd034-live.html`: the current smart-wallet guide.

These transient files support the recorded hashes.
The repository records the commands, results, and durable upstream references needed for later re-checks.
