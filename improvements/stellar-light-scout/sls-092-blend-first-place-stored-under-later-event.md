---
id: sls-092
service: stellar-light-scout
status: verified
discovered: 2026-10-06
upstreamTitle: Stellar Hacks Blend first-place submission is stored under a later event with no placement
evidence:
  - 2026-10-06 golden-coverage round. A distinct reviewer read GET /api/hackathons/builds/27438 and found the Blend first-place submission under stellar-hacks-paltalabs with placement null (.agents/rounds/2026-10-06-scout-hackathon-goldens.md, entries 12 and 14).
  - 2026-10-06T14:40:08Z DoraHacks capture of https://dorahacks.io/hackathon/stellar-hacks-blend/winner. buidlsCount 39, winnerAnnounced true, and a summary that names Blend Pool Creator (buidl/27438) as first place (.agents/rounds/2026-10-06-scout-hackathon-goldens/dorahacks-captures.json).
  - 2026-10-09T21:11Z Scout API 1.9.72. GET /api/hackathons/stellar-hacks-blend returns stats.totalSubmissions 35 and stats.winners 2. winners[] holds dorahacks-buidl-27417 (2nd Place) and dorahacks-buidl-27456 (3rd Place). prizeTiers lists First Place, rank 1, amountUSD 3000, and no winner has placementRank 1.
  - 2026-10-09T21:11Z GET /api/hackathons/builds/27438 returns name Blend Pool Creator, hackathon.slug stellar-hacks-paltalabs, hackathon.endedAt 2025-08-07, and placement null. GET /api/hackathons/review?link=https://dorahacks.io/buidl/27438 repeats isWinner false and award null.
  - 2026-10-09T21:11Z GET /api/hackathons/builds?hackathon=stellar-hacks-blend&limit=100 returns 35 rows with two placed rows. GET /api/hackathons/compare?slugs=stellar-hacks-blend,stellar-hacks-paltalabs reports winnerCount 2 and prizePerWinnerUSD 3000 for Blend. GET /api/hackathons/analyze?facet=placement&by=event reports 2 winners of 35 for Blend.
  - 2026-10-09 organizer report read through a web reader, because direct reads of dorahacks.io return HTTP 405 behind a human-verification check. https://dorahacks.io/hackathon/stellar-hacks-blend/report (dated 2025/08/28) names 1st Place Blend Pool Creator (buidl/27438), 2nd Place Comet x Hoops Finance (buidl/27417), 3rd Place YieldBack.Cash (buidl/27456), and 39 approved projects.
  - 2026-10-09T21:18Z other events keep the 2026-10-06 totals. stellar-hacks-kale-reflector serves 45 submissions and 10 winners against the organizer capture of 46 approved projects and ten named winners. stellar-hacks-zk serves 319 and 5 against 345 and five. Those winner counts agree with the organizer, so only Blend loses a placed submission.
  - Dedupe 2026-10-09. No active finding, no resolved receipt, and no Stellar-Light/stellarlight issue names buidl 27438, Blend Pool Creator, or a submission stored under the wrong event. The resolved sls-001 covered missing placement fields and is fixed.
probe:
  type: http-text
  url: https://stellarlight.xyz/api/hackathons/builds/27438
  expect:
    status: 200
    contains:
      - '"slug":"stellar-hacks-paltalabs"'
      - '"placement":null'
---

## Finding

`GET /api/hackathons/stellar-hacks-blend` reports 2 winners and 35 submissions.
The organizer's published report names three placed submissions and 39 approved projects.
The first-place submission, Blend Pool Creator (DoraHacks BUIDL 27438), is in Scout's store.
Scout serves it under `stellar-hacks-paltalabs`, an event that started on 2025-07-14.
Stellar Hacks: Blend ended on 2025-07-07.
The stored record has `placement: null`, `isWinner: false`, and `award: null`.

The Blend record therefore lists a First Place prize tier with no winner.
Derived values inherit the error.
`winnerCount` is 2, `prizePerWinnerUSD` is 3000, and the placement facet reports 2 placed of 35.
The organizer awarded 3000, 2000, and 1000 USD in XLM to three places.

The submission-count gap is a separate, smaller problem.
The build-detail 404 text says an absent record is not proof that a submission never existed.
Private or deleted submissions cannot be served, so part of the 35-against-39 gap can be by design.
The lost first place is not that case, because the record exists in the store.

A likely cause is that DoraHacks lets one BUIDL enter more than one hackathon.
The Scout build record carries one `hackathon` object.
When a later event overwrites the first, the first event's placement is lost.
This cause is not verified against DoraHacks data, because the BUIDL page sits behind a human-verification check.

## Evidence

Public reads on 2026-10-09 used Scout API `1.9.72`:

```sh
curl 'https://stellarlight.xyz/api/hackathons/stellar-hacks-blend'
curl 'https://stellarlight.xyz/api/hackathons/builds/27438'
curl 'https://stellarlight.xyz/api/hackathons/builds?hackathon=stellar-hacks-blend&limit=100'
curl 'https://stellarlight.xyz/api/hackathons/compare?slugs=stellar-hacks-blend,stellar-hacks-paltalabs'
curl 'https://stellarlight.xyz/api/hackathons/review?link=https://dorahacks.io/buidl/27438'
```

| value | Scout 2026-10-09 | organizer report 2025/08/28 |
| --- | --- | --- |
| Blend submissions | 35 | 39 approved projects |
| Blend winners | 2 | 3 |
| 1st Place | none | Blend Pool Creator (buidl/27438) |
| 2nd Place | Comet x Hoops Finance (buidl/27417) | same |
| 3rd Place | YieldBack.Cash (buidl/27456) | same |
| BUIDL 27438 event | stellar-hacks-paltalabs, placement null | Stellar Hacks: Blend, 1st Place |

The organizer report was read through a web reader on 2026-10-09.
Direct `curl` reads of `dorahacks.io` return HTTP 405 behind a human-verification check.
The 2026-10-06 capture of the Blend winner page agrees with the report: `buidlsCount` 39 and the same three winners.
The r/Stellar announcement cited on 2026-10-06 gives the same three places.

The same-day reads of `stellar-hacks-kale-reflector` and `stellar-hacks-zk` show winner counts that agree with the organizer.
Their submission totals are below the organizer counts by 1 and 26.
Only Blend loses a placed submission.

The resolved `sls-001` fixed missing placement fields on served winners.
This finding is different: the winner record exists but sits under another event with no placement.

## Recommendation

Store every hackathon a submission entered, each with its own placement, award, and track.
Serve that list on the build record, or keep one row per submission and event pair.
Restore Blend Pool Creator as the Stellar Hacks: Blend first place.
Recount `stats.winners`, `winnerCount`, `prizePerWinnerUSD`, and the placement facet from per-event placements.

When the stored count differs from the organizer's approved count, serve the organizer count or a coverage note next to `totalSubmissions`.
Add a regression check: a completed event with an announced winner list and a rank 1 prize tier has a winner at `placementRank` 1, or the record says why not.
