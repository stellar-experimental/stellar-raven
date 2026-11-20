# Skill reads and runners

The [catalog](../../catalog/manifest.json) defines exposed skill IDs and section addresses; the [pin manifest](../../ecosystem-skills/MANIFEST.json) defines upstream commits and files. Raven forwards verified skill content rather than bundling bodies into the Worker ([pin/review guide](../../ecosystem-skills/README.md)).

## Pins and integrity

Readable files use `{ type: "file", url, sha, sha256 }`. [types.ts](../catalog/types.ts) requires HTTPS on `raw.githubusercontent.com` at a full commit hash; both git blob `sha` and raw `sha256` must match before bytes reach a caller.

[source.ts](source.ts) resolves each pin through: (1) an isolate memo keyed by `(url, sha256, sha)` holding verified scrubbed content, (2) best-effort colo Cache API with re-verification, and (3) upstream fetch (8s attempt timeout, one retry) verified before serving or caching. [store.ts](store.ts) applies a 20s per-file deadline (`SKILL_READ_DEADLINE_MS`; main file loads before concurrent companion reads; does not cancel in-flight fetches; executor retains its 60s sandbox timeout).

[scrub.ts](scrub.ts) strips excluded skills and Scout operations and fails closed if an upstream reference escapes scrub rules. Failures return skill error envelopes; `skill_read` telemetry records `memo`, `cache`, or `upstream` without logging bodies.

## Catalog sections

The builder emits one whole-skill entry plus `searchable: false` section entries (`<skillId>#<slug>`, numbered on collision) and companion files (`<skillId>#file:<relative-path>`) without embedding upstream bodies ([ADR-0005](../../research/decisions/0005-skills-form-sections-out-of-search.md)).

## `codemode.skill.read`

Maps to flat `skill_read`. The first argument must match an exact skill or section ID (nearest-ID hints never relax exact match); the only supported option is `{ sections?: string[] }`.

```js
async () => {
  const r = await codemode.skill.read("skills.lumenloop.stellar-ecosystem-digest");
  if (!r.ok) return r;
  return { id: r.data.id, availableSections: r.data.availableSections };
}
```

- **Success:** `{ ok: true, data: { id, url, content | sections, availableSections, notice? } }`. Whole reads return `data.content` (preserving license material; large reads add an advisory `notice`; model-output caps apply only to the script's final return). Section reads return `data.sections` (`{ section, content, url }[]` in request order, no `data.content`) accepting slugs, exact heading text, or `file:` keys. Unknown sections fail the whole request and list `availableSections`; a heading present in the body but absent from the catalog fails closed with an indexing-drift error.
- **Failure:** `{ ok: false, error: { kind, message, hint? } }`.

## `codemode.skill.run`

[runners/index.ts](runners/index.ts) registers first-party runners by exact catalog ID (`kind: "skill"`, `runnable: true`, plus input/output schemas published in search, `codemode.describe`, and the spec). The same ID supports both `read` and `run`.

Digest runner inputs (extra properties fail validation): `subject` (required), `subjectType` (`theme` default, or `entity`), `days` (1–90, default 30), `perTypeLimit` (1–10, default 5).

```js
async () => {
  const r = await codemode.skill.run(
    "skills.lumenloop.stellar-ecosystem-digest",
    { subject: "RWA tokenization", days: 30 }
  );
  return r.ok ? { window: r.data.window, items: r.data.items, calls: r.data.calls } : r;
}
```

- [run.ts](run.ts) validates ID, runnable marker, arguments, and registry entry (`assertRunnersWired` checks registry/manifest identity, schema equality, and declared operation exposure).
- Runners receive only their declared operations (through the same operation facade, argument guard, normalization, and redaction path as model scripts) and input—no `Env`.
- The host records `{ op, ok, errorKind?, ms }` per constituent call into `calls` (and error details); runners cannot override it. `skill_run` events derive from this ledger; output-schema mismatches log without failing the run.
- Digest distinguishes data, primary soft-empty (returns empty digest with soft-empty flag), primary error (fails run), and optional upcoming-events error (`null` section, visible in `calls`), returning the standard `{ ok, data | error }` envelope with the envelope access guard.
- `RUNNER_DEADLINE_MS` (30s) returns an error envelope without canceling in-flight constituent calls. Runners execute reviewed first-party code on the host outside the Dynamic Worker sandbox; import checks and fetch-stub tests support review but do not substitute for isolate confinement.

## Availability checks

`check-mirrors.mjs --fetch` bypasses the build cache to verify upstream pins. [canary.ts](canary.ts) bypasses runtime memo and colo caches hourly, writing a verdict to KV served as a fixed public projection at `/health/skills` (no URLs, hashes, or on-demand upstream calls). A stale/missing verdict does not prove an outage, and the canary samples one colo; diagnose repeated failures before attributing them to upstream vs Worker egress.
