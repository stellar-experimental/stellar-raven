# Independent golden QA review

Review date: 2026-10-06. Reviewer: the independent agent assigned this brief.

The live Scout responses reproduce the proposed numbers. This does not independently establish their real-world accuracy.
DoraHacks returned a human-verification wall. I stopped requests to that site after I inspected the response body.
The library answer contains a mathematical error. Its grading rules also reject some possible future correct answers.

| Case | Final verdict |
| --- | --- |
| `q-scout-hackathon-placed-share-kale-vs-zk` | **do-not-activate** |
| `q-scout-hackathon-submission-link-wraith` | **do-not-activate** |
| `q-scout-hackathon-submission-xbid-outcome` | **activate-with-changes** |
| `q-scout-hackathon-winner-libraries-vs-field` | **activate-with-changes** |

“Do-not-activate” identifies an incomplete evidence requirement here. It does not mean the proposed event results are false.
“Activate-with-changes” requires the exact corrections below before activation.

## Scope and method

I read the brief, claims, golden-truth skill, operation contracts, and existing battery cases.
I did not read the proposed case files, the prohibited round ledger, or the prohibited commit diff.
I did not change the corpus or run evaluation commands.
This report is the only file I wrote.

Direct HTTP requests used GET. Scout requests had at least one second between them.
I also used read-only web searches and page reads. The request log includes their times.
I did not execute repository code or test a deployed application.

Class B includes repository content obtained through GitHub's REST API or raw-file service.
Class C contains Scout observations. Multiple Scout endpoints remain one witness.
Class F below covers local arithmetic only. It does not independently verify the input counts.
The xbid blog source and its search excerpt repeat one publication. They are not independent witnesses.

`corpus-only` means I confirmed Scout's record but did not independently establish the complete real-world claim.
`unverifiable` means this review could not establish the claim under the required evidence standard.
`contradicted` appears only for avoid claims. I use `disputed` for the incorrect lower-bound claim in the answer.

## Requested URLs and observation times

All times are UTC on 2026-10-06. Times identify request starts, to the nearest second.
Each source label below links to its exact requested URL.

