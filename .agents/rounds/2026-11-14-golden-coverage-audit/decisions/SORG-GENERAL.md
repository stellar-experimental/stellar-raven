# SORG-GENERAL: is the stellar.org source general, or fitted to the goldens?

Lane `sorg-general`, Claude Opus 5.5, 2026-11-14. Brief:
[`briefs/sorg-general.md`](../briefs/sorg-general.md). Branch `feat/stellar-org-source` (PR 439).
No golden case or `eval/qa/corpus/` file was read. No model-calling eval, deploy, or upstream post.
**The independent review of this change is outstanding**; the orchestrator assigns it.

## Verdict

The adapter was fitted, and it is now general. It returned the answering row for 25 of 40
general questions. The site's own search returns that row for 33 natural questions and 37 keyword
forms. The whole gap came from three row kinds the adapter dropped: audit records, tutorials, and
partner listings. The adapter now keeps them, and its recall equals the raw search at top 5 and
top 10 for both forms.

What still limits the source is outside the adapter:

1. **Routing reach.** Raven's catalog `search` ranks a `stellarOrg` operation in the top 5 for only
   7 of the 40 questions, before and after this change. A model has to pick the family on its
   own, from the micro-map or a `service: "stellarOrg"` search.
2. **Body text.** The keyless search matches title, description, and tags. 12 of 21 body-text
   phrases miss their page. That is the case for the Algolia index.

## Numbers

Query set: [`research/services/stellar-org-queries.json`](../../../../research/services/stellar-org-queries.json).
It has 40 questions: 14 on audits and security, 13 on application development, and 13 on SDF
programs, policy, learn pages, and partners. Each question names the page or record that answers
it, confirmed by reading the page or record. Each question has a natural form and a short keyword
form. The answer kinds are 29 pages, 8 audit records, 3 tutorials, and 3 partner listings.

All counts come from one live snapshot of the 80 search responses, taken 2026-11-14. "Raw" means
the answering row is in the site search's own top N. "Adapter" means it is in
`stellarOrg.search_site` hits at `limit: 10`. Top 5 is the adapter's default page.

| Form | Group | Raw @5 | Raw @10 | Adapter before @5 | before @10 | Adapter after @5 | after @10 |
|---|---|---|---|---|---|---|---|
| question | audit (14) | 10 | 10 | 6 | 6 | 10 | 10 |
| question | appdev (13) | 12 | 12 | 9 | 9 | 12 | 12 |
| question | programs (13) | 11 | 11 | 10 | 10 | 11 | 11 |
| question | **all (40)** | **33** | **33** | **25** | **25** | **33** | **33** |
| keyword | audit (14) | 13 | 13 | 6 | 6 | 13 | 13 |
| keyword | appdev (13) | 12 | 12 | 9 | 9 | 12 | 12 |
| keyword | programs (13) | 11 | 12 | 10 | 10 | 12 | 12 |
| keyword | **all (40)** | **36** | **37** | **25** | **25** | **37** | **37** |

- **The gap, before.** The old adapter lost 8 question forms and 12 keyword forms the site had
  found. Audit rows account for 4 question and 7 keyword losses, tutorials for 3 and 3, and
  partner rows for 1 and 2. Audit questions fell from 10/14 to 6/14, and the six it still
  answered were all about Audit Bank or bug-bounty pages.
- **Ranks improve after.** Dropping blog, press, and events rows lifts 21 of 70 found answers by
  one or more ranks. "MoneyGram partner" moves from raw rank 9 to adapter rank 3, which is why
  keyword programs at top 5 reads 12, above the raw 11.
- **Partner rows, measured.** Without them, the after numbers fall to 32/40 for questions and
  35/40 for keywords: p13 (question) and p11 and p12 (keyword) are lost. Keeping them pushes no
  answer out of the default top 5. Scout `getPartners` holds Soroswap and MoneyGram but not the
  Flutter Wallet SDK, so the stellar.org rows are not redundant. Decision: keep them, one hit per
  partner, with the directory categories as tags. The site returns one row per category; MoneyGram
  takes three of ten.
