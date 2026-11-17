# Item 1.3 probe table

Every probe ran on 2026-11-17 against the local `npm run dev:eval` server (`http://localhost:8787/mcp`,
tree at `a400553d`) or a public page, keyless except step 2 arm (a), which used the Docs assistant key
that `.dev.vars` holds (a read; no model call). Raw trimmed output is in `probes/`. Lumenloop output
keeps ids, titles, public URLs and dates only (partner-tier rule). A leaf stops at the first wording
that returns the target fact, as the plan fixes.

Classes: **reached** (a source Raven reaches holds the fact), **reached, not surfaced** (reached, but
retrieval does not return it for the natural wording), **held by an unreached source**, **stated
nowhere**, **did not reproduce, closed**.

## Step 1: the 11 not-re-run leaves

| Leaf | Wording 1 | Wording 2 | Owning-surface read | Result | Class | Action |
|---|---|---|---|---|---|---|
| `network.protocol-history` | `stellarDocs.search_docs` "Stellar protocol version history and release dates": the Software Versions page ranks 6, section "Software" | not run | `stellarDocs.get_doc_page /docs/networks/software-versions` returns the whole page inside `execute` (147,195 characters, protocols 20 to 29, tail intact). A top-level `return` of the page becomes an artifact (149,564 bytes) that `artifact.read` reads in full | The page cap does not truncate data inside the sandbox | did not reproduce, closed | None. The Raven page-size note in the ledger is answered: the host keeps the artifact |
| `standards.moneygram-ramps` | `scout.matchPartners` "MoneyGram cash-out corridor": HTTP 503 "AI matchmaking isn't available right now" | `scout.getPartners q=moneygram` (the fallback the 503 hint names): row `anchor-moneygram`, SEP-24, "~500K retail locations across 170+ cash-out countries" | `GET /api/partners?q=moneygram&limit=1` (same row; toml fetched 2026-09-29) | The corridor detail is in the Scout row. `matchPartners` still returns 503 | reached; the 503 reproduces | Update the `scout.matchPartners` bullet in "Triage the runtime and client gaps" with today's 503 |
| `standards.exchange-integration` | "exchange integration guide": integration pages for Anchor Platform and SDP, no exchange guide | "pooled accounts deposit memo exchange": `/docs/build/guides/transactions/pooled-accounts-muxed-accounts-memos` ranks 1 | The page says "most custodial services, including cryptocurrency exchanges, choose to use a single pooled Stellar account" and maps deposits with muxed accounts or memos | The target fact (deposit attribution, memos, pooled accounts) is on a Docs page that wording 2 returns first | did not reproduce, closed | None |
| `defi.lending` | `scout.searchResearch` "Blend lending pool structure backstop": SDF blog "Composability on Stellar" (Blend, Script3) and the Certora and Code4rena audits; `lumenloop.search_content_semantic`: id 26 "Blend & Meru Case Study" ("permissionless creation of isolated lending pools ... backstop modules"), id 1997, id 727 | not run | Not needed | Wording 1 returns the target fact in two families | did not reproduce, closed | None |
| `defi.tvl-landscape` | `scout.getLeaderboard sort=tvl limit=12`: Blend 103.7M, Upshift 90.5M, Sentora 69.6M, Aquarius 36.5M, Gami Labs 34.7M ... (898 projects, dataAsOf 2026-11-16) | not run | Not needed | The ranking exists | did not reproduce, closed | `sls-039` stays `declined-upstream`; not re-filed |
| `wallets.landscape` | One Scout project row read: Freighter (`GET /api/projects/search?q=freighter`): fields include `availability`, `availabilityCheck`, `status`, `supportedNetworks` (null), `products`; no contract-token field | not run | Same row | No Scout wallet row carries which wallets support contract tokens. `sls-033` (resolved) delivered enumeration and availability only | stated nowhere (in the rows) | None filed: a new schema field with no case, no demand and no canonical owner source. Row recorded for the Grok attack |
| `ecosystem.sdf` | `scout.searchResearch` "SDF leadership team CEO": the `sdf-org` row for `stellar.org/foundation/team` ranks 1, observed 2026-11-16, but the chunk is "Careers" | "Stellar Development Foundation executive team": the same row, chunk "SDF team: names and current roles" lists the leadership (Denelle Dixon, CEO and Executive Director, and others) | `https://stellar.org/foundation/team` lists the same roles | Wording 2 returns the names, observed 2026-11-16 | did not reproduce, closed | None |
| `ecosystem.sdf-mandate-holdings` | `stellarDocs.search_docs` "SDF mandate XLM holdings": `/docs/learn/fundamentals/lumens` ranks 1 | not run (plan) | The Docs Lumens page says the Dashboard API (`dashboard.stellar.org/api/v3/lumens`) "will always have the live totals" and carries a snapshot "As of July 21st, 2026" | The page holds a dated snapshot and points to the live source. The live figure is not on a page Raven reaches | held by an unreached source (decision 6(b)) | Class only; nothing filed |
| `ecosystem.xlm-staking-rewards` | `stellarDocs.search_docs` "does XLM have staking rewards": Lumens page rank 1 (inflation ended 2019), no staking statement; Lumenloop: id 12902 "XLM Rewards Pool Explorer" (`stellar.org/xlm-utility`) and the 2019 Binance staking items | "Stellar inflation ended staking yield XLM": Lumens page, Ledgers page ("inflation operation was deprecated ... Protocol 12") | `stellarOrg.get_page /xlm-utility`: "Model how network growth, fee levels, and funding choices could support rewards for locked XLM over ten years" with a whitepaper link (a PDF; no reader on this host) | The 2026 rewards proposal is reached. No reached source states plainly that XLM has no protocol staking | half reached; half stated nowhere | No finding: the negative claim has no primary source read. Dated TODO line: read the whitepaper for the staking status |
| `ecosystem.history-origins` | `lumenloop.search_content_semantic` "Stellar Ripple fork 2014 history": ids 4640 (CoinDesk 2014-12-09), 5374 (Decrypt 2018-09-14, "both born from the same 2014 fork"), 4641, 12046 | not run | Not needed | The history is held | did not reproduce, closed | None |
| `ecosystem.xlm-markets` | `lumenloop.search_content_semantic` "XLM ETP exchange traded product": id 4800 (CoinDesk 2025-10-14, WisdomTree physically backed Stellar Lumens ETP), id 5569 (Valour ETPs, 2025-06-18) | "Grayscale Stellar Lumens Trust": id 5536 (OTC Markets, 2021-10-18) | Not needed | Regulated products are held | did not reproduce, closed | None |

