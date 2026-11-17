# Item 1.3 Grok attack

Grok 4.7, high. Read-only, keyless, 2026-11-17. Local MCP `http://localhost:8787/mcp` through `tmp/mcp.mjs` (`search` was not required; calls were `execute`). Public pages by HTTPS. No `.dev.vars`, no Mintlify key, no model call. Docs corpus: the 291 `.md` links in `https://developers.stellar.org/llms.txt` (196 under `/docs`, 94 under `/meetings`), fetched the same day.

Verdicts: **knocked down** for rows 6, 8, and 9. **Stands** for rows 14, 15, 16, 17, and 20, and for `sd-112`.

## Row 6 — `wallets.landscape` — knocked down

Claim. No Scout wallet row carries which wallets support contract tokens. Classed "stated nowhere (in the rows)" after one Freighter row read whose listed fields (`availability`, `availabilityCheck`, `status`, `supportedNetworks`, `products`) had no contract-token field.

Tried.

- `GET https://stellarlight.xyz/api/projects/search?type=Wallet&limit=100` (74 rows, `meta.counts.total` 74, `generatedAt` 2026-11-17T01:54:16Z). Walked every string field for `soroban`, `contract`, `smart wallet`, `sep-41`.
- `scout.searchProjects({ q: "freighter", limit: 2, fields: "name,slug,shortDescription" })` on the local server.

Result. The same Freighter row, now named Varial, states the capability in `shortDescription`. The local call returned slug `freighter` and this slice (the word `Soroban` at character 302):

> Users self-custody their private keys to hold, send and receive XLM and Stellar assets and sign Stellar and Soroban transactions, across Mainnet, Testnet and Futurenet.

Other Wallet rows say the same kind of thing in `shortDescription`:

- xBull, slug `xbull`: "sign Stellar and Soroban dApp transactions."
- Hana, slug `hana`: "connect to Stellar and Soroban dApps via Stellar Wallets Kit and the Freighter API."
- MPCVault, slug `mpcvault`: "policy gating, transaction simulation, Soroban smart contract support."

There is still no boolean field. The rows do state which wallets sign Soroban transactions or support Soroban smart contracts. That is the fact the "nowhere in the rows" class denies.

## Row 8 — `ecosystem.sdf-mandate-holdings` — knocked down

Claim. The Docs Lumens page holds a 2026-07-21 snapshot and points at `dashboard.stellar.org`. The live SDF holdings figure is not on a page Raven reaches.

Tried.

- `https://developers.stellar.org/docs/learn/fundamentals/lumens.md` (also in the llms crawl).
- `GET https://dashboard.stellar.org/api/v3/lumens` at 2026-11-17T01:44:58Z.
- `https://stellar.org/foundation/mandate` and `stellarOrg.get_page({ path: "/foundation/mandate" })`. The returned page was 11,411 characters, not truncated, and contained both `2,517,829,170` and `November 16, 2026`.
- Catalog search: no `dashboard.stellar.org` operation. The dashboard host is still unreached. The figure is not only there.

Result. The Docs page snapshot is stale. It shows `sdfMandate` `15563517195.789479` "As of July 21st, 2026", and it tells the reader to use the mandate page for live account balances ("balances change continuously, so refer to the mandate page").

The mandate page tables, read as text from the HTML:

| Bucket | Current balance total | Last updated |
|---|---|---|
| SDF Development | 2,517,829,170 | November 13, 2026 at 9.07 PM UTC |
| Stellar Growth | 5,207,773,194 | November 16, 2026 at 10.07 PM UTC |
| Product and Innovation | 3,332,384,306 | November 16, 2026 at 9.07 PM UTC |
| Assets and Liquidity | 3,264,785,773 | November 11, 2026 at 6.08 PM UTC |

Those four totals sum to 14,322,772,443 XLM. The dashboard response the same day was:

```json
{
  "updatedAt": "2026-11-17T01:44:58.212Z",
  "sdfMandate": "14322772457.7592893"
}
```

The gap is about 15 XLM, the fractional stroops below the page's integer display. `stellarOrg.get_page` returns that page, so the live holdings figure is on a page Raven reaches.

## Row 9 — `ecosystem.xlm-staking-rewards` — knocked down

Claim. The 2026 rewards proposal is reached. No reached source states plainly that XLM has no protocol staking.

Tried.

