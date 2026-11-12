# Distinct retirement review — 2026-11-12

Four candidates qualify for retirement on live evidence; sls-033 stays active; sls-111 qualifies only with a separate earlier-round successor. sls-107 still reproduces and its status is unchanged. No tracked file was edited, no upstream write was made, and no resolver was run. These are review verdicts, not a claim that cleanup or resolution comments are complete.

Reviewer: this independent Codex review session, distinct from the named gpt-6.1-sol author lane. The prohibited author evidence was not consulted. Findings, GitHub bodies and comments, and live GET responses were independently read. Other lane outputs appear only in the requested reference-path inventory; their conclusions were not used.

Production base is `https://stellarlight.xyz`, exactly the `inventory/stellar-light.json` OpenAPI server. `/api/status` reports `apiVersion: 1.9.135`. Version-only claims were checked against deployed fields and fresh original triggers. Raw HTTP responses, request-start UTC timestamps, final URLs, statuses and SHA-256 digests are in `tmp/retire-review-evidence/http-receipts.json` and the corresponding `.body` / `.meta.json` pairs. Transport failures are preserved as failures, not HTTP responses; successful retries are separately named. GitHub JSON and byte-exact `gh api ... --jq .body` outputs are retained beside them (the latter are text despite the `-body.json` suffix).

| Finding | Verdict | Deployed version | Live result | Resolving refs | Persistent refs to reconcile |
|---|---|---|---|---|---|
| sls-024 | **RETIRE** | 1.9.135 now; fix 1.9.133 | 1,020 rows; all 99 positive deployments have source/basis/date/network; lifecycle complete | https://github.com/Stellar-Light/stellarlight/pull/1947 | 8 battery cases; live corpus; template; intake override; generated cases; cross-finding link |
| sls-029 | **RETIRE** | 1.9.135 now; fix 1.9.134 | 28 sourced product/network/address records; fresh observation records distinguish updating, stale, absent and pull models | https://github.com/Stellar-Light/stellarlight/pull/1948 | Reflector golden partial cap; intake override; generated cases |
| sls-033 | **KEEP** | 1.9.135 now; fix 1.9.132 | 74 kinds; 64 availability + 10 checked-unknown; 9 unavailable platform rows still omit URLs | https://github.com/Stellar-Light/stellarlight/pull/1945 | Wallet comparison + Passport evidence; intake override (retain while KEEP) |
| sls-101 | **RETIRE** | 1.9.135 now; fix 1.9.130 | 185,490,765 over 10; stale contribution 0; unavailable rows null with dated reasons; Sentora remapped | https://github.com/Stellar-Light/stellarlight/pull/1943 | TODO; exact-TVL golden indirect reference |
| sls-111 | **RETIRE-WITH-SUCCESSOR** | 1.9.135 now; fix data execution on 1.9.135 | 40/40 round-45 page identities; Liqvid [37,45]; earlier-round coverage residual independently confirmed | https://github.com/Stellar-Light/stellarlight/pull/1946 | TODO; successor and round ledger |
| sls-115 | **RETIRE** | 1.9.135 now; fix 1.9.129 | Original/current/handoff questions answer 30; explicit 29-vs-30 conflict; pinned source confirms both | https://github.com/Stellar-Light/stellarlight/pull/1942 | TODO; round ledger |

- `2026-11-12T14:44:39.009138+00:00` — GET `https://stellarlight.xyz/api/status` — HTTP 200; SHA-256 `dbf227d6c0bdb097e740ab4823a613004661e127e2c3e80409e0e0db2d0a01bf`. Raw: `tmp/retire-review-evidence/status.body`.

## sls-024 — RETIRE

Replayed the original streaming/recurring-payments search and exact Slender, Laina, K2 Lend, OrbitCDP, Fluxity, xBull and Centaurus searches. Then independently paginated all seven categories in 100-row pages: Infrastructure 207, Tooling 189, User-Facing App 411, Asset 36, Protocol/Contract 161, Anchor 15, Partner Integration 1. The union is 1,020 distinct slugs. All pages are complete (`partial:false`), and every row has lifecycle date and basis; every non-unverified basis has a source.

All 99 mainnet/testnet claims have deployment.sourceUrl, basis, asOf and a nonempty supportedNetworks. There are no testnet/public URL-network mismatches in those sources. Allbridge has its own public contract source, dated 2026-11-12; RenderGate and CleverCon have testnet transaction/contract sources. DIA is Live as an entity with deployment unknown. The other six retractions named by the handoff also remain unknown. The 921 unknown deployments are not failures. K2 Lend’s null network list remains an honest unknown, not evidence of unsupported networks. This review validates provenance population and named controls, not all 99 contracts’ present ledger state.

GitHub: stellar-scout#9 and stellarlight#494 are closed/completed. #494’s latest fix claim is by **theboycoder**, comment 6813901930, not Raven self-validation. Earlier cited residual/backlink comments are by **kalepail**. Handoff Raven#419 is open, authored by theboycoder, with no comments. PR1947 merged at 2026-11-12T03:16:17Z as `2f88ab404aed3c824d6847322d858d4594616d16`; the successful curation action and the live source/date fields prove execution, not merely merge. No distinct residual found in this scope.

- `2026-11-12T14:44:39.419554+00:00` — GET `https://stellarlight.xyz/api/projects/search?q=streaming%20recurring%20payments&limit=100` — HTTP 200; SHA-256 `21f8f8b77992c8b5819269c66614d24dbebdf4795c7f622fcd32a7813ac53d7d`. Raw: `tmp/retire-review-evidence/streaming.body`.
- `2026-11-12T14:45:38.679353+00:00` — GET `https://stellarlight.xyz/api/projects/search?q=Allbridge&limit=100` — HTTP 200; SHA-256 `6949d0da3899d59b183c4513978964d6d9c86199cc63e01decadccd79aebc3e6`. Raw: `tmp/retire-review-evidence/project-allbridge.body`.

`--live-recheck "2026-11-12 GET https://stellarlight.xyz/api/projects/search?q=streaming%20recurring%20payments&limit=100 plus seven-category limit=100 pagination: 1020 distinct rows, lifecycle provenance complete, 99 positive deployments and zero missing source/basis/asOf/network-list fields; Allbridge mainnet and RenderGate/CleverCon testnet sourced."`

`--resolving-ref https://github.com/Stellar-Light/stellarlight/pull/1947 --resolving-ref https://github.com/stellar-experimental/stellar-raven/issues/419`

## sls-029 — RETIRE

Replayed `q=oracle&limit=100` (27 matches), and exact Band, DIA, RedStone, Lightecho and Chainlink queries. Across the independently collected project population, seven providers expose 28 oracle records. Every record has product, network, contract, address source/tier and date. The observation records were checked at 2026-11-12T03:32:05.484Z, within the documented 24-hour observation window when read.

