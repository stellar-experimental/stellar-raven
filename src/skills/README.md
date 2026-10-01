# Skill reads and runners

The generated [catalog](../../catalog/manifest.json) defines exposed skill IDs and section addresses.
The [pin manifest](../../ecosystem-skills/MANIFEST.json) defines upstream commits and files.
Raven forwards skill content; it does not keep a durable owned mirror or bundle bodies into the Worker.
Transport caches support forwarding and do not become the source of record.
[ecosystem-skills/README.md](../../ecosystem-skills/README.md) owns pin-update and review procedures.

## Pins and integrity

Every readable file uses this transport shape:

```text
{ type: "file", url, sha, sha256 }
```

[The catalog schema](../catalog/types.ts) requires HTTPS and the `raw.githubusercontent.com` host.
The URL contains a full upstream commit hash.
`sha` identifies the git blob; `sha256` protects the raw bytes.
Both hashes must match before bytes can reach the caller.
The builder and runtime use the same pinned files and scrub rules.

[source.ts](source.ts) resolves each pin through these layers:

1. An in-isolate memo, keyed by `(url, sha256, sha)`.
2. The colo Cache API, with fresh verification of returned bytes.
3. An upstream fetch, with verification before serving or caching bytes.

A memo hit reuses the promise for already verified, scrubbed content.
Both digests belong in its identity, so a different pin cannot bypass either check.
Cache reads and writes are best-effort.
A failed cache read falls through to upstream retrieval.
A failed cache write does not discard a verified upstream body.
Upstream requests have an 8s attempt timeout and one retry.

`SKILL_READ_DEADLINE_MS` gives each file load a 20s deadline through [store.ts](store.ts).
The main file loads before selected companion files load concurrently.
This deadline does not impose a 20s total limit on a multi-file read.
The deadline race does not cancel an in-flight fetch.
The executor retains its separate 60s sandbox timeout.

[scrub.ts](scrub.ts) removes references to excluded skills and Scout operations.
A changed upstream reference form that escapes the expected scrub rules fails the read.
Transport, integrity, pin, deadline, and scrub failures return skill error envelopes.
`skill_read` telemetry records `memo`, `cache`, or `upstream` retrieval without recording the body.

## Catalog sections

The builder emits one whole-skill entry and section addresses for its headings and companion Markdown files.
A heading address uses `<skillId>#<slug>`.
Duplicate heading slugs receive numbered suffixes.
A companion file uses `<skillId>#file:<relative-path>`.
Section entries use `searchable: false` and remain accessible through exact-ID navigation.
Their addresses and descriptions do not embed the upstream body.
[ADR-0005](../../research/decisions/0005-skills-form-sections-out-of-search.md) records this representation.

## `codemode.skill.read`

The provider prelude maps this helper to the flat `skill_read` dispatch function.
The first argument must resolve to an exact catalog skill or section ID.
A nearest-ID suggestion never changes that resolution rule.
The only supported option is `{ sections?: string[] }`.
Unknown option keys fail validation.

```js
async () => {
  const r = await codemode.skill.read("skills.lumenloop.stellar-ecosystem-digest");
  if (!r.ok) return r;
  return { id: r.id, availableSections: r.availableSections };
}
```

A whole read returns content at the top level, not under `data`.
A section read returns selected section content and each section's pinned URL.
Accepted section selectors include slugs, exact heading text, and `file:` keys.
Unknown sections fail the whole request and list the available sections.
A heading in the body but absent from the catalog fails closed.
The runtime and builder use the same section-slug rules.
`availableSections` lists cataloged addresses on successful reads and whole-skill search hits.

Whole reads preserve upstream license material.
They retain the full body for in-sandbox inspection.
A large read can carry an advisory `notice` asking the script to return sections or aggregates.
The model-output cap applies to the script's final return, not to data available inside the sandbox.

## `codemode.skill.run`

[runners/index.ts](runners/index.ts) registers the first-party runners by exact catalog ID.
A runnable skill keeps `kind: "skill"` and adds `runnable: true` plus input/output schemas.
The same ID supports reading its playbook and running its registered data-gathering procedure.
Search signatures, `codemode.describe`, and the spec publish that callable contract.

The digest runner accepts `subject`, `subjectType`, `days`, and `perTypeLimit`.
`subject` is required; `subjectType` defaults to `theme` and also accepts `entity`.
`days` defaults to 30 within 1–90; `perTypeLimit` defaults to 5 within 1–10.
Extra input properties fail validation.

```js
async () => {
  const r = await codemode.skill.run(
    "skills.lumenloop.stellar-ecosystem-digest",
    { subject: "RWA tokenization", days: 30 }
  );
  return r.ok ? { window: r.data.window, items: r.data.items, calls: r.data.calls } : r;
}
```

[run.ts](run.ts) validates the ID, runnable marker, arguments, and registry entry before dispatch.
`assertRunnersWired` checks registry/manifest identities, schema equality, and declared operation exposure.
The provider constructs one operation facade for both model scripts and runners.
Every constituent call uses the same argument guard, adapter, normalization, and redaction path.
The runner receives only its declared operations and input; it receives no environment parameter.

The host records `{ op, ok, errorKind?, ms }` for each constituent call.
It attaches `calls` to successful output and ledger details to errors.
A runner-supplied `calls` field cannot replace the host ledger.
`skill_run` events derive outcomes from that ledger.
Output-schema validation records a mismatch without failing the completed run.

The digest distinguishes data, soft-empty responses, and errors.
A primary soft-empty response returns an empty digest with its soft-empty flag.
A primary error fails the run.
An optional upcoming-events error leaves that section `null` and remains visible in the call ledger.
The helper returns the standard `{ ok, data | error }` envelope and receives the envelope access guard.

`RUNNER_DEADLINE_MS` limits host runner waiting to 30s.
The timeout returns an error envelope without canceling constituent operations.
Runners execute reviewed first-party code on the host, outside the Dynamic Worker sandbox.
Import checks and fetch-stub tests support review; they do not provide sandbox confinement.
The networkless model isolate and manifest-only operation facade remain separate boundaries.

## Availability checks

`check-mirrors.mjs --fetch` bypasses build-cache reads to check upstream pins.
[canary.ts](canary.ts) bypasses runtime memo and colo caches to check Worker retrieval.
The hourly canary writes a verdict to KV; `/health/skills` returns a fixed public projection.
The endpoint supplies no file URLs or hashes and does not initiate upstream calls.
A fresh failure indicates failed sampled retrieval.
A stale or missing verdict does not prove a retrieval outage.
The canary samples one execution location; actual `skill_read` errors cover user-selected locations.
Multiple failed checks require diagnosis before assigning the failure to upstream or Worker egress.
