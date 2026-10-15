---
id: sls-093
service: stellar-light-scout
status: fixed-upstream
discovered: 2026-10-06
upstreamTitle: Repo search reports matchMode strict for a spelling-corrected query
evidence:
  - 2026-10-06 near-due golden re-verification lane observed GET /api/repos/search?q=strupey with matchMode strict and 23 rows. No row contained the token (.agents/rounds/2026-10-06-truth-maintenance.md, "Golden verdict").
  - 2026-10-09T21:09Z Scout API 1.9.72. GET /api/repos/search?q=strupey returns matchMode strict and matchModeLabel "every query term matched". It reports counts.total 23 and returns 20 rows. No serialized row contains "strupey". The row list is identical to q=stroopy.
  - 2026-10-09T21:24Z GET /api/repos/search?q=strupey&limit=100 returns all 23 rows with matchMode strict. None of the 23 serialized rows contains "strupey". The 23-row list is identical to q=stroopy&limit=100.
  - 2026-10-09T21:10Z second query. GET /api/repos/search?q=strupey%20wallet returns matchMode strict with counts.total 442. No returned row contains "strupey".
  - 2026-10-09T21:10Z controls. q=stroop returns strict with 17 of 20 rows containing the token. q=stroopy returns strict with two rows containing it (StroopyOrg/Stroopy, alejomendoza/stroopy). q=frieghter, q=sorobann, q=blendd, and q=lobstrr return weak with 0 rows. q=zzqqxxww%20wallet returns partial. So the service has no general fuzzy match, and strupey is a listed correction.
  - 2026-10-09T21:10Z GET /api/projects/search?q=strupey returns matchMode corrected. Its label begins "matched via a known spelling correction — the query token does not occur in these rows".
  - 2026-10-09 OpenAPI 1.9.72. The RepoSearchResponse.meta.matchMode enum is strict, partial, weak, all, none. It defines strict as "every query term matched". The spec defines corrected only for project search and names strupey → stroopy as the example.
  - 2026-10-09 upstream source read on Stellar-Light/stellarlight main. src/lib/search-vocabulary.ts maps strupey to strupey, stroopy, and stroop in CORE_SYNONYMS. It also lists strupey in SPELLING_CORRECTIONS. src/lib/repo-search.ts merges CORE_SYNONYMS and derives matchMode from the best row's matched-token count. It does not apply the correction check that PR 1056 added to project search.
  - Dedupe 2026-10-09. The resolved receipt sls-076 covers project search only (issue 1055, PR 1056). No active finding and no Stellar-Light/stellarlight issue covers repo search.
  - "2026-10-15 author recheck confirmed the repo-search spelling label is fixed. A distinct reviewer remains required before retirement."
  - "2026-10-15T17:42:57Z live OpenAPI reports 1.9.78. RepoSearchResponse includes corrected and documents the best-row and total-count bases. https://stellarlight.xyz/api/openapi.json"
  - "2026-10-15 resolving work: https://github.com/Stellar-Light/stellarlight/pull/1815, https://github.com/Stellar-Light/stellarlight/pull/1821, and https://github.com/Stellar-Light/stellarlight/issues/1818."
  - "2026-10-15 upstream merge commits are f9e66babb30f20607c7df749cef89985a9f6c3cd and 24b8c12aaf63f1840b7bd55c56ca4b6ebf2529f9."
  - "2026-10-15 inbound handoff came from theboycoder: https://github.com/stellar-experimental/stellar-raven/issues/287"
  - "2026-10-15T17:43:07Z q=strupey returned corrected with the identity warning. The limit=100 request returned all 23 rows without strupey."
  - "2026-10-15T17:43:08Z q=strupey%20wallet returned corrected. The stroopy and stroop%20wallet controls returned strict with a best-row label."
  - "2026-10-15T17:44:38Z original limit=5 probe returned corrected. The matching stroopy control returned strict."
  - "2026-10-15 pinned tests cover strupey, stroopy, mixed queries, literal-token controls, and schema parity. https://github.com/Stellar-Light/stellarlight/blob/f9e66babb30f20607c7df749cef89985a9f6c3cd/src/lib/__tests__/corrected-match-mode.test.ts"
  - "2026-10-15 raw responses and exact URLs are in tmp/lane-a/repos-*.raw.json. This local evidence is uncommitted."
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
The service expands `strupey` to `stroopy` and `stroop` through its synonym table.
It counts the expansion as a literal match.

