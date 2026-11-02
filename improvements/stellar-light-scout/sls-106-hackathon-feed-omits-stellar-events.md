---
id: sls-106
service: stellar-light-scout
status: reported-upstream
discovered: 2026-11-02
upstreamTitle: "GET /api/hackathons omits the completed Rise In Stellar Pro Hackathon"
evidence:
  - "2026-11-02T17:18:27Z live GET https://stellarlight.xyz/api/hackathons?status=active returned counts {curated 0, dorahacks 0, returned 0, total 0}. fallbackChannels.summary: 'No upcoming or active hackathons in stellarlight's feed right now: between events. Check live channels for the next announcement.'"
  - "2026-11-02T17:23Z live GET https://stellarlight.xyz/api/hackathons with q=istanbul, q=pro hackathon, q=velocity, q=waterloo, and q=innovation each returned total 0. The unfiltered feed (limit 100) has 27 rows: 7 curated and 20 DoraHacks. It includes curated Rise In events such as stellar-builders-camp-jaipur-2026 and apac-stellar-hackathon-2026."
  - "Active event, class A: https://uwaterloo.ca/events/events/blockchain-innovation-challenge-powered-stellar lists 'The Blockchain Innovation Challenge powered by Stellar', 'Monday, November 2, 2026 - Wednesday, November 18, 2026', host Velocity, '$15K in prizes'. https://www.velocityincubator.com/programs-events/the-blockchain-innovation-challenge-powered-by-stellar says 'A two-week student challenge to build Stellar-blockchain solutions' and 'When: Nov 2-18, 2026'."
  - "Completed event, class A: https://www.risein.com/programs/stellar-pro-hackathon lists 'Stellar Pro Hackathon', Start date Sep 18, 2026, End date Sep 20, 2026, Istanbul, 'Prize Pool $15,000', 'Presented by Stellar'. The Rise In recap https://www.risein.com/blog/stellar-pro-hackathon-153-builders-85-projects-and-a-path-to-enterprise (2026-09-30) reports 153 participants and 85 projects."
  - "OpenAPI 1.9.116 describes GET /api/hackathons as 'a merged, de-duplicated curated + live DoraHacks feed' and its x-routing says it lists 'Stellar hackathon events (curated + every Stellar organizer on DoraHacks)'."
  - "Scope note: the Velocity challenge is a university program, not a DoraHacks listing, so its omission tests curation scope. The Rise In event fits the curated set because the feed already curates other Rise In Stellar events."
  - "Dedupe 2026-11-02: resolved sls-001, sls-005, sls-016, and sls-092 cover winner placement, prize tiers, and per-event counts. None covers feed coverage or the feed-scoped 'between events' summary. GitHub search repo:Stellar-Light/stellarlight 'hackathon istanbul' returned 0 results."
  - "Golden consumers: eval/qa/corpus/battery cases q-scf-hackathons-active and q-scf-rfps-hackathons-live record the empty active feed."
  - "2026-11-02T22:38Z recheck: curl -sS --max-time 50 'https://stellarlight.xyz/api/hackathons?status=active' returned HTTP 200 with counts.total=0. curl -sS --max-time 50 'https://stellarlight.xyz/api/hackathons?limit=100' returned HTTP 200 with 27 rows: 7 curated and 20 DoraHacks. Queries q=istanbul, q=waterloo, and q=innovation each returned HTTP 200 with counts.total=0."
  - "2026-11-02T22:38Z: curl -sS --max-time 50 https://www.risein.com/programs/stellar-pro-hackathon returned HTTP 200. It identifies Stellar Pro Hackathon, Istanbul, Sep 18 to Sep 20 2026, Prize Pool $15,000, and Presented by Stellar. The completed event is absent from the full feed."
  - "2026-11-02T22:38Z: curl -sS --max-time 50 https://uwaterloo.ca/events/events/blockchain-innovation-challenge-powered-stellar returned HTTP 200. It gives November 2 to November 18, 2026 and $15K in prizes. The Velocity organizer page also returned HTTP 200 and states Nov 2-18, 2026. This university challenge tests curation scope; it is not evidence of a missing DoraHacks listing."
  - "2026-11-02 calibration: grep of curated-hackathons.ts confirms existing Rise In programs and no Istanbul or Waterloo row. Grep of hackathons/route.ts confirms that the summary already says 'in stellarlight's feed'. It does not assert global absence. Its additional 'between events' wording can still imply an ecosystem schedule. Remove that inference as an optional wording improvement. No first-bad version or dependency-based snippet claim applies."
  - "2026-11-02 dedupe: gh search issues and gh search prs searched Stellar-Light/stellarlight for 'hackathon istanbul', 'between events', and Waterloo, across all states. No matching issue appeared. Merged PR 1797 uses 'between events' for analytics comparisons, not feed completeness. rg over improvements/ and improvements/resolved.json found resolved sls-001, sls-005, sls-016, and sls-092. Active sls-110 concerns rubric weights, not feed coverage. Intake resolves to Stellar-Light/stellarlight without an override."
  - upstream issue filed 2026-11-02: https://github.com/Stellar-Light/stellarlight/issues/1917
---

## Finding

`GET /api/hackathons` omits the completed Rise In Stellar Pro Hackathon in Istanbul.
The event ran from 2026-09-18 to 2026-09-20 with a 15000 USD prize pool.
The organizer page says "Presented by Stellar".
The feed already curates other Rise In Stellar events.
A reader cannot find this completed event through the feed or an Istanbul query.

The active feed also omits the University of Waterloo's Blockchain Innovation Challenge powered by Stellar.
That challenge runs from 2026-11-02 to 2026-11-18 with 15000 USD in prizes.
Its omission needs a curation-scope decision because it is a university program outside DoraHacks.
The empty-result summary already limits its claim to "stellarlight's feed".
Its additional "between events" phrase does not establish that the wider ecosystem has no active event.

## Evidence

Read-only reproduction:

```sh
curl -sS --max-time 50 'https://stellarlight.xyz/api/hackathons?status=active'
curl -sS --max-time 50 'https://stellarlight.xyz/api/hackathons?q=istanbul'
curl -sS --max-time 50 'https://stellarlight.xyz/api/hackathons?limit=100'
curl -sS --max-time 50 'https://stellarlight.xyz/api/hackathons?q=waterloo'
curl -sS --max-time 50 'https://stellarlight.xyz/api/hackathons?q=innovation'
curl -sS --max-time 50 https://www.risein.com/programs/stellar-pro-hackathon
curl -sS --max-time 50 https://uwaterloo.ca/events/events/blockchain-innovation-challenge-powered-stellar
```

All commands returned HTTP 200 on 2026-11-02.
The active feed and the three text queries returned zero rows.
The unfiltered feed returned 27 rows: 7 curated and 20 DoraHacks.
The full feed contains neither event.
The organizer pages confirm the dates and prize pools above.

## Recommendation

Add the Rise In Stellar Pro Hackathon to the curated set as a completed event.
Use the organizer page for its dates, location, and prize pool.
Decide separately whether Stellar-sponsored university challenges belong in the curated set.
Add the Waterloo challenge if that scope includes it.

As an optional wording correction, remove "between events" from the empty-feed summary.
Keep the summary scoped to the selected status and this feed.