| Source | Time | Requested URL | Result |
| --- | --- | --- | --- |
| S1 | 14:28:05 | <https://stellarlight.xyz/api/hackathons/builds/46348> | 200; Wraith submission |
| S2 | 14:28:07 | <https://stellarlight.xyz/api/hackathons/builds/32593> | 200; xbid.ai submission |
| S3 | 14:28:08 | <https://stellarlight.xyz/api/hackathons/analyze?facet=placement&by=event> | 200; placement counts |
| S4 | 14:28:09 | <https://stellarlight.xyz/api/hackathons/analyze?facet=library&top=30> | 200; library counts and comparison |
| A1 | 14:28:30 | <https://dorahacks.io/hackathon/stellar-hacks-kale-reflector/winner> | 405; initial client reported the status only |
| A2 | 14:28:30; 14:29:01 | <https://dorahacks.io/hackathon/stellar-hacks-zk/winner> | 405; second request exposed “Human Verification” and a CAPTCHA requirement |
| A3 | 14:28:30 | <https://dorahacks.io/buidl/46348> | 405; no submission content obtained |
| A4 | 14:28:30 | <https://dorahacks.io/buidl/32593> | 405; no submission content obtained |
| B1 | 14:28:30 | <https://api.github.com/repos/poki-tcg/wraith> | 200; public repository, default branch `main` |
| B2 | 14:28:30 | <https://api.github.com/orgs/xbid-ai> | 200; `type: Organization`, website `https://xbid.ai` |
| S5 | 14:29:02 | <https://stellarlight.xyz/api/hackathons/builds?winnersOnly=1&limit=100> | 200; 64 placed records, 45 manifest reads |
| A5 | 14:29:05 | <https://xbid.ai> | 403; `error code: 1010` |
| A6 | 14:29:05 | <https://wraith-zk.vercel.app> | 200; “Wraith — Privacy on Stellar” |
| B3 | 14:29:05 | <https://raw.githubusercontent.com/poki-tcg/wraith/main/README.md> | 200; project and event description |
| D1 | 14:29:22 | <https://www.google.com/search?q=%22Stellar%20Hacks%22%20%22KALE%22%20%22xbid%22%20winners> | JavaScript fallback; no usable results |
| D2 | 14:29:22 | <https://www.google.com/search?q=%22Stellar%20Hacks%22%20%22Real-World%20ZK%22%20%22Wraith%22> | JavaScript fallback; no usable results |
| D3 | 14:29:22 | <https://www.google.com/search?q=%22Stellar%20Hacks%22%20%22Reflector%22%20%2247%22> | JavaScript fallback; no usable results |
| B4 | 14:29:22 | <https://api.github.com/repos/poki-tcg/wraith/git/trees/main?recursive=1> | 200; complete tree, SHA `fba6c96cdede0b00bc6997a2914eb82fd8be21ba` |
| B5 | 14:29:22 | <https://api.github.com/orgs/xbid-ai/repos?per_page=100> | 200; five public repositories |
| S6 | 14:29:36 | <https://stellarlight.xyz/api/hackathons/builds/32665> | 200; Top Kale, `stack: []` |
| S7 | 14:29:38 | <https://stellarlight.xyz/api/hackathons/builds/32481> | 200; Kale Grab Rush |
| S8 | 14:29:40 | <https://stellarlight.xyz/api/hackathons/builds/28437> | 200; GoLazy |
| S9 | 14:29:42 | <https://stellarlight.xyz/api/hackathons/builds/32673> | 200; Not Circle of Trust |
| S10 | 14:29:43 | <https://stellarlight.xyz/api/projects/resolve?q=xbid.ai> | 200; XBid AI, `Live` |
| B6 | 14:29:49 | <https://raw.githubusercontent.com/xbid-ai/xbid-ai/main/README.md> | 200; project description |
| B7 | 14:29:49 | <https://api.github.com/repos/xbid-ai/xbid-ai-blog/git/trees/main?recursive=1> | 200; first-place announcement source discovered |
| A7 | 14:29:49 | <https://stellar.org/blog/ecosystem/the-story-of-kale> | 403; `error code: 1010` |
| D4 | 14:29:49 | <https://www.bing.com/search?q=%22Stellar%20Hacks%22%20%22Real-World%20ZK%22%20%22Wraith%22> | Unrelated results; no winner corroboration |
| D5 | 14:29:49 | <https://www.bing.com/search?q=%22Stellar%20Hacks%22%20%22KALE%22%20%22xbid%22%20winners> | Unrelated results; no winner corroboration |
| B8 | 14:30:15 | <https://api.github.com/repos/Klorenn/topkale/git/trees/HEAD?recursive=1> | 200; complete tree |
| B9 | 14:30:15 | <https://api.github.com/repos/JDewbey/KaleGrabRush/git/trees/HEAD?recursive=1> | 200; complete tree |
| B10 | 14:30:15 | <https://api.github.com/repos/mariaelisaaraya/GoLazyStellar/git/trees/HEAD?recursive=1> | 200; complete tree |
| B11 | 14:30:15 | <https://api.github.com/repos/MatejMecka/notcircleoftrust/git/trees/HEAD?recursive=1> | 200; complete tree |
| B12 | 14:30:15 | <https://raw.githubusercontent.com/xbid-ai/xbid-ai-blog/main/content/posts/xbid-ai-first-place-stellar-hackathon.md> | 200; team's first-place announcement |
| A8 | 14:30:15 | <https://blog.xbid.ai/posts/xbid-ai-first-place-stellar-hackathon/> | 403; `error code: 1010` |
| B13 | 14:30:30 | <https://raw.githubusercontent.com/Klorenn/topkale/b0973c01248e614a0d06b4c085bdde02e5410b14/package.json> | 200; no Stellar SDK dependency |
| B14 | 14:30:30 | <https://raw.githubusercontent.com/JDewbey/KaleGrabRush/8a51f495159b01e58eb157c41be5f4faab38bddc/package.json> | 200; JS SDK dependency |
| B15 | 14:30:30 | <https://raw.githubusercontent.com/mariaelisaaraya/GoLazyStellar/3202f08f84cdabf39a7d21b698fabce2086b46dc/Cargo.toml> | 200; Soroban SDK workspace dependency |
| B16 | 14:30:30 | <https://raw.githubusercontent.com/mariaelisaaraya/GoLazyStellar/3202f08f84cdabf39a7d21b698fabce2086b46dc/contracts/hello-world/Cargo.toml> | 200; Soroban SDK dependency |
| B17 | 14:30:30 | <https://raw.githubusercontent.com/MatejMecka/notcircleoftrust/b2e9cfa6bd4f08cc678aa6f32ac4cc7cdd44b2e6/package.json> | 200; JS SDK, Wallets Kit, Freighter |
| B18 | 14:30:30 | <https://raw.githubusercontent.com/MatejMecka/notcircleoftrust/b2e9cfa6bd4f08cc678aa6f32ac4cc7cdd44b2e6/packages/circleoftrust/package.json> | 200; JS SDK |
| B19 | 14:30:30 | <https://raw.githubusercontent.com/MatejMecka/notcircleoftrust/b2e9cfa6bd4f08cc678aa6f32ac4cc7cdd44b2e6/contracts/hello-world/Cargo.toml> | 200; Soroban SDK |
| B20 | 14:30:30 | <https://raw.githubusercontent.com/poki-tcg/wraith/fba6c96cdede0b00bc6997a2914eb82fd8be21ba/frontend/package.json> | 200; JS SDK and Wallets Kit |
| B21 | 14:30:30 | <https://raw.githubusercontent.com/poki-tcg/wraith/fba6c96cdede0b00bc6997a2914eb82fd8be21ba/sdk/package.json> | 200; JS SDK, Noir, Barretenberg |
| B22 | 14:30:30 | <https://raw.githubusercontent.com/poki-tcg/wraith/fba6c96cdede0b00bc6997a2914eb82fd8be21ba/contracts/Cargo.toml> | 200; workspace members |
| B23 | 14:30:53 | <https://raw.githubusercontent.com/poki-tcg/wraith/fba6c96cdede0b00bc6997a2914eb82fd8be21ba/contracts/wraith-pool/Cargo.toml> | 200; `soroban-sdk` dependency |
| A9 | 14:31:14; 14:31:22 | <https://developers.stellar.org/meetings/2026/06/18> | Direct GET: 403. Web page read: usable official text |
| A10 | 14:31:14; 14:31:22 | <https://developers.stellar.org/meetings/2026/07/02> | Direct GET: 403. Web page read: inaccessible |
| S11 | 14:31:14 | <https://stellarlight.xyz/api/hackathons/analyze?facet=library&winnersOnly=1&top=30> | 200; 64 placed, 45 known, 19 unknown |

The initial four DoraHacks requests ran together. Their HTTP errors did not expose the response bodies.
The second A2 request inspected the body. No DoraHacks request followed that inspection.
The wall said: “Human Verification” and “verify that you're not a robot by solving a CAPTCHA puzzle.”

The web search tool does not expose a requested search URL. These are its exact query records:

