# Independent golden QA review: pass 2

Review date: 2026-10-06. All observation times below use UTC.

| Case | Final verdict |
| --- | --- |
| `q-scout-hackathon-placed-share-kale-vs-zk` | **do-not-activate** |
| `q-scout-hackathon-submission-link-comet-hoops` | **activate-with-changes** |
| `q-scout-hackathon-submission-xbid-outcome` | **activate-with-changes** |
| `q-scout-hackathon-winner-libraries-vs-field` | **activate** |

The library corrections resolve its blockers. I accept the partial declines in reconciliation rows 12 and 13.
The new Comet case has independently corroborated second-place evidence. Its note incorrectly describes Scout's missing evidence.
The complete KALE and Real-World ZK winner totals still lack independent corroboration beyond DoraHacks and its downstream records.
The optional submission-end dates remain dependent on supplied DoraHacks captures and downstream Scout records.

## Method and source limits

I read the revised claims, reconciliation, supplied captures, and relevant parts of the author's round ledger.
I also inspected the judge's freshness instruction, the operation contracts, and the recorded follow-up task.
I used the golden-truth skill already read in pass 1.
This report is the only file I wrote in pass 2.
I ran no evaluations, commits, deployments, or repository code.

The requested DoraHacks page-read attempt returned HTTP 405.
Pass 1 established a human-verification wall with that response status.
I stopped further DoraHacks requests. I did not try the remaining DoraHacks pages or change the request identity.
The pass-2 page reader did not expose a new CAPTCHA body; it reported only HTTP 405.

The Reddit page reader initially returned a cache miss.
Its canonical URL, with a trailing slash, returned the complete announcement without a verification wall.
A separate direct Reddit JSON request returned HTTP 403. I made no further Reddit JSON requests.

Supplied captures are usable primary records under this brief. They remain weaker than my own successful page reads.
Their hashes identify the author's claimed original responses. I did not obtain those original response bytes to recompute the hashes.
Reading the same DoraHacks publication through another transport does not create another independent source class.
Scout records derived from DoraHacks do not supply an independent witness for DoraHacks' complete winner lists.

Class A means primary publication. `A, supplied` identifies an author-supplied capture.
Class B means repository content. Class C means Scout's live API.
Class D includes independently published community announcements obtained through web research.
Class F below means local arithmetic or timestamp conversion. It does not independently verify the input facts.

## Pass-2 request log

Times identify request starts, rounded to seconds. Repeated requests appear together where practical.
Scout requests had at least one second between them.

| ID | Time | Requested URL | Observation |
| --- | --- | --- | --- |
| DH | 14:43:46 | <https://dorahacks.io/hackathon/stellar-hacks-kale-reflector/report> | Page reader: HTTP 405. Stopped DoraHacks access. |
| R0 | 14:43:58; 14:44:15 | <https://www.reddit.com/r/Stellar/comments/1lzrofu/announcing_the_winners_of_the_stellar_hacks_blend> | Reader: cache miss. Direct GET: 200, but extracted text only said “Reddit”. |
| CM | 14:43:59 | <https://api.github.com/repos/Hoops-Finance/cometswap> | 200; public repository, branch `main`. |
| SC | 14:44:00 | <https://stellarlight.xyz/api/hackathons/builds/27417> | 200; Comet x Hoops Finance, Blend, second place. |
| SX | 14:44:01 | <https://stellarlight.xyz/api/hackathons/builds/32593> | 200; xbid.ai, first place, linked XBid AI project. |
| SP | 14:44:03 | <https://stellarlight.xyz/api/hackathons/analyze?facet=placement&by=event> | 200; unchanged stored counts. |
| SL | 14:44:04 | <https://stellarlight.xyz/api/hackathons/analyze?facet=library&top=30> | 200; unchanged library counts and lifts. |
| CR | 14:44:15 | <https://raw.githubusercontent.com/Hoops-Finance/cometswap/main/README.md> | 200; CometUI x Hoops Finance Swapper. |
| CT | 14:44:15 | <https://api.github.com/repos/Hoops-Finance/cometswap/git/trees/main?recursive=1> | 200; complete tree, SHA `51f3069eead8cef558f465cc00cef129a0bc91eb`. |
| CD | 14:44:15 | <https://comet.hoops.finance> | 403; `error code: 1010`. No deployment conclusion. |
| XB | 14:44:15 | <https://raw.githubusercontent.com/xbid-ai/xbid-ai-blog/main/content/posts/xbid-ai-first-place-stellar-hackathon.md> | 200; team's first-place announcement. |
| RB | 14:44:27 | <https://www.reddit.com/r/Stellar/comments/1lzrofu/announcing_the_winners_of_the_stellar_hacks_blend/> | Page reader returned full winner announcement. |
| RJ | 14:44:29 | <https://www.reddit.com/r/Stellar/comments/1lzrofu/announcing_the_winners_of_the_stellar_hacks_blend.json> | 403; no usable JSON. |
| CU | 14:44:29; 14:46:02 | <https://raw.githubusercontent.com/Hoops-Finance/cometswap/51f3069eead8cef558f465cc00cef129a0bc91eb/src/components/ui/crypto-swap-demo.tsx> | 200; USDC/BLND swap code. Second read checked deposit-related terms. |
| CP | 14:44:29 | <https://raw.githubusercontent.com/Hoops-Finance/cometswap/51f3069eead8cef558f465cc00cef129a0bc91eb/package.json> | 200; frontend dependency manifest. |
| TW | 14:44:38 | <https://remaja.twstalker.com/boyanxyz> | Reader cache miss. No full announcement obtained. |
| RK | 14:45:13; 14:45:24 | <https://www.reddit.com/r/Stellar/comments/1mvm0lo/build_defi_games_on_stellar_our_12000_kale_x/> | KALE launch announcement: ten winning spots; original deadline September 1. |
| SD | 14:45:24 | <https://developers.stellar.org/meetings/2026/06/25> | Reader could not access the page. |
| SB | 14:45:59; 14:46:22 | <https://stellarlight.xyz/api/hackathons/builds/27438> | 200; Blend Pool Creator exists, associated with PaltaLabs, `placement=null`, `isWinner=false`. |
| ST | 14:46:00 | <https://stellarlight.xyz/api/hackathons/builds/32665> | 200; Top Kale, sixth place, `stack=[]`. |
| TM | 14:46:01 | <https://raw.githubusercontent.com/Klorenn/topkale/b0973c01248e614a0d06b4c085bdde02e5410b14/package.json> | 200; no Stellar JS SDK declaration. |
| SS | 14:46:23 | <https://stellarlight.xyz/api/hackathons/builds?q=Blend%20Pool%20Creator&limit=5> | First hit is BUIDL 27438 under PaltaLabs, without placement. |

