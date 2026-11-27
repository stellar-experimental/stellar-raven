# Independent review of the November 27 docs handoffs

**PASS WITH FINDINGS.** Retire sd-105, sd-106 and sd-109. Keep sd-114 active. One coordination record needs correction. At [.agents/TODO.md, lines 609–610](../.agents/TODO.md#L609), the entry still calls PR #3171 open. Record its merge and the outstanding Discovery acceptance check. The resolver does not edit this file.

Reviewed the working diff against `origin/main` at `d39f0d6b11ebe75cbd15add60b280b4eddb16c95` under the maintenance exception. The four upstream merges named in the brief triggered the review. The assigned reviewer was Codex frontier (Astra, high), independent of the Claude Fable author. Model-eval spend was $0.

## Dispositions

All four linked issues were closed as completed. Each PR was approved, had eight successful checks and merged November 24. I checked the merge SHAs against GitHub and tested the deployed surfaces on November 27.

| ID | Verdict | Independent live evidence |
|---|---|---|
| sd-105 | **RETIRE** | HTTP 200, 12,082 bytes. The original trigger matched zero times. Line 49 agrees with Definitions at lines 74–76 and the adjacent example at line 61. The deployed page SHA-256 begins `ff9475dde917`. [Page](https://developers.stellar.org/docs/learn/fundamentals/lumens.md) · [Issue 3143](https://github.com/stellar/stellar-docs/issues/3143) · [PR 3147](https://github.com/stellar/stellar-docs/pull/3147) · [Merge d2a945b](https://github.com/stellar/stellar-docs/commit/d2a945bcf99c2a981ad6644dec3b018b1709b74e) |
| sd-106 | **RETIRE** | Lines 25–27 implement the recommendation’s second option. Both references resolve. Parsing the example as TOML and joining Radar’s 30 transitive quorum keys to nodes by public key yielded three nodes per domain and zero differences across all ten domains. Radar snapshot 22:12:36 UTC, ledger 65706323. The original name-presence probe still reproduces and does not test option 2. [Page](https://developers.stellar.org/docs/validators/tier-1-orgs.md) · [Config](https://raw.githubusercontent.com/stellar/packages/master/docs/examples/pubnet-validator-full/stellar-core.cfg) · [Radar](https://radar.withobsrvr.com/api/v1) · [Issue 3144](https://github.com/stellar/stellar-docs/issues/3144) · [PR 3148](https://github.com/stellar/stellar-docs/pull/3148) · [Merge 3ce1ed8](https://github.com/stellar/stellar-docs/commit/3ce1ed865a5efd5730ab827cc08a0bff05077de8) |
| sd-109 | **RETIRE** | HTTP 200, 7,166 bytes. Both original phrases returned zero matches. Line 49 agrees with Networks line 38 and Quickstart line 11. The linked Guestbook frontend page also passed the wording check. The deployed prerequisites page SHA-256 begins `dbd792a90f3f`. [Prerequisites](https://developers.stellar.org/docs/build/apps/guestbook/passkeys-prerequisites.md) · [Networks](https://developers.stellar.org/docs/networks.md) · [Quickstart](https://developers.stellar.org/docs/tools/quickstart/faucet.md) · [Issue 3150](https://github.com/stellar/stellar-docs/issues/3150) · [PR 3152](https://github.com/stellar/stellar-docs/pull/3152) · [Merge b99af98](https://github.com/stellar/stellar-docs/commit/b99af983750650c2e6d9d8fff601dc762876d401) |
| sd-114 | **KEEP ACTIVE** as `reported-upstream` | All four changed pages served HTTP 200. The target section is present at line 626 and all three referring pages link its anchor at lines 141, 107 and 53 respectively. Discovery omitted the entire target page from the acceptance query’s 40 results. The required top-five rank still fails. [Target](https://developers.stellar.org/docs/learn/fundamentals/contract-development/contract-interactions/stellar-transaction.md#contract-id-derivation) · [Deployer](https://developers.stellar.org/docs/build/smart-contracts/example-contracts/deployer.md) · [Deploy contract](https://developers.stellar.org/docs/build/guides/conventions/deploy-contract.md) · [Stellar Asset Contract](https://developers.stellar.org/docs/tokens/stellar-asset-contract.md) · [Issue 3170](https://github.com/stellar/stellar-docs/issues/3170) · [PR 3171](https://github.com/stellar/stellar-docs/pull/3171) · [Merge 386b7d3](https://github.com/stellar/stellar-docs/commit/386b7d333e509b56cd504c5a171a7ab3669c1086) |

I sent all seven queries to the primary Discovery search endpoint with `pageSize=50`. Each returned HTTP 200. In the finding’s evidence order, the first target-page ranks and total sections were **absent/40, 4/35, 2/50, 1/50, 36/46, 1/50, 1/49**. The new heading appeared at ranks 4, 2 and 1 for natural queries 2–4. Query 5 returned a different section at rank 36. The two control queries placed the secondary page third. These results independently reproduce the recorded partial outcome. [Discovery endpoint](https://api.mintlify.com/discovery/v1/search/stellardevelopmentfoundation)

## Case and register audit

| Case ID | Review result |
|---|---|
| `q-token-xlm-supply-total-circulating` | Only `golden.notes` changed among judge-facing fields. The retained text is an exact prefix of the previous value. The corresponding `truth.sources`, `truth.corroboration` and `truth.verified` changes match the upstream event. |
| `q-infra-testnet-vs-futurenet` | Only `golden.notes` changed among judge-facing fields. The retained text is an exact prefix of the previous value. The corresponding `truth.sources`, `truth.corroboration`, `truth.notes` and `truth.verified` changes match the upstream event. |
| `q-net-tier1-roster-current` | No edit needed. The deployed sources support the existing case. It has no `golden.notes` cap and no sd-106 dependency. |

Both edited `truth.verified` records identify the latest event, author, date, live evidence, issue and merged PR. Both `truth.verified.rootCause` fields include the accepted `freshness-drift` value and the existing resolution ledger path, explicitly identifying the receipts as pending. Neither relies on an active finding file that retirement would delete.

A read-only run of the compiler compared its four generated byte streams against the worktree. All matched. The generated improvements index also matched its renderer. The register changes are confined to the two member hashes and three newly reopened clusters. Cluster 053 corresponds to the first edited ID above and clusters 023 and 066 to the second. All 17 previously reopened entries compare equal to the base, bringing the total to 20.

## Resolver handoff and gates

The repository reference scan found four intake overrides, four index rows, the active records, the TODO entry above and dated round evidence. On retirement the resolver must append three receipts, remove the three corresponding overrides and active records, and regenerate the index. Preserve the sd-114 override and record. The dated round references record historical observations. The current open inbound handoffs are [568](https://github.com/stellar-experimental/stellar-raven/issues/568), [569](https://github.com/stellar-experimental/stellar-raven/issues/569), [570](https://github.com/stellar-experimental/stellar-raven/issues/570) and [571](https://github.com/stellar-experimental/stellar-raven/issues/571).

Each retirement candidate records three GitHub refs, its filing issue, resolving PR and inbound handoff. The resolver’s immutable source URL uses the latest committed revision of the finding. Commit the verified records before generating the resolution comments, then complete the upstream-comment step before writing receipts.

| Gate | Result |
|---|---|
| `npm run improvements:lint` | Passed, 84 findings |
| `npm run eval:qa:lint -- --since origin/main --stale --enforce-floors` | Passed, 0 errors and 99 warnings |
| `npm run eval:qa:lint -- --stale --enforce-floors` | Passed, 0 errors and 99 warnings |
| `npm run eval:qa:register -- --check` | Passed, register current |
| `npm run eval:selftest` | Passed |
| `npm run secrets:scan -- --tree` | Passed |
| `npm run improvements:lint -- --live` | Passed, 84 findings and live references checked |
