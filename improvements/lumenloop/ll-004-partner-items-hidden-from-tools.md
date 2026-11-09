---
id: ll-004
service: lumenloop
status: reported-upstream
discovered: 2026-07-03
evidence:
  - "2026-11-09 sweep at 2026-11-09T20:31:23.400777+00:00: inconclusive. Current count mismatch does NOT reproduce: three authenticated name-only discovery checks return 21 names, anonymous returns 18, and both same-key account count checks report available=21/visible=21. No account-scoped tool was invoked. This resembles earlier July/September passing windows followed by the November 6 regression. Three same-session passes establish current behavior, not a durable correction of an intermittent defect; no owner deployment/cause explanation exists. Read-only exact requests and response hashes: research/audits/2026-11-09-improvements-sweep/lane-lumenloop.md; upstream issue state/comments freshly read; no maintainer comments or claimed fix."
  - "2026-11-06 scope/progress reconciliation: .agents/rounds/2026-11-06-remaining-sweep/other.md, row ll-004; replay arguments and response hashes in research/audits/2026-11-06-remaining-sweep/other-receipt.json."
  - 2026-09-09T02:45:05.123Z fresh name-only listing check returned 21 authenticated tools and all three account-scoped names. At 02:45:18.924Z the same key GET /v1/me returned tools.available=21 and tools.visible=21. The anonymous control returned 18 tools and none of those names. No partner descriptions or paid operation were requested.
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
  - date: 2026-11-06
    evidence: "2026-11-06 still-repro: Same-key GET /v1/tools and /v1/me; anonymous /v1/tools control; repeated twice — Both passes: authenticated18=anonymous18; account available21/visible21. Public listing now explicitly calls itself Guest lane only. No account-scoped operation called. Evidence/owner state: .agents/rounds/2026-11-05-truth-maintenance/other.md, row ll-004."
  - date: 2026-07-14
    evidence: same-key authenticated /v1/tools=18 versus /v1/me available=21 and visible=21; regression reported at https://github.com/lumenloop/lumenloop-backend/issues/42
  - date: 2026-08-11
    evidence: the partner-key `GET /v1/tools` returned 18 guest rows and omitted all three account-scoped names, while same-key `GET /v1/me` reported tools.available=21 and tools.visible=21; the anonymous control also returned 18 rows. Upstream #42 remains open; both comments are by `kalepail` and no maintainer activity is recorded.
---

## Finding

Authenticated discovery and account metadata disagree on the tool count in the
2026-11-06 check: the same key returns 18 tool names while `/v1/me` reports
21 available/visible tools. Two checks reproduced that mismatch. The anonymous
control also returns 18 names. The historical 2026-09-09 check passed with 21.

This establishes a count/scope inconsistency, not entitlement to partner details.
A guest-scoped credential may intentionally see only public names; the count
semantics and account scope need clarification before attributing the mismatch
to missing partner access. No partner detail or paid account operation was run.

## Evidence

The 2026-07-09 control returned 21 partner-visible rows from `/v1/tools`, matching
`/v1/me` (`available: 21`, `visible: 21`); the anonymous control returned the 18
public rows. The same-key 2026-07-14 re-check briefly regressed to 18 authenticated
rows while `/v1/me` still reported 21, but the later 2026-07-14 follow-up no longer
reproduced it. On 2026-07-27, authenticated `/v1/tools` again returned all 21 rows
and `/v1/me` again reported 21 available/visible tools; the anonymous control stayed
at 18. The 2026-07-27 upstream comment records that recheck. Issue #42 remains open
without a linked deployed-fix reference.

The 2026-08-11 recurrence supersedes the July pass as historical defect evidence.
The 2026-09-09 name-only check again passes all three comparisons.
One fresh passing observation does not establish that the intermittent cause is resolved.

## Recommendation

Define the scope of `available` and `visible` counts and make discovery consistent
with that scope. If authenticated guest credentials intentionally list only
public tools, expose that distinction instead of implying 21 visible results.
If the credential is entitled to additional names, restore the matching listing.
Keep the count cross-check as a drift guard; do not expose partner details merely
to equalize counts or infer a fix from one passing observation.