| Time | Queries and restrictions | Relevant observations |
| --- | --- | --- |
| 14:30:39 | `"Wraith" "Stellar Hacks" winner -site:dorahacks.io`; `"Stellar Hacks" "KALE" "xbid" -site:dorahacks.io`; `"Stellar Hacks" "Real-World ZK" "July 3" -site:dorahacks.io` | A search excerpt repeats the xbid announcement at <https://blog.xbid.ai/tags/ai/>. No independent Wraith placement source appeared. |
| 14:30:51 | `Wraith Stellar hackathon first place 5000`, domains `stellar.org`, `x.com`, `github.com`; `KALE Reflector hackathon 47 submissions winners`, domains `stellar.org`, `reflector.network`, `kalepail.com`; `Stellar Real World ZK hackathon July 3 2026 prize`, domain `stellar.org` | Found A9. No applicable winner-list or submission-counter corroboration appeared. |

Search result URLs are observations from an index, not additional direct page requests.
An unrelated repository named Wraith appeared. I did not substitute it for `poki-tcg/wraith`.

## Case 1: placed shares

Case: `q-scout-hackathon-placed-share-kale-vs-zk`.

Repeated numbers share one matrix row. F calculations verify arithmetic, not the underlying event rosters.

| Claim | Verdict | Class | URL | Exact observed value or calculation |
| --- | --- | --- | --- | --- |
| Key fact 1: ten KALE submissions placed | corpus-only | C; A blocked | [S3], [A1] | KALE group: `winner.builds=10`; no primary winner list obtained |
| Key fact 2: five Real-World ZK submissions placed | corpus-only | C; A blocked | [S3], [A2] | ZK group: `winner.builds=5`; no primary winner list obtained |
| Key fact 3: about 21–22% placed at KALE | corpus-only | C, F | [S3] | `10/45*100=22.222222`; external denominator variants remain unverified |
| Key fact 4: under 2% placed at Real-World ZK | corpus-only | C, F | [S3] | `5/319*100=1.567398` |
| As-of date 2026-10-06 | confirmed-as-of | C | [S3] | `generatedAt=2026-10-06T14:28:08.869Z` |
| Scout holds 45 KALE submissions | corpus-only | C | [S3] | KALE `field=45`, `builds=45`, `known=45`, `unknown=0` |
| Scout holds 319 ZK submissions | corpus-only | C | [S3] | ZK `field=319`, `builds=319`, `known=319`, `unknown=0` |
| Scout-basis KALE share is about 22% | corpus-only | C, F | [S3] | `10/45=0.22222222`; served `share=0.222` |
| Scout-basis ZK share is about 1.6% | corpus-only | C, F | [S3] | `5/319=0.01567398`; served `share=0.016` |
| DoraHacks counter shows 46 KALE submissions | unverifiable | A blocked | [A1] | HTTP 405; no counter obtained |
| DoraHacks report shows 47 KALE submissions | unverifiable | A blocked; D inconclusive | [A1], [D3], [D5] | No report retrieved; no usable corroborating result |
| DoraHacks counter shows 345 ZK submissions | unverifiable | A blocked | [A2] | Human-verification wall; no counter obtained |
| External-basis KALE share is about 21% | unverifiable | F conditional | [A1] | If denominators are accurate: `10/46=21.739130%`; `10/47=21.276596%` |
| External-basis ZK share is about 1.4% | unverifiable | F conditional | [A2] | If denominator is accurate: `5/345=1.449275%` |
| Roughly one in five KALE entries placed | corpus-only | C, F | [S3] | `10/45=1/4.5`; reasonable approximation within Scout |
| Fewer than one in fifty ZK entries placed | corpus-only | C, F | [S3] | `5/319=1/63.8 < 1/50` |
| ZK's field was about seven times larger | corpus-only | C, F | [S3] | `319/45=7.088889`; external alternatives would be `7.340426–7.5` |
| KALE “paid ten places”; ZK “paid five places” | unverifiable | C; A blocked | [S3], [A1], [A2] | Placement records do not establish completed prize payments |
| Avoid 1: the events placed a similar share | contradicted | C, F; source-scoped | [S3] | Scout comparison: `22.222222%` versus `1.567398%`, ratio `14.177778` |
| Avoid 2: ZK placed a larger share | contradicted | C, F; source-scoped | [S3] | Scout comparison: `1.567398% < 22.222222%` |

The avoid claims are false within the checked Scout snapshot.
This review lacks the independent event evidence needed to extend those verdicts beyond that source scope.

**blocker — Independent event verification remains incomplete.**

The sentence “Winner counts are confirmed by DoraHacks' published winner lists” exceeds this review's evidence.
Keep this case proposed until an independent reviewer reads the primary results without bypassing the wall.
Remove the unverified external-counter sentence if the case instead tests only Scout's snapshot.
Use this exact replacement question for that narrower case:

> As of 2026-10-06, what placed shares does Scout report for KALE x Reflector and Real-World ZK?

Use this replacement answer for that narrower case:

> Scout records 10 placed submissions among 45 KALE x Reflector submissions, about 22.2%.
> It records 5 placed submissions among 319 Real-World ZK submissions, about 1.57%.
> These are Scout's stored counts as of 2026-10-06.
> They do not establish each event's complete submission total or confirm prize payments.

This alternative changes the case's evidence scope. It does not resolve the original independent winner-list requirement.

**should-fix — Separate coverage differences from genuine source disagreement.**

Scout storage and an event's published counter can count different sets.
Two different totals therefore do not automatically contradict each other.
The proposed notes explicitly say sources disagree, but `truth.status` says `mixed`.
If the author retains a genuine unresolved same-scope disagreement, set `truth.status` to `disputed`.
Otherwise replace the disagreement sentence with:

> Scout's stored-submission total and the event's published total can have different coverage.
> State each denominator's source and date. Do not merge the totals or infer an error from their difference alone.

**should-fix — Remove payout claims.**

Replace “paid ten places” with “lists ten placed submissions”.
Replace “paid five places” with “lists five placed submissions”.

**should-fix — Make the time boundary explicit.**

For a current-data question, replace the fixed-range grading instruction with:

> Accept a dated, source-supported numerator, denominator, and calculated share, including later changes outside the example ranges.
> Do not require the historical counts when the answer clearly reports newer evidence.

