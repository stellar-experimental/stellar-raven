---
id: sd-047
service: stellar-docs
status: reported-upstream
discovered: 2026-08-31
upstreamTitle: The Validators introduction says ledgers close every 3-5 seconds while the Stellar Stack page says every 5-7 seconds
evidence:
  - 2026-09-09 Raven-authored partial verification reply by kalepail: https://github.com/stellar-experimental/stellar-raven/issues/132#issuecomment-5595182816; live pages agree but the original search still returns the stale Validators record. The handoff and finding stay open. Read back after posting.
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
  - upstream issue filed 2026-08-31: https://github.com/stellar/stellar-docs/issues/2805
recurrences:
  - date: 2026-09-09
    evidence: Both live pages say 5-7 seconds at 02:46:11Z, but production Raven query 3-5 seconds still returns the stale Validators record at 02:48:09Z. The serving index updatedAt is 2026-09-08T12:03:01.745Z, before deployment. No completed post-deployment crawl proves ingestion. See .agents/rounds/2026-09-08-docs-index-execution-astra.md.
  - date: 2026-09-01
    evidence: issue #2805 remains open without comments; PR https://github.com/stellar/stellar-docs/pull/2806 is open; `gh api repos/stellar/stellar-docs/contents/<path> -H 'Accept: application/vnd.github.raw+json'` at repo HEAD 83c68f21c721905327f5db12fb84702e3a48367c found 3-5 seconds in docs/validators/README.mdx blob 37f879807c150e794578e80d2e751597938f8423 and 5-7 seconds in docs/learn/fundamentals/stellar-stack.mdx blob 06c92f8dbcd2f30e0f855bd18bf7abbc3c9e9713, so the conflict still reproduces
  - date: 2026-09-08
    evidence: PR https://github.com/stellar/stellar-docs/pull/2806 merged as ad0accbd0da545ccba12b5a01fd5dc9e387977f8 and both rendered pages now say 5-7 seconds; however, production `stellarDocs.search_docs({query:"3-5 seconds"})` still returned the pre-deploy Validators snippet at 15:49:07Z, so the original search trigger still reproduces until the daily crawler refreshes
---

## Finding

The serving search index retains the old Validators cadence as of 2026-09-09.
Both live pages contain matching 5-7 wording from PR #2806. Full verification awaits search ingestion.

## Original content finding — 2026-08-31

Two canonical developer-docs pages stated different ledger cadences with the same sentence frame.
The Validators introduction (`docs/validators/README.mdx`) said nodes update the ledger "every 3-5
seconds". The Stellar Stack page (`docs/learn/fundamentals/stellar-stack.mdx`) said "every 5-7
seconds". Both sentences were live on 2026-08-31, in rendered HTML, in raw MDX, and in the docs
search index.

The 3-5 range does not match the network. CAP-0070 sets the target close time to 5000 ms with a
legal range of 4000 to 5000 ms. The stellar-core `NetworkConfig.h` constants carry the same values.
The configured target cannot be set below 4000 ms. That range bounds the target, not observed closes.
A fresh 199-delta Pubnet sample on 2026-08-31 had no delta below 5 seconds, a median of 6 seconds, and
rare 8 to 9-second deltas.

The original defect was `docs-content`: search accurately indexed both conflicting source sentences.
The current residual is stale search ingestion after the content correction.

## Evidence

The two pages were fetched on 2026-08-31 with a rendering fetch and a raw MDX fetch. Each method
returned the same sentence for each page. The raw blob ids are recorded in the frontmatter.

The Horizon sample, the CAP-0070 range, and the `NetworkConfig.h` constants were read on the same
day. Two independent lanes produced the same results without sharing notes. Their reports are
listed in the frontmatter.

No Stellar Docs issue or pull request mentions "3-5 seconds" on 2026-08-31.

## Recommendation

The content correction is deployed. Verify a completed post-deployment crawl and corrected positive search records.
Keep the finding open while the original search trigger reproduces.

## Original content recommendation

Change the sentence in `docs/validators/README.mdx` so it matches the Stellar Stack page. The
smallest correction is "every 5-7 seconds". A better correction names the target and the observed
cadence: nodes target a 5-second close (CAP-0070, configurable between 4 and 5 seconds), and
observed closes are usually 5 to 7 seconds.

Search the docs tree for other cadence sentences before the change so no later page contradicts
the corrected one. The Storage Strategies page ("~5-second target") and the Hubble history-ledgers
page ("~every 5 seconds") already describe the target and need no change.
