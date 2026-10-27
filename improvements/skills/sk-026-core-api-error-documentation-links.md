---
id: sk-026
service: skills
status: fixed-upstream
discovered: 2026-09-29
upstreamTitle: Core API skill error-documentation URLs omit the required escrow and token path groups
evidence:
  - 2026-09-29 author and independent drift reviewer read trustless-work-dev/skills/api/v2/core-concepts.md at 80e2467f34041b9f70e66d6c2f567fc76ba9b1bb. Its receiver-trustline example and generic error type pattern omit the error group path.
  - https://github.com/Trustless-Work/trustlesswork-skill/blob/80e2467f34041b9f70e66d6c2f567fc76ba9b1bb/trustless-work-dev/skills/api/v2/core-concepts.md
  - 2026-09-29 live HTTP reads returned 404 for errors/escrow-receiver-trustline-missing and errors/token-trustline-missing. The corresponding errors/escrow/escrow-receiver-trustline-missing and errors/token/token-trustline-missing pages returned 200. Evidence is .agents/rounds/2026-09-29-truth-maintenance/trustless-work-doc-links.json.
  - Dedupe 2026-09-29 found no existing skill issue for these error-documentation links. The separate beta authentication conflict remains sk-025.
  - upstream issue filed 2026-09-29: https://github.com/Trustless-Work/trustlesswork-skill/issues/16
  - "2026-10-06 issue-state snapshot: a third-party contributor (SrvFernandes) commented on 2026-10-03 with /claim #16 and opened PR 17. The PR is open, review is required, and no maintainer has replied. It corrects the two grouped URLs. It also adds auth and tx error groups and new codes, and four sampled new URLs return HTTP 404: errors/auth/authentication-required, errors/tx/tx-submit-failed, errors/escrow/escrow-condition-expired, and errors/token/token-limit-exceeded. It also replaces the beta bearer prohibition (sk-025)."
  - "2026-10-09 removal: the third-party PR 17 no longer exists. The public Trustless-Work/trustlesswork-skill repository remains accessible. A direct PR read returns HTTP 404. The contributor account SrvFernandes and its /claim comments no longer exist. This removal does not prove a deployed fix."
  - 2026-10-09 https://api.github.com/users/SrvFernandes returns HTTP 404; https://api.github.com/repos/Trustless-Work/trustlesswork-skill/issues/16/comments contains no contributor /claim comment.
  - "2026-10-19 upstream fix: armandocodecr (author association CONTRIBUTOR; closed the issue) closed issue 16 as completed with comment https://github.com/Trustless-Work/trustlesswork-skill/issues/16#issuecomment-6279830640. The fix is GitBook site configuration with no PR: 14 permanent redirects from the ungrouped errors/<code> paths, which the Core API emits as problem type URLs, to the grouped escrow/ and token/ pages. The skill text is unchanged on purpose. Inbound handoff: https://github.com/stellar-experimental/stellar-raven/issues/295"
  - "2026-10-27T00:41Z live recheck (orchestrator, Claude Opus 5.5): curl -sIL on errors/token-trustline-missing ends 200 at errors/token/token-trustline-missing, and errors/escrow-receiver-trustline-missing ends 200 at errors/escrow/escrow-receiver-trustline-missing (one redirect each). The skill at main 80e2467f34041b9f70e66d6c2f567fc76ba9b1bb keeps one literal error URL and the errors/<code-in-kebab-case> template; the literal URL now resolves."
  - "2026-10-27T00:45Z residual sweep: of the 145 grouped error pages linked from the errors index, 142 resolve at the ungrouped errors/<code> path and 3 stellar-tx-deploy-* codes return 404. That residual is the successor sk-029; the two original triggers are fixed."
recurrences:
  - date: 2026-10-06
    evidence: "trustlesswork-skill main 80e2467f34041b9f70e66d6c2f567fc76ba9b1bb still has the ungrouped URLs in core-concepts.md lines 179 and 214. Live HTTP reads returned 404 for errors/escrow-receiver-trustline-missing and errors/token-trustline-missing, and 200 for errors/escrow/escrow-receiver-trustline-missing and errors/token/token-trustline-missing. PR 17 is not merged."
---

## Finding

The Core API skill gives error-documentation URLs that return HTTP 404.
The example `ESCROW_RECEIVER_TRUSTLINE_MISSING` URL omits the `/escrow/` path group.
The generic `/errors/<code-in-kebab-case>` pattern also omits the `/token/` group for token errors.
An agent that follows the documented error link misses the available explanation.

## Evidence

The pinned `core-concepts.md` example uses this `type` value:

`https://docs.trustlesswork.com/trustless-work/v2-en/api-rest/errors/escrow-receiver-trustline-missing`

The token error example points to:

`https://docs.trustlesswork.com/trustless-work/v2-en/api-rest/errors/token-trustline-missing`

Both URLs returned HTTP 404 on 2026-09-29.
The available pages returned HTTP 200 at these URLs:

- https://docs.trustlesswork.com/trustless-work/v2-en/api-rest/errors/escrow/escrow-receiver-trustline-missing
- https://docs.trustlesswork.com/trustless-work/v2-en/api-rest/errors/token/token-trustline-missing

Those pages explain the expected error codes.
Their examples also repeat the ungrouped `type` values.
This check proves a documentation defect.
It does not establish which `type` URLs the deployed API emits.
No escrow creation or transaction call was used.

## Recommendation

Use the published grouped URLs in the skill examples and error-link guidance.
Replace the single ungrouped template with the applicable error-group paths.
Check the linked documentation examples for the same mismatch.
Keep a stable problem `type` identifier separate from a documentation link if those values differ.
If the API emits ungrouped `type` URLs, give those URLs a working documentation destination.
