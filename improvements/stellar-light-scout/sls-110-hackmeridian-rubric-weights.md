---
id: sls-110
service: stellar-light-scout
status: verified
discovered: 2026-11-02
upstreamTitle: "HackMeridian records omit the published rubric weights"
evidence:
  - "2026-11-02T21:31:53Z live GET https://stellarlight.xyz/api/hackathons/hackmeridian-2026: rules.judgingCriteria lists the qualitative criteria only ('Genesis on problem clarity, MVP quality, Stellar integration and continued development potential; Scale on milestones...'), rules.source https://hackmeridian.com, checkedOn 2026-10-20."
  - "2026-11-02T21:34:51Z GET https://www.hackmeridian.com/build: 'One rubric scores every project. Each criterion is scored 1–5.' and 'Track Alignment (Genesis) / Ecosystem Alignment (Scale) 20% User Value & Problem 20% Technical Execution 15% Innovation 15% Hackathon Progress 10% Market & Ecosystem Potential 10% Product Design & UX 10%'."
  - "Winner tracks (HackMeridian item R27) do not reproduce. 2026-11-02T22:04:39Z GET https://stellarlight.xyz/api/hackathons/hackmeridian-2025: six winners, every track set. Lance, Star Lends, and Panorama Block are 'Composability'; The Simple Fund, 4Bridge, and Stellar Forge are 'Open Innovation'; placementRank 1, 1, 2, 2, 3, 3. Review rv-hm 2026-11-02T21:51:33Z and the SDF blog (21:55:44Z) give the same placements. Not filed."
  - "Winner descriptions (HackMeridian item R26): the six 2025 winner rows have description null. The SDF blog gives no project descriptions, so null is honest; not filed. HackMeridian 2026 winners: Scout says 'Not announced upstream' (checked 2026-10-31); no written organizer page naming the winners was found on 2026-11-02, so no placement defect is filed for 2026."
  - "Prevalence 2026-11-02: of 27 events in GET /api/hackathons?limit=100, 10 carry rules.judgingCriteria and 17 do not. Absence elsewhere was not checked against each organizer page, so only HackMeridian 2026 is claimed as a defect."
  - "Review rv-hm 2026-11-02T21:51:31Z: hackmeridian-2026 still has qualitative rules.judgingCriteria only (source https://hackmeridian.com, checkedOn 2026-10-20). 21:55:42Z https://www.hackmeridian.com/build: 'One rubric scores every project. Each criterion is scored 1–5.'"
  - "Dedupe 2026-11-02: resolved sls-001, sls-016, and sls-092 covered placement fields, award amounts, and per-event counts; active sls-106 covers feed coverage. None covers rubric weights."
  - ".agents/TODO.md 'File the HackMeridian upstream findings' items R24, R26, and R27."
---

## Finding

The HackMeridian 2026 record gives the qualitative judging criteria only.
The organizer's Build page publishes one weighted rubric: seven criteria, each scored 1 to 5, with weights from 10% to 20%.
An agent that asks "how is HackMeridian judged" cannot give the weights from Scout.

## Evidence

Read-only reproduction:

```sh
curl -sS https://stellarlight.xyz/api/hackathons/hackmeridian-2026
curl -sS https://www.hackmeridian.com/build
```

## Recommendation

Add the weighted rubric from `https://www.hackmeridian.com/build` to `rules`, as structured criterion and weight pairs.
