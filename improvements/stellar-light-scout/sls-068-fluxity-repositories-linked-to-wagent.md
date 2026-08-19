---
id: sls-068
service: stellar-light-scout
status: reported-upstream
discovered: 2026-08-19
upstreamTitle: Correct the Fluxity repository-to-project links
evidence:
  - 2026-08-19 live GET https://stellarlight.xyz/api/repos/search?q=fluxity&limit=20 returned 4 exact Fluxity-named rows; luanlabs/fluxity.finance, luanlabs/fluxity-interface, and luanlabs/fluxity-api each had project {slug: wagent, name: Wagent}, while their descriptions identify Fluxity
  - 2026-08-19 full QA review, Solo todo 1704 and scratchpad 822 revision 92, accepted the live replay after supplementary ledger 831 revision 2 identified the saved transcript mismatch
  - dedupe: distinct from resolved sls-058, which concerned Fluxity SCF funding fields and award linkage, not repository-to-project attribution
  - upstream issue filed 2026-08-19: https://github.com/Stellar-Light/stellarlight/issues/972
---

## Finding

Scout returns three Fluxity repositories with a Wagent project link. The affected rows are
`luanlabs/fluxity.finance`, `luanlabs/fluxity-interface`, and `luanlabs/fluxity-api`.
Each row has a Fluxity name and a Fluxity description. Each row instead returns
`project.slug: "wagent"` and `project.name: "Wagent"`.

The same query returns `luanlabs/fluxity-v1-core` with the Fluxity project link. Therefore,
three of four exact Fluxity query results have a conflicting project relationship. A consumer can
use this field for project context and then attribute Fluxity source code to Wagent.

## Evidence

On 2026-08-19, the free production request below returned four rows:

```sh
curl --get 'https://stellarlight.xyz/api/repos/search' \
  --data-urlencode 'q=fluxity' \
  --data-urlencode 'limit=20'
```

`luanlabs/fluxity.finance` says it is Fluxity's landing-page repository.
`luanlabs/fluxity-interface` describes Fluxity as a token-streaming solution.
`luanlabs/fluxity-api` says it is the Fluxity API. All three return the Wagent project link.
`luanlabs/fluxity-v1-core` returns the Fluxity project link and acts as the same-query control.

The full QA review found the same relationship in the saved Scout transcript. The live replay
confirms that this is current Scout data. It is not a judge-only error. The review also checked
resolved `sls-058`. That finding covered SCF funding metadata, so it does not own this defect.

## Recommendation

Correct the repository-to-project relation for the three affected repositories. Preserve a
repository only under Wagent when source evidence supports that relationship. Add a relation-level
validation rule that compares a repository's linked project with its canonical repository metadata.

Add a regression fixture for the four exact Fluxity query results. The fixture should require the
three affected repositories to link to Fluxity. It should keep `fluxity-v1-core` as a control.
