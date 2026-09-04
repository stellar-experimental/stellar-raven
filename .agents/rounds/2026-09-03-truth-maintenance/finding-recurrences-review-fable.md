# Finding recurrences review

Date: 2026-09-04
Role: independent reviewer of recurrence commit `88f08ec887e063e60905209d75faa54faa2e0be6`
Model: Claude Fable 5.1 at `xhigh`
Worktree: `/private/tmp/stellar-raven-tm-recurrences`, branch `codex/tm-finding-recurrences`

I read the pipeline rules first: `.agents/skills/improvements-pipeline/SKILL.md` and
`improvements/README.md`. Both are byte-identical to the copies reviewed earlier this round.
I started from the diff and the record files. I read `finding-recurrences-terra.md` only after my
own verification. I re-fetched every source the commit cites and recomputed every hash.
I made no implementation change. I filed nothing and commented nowhere upstream.
This report is the only file I added.

## Final verdict, revision 2

`PASS`

Commits `bd7330b` and `bf198b0` resolve every required item from revision 1. The re-review and
the intake review are at the end of this file. Two non-blocking notes remain; neither changes a
record or blocks filing. The revision 1 text below is kept as the audit trail.

## Revision 1 verdict, before bd7330b and bf198b0

`CHANGES-REQUIRED`

The commit is structurally sound. Lint, live lint, the generated index, the focused tests, the
secrets scan, and `git diff --check` all pass. The `sd-046` status move and the `sd-037` recurrence
are correct. Three items need correction before this commit represents current truth:

1. `sd-044`: the new recurrence attributes the wrong hash to commit `c43c77eb`. The hash belongs to
   the stale `master` branch. The file count "six" is also wrong.
2. `sls-023`: the author classified the defect as not reproducing. The live service shows the
   defect reproducing for 47 of 61 rows. The record received no dated evidence.
3. `ll-030`: the author classified the check as inconclusive. An authenticated read through the
   production server reproduces the defect exactly. The record received no evidence, and no
   `.agents/TODO.md` entry records the missing check, which the pipeline requires for an
   inconclusive outcome.

Two minor precision notes on `sd-046` and `sd-037` are optional.

## Item verdicts

| item | verdict | note |
|---|---|---|
| `sd-046` proposed to verified | PASS | live re-execution recorded; all four hashes reproduce; mutual case link present |
| `sd-037` recurrence | PASS, one gap | hashes reproduce at the current head; the stale-bot state on issue #1981 is not recorded |
| `sd-044` recurrence | FAIL | hash `94bf0b0f…` is `master/start` (2025-03-26), not commit `c43c77eb`; 19 Docs files, not six |
| `ll-030` handling | FAIL | still reproduces on an authenticated read; no recurrence and no TODO entry |
| `sls-023` handling | FAIL | still reproduces for 47 of 61 rows; no recurrence; report says "suggests fixed" |
| duplicates | PASS | no active or resolved duplicate for any touched ID; no repeated recurrence dates |
| generated index | PASS | `npm run improvements:index` reproduces the committed bytes; counts 3, 2, 1 and status `verified` are correct |
| gates | PASS | lint, live lint, probes, 41 focused tests, secrets scan, diff check |

## Verification of decisive sources

All fetches ran on 2026-09-04 with `curl -sSL` and `shasum -a 256`. Commit heads came from the
GitHub API.

### sd-046

| source | SHA-256 | recorded | match | content |
|---|---|---|---|---|
| Lumens page | `4cc085d0…3029` | same | yes | "Subentries include trustlines (for both traditional assets and pool shares)"; no two-reserve exception; last updated 2026-09-02 |
| Accounts page | `c2307eb9…4481` | same | yes | "Trustlines (includes traditional assets and pool shares)"; no two-reserve exception; last updated 2026-09-02 |
| Liquidity Pools page | `2a6906e9…0a11` | same | yes | "A pool share trustline requires 2 base reserves instead of 1" |
| CAP-0038 raw file | `febebc61…c1aa` | same | yes | "should count as two subentries (and therefore require two base reserves)" |

The status move meets the lifecycle bar. The evidence list records a dated live re-execution, and
the source case `q-protocol-base-reserve-min-balance` still names `sd-046` in its `rootCause`.
Both general pages changed on 2026-09-02 and still omit the exception. That strengthens the
recurrence and is worth one clause in the record.

