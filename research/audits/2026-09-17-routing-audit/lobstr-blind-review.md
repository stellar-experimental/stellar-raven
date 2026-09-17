> Superseded on paid-total publication: see `golden-and-pipeline-review.md`, section 1.
> The public SCF payload contains both totals. No amount is promoted into the golden.

# LOBSTR / Ultra Stellar SCF funding — blind verification

- Reviewer: Fable high (Claude Fable 5.1), independent from proposer Opus and coordinator Astra.
- Date of observation: 2026-09-16 (local) / 2026-09-17T01:40Z–01:45Z (Raven MCP call timestamps).
- Method: golden-truth skill (`.agents/skills/golden-truth/SKILL.md`), source classes A/B/C/D/E/F.
  No prior agent report, matrix, proposed correction, or current QA answer was read.
- Constraints honored: read-only; no repo edits, Git writes, paid research calls (perplexity/parallel
  not used; Lumenloop paid research not used), servers, external messages, new agents, or signed
  transactions. One Chrome tab was opened and closed. A Discord OAuth prompt for the SCF dashboard
  was NOT authorized.

## 1. Bottom line

1. The SCF site publishes an official cumulative figure for the LOBSTR project record:
   `Total awarded $232.0K*` with `Awarded Submissions 3`. The claim that ALL cumulative totals are
   unofficial reconstructions is therefore NOT supportable.
2. That official total is on an **awarded** basis (USD-denominated commitments, paid in XLM). It equals
   exactly the sum of the two disclosed awards ($144.0K + $88.0K). It EXCLUDES the SCF #2 lumen award,
   which the site shows with a blank amount (`$`).
3. Any total that adds a value for SCF #2, and any **paid** total, IS a reconstruction. Per-project
   paid amounts, XLM counts at payment, and tranche status are not published anywhere found.
4. The SCF #2 award is derivable only: 17.9486% of a 3,000,000 XLM pool ≈ 538,458 XLM. No source
   publishes that number or a USD value for it.

## 2. Corroboration matrix

Verdict enum per skill: confirmed | confirmed-as-of | disputed | unverifiable | corpus-only | contradicted.