## Step 2: SEP-7 three-way (`standards.payment-patterns`)

Rule fixed before the read: page absent from arm (a)'s 50 (or ranked below 20 in arm (b)) for a query
that holds the page's exact string files a `docs-search` finding; in (a)'s top 20 and missing from (b)
is a Raven item; otherwise no defect. `probes/sep7-three-way.json`.

| Query | (a) Mintlify, `pageSize` 50 | (b) `stellarDocs.search_docs`, `hitsPerPage` 20 | Verdict |
|---|---|---|---|
| `web+stellar:pay payment request QR code` | 43 sections, `/docs/build/apps/wallet/sep7` absent | 20 hits, absent (candidates 43) | absent from (a)'s 50 and the page holds the string: `docs-search` finding `sd-112` |
| `web+stellar:pay` | 38 sections, page rank 1 | page rank 1 | no defect |

Raven's scoping is not the cause: (a) already lacks the page.

## Step 3: the two snippet-only rows (cases opened: `q-soroban-contract-id-derivation`, `q-sep-45-contract-auth`)

| Row | Does any reached source state the fact? | Evidence | Class | Action |
|---|---|---|---|---|
| `q-soroban-contract-id-derivation` | Yes, in two forms. `/docs/learn/fundamentals/contract-development/contract-interactions/stellar-transaction`: "The 32-byte contract identifier is based on `contractIDPreimage` value and the network identifier" and `CONTRACT_ID_PREIMAGE_FROM_ADDRESS` "using the provided address and salt". `/docs/tokens/stellar-asset-contract`: "the sha256 hash of `HashIDPreimage::ENVELOPE_TYPE_CONTRACT_ID` xdr". `/docs/build/guides/conventions/deploy-contract`: same deployer and salt give the same address | Crawl of the 196 pages in `llms.txt` plus `gh search code ContractIDPreimage repo:stellar/stellar-docs` (4 files, head `62f29bbb`). The question wording ranks the deployer pages (ranks 1 to 4); a query with `contractIDPreimage` does not return the page in the top 10; `HOST_FUNCTION_TYPE_CREATE_CONTRACT` returns it at rank 1 | reached, not surfaced | The old claim "no checked page states the formula" is wrong. Dated TODO reachability line. No finding; no golden edit (the golden's key facts match the page) |
| `q-sep-45-contract-auth` | The SEP file states the status: `Status: Draft`, `Version: 0.1.1`, `Updated: 2025-12-16` (read today). Scout research returns the SEP preamble at rank 1 and the Docs SEP-45 guide. The Docs guide `/docs/platforms/anchor-platform/sep-guide/sep45` states the SEP-10 relation, not the status | `probes/sep45-status.json` | reached, not surfaced (research lane) | Add the row as evidence under the held research-lane TODO item. No new item, no finding, no golden edit |

## Step 4: Blend audit register

`GET https://stellar.org/api/collections/audits?page=1..7` (the endpoint `/audit-bank/projects` loads) returns 77
records; 4 are "Unnamed record - ..." (3 name Blend only in the report URL; the OtterSec one names nothing).
`stellarOrg.search_site("Blend audit Certora")` returns no Blend audit; `scout.listAudits project=blend` returns 6 Blend reports.
Class: stated nowhere (project name absent from the record). Finding `sd-111`, intake `unclear`, unposted. `probes/stellarorg-audit-register.json`, `probes/scout-listaudits-blend.json`.

## Step 5: Anchor Directory

`stellarDocs.search_docs("Anchor Directory")`: rank 1 `/docs/tools/developer-tools/anchor-tools`, section "[Anchor Directory](https://anchors.stellar.org/?)"; rank 4 `/docs/tools/ramps`; `/docs/learn/fundamentals/anchors` line 13 names `https://anchors.stellar.org`. Class: reached. No golden edit. `probes/anchor-directory.json`.

## Step 7: decision 6(c)

| Gap | Canonical source read live | Host page that undertakes the topic | Result | Class | Action |
|---|---|---|---|---|---|
| `assets.public-sector-cbdc` | `https://bank.gov.ua/en/news/all/natsionalniy-bank-vitaye-pilotniy-proyekt-ministerstva-tsifrovoyi-transformatsiyi-schodo-vipusku-programovanih-elektronnih-groshey`, 15 Dec 2021 18:30, Deputy Governor Shaban: "not directly concerned with issuing the e-hryvnia" | Lumenloop article collection (holds ids 4400, 5407, 4751, 4406 on the pilot; no bank.gov.ua row) | Lumenloop lacks the primary statement | held by an unreached source | `ll-039`, coverage request to `lumenloop/lumenloop-backend` |
| `wallets.scams-phishing` | `https://stellar.org/blog/foundation-news/how-to-protect-yourself-from-scammers` read in full (13,509 characters, updated July 2022) | the same page | The guide does give victim steps: FAQ "I lost money to a scammer. Can you help?" ("contact law enforcement ... FBI IC3"; SDF "does not have the capability to freeze, access, or return tokens"). A natural-language wording ("what should I do if I was scammed lost crypto victim steps") returns the chunk "What you need to know to protect yourself", which holds the same step. The ledger's recommendation ("ask SDF to add an 'if you were scammed' section") rests on an unread guide | reached | No finding. `sd-108` and `sls-117` untouched. The gap row closes as reached |
| `wallets.pi-network` | `https://minepi.com/white-paper/`: uses SCP, names "the Pi blockchain" and "the Pi network", compares its node count with "the Stellar network" | none: no Stellar page names Pi Network or answers "is this coin on Stellar" (196 Docs pages, `stellar/stellar-docs` and `stellar/stellar-protocol` code search 0 files, `stellar.org` sitemap, `stellarOrg.search_site` empty) | No owner page | stated nowhere | `sd-113`, net-new content request, `unclear` intake, unposted |

## Step 8: Scout wallet rows and paging (`probes/scout-live-wallet-rows.json`, `scout-wallet-live-vs-check.json`, `scout-wallet-paging.json`, `scout-paging-variants.json`)

| Check | Result | Action |
|---|---|---|
| 5 `Live` rows with a later `availabilityCheck` (spatium, freelii, bebop, sentit, elsa) | All 5 reproduce: `status` Live (statusAsOf 2026-08-17 or 08-19), `availabilityCheck.result` none-found, `checkedAt` 2026-11-11. Independent re-read: spatium.net and freelii.app have no address; x.com/bebopcash HTTP 404; sentit.io and elsa.care answer 200 and describe other products | `sls-121`, citing the resolved `sls-033` receipt |
| `q=wallet&limit=100`, offsets 0 and 100, run twice | Both runs: total 195; page 2 returns 96 rows (95 remain); 196 rows, 195 distinct; `coca` (id 69b035ad2d04b7c0f26da1a0) appears at ranks 47 and 104 with different `confidence` only. Same with limit 50 and 25. Controls `q=stablecoin`, `q=defi`: no repeat | `sls-122` |

## Step 9: the two other confirmed gaps

| Gap | Wording | Result | Class | Why nothing is filed |
|---|---|---|---|---|
| `ecosystem.chain-comparisons` | "XRP Ledger Unique Node List trust lines destroyed fees compared to Stellar" (Scout research, Lumenloop) | Docs and SCP pages and 2014 fork press; no XRP Ledger fact | held by an unreached source | xrpl.org owns the facts. Decision 6(c) files neither this gap nor a Raven source change |
| `security.regulation-policy` | "SDF position on stablecoin regulation MiCA GENIUS Act" | SDF blog 2023 "MiCA Implementation: Off to the Races", 2025 "From niche to necessity", 2026-05-08 regional post; Lumenloop A/V 2026-10-26 "The Institutional Era of Stablecoins: SDF's Denelle Dixon on RWAs, the Genius Act ..." | partly reached | The 2026 interview is a reachable current statement. No owner-side Policy Hub page naming a current position was found, so there is nothing to ask a source to ingest |
