# Independent upstream review — 2026-11-05

Reviewer: Docs lane, Astra high, hc `t2dv`; distinct from primary upstream/Scout investigators. Full original finding files read before fresh triggers. **11 fixed scopes verified: sk-037, cs-011 and all nine Scout candidates. sls-101 remains partial.** Read-only work; no GitHub writes, production jobs, paid calls/evals, record edits or Wrangler. HTTP observations are2026-11-06 UTC (2026-11-05 local); cached payload generatedAt can be earlier than our receipt.20 Scout assertions and the SDK fixture passed; current60-row SEP comparison has zero mismatches.

## Reproduction

Every URL below is an exact public read. Reproduce with `curl -fsS --retry 2 --max-time 50 'URL'`. The full public Scout suite is [scout-readonly-probes.py](../../../research/audits/2026-11-05-improvements/scout-readonly-probes.py); use a fresh `--out` directory because it caches receipts. This independent pass fetched a new subset into `tmp/truth-2026-11-05/docs/independent/`, not the primary lane's receipts. The independent fetch scripts and compact action JSON are there; no raw upstream bodies need committing.

```sh
python3 research/audits/2026-11-05-improvements/docs-sep-status-recheck.py
node research/audits/2026-11-03-qa-followup/sdk-fixtures.mjs /tmp/SDK_INSTALL/node_modules/@stellar/stellar-sdk /tmp/FRESH_RECEIPT.json
# SDK fixture setup if needed: npm install --prefix /tmp/SDK_INSTALL --ignore-scripts @stellar/stellar-sdk@17.4.0
# All eight local checks pass; sk037 uses unsigned mixed+fee-bump negative controls and single-invocation positive control.
gh pr view NUMBER -R OWNER/REPO --json state,author,mergedAt,headRefOid,mergeCommit,statusCheckRollup,reviews,comments,body
gh api 'repos/OWNER/REPO/issues/NUMBER/comments?per_page=100'
gh pr diff NUMBER -R OWNER/REPO
```

The SEP script reads README and each of its60 linked preambles directly. It does not infer success from PR state. The dapp scope additionally checks the served immutable77bf4e8fc2533ac6ad680d061e89371e8474a1a8 pin, now used in catalog/manifest.json. SDK network calls, simulations, signatures and submissions are zero.

## Upstream state and author responsibility

