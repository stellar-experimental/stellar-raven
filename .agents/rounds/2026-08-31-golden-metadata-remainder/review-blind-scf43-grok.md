# Blind re-derivation: q-scf-round-43-results

Case: `eval/qa/corpus/battery/scf-grants-builders/q-scf-round-43-results.json`
Question: What were the final headline results of Stellar Community Fund round 43?
Lane: independent blind re-derivation, 2026-08-31.
Method: read AGENTS.md, golden-truth SKILL.md, and the case file. Query official SCF sources, the live dashboard, independent posts, and public archives. Do not use prior verification notes as evidence. Do not edit the repository. Do not read current round ledgers or `/tmp/gmr-2026-08-31/events-report.md`.

Domain: real-world. Amounts and counts are numeric and need two classes, with one primary.

All archive tasks finished. No curl process remains. Third-party HTML archives of the dashboard stay unavailable. Classification below uses that fact honestly.

## Verdicts

| Item | Verdict |
|---|---|
| KF1. Official SCF #43 recap date is June 2, 2026 | **confirmed** |
| KF2. Official recap reports 85 submissions | **confirmed** |
| KF3. Headline/social “all three tracks” wording is inconsistent with recipient sections | **confirmed** |
| KF4. Recipient sections list 10 Open, 19 Integration, and no RFP recipient | **confirmed** |
| KF5. Official recap $3,139,069 / 29 is the selection result, not the dashboard Awarded count | **confirmed** for the recap figures. Dashboard **28 / $3,049,069** is **confirmed-as-of 2026-08-31** from the live page. |
| May the golden keep the exact 28 / $3,049,069 numbers? | **Yes**, if it labels them as the live dashboard `Awarded` (paid) state with an `asOf` date. **No**, if it treats them as the official final selection result. A third-party archive of an earlier dashboard snapshot is **unavailable**. That does not make the current live 28 / $3,049,069 unverifiable. |

## Commands and timestamps

All times are UTC.

| When | Command or tool | Result |
|---|---|---|
| 2026-08-31T13:52:54Z | `curl` https://medium.com/feed/stellar-community | HTTP 200, RSS XML |
| 2026-08-31T13:52:54Z | `curl` https://medium.com/stellar-community/scf-43-round-recap-62942f07757e | HTTP 403 (bot block) |
| 2026-08-31T13:52:55Z | `curl` https://communityfund.stellar.org/awards/reciQ16Y1ztmnmE3N | HTTP 200, 417067 bytes |
| 2026-08-31T13:52:58Z | `curl` https://communityfund.stellar.org/ | HTTP 200 |
| 2026-08-31T13:53:13Z | Wayback CDX dashboard URL | timeout, 0 bytes |
| 2026-08-31T13:53:43Z | Wayback CDX Medium recap URL | HTTP 200 body `[]` |
| 2026-08-31T13:54:52Z–13:56:23Z | archive.ph lookup of Medium recap | HTTP 429 |
| 2026-08-31T13:54:52Z | Medium `?format=json` | HTTP 403 |
| about 13:53Z | native `x_thread_fetch` post `2065181135135559896` | official X post, 2026-06-11 |
| about 13:55Z | WebFetch Medium recap | full article, Jun 2, 2026 |
| 2026-08-31T13:56:10Z | Python parse of dashboard RSC payloads | 28 `Awarded`, sum 3049069 |
| 2026-08-31T13:57:36Z | Python isolate RSS item titled `SCF #43 Round Recap` | pubDate `Tue, 02 Jun 2026 21:39:51 GMT` |
| 2026-08-31T13:59:40Z–14:02:02Z | Final archive wait: Wayback CDX dash + Medium (60s each), Wayback `/web/2026/` dash, archive.today newest dash | CDX both timeout; Wayback web HTTP 404 “has not archived that URL”; archive.today HTTP 404 “No results” |
| 2026-08-31T14:02:11Z | Confirm no leftover curl | none |

## Archive availability

| Source | URL attempted | Result | Classification |
|---|---|---|---|
| Medium RSS (official feed) | https://medium.com/feed/stellar-community | HTTP 200; recap item present | **available** durable official archive |
| Medium HTML | https://medium.com/stellar-community/scf-43-round-recap-62942f07757e | curl 403; WebFetch succeeded | **available** via WebFetch and RSS |
| Wayback CDX dashboard | `web.archive.org/cdx/search/cdx?url=communityfund.stellar.org/awards/reciQ16Y1ztmnmE3N` | timeout 60s, twice | **unavailable** |
| Wayback CDX Medium recap | same CDX for the Medium URL | first call HTTP 200 body `[]`; later call timeout | **unavailable** as a capture list (empty or timeout) |
| Wayback web 2026 dashboard | https://web.archive.org/web/2026/https://communityfund.stellar.org/awards/reciQ16Y1ztmnmE3N | HTTP 404 at 14:01Z | **unavailable**. Quote: `The Wayback Machine has not archived that URL.` |
| archive.today newest dashboard | https://archive.today/newest/https://communityfund.stellar.org/awards/reciQ16Y1ztmnmE3N | HTTP 404 at 14:02Z | **unavailable**. Quote: `No results` |
| archive.ph Medium recap | https://archive.ph/https://medium.com/stellar-community/scf-43-round-recap-62942f07757e | HTTP 429 at 13:56:23Z | **unavailable** (rate limit) |

