---
id: sd-029
service: stellar-docs
status: reported-upstream
discovered: 2026-07-11
upstreamTitle: Document Stellar RPC BACKFILL startup behavior
evidence:
  - current RPC admin and data-lake pages inspected 2026-07-11 do not explain the v25.1+ BACKFILL startup path and prerequisites
  - stellar-rpc v27.1.1 options.go defaults BACKFILL=false and SERVE_LEDGERS_FROM_DATASTORE=false
  - stellar-rpc v27.1.1 service.go and backfill.go synchronously materialize an approximate trailing window before normal ingestion
  - narrow config and ingest source tests recorded in Solo scratchpad 575 GT-54 blind process 3386
  - upstream issue filed 2026-07-14: https://github.com/stellar/stellar-docs/issues/2602
  - scope correction 2026-07-27 accepting maintainer triage https://github.com/stellar/stellar-docs/issues/2602#issuecomment-5035732543: data-lake-integration.mdx already documents datastore serving and the getLedgers-only boundary, so the original framing overstated the gap; the undocumented surface is the BACKFILL flag itself plus the stale configuring.mdx sample config
  - scope-narrowing reply posted and read back 2026-07-27: https://github.com/stellar/stellar-docs/issues/2602#issuecomment-5091976539
recurrences:
  - date: 2026-08-04
    evidence: eval/qa/results/2026-08-04T23-53-57-variantA.json q-ti-self-host-retention-backfill retrieved current configuration/data-lake material but still could not establish the BACKFILL flag, synchronous startup behavior, and prerequisites from operator documentation
---

## Finding

Current Stellar RPC administration content does not document the shipped
`BACKFILL` flag at all, and the `configuring.mdx` sample config predates it. Since v25.1, RPC can synchronously materialize approximately
its configured trailing window from a compatible datastore before normal live
ingestion, but the operator-facing pages still leave readers with the older
retention-only model.

The missing boundary is safety-relevant:

- `BACKFILL` defaults false and requires
  `SERVE_LEDGERS_FROM_DATASTORE=true` plus compatible datastore coverage;
- fresh ordinary RPC startup begins at the current history-archive tip, so
  increasing retention alone does not restore older rows;
- direct datastore fallback without materialization remains
  `getLedgers`-only, while transaction/event methods read local tables — this
  boundary is already documented in `data-lake-integration.mdx`, so it is
  context here rather than part of the gap;
- datastore/checkpoint gaps and existing local state constrain what can be
  materialized, so exact coverage should not be promised.

## Evidence

The pre-read-locked GT-54 blind lane inspected v27.1.1
`options.go`, `service.go`, `backfill.go`, database
and method handlers, then ran narrow non-mutating config/ingest tests. It
confirmed defaults of `HISTORY_RETENTION_WINDOW=120960`,
`SERVE_LEDGERS_FROM_DATASTORE=false` and `BACKFILL=false`,
with synchronous backfill before live ingestion when enabled.

The independent primary lane correctly rejected fixed storage/day and universal
backfill claims but could not resolve the current implementation from the
operator prose alone. This is distinct from sd-023, which owns stale
24-hour/seven-day event-retention wording.

## Recommendation

Add a versioned RPC startup/recovery section that:

1. lists the three current defaults;
2. contrasts ordinary fresh startup, a larger future retention window, and
   `BACKFILL` materialization, cross-linking the existing
   `data-lake-integration.mdx` treatment of direct `getLedgers` datastore
   serving rather than restating it;
3. states datastore, serve-flag, local-state, gap and checkpoint prerequisites;
4. explains which methods remain local-table-backed;
5. labels release-note storage/duration figures as dated examples rather than
   capacity guarantees.

Cross-link the section from configuration, data-lake integration and retention
method pages.
