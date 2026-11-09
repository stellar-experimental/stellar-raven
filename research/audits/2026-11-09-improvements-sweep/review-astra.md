# Independent Scout retirement review — 2026-11-09

Reviewer: independent reviewer `t3cc`, requested Astra lane. Author: `gpt-6.1-sol` lane; coordinator: Claude Opus. Scope: sls-099/100/102/112/114 retirement and sls-101/107 partial verdicts. No tracked files changed, upstream comments posted, owner jobs dispatched, paid calls made, or agents started.

## Verdicts

| Finding | Verdict | Scope |
|---|---|---|
| sls-099 | **retire** | Venue omissions and Phoenix API/contract ambiguity fixed in deployed descriptions. No successor needed. |
| sls-100 | **retire** | Both live records, lifecycle note and all three curation source values corrected. No domain-fix successor needed. |
| sls-102 | **retire** | Blend cites the correct common parent; four contributing rows and adjacent URLs checked. No successor needed. |
| sls-112 | **retire** | Chainlink network-specific proxy products and native MetaMask row exist; Snap remains explicitly distinct. No missing-row successor needed. |
| sls-114 | **retire** | Fixture interfaces removed from both rescanned platform examples; paths field exists. Separate sls-115 remains unresolved. No interface successor needed. |
| sls-101 | **do-not-retire** | Stale-warning fix deployed; original refresh/unavailable-provider residual persists. Keep reported-upstream, or first create a self-contained successor and link it upstream. |
| sls-107 | **do-not-retire** | Filter and schema semantics deployed; all 41 issuer-of-record checks remain unpopulated. Keep reported-upstream. |

“Retire” approves the technical resolution, **not an already-completed deletion**. The coordinator still must reconcile references, post/read back resolution comments with immutable source snapshots, run resolver dry runs, remove records/probes, append receipts and regenerate/validate artifacts. No new Raven verification comments were present in the inspected candidate issue threads; each had only the maintainer deployment comment. Those procedural gates are outstanding.

## Independence and methods

Read `tmp/review-brief.md`, the improvements charter and skill, each current finding, and each `git show origin/main:<finding-path>`. Origin/main was `be3e1f4190fbae785d7fc059332d66a62f151b82`; originals are saved as `tmp/review-astra-original-NNN.md`. Current findings necessarily included author-added evidence, but no author transcript, receipt or lane report was used to establish results.

Fresh GETs began 2026-11-09T20:40:31Z. The exact argv, request-start timestamps, status/final URLs and SHA-256 hashes are in `tmp/review-astra-data/requests.json`; response bodies and redirect headers are adjacent. Reproduction runner: `python3 tmp/review-astra-fetch.py`. Every request succeeded with HTTP 200 except the deliberate invalid assetType control (400). These were new network calls, including ordinary service-cached responses: e.g. analyze's `generatedAt` is 20:30:58.678Z. No cached response is represented as a newly run upstream maintenance job.

Read GitHub directly using `gh api ... --jq .` (not an HTML-normalizing issue tool): seven issues, all comments, timelines; linked PRs 1920/1923/1924/1925/1928, review comments, reviews and head check-runs. All five PRs are merged, all returned checks succeeded (5/8/12/10/9 respectively), and no submitted reviews were returned. Their bodies retain caveats; green checks did not establish deployment. GitHub JSON is under `tmp/review-astra-data/`.

Independent verdicts were frozen at **20:42:25.851602Z** in `tmp/review-astra-independent.json`, with `authorReportRead:false`. Only afterward did I read `tmp/lane-scout.md` and compare.

## sls-099 — retire

Original trigger: search Soroswap/Phoenix and compare their aggregation claims with the operator's API venue page and v3 contract reference.

Fresh commands:

```sh
curl -sS 'https://stellarlight.xyz/api/projects/search?q=soroswap&limit=100'
curl -sS 'https://stellarlight.xyz/api/projects/search?q=phoenix&limit=100'
curl -sS https://docs.soroswap.finance/aggregator/supported-amms.md
curl -sS https://docs.soroswap.finance/aggregator/technical-reference/contracts/aggregator-v3.md
```

