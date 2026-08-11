---
id: ll-004
service: lumenloop
status: reported-upstream
discovered: 2026-07-03
evidence:
  - live regression re-check 2026-07-14: authenticated partner-tier GET /v1/tools returned the same 18 rows as the anonymous control and omitted list_my_research, request_research, and research_result, while same-key GET /v1/me reported tools.available=21 and tools.visible=21
  - upstream regression issue filed 2026-07-14: https://github.com/lumenloop/lumenloop-backend/issues/42
  - research/services/lumenloop.md (documented quirk)
  - Solo project 49, todo 822, comments 2204-2210
  - live re-check 2026-07-09: authenticated partner-tier GET /v1/tools returned all 21 available tools, including list_my_research, request_research, and research_result; GET /v1/me independently reported tools.available=21 and tools.visible=21
  - anonymous control 2026-07-09: unauthenticated GET /v1/tools returned the intended 18 public tools, confirming tier-aware visibility rather than the former authenticated-list omission
  - 2026-07-14 follow-up after the regression stopped reproducing, requesting deployed fix context: https://github.com/lumenloop/lumenloop-backend/issues/42#issuecomment-4971409286
  - live re-check 2026-07-27: authenticated partner-tier GET /v1/tools returned 21 rows including list_my_research, request_research, and research_result; same-key GET /v1/me reported tools.available=21 and tools.visible=21
  - anonymous control 2026-07-27: unauthenticated GET /v1/tools returned 18 public tools and omitted the three account-scoped tools
  - 2026-07-27 follow-up: https://github.com/lumenloop/lumenloop-backend/issues/42#issuecomment-5092399001
recurrences:
  - date: 2026-07-14
    evidence: same-key authenticated /v1/tools=18 versus /v1/me available=21 and visible=21; regression reported at https://github.com/lumenloop/lumenloop-backend/issues/42
  - date: 2026-08-11
    evidence: the partner-key `GET /v1/tools` returned 18 guest rows and omitted all three account-scoped names, while same-key `GET /v1/me` reported tools.available=21 and tools.visible=21; the anonymous control also returned 18 rows. Upstream #42 remains open; both comments are by `kalepail` and no maintainer activity is recorded.
---

## Finding

The 2026-07-14 partner-listing regression stopped reproducing later that day and
remained absent on 2026-07-27: authenticated `/v1/tools` and `/v1/me` both show
21 available tools, while the anonymous listing correctly shows 18 public tools.
Keep this finding `reported-upstream` until upstream links the deployed fix and
closes #42. Retirement needs that resolution because the defect flapped within a
single day on 2026-07-14.

## Evidence

The 2026-07-09 control returned 21 partner-visible rows from `/v1/tools`, matching
`/v1/me` (`available: 21`, `visible: 21`); the anonymous control returned the 18
public rows. The same-key 2026-07-14 re-check briefly regressed to 18 authenticated
rows while `/v1/me` still reported 21, but the later 2026-07-14 follow-up no longer
reproduced it. On 2026-07-27, authenticated `/v1/tools` again returned all 21 rows
and `/v1/me` again reported 21 available/visible tools; the anonymous control stayed
at 18. The 2026-07-27 upstream comment records that recheck. Issue #42 remains open
without a linked deployed-fix reference.

## Recommendation

Keep the authenticated listing and `/v1/me` counts consistent, and link the deployed
fix before closing #42. Consumers may retain the count cross-check as a drift guard;
no two-endpoint union is currently needed to discover partner-tier tool names.
