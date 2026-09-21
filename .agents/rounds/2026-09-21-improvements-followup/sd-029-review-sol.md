# CONTRADICTIONS OF A "FIXED" CONCLUSION

These contradictions apply to the full recommendation. They do not contradict the narrowed 2026-07-27 scope.

- Pull request #2789 says it addressed only "the mechanical half of #2602."
- The pull request says, "I did not write" the startup and coverage wording.
- It lists three omitted subjects:
  - "where an ordinary fresh startup begins without `BACKFILL`"
  - "how datastore gaps and existing local state limit what gets materialized"
  - "whether release-note storage figures should be labelled as dated examples"
- It concludes, "Please keep #2602 open for that half."
- Issue #2602 remains `OPEN` as of 2026-09-21.
- The issue has no post-merge deployment result or resolution comment.
- The deployed page does not explain ordinary startup without `BACKFILL`.
- The deployed page does not state that a larger retention window alone cannot restore older rows.
- The deployed page does not state that an existing local database must be gapless.
- The Data Lake Integration page does not mention or link to the new `BACKFILL` section.
- The three retention-related method pages do not link to the new section.

# VERDICT

## (i) Narrowed scope: FIXED-AND-DEPLOYED

The 2026-07-27 evidence narrowed the defect to two items.

1. The operator documentation omitted the `BACKFILL` flag.
2. The `configuring.mdx` sample omitted `BACKFILL` and `SERVE_LEDGERS_FROM_DATASTORE`.

The live page now fixes both items. The deployed text also covers more than the narrowed scope.

The narrowed finding is eligible for retirement after the required cleanup steps.

Retirement is not complete now. A successor must preserve the verified residuals below.

The retirement workflow must also reconcile local references and append a resolved receipt.

The workflow must post the required live result on issue #2602. This review did not post anything.

## (ii) Full recommendation: PARTIALLY-FIXED

The deployed section covers the flag, version, defaults, synchronous behavior, target, and most coverage limits.

It also links from configuration to Data Lake Integration.

It does not complete the ordinary-startup contrast. It does not document the gapless local-state prerequisite.

It does not add the requested reverse and method-page cross-links.

Recommendation item status:

| Item | Result | Reason |
|---|---|---|
| 1. List three defaults | Fixed | The page shows `BACKFILL=false`, `SERVE_LEDGERS_FROM_DATASTORE=false`, and `HISTORY_RETENTION_WINDOW=120960`. |
| 2. Contrast startup modes | Partial | The page explains `BACKFILL`, but not ordinary fresh startup or non-retroactive retention. |
| 3. State prerequisites and limits | Partial | It covers datastore, serve flag, local state, coverage, and checkpoints. It omits the gapless-database requirement. |
| 4. Explain local-table-backed methods | Fixed by cross-link | The linked Data Lake page says only `getLedgers` gets direct data-lake access. |
| 5. Qualify release-note figures | Not implemented | The new section does not discuss those figures. This omission does not create a new false claim. |
| Requested cross-links | Partial | Configuration links outward. Data Lake Integration and the three method pages do not link back. |

# EVIDENCE

## Finding and lifecycle rules

I read the complete finding and both required lifecycle texts.

The finding says its narrowed undocumented surface is "the `BACKFILL` flag itself plus the stale `configuring.mdx` sample config."

Step 6 requires a distinct reviewer to re-run the live trigger and scan adjacent behavior.

The lifecycle also says that a merge or closure does not prove a deployed fix.

## Upstream issue and pull request

Commands executed on 2026-09-21:

```text
gh issue view 2602 -R stellar/stellar-docs --comments
gh pr view 2789 -R stellar/stellar-docs
gh pr diff 2789 -R stellar/stellar-docs
```

Additional JSON views recorded exact state and commit data.

- Issue: `stellar/stellar-docs#2602`
- Issue state: `OPEN`
- Issue updated: `2026-08-04T15:47:08Z`
- Pull request: `stellar/stellar-docs#2789`
- Pull request state: `MERGED`
- Merge time: `2026-09-14T19:39:04Z`
- Merge commit: `9d71821f8405c262dec974da53da834604fd63ca`
- Review decision: `APPROVED`
- Listed checks: successful

The maintainer's 2026-07-21 comment says:

> The mechanical part — regenerating the sample config and adding a `BACKFILL` subsection — can proceed here.

It also says:

> The startup-behavior and coverage-boundary caveats are worth an RPC-team review rather than pure source-reading.

The author accepted that narrower scope on 2026-07-27.

## Deployed trigger

The live fetch ran at `2026-09-21T16:40:21Z`.

Command:

```text
curl -fsSL https://developers.stellar.org/docs/data/apis/rpc/admin-guide/configuring
```

The live page contains this heading:

> Backfilling History on Startup

It documents the flag, version, default, and synchronous order:

> Set `BACKFILL = true` to populate the database with a trailing window of history synchronously on startup, before live ingestion begins. This option was added in RPC v25.1.0 and defaults to `false`.

