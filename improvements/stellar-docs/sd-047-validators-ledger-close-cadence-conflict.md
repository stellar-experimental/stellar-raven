---
id: sd-047
service: stellar-docs
status: verified
discovered: 2026-08-31
upstreamTitle: The Validators introduction says ledgers close every 3-5 seconds while the Stellar Stack page says every 5-7 seconds
evidence:
  - 2026-08-31 rendered fetch of https://developers.stellar.org/docs/validators returned "Generally, nodes reach consensus, apply a transaction set, and update the ledger every 3-5 seconds."
  - 2026-08-31 raw fetch of https://raw.githubusercontent.com/stellar/stellar-docs/main/docs/validators/README.mdx (blob 37f879807c150e794578e80d2e751597938f8423, repo HEAD 21557e044aa578d6e4a5f764c788a16a6fbafef7) carries the same 3-5 sentence
  - 2026-08-31 rendered fetch of https://developers.stellar.org/docs/learn/fundamentals/stellar-stack returned "Generally, nodes reach consensus, apply a transaction set, and update the ledger every 5-7 seconds."
  - 2026-08-31 raw fetch of https://raw.githubusercontent.com/stellar/stellar-docs/main/docs/learn/fundamentals/stellar-stack.mdx (blob 06c92f8dbcd2f30e0f855bd18bf7abbc3c9e9713) carries the same 5-7 sentence
  - 2026-08-31 Horizon sample https://horizon.stellar.org/ledgers?order=desc&limit=200 (ledgers 64209159-64209358, protocol 27) gave 199 deltas with min 5 s, max 9 s, median 6 s, mean 5.693 s, and no delta below 5 s; a second sample the same day (ledgers 64209225-64209424, 13:16:30Z) gave min 5 s, max 9 s, median 6 s, mean 5.688 s
  - 2026-08-31 read of https://github.com/stellar/stellar-core/blob/0752b5176d22c8d57ed562c93038f76ab97e8285/src/ledger/NetworkConfig.h shows LEDGER_TARGET_CLOSE_TIME_MILLISECONDS initial 5000, minimum 4000, maximum 5000
  - 2026-08-31 read of https://github.com/stellar/stellar-protocol/blob/master/core/cap-0070.md shows ledgerTargetCloseTimeMilliseconds initial value 5000 and range [4000, 5000]
  - 2026-08-31 live stellarDocs.search_docs for "3-5 seconds" returned one hit (docs/validators) and for "5-7 seconds" returned one hit (stellar-stack#stellar-core); both sentences are indexed
  - 2026-08-31 gh search issues and gh search prs on stellar/stellar-docs for "3-5 seconds" returned no result
  - 2026-08-30 orchestrator fetch recorded the same two sentences in .agents/rounds/2026-08-30-golden-metadata-remainder.md
  - source case eval/qa/corpus/battery/protocol-core/q-protocol-ledger-close-time.json; its truth.verified entry dated 2026-08-31 names this finding in rootCause
  - proposer and blind re-derivation reports in .agents/rounds/2026-08-31-golden-metadata-remainder/ (matrices-lane-b-events-d1.md, review-blind-ledger-close-grok.md)
---

## Finding

Two canonical developer-docs pages state different ledger cadences with the same sentence frame.
The Validators introduction (`docs/validators/README.mdx`) says nodes update the ledger "every 3-5
seconds". The Stellar Stack page (`docs/learn/fundamentals/stellar-stack.mdx`) says "every 5-7
seconds". Both sentences are live on 2026-08-31, in rendered HTML, in raw MDX, and in the docs
search index.

The 3-5 range does not match the network. CAP-0070 sets the target close time to 5000 ms with a
legal range of 4000 to 5000 ms. The stellar-core `NetworkConfig.h` constants carry the same values.
The configured target cannot be set below 4000 ms. That range bounds the target, not observed closes.
A fresh 199-delta Pubnet sample on 2026-08-31 had no delta below 5 seconds, a median of 6 seconds, and
rare 8 to 9-second deltas.

This is a `docs-content` defect. Both strings are indexed, so search is not the cause. A reader who
opens the Validators introduction receives a cadence that neither the configured target nor the
sampled closes support.

## Evidence

The two pages were fetched on 2026-08-31 with a rendering fetch and a raw MDX fetch. Each method
returned the same sentence for each page. The raw blob ids are recorded in the frontmatter.

The Horizon sample, the CAP-0070 range, and the `NetworkConfig.h` constants were read on the same
day. Two independent lanes produced the same results without sharing notes. Their reports are
listed in the frontmatter.

No Stellar Docs issue or pull request mentions "3-5 seconds" on 2026-08-31.

## Recommendation

Change the sentence in `docs/validators/README.mdx` so it matches the Stellar Stack page. The
smallest correction is "every 5-7 seconds". A better correction names the target and the observed
cadence: nodes target a 5-second close (CAP-0070, configurable between 4 and 5 seconds), and
observed closes are usually 5 to 7 seconds.

Search the docs tree for other cadence sentences before the change so no later page contradicts
the corrected one. The Storage Strategies page ("~5-second target") and the Hubble history-ledgers
page ("~every 5 seconds") already describe the target and need no change.
