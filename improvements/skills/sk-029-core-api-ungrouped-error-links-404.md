---
id: sk-029
service: skills
status: reported-upstream
discovered: 2026-10-27
upstreamTitle: Four Core API error codes have no page at the ungrouped errors/<code> URL
evidence:
  - "2026-10-27T01:05Z live sweep (orchestrator, Claude Opus 5.5; method from the independent Claude Fable 5.1 review): the errors index https://docs.trustlesswork.com/trustless-work/v2-en/api-rest/errors links 8 group pages (amounts-and-validation, auth-and-api-keys, escrow, generic-http, identity-and-wallets, platform, stellar, token). They link 211 leaf error pages. For each leaf, curl -sIL on the ungrouped errors/<code> path ended 200 for 207 codes and 404 for 4: generic-http/query-too-complex, stellar/stellar-tx-deploy-fee-above-ceiling, stellar/stellar-tx-deploy-milestones-over-cap, and stellar/stellar-tx-deploy-pre-approved. The grouped pages for those 4 codes return 200."
  - "2026-10-27 page-body check (Claude Fable 5.1 review): each of the 3 stellar-tx-deploy-* pages cites the ungrouped errors/<code> URL as its type value. The generic-http/query-too-complex page cites only its grouped URL as type."
  - "2026-10-19 maintainer statement (armandocodecr, who closed the issue) in Trustless-Work/trustlesswork-skill issue 16, comment 6279830640 (the sk-026 resolving comment): the Core API emits ungrouped …/api-rest/errors/<code-in-kebab-case> problem type URLs, and the fix is permanent redirects from those paths to the grouped pages."
  - The Core API skill at Trustless-Work/trustlesswork-skill main 80e2467f34041b9f70e66d6c2f567fc76ba9b1bb, trustless-work-dev/skills/api/v2/core-concepts.md line 214, documents the errors/<code-in-kebab-case> template for every error type.
  - Predecessor sk-026 (retired 2026-10-27; receipt in improvements/resolved.json) covered the escrow-receiver-trustline-missing and token-trustline-missing links. This finding is the residual from the sweep of every documented error page. Dedupe 2026-10-27 found no other finding and none of the 19 trustlesswork-skill issues covers these 4 codes.
  - upstream issue filed 2026-10-27: https://github.com/Trustless-Work/trustlesswork-skill/issues/20
---

## Finding

The Core API emits error `type` URLs of the form `…/api-rest/errors/<code-in-kebab-case>`.
The docs site redirects that ungrouped path to the grouped page for 207 of the 211 documented codes.
Four codes have no redirect, so the ungrouped URL returns HTTP 404.
An agent that follows the Core API skill's error-link template for these codes misses the explanation.

## Evidence

Public reads on 2026-10-27T01:05Z:

| Ungrouped URL | Result | Grouped page (200) | `type` on the grouped page |
| --- | --- | --- | --- |
| `…/api-rest/errors/stellar-tx-deploy-fee-above-ceiling` | 404 | `…/errors/stellar/stellar-tx-deploy-fee-above-ceiling` | ungrouped URL |
| `…/api-rest/errors/stellar-tx-deploy-milestones-over-cap` | 404 | `…/errors/stellar/stellar-tx-deploy-milestones-over-cap` | ungrouped URL |
| `…/api-rest/errors/stellar-tx-deploy-pre-approved` | 404 | `…/errors/stellar/stellar-tx-deploy-pre-approved` | ungrouped URL |
| `…/api-rest/errors/query-too-complex` | 404 | `…/errors/generic-http/query-too-complex` | grouped URL |
| `…/api-rest/errors/stellar-tx-failed` (control) | 200 | `…/errors/stellar/stellar-tx-failed` | — |

The base URL is `https://docs.trustlesswork.com/trustless-work/v2-en`.
The `query-too-complex` page gives its grouped URL as `type`, so the owner can confirm which form the API emits for it.
The skill template still produces the ungrouped form for that code.

Reproduce the sweep:

```sh
B=https://docs.trustlesswork.com/trustless-work/v2-en/api-rest/errors
for g in amounts-and-validation auth-and-api-keys escrow generic-http identity-and-wallets platform stellar token; do
  curl -sL "$B/$g" | grep -oE "errors/$g/[a-z0-9-]+" | sort -u
done | while read -r l; do
  code=${l##*/}
  curl -sIL -o /dev/null -w "$l %{http_code}\n" "$B/$code"
done | awk '$2!=200'
```

## Recommendation

Add permanent redirects from the 4 ungrouped paths to their grouped pages.
Add the redirect when a new error page is published, or check every documented code for a working ungrouped path.
