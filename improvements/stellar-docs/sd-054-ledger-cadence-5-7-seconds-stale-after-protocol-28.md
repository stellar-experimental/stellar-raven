---
id: sd-054
service: stellar-docs
status: reported-upstream
discovered: 2026-10-01
upstreamTitle: Update the ledger cadence on the Stellar Stack and Validators pages from 5-7 seconds to about 5 seconds
evidence:
  - live source read 2026-10-01 of stellar/stellar-docs at 109d95d18fe151ac40cc2fd5f5cc769660e51fcc. docs/learn/fundamentals/stellar-stack.mdx line 22 and docs/validators/README.mdx line 10 each say "Generally, nodes reach consensus, apply a transaction set, and update the ledger every 5-7 seconds." Both rendered pages carry the same sentence
  - post-upgrade sample 1, read 2026-10-01 from https://horizon.stellar.org/ledgers?cursor=276846917520982016&order=asc&limit=200. Ledgers 64458447 to 64458646 (Protocol 28) gave 199 closed_at deltas of 5 seconds each
  - post-upgrade sample 2, read 2026-10-01T18:55Z from https://horizon.stellar.org/ledgers?order=desc&limit=200. Ledgers 64718827 to 64719026 (Protocol 29) gave 199 closed_at deltas of 5 seconds each
  - pre-upgrade sample, read 2026-10-01 from https://horizon.stellar.org/ledgers?cursor=276846917520982016&order=desc&limit=200. Ledgers 64458246 to 64458445 (Protocol 27) gave a 5.553-second mean (90 deltas of 5 s, 108 of 6 s, 1 of 7 s). An independent reviewer measured the same pre-upgrade and post-upgrade samples the same day
  - rounded interval means, read 2026-10-01 from https://horizon.stellar.org/ledgers/{sequence} at 15,000-ledger steps. Each window from ledger 64463336 (2026-09-16T23:47:36Z) to 64718336 has a mean that rounds to 5.000 seconds. The windows from 2026-09-01 to 2026-09-16 have means from 5.396 to 5.702 seconds. A rounded mean does not show that every interval is 5 seconds
  - endpoint arithmetic from the same endpoint. The first Protocol 28 ledger is 64458446, closed 2026-09-16T17:00:06Z. The first Protocol 29 ledger is 64717645, closed 2026-10-01T17:00:07Z. Those 259,199 intervals span 1,296,001 seconds. A constant 5-second interval spans 1,295,995 seconds, so the period contains 6 more seconds. The intervals are about 5 seconds, not exactly 5 seconds in every case
  - network setting read 2026-10-01 with `stellar network settings --network mainnet --output json`. scp_timing.ledger_target_close_time_milliseconds is 5000. The target is a network setting. It is not a guarantee for each ledger
  - https://stellar.org/blog/developers/adapter-protocol-28-upgrade-guide (last updated 2026-08-12) says "Protocol 28 introduces a new feature to make ledgers close faster and reduce close time variance."
  - repeated-prose check 2026-10-01 over docs/ at the same commit. Only the two pages above say 5-7 seconds. Twenty-seven other files say about 5 seconds, for example docs/build/guides/storage/storage-strategies.mdx ("today's ~5-second target close time"), docs/tools/cli/agent-cli/guides/delegate-spending.mdx ("roughly every 5 seconds"), docs/data/apis/horizon/admin-guide/configuring.mdx ("each ledger being approximately 5 seconds"), and the Hubble data dictionary ("Ledgers are expected to close ~every 5 seconds")
  - history. stellar/stellar-docs PR 2806 (merged 2026-09-08, closing issue 2805) set the current 5-7 seconds wording on the Validators page. Its body cites a Protocol 27 sample with a 6-second median. sd-047 in improvements/resolved.json records that change. Protocol 28 activated eight days after the merge
  - upstream search 2026-10-01 on stellar/stellar-docs for "5-7 seconds" and "close time" found no cadence report newer than issue 2805 and PR 2806. Issue 2883 cites issue 2805 as history for a link-health proposal; it is not a cadence report
  - eval/qa/corpus/battery/protocol-core/q-protocol-ledger-close-time.json already accepts either figure when the answer dates it or names its source (truth.verified 2026-10-01). No golden change is needed for this finding
  - probe run 2026-10-01 with `npm run improvements:probes -- --service stellar-docs`; the result is in .agents/rounds/2026-10-01-backlog-closeout/golden-followups.md. The probe reads the Stellar Stack page only and proves text presence, not the cadence. A missing match is a review signal; resolution must read both rendered pages and repeat the live cadence check
  - upstream issue filed 2026-10-01: https://github.com/stellar/stellar-docs/issues/2889
probe:
  type: http-text
  url: https://raw.githubusercontent.com/stellar/stellar-docs/main/docs/learn/fundamentals/stellar-stack.mdx
  expect:
    status: 200
    contains:
      - "update the ledger every 5-7 seconds"
---

## Finding

Two pages say that the network updates the ledger "every 5-7 seconds": the Stellar Stack page and
the Validators introduction. The sampled Mainnet intervals are about five seconds after
Protocol 28. Both 199-delta post-upgrade samples contain five-second deltas.

This is a precision update. It is not a demonstrated contradiction, because five seconds is
inside the documented range. The wider range is less precise than the current observations. A
five-second target gives readers a clearer estimate. Twenty-seven other Docs files already say
about 5 seconds.

stellar/stellar-docs PR 2806 (merged 2026-09-08, closing issue 2805) set the current wording. It
matched the samples of that date. Protocol 28 activated on 2026-09-16, after that merge.

This is a `docs-content` finding. Both pages undertake to state the cadence.

## Evidence

The two sentences are in `docs/learn/fundamentals/stellar-stack.mdx` and
`docs/validators/README.mdx` at commit `109d95d1`.

The 199 intervals before the first Protocol 28 ledger, 64458446, have a 5.55-second mean. The 199
intervals after it are 5 seconds each. A 200-ledger sample on 2026-10-01, after Protocol 29
activated, also gave 199 intervals of 5 seconds each.

The interval means over 15,000-ledger windows since 2026-09-16T23:47Z round to 5.000 seconds. A
rounded mean does not show that every interval is 5 seconds. The period from the first Protocol 28
ledger to the first Protocol 29 ledger is 6 seconds longer than constant 5-second intervals. The
`closed_at` values are consensus close times.

The Mainnet setting `ledger_target_close_time_milliseconds` is 5000. The target is a network
setting, and it is not a guarantee for each ledger. The Protocol 28 upgrade guide says that
Protocol 28 makes ledgers close faster and reduces close-time variance. This record does not claim
which change caused the new cadence.

To reproduce the live check, read `https://horizon.stellar.org/ledgers?order=desc&limit=200`, sort
the records by `sequence`, and subtract adjacent `closed_at` values.

## Recommendation

Change both sentences to say that nodes update the ledger about every 5 seconds. Add that the
target close time is a network setting, so the value can change and no single ledger is
guaranteed to close in that time. The storage strategies page already uses this wording: "today's
~5-second target close time".

Optional: link the sentence to the network settings reference, so that the page does not need a
new number after each protocol change.
