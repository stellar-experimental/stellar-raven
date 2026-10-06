---
id: sk-026
service: skills
status: reported-upstream
discovered: 2026-09-29
upstreamTitle: Core API skill error-documentation URLs omit the required escrow and token path groups
evidence:
  - 2026-09-29 author and independent drift reviewer read trustless-work-dev/skills/api/v2/core-concepts.md at 80e2467f34041b9f70e66d6c2f567fc76ba9b1bb. Its receiver-trustline example and generic error type pattern omit the error group path.
  - https://github.com/Trustless-Work/trustlesswork-skill/blob/80e2467f34041b9f70e66d6c2f567fc76ba9b1bb/trustless-work-dev/skills/api/v2/core-concepts.md
  - 2026-09-29 live HTTP reads returned 404 for errors/escrow-receiver-trustline-missing and errors/token-trustline-missing. The corresponding errors/escrow/escrow-receiver-trustline-missing and errors/token/token-trustline-missing pages returned 200. Evidence is .agents/rounds/2026-09-29-truth-maintenance/trustless-work-doc-links.json.
  - Dedupe 2026-09-29 found no existing skill issue for these error-documentation links. The separate beta authentication conflict remains sk-025.
  - upstream issue filed 2026-09-29: https://github.com/Trustless-Work/trustlesswork-skill/issues/16
  - "2026-10-06 issue state: a third-party contributor (SrvFernandes) commented on 2026-10-03 with /claim #16 and opened https://github.com/Trustless-Work/trustlesswork-skill/pull/17. The PR is open, review is required, and no maintainer has replied. It corrects the two grouped URLs. It also adds auth and tx error groups and new codes, and four sampled new URLs return HTTP 404: errors/auth/authentication-required, errors/tx/tx-submit-failed, errors/escrow/escrow-condition-expired, and errors/token/token-limit-exceeded. It also replaces the beta bearer prohibition (sk-025)."
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
