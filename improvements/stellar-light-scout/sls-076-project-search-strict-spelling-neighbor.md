---
id: sls-076
service: stellar-light-scout
status: verified
discovered: 2026-08-27
upstreamTitle: Do not label spelling neighbors as strict project matches
evidence:
  - 2026-08-27T18:43:35.691Z live scout.searchProjects({q:"Strupey",limit:10}) returned Stroopy.AI as the only row
  - the response reported matchMode=strict, matchModeLabel="all keywords matched", counts.returned=1, counts.total=1, and semantic=false
  - the returned project name was Stroopy.AI and its slug was stroopyai, although neither value contains Strupey
  - 2026-08-27T18:53:11.669Z independent control-arm execution reproduced the same strict result
  - both independent answering runs promoted Stroopy.AI into a history answer for the unverified Strupey identity
  - successor to resolved sls-009 because exact-name ranking improved, but strict mode now admits a non-exact spelling neighbor
  - eval/qa/results/2026-08-27T18-50-04-variantA.json in the treatment worktree
  - eval/qa/results/2026-08-27T18-59-44-variantA.json in the control worktree
  - .agents/rounds/2026-08-27-connectors-description-ab.md
---

## Finding

`scout.searchProjects({ q: "Strupey" })` returns `Stroopy.AI` as a strict
keyword match. The response says that all keywords matched.

Neither `Stroopy.AI` nor `stroopyai` contains `Strupey`. The response also
reports `semantic: false` and gives the row high confidence.

Two independent answering runs treated this result as identity evidence. Both
runs then supplied the SCF history of `Stroopy.AI` for the unverified name
`Strupey`.

Resolved finding `sls-009` covered exact names that lost ranking priority.
This successor covers a different residual. Strict mode now labels a spelling
neighbor as an exact keyword result.

## Evidence

The treatment call ran at `2026-08-27T18:43:35.691Z`. It returned one project
for `q=Strupey`:

- `name: "Stroopy.AI"`;
- `slug: "stroopyai"`;
- `matchMode: "strict"`;
- `matchModeLabel: "all keywords matched"`;
- `semantic: false`; and
- `confidence.score: 0.92` with `relevance: 1`.

The control call reproduced the same fields at `2026-08-27T18:53:11.669Z`.
Both calls returned `counts.returned: 1` and `counts.total: 1`.

The semantic directory operation handled the same query differently. It said
that no exact substring matched and returned `Stroopy.AI` only as a semantic
neighbor. The strict project search did not preserve that distinction.

## Recommendation

Require every token to match a declared indexed field before returning
`matchMode: "strict"`. Include the matched field and text span for each token.

Return spelling neighbors under a separate fuzzy or semantic mode. Do not use
`all keywords matched` when the requested token does not occur in the row.

Add `q=Strupey` as a regression control. It must not return `Stroopy.AI` under
strict mode.