- The 291 Docs and meetings markdown pages. The only consensus contrast is on `docs/learn/fundamentals/stellar-consensus-protocol.md`: FBA "differs from" Proof of Stake. That page does not say Stellar has no staking.
- `stellarOrg.get_page` on `/xlm-utility` (233 characters): "Model how network growth, fee levels, and funding choices could support rewards for locked XLM over ten years." The proposal half stands as reached.
- `stellarOrg.get_page` on the two SDF posts below. Both returned the phrase (`no staking` on the first, `no concept of staking` on the second).
- `scout.searchResearch({ q: "Hidden Risks of Proof-of-Stake no staking Stellar", limit: 5 })`. Rank 2 was the first post, `src` `sdf-blog`, and the chunk contained "no staking".

Result. Two stellar.org posts state it, and Raven returns both the page and a research chunk.

`https://stellar.org/blog/ecosystem/the-hidden-risks-of-proof-of-stake`:

> The Stellar network was designed for exactly this use case. There's no staking, no protocol yield tied to block production, and no requirement to trust anonymous validators simply because they've posted the most capital.

`https://stellar.org/blog/ecosystem/proof-of-stake-vs-proof-of-agreement-stellars-security-edge`:

> In Stellar’s model, there is no concept of staking tokens or paying a price to become a validator.

The "stated nowhere" half does not stand. The dated TODO to read the XLM-utility PDF is not required for this negative. I did not open that PDF.

## Row 14 — `ecosystem.chain-comparisons` — stands

Claim. Docs, SCP pages, and the 2014 fork press do not state the XRP Ledger facts in the gap wording (Unique Node List, trust lines destroyed, fees compared with Stellar). Those facts are held on xrpl.org.

Tried.

- Docs and meetings crawl: no `XRP Ledger`, `Unique Node List`, or `Ripple`.
- `https://stellar.org/api/search?q=XRP%20Ledger&locale=en` returned ledger-themed Stellar pages, not an XRPL comparison. `q=Unique%20Node%20List` returned one partner, Public Node.
- `scout.searchResearch({ q: "XRP Ledger Unique Node List", limit: 4 })` returned Stellar ledger API pages only.
- GitHub code search, 2026-11-17: `"XRP Ledger"` and `"Unique Node List"` in `stellar/stellar-docs` and `stellar/stellar-protocol` were 0. `Ripple repo:stellar/stellar-docs` was 0. `Ripple repo:stellar/stellar-protocol` was 3 files, and `XRP repo:stellar/stellar-protocol` was 3 files, at commit `379a0b55423d406c20e5378639521930e3ffd935`.
- A code-search hit for `UNL` in `stellar-protocol` (78 files) is the prefix of words such as "unlimited". The first text-match is CAP-0073, "unlimited trustline". It is not the XRP Ledger Unique Node List.

The protocol hits are deposit examples, not the comparison:

- `ecosystem/sep-0006.md`: "Make a payment to Ripple address rNXEkKCxvfLcM1h4HJkaj2FtmYuAWrHGbf" and "If the amount is more than 1000 XRP, deposit will take 24h to complete."
- `ecosystem/sep-0026.md`: a field labeled "Ripple Address".
- `ecosystem/sep-0059.md`: "XRP deposit address".

Those strings do not state a Unique Node List, destroyed trust lines, or a fee comparison with Stellar. The class stands.

## Row 15 and `sd-113` — Pi Network — stands

Claim. No stellar.org or developers.stellar.org page says Pi Network is a separate network. Pi's white paper is the canonical source.

Tried.

- `https://minepi.com/white-paper/` (HTTP 200). The finding's quotes are on the page.
- Docs crawl of all 291 markdown pages, including the 196 `/docs` pages the finding counted: no `Pi Network`, `minepi`, or `Pi coin`.
- `https://stellar.org/sitemap.xml`: no `pi-network` or `minepi` URL.
- `GET https://stellar.org/api/search?q=Pi%20Network&locale=en`: 0 results.
- `stellarOrg.search_site({ query: "Pi Network" })`: soft-empty ("no rows for this query"). Soft-empty alone is not absence. The sitemap and the site API are.
- `scout.searchResearch({ q: "Pi Network separate blockchain", limit: 4 })`: SCP paper and unrelated Stellar posts. No Pi Network.
- `lumenloop.search_content_semantic({ query: "Pi Network", types: ["articles","research"], limit: 5 })`: PigFi, Pyth, a quantum-resistance post, and other Stellar items. No Pi Network.
- GitHub code search: `"Pi Network"`, `minepi`, and `"Pi coin"` in `stellar/stellar-docs` were 0. `"Pi Network"` in `stellar/stellar-protocol` was 0.

White paper quotes, same URL:

> the Stellar Consensus Protocol emerges as the leading candidate to enable user-friendly, mobile-first mining.

