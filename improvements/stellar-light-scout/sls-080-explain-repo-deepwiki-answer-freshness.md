---
id: sls-080
service: stellar-light-scout
status: reported-upstream
discovered: 2026-08-30
upstreamTitle: Date DeepWiki answers separately from scanned repository content
evidence:
  - repository recovery collection sha256 8800785288fa185a2c392acc2608f781ee49d5c060ea59a7f6561aedd887a565; rr-pos-horizon-max-supported-protocol; execute call 5; generatedAt 2026-08-30T23:49:33.549Z
  - 2026-08-30 independent GitHub reads of stellar/stellar-horizon internal/ingest/main.go at 2abda012 and 82660510 both define MaxSupportedProtocolVersion as 28
  - fourth collection: 1 of 9 successful scout.explainRepo answers carried a stale numeric value; the other 8 matched pinned source
  - third collection row for the same case returned 22 from archived stellar/go
  - 2026-08-31 GitHub read-back: https://github.com/Stellar-Light/stellarlight/issues/1134 is OPEN; title "Date DeepWiki answers separately from scanned repository content"; createdAt 2026-08-31T02:49:22Z; the body contains generated-by-stellar-raven, the active main source link, immutable b59517d snapshot, full evidence, and the resolution handoff
recurrences:
  - date: 2026-08-31
    evidence: repository recovery v2 collection sha256 da4a4e245b05c737023d6e858e8b8866b00375649b0a90b2be0a1b68da6424da; rr-pos-horizon-max-supported-protocol; execute call 7; generatedAt 2026-08-31T00:52:03.666Z; DeepWiki returned 25 with scannedRef 82660510; 1 of 12 successful repository answers carried a stale numeric value
  - date: 2026-08-31
    evidence: free Raven probe against the local server at port 8788 asked "Which Horizon ingestion constant pins the highest supported protocol version, and what is its value?" for stellar/stellar-horizon; DeepWiki returned MaxSupportedProtocolVersion = 25 at generatedAt 2026-08-31T01:42:10.098Z with scannedRef 82660510ecda7fd365a14d08badb9d85fa22bc32; the freshness trigger did not fire
---

## Finding

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

GitHub read back https://github.com/Stellar-Light/stellarlight/issues/1134 on 2026-08-31.
The issue is OPEN and has the expected title.
GitHub reports `createdAt: 2026-08-31T02:49:22Z`.
Its body contains `generated-by-stellar-raven`, the active `main` source link, and the immutable `b59517d` snapshot.
Its body also contains the full evidence and the resolution handoff.

## Recommendation

Add `answerAsOf` or a DeepWiki index timestamp beside `answerSource`.
When `answerSource` is `deepwiki`, state that `scannedRef` does not date the answer.
Optionally verify numeric constants in an answer against the `scannedRef` content.