Project search reports the same expansion as `matchMode: "corrected"` since the `sls-076` fix (issue 1055, PR 1056).
Its label says that the query token does not occur in the rows.
Repo search has no `corrected` mode in its contract.

An agent that reads `strict` as evidence can promote `stellar/freighter` or `StroopyOrg/Stroopy` into identity evidence.
The queried name occurs in none of the 23 serialized rows.
That is the failure `sls-076` recorded for project search.

## Evidence

Public reads on 2026-10-09 used Scout API `1.9.72`:

```sh
curl 'https://stellarlight.xyz/api/repos/search?q=strupey'
curl 'https://stellarlight.xyz/api/repos/search?q=strupey&limit=100'
curl 'https://stellarlight.xyz/api/repos/search?q=strupey%20wallet'
curl 'https://stellarlight.xyz/api/repos/search?q=stroopy'
curl 'https://stellarlight.xyz/api/repos/search?q=stroop'
curl 'https://stellarlight.xyz/api/repos/search?q=frieghter'
curl 'https://stellarlight.xyz/api/projects/search?q=strupey'
```

| query | surface | matchMode | counts.total | rows that contain every query token |
| --- | --- | --- | --- | --- |
| `strupey` | repos | strict | 23 | 0 of 20 |
| `strupey` with `limit=100` | repos | strict | 23 | 0 of 23 |
| `strupey wallet` | repos | strict | 442 | 0 of 20 |
| `stroopy` | repos | strict | 23 | 2 of 20 |
| `stroop` | repos | strict | 21 | 17 of 20 |
| `frieghter` | repos | weak | 0 | 0 |
| `zzqqxxww wallet` | repos | partial | 444 | 0 of 20 |
| `strupey` | projects | corrected | 1 | 0 of 1 |

The token check covers every field in the serialized row, including `description`, `topics`, and `knowledgeNotes`.
The index can hold text that the row does not serve.
The `stroopy` and `stroop` rows are therefore controls, not defects.
The `strupey` rows are a defect for two reasons.
The token occurs in none of the 23 serialized rows fetched with `limit=100`.
The service's own correction table identifies `strupey` as a misspelling.

The upstream source explains the behavior.
`src/lib/search-vocabulary.ts` lists `strupey` in `SPELLING_CORRECTIONS`.
Its comment says the response must never say "all keywords matched" for it.
`src/lib/repo-search.ts` merges the same synonym table.
It sets `strict` when the best row on the page matched every token after expansion.
It does not consult `SPELLING_CORRECTIONS`.

A secondary observation: `matchMode` describes the best row on the page.
`q=stroop wallet` returns `strict` with `counts.total` 442, while `q=stroop` alone has total 21.
The total therefore counts rows that match any term.
The spec text "every query term matched" does not say this.

## Recommendation

Apply `SPELLING_CORRECTIONS` in repo search as project search does.
When a row matches only through a corrected token, report `matchMode: "corrected"`.
Add a label that says the query token does not occur in the rows.
Add `corrected` to the `RepoSearchResponse.meta.matchMode` enum and description.
Add a regression test for `q=strupey` against repo search, with `q=stroopy` as the strict control.

State in the `matchMode` description that `strict` describes the best row on the page.
Or derive the label from every returned row.
Make `counts.total` consistent with the stated mode.

## Live recheck — 2026-10-15

The author repeated the original requests against OpenAPI `1.9.78`.
The `q=strupey` requests returned `matchMode: "corrected"`.
The label warned that the query token did not occur in the rows.
The `limit=100` request returned all 23 rows without `strupey`.
The original `limit=5` probe also returned `corrected`.

The `q=strupey%20wallet` request returned `corrected`.
The `q=stroopy` and `q=stroop%20wallet` controls returned `strict`.
Their labels stated that every query term matched in the best row.
The live schema included `corrected` and explained the best-row basis.
It also explained that the total counts a wider match set.

The author read the pinned correction and schema-parity tests.
The author did not run the upstream test suite.
No material residual reproduced in these live checks.
A distinct reviewer must repeat the original requests before retirement.
