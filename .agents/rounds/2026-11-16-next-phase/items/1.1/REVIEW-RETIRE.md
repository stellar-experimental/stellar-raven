# Item 1.1 retirement review: sls-033 and sls-107

Reviewer: Claude Fable 5.2, high effort, `hc` terminal `t1r7`. Distinct from the author (Claude
Sonnet 5.5, executor) and from the lead (Claude Opus 5.5, `t1r5`). Tier: Claude Fable, as the plan
assigns. Read-only apart from this file. Nothing was posted. No model-graded step ran. Spend: USD 0.

## Part A

Worktree at `f44204cb`. All times are UTC on 2026-11-17. I worked from the finding files and the
upstream threads, not from the author's phase-1 notes. I did not open the wallets case or any
other QA case.

### Verdicts

| Finding | Verdict | Successor |
|---|---|---|
| sls-033 | **RETIRE** | none |
| sls-107 | **RETIRE WITH SUCCESSOR** | sls-119 (#1971, already filed, EURC) and a new **sls-120** (BRLT, to file before the resolve) |

**v4 gate, reviewer side: PASS.** The sls-033 trigger re-run shows the fix live.

sls-033 is still `reported-upstream` in the tree. The verdict assumes plan step 8 moves it to
`fixed-upstream` in the change that removes the cap.

### Deployment (both findings)

`GET https://stellarlight.xyz/api/openapi.json` at 00:13:37Z: `info.version` **1.9.150**.
`GET https://stellarlight.xyz/api/changelog` at 00:13:37Z: 396 entries, latest 2026-11-13.

| Entry | Says |
|---|---|
| `spec@1.9.150`, 2026-11-13, added | `availability` rows gain `sourceUrl`; names sls-033 and the nine facts |
| `spec@1.9.132`, 2026-11-11, fixed | every Wallet row carries `productKind` and dated availability or a dated `availabilityCheck` |
| `spec@1.9.131`, 2026-11-11, changed | every stablecoin row carries a sourced `assetType`; 22/2/2/1/3/7 over 37 rows |

The live spec describes `Project.availability[].sourceUrl`, `Stablecoin.company` (as the brand),
the five `issuerOfRecord*` fields and the `assetType` filter enum. The live responses below carry
the fields and the data, so both fixes are deployed, not only merged.

### sls-033

**Refs read.**

| Ref | State | Notes |
|---|---|---|
| stellarlight #519 | closed, completed, 2026-07-14, by the maintainer | 9 comments. Latest maintainer comment 2026-11-14T00:57Z (`#issuecomment-6868918068`): gap closed in #1967 and curate run 43536570473. Latest comment overall is ours, 2026-11-14T02:50Z (`#issuecomment-6870497519`) |
| stellarlight #742 | closed, completed, 2026-08-13, by the maintainer | Combined thread; its body lists the #519 wallet residual. No comment on it names sls-033 as resolved |
| PR #1967 | merged 2026-11-14T00:41:53Z, `0c2e5765` | adds `sourceUrl`; the resolving ref |
| PR #1945 | merged 2026-11-12T01:23:08Z | product kind and availability coverage (1.9.132) |
| PR #540 | merged 2026-07-14 | first partial fix (1.7.23) |
| raven #429 | open | inbound handoff from the maintainer; one comment, ours, 2026-11-14T02:50Z |

Comment authors checked: `theboycoder` is the Stellar-Light maintainer; `kalepail` is Raven. No
maintainer question is waiting on Raven in any of these threads.

**Trigger re-run.**
`curl -sS --compressed 'https://stellarlight.xyz/api/projects/search?type=Wallet&limit=200'`

- 00:13:54Z: HTTP 200 headers, then the body stalled at 94,208 bytes. I stopped it after two
  minutes.
- 00:16:05Z: retry, HTTP 200 in 0.2 s. Body `meta.generatedAt` 2026-11-17T00:13:55.186Z.
  SHA-256 of the decoded body: `6afd731cbaef04f2675a3e2832a61862c3a3b183f9f105e08f239ce3e39b6827`.

| Check | Result |
|---|---|
| Rows, `counts.total`, distinct names, distinct slugs | 74, 74, 74, 74 |
| Rows with null `productKind` | 0 (56 end-user-wallet, 7 hardware-wallet, 6 wallet-sdk, 4 smart-account-tooling, 1 integration-kit) |
| Rows with platform facts / with only a dated `availabilityCheck` / with neither | 64 / 10 / 0 |
| Platform facts | 123 (113 available, 10 unavailable) |
| Facts with no `sourceUrl` | **0 of 123** (all `https`) |
| Facts with no `checkedAt` | 0 of 123 (range 2026-07-14 to 2026-11-13) |
| Unavailable facts with no URL | **0 of 10** (7 have `storeUrl` null and a `sourceUrl`; Cypher's 3 have both) |
| `availabilityCheck` results | 9 none-found, 1 could-not-check, each with sources and a note |

The ten unavailable facts are xbull (2), scopuly (1), lumexo (1),
openzeppelin-stellar-privacy-wallet (1), interstellar (2) and cypher (3), as the handoff lists.

**Spot fetches**, 00:16:46Z to 00:16:49Z, `curl -sS -L` from this machine. Eleven URLs, six of
them not in the author's 2026-11-14 set.

| Row | `sourceUrl` | Fetch | Row note says | Agrees |
|---|---|---|---|---|
| scopuly ios | `apps.apple.com/app/scopuly-stellar-defi-wallet/id1383402218` | 404; Apple lookup by id: 0 results | 404, lookup empty | yes |
| interstellar ios | `itunes.apple.com/us/app/interstellar-stellar-wallet/id1437679072` | 1 redirect to `apps.apple.com`, then 404; lookup: 0 results | redirects, then 404 | yes |
| interstellar android | `play.google.com/store/apps/details?id=cm.fintech.interstellar` | 404 | 404 | yes |
| lumexo ios | `lumexo.io/` | 200; "Coming Soon" beside "App Store"; a Google Play link to `io.lumexo.wallet` | App Store button "Coming Soon", working Google Play button | yes |
| lumexo android (available) | `play.google.com/store/apps/details?id=io.lumexo.wallet` | 200; "Lumexo - Stellar Wallet", Lumexo TECH, updated Nov 5, 2026 | same title, developer and date | yes |
| empowch android (available) | `play.google.com/store/apps/developer?id=Bankey+LLC` | 200; lists `com.app.bankey.Shaheen`, "Shaheen money" | developer page lists the renamed app | yes |
| empowch android `storeUrl` | `play.google.com/store/apps/details?id=com.app.bankey.Shaheen` | 200; "Shaheen money", Bankey LLC, a contact at `empowch.com` | same | yes |
| cypher ios/android | `cypherhq.io/notice-of-termination` | 200; "Notice of Termination of Services", "services end September 6, 2026" | operator says the app ended 2026-09-06 | yes |
| openzeppelin privacy wallet web | `privacywallet.coderipper.xyz/` | 404, body "Application not found" | 404, "Application not found" | yes |
| xbull ios | `apps.apple.com/us/app/xbull-wallet/id6705122563` | 404; lookup: 0 results | 404, lookup empty | yes |
| xbull android | `play.google.com/store/apps/details?id=app.xbull.mobile` | 404 | 404 | yes |

**Original-scope regressions.** One `stellar-passport` row (the duplicate-slug case is gone).
StellarTerm is typed `DEX` in the `q=wallet` sweep and is not in the Wallet set.

**Adjacent scan.** None of these is a residual of sls-033.

| Observation | Class | Why |
|---|---|---|
| `limit=200` is clamped: `meta.filters.limit` is 100 | not a residual | 74 rows fit. A receipt should assert `returned == total`, not rely on the 200 |
| 4 slugs carry two facts for one platform (airgap, metamask, scopuly, unstoppable-wallet) | not a residual | Each pair or triple is a distinct store listing (Chrome, Edge and Firefox; Google Play and F-Droid; two AirGap apps) |
| 11 available facts have `note` null and `checkedAt` 2026-07-14/15 | not a residual | Each has `sourceUrl`, `storeUrl` and a date. The request was URL, date and state |
| mxlet is now `hardware-wallet` with a none-found check | not a residual | The note cites the firmware repo. The finding asked to keep it unknown only without evidence |
| 5 of 67 `Live` rows have an `availabilityCheck` that says the operator's domain or handle is gone (spatium, freelii, bebop) or the product left Stellar (sentit, elsa) | not a residual; a separate finding candidate | sls-033 asked for availability facts beside the lifecycle label, and got them. The rows describe themselves: `statusConfidence` is low or medium and `statusAsOf` is 89 to 91 days old. The lifecycle label disagreeing with the row's own check is a different defect. It is outside item 1.1; I did not verify it to the filing bar |
| `q=wallet` paged at `offset=0,100` returned 196 rows for `total` 195; `coca` is on both pages | not a residual; one unrepeated observation | The Wallet enumeration is one page. I did not repeat the read, so this is not verified |

**Verdict: RETIRE.** Every part of the recommendation is live, the remaining gap from 2026-11-12
is closed, and no residual needs a successor.

### sls-107

**Refs read.**

| Ref | State | Notes |
|---|---|---|
| stellarlight #1900 | closed, completed, 2026-11-05, by the maintainer | 3 comments. Latest maintainer comment 2026-11-12T16:04Z (`#issuecomment-6828789954`): fixed by #1944, issuer write on at 2026-11-12T14:52Z. Latest overall is ours, 2026-11-14T02:50Z (`#issuecomment-6870496953`) |
| PR #1944 | merged 2026-11-12T01:00:11Z, `fde10ff4` | the resolving ref: sourced classes, sourced and dated issuer of record |
| PR #1923 | merged 2026-11-05T16:11:52Z | schema and filter (1.9.121); `Fixes #1900` |
| stellarlight #1971 | open, no comments | sls-119, EURC. Its body cites sls-107 |
| raven #425 | open | inbound handoff; one comment, ours, 2026-11-14T02:50Z |

Our 2026-11-14 comment on #1900 ends with a BRLT line: "A dated `could-not-read` value would tell
a caller that the read was tried." No maintainer has replied. #1900 is closed, so nothing tracks
that request.

**Trigger re-run**, 00:18:00Z to 00:18:02Z.

```sh
curl -sS --compressed 'https://stellarlight.xyz/api/stablecoins'
curl -sS --compressed 'https://stellarlight.xyz/api/stablecoins?limit=100'
curl -sS --compressed 'https://stellarlight.xyz/api/stablecoins?assetType=Fiat-Backed'
curl -sS -L https://audd.digital/.well-known/stellar.toml
curl -sS -L https://currency.one/.well-known/stellar.toml
curl -sS -L https://mgusd.moneygram.com/.well-known/stellar.toml
```

All six answered 200. List `meta.dataAsOf` 2026-11-16T22:21:02.095Z, 37 rows; `limit=100`
returns the same 37 rows. List body SHA-256
`ae1efdbcc9d23578829678d439084a73a330d82b7d98b9a1963f3048806f74a9`.

| Handoff check | Live result | Same-minute toml |
|---|---|---|
| AUDD: `company` "Novatti Group", `issuerOfRecord` "AUDC PTY LTD" | yes; check `named`, source `audd.digital` toml, as of 2026-11-16T22:18:49Z | `ORG_NAME="AUDC PTY LTD"`, AUDD issuer `GDC7…2EEU`. SHA-256 `76bc56ee…32c936`, the same bytes as on 2026-11-03 |
| Every C1 row: "Kinesis Money Panama S.A." | yes, all 8 rows, 8 distinct issuers, each `named` | `ORG_NAME="Kinesis Money Panama S.A."`, all 8 codes listed. SHA-256 `3576ef6f…0ca392`, unchanged since 2026-11-03 |
| MGUSD: note names Bridge | yes; `issuerOfRecord` "MoneyGram Payment Systems, Inc.", note quotes the toml `desc` | `ORG_NAME="MoneyGram Payment Systems, Inc."`; `desc="USD-backed stablecoin issued by Bridge on behalf of MoneyGram"` |
| No row has a null `assetType` | 0 of 37 (22 Fiat-Backed, 3 Yield Stablecoin, 7 Unclassified, 2 Crypto-Backed, 2 Multi-Asset-Backed, 1 Treasury-Backed) | n/a |
| `?assetType=Fiat-Backed` returns no yield product | 22 rows, all Fiat-Backed; no USDY, YLDS or USDM | n/a |

More checks on the same responses:

- 35 rows are `named`; all 35 carry `issuerOfRecord`, `issuerOfRecordSourceUrl` and
  `issuerOfRecordAsOf`. No row without a `named` check carries an issuer.
- `issuerOfRecordAsOf` runs from 2026-11-16T22:18:30Z to 22:21:02Z on every checked row, so the
  six-hourly writer is running.
- The original filter trigger, `?assetType=Yield%20Stablecoin`, returned HTTP 400 on 2026-11-02.
  At 00:18:45Z it returns 200 with USDY, YLDS and USDM. `?assetType=Bogus` returns 400 and lists
  the valid classes.
- The 7 Unclassified rows have `assetTypeSourceUrl` null. Each has `assetTypeAsOf` 2026-11-11 and
  a note that says what was read. That matches the spec text for the class.

**Residual decisions.**

**EURC: carried by sls-119.** The Circle EURC row still serves "Circle Internet Financial, LLC".
#1971 is open and cites sls-107. Nothing more to file.

**USDT0: not a residual.** Checked at 00:18:59Z:

- Horizon account `GATISXX6…HN6Q`: `home_domain` null (last modified 2026-07-26).
- `https://usdt0.to/.well-known/stellar.toml`: 200, `ORG_NAME = "Everdawn Labs Limited"`, lists
  the account in `ACCOUNTS` and as the USDT0 issuer.

The row serves `issuerOfRecordCheck` `not-named`, a dated `issuerOfRecordAsOf`, and a note that
names Everdawn Labs Limited and says the link is not confirmed from the account side. That is
accurate and it is the spec's stated rule (both sides of the SEP-1 link must agree). A caller gets
the candidate entity, the reason and a date. The row does not present the brand as the issuer.

**BRLT: a residual that needs a successor, sls-120.** Checked at 00:18:59Z to 00:19:02Z:

- Horizon account `GCHQ3F2B…PRSO`: `home_domain` is `sep.stablex.cloud`. The asset has 468
  trustlines and about 2,515 BRLT authorized (about USD 500).
- `sep.stablex.cloud` is NXDOMAIN at dns.google, at cloudflare-dns.com and at the local resolver,
  for A, AAAA and CNAME. The apex `stablex.cloud` is NXDOMAIN too. The toml fetch fails to
  resolve.
- So the reported cause is true, and the null check follows the spec: a read that cannot be made
  changes nothing, and null means never read.
- **New evidence.** `https://pubnet-sep.latamex.com/.well-known/stellar.toml` answers 200 (SHA-256
  `d39046c1…0694ca`). It has `ORG_NAME="Relay Tech Services Ltd"`. It lists the BRLT account in
  `ACCOUNTS` and has a `[[CURRENCIES]]` entry `code="BRLT"` with that issuer. Scout already reads
  this toml every six hours: it is the source of the ARST row's `issuerOfRecord`, under the same
  brand, "Settle Network".

Why it is a residual and not only a design note:

1. The BRLT row is the one row of 37 where a caller gets nothing from the issuer-of-record fields:
   all five are null. The fields cannot tell "tried and unreadable" from "never tried". Only the
   free-text `note` says the read failed, and its date (2026-11-11) is fixed prose.
2. BRLT and USDT0 are the same case: a readable toml lists the account, and the account does not
   point back to it. USDT0's row records that and names the entity. BRLT's row does not, and its
   note says the listing "cannot be checked".
3. The only upstream trace of this is our line on the closed #1900, with no reply. The skill sends
   a gap that a closed thread no longer tracks to a successor finding.

It does not reproduce the original trigger. The row does not give a brand as the issuer, and no
toml qualifies under the two-sided rule. So it must not stay in sls-107; it is a successor.

What **sls-120** would state:

- **Title.** BRLT stablecoin row leaves every issuer-of-record field null, though a toml Scout
  already reads lists the account.
- **Finding.** `GET /api/stablecoins` serves BRLT (`GCHQ3F2B…PRSO`, brand "Settle Network") with
  `issuerOfRecord`, `issuerOfRecordCheck`, `issuerOfRecordSourceUrl`, `issuerOfRecordAsOf` and
  `issuerOfRecordNote` all null. The account's `home_domain`, `sep.stablex.cloud`, does not
  resolve. The toml at `pubnet-sep.latamex.com` names "Relay Tech Services Ltd", lists this
  account, and has a BRLT currency entry. The USDT0 row records the same one-sided link as
  `not-named` with a note; the BRLT row records nothing.
- **Evidence.** The four reads above with their times, plus the ARST row
  (`issuerOfRecordSourceUrl` is the latamex toml).
- **Recommendation.** Smallest correction: give BRLT an `issuerOfRecordNote` that names the
  latamex toml and "Relay Tech Services Ltd", unconfirmed from the account side, as USDT0 has.
  Second: serve a dated state for a read that was tried and could not be made, so null means only
  "never tried". Keep `issuerOfRecord` null while the link is one-sided.
- **Severity.** Low. One row, about USD 500 of supply.

I did not read the toml's `attestation_of_reserve` PDF: `anchors.relay.vision` returned a 308 and
then timed out. sls-120 should not cite it.

**Adjacent scan, other rows.** I compared `company` with `issuerOfRecord` on all 35 named rows.
Where they differ, the value is the toml organization, as designed (EURS "STSS (Malta) Limited",
ARST "Relay Tech Services Ltd", USDZ and ZARZ "ZEAM LIMITED" with a note that quotes the toml
`desc`). I did not check any row other than the handoff's three against an issuer's legal terms.
sls-119 records that same limit for USDC. Supply and holder figures are `unmeasured` on 36 rows
(stellar.expert answers 402); the handoff states it and sls-107 does not cover it.

**Verdict: RETIRE WITH SUCCESSOR.** The trigger and all five recommendations are live. Retire
after:

1. sls-120 is filed through `improvements:file` (next free id confirmed: active maximum sls-119,
   ledger maximum sls-115).
2. `--live-recheck` names sls-119 (#1971) and sls-120 with its issue URL.
3. The resolution comment on #1900 carries both successor links. #1900 is closed, and the skill
   keeps a partly fixed record until its ref carries the successor link.

### For the lead

- The v4 gate passes on my side.
- sls-120 changes plan step 13 only as the plan already allows.
- The `Live`-label observation and the `q=wallet` paging observation are outside this item. I
  recommend a dated `.agents/TODO.md` line for the next Scout sweep, not a filing from this item.
- Raw responses are in my session scratchpad and are not committed. The hashes above identify
  them.

## Part B

Reviewed on the pushed branch at `a027be08` (local `HEAD` equals `origin`; `gh api …/commits/a027be08`
answers). Times are UTC on 2026-11-17, 00:27Z to 00:35Z. I opened `q-tool-wallets-comparison` and
`q-scf-resolve-passport-superseded-slug`, and no other QA case. I read nothing under `~/backups`.

### Verdict

**PASS WITH FIXES.** The part A verdicts stand. No judge-facing text changed, and the passport
repoint is correct. Two fixes are needed before step 13, and one part of the edit should be
reverted in my reading.

| # | Finding | Action |
|---|---|---|
| B1 | `truth.notes` says the judge-facing text "never carried" a cap. That is false | **Fix** before step 13 |
| B2 | The sls-033 evidence entry says a golden partial cap "is removed in the same change" | **Fix** before the resolve dry run |
| B3 | `truth.verified` on the wallets case was replaced for an edit that changed no gospel | **Revert that hunk** (recommended); if kept, record the two costs below |
| B4 | The receipt that two fields point to does not exist yet | Confirm after step 13 |
| B5 | Phase 3 still owes the TODO bullets, the intake override and the sls-119 reword | Confirm after step 14 |

### The wallets-case edit

**Independent checks that pass.**

- Parsed diff of the compiled files against `origin/main`, with `caseInputSha256` from
  `eval/qa/paired-verdict.mjs`:
  - `cases.json`: 247 cases; only `corpusContentSha256` and this case's `truth.verified` and
    `truth.notes` changed. `caseInputSha256` is the **same**.
  - `tool-cases.json`: 6 cases; only `corpusContentSha256` and the passport case's
    `truth.corroboration` changed. `caseInputSha256` is the same.
  - `sample.json`: only `corpusContentSha256`. `lifecycle-registry.json`: two
    `caseContentSha256` values.
- `question`, `tags`, every `golden.*` field, `truth.asOf` and `truth.reverifyBy` are unchanged.
- `golden.notes` holds no cap. Its sentence "Quoting Scout's wallet type metadata as attributed is
  not a wrong claim" matches no cap pattern in `lintCapFindings` (no "at partial", and no
  canonical, official or upstream wording), so the `cap-finding` lint has nothing to check.
- The live Wallet data does not contradict a judge-facing fact. `freighter` is named "Varial",
  an end-user wallet. `ledger` and `trezor` are `hardware-wallet`. `walletconnect` is typed
  `Infrastructure` and is not in the Wallet set.
- No other battery case names sls-033: `grep -rl sls-033 eval/qa/corpus` prints these two files
  only. That check reads no case content, so it covers the 49 cases the sibling sweep left
  unopened.
- The sentence left in `golden.notes` is still true and needs no change. A judge-facing edit
  would change `caseInputSha256` for no gain in truth.

**B1. "Never" is false.** The new `truth.notes` says "no grading cap applies; the judge-facing
text never carried one". `git log` on the case file shows otherwise:

| Commit | Date | `golden.notes` has the cap sentence | `truth.notes` has it |
|---|---|---|---|
| `c2428488` (#73) | 2026-08-27 | yes | no |
| `35c90ecf`, `9b039b96`, `049fb747` (#319) | 2026-08-29 to 2026-11-02 | yes | no |
| `5e6496ce` (#436) | 2026-11-14 | no | yes |

So the judge saw "grade caps at partial … while sls-033 stands" from 2026-08-27 until the battery
rebuild of 2026-11-14 moved it to the judge-blind notes. The accurate wording is: "the
judge-facing text has carried no cap since 2026-11-14 (#436)". The same claim is in `EXEC.md`
step 9 ("was never capped in its judge-facing text") and in the lead decision in
`briefs/exec.md`. Correct the case and `EXEC.md`; the brief is a dated instruction and can stay.
The fix changes `caseContentSha256`, so it needs `eval:qa:compile` and `eval:qa:register` again.
It does not change `caseInputSha256`.

This does not change the v4 outcome. v4 is still needed: the executor and I opened the case, and
the committed `EXEC.md` quotes its `golden.notes`.

**B3. `truth.verified` should go back to the 2026-11-14 record.** Reasons:

1. No gospel changed. The lint asks for a new `truth.verified` only with a judge-facing change.
   The passport case had the same kind of judge-blind edit and kept its record.
2. The new block verifies none of the case's key facts. Its evidence is the Scout re-check, three
   store fetches and PR #1967. The record it replaced held the dated A and B quotes for the Varial
   rename and the Wallets Kit modules. The skill calls `truth.verified` the latest verification
   event; for this case's gospel that is still the 2026-11-14 audit. `truth.asOf` still says
   2026-11-14, so the block now carries two different dates for one case.
3. The date has a side effect. The case is `scheduled`. `goldenTimeConsistency` in
   `eval/qa/re-judge.mjs` refuses a re-judge when `truth.verified.date` is later than the stored
   run's `finishedAt`, unless `--allow-golden-drift` is passed; `gateway-rejudge.mjs` throws on the
   same test. A run that finished before 2026-11-17 and is re-judged against the worktree cases
   now fails that guard on this case, though the judge input is byte-identical. `EXEC.md` says "no
   re-judge needed" and does not mention this.
4. `rootCause` names a receipt that does not exist at `a027be08` (see B4).

The sls-033 provenance is already in `truth.notes`, which is where the skill puts provenance. If
you want the pointer, add "(receipt: improvements/resolved.json, sls-033)" to that paragraph.

If the lead keeps the new block, record in `EXEC.md` that the 2026-11-14 audit evidence left the
case (it remains in corroboration rows 4 and 5 and in the audit round files) and that pre-2026-11-17
runs need `--allow-golden-drift` for this case.

### The passport repoint

Correct. `truth.corroboration[1].evidence[2].ref` now reads
`improvements/resolved.json (sls-033 receipt)`. Nothing else in the case changed, and the edit is
judge-blind. The row is one of three under a claim that also has class A and class B evidence, so
the claim does not rest on it. The spelling matches the `symmetric-caution` exemption, which
accepts only the bare path.

One live read, 00:29:13Z: `GET https://stellarlight.xyz/api/projects/resolve?q=passport` returns
`matchedOn` slug, `superseded` true, subject `passport` Draft, current `stellar-passport` Live. The
golden still holds, and it agrees with part A: the Wallet set has one `stellar-passport` row.

Owed in step 13, as planned: put the receipt's commit-pinned `sourceUrl` in that row's `note`. The
pinned snapshot is what keeps the "duplicate-name Stellar Passport records" evidence line readable
after the file is deleted.

### B2. The sls-033 finding file

Status `fixed-upstream` and the new first evidence entry match my part A numbers. One sentence in
that entry is wrong: "The golden partial cap that named this finding is removed in the same change
(ADR-0008)." No judge-facing cap existed in this change; a judge-blind `truth.notes` sentence was
rewritten. Reword it before the resolve dry run, because the receipt pins this file. Suggested:
"The judge-blind truth.notes sentence that named this finding is rewritten in the same change; the
case has carried no judge-facing cap since 2026-11-14."

Not blocking: the `## Finding` body still describes the 2026-11-06 state (72 rows, 10 null
`productKind`). The file is deleted on resolve and the evidence list is current, so I would leave
it.

### B4. The receipt

`improvements/resolved.json` has no sls-033 entry at `a027be08`. The wallets case `rootCause` (if
kept) and the passport `ref` both name it. That is the planned order, but it means the branch must
not merge unless step 13 completes for sls-033. Check at the end:
`jq '.entries[] | select(.id == "sls-033")' improvements/resolved.json` returns one entry whose
`sourceUrl` resolves.

### Reference reconciliation

Command, run for each id: `grep -rIn --exclude-dir=.git --exclude-dir=node_modules -e <id> .`
(`rg` is a shell function in this environment). I also searched for other spellings of both ids
and found none.

**sls-033: 51 files.**

| Where | Hits | Class | State at `a027be08` |
|---|---|---|---|
| `eval/qa/corpus/…/q-tool-wallets-comparison.json`, `eval/qa/cases.json` | 2 + 2 | golden | Reconciled, subject to B1 and B3 |
| `eval/qa/corpus/…/q-scf-resolve-passport-superseded-slug.json`, `eval/qa/tool-cases.json` | 1 + 1 | golden | Reconciled; the note gains the `sourceUrl` in step 13 |
| `improvements/stellar-light-scout/sls-033-…md` | 3 | finding | B2; deleted by the resolver |
| `improvements/intake.json` | 1 | intake | Per-finding override; **open**, the resolver removes it |
| `improvements/INDEX.md` | 1 | generated | Shows `fixed-upstream`; regenerated on resolve |
| `improvements/resolved.json` | 1 | ledger | Inside the sls-036 receipt's review text; history, unchanged |
| `improvements/lumenloop/ll-038-…md` | 1 | dated dedupe evidence | Names the id with no path; still true; unchanged |
| `.agents/TODO.md` | 2 | TODO | **Open and now stale**: says the finding "stays `reported-upstream`" and tells the reader to remove a cap. Step 14 deletes the bullet |
| `inventory/stellar-light.json` | 2 | upstream text | The 1.9.150 changelog and a `matchMode` description quote the id; generated; unchanged. Not in `catalog/` or `src/` |
| `.agents/rounds/2026-11-16-next-phase/PLAN.md`, `items/0.2`, `items/0.4`, `items/1.1/*` | 71 across 12 files, counted before part B was added | current round records | Dated records. The round `PLAN.md` line 149 says "remove the cap in the two cases that name it"; leave it, and let the ledger row state what was found |
| `.agents/rounds/` before 2026-11-16 | 31 across 20 files | dated records | History, unchanged |
| `research/audits/*`, `research/qa-deep-dive-2026-08-25/*` | 38 across 8 files | dated evidence | History, unchanged |

**sls-107: 34 files.**

| Where | Hits | Class | State at `a027be08` |
|---|---|---|---|
| `improvements/stellar-light-scout/sls-107-…md` | 1 | finding | `fixed-upstream`; deleted by the resolver |
| `improvements/stellar-light-scout/sls-119-…md` | 1 | successor | Line 13 says "sls-107 (fixed-upstream, …)". **Open**: step 13 rewords it to the receipt |
| `improvements/INDEX.md` | 1 | generated | Regenerated on resolve |
| `.agents/TODO.md` | 1 | TODO | **Open**: step 14 deletes the bullet |
| `.agents/rounds/2026-11-16-next-phase/*` | 39 across 10 files, counted before part B was added | current round records | Dated records |
| `.agents/rounds/` before 2026-11-16 | 20 across 12 files | dated records | History, unchanged |
| `research/audits/*` | 34 across 8 files | dated evidence | History, unchanged |

sls-107 has no hit in `eval/`, `src/`, `docs/`, `catalog/`, `improvements/intake.json` or
`inventory/`. No golden, register or intake entry names it, so nothing there needs a change.

The branch diff touches no dated record outside `items/1.1/`.

### B5. Owed in phase 3, to confirm before merge

- sls-120 is filed, and its issue URL and #1971 are in sls-107's `--live-recheck` and in the
  comment on #1900.
- The two TODO bullets are gone, and the Scout-sweep line from part A is added.
- `improvements/intake.json` has no `sls-033` key.
- sls-119 line 13 points to the sls-107 receipt.
- `improvements:lint -- --live` passes after the two files are deleted.

None of these needs another pass from me. B1 and B2 are wording fixes. B3 is the lead's decision.
