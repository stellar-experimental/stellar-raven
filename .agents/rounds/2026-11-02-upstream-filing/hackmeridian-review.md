FILE-WITH-FIXES

Reviewer: Grok, lane rv-hm. Worktree read-only. `npm run improvements:lint` at 2026-11-02T21:47Z: `improvements lint ok (121 findings)`. No partner-tier Lumenloop detail and no production usage figure in the new or edited records. New ids are absent from `improvements/resolved.json`. No tracked file was edited.

## sk-032 — FILE

`skills/smart-contracts/SKILL.md` at `stellar/stellar-dev-skill` `313832e` (fetched 2026-11-02T21:48:48Z) line 36 says the skill was written against protocol 27. Line 70 says `soroban-sdk = "27"  # protocol 27, which mainnet runs at the time of writing.` Line 76 pins testutils to `"27"`.

`GET https://horizon.stellar.org/` at 2026-11-02T21:48:48Z returned `current_protocol_version` 29 and `core_supported_protocol_version` 30. Testnet Horizon returned protocol 29. `rs-soroban-sdk` releases: v28.0.0 (2026-09-18), v29.0.1 (2026-10-12), v30.0.0-rc.1 (2026-10-21).

`development.md` line 337 calls `update_current_contract_wasm`. In `soroban-sdk/src/deploy.rs`, that function has no `deprecated` attribute at tag v27.0.0 (line 222). At v28.0.0 and v29.0.1 line 287 is `#[deprecated(note = "use update_current_contract")]`. The replacement `update_current_contract` is at line 313.

Closed `stellar/stellar-dev-skill#124` is the old protocol-26 fix (resolved sk-021). No open issue or PR names protocol 29 or `update_current_contract_wasm`.

One issue is right. The pin and the upgrade example change together. Pin the stable major 29. Leave the v30 release candidate out.

Exact fix: none.

## sk-033 — FILE

`development.md` line 287, same commit, fetched 2026-11-02T21:48:48Z: `try_foo()` returns `Result<Result<T, E>, InvokeError>` and `Ok(Err(e))` is the typed error.

`soroban-sdk-macros/src/syn_ext.rs` `fn try_output` at v27.0.0, v28.0.0, and v29.0.1 (lines 243-246) emits `Result<Result<T, <T as TryFromVal<Env, Val>>::Error>, Result<E, InvokeError>>`.

`soroban-sdk/src/env.rs` `try_invoke_contract` has that signature at v27 (line 446) and v29.0.1 (line 497). The body maps a contract error to the outer `Err` arm and a normal return to the outer `Ok` arm:

```
Ok(err) => Err(E::try_from(err).map_err(Into::into)),
Err(ConversionError) => Ok(T::try_from_val(self, &rv)),
```

So `Err(Ok(e))` is the typed contract error. `Ok(Err(_))` is a return-value conversion failure. `Err(Err(_))` is an `InvokeError`. This shape is already wrong on the pinned SDK 27. The recommendation quotes the real nesting.

No `stellar-dev-skill` issue matches `try_foo` or `InvokeError`. No other Raven finding covers it.

Exact fix: none.

## sk-034 — FILE

`development.md` line 394, fetched 2026-11-02T21:48:48Z: `Ledger entries read / written | 200 / 200`. The table has no footprint row.

`stellar network settings --network mainnet --output json` at 2026-11-02T21:48:50Z (stellar-cli 28.1.0) returned `tx_max_footprint_entries` 400, `tx_max_disk_read_entries` 200, and `tx_max_write_ledger_entries` 200. The CLI warned that the network is protocol 29 and the CLI supports 28. The three fields were in the fetched config.

`stellar-core` master `NetworkConfig.h` says `txMaxDiskReadEntries` is the maximum ledger-entry read operations per transaction. `txMaxFootprintEntries` is the maximum entries across the read-only and read-write footprints (lines 379-383).

No skill issue or PR mentions footprint entries.

Exact fix: none. Add the 400-entry row and rename the 200/200 row to disk-read entries and written entries.

## sk-035 — FIX-THEN-FILE

The assets skill description and line 17 claim regulated-asset coverage. The SEP section lists SEP-0001, SEP-0010, and SEP-0024. A grep of every `skills/**/*.md` file on `main` at 2026-11-02T21:50Z found zero matches for `SEP-8`, `SEP-0008`, or `approval server`.

`sep-0008.md` on `stellar/stellar-protocol` master, fetched 2026-11-02T21:48:49Z, says `Status: Active` and `Version 1.7.4`. The summary says regulated assets need approval on each transaction.