The search tool exposes query text, not a requested search URL.

| Time | Exact queries | Relevant result |
| --- | --- | --- |
| 14:44:13 | `site:reddit.com/r/Stellar/comments/1lzrofu "Comet"`; `"Stellar Hacks" "KALE" "10" winners -site:dorahacks.io -site:stellarlight.xyz`; `"Stellar Hacks" "Real-World ZK" "winners" -site:dorahacks.io -site:stellarlight.xyz` | No independently verified complete final winner count. An indexed social repost mentioned a ZK result announcement. |
| 14:45:13 | `"Stellar Hacks: Blend" "July 7" -site:dorahacks.io -site:stellarlight.xyz`; `"KALE" "Reflector" "September 8" hackathon -site:dorahacks.io -site:stellarlight.xyz`; `"Real-World ZK" "five" "winners" -site:dorahacks.io -site:stellarlight.xyz` | An official meeting index describes five planned ZK prizes. No independent exact final closing-date evidence appeared. |

Relevant search-only URLs were <https://developers.stellar.org/meetings/tags/developer>, <https://www.startupgrantsindia.com/stellar-hacks-real-world-zk>, and <https://blog.xbid.ai/tags/ai/>.
The grant listing explicitly says it cannot verify a selection list. It does not corroborate the final winners.
The official meeting excerpt supports five planned prizes. A planned prize count does not establish the final award count.
The indexed social repost mentioned 380+ ZK submissions. I did not treat that unverified excerpt as an approved-project total.

## Supplied primary captures

These are not new requests by this reviewer.
The source file is `.agents/rounds/2026-10-06-scout-hackathon-goldens/dorahacks-captures.json`.

| ID | Captured URL | Author's capture time | Author's HTML SHA-256 |
| --- | --- | --- | --- |
| AK | <https://dorahacks.io/hackathon/stellar-hacks-kale-reflector/winner> | 2026-10-06T14:19:17Z | `59ac134386c0df2073bc7156ee3c0678dd29c8d6715b72fc1dbefac04ce3095c` |
| AZ | <https://dorahacks.io/hackathon/stellar-hacks-zk/winner> | 2026-10-06T14:19:19Z | `8b4636f69ca375e0191861c67454cc9a75d28a2422f8747fa32c01ac312a3845` |
| AB | <https://dorahacks.io/hackathon/stellar-hacks-blend/winner> | 2026-10-06T14:40:08Z | `0fa40a0778a0fd96d6d397813fa769afe2460727f781cd2eba1861b6bea9d1c5` |
| AX | <https://dorahacks.io/buidl/32593> | 2026-10-06T14:24:12Z | `061a31bb5ec516e3b0b42afd080617e74887e275563e1370a1b53aa6076a9216` |
| AC | <https://dorahacks.io/buidl/27417> | 2026-10-06T14:40:10Z | `f490d0bae7fad951772cfd0bf4728451937a051deca0d32df5b3b46571ec2ae6` |