> One ambition of the Pi project is to scale the number of nodes in the Pi network to be larger than the number of nodes in the Stellar network.

> a trust graph of Security Circle aggregates that will feed the consensus algorithm of the Pi blockchain.

A maintainer can act on the request only by choosing a page. The finding already says there is no page to correct, and that is still true. Nothing here names Pi on a Stellar host page.

## Row 16 — `security.regulation-policy` — stands

Claim. SDF blog posts and a 2026 interview are reachable. No owner-side Policy Hub page names a current position on stablecoin regulation, MiCA, or the GENIUS Act.

Tried.

- Sitemap: `https://stellar.org/policy-hub` and `/policy-hub/briefs`, `/payments`, `/tokenization`, `/public-blockchains`. Fetches of `/policy-hub/tokenization` and `/policy-hub/public-blockchains` ended on `https://stellar.org/policy-hub`.
- `stellarOrg.get_page({ path: "/policy-hub" })` returned 1,050 characters. It is a spotlight list (2025 briefs on payments, tokenization, and DeFi, plus links such as "What critics still get wrong about stablecoins?"). The text does not contain `GENIUS` or `MiCA`.
- `stellarOrg.get_page({ path: "/policy-hub/briefs" })` returned 365 characters, three brief titles, and neither word.
- `GET https://stellar.org/api/search?q=GENIUS%20Act&locale=en`: 0 results.
- `https://stellar.org/insights/addendum-to-the-blockchain-sustainability-framework-eu-mica-regulation` is a sustainability addendum. Its description is an environmental-footprint benchmark, not a stablecoin-regulation position.
- `scout.searchResearch({ q: "SDF GENIUS Act stablecoin position", limit: 4 })` returned Lumenloop news ("GENIUS Act Passes House", "From niche to necessity"), not a Policy Hub page.

The "partly reached" class stands. There is a Policy Hub. It does not name a current GENIUS or MiCA position.

## Row 17 and `ll-039` — NBU statement — stands

Claim. Lumenloop holds news on the 2021 TASCOMBANK and Bitt pilot and does not hold the NBU statement that the pilot is not the e-hryvnia.

Tried.

- `https://bank.gov.ua/en/news/all/natsionalniy-bank-vitaye-pilotniy-proyekt-ministerstva-tsifrovoyi-transformatsiyi-schodo-vipusku-programovanih-elektronnih-groshey` (HTTP 200). Title: "NBU Welcomes Ministry of Digital Transformation’s Pilot Project to Issue Programmable Electronic Money".
- `lumenloop.search_content_semantic` for "not directly concerned with issuing the e-hryvnia Shaban", articles, no source filter, and the same idea with `sources: ["bank.gov.ua"]` (0 rows).
- `stellarOrg.get_page` on the 2021-12-14 SDF press path. The page does not contain "not directly concerned".
- The 2023-01-12 SDF press page, read as HTML text.
- `https://decrypt.co/88221/ukraines-central-bank-runs-digital-currency-pilot-using-stellar` (HTTP 200).

NBU sentence, on the bank.gov.ua page:

> This pilot project is not directly concerned with issuing the e-hryvnia, the NBU’s digital currency. Under new legislation, the NBU is the only authority that can issue the e-hryvnia.

The bank.gov.ua filter returned no row. The unfiltered search returned ids 4751 (CoinDesk, 2021-12-14), 4732 (CoinDesk, 2021-01-04), 4400 (SDF press, 2021-12-14), and 4406 (SDF press, 2023-01-12). None of those snippets contain the sentence. The 2021 SDF press says the pilot is "under the supervision of the National Bank of Ukraine". The 2023 press quotes Shaban on "many hypotheses to study and test", not on the e-hryvnia boundary. The Decrypt article's visible title is "Ukraine’s Central Bank Oversees Digital Currency Pilot Using Stellar", and the body I fetched does not contain "not directly concerned", "Shaban", or "e-hryvnia".

A reader of the held rows still does not get the NBU correction. Ingesting the bank.gov.ua item is something a maintainer can do. The optional "link it to Decrypt id 5407" step depends on a relation the finding already marks as optional.

## Row 20 and `sd-111` — unnamed audit records — stands

Claim. 4 of 77 stellar.org audit-register records are titled "Unnamed record", so a project-name search cannot find them. Three report URLs contain `blend`. The OtterSec URL names no project.

Tried.