| # | Claim | Verdict | Evidence (class, ref, exact observation) |
|---|---|---|---|
| 1 | SCF #17 "Ultra Stellar / Soroban Integration" awarded $144.0K, Legacy v4.0 Award, status Awarded | confirmed-as-of 2026-09-16 | A: communityfund.stellar.org/project/lobstr-gcn — rows `Ultra Stellar / Soroban Integration / SCF #17 / $144.0K / Legacy v4.0 Award / Awarded`. A: communityfund.stellar.org/submissions/recWR4fbwZYJ72i34 — `Requested Budget $144.0K`, team `Dima`, `Gleb Pitsevich`. C: Lumenloop get_scf_submissions slug=lobstr → budget "144000", award_type "Legacy v4.0 Award". C: Scout searchProjects → round 17 amountUSD 144000. |
| 2 | SCF #22 "LOBSTR: new Soroban features" awarded $88.0K, Legacy v5.0 Community Award | confirmed-as-of 2026-09-16 | A: lobstr-gcn page rows `LOBSTR: new Soroban features / SCF #22 / $88.0K / Legacy v5.0 Community Award / Awarded`. A: submissions/recLPGmYh7sNVjRz7 — `Requested Budget $88.0K`. A (independent document, SDF-authored): SCF #22 Recap, Medium, datePublished 2024-02-02T20:16:48Z — `LOBSTR: new Soroban features: $88,000 worth of XLM*` under "Community Awards / Awarded a total of $557,043 worth of XLM* to 6 projects"; round header `We awarded $1,467,342 worth of XLM to 34 submitters in total for SCF #22.` C: Lumenloop budget "88000"; Scout round 22 amountUSD 88000. |
| 3 | SCF #2 "LOBSTR" award exists, Legacy v1.0 Award, amount not published | confirmed | A: lobstr-gcn rows `LOBSTR / SCF #2 / $ / Legacy v1.0 Award / Awarded`. A: submissions/reckAPLIsrEDIE0Zb — description `Simple and secure Stellar wallet available on the web, Android and iOS.`; no Requested Budget value. A: Medium "Stellar Community Fund #2: The Results", datePublished 2019-10-15T19:55:53Z — `#1 Lobstr | 17.9486%`. A: SCF Handbook history — `SCF #2 saw eight winners out of the 38 projects submitted ... Lobstr, arguably one of the most popular Stellar wallets and a previous SBC winner, was a winner this round.` C: Lumenloop budget null; Scout round 2 amountUSD null. |
| 4 | SCF #2 XLM amount ≈ 538,458 XLM | unverifiable as a published figure (derivation only) | A: Medium "Stellar Community Fund Round 2" (datePublished 2019-08-12) — `Each round will award 3,000,000 lumens. Winners will be awarded proportionally out of this pool based on final vote percentages. There will be 8 winners for Round 2.` Same sentence in the Round 1 post (2019-04-17). The eight winner percentages in the results post sum to 100.0000. No source states the LOBSTR XLM count. |
| 5 | Official cumulative total for LOBSTR is $232.0K (awarded basis) | confirmed-as-of 2026-09-16 | A: lobstr-gcn `Project Stats / Team Size 2 / Category Applications / Total awarded $232.0K* / Awarded Submissions 3`. Same figure on all three submission pages. Wayback snapshot 20260521081837 shows identical `$232.0K*` and identical three rows. C: Scout scfTotalAwardedUSD 232000, scfBasis "official-record", scfAmountStatus "disclosed", scfAsOf "2026-08-12", scfSourceUrl = the lobstr-gcn page. |
| 6 | "All cumulative totals are unofficial reconstructions" | contradicted | Claim 5 evidence. Only totals that add SCF #2 or claim a paid basis are reconstructions. |
| 7 | Per-project paid amounts are published | unverifiable / not found | A: SCF handbook FAQ and Build Award pages describe tranches and XLM conversion but publish no per-project payment status. A: handbook history reports only cohort outcomes (see §3). A: /dashboard and /stats are login-gated (Discord OAuth; Airtable embed redirected to login). |
| 8 | Stellar i³ Impact Award (LOBSTR) carries a monetary amount | unverifiable / not found | A: stellar.org/blog/developers/announcing-the-stellar-i-award-winners (Lumenloop dates it 2024-10-30) — winners received `a pretty impressive physical trophy` and `a sweet NFT trophy`; no amount stated. |
| 9 | Awards attach to "Ultra Stellar" as a directory entity | contradicted (source-relative) | C: Scout "Ultra Stellar" record scfAwarded false, scfAwardedRounds []. C: Lumenloop get_scf_submissions name="Ultra Stellar" → soft-empty (0 submissions). A: all three SCF rows are "By Lobstr". A: ultrastellar.com has no SCF/grant mention (products: LOBSTR, StellarX, LOBSTR Vault, StellarTerm, USDC Chain Swap Tool; "Since 2014"). |

## 3. What each basis means (primary sources)

- **Awarded (SCF site label).** Every submission row carries `Awarded`. The displayed amount equals the
  submission's `Requested Budget`. Handbook FAQ: `While the requested budget amount of each submission is
  valued in USD, the actual pay-out currency is XLM, Stellar's native currency.`
- **Asterisk.** No footnote text exists on the project page itself. On /awards and in the SCF #22 recap the
  footnote reads: `*The USD valuation of the Award in XLM is calculated using the CF Stellar Lumens-Dollar
  Settlement Price on the day of payment as administered, maintained, and reported by the cryptocurrency
  index provider CF Benchmarks Ltd. (using the ticker XLMUSD_RR)`.
- **SCF #17 = SCF 4.0 (rounds #12–19, 2023).** Handbook history: `any eligible project accepted by the
  selection panel received 10% of their requested budget (also referred to as Proof of Intent). Upon
  finishing those deliverables, the project went through a larger community vote for the remaining 90%.`
  Cohort-only payment outcomes: SCF #17 round: `8 out of 39 submissions ... were selected and awarded with
  the 10% payment`; SCF #18 round: `9 out of 9 submissions that were approved in SCF#16 and SCF #17 received
  their 90% payment based on voting outcome of 18 voters`; SCF #19 round: `14 out of 16 submissions that
  were approved in SCF#17 and SCF #18 received their 90% payment based on voting outcome of 31 voters`.
  Whether Ultra Stellar's submission was in the paid set is NOT published.
- **SCF #22 = SCF 5.0 (rounds #20–29, 2024).** Community Award (up to $100K worth of XLM), paid in
  milestone tranches per handbook; tranche completion not published per project.
- **SCF #2 = SCF 1.0 (rounds #1–5, 2019–2020).** XLM-denominated, proportional to final vote share, no USD
  budget. Handbook: USD budget requests began in SCF 3.0 (`the final payout was still in XLM*`).
