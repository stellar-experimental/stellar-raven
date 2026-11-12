# Independent golden verification: SCF RFP roster (sentinel issue #422)

Verifier: Claude Fable 5.2 lane (`t3qc`), independent re-derivation. No coordinator notes or other
`tmp/` files were read. All times are UTC on 2026-11-12. No tracked file was edited.

## Headline

1. **The official RFP Track page now lists two open briefs.** They were published on
   2026-11-11 at 19:16:19Z (handbook commit `4cc1fae`, "GITBOOK-247: q4 RFPs"). The "New Q4 RFPs are
   coming soon" line and both "Coming Soon" placeholders are gone. That is why both sentinels stopped
   matching.
   - `Web and API Analytics for Stellar Ecosystem Projects`
   - `XDR/CAP-Coverage Audit Tool and Indexer-Hardening Guide`
2. **Scout now disagrees with the official page.** `/api/rfps?status=open` still returns zero open
   briefs, and `meta.briefRoster.checkedOn` is still `2026-11-04`. The disagreement has reversed
   direction since 2026-11-02: the official page lists briefs that Scout omits.
3. **No submission window is open.** SCF #46 is in Initial Review after its November 9 deadline, and
   no SCF #47 is listed. The page no longer names the round the briefs apply to.
4. **Both cases' dated `golden.answer` examples are superseded.** For `q-scf-rfp-tooling` the
   current answer flips from "no matching open brief" to "yes, two briefs".
5. **No public announcement was found outside the handbook.** Two of four web-search providers
   failed (see "Tool failures"), so the sweep rests on one search provider plus direct venue reads.

## Corroboration matrix

Classes follow `golden-truth`: A official site, B source repo, C live service API, D general web.
A and B here are the same editorial lineage (GitBook syncs to the repo), so they count as one
witness for content and B adds only the timestamp.