The standards skill already sends a regulated-token task to SEP-0057 (line 62 and line 101). SEP-0057 is the T-REX pattern. SEP-0008 is the classic approval server. Those are different standards.

No skill issue mentions SEP-8. This is a content gap on a page that claims the topic.

Exact fix: add one sentence that SEP-0008 is the classic per-transaction approval server and is a different standard from SEP-0057. Then file.

## sk-036 — FILE

`skills/data/SKILL.md` lines 131-144, fetched 2026-11-02T21:48:49Z, poll only when `response.status === "PENDING"`. There is no other branch. Line 151 lists `getTransaction` as `"SUCCESS" | "FAILED" | "NOT_FOUND"`.

`GET https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/sendTransaction.md` at 2026-11-02T21:50:41Z says `Available options: PENDING, DUPLICATE, TRY_AGAIN_LATER, ERROR`. It says `errorResultXdr` is set when the status is `ERROR`.

A grep of every skill markdown file found no `DUPLICATE` and no `TRY_AGAIN_LATER`. `skills/dapp/SKILL.md` line 423 throws only on `ERROR`, then polls. The dapp property in that example is `errorResult`. The docs JavaScript sample uses `errorResultXdr`.

No skill issue covers `sendTransaction` status handling. Resolved sd-003 is the docs search index.

Exact fix: none. In the TypeScript sample, use the field the SDK returns. The docs page names the JSON field `errorResultXdr`.

## sls-107 — FIX-THEN-FILE

`GET https://stellarlight.xyz/api/stablecoins?limit=200` at 2026-11-02T21:51:07Z returned 41 rows. `dataAsOf` is `2026-11-02T16:22:16.011Z`. USDY is first, `assetType` `Yield Stablecoin`, `priceUSD` 1.15. YLDS is `Yield Stablecoin`. USDM1 is `Treasury-Backed` at 1.02.

`GET ...?assetType=Yield%20Stablecoin` at 21:51:07Z returned HTTP 400: `Unknown query param 'assetType'.` Valid params are `peg`, `sort`, and `limit`. OpenAPI says `assetType` null means a plain peg. `company` has no description.

Horizon `home_domain` at 21:54:02Z: MGUSD `mgusd.moneygram.com`, AUDD `audd.digital`, C1USD `currency.one`.

Toml quotes, fetched 21:53:59Z to 21:54:01Z:

- MGUSD `ORG_NAME="MoneyGram Payment Systems, Inc."` and `desc="USD-backed stablecoin issued by Bridge on behalf of MoneyGram"`.
- AUDD `ORG_NAME="AUDC PTY LTD"`. Scout `company` is `Novatti Group`.
- C1USD `ORG_NAME="Kinesis Money Panama S.A."` and the desc names Kinesis. Scout `company` is `Currency One` on all eight C1 rows.

AUDD and C1USD are real issuer mismatches. MGUSD `company` matches the toml org name. Bridge appears only in the currency desc. The current bullet says the toml issuer is Bridge. That overstates the org field.

No open Scout issue names this issuer gap. Resolved sls-034 and sls-066 are other stablecoin gaps.

Exact fix: say MGUSD `ORG_NAME` is MoneyGram Payment Systems, Inc., and the desc adds Bridge. Set `issuerOfRecord` from `ORG_NAME`. Keep the Bridge sentence as a desc note. Keep the `assetType` filter. The two edits belong on one endpoint.

## sls-108 — FIX-THEN-FILE

`GET https://stellarlight.xyz/api/audits?auditor=OpenZeppelin` at 2026-11-02T21:51:07Z returned `counts.matched` 2: portal report 35 (v0.3.0-rc.2) and report 2 (0.1.0). `GET https://stellarsecurityportal.com/api/v1/reports` at 21:55:54Z returned 66 reports. The only OpenZeppelin library rows are those same two (`auditorName` OpenZeppelin).

`gh api repos/OpenZeppelin/stellar-contracts/contents/audits` lists 8 PDFs, from 0.1.0-RC through v0.8.0. Latest release v0.8.0 was published 2026-10-20.

OpenAPI says a missing row means no audit at the portal source. Scout matches that source. The six later PDFs are a portal coverage gap. A Scout issue that says Scout lists 2 of 8 states a mirror as a wrong record.

`/api/research?q=OpenZeppelin Stellar Contracts v0.5.0 audit` at 21:51:34Z returned the same two library audits. I did not re-check the Blend control.

