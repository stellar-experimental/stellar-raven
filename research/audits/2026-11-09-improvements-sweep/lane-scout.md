# Scout author lane — 2026-11-09

Author: Codex workhorse `gpt-6.1-sol`, high, hc `t3bq`. This is author evidence, not the required independent retirement review. No agents, paid calls, owner maintenance writes, GitHub comments, commits, resolver, index regeneration, or deletions were performed. Only the 13 Scout finding files were edited.

Five author-side retirement candidates: **sls-099, sls-100, sls-102, sls-112, sls-114**. Six partial findings retain residuals; sls-039 keeps its accepted declined boundary; sls-115 still reproduces against a newer source scan.

## State table

| Finding | Ref state (fresh direct read) | Live trigger result | Verdict | Proposed action |
|---|---|---|---|---|
| sls-024 | Stellar-Light/stellarlight/issues/494 closed; Stellar-Light/stellar-scout/issues/9 closed | 1,008 category-paged rows: lifecycle basis/date complete; 105 positive deployments, 56 without source and 35 without network list. | **partial** | Keep current status; retain narrowed residual; scope-only successor proposal below if coordinator chooses a split. |
| sls-029 | Stellar-Light/stellarlight/issues/514 closed; Stellar-Light/stellarlight/issues/742 closed | Band/DIA/RedStone products null; Lightecho address null; Chainlink now has both network products. Per-feed coverage still absent for original providers. | **partial** | Keep current status; retain narrowed residual; scope-only successor proposal below if coordinator chooses a split. |
| sls-033 | Stellar-Light/stellarlight/issues/519 closed; Stellar-Light/stellarlight/issues/742 closed | Wallet exact set 74/74/74 distinct names; 11 null productKind; 41 without availability. | **partial** | Keep current status; retain narrowed residual; scope-only successor proposal below if coordinator chooses a split. |
| sls-039 | Stellar-Light/stellarlight/issues/522 closed; Stellar-Light/stellarlight/pull/530 closed merged | Current point/provenance only; provider Blend Stellar history has 889 points. Provider-hosted boundary still applies. | **no-change (declined boundary)** | Keep declined-upstream; no refile; revisit only on provider-history loss or owner scope change. |
| sls-099 | Stellar-Light/stellarlight/issues/1910 closed | Both descriptions corrected; operator API/contract pages agree; no old unqualified venue claim in either result set. | **fixed** | Set fixed-upstream (done); independent review, reference cleanup, resolution comments, then resolver. |
| sls-100 | Stellar-Light/stellarlight/issues/1911 closed | Project website/status/note and partner website corrected; both source maps corrected; wallet title verified. | **fixed** | Set fixed-upstream (done); independent review, reference cleanup, resolution comments, then resolver. |
| sls-101 | Stellar-Light/stellarlight/issues/1912 closed | Warning live: stale $1,664,183,220 (3/17, 84%) in total $1,980,977,979. Three stale source values remain. | **partial** | Keep current status; retain narrowed residual; scope-only successor proposal below if coordinator chooses a split. |
| sls-102 | Stellar-Light/stellarlight/issues/1913 closed | Blend cites parent /protocol/blend; four children share parent#blend; both status-check URLs use parent. | **fixed** | Set fixed-upstream (done); independent review, reference cleanup, resolution comments, then resolver. |
| sls-107 | Stellar-Light/stellarlight/issues/1900 closed | Filter/schema live; all 41 issuerOfRecord/check values null. Primary AUDD/C1 TOMLs still differ from brand. | **partial** | Keep current status; retain narrowed residual; scope-only successor proposal below if coordinator chooses a split. |
| sls-111 | Stellar-Light/stellarlight/issues/1903 open | 623 awarded directory rows; 28 with #45 vs 40 official cards. Liqvid [37,45] now correct; 12 official source pages missing from the #45 directory set. | **partial** | Keep current status; retain narrowed residual; scope-only successor proposal below if coordinator chooses a split. |
| sls-112 | Stellar-Light/stellarlight/issues/1904 closed | Both exact resolves succeed; Chainlink has both original network/address products; native MetaMask distinct from Snap. | **fixed** | Set fixed-upstream (done); independent review, reference cleanup, resolution comments, then resolver. |
| sls-114 | Stellar-Light/stellarlight/issues/1906 closed | Horizon and rs-soroban-env freshly scanned, interfaces/paths empty; fixture code still exists in scanned source. | **fixed** | Set fixed-upstream (done); independent review, reference cleanup, resolution comments, then resolver. |
| sls-115 | Stellar-Light/stellarlight/issues/1933 open | Both questions select October 8 note saying 29; new November 7 scanned ref still defines 30. | **still-repro** | Keep reported-upstream; recurrence appended; next signal is note/scan invalidation fix on #1933. |

## Reproduction and receipts

All HTTP calls were unauthenticated read-only GETs. The `.env` keys were not needed, read, printed, or copied. `tmp/scout-live.py` performs the listed GETs with `curl -sS -L --max-time 20 -D <temporary-header-file> -w "\n%{http_code}\n%{url_effective}" <URL>` and stores parsed response bodies, redirect headers, observation timestamps and SHA-256 hashes. The preserved completed curl receipt is **tmp/scout-live-curl.json** (do not use the earlier urllib attempt). The oracle/OpenAPI timeouts were retried successfully in **tmp/scout-extra.json**. No failed/empty transport response was classified as an upstream fix.

Exact GitHub body reads used `gh api repos/<owner>/<repo>/issues/<number> --jq '{html_url,title,state,state_reason,body,user:.user.login,closed_at,updated_at,merged,merged_at,merge_commit_sha}'`, comments used `gh api repos/<owner>/<repo>/issues/<number>/comments?per_page=100 --jq '[.[]|{html_url,user:.user.login,created_at,updated_at,body}]'`, and issue timelines supplied closure actors and linked PRs. PR reads use `/pulls/<number>`; reviews `/pulls/<number>/reviews`; checks `/commits/<head>/check-runs`. **tmp/scout-github.json** and **tmp/scout-prs.json** retain exact decoded bodies/authors. Fresh issue reads span 20:30:13–20:30:18Z; PR reads began 20:31:06–20:31:08Z.

