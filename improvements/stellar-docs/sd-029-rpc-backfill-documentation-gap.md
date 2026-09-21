---
id: sd-029
service: stellar-docs
status: fixed-upstream
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
  - partial fix deployed, live check 2026-09-21T16:33:42Z: https://github.com/stellar/stellar-docs/pull/2789 merged as 9d71821f8405c262dec974da53da834604fd63ca on 2026-09-14. The live configuring page now has the section "Backfilling History on Startup". It states the flag, v25.1.0, the default false, the synchronous order, the 120960-ledger target, the coverage limits, the SERVE_LEDGERS_FROM_DATASTORE prerequisite, and the exact startup error. The sample config contains "# BACKFILL = false" and "# SERVE_LEDGERS_FROM_DATASTORE = false". Docs search for "RPC BACKFILL startup history" returns the new section first. The narrowed 2026-07-27 scope no longer reproduces
  - the PR body asks maintainers to keep issue #2602 open for the startup-behavior wording, and #2602 is open on 2026-09-21. sd-053 holds the two verified residuals. This record retires through the resolver after the #2602 verification comment is posted; see .agents/rounds/2026-09-21-improvements-followup.md
  - status moved to fixed-upstream on 2026-09-21 for the narrowed 2026-07-27 scope; the golden caution in eval/qa/corpus/battery/tooling-infra/q-ti-self-host-retention-backfill.json now names the 2026-09-14 fix date
  - independent review 2026-09-21, Sol high (gpt-5.6-sol) plus a second author-side pass: narrowed scope FIXED-AND-DEPLOYED, full recommendation PARTIALLY-FIXED; every live BACKFILL claim matches stellar-rpc v28.0.1 options.go
recurrences:
  - date: 2026-08-11
    evidence: live RPC Docs search for BACKFILL returns Hubble backfill pages, not RPC operator guidance; configuring.mdx still contains neither BACKFILL nor SERVE_LEDGERS_FROM_DATASTORE. Issue #2602 remains open; the latest maintainer activity is ElliotFriend's 2026-07-21 scope confirmation, followed by Raven's narrowing reply.
  - date: 2026-08-04
    evidence: eval/qa/results/2026-08-04T23-53-57-variantA.json q-ti-self-host-retention-backfill retrieved current configuration/data-lake material but still could not establish the BACKFILL flag, synchronous startup behavior, and prerequisites from operator documentation
---

## Finding

State on 2026-09-21: PR #2789 documents the flag and refreshes the sample config. This record is a
retirement candidate. The remaining startup-behavior gaps are in `sd-053`. The text below is the
original finding.

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
