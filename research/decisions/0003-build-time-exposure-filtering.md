# ADR-0003: Build-time exposure filtering — the manifest IS the exposed surface

- Status: accepted (2026-07-04); supersedes the deny-list/see-but-not-call half of
  [ADR-0002](./0002-skills-retirement-twin-dedup.md); amended by
  [ADR-0009](./0009-recovery-only-discovery-receipts.md) for recovery-only operations
- Decision rule (user): consumers get useful, forward-only tooling and services — never
  information about what the gateway *cannot* do. Cleanup and filtering belong upstream of
  clients, agents, and MCP: at build time. The knowledge of *why* something is excluded lives
  in build-script data + ADRs (prose for future build agents), not in runtime entries.
- Driver: Solo todo 836.

## Context

ADR-0002 (2026-07-03) retired the 7 Lumenloop API-onboarding skills and de-duplicated the 14
`lumenloop.skill.*` metadata twins as **deny-list-as-data**: the entries stayed in the manifest
with `policy.allow: false` + a denyReason, `search` filtered them before scoring, the executor
refused calls, and `codemode.catalog()` showed them "see-but-not-call" on the theory that policy
transparency lets sandbox code filter denied ops.

On 2026-07-04 a live agent, asked "what tools does this MCP expose?", enumerated
`codemode.catalog()` and reported the retired `lumenloop-api.*` skills (billing, keys, connect,
query, research) as live surface, alongside the denied write ops. The `policy.allow: false`
marker was in the data it read — **the distinction did not survive summarization**. See-but-not-call
fails at its most common consumer: an agent answering "what can you do?". Visible-but-unusable
entries are a confusion generator, not transparency.

The twin machinery had also metastasized: a deny-policy block and twin emission in
`build-catalog.mjs`, a back-compat read alias in `src/skills/store.ts`, a denied-entry filter in
`src/catalog/search.ts`, a deny/metered guard in `src/policy/guard.ts`, call-time refusal +
policy-visible catalog view in `src/executor/providers.ts`, x-policy copying + 19 denied paths in
`build-super-spec.mjs`, and twin-aware grading (rule v2, todo 816) across `eval/lib/grade.mjs`,
`eval/run-routing.mjs`, and `eval/self-test.mjs` — all managing entries with no reason to exist
in the model-facing world.

## Decision

**An entry is either exposed (emitted, callable/readable) or it does not exist to consumers.**

1. **`scripts/build-catalog.mjs` filters at build time.** The old policy functions became
   exclusion filters; excluded surfaces are never emitted:
   - `lumenloop.request_research` (metered paid call — PLAN §8 off-by-default; excluded by
     name AND by the metered flag so an upstream re-pricing cannot silently expose it) and any
     account-mutation op (`LUMENLOOP_ACCOUNT_OP_RE`);
   - the 3 scout write/side-effecting ops (`POST /api/feedback`, `/api/partners/submit-listing`,
     `/api/partners/assistant`);
   - the 7 retired onboarding skills (no skill entry, no sections; bodies stay in the mirror as
     the description-harvest source);
   - all 14 Lumenloop-API-served skill metadata entries (each duplicates a canonical `skills.*`
     mirror entry — the `lumenloop.skill.*` twin namespace is dead).
   Every exclusion list carries a fail-loud drift guard (`assertRetirementNamesResolve`,
   `assertLumenloopExclusionsResolve`, `assertScoutExclusionsResolve`,
   `assertLumenloopSkillsMirrored`) so an upstream rename/removal/addition breaks the build
   instead of silently changing the surface. The build log names everything it filtered.

2. **The `policy`, `cost`, and `auth` entry fields are gone.** With no denied entries possible,
   `policy` was a constant; `cost` (always "free" post-filtering) and `auth` had no consumer
   outside the dying deny machinery. The manifest schema is now: id, service, kind, description,
   keywords?, inputSchema, outputSchema, transport, provenance.

3. **The generic runtime deny layer is deleted.** `guard()` validates args, nothing else.
   `search`, `catalog()`, `spec()`, `describe`, and `skill.read` need no exposure filter — the
   manifest is pre-filtered by construction. ADR-0009 adds a narrowly scoped host capability for
   manifest-declared recovery-only operations. The `store.ts` `lumenloop.skill.*` read alias
   (back-compat) is deleted: unknown ids fail exact-match with a nearest-id suggestion.

