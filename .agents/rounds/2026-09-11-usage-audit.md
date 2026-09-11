# Usage evidence and storage audit

## Scope and authority

The user requested an independent Fable 5.1 high review through Herdr.
The review covers all recoverable usage evidence since launch and the ongoing analytics storage code.
The user authorized fixes, a GitHub pull request, commit/push, and deployment after review.
Merge is part of deploying the reviewed main branch.

## Ownership

- Parent pane: `w3G:p2`.
- Owned reviewer pane: `w3G:pM`, split down from the parent without focus.
- Reviewer: `raven-usage-fable`, Claude session `761845a0-a866-4663-9653-c475096f4e14`.
- Runtime: `claude --model claude-fable-5-1 --effort high --permission-mode bypassPermissions`.
- Reviewer confirmed `claude-fable-5-1` before starting the audit.
- Review base: Raven `8279fc6d3c636d88a00ed54332561d33255178f1` and report site `3523623f2ff966134dd32e90f96ff8bf633db4a6`.
- Implementation branch: `codex/usage-audit` in the clean existing checkout.

## Release scope

The report originally lived only in a separate Sites source repository.
`usage/report-site/` now owns the report source within Raven's GitHub review boundary.
The separate local Sites checkout remains a publication copy, not the source of truth.
The report's private access policy stays unchanged.

## Completion gates

- Independent data/storage audit completed.
- Every finding reconciled with evidence or a code change.
- Reviewer checked the final fixes and report claims.
- Required tests, typecheck, builds, and secret scan passed.
- GitHub PR checks passed before merge.
- Changed services deployed from reviewed source; live acceptance checked.

Status: independent source review passed. Release acceptance remains pending.

## Reproduced storage failure

The parent passed one valid invocation followed by a tool trace with no request identifier to `collectUsage`.
The baseline threw before the first D1 write, losing the valid invocation from that batch.
The fix accumulates missing-identifier counts, writes valid invocations, then reports the metadata failure.
The regression test places valid invocations on both sides of the malformed trace.
The focused usage suite passed all ten tests after the change.

Before the collector fix, the integrated report source passed its eleven tests and both report builds.
The Raven baseline passed typecheck, 2,051 tests, the producer build, and the collector build.
Final validation and independent acceptance remain pending.

## Finding reconciliation

Fable completed the source fix review with no remaining code blockers.
The P0 fix replaces the unsupported Workers fetch redirect mode and passes an actual workerd regression test.
Storage now isolates malformed traces, retries transactions, continues later chunks, and records collection diagnostics.
The report and CLI share SQL. GitHub CI checks hourly freshness; the aggregate token secret is configured.
The report source now enters the same GitHub PR and guarded publication flow.
The launch report preserves the original snapshot and adds a separate independent evidence panel.

Release order: apply migration 0002, verify no pending migrations, deploy collector and report API, then publish Sites.
Live browser acceptance, GitHub health dispatch, and new outcome receipts remain release gates.
Gateway metadata retention stays unchanged. Payload collection is disabled; existing metadata remains as evidence.
The 13-month D1 retention does not cover the gateway metadata store.
Diagnostic receipt redelivery can repeat failure counts. Tail delivery and network delivery remain best effort.
Protocol cancellations can increase receipt volume; their outcomes remain informational.
The first daily cleanup is scheduled for September 12 at 03:17 UTC and has not yet run.

The parent verified the gateway configuration through Cloudflare MCP: `collect_logs=false`,
`log_management=100000`, and `log_management_strategy=DELETE_OLDEST`. This is a row-count policy, not a day limit.

Fable explicitly accepted the staged tree for merge after rerunning 2,057 tests, 11 report tests, typecheck, and builds.
The acceptance file uses an approximate review time; the parent received it around 16:04 UTC.
The staged tree secret scan passed. Live release gates remain pending.