Band: two directory-sourced addresses; mainnet has two observed-updating feeds, testnet is published-address-absent. DIA: one official testnet address, retired/absent; no asserted mainnet contract. RedStone Finance: six official-address products across both networks with per-feed observations; individual stale feeds remain visible rather than implying all feeds update. Lightecho: two addresses, mainnet observed-stale with 33 no-value feeds and last contract update 2026-10-05, testnet absent. Chainlink: distinct mainnet/testnet Data Feeds proxies with ten feeds each and a testnet Data Streams verifier marked not-observable-pull-model. Pyth verifiers also explicitly avoid a feed-liveness claim. Reflector’s Beam stale/unknown observations remain distinct from Pulse. Missing feed lists for absent/pull-only products are explicit limitations, not proof of unavailable feeds.

Adjacent summaries no longer claim timeless freshness or turn a provider listing into verified consumption. This GET-only review validates the new served evidence model and fresh observation dates; it does not independently simulate contracts or turn the observed 03:32 readings into a 15:00 feed-state claim. No materially different residual proved.

GitHub: #514 and #742 remain closed/completed. #514’s last comment is kalepail’s July residual. #742’s capability-gap acknowledgement is by theboycoder; it was not a refusal. PR1948 is merged at 2026-11-12T03:28:39Z, commit `559f9b4932c92b7c7b73d28248029e196969242f`. Its post-merge checklist alone would not suffice; the 28 populated observation objects now establish execution. No inbound handoff was assumed.

- `2026-11-12T14:44:39.338997+00:00` — GET `https://stellarlight.xyz/api/projects/search?q=oracle&limit=100` — HTTP 200; SHA-256 `6687b257aec39b43707511d2248c0f20ba0045d4ea6795ef9961de440faafcc9`. Raw: `tmp/retire-review-evidence/oracle.body`.
- `2026-11-12T14:45:44.297369+00:00` — GET `https://stellarlight.xyz/api/projects/search?q=Lightecho&limit=100` — HTTP 200; SHA-256 `439362df70e18df280029e06620c8d678f699a424cc3eba9edb08e799df17cc6`. Raw: `tmp/retire-review-evidence/project-lightecho.body`.
 
`--live-recheck "2026-11-12 GET https://stellarlight.xyz/api/projects/search?q=oracle&limit=100 plus exact Band/DIA/RedStone/Lightecho/Chainlink reads: product/network/address/source/date records and 2026-11-12 observations are live; Band updating vs absent testnet, DIA absent testnet, Lightecho stale, and Chainlink Data Feeds distinct from Data Streams."`

`--resolving-ref https://github.com/Stellar-Light/stellarlight/pull/1948`

## sls-033 — KEEP (substantial deployed fix; original URL-provenance request incomplete)

Both exact `type=Wallet&limit=100` and the handoff’s `limit=200` return 74 rows, total 74 and 74 normalized names, no null productKind. Kinds are 56 end-user-wallet, 7 hardware-wallet, 6 wallet-sdk, 4 smart-account-tooling and 1 integration-kit. 64 rows have 123 platform facts; ten have dated checks (nine none-found, Blaze could-not-check), each with sources and a note. Exact type membership is preserved; StellarTerm remains DEX, WalletConnect Infrastructure, and Stellar Passport has one canonical returned wallet row. MXlet’s hardware classification is supported by a newly read upstream firmware README. Cypher has shutdown-qualified unavailable states; its operator site still contains the shutdown notice. Kotani’s SMS availability is explicitly an integration offer, not a tested public SMS endpoint.

**Remaining original requirement:** the finding asks for a store/operator URL, checked date and state for known platform availability. Nine of the twelve unavailable platform rows still have `storeUrl:null`: xBull iOS/Android, Scopuly iOS, Lumexo iOS/Android, Empowch Android, OpenZeppelin privacy-wallet web, Interstellar iOS/Android. All 111 available facts have URLs and dates. Some negative notes identify an app ID or domain in prose, but xBull only says “formerly-listed” and Lumexo only “arriving soon.” The handoff’s assertion that each platform row has all four fields is therefore false literally. The spec intentionally defines storeUrl as null when a listing is gone; this is not a serializer violation. It is an unresolved evidence-provenance requirement: a dead checked URL or an operator source should remain independently addressable, potentially in a separate sourceUrl field if storeUrl means an installable destination.

The xBull original fixture was freshly checked: Apple’s named US listing returns 404, Apple lookup resultCount is 0, and Play app.xbull.wallet returns 404. Thus its negative state remains supported independently, but that evidence cannot be recovered from the served availability fields themselves. The xbull.app TLS failure was inconclusive and was not treated as site disappearance. Do not claim installed clients stop working.

This is the same URL-provenance dimension already requested, so KEEP is preferable to disguising it as a new finding. Preserve the documented unknown semantics and the deployed coverage progress. A future scoped split could retire coverage only after a self-contained residual is created and independently reviewed; this review does not authorize that split. No resolver arguments are approved for sls-033.

GitHub: #519 and #742 closed/completed; #519 latest fix comment 6813902275 by theboycoder. Handoff #420 is open by theboycoder, no comments. PR1945 merged 2026-11-12T01:23:08Z as `c10f1d90483419621d400b0802235c909aafbbaf`; previous schema PR540 was also read. New availabilityCheck and population are deployed on 1.9.135.

- `2026-11-12T14:45:56.542311+00:00` — GET `https://stellarlight.xyz/api/projects/search?type=Wallet&limit=200` — HTTP 200; SHA-256 `105d444cd243409d76104aba8191b7d3d8cf542b65ba35af1e80343c7dc7fbf6`. Raw: `tmp/retire-review-evidence/wallets200.body`.
- `2026-11-12T14:49:29.172410+00:00` — GET `https://apps.apple.com/us/app/xbull-wallet/id6705122563` — HTTP 404; SHA-256 `120a307f868f3276b56dabfbd5f107d1b1426b6436a15fbc8d4311160881e416`. Raw: `tmp/retire-review-evidence/xbull-ios.body`.
- `2026-11-12T14:49:29.174785+00:00` — GET `https://play.google.com/store/apps/details?id=app.xbull.wallet` — HTTP 404; SHA-256 `55c9b70c397a938f25d8ffbbb2940b35393ea196d6440ee49686e18cb9a96590`. Raw: `tmp/retire-review-evidence/xbull-android.body`.
 
## sls-101 — RETIRE