4. **The envelope error kind is two-way**: `"error" | "soft-empty"`. `"denied"` is gone from
   `AdapterErrorKind`, rendered signatures, and both MCP tool descriptions. A recovery-only call
   without a valid ADR-0009 receipt uses the ordinary `"error"` kind. (Forward-only contract
   change; clients relying on "denied" break.)

5. **The super spec contains exactly the manifest's operations** (56 paths: 53 service ops + 3
   synthetic skills ops; previously 75 with 19 denied). x-policy/x-cost/x-auth are gone;
   `x-execute` is on every path. The lumenloop account/billing/discovery API surface is no longer
   described "for honesty" — the spec describes only what code can call. A completeness assert
   guards the reverse direction (every manifest operation appears in the spec).

6. **Eval grading moved to rule v3 (`v3-manifest-exposed`).** The v2 twin-identity layer is
   deleted; a hit's service label is exactly its own, and cross-service tolerance is expressed
   only via `expected_any`. This was NOT a grading no-op: v2 credited `skills.lumenloop.*`
   playbook hits to lumenloop-expected cases. Legacy strict re-baselined 222/288/318 →
   203/265/303 (n=338): of 37 changed cases, 35 had byte-identical top hits (pure
   grading-severity change; the playbook tolerance is the accept-either lane's job — 74.0% top1)
   and the 2 real ranking changes were both improvements (keyword document-frequency denominators
   shifted when excluded ops left the per-service op sets). Skills lane unchanged 18/23.

## Consequences

| Measure | ADR-0002 (2026-07-03) | ADR-0003 (2026-07-04) |
|---|---|---|
| Manifest entries | 299 (25 denied) | **274 (0 denied — field gone)** |
| Skill entries | 39 (21 denied) | **18 (all readable)** |
| Operations | 57 (4 denied) | **53 (all callable)** |
| Super-spec paths | 75 (19 denied) | **56 (all callable)** |
| `codemode.catalog()` | all entries, policy visible | exposed entries only |
| Runtime policy checks | deny + metered + args | **args only** |

- **2026-07-04 follow-up (same mechanism, applied further; the table above is the decision-time
  record):** the post-ship audit found dead-end read-halves and description leaks, all removed —
  `scout.getFeedbackSchema` (schema feeder for the excluded feedback write),
  `lumenloop.research_result` + `lumenloop.list_my_research` (read half of the non-exposed paid
  research lane). Excluded-endpoint clauses are scrubbed from exposed scout descriptions
  (`SCOUT_DESCRIPTION_SCRUBS`), retired-skill cross-references are scrubbed from emitted skill
  text AND the Worker bundle (which no longer ships retired-skill bytes at all), the exclusion
  data is consolidated in `scripts/exposure.mjs` shared by every emitter, and
  `assertNoNonExposedRefs` fails the build on any emitted reference to a non-exposed surface.
  Counts moved 274→**271** entries, 53→**50** service ops (lumenloop 18, scout 20,
  stellarDocs 12), 56→**53** super-spec paths. A later skill mirror refresh moved the
  live catalog to **272** entries and the super-spec to **54** paths without changing the
  service-op count.
- Enabling `lumenloop.request_research` later is a deliberate feature: remove the exclusion at
  build time (all three research ops — the trigger and its read half `research_result` /
  `list_my_research` — travel together) AND build the budget-gate + dedup runtime (PLAN §8) in
  the same change.
- ADR-0002's "Reads are unaffected" line was already stale before this change (reads were
  policy-gated in the shipped code); under ADR-0003 the question is moot — there is nothing
  denied to read.
- Correction discipline for future exclusions: add the surface to the relevant exclusion data in
  `scripts/exposure.mjs` with a comment naming the reason, extend the drift guard if the list is
  keyed on upstream names, rebuild (`build-catalog` → `build-super-spec` → `build-op-classes`),
  and record the decision in an ADR/Solo todo. Never reintroduce a generic runtime allow/deny layer.

## Revisit triggers

- A genuine need for additional runtime-conditional exposure (e.g. per-auth-tier catalogs) — that
  needs a new, deliberate design and must not revive the generic deny-list.
- Lumenloop re-prices or splits `request_research` — the named exclusion + metered flag both
  guard it; enabling it is the PLAN §8 budget-gate feature.
