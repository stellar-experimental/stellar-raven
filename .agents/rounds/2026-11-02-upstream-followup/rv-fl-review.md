> Copy of the Grok filing review. Paths under `tmp/` and the scratchpad are reviewer scratch files and are not committed.

# Independent filing review (2026-11-02)

Reviewer: Grok, distinct from the Codex lanes (fl-s1, fl-s2, fl-lk) and Claude Opus.
Worktree: `improvements-ecosystem-filing-1102` at `b6844fc7`.
No tracked file was edited. Nothing was committed or posted.

Live checks ran from 2026-11-02T22:37Z to 2026-11-02T23:05Z.
Lumenloop API calls were not repeated. Those counts come from the saved responses in `/private/tmp/claude-501/fl-lk-1102/tmp/fl-lk/ll-recheck/` at 2026-11-02T22:36:13Z. Public source was checked separately.

## Summary

| Item | Verdict | Severity | Required change |
|---|---|---|---|
| ll-032 | FILE | NOTE | None |
| ll-033 | FILE | NOTE | None |
| ll-034 | FILE | NOTE | None |
| ll-035 | FILE | NOTE | None |
| ll-036 | FILE | NOTE | None |
| ll-037 | FILE | NOTE | None |
| ll-038 | FILE | NOTE | None |
| sk-030 | FILE | NOTE | None |
| sk-031 | FILE | NOTE | None |
| sls-095 | HOLD | NOTE | Do not file. Comment on merged #1889 that production still misses Varial. |
| sls-096 | FILE | NOTE | None. The 22:30Z fixed-candidate is a false probe. |
| sls-097 | FILE | NOTE | None |
| sls-098 | FILE | NOTE | None |
| sls-099 | FILE | NOTE | None |
| sls-100 | FILE | NOTE | None. The 22:30Z fixed-candidate is a false probe. |
| sls-101 | FILE | NOTE | None |
| sls-102 | FILE | NOTE | None. The 22:30Z fixed-candidate is a false probe. |
| sls-103 | FILE | NOTE | None |
| sls-104 | FILE | NOTE | None |
| sls-105 | FILE | NOTE | None |
| sls-106 | FILE | NOTE | None |
| Resolver `d26045c9` | ACCEPT | NOTE | None before use. Add a test that a live ref cannot skip its comment. |
| cs-002 | RETIRE | NOTE | Retire with `--upstream-ref-gone`. Close the stale TODO. Point three goldens at the resolved ledger. |

Batch note: dry-run titles, first paragraphs, and first recommendation sentences name the surface, the defect, and the smallest correction. Eval ids appear only in the additional evidence list. Lumenloop evidence still says "orchestrator" and cites `tmp/fl-lk/`. That wording is internal. It does not change the ask. I did not require a rewrite.

## Probe false fixed-candidates

`scratchpad/fu/probes.txt` (mtime 2026-11-02T17:37 local, the 22:30Z run) marks sls-095, sls-096, sls-100, and sls-102 fixed-candidate.

The probe parser strips quote marks and does not unescape `\"`. `scripts/improvements-lib.mjs` `unquote` returns the inner text unchanged. The parsed needle for sls-096 starts with character codes 92, 34 (`\"`), not a JSON quote. The live body contains `"id":"layerzero-dvn"` and does not contain the backslash form. The same escape makes the other three needles miss. A miss is classified fixed-candidate.

I re-fetched the four URLs. All four defect strings are present. The lanes were right to keep sls-096, sls-100, and sls-102. sls-095 stays HOLD for #1889, not because the probe cleared it.

## A. Findings

### ll-032 — FILE — NOTE

Owner: `lumenloop/stellar-ecosystem-db` (intake override).

`npm run improvements:file -- --file improvements/lumenloop/ll-032-freighter-varial-rename-stale-record.md --dry-run` exited 0.
Title: `The freighter directory record omits the Varial name and current website`.
First correction: set the title to `Varial` and the website to `varialwallet.com`.

Commands:

