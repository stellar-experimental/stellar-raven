SHIP-WITH-FIXES

I reviewed the uncommitted changes against d6ad7350 and both new finding files.
I changed no tracked files and ran no paid evaluations.
The actual case changes end 17 caps and retain seven caps.
The brief's 13/11 split describes the author lanes, not the final outcomes.

1. **Major — the lint combines independent caps and hides expired findings.**

   File: `eval/qa/lint-corpus.mjs:583`; tests: `test/qa-corpus-lint.test.mjs`.
   The new branch joins adjacent sentences even when each sentence already contains a complete cap.
   The combined sentence passes when either finding remains active.
   I reproduced this with sd-901=`fixed-upstream` and sd-902=`verified`.
   The first cap alone produces one warning; adding the independent second cap removes that warning.
   See `tmp/rv-caps/lint-probe.mjs` and `tmp/rv-caps/lint-probe.log`.

   Evidence: the [live SAC page](https://developers.stellar.org/docs/tokens/stellar-asset-contract.md) says `CONTRACT_EXECUTABLE_STELLAR_ASSET`.
   I fetched it at 2026-11-02T21:43:50Z.
   This illustrates why a resolved source claim must expire independently of another active finding.
   The local reproduction returns `"findings":[]` for the joined caps.

   Fix: join a following grade sentence only when the first sentence lacks its own partial grade.
   Do not consume a second independent attribution sentence.
   Add regression tests for both orders of active and resolved caps.
   Keep the split attribution/grade test.

   I scanned all battery notes for partial, cap, attribution, quotation, and leniency wording.
   No existing full note loses cap detection solely from the new source-word filter.
   Plain leniency sentences remain excluded.
   However, `Cap a Lumenloop-scoped answer at partial` is not detected by `PARTIAL_CAP_RE`.
   The WisdomTree case currently relies on its preceding attribution sentence for detection.
   Recognize this existing imperative form and test it separately.

2. **Major — the TVL sibling still grants credit for a resolved provenance defect.**

   Files: `eval/qa/corpus/battery/edge-behavior/q-edge-noinfo-exact-tvl-figure.json` and
   `eval/qa/corpus/battery/edge-behavior/q-edge-fresh-latest-blend-tvl.json`.
   Affected register entries: `cluster-021` and `cluster-045`.

   The changed case grades current missing-provider claims wrong.
   The Blend sibling still grants partial credit for cached pre-fix provenance omissions under sls-031.
   Its active sls-039 reference covers provider-hosted history, not the resolved provenance omission.
   The changed case's verification record incorrectly reports no sibling contradiction.

   Evidence: [live TVL analysis](https://stellarlight.xyz/api/analyze?dimension=tvl) returned `"provider":"DefiLlama"` at 2026-11-02T21:43:51Z.
   It also returned `asOf`, `tvlAsOf`, `basis`, and `totalTvlUSD`.
   [The live Blend query](https://stellarlight.xyz/api/projects/search?q=Blend) returned `"tvlSource":"defillama"` at 2026-11-02T21:48:06Z.
   It also returned `tvlMethod`, `llamaSlugs`, and `tvlMethodUrl`.
   The sls-039 file explicitly says: “The provenance half of this finding is **resolved**”.

   Fix: remove the Blend cap's cached-copy and missing-methodology branches.
   Limit any remaining sls-039 caution to the declined history scope.
   Preserve the provider-source and date requirements.
   Update verification evidence, regenerate artifacts, and reconcile both clusters.

3. **Minor — two audit notes assert an unverified historical cutoff.**

   Files: `eval/qa/corpus/battery/soroban/q-soroban-auth-recursion-dos-audit.json` and
   `eval/qa/corpus/battery/tooling-infra/q-tool-soroban-auth-audit-live.json`.
   Both notes say the correct V-SOR-APP-VUL-003 result has existed since the 2026-08-25 fix.
   They describe the miss as pre-2026-08-25.
   The issue records the miss on 2026-08-25 itself.
   The supplied resolution evidence establishes the corrected live response on 2026-08-28.

   Evidence: [the fixing commit](https://github.com/Stellar-Light/stellarlight/commit/b170d0d78583f95bd6aa86d8ede0125cda4089e4), fetched at 2026-11-02T21:48:06Z, says:
   “this fixes the INGEST” and “the live exact-miss persists until then”.
   The commit requires a separate re-ingest.
   [The resolution comment](https://github.com/Stellar-Light/stellarlight/issues/1031#issuecomment-5455030587) dates independent live confirmation to 2026-08-28.
   Current responses still confirm the fix and the absent-identifier control.

   Fix: say “confirmed fixed live on 2026-08-28” and remove the unsupported pre-2026-08-25 cutoff.
   Alternatively, cite dated production re-ingest evidence that establishes the earlier boundary.
   The cap can still end.

Both new upstream findings are valid.

- **sd-078: verified; no specific duplicate found.**
  The [deep-dive page](https://developers.stellar.org/docs/build/guides/transactions/simulateTransaction-Deep-Dive.md) says “needs to be restored before the transaction can be submitted”.
  I fetched it at 2026-11-02T21:43:50Z.
  The current repository file contains the same sentence.
  [RPC source](https://raw.githubusercontent.com/stellar/stellar-rpc/main/cmd/stellar-rpc/internal/integrationtest/simulate_transaction_test.go) instead asserts `require.Nil(t, response.RestorePreamble)` for automatic restoration.
  It also requires `ArchivedSorobanEntries`.
  The corrected state-archival page agrees with those tests.
  Issue #1856 requests a general guide update without this defect's details.
  Issues #2969, #2564, #1837, and #441 cover links or general guide maintenance.
  Existing sd-007 covers the corrected archival page; sd-063 covers the restoration TTL value.
  Neither duplicates this deep-dive defect.
- **cs-008: verified; no duplicate found.**
  [CAP-0046-06](https://raw.githubusercontent.com/stellar/stellar-protocol/master/core/cap-0046-06.md) still names `CONTRACT_EXECUTABLE_TOKEN`.
  I fetched it at 2026-11-02T21:43:51Z.
  [Current XDR](https://raw.githubusercontent.com/stellar/stellar-xdr/curr/Stellar-contract.x) instead declares `CONTRACT_EXECUTABLE_STELLAR_ASSET = 1`.
  The SAC page agrees with current XDR.
  Commit ed34303d93 confirms the 2023-10-09 rename.
  CAP-0046-01, -02, -03, and -05 contain no old-name match.
  Open issue and pull-request searches found no matching report.
  Resolved sd-020 covers the corrected documentation, not this CAP.

The source index records URLs, UTC times, HTTP status codes, and saved response paths.
See `tmp/rv-caps/sources.json` and `tmp/rv-caps/extra-sources.json`.
Duplicate searches are in `tmp/rv-caps/dedupe.json` and `tmp/rv-caps/dedupe-tree-broad.txt`.
All source requests succeeded; the retired scfTier filter correctly returned HTTP 400.

All 24 cases change only `golden.notes` and `truth.verified`.
Every verification record contains a date, author, evidence, and root cause.
The cited source paths support a repeatable check, subject to findings 2 and 3.
The seven retained caps name active findings and preserve the partial ceiling.
They do not authorize an unresolved false claim to receive correct.

| Case id | Result | Reason |
|---|---|---|
| q-asset-stablecoin-issuers-discovery | ok | Circle USDC and EURC remain in the live registry; sls-066 is resolved. |
| q-defi-streaming-payments-prior-art | ok | RouteDock, x402, and MPP queries return exact matches; sls-025 is resolved. |
| q-edge-noinfo-exact-tvl-figure | fix | The source fix is valid, but the Blend sibling still grants conflicting credit; see finding 2. |
| q-hot-sdf-transparency-wallets-reports | ok | The live lumens page uses current buckets and omits fixed balances; sd-012 is resolved. |
| q-hot-sdf-xlm-holdings-sales | ok | The live lumens page uses current buckets and omits fixed balances; sd-012 is resolved. |
| q-org-sdf-mandate-buckets | ok | The live pages distinguish current buckets from the 2019 taxonomy. |
| q-org-sdf-structure-mandate | ok | The live lumens page omits the old reserve figure and directs readers to current sources. |
| q-builder-by-region-latam | ok | The retired filter returns HTTP 400; live builder rows carry match evidence. |
| q-builder-by-scf-tier | ok | The retired filter returns HTTP 400 and has no current OpenAPI parameter. |
| q-builder-rust-soroban-devs | ok | Rust results carry match evidence; the note preserves candidate and experience distinctions. |
| q-scf-sdf-bug-bounty | ok | The migration record ranks first and names consolidated HackerOne reporting. |
| q-sor-force-fast-archival-localnet | ok | The deep-dive page still gives the stale flow; sd-078 supports the limited cap. |
| q-sor-p23-auto-restore-extendto | ok | The deep-dive page conflicts with current docs and RPC tests; sd-078 supports the cap. |
| q-sor-sac-introspection | ok | CAP-0046-06 retains the old name; current XDR and SAC docs support cs-008. |
| q-sor-ttl-defaults-extend | ok | The deep-dive page still gives the stale flow; sd-078 supports the limited cap. |
| q-soroban-auth-recursion-dos-audit | fix | The current fix holds, but the historical cutoff needs evidence or correction; see finding 3. |
| q-soroban-deploy-cli | ok | The live and pinned skill use current target and flags; sk-001 is resolved. |
| q-soroban-resource-limits | ok | The live pages use current XDR fields and separate validation from execution failures. |
| q-soroban-storage-types | ok | The deep-dive page still gives the stale flow; sd-078 supports the limited cap. |
| q-infra-horizon-vs-rpc | ok | The Lab page still says deprecated; the overview differs; sd-072 remains active. |
| q-ti-cli-rust-windows-troubleshooting | ok | The live and pinned skill include the error rows; sk-006 is resolved. |
| q-ti-rpc-gettransactions-pagination-xdr | ok | The page still says hardcoded; source options remain configurable; sd-004 remains declined. |
| q-tool-cli-testnet-identity-howto | ok | The live and pinned skill omit --global and use --source-account. |
| q-tool-soroban-auth-audit-live | fix | The current fix holds, but the historical cutoff needs evidence or correction; see finding 3. |

I read all 79 distinct members of the 22 reopened clusters.
`tmp/rv-caps/clusters.json` records 20 consistent clusters and two conflicting clusters.
Cluster-013 is already consistent; its historical reopened text does not make it a current reopened entry.

| Gate | Exit code | Result |
|---|---:|---|
| `npx vitest run test/qa-corpus-lint.test.mjs` | 0 | 48 tests passed. |
| `npm run eval:qa:lint -- --since d6ad7350 --stale --enforce-floors` | 0 | 0 errors; 93 warnings. |
| `npm run eval:qa:register -- --check` | 0 | Up to date. |
| `npm run improvements:lint` | 0 | Passed; 110 findings. |

Gate logs are `tmp/rv-caps/gate-0.log` through `tmp/rv-caps/gate-3.log`.
The passing lint does not resolve the demonstrated cap-merging defect or the TVL grading conflict.