`scheduled`, `asOf: 2026-10-06`, and `reverifyBy: 2027-01-06` fit the moving counts.
`mixed` fits a case containing real-world placements and corpus coverage.
The unresolved corroboration does not support unconditional activation.

Final verdict: **do-not-activate**.

## Case 2: Wraith submission

Case: `q-scout-hackathon-submission-link-wraith`.

| Claim | Verdict | Class | URL | Exact observed value or quote |
| --- | --- | --- | --- | --- |
| Key fact 1: Wraith is a Stellar privacy project | confirmed | A, B, C | [A6], [B3], [S1] | Demo: “Wraith — Privacy on Stellar”; README: “A full-privacy platform on Stellar.” |
| BUIDL 46348 identifies this submission | corpus-only | C; A blocked | [S1], [A3] | `id=dorahacks-buidl-46348`, `name=Wraith`; primary BUIDL page blocked |
| Key fact 2: entered Real-World ZK | confirmed | B, C | [B3], [S1] | README: “Submission for **Stellar Hacks: Real-World ZK**.” |
| Key fact 3: took 1st place | corpus-only | C; A blocked; D inconclusive | [S1], [A2] | `placement="1st Place - $5,000 in XLM"`; no independent result retrieved |
| Key fact 3: prize was $5,000 in XLM | corpus-only | C; A blocked | [S1], [A2] | `prizeUsd=5000`; placement includes “in XLM” |
| Prize pool was $10,000 | confirmed | A, C | [A9], [S1] | Official meeting: “$10,000 in prizes”; Scout `award="$10,000 XLM Prize"` |
| Event was an SDF hackathon on DoraHacks | confirmed | A, B, C | [A9], [B3], [S1] | SDF meeting calls it “Our Real World ZK hackathon”; its closing paragraph names DoraHacks |
| Event closed on 2026-07-03 | corpus-only | C; A blocked | [S1], [A10] | `hackathon.endedAt="2026-07-03"`; later official meeting inaccessible |
| Key fact 4: code URL is `github.com/poki-tcg/wraith` | confirmed | B, C | [B1], [B3], [S1] | Public repository `full_name="poki-tcg/wraith"`; Scout links that exact repository |
| Demo URL is `wraith-zk.vercel.app` | confirmed-as-of | A, C | [A6], [S1] | HTTP 200; title identifies Wraith; Scout's exact demo link matches |
| Team describes shielded pools and private payments, swaps, withdrawals | confirmed | B, C | [B3], [S1] | README names Bridge, Portfolio, Pay, Swap; it describes shielded balances and proof-gated actions |
| Team describes Noir/UltraHonk proofs checked by Soroban contracts | confirmed | B, C | [B3], [B21], [B23], [S1] | README names UltraHonk and Noir; manifests declare Noir, Barretenberg, and `soroban-sdk` |
| Team describes a private Ethereum-to-Stellar bridge | confirmed | B, C | [B3], [S1] | README describes Ethereum Sepolia assets arriving as shielded notes on Stellar |
| Write-up does not independently prove production shipment | confirmed | B, C | [B3], [S1] | README labels the project a hackathon work-in-progress on testnet; Scout warns that write-ups are claims |
| Avoid 1: it did not place or won no prize | unverifiable | C; A blocked | [S1], [A2] | Scout says winner; this review obtained no independent award result |
| Avoid 2: identifies ZK Gaming instead of Real-World ZK | contradicted | B, C | [B3], [S1] | Exact repository and submission both identify Real-World ZK |
| Avoid 2 extension: any attribution to another event is false | unverifiable | B, C | [B3], [S1] | These sources establish the requested event; they do not establish exclusive participation across all events |

The official June 18 page's “July 3rd” phrase concerns accelerator applications, not this hackathon.
I did not use that adjacent date as hackathon evidence.
An indexed repost suggested a deadline extension. That was insufficient to independently verify the final event date.

**blocker — The required placement and prize lack independent re-verification.**

Keep this case proposed until primary award evidence confirms the rank and amount.
Do not convert the Scout result into a confirmed real-world award through repeated Scout calls.
Pending verification, replace the notes' first sentence with:

> Scout records first place and $5,000 in XLM. Independent award verification remains incomplete because DoraHacks requires human verification.

Set `truth.status` to `unverifiable` until the required award claim meets the evidence threshold.
This is a temporary review status, not a claim that the prize is false.

**should-fix — Narrow avoid 2 to the requested submission.**

Replace it with:

> Identifies ZK Gaming, or another event, as the Real-World ZK event associated with the requested submission record.

Add this note:

> Do not reject a separately sourced statement that the project also participated in another event.

**note — The freshness choice is reasonable.**

`stable` fits the historical submission identity and award once independently confirmed.
`real-world` fits these claims. The supplied `asOf` records the review date.
The optional demo and repository availability must not become permanent availability requirements.
The existing notes already make the demo and closing date optional.

Final verdict: **do-not-activate**.

## Case 3: xbid.ai outcome

Case: `q-scout-hackathon-submission-xbid-outcome`.

