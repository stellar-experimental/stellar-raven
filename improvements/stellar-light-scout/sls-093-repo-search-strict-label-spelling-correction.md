---
id: sls-093
service: stellar-light-scout
status: verified
discovered: 2026-10-06
upstreamTitle: Repo search reports matchMode strict for a spelling-corrected query
evidence:
  - 2026-10-06 near-due golden re-verification lane observed GET /api/repos/search?q=strupey with matchMode strict and 23 rows, none containing the token (.agents/rounds/2026-10-06-truth-maintenance.md, "Golden verdict").
  - 2026-10-09T21:09Z Scout API 1.9.72. GET /api/repos/search?q=strupey returns matchMode strict, matchModeLabel "every query term matched", counts.total 23, and 20 rows. No serialized row contains "strupey". The row list is identical to q=stroopy.
  - 2026-10-09T21:10Z second query. GET /api/repos/search?q=strupey%20wallet returns matchMode strict with counts.total 442 and no row containing "strupey".
  - 2026-10-09T21:10Z controls. q=stroop returns strict with 17 of 20 rows containing the token. q=stroopy returns strict with two rows containing it (StroopyOrg/Stroopy, alejomendoza/stroopy). q=frieghter, q=sorobann, q=blendd, and q=lobstrr return weak with 0 rows. q=zzqqxxww%20wallet returns partial. So the service has no general fuzzy match; strupey is a listed correction.
  - 2026-10-09T21:10Z GET /api/projects/search?q=strupey returns matchMode corrected with the label "matched via a known spelling correction — the query token does not occur in these rows; verify the identity before relying on it".
  - 2026-10-09 OpenAPI 1.9.72. RepoSearchResponse.meta.matchMode enum is strict, partial, weak, all, none, and strict is defined as "every query term matched". The spec defines corrected only for project search and names strupey → stroopy as the example.
  - 2026-10-09 upstream source read on Stellar-Light/stellarlight main. src/lib/search-vocabulary.ts maps strupey to strupey, stroopy, and stroop in CORE_SYNONYMS and lists strupey in SPELLING_CORRECTIONS. src/lib/repo-search.ts merges CORE_SYNONYMS and derives matchMode from the best row's matched-token count. It does not apply the correction check that PR 1056 added to project search.
  - Dedupe 2026-10-09. The resolved receipt sls-076 covers project search only (issue 1055, PR 1056). No active finding and no Stellar-Light/stellarlight issue covers repo search.
probe:
  type: http-text
  url: https://stellarlight.xyz/api/repos/search?q=strupey&limit=5
  expect:
    status: 200
    contains:
      - '"matchMode":"strict"'
    excludes:
      - '"matchMode":"corrected"'
---

## Finding

`GET /api/repos/search?q=strupey` returns `matchMode: "strict"` and the label "every query term matched".
No returned row contains the token `strupey`.
The rows are the same 23 rows that `q=stroopy` returns.
The service expands `strupey` to `stroopy` and `stroop` through its synonym table and counts the expansion as a literal match.

Project search reports the same expansion as `matchMode: "corrected"` since the `sls-076` fix (issue 1055, PR 1056).
Its label says that the query token does not occur in the rows.
Repo search has no `corrected` mode in its contract.

An agent that reads `strict` as evidence can promote `stellar/freighter` or `StroopyOrg/Stroopy` into identity evidence for a name that occurs nowhere in the index.
That is the failure `sls-076` recorded for project search.

## Evidence

Public reads on 2026-10-09 used Scout API `1.9.72`:

```sh
curl 'https://stellarlight.xyz/api/repos/search?q=strupey'
curl 'https://stellarlight.xyz/api/repos/search?q=strupey%20wallet'
curl 'https://stellarlight.xyz/api/repos/search?q=stroopy'
curl 'https://stellarlight.xyz/api/repos/search?q=stroop'
curl 'https://stellarlight.xyz/api/repos/search?q=frieghter'
curl 'https://stellarlight.xyz/api/projects/search?q=strupey'
```

| query | surface | matchMode | counts.total | rows that contain every query token |
| --- | --- | --- | --- | --- |
| `strupey` | repos | strict | 23 | 0 of 20 |
| `strupey wallet` | repos | strict | 442 | 0 of 20 |
| `stroopy` | repos | strict | 23 | 2 of 20 |
| `stroop` | repos | strict | 21 | 17 of 20 |
| `frieghter` | repos | weak | 0 | 0 |
| `zzqqxxww wallet` | repos | partial | 444 | 0 of 20 |
| `strupey` | projects | corrected | 1 | 0 of 1 |

The token check covers every field in the serialized row, including `description`, `topics`, and `knowledgeNotes`.
The index can hold text that the row does not serve, so the `stroopy` and `stroop` rows are controls, not defects.
The `strupey` rows are a defect, because the token occurs nowhere and the service's own correction table says so.

The upstream source explains the behavior.
`src/lib/search-vocabulary.ts` lists `strupey` in `SPELLING_CORRECTIONS` with a comment that the response must never say "all keywords matched" for it.
`src/lib/repo-search.ts` merges the same synonym table and sets `strict` when the best row on the page matched every token after expansion.
It does not consult `SPELLING_CORRECTIONS`.

A secondary observation: `matchMode` describes the best row on the page.
`q=stroop wallet` returns `strict` with `counts.total` 442, while `q=stroop` alone has total 21.
The total therefore counts rows that match any term.
The spec text "every query term matched" does not say this.

## Recommendation

Apply `SPELLING_CORRECTIONS` in repo search as project search does.
When a row matches only through a corrected token, report `matchMode: "corrected"` and a label that says the query token does not occur in the rows.
Add `corrected` to the `RepoSearchResponse.meta.matchMode` enum and description.
Add a regression test for `q=strupey` against repo search, with `q=stroopy` as the strict control.

State in the `matchMode` description that `strict` describes the best row on the page, or derive the label from every returned row.
Make `counts.total` consistent with the stated mode.