The 46/47/345 primary totals rest only on these supplied captures in my review.
The full final ten-project and five-project winner lists also rest on these captures outside Scout's downstream records.
The exact Blend and KALE submission-end timestamps rest on these captures outside Scout's downstream records.
The xbid self-tags have supplied primary capture support; I independently reread their Scout copy.
Comet's second place and the three-project Blend winner list have separate, successful Reddit verification.

## 1. Placed-share case

`q-scout-hackathon-placed-share-kale-vs-zk`

`confirmed-as-of` below can confirm what a captured publication reports. It does not imply a second independent final-result witness.

| Claim | Verdict | Class | Source URL | Exact observation |
| --- | --- | --- | --- | --- |
| KF1: ten KALE submissions placed | unverifiable | A supplied; C downstream; D partial | [AK], [SP], [RK] | Capture lists ranks 1–10. Scout says 10. Reddit advertises ten winning spots, before judging. Independent final-count threshold remains unmet. |
| KF2: five ZK submissions placed | unverifiable | A supplied; C downstream | [AZ], [SP] | Capture lists ranks 1–5. Scout says 5. Outside sources establish planned prizes, not the final complete roster. |
| KF3: about 21–22% at KALE | confirmed-as-of | A supplied, C, F | [AK], [SP] | Source-relative arithmetic: `10/45=22.222222%`, `10/46=21.739130%`, `10/47=21.276596%`. |
| KF4: under 2% at ZK | confirmed-as-of | A supplied, C, F | [AZ], [SP] | `5/319=1.567398%`; `5/345=1.449275%`. This confirms the source-relative calculation. |
| As-of 2026-10-06 | confirmed-as-of | C | [SP] | `generatedAt=2026-10-06T14:44:03.271Z`. |
| Scout KALE denominator 45 | corpus-only | C | [SP] | KALE `field=45`, `known=45`, `unknown=0`. |
| Scout ZK denominator 319 | corpus-only | C | [SP] | ZK `field=319`, `known=319`, `unknown=0`. |
| Scout KALE share about 22% | corpus-only | C, F | [SP] | `10/45`; served share `0.222`. |
| Scout ZK share about 1.6% | corpus-only | C, F | [SP] | `5/319`; served share `0.016`. |
| DoraHacks KALE counter 46 | confirmed-as-of | A supplied only | [AK] | Captured `buidlsCount=46`. |
| DoraHacks KALE summary 47 | confirmed-as-of | A supplied only | [AK] | Captured text: “47 approved project submissions”. |
| DoraHacks ZK total 345 | confirmed-as-of | A supplied only | [AZ] | Captured `buidlsCount=345`; summary says “approving 345 projects”. |
| External-basis KALE share about 21% | confirmed-as-of | A supplied, F | [AK] | `21.739130%` or `21.276596%`. “About 21%” is coarse; the notes accept 21–22%. |
| External-basis ZK share about 1.4% | confirmed-as-of | A supplied, F | [AZ] | `1.449275%`. |
| Roughly one in five KALE entries | confirmed-as-of | A supplied, C, F | [AK], [SP] | One in `4.5`, `4.6`, or `4.7`, by denominator. |
| Fewer than one in fifty ZK entries | confirmed-as-of | A supplied, C, F | [AZ], [SP] | One in `63.8` or `69`; both below a 2% share. |
| ZK field about seven times larger | confirmed-as-of | A supplied, C, F | [AK], [AZ], [SP] | `319/45=7.088889`; `345/47=7.340426`; `345/46=7.5`. |
| Lists ten and five placed submissions | confirmed-as-of | A supplied, C | [AK], [AZ], [SP] | Exact list lengths in supplied summaries and matching stored counts. No payment inference. |
| Avoid 1: similar placed shares | contradicted | A supplied, C, F; source-scoped | [AK], [AZ], [SP] | Every supplied comparison gives approximately 21–22% versus 1.4–1.6%. |
| Avoid 2: ZK share is larger | contradicted | A supplied, C, F; source-scoped | [AK], [AZ], [SP] | Every supplied comparison has the opposite ordering. |

The figures are internally consistent. I found no evidence that the ten or five totals are false.
However, the complete final counts do not meet the independent corroboration requirement.
The xbid post verifies one KALE winner. It cannot establish the other nine places or the complete ZK outcome.
The second DoraHacks retrieval route changes accessibility, not source independence.

