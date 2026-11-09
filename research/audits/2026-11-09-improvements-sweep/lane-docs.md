# Docs / canonical-source / workers-ai-provider author sweep

Observed 2026-11-09; report assembled 2026-11-09T20:37:58.076026+00:00. AUTHOR lane only. All 27 assigned findings were read; direct GitHub issue/PR bodies, comments, reviews, inline discussions and head checks are saved in `tmp/docs-gh.json`. Raw bodies were read with `gh api … --jq .`, without HTML rewriting. No GitHub comments or other writes, paid calls, agent launches, index generation, resolution or commits were made.

One retirement candidate: **sd-064**. The other 26 stay active. sd-081 has a previously recorded partial time-bounds fix, but its original parsing/runtime defects remain. No successor was created: dedupe shows existing active findings already own these residuals. Six previously declined findings retain their dispositions. cs-010 issue2809 remains open; its separate issue2790 is the closed/not_planned ref. sd-048 issue2010 is a stale-bot closure, with correction PR2059 still open.

| Finding | Ref state | Live trigger result | Verdict | Proposed action |
|---|---|---|---|---|
| cs-001 | [2296](https://github.com/cloudflare/agents/issues/2296) open | Fresh main search.ts executes all ten original cases: false matches score 27/55/45/27; four no-short-token controls return empty; intended queries score 153/481. Reverse short-token prefix rule remains line 68. | still-repro | Keep reported-upstream; no upstream reminder. |
| cs-004 | [36](https://github.com/circlefin/stellar-cctp/issues/36) open | Circle reference still lists both handle_receive_* handlers (lines 84–85); current interface source and a fresh deployed mainnet contract interface expose both handle_recv_* names instead. | still-repro | Keep reported-upstream; await correction of both rows. |
| cs-005 | [37](https://github.com/circlefin/stellar-cctp/issues/37) open | Both Stellar→Arc burn examples still label threshold 1000 Fast Transfer. Supported-chains says Stellar Fast=N/A; finality lists Stellar only under Standard. Original source-domain-27 Iris attestation still requested 1000 and executed 2000; fee API still lists both thresholds. | still-repro | Keep reported-upstream; correct both examples and parameter prose. |
| cs-006 | none | Published stellar.toml ORG_DESCRIPTION still names Paxos Trust Company LLC. Newsroom redirects to the current /blog/ URL and confirms the December 12, 2025 national-trust conversion. ORG_NAME remains the generic Paxos Trust Company. | still-repro | Keep verified; intake owner remains unclear, no speculative public filing. |
| cs-007 | [71](https://github.com/trionlabs/stellar-8004/issues/71) open | README line 17 still expands MPP as Managed Payment Protocol. Current registration UI line 85 says Machine Payments Protocol and mpp-client imports mppx. | still-repro | Keep reported-upstream; no duplicate or reminder. |
| cs-008 | [2056](https://github.com/stellar/stellar-protocol/issues/2056) closed/not_planned | Final CAP still says CONTRACT_EXECUTABLE_TOKEN at line 351; current XDR defines CONTRACT_EXECUTABLE_STELLAR_ASSET and has no TOKEN variant. Human owner leighmcculloch explicitly declined the significance of the correction. | declined | Retain declined-upstream and disposition; do not re-file. |
| cs-009 | [256](https://github.com/Inferara/soroban-security-portal/issues/256) open | Portal still has 66 reports and only OpenZeppelin IDs 35 (v0.3.0-rc.2) and 2 (0.1.0). Upstream audits folder still publishes eight PDFs through v0.8.0; Scout mirror still returns the same two reports. New third-party GangDev6707 comment requests assignment and discusses unrelated Redis work; it is neither owner acceptance nor a delivered fix. | still-repro | Keep reported-upstream; no response to the unrelated assignment request. |
| cs-010 | [2809](https://github.com/cloudflare/agents/issues/2809) open; [2790](https://github.com/cloudflare/agents/issues/2790) closed/not_planned; [2631](https://github.com/cloudflare/agents/issues/2631) open | Latest npm agents 0.33.0 mocked-binding repro drops Anthropic thinking/effort for catalog strings; native Anthropic model preserves both but changes transport. Resume control check still makes one inference and one resume request, with zero external network calls. Main source still forces chat-completions. Issue 2809 is OPEN: only the separate resume/no-gateway issue 2790 is closed not_planned by github-actions[bot]. | still-repro | Keep provider-options defect reported-upstream; preserve the separate declined resume decision. |
| sd-004 | [2567](https://github.com/stellar/stellar-docs/issues/2567) closed/completed; [2572](https://github.com/stellar/stellar-docs/pull/2572) merged | Pagination still calls upper limits hardcoded; current RPC source at its relocated rpcv1/config/options.go exposes all three max/default settings. ElliotFriend relayed Shaptic’s explicit operational-policy decision to retain the wording. | declined | Retain declined-upstream; supported stock limits and source configurability remain distinct. |
| sd-005 | [2565](https://github.com/stellar/stellar-docs/issues/2565) open | Both agentic-payments overview and x402 page still attribute the protocol to Coinbase Developer Platform. AP2/ACP positioning remains absent on those pages and optional by the accepted maintainer scope decision. | still-repro | Keep the existing narrow attribution request; do not reopen the optional comparison ask. |
| sd-009 | [2575](https://github.com/stellar/stellar-docs/issues/2575) closed/not_planned | Live Anchors guidance still omits deprecated wording; canonical SEP-6 still explicitly marks its interactive components deprecated in favor of SEP-24. Programmatic SEP-6 remains Active. | declined | Retain declined-upstream and accepted placement/noise decision. |
| sd-014 | [2611](https://github.com/stellar/stellar-docs/issues/2611) open | Fresh Discovery transaction inclusion proof query returns 48 adjacent sections, headed by lifecycle/simulation material, without a joined proof guide. Fresh GitHub code searches for inclusion proof and proof of inclusion return zero results (incomplete_results=false). Live Ledgers page explains scpValue.txSetHash but does not provide the joined verification recipe. | still-repro | Keep open enhancement; no reminder on untouched issue. |
| sd-035 | [2609](https://github.com/stellar/stellar-docs/issues/2609) open; [2659](https://github.com/stellar/stellar-docs/pull/2659) merged | Tutorial still pins the dotted npm package to @^1 and explicitly teaches new StellarWalletsKit(...). Maintained Kit README uses static StellarWalletsKit.init with defaultModules(). The deployed stopgap is not the durable joint tutorial/BasicPay v2 migration. | still-repro | Keep the existing narrowed v2-migration finding; no successor duplicates this residual. |
| sd-048 | [2010](https://github.com/stellar/stellar-protocol/issues/2010) closed/not_planned; [2059](https://github.com/stellar/stellar-protocol/pull/2059) open | CAP-0075 line 78 still lists degrees 3,5,7,11; lines 124/157 and current host SUPPORTED_SBOX_DEGREES=[5] accept only 5. Issue 2010 was closed not_planned by github-actions[bot], not declined by a human. Correction PR2059 remains OPEN, BEHIND but MERGEABLE, REVIEW_REQUIRED, all five head checks successful, no reviews/comments. | closed-unfixed | Keep reported-upstream; do not treat stale closure as decline. Author PR awaits review; updating behind branch is optional, not a failing-check repair. |
| sd-050 | [2561](https://github.com/stellar/stellar-docs/issues/2561) open | Live Client SDKs page line 25 names unscoped stellar-sdk while linking scoped package. Registry still serves deprecated unscoped 13.3.0 versus scoped 17.4.0. | still-repro | Keep report attached to oceans404’s existing issue 2561; no duplicate. |
| sd-059 | [2995](https://github.com/stellar/stellar-docs/issues/2995) open | Seven original bare/verbatim Discovery queries all HTTP200 with 38/50/50/46/50/48/47 raw candidates; expected result-code leaf page absent for 7/7 before Raven filtering. Site MCP op_bad_signer returns Set Options Result Codes first, including ResponseField mapping. | still-repro | Keep Discovery ranking report; no docs-content rewrite. Await Mintlify-contact decision on issue2995. Most recent decision request is from stellar-triage-bot[bot], not a human maintainer. |
| sd-061 | [2752](https://github.com/stellar/stellar-docs/pull/2752) open; [2998](https://github.com/stellar/stellar-docs/issues/2998) open | Claimable-balances line359 still says getLedgerEntries obtains Balance ID; immediately following code requires BALANCE_ID. Earlier creation code derives it with getClaimableBalanceId(0); migration table says known ID only and no listing equivalent. PR2752 remains draft, DIRTY/CONFLICTING, REVIEW_REQUIRED; 15 unresolved threads, nine current. | still-repro | Keep reported-upstream. Maintainer/PR author must resolve draft conflicts/threads or take the isolated sentence fix. Raven does not own that PR. |
| sd-064 | [2945](https://github.com/stellar/stellar-docs/pull/2945) merged | Original kalepail URL, its trailing slash, authors root and elliotfriend all now HTTP308 → /meetings → HTTP200. PR2945 merged 2026-11-09T17:05:10Z at 88c539971e605d01e5f1ee7f71efd1669ca1db5e; all eight head checks successful and kaankacar approved. Redirect to the meetings index meets the recorded smallest fix; author-specific rosters were not restored. | fixed | Mark fixed-upstream; distinct retirement reviewer must independently rerun and reconcile references before deletion. |
| sd-070 | [2763](https://github.com/stellar/stellar-docs/pull/2763) open | Migration guide still says added Option field traps UnexpectedSize with no SDK28/CAP86 qualifier. SDK v28 release notes expressly permit missing Option fields as None and ignore extra fields; CAP86 remains Protocol28. Draft2763 remains unchanged since August18, BLOCKED/REVIEW_REQUIRED; historical checks successful. | still-repro | Keep reported-upstream; wait for draft update, merge and deployment. |
| sd-074 | [2708](https://github.com/stellar/stellar-docs/pull/2708) open | Both Scaffold overview (three references) and Hello World frontend still name environments.toml; current CLI config source names scaffold.yml and explicitly recognizes environments.toml as deprecated. PR2708 is mergeable but BLOCKED/REVIEW_REQUIRED; checks green except fork preview NEUTRAL awaiting approval. | still-repro | Keep reported-upstream; maintainer review/preview approval required on external-author PR. |
| sd-077 | none | Funding index still requires a live product, while dedicated marketing-grants page’s Traction data asks whether project is live or preparing to launch soon. Dedicated prose still accepts clear use cases/concrete timelines. Both HTTP200. | still-repro | Keep verified; resolve policy with identified site owner before any filing. |
| sd-081 | [2562](https://github.com/stellar/stellar-docs/issues/2562) open; [2977](https://github.com/stellar/stellar-docs/pull/2977) merged | Known partial fix in merged PR2977 persists: both copies setTimeout(30). Both live contract-restoration fences still fail TypeScript parsing TS1131/TS1128 at the empty return type; both still pass instance LedgerKey as entry and response as footprint key. Combined polling/data-restoration fences with SDK17.4.0 reproduce TS2440 Api redeclaration. | still-repro | Keep active: unchanged core trigger still reproduces. No retirement/successor is warranted for this already-recorded partial time-bounds fix; the existing finding self-containedly owns every residual. |
| sd-096 | [3028](https://github.com/stellar/stellar-docs/issues/3028) closed/completed | All three invented source paths still HTTP308 to the same missing destinations, final404. Explicit human decline by ElliotFriend remains: pages never existed; reconsider only on real traffic/inbound-link evidence. No such new evidence found in this sweep. | declined | Retain declined-upstream; do not add redirects or re-file. |
| sd-100 | [3078](https://github.com/stellar/stellar-docs/issues/3078) open | Light check: live USDT0 page still contains both 5–7 seconds and 5–7s estimates; linked Stellar Stack says about every5seconds. Issue3078 has new bot-authored PR3080, OPEN/BLOCKED/REVIEW_REQUIRED, eight successful head checks, no reviews. | still-repro | Keep reported-upstream; append PR3080 ref. Recheck both repetitions only after merge/deploy. |
| sd-101 | [3079](https://github.com/stellar/stellar-docs/issues/3079) open; [3067](https://github.com/stellar/stellar-docs/pull/3067) merged | Light check: live check-auth tutorial SHA256 remains 5a55dbfd9a912c4bddfbcb5a9426aeb3bb270012f3b9383a3af347aa165158c5, identical to today’s independently compiled original. Missing definitions and base64_url calls remain. New bot-authored PR3081 is OPEN/BLOCKED/REVIEW_REQUIRED, eight successful head checks, no reviews; author explicitly did not compile with cargo. | still-repro | Keep reported-upstream; append PR3081 ref. No redundant compile today; next gate is full supplied-contract compile after merge/deploy. |
| sd-102 | [2899](https://github.com/stellar/stellar-docs/pull/2899) merged | Live configuring page includes ordinary fresh database/backfill behavior and intentionally omits gap error. Fresh v30.0.0 backfill source calls verifyDbGapless, accepts empty DB and errors on gaps; daemon treats backfill failure as fatal. Shaptic’s inline scope decline and approval directly verified. | declined | Retain declined-upstream; intentional omission is not an unmerged-fix failure. |
| wai-001 | [634](https://github.com/cloudflare/ai/issues/634) closed/not_planned; [639](https://github.com/cloudflare/ai/pull/639) closed | Fresh npm latest4.0.1 remains deprecated. Latest package mock reproduction still throws Unknown gateway provider moonshotai before binding.run (zero calls). PR639 remains closed/unmerged; mattzcarey explicitly feature-froze package. Issue634 closure was Raven’s own acknowledgement, not an independent maintainer fix. | declined | Retain declined-upstream and migration disposition; do not re-file frozen-package feature request. |

## Reproduction contract

HTTP reads: `python3 tmp/docs-live-fetch.py` performs unauthenticated GETs and stores exact bodies, timestamps, URLs, HTTP codes, final URLs and SHA256 in `tmp/docs-live/receipt.json`. Python’s redirect handling did not follow these HTTP308 responses, so every 308 was explicitly rechecked with `curl -sS -L --max-time 40 -D <headers> -o <body> -w "%{http_code}\n%{url_effective}" <URL>` via `python3 tmp/docs-redirects.py`; redirect header files preserve each hop. Those final curl results take precedence. The initial sd014 singular ledger URL was a wrong 404 path; the correct plural path was fetched separately. RPC source moved to rpcv1/config; the old main path’s 404 is not a defect.

GitHub reads: `python3 tmp/docs-gh-fetch.py` and `python3 tmp/docs-more-gh.py`; each ref uses `gh api repos/<owner>/<repo>/issues/<n> --jq .` and `/comments?per_page=100`; PRs additionally use `/pulls/<n>`, `/reviews`, inline `/comments`, and `/commits/<head>/check-runs`. Supplementary `gh pr view --json reviewDecision,mergeStateStatus,mergeable,reviewRequests,updatedAt --jq .` and GraphQL reviewThreads are recorded in `tmp/docs-pr-state.json`. All relevant comment author names are listed below. A bot’s confirmation is explicitly bot-authored.

Package probes: `node tmp/docs-repros.mjs` executes freshly downloaded current search.ts and parses both deployed restoration snippets via TypeScript7.0.2 CLI. Output: `tmp/docs-repros.json`. Isolated copy of the original createAI repro was installed under `tmp/docs-createai`; `npm install --ignore-scripts --no-save agents@0.33.0 workers-ai-provider@4.0.1 @stellar/stellar-sdk@17.4.0`, then `npm run repro` and `node wai.mjs` from that directory. Results: `tmp/docs-createai/latest-run.log` and `wai-run.json`. External fetch is replaced with a throwing mock in createAI reproduction; reported networkCalls=0. Root-installed workers-ai-provider4.0.0 also reproduces, but the latest4.0.1 result is the relevant evidence.

Search probes: `node tmp/docs-search.mjs` loads the assistant key through the repository .env parser without outputting it. Only read-only POST search endpoints are used. Discovery endpoint `https://api.mintlify.com/discovery/v1/search/stellardevelopmentfoundation`, body `{query,pageSize:50}`. Site MCP endpoint `https://developers.stellar.org/mcp`, JSON-RPC tools/call `search_stellar_developer_docs({query:"op_bad_signer"})`. Full results/timestamps: `tmp/docs-search.json`.

## cs-001 — still-repro

Fresh main search.ts executes all ten original cases: false matches score 27/55/45/27; four no-short-token controls return empty; intended queries score 153/481. Reverse short-token prefix rule remains line 68.

Action: Keep reported-upstream; no upstream reminder.

- Direct GitHub read 2026-11-09T20:30:04.983026+00:00: https://github.com/cloudflare/agents/issues/2296; author `kalepail`; state `open`, reason `None`, updated `2026-09-17T03:43:47Z`.
  No issue/PR conversation comments.
- GET https://raw.githubusercontent.com/cloudflare/agents/main/packages/codemode/src/connectors/search.ts at `2026-11-09T20:31:17.085207+00:00` → HTTP200; SHA256 `15ef317d630b3df60e6cc48bb879d835d2a4e968214f0b4096265504364981e0`; body `tmp/docs-live/cs001.txt`.

## cs-004 — still-repro

Circle reference still lists both handle_receive_* handlers (lines 84–85); current interface source and a fresh deployed mainnet contract interface expose both handle_recv_* names instead.

Action: Keep reported-upstream; await correction of both rows.

- Direct GitHub read 2026-11-09T20:30:04.981777+00:00: https://github.com/circlefin/stellar-cctp/issues/36; author `kalepail`; state `open`, reason `None`, updated `2026-11-02T20:24:55Z`.
  No issue/PR conversation comments.
- GET https://developers.circle.com/cctp/references/stellar-contracts.md at `2026-11-09T20:31:17.085514+00:00` → HTTP200; SHA256 `a229e452a62430dfae07d176274954b05720d7878f63b41d1da4e978613ecf0e`; body `tmp/docs-live/cs004.txt`.
- GET https://raw.githubusercontent.com/circlefin/stellar-cctp/master/packages/cctp-interfaces/src/message_handler.rs at `2026-11-09T20:31:17.085627+00:00` → HTTP200; SHA256 `bc2509ddf990951132e20d4bb79758b30302bf8894a5da39def44ef0d1438602`; body `tmp/docs-live/cs004-source.txt`.
- Fresh read-only command: `stellar contract info interface --contract-id CAE2G5Z77UP7GYPYGFOWFGW7C7J6I4YP2AFGSADRKQY62SYUFLPNFTXL --rpc-url https://mainnet.sorobanrpc.com --network-passphrase "Public Global Stellar Network ; September 2015"`; exit0, both `handle_recv_*` functions at lines148/160 of `tmp/docs-cctp-interface.txt`. No `handle_receive_*` function.

## cs-005 — still-repro

Both Stellar→Arc burn examples still label threshold 1000 Fast Transfer. Supported-chains says Stellar Fast=N/A; finality lists Stellar only under Standard. Original source-domain-27 Iris attestation still requested 1000 and executed 2000; fee API still lists both thresholds.

Action: Keep reported-upstream; correct both examples and parameter prose.

- Direct GitHub read 2026-11-09T20:30:04.981855+00:00: https://github.com/circlefin/stellar-cctp/issues/37; author `kalepail`; state `open`, reason `None`, updated `2026-11-02T20:24:58Z`.
  No issue/PR conversation comments.
- GET https://developers.circle.com/cctp/quickstarts/transfer-usdc-stellar-arc.md at `2026-11-09T20:31:17.085716+00:00` → HTTP200; SHA256 `b95f536741d384fbee659bd05866b321bc0d448363ba54ecf28ca8258d3feab4`; body `tmp/docs-live/cs005.txt`.
- GET https://developers.circle.com/cctp/concepts/supported-chains-and-domains.md at `2026-11-09T20:31:17.085797+00:00` → HTTP200; SHA256 `d636b46468bc715aaff071c604a5954571d4a5ec9078c2d4e7777885ec298f12`; body `tmp/docs-live/cs005-chains.txt`.
- GET https://developers.circle.com/cctp/concepts/finality-and-block-confirmations.md at `2026-11-09T20:31:17.085866+00:00` → HTTP200; SHA256 `c0bd2f8e340af0de780566557b59633e620cfa9a54adeb224e31f7866a939436`; body `tmp/docs-live/cs005-finality.txt`.
- GET https://iris-api.circle.com/v2/burn/USDC/fees/27/0 at `2026-11-09T20:31:17.085938+00:00` → HTTP200; SHA256 `716ba72a2de2c07a4681c4b20b788da080a38c0ab5df06193ef95b6a3255b07d`; body `tmp/docs-live/cs005-fees.txt`.
- GET https://iris-api.circle.com/v2/messages/27?transactionHash=649b62ed6fc2d566d8ce3d5e89a2ecef27d932e228d2892bef60bce43fb0bd27 at `2026-11-09T20:31:17.086051+00:00` → HTTP200; SHA256 `06dccdf7e0afc51c98bbc58953bb3a33d5a2305365b2892bfb0ce96d84a735b7`; body `tmp/docs-live/cs005-message.txt`.

## cs-006 — still-repro

Published stellar.toml ORG_DESCRIPTION still names Paxos Trust Company LLC. Newsroom redirects to the current /blog/ URL and confirms the December 12, 2025 national-trust conversion. ORG_NAME remains the generic Paxos Trust Company.

Action: Keep verified; intake owner remains unclear, no speculative public filing.

- GET https://token-metadata.paxos.com/.well-known/stellar.toml at `2026-11-09T20:31:17.086128+00:00` → HTTP200; SHA256 `3d6c7cca351d208e4cb026185e071229db9432d5d7b658b9d9af28a8ebf4cc94`; body `tmp/docs-live/cs006.txt`.
- GET https://www.paxos.com/newsroom/occ-approves-paxos-application-to-convert-to-occ-trust-paxos-to-complete-conversion-imminently-to-become-a-federally-regulated-blockchain-infrastructure-provider at `2026-11-09T20:31:17.086203+00:00` → HTTP308; SHA256 `d3d4f23358e97b6866b98153c15910344ca12ee4480e6a5b2cb11db0652a7a8a`; body `tmp/docs-live/cs006-news.txt`. Redirect recheck `2026-11-09T20:32:01.859826+00:00`: 200 → https://www.paxos.com/blog/occ-approves-paxos-application-to-convert-to-occ-trust-paxos-to-complete-conversion-imminently-to-become-a-federally-regulated-blockchain-infrastructure-provider; all hops in `tmp/docs-live/cs006-news.headers`.

## cs-007 — still-repro

README line 17 still expands MPP as Managed Payment Protocol. Current registration UI line 85 says Machine Payments Protocol and mpp-client imports mppx.

Action: Keep reported-upstream; no duplicate or reminder.

- Direct GitHub read 2026-11-09T20:30:13.004939+00:00: https://github.com/trionlabs/stellar-8004/issues/71; author `kalepail`; state `open`, reason `None`, updated `2026-11-06T01:48:40Z`.
  No issue/PR conversation comments.
- GET https://raw.githubusercontent.com/trionlabs/stellar-8004/main/README.md at `2026-11-09T20:31:17.280986+00:00` → HTTP200; SHA256 `3cd49ef58555af0c1b73f6b7a46891771eab17cc2d0f25adc401d493d8fef1b7`; body `tmp/docs-live/cs007.txt`.
- GET https://raw.githubusercontent.com/trionlabs/stellar-8004/main/webapp/apps/web/src/lib/components/register/StepAdvanced.svelte at `2026-11-09T20:31:17.286341+00:00` → HTTP200; SHA256 `41187c1f87913bdb45435b99958503bfb6368a7d4ad5afdf16c022c444194552`; body `tmp/docs-live/cs007-ui.txt`.
- GET https://raw.githubusercontent.com/trionlabs/stellar-8004/main/webapp/apps/web/src/lib/mpp-client.ts at `2026-11-09T20:31:17.294335+00:00` → HTTP200; SHA256 `d0632844c4d837e6ace6e92eee9bf334754430306c9db9a72a57e6ffb2874b18`; body `tmp/docs-live/cs007-client.txt`.

## cs-008 — declined

Final CAP still says CONTRACT_EXECUTABLE_TOKEN at line 351; current XDR defines CONTRACT_EXECUTABLE_STELLAR_ASSET and has no TOKEN variant. Human owner leighmcculloch explicitly declined the significance of the correction.

Action: Retain declined-upstream and disposition; do not re-file.

- Direct GitHub read 2026-11-09T20:30:12.278462+00:00: https://github.com/stellar/stellar-protocol/issues/2056; author `kalepail`; state `closed`, reason `not_planned`, updated `2026-11-03T02:24:44Z`.
  Latest comment by `leighmcculloch` at `2026-11-03T02:24:44Z`: https://github.com/stellar/stellar-protocol/issues/2056#issuecomment-6593819856. This doesn't seem significant to fix.
- GET https://raw.githubusercontent.com/stellar/stellar-protocol/master/core/cap-0046-06.md at `2026-11-09T20:31:17.300482+00:00` → HTTP200; SHA256 `7b6b7f1ea21e9a1f2dd52caf891f2d0c3847a51a1f08f1f743b0f42a81923b4a`; body `tmp/docs-live/cs008.txt`.
- GET https://raw.githubusercontent.com/stellar/stellar-xdr/curr/Stellar-contract.x at `2026-11-09T20:31:17.305963+00:00` → HTTP200; SHA256 `e92d679eb8682b59ad0262422ddca3a43ad5498702ae2e90210bc1f5cead7a8c`; body `tmp/docs-live/cs008-xdr.txt`.

## cs-009 — still-repro

Portal still has 66 reports and only OpenZeppelin IDs 35 (v0.3.0-rc.2) and 2 (0.1.0). Upstream audits folder still publishes eight PDFs through v0.8.0; Scout mirror still returns the same two reports. New third-party GangDev6707 comment requests assignment and discusses unrelated Redis work; it is neither owner acceptance nor a delivered fix.

Action: Keep reported-upstream; no response to the unrelated assignment request.

- Direct GitHub read 2026-11-09T20:30:04.981586+00:00: https://github.com/Inferara/soroban-security-portal/issues/256; author `kalepail`; state `open`, reason `None`, updated `2026-11-08T01:07:50Z`.
  Latest comment by `maxx-GENIUS` at `2026-11-03T00:08:12Z`: https://github.com/Inferara/soroban-security-portal/issues/256#issuecomment-6591764355. Hey @Inferara team, I reviewed the issue for **Portal lists 2 of 8 published OpenZeppelin Stellar Contracts audits; v0.2.0 and v0.5.0 to v0.8.0 are missing**. Redis operations or stream consumer pipelines need robust handling around timeouts, atomic ttl expiration, and consumer group pel retention. **Proposed Implementation:** 1. Audit the Redis transaction or pipeline operations to guarantee atomic key creation and 
  Latest comment by `GangDev6707` at `2026-11-08T01:07:50Z`: https://github.com/Inferara/soroban-security-portal/issues/256#issuecomment-6715429390. Hi maintainers, I'd like to help resolve this issue. Redis operations or stream consumer pipelines need robust handling around timeouts, atomic ttl expiration, and consumer group pel retention. I plan to audit the redis transaction or pipeline operations to guarantee atomic key creation and ttl assignment and ensure consumer group acknowledgment and stream retention parameters prevent unexpected data loss, followed b
- GET https://stellarsecurityportal.com/api/v1/reports at `2026-11-09T20:31:17.310129+00:00` → HTTP200; SHA256 `8c99522f33eb3ceceda127637d3a45f2d80913336cb5ed555d4902e9cf1fc40b`; body `tmp/docs-live/cs009.txt`.
- GET https://stellarlight.xyz/api/audits?auditor=OpenZeppelin at `2026-11-09T20:31:17.315240+00:00` → HTTP200; SHA256 `123c881f722f344ea1837c09b7bcd7eafe93548685edca371545ead36a9ca20a`; body `tmp/docs-live/cs009-scout.txt`.
- `gh api repos/OpenZeppelin/stellar-contracts/contents/audits --jq .` returns eight PDFs: 0.1.0-RC, v0.2.0, v0.3.0-rc.2, v0.5.0, v0.5.0 Re-Audit, v0.6.0, v0.7.0, v0.8.0. Latest release v0.8.0. Direct evidence: `tmp/docs-more-gh.json`. All three assignment comments are third-party contributors; none is a maintainer delivery claim.

## cs-010 — still-repro

Latest npm agents 0.33.0 mocked-binding repro drops Anthropic thinking/effort for catalog strings; native Anthropic model preserves both but changes transport. Resume control check still makes one inference and one resume request, with zero external network calls. Main source still forces chat-completions. Issue 2809 is OPEN: only the separate resume/no-gateway issue 2790 is closed not_planned by github-actions[bot].

Action: Keep provider-options defect reported-upstream; preserve the separate declined resume decision.

- Direct GitHub read 2026-11-09T20:30:04.983306+00:00: https://github.com/cloudflare/agents/issues/2631; author `mattzcarey`; state `open`, reason `None`, updated `2026-10-20T15:57:18Z`.
  No issue/PR conversation comments.
- Direct GitHub read 2026-11-09T20:30:04.984881+00:00: https://github.com/cloudflare/agents/issues/2790; author `MRCORD`; state `closed`, reason `not_planned`, updated `2026-11-03T15:50:21Z`.
  Latest comment by `github-actions[bot]` at `2026-11-03T15:50:21Z`: https://github.com/cloudflare/agents/issues/2790#issuecomment-6608454994. Thanks for the detailed report. I triaged it and I'm closing it as not planned. **Why:** `createAI` routes every call through an AI Gateway by design (`packages/agents/src/models/core/settings.ts`, `resolveOptions` defaults `id` to `"default"`). A no-gateway mode or a stream-resume opt-out would add API surface that few users need. Callers who want the plain Workers AI path can still call `binding.run` directly, and 
- Direct GitHub read 2026-11-09T20:30:05.768603+00:00: https://github.com/cloudflare/agents/issues/2809; author `kalepail`; state `open`, reason `None`, updated `2026-11-03T15:40:19Z`.
  Latest comment by `github-actions[bot]` at `2026-11-03T15:40:19Z`: https://github.com/cloudflare/agents/issues/2809#issuecomment-6608148922. Thanks for the detailed report. I triaged it and confirmed the behavior on main. **Cause:** `packages/agents/src/models/ai-sdk/models/language.ts:428` always sends `format: "chat-completions"`. `buildRequest` (line 145) passes only `reasoningEffort` and `chatTemplateKwargs`, so `providerOptions.anthropic` is dropped without a warning. **Recommended fix:** Send `anthropic/*` catalog IDs in the Messages format, which t
- GET https://raw.githubusercontent.com/cloudflare/agents/main/packages/agents/src/models/ai-sdk/models/language.ts at `2026-11-09T20:31:17.318446+00:00` → HTTP200; SHA256 `d9e223d3361c85f7779f35027f64b627a14aa175c42aa629ca54eec6506a4af8`; body `tmp/docs-live/cs010-language.txt`.
- GET https://raw.githubusercontent.com/cloudflare/agents/main/packages/agents/src/models/core/transport.ts at `2026-11-09T20:31:17.397512+00:00` → HTTP200; SHA256 `dc22244bc2b7808a1fea9510c4c2ede9d9fd9acdcc46c8118b8c17e5ebf1d6c7`; body `tmp/docs-live/cs010-transport.txt`.
- GET https://registry.npmjs.org/agents/latest at `2026-11-09T20:31:18.664038+00:00` → HTTP200; SHA256 `ce8aea844a38aeea9f5335b7a150133ef7608d59337f54520b81bd10b1f8d04f`; body `tmp/docs-live/cs010-npm.txt`.

## sd-004 — declined

Pagination still calls upper limits hardcoded; current RPC source at its relocated rpcv1/config/options.go exposes all three max/default settings. ElliotFriend relayed Shaptic’s explicit operational-policy decision to retain the wording.

Action: Retain declined-upstream; supported stock limits and source configurability remain distinct.

- Direct GitHub read 2026-11-09T20:30:06.624377+00:00: https://github.com/stellar/stellar-docs/issues/2567; author `kalepail`; state `closed`, reason `completed`, updated `2026-07-14T22:22:11Z`.
  Latest comment by `ElliotFriend` at `2026-07-13T14:17:57Z`: https://github.com/stellar/stellar-docs/issues/2567#issuecomment-4958935363. i spoke with @Shaptic to confirm this issue. the guidance is currently that these _technically_ configurable limits, aren't actually configured in practice by anyone (and they shouldn't be). and, future updates may tighten the limits even more. drawing attention to the configurable settings will likely be counter-productive.
- Direct GitHub read 2026-11-09T20:30:07.789614+00:00: https://github.com/stellar/stellar-docs/pull/2572; author `kalepail`; state `closed`, reason `None`, updated `2026-07-10T13:47:01Z`; merged `True` at `2026-07-10T13:46:59Z`; head `fb4e8ecbb50218b52313c434a9d0d4e8571fdb3a`, merge state `unknown`.
  Latest comment by `ElliotFriend` at `2026-07-10T13:39:34Z`: https://github.com/stellar/stellar-docs/pull/2572#issuecomment-4935924361. heard back from someone who knows better, and it's more like a "_technically_ it's configurable, but you really shouldn't" situation. i've reverted my changes and i'll merge when the preview is done.
  Latest comment by `stellar-jenkins-ci[bot]` at `2026-07-10T13:46:06Z`: https://github.com/stellar/stellar-docs/pull/2572#issuecomment-4935986186. **Preview is available here:**<br>http://developers-pr2572.previews.kube001.services.stellar-ops.com
  Head checks: complete=success, CodeQL=success, Socket Security: Pull Request Alerts=success, Socket Security: Project Report=success, build / build=success, mdx-format=success, Analyze (actions)=success, Analyze (javascript-typescript)=success. Reviews: copilot-pull-request-reviewer[bot]=COMMENTED, ElliotFriend=APPROVED.
- GET https://developers.stellar.org/docs/data/apis/rpc/api-reference/structure/pagination.md at `2026-11-09T20:31:17.440599+00:00` → HTTP200; SHA256 `aa81fdb4729008c57e0f5ac8b38d64bccb2303d402ffa6cab8250667597a3b8e`; body `tmp/docs-live/sd004.txt`.
- Adjacent implementation: `curl -fsSL https://raw.githubusercontent.com/stellar/stellar-rpc/main/cmd/stellar-rpc/internal/rpcv1/config/options.go -o tmp/docs-live/sd004-current.txt`; HTTP200, exposes max/default events, transactions and ledgers settings. Tagged v30.0.0 old path also HTTP200 (`sd004-source2.txt`).

## sd-005 — still-repro

Both agentic-payments overview and x402 page still attribute the protocol to Coinbase Developer Platform. AP2/ACP positioning remains absent on those pages and optional by the accepted maintainer scope decision.

Action: Keep the existing narrow attribution request; do not reopen the optional comparison ask.

- Direct GitHub read 2026-11-09T20:30:05.953993+00:00: https://github.com/stellar/stellar-docs/issues/2565; author `kalepail`; state `open`, reason `None`, updated `2026-07-27T13:31:58Z`.
  Latest comment by `ElliotFriend` at `2026-07-21T15:11:41Z`: https://github.com/stellar/stellar-docs/issues/2565#issuecomment-5035735424. Triage note from the Raven audit pass: this reads as a valid **enhancement / scoping** request rather than a docs defect — nothing currently on `main` is factually wrong. There's a genuine gap (no AP2 / Agentic-Commerce positioning in `docs/`), but whether our reference docs should position against fast-moving third-party protocols is a DevRel content decision that carries drift risk. One small correctable inaccuracy
  Latest comment by `kalepail` at `2026-07-27T13:31:58Z`: https://github.com/stellar/stellar-docs/issues/2565#issuecomment-5091973988. Agreed on the scoping call. The landscape-positioning ask is an enhancement, not a docs defect, and the drift-risk argument against positioning our reference docs against fast-moving third-party protocols is a fair one. Happy for that half to wait on a DevRel decision — or to be closed as out of scope if that's the call. Please do take the x402 attribution fix. That one is a plain factual correction (x402 Foundation 
- GET https://developers.stellar.org/docs/build/agentic-payments.md at `2026-11-09T20:31:17.462376+00:00` → HTTP200; SHA256 `adac474d8e6cfb6a89bde6e8294ae430d04d11d16a59efd96961f5ae658900e5`; body `tmp/docs-live/sd005.txt`.
- GET https://developers.stellar.org/docs/build/agentic-payments/x402.md at `2026-11-09T20:31:17.484570+00:00` → HTTP200; SHA256 `5c20ccf5ebc7a807218a781e1b57425c23da6b0813cde84dbf0f6fca9f839d92`; body `tmp/docs-live/sd005-x402.txt`.

## sd-009 — declined

Live Anchors guidance still omits deprecated wording; canonical SEP-6 still explicitly marks its interactive components deprecated in favor of SEP-24. Programmatic SEP-6 remains Active.

Action: Retain declined-upstream and accepted placement/noise decision.

- Direct GitHub read 2026-11-09T20:30:06.624507+00:00: https://github.com/stellar/stellar-docs/issues/2575; author `kalepail`; state `closed`, reason `not_planned`, updated `2026-07-14T22:22:13Z`.
  Latest comment by `ElliotFriend` at `2026-07-13T21:19:08Z`: https://github.com/stellar/stellar-docs/issues/2575#issuecomment-4962781289. This feels unnecessary, tbh. the deprecation happened over 6 years ago. introducing the line into the docs would only make people aware of something that _used to exist_ but no longer does. i also don't think the interactive components that were part of SEP-6 are ever documented in our docs site. i think it would just read as noise to see a deprecation notice in this context.
  Latest comment by `kalepail` at `2026-07-14T18:54:55Z`: https://github.com/stellar/stellar-docs/issues/2575#issuecomment-4972837763. Thanks, Elliot — agreed this historical interactive-component deprecation does not belong in this Docs context. Closing as not planned.
- GET https://developers.stellar.org/docs/learn/fundamentals/anchors.md at `2026-11-09T20:31:17.500530+00:00` → HTTP200; SHA256 `a4f6584eb8818dc3d0e38d036fbfdf8ca280aa1d7931b158fb74eed403573e2a`; body `tmp/docs-live/sd009.txt`.
- GET https://raw.githubusercontent.com/stellar/stellar-protocol/master/ecosystem/sep-0006.md at `2026-11-09T20:31:17.524464+00:00` → HTTP200; SHA256 `2c93236eb8f8b72390c9fdf08c9db374367955fd0e17cf801c15f9b21c31c8e3`; body `tmp/docs-live/sd009-source.txt`.

## sd-014 — still-repro

Fresh Discovery transaction inclusion proof query returns 48 adjacent sections, headed by lifecycle/simulation material, without a joined proof guide. Fresh GitHub code searches for inclusion proof and proof of inclusion return zero results (incomplete_results=false). Live Ledgers page explains scpValue.txSetHash but does not provide the joined verification recipe.

Action: Keep open enhancement; no reminder on untouched issue.

- Direct GitHub read 2026-11-09T20:30:06.727282+00:00: https://github.com/stellar/stellar-docs/issues/2611; author `kalepail`; state `open`, reason `None`, updated `2026-07-21T15:11:52Z`.
  Latest comment by `ElliotFriend` at `2026-07-21T15:11:51Z`: https://github.com/stellar/stellar-docs/issues/2611#issuecomment-5035737315. Valid enhancement, but an essay-sized one rather than a bug — nothing on `main` is wrong. The premise is technically correct: no page joins the `txSetHash` / `txSetResultHash` / bucketList commitments, and there is no compact per-transaction Merkle branch on Stellar. Writing this well needs an author plus stellar-core review; a partially-correct inclusion-verification guide is worse than none. Leaving open as a multi
- GET https://developers.stellar.org/docs/learn/fundamentals/ledger.md at `2026-11-09T20:31:17.552924+00:00` → HTTP404; SHA256 `128833767dab103f89c2baa1196ea470bf52541fce6eb7cbfbe698a39390fa34`; body `tmp/docs-live/sd014.txt`.
- `gh api search/code -X GET -f 'q="inclusion proof" repo:stellar/stellar-docs' --jq .` and the same with `"proof of inclusion"`: both total_count0, incomplete_results=false at 20:34:24–25Z; saved `tmp/docs-more-gh.json`. This is corroborating phrase-search evidence, not proof that every possible synonymous guide is absent. Discovery and explicit maintainer scope comment independently support retaining the enhancement.
- Adjacent direct page: `curl -fsSL https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/ledgers.md -o tmp/docs-live/sd014-ledgers.txt`; HTTP200; scpValue.txSetHash component explanation without the requested joined procedure.

## sd-035 — still-repro

Tutorial still pins the dotted npm package to @^1 and explicitly teaches new StellarWalletsKit(...). Maintained Kit README uses static StellarWalletsKit.init with defaultModules(). The deployed stopgap is not the durable joint tutorial/BasicPay v2 migration.

Action: Keep the existing narrowed v2-migration finding; no successor duplicates this residual.

- Direct GitHub read 2026-11-09T20:30:06.709237+00:00: https://github.com/stellar/stellar-docs/issues/2609; author `kalepail`; state `open`, reason `None`, updated `2026-08-04T15:47:10Z`.
  Latest comment by `ElliotFriend` at `2026-07-21T15:11:05Z`: https://github.com/stellar/stellar-docs/issues/2609#issuecomment-5035729421. Shipped a docs-side stopgap in #2659: pinned the tutorial's Wallets Kit install to `@^1` so it stops breaking against the v1 companion app. Keeping this open for the durable fix — migrating both this tutorial and [`stellar/basic-payment-app`](https://github.com/stellar/basic-payment-app) to the Kit v2 API (`StellarWalletsKit.init` / `defaultModules`) in lockstep, which is the cross-repo work. One correction for the r
  Latest comment by `kalepail` at `2026-07-27T13:32:13Z`: https://github.com/stellar/stellar-docs/issues/2609#issuecomment-5091976739. You're right, and our issue was wrong on that point. We re-checked the npm registry: `@creit.tech/stellar-wallets-kit` has dist-tag `latest` = `2.5.0` (published 2026-06-29), so the dotted npm scope is emphatically not v1-only and "legacy scope" was the wrong diagnosis. The actual defect is the one you identified — an unpinned install resolving to v2 against tutorial code written for the v1 constructor API. We've cor
- Direct GitHub read 2026-11-09T20:30:08.372865+00:00: https://github.com/stellar/stellar-docs/pull/2659; author `ElliotFriend`; state `closed`, reason `None`, updated `2026-07-21T15:47:16Z`; merged `True` at `2026-07-21T15:47:15Z`; head `94427abbfdf6ce74c1d12252f09e1c4ca761e3b5`, merge state `unknown`.
  Latest comment by `stellar-jenkins-ci[bot]` at `2026-07-21T15:20:20Z`: https://github.com/stellar/stellar-docs/pull/2659#issuecomment-5035827035. **Preview is available here:**<br>http://developers-pr2659.previews.kube001.services.stellar-ops.com
  Latest comment by `stellar-jenkins-ci[bot]` at `2026-07-21T15:35:31Z`: https://github.com/stellar/stellar-docs/pull/2659#issuecomment-5035981490. **Preview is available here:**<br>http://developers-pr2659.previews.kube001.services.stellar-ops.com
  Head checks: complete=success, CodeQL=success, Socket Security: Pull Request Alerts=success, build / build=success, mdx-format=success, Socket Security: Project Report=success, Analyze (actions)=success, Analyze (javascript-typescript)=success. Reviews: copilot-pull-request-reviewer[bot]=COMMENTED, ElliotFriend=COMMENTED, kaankacar=APPROVED.
- GET https://developers.stellar.org/docs/build/apps/example-application-tutorial/overview.md at `2026-11-09T20:31:17.557526+00:00` → HTTP200; SHA256 `01dc7b3a0d4315ef084ec6bd8aeb2e1b53d2d6b04cf85c1dc56050c7851ca154`; body `tmp/docs-live/sd035.txt`.
- GET https://raw.githubusercontent.com/Creit-Tech/Stellar-Wallets-Kit/main/README.md at `2026-11-09T20:31:17.557620+00:00` → HTTP200; SHA256 `fa94acc0403dc1c40b8760ea5646651b737f15405597946deb17244f39db5c2e`; body `tmp/docs-live/sd035-kit.txt`.

## sd-048 — closed-unfixed

CAP-0075 line 78 still lists degrees 3,5,7,11; lines 124/157 and current host SUPPORTED_SBOX_DEGREES=[5] accept only 5. Issue 2010 was closed not_planned by github-actions[bot], not declined by a human. Correction PR2059 remains OPEN, BEHIND but MERGEABLE, REVIEW_REQUIRED, all five head checks successful, no reviews/comments.

Action: Keep reported-upstream; do not treat stale closure as decline. Author PR awaits review; updating behind branch is optional, not a failing-check repair.

- Direct GitHub read 2026-11-09T20:30:12.189626+00:00: https://github.com/stellar/stellar-protocol/issues/2010; author `kalepail`; state `closed`, reason `not_planned`, updated `2026-11-02T18:09:27Z`.
  Latest comment by `github-actions[bot]` at `2026-10-02T18:18:01Z`: https://github.com/stellar/stellar-protocol/issues/2010#issuecomment-5958579026. This issue is stale because it has been open for 30 days with no activity. It will be closed in 30 days unless the stale label is removed.
- Direct GitHub read 2026-11-09T20:30:12.512951+00:00: https://github.com/stellar/stellar-protocol/pull/2059; author `kalepail`; state `open`, reason `None`, updated `2026-11-03T15:16:22Z`; merged `False` at `None`; head `a00e3b3ba0351906c74cd5d925c134f138c56f13`, merge state `behind`.
  No issue/PR conversation comments.
  Head checks: Socket Security: Pull Request Alerts=success, Socket Security: Project Report=success, new-cap-proposal=success, mddiffcheck=success, lineendings=success. Reviews: none.
- GET https://raw.githubusercontent.com/stellar/stellar-protocol/master/core/cap-0075.md at `2026-11-09T20:31:17.614061+00:00` → HTTP200; SHA256 `1694f018e7002aca26c6f4ffbba09f985eced82f6f5149593f6e51d4ca09d5b2`; body `tmp/docs-live/sd048.txt`.
- GET https://raw.githubusercontent.com/stellar/rs-soroban-env/main/soroban-env-host/src/crypto/poseidon/mod.rs at `2026-11-09T20:31:17.741613+00:00` → HTTP200; SHA256 `a4fc963a5c1761ea73004b2906789078d4eec801d10f63e11c76930a95742ae7`; body `tmp/docs-live/sd048-host.txt`.

## sd-050 — still-repro

Live Client SDKs page line 25 names unscoped stellar-sdk while linking scoped package. Registry still serves deprecated unscoped 13.3.0 versus scoped 17.4.0.

Action: Keep report attached to oceans404’s existing issue 2561; no duplicate.

- Direct GitHub read 2026-11-09T20:30:05.863842+00:00: https://github.com/stellar/stellar-docs/issues/2561; author `oceans404`; state `open`, reason `None`, updated `2026-11-01T14:31:23Z`.
  No issue/PR conversation comments.
- GET https://developers.stellar.org/docs/tools/sdks/client-sdks.md at `2026-11-09T20:31:17.750750+00:00` → HTTP200; SHA256 `1a6e8f7478a514cd5eb2a5c3e17aa3722e55765d2afe5d3cc678d8ae973448b8`; body `tmp/docs-live/sd050.txt`.
- GET https://registry.npmjs.org/stellar-sdk/latest at `2026-11-09T20:31:17.756012+00:00` → HTTP200; SHA256 `5bae0b1c66873930052ca4925d2986796596fc0d1278f0700778fbaf52b40407`; body `tmp/docs-live/sd050-npm.txt`.
- GET https://registry.npmjs.org/@stellar%2fstellar-sdk/latest at `2026-11-09T20:31:17.791994+00:00` → HTTP200; SHA256 `db84f7fad30fb8a4f57bde44e0bdd75ab79cb07ef4399cc7176e6368032b03aa`; body `tmp/docs-live/sd050-scoped.txt`.

## sd-059 — still-repro

Seven original bare/verbatim Discovery queries all HTTP200 with 38/50/50/46/50/48/47 raw candidates; expected result-code leaf page absent for 7/7 before Raven filtering. Site MCP op_bad_signer returns Set Options Result Codes first, including ResponseField mapping.

Action: Keep Discovery ranking report; no docs-content rewrite. Await Mintlify-contact decision on issue2995. Most recent decision request is from stellar-triage-bot[bot], not a human maintainer.

- Direct GitHub read 2026-11-09T20:30:06.819226+00:00: https://github.com/stellar/stellar-docs/issues/2995; author `kalepail`; state `open`, reason `None`, updated `2026-11-03T15:58:34Z`.
  Latest comment by `kalepail` at `2026-11-03T15:56:08Z`: https://github.com/stellar/stellar-docs/issues/2995#issuecomment-6608646512. Raven compared the raw Discovery candidates on 2026-11-03, as promised in the last comment. The raw results also omit the pages. Method: `POST https://api.mintlify.com/discovery/v1/search/stellardevelopmentfoundation` with `{ query, pageSize: 50 }`. A hit is an exact match of the expected result-code page path. Raven ran the same queries through the site MCP tool `search_stellar_developer_docs`. | Query set | Discove
  Latest comment by `stellar-triage-bot[bot]` at `2026-11-03T15:58:32Z`: https://github.com/stellar/stellar-docs/issues/2995#issuecomment-6608715783. 🤖 _Automated message from the Stellar Triage Bot._ Back on this because @kalepail replied. Thanks for the raw check. It rules out Raven's own filter. - I checked the site search again at 15:58Z. `op_bad_signer` still returns Set Options Result Codes first. - I cannot call the Discovery API from here. It answers "Unauthorized" without a key. So I cannot repeat your numbers. - The docs content is not the cause. No repo
- `tmp/docs-search.json` records seven exact queries and raw bodies at 20:32Z. No expected leaf-page matches before filtering, including `op_bad_signer` absent from all38 candidates. `op_too_many_signers` has only generic Operations result-codes at rank30. Site MCP returns Set Options first. This rules out Raven scoping as the cause for these misses; no adapter replay is needed to establish absence from raw candidates.

## sd-061 — still-repro

Claimable-balances line359 still says getLedgerEntries obtains Balance ID; immediately following code requires BALANCE_ID. Earlier creation code derives it with getClaimableBalanceId(0); migration table says known ID only and no listing equivalent. PR2752 remains draft, DIRTY/CONFLICTING, REVIEW_REQUIRED; 15 unresolved threads, nine current.

Action: Keep reported-upstream. Maintainer/PR author must resolve draft conflicts/threads or take the isolated sentence fix. Raven does not own that PR.

- Direct GitHub read 2026-11-09T20:30:07.505247+00:00: https://github.com/stellar/stellar-docs/issues/2998; author `kalepail`; state `open`, reason `None`, updated `2026-11-02T20:31:11Z`.
  Latest comment by `stellar-triage-bot[bot]` at `2026-11-02T20:30:42Z`: https://github.com/stellar/stellar-docs/issues/2998#issuecomment-6587734977. 🤖 _Automated message from the Stellar Triage Bot._ Working this because it is a Raven-filed issue (label `raven`). I am checking the finding against the live guide and the RPC method now. <!-- automated-triage-bot ack state:assessing ts:2026-11-02T20:30:36Z --> 
  Latest comment by `stellar-triage-bot[bot]` at `2026-11-02T20:31:11Z`: https://github.com/stellar/stellar-docs/issues/2998#issuecomment-6587744906. 🤖 _Automated message from the Stellar Triage Bot._ Working this because it is a Raven-filed issue (label `raven`). The finding checks out. `getLedgerEntries` takes ledger keys, so the caller must already know the Balance ID. Draft PR #2752 already rewrites this sentence as part of a guide refresh. So I will not open a second PR. - #2752 is a draft, last updated 2026-08-26. - It conflicts with `main`. A maintainer can
- Direct GitHub read 2026-11-09T20:30:08.457671+00:00: https://github.com/stellar/stellar-docs/pull/2752; author `JFWooten4`; state `open`, reason `None`, updated `2026-08-26T17:03:43Z`; merged `False` at `None`; head `b93b6a0e88fa58ec33bede0e17848f6b83c16f1d`, merge state `dirty`.
  No issue/PR conversation comments.
  Head checks: complete=success, Socket Security: Pull Request Alerts=success, build / build=success, mdx-format=success, Socket Security: Project Report=success. Reviews: copilot-pull-request-reviewer[bot]=COMMENTED, JFWooten4=COMMENTED, JFWooten4=COMMENTED.
- GET https://developers.stellar.org/docs/build/guides/transactions/claimable-balances.md at `2026-11-09T20:31:17.861218+00:00` → HTTP200; SHA256 `d330f4c15698c34e3a911603c1ddcf2edd48d42e9920ae73cf22d83bf7ab7df3`; body `tmp/docs-live/sd061.txt`.
- GET https://developers.stellar.org/docs/data/apis/migrate-from-horizon-to-rpc.md at `2026-11-09T20:31:17.923787+00:00` → HTTP200; SHA256 `18141df2ced94f381973231a6ef36ef46e4b472268d3a7bab46c5152fa9f5799`; body `tmp/docs-live/sd061-migration.txt`.

## sd-064 — fixed

Original kalepail URL, its trailing slash, authors root and elliotfriend all now HTTP308 → /meetings → HTTP200. PR2945 merged 2026-11-09T17:05:10Z at 88c539971e605d01e5f1ee7f71efd1669ca1db5e; all eight head checks successful and kaankacar approved. Redirect to the meetings index meets the recorded smallest fix; author-specific rosters were not restored.

Action: Mark fixed-upstream; distinct retirement reviewer must independently rerun and reconcile references before deletion.

- Direct GitHub read 2026-11-09T20:30:10.895615+00:00: https://github.com/stellar/stellar-docs/pull/2945; author `ElliotFriend`; state `closed`, reason `None`, updated `2026-11-09T17:05:13Z`; merged `True` at `2026-11-09T17:05:10Z`; head `5187629cf2b6c0c054587e34edb45624c5246a5d`, merge state `unknown`.
  Latest comment by `gre3n3yes34` at `2026-10-23T01:28:07Z`: https://github.com/stellar/stellar-docs/pull/2945#issuecomment-6355174769. I vote no on the upgrade to Protocol 30 úntil Jan.2027 àt the new lobby On Thu, Oct 22, 2026, 12:43 PM mintlify[bot] ***@***.***> wrote: > *mintlify[bot]* left a comment (stellar/stellar-docs#2945) > <https://github.com/stellar/stellar-docs/pull/2945#issuecomment-6349703248> > > Preview deployment for your docs. Learn more about Mintlify Previews > <https://www.mintlify.com/docs/deploy/preview-deployments>. > Project
  Latest comment by `ElliotFriend` at `2026-11-09T17:01:13Z`: https://github.com/stellar/stellar-docs/pull/2945#issuecomment-6746164895. > I vote no on the upgrade to Protocol 30 úntil Jan.2027 àt the new lobby Hi, @gre3n3yes34! I'm not sure how you have your github email notifications set up, but I think you're confusing the stellar-docs repository with some other Stellar mailing list.
  Head checks: complete=success, CodeQL=success, Socket Security: Pull Request Alerts=success, Mintlify Deployment=success, Socket Security: Project Report=success, checks=success, Analyze (actions)=success, Analyze (javascript-typescript)=success. Reviews: kaankacar=APPROVED.
- GET https://developers.stellar.org/meetings/authors/kalepail at `2026-11-09T20:31:17.928331+00:00` → HTTP308; SHA256 `8eb6d14de2d0a94f621df5ae5cccd9f13e4d6b936130fd511dfd99cf66c5ec25`; body `tmp/docs-live/sd064.txt`. Redirect recheck `2026-11-09T20:32:02.572602+00:00`: 200 → https://developers.stellar.org/meetings; all hops in `tmp/docs-live/sd064.headers`.
- GET https://developers.stellar.org/meetings/authors at `2026-11-09T20:31:17.934307+00:00` → HTTP308; SHA256 `8eb6d14de2d0a94f621df5ae5cccd9f13e4d6b936130fd511dfd99cf66c5ec25`; body `tmp/docs-live/sd064-root.txt`. Redirect recheck `2026-11-09T20:32:04.041436+00:00`: 200 → https://developers.stellar.org/meetings; all hops in `tmp/docs-live/sd064-root.headers`.
- GET https://developers.stellar.org/meetings/authors/elliotfriend at `2026-11-09T20:31:17.960678+00:00` → HTTP308; SHA256 `8eb6d14de2d0a94f621df5ae5cccd9f13e4d6b936130fd511dfd99cf66c5ec25`; body `tmp/docs-live/sd064-author.txt`. Redirect recheck `2026-11-09T20:32:04.471906+00:00`: 200 → https://developers.stellar.org/meetings; all hops in `tmp/docs-live/sd064-author.headers`.
- GET https://developers.stellar.org/meetings/authors/kalepail/ at `2026-11-09T20:31:17.972103+00:00` → HTTP308; SHA256 `8eb6d14de2d0a94f621df5ae5cccd9f13e4d6b936130fd511dfd99cf66c5ec25`; body `tmp/docs-live/sd064-slash.txt`. Redirect recheck `2026-11-09T20:32:04.822809+00:00`: 200 → https://developers.stellar.org/meetings; all hops in `tmp/docs-live/sd064-slash.headers`.

Persistent-reference scan (full exact output in `tmp/sd-064-persistent-refs.txt`):
- `./.agents/rounds/2026-11-02-golden-audit/pass3/peer-handoff.json`
- `./.agents/rounds/2026-11-02-upstream-filing.md`
- `./.agents/rounds/2026-11-03-upstream-sweep/state.md`
- `./.agents/rounds/2026-11-05-truth-maintenance/docs.md`
- `./.agents/rounds/2026-11-06-remaining-sweep/docs-actions.json`
- `./.agents/rounds/2026-11-06-remaining-sweep/docs.md`
- `./.agents/rounds/2026-11-09-improvements-sweep.md`
- `./eval/qa/cases.json`
- `./eval/qa/corpus/battery/scf-grants-builders/q-builder-content-by-person.json`
- `./improvements/INDEX.md`
- `./improvements/stellar-docs/sd-064-meeting-author-pages-404-after-migration.md`
- `./research/audits/2026-11-03-qa-followup/case-dispositions.json`
- `./research/audits/2026-11-06-remaining-sweep/docs-evidence.json`
- `./research/audits/2026-11-06-remaining-sweep/docs-live.py`

Retirement edits required: update the active 404/current-defect wording in `eval/qa/corpus/battery/scf-grants-builders/q-builder-content-by-person.json`; regenerate `eval/qa/cases.json` through its owner script. Keep the truthful historical404 observation dated, but record current redirect-to-index200 and continue using the seven direct meeting pages for the author roster. Generated `improvements/INDEX.md` must be rebuilt; add the resolved receipt and remove the finding/probe/intake override only through coordinator/reviewer workflow. No sd-064 reference exists in `.agents/TODO.md` or `improvements/intake.json`; round/research ledgers are dated evidence and need no historical rewrite.

## sd-070 — still-repro

Migration guide still says added Option field traps UnexpectedSize with no SDK28/CAP86 qualifier. SDK v28 release notes expressly permit missing Option fields as None and ignore extra fields; CAP86 remains Protocol28. Draft2763 remains unchanged since August18, BLOCKED/REVIEW_REQUIRED; historical checks successful.

Action: Keep reported-upstream; wait for draft update, merge and deployment.

- Direct GitHub read 2026-11-09T20:30:08.679819+00:00: https://github.com/stellar/stellar-docs/pull/2763; author `leighmcculloch`; state `open`, reason `None`, updated `2026-08-18T20:30:24Z`; merged `False` at `None`; head `adaa73462124c57cb1a8ee094da8d62cd0f11269`, merge state `blocked`.
  Latest comment by `stellar-jenkins-ci[bot]` at `2026-08-18T18:06:52Z`: https://github.com/stellar/stellar-docs/pull/2763#issuecomment-5332154154. **Preview is available here:**<br>http://developers-pr2763.previews.kube001.services.stellar-ops.com
  Latest comment by `stellar-jenkins-ci[bot]` at `2026-08-18T20:30:24Z`: https://github.com/stellar/stellar-docs/pull/2763#issuecomment-5333695091. **Preview is available here:**<br>http://developers-pr2763.previews.kube001.services.stellar-ops.com
  Head checks: complete=success, CodeQL=success, Socket Security: Pull Request Alerts=success, Socket Security: Project Report=success, mdx-format=success, build / build=success, Analyze (javascript-typescript)=success, Analyze (actions)=success. Reviews: none.
- GET https://developers.stellar.org/docs/build/guides/storage/migrate-contract-storage.md at `2026-11-09T20:31:17.972193+00:00` → HTTP200; SHA256 `e8972cebdd7df96120935722dbc180b2ad3d6464ee7cbea774fd3ed60651feb5`; body `tmp/docs-live/sd070.txt`.
- GET https://raw.githubusercontent.com/stellar/stellar-protocol/master/core/cap-0086.md at `2026-11-09T20:31:18.089273+00:00` → HTTP200; SHA256 `8bca526939be847a6d1e921e3679df6c0f1f437a12dd3c5402fe55343440286b`; body `tmp/docs-live/sd070-cap.txt`.

## sd-074 — still-repro

Both Scaffold overview (three references) and Hello World frontend still name environments.toml; current CLI config source names scaffold.yml and explicitly recognizes environments.toml as deprecated. PR2708 is mergeable but BLOCKED/REVIEW_REQUIRED; checks green except fork preview NEUTRAL awaiting approval.

Action: Keep reported-upstream; maintainer review/preview approval required on external-author PR.

- Direct GitHub read 2026-11-09T20:30:08.397407+00:00: https://github.com/stellar/stellar-docs/pull/2708; author `zachfedor`; state `open`, reason `None`, updated `2026-11-03T10:32:35Z`; merged `False` at `None`; head `6c31502f5449804c6bf8492f9efd1a0ca29a77f0`, merge state `blocked`.
  Latest comment by `stellar-triage-bot[bot]` at `2026-10-27T14:02:32Z`: https://github.com/stellar/stellar-docs/pull/2708#issuecomment-6443950972. 🤖 _Automated message from the Stellar Triage Bot._ Back on this because @zachfedor pushed the Mintlify port. Verified: the port matches the content I checked before, the redirect and `docs.json` entry are correct, all links resolve, and `checks` is green. No live preview was available. Ready to merge. External-origin change, so a maintainer merges this. <!-- automated-triage-bot head:33f5c03a84b0a2363c450ca8f56942263
  Latest comment by `stellar-triage-bot[bot]` at `2026-11-03T10:32:34Z`: https://github.com/stellar/stellar-docs/pull/2708#issuecomment-6601256142. 🤖 _Automated message from the Stellar Triage Bot._ Back on this because @ElliotFriend reviewed. Done in 6c31502f. The grants page does not call Scaffold a Public Good, so I removed that claim. The sentence now says it is open source under Apache 2.0 and actively maintained. Both facts come from the stellar-scaffold/cli repo. `checks` is green. No live preview was available. Ready to merge. External-origin change, so 
  Head checks: complete=success, Socket Security: Pull Request Alerts=success, Socket Security: Project Report=success, checks=success, Mintlify Preview (fork)=neutral. Reviews: copilot-pull-request-reviewer[bot]=COMMENTED, stellar-triage-bot[bot]=COMMENTED, ElliotFriend=COMMENTED.
- GET https://developers.stellar.org/docs/tools/scaffold-stellar.md at `2026-11-09T20:31:18.095606+00:00` → HTTP200; SHA256 `20d83963f52dd8c215d90331df80914227586fde1e0cbf5ff608e1ec45724323`; body `tmp/docs-live/sd074.txt`.
- GET https://developers.stellar.org/docs/build/smart-contracts/getting-started/hello-world-frontend.md at `2026-11-09T20:31:18.099770+00:00` → HTTP200; SHA256 `7d6054c5f4346e6f5003fc790e01819b2ad880b04fd09aa63ebd798fd02d8f9a`; body `tmp/docs-live/sd074-hello.txt`.
- GET https://raw.githubusercontent.com/stellar-scaffold/cli/main/crates/stellar-scaffold-cli/src/config/mod.rs at `2026-11-09T20:31:18.136056+00:00` → HTTP200; SHA256 `753e22356a7c11b2eec1ec5a93851afc3d2ef7e944c46524ededdc625c415cff`; body `tmp/docs-live/sd074-config.txt`.

## sd-077 — still-repro

Funding index still requires a live product, while dedicated marketing-grants page’s Traction data asks whether project is live or preparing to launch soon. Dedicated prose still accepts clear use cases/concrete timelines. Both HTTP200.

Action: Keep verified; resolve policy with identified site owner before any filing.

- GET https://stellar.org/grants-and-funding at `2026-11-09T20:31:18.166772+00:00` → HTTP200; SHA256 `324700f6295baea88d6df3df26f05779df60d4892254f45eccc4831e634d2420`; body `tmp/docs-live/sd077.txt`.
- GET https://stellar.org/grants-and-funding/marketing-grants at `2026-11-09T20:31:18.225855+00:00` → HTTP200; SHA256 `2235af426504f6c7accfd884a2941797f77581ec7a75ef04eec7d06eabce32d2`; body `tmp/docs-live/sd077-marketing.txt`.

## sd-081 — still-repro

Known partial fix in merged PR2977 persists: both copies setTimeout(30). Both live contract-restoration fences still fail TypeScript parsing TS1131/TS1128 at the empty return type; both still pass instance LedgerKey as entry and response as footprint key. Combined polling/data-restoration fences with SDK17.4.0 reproduce TS2440 Api redeclaration.

Action: Keep active: unchanged core trigger still reproduces. No retirement/successor is warranted for this already-recorded partial time-bounds fix; the existing finding self-containedly owns every residual.

- Direct GitHub read 2026-11-09T20:30:05.872433+00:00: https://github.com/stellar/stellar-docs/issues/2562; author `oceans404`; state `open`, reason `None`, updated `2026-11-06T14:13:11Z`.
  Latest comment by `kalepail` at `2026-11-02T23:11:00Z`: https://github.com/stellar/stellar-docs/issues/2562#issuecomment-6590839544. Raven rechecked the contract-restoration example on 2026-11-02 and found more defects than this issue lists. The empty return type and the missing `xdr` import on `restore-contract-js` line 69 are still present. The same function is also on the [state-archival page](https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/state-archival) line 365. Additional defects in the same example: - `
  Latest comment by `kalepail` at `2026-11-06T14:13:11Z`: https://github.com/stellar/stellar-docs/issues/2562#issuecomment-6686867459. Verified a partial fix on 2026-11-06: both contract-restoration examples now call `.setTimeout(30)` before `.build()`. The missing-time-bounds item in my [earlier comment](https://github.com/stellar/stellar-docs/issues/2562#issuecomment-6590839544) is therefore complete. The remaining problems still reproduce on [restore-contract-js](https://developers.stellar.org/docs/build/guides/archival/restore-contract-js) and [
- Direct GitHub read 2026-11-09T20:30:11.419735+00:00: https://github.com/stellar/stellar-docs/pull/2977; author `stellar-triage-bot[bot]`; state `closed`, reason `None`, updated `2026-11-03T16:14:24Z`; merged `True` at `2026-11-03T16:14:21Z`; head `8751edb7776acce762b6932d0100bcfa56156222`, merge state `unknown`.
  Latest comment by `oceans404` at `2026-11-02T21:35:55Z`: https://github.com/stellar/stellar-docs/pull/2977#issuecomment-6589052400. Tested `submitTx` on SDK 17.4.0 against a local network. A normal send, resending a transaction that already landed, `TRY_AGAIN_LATER`, an expired transaction, an on-chain failure and a missing time bound all behave the way the page says. One nit on the status table: resending a transaction that's already in a ledger didn't return `ERROR` (`txBAD_SEQ`) right away. It returned `TRY_AGAIN_LATER` for about 9 ledgers fir
  Latest comment by `stellar-triage-bot[bot]` at `2026-11-03T01:25:37Z`: https://github.com/stellar/stellar-docs/pull/2977#issuecomment-6592943144. 🤖 _Automated message from the Stellar Triage Bot._ Back on this because @ElliotFriend asked with /triage and requested changes. - Merged main. I kept this PR's `submitTx`, which replaces the #2933 hunk. - Line 10 now says "Only `ERROR` is a final rejection." - @oceans404, thanks for the test. Confirmed in stellar-core: an applied transaction is banned for 10 ledgers. The `TRY_AGAIN_LATER` and `ERROR` rows now say so.
  Head checks: complete=success, CodeQL=success, Socket Security: Pull Request Alerts=success, checks=success, Socket Security: Project Report=success, Analyze (actions)=success, Analyze (javascript-typescript)=success, Mintlify Deployment=success. Reviews: ElliotFriend=CHANGES_REQUESTED, ElliotFriend=APPROVED.
- GET https://developers.stellar.org/docs/build/guides/archival/restore-contract-js.md at `2026-11-09T20:31:18.234769+00:00` → HTTP200; SHA256 `fd3664cfb011c040b847d8ad70eab3eee987d3bf32de2bba1b64c581f05523ad`; body `tmp/docs-live/sd081.txt`.
- GET https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/state-archival.md at `2026-11-09T20:31:18.253278+00:00` → HTTP200; SHA256 `1ddca55cfa930d9e4fc48d999344c9e049456b1a8f78948105f0b3c3a0e76f5c`; body `tmp/docs-live/sd081-state.txt`.
- GET https://developers.stellar.org/docs/build/guides/archival/restore-data-js.md at `2026-11-09T20:31:18.267205+00:00` → HTTP200; SHA256 `2b4f699dfdb2a50f354698069146f0b595a75390b0b01c223fadf4c30dcfebc8`; body `tmp/docs-live/sd081-data.txt`.
- GET https://developers.stellar.org/docs/build/guides/transactions/submit-transaction-wait-js.md at `2026-11-09T20:31:18.345105+00:00` → HTTP200; SHA256 `a8cc71d50fa59aef5aaaeaec5839b4d32216b999f9eeeced874a025779567229`; body `tmp/docs-live/sd081-submit.txt`.
- `.setTimeout(30)` appears in both extracted contract fences. `node_modules/.bin/tsc --noEmit --skipLibCheck --ignoreConfig tmp/docs-live/sd081.ts` and `sd081-state.ts` report TS1131/TS1128. Runtime source inspection separately confirms unchanged `getFootprint()` → `getWasmLedgerKey(instance)` → response-as-footprint sequence.
- Combined exact polling/data fences: `node_modules/.bin/tsc --noEmit --skipLibCheck --ignoreConfig --target esnext --module nodenext tmp/docs-live/sd081-combined.ts`; with SDK17.4.0 available via temporary node_modules symlink, reports TS2440 on Api (`tmp/docs-live/sd081-combined.log`).
- Do not retire merely because PR2977 merged. If the coordinator nevertheless splits the completed timeout subclaim into a receipt, the successor must restate both pages, parser diagnostics, missing xdr import, instance-key/entry confusion, response-as-key footprint and Api collision. Dedupe finds those all already owned by active sd-081, so retaining it avoids a duplicate sd-103.

Persistent-reference scan (full exact output in `tmp/sd-081-persistent-refs.txt`):
- `./.agents/rounds/2026-11-02-upstream-followup.md`
- `./.agents/rounds/2026-11-02-upstream-followup/rv-fu-review2.md`
- `./.agents/rounds/2026-11-03-qa-followup.md`
- `./.agents/rounds/2026-11-03-upstream-sweep/state.md`
- `./.agents/rounds/2026-11-05-truth-maintenance/docs.md`
- `./.agents/rounds/2026-11-06-remaining-sweep.md`
- `./.agents/rounds/2026-11-06-remaining-sweep/cross-review.md`
- `./.agents/rounds/2026-11-06-remaining-sweep/docs-actions.json`
- `./.agents/rounds/2026-11-06-remaining-sweep/docs.md`
- `./.agents/rounds/2026-11-09-improvements-sweep.md`
- `./improvements/INDEX.md`
- `./improvements/intake.json`
- `./improvements/resolved.json`
- `./improvements/stellar-docs/sd-081-contract-restoration-example-obsolete-xdr.md`
- `./research/audits/2026-11-05-improvements/docs-sdk-recheck.mjs`
- `./research/audits/2026-11-06-remaining-sweep/docs-evidence.json`
- `./research/audits/2026-11-06-remaining-sweep/docs-live.py`
- `./research/audits/2026-11-06-remaining-sweep/docs-sdk.mjs`

No retirement authorized by this result. If it is split later, its intake override and every dated reference above need explicit reconciliation; `.agents/TODO.md` and owned golden corpus have no direct sd-081 match.

## sd-096 — declined

All three invented source paths still HTTP308 to the same missing destinations, final404. Explicit human decline by ElliotFriend remains: pages never existed; reconsider only on real traffic/inbound-link evidence. No such new evidence found in this sweep.

Action: Retain declined-upstream; do not add redirects or re-file.

- Direct GitHub read 2026-11-09T20:30:07.536140+00:00: https://github.com/stellar/stellar-docs/issues/3028; author `kalepail`; state `closed`, reason `completed`, updated `2026-11-05T18:21:41Z`.
  Latest comment by `stellar-triage-bot[bot]` at `2026-11-03T19:14:54Z`: https://github.com/stellar/stellar-docs/issues/3028#issuecomment-6613164604. 🤖 _Automated message from the Stellar Triage Bot._ Working this because it is a Raven-filed issue (label `raven`). This looks closable. The three URLs are not old pages. They never existed on the site. - The 308 then 404 reproduces live today. - Git history has no page at any of the three paths. `smart-wallets` was always one page, not a folder. The old `contract-interactions` folder never had a SEP page. - The Wayba
  Latest comment by `ElliotFriend` at `2026-11-05T18:21:41Z`: https://github.com/stellar/stellar-docs/issues/3028#issuecomment-6665776744. closing this one, since the redirected URLs never actually existed. we'll monitor to see if these "false positive" URLs actually get traffic, and we'll revisit if a more refined redirect is needed.
- GET https://developers.stellar.org/docs/build/apps/smart-wallets/recovery at `2026-11-09T20:31:18.406175+00:00` → HTTP308; SHA256 `8eb6d14de2d0a94f621df5ae5cccd9f13e4d6b936130fd511dfd99cf66c5ec25`; body `tmp/docs-live/sd096-recovery.txt`. Redirect recheck `2026-11-09T20:32:06.441638+00:00`: 404 → https://developers.stellar.org/docs/build/guides/contract-accounts/recovery; all hops in `tmp/docs-live/sd096-recovery.headers`.
- GET https://developers.stellar.org/docs/build/apps/smart-wallets/fee-sponsorship at `2026-11-09T20:31:18.411422+00:00` → HTTP308; SHA256 `8eb6d14de2d0a94f621df5ae5cccd9f13e4d6b936130fd511dfd99cf66c5ec25`; body `tmp/docs-live/sd096-fees.txt`. Redirect recheck `2026-11-09T20:32:06.957534+00:00`: 404 → https://developers.stellar.org/docs/build/guides/contract-accounts/fee-sponsorship; all hops in `tmp/docs-live/sd096-fees.headers`.
- GET https://developers.stellar.org/docs/learn/encyclopedia/contract-development/contract-interactions/stellar-ecosystem-proposals at `2026-11-09T20:31:18.414701+00:00` → HTTP308; SHA256 `8eb6d14de2d0a94f621df5ae5cccd9f13e4d6b936130fd511dfd99cf66c5ec25`; body `tmp/docs-live/sd096-sep.txt`. Redirect recheck `2026-11-09T20:32:07.819132+00:00`: 404 → https://developers.stellar.org/docs/learn/fundamentals/contract-development/contract-interactions/stellar-ecosystem-proposals; all hops in `tmp/docs-live/sd096-sep.headers`.

## sd-100 — still-repro

Light check: live USDT0 page still contains both 5–7 seconds and 5–7s estimates; linked Stellar Stack says about every5seconds. Issue3078 has new bot-authored PR3080, OPEN/BLOCKED/REVIEW_REQUIRED, eight successful head checks, no reviews.

Action: Keep reported-upstream; append PR3080 ref. Recheck both repetitions only after merge/deploy.

- Direct GitHub read 2026-11-09T20:30:07.596000+00:00: https://github.com/stellar/stellar-docs/issues/3078; author `kalepail`; state `open`, reason `None`, updated `2026-11-09T19:40:11Z`.
  Latest comment by `stellar-triage-bot[bot]` at `2026-11-09T19:38:46Z`: https://github.com/stellar/stellar-docs/issues/3078#issuecomment-6749571462. 🤖 _Automated message from the Stellar Triage Bot._ Working this because it is a Raven-filed issue (label `raven`). I am checking the finding against the live page and the source now. <!-- automated-triage-bot ack state:assessing ts:2026-11-09T19:38:34Z --> 
  Latest comment by `stellar-triage-bot[bot]` at `2026-11-09T19:40:11Z`: https://github.com/stellar/stellar-docs/issues/3078#issuecomment-6749604250. 🤖 _Automated message from the Stellar Triage Bot._ Working this because it is a Raven-filed issue (label `raven`). The finding checks out. I opened #3080. - It changes the two "5–7 seconds" spots on the USDT0 launch page to about 5 seconds. - The "Stellar settlement" value still links to the Stellar Stack page. - No other page uses the old range. The Raven handoff for sd-100 follows after the merge and the live reche
- Direct GitHub read 2026-11-09T20:32:01.485066+00:00: https://github.com/stellar/stellar-docs/pull/3080; author `stellar-triage-bot[bot]`; state `open`, reason `None`, updated `2026-11-09T20:18:21Z`; merged `False` at `None`; head `7423bc52d2bf026cccc61a6954b59646bb01f646`, merge state `blocked`.
  Latest comment by `mintlify[bot]` at `2026-11-09T19:39:57Z`: https://github.com/stellar/stellar-docs/pull/3080#issuecomment-6749598840. <!-- mintlify-preview-comment-stellardevelopmentfoundation-docs-agent-3078-usdt0-ledger-c --> Preview deployment for your docs. Learn more about [Mintlify Previews](https://www.mintlify.com/docs/deploy/preview-deployments). | Project | Status | Preview | Updated | |---------|--------|---------|---------------| | [stellar\-docs](https://app.mintlify.com/stellardevelopmentfoundation/stellardevelopmentfoundation/activit
  Latest comment by `stellar-triage-bot[bot]` at `2026-11-09T20:18:21Z`: https://github.com/stellar/stellar-docs/pull/3080#issuecomment-6750421867. 🤖 _Automated message from the Stellar Triage Bot._ Reviewing because this is my own PR for #3078. Verified: the preview shows "about 5 seconds" and "~5s", matching the linked Stellar Stack page. Mainnet sample: 199 of 199 closes took 5 seconds. All checks pass. Ready to merge. <!-- automated-triage-bot head:7423bc52d2bf026cccc61a6954b59646bb01f646 --> 
  Head checks: complete=success, CodeQL=success, Socket Security: Pull Request Alerts=success, Mintlify Deployment=success, Socket Security: Project Report=success, checks=success, Analyze (javascript-typescript)=success, Analyze (actions)=success. Reviews: none.
- GET https://developers.stellar.org/launch/usdt0.md at `2026-11-09T20:31:18.424564+00:00` → HTTP200; SHA256 `750e9401e3b292bbe52af15bec9133f4938440929f7daa6b9bddbeb53b178e22`; body `tmp/docs-live/sd100.txt`.
- GET https://developers.stellar.org/docs/learn/fundamentals/stellar-stack.md at `2026-11-09T20:31:18.489277+00:00` → HTTP200; SHA256 `eb896b368c86eff88e9b8bef31fe38f410432738ace4106405a1130136ef655e`; body `tmp/docs-live/sd100-stack.txt`.

## sd-101 — still-repro

Light check: live check-auth tutorial SHA256 remains 5a55dbfd9a912c4bddfbcb5a9426aeb3bb270012f3b9383a3af347aa165158c5, identical to today’s independently compiled original. Missing definitions and base64_url calls remain. New bot-authored PR3081 is OPEN/BLOCKED/REVIEW_REQUIRED, eight successful head checks, no reviews; author explicitly did not compile with cargo.

Action: Keep reported-upstream; append PR3081 ref. No redundant compile today; next gate is full supplied-contract compile after merge/deploy.

- Direct GitHub read 2026-11-09T20:30:07.756044+00:00: https://github.com/stellar/stellar-docs/issues/3079; author `kalepail`; state `open`, reason `None`, updated `2026-11-09T19:46:04Z`.
  Latest comment by `stellar-triage-bot[bot]` at `2026-11-09T19:40:18Z`: https://github.com/stellar/stellar-docs/issues/3079#issuecomment-6749606859. 🤖 _Automated message from the Stellar Triage Bot._ Working this because it is a Raven-filed issue (label `raven`). I am checking the finding against the live page and the source now. <!-- automated-triage-bot ack state:assessing ts:2026-11-09T19:40:11Z --> 
  Latest comment by `stellar-triage-bot[bot]` at `2026-11-09T19:46:04Z`: https://github.com/stellar/stellar-docs/issues/3079#issuecomment-6749727916. 🤖 _Automated message from the Stellar Triage Bot._ Working this because it is a Raven-filed issue (label `raven`). The finding checks out. I opened #3081. - It defines `WEEK_OF_LEDGERS`, `ADMIN_SIGNER_COUNT` and `ClientDataJson`, with values from the tutorial's credited passkey-kit source. - It calls the page's own `encode` function. - It adds a `Cargo.toml` block for `serde` and `serde-json-core`. - I could not run 
- Direct GitHub read 2026-11-09T20:30:11.720744+00:00: https://github.com/stellar/stellar-docs/pull/3067; author `stellar-triage-bot[bot]`; state `closed`, reason `None`, updated `2026-11-09T16:26:59Z`; merged `True` at `2026-11-09T16:26:57Z`; head `c44b09b4d9669bc9d3d8d26f8974c9ff108f95f9`, merge state `unknown`.
  Latest comment by `ElliotFriend` at `2026-11-06T15:41:12Z`: https://github.com/stellar/stellar-docs/pull/3067#issuecomment-6688788832. /triage please address the review above.
  Latest comment by `stellar-triage-bot[bot]` at `2026-11-06T15:52:48Z`: https://github.com/stellar/stellar-docs/pull/3067#issuecomment-6689063951. 🤖 _Automated message from the Stellar Triage Bot._ Back on this because @ElliotFriend asked with /triage. Pushed 42dd807 with your review asks: - `check-auth-tutorials.mdx`: the `SignerAdded` XDR JSON example after the event definitions, plus a note that `SignerRemoved` has `"data": "void"`. - `working-with-contract-specs.mdx`: the `Mint` snippet uses GALIAL...UINTY and GC45QS...56FD4, the Python script has an exampl
  Head checks: complete=success, CodeQL=success, Socket Security: Pull Request Alerts=success, Mintlify Deployment=success, Socket Security: Project Report=success, checks=success, Analyze (actions)=success, Analyze (javascript-typescript)=success. Reviews: ElliotFriend=COMMENTED, ElliotFriend=APPROVED.
- Direct GitHub read 2026-11-09T20:32:04.413461+00:00: https://github.com/stellar/stellar-docs/pull/3081; author `stellar-triage-bot[bot]`; state `open`, reason `None`, updated `2026-11-09T19:45:41Z`; merged `False` at `None`; head `bb7f2cf0b9ed021095566ee98a2dc92e628825f3`, merge state `blocked`.
  Latest comment by `mintlify[bot]` at `2026-11-09T19:43:43Z`: https://github.com/stellar/stellar-docs/pull/3081#issuecomment-6749679078. <!-- mintlify-preview-comment-stellardevelopmentfoundation-docs-agent-3079-webauthn-compl --> Preview deployment for your docs. Learn more about [Mintlify Previews](https://www.mintlify.com/docs/deploy/preview-deployments). | Project | Status | Preview | Updated | |---------|--------|---------|---------------| | [stellar\-docs](https://app.mintlify.com/stellardevelopmentfoundation/stellardevelopmentfoundation/activit
  Head checks: complete=success, Mintlify Deployment=success, CodeQL=success, Socket Security: Pull Request Alerts=success, Socket Security: Project Report=success, checks=success, Analyze (actions)=success, Analyze (javascript-typescript)=success. Reviews: none.
- GET https://developers.stellar.org/docs/build/guides/auth/check-auth-tutorials.md at `2026-11-09T20:31:18.525338+00:00` → HTTP200; SHA256 `5a55dbfd9a912c4bddfbcb5a9426aeb3bb270012f3b9383a3af347aa165158c5`; body `tmp/docs-live/sd101.txt`.

## sd-102 — declined

Live configuring page includes ordinary fresh database/backfill behavior and intentionally omits gap error. Fresh v30.0.0 backfill source calls verifyDbGapless, accepts empty DB and errors on gaps; daemon treats backfill failure as fatal. Shaptic’s inline scope decline and approval directly verified.

Action: Retain declined-upstream; intentional omission is not an unmerged-fix failure.

- Direct GitHub read 2026-11-09T20:30:09.084289+00:00: https://github.com/stellar/stellar-docs/pull/2899; author `kaankacar`; state `closed`, reason `None`, updated `2026-11-09T18:26:12Z`; merged `True` at `2026-11-09T18:23:10Z`; head `6b422b3311b78c40e124a3f83498224bc2a2f47d`, merge state `unknown`.
  Latest comment by `stellar-triage-bot[bot]` at `2026-11-09T17:59:36Z`: https://github.com/stellar/stellar-docs/pull/2899#issuecomment-6747507546. 🤖 _Automated message from the Stellar Triage Bot._ Back on this because @ElliotFriend merged main into the branch. The merge is clean. The diff is now only the 8 added lines, all checks pass, and the preview renders both paragraphs. Both statements still match stellar-rpc v30.0.0, the latest release. One decision is still open: merge on this source check, or wait for @Shaptic's RPC-team review? @kaankacar @ElliotFrie
  Latest comment by `stellar-triage-bot[bot]` at `2026-11-09T18:13:54Z`: https://github.com/stellar/stellar-docs/pull/2899#issuecomment-6747795599. 🤖 _Automated message from the Stellar Triage Bot._ Back on this because @ElliotFriend pushed 546eefc. - The commit moves the fresh-start paragraph below the `HISTORY_RETENTION_WINDOW` definition. The text is unchanged, and the preview shows the new order. - The `checks` job did not start at this head. Run 42671390703 has only the `complete` job, and CodeQL ran no jobs. The same lines passed `checks` at b8be4ec. A mai
  Head checks: Socket Security: Pull Request Alerts=success, Socket Security: Project Report=success, Mintlify Deployment=success. Reviews: copilot-pull-request-reviewer[bot]=COMMENTED, Shaptic=APPROVED.
- GET https://developers.stellar.org/docs/data/apis/rpc/admin-guide/configuring.md at `2026-11-09T20:31:18.545899+00:00` → HTTP200; SHA256 `116f614d061ac60fd781c831c4a0611aba0efcc6fd5acce17c376bfc71fc18a2`; body `tmp/docs-live/sd102.txt`.
- GET https://raw.githubusercontent.com/stellar/stellar-rpc/v30.0.0/cmd/stellar-rpc/internal/ingest/backfill.go at `2026-11-09T20:31:18.569164+00:00` → HTTP200; SHA256 `7eeb095dbe8060acee6ffd3899f5105f7b82fab4b6c7f9e952fb8f5039f9adb3`; body `tmp/docs-live/sd102-backfill.txt`.
- Read back inline review by `Shaptic`: https://github.com/stellar/stellar-docs/pull/2899#discussion_r4516284001, explicitly says this is a corruption sanity check and not worth documenting; subsequent approval is at 2026-11-09T18:16:20Z.
- `curl -fsSL https://raw.githubusercontent.com/stellar/stellar-rpc/v30.0.0/cmd/stellar-rpc/internal/daemon/daemon.go -o tmp/docs-live/sd102-daemon.txt`; HTTP200, failure is fatal with `failed to backfill ledgers`. Backfill empty DB returns `(0,0,nil)`; internal gap emits recorded error.

## wai-001 — declined

Fresh npm latest4.0.1 remains deprecated. Latest package mock reproduction still throws Unknown gateway provider moonshotai before binding.run (zero calls). PR639 remains closed/unmerged; mattzcarey explicitly feature-froze package. Issue634 closure was Raven’s own acknowledgement, not an independent maintainer fix.

Action: Retain declined-upstream and migration disposition; do not re-file frozen-package feature request.

- Direct GitHub read 2026-11-09T20:30:05.777454+00:00: https://github.com/cloudflare/ai/issues/634; author `kalepail`; state `closed`, reason `not_planned`, updated `2026-11-02T23:17:16Z`.
  Latest comment by `edenbuilds` at `2026-08-15T23:50:11Z`: https://github.com/cloudflare/ai/issues/634#issuecomment-5304802270. ## Summary - register `moonshotai` as an OpenAI-wire unified-billing run-catalog provider - keep it run-path only because it has no native AI Gateway path - add registry and delegate regression coverage plus a patch changeset ## Verification - Regression proof: before the source change, the focused test failed with `Unknown gateway provider "moonshotai"`. - After the fix: Workers AI provider gateway tests pass (71/71
  Latest comment by `kalepail` at `2026-11-02T23:17:15Z`: https://github.com/cloudflare/ai/issues/634#issuecomment-6590945505. Thank you. The decline on #639 is clear: `workers-ai-provider` is frozen, and `createAI` from `agents/models/ai-sdk` is the replacement. Raven rechecked on 2026-11-02: `workers-ai-provider` 4.0.1 still rejects the slug, and `agents` 0.32.0 accepts `moonshotai/kimi-k3`. Raven will move to `createAI`. Closing as not planned.
- Direct GitHub read 2026-11-09T20:30:05.833222+00:00: https://github.com/cloudflare/ai/pull/639; author `edenbuilds`; state `closed`, reason `None`, updated `2026-10-20T16:31:29Z`; merged `False` at `None`; head `b57a507cd4a4e0eb8b2330196b75477c8eddfc64`, merge state `unknown`.
  Latest comment by `edenbuilds` at `2026-10-01T05:09:40Z`: https://github.com/cloudflare/ai/pull/639#issuecomment-5925158531. No checks have reported on this PR. If CI needs a maintainer to approve the run, could you start it? I can also adjust the approach if you would rather see it shaped differently.
  Latest comment by `mattzcarey` at `2026-10-20T15:57:39Z`: https://github.com/cloudflare/ai/pull/639#issuecomment-6295163611. Thanks! workers-ai-provider is being deprecated and feature frozen in favour of `createAI` from `agents/models/ai-sdk`. This replacement already supports this: the AI SDK provider accepts any `<author>/<model>` catalog id. Closing this PR. Thank you for your contribution.
  Head checks: none. Reviews: none.
- GET https://registry.npmjs.org/workers-ai-provider/latest at `2026-11-09T20:31:18.619696+00:00` → HTTP200; SHA256 `6cce04f08c8d7d608da85507bdd681675142a2c12eb622f8af4d4145cee0a367`; body `tmp/docs-live/wai001-npm.txt`.

## Gate

`git diff --check -- improvements/stellar-docs improvements/canonical-source improvements/workers-ai-provider` passed. No code changed, so runtime build/unit/smoke tests were not run. The required lint command exited 1 with only the expected stale generated index. Index regeneration is forbidden by the lane brief and is left to the coordinator after collecting all author lanes.

`npm run improvements:lint` (2026-11-09 sweep), exit 1:

```text
> stellar-raven-codemode@0.1.0 improvements:lint
> node scripts/improvements-lint.mjs

improvements lint failed (1):
- improvements/INDEX.md is stale; run npm run improvements:index
```
