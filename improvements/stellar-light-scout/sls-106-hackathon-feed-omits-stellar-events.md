---
id: sls-106
service: stellar-light-scout
status: verified
discovered: 2026-11-02
upstreamTitle: "Hackathon feed says no event is active while a Stellar-powered challenge runs, and it omits a completed Rise In event"
evidence:
  - "2026-11-02T17:18:27Z live GET https://stellarlight.xyz/api/hackathons?status=active returned counts {curated 0, dorahacks 0, returned 0, total 0}. fallbackChannels.summary: 'No upcoming or active hackathons in stellarlight's feed right now: between events. Check live channels for the next announcement.'"
  - "2026-11-02T17:23Z live GET https://stellarlight.xyz/api/hackathons with q=istanbul, q=pro hackathon, q=velocity, q=waterloo, and q=innovation each returned total 0. The unfiltered feed (limit 100) has 27 rows: 7 curated and 20 DoraHacks. It includes curated Rise In events such as stellar-builders-camp-jaipur-2026 and apac-stellar-hackathon-2026."
  - "Active event, class A: https://uwaterloo.ca/events/events/blockchain-innovation-challenge-powered-stellar lists 'The Blockchain Innovation Challenge powered by Stellar', 'Monday, November 2, 2026 - Wednesday, November 18, 2026', host Velocity, '$15K in prizes'. https://www.velocityincubator.com/programs-events/the-blockchain-innovation-challenge-powered-by-stellar says 'A two-week student challenge to build Stellar-blockchain solutions' and 'When: Nov 2-18, 2026'."
  - "Completed event, class A: https://www.risein.com/programs/stellar-pro-hackathon lists 'Stellar Pro Hackathon', Start date Sep 18, 2026, End date Sep 20, 2026, Istanbul, 'Prize Pool $15,000', 'Presented by Stellar'. The Rise In recap https://www.risein.com/blog/stellar-pro-hackathon-153-builders-85-projects-and-a-path-to-enterprise (2026-09-30) reports 153 participants and 85 projects."
  - "OpenAPI 1.9.116 describes GET /api/hackathons as 'a merged, de-duplicated curated + live DoraHacks feed' and its x-routing says it lists 'Stellar hackathon events (curated + every Stellar organizer on DoraHacks)'."
  - "Scope note: the Velocity challenge is a university program, not a DoraHacks listing, so its omission tests curation scope. The Rise In event fits the curated set because the feed already curates other Rise In Stellar events."
  - "Dedupe 2026-11-02: resolved sls-001, sls-005, sls-016, and sls-092 cover winner placement, prize tiers, and per-event counts. None covers feed coverage or the affirmative 'between events' summary. GitHub search repo:Stellar-Light/stellarlight 'hackathon istanbul' returned 0 results."
  - "Golden consumers: eval/qa/corpus/battery cases q-scf-hackathons-active and q-scf-rfps-hackathons-live record the empty active feed."
---

## Finding

`GET /api/hackathons?status=active` returns zero rows on 2026-11-02.
Its `fallbackChannels.summary` says "No upcoming or active hackathons ... between events."
On the same day the Blockchain Innovation Challenge powered by Stellar started at the University of Waterloo.
It runs from 2026-11-02 to 2026-11-18 with 15K USD in prizes.
The feed also omits the Rise In Stellar Pro Hackathon in Istanbul, 2026-09-18 to 2026-09-20.
The feed already curates other Rise In Stellar events, so this omission is a coverage gap.

## Evidence

Read-only reproduction:

```sh
curl -sS 'https://stellarlight.xyz/api/hackathons?status=active'
curl -sS 'https://stellarlight.xyz/api/hackathons?q=istanbul'
curl -sS 'https://stellarlight.xyz/api/hackathons?limit=100'
```

The organizer pages are:

- `https://uwaterloo.ca/events/events/blockchain-innovation-challenge-powered-stellar` (Nov 2 to Nov 18, 2026).
- `https://www.risein.com/programs/stellar-pro-hackathon` (Sep 18 to Sep 20, 2026, Istanbul).

The Rise In recap reports 153 participants and 85 projects.

## Recommendation

Add the Rise In Stellar Pro Hackathon to the curated set as a completed event.
Decide whether Stellar-sponsored university challenges are in scope, and add the Velocity challenge if they are.
Change the empty-result summary to "No active events in this feed" instead of the affirmative "between events".
Keep the fallback channels, and add organizer pages such as Rise In to them.
