---
id: sls-073
service: stellar-light-scout
status: fixed-upstream
discovered: 2026-08-21
upstreamTitle: vet-idea returns an empty report.competitors.projects array for an idea the directory does match
evidence:
  - 2026-08-21T01:01:25.310Z live https://stellarlight.xyz/api/vet-idea
  - the same call returned vertical=null, gap=null, report.competitors.projects=[], and 6 competitor repos
  - 2026-08-21T01:11:45.184Z live https://stellarlight.xyz/directory returned 25 projects for the same query
  - those rows included noether, zenex, turbolong, and stellars-finance
  - 2026-08-21T01:01:41.945Z live https://stellarlight.xyz/directory returned matchMode=strict
  - exact project-name searches for Noether, Stellars Finance, and Zenex returned those records
  - 2026-08-21T01:01:52.089Z live GET https://stellarlight.xyz/api/analyze?dimension=gaps listed 21 byType verticals
  - Solo project 49 todo 1740 comments 5016 and 5018 record the replay and its coordinator verification
  - 2026-08-25 live re-check reproduced the empty report.competitors.projects array; the gaps axis now lists 23 byType verticals and still holds no perpetuals entry
  - upstream issue filed 2026-08-25: https://github.com/Stellar-Light/stellarlight/issues/1025
  - 2026-09-03T15:53:09.999Z live GET https://stellarlight.xyz/api/vet-idea?q=perpetuals%20%2F%20derivatives%20trading%20protocol%20on%20Stellar returned report.vertical=null, report.gap=null, matchMode=scored, 8 competitor projects, and 6 competitor repos
  - the live competitor projects included noether, stellars-finance, turbolong, and zenex; GET /api/projects/search with limit=6 returned the same first six candidates
---

## Finding

The Stellar Light `vet-idea` endpoint returns an empty
`report.competitors.projects` array for records that the directory does hold.

On 2026-08-21 `vet-idea` answered the idea "perpetuals / derivatives trading
protocol on Stellar". The answer set `report.vertical` = `null` and
`report.gap` = `null`. It also returned an empty `report.competitors.projects`
array. The `report.competitors.repos` array in the same response held 6 rows.

The directory returned 25 projects for the same idea text. The first four rows
were `noether`, `zenex`, `turbolong`, and `stellars-finance`. Their own
`shortDescription` text describes perpetual or leveraged trading.

Separate exact project-name searches also returned `noether`,
`stellars-finance`, and `zenex`. These calls confirm the record identities.

The response documents a basis for two fields. Its `meta.note` states that
`vertical: null` means the idea does not map onto the measurable vertical axis.
The `vertical` and `gap` field descriptions name that same closed set from the
gaps axis. The `report.competitors.projects` array carries no basis statement.

The two competitor arrays behaved differently in the same response. The
`report.competitors.projects` array was empty and the
`report.competitors.repos` array was not. The observed pattern is that the
`report.competitors.projects` array went empty in the same response where
vertical detection returned `null`. The implementation cause remains
unverified. We read only the responses, not the upstream code, so we cannot say
which internal step produced the empty array.

The reader-facing effect is testable regardless of that cause. For one query,
`vet-idea` returned an empty `report.competitors.projects` array while the
directory returned matching projects.

## Evidence

`vet-idea` ran at 2026-08-21T01:01:25.310Z. The source was
`https://stellarlight.xyz/api/vet-idea`. The call used q = "perpetuals /
derivatives trading protocol on Stellar". It returned `report.vertical` =
`null`, `report.gap` = `null`, and `report.competitors.projects` = `[]`. It also
returned `report.competitors.repos` = 6 rows.
`nguemechieu/sopotek_quant_system` and `Sadhana7836/Pickle_Perps` led those
rows.

`searchProjects` at 2026-08-21T01:11:45.184Z, source
`https://stellarlight.xyz/directory`, used the same q value. It returned 25 rows
with `matchMode` = `loose-1`. The first four rows were:

- `noether` — a decentralized perpetual futures exchange on Stellar/Soroban.
- `zenex` — a decentralized perpetual trading exchange on Stellar/Soroban.
- `turbolong` — a leveraged trading platform on Stellar.
- `stellars-finance` — a perpetual trading protocol on Stellar.

`searchProjects` ran at 2026-08-21T01:01:41.945Z against
`https://stellarlight.xyz/directory`. The calls used `matchMode` = `strict`. We
made three separate calls, one per exact project name:

- q = "Noether" returned `noether` — `types: []`. Its `shortDescription` opens
  "Noether is a decentralized perpetual futures exchange built natively on
  Stellar/Soroban".
- q = "Stellars Finance" returned `stellars-finance` — `types: ["DEX"]`. Its
  `shortDescription` opens "Decentralized perpetual trading protocol on Stellar".
- q = "Zenex" returned `zenex` — `types: []`. Its `shortDescription` opens "Zenex
  (formerly Hermes) is a decentralized perpetual (leveraged) trading exchange on
  Stellar/Soroban".

`GET https://stellarlight.xyz/api/analyze?dimension=gaps` ran at
2026-08-21T01:01:52.089Z. It returned 21 `byType` verticals. The first 11 are
Faucet, Explorer, RPC, Social Impact, Indexer, Gaming, Bridge, Infrastructure,
NFT, Lending, and Education. The last 10 are Anchor, Stablecoin, DEX, AI,
Analytics, Wallet, Security, RWA, SDK, and Payments. No entry matches
perpetuals, derivatives, futures, margin, or leverage. This is the axis the
`vertical` and `gap` field descriptions name.

The three project records above are the exact directory rows for those names.
They are not semantic candidates. We include their `types` values because the
response documents `vertical` and `gap` against that same taxonomy.

A 2026-08-25 re-check qualifies the 25-row count. That count tracks the
requested `limit`, because the search backfills the keyword matches with
semantic rows. The same call returned 20, 25, and 30 rows for `limit` 20, 25,
and 30, with `semantic` counts of 14, 19, and 24. At `limit` 25 the response
held 6 keyword rows and 19 semantic rows. `noether`, `zenex`, `turbolong`, and
`stellars-finance` were all keyword rows. Read the 25 as the rows one call
returned, not as a directory population total. This finding rests on those four
keyword rows and on their exact-name records, not on the count.

The same re-check reproduced the defect. `vet-idea` again returned
`report.vertical` = `null`, `report.gap` = `null`, and
`report.competitors.projects` = `[]`, with 6 rows in
`report.competitors.repos`. The gaps axis has since grown to 23 `byType`
verticals. `Card Issuing` and `Exchange` are the two added names. No entry
matches perpetuals, derivatives, futures, margin, or leverage.

### Fixed upstream recheck (2026-09-03)

At 2026-09-03T15:53:09.999Z, `GET /api/vet-idea` with the original perpetuals
query returned `report.vertical: null`, `report.gap: null`,
`matchMode: "scored"`, eight competitor projects, and six competitor repos.
The projects included `noether`, `stellars-finance`, `turbolong`, and `zenex`.
`GET /api/projects/search` with `limit=6` returned the same first six
candidates. Upstream issue #1025 is closed as completed.

## Recommendation

Make one general interface change. Let `report.competitors.projects` include
directory records whose own text matches the submitted idea. Include those
records when `report.vertical` is `null`. The directory returned matching
records for this query while the array was empty.

Then give `report.competitors.projects` a basis statement, in the same way
`vertical` and `gap` already carry one. State which retrieval the returned rows
came from. Also state that an empty array means no matched record in that
retrieval.

Apply this to every idea whose `vertical` resolves to `null`, not to this idea
text. A per-idea vocabulary patch would leave the same disagreement for the next
unmapped idea.

We did not verify the internal step that produced the empty array. Choose
whichever matching rule and code location make `vet-idea` return the records
that exist.