**Remaining blocker: reconciliation row 1 is only partly resolved.**

The skill requires at least two independent classes for numeric facts, including a primary class.
The reconciliation applies this distinction when rejecting Wraith's individual placement.
Apply the same distinction to the complete final winner totals.
Keep this proposal inactive until a separate applicable source corroborates those final totals.

Exact interim corroboration changes:

> Change both unconditional `confirmed` final-winner-count rows to `unverifiable` pending independent final-result corroboration.
> Record that DoraHacks' captured final lists and Scout's derived counts agree.
> Do not count the second retrieval route or planned prize counts as independent final-result confirmation.

A source-relative rewrite is another option, but it changes the tested claim.
Its exact key facts would read:

1. Scout records ten placed KALE x Reflector submissions in the dated snapshot.
2. Scout records five placed Real-World ZK submissions in the dated snapshot.
3. Computes each share using that source's stated denominator.
4. Separates Scout's stored coverage from DoraHacks' published totals.

That alternative needs its own activation decision. This review does not silently substitute it for the revised case.

The coverage, payment, and later-value notes resolve pass-1 findings 2, 3, and 4.
`scheduled`, `mixed`, `asOf: 2026-10-06`, and `reverifyBy: 2027-01-06` remain suitable.
Use `truth.status: unverifiable` while required final-result corroboration remains incomplete.
Do not use `disputed` merely because the storage coverage differs.

Final verdict: **do-not-activate**.

## 2. Comet x Hoops Finance case

`q-scout-hackathon-submission-link-comet-hoops`

I independently read the public repository and the separate Reddit winner announcement.
I also read the live submission record and checked the supplied primary capture.

| Claim | Verdict | Class | Source URL | Exact observation |
| --- | --- | --- | --- | --- |
| KF1: identity is Comet x Hoops Finance | confirmed | A supplied, B, C, D | [AC], [CR], [SC], [RB] | Capture and API use that name. README says “CometUI x Hoops Finance Swapper”. Reddit names the same second-place entry. |
| KF1: swap interface for Blend's backstop | confirmed | A supplied, B, C, D | [AC], [CU], [SC], [RB] | Reddit describes integration of Blend backstop liquidity into the Comet swap interface. Code contains USDC/BLND swap methods. |
| BUIDL 27417 | confirmed | A supplied, B, C | [AC], [CM], [SC] | Capture `id=27417`; API `id=dorahacks-buidl-27417`; linked repository identifies the same product. |
| KF2: entered Stellar Hacks: Blend | confirmed | A supplied, C, D | [AB], [SC], [RB] | Reddit announcement title names the Blend hackathon; Comet appears in its winner list. |
| KF3: took 2nd place | confirmed | A supplied, C, D | [AB], [SC], [RB] | Reddit: “2nd Place: Comet x Hoops Finance”; API `placement="2nd Place"`. |
| Three Blend composability winners | confirmed | A supplied, D | [AB], [RB] | Both list Blend Pool Creator first, Comet second, YieldBack.Cash third. |
| SDF organized the DoraHacks event | confirmed-as-of | A supplied, C | [AB], [SC] | Capture `organizer="Stellar Development Foundation"`; API associates the submission with the captured DoraHacks event. Primary organizational attribution rests on the capture. |
| Submission period ended 2025-07-07 | unverifiable | A supplied, C downstream, F | [AB], [SC] | Captured `timelineEnd=1751871600` converts to `2025-07-07T07:00:00Z`. Scout says `2025-07-07`. No independent date witness found. |
| KF4: repository is `github.com/hoops-finance/cometswap` | confirmed | A supplied, B, C | [AC], [CM], [CR], [SC] | GitHub `full_name="Hoops-Finance/cometswap"`; submitted link differs only by case. |
| Team claims USDC/BLND conversion | confirmed | A supplied, B, C | [AC], [CU], [SC] | Source uses `ticker: "USDC"`, `ticker: "BLND"`, `swap_exact_amount_in`, and `swap_exact_amount_out`. |
| Team claims a backstop deposit in one click | confirmed | A supplied, C; self-report only | [AC], [SC] | Captured description says “deposit directly into the Backstop with a single click”. This confirms the stated claim, not operation. |
| Demo link is `comet.hoops.finance` | confirmed-as-of | A supplied, C, D | [AC], [SC], [RB] | All link that domain. My direct request returned 403, so availability is unverified. |
| Write-up is not independent proof of shipment | confirmed | B, C | [CU], [SC] | Source code exists; the API explicitly warns that the write-up is a claim. No deployed transaction test ran. |
| Avoid 1: submission did not place | contradicted | A supplied, C, D | [AB], [SC], [RB] | Both publications award second place; Scout agrees. |
| Avoid 2: took 1st place at Blend | contradicted | A supplied, C, D | [AB], [SC], [RB] | Both publications give first place to Blend Pool Creator and second place to Comet. |
| Note: first place went to Blend Pool Creator | confirmed | A supplied, D | [AB], [RB] | Reddit: “1st Place: Blend Pool Creator”. |
| Note: Scout's store does not hold Blend Pool Creator | disputed | C | [SB], [SS] | Both endpoints return BUIDL 27438. Its recorded event is PaltaLabs, with `placement=null` and `isWinner=false`. |

