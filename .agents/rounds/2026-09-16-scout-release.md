# Scout release and maintenance closeout

Status: runtime release complete. RWA remains deferred in issue #167.

## Release

[PR #168](https://github.com/stellar-experimental/stellar-raven/pull/168) merged after all four checks passed.
The tested head was `edb1421ccd3f41bb9de4736473a2c3e34c189f7d`.
Its tree exactly matches squash commit `022970d5995e74487f69f8f985961eb5da48a978`.
CI run: `35162849863`. CodeQL run: `35162847574`.
The [acceptance ledger](2026-09-16-scout-acceptance.md) links the completed independent reviews.

The clean deployment used Cloudflare version `f3e66eed-1302-4e41-b189-2332444f1efa`.
Deployment `50ad2d8e-477c-4651-b696-fdce313ca69e` assigned 100% traffic at `2026-09-16T23:36:35.69351Z`.
Usage tail-consumer and retention-schedule verification passed.
The deployment supplied the source revision through `--define`.
The connector does not expose initialization metadata, so the revision was not independently observed there.

## Production proof

The authenticated catalog contains 282 entries, including 30 Scout operations.
Its full exposed projection matches local IDs, descriptions, schemas, retrieval profiles, and runnable flags.
Its SHA-256 is `273fcb88e6140a64a8be990a6ac8eb9353816e1063eb5f60cc12bbeba3ea541b`.
The comparison uses `loadManifest`, matching the server's schema parsing and object order.
A raw-manifest projection used different object order and produced a different initial hash.
This was a verification-script mismatch, not a served catalog difference.

All 17 search checks match the reviewed page hashes.
They include the stablecoin repair, two RWA technical controls, exact IDs, and Trustless Work discovery.
RWA appears in neither the catalog nor any checked result.
The Scout skill body and all three companion files match local verified reads.
Those reads verify upstream bytes against the reviewed immutable pin.

Health and Playground return 200. Unauthenticated MCP returns 401.
Python urllib received 403; curl and the authenticated connector succeeded.
The stored canary is healthy at `2026-09-16T23:08:07.834Z`, before this deployment.
The direct post-deployment reads above verify every changed Scout file.
Do not treat the older canary as a new deployment check.

Local search timing improves about 10% at the median and 38% at p95.
Both measured runs improve all 13 query medians against the accepted source.
These measurements do not establish network, model, or production Worker CPU improvements.

## Issues and upstream work

[Issue #141](https://github.com/stellar-experimental/stellar-raven/issues/141) closed at `2026-09-16T23:40:35Z`.
The [closure comment](https://github.com/stellar-experimental/stellar-raven/issues/141#issuecomment-5706174163) records the release scope and proof.
[Issue #167](https://github.com/stellar-experimental/stellar-raven/issues/167) owns all three deferred RWA routing failures.
The failures belong to Raven routing. No upstream Scout schema defect was established.
RWA, quality, and verify operations remain excluded under their existing policy decisions.
The original eleven-check routing program remains incomplete while RWA exposure stays deferred.
Protocol-history contracts remain source-expired. No contract was repinned and no paid evaluation ran.

Earlier maintenance merged PRs #156, #157, and #163–#166.
Issue #40 passed its authenticated copy check after exactly one approved test message.
Issues #158–#162 closed after source and live-index verification.
The improvements pipeline retains 57 active findings with their recorded dispositions.

The approved Stellar Docs patches remain published:

- [PR #2837](https://github.com/stellar/stellar-docs/pull/2837): `108ba24e0884f46e0c543996e4e94be754709840`.
- [PR #2844](https://github.com/stellar/stellar-docs/pull/2844): `581b884e20f3ec7e39f9fac64539ff1922d93f6d`.

Both patches passed all nine checks and still need maintainer approval.
PR #2837 retains its author hold. Neither external PR was merged.

## Worktrees and credentials

The read-only worktree audit distinguishes retained history from unmerged content.
Squash-merged branch tips remain preserved with exact-tree comparisons.
All original branches and dirty experimental worktrees remain intact.
The coordinator removed `deploy`, `scout-runtime-accepted`, and `scout-runtime-audit` after clean-state and ancestry checks.
The cleanup record stores every removed path and exact head.
The authorization receipt records the coordinator decision, checks, and scoped binding response.
The coordinator removed only the temporary deployment directory's `sdf` profile binding.
No command deleted the profile or changed another directory binding.
The source-integration checkout holds this final metadata update until its publication completes.

## Evidence

- [Production catalog, searches, and pins](2026-09-16-scout-release/scout-production-proof.json)
- [Expected catalog and search hashes](2026-09-16-scout-release/scout-live-proof-expected.json)
- [Read-only production probe](2026-09-16-scout-release/scout-live-proof-code.js)
- [Health and canary](2026-09-16-scout-release/scout-production-health.json)
- [Deployment identity](2026-09-16-scout-release/deployment.json)
- [Worktree audit](2026-09-16-scout-release/final-worktree-disposition.md)
- [Verified cleanup](2026-09-16-scout-release/scout-cleanup.json)

- [Cleanup decision and binding response](2026-09-16-scout-release/cleanup-authorization-receipt.json)

Terra high reviewed all release metadata and requested two record repairs.
The coordinator dated the old worktree snapshot and added the scoped cleanup receipt.
Terra accepted both repairs in the [completed review](2026-09-16-scout-release/record-review.md).