| Claim | Verdict | Class | URL | Exact observed value or quote |
| --- | --- | --- | --- | --- |
| Key fact 1: multi-LLM AI agent trading on Stellar | confirmed | B, C | [B6], [S2] | README: “multi-LLM AI agent”; it describes live Stellar markets and delta-neutral strategies |
| BUIDL identifier is 32593 | confirmed | B, C | [B12], [S2] | Announcement links `https://dorahacks.io/buidl/32593/milestones`; Scout ID matches |
| Key fact 2: 1st place at KALE x Reflector | confirmed | B, C | [B12], [S2] | Team announcement: “xbid.ai won 1st place”; it names the KALE x Reflector Hackathon |
| Event closed on 2025-09-08 | corpus-only | C; A blocked | [S2], [A1] | `hackathon.endedAt="2025-09-08"`; team announcement dates the win post, not the event deadline |
| As-of date 2026-10-06 | confirmed-as-of | C | [S2], [S10] | Submission `generatedAt=2026-10-06T14:28:07.529Z` |
| Team describes delta-neutral strategies and feedback from outcomes | confirmed | B, C | [B6], [S2] | README describes AMM-hedged borrows, collateral rebalancing, factual feedback, and epistemic feedback |
| Submission tags itself with SDEX, Blend, Reflector | corpus-only | C; A blocked | [S2], [A4] | `selfTags=["layer1:Stellar","layer1:SDEX","layer2:Blend","layer2:Reflector"]` |
| Key fact 3: Scout links XBid AI | corpus-only | C | [S2], [S10] | `project.name="XBid AI"`, `project.slug="xbid-ai"`; resolver `found=true` |
| Link basis is the demo website | corpus-only | C; B supports identity | [S2], [B2], [B6] | `project.basis="website"`; organization website and repository link both identify `https://xbid.ai` |
| Key fact 4: linked directory status is Live | corpus-only | C | [S2], [S10] | `project.status="Live"`; resolver `subject.status="Live"` |
| Submitted GitHub URL identifies an organization | confirmed | B, C | [B2], [S2] | GitHub `type="Organization"`; Scout link is `https://github.com/xbid-ai`, `repo=null` |
| Scout has no submitted-repository stack or activity observation | corpus-only | C | [S2] | `stackReadAt=null`, `activityCheckedAt=null`; `stack` and `activity` absent |
| Write-up describes claims, not independent shipping proof | confirmed | B, C | [B6], [S2] | Team repository supplies product claims; Scout explicitly distinguishes claims from shipment evidence |
| Optional note: Scout showed no SCF award | corpus-only | C | [S2] | `project.scfAwarded=false`; not independent evidence of no funding |
| Avoid 1: xbid.ai did not place at KALE x Reflector | contradicted | B, C | [B12], [S2] | Team's dated first-place announcement independently supports Scout's rank |
| Avoid 2: it never became a listed Scout directory project | contradicted | C; scope-specific | [S2], [S10] | Scout returned the linked project and `found=true` on the review date |
| Avoid 2 read as any ecosystem directory | unverifiable | C | [S10] | Scout's membership cannot establish another directory's membership |

The primary team announcement supports first place. I did not independently read DoraHacks' winner list.
The current Scout listing does not establish its initial listing date or prove that the hackathon caused the listing.
The directory's `Live` label does not prove current operation of the trading application.
The direct application request returned 403, which proves neither operation nor failure.

**should-fix — Name the directory in the question and avoid clause.**

Replace the question with:

> What did xbid.ai submit to Stellar Hacks: KALE x Reflector, how did it place, and does Scout list it now?

Replace avoid 2 with:

> Claims that Scout has never listed the linked XBid AI project, despite the dated positive listing evidence.

Add this note:

> Scout listing does not establish SDF directory membership, an initial listing date, funding, or current production operation.
> Accept a newer dated Scout status or missing current record without erasing the verified historical listing.

**should-fix — Correct the independently established source.**

Replace “The first-place result is confirmed by DoraHacks' published winner list” with:

> The team's dated announcement source independently supports Scout's first-place result.
> This review could not read DoraHacks' winner list because the site required human verification.

**should-fix — Remove or attribute the optional closing date.**

Replace “which closed on 2025-09-08” with “whose Scout record gives an end date of 2025-09-08”.
Alternatively, delete that optional clause.
Label the self-tags, project link, directory status, and absent stack observations as corpus-only corroboration rows.

**note — The missing stack does not mean missing code.**

The organization has public repositories, including `xbid-ai/xbid-ai`.
Keep the answer scoped to Scout's submitted-repository observation.
The existing wording mostly preserves this boundary.

`scheduled`, `asOf: 2026-10-06`, and `reverifyBy: 2027-01-20` fit the directory state.
`mixed` fits historical product facts and current Scout records.
`confirmed` is acceptable only for the explicitly attributed claims, with corpus-only rows retained.

Final verdict: **activate-with-changes**.

## Case 4: winner libraries

Case: `q-scout-hackathon-winner-libraries-vs-field`.