**New should-fix: the missing-record note is false as written.**

Scout holds the build. Its stored event association does not preserve the Blend first-place result.
This distinction matters because “missing submission” and “missing event placement” identify different defects.
I do not infer why Scout records PaltaLabs. The record could represent another event association.

Replace the last grader-note sentence with:

> First place at Blend went to Blend Pool Creator; an answer need not name it.
> On 2026-10-06, Scout returned BUIDL 27438 under PaltaLabs, with no recorded placement.
> That record does not preserve its independently documented Blend first-place result.

Alternatively, use only the first sentence. This removes an unnecessary moving fact from a stable case.

**New should-fix: remove the optional closing date unless independent date evidence is added.**

The primary timestamp conversion is correct. Its two displayed copies still have one upstream event-date witness.
The date is not needed to answer the question or satisfy the four key facts.

Replace:

> the Stellar Development Foundation hackathon on DoraHacks whose submission period ended on 2025-07-07

with:

> the Stellar Development Foundation hackathon on DoraHacks

Remove the corresponding unconditional date confirmation from the provenance claim.
Retain the captured date as an attributed, non-gating source observation if needed.

The historical identity, event, second place, and repository support `stable`, `real-world`, and `confirmed` after these corrections.
No prize amount appears. The new avoids are false under the independently checked evidence.
The named `scout.getHackathonSubmission` operation returns every required key fact.
It does not return the complete three-winner roster; that additional context is optional and independently supported.

Final verdict: **activate-with-changes**.

## 3. xbid.ai outcome case

`q-scout-hackathon-submission-xbid-outcome`

| Claim | Verdict | Class | Source URL | Exact observation |
| --- | --- | --- | --- | --- |
| KF1: multi-LLM AI agent trading on Stellar | confirmed | A supplied, B, C | [AX], [XB], [SX] | Submitted description: “multi-LLM AI agent, born on Stellar”. Pass-1 project README independently described its Stellar trading design. |
| BUIDL 32593 | confirmed | A supplied, B, C | [AX], [XB], [SX] | Team post links BUIDL `32593`; live ID is `dorahacks-buidl-32593`. |
| As-of 2026-10-06 | confirmed-as-of | C | [SX] | `generatedAt=2026-10-06T14:44:01.933Z`. |
| KF2: first place at KALE x Reflector | confirmed | A supplied, B, C | [AK], [XB], [SX] | Team post: “xbid.ai won 1st place”; names the exact event and links the submission. |
| Submission period ended 2025-09-08 | unverifiable | A supplied, C downstream, D, F | [AK], [SX], [RK] | Capture `1757329200` converts to `2025-09-08T11:00:00Z`. Launch post instead gives the original September 1 deadline. No separate final-extension evidence found. |
| Team describes delta-neutral strategies and outcome feedback | confirmed | A supplied, B, C | [AX], [SX] | Supplied description names delta-neutral strategies and says outcomes feed back into behavior. Pass-1 repository README independently supports the design. |
| Self-tags: SDEX, Blend, Reflector | confirmed-as-of | A supplied, C | [AX], [SX] | `layer1:SDEX`, `layer2:Blend`, `layer2:Reflector`. Own primary-page access remains unavailable. |
| KF3: Scout links the XBid AI directory project | corpus-only | C | [SX] | `project.name="XBid AI"`, `project.slug="xbid-ai"`. |
| KF4: linked project's status is Live | corpus-only | C | [SX] | `project.status="Live"`; `factsReadAt=2026-10-06T14:44:01.933Z`. |
| Link uses demo website `xbid.ai` | corpus-only | C | [SX] | `project.basis="website"`, `links.demo="https://xbid.ai"`. |
| Submitted GitHub URL is an organization | confirmed | A supplied, B, C | [AX], [SX] | Submitted link is `https://github.com/xbid-ai`; pass-1 GitHub API independently returned `type="Organization"`. |
| Scout lacks submitted-repository stack and activity observations | corpus-only | C | [SX] | `repo=null`, `stackReadAt=null`, `activityCheckedAt=null`; stack and activity absent. |
| Write-up does not prove shipment | confirmed | C; evidence boundary | [SX] | API note: write-up is “a claim about what they built, not evidence that it shipped”. |
| Optional note: Scout showed no SCF award | corpus-only | C | [SX] | `project.scfAwarded=false`. This does not independently prove no funding. |
| Avoid 1: did not place at KALE x Reflector | contradicted | A supplied, B, C | [AK], [XB], [SX] | Team's dated first-place announcement independently contradicts the negative. |
| Avoid 2: Scout never listed linked XBid AI | contradicted | C; exact source-membership claim | [SX] | Current positive project link disproves that directory-specific historical negative. |

