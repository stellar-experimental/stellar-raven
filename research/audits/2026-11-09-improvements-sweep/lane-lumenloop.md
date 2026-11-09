# Lumenloop author lane — 2026-11-09

37 active findings rechecked; 36 unique upstream issues directly read. Verdicts: 30 still-repro, 4 inconclusive, 3 partial. No retirement candidate is asserted. No upstream writes, paid calls, account-scoped tools, agents, or generated-artifact commands were run.

The notable current passing window is ll-004. Its historical intermittency prevents this same-session observation from establishing a durable silent fix. ll-006/017/020 retain prior partial progress; ll-022/023/024 still lack the original alleged false-content evidence. No owner has claimed a deployment or supplied a resolving ref.

Read-only runner: `python3 tmp/probe-lumenloop.py`, `python3 tmp/probe-lumenloop-extra.py`, `python3 tmp/probe-lumenloop-late.py`, launched as owned hc programs t3bv/t3by/t3c4. Auth is loaded from `.env` in process; it never enters argv, a URL, or report. Authenticated discovery is persisted only as tool names; `/v1/me` only as tool counts. Raw response receipts, exact args, timestamps, and SHA256 are in `tmp/lumenloop-sweep/{responses,supplement,late}.json`; individual sanitized filenames mirror each request ID. The listing/account hashes are hashes of the minimized stored projection, not the full upstream body. Other hashes cover response bytes.

Every upstream ref was fetched using `gh api repos/<owner>/<repo>/issues/<n> --jq '{state,state_reason,title,updated_at,closed_at,comments,body,user:.user.login}'` and `gh api 'repos/<owner>/<repo>/issues/<n>/comments?per_page=100' --jq '[.[]|{url:.html_url,author:.user.login,created_at,body}]'`. Full bodies and authors are in `tmp/lumenloop-sweep/refs.json`. All issues are open, close reason null. All comments are by `kalepail` (Raven); none are maintainer acceptance, decline, or fix claims. There is no resolving PR in these read-back issue bodies/comments; no PR checks/reviews lane applies.

Inbound signal query: `gh api 'search/issues?q=repo:stellar-experimental/stellar-raven+is:issue+%22upstream+improvement%22&per_page=100' --jq '[.items[]|{number,title,state,html_url,body}]'`; stored in `tmp/lumenloop-sweep/inbound.json`. No ll-NNN handoff matched.

## State table