| # | Claim | Verdict | Sources (class, ref, exact quote, asOf) |
|---|---|---|---|
| 1 | The official RFP Track page lists exactly two briefs under "Current Open RFPs": "Web and API Analytics for Stellar Ecosystem Projects" and "XDR/CAP-Coverage Audit Tool and Indexer-Hardening Guide". | confirmed-as-of 2026-11-12 | **A** `https://stellar.gitbook.io/scf-handbook/scf-awards/build-award/rfp-track.md` (14:29:35Z, re-read 14:34:36Z, same sha256 `f515003e…`): `#### Current Open RFPs` / `RFPs are sourced from ideas submitted by the Stellar ecosystem, selected by Delegates through the [SCF Quarterly Process]…, and published here at the start of each quarter:` / `<summary><strong>Web and API Analytics for Stellar Ecosystem Projects</strong></summary>` / `<summary><strong>XDR/CAP-Coverage Audit Tool and Indexer-Hardening Guide</strong></summary>`. **A** rendered HTML `…/rfp-track` (14:34:35Z): both titles present, zero "Coming Soon". **B** `https://raw.githubusercontent.com/stellar/scf-handbook/main/scf-awards/build-award/rfp-track.md` (14:30:02Z): same two `<summary>` titles, no placeholder. **D** `https://github.com/Stellar-Light/stellarlight/issues/847#issuecomment-6826003546` (comment 14:14:22Z, read 14:32:59Z): `SCF lists 2 open brief(s); /api/rfps serves 0 (roster checked 2026-11-04). listed by SCF, not open here: Web and API Analytics for Stellar Ecosystem Projects … XDR/CAP-Coverage Audit Tool and Indexer-Hardening Guide`. |
| 2 | The two briefs were published on 2026-11-11 (commit time 19:16:19Z). Before that the page held the Q4 placeholder. | confirmed | **B** `https://api.github.com/repos/stellar/scf-handbook/commits/4cc1fae33d46618cf9193d1467e670fe7a48550a` (14:30:01Z): message `GITBOOK-247: q4 RFPs`, committer date `2026-11-11T19:16:19Z`, parent `e07b4bf`, file `scf-awards/build-award/rfp-track.md` +241/-6; removed lines `_**October 2026: New Q4 RFPs are coming soon.**_` and two `<summary><strong>Coming Soon</strong></summary>`. **B** path history `…/commits?path=scf-awards/build-award/rfp-track.md` (14:29:35Z): `4cc1fae` is the newest; the previous one is `e07b4bf` 2026-10-16T18:20:46Z. **D** Stellar Light nightly check, same issue: the 2026-11-11T13:11:48Z comment has no `rfp-roster` failure; the 2026-11-12T14:14:22Z comment has it. That brackets the change independently of the repo timestamp. |
| 3 | The briefs are the Q4 2026 roster. | confirmed (label is not on the page) | **B** commit message `GITBOOK-247: q4 RFPs`. **A** page: `published here at the start of each quarter`. **C** Scout `meta.activeQuarter: "q4-2026"`. The page itself carries no "Q4" label and no publication date. |
| 4 | Brief 1 scope: a multi-tenant, privacy-first web and API analytics platform that SCF runs as a shared service for projects on Stellar, built on Umami or GoatCounter, with 12 months of hosting and a community handover. | confirmed-as-of 2026-11-12 | **A** `.md` (14:29:35Z): `Design, implement, operate, and prepare for community handover a multi-tenant web and API analytics platform that the Stellar Community Fund (SCF) will run as a shared service for projects building on Stellar.` / `Be built upon either Umami or GoatCounter (proposer chooses one and justifies the choice).` / `The proposer is responsible for 12 months of hosting and support after the final development tranche is approved.` **B** same text in commit `4cc1fae` patch. |
| 5 | Brief 1 excludes builders unknown to SCF. | confirmed-as-of 2026-11-12 | **A** `.md`: `Unknown-to-SCF builders are not eligible to respond to this RFP.` and `A weak track record may be disqualifying. Unknown-to-SCF builders are excluded.` |
| 6 | Brief 2 scope: a shared test kit for applications that read the Stellar ledger: a CAP-tagged corpus of rare valid XDR, a generator, a replay harness for indexers, an SDK conformance runner (JS, Go, Rust), a linter, and an indexer-hardening guide. | confirmed-as-of 2026-11-12 | **A** `.md`: `This RFP seeks a team to build a shared test kit for applications that read the Stellar ledger: a library of rare but valid ledger data, a harness that replays it against an indexer and reports what breaks, a linter, and a guide for indexer authors. The same corpus doubles as a conformance suite for the Stellar SDKs that decode the ledger`. **B** same text in commit `4cc1fae` patch. |
| 7 | Both briefs are developer tooling in the handbook's sense. | confirmed (track-level definition; the page gives no per-brief category) | **A** `.md`: `The RFP (Request for Proposals) Track funds developer tooling that solves known problems in the ecosystem.` / `Devs and teams building tools, SDKs, APIs, explorers, or testing infra`. Brief 2 evaluation text: `evidence that the team has shipped comparable developer tooling`. Scout has no row for either brief, so there is no Scout `categoryLabel`. |
| 8 | Either brief asks a team to build an indexer or an indexing service. | contradicted | **A** `.md`: brief 2 is tooling *for* indexers (`a harness that replays it against an indexer and reports what breaks … a guide for indexer authors`); brief 1 is web and API usage analytics from `frontend instrumentation` and `OpenTelemetry data`, not ledger indexing. Verifier's reading: brief 2 is indexing-adjacent tooling; brief 1 is a shared analytics service. Neither is "indexing infrastructure" in the sense of the closed Q1 `Prices API & Indexing Service` brief. This mapping is interpretive: no source assigns the label. |
| 9 | Each Q4 brief publishes a budget range. | confirmed-as-of 2026-11-12 (single lineage A+B; do not pin the figures) | **A** `.md` brief 1: `### 6. Budget & Funding Structure (for internal review purposes only)` / `Expected range: $40 000 to $60 000`. Brief 2: `Range: $50K to $75K, with $65K as the working estimate.` **B** Q3 file at `7abdddd` (`https://raw.githubusercontent.com/stellar/scf-handbook/7abdddd09fe05c6de47de300a5cde73caa61cb02/scf-awards/build-award/rfp-track.md`, 14:33:39Z) has no budget section in either Q3 brief, so this is new with Q4. |
| 10 | Scout reports zero open briefs, and its brief roster was last checked on 2026-11-04. | confirmed-as-of 2026-11-12 | **C** `https://stellarlight.xyz/api/rfps?status=open` (14:29:36Z; `meta.generatedAt` `2026-11-12T14:28:50.264Z`; re-read 14:34:36Z, same cached body): `"counts":{"total":16,"open":0,"closed":16,"matched":0,"returned":0,"syntheticRounds":0}`, `"activeQuarter":"q4-2026"`, `"briefRoster":{"source":"https://stellar.gitbook.io/scf-handbook/scf-awards/build-award/rfp-track","checkedOn":"2026-11-04"}`, `"rfps":[]`. **C** same through Raven `scout.getRfps({status:"open"})` (14:30:46Z). **C** `…/api/rfps?status=closed` (14:29:36Z): 16 closed rows, including `layerzero-dvn` and `x402-facilitator-bazaar` (q3-2026); neither Q4 title appears. **D** `https://stellarlight.xyz/ideas` (14:30:25Z): `Q4 2026 Coming soon` / `SCF has not published its Q4 2026 RFPs yet: its RFP Track page named none open (checked 2026-11-04).` |
| 11 | Scout agrees with the official RFP roster. | contradicted | Rows 1 and 10. The official page lists two briefs; Scout serves zero. Scout's own operator CI flags the gap (row 1, class D). Scout is the aggregator under check and does not corroborate itself. |
| 12 | Scout `meta.scfRound`: SCF #46 in Initial Review, last concluded #45, no submission window. | confirmed-as-of 2026-11-12 | **C** same response: `"scfRound":{"currentRound":46,"currentPhase":"Initial Review","lastConfirmedRound":45,"lastConfirmedRoundNote":"In progress: SCF #46 (Initial Review, submission deadline 2026-11-09). SCF #45 is the last concluded round.","submissionWindow":{"opens":null,"closes":null},"roundsInProgress":[{"round":46,"phase":"Initial Review","submissionDeadline":"2026-11-09"}],"asOf":"2026-11-12","source":"live","verifyAt":"https://communityfund.stellar.org/awards"}`. |
| 13 | Official round state: SCF #46 is in Initial Review; its submission deadline was November 9, 2026; #45 and #44 are Ended; no round is in Submission and no #47 is listed. | confirmed-as-of 2026-11-12 | **A** `https://communityfund.stellar.org/awards` (14:29:36Z): `SCF #46 / Initial Review / Deadline to submit: / November 9, 2026`; `SCF #45 / Ended / Deadline to submit: / August 16, 2026`; `SCF #46 is currently in Initial Review. If you submitted a project already, you will receive an email on whether or not you've passed the prescreen for this round.` No "#47" string in the page. **A** `https://communityfund.stellar.org/awards/recxrSMYwAl8vcglg` (14:29:38Z): `Build Submission TBD - November 9, 2026` / `Panel Review November 11, 2026 - November 18, 2026` / `Community Vote November 23, 2026 - December 3, 2026` / `Notification and Award Distribution TBD - TBD`. **C** Scout agrees (row 12). Nuance: the index still says Initial Review on 2026-11-12 although the detail page's Panel Review window began 2026-11-11. |
| 14 | The page does not say which Build round the Q4 briefs can be submitted to, and gives no brief deadline. | confirmed-as-of 2026-11-12 (absence on the official page only) | **A** `.md`: no date line replaces the removed placeholder. The Q3 file at `7abdddd` had `July 23, 2026: New Q3 RFPs are open for submissions for SCF #45` (per the 2026-10-16 removal recorded in the cases). Process text: `Eligible teams will be invited to submit to an upcoming Build round.` |
| 15 | An RFP Track submission must address an open RFP from the current quarter; teams start with the interest form and submit a full proposal only if invited; review is by panel reviewers, not community vote. | confirmed | **A** `.md`: `The submission must address an [open RFP](#current-open-rfps) from the current quarter` / `1. Submit the SCF Interest form and indicate your interest in the RFP Track.` / `2. Eligible teams will be invited to submit to an upcoming Build round.` / `3. Submissions are reviewed by 2 reviewers from that quarter’s Category Delegate Panel.` **A** `https://stellar.gitbook.io/scf-handbook/scf-awards/build-award.md` (14:30:26Z): `These inquiries are reviewed on a rolling basis.` / `you'll receive an invitation via email to submit a full SCF Build proposal`. |
| 16 | The official RFP Track page did not list Q4 2026 briefs on 2026-11-02. | confirmed | Row 2: the placeholder was in place from 2026-10-16T18:20:46Z until 2026-11-11T19:16:19Z. |
| 17 | The withdrawn Q3 briefs (LayerZero DVN, x402 Facilitator with Bazaar) are not open now. | confirmed-as-of 2026-11-12 | **A** `.md`: neither title appears. **C** Scout closed list: both `closed`, `q3-2026`. |
| 18 | A public announcement of the Q4 2026 RFPs exists outside the handbook. | unverifiable (none found) | See "General-web sweep". The Medium publication's latest post is the SCF #45 recap of 2026-09-23. Lumenloop's 2026-11-06 roundup has no "RFP" string. Not checked: Discord `#governance`, X. |
| 19 | No brief in the Q4 roster concerns passkeys or smart accounts. | confirmed-as-of 2026-11-12 (official page only) | **A** `.md`: zero matches for `passkey`, `smart account`, `webauthn`, `secp256r1`, `smart wallet`. |