The core case is sound. The question and avoids now identify Scout's directory.
The notes separate directory membership from funding, deployment, and SDF directory membership.
The submitted organization URL does not imply that code is absent.

**Remaining should-fix: reconciliation row 9 does not fully resolve date corroboration.**

The supplied final timestamp is better evidence than Scout alone.
However, it does not add an independent final-date witness.
The original launch announcement's September 1 deadline could have been extended; it does not prove September 8 false.
Do not classify these dates as an established contradiction without checking the extension history.

Delete this optional clause:

> whose submission period ended on 2025-09-08

Keep the main sentence as:

> It took 1st place at Stellar Hacks: KALE x Reflector.

Remove the unconditional final-date confirmation from the provenance claim.
The supplied timestamp can remain an attributed, non-gating observation.

`scheduled`, `mixed`, `asOf: 2026-10-06`, and `reverifyBy: 2027-01-20` fit the directory measurements.
The corpus-only project, status, and absent-stack rows correctly state the evidence boundary.
The self-tags can remain an attributed source observation, with supplied-capture provenance clearly stated.

Final verdict: **activate-with-changes**.

## 4. Winner-library case

`q-scout-hackathon-winner-libraries-vs-field`

All aggregate counts remain corpus-only. The external manifest samples validate selected package observations, not all aggregate inputs.

| Claim | Verdict | Class | Source URL | Exact observation |
| --- | --- | --- | --- | --- |
| As-of 2026-10-06 | confirmed-as-of | C | [SL] | `generatedAt=2026-10-06T14:44:04.817Z`. |
| Scout holds 64 placed submissions | corpus-only | C | [SP] | Total placed count `64`. |
| KF5: 45 placed submissions have manifest reads | corpus-only | C | [SL] | `winnersKnown=45`. |
| JS SDK count 35 | corpus-only | C; B sampled in pass 1 | [SL] | `winners=35`. |
| KF1: JS SDK first, about 78% | corpus-only | C, F | [SL] | Largest placed library count; `35/45=77.777778%`. |
| Rust SDK count 26 | corpus-only | C; B sampled in pass 1 | [SL] | `winners=26`. |
| KF2: Rust SDK second, about 58% | corpus-only | C, F | [SL] | Second-largest placed count; `26/45=57.777778%`. |
| Non-placed manifest-read denominator 967 | corpus-only | C | [SL] | `othersKnown=967`. |
| Others' JS share about 77% | corpus-only | C, F | [SL] | `others=743`; `743/967=76.835574%`. |
| Others' Rust share about 66% | corpus-only | C, F | [SL] | `others=642`; `642/967=66.390900%`. |
| KF3: JS SDK lift about 1.0 | corpus-only | C, F | [SL] | `(35/45)/(743/967)=1.012263`; API `1.01`. |
| Rust lift about 0.9 | corpus-only | C, F | [SL] | `(26/45)/(642/967)=0.870267`; API `0.87`. |
| Wallets Kit count 16 | corpus-only | C | [SL] | `winners=16`. |
| Wallets Kit placed share about 36% | corpus-only | C, F | [SL] | `16/45=35.555556%`. |
| Wallets Kit others' share about 27% | corpus-only | C, F | [SL] | `others=258`; `258/967=26.680455%`. |
| KF4: Wallets Kit lift about 1.3 | corpus-only | C, F | [SL] | `(16/45)/(258/967)=1.332644`; API `1.33`. |
| Freighter count 7 | corpus-only | C | [SL] | `winners=7`. |
| Freighter placed share about 16% | corpus-only | C, F | [SL] | `7/45=15.555556%`. |
| Freighter others' share about 37% | corpus-only | C, F | [SL] | `others=358`; `358/967=37.021717%`. |
| Freighter lift about 0.4 | corpus-only | C, F | [SL] | `(7/45)/(358/967)=0.420174`; API `0.42`. |
| Unread placed submissions number 19 | corpus-only | C, F | [SP], [SL] | `64-45=19`. |
| KF5: denominator uses submissions with manifest reads | confirmed-as-of | C; local contract | [SL] | Response defines shares over known values and keeps unknown values separate. |
| Core measured stack is broadly similar | corpus-only | C, F | [SL] | JS shares `0.778` versus `0.768`; Rust shares `0.578` versus `0.664`. |
| Counts describe current repository reads, not necessarily deadline code | confirmed | B, C | [SL], [TM] | Manifest reads provide repository declarations, without an event-deadline snapshot guarantee. |
| Declarations do not establish causation | confirmed | B, C; evidence boundary | [SL], [TM] | An observed declaration and placement association does not establish a causal test. |
| Avoid 1: asserts much higher JS rate while citing near-equal counts | contradicted | C, F | [SL] | The cited October counts produce lift `1.012263`. The revised avoid depends on the answer's evidence. |
| Avoid 2: every placed submission declares JS SDK | contradicted | A supplied, B, C | [AK], [ST], [TM] | Top Kale has sixth place and a manifest containing only `discord.js`, `axios`, `node-cron`, and `dotenv`. |
| Notes: two samples of eight and five, twelve distinct repositories | confirmed-as-of | B; author's ledger plus own pass-1 reads | [P1] | Author lists eight names; reviewer lists five. Only `poki-tcg/wraith` overlaps: `8+5-1=12`. This confirms sample accounting, not independent repetition of the author's reads. |