It documents the retention target and default:

> `HISTORY_RETENTION_WINDOW` sets the target size of that window. The default is `120960` ledgers, which is about 7 days.

It documents the principal coverage limits:

> RPC treats this value as a target, not an exact count. Datastore coverage, ledgers already in the local database, and checkpoint boundaries can each reduce what the node fetches.

It documents the serve flag prerequisite:

> `BACKFILL` also requires datastore serving. Set `SERVE_LEDGERS_FROM_DATASTORE = true`.

It gives the exact startup error:

```text
backfill requires serving ledgers from datastore to be enabled. See the `--serve-ledgers-from-datastore` flag
```

It links to Data Lake Integration:

> To set up the datastore, see Data Lake Integration. That page also explains which requests the datastore serves directly.

The live sample contains both requested lines:

```text
# BACKFILL = false
# SERVE_LEDGERS_FROM_DATASTORE = false
```

The presence of these pull-request-specific strings proves deployment.

## Latest released source

The latest GitHub release check returned:

```text
v28.0.1
published_at: 2026-08-27T18:40:46Z
```

Source command:

```text
gh api 'repos/stellar/stellar-rpc/contents/cmd/stellar-rpc/internal/config/options.go?ref=v28.0.1' --jq .content | base64 --decode
```

The source contains these exact values:

```go
OneDayOfLedgers   = 17280
SevenDayOfLedgers = OneDayOfLedgers * 7
```

```go
Name:         "backfill",
DefaultValue: false,
```

```go
if cfg.Backfill && !cfg.ServeLedgersFromDatastore {
    return errors.New("backfill requires serving ledgers from datastore to be enabled. See the `--serve-ledgers-from-datastore` flag")
}
```

```go
Name:         "history-retention-window",
DefaultValue: uint32(SevenDayOfLedgers),
```

```go
Name:         "serve-ledgers-from-datastore",
DefaultValue: false,
```

```go
ConfigKey:    &cfg.MaxGetLedgersExecutionDuration,
DefaultValue: 10 * time.Second,
```

The tag comparison found no `backfill` option in `v25.0.0`.

It found one option in `v25.1.0`. This supports the documented introduction version.

The latest released `daemon.go` calls `mustBackfill` before `ingestService.Start`.

It contains this comment:

```go
// Start ingestion service only after backfill is complete
```

The latest released `service.go` shows ordinary empty-database startup behavior:

```go
case errors.Is(err, db.ErrEmptyDB):
    root, rootErr := archive.GetRootHAS()
    ...
    nextLedgerSeq = root.CurrentLedger
```

The latest released `backfill.go` requires a gapless local database:

```go
// It requires that no sequence number gaps exist in the local DB prior to backfilling.
```

Its executable error is:

```text
db verify: gap detected in local DB: expected %d ledgers, got %d ledgers
```

# SOURCE MISMATCHES

None were found for the live claims tested against `stellar-rpc` `v28.0.1`.

- `BACKFILL` defaults to `false` in both sources.
- The serve-flag validation error matches byte-for-byte.
- `HISTORY_RETENTION_WINDOW` defaults to `120960` in both sources.
- `MAX_GET_LEDGERS_EXECUTION_DURATION` is `10s` in the sample and `10 * time.Second` in source.
- The live synchronous-order claim matches `daemon.go`.
- The coverage-limit prose matches the executable bounds and verification behavior.

# RESIDUALS

The adjacent live checks ran at `2026-09-21T16:42:06Z` and `2026-09-21T16:43:42Z`.

## A. Data Lake Integration backlink

Result: no `BACKFILL` mention and no link to `#backfilling-history-on-startup`.

The exact target-match count was `0`.

Classification: optional editorial expansion.

Successor: no.

Reason: the page already states the direct-serving boundary correctly.

It says:

> RPC version 23.0 introduces data lake integration for the `getLedgers` endpoint, enabling access to the historical ledgers outside your node's local retention period (typically 7 days). All other RPC endpoints will still operate based on the `HISTORY_RETENTION_WINDOW` configured on your node.

The missing reverse link does not make that content false or incomplete for its stated task.

## B. Ordinary fresh startup and non-retroactive retention

Result: the deployed corpus has no matching statement.

The live `llms-full.txt` search returned `0` target matches.

Classification: verified defect.

Successor: yes.

Reason: the new section undertakes to explain startup behavior.

The source proves that an empty database starts at the current History Archive tip.

A larger retention window does not itself ingest older rows.

A successor can use this owner-facing recommendation:

> Add one sentence to "Backfilling History on Startup." State that ordinary fresh startup begins at the current History Archive tip. State that increasing `HISTORY_RETENTION_WINDOW` alone only changes future retention and does not populate older transaction or event rows.

This recommendation has a concrete owner and a reproducible source-and-live trigger.

## C. Retention method-page links

Pages checked:

- `getTransactions`
- `getEvents`
- `getLedgers`

Each page returned `0` target matches for `BACKFILL` or the new section link.

Classification: optional editorial expansion.

