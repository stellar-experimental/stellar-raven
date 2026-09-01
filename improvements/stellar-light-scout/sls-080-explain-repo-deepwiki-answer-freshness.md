---
id: sls-080
service: stellar-light-scout
status: fixed-upstream
discovered: 2026-08-30
upstreamTitle: Date DeepWiki answers separately from scanned repository content
evidence:
  - repository recovery collection sha256 8800785288fa185a2c392acc2608f781ee49d5c060ea59a7f6561aedd887a565; rr-pos-horizon-max-supported-protocol; execute call 5; generatedAt 2026-08-30T23:49:33.549Z
  - 2026-08-30 independent GitHub reads of stellar/stellar-horizon internal/ingest/main.go at 2abda012 and 82660510 both define MaxSupportedProtocolVersion as 28
  - fourth collection: 1 of 9 successful scout.explainRepo answers carried a stale numeric value; the other 8 matched pinned source
  - third collection row for the same case returned 22 from archived stellar/go
  - 2026-09-01 GitHub read-back: https://github.com/Stellar-Light/stellarlight/issues/1134 is CLOSED COMPLETED; PR https://github.com/Stellar-Light/stellarlight/pull/1174 merged as 76cb312d6bcee5260d98720402204feb774a3be6 and added trigger phrases for the exact plain-English monitor question
  - 2026-09-01 deployed recheck: GET https://stellarlight.xyz/api/status returned apiVersion 1.9.16; GET https://stellarlight.xyz/api/repos/explain for the exact monitor question and stellar/stellar-horizon returned MaxSupportedProtocolVersion = 28 with answerSource knowledge-note, answerAsOf 2026-09-01T00:00:00Z, generatedAt 2026-09-01T19:42:19.933Z, and scannedRef 82660510ecda7fd365a14d08badb9d85fa22bc32; source at that ref defines MaxSupportedProtocolVersion uint32 = 28
recurrences:
  - date: 2026-08-31
    evidence: repository recovery v2 collection sha256 da4a4e245b05c737023d6e858e8b8866b00375649b0a90b2be0a1b68da6424da; rr-pos-horizon-max-supported-protocol; execute call 7; generatedAt 2026-08-31T00:52:03.666Z; DeepWiki returned 25 with scannedRef 82660510; 1 of 12 successful repository answers carried a stale numeric value
  - date: 2026-08-31
    evidence: free Raven probe against the local server at port 8788 asked "Which Horizon ingestion constant pins the highest supported protocol version, and what is its value?" for stellar/stellar-horizon; DeepWiki returned MaxSupportedProtocolVersion = 25 at generatedAt 2026-08-31T01:42:10.098Z with scannedRef 82660510ecda7fd365a14d08badb9d85fa22bc32; the freshness trigger did not fire
  - date: 2026-09-01
    evidence: free Raven probe against the local server asked the exact monitor question for stellar/stellar-horizon; the response returned MaxSupportedProtocolVersion = 28 with answerSource knowledge-note, generatedAt 2026-09-01T18:23:41.351Z, and scannedRef 82660510ecda7fd365a14d08badb9d85fa22bc32; source at that scannedRef defines MaxSupportedProtocolVersion uint32 = 28, so source parity holds; independent review confirmed the deployed fix and left only lifecycle cleanup in .agents/rounds/2026-09-01-free-improvements-maintenance/grok-sls080-review.md
---

## Finding

> **Fixed upstream 2026-09-01.** The deployed `1.9.16` API returns a dated source-parity answer for the exact monitor question.

`scout.explainRepo` returned a DeepWiki answer that stated `MaxSupportedProtocolVersion = 25`.
The answer ran on 2026-08-30 for `stellar/stellar-horizon`.
The repository source defines the value as `28` at `2abda012` and `82660510`.

The response included `answerSource: "deepwiki"`, `generatedAt`, `repoMeta.lastCommitAt`, and `scannedAt`.
It did not include an answer-index date.
`repoMeta.lastCommitAt` and `scannedAt` describe the code scan.
They do not date the DeepWiki answer.

## Evidence

The collection row `rr-pos-horizon-max-supported-protocol` ran `scout.explainRepo` at execute call 5.
It recorded `generatedAt: 2026-08-30T23:49:33.549Z`.
The answer claimed a maximum supported protocol value of `25`.

Independent GitHub file reads on 2026-08-30 found `MaxSupportedProtocolVersion uint32 = 28`.
The reads used the pinned commit `2abda012` and Scout's `codeVerified.scannedRef` `82660510`.
One of nine successful repository answers in the fourth collection had this stale numeric value.
The other eight matched their pinned sources.

The v2 collection reproduced the defect on 2026-08-31. Its canonical collection SHA-256 is
`da4a4e245b05c737023d6e858e8b8866b00375649b0a90b2be0a1b68da6424da`.
The same row ran `scout.explainRepo` at execute call 7.
It recorded `generatedAt: 2026-08-31T00:52:03.666Z` and `scannedRef: 82660510`.
DeepWiki again returned `25` while the scanned source defines `28`.
One of 12 successful repository answers in v2 carried a stale numeric value.
The other 11 matched their pinned sources.

The approved free probe reproduced the defect on 2026-08-31.
It asked the same Horizon question through the local Raven server at port 8788.
DeepWiki returned `MaxSupportedProtocolVersion = 25` at `2026-08-31T01:42:10.098Z`.
The response recorded `scannedRef: 82660510ecda7fd365a14d08badb9d85fa22bc32`.
The freshness trigger did not fire.

The deployed service recheck passed on 2026-09-01.
`GET https://stellarlight.xyz/api/status` returned `apiVersion: 1.9.16`.
The direct `api/repos/explain` call used the exact monitor question and `stellar/stellar-horizon`.
It returned `MaxSupportedProtocolVersion = 28` from `answerSource: knowledge-note`.
It returned `answerAsOf: 2026-09-01T00:00:00Z`.
It returned `generatedAt: 2026-09-01T19:42:19.933Z`.
It returned `scannedRef: 82660510ecda7fd365a14d08badb9d85fa22bc32`.
The source at that ref defines `MaxSupportedProtocolVersion uint32 = 28`.

GitHub read back issue https://github.com/Stellar-Light/stellarlight/issues/1134 on 2026-09-01.
The issue is closed with reason `completed`.
PR https://github.com/Stellar-Light/stellarlight/pull/1174 merged at `2026-09-01T03:02:37Z`.
Its merge commit is `76cb312d6bcee5260d98720402204feb774a3be6`.

## Recommendation

Add `answerAsOf` or a DeepWiki index timestamp beside `answerSource`.
When `answerSource` is `deepwiki`, state that `scannedRef` does not date the answer.
Optionally verify numeric constants in an answer against the `scannedRef` content.
