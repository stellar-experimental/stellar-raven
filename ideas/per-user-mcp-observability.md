# User-controlled personalization

Personalization remains deferred.
[The architecture](../ARCHITECTURE.md) describes request attribution.
[The usage guide](../usage/README.md) describes private aggregate reports and their retention.

Operational logs and a personalization store require separate schemas, retention, access, and user controls.
A personalization identity must remain stable across authentication-secret rotation.

## Deferred personalization design

Future per-user tuning should be a visible product capability backed by a dedicated store, not a
query over observability logs. A candidate memory record is small, structured, and provenance-bearing:

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

Potential categories:

- explicit response preferences;
- stable self-described context;
- project/workspace context;
- explicit positive/negative feedback;
- inferred tendencies only with lower confidence and shorter retention;
- sensitive data excluded by default.

Required product controls before this ships:

- clear disclosure or opt-in;
- inspect: “what do you remember about me?”;
- add, correct, delete, and disable controls;
- workspace/project separation for one person;
- retention and deletion policy;
- provenance and last-confirmed timestamps;
- a durable internal identity that survives auth-secret rotation safely.

When personalization is built, load only a compact relevant profile into the request context. Do
not replay raw historical prompts or full transcripts by default. Measure whether personalization
improves answers, and retain a non-personalized path for comparison and user choice.