Original aggregate, DefiLlama protocols/detail calls, exact Spiko/Sentora/Etherfuse queries and handoff limit=3 queries all freshly repeated. totalTvlUSD is 185,490,765 across ten rows; the ten rounded values sum exactly to that total. staleTvlUSD is 0, staleProjects empty, staleWarning null; every summed row is dated 2026-11-12T00:57:21.335Z. The basis preserves the stale-warning rule. Spiko and Etherfuse now have null figures and dated unavailable-provider reasons. DefiLlama freshly returns empty currentChainTvls for both. Sentora maps to stellar-defi-hub and holds 84,775,748, with tvlStale false and matching method URL. DefiLlama’s later read returns Stellar 84,656,039.99883 for that child; differing observation times explain that change rather than requiring exact equality to the earlier Scout snapshot.

Adjacent: Allbridge has an unavailable reason too. Five double-counted projects are excluded and explicitly listed, totaling 220,939,877; the basis admits whole-project exclusion may undercount. No old value has been converted to a fresh zero for the unavailable fixtures. This is a dated directory aggregate, not an exact network census. No additional residual demonstrated on the tested surfaces.

GitHub: #1912 closed/completed; the newest comment 6811192887 is by theboycoder and names PR1943 plus the executed refresh. Raven’s earlier partial verification 6751083543 is by kalepail. Handoff #417 open, no comments. PR1943 merged 2026-11-12T00:53:13Z as `3fcbbf922405a305c9a22eda4742db372f04eba4`; refresh action 43130989839 completed successfully.

- `2026-11-12T14:44:39.443636+00:00` — GET `https://stellarlight.xyz/api/analyze?dimension=tvl` — HTTP 200; SHA-256 `772ab1da42586498402e5ebfba480087aa6056a9b3f86270e3522e2476853aba`. Raw: `tmp/retire-review-evidence/tvl.body`.
- `2026-11-12T14:50:52.454488+00:00` — GET `https://stellarlight.xyz/api/projects/search?q=spiko&limit=3` — HTTP 200; SHA-256 `e1397c89d3bed5bec471a46af4d1dc8364d2ca2f7cdff6c8875e4b4b52f380ae`. Raw: `tmp/retire-review-evidence/tvl-small-spiko.body`.
- `2026-11-12T14:50:52.588954+00:00` — GET `https://stellarlight.xyz/api/projects/search?q=sentora&limit=3` — HTTP 200; SHA-256 `e48ff24530e9915e8c9d83c4e192577c15cc7df7a2cc54441e018783e66972ea`. Raw: `tmp/retire-review-evidence/tvl-small-sentora.body`.
 
`--live-recheck "2026-11-12 GET https://stellarlight.xyz/api/analyze?dimension=tvl and /api/projects/search?q=<spiko|etherfuse|sentora>&limit=3: total185490765 over10, staleTvlUSD0; Spiko/Etherfuse null with dated unavailable reasons, Sentora84775748 fresh and remapped to stellar-defi-hub; unavailable and double-counted rows explicitly excluded."`

`--resolving-ref https://github.com/Stellar-Light/stellarlight/pull/1943 --resolving-ref https://github.com/stellar-experimental/stellar-raven/issues/417`

## sls-111 — RETIRE-WITH-SUCCESSOR (round 45 fixed; earlier-round coverage remains)

Paginated all 635 awarded rows with offsets 0..600. Exactly 40 hold round 45. Independently parsed the rendered official all-rounds listing: 40 distinct SCF #45 project URLs. Identity comparison, not just totals, shows zero missing and zero extra URLs against Scout scfSourceUrl. All 40 official project pages were freshly fetched: 37 have an explicit Awarded verdict for #45; Pods, Canary Protocol and Minisend have Information Collection submissions plus the project-level awarded:true and lastAwardedRound:45. Those three are source-qualified official project awards, not evidence that Information Collection universally means awarded. Liqvid’s own page explicitly says 37/45 Awarded, 30/44 Not Awarded; Scout returns [37,45]. Enable is [45], Rumble Fish [41,42,45]. Pollar, Pods and Principal all resolve.

GitHub: issue1903 remains open. The original recommendation to copy buildAwardRounds was corrected by **kalepail**, not a maintainer. Latest deployed-fix comment 6814436717 is by **theboycoder**. Handoff421 is open, no comments. PR1922 (merged Nov7) fixed only part; PR1946 merged Nov12T01:34:39Z as `d938427ec725c9b5e7c22b16ea302081394a50a8`. Both curation and enrich-scf actions completed successfully. The merged workflow invokes the round-count check; the checked upstream baseline explicitly retains older shortfalls rather than proving those rounds complete.

**Adjacent residual, independently confirmed:** the live category union holds 43 #44 awards. Three official pages for OZ Accounts Policy Builder by Gateway.fm, Passkey UI and Soroban Contract Source Verification Service each explicitly say Awarded in SCF #44; none is linked by any returned row’s scfSourceUrl. Gateway.fm’s row only holds [16]. The upstream merge-pinned baseline says 46 versus43 for #44 and documents older shortfalls. Separately, the served StellarPay row claims round30/$148,400 without source/date, while the official StellarPay page says round30 Not Awarded and round2 Awarded. Identity/amount reconciliation is needed before endorsing that row. These are earlier-round coverage/attribution defects, materially different from the now-fixed #45 intake. Do not reuse the handoff’s 119-shortfall count as an independently recomputed global count.

**Draft successor finding (not filed):** On 2026-11-12, Scout’s current SCF award population still omits source-backed earlier-round awards and exposes unsourced round assignments after the #45 repair. Full awarded pagination and the seven-category union show 43 round44 awards, while freshly read official project pages for OZ Accounts Policy Builder by Gateway.fm, Passkey UI, and Soroban Contract Source Verification Service each mark round44 Awarded and have no matching served scfSourceUrl; Gateway.fm carries only round16. The served StellarPay row also claims round30/$148,400 with null scfSourceUrl/scfAsOf, whereas the official StellarPay page marks round30 Not Awarded and round2 Awarded. Reconcile each project identity and submission verdict, ingest the missing awards, remove or correct unsupported joins, and retain source/date on every award; verify page identities as well as round totals. PR1946’s dated shortfall baseline acknowledges older gaps but does not resolve them.

Dedupe of active Scout findings and resolved receipts found no existing owner for these concrete earlier-round residuals. Retirement is conditional on retaining this successor and linking it on the still-open upstream issue. No successor file was created here.