- **Blog, press, and events filter, measured.** The 40 natural-question responses held 230 rows
  under those prefixes (379 across all 80), a median of 6 of 10 per question. For 10 sampled questions, Scout
  `searchResearch` and Lumenloop `search_content_semantic` (production Raven, read-only) each
  returned at least one stellar.org post under those prefixes; Lumenloop returned 1 to 9 per
  question. They returned the site's highest-ranked post in 6 of 10, and 17 of the 80 filtered
  rows exactly. Most filtered rows were lexical noise, such as "smart contracts on stellar" for a
  question about the Spiko audit. Decision: keep the filter. Evidence:
  [`sorg-general/cross-source-urls.json`](../sorg-general/cross-source-urls.json).
- **Raven routing reach** (catalog `search`, the natural question, limit 12, any `stellarOrg`
  operation): top 5 for 7/40 before and 7/40 after; top 12 for 12/40 before and 14/40 after. A
  broader `search_site` description that named products, case studies, tutorials, and the audit
  register raised top 5 to 9/40. It also changed 18 routing top-five lists, so it was not kept.

## What changed

- [`src/adapters/stellar-org.ts`](../../../../src/adapters/stellar-org.ts) `siteHits` keeps rows
  in site order by kind:
  - `page`: as before, `{ kind, title, description, path, tags }`.
  - `audit`: `{ kind, title, project, firm, reportUrl }`. Project and firm split at the last
    ` -`. `Unnamed record` becomes `project: null`. `reportUrl` must be http(s), at most 2,048
    characters. It is a citation field; `get_page` stays fixed to stellar.org.
  - `tutorial`: `{ kind, title, description, url, tags }`. `url` is rebuilt as
    `https://stellar.org/learn?tutorial=<slug>` from a slug matching `[a-z0-9-]`. The `/learn`
    page renders no tutorial detail, so the row is the content.
  - `partner`: the same fields; `url` is `https://stellar.org/ecosystem?partner=<slug>`, and
    category rows merge into `tags`.
  - Other external rows and unknown kinds are dropped. The blog, press, and events filter stays,
    with its measured reason in the comment and the spec.