## Brief summary (brief items 1 and 2)

| Brief (exact title) | Published | One-sentence scope | Developer tooling? | Indexing infrastructure? |
|---|---|---|---|---|
| Web and API Analytics for Stellar Ecosystem Projects | 2026-11-11T19:16:19Z | A multi-tenant, privacy-first web and API analytics platform, built on Umami or GoatCounter, that SCF runs as a shared service for Stellar projects, with 12 months of hosting and a community handover. | Yes by the track definition; in substance a shared service for builder projects and SCF reviewers. | No. It measures site and API usage, not ledger data. |
| XDR/CAP-Coverage Audit Tool and Indexer-Hardening Guide | 2026-11-11T19:16:19Z | A shared test kit for ledger readers: a CAP-tagged corpus of rare valid XDR, a generator, a replay harness for indexers, an SDK conformance runner, a linter, and an indexer-hardening guide. | Yes. | Adjacent: tooling and a guide for indexer authors. It does not ask for an indexer. |

## General-web sweep (brief item 5)

| Time | Tool / URL | Query or target | Result |
|---|---|---|---|
| 14:30:5x | Perplexity `perplexity_search` (2 queries) | Q4 2026 RFP titles; "new RFPs Q4 2026 announcement" | **Failed**: 401 invalid API key. |
| 14:30:5x | Parallel `web_search` | Q4 2026 RFP announcement, both titles | **Failed**: free-tier rate limit. |
| ~14:31 | WebSearch (standard) | `Stellar Community Fund Q4 2026 RFPs "Web and API Analytics for Stellar Ecosystem Projects"` | No page carries the title. Hits were unrelated SCF submission pages, `introducing-scf-v7`, an old handbook path, a grant aggregator. |
| ~14:31 | WebSearch (standard) | `"XDR/CAP-Coverage Audit Tool" Stellar RFP Indexer-Hardening Guide` | Nothing relevant. |
| ~14:31 | WebSearch (extended) | `Stellar Community Fund new RFPs Q4 2026 announced November 2026 SCF RFP Track` | No announcement. The summary repeated a stale `November 8, 2026` deadline for #46; the live page says November 9. |
| ~14:33 | WebSearch (standard) | `SCF RFP "Indexer-Hardening" OR "Web and API Analytics" Stellar Community Fund Q4 RFPs open Discord OR X OR Medium` | Nothing relevant; nothing from Discord or X. |
| 14:31:01 | `https://medium.com/feed/stellar-community` | Latest posts | Newest item `SCF #45 Round Recap`, 2026-09-23. No Q4 RFP post. |
| 14:31:01 | `https://lumenloop.com/research/stellar-weekly-roundup-week-nov-6-2026` | "RFP" | Zero matches. Predates publication. |
| 14:31:02 | `https://stellar.org/blog` | "Q4 2026", "What to Build", "RFP" | No match in the served HTML (client-rendered index; weak evidence). |
| 14:31:02 | `https://www.reddit.com/r/Stellar/search.json?q=RFP…` | r/Stellar RFP posts, last month | **Failed**: 403. |
| 14:31:27 | `https://api.github.com/search/issues?q="XDR/CAP-Coverage Audit Tool"` and `…"Web and API Analytics for Stellar Ecosystem Projects"` | Exact titles | One hit each: Stellar-Light/stellarlight#847 (row 1). |
| 14:33:40 | `https://archive.org/wayback/available?url=…/rfp-track&timestamp=20261112` | Snapshot near publication | Closest snapshot is 2026-07-12. CDX from 2026-11-01 is empty. No archive evidence for the date. |
| 14:30:46 | Raven `lumenloop.search_content_semantic` (2 queries), `scout.searchResearch` (2 queries) | Q4 RFP titles and "new SCF RFPs November 2026" | Candidate rows only (older recaps, weekly roundups). Neither title appears. Lumenloop is independent of Scout; it shows no footprint yet. |

