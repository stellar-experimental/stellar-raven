---
id: sls-060
service: stellar-light-scout
status: reported-upstream
discovered: 2026-08-04
upstreamTitle: Show closed status and replace funding CTA on closed RFP pages
evidence:
  - 2026-08-04 https://stellarlight.xyz/api/rfps returned Hummingbot Integration with status closed and explained that closed RFPs are no longer fundable
  - 2026-08-04 https://stellarlight.xyz/ideas/hummingbot-integration rendered an unconditional "Apply for Funding" / "Ready to build this?" call to action without a closed-status warning
  - no duplicate in sls-007, sls-014, or sls-045; those records concern round provenance, counts, or metadata rather than status-aware page actions
  - full QA round Todo 1346 c3606 and solo://proj/49/scratchpad/truth-maintenance-20--761
  - 2026-08-05 API recheck: https://stellarlight.xyz/api/rfps returns Hummingbot Integration with status closed and says closed RFPs are past rounds and no longer fundable
  - 2026-08-05 rendered-page recheck: https://stellarlight.xyz/ideas/hummingbot-integration still renders Apply for Funding and Ready to build this? with no closed status or quarter boundary
  - upstream issue filed 2026-08-05: https://github.com/Stellar-Light/stellarlight/issues/766
probe:
  type: http-text
  url: https://stellarlight.xyz/ideas/hummingbot-integration
  expect:
    status: 200
    contains:
      - Apply for Funding
---

## Finding

A closed Scout RFP detail page retains an unconditional funding application
call to action. The API marks Hummingbot Integration closed and says closed
briefs are past rounds and no longer fundable, while the matching detail page
still invites the reader to apply without displaying that boundary.

## Evidence

The API and rendered detail page were read directly on 2026-08-04:

- https://stellarlight.xyz/api/rfps
- https://stellarlight.xyz/ideas/hummingbot-integration

The contradiction is within Scout's own current surfaces; it does not depend on
an inferred round date or third-party status.

## Recommendation

Render the RFP status on detail pages and suppress or replace the application
CTA when the brief is closed. A closed page should point to current open briefs
or explain that the historical brief is no longer fundable.