- Saved `ll032-get.json`: `title` `Freighter`, `other_names` `[]`, `links.website` `["freighter.app"]`.
- Saved `ll032-search.json`: `match_mode` `semantic`, no `freighter` row.
- `curl` `https://raw.githubusercontent.com/lumenloop/stellar-ecosystem-db/main/projects/freighter.yaml` returned HTTP 200. `title: Freighter`, `other_names: null`, `links.website: freighter.app`.
- `curl` `https://freighter.app/` returned HTTP 301 to `https://varialwallet.com/`.
- `curl` `https://raw.githubusercontent.com/stellar/freighter/master/README.md` returned HTTP 200. The heading is `Varial (formerly Freighter)`.
- `curl` `https://stellar.org/blog/foundation-news/freighter-is-now-varial` returned HTTP 200. The title contains `Freighter is now Varial`. The page contains `October 29`.

Dedupe: `gh issue list` and `gh pr list` on `lumenloop/stellar-ecosystem-db` (all states). Four issues and eight PRs. None name Freighter or Varial. `gh api search/issues` was not required after the full list.

### ll-033 — FILE — NOTE

Owner: `lumenloop/stellar-ecosystem-db`.

Dry-run exited 0.
Title: `The Slender directory description incorrectly says ordinary borrowing requires no collateral`.
First correction: state that ordinary borrowing requires collateral.

Commands:

- Saved `ll033-get.json` description contains `lend and borrow assets without collateral`.
- Raw `projects/slender.yaml` contains the same sentence.
- `curl -L https://www.certora.com/reports/slender` returned HTTP 200. The page says users borrow through an over-collateralized loan.

Dedupe: the full ecosystem-db issue and PR list has no Slender collateral report.

### ll-034 — FILE — NOTE

Owner: `lumenloop/lumenloop-backend` (service default).

Dry-run exited 0.
Title: `search_directory omits the exact Blend match when limit is 1`.
First correction: put an exact slug match before description-only matches, before the limit.

Commands:

- Saved `ll034-blend.json` slugs start `account-demolisher`, `backyard`, `bexo`, `blend`.
- Saved `ll034-blend1.json` returns one row, `account-demolisher`.
- `gh api repos/lumenloop/lumenloop-backend/contents/lumenloop-mcp/src/tools/directory.ts` shows `ORDER BY title` then `LIMIT $2` at lines 114-115.

Dedupe: `gh api search/issues` `repo:lumenloop/lumenloop-backend search_directory limit` returns open issue 29. That issue is broad RWA discovery, not exact-slug priority. No closer match.

### ll-035 — FILE — NOTE

Owner: `lumenloop/lumenloop-backend`.

Dry-run exited 0.
Title: `list_documents silently ignores unknown argument names despite additionalProperties false`.
First correction: reject unknown keys at the shared validation point. For this Zod object, add `.strict()` before `.safeParse()`.

Commands:

- Saved `ll035-a.json` (`time_period`) `pagination.total` is 1192.
- Saved `ll035-b.json` (`period: upcoming`) `pagination.total` is 13.
- Saved `ll035-c.json` (`bogus_arg`) `pagination.total` is 1192. All three have `success: true`.
- `router.ts` line 387 is `z.object(tool.schema ?? {}).safeParse(...)`. There is no `.strict()`.

Dedupe: `gh api search/issues` `additionalProperties OR strict` in `lumenloop/lumenloop-backend` returned no items.

The 1192 and 13 counts are from the saved responses. I did not send a new authenticated request.

### ll-036 — FILE — NOTE

Owner: `lumenloop/lumenloop-backend`.

Dry-run exited 0.
Title: `Indexed Aquarius proposal rows keep an injected title after the source returns 404`.
The rendered title is `Seven indexed Aquarius proposal rows contain the title...` from `upstreamTitle`.
First correction: remove or mark rows 192 through 198 unavailable after the missing sources are confirmed.

Commands:

- Saved `ll036-list.json` has seven rows. Ids 192-198. Each `status` is `processed`. Each title is `<img src=x onerror=alert(1)> w50c`. Source URLs are `https://aqua.network/governance/proposal/693/` through `/699/`.
- `curl https://governance-api.aqua.network/api/proposal/693/` returned HTTP 404.
- `curl https://governance-api.aqua.network/api/proposal/677/` returned HTTP 200. The API itself answers.

Dedupe: `gh api search/issues` `onerror proposal` in `lumenloop/lumenloop-backend` returned no items.

### ll-037 — FILE — NOTE

Owner: `lumenloop/lumenloop-backend`.

Dry-run exited 0.
Title: `get_related_projects reports success for an article id that has no source row`.
First correction: return a generic unavailable-source error when the source gate returns no row.

Commands:

- Saved `ll037-a.json` for `content_id` 99999999 is `success: true`, `data: []`, `error: null`.

Dedupe: open issues 46 and 35 concern string ids and a schema conflict. They do not define this missing-source response. Active `ll-029` records the same empty success as a schema-shape recurrence. Its recommendation does not ask for the unavailable-source error. Do not merge the two findings.

### ll-038 — FILE — NOTE

Owner: `lumenloop/stellar-ecosystem-db`.

Dry-run exited 0.
Title: `The xbull directory record lists Android and iOS without a current store listing`.
First correction: name the current web wallet and browser extension.

Commands:

- Saved `ll038-get.json` description lists web browsers, Android, and iOS.
- Raw `projects/xbull.yaml` contains that sentence.
- `curl https://itunes.apple.com/lookup?id=6705122563` returned HTTP 200 and `resultCount` 0.
- `curl -L https://play.google.com/store/apps/details?id=app.xbull.wallet` returned HTTP 404.

Dedupe: the full ecosystem-db issue and PR list has no xBull store report.

### sk-030 — FILE — NOTE

Owner: `lumenloop/lumenloop-skills` (intake override). Dry-run did not need `--repo`.

Dry-run exited 0.
Title: `Six Lumenloop skill files still name the wallet Freighter and omit Varial`.
First correction: update all eight prose references across the six files.

Commands:

- `gh api` raw reads of the six `SKILL.md` files. Eight `Freighter` lines, at the cited line numbers. No `Varial` line.
  - `stellar-project-dossier/SKILL.md:36`
  - `stellar-ecosystem-digest/SKILL.md:34`
  - `stellar-builder-quickstart/SKILL.md:39` and `:134`
  - `stellar-integration-finder/SKILL.md:34` and `:149`
  - `lumenloop-mcp-connect/SKILL.md:39`
  - `stellar-ecosystem-scout/SKILL.md:33`

Dedupe: `gh issue list --repo lumenloop/lumenloop-skills --state all` returns sk-007, sk-005, and sk-004. None are this rename. PR search hit the search rate limit after the issue list. The issue list is the complete open and closed issue set.

### sk-031 — FILE — NOTE

Owner: `stellar/stellar-dev-skill` (intake override).

Dry-run exited 0.
Title: `skills.stellar.org still publishes the deleted soroban skill with obsolete build guidance`.
First correction: delete `skills/soroban/` from the `gh-pages` branch.

Commands:

- `curl https://skills.stellar.org/skills/soroban/SKILL.md` returned HTTP 200, 71331 bytes, 12 `wasm32-unknown-unknown` lines, zero `wasm32v1-none` lines.
- Git blob SHA of that body is `3c98cb8194d0921ddae7b5a9e1ed895511e968e2`.
- `gh api .../contents/skills/soroban/SKILL.md?ref=4f56f67ffeae71dec79a2a8fc8fe168aa6cf082a` returns the same blob SHA.
- `gh api` contents on default `main` returns HTTP 404.
- Commit `5907afc60100650305355e74632cb5254e1b90bb` is dated 2026-06-29T13:56:20Z and renames `skills/soroban` to `skills/smart-contracts`.
- `curl https://skills.stellar.org/skills/smart-contracts/SKILL.md` returned HTTP 200 and contains `wasm32v1-none`.
- `.github/workflows/deploy-pages.yml` sets `keep_files: true` on `peaceiris/actions-gh-pages`.