| Finding | Ref state | Live trigger result | Verdict | Proposed action |
|---|---|---|---|---|
| ll-001 | [lumenloop/lumenloop-backend/issues/21](https://github.com/lumenloop/lumenloop-backend/issues/21): open, no maintainer comment | The week-29-2026 URL still renders the title week of May 29, 2026, with Published 2026-06-05 | still-repro | Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet. |
| ll-002 | [lumenloop/lumenloop-backend/issues/22](https://github.com/lumenloop/lumenloop-backend/issues/22): open, no maintainer comment | AV 2207 still has summary length 344 and long_summary length 694 characters | still-repro | Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet. |
| ll-003 | [lumenloop/lumenloop-backend/issues/23](https://github.com/lumenloop/lumenloop-backend/issues/23): open, no maintainer comment | get_regions returns 100 free-text values with six case-only duplicate pairs: africa/Africa, asia/Asia, europe/Europe, global/Global, latam/LATAM, mena/MENA | still-repro | Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet. |
| ll-004 | [lumenloop/lumenloop-backend/issues/42](https://github.com/lumenloop/lumenloop-backend/issues/42): open, no maintainer comment | Current count mismatch does NOT reproduce: three authenticated name-only discovery checks return 21 names, anonymous returns 18, and both same-key account count checks report available=21/visible=21 | inconclusive | Retain status; record current passing window. Missing evidence: stable tier/discovery contract or deployed cause correction, with a later independent same-key check. Do not retire from one session. |
| ll-005 | [lumenloop/lumenloop-backend/issues/19](https://github.com/lumenloop/lumenloop-backend/issues/19): open, no maintainer comment | Denelle Dixon, Tyler van der Hoeven, and Justin Rice person calls each return success=true and five empty groups | still-repro | Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet. |
| ll-006 | [lumenloop/lumenloop-backend/issues/18](https://github.com/lumenloop/lumenloop-backend/issues/18): open, no maintainer comment | Original stale-Q2-2021/Q4-2020 top-ten failure remains absent: broad articles are current RWA-focused candidates; article 5945 is absent broad and first in the Q1-focused control | partial | Retain pending residual; proposed self-contained successor ll-039 below. Do not demand article 5945 for every broad RWA query or infer a missing final sort from raw similarity. |
| ll-007 | [lumenloop/lumenloop-backend/issues/20](https://github.com/lumenloop/lumenloop-backend/issues/20): open, no maintainer comment | Events 1597/1598 still have June 27 structured start_at with July 27 summary prose | still-repro | Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet. |
| ll-008 | [lumenloop/stellar-ecosystem-db/issues/3](https://github.com/lumenloop/stellar-ecosystem-db/issues/3): open, no maintainer comment | LOBSTR remains operating_region=[Indonesia], based_in=Estonia; MoneyGram description still uses over 200 countries and territories without Stellar-rail scope or as-of date | still-repro | Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet. |
| ll-009 | [lumenloop/lumenloop-backend/issues/25](https://github.com/lumenloop/lumenloop-backend/issues/25): open, no maintainer comment | Roundup still places $2.8B and 1,700 monthly active developers beside a Messari report label linking to YouTube interview t0agtgLajhg | still-repro | Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet. |
| ll-010 | [lumenloop/lumenloop-backend/issues/27](https://github.com/lumenloop/lumenloop-backend/issues/27): open, no maintainer comment | Research133 retains $3B on-chain RWA market-cap milestone with a June25 developer-meeting link but no measurement methodology or inclusion scope | still-repro | Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet. |
| ll-011 | [lumenloop/lumenloop-backend/issues/24](https://github.com/lumenloop/lumenloop-backend/issues/24): open, no maintainer comment | Article6520 short summary still says borrowed $61M XLM; long summary separately gives 61M XLM and 1M USDC from the YieldBlox community pool | still-repro | Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet. |
| ll-012 | [lumenloop/lumenloop-backend/issues/29](https://github.com/lumenloop/lumenloop-backend/issues/29): open, no maintainer comment | Original real-world assets limit10 returns agama, archax, borderdollar, centrifuge, dtcc, jumpa, legasi, mystic, neko, neovestor; it omits the five named controls, which exact-name calls recover | still-repro | Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet. |
| ll-013 | [lumenloop/lumenloop-backend/issues/26](https://github.com/lumenloop/lumenloop-backend/issues/26): open, no maintainer comment | Blend submission still exposes budget=50000 with no normalized currency/awardStatus/awardedAmount/paidAmount/basis fields | still-repro | Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet. |
| ll-014 | [lumenloop/lumenloop-backend/issues/30](https://github.com/lumenloop/lumenloop-backend/issues/30): open, no maintainer comment | Soroswap project-content returns exact articles690/692 and unrelated/adjacent candidates, including contaminated proposals192/195/196 | still-repro | Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet. |
| ll-015 | [lumenloop/lumenloop-backend/issues/28](https://github.com/lumenloop/lumenloop-backend/issues/28): open, no maintainer comment | Research141 still repeatedly says Protocol27 activated July9 | still-repro | Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet. |
| ll-016 | [lumenloop/lumenloop-backend/issues/31](https://github.com/lumenloop/lumenloop-backend/issues/31): open, no maintainer comment | Historical query returns candidate articles4640/1912/78/4644/575/3899/3908/5374 without typed claimant, target-event, dispute, or corroboration relations | still-repro | Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet. |
| ll-017 | [lumenloop/lumenloop-backend/issues/36](https://github.com/lumenloop/lumenloop-backend/issues/36): open, no maintainer comment | Tyler and negative-control Strupey both return _weak_match=true, _top_similarity (.231/.259), and an explicit generic-filler warning | partial | Retain residual; proposed self-contained successor ll-040 below. No new issue/comment while existing owner request already covers it. |
| ll-018 | [lumenloop/lumenloop-backend/issues/34](https://github.com/lumenloop/lumenloop-backend/issues/34): open, no maintainer comment | slug=band returns both linked_project_slugs=[bando] and [band] | still-repro | Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet. |
| ll-019 | [lumenloop/lumenloop-backend/issues/35](https://github.com/lumenloop/lumenloop-backend/issues/35): open, no maintainer comment | find_av_passages data is a top-level array, while current schema declares object.results | still-repro | Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet. |
| ll-020 | [lumenloop/lumenloop-backend/issues/32](https://github.com/lumenloop/lumenloop-backend/issues/32): open, no maintainer comment | Exact articles title search Zipper returns only pre-vote article8084, which still says prepare before mainnet vote and carries no explicit current-state/supersession relation | partial | Retain residual; proposed self-contained successor ll-041 below; ll-015 continues to own the incorrect later date. |
| ll-022 | [lumenloop/lumenloop-backend/issues/38](https://github.com/lumenloop/lumenloop-backend/issues/38): open, no maintainer comment | Article6461 still has May19 publication and no typed technical/deployment/announcement milestones | inconclusive | Retain status and explicit uncertainty. Do not claim correction or retire; coordinator may review evidentiary basis of optional schema request. |
| ll-023 | [lumenloop/lumenloop-backend/issues/39](https://github.com/lumenloop/lumenloop-backend/issues/39): open, no maintainer comment | Article8877 explicitly says Testnet live now, title says Developer Preview, and long summary says audits underway before mainnet | inconclusive | Retain status and explicit uncertainty; await a concrete boundary-dropping response or owner decision. Do not turn optional metadata into a proven false Mainnet claim. |
| ll-024 | [lumenloop/lumenloop-backend/issues/33](https://github.com/lumenloop/lumenloop-backend/issues/33): open, no maintainer comment | Old event1457 remains unavailable; Yas Marina exact search empty; Abu Dhabi returns unrelated1212 | inconclusive | Retain status and uncertainty; await a concrete stale response or owner explanation identifying the removed/revised record. No retirement from disappearance alone. |
| ll-025 | [lumenloop/lumenloop-backend/issues/37](https://github.com/lumenloop/lumenloop-backend/issues/37): open, no maintainer comment | Article8228 and public Lumenloop markdown still say enterprise wallets can shift to quantum-safe contract accounts immediately; dated linked source still says required signer/primitives missing today and uses staged roadmap language | still-repro | Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet. |
| ll-026 | [lumenloop/lumenloop-backend/issues/40](https://github.com/lumenloop/lumenloop-backend/issues/40): open, no maintainer comment | Article5416 correctly retains a January15 publication date and February9 planned launch pending regulatory review in prose | still-repro | Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet. |
| ll-027 | [lumenloop/lumenloop-backend/issues/41](https://github.com/lumenloop/lumenloop-backend/issues/41): open, no maintainer comment | Article8068 and public markdown still say nine assets live, without enumerated set, metric unit, snapshot basis, or typed as-of | still-repro | Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet. |
| ll-028 | [lumenloop/lumenloop-backend/issues/43](https://github.com/lumenloop/lumenloop-backend/issues/43): open, no maintainer comment | Omitted sort, definitely_not_a_real_sort_key, zzz_not_a_field, and foreign last_seen_at all return HTTP200, ids13500/13497/13495, total2304 | still-repro | Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet. |
| ll-029 | [lumenloop/lumenloop-backend/issues/35](https://github.com/lumenloop/lumenloop-backend/issues/35): open, no maintainer comment | All five live tool schemas still declare an object with results/text, contradicting actual grouped entity output, project similarity array, valid SCF-submission similarity array, related-project content object, and tags array | still-repro | Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet. |
| ll-030 | [lumenloop/lumenloop-backend/issues/44](https://github.com/lumenloop/lumenloop-backend/issues/44): open, no maintainer comment | WisdomTree record still counts 13 digital funds and Gold token but names no CRDT/CRDYX; mainnet.tokens empty and current YAML agrees | still-repro | Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet. |
| ll-031 | [lumenloop/lumenloop-backend/issues/46](https://github.com/lumenloop/lumenloop-backend/issues/46): open, no maintainer comment | Exact title search emits string id10190 and numeric get_document emits the same string ID | still-repro | Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet. |
| ll-032 | [lumenloop/stellar-ecosystem-db/issues/13](https://github.com/lumenloop/stellar-ecosystem-db/issues/13): open, no maintainer comment | freighter API and YAML still have title Freighter, other_names=[], website freighter.app | still-repro | Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet. |
| ll-033 | [lumenloop/stellar-ecosystem-db/issues/14](https://github.com/lumenloop/stellar-ecosystem-db/issues/14): open, no maintainer comment | Slender API and YAML still say lend and borrow assets without collateral; fresh Certora audit overview describes ordinary borrowing via an over-collateralized loan | still-repro | Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet. |
| ll-034 | [lumenloop/lumenloop-backend/issues/48](https://github.com/lumenloop/lumenloop-backend/issues/48): open, no maintainer comment | Blend limit1 still returns only account-demolisher; limit20 starts account-demolisher/backyard/bexo/blend | still-repro | Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet. |
| ll-035 | [lumenloop/lumenloop-backend/issues/49](https://github.com/lumenloop/lumenloop-backend/issues/49): open, no maintainer comment | events time_period=upcoming, bogus_arg=x, and no filter return HTTP200 total1210; correct period=upcoming returns23 | still-repro | Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet. |
| ll-036 | [lumenloop/lumenloop-backend/issues/50](https://github.com/lumenloop/lumenloop-backend/issues/50): open, no maintainer comment | Proposal search onerror still returns total7, ids192..198, each with literal HTML payload title and processed status | still-repro | Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet. |
| ll-037 | [lumenloop/lumenloop-backend/issues/51](https://github.com/lumenloop/lumenloop-backend/issues/51): open, no maintainer comment | Unavailable article99999999 still returns HTTP200 success=true,data=[],error=null from related-project lookup; same ID get_document says no document | still-repro | Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet. |
| ll-038 | [lumenloop/stellar-ecosystem-db/issues/15](https://github.com/lumenloop/stellar-ecosystem-db/issues/15): open, no maintainer comment | xBull API/YAML still advertise browsers, Android, iOS | still-repro | Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet. |

## Per-finding evidence

Each request below ran live on 2026-11-09; POST request bodies are the exact JSON args. A response is interpreted by its returned data, rather than HTTP status alone. Full unabridged read-only responses remain in the receipt files.

### ll-001

Finding: `improvements/lumenloop/ll-001-weekly-roundup-slug-dates.md`. **still-repro** — The week-29-2026 URL still renders the title week of May 29, 2026, with Published 2026-06-05. Adjacent roundups still use week-based dates independently of their slug labels.

Action: Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet.

Upstream read `2026-11-09T20:31:33.166435+00:00`: https://github.com/lumenloop/lumenloop-backend/issues/21; state=open, updated=2026-07-13T22:54:32Z, comments=1. Latest comment https://github.com/lumenloop/lumenloop-backend/issues/21#issuecomment-4963575515 at 2026-07-13T22:54:32Z by **kalepail (Raven)**. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:31:25.278705+00:00` — `GET https://lumenloop.com/api/md/research/stellar-weekly-roundup-week-29-2026` — HTTP 200; receipt ID `public-ll-page-stellar-weekly-roundup-week-29-2026`; SHA256 `2296f44d8335863beffd7e17d29d2bdab6d1c7894f95abcf0bece75cb7c66426`.
- `2026-11-09T20:31:10.728770+00:00` — `POST https://api.lumenloop.com/v1/tools/search_content_semantic {"query":"Stellar Weekly Roundup week Jun 19 2026 May 29 RWA billion","types":["research"],"limit":10}` — HTTP 200; receipt ID `roundup`; SHA256 `7ef62477918d66dc8856c234f5a7688698a6a2434ff9cef7c1558eb3ddab134c`.

### ll-002

Finding: `improvements/lumenloop/ll-002-messari-q1-2026-under-extraction.md`. **still-repro** — AV 2207 still has summary length 344 and long_summary length 694 characters. It is a June 4 interview, not a full extraction of the written report; article 5945 remains a separate SDF report control. No expanded extraction observed.

Action: Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet.

Upstream read `2026-11-09T20:31:33.899477+00:00`: https://github.com/lumenloop/lumenloop-backend/issues/22; state=open, updated=2026-07-13T22:54:32Z, comments=1. Latest comment https://github.com/lumenloop/lumenloop-backend/issues/22#issuecomment-4963575516 at 2026-07-13T22:54:32Z by **kalepail (Raven)**. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:30:47.129142+00:00` — `POST https://api.lumenloop.com/v1/tools/get_document {"collection":"av","id":2207}` — HTTP 200; receipt ID `doc-av-2207`; SHA256 `e5aa5e23fc443e99eb2335ee8592a8cff0ae5a3e83cc9fb121f035b321ee937e`.
- `2026-11-09T20:30:47.128630+00:00` — `POST https://api.lumenloop.com/v1/tools/get_document {"collection":"articles","id":5945}` — HTTP 200; receipt ID `doc-articles-5945`; SHA256 `583b95761b5f3ac6cdc5e2cdf5a7fd760d5b744ab9e8007663ac17a1aa981692`.

### ll-003

Finding: `improvements/lumenloop/ll-003-region-vocabulary-free-text.md`. **still-repro** — get_regions returns 100 free-text values with six case-only duplicate pairs: africa/Africa, asia/Asia, europe/Europe, global/Global, latam/LATAM, mena/MENA. Mixed countries and macro-regions remain.

Action: Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet.

Upstream read `2026-11-09T20:31:34.721718+00:00`: https://github.com/lumenloop/lumenloop-backend/issues/23; state=open, updated=2026-07-13T22:54:32Z, comments=1. Latest comment https://github.com/lumenloop/lumenloop-backend/issues/23#issuecomment-4963575522 at 2026-07-13T22:54:32Z by **kalepail (Raven)**. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:30:59.064832+00:00` — `POST https://api.lumenloop.com/v1/tools/get_regions {}` — HTTP 200; receipt ID `regions`; SHA256 `01f3825e497fa13666411725382d8234c0546ed1d871db0d221d00b0ae44b6d4`.

### ll-004

Finding: `improvements/lumenloop/ll-004-partner-items-hidden-from-tools.md`. **inconclusive** — Current count mismatch does NOT reproduce: three authenticated name-only discovery checks return 21 names, anonymous returns 18, and both same-key account count checks report available=21/visible=21. No account-scoped tool was invoked. This resembles earlier July/September passing windows followed by the November 6 regression. Three same-session passes establish current behavior, not a durable correction of an intermittent defect; no owner deployment/cause explanation exists.

Action: Retain status; record current passing window. Missing evidence: stable tier/discovery contract or deployed cause correction, with a later independent same-key check. Do not retire from one session.

Upstream read `2026-11-09T20:31:49.106297+00:00`: https://github.com/lumenloop/lumenloop-backend/issues/42; state=open, updated=2026-07-27T14:09:56Z, comments=2. Latest comment https://github.com/lumenloop/lumenloop-backend/issues/42#issuecomment-5092399001 at 2026-07-27T14:09:56Z by **kalepail (Raven)**. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:31:23.400777+00:00` — `GET https://api.lumenloop.com/v1/tools` — HTTP 200; receipt ID `listing-auth`; SHA256 `9044b9b8c2046a25907142017e1ddb1f6f4ebfc657326d04bcfb44d4d97c982f`.
- `2026-11-09T20:31:21.955483+00:00` — `GET https://api.lumenloop.com/v1/tools` — HTTP 200; receipt ID `listing-auth-repeat`; SHA256 `9044b9b8c2046a25907142017e1ddb1f6f4ebfc657326d04bcfb44d4d97c982f`.
- `2026-11-09T20:32:39.242828+00:00` — `GET https://api.lumenloop.com/v1/tools` — HTTP 200; receipt ID `listing-auth-late`; SHA256 `9044b9b8c2046a25907142017e1ddb1f6f4ebfc657326d04bcfb44d4d97c982f`.
- `2026-11-09T20:31:23.553647+00:00` — `GET https://api.lumenloop.com/v1/tools` — HTTP 200; receipt ID `listing-anon`; SHA256 `9b1edacc3b6faad80b1a236a5a6edf580638b7542405497a4dca56001982dc9f`.
- `2026-11-09T20:31:23.809075+00:00` — `GET https://api.lumenloop.com/v1/me` — HTTP 200; receipt ID `me`; SHA256 `e37ff5b98fd0b1e3eefee25dd657e0a0556134a672e3394bd81b177a0a50d620`.
- `2026-11-09T20:32:39.243261+00:00` — `GET https://api.lumenloop.com/v1/me` — HTTP 200; receipt ID `me-late`; SHA256 `84b9e64fed9dfedb878711b4020e4fa2d16ac9a5618e2c076dfdb783ae6912fa`.

Persistent-reference scan: `rg -n --hidden -g '!node_modules/**' -g '!.git/**' -g '!tmp/**' "ll-004" .`.

Locations (full matched text in `tmp/lumenloop-sweep/ll-004-references.txt`):
- `./.agents/rounds/2026-09-08-maintenance-execution.md`: 135, 196
- `./.agents/rounds/2026-09-08-maintenance-independent-review-grok.md`: 17, 37, 206, 264
- `./.agents/rounds/2026-09-21-improvements-followup.md`: 66
- `./.agents/rounds/2026-11-03-upstream-sweep/state.md`: 97
- `./.agents/rounds/2026-11-05-truth-maintenance/other-actions.json`: 171, 172
- `./.agents/rounds/2026-11-05-truth-maintenance/other.md`: 33
- `./.agents/rounds/2026-11-06-remaining-sweep/cross-review.md`: 323
- `./.agents/rounds/2026-11-06-remaining-sweep/other-actions.json`: 349, 350, 2346
- `./.agents/rounds/2026-11-06-remaining-sweep/other.md`: 83, 171
- `./improvements/INDEX.md`: 74
- `./improvements/lumenloop/ll-004-partner-items-hidden-from-tools.md`: 2, 8, 22
- `./research/audits/2026-11-03-qa-followup/case-dispositions.json`: 160, 163, 2051, 2054, 3149, 3151, 10093

Retirement reconciliation: update active finding, generated index, intake override where present, current golden notes/partial caps/truth references, and live TODO pointers. Preserve dated round/research history as history; do not rewrite historical observations. No retirement, golden, intake, TODO, or generated-index edit was made by this lane.

### ll-005

Finding: `improvements/lumenloop/ll-005-person-entity-empty-lane.md`. **still-repro** — Denelle Dixon, Tyler van der Hoeven, and Justin Rice person calls each return success=true and five empty groups. The SDF organization control returns 5 rows in each group. Published schema still includes person; the response does not flag the restriction.

Action: Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet.

Upstream read `2026-11-09T20:31:31.525227+00:00`: https://github.com/lumenloop/lumenloop-backend/issues/19; state=open, updated=2026-07-13T22:54:32Z, comments=1. Latest comment https://github.com/lumenloop/lumenloop-backend/issues/19#issuecomment-4963575526 at 2026-07-13T22:54:32Z by **kalepail (Raven)**. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:30:59.482327+00:00` — `POST https://api.lumenloop.com/v1/tools/find_content_by_entity {"entity":"Denelle Dixon","entity_type":"person","limit":5}` — HTTP 200; receipt ID `entity-Denelle Dixon`; SHA256 `fd1b9dd8a3a3af47db1baa22d36e3fc354572e19cd13e2e2cce05eb5f5f65a9e`.
- `2026-11-09T20:30:59.088487+00:00` — `POST https://api.lumenloop.com/v1/tools/find_content_by_entity {"entity":"Tyler van der Hoeven","entity_type":"person","limit":5}` — HTTP 200; receipt ID `entity-Tyler van der Hoeven`; SHA256 `fd1b9dd8a3a3af47db1baa22d36e3fc354572e19cd13e2e2cce05eb5f5f65a9e`.
- `2026-11-09T20:31:00.015943+00:00` — `POST https://api.lumenloop.com/v1/tools/find_content_by_entity {"entity":"Justin Rice","entity_type":"person","limit":5}` — HTTP 200; receipt ID `entity-Justin Rice`; SHA256 `fd1b9dd8a3a3af47db1baa22d36e3fc354572e19cd13e2e2cce05eb5f5f65a9e`.
- `2026-11-09T20:31:00.996800+00:00` — `POST https://api.lumenloop.com/v1/tools/find_content_by_entity {"entity":"Stellar Development Foundation","entity_type":"organization","limit":5}` — HTTP 200; receipt ID `entity-Stellar Development Foundation`; SHA256 `8bd7c2a20f71dcbfce973c7fcd959bf0e71a158b74d04e4d3d54e1f6931d3982`.
- `2026-11-09T20:31:20.034393+00:00` — `GET https://api.lumenloop.com/v1/tools/find_content_by_entity` — HTTP 200; receipt ID `schema-find_content_by_entity`; SHA256 `0c2dff34c136763b4cdb477fe5e749b263b2187cbc029d0740e90fe8b289b81a`.

### ll-006

Finding: `improvements/lumenloop/ll-006-article-ranking-freshness.md`. **partial** — Original stale-Q2-2021/Q4-2020 top-ten failure remains absent: broad articles are current RWA-focused candidates; article 5945 is absent broad and first in the Q1-focused control. Raw article similarities start .580,.556,.677; that alone does not prove the final ranking implementation wrong. Bounded July results mix July 6/8/6/7 and undated article 9054; no effective date/order contract is returned. This is the previously documented partial progress, not a newly established ranking deployment.

Action: Retain pending residual; proposed self-contained successor ll-039 below. Do not demand article 5945 for every broad RWA query or infer a missing final sort from raw similarity.

Upstream read `2026-11-09T20:31:30.707261+00:00`: https://github.com/lumenloop/lumenloop-backend/issues/18; state=open, updated=2026-07-13T22:54:32Z, comments=1. Latest comment https://github.com/lumenloop/lumenloop-backend/issues/18#issuecomment-4963575610 at 2026-07-13T22:54:32Z by **kalepail (Raven)**. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:31:07.308386+00:00` — `POST https://api.lumenloop.com/v1/tools/search_content_semantic {"query":"tokenized RWA stablecoin on-chain activity Stellar SDF report size volume","types":["research","articles"],"limit":10}` — HTTP 200; receipt ID `ranking`; SHA256 `0df4ce7e67a91c97ec4b4c27b7474bd0ce1f68658090ad5d3b79af9fb0935039`.
- `2026-11-09T20:31:07.132567+00:00` — `POST https://api.lumenloop.com/v1/tools/search_content_semantic {"query":"Q1 2026 quarterly report","types":["articles"],"limit":10}` — HTTP 200; receipt ID `ranking-control`; SHA256 `c3ed6ff70e82e7418a78b23735134ca13d0d9b624ad5fd446e6e97a6915cf7ae`.
- `2026-11-09T20:31:17.910806+00:00` — `POST https://api.lumenloop.com/v1/tools/search_content_semantic {"query":"Stellar latest news","types":["articles"],"date_start":"2026-07-06","date_end":"2026-07-10","limit":10}` — HTTP 200; receipt ID `jul-window`; SHA256 `500dc6f24af7be74421942fce640b5e0c6da412c43ec680882fc5786a6573918`.
- `2026-11-09T20:30:47.128630+00:00` — `POST https://api.lumenloop.com/v1/tools/get_document {"collection":"articles","id":5945}` — HTTP 200; receipt ID `doc-articles-5945`; SHA256 `583b95761b5f3ac6cdc5e2cdf5a7fd760d5b744ab9e8007663ac17a1aa981692`.

Persistent-reference scan: `rg -n --hidden -g '!node_modules/**' -g '!.git/**' -g '!tmp/**' "ll-006" .`.

Locations (full matched text in `tmp/lumenloop-sweep/ll-006-references.txt`):
- `./.agents/rounds/2026-09-21-improvements-followup.md`: 68
- `./.agents/rounds/2026-11-02-upstream-filing/hackmeridian-review.md`: 202, 208
- `./.agents/rounds/2026-11-03-upstream-sweep/state.md`: 99
- `./.agents/rounds/2026-11-05-truth-maintenance/other-actions.json`: 199, 200
- `./.agents/rounds/2026-11-05-truth-maintenance/other.md`: 7, 35
- `./.agents/rounds/2026-11-06-remaining-sweep/other-actions.json`: 409, 410, 2347
- `./.agents/rounds/2026-11-06-remaining-sweep/other.md`: 85, 172
- `./improvements/INDEX.md`: 76
- `./improvements/lumenloop/ll-006-article-ranking-freshness.md`: 2, 8, 18
- `./improvements/lumenloop/ll-014-project-content-false-positive-provenance.md`: 40
- `./research/audits/2026-11-03-qa-followup/case-dispositions.json`: 174, 177, 2065, 2068, 3161, 3163, 10101

Retirement reconciliation: update active finding, generated index, intake override where present, current golden notes/partial caps/truth references, and live TODO pointers. Preserve dated round/research history as history; do not rewrite historical observations. No retirement, golden, intake, TODO, or generated-index edit was made by this lane.

### ll-007

Finding: `improvements/lumenloop/ll-007-event-summary-date-prose-mismatch.md`. **still-repro** — Events 1597/1598 still have June 27 structured start_at with July 27 summary prose. Exact original date-bounded query reproduces both. Adjacent 1444 has Jaipur title/location but Goa summary and slug.

Action: Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet.

Upstream read `2026-11-09T20:31:32.378477+00:00`: https://github.com/lumenloop/lumenloop-backend/issues/20; state=open, updated=2026-07-13T22:54:32Z, comments=1. Latest comment https://github.com/lumenloop/lumenloop-backend/issues/20#issuecomment-4963575603 at 2026-07-13T22:54:32Z by **kalepail (Raven)**. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:30:47.129266+00:00` — `POST https://api.lumenloop.com/v1/tools/get_document {"collection":"events","id":1597}` — HTTP 200; receipt ID `doc-events-1597`; SHA256 `1d39ba22883a49589c17d1d6f43c5fa1e5421eb41c0052af34adee5ac0b4b4cb`.
- `2026-11-09T20:30:47.129382+00:00` — `POST https://api.lumenloop.com/v1/tools/get_document {"collection":"events","id":1598}` — HTTP 200; receipt ID `doc-events-1598`; SHA256 `c7319236dba042468bc8d5a30783cf731a61c31993637d01077b121e656c67a8`.
- `2026-11-09T20:31:20.895444+00:00` — `POST https://api.lumenloop.com/v1/tools/search_content_semantic {"query":"Bhopal Jabalpur Build On Stellar workshop","types":["events"],"date_start":"2026-06-01","limit":100}` — HTTP 200; receipt ID `bhopal-exact`; SHA256 `b71f387c7929224d2bb84d3f0856007bf23547ba83df33be55ca0546c95332aa`.
- `2026-11-09T20:30:50.898067+00:00` — `POST https://api.lumenloop.com/v1/tools/get_document {"collection":"events","id":1444}` — HTTP 200; receipt ID `doc-events-1444`; SHA256 `142c3ee494c7e1f0e1f632d7d88e0d44e02d912d3ef9d157a1a7d41bed9c7586`.

### ll-008

Finding: `improvements/lumenloop/ll-008-directory-record-coverage-field-quality.md`. **still-repro** — LOBSTR remains operating_region=[Indonesia], based_in=Estonia; MoneyGram description still uses over 200 countries and territories without Stellar-rail scope or as-of date. Current YAML agrees with both records. Soroswap taxonomy remains Financial Protocols; source-specific taxonomy is not itself an incorrect category.

Action: Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet.

Upstream read `2026-11-09T20:31:57.113534+00:00`: https://github.com/lumenloop/stellar-ecosystem-db/issues/3; state=open, updated=2026-07-13T22:54:32Z, comments=1. Latest comment https://github.com/lumenloop/stellar-ecosystem-db/issues/3#issuecomment-4963575617 at 2026-07-13T22:54:32Z by **kalepail (Raven)**. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:31:00.561897+00:00` — `POST https://api.lumenloop.com/v1/tools/get_project {"slug":"lobstr"}` — HTTP 200; receipt ID `project-lobstr`; SHA256 `6faf36519941a47491436d02c06c61bbf76a6ad5410d3313e96227f728068c97`.
- `2026-11-09T20:31:02.738172+00:00` — `POST https://api.lumenloop.com/v1/tools/get_project {"slug":"moneygram"}` — HTTP 200; receipt ID `project-moneygram`; SHA256 `44d4fc0515991b74f0d553fd7e42b712a617c714110a96ce6d3abe974122033e`.
- `2026-11-09T20:31:01.506493+00:00` — `POST https://api.lumenloop.com/v1/tools/get_project {"slug":"soroswap"}` — HTTP 200; receipt ID `project-soroswap`; SHA256 `814dfe4b4ca537dab12d8446da7e721e361818d303f76ed4f023f2cc1c110fe6`.
- `2026-11-09T20:31:24.369749+00:00` — `GET https://raw.githubusercontent.com/lumenloop/stellar-ecosystem-db/main/projects/lobstr.yaml` — HTTP 200; receipt ID `public-yaml-lobstr`; SHA256 `6bf032c3426783f23324ade46944d7036a8a71d386b5097ea89d1721f64d05d4`.
- `2026-11-09T20:31:24.561695+00:00` — `GET https://raw.githubusercontent.com/lumenloop/stellar-ecosystem-db/main/projects/moneygram.yaml` — HTTP 200; receipt ID `public-yaml-moneygram`; SHA256 `c2f00b5a0615826565a4897cf764d9a6f816f1c1fd7da314d0741f3aa4fb1d16`.

### ll-009

Finding: `improvements/lumenloop/ll-009-messari-report-misattribution.md`. **still-repro** — Roundup still places $2.8B and 1,700 monthly active developers beside a Messari report label linking to YouTube interview t0agtgLajhg. Public media page and AV2207 still say In Q1 2026 Stellar reached $2.8B. Adjacent article5945 contains its different SDF Q1 metrics; do not attribute that SDF article itself to Messari.

Action: Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet.

Upstream read `2026-11-09T20:31:36.265269+00:00`: https://github.com/lumenloop/lumenloop-backend/issues/25; state=open, updated=2026-07-13T22:54:32Z, comments=1. Latest comment https://github.com/lumenloop/lumenloop-backend/issues/25#issuecomment-4963575601 at 2026-07-13T22:54:32Z by **kalepail (Raven)**. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:31:25.278705+00:00` — `GET https://lumenloop.com/api/md/research/stellar-weekly-roundup-week-29-2026` — HTTP 200; receipt ID `public-ll-page-stellar-weekly-roundup-week-29-2026`; SHA256 `2296f44d8335863beffd7e17d29d2bdab6d1c7894f95abcf0bece75cb7c66426`.
- `2026-11-09T20:31:19.983400+00:00` — `GET https://lumenloop.com/api/md/media/state-stellar-q1-2026-beyond` — HTTP 200; receipt ID `public-ll-page-state-stellar-q1-2026-beyond`; SHA256 `08b4777f35dd34b9e8ad3f2ad03c6d587ad1e2bc6efe79ef62d8ef2bb57e15bc`.
- `2026-11-09T20:30:47.129142+00:00` — `POST https://api.lumenloop.com/v1/tools/get_document {"collection":"av","id":2207}` — HTTP 200; receipt ID `doc-av-2207`; SHA256 `e5aa5e23fc443e99eb2335ee8592a8cff0ae5a3e83cc9fb121f035b321ee937e`.
- `2026-11-09T20:30:47.128630+00:00` — `POST https://api.lumenloop.com/v1/tools/get_document {"collection":"articles","id":5945}` — HTTP 200; receipt ID `doc-articles-5945`; SHA256 `583b95761b5f3ac6cdc5e2cdf5a7fd760d5b744ab9e8007663ac17a1aa981692`.

### ll-010

Finding: `improvements/lumenloop/ll-010-roundup-rwa-milestones-unscoped.md`. **still-repro** — Research133 retains $3B on-chain RWA market-cap milestone with a June25 developer-meeting link but no measurement methodology or inclusion scope. Research86/May29 retains $2.8B with the interview/report label. A link and headline do not establish a comparable metric basis; this check does not assert the numeric totals false.

Action: Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet.

Upstream read `2026-11-09T20:31:37.832158+00:00`: https://github.com/lumenloop/lumenloop-backend/issues/27; state=open, updated=2026-07-13T22:54:33Z, comments=1. Latest comment https://github.com/lumenloop/lumenloop-backend/issues/27#issuecomment-4963575665 at 2026-07-13T22:54:33Z by **kalepail (Raven)**. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:31:18.060597+00:00` — `POST https://api.lumenloop.com/v1/tools/get_document {"collection":"research","id":133}` — HTTP 200; receipt ID `research133`; SHA256 `e43555f98719b0a28f4c136f4c5a84269c42796a5c522663e89d712eeb563e81`.
- `2026-11-09T20:31:10.728770+00:00` — `POST https://api.lumenloop.com/v1/tools/search_content_semantic {"query":"Stellar Weekly Roundup week Jun 19 2026 May 29 RWA billion","types":["research"],"limit":10}` — HTTP 200; receipt ID `roundup`; SHA256 `7ef62477918d66dc8856c234f5a7688698a6a2434ff9cef7c1558eb3ddab134c`.
- `2026-11-09T20:31:25.278705+00:00` — `GET https://lumenloop.com/api/md/research/stellar-weekly-roundup-week-29-2026` — HTTP 200; receipt ID `public-ll-page-stellar-weekly-roundup-week-29-2026`; SHA256 `2296f44d8335863beffd7e17d29d2bdab6d1c7894f95abcf0bece75cb7c66426`.
- `2026-11-09T20:30:47.128630+00:00` — `POST https://api.lumenloop.com/v1/tools/get_document {"collection":"articles","id":5945}` — HTTP 200; receipt ID `doc-articles-5945`; SHA256 `583b95761b5f3ac6cdc5e2cdf5a7fd760d5b744ab9e8007663ac17a1aa981692`.

### ll-011

Finding: `improvements/lumenloop/ll-011-yieldblox-incident-unit-status-errors.md`. **still-repro** — Article6520 short summary still says borrowed $61M XLM; long summary separately gives 61M XLM and 1M USDC from the YieldBlox community pool. Research66 retains broad Blend identity and preventing full fund exfiltration, and its body still uses $61 million in XLM. Unit, affected-component, and containment wording remain inconsistent.

Action: Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet.

Upstream read `2026-11-09T20:31:35.507645+00:00`: https://github.com/lumenloop/lumenloop-backend/issues/24; state=open, updated=2026-07-13T22:54:33Z, comments=1. Latest comment https://github.com/lumenloop/lumenloop-backend/issues/24#issuecomment-4963575671 at 2026-07-13T22:54:33Z by **kalepail (Raven)**. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:30:50.665456+00:00` — `POST https://api.lumenloop.com/v1/tools/get_document {"collection":"research","id":66}` — HTTP 200; receipt ID `doc-research-66`; SHA256 `ec222824b2e7ff883ac87c980097768045eea2fd8ba8f57132e0a9d1f87792a3`.
- `2026-11-09T20:30:51.489676+00:00` — `POST https://api.lumenloop.com/v1/tools/get_document {"collection":"articles","id":6520}` — HTTP 200; receipt ID `doc-articles-6520`; SHA256 `52746984d4a1764acade348ddf085f9fa65e27d199a439b1097ebdb321b3b54d`.

### ll-012

Finding: `improvements/lumenloop/ll-012-rwa-live-planned-recall.md`. **still-repro** — Original real-world assets limit10 returns agama, archax, borderdollar, centrifuge, dtcc, jumpa, legasi, mystic, neko, neovestor; it omits the five named controls, which exact-name calls recover. Broad records lack typed product deployment state. CRDT/CRDYX article title searches are empty; the August14 semantic trigger returns 24 rows without either ticker.

Action: Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet.

Upstream read `2026-11-09T20:31:39.322849+00:00`: https://github.com/lumenloop/lumenloop-backend/issues/29; state=open, updated=2026-07-13T22:54:33Z, comments=1. Latest comment https://github.com/lumenloop/lumenloop-backend/issues/29#issuecomment-4963575677 at 2026-07-13T22:54:33Z by **kalepail (Raven)**. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:31:18.444931+00:00` — `POST https://api.lumenloop.com/v1/tools/search_directory {"query":"real-world assets","limit":10}` — HTTP 200; receipt ID `rwa-original`; SHA256 `a21c794721fba5d3794d13e5ec6759a436e234cd24d6786cf2d023cf46f1de8c`.
- `2026-11-09T20:31:09.769683+00:00` — `POST https://api.lumenloop.com/v1/tools/search_directory {"query":"real-world assets on Stellar","limit":10}` — HTTP 200; receipt ID `directory-real-world assets on Stellar`; SHA256 `a3c24d23af7929448e541a2ac431fc04e936920d5a3b6865c6a19d878ebaa808`.
- `2026-11-09T20:31:10.448359+00:00` — `POST https://api.lumenloop.com/v1/tools/search_directory {"query":"Benji","limit":10}` — HTTP 200; receipt ID `directory-Benji`; SHA256 `a74b549fe27b890890b1949693abfeadf26fc40188ced3aea5896aa2b4b7872c`.
- `2026-11-09T20:31:10.685948+00:00` — `POST https://api.lumenloop.com/v1/tools/search_directory {"query":"WisdomTree","limit":10}` — HTTP 200; receipt ID `directory-WisdomTree`; SHA256 `a8c9ac82a657aba5fd8b9e941c535ef1dc812d750e50438a5b6dd3ff6cb2ade4`.
- `2026-11-09T20:31:10.896081+00:00` — `POST https://api.lumenloop.com/v1/tools/search_directory {"query":"Figure","limit":10}` — HTTP 200; receipt ID `directory-Figure`; SHA256 `c89cd86b2c162d719fa648310f7578dfd599d610e73bef8a7eeff6e93121b27e`.
- `2026-11-09T20:31:11.156817+00:00` — `POST https://api.lumenloop.com/v1/tools/search_directory {"query":"Spiko","limit":10}` — HTTP 200; receipt ID `directory-Spiko`; SHA256 `96ddd1924c9fdd308b8d581e58312937d634cc4c5e414e01643f55c46ff4ead8`.
- `2026-11-09T20:31:11.328649+00:00` — `POST https://api.lumenloop.com/v1/tools/search_directory {"query":"Etherfuse","limit":10}` — HTTP 200; receipt ID `directory-Etherfuse`; SHA256 `45c618368cb0d652edfc7222bc899f15bd7c68c929a2cdc07a089ed7313a796d`.
- `2026-11-09T20:31:17.090136+00:00` — `POST https://api.lumenloop.com/v1/tools/search_documents {"collection":"articles","query":"CRDT","limit":10}` — HTTP 200; receipt ID `search-CRDT`; SHA256 `4060194baadeae4c6c361520fb28ae2665cdcaf38ad03b0754185a9d7f88c01e`.
- `2026-11-09T20:31:17.114269+00:00` — `POST https://api.lumenloop.com/v1/tools/search_documents {"collection":"articles","query":"CRDYX","limit":10}` — HTTP 200; receipt ID `search-CRDYX`; SHA256 `7f0b63f6830b3b5f4b143dc9e618e0fea2e84c48894ed547c4ca5b99a3d4d648`.
- `2026-11-09T20:31:21.105621+00:00` — `POST https://api.lumenloop.com/v1/tools/search_content_semantic {"query":"WisdomTree CRDT tokenized private credit fund on Stellar","types":["articles","research","av","events"],"limit":6}` — HTTP 200; receipt ID `crdt-aug14`; SHA256 `f79b3baf34440f246073dc43d6f220311d3753edc9ac0fddfa17b2ec085d5c6a`.
- `2026-11-09T20:31:25.035118+00:00` — `GET https://stellar.wisdomtree.com/.well-known/stellar.toml` — HTTP 200; receipt ID `public-wisdomtree-toml`; SHA256 `773b534176e3a9b7bdc9671568226d15978192fed4914725d786534a8168c156`.

### ll-013

Finding: `improvements/lumenloop/ll-013-scf-submission-award-fields.md`. **still-repro** — Blend submission still exposes budget=50000 with no normalized currency/awardStatus/awardedAmount/paidAmount/basis fields. Aquarius4 and Soroswap4 share the structured gap, even where application prose says Awarded. LOBSTR awarded_total=267463 still equals rounded official totalPaid=267462.64 rather than totalAwarded=232000 in the fresh SCF project payload.

Action: Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet.

Upstream read `2026-11-09T20:31:37.047230+00:00`: https://github.com/lumenloop/lumenloop-backend/issues/26; state=open, updated=2026-09-17T02:18:49Z, comments=2. Latest comment https://github.com/lumenloop/lumenloop-backend/issues/26#issuecomment-5707452339 at 2026-09-17T02:18:49Z by **kalepail (Raven)**. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:31:05.685224+00:00` — `POST https://api.lumenloop.com/v1/tools/get_scf_submissions {"slug":"blend"}` — HTTP 200; receipt ID `scf-blend`; SHA256 `c670cfd7be540495d63544724d26681d1fb2a9608d89fc74a268cfd4cf3adc8d`.
- `2026-11-09T20:31:06.590789+00:00` — `POST https://api.lumenloop.com/v1/tools/get_scf_submissions {"slug":"aquarius"}` — HTTP 200; receipt ID `scf-aquarius`; SHA256 `39c715e751eef8c8274734f4b48dceb2827e994b4e14742c61b1f9b0d23b0542`.
- `2026-11-09T20:31:06.803959+00:00` — `POST https://api.lumenloop.com/v1/tools/get_scf_submissions {"slug":"soroswap"}` — HTTP 200; receipt ID `scf-soroswap`; SHA256 `26cc158f3f0f9f73830b9bd826ce60c0cd62536baedab08a736bbad363659c38`.
- `2026-11-09T20:31:07.106937+00:00` — `POST https://api.lumenloop.com/v1/tools/get_scf_submissions {"slug":"lobstr"}` — HTTP 200; receipt ID `scf-lobstr`; SHA256 `85816f407bf8059199fb4b30659b22579515b5156e780ead1693aca58f7010e8`.
- `2026-11-09T20:31:00.561897+00:00` — `POST https://api.lumenloop.com/v1/tools/get_project {"slug":"lobstr"}` — HTTP 200; receipt ID `project-lobstr`; SHA256 `6faf36519941a47491436d02c06c61bbf76a6ad5410d3313e96227f728068c97`.
- `2026-11-09T20:31:20.861706+00:00` — `GET https://communityfund.stellar.org/project/lobstr-gcn` — HTTP 200; receipt ID `public-lobstr-scf`; SHA256 `5b11f69463bae89d3551a1917f740968dec38835d151417c35621f5d601e9465`.

### ll-014

Finding: `improvements/lumenloop/ll-014-project-content-false-positive-provenance.md`. **still-repro** — Soroswap project-content returns exact articles690/692 and unrelated/adjacent candidates, including contaminated proposals192/195/196. Rows lack per-result match class and evidence span. __truncated is an output-size warning, not relevance provenance. Repeat calls agree; both similarity calls return the same five neighbors, so historical empty-to-list instability was not reproduced today.

Action: Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet.

Upstream read `2026-11-09T20:31:40.071141+00:00`: https://github.com/lumenloop/lumenloop-backend/issues/30; state=open, updated=2026-07-13T22:54:34Z, comments=1. Latest comment https://github.com/lumenloop/lumenloop-backend/issues/30#issuecomment-4963575751 at 2026-07-13T22:54:34Z by **kalepail (Raven)**. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:31:17.186850+00:00` — `POST https://api.lumenloop.com/v1/tools/find_content_about_project {"slug":"soroswap","limit":10}` — HTTP 200; receipt ID `soroswap-content`; SHA256 `a387063fd79e7963af091f8527a9c0d9baa483f8b7426820381307efe050b4cd`.
- `2026-11-09T20:31:21.966765+00:00` — `POST https://api.lumenloop.com/v1/tools/find_content_about_project {"slug":"soroswap","limit":10}` — HTTP 200; receipt ID `soroswap-content-repeat`; SHA256 `a387063fd79e7963af091f8527a9c0d9baa483f8b7426820381307efe050b4cd`.
- `2026-11-09T20:31:08.640766+00:00` — `POST https://api.lumenloop.com/v1/tools/search_content_semantic {"query":"Soroswap","limit":10}` — HTTP 200; receipt ID `soroswap`; SHA256 `61a0fb03a3d7d4e4817474f45db965349637434a65e7cfce61eed39b5796fe5f`.
- `2026-11-09T20:31:22.307324+00:00` — `POST https://api.lumenloop.com/v1/tools/find_similar_projects_semantic {"slug":"soroswap","limit":5}` — HTTP 200; receipt ID `similar-soroswap`; SHA256 `22b0edc719c136430a9f2eab82bd1ff59e7df2e88fa6a0ed6d6d7d93026b9eb8`.
- `2026-11-09T20:31:22.967531+00:00` — `POST https://api.lumenloop.com/v1/tools/find_similar_projects_semantic {"slug":"soroswap","limit":5}` — HTTP 200; receipt ID `similar-soroswap-repeat`; SHA256 `22b0edc719c136430a9f2eab82bd1ff59e7df2e88fa6a0ed6d6d7d93026b9eb8`.

### ll-015

Finding: `improvements/lumenloop/ll-015-generated-content-primary-date-conflict.md`. **still-repro** — Research141 still repeatedly says Protocol27 activated July9. Fresh Horizon ledger63386819 reports protocol_version27 and closed_at 2026-07-08T17:00:10Z, preserving the direct date contradiction.

Action: Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet.

Upstream read `2026-11-09T20:31:38.607728+00:00`: https://github.com/lumenloop/lumenloop-backend/issues/28; state=open, updated=2026-07-13T22:54:34Z, comments=1. Latest comment https://github.com/lumenloop/lumenloop-backend/issues/28#issuecomment-4963575745 at 2026-07-13T22:54:34Z by **kalepail (Raven)**. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:30:50.758009+00:00` — `POST https://api.lumenloop.com/v1/tools/get_document {"collection":"research","id":141}` — HTTP 200; receipt ID `doc-research-141`; SHA256 `492eaa22521e285ed76e14b15a3c3daa8296c050a92ecc8b0d81418e0967f187`.
- `2026-11-09T20:31:27.488542+00:00` — `GET https://horizon.stellar.org/ledgers/63386819` — HTTP 200; receipt ID `public-horizon-boundary`; SHA256 `94508ca8a310290a81eb25426e2dcde3bcf33de67d74be5e1c78040f7bc7c7cf`.

### ll-016

Finding: `improvements/lumenloop/ll-016-historical-dispute-provenance.md`. **still-repro** — Historical query returns candidate articles4640/1912/78/4644/575/3899/3908/5374 without typed claimant, target-event, dispute, or corroboration relations. This confirms the scoped provenance request; no new false causal sentence is established by absent optional fields.

Action: Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet.

Upstream read `2026-11-09T20:31:40.819361+00:00`: https://github.com/lumenloop/lumenloop-backend/issues/31; state=open, updated=2026-07-13T22:54:34Z, comments=1. Latest comment https://github.com/lumenloop/lumenloop-backend/issues/31#issuecomment-4963575768 at 2026-07-13T22:54:34Z by **kalepail (Raven)**. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:31:07.539990+00:00` — `POST https://api.lumenloop.com/v1/tools/search_content_semantic {"query":"Stellar 2014 fork Ripple consensus 2015 SCP","types":["articles","research"],"limit":10}` — HTTP 200; receipt ID `historical`; SHA256 `3a2784b792be7b7595630d0aa6cae3713e8a5cb84b15e5644539bce3def5ff6e`.

### ll-017

Finding: `improvements/lumenloop/ll-017-semantic-person-match-provenance.md`. **partial** — Tyler and negative-control Strupey both return _weak_match=true, _top_similarity (.231/.259), and an explicit generic-filler warning. Tyler includes exact-name AV1487 and article625 mixed with unrelated content. AV passage query still returns topic neighbors without row-level exact-person relation/span. Existing aggregate safety improvement remains deployed; it does not resolve the row-level request.

Action: Retain residual; proposed self-contained successor ll-040 below. No new issue/comment while existing owner request already covers it.

Upstream read `2026-11-09T20:31:44.596141+00:00`: https://github.com/lumenloop/lumenloop-backend/issues/36; state=open, updated=2026-07-13T22:54:34Z, comments=1. Latest comment https://github.com/lumenloop/lumenloop-backend/issues/36#issuecomment-4963575742 at 2026-07-13T22:54:34Z by **kalepail (Raven)**. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:31:07.666940+00:00` — `POST https://api.lumenloop.com/v1/tools/search_content_semantic {"query":"Tyler van der Hoeven","limit":10}` — HTTP 200; receipt ID `tyler`; SHA256 `d22c4815e19393a9167eae702ff6bef4a360a3867bba6a759de1fab036c0e491`.
- `2026-11-09T20:31:07.807662+00:00` — `POST https://api.lumenloop.com/v1/tools/search_content_semantic {"query":"Strupey","limit":10}` — HTTP 200; receipt ID `negative`; SHA256 `ff528364c5f41aef9d7d81112c906ef5e47de1c7b8b84b18e5e70c1a14ac98c0`.
- `2026-11-09T20:31:09.526117+00:00` — `POST https://api.lumenloop.com/v1/tools/find_av_passages {"query":"Tyler van der Hoeven","limit":10}` — HTTP 200; receipt ID `av-Tyler van der Hoeven`; SHA256 `28f01987653a524e42b5ba85cbba9ecc3c98efbb0d58a85f98075f4de31454de`.

Persistent-reference scan: `rg -n --hidden -g '!node_modules/**' -g '!.git/**' -g '!tmp/**' "ll-017" .`.

Locations (full matched text in `tmp/lumenloop-sweep/ll-017-references.txt`):
- `./.agents/rounds/2026-09-21-improvements-followup.md`: 79
- `./.agents/rounds/2026-10-06-truth-maintenance/reverify-opus.md`: 114, 228
- `./.agents/rounds/2026-10-06-truth-maintenance/review-reverify-grok.md`: 111
- `./.agents/rounds/2026-10-10-weekend/answer-style/review-result-astra.md`: 256
- `./.agents/rounds/2026-11-02-golden-audit/pass1/defi-ecosystem-05.json`: 837, 838, 843, 1284
- `./.agents/rounds/2026-11-02-golden-audit/pass1/edge-behavior-02.json`: 840, 845
- `./.agents/rounds/2026-11-02-golden-audit/pass1/edge-behavior-03.json`: 474, 481, 496, 930, 1037
- `./.agents/rounds/2026-11-02-golden-audit/pass1/scf-grants-builders-01.json`: 262, 362
- `./.agents/rounds/2026-11-02-golden-audit/pass3/peer-handoff.json`: 786, 787
- `./.agents/rounds/2026-11-03-upstream-sweep/state.md`: 110
- `./.agents/rounds/2026-11-05-truth-maintenance/other-actions.json`: 353, 354
- `./.agents/rounds/2026-11-05-truth-maintenance/other.md`: 7, 46
- `./.agents/rounds/2026-11-06-remaining-sweep/other-actions.json`: 734, 735, 2349
- `./.agents/rounds/2026-11-06-remaining-sweep/other.md`: 96, 174
- `./eval/qa/cases.json`: 4944, 5186, 23040, 23112, 23716, 23869, 24000, 24002, 24007, 26098, 26163
- `./eval/qa/corpus/battery/defi-ecosystem/q-gap-semantic-directory-fallback.json`: 24, 89
- `./eval/qa/corpus/battery/edge-behavior/q-edge-open-world-recovery-after-narrow-miss.json`: 27, 99
- `./eval/qa/corpus/battery/edge-behavior/q-edge-strupey-ambiguous-stellar-history.json`: 27, 180, 311, 313, 318
- `./eval/qa/corpus/battery/scf-grants-builders/q-builder-content-by-person.json`: 20
- `./eval/qa/corpus/battery/scf-grants-builders/q-builder-justin-rice-history.json`: 24
- `./improvements/INDEX.md`: 87
- `./improvements/intake.json`: 73
- `./improvements/lumenloop/ll-017-semantic-person-match-provenance.md`: 2, 8, 22
- `./research/audits/2026-09-14-golden-freshness-review.md`: 113
- `./research/audits/2026-11-03-qa-followup/case-dispositions.json`: 251, 254, 2142, 2145, 3227, 3229, 10145
- `./research/audits/2026-11-06-remaining-sweep/other-receipt.json`: 5073

Retirement reconciliation: update active finding, generated index, intake override where present, current golden notes/partial caps/truth references, and live TODO pointers. Preserve dated round/research history as history; do not rewrite historical observations. No retirement, golden, intake, TODO, or generated-index edit was made by this lane.

### ll-018

Finding: `improvements/lumenloop/ll-018-exact-slug-fuzzy-bleed.md`. **still-repro** — slug=band returns both linked_project_slugs=[bando] and [band]. Exact tucambio/usdc-swap/fastbuka slugs remain soft-empty. Name=USDC Swap recovers recqE4Pq1SlYXqzuC with exact linked_project_slugs=[usdc-swap], directly proving the secondary-link miss. TuCambio/Fastbuka name controls also empty, so their historical record existence is not re-proven today.

Action: Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet.

Upstream read `2026-11-09T20:31:43.074393+00:00`: https://github.com/lumenloop/lumenloop-backend/issues/34; state=open, updated=2026-08-11T18:24:15Z, comments=2. Latest comment https://github.com/lumenloop/lumenloop-backend/issues/34#issuecomment-5257175616 at 2026-08-11T18:24:01Z by **kalepail (Raven)**. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:31:05.823589+00:00` — `POST https://api.lumenloop.com/v1/tools/get_scf_submissions {"slug":"band"}` — HTTP 200; receipt ID `scf-band`; SHA256 `75ad744dea5447a59d360864f24c202edc9d2b641be8ec3f3ca6758f3654d94b`.
- `2026-11-09T20:31:06.055809+00:00` — `POST https://api.lumenloop.com/v1/tools/get_scf_submissions {"slug":"tucambio"}` — HTTP 200; receipt ID `scf-tucambio`; SHA256 `f8a8a5bbf67fbc60c23f69effec63908f10c049cd0c4b3cb139395708af10565`.
- `2026-11-09T20:31:06.290740+00:00` — `POST https://api.lumenloop.com/v1/tools/get_scf_submissions {"slug":"usdc-swap"}` — HTTP 200; receipt ID `scf-usdc-swap`; SHA256 `d4398a13f0d76196fc07ccd5b7e7091f4f75dbfbeaa93c094bd6e0db10e6f730`.
- `2026-11-09T20:31:06.537488+00:00` — `POST https://api.lumenloop.com/v1/tools/get_scf_submissions {"slug":"fastbuka"}` — HTTP 200; receipt ID `scf-fastbuka`; SHA256 `19053fcdbd3de4dff554a773d8ae4b97600f87828be3d35fcaa6dd798b0783ee`.
- `2026-11-09T20:31:18.567654+00:00` — `POST https://api.lumenloop.com/v1/tools/get_scf_submissions {"name":"TuCambio"}` — HTTP 200; receipt ID `tucambio-name`; SHA256 `e5514ad887d687859ffcde9a451030ab36db52705f355d7be97edf23d03b7312`.
- `2026-11-09T20:31:18.933244+00:00` — `POST https://api.lumenloop.com/v1/tools/get_scf_submissions {"name":"USDC Swap"}` — HTTP 200; receipt ID `usdc-name`; SHA256 `34a7c9d460f9ed0224053835dd4e984b5fb1f0704ac264fa371135b0fa263cba`.
- `2026-11-09T20:31:19.005453+00:00` — `POST https://api.lumenloop.com/v1/tools/get_scf_submissions {"name":"Fastbuka"}` — HTTP 200; receipt ID `fastbuka-name`; SHA256 `82b083ea02bf999d5ca67c2622530625a13411171dd4ac871244c4907f4441e4`.

### ll-019

Finding: `improvements/lumenloop/ll-019-av-output-contract-shape-and-date.md`. **still-repro** — find_av_passages data is a top-level array, while current schema declares object.results. Rows contain summaries and opaque start_offset, without transcript/playback seconds. av445 DEVCON2024 still has created_at=2026-04-02T23:21:21.744Z; returns still calls created_at recording date. Description asks to quote matched chunk text while returns says transcript never returned.

Action: Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet.

Upstream read `2026-11-09T20:31:43.812158+00:00`: https://github.com/lumenloop/lumenloop-backend/issues/35; state=open, updated=2026-08-19T20:37:52Z, comments=2. Latest comment https://github.com/lumenloop/lumenloop-backend/issues/35#issuecomment-5347713582 at 2026-08-19T20:37:52Z by **kalepail (Raven)**. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:31:09.166494+00:00` — `POST https://api.lumenloop.com/v1/tools/find_av_passages {"query":"passkeys smart wallets on Soroban","limit":10}` — HTTP 200; receipt ID `av-passkeys smart wallets on Soroban`; SHA256 `fd1dced096ab15ab4ee76e980d2308ef628350872e8b287b75b76f5b643e7894`.
- `2026-11-09T20:31:09.697490+00:00` — `POST https://api.lumenloop.com/v1/tools/find_av_passages {"query":"Stellar DEVCON 2024","limit":10}` — HTTP 200; receipt ID `av-Stellar DEVCON 2024`; SHA256 `c3429c2e49f942fbf5e71c69a9ad67a05593d4ff6a3a967957e78b3bbea62359`.
- `2026-11-09T20:31:19.911425+00:00` — `GET https://api.lumenloop.com/v1/tools/find_av_passages` — HTTP 200; receipt ID `schema-find_av_passages`; SHA256 `38238245c9376422dea049a0886c79715c2a728737573ecfcb87c1cf5f84a6c2`.

### ll-020

Finding: `improvements/lumenloop/ll-020-protocol-27-post-vote-state.md`. **partial** — Exact articles title search Zipper returns only pre-vote article8084, which still says prepare before mainnet vote and carries no explicit current-state/supersession relation. Broad corpus contains post-vote research141 (separately wrong July9 date, ll-015), but this replay of broad activation search does not itself retrieve141 in its top10 research group. Coverage exists, yet the exact guide remains unlinked to correct July8 activation.

Action: Retain residual; proposed self-contained successor ll-041 below; ll-015 continues to own the incorrect later date.

Upstream read `2026-11-09T20:31:41.580754+00:00`: https://github.com/lumenloop/lumenloop-backend/issues/32; state=open, updated=2026-07-13T22:54:35Z, comments=1. Latest comment https://github.com/lumenloop/lumenloop-backend/issues/32#issuecomment-4963575853 at 2026-07-13T22:54:35Z by **kalepail (Raven)**. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:31:16.463489+00:00` — `POST https://api.lumenloop.com/v1/tools/search_documents {"collection":"articles","query":"Zipper","limit":10}` — HTTP 200; receipt ID `search-Zipper`; SHA256 `9ebe6ca4f5e20b59559d981e98ed13e54a25f338656bd19e4516677ecc09b897`.
- `2026-11-09T20:30:53.799373+00:00` — `POST https://api.lumenloop.com/v1/tools/get_document {"collection":"articles","id":8084}` — HTTP 200; receipt ID `doc-articles-8084`; SHA256 `a611b297c0001ce20050d94c054319156e032e3f3d17bcf01d9b23993faa5856`.
- `2026-11-09T20:31:08.534438+00:00` — `POST https://api.lumenloop.com/v1/tools/search_content_semantic {"query":"Zipper Protocol 27 activation","types":["articles","research"],"limit":10}` — HTTP 200; receipt ID `zipper`; SHA256 `1581d4a291287c7db3088e7a93056fd8c34011329ae374076d6d51fd25e53bed`.
- `2026-11-09T20:30:50.758009+00:00` — `POST https://api.lumenloop.com/v1/tools/get_document {"collection":"research","id":141}` — HTTP 200; receipt ID `doc-research-141`; SHA256 `492eaa22521e285ed76e14b15a3c3daa8296c050a92ecc8b0d81418e0967f187`.
- `2026-11-09T20:31:27.488542+00:00` — `GET https://horizon.stellar.org/ledgers/63386819` — HTTP 200; receipt ID `public-horizon-boundary`; SHA256 `94508ca8a310290a81eb25426e2dcde3bcf33de67d74be5e1c78040f7bc7c7cf`.

Persistent-reference scan: `rg -n --hidden -g '!node_modules/**' -g '!.git/**' -g '!tmp/**' "ll-020" .`.

Locations (full matched text in `tmp/lumenloop-sweep/ll-020-references.txt`):
- `./.agents/rounds/2026-09-21-improvements-followup.md`: 82
- `./.agents/rounds/2026-11-03-upstream-sweep/state.md`: 113
- `./.agents/rounds/2026-11-05-truth-maintenance/other-actions.json`: 395, 396
- `./.agents/rounds/2026-11-05-truth-maintenance/other.md`: 7, 49
- `./.agents/rounds/2026-11-06-remaining-sweep/other-actions.json`: 826, 827, 2350
- `./.agents/rounds/2026-11-06-remaining-sweep/other.md`: 99, 175
- `./improvements/INDEX.md`: 90
- `./improvements/intake.json`: 85
- `./improvements/lumenloop/ll-020-protocol-27-post-vote-state.md`: 2, 8, 16
- `./research/audits/2026-11-03-qa-followup/case-dispositions.json`: 272, 275, 2163, 2166, 3245, 3247, 10157
- `./research/qa-deep-dive-2026-08-25/terra-max.md`: 196

Retirement reconciliation: update active finding, generated index, intake override where present, current golden notes/partial caps/truth references, and live TODO pointers. Preserve dated round/research history as history; do not rewrite historical observations. No retirement, golden, intake, TODO, or generated-index edit was made by this lane.

### ll-022

Finding: `improvements/lumenloop/ll-022-cctp-milestone-provenance.md`. **inconclusive** — Article6461 still has May19 publication and no typed technical/deployment/announcement milestones. Current SDF page supports May19 publication; Circle notes distinguish May18 technical support. No wrong May8 Lumenloop content is captured. Latest issue38 correction is by kalepail/Raven, not owner validation. Missing evidence remains an actual wrong/unqualified date response or an owner schema decision, not merely absent optional fields.

Action: Retain status and explicit uncertainty. Do not claim correction or retire; coordinator may review evidentiary basis of optional schema request.

Upstream read `2026-11-09T20:31:45.990830+00:00`: https://github.com/lumenloop/lumenloop-backend/issues/38; state=open, updated=2026-11-06T14:13:54Z, comments=2. Latest comment https://github.com/lumenloop/lumenloop-backend/issues/38#issuecomment-6686881728 at 2026-11-06T14:13:54Z by **kalepail (Raven)**. The ll-022 correction is Raven correcting its own supporting evidence, not owner confirmation.

Live requests:
- `2026-11-09T20:30:52.486501+00:00` — `POST https://api.lumenloop.com/v1/tools/get_document {"collection":"articles","id":6461}` — HTTP 200; receipt ID `doc-articles-6461`; SHA256 `d3a4406471afd05735046e694215e5f7c8de001efa33323fb0af2bfa741d8a24`.
- `2026-11-09T20:31:19.272902+00:00` — `POST https://api.lumenloop.com/v1/tools/search_content_semantic {"query":"Circle CCTP Stellar launch May 8 May 18 May 19 2026","types":["articles","research"],"limit":10}` — HTTP 200; receipt ID `cctp-milestones`; SHA256 `1d8e99c46397e8f8b74e976232cac66f9dbc66f547446098b400d738a17b8334`.
- `2026-11-09T20:31:21.544782+00:00` — `GET https://stellar.org/blog/foundation-news/circle-cctp-is-live-on-stellar` — HTTP 200; receipt ID `public-cctp`; SHA256 `2ad3f6e0fb265c5f146017f55cdc06f038a04238ce1369a5c93a6618b655e4f9`.
- `2026-11-09T20:31:21.757395+00:00` — `GET https://developers.circle.com/release-notes/cctp-2026` — HTTP 200; receipt ID `public-circle-dates`; SHA256 `875d17b736c0b38a4a76c1d6d33da631669324c478558e300ae2efb39a23d621`.

### ll-023

Finding: `improvements/lumenloop/ll-023-confidential-tokens-preview-status.md`. **inconclusive** — Article8877 explicitly says Testnet live now, title says Developer Preview, and long summary says audits underway before mainnet. Adjacent article8916/research139 and expanded preview retrieval preserve qualifications. Missing structured maturity fields reproduce, but no retained original response proves boundary-dropping. Correct current prose therefore cannot prove a historical silent fix.

Action: Retain status and explicit uncertainty; await a concrete boundary-dropping response or owner decision. Do not turn optional metadata into a proven false Mainnet claim.

Upstream read `2026-11-09T20:31:46.764995+00:00`: https://github.com/lumenloop/lumenloop-backend/issues/39; state=open, updated=2026-07-13T22:54:35Z, comments=1. Latest comment https://github.com/lumenloop/lumenloop-backend/issues/39#issuecomment-4963575908 at 2026-07-13T22:54:35Z by **kalepail (Raven)**. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:30:54.279242+00:00` — `POST https://api.lumenloop.com/v1/tools/get_document {"collection":"articles","id":8877}` — HTTP 200; receipt ID `doc-articles-8877`; SHA256 `d5f23455c4628167c773bc64d951990b7e8450e5055c3e92eb833ab31e46d310`.
- `2026-11-09T20:32:39.243363+00:00` — `POST https://api.lumenloop.com/v1/tools/get_document {"collection":"articles","id":8916}` — HTTP 200; receipt ID `adjacent-8916`; SHA256 `df6088901bcc4561766f28a00c8b1f0a84458a8810394d3f7607da45d97233b3`.
- `2026-11-09T20:32:39.652707+00:00` — `POST https://api.lumenloop.com/v1/tools/get_document {"collection":"research","id":139}` — HTTP 200; receipt ID `adjacent-139`; SHA256 `a6c1cc8f551161492182a09036e6083bbea712733af85d6b8bee5efad39a0d33`.
- `2026-11-09T20:31:19.282240+00:00` — `POST https://api.lumenloop.com/v1/tools/search_content_semantic {"query":"Confidential Tokens developer preview Testnet June 29 2026 mainnet audits","types":["articles","research"],"limit":10}` — HTTP 200; receipt ID `confidential-preview`; SHA256 `acad487af5f1ae519118c127a3caecc87381cb87be715a20b17da36405cb1bfc`.

### ll-024

Finding: `improvements/lumenloop/ll-024-meridian-event-supersession.md`. **inconclusive** — Old event1457 remains unavailable; Yas Marina exact search empty; Abu Dhabi returns unrelated1212. Meridian exact and expanded searches expose current1819 with Lisbon/Convento do Beato Oct28-29, not a stale venue. No retained original stale-as-current response or deployed revision mechanism establishes a historical fix.

Action: Retain status and uncertainty; await a concrete stale response or owner explanation identifying the removed/revised record. No retirement from disappearance alone.

Upstream read `2026-11-09T20:31:42.312336+00:00`: https://github.com/lumenloop/lumenloop-backend/issues/33; state=open, updated=2026-07-13T22:54:36Z, comments=1. Latest comment https://github.com/lumenloop/lumenloop-backend/issues/33#issuecomment-4963575914 at 2026-07-13T22:54:35Z by **kalepail (Raven)**. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:30:55.222173+00:00` — `POST https://api.lumenloop.com/v1/tools/get_document {"collection":"events","id":1457}` — HTTP 200; receipt ID `doc-events-1457`; SHA256 `bc85c7f6bb694e4b15de253ab0b4472a9359f59fe88df0e8f516d7e4b4a3650d`.
- `2026-11-09T20:31:16.540363+00:00` — `POST https://api.lumenloop.com/v1/tools/search_documents {"collection":"events","query":"Yas Marina","limit":10}` — HTTP 200; receipt ID `search-Yas Marina`; SHA256 `7f014e27b0c32759b5ea0aeda8a2f094639c57ba8afe0c7fda873ede099d1fbc`.
- `2026-11-09T20:31:16.811002+00:00` — `POST https://api.lumenloop.com/v1/tools/search_documents {"collection":"events","query":"Abu Dhabi","limit":10}` — HTTP 200; receipt ID `search-Abu Dhabi`; SHA256 `e9007caf117257eaea22c91ee1a03bf2377caf54d4fa5c9a777d986185fd6fff`.
- `2026-11-09T20:31:17.518405+00:00` — `POST https://api.lumenloop.com/v1/tools/search_documents {"collection":"events","query":"Meridian","limit":100}` — HTTP 200; receipt ID `meridian-exact`; SHA256 `2f09e4d76df38cd0915f106775ebf37f3e35db42fae844266a90d89f1a0d2989`.
- `2026-11-09T20:31:19.385896+00:00` — `POST https://api.lumenloop.com/v1/tools/search_content_semantic {"query":"Meridian 2026 Abu Dhabi Yas Marina October 21 22 Lisbon October 28 29","types":["events","research"],"limit":10}` — HTTP 200; receipt ID `meridian-stale`; SHA256 `a3b3d69e574a5ac8a3991e4132a18f5cb26eeea7388807142373f248ce5cf559`.
- `2026-11-09T20:31:18.545899+00:00` — `POST https://api.lumenloop.com/v1/tools/get_document {"collection":"events","id":1819}` — HTTP 200; receipt ID `meridian1819`; SHA256 `76068357cf506ec1b7008f5248750dc85fb0bf894cb8b23c62bcc84659446a28`.

### ll-025

Finding: `improvements/lumenloop/ll-025-quantum-roadmap-maturity-typing.md`. **still-repro** — Article8228 and public Lumenloop markdown still say enterprise wallets can shift to quantum-safe contract accounts immediately; dated linked source still says required signer/primitives missing today and uses staged roadmap language. Current CAP0087 is Implemented/protocol30, while current Mainnet Horizon remains29. This check concerns source-date maturity wording, not a claim host functions are unimplemented everywhere or that native classic signers shipped.

Action: Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet.

Upstream read `2026-11-09T20:31:45.303603+00:00`: https://github.com/lumenloop/lumenloop-backend/issues/37; state=open, updated=2026-07-13T22:54:35Z, comments=1. Latest comment https://github.com/lumenloop/lumenloop-backend/issues/37#issuecomment-4963575910 at 2026-07-13T22:54:35Z by **kalepail (Raven)**. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:30:55.932291+00:00` — `POST https://api.lumenloop.com/v1/tools/get_document {"collection":"articles","id":8228}` — HTTP 200; receipt ID `doc-articles-8228`; SHA256 `7d45c361e22a09497b44cbee2f2b87c04637a30d8426093afd1e268f6c05a3ad`.
- `2026-11-09T20:31:25.374189+00:00` — `GET https://lumenloop.com/api/md/news/introducing-quantum-preparedness-plan` — HTTP 200; receipt ID `public-ll-page-introducing-quantum-preparedness-plan`; SHA256 `ca02cc9df6f230180733fb55cee8bb1373bcd35bb4b2eca1c90a42333c879206`.
- `2026-11-09T20:31:26.428065+00:00` — `GET https://stellar.org/blog/foundation-news/introducing-the-quantum-preparedness-plan` — HTTP 200; receipt ID `public-primary-quantum`; SHA256 `e19722813993583586fa17891ae205a39d4e0e7d82e5a12fea16a2f9fea695bc`.
- `2026-11-09T20:31:19.982902+00:00` — `GET https://raw.githubusercontent.com/stellar/stellar-protocol/master/core/cap-0087.md` — HTTP 200; receipt ID `public-protocol-cap-0087.md`; SHA256 `437a32775ced644a58a00d2c93b507c41a959bbfbcd91398858c1b04ebf03bc9`.
- `2026-11-09T20:31:27.673535+00:00` — `GET https://horizon.stellar.org/` — HTTP 200; receipt ID `public-horizon`; SHA256 `0799998b7b08449bf1867b439661377941d70e1ad80a5ccebe5682151e30be3d`.

### ll-026

Finding: `improvements/lumenloop/ll-026-event-announcement-effective-date-separation.md`. **still-repro** — Article5416 correctly retains a January15 publication date and February9 planned launch pending regulatory review in prose. Retrospective4809 says launched in February. Neither exposes typed announcement/effective/trade/first-trade relations. This reproduces the metadata request without a wrong-date claim; these two summaries alone cannot establish the first-trade day.

Action: Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet.

Upstream read `2026-11-09T20:31:47.546353+00:00`: https://github.com/lumenloop/lumenloop-backend/issues/40; state=open, updated=2026-07-13T22:54:35Z, comments=1. Latest comment https://github.com/lumenloop/lumenloop-backend/issues/40#issuecomment-4963575912 at 2026-07-13T22:54:35Z by **kalepail (Raven)**. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:30:56.473991+00:00` — `POST https://api.lumenloop.com/v1/tools/get_document {"collection":"articles","id":5416}` — HTTP 200; receipt ID `doc-articles-5416`; SHA256 `0ff3ee799a0e609fa35fe854cecf7b0b06a0828e02f336cfd46c06f2d804acc1`.
- `2026-11-09T20:30:55.908398+00:00` — `POST https://api.lumenloop.com/v1/tools/get_document {"collection":"articles","id":4809}` — HTTP 200; receipt ID `doc-articles-4809`; SHA256 `cc084a8104613ae3f987ef9827e56311f225a35b85507a5092a2452c9ed5da12`.

### ll-027

Finding: `improvements/lumenloop/ll-027-redstone-asset-feed-scope.md`. **still-repro** — Article8068 and public markdown still say nine assets live, without enumerated set, metric unit, snapshot basis, or typed as-of. Linked RedStone source and fresh Scout page were read as adjacent controls. Asset-versus-feed and as-of scope remain insufficient to assert an actual nine-versus-ten contradiction.

Action: Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet.

Upstream read `2026-11-09T20:31:48.388812+00:00`: https://github.com/lumenloop/lumenloop-backend/issues/41; state=open, updated=2026-07-13T22:54:36Z, comments=1. Latest comment https://github.com/lumenloop/lumenloop-backend/issues/41#issuecomment-4963576001 at 2026-07-13T22:54:36Z by **kalepail (Raven)**. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:30:58.616448+00:00` — `POST https://api.lumenloop.com/v1/tools/get_document {"collection":"articles","id":8068}` — HTTP 200; receipt ID `doc-articles-8068`; SHA256 `c985e29c6c23eabe24480c6464a36ffd5f9cdd12bbfae80e905417d84ea3d26a`.
- `2026-11-09T20:31:25.552158+00:00` — `GET https://lumenloop.com/api/md/news/reliability-scale-redstone-data-standard-stellar-rwa-moment` — HTTP 200; receipt ID `public-ll-page-reliability-scale-redstone-data-standard-stellar-rwa-moment`; SHA256 `c4c053172c0852d4834cdee4a846a1c1c7b386e3d32e6e587576f7ce0f5c42ab`.
- `2026-11-09T20:31:26.649405+00:00` — `GET https://blog.redstone.finance/2026/06/04/reliability-at-scale-redstone-and-the-data-standard-for-stellars-rwa-moment/` — HTTP 200; receipt ID `public-primary-redstone`; SHA256 `9b8493eca107ef27386abf458fecb99d0c63b5f1129a3beeb35bdd8d0718eaee`.
- `2026-11-09T20:31:21.897325+00:00` — `GET https://stellarlight.xyz/project/redstone-finance` — HTTP 200; receipt ID `public-scout-redstone`; SHA256 `14cac4ef1bad2d4a65763047973833a734ebf0bcbb1700929693fa84089274fc`.

### ll-028

Finding: `improvements/lumenloop/ll-028-list-documents-unknown-sort-silent.md`. **still-repro** — Omitted sort, definitely_not_a_real_sort_key, zzz_not_a_field, and foreign last_seen_at all return HTTP200, ids13500/13497/13495, total2304. publishing_date DESC instead returns13495/13500/13480. No effective-sort echo or warning appears.

Action: Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet.

Upstream read `2026-11-09T20:31:49.834633+00:00`: https://github.com/lumenloop/lumenloop-backend/issues/43; state=open, updated=2026-08-19T20:36:39Z, comments=0. No comments. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:31:12.019415+00:00` — `POST https://api.lumenloop.com/v1/tools/list_documents {"collection":"articles","order":"DESC","limit":3}` — HTTP 200; receipt ID `sort-undefined`; SHA256 `62a7169249200b56002abc0d403df8dce51b37eef691ab7775adcb24860695df`.
- `2026-11-09T20:31:12.190926+00:00` — `POST https://api.lumenloop.com/v1/tools/list_documents {"collection":"articles","sort":"definitely_not_a_real_sort_key","order":"DESC","limit":3}` — HTTP 200; receipt ID `sort-definitely_not_a_real_sort_key`; SHA256 `62a7169249200b56002abc0d403df8dce51b37eef691ab7775adcb24860695df`.
- `2026-11-09T20:31:12.823427+00:00` — `POST https://api.lumenloop.com/v1/tools/list_documents {"collection":"articles","sort":"zzz_not_a_field","order":"DESC","limit":3}` — HTTP 200; receipt ID `sort-zzz_not_a_field`; SHA256 `62a7169249200b56002abc0d403df8dce51b37eef691ab7775adcb24860695df`.
- `2026-11-09T20:31:12.892321+00:00` — `POST https://api.lumenloop.com/v1/tools/list_documents {"collection":"articles","sort":"last_seen_at","order":"DESC","limit":3}` — HTTP 200; receipt ID `sort-last_seen_at`; SHA256 `62a7169249200b56002abc0d403df8dce51b37eef691ab7775adcb24860695df`.
- `2026-11-09T20:31:13.207105+00:00` — `POST https://api.lumenloop.com/v1/tools/list_documents {"collection":"articles","sort":"publishing_date","order":"DESC","limit":3}` — HTTP 200; receipt ID `sort-publishing_date`; SHA256 `07143973abd79355e166ca0387f7d5a49d0e4da79d8e964429ebeecdd0c8705d`.

### ll-029

Finding: `improvements/lumenloop/ll-029-output-schema-top-level-shape-drift.md`. **still-repro** — All five live tool schemas still declare an object with results/text, contradicting actual grouped entity output, project similarity array, valid SCF-submission similarity array, related-project content object, and tags array. Invalid SCF slug blend returns guidance and is not used as the positive array control. Missing-source related-project array is separately ll-037.

Action: Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet.

Upstream read `2026-11-09T20:31:43.812158+00:00`: https://github.com/lumenloop/lumenloop-backend/issues/35; state=open, updated=2026-08-19T20:37:52Z, comments=2. Latest comment https://github.com/lumenloop/lumenloop-backend/issues/35#issuecomment-5347713582 at 2026-08-19T20:37:52Z by **kalepail (Raven)**. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:31:20.034393+00:00` — `GET https://api.lumenloop.com/v1/tools/find_content_by_entity` — HTTP 200; receipt ID `schema-find_content_by_entity`; SHA256 `0c2dff34c136763b4cdb477fe5e749b263b2187cbc029d0740e90fe8b289b81a`.
- `2026-11-09T20:31:20.163396+00:00` — `GET https://api.lumenloop.com/v1/tools/find_similar_projects_semantic` — HTTP 200; receipt ID `schema-find_similar_projects_semantic`; SHA256 `a36e2bc8da79199af650d7d44790baf4834725aa4ec3c85bcee8a3a61fbd7896`.
- `2026-11-09T20:31:21.054872+00:00` — `GET https://api.lumenloop.com/v1/tools/find_similar_scf_submissions` — HTTP 200; receipt ID `schema-find_similar_scf_submissions`; SHA256 `b30ec8671cbc2d22d70b725535ee9c7d9028a067a74a458ef9119131a7a6083b`.
- `2026-11-09T20:31:21.078134+00:00` — `GET https://api.lumenloop.com/v1/tools/get_related_projects` — HTTP 200; receipt ID `schema-get_related_projects`; SHA256 `b29bfe1e2222d197fa5f97d8685dc6dabbe0b303396836e1c77b3b676f0f4c2b`.
- `2026-11-09T20:31:22.043605+00:00` — `GET https://api.lumenloop.com/v1/tools/get_tags_vocabulary` — HTTP 200; receipt ID `schema-get_tags_vocabulary`; SHA256 `b29920f6ad3035eda09876972ed1e65c6b42dba89dfa02d6225c72513b86663e`.
- `2026-11-09T20:31:00.996800+00:00` — `POST https://api.lumenloop.com/v1/tools/find_content_by_entity {"entity":"Stellar Development Foundation","entity_type":"organization","limit":5}` — HTTP 200; receipt ID `entity-Stellar Development Foundation`; SHA256 `8bd7c2a20f71dcbfce973c7fcd959bf0e71a158b74d04e4d3d54e1f6931d3982`.
- `2026-11-09T20:31:16.094341+00:00` — `POST https://api.lumenloop.com/v1/tools/find_similar_projects_semantic {"slug":"blend","limit":5}` — HTTP 200; receipt ID `find_similar_projects_semantic`; SHA256 `b65c57deef38880da095b0872f69a531b439f32ed84aea5b604363755c43dee6`.
- `2026-11-09T20:31:17.323460+00:00` — `POST https://api.lumenloop.com/v1/tools/find_similar_scf_submissions {"slug":"recRSgNDEycVg2xG8","limit":5}` — HTTP 200; receipt ID `scf-similar`; SHA256 `11d523f1d3aeddf6cbd1f1b274ab0a5f3d63ab31375b42a83bbd6d07bf02b10a`.
- `2026-11-09T20:31:15.369290+00:00` — `POST https://api.lumenloop.com/v1/tools/get_related_projects {"content_type":"article","content_id":10190}` — HTTP 200; receipt ID `related-number-10190`; SHA256 `ba2cdb36e1d50de9c563ab70dcd909c678f843d4ea6b018219d5fd90b8053396`.
- `2026-11-09T20:31:16.481124+00:00` — `POST https://api.lumenloop.com/v1/tools/get_tags_vocabulary {}` — HTTP 200; receipt ID `tags`; SHA256 `539a87707b8f87ed04908a807a07589b4dddb89541124c03effbf01abc157f19`.
- `2026-11-09T20:31:15.127990+00:00` — `POST https://api.lumenloop.com/v1/tools/get_related_projects {"content_type":"article","content_id":99999999}` — HTTP 200; receipt ID `related-number-99999999`; SHA256 `c5931569fd3e79acbc162d282209f915531a719e5547f12c9a728a33047d51c7`.

### ll-030

Finding: `improvements/lumenloop/ll-030-project-record-subproducts-unnamed.md`. **still-repro** — WisdomTree record still counts 13 digital funds and Gold token but names no CRDT/CRDYX; mainnet.tokens empty and current YAML agrees. CRDT directory fallback is semantic neighbors. Exact original semantic query limit15 returns24 rows without either ticker. Fresh issuer TOML names CRDT anchored to CRDYX, so product existence is independently controlled.

Action: Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet.

Upstream read `2026-11-09T20:31:50.544453+00:00`: https://github.com/lumenloop/lumenloop-backend/issues/44; state=open, updated=2026-09-09T03:36:28Z, comments=0. No comments. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:31:03.210730+00:00` — `POST https://api.lumenloop.com/v1/tools/get_project {"slug":"wisdomtree"}` — HTTP 200; receipt ID `project-wisdomtree`; SHA256 `e2e0f203d8cfbcb4dd27827561c063d7cee62fcba59b9e066a8d40c6324fbe61`.
- `2026-11-09T20:31:10.237292+00:00` — `POST https://api.lumenloop.com/v1/tools/search_directory {"query":"CRDT","limit":10}` — HTTP 200; receipt ID `directory-CRDT`; SHA256 `a6dc53449dabd572d84a0d114812fa225338e7fed9daf412e4e2ebf9cce2b029`.
- `2026-11-09T20:31:19.424116+00:00` — `POST https://api.lumenloop.com/v1/tools/search_content_semantic {"query":"WisdomTree CRDT CRDYX private credit alternative income digital fund Stellar","limit":15}` — HTTP 200; receipt ID `crdt-original-limit15`; SHA256 `42f47d69b8d936bca6a93f22a8e8b56c1ec8df42310365cd027a6853fb74682e`.
- `2026-11-09T20:31:24.320791+00:00` — `GET https://raw.githubusercontent.com/lumenloop/stellar-ecosystem-db/main/projects/wisdomtree.yaml` — HTTP 200; receipt ID `public-yaml-wisdomtree`; SHA256 `4187570c3b0a4acd98dc4b69dcca132ecf6c812dbfd416c05c9e759f5ed3e0ef`.
- `2026-11-09T20:31:25.035118+00:00` — `GET https://stellar.wisdomtree.com/.well-known/stellar.toml` — HTTP 200; receipt ID `public-wisdomtree-toml`; SHA256 `773b534176e3a9b7bdc9671568226d15978192fed4914725d786534a8168c156`.

### ll-031

Finding: `improvements/lumenloop/ll-031-document-id-output-input-types.md`. **still-repro** — Exact title search emits string id10190 and numeric get_document emits the same string ID. Numeric get_document/related calls succeed; passing string10190 into either yields HTTP400 invalid_arguments Expected number, received string. Valid related690 control also succeeds.

Action: Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet.

Upstream read `2026-11-09T20:31:51.220943+00:00`: https://github.com/lumenloop/lumenloop-backend/issues/46; state=open, updated=2026-10-09T15:24:43Z, comments=0. No comments. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:31:15.113526+00:00` — `POST https://api.lumenloop.com/v1/tools/search_documents {"collection":"articles","query":"2+ Years of Neural Quorum Governance","limit":5}` — HTTP 200; receipt ID `search-id`; SHA256 `7d4251be66883238152e2ed8e5c22665877b6f0cf2e50b89b4ba2d3fef36d276`.
- `2026-11-09T20:30:58.171946+00:00` — `POST https://api.lumenloop.com/v1/tools/get_document {"collection":"articles","id":10190}` — HTTP 200; receipt ID `doc-articles-10190`; SHA256 `f6a18289821a086bb68852caea0044612cd08e86c77744a28a8e36eaaa8ccc7b`.
- `2026-11-09T20:31:14.421132+00:00` — `POST https://api.lumenloop.com/v1/tools/get_document {"collection":"articles","id":"10190"}` — HTTP 400; receipt ID `doc-string-id`; SHA256 `b970a68a8930d334581fa4caa1a064c38fe5a5548b31ac5aca2dfd049fd1f742`.
- `2026-11-09T20:31:15.369290+00:00` — `POST https://api.lumenloop.com/v1/tools/get_related_projects {"content_type":"article","content_id":10190}` — HTTP 200; receipt ID `related-number-10190`; SHA256 `ba2cdb36e1d50de9c563ab70dcd909c678f843d4ea6b018219d5fd90b8053396`.
- `2026-11-09T20:31:15.669879+00:00` — `POST https://api.lumenloop.com/v1/tools/get_related_projects {"content_type":"article","content_id":"10190"}` — HTTP 400; receipt ID `related-string-10190`; SHA256 `76966fe8cff1e737d3c4504e6d6341b8b1f8e47ae7abfa3e2d6ea3bf3389dad5`.
- `2026-11-09T20:31:15.754771+00:00` — `POST https://api.lumenloop.com/v1/tools/get_related_projects {"content_type":"article","content_id":690}` — HTTP 200; receipt ID `related-number-690`; SHA256 `8e353aa9801eb700c3b2776a6240c41f31cf2c2e14853f6766161a29399ba4bc`.

### ll-032

Finding: `improvements/lumenloop/ll-032-freighter-varial-rename-stale-record.md`. **still-repro** — freighter API and YAML still have title Freighter, other_names=[], website freighter.app. varial directory query yields semantic neighbors and no freighter. Old website follows to current Varial site; current wallet README names Varial. Adjacent lumenswap/latch/aha-labs YAML descriptions still use Freighter.

Action: Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet.

Upstream read `2026-11-09T20:31:55.041480+00:00`: https://github.com/lumenloop/stellar-ecosystem-db/issues/13; state=open, updated=2026-11-02T23:23:42Z, comments=0. No comments. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:31:04.685268+00:00` — `POST https://api.lumenloop.com/v1/tools/get_project {"slug":"freighter"}` — HTTP 200; receipt ID `project-freighter`; SHA256 `e61dc297bb7ddfc7e949c3b32461ae9bf6c80a577c499fbd1932fb55fcc54768`.
- `2026-11-09T20:31:11.595059+00:00` — `POST https://api.lumenloop.com/v1/tools/search_directory {"query":"varial","limit":10}` — HTTP 200; receipt ID `directory-varial`; SHA256 `f1043612c198c8b65cbe2ea97b3279e9699c3ec9dc7ee216c3d546468a8bd8e6`.
- `2026-11-09T20:31:23.957244+00:00` — `GET https://raw.githubusercontent.com/lumenloop/stellar-ecosystem-db/main/projects/freighter.yaml` — HTTP 200; receipt ID `public-yaml-freighter`; SHA256 `54ffd5042b1ff97d0d8b594a92eefeeea5528312609fe7413c1ace4e8c67ee41`.
- `2026-11-09T20:31:24.939377+00:00` — `GET https://raw.githubusercontent.com/stellar/freighter/master/README.md` — HTTP 200; receipt ID `public-freighter-readme`; SHA256 `ac2ad69cb990c8f127eee322d25b2533ffdc78beadf901916e3b2b8cf0bf8d4f`.
- `2026-11-09T20:31:24.997251+00:00` — `GET https://freighter.app/` — HTTP 200; receipt ID `public-freighter-redirect`; SHA256 `31c357dcde555d4e3e6744cabe99000251b138e7ac6d3e35b390654184cd9c31`.
- `2026-11-09T20:31:24.647377+00:00` — `GET https://raw.githubusercontent.com/lumenloop/stellar-ecosystem-db/main/projects/lumenswap.yaml` — HTTP 200; receipt ID `public-yaml-lumenswap`; SHA256 `eecb85078923c0a19df84bd36c571f6f75fb0f54717900210ba06042e364502f`.
- `2026-11-09T20:31:24.752600+00:00` — `GET https://raw.githubusercontent.com/lumenloop/stellar-ecosystem-db/main/projects/latch.yaml` — HTTP 200; receipt ID `public-yaml-latch`; SHA256 `b1b44b95e1dcbc799becef87307c5dfee0daf3aaec703ce91122c2b9413edd84`.
- `2026-11-09T20:31:24.841424+00:00` — `GET https://raw.githubusercontent.com/lumenloop/stellar-ecosystem-db/main/projects/aha-labs.yaml` — HTTP 200; receipt ID `public-yaml-aha-labs`; SHA256 `160331a0f748d351bfdd0be2afeb42a3b4928251ebddee3b0b3242c5100e8fc8`.

### ll-033

Finding: `improvements/lumenloop/ll-033-slender-record-collateral-misstatement.md`. **still-repro** — Slender API and YAML still say lend and borrow assets without collateral; fresh Certora audit overview describes ordinary borrowing via an over-collateralized loan. This does not justify changing unrelated products or equating flash loans with ordinary borrowing.

Action: Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet.

Upstream read `2026-11-09T20:31:55.747327+00:00`: https://github.com/lumenloop/stellar-ecosystem-db/issues/14; state=open, updated=2026-11-02T23:23:47Z, comments=0. No comments. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:31:05.384441+00:00` — `POST https://api.lumenloop.com/v1/tools/get_project {"slug":"slender"}` — HTTP 200; receipt ID `project-slender`; SHA256 `69b832a2b7f20934c3ebab04277bd727c361b9bb7beb883874892b3ecf788422`.
- `2026-11-09T20:31:24.087447+00:00` — `GET https://raw.githubusercontent.com/lumenloop/stellar-ecosystem-db/main/projects/slender.yaml` — HTTP 200; receipt ID `public-yaml-slender`; SHA256 `5ee0b5361e6af2613c8171fccbce268489777c65a3d6dd0c8b302afb63f5405c`.
- `2026-11-09T20:31:20.792630+00:00` — `GET https://www.certora.com/reports/slender` — HTTP 200; receipt ID `public-slender-audit`; SHA256 `68a1c3947b28d73685bbcc7014c416e406ec840f118b634a03a8f54d9f1b81ad`.

### ll-034

Finding: `improvements/lumenloop/ll-034-search-directory-alphabetical-no-exact-priority.md`. **still-repro** — Blend limit1 still returns only account-demolisher; limit20 starts account-demolisher/backyard/bexo/blend. Soroswap exact slug is eighth and xBull second in adjacent name searches. This is exact identity priority, not evidence of the SQL sort column or the semantic fallback ordering.

Action: Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet.

Upstream read `2026-11-09T20:31:51.957882+00:00`: https://github.com/lumenloop/lumenloop-backend/issues/48; state=open, updated=2026-11-02T23:23:52Z, comments=0. No comments. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:31:12.000179+00:00` — `POST https://api.lumenloop.com/v1/tools/search_directory {"query":"Blend","limit":1}` — HTTP 200; receipt ID `blend-limit1`; SHA256 `fa98a4121881fa01bff75ee8cea98b51920a39f2575c7ff72e43ae811f81255f`.
- `2026-11-09T20:31:11.365314+00:00` — `POST https://api.lumenloop.com/v1/tools/search_directory {"query":"Blend","limit":20}` — HTTP 200; receipt ID `directory-Blend`; SHA256 `52f4b79ee78cd36455a9ea67a9036f63441709fd4e32db778d6635d5bbc8328e`.
- `2026-11-09T20:31:11.609682+00:00` — `POST https://api.lumenloop.com/v1/tools/search_directory {"query":"soroswap","limit":10}` — HTTP 200; receipt ID `directory-soroswap`; SHA256 `30d484c902410333599700ca2bb58f17bf8cd2f8bb95e6ff6894ecff1590f904`.
- `2026-11-09T20:31:11.782747+00:00` — `POST https://api.lumenloop.com/v1/tools/search_directory {"query":"xbull","limit":10}` — HTTP 200; receipt ID `directory-xbull`; SHA256 `137e3798d229d052c2bb80484c627986d0f64178491a0eb3e34f7d4ed112e81c`.

### ll-035

Finding: `improvements/lumenloop/ll-035-unknown-arguments-silently-accepted.md`. **still-repro** — events time_period=upcoming, bogus_arg=x, and no filter return HTTP200 total1210; correct period=upcoming returns23. Directory and project bogus_arg controls also succeed without warning. Current schemas retain additionalProperties=false.

Action: Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet.

Upstream read `2026-11-09T20:31:52.737802+00:00`: https://github.com/lumenloop/lumenloop-backend/issues/49; state=open, updated=2026-11-02T23:23:58Z, comments=0. No comments. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:31:13.269042+00:00` — `POST https://api.lumenloop.com/v1/tools/list_documents {"collection":"events","limit":1,"time_period":"upcoming"}` — HTTP 200; receipt ID `unknown-time_period`; SHA256 `26c7f37e8fd8d7c66be53070d394d4fab27f74dc3e3a0bb83d45d62a6aeb1466`.
- `2026-11-09T20:31:13.582916+00:00` — `POST https://api.lumenloop.com/v1/tools/list_documents {"collection":"events","limit":1,"period":"upcoming"}` — HTTP 200; receipt ID `unknown-period`; SHA256 `3a1356366953bc24676bc3ed6ea84af2f2f6fb177ff1db9b5dfe00a24fb6f7ba`.
- `2026-11-09T20:31:13.638658+00:00` — `POST https://api.lumenloop.com/v1/tools/list_documents {"collection":"events","limit":1,"bogus_arg":"x"}` — HTTP 200; receipt ID `unknown-bogus_arg`; SHA256 `26c7f37e8fd8d7c66be53070d394d4fab27f74dc3e3a0bb83d45d62a6aeb1466`.
- `2026-11-09T20:31:13.596084+00:00` — `POST https://api.lumenloop.com/v1/tools/list_documents {"collection":"events","limit":1}` — HTTP 200; receipt ID `unknown-undefined`; SHA256 `26c7f37e8fd8d7c66be53070d394d4fab27f74dc3e3a0bb83d45d62a6aeb1466`.
- `2026-11-09T20:31:13.656468+00:00` — `POST https://api.lumenloop.com/v1/tools/search_directory {"query":"Blend","limit":1,"bogus_arg":"x"}` — HTTP 200; receipt ID `bogus-directory`; SHA256 `fa98a4121881fa01bff75ee8cea98b51920a39f2575c7ff72e43ae811f81255f`.
- `2026-11-09T20:31:13.995293+00:00` — `POST https://api.lumenloop.com/v1/tools/get_project {"slug":"blend","bogus_arg":"x"}` — HTTP 200; receipt ID `bogus-project`; SHA256 `c51f2a238833ae98598345ecea2080ca70f2fe12d485599a6c58b1babff3bf45`.
- `2026-11-09T20:31:22.209293+00:00` — `GET https://api.lumenloop.com/v1/tools/list_documents` — HTTP 200; receipt ID `schema-list_documents`; SHA256 `750a5f167be6dabd9b22ee953a77b18f04084396b4a970856110c00ec835271b`.
- `2026-11-09T20:31:22.793882+00:00` — `GET https://api.lumenloop.com/v1/tools/search_directory` — HTTP 200; receipt ID `schema-search_directory`; SHA256 `8a44b84023b6b3a0ac07c95e6fc8d51d0fde09ea3147fab2146a1ea4150df459`.

### ll-036

Finding: `improvements/lumenloop/ll-036-aquarius-proposal-injection-titles.md`. **still-repro** — Proposal search onerror still returns total7, ids192..198, each with literal HTML payload title and processed status. Fresh Aquarius source693..699 all HTTP404; control677 HTTP200. Soroswap and Tyler retrieval still surface these rows. No markup was rendered or exploit executed.

Action: Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet.

Upstream read `2026-11-09T20:31:53.540206+00:00`: https://github.com/lumenloop/lumenloop-backend/issues/50; state=open, updated=2026-11-02T23:24:05Z, comments=0. No comments. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:31:14.025333+00:00` — `POST https://api.lumenloop.com/v1/tools/list_documents {"collection":"proposals","search":"onerror","limit":20}` — HTTP 200; receipt ID `proposals`; SHA256 `375093f9d874161e218dbec060ba53770fbc18afb03d5c6364e1728ada1d6a86`.
- `2026-11-09T20:31:19.983562+00:00` — `GET https://governance-api.aqua.network/api/proposal/693/` — HTTP 404; receipt ID `public-aqua-693`; SHA256 `4e2ad487f8fba5bf7cd4f2de68c329f2e00abbd848710d5b435a78e30ae016ed`.
- `2026-11-09T20:31:19.983782+00:00` — `GET https://governance-api.aqua.network/api/proposal/694/` — HTTP 404; receipt ID `public-aqua-694`; SHA256 `4e2ad487f8fba5bf7cd4f2de68c329f2e00abbd848710d5b435a78e30ae016ed`.
- `2026-11-09T20:31:20.193759+00:00` — `GET https://governance-api.aqua.network/api/proposal/695/` — HTTP 404; receipt ID `public-aqua-695`; SHA256 `4e2ad487f8fba5bf7cd4f2de68c329f2e00abbd848710d5b435a78e30ae016ed`.
- `2026-11-09T20:31:20.274863+00:00` — `GET https://governance-api.aqua.network/api/proposal/696/` — HTTP 404; receipt ID `public-aqua-696`; SHA256 `4e2ad487f8fba5bf7cd4f2de68c329f2e00abbd848710d5b435a78e30ae016ed`.
- `2026-11-09T20:31:20.297319+00:00` — `GET https://governance-api.aqua.network/api/proposal/697/` — HTTP 404; receipt ID `public-aqua-697`; SHA256 `4e2ad487f8fba5bf7cd4f2de68c329f2e00abbd848710d5b435a78e30ae016ed`.
- `2026-11-09T20:31:20.337499+00:00` — `GET https://governance-api.aqua.network/api/proposal/698/` — HTTP 404; receipt ID `public-aqua-698`; SHA256 `4e2ad487f8fba5bf7cd4f2de68c329f2e00abbd848710d5b435a78e30ae016ed`.
- `2026-11-09T20:31:20.446477+00:00` — `GET https://governance-api.aqua.network/api/proposal/699/` — HTTP 404; receipt ID `public-aqua-699`; SHA256 `4e2ad487f8fba5bf7cd4f2de68c329f2e00abbd848710d5b435a78e30ae016ed`.
- `2026-11-09T20:31:20.519612+00:00` — `GET https://governance-api.aqua.network/api/proposal/677/` — HTTP 200; receipt ID `public-aqua-677`; SHA256 `32e63e3f4ed695d06b43e07a7188c718d8c6e7413ea2554d1041e7ba17e7a89f`.
- `2026-11-09T20:31:17.186850+00:00` — `POST https://api.lumenloop.com/v1/tools/find_content_about_project {"slug":"soroswap","limit":10}` — HTTP 200; receipt ID `soroswap-content`; SHA256 `a387063fd79e7963af091f8527a9c0d9baa483f8b7426820381307efe050b4cd`.
- `2026-11-09T20:31:07.666940+00:00` — `POST https://api.lumenloop.com/v1/tools/search_content_semantic {"query":"Tyler van der Hoeven","limit":10}` — HTTP 200; receipt ID `tyler`; SHA256 `d22c4815e19393a9167eae702ff6bef4a360a3867bba6a759de1fab036c0e491`.

### ll-037

Finding: `improvements/lumenloop/ll-037-related-projects-nonexistent-content-id-success.md`. **still-repro** — Unavailable article99999999 still returns HTTP200 success=true,data=[],error=null from related-project lookup; same ID get_document says no document. Valid article690/10190 controls return4/1 mentions in text-content objects. Preserve the same generic unavailable behavior for missing and unpublished content.

Action: Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet.

Upstream read `2026-11-09T20:31:54.257448+00:00`: https://github.com/lumenloop/lumenloop-backend/issues/51; state=open, updated=2026-11-02T23:24:10Z, comments=0. No comments. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:31:15.127990+00:00` — `POST https://api.lumenloop.com/v1/tools/get_related_projects {"content_type":"article","content_id":99999999}` — HTTP 200; receipt ID `related-number-99999999`; SHA256 `c5931569fd3e79acbc162d282209f915531a719e5547f12c9a728a33047d51c7`.
- `2026-11-09T20:30:57.677371+00:00` — `POST https://api.lumenloop.com/v1/tools/get_document {"collection":"articles","id":99999999}` — HTTP 200; receipt ID `doc-articles-99999999`; SHA256 `28de26fa5cc7343dd0acd7231fa9c5f59417f0f6715e35ec7bf0d9d9cbb73485`.
- `2026-11-09T20:31:15.754771+00:00` — `POST https://api.lumenloop.com/v1/tools/get_related_projects {"content_type":"article","content_id":690}` — HTTP 200; receipt ID `related-number-690`; SHA256 `8e353aa9801eb700c3b2776a6240c41f31cf2c2e14853f6766161a29399ba4bc`.
- `2026-11-09T20:31:15.369290+00:00` — `POST https://api.lumenloop.com/v1/tools/get_related_projects {"content_type":"article","content_id":10190}` — HTTP 200; receipt ID `related-number-10190`; SHA256 `ba2cdb36e1d50de9c563ab70dcd909c678f843d4ea6b018219d5fd90b8053396`.

### ll-038

Finding: `improvements/lumenloop/ll-038-xbull-record-stale-mobile-platforms.md`. **still-repro** — xBull API/YAML still advertise browsers, Android, iOS. Named Apple US listing is404 and lookup returns resultCount0; Play app.xbull.wallet and app.xbull.mobile both404. Operator xbull.app fails TLS through both urllib and curl today, so current operator links are not independently re-established. Store controls and stale record wording suffice for the scoped recurrence; no claim about installed client function or withdrawal date.

Action: Keep reported-upstream; record local recurrence; leave untouched upstream ref quiet.

Upstream read `2026-11-09T20:31:56.445754+00:00`: https://github.com/lumenloop/stellar-ecosystem-db/issues/15; state=open, updated=2026-11-02T23:24:15Z, comments=0. No comments. No owner claim/action to answer.

Live requests:
- `2026-11-09T20:31:05.223290+00:00` — `POST https://api.lumenloop.com/v1/tools/get_project {"slug":"xbull"}` — HTTP 200; receipt ID `project-xbull`; SHA256 `09fc574ce1d1d9149f875aecb064eef6f4c81bbc8c225fbbc7a4cf3a8aa34ec0`.
- `2026-11-09T20:31:24.157282+00:00` — `GET https://raw.githubusercontent.com/lumenloop/stellar-ecosystem-db/main/projects/xbull.yaml` — HTTP 200; receipt ID `public-yaml-xbull`; SHA256 `41c8386b5ad13a593f4d7f9abe7647f0eb387852a3d16e090d35b5c96af42524`.
- `2026-11-09T20:31:20.581278+00:00` — `GET https://apps.apple.com/us/app/xbull-wallet/id6705122563` — HTTP 404; receipt ID `public-apple`; SHA256 `120a307f868f3276b56dabfbd5f107d1b1426b6436a15fbc8d4311160881e416`.
- `2026-11-09T20:31:20.608947+00:00` — `GET https://itunes.apple.com/lookup?id=6705122563` — HTTP 200; receipt ID `public-apple-lookup`; SHA256 `7f5ce663b726607eae2fde2a6dc438052ac0d1681e636de7cc3377c0bb77e047`.
- `2026-11-09T20:31:20.726361+00:00` — `GET https://play.google.com/store/apps/details?id=app.xbull.wallet` — HTTP 404; receipt ID `public-android-wallet`; SHA256 `16b1df68d4e7ebd2ae384eaf9ad295e2ac1a4091544aa7a99974571feaaec4cf`.
- `2026-11-09T20:31:20.760810+00:00` — `GET https://play.google.com/store/apps/details?id=app.xbull.mobile` — HTTP 404; receipt ID `public-android-mobile`; SHA256 `1a9cd58de32e76cbd44bf6edbde3b6f9850d69a0bbbe90207eb9882093d97c7d`.
- `2026-11-09T20:31:27.736085+00:00` — `GET https://xbull.app/` — <urlopen error [SSL: TLSV1_ALERT_INTERNAL_ERROR] tlsv1 alert internal error (_ssl.c:1129)>; receipt ID `public-xbull`; SHA256 `not available`.

## Self-contained residual successor proposals

Checked maximum ll ID across active files and `improvements/resolved.json`: **ll-038**. Proposed next IDs below are within the reserved range. These are draft proposals, not files or new upstream filings: local dedup shows each residual is already covered by its current active finding and issue. Do not create duplicate active ownership or retire an open issue until a coordinator-approved successor handoff can link it. All three partial states were already documented on November 6; today does not establish a new deployment.

**ll-039 (would supersede ll-006): Specify semantic result date and ordering semantics.** Finding: bounded July6–10 semantic articles include undated9054, and neither effective date field nor final-ranking/freshness contract is exposed. Evidence: `ranking`, `ranking-control`, `jul-window` above. Recommendation: document date filtering and final order, support explicit chronology where promised, and separate unknown dates; test current/older recurring editions without insisting every broad query return a chosen report. This does not assert raw similarity is the final score or prescribe sorting implementation.

**ll-040 (would supersede ll-017): Add per-row named-person match provenance.** Finding: Tyler/Strupey weak-match warnings are aggregate; exact Tyler1487/625 coexist with semantic neighbors and AV passages lack exact-person relations. Evidence: `tyler`, `negative`, `av-Tyler van der Hoeven`. Recommendation: source-backed entity/lexical match flags and matched spans; retain warnings; offer exact-only filtering; do not infer identities from similarity.

**ll-041 (would supersede ll-020): Link the Zipper guide to correct post-vote state.** Finding: exact title retrieval of8084 remains pre-vote and unlinked although later research141 exists with a separately tracked wrong date. Evidence: `search-Zipper`, `doc-articles-8084`, `doc-research-141`, Horizon boundary. Recommendation: source-backed superseded-by/current-status relation to July8 activation; preserve historical guide. ll-015 separately owns correcting141.

## Edits, limitations, and coordinator handoff

Only the 37 owned finding files were edited: 30 dated still-repro recurrence entries, and dated evidence for the three partial and four inconclusive outcomes. Statuses are unchanged. No successor files, comments, commits, pushes, resolver/filer/index runs, golden edits, or `.agents/**` edits. No review or retirement is claimed.

Missing evidence/next concrete signal: ll-004 needs a deployed cause/scope explanation or a genuinely later independent observation because same-session success previously recurred before regressions. ll-022 needs an actual wrong/unqualified Lumenloop milestone response or owner scope decision. ll-023 needs an actual preview-boundary-dropping summary. ll-024 needs the stale source response or owner mapping of revisions. The coordinator owns any dated TODO because this lane was explicitly prohibited from editing `.agents/**`.

xBull operator-site recheck failed TLS in urllib and in `curl --retry 2 --max-time 30 -sS -L -o tmp/lumenloop-sweep/xbull-curl.html -w '%{http_code} %{url_effective}\n' https://xbull.app/` (curl35, HTTP000). Current store responses and API/YAML are independently captured. No current operator-link assertion is made.

Lint was already stale before this lane edited findings, while other lanes share the tree. Per the explicit brief, the author lane must not run improvements:index. The coordinator must regenerate it after reconciliation; recurrence counts will also require regeneration.

## Final required gate

Command: `npm run improvements:lint` (bare, no pipe). Exit code: 1; the only failure is the reserved shared index regeneration.

```text
> stellar-raven-codemode@0.1.0 improvements:lint
> node scripts/improvements-lint.mjs

improvements lint failed (1):
- improvements/INDEX.md is stale; run npm run improvements:index
```