| Claim | Verdict | Class | URL | Exact observed value or calculation |
| --- | --- | --- | --- | --- |
| As-of date 2026-10-06 | confirmed-as-of | C | [S4] | `generatedAt=2026-10-06T14:28:10.355Z` |
| Key fact 5: 45 placed submissions have manifest reads | corpus-only | C | [S4], [S11] | `winnersKnown=45`; filtered `known=45` |
| Key fact 5: 64 placed submissions in the store | corpus-only | C | [S3], [S11] | Placement total `winner.builds=64`; filtered `builds=64` |
| JS SDK count among read placed submissions is 35 | corpus-only | C; B sample | [S4], [B14], [B17], [B20] | `winners=35`; sampled manifests independently contain the package |
| Key fact 1: JS SDK ranks first at about 78% | corpus-only | C, F | [S4] | `35/45=77.777778%`; served `winnersShare=0.778`; largest placed count |
| Soroban Rust SDK count is 26 | corpus-only | C; B sample | [S4], [B15], [B19], [B23] | `winners=26`; sampled manifests independently declare `soroban-sdk` |
| Key fact 2: Soroban Rust SDK ranks second at about 58% | corpus-only | C, F | [S4] | `26/45=57.777778%`; served `winnersShare=0.578`; second-largest placed count |
| Non-placed submissions with manifest reads number 967 | corpus-only | C | [S4] | `othersKnown=967` |
| JS SDK share among the others is about 77% | corpus-only | C, F | [S4] | `others=743`; `743/967=76.835574%`; served `othersShare=0.768` |
| Rust SDK share among the others is about 66% | corpus-only | C, F | [S4] | `others=642`; `642/967=66.390900%`; served `othersShare=0.664` |
| Key fact 3: JS SDK lift is about 1.0 | corpus-only | C, F | [S4] | `(35/45)/(743/967)=1.012263`; served `lift=1.01` |
| Rust SDK lift is about 0.9 | corpus-only | C, F | [S4] | `(26/45)/(642/967)=0.870267`; served `lift=0.87` |
| Wallets Kit count is 16 | corpus-only | C; B sample | [S4], [B17], [B20] | `winners=16`; sample manifests independently contain Wallets Kit |
| Wallets Kit placed share is about 36% | corpus-only | C, F | [S4] | `16/45=35.555556%`; served `winnersShare=0.356` |
| Wallets Kit others' share is about 27% | corpus-only | C, F | [S4] | `others=258`; `258/967=26.680455%`; served `othersShare=0.267` |
| Key fact 4: Wallets Kit lift is about 1.3 | corpus-only | C, F | [S4] | `(16/45)/(258/967)=1.332644`; served `lift=1.33` |
| Freighter direct dependency count is 7 | corpus-only | C; B sample | [S4], [B17] | `winners=7`; sample declares `@stellar/freighter-api` directly |
| Freighter placed share is about 16% | corpus-only | C, F | [S4] | `7/45=15.555556%`; served `winnersShare=0.156` |
| Freighter others' share is about 37% | corpus-only | C, F | [S4] | `others=358`; `358/967=37.021717%`; served `othersShare=0.37` |
| Freighter lift is about 0.4 | corpus-only | C, F | [S4] | `(7/45)/(358/967)=0.420174`; served `lift=0.42` |
| “Shares count only repos whose manifests were read, so they are a floor” | disputed | C, F | [S4], [S11] | 19 placed submissions are unknown. Full-set JS share can range from `35/64` to `54/64` |
| Core measured package shares are broadly similar | corpus-only | C, F | [S4] | JS shares `0.778` versus `0.768`; Rust shares `0.578` versus `0.664` |
| Declared dependencies establish neither causation nor actual usage | confirmed | B, C | [B13], [B17], [S4] | Manifests expose declarations; the API compares counts without causal evidence |
| Avoid 1: winners use JS SDK far more often | contradicted | C, F; declared-package scope | [S4] | Measured declaration lift is `1.01`, not a large difference |
| Avoid 2: every placed submission declares JS SDK | contradicted | B, C | [S6], [B8], [B13] | Top Kale is a stored placed build; its complete manifest set has no JS SDK dependency |
| Grader note: an independent read of eight repos matched | unverifiable | Not evidence available to this review | [S5] | I did not read the author's evidence. My independently checked sample contains five repositories |

The counts describe submission records. The contract does not promise distinct, deduplicated repositories.
The comparison describes current manifest reads, not necessarily the code used when judges selected winners.
The sample corroborates real repositories and selected declarations. It does not independently reproduce the complete aggregate counts.

### Independent repository sample

| Scout submission | Source code evidence | Exact observation |
| --- | --- | --- |
| Wraith, [S1] | [B20], [B21], [B23] | JS SDK `^14.6.1`; Wallets Kit `1.9.5`; Soroban SDK `26.0.1` |
| Top Kale, [S6] | [B8], [B13] | Complete tree has one `package.json`; dependencies are `discord.js`, `axios`, `node-cron`, `dotenv` |
| Kale Grab Rush, [S7] | [B9], [B14] | JS SDK `^13.3.0` |
| GoLazy, [S8] | [B10], [B15], [B16] | Workspace `soroban-sdk = "22.0.0"`; child manifest uses that dependency |
| Not Circle of Trust, [S9] | [B11], [B17], [B18], [B19] | JS SDK `^14.1.0`; Wallets Kit `^1.8.0`; Freighter `^4.1.0`; Soroban workspace dependency |

All five sampled repositories exist outside Scout. All checked package observations match Scout's corresponding stack rows.
Repository presence does not independently corroborate every placement label in Scout's complete roster.
The xbid project supplies an additional external repository footprint, but it is outside this five-repository manifest sample.

**blocker — The lower-bound statement is mathematically false.**

The 78% figure uses 45 read submissions as its denominator.
With 19 unknown submissions, the full placed-set JS proportion can range from 54.6875% to 84.375%.
Thus the measured share can exceed the full-set share. It is not a lower bound.

Replace the sentence with:

> Shares use submissions with manifest reads as their denominator. Unknown submissions remain separate.
> These observed shares are not lower bounds for all submissions.

Do not keep `truth.status: confirmed` while retaining the false statement.
After correction, `confirmed` can describe the explicitly source-relative observation, with corpus-only aggregate rows.

**blocker — Fixed ordering and lift conditions can reject a correct future answer.**

The notes accept newer figures only when the ordering and near-1.0 lift persist.
An accurate future answer could fail those conditions after new events or repository reads.
The question asks a current comparison, not a frozen October snapshot.

Replace the grader notes with:

> These figures describe Scout's stored submissions on 2026-10-06.
> Accept newer dated, source-supported counts, rankings, and lifts, including changed ordering or conclusions.
> Require the stated corpus scope, known denominators, unknown counts, and correct comparison arithmetic.
> A dependency declaration does not prove use during the event or a causal effect on placement.
> An independent five-repository sample corroborated selected manifest declarations. It did not reproduce the aggregate counts.
> Library groups combine sibling or renamed packages according to Scout's returned definition.

Replace the five key facts with:

1. States Scout's corpus scope and observation date.
2. Compares declared libraries between placed and non-placed submissions with manifest reads.
3. Uses separate known denominators and reports unknown submissions without treating them as non-users.
4. Derives each stated share and lift from the current returned counts.
5. Reports the observed ordering without requiring the October 2026 ordering to persist.

