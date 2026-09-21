---
id: sd-053
service: stellar-docs
status: reported-upstream
discovered: 2026-09-21
upstreamTitle: State ordinary RPC startup and the local gap check in the BACKFILL section
evidence:
  - successor of sd-029. https://github.com/stellar/stellar-docs/pull/2789 fixed the narrowed sd-029 scope. Its body lists "where an ordinary fresh startup begins without `BACKFILL`" and "how datastore gaps and existing local state limit what gets materialized" as left for RPC team review, and asks maintainers to keep the issue open
  - the open upstream issue that tracks this half is https://github.com/stellar/stellar-docs/issues/2602 (open on 2026-09-21; no comment after 2026-07-27)
  - live check 2026-09-21T16:40:21Z of https://developers.stellar.org/docs/data/apis/rpc/admin-guide/configuring. The section "Backfilling History on Startup" does not state where an ordinary fresh startup begins. It does not state that a larger HISTORY_RETENTION_WINDOW alone restores no older rows. It does not state the local gap check. A search of the live llms-full.txt returned 0 matching statements
  - stellar-rpc v28.0.1 (tag commit 273f19e4fcb183b568948bd2b810abfe87150a9c) cmd/stellar-rpc/internal/ingest/service.go lines 182-191. On db.ErrEmptyDB the service reads archive.GetRootHAS() and sets nextLedgerSeq = root.CurrentLedger
  - stellar-rpc v28.0.1 cmd/stellar-rpc/internal/ingest/backfill.go lines 104-109 and 264. The comment says "It requires that no sequence number gaps exist in the local DB prior to backfilling." The error text is "db verify: gap detected in local DB: expected %d ledgers, got %d ledgers". daemon.go line 546 ends the process with "failed to backfill ledgers"
  - independent review 2026-09-21, Sol high (gpt-5.6-sol), classified both items as verified defects and the missing reverse links as optional; .agents/rounds/2026-09-21-improvements-followup.md
---

## Finding

The RPC configuring page now has the section "Backfilling History on Startup". The section
explains `BACKFILL`, but it omits two startup facts that an operator needs.

1. An ordinary fresh startup begins at the current History Archive tip. A larger
   `HISTORY_RETENTION_WINDOW` changes future retention only. It does not populate older
   transaction or event rows. An operator who only raises the window gets no older history.
2. `BACKFILL` requires a local database with no ledger-sequence gaps. RPC checks this before it
   fetches any ledger. A gap stops startup with an error. The section names one startup failure,
   the missing serve flag, but not this one.

The section does say that local ledgers, datastore coverage, and checkpoint boundaries can reduce
the fetched range. That sentence does not tell the operator that a local gap is fatal.

## Evidence

The live page was read on 2026-09-21. The `v28.0.1` source shows both behaviors. In
`service.go`, the empty-database case sets the next ledger to `root.CurrentLedger` from the
History Archive. In `backfill.go`, `verifyDbGapless` runs first and returns
`db verify: gap detected in local DB`. `daemon.go` then exits with `failed to backfill ledgers`.

The Data Lake Integration page and the `getTransactions`, `getEvents`, and `getLedgers` pages do
not link to the new section. Those pages state their own behavior correctly. The missing links are
an optional improvement and are not part of this finding.

## Recommendation

Add two short statements to "Backfilling History on Startup".

1. State that an ordinary fresh startup begins at the current History Archive tip. State that a
   larger `HISTORY_RETENTION_WINDOW` alone does not restore older transaction or event rows.
2. State that the local database must contain no ledger-sequence gaps. Give the error text
   `db verify: gap detected in local DB` as the second startup failure.

The RPC team should confirm both statements, as issue #2602 already requests for this half.