Honest claim class: a stranger cannot re-walk a 2026-07-11 dashboard HTML snapshot from Wayback or archive.today today. The 28 / $3,049,069 figures are still on the **live** dashboard, so they are not unverifiable as current paid-state. They are unverifiable as a distinct past-only snapshot from public web archives.

## KF1 — recap date June 2, 2026

**Verdict: confirmed.**

Class A, official RSS https://medium.com/feed/stellar-community, curl 2026-08-31T13:52:54Z.

Item title: `SCF #43 Round Recap`
Link: `https://medium.com/stellar-community/scf-43-round-recap-62942f07757e?source=rss----89c348dcf743---4`
`<pubDate>Tue, 02 Jun 2026 21:39:51 GMT</pubDate>`

Class A, rendered article via WebFetch of https://medium.com/stellar-community/scf-43-round-recap-62942f07757e:

> SCF #43 Round Recap
> Gemma Dobbs
> 12 min read · Jun 2, 2026

Direct `curl` of the HTML URL returned HTTP 403. The RSS feed and the WebFetch render still carry the same date.

## KF2 — 85 submissions

**Verdict: confirmed.**

Class A, same recap (RSS text and WebFetch), 2026-08-31:

> We received 85 submissions across all three tracks.

Class A, same recap Open/Integration lines: `10 of 39` Open and `19 of 30` Integration. 39 + 30 = 69 listed in those two tracks. The remaining 16 of 85 are not named as awarded RFP recipients in the recipient sections. The 85 figure is the official submission headline, not a dashboard card count.

The live dashboard payload parsed 61 submission records (28 Awarded + 12 Not Awarded + 21 Panel Review Failed). That is not 85. Do not replace the recap submission count with the dashboard card count.

## KF3 — all-three-tracks headline vs recipient sections

**Verdict: confirmed.**

Class A recap headline (RSS + WebFetch):

> 29 projects were awarded across all three tracks with a total of $3,139,069 worth of XLM.

Class A, official X post https://x.com/StellarOrg/status/2065181135135559896
`x_thread_fetch` timestamp: Thu, 11 Jun 2026 21:15:26 GMT.

> Round 43 of the Stellar Community Fund has concluded!
> 29 projects were awarded across all three tracks with a total of $3,139,069 worth of XLM 🏆
> Learn more about the projects included 👇
> https://medium.com/stellar-community/scf-43-round-recap-62942f07757e

Class A recap track sections:

> Open Track … 10 of 39 submissions were awarded.

> Integration Track … 19 of 30 submissions were awarded.

> RFP Track (Developer Tooling) Targeted developer tooling needs — reviewed by the delegate panel only on a quarterly basis. RFP Track submissions are now open for SCF #44 for the Q2 2026 RFPs.

The RFP section names no round-43 recipient. 10 + 19 = 29, which matches the headline count, but the named recipients sit in two tracks. Headline and social copy still say “across all three tracks.” Report that inconsistency. Do not invent an RFP winner. Do not treat missing RFP names as proof that the all-three-tracks sentence is false.

June 11 is the X post time, not the recap publish time.

## KF4 — 10 Open, 19 Integration, no RFP recipient

**Verdict: confirmed.**

Class A recap (WebFetch + RSS), counted by name:

Open Track (10): lend.xyz $120,560; Pipeline $140,000; Talwex $150,000; Stellar Oracle Shield $120,000; XCCY $141,125; Stabble $144,100; REAPP $70,000; TERWA $97,240; ProofBridge $150,000; XOXNO $135,000.

Integration Track (19): SeevCash $149,360; Turbolong $99,000; Seasonal Workers Payroll (TuCambio) $100,000; Fundable Finance $96,499; InveStar $141,325; CryptoMate $140,000; Figo $75,000; Sava $125,000; D’CENT Wallet $50,000; Fewticket $65,000; WOWMAX $98,560; Fiatsend $92,000; VANK Anchor $96,800; Bloccpay $100,000; JetPad $74,500; Blockroll $125,000; Dig $75,000; Linq $78,000; Bexo Wallet $90,000.

RFP section: no project names. It points to SCF #44 RFP submissions.

Class F sum of those 29 recap amounts: $3,139,069. That matches the headline total.

Referral line in the same recap:

> This round, 22 of the 29 awarded projects came through referrals.

That repeats 29 as the awarded-project count.

## KF5 — official $3,139,069 / 29 vs dashboard 28 / $3,049,069

**Official recap 29 / $3,139,069: confirmed** (class A recap + class A X post; class F amount sum).