Dedupe: `gh search issues --repo stellar/stellar-dev-skill soroban` returned closed skill-text issues (162, 163, and others). None ask to delete the published `skills/soroban/` tree. PR search for this repo was rate-limited. The issue search did not show a duplicate.

### sls-095 — HOLD — NOTE

Owner: `Stellar-Light/stellarlight`.

Dry-run exited 0.
Title: `Scout cannot resolve Varial because the freighter project still uses its former name`.
The recommendation already says to apply merged #1889 and not to file a duplicate.

Commands:

- `curl https://stellarlight.xyz/api/projects/resolve?q=varial` at 2026-11-02T22:37:11Z returned HTTP 200. `found` is false. `subject` and `current` are null.
- `curl .../api/projects/search?q=freighter&limit=3` returns slug `freighter`, name `Freighter`, website `https://freighter.app/`.
- `curl .../api/projects/search?q=varial&limit=5` returns unrelated asset rows (`ars`, `arst`, `kes`, `eurx`, `brl`).
- `gh api repos/Stellar-Light/stellarlight/pulls/1889` shows merged true at 2026-10-31T14:20:47Z. Title: `fix(data): Freighter is now Varial in the directory, the SDK catalog, the skill and repo scans`.
- On current `main`, `REBRANDS.freighter` sets name `Varial` and website `https://varialwallet.com`. `curatedFieldsFor` owns `name`, `shortDescription`, and `links.website` for `REBRANDS`. `IDENTITY_FIX.freighter` adds alias `Freighter`.
- `/api/status` at 22:51Z reports projects `lastUpdatedAt` 2026-11-02T16:50:58Z. The served row is still Freighter. The curation job has not applied the merged rebrand.

Dedupe: `gh api search/issues` `repo:Stellar-Light/stellarlight varial OR freighter rename` returns closed PR 1889 first. The other hits are fork ranking and rename-twin bookkeeping. There is no second open Varial issue.

HOLD stands. The trigger still reproduces, so the record stays `verified`. Do not open a second issue. The allowed follow-up is a verification comment on #1889: production `resolve?q=varial` is still `found: false` after the merge. I did not post that comment.

The 22:30Z probe fixed-candidate is the escaped-needle miss above. It is not evidence that Varial resolves.

### sls-096 — FILE — NOTE

Owner: `Stellar-Light/stellarlight`.

Dry-run exited 0.
Title: `GET /api/rfps?status=open returns two Q3 2026 briefs that the official SCF page removed`.
First correction: remove `layerzero-dvn` and `x402-facilitator-bazaar` from the open brief set.

Commands:

- `curl https://stellarlight.xyz/api/rfps?status=open` at 22:37:12Z returned HTTP 200. `counts.open` is 2. `activeQuarter` is `q3-2026`. Rows include `layerzero-dvn` and `x402-facilitator-bazaar`, both `status` `open`, plus synthetic `scf-round-46`. The body contains the exact probe needle `"id":"layerzero-dvn"`.
- `curl https://raw.githubusercontent.com/stellar/scf-handbook/main/scf-awards/build-award/rfp-track.md` returned HTTP 200. It has no `layerzero` and no `x402`. Under Current Open RFPs it says `October 2026: New Q4 RFPs are coming soon.`
- Commit `e07b4bfce158639f81908f74cfd74ec8d87f051a` is dated 2026-10-16T18:20:46Z.

Dedupe: search hits closed PR 751 (the Q3 rollover that added these briefs) and closed PR 910 (quarter tabs). Neither removes the briefs after the October handbook change. No open duplicate.

### sls-097 — FILE — NOTE

Owner: `Stellar-Light/stellarlight`.

Dry-run exited 0.
Title: `POST /api/partners/match omits its HTTP 502 failure response from OpenAPI`.
First correction: document the existing 502 JSON response in OpenAPI.

Commands:

- `curl -H 'Content-Type: application/json' --data '{"need":"USDC to Mexican peso off-ramp anchor for remittances"}' https://stellarlight.xyz/api/partners/match` returned HTTP 502 and `{"error":"Matchmaking hit a snag. Try the /partners directory filters."}`.
- `curl https://stellarlight.xyz/api/openapi.json` returned HTTP 200, version `1.9.116`. `POST /api/partners/match` lists responses 200, 429, and 503 only.

Dedupe: search for `partners/match 502` returned closed PR 502. That number is a pull-request id, not this contract gap. The title is an eval-cadence change.

### sls-098 — FILE — NOTE

Owner: `Stellar-Light/stellarlight`.

Dry-run exited 0.
Title: `Bitso and Honey Coin partner pages show a stellar.toml badge without a recorded fetch`.
First correction: require a recorded stellar.toml source and a successful fetch before either verification label.

Commands:

- `curl https://stellarlight.xyz/partners/anchor-bitso` returned HTTP 200 and contains `stellar.toml verified`.
- `curl https://stellarlight.xyz/partners/anchor-honey-coin` returned HTTP 200 and contains `stellar.toml verified`.
- `curl https://stellarlight.xyz/api/partners/anchor-bitso` returned HTTP 200. `tomlSourceUrl` is null. `tomlFetchedAt` is null. `seps` is `[]`.
- `curl https://bitso.com/.well-known/stellar.toml` returned HTTP 404.
- `curl https://honeycoin.app/.well-known/stellar.toml` returned HTTP 404.

Dedupe: search for `stellar.toml verified` returned anchor-field and deployment issues. None report this badge-without-fetch pair.

### sls-099 — FILE — NOTE

Owner: `Stellar-Light/stellarlight`.

Dry-run exited 0.
Title: `Scout Soroswap descriptions omit current API venues and do not distinguish Phoenix contract support`.
First correction: update the Soroswap `shortDescription` to the current API venue list.

Commands:

- `curl .../api/projects/search?q=soroswap&limit=3` returned the phrase `(Soroswap, Phoenix, Aquarius)`.
- Phoenix `shortDescription` contains `One of the AMM liquidity sources aggregated by Soroswap.`
- `curl https://docs.soroswap.finance/aggregator/supported-amms.md` returned HTTP 200. Protocols are `soroswap`, `aqua`, `sushi`, `comet`, and `sdex`. Phoenix is absent. `Coming Soon` is absent.
- `curl https://docs.soroswap.finance/aggregator/technical-reference/contracts/aggregator-v3.md` returned HTTP 200 and contains `Phoenix(PhoenixHop)`.

Dedupe: open issue 1905 is null `venueRole` on DEX rows. It does not correct these descriptions.

### sls-100 — FILE — NOTE

Owner: `Stellar-Light/stellarlight`.

Dry-run exited 0.
Title: `The Hana project website and status source point at a domain that now redirects to Wend`.
First correction: set `links.website` and `statusSourceUrl` to `https://www.hanawallet.io/`.

Commands:

- `curl .../api/projects/search?q=hana&limit=3` returned slug `hana`, status `Live`, `links.website` `https://hana.money/`, `statusSourceUrl` `https://www.hana.money/`. The exact probe needle is present.
- `curl https://stellarlight.xyz/api/partners/hana-wallet` returned `websiteUrl` `https://hana.money`.
- `curl https://hana.money/` returned HTTP 307 to `https://www.wendmoney.com.au/`.
- `curl https://www.hana.money/` returned HTTP 307 to the same Wend URL.
- `curl -L https://www.hanawallet.io/` returned HTTP 200. The title is `Hana | Non-Custodial Multi-Chain Crypto Wallet`.
- On `main`, `STATUS_FIX.hana.sourceUrl` and `WEBSITE_FIXES.hana` are `https://www.hana.money/`. `URL_CORRECTIONS["hana-wallet"]` is `https://hana.money`. The comment still says `hanawallet.io` redirects to `hana.money`.

Dedupe: closed PRs 619, 1117, and 426 retain older Hana facts. None describe the Wend redirect.

### sls-101 — FILE — NOTE

Owner: `Stellar-Light/stellarlight`.