- `2026-11-12T14:44:39.755091+00:00` — GET `https://stellarlight.xyz/api/projects/search?scfAwarded=true&limit=100&offset=0` — HTTP 200; SHA-256 `69977aee1615eca45abe8b2a6f2923e8140a7df390256e15346cea97cb415789`. Raw: `tmp/retire-review-evidence/scf0.body`.
- `2026-11-12T14:45:52.447292+00:00` — GET `https://communityfund.stellar.org/projects?tab=all-rounds` — HTTP 200; SHA-256 `01745ccc75eb752284eb1f5d6a63ccbe5b425f6552eea0b0f43cad66f630abd6`. Raw: `tmp/retire-review-evidence/scf-official.body`.
- `2026-11-12T14:50:51.732586+00:00` — GET `https://communityfund.stellar.org/project/passkey-ui-sj6` — HTTP 200; SHA-256 `46eb7ebde6390fa4ea3e9f3e093a2844c675af29faf88c6142f6f790f948ec5e`. Raw: `tmp/retire-review-evidence/scf-adjacent-passkey-ui-sj6.body`.
 
Conditional `--live-recheck "2026-11-12 GET https://stellarlight.xyz/api/projects/search?scfAwarded=true&limit=100&offset=0 (all635 paged) vs https://communityfund.stellar.org/projects?tab=all-rounds: round45 40/40 exact source-page identities, Liqvid[37,45], Pollar/Pods/Principal found; earlier-round residual retained in successor."`

Conditional `--resolving-ref https://github.com/Stellar-Light/stellarlight/pull/1922 --resolving-ref https://github.com/Stellar-Light/stellarlight/pull/1946 --resolving-ref https://github.com/stellar-experimental/stellar-raven/issues/421`

## sls-115 — RETIRE

The verbatim original question, explicit-current question excluding Mainnet activation, and handoff’s “what is the max supported protocol version” all return 30 with answerSource stellarlight-code-scan and answerAsOf 2026-11-12T00:59:42.001Z. sourceCheck.state is conflict, notedValue29, scannedValue30; sourceCheck.scannedRef equals codeVerified.scannedRef `6a13f41808586884c9a7b1beecd92088b7284070`. Fresh gh api reads of internal/ingest/main.go confirm 30 at that exact commit and at the finding’s older scan597544b, and 29 at note430a28e.

Adjacent: searchRepos carries the same note conflict. An explicitly historical October8 question still foregrounds the current scan, but its answer explicitly preserves “29 as of 2026-10-08” with the commit and full dated note; no false historical value is asserted and the recommendation to preserve the note is met. The deployed mechanism is pin-based and does not just replace a hard-coded 29 with30. GET-only tests cannot induce future commits; reviewed merged changes show generic symbol-pin reading, conflict/missing/unknown handling. No distinct residual proved.

GitHub: issue1933 remains open, latest fix comment6811193184 by theboycoder; handoff418 open, no comments. PR1942 merged2026-11-12T00:42:47Z as `9c4d5552b93cee9bc32cc0cbac350856b46f0da5`; both scan and note-backfill runs completed successfully. Initial timeouts on two variants were retried successfully and are not treated as failing answer behavior.

- `2026-11-12T14:45:47.018837+00:00` — GET `https://stellarlight.xyz/api/repos/explain?repo=stellar%2Fstellar-horizon&q=Which+Horizon+ingestion+constant+pins+the+highest+supported+protocol+version%2C+and+what+is+its+value%3F` — HTTP 200; SHA-256 `a6b64951435456bc499c02b8fefd6cd6d76a0c380949a506e3248d3b6f5edbd1`. Raw: `tmp/retire-review-evidence/horizon-original.body`.
- `2026-11-12T14:47:02.818931+00:00` — GET `https://stellarlight.xyz/api/repos/explain?repo=stellar%2Fstellar-horizon&q=As+of+today+at+codeVerified.scannedRef%2C+what+is+the+value+of+MaxSupportedProtocolVersion+in+internal%2Fingest%2Fmain.go%3F+Not+the+active+Mainnet+protocol.` — HTTP 200; SHA-256 `bfb8a7fbf2c9af063d7ee9e9c4802fc0b97000a8532b968d43f9001ab7709ffa`. Raw: `tmp/retire-review-evidence/horizon-current-retry.body`.
 
`--live-recheck "2026-11-12 GET https://stellarlight.xyz/api/repos/explain?repo=stellar%2Fstellar-horizon&q=Which+Horizon+ingestion+constant+pins+the+highest+supported+protocol+version%2C+and+what+is+its+value%3F plus explicit-current and handoff controls: answer30, stellarlight-code-scan, sourceCheck conflict29vs30 at matching6a13f418; gh api exact-source reads confirm30 and historical430a28e confirms29."`

`--resolving-ref https://github.com/Stellar-Light/stellarlight/pull/1942 --resolving-ref https://github.com/stellar-experimental/stellar-raven/issues/418`

## sls-107 — issuer residual still reproduces; status untouched

GET /api/stablecoins?limit=100 returns 37 rows, not the earlier41. All37 have issuerOfRecord and issuerOfRecordCheck null (and source/date/note null). AUDD retains company Novatti Group while its freshly read TOML names AUDC PTY LTD. The eight Currency One rows remain present; the TOML names Kinesis Money Panama S.A. MGUSD still has no issuer note despite its TOML naming MoneyGram Payment Systems, Inc. and Bridge in the currency description. The Yield Stablecoin filter succeeds and returns USDY/YLDS. This is a population residual, not a missing schema/filter. PR1923 is merged and its body explicitly requires an opt-in plus execute; this review performed neither. Issue1900’s latest verification is by kalepail.

- `2026-11-12T14:44:39.454436+00:00` — GET `https://stellarlight.xyz/api/stablecoins?limit=100` — HTTP 200; SHA-256 `8bf15f9948dc8ec7ce3427a567e819018893e90dd48ed0956b1749348463da22`. Raw: `tmp/retire-review-evidence/stablecoins.body`.
- `2026-11-12T14:45:54.830630+00:00` — GET `https://audd.digital/.well-known/stellar.toml` — HTTP 200; SHA-256 `76bc56ee896dbe79c6c62c3d40d1f9daf094b0ef4ca04c9c3d5da7496132c936`. Raw: `tmp/retire-review-evidence/audd-toml.body`.
- `2026-11-12T14:45:55.888520+00:00` — GET `https://currency.one/.well-known/stellar.toml` — HTTP 200; SHA-256 `3576ef6f88809558e4c272bcc5e00f95623fa7fee0bce05810710feea10ca392`. Raw: `tmp/retire-review-evidence/c1-toml.body`.
 
## Retirement work still required

No comments were posted. The latest owner fix claims do not replace Raven’s independent resolution comment with commit-pinned source on each recorded upstream issue. Before deletion, the acting lane must reconcile the references below, post/read back the resolver’s exact resolution comment on every applicable upstream ref, retain the sls-111 successor and link it on issue1903, then run resolver dry-run and required lint/generation gates. sls-033 remains active. None of the six files has a probe frontmatter block, and the reference scans found no external probe registration to delete. Intake overrides exist for024/029/033; delete only on actual retirement. Add one receipt per retired ID to improvements/resolved.json; regenerate INDEX rather than editing it.