**Dashboard 28 / $3,049,069: confirmed-as-of 2026-08-31.** It is still reproducible on the live awards page. Public web archives do not add a second capture.

Class C, https://communityfund.stellar.org/awards/reciQ16Y1ztmnmE3N
`curl` 2026-08-31T13:52:55Z, HTTP 200. Visible text:

> SCF #43 Build Award Round Ended Round Recap Awarded Submissions See All Below submissions have been awarded this round with their full or partial award payment paid.

Python parse of `self.__next_f.push` records in that HTML, 2026-08-31T13:56:10Z:

| Dashboard status | Count | Budget sum (USD-worth) |
|---|---|---|
| Awarded | 28 | 3,049,069 |
| Not Awarded | 12 | 1,203,120 |
| Panel Review Failed | 21 | 2,105,845 |

The 28 Awarded names match the recap Open+Integration list **except Bexo Wallet**. Bexo is absent from the dashboard payload (no `Awarded`, `Not Awarded`, or `Panel Review Failed` row). Recap lists Bexo Wallet at $90,000. 3,139,069 − 90,000 = 3,049,069. The live dashboard gap is exactly that one recap recipient.

The dashboard label is payment state: “full or partial award payment paid.” It is not a second official recap. The recap remains the selection write-up.

“Transient” is too strong as of this check. The 28 / $3,049,069 Awarded state is still live on 2026-08-31, weeks after the June 2 recap. Treat it as a durable recap-versus-paid-dashboard split, dated, until the dashboard adds the 29th card or the recap changes.

A 2026-07-11-only snapshot cannot be re-fetched from Wayback or archive.today. Do not claim archive provenance for that older date. The same numbers are live now, so the golden may still cite 28 / $3,049,069 as a current dashboard paid-state with `asOf: 2026-08-31`.

## May the golden keep 28 / $3,049,069?

Yes, as a dated dashboard `Awarded` (paid) snapshot. This lane reproduced it on 2026-08-31 from https://communityfund.stellar.org/awards/reciQ16Y1ztmnmE3N. Pin it with `asOf`. Do not call it the official final selection result.

No, as a replacement for 29 / $3,139,069. The recap and the June 11 official X post still state 29 projects and $3,139,069 worth of XLM.

No, as a fact proven only by a vanished archived UI. Public HTML archives are unavailable. The live dashboard is the reproducing source.

Skill rule: volatile dashboard counts need `asOf`. Unverifiable facts must not be claimed. These dashboard numbers are verifiable today on the live page.

## Other checks

Class D Perplexity snippets of the dashboard said “No submissions added yet.” Direct class C HTML contradicts that snippet. Prefer the live page.

Lumenloop is the case surface. This lane did not use Lumenloop as corroboration of its own claims.

USD-worth is not a token count. Recap footnote: the USD valuation uses CF Stellar Lumens-Dollar Settlement Price on the day of payment.

## Corroboration matrix

| Claim | Verdict | Classes |
|---|---|---|
| Recap published 2026-06-02 21:39:51 GMT | confirmed | A: Medium RSS `pubDate`; A: Medium article “Jun 2, 2026” |
| Recap: 85 submissions | confirmed | A: RSS + WebFetch quote |
| Recap/X: 29 projects across all three tracks, $3,139,069 worth of XLM | confirmed | A: recap; A: X post 2065181135135559896 (2026-06-11 21:15:26 GMT); F: 29-amount sum |
| Recipient sections: 10 Open, 19 Integration, no named RFP winner | confirmed | A: recap headings and name lists |
| Headline/social “all three tracks” vs two-track named list | confirmed (inconsistency) | A: recap + X vs A: Open/Integration/RFP sections |
| June 11 is recap conclusion date | contradicted (avoid trap) | A: recap June 2; A: X June 11 is post date |
| Live dashboard `Awarded` = 28 cards totaling $3,049,069 | confirmed-as-of 2026-08-31 | C: awards page HTML; F: RSC parse; missing Bexo $90,000 |
| 28 / $3,049,069 is the official final selection result | contradicted (avoid trap) | A: recap 29 / $3,139,069 |
| 28 / $3,049,069 is no longer reproducible | contradicted by this live fetch | C/F 2026-08-31 |
| A public Wayback or archive.today copy of the dashboard exists | unverifiable / unavailable | Wayback 404 and timeout; archive.today 404; archive.ph 429 |

## What this lane did not do

It did not edit repository files.
It did not read current round ledgers or `/tmp/gmr-2026-08-31/events-report.md`.
It did not treat the case `truth.verified` notes as evidence.
It did not obtain a Wayback or archive.today capture of the dashboard. Those sources stayed unavailable after the final wait.

## Reply verdict

KF1 confirmed. KF2 confirmed. KF3 confirmed. KF4 confirmed. Official 29 / $3,139,069 confirmed. Dashboard 28 / $3,049,069 confirmed-as-of 2026-08-31 and still live. Public HTML archives of the dashboard are unavailable. The golden may keep those dashboard numbers only as a dated paid-state snapshot, not as the official final result.