Dry-run exited 0.
Title: `GET /api/analyze?dimension=tvl includes stale project values in the total without a warning`.
First correction: add a stale-total warning when a contributing row exceeds the stated refresh cadence.

Commands:

- `curl https://stellarlight.xyz/api/analyze?dimension=tvl` at 22:38:23Z returned HTTP 200. `totalTvlUSD` is 1980381301. `asOf` is 2026-11-02T13:19:15.688Z.
- Spiko contributes 1653789314 with `tvlAsOf` 2026-09-14T10:30:21.591Z. That is 83.5 percent of the total.
- Sentora contributes 10393904 with `tvlAsOf` 2026-08-10T06:16:01.283Z.
- The Blend row method text says values are refreshed weekly.

Dedupe: search for `totalTvl OR stale TVL` did not return a stale-total issue. Closed PR 1876 is a different dead-protocol Live status fix.

### sls-102 — FILE — NOTE

Owner: `Stellar-Light/stellarlight`.

Dry-run exited 0.
Title: `The Blend TVL method URL points at the V1 child instead of the aggregate`.
First correction: set the method URL to `https://defillama.com/protocol/blend` after the parent is confirmed.

Commands:

- `curl .../api/projects/search?q=blend&limit=3` returned `tvlMethodUrl` `https://defillama.com/protocol/blend-pools`, `tvlUSD` 129334939, and `llamaSlugs` `blend-pools`, `blend-pools-v2`, `blend-backstop`, `blend-backstop-v2`. The exact probe needle is present.
- `curl https://api.llama.fi/protocol/blend-pools` returned HTTP 200. Name `Blend Pools`. `currentChainTvls.Stellar` is 42836. `parentProtocol` is `parent#blend`.
- `curl https://api.llama.fi/protocol/blend-pools-v2` returned HTTP 200. `currentChainTvls.Stellar` is 126426901. Same parent.
- `curl https://api.llama.fi/protocol/blend` returned HTTP 200. Id `parent#blend`. `currentChainTvls.Stellar` is 127763657.
- `curl -L https://defillama.com/protocol/blend` returned HTTP 403 to this client. The API parent exists. I did not read the HTML page.

Dedupe: search for `blend-pools` returned unrelated hackathon, stablecoin, and Spectra pulls. No method-URL issue.

### sls-103 — FILE — NOTE

Owner: `Stellar-Light/stellarlight`.

Dry-run exited 0.
Title: `GET /api/analyze?dimension=funding uses an empty snapshot as the funding delta baseline`.
First correction: skip incomplete or unexplained empty snapshots when selecting `previousSnapshot`.

Commands:

- `curl https://stellarlight.xyz/api/analyze?dimension=funding` at 22:37:14Z returned HTTP 200. `previousSnapshot.projectSetHash` is `e3b0c44298fc1c14`. Awarded projects and USD are 0. `snapshotDelta` lists the current projects as added. `totalUSDDelta` is 58585451.99. `deltaUnavailable` is null. Current awarded count is 582.

Dedupe: open issue 520 and closed PR 530 added funding set-delta provenance. They do not say to reject an empty baseline. Open issue 1903 is a different SCF award-count gap.

### sls-104 — FILE — NOTE

Owner: `Stellar-Light/stellarlight`.

Dry-run exited 0.
Title: `GET /api/builders calls a 300-row cap a full set and omits filter-reachable builders`.
First correction: page through all eligible profiles for the unfiltered listing.

Commands:

- `curl .../api/builders?limit=200&offset=0` returned 200 rows, `counts.total` 300, label `no text query: full set (structured filters only)`.
- `offset=200` returned 100 rows and the same total.
- `offset=400` returned 0 rows and the same total.
- `curl .../api/status` reports builders count 399.
- `curl .../api/builders?location=Latin%20America&limit=200` returned 59 rows. 23 `githubUsername` values are absent from the 300 unfiltered rows. The set includes `pedro-pelicioni`, `wrever`, `salazarsebas`, and `DiegoPoveda01`.

Dedupe: search for `builders full set` did not return this cap. Nearby pulls bound other builder sweeps.