Precision note. The 2026-08-30 evidence line cites the CAP-0038 `blob/master` page. The recorded
hash is for the raw file. The rendered page hashes to `d90b442c…4e35`. State "raw file" beside
the hash so a stranger can reproduce it.

### sd-037

| source at `65e2b626…` | SHA-256 | recorded | match |
|---|---|---|---|
| `README.md` | `ecb809f4…3a0d` | same | yes |
| `limits/README.md` | `4bfd8ffe…d2a3` | same | yes |
| `limits/slp-0004.md` | `657c2d33…ffe0` | same | yes |

`65e2b626` is the current `master` head (2026-08-31T23:57:00Z). The repository has no `main`
branch. The root README prose names only CAPs and SEPs. Its directory tree does list `limits`
and `limits/README.md` without any description. `limits/README.md` is a process document with
no proposal index and zero `SLP-000` mentions. `limits/` holds `slp-0001.md` through
`slp-0006.md`. The recurrence is accurate. Say "prose" rather than "README" to keep the tree
listing from contradicting it.

Issue #1981 is open. Its only comment is the `github-actions[bot]` stale notice of 2026-08-14:
the issue closes 30 days later unless the stale label is removed. That is not maintainer
activity, so the no-noise rule holds and no comment is due. The record must still note the state.
Around 2026-09-13 the issue may auto-close, which the pipeline classifies as `closed-unfixed`.
A dated `.agents/TODO.md` entry should schedule that check.

### sd-044

| source | SHA-256 | recorded | match |
|---|---|---|---|
| `stellar/quickstart` `start` at `main` head `c43c77eb` (2026-09-02) | `200eba3f…9f73`, 33,623 bytes | `94bf0b0f…e909` | no |
| `stellar/quickstart` `start` at `master` (2025-03-26, `258a5b6e`) | `94bf0b0f…e909`, 25,434 bytes | same | yes, wrong revision |

The default branch is `main`. The recurrence says commit `c43c77eb` has `start` hash
`94bf0b0f…`. That hash belongs to the stale `master` branch. The substantive claim holds on
both revisions: at `c43c77eb` line 47 sets `ENABLE_CORE_MANUAL_CLOSE`, lines 202 and 203 parse
`--enable-core-manual-close`, and line 520 writes it into `etc/stellar-core.cfg`. Those are the
same line numbers the original 2026-08-14 evidence cites, so the original read was `main`. The
recurrence must pair commit `c43c77eb` with `200eba3f…`, or cite `master` honestly as a stale
branch and drop the commit claim.

The Docs side is correct in substance and wrong in count. `3fcd6636` is the current `main` head
(2026-09-02T19:45:20Z). Its tree holds 23 blobs under `docs/tools/quickstart/`, of which 19 are
`.mdx` pages. I fetched all 19. None mentions `manual close`, `manualclose`, or
`--enable-core-manual-close`. The record says "the six current Quickstart files". Say "all 19
`.mdx` pages under `docs/tools/quickstart/`". Four of the author's six file hashes match my
fetches (`container`, `operation-modes`, `run-command-examples`, `service-options`).

Issue #2772 is open with zero comments and no activity since 2026-08-19. No comment is due.

### ll-030

The author ran anonymous calls to `api.lumenloop.com`, received HTTP 401, and classified the
check as inconclusive. The production Raven server holds the Lumenloop credential host-side, so
an authenticated read was available without any secret leaving the host. I ran one `execute`
script against production at `2026-09-04T06:55:51Z`:

| call | result |
|---|---|
| `lumenloop.get_project({ slug: "wisdomtree" })` | ok; description "WisdomTree Prime is a retail financial app … including 13 digital funds and a Gold token, all tokenized on the Stellar network"; no `CRDT` or `CRDYX` substring anywhere in the record |
| `lumenloop.search_directory({ query: "CRDT", limit: 10 })` | ok; `match_mode: semantic`; DTCC, Stellar Router SDK, Decentrio, OrbitCDP, DeFarm, CLOB, Dobprotocol, DD, Content DAO, DCM |
| `lumenloop.search_content_semantic({ query: "WisdomTree CRDT CRDYX private credit alternative income digital fund Stellar", limit: 15 })` | ok; 24 rows; zero rows name `CRDT` or `CRDYX` |

