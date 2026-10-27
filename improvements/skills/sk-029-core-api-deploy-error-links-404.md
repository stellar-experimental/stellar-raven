---
id: sk-029
service: skills
status: verified
discovered: 2026-10-27
upstreamTitle: Three stellar-tx-deploy error codes have no page at the ungrouped errors/<code> URL
evidence:
  - "2026-10-27T00:45Z live scan (orchestrator, Claude Opus 5.5): the Core API errors index https://docs.trustlesswork.com/trustless-work/v2-en/api-rest/errors links 145 grouped error pages under errors/escrow/, errors/platform/, and errors/stellar/. For each page, curl -sIL on the ungrouped errors/<code> path ended 200 on the grouped page for 142 codes and 404 for 3: stellar-tx-deploy-fee-above-ceiling, stellar-tx-deploy-milestones-over-cap, and stellar-tx-deploy-pre-approved. The grouped pages errors/stellar/<code> for those 3 codes return 200."
  - "2026-10-19 maintainer statement (armandocodecr, who closed the issue) in Trustless-Work/trustlesswork-skill issue 16, comment 6279830640 (the sk-026 resolving comment): the Core API emits ungrouped …/api-rest/errors/<code-in-kebab-case> problem type URLs, and the fix is permanent redirects from those paths to the grouped pages."
  - The Core API skill at Trustless-Work/trustlesswork-skill main 80e2467f34041b9f70e66d6c2f567fc76ba9b1bb, trustless-work-dev/skills/api/v2/core-concepts.md, documents the errors/<code-in-kebab-case> template for every error type.
  - Predecessor sk-026 (resolved 2026-10-27) covered the escrow-receiver-trustline-missing and token-trustline-missing links. This finding is the residual from the distinct sweep of every grouped error page. Dedupe 2026-10-27 found no other finding or upstream issue for these 3 codes.
---

## Finding

The Core API emits error `type` URLs of the form `…/api-rest/errors/<code-in-kebab-case>`.
The docs site redirects that ungrouped path to the grouped page for 142 of the 145 documented codes.
Three `stellar-tx-deploy-*` codes have no redirect, so their `type` URL returns HTTP 404.
An agent that follows the Core API skill's error-link template for these codes misses the explanation.

## Evidence

Public reads on 2026-10-27T00:45Z:

| Ungrouped `type` URL | Result | Grouped page |
| --- | --- | --- |
| `…/api-rest/errors/stellar-tx-deploy-fee-above-ceiling` | 404 | `…/errors/stellar/stellar-tx-deploy-fee-above-ceiling` (200) |
| `…/api-rest/errors/stellar-tx-deploy-milestones-over-cap` | 404 | `…/errors/stellar/stellar-tx-deploy-milestones-over-cap` (200) |
| `…/api-rest/errors/stellar-tx-deploy-pre-approved` | 404 | `…/errors/stellar/stellar-tx-deploy-pre-approved` (200) |
| `…/api-rest/errors/stellar-tx-failed` (control) | 200 | `…/errors/stellar/stellar-tx-failed` |

The base URL is `https://docs.trustlesswork.com/trustless-work/v2-en`.
Reproduce one row:

```sh
curl -sIL -o /dev/null -w '%{http_code} %{url_effective}\n' \
  https://docs.trustlesswork.com/trustless-work/v2-en/api-rest/errors/stellar-tx-deploy-pre-approved
```

## Recommendation

Add permanent redirects from the 3 ungrouped paths to their `errors/stellar/` pages.
Add the redirect when a new error page is published, or check every documented code for a working ungrouped path.