Result: Soroswap names Soroswap AMM, Aquarius, SushiSwap V3 and Comet as Soroban API venues and SDEX as a separate classic path payment. Phoenix explicitly distinguishes the contract's Phoenix hop type from the API's venue list. Both original stale phrases are absent from **all descriptions in both response sets**. Other aggregators' claims refer to their own routing and do not contradict Soroswap's list. Primary docs still list API values `soroswap/aqua/sushi/comet/sdex`, while the v3 enum includes `Phoenix(PhoenixHop)`. This establishes the published scope distinction, not an authenticated quote execution.

Deployment evidence: [issue 1910](https://github.com/Stellar-Light/stellarlight/issues/1910), closed completed 2026-11-07T02:55:51Z. **theboycoder**, not Raven, [reports PR1924/spec1.9.123 and curate-projects execution on November 7](https://github.com/Stellar-Light/stellarlight/issues/1910#issuecomment-6701316899). [PR1924](https://github.com/Stellar-Light/stellarlight/pull/1924) merged 2026-11-07T01:48:28Z at `cad32dd9923270511e40c4f2d4c31c07cb27ac15`. Fresh public responses independently confirm the change is deployed.

## sls-100 — retire

Original trigger: Hana project links/status source/note, partner URL, redirect destination and repeated curation values.

Fresh GETs: `https://stellarlight.xyz/api/projects/search?q=hana&limit=100`, `https://stellarlight.xyz/api/partners/hana-wallet`, and both bare/www variants of `https://hana.money/` and `https://hanawallet.io/`, with `curl -sS -L -D <headers>` to retain the initial redirects.

Result: project `links.website=https://hanawallet.io/`; `statusSourceUrl=https://www.hanawallet.io/`; lifecycle note records the current same-site 308 and says the old domain no longer serves Hana. Partner `websiteUrl=https://www.hanawallet.io`. Bare wallet domain 308s to www, then 200 with title “Hana | Non-Custodial Multi-Chain Crypto Wallet”; live page includes Stellar. Both old domains still 307 to Wend and its remittance-product title. The bare/www normalization is not a residual wrong-product redirect.

Fresh `gh api repos/Stellar-Light/stellarlight/contents/scripts/data/curation-maps.ts --jq .` and the equivalent `scripts/data/curate-partners.ts` confirm `STATUS_FIX.hana.sourceUrl`, `WEBSITE_FIXES.hana`, and `URL_CORRECTIONS['hana-wallet']` all use www.hanawallet.io. Blob SHAs: `8b60ac70c3c80d471bc37bec4fa06bcd73ed198d`, `66544edd9eed4c03af475e06d69780aa2bed82b2`. Old-domain strings in comments describe the historical correction; they are not write values. Adjacent Freighter wording is a separate identity matter and does not reopen the domain defect.

Deployment: [issue 1911](https://github.com/Stellar-Light/stellarlight/issues/1911), closed completed 2026-11-07T02:55:53Z. **theboycoder** [reports both curate-projects and curate-partners executions after PR1924](https://github.com/Stellar-Light/stellarlight/issues/1911#issuecomment-6701317262). Both live records and durable correction inputs agree.

## sls-102 — retire

Fresh commands:

```sh
curl -sS 'https://stellarlight.xyz/api/projects/search?q=blend&limit=100'
curl -sS https://api.llama.fi/protocols
curl -sS https://api.llama.fi/protocol/blend
```

Result: Blend `tvlMethodUrl=https://defillama.com/protocol/blend`; both `statusChecks[].sourceUrl` use that parent. Mapping remains `blend-pools`, `blend-pools-v2`, `blend-backstop`, `blend-backstop-v2`. Provider lists every child under `parent#blend`; their base Stellar values are 38,785.349703652435 + 114,692,125.18124765 + 0 + 0. Parent Stellar TVL is 114,730,910 and exposes borrowed (34,650,959) and pool2 (0) separately. It supplies 889 Stellar history points. Scout's 115,148,044 observation at 13:44:29.805Z is not claimed equal to a later provider reading. Single-slug Soroswap still links to `/protocol/soroswap-amm`.

Deployment: [issue 1913](https://github.com/Stellar-Light/stellarlight/issues/1913), closed completed 2026-11-07T01:48:30Z. **theboycoder** [reports the enrich-tvl execute and four-child accounting](https://github.com/Stellar-Light/stellarlight/issues/1913#issuecomment-6701318370) at 02:56:00Z after PR1924. Live correction is present; no null method link or V1-only residual.

## sls-112 — retire

Fresh GETs independently repeated exact resolves for `Chainlink`/`MetaMask`, searches for `chainlink`/`metamask` with limit100, [Chainlink's Stellar page](https://docs.chain.link/data-feeds/stellar) and [MetaMask's network page](https://support.metamask.io/configure/networks/stellar).

Both resolves return `found:true`, `matchedOn:slug`, Live. Chainlink has Oracle type and two sourced, dated `oracle-feed` products:

- Testnet: `CBUF6IADAWPWIDWRTHJNINKXHG2UTIQ6TU2F2HRAXWAI7OT3KJPKK6O4`.
- Mainnet: `CDQBHEUGLDHMSUHG4IH33RJBUTMNCZOT4JIAQR4WZFRDZW6DR6S32ZLZ`.

Both IDs/network associations match the primary docs. Native MetaMask has Wallet type and `productKind:end-user-wallet`; it describes default Stellar support without a Snap. `stellar-metamask` calls itself the separate community Snap and refers to the native record. The third-party relayer remains distinct. `supportedNetworks:null` on the new project rows does not erase explicit network-specific product evidence or reproduce missing first-party rows. No per-feed freshness claim is established; sls-029 remains separate.

Deployment: [issue 1904](https://github.com/Stellar-Light/stellarlight/issues/1904), closed completed 2026-11-07T02:55:56Z. **theboycoder** [reports PR1924's November 7 seed execution](https://github.com/Stellar-Light/stellarlight/issues/1904#issuecomment-6701317637). Fresh reads verify more than the comment's mainnet-only example: testnet is also populated.

## sls-114 — retire

Fresh original trigger:

```sh
curl -sSG https://stellarlight.xyz/api/repos/explain \
 --data-urlencode 'repo=stellar/stellar-horizon' \
 --data-urlencode 'q=Which Horizon ingestion constant pins the highest supported protocol version, and what is its value?'
```

Horizon: `kind:platform`, `isDeployableContract:false`, `contractInterface:[]`, `contractInterfacePaths:[]`; `scannedAt=2026-11-07T02:46:33.460Z`, `scannedRef=6a13f41808586884c9a7b1beecd92088b7284070`. Fresh `gh api 'repos/stellar/stellar-horizon/git/trees/6a13f41808586884c9a7b1beecd92088b7284070?recursive=1' --jq .` returns a complete tree containing `internal/integration/contracts/{increment,add_u64,bulk,constructor,store,sac_test}/src/lib.rs`. The fixtures still exist; their interfaces are now excluded.

Adjacent read for `stellar/rs-soroban-env` also returns platform/false, empty interfaces/paths, scan `2026-11-07T02:47:10.638Z`, ref `0c99950e96128beba3319aa96b116646ce974e69`.

Deployment: [issue 1906](https://github.com/Stellar-Light/stellarlight/issues/1906), closed completed 2026-11-07T02:55:58Z. **theboycoder** [reports both rescans and distinguishes remaining code-facts scope](https://github.com/Stellar-Light/stellarlight/issues/1906#issuecomment-6701318060). [PR1925](https://github.com/Stellar-Light/stellarlight/pull/1925) merged November5, `bf5cd0c7c9271c809c2540b5d0874c46915e0a8a`; November7 scans demonstrate application after merge.

Residual scan: `stellarProof:cargo-sdk` still exists; upstream `improvements/TODO.md` explicitly owns broader code-signals counting test code. Answer drift also remains: returned answer says ceiling29, while fresh `gh api 'repos/stellar/stellar-horizon/contents/internal/ingest/main.go?ref=6a13f41808586884c9a7b1beecd92088b7284070' --jq .` decodes to `MaxSupportedProtocolVersion uint32 = 30` at line38. That is existing sls-115, not a new interface successor.

## sls-101 — do-not-retire; exact upstream verification result

Date correction: [issue1912](https://github.com/Stellar-Light/stellarlight/issues/1912) closed completed **November5 at 15:19:23Z**, not November7–8. **theboycoder's November8 comment** at [6716723645](https://github.com/Stellar-Light/stellarlight/issues/1912#issuecomment-6716723645) acknowledges the old readings and confirms only the warning fix. [PR1928](https://github.com/Stellar-Light/stellarlight/pull/1928) merged November5 at 15:19:21Z, `192450836203ce95e52d6e0bf2c9e9269c692ce4`.

Coordinator-ready verification text (not posted):

> Independently rechecked on 2026-11-09 at 20:40Z using GET /api/analyze?dimension=tvl, the Spiko/Sentora/Etherfuse project searches, and DefiLlama /protocols plus the three /protocol/<slug> endpoints. The warning fix is live: totalTvlUSD 1,980,977,979; staleTvlUSD 1,664,183,220; oldestAsOf 2026-08-10T06:16:01.283Z; staleWarning identifies 3/17 readings and rounded84% of the total. All three project rows carry tvlStale:true. The stored values remain Spiko 1,653,789,314 at 2026-09-14T10:30:21.591Z, Sentora 10,393,904 at 2026-08-10T06:16:01.283Z, Etherfuse 2 at 2026-09-14T10:30:21.591Z. DefiLlama lists Spiko/Etherfuse with null TVL and empty chainTvls; their detail endpoints have currentChainTvls:{}. Sentora's parent currently reports Stellar 82,515,901; the /protocols entry stellar-defi-hub has parentProtocol parent#sentora and Stellar 82,515,901.55913755, while Scout still maps llamaSlugs:['sentora']. Thus warning disclosure is verified; provider-remap/availability handling remains unfinished. Please preserve the warning, refresh/remap Sentora, and represent unavailable provider values with a dated reason rather than a fresh zero, consistently across project rows and aggregate.

Exact URLs: `https://stellarlight.xyz/api/analyze?dimension=tvl`; `https://stellarlight.xyz/api/projects/search?q={spiko,sentora,etherfuse}&limit=100` (three separate requests); `https://api.llama.fi/protocols`; `https://api.llama.fi/protocol/{spiko,sentora,etherfuse}` (three requests).

No claim that stale inclusion itself is now undisclosed: the response openly retains those values. The residual is remap/availability handling in the record's recommendation. If the coordinator wants to retire the warning-only scope, first create a self-contained successor “Stale project TVL survives provider remaps/removals” with these three fixtures, warning positive controls, exact provider identities, dated observations and consistent aggregate/project acceptance criteria, and link it from the old upstream issue. Until then retain sls-101; no status change to fixed-upstream is justified.

## sls-107 — do-not-retire; exact upstream verification result

Date correction: [issue1900](https://github.com/Stellar-Light/stellarlight/issues/1900) closed completed **November5 at 16:11:54Z**, with **no issue comments**. Do not invent a November7–8 maintainer completion comment. The evidence is **theboycoder's PR body**, [PR1923](https://github.com/Stellar-Light/stellarlight/pull/1923), merged November5 at16:11:52Z, `e7cbc1262edf9e515c8b5522b343fef54eb3e948`. It explicitly requires owner opt-in `STABLECOIN_ISSUER_OF_RECORD_WRITE` and an execute/readback. [PR1920](https://github.com/Stellar-Light/stellarlight/pull/1920) is documentation-only, not issuer population. I did not inspect private variable state or infer why the write has not materialized.

Coordinator-ready verification text (not posted):

> Independently rechecked on 2026-11-09 at 20:40Z. GET /api/stablecoins?limit=100 returns41 rows, dataAsOf 2026-11-09T06:53:45.989Z. All41 have null issuerOfRecord, issuerOfRecordCheck, issuerOfRecordSourceUrl, issuerOfRecordAsOf and issuerOfRecordNote. This includes AUDD (brand Novatti Group) and all eight Currency One assets: C1USD/C1EUR/C1GBP/C1AUD/C1CAD/C1CHF/C1AED/C1SGD. Fresh primary stellar.toml reads still name AUDC PTY LTD for AUDD and Kinesis Money Panama S.A. for the C1 assets, and list the corresponding issuer accounts. MGUSD's TOML names MoneyGram Payment Systems, Inc.; its currency description names Bridge, while Scout's issuer and note fields remain null. The filter portion is fixed: assetType=Yield%20Stablecoin returns USDY/YLDS only (2); assetType=none returns38 unclassified rows; invalid returns400. OpenAPI1.9.127 documents company as brand and null class as unknown, not verified par. Please complete the authorized issuer-of-record population/readback, preserving source/date and the MGUSD Bridge note. The schema/filter deploy is verified; issuer population is not.

Exact URLs: `https://stellarlight.xyz/api/stablecoins?limit=100`; same endpoint with `assetType=Yield%20Stablecoin`, `assetType=none`, `assetType=invalid`; `https://stellarlight.xyz/api/openapi.json`; `https://audd.digital/.well-known/stellar.toml`; `https://currency.one/.well-known/stellar.toml`; `https://mgusd.moneygram.com/.well-known/stellar.toml`.

Adjacent:40 rows are unmeasured and include HTTP402 measurement-failure notes. Those are returned service facts, not an authorization to buy anything or proof of why issuer checks are null. There is no basis to change this to declined-upstream: no maintainer refusal was found. If splitting, successor scope is “Stablecoin issuer-of-record fields remain unpopulated after schema deploy,” preserving the nine mismatched-brand fixtures, MGUSD control, source/date/note checks and already-fixed filter controls. Until that self-contained handoff exists, keep sls-107 active.

## Author comparison and corrections

All seven lifecycle verdicts agree with the author. My checks were newly executed and independently frozen before reading the lane report. Figures/fields reproduce; varying fetch hashes or service generation timestamps are not disagreements.

One factual wording correction in the author's sls-114 narrative: the original Recommendation says “Give each contractInterface entry its source path, **or mark entries** from fixture, test, or example folders as fixtures.” It does **not explicitly permit removal**, contrary to the lane sentence “explicitly permitted fixture removal/marking.” Removal still resolves the actual finding (readers mistaking test interfaces for shipped contracts), and the November6 recurrence already accepted removal as a recheck criterion. Keep the retire verdict but describe this as a valid alternative resolution, not a quote from the original recommendation.

The closure-date correction above is against the task premise, not against the author: the author's detailed sections correctly state November5 for sls-101/107. No other substantive disagreements.

## Persistent references and remaining retirement gates

Executed separately for all seven IDs:

```sh
rg -n --hidden -g '!node_modules/**' -g '!.git/**' -g '!tmp/**' '<id>' .
```

Full line matches: `tmp/review-astra-references.json`. The inventory below is independently generated. Dated audit/round/research observations should remain dated historical evidence; repair any intended-live links rather than rewriting history. Current golden path-valued provenance needs commit-pinned source URLs or resolved receipt references. Generated files must be rebuilt, not hand edited.

- **099:** reconcile four canonical cases under `eval/qa/corpus/battery/defi-ecosystem/`: `q-defi-phoenix-what-is.json`, `q-defi-soroswap-what-is.json`, `q-defi-soroswap-vs-stellarx.json`, `q-defi-provide-liquidity-impermanent-loss.json`. Replace active deleted-file rootCause/evidence pointers; add current recheck without erasing dated stale quotes. Regenerate `eval/qa/cases.json` and `eval/qa/sample.json` as applicable. Update grouped `.agents/TODO.md` and current handoff/round status. Remove its obsolete defect-presence probe with the file.
- **100:** reconcile `eval/qa/corpus/battery/defi-ecosystem/q-eco-hana-wallet-scf.json` evidence/rootCause and generated `eval/qa/cases.json`. Keep the old-domain historical observation, but stop implying Scout currently links to it. Remove embedded probe with file.
- **102:** update current cross-reference in `improvements/stellar-light-scout/sls-039-project-tvl-history-capability.md` to resolved/pinned evidence; retain its historical recurrence. Review finding-declared `q-edge-fresh-latest-blend-tvl` even though no literal sls-102 match appears. Remove embedded probe with file.
- **112:** `.agents/TODO.md` still says this stays open; update it. Reconcile `improvements/stellar-light-scout/sls-029-oracle-product-network-evidence.md`'s new sls-112 fix reference; retain other provider residuals. Neither sls-112 nor sls-114 has an embedded probe.
- **114:** update `.agents/TODO.md`'s waiting-for-rescan language and current scope pointer in `improvements/stellar-light-scout/sls-115-horizon-ceiling-note-scan-drift.md`. `improvements/resolved.json` already refers to114 from sls-088: preserve historical successor ID and make the new114 receipt discoverable, never reuse either ID.
- **101/107 retained:** keep active IDs and existing references; update TODO only with exact residual acceptance checks. If later split, audit all the listed references and finding-declared consumers; 101 names `q-edge-noinfo-exact-tvl-figure` despite no literal ID match.

For all five retired candidates, resolver must remove the file (including any probe), remove a per-finding intake override if one exists, regenerate INDEX and append a complete resolved receipt. The ID scan found no per-finding intake overrides for these seven. Before mutation, post/read back a dated independent live result and immutable source snapshot on each associated upstream ref; resolving PRs1924/1925 must be handled consistently with the resolver's upstream-ref contract. Comments were not authorized in this reviewer lane. Run required improvements/golden gates after coordinator edits. I did not run tests or mutate generated artifacts in this read-only review.

## Exact live request receipt index

Executed argv form: `curl -sS -L --max-time 50 -D tmp/review-astra-data/<key>.headers -o tmp/review-astra-data/<key>.body -w '%{http_code} %{url_effective}' <URL>`. The table records request-start UTC; redirect chains are in headers. The JSON manifest additionally preserves every SHA-256.

| Key | Request-start UTC | HTTP | Exact URL |
|---|---|---|---|
| soroswap | 2026-11-09T20:40:31.095367+00:00 | 200 | https://stellarlight.xyz/api/projects/search?q=soroswap&limit=100 |
| phoenix | 2026-11-09T20:40:31.095509+00:00 | 200 | https://stellarlight.xyz/api/projects/search?q=phoenix&limit=100 |
| hana | 2026-11-09T20:40:31.095598+00:00 | 200 | https://stellarlight.xyz/api/projects/search?q=hana&limit=100 |
| blend | 2026-11-09T20:40:31.095693+00:00 | 200 | https://stellarlight.xyz/api/projects/search?q=blend&limit=100 |
| spiko | 2026-11-09T20:40:31.098456+00:00 | 200 | https://stellarlight.xyz/api/projects/search?q=spiko&limit=100 |
| sentora | 2026-11-09T20:40:31.098698+00:00 | 200 | https://stellarlight.xyz/api/projects/search?q=sentora&limit=100 |
| etherfuse | 2026-11-09T20:40:31.103730+00:00 | 200 | https://stellarlight.xyz/api/projects/search?q=etherfuse&limit=100 |
| chainlink | 2026-11-09T20:40:31.106504+00:00 | 200 | https://stellarlight.xyz/api/projects/search?q=chainlink&limit=100 |
| metamask | 2026-11-09T20:40:31.887226+00:00 | 200 | https://stellarlight.xyz/api/projects/search?q=metamask&limit=100 |
| resolve-Chainlink | 2026-11-09T20:40:32.127065+00:00 | 200 | https://stellarlight.xyz/api/projects/resolve?q=Chainlink |
| resolve-MetaMask | 2026-11-09T20:40:32.266377+00:00 | 200 | https://stellarlight.xyz/api/projects/resolve?q=MetaMask |
| hana-partner | 2026-11-09T20:40:32.401473+00:00 | 200 | https://stellarlight.xyz/api/partners/hana-wallet |
| tvl | 2026-11-09T20:40:32.492969+00:00 | 200 | https://stellarlight.xyz/api/analyze?dimension=tvl |
| stablecoins | 2026-11-09T20:40:32.531187+00:00 | 200 | https://stellarlight.xyz/api/stablecoins?limit=100 |
| yield | 2026-11-09T20:40:32.628978+00:00 | 200 | https://stellarlight.xyz/api/stablecoins?assetType=Yield%20Stablecoin |
| none | 2026-11-09T20:40:32.674074+00:00 | 200 | https://stellarlight.xyz/api/stablecoins?assetType=none |
| invalid | 2026-11-09T20:40:32.794355+00:00 | 400 | https://stellarlight.xyz/api/stablecoins?assetType=invalid |
| openapi | 2026-11-09T20:40:32.848470+00:00 | 200 | https://stellarlight.xyz/api/openapi.json |
| amms | 2026-11-09T20:40:33.061295+00:00 | 200 | https://docs.soroswap.finance/aggregator/supported-amms.md |
| agg-v3 | 2026-11-09T20:40:33.291363+00:00 | 200 | https://docs.soroswap.finance/aggregator/technical-reference/contracts/aggregator-v3.md |
| llama-list | 2026-11-09T20:40:33.412309+00:00 | 200 | https://api.llama.fi/protocols |
| chainlink-doc | 2026-11-09T20:40:33.722862+00:00 | 200 | https://docs.chain.link/data-feeds/stellar |
| metamask-doc | 2026-11-09T20:40:34.026577+00:00 | 200 | https://support.metamask.io/configure/networks/stellar |
| llama-spiko | 2026-11-09T20:40:34.050595+00:00 | 200 | https://api.llama.fi/protocol/spiko |
| llama-sentora | 2026-11-09T20:40:34.160854+00:00 | 200 | https://api.llama.fi/protocol/sentora |
| llama-etherfuse | 2026-11-09T20:40:34.313214+00:00 | 200 | https://api.llama.fi/protocol/etherfuse |
| llama-blend | 2026-11-09T20:40:34.419741+00:00 | 200 | https://api.llama.fi/protocol/blend |
| hana.money | 2026-11-09T20:40:34.616868+00:00 | 200 | https://hana.money/ |
| www.hana.money | 2026-11-09T20:40:34.640429+00:00 | 200 | https://www.hana.money/ |
| hanawallet.io | 2026-11-09T20:40:35.234042+00:00 | 200 | https://hanawallet.io/ |
| www.hanawallet.io | 2026-11-09T20:40:35.257189+00:00 | 200 | https://www.hanawallet.io/ |
| mgusd.moneygram.com | 2026-11-09T20:40:35.584461+00:00 | 200 | https://mgusd.moneygram.com/.well-known/stellar.toml |
| audd.digital | 2026-11-09T20:40:35.683599+00:00 | 200 | https://audd.digital/.well-known/stellar.toml |
| currency.one | 2026-11-09T20:40:35.857859+00:00 | 200 | https://currency.one/.well-known/stellar.toml |
| explain-stellar-horizon | 2026-11-09T20:40:36.377438+00:00 | 200 | https://stellarlight.xyz/api/repos/explain?repo=stellar%2Fstellar-horizon&q=Which+Horizon+ingestion+constant+pins+the+highest+supported+protocol+version%2C+and+what+is+its+value%3F |
| explain-rs-soroban-env | 2026-11-09T20:40:36.544257+00:00 | 200 | https://stellarlight.xyz/api/repos/explain?repo=stellar%2Frs-soroban-env&q=Which+Horizon+ingestion+constant+pins+the+highest+supported+protocol+version%2C+and+what+is+its+value%3F |

## Exact GitHub read commands

Issue reads and comments/timelines completed at 2026-11-09T20:40:32–20:40:34Z. All were successful. PR/source/check reads followed in the same review before this report. Each JSON retains the returned body or source blob; no private credentials were printed.

```sh
gh api repos/Stellar-Light/stellarlight/issues/1910 --paginate --jq .
gh api repos/Stellar-Light/stellarlight/issues/1910/comments --paginate --jq .
gh api repos/Stellar-Light/stellarlight/issues/1910/timeline --paginate --jq .
gh api repos/Stellar-Light/stellarlight/issues/1911 --paginate --jq .
gh api repos/Stellar-Light/stellarlight/issues/1911/comments --paginate --jq .
gh api repos/Stellar-Light/stellarlight/issues/1911/timeline --paginate --jq .
gh api repos/Stellar-Light/stellarlight/issues/1912 --paginate --jq .
gh api repos/Stellar-Light/stellarlight/issues/1912/comments --paginate --jq .
gh api repos/Stellar-Light/stellarlight/issues/1912/timeline --paginate --jq .
gh api repos/Stellar-Light/stellarlight/issues/1913 --paginate --jq .
gh api repos/Stellar-Light/stellarlight/issues/1913/comments --paginate --jq .
gh api repos/Stellar-Light/stellarlight/issues/1913/timeline --paginate --jq .
gh api repos/Stellar-Light/stellarlight/issues/1900 --paginate --jq .
gh api repos/Stellar-Light/stellarlight/issues/1900/comments --paginate --jq .
gh api repos/Stellar-Light/stellarlight/issues/1900/timeline --paginate --jq .
gh api repos/Stellar-Light/stellarlight/issues/1904 --paginate --jq .
gh api repos/Stellar-Light/stellarlight/issues/1904/comments --paginate --jq .
gh api repos/Stellar-Light/stellarlight/issues/1904/timeline --paginate --jq .
gh api repos/Stellar-Light/stellarlight/issues/1906 --paginate --jq .
gh api repos/Stellar-Light/stellarlight/issues/1906/comments --paginate --jq .
gh api repos/Stellar-Light/stellarlight/issues/1906/timeline --paginate --jq .
gh api repos/Stellar-Light/stellarlight/pulls/1920 --paginate --jq .
gh api repos/Stellar-Light/stellarlight/pulls/1920/comments --paginate --jq .
gh api repos/Stellar-Light/stellarlight/pulls/1920/reviews --paginate --jq .
gh api repos/Stellar-Light/stellarlight/commits/b8cbc9d4f5b4549916d9596262b19bf394b9803f/check-runs --jq '[.check_runs[]|{name,status,conclusion,html_url}]'
gh api repos/Stellar-Light/stellarlight/pulls/1923 --paginate --jq .
gh api repos/Stellar-Light/stellarlight/pulls/1923/comments --paginate --jq .
gh api repos/Stellar-Light/stellarlight/pulls/1923/reviews --paginate --jq .
gh api repos/Stellar-Light/stellarlight/commits/1d2ee3ded21e1c8ab3a7ad74d608a2483d0e2c3b/check-runs --jq '[.check_runs[]|{name,status,conclusion,html_url}]'
gh api repos/Stellar-Light/stellarlight/pulls/1924 --paginate --jq .
gh api repos/Stellar-Light/stellarlight/pulls/1924/comments --paginate --jq .
gh api repos/Stellar-Light/stellarlight/pulls/1924/reviews --paginate --jq .
gh api repos/Stellar-Light/stellarlight/commits/bf6b88a84ee74c0e263cb7f2d1adec69634d99b5/check-runs --jq '[.check_runs[]|{name,status,conclusion,html_url}]'
gh api repos/Stellar-Light/stellarlight/pulls/1925 --paginate --jq .
gh api repos/Stellar-Light/stellarlight/pulls/1925/comments --paginate --jq .
gh api repos/Stellar-Light/stellarlight/pulls/1925/reviews --paginate --jq .
gh api repos/Stellar-Light/stellarlight/commits/514a5406317d1741ba8ec32588825f6d0774a503/check-runs --jq '[.check_runs[]|{name,status,conclusion,html_url}]'
gh api repos/Stellar-Light/stellarlight/pulls/1928 --paginate --jq .
gh api repos/Stellar-Light/stellarlight/pulls/1928/comments --paginate --jq .
gh api repos/Stellar-Light/stellarlight/pulls/1928/reviews --paginate --jq .
gh api repos/Stellar-Light/stellarlight/commits/bc011b00997437a884635f024ae175b8ae8ddfcc/check-runs --jq '[.check_runs[]|{name,status,conclusion,html_url}]'
gh api repos/Stellar-Light/stellarlight/contents/improvements/TODO.md --jq .
```