No code validation was run: this was read-only service verification, with only tmp evidence and this report written.

## Persistent-reference reconciliation inventory

Ran `rg -n --hidden --glob !node_modules/** --glob !tmp/** --glob !.git/** <id> .` separately for all six; complete line-level results are `refs-sls-NNN.txt`. This includes hidden .agents entries. The lists below enumerate every matching persistent path; historical records remain dated and resolve through the receipt/git history. Do not rewrite past findings to say they observed today’s fix. The current round ledger should record the final action; other lane outputs are listed by path only and need no historical rewriting.

No literal ID match was found in `eval/qa/consistency-register.json`. However, any golden-note changes require regenerating/checking the register and generated cases using repo scripts. `q-edge-noinfo-exact-tvl-figure.json` is an indirect consumer named by sls-101 even though it has no literal sls-101 match: its golden claim needs no change, and its November 2 figures are explicitly dated historical evidence; append a fresh verification only when re-verifying, preserving the rule against undated exact-network totals. q-defi-allbridge-what-is is also named indirectly by sls-024; recheck its deployment evidence without inventing capabilities.

### sls-024 references

| Path (matching lines) | Retirement action |
|---|---|
| `.agents/rounds/2026-08-28-eval-block2.md` (71) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-09-03-truth-maintenance/scout-1.9.30-drift-terra.md` (203) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-09-08-improvements-followups/sls023-review-fable.md` (173, 209, 229, 247, 359, 391) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-09-08-improvements-followups/sls024-review-sol.md` (1, 5, 9, 26, 55, 58, 62, 65, 102, 120, 141, 234, 265, 287, 288, 291, 292, 322) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-09-21-improvements-followup.md` (115) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-09-29-truth-maintenance.md` (14, 84) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-09-29-truth-maintenance/docs-independent-review.md` (1, 10, 45, 68) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-09-29-truth-maintenance/scout-rechecks.json` (147) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-09-30-raven-next.md` (62) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-10-06-truth-maintenance/improvements-lane.md` (51) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-02-golden-audit.md` (121) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-02-golden-audit/pass1/defi-ecosystem-01.json` (831, 1494, 1548) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-02-golden-audit/pass1/protocol-core-01.json` (796, 827, 861, 862, 1116, 1126, 1127, 1163) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-02-golden-audit/pass1/varial-retail.json` (1417) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-02-golden-audit/pass2/defi-protocols.json` (83, 88, 474, 675, 685) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-02-golden-audit/pass2/full-reverify.json` (2288) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-02-golden-audit/pass2/wallets-hackathons-safety.json` (241, 948, 950, 995, 1011, 1013) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-02-golden-audit/reviews/pass1-consistency-rubric.md` (157) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-02-golden-audit/reviews/pass2-critic-rubric.md` (94) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-02-upstream-filing.md` (100) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-02-upstream-filing/hackmeridian-review.md` (178) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-02-upstream-followup.md` (14) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-03-upstream-sweep/state.md` (181, 182) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-05-truth-maintenance/scout-actions.json` (3, 4) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-05-truth-maintenance/scout.md` (38, 66, 67) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-06-remaining-sweep/cross-review.md` (324) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-06-remaining-sweep/other-actions.json` (1785, 1786, 2355) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-06-remaining-sweep/other.md` (130, 180) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-09-improvements-sweep.md` (55) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-12-truth-maintenance.md` (10, 124) | update — record this independent verdict and final reconciliation |
| `.github/ISSUE_TEMPLATE/upstream-improvement-ready.yml` (14, 15, 24) | update — replace live-file placeholder with an active example or stable receipt; ID text alone may remain |
| `catalog/manifest.json` (19664, 19824) | none — generated/source snapshots quote upstream historical IDs; no handwritten edit |
| `eval/qa/cases.json` (11321, 13212, 13219, 13758, 19012, 19393, 19489, 27285, 27361, 34943, 35072, 35078, 35086, 35098) | update — regenerate from owned cases after edits |
| `eval/qa/corpus/battery/defi-ecosystem/q-defi-blend-alternatives.json` (299) | update — replace active-file evidence links with receipt/pinned snapshot; expire sls-dependent partial caps after truth review; retain dated observations |
| `eval/qa/corpus/battery/defi-ecosystem/q-defi-flash-loans.json` (210, 217) | update — replace active-file evidence links with receipt/pinned snapshot; expire sls-dependent partial caps after truth review; retain dated observations |
| `eval/qa/corpus/battery/defi-ecosystem/q-defi-named-newer-protocols.json` (22) | update — replace active-file evidence links with receipt/pinned snapshot; expire sls-dependent partial caps after truth review; retain dated observations |
| `eval/qa/corpus/battery/defi-ecosystem/q-eco-stellar-wallets-list.json` (19) | update — replace active-file evidence links with receipt/pinned snapshot; expire sls-dependent partial caps after truth review; retain dated observations |
| `eval/qa/corpus/battery/history-org-tokenomics/q-hist-remittance-corridors.json` (21, 97) | update — replace active-file evidence links with receipt/pinned snapshot; expire sls-dependent partial caps after truth review; retain dated observations |
| `eval/qa/corpus/battery/protocol-core/q-pc-l2-payment-channels-starlight.json` (21, 150, 156, 164, 176) | update — replace active-file evidence links with receipt/pinned snapshot; expire sls-dependent partial caps after truth review; retain dated observations |
| `eval/qa/corpus/battery/retail-consumer/q-eco-xbull-wallet.json` (95, 191) | update — replace active-file evidence links with receipt/pinned snapshot; expire sls-dependent partial caps after truth review; retain dated observations |
| `eval/qa/corpus/live/live-cases.json` (513, 585) | update — reconcile active finding/cap references; preserve source/date limitations |
| `eval/qa/reviewed/2026-07-12-live-v3-baseline.md` (143) | none — dated historical record; preserve, receipt/history supplies resolution |
| `eval/qa/reviewed/2026-07-super-corpus-baseline.md` (80, 106) | none — dated historical record; preserve, receipt/history supplies resolution |
| `improvements/INDEX.md` (29) | update — regenerate after retirement |
| `improvements/intake.json` (166) | remove — per-finding override when retired (retain sls-033 now) |
| `improvements/stellar-light-scout/sls-024-project-lifecycle-operator-conflicts.md` (2, 8, 37) | remove — resolver only after all retirement gates (retain sls-033 now) |
| `improvements/stellar-light-scout/sls-029-oracle-product-network-evidence.md` (21) | update — change cross-link to resolved receipt or pinned source, retaining historical attribution |
| `inventory/stellar-light.json` (2571, 2731) | none — generated/source snapshots quote upstream historical IDs; no handwritten edit |
| `research/audits/2026-07-11-eval-round-orchestration.md` (49, 77) | none — dated historical record; preserve, receipt/history supplies resolution |
| `research/audits/2026-11-03-qa-followup/case-dispositions.json` (869, 872, 2723, 2726, 3743, 3745, 4961, 5098, 5519, 10493) | none — dated historical record; preserve, receipt/history supplies resolution |
| `research/audits/2026-11-03-qa-followup/case-dispositions.md` (54, 341, 370, 456) | none — dated historical record; preserve, receipt/history supplies resolution |
| `research/audits/2026-11-06-remaining-sweep/other-receipt.json` (5727, 7232) | none — dated historical record; preserve, receipt/history supplies resolution |
| `research/audits/2026-11-09-improvements-sweep/lane-scout.md` (11, 33, 39, 140, 350, 354, 372) | none — dated historical record; preserve, receipt/history supplies resolution |
| `research/audits/2026-11-12-truth-maintenance/comb-scout-lumenloop.md` (3, 63, 74, 258, 259, 260) | none — dated historical record; preserve, receipt/history supplies resolution |
| `research/audits/2026-11-12-truth-maintenance/review-drift-astra.md` (18, 102) | none — dated historical record; preserve, receipt/history supplies resolution |
| `research/qa-deep-dive-2026-08-25/terra-max.md` (193) | none — dated historical record; preserve, receipt/history supplies resolution |
| `research/qa-improvement-plan-2026-08-25.md` (88) | none — dated historical record; preserve, receipt/history supplies resolution |

### sls-029 references

| Path (matching lines) | Retirement action |
|---|---|
| `.agents/rounds/2026-09-03-truth-maintenance/scout-1.9.30-drift-terra.md` (207) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-09-08-improvements-followups/sls024-review-sol.md` (56, 57, 280, 291) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-09-21-improvements-followup.md` (116) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-09-29-truth-maintenance.md` (85) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-09-29-truth-maintenance/scout-rechecks.json` (43) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-09-30-raven-next.md` (62) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-10-06-truth-maintenance/improvements-lane.md` (52) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-02-upstream-filing/hackmeridian-review.md` (162) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-02-upstream-followup.md` (14) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-03-upstream-sweep/state.md` (183, 184) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-05-truth-maintenance/scout-actions.json` (18, 19) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-05-truth-maintenance/scout.md` (39) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-06-remaining-sweep/other-actions.json` (1828, 1829, 2356) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-06-remaining-sweep/other.md` (131, 181) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-12-truth-maintenance.md` (124) | update — record this independent verdict and final reconciliation |
| `catalog/manifest.json` (19867) | none — generated/source snapshots quote upstream historical IDs; no handwritten edit |
| `eval/qa/cases.json` (14974) | update — regenerate from owned cases after edits |
| `eval/qa/corpus/battery/defi-ecosystem/q-defi-reflector-oracle.json` (23) | update — replace active-file evidence links with receipt/pinned snapshot; expire sls-dependent partial caps after truth review; retain dated observations |
| `improvements/INDEX.md` (30) | update — regenerate after retirement |
| `improvements/intake.json` (170) | remove — per-finding override when retired (retain sls-033 now) |
| `improvements/stellar-light-scout/sls-029-oracle-product-network-evidence.md` (2, 8) | remove — resolver only after all retirement gates (retain sls-033 now) |
| `inventory/stellar-light.json` (2774) | none — generated/source snapshots quote upstream historical IDs; no handwritten edit |
| `research/audits/2026-11-03-qa-followup/case-dispositions.json` (876, 879, 2730, 2733, 3749, 3751, 10497) | none — dated historical record; preserve, receipt/history supplies resolution |
| `research/audits/2026-11-06-remaining-sweep/other-receipt.json` (7052) | none — dated historical record; preserve, receipt/history supplies resolution |
| `research/audits/2026-11-09-improvements-sweep/lane-scout.md` (12, 77, 277, 373, 377, 385, 498) | none — dated historical record; preserve, receipt/history supplies resolution |
| `research/audits/2026-11-09-improvements-sweep/review-astra.md` (81, 148) | none — dated historical record; preserve, receipt/history supplies resolution |
| `research/audits/2026-11-09-improvements-sweep/review-gold-fable.md` (19, 150, 228) | none — dated historical record; preserve, receipt/history supplies resolution |
| `research/audits/2026-11-12-truth-maintenance/comb-scout-lumenloop.md` (5, 64, 80, 261) | none — dated historical record; preserve, receipt/history supplies resolution |
| `research/audits/2026-11-12-truth-maintenance/review-drift-astra.md` (18, 102) | none — dated historical record; preserve, receipt/history supplies resolution |

### sls-033 references

| Path (matching lines) | Retirement action |
|---|---|
| `.agents/rounds/2026-09-03-truth-maintenance/scout-1.9.30-drift-terra.md` (214) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-09-08-improvements-followups/sls024-review-sol.md` (280) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-09-21-improvements-followup.md` (117) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-09-29-truth-maintenance.md` (85) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-09-29-truth-maintenance/scout-rechecks.json` (83) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-09-30-raven-next.md` (62) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-10-06-truth-maintenance/improvements-lane.md` (53) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-02-golden-audit/pass2/full-reverify.json` (2064, 2068) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-02-golden-audit/reviews/pass2-critic-rubric.md` (95) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-02-upstream-filing/hackmeridian-review.md` (162) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-02-upstream-followup.md` (14) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-03-upstream-sweep/state.md` (185, 186) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-05-truth-maintenance/scout-actions.json` (36, 37) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-05-truth-maintenance/scout.md` (40) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-06-remaining-sweep/other-actions.json` (1874, 1875, 2357) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-06-remaining-sweep/other.md` (132, 182) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-12-truth-maintenance.md` (10, 124) | update — record this independent verdict and final reconciliation |
| `eval/qa/cases.json` (49697, 73609, 73832) | update — regenerate from owned cases after edits |
| `eval/qa/corpus/battery/scf-grants-builders/q-scf-resolve-passport-superseded-slug.json` (118) | update — replace active-file evidence links with receipt/pinned snapshot; expire sls-dependent partial caps after truth review; retain dated observations |
| `eval/qa/corpus/battery/tooling-infra/q-tool-wallets-comparison.json` (22, 245) | update — replace active-file evidence links with receipt/pinned snapshot; expire sls-dependent partial caps after truth review; retain dated observations |
| `improvements/INDEX.md` (31) | update — regenerate after retirement |
| `improvements/intake.json` (174) | remove — per-finding override when retired (retain sls-033 now) |
| `improvements/lumenloop/ll-038-xbull-record-stale-mobile-platforms.md` (12) | update — change cross-link to resolved receipt or pinned source, retaining historical attribution |
| `improvements/resolved.json` (2890) | none for existing historic cross-reference; append new receipt only if retiring |
| `improvements/stellar-light-scout/sls-033-wallet-type-enumeration-availability.md` (2, 8) | remove — resolver only after all retirement gates (retain sls-033 now) |
| `inventory/stellar-light.json` (4951) | none — generated/source snapshots quote upstream historical IDs; no handwritten edit |
| `research/audits/2026-11-03-qa-followup/case-dispositions.json` (883, 886, 2737, 2740, 3755, 3757, 5520, 10501) | none — dated historical record; preserve, receipt/history supplies resolution |
| `research/audits/2026-11-03-qa-followup/case-dispositions.md` (55, 456) | none — dated historical record; preserve, receipt/history supplies resolution |
| `research/audits/2026-11-06-remaining-sweep/other-receipt.json` (5924, 7579) | none — dated historical record; preserve, receipt/history supplies resolution |
| `research/audits/2026-11-09-improvements-sweep/lane-scout.md` (13, 100, 390, 401) | none — dated historical record; preserve, receipt/history supplies resolution |
| `research/audits/2026-11-12-truth-maintenance/comb-scout-lumenloop.md` (65, 86, 262, 263) | none — dated historical record; preserve, receipt/history supplies resolution |
| `research/audits/2026-11-12-truth-maintenance/review-drift-astra.md` (18, 102) | none — dated historical record; preserve, receipt/history supplies resolution |
| `research/qa-deep-dive-2026-08-25/terra-max.md` (193) | none — dated historical record; preserve, receipt/history supplies resolution |

### sls-101 references

| Path (matching lines) | Retirement action |
|---|---|
| `.agents/TODO.md` (64, 65) | update — remove fulfilled wake-up; retain sls-107; replace earlier-round SCF work with successor |
| `.agents/rounds/2026-11-02-upstream-followup.md` (143) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-02-upstream-followup/rv-fl-review.md` (31, 318) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-03-upstream-sweep/state.md` (195) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-05-truth-maintenance.md` (81) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-05-truth-maintenance/scout-actions.json` (169, 170) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-05-truth-maintenance/scout.md` (7, 48, 76) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-05-truth-maintenance/upstream-independent.md` (3, 117) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-06-remaining-sweep/cross-review.md` (231, 345) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-06-remaining-sweep/other-actions.json` (9, 2072, 2073, 2358) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-06-remaining-sweep/other.md` (48, 137, 183) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-09-improvements-sweep.md` (78, 100) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-12-truth-maintenance.md` (10, 124) | update — record this independent verdict and final reconciliation |
| `improvements/INDEX.md` (33) | update — regenerate after retirement |
| `improvements/stellar-light-scout/sls-101-analyze-tvl-total-includes-stale-rows.md` (2, 10) | remove — resolver only after all retirement gates (retain sls-033 now) |
| `research/audits/2026-11-03-qa-followup/case-dispositions.json` (960, 963, 2814, 2817, 3821, 3823, 4301, 5399, 10545) | none — dated historical record; preserve, receipt/history supplies resolution |
| `research/audits/2026-11-03-qa-followup/case-dispositions.md` (59, 190, 429) | none — dated historical record; preserve, receipt/history supplies resolution |
| `research/audits/2026-11-09-improvements-sweep/lane-scout.md` (17, 174, 350, 434, 440) | none — dated historical record; preserve, receipt/history supplies resolution |
| `research/audits/2026-11-09-improvements-sweep/review-astra.md` (3, 14, 103, 113, 133) | none — dated historical record; preserve, receipt/history supplies resolution |
| `research/audits/2026-11-12-truth-maintenance/comb-scout-lumenloop.md` (67, 90, 264, 265) | none — dated historical record; preserve, receipt/history supplies resolution |
| `research/audits/2026-11-12-truth-maintenance/review-drift-astra.md` (18, 103) | none — dated historical record; preserve, receipt/history supplies resolution |

