---
id: ll-002
service: lumenloop
status: reported-upstream
discovered: 2026-07-03
evidence:
  - eval/qa/results/2026-07-03T03-49-35-variantA.json
  - eval/qa/results/2026-07-03T04-13-42-variantA.json
  - live re-execution against local server confirmed ~702-char extraction
  - Solo project 49, todo 822, comments 2204-2210
  - live re-verified 2026-07-06 (eval round todo 846): same thin extraction persists — long_summary 694 chars / summary 344 chars for the full Messari report; item's collection drifted research→av (get_document collection:'av', id:2207), so the original types:['research'] probe no longer surfaces it
  - https://github.com/lumenloop/lumenloop-backend/issues/22
  - filed upstream 2026-07-13 after public-repo ownership and open/closed issue deduplication; root cause remains unconfirmed
recurrences:
  - date: 2026-08-11
    evidence: `get_document({collection:"av",id:2207})` still returns summary 344 chars and long_summary 694 chars; upstream #22 remains open, with only the 2026-07-13 `kalepail` tracking comment and no maintainer activity
---

## Finding

The Messari "State of Stellar Q1 2026" AV/research item carries only ~702 chars of
extracted content. A load-bearing source is under-indexed, and the thin extraction
led an eval agent to produce a garbled derived figure: "$300M stablecoin mcap +20%
QoQ". The closest real corpus fact is $243.6M +53% YoY, from the 2026-01-13
Financial Ecosystem Update.

## Evidence

The garbled figure appears in the 2026-07-03 eval round (results files above).
Live re-execution against the local server confirmed the item's extracted content
is ~702 chars — far short of the underlying report.

## Recommendation

Full-text extraction for high-value research reports (Messari state-of-network
reports at minimum), so agents cite the report's actual figures instead of
synthesizing from fragments.
