# Item 1.1 execution record

Executor: Claude Sonnet 5.5, high, in `/home/tyler/code/raven-wt/np-1.1` on
`np/1.1-drain-upstream-handoffs`. Base `f44204cb`. Nothing is committed yet: step 12 commits phases
1 and 2 together.

## Phase 1 (plan steps 1 to 6): done, stopped at the boundary

Nobody opened `q-tool-wallets-comparison`, its battery file or its row in `cases.json`. No v4 file
exists. Every read was keyless and public. No model call ran and no paid call was made.

### Step 1: split code

- `eval/qa/split-amend.mjs`: new pure `moveToTuning({ split, movedId, allowedFrom, countsBefore,
  caseIds, note })`.
  - Check order: `splitShape`, `moveCountsBefore`, `partition` (disjoint, sum of `countsBefore`
    ids), `moveNotAllowed` (the id is in exactly one set, that set is in `allowedFrom`, and it is
    not tuning). After the move: `moveCountsAfter` (tuning +1, source set -1), `samePartition`,
    `notACase`.
  - Three new fixed lines (`moveCountsBefore`, `moveNotAllowed`, `moveCountsAfter`). They carry no
    data and no digits. The existing D2 lines keep their text.
  - `amendSplit` is a thin wrapper: `allowedFrom: ["heldOut"]`, D2's constants, and the three new
    checks mapped back to D2's `countsBefore`, `notHeldOut` and `countsAfter`.
- `test/split-amend.test.mjs`: D2's 15 tests pass unchanged. 13 new tests cover a move from
  `heldOut`, a move from `reserve`, an id already in tuning, an absent id, a disallowed source set,
  an id in two sets (fails `partition` first, by the check order), an empty `allowedFrom`, an id
  that is not a case, the three pre-id checks, an untouched input, and digit-free new lines.
  `split-amend.test.mjs`: 28 passed.
- `eval/qa/tuning-rows.mjs`: `TUNING_ROW_COUNT` 80 to 81. Every scan and test reads this one
  constant, so they pass. Any scan run against the v3 split now fails its count assertion until v4
  is used; that is intended, but see "For the lead".
- Runner `items/1.1/amend-split.mjs`: checks v3's full SHA-256 and refuses to overwrite v4. It
  passes `countsBefore` {80, 118, 49} and `allowedFrom: ["heldOut", "reserve"]`. It writes
  `~/backups/gca-2026-11-14-split-v4.json` with mode 600 and appends the planned note. It prints
  only the three counts and a SHA-256, or one fixed failure line.
- `--dry-run` result (only mode run):
  - `counts: tuning 81, heldOut 117, reserve 49`
  - would-be v4 SHA-256: `58ad28bb903fcd7c72122de4ca13f93438a42b92a6987dcbce7d6c3f8096c191`
  - `~/backups/gca-2026-11-14-split-v4.json` does not exist (checked by `ls` of that one path).

### Step 2: sls-033 live re-check (PASS)

`GET https://stellarlight.xyz/api/projects/search?type=Wallet&limit=200` at
2026-11-17T00:16:06Z (`meta.generatedAt`), Scout OpenAPI 1.9.150 (`/api/status` 00:17:56Z):

| Measure | 2026-11-17 | 2026-11-14 finding |
|---|---|---|
| rows / distinct names | 74 / 74 | 74 / 74 |
| null `productKind` | 0 | 0 |
| rows with platform facts / facts | 64 / 123 | 64 / 123 |
| `state` available / unavailable | 113 / 10 | 113 / 10 |
| facts without `sourceUrl` | 0 | 0 |
| unavailable facts without `sourceUrl` | 0 | 0 |
| facts without `checkedAt` | 0 | 0 |
| rows with `availabilityCheck` | 10 | 10 |

Spot fetches at 00:17:22Z, all `404` as the row says (`unavailable`): xBull Android
`https://play.google.com/store/apps/details?id=app.xbull.mobile`, Scopuly iOS
`https://apps.apple.com/app/scopuly-stellar-defi-wallet/id1383402218`, and the OpenZeppelin privacy
wallet `https://privacywallet.coderipper.xyz/`. The finding file is not edited, per plan.