All six recent linked PRs (#1920, #1922, #1923, #1924, #1925, #1928) are merged, with every returned check successful and zero submitted GitHub reviews. Their PR bodies describe additional open work; success checks and merge do not prove deployment or completion. These are maintainer-authored PRs (`theboycoder`), not Raven-owned PRs awaiting our rebase/CI response. Historical PR #530 is also merged; its Vercel bot comment is not maintainer verification.

## sls-024 — partial

**Why it remains reported-upstream after old closures:** #494 and stellar-scout#9 closed on August 11 after lifecycle-provenance backfill. Maintainer `theboycoder` explicitly excluded deployment qualifiers and store/integration provenance from that closure ([#494 closure comment](https://github.com/Stellar-Light/stellarlight/issues/494#issuecomment-5259690253), [Scout duplicate](https://github.com/Stellar-Light/stellar-scout/issues/9#issuecomment-5259690727)). Later August 25 residual comments were by Raven author **kalepail**, not independent maintainer acceptance. The current record has already narrowed to positive-deployment provenance. The five original fixtures now all have lifecycle provenance; retaining this record must not claim those fields remain missing.

Full seven-category pagination, independently collected by `python3 tmp/scout-categories.py`, reached 1,008 unique slugs, with no partial/errors. All have lifecycle date/basis; every non-unverified lifecycle has a source. Positive deployments: 105; no deployment source: 56; no supportedNetworks: 35. Allbridge is mainnet/onchain-activity with deployment source null. RenderGate/CleverCon are now correctly **testnet**, with null deployment source. Unknown deployment fields remain honest unknowns. The original streaming query was separately repeated at 20:34:14Z (100 returned / 303 matches; majority tier); its first page is not a population count. Receipt `tmp/scout-streaming.json`, SHA-256 `811bd35706f72da6f6eee64f598378210c699ef1ec7619250b987912dfe270c0`.

**If splitting the partial record:** proposed successor “Positive project deployment claims lack deployment evidence URLs.” Repro: paginate the seven categories; select deployment.network != unknown; show Allbridge and RenderGate/CleverCon. Ask: source/date for positive network claims, keeping unknowns unknown and lifecycle separate. Retain current sls-024 until successor is self-contained and both old refs link it. Do not create another broad lifecycle-backfill request.

Fresh upstream ref reads:

- https://github.com/Stellar-Light/stellarlight/issues/494: closed, reason completed, closed 2026-08-11T22:40:41Z, updated 2026-09-08T18:11:36Z; fetched 2026-11-09T20:30:13.725380+00:00.
  Latest comment: **kalepail**, 2026-09-08T18:11:36Z, https://github.com/Stellar-Light/stellarlight/issues/494#issuecomment-5589712494. Comment direction matters; Raven author comments are not owner validation.
- https://github.com/Stellar-Light/stellar-scout/issues/9: closed, reason completed, closed 2026-08-11T22:40:44Z, updated 2026-08-25T19:51:25Z; fetched 2026-11-09T20:30:13.507184+00:00.
  Latest comment: **kalepail**, 2026-08-25T19:51:25Z, https://github.com/Stellar-Light/stellar-scout/issues/9#issuecomment-5415888272. Comment direction matters; Raven author comments are not owner validation.

Live request receipts (command form above; full bodies/hashes in tmp/scout-live-curl.json):

- `search-slender` — 2026-11-09T20:31:57.476932+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?q=slender&limit=100; SHA-256 `5bec99c00280adf66825876440f1401d700c7801be8291e158e4a58ebaa57ef1`.
- `search-laina` — 2026-11-09T20:31:57.514431+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?q=laina&limit=100; SHA-256 `6ba3d11ea91a0feb6e815e7c75e28fbde6c214cd6da294390022de8344907123`.
- `search-k2 lend` — 2026-11-09T20:31:57.563545+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?q=k2+lend&limit=100; SHA-256 `91ce6e9141f0ceeae1af7e8a97d203efa3a9027c10c50bbb64755f99ac4ff8e9`.
- `search-orbitcdp` — 2026-11-09T20:31:57.616571+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?q=orbitcdp&limit=100; SHA-256 `0c8bf5954e33ce311f91dce97bbc70a2a0020b13e7522d889f2ad7d605266ebd`.
- `search-fluxity` — 2026-11-09T20:31:57.663263+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?q=fluxity&limit=100; SHA-256 `bf4e93f3508574289378190e50cde042c9a00f2a4003a82975b988d797ede8a9`.
- `search-allbridge` — 2026-11-09T20:31:57.751201+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?q=allbridge&limit=100; SHA-256 `0a642a8133c823165320e4215b0e668cb68b595a4223cc73f05408f97e6b51e9`.
- `search-rendergate` — 2026-11-09T20:31:57.771529+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?q=rendergate&limit=100; SHA-256 `50edc7f68a4fdfd443ddafc37d3891767b03ded424a91421b222c16674c13075`.
- `search-clevercon` — 2026-11-09T20:31:57.907850+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?q=clevercon&limit=100; SHA-256 `a1c4da02f164b136c03e3b9556adf603d5b9d041b6a3f69c9774d2bc47daa0ae`.

Category pagination receipts (all returned complete, meta.partial false):

- 2026-11-09T20:32:24.498196+00:00: https://stellarlight.xyz/api/projects/search?category=Anchor&limit=100&offset=0; SHA-256 `b8d5725904cb258ee139cebcf7dc1267bb3da61c0bce6f04ed604f5fcf598bc6`.
- 2026-11-09T20:32:24.598193+00:00: https://stellarlight.xyz/api/projects/search?category=Asset&limit=100&offset=0; SHA-256 `ce53e3a9b751e1d4d0dc9edffe2ed2aa38ffec45ec2ce0b89422b758f4c0b54e`.
- 2026-11-09T20:32:25.084732+00:00: https://stellarlight.xyz/api/projects/search?category=Infrastructure&limit=100&offset=0; SHA-256 `144fbc8f42cfe02a67629a326940cb6c8db86a5580cb08b398562c9f3b95064a`.
- 2026-11-09T20:32:25.867365+00:00: https://stellarlight.xyz/api/projects/search?category=Infrastructure&limit=100&offset=100; SHA-256 `eef6204531da42baf98ded4e5cfdc5e5c65afe508fbd3c51f9e9c0b478b8229b`.
- 2026-11-09T20:32:26.207639+00:00: https://stellarlight.xyz/api/projects/search?category=Infrastructure&limit=100&offset=200; SHA-256 `5c8aaf410c6e81b5baacd27a305e3d1078020d7b434c6651a1092b9dbef478c5`.
- 2026-11-09T20:32:24.758001+00:00: https://stellarlight.xyz/api/projects/search?category=Partner+Integration&limit=100&offset=0; SHA-256 `ac79fd1459976e3355ea0a1a56e77d331f9df91c3375acd3666a9880cdeba0cb`.
- 2026-11-09T20:32:25.203991+00:00: https://stellarlight.xyz/api/projects/search?category=Protocol%2FContract&limit=100&offset=0; SHA-256 `82146422125a31d919e5218620bae282e333ca82cf8143dd80f4b487040c332c`.
- 2026-11-09T20:32:25.815981+00:00: https://stellarlight.xyz/api/projects/search?category=Protocol%2FContract&limit=100&offset=100; SHA-256 `76987402db90fe0308ed7feadbedecfcc7d0e38d7a042e8d959c4f68eb5d6740`.
- 2026-11-09T20:32:26.559643+00:00: https://stellarlight.xyz/api/projects/search?category=Tooling&limit=100&offset=0; SHA-256 `ffefa5084499b0ca016ff24d6ff9e3083cc1bd94168fb4a407f59d52965f0ca2`.
- 2026-11-09T20:32:27.025396+00:00: https://stellarlight.xyz/api/projects/search?category=Tooling&limit=100&offset=100; SHA-256 `cb52e2c5709f4067abfa5099277ac3d9ee491ff8d1a6b9221003812aac3dd8f8`.
- 2026-11-09T20:32:26.596364+00:00: https://stellarlight.xyz/api/projects/search?category=User-Facing+App&limit=100&offset=0; SHA-256 `10959032a55625844cd76cd639a9921a265de804bc1cb3978720c8b62070520e`.
- 2026-11-09T20:32:27.236238+00:00: https://stellarlight.xyz/api/projects/search?category=User-Facing+App&limit=100&offset=100; SHA-256 `12b3d901948fa62d2db81c128dd634fc7260b04bb71bd589f536cb44c2815c87`.
- 2026-11-09T20:32:27.999631+00:00: https://stellarlight.xyz/api/projects/search?category=User-Facing+App&limit=100&offset=200; SHA-256 `5d2173416dd9d5932bc4228668cb88f54af9747965420f7369b3b6f2b85709b8`.
- 2026-11-09T20:32:28.599323+00:00: https://stellarlight.xyz/api/projects/search?category=User-Facing+App&limit=100&offset=300; SHA-256 `a016d41ec46fec36b26ece3ee114eb0ee47b2cc97e5cdae5c9d4f9c4cf7a72bf`.
- 2026-11-09T20:32:28.993337+00:00: https://stellarlight.xyz/api/projects/search?category=User-Facing+App&limit=100&offset=400; SHA-256 `37e87c814657f16ae7a5ec876427b12451cc2ee6c6c537f7e794dd0a415ccfe4`.

## sls-029 — partial

**Why it remains reported-upstream:** #514 closed July 14 after project-level basis/source curation; #742 closed August 13 after several combined residual lanes. Neither delivered full feed/network evidence for the original providers. In [#514 scope question](https://github.com/Stellar-Light/stellarlight/issues/514#issuecomment-4976929571), `theboycoder` asked whether a separate model was needed; Raven author `kalepail` answered yes in [the July 15 reply](https://github.com/Stellar-Light/stellarlight/issues/514#issuecomment-4982290253). In [#742](https://github.com/Stellar-Light/stellarlight/issues/742#issuecomment-5119200624), `theboycoder` called it an “accepted absence” and a genuine capability gap, explicitly not a deliberate boundary, and offered scoped work. This is **not an explicit refusal** warranting declined-upstream. Old dated “open #742” observations are historically correct; do not use them as current state.

Band, DIA, RedStone products remain null; project-level deployments distinguish DIA testnet from Band/RedStone mainnet but cannot establish feed updates. Lightecho has one oracle-feed product with contractId null and August 13 stale caution. Adjacent Chainlink now has testnet/mainnet product addresses, so a universal “no product model exists” claim is obsolete. No July price sample is presented as current liveness. Successful original oracle retry: 20:33:22Z in tmp/scout-extra.json.

**If splitting:** proposed successor “Original oracle providers lack per-feed, per-network address and freshness evidence.” Scope the Band/DIA/RedStone/Lightecho fixture reads, retain project-level progress and Chainlink as a positive control, and ask for provider/product/network/address/feed/as-of/source with updating/stale/absent distinctions. Keep current record until the old refs are reconciled with that successor; no duplicate filing in this lane.

Fresh upstream ref reads:

- https://github.com/Stellar-Light/stellarlight/issues/514: closed, reason completed, closed 2026-07-14T00:12:15Z, updated 2026-07-15T15:23:16Z; fetched 2026-11-09T20:30:13.792222+00:00.
  Latest comment: **kalepail**, 2026-07-15T15:23:15Z, https://github.com/Stellar-Light/stellarlight/issues/514#issuecomment-4982290253. Comment direction matters; Raven author comments are not owner validation.
- https://github.com/Stellar-Light/stellarlight/issues/742: closed, reason completed, closed 2026-08-13T04:57:53Z, updated 2026-08-19T22:01:42Z; fetched 2026-11-09T20:30:13.982335+00:00.
  Latest comment: **kalepail**, 2026-08-19T22:01:42Z, https://github.com/Stellar-Light/stellarlight/issues/742#issuecomment-5348534497. Comment direction matters; Raven author comments are not owner validation.

Live request receipts (command form above; full bodies/hashes in tmp/scout-live-curl.json):

- `search-band` — 2026-11-09T20:31:57.030454+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?q=band&limit=100; SHA-256 `d2e0839cbdf5e67762aeee531a71c2945009f6a1ebff7efd054f5cdaebecddf5`.
- `search-dia` — 2026-11-09T20:31:57.036939+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?q=dia&limit=100; SHA-256 `092e3d9752b089e6f4ac23871018efe5a236d095edd410c05b1e62da17c7e28c`.
- `search-redstone` — 2026-11-09T20:31:57.038891+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?q=redstone&limit=100; SHA-256 `dbdeaa17e063df9fd6a37dc0b9989bbcaff7c8f132e5170e8f7d6fbb0f328952`.
- `search-lightecho` — 2026-11-09T20:31:57.169018+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?q=lightecho&limit=100; SHA-256 `89ccb29db9965082e071319b6b53b449a21bf2a8d6227ccc4e6ca071b55f3fa6`.
- `search-chainlink` — 2026-11-09T20:31:57.176474+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?q=chainlink&limit=100; SHA-256 `665fa66f13aee4736cc19fae7cf53e77e5ed0792bfe49242a8fe581945223b29`.

## sls-033 — partial

**Why it remains reported-upstream:** #519 closed July 14 after exact enumeration, taxonomy schema and initial curation; [theboycoder's July 15 reply](https://github.com/Stellar-Light/stellarlight/issues/519#issuecomment-4983613441) reported 62 rows, one deliberately unknown kind and 13 availability records. #742 subsequently described coverage as largely closed, not universal. The old closure proves the enumeration fix, not today's coverage for new rows. Raven `kalepail` posted the July 15 residual; it was not maintainer acceptance.

Current exact set: **74 rows, total 74, 74 distinct normalized names**. Null kind: 11; empty availability: 41. Eight null-kind Live rows: smart-treasury, chainless, amulets, piggy-wallet, ibis, zig3v2, rehive, privy; Development haven/openzeppelin-stellar-privacy-wallet; Inactive mxlet. Nonempty available entries retain storeUrl/checkedAt. Null/empty is unknown, not unavailable; preserve honest MXlet uncertainty.

**If splitting:** proposed successor “Source-backed wallet kind and platform coverage remains incomplete.” Repro exact type=Wallet, list the eight Live unknowns, and separate current app availability from project lifecycle. Ask for product-specific kind/store URL/state/check date only where verified. Preserve exact enumeration and deduplication as fixed controls.

Fresh upstream ref reads:

- https://github.com/Stellar-Light/stellarlight/issues/742: closed, reason completed, closed 2026-08-13T04:57:53Z, updated 2026-08-19T22:01:42Z; fetched 2026-11-09T20:30:13.982335+00:00.
  Latest comment: **kalepail**, 2026-08-19T22:01:42Z, https://github.com/Stellar-Light/stellarlight/issues/742#issuecomment-5348534497. Comment direction matters; Raven author comments are not owner validation.
- https://github.com/Stellar-Light/stellarlight/issues/519: closed, reason completed, closed 2026-07-14T22:32:11Z, updated 2026-07-15T17:42:54Z; fetched 2026-11-09T20:30:15.005884+00:00.
  Latest comment: **theboycoder**, 2026-07-15T17:42:54Z, https://github.com/Stellar-Light/stellarlight/issues/519#issuecomment-4983613441. Comment direction matters; Raven author comments are not owner validation.

Live request receipts (command form above; full bodies/hashes in tmp/scout-live-curl.json):

- `wallets` — 2026-11-09T20:31:58.334635+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?type=Wallet&limit=100; SHA-256 `474793c0f01aea89f94f7d6272a52a6452f6fc70edb987e466911cffa5c69b58`.

## sls-039 — no-change (declined boundary)

Maintain **declined-upstream** and its existing disposition. [theboycoder on #522](https://github.com/Stellar-Light/stellarlight/issues/522#issuecomment-4964093999) explicitly leaves history at the provider; [kalepail's acknowledgment](https://github.com/Stellar-Light/stellarlight/issues/522#issuecomment-4971573624) accepts that boundary. PR530 shipped provenance, not history. Current Blend/Soroswap rows carry TVL/date/method/slugs; no in-API time series or peak/decomposition. Provider Blend endpoint still has a Stellar history array with 889 points, and Blend's method URL now reaches the parent scope (sls-102 fixed). No refile or additional successor. A provider dashboard browser render was not needed to prove the provider's current series exists.

Fresh upstream ref reads:

- https://github.com/Stellar-Light/stellarlight/issues/522: closed, reason completed, closed 2026-07-14T00:13:04Z, updated 2026-07-14T16:31:42Z; fetched 2026-11-09T20:30:15.140001+00:00.
  Latest comment: **kalepail**, 2026-07-14T16:31:42Z, https://github.com/Stellar-Light/stellarlight/issues/522#issuecomment-4971573624. Comment direction matters; Raven author comments are not owner validation.
- https://github.com/Stellar-Light/stellarlight/pull/530: closed, reason n/a, closed 2026-07-14T00:02:16Z, updated 2026-07-14T00:02:16Z; fetched 2026-11-09T20:30:15.434384+00:00.
  Latest comment: **vercel[bot]**, 2026-07-14T00:00:32Z, https://github.com/Stellar-Light/stellarlight/pull/530#issuecomment-4964021745. Comment direction matters; Raven author comments are not owner validation.

Live request receipts (command form above; full bodies/hashes in tmp/scout-live-curl.json):

- `search-blend` — 2026-11-09T20:31:56.748324+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?q=blend&limit=100; SHA-256 `d149607753c382ef7fb5abf574217f3aa6ffebe6b822673befc87621d1880846`.
- `search-soroswap` — 2026-11-09T20:31:56.747938+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?q=soroswap&limit=100; SHA-256 `bef8463a65eb306e91f3513a2b08ce64d5a31e57418ad57f7d6ebabc4be4c318`.
- `llama-blend` — 2026-11-09T20:31:59.845008+00:00; HTTP 200; https://api.llama.fi/protocol/blend; SHA-256 `68726a1452ae8913565d699ba2dcd75a1facc19ee602ef3a2525e961937a2238`.

## sls-099 — fixed

**Retirement candidate.** [Maintainer theboycoder's November 7 closure](https://github.com/Stellar-Light/stellarlight/issues/1910#issuecomment-6701316899) reports PR1924/spec1.9.123 plus curate-projects execution. Live Soroswap explicitly names Soroswap AMM, Aquarius, SushiSwap V3 and Comet; SDEX is the separate classic path. Phoenix explicitly says the v3 contract defines a Phoenix hop while the API does not list Phoenix (checked date remains November 4). Operator supported-amms.md independently lists soroswap/aqua/sushi/comet/sdex; aggregator-v3.md still contains Phoenix(PhoenixHop). The precise API/contract distinction is now served.

Adjacent scan: all descriptions in both search response sets were checked; neither old “(Soroswap, Phoenix, Aquarius)” list nor unqualified “One of the AMM liquidity sources aggregated by Soroswap” remains. Deployment source nulls belong to retained sls-024, not this venue defect. Four named golden consumers require current truth/provenance reconciliation at retirement; retain historical dated quotes as historical evidence.

Fresh upstream ref reads:

- https://github.com/Stellar-Light/stellarlight/issues/1910: closed, reason completed, closed 2026-11-07T02:55:51Z, updated 2026-11-07T02:55:51Z; fetched 2026-11-09T20:30:15.342343+00:00.
  Latest comment: **theboycoder**, 2026-11-07T02:55:51Z, https://github.com/Stellar-Light/stellarlight/issues/1910#issuecomment-6701316899. Comment direction matters; Raven author comments are not owner validation.

Live request receipts (command form above; full bodies/hashes in tmp/scout-live-curl.json):

- `search-soroswap` — 2026-11-09T20:31:56.747938+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?q=soroswap&limit=100; SHA-256 `bef8463a65eb306e91f3513a2b08ce64d5a31e57418ad57f7d6ebabc4be4c318`.
- `search-phoenix` — 2026-11-09T20:31:56.748174+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?q=phoenix&limit=100; SHA-256 `32fe30653a57aa93612484e1745d653fcc676d86659870e7ebbb33da1b04f60a`.
- `supported-amms` — 2026-11-09T20:31:58.896749+00:00; HTTP 200; https://docs.soroswap.finance/aggregator/supported-amms.md; SHA-256 `4021138558944702b38ceb3e5256f144e4aea4b08ce3c43420ef0d1d9d38704b`.
- `aggregator-v3` — 2026-11-09T20:31:59.013303+00:00; HTTP 200; https://docs.soroswap.finance/aggregator/technical-reference/contracts/aggregator-v3.md; SHA-256 `41089eca44f33ae28b6289b09ddd5479bb4a7ec0c6b6b58456df4b965b59753a`.

## sls-100 — fixed

**Retirement candidate.** [theboycoder's November 7 closure](https://github.com/Stellar-Light/stellarlight/issues/1911#issuecomment-6701317262) reports both project and partner executions after PR1924. Project website is https://hanawallet.io/, source https://www.hanawallet.io/, note correctly describes the extension and current same-site redirect. Partner website is https://www.hanawallet.io. Both wallet URLs end at HTTP200, title “Hana | Non-Custodial Multi-Chain Crypto Wallet”. The two hana.money URLs still 307 to Wend, confirming that replacing the links matters.

Adjacent persistence scan: current upstream `scripts/data/curation-maps.ts` has STATUS_FIX.hana sourceUrl and WEBSITE_FIXES.hana set to www.hanawallet.io; `scripts/data/curate-partners.ts` URL_CORRECTIONS[hana-wallet] also uses it. These files were freshly read via gh API (exact commands in tmp/scout-extra.json); old-domain mentions remaining in comments are dated explanations, not write values. The Hana description's Freighter wording is a separate previously tracked identity issue and does not prevent this domain correction's retirement.

Fresh upstream ref reads:

- https://github.com/Stellar-Light/stellarlight/issues/1911: closed, reason completed, closed 2026-11-07T02:55:53Z, updated 2026-11-07T02:55:53Z; fetched 2026-11-09T20:30:16.384926+00:00.
  Latest comment: **theboycoder**, 2026-11-07T02:55:53Z, https://github.com/Stellar-Light/stellarlight/issues/1911#issuecomment-6701317262. Comment direction matters; Raven author comments are not owner validation.

Live request receipts (command form above; full bodies/hashes in tmp/scout-live-curl.json):

- `search-hana` — 2026-11-09T20:31:56.748268+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?q=hana&limit=100; SHA-256 `9a9a8cbd7ffa5c38ef34329c60e2ca9831279f91540accb356815065e878f0bc`.
- `partner-hana` — 2026-11-09T20:31:58.452529+00:00; HTTP 200; https://stellarlight.xyz/api/partners/hana-wallet; SHA-256 `f66351e9e2f2269302dddb338efa08c12f7bd4724d581c290ee719e3526029f0`.
- `hana-money` — 2026-11-09T20:31:59.041148+00:00; HTTP 200; https://hana.money/; SHA-256 `1908559be7ad054535495d2038a1f57b3585ddab31843b85c1929275e5cf53c5`.
- `hana-money-www` — 2026-11-09T20:31:59.140993+00:00; HTTP 200; https://www.hana.money/; SHA-256 `1908559be7ad054535495d2038a1f57b3585ddab31843b85c1929275e5cf53c5`.
- `hana-wallet` — 2026-11-09T20:31:59.473158+00:00; HTTP 200; https://hanawallet.io/; SHA-256 `608930c7986502bc7ce65d06e74efe5bcdccc1852f1e9ffdf5e6cb7c1094d629`.
- `hana-wallet-www` — 2026-11-09T20:31:59.532379+00:00; HTTP 200; https://www.hanawallet.io/; SHA-256 `608930c7986502bc7ce65d06e74efe5bcdccc1852f1e9ffdf5e6cb7c1094d629`.

## sls-101 — partial

**Partial, not full-scope retirement.** [theboycoder's November 8 comment](https://github.com/Stellar-Light/stellarlight/issues/1912#issuecomment-6716723645) explicitly confirms the warning and acknowledges unchanged underlying values. PR1928 merged November 5. Live warning lists 3/17 stale rows, $1,664,183,220 = rounded84% of total $1,980,977,979; oldestAsOf August 10. All three project rows also carry tvlStale:true.

Unchanged: Spiko $1,653,789,314 (September 14); Sentora $10,393,904 (August 10); Etherfuse $2 (September 14). Fresh provider reads: Spiko/Etherfuse currentChainTvls empty; Sentora parent Stellar $82,515,901, with a live series. The additional stellar-defi-hub child read also succeeds. Different observations do not require exact numeric equality. Missing provider data must not be fresh zero. This finding's current recommendation already includes refresh/remap/unavailable handling, so warning-only closure is not a full-record fix.

**If splitting warning scope:** proposed successor “Stale project TVL survives provider remaps/removals.” Include all three stored dates/amounts, current provider evidence and warning positive controls. Ask to remap Sentora and record unavailable Spiko/Etherfuse with dated reasons, consistently across aggregate/project rows. Retain current record unless that complete residual and upstream successor links exist.

Fresh upstream ref reads:

- https://github.com/Stellar-Light/stellarlight/issues/1912: closed, reason completed, closed 2026-11-05T15:19:23Z, updated 2026-11-08T03:29:17Z; fetched 2026-11-09T20:30:16.509906+00:00.
  Latest comment: **theboycoder**, 2026-11-08T03:29:17Z, https://github.com/Stellar-Light/stellarlight/issues/1912#issuecomment-6716723645. Comment direction matters; Raven author comments are not owner validation.

Live request receipts (command form above; full bodies/hashes in tmp/scout-live-curl.json):

- `analyze-tvl` — 2026-11-09T20:31:58.532789+00:00; HTTP 200; https://stellarlight.xyz/api/analyze?dimension=tvl; SHA-256 `b9a51186bf5c344af8a3e74dc9a6a9c3a6c85f301e6d5ef359f2f24ee915bad4`.
- `search-spiko` — 2026-11-09T20:31:56.894115+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?q=spiko&limit=100; SHA-256 `74ce3c660370756783908b290b86f1d7bc492ac505301ba66c614bb999ef3df8`.
- `search-sentora` — 2026-11-09T20:31:56.902000+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?q=sentora&limit=100; SHA-256 `85e30c44394ad25107c62baddbbeeb520625648062349aaa2f207fff7ed7598e`.
- `search-etherfuse` — 2026-11-09T20:31:56.906032+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?q=etherfuse&limit=100; SHA-256 `d0a073915b8ad52fc6804a139869341fc0377c37ce0f16f8d78763fcfc8c6fbf`.
- `llama-spiko` — 2026-11-09T20:32:00.152476+00:00; HTTP 200; https://api.llama.fi/protocol/spiko; SHA-256 `29f5f9ef8f6825c283fae8257b478d0a085d6053a33722f773d54ef6d692eae2`.
- `llama-sentora` — 2026-11-09T20:32:00.044526+00:00; HTTP 200; https://api.llama.fi/protocol/sentora; SHA-256 `cd0a1ce455b7e87002f57e65027ff50ee77a2f4b48ab3cddce92e3c6e3941062`.
- `llama-etherfuse` — 2026-11-09T20:32:00.214450+00:00; HTTP 200; https://api.llama.fi/protocol/etherfuse; SHA-256 `6e7136bdd3aba859ba14fb42281200ff7c507d83a5124ef17c5230b04fee2cde`.

## sls-102 — fixed

**Retirement candidate.** [theboycoder's November 7 comment](https://github.com/Stellar-Light/stellarlight/issues/1913#issuecomment-6701318370) reports enrich-tvl execution after PR1924. Blend now cites https://defillama.com/protocol/blend; all four original mapped children remain. Its two statusChecks sourceUrl values also cite the parent.

Independent provider list: blend-pools, blend-pools-v2, blend-backstop and blend-backstop-v2 all parent#blend. Their base Stellar values are approximately38,785.35 +114,692,125.18 +0 +0; parent current Stellar $114,730,910 (rounding and observation times differ). Parent exposes borrowed and pool2 separately. Scout stored $115,148,044 at 13:44:29Z is not claimed equal to later provider values. Adjacent single-slug Soroswap still cites soroswap-amm; its own URL is not incorrectly replaced by a parent. Provider history remains available, preserving sls-039's accepted boundary.

Fresh upstream ref reads:

- https://github.com/Stellar-Light/stellarlight/issues/1913: closed, reason completed, closed 2026-11-07T01:48:30Z, updated 2026-11-07T02:56:00Z; fetched 2026-11-09T20:30:16.670762+00:00.
  Latest comment: **theboycoder**, 2026-11-07T02:56:00Z, https://github.com/Stellar-Light/stellarlight/issues/1913#issuecomment-6701318370. Comment direction matters; Raven author comments are not owner validation.

Live request receipts (command form above; full bodies/hashes in tmp/scout-live-curl.json):

- `search-blend` — 2026-11-09T20:31:56.748324+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?q=blend&limit=100; SHA-256 `d149607753c382ef7fb5abf574217f3aa6ffebe6b822673befc87621d1880846`.
- `search-soroswap` — 2026-11-09T20:31:56.747938+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?q=soroswap&limit=100; SHA-256 `bef8463a65eb306e91f3513a2b08ce64d5a31e57418ad57f7d6ebabc4be4c318`.
- `llama-protocols` — 2026-11-09T20:31:59.836305+00:00; HTTP 200; https://api.llama.fi/protocols; SHA-256 `4d7d36ea932c8ea6aa87f3dfdb674a5e1bdf64af852de845e03bfcf41b0ea510`.
- `llama-blend` — 2026-11-09T20:31:59.845008+00:00; HTTP 200; https://api.llama.fi/protocol/blend; SHA-256 `68726a1452ae8913565d699ba2dcd75a1facc19ee602ef3a2525e961937a2238`.

## sls-107 — partial

**Partial, with issuer population still unfixed.** #1900 closed November 5 with no comments. Linked PR1920 is documentation only; PR1923 shipped filter/schema but its maintainer-authored body explicitly requires an owner opt-in followed by refresh execution. Neither a merge nor a green check proves those writes happened. This lane did not enable or run them.

Current 41/41 issuerOfRecord and issuerOfRecordCheck values are null. AUDD brand is Novatti Group, primary TOML ORG_NAME AUDC PTY LTD. Eight Currency One rows remain brand-only; the primary TOML says Kinesis Money Panama S.A. MGUSD control ORG_NAME MoneyGram Payment Systems, Inc. plus currency desc naming Bridge. Yield filter now returns USDY/YLDS only (2); none returns 38 **unclassified**, not verified par; invalid filter HTTP400 lists allowed values. OpenAPI1.9.127 correctly documents company=brand, issuer provenance and unknown asset class.

Adjacent read also shows 40 rows basis unmeasured and some note “Measurement failed: HTTP402”; these are service response facts, not a paid endpoint called by this lane and not proof of issuer population. Keep the issuer residual.

**If splitting:** proposed successor “Stablecoin issuer-of-record fields remain unpopulated after schema deploy.” Include AUDD/eight C1 mismatches, MGUSD control, source/date/note fields and all-null population. Ask for owner-authorized bidirectional TOML validation/backfill and readback, preserving the fixed brand/filter semantics.

Fresh upstream ref reads:

- https://github.com/Stellar-Light/stellarlight/issues/1900: closed, reason completed, closed 2026-11-05T16:11:54Z, updated 2026-11-05T16:11:54Z; fetched 2026-11-09T20:30:16.697955+00:00.
  No issue comments.

Live request receipts (command form above; full bodies/hashes in tmp/scout-live-curl.json):

- `stablecoins` — 2026-11-09T20:31:58.603049+00:00; HTTP 200; https://stellarlight.xyz/api/stablecoins?limit=100; SHA-256 `9c8271e22d236508a0e3b04007ab019fa4d771bd6f2fdf16856f3401d327760f`.
- `stablecoins-yield` — 2026-11-09T20:31:58.699522+00:00; HTTP 200; https://stellarlight.xyz/api/stablecoins?assetType=Yield%20Stablecoin&limit=100; SHA-256 `29866fa3c92458283dc955237c10d300ca44e0e4db8741ce91a1e90761f0d9bd`.
- `stablecoins-none` — 2026-11-09T20:31:58.762731+00:00; HTTP 200; https://stellarlight.xyz/api/stablecoins?assetType=none&limit=100; SHA-256 `ccbc52ecaab0da7d447bb289981b44edae6625f4f866af525079f6d7b96393ba`.
- `stablecoins-invalid` — 2026-11-09T20:31:58.849156+00:00; HTTP 400; https://stellarlight.xyz/api/stablecoins?assetType=invalid; SHA-256 `72b4b8fb9c261a239c9a1202f6747ee248c9a1e709ef76b81a299826ee6e53c2`.
- `toml-audd` — 2026-11-09T20:32:00.248315+00:00; HTTP 200; https://audd.digital/.well-known/stellar.toml; SHA-256 `76bc56ee896dbe79c6c62c3d40d1f9daf094b0ef4ca04c9c3d5da7496132c936`.
- `toml-c1` — 2026-11-09T20:32:00.327231+00:00; HTTP 200; https://currency.one/.well-known/stellar.toml; SHA-256 `3576ef6f88809558e4c272bcc5e00f95623fa7fee0bce05810710feea10ca392`.
- `toml-mgusd` — 2026-11-09T20:32:00.554843+00:00; HTTP 200; https://mgusd.moneygram.com/.well-known/stellar.toml; SHA-256 `7af7fff3d5cd1aa5e7da922c7f2d2b5a6ea16bd174f3a40d12a7837ed6caf322`.

## sls-111 — partial

**Partial, with material progress.** PR1922 is now **merged November 7** (the prior “wait for rebase/merge” wake-up is stale). Issue1903 remains open. Its only comment is **Raven author kalepail's correction**, not owner acceptance: [November 6 correction](https://github.com/Stellar-Light/stellarlight/issues/1903#issuecomment-6674314385).

Full directory pagination: 623 distinct awarded rows; **28** carry round45, up from 24. Liqvid now [37,45], Enable[45], RumbleFish[41,42,45]. Official listing contains40 distinct project-card URLs tagged SCF#45. All 28 current Scout scfSourceUrl values match that set (including slimepay mapping to the Merchant Settlement Rail page), leaving12 exact source-page gaps. Pollar/Pods/Principal exact resolves still found:false. Liqvid official page still distinguishes30/44 NotAwarded from37/45 Awarded; never copy buildAwardRounds as awards.

The 12 uncovered official pages were independently fetched, not inferred solely from listing badges (receipt tmp/scout-scf-pages.json). **Ten** explicitly say SCF#45 Awarded. **Canary Protocol and Pods** instead have submission status Information Collection while their project facts say awarded:true, lastAwardedRound:45 and nonzero totalAwarded/totalPaid. This internal official-source distinction must stay visible; neither copy buildAwardRounds nor report that all 12 have an explicit Awarded submission verdict. Ten definite awarded misses alone prove a remaining gap.

**If splitting:** proposed successor “SCF#45 source-page coverage remains incomplete after sync.” Carry all twelve exact missing-page URLs, the ten Awarded verdicts and the Canary/Pods project-vs-submission status distinction, current 623/28 counts and three resolver misses. Ask to intake or correctly link the twelve, validating explicit awarded submissions and count against the official round. Preserve the deployed eleven-row sync corrections. Existing sls-111 already owns this residual; no duplicate file created.

Fresh upstream ref reads:

- https://github.com/Stellar-Light/stellarlight/issues/1903: open, reason n/a, closed n/a, updated 2026-11-06T01:32:23Z; fetched 2026-11-09T20:30:17.806891+00:00.
  Latest comment: **kalepail**, 2026-11-06T01:32:23Z, https://github.com/Stellar-Light/stellarlight/issues/1903#issuecomment-6674314385. Comment direction matters; Raven author comments are not owner validation.

Live request receipts (command form above; full bodies/hashes in tmp/scout-live-curl.json):

- `awarded-0` — 2026-11-09T20:32:02.655305+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?scfAwarded=true&limit=100&offset=0; SHA-256 `fa4fa22e51df495ce94cb5b7a711148ddc26e3fb85c2dec180e777075dbf8a28`.
- `awarded-100` — 2026-11-09T20:32:02.878682+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?scfAwarded=true&limit=100&offset=100; SHA-256 `963d6708ca40bfbb6d6ec584b69ad460764d9aeea946520b047700c6bee811e8`.
- `awarded-200` — 2026-11-09T20:32:03.063706+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?scfAwarded=true&limit=100&offset=200; SHA-256 `7c11ca9f4f5fae9b8fe790a2540957f62871b313292c2ac507e0b29d5a6bb623`.
- `awarded-300` — 2026-11-09T20:32:03.287068+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?scfAwarded=true&limit=100&offset=300; SHA-256 `9443f627613be9f225511ea922ea8f565e066010585fed6b2805c2b0b65def7b`.
- `awarded-400` — 2026-11-09T20:32:03.498619+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?scfAwarded=true&limit=100&offset=400; SHA-256 `19b0481de51a47cddf6645b0401825227315dfda64b9fdf17cfc40cd34ccf986`.
- `awarded-500` — 2026-11-09T20:32:03.688556+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?scfAwarded=true&limit=100&offset=500; SHA-256 `ec9499235965c54b1eee9a839d6d99757533d7d050838392a7e30dad21984651`.
- `awarded-600` — 2026-11-09T20:32:03.884928+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?scfAwarded=true&limit=100&offset=600; SHA-256 `eae0d06a286886ee72ffd1b3f951da5baa47b906ec1e9a66f3463dfe5e44f29f`.
- `search-liqvid` — 2026-11-09T20:31:57.315668+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?q=liqvid&limit=100; SHA-256 `96cb0152bae393c85f4bfab018e0a1a80c84d608bdbe7f57c80fcad64c9df2b8`.
- `search-enable` — 2026-11-09T20:31:57.361058+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?q=enable&limit=100; SHA-256 `2e88cb69771b25698d28d3fbd017a79f6c98b7ca8f0aa4183a0664990ebfc4cc`.
- `search-rumble fish` — 2026-11-09T20:31:57.367827+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?q=rumble+fish&limit=100; SHA-256 `6794c8136aef247e179fa52cbdd7fc06c9a88e0ba00e25b55a4e4461ca3854f2`.
- `resolve-Pollar` — 2026-11-09T20:31:58.170954+00:00; HTTP 200; https://stellarlight.xyz/api/projects/resolve?q=Pollar; SHA-256 `2be1e7746c1c7ad93d8cd55cd66727bb6613872e9f650995dc8a639f6f2df4c4`.
- `resolve-Pods` — 2026-11-09T20:31:58.200147+00:00; HTTP 200; https://stellarlight.xyz/api/projects/resolve?q=Pods; SHA-256 `8bc96fc15cb6018b7c005a38ed6f5b2b099888685cee8674e2baa72be22e24c5`.
- `resolve-Principal` — 2026-11-09T20:31:58.314532+00:00; HTTP 200; https://stellarlight.xyz/api/projects/resolve?q=Principal; SHA-256 `4b4042f166413630155d96ca2500da53dd47da4a43510612954ee4451495c449`.
- `scf-projects` — 2026-11-09T20:32:01.039545+00:00; HTTP 200; https://communityfund.stellar.org/projects?tab=all-rounds; SHA-256 `72cbdfa7b7dd92b7184c6f08ceceac51739f8293b1355cdf2ead75b2646f7892`.
- `scf-liqvid` — 2026-11-09T20:32:01.055693+00:00; HTTP 200; https://communityfund.stellar.org/project/liqvid-hrr; SHA-256 `86c70c8ec4625443ccb47bc340eab864854ff5bf40ffc16f84a9bae286db0c67`.

## sls-112 — fixed

**Retirement candidate.** [theboycoder's November 7 comment](https://github.com/Stellar-Light/stellarlight/issues/1904#issuecomment-6701317637) reports created rows after PR1924. Fresh exact resolves both found:true. Chainlink is Oracle with two oracle-feed products: mainnet CDQBHEUGLDHMSUHG4IH33RJBUTMNCZOT4JIAQR4WZFRDZW6DR6S32ZLZ and testnet CBUF6IADAWPWIDWRTHJNINKXHG2UTIQ6TU2F2HRAXWAI7OT3KJPKK6O4, each sourced/dated. Fresh first-party Chainlink docs name both networks/proxies.

MetaMask native support is a Live Wallet/end-user-wallet row saying default Stellar network/no Snap; stellar-metamask separately says community Snap and points readers to native support. Fresh primary MetaMask docs confirm default Stellar support. Third-party VRF relayer stays distinct. Null project supportedNetworks fields do not erase the explicit Chainlink product networks and do not constitute the missing-row defect. No per-feed update assertion was tested; that wider coverage remains sls-029.

Fresh upstream ref reads:

- https://github.com/Stellar-Light/stellarlight/issues/1904: closed, reason completed, closed 2026-11-07T02:55:56Z, updated 2026-11-07T02:55:56Z; fetched 2026-11-09T20:30:17.958353+00:00.
  Latest comment: **theboycoder**, 2026-11-07T02:55:55Z, https://github.com/Stellar-Light/stellarlight/issues/1904#issuecomment-6701317637. Comment direction matters; Raven author comments are not owner validation.

Live request receipts (command form above; full bodies/hashes in tmp/scout-live-curl.json):

- `resolve-Chainlink` — 2026-11-09T20:31:57.923503+00:00; HTTP 200; https://stellarlight.xyz/api/projects/resolve?q=Chainlink; SHA-256 `9362f21c3bed62601235c4c94230b32b2f59e4c6a660d2fbec847163ee4f48c1`.
- `resolve-MetaMask` — 2026-11-09T20:31:58.054673+00:00; HTTP 200; https://stellarlight.xyz/api/projects/resolve?q=MetaMask; SHA-256 `942a3dff91164bcec6d73d9638cce8fcfe71a7174e3f0da677ea9d6bf0de9c83`.
- `search-chainlink` — 2026-11-09T20:31:57.176474+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?q=chainlink&limit=100; SHA-256 `665fa66f13aee4736cc19fae7cf53e77e5ed0792bfe49242a8fe581945223b29`.
- `search-metamask` — 2026-11-09T20:31:57.216201+00:00; HTTP 200; https://stellarlight.xyz/api/projects/search?q=metamask&limit=100; SHA-256 `3cb8d3028bb812732ba378373e6a44790cbcb6b5d3eff8d512ded951f901f64b`.
- `chainlink-docs` — 2026-11-09T20:32:00.765823+00:00; HTTP 200; https://docs.chain.link/data-feeds/stellar; SHA-256 `4f75edb6bb17b53797e78406655e1ff9be8b7cdd68229ef2eacee23009a70aeb`.
- `metamask-docs` — 2026-11-09T20:32:00.818664+00:00; HTTP 200; https://support.metamask.io/configure/networks/stellar; SHA-256 `e4d7ea9b849baf81d65653a273592f90f1c2f9772de4ac449dc944d1e9297ace`.

## sls-114 — fixed

**Retirement candidate.** [theboycoder's November 7 closure](https://github.com/Stellar-Light/stellarlight/issues/1906#issuecomment-6701318060) reports both rescans after PR1925. Original Horizon question now gives platform, isDeployableContract:false, contractInterface:[], contractInterfacePaths:[], scan2026-11-07T02:46:33.460Z/ref6a13f41808586884c9a7b1beecd92088b7284070. A fresh GitHub tree at that exact ref still contains integration fixtures under internal/integration/contracts/{increment,add_u64,bulk,constructor,store,sac_test}/src/lib.rs. Thus the scan omitted fixture interfaces while source still exists.

Adjacent rs-soroban-env gives platform/false and empty interfaces/paths, scan2026-11-07T02:47:10.638Z/ref0c99950e96128beba3319aa96b116646ce974e69. Owner expressly leaves broader cargo-sdk proof/code-signals analysis separate, and selected-answer drift still reproduces under sls-115. Those do not justify extending this fixture-interface record to an unrelated defect. The original recommendation explicitly permitted fixture removal/marking instead of path-qualifying all fixture signatures.

Fresh upstream ref reads:

- https://github.com/Stellar-Light/stellarlight/issues/1906: closed, reason completed, closed 2026-11-07T02:55:58Z, updated 2026-11-07T02:55:58Z; fetched 2026-11-09T20:30:18.040028+00:00.
  Latest comment: **theboycoder**, 2026-11-07T02:55:58Z, https://github.com/Stellar-Light/stellarlight/issues/1906#issuecomment-6701318060. Comment direction matters; Raven author comments are not owner validation.

Live request receipts (command form above; full bodies/hashes in tmp/scout-live-curl.json):

- `explain-horizon` — 2026-11-09T20:32:02.217882+00:00; HTTP 200; https://stellarlight.xyz/api/repos/explain?repo=stellar%2Fstellar-horizon&q=Which+Horizon+ingestion+constant+pins+the+highest+supported+protocol+version%2C+and+what+is+its+value%3F; SHA-256 `293603a6692a862843c5999f54d11216d56b2b5628b7379b39002fd6b184e0e5`.
- `explain-env` — 2026-11-09T20:32:02.522248+00:00; HTTP 200; https://stellarlight.xyz/api/repos/explain?repo=stellar%2Frs-soroban-env&q=What+deployable+contract+interfaces+does+this+repository+ship%3F; SHA-256 `f0ffd2e0ffd516d3aee2bde8c24584073cd8bc99652e7471683524f60946cc44`.

## sls-115 — still-repro

**Still reproduces, including after the November 7 rescan.** #1933 open, no comments. Original question and the explicit-current question both select the same knowledge-note (October 8) saying MaxSupportedProtocolVersion=29, despite codeVerified.scannedRef now being6a13f41808586884c9a7b1beecd92088b7284070. Fresh `gh api repos/stellar/stellar-horizon/contents/internal/ingest/main.go?ref=6a13f41808586884c9a7b1beecd92088b7284070 --jq .content` decoded at20:33:21Z defines uint32=30. Exact source URL: https://github.com/stellar/stellar-horizon/blob/6a13f41808586884c9a7b1beecd92088b7284070/internal/ingest/main.go#L38.

The note's old commit may accurately define29; the defect remains selection for a current-source question without invalidation/conflict. Active Mainnet protocol is a different fact. The newer scan proves that rescanning alone did not refresh/invalidate the selected note. Recurrence appended; no routine comment on this untouched open issue.

Fresh upstream ref reads:

- https://github.com/Stellar-Light/stellarlight/issues/1933: open, reason n/a, closed n/a, updated 2026-11-06T14:24:07Z; fetched 2026-11-09T20:30:17.934814+00:00.
  No issue comments.

Live request receipts (command form above; full bodies/hashes in tmp/scout-live-curl.json):

- `explain-horizon` — 2026-11-09T20:32:02.217882+00:00; HTTP 200; https://stellarlight.xyz/api/repos/explain?repo=stellar%2Fstellar-horizon&q=Which+Horizon+ingestion+constant+pins+the+highest+supported+protocol+version%2C+and+what+is+its+value%3F; SHA-256 `293603a6692a862843c5999f54d11216d56b2b5628b7379b39002fd6b184e0e5`.
- `explain-horizon-current` — 2026-11-09T20:32:02.388819+00:00; HTTP 200; https://stellarlight.xyz/api/repos/explain?repo=stellar%2Fstellar-horizon&q=As+of+today+at+codeVerified.scannedRef%2C+what+is+MaxSupportedProtocolVersion+in+internal%2Fingest%2Fmain.go%3F+I+mean+the+source+software+ceiling%2C+not+the+active+Mainnet+protocol.; SHA-256 `462d854cafb239d923bd069470306f61da152eedccbb33bb4bef5cc2e9cc83e8`.

## Additional SCF source-page verification

Exact reads: `curl -fsS --max-time 20 <URL>`, performed by `python3 tmp/scout-scf-verify.py`. Duplicate React-flight serializations were deduplicated for interpretation. Missing pages are the exact difference between the 40 official card URLs and28 directory scfSourceUrl values, not a name-based guess.

| Official page | Observed UTC | SCF45 evidence | SHA-256 |
|---|---|---|---|
| https://communityfund.stellar.org/project/agentsmith-x402-stellar-facilitator-and-bazaar-discovery-kdw | 2026-11-09T20:35:34.946997+00:00 | Awarded | `46067230edee40e5e1c3473544fa92663dd2191554dce719c9e6a95d5c7312dc` |
| https://communityfund.stellar.org/project/astrolabe-bzg | 2026-11-09T20:35:34.901909+00:00 | Awarded | `0348a342c08d06c52dff813fd00e6d386f9d53b9b3aad925fd60d509377c6fef` |
| https://communityfund.stellar.org/project/canary-protocol-y4l | 2026-11-09T20:35:34.398300+00:00 | Submission Information Collection; project awarded:true, lastAwardedRound45; conflicting granularity | `7bb6f366558f2351e6c8ecf550a4aa311b355088dfa8b8fa7b5921a620332edb` |
| https://communityfund.stellar.org/project/cara7-yyx | 2026-11-09T20:35:35.706121+00:00 | Awarded | `30211ef46ec8d58a24d78c503270936e39c20c6f399630425df3fd5ef42f6932` |
| https://communityfund.stellar.org/project/fermah-pay-w3c | 2026-11-09T20:35:35.545276+00:00 | Awarded | `2af687c4e172ddead57c247639d07f7bb7d1c3744518a5159db3695d27d910ce` |
| https://communityfund.stellar.org/project/nila-fwc | 2026-11-09T20:35:35.638983+00:00 | Awarded | `70316e211242b3aff4aeca27b39da3cd3c59e43236f089d65309fab8bf178dc7` |
| https://communityfund.stellar.org/project/onboard-kvj | 2026-11-09T20:35:37.346862+00:00 | Awarded | `29479e8c4eb520c4a4a04dc881bbab44a25509dbaf9aef4a0dc7e9014e773e27` |
| https://communityfund.stellar.org/project/open-rwa-vault-infrastructure-nis | 2026-11-09T20:35:37.133187+00:00 | Awarded | `a1c65529d8b0948425525be1e57f5dd6071834e868ca05635449b0bd979cac9a` |
| https://communityfund.stellar.org/project/pods-dxl | 2026-11-09T20:35:36.241643+00:00 | Submission Information Collection; project awarded:true, lastAwardedRound45; conflicting granularity | `c8fb1a6567fabb40f4f56dae1cf65be6453b570a1953399ea9bb1a50d8207a38` |
| https://communityfund.stellar.org/project/pollar-nqe | 2026-11-09T20:35:37.165580+00:00 | Awarded | `9919cbcabf58a0458f31686ad5c198c25fe39921b9e3b18ffbb40cd50972c074` |
| https://communityfund.stellar.org/project/principal-vzt | 2026-11-09T20:35:37.704230+00:00 | Awarded | `3d5de183d595d183960ebe41ba5d8e9901099f0d65a52fc0b47fb32ce878cd5b` |
| https://communityfund.stellar.org/project/zkella-protocol-compliance-ready-confidential-finance-infrastructure-for-stellar-sib | 2026-11-09T20:35:39.003279+00:00 | Awarded | `3a5140b92e9b8a337c9754aa19ee8a033392693524c243622cbe265f1de4dae6` |

Do not claim that Information Collection means Not Awarded. The page-level award totals support the project, while the submission state is not an explicit Awarded verdict. Intake needs to retain or resolve that distinction.

## Persistent reference handoff

Executed for every ID: `rg -n --hidden -g '!node_modules/**' -g '!.git/**' -g '!tmp/**' "<id>" .`. Full line matches were preserved in **tmp/scout-references.json**. Before retiring any fixed or partial record: change active path-valued truth/rootCause/source references to a commit-pinned snapshot or resolved receipt, update live status claims and the grouped Scout TODO, remove probe/intake override via resolver, regenerate INDEX. Preserve dated round/research claims as historical observations; they do not all need rewriting.

Especially: sls-099 has four named consumers (q-defi-phoenix-what-is, q-defi-soroswap-what-is, q-defi-soroswap-vs-stellarx, q-defi-provide-liquidity-impermanent-loss); sls-100 q-eco-hana-wallet-scf; sls-102 finding-declared q-edge-fresh-latest-blend-tvl (even though that case has no literal sls-102 match); sls-101 q-edge-noinfo-exact-tvl-figure. sls-024 also names q-defi-allbridge-what-is and other consumers even where literal ID search is absent. Golden edits require golden-truth workflow and independent proof; this lane made none.

The `.agents/TODO.md` Scout grouped wake-up at lines75–84 currently says sls-112 stays open, waits on the Horizon scan and SCF1922 merge, and notes failed old probes for099/100/102. Those conditions now changed. Coordinator should update it for five candidates, surviving issuer/TVL/SCF/deployment/wallet/oracle residuals, and leave sls-115 pending actual note invalidation.

### sls-024

141 matching lines; current/config/golden files to reconcile:

- `.github/ISSUE_TEMPLATE/upstream-improvement-ready.yml`
- `eval/qa/cases.json`
- `eval/qa/corpus/battery/defi-ecosystem/q-defi-blend-alternatives.json`
- `eval/qa/corpus/battery/defi-ecosystem/q-defi-flash-loans.json`
- `eval/qa/corpus/battery/defi-ecosystem/q-defi-named-newer-protocols.json`
- `eval/qa/corpus/battery/defi-ecosystem/q-eco-stellar-wallets-list.json`
- `eval/qa/corpus/battery/history-org-tokenomics/q-hist-remittance-corridors.json`
- `eval/qa/corpus/battery/protocol-core/q-pc-l2-payment-channels-starlight.json`
- `eval/qa/corpus/battery/retail-consumer/q-eco-xbull-wallet.json`
- `eval/qa/corpus/live/live-cases.json`
- `eval/qa/reviewed/2026-07-12-live-v3-baseline.md`
- `eval/qa/reviewed/2026-07-super-corpus-baseline.md`
- `improvements/INDEX.md`
- `improvements/intake.json`
- `improvements/stellar-light-scout/sls-024-project-lifecycle-operator-conflicts.md`
- `improvements/stellar-light-scout/sls-029-oracle-product-network-evidence.md`

Dated records to preserve as historical evidence (review links; repair any intended-live path if necessary): `.agents/rounds/2026-08-28-eval-block2.md`, `.agents/rounds/2026-09-03-truth-maintenance/scout-1.9.30-drift-terra.md`, `.agents/rounds/2026-09-08-improvements-followups/sls023-review-fable.md`, `.agents/rounds/2026-09-08-improvements-followups/sls024-review-sol.md`, `.agents/rounds/2026-09-21-improvements-followup.md`, `.agents/rounds/2026-09-29-truth-maintenance.md`, `.agents/rounds/2026-09-29-truth-maintenance/docs-independent-review.md`, `.agents/rounds/2026-09-29-truth-maintenance/scout-rechecks.json`, `.agents/rounds/2026-09-30-raven-next.md`, `.agents/rounds/2026-10-06-truth-maintenance/improvements-lane.md`, `.agents/rounds/2026-11-02-golden-audit.md`, `.agents/rounds/2026-11-02-golden-audit/pass1/defi-ecosystem-01.json`, `.agents/rounds/2026-11-02-golden-audit/pass1/protocol-core-01.json`, `.agents/rounds/2026-11-02-golden-audit/pass1/varial-retail.json`, `.agents/rounds/2026-11-02-golden-audit/pass2/defi-protocols.json`, `.agents/rounds/2026-11-02-golden-audit/pass2/full-reverify.json`, `.agents/rounds/2026-11-02-golden-audit/pass2/wallets-hackathons-safety.json`, `.agents/rounds/2026-11-02-golden-audit/reviews/pass1-consistency-rubric.md`, `.agents/rounds/2026-11-02-golden-audit/reviews/pass2-critic-rubric.md`, `.agents/rounds/2026-11-02-upstream-filing.md`, `.agents/rounds/2026-11-02-upstream-filing/hackmeridian-review.md`, `.agents/rounds/2026-11-02-upstream-followup.md`, `.agents/rounds/2026-11-03-upstream-sweep/state.md`, `.agents/rounds/2026-11-05-truth-maintenance/scout-actions.json`, `.agents/rounds/2026-11-05-truth-maintenance/scout.md`, `.agents/rounds/2026-11-06-remaining-sweep/cross-review.md`, `.agents/rounds/2026-11-06-remaining-sweep/other-actions.json`, `.agents/rounds/2026-11-06-remaining-sweep/other.md`, `research/audits/2026-07-11-eval-round-orchestration.md`, `research/audits/2026-11-03-qa-followup/case-dispositions.json`, `research/audits/2026-11-03-qa-followup/case-dispositions.md`, `research/audits/2026-11-06-remaining-sweep/other-receipt.json`, `research/qa-deep-dive-2026-08-25/terra-max.md`, `research/qa-improvement-plan-2026-08-25.md`.

### sls-029

37 matching lines; current/config/golden files to reconcile:

- `eval/qa/cases.json`
- `eval/qa/corpus/battery/defi-ecosystem/q-defi-reflector-oracle.json`
- `improvements/INDEX.md`
- `improvements/intake.json`
- `improvements/stellar-light-scout/sls-029-oracle-product-network-evidence.md`
- `improvements/stellar-light-scout/sls-112-chainlink-and-metamask-native-stellar-rows.md`

Dated records to preserve as historical evidence (review links; repair any intended-live path if necessary): `.agents/rounds/2026-09-03-truth-maintenance/scout-1.9.30-drift-terra.md`, `.agents/rounds/2026-09-08-improvements-followups/sls024-review-sol.md`, `.agents/rounds/2026-09-21-improvements-followup.md`, `.agents/rounds/2026-09-29-truth-maintenance.md`, `.agents/rounds/2026-09-29-truth-maintenance/scout-rechecks.json`, `.agents/rounds/2026-09-30-raven-next.md`, `.agents/rounds/2026-10-06-truth-maintenance/improvements-lane.md`, `.agents/rounds/2026-11-02-upstream-filing/hackmeridian-review.md`, `.agents/rounds/2026-11-02-upstream-followup.md`, `.agents/rounds/2026-11-03-upstream-sweep/state.md`, `.agents/rounds/2026-11-05-truth-maintenance/scout-actions.json`, `.agents/rounds/2026-11-05-truth-maintenance/scout.md`, `.agents/rounds/2026-11-06-remaining-sweep/other-actions.json`, `.agents/rounds/2026-11-06-remaining-sweep/other.md`, `research/audits/2026-11-03-qa-followup/case-dispositions.json`, `research/audits/2026-11-06-remaining-sweep/other-receipt.json`.

### sls-033

49 matching lines; current/config/golden files to reconcile:

- `eval/qa/cases.json`
- `eval/qa/corpus/battery/scf-grants-builders/q-scf-resolve-passport-superseded-slug.json`
- `eval/qa/corpus/battery/tooling-infra/q-tool-wallets-comparison.json`
- `improvements/INDEX.md`
- `improvements/intake.json`
- `improvements/lumenloop/ll-038-xbull-record-stale-mobile-platforms.md`
- `improvements/resolved.json`
- `improvements/stellar-light-scout/sls-033-wallet-type-enumeration-availability.md`
- `improvements/stellar-light-scout/sls-112-chainlink-and-metamask-native-stellar-rows.md`
- `inventory/stellar-light.json`

Dated records to preserve as historical evidence (review links; repair any intended-live path if necessary): `.agents/rounds/2026-09-03-truth-maintenance/scout-1.9.30-drift-terra.md`, `.agents/rounds/2026-09-08-improvements-followups/sls024-review-sol.md`, `.agents/rounds/2026-09-21-improvements-followup.md`, `.agents/rounds/2026-09-29-truth-maintenance.md`, `.agents/rounds/2026-09-29-truth-maintenance/scout-rechecks.json`, `.agents/rounds/2026-09-30-raven-next.md`, `.agents/rounds/2026-10-06-truth-maintenance/improvements-lane.md`, `.agents/rounds/2026-11-02-golden-audit/pass2/full-reverify.json`, `.agents/rounds/2026-11-02-golden-audit/reviews/pass2-critic-rubric.md`, `.agents/rounds/2026-11-02-upstream-filing/hackmeridian-review.md`, `.agents/rounds/2026-11-02-upstream-followup.md`, `.agents/rounds/2026-11-03-upstream-sweep/state.md`, `.agents/rounds/2026-11-05-truth-maintenance/scout-actions.json`, `.agents/rounds/2026-11-05-truth-maintenance/scout.md`, `.agents/rounds/2026-11-06-remaining-sweep/other-actions.json`, `.agents/rounds/2026-11-06-remaining-sweep/other.md`, `research/audits/2026-11-03-qa-followup/case-dispositions.json`, `research/audits/2026-11-03-qa-followup/case-dispositions.md`, `research/audits/2026-11-06-remaining-sweep/other-receipt.json`, `research/qa-deep-dive-2026-08-25/terra-max.md`.

### sls-099

73 matching lines; current/config/golden files to reconcile:

- `.agents/TODO.md`
- `eval/qa/cases.json`
- `eval/qa/corpus/battery/defi-ecosystem/q-defi-phoenix-what-is.json`
- `eval/qa/corpus/battery/defi-ecosystem/q-defi-provide-liquidity-impermanent-loss.json`
- `eval/qa/corpus/battery/defi-ecosystem/q-defi-soroswap-vs-stellarx.json`
- `eval/qa/corpus/battery/defi-ecosystem/q-defi-soroswap-what-is.json`
- `eval/qa/sample.json`
- `improvements/INDEX.md`
- `improvements/stellar-light-scout/sls-099-soroswap-aggregator-venue-list-stale.md`

Dated records to preserve as historical evidence (review links; repair any intended-live path if necessary): `.agents/rounds/2026-11-02-golden-audit/pass2/defi-protocols.json`, `.agents/rounds/2026-11-02-golden-audit/reviews/pass2-critic-entities.md`, `.agents/rounds/2026-11-02-golden-audit/reviews/pass2-critic-rubric.md`, `.agents/rounds/2026-11-02-golden-audit/reviews/pass3-critic-entities.md`, `.agents/rounds/2026-11-02-golden-audit/reviews/pass3-critic-rubric.md`, `.agents/rounds/2026-11-02-upstream-followup.md`, `.agents/rounds/2026-11-02-upstream-followup/rv-fl-review.md`, `.agents/rounds/2026-11-02-upstream-followup/rv-fu-review.md`, `.agents/rounds/2026-11-02-upstream-followup/rv-fu-review2.md`, `.agents/rounds/2026-11-03-upstream-sweep/state.md`, `.agents/rounds/2026-11-05-truth-maintenance/scout-actions.json`, `.agents/rounds/2026-11-05-truth-maintenance/scout.md`, `.agents/rounds/2026-11-06-remaining-sweep/other-actions.json`, `.agents/rounds/2026-11-06-remaining-sweep/other.md`, `.agents/rounds/2026-11-09-improvements-sweep.md`, `.agents/rounds/2026-11-09-upstream-handoffs.md`, `research/audits/2026-11-03-qa-followup/case-dispositions.json`, `research/audits/2026-11-03-qa-followup/case-dispositions.md`.

### sls-100

34 matching lines; current/config/golden files to reconcile:

- `eval/qa/cases.json`
- `eval/qa/corpus/battery/defi-ecosystem/q-eco-hana-wallet-scf.json`
- `improvements/INDEX.md`
- `improvements/stellar-light-scout/sls-100-hana-website-repurposed-domain.md`

Dated records to preserve as historical evidence (review links; repair any intended-live path if necessary): `.agents/rounds/2026-11-02-golden-audit/pass2/defi-protocols.json`, `.agents/rounds/2026-11-02-upstream-followup.md`, `.agents/rounds/2026-11-02-upstream-followup/rv-fl-review.md`, `.agents/rounds/2026-11-03-upstream-sweep/state.md`, `.agents/rounds/2026-11-05-truth-maintenance/scout-actions.json`, `.agents/rounds/2026-11-05-truth-maintenance/scout.md`, `.agents/rounds/2026-11-06-remaining-sweep/other-actions.json`, `.agents/rounds/2026-11-06-remaining-sweep/other.md`, `.agents/rounds/2026-11-09-improvements-sweep.md`, `research/audits/2026-11-03-qa-followup/case-dispositions.json`.

### sls-101

37 matching lines; current/config/golden files to reconcile:

- `.agents/TODO.md`
- `improvements/INDEX.md`
- `improvements/stellar-light-scout/sls-101-analyze-tvl-total-includes-stale-rows.md`

Dated records to preserve as historical evidence (review links; repair any intended-live path if necessary): `.agents/rounds/2026-11-02-upstream-followup.md`, `.agents/rounds/2026-11-02-upstream-followup/rv-fl-review.md`, `.agents/rounds/2026-11-03-upstream-sweep/state.md`, `.agents/rounds/2026-11-05-truth-maintenance.md`, `.agents/rounds/2026-11-05-truth-maintenance/scout-actions.json`, `.agents/rounds/2026-11-05-truth-maintenance/scout.md`, `.agents/rounds/2026-11-05-truth-maintenance/upstream-independent.md`, `.agents/rounds/2026-11-06-remaining-sweep/cross-review.md`, `.agents/rounds/2026-11-06-remaining-sweep/other-actions.json`, `.agents/rounds/2026-11-06-remaining-sweep/other.md`, `research/audits/2026-11-03-qa-followup/case-dispositions.json`, `research/audits/2026-11-03-qa-followup/case-dispositions.md`.

### sls-102

31 matching lines; current/config/golden files to reconcile:

- `improvements/INDEX.md`
- `improvements/stellar-light-scout/sls-039-project-tvl-history-capability.md`
- `improvements/stellar-light-scout/sls-102-blend-tvl-method-url-points-at-v1-child.md`

Dated records to preserve as historical evidence (review links; repair any intended-live path if necessary): `.agents/rounds/2026-11-02-upstream-followup.md`, `.agents/rounds/2026-11-02-upstream-followup/rv-fl-review.md`, `.agents/rounds/2026-11-03-upstream-sweep/state.md`, `.agents/rounds/2026-11-05-truth-maintenance/scout-actions.json`, `.agents/rounds/2026-11-05-truth-maintenance/scout.md`, `.agents/rounds/2026-11-06-remaining-sweep/other-actions.json`, `.agents/rounds/2026-11-06-remaining-sweep/other.md`, `.agents/rounds/2026-11-09-improvements-sweep.md`, `research/audits/2026-11-03-qa-followup/case-dispositions.json`, `research/audits/2026-11-03-qa-followup/case-dispositions.md`.

### sls-107

31 matching lines; current/config/golden files to reconcile:

- `.agents/TODO.md`
- `improvements/INDEX.md`
- `improvements/stellar-light-scout/sls-107-stablecoin-issuer-of-record-and-asset-class.md`

Dated records to preserve as historical evidence (review links; repair any intended-live path if necessary): `.agents/rounds/2026-11-02-golden-overnight.md`, `.agents/rounds/2026-11-02-upstream-filing.md`, `.agents/rounds/2026-11-02-upstream-filing/hackmeridian-review.md`, `.agents/rounds/2026-11-03-hackmeridian-golden-proposals-review.md`, `.agents/rounds/2026-11-03-upstream-sweep/state.md`, `.agents/rounds/2026-11-05-truth-maintenance/scout-actions.json`, `.agents/rounds/2026-11-05-truth-maintenance/scout.md`, `.agents/rounds/2026-11-06-remaining-sweep/other-actions.json`, `.agents/rounds/2026-11-06-remaining-sweep/other.md`, `research/audits/2026-11-02-golden-overnight/README.md`, `research/audits/2026-11-03-qa-followup/case-dispositions.json`, `research/audits/2026-11-03-qa-followup/case-dispositions.md`.

### sls-111

22 matching lines; current/config/golden files to reconcile:

- `.agents/TODO.md`
- `improvements/INDEX.md`
- `improvements/stellar-light-scout/sls-111-scf-45-award-coverage.md`

Dated records to preserve as historical evidence (review links; repair any intended-live path if necessary): `.agents/rounds/2026-11-02-upstream-filing.md`, `.agents/rounds/2026-11-02-upstream-filing/hackmeridian-review.md`, `.agents/rounds/2026-11-03-upstream-sweep/state.md`, `.agents/rounds/2026-11-05-truth-maintenance/scout-actions.json`, `.agents/rounds/2026-11-05-truth-maintenance/scout.md`, `.agents/rounds/2026-11-06-remaining-sweep/other-actions.json`, `.agents/rounds/2026-11-06-remaining-sweep/other.md`, `.agents/rounds/2026-11-09-improvements-sweep.md`, `research/audits/2026-11-03-qa-followup/case-dispositions.json`.

### sls-112

19 matching lines; current/config/golden files to reconcile:

- `.agents/TODO.md`
- `improvements/INDEX.md`
- `improvements/stellar-light-scout/sls-112-chainlink-and-metamask-native-stellar-rows.md`

Dated records to preserve as historical evidence (review links; repair any intended-live path if necessary): `.agents/rounds/2026-11-02-upstream-filing.md`, `.agents/rounds/2026-11-02-upstream-filing/hackmeridian-review.md`, `.agents/rounds/2026-11-03-upstream-sweep/state.md`, `.agents/rounds/2026-11-05-truth-maintenance/scout-actions.json`, `.agents/rounds/2026-11-05-truth-maintenance/scout.md`, `.agents/rounds/2026-11-06-remaining-sweep/other-actions.json`, `.agents/rounds/2026-11-06-remaining-sweep/other.md`, `research/audits/2026-11-03-qa-followup/case-dispositions.json`.

### sls-114

27 matching lines; current/config/golden files to reconcile:

- `.agents/TODO.md`
- `improvements/INDEX.md`
- `improvements/resolved.json`
- `improvements/stellar-light-scout/sls-114-explain-repo-fixture-interfaces-without-paths.md`
- `improvements/stellar-light-scout/sls-115-horizon-ceiling-note-scan-drift.md`

Dated records to preserve as historical evidence (review links; repair any intended-live path if necessary): `.agents/rounds/2026-11-02-upstream-followup.md`, `.agents/rounds/2026-11-02-upstream-followup/rv-fu-review2.md`, `.agents/rounds/2026-11-03-upstream-sweep/state.md`, `.agents/rounds/2026-11-05-truth-maintenance/scout-actions.json`, `.agents/rounds/2026-11-05-truth-maintenance/scout.md`, `.agents/rounds/2026-11-06-remaining-sweep/cross-review.md`, `.agents/rounds/2026-11-06-remaining-sweep/other-actions.json`, `.agents/rounds/2026-11-06-remaining-sweep/other.md`.

## Successor allocation and scope

Checked maximum ID across active Scout files and improvements/resolved.json: **sls-115**. No successor file was created and no 116..125 ID consumed. The six proposals above are conditional scope splits only: existing records already own those residuals, so immediate duplicate creation would add noise. Retire a partial record only after its complete successor and old-ref handoff exist; otherwise keep it active. sls-029 is not silently converted into a declined finding merely because an issue closed.

## Changes and validation

Updated all 13 Scout finding files with dated live evidence. Set five to fixed-upstream (099/100/102/112/114). Added a structured November 9 recurrence to 115. Kept all partial statuses and 039 disposition unchanged. No generated file edited. Baseline typecheck/tests/build are not relevant to these evidence-only Markdown changes; improvements lint is the required gate. The brief explicitly prohibits index regeneration in author lanes, so a stale-index failure after status changes must be reconciled by the coordinator.

## Required gate output

Command: `npm run improvements:lint` (bare, 2026-11-09; exit 1).

No other lint errors. The coordinator must regenerate the index after reconciling all lane changes. This lane obeyed the explicit no-index instruction. `git diff --check` passed (exit 0). Independent review, reference/golden/TODO cleanup and any upstream resolution comments remain coordinator gates before retirement.

```text
> stellar-raven-codemode@0.1.0 improvements:lint
> node scripts/improvements-lint.mjs

improvements lint failed (1):
- improvements/INDEX.md is stale; run npm run improvements:index
```
