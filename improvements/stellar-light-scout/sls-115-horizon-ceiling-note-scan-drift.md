---
id: sls-115
service: stellar-light-scout
status: reported-upstream
discovered: 2026-11-06
upstreamTitle: "Refresh or invalidate the Horizon ceiling answer when its scanned source changes"
evidence:
  - "2026-11-09T20:32:02Z original and explicit-current explainRepo controls still select MaxSupportedProtocolVersion=29, knowledge-note dated2026-10-08. New scannedRef6a13f41808586884c9a7b1beecd92088b7284070 (scan2026-11-07) defines MaxSupportedProtocolVersion uint32=30 in internal/ingest/main.go, freshly read with gh api at20:33:21Z. Still reproduces after a newer scan; open #1933 has no comments. Fixture-interface fix sls-114 does not fix answer selection. Receipts: research/audits/2026-11-09-improvements-sweep/lane-scout.md."
  - "Explicit-current control independently observed at 2026-11-06T14:10:14.641Z: asking for the value as of today at codeVerified.scannedRef, not active Mainnet protocol, still selects 29. Upstream generation 2026-11-06T14:06:53.337Z; same scan ref defines 30. Full control: research/audits/2026-11-06-remaining-sweep/other-horizon-current-tool.json; distinct review: .agents/rounds/2026-11-06-remaining-sweep/cross-review.md."
  - "2026-11-06T13:54:27.220Z authenticated scout.explainRepo for stellar/stellar-horizon, question 'Which Horizon ingestion constant pins the highest supported protocol version, and what is its value?': selected answer MaxSupportedProtocolVersion = 29, answerSource knowledge-note, answerAsOf 2026-10-08T00:00:00Z, codeVerified.scannedRef 597544b60c20f8536d532d32abca8462394874f3. Full tool receipt: research/audits/2026-11-06-remaining-sweep/other-horizon-tool.json."
  - "At that exact scannedRef, internal/ingest/main.go line 38 defines MaxSupportedProtocolVersion uint32 = 30: https://github.com/stellar/stellar-horizon/blob/597544b60c20f8536d532d32abca8462394874f3/internal/ingest/main.go#L38"
  - "The selected note cites 430a28e79b3b43c213840e45523519ca11251c0a and accurately labels its historical October 8 observation. The defect is selecting that older fact for the current-source question, not fabricating the historical value."
  - ".agents/rounds/2026-11-06-remaining-sweep/other.md and cross-review.md record author and independent live verification. This recurs after retired sls-087; its October 10 resolution remains in improvements/resolved.json."
  - upstream issue filed 2026-11-06: https://github.com/Stellar-Light/stellarlight/issues/1933
recurrences:
  - date: 2026-11-09
    evidence: "2026-11-09T20:32:02Z original and explicit-current explainRepo controls still select MaxSupportedProtocolVersion=29, knowledge-note dated2026-10-08. New scannedRef6a13f41808586884c9a7b1beecd92088b7284070 (scan2026-11-07) defines MaxSupportedProtocolVersion uint32=30 in internal/ingest/main.go, freshly read with gh api at20:33:21Z. Still reproduces after a newer scan; open #1933 has no comments. Fixture-interface fix sls-114 does not fix answer selection. Receipts: research/audits/2026-11-09-improvements-sweep/lane-scout.md."

---

## Finding

`scout.explainRepo` selects an outdated Horizon protocol ceiling for a current-source question.
The selected answer says `MaxSupportedProtocolVersion = 29`.
The source at the response's own `codeVerified.scannedRef` defines `30`.

The response labels the answer as an October 8 knowledge note.
That date is useful, but the response does not identify the conflict with its newer scanned source.
A caller can therefore use an obsolete software limit despite having current source provenance in the same response.

## Evidence

Run the free read operation:

```javascript
await scout.explainRepo({
  repo: "stellar/stellar-horizon",
  q: "Which Horizon ingestion constant pins the highest supported protocol version, and what is its value?"
});
```

The November 6 response selects `29`, with `answerSource: "knowledge-note"` and an October 8 `answerAsOf`.
Its `codeVerified.scannedRef` is `597544b60c20f8536d532d32abca8462394874f3`.
Read `internal/ingest/main.go` at that exact commit:

```go
MaxSupportedProtocolVersion uint32 = 30
```

An explicit control asks for the value as of today at `codeVerified.scannedRef`, excluding Mainnet activation.
It also selects `29`; two reviewers reproduced this response.

The note cites an older commit that defined `29`.
Preserve that fact for historical questions.
Mainnet's active protocol version is a different fact from the software's maximum supported version.
The fixture-interface classification was resolved separately as sls-114
(see `improvements/resolved.json`, entry sls-114); its fix does not resolve this answer-selection defect.

This is a new recurrence of the mechanism previously tracked by retired sls-087.
The previous resolution verified equality at its then-current scan reference; this record does not reverse that historical result.

## Recommendation

Associate curated source facts with the verified commit, file and symbol.
When a newer scan changes the value, refresh or invalidate the note's use for current-source questions.
Until reverified, return an explicit source conflict or state that the current value is unknown.
Keep the dated note available for historical questions.

Verify both the original question and an explicitly current-value question against the response's own source commit.
A one-time replacement of `29` with `30` would leave the same failure possible on the next protocol bump.