The aggregate calculations match the revised answer.
The denominator correction removes the false lower-bound claim.
The remaining key facts have a dated meaning through the answer, notes, and judge's freshness instruction.

### Reconciliation row 12: partial decline accepted

I inspected `eval/qa/judge.mjs`, especially `buildJudgePrompt` and its non-stable freshness block.
It tells the judge that sourced current numbers, versions, and rosters can differ from the golden snapshot.
The revised case notes additionally accept changed rankings, lifts, ordering, and conclusions.
They no longer condition acceptance on preserving the old result.
The revised avoid 1 also depends on the counts the answer cites.

Together, these instructions resolve the specific blocker from pass 1.
Keeping dated example key facts is acceptable for this scheduled case.
I do not require a conversion to behavioral key facts or a `live` tag.
The author's claim that behavioral facts necessarily require `live` is not needed for this conclusion.

I did not run a paid judge test. This acceptance follows the inspected prompt contract and the revised case text.
No prompt can guarantee perfect model judgments, but there is no remaining textual demand to reject newer sourced results.

### Reconciliation row 13: partial decline accepted

The natural-language question can remain unchanged.
The answer explicitly identifies Scout's stored sample and uses submissions with manifest reads as the counting unit.
The notes require scope and denominator reporting.
The answer also distinguishes current manifest declarations from code at the event deadline.
Those changes resolve the required evidence-scope concern without forcing Scout terminology into the user's question.

**New note: interpret “non-placed” as Scout's recorded category.**

Blend Pool Creator demonstrates why these measurements need a corpus boundary.
Reddit records its Blend first place, while Scout associates its build with PaltaLabs and no placement.
That difference does not prove the PaltaLabs placement field is false.
It does show that one stored event association does not represent every documented event outcome for a build.

Optional note text:

> Placed and non-placed refer to Scout's stored event records, which may omit other documented event placements for the same build.

This is not a new activation blocker because the revised case already attributes its measurements to Scout's stored submissions.
Do not “correct” the aggregates by moving a build between groups without verifying the complete event-record semantics.

`scheduled`, `corpus-grounded`, `asOf: 2026-10-06`, and `reverifyBy: 2027-01-13` are appropriate.
`confirmed` is acceptable for this explicitly attributed measurement; the aggregate corroboration rows correctly remain corpus-only.

Final verdict: **activate**.

## Reconciliation disposition

| Row | Pass-1 finding | Pass-2 disposition |
| --- | --- | --- |
| 1 | Independent event verification incomplete | **Partly resolved; still blocks placed-share activation.** Supplied final lists are available, but another transport is not independent corroboration. |
| 2 | Coverage differences versus disagreement | **Resolved.** Notes separate source coverage and accept both denominators. |
| 3 | Unsupported payout wording | **Resolved.** Revised text says “lists”; notes exclude completed-payment inference. |
| 4 | Later correct values outside fixed ranges | **Resolved.** Notes explicitly accept later sourced values outside the examples. |
| 5 | Wraith placement evidence incomplete | **Resolved by replacement.** Comet's second place has independently read community confirmation plus supplied primary evidence. |
| 6 | Overbroad other-event avoid | **Resolved by replacement.** New avoids address placement and rank; notes permit separately sourced other-event participation. |
| 7 | Unnamed directory | **Resolved.** Question and avoid name Scout. |
| 8 | xbid first-place source attribution | **Resolved.** Team announcement is explicit and independently reread. |
| 9 | Unattributed optional closing date | **Partly resolved.** Capture provides the primary timestamp; no independent final-date witness emerged. Delete the optional clause or add that witness. |
| 10 | Corpus-only metadata | **Resolved.** Project, status, and absent stack remain corpus-only. Self-tags now have clearly identified supplied primary support. |
| 11 | False lower-bound statement | **Resolved.** Revised answer separates unknown submissions and removes the floor claim. |
| 12 | Fixed future ordering and lift conditions | **Resolved; partial decline accepted.** Current notes and judge freshness instructions permit changed sourced conclusions. |
| 13 | Sampling unit and scope | **Resolved; partial decline accepted.** Answer and notes establish the sample and counting unit. |
| 14 | Eight-repository sample not independently visible | **Resolved as provenance disclosure.** The ledger supplies the eight names. Samples do not establish aggregate counts. |
| 15 | Existing cases require event-detail route | **Deferred, not repaired. Deferral accepted for this four-case scope.** I verified the named `.agents/TODO.md` task and its completion condition. |

