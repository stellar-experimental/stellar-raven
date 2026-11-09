---
id: ll-019
service: lumenloop
status: reported-upstream
discovered: 2026-07-11
evidence:
  - current manifest/inventory description for find_av_passages
  - live execute response returned a top-level array, not declared object results shape
  - rows exposed AI summary/long_summary and opaque start_offset but no transcript text
  - Upstream's `returns` text calls `created_at` the recording's date. Live rows contradict it. The field's real meaning is undocumented.
  - Solo scratchpad 575 GT-44 primary 3316 and blind 3324
  - live recheck 2026-07-13: authenticated POST returned success:true with data as a top-level array; the public detail/OpenAPI still declare data.results
  - reported upstream 2026-07-13: https://github.com/lumenloop/lumenloop-backend/issues/35
recurrences:
  - date: 2026-11-09
    evidence: "2026-11-09 sweep at 2026-11-09T20:31:09.166494+00:00: still-repro. find_av_passages data is a top-level array, while current schema declares object.results. Rows contain summaries and opaque start_offset, without transcript/playback seconds. av445 DEVCON2024 still has created_at=2026-04-02T23:21:21.744Z; returns still calls created_at recording date. Description asks to quote matched chunk text while returns says transcript never returned. Read-only exact requests and response hashes: tmp/lane-lumenloop.md; upstream issue state/comments freshly read; no maintainer comments or claimed fix."
  - date: 2026-11-06
    evidence: "2026-11-06 still-repro: LL find_av_passages passkeys smart wallets on Soroban,limit10; GET /v1/tools/find_av_passages — Actual data array, declared object.results; rows only summaries/opaque offsets, no transcript. DEVCON2024 av445 created_at2026-04-02 persists; returns still calls created_at recording date. Evidence/owner state: .agents/rounds/2026-11-05-truth-maintenance/other.md, row ll-019."
  - date: 2026-08-11
    evidence: "Live A/V output remains a top-level array despite the declared results object; issue #35 remains open."
  - date: 2026-09-02
    evidence: "The DEVCON 2024 row `av_id` 445 had `created_at` `2026-04-02T23:21:21.744Z`. Row `av_id` 1162 had `created_at` `2026-04-28T05:25:34.817Z`. The observed values do not document the field meaning. The Raven catalog correction no longer calls it a recording date."
  - date: 2026-11-02
    evidence: "GET https://api.lumenloop.com/v1/tools/find_av_passages still says created_at is \"the recording's date\". POST find_av_passages at 2026-11-02T17:18:48Z returned av_id 445 \"Workshop: Stellar | Multichain Day | DEVCON 2024\" with created_at 2026-04-02T23:21:21.744Z, and av_id 1319 \"All About Tokens & Asset Contracts | Meridian 2023\" with created_at 2026-04-29T08:50:01.168Z. The data is still a top-level array; the output_schema still declares results. Golden cases: q-soroban-av-passkeys-talk, q-gap-av-offset-not-timestamp."
---

## Finding

The A/V response contract is internally inconsistent. Documentation describes
an object containing results. The live adapter returns a top-level array. The
rows expose AI summaries and an opaque `start_offset`. They do not expose
transcript text or playback seconds.

The `returns` text calls `created_at` the recording's date. Live rows
contradict that text. The DEVCON 2024 row `av_id` 445 has `created_at`
`2026-04-02T23:21:21.744Z`. Row `av_id` 1162 has `created_at`
`2026-04-28T05:25:34.817Z`. The field meaning is undocumented.

## Recommendation

Document what `created_at` records. Expose the recording or event date as a
separate field. Publish one machine-checked response schema. If transcript text
is unavailable, remove quote and timestamp language from every operation
description and example.