The two other conditions of the gate before v4 (reviewer part A) are the lead's.

### Step 3: sls-116 (all three items still reproduce)

Live 2026-11-17T00:17Z to 00:18Z, 1.9.150:

1. `GET /api/projects/search?scfAwarded=true&limit=100` at offsets 0 to 700: 711 distinct rows of
   total 711. None names `soroban-contract-source-verification-service-bax`. The official page
   still answers 200 with `lastAwardedRound` 44.
2. No public endpoint serves the 27-award baseline: the 1.9.150 OpenAPI path list has no
   round-count operation, and the search meta has no per-round check. `/api/status` holds no round
   counts. **Limit:** the `/api/quality` read timed out at 60 s with 90 KB read; that part is
   partial.
3. `peer`: rounds [22, 26], 145000 USD, null `scfSourceUrl` and `scfAsOf`. It is the only one of
   the 711 rows with a null source or date.

`#1952` has 2 comments (the owner's 2026-11-13 and ours of 2026-11-14) and no reply since. No post
there: nothing changed. Dated recurrence added to `sls-116`; status unchanged.

**Draft #427 reply** (ASD style; the lead or step 15 posts it, not yet posted):

> Raven re-ran the three open items for sls-116 on 2026-11-17, between 00:17Z and 00:18Z, against
> Scout 1.9.150. All three still reproduce. Stellar-Light/stellarlight#1952 has no maintainer reply
> since 2026-11-13.
>
> 1. `GET /api/projects/search?scfAwarded=true` returns 711 rows. No row cites
>    `soroban-contract-source-verification-service-bax`. The official page still shows
>    `lastAwardedRound` 44.
> 2. No public endpoint serves the 27-award baseline. The 1.9.150 OpenAPI lists no round-count
>    operation.
> 3. `peer` still has rounds `[22, 26]`, 145,000 USD, and null `scfSourceUrl` and `scfAsOf`.
>
> Raven keeps sls-116 open. This issue stays open for the same reason. Raven posts nothing more on
> #1952 until one of the three items changes.

### Step 4: the nine findings from 2026-11-14, and sd-081

`npm run improvements:probes -- --service stellar-docs --service stellar-light-scout`
(reports only; the tree stayed clean): **7 recurring, 0 fixed-candidate, 0 inconclusive, 0 errors.**

| Finding | Re-run | Upstream ref now | Class | Action |
|---|---|---|---|---|
| sd-105 | probe: recurring | #3143 open; fix PR #3147 open, not merged | still reproduces | dated recurrence |
| sd-106 | probe: recurring | #3144 open; fix PR #3148 open | still reproduces | dated recurrence |
| sd-107 | probe: recurring | #3145 open; fix PR #3149 open | still reproduces | dated recurrence |
| sd-108 | `gh search code` for "blind signing" and "unsolicited": 0 results each (control "Friendbot" returns pages) | #3146 open; "Decision needed" is for Docs maintainers; a wallet developer replied to the bot | still reproduces | dated recurrence |
| sd-109 | probe: recurring | #3150 open; fix PR #3152 open | still reproduces | dated recurrence |
| sd-110 | probe: recurring | #3151 open; fix PR #3153 open; later comments are unrelated account requests | still reproduces | dated recurrence |
| sls-117 | probe: recurring | stellarlight#1969 open, 0 comments | still reproduces | dated recurrence |
| sls-118 | probe: recurring | stellarlight#1970 open, 0 comments | still reproduces | dated recurrence |
| sls-119 | EURC row still `issuerOfRecord` "Circle Internet Financial, LLC", check `named` (`dataAsOf` 2026-11-16T22:20:13Z) | stellarlight#1971 open, 0 comments | still reproduces | dated recurrence |
| sd-081 | see below | #2562 open, no reply after Raven's 2026-11-06 comment | **partly fixed** | dated evidence; status unchanged |

No thread asks Raven a question, so **no upstream reply was posted**, as the plan expects.

**sd-081 (differs from the plan's expectation).** The `-js` paths answer **307** (the review said
308) to the unsuffixed pages, and all four pages answer 200. PR
[#3083](https://github.com/stellar/stellar-docs/pull/3083) (merged 2026-11-10, "Port JS snippets
to stellar-sdk v17 XDR property access") rewrote the contract-restoration example, so most of the
finding is fixed live:

- Both JavaScript restoration fences (`restore-contract`, and the second JS fence of
  `state-archival`) now parse (esbuild TS loader). The function is
  `getWasmLedgerKey(data: xdr.LedgerEntryData): xdr.LedgerKey`, and the caller reads
  `entries[0].val` of `getLedgerEntries(instance)`.
- With `@stellar/stellar-sdk` 17.4.0 installed in a scratch directory, the `restore-contract` fence
  type-checks with 0 errors (`tsc`, `submitTx` declared). The `state-archival` fence reports only
  TS2304 for the `server` it assumes from another fence.
- **Still reproduces:** `restore-data` declares `const { Api, assembleTransaction } = StellarRpc;`
  and tells readers to reuse `submitTx` from `submit-transaction-wait`, whose fence has
  `import { Api, Server } from "@stellar/stellar-sdk/rpc";`. The two fences combined report
  `TS2440: Import declaration conflicts with local declaration of 'Api'.`

I recorded this as a dated recurrence that names the partial fix and the residual, and left the
status `reported-upstream`. I did not set `fixed-upstream`, and did not post on #2562.

### Step 5: skill rule

`.agents/skills/improvements-pipeline/SKILL.md` ("More rules" under "File a finding") now says:
post every verified finding as an issue and resolutions as comments; never open a pull request;
no per-repository cap; a finding not posted stays `verified` with a note that says why. No date,
decision number or round id. The TODO bullet "Standing authority to post" is deleted.

### Gates run (each bare)

| Gate | Result |
|---|---|
| `npm test` | exit 0: 166 files passed, 5 skipped; 3645 tests passed, 3 expected fail, 5 skipped |
| `npm run improvements:index` | wrote `INDEX.md` (86 findings); the recurrences changed it |
| `npm run improvements:lint` | exit 0: ok, 86 findings (not `--live`; that is step 15) |
| `npm run typecheck` | exit 1 on the first run: `Env` had no secret members. `.dev.vars` existed, so I ran `npm run typegen` (writes the git-ignored `env.d.ts`); then exit 0 |
| `npm run eval:selftest` | exit 0: all checks passed |
| `npm run secrets:scan -- --tree` | exit 0: clean |

Not run in phase 1 (belong to step 15): `improvements:lint -- --live`, `eval:qa:compile`,
`eval:qa:lint` (both forms), `eval:qa:register -- --check`, `npm run build`. I did not run
`npm run test:smoke` (no `src/executor` or `src/demo` change).

## Deviations and notes

1. `moveToTuning` takes one argument the plan's signature does not list: `note`, the string
   appended to `amended`. The runner owns the planned note text.
2. `TUNING_ROW_COUNT` moves to 81 now, in phase 1, because the plan lists `tuning-rows.mjs` in
   step 1. If the lead stops before v4, revert that one line.
3. sd-081 is partly fixed, not a pure recurrence (above).
4. The first `curl` for the sls-033 re-check stalled after 77 KB; I stopped it and the retry
   returned in 0.2 s. Only the retry is evidence.
5. `ls ~/backups` and `ls` of the v4 path printed file names (no contents, no hashes) while I
   looked for the v3 file. Nothing under `~/backups` was opened, `cat`ed, `head`ed or `jq`ed. The
   runner read v3 and `cases.json` in-process and printed only the counts and the hash.
6. `improvements/INDEX.md` changed through `improvements:index`, not by hand.

## For the lead

- **Gate before v4:** step 2 passes. Reviewer part A's trigger re-run is still yours.
- **sd-081:** decide whether to reply on stellar-docs#2562 ("a claimed fix that needs a
  verification result" does not apply: nobody claimed a fix there). The partial fix is verified
  live and the residual `Api` conflict remains. I posted nothing.
- **#427:** the draft above is ready; it is not posted.
- Step 12 will commit and push everything, including this record.


## Phase 2 (plan steps 7 to 12): stopped at step 9, plan premise false

### Step 7: v4 written

- Path: `~/backups/gca-2026-11-14-split-v4.json`, mode 600.
- Counts: tuning 81, heldOut 117, reserve 49.
- SHA-256: `58ad28bb903fcd7c72122de4ca13f93438a42b92a6987dcbce7d6c3f8096c191`. It equals the dry run
  and `sha256sum` of the file.
- v3 is untouched. The Mac needs a copy of v4.

### Step 8: sls-033 set to `fixed-upstream` (uncommitted)

`improvements/stellar-light-scout/sls-033-wallet-type-enumeration-availability.md`: status
`fixed-upstream`, and a new first evidence entry with the 2026-11-17 re-check from step 2, the
resolving ref PR #1967 and the owner result on #519. `improvements:index` regenerated.

### Step 9: done under the lead's option A (the plan's premise was false)

The plan said to remove "the cap sentence that names sls-033 from `golden.notes`". `golden.notes` of
`q-tool-wallets-comparison` holds no such sentence. It reads: "Freighter and Varial name the same
wallet; do not penalize either name. Quoting Scout's wallet type metadata as attributed is not a
wrong claim." It names no finding and states no cap, and `lintCapFindings`
(`eval/qa/lint-corpus.mjs:553-580`) reads `golden.notes` only. The only text that named sls-033
and said "grade caps at partial" was in the judge-blind `truth.notes`.

**The judge-facing text had carried the cap from 2026-08-27 until the battery rebuild of 2026-11-14
(#436) moved it to the judge-blind `truth.notes`.** (`git log` on the case file; the reviewer found
it, and an earlier version of this paragraph said "never capped", which was wrong.) So the
judge-facing text carried no sls-033 cap when this item started, and the v4 move was not needed for
this edit. v4 stands because the case was opened. The lead reports it.

Option A edit (lead decision), judge-blind only:

- `truth.notes`, second paragraph: now says, dated 2026-11-17, that sls-033 is fixed live (Scout
  1.9.150: every platform fact serves `sourceUrl` and `checkedAt`; receipt:
  `improvements/resolved.json`, sls-033), that no grading cap applies, and that the judge-facing
  text has carried no cap since 2026-11-14 (#436). It keeps the true provenance. The first and
  third paragraphs are unchanged.
- `truth.verified`: **unchanged from `origin/main`** (the 2026-11-14 record). I first replaced it
  (date 2026-11-17, rootCause the receipt). The reviewer's finding B3 asked for the revert: no
  gospel changed, the new block verified none of the key facts, and a later `truth.verified.date`
  makes `goldenTimeConsistency` in `eval/qa/re-judge.mjs` refuse a re-judge of older runs without
  `--allow-golden-drift`. The revert is committed.
- Every `golden.*` field, `question`, `tags`, `truth.asOf` and `truth.reverifyBy` unchanged. Against
  `origin/main` the case differs in `truth.notes` only.
- **Re-judge disposition:** none needed. The judge-facing text is unchanged. Checked by
  `caseInputSha256` of the compiled case, before and after compile: **unchanged**. So
  `heldout-read.mjs` still pairs a stored row with this case, and no stored comparison mixes two
  goldens.

**Sibling sweep.** A script (not committed) took the case ids from `grep -rli wallet
eval/qa/corpus/battery` (`rg` is a shell function here, so I used the equivalent `grep`), the v4
`sets.tuning`, and the ids in `tool-cases.json`. 76 battery cases mention "wallet". It printed the
27 that are in tuning or the tool lane. The other 49 stay unchecked; they were not printed or
opened, and no raw list is committed.

Opened: 27 cases, of which 2 are tool lane (the passport case and one other). Not opened: 49. The
ids are not listed here, because a committed file should not list set membership.

I searched the 26 others for `sls-033`, `productKind`, `type=Wallet`, platform availability,
`availabilityCheck` and "wallet type": no hit, so none contradicts the changed truth claim. This is
a targeted search, not a full read of each case. The Freighter/Varial wording in the case needs no
action here: the case already treats the two names as one wallet. Noted for the report only.

### Step 10: passport case repointed

`q-scf-resolve-passport-superseded-slug`, `truth.corroboration[1].evidence[2].ref` changed from the
sls-033 file path to `improvements/resolved.json (sls-033 receipt)` (the spelling with a space
keeps the symmetric-caution exemption). The `note` stays as is. Step 13 adds the receipt's
commit-pinned `sourceUrl` to that `note`. The edit is judge-blind.

### Step 11: compile and registry

`npm run eval:qa:compile` and `npm run eval:qa:register` ran. Parsed diff against the files before
compile:

| File | Changed | Unchanged |
|---|---|---|
| `eval/qa/cases.json` | `corpusContentSha256` and one case, `q-tool-wallets-comparison`, field `truth` only | `counts`, 246 other cases |
| `eval/qa/tool-cases.json` | `corpusContentSha256` and one case, `q-scf-resolve-passport-superseded-slug`, field `truth` only | `counts`, 5 other cases |
| `eval/qa/sample.json` | `corpusContentSha256` only | `counts`, all 30 cases |
| `eval/qa/lifecycle-registry.json` | two `caseContentSha256` values (these two cases) | everything else |

`register-helper`: "up to date; 0 reopened".

### Gates run in phase 2 (each bare, output to a file, exit code read)

| Gate | Result |
|---|---|
| `npm run eval:qa:lint -- --since origin/main` | exit 0: 0 errors, 98 warnings (98 before the edit) |
| `npm run eval:qa:lint -- --stale --enforce-floors` | exit 0: 0 errors, 98 warnings; coverage headline 247, tool 6, 164 of 167 leaves covered, 2 open slots |
| `npm run eval:qa:register -- --check` | exit 0: up to date |
| `npm run improvements:index` | exit 0: 86 findings |
| `npm run improvements:lint` | exit 0: ok, 86 findings |
| `npm test` | exit 0: 166 files passed, 5 skipped; 3645 tests passed, 3 expected fail, 5 skipped |
| `npm run typecheck` | exit 0 |
| `npm run eval:selftest` | exit 0: all checks passed |
| `npm run secrets:scan -- --tree` | exit 0: clean |

An earlier `eval:qa:lint --since` run in this phase went through a `grep` pipe to trim warnings;
the exit code was read with `PIPESTATUS`, and the bare run above replaced it.

### Step 12: commit and push

See the section below, added after the push.

Committed with normal hooks (the pre-commit secret scan ran clean) and pushed:

- Commit `a027be08ff232f21a95bb3f119df481dc10ea9fe` on `np/1.1-drain-upstream-handoffs`.
- `gh api repos/stellar-experimental/stellar-raven/commits/a027be08ff232f21a95bb3f119df481dc10ea9fe` answers with that SHA, so
  snapshot links to this commit resolve.

### Part B fixes (lead decision, before step 13)

- **B1:** the wallets case `truth.notes` and step 9 above now say the judge-facing text carried the
  cap from 2026-08-27 until 2026-11-14 (#436).
- **B2:** the sls-033 evidence entry now says the judge-blind `truth.notes` sentence was rewritten
  and the case has carried no judge-facing cap since 2026-11-14.
- **B3:** `truth.verified` of the wallets case is the `origin/main` record again; the receipt
  pointer is in the rewritten `truth.notes` paragraph. `eval:qa:compile` and `eval:qa:register`
  ran. `caseInputSha256` is unchanged. The case differs from `origin/main` in `truth.notes` only.
- The opened-id list is replaced by counts.
- Gates after the fixes: `eval:qa:lint -- --since origin/main` exit 0 (0 errors, 98 warnings);
  `eval:qa:register -- --check` exit 0; `improvements:index` and `improvements:lint` exit 0.

## Phase 3 (plan steps 13 to 15, with the lead's addendum)

### sls-120: found, verified, filed

Source: the "What sls-120 would state" block of `REVIEW-RETIRE.md` part A (sls-107). I re-ran its
four reads on 2026-11-17 (00:32Z to 00:33Z) before writing the finding, and all reproduce:

1. `GET /api/stablecoins?limit=100`: 37 rows. BRLT (`GCHQ3F2B…PRSO`, brand Settle Network) has all
   five `issuerOfRecord*` fields null. It is the only row of 37 with the five fields null (35
   `named`, 1 `not-named` (USDT0), 1 null).
2. Horizon: `home_domain` `sep.stablex.cloud`. DNS at dns.google (A, AAAA, CNAME for it and for
   `stablex.cloud`) and cloudflare-dns.com: `Status` 3, no answer. A direct fetch fails.
3. `https://pubnet-sep.latamex.com/.well-known/stellar.toml`: 200, SHA-256
   `d39046c15f5c04d8b0bc25d625271782553017ce4b25b1d4bf61de58de0694ca` (the reviewer's hash),
   `ORG_NAME="Relay Tech Services Ltd"`, the account in `ACCOUNTS`, and a BRLT currency entry.
4. The ARST row (same brand) serves `issuerOfRecord` "Relay Tech Services Ltd" from that toml.
   I also read `https://settlenetwork.com/.well-known/stellar.toml` (404). I did not cite the
   attestation PDF.

`improvements/stellar-light-scout/sls-120-brlt-issuer-of-record-null-with-readable-toml.md`, status
`verified`. One lint rule moved the Raven comment URL out of its evidence (a GitHub URL requires a
filed status). I committed and pushed it (`f44fa9e9`) so the snapshot link resolves, read the dry
run as the maintainer, and filed it:
[Stellar-Light/stellarlight#1973](https://github.com/Stellar-Light/stellarlight/issues/1973). I
read it back: open, author the Raven account, title and body as in the dry run, with the snapshot
link. The filing commit is `a8db4f01`. sls-120 is the next free id (active max 119, ledger max
115); the item 1.3 lane starts above it.

### Step 13: resolve

No commit touched either finding file between the dry run and the real run. Comments read back
(the text equals the dry-run comment; `jq` adds only a trailing newline).

| Finding | Comments posted | Receipt `sourceUrl` commit |
|---|---|---|
| sls-033 | [#519](https://github.com/Stellar-Light/stellarlight/issues/519#issuecomment-6933871506), [#742](https://github.com/Stellar-Light/stellarlight/issues/742#issuecomment-6933871829), [PR #1967](https://github.com/Stellar-Light/stellarlight/pull/1967#issuecomment-6933872127) | `ce4f8735` |
| sls-107 | [#1900](https://github.com/Stellar-Light/stellarlight/issues/1900#issuecomment-6933884157), [PR #1944](https://github.com/Stellar-Light/stellarlight/pull/1944#issuecomment-6933884524) | `cfb8a6be` |

- sls-033: `--resolving-ref` PR #1967. The comment URLs are in the receipt's `reviewEvidence`.
- sls-107: `--live-recheck` names sls-119 (#1971) and sls-120 (#1973), so the comment on #1900
  carries both links. I re-ran its trigger checks myself first (35 named rows, AUDD, Kinesis,
  MGUSD, `assetType` counts, `assetType=Yield%20Stablecoin` 200, `assetType=Bogus` 400).
- Both snapshot commits answer on GitHub.
- The receipt `title` is the first sentence of each finding's `## Finding` and is cut with "…".
  The resolver derives it; I did not edit it, because a commit to either file between the dry run
  and the real run would change the posted snapshot.
- sls-119's dedupe line now reads "sls-107 (retired 2026-11-17; receipt in
  improvements/resolved.json; …)". It is the only other finding file I edited outside step 4.
- The passport case `note` carries the sls-033 receipt's pinned `sourceUrl`. After compile and
  register, its `caseInputSha256` equals the value before any of my edits.
- `improvements/intake.json` has no `sls-033` key. `jq` shows one receipt each for sls-033 and
  sls-107.

### sd-081 (addendum item 2)

The residual (the restore-data `Api` defect) is inside the original finding, so the status stays
`reported-upstream` and no successor is filed. I rewrote the finding's `## Finding`, `## Evidence`
and `## Recommendation` to current state: PR #3083 fixed the contract-restoration fences, the
paths are the unsuffixed ones, and the `Api` defect is the open item with its smallest fix (change
`restore-data` line 42 to `const { assembleTransaction } = StellarRpc;`). I posted one short
comment on stellar/stellar-docs#2562 in the upstream style, read it back (author kalepail), and
recorded its URL in the finding's evidence:
https://github.com/stellar/stellar-docs/issues/2562#issuecomment-6933906845

### Step 14: records

- `.agents/TODO.md`: held-out status now names v4 (path, SHA-256, 81/117/49), says v3 and v2 are
  replaced and that Mac copies of either are stale, and says a future read pairs on v4's held-out
  count. Deleted: the standing-authority bullet (phase 1), and the bullets for sls-033, sls-107,
  the nine findings and sd-081. Rewritten: the sls-116 bullet is a dated next check that names the
  three open items, #1952, #427 and the exact re-check. Added: the Scout-sweep line (5 `Live`
  wallet rows whose `availabilityCheck` says the operator is gone or the product left Stellar,
  and the unrepeated `q=wallet` paging overlap), marked not verified to the filing bar.
- `items/1.1/STATE.md`: the state table, 13 findings plus sls-120.

### Step 15: gates (each bare, output to a file, exit read)

| Gate | Result |
|---|---|
| `npm run improvements:index` | exit 0: 85 findings |
| `npm run improvements:lint` | exit 0: ok, 85 findings |
| `npm run improvements:lint -- --live` | exit 0: ok, 85 findings, live intake checked |
| `npm run eval:qa:compile` | exit 0 |
| `npm run eval:qa:lint -- --since origin/main` | exit 0: 0 errors, 98 warnings |
| `npm run eval:qa:lint -- --stale --enforce-floors` | exit 0: 0 errors, 98 warnings |
| `npm run eval:qa:register -- --check` | exit 0: up to date |
| `npm run eval:selftest` | exit 0: all checks passed |
| `npm run typecheck` | exit 0 |
| `npm test` | exit 0: 166 files passed, 5 skipped; 3645 tests passed, 3 expected fail, 5 skipped |
| `npm run build` | exit 0 (Wrangler dry run). No file under `src/` changed, so no deploy is needed |
| `npm run secrets:scan -- --tree` | exit 0: clean |

### Lead's B5 check

sls-120 filed and linked (#1973); both TODO bullets gone and the Scout-sweep line added; no
`sls-033` key in `intake.json`; sls-119 points to the sls-107 receipt; one receipt each for
sls-033 and sls-107 (`jq`); `improvements:lint -- --live` passes; the passport `note` carries the
receipt's pinned `sourceUrl`.

### The #427 reply

Posted on stellar-raven#427 after the push of `be39023a`, and read back (author kalepail):
https://github.com/stellar-experimental/stellar-raven/issues/427#issuecomment-6933957089

I did not comment on #425 or #429 and did not open the pull request; those are the lead's.

## For the lead

- v4: `~/backups/gca-2026-11-14-split-v4.json`, SHA-256
  `58ad28bb903fcd7c72122de4ca13f93438a42b92a6987dcbce7d6c3f8096c191`, counts 81 / 117 / 49. Copy it to
  the Mac.
- Ids this item took for the item 1.3 lane: sls-120 (filed as stellarlight#1973). The next free id
  is sls-121.
- Branch `np/1.1-drain-upstream-handoffs` is pushed. The last commit before this paragraph is
  `be39023a`; this paragraph and the #427 URL are committed after it.
- The v4 move turned out unnecessary for the wallets-case edit (the judge-facing text carried no
  sls-033 cap since 2026-11-14); v4 stands because the case was opened.
- Not deployed and not needed: no file under `src/` changed.