This is the exact 2026-08-28 trigger, and it reproduces. The correct classification is
`still-repro`, with a dated recurrence. Even under the author's inconclusive reading, the
pipeline requires a dated `.agents/TODO.md` entry that names the next concrete check.
`.agents/TODO.md` in this worktree contains no `ll-030` entry.

### sls-023

Live read of `https://stellarlight.xyz/api/projects/search?q=real%20world%20asset&limit=100`
at `generatedAt 2026-09-04T06:54:40.644Z`, response SHA-256 `f6c976a7…2e0d`, Scout
`apiVersion 1.9.30`:

| field | value across 61 rows |
|---|---|
| `deployment` object present | 61 |
| `deployment.network` | `unknown` 47, `mainnet` 14 |
| `deployment.basis` | null 47, `onchain-activity` 14 |
| `deployment.sourceUrl` | null 61 |
| `products` non-null | 1 (DTCC) |
| `productKind` non-null | 0 |
| `supportedNetworks` non-null | 20 |
| `assets` key | absent from every row |

DTCC: status `Development`, basis `operator-announcement`, deployment `unknown`, one announced
mainnet product with the H1 2027 note. The presence of a `deployment` object is not a populated
deployment status. Forty-seven rows say `unknown`, sixty rows have no product, no row has an
asset. Compared with the 2026-08-28 recurrence, fourteen rows gained an `onchain-activity`
deployment. That is a partial improvement, and the defect still reproduces.

The author's report says "The exact missing product and deployment model does not reproduce"
and "current evidence suggests that its original defect is fixed". Both statements are wrong on
the live response the author cites. The round ledger's 2026-09-03 improvements verdict already
recorded the same partial state: "DTCC product exists; generic deployment remains unknown;
assets remain absent; partial; keep active". The record needs a dated 2026-09-04 recurrence
with these numbers, and the 2026-09-03 live re-check from the ledger is also missing from the
record.

## Duplicates and index

- `sd-046` is distinct from `sd-043`, as the record states. No active or resolved finding covers
  the pool-share reserve exception. `improvements/resolved.json` has no entry for pool-share,
  manual-close, or SLP material.
- Recurrence dates inside each touched record are unique. `sd-037` keeps its older entries in
  non-chronological order; that predates this commit.
- `npm run improvements:index` reproduces the committed `INDEX.md` byte for byte. The recurrence
  counts read 3, 2, and 1, and `sd-046` shows `verified`.

## Author report corrections

- `finding-recurrences-terra.md` lists the request `GET https://raw.githubusercontent.com/stellar/quickstart/master/start` and then names commit `c43c77eb`. The two do not match. See `sd-044` above.
- The report lists `docs/tools/quickstart/service-options.mdx`. The file lives at `docs/tools/quickstart/advanced-usage/service-options.mdx`.
- The README hash in the report has 63 hex characters. The file hashes to `66c27c72faa693c25be4f44035651d5709cff1b4617e1fe344171025ab5472d5`.
- The `sls-023` conclusion "does not reproduce" is contradicted by the same response's field values.
- The report says `npm run improvements:probes` ran two Lumenloop probes as inconclusive. That matches my run. It does not bear on `ll-030`, which has no probe.

## Commands

```sh
git show --stat 88f08ec ; git show 88f08ec -- improvements/
diff .agents/skills/improvements-pipeline/SKILL.md <reviewed copy> ; diff improvements/README.md <reviewed copy>
curl -sSL <each cited source> ; shasum -a 256 <fetched file>
gh api repos/stellar/stellar-protocol/commits/master
gh api repos/stellar/stellar-protocol/issues/1981 ; gh api repos/stellar/stellar-protocol/issues/1981/comments
gh api repos/stellar/quickstart --jq .default_branch
gh api repos/stellar/quickstart/commits/{main,master}
gh api repos/stellar/stellar-docs/commits/main
gh api "repos/stellar/stellar-docs/git/trees/3fcd6636…?recursive=1"
gh api repos/stellar/stellar-docs/issues/2772
curl -sSL "https://stellarlight.xyz/api/status" ; curl -sSL "https://stellarlight.xyz/api/projects/search?q=real%20world%20asset&limit=100"
mcp__stellar-raven__execute   # one read-only Lumenloop script, listed under ll-030
npm run improvements:index && git status --porcelain
npm run improvements:lint
npm run improvements:lint -- --live
npm run improvements:probes            # 6 recurring, 2 inconclusive without LUMENLOOP_API_KEY, 0 errors
npx vitest run test/improvements-*.test.ts test/improvements-writes.test.mjs   # 5 files, 41 tests
npm run secrets:scan -- --tree
git diff --check 8d1b50a 88f08ec
```