- [`specs/stellar-org.json`](../../../../specs/stellar-org.json): the output schema describes the
  four kinds. The `search_site` description changes one sentence ("Returns site-search rows:
  pages, audit records with report links, video tutorials and partner listings"). The constraints
  record no paging, title/description/tag matching, and the measured filter reason.
- Micro-map line ([`scripts/catalog-data/source-families.mjs`](../../../../scripts/catalog-data/source-families.mjs)):
  it now names products and tools, case studies, video tutorials, the audit register, and the
  partner directory. The family line in the `search` tool description is unchanged, because that
  description sits near its 2,048-character cap. Micro-map estimate: 668 to 698 tokens.
- Generated through their scripts: `catalog/manifest.json`, `specs/super-spec.json`,
  `src/mcp/micro-map.ts`.
- Tests ([`test/stellar-org-adapter.test.ts`](../../../../test/stellar-org-adapter.test.ts), 69
  tests): the fixture gains a recorded audit row and tutorial row. New cases cover order and
  per-kind keys, the partner merge, audit title splitting, the report-link scheme guard, and the
  tutorial and partner slug and origin guard.
- [`research/services/stellar-org-site.md`](../../../../research/services/stellar-org-site.md):
  the search contract and design are updated.
- Measurement kit:
  [`sorg-general/`](../sorg-general/). `measure.mts` reruns the table from `snapshot.json` (the
  80 raw responses) or `--fetch`.
- `eval/gates.json` re-stamps the manifest fingerprint, `localTrace`, and the note.

## Body-text misses (the Algolia case)

**Probes.** Each phrase comes from a page body and names a fact on that page. The table shows the
rows the search returned and the page's rank (`-` means not in the top 10). Source:
`bodyProbes` in the query set.

| Phrase | Page | Rows | Rank |
|---|---|---|---|
| audit co-payment refunded within 20 business days | /grants-and-funding/soroban-audit-bank | 0 | - |
| STRIDE threat modeling | /grants-and-funding/soroban-audit-bank | 1 | - |
| 90 days to implement a fix | /grants-and-funding/bug-bounty | 2 | - |
| LayerZero OFT | /products-and-tools/tether-usdt0 | 0 | - |
| 0.15% management fee | /case-studies/franklin-templeton | 1 | - |
| Tomer Weller | /x402 | 0 | - |
| David Mazieres chief scientist | /grants-and-funding/academic-research-grants | 0 | - |
| Candace Kelly | /foundation/team | 2 | - |
| Direct Development Ecosystem Support Use-Case Investment User Acquisition | /foundation/mandate | 10 | - |
| Puntored | /enterprise-fund/portfolio | 1 | - |
| Chipper Cash investment | /enterprise-fund/portfolio | 2 | - |
| transformational enterprises | /foundation/strategy | 1 | - |

Nine probes found their page: "5% of the audit cost upfront", "HackerOne", "send up to 10,000
payments", "FOBXX", "x402 Foundation governing board" (rank 2), "CAP-0087 ML-DSA post-quantum
signatures", "match up to $500,000", "PwC electricity consumption", and "SDF sells XLM on Kraken
Coinbase Bitstamp". Most of these share words with the page's title or description.

The misses are entity and number lookups: a person's name, a portfolio company, a fee, a term,
or a program clause. When a question names the topic, title matching finds the page and
`get_page` reads the body. All 9 `bodyText` questions in the 40-question set were found that way.
Algolia would help with questions that name only a detail from inside a page.

**Misses in the 40-question set** (answer not in the raw top 10). None of these is a body-text
miss:

- a01, a03, a07 (question form): "Who audited the Soroswap AMM aggregator", "Which firm audited
  Spiko's", "Who audited the Phoenix DEX contracts". Ten generic page rows outrank the audit
  record. The keyword form ("Soroswap audit") finds it at rank 1 to 5. This is a phrasing miss.
- a04 (both forms): the Blend audit records are titled `Unnamed record - Certora Ltd`. Only the
  report URL says "blend". This is a data defect in the site's register. Scout `listAudits` has
  named Blend rows.
- d12 (both forms): ten blog and press rows about USDT0 crowd out
  `/products-and-tools/tether-usdt0`. The search has no paging or kind filter, so the adapter's
  filter cannot recover it.
- p11 (question form): "What does Soroswap.Finance do on Stellar?" returns zero rows. So does p13
  in keyword form ("Flutter wallet SDK"), although "wallet" returns that partner row.
- p12 (question form): the MoneyGram partner row is not in the top 10.

## Gates (bare, repo root, final tree)

| Command | Exit |
|---|---|
| `npm run typecheck` | 0 |
| `npm test` | 0 (151 files passed, 1 skipped; 3,467 passed, 3 expected fail, 1 skipped) |
| `npm run build` | 0 |
| `npm run test:smoke` | 0 (9 files, 141 tests) |
| `npm run eval:routing -- --gate` | 0 (GATE PASS) |
| `npm run eval:selftest` | 0 |
| `npm run eval:qa:lint -- --stale --enforce-floors` | 0 |
| `npm run eval:qa:register -- --check` | 0 |
| CI "generated artifacts in sync" sequence, then its `git diff --exit-code` after commit | 0 |
| `npm run secrets:scan -- --tree` | 0 |

**Routing, per case.** The comparison used `--dump-ranked` on all 544 rows, with the HEAD manifest
against the final one. It found no grade or top-1 change and one top-five change:
`q-defi-reflector-resolve` gains `stellarOrg.search_site` at rank 5, in place of
`lumenloop.get_related_projects`. The new tokens "audit records" and "report" draw it. Reflector
has three records in the stellar.org audit register, so the hit is adjacent rather than noise. The
schema-only change, before the description sentence, left all 544 rows byte-identical. The
protocol-history diagnostic reads FAIL both before and after; it is not a gate and this change
did not cause it.

Live smoke of the changed adapter (2026-11-14): "Soroswap audit" returns the Audit Bank page and
two audit records (Runtime Verification and OtterSec, with report links). "passkey tutorial"
returns the JS-Capacitor Passkey Kit partner and the WebAuthn tutorial. "MoneyGram partner"
returns two pages and the merged partner.

## Not verified

- **Answer quality.** No model ran, so whether an agent picks `stellarOrg` for these questions is
  unmeasured. Routing reach (7/40 in the top 5) suggests it often will not, unless it reads the
  micro-map. The smallest instrument is a QA run on a slice of this query set; it needs its own
  authorization.
- **Audit-answer independence.** The audit register renders only its first page server-side, and
  later pages load client-side. The 8 audit-record answers were identified by listing the
  register with firm-name queries (the firm list comes from the Audit Bank page). The test queries
  name the project, not the firm. Search on a different term still established the answer set,
  not a page read. The 77-result count and the first-page names were read from
  `/audit-bank/projects`.
- **Overlap with Scout.** About ten stellar.org audit records have no Scout `listAudits`
  counterpart by project name: Crossmint, Normal, Rivool Finance, Stellar Attestation Service,
  Pelago, Tricorn, Aquarius–Coinfabrik, Reyts, Team Finance, and Rubic. DeFindex and Balanced are
  uncertain. This comparison is by name only.
- **Zero-row queries** (p11 question, p13 keyword). These are upstream glitches, not misses: the
  site search intermittently returns an empty `results` array for a valid query. Live, both forms
  hit at rank 1, and the totals read 34/40 (question) and 38/40 (keyword)
  ([SORG-REVIEW.md](SORG-REVIEW.md), "Generality review", G3).
- **Question-set bias.** The set is title-biased and the audit group is survivorship-biased. Most
  question and keyword forms reuse page-title words, the easiest match for a search over title,
  description, and tags, so 33/40 and 37/40 are an upper bound for real questions; the body-text
  probes (9 of 21 found) show the other side. The audit answers were found with the search under
  test, so an audit record it cannot surface could not enter the set. The raw-versus-adapter gap,
  the claim under test, does not depend on either bias, because both sides see the same rows.
- **Workers egress.** All live calls ran from this machine with Node `fetch`, as in SORG.

## Generality review reconciliation

Author Claude Opus 5.5, 2026-11-14, applying [SORG-REVIEW.md](SORG-REVIEW.md), "Generality review".

- **G1.** `auditHit` drops a `reportUrl` that carries userinfo (`url.username` or `url.password`).
- **G2.** The 2,048-character cap now tests `url.href`, after normalization, not the raw string.
  Each fix has a regression test in `test/stellar-org-adapter.test.ts` (now 71 tests); both fail
  against the previous adapter. The `title` cap the reviewer also suggested is not in this change.
- **G3.** "Not verified" now records the zero-row queries as upstream glitches.
- **Bloat.** `sorg-general/ranks-before.json`, `ranks-after.json`, and `body-probes.tsv` are
  deleted; `measure.mts` regenerates them. Its usage line now says `node`, not `npx tsx`. Rerun on
  the patched adapter, the table above reproduces unchanged.
- **Question-set bias** is recorded under "Not verified".

Gates, bare, repo root, on this tree:

| Command | Exit |
|---|---|
| `npm run typecheck` | 0 |
| `npm test` | 0 (151 files passed, 1 skipped; 3,469 passed, 3 expected fail, 1 skipped) |
| `npm run build` | 0 |
| `npm run test:smoke` | 0 (9 files, 141 tests) |
| `npm run eval:routing -- --gate` | 0 (GATE PASS, legacy 338) |
| CI "generated artifacts in sync" (all ten scripts), then its `git diff --exit-code --stat` | 0, 0 |
| `npm run secrets:scan -- --tree` | 0 |