- sk037: issue173 closed; [dev-skill PR174](https://github.com/stellar/stellar-dev-skill/pull/174) merged2026-11-03T19:17:55Z as e8c6c37aa565a1cba21a4b2aff58bee7f2fd1350. Bot authored; returned checks successful except site-ci skipped; no GitHub review. Bot's final substantive comment says head36fd4b1 checked then merged. Inbound Raven358 remains coordinator-owned.
- cs011: issue2055 closed; [protocol PR2062](https://github.com/stellar/stellar-protocol/pull/2062) merged2026-11-04T03:19:31Z as ae994187e5e3d68308de1f8cf0d546aeafe79e03. Author leighmcculloch, fnando APPROVED. `sep-modification` FAILED; log `gh run view 41764810332 -R stellar/stellar-protocol --log-failed` shows convertPullRequestToDraft GraphQL FORBIDDEN/Resource not accessible by integration. Other returned checks passed. This is not hidden or described as a content-check failure. Original kalepail comment6611940463 records exactly the SEP0013 residual; new diff changes only Rejected to Abandoned.
- Scout PR1889 merged10-31;1921/1925/1928/1929/1931 merged11-05, all author **theboycoder**, returned checks successful, GitHub reviews empty. Issue1907/1909/1914/1915/1916/1917/1901/1902 closed. Their comments are empty;1889's latest substantive comment is kalepail's11-02 not-yet-applied report, superseded by fresh live evidence. PR bodies' old “draft/final review pending” prose is not actual state. Their review-round descriptions are author assertions, not GitHub approvals. No kalepail branch work belongs here. Pending owner data jobs outside the fixed originals remain explicitly outside this retirement decision.

## Original-scope decisions

### sk-037 — fixed

Current main and served77bf4e8 pin explicitly forbid mixed classic/Soroban operations, require one supported operation, explain resource/auth control and contract composition. SDK17.4 unsigned mixed invoke/manageData and fee-bump wrappers reject; single invocation assembles.

Exact reads: `https://raw.githubusercontent.com/stellar/stellar-dev-skill/main/skills/dapp/SKILL.md`, `https://raw.githubusercontent.com/stellar/stellar-dev-skill/77bf4e8fc2533ac6ad680d061e89371e8474a1a8/skills/dapp/SKILL.md`, `https://raw.githubusercontent.com/stellar/js-stellar-sdk/v17.4.0/src/rpc/transaction.ts`.

Upstream: https://github.com/stellar/stellar-dev-skill/issues/173, https://github.com/stellar/stellar-dev-skill/pull/174. Resolve after generated pin reconciliation. Inbound Raven358; no golden consumer found. Next trigger: same main+pin paragraph and local SDK fixture.

### cs-011 — fixed

SEP0013 preamble now Abandoned (In favor of SEP-6), matching README defined term. All60 table rows freshly compared: zero mismatches.

Exact reads: `https://raw.githubusercontent.com/stellar/stellar-protocol/master/ecosystem/sep-0013.md`, `https://raw.githubusercontent.com/stellar/stellar-protocol/master/ecosystem/README.md`.

Upstream: https://github.com/stellar/stellar-protocol/issues/2055, https://github.com/stellar/stellar-protocol/pull/2062. Resolve; retain historical cs003 receipt and link successor resolution. No golden asserts SEP0013 status. Next: repeat60-row comparison after registry changes.

### sls-095 — fixed

Both names resolve found=true to slug freighter/name Varial; Varial search sole wallet match; identity currentName Varial, alias Freighter, renamedAt2026-10-29 and SDF source; website varialwallet.com. freighter.app redirects there; current master README agrees.

Exact reads: `https://stellarlight.xyz/api/projects/resolve?q=varial`, `https://stellarlight.xyz/api/projects/resolve?q=freighter`, `https://stellarlight.xyz/api/projects/search?q=varial&limit=100`, `https://stellarlight.xyz/api/projects/search?q=freighter&limit=100`, `https://freighter.app/`.

Upstream: https://github.com/Stellar-Light/stellarlight/pull/1889. Resolve and remove stale Scout rename-lag notes. Five integration descriptions saying Freighter are not identity defects; preserve unrelated ll032/sls100 scopes. Next: both resolves + search + website.

### sls-096 — fixed

Open briefs0/closed16, activeQuarter q4-2026; only open response row is synthetic scf-round46. Both Q3 briefs closed. Official handbook still Q4 coming soon. Ideas UI Q4 Coming soon/Q3 Closed; both detail pages Closed: past round.

Exact reads: `https://stellarlight.xyz/api/rfps?status=open`, `https://stellarlight.xyz/api/rfps?quarter=q3-2026`, `https://raw.githubusercontent.com/stellar/scf-handbook/main/scf-awards/build-award/rfp-track.md`, `https://stellar.gitbook.io/scf-handbook/scf-awards/build-award/rfp-track.md`, `https://stellarlight.xyz/ideas`, `https://stellarlight.xyz/ideas/layerzero-dvn`, `https://stellarlight.xyz/ideas/x402-facilitator-bazaar`.

Upstream: https://github.com/Stellar-Light/stellarlight/issues/1907, https://github.com/Stellar-Light/stellarlight/pull/1921. Resolve and reconcile RFP lag goldens. Preserve round46 Submission/deadline11-09, not an open brief. Next: open/q3 queries and live official handbook after next roster update.

### sls-098 — fixed

Four unfetched partners have seps/assets/source/date null identically in list and detail; all four lack false verified badge and show curated provenance. Anclap retains source+2026-09-29 fetch, sep-6/sep-24, PEN/ARS and verified badge; current TOML confirms transfer endpoints. All47 list rows have either both source/date stamps or neither.

Exact reads: `https://stellarlight.xyz/api/partners?all=true`, `https://stellarlight.xyz/api/partners/anchor-bitso`, `https://stellarlight.xyz/api/partners/anchor-honey-coin`, `https://stellarlight.xyz/api/partners/anchor-coins-ph`, `https://stellarlight.xyz/api/partners/anchor-yellow-card`, `https://stellarlight.xyz/api/partners/anchor-anclap`, `https://stellarlight.xyz/partners/anchor-bitso`, `https://stellarlight.xyz/partners/anchor-honey-coin`, `https://stellarlight.xyz/partners/anchor-coins-ph`, `https://stellarlight.xyz/partners/anchor-yellow-card`, `https://stellarlight.xyz/partners/anchor-anclap`, `https://anclap.com/.well-known/stellar.toml`.

Upstream: https://github.com/Stellar-Light/stellarlight/issues/1909, https://github.com/Stellar-Light/stellarlight/pull/1929. Resolve original provenance/null defect. No paid partner route invoked. Next: four negative controls plus Anclap positive and list/detail equivalence.

### sls-103 — fixed

Current582 hash b44bd87c48cd5ef9; valid previous581 hash67022e31bd3e0ec7; only scopuly added,+217100USD. No empty baseline. Source baselineSlugsOf requires nonempty slug count/hash consistency; empty/truncated read not persisted, failed projects read returns error.

Exact reads: `https://stellarlight.xyz/api/analyze?dimension=funding`, `https://raw.githubusercontent.com/Stellar-Light/stellarlight/main/src/app/api/analyze/route.ts`.

Upstream: https://github.com/Stellar-Light/stellarlight/issues/1914, https://github.com/Stellar-Light/stellarlight/pull/1928. Resolve original baseline defect; update obsolete empty-baseline golden evidence. No fault injection or deletion claimed; optional inert-row cleanup not needed. Next: same funding GET and guards on next route change.

### sls-104 — fixed

Pages200/200/1,total401 each;401 distinct case-folded githubUsername values. All59 LATAM rows are members; zero omitted. Collection status count is not used as eligible denominator.

Exact reads: `https://stellarlight.xyz/api/builders?limit=200&offset=0`, `https://stellarlight.xyz/api/builders?limit=200&offset=200`, `https://stellarlight.xyz/api/builders?limit=200&offset=400`, `https://stellarlight.xyz/api/builders?location=Latin%20America&limit=200`.

Upstream: https://github.com/Stellar-Light/stellarlight/issues/1915, https://github.com/Stellar-Light/stellarlight/pull/1931. Resolve original full-set cap. Reconcile stale300/399 notes, preserve no exact eligible inference from collection count. Next: full pagination and LATAM subset after population changes.

### sls-105 — fixed

Closed Q2 row separates idea technicalRequirements from publishedBrief with immutable official source. All six SEP58 keys, trusted SDF-allowlisted image, public/tarball/content-addressed modes, verifier disagreements, Mainnet/Testnet and deterministic-Rust research exclusion agree with both historical sources. SEP58 query returns exactly this row.

Exact reads: `https://stellarlight.xyz/api/rfps?q=source%20verification`, `https://stellarlight.xyz/api/rfps?q=SEP-58`, `https://raw.githubusercontent.com/stellar/scf-handbook/1e04b79973358e3dea58d821ed6419b50c93370c/scf-awards/build-award/rfp-track.md`, `https://raw.githubusercontent.com/stellar/scf-handbook/e37c0d541ddbee5f06f152b9cd1f03bbe0321f23/scf-awards/build-award/rfp-track.md`.

Upstream: https://github.com/Stellar-Light/stellarlight/issues/1916, https://github.com/Stellar-Light/stellarlight/pull/1921. Resolve and correct stale brief-provenance golden note. Do not equate reproducible rebuilds with excluded compiler research. Next: query and pinned source comparison.

### sls-106 — fixed

Istanbul completed event discoverable with15000USD, local09-19–20; RiseIn card says09-18–20 but prose explicitly09-19–20, discrepancy explained in row. Waterloo active11-02–18,15000USD, organizer Velocity; active/keyword/full feed includes it and source agrees.

Exact reads: `https://stellarlight.xyz/api/hackathons?status=active`, `https://stellarlight.xyz/api/hackathons?q=istanbul`, `https://stellarlight.xyz/api/hackathons?q=waterloo`, `https://stellarlight.xyz/api/hackathons?q=innovation`, `https://stellarlight.xyz/api/hackathons?limit=100`, `https://www.risein.com/programs/stellar-pro-hackathon`, `https://uwaterloo.ca/events/events/blockchain-innovation-challenge-powered-stellar`.

Upstream: https://github.com/Stellar-Light/stellarlight/issues/1917, https://github.com/Stellar-Light/stellarlight/pull/1921. Resolve original missing-feed events. Winner ingestion owner job outside original scope. Next: same event queries and organizer pages after phase changes.

### sls-109 — fixed

Original three queries rank stellar-scaffold/cli, stellar/laboratory, stellar/soroban-examples first and canonical=true. Eight infrastructure controls retain intended rank1. scaffold_stellar/scaffold stellar repo/stellar lab repo pass. Old path search and trust resolve canonical with renamedFrom.

Exact reads: `https://stellarlight.xyz/api/repos/search?q=scaffold+stellar&limit=50`, `https://stellarlight.xyz/api/repos/search?q=stellar+lab&limit=5`, `https://stellarlight.xyz/api/repos/search?q=smart+contract+examples&limit=5`, `https://stellarlight.xyz/api/repos/trust?repo=theahaco%2Fscaffold-stellar`, `https://stellarlight.xyz/api/repos/trust?repo=stellar-scaffold%2Fcli`.

Upstream: https://github.com/Stellar-Light/stellarlight/issues/1901, https://github.com/Stellar-Light/stellarlight/pull/1925. Resolve ranking/rename scope. sls114 fixture-interface rescan remains distinct and active. Next: original3+8 controls and old-path trust on ranking changes.

### sls-110 — fixed

Structured rubric score1–5, weights20/20/15/15/10/10/10 sum100, exact criteria and Genesis/Scale distinction match organizer Build page.2025 six winner tracks/ranks remain;2026 no invented winner rows.

Exact reads: `https://stellarlight.xyz/api/hackathons/hackmeridian-2026`, `https://www.hackmeridian.com/build`, `https://stellarlight.xyz/api/hackathons/hackmeridian-2025`.

Upstream: https://github.com/Stellar-Light/stellarlight/issues/1902, https://github.com/Stellar-Light/stellarlight/pull/1921. Resolve rubric scope; no requirement to fabricate unpublished descriptions/winners. Next: exact seven criteria/weight comparison after organizer update.

### sls-101 — partial

Warning fixed: staleTvlUSD1664183220 of1980381301,3/17 and84%,oldest08-10; each stale row flagged. Underlying values unchanged: Spiko1653789314/Sentora10393904/Etherfuse2. Provider Spiko/Etherfuse null; current sentora parent Stellar82574002 and stellar-defi-hub82574002.67619. Original recommendation also required investigate Sentora and dated unavailable reasons; still incomplete.

Exact reads: `https://stellarlight.xyz/api/analyze?dimension=tvl`, `https://stellarlight.xyz/api/projects/search?q=spiko&limit=3`, `https://stellarlight.xyz/api/projects/search?q=sentora&limit=3`, `https://stellarlight.xyz/api/projects/search?q=etherfuse&limit=3`, `https://api.llama.fi/protocols`, `https://api.llama.fi/protocol/spiko`, `https://api.llama.fi/protocol/sentora`, `https://api.llama.fi/protocol/stellar-defi-hub`.

Upstream: https://github.com/Stellar-Light/stellarlight/issues/1912, https://github.com/Stellar-Light/stellarlight/pull/1928. Keep partial preferred. Retirement is defensible only after a self-contained stale-refresh/provider-unavailable successor is created and linked; warning-only closure must not imply refreshed values. Next: owner remap/enrich then same aggregate+3 rows and provider checks.

## Reference reconciliation and limits

`rg -l 'sk-037|cs-011|sls-(095|096|098|103|104|105|106|109|110)' eval/qa/corpus/battery improvements .agents/TODO.md` was run; exact paths retained in `tmp/truth-2026-11-05/docs/independent-refs.txt`. sk037/cs011 have no golden status claim. Retain historical cs003 receipt as historical evidence, linking the new cs011 resolution. Generated INDEX/intake/resolved handling belongs to root. Scout golden notes covering rename lag, open-Q3 lag, old funding baseline, builder counts, source-verification requirements and empty active feed must be reconciled in the same resolution change; original records name their consumer IDs. Preserve sls100 and ll032 ownership and sls114's live fixture residual. No blanket claim that these services now have full coverage.

sls101 decision: keep partial because the original recommendation expressly includes data-refresh/provider-unavailable work. A successor split is optional, not necessary to accurately report progress. The new warnings honestly expose stale values; do not restamp or zero those values. Provider `sentora` remains available directly as a parent despite absence from `/protocols`; `stellar-defi-hub` is the mapped child. Compare corresponding Stellar accounting, not independently timed exact equality.

The source guard review supports sls103's failure-path correction, but this lane did not inject production failures or delete inert historical snapshots. sls104 does not claim a private-profile security audit. sls106 does not claim the owner imported winner rows. sls098 did not call any metered partner operation. The failed guessed Freighter `develop` URL was corrected by reading repository default_branch=master and fetching `https://raw.githubusercontent.com/stellar/freighter/master/README.md` (HTTP200); it says Varial (formerly Freighter).

## Historical receipt source-pointer repair review

**Pass, six of six.** Fresh GETs of each replacement GitHub blob page and its raw immutable content returned HTTP200. Each source contains the expected frontmatter ID and discovery date, exactly matches `git show SHA:path`, and its commit is an ancestor of origin/main. Parsed comparison of the six resolved entries against `git show HEAD:improvements/resolved.json` finds only `sourceCommit` and `sourceUrl` changed: discovery/resolution dates, upstream/resolving references, liveRecheck and reviewEvidence are unchanged. This validates source-pointer repairs, not a new historical-fix recheck or equivalence to the unavailable old blobs.

| ID | Replacement immutable blob | Preserved resolution date |
|---|---|---|
| sd-010 | [b9098a92cab9](https://github.com/stellar-experimental/stellar-raven/blob/b9098a92cab915bdbb3e1e119837f6d11f4ff59e/improvements/stellar-docs/sd-010-alchemy-data-api-launch-stale.md) | 2026-07-15 |
| sd-018 | [c3ec26956b6e](https://github.com/stellar-experimental/stellar-raven/blob/c3ec26956b6e49fbe7006cabdaac17b8f65c7123/improvements/stellar-docs/sd-018-sac-cap67-event-schema-gap.md) | 2026-08-05 |
| sd-033 | [b9098a92cab9](https://github.com/stellar-experimental/stellar-raven/blob/b9098a92cab915bdbb3e1e119837f6d11f4ff59e/improvements/stellar-docs/sd-033-python-sdk-rpc-capability-omitted.md) | 2026-07-15 |
| sd-043 | [81ba59a695f4](https://github.com/stellar-experimental/stellar-raven/blob/81ba59a695f45f413e0a7b8dd1c444bfb56ed051/improvements/stellar-docs/sd-043-sponsored-reserves-min-balance-liabilities.md) | 2026-09-08 |
| sls-020 | [0306425752a0](https://github.com/stellar-experimental/stellar-raven/blob/0306425752a0fb4c1b1965d64236c5a975aafa5b/improvements/stellar-light-scout/sls-020-security-program-migration-retrieval.md) | 2026-07-15 |
| sls-023 | [76e0bf4d0082](https://github.com/stellar-experimental/stellar-raven/blob/76e0bf4d00829e63146be206c1c834db5c22166d/improvements/stellar-light-scout/sls-023-rwa-product-deployment-status.md) | 2026-09-08 |

Reproduce each public check with `curl -fLsS --retry 2 -A "Raven truth review/1.0" URL`, and the metadata comparison with a parsed ID-keyed diff of HEAD versus working `improvements/resolved.json`, excluding only those two source fields. Exact UTC/hash/status receipts and executable check: `tmp/truth-2026-11-05/docs/receipt-repair-review.json` and `verify-receipt-repairs.py`. No lifecycle or code changes by reviewer.