Replace avoid 1 with:

> Claims substantially higher JS SDK declaration rates for winners when the cited counts show approximately equal rates.

Replace avoid 2 with:

> Claims every placed submission declares the JS SDK when the evidence identifies placed submissions without that declaration.

These conditions make the avoid clauses depend on visible evidence rather than a permanent expected result.

**should-fix — State the sampling unit and measured scope.**

Replace the question with:

> In Scout's stored hackathon submissions, how do declared Stellar libraries differ between placed submissions and the rest?

Replace “repos read” with “submissions with manifest reads” throughout the answer.
Add this sentence:

> The package observations describe the repository reads, not necessarily the code submitted at the event deadline.

**note — The freshness metadata has the correct structure.**

`scheduled`, `asOf: 2026-10-06`, and `reverifyBy: 2027-01-13` fit the changing sample.
`corpus-grounded` fits the measurement. No independently verified global library-use statistic emerged from this review.

Final verdict: **activate-with-changes**.

## Operation answerability

I inspected `inventory/stellar-light.json` for the two required paths and the xbid search operation.

| Case | Supported call | Assessment |
| --- | --- | --- |
| Placed shares | `scout.analyzeHackathonSubmissions({facet: "placement", by: "event"})` | Returns both event titles, stored denominators, winner counts, and date. It cannot establish DoraHacks' external counters or paid prizes. |
| Wraith | `scout.getHackathonSubmission({id: "46348"})` | Returns identity, event, placement, amount, write-up, and links. It does not independently verify its upstream awards. |
| xbid.ai | `scout.searchHackathonBuilds({q: "xbid.ai"})`, then `scout.getHackathonSubmission({id: "32593"})` | Contracts support discovery and full detail. The live detail supplied the website-based project link and directory status. |
| Libraries | `scout.analyzeHackathonSubmissions({facet: "library", top: 30})` | Returns `winnersVsOthers`, both known denominators, library counts, shares, and lifts. |

The xbid search example follows the inspected contract. I did not run that exact search request.
For the library comparison, do not use `winnersOnly=1` as the sole query.
That filter removes the non-placed population. My S11 probe returned the winner-only totals without the comparison block.

The placement analysis answers the core share question through the named operation.
The external DoraHacks counter details exceed that operation's returned evidence.
The Wraith and xbid detail operation supports source-attributed answers, including its warning about self-reported write-ups.

## Duplicate and boundary review

I ran the equivalent requested search with `rg -l -i hackathon eval/qa/corpus/battery`.
I also searched the whole battery for Wraith, xbid, both event names, winner-library phrases, and placed-share phrases.

The hackathon search identified these 24 existing cases:

- `q-edge-open-world-recovery-after-narrow-miss`
- `q-hist-meridian-2026-corrected-venue`
- `q-gap-contracts-domain-empty`
- `q-tool-zk-repo-live`
- `q-defi-reflector-oracle`
- `q-eco-most-active-defi-projects`
- `q-defi-streaming-payments-prior-art`
- `q-defi-agent-identity-stellar-experimental`
- `q-gap-compare-hackathons`
- `q-scf-hackathons-active`
- `q-scf-ecosystem-listing-partner-jobs`
- `q-scf-regional-india`
- `q-scf-kale-winner-live`
- `q-tool-oracle-repo-live`
- `q-tool-passkey-repo-live`
- `q-scf-hackathon-compare-live`
- `q-scout-hackathon-brief-first-hour`
- `q-gap-hackathon-winner-order`
- `q-scf-confidential-tokens-preview`
- `q-gap-upcoming-hackathon-fallback`
- `q-scf-rfps-hackathons-live`
- `q-scf-blend-winners-live`
- `q-scf-current-hackathons-compare-live`
- `q-gap-hackathon-brief-evidence-boundaries`

| Pair or boundary | Finding |
| --- | --- |
| xbid outcome / `q-scf-kale-winner-live` | Partial overlap: both ask first place. The proposal additionally tests the write-up and directory link. No factual contradiction. |
| Placed shares / `q-scf-hackathon-compare-live` | Partial overlap: both compare event counts. Existing case compares KALE against Blend; proposal compares KALE against Real-World ZK. |
| Placed shares / `q-gap-compare-hackathons` | Both can be true. The existing case describes `compareHackathons`; the proposal uses the dedicated analysis operation. |
| Wraith and xbid / `q-gap-hackathon-winner-order` | No factual contradiction. Explicit `placement` fields provide ranks; array order remains insufficient. |
| Wraith / `q-scf-hackathons-active` | Both state a July 3, 2026 end date. This is corpus consistency, not independent date corroboration. |
| Wraith / `q-scf-confidential-tokens-preview` | No contradiction. A separate team's privacy project does not change the official Confidential Tokens preview's privacy boundary. |
| Library proposal / existing battery | No direct duplicate library-share case found. |

**should-fix — Existing workflow requirements overstate operation exclusivity.**

The existing KALE first-place case requires `getHackathons` followed by `getHackathon`.
The existing winner-order case directs answers to `getHackathon` detail.
The new submission detail contract also returns explicit placement evidence.
Thus the cases have a grading-path conflict, although their factual claims can all be true.

In `q-scf-kale-winner-live`, replace the first two workflow key facts with:

> Resolves the exact event or submission identity through a supported operation.
> Uses current event or submission detail and cites its source and observation time.

In `q-gap-hackathon-winner-order`, replace its first key fact with:

> Uses explicit placement fields from event or submission detail, rather than array order, to report rank.

No pair contains an established, mutually exclusive factual claim in the inspected judge-facing text.
The existing workflow constraints need reconciliation before the new operation becomes an accepted alternative across these cases.

## Required disposition