- `GET https://stellar.org/api/collections/audits?page=1..7&locale=en`. `meta.total` 77, 7 pages, 77 distinct ids. 73 titles are not "Unnamed record". 4 are.
- `GET https://stellar.org/api/search?q=Unnamed%20record`, `q=Blend%20audit`, `q=Blend`, and `q=Certora%20blend`.
- `scout.listAudits({ project: "blend" })` and `{ auditor: "OtterSec" }`.

The four records, from the collection payload (`title`, `publicationDate`, `reportLink.href`; no project field; image `alt` empty):

| id | title | date | report URL |
|---|---|---|---|
| `audit-recE9SyJrESqxO9VO` | Unnamed record - Certora Ltd | 2023-11-13 | `https://www.certora.com/reports/blend` |
| `audit-recwvHNnj7iJRDFrp` | Unnamed record - Certora Ltd | 2025-02-03 | `https://www.certora.com/reports/blend-smart-contract-verification-report` |
| `audit-recVvSfnpl1PXfHaL` | Unnamed record - Certora Ltd, Code4rena / Zellic | 2025-03-17 | same Certora verification-report URL |
| `audit-recm9Dovfv5WWeQjL` | Unnamed record - OtterSec | 2024-02-29 | `https://ottersec.notion.site/Sampled-Public-Audit-Reports-a296e98838aa4fdb8f3b192663400772?p=67a31c2a91c048c9bc3822c2b5ff105d&pm=s` |

`q=Blend` and `q=Blend%20audit` returned no audit record (`Blend audit` returned one partner row). `q=Unnamed%20record` returned these four. The project name is not in the record. The class stands.

Scout's Blend list is a different corpus, as the finding says. It returned 6 rows, including `Blend Protocol: OtterSec (Blend Capital Security Assessment)`, project `blend`, date `2024-02-28`. That is one day before the unnamed OtterSec register row. I did not open the Notion page, so I am not treating that Scout row as proof of the register row's project.

## `sd-112` — SEP-7 search — stands

Claim. Docs search omits `/docs/build/apps/wallet/sep7` for `web+stellar:pay payment request QR code`, and ranks it first for `web+stellar:pay`. The page holds `web+stellar:pay` three times, does not hold `QR`, and says "request to pay" rather than "payment request".

Tried. No Mintlify key. The Raven tool only.

- `stellarDocs.search_docs({ query: "web+stellar:pay payment request QR code", hitsPerPage: 20 })`: `candidates` 43, `sep7` absent. First paths were the SEP-10 tutorial, `do_stellar_payment`, and x402 pages.
- `stellarDocs.search_docs({ query: "web+stellar:pay", hitsPerPage: 5 })`: first path `/docs/build/apps/wallet/sep7`.
- `GET https://developers.stellar.org/docs/build/apps/wallet/sep7.md` (HTTP 200, 12,445 bytes). `web+stellar:pay` occurs 3 times. The page has "The pay operation represents a request to pay a specific address" and does not contain `QR` or `payment request`.

The search miss reproduces on Raven's path. A maintainer can act on either recommendation (ranking of the rare token, or adding the reader's words to the page).

The page is reached for the bare string, which the classification already says. This attack does not change that.

## Other defects in the findings

`ll-039` undercounts the held Ukraine rows. Besides 4400, 5407, 4751, and 4406, the same search returned id 4732, CoinDesk, 2021-01-04, "Ukraine Government Picks Stellar Development Foundation to Help Build National Digital Currency", URL `https://www.coindesk.com/business/2021/01/04/ukraine-government-picks-stellar-development-foundation-to-help-build-national-digital-currency`. Its snippet says the National Bank of Ukraine will use Stellar for a CBDC. That is another held central-bank framing, and it is not the bank.gov.ua correction. The coverage request still stands.

`sd-111`. `GET https://stellar.org/api/search?q=Certora%20blend&locale=en` does return the three unnamed Certora records, mixed with named Certora audits, because `blend` is in the report URL and `Certora` is in the title. A search that is only the project name (`Blend`, `Blend audit`) still returns no audit record. The sentence "a project-name search cannot find them" is true for the project name alone.

The OtterSec recommendation says "name the audited project" and does not say which project. The register URL has no project slug. Scout's nearest named row is the 2024-02-28 Blend Capital assessment above. A maintainer cannot fill that title from the finding text alone.

`sd-112`. `https://developers.stellar.org/llms.txt` lists 196 `/docs` pages and does not contain `sep7`. The SEP-7 page is absent from the index that page tells readers to fetch. That is separate from the search-ranking miss, which still reproduces.

`sd-113`. The quoted white-paper sentences, the 196-page docs count, the empty GitHub code search, and the empty stellar.org search all matched this re-check. No wording defect turned up.