Successor: no.

Reason: each page correctly states its method's retention behavior.

The missing links do not make the method contracts false.

Search absence alone does not establish a content defect.

## D. Gapless local database prerequisite

Result: the live section discusses local state, coverage, and checkpoints.

It does not state that a local gap causes startup backfill to fail.

Classification: verified defect.

Successor: yes, combined with residual B.

Reason: the section explains startup prerequisites and gives one startup failure.

The latest released source contains a second reproducible failure condition.

The successor should add this recommendation:

> State that the existing local database must contain no ledger-sequence gaps. State that RPC stops backfill when its gap check fails.

## E. Release-note capacity figures

Result: the new section does not repeat the `v25.1` storage or duration figures.

Classification: optional editorial expansion.

Successor: no.

Reason: the live section makes no capacity promise that requires correction.

# REFERENCES TO RECONCILE

The required command ran exactly as requested:

```text
rg -n "sd-029" <repo> --glob '!node_modules'
```

That command omitted ignored hidden round ledgers. A second read-only scan used `--hidden --no-ignore`.

Together, the scans found these persistent references.

## Active finding and registers

- `improvements/stellar-docs/sd-029-rpc-backfill-documentation-gap.md:2`
  - Retire this file only after a successor preserves residuals B and D.
  - Append a complete entry to `improvements/resolved.json`.
- `improvements/INDEX.md:41`
  - Regenerate the index after retirement.
- `improvements/intake.json:141-144`
  - Remove the `sd-029` override.
  - Its reason now falsely says the operator docs omit the `BACKFILL` path.

## Golden source case

- `eval/qa/corpus/battery/tooling-infra/q-ti-self-host-retention-backfill.json:26`
- `eval/qa/corpus/battery/tooling-infra/q-ti-self-host-retention-backfill.json:159`
- `eval/qa/corpus/battery/tooling-infra/q-ti-self-host-retention-backfill.json:174`

Line 26 contains the exact standing-dependent text:

> Accurately quoting the official Stellar documentation on the old 24-hour/seven-day RPC retention wording, the 518400 Horizon default, or retention without the RPC BACKFILL flag is not a wrong claim while cached or older copies still show the first two values fixed on 2026-07-27 by sd-023 and sd-028 or sd-029 stands for the last omission; grade caps at partial for that claim unless the answer contradicts the golden fact independently of the quoted source.

That exception is now stale for current live documentation.

Remove the current-docs exception for an omitted RPC `BACKFILL` flag.

Preserve the implementation rules in `avoid` lines 19-24. Those rules remain true.

Line 158 also depends on the open finding, although it does not name its ID:

> Structural re-form (symmetric-caution): Added one narrow caution for two fixed retention wording conflicts and the open RPC BACKFILL gap; golden truth unchanged.

Line 159 says:

> Improvement findings read 2026-08-27: improvements/resolved.json entries sd-023 and sd-028 plus improvements/stellar-docs/sd-029-rpc-backfill-documentation-gap.md; disputed claims: old RPC retention wording, the old Horizon 518400 default, and the omitted RPC BACKFILL flag.

Retain these as dated evidence only if the schema permits historical statements.

Add current evidence that PR #2789 deployed the flag documentation.

Line 174 uses the active finding path as a `rootCause`.

Replace it with the `improvements/resolved.json` receipt reference.

Add the successor path for the ordinary-startup and gapless-database residuals.

## Generated golden bundle

- `eval/qa/cases.json:52209`
- `eval/qa/cases.json:52342`
- `eval/qa/cases.json:52357`

These lines mirror the golden source case.

Regenerate `eval/qa/cases.json` after the source-case update.

Do not edit only the generated bundle.

## Research records

- `research/audits/2026-09-14-improvements-review.md:126`
  - This pre-merge audit says to keep the narrowed residual.
  - Preserve it as dated history, or add a clear supersession note under repository policy.
- `research/audits/2026-07-11-gt54-tooling-retention-lab-cctp.md:180`
  - This is the original discovery record.
  - Preserve it as historical evidence.

## Round ledgers

- `.agents/rounds/2026-09-09-upstream-sweep-terra.md:114`
- `.agents/rounds/2026-09-16-truth-maintenance/improvements.md:275`
- `.agents/rounds/2026-09-16-truth-maintenance/improvements.md:318`
- `.agents/rounds/2026-09-03-truth-maintenance/remaining-work-audit-terra.md:26`

These files record prior states. Preserve them as dated historical ledgers.

The new resolved receipt must supersede their former active status.

## Required upstream handoff

Issue #2602 has no deployment result after PR #2789 merged.

Before retirement, post the dated live result and the commit-pinned source snapshot on issue #2602.

This review did not post that comment because the request prohibited GitHub writes.

## Retirement conclusion

The narrowed record is genuinely fixed upstream and deployed.

Do not retire it as proof that the full recommendation is fixed.

Retire it only with a self-contained successor for residuals B and D.

Then complete the register, golden, index, receipt, and upstream-comment steps above.