### sls-105 — FILE — NOTE

Owner: `Stellar-Light/stellarlight`.

Dry-run exited 0.
Title: `GET /api/rfps source-verification requirements omit the published brief scope and source`.
First correction: link the closed row to its published Q2 brief snapshot and mark the current text as an idea summary.

Commands:

- `curl .../api/rfps?q=source%20verification` returned HTTP 200. Row `contract-source-verification` is `closed`. `technicalRequirements` starts `Deterministic Build: Reproducible WASM compilation pipeline`. `url` is `https://stellarlight.xyz/ideas/contract-source-verification`.
- Raw handbook at `e37c0d541ddbee5f06f152b9cd1f03bbe0321f23` contains `Contract Source Verification Service`, SEP-58, and `bldimg`. The current handbook page is Q4 placeholder text, so the closed row needs the historical snapshot.

Dedupe: search for `contract-source-verification` did not return this scope gap.

### sls-106 — FILE — NOTE

Owner: `Stellar-Light/stellarlight`.

Dry-run exited 0.
Title: `GET /api/hackathons omits the completed Rise In Stellar Pro Hackathon`.
First correction: add that event to the curated set as a completed event.

Commands:

- `curl .../api/hackathons?status=active` returned HTTP 200. Counts are all 0. The summary contains `between events`.
- `curl .../api/hackathons?q=istanbul` and `q=waterloo` returned 0 rows.
- `curl .../api/hackathons?limit=100` returned 27 rows (7 curated, 20 DoraHacks). The body has no `istanbul` and no `stellar-pro`. It does include curated `Stellar Builders Camp, Jaipur` and `APAC Stellar Hackathon`.
- `curl https://www.risein.com/programs/stellar-pro-hackathon` returned HTTP 200. Visible text includes `Sep 18`, `2026`, `Istanbul`, `Prize Pool $15,000`, and `Presented by Stellar`.
- `curl https://uwaterloo.ca/events/events/blockchain-innovation-challenge-powered-stellar` returned HTTP 200 and the title `Blockchain Innovation Challenge powered by Stellar`.

Dedupe: open issue 1902 is HackMeridian rubric weights. Closed PR 1871 renders hackathon pages. Neither adds the Rise In event.

## B. Resolver `--upstream-ref-gone`

Commit `d26045c9` on `improvements-followup-1102` in `/private/tmp/claude-501/fu-1102`.
`npx vitest run test/improvements-resolve.test.ts test/improvements-lint.test.ts` passed. 2 files, 20 tests.

Verdict: ACCEPT. Severity: NOTE.

A live ref cannot skip its comment.

- `--upstream-ref-gone` values must already be recorded refs. An unknown URL fails before any network call.
- Gone URLs are removed from `commentableRefs`.
- If any commentable ref remains, `--upstream-commented` is still required.
- `githubRefIsGone` then runs. It treats a ref as gone only when `gh api repos/<owner>/<repo>/issues/<n> --silent` exits non-zero and stderr matches `HTTP 404`.
- Any other failure stays in `stillResolving` and the command fails. The message says to post the comment instead.
- A URL that does not match the issue-or-PR pattern returns false from `githubRefIsGone`, so it also fails closed.

I checked the GitHub CLI contract:

- `gh api repos/soroswap/docs/issues/47 --silent` exited 1. Stderr was `gh: Not Found (HTTP 404)`. Stdout was empty.
- `gh api repos/stellar/stellar-docs/issues/1 --silent` exited 0. Stderr was empty.

A live ref therefore does not match the 404 test. The command stops.

Check order is safe. The 404 check runs after the comment-flag check and before the receipt is written. Dry-run hits the same check. A live ref marked gone fails even when it is the only ref and `--upstream-commented` was omitted.

The receipt adds `upstreamRefsGone` only when the list is non-empty. Lint requires a non-empty array and requires every entry to also be in `upstreamRefs`. `upstreamRefs` already has the GitHub URL check. That is sufficient.

