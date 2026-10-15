---
id: sls-094
service: stellar-light-scout
status: reported-upstream
discovered: 2026-10-15
upstreamTitle: Project search labels a typo-distance name recovery strict
evidence:
  - 2026-10-15T18:10Z Scout API 1.9.78. GET /api/projects/search?q=frieghter&limit=5 returns matchMode strict, matchModeLabel "all keywords matched", counts.total 1, and one row, Freighter. No serialized row contains "frieghter". meta.didYouMean is {from frieghter, to Freighter, slug freighter} with the note "No project is spelled 'frieghter'. These results are for 'Freighter' … say so rather than presenting them as a match for what was asked."
  - 2026-10-15T18:10Z the same result for q=freightr (Freighter) and q=soroswapp (Soroswap). Control q=lobstr returns strict with the token present in the rows and no didYouMean.
  - 2026-10-15 upstream source at 46d6e1ad4c02a4639bbe14ed4736316fb215af5c, src/app/api/projects/search/route.ts. Lines 1280-1326 set didYouMean when a fuzzy name lookup recovers one project. Lines 1889 and 1983 then run the name tier and the token count against didYouMean.to, so the ladder reports strict. Lines 2068-2080 (the sls-076 rule) set corrected only when every row is correctionMediated through SPELLING_CORRECTIONS, so a didYouMean recovery keeps strict.
  - 2026-10-15 live OpenAPI 1.9.78 defines corrected as "the rows matched only through a known spelling correction … the query token does not occur in them". It describes didYouMean as "the results are for `to`, not for what was asked".
  - Found by the vendor-diverse challenger lane of the 2026-10-15 truth-maintenance round (.agents/rounds/2026-10-15-truth-maintenance.md) and reproduced by the orchestrator. Dedupe 2026-10-15. sls-076 (resolved) covers SPELLING_CORRECTIONS on project search. sls-093 covers repo search. Neither covers the didYouMean path.
  - upstream issue filed 2026-10-15: https://github.com/Stellar-Light/stellarlight/issues/1829
---

## Finding

`GET /api/projects/search?q=frieghter` returns `matchMode: "strict"` with the label "all keywords matched".
The only row is Freighter. No row contains the token `frieghter`.
The same response carries `meta.didYouMean`. Its note says no project has that spelling and that the rows are for Freighter.
The mode and the note contradict each other.

The `corrected` mode exists for this case. The spec defines it as rows that match only through a correction, where the query token does not occur.
The `sls-076` rule sets `corrected` only for `SPELLING_CORRECTIONS` entries.
A fuzzy-name recovery through `didYouMean` keeps `strict`.

An agent that reads `matchMode` without the note can treat Freighter as a confirmed match for a name that nobody spelled that way.
This is the failure that `sls-076` fixed for listed corrections.

## Evidence

Public reads on 2026-10-15T18:10Z, Scout API `1.9.78`:

```sh
curl 'https://stellarlight.xyz/api/projects/search?q=frieghter&limit=5'
curl 'https://stellarlight.xyz/api/projects/search?q=freightr&limit=5'
curl 'https://stellarlight.xyz/api/projects/search?q=soroswapp&limit=5'
curl 'https://stellarlight.xyz/api/projects/search?q=lobstr&limit=5'
```

| query | matchMode | matchModeLabel | rows | token in rows | didYouMean.to |
| --- | --- | --- | --- | --- | --- |
| `frieghter` | strict | all keywords matched | Freighter | no | Freighter |
| `freightr` | strict | all keywords matched | Freighter | no | Freighter |
| `soroswapp` | strict | all keywords matched | Soroswap | no | Soroswap |
| `lobstr` (control) | strict | all keywords matched | Lobstr and 3 more | yes | none |

Source, pinned at `46d6e1ad4c02a4639bbe14ed4736316fb215af5c`:
<https://github.com/Stellar-Light/stellarlight/blob/46d6e1ad4c02a4639bbe14ed4736316fb215af5c/src/app/api/projects/search/route.ts#L2068-L2080>

## Recommendation

Set `matchMode: "corrected"` when `didYouMean` is present.
Use a label that names the recovered project, for example "matched via a typo-distance name recovery: the query token does not occur in these rows".
Add a regression test for `q=frieghter` with `q=freighter` as the `strict` control.