Keep the placed-share and Wraith proposals inactive until independent primary result verification succeeds.
Correct the xbid source attribution, directory scope, and optional closing-date wording before activation.
Correct the library lower-bound error and the fixed future grading requirements before activation.
Preserve the source-access failures in activation evidence. Do not replace them with the author's uninspected evidence.

[S1]: https://stellarlight.xyz/api/hackathons/builds/46348
[S2]: https://stellarlight.xyz/api/hackathons/builds/32593
[S3]: https://stellarlight.xyz/api/hackathons/analyze?facet=placement&by=event
[S4]: https://stellarlight.xyz/api/hackathons/analyze?facet=library&top=30
[S5]: https://stellarlight.xyz/api/hackathons/builds?winnersOnly=1&limit=100
[S6]: https://stellarlight.xyz/api/hackathons/builds/32665
[S7]: https://stellarlight.xyz/api/hackathons/builds/32481
[S8]: https://stellarlight.xyz/api/hackathons/builds/28437
[S9]: https://stellarlight.xyz/api/hackathons/builds/32673
[S10]: https://stellarlight.xyz/api/projects/resolve?q=xbid.ai
[S11]: https://stellarlight.xyz/api/hackathons/analyze?facet=library&winnersOnly=1&top=30
[A1]: https://dorahacks.io/hackathon/stellar-hacks-kale-reflector/winner
[A2]: https://dorahacks.io/hackathon/stellar-hacks-zk/winner
[A3]: https://dorahacks.io/buidl/46348
[A4]: https://dorahacks.io/buidl/32593
[A5]: https://xbid.ai
[A6]: https://wraith-zk.vercel.app
[A7]: https://stellar.org/blog/ecosystem/the-story-of-kale
[A8]: https://blog.xbid.ai/posts/xbid-ai-first-place-stellar-hackathon/
[A9]: https://developers.stellar.org/meetings/2026/06/18
[A10]: https://developers.stellar.org/meetings/2026/07/02
[B1]: https://api.github.com/repos/poki-tcg/wraith
[B2]: https://api.github.com/orgs/xbid-ai
[B3]: https://raw.githubusercontent.com/poki-tcg/wraith/main/README.md
[B4]: https://api.github.com/repos/poki-tcg/wraith/git/trees/main?recursive=1
[B5]: https://api.github.com/orgs/xbid-ai/repos?per_page=100
[B6]: https://raw.githubusercontent.com/xbid-ai/xbid-ai/main/README.md
[B7]: https://api.github.com/repos/xbid-ai/xbid-ai-blog/git/trees/main?recursive=1
[B8]: https://api.github.com/repos/Klorenn/topkale/git/trees/HEAD?recursive=1
[B9]: https://api.github.com/repos/JDewbey/KaleGrabRush/git/trees/HEAD?recursive=1
[B10]: https://api.github.com/repos/mariaelisaaraya/GoLazyStellar/git/trees/HEAD?recursive=1
[B11]: https://api.github.com/repos/MatejMecka/notcircleoftrust/git/trees/HEAD?recursive=1
[B12]: https://raw.githubusercontent.com/xbid-ai/xbid-ai-blog/main/content/posts/xbid-ai-first-place-stellar-hackathon.md
[B13]: https://raw.githubusercontent.com/Klorenn/topkale/b0973c01248e614a0d06b4c085bdde02e5410b14/package.json
[B14]: https://raw.githubusercontent.com/JDewbey/KaleGrabRush/8a51f495159b01e58eb157c41be5f4faab38bddc/package.json
[B15]: https://raw.githubusercontent.com/mariaelisaaraya/GoLazyStellar/3202f08f84cdabf39a7d21b698fabce2086b46dc/Cargo.toml
[B16]: https://raw.githubusercontent.com/mariaelisaaraya/GoLazyStellar/3202f08f84cdabf39a7d21b698fabce2086b46dc/contracts/hello-world/Cargo.toml
[B17]: https://raw.githubusercontent.com/MatejMecka/notcircleoftrust/b2e9cfa6bd4f08cc678aa6f32ac4cc7cdd44b2e6/package.json
[B18]: https://raw.githubusercontent.com/MatejMecka/notcircleoftrust/b2e9cfa6bd4f08cc678aa6f32ac4cc7cdd44b2e6/packages/circleoftrust/package.json
[B19]: https://raw.githubusercontent.com/MatejMecka/notcircleoftrust/b2e9cfa6bd4f08cc678aa6f32ac4cc7cdd44b2e6/contracts/hello-world/Cargo.toml
[B20]: https://raw.githubusercontent.com/poki-tcg/wraith/fba6c96cdede0b00bc6997a2914eb82fd8be21ba/frontend/package.json
[B21]: https://raw.githubusercontent.com/poki-tcg/wraith/fba6c96cdede0b00bc6997a2914eb82fd8be21ba/sdk/package.json
[B22]: https://raw.githubusercontent.com/poki-tcg/wraith/fba6c96cdede0b00bc6997a2914eb82fd8be21ba/contracts/Cargo.toml
[B23]: https://raw.githubusercontent.com/poki-tcg/wraith/fba6c96cdede0b00bc6997a2914eb82fd8be21ba/contracts/wraith-pool/Cargo.toml
[D1]: https://www.google.com/search?q=%22Stellar%20Hacks%22%20%22KALE%22%20%22xbid%22%20winners
[D2]: https://www.google.com/search?q=%22Stellar%20Hacks%22%20%22Real-World%20ZK%22%20%22Wraith%22
[D3]: https://www.google.com/search?q=%22Stellar%20Hacks%22%20%22Reflector%22%20%2247%22
[D4]: https://www.bing.com/search?q=%22Stellar%20Hacks%22%20%22Real-World%20ZK%22%20%22Wraith%22
[D5]: https://www.bing.com/search?q=%22Stellar%20Hacks%22%20%22KALE%22%20%22xbid%22%20winners