The skill paragraph matches this behavior. It says the resolver confirms the 404, records `upstreamRefsGone`, and still requires `--upstream-commented` for every other ref.

Test gap, not a behavior bug:

- `refuses a gone ref that the finding does not record` fails before `gh` runs.
- `still requires a comment on every ref that is not gone` fails on the comment flag before `gh` runs.
- No test shows a HTTP 200 ref rejected.
- No test shows a HTTP 404 ref accepted into the receipt.
- No lint test covers `upstreamRefsGone`.

When every recorded ref is gone, neither comment flag is required. The usage line still shows one of the two flags as mandatory. The skill text is the accurate contract. This does not let a live ref through.

## C. cs-002

Verdict: RETIRE. Severity: NOTE.

The original defect was the labels `(currently on Testnet)` and `(Coming Soon)` on the aggregator docs. Those labels are gone.

Commands:

- `curl -D headers https://docs.soroswap.finance/concepts/aggregator` returned HTTP 308 to `/`. The follow returned the docs home.
- `curl https://docs.soroswap.finance/concepts/aggregator.md` returned HTTP 307 to `/.md`, the home markdown.
- `curl https://docs.soroswap.finance/aggregator/supported-amms` and the `.md` variant returned HTTP 200. The venue line is `soroswap, aqua (Aquarius), sushi (SushiSwap V3), comet and sdex`. Counts of `currently on Testnet` and `Coming Soon` are 0. Phoenix count is 0.
- `curl https://docs.soroswap.finance/llms.txt` and `llms-full.txt` (356430 bytes) contain neither stale phrase.
- `aggregator-v3.md` says the old aggregator `CAYP3UWLJM7ZPTUKL6R6BFGTRWLZ46LRKOXTERI2K6BIJAWGYY62TXTO` is deprecated. It also contains `Phoenix(PhoenixHop)`.
- `gh api repos/soroswap/docs --silent` exited 1 with `gh: Not Found (HTTP 404)`. The same result holds for `issues/47`.

The finding evidence says the v3 hop list does not include Phoenix. That sentence is false. The enum includes `Phoenix(PhoenixHop)`. The API venue page still omits Phoenix and does not call it Testnet. That split is the current docs fact. It is not the old false label. sls-099 already asks Scout to separate API venues from contract support. Do not keep cs-002 for the enum line. Do not open a successor unless a page again says Phoenix or Aqua is testnet-only or coming soon.

`rg -n "cs-002"` in the fu worktree. References that must change on retirement:

- `improvements/canonical-source/cs-002-soroswap-aggregator-docs-stale-adapter-status.md` — the resolver deletes it.
- `improvements/intake.json` override `cs-002` — the resolver removes it.
- `improvements/INDEX.md` — the resolver regenerates it.
- `improvements/resolved.json` — the resolver appends the receipt. The only recorded ref is `https://github.com/soroswap/docs/issues/47`. Pass `--upstream-ref-gone` with that URL. Do not pass `--upstream-comment-na`. No comment can be posted. I confirmed the 404 text matches the new check.
- `.agents/TODO.md` section `Repair the cs-002 owner after soroswap/docs disappeared`. Its next check still says to see whether the docs show the stale status. That check is now false. Close the item when the receipt lands. The resolver does not edit TODO.
- Goldens that cite the active file path:
  - `eval/qa/corpus/battery/defi-ecosystem/q-defi-soroswap-what-is.json`
  - `eval/qa/corpus/battery/defi-ecosystem/q-defi-soroswap-vs-stellarx.json`
  - `eval/qa/corpus/battery/defi-ecosystem/q-eco-dex-saturation.json`
  Point those notes at the resolved-ledger id after deletion. Then regenerate `eval/qa/cases.json`, which repeats the same notes.
- Dated files under `research/audits/2026-09-17-routing-audit/` keep the historical id. Do not rewrite them.

The three goldens already say the labels no longer render and that the repository returned HTTP 404. They also still contain the historical phrase `stale Testnet labels (cs-002)` inside that updated note. That phrase records the old page. It is not a live claim. Retirement does not require a truth change beyond the file path.