No Scout issue asks for vendor-folder ingestion. Open #562 is a generic coverage watch.

Exact fix: retarget the record to `Inferara/soroban-security-portal` with an intake override. Ask the portal to ingest the six missing OpenZeppelin PDFs. Say Scout repeats the portal. Keep a second Scout source as optional follow-up, in a separate finding if you still want it.

## sls-109 — FIX-THEN-FILE

`GET /api/repos/search?q=scaffold%20stellar&limit=50` at 2026-11-02T21:51:09Z returned 25 strict hits. Ranks 1 to 5 match the file (scores 27, 16, 15, 24, 16). `stellar-scaffold/cli` is rank 16, score 77, 53 stars, `canonical` false. It is in the result set. The file says it is absent. That sentence is false.

`q=stellar%20scaffold%20cli` at 21:53:04Z ranks `stellar-scaffold/cli` first (77, 53 stars). `GET /api/repos/trust?repo=theahaco/scaffold-stellar` at 21:51:33Z returns 404, `not in the index`. `gh api repos/theahaco/scaffold-stellar` resolves to `stellar-scaffold/cli`.

`q=stellar%20lab&limit=5` at 21:51:10Z matches the file's top 5. `stellar/laboratory` is absent there. `q=laboratory&limit=3` at 21:53:05Z ranks `stellar/laboratory` first, score 88, 112 stars.

`q=smart%20contract%20examples&limit=5` at 21:51:11Z: policywright (score 51, 1 star), TrustLine-id/stellar-sdk (49, 0), stellar/passkey-kit (92, 3), stellar/smart-account-kit (85, 4), stellar/soroban-examples (63, 149). The file says soroban-examples is behind repositories with 0 or 1 star. Ranks 3 and 4 are Stellar kits.

Eight control queries at 21:53:06Z to 21:53:12Z each put the canonical repo first: `stellar/rs-soroban-sdk`, `stellar/stellar-cli`, `stellar/stellar-core`, `stellar/js-stellar-sdk`, `stellar/freighter`, `stellar/anchor-platform`, `stellar/stellar-rpc`, `stellar/stellar-horizon`.

No open issue names this ranking case. Closed #436 and #843 do not.

Exact fix: say `stellar-scaffold/cli` is rank 16 of 25, score 77. Name passkey-kit and smart-account-kit above soroban-examples. Keep the canonical-map recommendation.

## sls-110 — FIX-THEN-FILE

`GET /api/hackathons/hackmeridian-2026` at 2026-11-02T21:51:31Z still has qualitative `rules.judgingCriteria` only. `source` is `https://hackmeridian.com`. `checkedOn` is 2026-10-20.

`GET https://www.hackmeridian.com/build` at 21:55:42Z says: "One rubric scores every project. Each criterion is scored 1–5." The weights are Track Alignment / Ecosystem Alignment 20%, User Value & Problem 20%, Technical Execution 15%, Innovation 15%, Hackathon Progress 10%, Market & Ecosystem Potential 10%, Product Design & UX 10%.

The winner-track claim does not reproduce. `GET /api/hackathons/hackmeridian-2025` at 21:51:33Z has six winners and every `track` is set: Lance, Star Lends, and Panorama Block are Composability; The Simple Fund, 4Bridge, and Stellar Forge are Open Innovation. Ranks are 1, 1, 2, 2, 3, 3. `description` is null on each row. The SDF blog at 21:55:44Z names those same placements. Filing the track half would ask for data that is already present.

No finding already covers the rubric weights.

Exact fix: delete the track claim, the track recommendation, and the "two rows read 1st Place" title clause. File the missing weighted rubric only.

## sls-111 — FILE

`GET /api/projects/search?scfAwarded=true` paged at 2026-11-02T21:57:04Z to 21:57:08Z: 613 rows, 24 with round 45. The 24 names match the file.

`GET https://communityfund.stellar.org/projects?tab=all-rounds` at 21:55:49Z (2,402,635 bytes) has 40 `SCF #45` badges and 40 distinct `/project/` slugs. All 16 slugs named in the evidence are in that set, including `liqvid-hrr`, `enable-duq`, and `rumble-fish-software-development-rfp-6z9`. The zkella slug is `zkella-protocol-compliance-ready-confidential-finance-infrastructure-for-stellar-sib`.