- **i³ Impact Award (Meridian, Oct 2024).** Recognition; "powered by the Stellar Community Fund"; no amount.

## 4. Independence limits

- Classes used: A (SCF site, SDF Medium/blog, SCF handbook, ultrastellar.com), C (Scout, Lumenloop via
  Raven MCP), D (WebSearch built-in). Class B (source code) is not applicable. Class E (docs index) not
  applicable. No paid D-class research (perplexity/parallel) was used per the read-only instruction.
- Scout and Lumenloop both cite the SCF page as their source. They confirm consistency of the numbers but
  are NOT independent of SDF for the amounts. They are independent for the observation that neither holds a
  value for SCF #2.
- The SCF #22 recap and the SCF site are both SDF-authored, but they are separate documents from separate
  years (2024 recap vs live 2026 page). This is the strongest same-owner cross-check available.
- Medium pages block direct fetch (403/5019-byte block page); texts were read from archive.org `id_`
  copies. The SCF #22 copy arrived gzip-compressed and was decompressed locally (149,956 bytes,
  datePublished 2024-02-02T20:16:48Z).
- WebSearch summaries were treated as leads only; every number above was re-read from the primary page.

## 5. History uncertainty and historical-versus-current limits

- The SCF site is a live Airtable-backed app. "Legacy v1.0/v4.0/v5.0" labels are retroactive relabels of
  earlier program versions. The SCF #2 record carries no amount, so the official total silently omits it.
- The lobstr-gcn page was unchanged between the Wayback snapshot of 2026-05-21 and the live read of
  2026-09-16. Only one Wayback capture exists (CDX collapse=digest returned one row); earlier history of
  the page is not available.
- Handbook history page states `Last updated: April 2024`. Its SBC table is self-described: `the SBC award
  statistics below, may not be entirely accurate.`
- Source conflict on SCF #2 voter count: results post says `461 unique voters`; handbook says `415
  eligible unique voters`. Immaterial to amounts; recorded as a visible conflict.
- LOBSTR is described as `a previous SBC winner` (handbook). Pre-SCF SBC funding exists with no amount
  found. stellar.org SBC #7 results page has no LOBSTR mention. Other SBC rounds not exhaustively checked.
- Old URL slug `/projects/ultra-stellar--soroban-integration-scf-15` still appears in search-engine titles
  but now returns HTTP 307 to `/projects`. The live page says SCF #17, not #15. Do not cite the slug's
  round number.
- Round dates: SCF #2 results 2019-10-15; SCF #22 recap 2024-02-02; SCF #17 falls in SCF 4.0 (2023) per
  handbook; an exact SCF #17 announcement date was not located (the /awards round list shows `Ended` with
  empty deadline text for older rounds).
- Homepage aggregate as of 2026-09-16: `42M Awarded in XLM`, `656 Awarded Submissions`, `242 Startup Camp
  Teams`, `7.6K Community Members`. /awards shows `504 Previously Awarded Submissions`, `$150K in XLM* Max.
  Award Amount`, and `SCF #46 Submission / Deadline to submit: November 8, 2026`.

## 6. Recommended encoding for a golden (per skill §5)

- Pin as confirmed-as-of: three SCF awards (rounds 2, 17, 22); disclosed amounts $144K and $88K; official
  awarded-basis total $232.0K with `asOf` 2026-09-16; SCF #2 amount not published on the SCF site.
- Do NOT pin: any USD or XLM value for SCF #2; any "paid" total; any i³ monetary amount.
- Avoid/trap must NOT punish an answer that cites the official $232.0K total as official. It MAY punish an
  answer that presents $232.0K as a paid amount, or that presents a total including SCF #2 as official.
- Grader note: "awarded" ≠ "paid"; SCF publishes cohort-level payment outcomes only; XLM count at payment is
  set by CF Benchmarks XLMUSD_RR on the payment day.
- Freshness: `tags.freshness: scheduled`; reverify quarterly (the live SCF page can change).

## 7. Every URL hit, with result