## Required changes

1. `sd-044` recurrence, 2026-09-04: replace `94bf0b0f…e909` with
   `200eba3f488563d9a6474fb217c937b5a4a9e5fdb2923b8f7323904f885a9f73` for commit `c43c77eb`, and
   replace "The six current Quickstart files" with "All 19 `.mdx` pages under
   `docs/tools/quickstart/`".
2. `sls-023`: add a 2026-09-04 recurrence with the field table above and the response hash.
   Add the 2026-09-03 ledger re-check as well. Keep `reported-upstream`. Do not describe the
   defect as fixed.
3. `ll-030`: add a 2026-09-04 recurrence with the three authenticated calls above. Keep
   `proposed` or move to `verified`; the live re-execution now meets the verification bar.
4. `.agents/TODO.md`: add a dated entry to re-check issue #1981 after 2026-09-13 and classify it
   `closed-unfixed` if the stale bot closes it. Add the `ll-030` entry only if the recurrence is
   not recorded.
5. Optional: `sd-046`, say "raw file" beside the CAP-0038 hash and note that both general pages
   were updated on 2026-09-02. `sd-037`, say "README prose" and record the stale-bot state.
6. Regenerate the index and rerun lint after the edits.

## Risks and blockers

- Issue #1981 may auto-close around 2026-09-13 with no maintainer action. The no-noise rule
  forbids a keep-alive comment. The round must plan the `closed-unfixed` handling instead.
- The Lumenloop probes `ll-003` and `ll-007` stay inconclusive without `LUMENLOOP_API_KEY`. The
  production server can run those reads without exposing the key, as done here for `ll-030`.
- No blocker prevents the corrections. They are record edits plus one TODO entry.

## Re-review of bd7330b and bf198b0

Date: 2026-09-04, revision 2. I re-read both diffs, re-ran every gate, and checked each required
item from revision 1 against the committed text. I changed no record. I filed and commented
nowhere.

| required item | commit | result |
|---|---|---|
| 1. `sd-044` hash for commit `c43c77eb` | `bd7330b` | PASS; now `200eba3f…9f73`, labeled `main`; matches my fetch |
| 1. `sd-044` file count | `bd7330b` | PASS; now "All 19 `.mdx` pages under `docs/tools/quickstart/`" |
| 2. `sls-023` 2026-09-04 recurrence | `bd7330b` | PASS; 61 rows, 47 unknown, 14 onchain-activity, 1 products, 0 productKind, no assets, hash `f6c976a7…2e0d`; every number matches my tabulation |
| 2. `sls-023` 2026-09-03 ledger re-check | `bd7330b` | PASS; cites `improvements-terra.md`, whose row reads "Still reproduces. Keep active." |
| 2. `sls-023` status | `bd7330b` | PASS; stays `reported-upstream`; index shows 6 recurrences |
| 3. `ll-030` 2026-09-04 recurrence | `bd7330b` | PASS; three authenticated calls recorded; results match my 06:55:51Z run; author re-ran at 07:00:31Z |
| 3. `ll-030` status | `bd7330b` | PASS; `verified`; the live re-execution meets the bar |
| 4. TODO entry for issue #1981 | `bd7330b` | PASS; scheduled after 2026-09-13, forbids a keep-alive comment, classifies `closed-unfixed` |
| 5. `sd-046` raw-file note and 2026-09-02 page dates | `bd7330b` | PASS |
| 5. `sd-037` "README prose" and stale-bot state | `bd7330b` | PASS; recorded in an evidence line and in the recurrence |
| 6. index regenerated and lint rerun | `bd7330b` | PASS; `npm run improvements:index` reproduces the committed bytes |
| author report corrections | `bd7330b` | PASS; commit URL replaces the `master` URL, 19 pages, wrong path and truncated hash removed, `sls-023` and `ll-030` conclusions corrected |

Gates after `bf198b0`:

| gate | result |
|---|---|
| `npm run improvements:index` | 70 findings; working tree stays clean |
| `npm run improvements:lint` | ok, 70 findings |
| `npm run improvements:lint -- --live` | ok, live intake checked |
| `npm run improvements:probes -- --service lumenloop` | 2 inconclusive without `LUMENLOOP_API_KEY`, 0 errors |
| focused vitest, five files | 41 passed |
| `npm run secrets:scan -- --tree` | clean |
| `git diff --check 109f16f bf198b0` | clean |
| nine filing dry runs | all resolve an owner and render an immutable snapshot |