`GET /api/projects/search?q=Liqvid` at 21:58:29Z: current slug `liqvidxyz`, `scfAwardedRounds` `[37]`, `scfAsOf` `2026-10-03`, `scfSourceUrl` `https://communityfund.stellar.org/project/liqvid-hrr`. That page, fetched 21:55:49Z, has `"lastAwardedRound":45` and `"buildAwardRounds":["SCF #30","SCF #37","SCF #44","SCF #45"]`.

Enable at 21:58:30Z has `scfAwarded` false and `scfAwardedRounds` `[]`. Its SCF page has rounds 43 and 45. Rumble Fish at 21:58:31Z has empty rounds. Resolve at 21:57:08Z to 21:57:12Z: Pollar, Pods, AgentSmith, Principal, and Canary Protocol are `found` false.

40 minus 24 is 16. The file's 13 missing records plus 3 stale records match that gap. Resolved sls-058 is an older field-shape fix. No open issue names SCF #45. Open #562 is a generic coverage watch.

Exact fix: none. Name the current Liqvid slug `liqvidxyz` in the evidence when you file.

## sls-112 — FILE

`GET /api/projects/resolve?q=Chainlink` and `?q=MetaMask` returned `found` false (generatedAt 2026-11-02T21:51:08Z and 21:51:10Z).

`q=chainlink` at 21:51:08Z has `total` 1. The strict row is Chainlink Oracles Relayer, a VRF relayer, `statusSourceUrl` `https://docs.relink.services/`.

`q=metamask` at 21:51:08Z returns Stellar-MetaMask, the Snap, `productKind` `integration-kit`. Other hits mention MetaMask and are other products.

`GET https://docs.chain.link/data-feeds/stellar` at 21:55:42Z says Data Feeds are on Stellar Testnet and Stellar Mainnet. Testnet proxy `CBUF6IADAWPWIDWRTHJNINKXHG2UTIQ6TU2F2HRAXWAI7OT3KJPKK6O4`. Mainnet proxy `CDQBHEUGLDHMSUHG4IH33RJBUTMNCZOT4JIAQR4WZFRDZW6DR6S32ZLZ`. The changelog page at 21:55:43Z is dated Sep 29, 2026.

`GET https://support.metamask.io/configure/networks/stellar` at 21:55:43Z says: "MetaMask supports Stellar as a default network, allowing you to manage XLM and other assets."

Closed #514 and #519 are sls-029 and sls-033. They do not add these records.

Exact fix: none. Two missing records on one directory surface can stay in one issue.

## sls-113 — FILE

`GET /api/projects/search?type=DEX&limit=100` at 2026-11-02T21:53:05Z returned 47 rows, 38 Live. Live `venueRole`: null 31, `amm` 4 (Soroswap, Aquarius, Phoenix, Sushi), `trading-ui` 2 (StellarTerm, StellarX), `wallet-integrated` 1 (Scopuly). No `native-orderbook` and no `aggregator-router`.

`?type=DEX&venueRole=amm&limit=3` at 21:51:34Z warned: `Unknown parameter(s) ignored: venueRole.` Supported params are `q`, `category`, `type`, `status`, `scfAwarded`, `limit`, `offset`.

OpenAPI `venueRole` enum matches the file. It says null means not yet classified, and it tells callers to count `amm` and `native-orderbook`. The empty values are a data gap. The ignored parameter is specified behavior, and the filter request can stay as a recommendation.

Closed #517 (resolved sls-035) is the older DEX-cluster question. It does not cover this null rate.

Exact fix: none.

## sls-024 — DROP the new recurrence

The counts are true. `GET /api/projects/search?status=Live` paged at 2026-11-02T21:54:25Z to 21:54:32Z: 849 rows. `deployment.network` is `unknown` on 755, `mainnet` on 93, and `testnet` on 1. Of the unknown rows, 521 have `supportedNetworks` `['stellar']`, 14 have `['Stellar']`, and 201 have `[]`. Nineteen more name other chains. Those lists name chains.

OpenAPI `deployment` says `network` `unknown` means no evidence either way. The finding's own current state already says those unknown rows are explicit unknowns. The open residual is positive network claims that lack provenance. This recurrence calls the unknown population that residual.

Exact fix: delete the HackMeridian R10/R15 recurrence. Do not open a new finding for it.

## sls-098 — MERGE-INTO sls-098

Keep the title change and the new evidence.

`GET /api/partners?all=true` at 2026-11-02T21:54:32Z: 47 partners. All 34 with `tomlFetchedAt` null have `seps` null on the list, including Bitso, Honey Coin, Coins.ph, and Yellow Card.

