---
id: sls-087
service: stellar-light-scout
status: verified
discovered: 2026-09-29
upstreamTitle: Horizon current protocol-ceiling answers retain 28 after the scanned source defines 29
evidence:
  - 2026-09-29 explicit current-value query repeated the same stale note at 19:35:27.140Z. The question was What is the current value of MaxSupportedProtocolVersion in internal/ingest/main.go? Evidence is .agents/rounds/2026-09-29-truth-maintenance/horizon-current-query.json.
  - 2026-09-29 original sls-080 monitor re-execution at 19:32:18.708Z returned MaxSupportedProtocolVersion = 28 with answerSource knowledge-note and answerAsOf 2026-09-01T00:00:00Z. The response scannedRef is 430a28e79b3b43c213840e45523519ca11251c0a. That same source defines MaxSupportedProtocolVersion uint32 = 29 at internal/ingest/main.go line 38. Evidence is .agents/rounds/2026-09-29-truth-maintenance/horizon-monitor.json.
  - https://github.com/stellar/stellar-horizon/blob/430a28e79b3b43c213840e45523519ca11251c0a/internal/ingest/main.go#L38
  - The source commit message is Protocol 29 Support; its commit date is 2026-09-23T16:34:31Z.
  - The note cites master while the repository default branch is main. Independent review verified that the GitHub browser link redirects successfully. The contents API ref read returned 404; that does not establish a broken browser link.
  - Dedupe 2026-09-29 found only the closed predecessor for MaxSupportedProtocolVersion. Its retired Raven identity is sls-080 in improvements/resolved.json. This record uses a new identity and preserves that receipt.
---

## Finding

Scout returns a stale Horizon protocol ceiling for a current-source question.
The answer states `MaxSupportedProtocolVersion = 28`.
The response's own `codeVerified.scannedRef` defines `MaxSupportedProtocolVersion uint32 = 29`.
The source gained Protocol 29 support on 2026-09-23.

The answer labels the note as dated 2026-09-01.
That date preserves the historical statement's scope.
It does not answer the current-value question against the newer scanned source.
The response also tells readers that the dated fact wins over the separate walkthrough.
An agent can therefore retain the older value without checking the newer source.

This is a freshness regression after the `sls-080` resolution.
It does not prove that DeepWiki itself returns the older value.
It does not change the correctness of the historical 2026-09-01 observation.

## Evidence

Read-only reproduction:

```sh
curl -fsSG https://stellarlight.xyz/api/repos/explain \
  --data-urlencode 'repo=stellar/stellar-horizon' \
  --data-urlencode 'q=Which Horizon ingestion constant pins the highest supported protocol version, and what is its value?'
```

Inspect `answer`, `answerSource`, `answerAsOf`, and `codeVerified.scannedRef`.
Fetch `internal/ingest/main.go` at that exact `scannedRef`.
Compare the answer with `MaxSupportedProtocolVersion` in the fetched source.

The observed answer was `28`; the scanned source value was `29`.
The source SHA-256 was `8ea8c735f70863f0df17deaf4452ab0858ca0609d21be6ea0cc046976bd6db59`.
The note uses a mutable branch link rather than the source commit behind its dated observation.

## Recommendation

Refresh the Horizon note against the current source and pin its source link to a commit.
Retain the dated historical value only when the caller requests that historical scope.
When the scanned source advances, reverify version-sensitive notes before using them for current-value answers.
If verification is unavailable, disclose the stale note and direct the caller to the newer source.
Do not instruct the caller to prefer an older note over newer primary-source evidence.