### sls-111 references

| Path (matching lines) | Retirement action |
|---|---|
| `.agents/TODO.md` (72) | update — remove fulfilled wake-up; retain sls-107; replace earlier-round SCF work with successor |
| `.agents/rounds/2026-11-02-upstream-filing.md` (106) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-02-upstream-filing/hackmeridian-review.md` (136) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-03-upstream-sweep/state.md` (204) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-05-truth-maintenance/scout-actions.json` (322, 323) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-05-truth-maintenance/scout.md` (9, 57, 74) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-06-remaining-sweep/other-actions.json` (2173, 2174) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-06-remaining-sweep/other.md` (140) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-09-improvements-sweep.md` (16) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-12-truth-maintenance.md` (10, 124) | update — record this independent verdict and final reconciliation |
| `improvements/INDEX.md` (35) | update — regenerate after retirement |
| `improvements/stellar-light-scout/sls-111-scf-45-award-coverage.md` (2) | remove — resolver only after all retirement gates (retain sls-033 now) |
| `research/audits/2026-11-03-qa-followup/case-dispositions.json` (1023, 1026, 2877, 2880, 3875, 3877, 10581) | none — dated historical record; preserve, receipt/history supplies resolution |
| `research/audits/2026-11-09-improvements-sweep/lane-scout.md` (20, 240, 248, 464, 470) | none — dated historical record; preserve, receipt/history supplies resolution |
| `research/audits/2026-11-12-truth-maintenance/comb-scout-lumenloop.md` (69, 102, 106, 241, 267) | none — dated historical record; preserve, receipt/history supplies resolution |

