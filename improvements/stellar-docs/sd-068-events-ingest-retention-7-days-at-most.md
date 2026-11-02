---
id: sd-068
service: stellar-docs
status: verified
discovered: 2026-11-02
upstreamTitle: Events ingest guide calls getEvents retention 7 days at most; the window is configurable
evidence:
  - 2026-11-02T17:17:27Z GET https://developers.stellar.org/docs/build/guides/events/ingest returned HTTP 200 with the description "with a 7 day retention window" and "the data retention window for these events is 7 days at most"
  - stellar/stellar-docs main 7cb5e8a492706d2ae95bbb14be737fbf96100058 docs/build/guides/events/ingest.mdx lines 3 and 6; line 133 also sizes the start window with "a ledger closes every 6s"
  - the same docs commit docs/data/apis/rpc/api-reference/methods/getEvents.mdx line 10 "configured by a single history-retention-window setting with a stock default of 120960 ledgers (about 7 days, depending on ledger cadence)"
  - stellar/stellar-rpc main c436cd7ddf60d0ce10130d73ad036b6b57051d48 cmd/stellar-rpc/internal/rpcv1/config/options.go lines 306-313 define history-retention-window with DefaultValue limits.SevenDayOfLedgers and Validate positive
  - 2026-11-02T17:26:15Z https://horizon.stellar.org/ledgers?order=desc&limit=200 gave 199 close intervals of 5 seconds each
  - stellar/stellar-docs#2595 and its fix stellar/stellar-docs#2656 (merged 2026-07-21) corrected the same retention wording on getTransaction.mdx, rpc/README.mdx, and the OpenRPC getEvents and getTransaction descriptions; they did not touch docs/build/guides/events/ingest.mdx or docs/tools/lab/transaction-dashboard.mdx
  - 2026-11-02T20:07:19Z GET https://developers.stellar.org/docs/tools/lab/transaction-dashboard returned HTTP 200 with "This feature uses an RPC and RPC retains at maximum 7 days of historical data. Any transaction older than 7 days will be displayed as invalid." (stellar/stellar-docs main 5142b219 docs/tools/lab/transaction-dashboard.mdx line 18)
  - golden case q-soroban-publish-events (golden audit pass 2, 2026-11-02)
---

## Finding

The events ingest guide says that the `getEvents` retention window is "7 days at most". The window
is the configurable RPC setting `history-retention-window`. Its stock default is 120960 ledgers,
which is about 7 days. An operator can set a larger window.

The guide's Python sample also computes the start ledger with a 6-second ledger close. Mainnet
ledgers now close about every 5 seconds, so the sample's 100800 ledgers cover about 5.8 days.

The `getEvents` method page already gives the correct wording. The guide contradicts it.
stellar/stellar-docs#2656 fixed the same wording on other RPC pages but did not include this guide.
The Lab Transaction Dashboard page repeats the claim: "RPC retains at maximum 7 days of historical
data".

## Evidence

The live guide description says "with a 7 day retention window". The first paragraph says "the
data retention window for these events is 7 days at most".

The live `getEvents` page says the history is "configured by a single history-retention-window
setting with a stock default of 120960 ledgers (about 7 days, depending on ledger cadence)".

In stellar-rpc, `history-retention-window` has the default `limits.SevenDayOfLedgers`. Its only
validation is that the value is positive.

The guide line "assuming a ledger closes every 6s" gives `3600 / 6 * 24 * 7` = 100800 ledgers. On
2026-11-02, the last 199 Mainnet intervals were 5 seconds each.

## Recommendation

Change the description and the first paragraph to say that RPC keeps a configurable window,
stock 120960 ledgers (about 7 days). Link to `getHealth` for the window that a given RPC serves.

Change the sample to start from `soroban_server.get_health().oldest_ledger`, or to use 120960
ledgers. Remove the 6-second assumption.

In `docs/tools/lab/transaction-dashboard.mdx`, change "RPC retains at maximum 7 days of historical
data" to say that the RPC keeps a configurable window, with a default of about 7 days.