- The upstream skill source adds machine-readable audience/transport metadata (sk-005) — the
  retirement list could become a mechanical filter.

## Amendment (2026-07-30): skill bodies are fetched, not bundled

The decision is unchanged — the manifest is still the exposed surface, and exclusion is still
build-time data in `scripts/exposure.mjs`. Two mechanism details in this ADR are now stale:

- The emitter list no longer includes `scripts/bundle-skills.mjs` / `src/skills/bundle.json`.
  Skill bodies are not vendored in this repo and not shipped in the Worker; each catalog entry
  carries `transport: { type: "file", url, sha }` (upstream file at the commit pinned in
  `ecosystem-skills/MANIFEST.json` + its git blob hash) and `src/skills/source.ts` fetches and
  verifies it at read time. Retired skills are still never emitted — they now have no catalog
  entry AND are never fetched.
- "The Worker bundle no longer ships retired-skill bytes at all" is now trivially true: it ships
  no skill bytes at all.

The exposure property that matters is unaffected: an excluded skill has no entry, so exact-match
resolution fails and there is nothing to serve. The retired-reference scrub moved from bundle
time to read time (`src/skills/scrub.ts`, shared with the builders) so live content cannot carry
a leak in.

## Amendment (2026-08-04): scope of "emitted text" — authored surface vs relayed evidence

The decision is unchanged. This amendment writes down a scope line the ADR left implicit, because
leaving it implicit cost a review round: a competent reviewer sweeping for leaks rated live
upstream response payloads a P0 violation, and the classification was wrong in a way the text
above does not actually rule out.

**What this ADR governs — the gateway speaking about its own surface.** The manifest, the super
spec, the micro-map, catalog descriptions and notes, demo/prompt copy, and the skill bodies we
serve at read time. A non-exposed reference here mints a false affordance about *our* capabilities,
which is the incident that produced this ADR. These surfaces are guarded by
`assertNoNonExposedRefsInText` (`scripts/emitted-text-guard.mjs`) and, for skill bodies, by the
our-namespace scrub in `src/skills/scrub.ts`.

**What it does not govern — upstream speaking about upstream, relayed as evidence.** A service
response body is data. `scout.getStatus` enumerating upstream's own `/api/` endpoints,
`scout.getChangelog` reporting that an endpoint was added or removed, a `searchResearch` chunk
quoting a URL, or an upstream-authored SKILL.md documenting its own REST API are all facts about
the world, not claims about this gateway's callable surface. Adapters pass bodies through
unchanged (`src/adapters/scout.ts`) and that is load-bearing: the eval, golden-truth, and drift
apparatus all treat `.data` as upstream's answer, and attribution discipline is meaningless over a
doctored payload. Note also that a rule requiring redaction here would make `getChangelog`, whose
entire purpose is reporting endpoint changes, unable to function.

**Excluded is not secret.** Exclusion removes an *affordance*, not knowledge. The excluded Scout
endpoints are public upstream HTTP; a model that reads one in a payload and tells a user "scout
accepts feedback at that path" has said something true and actionable outside the sandbox. The
worst in-sandbox case is a call to a non-existent binding, which fails exact-match with a
nearest-id suggestion — the recovery this ADR deliberately designed.

**Therefore: never add a runtime payload scrubber.** That is the runtime allow/deny layer this ADR
deleted, resurrected on the data plane with a worse failure mode — silent false-positive rewrites
corrupting evidence instead of loud, inspectable denials. The correction discipline's closing rule
("never reintroduce a generic runtime allow/deny layer") covers it.

## Amendment (2026-08-30): recovery-only operations

ADR-0009 adds a manifest-declared recovery-only operation. The manifest still owns exposure.
The host validates a short-lived, one-use receipt before that operation dispatches. This is not a
generic runtime policy layer. Ranked search excludes the operation, while exact catalog, spec,
describe, and graph recovery keep it visible.

**The line still binds our own words about relayed data.** Fixed in this round:
`scout.getStatus`'s description recommended the payload "to discover endpoints", which is *our*
emitted text steering models at upstream's raw namespace — the exact vocabulary
`scoutRefRewrites` exists to displace. The recommendation is scrubbed and a boundary note now says
the enumeration is upstream's HTTP surface, not this gateway's callable one. The payload itself is
untouched.