### sls-115 references

| Path (matching lines) | Retirement action |
|---|---|
| `.agents/TODO.md` (69, 128) | update — remove fulfilled wake-up; retain sls-107; replace earlier-round SCF work with successor |
| `.agents/rounds/2026-11-05-truth-maintenance/scout.md` (3) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-06-remaining-sweep.md` (50) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-06-remaining-sweep/cross-review.md` (5, 6, 46, 48, 211, 355) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-06-remaining-sweep/other-actions.json` (2, 11, 2276) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-06-remaining-sweep/other.md` (34, 143, 166, 186, 203) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-09-improvements-sweep.md` (16, 55) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-10-truth-maintenance.md` (56, 118) | none — dated historical record; preserve, receipt/history supplies resolution |
| `.agents/rounds/2026-11-12-truth-maintenance.md` (10, 73, 124) | update — record this independent verdict and final reconciliation |
| `improvements/INDEX.md` (36) | update — regenerate after retirement |
| `improvements/stellar-light-scout/sls-115-horizon-ceiling-note-scan-drift.md` (2) | remove — resolver only after all retirement gates (retain sls-033 now) |
| `research/audits/2026-11-06-remaining-sweep/coverage.json` (7) | none — dated historical record; preserve, receipt/history supplies resolution |
| `research/audits/2026-11-09-improvements-sweep/lane-scout.md` (5, 23, 297, 309, 352, 492, 498) | none — dated historical record; preserve, receipt/history supplies resolution |
| `research/audits/2026-11-09-improvements-sweep/review-astra.md` (13, 101, 149) | none — dated historical record; preserve, receipt/history supplies resolution |
| `research/audits/2026-11-09-improvements-sweep/review-gold-fable.md` (19, 231, 234) | none — dated historical record; preserve, receipt/history supplies resolution |
| `research/audits/2026-11-12-truth-maintenance/comb-scout-lumenloop.md` (70, 110) | none — dated historical record; preserve, receipt/history supplies resolution |
| `research/audits/2026-11-12-truth-maintenance/review-drift-astra.md` (18, 103) | none — dated historical record; preserve, receipt/history supplies resolution |

