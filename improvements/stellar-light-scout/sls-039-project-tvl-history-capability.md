---
id: sls-039
service: stellar-light-scout
status: declined-upstream
disposition: Accept provider-hosted history as the upstream design boundary; keep consumer guidance directing trend and peak questions to tvlMethodUrl and do not request duplicated in-API history without new evidence.
discovered: 2026-07-10
evidence:
  - "2026-11-09T20:31:56Z Blend and Soroswap reads still expose current TVL/provenance, not in-API history or peak decomposition. https://api.llama.fi/protocol/blend returns a Stellar series (889 points), and sls-102 now fixes Blend method URL to the parent. Keep declined-upstream: accepted provider-hosted-history boundary remains, no refile. Owner theboycoder states the boundary in #522; kalepail acknowledged it. Receipts: tmp/lane-scout.md, tmp/scout-live-curl.json."
  - Scout project rows expose tvlUSD and tvlAsOf but not a history or method URL
  - direct same-provider Blend/Soroswap series distinguish current, quarter trend, peak, and record
  - Solo scratchpad 575 GT-23 primary 3264 and blind 3267
  - upstream issue filed 2026-07-13: https://github.com/Stellar-Light/stellarlight/issues/522
  - upstream issue closed completed 2026-07-14 after exposing llamaSlugs, tvlMethodUrl, and methodology while explicitly leaving history at the provider
  - body corrected 2026-07-27: the provider/method-URL half of the original finding shipped in spec 1.7.20 (PR https://github.com/Stellar-Light/stellarlight/pull/530); only the history and metric-decomposition ask remains declined
  - 2026-08-11 production API 1.8.41 returns Blend's current TVL, `llamaSlugs`, and `tvlMethodUrl`; it still provides no in-API history, peak, record, or metric decomposition, which confirms the accepted provider-hosted-history boundary in closed #522
recurrences:
  - date: 2026-11-06
    evidence: "`/api/projects/search?q=blend&limit=100`, Soroswap control, `https://api.llama.fi/protocol/blend` — Still-repro, accepted declined boundary. Scout supplies current TVL/date/slugs/method, no history/peak decomposition. Provider API still supplies the historical series. Browser-page request to `https://defillama.com/protocol/blend-pools` returned403 (access limitation, not evidence history was removed). The wrong V1 child citation remains separately sls-102. Next: Keep declined, no refile. Next only if provider history is substantively unavailable or owner changes scope; check method URL plus provider series. Ledger: .agents/rounds/2026-11-05-truth-maintenance/scout.md."
---

## Finding

Scout's project-level `tvlUSD`/`tvlAsOf` point cannot answer a trend question
or distinguish current, quarter start/end, quarter peak, and record. Borrowed,
pool/backstop, fees, and volume can be mistaken for additive TVL.

The provenance half of this finding is **resolved**: spec 1.7.20 shipped
`llamaSlugs[]`, `tvlMethodUrl`, and `tvlMethod`, so rows now carry an
answer-visible provider/method URL. The owner accepted in-API history as out of
scope, with the time series living on the provider page. That boundary is the
declined residual recorded here.

This extends the methodology problem in sls-031 and is distinct from sls-038's
missing ecosystem-analyze TVL response: the project row exists, but its history
and metric decomposition do not.

## Recommendation

Provider/methodology URL and refresh time are live and need no further action.
The remaining (declined) ask was compact history or
current/period-start/period-peak/record fields, plus distinct metric classes for
base TVL, borrowed, pool/backstop, fees, and volume. Consumer guidance routes
trend, peak, and record questions to `tvlMethodUrl` instead. Revisit only if
provider-hosted history stops being reachable from the row.