## Intake review

`bf198b0` adds six overrides to `improvements/intake.json` and the report
`verified-intake-readiness-terra.md`.

Owner mappings that the commit introduces on this branch:

| finding | owner | my check | verdict |
|---|---|---|---|
| `sd-049` | `stellar/stellar-docs` | the page source is `docs/tools/lab/saved/keypairs.mdx` in `stellar/stellar-docs` at `main`; the finding is a docs-content conflict and its recommendation targets the page wording, not the Laboratory code | correct |
| `sk-021` | `stellar/stellar-dev-skill` | `skills/smart-contracts/SKILL.md` exists in that repository at `main`; `intake.json` maps the `stellar-dev` source to the same repository | correct |

Mappings that must retain the reviewed root wording. Root is
`/Users/kalepail/Desktop/stellar-raven-codemode` at `898063e2fd417b83388e5b179ac72d722bc14de1`.

| finding | root entry | this branch | byte-identical |
|---|---|---|---|
| `sd-050` | present | present | yes |
| `sd-051` | present | present | yes |
| `sk-023` | present | present | yes |
| `sk-024` | present | present | yes |
| `sd-052`, `sk-022`, `sd-046` | present | present | yes |

`sd-049` and `sk-021` have no root entry yet. This branch introduces them. Root already has eight
`verified` findings; this branch has ten, because `bd7330b` also verified `sd-046` and `ll-030`.

Readiness report claims, checked:

| claim | result |
|---|---|
| eight `verified` findings at root `898063e` | true |
| `sd-046` included from `bd7330b` | true |
| nine dry runs pass without posting | true; I re-ran all nine |
| `sd-050`, `sd-051`, `sk-023`, `sk-024` preserved with root reasons | true, byte for byte |
| no intake blocker remains | true for the nine listed findings |

Two non-blocking notes:

1. The readiness report omits `ll-030`. `bd7330b` moved it to `verified`, so this branch has ten
   verified findings, not nine. `ll-030` has no override. The `lumenloop` service rule resolves it
   to `lumenloop/lumenloop-backend`, and its dry run passes with an immutable snapshot at
   `bd7330b`. That owner is correct: the recommendation asks for a `products[]` or `assets[]`
   array on the API record, or new content-pipeline rows, which is API and pipeline work rather
   than a committed directory-record correction. No change is required. Every other
   backend-routed `ll-` finding carries an explicit override, so one may be added for consistency
   when this branch merges.
2. The `sk-023` and `sk-024` record bodies on this branch predate the corrections that root
   already carries. Root's titles read "The agentic-payments MPP guide omits MPP's
   payment-method-agnostic scope" and "The x402 guide presents OpenZeppelin Channels and its API
   key as the only facilitator path". This branch still renders the older titles in its dry runs.
   The intake reasons are identical on both sides, and this branch does not touch either record
   file, so the merge carries root's corrected bodies forward without conflict. Re-run those two
   dry runs on root after the merge, before any filing.

Filing itself still needs owner authority. Nothing was filed or commented upstream in this
review.


## Final confirmation of 1d08120

Date: 2026-09-04, revision 3. Commit `1d08120` changes only `verified-intake-readiness-terra.md`.
It closes the first non-blocking note above.

| check | result |
|---|---|
| readiness report lists `ll-030` and `sd-046` as the two findings that `bd7330b` verified | true |
| filing table rows | 10: `sk-021`, `sk-022`, `sk-023`, `sk-024`, `ll-030`, `sd-046`, `sd-049`, `sd-050`, `sd-051`, `sd-052` |
| `verified` findings on this branch | 10, the same set |
| `verified` findings at root `898063e` | 8, as the report states |
| `ll-030` owner | `lumenloop/lumenloop-backend` through the `lumenloop` service rule; no override; the report says the same |
| `ll-030` dry run at `1d08120` | resolves that owner and renders the immutable snapshot at `bd7330b` |
| `npm run improvements:lint` | ok, 70 findings; working tree clean |

`PASS`. The second non-blocking note, re-running the `sk-023` and `sk-024` dry runs on root after
the merge, is unchanged and still applies.