- https://communityfund.stellar.org/project/lobstr-gcn — 200; raw text captured (Total awarded $232.0K*; 3 rows).
- https://communityfund.stellar.org/submissions/recWR4fbwZYJ72i34 — 200; SCF #17; Requested Budget $144.0K.
- https://communityfund.stellar.org/submissions/recLPGmYh7sNVjRz7 — 200; SCF #22; Requested Budget $88.0K.
- https://communityfund.stellar.org/submissions/reckAPLIsrEDIE0Zb — 200; SCF #2; no budget.
- https://communityfund.stellar.org/ — 200; aggregate stats; no LOBSTR mention.
- https://communityfund.stellar.org/awards — 200; asterisk footnote; round list (SCF #46 open, deadline Nov 8, 2026).
- https://communityfund.stellar.org/projects — 200; listing shows Lobstr under SCF #17; no amounts.
- https://communityfund.stellar.org/projects/lobstr — 307 → /projects.
- https://communityfund.stellar.org/projects/ultra-stellar--soroban-integration-scf-15 — 307 → /projects.
- https://communityfund.stellar.org/rounds/scf-17, /round/scf-17, /rounds/scf-22, /round/scf-22, /rounds/scf-2, /round/scf-2 — 404.
- https://communityfund.stellar.org/dashboard — JS app; redirects to Discord OAuth (not authorized).
- https://communityfund.stellar.org/stats — 200 shell; embeds https://airtable.com/embed/app8tLjMIDrjeloWN/shrrNA24K1e0v5Q0R (redirected to login in Chrome).
- https://web.archive.org/web/20260521081837id_/https://communityfund.stellar.org/project/lobstr-gcn — 200; identical figures.
- https://web.archive.org/cdx/search/cdx?url=communityfund.stellar.org/project/lobstr-gcn — one capture: 20260521081837.
- https://medium.com/stellar-community/scf-22-recap-0d4a4c2b3655 — direct 403/block; archive.org copy read (2024-02-02).
- https://medium.com/stellar-community/stellar-community-fund-2-the-results-69b3f6a6040e — archive.org copy read (2019-10-15).
- https://medium.com/stellar-community/stellar-community-fund-round-2-1da91a80ef44 — archive.org copy read (2019-08-12).
- https://medium.com/stellar-community/stellar-community-fund-13b722ca45f4 — archive.org copy read (2019-04-17).
- https://medium.com/stellar-community/5-years-of-community-powered-funding-28f92884f3d9 — 403; not read.
- https://stellar.gitbook.io/scf-handbook/additional-support/history-of-scf — 200; full text captured.
- https://stellar.gitbook.io/scf-handbook/additional-support/faq — 200; payout/tranche/CF Benchmarks text.
- https://stellar.gitbook.io/scf-handbook/scf-awards/build-award — via Scout research chunk; "up to $150,000 worth of XLM*", "paid in tranches".
- https://stellar.org/blog/developers/announcing-the-stellar-i-award-winners — 200; trophy + NFT, no amount.
- https://stellar.org/blog/ecosystem/stellar-community-fund-4-0-bigger-better-faster-soroban — 200; "Awards range from $10k-150k worth of XLM per project".
- https://stellar.org/blog/ecosystem/stellar-community-fund-a-new-era-of-community-empowerment-begins — 200; SCF 5.0 starts at #20; Activation ≤$50K, Community ≤$100K.
- https://stellar.org/blog/ecosystem/stellar-community-fund-recap-soroban-infrastructure — 200; no LOBSTR mention.
- https://stellar.org/blog/ecosystem/stellar-community-fund-recap-financial-innovation-powered-soroban — 200; no LOBSTR mention.
- https://stellar.org/blog/ecosystem/stellar-community-fund-usd10m-in-xlm-distributed-in-10-review-rounds — 200; no LOBSTR mention.
- https://stellar.org/blog/ecosystem/stellar-build-challenge-7-results — 200; no LOBSTR mention.
- https://ultrastellar.com/ — 200; no SCF/grant mention.
- Raven MCP (class C), 2026-09-17T01:40–01:45Z: lumenloop.search_directory("lobstr") → slugs lobstr, ultra-stellar; lumenloop.get_scf_submissions(name "LOBSTR" / slug "lobstr") → 3 submissions; (name "Ultra Stellar") → soft-empty; scout.searchProjects(q "LOBSTR") → Lobstr scfTotalAwardedUSD 232000 / rounds [2,17,22]; Ultra Stellar scfAwarded false; lumenloop.find_content_by_entity("LOBSTR", scf_submissions) → the same three plus unrelated rows; scout.searchResearch and lumenloop.search_content_semantic → handbook/blog chunks quoted above; scout.analyzeEcosystem(funding) → no per-project LOBSTR row.