Detail `GET /api/partners/{slug}` at 21:54:32Z returned `seps` `[]` and `tomlFetchedAt` null for `anchor-bitso`, `anchor-honey-coin`, `anchor-coins-ph`, and `anchor-yellow-card`. Bitso and Honey Coin have `rampTypes` `['on-ramp','off-ramp']`. Anclap has `tomlSourceUrl` `https://anclap.com/.well-known/stellar.toml` and `seps` `['sep-6','sep-24']`. That toml, fetched 21:55:55Z, has `TRANSFER_SERVER` and `TRANSFER_SERVER_SEP0024`.

OpenAPI says null means the SEP-1 file was not fetched, and `[]` means it was fetched and implements none. `[]` plus ramp types is the proprietary-API claim.

`https://bitso.com/.well-known/stellar.toml` and `https://honeycoin.app/.well-known/stellar.toml` returned HTTP 404 at 21:55:55Z.

`https://anchors.stellar.org/` at 21:58:11Z lists Bitso with `toml_file` null and `supported_standards` of one entry: `SEP-31: Cross-Border Payments`. I found no SEP-24 entry for Bitso.

Exact fix: none. The record is still `verified` and unfiled, so the title edit stays local.

## ll-006 — DROP the new recurrence

Issue `lumenloop/lumenloop-backend#18` is open. `updatedAt` is 2026-07-13. It has one comment.

I could not re-run the semantic query. `GET https://api.lumenloop.com/v1/tools/search_content_semantic` at 2026-11-02T21:58:10Z says the tool is guest and unmetered. `POST` of the same path with no bearer returned HTTP 401, `Missing or malformed Authorization`. The local `LUMENLOOP_API_KEY` is a placeholder. I did not call a paid lane.

The Friday-roundup story may be true. This review does not prove it. The right home is still ll-006, after a live call.

Exact fix: remove the 2026-11-02 recurrence until `search_content_semantic` is run again and the eight article titles are quoted from that response. Do not comment on #18.

## sd-063 — MERGE-INTO sd-063

`GET https://developers.stellar.org/docs/learn/fundamentals/contract-development/storage/state-archival.md` at 2026-11-02T21:50:41Z, line 176, still says ``current_ledger_number + 4095`` for persistent entries. The same settings fetch as sk-034 shows `min_persistent_ttl` 2073600. `stellar/stellar-docs#3000` is open (`updatedAt` 2026-11-02T20:40:30Z).

Exact fix: none. Keep the extra evidence line. Do not open a second finding.

## sd-079 — FILE

Filing now is correct. `raven.stellar.org` is the canonical host in this repo's README, `docs/operations.md`, and `wrangler.jsonc` (the buzz hosts are aliases for existing clients).

At 2026-11-02T21:48:49Z both `https://raven.stellar.org/` and `https://raven.stellar.buzz/` returned HTTP 200 with no redirect. `/health` returned 200 on both. `/.well-known/oauth-authorization-server` returned `issuer` `https://raven.stellar.org` on the org host and `issuer` `https://raven.stellar.buzz` on the alias (21:48:49Z and 21:48:50Z). A client that follows the docs authorizes the alias.

`stellar/stellar-docs` `85d2d1b` (main at 21:48:52Z): `docs/build/building-with-ai.mdx` names `raven.stellar.buzz` on lines 10, 25, 31, 37, 45, 53, 64, 75, and 91. Line 37 is `claude mcp add --transport http stellar-raven "https://raven.stellar.buzz/mcp"`. `for-agents.js` line 8 sets `RAVEN_MCP_URL` to that URL. Line 92 links `https://raven.stellar.buzz/playground`. `docs/tools/cli/agent-cli/reference/architecture.mdx` line 141 names the same MCP URL. The live building-with-ai markdown at 21:50:41Z still contains the alias and no `raven.stellar.org`.

`GET https://developers.stellar.org/llms.txt` at 21:50:41Z was 55,669 bytes and contained no `raven` string. The llms.txt sub-claim does not reproduce. `llms-full.txt` at 21:50:42Z was 5,837,175 bytes, with 14 `raven.stellar.buzz` strings and 2 `raven.stellar.org` strings. Those counts differ from the author's 10 and 2. The page text is the source. One finding covers it.

No open `stellar-docs` issue names the host. Closed #2832 added the card.

Exact fix: none. Replace `raven.stellar.buzz` with `raven.stellar.org` in the three source files. Leave `/mcp` and `/playground` as they are.
