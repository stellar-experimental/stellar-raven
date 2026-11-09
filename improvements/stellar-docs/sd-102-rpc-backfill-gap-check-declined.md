---
id: sd-102
service: stellar-docs
status: declined-upstream
discovered: 2026-11-09
upstreamTitle: Preserve the RPC team's decision not to document backfill's local gap sanity check
disposition: "Do not re-file or send reminders. The RPC team considers internal ledger gaps a corruption sanity check, not a normal operator prerequisite. Revisit only on drift or materially new evidence."
evidence:
  - "2026-11-09 sweep (declined): Live configuring page includes ordinary fresh database/backfill behavior and intentionally omits gap error. Fresh v30.0.0 backfill source calls verifyDbGapless, accepts empty DB and errors on gaps; daemon treats backfill failure as fatal. Shaptic’s inline scope decline and approval directly verified. Recheck: https://developers.stellar.org/docs/data/apis/rpc/admin-guide/configuring.md; https://raw.githubusercontent.com/stellar/stellar-rpc/v30.0.0/cmd/stellar-rpc/internal/ingest/backfill.go"
  - "RPC-team decline by Shaptic, read directly 2026-11-09: https://github.com/stellar/stellar-docs/pull/2899#discussion_r4516284001. Shaptic approved the final patch at 2026-11-09T18:16:20Z."
  - "2026-11-09 live GET https://developers.stellar.org/docs/data/apis/rpc/admin-guide/configuring.md contains the ordinary empty-database startup explanation but no local-gap paragraph or 'gap detected' error text."
  - "https://github.com/stellar/stellar-rpc/blob/v30.0.0/cmd/stellar-rpc/internal/ingest/backfill.go lines 104–109 and 245–264: RunBackfill calls verifyDbGapless, an empty database is accepted, and internal gaps return 'db verify: gap detected in local DB: expected %d ledgers, got %d ledgers'."
  - "https://github.com/stellar/stellar-rpc/blob/v30.0.0/cmd/stellar-rpc/internal/daemon/daemon.go: backfill failure stops startup with 'failed to backfill ledgers'."
  - "Successor of the declined half of sd-053; preserve its partial-fix resolution in improvements/resolved.json. Independent author and reviewer source reads confirmed the behavior and the intentional omission on 2026-11-09."
---

## Finding

RPC backfill checks existing local ledger history for internal sequence gaps before fetching older history.
A gap returns `db verify: gap detected in local DB` and stops startup.
The configuring page intentionally omits this corruption sanity check.
Backfill does not require a pre-existing database: an empty database counts as gapless and can be created normally.

The ordinary startup and retention explanation from sd-053 is now deployed.
This successor preserves only the declined documentation request and the confirmed implementation behavior.
The predecessor's partial-fix receipt belongs in [resolved.json](../resolved.json).

## Evidence

Fresh v30.0.0 source reads on 2026-11-09 confirm the call, empty-database handling and gap error.
The live configuring page has no gap-check paragraph, as requested by the RPC team.

[Shaptic's inline review](https://github.com/stellar/stellar-docs/pull/2899#discussion_r4516284001) declines documenting the sanity check.
The review explains that local gaps indicate serious corruption and that backfill can create a database from scratch.
Shaptic subsequently approved the patch without this paragraph.
This is an owner decision about documentation scope, not a reversal of the underlying runtime fact.

## Recommendation

Accept the RPC team's documentation placement decision.
Do not re-file this request or send routine recurrence reminders.
Revisit only if implementation drift or materially new operator evidence changes the scope decision.
