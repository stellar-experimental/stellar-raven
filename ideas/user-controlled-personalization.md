# User-controlled personalization

Status: deferred. Reopen only on an owner decision to build personalization.

[`ARCHITECTURE.md`](../ARCHITECTURE.md) owns request attribution;
[`usage/README.md`](../usage/README.md) owns aggregate usage reports and retention. Operational logs
and a personalization store must use separate schemas, retention, access, and user controls, and a
personalization identity must survive authentication-secret rotation.

## Deferred design

Build per-user tuning as a visible, dedicated store — not a query over observability logs. Candidate
record shape (small, structured, provenance-bearing):

```json
{
  "kind": "preference",
  "value": "Prefer TypeScript examples",
  "source": "explicit_user_statement",
  "createdAt": "...",
  "lastConfirmedAt": "...",
  "confidence": 1,
  "status": "active"
}
```

Candidate categories: explicit response preferences, stable self-described context,
project/workspace context, explicit feedback, lower-confidence/shorter-retention inferred
tendencies; exclude sensitive data by default.

Required product controls before shipping:

- Clear disclosure or opt-in, plus inspect ("what do you remember about me?"), add, correct, delete,
  and disable controls.
- Workspace/project separation per user.
- Retention/deletion policy, provenance, and last-confirmed timestamps.
- Durable internal identity surviving auth-secret rotation safely.

Load only a compact relevant profile into request context (never replay raw prompts/transcripts by
default). Measure answer impact and keep a non-personalized path for comparison and user choice.