## GitHub state ledger

All entries below were read directly with gh api. PRs have no issue state_reason; merged and merge_commit_sha are the relevant fields. Empty formal review lists were observed for1942/1943/1945/1946/1947/1948; claims of independent upstream review in PR prose were not treated as our review. Latest PR comments are deployment-bot reports, not human acceptance.

| Ref | State / reason | Closed at | Merge commit | Latest comment author(s) |
|---|---|---|---|---|
| https://github.com/Stellar-Light/stellar-scout/issues/9 | closed / completed | 2026-08-11T22:40:44Z | — | theboycoder #5259690727, kalepail #5415888272 |
| https://github.com/Stellar-Light/stellarlight/issues/1900 | closed / completed | 2026-11-05T16:11:54Z | — | kalepail #6751084106 |
| https://github.com/Stellar-Light/stellarlight/issues/1903 | open / n/a | — | — | kalepail #6674314385, theboycoder #6814436717 |
| https://github.com/Stellar-Light/stellarlight/issues/1912 | closed / completed | 2026-11-05T15:19:23Z | — | kalepail #6751083543, theboycoder #6811192887 |
| https://github.com/Stellar-Light/stellarlight/pull/1922 | merged / n/a | 2026-11-07T01:55:19Z | 01972c7f9b87f7f6a2bafaf940aeb9b45b9827b6 | vercel[bot] #6659450777 |
| https://github.com/Stellar-Light/stellarlight/pull/1923 | merged / n/a | 2026-11-05T16:11:52Z | e7cbc1262edf9e515c8b5522b343fef54eb3e948 | vercel[bot] #6659454089 |
| https://github.com/Stellar-Light/stellarlight/issues/1933 | open / n/a | — | — | theboycoder #6811193184 |
| https://github.com/Stellar-Light/stellarlight/pull/1942 | merged / n/a | 2026-11-12T00:42:47Z | 9c4d5552b93cee9bc32cc0cbac350856b46f0da5 | vercel[bot] #6810783109 |
| https://github.com/Stellar-Light/stellarlight/pull/1943 | merged / n/a | 2026-11-12T00:53:13Z | 3fcbbf922405a305c9a22eda4742db372f04eba4 | vercel[bot] #6810973360 |
| https://github.com/Stellar-Light/stellarlight/pull/1945 | merged / n/a | 2026-11-12T01:23:08Z | c10f1d90483419621d400b0802235c909aafbbaf | vercel[bot] #6811239935 |
| https://github.com/Stellar-Light/stellarlight/pull/1946 | merged / n/a | 2026-11-12T01:34:39Z | d938427ec725c9b5e7c22b16ea302081394a50a8 | vercel[bot] #6811722324 |
| https://github.com/Stellar-Light/stellarlight/pull/1947 | merged / n/a | 2026-11-12T03:16:18Z | 2f88ab404aed3c824d6847322d858d4594616d16 | vercel[bot] #6811817705 |
| https://github.com/Stellar-Light/stellarlight/pull/1948 | merged / n/a | 2026-11-12T03:28:39Z | 559f9b4932c92b7c7b73d28248029e196969242f | vercel[bot] #6813356591 |
| https://github.com/Stellar-Light/stellarlight/issues/494 | closed / completed | 2026-08-11T22:40:41Z | — | kalepail #5589712494, theboycoder #6813901930 |
| https://github.com/Stellar-Light/stellarlight/issues/514 | closed / completed | 2026-07-14T00:12:15Z | — | theboycoder #4976982460, kalepail #4982290253 |
| https://github.com/Stellar-Light/stellarlight/issues/519 | closed / completed | 2026-07-14T22:32:11Z | — | theboycoder #4983613441, theboycoder #6813902275 |
| https://github.com/Stellar-Light/stellarlight/pull/540 | merged / n/a | 2026-07-14T19:39:00Z | 2c7f2ad8f101655d92392843277f45c9fc705599 | vercel[bot] #4972905667, kalepail #4982419462 |
| https://github.com/Stellar-Light/stellarlight/issues/742 | closed / completed | 2026-08-13T04:57:53Z | — | kalepail #5133765754, kalepail #5348534497 |
| https://github.com/stellar-experimental/stellar-raven/issues/417 | open / n/a | — | — | none |
| https://github.com/stellar-experimental/stellar-raven/issues/418 | open / n/a | — | — | none |
| https://github.com/stellar-experimental/stellar-raven/issues/419 | open / n/a | — | — | none |
| https://github.com/stellar-experimental/stellar-raven/issues/420 | open / n/a | — | — | none |
| https://github.com/stellar-experimental/stellar-raven/issues/421 | open / n/a | — | — | none |

The metadata ledger includes earlier PR540/1922/1923 as historical context and sls-107’s issue1900. Handoffs417–421 are all open and authored by theboycoder. Primary source files for Horizon’s three commit refs were also fetched with gh api and retained as `horizon-source-<sha>.json`. All issue-comment URLs cited by the six source findings were fetched byte-exact with `--jq .body`; their author metadata comes from the corresponding full comment lists.

## Evidence interpretation limits

HTTP200 is not assumed to mean complete data: pagination totals, partial/failedReads and identity sets were inspected. Counts are scoped to searchable category/award populations, not `/api/status`’s raw database population. Null deployment/availability/feed data are not negative claims. Every original trigger has fresh successful results; transport-failed attempts remain in the receipt manifest. No feed simulation, owner write, production data mutation, or paid service call was performed.
