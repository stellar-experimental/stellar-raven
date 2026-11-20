# Ideas

Research notes and possible future work. These notes are not committed product plans.

| Idea | State | Reopen trigger or review date | Work queue item |
|---|---|---|---|
| [Observability R2 retention](./observability-r2-retention.md) | Held | A forensic question needs request, log, or trace evidence older than seven days, or another trigger in the note | "Keep 30 days of observability data, including queries and responses" |
| [Retrieval demand report](./retrieval-demand-report.md) | Held | An operator needs question text, or the same ranking after the Workers Logs window, with purpose, access, retention, and disclosure written first | None |
| [User-controlled personalization](./user-controlled-personalization.md) | Deferred | An owner decision to build personalization | None |
| [Live ecosystem-partner documentation](./partner-doc-live-sources.md) | Held (reviewed 2026-11-19) | The note's triggers | None |
| [ChatGPT subscription login for `/playground`](./playground-chatgpt-subscription-login.md) | Research note | One of the note's four reopen triggers | None |
| [Shareable durable `/playground` sessions](./shareable-durable-playground-sessions.md) | Deferred | An owner decision, then the note's four deferred choices | None |
| [Skill discovery measurements](./skill-discovery-without-bundling.md) | Measuring; the read dated 2026-09-30 is overdue | 100 organic `skill_read` events, or the date | "Read the `skill_read` shape distribution" |
| [Source delivery: ranked references](./source-delivery-ranked-references.md) | Deferred by the owner on 2026-08-28 | The measured reopen rule in section 8 | "Keep `sources.locate` deferred" |

An idea file has a status line and a trigger. A dated review is an entry in [the work
queue](../.agents/TODO.md) that points at the file. When an idea ships or is rejected, delete the
file and record the decision in an ADR or the queue.

The [2026-08-07 codegen partner report](../research/audits/2026-08-07-codegen-partner-report.md)
is a dated record, not an idea. [`research/`](../research/) holds the other dated research.