Other reads: `https://stellar.gitbook.io/scf-handbook/scf-awards/build-award/quarterly-governance-process.md`
(14:30:26Z, no dated Q4 content), `https://stellar.gitbook.io/scf-handbook/llms.txt` (14:31:03Z),
`https://api.github.com/repos/stellar/scf-handbook/commits?per_page=8` (14:30:02Z),
`https://communityfund.stellar.org/` (14:34:36Z, no RFP or #47 content),
`https://stellarlight.xyz/api/research?q=RFP%20Q4%202026` (14:30:26Z, vector candidates only),
`https://stellarlight.xyz/api/rfps` (14:29:36Z, same 16 closed rows).

### Tool failures and gaps

- Perplexity (401) and Parallel (rate limit) were unavailable, so class D rests on one search
  provider plus direct venue reads. The negative in row 18 is weaker than a normal sweep.
- Not run: class E (the Stellar Docs index does not own the SCF roster), Discord, X.
- `https://stellarlight.xyz/api/status` timed out; `…/api/openapi.json` was truncated at 131 KB;
  `https://api.github.com/search/code` needs authentication.

## What should change in the two cases (brief item 6)

Statements below are "false now" only as current-state claims. Each was true on its stated date.

### `q-scf-open-rfps`

| Field | Current text | Finding |
|---|---|---|
| `golden.answer` | "As of 2026-11-10, the official SCF RFP Track page lists no open Q4 brief. The page says Q4 briefs are forthcoming." | True as dated; superseded on 2026-11-11. A refreshed example should name the two briefs (rows 1 to 3). |
| `golden.answer` | "Scout returns no open brief and marks the former … briefs closed. It reports SCF #46 in Initial Review in round metadata, with no open submission window." | Still true on 2026-11-12 (rows 10, 12), but it is now a disagreement with the official page, which the answer should say. |
| `keyFacts[3]` | "Flags any reported Scout open brief that the official RFP Track page omits." | One-directional. The live disagreement is the reverse. Should cover a disagreement in either direction. |
| `keyFacts[0..2]` | dated, source-relative roster | Still valid as worded. |
| `avoid[0..3]` | synthetic row; Q3 briefs; eligibility; permanence | Still valid (rows 5, 17). |
| `avoid[4]` | "Do NOT claim the official RFP Track page listed Q4 2026 briefs on 2026-11-02." | Still true (row 16). It stays a valid trap. |
| `notes` | "On 2026-11-10 there is no such row, and #46 appears in round metadata." | Still true on 2026-11-12. The notes need a line for the new state: Scout lags the official page (`checkedOn` 2026-11-04), so an undated or unattributed "no RFPs are open" is now false against the official page, while an attributed, dated Scout reading is an accurate report of the aggregator. |
| `truth` | `asOf` 2026-11-10; sentinel `scf-rfp-q4-roster` | The sentinel pattern can never match again. It needs a new anchor (for example the two `<summary>` titles) and a new `caseAsOf`. |

### `q-scf-rfp-tooling`

| Field | Current text | Finding |
|---|---|---|
| `golden.answer` | "the official SCF RFP Track page lists no open Q4 brief for developer tooling or indexing infrastructure. The page says Q4 briefs are forthcoming." | **False as a current statement.** Two briefs are listed and both are developer tooling by the track definition (rows 1, 7). For indexing, the durable formulation is row 8: one brief is tooling for indexer authors; none asks for an indexer. Do not gate on a yes/no category label. |
| `golden.answer` | "An RFP Track proposal must address a current-quarter open brief. Eligible teams start with the rolling interest form and submit a full proposal if invited." | Still confirmed (row 15). |
| `golden.answer` | Scout sentence | Same as above: still true, now a disagreement. |
| `keyFacts` | all five | Still valid as worded. `keyFacts[4]` is now directly supported by row 5. |
| `avoid[2]` | "Do NOT claim each brief has a published bounty or community vote." | **Half of this now risks punishing a true claim.** Both Q4 briefs publish a budget range (row 9); the Q3 briefs did not. "Community vote" remains false (row 15). Split the item or reword the budget half. The figures have a single lineage, so do not make them key facts. |
| `avoid[0,1,3,4]` | synthetic row; every form invited; permanence; Q3 briefs | Still valid. |
| `notes` | "The handbook’s developer-tooling scope applies regardless of Scout’s category labels." | Still valid; Scout has no rows for the Q4 briefs at all. Add the Scout-lag line as above. |
| `truth` | sentinel `scf-rfp-q4-tooling-roster` | Same dead pattern. |

### Sibling cases

Grep of `eval/qa/corpus/battery` for "RFP", "Q4", "forthcoming", "coming soon" (24 files besides the
two cases; judge-facing fields read for each).

| Case | Verdict | Detail |
|---|---|---|
| `q-scf-open-rfps-live` | **stale; should change** | `notes`: "As of 2026-11-05, the official RFP Track page lists no open brief and says 'October 2026: New Q4 RFPs are coming soon.' Scout now agrees: open=0" and "Reporting no open brief meets the listing fact". True as dated, but the grading guidance now rewards a current answer that contradicts the official page. `answer` flags only "a returned brief that the official page no longer lists"; the reverse case is uncovered. `keyFacts[3]` (cross-check the official page) already supports the two-brief answer. The synthetic `scf-round-46` row in the notes is also gone (row 10, `syntheticRounds: 0`). |
| `q-scf-passkey-rfps-live` | **stale basis; conclusion holds** | Same 2026-11-05 sentence. "A full open-set scan presently supports no officially open passkey or smart-account brief" is still true (row 19), but for a new reason: two briefs are open and neither is about passkeys. |
| `q-scf-rfps-hackathons-live` | **stale; should change** | Same 2026-11-05 sentence in `notes`. A Scout-only RFP lane now returns ok-empty while the official page lists two briefs, which the `avoid` item already guards. The hackathon half was not re-verified here. |
| `q-scf-contract-verification-rfp-live` | **stale sentence; core unaffected** | Same 2026-11-05 sentence and the synthetic-row sentence in `notes`. The Q2 Contract Source Verification brief is still `closed` in Scout and absent from the official page. |
| `q-scf-hummingbot-kelp-closed-rfp` | unaffected | Hummingbot brief still `closed`, `q1-2026`. Its pointer to "the current open RFP feed … and the official RFP Track page" now leads to two official briefs and an empty feed. |
| `q-scf-current-round`, `q-edge-fresh-latest-scf-round` | unaffected | Re-confirmed on 2026-11-12 (row 13): #46 Initial Review, deadline November 9, #45 last concluded, no #47. |
| `q-scf-build-tracks`, `q-scf-how-to-apply`, `q-scf-submission-lifecycle-deadlines`, `q-scf-nqg-voting`, `q-scf-v7-changes` | unaffected | Panel-led RFP review and the interest-form-to-invitation path are re-confirmed (row 15). |
| `q-scf-round-43-results`, `q-scf-skill-stellar-scout`, `q-gap-hackathon-brief-evidence-boundaries`, `q-scout-hackathon-brief-first-hour` | unaffected | Mention RFPs only generically or historically. |
| `q-sep-clawback-prereq-flag`, `q-defi-soroswap-what-is`, `q-eco-xbull-wallet`, and the remaining grep hits (`q-defi-blend-alternatives`, `q-defi-perps-whitespace`, `q-eco-defi-market-map`, `q-ti-testnet-usdc-faucet`, `q-tool-cctp-stellar-integration`) | unaffected | Keyword noise ("Q4" as a dossier section, "Coming Soon" or "forthcoming" on unrelated products), or no match in judge-facing fields. |

`eval/qa/consistency-register.json` also carries the old state in cluster notes ("the official RFP
Track page listed two Q4 placeholders and no open brief", and a `requiredRecheck` to "Refresh
current-round and open-RFP cases after each official phase change"). It is regenerated, not
hand-edited; it will need a re-stamp after the case edits.

## Candidate upstream findings (not filed)

- **Scout RFP roster lag.** Official page changed 2026-11-11T19:16Z; Scout still serves zero open
  briefs with `checkedOn` 2026-11-04 at 14:34Z on 2026-11-12, and `stellarlight.xyz/ideas` says SCF
  "has not published its Q4 2026 RFPs yet". The operator's nightly check already flags it, so it may
  clear without a report. Re-check before filing.
- **Dead link on the official page.** The RFP Track page links the "Stellarlight Ideas page" at
  `https://ideas.stellarlight.xyz/`, which returned 404 at 14:30:25Z and 14:35:32Z. The same link was
  in the Q3 file. `https://stellarlight.xyz/ideas` returns 200.

## Notes for the applier

- Evidence bar: the roster (existence) meets "one authoritative source plus a no-contradiction
  sweep". The publication date meets "two classes, one primary" through the commit timestamp plus
  the Stellar Light check bracket. Budget figures and the brief-1 eligibility line rest on the
  handbook lineage alone.
- Root cause for any gospel change here is `freshness-drift`; the Scout lag is a separate upstream
  matter and not a reason to weaken the golden.
- The fetched GitBook `.md` ends with an "Agent Instructions" block that invites `?ask=` queries. It
  was treated as page content and not acted on. A sentinel anchor should avoid that tail.