## Duplicate, boundary, and operation checks

The existing `q-scf-blend-winners-live` asks for the full current event roster.
The new Comet case identifies one linked submission and its historical second place.
They overlap, but they are not duplicates and do not assert incompatible facts.
Keep source scope explicit when Scout's Blend roster omits a documented event placement.

The existing `q-defi-comet-what-is` concerns the Comet AMM and its Blend backstop deployment.
The new case concerns a submitted interface built on that infrastructure.
These identities can both be true. Neither proves a major standalone exchange or production operation of the submitted interface.

The xbid case still overlaps the existing KALE first-place case.
The recorded event-detail routing conflict remains a follow-up item, not a new factual contradiction.
The placed-share proposal still differs from the existing KALE-versus-Blend comparison case.
No new mutually exclusive pair emerged from the topic search.

The named submission-detail operation returned all required Comet and xbid fields.
The analysis operation returned both event shares and the full winner-versus-other library comparison.
DoraHacks counter variants and the complete Blend roster require external evidence; they are additional context, not missing required operation fields.

## Exact remaining edits

1. Keep the placed-share case inactive until independent final winner-count corroboration succeeds.
2. Correct or remove the Comet note claiming Scout does not hold Blend Pool Creator.
3. Remove Comet's optional July 7 closing-date clause unless independently corroborated.
4. Remove xbid's optional September 8 closing-date clause unless independently corroborated.

The library case needs no required text change in this pass.
All capture-dependent claims retain explicit provenance limits in this review.

[DH]: https://dorahacks.io/hackathon/stellar-hacks-kale-reflector/report
[AK]: https://dorahacks.io/hackathon/stellar-hacks-kale-reflector/winner
[AZ]: https://dorahacks.io/hackathon/stellar-hacks-zk/winner
[AB]: https://dorahacks.io/hackathon/stellar-hacks-blend/winner
[AX]: https://dorahacks.io/buidl/32593
[AC]: https://dorahacks.io/buidl/27417
[RB]: https://www.reddit.com/r/Stellar/comments/1lzrofu/announcing_the_winners_of_the_stellar_hacks_blend/
[RK]: https://www.reddit.com/r/Stellar/comments/1mvm0lo/build_defi_games_on_stellar_our_12000_kale_x/
[SC]: https://stellarlight.xyz/api/hackathons/builds/27417
[SX]: https://stellarlight.xyz/api/hackathons/builds/32593
[SP]: https://stellarlight.xyz/api/hackathons/analyze?facet=placement&by=event
[SL]: https://stellarlight.xyz/api/hackathons/analyze?facet=library&top=30
[SB]: https://stellarlight.xyz/api/hackathons/builds/27438
[SS]: https://stellarlight.xyz/api/hackathons/builds?q=Blend%20Pool%20Creator&limit=5
[ST]: https://stellarlight.xyz/api/hackathons/builds/32665
[CM]: https://api.github.com/repos/Hoops-Finance/cometswap
[CR]: https://raw.githubusercontent.com/Hoops-Finance/cometswap/main/README.md
[CU]: https://raw.githubusercontent.com/Hoops-Finance/cometswap/51f3069eead8cef558f465cc00cef129a0bc91eb/src/components/ui/crypto-swap-demo.tsx
[XB]: https://raw.githubusercontent.com/xbid-ai/xbid-ai-blog/main/content/posts/xbid-ai-first-place-stellar-hackathon.md
[TM]: https://raw.githubusercontent.com/Klorenn/topkale/b0973c01248e614a0d06b4c085bdde02e5410b14/package.json
[P1]: /Users/kalepail/Desktop/srcm-drift-goldens/tmp/goldens-review/review-astra.md
